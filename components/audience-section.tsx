'use client';

import { useLanguage, type Locale } from '@/components/language-provider';
import { SnapSlider } from '@/components/snap-slider';

type Card = { title: string; body: string };

/* Line-style schemas, one per audience card, matching the site's icon set. */
const SCHEMA_PROPS = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const AUDIENCE_SCHEMAS = [
  // 01 — Offset printers: press cylinder feeding a sheet + stopwatch (faster makeready)
  <svg key="press" viewBox="0 0 140 96" width="140" height="96" {...SCHEMA_PROPS} aria-hidden="true">
    <circle cx="46" cy="34" r="18" />
    <circle cx="46" cy="34" r="3" fill="currentColor" stroke="none" />
    <path d="M14 66h64" />
    <path d="M20 74h52" />
    <path d="M46 52v6" />
    <circle cx="104" cy="58" r="20" />
    <path d="M104 46v12l8 6" />
    <path d="M98 32h12" />
    <path d="M120 38l5-5" stroke="var(--accent)" />
  </svg>,
  // 02 — Packaging converters: carton box + repeat loop (standardization)
  <svg key="box" viewBox="0 0 140 96" width="140" height="96" {...SCHEMA_PROPS} aria-hidden="true">
    <path d="M28 40l28-14 28 14-28 14-28-14z" />
    <path d="M28 40v24l28 14 28-14V40" />
    <path d="M56 54v24" />
    <path d="M42 33l28 14" />
    <path d="M104 28a22 22 0 0 1 18 24" />
    <path d="M126 44l-4 10-9-6" stroke="var(--accent)" />
    <path d="M120 76a22 22 0 0 1-18-24" />
    <path d="M98 60l4-10 9 6" stroke="var(--accent)" />
  </svg>,
  // 03 — Decision makers: rising bars + check (validated deployment)
  <svg key="chart" viewBox="0 0 140 96" width="140" height="96" {...SCHEMA_PROPS} aria-hidden="true">
    <path d="M22 78h96" />
    <path d="M36 78V58" />
    <path d="M58 78V44" />
    <path d="M80 78V30" />
    <path d="M36 50l22-14 22-12" />
    <circle cx="106" cy="36" r="16" />
    <path d="M99 36l5 5 9-10" stroke="var(--accent)" />
  </svg>,
];

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  cards: Card[];
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'Who we work with',
    headline: 'Who Rutherford works with',
    intro:
      'If any of these sound familiar, Rutherford is likely a good fit. We work best with teams that care about real press outcomes.',
    cards: [
      {
        title: 'Offset printers',
        body: 'Printers who want faster makeready and more stable color results across jobs, shifts, and presses.',
      },
      {
        title: 'Packaging converters',
        body: 'Converters looking for stronger production control, standardization, and repeatability across their pressroom.',
      },
      {
        title: 'Decision makers',
        body: 'Leaders evaluating workflow modernization, closed-loop color strategy, or console compatibility before a rollout.',
      },
    ],
  },
  fr: {
    kicker: 'Pour qui nous travaillons',
    headline: 'Avec qui travaille Rutherford',
    intro:
      'Si l’une de ces situations vous parle, Rutherford est probablement un bon choix. Nous travaillons avec des équipes qui se concentrent sur les résultats presse réels.',
    cards: [
      {
        title: 'Imprimeurs offset',
        body: 'Imprimeurs qui cherchent un calage plus rapide et une constance couleur plus stable entre travaux, équipes et presses.',
      },
      {
        title: 'Converters packaging',
        body: 'Converters qui veulent un contrôle de production plus fort, plus de standardisation et de répétabilité dans l’atelier.',
      },
      {
        title: 'Décideurs',
        body: 'Dirigeants qui évaluent la modernisation du workflow, une stratégie closed-loop ou la compatibilité console avant un déploiement.',
      },
    ],
  },
  de: {
    kicker: 'Mit wem wir arbeiten',
    headline: 'Mit wem Rutherford arbeitet',
    intro:
      'Wenn Ihnen eine dieser Situationen vertraut ist, passt Rutherford wahrscheinlich gut. Wir arbeiten am besten mit Teams, denen reale Pressenergebnisse wichtig sind.',
    cards: [
      {
        title: 'Offsetdruckereien',
        body: 'Druckereien, die schnelleres Einrichten und stabilere Farbergebnisse über Aufträge, Schichten und Maschinen hinweg wollen.',
      },
      {
        title: 'Verpackungsverarbeiter',
        body: 'Converter, die stärkere Produktionskontrolle, Standardisierung und Wiederholbarkeit in der Druckerei suchen.',
      },
      {
        title: 'Entscheider',
        body: 'Führungskräfte, die Workflow-Modernisierung, Closed-Loop-Farbstrategie oder Konsolen-Kompatibilität vor einem Rollout bewerten.',
      },
    ],
  },
  it: {
    kicker: 'Con chi lavoriamo',
    headline: 'Rutherford è il partner giusto se…',
    intro:
      'Se una di queste situazioni ti è familiare, probabilmente possiamo aiutarti. Lavoriamo al meglio con team che vogliono risultati concreti in macchina.',
    cards: [
      {
        title: 'Stampatori offset',
        body: 'Aziende di stampa che vogliono avviamenti più rapidi e risultati colore più stabili tra lavori, turni e macchine.',
      },
      {
        title: 'Converter di packaging',
        body: 'Converter che cercano più controllo produttivo, maggiore standardizzazione e risultati più ripetibili in sala stampa.',
      },
      {
        title: 'Decision maker',
        body: 'Responsabili che stanno valutando la modernizzazione del workflow, una strategia colore closed-loop o la compatibilità della console prima di un rollout.',
      },
    ],
  },
  es: {
    kicker: 'Con quién trabajamos',
    headline: 'Con quién trabaja Rutherford',
    intro:
      'Si alguna de estas situaciones le resulta familiar, Rutherford probablemente encaja. Trabajamos mejor con equipos centrados en resultados reales de prensa.',
    cards: [
      {
        title: 'Impresores offset',
        body: 'Impresores que quieren puestas a punto más rápidas y resultados de color más estables entre trabajos, turnos y prensas.',
      },
      {
        title: 'Converters de packaging',
        body: 'Converters que buscan mayor control de producción, estandarización y repetibilidad en la sala de prensa.',
      },
      {
        title: 'Decisores',
        body: 'Líderes que evalúan modernización de flujo, estrategia closed-loop de color o compatibilidad de consola antes de un despliegue.',
      },
    ],
  },
};

export function AudienceSection() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <section className="section audience-section" id="audience">
      <div className="container audience-shell">
        <header className="audience-header">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="audience-headline">{t.headline}</h2>
          <p className="audience-intro">{t.intro}</p>
        </header>

        <SnapSlider className="audience-grid">
          {t.cards.map((c, i) => (
            <article className="audience-card" key={c.title}>
              <span className="audience-card-index" aria-hidden="true">
                0{i + 1}
              </span>
              <div className="audience-card-media">{AUDIENCE_SCHEMAS[i]}</div>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </article>
          ))}
        </SnapSlider>
      </div>
    </section>
  );
}
