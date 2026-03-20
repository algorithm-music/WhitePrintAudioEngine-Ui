'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, GitFork, ArrowRight, ChevronRight } from 'lucide-react';
import { useLocale } from '@/lib/locale-context';
import type { Locale } from '@/lib/i18n';

interface LandingPageProps {
  onGetStarted: () => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locales: { code: Locale; label: string }[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage({ onGetStarted, locale, setLocale, locales }: LandingPageProps) {
  const { t } = useLocale();

  const pricingFeatures = [
    t('lp_pricing_f1'),
    t('lp_pricing_f2'),
    t('lp_pricing_f3'),
    t('lp_pricing_f4'),
    t('lp_pricing_f5'),
    t('lp_pricing_f6'),
  ];

  const pipeline = [
    t('lp_pipeline_1'),
    t('lp_pipeline_2'),
    t('lp_pipeline_3'),
    t('lp_pipeline_4'),
    t('lp_pipeline_5'),
  ];

  const whyCards = [
    { title: t('lp_why_1_title'), body: t('lp_why_1_body'), accent: 'indigo' },
    { title: t('lp_why_2_title'), body: t('lp_why_2_body'), accent: 'violet' },
    { title: t('lp_why_3_title'), body: t('lp_why_3_body'), accent: 'emerald' },
    { title: t('lp_why_4_title'), body: t('lp_why_4_body'), accent: 'sky' },
  ];

  const triviumSages = [
    { name: 'CLARITY', color: 'sky', desc: t('lp_trivium_clarity') },
    { name: 'PUNCH', color: 'orange', desc: t('lp_trivium_punch') },
    { name: 'WARMTH', color: 'amber', desc: t('lp_trivium_warmth') },
  ];

  const testimonials = [
    { quote: locale === 'ja' ? '「28パラメータ全部見えるのが革命的。今まで何をされてたか分かってなかった。」' : locale === 'zh' ? '「能看到全部28个参数，真的是革命性的。以前根本不知道在处理什么。」' : '"Seeing all 28 parameters is revolutionary. I never knew what was being done to my tracks before."', name: 'Taiga R.', role: locale === 'ja' ? 'プロデューサー / Tokyo' : locale === 'zh' ? '制作人 / Tokyo' : 'Producer / Tokyo' },
    { quote: locale === 'ja' ? '「TRIVIUM合議レポートがエンジニアリングの学習ツールにもなってる。」' : locale === 'zh' ? '「TRIVIUM合议报告也成为了工程学习工具。」' : '"The TRIVIUM deliberation report doubles as an engineering learning tool."', name: 'Marcus B.', role: locale === 'ja' ? 'マスタリングエンジニア / Berlin' : locale === 'zh' ? '母带工程师 / Berlin' : 'Mastering Engineer / Berlin' },
    { quote: locale === 'ja' ? '「$1.50で透明なレポートが出てくる。他のサービスに戻れない。」' : locale === 'zh' ? '「$1.50就能获得透明报告，再也回不去其他服务了。」' : '"$1.50 and a fully transparent report. Can\'t go back to anything else."', name: 'Seo Y.', role: locale === 'ja' ? 'アーティスト / Seoul' : locale === 'zh' ? '艺术家 / Seoul' : 'Artist / Seoul' },
  ];

  const accentMap: Record<string, string> = {
    indigo: 'border-indigo-500/30 bg-indigo-500/5',
    violet: 'border-violet-500/30 bg-violet-500/5',
    emerald: 'border-emerald-500/30 bg-emerald-500/5',
    sky: 'border-sky-500/30 bg-sky-500/5',
    orange: 'border-orange-500/30 bg-orange-500/5',
    amber: 'border-amber-500/30 bg-amber-500/5',
  };

  const accentText: Record<string, string> = {
    indigo: 'text-indigo-400',
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    sky: 'text-sky-400',
    orange: 'text-orange-400',
    amber: 'text-amber-400',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
            <span className="font-mono text-sm font-semibold tracking-wider text-zinc-200">
              RENDITION_DSP <span className="text-zinc-500 font-normal">v2.0.0</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
              {locales.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setLocale(code)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    locale === code
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={onGetStarted}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono font-semibold transition-colors"
            >
              {t('lp_cta_primary')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Grid bg */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10">
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              {t('lp_badge')}
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-mono font-black tracking-tighter text-white text-balance mb-6 leading-tight whitespace-pre-line">
            {t('lp_hero_title')}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            {t('lp_hero_sub')}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono font-bold text-sm transition-colors shadow-[0_0_40px_rgba(99,102,241,0.25)]"
            >
              {t('lp_cta_primary')} <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="/api-docs"
              className="flex items-center gap-2 px-8 py-4 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-xl font-mono font-semibold text-sm transition-colors"
            >
              {t('lp_cta_secondary')} <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </motion.div>

        {/* Stat pills */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 mt-16 flex flex-wrap justify-center gap-4"
        >
          {[
            { val: '28', label: 'Parameters' },
            { val: '$1.50', label: '/ Track' },
            { val: '3', label: 'AIs' },
            { val: '0', label: 'Storage' },
          ].map((s) => (
            <motion.div
              key={s.val}
              variants={fadeUp}
              className="flex flex-col items-center px-8 py-4 rounded-xl border border-zinc-800 bg-zinc-950"
            >
              <span className="text-3xl font-mono font-black text-white">{s.val}</span>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-mono font-bold text-white text-center mb-12"
        >
          {t('lp_why_title')}
        </motion.h2>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {whyCards.map((card) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              className={`p-6 rounded-xl border ${accentMap[card.accent]}`}
            >
              <h3 className={`font-mono font-bold text-sm mb-3 ${accentText[card.accent]}`}>{card.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{card.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* TRIVIUM section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-800/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-mono font-bold text-white mb-3">{t('lp_trivium_title')}</h2>
          <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed">{t('lp_trivium_sub')}</p>
        </motion.div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {triviumSages.map((sage) => (
            <motion.div
              key={sage.name}
              variants={fadeUp}
              className={`p-6 rounded-xl border ${accentMap[sage.color]} flex flex-col gap-3`}
            >
              <span className={`text-xs font-mono font-bold px-2 py-1 rounded self-start ${accentText[sage.color]} bg-current/10`} style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                {sage.name}
              </span>
              <p className="text-zinc-300 text-sm leading-relaxed">{sage.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Pipeline section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-800/50">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-mono font-bold text-white text-center mb-12"
        >
          {t('lp_pipeline_title')}
        </motion.h2>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          {pipeline.map((step, i) => (
            <motion.div key={i} variants={fadeUp} className="flex items-center gap-3 md:gap-0 flex-row md:flex-col md:items-center md:text-center flex-1">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono font-bold text-sm text-indigo-400">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="h-px flex-1 bg-zinc-800 hidden md:block md:mx-4 md:w-auto md:h-px" />
              <p className="text-zinc-300 text-xs font-mono md:mt-3 text-left md:text-center leading-relaxed max-w-[140px]">{step}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Pricing section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-800/50">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-mono font-bold text-white text-center mb-12"
        >
          {t('lp_pricing_title')}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-sm mx-auto rounded-2xl border border-indigo-500/30 bg-zinc-950 p-8"
        >
          <div className="flex items-end gap-1 mb-2">
            <span className="text-5xl font-mono font-black text-white">{t('lp_pricing_price')}</span>
            <span className="text-zinc-400 font-mono text-lg pb-1">{t('lp_pricing_unit')}</span>
          </div>
          <div className="mt-6 space-y-3">
            {pricingFeatures.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-300">{f}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onGetStarted}
            className="mt-8 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono font-bold text-sm transition-colors"
          >
            {t('lp_cta_primary')}
          </button>
        </motion.div>
      </section>

      {/* OSS section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-800/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 rounded-2xl border border-zinc-800 bg-zinc-950"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
              <GitFork className="w-6 h-6 text-zinc-300" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-white text-lg mb-1">{t('lp_oss_title')}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-md">{t('lp_oss_body')}</p>
            </div>
          </div>
          <a
            href="https://github.com/Yomibito-Shirazu-jp/Audio-Analysis-Engine"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-xl font-mono font-semibold text-sm transition-colors flex-shrink-0"
          >
            <GitFork className="w-4 h-4" />
            {t('lp_oss_cta')}
          </a>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-zinc-800/50">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-mono font-bold text-white text-center mb-12"
        >
          {t('lp_social_title')}
        </motion.h2>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {testimonials.map((t_) => (
            <motion.div key={t_.name} variants={fadeUp} className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col gap-4">
              <p className="text-zinc-300 text-sm leading-relaxed">{t_.quote}</p>
              <div className="mt-auto">
                <div className="font-mono font-semibold text-xs text-white">{t_.name}</div>
                <div className="font-mono text-xs text-zinc-500">{t_.role}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center border-t border-zinc-800/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-mono font-black text-white mb-4 text-balance">{t('lp_final_cta_title')}</h2>
          <p className="text-zinc-400 mb-10 text-balance">{t('lp_final_cta_sub')}</p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono font-bold text-sm transition-colors shadow-[0_0_60px_rgba(99,102,241,0.3)]"
          >
            {t('lp_final_cta_btn')} <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            <span className="font-mono text-xs text-zinc-500">RENDITION_DSP © 2025</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-mono text-zinc-600">
            <a href="/api-keys" className="hover:text-zinc-400 transition-colors">{t('nav_api_keys')}</a>
            <a href="/api-docs" className="hover:text-zinc-400 transition-colors">{t('nav_curl_gen')}</a>
            <a href="https://github.com/Yomibito-Shirazu-jp/Audio-Analysis-Engine" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
