'use client';

import Image from 'next/image';
import { useLanguage, type Locale } from '@/components/language-provider';

type Copy = {
  kicker: string;
  headline: string;
  supporting: string;
  primaryCta: string;
  secondaryCta: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'Stop losing money',
    headline: 'Stop losing money on every makeready',
    supporting:
      'Color drift burns sheets, ink and press time. Check for free whether your press is eligible for Rutherford closed-loop color.',
    primaryCta: 'Test your eligibility for free',
    secondaryCta: 'Talk to Rutherford',
  },
  fr: {
    kicker: "Arrêtez de perdre de l'argent",
    headline: "Arrêtez de perdre de l'argent à chaque calage",
    supporting:
      "La dérive couleur brûle des feuilles, de l'encre et du temps presse. Vérifiez gratuitement si votre presse est éligible au closed-loop Rutherford.",
    primaryCta: 'Testez gratuitement votre éligibilité',
    secondaryCta: 'Parler à Rutherford',
  },
  de: {
    kicker: 'Geld sparen',
    headline: 'Verlieren Sie kein Geld mehr beim Einrichten',
    supporting:
      'Farbabweichung kostet Bogen, Farbe und Maschinenzeit. Prüfen Sie kostenlos, ob Ihre Druckmaschine für Rutherford Closed-Loop geeignet ist.',
    primaryCta: 'Eignung kostenlos prüfen',
    secondaryCta: 'Mit Rutherford sprechen',
  },
  it: {
    kicker: 'Smetta di perdere denaro',
    headline: 'Smetta di perdere denaro a ogni avviamento',
    supporting:
      'La deriva colore brucia fogli, inchiostro e tempo macchina. Verifichi gratuitamente se la Sua macchina è idonea al closed-loop Rutherford.',
    primaryCta: 'Verifichi gratis la Sua idoneità',
    secondaryCta: 'Parla con Rutherford',
  },
  es: {
    kicker: 'Deje de perder dinero',
    headline: 'Deje de perder dinero en cada puesta a punto',
    supporting:
      'La deriva del color quema pliegos, tinta y tiempo de prensa. Compruebe gratis si su prensa es elegible para el closed-loop de Rutherford.',
    primaryCta: 'Pruebe gratis su elegibilidad',
    secondaryCta: 'Hablar con Rutherford',
  },
  pt: {
    kicker: 'Pare de perder dinheiro',
    headline: 'Pare de perder dinheiro em cada acerto',
    supporting:
      'A deriva de cor queima folhas, tinta e tempo de máquina. Verifique gratuitamente se a sua máquina de impressão é elegível para o closed-loop da Rutherford.',
    primaryCta: 'Teste a sua elegibilidade gratuitamente',
    secondaryCta: 'Fale com a Rutherford',
  },
};

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
