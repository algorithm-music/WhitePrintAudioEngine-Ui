import Link from 'next/link';
import type { Metadata } from 'next';
import { WebApplicationJsonLd, OrganizationJsonLd } from '@/components/seo/json-ld';
import HeroUrlInput from '@/components/marketing/hero-url-input';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const features = [
  {
    title: 'AI Reads Your Sound',
    subtitle: 'BS.1770-4 Physical Analysis',
    description:
      'Loudness, true peak, dynamics, spectral balance, stereo width. Broadcast-standard measurement exposes the truth of your audio in hard numbers.',
    href: '/features/analysis',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: '3 AIs Deliberate. Then Decide.',
    subtitle: 'Multi-LLM Ensemble Engine',
    description:
      'OpenAI, Anthropic, Google. Three independent AIs analyze your track, debate the parameters, and reach consensus. Every recommendation, every rationale — visible.',
    href: '/features/deliberation',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    title: 'Mastering That Moves With the Music',
    subtitle: 'AI Dynamic DSP Chain',
    description:
      'Intro, verse, chorus, outro — different EQ, compression, and limiting for each section. Not static one-size-fits-all. Dynamic mastering that follows your song.',
    href: '/features/mastering',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
];

const stats = [
  { value: 'BS.1770-4', label: 'Broadcast Standard' },
  { value: '3 AIs', label: 'Deliberate Together' },
  { value: '25+', label: 'DSP Parameters' },
  { value: 'REST API', label: 'Full Automation' },
];

export default function LandingPage() {
  return (
    <>
      <WebApplicationJsonLd />
      <OrganizationJsonLd />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              AI Dynamic Mastering Engine
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              Listen. You&apos;ll hear it.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                3 AIs deliberate. Your track evolves.
              </span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Three AI models independently analyze your audio, debate the ideal parameters,
              and reach consensus — section by section. Every decision is transparent.
              <br />
              Black-box mastering is over.
            </p>
            <HeroUrlInput />
            <div className="flex items-center justify-center gap-4 mt-2">
              <Link
                href="/features/deliberation"
                className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors group"
              >
                Or see AI deliberation in action
                <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
                <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Why WhitePrint is different</h2>
            <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
              Other AI mastering returns a result. WhitePrint shows you the reason.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group p-8 rounded-xl border border-zinc-800 hover:border-indigo-500/50 bg-zinc-950 transition-all hover:bg-zinc-900/50"
              >
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-500/20 transition-colors">
                  {feature.icon}
                </div>
                <div className="text-xs font-mono text-indigo-400/70 mb-2">{feature.subtitle}</div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                  {feature.title}
                  <span className="inline-block ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">&rarr;</span>
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Paste a URL. Wait. Done.</h2>
            <p className="mt-4 text-zinc-400">No file upload. No plugins. No sessions.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Paste a cloud URL',
                desc: 'Google Drive, Dropbox, OneDrive, S3, GCS. Just paste the link — we fetch your audio directly.',
              },
              {
                step: '02',
                title: 'AIs analyze, deliberate, decide',
                desc: 'BS.1770-4 physical analysis runs first. Then three AIs independently deliberate and vote on section-by-section parameters.',
              },
              {
                step: '03',
                title: 'Download your master',
                desc: 'Consensus-driven DSP processing completes. WAV download with before/after metrics and full deliberation logs.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-mono font-bold text-indigo-500/30 mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiator */}
      <section className="py-24 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">
              &ldquo;Sounds good&rdquo; isn&apos;t good enough.
            </h2>
            <p className="mt-4 text-zinc-400">
              Every parameter has a reason. Every decision has evidence.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                label: 'Other AI Mastering',
                items: [
                  'Audio in, result out. Black box.',
                  'No explanation of what changed or why',
                  'No parameter control',
                  'Same processing for the entire track',
                ],
                bad: true,
              },
              {
                label: 'WhitePrint',
                items: [
                  '3 AIs independently recommend parameters with rationale',
                  'Full deliberation logs — see where they agree and disagree',
                  'Override any DSP parameter manually',
                  'Dynamic section-based mastering that follows the music',
                ],
                bad: false,
              },
            ].map((col) => (
              <div
                key={col.label}
                className={`p-8 rounded-xl border ${
                  col.bad
                    ? 'border-zinc-800 bg-zinc-950'
                    : 'border-indigo-500/50 bg-indigo-500/5'
                }`}
              >
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-6 ${
                  col.bad ? 'text-zinc-500' : 'text-indigo-400'
                }`}>
                  {col.label}
                </h3>
                <ul className="space-y-3">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      {col.bad ? (
                        <span className="text-zinc-600 mt-0.5">&#x2715;</span>
                      ) : (
                        <span className="text-indigo-400 mt-0.5">&#x2713;</span>
                      )}
                      <span className={col.bad ? 'text-zinc-500' : 'text-zinc-300'}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl font-bold text-white">
            Try it on your own track.
          </h2>
          <p className="text-zinc-400">
            Free. No signup. No credit card. Just listen.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/app"
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors"
            >
              Master Now
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-lg transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
