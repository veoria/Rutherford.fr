// Press-brand landing pages for /console-validation/[brand].
// Console/series names are the manufacturers' public product names; the
// eligibility check itself confirms the exact model and generation.

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
