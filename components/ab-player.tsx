'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';

interface ABPlayerProps {
  /** URL that plays on the "A" side (original / before). */
  audioUrl: string | null;
  /** URL that plays on the "B" side (mastered / after). */
  masteredUrl: string | null;
}

// ─── Web Audio engine ────────────────────────────────────────────────────────
// Plays exactly ONE side at a time. A/B switch during playback stops the
// current source and starts the other one at the same offset — no dual
// playback, no comb-filter smearing, no crossfade artefacts.
class ABEngine {
  public context: AudioContext;
  analyzer: AnalyserNode;
  public gainNode: GainNode;
  private splitter: ChannelSplitterNode;
  private meterL: AnalyserNode;
  private meterR: AnalyserNode;

  private bufferA: AudioBuffer | null = null;
  private bufferB: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;

  private startCtxTime = 0;
  private offset = 0;
  private playing = false;
  private active: 'A' | 'B' = 'B';

  constructor() {
    const Ctx =
      (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) throw new Error('Web Audio API not available.');
    this.context = new Ctx();

    this.analyzer = this.context.createAnalyser();
    this.analyzer.fftSize = 2048;

    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.analyzer);
    this.analyzer.connect(this.context.destination);

    this.splitter = this.context.createChannelSplitter(2);
    this.meterL = this.context.createAnalyser();
    this.meterR = this.context.createAnalyser();
    this.meterL.fftSize = 256;
    this.meterR.fftSize = 256;
    this.analyzer.connect(this.splitter);
    this.splitter.connect(this.meterL, 0);
    this.splitter.connect(this.meterR, 1);
  }

  async loadUrl(url: string, side: 'A' | 'B'): Promise<void> {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    const arrayBuffer = await resp.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    if (side === 'A') this.bufferA = audioBuffer;
    else this.bufferB = audioBuffer;
  }

  private activeBuffer(): AudioBuffer | null {
    return this.active === 'A' ? this.bufferA : this.bufferB;
  }

  getDuration(): number {
    const b = this.activeBuffer();
    if (b) return b.duration;
    return Math.max(this.bufferA?.duration ?? 0, this.bufferB?.duration ?? 0);
  }

  getCurrentTime(): number {
    if (!this.playing) return this.offset;
    return Math.min(this.getDuration(), this.context.currentTime - this.startCtxTime);
  }

  getActive(): 'A' | 'B' {
    return this.active;
  }

  getMeter(): { l: number; r: number } {
    const peak = (a: AnalyserNode) => {
      const data = new Uint8Array(a.frequencyBinCount);
      a.getByteTimeDomainData(data);
      let max = 0;
      for (let i = 0; i < data.length; i++) {
        const v = Math.abs(data[i] - 128) / 128;
        if (v > max) max = v;
      }
      return max;
    };
    return { l: peak(this.meterL), r: peak(this.meterR) };
  }

  private stopSource() {
    if (!this.source) return;
    try { this.source.onended = null; } catch {}
    try { this.source.stop(); } catch {}
    try { this.source.disconnect(); } catch {}
    this.source = null;
  }

  /** Start the active buffer at `this.offset`. Assumes caller set `playing`. */
  private startActive() {
    const buffer = this.activeBuffer();
    if (!buffer) return;
    const src = this.context.createBufferSource();
    src.buffer = buffer;
    src.connect(this.gainNode);
    const startAt = Math.max(0, Math.min(buffer.duration, this.offset));
    src.start(0, startAt);
    this.startCtxTime = this.context.currentTime - startAt;
    src.onended = () => {
      // Natural end only — manual stops clear onended first.
      if (this.source === src) {
        this.playing = false;
        this.offset = 0;
        this.source = null;
      }
    };
    this.source = src;
  }

  play(): void {
    if (this.playing) return;
    if (!this.activeBuffer()) return;
    if (this.context.state === 'suspended') void this.context.resume();

    this.stopSource();
    this.playing = true;
    this.startActive();
  }

  pause(): void {
    if (!this.playing) return;
    this.offset = this.getCurrentTime();
    this.stopSource();
    this.playing = false;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  seek(time: number): void {
    const wasPlaying = this.playing;
    if (wasPlaying) {
      this.stopSource();
      this.playing = false;
    }
    this.offset = Math.max(0, Math.min(this.getDuration(), time));
    if (wasPlaying) {
      this.playing = true;
      this.startActive();
    }
  }

  switchTo(side: 'A' | 'B'): void {
    if (side === this.active) return;
    if (!this.playing) {
      this.active = side;
      return;
    }
    // Preserve current playhead, swap to the other buffer seamlessly.
    const now = this.getCurrentTime();
    this.stopSource();
    this.active = side;
    this.offset = Math.max(0, Math.min(this.getDuration(), now));
    this.startActive();
  }

  async close(): Promise<void> {
    this.stopSource();
    try { await this.context.close(); } catch {}
  }
}

import AudioMotionAnalyzer from 'audiomotion-analyzer';

