import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Code Examples — API Documentation',
  description: 'Code examples for the WhitePrint Mastering API in Python, Node.js, and cURL.',
  alternates: { canonical: '/developers/docs/examples' },
};

const examples = [
  {
    lang: 'Python',
    code: `import requests

API_KEY = "your-api-key"
BASE_URL = "https://api.whiteprint.audio"

# Full mastering pipeline
response = requests.post(
    f"{BASE_URL}/api/v1/jobs/master",
    headers={
        "X-Api-Key": API_KEY,
        "Content-Type": "application/json",
    },
    json={
        "audio_url": "https://storage.example.com/track.wav",
        "route": "full",
        "target_lufs": -14.0,
        "target_true_peak": -1.0,
    },
)

# Save mastered audio
with open("mastered.wav", "wb") as f:
    f.write(response.content)

# Access metadata from headers
analysis = response.headers.get("X-Analysis")
deliberation = response.headers.get("X-Deliberation")
print(f"Elapsed: {response.headers.get('X-Elapsed-Ms')}ms")`,
  },
  {
    lang: 'Node.js',
    code: `import fs from 'fs';

const API_KEY = 'your-api-key';
const BASE_URL = 'https://api.whiteprint.audio';

const response = await fetch(\`\${BASE_URL}/api/v1/jobs/master\`, {
  method: 'POST',
  headers: {
    'X-Api-Key': API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    audio_url: 'https://storage.example.com/track.wav',
    route: 'full',
    target_lufs: -14.0,
    target_true_peak: -1.0,
  }),
});

// Save mastered audio
const buffer = Buffer.from(await response.arrayBuffer());
fs.writeFileSync('mastered.wav', buffer);

// Access metadata
console.log('Elapsed:', response.headers.get('X-Elapsed-Ms'), 'ms');`,
  },
  {
    lang: 'Analysis Only (JSON response)',
    code: `curl -X POST https://api.whiteprint.audio/api/v1/jobs/master \\
  -H "X-Api-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "audio_url": "https://storage.example.com/track.wav",
    "route": "analyze_only"
  }'

# Response: JSON with BS.1770-4 metrics
# {
#   "track_identity": { "duration": 240.5, "sample_rate": 44100, ... },
#   "whole_track": { "lufs": -12.3, "true_peak": -0.5, "lra": 8.2, ... },
#   "sections": [...],
#   "problems": [...]
# }`,
  },
];

export default function ExamplesPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-white">Code Examples</h1>
      <p className="mt-4 text-zinc-400">
        Ready-to-use examples for integrating the WhitePrint API.
      </p>

      <div className="mt-12 space-y-8">
        {examples.map((example) => (
          <div key={example.lang} className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
              {example.lang}
            </div>
            <pre className="p-6 text-sm font-mono text-emerald-400 overflow-x-auto leading-relaxed">
              {example.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
