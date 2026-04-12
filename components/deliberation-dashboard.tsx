'use client';

import type { DeliberationOutput } from '@/types/deliberation';
import { motion } from 'framer-motion';
import { BrainCircuit, CheckCircle2, Code, LayoutDashboard, MessageSquare, Sliders, Target, AlertTriangle, Activity, Layers, Zap } from 'lucide-react';
import TriadConsensus from '@/components/triad-consensus';
import { useState } from 'react';

interface DeliberationDashboardProps {
  data: DeliberationOutput;
  onRunMastering?: () => void;
  onReset?: () => void;
}

export default function DeliberationDashboard({ data, onRunMastering, onReset }: DeliberationDashboardProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 pb-24">
      {/* View Toggle */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-mono font-bold text-white flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            DELIBERATION_COMPLETE
          </h2>
          {onReset && (
            <button onClick={onReset} className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors uppercase border border-zinc-800 rounded px-2 py-1 bg-zinc-900/50">
              [ New_Session ]
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {onRunMastering && (
            <button
              onClick={onRunMastering}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <Zap className="w-4 h-4" />
              RUN MASTERING
            </button>
          )}
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-mono transition-colors ${viewMode === 'visual' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> VISUAL
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-mono transition-colors ${viewMode === 'json' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Code className="w-4 h-4" /> JSON
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
          
          {/* Triad Consensus — replaces old Summary & Scores */}
          <TriadConsensus data={data} />

          {/* Adopted Parameters */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Adopted_Parameters
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricBox label="TARGET_LUFS" value={`${data?.target_lufs ?? '—'} LUFS`} />
              <MetricBox label="TRUE_PEAK" value={`${data?.target_true_peak ?? '—'} dBTP`} />
              <MetricBox label="EQ_LOW_SHELF" value={data?.adopted_params?.eq_low_shelf_gain_db ?? 0} />
              <MetricBox label="EQ_HIGH_SHELF" value={data?.adopted_params?.eq_high_shelf_gain_db ?? 0} />
              <MetricBox label="COMP_THRESH" value={data?.adopted_params?.comp_threshold_db ?? 0} />
              <MetricBox label="COMP_RATIO" value={data?.adopted_params?.comp_ratio ?? 0} />
              <MetricBox label="STEREO_WIDTH" value={data?.adopted_params?.stereo_width ?? 0} />
              <MetricBox label="LIMITER_CEIL" value={data?.adopted_params?.limiter_ceil_db ?? 0} />
            </div>
          </div>

          {/* Sage Opinions */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Sage_Opinions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(data.opinions ?? []).map((opinion, index) => {
                const colors = [
                  { border: 'border-blue-500/40', accent: 'text-blue-400', bg: 'bg-blue-600', ring: 'ring-1 ring-blue-500/20', headerBg: 'bg-blue-950/50' },
                  { border: 'border-emerald-500/40', accent: 'text-emerald-400', bg: 'bg-emerald-600', ring: 'ring-1 ring-emerald-500/20', headerBg: 'bg-emerald-950/50' },
                  { border: 'border-amber-500/40', accent: 'text-amber-400', bg: 'bg-amber-600', ring: 'ring-1 ring-amber-500/20', headerBg: 'bg-amber-950/50' },
                ][index] ?? { border: 'border-zinc-800', accent: 'text-zinc-400', bg: 'bg-zinc-600', ring: '', headerBg: 'bg-zinc-900' };

                return (
                  <SageCard key={index} opinion={opinion} colors={colors} />
                );
              })}
            </div>
          </div>

          {/* Dynamic Mastering Sections */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4" /> Dynamic_Mastering_Sections
            </h3>
            <div className="space-y-4">
              {(data.dynamic_mastering_sections ?? []).map((section, index) => {
                const m = section?.source_metrics ?? {} as any;
                const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
                const hasOverrides = Object.keys(section.override_sources ?? {}).length > 0;
                const hasDiff = Object.keys(section.diff_from_global ?? {}).length > 0;
                const hasCoupling = (section.dsp_coupling_applied ?? []).length > 0;

                return (
                  <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="px-2 py-1 bg-zinc-800 rounded text-xs font-mono text-zinc-300">
                          {fmtTime(section.start_sec)} — {fmtTime(section.end_sec)}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-600">({section.duration_sec.toFixed(0)}s)</span>
                        <h4 className="text-sm font-bold text-white">{section.label}</h4>
                      </div>
                      <div className="flex gap-2">
                        {hasOverrides && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                            <AlertTriangle className="w-3 h-3" /> OVERRIDE
                          </div>
                        )}
                        {hasCoupling && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                            DSP_COUPLED
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Source Metrics — the full picture */}
                    {m && (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        <MiniMetric label="AVG_LUFS" value={m.avg_lufs?.toFixed(1)} warn={m.avg_lufs > -12} />
                        <MiniMetric label="PEAK_LUFS" value={m.peak_lufs?.toFixed(1)} />
                        <MiniMetric label="CREST" value={m.avg_crest_db?.toFixed(1)} unit="dB" />
                        <MiniMetric label="WIDTH" value={m.avg_stereo_width?.toFixed(3)} />
                        <MiniMetric label="CENTROID" value={m.avg_spectral_centroid?.toFixed(0)} unit="Hz" />
                        <MiniMetric label="TRANSIENT" value={m.avg_transient_sharp?.toFixed(3)} />
                        <MiniMetric label="SUB" value={((m.sub_ratio ?? 0) * 100).toFixed(1)} unit="%" warn={(m.sub_ratio ?? 0) > 0.4} />
                        <MiniMetric label="BASS" value={((m.bass_ratio ?? 0) * 100).toFixed(1)} unit="%" />
                        <MiniMetric label="LOW_MID" value={((m.low_mid_ratio ?? 0) * 100).toFixed(1)} unit="%" />
                        <MiniMetric label="MID" value={((m.mid_ratio ?? 0) * 100).toFixed(1)} unit="%" />
                        <MiniMetric label="HIGH" value={((m.high_ratio ?? 0) * 100).toFixed(1)} unit="%" />
                        <MiniMetric label="AIR" value={((m.air_ratio ?? 0) * 100).toFixed(1)} unit="%" />
                      </div>
                    )}

                    {/* AI Override Rationales */}
                    {hasOverrides && (
                      <div className="space-y-2">
                        {Object.entries(section.override_sources ?? {}).map(([agent, info]) => (
                          <div key={agent} className="text-xs text-zinc-400 bg-zinc-900 p-3 rounded-lg border border-zinc-800/50">
                            <span className="font-bold text-zinc-300 uppercase">{agent}:</span> {info.rationale}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Parameter Diff from Global */}
                    {hasDiff && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(section.diff_from_global ?? {}).map(([param, diff]) => (
                          <div key={param} className="bg-zinc-900 p-2 rounded-lg border border-zinc-800/50">
                            <div className="text-[9px] font-mono text-zinc-500 uppercase truncate">{param}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono text-zinc-100">{typeof diff.section_value === 'number' ? diff.section_value.toFixed(2) : diff.section_value}</span>
                              <span className={`text-xs font-mono ${diff.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {(diff?.delta ?? 0) > 0 ? '+' : ''}{(diff?.delta ?? 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!hasDiff && (
                      <div className="text-xs text-zinc-600 font-mono italic">
                        Using global parameters (no section-specific overrides).
                      </div>
                    )}

                    {/* DSP Coupling Rules */}
                    {hasCoupling && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-amber-500 uppercase">DSP Coupling Applied</div>
                        {(section.dsp_coupling_applied ?? []).map((rule, rIdx) => (
                          <div key={rIdx} className="text-[10px] font-mono text-zinc-500 bg-zinc-900 p-2 rounded border border-zinc-800/30">
                            <span className="text-amber-400">[{rule.rule_name}]</span> {rule.reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </motion.div>
      )}
    </div>
  );
}

function SageCard({ opinion, colors }: { opinion: DeliberationOutput['opinions'][number]; colors: { border: string; accent: string; bg: string; ring: string; headerBg: string } }) {
  const [expanded, setExpanded] = useState(false);
  const rationale = opinion.rationale || '';
  const isLong = rationale.length > 200;

  return (
    <div className={`border ${colors.border} ${colors.ring} rounded-lg overflow-hidden flex flex-col`}>
      {/* Colored header */}
      <div className={`${colors.headerBg} px-4 py-3 flex items-center gap-2`}>
        <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center shadow-lg`}>
          <span className="text-xs font-bold text-white">
            {(opinion.agent_name || '?').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-bold uppercase ${colors.accent}`}>{opinion.agent_name}</div>
          <div className="text-[10px] text-zinc-500">{opinion.provider} · {opinion.model}</div>
        </div>
        {opinion.is_fallback && (
          <span className="text-[9px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-mono">FALLBACK</span>
        )}
      </div>

      <div className="bg-zinc-900 px-4 py-3 flex-1 flex flex-col">
        {/* Rationale */}
        <div className="mb-3">
          <p className={`text-xs text-zinc-300 leading-relaxed ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
            &ldquo;{rationale}&rdquo;
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`text-[10px] mt-1 ${colors.accent} hover:underline`}
            >
              {expanded ? '▲ collapse' : '▼ read more'}
            </button>
          )}
        </div>

        {/* Key Params */}
        <div className="mt-auto space-y-1.5">
          <div className={`text-[10px] font-mono uppercase ${colors.accent}`}>Proposed Params</div>
          <div className="grid grid-cols-2 gap-1.5">
            <ParamChip label="COMP_TH" value={opinion.comp_threshold_db} />
            <ParamChip label="COMP_RATIO" value={opinion.comp_ratio} />
            <ParamChip label="EQ_LOW" value={opinion.eq_low_shelf_gain_db} />
            <ParamChip label="EQ_HIGH" value={opinion.eq_high_shelf_gain_db} />
            <ParamChip label="STEREO_W" value={opinion.stereo_width} />
            <ParamChip label="TAPE_SAT" value={opinion.tape_saturation} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value, unit = '', warn = false }: { label: string; value?: string; unit?: string; warn?: boolean }) {
  return (
    <div className={`px-2 py-1.5 rounded text-center border ${warn ? 'border-amber-500/30 bg-amber-500/5' : 'border-zinc-800/50 bg-zinc-900/50'}`}>
      <div className="text-[8px] font-mono text-zinc-600 uppercase">{label}</div>
      <div className={`text-[11px] font-mono font-medium ${warn ? 'text-amber-400' : 'text-zinc-300'}`}>
        {value ?? '—'}{unit && <span className="text-zinc-600 text-[8px] ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

function ParamChip({ label, value }: { label: string; value?: number }) {
  return (
    <div className="bg-zinc-950 px-2 py-1.5 rounded text-xs font-mono text-zinc-400 flex justify-between">
      <span className="text-zinc-600">{label}</span>
      <span>{value != null ? (typeof value === 'number' ? value.toFixed(1) : value) : '—'}</span>
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
