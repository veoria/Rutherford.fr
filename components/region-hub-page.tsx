'use client';

import './region-landing.css';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { ScrollReveal } from '@/components/scroll-reveal';
import { ColorLoopROI } from '@/components/colorloop-roi';
import type { Region } from '@/data/regions';

type Copy = {
  intl: { note: string; link: string };
  lead: string;
  accent: string;
  sub: string;
  cta1: string;
  cta2: string;
  withLabel: string;
  stats: { num: string; label: string }[];
  productsHead: string;
  products: { offsetDesc: string; flexoDesc: string };
  process: { offset: string; flexo: string };
  howHead: string;
  how: { n: string; t: string; d: string }[];
  roi: { title: string; sub: string };
  console: { title: string; sub: string; steps: string[]; cta: string };
};

const COPY: Record<Locale, Copy> = {
  en: {
    intl: { note: '', link: 'International (English)' },
    lead: 'Color on target.',
    accent: 'Automatically.',
    sub: 'Closed-loop color for offset and flexo presses. Less waste, steadier color, every shift.',
    cta1: 'Check eligibility',
    cta2: 'Talk to us',
    withLabel: 'With',
    stats: [
      { num: '25+', label: 'Years in color' },
      { num: '30+', label: 'Countries' },
      { num: '1,000+', label: 'Systems deployed' },
    ],
    productsHead: 'Offset and flexo, one closed loop',
    products: {
      offsetDesc: 'Closed-loop color for sheetfed and web offset, with X-Rite and MeasureColor.',
      flexoDesc: 'Inline spectral color for labels and flexible packaging.',
    },
    process: { offset: 'Offset', flexo: 'Flexo' },
    howHead: 'How the loop works',
    how: [
      { n: '01', t: 'Measure', d: 'A spectral reading on every sheet, live on the press.' },
      { n: '02', t: 'Decide', d: 'Software compares each ink zone to your target.' },
      { n: '03', t: 'Correct', d: 'Ink keys adjust automatically, run after run.' },
    ],
    roi: { title: 'See what you save', sub: 'Less makeready waste, fewer reruns, steadier color. Put real numbers on your press.' },
    console: {
      title: 'Stop losing money on every makeready',
      sub: 'Check in two minutes whether your press qualifies for Rutherford closed-loop color.',
      steps: ['Tell us your press and console', 'We check your ink keys and measurement setup', 'Get your free eligibility result'],
      cta: 'Test your press',
    },
  },
  fr: {
    intl: { note: 'Vous consultez la version française.', link: 'Version internationale (anglais)' },
    lead: 'La couleur, juste.',
    accent: 'Automatiquement.',
    sub: 'Le closed-loop couleur pour presses offset et flexo. Moins de gâche, une couleur stable à chaque équipe.',
    cta1: 'Vérifier mon éligibilité',
    cta2: 'Nous contacter',
    withLabel: 'Avec',
    stats: [
      { num: '25+', label: 'Ans de couleur' },
      { num: '30+', label: 'Pays' },
      { num: '1 000+', label: 'Systèmes déployés' },
    ],
    productsHead: 'Offset et flexo, une seule boucle',
    products: {
      offsetDesc: 'Closed-loop couleur pour offset feuille et rotative, avec X-Rite et MeasureColor.',
      flexoDesc: "Couleur spectrale inline pour l'étiquette et le packaging.",
    },
    process: { offset: 'Offset', flexo: 'Flexo' },
    howHead: 'Comment la boucle fonctionne',
    how: [
      { n: '01', t: 'Mesurer', d: 'Une lecture spectrale sur chaque feuille, en direct sur la presse.' },
      { n: '02', t: 'Décider', d: "Le logiciel compare chaque zone d'encrage à votre cible." },
      { n: '03', t: 'Corriger', d: "Les clés d'encrage s'ajustent automatiquement, tirage après tirage." },
    ],
    roi: { title: 'Voyez ce que vous économisez', sub: 'Moins de gâche au calage, moins de relances, une couleur stable. Chiffrez-le sur votre presse.' },
    console: {
      title: "Arrêtez de perdre de l'argent à chaque calage",
      sub: "Vérifiez en deux minutes si votre presse est éligible au closed-loop Rutherford.",
      steps: ['Indiquez votre presse et votre pupitre', "On vérifie vos clés d'encrage et votre mesure", "Recevez votre résultat d'éligibilité gratuit"],
      cta: 'Testez votre presse',
    },
  },
  de: {
    intl: { note: 'Sie sehen die deutsche Version.', link: 'Internationale Version (Englisch)' },
    lead: 'Farbe auf Ziel.',
    accent: 'Automatisch.',
    sub: 'Closed-Loop-Farbe für Offset- und Flexodruckmaschinen. Weniger Makulatur, stabile Farbe in jeder Schicht.',
    cta1: 'Eignung prüfen',
    cta2: 'Kontakt',
    withLabel: 'Mit',
    stats: [
      { num: '25+', label: 'Jahre Farbe' },
      { num: '30+', label: 'Länder' },
      { num: '1.000+', label: 'Installierte Systeme' },
    ],
    productsHead: 'Offset und Flexo, ein Closed Loop',
    products: {
      offsetDesc: 'Closed-Loop-Farbe für Bogen- und Rollenoffset, mit X-Rite und MeasureColor.',
      flexoDesc: 'Inline-Spektralfarbe für Etiketten und Verpackung.',
    },
    process: { offset: 'Offset', flexo: 'Flexo' },
    howHead: 'So funktioniert der Loop',
    how: [
      { n: '01', t: 'Messen', d: 'Eine spektrale Messung auf jedem Bogen, live an der Maschine.' },
      { n: '02', t: 'Entscheiden', d: 'Die Software vergleicht jede Farbzone mit Ihrem Ziel.' },
      { n: '03', t: 'Korrigieren', d: 'Die Farbzonen stellen sich automatisch nach, Auflage für Auflage.' },
    ],
    roi: { title: 'Sehen Sie, was Sie sparen', sub: 'Weniger Makulatur beim Einrichten, weniger Nachdrucke, stabilere Farbe. In echten Zahlen.' },
    console: {
      title: 'Verlieren Sie kein Geld mehr beim Einrichten',
      sub: 'Prüfen Sie in zwei Minuten, ob Ihre Druckmaschine für Rutherford Closed-Loop geeignet ist.',
      steps: ['Nennen Sie Druckmaschine und Pult', 'Wir prüfen Farbzonen und Messtechnik', 'Erhalten Sie Ihr kostenloses Ergebnis'],
      cta: 'Druckmaschine testen',
    },
  },
  it: {
    intl: { note: 'Stai visualizzando la versione italiana.', link: 'Versione internazionale (inglese)' },
    lead: 'Colore a target.',
    accent: 'Automaticamente.',
    sub: 'Colore closed-loop per macchine offset e flexo. Meno scarto, colore stabile a ogni turno.',
    cta1: 'Verifica idoneità',
    cta2: 'Contattaci',
    withLabel: 'Con',
    stats: [
      { num: '25+', label: 'Anni di colore' },
      { num: '30+', label: 'Paesi' },
      { num: '1.000+', label: 'Sistemi installati' },
    ],
    productsHead: 'Offset e flexo, un solo closed loop',
    products: {
      offsetDesc: 'Colore closed-loop per offset foglio e bobina, con X-Rite e MeasureColor.',
      flexoDesc: 'Colore spettrale inline per etichette e packaging.',
    },
    process: { offset: 'Offset', flexo: 'Flexo' },
    howHead: 'Come funziona il loop',
    how: [
      { n: '01', t: 'Misura', d: 'Una lettura spettrale su ogni foglio, in diretta sulla macchina.' },
      { n: '02', t: 'Decide', d: 'Il software confronta ogni zona di inchiostro con il target.' },
      { n: '03', t: 'Corregge', d: 'Le chiavi di inchiostro si regolano da sole, tiratura dopo tiratura.' },
    ],
    roi: { title: 'Scopri quanto risparmi', sub: 'Meno scarto di avviamento, meno riavvii, colore più stabile. In numeri reali.' },
    console: {
      title: 'Smetta di perdere denaro a ogni avviamento',
      sub: 'Verifichi in due minuti se la Sua macchina è idonea al closed-loop Rutherford.',
      steps: ['Indichi macchina e pulpito', 'Verifichiamo chiavi di inchiostro e misura', 'Riceva il Suo esito di idoneità gratuito'],
      cta: 'Testa la tua macchina',
    },
  },
  es: {
    intl: { note: 'Está viendo la versión en español.', link: 'Versión internacional (inglés)' },
    lead: 'Color en objetivo.',
    accent: 'Automáticamente.',
    sub: 'Color closed-loop para prensas offset y flexo. Menos desperdicio, color estable en cada turno.',
    cta1: 'Comprobar elegibilidad',
    cta2: 'Contactar',
    withLabel: 'Con',
    stats: [
      { num: '25+', label: 'Años de color' },
      { num: '30+', label: 'Países' },
      { num: '1.000+', label: 'Sistemas desplegados' },
    ],
    productsHead: 'Offset y flexo, un solo closed loop',
    products: {
      offsetDesc: 'Color closed-loop para offset pliego y rotativa, con X-Rite y MeasureColor.',
      flexoDesc: 'Color espectral inline para etiquetas y packaging.',
    },
    process: { offset: 'Offset', flexo: 'Flexo' },
    howHead: 'Cómo funciona el bucle',
    how: [
      { n: '01', t: 'Medir', d: 'Una lectura espectral en cada pliego, en directo en la prensa.' },
      { n: '02', t: 'Decidir', d: 'El software compara cada zona de tinta con su objetivo.' },
      { n: '03', t: 'Corregir', d: 'Las llaves de tinta se ajustan solas, tirada tras tirada.' },
    ],
    roi: { title: 'Vea cuánto ahorra', sub: 'Menos desperdicio de puesta a punto, menos reimpresiones, color estable. En cifras reales.' },
    console: {
      title: 'Deje de perder dinero en cada puesta a punto',
      sub: 'Compruebe en dos minutos si su prensa es elegible para el closed-loop de Rutherford.',
      steps: ['Indique su prensa y su pupitre', 'Revisamos sus llaves de tinta y su medición', 'Reciba su resultado de elegibilidad gratis'],
      cta: 'Pruebe su prensa',
    },
  },
  pt: {
    intl: { note: 'Está a ver a versão em português.', link: 'Versão internacional (inglês)' },
    lead: 'Cor no alvo.',
    accent: 'Automaticamente.',
    sub: 'Cor closed-loop para máquinas offset e flexo. Menos desperdício, cor estável em cada turno.',
    cta1: 'Verificar elegibilidade',
    cta2: 'Fale connosco',
    withLabel: 'Com',
    stats: [
      { num: '25+', label: 'Anos de cor' },
      { num: '30+', label: 'Países' },
      { num: '1.000+', label: 'Sistemas instalados' },
    ],
    productsHead: 'Offset e flexo, um só closed loop',
    products: {
      offsetDesc: 'Cor closed-loop para offset de folha e bobina, com X-Rite e MeasureColor.',
      flexoDesc: 'Cor espectral inline para etiquetas e embalagem.',
    },
    process: { offset: 'Offset', flexo: 'Flexo' },
    howHead: 'Como funciona o loop',
    how: [
      { n: '01', t: 'Medir', d: 'Uma leitura espectral em cada folha, em direto na máquina.' },
      { n: '02', t: 'Decidir', d: 'O software compara cada zona de tinta com o seu alvo.' },
      { n: '03', t: 'Corrigir', d: 'As teclas de tinta ajustam-se automaticamente, tiragem após tiragem.' },
    ],
    roi: { title: 'Veja o que poupa', sub: 'Menos desperdício no acerto, menos repetições, cor mais estável. Em números reais.' },
    console: {
      title: 'Pare de perder dinheiro em cada acerto',
      sub: 'Verifique em dois minutos se a sua máquina é elegível para o closed-loop da Rutherford.',
      steps: ['Indique a sua máquina e a sua consola', 'Verificamos as suas teclas de tinta e a sua medição', 'Receba o seu resultado de elegibilidade gratuito'],
      cta: 'Teste a sua máquina',
    },
  },
};

