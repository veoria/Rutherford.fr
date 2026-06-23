import type { Metadata } from 'next';
import { SupportPage } from '@/components/support-page';

const ogTitle = 'Support | Rutherford.fr';
const ogDescription = 'Tickets, documentation and live help, all in one place.';

export const metadata: Metadata = {
  title: ogTitle,
  description: ogDescription,
  alternates: { canonical: '/support' },
  openGraph: {
    title: ogTitle,
    description: ogDescription,
    url: 'https://rutherford.fr/support',
    siteName: 'Rutherford.fr',
    images: [{ url: '/images/og-support.png', width: 1200, height: 630, alt: 'Color drifting? Talk to a Rutherford expert.' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: ogTitle,
    description: ogDescription,
    images: ['/images/og-support.png'],
  },
};

export default function SupportRoute() {
  return <SupportPage />;
}
