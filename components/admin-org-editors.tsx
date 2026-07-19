'use client';

// Widgets d'édition de la fiche organisation (brief § 4.2 — décision du
// 19/07/2026 : l'édition passe du tiroir à la page /admin/orgs/[id]). Portés
// depuis l'OrgDrawer de admin-dashboard.tsx pour parité de fonctionnalité, en
// appelant exactement les mêmes API /api/admin/orgs*. Importés uniquement par
// components/admin-org-detail.tsx. Registre UX calqué sur admin-user-detail :
// formulaires inline, dirty-tracking, erreurs FR, succès = router.refresh().

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { COUNTRIES } from '@/data/onboarding-options';
import { ACCOUNT_TYPES, type AccountType } from '@/data/account-types';
import type { AdminOrgDetail, AdminOrgMemberRow, AdminOrgInviteRow } from '@/lib/admin';

type MemberRole = 'owner' | 'admin' | 'member';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
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

// Libellés FR des codes d'erreur renvoyés par /api/admin/orgs* (mêmes codes que
// admin-user-detail / les routes lues).
const ERROR_LABELS: Record<string, string> = {
  forbidden: 'Action réservée aux admins.',
  unauthorized: 'Session expirée — reconnectez-vous.',
  mfa_required: 'Activez la double authentification pour gérer les organisations.',
  missing_name: 'Le nom est requis.',
  missing_org: 'Organisation introuvable.',
  missing_product: 'Le produit est requis.',
  bad_type: 'Type de compte invalide.',
  bad_country: 'Pays invalide.',
  bad_email: 'Adresse e-mail invalide.',
  bad_status: 'Statut de licence invalide.',
  bad_date: 'Date invalide (format AAAA-MM-JJ).',
  bad_type_upload: 'Format d’image non supporté (PNG, JPG, WebP ou GIF).',
  bad_type_415: 'Format d’image non supporté (PNG, JPG, WebP ou GIF).',
  too_large: 'Fichier trop volumineux (max 4 Mo).',
  storage_unavailable: 'Stockage indisponible.',
  bad_request: 'Requête invalide.',
  nothing_to_update: 'Aucune modification à enregistrer.',
  failed: 'L’enregistrement a échoué.',
};
const errorLabel = (code: unknown) =>
  (typeof code === 'string' && ERROR_LABELS[code]) || 'Une erreur est survenue.';

// ── Systèmes & licences (client_systems) ─────────────────────────────────────

export type OrgSystem = {
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
  notes: string | null;
};

export type OrgSite = {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  anydeskId: string | null;
  notes: string | null;
};

const LICENSE_STATUS_LABELS: Record<OrgSystem['licenseStatus'], string> = {
  active: 'Active',
  trial: 'Essai',
  expired: 'Expirée',
  suspended: 'Suspendue',
};

// Suggestions produit — champ libre, mais on pousse les noms canoniques.
const SYSTEM_PRODUCTS = ['ColorLoop', 'ColorLoop Connect', 'EasySet', 'EasyLoop', 'MeasureColor', 'IntelliTrax2'];

type SystemDraft = Omit<OrgSystem, 'id'>;

const EMPTY_SYSTEM: SystemDraft = {
  siteId: null,
  product: '',
  machine: null,
  licenseKey: null,
  licenseStatus: 'active',
  licenseExpiresAt: null,
  anydeskId: null,
  installedVersion: null,
  latestVersion: null,
  notes: null,
};

