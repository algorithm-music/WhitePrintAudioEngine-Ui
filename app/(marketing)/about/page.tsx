import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — WhitePrint AudioEngine',
  description:
    'WhitePrint AudioEngine is an AI-driven audio mastering platform built on 5 microservices: Concertmaster, Audition, Deliberation, Rendition-DSP, and UI. Learn about the architecture, user flow, and technology stack.',
  alternates: { canonical: '/about' },
};

/* ─── Data ─── */

const TECH_STACK = [
  { category: 'Frontend', items: ['Next.js 15.5', 'React 19', 'Tailwind CSS 4', 'Framer Motion'] },
  { category: 'Backend', items: ['Python 3.12', 'FastAPI', 'NumPy / SciPy', 'httpx'] },
  { category: 'AI / LLM', items: ['OpenAI GPT-4o', 'Anthropic Claude', 'Google Gemini 2.5', 'Vertex AI'] },
  { category: 'Infrastructure', items: ['Google Cloud Run', 'Cloud Storage (GCS)', 'Supabase Auth + DB', 'Cloud Build CI/CD'] },
];

const PIPELINE_STEPS = [
  {
    step: '01',
    title: 'Upload & URL Resolution',
    desc: 'ファイルをアップロードするか、URLを貼り付けてください。Google Drive、Dropbox、OneDrive、Suno、SoundCloudなど主要プラットフォームに対応。',
    detail: 'ローカルファイルはGCSに自動アップロード。URLは直接ダウンロードURLに自動変換。SSRF保護完備。',
  },
  {
    step: '02',
    title: 'BS.1770-4 Analysis',
    desc: '国際放送規格準拠のラウドネス解析。LUFS、True Peak、LRA、クレストファクター、スペクトルバランス、ステレオ幅を測定。',
    detail: 'K-weightingフィルター適用。9次元時系列エンベロープ抽出。BPM/Key自動推定。Vertex AIによるセクション検出。',
  },
  {
    step: '03',
    title: 'TRIVIUM 3-Sage Deliberation',
    desc: '3つの独立AIエージェント (OpenAI / Anthropic / Google) が並列で最適なDSPパラメータを提案。',
    detail: '加重中央値マージにより24パラメータを決定。セクション別オーバーライドで楽曲構造に応じた動的処理を適用。',
  },
  {
    step: '04',
    title: '14-Stage DSP Mastering',
    desc: 'アナログモデリング14段チェーン: EQ → M/S → Saturation → Compression → Limiting → Dither。',
    detail: '3パス収束ループでターゲットLUFSに正確到達。Koren真空管モデル、4x OS True Peak Limiter v3搭載。',
  },
  {
    step: '05',
    title: 'A/B Compare & Download',
    desc: '原曲とマスター済み音源をA/Bプレーヤーで即座に比較。メトリクスの前後比較を確認し、WAVをダウンロード。',
    detail: 'ビフォー/アフターのLUFS差、True Peak、スペクトルバランスの変化を視覚的に確認可能。',
  },
];

const SERVICES = [
  {
    name: 'Concertmaster',
    role: 'オーケストレーター (The Conductor)',
    desc: 'パイプライン全体を統括する唯一の外部公開サービス。URL解決、SSRF保護、コネクションプール管理、4つのパイプラインルートの制御を担当。',
    tech: 'Python / FastAPI',
    icon: '🎼',
  },
  {
    name: 'Audition',
    role: 'スコアリーダー (Analysis)',
    desc: 'BS.1770-4準拠のラウドネス解析エンジン。K-weightingフィルター、9次元エンベロープ抽出、BPM/Key推定、Vertex AIセクション検出を実行。',
    tech: 'Python / NumPy / SciPy',
    icon: '📊',
  },
  {
    name: 'Deliberation',
    role: 'TRIVIUM 合議エンジン (AI Council)',
    desc: '3つの独立AIエージェント (Grammatica / Logica / Rhetorica) が異なるLLMプロバイダーで並列実行し、加重中央値マージで最適DSPパラメータを決定。',
    tech: 'Python / OpenAI / Anthropic / Vertex AI',
    icon: '🧠',
  },
  {
    name: 'Rendition-DSP',
    role: 'マスタリングエンジン (DSP Engine)',
    desc: 'Pure Python実装の14段アナログモデリングDSPチェーン。3パス収束ループ、LR8クロスオーバー4バンド圧縮、4x OS True Peak Limiter v3を搭載。',
    tech: 'Python / NumPy / SciPy',
    icon: '🎛️',
  },
  {
    name: 'UI',
    role: 'フロントエンド (Dashboard)',
    desc: 'マスタリングダッシュボード、A/B比較プレーヤー、分析ビジュアライゼーション、認証・課金管理を提供するWebアプリケーション。バックエンドへの操縦席。',
    tech: 'Next.js / React / Tailwind CSS',
    icon: '🖥️',
  },
];

