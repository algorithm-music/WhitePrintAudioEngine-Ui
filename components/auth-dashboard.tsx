import { useState } from 'react';
import Link from 'next/link';
import { PlayCircle, Clock, Zap, ExternalLink, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import HeroUrlInput from '@/components/marketing/hero-url-input';
import type { User } from '@supabase/supabase-js';

type AuthDashboardContentProps = {
  user: User;
  onSubmit: (url: string) => void;
  error?: string | null;
};

export default function AuthDashboardContent({ user, onSubmit, error }: AuthDashboardContentProps) {
  return (
    <div className="bg-[#0a0a0a] text-zinc-100 flex flex-col pt-8 pb-20 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto px-6 w-full space-y-12">
        
        {/* Header / Greeting */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">{user.email?.split('@')[0]}</span>
          </h1>
          <p className="text-sm text-zinc-400 font-mono mt-2">Ready to master your next session?</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Workspace Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Action Box */}
            <div className="p-8 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Start New Master</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">Initialize a 3-agent deliberation process</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <HeroUrlInput onSubmit={onSubmit} />
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm max-w-2xl mx-auto flex items-start gap-3 text-left">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-medium mb-0.5">Analysis Failed</strong>
                        {error}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* How To Use */}
            <div className="p-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/20">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                How to Use WhitePrint
              </h3>
              
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-xs font-mono text-indigo-400 font-bold bg-indigo-500/10 inline-block px-2 py-0.5 rounded border border-indigo-500/20">Step 01</div>
                  <h4 className="text-sm font-semibold text-zinc-200">Upload to Cloud</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Upload your unmastered <code>.wav</code> mix to Google Drive. Ensure the sharing settings are set to **&quot;Anyone with the link&quot;**.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-mono text-indigo-400 font-bold bg-indigo-500/10 inline-block px-2 py-0.5 rounded border border-indigo-500/20">Step 02</div>
                  <h4 className="text-sm font-semibold text-zinc-200">Paste URL</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Copy the link and paste it into the analyzer above. The engine will instantly fetch, analyze, and map the dynamics of your track.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-mono text-indigo-400 font-bold bg-indigo-500/10 inline-block px-2 py-0.5 rounded border border-indigo-500/20">Step 03</div>
                  <h4 className="text-sm font-semibold text-zinc-200">Deliberate</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Watch as 3 AIs deliberate over the optimal EQ and dynamics. Download the finished broadcast-ready master.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Current Plan */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-950/50">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-1">Current Plan</h3>
                  <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-2">
                    Early Access Beta
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>
              
              <ul className="space-y-3 text-xs text-zinc-400">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  Unlimited Analyses
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  High-Fidelity 3-Agent Deliberation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  WAV 44.1kHz/48kHz Encoding
                </li>
              </ul>
              
              <div className="mt-6 pt-6 border-t border-zinc-800/60">
                <Link href="/pricing" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center justify-between group">
                  UPGRADE PLAN
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20">
              <h3 className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-4">Quick Navigation</h3>
              <div className="space-y-2">
                <Link href="/app/history" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors group border border-transparent hover:border-zinc-700/50">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-200 group-hover:text-white">Mastering History</div>
                    <div className="text-[10px] text-zinc-500">View past sessions & metrics</div>
                  </div>
                </Link>

                <Link href="#" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors group border border-transparent hover:border-zinc-700/50 cursor-not-allowed opacity-50">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">Account Settings</div>
                    <div className="text-[10px] text-zinc-500">Coming soon</div>
                  </div>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
