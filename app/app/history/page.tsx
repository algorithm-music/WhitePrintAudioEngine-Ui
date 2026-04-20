'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import MarketingHeader from '@/components/layout/marketing-header';
import { PlayCircle, Clock, Activity, FileAudio, AlertCircle, CheckCircle2, ChevronRight, ChevronDown, Music, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ABPlayer from '@/components/ab-player';

type Job = {
  id: string;
  input_file_name: string | null;
  input_gcs_path: string | null;
  status: string;
  route: string | null;
  lufs_before: number | null;
  lufs_after: number | null;
  true_peak_before: number | null;
  true_peak_after: number | null;
  bpm: number | null;
  musical_key: string | null;
  duration_sec: number | null;
  output_url: string | null;
  output_gcs_path: string | null;
  created_at: string;
  completed_at: string | null;
};

export default function HistoryPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login?redirect=/app/history';
        return;
      }

      const { data } = await supabase
        .from('jobs')
        .select('id, input_gcs_path, input_file_name, status, route, lufs_before, lufs_after, true_peak_before, true_peak_after, bpm, musical_key, duration_sec, created_at, completed_at, output_url, output_gcs_path')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setJobs(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const formatDuration = (sec: number | null) => {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case 'completed': 
        return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 };
      case 'failed': 
        return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle };
      case 'cancelled': 
        return { color: 'text-zinc-500', bg: 'bg-zinc-800/50', border: 'border-zinc-800', icon: Clock };
      default: 
        return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Activity };
    }
  };

  const getDisplayName = (job: Job) => {
    const raw = job.input_file_name || '';
    if (!raw || raw.toLowerCase() === 'view' || raw.toLowerCase() === 'uc') {
      return `TRACK-${job.id.substring(0, 8).toUpperCase()}`;
    }
    return raw;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center">
        <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-indigo-500/30">
      <MarketingHeader>
        <Link href="/" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded border border-zinc-800 hover:border-zinc-600">
          [ DASHBOARD ]
        </Link>
      </MarketingHeader>

      <div className="max-w-5xl mx-auto px-6 py-12 pb-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Mastering History</h1>
            <p className="text-sm text-zinc-400 font-mono mt-1">Archive of your acoustic sessions</p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/20 rounded-2xl border border-zinc-800/50">
            <p className="text-zinc-500 font-mono mb-4 text-sm">NO_JOBS_FOUND</p>
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
              Initialize first session <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {jobs.map((job, idx) => {
                const config = statusConfig(job.status);
                const Icon = config.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={job.id}
                    className="group relative rounded-xl border border-zinc-800/50 bg-zinc-950/50 overflow-hidden transition-all duration-300"
                  >
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <button
                      onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                      className="relative w-full p-5 text-left"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-6">

                        {/* Left: Identity */}
                        <div className="flex-1 min-w-0 flex items-start gap-4">
                          <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bg} ${config.border} border`}>
                            {expandedJob === job.id
                              ? <ChevronDown className={`w-4 h-4 ${config.color}`} />
                              : <Icon className={`w-4 h-4 ${config.color}`} />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-zinc-200 truncate group-hover:text-indigo-300 transition-colors">
                                {getDisplayName(job)}
                              </h3>
                              <span className="text-[10px] uppercase font-mono text-zinc-600 border border-zinc-800 px-1.5 py-0.5 rounded">
                                {job.route || 'ANALYSIS'}
                              </span>
                            </div>

                            {/* Metadata row */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-zinc-500 font-mono">
                              <span className="flex items-center gap-1.5 text-zinc-400">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(job.created_at).toLocaleDateString()} {new Date(job.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <FileAudio className="w-3.5 h-3.5" />
                                {formatDuration(job.duration_sec)}
                              </span>
                              {job.bpm && (
                                <span className="flex items-center gap-1.5">
                                  <Activity className="w-3.5 h-3.5" />
                                  {Math.round(Number(job.bpm))} BPM
                                </span>
                              )}
                              {job.musical_key && (
                                <span className="flex items-center gap-1.5">
                                  <Music className="w-3.5 h-3.5" />
                                  {job.musical_key}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Middle: Metrics Change (if applicable) */}
                        {job.lufs_before != null && job.lufs_after != null && (
                          <div className="hidden lg:flex items-center gap-6 px-6 border-l border-zinc-800">
                            <div>
                              <div className="text-[10px] text-zinc-500 font-mono mb-1">LUFS</div>
                              <div className="flex items-baseline gap-2 font-mono">
                                <span className="text-zinc-400">{Number(job.lufs_before).toFixed(1)}</span>
                                <span className="text-zinc-600 text-xs">&rarr;</span>
                                <span className="text-zinc-200 font-semibold">{Number(job.lufs_after).toFixed(1)}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 font-mono mb-1">TP (dBTP)</div>
                              <div className="flex items-baseline gap-2 font-mono">
                                <span className="text-zinc-400">{Number(job.true_peak_before).toFixed(2)}</span>
                                <span className="text-zinc-600 text-xs">&rarr;</span>
                                <span className="text-zinc-200 font-semibold">{Number(job.true_peak_after).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Right: Status */}
                        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-4 md:pt-0 border-t border-zinc-800 md:border-0 mt-2 md:mt-0">
                          <div className={`text-[11px] font-bold font-mono tracking-wider ${config.color}`}>
                            {job.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded: A/B Player + Actions */}
                    {expandedJob === job.id && (
                      <div className="relative px-5 pb-5 pt-0 border-t border-zinc-800/50 space-y-4">
                        {(job.output_gcs_path || job.output_url) && (
                          <div className="pt-4">
                            <ABPlayer 
                              audioUrl={job.input_gcs_path} 
                              masteredUrl={job.output_gcs_path ? `/api/download?path=${encodeURIComponent(job.output_gcs_path)}` : (job.output_url || '')} 
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-3 pt-2">
                          {(job.output_gcs_path || job.output_url) && (
                            <a
                              href={job.output_gcs_path ? `/api/download?path=${encodeURIComponent(job.output_gcs_path)}` : (job.output_url || '')}
                              download
                              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-white rounded-lg transition-colors bg-emerald-600 hover:bg-emerald-500"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download Master
                            </a>
                          )}
                          {job.input_gcs_path && (
                            <Link
                              href={`/?url=${encodeURIComponent(job.input_gcs_path)}`}
                              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-white bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-500/50 rounded-lg transition-all"
                            >
                              <PlayCircle className="w-4 h-4 text-indigo-400" />
                              Re-master
                            </Link>
                          )}
                        </div>
                        {!(job.output_gcs_path || job.output_url) && job.status === 'completed' && (
                          <p className="text-xs text-zinc-600 font-mono">Analysis only — no mastered audio available.</p>
                        )}
                        {job.status === 'failed' && (
                          <p className="text-xs text-red-400/70 font-mono pt-2">Session failed. No mastering output.</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
