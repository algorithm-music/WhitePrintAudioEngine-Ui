export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
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

export async function postMaster<T>(body: Record<string, unknown>): Promise<T> {
  const payload = normalizeInputFields(body);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 780_000);
  let res: Response;
  try {
    res = await fetch('/api/master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out after 13 minutes. The backend may be overloaded.', 408);
    }
    throw err;
  }
  clearTimeout(timeout);

  if (!res.ok) {
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

  return res.json() as Promise<T>;
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
  const presignRes = await fetch('/api/presign-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type || 'application/octet-stream',
    }),
  });

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
