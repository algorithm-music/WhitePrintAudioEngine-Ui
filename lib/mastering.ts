import type { DeliberationOutput } from '@/types/deliberation';
import type { MasteringResult } from '@/types/mastering';
import { postMasterBinary, postMasterUploadBinary } from '@/lib/api-client';

export async function runMastering(
  audioUrl: string,
  deliberation: DeliberationOutput,
): Promise<MasteringResult> {
  const { blob, headers } = await postMasterBinary({
    audio_url: audioUrl,
    route: 'dsp_only',
    manual_params: deliberation.adopted_params,
    target_lufs: deliberation.target_lufs,
    target_true_peak: deliberation.target_true_peak,
  });

  return buildMasteringResult(blob, headers, deliberation);
}

export async function runMasteringFile(
  file: File,
  deliberation: DeliberationOutput,
): Promise<MasteringResult> {
  const { blob, headers } = await postMasterUploadBinary(file, {
    route: 'dsp_only',
    manual_params: JSON.stringify(deliberation.adopted_params),
    target_lufs: deliberation.target_lufs.toString(),
    target_true_peak: deliberation.target_true_peak.toString(),
  });

  return buildMasteringResult(blob, headers, deliberation);
}

function buildMasteringResult(
  blob: Blob,
  headers: Record<string, string>,
  deliberation: DeliberationOutput,
): MasteringResult {
  const downloadUrl = URL.createObjectURL(blob);

  let metrics: MasteringResult['metrics'] = {
    lufs_before: 0,
    lufs_after: deliberation.target_lufs,
    true_peak_before: 0,
    true_peak_after: deliberation.target_true_peak,
    dynamic_range_after: 0,
    convergence_loops: 0,
    gain_adjustment_db: 0,
    target_lufs: deliberation.target_lufs,
    target_true_peak: deliberation.target_true_peak,
    engine_version: 'v2_14stage',
  };

  try {
    const metricsHeader = headers['X-Metrics'];
    if (metricsHeader) {
      const parsed = JSON.parse(metricsHeader);
      metrics = { ...metrics, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to parse X-Metrics header, using defaults:', error);
  }

  return {
    job_id: crypto.randomUUID(),
    status: 'success',
    metrics,
    download_url: downloadUrl,
  };
}
