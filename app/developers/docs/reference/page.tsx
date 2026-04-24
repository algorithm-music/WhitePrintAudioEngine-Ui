import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Reference — Endpoints & Parameters',
  description: 'Complete API reference for WhitePrint Mastering API. Endpoints, parameters, response formats, and error codes.',
  alternates: { canonical: '/developers/docs/reference' },
};

export default function ReferencePage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-white">API Reference</h1>
      <p className="mt-4 text-zinc-400">
        Complete endpoint documentation for the WhitePrint Mastering API.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-white mb-4">Base URL</h2>
        <code className="block p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-mono text-emerald-400">
          https://www.aimastering.tech
        </code>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-white mb-4">Authentication</h2>
        <p className="text-sm text-zinc-400 mb-3">
          All requests require an API key via the <code className="text-indigo-400">Authorization: Bearer wpk_...</code> header.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">POST /api/v1/jobs/master</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Submit an audio mastering job. The behavior depends on the <code className="text-indigo-400">route</code> parameter.
        </p>

        <h3 className="text-lg font-semibold text-white mb-4">Request Body</h3>
        <div className="space-y-3">
          {[
            { param: 'audio_url', type: 'string', required: true, desc: 'Direct download URL of the audio file.' },
            { param: 'route', type: 'string', required: true, desc: '"full" | "analyze_only" | "deliberation_only" | "dsp_only"' },
            { param: 'target_lufs', type: 'number', required: false, desc: 'Target integrated loudness in LUFS. Default: -14.0' },
            { param: 'target_true_peak', type: 'number', required: false, desc: 'Target true peak in dBTP. Default: -1.0' },
            { param: 'manual_params', type: 'object', required: false, desc: 'Manual DSP parameters (required for dsp_only route).' },
          ].map((p) => (
            <div key={p.param} className="p-4 rounded-lg border border-zinc-800 bg-zinc-950">
              <div className="flex items-center gap-3 mb-1">
                <code className="text-sm font-mono text-zinc-200">{p.param}</code>
                <span className="text-xs text-zinc-600">{p.type}</span>
                {p.required && <span className="text-xs text-red-400">required</span>}
              </div>
              <p className="text-xs text-zinc-400">{p.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-semibold text-white mt-8 mb-4">Response Codes</h3>
        <div className="space-y-2">
          {[
            { code: '200', desc: 'Success. Body contains WAV (full/dsp_only) or JSON (analyze_only/deliberation_only).' },
            { code: '400', desc: 'Invalid request parameters.' },
            { code: '401', desc: 'Missing or invalid API key.' },
            { code: '402', desc: 'Usage limit exceeded.' },
            { code: '422', desc: 'Audio URL could not be fetched or is not a valid audio file.' },
            { code: '500', desc: 'Internal server error.' },
            { code: '504', desc: 'Processing timeout (limit: 5 minutes).' },
          ].map((c) => (
            <div key={c.code} className="flex items-start gap-3 text-sm">
              <code className="font-mono text-zinc-300 w-10">{c.code}</code>
              <span className="text-zinc-400">{c.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
