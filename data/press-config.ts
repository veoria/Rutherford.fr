// Press configurator vocabulary — shared by "Mon atelier" (client UI), the
// /api/account/presses validation and the admin views. Sheet formats, color
// counts and production profiles are the ROI estimator's (components/
// colorloop-roi.tsx), so a press declared here reads the same as one priced
// there. Manufacturer names are brand names: never translated.

import type { Locale } from '@/components/language-provider';
import { PRESS_BRANDS_PAGES } from '@/data/press-brands';

export const PRESS_MANUFACTURERS: string[] = PRESS_BRANDS_PAGES.map((b) => b.name);

export const SHEET_FORMATS = ['b3', 'b2', 'b1', 'vlf'] as const;
export type SheetFormat = (typeof SHEET_FORMATS)[number];

export const PRODUCTION_PROFILES = ['commercial', 'packaging', 'luxe'] as const;
export type ProductionProfile = (typeof PRODUCTION_PROFILES)[number];

/** Quick picks in the configurator; any 1–16 stays valid through the stepper. */
export const COLOR_PRESETS = [4, 5, 6, 7, 8] as const;
export const MIN_COLORS = 1;
export const MAX_COLORS = 16;

export function isSheetFormat(v: unknown): v is SheetFormat {
  return typeof v === 'string' && (SHEET_FORMATS as readonly string[]).includes(v);
}

export function isProductionProfile(v: unknown): v is ProductionProfile {
  return typeof v === 'string' && (PRODUCTION_PROFILES as readonly string[]).includes(v);
}

/** Console names and an example model per manufacturer, as configurator hints
 *  (from the /console-validation/[brand] pages, so both stay in step). */
export const CONSOLE_HINTS: Record<string, string> = Object.fromEntries(
  PRESS_BRANDS_PAGES.map((b) => [b.name, b.consoles])
);

export const MODEL_HINTS: Record<string, string> = Object.fromEntries(
  PRESS_BRANDS_PAGES.map((b) => [b.name, b.machinePlaceholder.replace(/^e\.g\.\s*/, '').replace(/,\s*\d+\s*units?$/, '')])
);

type FormatCopy = Record<SheetFormat, { label: string; dims: string }>;

const FORMAT_DIMS: Record<SheetFormat, string> = {
  b3: '36 × 52 cm',
  b2: '53 × 75 cm',
  b1: '70 × 100 cm',
  vlf: '110 × 162 cm',
};

const FORMAT_NAMES: Record<Locale, Record<SheetFormat, string>> = {
  en: { b3: 'B3', b2: 'B2', b1: 'B1', vlf: 'Large format' },
  fr: { b3: 'B3', b2: 'B2', b1: 'B1', vlf: 'Grand format' },
  de: { b3: 'B3', b2: 'B2', b1: 'B1', vlf: 'Großformat' },
  it: { b3: 'B3', b2: 'B2', b1: 'B1', vlf: 'Grande formato' },
  es: { b3: 'B3', b2: 'B2', b1: 'B1', vlf: 'Gran formato' },
  pt: { b3: 'B3', b2: 'B2', b1: 'B1', vlf: 'Grande formato' },
};

export function formatCopy(locale: Locale): FormatCopy {
  const names = FORMAT_NAMES[locale] ?? FORMAT_NAMES.en;
  return Object.fromEntries(SHEET_FORMATS.map((f) => [f, { label: names[f], dims: FORMAT_DIMS[f] }])) as FormatCopy;
}

export const PROFILE_LABELS: Record<Locale, Record<ProductionProfile, string>> = {
  en: { commercial: 'Commercial', packaging: 'Packaging — carton', luxe: 'Packaging — luxury' },
  fr: { commercial: 'Commercial', packaging: 'Packaging carton', luxe: 'Packaging luxe' },
  de: { commercial: 'Akzidenz', packaging: 'Verpackung — Karton', luxe: 'Verpackung — Luxus' },
  it: { commercial: 'Commerciale', packaging: 'Packaging — cartoncino', luxe: 'Packaging — lusso' },
  es: { commercial: 'Comercial', packaging: 'Packaging — cartón', luxe: 'Packaging — lujo' },
  pt: { commercial: 'Comercial', packaging: 'Packaging — cartão', luxe: 'Packaging — luxo' },
};

/** One-line summary of a press: "Heidelberg Speedmaster XL 106". */
export function pressTitle(p: { name?: string | null; manufacturer: string; model?: string | null }): string {
  const machine = [p.manufacturer, p.model].filter(Boolean).join(' ');
  return (p.name ?? '').trim() || machine;
}
