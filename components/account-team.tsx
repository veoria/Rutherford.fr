'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { AccountSubnav } from '@/components/account-subnav';
import { ManagePanel, type ResellerClient } from '@/components/account-hub';
import { type Locale, useLanguage } from '@/components/language-provider';
import type { AccountType } from '@/data/account-types';
import type { MemberRole, OrgMember, PendingInvite, ResellerClientOrg, Team } from '@/lib/organizations';

type TeamCopy = {
  eyebrow: string;
  title: string;
  members: (n: number) => string;
  pending: (n: number) => string;
  invite: string;
  colMember: string;
  colRole: string;
  colStatus: string;
  you: string;
  active: string;
  pendingPill: string;
  invitedOn: (d: string) => string;
  roleOwner: string;
  roleAdmin: string;
  roleMember: string;
  note: string;
  emailPh: string;
  send: string;
  sending: string;
  cancel: string;
  inviteError: string;
  makeAdmin: string;
  makeMember: string;
  remove: string;
  revoke: string;
  actions: string;
};

const COPY: Record<Locale, TeamCopy> = {
  en: {
    eyebrow: 'Partner area',
    title: 'My team',
    members: (n) => `${n} member${n > 1 ? 's' : ''}`,
    pending: (n) => `${n} pending invitation${n > 1 ? 's' : ''}`,
    invite: 'Invite a member',
    colMember: 'Member',
    colRole: 'Role',
    colStatus: 'Status',
    you: 'You',
    active: 'Active',
    pendingPill: 'Pending',
    invitedOn: (d) => `Invited on ${d}`,
    roleOwner: 'Owner',
    roleAdmin: 'Administrator',
    roleMember: 'Member',
    note: 'Administrators can invite members, manage roles and access to console validations and the Academy.',
    emailPh: 'name@company.com',
    send: 'Send invitation',
    sending: 'Sending…',
    cancel: 'Cancel',
    inviteError: 'Invitation could not be sent. Please check the address and try again.',
    makeAdmin: 'Make administrator',
    makeMember: 'Make member',
    remove: 'Remove from team',
    revoke: 'Cancel invitation',
    actions: 'Member actions',
  },
  fr: {
    eyebrow: 'Espace partenaire',
    title: 'Mon équipe',
    members: (n) => `${n} membre${n > 1 ? 's' : ''}`,
    pending: (n) => `${n} invitation${n > 1 ? 's' : ''} en attente`,
    invite: 'Inviter un membre',
    colMember: 'Membre',
    colRole: 'Rôle',
    colStatus: 'Statut',
    you: 'Vous',
    active: 'Actif',
    pendingPill: 'En attente',
    invitedOn: (d) => `Invité le ${d}`,
    roleOwner: 'Propriétaire',
    roleAdmin: 'Administrateur',
    roleMember: 'Membre',
    note: 'Les administrateurs peuvent inviter des membres, gérer les rôles et l’accès aux validations console et à l’Academy.',
    emailPh: 'nom@entreprise.com',
    send: 'Envoyer l’invitation',
    sending: 'Envoi…',
    cancel: 'Annuler',
    inviteError: 'L’invitation n’a pas pu être envoyée. Vérifiez l’adresse et réessayez.',
    makeAdmin: 'Passer administrateur',
    makeMember: 'Passer membre',
    remove: 'Retirer de l’équipe',
    revoke: 'Annuler l’invitation',
    actions: 'Actions du membre',
  },
  de: {
    eyebrow: 'Partnerbereich',
    title: 'Mein Team',
    members: (n) => `${n} Mitglied${n > 1 ? 'er' : ''}`,
    pending: (n) => `${n} ausstehende Einladung${n > 1 ? 'en' : ''}`,
    invite: 'Mitglied einladen',
    colMember: 'Mitglied',
    colRole: 'Rolle',
    colStatus: 'Status',
    you: 'Sie',
    active: 'Aktiv',
    pendingPill: 'Ausstehend',
    invitedOn: (d) => `Eingeladen am ${d}`,
    roleOwner: 'Inhaber',
    roleAdmin: 'Administrator',
    roleMember: 'Mitglied',
    note: 'Administratoren können Mitglieder einladen sowie Rollen und den Zugriff auf Konsolenvalidierungen und die Academy verwalten.',
    emailPh: 'name@firma.com',
    send: 'Einladung senden',
    sending: 'Wird gesendet…',
    cancel: 'Abbrechen',
    inviteError: 'Die Einladung konnte nicht gesendet werden. Bitte prüfen Sie die Adresse und versuchen Sie es erneut.',
    makeAdmin: 'Zum Administrator machen',
    makeMember: 'Zum Mitglied machen',
    remove: 'Aus dem Team entfernen',
    revoke: 'Einladung zurückziehen',
    actions: 'Mitglieder-Aktionen',
  },
  it: {
    eyebrow: 'Area partner',
    title: 'Il mio team',
    members: (n) => `${n} membr${n > 1 ? 'i' : 'o'}`,
    pending: (n) => `${n} invit${n > 1 ? 'i' : 'o'} in attesa`,
    invite: 'Invita un membro',
    colMember: 'Membro',
    colRole: 'Ruolo',
    colStatus: 'Stato',
    you: 'Lei',
    active: 'Attivo',
    pendingPill: 'In attesa',
    invitedOn: (d) => `Invitato il ${d}`,
    roleOwner: 'Proprietario',
    roleAdmin: 'Amministratore',
    roleMember: 'Membro',
    note: 'Gli amministratori possono invitare membri, gestire i ruoli e l’accesso alle validazioni console e all’Academy.',
    emailPh: 'nome@azienda.com',
    send: 'Invia l’invito',
    sending: 'Invio…',
    cancel: 'Annulla',
    inviteError: 'Non è stato possibile inviare l’invito. Controlli l’indirizzo e riprovi.',
    makeAdmin: 'Rendi amministratore',
    makeMember: 'Rendi membro',
    remove: 'Rimuovi dal team',
    revoke: 'Annulla l’invito',
    actions: 'Azioni del membro',
  },
  es: {
    eyebrow: 'Área de partner',
    title: 'Mi equipo',
    members: (n) => `${n} miembro${n > 1 ? 's' : ''}`,
    pending: (n) => `${n} invitación${n > 1 ? 'es' : ''} pendiente${n > 1 ? 's' : ''}`,
    invite: 'Invitar a un miembro',
    colMember: 'Miembro',
    colRole: 'Rol',
    colStatus: 'Estado',
    you: 'Usted',
    active: 'Activo',
    pendingPill: 'Pendiente',
    invitedOn: (d) => `Invitado el ${d}`,
    roleOwner: 'Propietario',
    roleAdmin: 'Administrador',
    roleMember: 'Miembro',
    note: 'Los administradores pueden invitar a miembros y gestionar los roles y el acceso a las validaciones de consola y a la Academy.',
    emailPh: 'nombre@empresa.com',
    send: 'Enviar invitación',
    sending: 'Enviando…',
    cancel: 'Cancelar',
    inviteError: 'No se pudo enviar la invitación. Revise la dirección e inténtelo de nuevo.',
    makeAdmin: 'Hacer administrador',
    makeMember: 'Hacer miembro',
    remove: 'Quitar del equipo',
    revoke: 'Cancelar invitación',
    actions: 'Acciones del miembro',
  },
};

