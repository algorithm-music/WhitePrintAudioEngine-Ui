export interface MasteringMetrics {
  lufs_before: number;
  lufs_after: number;
  true_peak_before: number;
  true_peak_after: number;
  dynamic_range_after: number;
  convergence_loops: number;
  gain_adjustment_db: number;
  target_lufs: number;
  target_true_peak: number;
  engine_version: string;
}

export interface MasteringResult {
  job_id: string;
  status: 'success' | 'failed';
  metrics: MasteringMetrics;
  download_url: string;
}
