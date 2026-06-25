import type { Metadata } from 'next';
import { RegionHubPage } from '@/components/region-hub-page';
import { REGIONS } from '@/data/regions';

const region = REGIONS['latin-america'];

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
    images: [{ url: '/images/og-home.png', width: 1200, height: 630, alt: 'Rutherford.fr' }],
  },
};

export default function RegionRoute() {
  return <RegionHubPage region={region} />;
}
