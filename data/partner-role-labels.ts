import type { Locale } from '@/components/language-provider';
import type { DistributorRoleKey, ResellerRoleKey } from '@/data/onboarding-options';

// Localized labels for the PARTNER role referentials (brief § 2.2.a). Kept
// apart from the keys/validators (data/onboarding-options.ts) so server routes
// can validate without pulling in locale/client code — same split as
// data/team-role-labels.ts.

export const RESELLER_ROLE_LABELS: Record<Locale, Record<ResellerRoleKey, string>> = {
  en: {
    owner_manager: 'Owner / Management',
    sales: 'Sales',
    technical: 'Technical / Installation',
    trainer: 'Trainer',
    other: 'Other',
  },
  fr: {
    owner_manager: 'Gérant / Direction',
    sales: 'Commercial',
    technical: 'Technique / Installation',
    trainer: 'Formateur',
    other: 'Autre',
  },
  de: {
    owner_manager: 'Inhaber / Geschäftsführung',
    sales: 'Vertrieb',
    technical: 'Technik / Installation',
    trainer: 'Trainer',
    other: 'Sonstiges',
  },
  it: {
    owner_manager: 'Titolare / Direzione',
    sales: 'Commerciale',
    technical: 'Tecnica / Installazione',
    trainer: 'Formatore',
    other: 'Altro',
  },
  es: {
    owner_manager: 'Gerente / Dirección',
    sales: 'Comercial',
    technical: 'Técnica / Instalación',
    trainer: 'Formador',
    other: 'Otro',
  },
  pt: {
    owner_manager: 'Proprietário / Direção',
    sales: 'Comercial',
    technical: 'Técnica / Instalação',
    trainer: 'Formador',
    other: 'Outro',
  },
};

export const DISTRIBUTOR_ROLE_LABELS: Record<Locale, Record<DistributorRoleKey, string>> = {
  en: {
    sales: 'Sales',
    application_specialist: 'Application specialist',
    product_manager: 'Product manager',
    trainer: 'Trainer',
    management: 'Management',
    other: 'Other',
  },
  fr: {
    sales: 'Commercial',
    application_specialist: 'Spécialiste applications',
    product_manager: 'Responsable produit',
    trainer: 'Formateur',
    management: 'Direction',
    other: 'Autre',
  },
  de: {
    sales: 'Vertrieb',
    application_specialist: 'Applikationsspezialist',
    product_manager: 'Produktmanager',
    trainer: 'Trainer',
    management: 'Geschäftsführung',
    other: 'Sonstiges',
  },
  it: {
    sales: 'Commerciale',
    application_specialist: 'Specialista applicazioni',
    product_manager: 'Product manager',
    trainer: 'Formatore',
    management: 'Direzione',
    other: 'Altro',
  },
  es: {
    sales: 'Comercial',
    application_specialist: 'Especialista de aplicaciones',
    product_manager: 'Responsable de producto',
    trainer: 'Formador',
    management: 'Dirección',
    other: 'Otro',
  },
  pt: {
    sales: 'Comercial',
    application_specialist: 'Especialista de aplicações',
    product_manager: 'Gestor de produto',
    trainer: 'Formador',
    management: 'Direção',
    other: 'Outro',
  },
};
