import Link from 'next/link';

const footerLinks = {
  Product: [
    { href: '/features', label: 'Features' },
    { href: '/features/analysis', label: 'Analysis' },
    { href: '/features/deliberation', label: 'AI Deliberation' },
    { href: '/features/mastering', label: 'Mastering' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/changelog', label: 'Changelog' },
  ],
  Developers: [
    { href: '/developers', label: 'API Overview' },
    { href: '/developers/docs/quickstart', label: 'Quickstart' },
    { href: '/developers/docs/reference', label: 'API Reference' },
    { href: '/developers/docs/examples', label: 'Examples' },
    { href: '/developers/docs/specification', label: 'Specification' },
  ],
  Company: [
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ],
  Legal: [
    { href: '/legal/terms', label: 'Terms of Service' },
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/legal/cookies', label: 'Cookie Policy' },
    { href: '/legal/acceptable-use', label: 'Acceptable Use' },
    { href: '/legal/tokushoho', label: 'Tokushoho (JP)' },
  ],
};

export default function MarketingFooter() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-zinc-300 mb-4">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="font-mono text-xs text-zinc-500">WhitePrint AudioEngine</span>
          </div>
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} WhitePrint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
