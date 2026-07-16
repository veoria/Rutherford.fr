import type { Metadata } from 'next';
import { GlossaryPage } from '@/components/glossary-page';
import { GLOSSARY_TERMS } from '@/data/glossary';

const BASE = 'https://rutherford.fr';
const title = 'Offset color management glossary | Rutherford.fr';
const description =
  'Clear definitions of the vocabulary of offset color control: makeready, DeltaE, ink keys, G7, ISO 12647-2, closed-loop color control and more, written from the pressroom floor.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['offset printing glossary', 'color management terms', 'DeltaE', 'makeready', 'closed-loop color control', 'G7', 'ISO 12647-2'],
  alternates: { canonical: `${BASE}/glossary` },
  openGraph: {
    title,
    description,
    url: `${BASE}/glossary`,
    siteName: 'Rutherford.fr',
    type: 'website',
  },
};

// DefinedTermSet: 30+ ready-made definitions for generative engines (GEO).
// English is the canonical language of the term set; the visible page follows
// the visitor's locale.
const TERM_SET_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  '@id': `${BASE}/glossary`,
  name: 'Offset color management glossary',
  description,
  publisher: { '@id': `${BASE}/#organization` },
  hasDefinedTerm: GLOSSARY_TERMS.map((term) => ({
    '@type': 'DefinedTerm',
    '@id': `${BASE}/glossary#${term.slug}`,
    name: term.name.en,
    description: term.def.en,
    url: `${BASE}/glossary#${term.slug}`,
    inDefinedTermSet: `${BASE}/glossary`,
  })),
};

export default function GlossaryRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(TERM_SET_JSON_LD) }} />
      <GlossaryPage />
    </>
  );
}
