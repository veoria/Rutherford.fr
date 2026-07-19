'use client';

// Fiche organisation du back-office (brief § 4.2.3) — désormais l'unique surface
// pour CONSULTER et MODIFIER une organisation (décision du 19/07/2026 : l'édition
// quitte le tiroir « Gérer » pour la page /admin/orgs/[id]). Calquée sur
// admin-user-detail.tsx (en-tête, grille de faits, tuiles de métriques, tables,
// lien retour) ; les widgets d'édition sont dans components/admin-org-editors.tsx.

import { useEffect, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import type { AdminOrgDetail as Detail } from '@/lib/admin';
import type { AuditEntry } from '@/lib/admin-audit';
import {
  OrgIdentityEditor,
  OrgMembersEditor,
  OrgSitesEditor,
  OrgSystemsEditor,
  type OrgOption,
  type OrgSite,
} from '@/components/admin-org-editors';

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

// Libellé du bouton d'aperçu selon le type d'org (owner ask 19/07/2026).
const PREVIEW_LABELS: Record<string, string> = {
  reseller: 'Voir l’espace du revendeur',
  distributor: 'Voir l’espace du distributeur',
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

// Barre fine de l'entonnoir de statuts (brief § 4.2 — retours du 19/07/2026).
// Couleurs alignées sur la palette admin-status (review / action / green / red).
const FUNNEL_FILL: Record<string, string> = {
  review: '#2433c9',
  action: '#b06a12',
  green: '#1f8a4c',
  red: '#c4332b',
};
function FunnelBar({ label, count, tone, max }: { label: string; count: number; tone: string; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <span style={{ flex: '0 0 130px', fontSize: '0.86rem', color: '#1d1d1f' }}>{label}</span>
      <span
        style={{
          flex: 1,
          height: 10,
          borderRadius: 999,
          background: 'rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <span
          style={{
            display: 'block',
            height: '100%',
            width: `${pct}%`,
            minWidth: count > 0 ? 6 : 0,
            borderRadius: 999,
            background: FUNNEL_FILL[tone] ?? '#8a8a8a',
          }}
        />
      </span>
      <span
        className="admin-num"
        style={{ flex: '0 0 40px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}
      >
        {count}
      </span>
    </div>
  );
}

export function AdminOrgDetail({
  org,
  auditLog,
  orgOptions = [],
  canManage = true,
}: {
  org: Detail;
  auditLog: AuditEntry[];
  orgOptions?: OrgOption[];
  canManage?: boolean;
}) {
  const isClient = org.type === 'client';
  const isPartner = org.type === 'reseller' || org.type === 'distributor';
  // Périmètre des métriques : propre à un client, « eux + clients » pour un
  // partenaire — on l'explicite dans les libellés des tuiles.
  const scopeSuffix = isPartner ? ' (eux + clients)' : '';

  const m = org.metrics;

  // Usines partagées (client orgs) : le sélecteur d'usine des systèmes et la
  // restriction d'accès par membre en dépendent. Rechargées après chaque
  // mutation d'usine via refreshSites (et router.refresh côté éditeur).
  const [sites, setSites] = useState<OrgSite[]>([]);
  const refreshSites = async () => {
    if (org.type !== 'client') return;
    try {
      const res = await fetch(`/api/admin/orgs/sites?orgId=${encodeURIComponent(org.id)}`);
      if (res.ok) {
        const d = (await res.json()) as { sites?: OrgSite[] };
        setSites(d.sites ?? []);
      }
    } catch {
      /* ignore */
    }
  };
  useEffect(() => {
    void refreshSites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org.id]);

  const cityLine =
    [org.address, [org.postalCode, org.city].filter(Boolean).join(' ')].filter(Boolean).join(', ') ||
    org.city ||
    '—';

  // Entonnoir de statuts (brief § 4.2) : buckets FR agrégés depuis consoleByStatus.
  const byStatus = new Map(m.consoleByStatus.map((s) => [s.status, s.count] as const));
  const funnel = [
    { label: 'Soumises', tone: 'review', count: byStatus.get('submitted') ?? 0 },
    {
      label: 'En revue',
      tone: 'action',
      count: (byStatus.get('in_review') ?? 0) + (byStatus.get('changes_requested') ?? 0),
    },
    { label: 'Compatibles', tone: 'green', count: byStatus.get('can_be_connected') ?? 0 },
    { label: 'Rejetées', tone: 'red', count: byStatus.get('rejected') ?? 0 },
  ];
  const funnelMax = Math.max(1, ...funnel.map((f) => f.count));

  const previewLabel = PREVIEW_LABELS[org.type] ?? 'Voir l’espace du client';

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
            {/* Aperçu de l'espace du client / revendeur (owner ask 19/07/2026) —
                masqué quand aucun membre exploitable. */}
            {org.previewUserId ? (
              <a
                className="button button-light"
                href={`/admin/users/${org.previewUserId}/preview`}
                style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                👁 {previewLabel}
              </a>
            ) : null}
          </header>

          {/* ── Métriques (brief § 4.2 — retours du 19/07/2026) ── */}
          <ul className="admin-totals">
            <li>
              <div className="admin-total">
                <span className="admin-total-value">{m.consoleTotal}</span>
                <span className="admin-total-label">Validations console{scopeSuffix}</span>
                <span className="admin-total-label" style={{ opacity: 0.7 }}>
                  dont {m.consoleCompatible} compatible(s)
                </span>
              </div>
            </li>
            <li>
              <div className="admin-total">
                <span className="admin-total-value">{m.supportTotal}</span>
                <span className="admin-total-label">Support{scopeSuffix}</span>
              </div>
            </li>
            <li>
              <div className="admin-total">
                <span className="admin-total-value">{m.equippedSystems}</span>
                <span className="admin-total-label">Presses équipées{scopeSuffix}</span>
              </div>
            </li>
            <li>
              <div
                className="admin-total"
                title="Approx. : presses équipées ÷ validations soumises dans le périmètre"
              >
                <span className="admin-total-value">{m.conversionPct != null ? `${m.conversionPct} %` : '—'}</span>
                <span className="admin-total-label">Taux de conversion{scopeSuffix}</span>
                <span className="admin-total-label" style={{ opacity: 0.7 }}>
                  approx. — équipées / soumises
                </span>
              </div>
            </li>
          </ul>

          {/* Licences à échéance — opportunités de renouvellement (accent amber si > 0). */}
          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Licences à échéance{scopeSuffix}</h2>
            </div>
            <ul className="admin-totals">
              <li>
                <div
                  className="admin-total"
                  style={m.licensesExpiringSoon > 0 ? { borderColor: '#e5a100', borderWidth: 2 } : undefined}
                >
                  <span className="admin-total-value">{m.licensesExpiringSoon}</span>
                  <span className="admin-total-label">licence(s) à renouveler sous 90 j</span>
                  {m.licensesExpiringSoon > 0 ? (
                    <span className="ah-sys-pill amber" style={{ marginTop: 6 }}>
                      Opportunité de renouvellement
                    </span>
                  ) : null}
                </div>
              </li>
              <li>
                <div className="admin-total">
                  <span className="admin-total-value" style={{ fontSize: '1.1rem' }}>
                    {fmtDate(m.nextLicenseExpiry)}
                  </span>
                  <span className="admin-total-label">Prochaine échéance</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Entonnoir de statuts des validations console. */}
          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Entonnoir de statuts{scopeSuffix}</h2>
            </div>
            {m.consoleTotal > 0 ? (
              <div style={{ maxWidth: 560 }}>
                {funnel.map((f) => (
                  <FunnelBar key={f.label} label={f.label} count={f.count} tone={f.tone} max={funnelMax} />
                ))}
              </div>
            ) : (
              <p className="admin-modal-section-status">Aucune validation console dans le périmètre.</p>
            )}
          </div>

          {/* Activité récente. */}
          <div className="admin-block">
            <div className="admin-block-head">
              <h2>Activité récente{scopeSuffix}</h2>
            </div>
            <div className="admin-detail-grid">
              <Fact label="Dernière validation" value={fmtDate(m.lastValidationAt)} />
              <Fact label="Dernier install" value={fmtDate(m.lastInstallAt)} />
              <Fact label="Dernière connexion d’un membre" value={fmtDate(m.lastMemberSignInAt)} />
            </div>
          </div>

          <div className="admin-detail-grid">
            <Fact label="Pays" value={org.country ?? '—'} />
            <Fact label="Ville / adresse" value={cityLine} />
            <Fact label="ID Pipedrive" value={org.pipedriveOrgId != null ? String(org.pipedriveOrgId) : '—'} />
            <Fact label="Membres" value={String(org.members.length)} />
            <Fact label="Systèmes" value={String(org.systems.length)} />
            <Fact label="Créée" value={fmtDate(org.createdAt)} />
          </div>

          {/* ── Édition inline (brief § 4.2 — l'édition vit sur la page) ── */}
          {canManage ? <OrgIdentityEditor org={org} orgOptions={orgOptions} /> : null}

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
                    {org.members.map((m2) => (
                      <tr key={m2.userId}>
                        <td>
                          {/* Lien croisé vers la fiche du membre (brief § 4.2.4). */}
                          <a className="admin-name-link" href={`/admin/users/${m2.userId}`}>
                            {m2.name || m2.email || '—'}
                          </a>
                        </td>
                        <td className="admin-email">{m2.email || '—'}</td>
                        <td>{MEMBER_ROLE_LABELS[m2.role] ?? m2.role}</td>
                        <td>{MEMBER_STATUS_LABELS[m2.status] ?? m2.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="admin-modal-section-status">Aucun membre.</p>
            )}
            {/* Édition des membres : rôle, retrait, invitation, accès usines. */}
            {canManage ? (
              <OrgMembersEditor orgId={org.id} members={org.members} pending={org.pendingInvites} sites={sites} />
            ) : null}
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
              {canManage ? <OrgSitesEditor orgId={org.id} sites={sites} onChange={refreshSites} /> : null}
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
              {canManage ? <OrgSystemsEditor orgId={org.id} sites={sites} /> : null}
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
