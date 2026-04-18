import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateDownloadUrl,
  makeObjectName,
  objectToFusePath,
} from '@/lib/gcs';

const CONCERTMASTER_URL = (
  process.env.CONCERTMASTER_URL ||
  'https://whiteprintaudioengine-concertmaster-270124753853.asia-northeast1.run.app'
)
  .trim()
  .replace(/\/+$/, '');
const CONCERTMASTER_API_KEY = (process.env.CONCERTMASTER_API_KEY || '').trim();

const FREE_TRACKS_LIMIT = 3;

export const maxDuration = 800;
export const dynamic = 'force-dynamic';

/**
 * POST /api/master
 *   body: {
 *     // input (choose one):
 *     gcs_object?: string,                      // preferred — object under GCS_BUCKET uploaded via /api/presign-upload
 *     audio_url?:  string,                      // legacy — HTTPS URL (GDrive etc.)
 *     route?:      'full' | 'analyze_only' | 'deliberation_only' | 'dsp_only',
 *     target_lufs?: number,
 *     target_true_peak?: number,
 *     sage_config?: object,
 *     dsp_config?:  object,
 *     manual_params?: object,
 *   }
 *
 * The mastered WAV is never transferred through Vercel. rendition-dsp writes
 * the output directly to the GCSFuse-mounted bucket; this route then signs a
 * V4 GET URL for the browser to download.
 */
export async function POST(request: NextRequest) {
  if (!CONCERTMASTER_API_KEY) {
    return NextResponse.json(
      { error: 'Server misconfiguration: CONCERTMASTER_API_KEY is not set.' },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const route: string = (body.route as string) || 'full';
    const isMasteringRoute =
      route === 'full' || route === 'dsp_only' || !body.route;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Billing gate (mastering routes only)
    if (isMasteringRoute && user) {
      try {
        const { data: billing } = await supabase
          .from('billing')
          .select('plan, tracks_used, tracks_limit, period_end')
          .eq('user_id', user.id)
          .single();

        const tracksLimit = billing?.tracks_limit ?? FREE_TRACKS_LIMIT;
        const tracksUsed = billing?.tracks_used ?? 0;

        if (
          billing?.period_end &&
          new Date(billing.period_end) < new Date() &&
          tracksUsed >= FREE_TRACKS_LIMIT
        ) {
          return NextResponse.json(
            {
              error:
                'Your subscription has expired. Please renew to continue mastering.',
            },
            { status: 402 },
          );
        }
        if (tracksUsed >= tracksLimit) {
          return NextResponse.json(
            {
              error: `Monthly mastering limit reached (${tracksUsed}/${tracksLimit}). Upgrade your plan for more.`,
            },
            { status: 429 },
          );
        }
      } catch (err) {
        console.error('Usage check failed, allowing request:', err);
      }
    }

    // Resolve input: prefer gcs_object (direct-to-bucket upload).
    const gcsObject: string | undefined =
      typeof body.gcs_object === 'string' ? body.gcs_object : undefined;
    const audioUrl: string | undefined =
      typeof body.audio_url === 'string' ? body.audio_url : undefined;

    if (!gcsObject && !audioUrl) {
      return NextResponse.json(
        { error: 'Either gcs_object (preferred) or audio_url is required.' },
        { status: 400 },
      );
    }

    // Allocate an output object in the same bucket so rendition-dsp can write
    // it in place via its GCSFuse mount.
    let outputObject: string | null = null;
    let outputFusePath: string | null = null;
    if (isMasteringRoute) {
      outputObject = makeObjectName(
        'outputs',
        user?.id ?? null,
        gcsObject ? gcsObject.split('/').pop() || 'master.wav' : 'master.wav',
      );
      outputFusePath = objectToFusePath(outputObject);
    }

    const cmBody: Record<string, unknown> = {
      route,
      target_lufs: body.target_lufs,
      target_true_peak: body.target_true_peak,
      sage_config: body.sage_config,
      dsp_config: body.dsp_config,
      manual_params: body.manual_params,
    };
    if (gcsObject) {
      cmBody.input_path = objectToFusePath(gcsObject);
    } else if (audioUrl) {
      cmBody.audio_url = audioUrl;
    }
    if (outputFusePath) {
      cmBody.output_path = outputFusePath;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 780_000);

    const targetUrl = `${CONCERTMASTER_URL}/api/v1/jobs/master`;
    console.log(
      `[master] → ${targetUrl} | gcs_object=${gcsObject ?? '(none)'} | output_object=${outputObject ?? '(none)'}`,
    );

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': CONCERTMASTER_API_KEY,
        },
        body: JSON.stringify(cmBody),
        signal: controller.signal,
      });
      console.log(
        `[master] ← ${response.status} ${response.statusText} | content-type=${response.headers.get('content-type')}`,
      );
    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      console.error(`[master] fetch threw: ${msg} | URL: ${targetUrl}`);
      if (err instanceof DOMException && err.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Backend request timed out after 13 minutes.' },
          { status: 504 },
        );
      }
      return NextResponse.json(
        { error: `Failed to reach backend: ${msg}` },
        { status: 502 },
      );
    }
    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';

    // Happy path: concertmaster wrote the master to the shared GCSFuse mount
    // (because we sent output_path) and replied with JSON metrics.
    if (contentType.includes('application/json')) {
      const data = await response.json();

      if (!response.ok) {
        const raw = data.detail || data.error || `Backend error: ${response.status}`;
        console.error(`[master] backend ${response.status}: ${raw}`);
        return NextResponse.json(
          { error: humanizeError(raw, response.status), detail: raw },
          { status: response.status },
        );
      }

      if (isMasteringRoute && user) {
        await incrementUsage(user.id);
      }

      if (outputObject) {
        // Sign a V4 GET URL the browser can download from. No Vercel bytes transfer.
        const downloadUrl = await generateDownloadUrl(outputObject, 60);
        return NextResponse.json({
          route: data.route || route,
          download_url: downloadUrl,
          metrics: data.dsp_metrics || data.metrics || {},
          analysis: data.analysis,
          deliberation: data.deliberation,
          elapsed_ms: data.elapsed_ms,
        });
      }

      // Non-mastering routes (analyze_only / deliberation_only) — pass through.
      return NextResponse.json(data);
    }

    // Legacy path: concertmaster returned audio bytes (only when neither
    // output_path nor output_url was set — shouldn't normally happen).
    if (contentType.startsWith('audio/')) {
      console.warn(
        '[master] backend returned audio bytes; this path is legacy and should not fire when output_path is set.',
      );
      return NextResponse.json(
        {
          error:
            'Backend returned raw audio bytes, but GCS output was expected. Check that input_path / output_path wiring is in place.',
        },
        { status: 500 },
      );
    }

    const text = await response.text();
    console.error(
      `[master] unexpected content-type: ${contentType} | status=${response.status} | body[:200]=${text.slice(0, 200)}`,
    );
    return NextResponse.json(
      { error: `Unexpected backend response (${response.status}).`, detail: text.slice(0, 500) },
      { status: response.status || 500 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown proxy error';
    console.error(`[master] proxy error: ${message}`);
    return NextResponse.json(
      { error: `Failed to reach backend: ${message}` },
      { status: 502 },
    );
  }
}

