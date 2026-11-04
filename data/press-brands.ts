// Press-brand landing pages for /console-validation/[brand].
// Console/series names are the manufacturers' public product names; the
// eligibility check itself confirms the exact model and generation.

import type { Locale } from '@/components/language-provider';

export type PressBrand = {
  slug: string;
  name: string;
  consoles: string;
  presses: string;
  machinePlaceholder: string;
  faq: { q: string; a: string }[];
};

export const PRESS_BRANDS_PAGES: PressBrand[] = [
  {
    slug: 'heidelberg',
    name: 'Heidelberg',
    consoles: 'Prinect Press Center, CP2000, CP Tronic',
    presses: 'Speedmaster SM / XL series',
    machinePlaceholder: 'e.g. Speedmaster XL 106, 6 units',
    faq: [
      {
        q: 'Is my Heidelberg press compatible with Rutherford closed-loop color?',
        a: 'Most Heidelberg consoles, from CP Tronic and CP2000 up to the Prinect Press Center generations, can run Rutherford ColorLoop through their ink-key interface. The free console validation confirms your exact model and generation within one business day.',
      },
      {
        q: 'Do I need to replace my Heidelberg console to add closed-loop color control?',
        a: 'No. Rutherford ColorLoop connects to the existing console and pushes ink-key corrections to it. You keep your press, your console and your operators; the loop is added on top.',
      },
      {
        q: 'How do I check my Heidelberg console eligibility?',
        a: 'Submit the console validation form with a few photos of your console (full view, inside cabinet, key count, machine plate). Rutherford answers within one business day. It is free and commits you to nothing.',
      },
    ],
  },
  {
    slug: 'komori',
    name: 'Komori',
    consoles: 'KHS-AI, PQC-S',
    presses: 'Lithrone G / GL series',
    machinePlaceholder: 'e.g. Lithrone GL-640, 6 units',
    faq: [
      {
        q: 'Is my Komori press compatible with Rutherford closed-loop color?',
        a: 'Komori PQC-S and KHS-AI consoles on Lithrone-class presses can run Rutherford ColorLoop through their ink-key interface. The free console validation confirms your exact model and generation within one business day.',
      },
      {
        q: 'Do I need to replace my Komori console to add closed-loop color control?',
        a: 'No. Rutherford ColorLoop connects to the existing console and pushes ink-key corrections to it. You keep your press, your console and your operators.',
      },
      {
        q: 'How do I check my Komori console eligibility?',
        a: 'Submit the console validation form with a few photos of your console. Rutherford answers within one business day. Free, no commitment.',
      },
    ],
  },
  {
    slug: 'koenig-bauer',
    name: 'Koenig & Bauer',
    consoles: 'ErgoTronic, ColorTronic',
    presses: 'Rapida series',
    machinePlaceholder: 'e.g. Rapida 106, 8 units',
    faq: [
      {
        q: 'Is my Koenig & Bauer press compatible with Rutherford closed-loop color?',
        a: 'Koenig & Bauer ErgoTronic and ColorTronic consoles on Rapida presses can run Rutherford ColorLoop through their ink-key interface. The free console validation confirms your exact model and generation within one business day.',
      },
      {
        q: 'Do I need to replace my Koenig & Bauer console to add closed-loop color control?',
        a: 'No. Rutherford ColorLoop connects to the existing console and pushes ink-key corrections to it. You keep your press, your console and your operators.',
      },
      {
        q: 'How do I check my Koenig & Bauer console eligibility?',
        a: 'Submit the console validation form with a few photos of your console. Rutherford answers within one business day. Free, no commitment.',
      },
    ],
  },
  {
    slug: 'manroland',
    name: 'Manroland',
    consoles: 'Pecom, ColorPilot',
    presses: 'Roland 700 / 900, Evolution series',
    machinePlaceholder: 'e.g. Roland 706 Evolution, 6 units',
    faq: [
      {
        q: 'Is my Manroland press compatible with Rutherford closed-loop color?',
        a: 'Manroland Pecom and ColorPilot consoles on Roland 700/900-class and Evolution presses can run Rutherford ColorLoop through their ink-key interface. The free console validation confirms your exact model and generation within one business day.',
      },
      {
        q: 'Do I need to replace my Manroland console to add closed-loop color control?',
        a: 'No. Rutherford ColorLoop connects to the existing console and pushes ink-key corrections to it. You keep your press, your console and your operators.',
      },
      {
        q: 'How do I check my Manroland console eligibility?',
        a: 'Submit the console validation form with a few photos of your console. Rutherford answers within one business day. Free, no commitment.',
      },
    ],
  },
  {
    slug: 'mitsubishi',
    name: 'Mitsubishi',
    consoles: 'IPC press consoles',
    presses: 'Diamond series',
    machinePlaceholder: 'e.g. Diamond 3000, 5 units',
    faq: [
      {
        q: 'Is my Mitsubishi press compatible with Rutherford closed-loop color?',
        a: 'Mitsubishi consoles on Diamond-series presses can run Rutherford ColorLoop through their ink-key interface. The free console validation confirms your exact model and generation within one business day.',
      },
      {
        q: 'Do I need to replace my Mitsubishi console to add closed-loop color control?',
        a: 'No. Rutherford ColorLoop connects to the existing console and pushes ink-key corrections to it. You keep your press, your console and your operators.',
      },
      {
        q: 'How do I check my Mitsubishi console eligibility?',
        a: 'Submit the console validation form with a few photos of your console, including the inside of the console cabinet. Rutherford answers within one business day. Free, no commitment.',
      },
    ],
  },
  {
    slug: 'ryobi',
    name: 'Ryobi',
    consoles: 'PCS print control consoles',
    presses: 'Ryobi 750 / 920 / 1050 series',
    machinePlaceholder: 'e.g. Ryobi 925, 5 units',
    faq: [
      {
        q: 'Is my Ryobi press compatible with Rutherford closed-loop color?',
        a: 'Ryobi PCS consoles on 750/920/1050-class presses can run Rutherford ColorLoop through their ink-key interface. The free console validation confirms your exact model and generation within one business day.',
      },
      {
        q: 'Do I need to replace my Ryobi console to add closed-loop color control?',
        a: 'No. Rutherford ColorLoop connects to the existing console and pushes ink-key corrections to it. You keep your press, your console and your operators.',
      },
      {
        q: 'How do I check my Ryobi console eligibility?',
        a: 'Submit the console validation form with a few photos of your console. Rutherford answers within one business day. Free, no commitment.',
      },
    ],
  },
  {
    slug: 'goss',
    name: 'Goss',
    consoles: 'Omnicon press controls',
    presses: 'Goss web offset presses',
    machinePlaceholder: 'e.g. Goss M-600, 4 units',
    faq: [
      {
        q: 'Is my Goss press compatible with Rutherford closed-loop color?',
        a: 'Goss Omnicon-controlled web presses can run Rutherford ColorLoop through their ink-key interface. The free console validation confirms your exact model and generation within one business day.',
      },
      {
        q: 'Do I need to replace my Goss console to add closed-loop color control?',
        a: 'No. Rutherford ColorLoop connects to the existing console and pushes ink-key corrections to it. You keep your press, your console and your operators.',
      },
      {
        q: 'How do I check my Goss console eligibility?',
        a: 'Submit the console validation form with a few photos of your console. Rutherford answers within one business day. Free, no commitment.',
      },
    ],
  },
  {
    slug: 'presstek',
    name: 'Presstek',
    consoles: 'Presstek DI press controls',
    presses: 'Presstek DI series',
    machinePlaceholder: 'e.g. Presstek 75DI, 4 units',
    faq: [
      {
        q: 'Is my Presstek press compatible with Rutherford closed-loop color?',
        a: 'Presstek DI presses can run Rutherford ColorLoop through their ink-key interface. The free console validation confirms your exact model and generation within one business day.',
      },
      {
        q: 'Do I need to replace my Presstek console to add closed-loop color control?',
        a: 'No. Rutherford ColorLoop connects to the existing console and pushes ink-key corrections to it. You keep your press, your console and your operators.',
      },
      {
        q: 'How do I check my Presstek console eligibility?',
        a: 'Submit the console validation form with a few photos of your console. Rutherford answers within one business day. Free, no commitment.',
      },
    ],
  },
];

