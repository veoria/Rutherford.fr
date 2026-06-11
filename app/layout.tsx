import type { Metadata } from 'next';
import { LanguageProvider } from '@/components/language-provider';
import { GoogleAnalytics } from '@/components/google-analytics';
import './globals.css';
// import './brutalism.css'; // disabled, v1 design

export const metadata: Metadata = {
  metadataBase: new URL('https://rutherford.fr'),
  title: 'Rutherford.fr | Closed-loop color control',
  description:
    'Rutherford.fr powered by X-Rite Pantone. ColorLoop combines CIP3 / CIP4 preset, measurement and closed-loop color control for offset printing.',
  openGraph: {
    title: 'Rutherford.fr | Closed-loop color control',
    description:
      'Rutherford.fr powered by X-Rite Pantone. ColorLoop combines CIP3 / CIP4 preset, measurement and closed-loop color control for offset printing.',
    url: 'https://rutherford.fr',
    siteName: 'Rutherford.fr',
    images: [
      {
        url: '/images/Bundle Rutherford-4.jpg',
        width: 1200,
        height: 630,
        alt: 'Rutherford team',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rutherford.fr | Closed-loop color control',
    description:
      'Rutherford.fr powered by X-Rite Pantone. ColorLoop combines CIP3 / CIP4 preset, measurement and closed-loop color control for offset printing.',
    images: ['/images/Bundle Rutherford-4.jpg'],
  },
};

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
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
