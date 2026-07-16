import type { Metadata } from 'next';
import { PillarClosedLoopPage } from '@/components/pillar-closed-loop-page';

const BASE = 'https://rutherford.fr';
const CANONICAL = `${BASE}/closed-loop-color-control`;
const title = 'Closed-loop color control for offset printing: the complete guide | Rutherford.fr';
const description =
  'How closed-loop color control works on an offset press: measure, compare, correct the ink keys automatically. Up to 65% less makeready waste, ISO 12647-2 and G7 held in production, retrofit on any press.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['closed-loop color control', 'offset color automation', 'makeready waste', 'ink key correction', 'ISO 12647-2', 'G7', 'ColorLoop'],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title,
    description,
    url: CANONICAL,
    siteName: 'Rutherford.fr',
    images: [{ url: '/images/og-home.png', width: 1200, height: 630, alt: 'Closed-loop color control for offset printing' }],
    type: 'article',
  },
};

// FAQPage: the schema generative engines quote most (group playbook, pillar 2).
const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the difference between closed-loop and open-loop color control?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Open-loop systems measure the sheet and display deviations; the operator adjusts the ink keys manually. Closed-loop systems like ColorLoop compute and apply the ink key corrections automatically, so color converges on target without manual intervention.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much waste does closed-loop color control save?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Deployments measured by Rutherford show up to 65% less makeready waste and up to 45% shorter makeready time, because the press reaches target color within the first sheets instead of after hundreds.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does a closed loop work on an old press?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The loop connects to the press console, not to the press mechanics, so presses over 30 years old can be retrofitted. The free Rutherford Check validates a specific console in about two minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is closed-loop color control compatible with G7 and ISO 12647-2?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The standard’s aim points (CIELAB, TVI, gray balance) are loaded as the target, and every measured sheet is corrected toward that target, with measurement records as audit evidence.',
      },
    },
    {
      '@type': 'Question',
      name: 'What hardware and software does a Rutherford closed loop use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A typical line pairs an X-Rite IntelliTrax2 scanning spectrophotometer and MeasureColor with the ColorLoop software, which computes corrections and drives the press console. Existing X-Rite hardware can usually be kept and upgraded.',
      },
    },
  ],
};

const ARTICLE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Closed-loop color control for offset printing: the complete guide',
  description,
  url: CANONICAL,
  inLanguage: ['en', 'fr'],
  author: { '@id': `${BASE}/#organization` },
  publisher: { '@id': `${BASE}/#organization` },
};

export default function ClosedLoopPillarRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_JSON_LD) }} />
      <PillarClosedLoopPage />
    </>
  );
}