function SystemForm({
  initial,
  submitLabel,
  sites,
  onSubmit,
  onDelete,
}: {
  initial: SystemDraft;
  submitLabel: string;
  sites: OrgSite[];
  onSubmit: (draft: SystemDraft) => Promise<boolean>;
  onDelete?: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<SystemDraft>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (patch: Partial<SystemDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  };
  const text = (v: string) => v || null;
  const updateReady =
    Boolean((draft.installedVersion ?? '').trim()) &&
    Boolean((draft.latestVersion ?? '').trim()) &&
    (draft.installedVersion ?? '').trim() !== (draft.latestVersion ?? '').trim();

  return (
    <div className="admin-sys-card">
      <div className="admin-field-row">
        <div className="admin-field">
          <label>Produit</label>
          <input
            className="admin-input"
            list="admin-org-sys-products"
            value={draft.product}
            onChange={(e) => set({ product: e.target.value })}
            disabled={busy}
            placeholder="ColorLoop"
          />
        </div>
        <div className="admin-field">
          <label>Presse / machine</label>
          <input
            className="admin-input"
            value={draft.machine ?? ''}
            onChange={(e) => set({ machine: text(e.target.value) })}
            disabled={busy}
            placeholder="Heidelberg XL 106"
          />
        </div>
        <div className="admin-field">
          <label>Usine</label>
          <select
            className="admin-input"
            value={draft.siteId ?? ''}
            onChange={(e) => set({ siteId: e.target.value || null })}
            disabled={busy || !sites.length}
          >
            <option value="">{sites.length ? '— Non affectée —' : 'Aucune usine — créez-en une'}</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label>Licence (clé)</label>
          <input
            className="admin-input"
            value={draft.licenseKey ?? ''}
            onChange={(e) => set({ licenseKey: text(e.target.value) })}
            disabled={busy}
          />
        </div>
        <div className="admin-field">
          <label>Statut</label>
          <select
            className="admin-input"
            value={draft.licenseStatus}
            onChange={(e) => set({ licenseStatus: e.target.value as OrgSystem['licenseStatus'] })}
            disabled={busy}
          >
            {(Object.keys(LICENSE_STATUS_LABELS) as OrgSystem['licenseStatus'][]).map((s) => (
              <option key={s} value={s}>
                {LICENSE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label>Expiration</label>
          <input
            className="admin-input"
            type="date"
            value={draft.licenseExpiresAt ?? ''}
            onChange={(e) => set({ licenseExpiresAt: text(e.target.value) })}
            disabled={busy}
          />
        </div>
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label>N° AnyDesk</label>
          <input
            className="admin-input"
            value={draft.anydeskId ?? ''}
            onChange={(e) => set({ anydeskId: text(e.target.value) })}
            disabled={busy}
            placeholder="123 456 789"
          />
        </div>
        <div className="admin-field">
          <label>Version installée</label>
          <input
            className="admin-input"
            value={draft.installedVersion ?? ''}
            onChange={(e) => set({ installedVersion: text(e.target.value) })}
            disabled={busy}
            placeholder="3.2.1"
          />
        </div>
        <div className="admin-field">
          <label>Dernière version</label>
          <input
            className="admin-input"
            value={draft.latestVersion ?? ''}
            onChange={(e) => set({ latestVersion: text(e.target.value) })}
            disabled={busy}
            placeholder="3.4.0"
          />
        </div>
      </div>
      <div className="admin-field">
        <label>Notes internes</label>
        <input
          className="admin-input"
          value={draft.notes ?? ''}
          onChange={(e) => set({ notes: text(e.target.value) })}
          disabled={busy}
        />
      </div>
      <div className="admin-sys-actions">
        {updateReady ? <span className="ah-sys-pill amber">Mise à jour à proposer</span> : null}
        {onDelete ? (
          <button
            type="button"
            className="ah-revoke"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm('Supprimer ce système ?')) return;
              setBusy(true);
              await onDelete();
              setBusy(false);
            }}
          >
            Supprimer
          </button>
        ) : null}
        <button
          type="button"
          className="button button-light"
          disabled={busy || !draft.product.trim()}
          onClick={async () => {
            setBusy(true);
            const ok = await onSubmit(draft);
            setSaved(ok);
            setBusy(false);
          }}
        >
          {busy ? '…' : saved ? 'Enregistré ✓' : submitLabel}
        </button>
      </div>
    </div>
  );
}

export function OrgSystemsEditor({ orgId, sites }: { orgId: string; sites: OrgSite[] }) {
  const router = useRouter();
  const [systems, setSystems] = useState<OrgSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const res = await fetch(`/api/admin/orgs/systems?orgId=${encodeURIComponent(orgId)}`);
      if (res.ok) {
        const d = (await res.json()) as { systems?: OrgSystem[] };
        setSystems(d.systems ?? []);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const save = async (id: string | null, draft: SystemDraft): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch('/api/admin/orgs/systems', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { id, ...draft } : { orgId, ...draft }),
      });
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        return false;
      }
      if (!id) setAdding(false);
      await refresh();
      router.refresh();
      return true;
    } catch {
      setError('Erreur réseau.');
      return false;
    }
  };

  return (
    <div className="admin-modal-members">
      <h4 className="admin-modal-subhead">Modifier les systèmes &amp; licences{loading ? ' …' : ` (${systems.length})`}</h4>
      <p className="admin-modal-section-status">
        Licence, n° AnyDesk et versions affichés dans l&apos;espace client (« Mon système »). Une « Dernière
        version » différente de la version installée signale une mise à jour disponible au client et à son
        revendeur. L&apos;attribution « vendu par » (canal de la commande) se règle ailleurs — non éditable ici.
      </p>
      <datalist id="admin-org-sys-products">
        {SYSTEM_PRODUCTS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      {systems.map((s) => (
        <SystemForm
          key={s.id}
          initial={s}
          submitLabel="Enregistrer"
          sites={sites}
          onSubmit={(draft) => save(s.id, draft)}
          onDelete={async () => {
            setError(null);
            try {
              await fetch(`/api/admin/orgs/systems?id=${encodeURIComponent(s.id)}`, { method: 'DELETE' });
            } catch {
              /* ignore */
            }
            await refresh();
            router.refresh();
          }}
        />
      ))}
      {adding ? (
        <SystemForm initial={EMPTY_SYSTEM} submitLabel="Ajouter" sites={sites} onSubmit={(draft) => save(null, draft)} />
      ) : (
        <button type="button" className="admin-link-btn" onClick={() => setAdding(true)}>
          + Ajouter un système
        </button>
      )}
      {error ? <p className="admin-modal-error">{error}</p> : null}
    </div>
  );
}

