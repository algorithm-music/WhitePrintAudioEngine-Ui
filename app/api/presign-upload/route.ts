import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateDownloadUrl,
  generateUploadUrl,
  makeObjectName,
} from '@/lib/gcs';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * POST /api/presign-upload
 *   body: { filename: string, content_type?: string }
 *   response: { upload_url, gcs_object, expires_at }
 *
 * The browser then does `PUT upload_url` with the file bytes (raw body,
 * Content-Type matching what was signed). After a successful PUT, the
 * browser calls /api/master passing `gcs_object` as `input_object`.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const filename = typeof body.filename === 'string' ? body.filename : '';
    const contentType =
      typeof body.content_type === 'string' && body.content_type
        ? body.content_type
        : 'application/octet-stream';

    if (!filename) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 });
    }

    // Optional auth — guests are allowed to upload under the `guest` prefix.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const gcsObject = makeObjectName('uploads', user?.id ?? null, filename);
    const [uploadUrl, downloadUrl] = await Promise.all([
      generateUploadUrl(gcsObject, contentType, 15),
      generateDownloadUrl(gcsObject, 60),
    ]);

    return NextResponse.json({
      upload_url: uploadUrl,
      // Signed GET URL — the UI uses this as a real HTTPS src for audio
      // preview elements (no custom scheme), while postMaster parses the
      // object name out of it and sends that as `gcs_object` to the backend.
      download_url: downloadUrl,
      gcs_object: gcsObject,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      content_type: contentType,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[presign-upload] failed:', message);
    return NextResponse.json(
      { error: `Failed to generate upload URL: ${message}` },
      { status: 500 },
    );
  }
}
