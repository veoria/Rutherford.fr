import type { Locale } from '@/components/language-provider';
import type { TeamRoleKey } from '@/data/onboarding-options';

// Localized labels for the internal team roles. Kept apart from the keys/validator
// (data/onboarding-options.ts) so server routes can validate a team role without
// pulling in any locale/client code. Only the (client) onboarding + profile forms
// import these labels.
export const TEAM_ROLE_LABELS: Record<Locale, Record<TeamRoleKey, string>> = {
  en: {
    sales: 'Sales',
    technical_color: 'Technical / Color',
    support: 'Support',
    management: 'Management',
    marketing: 'Marketing',
    operations: 'Operations',
  },
  fr: {
    sales: 'Commercial',
    technical_color: 'Technique / Couleur',
    support: 'Support',
    management: 'Direction',
    marketing: 'Marketing',
    operations: 'Opérations',
  },
  de: {
    sales: 'Vertrieb',
    technical_color: 'Technik / Farbe',
    support: 'Support',
    management: 'Geschäftsführung',
    marketing: 'Marketing',
    operations: 'Betrieb',
  },
  it: {
    sales: 'Vendite',
    technical_color: 'Tecnico / Colore',
    support: 'Supporto',
    management: 'Direzione',
    marketing: 'Marketing',
    operations: 'Operazioni',
  },
  es: {
    sales: 'Ventas',
    technical_color: 'Técnico / Color',
    support: 'Soporte',
    management: 'Dirección',
    marketing: 'Marketing',
    operations: 'Operaciones',
  },
  pt: {
    sales: 'Comercial',
    technical_color: 'Técnico / Cor',
    support: 'Suporte',
    management: 'Direção',
    marketing: 'Marketing',
    operations: 'Operações',
  },
};
