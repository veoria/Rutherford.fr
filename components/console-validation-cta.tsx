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
    kicker: 'Qualification step',
    headline: 'Check whether your console is compatible',
    supporting:
      'Tell Rutherford about your press console and workflow so we can assess compatibility and guide the next step.',
    primaryCta: 'Request console validation',
    secondaryCta: 'Talk to Rutherford',
  },
  fr: {
    kicker: 'Étape de qualification',
    headline: 'Vérifiez si votre console est compatible',
    supporting:
      'Décrivez votre console et votre workflow à Rutherford : nous évaluons la compatibilité et guidons la prochaine étape.',
    primaryCta: 'Demander une validation console',
    secondaryCta: 'Parler à Rutherford',
  },
  de: {
    kicker: 'Qualifizierungsschritt',
    headline: 'Prüfen Sie, ob Ihre Konsole kompatibel ist',
    supporting:
      'Teilen Sie Rutherford Ihre Druckkonsole und Ihren Workflow mit — wir prüfen die Kompatibilität und leiten den nächsten Schritt.',
    primaryCta: 'Konsolenvalidierung anfragen',
    secondaryCta: 'Mit Rutherford sprechen',
  },
  it: {
    kicker: 'Fase di valutazione',
    headline: 'Verifica la compatibilità della tua console',
    supporting:
      'Raccontaci quale console utilizzi e come funziona oggi il tuo workflow. Valuteremo la compatibilità del tuo impianto e ti guideremo verso il passo successivo.',
    primaryCta: 'Richiedi la validazione della console',
    secondaryCta: 'Parla con Rutherford',
  },
  es: {
    kicker: 'Paso de cualificación',
    headline: 'Compruebe si su consola es compatible',
    supporting:
      'Cuéntenos sobre su consola y flujo de trabajo: Rutherford evalúa la compatibilidad y guía el siguiente paso.',
    primaryCta: 'Solicitar validación de consola',
    secondaryCta: 'Hablar con Rutherford',
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
              href="https://form.typeform.com/to/elOTOK?typeform-source=rgproducts.typeform.com#english=xxxxx"
              target="_blank"
              rel="noreferrer"
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
