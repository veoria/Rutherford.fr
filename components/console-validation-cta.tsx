'use client';

import Image from 'next/image';
import { useLanguage, type Locale } from '@/components/language-provider';
import COPY_DATA from '@/data/home/console-validation-cta.json';

type Copy = {
  kicker: string;
  headline: string;
  supporting: string;
  primaryCta: string;
  secondaryCta: string;
};

const COPY = COPY_DATA as Record<Locale, Copy>;

const PRESS_BRANDS = [
  { src: '/images/komori.webp', alt: 'Komori' },
  { src: '/images/koenig-bauer.webp', alt: 'Koenig & Bauer' },
  { src: '/images/manroland.webp', alt: 'Manroland' },
  { src: '/images/mitsubishi.webp', alt: 'Mitsubishi' },
  { src: '/images/ryobi.webp', alt: 'Ryobi' },
  { src: '/images/presstek.webp', alt: 'Presstek' },
  { src: '/images/goss.webp', alt: 'Goss' },
];

export function ConsoleValidationCTA() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <section className="section console-cta-section" id="console-cta">
      <div className="container console-cta-shell">
        <div className="console-cta-card">
          <p className="console-cta-kicker">{t.kicker}</p>
          <h2 className="console-cta-headline">{t.headline}</h2>

          <div className="console-cta-illustration">
            <Image
              src="/images/offset white.png"
              alt=""
              width={1600}
              height={900}
              sizes="(max-width: 640px) 80vw, 560px"
            />
          </div>

          <div className="console-cta-presses" aria-label="Compatible offset press brands">
            <div className="console-cta-presses-track">
              {[...PRESS_BRANDS, ...PRESS_BRANDS].map((brand, i) => (
                <span className="console-cta-press" key={`${brand.alt}-${i}`}>
                  <Image
                    src={brand.src}
                    alt={i < PRESS_BRANDS.length ? brand.alt : ''}
                    width={240}
                    height={80}
                    sizes="140px"
                  />
                </span>
              ))}
            </div>
          </div>

          <p className="console-cta-supporting">{t.supporting}</p>
          <div className="console-cta-actions">
            <a
              className="button button-accent"
              href="/console-validation"
            >
              {t.primaryCta}
            </a>
            <a className="button button-light-on-dark" href="mailto:contact@rutherford.fr">
              {t.secondaryCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
