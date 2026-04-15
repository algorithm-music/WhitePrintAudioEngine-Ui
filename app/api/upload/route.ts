import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/upload
 *
 * Receives an audio file via multipart/form-data, uploads it to the
 * GCS source bucket, and returns the public GCS URL that the pipeline
 * (Concertmaster → Audition → Deliberation → Rendition-DSP) can fetch.
 *
 * Required env vars:
 *   GCS_SOURCE_BUCKET  — e.g. "aidriven-mastering-fyqu-source-bucket"
 *
 * Authentication is done via Google Application Default Credentials
 * (the Cloud Run service account already has Storage Object Admin role).
 */

const GCS_SOURCE_BUCKET = process.env.GCS_SOURCE_BUCKET || 'aidriven-mastering-fyqu-source-bucket';

// 200 MB hard limit — matches Concertmaster's MAX_AUDIO_SIZE
const MAX_FILE_SIZE = 200 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/flac',
  'audio/x-flac',
  'audio/aiff',
  'audio/x-aiff',
  'audio/mpeg',
  'audio/mp3',
]);

export const maxDuration = 120; // 2 minutes max for large uploads
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Include a "file" field in multipart form data.' },
        { status: 400 },
      );
    }

    // Validate file type
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${mimeType}. Accepted: WAV, FLAC, AIFF, MP3.` },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
        { status: 413 },
      );
    }

    if (file.size < 44) {
      return NextResponse.json(
        { error: 'File too small to be valid audio.' },
        { status: 400 },
      );
    }

    // Generate unique object name preserving original filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const safeName = file.name.replace(/[^a-zA-Z0-9._\-\u3000-\u9FFF\uF900-\uFAFF]/g, '_');
    const objectName = `uploads/${timestamp}-${randomSuffix}/${safeName}`;

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to GCS using the JSON API (no SDK dependency needed)
    const { access_token } = await getAccessToken();

    const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(GCS_SOURCE_BUCKET)}/o?uploadType=media&name=${encodeURIComponent(objectName)}`;

    const gcsResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': mimeType || 'application/octet-stream',
      },
      body: buffer,
    });

    if (!gcsResponse.ok) {
      const errorText = await gcsResponse.text();
      console.error(`[upload] GCS upload failed: ${gcsResponse.status} ${errorText}`);
      return NextResponse.json(
        { error: 'Failed to upload file to storage.' },
        { status: 502 },
      );
    }

    // Construct the public URL
    const gcsUrl = `https://storage.googleapis.com/${GCS_SOURCE_BUCKET}/${encodeURIComponent(objectName)}`;

    console.log(`[upload] Success: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB) → ${gcsUrl}`);

    return NextResponse.json({
      url: gcsUrl,
      object_name: objectName,
      file_name: file.name,
      file_size: file.size,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown upload error';
    console.error(`[upload] Error: ${message}`);
    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 500 },
    );
  }
}


/**
 * Get an OAuth2 access token using metadata server (Cloud Run)
 * or fall back to a service account key file (local dev).
 */
async function getAccessToken(): Promise<{ access_token: string }> {
  // On Cloud Run: use the metadata server
  try {
    const metadataUrl = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';
    const resp = await fetch(metadataUrl, {
      headers: { 'Metadata-Flavor': 'Google' },
    });
    if (resp.ok) {
      return await resp.json();
    }
  } catch {
    // Not on Cloud Run — fall through to local auth
  }

  // Local development: use gcloud CLI's access token
  const { execSync } = await import('child_process');
  try {
    const token = execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();
    return { access_token: token };
  } catch {
    throw new Error(
      'Cannot obtain GCP access token. On Cloud Run, the metadata server must be accessible. ' +
      'Locally, run `gcloud auth login` first.'
    );
  }
}
