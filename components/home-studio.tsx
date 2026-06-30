'use client';

import './home-studio.css';
import { useEffect } from 'react';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

// Experimental readme.com-style home (English prototype, route /v2).
// Localization comes after the design is approved.
function useReveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.studio-reveal'));
    if (reduce) {
      nodes.forEach((n) => n.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }),
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}

const PRINTER_LOGOS = [
  { src: '/images/printer-avery-dennison.png', alt: 'Avery Dennison' },
  { src: '/images/printer-ds-smith.avif', alt: 'DS Smith' },
  { src: '/images/printer-huhtamaki.png', alt: 'Huhtamaki' },
  { src: '/images/printer-mm-packaging.png', alt: 'MM Packaging' },
  { src: '/images/printer-westrock.png', alt: 'WestRock' },
  { src: '/images/printer-yuto.png', alt: 'Yuto' },
];

export function HomeStudio() {
  useReveal();

  return (
    <main className="page-shell studio" id="top">
      <SiteNav current="home" />

      {/* HERO */}
      <section className="st-hero">
        <span className="st-hero-glow st-hero-glow-a" aria-hidden="true" />
        <span className="st-hero-glow st-hero-glow-b" aria-hidden="true" />
        <div className="st-wrap">
          <span className="st-hero-kicker">🌱 Closed-loop color for offset &amp; flexo</span>
          <h1>Color on target.<br /><span className="accent">Every press. Every shift.</span></h1>
          <p className="st-hero-sub">Rutherford automates color control so printers cut makeready waste, hold color, and prove it, run after run. Powered by X-Rite PANTONE and MeasureColor.</p>
          <div className="st-actions">
            <a className="st-btn st-btn-blue" href="/console-validation">Check your press</a>
            <a className="st-btn st-btn-ghost" href="#colorloop">See ColorLoop</a>
          </div>
          <div className="st-hero-shot studio-reveal">
            <img src="/images/Colorloop-Lenovo-Packshotv3.png.png.webp" alt="ColorLoop running on press" />
          </div>
        </div>
      </section>

      {/* ROW 1 — ColorLoop software */}
      <section className="st-section" id="colorloop">
        <div className="st-wrap">
          <div className="st-row st-row-reverse">
            <div className="st-row-text studio-reveal">
              <p className="st-eyebrow">The software</p>
              <h2 className="st-h2">ColorLoop, built in the pressroom</h2>
              <p className="st-lead">Modern production software that reads every sheet and corrects ink keys automatically.</p>
              <ul className="st-row-list">
                <li>Faster makeready with AI-assisted setup</li>
                <li>Less paper and ink on every run</li>
                <li>Stable, repeatable color job after job</li>
              </ul>
              <div className="st-actions"><a className="st-btn st-btn-blue" href="https://colorloop.ai" target="_blank" rel="noreferrer">Discover ColorLoop</a></div>
            </div>
            <div className="st-row-media studio-reveal" style={{ ['--reveal-delay' as string]: '120ms' }}>
              <img src="/images/Screenshotcolorloop/1Colorlooplenovoscreenshot.png" alt="ColorLoop ink-zone view" />
            </div>
          </div>
        </div>
      </section>

      <span className="st-connector studio-reveal" aria-hidden="true" />

      {/* ROW 2 — Closed loop on the press */}
      <section className="st-section">
        <div className="st-wrap">
          <div className="st-row">
            <div className="st-row-text studio-reveal">
              <p className="st-eyebrow">How the loop works</p>
              <h2 className="st-h2">Measure. Decide. Correct.</h2>
              <p className="st-lead">A spectral reading on every sheet, compared to your target, with ink keys adjusting in real time.</p>
              <ul className="st-row-list">
                <li>Live measurement with X-Rite &amp; MeasureColor</li>
                <li>Every ink zone compared to target</li>
                <li>Automatic correction, run after run</li>
              </ul>
            </div>
            <div className="st-row-media studio-reveal" style={{ ['--reveal-delay' as string]: '120ms' }}>
              <img src="/images/Hugues on console press offset.jpg" alt="Operator at the ColorLoop console" />
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="st-section">
        <div className="st-wrap">
          <div className="st-quote studio-reveal">
            <blockquote>&ldquo;We can&rsquo;t run the press without it. Closed-loop is now our daily standard.&rdquo;</blockquote>
            <p className="st-quote-author"><b>LEFRANCQ Packaging</b> · Packaging converter</p>
          </div>
        </div>
      </section>

      {/* DARK BAND — ROI */}
      <section className="st-section">
        <div className="st-wrap">
          <div className="st-band studio-reveal" style={{ textAlign: 'center' }}>
            <h2 className="st-h2">See what closed-loop saves you</h2>
            <p className="st-lead" style={{ marginLeft: 'auto', marginRight: 'auto' }}>Less makeready waste, fewer reruns, steadier color. Put real numbers on your press.</p>
            <div className="st-actions" style={{ justifyContent: 'center' }}>
              <a className="st-btn st-btn-light" href="/roi">Calculate your ROI</a>
            </div>
          </div>
        </div>
      </section>

      {/* 3-UP CARDS — who it's for */}
      <section className="st-section">
        <div className="st-wrap">
          <p className="st-eyebrow studio-reveal">Who we work with</p>
          <h2 className="st-h2 studio-reveal">Built for the pressroom</h2>
          <div className="st-cards">
            <div className="st-card studio-reveal"><div className="st-card-n">01</div><h3>Offset printers</h3><p>Faster makeready and steadier color across jobs, shifts and presses.</p></div>
            <div className="st-card studio-reveal" style={{ ['--reveal-delay' as string]: '90ms' }}><div className="st-card-n">02</div><h3>Packaging converters</h3><p>Tighter production control, standardization and repeatability.</p></div>
            <div className="st-card studio-reveal" style={{ ['--reveal-delay' as string]: '180ms' }}><div className="st-card-n">03</div><h3>Brand owners</h3><p>Auditable color, traceability and PPWR/DPP readiness.</p></div>
          </div>
        </div>
      </section>

      {/* LOGO CLOUD */}
      <section className="st-section">
        <div className="st-wrap st-logos">
          <p className="st-eyebrow studio-reveal">Trusted in 30+ countries</p>
          <div className="st-logos-grid studio-reveal">
            {PRINTER_LOGOS.map((l) => (<img key={l.alt} src={l.src} alt={l.alt} loading="lazy" />))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="st-section">
        <div className="st-wrap">
          <div className="st-cta studio-reveal">
            <h2 className="st-h2">Stop losing money on every makeready</h2>
            <p className="st-lead">Check in two minutes whether your press qualifies for closed-loop color.</p>
            <div className="st-actions">
              <a className="st-btn st-btn-blue" href="/console-validation">Test your press</a>
              <a className="st-btn st-btn-ghost" href="mailto:contact@rutherford.fr">Talk to us</a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
