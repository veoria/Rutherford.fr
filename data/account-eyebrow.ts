import type { Locale } from '@/components/language-provider';
import type { AccountType } from '@/data/account-types';

// The "area" label shown at the right of the account subnav (e.g. next to the
// co-brand logo): which space the visitor is in, by account type.
const LABELS: Record<Locale, Record<AccountType, string>> = {
  en: { team: 'Rutherford area', distributor: 'X-Rite area', reseller: 'Reseller area', client: 'Client area' },
  fr: { team: 'Espace Rutherford', distributor: 'Espace X-Rite', reseller: 'Espace revendeur', client: 'Espace client' },
  de: { team: 'Rutherford-Bereich', distributor: 'X-Rite-Bereich', reseller: 'Händlerbereich', client: 'Kundenbereich' },
  it: { team: 'Area Rutherford', distributor: 'Area X-Rite', reseller: 'Area rivenditore', client: 'Area cliente' },
  es: { team: 'Área Rutherford', distributor: 'Área X-Rite', reseller: 'Área de revendedor', client: 'Área de cliente' },
  pt: { team: 'Área Rutherford', distributor: 'Área X-Rite', reseller: 'Área de revendedor', client: 'Área de cliente' },
};

export function accountAreaLabel(locale: Locale, accountType: AccountType): string {
  return LABELS[locale][accountType] ?? LABELS[locale].client;
}
