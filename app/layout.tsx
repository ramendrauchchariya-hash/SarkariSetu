import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { AdminSessionSync } from '@/components/admin/admin-session-sync';

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
  keywords: [
    'government jobs',
    'sarkari naukri',
    'government exams',
    'admit card',
    'answer key',
    'results',
    'admissions',
    'India jobs',
    'SarkariSetu',
  ],
  authors: [{ name: 'SarkariSetu' }],
  creator: 'SarkariSetu',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'SarkariSetu',
    title: 'SarkariSetu — Government Jobs, Exams, Results & Admit Cards',
    description:
      'Find government jobs, exams, results, admit cards and useful preparation tools in one simple platform.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SarkariSetu — Government Jobs, Exams, Results & Admit Cards',
    description:
      'Find government jobs, exams, results, admit cards and useful preparation tools in one simple platform.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f87145' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <AdminSessionSync />
        {children}
      </body>
    </html>
  );
}
