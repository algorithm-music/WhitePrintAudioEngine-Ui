'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const SAGES = [
  { name: 'GRAMMATICA', color: 'text-blue-400', bg: 'bg-blue-500', ring: 'ring-blue-500/30', vendor: 'OpenAI' },
  { name: 'LOGICA', color: 'text-emerald-400', bg: 'bg-emerald-500', ring: 'ring-emerald-500/30', vendor: 'Anthropic' },
  { name: 'RHETORICA', color: 'text-amber-400', bg: 'bg-amber-500', ring: 'ring-amber-500/30', vendor: 'Google' },
];

const MESSAGES = [
  { sage: 0, text: 'Analyzing spectral balance and frequency distribution...' },
  { sage: 1, text: 'Evaluating dynamic range and compression needs...' },
  { sage: 2, text: 'Assessing stereo image and spatial characteristics...' },
  { sage: 0, text: 'Proposing EQ curve: gentle high-shelf boost at 10kHz...' },
  { sage: 1, text: 'Suggesting multiband compression ratios per section...' },
  { sage: 2, text: 'Recommending saturation warmth for low-mid range...' },
  { sage: 0, text: 'Reviewing peer proposals for conflicts...' },
  { sage: 1, text: 'Voting on consensus parameters...' },
  { sage: 2, text: 'Validating final parameter set against target LUFS...' },
  { sage: 0, text: 'Consensus reached. Preparing adopted parameters...' },
];

export default function DeliberatingScreen({ error }: { error?: string | null }) {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [activeSage, setActiveSage] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < MESSAGES.length) {
        setVisibleMessages((prev) => [...prev, i]);
        setActiveSage(MESSAGES[i].sage);
        i++;
      } else {
        // Loop back
        i = 0;
        setVisibleMessages([]);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-lg mx-auto">
      {/* Three AI Nodes */}
      <div className="flex items-center justify-center gap-8">
        {SAGES.map((sage, idx) => (
          <motion.div
            key={sage.name}
            className="flex flex-col items-center gap-2"
            animate={{
              scale: activeSage === idx ? 1.1 : 0.95,
              opacity: activeSage === idx ? 1 : 0.5,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className={`relative w-16 h-16 rounded-full border-2 ${
              activeSage === idx ? 'border-current ring-4 ' + sage.ring : 'border-zinc-700'
            } ${sage.color} flex items-center justify-center bg-zinc-900`}>
              <span className="text-lg font-bold">{sage.name.charAt(0)}</span>
              {activeSage === idx && (
                <motion.div
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${sage.bg}`}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>
            <div className="text-[10px] font-mono text-zinc-500">{sage.name}</div>
            <div className="text-[9px] text-zinc-600">{sage.vendor}</div>
          </motion.div>
        ))}
      </div>

      {/* Connection lines pulse */}
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-indigo-500"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      {/* Chat-like message feed */}
      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 h-48 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-zinc-950 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-zinc-950 to-transparent z-10" />

        <div className="flex flex-col justify-end h-full space-y-2 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {visibleMessages.slice(-5).map((msgIdx) => {
              const msg = MESSAGES[msgIdx];
              if (!msg) return null;
              const sage = SAGES[msg.sage];
              if (!sage) return null;
              return (
                <motion.div
                  key={`${msgIdx}-${Math.floor(visibleMessages.length / MESSAGES.length)}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-2 text-xs font-mono"
                >
                  <span className={`${sage.color} font-bold shrink-0`}>{sage.name.slice(0, 4)}</span>
                  <span className="text-zinc-400">{msg.text}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-[10px] font-mono text-zinc-600">
          <span>DELIBERATION IN PROGRESS</span>
          <span>{Math.min(visibleMessages.length, MESSAGES.length)}/{MESSAGES.length} steps</span>
        </div>
        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500"
            animate={{ width: `${Math.min((visibleMessages.length / MESSAGES.length) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
