'use client';

import dynamic from 'next/dynamic';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import HOME_LAYOUT from '@/data/home/layout.json';
import './colorloop-home.css';

// The current homepage's blocks, in the order of data/home/layout.json, so the
// team can keep, hide or reorder them from /dev/edit as before.
const SECTIONS = {
  'roi-teaser': dynamic(() => import('@/components/roi-teaser').then((m) => m.RoiTeaser), { ssr: true }),
  'rutherford-identity-section': dynamic(() => import('@/components/rutherford-identity-section').then((m) => m.RutherfordIdentitySection), { ssr: true }),
  'brand-explainer-section': dynamic(() => import('@/components/brand-explainer-section').then((m) => m.BrandExplainerSection), { ssr: true }),
  'case-studies-showcase': dynamic(() => import('@/components/case-studies-showcase').then((m) => m.CaseStudiesShowcase), { ssr: true }),
  'console-validation-cta': dynamic(() => import('@/components/console-validation-cta').then((m) => m.ConsoleValidationCTA), { ssr: true }),
  'how-rutherford-helps': dynamic(() => import('@/components/how-rutherford-helps').then((m) => m.HowRutherfordHelps), { ssr: true }),
  'colorloop-section': dynamic(() => import('@/components/colorloop-section').then((m) => m.ColorLoopSection), { ssr: true }),
  'audience-section': dynamic(() => import('@/components/audience-section').then((m) => m.AudienceSection), { ssr: true }),
  'ppwr-section': dynamic(() => import('@/components/ppwr-section').then((m) => m.PPWRSection), { ssr: true }),
  'blog-preview-section': dynamic(() => import('@/components/blog-preview-section').then((m) => m.BlogPreviewSection), { ssr: true }),
  'team-showcase': dynamic(() => import('@/components/team-showcase').then((m) => m.TeamShowcase), { ssr: true }),
};
const SiteFooter = dynamic(() => import('@/components/site-footer').then((m) => m.SiteFooter), { ssr: true });

const IMG = '/images/colorloop-ai';
const CRA_URL = 'https://eur-lex.europa.eu/eli/reg/2024/2847/oj';

