'use client';

import { useLanguage, type Locale } from '@/components/language-provider';
import { homeMedia } from '@/lib/home-media';
import COPY_DATA from '@/data/home/brand-explainer-section.json';

type CardCopy = { title: string; body: string; ctaLabel?: string; href?: string };

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  rutherford: CardCopy;
  colorloop: CardCopy;
  veoria: CardCopy;
};

const COPY = COPY_DATA as Record<Locale, Copy>;

const CARD_IMAGES: Record<'rutherford' | 'colorloop' | 'veoria', string> = {
  rutherford: homeMedia('brand-explainer-section.rutherford'),
  colorloop: homeMedia('brand-explainer-section.colorloop'),
  veoria: homeMedia('brand-explainer-section.veoria'),
};

export function BrandExplainerSection() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  const cards: Array<{ key: 'rutherford' | 'colorloop' | 'veoria'; content: CardCopy }> = [
    { key: 'rutherford', content: t.rutherford },
    { key: 'colorloop', content: t.colorloop },
    { key: 'veoria', content: t.veoria },
  ];

  return (
    <section className="section brand-explainer-section" id="about">
      <div className="container brand-explainer-shell">
        <header className="brand-explainer-header">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="brand-explainer-headline">{t.headline}</h2>
          <p className="brand-explainer-intro">{t.intro}</p>
        </header>

        <div className="brand-explainer-grid">
          {cards.map(({ key, content }, index) => (
            <article key={key} className={`brand-explainer-card brand-explainer-card-${key}`}>
              <div className="brand-explainer-card-media">
                <img
                  src={CARD_IMAGES[key]}
                  alt=""
                  loading="lazy"
                  className="brand-explainer-card-image"
                />
              </div>
              <div className="brand-explainer-card-body">
                <p className="brand-explainer-card-label">0{index + 1}</p>
                <h3>
                  {content.href ? (
                    (() => {
                      const external = content.href.startsWith('http');
                      return (
                        <a
                          href={content.href}
                          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                        >
                          {content.title}
                        </a>
                      );
                    })()
                  ) : (
                    content.title
                  )}
                </h3>
                <p>{content.body}</p>
                {content.href && content.ctaLabel ? (
                  (() => {
                    const external = content.href.startsWith('http');
                    return (
                      <a
                        className="brand-explainer-card-cta"
                        href={content.href}
                        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      >
                        {content.ctaLabel} <span aria-hidden="true">→</span>
                      </a>
                    );
                  })()
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