export const getPressBrand = (slug: string) => PRESS_BRANDS_PAGES.find((b) => b.slug === slug);

// ---------------------------------------------------------------------------
// Localized display copy for the brand landing pages. The arrays above stay the
// English source (and feed press-config.ts / the configurator), so nothing in
// them changes; non-EN locales derive their visible text from the templates
// below. Brand, console and series names are never translated.
// ---------------------------------------------------------------------------

type L10nLocale = Exclude<Locale, 'en'>;

/** Press families with the locale's article/wording, used after "consoles … on"
 *  (IT/PT carry the contracted preposition: "sulle serie…", "nas séries…"). */
const PRESSES_L10N: Record<string, Record<L10nLocale, string>> = {
  heidelberg: {
    fr: 'les séries Speedmaster SM / XL',
    de: 'den Baureihen Speedmaster SM / XL',
    it: 'sulle serie Speedmaster SM / XL',
    es: 'las series Speedmaster SM / XL',
    pt: 'nas séries Speedmaster SM / XL',
  },
  komori: {
    fr: 'les séries Lithrone G / GL',
    de: 'den Baureihen Lithrone G / GL',
    it: 'sulle serie Lithrone G / GL',
    es: 'las series Lithrone G / GL',
    pt: 'nas séries Lithrone G / GL',
  },
  'koenig-bauer': {
    fr: 'la série Rapida',
    de: 'der Baureihe Rapida',
    it: 'sulla serie Rapida',
    es: 'la serie Rapida',
    pt: 'na série Rapida',
  },
  manroland: {
    fr: 'les Roland 700 / 900 et la série Evolution',
    de: 'den Roland 700 / 900 und der Baureihe Evolution',
    it: 'sulle Roland 700 / 900 e sulla serie Evolution',
    es: 'las Roland 700 / 900 y la serie Evolution',
    pt: 'nas Roland 700 / 900 e na série Evolution',
  },
  mitsubishi: {
    fr: 'la série Diamond',
    de: 'der Baureihe Diamond',
    it: 'sulla serie Diamond',
    es: 'la serie Diamond',
    pt: 'na série Diamond',
  },
  ryobi: {
    fr: 'les séries Ryobi 750 / 920 / 1050',
    de: 'den Baureihen Ryobi 750 / 920 / 1050',
    it: 'sulle serie Ryobi 750 / 920 / 1050',
    es: 'las series Ryobi 750 / 920 / 1050',
    pt: 'nas séries Ryobi 750 / 920 / 1050',
  },
  goss: {
    fr: 'les rotatives offset Goss',
    de: 'den Goss-Rollenoffsetmaschinen',
    it: 'sulle rotative offset Goss',
    es: 'las rotativas offset Goss',
    pt: 'nas rotativas offset Goss',
  },
  presstek: {
    fr: 'la série Presstek DI',
    de: 'der Baureihe Presstek DI',
    it: 'sulla serie Presstek DI',
    es: 'la serie Presstek DI',
    pt: 'na série Presstek DI',
  },
};

