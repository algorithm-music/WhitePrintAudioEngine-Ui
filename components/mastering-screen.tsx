'use client';

import LoadingExperience, { Phase } from './loading-experience';

const PHASES: Phase[] = [
  {
    name: 'INGEST',
    steps: [
      { text: 'Fetching mastered-by-consensus parameter set', metric: 'TRIVIUM' },
      { text: 'Loading source PCM into 64-bit float workspace', metric: null },
      { text: 'Decoding channel layout → mid/side matrix', metric: null },
    ],
  },
  {
    name: 'PRE-CLEAN',
    steps: [
      { text: 'DC offset removal (HP@5Hz)', metric: null },
      { text: 'Sub-bass rumble filter (HP@30Hz)', metric: null },
      { text: 'Input gain staging to -18 LUFS', metric: null },
    ],
  },
  {
    name: 'TONAL BALANCE',
    steps: [
      { text: 'Parametric EQ — corrective notches', metric: null },
      { text: 'Dynamic EQ — adaptive de-harshing', metric: '2-6kHz' },
      { text: 'Tilt correction against genre reference curve', metric: null },
    ],
  },
  {
    name: 'DYNAMICS',
    steps: [
      { text: 'Multiband compressor — 4-band split', metric: '80 / 300 / 4k' },
      { text: 'Bus glue compression (2.5:1, slow attack)', metric: null },
      { text: 'Transient shaper — preserve punch', metric: null },
    ],
  },
  {
    name: 'COLOR',
    steps: [
      { text: 'Transformer saturation (even harmonics)', metric: null },
      { text: 'Triode-tube modelling (odd harmonics)', metric: null },
      { text: 'Tape emulation — head bump + wow/flutter', metric: null },
    ],
  },
  {
    name: 'SPATIAL',
    steps: [
      { text: 'M/S width shaping (sub mono, air wide)', metric: null },
      { text: 'Frequency-dependent stereo width', metric: '<200Hz mono, >4k wide' },
      { text: 'Mono-compatibility check', metric: null },
    ],
  },
  {
    name: 'CEILING',
    steps: [
      { text: 'Soft clipper — 4× oversampled', metric: null },
      { text: 'True-peak limiter — 8× oversampled, 5ms look-ahead', metric: null },
      { text: 'Ceiling enforcement at target dBTP', metric: null },
    ],
  },
  {
    name: 'CONVERGE',
    steps: [
      { text: 'Measuring integrated LUFS vs target', metric: null },
      { text: 'Newton-method gain correction (0.85 learning rate)', metric: null },
      { text: 'Loop 1 / 5 — adjusting for compressor gain reduction', metric: null },
      { text: 'Loop 2 / 5 — refining true-peak headroom', metric: null },
      { text: 'Loop 3 / 5 — converging on LUFS target', metric: null },
      { text: 'Loop 4 / 5 — final polish', metric: null },
      { text: 'Loop 5 / 5 — self-correction complete', metric: null },
    ],
  },
  {
    name: 'DELIVER',
    steps: [
      { text: 'TPDF dither → 24-bit integer', metric: null },
      { text: 'Writing PCM_24 WAV to GCSFuse', metric: null },
      { text: 'Signing V4 download URL', metric: null },
    ],
  },
];

const SHOWCASE: { label: string; before: string; after: string }[] = [
  // Add { label, before: '<mp4 URL>', after: '<mp4 URL>' } to surface real
  // before/after reels here while the 14-stage chain is converging.
];

export default function MasteringScreen({ error }: { error?: string | null }) {
  return (
    <LoadingExperience
      phases={PHASES}
      title="MASTERING"
      estimatedSeconds={260}
      error={error}
      showcase={SHOWCASE}
    />
  );
}
