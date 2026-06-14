'use client';

import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { AccountSubnav } from '@/components/account-subnav';
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

type Tone = 'action' | 'review' | 'green' | 'neutral';

const GROUP_OF: Record<SupportStatus, Tone> = {
  new: 'review',
  in_progress: 'review',
  waiting_customer: 'action',
  resolved: 'green',
  closed: 'neutral',
};

type Meta = {
  label: string;
  pill: 'neutral' | 'review' | 'action' | 'green';
  desc: string;
  action: string;
};

const META: Record<SupportStatus, Meta> = {
  new: {
    label: 'Received',
    pill: 'neutral',
    desc: 'Your request is in the queue — our team will pick it up shortly.',
    action: 'Add details',
  },
  in_progress: {
    label: 'In progress',
    pill: 'review',
    desc: 'Our team is working on your ticket.',
    action: 'Add details',
  },
  waiting_customer: {
    label: 'Action needed',
    pill: 'action',
    desc: 'We need a few details from you to move forward.',
    action: 'Reply now',
  },
  resolved: {
    label: 'Resolved',
    pill: 'green',
    desc: 'We’ve marked this ticket as resolved. Reply if anything is still off.',
    action: 'Reopen / reply',
  },
  closed: {
    label: 'Closed',
    pill: 'neutral',
    desc: 'This ticket is closed. You can open a new request anytime.',
    action: 'Open a new request',
  },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);
const baseTitle = (r: SupportRow) =>
  (r.subject?.trim() || r.description.split('\n')[0]?.trim() || 'Support ticket') as string;
const listTitle = (r: SupportRow) => truncate(baseTitle(r), 48);
const fullTitle = (r: SupportRow) => truncate(baseTitle(r), 80);

function StatusPill({ status }: { status: SupportStatus }) {
  const m = META[status];
  return (
    <span className={`cvp-pill cvp-t-${m.pill}`}>
      <span className="cvp-pdot" />
      {m.label}
    </span>
  );
}

type TimelineItem = { date?: string; label: string; state: 'done' | 'current' | 'future'; tone?: 'amber' | 'blue' };

function timelineFor(r: SupportRow): TimelineItem[] {
  const ev: TimelineItem[] = [
    { date: formatDate(r.createdAt), label: 'Request submitted', state: 'done' },
    { label: `Received — reference ${r.reference} assigned`, state: 'done' },
  ];
  if (r.customerReplyAt) {
    ev.push({ label: 'You added details', date: formatDate(r.customerReplyAt), state: 'done' });
  }
  if (r.agentMessageAt) {
    ev.push({ label: 'Message from our team', date: formatDate(r.agentMessageAt), state: 'done', tone: 'blue' });
  }
  if (r.status === 'new') {
    ev.push({ label: 'Awaiting a support agent', state: 'current', tone: 'blue' });
    ev.push({ label: 'Resolution', state: 'future' });
  } else if (r.status === 'in_progress') {
    ev.push({ label: 'Being handled by our team', state: 'current', tone: 'blue' });
    ev.push({ label: 'Resolution', state: 'future' });
  } else if (r.status === 'waiting_customer') {
    ev.push({ label: 'Waiting on your reply', date: formatDate(r.updatedAt), state: 'current', tone: 'amber' });
    ev.push({ label: 'Resolution', state: 'future' });
  } else if (r.status === 'resolved') {
    ev.push({ label: 'Resolved', date: formatDate(r.updatedAt), state: 'done' });
  } else if (r.status === 'closed') {
    ev.push({ label: 'Closed', date: formatDate(r.updatedAt), state: 'done' });
  }
  return ev;
}

function PageHead() {
  return (
    <div className="cvp-head">
      <div className="cvp-eyebrow">Your account</div>
      <h1 className="cvp-title">Your support tickets</h1>
      <p className="cvp-intro">
        Follow every support request you have opened and its current status. Reply to add details or photos —
        our team is notified straight away.
      </p>
    </div>
  );
}