/** Console strings that carry English words ("press consoles", "print control…"). */
const CONSOLES_L10N: Record<string, Record<L10nLocale, string>> = {
  mitsubishi: {
    fr: 'IPC',
    de: 'IPC',
    it: 'IPC',
    es: 'IPC',
    pt: 'IPC',
  },
  ryobi: {
    fr: 'PCS',
    de: 'PCS',
    it: 'PCS',
    es: 'PCS',
    pt: 'PCS',
  },
  goss: {
    fr: 'Omnicon',
    de: 'Omnicon',
    it: 'Omnicon',
    es: 'Omnicon',
    pt: 'Omnicon',
  },
  presstek: {
    fr: 'Presstek DI',
    de: 'Presstek DI',
    it: 'Presstek DI',
    es: 'Presstek DI',
    pt: 'Presstek DI',
  },
};

/** "e.g." prefix and the word for a printing unit, per locale. */
const PLACEHOLDER_L10N: Record<L10nLocale, { eg: string; units: string }> = {
  fr: { eg: 'ex.', units: 'groupes' },
  de: { eg: 'z. B.', units: 'Druckwerke' },
  it: { eg: 'es.', units: 'gruppi' },
  es: { eg: 'p. ej.', units: 'cuerpos' },
  pt: { eg: 'ex.:', units: 'corpos' },
};

