import type { Metadata } from 'next';
import { RoiPage } from '@/components/roi-page';

const title = 'ROI calculator | Rutherford.fr';
const description =
  'Estimate how much ColorLoop can save your pressroom: makeready waste, makeready time, ink, paper and energy — calculated from your own production figures.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/roi' },
  openGraph: {
    title,
    description,
    url: 'https://rutherford.fr/roi',
    siteName: 'Rutherford.fr',
    images: [
      {
        url: '/images/Bundle Rutherford-4.jpg',
        width: 1200,
        height: 630,
        alt: 'Rutherford closed-loop color control',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/images/Bundle Rutherford-4.jpg'],
  },
};

export default function RoiRoute() {
  return <RoiPage />;
}
