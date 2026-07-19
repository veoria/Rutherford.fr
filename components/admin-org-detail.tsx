'use client';

// Vraie page organisation du back-office (brief § 4.2.3) — lecture seule :
// l'édition reste dans le tiroir « Gérer » de l'onglet Organisations. Calquée
// sur admin-user-detail.tsx (en-tête, grille de faits, tables, lien retour).

import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import type { AdminOrgDetail as Detail } from '@/lib/admin';
import type { AuditEntry } from '@/lib/admin-audit';

// L'admin est en français uniquement. Sur cette page le badge dit « Client »
// (une organisation, pas un « client direct » — le canal se lit dans
// l'attribution affichée à côté).
const ORG_TYPE_LABELS: Record<string, string> = {
  client: 'Client',
  reseller: 'Revendeur',
  distributor: 'Distributeur',
  team: 'Équipe',
};

const MEMBER_ROLE_LABELS: Record<string, string> = {
  owner: 'Propriétaire',
  admin: 'Admin',
  member: 'Membre',
};

const MEMBER_STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  invited: 'Invité',
};

const LICENSE_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  trial: 'Essai',
  expired: 'Expirée',
  suspended: 'Suspendue',
};

const LICENSE_STATUS_TONE: Record<string, string> = {
  active: 'green',
  trial: 'review',
  expired: 'red',
  suspended: 'action',
};

function fmtDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

// Date + heure locale FR pour le journal d'audit (brief § 4.2.6).
function fmtDateTime(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

// Monogramme de repli quand l'org n'a pas de logo (même logique d'initiales
// que les avatars de la page Équipe).
function orgInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return ((parts[0][0] ?? '') + (parts[1][0] ?? '')).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || '?';
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-fact">
      <span className="admin-fact-label">{label}</span>
      <span className="admin-fact-value">{value}</span>
    </div>
  );
}

