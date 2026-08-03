'use client';

import { useLanguage, type Locale } from '@/components/language-provider';
import COPY_DATA from '@/data/home/roi-teaser.json';

type TeaserCopy = {
  label: string;
  amount: string;
  lead: string;
  cta: string;
  aria: string;
};

// The headline figure is the calculator's own estimate for a common, explicitly
// stated configuration (B1, six colors, packaging carton) — concrete and
// verifiable in the calculator itself, not a vague "average".
const COPY = COPY_DATA as Record<Locale, TeaserCopy>;

export function RoiTeaser() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <section className="roi-teaser" aria-label={t.aria}>
      <div className="container roi-teaser-inner">
        <p className="roi-teaser-figure">
          <span className="roi-teaser-label">{t.label}</span>
          <span className="roi-teaser-amount">{t.amount}</span>
        </p>
        <p className="roi-teaser-lead">{t.lead}</p>
        <a className="button button-light roi-teaser-cta" href="/roi">
          {t.cta} →
        </a>
      </div>
    </section>
  );
}
