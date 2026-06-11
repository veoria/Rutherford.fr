'use client';

import { useLanguage, type Locale } from '@/components/language-provider';

type Benefit = { title: string; body: string };

type Copy = {
  kicker: string;
  headline: string;
  intro: string;
  benefits: Benefit[];
  techLabel: string;
  techBody: string;
  primaryCta: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'The software',
    headline: 'ColorLoop for offset printing',
    intro:
      'Built from Rutherford’s closed-loop experience, ColorLoop helps offset teams reduce setup time, improve color consistency, and connect production data more clearly across the workflow.',
    benefits: [
      {
        title: 'Faster makeready',
        body: 'Reach target color sooner with AI guided setup and correction workflows.',
      },
      {
        title: 'Lower waste',
        body: 'Reduce paper, ink, and unnecessary reruns through better setup consistency.',
      },
      {
        title: 'Better repeatability',
        body: 'Use stable production data to improve performance from one job to the next.',
      },
      {
        title: 'Connected visibility',
        body: 'Bring measurements, quality data, and production insights into one clearer operational layer.',
      },
    ],
    techLabel: 'Integrations',
    techBody:
      'ColorLoop works with industry-standard tools like MeasureColor and IntelliTrax2, keeping your existing measurement and reporting investments.',
    primaryCta: 'Discover ColorLoop',
  },
  fr: {
    kicker: 'Le logiciel',
    headline: 'ColorLoop pour l’impression offset',
    intro:
      'Construit à partir de l’expérience closed-loop de Rutherford, ColorLoop aide les équipes offset à réduire le temps de calage, améliorer la constance couleur et connecter plus clairement les données de production.',
    benefits: [
      {
        title: 'Calage plus rapide',
        body: 'Atteindre la couleur cible plus vite grâce à des workflows de calage et correction assistés par IA.',
      },
      {
        title: 'Moins de gâche',
        body: 'Moins de papier, d’encre et de relances inutiles grâce à une meilleure constance de calage.',
      },
      {
        title: 'Meilleure répétabilité',
        body: 'Des données production stables pour améliorer la performance d’un travail à l’autre.',
      },
      {
        title: 'Visibilité connectée',
        body: 'Mesures, données qualité et indicateurs de production réunis dans une couche opérationnelle plus claire.',
      },
    ],
    techLabel: 'Intégrations',
    techBody:
      'ColorLoop s’intègre aux outils standards du secteur comme MeasureColor et IntelliTrax2 — vos investissements mesure et reporting restent valorisés.',
    primaryCta: 'Découvrir ColorLoop',
  },
  de: {
    kicker: 'Die Software',
    headline: 'ColorLoop für Offsetdruck',
    intro:
      'Aufbauend auf Rutherfords Closed-Loop-Erfahrung hilft ColorLoop Offsetteams, Einrichtungszeiten zu reduzieren, die Farbkonsistenz zu verbessern und Produktionsdaten klarer zu verbinden.',
    benefits: [
      {
        title: 'Schnelleres Einrichten',
        body: 'Mit KI-gestützten Setup- und Korrektur-Workflows schneller die Zielfarbe erreichen.',
      },
      {
        title: 'Weniger Makulatur',
        body: 'Weniger Papier, Farbe und unnötige Nachdrucke durch bessere Einrichtungs-Konsistenz.',
      },
      {
        title: 'Bessere Wiederholbarkeit',
        body: 'Stabile Produktionsdaten verbessern die Leistung von Auftrag zu Auftrag.',
      },
      {
        title: 'Verbundene Transparenz',
        body: 'Messungen, Qualitätsdaten und Produktionsinsights in einer klareren Betriebsschicht.',
      },
    ],
    techLabel: 'Integrationen',
    techBody:
      'ColorLoop arbeitet mit Branchenstandards wie MeasureColor und IntelliTrax2 — Ihre bestehenden Mess- und Reporting-Investitionen bleiben erhalten.',
    primaryCta: 'ColorLoop entdecken',
  },
  it: {
    kicker: 'Il software',
    headline: 'ColorLoop per la stampa offset',
    intro:
      'Nato dall’esperienza closed-loop di Rutherford, ColorLoop aiuta i team offset a ridurre i tempi di setup, migliorare la coerenza del colore e collegare con maggiore chiarezza i dati di produzione lungo tutto il workflow.',
    benefits: [
      {
        title: 'Avviamenti più rapidi',
        body: 'Raggiungi prima il colore target grazie a workflow di setup e correzione guidati dall’AI.',
      },
      {
        title: 'Meno scarti',
        body: 'Riduci sprechi di carta, inchiostro e ristampe evitabili grazie a setup più coerenti e prevedibili.',
      },
      {
        title: 'Maggiore ripetibilità',
        body: 'Usa dati di produzione affidabili per migliorare le prestazioni da un lavoro al successivo.',
      },
      {
        title: 'Visibilità connessa',
        body: 'Porta misurazioni, dati qualità e insight produttivi in un unico livello operativo, più chiaro e utilizzabile.',
      },
    ],
    techLabel: 'Integrazioni',
    techBody:
      'ColorLoop si integra con strumenti standard del settore come MeasureColor e IntelliTrax2 di X-Rite PANTONE, proteggendo gli investimenti già fatti in misurazione e reporting.',
    primaryCta: 'Scopri ColorLoop',
  },
  es: {
    kicker: 'El software',
    headline: 'ColorLoop para impresión offset',
    intro:
      'Construido sobre la experiencia closed-loop de Rutherford, ColorLoop ayuda a los equipos offset a reducir el tiempo de puesta a punto, mejorar la consistencia del color y conectar los datos de producción con más claridad.',
    benefits: [
      {
        title: 'Puesta a punto más rápida',
        body: 'Alcanzar antes el color objetivo con flujos de setup y corrección asistidos por IA.',
      },
      {
        title: 'Menos desperdicio',
        body: 'Menos papel, tinta y reruns innecesarios gracias a una puesta a punto más consistente.',
      },
      {
        title: 'Mejor repetibilidad',
        body: 'Datos de producción estables para mejorar el rendimiento de un trabajo al siguiente.',
      },
      {
        title: 'Visibilidad conectada',
        body: 'Medidas, datos de calidad e insights de producción en una capa operativa más clara.',
      },
    ],
    techLabel: 'Integraciones',
    techBody:
      'ColorLoop funciona con herramientas estándar del sector como MeasureColor y IntelliTrax2 — sus inversiones en medición y reporting se mantienen.',
    primaryCta: 'Descubrir ColorLoop',
  },
};

