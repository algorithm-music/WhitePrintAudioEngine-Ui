import Link from 'next/link';
import MarketingHeader from '@/components/layout/marketing-header';

const sidebarLinks = [
  { href: '/developers/docs/quickstart', label: 'Quickstart' },
  { href: '/developers/docs/reference', label: 'API Reference' },
  { href: '/developers/docs/examples', label: 'Code Examples' },
  { href: '/developers/docs/specification', label: 'Technical Specification' },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <MarketingHeader />
      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-12">
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            <Link
              href="/developers"
              className="block text-xs font-mono text-indigo-400 hover:text-indigo-300 mb-4"
            >
              &larr; API Overview
            </Link>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
              Documentation
            </h3>
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
