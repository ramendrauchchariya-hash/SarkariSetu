import type { MetadataRoute } from 'next';
import { PUBLIC_NAV } from '@/lib/navigation';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://sarkarisetu-beta.vercel.app';
  const now = new Date();

  const staticRoutes = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ];

  const routes: MetadataRoute.Sitemap = [...PUBLIC_NAV, ...staticRoutes].map((route) => ({
    url: base + route.href,
    lastModified: now,
    changeFrequency: route.href === '/' ? 'hourly' : 'daily',
    priority: route.href === '/' ? 1 : 0.7,
  }));

  const [jobs, results, admitCards] = await Promise.all([
    supabaseAdmin.from('recruitments')
      .select('slug,updated_at')
      .eq('is_published', true)
      .eq('is_archived', false),
    supabaseAdmin.from('results')
      .select('slug,updated_at')
      .eq('is_published', true)
      .is('archived_at', null),
    supabaseAdmin.from('admit_cards')
      .select('slug,updated_at')
      .eq('is_published', true)
      .is('archived_at', null),
  ]);

  return [
    ...routes,
    ...(jobs.data ?? []).map((row) => ({
      url: base + '/jobs/' + row.slug,
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...(results.data ?? []).map((row) => ({
      url: base + '/results/' + row.slug,
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    ...(admitCards.data ?? []).map((row) => ({
      url: base + '/admit-cards/' + row.slug,
      lastModified: row.updated_at ? new Date(row.updated_at) : now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ];
}
