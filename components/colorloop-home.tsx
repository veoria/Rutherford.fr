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
const DEMO_URL = 'https://rutherfordindustriesgraphiques-2bd706.pipedrive.com/scheduler/3KG0yJSy/meeting';

// colorloop.ai has en / fr / es / it / pt; German readers land on the English pages.
const CL_LOCALES: Locale[] = ['fr', 'es', 'it', 'pt'];
function colorloopUrl(locale: Locale, page = '') {
  const prefix = CL_LOCALES.includes(locale) ? `/${locale}` : '';
  return `https://colorloop.ai${prefix}/${page}`;
}
function localPath(locale: Locale, path: string) {
  return locale === 'en' ? path : `/${locale}${path}`;
}

const PRESSES = [
  ['heidelberg', 'Heidelberg'],
  ['komori', 'Komori'],
  ['koenig-bauer', 'Koenig & Bauer'],
  ['manroland', 'Manroland'],
  ['mitsubishi', 'Mitsubishi'],
  ['ryobi', 'Ryobi'],
] as const;

const AGENTS = ['rouge', 'rose', 'bleu', 'jaune', 'vert'] as const;

type Copy = {
  switchCustomer: string;
  switchNew: string;
  headline: [string, string];
  lead: string;
  offerBig: string;
  offerSmall: string;
  offerPrice: string;
  primary: string;
  secondary: string;
  productAlt: string;
  pressesLabel: string;
  keepTitle: string;
  keepLead: string;
  keep: string[];
  gainTitle: string;
  gain: [string, string][];
  licenseNote: string;
  stepsTitle: string;
  steps: [string, string][];
  stepsCta: string;
  newTitle: string;
  newLead: string;
  loop: [string, string][];
  operator: string;
  newPrimary: string;
  newSecondary: string;
  agentsAlt: string;
};

const EN: Copy = {
  switchCustomer: 'Already a Rutherford customer',
  switchNew: 'New to Rutherford',
  headline: ['Rutherford customer?', 'Move to ColorLoop'],
  lead: 'For EasySet-EasyLoop and IntelliSet-IntelliLoop users. Keep your press, your console and your Rutherford hardware. ColorLoop goes on top, without reinstalling.',
  offerBig: '3 months free',
  offerSmall: 'with the yearly plan',
  offerPrice: '€5,300 a year per press, excl. VAT. Or €590 a month, no commitment.',
  primary: 'Move to ColorLoop',
  secondary: 'Check your console first',
  productAlt: 'ColorLoop running on the Lenovo ThinkCentre M90a at the press',
  pressesLabel: 'Works on these presses',
  keepTitle: 'Same hardware. New software.',
  keepLead: 'Nothing to buy again, nothing to reinstall. The loop is added to what already runs in your pressroom.',
  keep: ['Your press and its console', 'Your Rutherford hardware', 'Your Rutherford license', 'Your operators'],
  gainTitle: 'What changes at the press',
  gain: [
    ['Automatic job setup', 'Color mapping and colorbar detection are done when the job is created.'],
    ['Autosetup in about 30 seconds', 'Pick the job, ColorLoop presets the ink keys.'],
    ['Corrections after each measured sheet', 'Pull after pull, the operator keeps control.'],
    ['A modern Windows interface', 'Runs on Windows 10 or 11, at the press.'],
  ],
  licenseNote: 'Your EasySet-EasyLoop or IntelliSet-IntelliLoop license stays yours. Stop ColorLoop and you keep working as before.',
  stepsTitle: 'Switch in four steps',
  steps: [
    ['Tell us your system', 'EasySet-EasyLoop or IntelliSet-IntelliLoop, and your presses.'],
    ['See it running', 'A demo with Rutherford, on your kind of press.'],
    ['Subscribe and activate', 'Online. Rutherford checks your system within five business days, then activates ColorLoop.'],
    ['Connect the shop', 'Add ColorConnect to prepare jobs once and follow every press.'],
  ],
  stepsCta: 'See the upgrade on colorloop.ai',
  newTitle: 'The same color, on every press',
  newLead: 'ColorLoop presets the ink keys on sheetfed offset, then corrects after each measured sheet. For commercial and packaging printers.',
  loop: [
    ['Preset', 'The ink keys are set from the job before the first sheet.'],
    ['Measure', 'Each measured sheet is compared with the target, zone by zone.'],
    ['Correct', 'ColorLoop proposes the corrections. The operator validates.'],
    ['Follow', 'Validated settings improve the next presets.'],
  ],
  operator: 'The operator keeps control. ColorLoop does the arithmetic.',
  newPrimary: 'Discover ColorLoop',
  newSecondary: 'Book a demo',
  agentsAlt: 'The five ColorLoop ink characters',
};

