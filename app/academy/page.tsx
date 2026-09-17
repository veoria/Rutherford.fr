import type { Metadata } from 'next';
import { SEO_COPY, localizedMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { AcademyPage } from '@/components/academy-page';

export function generateMetadata(): Metadata {
  return localizedMetadata({
    path: '/academy',
    title: SEO_COPY.academy.title,
    description: SEO_COPY.academy.description,
  });
}

export const dynamic = 'force-dynamic';

export default function AcademyRoute() {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();
  return <AcademyPage />;
}
