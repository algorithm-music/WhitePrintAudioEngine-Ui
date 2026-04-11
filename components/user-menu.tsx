'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />;
  }

  if (!user) {
    return (
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
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
            {initial}
          </div>
        )}
        <span className="hidden sm:inline max-w-[120px] truncate">{displayName}</span>
        <svg className={`w-3 h-3 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop to close menu */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl z-50 py-1">
            <div className="px-4 py-3 border-b border-zinc-800">
              <div className="text-sm font-medium text-white truncate">{displayName}</div>
              <div className="text-xs text-zinc-500 truncate">{user.email}</div>
            </div>
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/app/history"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              History
            </Link>
            <Link
              href="/app/settings"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
            >
              Settings
            </Link>
            <div className="border-t border-zinc-800 mt-1 pt-1">
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-900 hover:text-red-300 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
