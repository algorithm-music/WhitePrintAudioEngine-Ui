'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, AlertCircle, ChevronDown, ChevronUp, Zap, Cpu, BarChart3, Upload, FileAudio, X } from 'lucide-react';
import GdriveGuideModal, {
  isGdriveUrl,
  isGdriveGuideDismissed,
} from '@/components/gdrive-guide-modal';

interface LandingContentProps {
  onSubmit: (url: string) => void;
  onFileSubmit: (file: File) => void;
  error: string | null;
}

const PROVIDER_HINTS = [
  { name: 'Suno', hint: 'Paste the song page URL — we auto-extract the audio' },
  { name: 'SoundCloud', hint: 'Paste the track page URL — we auto-extract the stream' },
  { name: 'Google Drive', hint: 'Share → Anyone with the link → Copy link' },
  { name: 'Dropbox', hint: 'Share → Copy link (auto-converted to direct download)' },
  { name: 'OneDrive', hint: 'Share → Anyone with the link → Copy link' },
  { name: 'Direct URL', hint: 'Any HTTPS link to WAV, FLAC, AIFF, or MP3' },
];

const FEATURES = [
  { icon: BarChart3, label: 'BS.1770-4 Analysis', desc: 'ITU loudness standard' },
  { icon: Cpu, label: 'Multi-LLM Deliberation', desc: 'OpenAI · Claude · Gemini ensemble' },
  { icon: Zap, label: '14-Stage DSP', desc: 'Automated mastering pipeline' },
];

const ACCEPTED_EXTS = ['.wav', '.flac', '.aiff', '.aif', '.mp3'];
const ACCEPTED_MIME = ['audio/wav', 'audio/x-wav', 'audio/flac', 'audio/aiff', 'audio/x-aiff', 'audio/mpeg', 'audio/mp3'];

function isValidAudioUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function isValidAudioFile(file: File): boolean {
  const ext = '.' + file.name.toLowerCase().split('.').pop();
  return ACCEPTED_MIME.includes(file.type) || ACCEPTED_EXTS.includes(ext);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LandingContent({ onSubmit, onFileSubmit, error }: LandingContentProps) {
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const [url, setUrl] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showGdriveGuide, setShowGdriveGuide] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitUrl = useCallback(() => {
    setValidationError(null);
    onSubmit(url.trim());
  }, [url, onSubmit]);

  const handleSubmitUrl = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) { setValidationError('URL is required.'); return; }
    if (!isValidAudioUrl(trimmed)) { setValidationError('Invalid URL. Must start with https:// or http://'); return; }
    if (isGdriveUrl(trimmed) && !isGdriveGuideDismissed()) { setShowGdriveGuide(true); return; }
    setValidationError(null);
    onSubmit(trimmed);
  }, [url, onSubmit]);

  const handleFileSelect = useCallback((file: File) => {
    if (!isValidAudioFile(file)) {
      setValidationError(`Unsupported format. Accepted: WAV, FLAC, AIFF, MP3`);
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setValidationError('File too large. Maximum size is 200MB.');
      return;
    }
    setValidationError(null);
    setSelectedFile(file);
  }, []);

  const handleSubmitFile = useCallback(() => {
    if (!selectedFile) { setValidationError('Please select an audio file.'); return; }
    onFileSubmit(selectedFile);
  }, [selectedFile, onFileSubmit]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmitUrl();
  }, [handleSubmitUrl]);

  const displayError = validationError || error;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center gap-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center backdrop-blur">
              <div className="w-6 h-6 bg-indigo-400 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.8)]" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-indigo-500/10 blur-md -z-10" />
          </div>
          <div className="text-center">
            <p className="font-mono text-xs tracking-[0.3em] text-indigo-400 uppercase mb-1">WhitePrint</p>
            <h1 className="text-5xl font-mono font-bold tracking-tighter text-white">AudioEngine</h1>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="text-zinc-400 text-base font-mono text-center max-w-xl leading-relaxed"
        >
          AI-powered mastering with BS.1770-4 loudness analysis.
          <br />
          Multi-LLM ensemble deliberation · 14-stage DSP pipeline.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/60 backdrop-blur">
              <Icon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-mono text-zinc-300">{label}</span>
              <span className="text-xs font-mono text-zinc-600 hidden sm:inline">· {desc}</span>
            </div>
          ))}
        </motion.div>

        {/* Main input card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="w-full"
        >
          {/* Mode switcher */}
          <div className="flex gap-1 mb-3 p-1 rounded-lg bg-zinc-900 border border-zinc-800 w-fit mx-auto">
            <button
              onClick={() => { setMode('url'); setValidationError(null); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono transition-all ${mode === 'url' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Link2 className="w-3.5 h-3.5" /> URL
            </button>
            <button
              onClick={() => { setMode('file'); setValidationError(null); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono transition-all ${mode === 'file' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Upload className="w-3.5 h-3.5" /> LOCAL FILE
            </button>
          </div>

          <div className="relative overflow-hidden rounded-xl border-2 border-zinc-800 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 focus-within:border-indigo-500 focus-within:shadow-[0_0_60px_rgba(99,102,241,0.12)]">
            <div className="p-8 flex flex-col gap-5">
              <AnimatePresence mode="wait">
                {mode === 'url' ? (
                  <motion.div key="url-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
                    {/* URL input */}
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-zinc-800 text-zinc-400 shrink-0">
                        <Link2 className="w-5 h-5" />
                      </div>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="https://suno.com/s/... or https://drive.google.com/..."
                        className="flex-1 bg-transparent text-zinc-100 font-mono text-sm placeholder:text-zinc-600 focus:outline-none"
                        autoFocus
                      />
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
                        onClick={handleSubmitUrl}
                        disabled={!url.trim()}
                        className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-mono font-bold rounded-lg transition-all duration-150"
                      >
                        ANALYZE
                      </button>
                    </div>

                    <AnimatePresence>
                      {showHints && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-zinc-800 pt-4 space-y-2 overflow-hidden"
                        >
                          {PROVIDER_HINTS.map((p) => (
                            <div key={p.name} className="flex items-start gap-2">
                              <span className="font-mono text-xs text-indigo-400 shrink-0 w-24">{p.name}</span>
                              <span className="font-mono text-xs text-zinc-500">{p.hint}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div key="file-mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-5">
                    {/* Drop zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => !selectedFile && fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 cursor-pointer transition-all duration-200 ${
                        dragOver
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : selectedFile
                          ? 'border-emerald-500/50 bg-emerald-500/5 cursor-default'
                          : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30'
                      }`}
                    >
                      {selectedFile ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                            <FileAudio className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div className="text-center">
                            <p className="font-mono text-sm text-zinc-100 truncate max-w-xs">{selectedFile.name}</p>
                            <p className="font-mono text-xs text-zinc-500 mt-1">{formatBytes(selectedFile.size)}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setValidationError(null); }}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-zinc-400" />
                          </div>
                          <div className="text-center">
                            <p className="font-mono text-sm text-zinc-300">Drop your audio file here</p>
                            <p className="font-mono text-xs text-zinc-600 mt-1">or click to browse · WAV, FLAC, AIFF, MP3 · max 200MB</p>
                          </div>
                        </>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_EXTS.join(',')}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                      className="hidden"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={handleSubmitFile}
                        disabled={!selectedFile}
                        className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-mono font-bold rounded-lg transition-all duration-150"
                      >
                        ANALYZE
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-700 opacity-50 m-2" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-700 opacity-50 m-2" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-700 opacity-50 m-2" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-700 opacity-50 m-2" />
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-mono font-semibold text-red-400">ANALYSIS_FAILED</h4>
                <div className="text-xs font-mono text-red-300/80 mt-1 whitespace-pre-line">{displayError}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-xs font-mono text-zinc-600 text-center"
        >
          Professional mastering · URL or local file · WAV · FLAC · AIFF · MP3
        </motion.p>
      </div>

      <GdriveGuideModal
        open={showGdriveGuide}
        onConfirm={() => { setShowGdriveGuide(false); submitUrl(); }}
        onClose={() => setShowGdriveGuide(false)}
      />
    </div>
  );
}
