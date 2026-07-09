'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import type { AdminUserDetail as Detail } from '@/lib/admin';
import { COUNTRIES, JOB_TITLE_KEYS, isJobTitleKey, type JobTitleKey } from '@/data/onboarding-options';
import { ACCOUNT_TYPES, type AccountType } from '@/data/account-types';

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

export type OrgOption = { id: string; name: string; type: string };

const orgTypeLabel = (type: string) =>
  ACCOUNT_TYPE_LABELS[type as AccountType] ?? type;

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

const SUPPORT_STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  in_progress: 'En cours',
  waiting_customer: 'Attente client',
  resolved: 'Résolu',
  closed: 'Fermé',
};

const SUPPORT_STATUS_TONE: Record<string, string> = {
  new: 'review',
  in_progress: 'review',
  waiting_customer: 'action',
  resolved: 'green',
  closed: 'green',
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-fact">
      <span className="admin-fact-label">{label}</span>
      <span className="admin-fact-value">{value}</span>
    </div>
  );
}

function ManagePanel({ user, orgs, isSelf }: { user: Detail; orgs: OrgOption[]; isSelf: boolean }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.name ?? '');
  const [company, setCompany] = useState(user.company ?? '');
  const [country, setCountry] = useState(user.country ?? '');
  const [jobTitle, setJobTitle] = useState(isJobTitleKey(user.jobTitle ?? '') ? (user.jobTitle as string) : '');
  const [accountType, setAccountType] = useState<AccountType>(user.accountType);
  const [orgId, setOrgId] = useState(user.org?.id ?? '');
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [suspended, setSuspended] = useState(user.suspended);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
          // Only sent when changed — moving orgs also moves the membership.
          ...(orgId !== (user.org?.id ?? '') ? { organization_id: orgId || null } : {}),
        }),
      });
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        setBusy(false);
        return;
      }
      router.refresh();
      setBusy(false);
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
      router.push('/admin');
    } catch {
      setError('Erreur réseau.');
      setBusy(false);
    }
  };

  return (
    <div className="admin-block admin-detail-manage">
      <div className="admin-block-head">
        <h2>Gérer le compte</h2>
      </div>

      <div className="admin-field">
        <label>Nom</label>
        <input className="admin-input" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={busy} />
      </div>
      <div className="admin-field">
        <label>Société</label>
        <input className="admin-input" value={company} onChange={(e) => setCompany(e.target.value)} disabled={busy} />
      </div>
      <div className="admin-field-row">
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
      <div className="admin-field">
        <label>Organisation</label>
        <select className="admin-input" value={orgId} onChange={(e) => setOrgId(e.target.value)} disabled={busy}>
          <option value="">— Aucune —</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} · {orgTypeLabel(o.type)}
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
  );
}

