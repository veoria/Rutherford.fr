'use client';

import { Fragment, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';

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
};

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
  const ev: TimelineItem[] = [
    { date: d, label: 'Request submitted', state: 'done' },
    { label: ref ? `Received — reference ${ref} assigned` : 'Received', state: 'done' },
  ];
  if (r.status !== 'submitted') ev.push({ label: 'Assigned to a reviewer', state: 'done' });

  if (r.status === 'submitted') {
    ev.push({ label: 'Awaiting review', state: 'current', tone: 'blue' });
    ev.push({ label: 'Eligibility verdict', state: 'future' });
  } else if (r.status === 'in_review') {
    ev.push({ label: 'Under review', state: 'current', tone: 'blue' });
    ev.push({ label: 'Eligibility verdict', state: 'future' });
  } else if (r.status === 'changes_requested') {
    ev.push({ label: 'More information requested', state: 'current', tone: 'amber' });
    ev.push({ label: 'Awaiting your response', state: 'future' });
    ev.push({ label: 'Eligibility verdict', state: 'future' });
  } else if (r.status === 'can_be_connected') {
    ev.push({ label: 'Reviewed — compatible with closed-loop color', state: 'done' });
    ev.push({ label: 'Marked connectable', state: 'done' });
  } else if (r.status === 'rejected') {
    ev.push({ label: 'Reviewed', state: 'done' });
    ev.push({ label: 'Marked not eligible', state: 'done', tone: 'red' });
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

export function ConsoleValidationsPortal({ rows }: { rows: ConsoleValidationRow[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Tone | null>(null);

  const counts: Record<Tone, number> = { action: 0, review: 0, green: 0, red: 0 };
  rows.forEach((r) => {
    counts[GROUP_OF[r.status]] += 1;
  });

  // Default selection = the first "Action needed" item, else the most recent.
  const defaultSel = rows.find((r) => GROUP_OF[r.status] === 'action') ?? rows[0];
  const selected = rows.find((r) => r.id === selectedId) ?? defaultSel;

  const shownGroups = GROUPS.filter((g) => counts[g.key] && (!filter || filter === g.key));

  if (rows.length === 0) {
    return (
      <main className="page-shell">
        <SiteNav current="account" />
        <div className="cvp">
          <div className="cvp-wrap">
            <PageHead />
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
                <a
                  className={`cvp-btn${selected.status === 'changes_requested' ? ' is-amber' : ''}`}
                  href={`mailto:${SUPPORT}?subject=${encodeURIComponent(
                    `Console validation ${selected.reference || listTitle(selected)}`
                  )}`}
                >
                  {m.action} →
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
