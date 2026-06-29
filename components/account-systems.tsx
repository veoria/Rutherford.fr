'use client';

import { type Locale, useLanguage } from '@/components/language-provider';
import { getCourseBySlug } from '@/data/academy-courses';

// One card per press the client has (derived from their Console Validations):
// the machine, its status, and per-system Support / Training / Help.
export type ClientSystem = {
  machine: string;
  company: string | null;
  country: string | null;
  status: string;
  dealId: number | null;
  count: number;
};

type StatusKind = 'eligible' | 'review' | 'action' | 'rejected' | 'closed';

function statusKind(status: string): StatusKind {
  switch (status) {
    case 'can_be_connected':
      return 'eligible';
    case 'changes_requested':
      return 'action';
    case 'rejected':
      return 'rejected';
    case 'closed':
      return 'closed';
    default:
      return 'review'; // pending, submitted, in_review
  }
}

const PILL: Record<StatusKind, string> = {
  eligible: 'green',
  review: 'blue',
  action: 'amber',
  rejected: 'grey',
  closed: 'grey',
};

// Two targeted Academy courses per system, by where the press is in its journey.
function coursesFor(kind: StatusKind): string[] {
  switch (kind) {
    case 'eligible':
      return ['closed-loop-flagship', 'colorloop-ai'];
    case 'closed':
      return ['measurecolor-production', 'offset360'];
    case 'rejected':
      return ['fundamentals', 'where-color-hurts'];
    case 'action':
      return ['measurement-essentials', 'closed-loop-flagship'];
    default:
      return ['fundamentals', 'measurement-essentials'];
  }
}

type Copy = {
  heading: string;
  status: Record<StatusKind, string>;
  gSupport: string;
  gTraining: string;
  gHelp: string;
  supportCta: string;
  guides: string;
  email: string;
  validations: (n: number) => string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    heading: 'My presses',
    status: { eligible: 'Eligible to connect', review: 'Under review', action: 'Action needed', rejected: 'Not eligible', closed: 'Closed' },
    gSupport: 'Support', gTraining: 'Training', gHelp: 'Help',
    supportCta: 'Get support for this press', guides: 'Guides & docs', email: 'Email us',
    validations: (n) => `${n} validation${n === 1 ? '' : 's'}`,
  },
  fr: {
    heading: 'Mes machines',
    status: { eligible: 'Éligible à la connexion', review: 'En analyse', action: 'Action requise', rejected: 'Non éligible', closed: 'Clôturée' },
    gSupport: 'Support', gTraining: 'Formations', gHelp: 'Aides',
    supportCta: 'Support sur cette presse', guides: 'Guides & docs', email: 'Nous écrire',
    validations: (n) => `${n} validation${n === 1 ? '' : 's'}`,
  },
  de: {
    heading: 'Meine Maschinen',
    status: { eligible: 'Verbindung möglich', review: 'In Prüfung', action: 'Aktion erforderlich', rejected: 'Nicht geeignet', closed: 'Abgeschlossen' },
    gSupport: 'Support', gTraining: 'Schulungen', gHelp: 'Hilfe',
    supportCta: 'Support für diese Maschine', guides: 'Anleitungen & Doku', email: 'E-Mail',
    validations: (n) => `${n} Validierung${n === 1 ? '' : 'en'}`,
  },
  it: {
    heading: 'Le mie macchine',
    status: { eligible: 'Idonea alla connessione', review: 'In analisi', action: 'Azione richiesta', rejected: 'Non idonea', closed: 'Chiusa' },
    gSupport: 'Support', gTraining: 'Formazione', gHelp: 'Aiuto',
    supportCta: 'Assistenza per questa macchina', guides: 'Guide & doc', email: 'Scrivici',
    validations: (n) => `${n} validazion${n === 1 ? 'e' : 'i'}`,
  },
  es: {
    heading: 'Mis máquinas',
    status: { eligible: 'Apta para conexión', review: 'En revisión', action: 'Acción requerida', rejected: 'No apta', closed: 'Cerrada' },
    gSupport: 'Soporte', gTraining: 'Formación', gHelp: 'Ayuda',
    supportCta: 'Soporte para esta prensa', guides: 'Guías & docs', email: 'Escríbanos',
    validations: (n) => `${n} validaci${n === 1 ? 'ón' : 'ones'}`,
  },
  pt: {
    heading: 'As minhas máquinas',
    status: { eligible: 'Elegível para ligação', review: 'Em análise', action: 'Ação necessária', rejected: 'Não elegível', closed: 'Encerrada' },
    gSupport: 'Support', gTraining: 'Formação', gHelp: 'Ajuda',
    supportCta: 'Support para esta máquina', guides: 'Guias & docs', email: 'Escreva-nos',
    validations: (n) => `${n} validaç${n === 1 ? 'ão' : 'ões'}`,
  },
};

export function AccountSystems({ systems, accent }: { systems: ClientSystem[]; accent: string }) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  if (!systems.length) return null;

  return (
    <div style={{ ['--role' as string]: accent }}>
      <div className="ah-section-h"><span className="ah-section-t">{t.heading}</span></div>
      <div className="ah-sys-grid">
        {systems.map((s, i) => {
          const kind = statusKind(s.status);
          const courses = coursesFor(kind).map((slug) => ({ slug, title: getCourseBySlug(slug)?.title ?? slug }));
          const q = new URLSearchParams({ subject: s.machine, ...(s.company ? { company: s.company } : {}) }).toString();
          return (
            <div className="ah-sys" key={i}>
              <div className="ah-sys-h">
                <div>
                  <div className="ah-sys-name">{s.machine}</div>
                  <div className="ah-sys-meta">{[s.country, t.validations(s.count)].filter(Boolean).join(' · ')}</div>
                </div>
                <span className={`ah-sys-pill ${PILL[kind]}`}>{t.status[kind]}</span>
              </div>

              <div className="ah-sys-group">
                <div className="ah-sys-glabel">{t.gSupport}</div>
                <div className="ah-sys-links">
                  <a className="ah-sys-link primary" href={`/support?${q}`}>{t.supportCta}</a>
                </div>
              </div>

              <div className="ah-sys-group">
                <div className="ah-sys-glabel">{t.gTraining}</div>
                <div className="ah-sys-links">
                  {courses.map((c) => (
                    <a className="ah-sys-link" href={`/academy/${c.slug}`} key={c.slug}>
                      {c.title}
                    </a>
                  ))}
                </div>
              </div>

              <div className="ah-sys-group">
                <div className="ah-sys-glabel">{t.gHelp}</div>
                <div className="ah-sys-links">
                  <a className="ah-sys-link" href="/blog/closed-loop-color-control-offset-guide">{t.guides}</a>
                  <a className="ah-sys-link" href="mailto:contact@rutherford.fr">{t.email}</a>
                  <a className="ah-sys-link" href="https://anydesk.com" target="_blank" rel="noreferrer">AnyDesk</a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
