'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import SiteHeader from '@/components/site-header';

type BillingInfo = {
  plan: string;
  tracks_used: number;
  tracks_limit: number;
  period_start: string;
  period_end: string;
  payment_provider: string;
};

type Profile = {
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login?redirect=/app/settings';
        return;
      }

      const [profileRes, billingRes] = await Promise.all([
        supabase.from('profiles').select('email, full_name, avatar_url, company').eq('id', user.id).single(),
        supabase.from('billing').select('plan, tracks_used, tracks_limit, period_start, period_end, payment_provider').eq('user_id', user.id).single(),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setFullName(profileRes.data.full_name || '');
        setCompany(profileRes.data.company || '');
      } else {
        setProfile({ email: user.email || null, full_name: null, avatar_url: null, company: null });
      }

      if (billingRes.data) {
        setBilling(billingRes.data);
      }

      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName, company, updated_at: new Date().toISOString() });

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save profile.' });
    } else {
      setMessage({ type: 'success', text: 'Profile updated.' });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center">
        <div className="w-6 h-6 rounded bg-indigo-500 animate-pulse" />
      </main>
    );
  }

  const planLabel = billing?.plan?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Free';
  const periodEnd = billing?.period_end ? new Date(billing.period_end).toLocaleDateString() : null;
  const usagePercent = billing ? Math.min(100, Math.round((billing.tracks_used / billing.tracks_limit) * 100)) : 0;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
      <SiteHeader>
        <Link href="/app" className="text-xs font-mono text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded border border-zinc-800 hover:border-zinc-600">
          [ BACK ]
        </Link>
      </SiteHeader>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>

        {/* Profile */}
        <section className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4">
          <h2 className="text-lg font-semibold text-white">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <div className="text-sm text-zinc-300">{profile?.email || '—'}</div>
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm text-zinc-400 mb-1">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm text-zinc-400 mb-1">Company</label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                placeholder="Company name (optional)"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              {message && (
                <span className={`text-xs ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {message.text}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Plan & Usage */}
        <section className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4">
          <h2 className="text-lg font-semibold text-white">Plan & Usage</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-zinc-500">Current Plan</div>
              <div className="text-white font-medium">{planLabel}</div>
            </div>
            {periodEnd && (
              <div>
                <div className="text-zinc-500">Renews</div>
                <div className="text-white font-medium">{periodEnd}</div>
              </div>
            )}
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-zinc-400">Mastering this period</span>
              <span className="text-zinc-300">
                {billing?.tracks_used ?? 0} / {billing?.tracks_limit ?? 3}
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' : 'bg-indigo-500'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-block text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {billing?.plan === 'free' || !billing ? 'Upgrade plan' : 'Change plan'} &rarr;
          </Link>
        </section>

        {/* Sign Out */}
        <section className="p-6 rounded-xl border border-zinc-800 bg-zinc-950">
          <button
            onClick={handleSignOut}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Sign out
          </button>
        </section>
      </div>
    </main>
  );
}
