import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CONCERTMASTER_URL = process.env.CONCERTMASTER_URL || 'http://localhost:8000';
const CONCERTMASTER_API_KEY = process.env.CONCERTMASTER_API_KEY || '';

// Free plan limits (no billing record = free)
const FREE_TRACKS_LIMIT = 3;

export async function POST(request: NextRequest) {
  if (!CONCERTMASTER_API_KEY) {
    return NextResponse.json(
      { error: 'Server misconfiguration: CONCERTMASTER_API_KEY is not set.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const route = body.route as string | undefined;

    // Check usage limits for mastering routes (dsp_only and full)
    // Analysis and deliberation are free/unlimited
    const isMasteringRoute = !route || route === 'dsp_only' || route === 'full';

    // Usage check — wrapped in try-catch so billing failures never block mastering
    if (isMasteringRoute) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: billing } = await supabase
            .from('billing')
            .select('plan, tracks_used, tracks_limit, period_end')
            .eq('user_id', user.id)
            .single();

          const tracksLimit = billing?.tracks_limit ?? FREE_TRACKS_LIMIT;
          const tracksUsed = billing?.tracks_used ?? 0;

          if (billing?.period_end && new Date(billing.period_end) < new Date()) {
            if (tracksUsed >= FREE_TRACKS_LIMIT) {
              return NextResponse.json(
                { error: 'Your subscription has expired. Please renew to continue mastering.' },
                { status: 402 },
              );
            }
          } else if (tracksUsed >= tracksLimit) {
            return NextResponse.json(
              { error: `Monthly mastering limit reached (${tracksUsed}/${tracksLimit}). Upgrade your plan for more.` },
              { status: 429 },
            );
          }
        }
        // Guest users pass through — no limit enforcement for MVP
      } catch (err) {
        // Billing check failed (e.g. Supabase unreachable) — allow request to proceed
        console.error('Usage check failed, allowing request:', err);
      }
    }

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

      // Increment usage for successful mastering
      if (isMasteringRoute) {
        await incrementUsage(request);
      }

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
      const raw = data.detail || data.error || `Backend error: ${response.status}`;
      const friendly = humanizeError(raw, response.status);
      return NextResponse.json(
        { error: friendly, detail: raw },
        { status: response.status }
      );
    }

    // Increment usage for successful mastering (JSON response variant)
    if (isMasteringRoute && response.ok) {
      await incrementUsage(request);
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

function humanizeError(raw: string, status: number): string {
  const lower = raw.toLowerCase();

  // Google Drive auth redirect → file not shared
  if (lower.includes('accounts.google.com') || lower.includes('servicelogin') || lower.includes('interactivelogin')) {
    return 'Cannot access this file. Please set Google Drive sharing to "Anyone with the link can view".';
  }
  // File too small / not audio
  if (lower.includes('too small') || lower.includes('not valid audio')) {
    return 'The downloaded file is too small or not a valid audio file. Please check the URL points to a WAV, FLAC, or AIFF file.';
  }
  // 404 from storage provider
  if (lower.includes('404') || lower.includes('not found')) {
    return 'File not found. The URL may be incorrect or the file has been deleted.';
  }
  // Timeout
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return 'The file download timed out. Try a smaller file or a faster storage provider.';
  }
  // Rendition-DSP 503 (OOM / cold start)
  if (status === 502 && (lower.includes('503') || lower.includes('service unavailable'))) {
    return 'The mastering engine is temporarily unavailable. Please try again in 30 seconds.';
  }
  // Downstream 422 — usually file access or format issue
  if (status === 422 || (lower.includes('downstream') && lower.includes('422'))) {
    return 'Could not process the audio file. Common causes:\n• Google Drive file not shared publicly ("Anyone with the link")\n• URL does not point directly to an audio file (WAV/FLAC/AIFF)\n• File is too small or corrupted';
  }
  // Generic downstream
  if (lower.includes('downstream')) {
    return `Processing failed (${status}). Please check your audio URL and try again.`;
  }

  return raw;
}

async function incrementUsage(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Increment tracks_used in billing
    const { data: billing } = await supabase
      .from('billing')
      .select('id, tracks_used')
      .eq('user_id', user.id)
      .single();

    if (billing) {
      await supabase
        .from('billing')
        .update({ tracks_used: (billing.tracks_used || 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', billing.id);
    } else {
      // Create free-tier billing record
      await supabase
        .from('billing')
        .insert({
          user_id: user.id,
          plan: 'free',
          tracks_used: 1,
          tracks_limit: FREE_TRACKS_LIMIT,
        });
    }
  } catch (err) {
    console.error('Failed to increment usage:', err);
  }
}
