'use client';

import '@/app/offset360/offset360.css';
import './colorconnect-page.css';
import { useEffect, useRef, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';

// Preview build: the two FX films are served from a temporary bucket. Once the
// films are on the Rutherford YouTube channel, swap these for embeds.
const MEDIA = 'https://pub-715a909e95e0404594d92f720b5cc4dc.r2.dev/preview/colorconnect';
const IMG = '/images/colorconnect';
const DEMO_URL = 'https://form.typeform.com/to/LZtPUH';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Focus = { x: number; y: number; w: number; h: number };
type Step = {
  screens: string[];
  alt: string;
  title: string;
  body: string;
  tag: string;
  focus: Focus; // area of interest, in % of the screen image
};

// Real ColorConnect screens from the demo recording (demo data only), fitted to
// the MacBook Pro display. Focus areas point at what the text talks about.
const TOUR: Step[] = [
  {
    screens: ['tour16-jobs.webp'],
    alt: 'ColorConnect production jobs: each job with its preview, press, plates and ink use',
    title: 'Every job, prepared.',
    body: 'Prepress drops the files in a folder, as today. ColorConnect builds each job with its preview, inks and ink coverage.',
    tag: 'Job created from the prepress folder',
    focus: { x: 14.9, y: 20.3, w: 27, h: 43.8 },
  },
  {
    screens: ['tour16-offset.webp'],
    alt: 'An offset job in ColorConnect: press, schedule, substrate and ink per color',
    title: 'Ready for the offset press.',
    body: 'Press, schedule, substrate and ink per color. At the console, ColorLoop finds the same job, with nothing to retype.',
    tag: 'Ink per color, ready for the preset',
    focus: { x: 14.6, y: 67.6, w: 83.8, h: 28.8 },
  },
  {
    screens: ['tour16-zones-1.webp', 'tour16-zones-3.webp'],
    alt: 'Ink zones of each measured sheet: mostly red and yellow on sheet 1, mostly green on sheet 3',
    title: 'Sheet after sheet, into tolerance.',
    body: 'Every ink zone of every measured sheet. ColorLoop corrects after each measurement, and the job keeps the whole history.',
    tag: 'From sheet 1 to sheet 3',
    focus: { x: 14.6, y: 5.5, w: 84, h: 90 },
  },
  {
    screens: ['tour16-flexo.webp'],
    alt: 'A flexo job measured inline by DeltaOne: ΔE per ink and the score along the run',
    title: 'Flexo, measured inline.',
    body: 'DeltaOne measures the running web. ΔE per ink, speed and every measurement stay with the job.',
    tag: '0 of 6 inks out of tolerance',
    focus: { x: 14.6, y: 51.9, w: 50, h: 9.2 },
  },
  {
    screens: ['tour16-inks.webp'],
    alt: 'The ink and substrate library with compliance columns for each ink',
    title: 'Inks and substrates, documented.',
    body: 'Each ink carries its composition and compliance data. When a color in a formulation is not compliant, you see it at once.',
    tag: 'PFAS, heavy metals and food contact, per ink',
    focus: { x: 64, y: 31.1, w: 8, h: 60.7 },
  },
  {
    screens: ['tour16-ppwr.webp'],
    alt: 'ColorConnect PPWR compliance: job compliance and ink records',
    title: 'Evidence from your own jobs.',
    body: 'A PPWR evaluation per job and the Digital Product Passport, from data your production already creates. ColorConnect helps you prepare evidence. It does not certify.',
    tag: 'Compliance per job, from its inks',
    focus: { x: 14.6, y: 35.2, w: 41.7, h: 26 },
  },
];

const CHAPTERS = [
  { t: 2, label: 'Every press on one screen' },
  { t: 58, label: 'Live status, speed and consumption' },
  { t: 149, label: 'The overview' },
  { t: 172, label: 'Projects and job scores' },
  { t: 296, label: 'Flexo, measured inline' },
  { t: 344, label: 'Control bars, built for each press' },
  { t: 440, label: 'Inks, substrates and PPWR' },
  { t: 476, label: 'Several plants, one system' },
];

const ESSENTIALS = [
  { title: 'In your print shop', body: 'A Windows workstation or server. Production files and customer data stay with you.' },
  { title: 'In any browser', body: 'Office, pressroom, tablet or phone. Accounts, roles and two-factor authentication.' },
  { title: 'In 8 languages', body: 'English, French, German, Spanish, Portuguese, Italian, Chinese and Thai.' },
];

const FAQ = [
  {
    q: 'Does ColorConnect measure or correct color?',
    a: 'No. ColorLoop presets and corrects the ink on sheetfed offset presses, and DeltaOne measures inline on flexo and label presses. ColorConnect prepares the jobs and brings their data back to your team.',
  },
  {
    q: 'Which presses can it connect?',
    a: 'Offset presses equipped with ColorLoop report color and production live. Flexo connections are confirmed for your presses during the project.',
  },
  {
    q: 'Does ColorConnect certify my packaging?',
    a: 'No. It helps you prepare the evidence your customers and the regulation ask for, from the data your production already creates. Compliance modules depend on your license.',
  },
  {
    q: 'What do we need to install it?',
    a: 'A Windows workstation or server in the print shop, prepress files dropped in a folder as today, and a web browser on the workstations that need it.',
  },
];

function fmt(t: number) {
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function Shot({ step, on }: { step: Step; on: boolean }) {
  const f = step.focus;
  return (
    <div
      className={`cc-shot${on ? ' is-on' : ''}${step.screens.length > 1 ? ' is-pair' : ''}`}
    >
      {step.screens.map((s, k) => (
        <img key={s} src={`${IMG}/${s}`} alt="" width={1600} height={900} className={k === 1 ? 'cc-shot-next' : undefined} loading="lazy" />
      ))}
      {step.screens.length === 1 && (
        <span className="cc-ring" style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%`, height: `${f.h}%` }} />
      )}
    </div>
  );
}

// The hero loop (18.5 s) has three passages; each caption says what the screen shows.
const DEMO_CAPTIONS = [
  { from: 0, to: 5.25, text: 'Every job arrives from prepress, with its inks.' },
  { from: 5.25, to: 11.75, text: 'Every ink key, live, sheet after sheet.' },
  { from: 11.75, to: 99, text: 'Every ink and substrate, checked for PPWR.' },
];

function SecureLock() {
  // The brushed-metal padlock from the home page: the shackle closes as the section scrolls in.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.setProperty('--open', '0');
      el.classList.add('is-locked');
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.55)));
      el.style.setProperty('--open', String(Math.pow(1 - p, 3)));
      // the "click": once the shackle is fully down, the body gives a short snap
      el.classList.toggle('is-locked', p >= 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="cc-lock" ref={ref} aria-hidden="true">
      <img className="cc-lock-shackle" src="/images/security/padlock-shackle.webp" alt="" width={1000} height={1000} loading="lazy" />
      <img className="cc-lock-body" src="/images/colorconnect/padlock-body-cc.webp" alt="" width={1000} height={1000} loading="lazy" />
    </div>
  );
}

export function ColorConnectPage() {
  const tutoRef = useRef<HTMLVideoElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const demoRef = useRef<HTMLVideoElement>(null);
  const [caption, setCaption] = useState(0);

  useEffect(() => {
    const els = stepRefs.current.filter(Boolean) as HTMLLIElement[];
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const seek = (t: number) => {
    const v = tutoRef.current;
    if (!v) return;
    v.currentTime = t;
    v.play().catch(() => {});
    v.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  };

  return (
    <main className="page-shell o360 cc">
      <SiteNav current="home" />

      {/* Hero */}
      <section className="o360-section cc-hero">
        <div className="o360-narrow">
          <span className="o360-hero-logo cc-hero-logo">
            <img src={`${IMG}/colorconnect.png`} alt="ColorConnect" width={1394} height={163} />
          </span>
          <h1 className="o360-h1 cc-h1">Your whole print shop on one screen.</h1>
          <p className="o360-lede cc-lede">
            The print shop portal for offset and flexo pressrooms. It prepares each job and follows production live, in any browser.
          </p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href={DEMO_URL} target="_blank" rel="noreferrer">Book a demo</a>
            <a className="o360-btn o360-btn-ghost" href="#film">Watch the pitch</a>
          </div>
        </div>
        <div className="cc-devices" aria-label="ColorConnect running on an iMac and an iPhone">
          <div className="cc-imac">
            <div className="cc-imac-screen">
              <video
                ref={demoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={`${IMG}/demo-loop-poster-v2.webp`}
                aria-label="ColorConnect in use: a job from prepress, the ink keys corrected live, the ink and substrate library"
                onTimeUpdate={(e) => {
                  const t = e.currentTarget.currentTime;
                  const i = DEMO_CAPTIONS.findIndex((c) => t >= c.from && t < c.to);
                  if (i !== -1 && i !== caption) setCaption(i);
                }}
              >
                <source src={`${MEDIA}/colorconnect-demo-loop-v2.mp4`} type="video/mp4" />
              </video>
              <p className="cc-demo-caption" aria-live="off">
                {DEMO_CAPTIONS.map((c, i) => (
                  <span key={c.text} className={i === caption ? 'is-on' : undefined}>
                    {c.text}
                  </span>
                ))}
              </p>
            </div>
            <img className="cc-imac-bezel" src={`${IMG}/device-imac-blue-bezel.webp`} alt="" width={1800} height={1532} />
          </div>
          <div className="cc-phone">
            <div className="cc-phone-screen">
              <img src={`${IMG}/phone-scroll.webp`} alt="A flexo job, production jobs and PPWR compliance on an iPhone" width={860} height={2993} />
            </div>
            <img className="cc-phone-bezel" src={`${IMG}/device-iphone-bezel.webp`} alt="" width={560} height={1145} />
          </div>
        </div>
      </section>

      {/* Pitch film */}
      <section id="film" className="o360-section o360-quiet">
        <div className="o360-narrow" style={{ marginBottom: 32 }}>
          <h2 className="o360-h2">Your print shop, in your hands.</h2>
          <p className="o360-lede">
            An alert on a press during a coffee break: makeready, or a real problem? FX answers from his tablet.
          </p>
        </div>
        <div className="o360-container">
          <div className="o360-video-wrap cc-video">
            <video controls playsInline preload="metadata" poster={`${MEDIA}/colorconnect-pitch-poster.webp`} aria-label="François-Xavier David presents ColorConnect, 49 seconds">
              <source src={`${MEDIA}/colorconnect-pitch-fx.mp4`} type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* One portal, three steps */}
      <section className="o360-section cc-portal">
        <div className="o360-narrow">
          <h2 className="o360-h2">One portal between prepress, presses and people.</h2>
        </div>
        <ol className="cc-steps3">
          <li>
            <img src={`${IMG}/render-prepress-v2.webp`} alt="" width={900} height={900} loading="lazy" />
            <h3>From prepress</h3>
            <p>Files dropped in a folder become jobs, with their inks and coverage.</p>
          </li>
          <li>
            <img src={`${IMG}/render-presses.webp`} alt="" width={900} height={900} loading="lazy" />
            <h3>To every press</h3>
            <p>Offset with ColorLoop, flexo with DeltaOne. Presets go out, live data comes back.</p>
          </li>
          <li>
            <img src={`${IMG}/render-team-v2.webp`} alt="" width={900} height={900} loading="lazy" />
            <h3>Back to your people</h3>
            <p>Your team on any screen, your customers through a secure link, PPWR evidence per job.</p>
          </li>
        </ol>
      </section>

      {/* Security: the padlock closes on scroll */}
      <section className="o360-section cc-secure">
        <div className="cc-secure-grid">
          <SecureLock />
          <div>
            <h2 className="o360-h2">All your data, secured.</h2>
            <p className="o360-lede">
              ColorConnect runs on your own server. Production files and customer data stay in your print shop.
            </p>
            <p className="cc-secure-note"><strong>Built for the EU Cyber Resilience Act (CRA).</strong></p>
          </div>
        </div>
      </section>

      {/* Screen tour */}
      <section className="o360-section o360-quiet cc-tour-section">
        <div className="o360-narrow" style={{ marginBottom: 24 }}>
          <h2 className="o360-h2">The software, screen by screen.</h2>
        </div>
        <div className="o360-container cc-story">
          <div className="cc-story-stage" aria-hidden="true">
            <div className="cc-imac cc-imac-tour">
              <div className="cc-imac-screen">
                {TOUR.map((s, i) => (
                  <Shot key={s.title} step={s} on={i === active} />
                ))}
                {TOUR.map((s, i) => (
                  <span key={s.tag} className={`cc-tag${i === active ? ' is-on' : ''}`}>
                    <i />
                    {s.tag}
                  </span>
                ))}
              </div>
              <img className="cc-imac-bezel" src={`${IMG}/device-imac-blue-bezel.webp`} alt="" width={1800} height={1532} />
            </div>
            <ol className="cc-story-dots">
              {TOUR.map((s, i) => (
                <li key={s.title} className={i === active ? 'is-on' : undefined} />
              ))}
            </ol>
          </div>
          <ol className="cc-story-steps">
            {TOUR.map((s, i) => (
              <li
                key={s.title}
                data-i={i}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className={i === active ? 'is-on' : undefined}
              >
                <figure className="cc-story-inline">
                  <img src={`${IMG}/${s.screens[s.screens.length - 1]}`} alt={s.alt} width={1600} height={900} loading="lazy" />
                </figure>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Full tour */}
      <section id="tour" className="o360-section">
        <div className="o360-narrow" style={{ marginBottom: 32 }}>
          <h2 className="o360-h2">The full tour, by FX.</h2>
          <p className="o360-lede">Eight minutes in front of the press floor screen. Pick a chapter.</p>
        </div>
        <div className="o360-container cc-tour">
          <div className="o360-video-wrap cc-video">
            <video ref={tutoRef} controls playsInline preload="none" poster={`${MEDIA}/colorconnect-tutorial-thumb.webp`} aria-label="ColorConnect tour by François-Xavier David, 8 minutes 35">
              <source src={`${MEDIA}/colorconnect-tutorial-fx.mp4`} type="video/mp4" />
            </video>
          </div>
          <nav className="cc-chapters" aria-label="Chapters">
            <ol>
              {CHAPTERS.map((c) => (
                <li key={c.t}>
                  <button type="button" onClick={() => seek(c.t)}>
                    <span className="cc-time">{fmt(c.t)}</span>
                    <span>{c.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* Essentials */}
      <section className="o360-section o360-quiet">
        <div className="o360-container">
          <ul className="cc-essentials">
            {ESSENTIALS.map((e) => (
              <li key={e.title}>
                <h3>{e.title}</h3>
                <p>{e.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="o360-section">
        <div className="o360-narrow">
          <h2 className="o360-h2">ColorConnect questions.</h2>
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

      {/* Closing */}
      <section className="o360-section o360-quiet">
        <div className="o360-narrow o360-end">
          <h2 className="o360-h2">See it on your own files.</h2>
          <p>
            A demo on your presses and your prepress files. ColorConnect and ColorLoop are sold by Rutherford.fr and developed by Veoria.
          </p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href={DEMO_URL} target="_blank" rel="noreferrer">
              Book a demo
            </a>
            <a className="o360-btn o360-btn-ghost" href="/console-validation">
              Check your press, free
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
