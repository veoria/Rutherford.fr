'use client';

import { useLanguage, type Locale } from '@/components/language-provider';
import { SnapSlider } from '@/components/snap-slider';
import COPY_DATA from '@/data/home/how-rutherford-helps.json';
import { homeMedia } from '@/lib/home-media';

type Benefit = { title: string; body: string };

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  benefits: Benefit[];
};

const COPY = COPY_DATA as Record<Locale, Copy>;

const BENEFIT_IMAGES = [
  homeMedia('how-rutherford-helps.benefit1'),
  homeMedia('how-rutherford-helps.benefit2'),
  homeMedia('how-rutherford-helps.benefit3'),
  homeMedia('how-rutherford-helps.benefit4'),
];

export function HowRutherfordHelps() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <section className="section how-rutherford-section" id="how">
      <div className="container how-rutherford-shell">
        <header className="how-rutherford-header">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="how-rutherford-headline">{t.headline}</h2>
          <p className="how-rutherford-intro">{t.intro}</p>
        </header>

        <SnapSlider className="how-rutherford-grid">
          {t.benefits.map((b, i) => (
            <article className="how-rutherford-card" key={b.title}>
              <span className="how-rutherford-card-index" aria-hidden="true">
                0{i + 1}
              </span>
              <div className="how-rutherford-card-media">
                <img src={BENEFIT_IMAGES[i]} alt="" loading="lazy" />
              </div>
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </article>
          ))}
        </SnapSlider>
      </div>
    </section>
  );
}
