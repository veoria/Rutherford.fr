import type { Metadata } from 'next';
import { brandConsoleSeo, localeUrl, localizedMetadata, requestLocale } from '@/lib/seo';
import type { Locale } from '@/components/language-provider';
import { notFound } from 'next/navigation';
import { ConsoleValidationPage } from '@/components/console-validation-page';
import { PRESS_BRANDS_PAGES, getPressBrand, localizePressBrand } from '@/data/press-brands';

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

// Breadcrumb label of the parent page, per locale.
const BREADCRUMB_PARENT: Record<Locale, string> = {
  en: 'Console validation',
  fr: 'Validation console',
  de: 'Konsolenvalidierung',
  it: 'Validazione console',
  es: 'Validación de consola',
  pt: 'Validação de consola',
};

export default function BrandConsoleValidationRoute({ params }: { params: RouteParams }) {
  const source = getPressBrand(params.brand);
  if (!source) notFound();

  const locale = requestLocale();
  const brand = localizePressBrand(source, locale);

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
      { '@type': 'ListItem', position: 1, name: 'Rutherford.fr', item: localeUrl('/', locale) },
      { '@type': 'ListItem', position: 2, name: BREADCRUMB_PARENT[locale], item: localeUrl('/console-validation', locale) },
      { '@type': 'ListItem', position: 3, name: brand.name, item: localeUrl(`/console-validation/${brand.slug}`, locale) },
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
