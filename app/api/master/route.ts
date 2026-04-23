import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { makeObjectName, objectToFusePath } from '@/lib/gcs';

const CONCERTMASTER_URL = (
  process.env.CONCERTMASTER_URL ||
  'https://whiteprintaudioengine-concertmaster-pdw36wmy5q-an.a.run.app'
)
  .replace(/\\r\\n|\\r|\\n|\r|\n/g, '')
  .trim()
  .replace(/\/+$/, '');
const CONCERTMASTER_API_KEY = (process.env.CONCERTMASTER_API_KEY || '').trim();

const FREE_TRACKS_LIMIT = 3;

/**
 * Async submit.
 *
 * Up through commit `2b8cbc7` this route held the HTTP connection open for
 * the full 5-10 minute mastering run. That blew up intermittently — Vercel
 * Functions, the browser, and any CDN in between all have their own idle
 * timeouts, and at ~9 months of attempted shipping we've had enough
 * `TypeError: fetch failed` incidents to kill that pattern.
 *
 * New contract:
 *   POST /api/master        →  { job_id, output_object }          (202)
 *   GET  /api/jobs/{id}?object=…  →  { status, download_url? }     (poll)
 *
 * The browser submits once, then polls every few seconds. No long-lived
 * connections, no keep-alive gymnastics.
 */
export const maxDuration = 800;
export const dynamic = 'force-dynamic';

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
    let {
      data: { user },
    } = await supabase.auth.getUser();

    // Check for API key in headers if not logged in via session
    const authHeader = request.headers.get('authorization');
    if (!user && authHeader && authHeader.startsWith('Bearer wpk_')) {
      const rawKey = authHeader.replace('Bearer ', '').trim();
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawKey));
      const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      const { createClient: createAdminClient } = await import('@supabase/supabase-js');
      const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: apiKey } = await adminSupabase
        .from('api_keys')
        .select('id, user_id, is_active')
        .eq('key_hash', keyHash)
        .single();

      if (apiKey && apiKey.is_active) {
        // Set user context to the owner of the API key
        user = { id: apiKey.user_id } as any;

        // Update last_used_at (non-blocking)
        adminSupabase
          .from('api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', apiKey.id)
          .then();
      } else {
        return NextResponse.json({ error: 'Invalid or revoked API key' }, { status: 401 });
      }
    }

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

    // Only forward fields the caller actually set — passing `undefined`
    // serializes fine, but it makes the Concertmaster log noisy and hides
    // UI bugs where a required param silently disappears (see 6cd254b,
    // when /app shipped with no target_lufs at all).
    const cmBody: Record<string, unknown> = { route };
    const forward = [
      'platform',          // Sage deliberation context (e.g. "spotify")
      'target_lufs',       // only when the caller explicitly overrides
      'target_true_peak',  // only when the caller explicitly overrides
      'sage_config',
      'dsp_config',
      'manual_params',
    ] as const;
    for (const key of forward) {
      if (body[key] !== undefined) cmBody[key] = body[key];
    }
    if (gcsObject) {
      cmBody.input_path = objectToFusePath(gcsObject);
    } else if (audioUrl) {
      cmBody.audio_url = audioUrl;
    }
    if (outputFusePath) {
      cmBody.output_path = outputFusePath;
    }

    const targetUrl = `${CONCERTMASTER_URL}/api/v1/jobs/master`;
    // Dump what we forward so regressions like "UI stopped sending params"
    // show up in Vercel logs immediately instead of only via bad audio.
    const paramSummary = {
      route,
      platform: cmBody.platform ?? '(sage-default)',
      target_lufs: cmBody.target_lufs ?? '(sage-decides)',
      target_true_peak: cmBody.target_true_peak ?? '(sage-decides)',
      has_manual_params: !!cmBody.manual_params,
      has_sage_config: !!cmBody.sage_config,
      has_dsp_config: !!cmBody.dsp_config,
      input: gcsObject ? `fuse:${objectToFusePath(gcsObject)}` : audioUrl ? `url:${audioUrl.slice(0, 80)}…` : '(none)',
      output_object: outputObject ?? '(none)',
    };
    console.log(`[master] submit → ${targetUrl}`, JSON.stringify(paramSummary));

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': CONCERTMASTER_API_KEY,
        },
        body: JSON.stringify(cmBody),
      });
      console.log(`[master] submit ← ${response.status} ${response.statusText}`);
    } catch (err) {
      const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      console.error(`[master] submit fetch threw: ${msg} | URL: ${targetUrl}`);
      return NextResponse.json(
        { error: `Failed to reach backend: ${msg}` },
        { status: 502 },
      );
    }

    if (!response.ok && response.status !== 202) {
      let detail = `Backend error: ${response.status}`;
      try {
        const err = await response.json();
        detail = err.detail || err.error || detail;
      } catch {
        /* not json */
      }
      console.error(`[master] submit backend ${response.status}: ${detail}`);
      return NextResponse.json(
        { error: humanizeError(detail, response.status), detail },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      job_id: string;
      status: string;
      route: string;
    };

    // Save output_gcs_path and route to DB using Service Role Key to ensure it's written
    if (data.job_id) {
      try {
        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const adminSupabase = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const updatePayload: Record<string, any> = { route: route };
        if (outputObject) {
          updatePayload.output_gcs_path = outputObject;
        }

        await adminSupabase
          .from('jobs')
          .update(updatePayload)
          .eq('id', data.job_id);
      } catch (err) {
        console.error('Failed to update job details:', err);
      }
    }

    // Count the track as used at submit time. Jobs that later fail won't
    // decrement, which is consistent with how the sync path behaved after
    // completion — we choose the simpler, stateless variant.
    if (isMasteringRoute && user) {
      await incrementUsage(user.id);
    }

    return NextResponse.json(
      {
        job_id: data.job_id,
        status: data.status,
        route: data.route || route,
        output_object: outputObject,
      },
      { status: 202 },
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
