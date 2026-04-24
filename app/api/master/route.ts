import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { makeObjectName, generateDownloadUrl, generateUploadUrl } from '@/lib/gcs';

function cleanUrl(raw: string | undefined, fallback: string): string {
  const v = (raw || '').trim() || fallback;
  return v.replace(/[\r\n]+/g, '').replace(/\/+$/, '');
}

const CONCERTMASTER_URL = cleanUrl(
  process.env.CONCERTMASTER_URL,
  'https://concertmaster.aimastering.tech'
);
const CONCERTMASTER_API_KEY = (process.env.CONCERTMASTER_API_KEY || '').trim();

const FREE_TRACKS_LIMIT = 3;

/**
 * Proxy to Concertmaster's /api/v1/jobs/master.
 *
 * Concertmaster (v00022+) is a **synchronous** API — it accepts
 * `audio_url` (signed GET) and optionally `output_url` (signed PUT),
 * runs the full pipeline, and returns results in a single response.
 *
 * If CM returns `job_id` (older async versions), the response is
 * forwarded as-is for poll-based flow. If CM returns results directly
 * (sync), we wrap them as a synthetic "completed" job so the UI can
 * handle both seamlessly.
 */
export const maxDuration = 300;
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

    // Allocate output object for mastering routes
    let outputObject: string | null = null;
    if (isMasteringRoute) {
      outputObject = makeObjectName(
        'outputs',
        user?.id ?? null,
        gcsObject ? gcsObject.split('/').pop() || 'master.wav' : 'master.wav',
      );
    }

    // Build Concertmaster request using signed GCS URLs.
    // CM v00022+ expects `audio_url` (signed GET) instead of `input_path`.
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

    // Generate signed GET URL for input audio
    if (gcsObject) {
      cmBody.audio_url = await generateDownloadUrl(gcsObject, 60);
    } else if (audioUrl) {
      cmBody.audio_url = audioUrl;
    }
    // Generate signed PUT URL for output (mastering routes only)
    if (outputObject) {
      cmBody.output_url = await generateUploadUrl(outputObject, 'audio/wav', 60);
    }

    const targetUrl = `${CONCERTMASTER_URL}/api/v1/jobs/master`;
    const paramSummary = {
      route,
      platform: cmBody.platform ?? '(sage-default)',
      target_lufs: cmBody.target_lufs ?? '(sage-decides)',
      target_true_peak: cmBody.target_true_peak ?? '(sage-decides)',
      has_manual_params: !!cmBody.manual_params,
      has_sage_config: !!cmBody.sage_config,
      has_dsp_config: !!cmBody.dsp_config,
      input: gcsObject ? `gcs:${gcsObject}` : audioUrl ? `url:${audioUrl.slice(0, 80)}…` : '(none)',
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
        const raw = err.detail || err.error || detail;
        detail = typeof raw === 'string' ? raw : JSON.stringify(raw);
      } catch {
        /* not json */
      }
      console.error(`[master] submit backend ${response.status}: ${detail}`);
      return NextResponse.json(
        { error: humanizeError(detail, response.status), detail },
        { status: response.status },
      );
    }

    const rawBody = await response.text();
    console.log(`[master] raw CM response (${rawBody.length} bytes): ${rawBody.slice(0, 300)}`);
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(rawBody);
    } catch {
      console.error(`[master] CM response is not JSON`);
      return NextResponse.json(
        { error: 'Backend returned invalid response' },
        { status: 502 },
      );
    }

    // Normalize: CM may return job_id (async) or results directly (sync)
    const jobId = (data.job_id ?? data.id ?? null) as string | null;

    // Save output_gcs_path and route to DB
    if (jobId) {
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
          .eq('id', jobId);
      } catch (err) {
        console.error('Failed to update job details:', err);
      }
    }

    // Count the track as used at submit time.
    if (isMasteringRoute && user) {
      await incrementUsage(user.id);
    }

    // If CM returned a job_id, this is async — return 202 for polling.
    if (jobId) {
      return NextResponse.json(
        {
          job_id: jobId,
          status: data.status as string,
          route: (data.route as string) || route,
          output_object: outputObject,
        },
        { status: 202 },
      );
    }

    // Sync response: CM returned results directly.
    // Generate download URL if output was written to GCS.
    let downloadUrl: string | null = null;
    if (outputObject) {
      try {
        downloadUrl = await generateDownloadUrl(outputObject, 60);
      } catch {
        console.warn('[master] Could not generate download URL for output');
      }
    }

    // Wrap as a synthetic completed job for the UI's poll-based flow.
    const syntheticId = `sync-${Date.now()}`;
    return NextResponse.json(
      {
        job_id: syntheticId,
        status: 'completed',
        route: (data.route as string) || route,
        output_object: outputObject,
        download_url: downloadUrl,
        analysis: data.analysis ?? data,
        deliberation: data.deliberation,
        metrics: data.metrics,
        elapsed_ms: data.elapsed_ms,
      },
      { status: 200 },
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

function humanizeError(raw: unknown, status: number): string {
  const str = typeof raw === 'string' ? raw : String(raw);
  const lower = str.toLowerCase();

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
  return str;
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
