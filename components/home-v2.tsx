'use client';

/**
 * Homepage, second version.
 *
 * Same substance as the current home, rebuilt on the Offset360 rhythm because
 * that page converts better: an antithesis headline, kicker plus claim on every
 * section, concrete chips instead of adjectives, a numbered process, and one
 * destination repeated throughout, the free console check.
 *
 * It reuses app/offset360/offset360.css rather than inventing a second design
 * system, and keeps the existing case studies, PPWR, blog and team blocks below
 * so nothing already earned is thrown away.
 */

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import { homeLink } from '@/lib/home-links';
import { homeMedia } from '@/lib/home-media';
import COPY_DATA from '@/data/home-v2.json';

const CaseStudiesShowcase = dynamic(
  () => import('@/components/case-studies-showcase').then((m) => m.CaseStudiesShowcase),
  { ssr: true },
);
const PPWRSection = dynamic(() => import('@/components/ppwr-section').then((m) => m.PPWRSection), {
  ssr: true,
});
const BlogPreviewSection = dynamic(
  () => import('@/components/blog-preview-section').then((m) => m.BlogPreviewSection),
  { ssr: true },
);
const TeamShowcase = dynamic(() => import('@/components/team-showcase').then((m) => m.TeamShowcase), {
  ssr: true,
});
const SiteFooter = dynamic(() => import('@/components/site-footer').then((m) => m.SiteFooter), {
  ssr: true,
});

type Card = { vendor: string; role: string; body: string };
type Step = { title: string; body: string };

type Copy = {
  hero: {
    kicker: string;
    headMain: string;
    headEm: string;
    lede: string;
    ctaPrimary: string;
    ctaGhost: string;
  };
  bottleneck: { eyebrow: string; titleMain: string; titleEm: string; body: string };
  idea: { eyebrow: string; title: string; lede: string; cards: Card[] };
  process: { eyebrow: string; title: string; steps: Step[] };
  proof: { eyebrow: string; statSuffix: string; sub: string };
  retrofit: { eyebrow: string; title: string; body: string; chips: string[]; link: string };
  roi: { eyebrow: string; label: string; amount: string; lead: string; cta: string };
  end: { eyebrow: string; title: string; body: string; cta: string };
};

const COPY = COPY_DATA as Record<Locale, Copy>;

const CARD_IMAGES = [
  homeMedia('colorloop-section.intellitrax2'),
  homeMedia('colorloop-section.intellitraxConsole'),
  homeMedia('how-rutherford-helps.benefit1'),
];

/** Counts to `value` once the element is on screen. Respects reduced motion. */
function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const started = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - started) / 1400);
          setShown(Math.round(value * (1 - (1 - progress) ** 3)));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0 },
    );
    observer.observe(node);
    // The figure is the proof on this page: never leave it reading zero.
    const failsafe = window.setTimeout(() => setShown((s) => (s === 0 ? value : s)), 3500);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(failsafe);
    };
  }, [value]);

  return (
    <span ref={ref}>
      {shown.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}

/**
 * Adds the class the offset360 stylesheet animates on, once in view.
 *
 * Without that class the element is `opacity: 0`, so a missed callback means
 * content nobody can read. Three things guard against that: the observer fires
 * on the first visible pixel, it keeps watching rather than unobserving, and a
 * failsafe reveals everything after a few seconds whatever happened. Sections
 * arriving later from a lazy import are picked up too.
 */
function useReveal() {
  useEffect(() => {
    const reveal = (node: Element) => node.classList.add('is-in');
    const all = () => Array.from(document.querySelectorAll('.o360-reveal'));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      all().forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && reveal(entry.target)),
      { threshold: 0, rootMargin: '0px 0px -8% 0px' },
    );

    const watch = () => all().forEach((node) => observer.observe(node));
    watch();

    // Lazy sections mount after this effect runs.
    const mutations = new MutationObserver(watch);
    mutations.observe(document.body, { childList: true, subtree: true });

    // Last resort: never leave anything invisible.
    const failsafe = window.setTimeout(() => all().forEach(reveal), 3000);

    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);
}