const FR: Copy = {
  switchCustomer: 'Déjà client Rutherford',
  switchNew: 'Nouveau chez Rutherford',
  headline: ['Client Rutherford ?', 'Passez à ColorLoop'],
  lead: 'Pour les utilisateurs EasySet-EasyLoop et IntelliSet-IntelliLoop. Gardez votre presse, votre pupitre et votre matériel Rutherford. ColorLoop s’ajoute par-dessus, sans réinstallation.',
  offerBig: '3 mois offerts',
  offerSmall: 'avec l’abonnement annuel',
  offerPrice: '5 300 € HT par presse et par an. Ou 590 € HT par mois, sans engagement.',
  primary: 'Passer à ColorLoop',
  secondary: 'Valider d’abord ma console',
  productAlt: 'ColorLoop sur le Lenovo ThinkCentre M90a, au pied de la presse',
  pressesLabel: 'Compatible avec ces presses',
  keepTitle: 'Même matériel. Nouveau logiciel.',
  keepLead: 'Rien à racheter, rien à réinstaller. La boucle s’ajoute à ce qui tourne déjà dans votre atelier.',
  keep: ['Votre presse et son pupitre', 'Votre matériel Rutherford', 'Votre licence Rutherford', 'Vos conducteurs'],
  gainTitle: 'Ce qui change à la presse',
  gain: [
    ['Création du travail automatique', 'Mapping couleur et détection de la barre de contrôle dès la création du travail.'],
    ['Préréglage en 30 secondes environ', 'Choisissez le travail, ColorLoop prérègle les clés d’encrage.'],
    ['Corrections après chaque feuille mesurée', 'Tirage après tirage, le conducteur garde la main.'],
    ['Une interface Windows moderne', 'Sous Windows 10 ou 11, au pied de la presse.'],
  ],
  licenseNote: 'Votre licence EasySet-EasyLoop ou IntelliSet-IntelliLoop reste la vôtre. Si vous arrêtez ColorLoop, vous continuez comme avant.',
  stepsTitle: 'Passer à ColorLoop en quatre étapes',
  steps: [
    ['Décrivez votre système', 'EasySet-EasyLoop ou IntelliSet-IntelliLoop, et vos presses.'],
    ['Voyez-le tourner', 'Une démo avec Rutherford, sur votre type de presse.'],
    ['Abonnez-vous, on active', 'En ligne. Rutherford vérifie votre système sous cinq jours ouvrés, puis active ColorLoop.'],
    ['Connectez l’atelier', 'Ajoutez ColorConnect pour préparer les travaux une fois et suivre chaque presse.'],
  ],
  stepsCta: 'Voir l’offre sur colorloop.ai',
  newTitle: 'La même couleur, sur toutes vos presses',
  newLead: 'ColorLoop prérègle les clés d’encrage en offset feuille à feuille, puis corrige après chaque feuille mesurée. Pour les imprimeurs de labeur et de packaging.',
  loop: [
    ['Prérégler', 'Les clés d’encrage sont réglées depuis le travail, avant la première feuille.'],
    ['Mesurer', 'Chaque feuille mesurée est comparée à la cible, zone par zone.'],
    ['Corriger', 'ColorLoop propose les corrections. Le conducteur valide.'],
    ['Suivre', 'Les réglages validés améliorent les prochains préréglages.'],
  ],
  operator: 'Le conducteur garde la main. ColorLoop fait les calculs.',
  newPrimary: 'Découvrir ColorLoop',
  newSecondary: 'Réserver une démo',
  agentsAlt: 'Les cinq personnages encre de ColorLoop',
};

// German, Italian, Spanish and Portuguese copy to follow once the direction is approved.
const COPY: Record<Locale, Copy> = { en: EN, fr: FR, de: EN, it: EN, es: EN, pt: EN };

