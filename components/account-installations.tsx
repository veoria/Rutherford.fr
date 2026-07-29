'use client';

import { useState } from 'react';
import { type Locale, useLanguage } from '@/components/language-provider';
import { getCourseBySlug } from '@/data/academy-courses';

// One card per installed system (set by the Rutherford team in the org
// back-office): license, AnyDesk id, installed vs latest version, plus
// per-system Support / Training shortcuts. Plain serializable props — the
// server page maps lib/client-systems records into this shape.
export type AccountInstallation = {
  id: string;
  siteId: string | null;
  product: string;
  machine: string | null;
  licenseKey: string | null;
  licenseStatus: 'active' | 'trial' | 'expired' | 'suspended';
  licenseExpiresAt: string | null;
  anydeskId: string | null;
  installedVersion: string | null;
  latestVersion: string | null;
  updateAvailable: boolean;
};

// A plant/site (usine) the user can see. Serializable subset of SiteRecord.
export type AccountSite = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  anydeskId: string | null;
};

// Two targeted Academy courses per product family.
function coursesFor(product: string): string[] {
  const p = product.toLowerCase();
  if (p.includes('colorloop')) return ['colorloop-ai', 'closed-loop-flagship'];
  if (p.includes('measurecolor')) return ['measurecolor-production', 'measurement-essentials'];
  if (p.includes('intellitrax')) return ['intellitrax2', 'measurement-essentials'];
  if (p.includes('easyset') || p.includes('easyloop')) return ['closed-loop-flagship', 'fundamentals'];
  return ['fundamentals', 'closed-loop-flagship'];
}

type Copy = {
  heading: string;
  sub: string;
  status: Record<AccountInstallation['licenseStatus'], string>;
  license: string;
  expires: string;
  version: string;
  upToDate: string;
  updateTo: (v: string) => string;
  updateCta: string;
  copy: string;
  copied: string;
  remote: string;
  gSupport: string;
  gTraining: string;
  supportCta: string;
  allSites: string;
  unplaced: string;
  siteRemote: string;
  systemsCount: (n: number) => string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    heading: 'My system',
    sub: 'Your licenses, remote access and updates',
    status: { active: 'License active', trial: 'Trial', expired: 'License expired', suspended: 'Suspended' },
    license: 'License', expires: 'Valid until', version: 'Version',
    upToDate: 'Up to date',
    updateTo: (v) => `Update available → ${v}`,
    updateCta: 'Request the update',
    copy: 'Copy', copied: 'Copied', remote: 'Remote assistance',
    gSupport: 'Support', gTraining: 'Training',
    supportCta: 'Get support for this system',
    allSites: 'All plants', unplaced: 'Unassigned', siteRemote: 'Remote assistance',
    systemsCount: (n) => `${n} system${n === 1 ? '' : 's'}`,
  },
  fr: {
    heading: 'Mon système',
    sub: 'Vos licences, la prise en main à distance et les mises à jour',
    status: { active: 'Licence active', trial: 'Essai', expired: 'Licence expirée', suspended: 'Suspendue' },
    license: 'Licence', expires: 'Valable jusqu’au', version: 'Version',
    upToDate: 'À jour',
    updateTo: (v) => `Mise à jour disponible → ${v}`,
    updateCta: 'Demander la mise à jour',
    copy: 'Copier', copied: 'Copié', remote: 'Assistance à distance',
    gSupport: 'Support', gTraining: 'Formations',
    supportCta: 'Support sur ce système',
    allSites: 'Toutes les usines', unplaced: 'Non affecté', siteRemote: 'Assistance à distance',
    systemsCount: (n) => `${n} système${n === 1 ? '' : 's'}`,
  },
  de: {
    heading: 'Mein System',
    sub: 'Ihre Lizenzen, Fernwartung und Updates',
    status: { active: 'Lizenz aktiv', trial: 'Testphase', expired: 'Lizenz abgelaufen', suspended: 'Gesperrt' },
    license: 'Lizenz', expires: 'Gültig bis', version: 'Version',
    upToDate: 'Aktuell',
    updateTo: (v) => `Update verfügbar → ${v}`,
    updateCta: 'Update anfragen',
    copy: 'Kopieren', copied: 'Kopiert', remote: 'Fernwartung',
    gSupport: 'Support', gTraining: 'Schulungen',
    supportCta: 'Support für dieses System',
    allSites: 'Alle Werke', unplaced: 'Nicht zugeordnet', siteRemote: 'Fernwartung',
    systemsCount: (n) => `${n} System${n === 1 ? '' : 'e'}`,
  },
  it: {
    heading: 'Il mio sistema',
    sub: 'Le sue licenze, l’assistenza remota e gli aggiornamenti',
    status: { active: 'Licenza attiva', trial: 'Prova', expired: 'Licenza scaduta', suspended: 'Sospesa' },
    license: 'Licenza', expires: 'Valida fino al', version: 'Versione',
    upToDate: 'Aggiornato',
    updateTo: (v) => `Aggiornamento disponibile → ${v}`,
    updateCta: 'Richiedi l’aggiornamento',
    copy: 'Copia', copied: 'Copiato', remote: 'Assistenza remota',
    gSupport: 'Supporto', gTraining: 'Formazione',
    supportCta: 'Assistenza per questo sistema',
    allSites: 'Tutti gli stabilimenti', unplaced: 'Non assegnato', siteRemote: 'Assistenza remota',
    systemsCount: (n) => `${n} sistem${n === 1 ? 'a' : 'i'}`,
  },
  es: {
    heading: 'Mi sistema',
    sub: 'Sus licencias, la asistencia remota y las actualizaciones',
    status: { active: 'Licencia activa', trial: 'Prueba', expired: 'Licencia caducada', suspended: 'Suspendida' },
    license: 'Licencia', expires: 'Válida hasta', version: 'Versión',
    upToDate: 'Al día',
    updateTo: (v) => `Actualización disponible → ${v}`,
    updateCta: 'Solicitar la actualización',
    copy: 'Copiar', copied: 'Copiado', remote: 'Asistencia remota',
    gSupport: 'Soporte', gTraining: 'Formación',
    supportCta: 'Soporte para este sistema',
    allSites: 'Todas las plantas', unplaced: 'Sin asignar', siteRemote: 'Asistencia remota',
    systemsCount: (n) => `${n} sistema${n === 1 ? '' : 's'}`,
  },
  pt: {
    heading: 'O meu sistema',
    sub: 'As suas licenças, a assistência remota e as atualizações',
    status: { active: 'Licença ativa', trial: 'Teste', expired: 'Licença expirada', suspended: 'Suspensa' },
    license: 'Licença', expires: 'Válida até', version: 'Versão',
    upToDate: 'Atualizado',
    updateTo: (v) => `Atualização disponível → ${v}`,
    updateCta: 'Pedir a atualização',
    copy: 'Copiar', copied: 'Copiado', remote: 'Assistência remota',
    gSupport: 'Suporte', gTraining: 'Formação',
    supportCta: 'Suporte para este sistema',
    allSites: 'Todas as fábricas', unplaced: 'Não atribuído', siteRemote: 'Assistência remota',
    systemsCount: (n) => `${n} sistema${n === 1 ? '' : 's'}`,
  },
};

