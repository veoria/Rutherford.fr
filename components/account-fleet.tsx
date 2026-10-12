'use client';

import { useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { AccountSubnav } from '@/components/account-subnav';
import { PreviewBar, type PreviewContext } from '@/components/account-preview-bar';
import { PressSchematic } from '@/components/press-schematic';
import { type Locale, useLanguage } from '@/components/language-provider';
import { localizedCountryName } from '@/lib/countries';
import { SYSTEM_KIND_LABELS, formatCopy } from '@/data/press-config';
import { schematicFormat, workshopCopy } from '@/components/account-workshop';
import type { FleetClient, FleetEquipment, PartnerFleet } from '@/lib/partner-fleet';

// "Parc clients" — the reseller / distributor view of its clients' pressrooms
// (rules in lib/partner-fleet.ts): presses it equipped, with their software and
// hardware versions, and the declared presses not equipped yet (opportunities).
// Read-only.

type Copy = {
  title: string;
  sub: string;
  kpiClients: string;
  kpiEquipped: string;
  kpiOpportunities: string;
  kpiUpdates: string;
  kpiExpiring: string;
  filterAll: string;
  filterEquipped: string;
  filterOpportunities: string;
  equipped: string;
  opportunity: string;
  opportunityHint: string;
  propose: string;
  unplaced: string;
  noPresses: string;
  notAttributed: string;
  empty: string;
  version: string;
  updateTo: (v: string) => string;
  upToDate: string;
  validUntil: string;
  readOnly: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    title: 'Client fleet',
    sub: 'Your clients’ presses: the ones you equipped, with their versions and licenses, and the ones still to equip.',
    kpiClients: 'Clients',
    kpiEquipped: 'Presses equipped by you',
    kpiOpportunities: 'Presses to equip',
    kpiUpdates: 'Updates pending',
    kpiExpiring: 'Licenses expiring < 90 d',
    filterAll: 'All',
    filterEquipped: 'Equipped',
    filterOpportunities: 'To equip',
    equipped: 'Equipped by you',
    opportunity: 'Not equipped',
    opportunityHint: 'Declared by the client, no Rutherford equipment yet.',
    propose: 'Request a console validation',
    unplaced: 'Equipment not linked to a press yet',
    noPresses: 'This client hasn’t declared any press yet.',
    notAttributed: 'Equipment you sold',
    empty: 'No client in your fleet yet. Clients attributed to you by Rutherford and the systems you sell appear here.',
    version: 'Version',
    updateTo: (v) => `Update → ${v}`,
    upToDate: 'Up to date',
    validUntil: 'until',
    readOnly: 'Read only — your clients keep their pressroom up to date.',
  },
  fr: {
    title: 'Parc clients',
    sub: 'Les presses de vos clients : celles que vous avez équipées, avec leurs versions et licences, et celles qui restent à équiper.',
    kpiClients: 'Clients',
    kpiEquipped: 'Presses équipées par vous',
    kpiOpportunities: 'Presses à équiper',
    kpiUpdates: 'Mises à jour en attente',
    kpiExpiring: 'Licences à échéance < 90 j',
    filterAll: 'Tout',
    filterEquipped: 'Équipées',
    filterOpportunities: 'À équiper',
    equipped: 'Équipée par vous',
    opportunity: 'Non équipée',
    opportunityHint: 'Déclarée par le client, sans équipement Rutherford.',
    propose: 'Demander une validation console',
    unplaced: 'Équipement pas encore rattaché à une presse',
    noPresses: 'Ce client n’a pas encore déclaré de presse.',
    notAttributed: 'Équipement vendu par vous',
    empty: 'Aucun client dans votre parc pour l’instant. Les clients que Rutherford vous attribue et les systèmes que vous vendez apparaissent ici.',
    version: 'Version',
    updateTo: (v) => `Mise à jour → ${v}`,
    upToDate: 'À jour',
    validUntil: 'jusqu’au',
    readOnly: 'Lecture seule — vos clients tiennent leur atelier à jour.',
  },
  de: {
    title: 'Kundenpark',
    sub: 'Die Druckmaschinen Ihrer Kunden: die von Ihnen ausgestatteten, mit Versionen und Lizenzen, und die noch auszustattenden.',
    kpiClients: 'Kunden',
    kpiEquipped: 'Von Ihnen ausgestattet',
    kpiOpportunities: 'Noch auszustatten',
    kpiUpdates: 'Ausstehende Updates',
    kpiExpiring: 'Lizenzen < 90 T fällig',
    filterAll: 'Alle',
    filterEquipped: 'Ausgestattet',
    filterOpportunities: 'Auszustatten',
    equipped: 'Von Ihnen ausgestattet',
    opportunity: 'Nicht ausgestattet',
    opportunityHint: 'Vom Kunden erfasst, noch ohne Rutherford-Ausstattung.',
    propose: 'Konsolenvalidierung anfragen',
    unplaced: 'Ausstattung noch keiner Maschine zugeordnet',
    noPresses: 'Dieser Kunde hat noch keine Druckmaschine erfasst.',
    notAttributed: 'Von Ihnen verkaufte Ausstattung',
    empty: 'Noch keine Kunden in Ihrem Park. Von Rutherford zugeordnete Kunden und von Ihnen verkaufte Systeme erscheinen hier.',
    version: 'Version',
    updateTo: (v) => `Update → ${v}`,
    upToDate: 'Aktuell',
    validUntil: 'bis',
    readOnly: 'Nur Lesezugriff — Ihre Kunden pflegen ihre Druckerei selbst.',
  },
  it: {
    title: 'Parco clienti',
    sub: 'Le macchine dei Suoi clienti: quelle che ha equipaggiato, con versioni e licenze, e quelle ancora da equipaggiare.',
    kpiClients: 'Clienti',
    kpiEquipped: 'Equipaggiate da Lei',
    kpiOpportunities: 'Da equipaggiare',
    kpiUpdates: 'Aggiornamenti in attesa',
    kpiExpiring: 'Licenze in scadenza < 90 g',
    filterAll: 'Tutte',
    filterEquipped: 'Equipaggiate',
    filterOpportunities: 'Da equipaggiare',
    equipped: 'Equipaggiata da Lei',
    opportunity: 'Non equipaggiata',
    opportunityHint: 'Dichiarata dal cliente, senza equipaggiamento Rutherford.',
    propose: 'Richiedi validazione console',
    unplaced: 'Equipaggiamento non ancora collegato a una macchina',
    noPresses: 'Questo cliente non ha ancora dichiarato macchine.',
    notAttributed: 'Equipaggiamento venduto da Lei',
    empty: 'Ancora nessun cliente nel Suo parco. Qui compaiono i clienti attribuiti da Rutherford e i sistemi che vende.',
    version: 'Versione',
    updateTo: (v) => `Aggiornamento → ${v}`,
    upToDate: 'Aggiornato',
    validUntil: 'fino al',
    readOnly: 'Sola lettura — i Suoi clienti aggiornano la propria sala stampa.',
  },
  es: {
    title: 'Parque de clientes',
    sub: 'Las prensas de sus clientes: las que usted equipó, con versiones y licencias, y las que quedan por equipar.',
    kpiClients: 'Clientes',
    kpiEquipped: 'Equipadas por usted',
    kpiOpportunities: 'Por equipar',
    kpiUpdates: 'Actualizaciones pendientes',
    kpiExpiring: 'Licencias que vencen < 90 d',
    filterAll: 'Todas',
    filterEquipped: 'Equipadas',
    filterOpportunities: 'Por equipar',
    equipped: 'Equipada por usted',
    opportunity: 'No equipada',
    opportunityHint: 'Declarada por el cliente, sin equipamiento Rutherford.',
    propose: 'Solicitar validación de consola',
    unplaced: 'Equipamiento aún no vinculado a una prensa',
    noPresses: 'Este cliente aún no ha declarado prensas.',
    notAttributed: 'Equipamiento vendido por usted',
    empty: 'Todavía no hay clientes en su parque. Aquí aparecen los clientes que Rutherford le atribuye y los sistemas que vende.',
    version: 'Versión',
    updateTo: (v) => `Actualización → ${v}`,
    upToDate: 'Actualizado',
    validUntil: 'hasta',
    readOnly: 'Solo lectura — sus clientes mantienen su sala de prensa al día.',
  },
  pt: {
    title: 'Parque de clientes',
    sub: 'As máquinas dos seus clientes: as que equipou, com versões e licenças, e as que faltam equipar.',
    kpiClients: 'Clientes',
    kpiEquipped: 'Equipadas por si',
    kpiOpportunities: 'Por equipar',
    kpiUpdates: 'Atualizações pendentes',
    kpiExpiring: 'Licenças a expirar < 90 d',
    filterAll: 'Todas',
    filterEquipped: 'Equipadas',
    filterOpportunities: 'Por equipar',
    equipped: 'Equipada por si',
    opportunity: 'Não equipada',
    opportunityHint: 'Declarada pelo cliente, sem equipamento Rutherford.',
    propose: 'Pedir validação de consola',
    unplaced: 'Equipamento ainda não associado a uma máquina',
    noPresses: 'Este cliente ainda não declarou máquinas.',
    notAttributed: 'Equipamento vendido por si',
    empty: 'Ainda não há clientes no seu parque. Aqui aparecem os clientes atribuídos pela Rutherford e os sistemas que vende.',
    version: 'Versão',
    updateTo: (v) => `Atualização → ${v}`,
    upToDate: 'Atualizado',
    validUntil: 'até',
    readOnly: 'Apenas leitura — os seus clientes mantêm a sala de impressão atualizada.',
  },
};

