'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import type { AdminUserDetail as Detail } from '@/lib/admin';
import {
  COUNTRIES,
  JOB_TITLE_KEYS,
  TEAM_ROLE_KEYS,
  isJobTitleKey,
  isTeamRoleKey,
  partnerRoleKeysFor,
  type JobTitleKey,
} from '@/data/onboarding-options';
import { TEAM_ROLE_LABELS } from '@/data/team-role-labels';
import { DISTRIBUTOR_ROLE_LABELS, RESELLER_ROLE_LABELS } from '@/data/partner-role-labels';
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

// L'admin est en français uniquement : on résout chaque référentiel vers ses
// libellés FR (les clés restent la valeur stockée).
const TEAM_ROLE_LABELS_FR = TEAM_ROLE_LABELS.fr as Record<string, string>;
const PARTNER_ROLE_LABELS_FR: Record<'reseller' | 'distributor', Record<string, string>> = {
  reseller: RESELLER_ROLE_LABELS.fr as Record<string, string>,
  distributor: DISTRIBUTOR_ROLE_LABELS.fr as Record<string, string>,
};

/** Libellé « Poste » selon le type de compte : client → poste imprimerie,
 * team → rôle interne, reseller/distributor → job_roles joints par « · ».
 * Une valeur héritée inconnue est affichée telle quelle, jamais masquée. */
function roleLabel(accountType: AccountType, jobTitle: string | null, jobRoles: string[] | null): string {
  if (accountType === 'reseller' || accountType === 'distributor') {
    const labels = PARTNER_ROLE_LABELS_FR[accountType];
    if (jobRoles && jobRoles.length) return jobRoles.map((r) => labels[r] ?? r).join(' · ');
    // Partenaire pré-migration sans job_roles : on retombe sur le job_title stocké.
    return jobTitle ? (isJobTitleKey(jobTitle) ? ROLE_LABELS[jobTitle] : jobTitle) : '—';
  }
  if (accountType === 'team') {
    return jobTitle ? (isTeamRoleKey(jobTitle) ? TEAM_ROLE_LABELS_FR[jobTitle] : jobTitle) : '—';
  }
  return jobTitle ? (isJobTitleKey(jobTitle) ? ROLE_LABELS[jobTitle] : jobTitle) : '—';
}

// Un compte typé client qui a déclaré des rôles partenaires à l'onboarding
// « se déclare partenaire » : signal fort pour la qualification.
const declaresPartner = (u: { accountType: AccountType; jobRoles: string[] | null }): boolean =>
  u.accountType === 'client' && (u.jobRoles?.length ?? 0) > 0;

const declaredRoleLabel = (key: string): string =>
  PARTNER_ROLE_LABELS_FR.reseller[key] ?? PARTNER_ROLE_LABELS_FR.distributor[key] ?? key;

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
  bad_job_title: 'Poste invalide pour ce type de compte.',
  bad_job_roles: 'Rôles invalides pour ce type de compte.',
  bad_organization: 'Organisation invalide ou introuvable.',
  forbidden_admin_grant: 'Seul le super-administrateur peut nommer un administrateur.',
  admin_requires_team: 'Seuls les membres de l’équipe Rutherford peuvent être administrateurs.',
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

/** Champ « Poste » qui s'adapte au type de compte sélectionné dans le
 * formulaire : choix unique pour client (référentiel imprimerie) et team
 * (rôles internes), cases à cocher multi-sélection pour les partenaires
 * (job_roles). Une valeur héritée inconnue reste visible comme option dédiée —
 * on ne la détruit jamais tant que l'admin ne la remplace pas. */
