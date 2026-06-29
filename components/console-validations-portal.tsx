'use client';

import { ChangeEvent, DragEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { AccountSubnav } from '@/components/account-subnav';
import { CvInvite, type CvInviteItem } from '@/components/cv-invite';
import { type Locale, useLanguage } from '@/components/language-provider';
import { countryFlag } from '@/data/country-flags';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export type ConsoleValidationStatus =
  | 'submitted'
  | 'in_review'
  | 'can_be_connected'
  | 'rejected'
  | 'changes_requested';

export type ConsoleValidationRow = {
  id: string;
  company: string | null;
  country: string | null;
  machine: string | null;
  status: ConsoleValidationStatus;
  createdAt: string;
  reference: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  customerReplyAt: string | null;
};

export type CvMessage = {
  validationId: string;
  author: 'team' | 'customer';
  body: string | null;
  photos: string[];
  createdAt: string;
};

// Statuses where the customer can still add details (vs. a settled verdict).
const CAN_REPLY: ConsoleValidationStatus[] = ['submitted', 'in_review', 'changes_requested'];

// Tone groups the five raw statuses into the four filter buckets in the design.
type Tone = 'review' | 'action' | 'green' | 'red';

const GROUP_OF: Record<ConsoleValidationStatus, Tone> = {
  submitted: 'review',
  in_review: 'review',
  changes_requested: 'action',
  can_be_connected: 'green',
  rejected: 'red',
};

const SUPPORT = 'contact@rutherford.fr';

type StatusCopy = { short: string; long: string };

type CCopy = {
  title: string;
  presses: (n: number) => string;
  eligible: (n: number) => string;
  all: string;
  search: string;
  newValidation: string;
  st: Record<ConsoleValidationStatus, StatusCopy>;
  grp: Record<Tone, string>;
  openedOn: (d: string) => string;
  ctaConnect: string;
  ctaTalk: string;
  ctaDetails: string;
  mCountry: string;
  mCompany: string;
  mPress: string;
  mRef: string;
  trackTitle: string;
  tlSubmitted: string;
  tlReview: string;
  tlReviewSub: string;
  tlValidated: string;
  tlValidatedSub: string;
  tlEligible: string;
  tlEligibleSub: string;
  tlChanges: string;
  tlChangesSub: string;
  tlRejected: string;
  tlRejectedSub: string;
  convTitle: string;
  convEmpty: string;
  ourTeam: string;
  you: string;
  client: string;
  send: string;
  writeMsg: string;
  attach: string;
  sent: string;
  addComment: string;
  uploadStart: string;
  genericError: string;
  promptStrong: string;
  promptText: string;
  emptyText: string;
  emptyCta: string;
};

const COPY: Record<Locale, CCopy> = {
  en: {
    title: 'Console validations',
    presses: (n) => `${n} press${n > 1 ? 'es' : ''}`,
    eligible: (n) => `${n} eligible to connect`,
    all: 'All',
    search: 'Search a press…',
    newValidation: 'New validation',
    st: {
      submitted: { short: 'In review', long: 'In review' },
      in_review: { short: 'In review', long: 'In review' },
      changes_requested: { short: 'Changes', long: 'Changes requested' },
      can_be_connected: { short: 'Eligible', long: 'Eligible to connect' },
      rejected: { short: 'Not eligible', long: 'Not eligible' },
    },
    grp: { action: 'Changes', review: 'In review', green: 'Eligible', red: 'Not eligible' },
    openedOn: (d) => `Case opened ${d}`,
    ctaConnect: 'Connect the press',
    ctaTalk: 'Talk to our team',
    ctaDetails: 'Provide details',
    mCountry: 'Country',
    mCompany: 'Company',
    mPress: 'Press',
    mRef: 'Reference',
    trackTitle: 'Case timeline',
    tlSubmitted: 'Request submitted',
    tlReview: 'Under review by the Rutherford team',
    tlReviewSub: 'checking the ICC profile and press conditions',
    tlValidated: 'Profile validated',
    tlValidatedSub: 'compliant — press ready to connect',
    tlEligible: 'Eligible to connect',
    tlEligibleSub: 'Final step — connect the press to activate closed-loop tracking.',
    tlChanges: 'Changes requested',
    tlChangesSub: 'A few details are needed before we can continue.',
    tlRejected: 'Not eligible',
    tlRejectedSub: "This press isn't currently supported for closed-loop color.",
    convTitle: 'Conversation',
    convEmpty: 'No messages yet — write below and our team will get it.',
    ourTeam: 'Rutherford team',
    you: 'You',
    client: 'Customer',
    send: 'Send',
    writeMsg: 'Write a message…',
    attach: 'Attach a file',
    sent: 'Sent — our team has it ✓',
    addComment: 'Add a comment or at least one photo.',
    uploadStart: 'Upload could not start, please retry.',
    genericError: 'Something went wrong, please retry.',
    promptStrong: 'Complete your profile',
    promptText: 'add your name, company and role so we can tailor your support and reach you faster.',
    emptyText: 'You have no console validation requests yet.',
    emptyCta: 'Start a console validation',
  },
  fr: {
    title: 'Validation console',
    presses: (n) => `${n} presse${n > 1 ? 's' : ''}`,
    eligible: (n) => `${n} éligible${n > 1 ? 's' : ''} à connecter`,
    all: 'Tous',
    search: 'Rechercher une presse…',
    newValidation: 'Nouvelle validation',
    st: {
      submitted: { short: 'En revue', long: 'En revue' },
      in_review: { short: 'En revue', long: 'En revue' },
      changes_requested: { short: 'Modifs', long: 'Modifications demandées' },
      can_be_connected: { short: 'Éligible', long: 'Éligible à la connexion' },
      rejected: { short: 'Non éligible', long: 'Non éligible' },
    },
    grp: { action: 'Modifs', review: 'En cours', green: 'Éligibles', red: 'Non éligibles' },
    openedOn: (d) => `Dossier ouvert le ${d}`,
    ctaConnect: 'Connecter la presse',
    ctaTalk: 'Parler à notre équipe',
    ctaDetails: 'Fournir des détails',
    mCountry: 'Pays',
    mCompany: 'Société',
    mPress: 'Presse',
    mRef: 'Référence',
    trackTitle: 'Suivi du dossier',
    tlSubmitted: 'Demande soumise',
    tlReview: 'En revue par l’équipe Rutherford',
    tlReviewSub: 'vérification du profil ICC et des conditions presse',
    tlValidated: 'Profil validé',
    tlValidatedSub: 'conforme — presse prête à être connectée',
    tlEligible: 'Éligible à la connexion',
    tlEligibleSub: 'Dernière étape — connectez la presse pour activer le suivi en boucle fermée.',
    tlChanges: 'Modifications demandées',
    tlChangesSub: 'Quelques précisions sont nécessaires avant de continuer.',
    tlRejected: 'Non éligible',
    tlRejectedSub: 'Cette presse n’est pas prise en charge pour le closed-loop actuellement.',
    convTitle: 'Conversation',
    convEmpty: 'Aucun message pour l’instant — écrivez ci-dessous et notre équipe le recevra.',
    ourTeam: 'Équipe Rutherford',
    you: 'Vous',
    client: 'Client',
    send: 'Envoyer',
    writeMsg: 'Écrire un message…',
    attach: 'Joindre un fichier',
    sent: 'Envoyé — bien reçu ✓',
    addComment: 'Ajoutez un commentaire ou au moins une photo.',
    uploadStart: 'L’envoi n’a pas pu démarrer, veuillez réessayer.',
    genericError: 'Une erreur est survenue, veuillez réessayer.',
    promptStrong: 'Complétez votre profil',
    promptText: 'ajoutez votre nom, votre société et votre poste pour un support adapté et un contact plus rapide.',
    emptyText: 'Vous n’avez pas encore de demande de validation console.',
    emptyCta: 'Démarrer une validation console',
  },
  de: {
    title: 'Konsolenvalidierung',
    presses: (n) => `${n} Druckmaschine${n > 1 ? 'n' : ''}`,
    eligible: (n) => `${n} verbindungsbereit`,
    all: 'Alle',
    search: 'Maschine suchen…',
    newValidation: 'Neue Validierung',
    st: {
      submitted: { short: 'In Prüfung', long: 'In Prüfung' },
      in_review: { short: 'In Prüfung', long: 'In Prüfung' },
      changes_requested: { short: 'Änderungen', long: 'Änderungen angefragt' },
      can_be_connected: { short: 'Geeignet', long: 'Verbindungsbereit' },
      rejected: { short: 'Nicht geeignet', long: 'Nicht geeignet' },
    },
    grp: { action: 'Änderungen', review: 'In Prüfung', green: 'Geeignet', red: 'Nicht geeignet' },
    openedOn: (d) => `Fall eröffnet am ${d}`,
    ctaConnect: 'Maschine verbinden',
    ctaTalk: 'Mit unserem Team sprechen',
    ctaDetails: 'Details angeben',
    mCountry: 'Land',
    mCompany: 'Unternehmen',
    mPress: 'Druckmaschine',
    mRef: 'Referenz',
    trackTitle: 'Fallverlauf',
    tlSubmitted: 'Anfrage eingereicht',
    tlReview: 'In Prüfung durch das Rutherford-Team',
    tlReviewSub: 'Prüfung des ICC-Profils und der Druckbedingungen',
    tlValidated: 'Profil validiert',
    tlValidatedSub: 'konform — Maschine bereit zur Verbindung',
    tlEligible: 'Verbindungsbereit',
    tlEligibleSub: 'Letzter Schritt — verbinden Sie die Maschine, um die Closed-Loop-Überwachung zu aktivieren.',
    tlChanges: 'Änderungen angefragt',
    tlChangesSub: 'Vor dem Weitermachen sind einige Angaben nötig.',
    tlRejected: 'Nicht geeignet',
    tlRejectedSub: 'Diese Maschine wird derzeit nicht für Closed-Loop unterstützt.',
    convTitle: 'Konversation',
    convEmpty: 'Noch keine Nachrichten — schreiben Sie unten, unser Team erhält sie.',
    ourTeam: 'Rutherford-Team',
    you: 'Sie',
    client: 'Kunde',
    send: 'Senden',
    writeMsg: 'Nachricht schreiben…',
    attach: 'Datei anhängen',
    sent: 'Gesendet — beim Team angekommen ✓',
    addComment: 'Fügen Sie einen Kommentar oder mindestens ein Foto hinzu.',
    uploadStart: 'Der Upload konnte nicht starten, bitte erneut versuchen.',
    genericError: 'Etwas ist schiefgelaufen, bitte erneut versuchen.',
    promptStrong: 'Profil vervollständigen',
    promptText: 'Name, Unternehmen und Rolle ergänzen, damit wir den Support anpassen und Sie schneller erreichen.',
    emptyText: 'Sie haben noch keine Konsolenvalidierungs-Anfragen.',
    emptyCta: 'Konsolenvalidierung starten',
  },
  it: {
    title: 'Validazione console',
    presses: (n) => `${n} macchina${n > 1 ? '/e' : ''}`,
    eligible: (n) => `${n} idonea${n > 1 ? '/e' : ''} alla connessione`,
    all: 'Tutte',
    search: 'Cerca una macchina…',
    newValidation: 'Nuova validazione',
    st: {
      submitted: { short: 'In revisione', long: 'In revisione' },
      in_review: { short: 'In revisione', long: 'In revisione' },
      changes_requested: { short: 'Modifiche', long: 'Modifiche richieste' },
      can_be_connected: { short: 'Idonea', long: 'Idonea alla connessione' },
      rejected: { short: 'Non idonea', long: 'Non idonea' },
    },
    grp: { action: 'Modifiche', review: 'In corso', green: 'Idonee', red: 'Non idonee' },
    openedOn: (d) => `Pratica aperta il ${d}`,
    ctaConnect: 'Connetti la macchina',
    ctaTalk: 'Parla con il team',
    ctaDetails: 'Fornisci dettagli',
    mCountry: 'Paese',
    mCompany: 'Azienda',
    mPress: 'Macchina',
    mRef: 'Riferimento',
    trackTitle: 'Stato della pratica',
    tlSubmitted: 'Richiesta inviata',
    tlReview: 'In revisione dal team Rutherford',
    tlReviewSub: 'verifica del profilo ICC e delle condizioni di stampa',
    tlValidated: 'Profilo validato',
    tlValidatedSub: 'conforme — macchina pronta alla connessione',
    tlEligible: 'Idonea alla connessione',
    tlEligibleSub: 'Ultimo passo — connetta la macchina per attivare il controllo in closed-loop.',
    tlChanges: 'Modifiche richieste',
    tlChangesSub: 'Servono alcuni dettagli prima di continuare.',
    tlRejected: 'Non idonea',
    tlRejectedSub: 'Questa macchina non è attualmente supportata per il closed-loop.',
    convTitle: 'Conversazione',
    convEmpty: 'Ancora nessun messaggio — scriva qui sotto e il team lo riceverà.',
    ourTeam: 'Team Rutherford',
    you: 'Lei',
    client: 'Cliente',
    send: 'Invia',
    writeMsg: 'Scriva un messaggio…',
    attach: 'Allega un file',
    sent: 'Inviato — il team l’ha ricevuto ✓',
    addComment: 'Aggiunga un commento o almeno una foto.',
    uploadStart: 'Il caricamento non è partito, riprovi.',
    genericError: 'Si è verificato un errore, riprovi.',
    promptStrong: 'Completi il suo profilo',
    promptText: 'aggiunga nome, azienda e ruolo per un supporto su misura e un contatto più rapido.',
    emptyText: 'Non ha ancora richieste di validazione console.',
    emptyCta: 'Avvia una validazione console',
  },
  es: {
    title: 'Validación de consola',
    presses: (n) => `${n} prensa${n > 1 ? 's' : ''}`,
    eligible: (n) => `${n} apta${n > 1 ? 's' : ''} para conectar`,
    all: 'Todas',
    search: 'Buscar una prensa…',
    newValidation: 'Nueva validación',
    st: {
      submitted: { short: 'En revisión', long: 'En revisión' },
      in_review: { short: 'En revisión', long: 'En revisión' },
      changes_requested: { short: 'Cambios', long: 'Cambios solicitados' },
      can_be_connected: { short: 'Apta', long: 'Apta para conectar' },
      rejected: { short: 'No apta', long: 'No apta' },
    },
    grp: { action: 'Cambios', review: 'En curso', green: 'Aptas', red: 'No aptas' },
    openedOn: (d) => `Expediente abierto el ${d}`,
    ctaConnect: 'Conectar la prensa',
    ctaTalk: 'Hable con el equipo',
    ctaDetails: 'Aportar detalles',
    mCountry: 'País',
    mCompany: 'Empresa',
    mPress: 'Prensa',
    mRef: 'Referencia',
    trackTitle: 'Seguimiento del expediente',
    tlSubmitted: 'Solicitud enviada',
    tlReview: 'En revisión por el equipo Rutherford',
    tlReviewSub: 'verificación del perfil ICC y las condiciones de prensa',
    tlValidated: 'Perfil validado',
    tlValidatedSub: 'conforme — prensa lista para conectar',
    tlEligible: 'Apta para conectar',
    tlEligibleSub: 'Último paso — conecte la prensa para activar el seguimiento en closed-loop.',
    tlChanges: 'Cambios solicitados',
    tlChangesSub: 'Necesitamos algunos detalles antes de continuar.',
    tlRejected: 'No apta',
    tlRejectedSub: 'Esta prensa no es compatible con closed-loop por el momento.',
    convTitle: 'Conversación',
    convEmpty: 'Aún no hay mensajes — escriba abajo y nuestro equipo lo recibirá.',
    ourTeam: 'Equipo Rutherford',
    you: 'Usted',
    client: 'Cliente',
    send: 'Enviar',
    writeMsg: 'Escriba un mensaje…',
    attach: 'Adjuntar un archivo',
    sent: 'Enviado — el equipo lo tiene ✓',
    addComment: 'Añada un comentario o al menos una foto.',
    uploadStart: 'No se pudo iniciar la subida, inténtelo de nuevo.',
    genericError: 'Algo salió mal, inténtelo de nuevo.',
    promptStrong: 'Complete su perfil',
    promptText: 'añada su nombre, empresa y puesto para un soporte a medida y un contacto más rápido.',
    emptyText: 'Aún no tiene solicitudes de validación de consola.',
    emptyCta: 'Iniciar una validación de consola',
  },
};

const FILTER_ORDER: Tone[] = ['green', 'review', 'action', 'red'];

function fmt(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

const listTitle = (r: ConsoleValidationRow) => r.machine || r.company || 'Console';
const listSub = (r: ConsoleValidationRow) =>
  [r.company, r.country ? `${countryFlag(r.country)} ${r.country}`.trim() : ''].filter(Boolean).join(' · ');

type TLState = 'done' | 'current' | 'amber' | 'rejected' | 'pending';

function buildTimeline(r: ConsoleValidationRow, c: CCopy, locale: Locale): { label: string; sub: string; state: TLState }[] {
  const steps: { label: string; sub: string; state: TLState }[] = [];
  steps.push({ label: c.tlSubmitted, sub: fmt(r.createdAt, locale), state: 'done' });

  const reviewState: TLState = r.status === 'submitted' ? 'pending' : r.status === 'in_review' ? 'current' : 'done';
  const reviewSub =
    reviewState === 'done' && r.reviewedAt ? `${fmt(r.reviewedAt, locale)} · ${c.tlReviewSub}` : c.tlReviewSub;
  steps.push({ label: c.tlReview, sub: reviewSub, state: reviewState });

  if (r.status === 'can_be_connected') {
    steps.push({
      label: c.tlValidated,
      sub: r.reviewedAt ? `${fmt(r.reviewedAt, locale)} · ${c.tlValidatedSub}` : c.tlValidatedSub,
      state: 'done',
    });
    steps.push({ label: c.tlEligible, sub: c.tlEligibleSub, state: 'current' });
  } else if (r.status === 'changes_requested') {
    steps.push({ label: c.tlChanges, sub: c.tlChangesSub, state: 'amber' });
  } else if (r.status === 'rejected') {
    steps.push({ label: c.tlRejected, sub: c.tlRejectedSub, state: 'rejected' });
  } else {
    steps.push({ label: c.tlEligible, sub: c.tlEligibleSub, state: 'pending' });
  }
  return steps;
}

function CardPill({ status, c }: { status: ConsoleValidationStatus; c: CCopy }) {
  const tone = GROUP_OF[status];
  return (
    <span className={`cvx-pill cvx-t-${tone}`}>
      <span className="cvx-pill-dot" />
      {c.st[status].short}
    </span>
  );
}

export function ConsoleValidationsPortal({
  rows,
  profileComplete,
  canInvite = false,
  invitations = [],
  messages = [],
  viewerIsTeam = false,
}: {
  rows: ConsoleValidationRow[];
  profileComplete: boolean;
  canInvite?: boolean;
  invitations?: CvInviteItem[];
  messages?: CvMessage[];
  viewerIsTeam?: boolean;
}) {
  const router = useRouter();
  const { locale } = useLanguage();
  const c = COPY[locale];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Tone | null>(null);
  const [query, setQuery] = useState('');

  // Conversation composer state (logic unchanged).
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [replyComment, setReplyComment] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replied, setReplied] = useState(false);
  const [dragging, setDragging] = useState(false);

  const counts: Record<Tone, number> = { action: 0, review: 0, green: 0, red: 0 };
  rows.forEach((r) => {
    counts[GROUP_OF[r.status]] += 1;
  });

  const q = query.trim().toLowerCase();
  const visibleRows = rows.filter((r) => {
    if (filter && GROUP_OF[r.status] !== filter) return false;
    if (q && !`${r.machine ?? ''} ${r.company ?? ''} ${r.country ?? ''}`.toLowerCase().includes(q)) return false;
    return true;
  });

  // Default selection = first "Action needed", else most recent — within what's visible.
  const defaultSel = visibleRows.find((r) => GROUP_OF[r.status] === 'action') ?? visibleRows[0] ?? rows[0];
  const selected = visibleRows.find((r) => r.id === selectedId) ?? defaultSel;

  useEffect(() => {
    setReplied(false);
    setReplyFiles([]);
    setReplyComment('');
    setReplyError(null);
    setDragging(false);
  }, [selected?.id]);

  const addReplyFiles = (files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setReplyFiles((current) => [...current, ...images].slice(0, 9));
  };

  const handleReply = async () => {
    if (sending || !selected) return;
    if (!replyComment.trim() && replyFiles.length === 0) {
      setReplyError(c.addComment);
      return;
    }
    setSending(true);
    setReplyError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const uploadId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const photos: { path: string }[] = [];
      let i = 0;
      for (const file of replyFiles.slice(0, 9)) {
        i += 1;
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const urlRes = await fetch('/api/console-validation/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uploadId, field: `reply${i}`, ext, contentType: file.type }),
        });
        if (!urlRes.ok) throw new Error(c.uploadStart);
        const { path, token } = await urlRes.json();
        const { error } = await supabase.storage.from('console-validations').uploadToSignedUrl(path, token, file);
        if (error) throw new Error(`Upload failed: ${error.message}`);
        photos.push({ path });
      }
      const res = await fetch(`/api/console-validation/${selected.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: replyComment, photos }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => null);
        throw new Error(b?.error ?? c.genericError);
      }
      setReplied(true);
      setReplyFiles([]);
      setReplyComment('');
      router.refresh();
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : c.genericError);
    } finally {
      setSending(false);
    }
  };

  const prompt = !profileComplete ? (
    <a href="/account/profile" className="cvp-profile-prompt">
      <span className="cvp-profile-prompt-dot" />
      <span className="cvp-profile-prompt-text">
        <strong>{c.promptStrong}</strong> — {c.promptText}
      </span>
      <span className="cvp-chev">›</span>
    </a>
  ) : null;

  if (rows.length === 0) {
    return (
      <main className="page-shell">
        <SiteNav current="account" />
        <AccountSubnav current="console" />
        <section className="section profile-section">
          <div className="container cvx-shell">
            <div className="cvx-head">
              <h1 className="profile-h1">{c.title}</h1>
            </div>
            {prompt}
            {canInvite ? <CvInvite invitations={invitations} /> : null}
            <div className="cvx-empty">
              <p>{c.emptyText}</p>
              <a className="button button-accent" href="/console-validation">
                {c.emptyCta}
              </a>
            </div>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const selectedMessages = messages.filter((msg) => msg.validationId === selected.id);
  const canReply = CAN_REPLY.includes(selected.status);
  const tone = GROUP_OF[selected.status];
  const timeline = buildTimeline(selected, c, locale);
  const headerCta =
    selected.status === 'can_be_connected'
      ? c.ctaConnect
      : selected.status === 'changes_requested'
        ? c.ctaDetails
        : c.ctaTalk;
  const mailto = `mailto:${SUPPORT}?subject=${encodeURIComponent(
    `${c.title} — ${selected.reference || listTitle(selected)}`
  )}`;

  return (
    <main className="page-shell">
      <SiteNav current="account" />
      <AccountSubnav current="console" />
      <section className="section profile-section">
        <div className="container cvx-shell">
          <div className="cvx-head">
            <h1 className="profile-h1">{c.title}</h1>
            <p className="cvx-count">
              {c.presses(rows.length)}
              {counts.green ? (
                <>
                  {' · '}
                  <strong className="cvx-count-ok">{c.eligible(counts.green)}</strong>
                </>
              ) : null}
            </p>
          </div>

          {prompt}
          {canInvite ? <CvInvite invitations={invitations} /> : null}

          <div className="cvx-toolbar">
            <div className="cvx-filters">
              <button
                type="button"
                className={`cvx-filter${filter === null ? ' is-on' : ''}`}
                onClick={() => setFilter(null)}
              >
                {c.all} · {rows.length}
              </button>
              {FILTER_ORDER.filter((g) => counts[g]).map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`cvx-filter cvx-t-${g}${filter === g ? ' is-on' : ''}`}
                  onClick={() => setFilter(filter === g ? null : g)}
                >
                  <span className="cvx-filter-dot" />
                  {c.grp[g]} · {counts[g]}
                </button>
              ))}
            </div>
            <div className="cvx-tools">
              <div className="cvx-search">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.2-3.2" />
                </svg>
                <input
                  type="search"
                  placeholder={c.search}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label={c.search}
                />
              </div>
              <a className="cvx-new" href="/console-validation">
                <span className="cvx-new-plus">+</span> {c.newValidation}
              </a>
            </div>
          </div>

          <div className="cvx-main">
            <aside className="cvx-list">
              {visibleRows.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`cvx-item${r.id === selected.id ? ' is-active' : ''}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <span className="cvx-item-top">
                    <span className="cvx-item-name">{listTitle(r)}</span>
                    <CardPill status={r.status} c={c} />
                  </span>
                  <span className="cvx-item-sub">{listSub(r)}</span>
                </button>
              ))}
            </aside>

            <section className="cvx-detail">
              <div className="cvx-dhead">
                <div className="cvx-dhead-main">
                  <h2 className="cvx-dtitle">{listTitle(selected)}</h2>
                  <span className={`cvx-pill cvx-t-${tone} cvx-pill-lg`}>
                    <span className="cvx-pill-dot" />
                    {c.st[selected.status].long}
                  </span>
                  <p className="cvx-dsub">
                    {[selected.company, selected.country].filter(Boolean).join(' · ')}
                    {selected.company || selected.country ? ' · ' : ''}
                    {c.openedOn(fmt(selected.createdAt, locale))}
                  </p>
                </div>
                <a className="cvx-connect" href={mailto}>
                  {headerCta}
                  <span className="cvx-connect-arrow">→</span>
                </a>
              </div>

              <div className="cvx-meta">
                {[
                  [c.mCountry, selected.country ? `${countryFlag(selected.country)} ${selected.country}`.trim() : selected.country],
                  [c.mCompany, selected.company],
                  [c.mPress, selected.machine],
                  [c.mRef, selected.reference],
                ].map(([k, v]) => (
                  <div key={k} className="cvx-meta-cell">
                    <span className="cvx-meta-k">{k}</span>
                    <span className="cvx-meta-v">{v || '—'}</span>
                  </div>
                ))}
              </div>

              <h3 className="cvx-track-h">{c.trackTitle}</h3>
              <div className="cvx-timeline">
                {timeline.map((s, i) => {
                  const last = i === timeline.length - 1;
                  return (
                    <div key={i} className="cvx-tl-row">
                      <div className="cvx-tl-rail">
                        <span className={`cvx-tl-dot is-${s.state}`} />
                        {!last ? <span className={`cvx-tl-line${s.state === 'done' ? ' is-on' : ''}`} /> : null}
                      </div>
                      <div className={`cvx-tl-body${last ? ' is-last' : ''}`}>
                        <div className={`cvx-tl-label is-${s.state}`}>{s.label}</div>
                        <div className="cvx-tl-sub">{s.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="sup2-thread">
                {selectedMessages.length > 0 ? (
                  selectedMessages.map((msg, i) => {
                    const team = msg.author === 'team';
                    const customerName = viewerIsTeam ? selected.company || c.client : c.you;
                    const name = team ? c.ourTeam : customerName;
                    const av = team ? 'R' : (customerName[0] ?? '?').toUpperCase();
                    return (
                      <div key={i} className="sup2-msg">
                        <span className={`sup2-av${team ? ' is-team' : ''}`}>{av}</span>
                        <div className="sup2-msg-main">
                          <div className="sup2-msg-h">
                            <span className="sup2-name">{name}</span>
                            <span className="sup2-date">{fmt(msg.createdAt, locale)}</span>
                          </div>
                          <div className={`sup2-bubble${team ? ' is-team' : ''}`}>
                            {msg.body ? <p>{msg.body}</p> : null}
                            {msg.photos.length > 0 ? (
                              <div className="sup-msg-photos">
                                {msg.photos.map((url, j) => (
                                  <a key={j} href={url} target="_blank" rel="noreferrer">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt="" />
                                  </a>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="sup-chat-empty">{c.convEmpty}</p>
                )}
              </div>

              {canReply ? (
                <div
                  className={`sup2-reply${dragging ? ' is-dragging' : ''}`}
                  onDragOver={(e: DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    if (!dragging) setDragging(true);
                  }}
                  onDragLeave={(e: DragEvent<HTMLDivElement>) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                    setDragging(false);
                  }}
                  onDrop={(e: DragEvent<HTMLDivElement>) => {
                    e.preventDefault();
                    setDragging(false);
                    addReplyFiles(e.dataTransfer.files);
                  }}
                >
                  {replied ? <p className="sup-compose-sent">{c.sent}</p> : null}
                  {replyFiles.length > 0 ? (
                    <div className="sup-compose-files">
                      {replyFiles.map((f, i) => (
                        <span key={i} className="cvp-file-chip">
                          {f.name}
                          <button type="button" aria-label="Remove" onClick={() => setReplyFiles((cur) => cur.filter((_, j) => j !== i))}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {replyError ? (
                    <p className="cvp-reply-error" role="alert">
                      {replyError}
                    </p>
                  ) : null}
                  <textarea
                    className="sup2-reply-text"
                    rows={2}
                    placeholder={c.writeMsg}
                    value={replyComment}
                    onChange={(e) => setReplyComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                    disabled={sending}
                  />
                  <div className="sup2-reply-row">
                    <label className="sup2-reply-attach" title={c.attach}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          addReplyFiles(e.target.files);
                          e.currentTarget.value = '';
                        }}
                      />
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21.4 11.05 12.25 20.2a5 5 0 0 1-7.07-7.07l9.19-9.19a3 3 0 0 1 4.24 4.24l-9.2 9.19a1 1 0 0 1-1.41-1.41l8.49-8.49" />
                      </svg>
                      {c.attach}
                    </label>
                    <button type="button" className="sup2-reply-send" disabled={sending} onClick={handleReply}>
                      {sending ? '…' : c.send}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sup-chat-closed">
                  {c.st[selected.status].long}{' '}
                  <a href={mailto}>{headerCta} →</a>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
