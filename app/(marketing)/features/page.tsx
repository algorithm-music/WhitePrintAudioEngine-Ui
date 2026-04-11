import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features — AI Audio Mastering & Analysis',
  description:
    'BS.1770-4 loudness analysis, multi-LLM ensemble deliberation, and automated DSP mastering. See every feature of WhitePrint AudioEngine.',
  alternates: { canonical: '/features' },
};

const featureCards = [
  {
    title: 'BS.1770-4 Analysis',
    description:
      'ITU broadcast-standard loudness measurement with LUFS, true peak, LRA, crest factor, spectral balance, stereo width, and automatic section detection.',
    href: '/features/analysis',
    highlights: ['LUFS / True Peak / LRA', 'Spectral Analysis', 'Section Detection', 'Time-series Envelopes'],
  },
  {
    title: 'Multi-LLM Deliberation',
    description:
      'Three independent AI models analyze your track metrics and vote on optimal mastering parameters through an ensemble consensus mechanism.',
    href: '/features/deliberation',
    highlights: ['OpenAI + Anthropic + Google', 'Ensemble Voting', 'Confidence Scores', 'Full Rationale'],
  },
  {
    title: 'Automated DSP Mastering',
    description:
      'Professional-grade DSP chain with 25+ parameters applied automatically based on AI consensus. Download mastered WAV with before/after metrics.',
    href: '/features/mastering',
    highlights: ['EQ / Compression / Limiting', 'Saturation / Stereo', 'Before & After Metrics', 'WAV Download'],
  },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold text-white">Features</h1>
        <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
          A transparent, three-stage pipeline from raw audio analysis to AI-deliberated mastering.
        </p>
      </div>

      <div className="space-y-8">
        {featureCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="block group p-8 md:p-10 rounded-xl border border-zinc-800 hover:border-indigo-500/50 bg-zinc-950 transition-all hover:bg-zinc-900/50"
          >
            <div className="md:flex md:items-start md:justify-between md:gap-12">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {card.title}
                </h2>
                <p className="mt-3 text-zinc-400 leading-relaxed">{card.description}</p>
              </div>
              <ul className="mt-6 md:mt-0 md:w-64 space-y-2 flex-shrink-0">
                {card.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
      </div>

      {/* Cloud URL Input */}
      <div className="mt-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">No file upload required</h2>
        <p className="text-zinc-400 max-w-xl mx-auto mb-8">
          Paste a URL from Google Drive, Dropbox, OneDrive, Amazon S3, or Google Cloud Storage.
          WhitePrint fetches and processes your audio directly from the cloud.
        </p>
        <Link
          href="/app"
          className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Try It Now — No Signup
        </Link>
      </div>
    </div>
  );
}
