import type { Metadata } from 'next';
import { NorthAmericaPage } from '@/components/north-america-page';
import { REGIONS } from '@/data/regions';

const region = REGIONS['canada'];

// Like /usa: North America SEO consolidates on the international domain.
const CANONICAL = `https://go.colorloop.ai/${region.slug}`;

export const metadata: Metadata = {
  title: region.metaTitle,
  description: region.metaDescription,
  keywords: region.keywords,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: region.metaTitle,
    description: region.metaDescription,
    url: CANONICAL,
    type: 'website',
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Rutherford',
  url: 'https://go.colorloop.ai/canada',
  foundingDate: '2000',
  description:
    'Closed-loop color control and CIP3/CIP4 ink presetting for offset printers in Canada. G7-anchored, retrofit to all press brands, support in English and French.',
  areaServed: ['Canada', 'United States'],
  knowsAbout: ['closed-loop color control', 'G7 calibration', 'CIP3 ink presetting', 'offset printing'],
};

export default function CanadaRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <NorthAmericaPage country="canada" />
    </>
  );
}
