'use client';

import { useLanguage, type Locale } from '@/components/language-provider';
import { SnapSlider } from '@/components/snap-slider';

type Benefit = { title: string; body: string };

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  benefits: Benefit[];
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'How Rutherford helps',
    headline: 'Concrete outcomes for real offset production environments.',
    intro:
      'Rutherford supports offset teams with color management, press-side workflow, and production standardization, focused on what moves the press, not buzzwords.',
    benefits: [
      {
        title: 'Stable color across runs',
        body: 'Standardized calibration, ink models, and closed-loop correction that keep deliveries consistent from one job to the next.',
      },
      {
        title: 'Lower makeready waste',
        body: 'Fewer sheets, less ink, and shorter setup cycles thanks to predictable target-hitting and tighter press control.',
      },
      {
        title: 'Better workflow control',
        body: 'Clearer press-side decisions, connected measurement data, and structured hand-off between operators and management.',
      },
      {
        title: 'Production standardization',
        body: 'Repeatable processes across presses, shifts, and sites, so brand owners and converters can trust what ships.',
      },
    ],
  },
  fr: {
    kicker: 'Comment Rutherford aide',
    headline: 'Des résultats concrets pour la production offset.',
    intro:
      'Rutherford accompagne les équipes offset sur la gestion couleur, le workflow presse et la standardisation de production, centré sur ce qui fait tourner les machines, pas sur des slogans.',
    benefits: [
      {
        title: 'Couleur stable à chaque tirage',
        body: 'Calibration standardisée, modèles d’encrage et correction closed-loop qui garantissent la constance d’un travail à l’autre.',
      },
      {
        title: 'Moins de gâche au calage',
        body: 'Moins de feuilles, moins d’encre, et des cycles de calage plus courts grâce à un pilotage plus fiable.',
      },
      {
        title: 'Meilleur contrôle du workflow',
        body: 'Décisions presse plus claires, données de mesure connectées et transmission structurée entre opérateurs et management.',
      },
      {
        title: 'Standardisation production',
        body: 'Des processus reproductibles entre presses, équipes et sites, pour que marques et converters puissent s’y fier.',
      },
    ],
  },
  de: {
    kicker: 'Wie Rutherford hilft',
    headline: 'Konkrete Ergebnisse für reale Offset-Produktion.',
    intro:
      'Rutherford unterstützt Offsetteams bei Farbmanagement, pressenseitigem Workflow und Produktionsstandardisierung, fokussiert auf das, was die Presse bewegt, nicht auf Schlagworte.',
    benefits: [
      {
        title: 'Stabile Farbe über alle Aufträge',
        body: 'Standardisierte Kalibrierung, Farbmodelle und Closed-Loop-Korrektur, die Lieferungen von Auftrag zu Auftrag konsistent halten.',
      },
      {
        title: 'Weniger Einrichtungs-Makulatur',
        body: 'Weniger Bogen, weniger Farbe und kürzere Einrichtungszyklen dank planbarer Farbziele und engerer Pressensteuerung.',
      },
      {
        title: 'Bessere Workflow-Kontrolle',
        body: 'Klarere Entscheidungen an der Presse, verbundene Messdaten und strukturierte Übergabe zwischen Bedienern und Management.',
      },
      {
        title: 'Produktionsstandardisierung',
        body: 'Reproduzierbare Prozesse über Maschinen, Schichten und Standorte hinweg, verlässlich für Markeninhaber und Verarbeiter.',
      },
    ],
  },
  it: {
    kicker: 'Come Rutherford aiuta',
    headline: 'Risultati concreti per ambienti offset reali.',
    intro:
      'Rutherford supporta i team offset con gestione del colore, workflow a bordo macchina e standardizzazione della produzione. Il nostro obiettivo è semplice: migliorare ciò che accade davvero in macchina, con soluzioni concrete.',
    benefits: [
      {
        title: 'Colore stabile, tiratura dopo tiratura',
        body: 'Calibrazione standardizzata, modelli inchiostro e correzione closed-loop mantengono le consegne coerenti da un lavoro al successivo.',
      },
      {
        title: 'Meno scarti in avviamento',
        body: 'Meno fogli, meno inchiostro e cicli di avviamento più brevi grazie a un raggiungimento più prevedibile del colore target e a un controllo macchina più preciso.',
      },
      {
        title: 'Più controllo sul workflow',
        body: 'Decisioni più chiare a bordo macchina, dati di misurazione centralizzati ed integrati, e un passaggio di informazioni più strutturato tra operatori e management.',
      },
      {
        title: 'Produzione standardizzata',
        body: 'Processi ripetibili tra macchine, turni e siti produttivi, così che brand owner e converter possano fidarsi di ogni consegna.',
      },
    ],
  },
  es: {
    kicker: 'Cómo ayuda Rutherford',
    headline: 'Resultados concretos para entornos reales de producción offset.',
    intro:
      'Rutherford acompaña a los equipos offset en gestión del color, flujo de trabajo junto a la prensa y estandarización de producción, centrado en lo que mueve la prensa, no en eslóganes.',
    benefits: [
      {
        title: 'Color estable en cada tirada',
        body: 'Calibración estandarizada, modelos de tintaje y corrección closed-loop que mantienen la constancia de un trabajo al siguiente.',
      },
      {
        title: 'Menos desperdicio en puesta a punto',
        body: 'Menos pliegos, menos tinta y ciclos de puesta a punto más cortos gracias a un pilotaje más fiable.',
      },
      {
        title: 'Mejor control del flujo de trabajo',
        body: 'Decisiones más claras en prensa, datos de medición conectados y traspasos estructurados entre operadores y dirección.',
      },
      {
        title: 'Estandarización de producción',
        body: 'Procesos repetibles entre prensas, turnos y plantas, fiables para marcas y converters.',
      },
    ],
  },
};

const BENEFIT_IMAGES = [
  '/images/how-rutherford-1.png',
  '/images/how-rutherford-2.png',
  '/images/how-rutherford-3.png',
  '/images/how-rutherford-4.png',
];

export function HowRutherfordHelps() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <section className="section how-rutherford-section" id="how">
      <div className="container how-rutherford-shell">
        <header className="how-rutherford-header">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="how-rutherford-headline">{t.headline}</h2>
          <p className="how-rutherford-intro">{t.intro}</p>
        </header>

        <SnapSlider className="how-rutherford-grid">
          {t.benefits.map((b, i) => (
            <article className="how-rutherford-card" key={b.title}>
              <span className="how-rutherford-card-index" aria-hidden="true">
                0{i + 1}
              </span>
              <div className="how-rutherford-card-media">
                <img src={BENEFIT_IMAGES[i]} alt="" loading="lazy" />
              </div>
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </article>
          ))}
        </SnapSlider>
      </div>
    </section>
  );
}
