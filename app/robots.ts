import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://whiteprint.audio';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/app/',
        '/api/',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
