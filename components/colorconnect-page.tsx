'use client';

import '@/app/offset360/offset360.css';
import './colorconnect-page.css';
import { useEffect, useRef } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';

// Preview build: the two FX films are served from a temporary bucket. Once the
// films are on the Rutherford YouTube channel, swap these for embeds.
const MEDIA = 'https://pub-715a909e95e0404594d92f720b5cc4dc.r2.dev/preview/colorconnect';
const DEMO_URL = 'https://form.typeform.com/to/LZtPUH';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const STEPS = [
  {
    title: 'The file arrives.',
    body: 'Prepress drops files in a watched folder, as today. ColorConnect rebuilds the preview, separation by separation, and calculates the ink coverage of each plate.',
  },
  {
    title: 'The job goes to press.',
    body: 'Assigned to a press and a date, it appears on the production calendar. Offset or flexo, nothing to retype.',
  },
  {
    title: 'Ready in ColorLoop.',
    body: 'At the offset press, the operator finds the same job in ColorLoop, with the ink-key presets already prepared.',
  },
  {
    title: 'Every press reports live.',
    body: 'Status, speed, sheets and color quality, press by press, on one screen and in any browser.',
  },
  {
    title: 'Your customer follows the job.',
    body: 'A customer portal through a secure link, without creating an account.',
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

const NEEDS = [
  'A Windows workstation or server in the print shop',
  'Prepress files dropped in a folder, as today',
  'A web browser on the workstations that need it',
  'Color quality and the job grade: offset presses equipped with ColorLoop',
  'Flexo presses: connection confirmed for your presses during the project',
  'Production files and customer data stay in your print shop',
];

const FAQ = [
  {
    q: 'Does ColorConnect measure or correct color?',
    a: 'No. ColorLoop presets and corrects the ink on sheetfed offset presses. ColorConnect prepares the jobs and brings the production data back to your team.',
  },
  {
    q: 'Does it work with flexo presses?',
    a: 'ColorConnect prepares flexo jobs from the same prepress files and puts them on the production calendar. Connections are confirmed for your presses during the project.',
  },
  {
    q: 'Does ColorConnect certify my packaging?',
    a: 'No. It helps you prepare the evidence your customers and the regulation ask for, from the data your production already creates. Compliance modules depend on your license.',
  },
  {
    q: 'Where is our data?',
    a: 'ColorConnect is installed in your print shop. Your production files and customer data stay in your shop.',
  },
  {
    q: 'Which languages?',
    a: 'English, French, German, Spanish, Portuguese, Italian, Chinese and Thai.',
  },
];

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = String(t % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function ColorConnectPage() {
  const rootRef = useRef<HTMLElement>(null);
  const tutoRef = useRef<HTMLVideoElement>(null);

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

  const seek = (t: number) => {
    const v = tutoRef.current;
    if (!v) return;
    v.currentTime = t;
    v.play().catch(() => {});
    v.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  };

  return (
    <main className="page-shell o360 cc" ref={rootRef}>
      <SiteNav current="home" />

      {/* Hero */}
      <section className="o360-section">
        <div className="o360-narrow">
          <span className="o360-hero-logo cc-hero-logo">
            <img src="/images/colorconnect/colorconnect.png" alt="ColorConnect" width={1394} height={163} />
          </span>
          <h1 className="o360-h1 cc-h1">Your whole print shop on one screen.</h1>
          <p className="o360-lede">
            The print shop portal for offset and flexo pressrooms. ColorConnect prepares each job and follows production live, in your browser, on a phone, a tablet or the big screen on the floor.
          </p>
          <div className="o360-cta-row">
            <a className="o360-btn o360-btn-primary" href={DEMO_URL} target="_blank" rel="noreferrer">Book a demo</a>
            <a className="o360-btn o360-btn-ghost" href="#tour">Watch the full tour</a>
          </div>
        </div>
      </section>

      {/* Pitch film */}
      <section className="o360-section cc-film" style={{ paddingTop: 0 }}>
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
            <strong>François-Xavier David</strong>, Veoria, on why ColorConnect exists. 49 s, English subtitles.
          </p>
        </div>
      </section>

      {/* One job through the shop */}
      <section className="o360-section o360-quiet">
        <div className="o360-container">
          <div className="o360-narrow o360-reveal" style={{ marginBottom: 16 }}>
            <h2 className="o360-h2">Follow one job through the shop.</h2>
            <p className="o360-lede">From the prepress folder to the press, the shop floor screen and your customer.</p>
          </div>
          <ol className="o360-steps">
            {STEPS.map((s, i) => (
              <li className="o360-step o360-reveal" key={s.title} style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="o360-step-num">{i + 1}</span>
                <div className="o360-step-body">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Dashboard */}
      <section className="o360-section">
        <div className="o360-feature o360-reveal">
          <div className="o360-feature-media cc-media-plain">
            <img
              src="/images/colorconnect/colorconnect-dashboard-imac.webp"
              alt="The ColorConnect dashboard on a desktop screen: jobs, presses and compliance activity"
              width={1600}
              height={1219}
              loading="lazy"
            />
          </div>
          <div className="o360-feature-copy">
            <h3>Offset and flexo. One portal.</h3>
            <p>
              ColorLoop runs at the offset press: it presets the ink keys, then corrects after each measurement with IntelliTrax or IntelliTrax2. ColorConnect brings every press back to one view, with status, output, alerts and the A to E color grade of each ColorLoop job.
            </p>
            <ul className="o360-chips">
              <li>Sheetfed offset with ColorLoop</li>
              <li>Flexo jobs and status</li>
              <li>Color history per job</li>
            </ul>
            <a className="o360-feature-link" href="/colorloop">
              Discover ColorLoop
            </a>
          </div>
        </div>
      </section>

      {/* Full tour */}
      <section id="tour" className="o360-section o360-quiet">
        <div className="o360-container">
          <div className="o360-narrow o360-reveal" style={{ marginBottom: 32 }}>
            <h2 className="o360-h2">The full tour, by FX.</h2>
            <p className="o360-lede">
              Eight minutes in front of the press floor screen: live presses, job scores, flexo measured inline, control bars and the ink and substrate library.
            </p>
          </div>
          <div className="cc-tour o360-reveal">
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
        </div>
      </section>

      {/* Evidence */}
      <section className="o360-section">
        <div className="o360-narrow o360-reveal">
          <h2 className="o360-h2">Evidence, from your jobs.</h2>
          <p className="o360-lede">
            ColorConnect already knows the inks, stocks and quantities of each job. It helps you prepare what your customers and the regulation ask for.
          </p>
          <ul className="o360-chips cc-chips-center">
            <li>PPWR evaluation per job</li>
            <li>Digital Product Passport with a public QR code</li>
            <li>EPR declarations per site</li>
          </ul>
          <p className="cc-note">
            ColorConnect helps you prepare evidence. It does not certify. Modules depend on your license and are confirmed during a demo.
          </p>
        </div>
      </section>

      {/* What you need */}
      <section className="o360-section o360-quiet">
        <div className="o360-container">
          <div className="o360-narrow o360-reveal" style={{ marginBottom: 0 }}>
            <h2 className="o360-h2">Installed in your print shop.</h2>
          </div>
          <ul className="o360-included">
            {NEEDS.map((item, i) => (
              <li key={item} className="o360-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="o360-section">
        <div className="o360-narrow o360-reveal">
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
        <div className="o360-narrow o360-end o360-reveal">
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