export function AdminUserDetail({
  user,
  orgs,
  canManage,
  isSelf,
}: {
  user: Detail;
  orgs: OrgOption[];
  canManage: boolean;
  isSelf: boolean;
}) {
  const access = user.activePass
    ? 'Academy Pass'
    : user.purchases > 0
      ? `${user.purchases} achat(s)`
      : user.onboarded
        ? 'Gratuit'
        : '—';

  return (
    <main className="page-shell" id="top">
      <SiteNav />

      <section className="admin-section section">
        <div className="container">
          <a className="admin-back-link" href="/admin">
            <span aria-hidden="true">←</span> Retour au tableau de bord
          </a>

          <header className="admin-detail-head">
            <h1 className="admin-title">{user.name || user.email}</h1>
            <p className="admin-detail-sub">
              <span className="admin-email">{user.email}</span>
              <span className={`account-type-badge account-type-${user.accountType}`}>
                {ACCOUNT_TYPE_LABELS[user.accountType]}
              </span>
              {user.isAdmin ? <span className="admin-badge">admin</span> : null}
              {user.suspended ? <span className="admin-badge admin-badge-warn">suspendu</span> : null}
            </p>
            {user.accountType === 'client' ? (
              <a
                className="button button-light"
                href={`/admin/users/${user.id}/preview`}
                style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                👁 Voir l’espace client
              </a>
            ) : null}
          </header>

          <div className="admin-detail-grid">
            <Fact label="Société" value={user.company ?? '—'} />
            <Fact label="Pays" value={user.country ?? '—'} />
            <Fact label="Poste" value={user.jobTitle && isJobTitleKey(user.jobTitle) ? ROLE_LABELS[user.jobTitle] : '—'} />
            <div className="admin-fact">
              <span className="admin-fact-label">Organisation</span>
              <span className="admin-fact-value">
                {user.org ? (
                  <span className="admin-org-inline">
                    {user.org.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.org.logoUrl} alt="" className="admin-company-logo" />
                    ) : null}
                    {user.org.name}
                    {user.org.role ? ` · ${user.org.role}` : ''}
                  </span>
                ) : (
                  '—'
                )}
              </span>
            </div>
            <Fact label="Inscrit" value={fmtDate(user.signupAt)} />
            <Fact label="Dernière connexion" value={fmtDate(user.lastSignInAt)} />
            <Fact label="E-mail de notification" value={user.notificationEmail ?? '—'} />
            <Fact label="Accès" value={access} />
          </div>

          {canManage ? (
            <ManagePanel user={user} orgs={orgs} isSelf={isSelf} />
          ) : (
            <p className="admin-modal-section-status">Lecture seule — la gestion des comptes est réservée aux admins.</p>
          )}

          <div className="admin-block">
            <div className="admin-block-head">
              <h2>
                Academy — niveau {user.level} · {user.coursesCompleted} cours · {user.certificates} certif.
              </h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cours</th>
                    <th>Type</th>
                    <th className="admin-num">Modules</th>
                    <th className="admin-num">QCM</th>
                    <th>Certifié</th>
                  </tr>
                </thead>
                <tbody>
                  {user.courses.map((c) => (
                    <tr key={c.slug}>
                      <td>{c.title}</td>
                      <td>{c.tone === 'premium' ? 'Premium' : 'Gratuit'}</td>
                      <td className="admin-num">
                        {c.modulesDone}/{c.modulesTotal}
                      </td>
                      <td className="admin-num">{c.bestQuizPct != null ? `${c.bestQuizPct}%` : '—'}</td>
                      <td>{c.certified ? 'Oui' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Validations console ({user.validations.length})</h2>
            </div>
            {user.validations.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Société</th>
                      <th>Presse</th>
                      <th>Statut</th>
                      <th>Réf</th>
                      <th>Assigné</th>
                      <th>Validé par</th>
                      <th>Liens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.validations.map((c) => (
                      <tr key={c.id}>
                        <td>{fmtDate(c.createdAt)}</td>
                        <td>{c.company ?? '—'}</td>
                        <td>{c.machine ?? '—'}</td>
                        <td>
                          <span className={`admin-status admin-status-${CV_STATUS_TONE[c.status] ?? 'review'}`}>
                            {CV_STATUS_LABELS[c.status] ?? c.status}
                          </span>
                        </td>
                        <td>{c.pipedriveDealId ? `ID ${c.pipedriveDealId}` : '—'}</td>
                        <td>{c.assignee ?? '—'}</td>
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
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-modal-section-status">Aucune validation console pour ce compte.</p>
            )}
          </div>

          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Support ({user.supportTickets.length})</h2>
            </div>
            {user.supportTickets.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Assigné</th>
                      <th>Lien</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.supportTickets.map((t) => (
                      <tr key={t.id}>
                        <td>{fmtDate(t.createdAt)}</td>
                        <td>
                          <span className={`admin-status admin-status-${SUPPORT_STATUS_TONE[t.status] ?? 'review'}`}>
                            {SUPPORT_STATUS_LABELS[t.status] ?? t.status}
                          </span>
                        </td>
                        <td>{t.assignee ?? '—'}</td>
                        <td className="admin-cv-links">
                          {t.asanaUrl ? (
                            <a href={t.asanaUrl} target="_blank" rel="noreferrer">
                              Asana
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-modal-section-status">Aucun ticket de support pour ce compte.</p>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
