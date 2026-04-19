'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export interface Phase {
  name: string;
  steps: { text: string; metric: string | null }[];
}

export interface FlattenedStep {
  text: string;
  metric: string | null;
  phase: string;
}

interface LoadingExperienceProps {
  /** Phase → step definitions, rendered as the scrolling console feed. */
  phases: Phase[];
  /** Big label above the timer (e.g. "ANALYZING" / "MASTERING"). */
  title: string;
  /** Optional: ~estimated wall-clock seconds this step takes end-to-end.
   *  Used only to pace the on-screen "script", never to decide readiness. */
  estimatedSeconds?: number;
  /** Error from upstream; surfaces at the bottom of the console. */
  error?: string | null;
  /** Before/after video sources. Each source is passed to <video src>. */
  showcase?: { label: string; before: string; after: string }[];
}

const DEFAULT_PHILOSOPHY: { tag: string; title: string; body: string }[] = [
  {
    tag: 'PHYSICS',
    title: 'We measure before we touch.',
    body:
      'BS.1770-4 loudness, ITU true-peak, crest, LRA, mono-sub compatibility — every metric is logged before a single dB of processing is applied. You should know exactly why a decision is being made.',
  },
  {
    tag: 'STRUCTURE',
    title: 'Three Sages, one consensus.',
    body:
      'GRAMMATICA (engineer), LOGICA (form guard), RHETORICA (aesthetics) deliberate in parallel. The master chain adopts only the parameters they agree on. No single vendor controls the sound.',
  },
  {
    tag: 'AESTHETICS',
    title: 'Transparent, open, yours.',
    body:
      'All five engines are open source on GitHub. Your audio never leaves your bucket. Billing, auth, keys — all separated. You own the artefact, we just deliver it.',
  },
  {
    tag: 'DISCIPLINE',
    title: 'Non-destructive by default.',
    body:
      'We do not sweeten. We do not "enhance". The 14-stage chain converges to a target LUFS and true-peak, then stops. If the track already meets spec, the chain is a no-op.',
  },
];

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LoadingExperience({
  phases,
  title,
  estimatedSeconds,
  error,
  showcase,
}: LoadingExperienceProps) {
  const allSteps: FlattenedStep[] = phases.flatMap((phase) =>
    phase.steps.map((step) => ({ ...step, phase: phase.name })),
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [philosophyIdx, setPhilosophyIdx] = useState(0);

  // Pace the scripted console feed. Roughly distribute across the estimate
  // if given; otherwise use a gentle ~400ms tick.
  useEffect(() => {
    const totalTarget = (estimatedSeconds ?? allSteps.length * 0.4) * 1000;
    const perStep = Math.max(250, Math.min(1200, totalTarget / allSteps.length));
    const jitter = 0.7 + Math.random() * 0.6;
    const delay =
      currentStep < 2
        ? perStep * 0.6
        : currentStep > allSteps.length - 3
          ? perStep * 0.5
          : perStep * jitter;
    const timer = setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, allSteps.length - 1));
    }, delay);
    return () => clearTimeout(timer);
  }, [currentStep, allSteps.length, estimatedSeconds]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle the philosophy cards every ~7s.
  useEffect(() => {
    const t = setInterval(
      () => setPhilosophyIdx((i) => (i + 1) % DEFAULT_PHILOSOPHY.length),
      7000,
    );
    return () => clearInterval(t);
  }, []);

  const progress = ((currentStep + 1) / allSteps.length) * 100;
  const currentPhase = allSteps[currentStep]?.phase ?? phases[phases.length - 1]?.name;

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
      {/* ── LEFT COLUMN: action console ─────────────────────────────── */}
      <div className="flex flex-col gap-6">
        {/* Title + huge timer */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-indigo-400 tracking-[0.25em]">
              {title}
            </div>
            <div className="text-sm font-mono text-zinc-500 mt-1">
              phase:{' '}
              <span className="text-zinc-300">{currentPhase}</span>
              {' · '}
              {currentStep + 1}/{allSteps.length} steps · {Math.round(progress)}%
            </div>
          </div>
          <div className="font-mono tabular-nums text-5xl md:text-6xl font-bold text-indigo-300 leading-none drop-shadow-[0_0_18px_rgba(99,102,241,0.25)]">
            {formatTimer(elapsed)}
          </div>
        </div>

        {/* Phase tracker */}
        <div className="flex items-center gap-1">
          {phases.map((phase, idx) => {
            const phaseStepStart = phases
              .slice(0, idx)
              .reduce((a, p) => a + p.steps.length, 0);
            const phaseStepEnd = phaseStepStart + phase.steps.length;
            const isActive =
              currentStep >= phaseStepStart && currentStep < phaseStepEnd;
            const isDone = currentStep >= phaseStepEnd;
            return (
              <div key={phase.name} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`h-1 w-full rounded-full transition-colors ${
                    isDone
                      ? 'bg-emerald-500'
                      : isActive
                        ? 'bg-indigo-500'
                        : 'bg-zinc-800'
                  }`}
                />
                <span
                  className={`text-[9px] font-mono tracking-wider ${
                    isActive
                      ? 'text-indigo-400'
                      : isDone
                        ? 'text-emerald-600'
                        : 'text-zinc-700'
                  }`}
                >
                  {phase.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Big console */}
        <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-sm overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.05)]">
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-zinc-900">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            <div className="ml-4 text-[10px] text-zinc-600">
              whiteprint://{title.toLowerCase()}
            </div>
          </div>
          <div className="relative h-[22rem] md:h-[26rem] overflow-hidden p-4">
            <div className="absolute top-10 left-0 w-full h-6 bg-gradient-to-b from-zinc-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-zinc-950 to-transparent z-10 pointer-events-none" />
            <div className="flex flex-col justify-end h-full gap-1">
              <AnimatePresence mode="popLayout">
                {allSteps
                  .slice(Math.max(0, currentStep - 12), currentStep + 1)
                  .map((step, relIdx) => {
                    const absIdx = Math.max(0, currentStep - 12) + relIdx;
                    const isLast = absIdx === currentStep;
                    return (
                      <motion.div
                        key={absIdx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-zinc-700 shrink-0 w-[10ch] text-right">
                          [{step.phase}]
                        </span>
                        <span className={isLast ? 'text-indigo-300' : 'text-zinc-500'}>
                          {step.text}
                        </span>
                        {step.metric && !isLast && (
                          <span className="text-zinc-700 ml-auto shrink-0 text-xs">
                            {step.metric}
                          </span>
                        )}
                        {!isLast && (
                          <span className="text-emerald-500 ml-auto shrink-0 text-xs">
                            OK
                          </span>
                        )}
                        {isLast && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className="w-2 h-4 bg-indigo-400 ml-auto shrink-0"
                          />
                        )}
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          </div>
          {error && (
            <div className="px-4 py-2 border-t border-red-900/60 bg-red-950/30 text-red-400 text-xs font-mono">
              ✕ {error}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: philosophy + showcase ─────────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="text-[10px] font-mono text-zinc-600 tracking-widest mb-3">
            WHY WE DO THIS
          </div>
          <div className="relative h-[12rem] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={philosophyIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="text-[10px] font-mono text-indigo-400 tracking-[0.3em] mb-2">
                  {DEFAULT_PHILOSOPHY[philosophyIdx].tag}
                </div>
                <div className="text-xl font-semibold text-zinc-100 leading-snug">
                  {DEFAULT_PHILOSOPHY[philosophyIdx].title}
                </div>
                <div className="text-sm text-zinc-400 mt-3 leading-relaxed">
                  {DEFAULT_PHILOSOPHY[philosophyIdx].body}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-1 mt-3">
            {DEFAULT_PHILOSOPHY.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i === philosophyIdx ? 'bg-indigo-500' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Before / After showcase */}
        {showcase && showcase.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 flex flex-col gap-4">
            <div className="text-[10px] font-mono text-zinc-600 tracking-widest">
              BEFORE / AFTER · REAL MASTERS
            </div>
            {showcase.map((s, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="text-xs font-mono text-zinc-400">{s.label}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[9px] font-mono text-zinc-600 mb-1">BEFORE</div>
                    <video
                      src={s.before}
                      controls
                      preload="metadata"
                      className="w-full rounded border border-zinc-900 bg-black aspect-video"
                    />
                  </div>
                  <div>
                    <div className="text-[9px] font-mono text-emerald-500 mb-1">AFTER</div>
                    <video
                      src={s.after}
                      controls
                      preload="metadata"
                      className="w-full rounded border border-zinc-900 bg-black aspect-video"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
