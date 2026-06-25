'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { COUNTRIES, JOB_TITLE_KEYS, isJobTitleKey, type JobTitleKey } from '@/data/onboarding-options';
import { ACCOUNT_TYPES, type AccountType } from '@/data/account-types';
import type { AdminConsoleValidation, AdminOverview, AdminUser } from '@/lib/admin';
import type { AdminOrg, AdminOrgFull, MemberRole, OrgMember, PendingInvite } from '@/lib/organizations';

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

const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'Propriétaire',
  admin: 'Admin',
  member: 'Membre',
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

type AdminTab = 'overview' | 'accounts' | 'validations' | 'orgs' | 'courses';
type AccountSortKey = 'name' | 'company' | 'country' | 'signup' | 'activity' | 'level';

// A saved view = a named snapshot of the accounts filter/sort, kept in
// localStorage so each admin builds their own (no backend needed).
type SavedView = {
  name: string;
  segment: string;
  countryFilter: string;
  activityFilter: string;
  query: string;
  sortKey: AccountSortKey;
  sortDir: 'asc' | 'desc';
};
const SAVED_VIEWS_KEY = 'rf-admin-saved-views';

const ACCOUNT_ACTIVE_DAYS = 30;

function withinDays(iso: string | null, days: number): boolean {
  if (!iso) return false;
  const ts = new Date(iso).getTime();
  return Number.isFinite(ts) && Date.now() - ts <= days * 86400000;
}

const isAccountActive = (u: AdminUser): boolean => withinDays(u.lastActiveAt, ACCOUNT_ACTIVE_DAYS);

// One-click segments for the accounts view: the four account types plus the two
// status flags worth isolating. Counts are shown on each chip.
const ACCOUNT_SEGMENTS: { key: string; label: string; match: (u: AdminUser) => boolean }[] = [
  { key: 'all', label: 'Tous', match: () => true },
  { key: 'client', label: 'Clients', match: (u) => u.accountType === 'client' },
  { key: 'reseller', label: 'Revendeurs', match: (u) => u.accountType === 'reseller' },
  { key: 'distributor', label: 'Distributeurs', match: (u) => u.accountType === 'distributor' },
  { key: 'team', label: 'Équipe', match: (u) => u.accountType === 'team' },
  { key: 'admin', label: 'Admins', match: (u) => u.isAdmin },
  { key: 'suspended', label: 'Suspendus', match: (u) => u.suspended },
];

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
                body: JSON.stringify({ id: client.id, reseller_org_id: e.target.value || null }),
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

