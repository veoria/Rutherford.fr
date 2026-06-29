'use client';

import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { AccountSubnav } from '@/components/account-subnav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export type SupportStatus = 'new' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

export type SupportMessage = {
  author: 'team' | 'customer';
  body: string | null;
  photos: string[];
  createdAt: string;
};

export type SupportRow = {
  id: string;
  reference: string;
  company: string | null;
  subject: string | null;
  anydesk: string | null;
  description: string;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  photos: string[];
  customerReplyAt: string | null;
  agentMessage: string | null;
  agentMessageAt: string | null;
  assigneeName: string | null;
  messages: SupportMessage[];
};

// Tickets where the customer can still add details (anything but a closed one).
const CAN_REPLY: SupportStatus[] = ['new', 'in_progress', 'waiting_customer', 'resolved'];

type Tone = 'review' | 'action' | 'neutral';

type StatusMeta = { short: string; long: string; tone: Tone; check?: boolean };

type SCopy = {
  eyebrow: string;
  title: string;
  sub: string;
  newRequest: string;
  updatedOn: string;
  openedOn: string;
  you: string;
  client: string;
  ourTeam: string;
  convEmpty: string;
  send: string;
  writeReply: string;
  attach: string;
  sent: string;
  addComment: string;
  uploadStart: string;
  genericError: string;
  closedNote: string;
  closedLink: string;
  emptyText: string;
  emptyCta: string;
  st: Record<SupportStatus, StatusMeta>;
  help: { title: string; desc: string }[];
};

