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
  dropboxLink: string | null;
};

const STATUS_META: Record<ConsoleValidationStatus, { label: string; tone: string; solid?: boolean }> = {
  submitted: { label: 'Received', tone: '#78716c' },
  in_review: { label: 'In review', tone: '#b45309' },
  can_be_connected: { label: 'Connectable', tone: '#15803d', solid: true },
  rejected: { label: 'Not connectable', tone: '#b91c1c', solid: true },
  changes_requested: { label: 'More info needed', tone: '#b45309' },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

export function ConsoleValidationsPortal({ rows }: { rows: ConsoleValidationRow[] }) {
  return (
    <main className="page-shell">
      <SiteNav current="account" />

      <section className="section">
        <div className="container" style={{ maxWidth: 880 }}>
          <p className="section-kicker">Your account</p>
          <h1>Your console validations</h1>
          <p style={{ color: '#57534e', maxWidth: 620 }}>
            Track every console validation you have submitted and its current status. Our team reviews each
            request and updates the status here as it progresses.
          </p>

          {rows.length === 0 ? (
            <div
              style={{
                marginTop: 32,
                padding: '40px 28px',
                border: '1px solid #e7e5e4',
                borderRadius: 16,
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, color: '#57534e' }}>You have no console validation requests yet.</p>
              <a className="button button-dark" href="/console-validation" style={{ marginTop: 16 }}>
                Start a console validation
              </a>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: 32, display: 'grid', gap: 14 }}>
              {rows.map((row) => {
                const meta = STATUS_META[row.status] ?? STATUS_META.submitted;
                const title = [row.country, row.company, row.machine].filter(Boolean).join(' · ') || 'Console validation';
                return (
                  <li
                    key={row.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      padding: '18px 20px',
                      background: '#ffffff',
                      border: '1px solid #e7e5e4',
                      borderLeft: `5px solid ${meta.tone}`,
                      borderRadius: 14,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {title}
                      </strong>
                      <span style={{ color: '#a8a29e', fontSize: 13 }}>Submitted {formatDate(row.createdAt)}</span>
                    </div>
                    <span
                      style={{
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: '-0.01em',
                        color: meta.solid ? '#ffffff' : meta.tone,
                        background: meta.solid ? meta.tone : `${meta.tone}1a`,
                        border: meta.solid ? `1px solid ${meta.tone}` : `1px solid ${meta.tone}40`,
                        borderRadius: 999,
                        padding: '8px 16px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: meta.solid ? '#ffffff' : meta.tone,
                        }}
                      />
                      {meta.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
