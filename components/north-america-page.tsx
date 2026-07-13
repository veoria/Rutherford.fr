'use client';

import '@/app/offset360/offset360.css';
import { useEffect, useRef, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { ColorLoopROI } from '@/components/colorloop-roi';

// North America market landing (/usa, /canada). Same design system as the
// ColorLoop landing on go.colorloop.ai (offset360.css), English-only,
// ColorLoop leads and X-Rite stays as credibility (hybrid positioning).

const FILM_ID = '7X0fOMXK72Y';

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

/** Typewriter reveal: types `text` out on mount, then blinks a caret. */
function TypeOn({ text, speed = 70 }: { text: string; speed?: number }) {
  const [chars, setChars] = useState(prefersReducedMotion() ? text.length : 0);
  const [done, setDone] = useState(prefersReducedMotion());

  useEffect(() => {
    if (prefersReducedMotion()) return;
    setChars(0);
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setChars(i);
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <>
      {text.slice(0, chars)}
      <span className={`o360-caret ${done ? 'is-blinking' : ''}`} aria-hidden="true" />
      <span className="sr-only">{text}</span>
    </>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

type Country = 'usa' | 'canada';

const COUNTRY = {
  usa: {
    eyebrow: 'United States',
    lede: 'Closed-loop color for American pressrooms. Rutherford has closed the loop on offset color since 2000, from Dayton, Ohio to 30+ countries. Scan, compare, correct, automatically.',
    proofLede: 'From high-volume commercial work in Michigan to packaging lines across the North American supply chain.',
    ctaBody: 'Every uncontrolled makeready burns sheets, ink and press time. Check free of charge whether your press qualifies: a few photos of your console, an answer within one business day. Figures in USD.',
  },
  canada: {
    eyebrow: 'Canada',
    lede: 'Closed-loop color for Canadian pressrooms, with support in English and French. Rutherford has closed the loop on offset color since 2000, deployed in 30+ countries. Scan, compare, correct, automatically.',
    proofLede: 'Proven across the North American supply chain, from commercial shops to packaging groups.',
    ctaBody: 'Every uncontrolled makeready burns sheets, ink and press time. Check free of charge whether your press qualifies: a few photos of your console, an answer within one business day. Support available in English and French.',
  },
} satisfies Record<Country, { eyebrow: string; lede: string; proofLede: string; ctaBody: string }>;

// The stack, ColorLoop first (hybrid: X-Rite products follow as credibility).
const BUNDLE = [
  {
    name: 'Rutherford ColorLoop',
    vendorLogo: '/images/rutherford-logo-black.png',
    vendorAlt: 'Rutherford',
    image: '/images/Imac CGS Colorloop Graphic Studio.jpg',
    imageAlt: 'Rutherford ColorLoop on an iMac',
    role: 'Closed-loop presetting and correction',
    description:
      'Turns measurements into ink key corrections and sends them to the console. CIP3/CIP4 presets load before the press starts. The loop closes, automatically.',
    href: 'https://colorloop.ai/',
    external: true,
  },
  {
    name: 'IntelliTrax2',
    vendorLogo: '/images/xrite-logo-black.png',
    vendorAlt: 'X-Rite',
    image: '/images/intellitrax2-black.webp',
    imageAlt: 'X-Rite IntelliTrax2 scanning system',
    role: 'Press-side scanning',
    description:
      'The automated scanning system US pressrooms already trust. Reads a full color bar in under ten seconds, bars down to 2 mm, contact-free.',
    href: 'https://www.xrite.com/categories/scanning-instruments/intellitrax2',
    external: true,
  },
  {
    name: 'MeasureColor',
    vendorLogo: '/images/xrite-logo-black.png',
    vendorAlt: 'X-Rite',
    image: '/images/Hugues on console press offset.jpg',
    imageAlt: 'Operator using MeasureColor at the press console',
    role: 'Process control and reporting',
    description:
      'One platform for offset, flexo and digital. Real-time DeltaE, ChromaTrack density guidance, audit-ready reports for the brand owner.',
    href: 'https://www.xrite.com/categories/formulation-and-quality-assurance-software/measurecolor-production',
    external: true,
  },
];

const FEATURES = [
  {
    eyebrow: 'G7-anchored',
    vendorLogo: '/images/rutherford-logo-black.png',
    vendorAlt: 'Rutherford',
    title: 'Built for the way North America prints: G7.',
    body:
      'Most North American shops calibrate to G7 gray balance. ColorLoop holds your gray balance and density targets sheet after sheet, tracks DeltaE00 against the brief, and documents every run so the brand owner audit is ready before the job ships.',
    chips: ['G7 gray balance', 'ISO 12647 compatible', 'DeltaE00 tracked per job', 'Audit-ready reports'],
    image: '/images/support-hugues-console.jpg',
    imageAlt: 'Operator reading color measurements on the ColorLoop console',
    href: '/blog/g7-vs-iso-12647-offset-color',
    external: false,
  },
  {
    eyebrow: 'Any press, retrofit',
    vendorLogo: '/images/rutherford-logo-black.png',
    vendorAlt: 'Rutherford',
    title: 'Your press qualifies. New or thirty years old.',
    body:
      'Rutherford retrofits closed-loop color to the console you already run: Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi, Ryobi. CIP3/CIP4 presetting opens every ink key from prepress data, then the loop keeps the run on target. No new press, a fraction of the cost.',
    chips: ['Heidelberg · Komori · KBA', 'Manroland · Mitsubishi · Ryobi', 'CIP3 / CIP4 presetting', 'No new press'],
    image: '/images/manroland-press.jpg',
    imageAlt: 'Manroland Sheetfed offset press running at 14,000 sheets per hour',
    href: '/console-validation',
    external: false,
  },
  {
    eyebrow: 'On your existing measurement',
    vendorLogo: '/images/xrite-logo-black.png',
    vendorAlt: 'X-Rite',
    title: 'Keep the X-Rite investment you already made.',
    body:
      'ColorLoop works alongside the X-Rite and MeasureColor tools already installed in your pressroom, IntelliTrax2 included. The measurement you trust becomes the sensor of the loop: readings feed the console, corrections flow back, color holds.',
    chips: ['IntelliTrax2', 'MeasureColor', 'eXact family', 'Your investment stays'],
    image: '/images/colorloop-screen.gif',
    imageAlt: 'Rutherford ColorLoop interface in action',
    href: 'https://colorloop.ai/',
    external: true,
  },
];

const STEPS = [
  { title: 'Preset', body: 'CIP3/CIP4 ink key presets load automatically from prepress data. No manual entry.' },
  { title: 'Scan', body: 'IntelliTrax2 reads the color bar across the full sheet in seconds.' },
  { title: 'Compare', body: 'MeasureColor computes DeltaE against your G7 or brand target and flags zones out of tolerance.' },
  { title: 'Correct', body: 'ColorLoop sends corrections to the console. The operator approves. Closed loop.' },
];

const NUMBERS: { prefix: string; value: number; suffix: string; label: string }[] = [
  { prefix: '− ', value: 50, suffix: ' %', label: 'Makeready waste' },
  { prefix: '− ', value: 30, suffix: ' %', label: 'Makeready time' },
  { prefix: 'ΔE < ', value: 2, suffix: '', label: 'Color stability in the run' },
  { prefix: '', value: 100, suffix: ' %', label: 'Sheets traceable' },
];

const STEP_NUMS = ['01', '02', '03', '04'];

// US and North America customer proof, straight from the pressroom floor.
const TESTIMONIALS = [
  {
    company: 'Printwell USA',
    place: 'Michigan, United States',
    videoId: 'ut247z4ren8',
    line: 'Consistent color at high volume, on the presses they already ran.',
  },
  {
    company: 'Avery Dennison',
    place: 'Querétaro, North America',
    videoId: '0bUlKQ-lIZs',
    line: 'Closed-loop color across a global packaging leader’s production.',
  },
  {
    company: 'Moderna Printing',
    place: 'Belgium, worldwide reference',
    videoId: 'vYN1mjCK9VU',
    line: 'Reduced waste and smarter startups on heatset web production.',
  },
];

// Educational content that matters to a North American buyer.
const ARTICLES = [
  {
    title: 'G7 vs ISO 12647',
    line: 'Two ways to standardize offset color, and how to combine them.',
    image: '/images/blog/photo-g7-vs-iso-12647-offset-color.jpg',
    href: '/blog/g7-vs-iso-12647-offset-color',
  },
  {
    title: 'DeltaE: what tolerance is acceptable?',
    line: 'Realistic targets for process and brand colors, and how to hold them.',
    image: '/images/blog/photo-delta-e-tolerance-print-guide.jpg',
    href: '/blog/delta-e-tolerance-print-guide',
  },
  {
    title: 'Reduce makeready waste: 10 levers',
    line: 'From CIP3 presetting to closed-loop, with the savings math.',
    image: '/images/blog/photo-reduce-makeready-waste-offset-press.jpg',
    href: '/blog/reduce-makeready-waste-offset-press',
  },
];

const PROCESS = [
  {
    title: 'Rutherford Check',
    body: 'Send a few photos of your console. We confirm eligibility of your press and ink key system within one business day, free.',
  },
  {
    title: 'Configure and install',
    body: 'Your setup is assessed for compatibility, the ideal configuration is designed, and measurable performance targets are set before installation.',
  },
  {
    title: 'Prove and support',
    body: 'Installation, operator training and validated results. Targets not met? You can stop. Annual audits keep the performance.',
  },
];

const INCLUDED = [
  'Rutherford ColorLoop closed-loop software',
  'CIP3 / CIP4 ink key presetting',
  'Works with IntelliTrax2 and MeasureColor',
  'Professional installation and operator training',
  'Rutherford Academy courses, open to everyone',
  'Annual performance audit, included',
];

const FAQ = [
  {
    q: 'Does ColorLoop support G7 workflows?',
    a: 'Yes. ColorLoop holds gray balance and density targets sheet after sheet and tracks DeltaE against the reference, whether your shop is anchored to G7, ISO 12647 or a brand-specific standard. Every run is documented for the audit trail.',
  },
  {
    q: 'Which presses qualify?',
    a: 'Rutherford retrofits closed-loop color to most sheetfed offset presses with motorized ink keys: Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi, Ryobi and more, new or decades old. The free Rutherford Check confirms your console in about two minutes.',
  },
  {
    q: 'Do I need to replace my measurement hardware?',
    a: 'No. ColorLoop works with the X-Rite measurement most US pressrooms already own, IntelliTrax2 and MeasureColor included. Your existing investment becomes the sensor of the loop.',
  },
  {
    q: 'How is this different from buying a new press?',
    a: 'Offset360-class closed-loop adds connected measurement and automatic ink key correction to the press you already own. You get the color performance of a new press console for a fraction of the cost, with flexible financing.',
  },
  {
    q: 'How do I get started?',
    a: 'Run the free Rutherford Check: a few photos of your console, an answer within one business day. If your press qualifies, we design the configuration and set measurable targets before anything is installed.',
  },
];

export function NorthAmericaPage({ country }: { country: Country }) {
  const rootRef = useRef<HTMLElement>(null);
  const c = COUNTRY[country];

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
  }, []);

  return (
    <main className="page-shell o360" ref={rootRef}>
      <SiteNav current="home" />

      {/* Hero */}
      <section className="o360-section">
        <div className="o360-narrow">
          <p className="o360-eyebrow">{c.eyebrow}</p>
          <span className="o360-hero-logo o360-hero-logo-cl">
            <img src="/images/colorloop-logo-black.png" alt="ColorLoop" />
          </span>
          <h1 className="o360-h1">
            <TypeOn text="ColorLoop.ai" />
          </h1>
          <p className="o360-lede">{c.lede}</p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href="#film">Watch the film</a>
            <a className="o360-btn o360-btn-ghost" href="https://form.typeform.com/to/LZtPUH" target="_blank" rel="noreferrer">
              Talk to an expert
            </a>
          </div>
        </div>
      </section>

      {/* Film */}
      <section id="film" className="o360-section" style={{ paddingTop: 0 }}>
        <div className="o360-container">
          <div className="o360-video-wrap">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${FILM_ID}?rel=0&modestbranding=1`}
              title="ColorLoop, closed-loop color for sheetfed offset"
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
          <p className="o360-eyebrow">The real bottleneck</p>
          <h2>
            The press is rarely the problem. <em>The measurement in front of it is.</em>
          </h2>
          <p>
            Outdated or closed OEM measurement means unstable color, wasted sheets and longer makereadies on every shift.
            ColorLoop replaces guesswork with a connected, press-side loop, without buying a new press.
          </p>
        </div>
        <div className="o360-container">
          <figure className="o360-photo o360-reveal">
            <img src="/images/stopplayingpiano-operator.jpg" alt="Operator checking a printed sheet at the press console" loading="lazy" />
          </figure>
        </div>
      </section>

      {/* What it is */}
      <section className="o360-section">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">The idea</p>
          <h2 className="o360-h2">One closed loop. Any press.</h2>
          <p className="o360-lede">
            The Rutherford software that closes the loop, working with the X-Rite measurement tools North American pressrooms already run, plus expert support to keep it performing.
          </p>
        </div>
      </section>

      {/* Bundle cards, ColorLoop first */}
      <section className="o360-section" style={{ paddingTop: 0 }}>
        <div className="o360-container">
          <div className="o360-bundle">
            {BUNDLE.map((item, i) => (
              <article className="o360-card o360-reveal" key={item.name} style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="o360-card-media">
                  <img src={item.image} alt={item.imageAlt} loading="lazy" />
                </div>
                <div className="o360-card-body">
                  <div className="o360-card-vendor">
                    <img src={item.vendorLogo} alt={item.vendorAlt} />
                  </div>
                  <h3 className="o360-h3">{item.name}</h3>
                  <p className="o360-card-role">{item.role}</p>
                  <p>{item.description}</p>
                  <a
                    className="o360-card-link"
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noreferrer' : undefined}
                  >
                    Learn more
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Deep-dive feature rows */}
      <section className="o360-section o360-quiet">
        {FEATURES.map((f, i) => (
          <div className={`o360-feature o360-reveal ${i % 2 === 1 ? 'is-reverse' : ''}`} key={f.image}>
            <div className="o360-feature-media">
              <img src={f.image} alt={f.imageAlt} loading="lazy" />
            </div>
            <div className="o360-feature-copy">
              <div className="o360-feature-eyebrow">
                <img src={f.vendorLogo} alt={f.vendorAlt} />
                <span>{f.eyebrow}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              <ul className="o360-chips">
                {f.chips.map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
              </ul>
              <a
                className="o360-feature-link"
                href={f.href}
                target={f.external ? '_blank' : undefined}
                rel={f.external ? 'noreferrer' : undefined}
              >
                Learn more
              </a>
            </div>
          </div>
        ))}
      </section>

      {/* How the loop works */}
      <section className="o360-section">
        <div className="o360-container">
          <div className="o360-narrow o360-reveal" style={{ marginBottom: 16 }}>
            <p className="o360-eyebrow">How it works</p>
            <h2 className="o360-h2">The ColorLoop loop.</h2>
          </div>
          <ol className="o360-steps">
            {STEPS.map((s, i) => (
              <li className="o360-step o360-reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="o360-step-num">{STEP_NUMS[i]}</span>
                <div className="o360-step-body">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ROI band, USD */}
      <section className="o360-section o360-band">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">Return on investment</p>
          <p className="o360-band-stat">
            <CountUp prefix="up to " value={60} suffix="%" duration={1600} />
          </p>
          <p className="o360-band-sub">
            less upfront cost than a new measurement system. ColorLoop modernizes color control with flexible financing, without investing in a new press. Figures below in USD.
          </p>
          <div className="o360-numbers">
            {NUMBERS.map((n, i) => (
              <div className="o360-number o360-reveal" key={i} style={{ transitionDelay: `${i * 90}ms` }}>
                <strong>
                  <CountUp prefix={n.prefix} value={n.value} suffix={n.suffix} />
                </strong>
                <span>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="o360-container o360-roi o360-reveal">
          <ColorLoopROI currency="USD" />
        </div>
      </section>

      {/* North American proof */}
      <section className="o360-section o360-quiet">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">Proof, from the pressroom floor</p>
          <h2 className="o360-h2">They run the loop every shift.</h2>
          <p className="o360-lede">{c.proofLede}</p>
        </div>
        <div className="o360-container">
          <div className="o360-bundle">
            {TESTIMONIALS.map((v, i) => (
              <article className="o360-card o360-reveal" key={v.videoId} style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="o360-card-media">
                  <img src={`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`} alt={`${v.company} testimonial video`} loading="lazy" />
                </div>
                <div className="o360-card-body">
                  <h3 className="o360-h3">{v.company}</h3>
                  <p className="o360-card-role">{v.place}</p>
                  <p>{v.line}</p>
                  <a className="o360-card-link" href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noreferrer">
                    Watch testimonial
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Learn: blog articles */}
      <section className="o360-section">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">Go deeper</p>
          <h2 className="o360-h2">Color, explained for the pressroom.</h2>
        </div>
        <div className="o360-container">
          <div className="o360-bundle">
            {ARTICLES.map((a, i) => (
              <article className="o360-card o360-reveal" key={a.href} style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="o360-card-media">
                  <img src={a.image} alt={a.title} loading="lazy" />
                </div>
                <div className="o360-card-body">
                  <p className="o360-card-role">From the blog</p>
                  <h3 className="o360-h3">{a.title}</h3>
                  <p>{a.line}</p>
                  <a className="o360-card-link" href={a.href}>
                    Read the article
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment */}
      <section className="o360-section o360-quiet">
        <div className="o360-container">
          <div className="o360-narrow o360-reveal" style={{ marginBottom: 0 }}>
            <p className="o360-eyebrow">Getting started</p>
            <h2 className="o360-h2">A guided deployment, not a drop shipment.</h2>
          </div>
          <div className="o360-process">
            {PROCESS.map((p, i) => (
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
            <p className="o360-eyebrow">What you get</p>
            <h2 className="o360-h2">Everything to run the closed loop.</h2>
          </div>
          <ul className="o360-included">
            {INCLUDED.map((item, i) => (
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
            Open and flexible by design. ColorLoop runs with <strong>all press brands and all workflows</strong>, no vendor lock-in, no rip-and-replace.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="o360-section o360-quiet">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">ColorLoop in North America, FAQ</p>
          <h2 className="o360-h2">Straight answers.</h2>
          <div className="o360-faq">
            {FAQ.map((f) => (
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
          <p className="o360-eyebrow">Next step</p>
          <h2 className="o360-h2">Stop losing money on every makeready.</h2>
          <p>{c.ctaBody}</p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href="/console-validation">
              Check your press, free
            </a>
            <a className="o360-btn o360-btn-ghost" href="https://colorloop.ai/" target="_blank" rel="noreferrer">
              Discover ColorLoop
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
