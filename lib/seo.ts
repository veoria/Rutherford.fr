import type { Metadata } from 'next';
import { headers } from 'next/headers';
import type { Locale } from '@/components/language-provider';

// Localized SEO metadata. Pages call localizedMetadata() from generateMetadata so
// /fr, /de, /it, /es and /pt URLs get a translated <title> and description, a
// self-referencing canonical and hreflang alternates. Pass `locales` when only
// some languages exist for a page (e.g. a blog post translated in two
// languages): hreflang then lists those only, and an untranslated locale URL
// canonicalizes to the English page instead of posing as a duplicate.

export const BASE = 'https://rutherford.fr';
export const ALL_LOCALES: Locale[] = ['en', 'fr', 'de', 'it', 'es', 'pt'];

export type Localized = Record<Locale, string>;

const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  de: 'de_DE',
  it: 'it_IT',
  es: 'es_ES',
  pt: 'pt_PT',
};

export function requestLocale(): Locale {
  const locale = headers().get('x-locale') as Locale | null;
  return locale && ALL_LOCALES.includes(locale) ? locale : 'en';
}

export function localeUrl(path: string, locale: Locale): string {
  const suffix = path === '/' ? '' : path;
  return locale === 'en' ? `${BASE}${suffix || '/'}` : `${BASE}/${locale}${suffix}`;
}

export function alternatesFor(path: string, locale: Locale, locales: Locale[] = ALL_LOCALES): Metadata['alternates'] {
  const available = locales.includes('en') ? locales : ['en' as Locale, ...locales];
  const served = available.includes(locale) ? locale : 'en';
  const languages: Record<string, string> = {};
  for (const l of available) languages[l] = localeUrl(path, l);
  languages['x-default'] = localeUrl(path, 'en');
  return { canonical: localeUrl(path, served), languages };
}

type LocalizedMetadataInput = {
  path: string;
  title: Localized | string;
  description: Localized | string;
  image?: { url: string; alt?: string };
  type?: 'website' | 'article';
  locales?: Locale[];
  keywords?: string[];
};

function pick(value: Localized | string, locale: Locale): string {
  return typeof value === 'string' ? value : value[locale] || value.en;
}

