'use client';

import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import type { Region } from '@/data/regions';
import './region-hub.css';

const PRESS_BRANDS = [
  { src: '/images/komori.webp', alt: 'Komori' },
  { src: '/images/koenig-bauer.webp', alt: 'Koenig & Bauer' },
  { src: '/images/manroland.webp', alt: 'Manroland' },
];

const VALUE = [
  {
    title: 'Less makeready waste',
    body: 'Start close to target with prepress data, then reach it in fewer pulls. Fewer sheets and less ink burned before the first saleable copy.',
  },
  {
    title: 'Stable color, every shift',
    body: 'Closed-loop measures and corrects every few sheets, holding color inside your DeltaE tolerance from the first sheet to the last.',
  },
  {
    title: 'Auditable on every job',
    body: 'Targets, measurements and DeltaE recorded per job, ready for brand owners, audits and packaging compliance.',
  },
];

export function RegionHubPage({ region }: { region: Region }) {
  return (
    <main className="page-shell region-hub">
      <SiteNav current="home" />

      <section className="region-hero section">
        <div className="container region-hero-inner">
          <p className="section-kicker">Rutherford for {region.forWhom}</p>
          <h1>Closed-loop color control {region.inName}</h1>
          <p className="region-hero-sub">
            {region.angle} Rutherford brings closed-loop color to offset and flexo presses, on the X-Rite PANTONE
            measurement you already trust, so color hits target faster and holds shift after shift.
          </p>
          <div className="region-hero-actions">
            <a className="button button-accent" href="/console-validation">Request a console validation</a>
            <a className="button button-light" href="/account/sign-in">Create your free account</a>
            <a className="button button-dark" href="#contact">Talk to an expert</a>
          </div>
          <p className="region-trust">25+ years · 30+ countries · 1,000+ systems deployed · X-Rite PANTONE partner</p>
          <div className="region-logos" aria-hidden="true">
            {PRESS_BRANDS.map((b) => (
              <img key={b.alt} src={b.src} alt={b.alt} loading="lazy" />
            ))}
          </div>
          <figure className="region-hero-visual">
            <img src="/images/colorloop-lenovo-half-2.webp" alt="Rutherford ColorLoop closed-loop color control on press" loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="region-value section">
        <div className="container">
          <div className="region-value-grid">
            {VALUE.map((v) => (
              <div className="region-value-card" key={v.title}>
                <h2>{v.title}</h2>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="region-band section">
        <div className="container region-band-inner">
          <h2>Stop losing money on every makeready</h2>
          <p>
            Color drift burns sheets, ink and press time. Check for free whether your press is eligible for Rutherford
            closed-loop color.
          </p>
          <div className="region-hero-actions">
            <a className="button button-accent" href="/console-validation">Test your eligibility for free</a>
            <a className="button button-light" href="#contact">Talk to Rutherford</a>
          </div>
        </div>
      </section>

      <section className="region-contact section" id="contact">
        <div className="container region-contact-inner">
          <p className="section-kicker">Talk to Rutherford</p>
          <h2>Get started {region.inName}</h2>
          <div className="region-contact-grid">
            {region.channel ? (
              <div className="region-contact-card region-contact-channel">
                <h3>{region.channel.label}</h3>
                {region.channel.note ? <p>{region.channel.note}</p> : null}
                {region.channel.qr ? (
                  <div className="region-qr">
                    <img src={region.channel.qr} alt={`Rutherford ${region.channel.label}`} />
                  </div>
                ) : null}
                {region.channel.value ? <p className="region-contact-id">{region.channel.value}</p> : null}
                {region.channel.href ? (
                  <a className="button button-dark" href={region.channel.href}>Open {region.channel.label}</a>
                ) : null}
              </div>
            ) : null}

            <div className="region-contact-card">
              <h3>Request a console validation</h3>
              <p>Check for free whether your press and ink-key system qualify for Rutherford closed-loop color.</p>
              <a className="button button-accent" href="/console-validation">Check eligibility</a>
            </div>

            <div className="region-contact-card">
              <h3>Create your account</h3>
              <p>Open a free account to run validations, follow every press and reach support in one place.</p>
              <a className="button button-light" href="/account/sign-in">Create account</a>
            </div>

            <div className="region-contact-card">
              <h3>Talk to an expert</h3>
              <p>Tell us your press and your goal. Our team replies within one business day.</p>
              <a className="button button-dark" href="mailto:contact@rutherford.fr">Email contact@rutherford.fr</a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