const AUDIT_ITEMS = [
  { label: 'ファイルアップロード → GCS' },
  { label: 'URL入力 → Concertmaster転送' },
  { label: '分析パイプライン (analyze_only)' },
  { label: 'AI合議パイプライン (deliberation_only)' },
  { label: 'DSPマスタリング (dsp_only)' },
  { label: 'マスター済み音声ダウンロード' },
  { label: 'A/B比較再生' },
  { label: '型安全性 (TypeScript)' },
  { label: 'セキュリティ (SSRF / XSS / Auth)' },
];

const PAGES = [
  { path: '/', desc: 'ランディングページ / マスタリングダッシュボード' },
  { path: '/app/history', desc: 'マスタリング履歴' },
  { path: '/developers', desc: 'API概要' },
  { path: '/developers/docs/quickstart', desc: 'クイックスタートガイド' },
  { path: '/developers/docs/reference', desc: 'APIリファレンス' },
  { path: '/developers/docs/examples', desc: 'コード例' },
  { path: '/developers/docs/specification', desc: '完全技術仕様書' },
  { path: '/features', desc: '機能一覧' },
  { path: '/pricing', desc: '料金プラン' },
  { path: '/blog', desc: 'ブログ' },
  { path: '/about', desc: 'このページ' },
];

/* ─── Page ─── */

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      {/* Hero */}
      <div className="text-center mb-24">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-mono text-indigo-400 mb-6">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          AI-Powered Audio Mastering
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight">
          WhitePrint AudioEngine
        </h1>
        <p className="mt-6 text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          5つのマイクロサービスで構成されるAI駆動オーディオマスタリングプラットフォーム。
          <br className="hidden md:block" />
          <span className="text-zinc-300">分析 → AI合議 → DSPマスタリング</span>{' '}
          の3段階パイプラインを完全自動化。
        </p>
      </div>

      {/* ═══════════════════════════════════ */}
      {/* What is this?                      */}
      {/* ═══════════════════════════════════ */}
      <section className="mb-24">
        <SectionLabel label="OVERVIEW" />
        <h2 className="text-3xl font-bold text-white mb-6">What is WhitePrint?</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-950/80">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">🎵</span> ユーザー向け
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              音楽ファイルをアップロードまたはURLを貼り付けるだけで、
              <strong className="text-zinc-200">
                AIが最適なマスタリングパラメータを自動決定
              </strong>
              し、プロ品質のマスタリングを実行。結果はA/Bプレーヤーで比較でき、WAVファイルとしてダウンロード可能。
            </p>
          </div>
          <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-950/80">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">⚙️</span> 技術的に
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              UIは
              <strong className="text-zinc-200">
                バックエンド4サービスへの操縦席
              </strong>
              。自身はDSP処理やAI合議を行わず、
              <code className="text-indigo-400 text-xs bg-zinc-900 px-1.5 py-0.5 rounded">
                /api/master
              </code>{' '}
              API Route が Concertmasterへのプロキシとして機能し、APIキーをサーバーサイドで注入してセキュリティを確保。
            </p>
          </div>
        </div>

        {/* Original mission text preserved */}
        <div className="mt-8 space-y-6 text-sm text-zinc-400 leading-relaxed max-w-3xl">
          <p>
            WhitePrint AudioEngine was born from a simple frustration: existing AI
            mastering services are black boxes. You upload a track, wait, and
            receive a result with no insight into what happened or why.
          </p>
          <p>
            We believe audio engineers and music producers deserve full
            transparency into the mastering process. Every parameter decision
            should be explainable, every measurement should be
            standards-compliant, and every step should be auditable.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════ */}
      {/* Architecture                       */}
      {/* ═══════════════════════════════════ */}
      <section className="mb-24">
        <SectionLabel label="ARCHITECTURE" />
        <h2 className="text-3xl font-bold text-white mb-6">
          5-Service Architecture
        </h2>

        {/* Flow Diagram */}
        <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-950/80 mb-8 overflow-x-auto">
          <div className="flex flex-col items-center gap-4 min-w-[600px]">
            {/* Row 1: User → UI → Concertmaster */}
            <div className="flex items-center gap-4">
              <FlowBox label="ユーザー" sub="File / URL" variant="zinc" />
              <FlowArrow />
              <FlowBox
                label="UI (Next.js)"
                sub="/api/master プロキシ"
                variant="indigo"
              />
              <FlowArrow />
              <FlowBox
                label="Concertmaster"
                sub="オーケストレーター"
                variant="amber"
              />
            </div>

            <div className="text-zinc-600 text-xl">↓</div>

            {/* Row 2: Backend pipeline */}
            <div className="flex items-center gap-4">
              <FlowBox
                label="Audition"
                sub="BS.1770-4 分析"
                variant="emerald"
              />
              <FlowArrow />
              <FlowBox
                label="Deliberation"
                sub="3-Sage AI合議"
                variant="violet"
              />
              <FlowArrow />
              <FlowBox
                label="Rendition-DSP"
                sub="14段DSPチェーン"
                variant="rose"
              />
            </div>

            <div className="text-zinc-600 text-xl">↓</div>

            {/* Row 3: Output */}
            <FlowBox
              label="マスター済み WAV"
              sub="A/B比較 + ダウンロード"
              variant="emerald"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((svc) => (
            <div
              key={svc.name}
              className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/50 hover:border-zinc-700/60 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{svc.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {svc.name}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-500">
                    {svc.role}
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                {svc.desc}
              </p>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-zinc-900 text-zinc-500 border border-zinc-800/50">
                {svc.tech}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════ */}
      {/* User Flow                          */}
      {/* ═══════════════════════════════════ */}
      <section className="mb-24">
        <SectionLabel label="USER FLOW" />
        <h2 className="text-3xl font-bold text-white mb-8">
          Mastering Pipeline
        </h2>

        <div className="space-y-4">
          {PIPELINE_STEPS.map((step) => (
            <div
              key={step.step}
              className="group flex items-start gap-6 p-6 rounded-xl border border-zinc-800/50 bg-zinc-950/50 hover:border-zinc-700/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                <span className="text-sm font-mono font-bold text-indigo-400">
                  {step.step}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
                <p className="text-xs text-zinc-500 mt-2">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════ */}
      {/* Tech Stack                         */}
      {/* ═══════════════════════════════════ */}
      <section className="mb-24">
        <SectionLabel label="TECHNOLOGY" />
        <h2 className="text-3xl font-bold text-white mb-8">Tech Stack</h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_STACK.map((group) => (
            <div
              key={group.category}
              className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-950/50"
            >
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
                {group.category}
              </h3>
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-zinc-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Why Multi-LLM — preserved from original */}
        <div className="mt-8 p-8 rounded-xl border border-zinc-800 bg-zinc-950/80 max-w-3xl">
          <h3 className="text-lg font-bold text-white mb-3">
            Why Multi-LLM?
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            No single AI model has a monopoly on good judgment. By using
            multiple providers (OpenAI, Anthropic, and Google), we reduce
            individual model bias and increase reliability through consensus.
            You can see where models agree and where they diverge.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════ */}
      {/* Pages                              */}
      {/* ═══════════════════════════════════ */}
      <section className="mb-24">
        <SectionLabel label="SITE MAP" />
        <h2 className="text-3xl font-bold text-white mb-8">Page Structure</h2>

        <div className="grid gap-2 sm:grid-cols-2">
          {PAGES.map((p) => (
            <Link
              key={p.path}
              href={p.path}
              className="flex items-center gap-4 p-4 rounded-lg border border-zinc-800/30 bg-zinc-950/30 hover:border-indigo-500/30 hover:bg-zinc-900/30 transition-all group"
            >
              <code className="text-xs font-mono text-indigo-400 shrink-0 w-56 truncate group-hover:text-indigo-300 transition-colors">
                {p.path}
              </code>
              <span className="text-xs text-zinc-400">{p.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════ */}
      {/* Audit Results                      */}
      {/* ═══════════════════════════════════ */}
      <section className="mb-24">
        <SectionLabel label="AUDIT" />
        <h2 className="text-3xl font-bold text-white mb-4">
          Pipeline Audit Results
        </h2>
        <p className="text-sm text-zinc-400 mb-8 max-w-2xl">
          UIからバックエンドパイプラインへの全接続を検査・監査した結果。
          全パイプライン (Upload → /api/master → Concertmaster → Audition →
          Deliberation → Rendition-DSP) の接続が正常であることを確認済み。
        </p>

        <div className="p-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-lg">✓</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-300">
                ALL CHECKS PASSED
              </h3>
              <p className="text-xs text-emerald-400/60 font-mono">
                UIからマスタリング可能
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIT_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/50"
              >
                <span className="text-emerald-400 text-sm shrink-0">✓</span>
                <span className="text-xs text-zinc-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center pt-8 border-t border-zinc-800/50">
        <h2 className="text-2xl font-bold text-white mb-4">Try It Now</h2>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto mb-8">
          URLを貼り付けるだけ。サインアップ不要で即座にAIマスタリングを体験できます。
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/app"
            className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Start Mastering
          </Link>
          <Link
            href="/developers/docs/specification"
            className="inline-flex px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors text-sm"
          >
            Technical Specification →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-0.5 bg-indigo-500" />
      <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function FlowBox({
  label,
  sub,
  variant,
}: {
  label: string;
  sub?: string;
  variant: string;
}) {
  const colors: Record<string, string> = {
    zinc: 'border-zinc-600/30 bg-zinc-800/30 text-zinc-300',
    indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    violet: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
    rose: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  };
  const cls = colors[variant] || colors.zinc;

  return (
    <div
      className={`px-5 py-3 rounded-lg border text-center min-w-[140px] ${cls}`}
    >
      <div className="text-sm font-bold">{label}</div>
      {sub && (
        <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{sub}</div>
      )}
    </div>
  );
}

function FlowArrow() {
  return <span className="text-zinc-600 text-lg shrink-0">→</span>;
}
