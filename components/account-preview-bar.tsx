'use client';

import { type Locale, useLanguage } from '@/components/language-provider';
import type { AccountType } from '@/data/account-types';

// Read-only admin preview ("view as client"): the banner (note + back to admin)
// and the preview tabs. Every preview page lives under
// /admin/users/[id]/preview/* so navigation stays inside the client's view —
// the /account/* routes would render the signed-in admin's own space instead.

const NOTE: Record<Locale, string> = {
  en: 'Client area preview — read only',
  fr: 'Aperçu de l’espace client — lecture seule',
  de: 'Vorschau des Kundenbereichs — nur Lesezugriff',
  it: 'Anteprima dell’area cliente — sola lettura',
  es: 'Vista previa del área de cliente — solo lectura',
  pt: 'Pré-visualização da área do cliente — apenas leitura',
};

// Neutre : le retour peut viser la fiche utilisateur OU la page organisation
// selon d'où l'aperçu a été ouvert.
const BACK: Record<Locale, string> = {
  en: '← Back to admin',
  fr: '← Retour admin',
  de: '← Zurück zum Admin',
  it: '← Torna all’admin',
  es: '← Volver al admin',
  pt: '← Voltar ao admin',
};

const ADMIN_DASHBOARD: Record<Locale, string> = {
  en: 'Admin dashboard',
  fr: 'Tableau de bord admin',
  de: 'Admin-Dashboard',
  it: 'Dashboard admin',
  es: 'Panel de administración',
  pt: 'Painel de administração',
};

const TABS: Record<Locale, { dashboard: string; atelier: string; parc: string }> = {
  en: { dashboard: 'Dashboard', atelier: 'My pressroom', parc: 'Client fleet' },
  fr: { dashboard: 'Tableau de bord', atelier: 'Mon atelier', parc: 'Parc clients' },
  de: { dashboard: 'Dashboard', atelier: 'Meine Druckerei', parc: 'Kundenpark' },
  it: { dashboard: 'Dashboard', atelier: 'Sala stampa', parc: 'Parco clienti' },
  es: { dashboard: 'Panel', atelier: 'Sala de prensa', parc: 'Parque de clientes' },
  pt: { dashboard: 'Painel', atelier: 'Sala de impressão', parc: 'Parque de clientes' },
};

export type PreviewContext = {
  /** The previewed user — preview routes live under /admin/users/[userId]/preview. */
  userId: string;
  accountType: AccountType;
  /** Where « Retour admin » goes (user page or org page); internal /admin path. */
  back?: string;
  name?: string | null;
};

/** A preview route for `path` ('' = hub, 'atelier', 'atelier/<id>', 'parc'), keeping ?back=. */
export function previewHref(ctx: Pick<PreviewContext, 'userId' | 'back'>, path = ''): string {
  const base = `/admin/users/${ctx.userId}/preview${path ? `/${path}` : ''}`;
  return ctx.back ? `${base}?back=${encodeURIComponent(ctx.back)}` : base;
}

export function PreviewBar({ ctx, current }: { ctx: PreviewContext; current: 'dashboard' | 'atelier' | 'parc' }) {
  const { locale } = useLanguage();
  const tabs = TABS[locale] ?? TABS.en;
  const back = ctx.back || `/admin/users/${ctx.userId}`;
  const items: { key: 'dashboard' | 'atelier' | 'parc'; label: string; href: string }[] = [
    { key: 'dashboard', label: tabs.dashboard, href: previewHref(ctx) },
  ];
  if (ctx.accountType === 'client') items.push({ key: 'atelier', label: tabs.atelier, href: previewHref(ctx, 'atelier') });
  if (ctx.accountType === 'reseller' || ctx.accountType === 'distributor') {
    items.push({ key: 'parc', label: tabs.parc, href: previewHref(ctx, 'parc') });
  }
  return (
    <>
      <div className="pv-bar">
        <div className="container pv-bar-inner">
          <span className="pv-note">
            {NOTE[locale] ?? NOTE.en}
            {ctx.name ? ` · ${ctx.name}` : ''}
          </span>
          <span className="pv-actions">
            <a className="button button-light" href={back}>
              {BACK[locale] ?? BACK.en}
            </a>
            <a className="button button-light" href="/admin">
              {ADMIN_DASHBOARD[locale] ?? ADMIN_DASHBOARD.en}
            </a>
          </span>
        </div>
      </div>
      {items.length > 1 ? (
        <nav className="acct-subnav" aria-label={tabs.dashboard}>
          <div className="container acct-subnav-inner">
            <div className="acct-subnav-links">
              {items.map((it) => (
                <a
                  key={it.key}
                  href={it.href}
                  className={`acct-subnav-link${current === it.key ? ' is-active' : ''}`}
                  aria-current={current === it.key ? 'page' : undefined}
                >
                  {it.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      ) : null}
    </>
  );
}
