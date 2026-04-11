'use client';

import type { AnalysisResult } from '@/types/audio';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { AlertTriangle, CheckCircle2, Activity, Volume2, Maximize, Layers, Code, LayoutDashboard, ListMusic, BrainCircuit } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface ResultsDashboardProps {
  data: AnalysisResult;
  onRunDeliberation?: () => void;
}

export default function ResultsDashboard({ data, onRunDeliberation }: ResultsDashboardProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');
  const { track_identity, whole_track_metrics, time_series_circuit_envelopes, physical_sections, detected_problems } = data;

  // Prepare chart data
  const chartData = useMemo(() => {
    return time_series_circuit_envelopes.lufs.map((lufs, i) => ({
      time: i * time_series_circuit_envelopes.resolution_sec,
      lufs,
      crest: time_series_circuit_envelopes.crest_db[i],
      width: time_series_circuit_envelopes.width[i],
      subRatio: time_series_circuit_envelopes.sub_ratio[i],
    }));
  }, [time_series_circuit_envelopes]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 pb-24">
      {/* View Toggle */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-mono font-bold text-white">ANALYSIS_COMPLETE</h2>
        <div className="flex items-center gap-4">
          {onRunDeliberation && (
            <button
              onClick={onRunDeliberation}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <BrainCircuit className="w-4 h-4" />
              RUN DELIBERATION
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
          {/* Top Row: Identity & Global Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Track Identity */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Track_Identity
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <MetricBox label="DURATION" value={`${track_identity.duration_sec}s`} />
                <MetricBox label="SAMPLE_RATE" value={`${track_identity.sample_rate}Hz`} />
                <MetricBox label="BPM" value={track_identity.bpm || 'N/A'} />
                <MetricBox label="KEY" value={track_identity.key || 'N/A'} />
                <MetricBox label="BIT_DEPTH" value={`${track_identity.bit_depth}bit`} />
              </div>
            </div>

            {/* Loudness & Dynamics */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Volume2 className="w-4 h-4" /> BS.1770-4_Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <MetricBox label="INT_LUFS" value={whole_track_metrics.integrated_lufs} unit="LUFS" highlight={whole_track_metrics.integrated_lufs > -10 ? 'warn' : 'normal'} />
                <MetricBox label="TRUE_PEAK" value={whole_track_metrics.true_peak_dbtp} unit="dBTP" highlight={whole_track_metrics.true_peak_dbtp > -0.3 ? 'danger' : 'normal'} />
                <MetricBox label="LRA" value={whole_track_metrics.lra_lu} unit="LU" />
                <MetricBox label="CREST" value={whole_track_metrics.crest_db} unit="dB" highlight={whole_track_metrics.crest_db < 6 ? 'warn' : 'normal'} />
                <MetricBox label="WIDTH" value={whole_track_metrics.stereo_width.toFixed(2)} />
                <MetricBox label="CORRELATION" value={whole_track_metrics.stereo_correlation.toFixed(3)} />
                <MetricBox label="HARSHNESS" value={whole_track_metrics.harshness_risk.toFixed(2)} highlight={whole_track_metrics.harshness_risk > 0.5 ? 'warn' : 'normal'} />
                <MetricBox label="MUD_RISK" value={whole_track_metrics.mud_risk.toFixed(2)} highlight={whole_track_metrics.mud_risk > 0.5 ? 'warn' : 'normal'} />
                <MetricBox label="LOW_MONO" value={whole_track_metrics.low_mono_correlation_below_120hz.toFixed(3)} />
                <MetricBox label="PSR" value={whole_track_metrics.psr_db} unit="dB" />
              </div>
            </div>
          </div>

          {/* Main Chart: Time-Series Circuit Envelopes */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" /> Time_Series_Circuit_Envelopes
              </h3>
              <div className="flex gap-4 text-xs font-mono">
                <span className="flex items-center gap-1 text-indigo-400"><div className="w-2 h-2 bg-indigo-400 rounded-full"/> LUFS</span>
                <span className="flex items-center gap-1 text-emerald-400"><div className="w-2 h-2 bg-emerald-400 rounded-full"/> Crest (dB)</span>
                <span className="flex items-center gap-1 text-amber-400"><div className="w-2 h-2 bg-amber-400 rounded-full"/> Width</span>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#52525b" 
                    tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} 
                    tickFormatter={(val) => `${val}s`}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#52525b" 
                    tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                    domain={[-30, 0]}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#52525b" 
                    tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                    domain={[0, 25]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                    formatter={(value: any, name: any) => [Number(value).toFixed(2), String(name).toUpperCase()]}
                    labelFormatter={(label) => `TIME: ${label}s`}
                  />
                  
                  {/* Render Physical Sections as background areas */}
                  {physical_sections.map((section, idx) => (
                    <ReferenceArea 
                      key={idx}
                      yAxisId="left"
                      x1={section.start_sec} 
                      x2={section.end_sec} 
                      fill={idx % 2 === 0 ? '#18181b' : 'transparent'} 
                      fillOpacity={0.5}
                    />
                  ))}

                  <Line yAxisId="left" type="monotone" dataKey="lufs" stroke="#818cf8" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="crest" stroke="#34d399" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line yAxisId="right" type="monotone" dataKey="width" stroke="#fbbf24" strokeWidth={1} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Physical Sections Timeline */}
            <div className="mt-4 flex w-full h-8 rounded overflow-hidden border border-zinc-800">
              {physical_sections.map((section, idx) => {
                const width = ((section.end_sec - section.start_sec) / track_identity.duration_sec) * 100;
                return (
                  <div 
                    key={idx} 
                    style={{ width: `${width}%` }}
                    className="h-full border-r border-zinc-800 last:border-r-0 bg-zinc-900/50 hover:bg-zinc-800 transition-colors flex items-center justify-center group relative cursor-crosshair"
                  >
                    <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300 truncate px-1">
                      {`SEC_${idx}`}
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-zinc-800 text-xs font-mono p-2 rounded whitespace-nowrap z-10 border border-zinc-700 shadow-xl">
                      SEC_{idx} ({section.start_sec}s - {section.end_sec}s)<br/>
                      Avg LUFS: {section.avg_lufs}<br/>
                      Avg Width: {section.avg_width}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Problems, Spectral, and Context */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Detected Problems */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Detected_Problems
              </h3>
              <div className="space-y-3">
                {detected_problems.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-500 font-mono text-sm p-3 bg-emerald-500/10 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> NO_ENGINEERING_ISSUES_DETECTED
                  </div>
                ) : (
                  detected_problems.map((prob, idx) => (
                    <div key={idx} className={`flex items-start justify-between p-3 rounded border font-mono text-sm ${
                      prob.severity === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      prob.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    }`}>
                      <div>
                        <div className="font-semibold uppercase">{prob.issue}</div>
                        <div className="text-xs opacity-70 mt-1">Severity: {prob.severity.toUpperCase()}</div>
                      </div>
                      <div className="font-bold">{prob.value}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Spectral Ratios */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Maximize className="w-4 h-4" /> Spectral_Distribution
              </h3>
              <div className="space-y-4">
                <RatioBar label="SUB (20-60Hz)" value={whole_track_metrics.sub_ratio} color="bg-purple-500" />
                <RatioBar label="BASS (60-200Hz)" value={whole_track_metrics.bass_ratio} color="bg-blue-500" />
                <RatioBar label="LOW_MID (200-500Hz)" value={whole_track_metrics.low_mid_ratio} color="bg-emerald-500" />
                <RatioBar label="MID (500-2k)" value={whole_track_metrics.mid_ratio} color="bg-amber-500" />
                <RatioBar label="HIGH (2k-8k)" value={whole_track_metrics.high_ratio} color="bg-orange-500" />
                <RatioBar label="AIR (8k+)" value={whole_track_metrics.air_ratio} color="bg-red-500" />
              </div>
            </div>

            {/* Physical Sections Context — enriched with time-series data */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 lg:col-span-2">
              <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ListMusic className="w-4 h-4" /> Physical_Sections_Context
              </h3>
              <div className="space-y-3">
                {physical_sections.map((sec, idx) => {
                  const res = time_series_circuit_envelopes.resolution_sec || 1;
                  const startIdx = Math.floor(sec.start_sec / res);
                  const endIdx = Math.min(Math.ceil(sec.end_sec / res), time_series_circuit_envelopes.lufs.length);
                  const slice = <T,>(arr: T[]) => arr.slice(startIdx, endIdx);
                  const avg = (arr: number[]) => {
                    const s = slice(arr);
                    return s.length > 0 ? s.reduce((a, b) => a + b, 0) / s.length : 0;
                  };

                  const crest = avg(time_series_circuit_envelopes.crest_db);
                  const sub = avg(time_series_circuit_envelopes.sub_ratio);
                  const bass = avg(time_series_circuit_envelopes.bass_ratio);
                  const brightness = avg(time_series_circuit_envelopes.spectral_brightness);
                  const transient = avg(time_series_circuit_envelopes.transient_sharpness);
                  const duration = sec.end_sec - sec.start_sec;
                  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
                  // Infer section character from metrics
                  const sectionHint =
                    sec.avg_lufs < -20 ? 'Fade / Silence' :
                    sec.avg_lufs > -13 ? 'Peak Energy' :
                    crest > 10 ? 'Dynamic / Sparse' :
                    sub > 0.4 ? 'Bass-Heavy' :
                    brightness > 0.02 ? 'Bright / Airy' :
                    sec.avg_width > 0.15 ? 'Wide Stereo' :
                    'Steady';

                  return (
                    <div key={idx} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            SEC_{idx}
                          </span>
                          <span className="text-xs font-mono text-zinc-500">
                            {fmtTime(sec.start_sec)} — {fmtTime(sec.end_sec)}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-600">
                            ({duration.toFixed(0)}s)
                          </span>
                          <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                            {sectionHint}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                        <SectionMetric label="LUFS" value={sec.avg_lufs.toFixed(1)} warn={sec.avg_lufs > -12} />
                        <SectionMetric label="WIDTH" value={sec.avg_width.toFixed(3)} />
                        <SectionMetric label="CREST" value={crest.toFixed(1)} unit="dB" />
                        <SectionMetric label="SUB" value={(sub * 100).toFixed(1)} unit="%" warn={sub > 0.4} />
                        <SectionMetric label="BASS" value={(bass * 100).toFixed(1)} unit="%" />
                        <SectionMetric label="BRIGHT" value={brightness.toFixed(3)} />
                        <SectionMetric label="TRANS" value={transient.toFixed(3)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
}

function MetricBox({ label, value, unit = '', highlight = 'normal' }: { label: string, value: string | number, unit?: string, highlight?: 'normal' | 'warn' | 'danger' }) {
  return (
    <div className={`p-3 rounded border flex flex-col justify-center ${
      highlight === 'danger' ? 'bg-red-500/10 border-red-500/30' :
      highlight === 'warn' ? 'bg-amber-500/10 border-amber-500/30' :
      'bg-zinc-900/50 border-zinc-800'
    }`}>
      <div className="text-[10px] text-zinc-500 font-mono mb-1">{label}</div>
      <div className={`font-mono text-lg font-semibold ${
        highlight === 'danger' ? 'text-red-400' :
        highlight === 'warn' ? 'text-amber-400' :
        'text-zinc-200'
      }`}>
        {value} <span className="text-xs font-normal opacity-50">{unit}</span>
      </div>
    </div>
  );
}

function SectionMetric({ label, value, unit = '', warn = false }: { label: string; value: string; unit?: string; warn?: boolean }) {
  return (
    <div className={`px-2 py-1.5 rounded text-center border ${warn ? 'border-amber-500/30 bg-amber-500/5' : 'border-zinc-800/50 bg-zinc-950'}`}>
      <div className="text-[9px] font-mono text-zinc-600 uppercase">{label}</div>
      <div className={`text-xs font-mono font-medium ${warn ? 'text-amber-400' : 'text-zinc-200'}`}>
        {value}{unit && <span className="text-zinc-600 text-[9px] ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

function RatioBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-300">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}
