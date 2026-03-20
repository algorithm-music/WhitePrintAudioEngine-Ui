'use client';

import { useState } from 'react';
import { Terminal, Copy, CheckCircle2, Play } from 'lucide-react';

export default function CurlGenPage() {
  const [copied, setCopied] = useState(false);
  const [targetLufs, setTargetLufs] = useState('-14.0');
  const [targetTruePeak, setTargetTruePeak] = useState('-1.0');
  const [apiKey, setApiKey] = useState('sk_live_your_api_key_here');

  const curlCommand = `curl -X POST https://api.rendition.dev/v2/master \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@/path/to/your/mix.wav" \\
  -F "target_lufs=${targetLufs}" \\
  -F "target_true_peak=${targetTruePeak}" \\
  -F "engine=v2_14stage"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white flex items-center gap-3">
            <Terminal className="w-6 h-6 text-emerald-400" />
            CURL_GENERATOR
          </h1>
          <p className="text-sm text-zinc-400 font-mono mt-1">Generate cURL commands to interact with the Mastering API.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Config Panel */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-6 h-fit">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">API Key</label>
              <input 
                type="text" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="sk_live_..."
              />
            </div>
            
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">Target LUFS</label>
              <input 
                type="number" 
                step="0.1"
                value={targetLufs}
                onChange={(e) => setTargetLufs(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">Target True Peak (dBTP)</label>
              <input 
                type="number" 
                step="0.1"
                value={targetTruePeak}
                onChange={(e) => setTargetTruePeak(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Code Output */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between bg-zinc-900/50 px-4 py-3 border-b border-zinc-800">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono text-emerald-400 leading-relaxed">
              <code>{curlCommand}</code>
            </pre>
          </div>

          <div className="mt-auto p-4 bg-zinc-900/30 border-t border-zinc-800 flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-bold transition-colors">
              <Play className="w-4 h-4" />
              TEST REQUEST (MOCK)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
