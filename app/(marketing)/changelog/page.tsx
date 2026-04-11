import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Latest updates and improvements to WhitePrint AudioEngine.',
  alternates: { canonical: '/changelog' },
};

const releases = [
  {
    version: '0.1.0',
    date: '2026-04-11',
    title: 'Initial Public Release',
    changes: [
      'BS.1770-4 compliant audio analysis with LUFS, true peak, LRA, and spectral metrics',
      'Multi-LLM ensemble deliberation with OpenAI, Anthropic, and Google',
      'Automated DSP mastering with 25+ parameters',
      'Cloud URL input (Google Drive, Dropbox, OneDrive, S3, GCS)',
      'Interactive results dashboard with time-series charts',
      'A/B comparison audio player',
      'cURL command generator for API testing',
      'REST API with full, analyze_only, deliberation_only, and dsp_only routes',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold text-white">Changelog</h1>
      <p className="mt-4 text-zinc-400">
        All notable changes to WhitePrint AudioEngine.
      </p>

      <div className="mt-12 space-y-12">
        {releases.map((release) => (
          <div key={release.version} className="border-l-2 border-indigo-500/30 pl-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-sm font-bold text-indigo-400">v{release.version}</span>
              <span className="text-sm text-zinc-500">{release.date}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-4">{release.title}</h2>
            <ul className="space-y-2">
              {release.changes.map((change) => (
                <li key={change} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />
                  {change}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
