'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { COUNTRIES, JOB_TITLE_KEYS, isJobTitleKey, type JobTitleKey } from '@/data/onboarding-options';
import { ACCOUNT_TYPES, type AccountType } from '@/data/account-types';
import type { AdminConsoleValidation, AdminOverview, AdminUser } from '@/lib/admin';
import type { AdminOrg } from '@/lib/organizations';

const ROLE_LABELS: Record<JobTitleKey, string> = {
  operator: 'Conducteur de presse',
  prepress: 'Prépresse / Photogravure',
  production_manager: 'Responsable de production',
  quality_color: 'Qualité / Responsable couleur',
  purchasing: 'Achats',
  management: 'Direction / Dirigeant',
  brand_owner: 'Marque / Acheteur packaging',
  sales_marketing: 'Commercial / Marketing',
  other: 'Autre',
};

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  client: 'Client direct',
  reseller: 'Revendeur',
  distributor: 'Distributeur',
  team: 'Équipe',
};

const CV_STATUS_LABELS: Record<string, string> = {
  submitted: 'Reçue',
  in_review: 'En revue',
  changes_requested: 'Action requise',
  can_be_connected: 'Connectable',
  rejected: 'Non éligible',
};

const CV_STATUS_TONE: Record<string, string> = {
  submitted: 'review',
  in_review: 'review',
  changes_requested: 'action',
  can_be_connected: 'green',
  rejected: 'red',
};

const ERROR_LABELS: Record<string, string> = {
  cannot_self_demote: 'Vous ne pouvez pas retirer votre propre accès admin.',
  cannot_delete_self: 'Vous ne pouvez pas supprimer votre propre compte.',
  cannot_suspend_self: 'Vous ne pouvez pas suspendre votre propre compte.',
  forbidden: 'Action réservée aux admins.',
  unauthorized: 'Session expirée — reconnectez-vous.',
  mfa_required: 'Activez la double authentification pour gérer les comptes.',
};
const errorLabel = (code: unknown) =>
  (typeof code === 'string' && ERROR_LABELS[code]) || 'Une erreur est survenue.';

function fmtDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function toCsv(users: AdminUser[]): string {
  const headers = [
    'Nom', 'Email', 'Société', 'Pays', 'Poste', 'Type de compte', 'Admin', 'Onboardé', 'Inscrit',
    'Dernière activité', 'Modules terminés', 'Cours terminés', 'Certificats', 'Niveau', 'XP', 'Série',
    'Pass actif', 'Achats',
  ];
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = users.map((u) =>
    [
      u.name, u.email, u.company, u.country, u.jobTitle, ACCOUNT_TYPE_LABELS[u.accountType],
      u.isAdmin ? 'oui' : '', u.onboarded ? 'oui' : '',
      u.signupAt ? new Date(u.signupAt).toISOString().slice(0, 10) : '',
      u.lastActiveAt ? new Date(u.lastActiveAt).toISOString().slice(0, 10) : '',
      u.modulesCompleted, u.coursesCompleted, u.certificates, u.level, u.xp, u.streak,
      u.activePass ? 'oui' : '', u.purchases,
    ]
      .map(cell)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

function AccountTypeBadge({ type }: { type: AccountType }) {
  return <span className={`account-type-badge account-type-${type}`}>{ACCOUNT_TYPE_LABELS[type]}</span>;
}

function UserDrawer({ user, isSelf, onClose }: { user: AdminUser; isSelf: boolean; onClose: () => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.name ?? '');
  const [company, setCompany] = useState(user.company ?? '');
  const [country, setCountry] = useState(user.country ?? '');
  const [jobTitle, setJobTitle] = useState(isJobTitleKey(user.jobTitle ?? '') ? (user.jobTitle as string) : '');
  const [accountType, setAccountType] = useState<AccountType>(user.accountType);
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [suspended, setSuspended] = useState(user.suspended);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          full_name: fullName.trim(),
          company: company.trim(),
          country,
          job_title: jobTitle,
          account_type: accountType,
          is_admin: isAdmin,
        }),
      });
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        setBusy(false);
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError('Erreur réseau.');
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, { method: 'DELETE' });
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        setBusy(false);
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError('Erreur réseau.');
      setBusy(false);
    }
  };

  const toggleSuspend = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, suspend: !suspended }),
      });
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        setBusy(false);
        return;
      }
      setSuspended((s) => !s);
      router.refresh();
      setBusy(false);
    } catch {
      setError('Erreur réseau.');
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="presentation">
      <div className="admin-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="admin-modal-head">
          <h3>{user.name || user.email}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>
        <p className="admin-modal-email">{user.email}</p>

        <div className="admin-field">
          <label>Nom</label>
          <input className="admin-input" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={busy} />
        </div>
        <div className="admin-field">
          <label>Société</label>
          <input className="admin-input" value={company} onChange={(e) => setCompany(e.target.value)} disabled={busy} />
        </div>
        <div className="admin-field">
          <label>Pays</label>
          <select className="admin-input" value={country} onChange={(e) => setCountry(e.target.value)} disabled={busy}>
            <option value="">—</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label>Poste</label>
          <select className="admin-input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} disabled={busy}>
            <option value="">—</option>
            {JOB_TITLE_KEYS.map((k) => (
              <option key={k} value={k}>
                {ROLE_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label>Type de compte</label>
          <select
            className="admin-input"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as AccountType)}
            disabled={busy}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACCOUNT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            disabled={busy || isSelf}
          />
          <span>Administrateur{isSelf ? ' (vous — non modifiable)' : ''}</span>
        </label>

        {error ? <p className="admin-modal-error">{error}</p> : null}

        <div className="admin-modal-actions">
          <button type="button" className="button button-light" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button type="button" className="button button-accent" onClick={save} disabled={busy}>
            {busy ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>

        {!isSelf ? (
          <div className="admin-modal-section">
            <span className="admin-modal-section-status">
              {suspended ? 'Compte suspendu — la connexion est bloquée.' : 'Compte actif.'}
            </span>
            <button
              type="button"
              className={suspended ? 'admin-link-btn' : 'admin-btn-warn-ghost'}
              onClick={toggleSuspend}
              disabled={busy}
            >
              {suspended ? 'Réactiver le compte' : 'Suspendre le compte'}
            </button>
          </div>
        ) : null}

        {!isSelf ? (
          <div className="admin-modal-danger">
            {confirmDelete ? (
              <>
                <span>Supprimer définitivement ce compte ?</span>
                <div className="admin-modal-danger-row">
                  <button type="button" className="button button-light" onClick={() => setConfirmDelete(false)} disabled={busy}>
                    Annuler
                  </button>
                  <button type="button" className="admin-btn-danger" onClick={remove} disabled={busy}>
                    {busy ? 'Suppression…' : 'Oui, supprimer'}
                  </button>
                </div>
              </>
            ) : (
              <button type="button" className="admin-btn-danger-ghost" onClick={() => setConfirmDelete(true)} disabled={busy}>
                Supprimer ce compte
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OrgRow({
  client,
  resellers,
  canManage,
}: {
  client: AdminOrg;
  resellers: { id: string; name: string }[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (!canManage) {
    const current = resellers.find((r) => r.id === client.resellerOrgId);
    return (
      <tr>
        <td>{client.name}</td>
        <td>{current?.name ?? '— Aucun —'}</td>
      </tr>
    );
  }
  return (
    <tr>
      <td>{client.name}</td>
      <td>
        <select
          className="admin-org-select"
          value={client.resellerOrgId ?? ''}
          disabled={busy}
          onChange={async (e) => {
            setBusy(true);
            try {
              const res = await fetch('/api/admin/orgs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientOrgId: client.id, resellerOrgId: e.target.value || null }),
              });
              if (res.ok) router.refresh();
            } catch {
              /* ignore */
            }
            setBusy(false);
          }}
        >
          <option value="">— Aucun —</option>
          {resellers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}

export function AdminDashboard({
  overview,
  orgs,
  selfId,
  canManage,
}: {
  overview: AdminOverview;
  orgs: { clients: AdminOrg[]; resellers: { id: string; name: string }[] };
  selfId: string;
  canManage: boolean;
}) {
  const { users, courses, consoleValidations, totals } = overview;
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [cvFilter, setCvFilter] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.email, u.company, u.country, u.jobTitle].some((f) => (f ?? '').toLowerCase().includes(q))
    );
  }, [users, query]);

  const filteredCv = useMemo(
    () => (cvFilter ? consoleValidations.filter((c) => c.status === cvFilter) : consoleValidations),
    [consoleValidations, cvFilter]
  );

  const downloadCsv = () => {
    const blob = new Blob(['﻿' + toCsv(users)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rutherford-academy-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="page-shell" id="top">
      <SiteNav />

      <section className="admin-section section">
        <div className="container">
          <header className="admin-head">
            <div>
              <p className="section-kicker">Admin · Rutherford Academy</p>
              <h1 className="admin-title">
                Tableau de bord{!canManage ? <span className="admin-badge">Lecture seule</span> : null}
              </h1>
            </div>
            <button type="button" className="button button-light" onClick={downloadCsv}>
              Exporter en CSV
            </button>
          </header>

          <ul className="admin-totals">
            <li className="admin-total">
              <span className="admin-total-value">{totals.users}</span>
              <span className="admin-total-label">Comptes</span>
            </li>
            <li className="admin-total">
              <span className="admin-total-value">{totals.onboarded}</span>
              <span className="admin-total-label">Onboardés (leads)</span>
            </li>
            <li className="admin-total">
              <span className="admin-total-value">{totals.consoleOpen}</span>
              <span className="admin-total-label">Validations ouvertes</span>
            </li>
            <li className="admin-total">
              <span className="admin-total-value">{totals.certificates}</span>
              <span className="admin-total-label">Certificats délivrés</span>
            </li>
            <li className="admin-total">
              <span className="admin-total-value">{totals.activePass}</span>
              <span className="admin-total-label">Academy Pass actifs</span>
            </li>
          </ul>

          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Utilisateurs ({filtered.length})</h2>
              <input
                type="search"
                className="admin-search"
                placeholder="Rechercher (nom, e-mail, société…)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>E-mail</th>
                    <th>Société</th>
                    <th>Pays</th>
                    <th>Poste</th>
                    <th>Type</th>
                    <th>Inscrit</th>
                    <th>Dern. activité</th>
                    <th className="admin-num">Modules</th>
                    <th className="admin-num">Cours</th>
                    <th className="admin-num">Certif.</th>
                    <th className="admin-num">Niv.</th>
                    <th>Accès</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id}>
                      <td>
                        {u.name ?? '—'}
                        {u.isAdmin ? <span className="admin-badge">admin</span> : null}
                        {u.suspended ? <span className="admin-badge admin-badge-warn">suspendu</span> : null}
                      </td>
                      <td className="admin-email">{u.email}</td>
                      <td>{u.company ?? '—'}</td>
                      <td>{u.country ?? '—'}</td>
                      <td>{u.jobTitle ? ROLE_LABELS[u.jobTitle as JobTitleKey] ?? u.jobTitle : '—'}</td>
                      <td>
                        <AccountTypeBadge type={u.accountType} />
                      </td>
                      <td>{fmtDate(u.signupAt)}</td>
                      <td>{fmtDate(u.lastActiveAt)}</td>
                      <td className="admin-num">{u.modulesCompleted}</td>
                      <td className="admin-num">{u.coursesCompleted}</td>
                      <td className="admin-num">{u.certificates}</td>
                      <td className="admin-num">{u.level}</td>
                      <td>
                        {u.activePass ? 'Pass' : u.purchases > 0 ? `${u.purchases} achat(s)` : u.onboarded ? 'Gratuit' : '—'}
                      </td>
                      <td>
                        {canManage ? (
                          <button type="button" className="admin-link-btn" onClick={() => setEditing(u)}>
                            Gérer
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="admin-empty">
                        Aucun utilisateur.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Console validations ({filteredCv.length})</h2>
              <select
                className="admin-search"
                value={cvFilter}
                onChange={(e) => setCvFilter(e.target.value)}
                aria-label="Filtrer par statut"
              >
                <option value="">Tous les statuts</option>
                {Object.keys(CV_STATUS_LABELS).map((s) => (
                  <option key={s} value={s}>
                    {CV_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Société</th>
                    <th>Pays</th>
                    <th>Presse</th>
                    <th>Statut</th>
                    <th>Réf</th>
                    <th>E-mail</th>
                    <th>Compte</th>
                    <th>Validé par</th>
                    <th>Liens</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCv.map((c) => (
                    <tr key={c.id}>
                      <td>{fmtDate(c.createdAt)}</td>
                      <td>{c.company ?? '—'}</td>
                      <td>{c.country ?? '—'}</td>
                      <td>{c.machine ?? '—'}</td>
                      <td>
                        <span className={`admin-status admin-status-${CV_STATUS_TONE[c.status] ?? 'review'}`}>
                          {CV_STATUS_LABELS[c.status] ?? c.status}
                        </span>
                      </td>
                      <td>{c.pipedriveDealId ? `ID ${c.pipedriveDealId}` : '—'}</td>
                      <td className="admin-email">{c.email}</td>
                      <td className="admin-email">{c.userEmail ?? '—'}</td>
                      <td>{c.reviewedBy ?? '—'}</td>
                      <td className="admin-cv-links">
                        {c.asanaUrl ? (
                          <a href={c.asanaUrl} target="_blank" rel="noreferrer">
                            Asana
                          </a>
                        ) : null}
                        {c.pipedriveUrl ? (
                          <a href={c.pipedriveUrl} target="_blank" rel="noreferrer">
                            Pipedrive
                          </a>
                        ) : null}
                        {!c.asanaUrl && !c.pipedriveUrl ? '—' : null}
                      </td>
                    </tr>
                  ))}
                  {filteredCv.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="admin-empty">
                        Aucune demande.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Attribution clients ({orgs.clients.length})</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Revendeur</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.clients.map((c) => (
                    <OrgRow key={c.id} client={c} resellers={orgs.resellers} canManage={canManage} />
                  ))}
                  {orgs.clients.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="admin-empty">
                        Aucune organisation cliente.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Par cours</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cours</th>
                    <th>Type</th>
                    <th className="admin-num">Apprenants</th>
                    <th className="admin-num">Certifiés</th>
                    <th className="admin-num">Score moyen QCM</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.slug}>
                      <td>{c.title}</td>
                      <td>{c.tone === 'premium' ? 'Premium' : 'Gratuit'}</td>
                      <td className="admin-num">{c.learners}</td>
                      <td className="admin-num">{c.certified}</td>
                      <td className="admin-num">{c.avgQuizPct != null ? `${c.avgQuizPct}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {editing ? <UserDrawer user={editing} isSelf={editing.id === selfId} onClose={() => setEditing(null)} /> : null}

      <SiteFooter />
    </main>
  );
}
