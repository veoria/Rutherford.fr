'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { AccountSubnav } from '@/components/account-subnav';
import { PressSchematic } from '@/components/press-schematic';
import { type Locale, useLanguage } from '@/components/language-provider';
import { localizedCountryName } from '@/lib/countries';
import { PROFILE_LABELS, SYSTEM_KIND_LABELS, formatCopy, pressTitle, type SystemKind } from '@/data/press-config';
import {
  PressEditor,
  compatibilityHref,
  schematicFormat,
  supportHref,
  workshopCopy,
  type WorkshopPress,
  type WorkshopSite,
} from '@/components/account-workshop';

// Press sheet ("fiche presse") — one press of Mon atelier with everything the
// client needs around it: its configuration, the Rutherford software and
// hardware installed on it (versions, license, serials), a support button that
// files the ticket on this press, and the press's support history.

export type PressEquipment = {
  id: string;
  kind: SystemKind;
  product: string;
  serialNumber: string | null;
  licenseStatus: 'active' | 'trial' | 'expired' | 'suspended';
  licenseExpiresAt: string | null;
  anydeskId: string | null;
  installedVersion: string | null;
  latestVersion: string | null;
  updateAvailable: boolean;
};

export type PressHistoryTicket = {
  id: string;
  reference: string;
  subject: string | null;
  status: string;
  createdAt: string;
  mine: boolean;
};

type Copy = {
  back: string;
  support: string;
  supportSub: string;
  edit: string;
  config: string;
  site: string;
  console: string;
  year: string;
  profile: string;
  notes: string;
  equipmentH: string;
  equipmentSub: string;
  software: string;
  hardware: string;
  none: string;
  noneCta: string;
  license: Record<PressEquipment['licenseStatus'], string>;
  validUntil: string;
  version: string;
  firmware: string;
  serial: string;
  upToDate: string;
  updateTo: (v: string) => string;
  requestUpdate: string;
  remote: string;
  historyH: string;
  historyEmpty: string;
  historyMine: string;
  ticketStatus: Record<string, string>;
};

