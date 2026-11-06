import type { Locale } from '@/components/language-provider';

// Display labels for the blog categories. The English value stays the key
// (stored on each article and used for filtering); only the label is localized.
const LABELS: Record<string, Partial<Record<Locale, string>>> = {
  Standards: { fr: 'Normes', de: 'Standards', it: 'Standard', es: 'Normas', pt: 'Normas' },
  News: { fr: 'Actualités', de: 'Aktuelles', it: 'Notizie', es: 'Noticias', pt: 'Notícias' },
  Regulations: { fr: 'Réglementation', de: 'Regulierung', it: 'Normativa', es: 'Normativa', pt: 'Regulamentação' },
  Production: { fr: 'Production', de: 'Produktion', it: 'Produzione', es: 'Producción', pt: 'Produção' },
  'Color management': { fr: 'Gestion de la couleur', de: 'Farbmanagement', it: 'Gestione del colore', es: 'Gestión del color', pt: 'Gestão da cor' },
  Measurement: { fr: 'Mesure', de: 'Messtechnik', it: 'Misura', es: 'Medición', pt: 'Medição' },
  Compliance: { fr: 'Conformité', de: 'Konformität', it: 'Conformità', es: 'Conformidad', pt: 'Conformidade' },
  'Rutherford Blog': { fr: 'Blog Rutherford', de: 'Rutherford Blog', it: 'Blog Rutherford', es: 'Blog Rutherford', pt: 'Blog Rutherford' },
};

export function categoryLabel(category: string | undefined, locale: Locale): string {
  if (!category) return '';
  return LABELS[category]?.[locale] ?? category;
}
