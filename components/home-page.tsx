'use client';

import dynamic from 'next/dynamic';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import { ScrollReveal } from '@/components/scroll-reveal';
import { HeroBackground } from '@/components/hero-background';

const BrandExplainerSection = dynamic(
  () => import('@/components/brand-explainer-section').then((module) => module.BrandExplainerSection),
  { ssr: true }
);
const HowRutherfordHelps = dynamic(
  () => import('@/components/how-rutherford-helps').then((module) => module.HowRutherfordHelps),
  { ssr: true }
);
const ColorLoopSection = dynamic(
  () => import('@/components/colorloop-section').then((module) => module.ColorLoopSection),
  { ssr: true }
);
const RoiTeaser = dynamic(() => import('@/components/roi-teaser').then((module) => module.RoiTeaser), {
  ssr: true,
});
const ConsoleValidationCTA = dynamic(
  () => import('@/components/console-validation-cta').then((module) => module.ConsoleValidationCTA),
  { ssr: true }
);
const CaseStudiesShowcase = dynamic(
  () => import('@/components/case-studies-showcase').then((module) => module.CaseStudiesShowcase),
  { ssr: true }
);
const AudienceSection = dynamic(
  () => import('@/components/audience-section').then((module) => module.AudienceSection),
  { ssr: true }
);
const BlogPreviewSection = dynamic(
  () => import('@/components/blog-preview-section').then((module) => module.BlogPreviewSection),
  { ssr: true }
);
const TeamShowcase = dynamic(
  () => import('@/components/team-showcase').then((module) => module.TeamShowcase),
  { ssr: true }
);
const RutherfordIdentitySection = dynamic(
  () => import('@/components/rutherford-identity-section').then((module) => module.RutherfordIdentitySection),
  { ssr: true }
);
const PPWRSection = dynamic(
  () => import('@/components/ppwr-section').then((module) => module.PPWRSection),
  { ssr: true }
);
const SiteFooter = dynamic(
  () => import('@/components/site-footer').then((module) => module.SiteFooter),
  { ssr: true }
);

type HeroCopy = {
  eyebrow: string;
  headlineLead: string;
  headlineAccent: string;
  reduceLabel: string;
  supporting: string;
  primaryCta: string;
  secondaryCta: string;
  tertiaryCta: string;
};

const HERO_COPY: Record<Locale, HeroCopy> = {
  en: {
    eyebrow: 'Offset printing expertise',
    headlineLead: 'Improve color control and',
    headlineAccent: 'reduce makeready waste.',
    reduceLabel: 'Reduce',
    supporting:
      'From closed-loop workflow expertise to modern production software, Rutherford supports offset teams that want faster setup, stronger repeatability, and clearer press-side control. ColorLoop is Rutherford’s latest software platform for smarter offset production.',
    primaryCta: 'Request console validation',
    secondaryCta: 'Request an audit',
    tertiaryCta: 'Discover ColorLoop',
  },
  fr: {
    eyebrow: 'Expertise impression offset',
    headlineLead: 'Améliorer le contrôle couleur et',
    headlineAccent: 'réduire la gâche au calage.',
    reduceLabel: 'Réduire',
    supporting:
      "De l’expertise closed-loop aux logiciels de production modernes, Rutherford accompagne les équipes offset qui veulent un calage plus rapide, une meilleure répétabilité et un contrôle presse plus clair. ColorLoop est la dernière plateforme logicielle de Rutherford pour une production offset plus intelligente.",
    primaryCta: 'Demander une validation console',
    secondaryCta: 'Demander un audit',
    tertiaryCta: 'Découvrir ColorLoop',
  },
  de: {
    eyebrow: 'Expertise im Offsetdruck',
    headlineLead: 'Farbsteuerung verbessern und',
    headlineAccent: 'Makulatur beim Einrichten reduzieren.',
    reduceLabel: 'Reduzieren',
    supporting:
      'Von Closed-Loop-Workflow-Expertise bis zu moderner Produktionssoftware unterstützt Rutherford Offsetteams, die schnelleres Einrichten, bessere Wiederholbarkeit und klarere Maschinensteuerung wollen. ColorLoop ist Rutherfords neueste Softwareplattform für eine intelligentere Offsetproduktion.',
    primaryCta: 'Konsolenvalidierung anfragen',
    secondaryCta: 'Audit anfragen',
    tertiaryCta: 'ColorLoop entdecken',
  },
  it: {
    eyebrow: 'Competenza nella stampa offset',
    headlineLead: 'Controllo colore più preciso.',
    headlineAccent: 'Meno scarti in avviamento.',
    reduceLabel: 'Meno',
    supporting:
      "Dai workflow closed-loop al nostro software di ultima generazione per l’ottimizzazione della produzione, Rutherford affianca i team offset che vogliono ridurre i tempi di avviamento, migliorare la ripetibilità e ottenere un controllo più chiaro direttamente a bordo macchina. ColorLoop è la nuova piattaforma software Rutherford per una produzione offset più intelligente.",
    primaryCta: 'Richiedi la validazione della console',
    secondaryCta: 'Richiedi un audit',
    tertiaryCta: 'Scopri ColorLoop',
  },
  es: {
    eyebrow: 'Experiencia en impresión offset',
    headlineLead: 'Mejorar el control del color y',
    headlineAccent: 'reducir el desperdicio de puesta a punto.',
    reduceLabel: 'Reducir',
    supporting:
      'Desde la experiencia closed-loop hasta el software de producción moderno, Rutherford acompaña a los equipos offset que buscan puestas a punto más rápidas, mejor repetibilidad y un control de prensa más claro. ColorLoop es la última plataforma de software de Rutherford para una producción offset más inteligente.',
    primaryCta: 'Solicitar validación de consola',
    secondaryCta: 'Solicitar una auditoría',
    tertiaryCta: 'Descubrir ColorLoop',
  },
  pt: {
    eyebrow: 'Especialistas em impressão offset',
    headlineLead: 'Melhorar o controlo da cor e',
    headlineAccent: 'reduzir a maculatura de acerto.',
    reduceLabel: 'Reduzir',
    supporting:
      'Da experiência em closed-loop ao software de produção moderno, a Rutherford apoia as equipas offset que procuram um acerto mais rápido, maior repetibilidade e um controlo mais claro junto à máquina. ColorLoop é a mais recente plataforma de software da Rutherford para uma produção offset mais inteligente.',
    primaryCta: 'Solicitar validação de consola',
    secondaryCta: 'Solicitar uma auditoria',
    tertiaryCta: 'Descobrir ColorLoop',
  },
};