// ─── High-Res AudioMotion Visualizer ─────────────────────────────────────────
function AudioMotionVisualizer({
  engine,
  color,
  mode,
}: {
  engine: ABEngine | null;
  color: string;
  mode: 'frequency' | 'waveform';
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const amRef = useRef<AudioMotionAnalyzer | null>(null);

  // Initialize
  useEffect(() => {
    if (!engine || !containerRef.current) return;

    const am = new AudioMotionAnalyzer(containerRef.current, {
      audioCtx: engine.context,
      connectSpeakers: false,
      useCanvas: true,
      showScaleX: true,
      showScaleY: true,
      showPeaks: true,
      overlay: true,
      bgAlpha: 0,
      showBgColor: false,
      smoothing: 0.7,
      minFreq: 20,
      maxFreq: 20000,
      fftSize: 8192,
    });

    am.connectInput(engine.gainNode);
    amRef.current = am;

    return () => {
      am.destroy();
      amRef.current = null;
    };
  }, [engine]);

  // Update mode & color
  useEffect(() => {
    if (!amRef.current) return;
    
    // mode 6: 1/3rd octave bands (ledBars memory meter)
    // mode 10: Line graph (waveform)
    if (mode === 'frequency') {
      amRef.current.setOptions({ mode: 6, ledBars: true, radial: false, fillAlpha: 0.8, lineWidth: 0 });
    } else {
      amRef.current.setOptions({ mode: 10, ledBars: false, radial: false, fillAlpha: 0, lineWidth: 2 });
    }

    const gradientName = color === '#6366f1' ? 'beforeColor' : 'afterColor';
    amRef.current.registerGradient(gradientName, {
      bgColor: '#00000000',
      colorStops: [
        { pos: 0, color: color },
        { pos: 0.8, color: color + '66' },
        { pos: 1, color: color + '11' }
      ]
    });
    amRef.current.setOptions({ gradient: gradientName });

  }, [mode, color]);

  return <div ref={containerRef} className="w-full h-full block [&>canvas]:w-full [&>canvas]:h-full" />;
}

// ─── Segmented peak meter with peak-hold ─────────────────────────────────────
function PeakMeter({ level, label }: { level: number; label: string }) {
  const [hold, setHold] = useState(0);
  const holdT = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (level > hold) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHold(level);
      if (holdT.current) clearTimeout(holdT.current);
      holdT.current = setTimeout(() => setHold(0), 1200);
    }
  }, [level, hold]);

  const segments = 24;
  return (
    <div className="flex flex-col items-center gap-1 h-full">
      <div className="flex flex-col-reverse gap-[2px] h-full w-3 bg-black/50 rounded-sm p-[2px] border border-zinc-800/50">
        {Array.from({ length: segments }).map((_, i) => {
          const threshold = i / segments;
          const on = level > threshold;
          const peak = Math.abs(hold - threshold) < 1 / segments && hold > 0;
          let c = 'bg-emerald-500/15';
          if (i > segments * 0.85) c = 'bg-red-500/20';
          else if (i > segments * 0.7) c = 'bg-amber-400/20';
          if (on || peak) {
            if (i > segments * 0.85) c = 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]';
            else if (i > segments * 0.7) c = 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]';
            else c = 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]';
          }
          return <div key={i} className={`w-full flex-1 rounded-[1px] transition-colors ${c}`} />;
        })}
      </div>
      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function ABPlayer({ audioUrl, masteredUrl }: ABPlayerProps) {
  const [engine, setEngine] = useState<ABEngine | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [active, setActive] = useState<'A' | 'B'>('B');
  const [vizMode, setVizMode] = useState<'frequency' | 'waveform'>('frequency');
  const [loadedA, setLoadedA] = useState(false);
  const [loadedB, setLoadedB] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [curTime, setCurTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [levels, setLevels] = useState({ l: 0, r: 0 });
  const rafRef = useRef<number | null>(null);

  // Initialise engine lazily on first client render.
  useEffect(() => {
    let eng: ABEngine | null = null;
    try {
      eng = new ABEngine();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEngine(eng);
    } catch (e) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(e instanceof Error ? e.message : 'Web Audio unavailable');
    }
    return () => {
      void eng?.close();
    };
  }, []);

  // Reload A/B buffers whenever URLs change.
  useEffect(() => {
    if (!engine) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadedA(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadedB(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);

    (async () => {
      try {
        if (audioUrl) {
          await engine.loadUrl(audioUrl, 'A');
          if (cancelled) return;
          setLoadedA(true);
        }
        if (masteredUrl) {
          await engine.loadUrl(masteredUrl, 'B');
          if (cancelled) return;
          setLoadedB(true);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to decode audio.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [engine, audioUrl, masteredUrl]);

  // Animation frame loop to sample transport + meters.
  useEffect(() => {
    if (!engine) return;
    const tick = () => {
      setCurTime(engine.getCurrentTime());
      setDuration(engine.getDuration());
      setLevels(engine.getMeter());
      if (engine.isPlaying() !== isPlaying) setIsPlaying(engine.isPlaying());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [engine, isPlaying]);

  const toggle = useCallback(() => {
    if (!engine) return;
    if (engine.isPlaying()) engine.pause();
    else engine.play();
    setIsPlaying(engine.isPlaying());
  }, [engine]);

  const onSwitch = useCallback(
    (side: 'A' | 'B') => {
      setActive(side);
      engine?.switchTo(side);
    },
    [engine],
  );

  const seek = useCallback(
    (t: number) => {
      engine?.seek(t);
      setCurTime(t);
    },
    [engine],
  );

  const rewind = useCallback(() => {
    engine?.seek(0);
    setCurTime(0);
  }, [engine]);

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const colorA = '#6366f1'; // indigo
  const colorB = '#10b981'; // emerald
  const color = useMemo(() => (active === 'A' ? colorA : colorB), [active]);
  const ready = loadedA && loadedB;

  if (error) {
    return (
      <div className="rounded-lg border border-red-900/60 bg-red-950/20 text-red-400 text-xs p-4 flex items-center gap-2 font-mono">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="truncate">{error}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col min-h-[280px]">
      {/* Visualizer Background (Fluid Overlay) */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
        <AudioMotionVisualizer engine={engine} color={color} mode={vizMode} />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex justify-between items-start p-4 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md border border-white/5">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest drop-shadow-md">
            {isPlaying ? 'live analysis' : ready ? 'standby' : 'loading…'}
          </span>
        </div>
        <div className="flex gap-1 pointer-events-auto">
          <button
            onClick={() => setVizMode('frequency')}
            className={`p-1.5 rounded-md transition-colors ${
              vizMode === 'frequency'
                ? 'bg-zinc-100 text-black shadow-md'
                : 'bg-black/40 text-zinc-400 hover:text-zinc-200 border border-white/5 backdrop-blur-sm'
            }`}
            aria-label="frequency view"
          >
            <BarChart3 size={14} />
          </button>
          <button
            onClick={() => setVizMode('waveform')}
            className={`p-1.5 rounded-md transition-colors ${
              vizMode === 'waveform'
                ? 'bg-zinc-100 text-black shadow-md'
                : 'bg-black/40 text-zinc-400 hover:text-zinc-200 border border-white/5 backdrop-blur-sm'
            }`}
            aria-label="waveform view"
          >
            <Activity size={14} />
          </button>
        </div>
      </div>

      {/* Center Time Display */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none py-6">
        <div className="text-4xl md:text-5xl font-mono font-bold tabular-nums text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          {fmt(curTime)}
        </div>
        <div className="text-[10px] font-mono text-zinc-300 tracking-[0.2em] uppercase mt-2 drop-shadow-md">
          / {fmt(duration)}
        </div>
      </div>

      {/* Transport */}
      <div className="relative z-10 grid grid-cols-12 gap-4 p-4 items-center bg-black/50 backdrop-blur-md border-t border-zinc-800/60">
        {/* Left: play controls */}
        <div className="col-span-12 md:col-span-7 flex items-center gap-4">
          <button
            onClick={rewind}
            disabled={!ready}
            className="p-2 text-zinc-500 hover:text-zinc-100 disabled:opacity-40"
            aria-label="rewind"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={toggle}
            disabled={!ready}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-zinc-100 text-black'
                : 'bg-emerald-500 text-black hover:scale-105 shadow-[0_0_24px_rgba(16,185,129,0.35)]'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label={isPlaying ? 'pause' : 'play'}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-0.5" fill="currentColor" />}
          </button>

          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.01}
            value={Math.min(curTime, duration || 0)}
            onChange={(e) => seek(parseFloat(e.target.value))}
            disabled={!ready}
            className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 disabled:opacity-40"
          />
        </div>

        {/* Middle: A/B switcher */}
        <div className="col-span-6 md:col-span-3 flex items-center justify-center">
          <div
            role="tablist"
            aria-label="A/B source switch"
            className="relative w-32 h-9 rounded-full p-1 bg-zinc-900 border border-zinc-800"
          >
            <motion.div
              layout
              animate={{ left: active === 'A' ? '4px' : 'calc(50% - 4px)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`absolute top-1 bottom-1 w-1/2 rounded-full ${
                active === 'A' ? 'bg-indigo-500' : 'bg-emerald-500'
              }`}
            />
            <div className="relative grid grid-cols-2 h-full font-mono font-bold text-xs">
              <button
                role="tab"
                aria-selected={active === 'A'}
                onClick={() => onSwitch('A')}
                className={`z-10 rounded-full transition-colors ${
                  active === 'A' ? 'text-black' : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                BEFORE
              </button>
              <button
                role="tab"
                aria-selected={active === 'B'}
                onClick={() => onSwitch('B')}
                className={`z-10 rounded-full transition-colors ${
                  active === 'B' ? 'text-black' : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                AFTER
              </button>
            </div>
          </div>
        </div>

        {/* Right: L/R peak meters */}
        <div className="col-span-6 md:col-span-2 flex items-center justify-end gap-3 h-12">
          <PeakMeter level={levels.l} label="L" />
          <PeakMeter level={levels.r} label="R" />
        </div>
      </div>

      <AnimatePresence>
        {!ready && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-3 text-[10px] font-mono text-zinc-600"
          >
            decoding {!loadedA && 'BEFORE'} {!loadedA && !loadedB && '+'} {!loadedB && 'AFTER'}…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
