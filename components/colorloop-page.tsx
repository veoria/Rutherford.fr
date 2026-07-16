'use client';

import '@/app/offset360/offset360.css';
import { useEffect, useRef, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { ColorLoopROI } from '@/components/colorloop-roi';
import { COLORLOOP_FAQ } from '@/data/colorloop-faq';

// ColorLoop product page (/colorloop). Content migrated from the WordPress
// site that used to live at colorloop.ai (the domain itself becomes the user
// platform: portal + ColorConnect). Same design system as offset360 and the
// NA landings, English-only.

const FILM_ID = '7X0fOMXK72Y';
const DEMO_URL = 'https://form.typeform.com/to/LZtPUH';

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

const STEPS = [
  { title: 'Quick job selection', body: 'Browse jobs visually like album covers, or scan a MeasureColor QR code. Fast, intuitive, no typing.' },
  { title: 'Automatic MeasureColor setup', body: 'The job is created with color mapping and colorbar detection, automatically.' },
  { title: 'AI-guided makeready', body: 'Real-time optimization with adaptive corrections, pull after pull.' },
  { title: 'Automatic learning', body: 'The system validates and saves data only when color is stable. Every makeready smarter than the last.' },
];

const FEATURES = [
  {
    eyebrow: 'Job selection',
    title: 'Pick the job. ColorLoop does the setup.',
    body:
      'Operators browse jobs visually, like album covers, or scan the MeasureColor QR code on the job ticket. ColorLoop creates the job with color mapping and colorbar detection in about 30 seconds, versus 10 minutes and more of manual setup.',
    chips: ['Visual job browser', 'MeasureColor QR scan', '30-second setup', 'No typing'],
    image: '/images/colorloop/presetjob-lenovo.png',
    imageAlt: 'ColorLoop visual job selection screen',
    href: DEMO_URL,
    external: true,
    linkLabel: 'Book a demo',
  },
  {
    eyebrow: 'AI-guided makeready',
    title: 'Adaptive corrections that learn your press.',
    body:
      'During makeready, ColorLoop optimizes in real time with adaptive corrections. The AI validates and saves data only when color is stable, so the system learns continuously from real production, not from theory. Windows 11 native, with a modern interface operators actually enjoy.',
    chips: ['Adaptive corrections', 'True AI learning', 'Windows 11 native', 'Modern, intuitive UI'],
    image: '/images/colorloop/colorloop-mockup.png',
    imageAlt: 'ColorLoop AI-guided makeready interface',
    href: DEMO_URL,
    external: true,
    linkLabel: 'Book a demo',
  },
  {
    eyebrow: 'Ecosystem',
    title: 'Complete MeasureColor and IntelliTrax2 integration.',
    body:
      'ColorLoop is the only AI-powered color control software built specifically for offset sheetfed printing with complete MeasureColor integration. It runs with the IntelliTrax2 scanning your pressroom may already own, on virtually all sheetfed presses, from 30-year-old machines to current models.',
    chips: ['MeasureColor', 'IntelliTrax2', 'All press brands', 'Offset360 bundle'],
    image: '/images/colorloop/colorloop-lenovo.png',
    imageAlt: 'ColorLoop running on the press-side console',
    href: '/offset360',
    external: false,
    linkLabel: 'Discover Offset360',
  },
];

const NUMBERS: { prefix: string; value: number; suffix: string; label: string }[] = [
  { prefix: '', value: 30, suffix: ' s', label: 'Automatic setup' },
  { prefix: '− ', value: 65, suffix: ' %', label: 'Waste, up to' },
  { prefix: '− ', value: 45, suffix: ' %', label: 'Makeready time, up to' },
  { prefix: '', value: 150, suffix: ' k€', label: 'Annual savings, up to' },
];

const STEP_NUMS = ['01', '02', '03', '04'];

const VERSIONS = [
  {
    name: 'ColorLoop Standard',
    role: 'For commercial printers',
    description:
      'Brochures, magazines and catalogs. CMYK plus one or two spot colors on standard papers. Runs with MeasureColor and IntelliTrax2.',
    highlights: ['CMYK + 1-2 spot colors', 'Standard papers', 'MeasureColor + IntelliTrax2'],
  },
  {
    name: 'ColorLoop Pack',
    role: 'For packaging printers',
    description:
      'Folding carton and labels. Heavy PANTONE and special colors (3+ spots), opaque white control, ECG optimization, and diverse substrates: metallic, transparent, boards.',
    highlights: ['3+ spot colors, PANTONE fine-tuning', 'Opaque white control', 'Metallic, transparent, boards'],
  },
  {
    name: 'ColorLoop Upgrade',
    role: 'For existing Rutherford customers',
    description:
      'For EasySet-EasyLoop and IntelliSet-IntelliLoop users: keep your hardware and get automatic MeasureColor integration, autosetup, adaptive corrections and a modern Windows 11 interface, without reinstalling.',
    highlights: ['Keep your hardware', 'Instant software activation', 'Modern UI, Windows 11'],
  },
];

const INCLUDED = [
  'Software license and all updates',
  'Technical support',
  'Annual service care with the Offset360 bundle',
  'Year-by-year subscription, no multi-year lock-in',
  'Cancel anytime after the first year, 30 days notice',
  'Video tutorials and documentation, most operators learn it in hours',
];

export function ColorLoopPage() {
  const rootRef = useRef<HTMLElement>(null);

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
      <SiteNav current="home" brand="colorloop" />

      {/* Hero */}
      <section className="o360-section">
        <div className="o360-narrow">
          <p className="o360-eyebrow">AI-powered color control for offset printing</p>
          <span className="o360-hero-logo o360-hero-logo-cl">
            <img src="/images/colorloop-logo-black.png" alt="ColorLoop" />
          </span>
          <h1 className="o360-h1">
            <TypeOn text="ColorLoop.ai" />
          </h1>
          <p className="o360-lede">
            Automatic color optimization for offset sheetfed printing. ColorLoop automates setup, optimizes makeready and learns continuously, cutting waste by up to 65% and makeready time by up to 45%.
          </p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href={DEMO_URL} target="_blank" rel="noreferrer">Book a demo</a>
            <a className="o360-btn o360-btn-ghost" href="#film">Watch the film</a>
          </div>
        </div>
      </section>

      {/* Film */}
      <section id="film" className="o360-section" style={{ paddingTop: 0 }}>
        <div className="o360-container">
          <div className="o360-video-wrap">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${FILM_ID}?rel=0&modestbranding=1`}
              title="ColorLoop, AI-powered closed loop color for sheetfed offset"
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
          <p className="o360-eyebrow">The problem</p>
          <h2>
            Stop losing time and money <em>on manual setup.</em>
          </h2>
          <p>
            Manual color setup, substrate waste and long makereadies quietly cost a pressroom 60,000 to 150,000 euros a year.
            ColorLoop eliminates all three: 30-second automatic setup, adaptive corrections during the run, and a system that learns your press job after job.
          </p>
        </div>
        <div className="o360-container">
          <figure className="o360-photo o360-reveal">
            <img src="/images/colorloop/dsc7179.jpg" alt="Operator checking a printed sheet at the press console" loading="lazy" />
          </figure>
        </div>
      </section>

      {/* How it works */}
      <section className="o360-section">
        <div className="o360-container">
          <div className="o360-narrow o360-reveal" style={{ marginBottom: 16 }}>
            <p className="o360-eyebrow">How it works</p>
            <h2 className="o360-h2">From manual complexity to automated simplicity.</h2>
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

      {/* Deep-dive feature rows */}
      <section className="o360-section o360-quiet">
        {FEATURES.map((f, i) => (
          <div className={`o360-feature o360-reveal ${i % 2 === 1 ? 'is-reverse' : ''}`} key={f.image}>
            <div className="o360-feature-media">
              <img src={f.image} alt={f.imageAlt} loading="lazy" />
            </div>
            <div className="o360-feature-copy">
              <div className="o360-feature-eyebrow">
                <img src="/images/colorloop-logo-black.png" alt="ColorLoop" />
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
                {f.linkLabel}
              </a>
            </div>
          </div>
        ))}
      </section>

      {/* Numbers + ROI band */}
      <section className="o360-section o360-band">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">Proven results in production</p>
          <p className="o360-band-stat">
            <CountUp prefix="up to − " value={65} suffix="%" duration={1600} />
          </p>
          <p className="o360-band-sub">
            waste on offset sheetfed production. Put your own numbers on it with the estimator below.
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
          <ColorLoopROI />
        </div>
      </section>

      {/* Versions */}
      <section className="o360-section">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">Choose your ColorLoop version</p>
          <h2 className="o360-h2">Standard, Pack or Upgrade.</h2>
          <p className="o360-lede">
            Same core automation in every version. Pick the one that matches your production, with a no-commitment, year-by-year subscription.
          </p>
        </div>
        <div className="o360-container">
          <div className="o360-bundle">
            {VERSIONS.map((v, i) => (
              <article className="o360-card o360-reveal" key={v.name} style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="o360-card-body">
                  <div className="o360-card-vendor">
                    <img src="/images/colorloop-logo-black.png" alt="ColorLoop" />
                  </div>
                  <h3 className="o360-h3">{v.name}</h3>
                  <p className="o360-card-role">{v.role}</p>
                  <p>{v.description}</p>
                  <ul className="o360-chips">
                    {v.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  <a className="o360-card-link" href={DEMO_URL} target="_blank" rel="noreferrer">
                    Request pricing
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="o360-section o360-quiet">
        <div className="o360-feature o360-reveal">
          <div className="o360-feature-media is-vertical">
            <iframe
              src="https://www.youtube-nocookie.com/embed/rdwFGOICawE?rel=0&modestbranding=1"
              title="Imprimerie Berger, ColorLoop testimonial"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="o360-feature-copy">
            <div className="o360-feature-eyebrow">
              <img src="/images/rutherford-logo-black.png" alt="Rutherford" />
              <span>From the pressroom floor</span>
            </div>
            <h3>Imprimerie Berger: faster color, less trial and error.</h3>
            <p>
              At Imprimerie Berger, ColorLoop transformed makeready on a Heidelberg 4-color offset press, delivering faster color stabilization with IntelliTrax2 and MeasureColor. Operators prefer the modern UI, IT validates the system, and the team gets to color faster, with less trial and error.
            </p>
            <ul className="o360-chips">
              <li>Heidelberg 4-color</li>
              <li>IntelliTrax2 + MeasureColor</li>
              <li>Faster color stabilization</li>
            </ul>
            <a className="o360-feature-link" href="https://www.youtube.com/@rutherfordfr" target="_blank" rel="noreferrer">
              Watch the testimonials
            </a>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="o360-section">
        <div className="o360-container">
          <div className="o360-narrow o360-reveal" style={{ marginBottom: 0 }}>
            <p className="o360-eyebrow">Subscription</p>
            <h2 className="o360-h2">Everything included, no lock-in.</h2>
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

      {/* FAQ */}
      <section className="o360-section o360-quiet">
        <div className="o360-narrow o360-reveal">
          <p className="o360-eyebrow">ColorLoop FAQ</p>
          <h2 className="o360-h2">Straight answers.</h2>
          <div className="o360-faq">
            {COLORLOOP_FAQ.map((f) => (
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
          <p className="o360-eyebrow">Scan. Automate. Print.</p>
          <h2 className="o360-h2">Stop losing. Start automating.</h2>
          <p>
            30-second automatic setup instead of 10+ minutes, up to 65% less waste, up to 150,000 euros saved every year. Check free of charge whether your press qualifies: a few photos of your console, an answer within one business day.
          </p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href="/console-validation">
              Check your press, free
            </a>
            <a className="o360-btn o360-btn-ghost" href={DEMO_URL} target="_blank" rel="noreferrer">
              Book a demo
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
