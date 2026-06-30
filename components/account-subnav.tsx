'use client';

import { useEffect, useState } from 'react';
import { type Locale, useLanguage } from '@/components/language-provider';
import { accountAreaLabel } from '@/data/account-eyebrow';
import type { AccountType } from '@/data/account-types';

// Shared account-area shell: pill-tab subnav + the partner/distributor co-brand
// logo (top-right). Rendered right under <SiteNav> on every account page.
export type AccountTab = 'dashboard' | 'console' | 'academy' | 'team' | 'support' | 'profile';

const TABS: { key: Exclude<AccountTab, 'profile'>; href: string }[] = [
  { key: 'dashboard', href: '/account' },
  { key: 'console', href: '/account/console-validations' },
  { key: 'academy', href: '/account/academy' },
  { key: 'team', href: '/account/team' },
  { key: 'support', href: '/account/support' },
];

const LABELS: Record<Locale, Record<Exclude<AccountTab, 'profile'>, string>> = {
  en: { dashboard: 'Dashboard', console: 'Console Validation', academy: 'Academy', team: 'My team', support: 'Support' },
  fr: { dashboard: 'Tableau de bord', console: 'Validation console', academy: 'Academy', team: 'Mon équipe', support: 'Support' },
  de: { dashboard: 'Dashboard', console: 'Konsolenvalidierung', academy: 'Academy', team: 'Mein Team', support: 'Support' },
  it: { dashboard: 'Dashboard', console: 'Validazione console', academy: 'Academy', team: 'Il mio team', support: 'Support' },
  es: { dashboard: 'Panel', console: 'Validación de consola', academy: 'Academy', team: 'Mi equipo', support: 'Soporte' },
  pt: { dashboard: 'Painel', console: 'Validação de consola', academy: 'Academy', team: 'A minha equipa', support: 'Support' },
};

export function AccountSubnav({ current }: { current: AccountTab }) {
  const { locale } = useLanguage();
  const L = LABELS[locale];
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/account/subnav');
        if (!active || !res.ok) return;
        const d = (await res.json()) as {
          accountType?: AccountType;
          orgName?: string | null;
          logoUrl?: string | null;
        };
        if (!active) return;
        setAccountType((d.accountType ?? 'client') as AccountType);
        setOrgName(d.orgName ?? null);
        setLogoUrl(d.logoUrl ?? null);
      } catch {
        // Best-effort shell decoration; ignore failures.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <nav className="acct-subnav" aria-label={L.dashboard}>
      <div className="container acct-subnav-inner">
        <div className="acct-subnav-links">
          {TABS.map((s) => (
            <a
              key={s.key}
              href={s.href}
              className={`acct-subnav-link${current === s.key ? ' is-active' : ''}`}
              aria-current={current === s.key ? 'page' : undefined}
            >
              {L[s.key]}
            </a>
          ))}
        </div>
        <div className="acct-subnav-right">
          {accountType ? <span className="acct-subnav-area">{accountAreaLabel(locale, accountType)}</span> : null}
          {accountType && logoUrl ? <span className="acct-subnav-sep" aria-hidden="true" /> : null}
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="acct-subnav-logo" src={logoUrl} alt={orgName ?? ''} />
          ) : null}
        </div>
      </div>
    </nav>
  );
}
