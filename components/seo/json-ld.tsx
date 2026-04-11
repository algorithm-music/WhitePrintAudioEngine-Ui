type JsonLdProps = {
  data: Record<string, unknown>;
};

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebApplicationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'WhitePrint AudioEngine',
        description:
          'AI-powered audio mastering with BS.1770-4 loudness analysis and multi-LLM ensemble deliberation.',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: '0',
          highPrice: '99',
          offerCount: '3',
        },
        featureList: [
          'BS.1770-4 compliant loudness analysis',
          'Multi-LLM ensemble mastering deliberation',
          'Automated DSP audio mastering',
          'Cloud URL audio input',
          'RESTful mastering API',
        ],
      }}
    />
  );
}

export function OrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://whiteprint.audio';
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'WhitePrint',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
      }}
    />
  );
}

export function BlogPostJsonLd({
  title,
  description,
  datePublished,
  dateModified,
  slug,
}: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  slug: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://whiteprint.audio';
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        datePublished,
        dateModified: dateModified || datePublished,
        url: `${baseUrl}/blog/${slug}`,
        author: {
          '@type': 'Organization',
          name: 'WhitePrint',
        },
        publisher: {
          '@type': 'Organization',
          name: 'WhitePrint',
          logo: { '@type': 'ImageObject', url: `${baseUrl}/logo.png` },
        },
      }}
    />
  );
}
