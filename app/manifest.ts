import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SarkariSetu — Government Jobs & Exams',
    short_name: 'SarkariSetu',
    description: 'Government jobs, exams, results, admit cards and useful job tools.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f87145',
    orientation: 'portrait',
    lang: 'en-IN',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}