// ── Usines (sites) ───────────────────────────────────────────────────────────

type SiteDraft = Omit<OrgSite, 'id'>;

const EMPTY_SITE: SiteDraft = {
  name: '',
  country: null,
  city: null,
  address: null,
  postalCode: null,
  anydeskId: null,
  notes: null,
};

function SiteForm({
  initial,
  submitLabel,
  onSubmit,
  onDelete,
}: {
  initial: SiteDraft;
  submitLabel: string;
  onSubmit: (draft: SiteDraft) => Promise<boolean>;
  onDelete?: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<SiteDraft>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (patch: Partial<SiteDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  };
  const text = (v: string) => v || null;
  return (
    <div className="admin-sys-card">
      <div className="admin-field-row">
        <div className="admin-field">
          <label>Nom de l&apos;usine</label>
          <input
            className="admin-input"
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            disabled={busy}
            placeholder="Site de Lyon"
          />
        </div>
        <div className="admin-field">
          <label>Ville</label>
          <input
            className="admin-input"
            value={draft.city ?? ''}
            onChange={(e) => set({ city: text(e.target.value) })}
            disabled={busy}
          />
        </div>
        <div className="admin-field">
          <label>Pays</label>
          <select className="admin-input" value={draft.country ?? ''} onChange={(e) => set({ country: e.target.value || null })} disabled={busy}>
            <option value="">—</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label>Adresse</label>
          <input className="admin-input" value={draft.address ?? ''} onChange={(e) => set({ address: text(e.target.value) })} disabled={busy} />
        </div>
        <div className="admin-field">
          <label>Code postal</label>
          <input className="admin-input" value={draft.postalCode ?? ''} onChange={(e) => set({ postalCode: text(e.target.value) })} disabled={busy} />
        </div>
        <div className="admin-field">
          <label>N° AnyDesk du site</label>
          <input className="admin-input" value={draft.anydeskId ?? ''} onChange={(e) => set({ anydeskId: text(e.target.value) })} disabled={busy} placeholder="123 456 789" />
        </div>
      </div>
      <div className="admin-sys-actions">
        {onDelete ? (
          <button
            type="button"
            className="ah-revoke"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm('Supprimer cette usine ? Les systèmes rattachés deviendront « non affectés ».')) return;
              setBusy(true);
              await onDelete();
              setBusy(false);
            }}
          >
            Supprimer
          </button>
        ) : null}
        <button
          type="button"
          className="button button-light"
          disabled={busy || !draft.name.trim()}
          onClick={async () => {
            setBusy(true);
            const ok = await onSubmit(draft);
            setSaved(ok);
            setBusy(false);
          }}
        >
          {busy ? '…' : saved ? 'Enregistré ✓' : submitLabel}
        </button>
      </div>
    </div>
  );
}

