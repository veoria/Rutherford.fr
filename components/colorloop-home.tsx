'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import HOME_LAYOUT from '@/data/home/layout.json';
import HELPS_COPY from '@/data/home/how-rutherford-helps.json';
import PPWR_COPY from '@/data/home/ppwr-section.json';
import { homeLink } from '@/lib/home-links';
import './colorloop-home.css';

// The current homepage's blocks, in the order of data/home/layout.json, so the
// team can keep, hide or reorder them from /dev/edit as before. Two of them are
// redrawn here (outcomes without pictograms, PPWR as plain text) and the old
// ColorLoop block is dropped: everything about ColorLoop now lives at the top.
const SECTIONS = {
  'roi-teaser': dynamic(() => import('@/components/roi-teaser').then((m) => m.RoiTeaser), { ssr: true }),
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

// The real screen's geometry in image units (1200 x 763, measured on the
// Lenovo photo by colorloop.ai): 6 units, 32 ink zones plus the sum column.
const ZONES = 32;
const UNITS = 6;
const zx = (z: number) => 121 + z * 30.48;
const uy = (u: number) => 150 + u * 89.8;
const UNIT_INK = ['#2b2726', '#008be3', '#d9007b', '#eacc00', '#ff8c00', '#f4b900'];
// A fixed demo pattern of measured results: 0 on target, 1 close, 2 out.
const MEASURED = Array.from({ length: UNITS }, (_, u) =>
  Array.from({ length: ZONES }, (_, z) => ((z * 7 + u * 11) % 13 === 0 ? 2 : (z * 5 + u * 3) % 9 === 0 ? 1 : 0))
);

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
  storyTitle: [string, string];
  storyLead: string;
  steps: { name: string; title: string; body: string }[];
  presetFig: [string, string, string, string];
  toastPreset: string;
  toastCorrect: string;
  operator: string;
  screenNote: string;
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
  storyTitle: ['See the color.', 'Control the run.'],
  storyLead: 'ColorLoop runs on a PC next to the press console. It works in three steps.',
  steps: [
    { name: 'Preset', title: 'Preset', body: 'Ink-key settings calculated from the plates, paper and ink, sent to the console before the first sheet.' },
    { name: 'Measure', title: 'Measure', body: 'Your operator scans the color bar. A color-coded view shows where each ink zone sits against its target.' },
    { name: 'Correct', title: 'Correct', body: 'Each zone is compared with its target and the corrections go to the console, after each measured sheet, pull after pull.' },
  ],
  presetFig: ['About 30 s', 'Automatic job setup', 'At least 10 min', 'Manual job setup'],
  toastPreset: 'Preset sent with success',
  toastCorrect: 'Correction sent with success',
  operator: 'Your operator stays in control.',
  screenNote: 'Real screen, demo job. The animation over it is an illustration with sample values.',
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
  storyTitle: ['Voyez la couleur.', 'Pilotez le tirage.'],
  storyLead: 'ColorLoop tourne sur un PC à côté du pupitre. Trois étapes.',
  steps: [
    { name: 'Prérégler', title: 'Prérégler', body: 'Les clés d’encrage sont calculées depuis les plaques, le papier et l’encre, puis envoyées au pupitre avant la première feuille.' },
    { name: 'Mesurer', title: 'Mesurer', body: 'Le conducteur scanne la barre de contrôle. Une vue en couleur montre où se situe chaque zone d’encrage par rapport à sa cible.' },
    { name: 'Corriger', title: 'Corriger', body: 'Chaque zone est comparée à sa cible et les corrections partent au pupitre, après chaque feuille mesurée, tirage après tirage.' },
  ],
  presetFig: ['30 s environ', 'Calage préparé automatiquement', 'Au moins 10 min', 'Calage préparé à la main'],
  toastPreset: 'Préréglage envoyé',
  toastCorrect: 'Correction envoyée',
  operator: 'Le conducteur garde la main.',
  screenNote: 'Écran réel, travail de démonstration. L’animation par-dessus est une illustration avec des valeurs d’exemple.',
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

/* ---------- The story: the real screen, animated in three steps ---------- */
const STEP_MS = [5200, 6200, 6200];

function Story({ t }: { t: Copy }) {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0); // 0 = not started, 1..3
  const [auto, setAuto] = useState(true);

  // Starts when the section comes into view, then plays the three steps once.
  useEffect(() => {
    const el = ref.current;
    if (!el || step > 0) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStep(1); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [step]);
  useEffect(() => {
    if (!auto || step === 0 || step >= 3) return;
    const id = setTimeout(() => setStep(step + 1), STEP_MS[step - 1]);
    return () => clearTimeout(id);
  }, [auto, step]);

  const go = (s: number) => { setAuto(false); setStep(0); requestAnimationFrame(() => setStep(s)); };
  const current = t.steps[Math.max(0, step - 1)];

  return (
    <section className="clh-story" ref={ref} data-step={step} aria-labelledby="clh-story-title">
      <div className="clh-wrap">
        <h2 id="clh-story-title" className="clh-h2">
          {t.storyTitle[0]}
          <br />
          {t.storyTitle[1]}
        </h2>
        <div className="clh-story-grid">
          <figure className="clh-cam">
            <img src={`${IMG}/pc-colorloop.webp`} alt="" width={1200} height={763} loading="lazy" />
            <svg className="clh-screen" viewBox="0 0 1200 763" aria-hidden="true">
              {MEASURED.map((row, u) => row.map((m, z) => (
                <rect
                  key={`${u}-${z}`}
                  className={`clh-pill m${m}`}
                  x={zx(z)} y={uy(u)} width={29} height={62} rx={4}
                  style={{ ['--ink' as string]: UNIT_INK[u], ['--z' as string]: z, ['--u' as string]: u }}
                />
              )))}
              <rect className="clh-beam" x={121} y={140} width={6} height={548} rx={3} />
            </svg>
            <p className="clh-toast clh-toast-preset"><i />{t.toastPreset}</p>
            <p className="clh-toast clh-toast-correct"><i />{t.toastCorrect}</p>
            <img className="clh-agent" src={`${IMG}/agent-vert-joie-small.webp`} alt="" width={180} height={146} loading="lazy" />
            <figcaption>{t.screenNote}</figcaption>
          </figure>

          <div className="clh-beats">
            <p className="clh-body">{t.storyLead}</p>
            <nav className="clh-rail" aria-label="ColorLoop steps">
              {t.steps.map((s, i) => (
                <button key={s.name} type="button" aria-current={step === i + 1 ? 'step' : undefined} onClick={() => go(i + 1)}>
                  <i>0{i + 1}</i> {s.name}
                </button>
              ))}
            </nav>
            <div className="clh-beat" key={step}>
              <h3>{current.title}</h3>
              <p>{current.body}</p>
              {step === 1 && (
                <div className="clh-setup">
                  <div><b>{t.presetFig[0]}</b><span>{t.presetFig[1]}</span><i className="clh-bar clh-bar-auto" /></div>
                  <div><b>{t.presetFig[2]}</b><span>{t.presetFig[3]}</span><i className="clh-bar clh-bar-man" /></div>
                </div>
              )}
              {step === 3 && <p className="clh-operator">{t.operator}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
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
        <p>{t.bandText}</p>
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
  const order = layout.order.filter((id) => !layout.hidden.includes(id) && id !== 'colorloop-section');

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

      <Story t={t} />

      <section className="clh-why" aria-labelledby="clh-why-title">
        <div className="clh-wrap">
          <h2 id="clh-why-title" className="clh-h2">{t.whyTitle}</h2>
          <p className="clh-body">{t.whyLead}</p>

          <div className="clh-warn" role="note">
            <p className="clh-warn-label">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5M12 18v.5" /></svg>
              {t.warnLabel}
            </p>
            <h3>{t.warnTitle}</h3>
            <p>{t.warnBody}</p>
            <dl>
              {t.warn.map(([term, desc]) => <div key={term}><dt>{term}</dt><dd>{desc}</dd></div>)}
            </dl>
            <p className="clh-fine">{t.warnNote} <a href={CRA_URL} rel="noopener">EUR-Lex</a></p>
          </div>

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
