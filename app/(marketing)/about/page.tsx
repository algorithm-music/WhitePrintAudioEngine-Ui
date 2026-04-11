import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Our Mission',
  description:
    'WhitePrint AudioEngine brings transparency to AI audio mastering. Learn about our mission, technology, and approach.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold text-white">About WhitePrint</h1>

      <div className="mt-12 space-y-8 text-zinc-400 leading-relaxed">
        <p>
          WhitePrint AudioEngine was born from a simple frustration: existing AI mastering services
          are black boxes. You upload a track, wait, and receive a result with no insight into what
          happened or why.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">Our Mission</h2>
        <p>
          We believe audio engineers and music producers deserve full transparency into the mastering
          process. Every parameter decision should be explainable, every measurement should be
          standards-compliant, and every step should be auditable.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">The Technology</h2>
        <p>
          WhitePrint uses a three-stage pipeline that separates concerns cleanly:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            <strong className="text-zinc-200">Analysis</strong> — BS.1770-4 compliant measurement
            extracts objective metrics from your audio.
          </li>
          <li>
            <strong className="text-zinc-200">Deliberation</strong> — Three independent LLMs review
            the metrics and vote on mastering parameters through ensemble consensus.
          </li>
          <li>
            <strong className="text-zinc-200">Mastering</strong> — A deterministic DSP chain applies
            the consensus parameters. Same input + same parameters = same output, always.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-white pt-4">Why Multi-LLM?</h2>
        <p>
          No single AI model has a monopoly on good judgment. By using multiple providers (OpenAI,
          Anthropic, and Google), we reduce individual model bias and increase reliability through
          consensus. You can see where models agree and where they diverge.
        </p>

        <h2 className="text-2xl font-bold text-white pt-4">API-First</h2>
        <p>
          WhitePrint is built API-first. Everything you can do in the web interface is available via
          REST API, making it easy to integrate intelligent mastering into DAWs, distribution
          platforms, podcast toolchains, or any audio workflow.
        </p>
      </div>
    </div>
  );
}
