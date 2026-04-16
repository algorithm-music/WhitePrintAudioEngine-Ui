export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function postMaster<T>(body: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600_000);
  let res: Response;
  try {
    res = await fetch('/api/master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out after 10 minutes. The backend may be overloaded.', 408);
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
      // response body was not JSON
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

export async function postMasterBinary(body: Record<string, unknown>): Promise<{
  blob: Blob;
  headers: Record<string, string>;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 600_000);
  let res: Response;
  try {
    res = await fetch('/api/master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out after 10 minutes. The backend may be overloaded.', 408);
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
      // response body was not JSON
    }
    throw new ApiError(message, res.status);
  }

  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('audio/')) {
    const blob = await res.blob();
    return {
      blob,
      headers: {
        'X-Route': res.headers.get('X-Route') || '',
        'X-Elapsed-Ms': res.headers.get('X-Elapsed-Ms') || '',
        'X-Metrics': res.headers.get('X-Metrics') || '',
      },
    };
  }

  // Backend returned JSON instead of audio (e.g. when output_url was provided)
  const data = await res.json();
  throw new ApiError(
    data.error || 'Expected audio response but received JSON',
    422
  );
}

// Concertmaster Cloud Run — no body size limit (Vercel has 4.5MB limit)
const CONCERTMASTER_UPLOAD_URL =
  process.env.NEXT_PUBLIC_CONCERTMASTER_URL ||
  'https://whiteprintaudioengine-concertmaster-pdw36wmy5q-an.a.run.app';

/** Helper: upload file to GCS via Concertmaster Cloud Run */
async function uploadToGCS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const resp = await fetch(`${CONCERTMASTER_UPLOAD_URL}/api/v1/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!resp.ok) {
    const errBody = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new ApiError(errBody.detail || `Upload failed (${resp.status})`, resp.status);
  }

  const result = await resp.json();
  return result.url;
}

/** Upload a file to GCS via Concertmaster, then POST the URL to /api/master */
export async function postMasterUpload<T>(file: File, fields: Record<string, string>): Promise<T> {
  // Step 1: Upload raw file → Concertmaster (Cloud Run) → GCS source bucket
  const gcsUrl = await uploadToGCS(file);

  // Step 2: Pass the GCS public URL + fields to /api/master as JSON
  return postMaster<T>({ ...fields, audio_url: gcsUrl });
}

/** Upload a file to GCS via Concertmaster, then POST to /api/master expecting audio binary back */
export async function postMasterUploadBinary(file: File, fields: Record<string, string>): Promise<{
  blob: Blob;
  headers: Record<string, string>;
}> {
  // Step 1: Upload raw file → Concertmaster (Cloud Run) → GCS source bucket
  const gcsUrl = await uploadToGCS(file);

  // Step 2: Pass the GCS public URL + fields to /api/master
  return postMasterBinary({ ...fields, audio_url: gcsUrl });
}
