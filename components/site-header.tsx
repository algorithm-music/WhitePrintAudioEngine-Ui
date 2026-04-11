'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SiteHeaderProps {
  children?: React.ReactNode;
}

export default function SiteHeader({ children }: SiteHeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'DASHBOARD' },
    { href: '/api-docs', label: 'CURL_GEN' },
  ];

  return (
    <header className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
            <h1 className="font-mono text-sm font-semibold tracking-wider text-zinc-200">
              WhitePrint <span className="text-zinc-500 font-normal">AudioEngine</span>
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-xs font-mono">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  pathname === item.href
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {children}
        </div>
      </div>
    </header>
  );
}
