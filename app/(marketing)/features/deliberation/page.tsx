import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-LLM Deliberation — AI Mastering Parameters',
  description:
    'Three AI models independently analyze audio metrics and vote on optimal mastering parameters. OpenAI, Anthropic, and Google ensemble with full transparency.',
  alternates: { canonical: '/features/deliberation' },
};

const models = [
  { name: 'OpenAI', desc: 'GPT-series model providing parameter recommendations with detailed rationale.' },
  { name: 'Anthropic', desc: 'Claude-series model offering alternative perspective on mastering decisions.' },
  { name: 'Google', desc: 'Gemini-series model contributing third independent analysis for ensemble voting.' },
];

const outputs = [
  'Gain staging recommendations',
  'Multi-band EQ curves (5-8 bands)',
  'Compression ratio, threshold, attack, release',
  'Limiter ceiling and release',
  'Saturation amount and character',
  'Stereo width adjustments',
  'Per-section dynamic mastering',
  'Confidence scores per parameter',
];

export default function DeliberationFeaturePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="max-w-3xl">
        <Link href="/features" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          &larr; All Features
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-white">Multi-LLM Ensemble Deliberation</h1>
        <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
          Unlike single-model mastering services, WhitePrint uses three independent AI models that
          analyze your track and vote on optimal parameters. You see every recommendation and the
          reasoning behind the consensus.
        </p>
      </div>

      {/* Models */}
      <div className="mt-16 grid md:grid-cols-3 gap-6">
        {models.map((model) => (
          <div key={model.name} className="p-6 rounded-xl border border-zinc-800 bg-zinc-950">
            <h3 className="text-white font-semibold mb-2">{model.name}</h3>
            <p className="text-sm text-zinc-400">{model.desc}</p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="mt-16 p-8 rounded-xl border border-zinc-800 bg-zinc-950">
        <h2 className="text-xl font-bold text-white mb-6">Ensemble Voting Process</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Independent Analysis', desc: 'Each model receives the BS.1770-4 analysis data and independently determines mastering parameters.' },
            { step: '2', title: 'Consensus Voting', desc: 'Parameters are compared and consensus values are computed with confidence scores reflecting agreement level.' },
            { step: '3', title: 'Transparent Output', desc: 'You see each model\'s individual recommendations, the final consensus, and rationale for every decision.' },
          ].map((item) => (
            <div key={item.step}>
              <div className="text-2xl font-mono font-bold text-indigo-500/40 mb-2">{item.step}</div>
              <h3 className="text-white font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Output Parameters */}
      <div className="mt-16">
        <h2 className="text-xl font-bold text-white mb-6">Deliberation Output</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {outputs.map((item) => (
            <div key={item} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
              <span className="text-sm text-zinc-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/app"
          className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Try Deliberation Now
        </Link>
      </div>
    </div>
  );
}
