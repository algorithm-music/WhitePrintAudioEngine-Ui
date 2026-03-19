import type { AnalysisResult } from '@/types/audio';
import type { DeliberationOutput, AdoptedParams, SageOpinion, DynamicMasteringSection } from '@/types/deliberation';

export async function runDeliberationMock(analysis: AnalysisResult): Promise<DeliberationOutput> {
  // Simulate API calls and deliberation process
  await new Promise((resolve) => setTimeout(resolve, 4500));

  const run_id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const baseParams: AdoptedParams = {
    input_gain_db: 1.5,
    eq_low_shelf_gain_db: 0.5,
    eq_low_mid_gain_db: -1.0,
    eq_high_mid_gain_db: 1.2,
    eq_high_shelf_gain_db: 2.0,
    ms_side_high_gain_db: 1.0,
    ms_mid_low_gain_db: -0.5,
    comp_threshold_db: -14.0,
    comp_ratio: 2.5,
    comp_attack_sec: 0.03,
    comp_release_sec: 0.15,
    limiter_ceil_db: -0.3,
    transformer_saturation: 0.4,
    transformer_mix: 0.5,
    triode_drive: 0.6,
    triode_bias: -1.2,
    triode_mix: 0.3,
    tape_saturation: 0.2,
    tape_mix: 0.4,
    dyn_eq_enabled: 1,
    stereo_low_mono: 0.9,
    stereo_high_wide: 1.1,
    stereo_width: 1.05,
    parallel_wet: 0.15,
  };

  const grammatica: SageOpinion = {
    agent_name: 'grammatica',
    provider: 'openai',
    model: 'gpt-5.4',
    is_fallback: false,
    latency_ms: 1200,
    parse_status: 'ok',
    raw_response_size: 1500,
    confidence: 0.95,
    valid_param_ratio: 1.0,
    ...baseParams,
    comp_threshold_db: -16.0,
    comp_ratio: 4.0,
    limiter_ceil_db: -0.5,
    transformer_saturation: 0.2,
    triode_drive: 0.3,
    stereo_width: 1.0,
    rationale: 'The track exhibits significant true peak danger and phase cancellation risks in the low end. Strict dynamic control is required. I have lowered the compressor threshold and increased the ratio to ensure BS.1770-4 compliance. Harmonic saturation has been minimized to prevent intermodulation distortion.',
    section_overrides: [],
    errors: [],
    token_usage: { prompt_tokens: 1500, completion_tokens: 400, total_tokens: 1900 },
  };

  const logica: SageOpinion = {
    agent_name: 'logica',
    provider: 'anthropic',
    model: 'claude-opus-4-6',
    is_fallback: false,
    latency_ms: 1800,
    parse_status: 'ok',
    raw_response_size: 1800,
    confidence: 0.88,
    valid_param_ratio: 1.0,
    ...baseParams,
    comp_threshold_db: -12.0,
    comp_ratio: 2.0,
    eq_low_mid_gain_db: -1.5,
    dyn_eq_enabled: 1,
    rationale: 'While physical limits must be respected, over-compression will flatten the macro-dynamic structure of the track. I propose a moderate threshold to retain the contrast between the Verse and the Drop. The mud risk in the 200-500Hz range requires dynamic EQ intervention rather than static cuts.',
    section_overrides: [
      {
        start_sec: analysis.physical_sections.find(s => s.song_structure === 'Chorus / Drop')?.start_sec || 20,
        end_sec: analysis.physical_sections.find(s => s.song_structure === 'Chorus / Drop')?.end_sec || 40,
        label: 'Chorus / Drop',
        rationale: 'Increase stereo width and saturation during the drop to maximize impact without violating the global loudness target.',
        stereo_width: 1.15,
        transformer_saturation: 0.6,
      }
    ],
    errors: [],
    token_usage: { prompt_tokens: 1600, completion_tokens: 500, total_tokens: 2100 },
  };

  const rhetorica: SageOpinion = {
    agent_name: 'rhetorica',
    provider: 'google',
    model: 'gemini-3.1-pro-preview',
    is_fallback: false,
    latency_ms: 1500,
    parse_status: 'ok',
    raw_response_size: 1600,
    confidence: 0.92,
    valid_param_ratio: 1.0,
    ...baseParams,
    eq_high_shelf_gain_db: 3.0,
    transformer_saturation: 0.7,
    triode_drive: 0.8,
    tape_saturation: 0.5,
    stereo_high_wide: 1.25,
    stereo_width: 1.1,
    rationale: 'The track lacks emotional warmth and spatial immersion. We must push the triode drive and tape saturation to give it an organic, analog feel. The high-frequency widening will create a sense of ethereal space, making the vocal presence much more intimate and engaging.',
    section_overrides: [],
    errors: [],
    token_usage: { prompt_tokens: 1400, completion_tokens: 450, total_tokens: 1850 },
  };

  const adopted_params: AdoptedParams = {
    ...baseParams,
    // Weighted median simulation
    comp_threshold_db: -13.5,
    comp_ratio: 2.5,
    transformer_saturation: 0.45,
    triode_drive: 0.55,
    stereo_width: 1.05,
  };

  const dynamic_mastering_sections: DynamicMasteringSection[] = analysis.physical_sections.map((sec, idx) => {
    const isDrop = sec.song_structure === 'Chorus / Drop';
    const sectionParams = { ...adopted_params };
    const diff_from_global: Record<string, any> = {};

    if (isDrop) {
      sectionParams.stereo_width = 1.12;
      sectionParams.transformer_saturation = 0.55;
      diff_from_global['stereo_width'] = { global_value: adopted_params.stereo_width, section_value: 1.12, delta: 0.07 };
      diff_from_global['transformer_saturation'] = { global_value: adopted_params.transformer_saturation, section_value: 0.55, delta: 0.1 };
    }

    return {
      section_index: idx,
      start_sec: sec.start_sec,
      end_sec: sec.end_sec,
      duration_sec: sec.end_sec - sec.start_sec,
      label: sec.song_structure,
      source_metrics: {
        avg_lufs: sec.avg_lufs,
        peak_lufs: sec.avg_lufs + 2.0,
        avg_crest_db: 12.0,
        avg_stereo_width: sec.avg_width,
        avg_spectral_centroid: 2500,
        avg_transient_sharp: 0.15,
        sub_ratio: 0.1,
        bass_ratio: 0.2,
        low_mid_ratio: 0.2,
        mid_ratio: 0.3,
        high_ratio: 0.15,
        air_ratio: 0.05,
      },
      override_sources: (isDrop ? {
        'logica': { proposed: true, rationale: 'Increase stereo width and saturation during the drop to maximize impact.' }
      } : {}) as Record<string, { proposed: boolean; rationale?: string }>,
      params: sectionParams,
      diff_from_global,
      dsp_coupling_applied: isDrop ? [
        {
          rule_id: 4,
          rule_name: 'Stereo Width vs Sub-bass mono',
          param_before: 'stereo_low_mono: 0.9',
          param_after: 'stereo_low_mono: 0.95',
          reason: 'Dangerous widening detected. Forced tight low end to anchor the track.'
        }
      ] : []
    };
  });

  return {
    run_id,
    timestamp,
    query_hash: 'a1b2c3d4e5f6g7h8i9j0',
    analysis_version: 'v2',
    schema_version: '1.0',
    sage_config: {
      deliberation_archetype: 'trivium'
    },
    active_sages: {
      'grammatica': { name: 'GRAMMATICA (Engineer)', provider: 'openai', primary_model: 'gpt-5.4', fallback_model: 'gpt-5.2' },
      'logica': { name: 'LOGICA (Structure Guard)', provider: 'anthropic', primary_model: 'claude-opus-4-6', fallback_model: 'claude-sonnet-4-6' },
      'rhetorica': { name: 'RHETORICA (Form Analyst)', provider: 'google', primary_model: 'gemini-3.1-pro-preview', fallback_model: 'gemini-3-flash-preview' }
    },
    provider_results: {
      'grammatica': { provider: 'openai', model: 'gpt-5.4', parse_status: 'ok', latency_ms: 1200 },
      'logica': { provider: 'anthropic', model: 'claude-opus-4-6', parse_status: 'ok', latency_ms: 1800 },
      'rhetorica': { provider: 'google', model: 'gemini-3.1-pro-preview', parse_status: 'ok', latency_ms: 1500 }
    },
    merge_strategy: 'weighted_median_v2_validity_aware',
    runtime_ms: 4500,
    token_usage: {
      prompt_tokens: 4500,
      completion_tokens: 1350,
      total_tokens: 5850
    },
    errors: [],
    opinions: [grammatica, logica, rhetorica],
    adopted_params,
    dynamic_mastering_sections,
    deliberation_score: 0.82,
    deliberation_score_detail: {
      global: 0.82,
      dynamics: 0.75,
      tone: 0.88,
      stereo: 0.85,
      saturation: 0.70
    },
    target_lufs: -14.0,
    target_true_peak: -1.0
  };
}