// Neutral avatar tones for non-self members (self is always accent blue).
const AV_TONES = ['#2a2a2a', '#5a5a5a', '#7a7a7a', '#3f4a57', '#4a3f57', '#574a3f'];

function teamInitials(name: string | null, email: string): string {
  const n = (name ?? '').trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
  return (email.slice(0, 2) || '?').toUpperCase();
}

function roleLabel(t: TeamCopy, role: MemberRole): string {
  return role === 'owner' ? t.roleOwner : role === 'admin' ? t.roleAdmin : t.roleMember;
}

function fmtDate(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

// Per-member "⋯" menu (admin only): toggle role / remove. Closes on a backdrop tap.
function MemberMenu({ t, member }: { t: TeamCopy; member: OrgMember }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const run = async (req: () => Promise<Response>) => {
    setBusy(true);
    try {
      const res = await req();
      if (res.ok) router.refresh();
    } catch {
      /* ignore */
    }
    setBusy(false);
    setOpen(false);
  };
  const nextRole: MemberRole = member.role === 'admin' ? 'member' : 'admin';
  return (
    <div className="team-menu">
      <button
        type="button"
        className="team-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.actions}
        onClick={() => setOpen((o) => !o)}
      >
        ⋯
      </button>
      {open ? (
        <>
          <button type="button" className="team-menu-backdrop" tabIndex={-1} aria-hidden onClick={() => setOpen(false)} />
          <div className="team-menu-pop" role="menu">
            <button
              type="button"
              role="menuitem"
              disabled={busy}
              onClick={() =>
                run(() =>
                  fetch('/api/account/team/member', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: member.userId, role: nextRole }),
                  })
                )
              }
            >
              {member.role === 'admin' ? t.makeMember : t.makeAdmin}
            </button>
            <button
              type="button"
              role="menuitem"
              className="team-menu-danger"
              disabled={busy}
              onClick={() => run(() => fetch(`/api/account/team/member?userId=${encodeURIComponent(member.userId)}`, { method: 'DELETE' }))}
            >
              {t.remove}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function RevokeLink({ t, invitationId }: { t: TeamCopy; invitationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="team-revoke"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await fetch(`/api/account/team/member?invitationId=${encodeURIComponent(invitationId)}`, { method: 'DELETE' });
          if (res.ok) router.refresh();
        } catch {
          /* ignore */
        }
        setBusy(false);
      }}
    >
      {t.revoke}
    </button>
  );
}

