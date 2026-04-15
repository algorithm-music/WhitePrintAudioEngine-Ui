'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

const PHASES = [
  {
    name: 'DECODE',
    steps: [
      { text: 'Validating WAV/FLAC/AIFF header integrity', metric: null },
      { text: 'Decoding PCM stream → 64-bit float', metric: null },
      { text: 'Extracting channel layout (L/R/M/S)', metric: null },
    ],
  },
  {
    name: 'SPECTRUM',
    steps: [
      { text: 'Computing 4096-point FFT per 50ms frame', metric: '~5,600 frames' },
      { text: 'Applying Hann window with 75% overlap', metric: null },
      { text: 'Binning into 6-band spectral distribution', metric: 'Sub/Bass/LM/M/Hi/Air' },
    ],
  },
  {
    name: 'LOUDNESS',
    steps: [
      { text: 'Applying BS.1770-4 K-weighting filter', metric: 'ITU-R' },
      { text: 'Gating at -70 LUFS (absolute) and -10 LU (relative)', metric: null },
      { text: 'Computing integrated LUFS over full duration', metric: null },
      { text: 'Measuring True Peak via 4× oversampling', metric: null },
      { text: 'Calculating Loudness Range (LRA)', metric: null },
    ],
  },
  {
    name: 'ENVELOPES',
    steps: [
      { text: 'Generating 0.1s resolution time-series', metric: '9 dimensions' },
      { text: 'LUFS envelope extraction', metric: null },
      { text: 'Crest factor (peak-to-RMS) per chunk', metric: null },
      { text: 'Stereo width & mono correlation tracking', metric: null },
      { text: 'Spectral brightness & transient sharpness', metric: null },
      { text: 'Sub-bass ratio monitoring', metric: null },
    ],
  },
  {
    name: 'SECTIONS',
    steps: [
      { text: 'Smoothing LUFS+Width (3s moving avg)', metric: 'macro-form' },
      { text: 'Peak-picking novelty boundaries', metric: 'LUFS 70% + Width 30%' },
      { text: 'Enforcing min 8s section length', metric: null },
    ],
  },
  {
    name: 'SEMANTICS',
    steps: [
      { text: 'Booting Gemini Native Audio Engine', metric: 'multimodal' },
      { text: 'Slicing SEC_0 for AI audition', metric: null },
      { text: 'Identifying instruments & musical scene...', metric: null },
      { text: 'Slicing SEC_1 for AI audition', metric: null },
      { text: 'Identifying instruments & musical scene...', metric: null },
      { text: 'Slicing SEC_2 for AI audition', metric: null },
      { text: 'Identifying instruments & musical scene...', metric: null },
    ],
  },
  {
    name: 'PROBLEMS',
    steps: [
      { text: 'Evaluating harshness risk (2-6kHz energy)', metric: null },
      { text: 'Evaluating mud risk (200-500Hz density)', metric: null },
      { text: 'Checking mono compatibility (< 120Hz)', metric: null },
      { text: 'Flagging clipping / true peak violations', metric: null },
    ],
  },
  {
    name: 'FINALIZE',
    steps: [
      { text: 'Merging DSP metrics with AI Semantic Context', metric: null },
      { text: 'Assembling JSON payload + circuit envelopes', metric: null },
    ],
  },
];

const ALL_STEPS = PHASES.flatMap((phase) =>
  phase.steps.map((step) => ({ ...step, phase: phase.name }))
);