const COPY: Record<Locale, Copy> = {
  en: {
    back: '← My pressroom',
    support: 'Request support on this press',
    supportSub: 'The request is filed in this press’s history.',
    edit: 'Edit press',
    config: 'Configuration',
    site: 'Plant',
    console: 'Console',
    year: 'Year',
    profile: 'Production profile',
    notes: 'Notes',
    equipmentH: 'Rutherford equipment',
    equipmentSub: 'Software and hardware installed on this press, kept up to date by our team.',
    software: 'Software',
    hardware: 'Hardware',
    none: 'No Rutherford equipment on this press yet.',
    noneCta: 'Check console compatibility',
    license: { active: 'License active', trial: 'Trial', expired: 'Expired', suspended: 'Suspended' },
    validUntil: 'Valid until',
    version: 'Version',
    firmware: 'Version',
    serial: 'Serial number',
    upToDate: 'Up to date',
    updateTo: (v) => `Update available → ${v}`,
    requestUpdate: 'Request the update',
    remote: 'Remote assistance',
    historyH: 'Support history',
    historyEmpty: 'No support request on this press yet.',
    historyMine: 'Open',
    ticketStatus: { new: 'Received', in_progress: 'In progress', waiting_customer: 'Action needed', resolved: 'Resolved', closed: 'Closed' },
  },
  fr: {
    back: '← Mon atelier',
    support: 'Demander du support sur cette presse',
    supportSub: 'La demande est rangée dans l’historique de cette presse.',
    edit: 'Modifier la presse',
    config: 'Configuration',
    site: 'Site',
    console: 'Console',
    year: 'Année',
    profile: 'Profil de production',
    notes: 'Notes',
    equipmentH: 'Équipement Rutherford',
    equipmentSub: 'Logiciel et matériel installés sur cette presse, tenus à jour par notre équipe.',
    software: 'Logiciel',
    hardware: 'Matériel',
    none: 'Aucun équipement Rutherford sur cette presse pour l’instant.',
    noneCta: 'Vérifier la compatibilité console',
    license: { active: 'Licence active', trial: 'Essai', expired: 'Expirée', suspended: 'Suspendue' },
    validUntil: 'Valable jusqu’au',
    version: 'Version',
    firmware: 'Version',
    serial: 'N° de série',
    upToDate: 'À jour',
    updateTo: (v) => `Mise à jour disponible → ${v}`,
    requestUpdate: 'Demander la mise à jour',
    remote: 'Assistance à distance',
    historyH: 'Historique du support',
    historyEmpty: 'Aucune demande de support sur cette presse pour l’instant.',
    historyMine: 'Ouvrir',
    ticketStatus: { new: 'Reçue', in_progress: 'En cours', waiting_customer: 'Action requise', resolved: 'Résolue', closed: 'Clôturée' },
  },
  de: {
    back: '← Meine Druckerei',
    support: 'Support für diese Druckmaschine anfragen',
    supportSub: 'Die Anfrage wird im Verlauf dieser Maschine abgelegt.',
    edit: 'Maschine bearbeiten',
    config: 'Konfiguration',
    site: 'Werk',
    console: 'Konsole',
    year: 'Baujahr',
    profile: 'Produktionsprofil',
    notes: 'Notizen',
    equipmentH: 'Rutherford-Ausstattung',
    equipmentSub: 'Software und Hardware auf dieser Maschine, von unserem Team aktuell gehalten.',
    software: 'Software',
    hardware: 'Hardware',
    none: 'Noch keine Rutherford-Ausstattung auf dieser Maschine.',
    noneCta: 'Konsolenkompatibilität prüfen',
    license: { active: 'Lizenz aktiv', trial: 'Test', expired: 'Abgelaufen', suspended: 'Gesperrt' },
    validUntil: 'Gültig bis',
    version: 'Version',
    firmware: 'Version',
    serial: 'Seriennummer',
    upToDate: 'Aktuell',
    updateTo: (v) => `Update verfügbar → ${v}`,
    requestUpdate: 'Update anfragen',
    remote: 'Fernwartung',
    historyH: 'Support-Verlauf',
    historyEmpty: 'Noch keine Support-Anfrage zu dieser Maschine.',
    historyMine: 'Öffnen',
    ticketStatus: { new: 'Eingegangen', in_progress: 'In Bearbeitung', waiting_customer: 'Aktion erforderlich', resolved: 'Gelöst', closed: 'Geschlossen' },
  },
  it: {
    back: '← La mia sala stampa',
    support: 'Richiedi assistenza su questa macchina',
    supportSub: 'La richiesta viene archiviata nello storico di questa macchina.',
    edit: 'Modifica la macchina',
    config: 'Configurazione',
    site: 'Stabilimento',
    console: 'Console',
    year: 'Anno',
    profile: 'Profilo di produzione',
    notes: 'Note',
    equipmentH: 'Equipaggiamento Rutherford',
    equipmentSub: 'Software e hardware installati su questa macchina, aggiornati dal nostro team.',
    software: 'Software',
    hardware: 'Hardware',
    none: 'Ancora nessun equipaggiamento Rutherford su questa macchina.',
    noneCta: 'Verifica compatibilità console',
    license: { active: 'Licenza attiva', trial: 'Prova', expired: 'Scaduta', suspended: 'Sospesa' },
    validUntil: 'Valida fino al',
    version: 'Versione',
    firmware: 'Versione',
    serial: 'Numero di serie',
    upToDate: 'Aggiornato',
    updateTo: (v) => `Aggiornamento disponibile → ${v}`,
    requestUpdate: 'Richiedi l’aggiornamento',
    remote: 'Assistenza remota',
    historyH: 'Storico assistenza',
    historyEmpty: 'Ancora nessuna richiesta di assistenza su questa macchina.',
    historyMine: 'Apri',
    ticketStatus: { new: 'Ricevuta', in_progress: 'In corso', waiting_customer: 'Azione richiesta', resolved: 'Risolta', closed: 'Chiusa' },
  },
  es: {
    back: '← Mi sala de prensa',
    support: 'Solicitar soporte para esta prensa',
    supportSub: 'La solicitud se guarda en el historial de esta prensa.',
    edit: 'Editar la prensa',
    config: 'Configuración',
    site: 'Planta',
    console: 'Consola',
    year: 'Año',
    profile: 'Perfil de producción',
    notes: 'Notas',
    equipmentH: 'Equipamiento Rutherford',
    equipmentSub: 'Software y hardware instalados en esta prensa, actualizados por nuestro equipo.',
    software: 'Software',
    hardware: 'Hardware',
    none: 'Todavía no hay equipamiento Rutherford en esta prensa.',
    noneCta: 'Verificar compatibilidad de consola',
    license: { active: 'Licencia activa', trial: 'Prueba', expired: 'Caducada', suspended: 'Suspendida' },
    validUntil: 'Válida hasta',
    version: 'Versión',
    firmware: 'Versión',
    serial: 'Número de serie',
    upToDate: 'Actualizado',
    updateTo: (v) => `Actualización disponible → ${v}`,
    requestUpdate: 'Solicitar la actualización',
    remote: 'Asistencia remota',
    historyH: 'Historial de soporte',
    historyEmpty: 'Todavía no hay solicitudes de soporte para esta prensa.',
    historyMine: 'Abrir',
    ticketStatus: { new: 'Recibida', in_progress: 'En curso', waiting_customer: 'Acción requerida', resolved: 'Resuelta', closed: 'Cerrada' },
  },
  pt: {
    back: '← A minha sala de impressão',
    support: 'Pedir suporte para esta máquina',
    supportSub: 'O pedido fica no histórico desta máquina.',
    edit: 'Editar a máquina',
    config: 'Configuração',
    site: 'Fábrica',
    console: 'Consola',
    year: 'Ano',
    profile: 'Perfil de produção',
    notes: 'Notas',
    equipmentH: 'Equipamento Rutherford',
    equipmentSub: 'Software e hardware instalados nesta máquina, atualizados pela nossa equipa.',
    software: 'Software',
    hardware: 'Hardware',
    none: 'Ainda não há equipamento Rutherford nesta máquina.',
    noneCta: 'Verificar compatibilidade da consola',
    license: { active: 'Licença ativa', trial: 'Teste', expired: 'Expirada', suspended: 'Suspensa' },
    validUntil: 'Válida até',
    version: 'Versão',
    firmware: 'Versão',
    serial: 'Número de série',
    upToDate: 'Atualizado',
    updateTo: (v) => `Atualização disponível → ${v}`,
    requestUpdate: 'Pedir a atualização',
    remote: 'Assistência remota',
    historyH: 'Histórico de suporte',
    historyEmpty: 'Ainda não há pedidos de suporte para esta máquina.',
    historyMine: 'Abrir',
    ticketStatus: { new: 'Recebido', in_progress: 'Em curso', waiting_customer: 'Ação necessária', resolved: 'Resolvido', closed: 'Encerrado' },
  },
};