function fmtDate(iso: string, locale: Locale): string {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

const STATUS_PILL: Record<AccountInstallation['licenseStatus'], string> = {
  active: 'green',
  trial: 'blue',
  expired: 'amber',
  suspended: 'grey',
};

function CopyButton({ value, copy, copied }: { value: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`ah-copy${done ? ' done' : ''}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {done ? copied : copy}
    </button>
  );
}

function SystemCard({ s, t, locale, preview = false }: { s: AccountInstallation; t: Copy; locale: Locale; preview?: boolean }) {
  const courses = coursesFor(s.product).map((slug) => ({
    slug,
    title: getCourseBySlug(slug)?.title ?? slug,
  }));
  const supportSubject = [s.product, s.machine].filter(Boolean).join(' — ');
  const q = new URLSearchParams({ subject: supportSubject }).toString();
  return (
    <div className="ah-sys">
      <div className="ah-sys-h">
        <div>
          <div className="ah-sys-name">{s.product}</div>
          {s.machine ? <div className="ah-sys-meta">{s.machine}</div> : null}
        </div>
        <span className={`ah-sys-pill ${STATUS_PILL[s.licenseStatus]}`}>{t.status[s.licenseStatus]}</span>
      </div>

      <div className="ah-sys-kvs">
        {s.licenseKey ? (
          <div className="ah-sys-kv">
            <span className="ah-sys-k">{t.license}</span>
            <span className="ah-sys-v ah-mono">{s.licenseKey}</span>
          </div>
        ) : null}
        {s.licenseExpiresAt ? (
          <div className="ah-sys-kv">
            <span className="ah-sys-k">{t.expires}</span>
            <span className="ah-sys-v">{fmtDate(s.licenseExpiresAt, locale)}</span>
          </div>
        ) : null}
        {s.anydeskId ? (
          <div className="ah-sys-kv">
            <span className="ah-sys-k">AnyDesk</span>
            <span className="ah-sys-v ah-mono">
              {s.anydeskId}
              <CopyButton value={s.anydeskId} copy={t.copy} copied={t.copied} />
            </span>
          </div>
        ) : null}
        {s.installedVersion ? (
          <div className="ah-sys-kv">
            <span className="ah-sys-k">{t.version}</span>
            <span className="ah-sys-v">
              <span className="ah-mono">{s.installedVersion}</span>
              {s.updateAvailable && s.latestVersion ? (
                <span className="ah-sys-update">{t.updateTo(s.latestVersion)}</span>
              ) : (
                <span className="ah-sys-uptodate">{t.upToDate}</span>
              )}
            </span>
          </div>
        ) : null}
      </div>

      {preview ? null : (
        <div className="ah-sys-group">
          <div className="ah-sys-glabel">{t.gSupport}</div>
          <div className="ah-sys-links">
            <a className="ah-sys-link primary" href={`/support?${q}`}>{t.supportCta}</a>
            {s.updateAvailable && s.latestVersion ? (
              <a
                className="ah-sys-link"
                href={`/support?${new URLSearchParams({ subject: `${supportSubject} — ${t.updateTo(s.latestVersion)}` }).toString()}`}
              >
                {t.updateCta}
              </a>
            ) : null}
            {s.anydeskId ? (
              <a className="ah-sys-link" href={`anydesk:${s.anydeskId.replace(/\s+/g, '')}`}>
                {t.remote}
              </a>
            ) : null}
          </div>
        </div>
      )}

      <div className="ah-sys-group">
        <div className="ah-sys-glabel">{t.gTraining}</div>
        <div className="ah-sys-links">
          {courses.map((c) => (
            <a className="ah-sys-link" href={`/academy/${c.slug}`} key={c.slug}>
              {c.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function siteLocation(site: AccountSite): string {
  return [site.city, site.country].filter(Boolean).join(', ');
}

export function AccountInstallations({
  installations,
  sites = [],
  accent,
  preview = false,
}: {
  installations: AccountInstallation[];
  sites?: AccountSite[];
  accent: string;
  // Aperçu admin « vue client » : les CTA support ouvriraient le formulaire
  // avec la session de l'admin connecté — on les masque (données affichées).
  preview?: boolean;
}) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  // Only sites that actually carry a visible system are worth a tab; plus a
  // synthetic "unassigned" bucket for systems with no site.
  const bySite = new Map<string, AccountInstallation[]>();
  for (const inst of installations) {
    const key = inst.siteId ?? '__none__';
    const list = bySite.get(key) ?? [];
    list.push(inst);
    bySite.set(key, list);
  }
  const orderedSites = sites.filter((s) => bySite.has(s.id));
  const unplaced = bySite.get('__none__') ?? [];
  const tabCount = orderedSites.length + (unplaced.length ? 1 : 0);

  // Tab state: '__all__' | siteId | '__none__'. Default to all when several.
  const [tab, setTab] = useState<string>('__all__');

  if (!installations.length) return null;

  // No real site structure (single or zero named site) → flat grid, as before.
  const multi = tabCount > 1;

  const activeSite = orderedSites.find((s) => s.id === tab) ?? null;
  const visible =
    !multi || tab === '__all__'
      ? installations
      : tab === '__none__'
        ? unplaced
        : bySite.get(tab) ?? [];

  return (
    <div style={{ ['--role' as string]: accent }} id="account-system">
      <div className="ah-section-h">
        <span className="ah-section-t">{t.heading}</span>
        <span className="ah-section-s">{t.sub}</span>
      </div>

      {multi ? (
        <div className="ah-site-tabs" role="tablist">
          <button
            type="button"
            className={`ah-site-tab${tab === '__all__' ? ' on' : ''}`}
            onClick={() => setTab('__all__')}
          >
            {t.allSites}
            <span className="ah-site-tab-n">{t.systemsCount(installations.length)}</span>
          </button>
          {orderedSites.map((s) => (
            <button
              type="button"
              key={s.id}
              className={`ah-site-tab${tab === s.id ? ' on' : ''}`}
              onClick={() => setTab(s.id)}
            >
              {s.name}
              <span className="ah-site-tab-n">{t.systemsCount((bySite.get(s.id) ?? []).length)}</span>
            </button>
          ))}
          {unplaced.length ? (
            <button
              type="button"
              className={`ah-site-tab${tab === '__none__' ? ' on' : ''}`}
              onClick={() => setTab('__none__')}
            >
              {t.unplaced}
              <span className="ah-site-tab-n">{t.systemsCount(unplaced.length)}</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {activeSite && (siteLocation(activeSite) || activeSite.anydeskId) ? (
        <div className="ah-site-meta">
          {siteLocation(activeSite) ? <span className="ah-site-loc">{siteLocation(activeSite)}</span> : null}
          {activeSite.anydeskId ? (
            <span className="ah-site-remote">
              <span className="ah-sys-k">AnyDesk {activeSite.name}</span>
              <span className="ah-mono">{activeSite.anydeskId}</span>
              <CopyButton value={activeSite.anydeskId} copy={t.copy} copied={t.copied} />
              <a className="ah-sys-link" href={`anydesk:${activeSite.anydeskId.replace(/\s+/g, '')}`}>
                {t.siteRemote}
              </a>
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="ah-sys-grid">
        {visible.map((s) => (
          <SystemCard key={s.id} s={s} t={t} locale={locale} preview={preview} />
        ))}
      </div>
    </div>
  );
}
