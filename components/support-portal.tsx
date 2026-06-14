'use client';

import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
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

const GROUPS: { key: Tone; title: string }[] = [
  { key: 'action', title: 'Action needed' },
  { key: 'review', title: 'In progress' },
  { key: 'green', title: 'Resolved' },
  { key: 'neutral', title: 'Closed' },
];

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
  const [filter, setFilter] = useState<Tone | null>(null);

  // Reply form state.
  const [showReply, setShowReply] = useState(false);
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [replyComment, setReplyComment] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replied, setReplied] = useState(false);
  const [dragging, setDragging] = useState(false);

  const counts: Record<Tone, number> = { action: 0, review: 0, green: 0, neutral: 0 };
  rows.forEach((r) => {
    counts[GROUP_OF[r.status]] += 1;
  });

  // Default selection = first "Action needed", else the most recent.
  // Deep-link: /account/support?t=<id or 8-char reference> opens that ticket.
  const deepLinkId = useMemo(() => {
    const t = searchParams.get('t');
    if (!t) return null;
    return rows.find((r) => r.id === t || r.id.startsWith(t) || r.reference.replace(/^#/, '') === t)?.id ?? null;
  }, [searchParams, rows]);

  const defaultSel = rows.find((r) => GROUP_OF[r.status] === 'action') ?? rows[0];
  const selected = rows.find((r) => r.id === (selectedId ?? deepLinkId)) ?? defaultSel;

  const shownGroups = GROUPS.filter((g) => counts[g.key] && (!filter || filter === g.key));

  useEffect(() => {
    setShowReply(false);
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
      setShowReply(false);
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
      <div className="cvp">
        <div className="cvp-wrap">
          <PageHead />

          <div className="cvp-summary">
            {GROUPS.map((g) => (
              <button
                key={g.key}
                type="button"
                className={`cvp-sum-cell cvp-t-${g.key}${filter === g.key ? ' is-on' : ''}`}
                onClick={() => setFilter(filter === g.key ? null : g.key)}
              >
                <div className="cvp-sum-n">{counts[g.key]}</div>
                <div className="cvp-sum-l">{g.title}</div>
              </button>
            ))}
          </div>

          <div className="cvp-main">
            <aside className="cvp-col">
              {shownGroups.map((g) => (
                <div key={g.key} className="cvp-group">
                  <div className={`cvp-cghead cvp-t-${g.key}`}>
                    <span className="cvp-cgdot" />
                    {g.title}
                    <span className="cvp-cgcount">{counts[g.key]}</span>
                  </div>
                  {rows
                    .filter((r) => GROUP_OF[r.status] === g.key)
                    .map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={`cvp-item cvp-t-${g.key}${r.id === selected.id ? ' is-active' : ''}`}
                        onClick={() => setSelectedId(r.id)}
                      >
                        <span className="cvp-itbody">
                          <span className="cvp-ittitle">{listTitle(r)}</span>
                          <span className="cvp-itmeta">
                            <span className="cvp-mono">{r.reference}</span>
                            {' · '}
                            {formatDate(r.createdAt)}
                          </span>
                        </span>
                        <span className="cvp-chev">›</span>
                      </button>
                    ))}
                </div>
              ))}
            </aside>

            <section className="cvp-detail">
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

              {selected.messages.length > 0 ? (
                <>
                  <div className="cvp-tlhead">Conversation</div>
                  <div className="sup-thread">
                    {selected.messages.map((msg, i) => (
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
                    ))}
                  </div>
                </>
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

              <div className="cvp-actions">
                {CAN_REPLY.includes(selected.status) ? (
                  <button
                    type="button"
                    className={`cvp-btn${selected.status === 'waiting_customer' ? ' is-amber' : ''}`}
                    onClick={() => {
                      setReplied(false);
                      setShowReply((v) => !v);
                    }}
                  >
                    {showReply ? 'Close' : m.action} →
                  </button>
                ) : (
                  <a className="cvp-btn" href="/support">
                    {m.action} →
                  </a>
                )}
              </div>

              {replied ? (
                <p className="cvp-reply-msg">
                  Thank you — your details were sent to our team and added to this ticket.
                </p>
              ) : null}

              {showReply ? (
                <div className="cvp-reply">
                  <div
                    className={`cvp-reply-drop${dragging ? ' is-dragging' : ''}`}
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
                    <input
                      id="sup-reply-input"
                      className="cvp-reply-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        addReplyFiles(e.target.files);
                        e.currentTarget.value = '';
                      }}
                    />
                    <label htmlFor="sup-reply-input" className="cvp-reply-droplabel">
                      <strong>Drag &amp; drop or click to add photos</strong>
                      <span>Up to 9 images — drop here or tap to use the camera</span>
                    </label>
                  </div>

                  {replyFiles.length > 0 ? (
                    <div className="cvp-reply-files">
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

                  <textarea
                    className="cvp-reply-text"
                    rows={4}
                    placeholder="Add details for our team — what changed, answers to their questions, extra context…"
                    value={replyComment}
                    onChange={(e) => setReplyComment(e.target.value)}
                  />

                  {replyError ? (
                    <p className="cvp-reply-error" role="alert">
                      {replyError}
                    </p>
                  ) : null}

                  <div className="cvp-reply-actions">
                    <button type="button" className="cvp-btn" disabled={sending} onClick={handleReply}>
                      {sending ? 'Sending…' : 'Send to our team'}
                    </button>
                    <button type="button" className="cvp-ghost" onClick={() => setShowReply(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
