'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud, FileAudio, AlertCircle,
  ArrowRight, Terminal, Github, Music2,
  BrainCircuit, Layers, Zap, Lock, Code2,
  ChevronRight,
} from 'lucide-react';
import { useLocale } from '@/lib/locale-context';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LandingPageProps {
  onUpload: (file: File) => void;
  error: string | null;
}

/* ─── Comparison Table Data ─────────────────────────────────────────── */
const competitors = [
  { name: 'LANDR',       price: '$3.99–$9.99', transparent: false, api: false },
  { name: 'eMastered',   price: '$3.99',        transparent: false, api: false },
  { name: 'CloudBounce', price: '$2.99–$6.99',  transparent: false, api: false },
];

/* ─── Pipeline Steps ─────────────────────────────────────────────────── */
type PipelineKey = 'concertmaster' | 'audition' | 'deliberation' | 'rendition';
const PIPELINE_STEPS: { key: PipelineKey; color: string; icon: React.ReactNode }[] = [
  { key: 'concertmaster', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10', icon: <Layers className="w-5 h-5" /> },
  { key: 'audition',      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', icon: <Music2 className="w-5 h-5" /> },
  { key: 'deliberation',  color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',  icon: <BrainCircuit className="w-5 h-5" /> },
  { key: 'rendition',     color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',     icon: <Zap className="w-5 h-5" /> },
];

/* ─── TRIVIUM Sages ──────────────────────────────────────────────────── */
const SAGES = [
  { name: 'GRAMMATICA', provider: 'OpenAI GPT-5.4',         color: 'border-emerald-500/30 bg-emerald-500/5' },
  { name: 'LOGICA',     provider: 'Anthropic Claude Opus 4.6', color: 'border-indigo-500/30 bg-indigo-500/5' },
  { name: 'RHETORICA',  provider: 'Google Gemini 3.1 Pro',  color: 'border-amber-500/30 bg-amber-500/5' },
];

/* ─── Pricing Plans ──────────────────────────────────────────────────── */
type PlanKey = 'pricing_free' | 'pricing_indie' | 'pricing_pro' | 'pricing_enterprise';
const PLANS: { key: PlanKey; price: string; highlight?: boolean; features: string[] }[] = [
  { key: 'pricing_free',       price: '$0',    features: ['1×/mo (watermark)', '5× analyze', 'Blueprint JSON', '—', '—', '—'] },
  { key: 'pricing_indie',      price: '$29',   features: ['30×/mo', 'Unlimited', 'Blueprint JSON', '—', '—', '—'] },
  { key: 'pricing_pro',        price: '$99',   highlight: true, features: ['150×/mo', 'Unlimited', 'Blueprint JSON', '✓ Manual', '✓ Edit & Re-render', '✓'] },
  { key: 'pricing_enterprise', price: 'Custom',features: ['Custom', 'Unlimited', 'Blueprint JSON', '✓ Custom TRIVIUM', '✓', '✓ SLA'] },
];

/* ─── Social Proof Numbers ───────────────────────────────────────────── */
type ProofKey = 'proof_beatport' | 'proof_youtube' | 'proof_tracks' | 'proof_spotify' | 'proof_codebase';
const PROOF: { key: ProofKey; value: string }[] = [
  { key: 'proof_beatport',  value: '110' },
  { key: 'proof_youtube',   value: '39,872' },
  { key: 'proof_tracks',    value: '180+' },
  { key: 'proof_spotify',   value: '20yr' },
  { key: 'proof_codebase',  value: '4,326L' },
];

/* ════════════════════════════════════════════════════════════════════════
   Main Component
════════════════════════════════════════════════════════════════════════ */
export default function LandingPage({ onUpload, error }: LandingPageProps) {
  const { t } = useLocale();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) onUpload(file);
  }, [onUpload]);
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }, [onUpload]);

  return (
    <div className="w-full">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative border-b border-zinc-800/50 overflow-hidden">
        {/* grid bg */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 flex flex-col items-center text-center gap-8">
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            OPEN-BOX AI MASTERING ENGINE — v2.0.0
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-mono font-bold tracking-tighter text-white text-balance leading-tight"
          >
            {t('hero_title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-2xl leading-relaxed text-pretty"
          >
            {t('hero_sub')}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-zinc-500 text-sm max-w-xl leading-relaxed"
          >
            {t('hero_tagline')}
          </motion.p>

          {/* curl snippet */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden text-left"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/40">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/50 border border-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50 border border-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/50 border border-green-500/70" />
              <span className="ml-2 text-xs font-mono text-zinc-500">terminal</span>
            </div>
            <pre className="text-xs font-mono text-emerald-400 leading-relaxed p-5 overflow-x-auto">{`curl -X POST https://api.aimastering.tech/api/v1/jobs/master \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -d '{
    "audio_url": "https://your-storage.com/track.wav",
    "route": "full",
    "target_lufs": -14.0,
    "target_true_peak": -1.0
  }' \\
  --output mastered.wav`}</pre>
          </motion.div>

          {/* scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center gap-2 text-zinc-600"
          >
            <div className="w-px h-8 bg-zinc-800" />
            <span className="text-xs font-mono">↓</span>
          </motion.div>
        </div>
      </section>

      {/* ── UPLOAD ────────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-800/50 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center gap-8">
          <SectionLabel text={t('upload_title')} />

          <p className="text-zinc-400 font-mono text-sm text-center">{t('upload_sub')}</p>

          <div className="w-full max-w-2xl">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                'relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 ease-out bg-zinc-900/50 backdrop-blur-sm',
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)]'
                  : 'border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="p-16 flex flex-col items-center justify-center gap-6 pointer-events-none">
                <div className={cn(
                  'p-4 rounded-full transition-colors duration-300',
                  isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-300'
                )}>
                  {isDragging ? <FileAudio className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
                </div>
                <div className="text-center space-y-1">
                  <p className="font-mono text-sm font-medium text-zinc-200">
                    {isDragging ? t('upload_dragging') : t('upload_drag')}
                  </p>
                  <p className="font-mono text-xs text-zinc-500">{t('upload_formats')}</p>
                </div>
              </div>
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-700 opacity-50 m-2" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-700 opacity-50 m-2" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-700 opacity-50 m-2" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-700 opacity-50 m-2" />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-mono font-semibold text-red-400">{t('upload_error_title')}</h4>
                  <p className="text-xs font-mono text-red-300/80 mt-1">{error}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── WHY / PROBLEM ─────────────────────────────────────────────── */}
      <section className="border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-20 space-y-10">
          <SectionLabel text="PROBLEM" />
          <h3 className="text-2xl md:text-3xl font-mono font-bold text-white text-balance">
            {t('why_title')}
          </h3>
          <p className="text-zinc-400 leading-relaxed max-w-2xl">{t('why_body')}</p>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="text-left p-4">Service</th>
                  <th className="text-left p-4">Price/track</th>
                  <th className="text-center p-4">Transparent</th>
                  <th className="text-center p-4">API</th>
                  <th className="text-center p-4">Engineer Control</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c) => (
                  <tr key={c.name} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                    <td className="p-4 text-zinc-300">{c.name}</td>
                    <td className="p-4 text-zinc-400">{c.price}</td>
                    <td className="p-4 text-center text-red-400">✗</td>
                    <td className="p-4 text-center text-red-400">✗</td>
                    <td className="p-4 text-center text-zinc-500 text-xs">Slider only</td>
                  </tr>
                ))}
                <tr className="bg-indigo-500/5 border-b border-indigo-500/20">
                  <td className="p-4 font-bold text-indigo-300">WhitePrint</td>
                  <td className="p-4 text-indigo-300 font-bold">$1.50</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">✓ 28 params</td>
                  <td className="p-4 text-center text-emerald-400 font-bold">✓ REST</td>
                  <td className="p-4 text-center text-emerald-400 text-xs font-bold">Full edit</td>
                </tr>
              </tbody>
            </table>
          </div>

          <blockquote className="border-l-2 border-indigo-500 pl-5 text-zinc-300 italic">
            {t('why_wp')}
          </blockquote>
        </div>
      </section>

      {/* ── PIPELINE ──────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-800/50 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-6 py-20 space-y-10">
          <SectionLabel text="HOW IT WORKS" />
          <h3 className="text-2xl md:text-3xl font-mono font-bold text-white text-balance">
            {t('pipeline_title')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PIPELINE_STEPS.map((step, idx) => {
              const titleKey = `pipeline_${step.key}` as `pipeline_${typeof step.key}`;
              const descKey = `pipeline_${step.key}_desc` as `pipeline_${typeof step.key}_desc`;
              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className={cn('rounded-xl border p-5 flex flex-col gap-3', step.color)}
                >
                  <div className="flex items-center gap-3">
                    <div className="opacity-80">{step.icon}</div>
                    <span className="text-[10px] font-mono opacity-50">0{idx + 1}</span>
                  </div>
                  <div>
                    <div className="font-mono font-bold text-sm uppercase tracking-wide mb-1">
                      {t(titleKey as Parameters<typeof t>[0])}
                    </div>
                    <div className="text-xs opacity-70 leading-relaxed">
                      {t(descKey as Parameters<typeof t>[0])}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Flow diagram text */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-xs text-zinc-400 leading-relaxed overflow-x-auto">
            <pre className="whitespace-pre-wrap">{`① URL  →  POST /api/v1/jobs/master
② CONCERTMASTER  (パイプライン統率 / Pipeline Orchestration / 流水线统筹)
③ AUDITION  →  BS.1770-4 · 9D time-series · 6-band spectral · section detection
④ DELIBERATION  →  GPT-5.4 ‖ Claude Opus 4.6 ‖ Gemini 3.1 Pro  →  weighted median merge
⑤ RENDITION DSP  →  14-stage analog modeling  →  ±0.1dB LUFS convergence
⑥ 24bit WAV  ←  returned`}</pre>
          </div>
        </div>
      </section>

      {/* ── TRIVIUM ───────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-20 space-y-10">
          <SectionLabel text="TRIVIUM" />
          <h3 className="text-2xl md:text-3xl font-mono font-bold text-white text-balance">
            {t('trivium_title')}
          </h3>
          <p className="text-zinc-400 leading-relaxed max-w-2xl">{t('trivium_body')}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAGES.map((sage, idx) => (
              <motion.div
                key={sage.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn('rounded-xl border p-5 flex flex-col gap-3', sage.color)}
              >
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <div className="font-mono font-bold text-sm text-white uppercase">{sage.name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{sage.provider}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-3">
            {(['trivium_rule_median', 'trivium_rule_risk', 'trivium_rule_veto'] as const).map((ruleKey) => (
              <div key={ruleKey} className="flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-300 leading-relaxed">{t(ruleKey)}</p>
              </div>
            ))}
          </div>

          <blockquote className="border-l-2 border-amber-500 pl-5 text-zinc-400 text-sm italic">
            {t('trivium_independent')}
          </blockquote>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-800/50 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-6 py-20 space-y-10">
          <SectionLabel text="PRICING" />
          <h3 className="text-2xl md:text-3xl font-mono font-bold text-white text-balance">
            {t('pricing_title')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan, idx) => (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={cn(
                  'rounded-xl border p-5 flex flex-col gap-4',
                  plan.highlight
                    ? 'border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.1)]'
                    : 'border-zinc-800 bg-zinc-900/30'
                )}
              >
                {plan.highlight && (
                  <div className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded w-fit">RECOMMENDED</div>
                )}
                <div>
                  <div className="font-mono font-bold text-sm text-white uppercase">{t(plan.key as Parameters<typeof t>[0])}</div>
                  <div className="text-2xl font-mono font-bold mt-1 text-white">
                    {plan.price}
                    {plan.price !== 'Custom' && <span className="text-sm text-zinc-500">{t('pricing_per_month')}</span>}
                  </div>
                </div>
                <ul className="space-y-2 text-xs font-mono text-zinc-400 flex-1">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className={cn('flex items-center gap-2', f === '—' && 'opacity-30')}>
                      <span className={f === '—' ? 'text-zinc-600' : 'text-emerald-400'}>{f === '—' ? '—' : '✓'}</span>
                      <span>{f === '—' ? '—' : f.replace('✓ ', '')}</span>
                    </li>
                  ))}
                </ul>
                <button className={cn(
                  'w-full py-2 rounded-lg text-xs font-mono font-bold transition-colors',
                  plan.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                )}>
                  {plan.price === 'Custom' ? t('pricing_custom') : plan.price === '$0' ? t('pricing_free') : 'GET STARTED'}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-xs font-mono text-zinc-500 leading-relaxed">
            <Lock className="w-3.5 h-3.5 inline mr-2 text-indigo-400" />
            {t('pricing_cost_note')}
          </div>
        </div>
      </section>

      {/* ── OSS ───────────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-20 space-y-8">
          <SectionLabel text="OPEN SOURCE" />
          <h3 className="text-2xl md:text-3xl font-mono font-bold text-white text-balance">
            {t('oss_title')}
          </h3>
          <p className="text-zinc-400 max-w-2xl">{t('oss_body')}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/40">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50 border border-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50 border border-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/50 border border-green-500/70" />
                <span className="ml-2 text-xs font-mono text-zinc-500">python</span>
              </div>
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed p-5 overflow-x-auto">{`pip install whiteprint-audition

from whiteprint_audition import analyze_file

result = analyze_file("your_track.wav")
print(result["whole_track_metrics"]["integrated_lufs"])
# → -14.2
print(result["detected_problems"])
# → [{"issue": "mud_risk", ...}]`}</pre>
            </div>

            {/* Comparison table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                vs. other tools
              </div>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="text-left p-3">Feature</th>
                    <th className="text-center p-3">pyloudnorm</th>
                    <th className="text-center p-3">librosa</th>
                    <th className="text-center p-3 text-indigo-300">audition</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  {[
                    ['BS.1770-4 LUFS', '△', '—', '✓'],
                    ['True Peak (4x OS)', '—', '—', '✓'],
                    ['LRA (double gate)', '—', '—', '✓'],
                    ['9D time-series', '—', '△', '✓'],
                    ['Section detection', '—', '—', '✓'],
                    ['Problem detection', '—', '—', '✓'],
                  ].map(([feat, ...vals]) => (
                    <tr key={feat} className="border-b border-zinc-800/50">
                      <td className="p-3">{feat}</td>
                      {vals.map((v, i) => (
                        <td key={i} className={cn('p-3 text-center', i === 2 ? 'text-emerald-400 font-bold' : v === '—' ? 'text-zinc-700' : 'text-zinc-400')}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <blockquote className="border-l-2 border-emerald-500 pl-5 text-zinc-300 italic text-sm">
            {t('oss_note')}
          </blockquote>
        </div>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────────────────────────────── */}
      <section className="border-b border-zinc-800/50 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-6 py-20 space-y-10">
          <SectionLabel text="SOCIAL PROOF" />
          <h3 className="text-2xl md:text-3xl font-mono font-bold text-white text-balance">
            {t('proof_title')}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {PROOF.map((p, idx) => (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07 }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col gap-1"
              >
                <div className="text-2xl font-mono font-bold text-white">{p.value}</div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider leading-snug">
                  {t(p.key as Parameters<typeof t>[0])}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-300 leading-relaxed italic">{t('proof_story')}</p>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-20 space-y-8">
          <SectionLabel text="GET STARTED" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dev */}
            <CTACard
              icon={<Terminal className="w-6 h-6 text-indigo-400" />}
              title={t('cta_dev')}
              sub={t('cta_dev_sub')}
              borderColor="border-indigo-500/30 hover:border-indigo-500/60"
              badge="API"
            />
            {/* Music */}
            <CTACard
              icon={<Music2 className="w-6 h-6 text-emerald-400" />}
              title={t('cta_music')}
              sub={t('cta_music_sub')}
              borderColor="border-emerald-500/30 hover:border-emerald-500/60"
              badge="FREE"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
            {/* OSS */}
            <CTACard
              icon={<Github className="w-6 h-6 text-amber-400" />}
              title={t('cta_oss')}
              sub={t('cta_oss_sub')}
              borderColor="border-amber-500/30 hover:border-amber-500/60"
              badge="OSS"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 bg-zinc-950/60">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <span className="font-mono text-xs text-zinc-500">WhitePrintAudioEngine — api.aimastering.tech</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-mono text-zinc-600">
            <span>Apache 2.0 (audition)</span>
            <span>BS.1770-4</span>
            <span>Zero Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
      <span className="w-4 h-px bg-zinc-700" />
      {text}
    </div>
  );
}

interface CTACardProps {
  icon: React.ReactNode;
  title: string;
  sub: string;
  borderColor: string;
  badge: string;
  onClick?: () => void;
}
function CTACard({ icon, title, sub, borderColor, badge, onClick }: CTACardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'bg-zinc-950 border rounded-xl p-6 flex flex-col gap-4 transition-colors cursor-pointer',
        borderColor
      )}
    >
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-[10px] font-mono text-zinc-500 border border-zinc-700 px-2 py-0.5 rounded">{badge}</span>
      </div>
      <div>
        <div className="font-mono font-bold text-sm text-white mb-1">{title}</div>
        <div className="text-xs text-zinc-500">{sub}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-zinc-600 mt-auto" />
    </motion.div>
  );
}
