import { NextRequest, NextResponse } from 'next/server';
import { generateDownloadUrl } from '@/lib/gcs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * GET /api/download?path=<gcs-object>&filename=<download-name>
 *
 * If `filename` is present we stream the object through this route and
 * attach `Content-Disposition: attachment` ourselves. Relying on a
 * redirect-to-GCS with `response-content-disposition` was unreliable:
 * some browsers would drop the header, follow the cross-origin redirect
 * and just open the wav inline in a new tab. Streaming through Node
 * guarantees the `attachment` disposition reaches the browser.
 *
 * When `filename` is omitted (e.g. the ABPlayer loading the mastered
 * buffer for playback), we keep the old redirect behaviour so the
 * browser / Web Audio can stream directly from GCS.
 */
export async function GET(request: NextRequest) {
  const objectPath = request.nextUrl.searchParams.get('path');
  const filename = request.nextUrl.searchParams.get('filename');
  if (!objectPath) {
    return NextResponse.json({ error: 'path is required' }, { status: 400 });
  }

  try {
    const signedUrl = await generateDownloadUrl(objectPath, 60);

    if (!filename) {
      // Playback path — let the browser fetch GCS directly.
      return NextResponse.redirect(signedUrl);
    }

    // Attachment path — proxy the bytes so we control the headers.
    const upstream = await fetch(signedUrl);
    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => '');
      console.error(`[download] upstream ${upstream.status}: ${text.slice(0, 200)}`);
      return NextResponse.json(
        { error: `Upstream fetch failed (${upstream.status})` },
        { status: 502 },
      );
    }

    const headers = new Headers();
    const contentType =
      upstream.headers.get('content-type') || 'application/octet-stream';
    headers.set('Content-Type', contentType);
    const contentLength = upstream.headers.get('content-length');
    if (contentLength) headers.set('Content-Length', contentLength);
    headers.set(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );
    headers.set('Cache-Control', 'private, no-store');

    return new NextResponse(upstream.body, { status: 200, headers });
  } catch (err) {
    console.error('[download] failed:', err);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 },
    );
  }
}
