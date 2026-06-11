'use client';

import { useLanguage, type Locale } from '@/components/language-provider';

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
const COPY: Record<Locale, TeaserCopy> = {
  en: {
    label: 'Estimated yearly saving',
    amount: '≈ €145,000',
    lead: 'for a B1 six-color packaging press. What could ColorLoop save in your pressroom?',
    cta: 'Calculate your savings',
    aria: 'Estimate your savings with ColorLoop',
  },
  fr: {
    label: 'Économie annuelle estimée',
    amount: '≈ 145 000 €',
    lead: 'pour une presse B1 six couleurs en packaging carton. Combien ColorLoop ferait économiser à votre atelier ?',
    cta: 'Calculez vos économies',
    aria: 'Estimez vos économies avec ColorLoop',
  },
  de: {
    label: 'Geschätzte jährliche Ersparnis',
    amount: '≈ 145.000 €',
    lead: 'für eine B1-Sechsfarben-Verpackungsmaschine. Wie viel könnte ColorLoop in Ihrer Druckerei sparen?',
    cta: 'Ersparnis berechnen',
    aria: 'Schätzen Sie Ihre Ersparnis mit ColorLoop',
  },
  it: {
    label: 'Risparmio annuo stimato',
    amount: '≈ 145.000 €',
    lead: 'per una macchina B1 sei colori nel packaging. Quanto potrebbe far risparmiare ColorLoop nel Suo reparto stampa?',
    cta: 'Calcola il Suo risparmio',
    aria: 'Stima il Suo risparmio con ColorLoop',
  },
  es: {
    label: 'Ahorro anual estimado',
    amount: '≈ 145.000 €',
    lead: 'para una prensa B1 de seis colores en packaging. ¿Cuánto podría ahorrar ColorLoop en su sala de prensa?',
    cta: 'Calcule su ahorro',
    aria: 'Estime su ahorro con ColorLoop',
  },
};

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
