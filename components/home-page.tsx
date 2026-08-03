'use client';

import dynamic from 'next/dynamic';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import { ScrollReveal } from '@/components/scroll-reveal';
import { HeroBackground } from '@/components/hero-background';
import HERO_COPY_DATA from '@/data/home/home-page.json';
import HOME_LAYOUT from '@/data/home/layout.json';
import { homeMedia } from '@/lib/home-media';
import { homeLink } from '@/lib/home-links';

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

const HERO_COPY = HERO_COPY_DATA as Record<Locale, HeroCopy>;

/**
 * Which blocks the page shows, and in what order. Driven by
 * data/home/layout.json so /dev/edit can hide or reorder a section without
 * touching this file. The hero and the footer are fixtures and stay put.
 */
const SECTIONS = {
  'roi-teaser': RoiTeaser,
  'rutherford-identity-section': RutherfordIdentitySection,
  'brand-explainer-section': BrandExplainerSection,
  'case-studies-showcase': CaseStudiesShowcase,
  'console-validation-cta': ConsoleValidationCTA,
  'how-rutherford-helps': HowRutherfordHelps,
  'colorloop-section': ColorLoopSection,
  'audience-section': AudienceSection,
  'ppwr-section': PPWRSection,
  'blog-preview-section': BlogPreviewSection,
  'team-showcase': TeamShowcase,
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
                src={homeMedia('home-page.heroProduct')}
                alt="ColorLoop running on a Lenovo laptop"
                className="hero-feature-base"
              />
              <img
                src={homeMedia('home-page.heroProduct')}
                alt=""
                aria-hidden="true"
                className="hero-feature-lens hero-feature-lens-rutherford"
              />
              <img
                src={homeMedia('home-page.heroProduct')}
                alt=""
                aria-hidden="true"
                className="hero-feature-lens hero-feature-lens-xrite"
              />
              <img
                src={homeMedia('home-page.heroProduct')}
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
              <a className="button button-dark hero-cta" href={homeLink('home-page.primaryCta')}>
                {t.primaryCta}
              </a>
              <a className="button button-light hero-cta" href={homeLink('home-page.secondaryCta')}>
                {t.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {(HOME_LAYOUT as { order: string[]; hidden: string[] }).order
        .filter((id) => !(HOME_LAYOUT as { hidden: string[] }).hidden.includes(id))
        .map((id) => {
          const Section = SECTIONS[id as keyof typeof SECTIONS];
          return Section ? <Section key={id} /> : null;
        })}

      <SiteFooter />
    </main>
  );
}
