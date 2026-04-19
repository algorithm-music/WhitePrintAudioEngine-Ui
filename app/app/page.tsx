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
  ListMusic,
  Upload,
  X,
} from 'lucide-react';
import { submitMasterJob, pollJob, uploadToGCS, ApiError } from '@/lib/api-client';
import ABPlayer from '@/components/ab-player';

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
 * A "run" is an in-flight mastering job started from this tab. /api/master
 * now returns a job_id immediately (202); the UI polls /api/jobs/{id} every
 * 3 s. A compact row sits at the top of the jobs list with an elapsed
 * counter that morphs into a DOWNLOAD button the moment polling flips
 * status to `completed`. The user can keep browsing while it cooks.
 */
interface LocalRun {
  localId: string;
  filename: string;
  startedAt: number;
  /** Running wall-clock seconds since startedAt; flips to a download button on done. */
  elapsed: number;
  error?: string;
  /** Signed GET URL to the original upload (for the AB player's A side). */
  inputUrl?: string;
  /** Signed GET URL to the mastered result (for the AB player's B side). */
  downloadUrl?: string;
  /** Whether the AB player row is expanded under this run. */
  expanded?: boolean;
  /** Backend-assigned job id (once /api/master submit has returned). */
  jobId?: string;
  /** Backing GCS object name so /api/jobs/[id] can sign a download URL. */
  outputObject?: string | null;
  status: 'uploading' | 'processing' | 'done' | 'error';
}

function fmtElapsed(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
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

  // Tick elapsed for any active run so the count keeps moving until the
  // /api/master fetch resolves and it morphs into a download button.
  useEffect(() => {
    const anyActive = runs.some(
      (r) => r.status === 'uploading' || r.status === 'processing',
    );
    if (!anyActive) return;
    const t = setInterval(() => {
      setRuns((prev) =>
        prev.map((r) =>
          r.status === 'uploading' || r.status === 'processing'
            ? { ...r, elapsed: r.elapsed + 1 }
            : r,
        ),
      );
    }, 1000);
    return () => clearInterval(t);
  }, [runs]);

  const startRun = useCallback(async (file: File) => {
    const localId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setRuns((prev) => [
      { localId, filename: file.name, startedAt: Date.now(), status: 'uploading', elapsed: 0 },
      ...prev,
    ]);

    try {
      const gcsUrl = await uploadToGCS(file);
      updateRun(localId, { status: 'processing', inputUrl: gcsUrl });

      const submit = await submitMasterJob({
        audio_url: gcsUrl,
        route: 'full',
      });
      updateRun(localId, {
        jobId: submit.job_id,
        outputObject: submit.output_object,
      });
      // The polling effect below takes over from here — no long-lived
      // fetch, so a flaky CDN / browser timeout can't kill the run.
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'unknown error';
      updateRun(localId, { status: 'error', error: msg });
    }
  }, [updateRun]);

  // Poll each processing run for completion. Keyed on the set of active
  // job IDs so the interval is not torn down every second when the
  // elapsed-counter effect bumps `runs`.
  const pollKey = runs
    .filter((r) => r.status === 'processing' && r.jobId)
    .map((r) => r.jobId!)
    .sort()
    .join('|');

  useEffect(() => {
    if (!pollKey) return;

    let cancelled = false;
    const tick = async () => {
      const active = runsRef.current.filter(
        (r) => r.status === 'processing' && r.jobId,
      );
      for (const r of active) {
        if (cancelled || !r.jobId) continue;
        try {
          const job = await pollJob(r.jobId, r.outputObject ?? null);
          if (cancelled) return;
          if (job.status === 'completed') {
            updateRun(r.localId, {
              status: 'done',
              downloadUrl: job.download_url ?? undefined,
              expanded: true,
            });
            void refreshJobs();
          } else if (job.status === 'failed') {
            updateRun(r.localId, {
              status: 'error',
              error: job.error || 'Pipeline failed.',
            });
          }
          // queued / processing → keep counter ticking; try again next interval.
        } catch (err) {
          // Transient poll errors shouldn't kill the run. Only 404 (job
          // evicted server-side) means we should give up.
          if (err instanceof ApiError && err.status === 404) {
            updateRun(r.localId, {
              status: 'error',
              error: 'Job expired before finishing.',
            });
          } else {
            // eslint-disable-next-line no-console
            console.warn('[poll] transient error, retrying:', err);
          }
        }
      }
    };

    const handle = setInterval(() => void tick(), 3000);
    void tick(); // fire once immediately so the first check isn't 3 s late
    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, [pollKey, updateRun, refreshJobs]);

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
                const canCompare = r.status === 'done' && r.inputUrl && r.downloadUrl;
                return (
                  <motion.div
                    key={r.localId}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-zinc-950/60"
                  >
                    <div className="flex items-center gap-4 px-4 py-3 text-sm">
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
                          {r.status === 'done' && 'done · compare A / B below'}
                          {r.status === 'error' && `error · ${r.error}`}
                        </div>
                      </div>

                      {canCompare && (
                        <button
                          onClick={() => updateRun(r.localId, { expanded: !r.expanded })}
                          className="text-xs font-mono text-zinc-400 hover:text-zinc-100 shrink-0"
                        >
                          {r.expanded ? 'hide A/B' : 'A / B'}
                        </button>
                      )}

                      {/* The elapsed counter and the download button occupy the
                          same slot: the counter ticks while mastering runs,
                          then morphs into a download button when it finishes. */}
                      <div className="relative w-32 h-8 shrink-0">
                        <AnimatePresence mode="wait" initial={false}>
                          {r.status === 'done' && r.downloadUrl ? (
                            <motion.a
                              key="dl"
                              href={r.downloadUrl}
                              download={r.filename.replace(/\.[^.]+$/, '') + '-mastered.wav'}
                              initial={{ opacity: 0, y: 6, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              transition={{ duration: 0.25 }}
                              className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-md bg-emerald-500 text-black text-xs font-mono font-semibold hover:bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
                            >
                              <Download className="w-3.5 h-3.5" />
                              DOWNLOAD
                            </motion.a>
                          ) : r.status === 'error' ? (
                            <motion.div
                              key="err"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-red-400 truncate px-2"
                            >
                              {r.error}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="count"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex items-center justify-end font-mono tabular-nums text-zinc-400 pr-1"
                            >
                              {fmtElapsed(r.elapsed)}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {(r.status === 'done' || r.status === 'error') && (
                        <button
                          onClick={() => dismissRun(r.localId)}
                          className="text-zinc-600 hover:text-zinc-300 shrink-0"
                          aria-label="dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {canCompare && r.expanded && r.inputUrl && r.downloadUrl && (
                      <div className="px-4 pb-4">
                        <ABPlayer audioUrl={r.inputUrl} masteredUrl={r.downloadUrl} />
                      </div>
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