// Two process pillars: the scanner behind each process, offset and flexo.
const PRODUCTS = [
  { key: 'offset' as const, name: 'IntelliTrax2 · Offset360', href: '/offset360', poster: '/images/intellitrax2-clean.jpg' },
  { key: 'flexo' as const, name: 'DeltaOne · Veoria', href: 'https://veoria.fr', poster: '/images/DeltaOne_New-size-scaled.png' },
];

export function RegionHubPage({ region: _region }: { region?: Region }) {
  const { locale, setLocale } = useLanguage();
  const t = COPY[locale];

  return (
    <main className="page-shell region-landing" id="top">
      <ScrollReveal />
      <SiteNav current="home" />

      {/* International version — always linked on localized pages */}
      {locale !== 'en' && (
        <div className="rl-intl">
          <div className="rl-container rl-intl-inner">
            <span className="rl-intl-note">
              <span className="rl-intl-globe" aria-hidden="true">🌐</span>
              {t.intl.note}
            </span>
            <button type="button" className="rl-intl-link" onClick={() => setLocale('en')}>
              {COPY.en.intl.link} →
            </button>
          </div>
        </div>
      )}

      {/* Hero — white, editorial */}
      <section className="rl-hero">
        <div className="rl-container">
          <div className="rl-logos">
            <span>{t.withLabel}</span>
            <img src="/images/xrite-logo-black.png" alt="X-Rite PANTONE" />
            <img className="mc" src="/images/measurecolor-logo-gray.png" alt="MeasureColor" />
          </div>
          <h1 className="rl-h1">
            {t.lead} <span className="muted">{t.accent}</span>
          </h1>
          <p className="rl-sub">{t.sub}</p>
          <div className="rl-actions">
            <a className="rl-btn rl-btn-primary" href="#test-your-press">{t.cta1}</a>
            <a className="rl-btn rl-btn-ghost" href="mailto:contact@rutherford.fr">{t.cta2} →</a>
          </div>

          <div className="rl-shot">
            <div className="hero-feature hero-feature-full">
              <img src="/images/Colorloop-Lenovo-Packshotv3.png.png.webp" alt="Rutherford ColorLoop on press" className="hero-feature-base" />
              <div className="hero-cursor hero-cursor-rutherford" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="32" height="32"><path d="M5.5 3.5l13 8-5.4 1.6-2.6 5.4z" /></svg>
                <span className="hero-cursor-label">Rutherford</span>
              </div>
              <div className="hero-cursor hero-cursor-xrite" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="32" height="32"><path d="M5.5 3.5l13 8-5.4 1.6-2.6 5.4z" /></svg>
                <span className="hero-cursor-label">X-Rite PANTONE</span>
              </div>
              <div className="hero-cursor hero-cursor-measurecolor" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="32" height="32"><path d="M5.5 3.5l13 8-5.4 1.6-2.6 5.4z" /></svg>
                <span className="hero-cursor-label">MeasureColor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="rl-section" style={{ paddingTop: 0 }}>
        <div className="rl-container">
          <div className="rl-stats">
            {t.stats.map((s) => (
              <div className="rl-stat" key={s.label}>
                <div className="rl-stat-num">{s.num}</div>
                <div className="rl-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products — two process pillars (offset / flexo) */}
      <section className="rl-section">
        <div className="rl-container">
          <p className="rl-eyebrow">{t.productsHead}</p>
          <div className="rl-grid2">
            {PRODUCTS.map((p) => (
              <a className="rl-card" key={p.key} href={p.href} {...(p.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                <div className="rl-card-media">
                  <img src={p.poster} alt={p.name} loading="lazy" />
                </div>
                <div className="rl-card-body">
                  <div className="rl-card-process">{t.process[p.key]}</div>
                  <div className="rl-card-name">{p.name}</div>
                  <div className="rl-card-tag">{p.key === 'offset' ? t.products.offsetDesc : t.products.flexoDesc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How the loop works */}
      <section className="rl-section" style={{ paddingTop: 0 }}>
        <div className="rl-container">
          <p className="rl-eyebrow">{t.howHead}</p>
          <div className="rl-how">
            {t.how.map((h) => (
              <div className="rl-how-col" key={h.n}>
                <div className="rl-how-n">{h.n}</div>
                <div className="rl-how-t">{h.t}</div>
                <p className="rl-how-d">{h.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI calculator — the interactive estimator from the site */}
      <section className="rl-section rl-roi" style={{ paddingTop: 0 }}>
        <div className="rl-container">
          <ColorLoopROI />
        </div>
      </section>

      {/* Test your press */}
      <section className="rl-section rl-test" id="test-your-press">
        <div className="rl-container">
          <h2 className="rl-h2">{t.console.title}</h2>
          <p className="rl-sub" style={{ margin: '16px auto 0' }}>{t.console.sub}</p>
          <ol className="rl-test-steps">
            {t.console.steps.map((s, i) => (
              <li key={i}>
                <span className="rl-test-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="rl-test-txt">{s}</span>
              </li>
            ))}
          </ol>
          <a className="rl-btn rl-btn-primary" href="/console-validation">{t.console.cta}</a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
