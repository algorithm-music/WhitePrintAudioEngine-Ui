import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostJsonLd } from '@/components/seo/json-ld';

type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  content: string;
};

const posts: BlogPost[] = [
  {
    slug: 'understanding-lufs-loudness-measurement',
    title: 'Understanding LUFS: The Complete Guide to Loudness Measurement',
    description:
      'Learn what LUFS is, how it differs from peak levels, and why it matters for streaming and broadcast compliance.',
    category: 'Guides',
    date: '2026-04-15',
    content: `LUFS (Loudness Units relative to Full Scale) is the international standard for measuring perceived loudness in audio. Unlike peak meters that measure instantaneous signal level, LUFS accounts for how humans actually hear sound.

## Why LUFS Matters

Every major streaming platform uses LUFS-based loudness normalization. If your master is too loud, it gets turned down. If it's too quiet, it gets turned up (or doesn't, depending on the platform). Understanding LUFS helps you make informed decisions about your mastering targets.

## Integrated vs Short-term vs Momentary

There are three time scales of LUFS measurement:

- **Integrated LUFS**: The average loudness across the entire track. This is what streaming platforms use for normalization.
- **Short-term LUFS**: Measured over a 3-second sliding window. Useful for monitoring loudness variation.
- **Momentary LUFS**: Measured over a 400ms window. Shows instantaneous perceived loudness.

## Platform Targets

Different platforms normalize to different levels. WhitePrint AudioEngine measures all three time scales and helps you optimize for your target platform.

## How WhitePrint Measures LUFS

WhitePrint uses BS.1770-4 compliant measurement, the same standard used by broadcast organizations worldwide. Our analysis extracts integrated LUFS with gating as specified by the standard, ensuring your measurements match what streaming platforms will see.`,
  },
  {
    slug: 'bs1770-4-explained',
    title: 'BS.1770-4 Explained: The Standard Behind Professional Loudness',
    description:
      'A deep dive into the ITU-R BS.1770-4 standard and how it shapes modern audio measurement.',
    category: 'Technical',
    date: '2026-04-20',
    content: `ITU-R BS.1770-4 is the international standard for measuring audio programme loudness. Published by the International Telecommunication Union, it defines the algorithms used to calculate integrated loudness, true peak level, and loudness range.

## What BS.1770-4 Specifies

The standard defines a specific signal chain for loudness measurement:

1. **K-frequency weighting**: A two-stage filter that approximates the acoustic effects of the human head.
2. **Mean square calculation**: Per-channel energy measurement.
3. **Channel-weighted summation**: Different weights for surround channels.
4. **Gating**: A two-pass gating system that excludes silence and quiet passages.

## Why It Matters for Mastering

Using a non-standard loudness measurement can give you misleading results. Your DAW's built-in loudness meter may or may not conform to BS.1770-4. WhitePrint's analysis engine implements the standard precisely, giving you measurements you can trust.

## True Peak vs Sample Peak

BS.1770-4 also specifies true peak measurement, which detects inter-sample peaks that can cause distortion in D/A conversion. This is different from sample peak, which only looks at discrete sample values.`,
  },
  {
    slug: 'ai-mastering-how-it-works',
    title: 'How AI is Changing Audio Mastering',
    description:
      'An honest look at what AI mastering can and cannot do, and how multi-LLM ensemble deliberation differs from single-model approaches.',
    category: 'Industry',
    date: '2026-04-25',
    content: `AI mastering has matured significantly in recent years, but there's still a lot of confusion about what it actually does and how it compares to human mastering engineers.

## What AI Mastering Can Do

AI excels at analyzing audio metrics, identifying problems, and applying consistent processing. It can quickly evaluate loudness, spectral balance, dynamics, and stereo image, then apply appropriate corrections.

## The Black Box Problem

Most AI mastering services are black boxes. You upload a track, wait, and receive a result with no insight into what was done or why. This makes it impossible to learn from the process or make informed adjustments.

## WhitePrint's Approach: Multi-LLM Deliberation

WhitePrint takes a different approach. Instead of a single opaque model, we use three independent AI models that each analyze your track's metrics and recommend mastering parameters. You see every recommendation and the reasoning behind each decision.

This ensemble approach reduces individual model bias and increases reliability through consensus. Where the models agree, you can be confident. Where they disagree, you see the alternatives.

## When to Use AI vs Human Mastering

AI mastering works well for consistent, standards-compliant masters and for situations where turnaround time matters. Human mastering engineers still excel at artistic interpretation and handling unusual audio material.`,
  },
  {
    slug: 'mastering-for-streaming-platforms',
    title: 'Mastering for Spotify, Apple Music, and YouTube',
    description:
      'Target loudness levels for every major streaming platform, and how to optimize your masters for each.',
    category: 'Guides',
    date: '2026-05-01',
    content: `Each streaming platform handles loudness normalization differently. Understanding these differences helps you deliver the best possible listening experience on every platform.

## Platform Loudness Targets

Here are the current normalization targets for major platforms:

- **Spotify**: -14 LUFS (with normalization on by default)
- **Apple Music**: -16 LUFS (Sound Check)
- **YouTube**: -14 LUFS
- **Amazon Music**: -14 LUFS
- **Tidal**: -14 LUFS

## What Happens When Your Master is Too Loud

If your integrated loudness exceeds the platform's target, the platform will turn it down. This means all your careful compression and limiting work is effectively undone — your track ends up quieter with less dynamic range than if you had targeted the right level.

## True Peak Considerations

All major platforms recommend a true peak no higher than -1.0 dBTP. This headroom prevents clipping during lossy encoding (MP3, AAC, Ogg Vorbis). WhitePrint's default target of -1.0 dBTP is safe for all platforms.

## Using WhitePrint for Platform Optimization

WhitePrint lets you set your target LUFS and true peak before mastering. The AI deliberation takes your targets into account when recommending parameters, ensuring your master is optimized for your chosen platform.`,
  },
];

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const post = posts.find((p) => p.slug === slug);
    if (!post) return { title: 'Post Not Found' };
    return {
      title: post.title,
      description: post.description,
      alternates: { canonical: `/blog/${post.slug}` },
      openGraph: {
        type: 'article',
        title: post.title,
        description: post.description,
        publishedTime: post.date,
      },
    };
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <BlogPostJsonLd
        title={post.title}
        description={post.description}
        datePublished={post.date}
        slug={post.slug}
      />
      <article className="max-w-3xl mx-auto px-6 py-24">
        <Link href="/blog" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          &larr; All Posts
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <span className="text-xs font-mono text-indigo-400">{post.category}</span>
          <span className="text-xs text-zinc-600">{post.date}</span>
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold text-white leading-tight">{post.title}</h1>
        <p className="mt-4 text-lg text-zinc-400">{post.description}</p>

        <div className="mt-12 prose prose-invert prose-zinc prose-sm max-w-none">
          {post.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('## ')) {
              return <h2 key={i} className="text-xl font-bold text-white mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
            }
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n').filter(Boolean);
              return (
                <ul key={i} className="space-y-2 my-4">
                  {items.map((item, j) => (
                    <li key={j} className="text-zinc-400 text-sm">
                      {item.replace('- ', '')}
                    </li>
                  ))}
                </ul>
              );
            }
            if (paragraph.startsWith('1. ')) {
              const items = paragraph.split('\n').filter(Boolean);
              return (
                <ol key={i} className="space-y-2 my-4 list-decimal list-inside">
                  {items.map((item, j) => (
                    <li key={j} className="text-zinc-400 text-sm">
                      {item.replace(/^\d+\.\s+/, '')}
                    </li>
                  ))}
                </ol>
              );
            }
            return <p key={i} className="text-zinc-400 leading-relaxed my-4">{paragraph}</p>;
          })}
        </div>

        <div className="mt-16 p-8 rounded-xl border border-zinc-800 bg-zinc-950 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Try WhitePrint AudioEngine</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Experience BS.1770-4 analysis and AI mastering on your own tracks.
          </p>
          <Link
            href="/app"
            className="inline-flex px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Try It Now — Free
          </Link>
        </div>
      </article>
    </div>
  );
}
