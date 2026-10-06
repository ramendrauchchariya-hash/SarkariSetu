import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard'],
    },
    sitemap: 'https://sarkarisetu-beta.vercel.app/sitemap.xml',
  };
}
