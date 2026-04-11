import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developers — Audio Mastering API',
  description:
    'Integrate AI-powered audio mastering into your product. REST API with analysis, deliberation, and mastering endpoints.',
  alternates: { canonical: '/developers' },
};

const endpoints = [
  {
    method: 'POST',
    path: '/api/v1/jobs/master',
    route: 'full',
    desc: 'Full pipeline: analyze + deliberate + master. Returns mastered WAV.',
  },
  {
    method: 'POST',
    path: '/api/v1/jobs/master',
    route: 'analyze_only',
    desc: 'BS.1770-4 analysis only. Returns JSON metrics.',
  },
  {
    method: 'POST',
    path: '/api/v1/jobs/master',
    route: 'deliberation_only',
    desc: 'Analysis + AI deliberation. Returns JSON with parameters.',
  },
  {
    method: 'POST',
    path: '/api/v1/jobs/master',
    route: 'dsp_only',
    desc: 'Mastering with manual parameters. Returns mastered WAV.',
  },
];

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 font-mono mb-6">
            REST API
          </div>
          <h1 className="text-4xl font-bold text-white">Audio Mastering API</h1>
          <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
            Integrate AI-powered audio mastering directly into your application, DAW plugin,
            distribution platform, or CI/CD pipeline.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/developers/docs/quickstart"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Quickstart Guide
            </Link>
            <Link
              href="/developers/docs/reference"
              className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-lg transition-colors text-sm"
            >
              API Reference
            </Link>
          </div>
        </div>

        {/* Endpoints */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white mb-8">Endpoints</h2>
          <div className="space-y-4">
            {endpoints.map((ep) => (
              <div
                key={ep.route}
                className="flex items-start gap-4 p-6 rounded-xl border border-zinc-800 bg-zinc-950"
              >
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  {ep.method}
                </span>
                <div className="flex-1">
                  <div className="font-mono text-sm text-zinc-200">
                    {ep.path}{' '}
                    <span className="text-zinc-500">route=&quot;{ep.route}&quot;</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{ep.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white mb-8">Quick Example</h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              <span className="ml-2 text-xs text-zinc-500 font-mono">cURL</span>
            </div>
            <pre className="p-6 text-sm font-mono text-emerald-400 overflow-x-auto">
{`curl -X POST https://api.whiteprint.audio/api/v1/jobs/master \\
  -H "X-Api-Key: your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "audio_url": "https://storage.example.com/track.wav",
    "route": "full",
    "target_lufs": -14.0,
    "target_true_peak": -1.0
  }' \\
  -o mastered.wav`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
