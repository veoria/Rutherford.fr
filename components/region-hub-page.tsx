'use client';

import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { ScrollReveal } from '@/components/scroll-reveal';
import { HeroBackground } from '@/components/hero-background';
import { BrandExplainerSection } from '@/components/brand-explainer-section';
import { ColorLoopSection } from '@/components/colorloop-section';
import { ConsoleValidationCTA } from '@/components/console-validation-cta';
import type { Region } from '@/data/regions';

type Copy = {
  kicker: string;
  lead: string;
  accent: string;
  sub: string;
  cta1: string;
  cta2: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'Rutherford · X-Rite PANTONE · MeasureColor',
    lead: 'Color on target.',
    accent: 'Automatically.',
    sub: 'Closed-loop color for offset and flexo presses. Less waste, steadier color, every shift.',
    cta1: 'Check eligibility',
    cta2: 'Talk to us',
  },
  fr: {
    kicker: 'Rutherford · X-Rite PANTONE · MeasureColor',
    lead: 'La couleur, juste.',
    accent: 'Automatiquement.',
    sub: 'Le closed-loop couleur pour presses offset et flexo. Moins de gâche, une couleur stable à chaque équipe.',
    cta1: 'Vérifier mon éligibilité',
    cta2: 'Nous contacter',
  },
  de: {
    kicker: 'Rutherford · X-Rite PANTONE · MeasureColor',
    lead: 'Farbe auf Ziel.',
    accent: 'Automatisch.',
    sub: 'Closed-Loop-Farbe für Offset- und Flexodruckmaschinen. Weniger Makulatur, stabile Farbe in jeder Schicht.',
    cta1: 'Eignung prüfen',
    cta2: 'Kontakt',
  },
  it: {
    kicker: 'Rutherford · X-Rite PANTONE · MeasureColor',
    lead: 'Colore a target.',
    accent: 'Automaticamente.',
    sub: 'Colore closed-loop per macchine offset e flexo. Meno scarto, colore stabile a ogni turno.',
    cta1: 'Verifica idoneità',
    cta2: 'Contattaci',
  },
  es: {
    kicker: 'Rutherford · X-Rite PANTONE · MeasureColor',
    lead: 'Color en objetivo.',
    accent: 'Automáticamente.',
    sub: 'Color closed-loop para prensas offset y flexo. Menos desperdicio, color estable en cada turno.',
    cta1: 'Comprobar elegibilidad',
    cta2: 'Contactar',
  },
};

export function RegionHubPage({ region: _region }: { region?: Region }) {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <main className="page-shell region-landing" id="top">
      <ScrollReveal />
      <SiteNav current="home" />

      <section className="hero-section">
        <HeroBackground />
        <div className="container hero-stack">
          <div className="hero-copy">
            <p className="hero-kicker">{t.kicker}</p>
            <h1 className="hero-headline">
              <span className="hero-headline-line hero-headline-line-1">{t.lead}</span>{' '}
              <span className="hero-headline-line hero-headline-line-2">
                <span className="hero-headline-accent">{t.accent}</span>
              </span>
            </h1>

            <div className="hero-feature">
              <img src="/images/colorloop-lenovo-half-2.webp" alt="Rutherford ColorLoop on press" className="hero-feature-base" />
              <img src="/images/colorloop-lenovo-half-2.webp" alt="" aria-hidden="true" className="hero-feature-lens hero-feature-lens-rutherford" />
              <img src="/images/colorloop-lenovo-half-2.webp" alt="" aria-hidden="true" className="hero-feature-lens hero-feature-lens-xrite" />
              <img src="/images/colorloop-lenovo-half-2.webp" alt="" aria-hidden="true" className="hero-feature-lens hero-feature-lens-measurecolor" />
              <div className="hero-cursor hero-cursor-rutherford" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="32" height="32"><path d="M5.5 3.5l13 8-5.4 1.6-2.6 5.4z" /></svg>
                <span className="hero-cursor-label">Rutherford</span>
              </div>
              <div className="hero-cursor hero-cursor-xrite" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="32" height="32"><path d="M5.5 3.5l13 8-5.4 1.6-2.6 5.4z" /></svg>
                <span className="hero-cursor-label">X-Rite PANTONE</span>
              </div>
              <div className="hero-cursor hero-cursor-measurecolor" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="32" height="32"><path d="M5.5 3.5l13 8-5.4 1.6-2.6 5.4z" /></svg>
                <span className="hero-cursor-label">MeasureColor</span>
              </div>
            </div>

            <p className="hero-supporting">{t.sub}</p>

            <div className="hero-actions">
              <a className="button button-dark hero-cta" href="/console-validation">{t.cta1}</a>
              <a className="button button-light hero-cta" href="mailto:contact@rutherford.fr">{t.cta2}</a>
            </div>
          </div>
        </div>
      </section>

      <BrandExplainerSection />
      <ColorLoopSection />
      <ConsoleValidationCTA />

      <SiteFooter />
    </main>
  );
}
