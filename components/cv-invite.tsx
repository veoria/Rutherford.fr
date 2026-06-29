'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Locale, useLanguage } from '@/components/language-provider';

export type CvInviteItem = {
  id: string;
  clientEmail: string;
  company: string | null;
  status: 'pending' | 'completed' | 'expired';
  createdAt: string;
};

type Copy = {
  title: string;
  subtitle: string;
  open: string;
  emailLabel: string;
  emailPh: string;
  companyLabel: string;
  companyPh: string;
  machineLabel: string;
  machinePh: string;
  noteLabel: string;
  notePh: string;
  langLabel: string;
  send: string;
  sending: string;
  sent: string;
  cancel: string;
  errEmail: string;
  errGeneric: string;
  listTitle: string;
  pending: string;
  completed: string;
  expired: string;
  optional: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    title: 'Invite a client',
    subtitle: 'Send a client a link to fill out their own console validation — attributed to you.',
    open: 'Invite a client',
    emailLabel: 'Client email',
    emailPh: 'client@company.com',
    companyLabel: 'Client company',
    companyPh: 'Client company',
    machineLabel: 'Press / model',
    machinePh: 'e.g. Heidelberg CD 102',
    noteLabel: 'Personal note',
    notePh: 'A short message shown in the email…',
    langLabel: 'Email language',
    send: 'Send invitation',
    sending: 'Sending…',
    sent: 'Invitation sent.',
    cancel: 'Cancel',
    errEmail: 'Enter a valid client email.',
    errGeneric: 'Something went wrong. Please try again.',
    listTitle: 'Sent invitations',
    pending: 'Pending',
    completed: 'Completed',
    expired: 'Expired',
    optional: 'optional',
  },
  fr: {
    title: 'Inviter un client',
    subtitle: 'Envoyez à un client un lien pour remplir sa propre validation console — rattachée à vous.',
    open: 'Inviter un client',
    emailLabel: 'E-mail du client',
    emailPh: 'client@entreprise.com',
    companyLabel: 'Société du client',
    companyPh: 'Société du client',
    machineLabel: 'Presse / modèle',
    machinePh: 'ex. Heidelberg CD 102',
    noteLabel: 'Note personnelle',
    notePh: 'Un court message affiché dans l’e-mail…',
    langLabel: 'Langue de l’e-mail',
    send: 'Envoyer l’invitation',
    sending: 'Envoi…',
    sent: 'Invitation envoyée.',
    cancel: 'Annuler',
    errEmail: 'Saisissez un e-mail client valide.',
    errGeneric: 'Une erreur est survenue. Veuillez réessayer.',
    listTitle: 'Invitations envoyées',
    pending: 'En attente',
    completed: 'Complétée',
    expired: 'Expirée',
    optional: 'facultatif',
  },
  de: {
    title: 'Kunden einladen',
    subtitle: 'Senden Sie einem Kunden einen Link, um seine eigene Konsolenvalidierung auszufüllen — Ihnen zugeordnet.',
    open: 'Kunden einladen',
    emailLabel: 'Kunden-E-Mail',
    emailPh: 'kunde@firma.com',
    companyLabel: 'Unternehmen des Kunden',
    companyPh: 'Unternehmen des Kunden',
    machineLabel: 'Maschine / Modell',
    machinePh: 'z. B. Heidelberg CD 102',
    noteLabel: 'Persönliche Notiz',
    notePh: 'Eine kurze Nachricht in der E-Mail…',
    langLabel: 'E-Mail-Sprache',
    send: 'Einladung senden',
    sending: 'Wird gesendet…',
    sent: 'Einladung gesendet.',
    cancel: 'Abbrechen',
    errEmail: 'Geben Sie eine gültige Kunden-E-Mail ein.',
    errGeneric: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    listTitle: 'Gesendete Einladungen',
    pending: 'Ausstehend',
    completed: 'Abgeschlossen',
    expired: 'Abgelaufen',
    optional: 'optional',
  },
  it: {
    title: 'Invita un cliente',
    subtitle: 'Invii a un cliente un link per compilare la propria validazione console — attribuita a lei.',
    open: 'Invita un cliente',
    emailLabel: 'E-mail del cliente',
    emailPh: 'cliente@azienda.com',
    companyLabel: 'Azienda del cliente',
    companyPh: 'Azienda del cliente',
    machineLabel: 'Macchina / modello',
    machinePh: 'es. Heidelberg CD 102',
    noteLabel: 'Nota personale',
    notePh: 'Un breve messaggio mostrato nell’e-mail…',
    langLabel: 'Lingua dell’e-mail',
    send: 'Invia invito',
    sending: 'Invio…',
    sent: 'Invito inviato.',
    cancel: 'Annulla',
    errEmail: 'Inserisca un’e-mail cliente valida.',
    errGeneric: 'Si è verificato un errore. Riprovi.',
    listTitle: 'Inviti inviati',
    pending: 'In attesa',
    completed: 'Completato',
    expired: 'Scaduto',
    optional: 'facoltativo',
  },
  es: {
    title: 'Invitar a un cliente',
    subtitle: 'Envíe a un cliente un enlace para rellenar su propia validación de consola — atribuida a usted.',
    open: 'Invitar a un cliente',
    emailLabel: 'Correo del cliente',
    emailPh: 'cliente@empresa.com',
    companyLabel: 'Empresa del cliente',
    companyPh: 'Empresa del cliente',
    machineLabel: 'Prensa / modelo',
    machinePh: 'p. ej. Heidelberg CD 102',
    noteLabel: 'Nota personal',
    notePh: 'Un mensaje breve mostrado en el correo…',
    langLabel: 'Idioma del correo',
    send: 'Enviar invitación',
    sending: 'Enviando…',
    sent: 'Invitación enviada.',
    cancel: 'Cancelar',
    errEmail: 'Introduzca un correo de cliente válido.',
    errGeneric: 'Algo salió mal. Inténtelo de nuevo.',
    listTitle: 'Invitaciones enviadas',
    pending: 'Pendiente',
    completed: 'Completada',
    expired: 'Caducada',
    optional: 'opcional',
  },
  pt: {
    title: 'Convidar um cliente',
    subtitle: 'Envie a um cliente um link para preencher a sua própria validação de consola, atribuída a si.',
    open: 'Convidar um cliente',
    emailLabel: 'E-mail do cliente',
    emailPh: 'cliente@empresa.com',
    companyLabel: 'Empresa do cliente',
    companyPh: 'Empresa do cliente',
    machineLabel: 'Máquina / modelo',
    machinePh: 'ex. Heidelberg CD 102',
    noteLabel: 'Nota pessoal',
    notePh: 'Uma mensagem breve apresentada no e-mail…',
    langLabel: 'Idioma do e-mail',
    send: 'Enviar convite',
    sending: 'A enviar…',
    sent: 'Convite enviado.',
    cancel: 'Cancelar',
    errEmail: 'Indique um e-mail de cliente válido.',
    errGeneric: 'Ocorreu um erro. Tente novamente.',
    listTitle: 'Convites enviados',
    pending: 'Pendente',
    completed: 'Concluída',
    expired: 'Expirada',
    optional: 'opcional',
  },
};

