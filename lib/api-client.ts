export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Callers historically pass `audio_url` as a string. After the GCS migration
 * that same field may hold a `gcs://<object-name>` synthetic URL (produced by
 * {@link uploadToGCS}) — in which case we rewrite the request body to use
 * `gcs_object` so the backend takes the in-bucket path.
 */
function normalizeInputFields(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const a = body.audio_url;
  if (typeof a === 'string' && a.startsWith('gcs://')) {
    const rest = { ...body };
    delete rest.audio_url;
    return { ...rest, gcs_object: a.slice('gcs://'.length) };
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
 * Get a V4 signed PUT URL from /api/presign-upload, then PUT the file
 * directly to GCS. Returns a synthetic `gcs://<object-name>` URL so callers
 * that previously plumbed a URL string (UploadScreen, HeroUrlInput, etc.)
 * can keep passing a single string unchanged; {@link postMaster} rewrites
 * `gcs://` into a `gcs_object` field before hitting the backend.
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

  const { upload_url, gcs_object, content_type } = (await presignRes.json()) as {
    upload_url: string;
    gcs_object: string;
    content_type: string;
  };

  // PUT straight to GCS. With V4 signed URLs, Content-Type on the PUT must
  // match what was signed; we just echo back what the presign route used.
  await putToGCS(upload_url, file, content_type, onProgress);

  return `gcs://${gcs_object}`;
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
