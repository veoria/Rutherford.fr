'use client';

import { useLanguage, type Locale } from '@/components/language-provider';
import { SnapSlider } from '@/components/snap-slider';
import COPY_DATA from '@/data/home/colorloop-section.json';
import { homeMedia } from '@/lib/home-media';
import { homeLink } from '@/lib/home-links';

type Benefit = { title: string; body: string };

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  benefits: Benefit[];
  techLabel: string;
  techBody: string;
  primaryCta: string;
};

const COPY = COPY_DATA as Record<Locale, Copy>;

export function ColorLoopSection() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <section className="section colorloop-offset-section" id="colorloop">
      <div className="container colorloop-offset-shell">
        <header className="colorloop-offset-header">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="colorloop-offset-headline">{t.headline}</h2>
          <p className="colorloop-offset-intro">{t.intro}</p>
        </header>

        <SnapSlider className="colorloop-offset-grid">
          {t.benefits.map((b, i) => (
            <article className="colorloop-offset-card" key={b.title}>
              <div className="colorloop-offset-card-media">
                <img
                  src={`/images/Screenshotcolorloop/${i + 1}Colorlooplenovoscreenshot.png`}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="colorloop-offset-card-body">
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            </article>
          ))}
        </SnapSlider>

        <div className="colorloop-offset-tech">
          <div className="colorloop-offset-tech-copy">
            <p className="colorloop-offset-tech-label">{t.techLabel}</p>
            <p className="colorloop-offset-tech-body">{t.techBody}</p>
          </div>
          <div className="colorloop-offset-tech-media">
            <a
              className="colorloop-offset-tech-thumb"
              href={homeLink('colorloop-section.intellitrax2')}
              target="_blank"
              rel="noreferrer"
              aria-label="IntelliTrax2 by X-Rite"
            >
              <img src={homeMedia('colorloop-section.intellitrax2')} alt="IntelliTrax2 measurement device" loading="lazy" />
            </a>
            <a
              className="colorloop-offset-tech-thumb"
              href={homeLink('colorloop-section.intellitrax2')}
              target="_blank"
              rel="noreferrer"
              aria-label="IntelliTrax on press"
            >
              <img src={homeMedia('colorloop-section.intellitraxConsole')} alt="IntelliTrax on press console" loading="lazy" />
            </a>
          </div>
        </div>

        <div className="colorloop-offset-cta">
          <a
            className="button button-dark"
            href={homeLink('colorloop-section.colorloop')}
            target="_blank"
            rel="noreferrer"
          >
            {t.primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
