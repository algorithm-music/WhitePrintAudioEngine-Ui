'use client';

import LoadingExperience, { Phase } from './loading-experience';

const PHASES: Phase[] = [
  {
    name: 'DISPATCH',
    steps: [
      { text: 'Compiling formplan-guided prompt from analysis JSON', metric: null },
      { text: 'Opening parallel channels to 3 providers', metric: 'OpenAI · Anthropic · Vertex' },
      { text: 'Signing per-agent API keys (rotating key pool)', metric: null },
    ],
  },
  {
    name: 'GRAMMATICA',
    steps: [
      { text: 'GRAMMATICA (Engineer) receiving prompt', metric: 'gpt-5.x' },
      { text: 'Computing ITU-R BS.1770-4 compliance path', metric: 'PHYSICS AXIS' },
      { text: 'Proposing gain staging / compressor ratios / TP ceiling', metric: null },
      { text: 'Emitting 200+ char rationale + confidence', metric: null },
    ],
  },
  {
    name: 'LOGICA',
    steps: [
      { text: 'LOGICA (Structure Guard) receiving prompt', metric: 'claude-opus-4.x' },
      { text: 'Reading physical_sections + macro-form narrative', metric: 'STRUCTURAL AXIS' },
      { text: 'Writing section_overrides for dynamic automation', metric: null },
      { text: 'Resolving contradictions between sections', metric: null },
    ],
  },
  {
    name: 'RHETORICA',
    steps: [
      { text: 'RHETORICA (Form Analyst) receiving prompt', metric: 'gemini-3.x pro' },
      { text: 'Advocating warmth, width, and human impact', metric: 'AESTHETIC AXIS' },
      { text: 'Proposing saturation / stereo / parallel drive', metric: null },
      { text: 'Pushing back against mathematical over-processing', metric: null },
    ],
  },
  {
    name: 'ALIGNMENT',
    steps: [
      { text: 'Decomposing agreement per category', metric: 'dynamics · tone · width' },
      { text: 'Detecting conflict on "Dynamic Range"', metric: null },
      { text: 'LOGICA mediating between physics and aesthetics', metric: null },
      { text: 'Computing global alignment %', metric: null },
    ],
  },
  {
    name: 'MERGE',
    steps: [
      { text: 'Clamping every proposed param into its [min,max]', metric: null },
      { text: 'Dropping NaN/Inf values back to schema defaults', metric: null },
      { text: 'Weighted-median merge across 3 opinions', metric: 'validity-aware v2' },
      { text: 'Union-merging section_overrides timeline', metric: null },
    ],
  },
  {
    name: 'VALIDATE',
    steps: [
      { text: 'Verifying adopted_params satisfy target LUFS', metric: null },
      { text: 'Verifying adopted_params satisfy target true-peak', metric: null },
      { text: 'Running veto rules (no clipping, no mono fold)', metric: null },
    ],
  },
  {
    name: 'ADOPT',
    steps: [
      { text: 'Assembling Trivium synthesis summary', metric: 'Physics × Structure × Aesthetics' },
      { text: 'Signing run_id (uuid5 of prompt hash)', metric: null },
      { text: 'Returning adopted_params to Concertmaster', metric: null },
    ],
  },
];

export default function DeliberatingScreen({ error }: { error?: string | null }) {
  return (
    <LoadingExperience
      phases={PHASES}
      title="DELIBERATING"
      estimatedSeconds={35}
      error={error}
    />
  );
}
