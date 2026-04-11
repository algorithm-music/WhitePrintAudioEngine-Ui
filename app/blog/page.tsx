import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Audio Mastering Guides & Insights',
  description:
    'Guides on LUFS, loudness measurement, AI mastering, and audio engineering best practices.',
  alternates: { canonical: '/blog' },
};

const posts = [
  {
    slug: 'understanding-lufs-loudness-measurement',
    title: 'Understanding LUFS: The Complete Guide to Loudness Measurement',
    description:
      'Learn what LUFS is, how it differs from peak levels, and why it matters for streaming and broadcast compliance.',
    category: 'Guides',
    date: '2026-04-15',
  },
  {
    slug: 'bs1770-4-explained',
    title: 'BS.1770-4 Explained: The Standard Behind Professional Loudness',
    description:
      'A deep dive into the ITU-R BS.1770-4 standard and how it shapes modern audio measurement.',
    category: 'Technical',
    date: '2026-04-20',
  },
  {
    slug: 'ai-mastering-how-it-works',
    title: 'How AI is Changing Audio Mastering',
    description:
      'An honest look at what AI mastering can and cannot do, and how multi-LLM ensemble deliberation differs from single-model approaches.',
    category: 'Industry',
    date: '2026-04-25',
  },
  {
    slug: 'mastering-for-streaming-platforms',
    title: 'Mastering for Spotify, Apple Music, and YouTube',
    description:
      'Target loudness levels for every major streaming platform, and how to optimize your masters for each.',
    category: 'Guides',
    date: '2026-05-01',
  },
];

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold text-white">Blog</h1>
        <p className="mt-4 text-zinc-400">
          Guides, deep dives, and insights on audio mastering, loudness measurement, and AI.
        </p>

        <div className="mt-12 space-y-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group p-6 rounded-xl border border-zinc-800 hover:border-indigo-500/50 bg-zinc-950 transition-all hover:bg-zinc-900/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono text-indigo-400">{post.category}</span>
                <span className="text-xs text-zinc-600">{post.date}</span>
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">{post.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
