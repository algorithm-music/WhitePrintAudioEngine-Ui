export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 5,
  backoff = 1000
): Promise<Response> {
  try {
    const response = await fetch(input, init);
    // Retry on 502, 503, 504
    if (!response.ok && [502, 503, 504].includes(response.status) && retries > 0) {
      console.warn(`HTTP ${response.status}. Retrying in ${backoff}ms...`);
      await new Promise((res) => setTimeout(res, backoff));
      return fetchWithRetry(input, init, retries - 1, Math.min(backoff * 1.5, 5000));
    }
    return response;
  } catch (err) {
    if (retries > 0) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Fetch failed (${msg}). Retrying in ${backoff}ms...`);
      await new Promise((res) => setTimeout(res, backoff));
      return fetchWithRetry(input, init, retries - 1, Math.min(backoff * 1.5, 5000));
    }
    throw err;
  }
}

const GCS_HOST_RE = /^https:\/\/storage\.googleapis\.com\/([^/?#]+)\/([^?#]+)/;

/**
 * Browser code uploads to GCS via {@link uploadToGCS}, which returns a real
 * HTTPS signed GET URL so the UI can play the audio directly. When that same
 * URL flows back into `/api/master` as `audio_url`, we detect the GCS pattern
 * here and rewrite it to `gcs_object` so the backend skips HTTP download and
 * reads straight from its GCSFuse mount.
 *
 * The previous `gcs://<object>` synthetic scheme was rejected by browsers as
 * ERR_UNKNOWN_URL_SCHEME when used as an <audio src>, so we no longer use it.
 */
function normalizeInputFields(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const a = body.audio_url;
  if (typeof a === 'string') {
    if (a.startsWith('gcs://')) {
      const rest = { ...body };
      delete rest.audio_url;
      return { ...rest, gcs_object: a.slice('gcs://'.length) };
    }
    const m = GCS_HOST_RE.exec(a);
    if (m) {
      // m[1] = bucket, m[2] = object-path. Decode any %XX and drop the signed-URL query string.
      const object = decodeURIComponent(m[2]);
      const rest = { ...body };
      delete rest.audio_url;
      return { ...rest, gcs_object: object };
    }
  }
  return body;
}

export interface SubmitMasterResponse {
  job_id: string;
  status: string;
  route: string;
  output_object: string | null;
}

export interface JobStatus<TResult = Record<string, unknown>> {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  stage?: string;
  route?: string;
  download_url?: string | null;
  metrics?: Record<string, unknown>;
  analysis?: TResult;
  deliberation?: TResult;
  elapsed_ms?: number;
  error?: string;
  http_status?: number;
  intermediate?: {
    track_identity?: Record<string, unknown>;
    metrics?: Record<string, number | string | null>;
    guardrails?: Record<string, unknown>;
    problem_count?: number;
    adopted_params?: Record<string, unknown>;
    target_lufs?: number;
    target_true_peak?: number;
  } | null;
}

/**
 * Submit a mastering job. Returns immediately with a job_id; poll via
 * {@link pollJob} until status is `completed` or `failed`.
 */
export async function submitMasterJob(
  body: Record<string, unknown>,
): Promise<SubmitMasterResponse> {
  const payload = normalizeInputFields(body);
  let res: Response;
  try {
    res = await fetchWithRetry('/api/master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new ApiError(`Failed to reach backend: ${err.message}`, 502);
    }
    throw err;
  }

  if (!res.ok && res.status !== 202) {
    let message = `Backend error (${res.status})`;
    try {
      const err = await res.json();
      if (err.error) message = err.error;
      else if (err.detail) message = err.detail;
    } catch {
      /* response body was not JSON */
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<SubmitMasterResponse>;
}

/**
 * Poll a job's status once. Callers are expected to schedule the interval
 * (e.g. 3 s in the dashboard) so this stays a dumb single-shot helper.
 */
export async function pollJob(
  jobId: string,
  outputObject: string | null,
): Promise<JobStatus> {
  const qs = outputObject ? `?object=${encodeURIComponent(outputObject)}` : '';
  let res: Response;
  try {
    res = await fetchWithRetry(`/api/jobs/${encodeURIComponent(jobId)}${qs}`, {
      method: 'GET',
      cache: 'no-store',
    });
  } catch (err) {
    throw new ApiError(`Failed to reach backend: ${err instanceof Error ? err.message : String(err)}`, 502);
  }

  if (!res.ok) {
    let message = `Backend error (${res.status})`;
    try {
      const err = await res.json();
      if (err.error) message = err.error;
      else if (err.detail) message = err.detail;
    } catch {
      /* response body was not JSON */
    }
    const lower = message.toLowerCase();
    if (lower.includes('timeout') || lower.includes('timed out')) {
      // Keep stage info if the backend included it, otherwise fallback
      if (!lower.includes('stage')) {
        message = 'Processing timed out. Try a shorter track.';
      }
    }
    throw new ApiError(message, res.status);
  }

  const job = await res.json() as JobStatus;
  if (job.status === 'failed' && job.error) {
    const lower = job.error.toLowerCase();
    if (lower.includes('timeout') || lower.includes('timed out')) {
      if (!lower.includes('stage')) {
        job.error = 'Processing timed out. Try a shorter track.';
      }
    }
  }
  return job;
}

/**
 * Legacy sync-style helper kept for callers that still expect `{ download_url }`
 * back in one shot (the narrative flow in `app/mastering/...` uses this).
 * Internally submits + polls. For new UI, prefer calling submitMasterJob +
 * pollJob directly so you can render progress.
 */
export async function postMaster<T>(body: Record<string, unknown>): Promise<T> {
  const submit = await submitMasterJob(body);

  // Poll until terminal. Cap at ~30 min so a wedged job doesn't pin a tab.
  const deadline = Date.now() + 30 * 60 * 1000;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Date.now() > deadline) {
      throw new ApiError(
        'Mastering is taking longer than expected. Check Recent masters in the dashboard — it may still complete.',
        504,
      );
    }
    await new Promise((r) => setTimeout(r, 3000));
    const job = await pollJob(submit.job_id, submit.output_object);
    if (job.status === 'completed') {
      return {
        route: job.route,
        download_url: job.download_url,
        metrics: job.metrics,
        analysis: job.analysis,
        deliberation: job.deliberation,
        elapsed_ms: job.elapsed_ms,
      } as unknown as T;
    }
    if (job.status === 'failed') {
      throw new ApiError(job.error || 'Pipeline failed.', job.http_status || 500);
    }
  }
}

/**
 * Get a V4 signed PUT URL from /api/presign-upload, PUT the file directly to
 * GCS, and return a real HTTPS signed GET URL for the same object so the UI
 * can use it as an <audio src>. {@link postMaster} parses the GCS object
 * name out of this URL before hitting the backend, so callers that used to
 * plumb a URL string (UploadScreen, HeroUrlInput, …) keep the same contract.
 */
export async function uploadToGCS(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  let presignRes: Response;
  try {
    presignRes = await fetchWithRetry('/api/presign-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        content_type: file.type || 'application/octet-stream',
      }),
    });
  } catch (err) {
    throw new ApiError(`Failed to reach backend: ${err instanceof Error ? err.message : String(err)}`, 502);
  }

  if (!presignRes.ok) {
    let message = `Presign failed (${presignRes.status})`;
    try {
      const err = await presignRes.json();
      if (err.error) message = err.error;
    } catch {
      /* not json */
    }
    throw new ApiError(message, presignRes.status);
  }

  const { upload_url, download_url, content_type } = (await presignRes.json()) as {
    upload_url: string;
    download_url: string;
    gcs_object: string;
    content_type: string;
  };

  // PUT straight to GCS. With V4 signed URLs, Content-Type on the PUT must
  // match what was signed; we just echo back what the presign route used.
  await putToGCS(upload_url, file, content_type, onProgress);

  return download_url;
}

function putToGCS(
  url: string,
  file: File,
  contentType: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new ApiError(`GCS upload failed (${xhr.status}): ${xhr.responseText.slice(0, 200)}`, xhr.status));
    };
    xhr.onerror = () => reject(new ApiError('GCS upload network error.', 0));
    xhr.send(file);
  });
}

/**
 * Upload a browser-provided file to GCS, then POST the object name to
 * /api/master. The backend reads from the shared GCSFuse mount, never
 * through HTTP, so there are no response-size or timeout surprises.
 */
export async function postMasterUpload<T>(
  file: File,
  fields: Record<string, string>,
  onUploadProgress?: (pct: number) => void,
): Promise<T> {
  const audioUrl = await uploadToGCS(file, onUploadProgress);
  return postMaster<T>({ ...fields, audio_url: audioUrl });
}
