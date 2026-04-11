import { NextRequest, NextResponse } from 'next/server';

const CONCERTMASTER_URL = process.env.CONCERTMASTER_URL || 'http://localhost:8000';
const CONCERTMASTER_API_KEY = process.env.CONCERTMASTER_API_KEY || '';

export async function POST(request: NextRequest) {
  if (!CONCERTMASTER_API_KEY) {
    return NextResponse.json(
      { error: 'Server misconfiguration: CONCERTMASTER_API_KEY is not set.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300_000);

    let response: Response;
    try {
      response = await fetch(`${CONCERTMASTER_URL}/api/v1/jobs/master`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': CONCERTMASTER_API_KEY,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Backend request timed out after 5 minutes.' },
          { status: 504 }
        );
      }
      throw err;
    }
    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';

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

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown proxy error';
    return NextResponse.json(
      { error: `Failed to reach backend: ${message}` },
      { status: 502 }
    );
  }
}