export function ColorLoopHome() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const upgradeUrl = colorloopUrl(locale, 'rutherford-customers');

  return (
    <main className="page-shell clh" id="top">
      <SiteNav current="home" />

      <section className="clh-hero" aria-labelledby="clh-title">
        <video
          className="clh-hero-video"
          src={`${IMG}/press-night-loop.mp4`}
          poster={`${IMG}/press-night-poster.webp`}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="clh-hero-shade" aria-hidden="true" />

        <div className="clh-wrap clh-hero-grid">
          <div className="clh-hero-copy">
            <nav className="clh-audience" aria-label={t.switchCustomer}>
              <a href="#rutherford-customers" aria-current="true">{t.switchCustomer}</a>
              <a href="#new-to-rutherford">{t.switchNew}</a>
            </nav>

            <img className="clh-wordmark" src={`${IMG}/logo-white.png`} alt="ColorLoop" width={1204} height={272} />

            <h1 id="clh-title" className="clh-title">
              <span>{t.headline[0]}</span>
              <span>
                {t.headline[1]}
                <i className="clh-dot" aria-hidden="true">.</i>
              </span>
            </h1>

            <p className="clh-lead">{t.lead}</p>

            <div className="clh-offer">
              <p className="clh-offer-big">{t.offerBig}</p>
              <p className="clh-offer-small">{t.offerSmall}</p>
              <p className="clh-offer-price">{t.offerPrice}</p>
            </div>

            <div className="clh-actions">
              <a className="clh-btn clh-btn-light" href={upgradeUrl}>
                {t.primary}
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M7 4l6 6-6 6" /></svg>
              </a>
              <a className="clh-btn clh-btn-line" href={localPath(locale, '/console-validation')}>
                {t.secondary}
              </a>
            </div>
          </div>

          <figure className="clh-product">
            <img
              src={`${IMG}/colorloop-m90a-gen6-camera.webp`}
              alt={t.productAlt}
              width={1200}
              height={763}
            />
          </figure>
        </div>

        <div className="clh-wrap clh-presses">
          <p>{t.pressesLabel}</p>
          <ul>
            {PRESSES.map(([file, name]) => (
              <li key={file}>
                <img src={`${IMG}/presses/${file}.webp`} alt={name} loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="clh-customers" id="rutherford-customers" aria-labelledby="clh-keep">
        <div className="clh-wrap">
          <div className="clh-split">
            <div>
              <h2 id="clh-keep" className="clh-h2">
                {t.keepTitle}
              </h2>
              <p className="clh-body">{t.keepLead}</p>
              <ul className="clh-keep">
                {t.keep.map((item) => (
                  <li key={item}>
                    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M4 10.5l4 4 8-9" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="clh-note">{t.licenseNote}</p>
            </div>

            <div>
              <h3 className="clh-h3">{t.gainTitle}</h3>
              <dl className="clh-gain">
                {t.gain.map(([term, desc]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{desc}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <h3 className="clh-h3 clh-steps-title">{t.stepsTitle}</h3>
          <ol className="clh-steps">
            {t.steps.map(([title, desc]) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{desc}</span>
              </li>
            ))}
          </ol>
          <a className="clh-link" href={upgradeUrl}>
            {t.stepsCta}
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M7 4l6 6-6 6" /></svg>
          </a>
        </div>
      </section>

      <section className="clh-new" id="new-to-rutherford" aria-labelledby="clh-new-title">
        <div className="clh-wrap">
          <h2 id="clh-new-title" className="clh-h2 clh-h2-big">
            {t.newTitle}
            <i className="clh-dot" aria-hidden="true">.</i>
          </h2>
          <p className="clh-body clh-body-wide">{t.newLead}</p>

          <ol className="clh-loop">
            {t.loop.map(([title, desc], i) => (
              <li key={title} style={{ ['--agent' as string]: `url(${IMG}/agents/agent-${AGENTS[i]}-joie-small.webp)` }}>
                <span className="clh-loop-agent" aria-hidden="true" />
                <strong>{title}</strong>
                <span>{desc}</span>
              </li>
            ))}
          </ol>

          <p className="clh-operator">{t.operator}</p>

          <div className="clh-actions">
            <a className="clh-btn clh-btn-dark" href={colorloopUrl(locale)}>
              {t.newPrimary}
              <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M7 4l6 6-6 6" /></svg>
            </a>
            <a className="clh-btn clh-btn-outline" href={DEMO_URL}>
              {t.newSecondary}
            </a>
          </div>
        </div>
      </section>

      <ConsoleValidationCTA />
      <SiteFooter />
    </main>
  );
}