// Brands whose validation also asks for an inside-console photo.
const INSIDE_CONSOLE_SLUGS = ['heidelberg', 'komori', 'mitsubishi'];

type FaqTemplate = (b: { name: string; consoles: string; presses: string; inside: boolean }) => { q: string; a: string }[];

const FAQ_L10N: Record<L10nLocale, FaqTemplate> = {
  fr: ({ name, consoles, presses, inside }) => [
    {
      q: `Ma presse ${name} est-elle compatible avec le closed-loop couleur Rutherford ?`,
      a: `Les consoles ${consoles} sur ${presses} peuvent piloter Rutherford ColorLoop via leur interface de clés d'encrage. La validation console gratuite confirme votre modèle et votre génération exacts sous un jour ouvré.`,
    },
    {
      q: `Dois-je remplacer ma console ${name} pour ajouter le contrôle couleur closed-loop ?`,
      a: `Non. Rutherford ColorLoop se connecte à la console existante et lui transmet les corrections de clés d'encrage. Vous conservez votre presse, votre console et vos conducteurs ; la boucle vient s'ajouter par-dessus.`,
    },
    {
      q: `Comment vérifier l'éligibilité de ma console ${name} ?`,
      a: `Envoyez le formulaire de validation console avec quelques photos de votre console${inside ? ' (vue d’ensemble, intérieur du meuble, nombre de clés, plaque constructeur)' : ''}. Rutherford vous répond sous un jour ouvré. C'est gratuit et sans engagement.`,
    },
  ],
  de: ({ name, consoles, presses, inside }) => [
    {
      q: `Ist meine Druckmaschine von ${name} mit der Closed-Loop-Farbregelung von Rutherford kompatibel?`,
      a: `Die Konsolen ${consoles} an ${presses} können Rutherford ColorLoop über ihre Farbzonen-Schnittstelle betreiben. Die kostenlose Konsolenvalidierung bestätigt Ihr genaues Modell und Ihre Generation innerhalb eines Werktags.`,
    },
    {
      q: `Muss ich meine ${name}-Konsole ersetzen, um eine Closed-Loop-Farbregelung nachzurüsten?`,
      a: `Nein. Rutherford ColorLoop wird an die vorhandene Konsole angebunden und übergibt ihr die Korrekturen der Farbzonen. Sie behalten Ihre Druckmaschine, Ihre Konsole und Ihre Bediener; der Regelkreis wird einfach aufgesetzt.`,
    },
    {
      q: `Wie prüfe ich die Eignung meiner ${name}-Konsole?`,
      a: `Senden Sie das Formular zur Konsolenvalidierung mit ein paar Fotos Ihrer Konsole${inside ? ' (Gesamtansicht, Innenraum des Pultunterbaus, Anzahl der Farbzonen, Typenschild)' : ''}. Rutherford antwortet innerhalb eines Werktags. Kostenlos und unverbindlich.`,
    },
  ],
  it: ({ name, consoles, presses, inside }) => [
    {
      q: `La mia macchina ${name} è compatibile con il closed-loop colore Rutherford?`,
      a: `Le console ${consoles} ${presses} possono gestire Rutherford ColorLoop tramite la loro interfaccia delle chiavi di inchiostro. La validazione console gratuita conferma il suo modello e la sua generazione esatti entro un giorno lavorativo.`,
    },
    {
      q: `Devo sostituire la console ${name} per aggiungere il controllo colore closed-loop?`,
      a: `No. Rutherford ColorLoop si collega alla console esistente e le invia le correzioni delle chiavi di inchiostro. Mantiene la sua macchina, la sua console e i suoi operatori; il loop si aggiunge sopra.`,
    },
    {
      q: `Come verifico l'idoneità della mia console ${name}?`,
      a: `Invii il modulo di validazione console con qualche foto della sua console${inside ? ' (vista d’insieme, interno del mobile, numero di chiavi, targhetta della macchina)' : ''}. Rutherford risponde entro un giorno lavorativo. Gratuita e senza impegno.`,
    },
  ],
  es: ({ name, consoles, presses, inside }) => [
    {
      q: `¿Es mi prensa ${name} compatible con el closed-loop de color de Rutherford?`,
      a: `Las consolas ${consoles} en ${presses} pueden ejecutar Rutherford ColorLoop a través de su interfaz de llaves de tinta. La validación de consola gratuita confirma su modelo y generación exactos en un día laborable.`,
    },
    {
      q: `¿Tengo que sustituir mi consola ${name} para añadir el control del color closed-loop?`,
      a: `No. Rutherford ColorLoop se conecta a la consola existente y le envía las correcciones de las llaves de tinta. Usted conserva su prensa, su consola y sus maquinistas; el lazo se añade por encima.`,
    },
    {
      q: `¿Cómo compruebo la compatibilidad de mi consola ${name}?`,
      a: `Envíe el formulario de validación de consola con unas fotos de su consola${inside ? ' (vista general, interior del armario, número de llaves, placa de características)' : ''}. Rutherford responde en un día laborable. Gratis y sin compromiso.`,
    },
  ],
  pt: ({ name, consoles, presses, inside }) => [
    {
      q: `A minha máquina ${name} é compatível com o closed-loop de cor da Rutherford?`,
      a: `As consolas ${consoles} ${presses} podem correr o Rutherford ColorLoop através da sua interface de chaves de tinta. A validação de consola gratuita confirma o seu modelo e geração exatos num dia útil.`,
    },
    {
      q: `Tenho de substituir a minha consola ${name} para acrescentar o controlo de cor closed-loop?`,
      a: `Não. O Rutherford ColorLoop liga-se à consola existente e envia-lhe as correções das chaves de tinta. Mantém a sua máquina, a sua consola e os seus impressores; o ciclo é acrescentado por cima.`,
    },
    {
      q: `Como verifico a compatibilidade da minha consola ${name}?`,
      a: `Envie o formulário de validação de consola com algumas fotos da sua consola${inside ? ' (vista geral, interior do armário, número de chaves, chapa de características)' : ''}. A Rutherford responde num dia útil. Gratuito e sem compromisso.`,
    },
  ],
};

