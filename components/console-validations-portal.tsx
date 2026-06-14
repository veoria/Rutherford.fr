'use client';

import { ChangeEvent, DragEvent, Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { AccountSubnav } from '@/components/account-subnav';
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

// Statuses where the customer can still add details (vs. a settled verdict).
const CAN_REPLY: ConsoleValidationStatus[] = ['submitted', 'in_review', 'changes_requested'];

// Board/group key (and tone) per status. `submitted` + `in_review` share the
// "In review" group, mirroring the design.
type Tone = 'review' | 'action' | 'green' | 'red';

const GROUP_OF: Record<ConsoleValidationStatus, Tone> = {
  submitted: 'review',
  in_review: 'review',
  changes_requested: 'action',
  can_be_connected: 'green',
  rejected: 'red',
};

type Meta = {
  label: string;
  pill: 'neutral' | 'review' | 'action' | 'green' | 'red';
  step: 1 | 2;
  desc: string;
  action: string;
};

const META: Record<ConsoleValidationStatus, Meta> = {
  submitted: {
    label: 'Received',
    pill: 'neutral',
    step: 1,
    desc: 'Your request is in the queue for review.',
    action: 'Contact us',
  },
  in_review: {
    label: 'In review',
    pill: 'review',
    step: 1,
    desc: 'Our team is reviewing your console.',
    action: 'Contact us',
  },
  changes_requested: {
    label: 'Action needed',
    pill: 'action',
    step: 1,
    desc: 'We need a few details before we can continue.',
    action: 'Provide details',
  },
  can_be_connected: {
    label: 'Connectable',
    pill: 'green',
    step: 2,
    desc: "Your press is eligible — let's talk about the next steps.",
    action: 'Talk to our team',
  },
  rejected: {
    label: 'Not eligible',
    pill: 'red',
    step: 2,
    desc: "This press isn't currently supported for closed-loop color.",
    action: 'Talk to our team',
  },
};

const GROUPS: { key: Tone; title: string }[] = [
  { key: 'action', title: 'Action needed' },
  { key: 'review', title: 'In review' },
  { key: 'green', title: 'Connectable' },
  { key: 'red', title: 'Not eligible' },
];

const SUPPORT = 'contact@rutherford.fr';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

const listTitle = (r: ConsoleValidationRow) =>
  [r.company, r.machine].filter(Boolean).join(' · ') || 'Console validation';
const fullTitle = (r: ConsoleValidationRow) =>
  [r.country, r.company, r.machine].filter(Boolean).join(' · ') || 'Console validation';

function StatusPill({ status }: { status: ConsoleValidationStatus }) {
  const m = META[status];
  return (
    <span className={`cvp-pill cvp-t-${m.pill}`}>
      <span className="cvp-pdot" />
      {m.label}
    </span>
  );
}

function Stepper({ status }: { status: ConsoleValidationStatus }) {
  const step = META[status].step;
  const nodeClass = (i: number) => {
    let cls = 'cvp-snode';
    if (i < step) cls += ' is-done';
    else if (i === step) {
      if (status === 'changes_requested') cls += ' is-current is-amber';
      else if (status === 'can_be_connected') cls += ' is-done';
      else if (status === 'rejected') cls += ' is-red';
      else cls += ' is-current';
    }
    if (i === 2 && status === 'can_be_connected') cls = 'cvp-snode is-done';
    if (i === 2 && status === 'rejected') cls = 'cvp-snode is-red';
    return cls;
  };
  const resultLabel =
    status === 'can_be_connected'
      ? 'Connectable'
      : status === 'rejected'
        ? 'Not eligible'
        : status === 'changes_requested'
          ? 'Action needed'
          : 'Pending';
  const labels = ['Submitted', 'In review', resultLabel];
  const conns = [step >= 1, step >= 2];
  return (
    <div className="cvp-steps">
      {[0, 1, 2].map((i) => {
        const cls = nodeClass(i);
        const glyph = cls.includes('is-done') ? '✓' : cls.includes('is-red') ? '✕' : '';
        return (
          <Fragment key={i}>
            <div className="cvp-step">
              <span className={cls}>{glyph}</span>
              <span className={`cvp-slabel${i === step ? ' is-active' : ''}`}>{labels[i]}</span>
            </div>
            {i < 2 ? <span className={`cvp-sconn${conns[i] ? ' is-on' : ''}`} /> : null}
          </Fragment>
        );
      })}
    </div>
  );
}

type TimelineItem = {
  date?: string;
  label: string;
  sub?: string;
  state: 'done' | 'current' | 'future';
  tone?: 'amber' | 'blue' | 'red';
};

// Per-status activity, derived from what we actually store (submission date +
// current status). No fabricated clock times — only the real submission date.
function timelineFor(r: ConsoleValidationRow): TimelineItem[] {
  const d = formatDate(r.createdAt);
  const ref = r.reference ?? '';
  const by = r.reviewedBy ? `by ${r.reviewedBy}` : undefined;
  const rdate = r.reviewedAt ? formatDate(r.reviewedAt) : undefined;
  const ev: TimelineItem[] = [
    { date: d, label: 'Request submitted', state: 'done' },
    { label: ref ? `Received — reference ${ref} assigned` : 'Received', state: 'done' },
  ];
  if (r.status !== 'submitted') ev.push({ label: 'Assigned to a reviewer', state: 'done' });
  if (r.customerReplyAt) {
    ev.push({ label: 'You sent additional details', date: formatDate(r.customerReplyAt), state: 'done' });
  }

  if (r.status === 'submitted') {
    ev.push({ label: 'Awaiting review', state: 'current', tone: 'blue' });
    ev.push({ label: 'Eligibility verdict', state: 'future' });
  } else if (r.status === 'in_review') {
    ev.push({ label: 'Under review', state: 'current', tone: 'blue' });
    ev.push({ label: 'Eligibility verdict', state: 'future' });
  } else if (r.status === 'changes_requested') {
    ev.push({ label: 'More information requested', sub: by, date: rdate, state: 'current', tone: 'amber' });
    ev.push({ label: 'Awaiting your response', state: 'future' });
    ev.push({ label: 'Eligibility verdict', state: 'future' });
  } else if (r.status === 'can_be_connected') {
    ev.push({ label: 'Reviewed — compatible with closed-loop color', state: 'done' });
    ev.push({ label: 'Marked connectable', sub: by, date: rdate, state: 'done' });
  } else if (r.status === 'rejected') {
    ev.push({ label: 'Reviewed', state: 'done' });
    ev.push({ label: 'Marked not eligible', sub: by, date: rdate, state: 'done', tone: 'red' });
  }
  return ev;
}

function PageHead() {
  return (
    <div className="cvp-head">
      <div className="cvp-eyebrow">Your account</div>
      <h1 className="cvp-title">Your console validations</h1>
      <p className="cvp-intro">
        Track every console validation you have submitted and its current status. Our team reviews each request
        and updates the status here as it progresses.
      </p>
    </div>
  );
}

function ProfilePrompt() {
  return (
    <a href="/account/profile" className="cvp-profile-prompt">
      <span className="cvp-profile-prompt-dot" />
      <span className="cvp-profile-prompt-text">
        <strong>Complete your profile</strong> — add your name, company and role so we can tailor your
        support and reach you faster.
      </span>
      <span className="cvp-chev">›</span>
    </a>
  );
}

export function ConsoleValidationsPortal({
  rows,
  profileComplete,
}: {
  rows: ConsoleValidationRow[];
  profileComplete: boolean;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Tone | null>(null);

  // "Provide more details" reply form state.
  const [showReply, setShowReply] = useState(false);
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

  // Default selection = the first "Action needed" item, else the most recent.
  const defaultSel = rows.find((r) => GROUP_OF[r.status] === 'action') ?? rows[0];
  const selected = rows.find((r) => r.id === selectedId) ?? defaultSel;

  const shownGroups = GROUPS.filter((g) => counts[g.key] && (!filter || filter === g.key));

  // Reset the reply form whenever the selected dossier changes.
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
      const res = await fetch(`/api/console-validation/${selected.id}/reply`, {
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
          <AccountSubnav current="console" />
        <div className="cvp">
          <div className="cvp-wrap">
            <PageHead />
            {!profileComplete ? <ProfilePrompt /> : null}
            <div className="cvp-empty">
              <p style={{ margin: 0, color: '#6A6A6A' }}>You have no console validation requests yet.</p>
              <a className="button button-dark" href="/console-validation" style={{ marginTop: 16 }}>
                Start a console validation
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
          <AccountSubnav current="console" />
      <div className="cvp">
        <div className="cvp-wrap">
          <PageHead />
          {!profileComplete ? <ProfilePrompt /> : null}

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
                            {r.reference ? <span className="cvp-mono">{r.reference}</span> : null}
                            {r.reference ? ' · ' : ''}
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
                    {selected.reference ? <span className="cvp-mono">{selected.reference}</span> : null}
                    {selected.reference ? ' · ' : ''}
                    Submitted {formatDate(selected.createdAt)}
                  </div>
                </div>
                <StatusPill status={selected.status} />
              </div>

              <div className={`cvp-banner cvp-t-${tone}`}>
                <span className="cvp-bsq" />
                <span className="cvp-blabel">{m.label}</span>
                <span className="cvp-bdesc">{m.desc}</span>
              </div>

              <div className="cvp-stepper">
                <Stepper status={selected.status} />
              </div>

              <div className="cvp-sumbox">
                {[
                  ['Company', selected.company],
                  ['Country', selected.country],
                  ['Press', selected.machine],
                ].map(([k, v]) => (
                  <div key={k} className="cvp-cell">
                    <div className="cvp-k">{k}</div>
                    <div className="cvp-v">{v || '—'}</div>
                  </div>
                ))}
              </div>

              <div className="cvp-tlhead">Activity</div>
              <ol className="cvp-tline">
                {timelineFor(selected).map((e, i) => (
                  <li
                    key={i}
                    className={`cvp-tlrow is-${e.state}${e.tone === 'blue' ? ' is-blue' : ''}${
                      e.tone === 'red' ? ' is-red' : ''
                    }`}
                  >
                    <span className="cvp-tlnode" />
                    <div>
                      <div className="cvp-tllabel">{e.label}</div>
                      {e.sub ? <div className="cvp-tlsub">{e.sub}</div> : null}
                      {e.date ? <div className="cvp-tltime cvp-mono">{e.date}</div> : null}
                    </div>
                  </li>
                ))}
              </ol>

              <div className="cvp-actions">
                {CAN_REPLY.includes(selected.status) ? (
                  <button
                    type="button"
                    className={`cvp-btn${selected.status === 'changes_requested' ? ' is-amber' : ''}`}
                    onClick={() => {
                      setReplied(false);
                      setShowReply((v) => !v);
                    }}
                  >
                    {showReply ? 'Close' : m.action} →
                  </button>
                ) : (
                  <a
                    className="cvp-btn"
                    href={`mailto:${SUPPORT}?subject=${encodeURIComponent(
                      `Console validation ${selected.reference || listTitle(selected)}`
                    )}`}
                  >
                    {m.action} →
                  </a>
                )}
              </div>

              {replied ? (
                <p className="cvp-reply-msg">
                  Thank you — your details were sent to our team and your request is back in review.
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
                      id="cvp-reply-input"
                      className="cvp-reply-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        addReplyFiles(e.target.files);
                        e.currentTarget.value = '';
                      }}
                    />
                    <label htmlFor="cvp-reply-input" className="cvp-reply-droplabel">
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
                    placeholder="Add a comment for our team (what changed, extra details, answers to their questions…)"
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