// colorloop.ai has en / fr / es / it / pt; German readers land on the English pages.
const CL_LOCALES: Locale[] = ['fr', 'es', 'it', 'pt'];
function colorloopUrl(locale: Locale, page = '') {
  const prefix = CL_LOCALES.includes(locale) ? `/${locale}` : '';
  return `https://colorloop.ai${prefix}/${page}`;
}
function localPath(locale: Locale, path: string) {
  return locale === 'en' ? path : `/${locale}${path}`;
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

// Short films from colorloop.ai: a silent loop in the card, the YouTube Short on click.
const CLIPS = [
  { file: 'speedmaster-xl', yt: 'o5vBn7sEsWk', title: 'Speedmaster XL with ColorLoop', length: '0:26' },
  { file: 'press-loop-pink', yt: '1oJFkrJ7KZQ', title: 'ColorLoop on Manroland', length: '0:17' },
  { file: 'cylinder', yt: 'UvM4pLFD89M', title: 'ColorLoop on Heidelberg Speedmaster', length: '0:26' },
];

type Copy = {
  title: [string, string];
  lead: string;
  primary: string;
  secondaryPrefix: string;
  secondary: string;
  dotsAlt: string;
  clipsTitle: string;
  clipsLead: string;
  clipsLink: string;
  playFilm: string;
  keepTitle: [string, string];
  keepLead: string;
  keep: [string, string][];
  offer: string;
  offerDetail: string;
  pcTitle: string;
  pcYours: [string, string];
  pcOurs: [string, string, string];
  secTitle: string;
  sec: [string, string][];
  secNote: string;
  switchCta: string;
  checkCta: string;
  keepPhotoAlt: string;
};

const EN: Copy = {
  title: ['Rutherford customer?', 'Switch to ColorLoop'],
  lead: 'Same press, same console. 3 months free.',
  primary: 'Switch to ColorLoop',
  secondaryPrefix: 'New to Rutherford?',
  secondary: 'Discover ColorLoop',
  dotsAlt: 'The five ColorLoop ink dots: red, pink, blue, yellow and green',
  clipsTitle: 'On real presses.',
  clipsLead: '1,000+ systems in 30+ countries. Pick a film to play it.',
  clipsLink: 'Watch the customer stories',
  playFilm: 'Play the film',
  keepTitle: ['Keep everything.', 'Change the software.'],
  keepLead: 'For EasySet-EasyLoop and IntelliSet-IntelliLoop. Nothing to reinstall.',
  keep: [
    ['Job setup in about 30 seconds', 'Colorbar found, ink keys preset.'],
    ['Corrections after each measured sheet', 'Your operator keeps control.'],
    ['Your Rutherford license stays yours', 'Stop ColorLoop, keep working as before.'],
  ],
  offer: '3 months free',
  offerDetail: 'with the yearly plan: €5,300 a year per press, excl. VAT. Or €590 a month, no commitment.',
  pcTitle: 'Your PC, or ours',
  pcYours: ['Keep your PC', 'Windows 10 or 11.'],
  pcOurs: ['Add the ColorLoop PC', 'Lenovo ThinkCentre M90a, Windows 11, ColorLoop installed.', '+€1,650 one-time, excl. VAT'],
  secTitle: 'Security, up to date',
  sec: [
    ['Windows 11', 'Windows 10 support ended on October 14, 2025. The ColorLoop PC ships with Windows 11.'],
    ['Updates included', 'Software, updates and support come with the subscription.'],
    ['Cyber Resilience Act', 'EU regulation 2024/2847: reporting since September 11, 2026, main obligations from December 11, 2027.'],
  ],
  secNote: 'Applicability depends on the product and each party’s role. This is not a statement of certification.',
  switchCta: 'Switch to ColorLoop',
  checkCta: 'Check your press',
  keepPhotoAlt: 'An operator at the ColorLoop screen next to the press',
};

const FR: Copy = {
  title: ['Client Rutherford ?', 'Passez à ColorLoop'],
  lead: 'Même presse, même pupitre. 3 mois offerts.',
  primary: 'Passer à ColorLoop',
  secondaryPrefix: 'Nouveau chez Rutherford ?',
  secondary: 'Découvrir ColorLoop',
  dotsAlt: 'Les cinq dots ColorLoop : rouge, rose, bleu, jaune et vert',
  clipsTitle: 'Sur de vraies presses.',
  clipsLead: '1 000+ systèmes dans 30+ pays. Choisissez un film pour le lancer.',
  clipsLink: 'Voir les témoignages clients',
  playFilm: 'Lancer le film',
  keepTitle: ['Gardez tout.', 'Changez de logiciel.'],
  keepLead: 'Pour EasySet-EasyLoop et IntelliSet-IntelliLoop. Rien à réinstaller.',
  keep: [
    ['Calage préparé en 30 secondes environ', 'Barre de contrôle détectée, clés d’encrage préréglées.'],
    ['Corrections après chaque feuille mesurée', 'Le conducteur garde la main.'],
    ['Votre licence Rutherford reste la vôtre', 'Arrêtez ColorLoop, vous continuez comme avant.'],
  ],
  offer: '3 mois offerts',
  offerDetail: 'avec l’abonnement annuel : 5 300 € HT par presse et par an. Ou 590 € HT par mois, sans engagement.',
  pcTitle: 'Votre PC, ou le nôtre',
  pcYours: ['Gardez votre PC', 'Windows 10 ou 11.'],
  pcOurs: ['Ajoutez le PC ColorLoop', 'Lenovo ThinkCentre M90a, Windows 11, ColorLoop installé.', '+1 650 € HT, en une fois'],
  secTitle: 'Sécurité à jour',
  sec: [
    ['Windows 11', 'Le support de Windows 10 est terminé depuis le 14 octobre 2025. Le PC ColorLoop est livré sous Windows 11.'],
    ['Mises à jour incluses', 'Logiciel, mises à jour et support sont compris dans l’abonnement.'],
    ['Cyber Resilience Act', 'Règlement UE 2024/2847 : signalement depuis le 11 septembre 2026, obligations principales au 11 décembre 2027.'],
  ],
  secNote: 'L’applicabilité dépend du produit et du rôle de chacun. Ceci n’est pas une déclaration de certification.',
  switchCta: 'Passer à ColorLoop',
  checkCta: 'Valider ma console',
  keepPhotoAlt: 'Un conducteur devant l’écran ColorLoop, au pied de la presse',
};

// German, Italian, Spanish and Portuguese copy to follow once the direction is approved.
const COPY: Record<Locale, Copy> = { en: EN, fr: FR, de: EN, it: EN, es: EN, pt: EN };

function playClip(e: React.SyntheticEvent<HTMLAnchorElement>) {
  const v = e.currentTarget.querySelector('video');
  if (!v) return;
  if (!v.src) v.src = v.dataset.src ?? '';
  v.play().catch(() => {});
}
function pauseClip(e: React.SyntheticEvent<HTMLAnchorElement>) {
  e.currentTarget.querySelector('video')?.pause();
}

export function ColorLoopHome() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const upgradeUrl = colorloopUrl(locale, 'rutherford-customers');
  const discoverUrl = colorloopUrl(locale);
  const checkUrl = localPath(locale, '/console-validation');
  const layout = HOME_LAYOUT as { order: string[]; hidden: string[] };

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
              <span key={name} className="clh-ink" style={{ ['--i' as string]: i, ['--dw' as string]: w, ['--dh' as string]: h }}>
                <img src={`${IMG}/dots/dot-${name}-neutre-640.webp`} alt="" decoding="async" />
                <img className="clh-ink-joy" src={`${IMG}/dots/dot-${name}-joie-640.webp`} alt="" decoding="async" />
              </span>
            ))}
          </div>
        </div>

        <div className="clh-clips-band">
          <div className="clh-wrap clh-clips">
            <div className="clh-clips-copy">
              <h2 className="clh-h2">{t.clipsTitle}</h2>
              <p className="clh-body">{t.clipsLead}</p>
              <a className="clh-textlink" href="#cases">{t.clipsLink}</a>
            </div>
            <ul className="clh-clip-list">
              {CLIPS.map((c) => (
                <li key={c.yt}>
                  <a
                    className="clh-clip"
                    href={`https://www.youtube.com/shorts/${c.yt}`}
                    target="_blank"
                    rel="noopener"
                    aria-label={`${t.playFilm}: ${c.title}, ${c.length}`}
                    onMouseEnter={playClip}
                    onFocus={playClip}
                    onMouseLeave={pauseClip}
                    onBlur={pauseClip}
                  >
                    <video muted loop playsInline preload="none" poster={`${IMG}/clips/${c.file}-poster.webp`} data-src={`${IMG}/clips/${c.file}.mp4`} aria-hidden="true" tabIndex={-1} />
                    <span className="clh-clip-t">
                      <i aria-hidden="true" />
                      <b>{c.title}</b>
                      <span>{c.length}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="clh-keep" aria-labelledby="clh-keep-title">
        <div className="clh-wrap clh-keep-grid">
          <div className="clh-keep-media">
            <figure className="clh-photo">
              <img src={`${IMG}/photos/dsc6999.webp`} alt={t.keepPhotoAlt} width={1200} height={798} loading="lazy" />
            </figure>
            <div className="clh-choice">
              <p className="clh-h3">{t.pcTitle}</p>
              <div>
                <strong>{t.pcYours[0]}</strong>
                <span>{t.pcYours[1]}</span>
              </div>
              <div>
                <strong>{t.pcOurs[0]}</strong>
                <span>{t.pcOurs[1]}</span>
                <em>{t.pcOurs[2]}</em>
              </div>
            </div>
          </div>

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

            <p className="clh-h3">{t.secTitle}</p>
            <dl className="clh-sec">
              {t.sec.map(([term, desc]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{desc}</dd>
                </div>
              ))}
            </dl>
            <p className="clh-fine">
              {t.secNote} <a href={CRA_URL} rel="noopener">EUR-Lex</a>
            </p>

            <div className="clh-actions clh-actions-left">
              <a className="clh-btn clh-btn-ink" href={upgradeUrl}>{t.switchCta}</a>
              <a className="clh-btn clh-btn-outline" href={checkUrl}>{t.checkCta}</a>
            </div>
          </div>
        </div>
      </section>

      {layout.order
        .filter((id) => !layout.hidden.includes(id))
        .map((id) => {
          const Section = SECTIONS[id as keyof typeof SECTIONS];
          return Section ? <Section key={id} /> : null;
        })}

      <SiteFooter />
    </main>
  );
}
