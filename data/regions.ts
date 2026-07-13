// Strategic region conversion hubs. One reusable template (RegionHubPage),
// one entry per region. English-first; a local messaging channel can be added
// later per region (WeChat, WhatsApp, LINE, KakaoTalk) via `channel`.

export type RegionChannel = {
  label: string; // e.g. "WhatsApp", "WeChat"
  href?: string; // tel:/https link; omit for QR-only
  value?: string; // displayed id / number
  qr?: string; // /images/...png QR code (optional)
  note?: string;
};

export type Region = {
  slug: string; // /china
  name: string; // China
  inName: string; // "in China" / "in the UAE" / "in Latin America"
  forWhom: string; // "offset and packaging printers in China"
  angle: string; // one-line regional positioning (also good for keywords)
  metaTitle: string;
  metaDescription: string;
  keywords: string[]; // primary buyer keywords targeted
  channel?: RegionChannel; // optional local contact channel (added later)
};

export const REGIONS: Record<string, Region> = {
  usa: {
    slug: 'usa',
    name: 'the United States',
    inName: 'in the United States',
    forWhom: 'commercial and packaging offset printers in the United States',
    angle: 'G7-anchored closed-loop color, on the presses and X-Rite measurement US pressrooms already run.',
    metaTitle: 'Closed-loop color control in the USA | Rutherford',
    metaDescription:
      'G7-anchored closed-loop color control and CIP3/CIP4 ink presetting for US commercial and packaging printers, on the X-Rite measurement you already own. Proven on 1,000+ systems in 30+ countries. Free press check, figures in USD.',
    keywords: ['closed-loop color control USA', 'G7 color control offset', 'ink key presetting CIP3', 'offset color management United States', 'makeready waste reduction', 'console validation'],
  },
  canada: {
    slug: 'canada',
    name: 'Canada',
    inName: 'in Canada',
    forWhom: 'commercial and packaging offset printers in Canada',
    angle: 'G7-anchored closed-loop color for Canadian pressrooms, English and French support included.',
    metaTitle: 'Closed-loop color control in Canada | Rutherford',
    metaDescription:
      'Closed-loop color control and CIP3/CIP4 ink presetting for Canadian commercial and packaging printers: G7-anchored, on the X-Rite measurement you already own, with support in English and French. Request a free press check.',
    keywords: ['closed-loop color control Canada', 'G7 color control offset', 'ink key presetting CIP3', 'offset color management Canada', 'makeready waste reduction', 'console validation'],
  },
  china: {
    slug: 'china',
    name: 'China',
    inName: 'in China',
    forWhom: 'offset and packaging printers in China',
    angle: 'Standardize color across high-volume offset and packaging production.',
    metaTitle: 'Closed-loop color control in China | Rutherford',
    metaDescription:
      'Rutherford brings closed-loop color control to offset and flexo printers in China: cut makeready waste, hold color shift after shift, on the X-Rite PANTONE measurement you already trust. Request a free console validation.',
    keywords: ['closed-loop color control China', 'offset color management China', 'makeready waste', 'console validation', 'X-Rite PANTONE'],
  },
  japan: {
    slug: 'japan',
    name: 'Japan',
    inName: 'in Japan',
    forWhom: 'offset and packaging printers in Japan',
    angle: 'Repeatable, precise color that meets the most demanding quality standards.',
    metaTitle: 'Closed-loop color control in Japan | Rutherford',
    metaDescription:
      'Closed-loop color control for offset and flexo printers in Japan: tighter DeltaE, less makeready waste, repeatable color shift after shift, on X-Rite PANTONE measurement. Request a free console validation.',
    keywords: ['closed-loop color control Japan', 'offset color management Japan', 'DeltaE tolerance', 'console validation'],
  },
  korea: {
    slug: 'korea',
    name: 'Korea',
    inName: 'in Korea',
    forWhom: 'offset and packaging printers in South Korea',
    angle: 'Stable color across high-mix, fast-turnaround production.',
    metaTitle: 'Closed-loop color control in Korea | Rutherford',
    metaDescription:
      'Closed-loop color control for offset and flexo printers in South Korea: cut makeready waste, hold color across shifts and sites, on X-Rite PANTONE measurement. Request a free console validation.',
    keywords: ['closed-loop color control Korea', 'offset color management Korea', 'makeready waste', 'console validation'],
  },
  'latin-america': {
    slug: 'latin-america',
    name: 'Latin America',
    inName: 'in Latin America',
    forWhom: 'offset and packaging printers across Latin America',
    angle: 'From commercial to packaging: less waste and steadier color, on the presses you already run.',
    metaTitle: 'Closed-loop color control in Latin America | Rutherford',
    metaDescription:
      'Closed-loop color control for offset and flexo printers across Latin America (Brazil, Mexico and beyond): cut makeready waste and hold color shift after shift, on X-Rite PANTONE measurement. Request a free console validation.',
    keywords: ['closed-loop color control Latin America', 'control de color offset', 'makeready waste', 'console validation'],
  },
  uae: {
    slug: 'uae',
    name: 'the UAE',
    inName: 'in the UAE',
    forWhom: 'packaging and commercial printers in the UAE and the Gulf',
    angle: 'Brand-ready packaging color for the Gulf print and packaging hub.',
    metaTitle: 'Closed-loop color control in the UAE | Rutherford',
    metaDescription:
      'Closed-loop color control for packaging and commercial printers in the UAE and the Gulf: cut makeready waste, hold brand color shift after shift, on X-Rite PANTONE measurement. Request a free console validation.',
    keywords: ['closed-loop color control UAE', 'packaging color management Dubai', 'makeready waste', 'console validation'],
  },
};

export const ALL_REGIONS = Object.values(REGIONS);