export default function HomeV2() {
  const { locale } = useLanguage();
  const t = COPY[locale] ?? COPY.en;
  useReveal();

  return (
    <main className="page-shell o360 hv2" id="top">
      <SiteNav current="home" />

      {/* Hero: the antithesis, then the one thing to do about it. */}
      <section className="o360-section hv2-hero">
        <div className="o360-narrow">
          <p className="o360-eyebrow">{t.hero.kicker}</p>
          <h1 className="o360-h1 hv2-h1">
            {t.hero.headMain} <em>{t.hero.headEm}</em>
          </h1>
          <p className="o360-lede">{t.hero.lede}</p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href={homeLink('home-page.primaryCta')}>
              {t.hero.ctaPrimary}
            </a>
            <a className="o360-btn o360-btn-ghost" href="#how">
              {t.hero.ctaGhost}
            </a>
          </div>
        </div>

        <div className="o360-container">
          <figure className="o360-photo o360-reveal hv2-hero-shot">
            <img src={homeMedia('home-page.heroProduct')} alt="ColorLoop at the press console" />
          </figure>
        </div>
      </section>

      {/* The problem, stated as a claim rather than a feature list. */}
      <section className="o360-section o360-quiet">
        <div className="o360-statement o360-reveal">
          <p className="o360-eyebrow">{t.bottleneck.eyebrow}</p>
          <h2>
            {t.bottleneck.titleMain} <em>{t.bottleneck.titleEm}</em>
          </h2>
          <p>{t.bottleneck.body}</p>
        </div>
        <div className="o360-container">
          <figure className="o360-photo o360-reveal">
            <img src={homeMedia('audience-section.photo1')} alt="Offset printer at work" loading="lazy" />
          </figure>
        </div>
      </section>

      {/* Three bricks. */}
      <section className="o360-section">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">{t.idea.eyebrow}</p>
          <h2 className="o360-h2">{t.idea.title}</h2>
          <p className="o360-lede">{t.idea.lede}</p>
        </div>
      </section>

      <section className="o360-section" style={{ paddingTop: 0 }}>
        <div className="o360-container">
          <div className="o360-bundle">
            {t.idea.cards.map((card, i) => (
              <article className="o360-card o360-reveal" key={card.vendor} style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="o360-card-media">
                  <img src={CARD_IMAGES[i]} alt="" loading="lazy" />
                </div>
                <div className="o360-card-body">
                  <div className="o360-card-vendor">{card.vendor}</div>
                  <div className="o360-card-role">{card.role}</div>
                  <p>{card.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Numbered process. */}
      <section className="o360-section" id="how">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">{t.process.eyebrow}</p>
          <h2 className="o360-h2">{t.process.title}</h2>
        </div>
        <div className="o360-container">
          <div className="o360-process">
            {t.process.steps.map((step, i) => (
              <article className="o360-process-card o360-reveal" key={step.title} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="o360-process-step">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="o360-h3">{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Proof band, dark, with the counter. */}
      <section className="o360-section o360-band">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">{t.proof.eyebrow}</p>
          <p className="o360-band-stat">
            <CountUp value={1000} suffix="+" />
            {t.proof.statSuffix}
          </p>
          <p className="o360-band-sub">{t.proof.sub}</p>
        </div>
      </section>

      {/* Retrofit, with the console names as chips. */}
      <section className="o360-section">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">{t.retrofit.eyebrow}</p>
          <h2 className="o360-h2">{t.retrofit.title}</h2>
          <p className="o360-lede">{t.retrofit.body}</p>
          <ul className="o360-chips hv2-chips">
            {t.retrofit.chips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
          <a className="o360-feature-link" href={homeLink('home-page.primaryCta')}>
            {t.retrofit.link}
          </a>
        </div>
      </section>

      {/* What it is worth. */}
      <section className="o360-section o360-quiet">
        <div className="o360-narrow o360-reveal hv2-roi">
          <p className="o360-eyebrow">{t.roi.eyebrow}</p>
          <p className="hv2-amount">{t.roi.amount}</p>
          <p className="hv2-amount-label">{t.roi.label}</p>
          <p className="o360-lede">{t.roi.lead}</p>
          <a className="o360-btn o360-btn-ghost" href={homeLink('roi-teaser.cta')}>
            {t.roi.cta}
          </a>
        </div>
      </section>

      <CaseStudiesShowcase />

      {/* The ask, on the strongest contrast on the page. */}
      <section className="o360-section hv2-end">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">{t.end.eyebrow}</p>
          <h2 className="o360-h2">{t.end.title}</h2>
          <p className="o360-lede">{t.end.body}</p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href={homeLink('home-page.primaryCta')}>
              {t.end.cta}
            </a>
          </div>
        </div>
      </section>

      <PPWRSection />
      <BlogPreviewSection />
      <TeamShowcase />
      <SiteFooter />
    </main>
  );
}
