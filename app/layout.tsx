import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { LanguageProvider, type Locale } from '@/components/language-provider';
import { GoogleAnalytics } from '@/components/google-analytics';
import { PostHogAnalytics } from '@/components/posthog-analytics';
import { CookieConsent } from '@/components/cookie-consent';
import { AttributionCapture } from '@/components/attribution-capture';
import { LinkedInInsight } from '@/components/linkedin-insight';
import { Analytics } from '@vercel/analytics/next';
import { BASE, SEO_COPY, localizedMetadata } from '@/lib/seo';
import './globals.css';
// import './brutalism.css'; // disabled, v1 design

const PREFIX_LOCALES = ['fr', 'de', 'it', 'es', 'pt'];

// Default metadata (home page and any page without its own): localized title
// and description, self canonical and hreflang derived from the request URL.
export async function generateMetadata(): Promise<Metadata> {
  const h = headers();
  const pathname = h.get('x-pathname') || '/';
  const seg = pathname.split('/')[1];
  const basePath = PREFIX_LOCALES.includes(seg) ? pathname.slice(seg.length + 1) || '/' : pathname;
  const noindex = ['/account', '/admin', '/api'].some((p) => basePath === p || basePath.startsWith(`${p}/`));

  const metadata = localizedMetadata({
    path: basePath,
    title: SEO_COPY.home.title,
    description: SEO_COPY.home.description,
    image: { url: '/images/og-home.png', alt: 'Rutherford.fr | Closed-loop color control' },
  });
  return {
    metadataBase: new URL(BASE),
    ...metadata,
    ...(noindex ? { alternates: undefined } : {}),
  };
}

// Group entity graph (shared strategy across rutherford.fr / colorloop.ai /
// veoria.fr / ppwrconnect.com): sameAs links the group's properties together
// and parentOrganization anchors them under VEORIA, so search engines and AI
// models learn the sites belong to one family.
const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://rutherford.fr/#organization',
  name: 'Rutherford.fr',
  url: 'https://rutherford.fr',
  logo: 'https://rutherford.fr/images/rutherford-logo-black.png',
  description:
    'European specialist in closed-loop color management for offset and flexo printing. ColorLoop software, console validation and press retrofits.',
  parentOrganization: {
    '@type': 'Organization',
    name: 'VEORIA',
    url: 'https://veoria.fr',
  },
  sameAs: [
    'https://www.linkedin.com/company/rutherfordfr',
    'https://www.instagram.com/rutherfordgraphic/',
    'https://www.youtube.com/channel/UChiClIodg9rbuTDnInE4GmQ',
    'https://www.tiktok.com/@rutherfordgraphic',
    'https://go.colorloop.ai',
    'https://colorloop.ai',
    'https://veoria.fr',
    'https://ppwrconnect.com',
  ],
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://rutherford.fr/#website',
  name: 'Rutherford.fr',
  url: 'https://rutherford.fr',
  publisher: { '@id': 'https://rutherford.fr/#organization' },
  inLanguage: ['en', 'fr', 'de', 'it', 'es', 'pt'],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = ((headers().get('x-locale') as Locale) || 'en') as Locale;

  return (
    <html lang={locale}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }} />
        <LanguageProvider initialLocale={locale}>
          {children}
          <CookieConsent />
        </LanguageProvider>
        <AttributionCapture />
        <GoogleAnalytics />
        <PostHogAnalytics />
        <LinkedInInsight />
        <Analytics />
      </body>
    </html>
  );
}
