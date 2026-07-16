'use client';

import { useMemo } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { useLanguage, type Locale } from '@/components/language-provider';
import { GLOSSARY_TERMS } from '@/data/glossary';

// Color management glossary (SEO/GEO playbook, phase 2): every definition is a
// ready-made answer for generative engines, grouped alphabetically per locale.

type Copy = {
  kicker: string;
  title: string;
  subtitle: string;
  countSuffix: string;
  learnMore: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'Rutherford Glossary',
    title: 'Offset color management, from A to Z',
    subtitle: 'The vocabulary of color control on an offset press: makeready, DeltaE, ink keys, G7, closed loop. Clear definitions written from the pressroom floor.',
    countSuffix: 'terms',
    learnMore: 'Learn more',
    ctaTitle: 'A term missing? A press to check?',
    ctaText: 'The free Rutherford Check tells you in about two minutes if your press console is compatible with closed-loop color control.',
    ctaButton: 'Request console validation',
  },
  fr: {
    kicker: 'Glossaire Rutherford',
    title: 'La gestion de la couleur offset, de A à Z',
    subtitle: 'Le vocabulaire du contrôle couleur sur presse offset : calage, DeltaE, vis d’encrier, G7, closed loop. Des définitions claires, écrites depuis l’atelier.',
    countSuffix: 'termes',
    learnMore: 'En savoir plus',
    ctaTitle: 'Un terme manquant ? Une presse à vérifier ?',
    ctaText: 'Le Rutherford Check gratuit vous dit en deux minutes environ si la console de votre presse est compatible avec le contrôle couleur en closed loop.',
    ctaButton: 'Demander une validation console',
  },
  de: {
    kicker: 'Rutherford Glossar',
    title: 'Farbmanagement im Offsetdruck, von A bis Z',
    subtitle: 'Das Vokabular der Farbsteuerung an der Offsetmaschine: Einrichten, DeltaE, Farbzonenschrauben, G7, Closed Loop. Klare Definitionen, aus der Druckerei geschrieben.',
    countSuffix: 'Begriffe',
    learnMore: 'Mehr erfahren',
    ctaTitle: 'Ein Begriff fehlt? Eine Maschine zu prüfen?',
    ctaText: 'Der kostenlose Rutherford Check sagt Ihnen in rund zwei Minuten, ob Ihr Druckpult mit Closed-Loop-Farbsteuerung kompatibel ist.',
    ctaButton: 'Konsolenvalidierung anfragen',
  },
  it: {
    kicker: 'Glossario Rutherford',
    title: 'La gestione del colore offset, dalla A alla Z',
    subtitle: 'Il vocabolario del controllo colore in macchina offset: avviamento, DeltaE, chiavi di inchiostro, G7, closed loop. Definizioni chiare, scritte dal reparto stampa.',
    countSuffix: 'termini',
    learnMore: 'Scopri di più',
    ctaTitle: 'Manca un termine? Una macchina da verificare?',
    ctaText: 'Il Rutherford Check gratuito Le dice in circa due minuti se il pulpito della Sua macchina è compatibile con il controllo colore closed-loop.',
    ctaButton: 'Richiedi validazione console',
  },
  es: {
    kicker: 'Glosario Rutherford',
    title: 'La gestión del color offset, de la A a la Z',
    subtitle: 'El vocabulario del control del color en prensa offset: puesta a punto, DeltaE, llaves de tinta, G7, closed loop. Definiciones claras, escritas desde la sala de impresión.',
    countSuffix: 'términos',
    learnMore: 'Saber más',
    ctaTitle: '¿Falta un término? ¿Una prensa que verificar?',
    ctaText: 'El Rutherford Check gratuito le dice en unos dos minutos si la consola de su prensa es compatible con el control del color closed-loop.',
    ctaButton: 'Solicitar validación de consola',
  },
  pt: {
    kicker: 'Glossário Rutherford',
    title: 'A gestão da cor offset, de A a Z',
    subtitle: 'O vocabulário do controlo de cor na máquina offset: acerto, DeltaE, chaves de tinta, G7, closed loop. Definições claras, escritas a partir da sala de impressão.',
    countSuffix: 'termos',
    learnMore: 'Saber mais',
    ctaTitle: 'Falta um termo? Uma máquina para verificar?',
    ctaText: 'O Rutherford Check gratuito diz-lhe em cerca de dois minutos se a consola da sua máquina é compatível com o controlo de cor closed-loop.',
    ctaButton: 'Pedir validação de consola',
  },
};

export function GlossaryPage() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  const lhref = (path: string) => (locale === 'en' ? path : `/${locale}${path}`);

  // Group terms by the first letter of their localized name, locale-aware.
  const groups = useMemo(() => {
    const collator = new Intl.Collator(locale, { sensitivity: 'base' });
    const sorted = [...GLOSSARY_TERMS].sort((a, b) => collator.compare(a.name[locale], b.name[locale]));
    const byLetter = new Map<string, typeof sorted>();
    for (const term of sorted) {
      const letter = term.name[locale].charAt(0).toUpperCase();
      const list = byLetter.get(letter) ?? [];
      list.push(term);
      byLetter.set(letter, list);
    }
    return Array.from(byLetter.entries());
  }, [locale]);

  return (
    <main className="page-shell">
      <SiteNav />

      <section className="blog-hero section">
        <div className="container blog-hero-inner">
          <p className="section-kicker">{t.kicker}</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
          <p className="glossary-count">{GLOSSARY_TERMS.length} {t.countSuffix}</p>
        </div>
      </section>

      <section className="section glossary-section">
        <div className="container">
          <nav className="glossary-index" aria-label="Alphabetical index">
            {groups.map(([letter]) => (
              <a key={letter} href={`#letter-${letter}`}>{letter}</a>
            ))}
          </nav>

          {groups.map(([letter, terms]) => (
            <div key={letter} className="glossary-group">
              <h2 id={`letter-${letter}`} className="glossary-letter">{letter}</h2>
              <div className="glossary-terms">
                {terms.map((term) => (
                  <article key={term.slug} className="glossary-term" id={term.slug}>
                    <h3>{term.name[locale]}</h3>
                    <p>{term.def[locale]}</p>
                    {term.href ? (
                      <a className="glossary-more" href={lhref(term.href)}>
                        {t.learnMore} ›
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ))}

          <div className="glossary-cta">
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaText}</p>
            <a className="glossary-cta-btn" href={lhref('/console-validation')}>{t.ctaButton}</a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
