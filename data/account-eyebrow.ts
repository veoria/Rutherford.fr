import type { Locale } from '@/components/language-provider';

// The small uppercase eyebrow above account-page headings. Partners/clients see
// "Partner area"; internal Rutherford team members see the staff variant.
const PARTNER: Record<Locale, string> = {
  en: 'Partner area',
  fr: 'Espace partenaire',
  de: 'Partnerbereich',
  it: 'Area partner',
  es: 'Área de partner',
};

const STAFF: Record<Locale, string> = {
  en: 'Rutherford staff',
  fr: 'Espace Rutherford',
  de: 'Rutherford-Team',
  it: 'Staff Rutherford',
  es: 'Equipo Rutherford',
};

export function accountAreaEyebrow(locale: Locale, isTeam: boolean): string {
  return (isTeam ? STAFF : PARTNER)[locale];
}
