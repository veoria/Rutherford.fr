'use client';

import { useLanguage, type Locale } from '@/components/language-provider';
import { SnapSlider } from '@/components/snap-slider';

type Card = { title: string; body: string };

const AUDIENCE_PHOTOS = [
  {
    src: '/images/man-on-press.jpg',
    alt: 'Offset printer working inside a Heidelberg press',
  },
  {
    src: '/images/offset-printing-09-10-2020.jpg',
    alt: 'Sheetfed offset production line in a packaging plant',
  },
  {
    src: '/images/people-console-dsc2809.jpg',
    alt: 'Team discussing results at the press console',
  },
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
  pt: {
    kicker: 'Com quem trabalhamos',
    headline: 'Com quem trabalha a Rutherford',
    intro:
      'Se alguma destas situações lhe é familiar, a Rutherford é provavelmente uma boa opção. Trabalhamos melhor com equipas focadas em resultados reais na máquina.',
    cards: [
      {
        title: 'Impressores offset',
        body: 'Impressores que procuram um acerto mais rápido e resultados de cor mais estáveis entre trabalhos, turnos e máquinas.',
      },
      {
        title: 'Transformadores de embalagem',
        body: 'Transformadores que procuram um controlo de produção mais forte, mais padronização e repetibilidade na gráfica.',
      },
      {
        title: 'Gestores',
        body: 'Responsáveis que avaliam a modernização do workflow, uma estratégia closed-loop de cor ou a compatibilidade da consola antes de uma implementação.',
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
            <article className={`audience-card audience-card-${['accent', 'light', 'dark'][i]}`} key={c.title}>
              <div className="audience-card-media">
                <img src={AUDIENCE_PHOTOS[i].src} alt={AUDIENCE_PHOTOS[i].alt} loading="lazy" />
              </div>
              <div className="audience-card-body">
                <p className="audience-card-label">0{i + 1}</p>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            </article>
          ))}
        </SnapSlider>
      </div>
    </section>
  );
}
