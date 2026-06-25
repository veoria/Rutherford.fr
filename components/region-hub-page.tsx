'use client';

import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { ScrollReveal } from '@/components/scroll-reveal';
import { HeroBackground } from '@/components/hero-background';
import { ColorLoopSection } from '@/components/colorloop-section';
import { RoiTeaser } from '@/components/roi-teaser';
import type { Region } from '@/data/regions';

type Copy = {
  lead: string;
  accent: string;
  sub: string;
  cta1: string;
  cta2: string;
  withLabel: string;
  products: { rutherford: string; colorloop: string; veoria: string };
  console: { title: string; sub: string; steps: string[]; cta: string };
};

const COPY: Record<Locale, Copy> = {
  en: {
    lead: 'Color on target.',
    accent: 'Automatically.',
    sub: 'Closed-loop color for offset and flexo presses. Less waste, steadier color, every shift.',
    cta1: 'Check eligibility',
    cta2: 'Talk to us',
    withLabel: 'With',
    products: {
      rutherford: 'Color management & console validation',
      colorloop: 'Closed-loop color software',
      veoria: 'Inline color for labels & packaging',
    },
    console: {
      title: 'Stop losing money on every makeready',
      sub: 'Check in two minutes whether your press qualifies for Rutherford closed-loop color.',
      steps: ['Tell us your press and console', 'We check your ink keys and measurement setup', 'Get your free eligibility result'],
      cta: 'Test your press',
    },
  },
  fr: {
    lead: 'La couleur, juste.',
    accent: 'Automatiquement.',
    sub: 'Le closed-loop couleur pour presses offset et flexo. Moins de gâche, une couleur stable à chaque équipe.',
    cta1: 'Vérifier mon éligibilité',
    cta2: 'Nous contacter',
    withLabel: 'Avec',
    products: {
      rutherford: 'Gestion couleur & validation console',
      colorloop: 'Logiciel closed-loop couleur',
      veoria: 'Couleur inline pour étiquette & packaging',
    },
    console: {
      title: "Arrêtez de perdre de l'argent à chaque calage",
      sub: "Vérifiez en deux minutes si votre presse est éligible au closed-loop Rutherford.",
      steps: ['Indiquez votre presse et votre pupitre', "On vérifie vos clés d'encrage et votre mesure", "Recevez votre résultat d'éligibilité gratuit"],
      cta: 'Testez votre presse',
    },
  },
  de: {
    lead: 'Farbe auf Ziel.',
    accent: 'Automatisch.',
    sub: 'Closed-Loop-Farbe für Offset- und Flexodruckmaschinen. Weniger Makulatur, stabile Farbe in jeder Schicht.',
    cta1: 'Eignung prüfen',
    cta2: 'Kontakt',
    withLabel: 'Mit',
    products: {
      rutherford: 'Farbmanagement & Konsolenvalidierung',
      colorloop: 'Closed-Loop-Farbsoftware',
      veoria: 'Inline-Farbe für Etiketten & Verpackung',
    },
    console: {
      title: 'Verlieren Sie kein Geld mehr beim Einrichten',
      sub: 'Prüfen Sie in zwei Minuten, ob Ihre Druckmaschine für Rutherford Closed-Loop geeignet ist.',
      steps: ['Nennen Sie Druckmaschine und Pult', 'Wir prüfen Farbzonen und Messtechnik', 'Erhalten Sie Ihr kostenloses Ergebnis'],
      cta: 'Druckmaschine testen',
    },
  },
  it: {
    lead: 'Colore a target.',
    accent: 'Automaticamente.',
    sub: 'Colore closed-loop per macchine offset e flexo. Meno scarto, colore stabile a ogni turno.',
    cta1: 'Verifica idoneità',
    cta2: 'Contattaci',
    withLabel: 'Con',
    products: {
      rutherford: 'Gestione colore & validazione console',
      colorloop: 'Software closed-loop colore',
      veoria: 'Colore inline per etichette & packaging',
    },
    console: {
      title: 'Smetta di perdere denaro a ogni avviamento',
      sub: 'Verifichi in due minuti se la Sua macchina è idonea al closed-loop Rutherford.',
      steps: ['Indichi macchina e pulpito', 'Verifichiamo chiavi di inchiostro e misura', 'Riceva il Suo esito di idoneità gratuito'],
      cta: 'Testa la tua macchina',
    },
  },
  es: {
    lead: 'Color en objetivo.',
    accent: 'Automáticamente.',
    sub: 'Color closed-loop para prensas offset y flexo. Menos desperdicio, color estable en cada turno.',
    cta1: 'Comprobar elegibilidad',
    cta2: 'Contactar',
    withLabel: 'Con',
    products: {
      rutherford: 'Gestión del color y validación de consola',
      colorloop: 'Software de color closed-loop',
      veoria: 'Color inline para etiquetas y packaging',
    },
    console: {
      title: 'Deje de perder dinero en cada puesta a punto',
      sub: 'Compruebe en dos minutos si su prensa es elegible para el closed-loop de Rutherford.',
      steps: ['Indique su prensa y su pupitre', 'Revisamos sus llaves de tinta y su medición', 'Reciba su resultado de elegibilidad gratis'],
      cta: 'Pruebe su prensa',
    },
  },
};