export function localizedMetadata({
  path,
  title,
  description,
  image,
  type = 'website',
  locales = ALL_LOCALES,
  keywords,
}: LocalizedMetadataInput): Metadata {
  const requested = requestLocale();
  const locale = locales.includes(requested) ? requested : 'en';
  const t = pick(title, locale);
  const d = pick(description, locale);
  const alternates = alternatesFor(path, requested, locales);
  const images = image ? [{ url: image.url, width: 1200, height: 630, alt: image.alt ?? t }] : undefined;
  return {
    title: t,
    description: d,
    ...(keywords ? { keywords } : {}),
    alternates,
    openGraph: {
      title: t,
      description: d,
      url: alternates?.canonical as string,
      siteName: 'Rutherford.fr',
      locale: OG_LOCALE[locale],
      type,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: t,
      description: d,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

// Titles and descriptions for the core public pages, per locale.
export const SEO_COPY = {
  home: {
    title: {
      en: 'Rutherford.fr | Closed-loop color control for offset printing',
      fr: 'Rutherford.fr | Contrôle couleur closed-loop pour l’offset',
      de: 'Rutherford.fr | Closed-Loop-Farbsteuerung für den Offsetdruck',
      it: 'Rutherford.fr | Controllo colore closed-loop per la stampa offset',
      es: 'Rutherford.fr | Control del color closed-loop para impresión offset',
      pt: 'Rutherford.fr | Controlo de cor closed-loop para impressão offset',
    },
    description: {
      en: 'Rutherford.fr brings closed-loop color control to the offset press you already own. ColorLoop software, console validation and retrofit on Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi and Ryobi.',
      fr: 'Rutherford.fr apporte le contrôle couleur closed-loop sur la presse offset que vous avez déjà. Logiciel ColorLoop, validation console et rétrofit sur Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi et Ryobi.',
      de: 'Rutherford.fr bringt Closed-Loop-Farbsteuerung auf die Offset-Druckmaschine, die Sie bereits besitzen. ColorLoop Software, Konsolenvalidierung und Nachrüstung auf Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi und Ryobi.',
      it: 'Rutherford.fr porta il controllo colore closed-loop sulla macchina offset che già possiede. Software ColorLoop, validazione console e retrofit su Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi e Ryobi.',
      es: 'Rutherford.fr lleva el control del color closed-loop a la prensa offset que ya tiene. Software ColorLoop, validación de consola y retrofit en Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi y Ryobi.',
      pt: 'A Rutherford.fr leva o controlo de cor closed-loop à máquina offset que já tem. Software ColorLoop, validação de consola e retrofit em Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi e Ryobi.',
    },
  },
  closedLoop: {
    title: {
      en: 'Closed-loop color control for offset printing: the complete guide | Rutherford.fr',
      fr: 'Contrôle couleur closed-loop en offset : le guide complet | Rutherford.fr',
      de: 'Closed-Loop-Farbsteuerung im Offsetdruck: der komplette Leitfaden | Rutherford.fr',
      it: 'Controllo colore closed-loop nella stampa offset: la guida completa | Rutherford.fr',
      es: 'Control del color closed-loop en impresión offset: la guía completa | Rutherford.fr',
      pt: 'Controlo de cor closed-loop em impressão offset: o guia completo | Rutherford.fr',
    },
    description: {
      en: 'How closed-loop color control works on an offset press: measure, compare, correct the ink keys automatically. Up to 65% less makeready waste, ISO 12647-2 and G7 held in production, retrofit on any press.',
      fr: 'Comment fonctionne le contrôle couleur closed-loop sur une presse offset : mesurer, comparer, corriger automatiquement les clés d’encrage. Jusqu’à 65 % de gâche au calage en moins, ISO 12647-2 et G7 tenus en production, rétrofit sur toute presse.',
      de: 'So funktioniert Closed-Loop-Farbsteuerung an der Offset-Druckmaschine: messen, vergleichen, Farbzonenschrauben automatisch korrigieren. Bis zu 65 % weniger Makulatur beim Einrichten, ISO 12647-2 und G7 in der Produktion, Nachrüstung auf jeder Maschine.',
      it: 'Come funziona il controllo colore closed-loop su una macchina offset: misurare, confrontare, correggere automaticamente le chiavi di inchiostro. Fino al 65% di scarto di avviamento in meno, ISO 12647-2 e G7 tenuti in produzione, retrofit su ogni macchina.',
      es: 'Cómo funciona el control del color closed-loop en una prensa offset: medir, comparar, corregir automáticamente las llaves de tinta. Hasta un 65 % menos de desperdicio de puesta a punto, ISO 12647-2 y G7 en producción, retrofit en cualquier prensa.',
      pt: 'Como funciona o controlo de cor closed-loop numa máquina offset: medir, comparar, corrigir automaticamente os tinteiros. Até 65 % menos maculatura de acerto, ISO 12647-2 e G7 mantidos em produção, retrofit em qualquer máquina.',
    },
  },
  consoleValidation: {
    title: {
      en: 'Console validation: is your press ready for closed-loop color? | Rutherford.fr',
      fr: 'Validation console : votre presse est-elle prête pour le closed-loop ? | Rutherford.fr',
      de: 'Konsolenvalidierung: Ist Ihre Druckmaschine bereit für Closed-Loop? | Rutherford.fr',
      it: 'Validazione console: la sua macchina è pronta per il closed-loop? | Rutherford.fr',
      es: 'Validación de consola: ¿su prensa está lista para el closed-loop? | Rutherford.fr',
      pt: 'Validação de consola: a sua máquina está pronta para o closed-loop? | Rutherford.fr',
    },
    description: {
      en: 'See if your press qualifies for closed-loop color. Free console validation: a few photos, two minutes, an answer within one business day.',
      fr: 'Vérifiez si votre presse est éligible au contrôle couleur closed-loop. Validation console gratuite : quelques photos, deux minutes, une réponse sous un jour ouvré.',
      de: 'Prüfen Sie, ob Ihre Druckmaschine für Closed-Loop-Farbsteuerung geeignet ist. Kostenlose Konsolenvalidierung: ein paar Fotos, zwei Minuten, Antwort innerhalb eines Werktags.',
      it: 'Verifichi se la sua macchina è idonea al controllo colore closed-loop. Validazione console gratuita: qualche foto, due minuti, risposta entro un giorno lavorativo.',
      es: 'Compruebe si su prensa es apta para el control del color closed-loop. Validación de consola gratuita: unas fotos, dos minutos, respuesta en un día laborable.',
      pt: 'Verifique se a sua máquina é elegível para o controlo de cor closed-loop. Validação de consola gratuita: algumas fotos, dois minutos, resposta num dia útil.',
    },
  },
  roi: {
    title: {
      en: 'ROI calculator | Rutherford.fr',
      fr: 'Calculateur de ROI | Rutherford.fr',
      de: 'ROI-Rechner | Rutherford.fr',
      it: 'Calcolatore ROI | Rutherford.fr',
      es: 'Calculadora de ROI | Rutherford.fr',
      pt: 'Calculadora de ROI | Rutherford.fr',
    },
    description: {
      en: 'Estimate what closed-loop color control saves your pressroom: makeready waste, makeready time, ink, paper and energy, calculated from your own production figures.',
      fr: 'Estimez ce que le contrôle couleur closed-loop fait gagner à votre atelier : gâche au calage, temps de calage, encre, papier et énergie, calculés à partir de vos propres chiffres de production.',
      de: 'Schätzen Sie, was Closed-Loop-Farbsteuerung Ihrer Druckerei spart: Makulatur und Zeit beim Einrichten, Farbe, Papier und Energie, berechnet aus Ihren eigenen Produktionszahlen.',
      it: 'Stimi quanto il controllo colore closed-loop fa risparmiare alla sua sala stampa: scarto e tempo di avviamento, inchiostro, carta ed energia, calcolati sui suoi dati di produzione.',
      es: 'Calcule cuánto ahorra el control del color closed-loop en su sala de prensa: desperdicio y tiempo de puesta a punto, tinta, papel y energía, a partir de sus propias cifras de producción.',
      pt: 'Estime o que o controlo de cor closed-loop poupa na sua gráfica: maculatura e tempo de acerto, tinta, papel e energia, calculados a partir dos seus próprios números de produção.',
    },
  },
  academy: {
    title: {
      en: 'Rutherford Academy: offset color management courses',
      fr: 'Rutherford Academy : formations en gestion de la couleur offset',
      de: 'Rutherford Academy: Kurse zum Farbmanagement im Offsetdruck',
      it: 'Rutherford Academy: corsi di gestione del colore offset',
      es: 'Rutherford Academy: cursos de gestión del color offset',
      pt: 'Rutherford Academy: cursos de gestão de cor offset',
    },
    description: {
      en: 'Online courses on closed-loop color, press-side measurement, standards and ColorLoop, built by Rutherford for offset printers, packaging converters and brand owners.',
      fr: 'Formations en ligne sur le closed-loop, la mesure en bord de presse, les standards et ColorLoop, conçues par Rutherford pour les imprimeurs offset, les converters packaging et les marques.',
      de: 'Online-Kurse zu Closed-Loop-Farbe, Messung an der Maschine, Standards und ColorLoop, von Rutherford für Offsetdruckereien, Verpackungsverarbeiter und Markeninhaber.',
      it: 'Corsi online su colore closed-loop, misura a bordo macchina, standard e ColorLoop, creati da Rutherford per stampatori offset, converter packaging e brand.',
      es: 'Cursos online sobre color closed-loop, medición a pie de prensa, estándares y ColorLoop, creados por Rutherford para impresores offset, convertidores y marcas.',
      pt: 'Cursos online sobre cor closed-loop, medição junto à máquina, normas e ColorLoop, criados pela Rutherford para impressores offset, transformadores de embalagem e marcas.',
    },
  },
  glossary: {
    title: {
      en: 'Offset color management glossary | Rutherford.fr',
      fr: 'Glossaire de la gestion de la couleur en offset | Rutherford.fr',
      de: 'Glossar Farbmanagement im Offsetdruck | Rutherford.fr',
      it: 'Glossario della gestione del colore offset | Rutherford.fr',
      es: 'Glosario de gestión del color offset | Rutherford.fr',
      pt: 'Glossário de gestão de cor em offset | Rutherford.fr',
    },
    description: {
      en: 'Clear definitions of the vocabulary of offset color control: makeready, DeltaE, ink keys, G7, ISO 12647-2, closed-loop color control and more, written from the pressroom floor.',
      fr: 'Des définitions claires du vocabulaire du contrôle couleur offset : calage, DeltaE, clés d’encrage, G7, ISO 12647-2, closed-loop et plus, écrites depuis l’atelier.',
      de: 'Klare Definitionen rund um die Farbsteuerung im Offsetdruck: Einrichten, DeltaE, Farbzonenschrauben, G7, ISO 12647-2, Closed-Loop und mehr, aus der Praxis der Druckerei.',
      it: 'Definizioni chiare del vocabolario del controllo colore offset: avviamento, DeltaE, chiavi di inchiostro, G7, ISO 12647-2, closed-loop e altro, scritte dalla sala stampa.',
      es: 'Definiciones claras del vocabulario del control del color offset: puesta a punto, DeltaE, llaves de tinta, G7, ISO 12647-2, closed-loop y más, escritas desde la sala de prensa.',
      pt: 'Definições claras do vocabulário do controlo de cor offset: acerto, DeltaE, tinteiros, G7, ISO 12647-2, closed-loop e mais, escritas a partir da gráfica.',
    },
  },
  blog: {
    title: {
      en: 'Blog: offset color, makeready and print standards | Rutherford.fr',
      fr: 'Blog : couleur offset, calage et standards d’impression | Rutherford.fr',
      de: 'Blog: Offsetfarbe, Einrichten und Druckstandards | Rutherford.fr',
      it: 'Blog: colore offset, avviamento e standard di stampa | Rutherford.fr',
      es: 'Blog: color offset, puesta a punto y estándares de impresión | Rutherford.fr',
      pt: 'Blog: cor offset, acerto e normas de impressão | Rutherford.fr',
    },
    description: {
      en: 'Articles for offset printers and packaging converters on closed-loop color, makeready waste, ISO 12647-2, G7, PPWR and production data.',
      fr: 'Articles pour imprimeurs offset et converters packaging sur le closed-loop, la gâche au calage, l’ISO 12647-2, le G7, le PPWR et les données de production.',
      de: 'Artikel für Offsetdruckereien und Verpackungsverarbeiter zu Closed-Loop-Farbe, Makulatur beim Einrichten, ISO 12647-2, G7, PPWR und Produktionsdaten.',
      it: 'Articoli per stampatori offset e converter packaging su closed-loop, scarto di avviamento, ISO 12647-2, G7, PPWR e dati di produzione.',
      es: 'Artículos para impresores offset y convertidores sobre color closed-loop, desperdicio de puesta a punto, ISO 12647-2, G7, PPWR y datos de producción.',
      pt: 'Artigos para impressores offset e transformadores de embalagem sobre cor closed-loop, maculatura de acerto, ISO 12647-2, G7, PPWR e dados de produção.',
    },
  },
  support: {
    title: {
      en: 'Support | Rutherford.fr',
      fr: 'Support | Rutherford.fr',
      de: 'Support | Rutherford.fr',
      it: 'Assistenza | Rutherford.fr',
      es: 'Soporte | Rutherford.fr',
      pt: 'Suporte | Rutherford.fr',
    },
    description: {
      en: 'Technical support for Rutherford closed-loop color systems and ColorLoop: open a ticket and reach the team that knows your press.',
      fr: 'Support technique des systèmes closed-loop Rutherford et de ColorLoop : ouvrez un ticket et joignez l’équipe qui connaît votre presse.',
      de: 'Technischer Support für Rutherford Closed-Loop-Systeme und ColorLoop: Ticket eröffnen und das Team erreichen, das Ihre Maschine kennt.',
      it: 'Assistenza tecnica per i sistemi closed-loop Rutherford e ColorLoop: apra un ticket e raggiunga il team che conosce la sua macchina.',
      es: 'Soporte técnico para los sistemas closed-loop de Rutherford y ColorLoop: abra un ticket y contacte con el equipo que conoce su prensa.',
      pt: 'Suporte técnico para os sistemas closed-loop Rutherford e ColorLoop: abra um ticket e fale com a equipa que conhece a sua máquina.',
    },
  },
  contact: {
    title: {
      en: 'Contact Rutherford.fr | Talk to a color expert',
      fr: 'Contacter Rutherford.fr | Parlez à un expert couleur',
      de: 'Kontakt Rutherford.fr | Sprechen Sie mit einem Farbexperten',
      it: 'Contatti Rutherford.fr | Parli con un esperto del colore',
      es: 'Contacto Rutherford.fr | Hable con un experto en color',
      pt: 'Contacto Rutherford.fr | Fale com um especialista em cor',
    },
    description: {
      en: 'A question about closed-loop color, a press retrofit or ColorLoop? Send us a message, a Rutherford expert answers within one business day.',
      fr: 'Une question sur le closed-loop, un rétrofit de presse ou ColorLoop ? Envoyez-nous un message, un expert Rutherford répond sous un jour ouvré.',
      de: 'Eine Frage zu Closed-Loop-Farbe, zur Nachrüstung einer Druckmaschine oder zu ColorLoop? Schreiben Sie uns, ein Rutherford Experte antwortet innerhalb eines Werktags.',
      it: 'Una domanda sul closed-loop, sul retrofit di una macchina o su ColorLoop? Ci scriva, un esperto Rutherford risponde entro un giorno lavorativo.',
      es: '¿Una pregunta sobre closed-loop, el retrofit de una prensa o ColorLoop? Escríbanos, un experto de Rutherford responde en un día laborable.',
      pt: 'Uma questão sobre closed-loop, o retrofit de uma máquina ou o ColorLoop? Escreva-nos, um especialista Rutherford responde num dia útil.',
    },
  },
} satisfies Record<string, { title: Localized; description: Localized }>;

// Brand console pages: one template per locale.
export function brandConsoleSeo(name: string, consoles: string) {
  return {
    title: {
      en: `${name} console compatibility, closed-loop color control | Rutherford.fr`,
      fr: `Compatibilité console ${name}, contrôle couleur closed-loop | Rutherford.fr`,
      de: `${name} Konsolenkompatibilität, Closed-Loop-Farbsteuerung | Rutherford.fr`,
      it: `Compatibilità console ${name}, controllo colore closed-loop | Rutherford.fr`,
      es: `Compatibilidad de consola ${name}, control del color closed-loop | Rutherford.fr`,
      pt: `Compatibilidade de consola ${name}, controlo de cor closed-loop | Rutherford.fr`,
    },
    description: {
      en: `Check for free whether your ${name} press (${consoles}) is eligible for Rutherford closed-loop color. A few photos, two minutes, an answer within one business day.`,
      fr: `Vérifiez gratuitement si votre presse ${name} (${consoles}) est éligible au closed-loop Rutherford. Quelques photos, deux minutes, une réponse sous un jour ouvré.`,
      de: `Prüfen Sie kostenlos, ob Ihre ${name} Druckmaschine (${consoles}) für Rutherford Closed-Loop-Farbe geeignet ist. Ein paar Fotos, zwei Minuten, Antwort innerhalb eines Werktags.`,
      it: `Verifichi gratuitamente se la sua macchina ${name} (${consoles}) è idonea al closed-loop Rutherford. Qualche foto, due minuti, risposta entro un giorno lavorativo.`,
      es: `Compruebe gratis si su prensa ${name} (${consoles}) es apta para el closed-loop de Rutherford. Unas fotos, dos minutos, respuesta en un día laborable.`,
      pt: `Verifique gratuitamente se a sua máquina ${name} (${consoles}) é elegível para o closed-loop Rutherford. Algumas fotos, dois minutos, resposta num dia útil.`,
    },
  } satisfies { title: Localized; description: Localized };
}