type Filter = 'all' | 'equipped' | 'opportunity';

function fmtDate(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function AccountFleet({ fleet, previewCtx }: { fleet: PartnerFleet; previewCtx?: PreviewContext }) {
  const { locale } = useLanguage();
  const t = COPY[locale] ?? COPY.en;
  const [filter, setFilter] = useState<Filter>('all');
  const k = fleet.totals;

  const visible = fleet.clients
    .map((c) => ({ ...c, presses: c.presses.filter((p) => filter === 'all' || p.status === filter) }))
    .filter((c) => filter === 'all' || c.presses.length);

  return (
    <main className="page-shell" id="top">
      <SiteNav current="account" />
      {previewCtx ? <PreviewBar ctx={previewCtx} current="parc" /> : <AccountSubnav current="parc" />}
      <section className="ws-section">
        <div className="container ws-wrap">
          <header className="ws-head">
            <div>
              <h1 className="ws-title">{t.title}</h1>
              <p className="ws-sub">{t.sub}</p>
            </div>
          </header>

          <div className="fl-kpis">
            <Kpi label={t.kpiClients} value={k.clients} />
            <Kpi label={t.kpiEquipped} value={k.equipped} />
            <Kpi label={t.kpiOpportunities} value={k.opportunities} tone={k.opportunities ? 'blue' : undefined} />
            <Kpi label={t.kpiUpdates} value={k.updates} tone={k.updates ? 'amber' : undefined} />
            <Kpi label={t.kpiExpiring} value={k.expiringSoon} tone={k.expiringSoon ? 'amber' : undefined} />
          </div>

          {fleet.clients.length ? (
            <>
              <div className="ws-tabs" role="tablist">
                {(['all', 'equipped', 'opportunity'] as Filter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="tab"
                    aria-selected={filter === f}
                    className={`ws-tab${filter === f ? ' is-active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? t.filterAll : f === 'equipped' ? t.filterEquipped : t.filterOpportunities}
                  </button>
                ))}
              </div>
              <p className="ws-hint fl-ro">{t.readOnly}</p>
              <div className="fl-clients">
                {visible.map((c) => (
                  <ClientBlock
                    key={c.orgId}
                    c={c}
                    t={t}
                    locale={locale}
                    showUnplaced={filter !== 'opportunity'}
                    readOnly={Boolean(previewCtx)}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="ws-site-empty">{t.empty}</p>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone?: 'blue' | 'amber' }) {
  return (
    <div className={`fl-kpi${tone ? ` is-${tone}` : ''}`}>
      <span className="fl-kpi-v">{value}</span>
      <span className="fl-kpi-l">{label}</span>
    </div>
  );
}

function ClientBlock({
  c,
  t,
  locale,
  showUnplaced,
  readOnly,
}: {
  c: FleetClient;
  t: Copy;
  locale: Locale;
  showUnplaced: boolean;
  readOnly: boolean;
}) {
  const wt = workshopCopy(locale);
  const formats = formatCopy(locale);
  return (
    <section className="fl-client">
      <header className="fl-client-h">
        <h2>{c.name}</h2>
        <span>
          {[c.country ? localizedCountryName(c.country, locale) : null, wt.statPresses(c.presses.length)].filter(Boolean).join(' · ')}
        </span>
      </header>
      {c.presses.length ? (
        <div className="fl-presses">
          {c.presses.map((p) => (
            <article className="fl-press" key={p.id}>
              <div className="fl-press-art" aria-hidden="true">
                <PressSchematic format={schematicFormat(p.sheetFormat)} colors={p.colors} viewBox="220 70 860 450" />
              </div>
              <div className="fl-press-body">
                <div className="fl-press-top">
                  <div>
                    <strong>{p.title}</strong>
                    <span>
                      {[p.title !== p.machine ? p.machine : null, p.siteName].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <span className={`ws-chip ${p.status === 'equipped' ? 'is-ok' : 'is-soft'}`}>
                    {p.status === 'equipped' ? t.equipped : t.opportunity}
                  </span>
                </div>
                <div className="ws-chips">
                  <span className="ws-chip">{formats[p.sheetFormat].label}</span>
                  <span className="ws-chip">{wt.card.units(p.colors)}</span>
                  {p.coater ? <span className="ws-chip">{wt.card.coater}</span> : null}
                  {p.perfecting ? <span className="ws-chip">{wt.card.perfecting}</span> : null}
                </div>
                {p.status === 'equipped' ? (
                  <ul className="fl-eq">
                    {p.equipment.map((e) => (
                      <EquipmentLine key={e.id} e={e} t={t} locale={locale} />
                    ))}
                  </ul>
                ) : (
                  <p className="fl-opp">
                    {t.opportunityHint}{' '}
                    {readOnly ? null : (
                      <a className="ws-link" href="/console-validation#submit">
                        {t.propose} →
                      </a>
                    )}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : c.attributed && !c.unplaced.length ? (
        <p className="fl-none">{t.noPresses}</p>
      ) : null}
      {showUnplaced && c.unplaced.length ? (
        <div className="fl-unplaced">
          <span className="pd-kind">{c.presses.length || c.attributed ? t.unplaced : t.notAttributed}</span>
          <ul className="fl-eq">
            {c.unplaced.map((e) => (
              <EquipmentLine key={e.id} e={e} t={t} locale={locale} />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function EquipmentLine({ e, t, locale }: { e: FleetEquipment; t: Copy; locale: Locale }) {
  return (
    <li>
      <span className="fl-eq-name">
        {e.product}
        <small>
          {SYSTEM_KIND_LABELS[locale][e.kind]}
          {e.serialNumber ? ` · S/N ${e.serialNumber}` : ''}
          {e.kind === 'software' && e.licenseExpiresAt ? ` · ${t.validUntil} ${fmtDate(e.licenseExpiresAt, locale)}` : ''}
        </small>
      </span>
      {e.installedVersion ? (
        <span className={`ws-chip ${e.updateAvailable ? 'is-warn' : 'is-ok'}`}>
          {e.installedVersion}
          {e.updateAvailable && e.latestVersion ? ` · ${t.updateTo(e.latestVersion)}` : ` · ${t.upToDate}`}
        </span>
      ) : null}
    </li>
  );
}