const COPY: Record<Locale, SCopy> = {
  en: {
    eyebrow: 'Partner area',
    title: 'Support',
    sub: 'Your assistance requests and Rutherford help.',
    newRequest: 'New request',
    updatedOn: 'updated',
    openedOn: 'opened',
    you: 'You',
    client: 'Customer',
    ourTeam: 'Rutherford team',
    convEmpty: 'No messages yet — write below and our team will get it.',
    send: 'Send',
    writeReply: 'Write a reply…',
    attach: 'Attach a file',
    sent: 'Sent — our team has it ✓',
    addComment: 'Add a comment or at least one photo.',
    uploadStart: 'Upload could not start, please retry.',
    genericError: 'Something went wrong, please retry.',
    closedNote: 'This ticket is closed.',
    closedLink: 'Open a new request →',
    emptyText: 'You have no support requests yet.',
    emptyCta: 'Open a support request',
    st: {
      new: { short: 'In progress', long: 'In progress', tone: 'review' },
      in_progress: { short: 'In progress', long: 'In progress', tone: 'review' },
      waiting_customer: { short: 'Waiting', long: 'Waiting for your reply', tone: 'action' },
      resolved: { short: 'Resolved', long: 'Resolved', tone: 'neutral', check: true },
      closed: { short: 'Closed', long: 'Closed', tone: 'neutral' },
    },
    help: [
      { title: 'Help center', desc: 'Offset & ColorLoop guides, FAQ and best practices.' },
      { title: 'Chat with an expert', desc: 'Monday to Friday, on business days.' },
      { title: 'Press support', desc: 'Priority for makeready and production emergencies.' },
    ],
  },
  fr: {
    eyebrow: 'Espace partenaire',
    title: 'Support',
    sub: 'Vos demandes d’assistance et l’aide Rutherford.',
    newRequest: 'Nouvelle demande',
    updatedOn: 'mis à jour le',
    openedOn: 'ouvert le',
    you: 'Vous',
    client: 'Client',
    ourTeam: 'Équipe Rutherford',
    convEmpty: 'Aucun message pour l’instant — écrivez ci-dessous et notre équipe le recevra.',
    send: 'Envoyer',
    writeReply: 'Écrire une réponse…',
    attach: 'Joindre un fichier',
    sent: 'Envoyé — bien reçu ✓',
    addComment: 'Ajoutez un commentaire ou au moins une photo.',
    uploadStart: 'L’envoi n’a pas pu démarrer, veuillez réessayer.',
    genericError: 'Une erreur est survenue, veuillez réessayer.',
    closedNote: 'Ce ticket est clos.',
    closedLink: 'Ouvrir une nouvelle demande →',
    emptyText: 'Vous n’avez pas encore de demande d’assistance.',
    emptyCta: 'Ouvrir une demande',
    st: {
      new: { short: 'En cours', long: 'En cours', tone: 'review' },
      in_progress: { short: 'En cours', long: 'En cours', tone: 'review' },
      waiting_customer: { short: 'En attente', long: 'En attente de votre réponse', tone: 'action' },
      resolved: { short: 'Résolu', long: 'Résolu', tone: 'neutral', check: true },
      closed: { short: 'Clos', long: 'Clos', tone: 'neutral' },
    },
    help: [
      { title: 'Centre d’aide', desc: 'Guides offset & ColorLoop, FAQ et bonnes pratiques.' },
      { title: 'Chat avec un expert', desc: 'Du lundi au vendredi, en jours ouvrés.' },
      { title: 'Assistance presse', desc: 'Urgences calage et production prioritaires.' },
    ],
  },
  de: {
    eyebrow: 'Partnerbereich',
    title: 'Support',
    sub: 'Ihre Supportanfragen und die Rutherford-Hilfe.',
    newRequest: 'Neue Anfrage',
    updatedOn: 'aktualisiert am',
    openedOn: 'eröffnet am',
    you: 'Sie',
    client: 'Kunde',
    ourTeam: 'Rutherford-Team',
    convEmpty: 'Noch keine Nachrichten — schreiben Sie unten, unser Team erhält sie.',
    send: 'Senden',
    writeReply: 'Antwort schreiben…',
    attach: 'Datei anhängen',
    sent: 'Gesendet — beim Team angekommen ✓',
    addComment: 'Fügen Sie einen Kommentar oder mindestens ein Foto hinzu.',
    uploadStart: 'Der Upload konnte nicht starten, bitte erneut versuchen.',
    genericError: 'Etwas ist schiefgelaufen, bitte erneut versuchen.',
    closedNote: 'Dieses Ticket ist geschlossen.',
    closedLink: 'Neue Anfrage öffnen →',
    emptyText: 'Sie haben noch keine Supportanfragen.',
    emptyCta: 'Supportanfrage öffnen',
    st: {
      new: { short: 'In Bearbeitung', long: 'In Bearbeitung', tone: 'review' },
      in_progress: { short: 'In Bearbeitung', long: 'In Bearbeitung', tone: 'review' },
      waiting_customer: { short: 'Wartet', long: 'Wartet auf Ihre Antwort', tone: 'action' },
      resolved: { short: 'Gelöst', long: 'Gelöst', tone: 'neutral', check: true },
      closed: { short: 'Geschlossen', long: 'Geschlossen', tone: 'neutral' },
    },
    help: [
      { title: 'Hilfe-Center', desc: 'Offset- & ColorLoop-Leitfäden, FAQ und Best Practices.' },
      { title: 'Chat mit einem Experten', desc: 'Montag bis Freitag, an Werktagen.' },
      { title: 'Maschinen-Support', desc: 'Vorrang bei Einricht- und Produktionsnotfällen.' },
    ],
  },
  it: {
    eyebrow: 'Area partner',
    title: 'Support',
    sub: 'Le sue richieste di assistenza e l’aiuto Rutherford.',
    newRequest: 'Nuova richiesta',
    updatedOn: 'aggiornato il',
    openedOn: 'aperto il',
    you: 'Lei',
    client: 'Cliente',
    ourTeam: 'Team Rutherford',
    convEmpty: 'Ancora nessun messaggio — scriva qui sotto e il team lo riceverà.',
    send: 'Invia',
    writeReply: 'Scriva una risposta…',
    attach: 'Allega un file',
    sent: 'Inviato — il team l’ha ricevuto ✓',
    addComment: 'Aggiunga un commento o almeno una foto.',
    uploadStart: 'Il caricamento non è partito, riprovi.',
    genericError: 'Si è verificato un errore, riprovi.',
    closedNote: 'Questo ticket è chiuso.',
    closedLink: 'Apri una nuova richiesta →',
    emptyText: 'Non ha ancora richieste di assistenza.',
    emptyCta: 'Apri una richiesta',
    st: {
      new: { short: 'In corso', long: 'In corso', tone: 'review' },
      in_progress: { short: 'In corso', long: 'In corso', tone: 'review' },
      waiting_customer: { short: 'In attesa', long: 'In attesa della sua risposta', tone: 'action' },
      resolved: { short: 'Risolto', long: 'Risolto', tone: 'neutral', check: true },
      closed: { short: 'Chiuso', long: 'Chiuso', tone: 'neutral' },
    },
    help: [
      { title: 'Centro assistenza', desc: 'Guide offset & ColorLoop, FAQ e buone pratiche.' },
      { title: 'Chat con un esperto', desc: 'Dal lunedì al venerdì, nei giorni lavorativi.' },
      { title: 'Assistenza macchina', desc: 'Priorità per emergenze di avviamento e produzione.' },
    ],
  },
  es: {
    eyebrow: 'Área de partner',
    title: 'Support',
    sub: 'Sus solicitudes de asistencia y la ayuda de Rutherford.',
    newRequest: 'Nueva solicitud',
    updatedOn: 'actualizado el',
    openedOn: 'abierto el',
    you: 'Usted',
    client: 'Cliente',
    ourTeam: 'Equipo Rutherford',
    convEmpty: 'Aún no hay mensajes — escriba abajo y nuestro equipo lo recibirá.',
    send: 'Enviar',
    writeReply: 'Escriba una respuesta…',
    attach: 'Adjuntar un archivo',
    sent: 'Enviado — el equipo lo tiene ✓',
    addComment: 'Añada un comentario o al menos una foto.',
    uploadStart: 'No se pudo iniciar la subida, inténtelo de nuevo.',
    genericError: 'Algo salió mal, inténtelo de nuevo.',
    closedNote: 'Este ticket está cerrado.',
    closedLink: 'Abrir una nueva solicitud →',
    emptyText: 'Aún no tiene solicitudes de asistencia.',
    emptyCta: 'Abrir una solicitud',
    st: {
      new: { short: 'En curso', long: 'En curso', tone: 'review' },
      in_progress: { short: 'En curso', long: 'En curso', tone: 'review' },
      waiting_customer: { short: 'En espera', long: 'En espera de su respuesta', tone: 'action' },
      resolved: { short: 'Resuelto', long: 'Resuelto', tone: 'neutral', check: true },
      closed: { short: 'Cerrado', long: 'Cerrado', tone: 'neutral' },
    },
    help: [
      { title: 'Centro de ayuda', desc: 'Guías offset & ColorLoop, FAQ y buenas prácticas.' },
      { title: 'Chat con un experto', desc: 'De lunes a viernes, en días laborables.' },
      { title: 'Asistencia de prensa', desc: 'Prioridad para urgencias de puesta a punto y producción.' },
    ],
  },
  pt: {
    eyebrow: 'Área de parceiro',
    title: 'Support',
    sub: 'Os seus pedidos de assistência e a ajuda Rutherford.',
    newRequest: 'Novo pedido',
    updatedOn: 'atualizado a',
    openedOn: 'aberto a',
    you: 'Você',
    client: 'Cliente',
    ourTeam: 'Equipa Rutherford',
    convEmpty: 'Ainda não há mensagens. Escreva abaixo e a nossa equipa irá recebê-la.',
    send: 'Enviar',
    writeReply: 'Escreva uma resposta…',
    attach: 'Anexar um ficheiro',
    sent: 'Enviado, a nossa equipa recebeu ✓',
    addComment: 'Adicione um comentário ou pelo menos uma foto.',
    uploadStart: 'Não foi possível iniciar o envio, tente novamente.',
    genericError: 'Ocorreu um erro, tente novamente.',
    closedNote: 'Este pedido está fechado.',
    closedLink: 'Abrir um novo pedido →',
    emptyText: 'Ainda não tem pedidos de assistência.',
    emptyCta: 'Abrir um pedido de assistência',
    st: {
      new: { short: 'Em curso', long: 'Em curso', tone: 'review' },
      in_progress: { short: 'Em curso', long: 'Em curso', tone: 'review' },
      waiting_customer: { short: 'A aguardar', long: 'A aguardar a sua resposta', tone: 'action' },
      resolved: { short: 'Resolvido', long: 'Resolvido', tone: 'neutral', check: true },
      closed: { short: 'Fechado', long: 'Fechado', tone: 'neutral' },
    },
    help: [
      { title: 'Centro de ajuda', desc: 'Guias offset & ColorLoop, FAQ e boas práticas.' },
      { title: 'Conversar com um especialista', desc: 'De segunda a sexta, em dias úteis.' },
      { title: 'Assistência à máquina', desc: 'Prioridade para urgências de acerto e produção.' },
    ],
  },
};

