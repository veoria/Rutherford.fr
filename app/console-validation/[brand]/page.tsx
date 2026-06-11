import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConsoleValidationPage } from '@/components/console-validation-page';
import { PRESS_BRANDS_PAGES, getPressBrand } from '@/data/press-brands';

type RouteParams = { brand: string };

export function generateStaticParams(): RouteParams[] {
  return PRESS_BRANDS_PAGES.map((b) => ({ brand: b.slug }));
}

export function generateMetadata({ params }: { params: RouteParams }): Metadata {
  const brand = getPressBrand(params.brand);
  if (!brand) return { title: 'Console validation | Rutherford.fr' };
  return {
    title: `${brand.name} console compatibility, closed-loop color control | Rutherford.fr`,
    description: `Check for free whether your ${brand.name} press (${brand.consoles}) is eligible for Rutherford closed-loop color. A few photos, two minutes, answer within one business day.`,
    alternates: { canonical: `/console-validation/${brand.slug}` },
    openGraph: {
      title: `${brand.name} console compatibility, closed-loop color control`,
      description: `Free eligibility check for ${brand.name} ${brand.presses}. Stop losing money on makeready.`,
      url: `https://rutherford.fr/console-validation/${brand.slug}`,
      type: 'website',
    },
  };
}

export default function BrandConsoleValidationRoute({ params }: { params: RouteParams }) {
  const brand = getPressBrand(params.brand);
  if (!brand) notFound();

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: brand.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Rutherford.fr', item: 'https://rutherford.fr/' },
      { '@type': 'ListItem', position: 2, name: 'Console validation', item: 'https://rutherford.fr/console-validation' },
      { '@type': 'ListItem', position: 3, name: brand.name, item: `https://rutherford.fr/console-validation/${brand.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ConsoleValidationPage
        brand={{
          name: brand.name,
          consoles: brand.consoles,
          presses: brand.presses,
          machinePlaceholder: brand.machinePlaceholder,
        }}
      />
    </>
  );
}
