import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'BS.1770-4 Audio Analysis — LUFS, True Peak, LRA',
  description:
    'ITU broadcast-standard loudness measurement. Get LUFS integrated loudness, true peak dBTP, loudness range, crest factor, spectral analysis, and section detection.',
  alternates: { canonical: '/features/analysis' },
};

const metrics = [
  { name: 'Integrated LUFS', desc: 'BS.1770-4 compliant integrated loudness across the entire track.' },
  { name: 'True Peak (dBTP)', desc: 'Inter-sample true peak detection to prevent clipping on D/A conversion.' },
  { name: 'Loudness Range (LRA)', desc: 'Statistical measure of loudness variation per EBU R128.' },
  { name: 'Crest Factor', desc: 'Peak-to-RMS ratio indicating dynamic compression characteristics.' },
  { name: 'Stereo Width', desc: 'Mid/side correlation analysis across the frequency spectrum.' },
  { name: 'Spectral Balance', desc: 'Frequency distribution analysis in sub, low, mid, high-mid, and high bands.' },
  { name: 'BPM & Key', desc: 'Automatic tempo and musical key detection from audio signal.' },
  { name: 'Section Detection', desc: 'Automatic segmentation into intro, verse, chorus, bridge, and outro.' },
];

export default function AnalysisFeaturePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'WhitePrint AudioEngine — Analysis',
          applicationCategory: 'MultimediaApplication',
          featureList: metrics.map((m) => m.name),
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <Link href="/features" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            &larr; All Features
          </Link>
          <h1 className="mt-6 text-4xl font-bold text-white">BS.1770-4 Audio Analysis</h1>
          <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
            Broadcast-standard loudness measurement conforming to ITU-R BS.1770-4 and EBU R128.
            Extract comprehensive metrics from any audio file via cloud URL.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="p-6 rounded-xl border border-zinc-800 bg-zinc-950"
            >
              <h3 className="text-white font-semibold mb-2">{metric.name}</h3>
              <p className="text-sm text-zinc-400">{metric.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 rounded-xl border border-zinc-800 bg-zinc-950">
          <h2 className="text-xl font-bold text-white mb-4">Time-Series Envelopes</h2>
          <p className="text-zinc-400 mb-6">
            Beyond whole-track averages, WhitePrint generates time-series data for LUFS, crest factor,
            stereo width, spectral balance, and transient density. Visualize how your track evolves
            over time with interactive charts.
          </p>
          <Link
            href="/app"
            className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Analyze Your Track — Free
          </Link>
        </div>
      </div>
    </>
  );
}
