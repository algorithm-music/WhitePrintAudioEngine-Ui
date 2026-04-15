import type { AnalysisResult } from '@/types/audio';
import { postMaster, postMasterUpload } from '@/lib/api-client';

export async function analyzeAudio(audioUrl: string): Promise<AnalysisResult> {
  const wrapper = await postMaster<{ route: string; analysis: AnalysisResult; elapsed_ms: number }>({
    audio_url: audioUrl,
    route: 'analyze_only',
  });
  return wrapper.analysis;
}

export async function analyzeAudioFile(file: File): Promise<AnalysisResult> {
  const wrapper = await postMasterUpload<{ route: string; analysis: AnalysisResult; elapsed_ms: number }>(file, {
    route: 'analyze_only',
  });
  return wrapper.analysis;
}
