import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/json-ld';
import CheckoutButton from '@/components/marketing/checkout-button';

export const metadata: Metadata = {
  title: 'Pricing — AI Audio Mastering Plans',
  description:
    'Free, Standard, Pro, API, and White Label plans for AI-powered audio mastering. Start free with BS.1770-4 analysis and multi-LLM deliberation.',
  alternates: { canonical: '/pricing' },
};

const plans = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    annualPrice: null,
    period: '',
    annualNote: null,
    description: 'Experience the full AI mastering pipeline.',
    features: [
      '3 WAV masters per month',
      'BS.1770-4 full analysis + time-series',
      'Multi-LLM deliberation (3 models)',
      'Section-based mastering',
      'A/B comparison player',
      'Metrics dashboard',
    ],
    cta: 'Start Free',
    href: '/app',
    checkoutKey: null,
    highlighted: false,
    badge: null,
  },
  {
    name: 'Standard',
    monthlyPrice: '$67',
    annualPrice: '$54',
    period: '/mo',
    annualNote: '$648/yr billed annually (save $156)',
    description: 'For producers who master regularly.',
    features: [
      '30 WAV masters per month',
      'BS.1770-4 full analysis + time-series',
      'Multi-LLM deliberation (3 models)',
      'Section-based mastering',
      'Custom LUFS / True Peak targets',
      '90-day analysis history',
      'Email support',
    ],
    cta: 'Subscribe with USDT',
    href: '/signup?plan=standard',
    checkoutKey: 'standard',
    highlighted: false,
    badge: null,
  },
  {
    name: 'Pro',
    monthlyPrice: '$1,365',
    annualPrice: '$1,092',
    period: '/mo',
    annualNote: '$13,104/yr billed annually (save $3,276)',
    description: 'For professional engineers and labels.',
    features: [
      'Unlimited WAV masters',
      'BS.1770-4 full analysis + time-series',
      'Multi-LLM deliberation (3 models + full logs)',
      'Section-based mastering',
      'Custom DSP parameter override',
      'Batch processing (up to 10 tracks)',
      'Priority queue',
      'Unlimited analysis history',
      'Priority support',
    ],
    cta: 'Subscribe with USDT',
    href: '/signup?plan=pro',
    checkoutKey: 'pro',
    highlighted: true,
    badge: 'Popular',
  },
  {
    name: 'API',
    monthlyPrice: '$2,745',
    annualPrice: '$2,196',
    period: '/mo',
    annualNote: '$26,352/yr billed annually (save $6,588)',
    description: 'Integrate mastering into your product.',
    features: [
      'Everything in Pro',
      'REST API access',
      'Webhook notifications',
      '1,000 API calls/month',
      'Unlimited batch processing',
      'Custom LLM model selection',
      'Dedicated support + SLA',
      'SSO / team management',
    ],
    cta: 'Subscribe with USDT',
    href: '/contact',
    checkoutKey: 'api',
    highlighted: false,
    badge: 'B2B',
  },
  {
    name: 'White Label',
    monthlyPrice: '$6,883',
    annualPrice: '$5,506',
    period: '/mo',
    annualNote: '$66,072/yr billed annually (save $16,524)',
    description: 'Run mastering under your own brand.',
    features: [
      'Everything in API',
      'White-label (custom brand UI)',
      'Custom domain support',
      'Unlimited API calls',
      'Dedicated infrastructure',
      'Custom DSP chain configuration',
      'Custom LLM prompts',
      'Onboarding support',
      '24/7 dedicated support + 99.9% SLA',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    checkoutKey: null,
    highlighted: false,
    badge: 'Enterprise',
  },
];

