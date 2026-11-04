'use client';

import dynamic from 'next/dynamic';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import './colorloop-home.css';

const ConsoleValidationCTA = dynamic(
  () => import('@/components/console-validation-cta').then((module) => module.ConsoleValidationCTA),
  { ssr: true }
);
const SiteFooter = dynamic(
  () => import('@/components/site-footer').then((module) => module.SiteFooter),
  { ssr: true }
);

const IMG = '/images/colorloop-ai';

// colorloop.ai has en / fr / es / it / pt; German readers land on the English pages.
const CL_LOCALES: Locale[] = ['fr', 'es', 'it', 'pt'];
function colorloopUrl(locale: Locale, page = '') {
  const prefix = CL_LOCALES.includes(locale) ? `/${locale}` : '';
  return `https://colorloop.ai${prefix}/${page}`;
}

// The five ink dots of colorloop.ai, in the order of the letters, with the
// proportions of their drawings (width and height relative to one dot height).
const DOTS = [
  ['rouge', 1.152, 1],
  ['rose', 1.234, 0.997],
  ['bleu', 1.187, 0.975],
  ['jaune', 1.016, 1.035],
  ['vert', 1.1, 0.901],
] as const;

type Copy = {
  title: [string, string];
  lead: string;
  primary: string;
  secondaryPrefix: string;
  secondary: string;
  dotsAlt: string;
  keepTitle: [string, string];
  keepLead: string;
  keep: [string, string][];
  offer: string;
  offerDetail: string;
  keepCta: string;
  keepPhotoAlt: string;
  newTitle: [string, string];
  newLead: string;
  newCta: string;
  newPhotoAlt: string;
};

const EN: Copy = {
  title: ['Rutherford customer?', 'Switch to ColorLoop'],
  lead: 'Same press, same console, same Rutherford hardware. ColorLoop goes on top, with 3 months free on the yearly plan.',
  primary: 'Switch to ColorLoop',
  secondaryPrefix: 'New to Rutherford?',
  secondary: 'Discover ColorLoop',
  dotsAlt: 'The five ColorLoop ink dots: red, pink, blue, yellow and green',
  keepTitle: ['Keep your hardware.', 'Change the software.'],
  keepLead: 'For EasySet-EasyLoop and IntelliSet-IntelliLoop users. Nothing to reinstall: ColorLoop is added to what already runs at your press.',
  keep: [
    ['Automatic job setup', 'Colorbar found, ink keys preset in about 30 seconds.'],
    ['Corrections after each measured sheet', 'Pull after pull. Your operator keeps control.'],
    ['Your Rutherford license stays yours', 'Stop ColorLoop and you keep working as before.'],
  ],
  offer: '3 months free',
  offerDetail: 'with the yearly plan: €5,300 a year per press, excl. VAT. Or €590 a month, no commitment.',
  keepCta: 'See the offer on colorloop.ai',
  keepPhotoAlt: 'An operator at the ColorLoop screen next to the press',
  newTitle: ['The same color,', 'anywhere in the world'],
  newLead: 'ColorLoop presets the ink keys on sheetfed offset, then corrects after each measured sheet. For commercial and packaging printers.',
  newCta: 'Discover ColorLoop',
  newPhotoAlt: 'An operator checks a printed sheet at the press console',
};

const FR: Copy = {
  title: ['Client Rutherford ?', 'Passez à ColorLoop'],
  lead: 'Même presse, même pupitre, même matériel Rutherford. ColorLoop s’ajoute par-dessus, avec 3 mois offerts sur l’abonnement annuel.',
  primary: 'Passer à ColorLoop',
  secondaryPrefix: 'Nouveau chez Rutherford ?',
  secondary: 'Découvrir ColorLoop',
  dotsAlt: 'Les cinq dots ColorLoop : rouge, rose, bleu, jaune et vert',
  keepTitle: ['Gardez votre matériel.', 'Changez de logiciel.'],
  keepLead: 'Pour les utilisateurs EasySet-EasyLoop et IntelliSet-IntelliLoop. Rien à réinstaller : ColorLoop s’ajoute à ce qui tourne déjà à votre presse.',
  keep: [
    ['Création du travail automatique', 'Barre de contrôle détectée, clés d’encrage préréglées en 30 secondes environ.'],
    ['Corrections après chaque feuille mesurée', 'Tirage après tirage. Le conducteur garde la main.'],
    ['Votre licence Rutherford reste la vôtre', 'Si vous arrêtez ColorLoop, vous continuez comme avant.'],
  ],
  offer: '3 mois offerts',
  offerDetail: 'avec l’abonnement annuel : 5 300 € HT par presse et par an. Ou 590 € HT par mois, sans engagement.',
  keepCta: 'Voir l’offre sur colorloop.ai',
  keepPhotoAlt: 'Un conducteur devant l’écran ColorLoop, au pied de la presse',
  newTitle: ['La même couleur,', 'partout dans le monde'],
  newLead: 'ColorLoop prérègle les clés d’encrage en offset feuille, puis corrige après chaque feuille mesurée. Pour les imprimeurs de labeur et de packaging.',
  newCta: 'Découvrir ColorLoop',
  newPhotoAlt: 'Un conducteur contrôle une feuille imprimée au pupitre',
};

