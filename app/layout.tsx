import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { LanguageProvider, type Locale } from '@/components/language-provider';
import { GoogleAnalytics } from '@/components/google-analytics';
import { CookieConsent } from '@/components/cookie-consent';
import './globals.css';
// import './brutalism.css'; // disabled, v1 design

const BASE = 'https://rutherford.fr';
const PREFIX_LOCALES = ['fr', 'de', 'it', 'es'];
const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  de: 'de_DE',
  it: 'it_IT',
  es: 'es_ES',
};
const TITLE = 'Rutherford.fr | Closed-loop color control';
const DESCRIPTION =
  'Rutherford.fr powered by X-Rite Pantone. ColorLoop combines CIP3 / CIP4 preset, measurement and closed-loop color control for offset printing.';

// Canonical + hreflang are derived per request from the URL (set by middleware),
// so every page links its en / fr / de / it / es versions without per-page config.
export async function generateMetadata(): Promise<Metadata> {
  const h = headers();
  const pathname = h.get('x-pathname') || '/';
  const locale = ((h.get('x-locale') as Locale) || 'en') as Locale;
  const seg = pathname.split('/')[1];
  const basePath = PREFIX_LOCALES.includes(seg) ? pathname.slice(seg.length + 1) || '/' : pathname;
  const suffix = basePath === '/' ? '' : basePath;
  const enHref = `${BASE}${suffix || '/'}`;
  const selfHref = locale === 'en' ? enHref : `${BASE}/${locale}${suffix}`;
  const noindex = ['/account', '/admin', '/api'].some((p) => basePath === p || basePath.startsWith(`${p}/`));

  const languages = noindex
    ? undefined
    : {
        en: enHref,
        fr: `${BASE}/fr${suffix}`,
        de: `${BASE}/de${suffix}`,
        it: `${BASE}/it${suffix}`,
        es: `${BASE}/es${suffix}`,
        'x-default': enHref,
      };

  return {
    metadataBase: new URL(BASE),
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: selfHref, languages },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: selfHref,
      siteName: 'Rutherford.fr',
      images: [{ url: '/images/Bundle Rutherford-4.jpg', width: 1200, height: 630, alt: 'Rutherford team' }],
      locale: OG_LOCALE[locale] ?? 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: DESCRIPTION,
      images: ['/images/Bundle Rutherford-4.jpg'],
    },
  };
}

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Rutherford.fr',
  url: 'https://rutherford.fr',
  logo: 'https://rutherford.fr/images/rutherford-logo-black.png',
  description:
    'European specialist in closed-loop color management for offset and flexo printing. X-Rite PANTONE partner. ColorLoop software, console validation and the Offset360 bundle.',
  sameAs: [
    'https://www.linkedin.com/company/rutherford-graphic-products-llc',
    'https://www.instagram.com/rutherfordgraphic/',
    'https://www.youtube.com/channel/UChiClIodg9rbuTDnInE4GmQ',
    'https://www.tiktok.com/@rutherfordgraphic',
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = ((headers().get('x-locale') as Locale) || 'en') as Locale;

  return (
    <html lang={locale}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
        <LanguageProvider initialLocale={locale}>
          {children}
          <CookieConsent />
        </LanguageProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
