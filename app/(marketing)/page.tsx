'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import LandingContent from '@/components/marketing/landing-content';
import AnalyzingScreen from '@/components/analyzing-screen';
import ResultsDashboard from '@/components/results-dashboard';
import DeliberatingScreen from '@/components/deliberating-screen';
import DeliberationDashboard from '@/components/deliberation-dashboard';
import MasteringScreen from '@/components/mastering-screen';
import MasteringDashboard from '@/components/mastering-dashboard';
import SiteHeader from '@/components/site-header';
import { analyzeAudio, analyzeAudioFile } from '@/lib/audio-analysis';
import { runDeliberation, runDeliberationFile } from '@/lib/deliberation';
import { runMastering, runMasteringFile } from '@/lib/mastering';
import { createClient } from '@/lib/supabase/client';
import type { AnalysisResult } from '@/types/audio';
import type { DeliberationOutput } from '@/types/deliberation';
import type { MasteringResult } from '@/types/mastering';

function AppDashboardInner() {
  const searchParams = useSearchParams();
  const [appState, setAppState] = useState<'idle' | 'analyzing' | 'results' | 'deliberating' | 'deliberation_results' | 'mastering' | 'mastering_results'>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [deliberationResult, setDeliberationResult] = useState<DeliberationOutput | null>(null);
  const [masteringResult, setMasteringResult] = useState<MasteringResult | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const autoStarted = useRef(false);

  const createJob = async (url: string): Promise<string | null> => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const fileName = url.split('/').pop()?.split('?')[0] || 'untitled';
      const { data } = await supabase.from('jobs').insert({
        user_id: user.id,
        input_gcs_path: url,
        input_file_name: fileName,
        status: 'analyzing',
        route: 'full',
      }).select('id').single();
      return data?.id || null;
    } catch { return null; }
  };

  const updateJob = async (id: string | null, updates: Record<string, unknown>) => {
    if (!id) return;
    try {
      const supabase = createClient();
      await supabase.from('jobs').update(updates).eq('id', id);
    } catch { /* non-blocking */ }
  };

  const parseAudioUrl = (inputUrl: string) => {
    if (inputUrl.includes('drive.google.com') && inputUrl.includes('/view')) {
      const match = inputUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    return inputUrl;
  };

  const handleSubmit = async (url: string) => {
    const parsedUrl = parseAudioUrl(url);
    setAppState('analyzing');
    setError(null);
    setAudioUrl(parsedUrl);
    setAudioFile(null);
    const jid = await createJob(parsedUrl);
    setJobId(jid);
    try {
      const result = await analyzeAudio(parsedUrl);
      setAnalysisResult(result);
      setAppState('results');
      await updateJob(jid, {
        status: 'completed',
        analysis_data: result,
        lufs_before: result.whole_track_metrics.integrated_lufs,
        true_peak_before: result.whole_track_metrics.true_peak_dbtp,
        bpm: result.track_identity.bpm,
        musical_key: result.track_identity.key,
        duration_sec: result.track_identity.duration_sec,
        sample_rate: result.track_identity.sample_rate,
        bit_depth: result.track_identity.bit_depth,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred during analysis.');
      setAppState('idle');
      await updateJob(jid, { status: 'failed', error_message: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  const handleFileSubmit = async (file: File) => {
    setAppState('analyzing');
    setError(null);
    setAudioFile(file);
    setAudioUrl(null);
    try {
      const result = await analyzeAudioFile(file);
      setAnalysisResult(result);
      setAppState('results');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred during analysis.');
      setAppState('idle');
    }
  };

  // Auto-start analysis if URL is passed via query param (from LP hero)
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam && !autoStarted.current && appState === 'idle') {
      autoStarted.current = true;
      handleSubmit(urlParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleReset = () => {
    setAppState('idle');
    setAnalysisResult(null);
    setDeliberationResult(null);
    setMasteringResult(null);
    setAudioUrl(null);
    setAudioFile(null);
    setError(null);
  };

  const handleRunDeliberation = async (targetLufs: number = -14.0, targetTruePeak: number = -1.0) => {
    if (!analysisResult) return;
    setAppState('deliberating');
    setError(null);
    try {
      const result = audioFile
        ? await runDeliberationFile(audioFile, targetLufs, targetTruePeak)
        : await runDeliberation(audioUrl!, targetLufs, targetTruePeak);
      setDeliberationResult(result);
      setAppState('deliberation_results');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred during deliberation.');
      setAppState('results');
    }
  };

  const handleRunMastering = async () => {
    if (!deliberationResult) return;
    setAppState('mastering');
    setError(null);
    await updateJob(jobId, { status: 'processing', route: 'dsp_only' });
    try {
      const result = audioFile
        ? await runMasteringFile(audioFile, deliberationResult)
        : await runMastering(audioUrl!, deliberationResult);
      setMasteringResult(result);
      setAppState('mastering_results');
      await updateJob(jobId, {
        status: 'completed',
        lufs_after: result.metrics.lufs_after,
        true_peak_after: result.metrics.true_peak_after,
        dynamic_range_after: result.metrics.dynamic_range_after,
        convergence_loops: result.metrics.convergence_loops,
        completed_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred during mastering.');
      setAppState('deliberation_results');
      await updateJob(jobId, { status: 'failed', error_message: err instanceof Error ? err.message : 'Unknown error' });
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
      {appState !== 'idle' && (
        <SiteHeader>
          {(appState === 'results' || appState === 'deliberation_results' || appState === 'mastering_results') && (
            <button
              onClick={handleReset}
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded border border-zinc-800 hover:border-zinc-600"
            >
              [ NEW_SESSION ]
            </button>
          )}
        </SiteHeader>
      )}

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {appState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <LandingContent onSubmit={handleSubmit} onFileSubmit={handleFileSubmit} error={error} />
            </motion.div>
          )}

          {appState === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 flex items-center justify-center p-6"
            >
              <AnalyzingScreen />
            </motion.div>
          )}

          {appState === 'results' && analysisResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <ResultsDashboard data={analysisResult} onRunDeliberation={handleRunDeliberation} audioUrl={audioUrl} />
            </motion.div>
          )}

          {appState === 'deliberating' && (
            <motion.div
              key="deliberating"
              initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 flex items-center justify-center p-6"
            >
              <DeliberatingScreen />
            </motion.div>
          )}

          {appState === 'deliberation_results' && deliberationResult && (
            <motion.div
              key="deliberation_results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <DeliberationDashboard data={deliberationResult} onRunMastering={handleRunMastering} />
            </motion.div>
          )}

          {appState === 'mastering' && (
            <motion.div
              key="mastering"
              initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 flex items-center justify-center p-6"
            >
              <MasteringScreen />
            </motion.div>
          )}

          {appState === 'mastering_results' && masteringResult && (
            <motion.div
              key="mastering_results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <MasteringDashboard data={masteringResult} audioUrl={audioUrl} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function AppDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 rounded bg-indigo-500 animate-pulse" />
      </div>
    }>
      <AppDashboardInner />
    </Suspense>
  );
}
