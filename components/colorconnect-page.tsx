'use client';

import '@/app/offset360/offset360.css';
import './colorconnect-page.css';
import { useEffect, useRef, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { CC_ICONS } from '@/components/colorconnect-icons';

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
    screens: ['tour-jobs.webp'],
    alt: 'ColorConnect production jobs: each job with its preview, press, plates and ink use',
    title: 'Every job, prepared.',
    body: 'Prepress drops the files in a folder, as today. ColorConnect builds each job with its preview, inks and ink coverage.',
    tag: 'Job created from the prepress folder',
    focus: { x: 14.6, y: 20.9, w: 27.1, h: 37.7 },
  },
  {
    screens: ['tour-offset.webp'],
    alt: 'An offset job in ColorConnect: press, schedule, substrate and ink per color',
    title: 'Ready for the offset press.',
    body: 'Press, schedule, substrate and ink per color. At the console, ColorLoop finds the same job, with nothing to retype.',
    tag: 'Ink per color, ready for the preset',
    focus: { x: 14.6, y: 61.8, w: 83.8, h: 24.9 },
  },
  {
    screens: ['tour-zones-1.webp', 'tour-zones-3.webp'],
    alt: 'Ink zones of each measured sheet: mostly red and yellow on sheet 1, mostly green on sheet 3',
    title: 'Sheet after sheet, into tolerance.',
    body: 'Every ink zone of every measured sheet. ColorLoop corrects after each measurement, and the job keeps the whole history.',
    tag: 'From sheet 1 to sheet 3',
    focus: { x: 14.6, y: 8, w: 84, h: 78 },
  },
  {
    screens: ['tour-flexo.webp'],
    alt: 'A flexo job measured inline by DeltaOne: ΔE per ink and the score along the run',
    title: 'Flexo, measured inline.',
    body: 'DeltaOne measures the running web. ΔE per ink, speed and every measurement stay with the job.',
    tag: '0 of 6 inks out of tolerance',
    focus: { x: 14.6, y: 48.2, w: 50, h: 8 },
  },
  {
    screens: ['tour-inks.webp'],
    alt: 'The ink and substrate library with compliance columns for each ink',
    title: 'Inks and substrates, documented.',
    body: 'Each ink carries its composition and compliance data. When a color in a formulation is not compliant, you see it at once.',
    tag: 'PFAS, heavy metals and food contact, per ink',
    focus: { x: 64, y: 31.7, w: 8, h: 51 },
  },
  {
    screens: ['tour-ppwr.webp'],
    alt: 'ColorConnect PPWR compliance: job compliance and ink records',
    title: 'Evidence from your own jobs.',
    body: 'A PPWR evaluation per job and the Digital Product Passport, from data your production already creates. ColorConnect helps you prepare evidence. It does not certify.',
    tag: 'Compliance per job, from its inks',
    focus: { x: 14.6, y: 33.7, w: 41.7, h: 22.5 },
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

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`cc-icon ${className}`} dangerouslySetInnerHTML={{ __html: CC_ICONS[name] }} />;
}

