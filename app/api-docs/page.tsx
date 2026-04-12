'use client';

import { useState } from 'react';
import { Terminal, Copy, CheckCircle2 } from 'lucide-react';
import MarketingHeader from '@/components/layout/marketing-header';

const ROUTE_OPTIONS = [
  { value: 'full', label: 'full — Analyze + Deliberation + Mastering' },
  { value: 'analyze_only', label: 'analyze_only — Audio Analysis Only' },
  { value: 'deliberation_only', label: 'deliberation_only — Analysis + AI Deliberation' },
  { value: 'dsp_only', label: 'dsp_only — DSP Mastering (manual_params required)' },
];

export default function CurlGenPage() {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://your-concertmaster-url.a.run.app');
  const [apiKey, setApiKey] = useState('your-api-key-here');
  const [audioUrl, setAudioUrl] = useState('https://www.dropbox.com/s/example/track.wav?dl=1');
  const [route, setRoute] = useState('full');
  const [targetLufs, setTargetLufs] = useState('-14.0');
  const [targetTruePeak, setTargetTruePeak] = useState('-1.0');

  const curlCommand = `curl -X POST ${baseUrl}/api/v1/jobs/master \\
  -H "X-Api-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "audio_url": "${audioUrl}",
    "route": "${route}",
    "target_lufs": ${targetLufs},
    "target_true_peak": ${targetTruePeak}
  }'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
    <MarketingHeader />
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white flex items-center gap-3">
            <Terminal className="w-6 h-6 text-emerald-400" />
            CURL_GENERATOR
          </h1>
          <p className="text-sm text-zinc-400 font-mono mt-1">Generate cURL commands for the WhitePrint Mastering API.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Config Panel */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-6 h-fit">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">API Base URL</label>
              <input 
                type="text" 
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">X-Api-Key</label>
              <input 
                type="text" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="your-api-key"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">Audio URL</label>
              <input 
                type="text" 
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="https://dropbox.com/..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2">Route</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {ROUTE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
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

          <div className="mt-auto p-4 bg-zinc-900/30 border-t border-zinc-800">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs font-mono text-indigo-300">
              <strong>Note:</strong> The <code>full</code> and <code>dsp_only</code> routes return <code>audio/wav</code> binary. Add <code>-o master.wav</code> to save the output file.
              The <code>analyze_only</code> and <code>deliberation_only</code> routes return JSON.
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