export function OrgSitesEditor({ orgId, sites, onChange }: { orgId: string; sites: OrgSite[]; onChange: () => void }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (id: string | null, draft: SiteDraft): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch('/api/admin/orgs/sites', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { id, ...draft } : { orgId, ...draft }),
      });
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        return false;
      }
      if (!id) setAdding(false);
      onChange();
      router.refresh();
      return true;
    } catch {
      setError('Erreur réseau.');
      return false;
    }
  };

  return (
    <div className="admin-modal-members">
      <h4 className="admin-modal-subhead">Modifier les usines{` (${sites.length})`}</h4>
      <p className="admin-modal-section-status">
        Les sites de ce client. Chaque système peut être rattaché à une usine, et un membre peut être limité à
        certaines usines (voir la gestion des membres ci-dessus).
      </p>
      {sites.map((s) => (
        <SiteForm
          key={s.id}
          initial={s}
          submitLabel="Enregistrer"
          onSubmit={(draft) => save(s.id, draft)}
          onDelete={async () => {
            setError(null);
            try {
              await fetch(`/api/admin/orgs/sites?id=${encodeURIComponent(s.id)}`, { method: 'DELETE' });
            } catch {
              /* ignore */
            }
            onChange();
            router.refresh();
          }}
        />
      ))}
      {adding ? (
        <SiteForm initial={EMPTY_SITE} submitLabel="Ajouter" onSubmit={(draft) => save(null, draft)} />
      ) : (
        <button type="button" className="admin-link-btn" onClick={() => setAdding(true)}>
          + Ajouter une usine
        </button>
      )}
      {error ? <p className="admin-modal-error">{error}</p> : null}
    </div>
  );
}