function InvitePanel({ t, onDone }: { t: TeamCopy; onDone: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(false);
    try {
      const res = await fetch('/api/account/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role: 'member', kind: 'member' }),
      });
      if (res.ok) {
        setEmail('');
        router.refresh();
        onDone();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setBusy(false);
  };
  return (
    <form className="team-invite-panel" onSubmit={submit}>
      <input
        type="email"
        className={`team-invite-input${error ? ' err' : ''}`}
        placeholder={t.emailPh}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(false);
        }}
        disabled={busy}
        required
        autoFocus
      />
      <button type="submit" className="team-invite-submit" disabled={busy}>
        {busy ? t.sending : t.send}
      </button>
      <button type="button" className="team-invite-cancel" onClick={onDone} disabled={busy}>
        {t.cancel}
      </button>
      {error ? <span className="team-invite-err">{t.inviteError}</span> : null}
    </form>
  );
}

function TeamTable({ team, selfId }: { team: Team; selfId: string }) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const [inviting, setInviting] = useState(false);
  const canManage = team.myRole === 'owner' || team.myRole === 'admin';
  const countLine = [t.members(team.members.length), team.pending.length ? t.pending(team.pending.length) : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <section className="section profile-section">
      <div className="container team-shell">
        <div className="team-head">
          <div>
            <p className="profile-eyebrow">{t.eyebrow}</p>
            <h1 className="profile-h1">{t.title}</h1>
            <p className="profile-sub">{countLine}</p>
          </div>
          {canManage ? (
            <button type="button" className="team-invite-cta" onClick={() => setInviting((v) => !v)}>
              <span className="team-invite-cta-plus">+</span> {t.invite}
            </button>
          ) : null}
        </div>

        {canManage && inviting ? <InvitePanel t={t} onDone={() => setInviting(false)} /> : null}

        <div className="team-table">
          <div className="team-row team-row-head">
            <span>{t.colMember}</span>
            <span>{t.colRole}</span>
            <span>{t.colStatus}</span>
            <span />
          </div>

          {team.members.map((m: OrgMember, i) => {
            const isSelf = m.userId === selfId;
            const manageable = canManage && m.role !== 'owner' && !isSelf;
            return (
              <div className="team-row" key={m.userId}>
                <div className="team-member">
                  <span className="team-avatar" style={{ background: isSelf ? 'var(--accent)' : AV_TONES[i % AV_TONES.length] }}>
                    {teamInitials(m.name, m.email)}
                  </span>
                  <span className="team-person">
                    <span className="team-name">
                      {m.name || m.email}
                      {isSelf ? <span className="team-you"> · {t.you}</span> : null}
                    </span>
                    <span className="team-email">{m.email}</span>
                  </span>
                </div>
                <span className="team-role">{roleLabel(t, m.role)}</span>
                <span className="team-status is-active">
                  <span className="team-status-dot" />
                  {t.active}
                </span>
                <span className="team-actions">{manageable ? <MemberMenu t={t} member={m} /> : null}</span>
              </div>
            );
          })}

          {team.pending.map((p: PendingInvite) => (
            <div className="team-row" key={p.id}>
              <div className="team-member">
                <span className="team-avatar is-invite" aria-hidden>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>
                <span className="team-person">
                  <span className="team-name">{p.email}</span>
                  <span className="team-email">{t.invitedOn(fmtDate(p.createdAt, locale))}</span>
                </span>
              </div>
              <span className="team-role is-muted">{roleLabel(t, p.role)}</span>
              <span className="team-status is-pending">
                <span className="team-status-dot" />
                {t.pendingPill}
              </span>
              <span className="team-actions">{canManage ? <RevokeLink t={t} invitationId={p.id} /> : null}</span>
            </div>
          ))}
        </div>

        <p className="team-note">{t.note}</p>
      </div>
    </section>
  );
}

// Dedicated "My team" page. Client accounts get the redesigned member table;
// distributor / reseller / Rutherford-team keep the richer management panel
// (network, clients, back-office) the handoff doesn't cover.
export function AccountTeam(props: {
  accountType: AccountType;
  team: Team;
  selfId: string;
  networkResellers: ResellerClientOrg[];
  clients: ResellerClient[];
}) {
  const isPartnerPanel = props.accountType !== 'client';
  return (
    <main className="page-shell">
      <SiteNav current="account" />
      <AccountSubnav current="team" />
      {isPartnerPanel ? (
        <section className="section">
          <div className="container ah-team-page">
            <ManagePanel {...props} />
          </div>
        </section>
      ) : (
        <TeamTable team={props.team} selfId={props.selfId} />
      )}
      <SiteFooter />
    </main>
  );
}