export function SupportPortal({ rows }: { rows: SupportRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Chat composer state.
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [replyComment, setReplyComment] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replied, setReplied] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Default selection = first "Action needed", else the most recent.
  // Deep-link: /account/support?t=<id or 8-char reference> opens that ticket.
  const deepLinkId = useMemo(() => {
    const t = searchParams.get('t');
    if (!t) return null;
    return rows.find((r) => r.id === t || r.id.startsWith(t) || r.reference.replace(/^#/, '') === t)?.id ?? null;
  }, [searchParams, rows]);

  const defaultSel = rows.find((r) => GROUP_OF[r.status] === 'action') ?? rows[0];
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
      setReplyError('Add a comment or at least one photo.');
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
        if (!urlRes.ok) throw new Error('Upload could not start, please retry.');
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
        throw new Error(b?.error ?? 'Something went wrong, please retry.');
      }
      setReplied(true);
      setReplyFiles([]);
      setReplyComment('');
      router.refresh();
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : 'Something went wrong, please retry.');
    } finally {
      setSending(false);
    }
  };

  if (rows.length === 0) {
    return (
      <main className="page-shell">
        <SiteNav current="account" />
          <AccountSubnav current="support" />
        <div className="cvp">
          <div className="cvp-wrap">
            <PageHead />
            <div className="cvp-empty">
              <p style={{ margin: 0, color: '#6A6A6A' }}>You have no support tickets yet.</p>
              <a className="button button-dark" href="/support" style={{ marginTop: 16 }}>
                Open a support request
              </a>
            </div>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const m = META[selected.status];
  const tone = GROUP_OF[selected.status];

  return (
    <main className="page-shell">
      <SiteNav current="account" />
          <AccountSubnav current="support" />
      <div className="cvp">
        <div className="cvp-wrap">
          <PageHead />

          {rows.length > 1 ? (
            <div className="sup-switch">
              {rows.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`sup-switch-item${r.id === selected.id ? ' is-active' : ''}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <span className="cvp-mono">{r.reference}</span>
                  <span className="sup-switch-title">{listTitle(r)}</span>
                  <StatusPill status={r.status} />
                </button>
              ))}
            </div>
          ) : null}

          <section className="cvp-detail cvp-detail-solo sup-2col">
            <div className="sup-col-info">
              <div className="cvp-dhead">
                <div>
                  <div className="cvp-dtitle">{fullTitle(selected)}</div>
                  <div className="cvp-dsub">
                    <span className="cvp-mono">{selected.reference}</span>
                    {' · '}
                    Opened {formatDate(selected.createdAt)}
                    {selected.company ? ` · ${selected.company}` : ''}
                  </div>
                </div>
                <StatusPill status={selected.status} />
              </div>

              <div className={`cvp-banner cvp-t-${tone}`}>
                <span className="cvp-bsq" />
                <span className="cvp-blabel">{m.label}</span>
                <span className="cvp-bdesc">{m.desc}</span>
              </div>

              {selected.assigneeName ? (
                <div className="sup-handled">
                  <span className="sup-handled-av">{selected.assigneeName.slice(0, 1).toUpperCase()}</span>
                  Handled by <strong>{selected.assigneeName}</strong>
                </div>
              ) : null}

              <div className="cvp-sumbox">
                {[
                  ['Company', selected.company || '—'],
                  ['AnyDesk', selected.anydesk || '—'],
                  ['Last update', formatDate(selected.updatedAt)],
                ].map(([k, v]) => (
                  <div key={k} className="cvp-cell">
                    <div className="cvp-k">{k}</div>
                    <div className="cvp-v">{v}</div>
                  </div>
                ))}
              </div>

              <div className="cvp-tlhead">Your request</div>
              <p className="sup-desc">{selected.description}</p>

              {selected.photos.length > 0 ? (
                <div className="sup-photos">
                  {selected.photos.map((url, i) => (
                    <a key={i} className="sup-photo" href={url} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Attachment ${i + 1}`} />
                    </a>
                  ))}
                </div>
              ) : null}

              <div className="cvp-tlhead">Activity</div>
              <ol className="cvp-tline">
                {timelineFor(selected).map((e, i) => (
                  <li
                    key={i}
                    className={`cvp-tlrow is-${e.state}${e.tone === 'blue' ? ' is-blue' : ''}`}
                  >
                    <span className="cvp-tlnode" />
                    <div>
                      <div className="cvp-tllabel">{e.label}</div>
                      {e.date ? <div className="cvp-tltime cvp-mono">{e.date}</div> : null}
                    </div>
                  </li>
                ))}
              </ol>

            </div>

            <aside className="sup-chat">
              <div className="sup-chat-h">Conversation</div>
              <div className="sup-chat-body">
                {selected.messages.length > 0 ? (
                  selected.messages.map((msg, i) => (
                    <div key={i} className={`sup-msg sup-msg-${msg.author}`}>
                      <div className="sup-msg-h">
                        {msg.author === 'team' ? 'Our team' : 'You'}
                        <span className="cvp-mono"> · {formatDate(msg.createdAt)}</span>
                      </div>
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
                  ))
                ) : (
                  <p className="sup-chat-empty">No messages yet — write below and our team will get it.</p>
                )}
              </div>

              {CAN_REPLY.includes(selected.status) ? (
                <div
                  className={`sup-compose${dragging ? ' is-dragging' : ''}`}
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
                  {replied ? <p className="sup-compose-sent">Sent — our team has it ✓</p> : null}
                  {replyFiles.length > 0 ? (
                    <div className="sup-compose-files">
                      {replyFiles.map((f, i) => (
                        <span key={i} className="cvp-file-chip">
                          {f.name}
                          <button
                            type="button"
                            aria-label="Remove"
                            onClick={() => setReplyFiles((cur) => cur.filter((_, j) => j !== i))}
                          >
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
                  <div className="sup-compose-row">
                    <label className="sup-compose-attach" title="Add an image">
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M21 11.5l-8.5 8.5a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.6 1.6 0 0 1-2.3-2.3l7.8-7.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </label>
                    <textarea
                      className="sup-compose-text"
                      rows={1}
                      placeholder="Write a message…"
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
                    <button type="button" className="sup-compose-send" disabled={sending} onClick={handleReply}>
                      {sending ? '…' : 'Send'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sup-chat-closed">
                  This ticket is closed. <a href="/support">Open a new request →</a>
                </div>
              )}
            </aside>
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
