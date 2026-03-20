'use client';

import { useCallback, useState } from 'react';
import { UploadCloud, FileAudio, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UploadScreenProps {
  onUpload: (file: File) => void;
  error: string | null;
}

export default function UploadScreen({ onUpload, error }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      onUpload(file);
    }
  }, [onUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-3xl font-mono font-bold tracking-tighter text-white">
          INITIALIZE_ANALYSIS
        </h2>
        <p className="text-zinc-400 font-mono text-sm">
          Drop an audio file to begin BS.1770-4 compliant physical extraction.
        </p>
      </div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ease-out bg-zinc-900/50 backdrop-blur-sm",
          isDragging 
            ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)]" 
            : "border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="p-16 flex flex-col items-center justify-center gap-6 pointer-events-none">
          <div className={cn(
            "p-4 rounded-full transition-colors duration-300",
            isDragging ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-300"
          )}>
            {isDragging ? <FileAudio className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
          </div>
          
          <div className="text-center space-y-1">
            <p className="font-mono text-sm font-medium text-zinc-200">
              {isDragging ? "DEPLOY_PAYLOAD" : "SELECT_OR_DRAG_FILE"}
            </p>
            <p className="font-mono text-xs text-zinc-500">
              WAV, FLAC, AIFF supported. Max 384kHz.
            </p>
          </div>
        </div>
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-700 opacity-50 m-2" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-700 opacity-50 m-2" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-700 opacity-50 m-2" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-700 opacity-50 m-2" />
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-mono font-semibold text-red-400">ANALYSIS_FAILED</h4>
            <p className="text-xs font-mono text-red-300/80 mt-1">{error}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
