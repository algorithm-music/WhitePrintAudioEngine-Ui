import { NextRequest, NextResponse } from 'next/server';
import { generateDownloadUrl } from '@/lib/gcs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const objectPath = request.nextUrl.searchParams.get('path');
  const filename = request.nextUrl.searchParams.get('filename');
  if (!objectPath) {
    return NextResponse.json({ error: 'path is required' }, { status: 400 });
  }

  try {
    const url = await generateDownloadUrl(objectPath, 60, filename || undefined);
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('[download] failed to sign URL:', err);
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
  }
}
