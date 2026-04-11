'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward, AlertCircle } from 'lucide-react';

interface ABPlayerProps {
  audioUrl: string | null;
  masteredUrl: string | null;
}

export default function ABPlayer({ audioUrl, masteredUrl }: ABPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<'before' | 'after'>('after');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [beforeReady, setBeforeReady] = useState(false);
  const [afterReady, setAfterReady] = useState(false);

  const beforeRef = useRef<HTMLAudioElement | null>(null);
  const afterRef = useRef<HTMLAudioElement | null>(null);

  const activeRef = activeTrack === 'before' ? beforeRef : afterRef;
  const inactiveRef = activeTrack === 'before' ? afterRef : beforeRef;

  // Initialize Before audio (original — may fail due to CORS on external URLs)
  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'metadata';
    audio.src = audioUrl;
    beforeRef.current = audio;

    const onReady = () => setBeforeReady(true);
    const onError = () => setBeforeReady(false);
    audio.addEventListener('loadedmetadata', onReady);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onReady);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  // Initialize After audio (mastered blob URL — always local, always works)
  useEffect(() => {
    if (!masteredUrl) return;
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = masteredUrl;
    afterRef.current = audio;

    const onReady = () => {
      setAfterReady(true);
      setDuration(audio.duration);
    };
    const onError = () => setAfterReady(false);
    audio.addEventListener('loadedmetadata', onReady);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('loadedmetadata', onReady);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, [masteredUrl]);

  // Time update + ended tracking on the active element
  useEffect(() => {
    const audio = activeRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeTrack, activeRef]);

  // Play / Pause
  useEffect(() => {
    const active = activeRef.current;
    const inactive = inactiveRef.current;
    if (!active) return;

    if (isPlaying) {
      active.play().catch(console.error);
    } else {
      active.pause();
    }
    // Always pause the inactive track
    if (inactive) inactive.pause();
  }, [isPlaying, activeTrack, activeRef, inactiveRef]);

  // A/B switch: sync currentTime between tracks
  const handleSwitch = useCallback((track: 'before' | 'after') => {
    if (track === activeTrack) return;
    const current = activeRef.current;
    const next = track === 'before' ? beforeRef.current : afterRef.current;

    if (current && next) {
      next.currentTime = current.currentTime;
      current.pause();
      if (isPlaying) {
        next.play().catch(console.error);
      }
    }
    setActiveTrack(track);
  }, [activeTrack, isPlaying, activeRef]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    const audio = activeRef.current;
    if (audio && audio.duration) {
      audio.currentTime = (newProgress / 100) * audio.duration;
    }
  };

  const skip = (delta: number) => {
    const audio = activeRef.current;
    if (audio && audio.duration) {
      audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + delta));
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">High-Fidelity A/B Player</h3>
            <p className="text-xs text-zinc-500 font-mono">Seamless switching between original and mastered audio</p>
          </div>
        </div>

        {/* A/B Switch */}
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => handleSwitch('before')}
            disabled={!beforeReady}
            className={`px-6 py-2 rounded-md text-sm font-bold font-mono transition-all ${
              !beforeReady
                ? 'text-zinc-700 cursor-not-allowed'
                : activeTrack === 'before'
                  ? 'bg-zinc-700 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            BEFORE
          </button>
          <button
            onClick={() => handleSwitch('after')}
            disabled={!afterReady}
            className={`px-6 py-2 rounded-md text-sm font-bold font-mono transition-all ${
              !afterReady
                ? 'text-zinc-700 cursor-not-allowed'
                : activeTrack === 'after'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            AFTER
          </button>
        </div>
      </div>

      {!beforeReady && (
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Original audio unavailable for playback (external URL may block cross-origin requests).
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative h-24 bg-zinc-900 rounded-lg border border-zinc-800/50 overflow-hidden flex items-center px-2">
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          style={{ left: `${progress}%` }}
        />

        {/* Progress Overlay */}
        <div
          className={`absolute top-0 bottom-0 left-0 z-0 ${activeTrack === 'after' ? 'bg-emerald-500/20' : 'bg-indigo-500/20'}`}
          style={{ width: `${progress}%` }}
        />

        {/* Track label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`text-xs font-mono font-bold uppercase tracking-widest ${activeTrack === 'after' ? 'text-emerald-500/40' : 'text-zinc-500/40'}`}>
            {activeTrack === 'after' ? 'MASTERED' : 'ORIGINAL'}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
      </div>

      <div className="flex justify-between text-xs font-mono text-zinc-500 px-1">
        <span>{formatTime(currentTime)}</span>
        <span>{duration ? formatTime(duration) : '0:00'}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button
          className="text-zinc-500 hover:text-white transition-colors"
          onClick={() => skip(-5)}
        >
          <SkipBack className="w-6 h-6" />
        </button>
        <button
          onClick={togglePlay}
          disabled={!afterReady}
          className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>
        <button
          className="text-zinc-500 hover:text-white transition-colors"
          onClick={() => skip(5)}
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
