import type { Metadata } from 'next';
import { brandConsoleSeo, localizedMetadata } from '@/lib/seo';
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
  const seo = brandConsoleSeo(brand.name, brand.consoles);
  return localizedMetadata({
    path: `/console-validation/${brand.slug}`,
    title: seo.title,
    description: seo.description,
  });
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
        faq={brand.faq}
      />
    </>
  );
}
