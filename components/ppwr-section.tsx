'use client';

import Image from 'next/image';
import { useLanguage, type Locale } from '@/components/language-provider';
import COPY_DATA from '@/data/home/ppwr-section.json';
import { homeMedia } from '@/lib/home-media';

type Copy = {
  kicker: string;
  title: string;
  tagline: string;
  intro: string;
  ppwrTitle: string;
  ppwrBody: string;
  dppTitle: string;
  dppBody: string;
  cardCta: string;
  ctaLabel: string;
  ctaSub: string;
};

const COPY = COPY_DATA as Record<Locale, Copy>;

export function PPWRSection() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <section className="section ppwr-section" id="ppwr">
      <div className="container ppwr-shell">
        <div className="ppwr-intro">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="ppwr-title">{t.title}</h2>
          <p className="ppwr-tagline">{t.tagline}</p>
        </div>

        <div className="ppwr-grid">
          <article className="ppwr-card ppwr-card-dpp">
            <div className="ppwr-card-media">
              <Image
                src={homeMedia('ppwr-section.dppScan')}
                alt="Digital Product Passport, scan and data visualisation"
                width={1600}
                height={1800}
                sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 520px"
              />
            </div>
            <div className="ppwr-card-copy">
              <h3>{t.dppTitle}</h3>
              <p>{t.dppBody}</p>
              <a
                className="ppwr-card-link"
                href="https://ppwrconnect.com"
                target="_blank"
                rel="noreferrer"
              >
                {t.cardCta}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>

          <article className="ppwr-card ppwr-card-ppwr">
            <div className="ppwr-card-media">
              <Image
                src={homeMedia('ppwr-section.compliance')}
                alt="PPWR compliance, FSC, recyclability and recycled content validation"
                width={1600}
                height={1800}
                sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 520px"
              />
            </div>
            <div className="ppwr-card-copy">
              <h3>{t.ppwrTitle}</h3>
              <p>{t.ppwrBody}</p>
              <a
                className="ppwr-card-link"
                href="https://ppwrconnect.com"
                target="_blank"
                rel="noreferrer"
              >
                {t.cardCta}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        </div>

        <div className="ppwr-cta">
          <a
            className="button button-dark ppwr-cta-button"
            href="https://ppwrconnect.com"
            target="_blank"
            rel="noreferrer"
          >
            {t.ctaLabel}
          </a>
          <p className="ppwr-cta-sub">{t.ctaSub}</p>
        </div>
      </div>
    </section>
  );
}