const LANGS: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

export function CvInvite({ invitations }: { invitations: CvInviteItem[] }) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [machine, setMachine] = useState('');
  const [note, setNote] = useState('');
  const [lang, setLang] = useState<Locale>(locale);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const statusLabel = (s: CvInviteItem['status']) =>
    s === 'completed' ? t.completed : s === 'expired' ? t.expired : t.pending;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus('error');
      setErrorMsg(t.errEmail);
      return;
    }
    setStatus('sending');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/console-validation/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: email.trim(),
          company: company.trim(),
          machine: machine.trim(),
          note: note.trim(),
          locale: lang,
        }),
      });
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(t.errGeneric);
        return;
      }
      setStatus('sent');
      setEmail('');
      setCompany('');
      setMachine('');
      setNote('');
      setOpen(false);
      router.refresh();
    } catch {
      setStatus('error');
      setErrorMsg(t.errGeneric);
    }
  };

  return (
    <div className="cvi-card">
      <div className="cvi-head">
        <div>
          <div className="cvi-title">{t.title}</div>
          <div className="cvi-sub">{t.subtitle}</div>
        </div>
        {!open ? (
          <button
            type="button"
            className="button button-dark cvi-open"
            onClick={() => {
              setOpen(true);
              setStatus('idle');
            }}
          >
            {t.open} →
          </button>
        ) : null}
      </div>

      {open ? (
        <form className="cvi-form" onSubmit={submit}>
          <div className="cvi-grid2">
            <label className="cvi-field">
              <span className="cvi-label">{t.emailLabel}</span>
              <input
                className="cvi-input"
                type="email"
                required
                placeholder={t.emailPh}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'sending'}
              />
            </label>
            <label className="cvi-field">
              <span className="cvi-label">
                {t.companyLabel} <em>· {t.optional}</em>
              </span>
              <input
                className="cvi-input"
                type="text"
                placeholder={t.companyPh}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={status === 'sending'}
              />
            </label>
            <label className="cvi-field">
              <span className="cvi-label">
                {t.machineLabel} <em>· {t.optional}</em>
              </span>
              <input
                className="cvi-input"
                type="text"
                placeholder={t.machinePh}
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                disabled={status === 'sending'}
              />
            </label>
            <label className="cvi-field">
              <span className="cvi-label">{t.langLabel}</span>
              <select
                className="cvi-input"
                value={lang}
                onChange={(e) => setLang(e.target.value as Locale)}
                disabled={status === 'sending'}
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="cvi-field">
            <span className="cvi-label">
              {t.noteLabel} <em>· {t.optional}</em>
            </span>
            <textarea
              className="cvi-input cvi-textarea"
              rows={2}
              placeholder={t.notePh}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={status === 'sending'}
            />
          </label>
          <div className="cvi-actions">
            <button type="submit" className="button button-dark" disabled={status === 'sending'}>
              {status === 'sending' ? t.sending : t.send}
            </button>
            <button type="button" className="cvi-ghost" onClick={() => setOpen(false)} disabled={status === 'sending'}>
              {t.cancel}
            </button>
          </div>
        </form>
      ) : null}

      {status === 'sent' ? <p className="cvi-msg cvi-msg-ok">{t.sent}</p> : null}
      {status === 'error' && errorMsg ? <p className="cvi-msg cvi-msg-err">{errorMsg}</p> : null}

      {invitations.length > 0 ? (
        <div className="cvi-list">
          <div className="cvi-list-h">{t.listTitle}</div>
          {invitations.map((inv) => (
            <div key={inv.id} className="cvi-row">
              <span className="cvi-row-main">
                <span className="cvi-row-email">{inv.clientEmail}</span>
                {inv.company ? <span className="cvi-row-co"> · {inv.company}</span> : null}
              </span>
              <span className="cvi-row-meta">
                <span className="cvi-mono">{fmtDate(inv.createdAt)}</span>
                <span className={`cvi-badge cvi-badge-${inv.status}`}>{statusLabel(inv.status)}</span>
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
