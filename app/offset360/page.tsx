import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Offset360Page } from '@/components/offset360-page';
import type { Locale } from '@/components/language-provider';
import { OFFSET360_COPY } from '@/data/offset360-copy';
import { OFFSET360_FAQ_BY_LOCALE } from '@/data/offset360-faq';
import './offset360.css';

const BASE = 'https://rutherford.fr';

function requestLocale(): Locale {
  const locale = (headers().get('x-locale') as Locale) || 'en';
  return OFFSET360_COPY[locale] ? locale : 'en';
}

type SearchParams = { [key: string]: string | string[] | undefined };

// ColorLoop-first variant on the colorloop.ai domain (X-Rite kept discreet,
// per X-Rite's request); ?colorloop=1 previews it on any host.
function isColorloopFocus(searchParams?: SearchParams): boolean {
  if (searchParams?.colorloop !== undefined) return searchParams.colorloop !== '0';
  const host = headers().get('host') ?? '';
  return host.includes('colorloop.');
}

function localizedUrl(locale: Locale): string {
  return locale === 'en' ? `${BASE}/offset360` : `${BASE}/${locale}/offset360`;
}

// Localized title/description per served locale; canonical + hreflang are
// inherited from the root layout (canonical base: rutherford.fr/offset360).
export async function generateMetadata({ searchParams }: { searchParams?: SearchParams }): Promise<Metadata> {
  const locale = requestLocale();
  const t = OFFSET360_COPY[locale];
  const title = isColorloopFocus(searchParams) ? t.colorloop.metaTitle : t.metaTitle;
  return {
    title,
    description: t.metaDescription,
    keywords: ['Offset360', 'Offset 360', 'X-Rite Offset360', 'closed-loop color', 'sheetfed offset', 'IntelliTrax2', 'MeasureColor', 'ColorLoop', 'Rutherford'],
    openGraph: {
      title,
      description: t.metaDescription,
      type: 'website',
      url: localizedUrl(locale),
      images: [{ url: '/images/og-offset360.png', width: 1200, height: 630, alt: 'Offset360 — closed-loop color for sheetfed offset' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: t.metaDescription,
      images: ['/images/og-offset360.png'],
    },
  };
}

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

export default function Offset360Route({ searchParams }: { searchParams?: SearchParams }) {
  const locale = requestLocale();
  const t = OFFSET360_COPY[locale];
  const colorloopFocus = isColorloopFocus(searchParams);

  // FAQ rich-result markup in the language actually served on this URL.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: OFFSET360_FAQ_BY_LOCALE[locale].map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.breadcrumbHome, item: locale === 'en' ? BASE : `${BASE}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Offset360', item: localizedUrl(locale) },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Offset360Page colorloopFocus={colorloopFocus} />
    </>
  );
}
