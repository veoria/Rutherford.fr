import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorLoopHome } from '@/components/colorloop-home';

// The ColorLoop home (4 Nov 2026): replaces components/home-page on the redesign branch.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--clh-font' });

export const metadata: Metadata = {
};

// What the home sells, for search engines and answer engines: ColorLoop, its two
// published plans, and the upgrade path for EasySet-EasyLoop and IntelliSet-IntelliLoop users.
const COLORLOOP_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ColorLoop',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Windows 10, Windows 11',
  url: 'https://colorloop.ai/',
  sameAs: ['https://rutherford.fr/colorloop'],
  description:
    'Closed-loop color control software for sheetfed offset presses: ink-key presets before the first sheet, corrections after each measured sheet. Upgrade for Rutherford EasySet-EasyLoop and IntelliSet-IntelliLoop users, keeping the press, the console and the Rutherford hardware.',
  publisher: { '@type': 'Organization', '@id': 'https://rutherford.fr/#organization', name: 'Rutherford', url: 'https://rutherford.fr' },
  offers: [
    { '@type': 'Offer', name: 'ColorLoop, yearly, per press', price: 5300, priceCurrency: 'EUR', url: 'https://colorloop.ai/rutherford-customers' },
    { '@type': 'Offer', name: 'ColorLoop, monthly, per press', price: 590, priceCurrency: 'EUR', url: 'https://colorloop.ai/rutherford-customers' },
  ],
};

export default function HomePage() {
  return (
    <div className={inter.variable}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(COLORLOOP_JSON_LD) }} />
      <ColorLoopHome />
    </div>
  );
}
