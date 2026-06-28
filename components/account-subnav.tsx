'use client';

import { useEffect, useState } from 'react';
import { type Locale, useLanguage } from '@/components/language-provider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

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
};

export function AccountSubnav({ current }: { current: AccountTab }) {
  const { locale } = useLanguage();
  const L = LABELS[locale];
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createSupabaseBrowserClient();
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active || !data.user) return;
      const { data: prof } = await supabase
        .from('profiles')
        .select('organization_id, company')
        .eq('id', data.user.id)
        .maybeSingle();
      const orgId = (prof?.organization_id as string | null) ?? null;
      if (!orgId) {
        if (active) setOrgName((prof?.company as string | null) ?? null);
        return;
      }
      const { data: org } = await supabase.from('organizations').select('logo_url, name').eq('id', orgId).maybeSingle();
      if (!active) return;
      setLogoUrl((org?.logo_url as string | null) ?? null);
      setOrgName((org?.name as string | null) ?? (prof?.company as string | null) ?? null);
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
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="acct-subnav-logo" src={logoUrl} alt={orgName ?? ''} />
        ) : null}
      </div>
    </nav>
  );
}