export function AdminOrgDetail({ org, auditLog }: { org: Detail; auditLog: AuditEntry[] }) {
  const isClient = org.type === 'client';
  const isPartner = org.type === 'reseller' || org.type === 'distributor';

  const cityLine =
    [org.address, [org.postalCode, org.city].filter(Boolean).join(' ')].filter(Boolean).join(', ') ||
    org.city ||
    '—';

  return (
    <main className="page-shell" id="top">
      <SiteNav />

      <section className="admin-section section">
        <div className="container">
          <a className="admin-back-link" href="/admin?tab=orgs">
            <span aria-hidden="true">←</span> Admin
          </a>

          <header className="admin-detail-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {org.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={org.logoUrl} alt="" className="admin-logo-preview" />
              ) : (
                <span className="team-avatar" style={{ background: '#3f4a57' }} aria-hidden="true">
                  {orgInitials(org.name)}
                </span>
              )}
              <h1 className="admin-title">{org.name}</h1>
            </div>
            <p className="admin-detail-sub">
              <span className={`account-type-badge account-type-${org.type}`}>
                {ORG_TYPE_LABELS[org.type] ?? org.type}
              </span>
              {/* Attribution de canal : revendeur gestionnaire / réseau distributeur
                  (liens croisés vers leurs pages, brief § 4.2.4). */}
              {org.resellerOrgId ? (
                <span>
                  via{' '}
                  <a className="admin-name-link" href={`/admin/orgs/${org.resellerOrgId}`}>
                    {org.resellerName ?? 'revendeur'}
                  </a>
                </span>
              ) : null}
              {org.distributorOrgId ? (
                <span>
                  réseau{' '}
                  <a className="admin-name-link" href={`/admin/orgs/${org.distributorOrgId}`}>
                    {org.distributorName ?? 'distributeur'}
                  </a>
                </span>
              ) : null}
            </p>
          </header>

          <div className="admin-detail-grid">
            <Fact label="Pays" value={org.country ?? '—'} />
            <Fact label="Ville / adresse" value={cityLine} />
            <Fact label="ID Pipedrive" value={org.pipedriveOrgId != null ? String(org.pipedriveOrgId) : '—'} />
            <Fact label="Membres" value={String(org.members.length)} />
            <Fact label="Systèmes" value={String(org.systems.length)} />
            <Fact label="Créée" value={fmtDate(org.createdAt)} />
          </div>

          {/* Page en lecture seule : l'édition passe par le tiroir existant. */}
          <p className="admin-modal-section-status">
            Modification : via l&apos;onglet{' '}
            <a className="admin-name-link" href="/admin?tab=orgs">
              Organisations
            </a>
            .
          </p>

          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Membres ({org.members.length})</h2>
            </div>
            {org.members.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>E-mail</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {org.members.map((m) => (
                      <tr key={m.userId}>
                        <td>
                          {/* Lien croisé vers la fiche du membre (brief § 4.2.4). */}
                          <a className="admin-name-link" href={`/admin/users/${m.userId}`}>
                            {m.name || m.email || '—'}
                          </a>
                        </td>
                        <td className="admin-email">{m.email || '—'}</td>
                        <td>{MEMBER_ROLE_LABELS[m.role] ?? m.role}</td>
                        <td>{MEMBER_STATUS_LABELS[m.status] ?? m.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-modal-section-status">Aucun membre.</p>
            )}
          </div>

          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Invitations en attente ({org.pendingInvites.length})</h2>
            </div>
            {org.pendingInvites.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>E-mail</th>
                      <th>Rôle</th>
                      <th>Envoyée le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {org.pendingInvites.map((i) => (
                      <tr key={i.id}>
                        <td className="admin-email">{i.email}</td>
                        <td>{MEMBER_ROLE_LABELS[i.role] ?? i.role}</td>
                        <td>{fmtDate(i.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-modal-section-status">Aucune invitation en attente.</p>
            )}
          </div>

          {/* Usines et systèmes sous licence sont des concepts CLIENT (brief
              § 2.2.d) : jamais affichés pour une org revendeur/distributeur/équipe. */}
          {isClient ? (
            <div className="admin-block">
              <div className="admin-block-head">
                <h2>Usines ({org.sites.length})</h2>
              </div>
              {org.sites.length ? (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Ville</th>
                        <th>Pays</th>
                        <th>N° AnyDesk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {org.sites.map((s) => (
                        <tr key={s.id}>
                          <td>{s.name}</td>
                          <td>{[s.city, s.postalCode].filter(Boolean).join(' · ') || '—'}</td>
                          <td>{s.country ?? '—'}</td>
                          <td>{s.anydeskId ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-modal-section-status">Aucune usine déclarée.</p>
              )}
            </div>
          ) : null}

          {isClient ? (
            <div className="admin-block">
              <div className="admin-block-head">
                <h2>Systèmes &amp; licences ({org.systems.length})</h2>
              </div>
              {org.systems.length ? (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Presse / machine</th>
                        <th>Usine</th>
                        <th>Licence</th>
                        <th>Statut</th>
                        <th>Vendu par</th>
                      </tr>
                    </thead>
                    <tbody>
                      {org.systems.map((s) => (
                        <tr key={s.id}>
                          <td>{s.product}</td>
                          <td>{s.machine ?? '—'}</td>
                          <td>{s.siteName ?? '—'}</td>
                          <td>{s.licenseKey ?? '—'}</td>
                          <td>
                            <span
                              className={`admin-status admin-status-${LICENSE_STATUS_TONE[s.licenseStatus] ?? 'review'}`}
                            >
                              {LICENSE_STATUS_LABELS[s.licenseStatus] ?? s.licenseStatus}
                            </span>
                            {s.licenseExpiresAt ? (
                              <span className="admin-cv-sub">exp. {fmtDate(s.licenseExpiresAt)}</span>
                            ) : null}
                          </td>
                          {/* Attribution par presse (§ 2.6.2) : null = vente directe. */}
                          <td>{s.soldByOrgName ?? 'Vente directe'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-modal-section-status">Aucun système installé.</p>
              )}
            </div>
          ) : null}

          {/* Vue « parc » d'un partenaire : les organisations attribuées à ce
              revendeur (reseller_org_id) ou à ce distributeur (distributor_org_id). */}
          {isPartner ? (
            <div className="admin-block">
              <div className="admin-block-head">
                <h2>Clients attribués ({org.attributedOrgs.length})</h2>
              </div>
              {org.attributedOrgs.length ? (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Société</th>
                        <th>Type</th>
                        <th className="admin-num">Membres</th>
                        <th className="admin-num">Systèmes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {org.attributedOrgs.map((a) => (
                        <tr key={a.id}>
                          <td>
                            <a className="admin-name-link" href={`/admin/orgs/${a.id}`}>
                              {a.name}
                            </a>
                          </td>
                          <td>
                            <span className={`account-type-badge account-type-${a.type}`}>
                              {ORG_TYPE_LABELS[a.type] ?? a.type}
                            </span>
                          </td>
                          <td className="admin-num">{a.memberCount}</td>
                          <td className="admin-num">{a.systemsCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="admin-modal-section-status">Aucune organisation attribuée.</p>
              )}
            </div>
          ) : null}

          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Journal ({auditLog.length})</h2>
            </div>
            {auditLog.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date / heure</th>
                      <th>Acteur</th>
                      <th>Résumé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map((e) => (
                      <tr key={e.id}>
                        <td>{fmtDateTime(e.createdAt)}</td>
                        <td className="admin-email">{e.actorEmail ?? e.actorId ?? '—'}</td>
                        <td>{e.summary ?? e.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-modal-section-status">Aucune action enregistrée pour cette organisation.</p>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
