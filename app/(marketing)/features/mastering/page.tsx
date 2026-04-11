import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Automated DSP Mastering — EQ, Compression, Limiting',
  description:
    'Professional DSP chain with 25+ parameters: EQ, compression, limiting, saturation, stereo processing. Applied automatically based on AI consensus.',
  alternates: { canonical: '/features/mastering' },
};

const dspChain = [
  { name: 'Gain Staging', desc: 'Optimal input level calibration before processing.' },
  { name: 'Parametric EQ', desc: 'Multi-band equalization with surgical precision (5-8 bands).' },
  { name: 'Multiband Compression', desc: 'Frequency-dependent dynamics control for balanced tonality.' },
  { name: 'Bus Compression', desc: 'Glue compression for cohesive mix bus character.' },
  { name: 'Saturation', desc: 'Harmonic enhancement with selectable character (tape, tube, digital).' },
  { name: 'Stereo Processing', desc: 'Mid/side adjustments and stereo width optimization.' },
  { name: 'True Peak Limiting', desc: 'Brickwall limiting with true peak detection for streaming compliance.' },
  { name: 'Dithering', desc: 'Noise-shaped dithering for optimal bit-depth reduction.' },
];

export default function MasteringFeaturePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="max-w-3xl">
        <Link href="/features" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          &larr; All Features
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-white">Automated DSP Mastering</h1>
        <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
          A professional-grade DSP chain applies the AI-deliberated parameters to your audio.
          Download mastered WAV with comprehensive before/after metrics.
        </p>
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-bold text-white mb-6">Signal Chain</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {dspChain.map((item, i) => (
            <div key={item.name} className="flex gap-4 p-6 rounded-xl border border-zinc-800 bg-zinc-950">
              <div className="text-lg font-mono font-bold text-indigo-500/30 w-8 flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{item.name}</h3>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-8">
        <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-950">
          <h2 className="text-xl font-bold text-white mb-4">Section-Based Processing</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Unlike one-size-fits-all mastering, WhitePrint applies different parameter sets to each
            detected section (intro, verse, chorus, bridge, outro) for dynamic, musical results.
          </p>
        </div>
        <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-950">
          <h2 className="text-xl font-bold text-white mb-4">Before & After Metrics</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Every mastered track includes full metric comparison: LUFS, true peak, LRA, spectral
            balance, and stereo width measured before and after processing.
          </p>
        </div>
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/app"
          className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Master Your Track — Free
        </Link>
      </div>
    </div>
  );
}
