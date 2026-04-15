'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, Upload, FileAudio, Loader2 } from 'lucide-react';
import GDriveGuide from '@/components/gdrive-guide';

const ACCEPTED_EXTENSIONS = '.wav,.flac,.aiff,.aif,.mp3';
const MAX_FILE_SIZE = 200 * 1024 * 1024;

export default function HeroUrlInput({ onSubmit }: { onSubmit?: (url: string) => void }) {
  const [url, setUrl] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    if (onSubmit) {
      onSubmit(url.trim());
    } else {
      router.push(`/?url=${encodeURIComponent(url.trim())}`);
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadError(null);
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 200MB)`);
      return;
    }

    setIsUploading(true);
    setUploadMsg(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const resp = await fetch('/api/upload', { method: 'POST', body: formData });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: `Upload failed (${resp.status})` }));
        throw new Error(err.error || `Upload failed: ${resp.status}`);
      }

      const data = await resp.json();
      setIsUploading(false);
      setUploadMsg(null);

      if (onSubmit) {
        onSubmit(data.url);
      } else {
        router.push(`/?url=${encodeURIComponent(data.url)}`);
      }
    } catch (err) {
      setIsUploading(false);
      setUploadMsg(null);
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    }
  }, [onSubmit, router]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  }, [handleFileUpload]);

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* URL input */}
          <div className="flex-1 relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste audio URL — or upload a file →"
              className="w-full bg-zinc-900/80 border border-zinc-700 hover:border-zinc-600 focus:border-indigo-500 rounded-lg px-4 py-3.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none transition-colors"
              disabled={isUploading}
            />
          </div>

          {/* File upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 border border-zinc-700 text-zinc-200 font-bold rounded-lg transition-colors text-sm whitespace-nowrap flex-shrink-0"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>

          {/* Master button */}
          <button
            type="submit"
            disabled={isUploading}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-lg transition-colors text-sm whitespace-nowrap flex-shrink-0"
          >
            Master Now
          </button>
        </div>

        {/* Status / Error */}
        {uploadMsg && (
          <div className="mt-3 flex items-center gap-2 text-xs text-indigo-400 font-mono animate-pulse">
            <FileAudio className="w-3 h-3" />
            {uploadMsg}
          </div>
        )}
        {uploadError && (
          <div className="mt-3 text-xs text-red-400 font-mono">
            {uploadError}
          </div>
        )}
        {!uploadMsg && !uploadError && (
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-zinc-600">
            <span>Free. No signup. Upload WAV/FLAC or use Google Drive, Dropbox, S3.</span>
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="inline-flex items-center gap-1 text-indigo-400/60 hover:text-indigo-400 transition-colors"
            >
              <HelpCircle className="w-3 h-3" />
              共有方法
            </button>
          </div>
        )}
      </form>

      {showGuide && <GDriveGuide onClose={() => setShowGuide(false)} />}
    </>
  );
}
