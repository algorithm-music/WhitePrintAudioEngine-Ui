'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import UploadScreen from '@/components/upload-screen';
import AnalyzingScreen from '@/components/analyzing-screen';
import ResultsDashboard from '@/components/results-dashboard';
import DeliberatingScreen from '@/components/deliberating-screen';
import DeliberationDashboard from '@/components/deliberation-dashboard';
import MasteringScreen from '@/components/mastering-screen';
import MasteringDashboard from '@/components/mastering-dashboard';
import SiteHeader from '@/components/site-header';
import { analyzeAudio } from '@/lib/audio-analysis';
import { runDeliberation } from '@/lib/deliberation';
import { runMastering } from '@/lib/mastering';
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
  const [error, setError] = useState<string | null>(null);
  const autoStarted = useRef(false);

  const handleSubmit = async (url: string) => {
    setAppState('analyzing');
    setError(null);
    setAudioUrl(url);
    try {
      const result = await analyzeAudio(url);
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
    setError(null);
  };

  const handleRunDeliberation = async () => {
    if (!analysisResult || !audioUrl) return;
    setAppState('deliberating');
    setError(null);
    try {
      const result = await runDeliberation(audioUrl);
      setDeliberationResult(result);
      setAppState('deliberation_results');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred during deliberation.');
      setAppState('results');
    }
  };

  const handleRunMastering = async () => {
    if (!deliberationResult || !audioUrl) return;
    setAppState('mastering');
    setError(null);
    try {
      const result = await runMastering(audioUrl, deliberationResult);
      setMasteringResult(result);
      setAppState('mastering_results');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred during mastering.');
      setAppState('deliberation_results');
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
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

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          {appState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 flex items-center justify-center p-6"
            >
              <UploadScreen onSubmit={handleSubmit} error={error} />
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
              <ResultsDashboard data={analysisResult} onRunDeliberation={handleRunDeliberation} />
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
