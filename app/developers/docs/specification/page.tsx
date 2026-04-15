import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Technical Specification — System Architecture & DSP Engine',
  description:
    'Complete technical specification for WhitePrint AudioEngine: 5-microservice architecture, TRIVIUM 3-Sage LLM deliberation, 14-stage analog-modeled DSP mastering chain, BS.1770-4 loudness analysis, and API reference.',
  alternates: { canonical: '/developers/docs/specification' },
};

/* ─── Data Constants ─── */

const SERVICES = [
  {
    name: 'Concertmaster',
    role: 'オーケストレーター (The Conductor)',
    tech: 'Python 3.12 / FastAPI',
    desc: 'パイプライン全体を制御する唯一の外部公開サービス。URL解決 → Audition → Deliberation → Rendition-DSP のフローを統括。',
    endpoints: [
      { method: 'POST', path: '/api/v1/jobs/master', desc: 'マスタリングジョブ投入 (4ルート: full / analyze_only / deliberation_only / dsp_only)' },
      { method: 'GET', path: '/health', desc: 'ヘルスチェック' },
    ],
    features: [
      'X-Api-Key ヘッダー認証',
      'SSRF保護 (プライベートIP/メタデータサーバーブロック)',
      'URL自動変換 (Google Drive / Dropbox / OneDrive / Suno / SoundCloud / yt-dlp)',
      'httpx 非同期コネクションプール',
      'OIDC IDトークンによるサービス間認証',
    ],
  },
  {
    name: 'Audition',
    role: 'スコアリーダー (分析)',
    tech: 'Python 3.12 / FastAPI / NumPy / SciPy',
    desc: 'BS.1770-4準拠のラウドネス解析、9次元エンベロープ抽出、BPM/Key推定、Vertex AIによるセクション検出を実行。',
    endpoints: [
      { method: 'POST', path: '/api/v1/analyze', desc: 'URLからオーディオ分析' },
      { method: 'POST', path: '/api/v1/analyze/file', desc: 'ファイルパスから分析' },
      { method: 'GET', path: '/health', desc: 'ヘルスチェック' },
    ],
    features: [
      'K-weightingフィルター (ITU-R BS.1770-4)',
      '9次元時系列エンベロープ (LUFS/Crest/Width/Sub/Bass/Vocal/Brightness/LowMono/Transient)',
      'True Peak測定 (4x オーバーサンプリング)',
      'BPM推定 (onset_strength + autocorrelation)',
      'Key推定 (Chroma Energy Normalization Statistics)',
      'Vertex AI Structured Output によるマクロフォーム解析',
      'DSPフォールバック (Vertex AI 障害時)',
    ],
  },
  {
    name: 'Deliberation',
    role: 'TRIVIUM 3-Sage 合議エンジン',
    tech: 'Python 3.12 / FastAPI',
    desc: '3つの独立AIエージェント (Grammatica/Logica/Rhetorica) が並列でDSPパラメータを提案し、加重中央値マージで最適値を決定。',
    endpoints: [
      { method: 'POST', path: '/api/v1/deliberate', desc: '3-Sage合議実行' },
      { method: 'GET', path: '/health', desc: 'ヘルスチェック' },
    ],
    features: [
      'OpenAI / Anthropic / Vertex AI 3プロバイダー同時活用',
      '加重中央値マージ (confidence × valid_param_ratio)',
      '3段JSON正規化 (strict → lenient → regex)',
      'マルチキーローテーション (API障害耐性)',
      'セクション別オーバーライド (section_overrides)',
      '12 Agents JP / TSE プラグインアーキテクチャ',
    ],
  },
  {
    name: 'Rendition-DSP',
    role: 'マスタリングエンジン',
    tech: 'Python 3.12 / FastAPI / NumPy / SciPy',
    desc: '14段アナログモデリングDSPチェーンによるマスタリング処理。3パス収束ループ、LR8クロスオーバー4バンド圧縮、TPリミッター搭載。',
    endpoints: [
      { method: 'POST', path: '/api/v1/master', desc: 'URLからマスタリング' },
      { method: 'POST', path: '/api/v1/master/file', desc: 'ファイルパスからマスタリング' },
      { method: 'GET', path: '/health', desc: 'ヘルスチェック' },
    ],
    features: [
      '14段DSPチェーン (Input Gain → EQ → M/S → Saturation → Comp → Limiter → Dither)',
      '3パス収束ループ (ラウドネス正規化)',
      'LR8 (48dB/oct) クロスオーバー 4バンド圧縮',
      'Koren真空管モデル (Triode)',
      '4x オーバーサンプル True Peak リミッター v3',
      'HP-TPDF ディザ (16bit出力時)',
      'セクション別自動化 (section_overrides)',
      'GCS FUSE / /tmp フォールバック',
    ],
  },
  {
    name: 'UI',
    role: 'フロントエンド',
    tech: 'Next.js 15.5 / React 19 / Tailwind CSS 4',
    desc: 'マスタリングダッシュボード、A/B比較プレーヤー、分析ビジュアライゼーション、ユーザー認証、課金管理を提供。',
    endpoints: [
      { method: 'POST', path: '/api/master', desc: 'Concertmasterへのプロキシ' },
      { method: 'POST', path: '/api/upload', desc: 'GCSへのファイルアップロード' },
      { method: 'POST', path: '/api/checkout', desc: '決済 (NOWPayments)' },
    ],
    features: [
      'Supabase SSR認証ミドルウェア',
      '7段階FSMによるUI状態管理',
      'Vercel 4.5MB制限回避 (Supabase Storage経由)',
      'A/B比較プレーヤー',
      'ジョブ履歴管理 (Supabase)',
    ],
  },
];

