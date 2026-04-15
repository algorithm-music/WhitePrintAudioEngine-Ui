import { NextRequest, NextResponse } from 'next/server';

const CONCERTMASTER_URL = process.env.CONCERTMASTER_URL || 'https://concertmaster.aimastering.tech';
const CONCERTMASTER_API_KEY = process.env.CONCERTMASTER_API_KEY || '';

export const config = {
  api: { bodyParser: false },
};

/**
 * POST /api/upload
 * Accepts a multipart form with:
 *   - file: the audio file (WAV, FLAC, AIFF, MP3)
 *   - route: mastering pipeline route (analyze_only, deliberation_only, dsp_only, full)
 *   - target_lufs (optional)
 *   - target_true_peak (optional)
 *   - manual_params (optional JSON string)
 *
 * Forwards the file to Concertmaster's /api/v1/jobs/master-upload endpoint.
 * If Concertmaster doesn't support file upload, we serve the file locally via a temp URL.
 */
export async function POST(request: NextRequest) {
  if (!CONCERTMASTER_API_KEY) {
    return NextResponse.json(
      { error: 'Server misconfiguration: CONCERTMASTER_API_KEY is not set.' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const route = (formData.get('route') as string) || 'analyze_only';
    const targetLufs = formData.get('target_lufs');
    const targetTruePeak = formData.get('target_true_peak');
    const manualParams = formData.get('manual_params');

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['audio/wav', 'audio/x-wav', 'audio/flac', 'audio/aiff', 'audio/x-aiff', 'audio/mpeg', 'audio/mp3'];
    const ext = file.name.toLowerCase().split('.').pop();
    const validExts = ['wav', 'flac', 'aiff', 'aif', 'mp3'];
    if (!validTypes.includes(file.type) && !validExts.includes(ext || '')) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || ext}. Supported: WAV, FLAC, AIFF, MP3.` },
        { status: 400 }
      );
    }

    // Validate file size (max 200MB)
    if (file.size > 200 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 200MB.' },
        { status: 400 }
      );
    }

    // Forward to Concertmaster as multipart/form-data
    const upstreamForm = new FormData();
    upstreamForm.append('file', file);
    upstreamForm.append('route', route);
    if (targetLufs) upstreamForm.append('target_lufs', targetLufs.toString());
    if (targetTruePeak) upstreamForm.append('target_true_peak', targetTruePeak.toString());
    if (manualParams) upstreamForm.append('manual_params', manualParams.toString());

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600_000);

    let response: Response;
    try {
      response = await fetch(`${CONCERTMASTER_URL}/api/v1/jobs/master-upload`, {
        method: 'POST',
        headers: {
          'X-Api-Key': CONCERTMASTER_API_KEY,
        },
        body: upstreamForm,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Backend request timed out after 10 minutes.' },
          { status: 504 }
        );
      }
      throw err;
    }
    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';

    // Audio response (mastered file)
    if (contentType.includes('audio/')) {
      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'X-Route': response.headers.get('X-Route') || '',
          'X-Elapsed-Ms': response.headers.get('X-Elapsed-Ms') || '',
          'X-Analysis': response.headers.get('X-Analysis') || '',
          'X-Deliberation': response.headers.get('X-Deliberation') || '',
          'X-Metrics': response.headers.get('X-Metrics') || '',
        },
      });
    }

    // JSON response (analysis / deliberation results)
    const data = await response.json();

    if (!response.ok) {
      const raw = data.detail || data.error || `Backend error: ${response.status}`;
      return NextResponse.json(
        { error: raw, detail: raw },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown upload error';
    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 502 }
    );
  }
}
