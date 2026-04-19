'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import MarketingHeader from '@/components/layout/marketing-header';
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileAudio,
  ListMusic,
  Upload,
  X,
} from 'lucide-react';
import { postMaster, uploadToGCS, ApiError } from '@/lib/api-client';

type Job = {
  id: string;
  input_file_name: string | null;
  input_gcs_path: string | null;
  output_url: string | null;
  status: string;
  route: string | null;
  lufs_before: number | null;
  lufs_after: number | null;
  true_peak_before: number | null;
  true_peak_after: number | null;
  bpm: number | null;
  duration_sec: number | null;
  created_at: string;
  completed_at: string | null;
};

/**
 * A "run" is an in-flight /api/master call started from this tab. We don't
 * poll the backend — /api/master blocks until mastering finishes — but we
 * never force the user onto a loading screen. Instead a compact row sits at
 * the top of the jobs list with a spinner + filename; the user can keep
 * browsing. When the fetch resolves we trigger a download and prepend the
 * finished job to the list.
 */
interface LocalRun {
  localId: string;
  filename: string;
  startedAt: number;
  error?: string;
  downloadUrl?: string;
  status: 'uploading' | 'processing' | 'done' | 'error';
}

const ACCEPTED_EXT = ['.wav', '.flac', '.aiff', '.aif', '.mp3'];

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [runs, setRuns] = useState<LocalRun[]>([]);
  const runsRef = useRef<LocalRun[]>([]);
  runsRef.current = runs;

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login?redirect=/app';
        return;
      }
      setAuthed(true);
      const { data } = await supabase
        .from('jobs')
        .select('id, input_gcs_path, input_file_name, output_url, status, route, lufs_before, lufs_after, true_peak_before, true_peak_after, bpm, duration_sec, created_at, completed_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      setJobs(data || []);
      setLoadingJobs(false);
    })();
  }, []);

  const refreshJobs = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('jobs')
      .select('id, input_gcs_path, input_file_name, output_url, status, route, lufs_before, lufs_after, true_peak_before, true_peak_after, bpm, duration_sec, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    setJobs(data || []);
  }, []);

  const updateRun = useCallback((id: string, patch: Partial<LocalRun>) => {
    setRuns((prev) => prev.map((r) => (r.localId === id ? { ...r, ...patch } : r)));
  }, []);

  const dismissRun = useCallback((id: string) => {
    setRuns((prev) => prev.filter((r) => r.localId !== id));
  }, []);

  const startRun = useCallback(async (file: File) => {
    const localId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setRuns((prev) => [
      { localId, filename: file.name, startedAt: Date.now(), status: 'uploading' },
      ...prev,
    ]);

    try {
      const gcsUrl = await uploadToGCS(file);
      updateRun(localId, { status: 'processing' });

      type Resp = { route: string; download_url: string };
      const resp = await postMaster<Resp>({
        audio_url: gcsUrl,
        route: 'full',
      });

      updateRun(localId, { status: 'done', downloadUrl: resp.download_url });

      // Auto-download the finished WAV. No screen transition, no ceremony.
      if (resp.download_url && typeof document !== 'undefined') {
        const a = document.createElement('a');
        a.href = resp.download_url;
        a.download = file.name.replace(/\.[^.]+$/, '') + '-mastered.wav';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      void refreshJobs();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'unknown error';
      updateRun(localId, { status: 'error', error: msg });
    }
  }, [refreshJobs, updateRun]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach((f) => void startRun(f));
  }, [startRun]);

  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((f) => void startRun(f));
    e.target.value = '';
  }, [startRun]);

  if (!authed) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center">
        <div className="w-6 h-6 rounded bg-indigo-500 animate-pulse" />
      </main>
    );
  }

  const activeRuns = runs.filter((r) => r.status === 'uploading' || r.status === 'processing');

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-indigo-500/30">
      <MarketingHeader>
        {activeRuns.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 px-3 py-1.5 rounded border border-indigo-500/40 bg-indigo-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {activeRuns.length} processing
          </div>
        )}
        <Link
          href="/app/history"
          className="text-xs font-mono text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded border border-zinc-800 hover:border-zinc-600"
        >
          [ HISTORY ]
        </Link>
      </MarketingHeader>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* NEW MASTER — drop zone, no ceremony */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono text-zinc-600 tracking-widest">NEW MASTER</div>
              <div className="text-lg font-semibold">Upload and go.</div>
              <div className="text-xs font-mono text-zinc-500 mt-0.5">
                You don&apos;t have to watch — the run finishes in the background and downloads itself when done.
              </div>
            </div>
            <div className="text-xs font-mono text-zinc-500">
              WAV · FLAC · AIFF · MP3
            </div>
          </div>

          <label
            htmlFor="dash-file-input"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-950 py-8 px-6 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-colors"
          >
            <Upload className="w-5 h-5 text-zinc-600" />
            <div className="text-sm text-zinc-300">
              Drag files here, or <span className="text-indigo-400 underline">click to pick</span>
            </div>
            <input
              id="dash-file-input"
              type="file"
              accept={ACCEPTED_EXT.join(',')}
              multiple
              className="hidden"
              onChange={onPick}
            />
          </label>
        </section>

        {/* RUN LIST — fire-and-forget pipeline status, inline with history */}
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-zinc-500" />
              <div className="text-sm font-semibold">Recent masters</div>
              <div className="text-xs font-mono text-zinc-600">
                {loadingJobs ? 'loading…' : `${jobs.length} tracks`}
              </div>
            </div>
            <Link
              href="/app/history"
              className="text-xs font-mono text-zinc-500 hover:text-zinc-200 flex items-center gap-1"
            >
              full history <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 divide-y divide-zinc-900">
            {/* Active runs pinned on top */}
            <AnimatePresence initial={false}>
              {runs.map((r) => {
                const spin = r.status === 'uploading' || r.status === 'processing';
                const doneColor =
                  r.status === 'done'
                    ? 'text-emerald-400'
                    : r.status === 'error'
                      ? 'text-red-400'
                      : 'text-indigo-400';
                return (
                  <motion.div
                    key={r.localId}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-4 px-4 py-3 text-sm bg-zinc-950/60"
                  >
                    {spin ? (
                      <div className="w-4 h-4 shrink-0 rounded-full border border-indigo-400/50 border-t-indigo-400 animate-spin" />
                    ) : r.status === 'done' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Activity className="w-4 h-4 shrink-0 text-red-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-zinc-200">{r.filename}</div>
                      <div className={`text-[10px] font-mono mt-0.5 ${doneColor}`}>
                        {r.status === 'uploading' && 'uploading…'}
                        {r.status === 'processing' && 'mastering (running in background)'}
                        {r.status === 'done' && 'done · downloaded'}
                        {r.status === 'error' && `error · ${r.error}`}
                      </div>
                    </div>
                    {r.status === 'done' && r.downloadUrl && (
                      <a
                        href={r.downloadUrl}
                        download={r.filename.replace(/\.[^.]+$/, '') + '-mastered.wav'}
                        className="flex items-center gap-1 text-xs font-mono text-emerald-400 hover:text-emerald-300 shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        download again
                      </a>
                    )}
                    {(r.status === 'done' || r.status === 'error') && (
                      <button
                        onClick={() => dismissRun(r.localId)}
                        className="text-zinc-600 hover:text-zinc-300 shrink-0"
                        aria-label="dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Historical jobs from Supabase Postgres */}
            {loadingJobs ? (
              <div className="h-24 animate-pulse" />
            ) : jobs.length === 0 && runs.length === 0 ? (
              <div className="text-zinc-500 text-sm p-6 text-center">
                No masters yet — drop a track above.
              </div>
            ) : (
              jobs.slice(0, 12).map((j) => {
                const done = j.status === 'completed';
                const Icon = done ? CheckCircle2 : j.status === 'failed' ? Activity : Clock;
                const color = done
                  ? 'text-emerald-400'
                  : j.status === 'failed'
                    ? 'text-red-400'
                    : 'text-amber-400';
                const title = j.input_file_name || `TRACK-${j.id.substring(0, 8).toUpperCase()}`;
                return (
                  <div key={j.id} className="flex items-center gap-4 px-4 py-3 text-sm">
                    <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-zinc-200">{title}</div>
                      <div className="text-[10px] font-mono text-zinc-600 mt-0.5">
                        {new Date(j.created_at).toLocaleString()}
                        {j.lufs_after != null ? ` · ${j.lufs_after} LUFS` : ''}
                        {j.true_peak_after != null ? ` · ${j.true_peak_after} dBTP` : ''}
                        {j.bpm ? ` · ${j.bpm} BPM` : ''}
                      </div>
                    </div>
                    {done && j.output_url && (
                      <a
                        href={j.output_url}
                        download
                        className="flex items-center gap-1 text-xs font-mono text-emerald-400 hover:text-emerald-300 shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        download
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Pointer to the narrative flow for new users. */}
        <div className="text-center text-[11px] font-mono text-zinc-600">
          First time?&nbsp;
          <Link href="/" className="text-zinc-400 hover:text-zinc-200 underline">
            See the full pipeline
          </Link>
          &nbsp;— every step, once. Repeat masters happen right here, no loading screen.
        </div>
      </div>
    </main>
  );
}

// (FileAudio imported above is kept for possible future per-run file icons.)
void FileAudio;
