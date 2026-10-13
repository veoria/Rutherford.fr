import type { Locale } from '@/components/language-provider';
import BRANDS_DATA from '@/data/color-guesser.json';

// Shared by the color guesser game (components/color-guesser.tsx) and its
// share image (app/api/og/color-guesser/route.tsx).

export type Brand = {
  slug: string;
  brand: string;
  real: string;
  decoy: string;
  deltaE: number;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  light: boolean;
};

export const BRANDS = BRANDS_DATA as Brand[];
export const ROUNDS = 5;

// Score titles borrowed from the pressroom: register, the operator's eye, the loop.
const RANKS: Record<Locale, [string, string, string, string]> = {
  en: ['Perfect register.', 'Press-ready eye.', 'Sharp eye.', 'Your eye could use a closed loop.'],
  fr: ['Repérage parfait.', 'Un œil de conducteur.', 'Bon œil.', 'Votre œil mérite un closed-loop.'],
  de: ['Perfekter Passer.', 'Ein Auge für den Druck.', 'Gutes Auge.', 'Ihr Auge braucht ein Closed-Loop.'],
  it: ['Registro perfetto.', 'Occhio da stampatore.', 'Buon occhio.', 'Il Suo occhio merita un closed-loop.'],
  es: ['Registro perfecto.', 'Ojo de impresor.', 'Buen ojo.', 'Su ojo necesita un closed-loop.'],
  pt: ['Registo perfeito.', 'Olho de impressor.', 'Bom olho.', 'O seu olho precisa de um closed-loop.'],
};

export function rankFor(score: number, total: number, locale: Locale): string {
  const r = RANKS[locale] ?? RANKS.en;
  if (score >= total) return r[0];
  if (score >= total - 1) return r[1];
  if (score >= Math.ceil(total / 2)) return r[2];
  return r[3];
}

export const SHARE_TAGLINE: Record<Locale, string> = {
  en: 'Can you spot the real brand colors?',
  fr: 'Saurez-vous trouver les vraies couleurs des marques ?',
  de: 'Erkennen Sie die echten Markenfarben?',
  it: 'Riconosce i veri colori dei brand?',
  es: '¿Sabe reconocer los colores reales de las marcas?',
  pt: 'Consegue reconhecer as verdadeiras cores das marcas?',
};

// A shared result travels in the URL: ?s=4&t=5&b=coca-cola,dhl,...
export type SharedResult = { score: number; total: number; brands: Brand[] };

export function parseShared(params: { s?: string | null; t?: string | null; b?: string | null }): SharedResult | null {
  const total = Number(params.t);
  const score = Number(params.s);
  if (!Number.isInteger(total) || total < 1 || total > 10) return null;
  if (!Number.isInteger(score) || score < 0 || score > total) return null;
  const brands = (params.b ?? '')
    .split(',')
    .slice(0, total)
    .map((slug) => BRANDS.find((b) => b.slug === slug))
    .filter((b): b is Brand => Boolean(b));
  return { score, total, brands };
}

// CIELAB (D50, Bradford-adapted from sRGB), the same math the quiz builder uses
// to compute deltaE, so the values shown and the ΔE00 between them agree.
const M_RGB_XYZ50 = [
  [0.4360747, 0.3850649, 0.1430804],
  [0.2225045, 0.7168786, 0.0606169],
  [0.0139322, 0.0971045, 0.7141733],
];
const WHITE50 = [0.96422, 1, 0.82521];

export function hexToLab(hex: string): [number, number, number] {
  const rgb = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const [fx, fy, fz] = M_RGB_XYZ50.map((row, i) => {
    const t = (row[0] * rgb[0] + row[1] * rgb[1] + row[2] * rgb[2]) / WHITE50[i];
    return t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116;
  });
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

// WCAG relative luminance, to pick the readout's ink on a card: white or dark,
// whichever keeps the better contrast on both patches (one ink per card, so the
// two readouts match).
const INK_LUMINANCE = luminance('#1C1C1E');

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function readoutInkIsDark(...hexes: string[]): boolean {
  const ls = hexes.map(luminance);
  const onWhite = Math.min(...ls.map((l) => 1.05 / (l + 0.05)));
  const onInk = Math.min(...ls.map((l) => (l + 0.05) / (INK_LUMINANCE + 0.05)));
  return onInk > onWhite;
}
