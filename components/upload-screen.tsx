'use client';

import { useState, useCallback } from 'react';
import { Link2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadScreenProps {
  onSubmit: (url: string) => void;
  error: string | null;
}

const PROVIDER_HINTS = [
  { name: 'Google Drive', hint: 'Share \u2192 Anyone with the link \u2192 Copy link' },
  { name: 'Dropbox', hint: 'Share \u2192 Copy link (change ?dl=0 to ?dl=1 for direct download)' },
  { name: 'OneDrive', hint: 'Share \u2192 Anyone with the link \u2192 Copy link' },
  { name: 'S3 / GCS', hint: 'Use a pre-signed URL or public object URL' },
];

function isValidAudioUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export default function UploadScreen({ onSubmit, error }: UploadScreenProps) {
  const [url, setUrl] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError('URL is required.');
      return;
    }
    if (!isValidAudioUrl(trimmed)) {
      setValidationError('Invalid URL. Must start with https:// or http://');
      return;
    }
    setValidationError(null);
    onSubmit(trimmed);
  }, [url, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (isValidAudioUrl(pasted)) {
      setValidationError(null);
    }
  }, []);

  const displayError = validationError || error;

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-3xl font-mono font-bold tracking-tighter text-white">
          INITIALIZE_ANALYSIS
        </h2>
        <p className="text-zinc-400 font-mono text-sm">
          Paste a shared audio URL to begin BS.1770-4 compliant physical extraction.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-xl border-2 border-zinc-800 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 focus-within:border-indigo-500 focus-within:shadow-[0_0_40px_rgba(99,102,241,0.15)]">
        <div className="p-8 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-zinc-800 text-zinc-400">
              <Link2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="https://drive.google.com/... or https://dropbox.com/..."
                className="w-full bg-transparent text-zinc-100 font-mono text-sm placeholder:text-zinc-600 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showHints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              SUPPORTED_PROVIDERS
            </button>

            <button
              onClick={handleSubmit}
              disabled={!url.trim()}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-mono font-bold rounded-lg transition-colors"
            >
              ANALYZE
            </button>
          </div>

          {showHints && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-zinc-800 pt-4 space-y-2"
            >
              {PROVIDER_HINTS.map((p) => (
                <div key={p.name} className="flex items-start gap-2">
                  <span className="font-mono text-xs text-indigo-400 shrink-0 w-24">{p.name}</span>
                  <span className="font-mono text-xs text-zinc-500">{p.hint}</span>
                </div>
              ))}
              <p className="font-mono text-xs text-zinc-600 pt-1">
                Any direct HTTPS link to a WAV, FLAC, or AIFF file is supported.
              </p>
            </motion.div>
          )}
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-700 opacity-50 m-2" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-700 opacity-50 m-2" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-700 opacity-50 m-2" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-700 opacity-50 m-2" />
      </div>

      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-mono font-semibold text-red-400">ANALYSIS_FAILED</h4>
            <div className="text-xs font-mono text-red-300/80 mt-1 whitespace-pre-line">{displayError}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
