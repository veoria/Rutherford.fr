import type { Metadata } from 'next';
import { Offset360Page } from '@/components/offset360-page';
import './offset360.css';

export const metadata: Metadata = {
  title: 'Offset360 | Closed-loop color for sheetfed offset',
  description:
    'Offset360 is the X-Rite + Rutherford closed-loop bundle for sheetfed offset: IntelliTrax2 scanning, MeasureColor reporting, and Rutherford ColorLoop closed-loop control on the press.',
  alternates: {
    canonical: '/offset360',
  },
  openGraph: {
    title: 'Offset360 | Closed-loop color for sheetfed offset',
    description:
      'The X-Rite + Rutherford bundle that pairs IntelliTrax2, MeasureColor and Rutherford ColorLoop to deliver closed-loop color control for sheetfed offset printing.',
    type: 'website',
    url: 'https://rutherford.fr/offset360',
    images: [{ url: '/images/Bundle Rutherford-4.jpg', alt: 'Offset360 bundle' }],
  },
};

const PRODUCT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Offset360',
  brand: { '@type': 'Brand', name: 'X-Rite' },
  description:
    'Closed-loop color bundle for sheetfed offset: IntelliTrax2 scanning, MeasureColor process control and Rutherford ColorLoop, deployed as one workflow.',
  url: 'https://rutherford.fr/offset360',
  image: 'https://rutherford.fr/images/Bundle Rutherford-4.jpg',
};

export default function Offset360Route() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_JSON_LD) }} />
      <Offset360Page />
    </>
  );
}
