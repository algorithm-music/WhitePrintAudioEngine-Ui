export interface SageConfig {
  deliberation_archetype?: 'trivium' | '12_agents_jp' | 'time_series_evaluator';
  custom_personas?: Record<string, any>;
}

export interface SageInfo {
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'unknown';
  primary_model: string;
  fallback_model: string;
}

export interface ProviderResult {
  provider: string;
  model: string;
  parse_status: 'ok' | 'repaired' | 'failed' | 'default';
  latency_ms: number;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface DeliberationError {
  agent: string;
  provider: string;
  model: string;
  stage: 'api_call' | 'json_parse' | 'fallback' | 'timeout';
  message: string;
  severity: 'warning' | 'error';
}

export interface SectionOverride {
  start_sec: number;
  end_sec: number;
  label: string;
  rationale: string;
  input_gain_db?: number;
  eq_low_shelf_gain_db?: number;
  eq_low_mid_gain_db?: number;
  eq_high_mid_gain_db?: number;
  eq_high_shelf_gain_db?: number;
  ms_side_high_gain_db?: number;
  ms_mid_low_gain_db?: number;
  comp_threshold_db?: number;
  comp_ratio?: number;
  comp_attack_sec?: number;
  comp_release_sec?: number;
  limiter_ceil_db?: number;
  transformer_saturation?: number;
  transformer_mix?: number;
  triode_drive?: number;
  triode_bias?: number;
  triode_mix?: number;
  tape_saturation?: number;
  tape_mix?: number;
  dyn_eq_enabled?: number;
  stereo_low_mono?: number;
  stereo_high_wide?: number;
  stereo_width?: number;
  parallel_wet?: number;
}

export interface SageOpinion {
  agent_name: string;
  provider: string;
  model: string;
  is_fallback: boolean;
  latency_ms: number;
  parse_status: 'ok' | 'repaired' | 'failed' | 'default';
  raw_response_size: number;
  confidence: number;
  valid_param_ratio: number;

  input_gain_db: number;
  eq_low_shelf_gain_db: number;
  eq_low_mid_gain_db: number;
  eq_high_mid_gain_db: number;
  eq_high_shelf_gain_db: number;
  ms_side_high_gain_db: number;
  ms_mid_low_gain_db: number;
  comp_threshold_db: number;
  comp_ratio: number;
  comp_attack_sec: number;
  comp_release_sec: number;
  limiter_ceil_db: number;
  transformer_saturation: number;
  transformer_mix: number;
  triode_drive: number;
  triode_bias: number;
  triode_mix: number;
  tape_saturation: number;
  tape_mix: number;
  dyn_eq_enabled: number;
  stereo_low_mono: number;
  stereo_high_wide: number;
  stereo_width: number;
  parallel_wet: number;

  rationale: string;
  section_overrides: SectionOverride[];
  errors: DeliberationError[];
  token_usage: TokenUsage;
}

export interface AdoptedParams {
  input_gain_db: number;
  eq_low_shelf_gain_db: number;
  eq_low_mid_gain_db: number;
  eq_high_mid_gain_db: number;
  eq_high_shelf_gain_db: number;
  ms_side_high_gain_db: number;
  ms_mid_low_gain_db: number;
  comp_threshold_db: number;
  comp_ratio: number;
  comp_attack_sec: number;
  comp_release_sec: number;
  limiter_ceil_db: number;
  transformer_saturation: number;
  transformer_mix: number;
  triode_drive: number;
  triode_bias: number;
  triode_mix: number;
  tape_saturation: number;
  tape_mix: number;
  dyn_eq_enabled: number;
  stereo_low_mono: number;
  stereo_high_wide: number;
  stereo_width: number;
  parallel_wet: number;
}

export interface DynamicMasteringSection {
  section_index: number;
  start_sec: number;
  end_sec: number;
  duration_sec: number;
  label: string;
  source_metrics: {
    avg_lufs: number;
    peak_lufs: number;
    avg_crest_db: number;
    avg_stereo_width: number;
    avg_spectral_centroid: number;
    avg_transient_sharp: number;
    sub_ratio: number;
    bass_ratio: number;
    low_mid_ratio: number;
    mid_ratio: number;
    high_ratio: number;
    air_ratio: number;
  };
  override_sources: Record<string, { proposed: boolean; rationale?: string }>;
  params: AdoptedParams;
  diff_from_global: Record<string, { global_value: number; section_value: number; delta: number }>;
  dsp_coupling_applied: {
    rule_id: number;
    rule_name: string;
    param_before: string;
    param_after: string;
    reason: string;
  }[];
}

export interface DeliberationScoreDetail {
  global: number;
  dynamics: number;
  tone: number;
  stereo: number;
  saturation: number;
}

export interface DeliberationOutput {
  run_id: string;
  timestamp: string;
  query_hash: string;
  analysis_version: 'v1' | 'v2';
  schema_version: string;
  sage_config: SageConfig;
  active_sages: Record<string, SageInfo>;
  provider_results: Record<string, ProviderResult>;
  merge_strategy: string;
  runtime_ms: number;
  token_usage: TokenUsage;
  errors: DeliberationError[];
  opinions: SageOpinion[];
  adopted_params: AdoptedParams;
  dynamic_mastering_sections: DynamicMasteringSection[];
  deliberation_score: number;
  deliberation_score_detail: DeliberationScoreDetail;
  target_lufs: number;
  target_true_peak: number;
}
