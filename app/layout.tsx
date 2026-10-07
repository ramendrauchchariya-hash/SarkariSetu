import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { PwaRegister } from '@/components/site/pwa-register';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const siteUrl = 'https://sarkarisetu.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SarkariSetu — Government Jobs, Exams, Results & Admit Cards',
    template: '%s | SarkariSetu',
  },
  description:
    'Find government jobs, exams, results, admit cards and useful preparation tools in one simple platform built for Indian job seekers.',
  alternates: { canonical: siteUrl },
  verification: {
    google: 'HghnuaWl13tSkerNhyKd6l4iM0_sMwM5hWKtvc-oUwQ',
  },
  keywords: ['government jobs','sarkari naukri','government exams','admit card','results','admissions','India jobs','SarkariSetu'],
  authors: [{ name: 'SarkariSetu' }],
  creator: 'SarkariSetu',
  openGraph: {
    type: 'website', locale: 'en_IN', url: siteUrl, siteName: 'SarkariSetu',
    title: 'SarkariSetu — Government Jobs, Exams, Results & Admit Cards',
    description: 'Find government jobs, exams, results, admit cards and useful preparation tools in one simple platform.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SarkariSetu — Government Jobs, Exams, Results & Admit Cards',
    description: 'Find government jobs, exams, results, admit cards and useful preparation tools in one simple platform.',
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f87145' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1a' },
  ],
  width: 'device-width', initialScale: 1, maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    '@context': 'https://schema.org', '@type': 'Organization', name: 'SarkariSetu', url: siteUrl,
    description: 'Government jobs, exams, results, admit cards and useful preparation tools for Indian job seekers.',
  };
  const websiteSchema = {
    '@context': 'https://schema.org', '@type': 'WebSite', name: 'SarkariSetu', url: siteUrl,
    potentialAction: { '@type': 'SearchAction', target: siteUrl + '/jobs?q={search_term_string}', 'query-input': 'required name=search_term_string' },
  };
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-9248723520054459" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        {children}
        <PwaRegister />
        <Analytics />
      </body>
    </html>
  );
}
