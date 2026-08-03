'use client';

import { useLanguage, type Locale } from '@/components/language-provider';
import { SnapSlider } from '@/components/snap-slider';
import COPY_DATA from '@/data/home/audience-section.json';
import { homeMedia } from '@/lib/home-media';

type Card = { title: string; body: string };

const AUDIENCE_PHOTOS = [
  {
    src: homeMedia('audience-section.photo1'),
    alt: 'Offset printer working inside a Heidelberg press',
  },
  {
    src: homeMedia('audience-section.photo2'),
    alt: 'Sheetfed offset production line in a packaging plant',
  },
  {
    src: homeMedia('audience-section.photo3'),
    alt: 'Team discussing results at the press console',
  },
];

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  cards: Card[];
};

const COPY = COPY_DATA as Record<Locale, Copy>;

export function AudienceSection() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <section className="section audience-section" id="audience">
      <div className="container audience-shell">
        <header className="audience-header">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="audience-headline">{t.headline}</h2>
          <p className="audience-intro">{t.intro}</p>
        </header>

        <SnapSlider className="audience-grid">
          {t.cards.map((c, i) => (
            <article className={`audience-card audience-card-${['accent', 'light', 'dark'][i]}`} key={c.title}>
              <div className="audience-card-media">
                <img src={AUDIENCE_PHOTOS[i].src} alt={AUDIENCE_PHOTOS[i].alt} loading="lazy" />
              </div>
              <div className="audience-card-body">
                <p className="audience-card-label">0{i + 1}</p>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            </article>
          ))}
        </SnapSlider>
      </div>
    </section>
  );
}