const LICENSE_TONE: Record<PressEquipment['licenseStatus'], string> = {
  active: 'is-ok',
  trial: 'is-soft',
  expired: 'is-warn',
  suspended: 'is-muted',
};

const TICKET_TONE: Record<string, string> = {
  new: 'is-soft',
  in_progress: 'is-soft',
  waiting_customer: 'is-warn',
  resolved: 'is-ok',
  closed: 'is-muted',
};

function fmtDate(iso: string | null, locale: Locale): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function AccountPressDetail({
  press: initialPress,
  sites,
  equipment,
  history,
  canDelete,
}: {
  press: WorkshopPress;
  sites: WorkshopSite[];
  equipment: PressEquipment[];
  history: PressHistoryTicket[];
  canDelete: boolean;
}) {
  const { locale } = useLanguage();
  const t = COPY[locale] ?? COPY.en;
  const wt = workshopCopy(locale);
  const router = useRouter();
  const [press, setPress] = useState(initialPress);
  const [editing, setEditing] = useState(false);

  const site = press.siteId ? sites.find((s) => s.id === press.siteId) ?? null : null;
  const title = pressTitle(press);
  const machine = [press.manufacturer, press.model].filter(Boolean).join(' ');
  const fmt = formatCopy(locale)[press.sheetFormat];
  const software = equipment.filter((e) => e.kind === 'software');
  const hardware = equipment.filter((e) => e.kind !== 'software');
  const anydesk = software.find((e) => e.anydeskId)?.anydeskId ?? null;

  return (
    <main className="page-shell" id="top">
      <SiteNav current="account" />
      <AccountSubnav current="atelier" />
      <section className="ws-section">
        <div className="container ws-wrap">
          <a className="ws-back" href="/account/atelier">
            {t.back}
          </a>

          <div className="pd-hero">
            <div className="pd-art" aria-hidden="true">
              <PressSchematic format={schematicFormat(press.sheetFormat)} colors={press.colors} />
            </div>
            <div className="pd-id">
              <h1 className="ws-title">{title}</h1>
              {title !== machine ? <p className="ws-sub">{machine}</p> : null}
              <div className="ws-chips pd-chips">
                <span className={`ws-chip ${equipment.length ? 'is-ok' : 'is-muted'}`}>
                  {equipment.length ? wt.card.equipped : wt.card.notEquipped}
                </span>
                <span className="ws-chip">
                  {fmt.label} · {fmt.dims}
                </span>
                <span className="ws-chip">{wt.card.units(press.colors)}</span>
                {press.coater ? <span className="ws-chip">{wt.card.coater}</span> : null}
                {press.perfecting ? <span className="ws-chip">{wt.card.perfecting}</span> : null}
              </div>
              <dl className="ws-meta pd-meta">
                {site ? (
                  <div>
                    <dt>{t.site}</dt>
                    <dd>
                      {site.name}
                      {site.city || site.country ? (
                        <small>
                          {[site.city, site.country ? localizedCountryName(site.country, locale) : null].filter(Boolean).join(', ')}
                        </small>
                      ) : null}
                    </dd>
                  </div>
                ) : null}
                {press.console ? (
                  <div>
                    <dt>{t.console}</dt>
                    <dd>{press.console}</dd>
                  </div>
                ) : null}
                {press.year ? (
                  <div>
                    <dt>{t.year}</dt>
                    <dd>{press.year}</dd>
                  </div>
                ) : null}
                {press.productionProfile ? (
                  <div>
                    <dt>{t.profile}</dt>
                    <dd>{PROFILE_LABELS[locale][press.productionProfile]}</dd>
                  </div>
                ) : null}
              </dl>
              {press.notes ? <p className="pd-notes">{press.notes}</p> : null}
              <div className="pd-actions">
                <a className="button button-accent" href={supportHref(press, title, anydesk)}>
                  {t.support}
                </a>
                <button type="button" className="button button-light" onClick={() => setEditing(true)}>
                  {t.edit}
                </button>
              </div>
              <p className="ws-hint">{t.supportSub}</p>
            </div>
          </div>

          <div className="pd-grid">
            <section className="pd-block" aria-labelledby="pd-eq">
              <h2 className="pd-h" id="pd-eq">
                {t.equipmentH}
              </h2>
              <p className="pd-sub">{t.equipmentSub}</p>
              {!equipment.length ? (
                <div className="pd-empty">
                  <p>{t.none}</p>
                  <a className="ws-link" href={compatibilityHref(press)}>
                    {t.noneCta} →
                  </a>
                </div>
              ) : (
                <>
                  {software.length ? <h3 className="pd-kind">{t.software}</h3> : null}
                  {software.map((e) => (
                    <EquipmentRow key={e.id} e={e} t={t} locale={locale} press={press} title={title} />
                  ))}
                  {hardware.length ? <h3 className="pd-kind">{t.hardware}</h3> : null}
                  {hardware.map((e) => (
                    <EquipmentRow key={e.id} e={e} t={t} locale={locale} press={press} title={title} />
                  ))}
                </>
              )}
            </section>

            <section className="pd-block" aria-labelledby="pd-hist">
              <h2 className="pd-h" id="pd-hist">
                {t.historyH}
              </h2>
              {history.length ? (
                <ul className="pd-history">
                  {history.map((h) => (
                    <li key={h.id}>
                      <div>
                        <strong>{h.subject || `#${h.reference}`}</strong>
                        <span>
                          #{h.reference} · {fmtDate(h.createdAt, locale)}
                        </span>
                      </div>
                      <span className={`ws-chip ${TICKET_TONE[h.status] ?? 'is-muted'}`}>{t.ticketStatus[h.status] ?? h.status}</span>
                      {h.mine ? (
                        <a className="ws-link" href="/account/support">
                          {t.historyMine}
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pd-sub">{t.historyEmpty}</p>
              )}
            </section>
          </div>
        </div>
      </section>

      {editing ? (
        <PressEditor
          t={wt}
          locale={locale}
          sites={sites}
          initial={press}
          defaultSiteId={null}
          canDelete={canDelete}
          onClose={() => setEditing(false)}
          onSaved={(saved, removedId) => {
            setEditing(false);
            if (removedId) {
              window.location.href = '/account/atelier';
              return;
            }
            if (saved[0]) setPress((p) => ({ ...p, ...saved[0] }));
            router.refresh();
          }}
        />
      ) : null}

      <SiteFooter />
    </main>
  );
}

function EquipmentRow({
  e,
  t,
  locale,
  press,
  title,
}: {
  e: PressEquipment;
  t: Copy;
  locale: Locale;
  press: WorkshopPress;
  title: string;
}) {
  const isSoftware = e.kind === 'software';
  const updateSubject = e.latestVersion ? `${title} — ${e.product} — ${t.updateTo(e.latestVersion)}` : title;
  return (
    <div className="pd-eq">
      <div className="pd-eq-head">
        <div>
          <strong>{e.product}</strong>
          <span>{SYSTEM_KIND_LABELS[locale][e.kind]}</span>
        </div>
        {isSoftware ? <span className={`ws-chip ${LICENSE_TONE[e.licenseStatus]}`}>{t.license[e.licenseStatus]}</span> : null}
      </div>
      <dl className="pd-kv">
        {e.serialNumber ? (
          <div>
            <dt>{t.serial}</dt>
            <dd className="pd-mono">{e.serialNumber}</dd>
          </div>
        ) : null}
        {e.installedVersion ? (
          <div>
            <dt>{isSoftware ? t.version : t.firmware}</dt>
            <dd>
              <span className="pd-mono">{e.installedVersion}</span>{' '}
              {e.updateAvailable && e.latestVersion ? (
                <span className="ws-chip is-warn">{t.updateTo(e.latestVersion)}</span>
              ) : (
                <span className="ws-chip is-ok">{t.upToDate}</span>
              )}
            </dd>
          </div>
        ) : null}
        {isSoftware && e.licenseExpiresAt ? (
          <div>
            <dt>{t.validUntil}</dt>
            <dd>{fmtDate(e.licenseExpiresAt, locale)}</dd>
          </div>
        ) : null}
        {e.anydeskId ? (
          <div>
            <dt>AnyDesk</dt>
            <dd className="pd-mono">{e.anydeskId}</dd>
          </div>
        ) : null}
      </dl>
      {(e.updateAvailable && e.latestVersion) || e.anydeskId ? (
        <div className="pd-eq-actions">
          {e.updateAvailable && e.latestVersion ? (
            <a className="ws-link" href={`/support?${new URLSearchParams({ subject: updateSubject, press: press.id }).toString()}`}>
              {t.requestUpdate}
            </a>
          ) : null}
          {e.anydeskId ? (
            <a className="ws-link" href={`anydesk:${e.anydeskId.replace(/\s+/g, '')}`}>
              {t.remote}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