const DSP_CHAIN = [
  { stage: 1, name: 'Input Gain', param: 'input_gain_db', range: '-12 ~ +12 dB', desc: 'DAW出力レベル正規化' },
  { stage: 2, name: '4-Band Parametric EQ', param: 'eq_*_gain_db', range: '-6 ~ +6 dB', desc: 'Low Shelf (80Hz) / Low-Mid (300Hz) / High-Mid (3kHz) / High Shelf (10kHz)' },
  { stage: 3, name: 'M/S Matrix (Encode)', param: '—', range: '—', desc: 'ステレオ→M/S変換' },
  { stage: 4, name: 'M/S Processing', param: 'ms_*_gain_db', range: '-6 ~ +6 dB', desc: 'Mid低域ブースト / Side高域ブースト' },
  { stage: 5, name: 'Transformer Saturation', param: 'transformer_*', range: '0.0 ~ 1.0', desc: 'ソフトクリッピング + 偶数次倍音' },
  { stage: 6, name: 'Triode Tube Saturation', param: 'triode_*', range: '0.0 ~ 1.0', desc: 'Koren真空管モデル: V_out = sign(x) × ln(1 + drive × |x + bias|)' },
  { stage: 7, name: 'Tape Saturation', param: 'tape_*', range: '0.0 ~ 1.0', desc: 'テープヒステリシスモデル: tanh(saturation × x)' },
  { stage: 8, name: 'M/S Matrix (Decode)', param: '—', range: '—', desc: 'M/S→ステレオ復元' },
  { stage: 9, name: 'Dynamic EQ', param: 'dyn_eq_enabled', range: '0 or 1', desc: 'ハーシュネス抑制 (3kHz帯検出)' },
  { stage: 10, name: '4-Band Crossover Compression', param: 'comp_*', range: 'variable', desc: 'LR8 (48dB/oct) 分離、バンド別圧縮: Sub/Bass/Mid/High' },
  { stage: 11, name: 'Stereo Enhancement', param: 'stereo_*', range: '0.0 ~ 2.0', desc: '低域モノ化 + 高域ワイド化 + 全帯域幅制御' },
  { stage: 12, name: 'Parallel Compression', param: 'parallel_wet', range: '0.0 ~ 0.5', desc: 'ヘビー圧縮の Wet/Dry ブレンド' },
  { stage: 13, name: 'True Peak Limiter v3', param: 'limiter_ceil_db', range: '-3.0 ~ -0.1 dBTP', desc: '4x オーバーサンプル + ルックアヘッド + 3パス収束' },
  { stage: 14, name: 'HP-TPDF Dither', param: '—', range: '—', desc: '24bit→16bit時のみ。高域整形三角確率密度関数ディザ' },
];

