import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { LocaleProvider } from '@/lib/locale-context';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'WhitePrintAudioEngine — The Open-Box AI Mastering Engine',
  description: '3社のAIが独立審査し、28パラメータの根拠を全て公開する、世界初のオープンボックスAIマスタリングAPI。$1.50/曲。ストレージゼロ。',
  keywords: 'AI mastering, open box, transparent mastering, BS.1770-4, LUFS, True Peak, REST API, TRIVIUM',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ja" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
