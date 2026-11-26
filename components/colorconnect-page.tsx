'use client';

import '@/app/offset360/offset360.css';
import './colorconnect-page.css';
import { ColorConnectDiagram } from './colorconnect-diagram';
import { AppDemo } from './colorconnect-appdemo';
import { PH } from './colorconnect-phosphor';
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
  { icon: 'factory', title: 'In your print shop', body: 'A Windows workstation or server. Production files and customer data stay with you.' },
  { icon: 'devices', title: 'In any browser', body: 'Office, pressroom, tablet or phone. Accounts, roles and two-factor authentication.' },
  { icon: 'translate', title: 'In 8 languages', body: 'English, French, German, Spanish, Portuguese, Italian, Chinese and Thai.' },
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

function SecureLock() {
  // The brushed-metal padlock: the shackle drops in while the padlock travels up to the middle of the
  // screen, it locks with a short snap and a light sweep, then the call to action appears under it.
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
      const r = (el.firstElementChild as HTMLElement).getBoundingClientRect();
      const vh = window.innerHeight;
      const center = r.top + r.height / 2;
      const p = Math.min(1, Math.max(0, (vh * 0.82 - center) / (vh * 0.4)));
      el.style.setProperty('--open', String(Math.pow(1 - p, 3)));
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
    <div className="cc-lockwrap" ref={ref}>
      <div className="cc-lock" aria-hidden="true">
        <img className="cc-lock-shackle" src="/images/security/padlock-shackle.webp" alt="" width={1000} height={1000} loading="lazy" />
        <img className="cc-lock-body" src="/images/colorconnect/padlock-body-cc.webp" alt="" width={1000} height={1000} loading="lazy" />
        <span className="cc-lock-sheen" />
      </div>
      <a className="o360-btn o360-btn-primary cc-lock-cta" href={DEMO_URL} target="_blank" rel="noreferrer">Book a demo</a>
    </div>
  );
}

const PORTAL = [
  {
    title: 'From prepress',
    text: 'Files dropped in a folder become jobs, with their inks and coverage.',
    ui: { src: 'portal-ui-jobs.webp', w: 1070, h: 474, kind: 'screen', alt: 'Production jobs created from prepress files, with artwork, plates and ink per 1,000 sheets' },
    photo: 'portal-photo-prepress.webp',
    render: 'render-prepress-v2.webp',
  },
  {
    title: 'To every press',
    text: 'Offset with ColorLoop, flexo with DeltaOne. Presets go out, live data comes back.',
    ui: { src: 'portal-ui-keys.webp', w: 1200, h: 460, kind: 'screen', alt: 'Ink key corrections measured sheet after sheet on an offset press' },
    photo: 'portal-photo-press.webp',
    render: 'render-presses.webp',
  },
  {
    title: 'Back to your people',
    text: 'Your team on any screen, your customers through a secure link, PPWR evidence per job.',
    ui: { src: 'portal-ui-phone.webp', w: 560, h: 1145, kind: 'phone', alt: 'ColorConnect on an iPhone' },
    photo: 'portal-photo-people.webp',
    render: 'render-team-v2.webp',
  },
];

type PortalVariant = 'diagram' | 'ui' | 'photos' | 'renders';

export function ColorConnectPage() {
  const tutoRef = useRef<HTMLVideoElement>(null);
  const [portal, setPortal] = useState<PortalVariant>('diagram');
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('portal');
    if (v === 'ui' || v === 'photos' || v === 'renders') setPortal(v);
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
        <div className="cc-devices" aria-label="ColorConnect running on an iMac">
          <div className="cc-imac">
            <div className="cc-imac-screen">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={`${IMG}/demo-loop-poster-v2.webp`}
                aria-label="ColorConnect in use: a job from prepress, the ink keys corrected live, the ink and substrate library"
              >
                <source src={`${IMG}/demo-loop-v3.mp4`} type="video/mp4" />
              </video>
            </div>
            <img className="cc-imac-bezel" src={`${IMG}/device-imac-blue-bezel.webp`} alt="" width={1800} height={1532} />
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
            <video controls playsInline preload="metadata" poster={`${IMG}/poster-pitch-v4.webp`} aria-label="François-Xavier David presents ColorConnect, one minute">
              <source src={`${MEDIA}/colorconnect-pitch-fx-en-3.mp4`} type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* One portal, three steps. Proposals: diagram (default), ?portal=ui, ?portal=photos, ?portal=renders */}
      <section className="o360-section cc-portal">
        <div className="o360-narrow">
          <h2 className="o360-h2">One portal between prepress, presses and people.</h2>
        </div>
        {portal === 'diagram' && <ColorConnectDiagram />}
        {portal !== 'diagram' && (
        <ol className={`cc-steps3 cc-steps3-${portal}`}>
          {PORTAL.map((step) => (
            <li key={step.title}>
              {portal === 'ui' && (
                <div className={`cc-tile cc-tile-${step.ui.kind}`}>
                  <img src={`${IMG}/${step.ui.src}`} alt={step.ui.alt} width={step.ui.w} height={step.ui.h} loading="lazy" />
                </div>
              )}
              {portal === 'photos' && (
                <div className="cc-photo">
                  <img src={`${IMG}/${step.photo}`} alt="" width={800} height={1000} loading="lazy" />
                </div>
              )}
              {portal === 'renders' && <img src={`${IMG}/${step.render}`} alt="" width={900} height={900} loading="lazy" />}
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        )}
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

      {/* Click-through demo inside the iMac */}
      <section className="o360-section o360-quiet cc-tour-section">
        <div className="o360-narrow" style={{ marginBottom: 32 }}>
          <h2 className="o360-h2">Click around ColorConnect.</h2>
          <p className="o360-lede">Real screens, demo data. Click a press, a job or the menu.</p>
        </div>
        <div className="o360-container">
          <AppDemo />
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
            <video ref={tutoRef} controls playsInline preload="none" poster={`${IMG}/poster-tour-v2.webp`} aria-label="ColorConnect tour by François-Xavier David, 8 minutes 35">
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
                <svg className="cc-ess-ico" viewBox="0 0 256 256" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PH[e.icon] }} />
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
