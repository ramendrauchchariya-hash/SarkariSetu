import type { MetadataRoute } from 'next';
import { PUBLIC_NAV, AUTHENTICATED_NAV, ADMIN_NAV } from '@/lib/navigation';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://sarkarisetu.in';
  const now = new Date();

  const routes = [
    ...PUBLIC_NAV,
    ...AUTHENTICATED_NAV,
    ...ADMIN_NAV,
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Disclaimer', href: '/disclaimer' },
    { label: 'Sign In', href: '/auth/login' },
    { label: 'Register', href: '/auth/register' },
  ];

  return routes.map((r) => ({
    url: `${base}${r.href}`,
    lastModified: now,
    changeFrequency: r.href === '/' ? 'hourly' : 'daily',
    priority: r.href === '/' ? 1 : 0.7,
  }));
}
