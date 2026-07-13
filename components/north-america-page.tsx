'use client';

import './region-landing.css';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { ScrollReveal } from '@/components/scroll-reveal';
import { ColorLoopROI } from '@/components/colorloop-roi';

// North America market pages (/usa, /canada). English-only by design: the
// generic RegionHubPage is identical across regions, while this page carries
// the US pedigree (Rutherford Graphic Products, est. 2000, Dayton OH), the
// G7 anchor and US customer proof that the North American buyer expects.
// X-Rite stays present as credibility (hybrid positioning), ColorLoop leads.

type Country = 'usa' | 'canada';

type NaCopy = {
  eyebrow: string;
  lead: string;
  accent: string;
  sub: string;
  proofNote: string;
};

const COUNTRY_COPY: Record<Country, NaCopy> = {
  usa: {
    eyebrow: 'United States',
    lead: 'Closed-loop color, built for',
    accent: 'American pressrooms.',
    sub: 'Rutherford has closed the loop on offset color since 2000, from Dayton, Ohio to 30+ countries. G7-anchored, retrofit to the press you already run, on the X-Rite measurement you already own.',
    proofNote: 'Trusted across the North American supply chain, from commercial shops to packaging groups like WestRock and Avery Dennison.',
  },
  canada: {
    eyebrow: 'Canada',
    lead: 'Closed-loop color, built for',
    accent: 'Canadian pressrooms.',
    sub: 'Rutherford has closed the loop on offset color since 2000, deployed in 30+ countries. G7-anchored, retrofit to the press you already run, on the X-Rite measurement you already own. Support in English and French.',
    proofNote: 'Trusted across the North American supply chain, from commercial shops to packaging groups like WestRock and Avery Dennison.',
  },
};

const STATS = [
  { num: '2000', label: 'Closing the loop since' },
  { num: '30+', label: 'Countries' },
  { num: '1,000+', label: 'Systems deployed' },
];

const WHY = [
  {
    n: '01',
    t: 'G7-anchored',
    d: 'Most North American shops calibrate to G7. ColorLoop holds your gray balance and density targets sheet after sheet, and documents them for the brand owner.',
  },
  {
    n: '02',
    t: 'Any press, retrofit',
    d: 'Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi, Ryobi. CIP3/CIP4 presetting and closed-loop correction on the console you already have, no new press.',
  },
  {
    n: '03',
    t: 'On your X-Rite measurement',
    d: 'ColorLoop works alongside the X-Rite and MeasureColor tools US pressrooms already trust, IntelliTrax2 included. Your investment stays, the loop closes.',
  },
];

const CONSOLE_STEPS = [
  'Tell us your press and console',
  'We check your ink keys and measurement setup',
  'Get your free eligibility result within one business day',
];

export function NorthAmericaPage({ country }: { country: Country }) {
  const t = COUNTRY_COPY[country];

  return (
    <main className="page-shell region-landing" id="top">
      <ScrollReveal />
      <SiteNav current="home" />

      {/* Hero */}
      <section className="rl-hero">
        <div className="rl-container">
          <p className="rl-eyebrow">{t.eyebrow}</p>
          <h1 className="rl-h1">
            {t.lead} <span className="muted">{t.accent}</span>
          </h1>
          <p className="rl-sub">{t.sub}</p>
          <div className="rl-actions">
            <a className="rl-btn rl-btn-primary" href="#test-your-press">Check your press</a>
            <a className="rl-btn rl-btn-ghost" href="mailto:contact@rutherford.fr">Talk to us →</a>
          </div>

          <div className="rl-shot">
            <div className="hero-feature hero-feature-full">
              <img src="/images/Colorloop-Lenovo-Packshotv3.png.png.webp" alt="Rutherford ColorLoop on press" className="hero-feature-base" />
              <div className="hero-cursor hero-cursor-rutherford" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="32" height="32"><path d="M5.5 3.5l13 8-5.4 1.6-2.6 5.4z" /></svg>
                <span className="hero-cursor-label">ColorLoop</span>
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
          </div>
        </div>
      </section>

      {/* Stats: the US pedigree */}
      <section className="rl-section" style={{ paddingTop: 0 }}>
        <div className="rl-container">
          <div className="rl-stats">
            {STATS.map((s) => (
              <div className="rl-stat" key={s.label}>
                <div className="rl-stat-num">{s.num}</div>
                <div className="rl-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Rutherford in North America */}
      <section className="rl-section">
        <div className="rl-container">
          <p className="rl-eyebrow">Why Rutherford in North America</p>
          <div className="rl-how">
            {WHY.map((h) => (
              <div className="rl-how-col" key={h.n}>
                <div className="rl-how-n">{h.n}</div>
                <div className="rl-how-t">{h.t}</div>
                <p className="rl-how-d">{h.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* US proof: Printwell testimonial */}
      <section className="rl-section" style={{ paddingTop: 0 }}>
        <div className="rl-container">
          <p className="rl-eyebrow">Proof, from a US pressroom</p>
          <div className="rl-card" style={{ maxWidth: 860, margin: '0 auto' }}>
            <div className="rl-card-media" style={{ aspectRatio: '16 / 9' }}>
              <iframe
                src="https://www.youtube-nocookie.com/embed/ut247z4ren8"
                title="Printwell USA, closed-loop color with Rutherford"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
              />
            </div>
            <div className="rl-card-body">
              <div className="rl-card-process">Testimonial</div>
              <div className="rl-card-name">Printwell USA</div>
              <div className="rl-card-tag">Consistent color at high volume, on the presses they already ran.</div>
            </div>
          </div>
          <p className="rl-sub" style={{ margin: '28px auto 0', maxWidth: 760 }}>{t.proofNote}</p>
        </div>
      </section>

      {/* ROI calculator, USD */}
      <section className="rl-section rl-roi" style={{ paddingTop: 0 }}>
        <div className="rl-container">
          <ColorLoopROI currency="USD" />
        </div>
      </section>

      {/* Test your press */}
      <section className="rl-section rl-test" id="test-your-press">
        <div className="rl-container">
          <h2 className="rl-h2">Stop losing money on every makeready</h2>
          <p className="rl-sub" style={{ margin: '16px auto 0' }}>
            Check in two minutes whether your press qualifies for Rutherford closed-loop color. A few photos of your console, an answer within one business day.
          </p>
          <ol className="rl-test-steps">
            {CONSOLE_STEPS.map((s, i) => (
              <li key={i}>
                <span className="rl-test-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="rl-test-txt">{s}</span>
              </li>
            ))}
          </ol>
          <a className="rl-btn rl-btn-primary" href="/console-validation">Test your press</a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