export default function HomePage() {
  const { locale } = useLanguage();
  const t = HERO_COPY[locale];

  return (
    <main className="page-shell" id="top">
      <ScrollReveal />
      <SiteNav current="home" />

      <section className="hero-section">
        <HeroBackground />

        <div className="container hero-stack">
          <div className="hero-copy">
            <p className="hero-kicker">{t.eyebrow}</p>
            <h1 className="hero-headline">
              <span className="hero-headline-line hero-headline-line-1">{t.headlineLead}</span>{' '}
              <span className="hero-headline-line hero-headline-line-2">
                <span className="hero-headline-accent">{t.headlineAccent}</span>
              </span>
            </h1>

            <div className="hero-feature">
              <img
                src="/images/colorloop-lenovo-half-2.webp"
                alt="ColorLoop running on a Lenovo laptop"
                className="hero-feature-base"
              />
              <img
                src="/images/colorloop-lenovo-half-2.webp"
                alt=""
                aria-hidden="true"
                className="hero-feature-lens hero-feature-lens-rutherford"
              />
              <img
                src="/images/colorloop-lenovo-half-2.webp"
                alt=""
                aria-hidden="true"
                className="hero-feature-lens hero-feature-lens-xrite"
              />
              <img
                src="/images/colorloop-lenovo-half-2.webp"
                alt=""
                aria-hidden="true"
                className="hero-feature-lens hero-feature-lens-measurecolor"
              />

              <div className="hero-cursor hero-cursor-rutherford" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path d="M5.5 3.5l13 8-5.4 1.6-2.6 5.4z" />
                </svg>
                <span className="hero-cursor-label">Rutherford</span>
              </div>
              <div className="hero-cursor hero-cursor-xrite" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path d="M5.5 3.5l13 8-5.4 1.6-2.6 5.4z" />
                </svg>
                <span className="hero-cursor-label">X-Rite PANTONE</span>
              </div>
              <div className="hero-cursor hero-cursor-measurecolor" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path d="M5.5 3.5l13 8-5.4 1.6-2.6 5.4z" />
                </svg>
                <span className="hero-cursor-label">MeasureColor</span>
              </div>
            </div>

            <p className="hero-supporting">{t.supporting}</p>

            <div className="hero-actions">
              <a className="button button-dark hero-cta" href="/console-validation">
                {t.primaryCta}
              </a>
              <a className="button button-light hero-cta" href="mailto:contact@rutherford.fr">
                {t.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <RoiTeaser />

      <RutherfordIdentitySection />

      <BrandExplainerSection />

      <CaseStudiesShowcase />

      <ConsoleValidationCTA />

      <HowRutherfordHelps />

      <ColorLoopSection />

      <AudienceSection />

      <PPWRSection />

      <BlogPreviewSection />

      <TeamShowcase />

      <SiteFooter />
    </main>
  );
}
