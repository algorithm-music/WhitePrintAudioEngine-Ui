import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://whiteprint.audio';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'WhitePrint AudioEngine — AI-Powered Audio Mastering & Analysis',
    template: '%s | WhitePrint AudioEngine',
  },
  description:
    'Professional AI-powered audio mastering with BS.1770-4 loudness analysis. Multi-LLM ensemble deliberation engine with automated DSP processing for music producers and audio engineers.',
  keywords: [
    'AI audio mastering',
    'loudness analysis',
    'LUFS measurement',
    'online mastering',
    'BS.1770-4',
    'audio mastering API',
    'true peak',
    'automated mastering',
  ],
  authors: [{ name: 'WhitePrint' }],
  creator: 'WhitePrint',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'WhitePrint AudioEngine',
    title: 'WhitePrint AudioEngine — AI-Powered Audio Mastering & Analysis',
    description:
      'Professional AI-powered audio mastering with BS.1770-4 loudness analysis and multi-LLM ensemble deliberation.',
    images: [
      {
        url: '/api/og?title=WhitePrint+AudioEngine',
        width: 1200,
        height: 630,
        alt: 'WhitePrint AudioEngine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhitePrint AudioEngine',
    description:
      'AI-powered audio mastering with BS.1770-4 analysis and multi-LLM deliberation.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