const DSP_PARAMS = [
  { name: 'input_gain_db', min: -12, max: 12, default: 0, unit: 'dB' },
  { name: 'eq_low_shelf_gain_db', min: -6, max: 6, default: 0, unit: 'dB' },
  { name: 'eq_low_mid_gain_db', min: -6, max: 6, default: 0, unit: 'dB' },
  { name: 'eq_high_mid_gain_db', min: -6, max: 6, default: 0, unit: 'dB' },
  { name: 'eq_high_shelf_gain_db', min: -6, max: 6, default: 0, unit: 'dB' },
  { name: 'ms_side_high_gain_db', min: -6, max: 6, default: 0, unit: 'dB' },
  { name: 'ms_mid_low_gain_db', min: -6, max: 6, default: 0, unit: 'dB' },
  { name: 'comp_threshold_db', min: -40, max: -6, default: -18, unit: 'dB' },
  { name: 'comp_ratio', min: 1.0, max: 8.0, default: 2.5, unit: ':1' },
  { name: 'comp_attack_sec', min: 0.001, max: 0.1, default: 0.01, unit: 'sec' },
  { name: 'comp_release_sec', min: 0.05, max: 1.0, default: 0.15, unit: 'sec' },
  { name: 'limiter_ceil_db', min: -3.0, max: -0.1, default: -1.0, unit: 'dBTP' },
  { name: 'transformer_saturation', min: 0, max: 1, default: 0, unit: '' },
  { name: 'transformer_mix', min: 0, max: 1, default: 0, unit: '' },
  { name: 'triode_drive', min: 0, max: 1, default: 0, unit: '' },
  { name: 'triode_bias', min: 0, max: 1, default: 0, unit: '' },
  { name: 'triode_mix', min: 0, max: 1, default: 0, unit: '' },
  { name: 'tape_saturation', min: 0, max: 1, default: 0, unit: '' },
  { name: 'tape_mix', min: 0, max: 1, default: 0, unit: '' },
  { name: 'dyn_eq_enabled', min: 0, max: 1, default: 0, unit: 'bool' },
  { name: 'stereo_low_mono', min: 0, max: 1, default: 0, unit: '' },
  { name: 'stereo_high_wide', min: 0, max: 2, default: 1, unit: '' },
  { name: 'stereo_width', min: 0, max: 2, default: 1, unit: '' },
  { name: 'parallel_wet', min: 0, max: 0.5, default: 0, unit: '' },
];

const ANALYSIS_METRICS = [
  { name: 'integrated_lufs', desc: 'BS.1770-4 統合ラウドネス', unit: 'LUFS' },
  { name: 'true_peak_dbtp', desc: '4x OS True Peak', unit: 'dBTP' },
  { name: 'lra_lu', desc: 'Loudness Range', unit: 'LU' },
  { name: 'psr_db', desc: 'Peak-to-Short-term Ratio', unit: 'dB' },
  { name: 'crest_db', desc: 'クレストファクター', unit: 'dB' },
  { name: 'stereo_width', desc: 'Side/Mid エネルギー比', unit: '' },
  { name: 'stereo_correlation', desc: 'L/R クロスコリレーション', unit: '' },
  { name: 'low_mono_correlation_below_120hz', desc: '120Hz以下 位相相関', unit: '' },
  { name: 'harshness_risk', desc: '2-6kHz ピーク比率', unit: '' },
  { name: 'mud_risk', desc: '200-500Hz 平坦度指標', unit: '' },
  { name: 'sub_ratio', desc: '20-60Hz エネルギー比', unit: '' },
  { name: 'bass_ratio', desc: '60-250Hz エネルギー比', unit: '' },
  { name: 'low_mid_ratio', desc: '250-500Hz エネルギー比', unit: '' },
  { name: 'mid_ratio', desc: '500-2kHz エネルギー比', unit: '' },
  { name: 'high_ratio', desc: '2k-8kHz エネルギー比', unit: '' },
  { name: 'air_ratio', desc: '8k-20kHz エネルギー比', unit: '' },
];

/* ─── Page Component ─── */

