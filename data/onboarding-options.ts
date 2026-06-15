// Options for the Academy lead-capture onboarding step.
// Job titles are stored by KEY (locale-independent) so reporting/CRM stays clean
// regardless of the UI language; labels are localized in the onboarding form.

export const JOB_TITLE_KEYS = [
  'operator',
  'prepress',
  'production_manager',
  'quality_color',
  'purchasing',
  'management',
  'brand_owner',
  'sales_marketing',
  'other',
] as const;

export type JobTitleKey = (typeof JOB_TITLE_KEYS)[number];

export function isJobTitleKey(value: string): value is JobTitleKey {
  return (JOB_TITLE_KEYS as readonly string[]).includes(value);
}

// Internal team roles (rutherford.fr / veoria.fr / studiodelaroche.fr). Stored in
// the same job_title column but kept as a DISTINCT key set so they never mix with
// the printing-industry roles above. Localized labels live in
// data/team-role-labels.ts (kept separate so this validator has no client import).
export const TEAM_ROLE_KEYS = [
  'sales',
  'technical_color',
  'support',
  'management',
  'marketing',
  'operations',
] as const;

export type TeamRoleKey = (typeof TEAM_ROLE_KEYS)[number];

export function isTeamRoleKey(value: string): value is TeamRoleKey {
  return (TEAM_ROLE_KEYS as readonly string[]).includes(value);
}

// Stored as the plain English country name (human-readable in the CRM).
export const COUNTRIES: string[] = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium', 'Benin', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Bulgaria', 'Burkina Faso', 'Cambodia', 'Cameroon',
  'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Cyprus', 'Czechia',
  'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Estonia', 'Ethiopia',
  'Finland', 'France', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Honduras',
  'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Ivory Coast', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon',
  'Libya', 'Lithuania', 'Luxembourg', 'Malaysia', 'Malta', 'Mexico', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'North Macedonia', 'Norway',
  'Oman', 'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Saudi Arabia', 'Senegal', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia', 'South Africa',
  'South Korea', 'Spain', 'Sri Lanka', 'Sweden', 'Switzerland', 'Taiwan', 'Tanzania', 'Thailand',
  'Tunisia', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Venezuela', 'Vietnam', 'Other',
];

export function isKnownCountry(value: string): boolean {
  return COUNTRIES.includes(value);
}
