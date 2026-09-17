import type { Metadata } from 'next';
import { SEO_COPY, localizedMetadata } from '@/lib/seo';
import { SupportPage } from '@/components/support-page';

export function generateMetadata(): Metadata {
  return localizedMetadata({
    path: '/support',
    title: SEO_COPY.support.title,
    description: SEO_COPY.support.description,
  });
}

export default function SupportRoute() {
  return <SupportPage />;
}
