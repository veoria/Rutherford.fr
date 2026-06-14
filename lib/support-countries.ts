// Country options offered on the /support form. This list MUST mirror the
// "Country" enum options on the Asana Support Ticket project (lib/asana.ts maps
// each name to its option gid). Shared here so the client form and the server
// stay in sync without importing the server-only Asana module into the bundle.
export const SUPPORT_COUNTRIES = [
  'Mexico',
  'Chile',
  'India',
  'China',
  'France',
  'UK',
  'USA',
  'Italy',
  'Spain',
  'Russia',
  'Thailand',
  'Japan',
  'Germany',
  'Uruguay',
  'South Africa',
  'Saudi Arabia',
  'UAE',
  'Indonesia',
  'Nouméa',
  'Other',
] as const;

export type SupportCountry = (typeof SUPPORT_COUNTRIES)[number];
