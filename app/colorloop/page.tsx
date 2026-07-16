import type { Metadata } from 'next';
import { ColorLoopPage } from '@/components/colorloop-page';
import { COLORLOOP_FAQ } from '@/data/colorloop-faq';
import '@/app/offset360/offset360.css';

// ColorLoop product page. Canonical lives on the international ColorLoop
// domain (go.colorloop.ai), same strategy as /usa and /canada; rutherford.fr
// serves the mirror. colorloop.ai (root) stays reserved for the user platform.
const CANONICAL = 'https://go.colorloop.ai/colorloop';

export const metadata: Metadata = {
  title: 'ColorLoop | AI-powered color control for offset printing',
  description:
    'ColorLoop automates color setup, optimizes makeready and learns continuously on offset sheetfed presses: 30-second setup, up to 65% less waste, up to 45% faster makeready, with complete MeasureColor and IntelliTrax2 integration.',
  keywords: ['ColorLoop', 'AI color control offset', 'closed-loop color', 'MeasureColor integration', 'IntelliTrax2', 'makeready automation', 'offset sheetfed'],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'ColorLoop | AI-powered color control for offset printing',
    description:
      'Automatic color optimization for offset sheetfed printing: 30-second setup, up to 65% less waste, up to 45% faster makeready.',
    url: CANONICAL,
    type: 'website',
  },
};

// SoftwareApplication schema (SEO/GEO playbook, pillar 2), with the group
// entity graph edges (sameAs across the ColorLoop/Rutherford properties).
const SOFTWARE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ColorLoop',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Windows 11',
  url: CANONICAL,
  sameAs: ['https://colorloop.ai/', 'https://rutherford.fr/colorloop'],
  description:
    'AI-powered color control software for offset sheetfed printing. Automates job setup, optimizes makeready with adaptive corrections and learns continuously, with complete MeasureColor and IntelliTrax2 integration.',
  publisher: {
    '@type': 'Organization',
    name: 'Rutherford',
    url: 'https://rutherford.fr',
  },
  offers: {
    '@type': 'AggregateOffer',
    offerCount: 3,
    offers: [
      { '@type': 'Offer', name: 'ColorLoop Standard, for commercial printers' },
      { '@type': 'Offer', name: 'ColorLoop Pack, for packaging printers' },
      { '@type': 'Offer', name: 'ColorLoop Upgrade, for existing Rutherford customers' },
    ],
  },
};

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: COLORLOOP_FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function ColorLoopRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <ColorLoopPage />
    </>
  );
}
