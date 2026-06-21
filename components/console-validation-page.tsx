'use client';

import Image from 'next/image';
import { ChangeEvent, CSSProperties, DragEvent, FormEvent, Fragment, useEffect, useMemo, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { useLanguage } from '@/components/language-provider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { COUNTRY_NAMES, isKnownCountry } from '@/lib/countries';

type UploadFieldId = 'consolePhoto' | 'pressPhoto' | 'insideConsolePhoto' | 'keysPhoto' | 'platePhoto';

type PhotoConfig = {
  id: UploadFieldId;
  title: string;
  help: string;
  exampleSrc: string;
  conditional?: boolean;
  optional?: boolean;
};

const PRESS_BRANDS = [
  { src: '/images/komori.webp', alt: 'Komori' },
  { src: '/images/koenig-bauer.webp', alt: 'Koenig & Bauer' },
  { src: '/images/manroland.webp', alt: 'Manroland' },
  { src: '/images/mitsubishi.webp', alt: 'Mitsubishi' },
  { src: '/images/ryobi.webp', alt: 'Ryobi' },
  { src: '/images/presstek.webp', alt: 'Presstek' },
  { src: '/images/goss.webp', alt: 'Goss' },
];

// Press brand drives which photos we ask for.
const BRANDS = [
  'Heidelberg',
  'Koenig & Bauer',
  'KBA',
  'KBA-Sheetfed',
  'KBA-Metronic',
  'Manroland',
  'Manroland Sheetfed',
  'Manroland Web',
  'manroland Goss web systems',
  'Komori',
  'Mitsubishi',
  'Ryobi',
  'Ryobi MHI',
  'RMGT',
  'Goss',
  'Goss International',
  'Presstek',
  'Sakurai',
  'Shinohara',
  'Akiyama',
  'Planeta',
  'Guanghua',
];
const INSIDE_BRANDS = ['Heidelberg', 'Komori', 'Mitsubishi'];

// Required: console, press and number of keys. The inside-console and machine
// plate photos are optional (and the inside one only applies to some brands).
const PHOTO_FIELDS: PhotoConfig[] = [
  { id: 'consolePhoto', title: 'Console photo', help: 'One clear picture of the full console in its environment.', exampleSrc: '/images/Console offset.jpg' },
  { id: 'pressPhoto', title: 'Press photo', help: 'The press with brand, type and number of units visible.', exampleSrc: '/images/Brand:Type and numbers of units.png' },
  { id: 'keysPhoto', title: 'Number of keys', help: 'Close-up of the number of keys on the console.', exampleSrc: '/images/the number of keys.png' },
  { id: 'insideConsolePhoto', title: 'Inside console or computer', help: 'Inside the bottom of the console or computer cabinet.', exampleSrc: '/images/inside the bottom of the console or computer.png', conditional: true, optional: true },
  { id: 'platePhoto', title: 'Machine plate number', help: 'The machine plate showing model, year and units.', exampleSrc: '/images/Take a picture of the machine plate number..png', optional: true },
];

const CONFETTI_COLORS = ['#29ABE2', '#2E9E47', '#F7941D', '#EC0E8C', '#ED1C24', '#2E2BB8', '#1B6FF3'];

type PreviewMap = Record<UploadFieldId, string>;
type FileMap = Record<UploadFieldId, File | null>;

const emptyPreviews: PreviewMap = { consolePhoto: '', pressPhoto: '', insideConsolePhoto: '', keysPhoto: '', platePhoto: '' };
const emptyFiles: FileMap = { consolePhoto: null, pressPhoto: null, insideConsolePhoto: null, keysPhoto: null, platePhoto: null };

const photosFor = (brand: string) => PHOTO_FIELDS.filter((p) => !p.conditional || INSIDE_BRANDS.includes(brand));

function Caret() {
  return (
    <svg className="cv-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8.5h3l1.2-2h7.6L17 8.5h3v10H4v-10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function UploadCard({
  config,
  brand,
  file,
  preview,
  onChange,
}: {
  config: PhotoConfig;
  brand: string;
  file: File | null;
  preview: string;
  onChange: (id: UploadFieldId, file: File | null) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const required = !config.optional && (!config.conditional || INSIDE_BRANDS.includes(brand));
  const accept = (f: File | null | undefined) => {
    if (f && f.type.startsWith('image/')) onChange(config.id, f);
  };
  return (
    <div className={`cv-up${file ? ' filled' : ''}`}>
      <div className="cv-up-ex">
        <img src={config.exampleSrc} alt="" loading="lazy" />
      </div>
      <div className="cv-up-body">
        <div className="cv-up-top">
          <span className="cv-up-title">{config.title}</span>
          <span className={`cv-badge${required ? ' req' : ''}`}>{required ? 'Required' : 'Optional'}</span>
        </div>
        <div className="cv-up-help">
          {config.help}
          {config.conditional ? <span className="cv-cond"> · for Heidelberg, Komori &amp; Mitsubishi</span> : null}
        </div>
        <div
          className={`cv-drop${dragging ? ' is-dragging' : ''}`}
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
            accept(e.dataTransfer.files?.[0]);
          }}
        >
          <input
            className="cv-drop-input"
            type="file"
            accept="image/*"
            aria-label={`Upload ${config.title}`}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              accept(e.target.files?.[0] ?? null);
              e.currentTarget.value = '';
            }}
          />
          {file ? (
            <>
              {preview ? (
                <img className="cv-drop-thumb" src={preview} alt="" />
              ) : (
                <span className="cv-drop-check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5l4.2 4.2L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
              <b>Photo added</b>
              <span className="cv-drop-replace">Replace</span>
            </>
          ) : (
            <>
              <CameraIcon />
              Take a photo or drag &amp; drop
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        left: Math.random() * 100,
        dx: (Math.random() * 2 - 1) * 130,
        dy: 320 + Math.random() * 230,
        rot: (Math.random() * 4 - 2) * 360,
        dur: 1.1 + Math.random() * 0.9,
        delay: Math.random() * 0.25,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    []
  );
  return (
    <div className="cv-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--rot': `${p.rot}deg`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

const STEP_TITLES = ['Your details', 'Your press', 'Photos'];

function Reassure() {
  const items = ['Free', '~2 min', 'Reply within 1 business day', 'No commitment'];
  return (
    <div className="cv-reassure">
      {items.map((t) => (
        <span key={t} className="cv-rea">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t}
        </span>
      ))}
    </div>
  );
}

export type ConsoleValidationBrand = {
  name: string;
  consoles: string;
  presses: string;
  machinePlaceholder: string;
};

export type ConsoleValidationFaqItem = { q: string; a: string };

export type ConsoleValidationInvite = {
  token: string;
  clientEmail: string;
  company: string | null;
  inviterCompany: string | null;
};

export function ConsoleValidationPage({
  brand,
  faq,
  invite,
}: {
  brand?: ConsoleValidationBrand;
  faq?: ConsoleValidationFaqItem[];
  invite?: ConsoleValidationInvite;
} = {}) {
  const { locale } = useLanguage();
  const [files, setFiles] = useState<FileMap>(emptyFiles);
  const [previews, setPreviews] = useState<PreviewMap>(emptyPreviews);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refCode, setRefCode] = useState('');
  const [copied, setCopied] = useState(false);

  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [pressBrand, setPressBrand] = useState(brand && BRANDS.includes(brand.name) ? brand.name : '');
  const [model, setModel] = useState('');
  const [notes, setNotes] = useState('');
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [onBehalf, setOnBehalf] = useState(false);

  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [started, setStarted] = useState(false);

  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) setRefCode(ref.slice(0, 100));
    // Deep-link straight to the form (e.g. /console-validation#submit).
    if (window.location.hash === '#submit') setStarted(true);
  }, []);

  // Click "Submit your information ↓": fold the hero visuals away and reveal the
  // form in their place. No scroll — the form takes the visuals' spot, so the
  // page shouldn't jump (and must never land on the FAQ below).
  const startForm = () => {
    setStarted(true);
  };

  // Prefill from the signed-in profile, then IP geo for the country. Resellers /
  // distributors / team submit FOR a client, so none of THEIR details (email,
  // company, country, geo) are prefilled — those fields belong to the client.
  useEffect(() => {
    let active = true;
    (async () => {
      let countryResolved = false;
      let isReseller = false;
      // Invited client (token link): prefill the CLIENT's details from the
      // invite and ignore any signed-in profile.
      if (invite) {
        if (active) {
          setEmail((v) => v || invite.clientEmail);
          if (invite.company) setCompanyName((v) => v || invite.company!);
        }
      } else if (authConfigured) {
        try {
          const supabase = createSupabaseBrowserClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user && active) {
            setSignedInEmail(user.email ?? null);
            const { data: profile } = await supabase
              .from('profiles')
              .select('company, country, account_type')
              .eq('id', user.id)
              .maybeSingle();
            isReseller =
              profile?.account_type === 'reseller' ||
              profile?.account_type === 'distributor' ||
              profile?.account_type === 'team';
            if (active) setOnBehalf(isReseller);
            if (!isReseller) {
              if (user.email) setEmail((v) => v || user.email!);
              if (profile?.company) setCompanyName((v) => v || (profile.company as string));
              if (profile?.country && isKnownCountry(profile.country as string)) {
                setCountry((v) => v || (profile.country as string));
                countryResolved = true;
              }
            }
          }
        } catch {
          /* anonymous */
        }
      }
      // Geo fallback — skip for resellers / team (their location ≠ the client's).
      if (!countryResolved && !isReseller && active) {
        try {
          const res = await fetch('/api/geo');
          if (res.ok) {
            const { country: geoCountry } = await res.json();
            if (geoCountry && active) setCountry((v) => v || geoCountry);
          }
        } catch {
          /* no geo */
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [authConfigured, invite]);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((value) => {
        if (value) URL.revokeObjectURL(value);
      });
    };
  }, [previews]);

  const handleFileChange = (field: UploadFieldId, file: File | null) => {
    setFiles((current) => ({ ...current, [field]: file }));
    setPreviews((current) => {
      if (current[field]) URL.revokeObjectURL(current[field]);
      return { ...current, [field]: file ? URL.createObjectURL(file) : '' };
    });
  };

  const list = photosFor(pressBrand || 'Heidelberg');
  // Only the required photos (console, press, number of keys) gate submission
  // and drive the progress bar; optional ones never block.
  const requiredList = list.filter((p) => !p.optional);
  const photosLeft = requiredList.filter((p) => !files[p.id]).length;
  const photosDone = requiredList.length - photosLeft;
  const pct = requiredList.length ? Math.round((photosDone / requiredList.length) * 100) : 0;
  const inside = INSIDE_BRANDS.includes(pressBrand);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const step1Valid = emailValid && companyName.trim().length > 0 && country.length > 0;
  const step2Valid = pressBrand.length > 0 && model.trim().length > 0;

  const goNext = () => {
    if (step === 1 && !step1Valid) {
      setErrorMsg('Please add a valid email, your company name and your country.');
      return;
    }
    if (step === 2 && !step2Valid) {
      setErrorMsg('Please pick your press brand and enter the machine / model name.');
      return;
    }
    setErrorMsg(null);
    const n = Math.min(3, step + 1);
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
  };

  const navTo = (n: number) => {
    if (n <= maxStep) {
      setErrorMsg(null);
      setStep(n);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setErrorMsg(null);

    const uploadId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const machineName = [pressBrand, model.trim()].filter(Boolean).join(' ');

    try {
      const supabase = createSupabaseBrowserClient();
      const photos: { field: UploadFieldId; path: string }[] = [];
      for (const field of Object.keys(files) as UploadFieldId[]) {
        const file = files[field];
        if (!file) continue;
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const urlRes = await fetch('/api/console-validation/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uploadId, field, ext, contentType: file.type }),
        });
        if (!urlRes.ok) throw new Error('Could not start the photo upload, please retry.');
        const { path, token } = await urlRes.json();
        const { error } = await supabase.storage.from('console-validations').uploadToSignedUrl(path, token, file);
        if (error) throw new Error(`Photo upload failed: ${error.message}`);
        photos.push({ field, path });
      }

      const res = await fetch('/api/console-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyName, country, machineName, notes, ref: refCode, invite: invite?.token, uploadId, photos, locale }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Something went wrong, please retry.');
      }
      const body = await res.json().catch(() => null);
      setReference(body?.reference ?? null);
      (window as any).gtag?.('event', 'console_validation_submit', { event_category: 'lead', machine: machineName });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Something went wrong, please retry.');
    } finally {
      setSending(false);
    }
  };

  const pressLabel = [pressBrand, model.trim()].filter(Boolean).join(' ');

  return (
    <main className="page-shell console-simple-page">
      <SiteNav current="console-validation" />

      <section className="section console-simple-section">
        <div className="container console-simple-shell">
          {submitted ? (
            <div className="cv-page">
              <div className="cv-wrap">
                <div className="cv-success">
                  <Confetti />
                  <div className="cv-seal-wrap">
                    <span className="cv-seal-burst" />
                    <div className="cv-seal">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                        <path d="M4 12.5l5 5L20 6.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="cv-suc-eyebrow cv-reveal" style={{ animationDelay: '.15s' }}>
                    Request received
                  </div>
                  <h1 className="cv-suc-title cv-reveal" style={{ animationDelay: '.22s' }}>
                    Thanks — we&apos;ve got your console validation.
                  </h1>
                  <p className="cv-suc-p cv-reveal" style={{ animationDelay: '.29s' }}>
                    Keep your reference for any follow-up. We&apos;ve also sent a confirmation to your email.
                  </p>
                  {reference ? (
                    <div className="cv-refbox cv-reveal" style={{ animationDelay: '.36s' }}>
                      <div className="cv-ref-k">Your reference</div>
                      <div className="cv-ref-v">{reference}</div>
                      <button
                        type="button"
                        className="cv-ref-copy"
                        onClick={() => {
                          navigator.clipboard?.writeText(reference).then(
                            () => {
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1800);
                            },
                            () => {}
                          );
                        }}
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  ) : null}
                  <div className="cv-suc-summary cv-reveal" style={{ animationDelay: '.43s' }}>
                    {[
                      ['Company', companyName],
                      ['Country', country],
                      ['Press', pressLabel],
                    ].map(([k, v]) => (
                      <div key={k} className="cv-suc-cell">
                        <div className="cv-suc-k">{k}</div>
                        <div className="cv-suc-v">{v || '—'}</div>
                      </div>
                    ))}
                  </div>
                  <div className="cv-next cv-reveal" style={{ animationDelay: '.5s' }}>
                    <div className="cv-next-h">What happens next</div>
                    <ol className="cv-next-list">
                      <li>
                        <span className="cv-next-n">1</span>Our team reviews your photos.
                      </li>
                      <li>
                        <span className="cv-next-n">2</span>You receive a confirmation email with this reference.
                      </li>
                      <li>
                        <span className="cv-next-n">3</span>We reply within one business day with your press eligibility.
                      </li>
                    </ol>
                  </div>
                  <div className="cv-suc-actions cv-reveal" style={{ animationDelay: '.57s' }}>
                    <a className="cv-btn-primary" href="/account/console-validations">
                      Track your request →
                    </a>
                    <a className="cv-btn-ghost" href="/">
                      Back to rutherford.fr
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={`console-simple-intro${started ? ' is-started' : ''}`}>
                <p className="section-kicker">
                  {brand ? `Free eligibility check · ${brand.name}` : 'Free eligibility check'}
                </p>
                <h1>{brand ? `${brand.name} Console Validation` : 'Console Validation'}</h1>
                <p className="console-simple-tagline">The system that pays for itself.</p>
                <p className="console-simple-phone">Do everything from your phone.</p>
                {brand ? (
                  <p className="console-simple-brand-line">
                    Works with <strong>{brand.consoles}</strong> consoles on {brand.presses}.
                  </p>
                ) : null}
                {!started ? (
                  <div className="console-simple-cta-row">
                    <button type="button" className="button button-accent" onClick={startForm}>
                      Submit your information ↓
                    </button>
                  </div>
                ) : null}
                <div className={`cv-hero-extra${started ? ' is-out' : ''}`} aria-hidden={started}>
                  <div className="console-simple-intro-image">
                    <Image
                      src="/images/console-validation-sketch.png"
                      alt="Sketch of an offset press console"
                      width={1448}
                      height={1086}
                      priority
                      sizes="(max-width: 768px) 100vw, 960px"
                    />
                  </div>
                  <p className="console-simple-presses-label">Compatible consoles</p>
                  <div className="console-cta-presses console-simple-presses" aria-label="Compatible offset press brands">
                    <div className="console-cta-presses-track">
                      {[...PRESS_BRANDS, ...PRESS_BRANDS].map((b, i) => (
                        <span className="console-cta-press" key={`${b.alt}-${i}`}>
                          <Image src={b.src} alt={i < PRESS_BRANDS.length ? b.alt : ''} width={240} height={80} sizes="140px" />
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="console-simple-brand-links">
                    Your press: <a href="/console-validation/heidelberg">Heidelberg</a> ·{' '}
                    <a href="/console-validation/komori">Komori</a> ·{' '}
                    <a href="/console-validation/koenig-bauer">Koenig &amp; Bauer</a> ·{' '}
                    <a href="/console-validation/manroland">Manroland</a> ·{' '}
                    <a href="/console-validation/mitsubishi">Mitsubishi</a> ·{' '}
                    <a href="/console-validation/ryobi">Ryobi</a> · <a href="/console-validation/goss">Goss</a> ·{' '}
                    <a href="/console-validation/presstek">Presstek</a>
                  </p>
                  <p className="console-simple-roi-link">
                    Curious what color drift costs you? <a href="/#roi">Try the ROI calculator →</a>
                  </p>
                </div>
              </div>

              {started ? (
              <div className="cv-page cv-stage-form" id="submit">
                <div className="cv-wrap">
                  <div className="cv-stepcap">Step {step} of 3</div>
                  <div className="cv-stepper" key={step}>
                    {STEP_TITLES.map((t, i) => {
                      const n = i + 1;
                      const cls = n < step ? 'done' : n === step ? 'current' : 'future';
                      const can = n <= maxStep && n !== step;
                      return (
                        <Fragment key={i}>
                          {can ? (
                            <button type="button" className={`cv-stp ${cls}`} onClick={() => navTo(n)}>
                              <span className="cv-stp-n">{n < step ? '✓' : n}</span>
                              <span className="cv-stp-l">{t}</span>
                            </button>
                          ) : (
                            <div className={`cv-stp ${cls}`}>
                              <span className="cv-stp-n">{n < step ? '✓' : n}</span>
                              <span className="cv-stp-l">{t}</span>
                            </div>
                          )}
                          {i < 2 ? <span className={`cv-stp-c${n < step ? ' on' : ''}`} /> : null}
                        </Fragment>
                      );
                    })}
                  </div>

                  <div className="cv-stepcard" key={`card-${step}`}>
                    {step === 1 ? (
                      <>
                        <div className="cv-step-h">Your details</div>
                        {invite ? (
                          <div className="cv-login is-signed">
                            <span className="cv-login-ic">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            <span>
                              {invite.inviterCompany ? (
                                <>
                                  <strong>{invite.inviterCompany}</strong> invited you to validate your console — your
                                  details are below.
                                </>
                              ) : (
                                <>You&apos;ve been invited to validate your console — your details are below.</>
                              )}
                            </span>
                          </div>
                        ) : authConfigured ? (
                          signedInEmail ? (
                            <div className="cv-login is-signed">
                              <span className="cv-login-ic">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                              <span>
                                {onBehalf ? (
                                  <>
                                    Signed in as <strong>{signedInEmail}</strong> — submitting for a client. Enter the
                                    client&apos;s details below.
                                  </>
                                ) : (
                                  <>
                                    Signed in as <strong>{signedInEmail}</strong> — your details are prefilled.
                                  </>
                                )}
                              </span>
                            </div>
                          ) : (
                            <a className="cv-login" href="/account/sign-in?next=/console-validation">
                              <span className="cv-login-ic">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                                  <path d="M5 19c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                                </svg>
                              </span>
                              <span>
                                Have a Rutherford account? <strong>Log in</strong> to prefill your details and go faster
                              </span>
                              <span className="cv-login-arrow">→</span>
                            </a>
                          )
                        ) : null}
                        <div className="cv-grid2">
                          <label className="cv-field">
                            <span className="cv-label">
                              {onBehalf ? 'Client email address' : 'Email address'} <em>*</em>
                            </span>
                            <input
                              className="cv-input"
                              type="email"
                              placeholder={onBehalf ? 'client@company.com' : 'you@company.com'}
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </label>
                          <label className="cv-field">
                            <span className="cv-label">
                              {onBehalf ? 'Client company name' : 'Printing company name'} <em>*</em>
                            </span>
                            <input
                              className="cv-input"
                              type="text"
                              placeholder={onBehalf ? 'Client company' : 'Your company'}
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                            />
                          </label>
                          <label className="cv-field cv-field-full">
                            <span className="cv-label">
                              Country <em>*</em>
                            </span>
                            <span className="cv-selwrap">
                              <select
                                className="cv-input cv-select"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                              >
                                <option value="">Select a country</option>
                                {COUNTRY_NAMES.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                              <Caret />
                            </span>
                          </label>
                        </div>
                      </>
                    ) : null}

                    {step === 2 ? (
                      <>
                        <div className="cv-step-h">Your press</div>
                        <p className="cv-step-p">Pick your press brand — we&apos;ll only ask for the photos that apply to it.</p>
                        <div className="cv-grid2">
                          <label className="cv-field">
                            <span className="cv-label">
                              Press brand <em>*</em>
                            </span>
                            <span className="cv-selwrap">
                              <select
                                className="cv-input cv-select"
                                value={pressBrand}
                                onChange={(e) => setPressBrand(e.target.value)}
                              >
                                <option value="">Select a brand</option>
                                {BRANDS.map((b) => (
                                  <option key={b} value={b}>
                                    {b}
                                  </option>
                                ))}
                              </select>
                              <Caret />
                            </span>
                          </label>
                          <label className="cv-field">
                            <span className="cv-label">
                              Machine / model name <em>*</em>
                            </span>
                            <input
                              className="cv-input"
                              type="text"
                              placeholder={brand?.machinePlaceholder ?? 'e.g. CD 74-5'}
                              value={model}
                              onChange={(e) => setModel(e.target.value)}
                            />
                          </label>
                        </div>
                        {pressBrand ? (
                          <div className="cv-hint">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                              <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                            <span>
                              We&apos;ll ask for <b>{list.length} photos</b> for {pressBrand}
                              {inside ? ', including an inside-console shot' : ''}.
                            </span>
                          </div>
                        ) : null}
                      </>
                    ) : null}

                    {step === 3 ? (
                      <>
                        <div className="cv-step-h">Photos</div>
                        <p className="cv-step-p">Straight from your phone — tap a card to use the camera.</p>
                        <div className="cv-prog">
                          <div className="cv-prog-top">
                            <span>
                              <b>{photosDone}</b> of {list.length} photos added
                            </span>
                            <span className="cv-prog-pct">{pct}%</span>
                          </div>
                          <div className="cv-prog-bar">
                            <span style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="cv-upgrid">
                          {list.map((p) => (
                            <UploadCard
                              key={p.id}
                              config={p}
                              brand={pressBrand}
                              file={files[p.id]}
                              preview={previews[p.id]}
                              onChange={handleFileChange}
                            />
                          ))}
                        </div>
                        <label className="cv-field cv-notes">
                          <span className="cv-label">Additional notes</span>
                          <textarea
                            className="cv-input"
                            rows={3}
                            placeholder="Anything else we should know about your press or setup."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </label>
                      </>
                    ) : null}

                    {errorMsg ? (
                      <p className="cv-error" role="alert">
                        {errorMsg}
                      </p>
                    ) : null}
                  </div>

                  <div className="cv-stepnav">
                    {step > 1 ? (
                      <button type="button" className="cv-btn-ghost" onClick={() => navTo(step - 1)}>
                        ← Back
                      </button>
                    ) : (
                      <span />
                    )}
                    {step < 3 ? (
                      <button type="button" className="cv-btn-primary" onClick={goNext}>
                        Continue →
                      </button>
                    ) : (
                      <button type="button" className="cv-btn-primary" disabled={sending || photosLeft > 0} onClick={handleSubmit}>
                        {sending ? 'Sending…' : 'Send →'}
                      </button>
                    )}
                  </div>
                  {step === 3 && photosLeft > 0 ? (
                    <div className="cv-stepnote">
                      {photosLeft} photo{photosLeft > 1 ? 's' : ''} still to add
                    </div>
                  ) : null}
                  <Reassure />
                </div>
              </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      {faq && faq.length > 0 ? (
        <section className="section console-faq-section" aria-label="Frequently asked questions">
          <div className="container console-faq-shell">
            <h2 className="console-faq-title">Frequently asked questions</h2>
            <dl className="console-faq-list">
              {faq.map((item) => (
                <div className="console-faq-item" key={item.q}>
                  <dt>{item.q}</dt>
                  <dd>{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </main>
  );
}
