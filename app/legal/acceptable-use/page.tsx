import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy',
  description: 'WhitePrint AudioEngine acceptable use policy for audio content processing.',
  alternates: { canonical: '/legal/acceptable-use' },
};

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-24 prose prose-invert prose-zinc prose-sm">
        <h1>Acceptable Use Policy</h1>
        <p className="text-zinc-400">Last updated: April 11, 2026</p>

        <h2>Permitted Use</h2>
        <p>You may use WhitePrint to process audio content that you own or have authorization to process, including music, podcasts, voice-overs, and other audio media.</p>

        <h2>Prohibited Use</h2>
        <ul>
          <li>Processing audio you do not have rights to (pirated content)</li>
          <li>Using the Service for illegal purposes</li>
          <li>Attempting to reverse-engineer the mastering algorithms</li>
          <li>Reselling API access without authorization</li>
          <li>Automated scraping or abuse of the Service</li>
          <li>Circumventing rate limits or usage quotas</li>
        </ul>

        <h2>Enforcement</h2>
        <p>Violations may result in account suspension or termination. We reserve the right to refuse service at our discretion.</p>

        <h2>Reporting</h2>
        <p>Report policy violations: abuse@whiteprint.audio</p>
      </div>
    </div>
  );
}