const comparisonRows = [
  { feature: 'WAV mastering', free: '3/mo', standard: '30/mo', pro: 'Unlimited', api: 'Unlimited', whitelabel: 'Unlimited' },
  { feature: 'BS.1770-4 analysis', free: 'Full + time-series', standard: 'Full + time-series', pro: 'Full + time-series', api: 'Full + time-series', whitelabel: 'Full + time-series' },
  { feature: 'LLM deliberation', free: '3 models', standard: '3 models', pro: '3 + full logs', api: '3 + custom', whitelabel: 'Custom' },
  { feature: 'Section-based processing', free: 'Yes', standard: 'Yes', pro: 'Yes', api: 'Yes', whitelabel: 'Yes' },
  { feature: 'DSP parameter override', free: '-', standard: '-', pro: 'Yes', api: 'Yes', whitelabel: 'Custom chain' },
  { feature: 'Batch processing', free: '-', standard: '-', pro: 'Up to 10', api: 'Unlimited', whitelabel: 'Unlimited' },
  { feature: 'API access', free: '-', standard: '-', pro: '-', api: '1,000 calls/mo', whitelabel: 'Unlimited' },
  { feature: 'White label', free: '-', standard: '-', pro: '-', api: '-', whitelabel: 'Your brand' },
  { feature: 'Dedicated infra', free: '-', standard: '-', pro: '-', api: '-', whitelabel: 'Yes' },
  { feature: 'Analysis history', free: '7 days', standard: '90 days', pro: 'Unlimited', api: 'Unlimited', whitelabel: 'Unlimited' },
  { feature: 'Support', free: 'Community', standard: 'Email', pro: 'Priority', api: 'Dedicated + SLA', whitelabel: '24/7 + 99.9% SLA' },
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
            price: plan.annualPrice
              ? plan.annualPrice.replace('$', '').replace(',', '')
              : '0',
            priceCurrency: 'USD',
            description: plan.description,
          })),
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Start free. Upgrade when you need more. 14-day free trial on all paid plans.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-xl border ${
                plan.highlighted
                  ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20'
                  : 'border-zinc-800 bg-zinc-950'
              } flex flex-col relative`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-6 px-3 py-0.5 rounded-full text-xs font-bold ${
                    plan.highlighted
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-700 text-zinc-200'
                  }`}
                >
                  {plan.badge}
                </div>
              )}
              <h2 className="text-lg font-bold text-white">{plan.name}</h2>
              <div className="mt-3">
                {plan.annualPrice ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">{plan.annualPrice}</span>
                      <span className="text-sm text-zinc-500">{plan.period}</span>
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 line-through">
                      {plan.monthlyPrice}/mo
                    </div>
                    <div className="mt-1 text-xs text-indigo-400">{plan.annualNote}</div>
                  </>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{plan.monthlyPrice}</span>
                  </div>
                )}
              </div>
              <p className="mt-3 text-sm text-zinc-400">{plan.description}</p>
              <ul className="mt-6 space-y-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
                    <svg
                      className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.checkoutKey ? (
                <CheckoutButton
                  planKey={plan.checkoutKey}
                  label={plan.cta}
                  highlighted={plan.highlighted}
                />
              ) : (
                <Link
                  href={plan.href}
                  className={`mt-6 block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    plan.highlighted
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Differentiator */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white">WhitePrint vs the competition</h2>
            <p className="mt-3 text-zinc-400 text-sm">
              Features only WhitePrint provides at any price
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'Full deliberation transparency',
                desc: 'See what each of 3 AI models recommended and why. Every parameter, every rationale — not a black box.',
                others: 'Others: result only, no reasoning',
              },
              {
                title: 'BS.1770-4 certified measurement',
                desc: 'ITU broadcast-standard LUFS, true peak, and LRA. The same standard streaming platforms use.',
                others: 'Others: no standards compliance stated',
              },
              {
                title: 'REST API',
                desc: 'Everything in the web UI is available via API. Integrate into DAW plugins, distribution pipelines, CI/CD.',
                others: 'Others: no public API',
              },
              {
                title: 'Cloud URL input — no upload needed',
                desc: 'Paste a Google Drive, Dropbox, OneDrive, S3, or GCS link. We fetch and process directly.',
                others: 'Others: file upload required',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl border border-zinc-800 bg-zinc-950"
              >
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400 mb-3">{item.desc}</p>
                <p className="text-xs text-zinc-600 italic">{item.others}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-24 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Plan comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Feature</th>
                  <th className="text-center py-3 px-3 text-zinc-400 font-medium">Free</th>
                  <th className="text-center py-3 px-3 text-zinc-400 font-medium">Standard</th>
                  <th className="text-center py-3 px-3 text-zinc-400 font-medium">
                    <span className="text-indigo-400">Pro</span>
                  </th>
                  <th className="text-center py-3 px-3 text-zinc-400 font-medium">API</th>
                  <th className="text-center py-3 px-3 text-zinc-400 font-medium">White Label</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-zinc-800/50">
                    <td className="py-3 px-4 text-zinc-300">{row.feature}</td>
                    <td className="py-3 px-3 text-center text-zinc-500">{row.free}</td>
                    <td className="py-3 px-3 text-center text-zinc-400">{row.standard}</td>
                    <td className="py-3 px-3 text-center text-zinc-300">{row.pro}</td>
                    <td className="py-3 px-3 text-center text-zinc-300">{row.api}</td>
                    <td className="py-3 px-3 text-center text-zinc-300">{row.whitelabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Do I need a credit card for the free trial?',
                a: 'No. The Free plan requires no card. Paid plan 14-day trials are also card-free.',
              },
              {
                q: 'Can I change plans or cancel anytime?',
                a: 'Yes. Upgrade or downgrade anytime. Annual plans are prorated for the remaining period.',
              },
              {
                q: 'How is WhitePrint different from LANDR or eMastered?',
                a: 'WhitePrint is fully transparent. You see what 3 AI models each recommended and why. We provide BS.1770-4 certified measurements and a public REST API — features no competitor offers.',
              },
              {
                q: 'What happens if I exceed 1,000 API calls on the API plan?',
                a: 'Overage is billed at $0.07 per call. For high-volume usage, contact us for a custom plan.',
              },
            ].map((item) => (
              <div key={item.q} className="p-6 rounded-xl border border-zinc-800 bg-zinc-950">
                <h3 className="font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-sm text-zinc-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center text-sm text-zinc-500">
          All plans include BS.1770-4 analysis and multi-LLM deliberation.
          <br />
          Need a custom plan?{' '}
          <Link href="/contact" className="text-indigo-400 hover:text-indigo-300">
            Contact us
          </Link>
        </div>
      </div>
    </>
  );
}
