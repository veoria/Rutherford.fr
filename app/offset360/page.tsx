import type { Metadata } from 'next';
import { Offset360Page } from '@/components/offset360-page';
import { OFFSET360_FAQ } from '@/data/offset360-faq';
import './offset360.css';

export const metadata: Metadata = {
  title: 'Offset360 | Closed-loop color for sheetfed offset',
  description:
    'Offset360 is the X-Rite + Rutherford closed-loop bundle for sheetfed offset: IntelliTrax2 scanning, MeasureColor reporting, and Rutherford ColorLoop closed-loop control on the press.',
  keywords: ['Offset360', 'Offset 360', 'X-Rite Offset360', 'closed-loop color', 'sheetfed offset', 'IntelliTrax2', 'MeasureColor', 'ColorLoop', 'Rutherford'],
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

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: OFFSET360_FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function Offset360Route() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <Offset360Page />
    </>
  );
}
