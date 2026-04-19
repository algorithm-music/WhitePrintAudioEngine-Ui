'use client';

import LoadingExperience, { Phase } from './loading-experience';

const PHASES: Phase[] = [
  {
    name: 'DECODE',
    steps: [
      { text: 'Validating WAV/FLAC/AIFF header integrity', metric: null },
      { text: 'Decoding PCM stream → 64-bit float', metric: null },
      { text: 'Extracting channel layout (L/R/M/S)', metric: null },
    ],
  },
  {
    name: 'SPECTRUM',
    steps: [
      { text: 'Computing 4096-point FFT per 50ms frame', metric: '~5,600 frames' },
      { text: 'Applying Hann window with 75% overlap', metric: null },
      { text: 'Binning into 6-band spectral distribution', metric: 'Sub/Bass/LM/M/Hi/Air' },
    ],
  },
  {
    name: 'LOUDNESS',
    steps: [
      { text: 'Applying BS.1770-4 K-weighting filter', metric: 'ITU-R' },
      { text: 'Gating at -70 LUFS (absolute) and -10 LU (relative)', metric: null },
      { text: 'Computing integrated LUFS over full duration', metric: null },
      { text: 'Measuring True Peak via 4× oversampling', metric: null },
      { text: 'Calculating Loudness Range (LRA)', metric: null },
    ],
  },
  {
    name: 'ENVELOPES',
    steps: [
      { text: 'Generating 0.1s resolution time-series', metric: '9 dimensions' },
      { text: 'LUFS envelope extraction', metric: null },
      { text: 'Crest factor (peak-to-RMS) per chunk', metric: null },
      { text: 'Stereo width & mono correlation tracking', metric: null },
      { text: 'Spectral brightness & transient sharpness', metric: null },
      { text: 'Sub-bass ratio monitoring', metric: null },
    ],
  },
  {
    name: 'SECTIONS',
    steps: [
      { text: 'Smoothing LUFS+Width (3s moving avg)', metric: 'macro-form' },
      { text: 'Peak-picking novelty boundaries', metric: 'LUFS 70% + Width 30%' },
      { text: 'Enforcing min 8s section length', metric: null },
    ],
  },
  {
    name: 'SEMANTICS',
    steps: [
      { text: 'Booting Gemini Native Audio Engine', metric: 'multimodal' },
      { text: 'Slicing SEC_0 for AI audition', metric: null },
      { text: 'Identifying instruments & musical scene...', metric: null },
      { text: 'Slicing SEC_1 for AI audition', metric: null },
      { text: 'Identifying instruments & musical scene...', metric: null },
      { text: 'Slicing SEC_2 for AI audition', metric: null },
      { text: 'Identifying instruments & musical scene...', metric: null },
    ],
  },
  {
    name: 'PROBLEMS',
    steps: [
      { text: 'Evaluating harshness risk (2-6kHz energy)', metric: null },
      { text: 'Evaluating mud risk (200-500Hz density)', metric: null },
      { text: 'Checking mono compatibility (< 120Hz)', metric: null },
      { text: 'Flagging clipping / true peak violations', metric: null },
    ],
  },
  {
    name: 'FINALIZE',
    steps: [
      { text: 'Merging DSP metrics with AI Semantic Context', metric: null },
      { text: 'Assembling JSON payload + circuit envelopes', metric: null },
    ],
  },
];

// Up to a few before/after clips served from the GCS showcase prefix.
// Any <video src> works here — swap to real demo MP4 URLs when ready.
const SHOWCASE: { label: string; before: string; after: string }[] = [
  // {
  //   label: 'DNB / 128 BPM',
  //   before: 'https://storage.googleapis.com/.../showcase/track01-before.mp4',
  //   after:  'https://storage.googleapis.com/.../showcase/track01-after.mp4',
  // },
];

export default function AnalyzingScreen({ error }: { error?: string | null }) {
  return (
    <LoadingExperience
      phases={PHASES}
      title="ANALYZING"
      estimatedSeconds={45}
      error={error}
      showcase={SHOWCASE}
    />
  );
}
