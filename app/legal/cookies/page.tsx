import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'WhitePrint AudioEngine cookie policy.',
  alternates: { canonical: '/legal/cookies' },
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-24 prose prose-invert prose-zinc prose-sm">
        <h1>Cookie Policy</h1>
        <p className="text-zinc-400">Last updated: April 11, 2026</p>

        <h2>What Are Cookies</h2>
        <p>Cookies are small text files stored on your device when you visit a website. They help us provide a better experience.</p>

        <h2>Essential Cookies</h2>
        <p>Required for authentication and security. These cannot be disabled.</p>

        <h2>Analytics Cookies</h2>
        <p>Help us understand how visitors use the Service. You can opt out of analytics cookies.</p>

        <h2>Managing Cookies</h2>
        <p>You can control cookies through your browser settings. Note that disabling essential cookies may affect Service functionality.</p>

        <h2>Contact</h2>
        <p>Questions: privacy@whiteprint.audio</p>
      </div>
    </div>
  );
}