function Shot({ step, on }: { step: Step; on: boolean }) {
  const f = step.focus;
  return (
    <div
      className={`cc-shot${on ? ' is-on' : ''}${step.screens.length > 1 ? ' is-pair' : ''}`}
      style={{ transformOrigin: `${f.x + f.w / 2}% ${f.y + f.h / 2}%` }}
    >
      {step.screens.map((s, k) => (
        <img key={s} src={`${IMG}/${s}`} alt="" width={1600} height={1039} className={k === 1 ? 'cc-shot-next' : undefined} loading="lazy" />
      ))}
      {step.screens.length === 1 && (
        <span className="cc-ring" style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%`, height: `${f.h}%` }} />
      )}
    </div>
  );
}

export function ColorConnectPage() {
  const tutoRef = useRef<HTMLVideoElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);

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
        <div className="cc-devices" aria-label="ColorConnect on a MacBook Pro, an iPad Pro and an iPhone">
          <img className="cc-devices-mac" src={`${IMG}/device-macbook-jobs.webp`} alt="ColorConnect production jobs on a MacBook Pro" width={1800} height={1184} fetchPriority="high" />
          <img className="cc-devices-ipad" src={`${IMG}/device-ipad-flexo.webp`} alt="A flexo job measured inline, on an iPad Pro" width={1100} height={843} />
          <img className="cc-devices-phone" src={`${IMG}/device-iphone-flexo.webp`} alt="The same flexo job on an iPhone" width={560} height={1145} />
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
          <p className="cc-caption">
            <strong>François-Xavier David</strong>, Veoria. 49 s, English subtitles.
          </p>
        </div>
      </section>

      {/* One diagram */}
      <section className="o360-section">
        <div className="o360-narrow" style={{ marginBottom: 48 }}>
          <h2 className="o360-h2">One portal between prepress, presses and people.</h2>
          <p className="o360-lede">
            Jobs go out to the presses. Live data comes back. Your team, your customers and your compliance files read from the same place.
          </p>
        </div>
        <div className="o360-container">
          <div className="cc-map">
            <div className="cc-map-src">
              <div className="cc-node">
                <Icon name="prepress" className="cc-node-icon" />
                <h3>Prepress</h3>
                <p>PDF files dropped in a folder, as today</p>
              </div>
              <span className="cc-flow cc-flow-right" aria-hidden="true"><i>jobs</i></span>
            </div>

            <div className="cc-map-hub">
              <img src={`${IMG}/device-macbook-jobs.webp`} alt="ColorConnect on a laptop" width={1800} height={1184} loading="lazy" />
              <p className="cc-map-hub-label">
                <img src={`${IMG}/colorconnect.png`} alt="ColorConnect" width={1394} height={163} />
                <span>Installed in your print shop, open in any browser</span>
              </p>
            </div>

            <div className="cc-map-presses">
              <div className="cc-node cc-node-press">
                <span className="cc-flow cc-flow-both" aria-hidden="true"><i>presets</i></span>
                <Icon name="offset" className="cc-press-art" />
                <h3>Sheetfed offset</h3>
                <p>ColorLoop presets and corrects the ink keys</p>
              </div>
              <div className="cc-node cc-node-press">
                <span className="cc-flow cc-flow-both" aria-hidden="true"><i>live data</i></span>
                <Icon name="flexo" className="cc-press-art" />
                <h3>Flexo and label</h3>
                <p>DeltaOne measures the running web inline</p>
              </div>
            </div>

            <div className="cc-map-out">
              <span className="cc-bus" aria-hidden="true" />
              <div className="cc-node">
                <Icon name="team" className="cc-node-icon" />
                <h3>Your team</h3>
                <p>Office, pressroom, tablet or phone</p>
              </div>
              <div className="cc-node">
                <Icon name="customer" className="cc-node-icon" />
                <h3>Your customers</h3>
                <p>They follow their jobs through a secure link</p>
              </div>
              <div className="cc-node">
                <Icon name="dpp" className="cc-node-icon" />
                <h3>Evidence</h3>
                <p>PPWR per job, Digital Product Passport, EPR</p>
              </div>
            </div>
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
            <div className="cc-mac">
              <div className="cc-mac-screen">
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
              <img className="cc-mac-bezel" src={`${IMG}/device-macbook-bezel.webp`} alt="" width={1800} height={1184} />
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
                  <img src={`${IMG}/${s.screens[s.screens.length - 1]}`} alt={s.alt} width={1600} height={1039} loading="lazy" />
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
            <video ref={tutoRef} controls playsInline preload="none" poster={`${MEDIA}/colorconnect-tutorial-poster.webp`} aria-label="ColorConnect tour by François-Xavier David, 8 minutes 35">
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