const PRODUCTS = [
  { key: 'colorloop', name: 'ColorLoop.ai', href: 'https://colorloop.ai', video: '/videos/colorloop-preview.mp4' },
  { key: 'rutherford', name: 'Rutherford.fr', href: '/', poster: '/images/Bundle Rutherford-4.jpg' },
  { key: 'veoria', name: 'Veoria', href: 'https://veoria.fr', poster: '/images/8Veoria label photos prod .jpg' },
] as const;

export function RegionHubPage({ region: _region }: { region?: Region }) {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <main className="page-shell region-landing" id="top">
      <ScrollReveal />
      <SiteNav current="home" />

      <section className="hero-section region-hero-tight">
        <HeroBackground />
        <div className="container hero-stack">
          <div className="hero-copy">
            <div className="region-partner-logos">
              <span className="region-partner-label">{t.withLabel}</span>
              <img src="/images/xrite-logo-black.png" alt="X-Rite PANTONE" />
              <img src="/images/measurecolor-logo-gray.png" alt="MeasureColor" />
            </div>
            <h1 className="hero-headline">
              <span className="hero-headline-line hero-headline-line-1">{t.lead}</span>{' '}
              <span className="hero-headline-line hero-headline-line-2">
                <span className="hero-headline-accent">{t.accent}</span>
              </span>
            </h1>

            <div className="hero-feature hero-feature-full">
              <img src="/images/Colorloop-Lenovo-Packshotv3.png.png.webp" alt="Rutherford ColorLoop on press" className="hero-feature-base" />
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
              <a className="button button-dark hero-cta" href="#test-your-press">{t.cta1}</a>
              <a className="button button-light hero-cta" href="mailto:contact@rutherford.fr">{t.cta2}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section region-products">
        <div className="container">
          <div className="region-products-grid">
            {PRODUCTS.map((p) => (
              <a className="region-product-card" key={p.key} href={p.href} {...(p.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                <div className="region-product-media">
                  {'video' in p && p.video ? (
                    <video src={p.video} autoPlay muted loop playsInline preload="metadata" />
                  ) : (
                    <img src={(p as { poster: string }).poster} alt={p.name} loading="lazy" />
                  )}
                </div>
                <div className="region-product-body">
                  <span className="region-product-name">{p.name}</span>
                  <span className="region-product-tag">{t.products[p.key]}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <ColorLoopSection />

      <RoiTeaser />

      <section className="section region-console" id="test-your-press">
        <div className="container region-console-inner">
          <h2>{t.console.title}</h2>
          <p className="region-console-sub">{t.console.sub}</p>
          <ol className="region-steps">
            {t.console.steps.map((s, i) => (
              <li key={i}>
                <span className="region-step-num">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <a className="button button-accent region-console-cta" href="/console-validation">{t.console.cta}</a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
