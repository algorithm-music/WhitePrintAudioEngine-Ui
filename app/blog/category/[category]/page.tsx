import Link from 'next/link';
import type { Metadata } from 'next';

const allPosts = [
  { slug: 'understanding-lufs-loudness-measurement', title: 'Understanding LUFS: The Complete Guide to Loudness Measurement', description: 'Learn what LUFS is, how it differs from peak levels, and why it matters.', category: 'Guides', date: '2026-04-15' },
  { slug: 'bs1770-4-explained', title: 'BS.1770-4 Explained: The Standard Behind Professional Loudness', description: 'A deep dive into the ITU-R BS.1770-4 standard.', category: 'Technical', date: '2026-04-20' },
  { slug: 'ai-mastering-how-it-works', title: 'How AI is Changing Audio Mastering', description: 'An honest look at AI mastering and multi-LLM deliberation.', category: 'Industry', date: '2026-04-25' },
  { slug: 'mastering-for-streaming-platforms', title: 'Mastering for Spotify, Apple Music, and YouTube', description: 'Target loudness levels for streaming platforms.', category: 'Guides', date: '2026-05-01' },
];

const categories = ['Guides', 'Technical', 'Industry'];

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.toLowerCase() }));
}

export function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  return params.then(({ category }) => {
    const title = category.charAt(0).toUpperCase() + category.slice(1);
    return {
      title: `${title} — Blog`,
      description: `${title} articles on audio mastering, loudness measurement, and AI.`,
      alternates: { canonical: `/blog/category/${category}` },
    };
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const title = category.charAt(0).toUpperCase() + category.slice(1);
  const filtered = allPosts.filter((p) => p.category.toLowerCase() === category.toLowerCase());

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <Link href="/blog" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          &larr; All Posts
        </Link>
        <h1 className="mt-6 text-4xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-zinc-400">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</p>

        <div className="mt-12 space-y-8">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group p-6 rounded-xl border border-zinc-800 hover:border-indigo-500/50 bg-zinc-950 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
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