function RoleField({
  accountType,
  jobTitle,
  onJobTitle,
  jobRoles,
  onJobRoles,
  disabled,
}: {
  accountType: AccountType;
  jobTitle: string;
  onJobTitle: (v: string) => void;
  jobRoles: string[];
  onJobRoles: (v: string[]) => void;
  disabled: boolean;
}) {
  const partnerKeys = partnerRoleKeysFor(accountType);
  if (partnerKeys) {
    const labels = PARTNER_ROLE_LABELS_FR[accountType as 'reseller' | 'distributor'];
    return (
      <div className="admin-field">
        <label>Rôles (multi-sélection)</label>
        <div className="admin-site-access-list">
          {partnerKeys.map((k) => {
            const checked = jobRoles.includes(k);
            return (
              <label key={k} className="admin-site-access-item">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onJobRoles(checked ? jobRoles.filter((r) => r !== k) : [...jobRoles, k])}
                />
                {labels[k] ?? k}
              </label>
            );
          })}
        </div>
      </div>
    );
  }
  const keys: readonly string[] = accountType === 'team' ? TEAM_ROLE_KEYS : JOB_TITLE_KEYS;
  const labelOf = (k: string) =>
    accountType === 'team' ? TEAM_ROLE_LABELS_FR[k] ?? k : ROLE_LABELS[k as JobTitleKey] ?? k;
  const legacy = jobTitle && !keys.includes(jobTitle) ? jobTitle : null;
  return (
    <div className="admin-field">
      <label>Poste</label>
      <select className="admin-input" value={jobTitle} onChange={(e) => onJobTitle(e.target.value)} disabled={disabled}>
        <option value="">—</option>
        {legacy ? <option value={legacy}>{legacy} (valeur héritée)</option> : null}
        {keys.map((k) => (
          <option key={k} value={k}>
            {labelOf(k)}
          </option>
        ))}
      </select>
    </div>
  );
}

type OrgOption = { id: string; name: string; type: string };

const orgOptionLabel = (o: OrgOption): string =>
  `${o.name} (${ACCOUNT_TYPE_LABELS[o.type as AccountType] ?? o.type})`;

/** Sélecteur d'organisation (recherche + création) : remplace l'ancien champ
 * « Société » libre — l'organisation est la source de vérité (brief § 3.2.1).
 * « Créer une organisation » passe par POST /api/admin/orgs (name = texte
 * cherché, type = type de compte de l'utilisateur) puis sélectionne l'org
 * créée. L'ancien texte libre `company` reste visible en note quand il diverge
 * du nom de l'org sélectionnée — il n'est plus éditable ici. */
