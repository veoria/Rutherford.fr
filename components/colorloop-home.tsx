'use client';

import dynamic from 'next/dynamic';
import Script from 'next/script';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import HOME_LAYOUT from '@/data/home/layout.json';
import HELPS_COPY from '@/data/home/how-rutherford-helps.json';
import PPWR_COPY from '@/data/home/ppwr-section.json';
import { homeLink } from '@/lib/home-links';
import { STORY_MARKUP } from '@/components/colorloop-story-markup';
import './colorloop-home.css';

// The current homepage's blocks, in the order of data/home/layout.json, so the
// team can keep, hide or reorder them from /dev/edit as before. Two of them are
// redrawn here (outcomes without pictograms, PPWR as plain text) and the old
// ColorLoop block is dropped: everything about ColorLoop now lives at the top.
const RoiTeaser = dynamic(() => import('@/components/roi-teaser').then((m) => m.RoiTeaser), { ssr: true });
const SECTIONS = {
  'rutherford-identity-section': dynamic(() => import('@/components/rutherford-identity-section').then((m) => m.RutherfordIdentitySection), { ssr: true }),
  'brand-explainer-section': dynamic(() => import('@/components/brand-explainer-section').then((m) => m.BrandExplainerSection), { ssr: true }),
  'case-studies-showcase': dynamic(() => import('@/components/case-studies-showcase').then((m) => m.CaseStudiesShowcase), { ssr: true }),
  'console-validation-cta': dynamic(() => import('@/components/console-validation-cta').then((m) => m.ConsoleValidationCTA), { ssr: true }),
  'how-rutherford-helps': Outcomes,
  'audience-section': dynamic(() => import('@/components/audience-section').then((m) => m.AudienceSection), { ssr: true }),
  'ppwr-section': Regulation,
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

const PRESSES = [
  ['heidelberg', 'Heidelberg'], ['komori', 'Komori'], ['koenig-bauer', 'Koenig & Bauer'], ['manroland', 'Manroland'],
  ['mitsubishi', 'Mitsubishi'], ['ryobi', 'Ryobi'], ['goss', 'Goss'], ['presstek', 'Presstek'],
] as const;

// Short films from colorloop.ai: a silent loop in the card, the YouTube Short on click.
const CLIPS = [
  { file: 'speedmaster-xl', yt: 'o5vBn7sEsWk', title: 'Speedmaster XL with ColorLoop', length: '0:26' },
  { file: 'press-loop-pink', yt: '1oJFkrJ7KZQ', title: 'ColorLoop on Manroland', length: '0:17' },
  { file: 'cylinder', yt: 'UvM4pLFD89M', title: 'ColorLoop on Heidelberg Speedmaster', length: '0:26' },
];
const FACES = ['r7_4EdplcdE', 'ut247z4ren8', 'yAZbtKzN_j0'];

type Copy = {
  title: [string, string];
  lead: string;
  primary: string;
  secondaryPrefix: string;
  secondary: string;
  dotsAlt: string;
  pressesLabel: string;
  clipsTitle: string;
  clipsLead: string;
  clipsLink: string;
  playFilm: string;
  whyTitle: string;
  whyLead: string;
  warnLabel: string;
  warnTitle: string;
  warnBody: string;
  warn: [string, string][];
  warnNote: string;
  pcTitle: string;
  pcYours: [string, string];
  pcOurs: [string, string, string];
  offer: string;
  offerDetail: string;
  switchCta: string;
  checkCta: string;
  bandText: string;
  bandCta: string;
  outcomesCta: string;
  regulationCta: string;
};

const EN: Copy = {
  title: ['Rutherford customer?', 'Switch to ColorLoop'],
  lead: 'Same press, same console. 3 months free.',
  primary: 'Switch to ColorLoop',
  secondaryPrefix: 'New to Rutherford?',
  secondary: 'Discover ColorLoop',
  dotsAlt: 'The five ColorLoop ink dots: red, pink, blue, yellow and green',
  pressesLabel: 'Works on these presses',
  clipsTitle: 'On real presses.',
  clipsLead: '1,000+ systems in 30+ countries. Pick a film to play it.',
  clipsLink: 'Watch the customer stories',
  playFilm: 'Play the film',
  whyTitle: 'Why change now',
  whyLead: 'Your Rutherford system keeps running. The PC under it may not.',
  warnLabel: 'Security',
  warnTitle: 'Windows 10 is no longer updated.',
  warnBody: 'Microsoft ended Windows 10 support on October 14, 2025. A press PC that no longer receives security updates is exposed, and your production with it.',
  warn: [
    ['Windows 11', 'ColorLoop runs on Windows 10 or 11. The ColorLoop PC ships with Windows 11.'],
    ['Updates included', 'Software, updates and support come with the subscription.'],
    ['Cyber Resilience Act', 'EU regulation 2024/2847: reporting since September 11, 2026, main obligations from December 11, 2027.'],
  ],
  warnNote: 'Applicability depends on the product and each party’s role. This is not a statement of certification.',
  pcTitle: 'Your PC, or ours',
  pcYours: ['Keep your PC', 'Windows 10 or 11. ColorLoop is installed on it.'],
  pcOurs: ['Add the ColorLoop PC', 'Lenovo ThinkCentre M90a, Windows 11, ColorLoop installed, ready at the press.', '+€1,650 one-time, excl. VAT'],
  offer: '3 months free',
  offerDetail: 'with the yearly plan: €5,300 a year per press, excl. VAT. Or €590 a month, no commitment. Your Rutherford license stays yours.',
  switchCta: 'Switch to ColorLoop',
  checkCta: 'Check your press',
  bandText: 'Rutherford customer? Same press, same console. 3 months free.',
  bandCta: 'Switch to ColorLoop',
  outcomesCta: 'Switch to ColorLoop',
  regulationCta: 'Discover PPWR Connect',
};

const FR: Copy = {
  title: ['Client Rutherford ?', 'Passez à ColorLoop'],
  lead: 'Même presse, même pupitre. 3 mois offerts.',
  primary: 'Passer à ColorLoop',
  secondaryPrefix: 'Nouveau chez Rutherford ?',
  secondary: 'Découvrir ColorLoop',
  dotsAlt: 'Les cinq dots ColorLoop : rouge, rose, bleu, jaune et vert',
  pressesLabel: 'Compatible avec ces presses',
  clipsTitle: 'Sur de vraies presses.',
  clipsLead: '1 000+ systèmes dans 30+ pays. Choisissez un film pour le lancer.',
  clipsLink: 'Voir les témoignages clients',
  playFilm: 'Lancer le film',
  whyTitle: 'Pourquoi changer maintenant',
  whyLead: 'Votre système Rutherford continue de tourner. Le PC qui est dessous, peut-être pas.',
  warnLabel: 'Sécurité',
  warnTitle: 'Windows 10 n’est plus mis à jour.',
  warnBody: 'Microsoft a arrêté le support de Windows 10 le 14 octobre 2025. Un PC de presse qui ne reçoit plus de mises à jour de sécurité est exposé, et votre production avec lui.',
  warn: [
    ['Windows 11', 'ColorLoop tourne sous Windows 10 ou 11. Le PC ColorLoop est livré sous Windows 11.'],
    ['Mises à jour incluses', 'Logiciel, mises à jour et support sont compris dans l’abonnement.'],
    ['Cyber Resilience Act', 'Règlement UE 2024/2847 : signalement depuis le 11 septembre 2026, obligations principales au 11 décembre 2027.'],
  ],
  warnNote: 'L’applicabilité dépend du produit et du rôle de chacun. Ceci n’est pas une déclaration de certification.',
  pcTitle: 'Votre PC, ou le nôtre',
  pcYours: ['Gardez votre PC', 'Windows 10 ou 11. ColorLoop s’y installe.'],
  pcOurs: ['Ajoutez le PC ColorLoop', 'Lenovo ThinkCentre M90a, Windows 11, ColorLoop installé, prêt au pied de la presse.', '+1 650 € HT, en une fois'],
  offer: '3 mois offerts',
  offerDetail: 'avec l’abonnement annuel : 5 300 € HT par presse et par an. Ou 590 € HT par mois, sans engagement. Votre licence Rutherford reste la vôtre.',
  switchCta: 'Passer à ColorLoop',
  checkCta: 'Valider ma console',
  bandText: 'Client Rutherford ? Même presse, même pupitre. 3 mois offerts.',
  bandCta: 'Passer à ColorLoop',
  outcomesCta: 'Passer à ColorLoop',
  regulationCta: 'Découvrir PPWR Connect',
};

// German, Italian, Spanish and Portuguese copy to follow once the direction is approved.
const COPY: Record<Locale, Copy> = { en: EN, fr: FR, de: EN, it: EN, es: EN, pt: EN };

function useCopy() {
  const { locale } = useLanguage();
  return { locale, t: COPY[locale], upgradeUrl: colorloopUrl(locale, 'rutherford-customers') };
}

function playClip(e: React.SyntheticEvent<HTMLAnchorElement>) {
  const v = e.currentTarget.querySelector('video');
  if (!v) return;
  if (!v.src) v.src = v.dataset.src ?? '';
  v.play().catch(() => {});
}
function pauseClip(e: React.SyntheticEvent<HTMLAnchorElement>) {
  e.currentTarget.querySelector('video')?.pause();
}

/* ---------- The story: colorloop.ai's own section and script ---------- */
function Story({ locale }: { locale: Locale }) {
  const html = STORY_MARKUP[locale === 'fr' ? 'fr' : 'en'];
  return (
    <>
      <link rel="stylesheet" href="/colorloop-story/home-story.css" />
      <div className="clh-story" dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/colorloop-story/motion.js" strategy="afterInteractive" />
      <Script src="/colorloop-story/home-story.js" strategy="afterInteractive" />
    </>
  );
}

/* ---------- Outcomes, redrawn without pictograms ---------- */
function Outcomes() {
  const { locale, t, upgradeUrl } = useCopy();
  const c = (HELPS_COPY as Record<Locale, { kicker: string; headline: string; intro: string; benefits: { title: string; body: string }[] }>)[locale];
  return (
    <section className="clh-outcomes" id="how" aria-labelledby="clh-outcomes-title">
      <div className="clh-wrap">
        <h2 id="clh-outcomes-title" className="clh-h2">{c.headline}</h2>
        <p className="clh-body">{c.intro}</p>
        <ol className="clh-outcomes-list">
          {c.benefits.map((b) => (
            <li key={b.title}>
              <strong>{b.title}</strong>
              <span>{b.body}</span>
            </li>
          ))}
        </ol>
        <a className="clh-btn clh-btn-ink" href={upgradeUrl}>{t.outcomesCta}</a>
      </div>
    </section>
  );
}

/* ---------- PPWR and DPP, as plain text ---------- */
function Regulation() {
  const { locale, t } = useCopy();
  const c = (PPWR_COPY as Record<Locale, { title: string; tagline: string; ppwrTitle: string; ppwrBody: string; dppTitle: string; dppBody: string }>)[locale];
  return (
    <section className="clh-reg" id="ppwr" aria-labelledby="clh-reg-title">
      <div className="clh-wrap clh-reg-grid">
        <div>
          <h2 id="clh-reg-title" className="clh-h2">{c.title}</h2>
          <p className="clh-body">{c.tagline}</p>
          <a className="clh-btn clh-btn-outline" href={homeLink('ppwr-section.ppwrConnect')} target="_blank" rel="noreferrer">{t.regulationCta}</a>
        </div>
        <dl className="clh-reg-list">
          <div><dt>{c.ppwrTitle}</dt><dd>{c.ppwrBody}</dd></div>
          <div><dt>{c.dppTitle}</dt><dd>{c.dppBody}</dd></div>
        </dl>
      </div>
    </section>
  );
}

/* ---------- A slim reminder between the Rutherford blocks ---------- */
function SwitchBand() {
  const { t, upgradeUrl } = useCopy();
  return (
    <aside className="clh-band">
      <div className="clh-wrap">
        <p>
          <img src="/images/rutherford-logo-white.png" alt="Rutherford.fr" width={900} height={300} />
          {t.bandText}
        </p>
        <a className="clh-btn" href={upgradeUrl}>{t.bandCta}</a>
      </div>
    </aside>
  );
}

export function ColorLoopHome() {
  const { locale, t, upgradeUrl } = useCopy();
  const discoverUrl = colorloopUrl(locale);
  const checkUrl = localPath(locale, '/console-validation');
  const layout = HOME_LAYOUT as { order: string[]; hidden: string[] };
  // The ROI teaser moves up under the story; the old ColorLoop block is dropped.
  const order = layout.order.filter((id) => !layout.hidden.includes(id) && id !== 'colorloop-section' && id !== 'roi-teaser');

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
          <div className="clh-presses">
            <p>{t.pressesLabel}</p>
            <div className="clh-marquee" aria-hidden="true">
              <ul>
                {[...PRESSES, ...PRESSES].map(([file, name], i) => (
                  <li key={`${file}-${i}`}><img src={`${IMG}/presses/${file}.webp`} alt={i < PRESSES.length ? name : ''} loading="lazy" /></li>
                ))}
              </ul>
            </div>
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
              <a className="clh-faces-link" href="#cases">
                <span className="clh-faces" aria-hidden="true">
                  {FACES.map((id) => <img key={id} src={`${IMG}/faces/face-${id}.webp`} alt="" width={96} height={96} loading="lazy" />)}
                </span>
                <span>{t.clipsLink}</span>
              </a>
            </div>
            <ul className="clh-clip-list">
              {CLIPS.map((c) => (
                <li key={c.yt}>
                  <a className="clh-clip" href={`https://www.youtube.com/shorts/${c.yt}`} target="_blank" rel="noopener" aria-label={`${t.playFilm}: ${c.title}, ${c.length}`} onMouseEnter={playClip} onFocus={playClip} onMouseLeave={pauseClip} onBlur={pauseClip}>
                    <video muted loop playsInline preload="none" poster={`${IMG}/clips/${c.file}-poster.webp`} data-src={`${IMG}/clips/${c.file}.mp4`} aria-hidden="true" tabIndex={-1} />
                    <span className="clh-clip-t"><i aria-hidden="true" /><b>{c.title}</b><span>{c.length}</span></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Story locale={locale} />
      <RoiTeaser />

      <section className="clh-warn" aria-labelledby="clh-warn-title" role="region">
        <div className="clh-wrap">
          <p className="clh-warn-label">
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5M12 18v.5" /></svg>
            {t.warnLabel}
          </p>
          <h2 id="clh-warn-title">{t.warnTitle}</h2>
          <p className="clh-warn-body">{t.warnBody}</p>
          <dl>
            {t.warn.map(([term, desc]) => <div key={term}><dt>{term}</dt><dd>{desc}</dd></div>)}
          </dl>
          <p className="clh-fine">{t.warnNote} <a href={CRA_URL} rel="noopener">EUR-Lex</a></p>
        </div>
      </section>

      <section className="clh-why" aria-labelledby="clh-why-title">
        <div className="clh-wrap">
          <h2 id="clh-why-title" className="clh-h2">{t.whyTitle}</h2>
          <p className="clh-body">{t.whyLead}</p>

          <div className="clh-why-grid">
            <div>
              <h3 className="clh-h3">{t.pcTitle}</h3>
              <div className="clh-choice">
                <div><strong>{t.pcYours[0]}</strong><span>{t.pcYours[1]}</span></div>
                <div><strong>{t.pcOurs[0]}</strong><span>{t.pcOurs[1]}</span><em>{t.pcOurs[2]}</em></div>
              </div>
            </div>
            <div>
              <p className="clh-offer"><strong>{t.offer}</strong> {t.offerDetail}</p>
              <div className="clh-actions clh-actions-left">
                <a className="clh-btn clh-btn-ink" href={upgradeUrl}>{t.switchCta}</a>
                <a className="clh-btn clh-btn-outline" href={checkUrl}>{t.checkCta}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {order.map((id) => {
        const Section = SECTIONS[id as keyof typeof SECTIONS];
        if (!Section) return null;
        return (
          <div key={id} className="clh-block">
            <Section />
            {id === 'brand-explainer-section' && <SwitchBand />}
          </div>
        );
      })}

      <SiteFooter />
    </main>
  );
}