// German, Italian, Spanish and Portuguese copy to follow once the direction is approved.
const COPY: Record<Locale, Copy> = { en: EN, fr: FR, de: EN, it: EN, es: EN, pt: EN };

export function ColorLoopHome() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const upgradeUrl = colorloopUrl(locale, 'rutherford-customers');
  const discoverUrl = colorloopUrl(locale);

  return (
    <main className="page-shell clh" id="top">
      <SiteNav current="home" />

      <section className="clh-hero" aria-labelledby="clh-title">
        <div className="clh-night">
          <img className="clh-wordmark" src={`${IMG}/logo-white.png`} alt="ColorLoop" width={1204} height={272} />

          <h1 id="clh-title" className="clh-title">
            {t.title[0]}
            <br />
            {t.title[1]}
            <span className="clh-dot" aria-hidden="true">.</span>
          </h1>
          <p className="clh-lead">{t.lead}</p>

          <div className="clh-actions">
            <a className="clh-btn" href={upgradeUrl}>{t.primary}</a>
            <a className="clh-textlink" href={discoverUrl}>
              <span>{t.secondaryPrefix}</span> {t.secondary}
            </a>
          </div>

          <div className="clh-dots" role="img" aria-label={t.dotsAlt}>
            {DOTS.map(([name, w, h], i) => (
              <span
                key={name}
                className="clh-ink"
                style={{ ['--i' as string]: i, ['--dw' as string]: w, ['--dh' as string]: h }}
              >
                <img src={`${IMG}/dots/dot-${name}-neutre-640.webp`} alt="" decoding="async" />
                <img className="clh-ink-joy" src={`${IMG}/dots/dot-${name}-joie-640.webp`} alt="" decoding="async" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="clh-keep" aria-labelledby="clh-keep-title">
        <div className="clh-wrap clh-keep-grid">
          <figure className="clh-photo">
            <img src={`${IMG}/photos/dsc6999.webp`} alt={t.keepPhotoAlt} width={1200} height={798} loading="lazy" />
          </figure>
          <div className="clh-keep-copy">
            <h2 id="clh-keep-title" className="clh-h2">
              {t.keepTitle[0]}
              <br />
              {t.keepTitle[1]}
            </h2>
            <p className="clh-body">{t.keepLead}</p>
            <ul className="clh-list">
              {t.keep.map(([head, detail]) => (
                <li key={head}>
                  <strong>{head}</strong>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
            <p className="clh-offer">
              <strong>{t.offer}</strong> {t.offerDetail}
            </p>
            <a className="clh-btn clh-btn-ink" href={upgradeUrl}>{t.keepCta}</a>
          </div>
        </div>
      </section>

      <section className="clh-new" aria-labelledby="clh-new-title">
        <img className="clh-new-photo" src={`${IMG}/photos/dsc7179.webp`} alt={t.newPhotoAlt} width={1200} height={799} loading="lazy" />
        <div className="clh-new-copy">
          <h2 id="clh-new-title" className="clh-h2">
            {t.newTitle[0]}
            <br />
            {t.newTitle[1]}
            <span className="clh-dot" aria-hidden="true">.</span>
          </h2>
          <p className="clh-body">{t.newLead}</p>
          <a className="clh-btn" href={discoverUrl}>{t.newCta}</a>
        </div>
      </section>

      <ConsoleValidationCTA />
      <SiteFooter />
    </main>
  );
}