function OrgSelectField({
  orgs,
  value,
  onChange,
  accountType,
  legacyCompany,
  disabled,
}: {
  orgs: OrgOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  accountType: AccountType;
  legacyCompany: string | null;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  // Orgs créées depuis ce champ : la liste reçue en props ne se rafraîchit
  // qu'au prochain rendu serveur, on les garde localement pour l'affichage.
  const [created, setCreated] = useState<OrgOption[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const known = new Set(orgs.map((o) => o.id));
  const all = [...orgs, ...created.filter((o) => !known.has(o.id))];
  const current = value ? all.find((o) => o.id === value) ?? null : null;
  const q = search.trim().toLowerCase();
  const filtered = q ? all.filter((o) => o.name.toLowerCase().includes(q)) : all;
  const VISIBLE = 30;

  const select = (id: string | null) => {
    onChange(id);
    setOpen(false);
    setSearch('');
    setError(null);
  };

  const createOrganization = async () => {
    const name = search.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Type de la nouvelle org = type de compte de l'utilisateur ('client'
        // couvre le défaut : AccountType ne peut pas être vide).
        body: JSON.stringify({ name, type: accountType }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(errorLabel(data.error));
        setCreating(false);
        return;
      }
      setCreated((list) => [...list, { id: data.id as string, name, type: accountType }]);
      setCreating(false);
      select(data.id);
    } catch {
      setError('Erreur réseau.');
      setCreating(false);
    }
  };

  // Boutons-options : styles de liste du tiroir réutilisés, reset minimal du
  // rendu bouton natif (pas de classe dédiée en CSS).
  const optionStyle = { background: 'none', border: 0, padding: 0, textAlign: 'left' as const };

  return (
    <div className="admin-field">
      <label>Organisation</label>
      {!open ? (
        <button
          type="button"
          className="admin-input"
          style={{ textAlign: 'left', cursor: 'pointer' }}
          onClick={() => setOpen(true)}
          disabled={disabled}
        >
          {current ? orgOptionLabel(current) : '— Aucune organisation —'}
        </button>
      ) : (
        <>
          <input
            className="admin-input"
            autoFocus
            placeholder="Rechercher une organisation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled || creating}
          />
          <div className="admin-site-access-list">
            <button
              type="button"
              className="admin-site-access-item"
              style={optionStyle}
              onClick={() => select(null)}
              disabled={creating}
            >
              — Aucune organisation —{value === null ? ' ✓' : ''}
            </button>
            {filtered.slice(0, VISIBLE).map((o) => (
              <button
                key={o.id}
                type="button"
                className="admin-site-access-item"
                style={optionStyle}
                onClick={() => select(o.id)}
                disabled={creating}
              >
                {orgOptionLabel(o)}
                {o.id === value ? ' ✓' : ''}
              </button>
            ))}
            {filtered.length > VISIBLE ? (
              <p className="admin-site-access-hint">
                {filtered.length - VISIBLE} autre(s) organisation(s) — affinez la recherche.
              </p>
            ) : null}
            {q && filtered.length === 0 ? (
              <p className="admin-site-access-hint">Aucune organisation trouvée.</p>
            ) : null}
            {search.trim() ? (
              <button
                type="button"
                className="admin-link-btn"
                onClick={() => void createOrganization()}
                disabled={creating}
              >
                {creating ? 'Création…' : `+ Créer l'organisation « ${search.trim()} »`}
              </button>
            ) : null}
          </div>
        </>
      )}
      {legacyCompany && legacyCompany !== (current?.name ?? '') ? (
        <p className="admin-site-access-hint">Société (texte libre hérité) : {legacyCompany}</p>
      ) : null}
      {error ? <p className="admin-modal-error">{error}</p> : null}
    </div>
  );
}

function ManagePanel({ user, isSelf, canGrantAdmin }: { user: Detail; isSelf: boolean; canGrantAdmin: boolean }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.name ?? '');
  // L'org remplace le champ « Société » libre (brief § 3.2.1) ; company n'est
  // plus éditable ici, seulement affiché en repli hérité.
  const [orgId, setOrgId] = useState<string | null>(user.org?.id ?? null);
  const [country, setCountry] = useState(user.country ?? '');
  // Valeur brute (pas filtrée) : une valeur héritée inconnue reste affichée et
  // n'est jamais renvoyée à l'API tant qu'elle n'est pas explicitement changée.
  const [jobTitle, setJobTitle] = useState(user.jobTitle ?? '');
  const [jobRoles, setJobRoles] = useState<string[]>(user.jobRoles ?? []);
  const [accountType, setAccountType] = useState<AccountType>(user.accountType);
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [suspended, setSuspended] = useState(user.suspended);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = async () => {
    setBusy(true);
    setError(null);
    const body: Record<string, unknown> = {
      id: user.id,
      full_name: fullName.trim(),
      country,
      account_type: accountType,
    };
    // is_admin dirty-tracké : envoyé UNIQUEMENT s'il change (le serveur réserve
    // sa modification au super-admin ; l'inclure à chaque save bloquerait un
    // admin normal éditant un autre champ).
    if (isAdmin !== user.isAdmin) body.is_admin = isAdmin;
    // Dirty-tracking : organization_id n'est envoyé que s'il a changé — même
    // logique que les champs de rôle ci-dessous.
    if ((orgId ?? null) !== (user.org?.id ?? null)) body.organization_id = orgId;
    // N'envoyer que le champ de rôle réellement touché : renvoyer une valeur
    // héritée intacte la détruirait côté serveur (clé inconnue → 400).
    const initialRoles = user.jobRoles ?? [];
    const rolesChanged =
      jobRoles.length !== initialRoles.length || jobRoles.some((r) => !initialRoles.includes(r));
    if (partnerRoleKeysFor(accountType)) {
      if (rolesChanged) body.job_roles = jobRoles;
    } else if (jobTitle !== (user.jobTitle ?? '')) {
      body.job_title = jobTitle;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  const qualify = async (t: 'client' | 'reseller' | 'distributor') => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, action: 'qualify', account_type: t }),
      });
      if (!res.ok) {
        setError(errorLabel((await res.json().catch(() => ({}))).error));
        setBusy(false);
        return;
      }
      // Le refresh recharge la fiche : le bloc disparaît et le type affiché
      // reflète la qualification.
      router.refresh();
      setBusy(false);
    } catch {
      setError('Erreur réseau.');
      setBusy(false);
    }
  };

  const toggleSuspend = async () => {
    // Confirmation avant suspension (brief § 4.2.9) ; la réactivation n'en
    // demande pas (action non destructive).
    if (!suspended && !window.confirm('Suspendre ce compte ? La connexion sera bloquée jusqu’à réactivation.'))
      return;
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

      {user.accountTypeSource === 'unqualified' ? (
        <div className="admin-modal-members">
          <h4 className="admin-modal-subhead">Qualifier</h4>
          <p className="admin-modal-section-status">
            Type de compte non déterminé automatiquement — choisissez le bon profil.
            {declaresPartner(user) ? (
              <>
                {' '}
                <span className="admin-badge">Se déclare partenaire</span>{' '}
                {(user.jobRoles ?? []).map(declaredRoleLabel).join(' · ')}
              </>
            ) : null}
          </p>
          <div className="admin-modal-danger-row">
            <button type="button" className="button button-light" onClick={() => void qualify('client')} disabled={busy}>
              Client
            </button>
            <button type="button" className="button button-light" onClick={() => void qualify('reseller')} disabled={busy}>
              Revendeur
            </button>
            <button type="button" className="button button-light" onClick={() => void qualify('distributor')} disabled={busy}>
              Distributeur
            </button>
          </div>
        </div>
      ) : null}

      <div className="admin-field">
        <label>Nom</label>
        <input className="admin-input" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={busy} />
      </div>
      <OrgSelectField
        orgs={user.orgOptions}
        value={orgId}
        onChange={setOrgId}
        accountType={accountType}
        legacyCompany={user.company}
        disabled={busy}
      />
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
        <RoleField
          accountType={accountType}
          jobTitle={jobTitle}
          onJobTitle={setJobTitle}
          jobRoles={jobRoles}
          onJobRoles={setJobRoles}
          disabled={busy}
        />
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
      {/* Administrateur : réservé aux comptes équipe, et seul le super-admin
          peut le basculer. Masqué sinon (le serveur applique la même règle). */}
      {canGrantAdmin && accountType === 'team' ? (
        <label className="admin-check">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            disabled={busy || isSelf}
          />
          <span>Administrateur{isSelf ? ' (vous — non modifiable)' : ''}</span>
        </label>
      ) : null}

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
  canManage,
  isSelf,
  canGrantAdmin = false,
}: {
  user: Detail;
  canManage: boolean;
  isSelf: boolean;
  canGrantAdmin?: boolean;
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
      <SiteNav current="admin" />

      <section className="admin-section section">
        <div className="container">
          {/* Fil d'Ariane : retour direct au tableau de bord OU à l'onglet
              Comptes d'où l'on vient (l'onglet est porté par l'URL ?tab=). */}
          <nav className="admin-breadcrumb" aria-label="Fil d’Ariane">
            <a href="/admin">Admin</a>
            <span aria-hidden="true">›</span>
            <a href="/admin?tab=accounts">Comptes</a>
            <span aria-hidden="true">›</span>
            <span className="admin-breadcrumb-cur">{user.name || user.email}</span>
          </nav>

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
            {/* L'organisation est la valeur canonique de « la société » (brief
                § 3.2) ; sans org, l'ancien texte libre sert de repli signalé. */}
            <div className="admin-fact">
              <span className="admin-fact-label">Organisation</span>
              <span className="admin-fact-value">
                {user.org ? (
                  <span className="admin-org-inline">
                    {user.org.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.org.logoUrl} alt="" className="admin-company-logo" />
                    ) : null}
                    {/* Lien croisé vers la vraie page organisation (brief § 4.2.3-4). */}
                    <a className="admin-name-link" href={`/admin/orgs/${user.org.id}`}>
                      {user.org.name}
                    </a>
                    <span>
                      ({ACCOUNT_TYPE_LABELS[user.org.type as AccountType] ?? user.org.type})
                      {user.org.role ? ` · ${user.org.role}` : ''}
                    </span>
                  </span>
                ) : user.company ? (
                  `${user.company} (texte libre hérité)`
                ) : (
                  '—'
                )}
              </span>
            </div>
            {/* Divergence org / ancien texte libre rendue visible — la ligne
                disparaît quand les deux concordent (ou sans texte hérité). */}
            {user.org && user.company && user.company !== user.org.name ? (
              <Fact label="Société (texte hérité)" value={user.company} />
            ) : null}
            <Fact label="Pays" value={user.country ?? '—'} />
            <Fact label="Poste" value={roleLabel(user.accountType, user.jobTitle, user.jobRoles)} />
            <Fact label="Inscrit" value={fmtDate(user.signupAt)} />
            <Fact label="Dernière connexion" value={fmtDate(user.lastSignInAt)} />
            <Fact label="E-mail de notification" value={user.notificationEmail ?? '—'} />
            <Fact label="Accès" value={access} />
          </div>

          {canManage ? (
            <ManagePanel user={user} isSelf={isSelf} canGrantAdmin={canGrantAdmin} />
          ) : (
            <p className="admin-modal-section-status">Lecture seule — la gestion des comptes est réservée aux admins.</p>
          )}

          {/* Ancres #academy/#validations/#support : cibles des tuiles de
              l'aperçu « vue client » (deep-link vers la fiche admin). */}
          <div className="admin-block" id="academy">
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

          <div className="admin-block" id="validations">
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

          <div className="admin-block" id="support">
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