export default function AnalyzingScreen({ error }: { error?: string | null }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    // Vary speed: fast at start, slower in middle, fast at end
    const baseDelay = 350;
    const delay = currentStep < 3 ? 250 : currentStep > ALL_STEPS.length - 4 ? 200 : baseDelay + Math.random() * 300;
    const timer = setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, ALL_STEPS.length - 1));
    }, delay);
    return () => clearTimeout(timer);
  }, [currentStep]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPhase = ALL_STEPS[currentStep]?.phase ?? 'FINALIZE';
  const progress = ((currentStep + 1) / ALL_STEPS.length) * 100;

  // Frequency bins for spectrum visualization - use lazy initializer to prevent hydration mismatch
  const [spectrumBars] = useState<number[]>(() =>
    typeof window !== 'undefined'
      ? Array.from({ length: 32 }, () => 4 + Math.random() * 20)
      : []
  );

  return (
    <div className="w-full max-w-lg flex flex-col items-center justify-center">
      {/* Radar + Spectrum */}
      <div className="relative w-44 h-44 mb-8">
        {/* Concentric rings */}
        <div className="absolute inset-0 rounded-full border border-zinc-800" />
        <div className="absolute inset-4 rounded-full border border-zinc-800/50" />
        <div className="absolute inset-8 rounded-full border border-zinc-800/30" />
        <div className="absolute inset-12 rounded-full border border-zinc-800/20" />

        {/* Scanning line */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, transparent 75%, rgba(99, 102, 241, 0.5) 100%)',
          }}
        >
          <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-indigo-500 origin-bottom shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
        </motion.div>

        {/* Detection blips */}
        {currentStep > 5 && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              className="absolute top-[30%] left-[65%] w-2 h-2 rounded-full bg-indigo-400"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.1 }}
              className="absolute top-[55%] left-[25%] w-2 h-2 rounded-full bg-indigo-400"
            />
          </>
        )}

        {/* Center display */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-lg font-mono font-bold text-indigo-400">{currentPhase}</div>
          <div className="text-[10px] font-mono text-zinc-600">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</div>
        </div>
      </div>

      {/* Phase Indicators */}
      <div className="w-full flex items-center gap-1 mb-6">
        {PHASES.map((phase, idx) => {
          const phaseStepStart = PHASES.slice(0, idx).reduce((a, p) => a + p.steps.length, 0);
          const phaseStepEnd = phaseStepStart + phase.steps.length;
          const isActive = currentStep >= phaseStepStart && currentStep < phaseStepEnd;
          const isDone = currentStep >= phaseStepEnd;

          return (
            <div key={phase.name} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-1 w-full rounded-full transition-colors ${
                  isDone ? 'bg-emerald-500' : isActive ? 'bg-indigo-500' : 'bg-zinc-800'
                }`}
              />
              <span className={`text-[8px] font-mono ${
                isActive ? 'text-indigo-400' : isDone ? 'text-emerald-600' : 'text-zinc-700'
              }`}>
                {phase.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="w-full mb-4">
        <div className="flex justify-between text-[9px] font-mono text-zinc-600 mb-1">
          <span>{currentStep + 1}/{ALL_STEPS.length} steps</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Terminal Output */}
      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-xs h-40 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-zinc-950 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-zinc-950 to-transparent z-10" />

        <div className="flex flex-col justify-end h-full space-y-0.5 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {ALL_STEPS.slice(Math.max(0, currentStep - 5), currentStep + 1).map((step, relIdx) => {
              const absIdx = Math.max(0, currentStep - 5) + relIdx;
              const isLast = absIdx === currentStep;
              return (
                <motion.div
                  key={absIdx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-zinc-700 shrink-0">[{step.phase}]</span>
                  <span className={isLast ? 'text-indigo-400' : 'text-zinc-500'}>
                    {step.text}
                  </span>
                  {step.metric && !isLast && (
                    <span className="text-zinc-700 ml-auto shrink-0">{step.metric}</span>
                  )}
                  {!isLast && <span className="text-emerald-500 ml-auto shrink-0">OK</span>}
                  {isLast && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="w-1.5 h-3 bg-indigo-400 ml-auto shrink-0"
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Spectrum Analyzer */}
      <div className="w-full h-8 flex items-end justify-center gap-[2px] mt-4">
        {spectrumBars.map((base, i) => (
          <motion.div
            key={i}
            className="w-[4px] rounded-t bg-indigo-500/30"
            animate={{
              height: [base * 0.3, base + ((i * 7) % 12), base * 0.5],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 0.6 + ((i * 3) % 4) * 0.1,
              repeat: Infinity,
              delay: i * 0.02,
            }}
          />
        ))}
      </div>
    </div>
  );
}
