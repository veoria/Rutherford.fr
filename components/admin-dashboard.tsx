'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { ALL_COURSES } from '@/data/academy-courses';
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
import type { AdminConsoleValidation, AdminOverview, AdminSupportTicket, AdminUser } from '@/lib/admin';
import type { AuditEntry } from '@/lib/admin-audit';
import type { AdminOrg, AdminOrgFull } from '@/lib/organizations';

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
// « se déclare partenaire » : signal fort pour la file « À qualifier ».
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
};
const errorLabel = (code: unknown) =>
  (typeof code === 'string' && ERROR_LABELS[code]) || 'Une erreur est survenue.';

// Monogramme de repli quand l'org n'a pas de logo (mêmes initiales que la fiche
// organisation) — la liste des organisations affiche logo OU monogramme.
function orgInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return ((parts[0][0] ?? '') + (parts[1][0] ?? '')).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || '?';
}

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

// Nombre de modules par cours (slug → total) pour le drill-down « Cours »
// (brief § 4.2.2) : AdminCourseStat ne porte pas le total, on le lit ici.
const MODULE_TOTAL_BY_SLUG = new Map(ALL_COURSES.map((c) => [c.id, c.modules] as const));

// ── Journal d'audit — libellés FR des codes d'action (brief § 4.2.6) ──
// Codes explicites d'abord ; sinon composition « verbe + domaine » ; sinon le
// code brut. Couvre les codes câblés par les mutations /api/admin/*.
const AUDIT_ACTION_LABELS: Record<string, string> = {
  'user.update': 'Modification compte',
  'user.qualify': 'Qualification compte',
  'user.set_admin': 'Droits admin modifiés',
  'user.suspend': 'Suspension compte',
  'user.delete': 'Suppression compte',
  'org.create': 'Création organisation',
  'org.update': 'Modification organisation',
  'org.member_role': 'Rôle de membre modifié',
  'org.member_remove': 'Retrait de membre',
  'org.invite': 'Invitation envoyée',
  'org.logo': 'Logo mis à jour',
  'storage.cleanup': 'Nettoyage stockage',
  'dropbox.move': 'Déplacement Dropbox',
  'dropbox.backfill': 'Reprise Dropbox',
};
// Domaines (noms au singulier, minuscule) pour la composition de repli.
const AUDIT_DOMAIN_LABELS: Record<string, string> = {
  user: 'compte',
  org: 'organisation',
  site: 'usine',
  system: 'système',
  storage: 'stockage',
  dropbox: 'Dropbox',
};
const AUDIT_VERB_LABELS: Record<string, string> = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  qualify: 'Qualification',
  suspend: 'Suspension',
  cleanup: 'Nettoyage',
  move: 'Déplacement',
  backfill: 'Reprise',
  invite: 'Invitation',
  logo: 'Logo',
};
function auditActionLabel(action: string): string {
  const known = AUDIT_ACTION_LABELS[action];
  if (known) return known;
  const dot = action.indexOf('.');
  if (dot > 0) {
    const domain = AUDIT_DOMAIN_LABELS[action.slice(0, dot)];
    const verb = AUDIT_VERB_LABELS[action.slice(dot + 1)];
    if (domain && verb) return `${verb} ${domain}`;
    if (domain) return `${domain} — ${action.slice(dot + 1)}`;
  }
  return action;
}
// « Cible » = type + identifiant court (les UUID sont tronqués).
function auditTarget(entry: AuditEntry): string {
  const shortId = entry.targetId
    ? entry.targetId.length > 12
      ? `${entry.targetId.slice(0, 8)}…`
      : entry.targetId
    : null;
  if (entry.targetType && shortId) return `${entry.targetType} · ${shortId}`;
  return entry.targetType ?? shortId ?? '—';
}

