'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlayCircle, Clock, Zap, ExternalLink, CheckCircle2, AlertCircle, Activity, FileAudio, Music, Terminal, ChevronDown, ChevronRight, Volume2, Download } from 'lucide-react';
import HeroUrlInput from '@/components/marketing/hero-url-input';
import ABPlayer from '@/components/ab-player';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

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
  created_at: string;
  completed_at: string | null;
  consensus_opinions: Record<string, unknown> | null;
  analysis_data: Record<string, unknown> | null;
  output_url: string | null;
  output_gcs_path: string | null;
};

type AuthDashboardContentProps = {
  user: User;
  onSubmit: (url: string) => void;
  error?: string | null;
};

export default function AuthDashboardContent({ user, onSubmit, error }: AuthDashboardContentProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [howToTab, setHowToTab] = useState<'gui' | 'cli'>('gui');

  useEffect(() => {
    async function loadHistory() {
      const supabase = createClient();
      const { data } = await supabase
        .from('jobs')
        .select('id, input_gcs_path, input_file_name, status, route, lufs_before, lufs_after, true_peak_before, true_peak_after, bpm, musical_key, duration_sec, created_at, completed_at, consensus_opinions, analysis_data, output_url, output_gcs_path')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setJobs(data || []);
      setHistoryLoading(false);
    }
    loadHistory();
  }, [user.id]);

  const formatDuration = (sec: number | null) => {
    if (!sec) return '--:--';
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getDisplayName = (job: Job) => {
    const raw = job.input_file_name || '';
    if (!raw || raw.toLowerCase() === 'view' || raw.toLowerCase() === 'uc') {
      return `TRACK-${job.id.substring(0, 8).toUpperCase()}`;
    }
    return raw;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400';
      case 'failed': return 'text-red-400';
      default: return 'text-amber-400';
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-zinc-100 flex flex-col pt-8 pb-20 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto px-6 w-full space-y-10">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">{user.email?.split('@')[0]}</span>
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-1">Ready to master your next session?</p>
        </div>

        {/* Main action: URL input */}
        <div className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <PlayCircle className="w-4 h-4 text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-white">New Master</h2>
            </div>
            <HeroUrlInput onSubmit={onSubmit} />
            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-3 text-left">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Two-column: History + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* History (main column) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Recent Sessions
              </h3>
              <Link href="/app/history" className="text-xs font-mono text-zinc-500 hover:text-indigo-400 transition-colors">
                View All
              </Link>
            </div>

            {historyLoading ? (
              <div className="py-12 flex justify-center">
                <div className="w-5 h-5 rounded bg-indigo-500 animate-pulse" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-zinc-800/40 bg-zinc-900/20">
                <p className="text-zinc-500 text-sm font-mono">No sessions yet. Paste a URL above to start.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <div key={job.id} className="rounded-xl border border-zinc-800/40 bg-zinc-950/30 overflow-hidden">
                    {/* Row */}
                    <button
                      onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-zinc-900/50 transition-colors text-left"
                    >
                      {expandedJob === job.id
                        ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-200 truncate">{getDisplayName(job)}</span>
                          <span className={`text-[10px] font-mono font-bold ${statusColor(job.status)}`}>
                            {job.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileAudio className="w-3 h-3" />
                            {formatDuration(job.duration_sec)}
                          </span>
                          {job.bpm && <span>{Math.round(Number(job.bpm))} BPM</span>}
                          {job.musical_key && (
                            <span className="flex items-center gap-1">
                              <Music className="w-3 h-3" />
                              {job.musical_key}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* LUFS change */}
                      {job.lufs_before != null && job.lufs_after != null && (
                        <div className="hidden md:flex items-center gap-2 font-mono text-xs shrink-0">
                          <span className="text-zinc-500">{Number(job.lufs_before).toFixed(1)}</span>
                          <span className="text-zinc-600">&rarr;</span>
                          <span className="text-emerald-400 font-bold">{Number(job.lufs_after).toFixed(1)} LUFS</span>
                        </div>
                      )}
                    </button>

                    {/* Expanded detail */}
                    {expandedJob === job.id && (
                      <div className="px-4 pb-4 pt-0 border-t border-zinc-800/40">
                        <div className="grid gap-4 sm:grid-cols-2 mt-4">
                          {/* Analysis summary */}
                          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/30">
                            <h4 className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Analysis</h4>
                            <div className="space-y-1 text-xs font-mono text-zinc-300">
                              {job.lufs_before != null && <div>LUFS: {Number(job.lufs_before).toFixed(1)}</div>}
                              {job.true_peak_before != null && <div>True Peak: {Number(job.true_peak_before).toFixed(2)} dBTP</div>}
                              {job.bpm && <div>BPM: {Math.round(Number(job.bpm))}</div>}
                              {job.musical_key && <div>Key: {job.musical_key}</div>}
                              {job.duration_sec && <div>Duration: {formatDuration(job.duration_sec)}</div>}
                            </div>
                          </div>

                          {/* Mastering result */}
                          {job.lufs_after != null ? (
                            <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/30">
                              <h4 className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Mastering Result</h4>
                              <div className="space-y-1 text-xs font-mono text-zinc-300">
                                <div className="flex justify-between">
                                  <span className="text-zinc-500">LUFS</span>
                                  <span>{Number(job.lufs_before).toFixed(1)} &rarr; <span className="text-emerald-400 font-bold">{Number(job.lufs_after).toFixed(1)}</span></span>
                                </div>
                                {job.true_peak_after != null && (
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">True Peak</span>
                                    <span>{Number(job.true_peak_before).toFixed(2)} &rarr; <span className="text-emerald-400 font-bold">{Number(job.true_peak_after).toFixed(2)} dBTP</span></span>
                                  </div>
                                )}
                                {job.completed_at && (
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">Completed</span>
                                    <span>{new Date(job.completed_at).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/30 flex items-center justify-center">
                              <span className="text-xs text-zinc-600 font-mono">
                                {job.status === 'failed' ? 'Mastering failed' : 'Analysis only'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* A/B Player */}
                        {job.status === 'completed' && (job.output_gcs_path || job.output_url) && (() => {
                          const masteredUrl = job.output_gcs_path
                            ? `/api/download?path=${encodeURIComponent(job.output_gcs_path)}`
                            : (job.output_url || '');
                          const downloadHref = job.output_gcs_path
                            ? `/api/download?path=${encodeURIComponent(job.output_gcs_path)}&filename=${encodeURIComponent(getDisplayName(job).replace(/\.[^.]+$/, '') + '-mastered.wav')}`
                            : (job.output_url || '');
                          return (
                            <div className="mt-4 space-y-3">
                              <ABPlayer audioUrl={job.input_gcs_path} masteredUrl={masteredUrl} />
                              <div className="flex justify-end">
                                <a
                                  href={downloadHref}
                                  download
                                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-white rounded-lg transition-colors bg-emerald-600 hover:bg-emerald-500"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download Master
                                </a>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Consensus opinions (deliberation log) */}
                        {job.consensus_opinions && (
                          <div className="mt-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/30">
                            <h4 className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Deliberation Log</h4>
                            <pre className="text-[11px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                              {JSON.stringify(job.consensus_opinions, null, 2)}
                            </pre>
                          </div>
                        )}

                        {job.status === 'failed' && (
                          <p className="mt-3 text-xs text-red-400/70 font-mono">Session failed. No mastering output.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan */}
            <div className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-950/50">
              <h3 className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-2">Current Plan</h3>
              <div className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-2">
                Early Access Beta
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <ul className="mt-4 space-y-2 text-xs text-zinc-400">
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500" /> Unlimited Analyses</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500" /> 3-Agent Deliberation</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-emerald-500" /> WAV 44.1k / 48kHz</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-zinc-800/60">
                <Link href="/pricing" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center justify-between group">
                  UPGRADE
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* How to use — GUI / CLI tabs */}
            <div className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-900/20">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  How to Use
                </h3>
                <div className="flex rounded-md border border-zinc-800 overflow-hidden ml-auto">
                  <button
                    onClick={() => setHowToTab('gui')}
                    className={`px-2.5 py-1 text-[10px] font-mono transition-colors ${howToTab === 'gui' ? 'bg-indigo-600/20 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    GUI
                  </button>
                  <button
                    onClick={() => setHowToTab('cli')}
                    className={`px-2.5 py-1 text-[10px] font-mono transition-colors ${howToTab === 'cli' ? 'bg-emerald-600/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    CLI
                  </button>
                </div>
              </div>

              {howToTab === 'gui' ? (
                <ol className="space-y-2.5 text-xs text-zinc-400">
                  <li>
                    <span className="text-indigo-400 font-mono font-bold mr-1.5">01</span>
                    Upload <code className="text-zinc-300">.wav</code> to Google Drive
                    <span className="block text-[10px] text-zinc-600 mt-0.5 ml-5">Set sharing to &quot;Anyone with the link&quot;</span>
                  </li>
                  <li>
                    <span className="text-indigo-400 font-mono font-bold mr-1.5">02</span>
                    Paste the URL above
                  </li>
                  <li>
                    <span className="text-indigo-400 font-mono font-bold mr-1.5">03</span>
                    3 AIs deliberate, then download your master
                  </li>
                </ol>
              ) : (
                <div className="space-y-3">
                  <pre className="px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-emerald-400/80 overflow-x-auto whitespace-pre leading-relaxed">
{`curl -X POST \\
  https://concertmaster.aimastering.tech\\
/api/v1/jobs/master \\
  -H "X-Api-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"audio_url":"URL",
       "route":"full"}' \\
  -o mastered.wav`}
                  </pre>
                  <div className="flex items-center justify-between">
                    <Link href="/developers/docs/quickstart" className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300">
                      Full API Docs →
                    </Link>
                    <Link href="/app/settings" className="text-[10px] font-mono text-emerald-400/70 hover:text-emerald-300">
                      Get API Key →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
