'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu from '@/components/user-menu';

import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const marketingNavItems = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/developers', label: 'Developers' },
  { href: '/blog', label: 'Blog' },
];

const appNavItems = [
  { href: '/', label: 'DASHBOARD' },
  { href: '/app/history', label: 'HISTORY' },
  { href: '/developers/docs', label: 'API_DOCS' },
];

export default function MarketingHeader({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = user ? appNavItems : marketingNavItems;

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
            {!loading && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href
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
          {children}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
