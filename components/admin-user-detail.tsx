'use client';

import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import type { AdminUserDetail as Detail } from '@/lib/admin';
import type { AccountType } from '@/data/account-types';

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

export function AdminUserDetail({ user }: { user: Detail }) {
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
          </header>

          <div className="admin-detail-grid">
            <Fact label="Société" value={user.company ?? '—'} />
            <Fact label="Pays" value={user.country ?? '—'} />
            <Fact label="Poste" value={user.jobTitle ?? '—'} />
            <Fact
              label="Organisation"
              value={user.org ? `${user.org.name}${user.org.role ? ` · ${user.org.role}` : ''}` : '—'}
            />
            <Fact label="Inscrit" value={fmtDate(user.signupAt)} />
            <Fact label="Dernière connexion" value={fmtDate(user.lastSignInAt)} />
            <Fact label="E-mail de notification" value={user.notificationEmail ?? '—'} />
            <Fact label="Accès" value={access} />
          </div>

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
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
