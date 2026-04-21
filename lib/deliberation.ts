import type { DeliberationOutput } from '@/types/deliberation';
import { postMaster, postMasterUpload } from '@/lib/api-client';

/**
 * Targets (LUFS / True Peak) are decided by the Sage panel — we must NOT
 * supply them from the UI. Passing fixed defaults (the old -14 / -1.0)
 * overrides Sage's per-track judgement and audibly degrades the output.
 *
 * The caller may optionally provide a `platform` hint that Sage uses as
 * deliberation context (target mediums reason about loudness differently);
 * we forward it only when present so the backend can fall back to its own
 * platform-agnostic reasoning otherwise.
 */
export interface DeliberationOptions {
  /** e.g. "spotify", "apple_music", "beatport" — forwarded to Sage as context. */
  platform?: string;
  /** Advanced escape hatch. Leave undefined to let Sage decide. */
  targetLufs?: number;
  /** Advanced escape hatch. Leave undefined to let Sage decide. */
  targetTruePeak?: number;
}

function buildDeliberationBody(options?: DeliberationOptions): Record<string, unknown> {
  const body: Record<string, unknown> = { route: 'deliberation_only' };
  if (options?.platform) body.platform = options.platform;
  if (typeof options?.targetLufs === 'number') body.target_lufs = options.targetLufs;
  if (typeof options?.targetTruePeak === 'number') body.target_true_peak = options.targetTruePeak;
  return body;
}

export async function runDeliberation(
  audioUrl: string,
  options?: DeliberationOptions,
): Promise<DeliberationOutput> {
  const wrapper = await postMaster<{ route: string; deliberation: DeliberationOutput; elapsed_ms: number }>({
    ...buildDeliberationBody(options),
    audio_url: audioUrl,
  });
  return wrapper.deliberation;
}

export async function runDeliberationFile(
  file: File,
  options?: DeliberationOptions,
): Promise<DeliberationOutput> {
  const fields: Record<string, string> = { route: 'deliberation_only' };
  if (options?.platform) fields.platform = options.platform;
  if (typeof options?.targetLufs === 'number') fields.target_lufs = options.targetLufs.toString();
  if (typeof options?.targetTruePeak === 'number') fields.target_true_peak = options.targetTruePeak.toString();
  const wrapper = await postMasterUpload<{ route: string; deliberation: DeliberationOutput; elapsed_ms: number }>(file, fields);
  return wrapper.deliberation;
}
