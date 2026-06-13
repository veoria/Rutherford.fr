// Account classification shared between server (derivation) and client (labels).
// Client-safe: types/constants only, no server imports or secrets.
//
// Derived server-side from the user's email and CRM data — never self-declared.
// See lib/account-type.ts for the derivation rules.

export const ACCOUNT_TYPES = ['client', 'reseller', 'distributor', 'team'] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export function isAccountType(value: string): value is AccountType {
  return (ACCOUNT_TYPES as readonly string[]).includes(value);
}
