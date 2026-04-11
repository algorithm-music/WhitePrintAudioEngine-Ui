import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'WhitePrint AudioEngine privacy policy. How we collect, use, and protect your data.',
  alternates: { canonical: '/legal/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-24 prose prose-invert prose-zinc prose-sm">
        <h1>Privacy Policy</h1>
        <p className="text-zinc-400">Last updated: April 11, 2026</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly: email address, name, and payment information for paid plans. We also collect usage data including API calls, processing metrics, and error logs.</p>

        <h2>2. Audio Data</h2>
        <p>Audio files submitted for processing are temporarily stored during processing and deleted within 24 hours of job completion. We do not permanently store your audio files. We do not use your audio content to train AI models.</p>

        <h2>3. How We Use Information</h2>
        <p>We use your information to provide the Service, process payments, send service communications, and improve our technology.</p>

        <h2>4. Data Sharing</h2>
        <p>We do not sell your personal information. We share data only with: payment processors (Stripe), cloud infrastructure providers (Google Cloud), and AI model providers (for deliberation, without personally identifiable information).</p>

        <h2>5. Data Security</h2>
        <p>We use industry-standard encryption for data in transit (TLS 1.3) and at rest (AES-256). API keys are hashed and cannot be retrieved after creation.</p>

        <h2>6. Your Rights</h2>
        <p>You can request access to, correction of, or deletion of your personal data at any time by contacting privacy@whiteprint.audio.</p>

        <h2>7. Cookies</h2>
        <p>See our Cookie Policy for details on how we use cookies and similar technologies.</p>

        <h2>8. Changes</h2>
        <p>We will notify you of material changes to this policy via email or prominent notice on the Service.</p>

        <h2>9. Contact</h2>
        <p>Data protection inquiries: privacy@whiteprint.audio</p>
      </div>
    </div>
  );
}