function humanizeError(raw: string, status: number): string {
  const lower = raw.toLowerCase();

  if (lower.includes('accounts.google.com') || lower.includes('servicelogin')) {
    return 'Cannot access this file. Please set Google Drive sharing to "Anyone with the link can view".';
  }
  if (lower.includes('too small') || lower.includes('not valid audio')) {
    return 'The uploaded file is too small or not a valid audio file. Please use WAV, FLAC, or AIFF.';
  }
  if (lower.includes('404') || lower.includes('not found')) {
    return 'File not found. The upload may have been removed or the URL is incorrect.';
  }
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return 'Processing timed out. Try a shorter track.';
  }
  if (status === 422) {
    return 'Could not process the audio file. Use a valid WAV/FLAC/AIFF.';
  }
  if (status === 502 && (lower.includes('503') || lower.includes('service unavailable'))) {
    return 'The mastering engine is temporarily unavailable. Please try again in 30 seconds.';
  }
  return raw;
}

async function incrementUsage(userId: string) {
  try {
    const supabase = await createClient();
    const { data: billing } = await supabase
      .from('billing')
      .select('id, tracks_used')
      .eq('user_id', userId)
      .single();

    if (billing) {
      await supabase
        .from('billing')
        .update({
          tracks_used: (billing.tracks_used || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', billing.id);
    } else {
      await supabase.from('billing').insert({
        user_id: userId,
        plan: 'free',
        tracks_used: 1,
        tracks_limit: FREE_TRACKS_LIMIT,
      });
    }
  } catch (err) {
    console.error('Failed to increment usage:', err);
  }
}
