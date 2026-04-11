'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/developers', label: 'Developers' },
  { href: '/blog', label: 'Blog' },
];

export default function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-wider text-zinc-200">
              WhitePrint <span className="text-zinc-500 font-normal">AudioEngine</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname.startsWith(item.href)
                    ? 'text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
          >
            Log in
          </Link>
          <Link
            href="/app"
            className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2 rounded-lg"
          >
            Try Now
          </Link>
        </div>
      </div>
    </header>
  );
}
