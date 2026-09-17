import type { Metadata } from 'next';
import { SEO_COPY, localizedMetadata } from '@/lib/seo';
import { RoiPage } from '@/components/roi-page';

export function generateMetadata(): Metadata {
  return localizedMetadata({
    path: '/roi',
    title: SEO_COPY.roi.title,
    description: SEO_COPY.roi.description,
    image: { url: '/images/og-roi.png', alt: 'Rutherford closed-loop color control' },
  });
}

export default function RoiRoute() {
  return <RoiPage />;
}