export default function SpecificationPage() {
  return (
    <div className="max-w-4xl">
      {/* Hero */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
            Technical Specification
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white leading-tight">
          WhitePrint AudioEngine
          <span className="block text-zinc-500 text-2xl font-normal mt-1">
            完全技術仕様書
          </span>
        </h1>
        <p className="mt-6 text-zinc-400 leading-relaxed max-w-2xl">
          5つのマイクロサービスで構成されるAI駆動オーディオマスタリングシステムの
          アーキテクチャ、API仕様、DSP信号処理チェーン、LLM統合ロジック、
          デプロイ構成の完全な技術リファレンス。
        </p>
      </div>

      {/* ════════════════════════════════ */}
      {/* 1. System Architecture          */}
      {/* ════════════════════════════════ */}
      <section id="architecture" className="mb-20">
        <SectionHeading number="01" title="SYSTEM ARCHITECTURE" />
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          4段階パイプライン: <strong className="text-zinc-200">Analysis → Deliberation → DSP Mastering → Output</strong>。
          全サービスはステートレスに設計され、Google Cloud Run上でスケーリングする。
          ファイルは処理後即時削除され、永続ストレージには一切保存されない。
        </p>

        <div className="grid gap-6">
          {SERVICES.map((svc) => (
            <div
              key={svc.name}
              className="rounded-xl border border-zinc-800/60 bg-zinc-950/50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-zinc-800/40 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{svc.name}</h3>
                  <p className="text-xs font-mono text-zinc-500 mt-0.5">
                    {svc.role}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {svc.tech}
                </span>
              </div>
              <div className="px-6 py-4 space-y-4">
                <p className="text-sm text-zinc-400">{svc.desc}</p>

                {/* Endpoints */}
                <div>
                  <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2">
                    Endpoints
                  </h4>
                  <div className="space-y-1.5">
                    {svc.endpoints.map((ep, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <code
                          className={`font-mono text-[11px] px-2 py-0.5 rounded shrink-0 ${
                            ep.method === 'POST'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {ep.method}
                        </code>
                        <code className="font-mono text-[12px] text-zinc-300 shrink-0">
                          {ep.path}
                        </code>
                        <span className="text-zinc-500 text-xs">{ep.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2">
                    Key Features
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {svc.features.map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800/50"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════ */}
      {/* 2. DSP Chain                    */}
      {/* ════════════════════════════════ */}
      <section id="dsp-chain" className="mb-20">
        <SectionHeading number="02" title="14-STAGE DSP MASTERING CHAIN" />
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          Pure Python (NumPy/SciPy) 実装のアナログモデリングマスタリングチェーン。
          3パス収束ループにより、ターゲットLUFSへの正確な到達を保証する。
          セクション別自動化 (section_overrides) により、楽曲構造に応じた動的パラメータ適用が可能。
        </p>

        <div className="space-y-2">
          {DSP_CHAIN.map((stage) => (
            <div
              key={stage.stage}
              className="flex items-start gap-4 p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/30 hover:border-zinc-700/50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {String(stage.stage).padStart(2, '0')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-sm font-bold text-zinc-200">
                    {stage.name}
                  </h4>
                  {stage.param !== '—' && (
                    <code className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                      {stage.param}
                    </code>
                  )}
                </div>
                <p className="text-xs text-zinc-500">{stage.desc}</p>
                {stage.range !== '—' && (
                  <span className="text-[10px] font-mono text-zinc-600 mt-1 inline-block">
                    Range: {stage.range}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════ */}
      {/* 3. DSP Parameters               */}
      {/* ════════════════════════════════ */}
      <section id="dsp-params" className="mb-20">
        <SectionHeading number="03" title="24 DSP PARAMETERS" />
        <p className="text-sm text-zinc-400 mb-8">
          Deliberationエンジンが決定し、Rendition-DSPに渡される全24パラメータの完全仕様。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-[10px] font-mono text-zinc-500 uppercase tracking-wider pb-3 pr-4">
                  Parameter
                </th>
                <th className="text-right text-[10px] font-mono text-zinc-500 uppercase tracking-wider pb-3 px-3">
                  Min
                </th>
                <th className="text-right text-[10px] font-mono text-zinc-500 uppercase tracking-wider pb-3 px-3">
                  Max
                </th>
                <th className="text-right text-[10px] font-mono text-zinc-500 uppercase tracking-wider pb-3 px-3">
                  Default
                </th>
                <th className="text-left text-[10px] font-mono text-zinc-500 uppercase tracking-wider pb-3 pl-3">
                  Unit
                </th>
              </tr>
            </thead>
            <tbody>
              {DSP_PARAMS.map((p, i) => (
                <tr
                  key={p.name}
                  className={`border-b border-zinc-800/30 ${
                    i % 2 === 0 ? 'bg-zinc-950/30' : ''
                  }`}
                >
                  <td className="py-2.5 pr-4">
                    <code className="text-xs font-mono text-zinc-300">
                      {p.name}
                    </code>
                  </td>
                  <td className="text-right py-2.5 px-3 font-mono text-xs text-zinc-500">
                    {p.min}
                  </td>
                  <td className="text-right py-2.5 px-3 font-mono text-xs text-zinc-500">
                    {p.max}
                  </td>
                  <td className="text-right py-2.5 px-3 font-mono text-xs text-emerald-400">
                    {p.default}
                  </td>
                  <td className="py-2.5 pl-3 font-mono text-xs text-zinc-600">
                    {p.unit || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ════════════════════════════════ */}
      {/* 4. Analysis Metrics             */}
      {/* ════════════════════════════════ */}
      <section id="analysis" className="mb-20">
        <SectionHeading number="04" title="BS.1770-4 ANALYSIS METRICS" />
        <p className="text-sm text-zinc-400 mb-8">
          Auditionサービスが算出する全16メトリクスの仕様。
        </p>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {ANALYSIS_METRICS.map((m) => (
            <div
              key={m.name}
              className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/30"
            >
              <code className="text-[11px] font-mono text-indigo-400">
                {m.name}
              </code>
              <p className="text-xs text-zinc-400 mt-1">{m.desc}</p>
              {m.unit && (
                <span className="text-[10px] font-mono text-zinc-600 mt-1 inline-block">
                  {m.unit}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════ */}
      {/* 5. TRIVIUM 3-Sage               */}
      {/* ════════════════════════════════ */}
      <section id="trivium" className="mb-20">
        <SectionHeading number="05" title="TRIVIUM 3-SAGE ARCHITECTURE" />
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          3つの独立AIエージェントが異なるプロバイダーで並列実行し、
          加重中央値マージにより最適なDSPパラメータを決定する。
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              name: 'Grammatica',
              provider: 'OpenAI',
              model: 'gpt-4o',
              color: 'emerald',
              desc: '構造と形式に注目。EQ/コンプの適正値に重点。',
            },
            {
              name: 'Logica',
              provider: 'Anthropic',
              model: 'claude-sonnet-4-20250514',
              color: 'violet',
              desc: '論理的整合性に注目。動的一貫性と位相整合。',
            },
            {
              name: 'Rhetorica',
              provider: 'Google',
              model: 'gemini-2.5-flash',
              color: 'amber',
              desc: '表現力と感性。サチュレーション/ステレオ幅。',
            },
          ].map((sage) => (
            <div
              key={sage.name}
              className={`p-5 rounded-xl border bg-zinc-950/50 border-${sage.color}-500/20`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full bg-${sage.color}-400`}
                />
                <h4 className="text-sm font-bold text-white">{sage.name}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500">
                    Provider
                  </span>
                  <span className="text-xs font-mono text-zinc-300">
                    {sage.provider}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-500">
                    Model
                  </span>
                  <span className="text-xs font-mono text-zinc-300">
                    {sage.model}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">{sage.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 rounded-xl border border-zinc-800/50 bg-zinc-950/50">
          <h4 className="text-sm font-bold text-white mb-3">
            加重中央値マージ (Weighted Median Merge)
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
            各Sageの提案値を <code className="text-indigo-400">confidence × valid_param_ratio</code> で
            重み付けし、24パラメータそれぞれについて加重中央値を算出。
            セクションオーバーライドは全Sageの提案を統合し、時間軸上でマージ。
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Strategy', value: 'weighted_median_merge' },
              { label: 'Output', value: '24 params + sections' },
              { label: 'Timeout', value: '180s' },
              { label: 'Fallback', value: 'デフォルト値' },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-zinc-900/50">
                <div className="text-[10px] font-mono text-zinc-500">
                  {item.label}
                </div>
                <div className="text-xs font-mono text-zinc-300 mt-0.5">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════ */}
      {/* 6. Pipeline Routes              */}
      {/* ════════════════════════════════ */}
      <section id="routes" className="mb-20">
        <SectionHeading number="06" title="PIPELINE ROUTES" />

        <div className="space-y-4">
          {[
            {
              route: 'full',
              pipeline: 'URL解決 → 分析 → 合議 → DSPマスタリング → WAV出力',
              output: 'audio/wav + メトリクスJSON',
              useCase: 'エンドツーエンドの自動マスタリング',
            },
            {
              route: 'analyze_only',
              pipeline: 'URL解決 → 分析',
              output: 'AnalysisResult JSON',
              useCase: 'ラウドネス分析のみ実行',
            },
            {
              route: 'deliberation_only',
              pipeline: 'URL解決 → 分析 → 合議',
              output: 'DeliberationOutput JSON',
              useCase: 'AIパラメータ提案の確認',
            },
            {
              route: 'dsp_only',
              pipeline: 'URL解決 → DSPマスタリング (manual_params必須)',
              output: 'audio/wav + メトリクスJSON',
              useCase: '手動パラメータでのマスタリング',
            },
          ].map((r) => (
            <div
              key={r.route}
              className="p-5 rounded-xl border border-zinc-800/50 bg-zinc-950/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <code className="text-sm font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg">
                  {r.route}
                </code>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-zinc-500">Pipeline: </span>
                  <span className="text-zinc-300">{r.pipeline}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Output: </span>
                  <span className="text-zinc-300">{r.output}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Use Case: </span>
                  <span className="text-zinc-300">{r.useCase}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════ */}
      {/* 7. Infrastructure              */}
      {/* ════════════════════════════════ */}
      <section id="infra" className="mb-20">
        <SectionHeading number="07" title="INFRASTRUCTURE" />

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: 'Compute', value: 'Google Cloud Run (gen2)', detail: 'Concertmaster: 2vCPU/4GiB, Rendition-DSP: 4vCPU/8GiB' },
            { label: 'Storage', value: 'Google Cloud Storage', detail: 'GCS FUSE マウント + /tmp フォールバック' },
            { label: 'Auth', value: 'Supabase Auth (SSR)', detail: 'Email/Password + OAuth (Google)' },
            { label: 'Database', value: 'Supabase PostgreSQL', detail: 'jobs / billing / users テーブル' },
            { label: 'Frontend', value: 'Cloud Run (standalone)', detail: 'Next.js 15.5 / Dockerfile / standalone output' },
            { label: 'CI/CD', value: 'Cloud Build', detail: 'cloudbuild.yaml → Docker → Cloud Run deploy' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/30"
            >
              <div className="text-[10px] font-mono text-zinc-500 uppercase">
                {item.label}
              </div>
              <div className="text-sm font-bold text-zinc-200 mt-1">
                {item.value}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{item.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════ */}
      {/* 8. Security                    */}
      {/* ════════════════════════════════ */}
      <section id="security" className="mb-20">
        <SectionHeading number="08" title="SECURITY" />

        <div className="space-y-3">
          {[
            {
              threat: 'SSRF',
              mitigation: 'validate_url_safe() — プライベートIP/メタデータサーバー/ループバックアドレスをDNS解決後にブロック',
            },
            {
              threat: 'APIキー漏洩',
              mitigation: 'CONCERTMASTER_API_KEY はサーバーサイド環境変数のみ。NEXT_PUBLIC_ 接頭辞禁止',
            },
            {
              threat: 'サービス間なりすまし',
              mitigation: 'OIDC IDトークン認証 (Google Cloud IAM)',
            },
            {
              threat: 'ファイルサイズ攻撃',
              mitigation: 'Upload: 200MB / Concertmaster: 200MB / 44Bバイト最小チェック',
            },
            {
              threat: 'XSS',
              mitigation: 'React自動エスケープ + CSP headers',
            },
            {
              threat: '認証バイパス',
              mitigation: 'Supabase SSRミドルウェア — /app/history, /app/settings 保護',
            },
            {
              threat: 'LLM出力ハルシネーション',
              mitigation: '3段JSON正規化層 + パラメータ範囲クランプ',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/30"
            >
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 shrink-0 mt-0.5">
                {item.threat}
              </span>
              <span className="text-xs text-zinc-400">{item.mitigation}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="pt-8 border-t border-zinc-800/50">
        <p className="text-xs font-mono text-zinc-600 text-center">
          WhitePrint AudioEngine Technical Specification v1.0 — Last updated: 2026-04-15
        </p>
      </div>
    </div>
  );
}

/* ─── Reusable Section Heading ─── */

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-3xl font-mono font-bold text-zinc-800">
        {number}
      </span>
      <div>
        <h2 className="text-xl font-mono font-bold text-white uppercase tracking-wider">
          {title}
        </h2>
        <div className="w-12 h-0.5 bg-indigo-500 mt-2" />
      </div>
    </div>
  );
}
