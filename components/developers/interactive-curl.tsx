'use client';

import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';

export default function InteractiveCurl() {
  const [apiKey, setApiKey] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const curl = useMemo(() => {
    const key = apiKey.trim() || 'YOUR_API_KEY';
    const url = audioUrl.trim() || 'https://your-storage.com/track.wav';
    return `curl -X POST https://aimastering.tech/api/master \\
  -H "Authorization: Bearer wpk_${key.replace(/^wpk_/, '')}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "audio_url": "${url}",
    "route": "full",
    "target_lufs": -14.0,
    "target_true_peak": -1.0
  }'`;
  }, [apiKey, audioUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(curl).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      {/* Input fields */}
      <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 space-y-2">
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-mono text-zinc-500 uppercase w-20 shrink-0">API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="YOUR_API_KEY"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-mono text-zinc-500 uppercase w-20 shrink-0">Audio URL</label>
          <input
            type="text"
            value={audioUrl}
            onChange={(e) => setAudioUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Generated cURL */}
      <div className="relative">
        <pre className="p-6 text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
          {curl}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-300 transition-colors"
        >
          {copied ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
      </div>
    </div>
  );
}
