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

// Real ColorConnect screens, captured from the demo recording (demo data only).
const TOUR = [
  {
    screen: 'screen-jobs.webp',
    alt: 'ColorConnect production jobs: each job with its preview, press, plates and ink use',
    title: 'Every job, prepared.',
    body: 'Prepress drops the files in a folder, as today. ColorConnect builds each job with its preview, inks and ink coverage, ready for the press.',
  },
  {
    screen: 'screen-floor.webp',
    alt: 'ColorConnect press floor display: offset and flexo presses with status, speed and score',
    title: 'Every press, live.',
    body: 'Running, makeready or stopped. Speed, output and score, press by press, on the big screen of the pressroom.',
  },
  {
    screen: 'screen-history.webp',
    alt: 'An offset job in ColorConnect with its ColorLoop score, scheduling and ink per color',
    title: 'Offset jobs keep their color history.',
    body: 'ColorLoop presets the ink keys and corrects after each measurement. The job keeps its score, its inks and the preset sent to the press.',
  },
  {
    screen: 'screen-flexo.webp',
    alt: 'A flexo job measured inline by DeltaOne: ΔE per ink and the score along the run',
    title: 'Flexo, measured inline.',
    body: 'DeltaOne measures the running web. ΔE per ink, speed and every measurement stay with the job.',
  },
  {
    screen: 'screen-ppwr.webp',
    alt: 'ColorConnect PPWR compliance: job compliance and ink records',
    title: 'Evidence from your own jobs.',
    body: 'Inks and substrates feed a PPWR evaluation per job and the Digital Product Passport. ColorConnect helps you prepare evidence. It does not certify.',
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
  { title: 'In any browser', body: 'Office, pressroom screen, tablet or phone. Accounts, roles and two-factor authentication.' },
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

// Apple's official iMac (M4, 24-inch, Silver) product bezel; the screens sit
// behind its transparent display area.
function Imac({ children }: { children: React.ReactNode }) {
  return (
    <div className="dev-imac">
      <div className="dev-imac-screen">{children}</div>
      <img className="dev-imac-bezel" src={`${IMG}/device-imac-bezel.webp`} alt="" width={1800} height={1532} />
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
        <div className="cc-devices" aria-label="ColorConnect on a desktop screen, a tablet and a phone">
          <img
            className="cc-devices-imac"
            src={`${IMG}/device-imac-floor.webp`}
            alt="ColorConnect press floor display on an iMac"
            width={1800}
            height={1532}
            fetchPriority="high"
          />
          <img
            className="cc-devices-ipad"
            src={`${IMG}/device-ipad-flexo.webp`}
            alt="A flexo job measured inline, on an iPad Pro"
            width={1100}
            height={843}
          />
          <img
            className="cc-devices-phone"
            src={`${IMG}/device-iphone-floor.webp`}
            alt="Live presses on an iPhone"
            width={520}
            height={1063}
          />
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
            <video
              controls
              playsInline
              preload="metadata"
              poster={`${MEDIA}/colorconnect-pitch-poster.webp`}
              aria-label="François-Xavier David presents ColorConnect, 49 seconds"
            >
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
        <div className="o360-narrow" style={{ marginBottom: 40 }}>
          <h2 className="o360-h2">One portal between prepress, presses and people.</h2>
          <p className="o360-lede">
            Jobs go out to the presses. Live data comes back. Your team, your customers and your compliance files read from the same place.
          </p>
        </div>
        <div className="o360-container">
          <picture className="cc-diagram">
            <source media="(max-width: 720px)" srcSet={`${IMG}/colorconnect-diagram-mobile-light.svg`} />
            <img
              src={`${IMG}/colorconnect-diagram-desktop-light.svg`}
              alt="Prepress files become jobs in ColorConnect, installed in your print shop. ColorConnect sends presets to offset presses running ColorLoop and receives live data from them and from flexo presses measured by DeltaOne. Your team, your customers and your compliance evidence read from ColorConnect."
              width={1100}
              height={485}
              loading="lazy"
            />
          </picture>
        </div>
      </section>

      {/* Screen tour */}
      <section className="o360-section o360-quiet cc-tour-section">
        <div className="o360-narrow" style={{ marginBottom: 24 }}>
          <h2 className="o360-h2">The software, screen by screen.</h2>
        </div>
        <div className="o360-container cc-story">
          <div className="cc-story-stage" aria-hidden="true">
            <Imac>
              {TOUR.map((s, i) => (
                <img
                  key={s.screen}
                  src={`${IMG}/${s.screen}`}
                  alt=""
                  width={1600}
                  height={900}
                  className={i === active ? 'is-on' : undefined}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              ))}
            </Imac>
            <ol className="cc-story-dots">
              {TOUR.map((s, i) => (
                <li key={s.screen} className={i === active ? 'is-on' : undefined} />
              ))}
            </ol>
          </div>
          <ol className="cc-story-steps">
            {TOUR.map((s, i) => (
              <li
                key={s.screen}
                data-i={i}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className={i === active ? 'is-on' : undefined}
              >
                <figure className="cc-story-inline">
                  <img src={`${IMG}/${s.screen}`} alt={s.alt} width={1600} height={900} loading="lazy" />
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
            <video
              ref={tutoRef}
              controls
              playsInline
              preload="none"
              poster={`${MEDIA}/colorconnect-tutorial-poster.webp`}
              aria-label="ColorConnect tour by François-Xavier David, 8 minutes 35"
            >
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
