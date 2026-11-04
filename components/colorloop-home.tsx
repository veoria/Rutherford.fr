'use client';

import { useEffect, useState } from 'react';
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
  secondary: string;
  dotsAlt: string;
  pressesLabel: string;
  clipsTitle: string;
  clipsLead: string;
  clipsLink: string;
  playFilm: string;
  warnLabel: string;
  warnTitle: string;
  warnBody: string;
  warn: [string, string][];
  warnNote: string;
  cfgTitle: string;
  cfgLead: string;
  cfgPlan: string;
  cfgYearly: [string, string];
  cfgMonthly: [string, string];
  promo: string;
  cfgPc: string;
  cfgPcMine: [string, string];
  cfgPcOurs: [string, string];
  cfgPresses: string;
  cfgToday: string;
  cfgThenYear: string;
  cfgThenMonth: string;
  cfgLicense: string;
  orderCta: string;
  checkCta: string;
  outcomesCta: string;
  regulationCta: string;
};

const EN: Copy = {
  title: ['Rutherford customer?', 'Switch to ColorLoop'],
  lead: 'Same press, same console. 3 months free.',
  primary: 'Switch to ColorLoop',
  secondary: 'New to Rutherford?',
  dotsAlt: 'The five ColorLoop ink dots: red, pink, blue, yellow and green',
  pressesLabel: 'Works on these presses',
  clipsTitle: 'On real presses.',
  clipsLead: '1,000+ systems in 30+ countries.',
  clipsLink: 'Watch the customer stories',
  playFilm: 'Play the film',
  warnLabel: 'Security',
  warnTitle: 'Windows 10 is no longer updated.',
  warnBody: 'Microsoft ended Windows 10 support on October 14, 2025. A press PC that no longer receives security updates is exposed, and your production with it.',
  warn: [
    ['Windows 11', 'ColorLoop runs on Windows 10 or 11. The ColorLoop PC ships with Windows 11.'],
    ['Updates included', 'Software, updates and support come with the subscription.'],
    ['Cyber Resilience Act', 'EU regulation 2024/2847: reporting since September 11, 2026, main obligations from December 11, 2027.'],
  ],
  warnNote: 'Applicability depends on the product and each party’s role. This is not a statement of certification.',
  cfgTitle: 'Prepare your ColorLoop.',
  cfgLead: 'Three choices. Then order online, Rutherford checks your system and activates it.',
  cfgPlan: 'Plan',
  cfgYearly: ['Yearly', '€5,300 per press and year'],
  cfgMonthly: ['Monthly', '€590 per press and month, no commitment'],
  promo: 'Promotion · 3 months free',
  cfgPc: 'PC',
  cfgPcMine: ['Keep my PC', 'Windows 10 or 11. ColorLoop is installed on it.'],
  cfgPcOurs: ['ColorLoop PC', 'Lenovo ThinkCentre M90a, Windows 11, ColorLoop installed. +€1,650 one-time.'],
  cfgPresses: 'Presses',
  cfgToday: 'Today, excl. VAT',
  cfgThenYear: 'then {x} a year',
  cfgThenMonth: 'then {x} a month',
  cfgLicense: 'Your Rutherford license stays yours.',
  orderCta: 'Order',
  checkCta: 'Check your press',
  outcomesCta: 'Switch to ColorLoop',
  regulationCta: 'Discover PPWR Connect',
};

