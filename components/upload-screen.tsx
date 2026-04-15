'use client';

import { useState, useCallback, useRef } from 'react';
import { Link2, AlertCircle, ChevronDown, ChevronUp, Upload, FileAudio, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GdriveGuideModal, { isGdriveUrl, isGdriveGuideDismissed } from '@/components/gdrive-guide-modal';

interface UploadScreenProps {
  onSubmit: (url: string) => void;
  error: string | null;
}

const PROVIDER_HINTS = [
  { name: 'File Upload', hint: 'Drop or select WAV, FLAC, AIFF, or MP3 — auto-uploaded to secure cloud storage' },
  { name: 'Suno', hint: 'Paste the song page URL — we auto-extract the audio' },
  { name: 'SoundCloud', hint: 'Paste the track page URL — we auto-extract the stream' },
  { name: 'Google Drive', hint: 'Share → Anyone with the link → Copy link' },
  { name: 'Dropbox', hint: 'Share → Copy link (auto-converted to direct download)' },
  { name: 'Direct URL', hint: 'Any HTTPS link to WAV, FLAC, AIFF, or MP3' },
];

const ACCEPTED_EXTENSIONS = ['.wav', '.flac', '.aiff', '.aif', '.mp3'];
const ACCEPTED_MIME_TYPES = [
  'audio/wav', 'audio/x-wav', 'audio/wave',
  'audio/flac', 'audio/x-flac',
  'audio/aiff', 'audio/x-aiff',
  'audio/mpeg', 'audio/mp3',
];
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

type InputMode = 'url' | 'file';

function isValidAudioUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export default function UploadScreen({ onSubmit, error }: UploadScreenProps) {
  const [mode, setMode] = useState<InputMode>('file');
  const [url, setUrl] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showGdriveGuide, setShowGdriveGuide] = useState(false);

  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitUrl = useCallback(() => {
    const trimmed = url.trim();
    setValidationError(null);
    onSubmit(trimmed);
  }, [url, onSubmit]);

  const handleUrlSubmit = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setValidationError('URL is required.');
      return;
    }
    if (!isValidAudioUrl(trimmed)) {
      setValidationError('Invalid URL. Must start with https:// or http://');
      return;
    }
    if (isGdriveUrl(trimmed) && !isGdriveGuideDismissed()) {
      setShowGdriveGuide(true);
      return;
    }
    setValidationError(null);
    onSubmit(trimmed);
  }, [url, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  }, [handleUrlSubmit]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (isValidAudioUrl(pasted)) {
      setValidationError(null);
    }
  }, []);

  // ─── File Upload Logic ───

  const validateFile = useCallback((file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext) && !ACCEPTED_MIME_TYPES.includes(file.type)) {
      return `Unsupported file type: ${file.name}. Accepted: WAV, FLAC, AIFF, MP3.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is 200MB.`;
    }
    if (file.size < 44) {
      return `File too small to be valid audio.`;
    }
    return null;
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    const validErr = validateFile(file);
    if (validErr) {
      setValidationError(validErr);
      return;
    }

    setSelectedFile(file);
    setValidationError(null);
    setIsUploading(true);
    setUploadProgress(`Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: `Upload failed (${resp.status})` }));
        throw new Error(err.error || `Upload failed: ${resp.status}`);
      }

      const data = await resp.json();
      setUploadProgress(null);
      setIsUploading(false);

      // Immediately submit the GCS URL to the pipeline
      onSubmit(data.url);
    } catch (err) {
      setIsUploading(false);
      setUploadProgress(null);
      setValidationError(err instanceof Error ? err.message : 'Upload failed');
    }
  }, [validateFile, onSubmit]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset so user can select the same file again
    e.target.value = '';
  }, [uploadFile]);

  const displayError = validationError || error;

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-3xl font-mono font-bold tracking-tighter text-white">
          INITIALIZE_ANALYSIS
        </h2>
        <p className="text-zinc-400 font-mono text-sm">
          Upload your audio file or paste a shared URL to begin BS.1770-4 compliant analysis.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-5">
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 gap-1">
          <button
            onClick={() => setMode('file')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-mono transition-all ${
              mode === 'file'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            FILE_UPLOAD
          </button>
          <button
            onClick={() => setMode('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-mono transition-all ${
              mode === 'url'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Link2 className="w-4 h-4" />
            URL_PASTE
          </button>
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
        isDragging
          ? 'border-indigo-400 shadow-[0_0_60px_rgba(99,102,241,0.3)] bg-indigo-500/5'
          : 'border-zinc-800 bg-zinc-900/50 backdrop-blur-sm'
      } ${mode === 'url' ? 'focus-within:border-indigo-500 focus-within:shadow-[0_0_40px_rgba(99,102,241,0.15)]' : ''}`}
        onDrop={mode === 'file' ? handleDrop : undefined}
        onDragOver={mode === 'file' ? handleDragOver : undefined}
        onDragLeave={mode === 'file' ? handleDragLeave : undefined}
      >
        <div className="p-8 flex flex-col gap-5">
          <AnimatePresence mode="wait">
            {mode === 'file' ? (
              /* ─── File Upload Zone ─── */
              <motion.div
                key="file-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-5 cursor-pointer"
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileAudio className="w-5 h-5 text-indigo-300" />
                      </div>
                    </div>
                    <p className="text-sm font-mono text-indigo-300 animate-pulse">
                      {uploadProgress || 'Uploading...'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={`p-5 rounded-2xl transition-colors ${
                      isDragging ? 'bg-indigo-500/20' : 'bg-zinc-800/60'
                    }`}>
                      <Upload className={`w-10 h-10 transition-colors ${
                        isDragging ? 'text-indigo-400' : 'text-zinc-400'
                      }`} />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-mono text-zinc-200">
                        {isDragging ? 'DROP_FILE_HERE' : 'DROP_OR_SELECT_AUDIO'}
                      </p>
                      <p className="text-xs font-mono text-zinc-500">
                        WAV · FLAC · AIFF · MP3 — up to 200MB
                      </p>
                      {selectedFile && !isUploading && (
                        <p className="text-xs font-mono text-emerald-400 mt-2">
                          ✓ {selectedFile.name}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-mono font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      SELECT_FILE
                    </button>
                  </>
                )}
              </motion.div>
            ) : (
              /* ─── URL Input Zone ─── */
              <motion.div
                key="url-mode"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
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
                      placeholder="https://suno.com/s/... or https://drive.google.com/..."
                      className="w-full bg-transparent text-zinc-100 font-mono text-sm placeholder:text-zinc-600 focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={handleUrlSubmit}
                    disabled={!url.trim()}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-mono font-bold rounded-lg transition-colors"
                  >
                    ANALYZE
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Supported providers hint */}
          <div className="border-t border-zinc-800 pt-3">
            <button
              type="button"
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showHints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              SUPPORTED_PROVIDERS
            </button>

            {showHints && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 space-y-2"
              >
                {PROVIDER_HINTS.map((p) => (
                  <div key={p.name} className="flex items-start gap-2">
                    <span className="font-mono text-xs text-indigo-400 shrink-0 w-28">{p.name}</span>
                    <span className="font-mono text-xs text-zinc-500">{p.hint}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-700 opacity-50 m-2" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-700 opacity-50 m-2" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-700 opacity-50 m-2" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-700 opacity-50 m-2" />
      </div>

      <GdriveGuideModal
        open={showGdriveGuide}
        onConfirm={() => {
          setShowGdriveGuide(false);
          submitUrl();
        }}
        onClose={() => setShowGdriveGuide(false)}
      />

      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-mono font-semibold text-red-400">UPLOAD_FAILED</h4>
            <div className="text-xs font-mono text-red-300/80 mt-1 whitespace-pre-line">{displayError}</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
