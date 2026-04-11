'use client';

import type { MasteringResult } from '@/types/mastering';
import { motion } from 'framer-motion';
import { Download, Zap, CheckCircle2, Activity, Volume2, Maximize } from 'lucide-react';
import ABPlayer from './ab-player';

interface MasteringDashboardProps {
  data: MasteringResult;
  audioUrl: string | null;
}

export default function MasteringDashboard({ data, audioUrl }: MasteringDashboardProps) {
  const { metrics } = data;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-mono font-bold text-white flex items-center gap-3">
          <Zap className="w-6 h-6 text-emerald-400" />
          MASTERING_COMPLETE
        </h2>
        <div className="flex items-center gap-4">
          <a
            href={data.download_url}
            download
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD MASTER
          </a>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Status Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-400 mb-1">Processing Successful</h3>
            <p className="text-sm text-emerald-400/80">
              Engine {metrics.engine_version} converged in {metrics.convergence_loops} loops with a gain adjustment of {metrics.gain_adjustment_db > 0 ? '+' : ''}{metrics.gain_adjustment_db} dB.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ComparisonBox 
            label="Integrated LUFS" 
            before={`${metrics.lufs_before} LUFS`} 
            after={`${metrics.lufs_after} LUFS`} 
            target={`${metrics.target_lufs} LUFS`}
            icon={<Volume2 className="w-4 h-4" />}
          />
          <ComparisonBox 
            label="True Peak" 
            before={`${metrics.true_peak_before} dBTP`} 
            after={`${metrics.true_peak_after} dBTP`} 
            target={`${metrics.target_true_peak} dBTP`}
            icon={<Maximize className="w-4 h-4" />}
          />
          <MetricBox 
            label="Dynamic Range" 
            value={`${metrics.dynamic_range_after} dB`} 
            icon={<Activity className="w-4 h-4" />}
          />
          <MetricBox 
            label="Gain Adjustment" 
            value={`${metrics.gain_adjustment_db > 0 ? '+' : ''}${metrics.gain_adjustment_db} dB`} 
            icon={<Zap className="w-4 h-4" />}
          />
        </div>

        {/* High-Fidelity A/B Player */}
        <ABPlayer audioUrl={audioUrl} masteredUrl={data.download_url} />
      </motion.div>
    </div>
  );
}

function ComparisonBox({ label, before, after, target, icon }: { label: string; before: string; after: string; target: string; icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col">
      <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        {icon} {label}
      </h3>
      <div className="flex items-end justify-between mt-auto">
        <div className="space-y-1">
          <div className="text-[10px] font-mono text-zinc-500 uppercase">Before</div>
          <div className="text-sm font-mono text-zinc-400">{before}</div>
        </div>
        <div className="text-zinc-600 mb-1">→</div>
        <div className="space-y-1 text-right">
          <div className="text-[10px] font-mono text-emerald-500 uppercase">After</div>
          <div className="text-lg font-mono font-bold text-emerald-400">{after}</div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-zinc-800/50 flex justify-between items-center text-[10px] font-mono">
        <span className="text-zinc-500">TARGET</span>
        <span className="text-zinc-300">{target}</span>
      </div>
    </div>
  );
}

function MetricBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col">
      <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        {icon} {label}
      </h3>
      <div className="text-2xl font-mono font-bold text-zinc-100 mt-auto">
        {value}
      </div>
    </div>
  );
}