const FR: Copy = {
  title: ['Client Rutherford ?', 'Passez à ColorLoop'],
  lead: 'Même presse, même pupitre. 3 mois offerts.',
  primary: 'Passer à ColorLoop',
  secondary: 'Nouveau chez Rutherford ?',
  dotsAlt: 'Les cinq dots ColorLoop : rouge, rose, bleu, jaune et vert',
  pressesLabel: 'Compatible avec ces presses',
  clipsTitle: 'Sur de vraies presses.',
  clipsLead: '1 000+ systèmes dans 30+ pays.',
  clipsLink: 'Voir les témoignages clients',
  playFilm: 'Lancer le film',
  warnLabel: 'Sécurité',
  warnTitle: 'Windows 10 n’est plus mis à jour.',
  warnBody: 'Microsoft a arrêté le support de Windows 10 le 14 octobre 2025. Un PC de presse qui ne reçoit plus de mises à jour de sécurité est exposé, et votre production avec lui.',
  warn: [
    ['Windows 11', 'ColorLoop tourne sous Windows 10 ou 11. Le PC ColorLoop est livré sous Windows 11.'],
    ['Mises à jour incluses', 'Logiciel, mises à jour et support sont compris dans l’abonnement.'],
    ['Cyber Resilience Act', 'Règlement UE 2024/2847 : signalement depuis le 11 septembre 2026, obligations principales au 11 décembre 2027.'],
  ],
  warnNote: 'L’applicabilité dépend du produit et du rôle de chacun. Ceci n’est pas une déclaration de certification.',
  cfgTitle: 'Préparez votre ColorLoop.',
  cfgLead: 'Trois choix. Puis commandez en ligne, Rutherford vérifie votre système et l’active.',
  cfgPlan: 'Abonnement',
  cfgYearly: ['Annuel', '5 300 € HT par presse et par an'],
  cfgMonthly: ['Mensuel', '590 € HT par presse et par mois, sans engagement'],
  promo: 'Promotion · 3 mois offerts',
  cfgPc: 'PC',
  cfgPcMine: ['Je garde mon PC', 'Windows 10 ou 11. ColorLoop s’y installe.'],
  cfgPcOurs: ['PC ColorLoop', 'Lenovo ThinkCentre M90a, Windows 11, ColorLoop installé. +1 650 € HT en une fois.'],
  cfgPresses: 'Presses',
  cfgToday: 'Aujourd’hui, HT',
  cfgThenYear: 'puis {x} par an',
  cfgThenMonth: 'puis {x} par mois',
  cfgLicense: 'Votre licence Rutherford reste la vôtre.',
  orderCta: 'Commander',
  checkCta: 'Valider ma console',
  outcomesCta: 'Passer à ColorLoop',
  regulationCta: 'Découvrir PPWR Connect',
};

// German, Italian, Spanish and Portuguese copy to follow once the direction is approved.
const COPY: Record<Locale, Copy> = { en: EN, fr: FR, de: EN, it: EN, es: EN, pt: EN };

function useCopy() {
  const { locale } = useLanguage();
  return { locale, t: COPY[locale], upgradeUrl: colorloopUrl(locale, 'rutherford-customers') };
}

/* ---------- The press films play on their own once in view ---------- */
function useClipsAutoplay() {
  useEffect(() => {
    const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('.clh-clip video'));
    if (!videos.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) {
          if (!v.src) v.src = v.dataset.src ?? '';
          v.play().catch(() => {});
        } else v.pause();
      });
    }, { threshold: 0.35 });
    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);
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

/* ---------- Prepare your ColorLoop: plan, PC, presses, then order ---------- */
const PRICE = { yearly: 5300, monthly: 590, pc: 1650 };

