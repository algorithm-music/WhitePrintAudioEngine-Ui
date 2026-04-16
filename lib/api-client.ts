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

/** Helper: upload file directly to Supabase Storage */
async function uploadToSupabase(file: File): Promise<string> {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  
  // Ensure the filename is completely ASCII to prevent Supabase "Invalid key" errors
  const extension = file.name.split('.').pop() || 'wav';
  const path = `uploads/${timestamp}-${randomSuffix}/audio.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('audio-uploads')
    .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
    
  if (uploadError) {
    throw new ApiError(`Storage upload failed: ${uploadError.message}`, 500);
  }

  const { data: publicUrlData } = supabase.storage.from('audio-uploads').getPublicUrl(path);
  return publicUrlData.publicUrl;
}

/** Upload a file directly to Supabase Storage, then POST the URL to /api/master */
export async function postMasterUpload<T>(file: File, fields: Record<string, string>): Promise<T> {
  // Step 1: Upload raw file directly from browser to Supabase Storage (Bypasses Vercel and Cloud Run size limits)
  const supabaseUrl = await uploadToSupabase(file);

  // Step 2: Pass the public URL + fields to /api/master as JSON
  return postMaster<T>({ ...fields, audio_url: supabaseUrl });
}

/** Upload a file to Supabase Storage, then POST to /api/master expecting audio binary back */
export async function postMasterUploadBinary(file: File, fields: Record<string, string>): Promise<{
  blob: Blob;
  headers: Record<string, string>;
}> {
  // Step 1: Upload raw file directly from browser to Supabase Storage
  const supabaseUrl = await uploadToSupabase(file);

  // Step 2: Pass the public URL + fields to /api/master
  return postMasterBinary({ ...fields, audio_url: supabaseUrl });
}
