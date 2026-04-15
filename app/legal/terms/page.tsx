import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'WhitePrint AudioEngine terms of service.',
  alternates: { canonical: '/legal/terms' },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-24 prose prose-invert prose-zinc prose-sm">
        <h1>Terms of Service</h1>
        <p className="text-zinc-400">Last updated: April 11, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using WhitePrint AudioEngine (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service.</p>

        <h2>2. Description of Service</h2>
        <p>WhitePrint provides AI-powered audio analysis and mastering via web interface and API. The Service processes audio files submitted by users and returns analysis data and/or mastered audio files.</p>

        <h2>3. User Accounts</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and API keys. You are responsible for all activities that occur under your account.</p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to use the Service to process audio content that you do not have the right to process. See our Acceptable Use Policy for details.</p>

        <h2>5. Intellectual Property</h2>
        <p>You retain all rights to your audio content. WhitePrint does not claim ownership of any audio files you submit. We do not use your audio content to train AI models.</p>

        <h2>6. API Usage</h2>
        <p>API access is subject to rate limits and usage quotas based on your subscription plan. Automated or programmatic access must use the official API endpoints.</p>

        <h2>7. Payment</h2>
        <p>Paid plans are billed monthly or annually. Refunds are available within 14 days of purchase if no API calls have been made.</p>

        <h2>8. Limitation of Liability</h2>
        <p>The Service is provided &ldquo;as is.&rdquo; WhitePrint shall not be liable for any indirect, incidental, or consequential damages.</p>

        <h2>9. Changes to Terms</h2>
        <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance.</p>

        <h2>10. Contact</h2>
        <p>Questions about these terms? Contact us at legal@whiteprint.audio.</p>
      </div>
    </div>
  );
}
