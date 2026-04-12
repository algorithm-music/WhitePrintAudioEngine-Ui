'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const DSP_STAGES = [
  { name: 'GAIN STAGING', icon: '▲', desc: 'Normalizing input level' },
  { name: 'DC OFFSET', icon: '〰', desc: 'Removing DC bias' },
  { name: 'HIGH-PASS', icon: '⌇', desc: 'Filtering sub-bass rumble' },
  { name: 'PARAMETRIC EQ', icon: '≋', desc: 'Applying frequency corrections' },
  { name: 'DYNAMIC EQ', icon: '⟿', desc: 'Adaptive tonal balance' },
  { name: 'MULTIBAND COMP', icon: '▥', desc: 'Per-band dynamics control' },
  { name: 'BUS COMP', icon: '◈', desc: 'Glue compression' },
  { name: 'SATURATION', icon: '♨', desc: 'Harmonic warmth' },
  { name: 'STEREO WIDTH', icon: '◇', desc: 'Spatial enhancement' },
  { name: 'MID/SIDE', icon: '⬡', desc: 'M/S matrix processing' },
  { name: 'TRUE PEAK LIMIT', icon: '█', desc: 'Ceiling enforcement' },
  { name: 'LUFS TARGET', icon: '◉', desc: 'Loudness convergence' },
  { name: 'DITHER', icon: '░', desc: 'Noise shaping' },
  { name: 'VERIFY', icon: '✓', desc: 'Self-correction check' },
];

export default function MasteringScreen({ error }: { error?: string | null }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [loop, setLoop] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= DSP_STAGES.length - 1) {
          setLoop((l) => l + 1);
          return 0;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const progress = ((currentStage + 1) / DSP_STAGES.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-mono font-bold tracking-tight text-white">
          RENDITION_DSP v2
        </h2>
        <div className="flex items-center justify-center gap-3 text-xs text-zinc-500 font-mono">
          <span>14-STAGE CHAIN</span>
          <span>•</span>
          <span>{loop > 0 ? `CONVERGENCE LOOP ${loop}` : 'INITIAL PASS'}</span>
          <span>•</span>
          <span className="text-zinc-400 tabular-nums">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</span>
        </div>
        {elapsed > 30 && (
          <p className="text-[10px] text-zinc-600 font-mono mt-1">
            Processing audio with self-correction — this may take 2-5 minutes
          </p>
        )}
        {elapsed > 60 && (
          <p className="text-[10px] text-red-400/70 font-mono mt-0.5">
            ⚠ Do not close this tab. Mastering runs in your browser session.
          </p>
        )}
      </div>

      {/* Signal Chain Visualization */}
      <div className="w-full grid grid-cols-7 gap-1.5">
        {DSP_STAGES.map((stage, idx) => {
          const isActive = idx === currentStage;
          const isDone = idx < currentStage || (loop > 0 && idx < currentStage);
          const isPending = idx > currentStage;

          return (
            <motion.div
              key={stage.name}
              className={`relative rounded-lg border p-2 flex flex-col items-center justify-center min-h-[56px] transition-colors ${
                isActive
                  ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                  : isDone
                    ? 'border-emerald-800/50 bg-emerald-900/10'
                    : 'border-zinc-800/50 bg-zinc-950'
              }`}
              animate={isActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.6, repeat: isActive ? Infinity : 0 }}
            >
              <span className={`text-base leading-none ${
                isActive ? 'text-emerald-400' : isDone ? 'text-emerald-600' : 'text-zinc-700'
              }`}>
                {isDone && !isActive ? '✓' : stage.icon}
              </span>
              <span className={`text-[7px] font-mono mt-1 leading-tight text-center ${
                isActive ? 'text-emerald-300' : isDone ? 'text-emerald-700' : 'text-zinc-600'
              }`}>
                {stage.name.split(' ')[0]}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Active Stage Detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="h-12 flex flex-col items-center justify-center"
        >
          <div className="text-sm font-mono text-emerald-400 font-bold">
            [{String(currentStage + 1).padStart(2, '0')}/14] {DSP_STAGES[currentStage].name}
          </div>
          <div className="text-xs text-zinc-500 font-mono mt-1">
            {DSP_STAGES[currentStage].desc}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Signal Flow Line */}
      <div className="w-full space-y-2">
        <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-zinc-600">
          <span>INPUT</span>
          <span>{Math.round(progress)}%</span>
          <span>OUTPUT</span>
        </div>
      </div>

      {/* Waveform Animation */}
      <div className="w-full h-10 flex items-center justify-center gap-[2px]">
        {Array.from({ length: 48 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-[3px] rounded-full bg-emerald-500/40"
            animate={{
              height: [
                4 + ((i * 3) % 8),
                8 + ((i * 7) % 24),
                4 + ((i * 5) % 8),
              ],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 0.8 + ((i * 11) % 6) * 0.1,
              repeat: Infinity,
              delay: i * 0.03,
            }}
          />
        ))}
      </div>
    </div>
  );
}
