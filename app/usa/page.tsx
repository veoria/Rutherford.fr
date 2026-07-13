import type { Metadata } from 'next';
import { NorthAmericaPage } from '@/components/north-america-page';
import { REGIONS } from '@/data/regions';

const region = REGIONS['usa'];

export const metadata: Metadata = {
  title: region.metaTitle,
  description: region.metaDescription,
  keywords: region.keywords,
  alternates: { canonical: `https://rutherford.fr/${region.slug}` },
  openGraph: {
    title: region.metaTitle,
    description: region.metaDescription,
    url: `https://rutherford.fr/${region.slug}`,
    type: 'website',
  },
};

// LocalBusiness-flavored Organization markup anchoring the US pedigree
// (Rutherford Graphic Products, est. 2000) for US search.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Rutherford',
  url: 'https://rutherford.fr/usa',
  foundingDate: '2000',
  description:
    'Closed-loop color control and CIP3/CIP4 ink presetting for offset printers in the United States. G7-anchored, retrofit to all press brands, working with X-Rite and MeasureColor measurement.',
  areaServed: ['United States', 'Canada'],
  knowsAbout: ['closed-loop color control', 'G7 calibration', 'CIP3 ink presetting', 'offset printing'],
};

export default function UsaRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <NorthAmericaPage country="usa" />
    </>
  );
}