type AdminTab = 'overview' | 'accounts' | 'validations' | 'support' | 'orgs' | 'courses' | 'journal';
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
  // File de qualification (brief § 2.3.a) : comptes dont le type n'a pas pu
  // être déterminé automatiquement. NULL (lignes pré-migration) = confirmé.
  { key: 'unqualified', label: 'À qualifier', match: (u) => u.accountTypeSource === 'unqualified' },
  { key: 'admin', label: 'Admins', match: (u) => u.isAdmin },
  { key: 'suspended', label: 'Suspendus', match: (u) => u.suspended },
];

// « Société » exportée = nom d'organisation prioritaire, texte libre hérité en
// repli (brief § 3.2) — companyOf est fourni par le tableau de bord.
function toCsv(users: AdminUser[], companyOf: (u: AdminUser) => string | null): string {
  const headers = [
    'Nom', 'Email', 'Société', 'Pays', 'Poste', 'Type de compte', 'Admin', 'Onboardé', 'Inscrit',
    'Dernière activité', 'Modules terminés', 'Cours terminés', 'Certificats', 'Niveau', 'XP', 'Série',
    'Pass actif', 'Achats',
  ];
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // Poste exporté en libellé lisible selon le type ('' quand rien n'est renseigné).
  const posteOf = (u: AdminUser) => {
    const label = roleLabel(u.accountType, u.jobTitle, u.jobRoles);
    return label === '—' ? '' : label;
  };
  const rows = users.map((u) =>
    [
      u.name, u.email, companyOf(u), u.country, posteOf(u), ACCOUNT_TYPE_LABELS[u.accountType],
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

/** Bloc « Qualifier » d'un compte à qualifier : trois boutons qui fixent le
 * type ET account_type_source = 'admin' (action `qualify` de l'API). */
function QualifyBlock({
  user,
  busy,
  onQualify,
}: {
  user: { accountType: AccountType; jobRoles: string[] | null };
  busy: boolean;
  onQualify: (t: 'client' | 'reseller' | 'distributor') => void;
}) {
  return (
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
        <button type="button" className="button button-light" onClick={() => onQualify('client')} disabled={busy}>
          Client
        </button>
        <button type="button" className="button button-light" onClick={() => onQualify('reseller')} disabled={busy}>
          Revendeur
        </button>
        <button type="button" className="button button-light" onClick={() => onQualify('distributor')} disabled={busy}>
          Distributeur
        </button>
      </div>
    </div>
  );
}

function UserDrawer({
  user,
  orgOptions,
  isSelf,
  onClose,
}: {
  user: AdminUser;
  orgOptions: OrgOption[];
  isSelf: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.name ?? '');
  // L'org remplace le champ « Société » libre (brief § 3.2.1) ; company n'est
  // plus éditable ici, seulement affiché en repli hérité.
  const [orgId, setOrgId] = useState<string | null>(user.orgId ?? null);
  const [country, setCountry] = useState(user.country ?? '');
  // Valeur brute (pas filtrée) : une valeur héritée inconnue reste affichée et
  // n'est jamais renvoyée à l'API tant qu'elle n'est pas explicitement changée.
  const [jobTitle, setJobTitle] = useState(user.jobTitle ?? '');
  const [jobRoles, setJobRoles] = useState<string[]>(user.jobRoles ?? []);
  const [accountType, setAccountType] = useState<AccountType>(user.accountType);
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [suspended, setSuspended] = useState(user.suspended);

  const save = async () => {
    setBusy(true);
    setError(null);
    const body: Record<string, unknown> = {
      id: user.id,
      full_name: fullName.trim(),
      country,
      account_type: accountType,
      is_admin: isAdmin,
    };
    // Dirty-tracking : organization_id n'est envoyé que s'il a changé — même
    // logique que les champs de rôle ci-dessous.
    if ((orgId ?? null) !== (user.orgId ?? null)) body.organization_id = orgId;
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
      onClose();
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
    // Confirmation avant suspension (brief § 4.2.9) ; la réactivation n'est pas
    // destructive et ne demande pas de confirmation.
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

        {user.accountTypeSource === 'unqualified' ? (
          <QualifyBlock user={user} busy={busy} onQualify={(t) => void qualify(t)} />
        ) : null}

        <div className="admin-field">
          <label>Nom</label>
          <input className="admin-input" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={busy} />
        </div>
        <OrgSelectField
          orgs={orgOptions}
          value={orgId}
          onChange={setOrgId}
          accountType={accountType}
          legacyCompany={user.company}
          disabled={busy}
        />
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
  const [error, setError] = useState<string | null>(null);
  // Le select est contrôlé par la prop `resellerOrgId` ; comme window.confirm
  // est synchrone, un refus doit forcer une reconciliation pour rétablir la
  // valeur affichée — on remonte le select via une clé qui change à chaque essai.
  const [nonce, setNonce] = useState(0);
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
          key={nonce}
          className="admin-org-select"
          value={client.resellerOrgId ?? ''}
          disabled={busy}
          onChange={async (e) => {
            const next = e.target.value;
            // Toujours forcer le remount (voir note sur le confirm synchrone).
            setNonce((n) => n + 1);
            // Confirmation avant de changer l'attribution revendeur (brief § 4.2.9).
            if (!window.confirm(`Changer le revendeur attribué à « ${client.name} » ?`)) return;
            setBusy(true);
            setError(null);
            try {
              const res = await fetch('/api/admin/orgs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: client.id, reseller_org_id: next || null }),
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
          }}
        >
          <option value="">— Aucun —</option>
          {resellers.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {error ? <p className="admin-modal-error">{error}</p> : null}
      </td>
    </tr>
  );
}

/** Création d'organisation — modale minimale (nom + type). L'édition complète
 * (adresse, logo, membres, usines, systèmes, attribution) vit désormais sur la
 * fiche /admin/orgs/[id] (décision du 19/07/2026), donc on POST /api/admin/orgs
 * puis on redirige vers la fiche fraîchement créée. */
function OrgCreateModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('client');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(errorLabel(data.error));
        setBusy(false);
        return;
      }
      // On atterrit sur la fiche pour compléter le reste (busy reste vrai le temps
      // de la navigation : évite un double envoi).
      router.push(`/admin/orgs/${data.id}`);
    } catch {
      setError('Erreur réseau.');
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="presentation">
      <div className="admin-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="admin-modal-head">
          <h3>Nouvelle organisation</h3>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>
        <div className="admin-field">
          <label>Nom</label>
          <input
            className="admin-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={busy}
            autoFocus
          />
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
        <p className="admin-modal-section-status">
          Renseignez adresse, logo, membres, usines et systèmes sur la fiche de l&apos;organisation, une fois créée.
        </p>
        {error ? <p className="admin-modal-error">{error}</p> : null}
        <div className="admin-modal-actions">
          <button type="button" className="button button-light" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button type="button" className="button button-accent" onClick={() => void create()} disabled={busy}>
            {busy ? 'Création…' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

const TAB_KEYS: AdminTab[] = ['overview', 'accounts', 'validations', 'support', 'orgs', 'courses', 'journal'];

export function AdminDashboard({
  overview,
  orgs,
  orgsFull,
  auditLog,
  selfId,
  canManage,
}: {
  overview: AdminOverview;
  orgs: { clients: AdminOrg[]; resellers: { id: string; name: string }[] };
  orgsFull: AdminOrgFull[];
  auditLog: AuditEntry[];
  selfId: string;
  canManage: boolean;
}) {
  const { users, courses, consoleValidations, supportTickets, totals } = overview;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Onglet et cours ouverts initialisés depuis l'URL (?tab=&course=) : deep-link
  // et refresh-safe (brief § 4.2.3 / § 4.4). Le set d'onglets est inchangé.
  const [tab, setTab] = useState<AdminTab>(() => {
    const t = searchParams.get('tab');
    return t && (TAB_KEYS as string[]).includes(t) ? (t as AdminTab) : 'overview';
  });
  const [openCourse, setOpenCourse] = useState<string | null>(() => searchParams.get('course'));

  // Synchronise l'URL avec (onglet, cours) SANS navigation ni refetch serveur.
  // history.replaceState est la voie réellement « shallow » de l'App Router : la
  // page est en force-dynamic, un router.replace relancerait getAdminOverview à
  // chaque clic d'onglet. On garde le deep-link / refresh-safe puisque l'état
  // initial est lu depuis les searchParams au montage.
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (tab === 'courses' && openCourse) params.set('course', openCourse);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  }, [tab, openCourse, pathname]);

  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [segment, setSegment] = useState('all');
  const [countryFilter, setCountryFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [sortKey, setSortKey] = useState<AccountSortKey>('signup');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [cvFilter, setCvFilter] = useState('');
  const [cvQuery, setCvQuery] = useState('');
  const [supportFilter, setSupportFilter] = useState('');
  const [supportQuery, setSupportQuery] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);

  const countryOptions = useMemo(
    () => (Array.from(new Set(users.map((u) => u.country).filter(Boolean))) as string[]).sort(),
    [users]
  );

  const orgById = useMemo(() => new Map(orgsFull.map((o) => [o.id, o] as const)), [orgsFull]);
  // Identité par userId pour le drill-down « Cours » (brief § 4.2.2) : on joint
  // course.learnerDetails.userId à la liste des comptes déjà en mémoire.
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u] as const)), [users]);
  // « Société » affichée / triée / cherchée / exportée : le nom de
  // l'organisation prime, l'ancien texte libre profiles.company n'est qu'un
  // repli hérité (brief § 3.2.2).
  const companyOf = useMemo(
    () =>
      (u: AdminUser): string | null =>
        (u.orgId ? orgById.get(u.orgId)?.name ?? null : null) ?? u.company,
    [orgById]
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
        ![u.name, u.email, companyOf(u), u.country, u.jobTitle].some((f) => (f ?? '').toLowerCase().includes(q))
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
          return (companyOf(u) ?? '').toLowerCase();
        case 'country':
          return (u.country ?? '').toLowerCase();
        case 'activity':
          return u.lastSignInAt ?? '';
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
  }, [users, segment, countryFilter, activityFilter, query, sortKey, sortDir, companyOf]);

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

  const filteredSupport = useMemo(() => {
    const q = supportQuery.trim().toLowerCase();
    return supportTickets.filter((t) => {
      if (supportFilter && t.status !== supportFilter) return false;
      if (!q) return true;
      return [t.name, t.email, t.userEmail, t.assignee].some((f) => (f ?? '').toLowerCase().includes(q));
    });
  }, [supportTickets, supportFilter, supportQuery]);

  const downloadCsv = () => {
    const blob = new Blob(['﻿' + toCsv(filteredAccounts, companyOf)], { type: 'text/csv;charset=utf-8;' });
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
    { key: 'support', label: 'Support', count: supportTickets.length },
    { key: 'orgs', label: 'Organisations', count: orgsFull.length },
    { key: 'courses', label: 'Cours', count: courses.length },
    { key: 'journal', label: 'Journal', count: auditLog.length },
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
                <li>
                  <button type="button" className="admin-total admin-total-btn" onClick={() => setTab('accounts')}>
                    <span className="admin-total-value">{totals.users}</span>
                    <span className="admin-total-label">Comptes</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="admin-total admin-total-btn"
                    onClick={() => {
                      setSegment('all');
                      setActivityFilter('');
                      setTab('accounts');
                    }}
                  >
                    <span className="admin-total-value">{totals.onboarded}</span>
                    <span className="admin-total-label">Onboardés (leads)</span>
                  </button>
                </li>
                <li>
                  <button type="button" className="admin-total admin-total-btn" onClick={() => setTab('validations')}>
                    <span className="admin-total-value">{totals.consoleOpen}</span>
                    <span className="admin-total-label">Validations ouvertes</span>
                  </button>
                </li>
                <li>
                  <button type="button" className="admin-total admin-total-btn" onClick={() => setTab('support')}>
                    <span className="admin-total-value">{totals.supportOpen}</span>
                    <span className="admin-total-label">Tickets ouverts</span>
                  </button>
                </li>
                <li>
                  <button type="button" className="admin-total admin-total-btn" onClick={() => setTab('courses')}>
                    <span className="admin-total-value">{totals.certificates}</span>
                    <span className="admin-total-label">Certificats délivrés</span>
                  </button>
                </li>
                <li>
                  <button type="button" className="admin-total admin-total-btn" onClick={() => setTab('accounts')}>
                    <span className="admin-total-value">{totals.activePass}</span>
                    <span className="admin-total-label">Academy Pass actifs</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="admin-total admin-total-btn"
                    onClick={() => {
                      // Cette tuile applique réellement son filtre : onglet
                      // Comptes ouvert directement sur le segment « À qualifier ».
                      setSegment('unqualified');
                      setCountryFilter('');
                      setActivityFilter('');
                      setQuery('');
                      setTab('accounts');
                    }}
                  >
                    <span className="admin-total-value">{segmentCounts.unqualified ?? 0}</span>
                    <span className="admin-total-label">Comptes à qualifier</span>
                  </button>
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
                          <a className="admin-mini-row" href={`/admin/users/${u.id}`}>
                            <span className="admin-mini-name">{u.name || u.email}</span>
                            <span className="admin-mini-meta">{(companyOf(u) ?? '—') + ' · ' + fmtDate(u.signupAt)}</span>
                          </a>
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
                          <a className="admin-mini-row" href={`/admin/users/${u.id}`}>
                            <span className="admin-mini-name">{u.name || u.email}</span>
                            <span className="admin-mini-meta">{(companyOf(u) ?? '—') + ' · vu ' + fmtDate(u.lastActiveAt)}</span>
                          </a>
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
                      {sortTh('company', 'Société')}
                      {sortTh('country', 'Pays')}
                      <th>Type</th>
                      {sortTh('signup', 'Inscrit')}
                      {sortTh('activity', 'Dernière connexion')}
                      <th>Accès</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((u) => {
                      const org = u.orgId ? orgById.get(u.orgId) : undefined;
                      return (
                        <tr key={u.id}>
                          <td>
                            <a className="admin-name-link" href={`/admin/users/${u.id}`}>
                              {u.name || u.email}
                            </a>
                            {u.isAdmin ? <span className="admin-badge">admin</span> : null}
                            {u.suspended ? <span className="admin-badge admin-badge-warn">suspendu</span> : null}
                            {u.accountTypeSource === 'unqualified' && declaresPartner(u) ? (
                              <span className="admin-badge">Se déclare partenaire</span>
                            ) : null}
                            {u.name ? <span className="admin-cv-sub">{u.email}</span> : null}
                          </td>
                          <td>
                            {org ? (
                              // Le nom de l'org prime sur l'ancien texte libre (brief
                              // § 3.2.2). Simple lien vers la page organisation : plus
                              // de tiroir ici — l'ancienne entrée n'était pas gatée
                              // canManage et ouvrait un formulaire mort en lecture
                              // seule (brief § 4.2.10).
                              <a className="admin-company-link" href={`/admin/orgs/${org.id}`}>
                                {org.logoUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={org.logoUrl} alt="" className="admin-company-logo" />
                                ) : null}
                                <span>{org.name}</span>
                              </a>
                            ) : (
                              u.company ?? '—'
                            )}
                          </td>
                          <td>{u.country ?? '—'}</td>
                          <td>
                            <AccountTypeBadge type={u.accountType} />
                          </td>
                          <td>{fmtDate(u.signupAt)}</td>
                          <td>{fmtDate(u.lastSignInAt)}</td>
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
                      );
                    })}
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="admin-empty">
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
                        <td className="admin-email">
                          {/* Lien croisé vers la fiche du compte (brief § 4.2.4). */}
                          {c.userId ? (
                            <a className="admin-name-link" href={`/admin/users/${c.userId}`}>
                              {c.userEmail ?? '—'}
                            </a>
                          ) : (
                            c.userEmail ?? '—'
                          )}
                        </td>
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

          {tab === 'support' ? (
            <div className="admin-block">
              <div className="admin-block-head">
                <h2>Support ({filteredSupport.length})</h2>
                <div className="admin-block-controls">
                  <input
                    type="search"
                    className="admin-search"
                    placeholder="Rechercher (nom, e-mail, assigné…)"
                    value={supportQuery}
                    onChange={(e) => setSupportQuery(e.target.value)}
                    aria-label="Rechercher un ticket"
                  />
                  <select
                    className="admin-search"
                    value={supportFilter}
                    onChange={(e) => setSupportFilter(e.target.value)}
                    aria-label="Filtrer par statut"
                  >
                    <option value="">Tous les statuts</option>
                    {Object.keys(SUPPORT_STATUS_LABELS).map((s) => (
                      <option key={s} value={s}>
                        {SUPPORT_STATUS_LABELS[s]}
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
                      <th>Demandeur</th>
                      <th>Compte</th>
                      <th>Statut</th>
                      <th>Assigné</th>
                      <th>Lien</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSupport.map((t) => (
                      <tr key={t.id}>
                        <td>{fmtDate(t.createdAt)}</td>
                        <td>
                          {/* Lien croisé vers la fiche du compte (brief § 4.2.4). */}
                          {t.userId ? (
                            <a className="admin-name-link" href={`/admin/users/${t.userId}`}>
                              {t.name ?? t.email}
                            </a>
                          ) : (
                            t.name ?? '—'
                          )}
                          <span className="admin-cv-sub">{t.email}</span>
                        </td>
                        <td className="admin-email">
                          {t.userId ? (
                            <a className="admin-name-link" href={`/admin/users/${t.userId}`}>
                              {t.userEmail ?? '—'}
                            </a>
                          ) : (
                            t.userEmail ?? '—'
                          )}
                        </td>
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
                    {filteredSupport.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="admin-empty">
                          Aucun ticket.
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
                              <span className="admin-logo-empty">{orgInitials(o.name)}</span>
                            )}
                          </td>
                          <td>
                            {/* Nom cliquable vers la fiche organisation (brief § 4.2.3) :
                                consultation ET édition. Le tiroir « Gérer » est retiré —
                                tout se passe sur la page (décision du 19/07/2026). */}
                            <a className="admin-name-link" href={`/admin/orgs/${o.id}`}>
                              {o.name}
                            </a>
                          </td>
                          <td>
                            <AccountTypeBadge type={o.type as AccountType} />
                          </td>
                          <td>{o.city ?? '—'}</td>
                          <td>{o.country ?? '—'}</td>
                          <td className="admin-num">{o.memberCount}</td>
                          <td>{o.resellerName ?? o.distributorName ?? '—'}</td>
                          <td>
                            {/* L'édition vit sur la page : simple lien « Ouvrir »
                                (accessible même en lecture seule, la fiche gère les droits). */}
                            <a className="admin-link-btn" href={`/admin/orgs/${o.id}`}>
                              Ouvrir
                            </a>
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
              <p className="admin-modal-section-status">Cliquez sur un cours pour voir qui le suit.</p>
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
                    {courses.map((c) => {
                      const isOpen = openCourse === c.slug;
                      const total = MODULE_TOTAL_BY_SLUG.get(c.slug) ?? null;
                      return (
                        <Fragment key={c.slug}>
                          <tr>
                            <td>
                              {/* Ligne cliquable → apprenants du cours, deep-linkée
                                  via ?course=slug (brief § 4.2.2). */}
                              <button
                                type="button"
                                className="admin-company-link"
                                aria-expanded={isOpen}
                                onClick={() => setOpenCourse(isOpen ? null : c.slug)}
                              >
                                <span aria-hidden="true">{isOpen ? '▾ ' : '▸ '}</span>
                                <span>{c.title}</span>
                              </button>
                            </td>
                            <td>{c.tone === 'premium' ? 'Premium' : 'Gratuit'}</td>
                            <td className="admin-num">{c.learners}</td>
                            <td className="admin-num">{c.certified}</td>
                            <td className="admin-num">{c.avgQuizPct != null ? `${c.avgQuizPct}%` : '—'}</td>
                          </tr>
                          {isOpen ? (
                            <tr>
                              <td colSpan={5}>
                                <div className="admin-modal-members">
                                  <h4 className="admin-modal-subhead">{c.learnerDetails.length} apprenants</h4>
                                  {c.learnerDetails.length === 0 ? (
                                    <p className="admin-modal-section-status">Aucun apprenant pour ce cours.</p>
                                  ) : (
                                    <table className="admin-table">
                                      <thead>
                                        <tr>
                                          <th>Nom</th>
                                          <th>E-mail</th>
                                          <th className="admin-num">Modules faits</th>
                                          <th className="admin-num">Meilleur score QCM</th>
                                          <th>Certifié</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {c.learnerDetails.map((l) => {
                                          const u = userById.get(l.userId);
                                          return (
                                            <tr key={l.userId}>
                                              <td>
                                                <a
                                                  className="admin-name-link"
                                                  href={`/admin/users/${l.userId}`}
                                                >
                                                  {u?.name || u?.email || '—'}
                                                </a>
                                              </td>
                                              <td className="admin-email">
                                                {u?.email ? (
                                                  <a
                                                    className="admin-name-link"
                                                    href={`/admin/users/${l.userId}`}
                                                  >
                                                    {u.email}
                                                  </a>
                                                ) : (
                                                  '—'
                                                )}
                                              </td>
                                              <td className="admin-num">
                                                {total != null ? `${l.modulesDone}/${total}` : l.modulesDone}
                                              </td>
                                              <td className="admin-num">
                                                {l.bestQuizPct != null ? `${l.bestQuizPct}%` : '—'}
                                              </td>
                                              <td>
                                                {l.certified ? (
                                                  <span className="admin-badge">Certifié</span>
                                                ) : (
                                                  '—'
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {tab === 'journal' ? (
            <div className="admin-block">
              <div className="admin-block-head">
                <h2>Journal d’audit ({auditLog.length})</h2>
              </div>
              <p className="admin-modal-section-status">
                Trace des actions du back-office (les plus récentes en premier).
              </p>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date / heure</th>
                      <th>Acteur</th>
                      <th>Action</th>
                      <th>Cible</th>
                      <th>Résumé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map((e) => (
                      <tr key={e.id}>
                        <td>{fmtDateTime(e.createdAt)}</td>
                        <td className="admin-email">{e.actorEmail ?? e.actorId ?? '—'}</td>
                        <td>{auditActionLabel(e.action)}</td>
                        <td>{auditTarget(e)}</td>
                        <td>{e.summary ?? '—'}</td>
                      </tr>
                    ))}
                    {auditLog.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="admin-empty">
                          Aucune action enregistrée.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {editing ? (
        <UserDrawer user={editing} orgOptions={orgsFull} isSelf={editing.id === selfId} onClose={() => setEditing(null)} />
      ) : null}
      {creatingOrg ? <OrgCreateModal onClose={() => setCreatingOrg(false)} /> : null}

      <SiteFooter />
    </main>
  );
}
