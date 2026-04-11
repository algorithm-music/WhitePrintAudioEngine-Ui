import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Pricing — AI Audio Mastering Plans',
  description:
    'Free, Pro, and API plans for AI-powered audio mastering. Start free with BS.1770-4 analysis and multi-LLM deliberation.',
  alternates: { canonical: '/pricing' },
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Try the full pipeline on your tracks.',
    features: [
      '3 masters per month',
      'BS.1770-4 analysis',
      'Multi-LLM deliberation',
      'WAV download',
      'Basic metrics dashboard',
    ],
    cta: 'Get Started',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For producers and engineers who master regularly.',
    features: [
      'Unlimited masters',
      'Priority processing',
      'Full analysis history',
      'Section-based mastering',
      'A/B comparison player',
      'Custom target LUFS',
      'Email support',
    ],
    cta: 'Start Pro Trial',
    href: '/signup?plan=pro',
    highlighted: true,
  },
  {
    name: 'API',
    price: '$99',
    period: '/month',
    description: 'Integrate mastering into your product or workflow.',
    features: [
      'Everything in Pro',
      'REST API access',
      'Webhook notifications',
      '1,000 API calls/month',
      'Batch processing',
      'Dedicated support',
      'Custom SLA available',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'WhitePrint AudioEngine',
          description: 'AI-powered audio mastering service',
          offers: plans.map((plan) => ({
            '@type': 'Offer',
            name: plan.name,
            price: plan.price.replace('$', ''),
            priceCurrency: 'USD',
            description: plan.description,
          })),
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-zinc-400">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-xl border ${
                plan.highlighted
                  ? 'border-indigo-500 bg-indigo-500/5'
                  : 'border-zinc-800 bg-zinc-950'
              } flex flex-col`}
            >
              {plan.highlighted && (
                <div className="text-xs font-mono text-indigo-400 mb-4 uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-zinc-500">{plan.period}</span>
              </div>
              <p className="mt-3 text-sm text-zinc-400">{plan.description}</p>
              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-8 block text-center py-3 rounded-lg font-medium text-sm transition-colors ${
                  plan.highlighted
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-zinc-500">
          All plans include BS.1770-4 analysis, multi-LLM deliberation, and WAV download.
          <br />
          Need a custom plan?{' '}
          <Link href="/contact" className="text-indigo-400 hover:text-indigo-300">
            Contact us
          </Link>
          .
        </div>
      </div>
    </>
  );
}