function OrgDrawer({ org, allOrgs, onClose }: { org: AdminOrgFull | null; allOrgs: AdminOrgFull[]; onClose: () => void }) {
  const router = useRouter();
  const isNew = !org;
  const [name, setName] = useState(org?.name ?? '');
  const [type, setType] = useState<AccountType>((org?.type as AccountType) ?? 'client');
  const [country, setCountry] = useState(org?.country ?? '');
  const [address, setAddress] = useState(org?.address ?? '');
  const [postalCode, setPostalCode] = useState(org?.postalCode ?? '');
  const [city, setCity] = useState(org?.city ?? '');
  const [resellerOrgId, setResellerOrgId] = useState(org?.resellerOrgId ?? '');
  const [distributorOrgId, setDistributorOrgId] = useState(org?.distributorOrgId ?? '');
  const [logoUrl, setLogoUrl] = useState<string | null>(org?.logoUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [pending, setPending] = useState<PendingInvite[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');

  const resellerOptions = allOrgs.filter((o) => o.type === 'reseller' && o.id !== org?.id);
  const distributorOptions = allOrgs.filter((o) => o.type === 'distributor' && o.id !== org?.id);

  const save = async () => {
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    setBusy(true);
    setError(null);
    const fields = {
      name: name.trim(),
      type,
      country,
      address,
      postal_code: postalCode,
      city,
      reseller_org_id: type === 'client' ? resellerOrgId || null : null,
      distributor_org_id: type === 'reseller' ? distributorOrgId || null : null,
    };
    try {
      const res = await fetch('/api/admin/orgs', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? fields : { id: org!.id, ...fields }),
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

  const uploadLogo = async (file: File) => {
    if (!org) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('orgId', org.id);
      const res = await fetch('/api/admin/orgs/logo', { method: 'POST', body: fd });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) {
        setError(errorLabel(data.error));
        setBusy(false);
        return;
      }
      setLogoUrl(data.url ?? null);
      router.refresh();
      setBusy(false);
    } catch {
      setError('Erreur réseau.');
      setBusy(false);
    }
  };

  const refreshMembers = async () => {
    if (!org) return;
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/admin/orgs/members?orgId=${encodeURIComponent(org.id)}`);
      if (res.ok) {
        const d = (await res.json()) as { members?: OrgMember[]; pending?: PendingInvite[] };
        setMembers(d.members ?? []);
        setPending(d.pending ?? []);
      }
    } catch {
      /* ignore */
    }
    setLoadingMembers(false);
  };

  useEffect(() => {
    void refreshMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org]);

  const changeRole = async (userId: string, role: MemberRole) => {
    if (!org) return;
    await fetch('/api/admin/orgs/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId: org.id, userId, role }),
    });
    void refreshMembers();
    router.refresh();
  };

  const removeMem = async (userId: string) => {
    if (!org) return;
    await fetch(`/api/admin/orgs/members?orgId=${encodeURIComponent(org.id)}&userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    void refreshMembers();
    router.refresh();
  };

  const revokeInvite = async (invitationId: string) => {
    await fetch(`/api/admin/orgs/members?invitationId=${encodeURIComponent(invitationId)}`, { method: 'DELETE' });
    void refreshMembers();
  };

  const sendInvite = async () => {
    if (!org || !inviteEmail.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/orgs/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: org.id, email: inviteEmail.trim(), role: inviteRole }),
      });
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        setBusy(false);
        return;
      }
      setInviteEmail('');
      void refreshMembers();
      setBusy(false);
    } catch {
      setError('Erreur réseau.');
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="admin-modal admin-modal-wide"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="admin-modal-head">
          <h3>{isNew ? 'Nouvelle organisation' : org!.name}</h3>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        <div className="admin-field">
          <label>Nom</label>
          <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} disabled={busy} />
        </div>
        <div className="admin-field">
          <label>Type</label>
          <select
            className="admin-input"
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            disabled={busy}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACCOUNT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        {type === 'client' ? (
          <div className="admin-field">
            <label>Revendeur rattaché</label>
            <select
              className="admin-input"
              value={resellerOrgId}
              onChange={(e) => setResellerOrgId(e.target.value)}
              disabled={busy}
            >
              <option value="">— Aucun —</option>
              {resellerOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {type === 'reseller' ? (
          <div className="admin-field">
            <label>Distributeur rattaché</label>
            <select
              className="admin-input"
              value={distributorOrgId}
              onChange={(e) => setDistributorOrgId(e.target.value)}
              disabled={busy}
            >
              <option value="">— Aucun —</option>
              {distributorOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="admin-field">
          <label>Adresse</label>
          <input className="admin-input" value={address} onChange={(e) => setAddress(e.target.value)} disabled={busy} />
        </div>
        <div className="admin-field-row">
          <div className="admin-field">
            <label>Code postal</label>
            <input
              className="admin-input"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              disabled={busy}
            />
          </div>
          <div className="admin-field">
            <label>Ville</label>
            <input className="admin-input" value={city} onChange={(e) => setCity(e.target.value)} disabled={busy} />
          </div>
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
          <label>Logo</label>
          {isNew ? (
            <p className="admin-modal-section-status">Enregistrez l&apos;organisation pour pouvoir téléverser un logo.</p>
          ) : (
            <div className="admin-logo-edit">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="admin-logo-preview" />
              ) : (
                <span className="admin-logo-empty">Aucun logo</span>
              )}
              <label className="admin-link-btn">
                {busy ? '…' : logoUrl ? 'Remplacer' : 'Téléverser'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  style={{ display: 'none' }}
                  disabled={busy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadLogo(f);
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          )}
        </div>

        <div className="admin-field">
          <label>Aperçu — en-tête de l&apos;espace revendeur</label>
          {type === 'reseller' ? (
            logoUrl ? (
              <div className="admin-cobrand-preview">
                <div className="ah-cobrand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="ah-cobrand-logo" src={logoUrl} alt={name} />
                  <span className="ah-cobrand-badge">Partenaire officiel Rutherford</span>
                </div>
              </div>
            ) : (
              <p className="admin-modal-section-status">
                Téléversez un logo : il s&apos;affichera en haut de l&apos;espace de ce revendeur, comme le bandeau X-Rite.
              </p>
            )
          ) : type === 'distributor' ? (
            <div className="admin-cobrand-preview">
              <div className="ah-cobrand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="ah-cobrand-logo" src="/images/xrite-logo-black.png" alt="X-Rite PANTONE" />
                <span className="ah-cobrand-badge">Partenaire officiel X-Rite PANTONE</span>
              </div>
            </div>
          ) : (
            <p className="admin-modal-section-status">Pas de bandeau co-marqué pour ce type de compte.</p>
          )}
        </div>

        {!isNew ? (
          <div className="admin-modal-members">
            <h4 className="admin-modal-subhead">Membres{loadingMembers ? ' …' : ` (${members.length})`}</h4>
            {!loadingMembers && members.length === 0 ? (
              <p className="admin-modal-section-status">Aucun membre.</p>
            ) : null}
            {members.map((m) => (
              <div className="admin-mem-row" key={m.userId}>
                <span className="admin-mem-main">
                  <span className="admin-mem-name">{m.name || m.email || '—'}</span>
                  {m.email ? <span className="admin-mem-email">{m.email}</span> : null}
                </span>
                <span className="ah-member-ctl">
                  <select
                    className="ah-role-select"
                    value={m.role}
                    disabled={busy}
                    onChange={(e) => void changeRole(m.userId, e.target.value as MemberRole)}
                  >
                    <option value="owner">Propriétaire</option>
                    <option value="admin">Admin</option>
                    <option value="member">Membre</option>
                  </select>
                  <button
                    type="button"
                    className="ah-member-remove"
                    disabled={busy}
                    onClick={() => void removeMem(m.userId)}
                    aria-label="Retirer"
                  >
                    ×
                  </button>
                </span>
              </div>
            ))}
            {pending.map((p) => (
              <div className="admin-mem-row" key={p.id}>
                <span className="admin-mem-main">
                  <span className="admin-mem-name">{p.email}</span>
                  <span className="admin-mem-email">
                    Invitation en attente · {MEMBER_ROLE_LABELS[p.role] ?? p.role}
                  </span>
                </span>
                <button type="button" className="ah-revoke" disabled={busy} onClick={() => void revokeInvite(p.id)}>
                  Révoquer
                </button>
              </div>
            ))}
            <div className="ah-invite-form">
              <input
                className="ah-invite-input"
                type="email"
                placeholder="email@société.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={busy}
              />
              <select
                className="ah-role-select"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                disabled={busy}
              >
                <option value="member">Membre</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="button"
                className="ah-invite-send"
                onClick={() => void sendInvite()}
                disabled={busy || !inviteEmail.trim()}
              >
                Inviter
              </button>
            </div>
          </div>
        ) : null}

        {error ? <p className="admin-modal-error">{error}</p> : null}

        <div className="admin-modal-actions">
          <button type="button" className="button button-light" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button type="button" className="button button-accent" onClick={save} disabled={busy}>
            {busy ? 'Enregistrement…' : isNew ? 'Créer' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard({
  overview,
  orgs,
  orgsFull,
  selfId,
  canManage,
}: {
  overview: AdminOverview;
  orgs: { clients: AdminOrg[]; resellers: { id: string; name: string }[] };
  orgsFull: AdminOrgFull[];
  selfId: string;
  canManage: boolean;
}) {
  const { users, courses, consoleValidations, totals } = overview;
  const [tab, setTab] = useState<AdminTab>('overview');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [segment, setSegment] = useState('all');
  const [countryFilter, setCountryFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [sortKey, setSortKey] = useState<AccountSortKey>('signup');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [cvFilter, setCvFilter] = useState('');
  const [cvQuery, setCvQuery] = useState('');
  const [editingOrg, setEditingOrg] = useState<AdminOrgFull | null>(null);
  const [creatingOrg, setCreatingOrg] = useState(false);

  const countryOptions = useMemo(
    () => (Array.from(new Set(users.map((u) => u.country).filter(Boolean))) as string[]).sort(),
    [users]
  );

  // Counts for the segment chips (computed over the full set, not the filtered one).
  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of ACCOUNT_SEGMENTS) counts[s.key] = users.filter(s.match).length;
    return counts;
  }, [users]);

  const filteredAccounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = ACCOUNT_SEGMENTS.find((s) => s.key === segment)?.match ?? (() => true);
    const list = users.filter((u) => {
      if (!match(u)) return false;
      if (countryFilter && u.country !== countryFilter) return false;
      if (activityFilter === 'active' && !isAccountActive(u)) return false;
      if (activityFilter === 'inactive' && (isAccountActive(u) || !u.onboarded)) return false;
      if (
        q &&
        ![u.name, u.email, u.company, u.country, u.jobTitle].some((f) => (f ?? '').toLowerCase().includes(q))
      )
        return false;
      return true;
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    const val = (u: AdminUser): string | number => {
      switch (sortKey) {
        case 'name':
          return (u.name ?? u.email ?? '').toLowerCase();
        case 'company':
          return (u.company ?? '').toLowerCase();
        case 'country':
          return (u.country ?? '').toLowerCase();
        case 'activity':
          return u.lastActiveAt ?? '';
        case 'level':
          return u.level;
        default:
          return u.signupAt ?? '';
      }
    };
    return [...list].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      if (va < vb) return -dir;
      if (va > vb) return dir;
      return 0;
    });
  }, [users, segment, countryFilter, activityFilter, query, sortKey, sortDir]);

  const newThisWeek = useMemo(() => users.filter((u) => withinDays(u.signupAt, 7)).slice(0, 8), [users]);
  const toReengage = useMemo(
    () => users.filter((u) => u.onboarded && !isAccountActive(u)).slice(0, 8),
    [users]
  );

  const toggleSort = (key: AccountSortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' || key === 'company' || key === 'country' ? 'asc' : 'desc');
    }
  };

  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_VIEWS_KEY);
      if (raw) setSavedViews(JSON.parse(raw) as SavedView[]);
    } catch {
      /* ignore */
    }
  }, []);
  const persistViews = (views: SavedView[]) => {
    setSavedViews(views);
    try {
      localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views));
    } catch {
      /* ignore */
    }
  };
  const saveCurrentView = () => {
    const name = window.prompt('Nom de la vue enregistrée ?')?.trim();
    if (!name) return;
    persistViews([
      ...savedViews.filter((v) => v.name !== name),
      { name, segment, countryFilter, activityFilter, query, sortKey, sortDir },
    ]);
  };
  const applyView = (v: SavedView) => {
    setSegment(v.segment);
    setCountryFilter(v.countryFilter);
    setActivityFilter(v.activityFilter);
    setQuery(v.query);
    setSortKey(v.sortKey);
    setSortDir(v.sortDir);
  };

  const filteredCv = useMemo(() => {
    const q = cvQuery.trim().toLowerCase();
    return consoleValidations.filter((c) => {
      if (cvFilter && c.status !== cvFilter) return false;
      if (!q) return true;
      // Match a person across both the submission email and the account email
      // (so requests sent before the account existed — user_id still null — are
      // found too), plus reviewer, company, press and the deal/ref id.
      return [
        c.company,
        c.country,
        c.machine,
        c.email,
        c.userEmail,
        c.reviewedBy,
        c.assignee,
        (c.followers ?? []).join(' '),
        c.refCode,
        c.pipedriveDealId != null ? `id ${c.pipedriveDealId}` : null,
        c.pipedriveDealId != null ? String(c.pipedriveDealId) : null,
      ].some((f) => (f ?? '').toString().toLowerCase().includes(q));
    });
  }, [consoleValidations, cvFilter, cvQuery]);

  const downloadCsv = () => {
    const blob = new Blob(['﻿' + toCsv(filteredAccounts)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rutherford-academy-comptes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const ADMIN_TABS: { key: AdminTab; label: string; count: number | null }[] = [
    { key: 'overview', label: 'Vue d’ensemble', count: null },
    { key: 'accounts', label: 'Comptes', count: totals.users },
    { key: 'validations', label: 'Validations', count: consoleValidations.length },
    { key: 'orgs', label: 'Organisations', count: orgsFull.length },
    { key: 'courses', label: 'Cours', count: courses.length },
  ];

  const sortTh = (key: AccountSortKey, label: string) => (
    <th>
      <button
        type="button"
        className={`admin-sort${sortKey === key ? ' is-active' : ''}`}
        onClick={() => toggleSort(key)}
      >
        {label}
        <span className="admin-sort-arrow" aria-hidden="true">
          {sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
        </span>
      </button>
    </th>
  );

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
            {tab === 'accounts' ? (
              <button type="button" className="button button-light" onClick={downloadCsv}>
                Exporter en CSV ({filteredAccounts.length})
              </button>
            ) : null}
          </header>

          <nav className="admin-subnav" aria-label="Sections du back-office">
            {ADMIN_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`admin-subnav-link${tab === t.key ? ' is-active' : ''}`}
                aria-current={tab === t.key ? 'page' : undefined}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {t.count != null ? <span className="admin-subnav-count">{t.count}</span> : null}
              </button>
            ))}
          </nav>

          {tab === 'overview' ? (
            <>
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

              <div className="admin-overview-grid">
                <div className="admin-block">
                  <div className="admin-block-head">
                    <h2>Nouveaux comptes · 7 j ({newThisWeek.length})</h2>
                  </div>
                  {newThisWeek.length ? (
                    <ul className="admin-mini-list">
                      {newThisWeek.map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            className="admin-mini-row"
                            onClick={() => {
                              setTab('accounts');
                              if (canManage) setEditing(u);
                            }}
                          >
                            <span className="admin-mini-name">{u.name || u.email}</span>
                            <span className="admin-mini-meta">{(u.company ?? '—') + ' · ' + fmtDate(u.signupAt)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="admin-modal-section-status">Aucun nouveau compte cette semaine.</p>
                  )}
                </div>

                <div className="admin-block">
                  <div className="admin-block-head">
                    <h2>À relancer · inactifs 30 j+ ({toReengage.length})</h2>
                  </div>
                  {toReengage.length ? (
                    <ul className="admin-mini-list">
                      {toReengage.map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            className="admin-mini-row"
                            onClick={() => {
                              setTab('accounts');
                              if (canManage) setEditing(u);
                            }}
                          >
                            <span className="admin-mini-name">{u.name || u.email}</span>
                            <span className="admin-mini-meta">{(u.company ?? '—') + ' · vu ' + fmtDate(u.lastActiveAt)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="admin-modal-section-status">Tous les comptes onboardés sont actifs.</p>
                  )}
                </div>
              </div>
            </>
          ) : null}

          {tab === 'accounts' ? (
            <div className="admin-block">
              <div className="admin-block-head">
                <h2>Comptes ({filteredAccounts.length})</h2>
                <div className="admin-block-controls">
                  <input
                    type="search"
                    className="admin-search"
                    placeholder="Rechercher (nom, e-mail, société…)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <select
                    className="admin-search"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    aria-label="Filtrer par pays"
                  >
                    <option value="">Tous les pays</option>
                    {countryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select
                    className="admin-search"
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    aria-label="Filtrer par activité"
                  >
                    <option value="">Toute activité</option>
                    <option value="active">Actifs (30 j)</option>
                    <option value="inactive">Inactifs à relancer</option>
                  </select>
                </div>
              </div>

              <div className="admin-segments">
                {ACCOUNT_SEGMENTS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    className={`admin-chip${segment === s.key ? ' is-active' : ''}`}
                    onClick={() => setSegment(s.key)}
                  >
                    {s.label}
                    <span className="admin-chip-count">{segmentCounts[s.key] ?? 0}</span>
                  </button>
                ))}
              </div>

              <div className="admin-saved-views">
                {savedViews.map((v) => (
                  <span key={v.name} className="admin-saved-view">
                    <button type="button" className="admin-saved-view-apply" onClick={() => applyView(v)}>
                      {v.name}
                    </button>
                    <button
                      type="button"
                      className="admin-saved-view-del"
                      onClick={() => persistViews(savedViews.filter((x) => x.name !== v.name))}
                      aria-label={`Supprimer la vue ${v.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button type="button" className="admin-saved-view-add" onClick={saveCurrentView}>
                  + Enregistrer la vue
                </button>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {sortTh('name', 'Nom')}
                      <th>E-mail</th>
                      {sortTh('company', 'Société')}
                      {sortTh('country', 'Pays')}
                      <th>Type</th>
                      {sortTh('level', 'Academy')}
                      {sortTh('signup', 'Inscrit')}
                      {sortTh('activity', 'Dern. activité')}
                      <th>Accès</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <a className="admin-name-link" href={`/admin/users/${u.id}`}>
                            {u.name || u.email}
                          </a>
                          {u.isAdmin ? <span className="admin-badge">admin</span> : null}
                          {u.suspended ? <span className="admin-badge admin-badge-warn">suspendu</span> : null}
                        </td>
                        <td className="admin-email">{u.email}</td>
                        <td>{u.company ?? '—'}</td>
                        <td>{u.country ?? '—'}</td>
                        <td>
                          <AccountTypeBadge type={u.accountType} />
                        </td>
                        <td>
                          niv {u.level}
                          {u.coursesCompleted || u.certificates ? (
                            <span className="admin-cv-sub">
                              {u.coursesCompleted} cours{u.certificates ? ` · ${u.certificates} certif.` : ''}
                            </span>
                          ) : null}
                        </td>
                        <td>{fmtDate(u.signupAt)}</td>
                        <td>{fmtDate(u.lastActiveAt)}</td>
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
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="admin-empty">
                          Aucun compte pour ce filtre.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {tab === 'validations' ? (
            <div className="admin-block">
              <div className="admin-block-head">
                <h2>Console validations ({filteredCv.length})</h2>
                <div className="admin-block-controls">
                  <input
                    type="search"
                    className="admin-search"
                    placeholder="Rechercher (e-mail, société, presse, validé par, ID…)"
                    value={cvQuery}
                    onChange={(e) => setCvQuery(e.target.value)}
                    aria-label="Rechercher une validation"
                  />
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
                      <th>Assigné</th>
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
                        <td>
                          {c.assignee ?? '—'}
                          {c.followers && c.followers.length ? (
                            <span className="admin-cv-sub">Suivi : {c.followers.join(', ')}</span>
                          ) : null}
                        </td>
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
                        <td colSpan={11} className="admin-empty">
                          Aucune demande.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {tab === 'orgs' ? (
            <>
              <div className="admin-block">
                <div className="admin-block-head">
                  <h2>Organisations ({orgsFull.length})</h2>
                  {canManage ? (
                    <button type="button" className="button button-light" onClick={() => setCreatingOrg(true)}>
                      Créer une organisation
                    </button>
                  ) : null}
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Logo</th>
                        <th>Nom</th>
                        <th>Type</th>
                        <th>Ville</th>
                        <th>Pays</th>
                        <th className="admin-num">Membres</th>
                        <th>Rattaché à</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {orgsFull.map((o) => (
                        <tr key={o.id}>
                          <td>
                            {o.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={o.logoUrl} alt="" className="admin-logo-thumb" />
                            ) : (
                              <span className="admin-logo-empty">—</span>
                            )}
                          </td>
                          <td>{o.name}</td>
                          <td>
                            <AccountTypeBadge type={o.type as AccountType} />
                          </td>
                          <td>{o.city ?? '—'}</td>
                          <td>{o.country ?? '—'}</td>
                          <td className="admin-num">{o.memberCount}</td>
                          <td>{o.resellerName ?? o.distributorName ?? '—'}</td>
                          <td>
                            {canManage ? (
                              <button type="button" className="admin-link-btn" onClick={() => setEditingOrg(o)}>
                                Gérer
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                      {orgsFull.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="admin-empty">
                            Aucune organisation.
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
            </>
          ) : null}

          {tab === 'courses' ? (
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
          ) : null}
        </div>
      </section>

      {editing ? <UserDrawer user={editing} isSelf={editing.id === selfId} onClose={() => setEditing(null)} /> : null}
      {creatingOrg || editingOrg ? (
        <OrgDrawer
          org={editingOrg}
          allOrgs={orgsFull}
          onClose={() => {
            setEditingOrg(null);
            setCreatingOrg(false);
          }}
        />
      ) : null}

      <SiteFooter />
    </main>
  );
}
