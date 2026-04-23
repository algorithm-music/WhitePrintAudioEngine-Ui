import { NextRequest, NextResponse } from 'next/server';
import { generateDownloadUrl } from '@/lib/gcs';

function cleanUrl(raw: string | undefined, fallback: string): string {
  const v = (raw || '').trim() || fallback;
  return v.replace(/[\r\n]+/g, '').replace(/\/+$/, '');
}

const CONCERTMASTER_URL = cleanUrl(
  process.env.CONCERTMASTER_URL,
  'https://concertmaster.aimastering.tech'
);
const CONCERTMASTER_API_KEY = (process.env.CONCERTMASTER_API_KEY || '').trim();

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * GET /api/jobs/{job_id}?object=outputs/...
 *
 * Polls concertmaster for job status. When the job is completed and the
 * caller supplied the output object name (from the /api/master submit
 * response), sign a V4 GET URL so the browser can download the master
 * straight from GCS without streaming bytes through Vercel.
 *
 * Shape:
 *   queued / processing  → { status, stage?, route? }
 *   completed            → { status, route, download_url, metrics, analysis, deliberation, elapsed_ms }
 *   failed               → { status, error, http_status }
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!CONCERTMASTER_API_KEY) {
    return NextResponse.json(
      { error: 'Server misconfiguration: CONCERTMASTER_API_KEY is not set.' },
      { status: 500 },
    );
  }

  const { id: jobId } = await ctx.params;
  if (!jobId) {
    return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
  }
  const outputObject = request.nextUrl.searchParams.get('object') || null;

  const targetUrl = `${CONCERTMASTER_URL}/api/v1/jobs/${encodeURIComponent(jobId)}`;
  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'X-Api-Key': CONCERTMASTER_API_KEY },
      cache: 'no-store',
    });
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error(`[jobs] fetch threw: ${msg} | URL: ${targetUrl}`);
    return NextResponse.json(
      { error: `Failed to reach backend: ${msg}` },
      { status: 502 },
    );
  }

  if (!response.ok) {
    let detail = `Backend error: ${response.status}`;
    try {
      const err = await response.json();
      detail = err.detail || err.error || detail;
    } catch {
      /* not json */
    }
    return NextResponse.json(
      { error: detail },
      { status: response.status },
    );
  }

  const data = (await response.json()) as {
    job_id: string;
    status: string;
    stage?: string;
    route?: string;
    result?: Record<string, unknown>;
    error?: string;
    http_status?: number;
  };

  if (data.status === 'completed') {
    const result = (data.result || {}) as Record<string, unknown>;
    let downloadUrl: string | null = null;
    if (outputObject) {
      try {
        downloadUrl = await generateDownloadUrl(outputObject, 60);
      } catch (err) {
        console.error('[jobs] failed to sign download URL:', err);
      }
    }
    // Surface what Sage actually chose so we can detect "-14 LUFS on every
    // track" regressions from logs without having to listen to the output.
    const deliberation = (result.deliberation || {}) as Record<string, unknown>;
    const metrics = (result.dsp_metrics || result.metrics || {}) as Record<string, unknown>;
    console.log(
      `[jobs] ${jobId} completed`,
      JSON.stringify({
        route: data.route || result.route,
        sage_target_lufs: deliberation.target_lufs ?? null,
        sage_target_true_peak: deliberation.target_true_peak ?? null,
        lufs_after: metrics.lufs_after ?? null,
        true_peak_after: metrics.true_peak_after ?? null,
      }),
    );
    return NextResponse.json({
      job_id: data.job_id,
      status: 'completed',
      route: data.route || result.route,
      download_url: downloadUrl,
      metrics,
      analysis: result.analysis,
      deliberation: result.deliberation,
      elapsed_ms: result.elapsed_ms,
    });
  }

  if (data.status === 'failed') {
    return NextResponse.json({
      job_id: data.job_id,
      status: 'failed',
      error: data.error || 'Pipeline failed.',
      http_status: data.http_status || 500,
    });
  }

  // queued / processing — include intermediate data if available
  return NextResponse.json({
    job_id: data.job_id,
    status: data.status,
    stage: data.stage,
    route: data.route,
    intermediate: (data as Record<string, unknown>).intermediate ?? null,
  });
}
