import type { Metadata } from 'next';
import InteractiveCurl from '@/components/developers/interactive-curl';

export const metadata: Metadata = {
  title: 'Quickstart — API Documentation',
  description: 'Get started with the WhitePrint Mastering API in minutes. Authentication, first request, and response handling.',
  alternates: { canonical: '/developers/docs/quickstart' },
};

export default function QuickstartPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-white">Quickstart</h1>
      <p className="mt-4 text-zinc-400 leading-relaxed">
        Get your first mastered track in under 5 minutes.
      </p>

      <section className="mt-12 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">1. Get an API Key</h2>
          <p className="text-sm text-zinc-400">
            Sign up for a WhitePrint account and navigate to{' '}
            <strong className="text-zinc-200">Settings &rarr; API Keys</strong> to generate your key.
            Include it as the <code className="text-indigo-400">Authorization: Bearer wpk_...</code> header in all requests.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">2. Prepare Your Audio</h2>
          <p className="text-sm text-zinc-400">
            Upload your audio file to any cloud storage (Google Drive, Dropbox, OneDrive, S3, or GCS)
            and get a direct download URL. The URL must return the raw audio file.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">3. Send Your First Request</h2>
          <InteractiveCurl />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">4. Handle the Response</h2>
          <p className="text-sm text-zinc-400 mb-4">
            The response depends on the route you chose:
          </p>
          <div className="space-y-3">
            {[
              { route: 'full / dsp_only', type: 'audio/wav', desc: 'Binary WAV file. Check X-Analysis and X-Deliberation headers for metadata.' },
              { route: 'analyze_only', type: 'application/json', desc: 'JSON with full BS.1770-4 metrics.' },
              { route: 'deliberation_only', type: 'application/json', desc: 'JSON with analysis + AI mastering parameters.' },
            ].map((item) => (
              <div key={item.route} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/30">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs text-indigo-400">{item.route}</span>
                  <span className="text-xs text-zinc-600">&rarr; {item.type}</span>
                </div>
                <p className="text-xs text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">4. Polling for Results</h2>
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Check the status of your mastering job by polling the jobs endpoint:
            </p>
            <pre className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-sm text-emerald-400 overflow-x-auto whitespace-pre-wrap">
              {`curl -X GET "https://aimastering.tech/api/jobs/<job_id>?object=<output_object>" \\
  -H "Authorization: Bearer wpk_YOUR_API_KEY"`}
            </pre>
            <p className="text-sm text-zinc-400">
              When the status becomes <code className="text-indigo-400">completed</code>, you will receive a download URL and processing metrics.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">5. Response Headers</h2>
          <p className="text-sm text-zinc-400 mb-4">
            All routes return useful metadata in response headers:
          </p>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 font-mono text-sm space-y-1">
            <div><span className="text-zinc-500">X-Route:</span> <span className="text-zinc-300">full</span></div>
            <div><span className="text-zinc-500">X-Elapsed-Ms:</span> <span className="text-zinc-300">12345</span></div>
            <div><span className="text-zinc-500">X-Analysis:</span> <span className="text-zinc-300">{'{...}'}</span></div>
            <div><span className="text-zinc-500">X-Deliberation:</span> <span className="text-zinc-300">{'{...}'}</span></div>
            <div><span className="text-zinc-500">X-Metrics:</span> <span className="text-zinc-300">{'{...}'}</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
