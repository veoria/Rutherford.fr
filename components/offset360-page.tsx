'use client';

import { useEffect, useRef, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';

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

type BundleComponent = {
  name: string;
  vendorLogo: string;
  vendorAlt: string;
  role: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  external: boolean;
};

const bundleComponents: BundleComponent[] = [
  {
    name: 'IntelliTrax2',
    vendorLogo: '/images/xrite-logo-black.png',
    vendorAlt: 'X-Rite',
    role: 'Press-side scanning',
    description:
      'The first desktop automated scanning system. Reads a full color bar in under ten seconds, bars down to 2 mm, contactless.',
    image: '/images/intellitrax2-clean.jpg',
    imageAlt: 'IntelliTrax2 scanner',
    href: 'https://www.xrite.com/categories/scanning-instruments/intellitrax2',
    external: true,
  },
  {
    name: 'MeasureColor',
    vendorLogo: '/images/xrite-logo-black.png',
    vendorAlt: 'X-Rite',
    role: 'Process control & reporting',
    description:
      'One platform for offset, flexo and digital. Real-time ΔE, ChromaTrack ink-density guidance, audit-ready reports.',
    image: '/images/Hugues on console press offset.jpg',
    imageAlt: 'Operator running MeasureColor at the press console',
    href: 'https://www.xrite.com/categories/formulation-and-quality-assurance-software/measurecolor-production',
    external: true,
  },
  {
    name: 'Rutherford ColorLoop',
    vendorLogo: '/images/rutherford-logo-black.png',
    vendorAlt: 'Rutherford',
    role: 'Closed-loop presetting',
    description:
      'Turns measurement data into ink-key corrections and pushes them to the console. The loop closes, automatically.',
    image: '/images/Imac CGS Colorloop Graphic Studio.jpg',
    imageAlt: 'Rutherford ColorLoop on an iMac',
    href: '/#colorloop',
    external: false,
  },
];

type Feature = {
  vendorLogo: string;
  vendorAlt: string;
  eyebrow: string;
  title: string;
  body: string;
  chips: string[];
  image: string;
  imageAlt: string;
  href: string;
  external: boolean;
  reverse?: boolean;
};

const features: Feature[] = [
  {
    vendorLogo: '/images/xrite-logo-black.png',
    vendorAlt: 'X-Rite',
    eyebrow: 'Reading',
    title: 'IntelliTrax2 reads the sheet, not the operator’s eye.',
    body:
      'A desktop automated spectrophotometer that scans the full control strip across the sheet in seconds. Contactless optics prevent smudges and scratches, a look-ahead sensor aligns the bar automatically, and every zone is captured under M0, M1 or M3 in a single pass.',
    chips: ['Scan < 10 s', 'Bars from 2 mm', '45°/0° geometry', 'M0 / M1 / M3', 'Inter-instrument 0.3 ΔE avg', 'Non-contact'],
    image: '/images/intellitrax2-3.jpg',
    imageAlt: 'IntelliTrax2 scanning a printed sheet',
    href: 'https://www.xrite.com/categories/scanning-instruments/intellitrax2',
    external: true,
  },
  {
    vendorLogo: '/images/xrite-logo-black.png',
    vendorAlt: 'X-Rite',
    eyebrow: 'Process control',
    title: 'MeasureColor turns measurements into decisions.',
    body:
      'A client-server platform unifying offset, flexo and digital. ChromaTrack calculates the optimal ink-density correction and the expected ΔE before the operator touches a key. Jobs set up in under 30 seconds, and quality data flows into customizable, audit-ready reports, your data, on your server.',
    chips: ['Job setup < 30 s', 'Real-time ΔE / density', 'ChromaTrack guidance', 'PQX · CXF · CGATS export', 'Offset · flexo · digital'],
    image: '/images/Bundle Rutherford-4.jpg',
    imageAlt: 'Offset360 bundle in a Rutherford pressroom',
    href: 'https://www.xrite.com/categories/formulation-and-quality-assurance-software/measurecolor-production',
    external: true,
    reverse: true,
  },
  {
    vendorLogo: '/images/rutherford-logo-black.png',
    vendorAlt: 'Rutherford',
    eyebrow: 'Closed loop',
    title: 'Rutherford ColorLoop closes the loop on the console.',
    body:
      'CIP3 / CIP4 presets load before the press starts. As IntelliTrax2 and MeasureColor read and compare, ColorLoop converts the deltas into ink-key corrections and pushes them straight to the console. The operator validates, and the press holds color through the run, on any major press brand.',
    chips: ['CIP3 / CIP4 presetting', 'Automatic ink-key correction', 'Heidelberg · Komori · KBA · Manroland', 'Press-agnostic'],
    image: '/images/colorloop-screen.gif',
    imageAlt: 'Rutherford ColorLoop interface in action',
    href: '/#colorloop',
    external: false,
  },
];

const numbers: { prefix: string; value: number; suffix: string; label: string }[] = [
  { prefix: '− ', value: 50, suffix: ' %', label: 'Makeready waste' },
  { prefix: '− ', value: 30, suffix: ' %', label: 'Setup time' },
  { prefix: 'ΔE < ', value: 2, suffix: '', label: 'In-run color stability' },
  { prefix: '', value: 100, suffix: ' %', label: 'Traceable sheets' },
];

const steps: { num: string; title: string; body: string }[] = [
  { num: '01', title: 'Preset', body: 'CIP3 / CIP4 ink-key presets load automatically. No manual punch-in.' },
  { num: '02', title: 'Scan', body: 'IntelliTrax2 reads the color bar across the sheet in seconds.' },
  { num: '03', title: 'Compare', body: 'MeasureColor computes ΔE against the brand reference and flags out-of-tolerance zones.' },
  { num: '04', title: 'Correct', body: 'ColorLoop pushes the corrections to the console. The operator validates. The loop closes.' },
];

const process: { step: string; title: string; body: string }[] = [
  {
    step: '1',
    title: 'Connect & collaborate',
    body: 'X-Rite color experts and Rutherford map your production objectives and your real color challenges, together.',
  },
  {
    step: '2',
    title: 'Assess & configure',
    body: 'Your current setup is evaluated for compatibility, the ideal configuration is designed, and measurable performance targets are set.',
  },
  {
    step: '3',
    title: 'Proof of concept & support',
    body: 'Installation, team training and results validation. Targets not met? You can stop. Annual audits keep performance on track.',
  },
];

const included: string[] = [
  'IntelliTrax2 scanning system',
  'MeasureColor process-control software',
  'Rutherford ColorLoop closed-loop technology',
  'Expert color-consultant support',
  'Annual performance audit, included',
  'Professional installation & training',
];

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Offset360Page() {
  const rootRef = useRef<HTMLElement>(null);

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
          <a className="o360-hero-logo" href={XRITE_OFFSET360_URL} target="_blank" rel="noreferrer" aria-label="X-Rite">
            <img src="/images/xrite-logo-black.png" alt="X-Rite" />
          </a>
          <h1 className="o360-h1">Offset360</h1>
          <p className="o360-lede">
            The closed-loop bundle for sheetfed offset. Scan, compare, correct, without leaving the console.
          </p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href="#film">Watch the film</a>
            <a className="o360-btn o360-btn-ghost" href="https://form.typeform.com/to/LZtPUH" target="_blank" rel="noreferrer">
              Talk to an expert
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
              title="Offset360, closed-loop color for sheetfed offset"
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
            Often the problem isn’t the press. <em>It’s the reading system in front of it.</em>
          </h2>
          <p>
            Obsolete or closed OEM measurement tools leave color inconsistent, waste material and stretch every makeready.
            Offset360 replaces guesswork with a connected, press-side reading system, without buying a new press.
          </p>
        </div>
      </section>

      {/* What it is */}
      <section className="o360-section">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">The idea</p>
          <h2 className="o360-h2">Three pieces. One loop.</h2>
          <p className="o360-lede">
            Two best-in-class X-Rite products and one Rutherford software, combined into a single workflow, plus the expert
            support to keep it performing.
          </p>
        </div>
      </section>

      {/* Bundle cards */}
      <section className="o360-section" style={{ paddingTop: 0 }}>
        <div className="o360-container">
          <div className="o360-bundle">
            {bundleComponents.map((item, i) => (
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
        {features.map((f) => (
          <div className={`o360-feature o360-reveal ${f.reverse ? 'is-reverse' : ''}`} key={f.title}>
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
                {f.chips.map((c) => (
                  <li key={c}>{c}</li>
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

      {/* How it works */}
      <section className="o360-section">
        <div className="o360-container">
          <div className="o360-narrow o360-reveal" style={{ marginBottom: 16 }}>
            <p className="o360-eyebrow">How it runs</p>
            <h2 className="o360-h2">The Offset360 loop.</h2>
          </div>
          <ol className="o360-steps">
            {steps.map((s, i) => (
              <li className="o360-step o360-reveal" key={s.num} style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="o360-step-num">{s.num}</span>
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
          <p className="o360-eyebrow">Return on investment</p>
          <p className="o360-band-stat">
            <CountUp prefix="up to " value={60} suffix="%" duration={1600} />
          </p>
          <p className="o360-band-sub">
            lower initial cost than a new measurement setup, Offset360 modernizes color control through flexible financing,
            with no new-press investment.
          </p>
          <div className="o360-numbers">
            {numbers.map((n, i) => (
              <div className="o360-number o360-reveal" key={n.label} style={{ transitionDelay: `${i * 90}ms` }}>
                <strong>
                  <CountUp prefix={n.prefix} value={n.value} suffix={n.suffix} />
                </strong>
                <span>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation process */}
      <section className="o360-section o360-quiet">
        <div className="o360-container">
          <div className="o360-narrow o360-reveal" style={{ marginBottom: 0 }}>
            <p className="o360-eyebrow">How we deploy it</p>
            <h2 className="o360-h2">A guided rollout, not a drop-shipment.</h2>
          </div>
          <div className="o360-process">
            {process.map((p, i) => (
              <div className="o360-process-card o360-reveal" key={p.step} style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="o360-process-step">{p.step}</span>
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
            <p className="o360-eyebrow">What’s included</p>
            <h2 className="o360-h2">Everything to run a closed loop.</h2>
          </div>
          <ul className="o360-included">
            {included.map((item, i) => (
              <li key={item} className="o360-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
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
            Open and flexible by design. Offset360 works with <strong>any press brand and any workflow</strong>, no vendor
            lock-in, no rip-and-replace.
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="o360-section">
        <div className="o360-narrow o360-end o360-reveal">
          <p className="o360-eyebrow">Next step</p>
          <h2 className="o360-h2">Get it on your press.</h2>
          <p>
            Send a few photos of your console, we come back with an Offset360 scope tailored to your machines and brand standards.
          </p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href="/console-validation">
              Request console validation
            </a>
            <a className="o360-btn o360-btn-ghost" href={XRITE_OFFSET360_URL} target="_blank" rel="noreferrer">
              Learn more on X-Rite
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
