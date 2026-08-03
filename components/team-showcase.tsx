'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useLanguage, type Locale } from '@/components/language-provider';
import COPY_DATA from '@/data/home/team-showcase.json';
import { homeMedia } from '@/lib/home-media';
import { homeLink } from '@/lib/home-links';

type Copy = {
  kicker: string;
  headline: string;
  body: string;
  ctaLabel: string;
};

const COPY = COPY_DATA as Record<Locale, Copy>;

const slides = [
  homeMedia('team-showcase.slide1'),
  homeMedia('team-showcase.slide2'),
  homeMedia('team-showcase.slide3'),
  homeMedia('team-showcase.slide4'),
];

export function TeamShowcase() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="section team-section" id="team">
      <div className="team-background" aria-hidden="true">
        {slides.map((src, slideIndex) => (
          <div
            key={src}
            className={`team-background-slide ${slideIndex === index ? 'is-active' : ''}`}
          >
            <Image
              src={src}
              alt=""
              fill
              className="team-background-image"
              sizes="100vw"
              priority={slideIndex === 0}
            />
          </div>
        ))}
        <div className="team-background-overlay" />
      </div>

      <div className="container team-shell">
        <div className="team-content">
          <p className="section-kicker team-content-kicker">{t.kicker}</p>
          <h2 className="team-content-headline">{t.headline}</h2>
          <p className="team-content-body">{t.body}</p>
          <a className="button button-accent team-content-cta" href={homeLink('team-showcase.cta')}>
            {t.ctaLabel}
          </a>
        </div>

      </div>
    </section>
  );
}