export type LocalizedPressBrand = Pick<PressBrand, 'slug' | 'name' | 'consoles' | 'presses' | 'machinePlaceholder' | 'faq'>;

/** Display copy for one brand page in the requested locale (EN returns the source as-is). */
export function localizePressBrand(brand: PressBrand, locale: Locale): LocalizedPressBrand {
  if (locale === 'en') return brand;
  const l = locale as L10nLocale;
  const presses = PRESSES_L10N[brand.slug]?.[l] ?? brand.presses;
  const consoles = CONSOLES_L10N[brand.slug]?.[l] ?? brand.consoles;
  // "e.g. Speedmaster XL 106, 6 units" -> "ex. Speedmaster XL 106, 6 groupes"
  const m = brand.machinePlaceholder.match(/^e\.g\.\s*(.*?)(?:,\s*(\d+)\s*units?)?$/);
  const { eg, units } = PLACEHOLDER_L10N[l];
  const machinePlaceholder = m ? `${eg} ${m[1]}${m[2] ? `, ${m[2]} ${units}` : ''}` : brand.machinePlaceholder;
  const inside = INSIDE_CONSOLE_SLUGS.includes(brand.slug);
  return {
    slug: brand.slug,
    name: brand.name,
    consoles,
    presses,
    machinePlaceholder,
    faq: FAQ_L10N[l]({ name: brand.name, consoles, presses, inside }),
  };
}