// Restriction d'accès aux usines par membre : aucune case cochée = accès à tout.
function MemberSiteAccess({ userId, orgId, sites }: { userId: string; orgId: string; sites: OrgSite[] }) {
  const [restricted, setRestricted] = useState<string[] | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`/api/admin/orgs/site-members?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const d = (await res.json()) as { siteIds?: string[] };
        const valid = new Set(sites.map((s) => s.id));
        setRestricted((d.siteIds ?? []).filter((id) => valid.has(id)));
      }
    } catch {
      /* ignore */
    }
  };

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && restricted === null) void load();
  };

  const save = async (ids: string[]) => {
    setBusy(true);
    setRestricted(ids);
    try {
      await fetch('/api/admin/orgs/site-members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, orgId, siteIds: ids }),
      });
    } catch {
      /* ignore */
    }
    setBusy(false);
  };

  if (!sites.length) return null;

  const current = restricted ?? [];
  const label = restricted === null ? 'Usines' : current.length ? `${current.length} usine(s)` : 'Toutes les usines';

  return (
    <div className="admin-site-access">
      <button type="button" className="admin-link-btn" onClick={toggleOpen} disabled={busy}>
        {open ? '▾ ' : '▸ '}
        {label}
      </button>
      {open ? (
        <div className="admin-site-access-list">
          {sites.map((s) => {
            const checked = current.includes(s.id);
            return (
              <label key={s.id} className="admin-site-access-item">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={busy}
                  onChange={() => {
                    const next = checked ? current.filter((id) => id !== s.id) : [...current, s.id];
                    void save(next);
                  }}
                />
                {s.name}
              </label>
            );
          })}
          <p className="admin-site-access-hint">Aucune case cochée = accès à toutes les usines.</p>
        </div>
      ) : null}
    </div>
  );
}

// ── Membres ──────────────────────────────────────────────────────────────────

export function OrgMembersEditor({
  orgId,
  members,
  pending,
  sites,
}: {
  orgId: string;
  members: AdminOrgMemberRow[];
  pending: AdminOrgInviteRow[];
  sites: OrgSite[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  // Le select de rôle est contrôlé par la prop `role` ; window.confirm étant
  // synchrone, un refus/échec doit forcer le remount pour rétablir le rôle réel.
  const [memberNonce, setMemberNonce] = useState(0);

  const changeRole = async (userId: string, role: MemberRole, currentRole: string) => {
    if (currentRole === 'owner' && role !== 'owner') {
      if (!window.confirm('Rétrograder ce propriétaire ? Il perdra le contrôle de l’organisation.')) {
        setMemberNonce((n) => n + 1);
        return;
      }
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/orgs/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, userId, role }),
      });
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        setMemberNonce((n) => n + 1);
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError('Erreur réseau.');
      setMemberNonce((n) => n + 1);
    }
    setBusy(false);
  };

  const removeMem = async (userId: string, label: string) => {
    if (!window.confirm(`Retirer ${label} de l’organisation ?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/orgs/members?orgId=${encodeURIComponent(orgId)}&userId=${encodeURIComponent(userId)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError('Erreur réseau.');
    }
    setBusy(false);
  };

  const revokeInvite = async (invitationId: string, email: string) => {
    if (!window.confirm(`Révoquer l’invitation de ${email} ?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orgs/members?invitationId=${encodeURIComponent(invitationId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError('Erreur réseau.');
    }
    setBusy(false);
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/orgs/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, email: inviteEmail.trim(), role: inviteRole }),
      });
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        setBusy(false);
        return;
      }
      setInviteEmail('');
      router.refresh();
      setBusy(false);
    } catch {
      setError('Erreur réseau.');
      setBusy(false);
    }
  };

  const activeMembers = members.filter((m) => m.status !== 'invited');

  return (
    <div className="admin-modal-members">
      <h4 className="admin-modal-subhead">Gérer les membres ({activeMembers.length})</h4>
      {activeMembers.length === 0 ? <p className="admin-modal-section-status">Aucun membre.</p> : null}
      {activeMembers.map((m) => (
        <div className="admin-mem-row" key={m.userId}>
          <span className="admin-mem-main">
            {/* Lien croisé vers la fiche du membre (brief § 4.2.4). */}
            <a className="admin-mem-name admin-name-link" href={`/admin/users/${m.userId}`}>
              {m.name || m.email || '—'}
            </a>
            {m.email ? <span className="admin-mem-email">{m.email}</span> : null}
            {m.role === 'member' ? <MemberSiteAccess userId={m.userId} orgId={orgId} sites={sites} /> : null}
          </span>
          <span className="ah-member-ctl">
            <select
              key={`role-${m.userId}-${memberNonce}`}
              className="ah-role-select"
              value={m.role}
              disabled={busy}
              onChange={(e) => void changeRole(m.userId, e.target.value as MemberRole, m.role)}
            >
              <option value="owner">Propriétaire</option>
              <option value="admin">Admin</option>
              <option value="member">Membre</option>
            </select>
            <button
              type="button"
              className="ah-member-remove"
              disabled={busy}
              onClick={() => void removeMem(m.userId, m.name || m.email || 'ce membre')}
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
            <span className="admin-mem-email">Invitation en attente · {MEMBER_ROLE_LABELS[p.role] ?? p.role}</span>
          </span>
          <button type="button" className="ah-revoke" disabled={busy} onClick={() => void revokeInvite(p.id, p.email)}>
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
        <button type="button" className="ah-invite-send" onClick={() => void sendInvite()} disabled={busy || !inviteEmail.trim()}>
          Inviter
        </button>
      </div>
      {error ? <p className="admin-modal-error">{error}</p> : null}
    </div>
  );
}

// ── Identité & attribution + logo ────────────────────────────────────────────

export function OrgIdentityEditor({ org }: { org: AdminOrgDetail }) {
  const router = useRouter();
  const [name, setName] = useState(org.name ?? '');
  const [type, setType] = useState<AccountType>((org.type as AccountType) ?? 'client');
  const [country, setCountry] = useState(org.country ?? '');
  const [address, setAddress] = useState(org.address ?? '');
  const [postalCode, setPostalCode] = useState(org.postalCode ?? '');
  const [city, setCity] = useState(org.city ?? '');
  const [logoUrl, setLogoUrl] = useState<string | null>(org.logoUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: org.id,
          name: name.trim(),
          type,
          country,
          address,
          postal_code: postalCode,
          city,
        }),
      });
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        setBusy(false);
        return;
      }
      setSaved(true);
      router.refresh();
      setBusy(false);
    } catch {
      setError('Erreur réseau.');
      setBusy(false);
    }
  };

  const uploadLogo = async (file: File) => {
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

  return (
    <div className="admin-block admin-detail-manage">
      <div className="admin-block-head">
        <h2>Identité &amp; attribution</h2>
      </div>

      <div className="admin-field">
        <label>Nom</label>
        <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} disabled={busy} />
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label>Type</label>
          <select className="admin-input" value={type} onChange={(e) => setType(e.target.value as AccountType)} disabled={busy}>
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACCOUNT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
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
      </div>
      <div className="admin-field">
        <label>Adresse</label>
        <input className="admin-input" value={address} onChange={(e) => setAddress(e.target.value)} disabled={busy} />
      </div>
      <div className="admin-field-row">
        <div className="admin-field">
          <label>Code postal</label>
          <input className="admin-input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} disabled={busy} />
        </div>
        <div className="admin-field">
          <label>Ville</label>
          <input className="admin-input" value={city} onChange={(e) => setCity(e.target.value)} disabled={busy} />
        </div>
      </div>

      {/* Attribution revendeur / distributeur : lecture seule sur cette page.
          La modification exige la liste complète des organisations, qu'aucun
          endpoint GET atteignable ne fournit ici (brief § 4.2 — à câbler). */}
      {type === 'client' ? (
        <div className="admin-field">
          <label>Attribution (canal)</label>
          <p className="admin-modal-section-status">
            Revendeur : {org.resellerName ?? '— aucun —'} · Distributeur : {org.distributorName ?? '— aucun —'}.
            <br />
            Modification de l&apos;attribution : à venir — pas de liste d&apos;organisations disponible sur cette page.
          </p>
        </div>
      ) : null}

      <div className="admin-field">
        <label>Logo</label>
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
              accept="image/png,image/jpeg,image/webp,image/gif"
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
      </div>

      {error ? <p className="admin-modal-error">{error}</p> : null}

      <div className="admin-modal-actions">
        <button type="button" className="button button-accent" onClick={save} disabled={busy}>
          {busy ? 'Enregistrement…' : saved ? 'Enregistré ✓' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