const HELP_LINKS = ['/blog', 'mailto:contact@rutherford.fr', 'mailto:contact@rutherford.fr?subject=Assistance%20presse'];

function HelpIcon({ i }: { i: number }) {
  if (i === 0) {
    return (
      <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#0071e3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3" />
        <path d="M12 17h.01" />
      </svg>
    );
  }
  if (i === 1) {
    return (
      <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#0071e3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16v12H7l-3 3z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#0071e3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

function fmt(iso: string, locale: Locale): string {
  try {
    return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);
const baseTitle = (r: SupportRow) => (r.subject?.trim() || r.description.split('\n')[0]?.trim() || 'Support') as string;

function StatusPill({ meta, lg }: { meta: StatusMeta; lg?: boolean }) {
  return (
    <span className={`cvx-pill cvx-t-${meta.tone}${lg ? ' cvx-pill-lg' : ''}`}>
      {meta.check ? (
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <span className="cvx-pill-dot" />
      )}
      {lg ? meta.long : meta.short}
    </span>
  );
}

export function SupportPortal({ rows, viewerIsTeam = false }: { rows: SupportRow[]; viewerIsTeam?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const c = COPY[locale];
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Chat composer state (logic unchanged).
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [replyComment, setReplyComment] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replied, setReplied] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Deep-link: /account/support?t=<id or 8-char reference> opens that ticket.
  const deepLinkId = useMemo(() => {
    const t = searchParams.get('t');
    if (!t) return null;
    return rows.find((r) => r.id === t || r.id.startsWith(t) || r.reference.replace(/^#/, '') === t)?.id ?? null;
  }, [searchParams, rows]);

  const defaultSel = rows.find((r) => r.status === 'waiting_customer') ?? rows[0];
  const selected = rows.find((r) => r.id === (selectedId ?? deepLinkId)) ?? defaultSel;

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
      const res = await fetch(`/api/support/${selected.id}/reply`, {
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

  const helpCards = (
    <div className="sup2-help-grid">
      {c.help.map((h, i) => (
        <a key={i} className="sup2-help" href={HELP_LINKS[i]}>
          <span className="sup2-help-icon">
            <HelpIcon i={i} />
          </span>
          <h3 className="sup2-help-title">{h.title}</h3>
          <p className="sup2-help-desc">{h.desc}</p>
        </a>
      ))}
    </div>
  );

  if (rows.length === 0) {
    return (
      <main className="page-shell">
        <SiteNav current="account" />
        <AccountSubnav current="support" />
        <section className="section profile-section">
          <div className="container cvx-shell">
            <div className="team-head">
              <div>
                <p className="profile-eyebrow">{c.eyebrow}</p>
                <h1 className="profile-h1">{c.title}</h1>
                <p className="profile-sub">{c.sub}</p>
              </div>
              <a className="team-invite-cta" href="/support">
                <span className="team-invite-cta-plus">+</span> {c.newRequest}
              </a>
            </div>
            <div className="cvx-empty">
              <p>{c.emptyText}</p>
              <a className="button button-accent" href="/support">
                {c.emptyCta}
              </a>
            </div>
            {helpCards}
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const meta = c.st[selected.status];
  const thread: SupportMessage[] = [];
  if (selected.description.trim() || selected.photos.length) {
    thread.push({ author: 'customer', body: selected.description || null, photos: selected.photos, createdAt: selected.createdAt });
  }
  thread.push(...selected.messages);

  return (
    <main className="page-shell">
      <SiteNav current="account" />
      <AccountSubnav current="support" />
      <section className="section profile-section">
        <div className="container cvx-shell">
          <div className="team-head">
            <div>
              <p className="profile-eyebrow">{c.eyebrow}</p>
              <h1 className="profile-h1">{c.title}</h1>
              <p className="profile-sub">{c.sub}</p>
            </div>
            <a className="team-invite-cta" href="/support">
              <span className="team-invite-cta-plus">+</span> {c.newRequest}
            </a>
          </div>

          <div className="cvx-main">
            <aside className="cvx-list">
              {rows.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`cvx-item${r.id === selected.id ? ' is-active' : ''}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <span className="cvx-item-top">
                    <span className="cvx-item-name">{truncate(baseTitle(r), 42)}</span>
                    <StatusPill meta={c.st[r.status]} />
                  </span>
                  <span className="cvx-item-sub">
                    {r.reference} · {c.updatedOn} {fmt(r.updatedAt, locale)}
                  </span>
                </button>
              ))}
            </aside>

            <section className="cvx-detail">
              <div className="cvx-dhead">
                <div className="cvx-dhead-main">
                  <h2 className="cvx-dtitle">{truncate(baseTitle(selected), 80)}</h2>
                  <p className="cvx-dsub">
                    {selected.reference} · {c.openedOn} {fmt(selected.createdAt, locale)}
                    {selected.company ? ` · ${selected.company}` : ''}
                  </p>
                </div>
                <StatusPill meta={meta} lg />
              </div>

              <div className="sup2-thread">
                {thread.length > 0 ? (
                  thread.map((msg, i) => {
                    const team = msg.author === 'team';
                    // Customer side shows the client when a team member is viewing,
                    // and "You" when the customer is viewing their own ticket.
                    const customerName = viewerIsTeam ? selected.company || c.client : c.you;
                    const name = team ? selected.assigneeName ?? c.ourTeam : customerName;
                    const av = team
                      ? (selected.assigneeName?.[0] ?? 'R').toUpperCase()
                      : (customerName[0] ?? '?').toUpperCase();
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

              {CAN_REPLY.includes(selected.status) ? (
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
                    placeholder={c.writeReply}
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
                  {c.closedNote} <a href="/support">{c.closedLink}</a>
                </div>
              )}
            </section>
          </div>

          {helpCards}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