function Configurator({ locale, t, upgradeUrl, checkUrl }: { locale: Locale; t: Copy; upgradeUrl: string; checkUrl: string }) {
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [pc, setPc] = useState<'mine' | 'ours'>('ours');
  const [presses, setPresses] = useState(1);
  const money = (n: number) => (locale === 'en' ? `€${n.toLocaleString('en-US')}` : `${n.toLocaleString('fr-FR')} €`);
  const recurring = (plan === 'yearly' ? PRICE.yearly : PRICE.monthly) * presses;
  const today = recurring + (pc === 'ours' ? PRICE.pc * presses : 0);
  const then = (plan === 'yearly' ? t.cfgThenYear : t.cfgThenMonth).replace('{x}', money(recurring));

  const Option = ({ on, onClick, label, detail, promo }: { on: boolean; onClick: () => void; label: string; detail: string; promo?: string }) => (
    <button type="button" className="clh-opt" aria-pressed={on} onClick={onClick}>
      <span className="clh-opt-check" aria-hidden="true" />
      <span className="clh-opt-body">
        <strong>{label}{promo ? <em className="clh-promo">{promo}</em> : null}</strong>
        <span>{detail}</span>
      </span>
    </button>
  );

  return (
    <section className="clh-cfg" aria-labelledby="clh-cfg-title">
      <div className="clh-wrap clh-cfg-grid">
        <div className="clh-cfg-copy">
          <h2 id="clh-cfg-title" className="clh-h2">{t.cfgTitle}</h2>
          <p className="clh-body">{t.cfgLead}</p>
          <img className="clh-cfg-pc" src={`${IMG}/pc-colorloop.webp`} alt="" width={1200} height={763} loading="lazy" />
        </div>
        <div className="clh-cfg-form">
          <p className="clh-cfg-k">{t.cfgPlan}</p>
          <div className="clh-opts">
            <Option on={plan === 'yearly'} onClick={() => setPlan('yearly')} label={t.cfgYearly[0]} detail={t.cfgYearly[1]} promo={t.promo} />
            <Option on={plan === 'monthly'} onClick={() => setPlan('monthly')} label={t.cfgMonthly[0]} detail={t.cfgMonthly[1]} />
          </div>
          <p className="clh-cfg-k">{t.cfgPc}</p>
          <div className="clh-opts">
            <Option on={pc === 'mine'} onClick={() => setPc('mine')} label={t.cfgPcMine[0]} detail={t.cfgPcMine[1]} />
            <Option on={pc === 'ours'} onClick={() => setPc('ours')} label={t.cfgPcOurs[0]} detail={t.cfgPcOurs[1]} />
          </div>
          <p className="clh-cfg-k">{t.cfgPresses}</p>
          <div className="clh-stepper" role="group" aria-label={t.cfgPresses}>
            <button type="button" aria-label="-" onClick={() => setPresses((n) => Math.max(1, n - 1))} disabled={presses <= 1}>−</button>
            <output>{presses}</output>
            <button type="button" aria-label="+" onClick={() => setPresses((n) => Math.min(10, n + 1))} disabled={presses >= 10}>+</button>
          </div>
          <div className="clh-total">
            <p><span>{t.cfgToday}</span><strong>{money(today)}</strong><span>{then}</span></p>
            <p className="clh-fine">{t.cfgLicense}</p>
            <div className="clh-actions clh-actions-left">
              <a className="clh-btn clh-btn-ink" href={upgradeUrl}>{t.orderCta}</a>
              <a className="clh-btn clh-btn-outline" href={checkUrl}>{t.checkCta}</a>
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

// The Rutherford blocks that stay, in this order (4 Nov 2026, Hugues: unclog the page).
// Dropped: the old ColorLoop block, the audiences, the slim band. Hidden ids from /dev/edit still apply.
const ORDER = [
  'brand-explainer-section',
  'case-studies-showcase',
  'console-validation-cta',
  'how-rutherford-helps',
  'rutherford-identity-section',
  'ppwr-section',
  'blog-preview-section',
  'team-showcase',
];

export function ColorLoopHome({ tone = 'night' }: { tone?: 'night' | 'light' }) {
  const { locale, t, upgradeUrl } = useCopy();
  const discoverUrl = colorloopUrl(locale);
  const checkUrl = localPath(locale, '/console-validation');
  const layout = HOME_LAYOUT as { order: string[]; hidden: string[] };
  const order = ORDER.filter((id) => !layout.hidden.includes(id));
  useClipsAutoplay();

  return (
    <main className={`page-shell clh ${tone === 'light' ? 'clh-light' : ''}`} id="top">
      <SiteNav current="home" />

      <section className="clh-hero" aria-labelledby="clh-title">
        <div className="clh-night">
          <img className="clh-wordmark" src={`${IMG}/${tone === 'light' ? 'logo.png' : 'logo-white.png'}`} alt="ColorLoop" width={1204} height={272} />
          <h1 id="clh-title" className="clh-title">
            {t.title[0]}
            <br />
            {t.title[1]}
            <span className="clh-dot" aria-hidden="true">.</span>
          </h1>
          <p className="clh-lead">{t.lead}</p>
          <div className="clh-actions">
            <a className="clh-btn" href={upgradeUrl}>{t.primary}</a>
            <a className="clh-textlink" href={discoverUrl}>{t.secondary}</a>
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
                  <a className="clh-clip" href={`https://www.youtube.com/shorts/${c.yt}`} target="_blank" rel="noopener" aria-label={`${t.playFilm}: ${c.title}, ${c.length}`}>
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

      <RoiTeaser />

      <Configurator locale={locale} t={t} upgradeUrl={upgradeUrl} checkUrl={checkUrl} />

      {order.map((id) => {
        const Section = SECTIONS[id as keyof typeof SECTIONS];
        return Section ? <Section key={id} /> : null;
      })}

      <SiteFooter />
    </main>
  );
}
