'use client';

import { useEffect, useRef, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { ColorLoopROI } from '@/components/colorloop-roi';
import { useLanguage } from '@/components/language-provider';
import { OFFSET360_COPY } from '@/data/offset360-copy';
import { OFFSET360_FAQ_BY_LOCALE } from '@/data/offset360-faq';

const XRITE_OFFSET360_URL = 'https://www.xrite.com/page/offset360';
const VIDEO_ID = '7X0fOMXK72Y';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Animated number that counts up from 0 to `value` when scrolled into view. */
function CountUp({
  value,
  prefix = '',
  suffix = '',
  duration = 1400,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let started = false;
    const run = () => {
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(value * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
        else setDisplay(value);
      };
      raf = requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            run();
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {Math.round(display)}
      {suffix}
    </span>
  );
}

// Locale-independent parts of the three bundle cards; text comes from OFFSET360_COPY.
const bundleStatic = [
  {
    name: 'IntelliTrax2',
    vendorLogo: '/images/xrite-logo-black.png',
    vendorAlt: 'X-Rite',
    image: '/images/intellitrax2-black.webp',
    href: 'https://www.xrite.com/categories/scanning-instruments/intellitrax2',
    external: true,
  },
  {
    name: 'MeasureColor',
    vendorLogo: '/images/xrite-logo-black.png',
    vendorAlt: 'X-Rite',
    image: '/images/Hugues on console press offset.jpg',
    href: 'https://www.xrite.com/categories/formulation-and-quality-assurance-software/measurecolor-production',
    external: true,
  },
  {
    name: 'Rutherford ColorLoop',
    vendorLogo: '/images/rutherford-logo-black.png',
    vendorAlt: 'Rutherford',
    image: '/images/Imac CGS Colorloop Graphic Studio.jpg',
    href: '/#colorloop',
    external: false,
  },
];

// Locale-independent parts of the deep-dive feature rows.
const featureStatic = [
  {
    vendorLogo: '/images/xrite-logo-black.png',
    vendorAlt: 'X-Rite',
    image: '/images/intellitrax2-3.jpg',
    href: 'https://www.xrite.com/categories/scanning-instruments/intellitrax2',
    external: true,
    reverse: false,
  },
  {
    vendorLogo: '/images/xrite-logo-black.png',
    vendorAlt: 'X-Rite',
    image: '/images/Bundle Rutherford-4.jpg',
    href: 'https://www.xrite.com/categories/formulation-and-quality-assurance-software/measurecolor-production',
    external: true,
    reverse: true,
  },
  {
    vendorLogo: '/images/rutherford-logo-black.png',
    vendorAlt: 'Rutherford',
    image: '/images/colorloop-screen.gif',
    href: '/#colorloop',
    external: false,
    reverse: false,
  },
];

const numbersStatic: { prefix: string; value: number; suffix: string }[] = [
  { prefix: '− ', value: 50, suffix: ' %' },
  { prefix: '− ', value: 30, suffix: ' %' },
  { prefix: 'ΔE < ', value: 2, suffix: '' },
  { prefix: '', value: 100, suffix: ' %' },
];

const stepNums = ['01', '02', '03', '04'];

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Offset360Page() {
  const rootRef = useRef<HTMLElement>(null);
  const { locale } = useLanguage();
  const t = OFFSET360_COPY[locale] ?? OFFSET360_COPY.en;
  const faq = OFFSET360_FAQ_BY_LOCALE[locale] ?? OFFSET360_FAQ_BY_LOCALE.en;

  // Reveal-on-scroll for every .o360-reveal element inside the page.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('.o360-reveal'));
    if (prefersReducedMotion()) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
    // Re-run on locale change: the client-side language switch re-renders the
    // copy, and any element remounted after the first pass would otherwise
    // never be observed (stuck at opacity 0).
  }, [locale]);

  return (
    <main className="page-shell o360" ref={rootRef}>
      <SiteNav current="home" />

      {/* Hero */}
      <section className="o360-section">
        <div className="o360-narrow">
          <a className="o360-hero-logo" href={XRITE_OFFSET360_URL} target="_blank" rel="noreferrer" aria-label="X-Rite">
            <img src="/images/xrite-logo-black.png" alt="X-Rite" />
          </a>
          <h1 className="o360-h1">Offset360</h1>
          <p className="o360-lede">{t.heroLede}</p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href="#film">{t.watchFilm}</a>
            <a className="o360-btn o360-btn-ghost" href="https://form.typeform.com/to/LZtPUH" target="_blank" rel="noreferrer">
              {t.talkToExpert}
            </a>
          </div>
        </div>
      </section>

      {/* Video */}
      <section id="film" className="o360-section" style={{ paddingTop: 0 }}>
        <div className="o360-container">
          <div className="o360-video-wrap">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`}
              title={t.videoTitle}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Problem statement */}
      <section className="o360-section o360-quiet">
        <div className="o360-statement o360-reveal">
          <p className="o360-eyebrow">{t.problemEyebrow}</p>
          <h2>
            {t.problemTitleMain} <em>{t.problemTitleEm}</em>
          </h2>
          <p>{t.problemBody}</p>
        </div>
        <div className="o360-container">
          <figure className="o360-photo o360-reveal">
            <img src="/images/man-on-offset-press.jpg" alt={t.photoAlts.problem} loading="lazy" />
          </figure>
        </div>
      </section>

      {/* What it is */}
      <section className="o360-section">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">{t.ideaEyebrow}</p>
          <h2 className="o360-h2">{t.ideaTitle}</h2>
          <p className="o360-lede">{t.ideaLede}</p>
        </div>
      </section>

      {/* Bundle cards */}
      <section className="o360-section" style={{ paddingTop: 0 }}>
        <div className="o360-container">
          <div className="o360-bundle">
            {bundleStatic.map((item, i) => (
              <article className="o360-card o360-reveal" key={item.name} style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="o360-card-media">
                  <img src={item.image} alt={t.bundle[i].imageAlt} loading="lazy" />
                </div>
                <div className="o360-card-body">
                  <div className="o360-card-vendor">
                    <img src={item.vendorLogo} alt={item.vendorAlt} />
                  </div>
                  <h3 className="o360-h3">{item.name}</h3>
                  <p className="o360-card-role">{t.bundle[i].role}</p>
                  <p>{t.bundle[i].description}</p>
                  <a
                    className="o360-card-link"
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
                  >
                    {t.learnMore}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Deep-dive feature rows */}
      <section className="o360-section o360-quiet">
        {featureStatic.map((f, i) => (
          <div className={`o360-feature o360-reveal ${f.reverse ? 'is-reverse' : ''}`} key={f.image}>
            <div className="o360-feature-media">
              <img src={f.image} alt={t.features[i].imageAlt} loading="lazy" />
            </div>
            <div className="o360-feature-copy">
              <div className="o360-feature-eyebrow">
                <img src={f.vendorLogo} alt={f.vendorAlt} />
                <span>{t.features[i].eyebrow}</span>
              </div>
              <h3>{t.features[i].title}</h3>
              <p>{t.features[i].body}</p>
              <ul className="o360-chips">
                {t.features[i].chips.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <a
                className="o360-feature-link"
                href={f.href}
                target={f.external ? '_blank' : undefined}
                rel={f.external ? 'noreferrer' : undefined}
              >
                {t.learnMore}
              </a>
            </div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="o360-section">
        <div className="o360-container">
          <div className="o360-narrow o360-reveal" style={{ marginBottom: 16 }}>
            <p className="o360-eyebrow">{t.stepsEyebrow}</p>
            <h2 className="o360-h2">{t.stepsTitle}</h2>
          </div>
          <ol className="o360-steps">
            {t.steps.map((s, i) => (
              <li className="o360-step o360-reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="o360-step-num">{stepNums[i]}</span>
                <div className="o360-step-body">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ROI band */}
      <section className="o360-section o360-band">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">{t.roiEyebrow}</p>
          <p className="o360-band-stat">
            <CountUp prefix={t.roiPrefix} value={60} suffix="%" duration={1600} />
          </p>
          <p className="o360-band-sub">{t.roiSub}</p>
          <div className="o360-numbers">
            {numbersStatic.map((n, i) => (
              <div className="o360-number o360-reveal" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
                <strong>
                  <CountUp prefix={n.prefix} value={n.value} suffix={n.suffix} />
                </strong>
                <span>{t.numberLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Interactive ROI calculator, dark-glass treatment to match the band */}
        <div className="o360-container o360-roi o360-reveal">
          <ColorLoopROI />
        </div>
      </section>

      {/* Implementation process */}
      <section className="o360-section o360-quiet">
        <div className="o360-container">
          <div className="o360-narrow o360-reveal" style={{ marginBottom: 0 }}>
            <p className="o360-eyebrow">{t.deployEyebrow}</p>
            <h2 className="o360-h2">{t.deployTitle}</h2>
          </div>
          <div className="o360-process">
            {t.process.map((p, i) => (
              <div className="o360-process-card o360-reveal" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="o360-process-step">{i + 1}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="o360-section">
        <div className="o360-container">
          <div className="o360-narrow o360-reveal" style={{ marginBottom: 0 }}>
            <p className="o360-eyebrow">{t.includedEyebrow}</p>
            <h2 className="o360-h2">{t.includedTitle}</h2>
          </div>
          <ul className="o360-included">
            {t.included.map((item, i) => (
              <li key={i} className="o360-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <Check />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Open architecture */}
      <section className="o360-section o360-quiet">
        <div className="o360-reassure o360-reveal">
          <p>
            {t.reassurePre}
            <strong>{t.reassureStrong}</strong>
            {t.reassurePost}
          </p>
        </div>
      </section>

      {/* FAQ — Offset360 (also powers FAQPage schema) */}
      <section className="o360-section o360-quiet">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">{t.faqEyebrow}</p>
          <h2 className="o360-h2">{t.faqTitle}</h2>
          <div className="o360-faq">
            {faq.map((f) => (
              <details className="o360-faq-item" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="o360-section">
        <div className="o360-narrow o360-end o360-reveal">
          <p className="o360-eyebrow">{t.ctaEyebrow}</p>
          <h2 className="o360-h2">{t.ctaTitle}</h2>
          <p>{t.ctaBody}</p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href="/console-validation">
              {t.ctaPrimary}
            </a>
            <a className="o360-btn o360-btn-ghost" href={XRITE_OFFSET360_URL} target="_blank" rel="noreferrer">
              {t.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
