'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroUrlInput() {
  const [url, setUrl] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      router.push('/app');
      return;
    }
    // Encode the URL and pass it to /app as a query param
    router.push(`/app?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste audio URL — Dropbox, Google Drive, S3..."
            className="w-full bg-zinc-900/80 border border-zinc-700 hover:border-zinc-600 focus:border-indigo-500 rounded-lg px-4 py-3.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-sm whitespace-nowrap flex-shrink-0"
        >
          Master Now
        </button>
      </div>
      <p className="mt-3 text-xs text-zinc-600 text-center">
        Free. No signup. Supports Google Drive, Dropbox, OneDrive, S3, GCS.
      </p>
    </form>
  );
}