export function ColorLoopSection() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <section className="section colorloop-offset-section" id="colorloop">
      <div className="container colorloop-offset-shell">
        <header className="colorloop-offset-header">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="colorloop-offset-headline">{t.headline}</h2>
          <p className="colorloop-offset-intro">{t.intro}</p>
        </header>

        <div className="colorloop-offset-grid">
          {t.benefits.map((b, i) => (
            <article className="colorloop-offset-card" key={b.title}>
              <div className="colorloop-offset-card-media">
                <img
                  src={`/images/Screenshotcolorloop/${i + 1}Colorlooplenovoscreenshot.png`}
                  alt=""
                  loading="lazy"
                />
              </div>
              <div className="colorloop-offset-card-body">
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="colorloop-offset-tech">
          <div className="colorloop-offset-tech-copy">
            <p className="colorloop-offset-tech-label">{t.techLabel}</p>
            <p className="colorloop-offset-tech-body">{t.techBody}</p>
          </div>
          <div className="colorloop-offset-tech-media">
            <a
              className="colorloop-offset-tech-thumb"
              href="https://www.xrite.com/categories/measurement-devices/intellitrax2"
              target="_blank"
              rel="noreferrer"
              aria-label="IntelliTrax2 by X-Rite"
            >
              <img src="/images/intellitrax2-3.jpg" alt="IntelliTrax2 measurement device" loading="lazy" />
            </a>
            <a
              className="colorloop-offset-tech-thumb"
              href="https://www.xrite.com/categories/measurement-devices/intellitrax2"
              target="_blank"
              rel="noreferrer"
              aria-label="IntelliTrax on press"
            >
              <img src="/images/intellitrax.jpg" alt="IntelliTrax on press console" loading="lazy" />
            </a>
          </div>
        </div>

        <div className="colorloop-offset-cta">
          <a
            className="button button-dark"
            href="https://colorloop.ai/"
            target="_blank"
            rel="noreferrer"
          >
            {t.primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
