import type { DeliberationOutput } from '@/types/deliberation';
import { postMaster, postMasterUpload } from '@/lib/api-client';

export async function runDeliberation(
  audioUrl: string,
  targetLufs: number = -14.0,
  targetTruePeak: number = -1.0,
): Promise<DeliberationOutput> {
  const wrapper = await postMaster<{ route: string; deliberation: DeliberationOutput; elapsed_ms: number }>({
    audio_url: audioUrl,
    route: 'deliberation_only',
    target_lufs: targetLufs,
    target_true_peak: targetTruePeak,
  });
  return wrapper.deliberation;
}

export async function runDeliberationFile(
  file: File,
  targetLufs: number = -14.0,
  targetTruePeak: number = -1.0,
): Promise<DeliberationOutput> {
  const wrapper = await postMasterUpload<{ route: string; deliberation: DeliberationOutput; elapsed_ms: number }>(file, {
    route: 'deliberation_only',
    target_lufs: targetLufs.toString(),
    target_true_peak: targetTruePeak.toString(),
  });
  return wrapper.deliberation;
}
