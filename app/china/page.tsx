import type { Metadata } from 'next';
import './china.css';
import { ChinaHubPage } from '@/components/china-hub-page';

const title = 'Closed-loop color control in China | Rutherford';
const description =
  'Rutherford brings closed-loop color control to offset and flexo presses in China: cut makeready waste and hold color shift after shift, on the X-Rite PANTONE measurement you already trust. Request a free console validation.';

export const metadata: Metadata = {
  title,
  description,
  // Region landing is English-only for now; self-canonical, no hreflang variants yet.
  alternates: { canonical: 'https://rutherford.fr/china' },
  openGraph: {
    title,
    description,
    url: 'https://rutherford.fr/china',
    type: 'website',
    images: [{ url: '/images/og-home.png', width: 1200, height: 630, alt: 'Rutherford.fr' }],
  },
};

export default function ChinaRoute() {
  return <ChinaHubPage />;
}
