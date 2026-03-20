'use client';

import type { DeliberationOutput } from '@/types/deliberation';
import { motion } from 'framer-motion';
import { BrainCircuit, CheckCircle2, Code, LayoutDashboard, MessageSquare, Sliders, Target, AlertTriangle, Activity, Layers, Zap } from 'lucide-react';
import { useState } from 'react';
import { useLocale } from '@/lib/locale-context';

interface DeliberationDashboardProps {
  data: DeliberationOutput;
  onRunMastering?: () => void;
}

export default function DeliberationDashboard({ data, onRunMastering }: DeliberationDashboardProps) {
  const { t } = useLocale();
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 pb-24">
      {/* View Toggle */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-mono font-bold text-white flex items-center gap-3">
          <BrainCircuit className="w-6 h-6 text-indigo-400" />
          {t('deliberation_complete')}
        </h2>
        <div className="flex items-center gap-4">
          {onRunMastering && (
            <button
              onClick={onRunMastering}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <Zap className="w-4 h-4" />
              {t('run_mastering')}
            </button>
          )}
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-mono transition-colors ${viewMode === 'visual' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> {t('visual')}
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-mono transition-colors ${viewMode === 'json' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Code className="w-4 h-4" /> {t('json')}
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'json' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 overflow-auto max-h-[75vh]"
        >
          <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
            {JSON.stringify(data, null, 2)}
          </pre>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Top Row: Summary & Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col lg:col-span-2">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" /> {t('deliberation_summary')}
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {t('strategy')}: {data.merge_strategy} &mdash; LUFS {data.target_lufs} / True Peak {data.target_true_peak} dBTP
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> {t('deliberation_scores')}
              </h3>
              <div className="space-y-3 mt-auto">
                <ScoreBar label={t('overall')} value={data.deliberation_score} />
                <ScoreBar label={t('dynamics')} value={data.deliberation_score_detail.dynamics} />
                <ScoreBar label={t('tone')} value={data.deliberation_score_detail.tone} />
              </div>
            </div>
          </div>

          {/* Adopted Parameters */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4" /> {t('adopted_params')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricBox label="TARGET_LUFS" value={`${data.target_lufs} LUFS`} />
              <MetricBox label="TRUE_PEAK" value={`${data.target_true_peak} dBTP`} />
              <MetricBox label="EQ_LOW_SHELF" value={data.adopted_params.eq_low_shelf_gain_db} />
              <MetricBox label="EQ_HIGH_SHELF" value={data.adopted_params.eq_high_shelf_gain_db} />
              <MetricBox label="COMP_THRESH" value={data.adopted_params.comp_threshold_db} />
              <MetricBox label="COMP_RATIO" value={data.adopted_params.comp_ratio} />
              <MetricBox label="STEREO_WIDTH" value={data.adopted_params.stereo_width} />
              <MetricBox label="LIMITER_CEIL" value={data.adopted_params.limiter_ceil_db} />
            </div>
          </div>

          {/* Sage Opinions */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> {t('sage_opinions')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.opinions.map((opinion, index) => (
                <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <BrainCircuit className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white uppercase">{opinion.agent_name}</div>
                      <div className="text-xs text-zinc-500">{opinion.provider} - {opinion.model}</div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                    "{opinion.rationale}"
                  </p>
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-zinc-500">{t('proposed_params')}:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-zinc-950 p-2 rounded text-xs font-mono text-zinc-400">
                        COMP_TH: {opinion.comp_threshold_db}
                      </div>
                      <div className="bg-zinc-950 p-2 rounded text-xs font-mono text-zinc-400">
                        COMP_RATIO: {opinion.comp_ratio}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Mastering Sections */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4" /> {t('dynamic_sections')}
            </h3>
            <div className="space-y-4">
              {data.dynamic_mastering_sections.map((section, index) => (
                <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="px-2 py-1 bg-zinc-800 rounded text-xs font-mono text-zinc-300">
                        {section.start_sec.toFixed(1)}s - {section.end_sec.toFixed(1)}s
                      </div>
                      <h4 className="text-sm font-bold text-white">{section.label}</h4>
                    </div>
                    {Object.keys(section.override_sources).length > 0 && (
                      <div className="flex items-center gap-1 text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                        <AlertTriangle className="w-3 h-3" /> {t('override_applied')}
                      </div>
                    )}
                  </div>
                  
                  {Object.keys(section.override_sources).length > 0 && (
                    <div className="mb-4 space-y-2">
                      {Object.entries(section.override_sources).map(([agent, info]) => (
                        <div key={agent} className="text-xs text-zinc-400 bg-zinc-900 p-3 rounded-lg border border-zinc-800/50">
                          <span className="font-bold text-zinc-300 uppercase">{agent}:</span> {info.rationale}
                        </div>
                      ))}
                    </div>
                  )}

                  {Object.keys(section.diff_from_global).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(section.diff_from_global).map(([param, diff]) => (
                        <div key={param} className="bg-zinc-900 p-3 rounded-lg border border-zinc-800/50">
                          <div className="text-[10px] font-mono text-zinc-500 mb-1 uppercase truncate">{param}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-zinc-100">{diff.section_value}</span>
                            <span className={`text-xs font-mono ${diff.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {diff.delta > 0 ? '+' : ''}{diff.delta.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {Object.keys(section.diff_from_global).length === 0 && (
                    <div className="text-xs text-zinc-500 font-mono italic">
                      {t('no_overrides')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      )}
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800/50 flex flex-col justify-center">
      <div className="text-[10px] font-mono text-zinc-500 mb-1 uppercase tracking-wider">{label}</div>
      <div className="text-lg font-mono font-medium text-zinc-100">{value}</div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-100">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
        <div 
          className="h-full bg-indigo-500 rounded-full" 
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}
