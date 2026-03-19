'use client';

import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';

export default function MasteringScreen() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 max-w-md mx-auto">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-t-2 border-emerald-500/30 w-32 h-32 -m-4"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-b-2 border-teal-500/30 w-32 h-32 -m-4"
        />
        <div className="w-24 h-24 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)] relative z-10">
          <Zap className="w-10 h-10 text-emerald-400" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-mono font-bold tracking-tight text-white flex items-center justify-center gap-3">
          MASTERING <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        </h2>
        <p className="text-sm text-zinc-400 font-mono">
          RENDITION_DSP Engine v2 is applying the 14-stage mastering chain with self-correction convergence.
        </p>
      </div>

      <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"
          initial={{ width: '0%', x: '-100%' }}
          animate={{ width: '100%', x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
