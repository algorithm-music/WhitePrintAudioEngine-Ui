'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';

interface ABPlayerProps {
  audioUrl: string | null;
  gainAdjustmentDb: number;
}

export default function ABPlayer({ audioUrl, gainAdjustmentDb }: ABPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState<'before' | 'after'>('after');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize Audio
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  // Handle Play/Pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      // Initialize AudioContext on first play to comply with browser autoplay policies
      if (!audioContextRef.current) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;
        
        const source = ctx.createMediaElementSource(audioRef.current);
        sourceNodeRef.current = source;
        
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.knee.value = 10;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.01;
        compressor.release.value = 0.1;
        compressorNodeRef.current = compressor;
        
        const gain = ctx.createGain();
        gainNodeRef.current = gain;
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle Routing (Before/After)
  useEffect(() => {
    if (!audioContextRef.current || !sourceNodeRef.current || !compressorNodeRef.current || !gainNodeRef.current) return;

    const ctx = audioContextRef.current;
    const source = sourceNodeRef.current;
    const compressor = compressorNodeRef.current;
    const gain = gainNodeRef.current;

    try {
      source.disconnect();
      compressor.disconnect();
      gain.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }

    if (activeTrack === 'before') {
      source.connect(ctx.destination);
    } else {
      source.connect(compressor);
      compressor.connect(gain);
      // Apply makeup gain based on the metrics
      gain.gain.value = Math.pow(10, (gainAdjustmentDb || 4) / 20); 
      gain.connect(ctx.destination);
    }
  }, [activeTrack, gainAdjustmentDb, isPlaying]); // Re-run when isPlaying changes to ensure connections after context init

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (newProgress / 100) * duration;
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
            <p className="text-xs text-zinc-500 font-mono">Seamless switching with 0ms latency</p>
          </div>
        </div>

        {/* A/B Switch */}
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTrack('before')}
            className={`px-6 py-2 rounded-md text-sm font-bold font-mono transition-all ${
              activeTrack === 'before' 
                ? 'bg-zinc-700 text-white shadow-md' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            BEFORE
          </button>
          <button
            onClick={() => setActiveTrack('after')}
            className={`px-6 py-2 rounded-md text-sm font-bold font-mono transition-all ${
              activeTrack === 'after' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            AFTER
          </button>
        </div>
      </div>

      {/* Waveform Mock */}
      <div className="relative h-24 bg-zinc-900 rounded-lg border border-zinc-800/50 overflow-hidden flex items-center px-2">
        <div className="absolute inset-0 flex items-center justify-between px-2 opacity-30">
          {Array.from({ length: 100 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-1 rounded-full ${activeTrack === 'after' ? 'bg-emerald-500' : 'bg-zinc-500'}`}
              initial={{ height: '10%' }}
              animate={{ height: isPlaying ? `${Math.random() * 80 + 10}%` : '10%' }}
              transition={{ duration: 0.2, repeat: isPlaying ? Infinity : 0, repeatType: 'reverse' }}
            />
          ))}
        </div>
        
        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white z-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          style={{ left: `${progress}%` }}
        />
        
        {/* Progress Overlay */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-indigo-500/20 z-0"
          style={{ width: `${progress}%` }}
        />

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
        <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
        <span>{duration ? formatTime(duration) : '0:00'}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button 
          className="text-zinc-500 hover:text-white transition-colors"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
            }
          }}
        >
          <SkipBack className="w-6 h-6" />
        </button>
        <button 
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
        </button>
        <button 
          className="text-zinc-500 hover:text-white transition-colors"
          onClick={() => {
            if (audioRef.current && duration) {
              audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
            }
          }}
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
