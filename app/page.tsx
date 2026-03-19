'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import UploadScreen from '@/components/upload-screen';
import AnalyzingScreen from '@/components/analyzing-screen';
import ResultsDashboard from '@/components/results-dashboard';
import DeliberatingScreen from '@/components/deliberating-screen';
import DeliberationDashboard from '@/components/deliberation-dashboard';
import MasteringScreen from '@/components/mastering-screen';
import MasteringDashboard from '@/components/mastering-dashboard';
import { analyzeAudio } from '@/lib/audio-analysis';
import { runDeliberationMock } from '@/lib/deliberation';
import { runMasteringMock } from '@/lib/mastering';
import type { AnalysisResult } from '@/types/audio';
import type { DeliberationOutput } from '@/types/deliberation';
import type { MasteringResult } from '@/types/mastering';

export default function Home() {
  const [appState, setAppState] = useState<'idle' | 'analyzing' | 'results' | 'deliberating' | 'deliberation_results' | 'mastering' | 'mastering_results'>('idle');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [deliberationResult, setDeliberationResult] = useState<DeliberationOutput | null>(null);
  const [masteringResult, setMasteringResult] = useState<MasteringResult | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setAppState('analyzing');
    setError(null);
    setAudioUrl(URL.createObjectURL(file));
    try {
      const result = await analyzeAudio(file);
      setAnalysisResult(result);
      setAppState('results');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred during analysis.');
      setAppState('idle');
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setAnalysisResult(null);
    setDeliberationResult(null);
    setMasteringResult(null);
    setAudioUrl(null);
    setError(null);
  };

  const handleRunDeliberation = async () => {
    if (!analysisResult) return;
    setAppState('deliberating');
    setError(null);
    try {
      const result = await runDeliberationMock(analysisResult);
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
    try {
      const result = await runMasteringMock(deliberationResult);
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
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
              <h1 className="font-mono text-sm font-semibold tracking-wider text-zinc-200">
                RENDITION_DSP <span className="text-zinc-500 font-normal">v2.0.0</span>
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-4 text-xs font-mono">
              <a href="/" className="text-zinc-400 hover:text-white transition-colors">DASHBOARD</a>
              <a href="/api-keys" className="text-zinc-400 hover:text-white transition-colors">API_KEYS</a>
              <a href="/api-docs" className="text-zinc-400 hover:text-white transition-colors">CURL_GEN</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {(appState === 'results' || appState === 'deliberation_results' || appState === 'mastering_results') && (
              <button
                onClick={handleReset}
                className="text-xs font-mono text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded border border-zinc-800 hover:border-zinc-600"
              >
                [ NEW_SESSION ]
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
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
              <UploadScreen onUpload={handleUpload} error={error} />
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
