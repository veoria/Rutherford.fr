'use client';

import Image from 'next/image';
import { ChangeEvent, DragEvent, FormEvent, useEffect, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { COUNTRY_NAMES, isKnownCountry } from '@/lib/countries';

type UploadFieldId =
  | 'consolePhoto'
  | 'pressPhoto'
  | 'insideConsolePhoto'
  | 'keysPhoto'
  | 'platePhoto';

type UploadConfig = {
  id: UploadFieldId;
  title: string;
  description: string;
  note?: string;
  exampleSrc: string;
  exampleAlt: string;
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

const uploadFields: UploadConfig[] = [
  {
    id: 'consolePhoto',
    title: 'Console photo',
    description: 'Take one clear picture of the full console in its environment.',
    exampleSrc: '/images/Console offset.jpg',
    exampleAlt: 'Example console photo',
  },
  {
    id: 'pressPhoto',
    title: 'Press photo',
    description: 'Take one picture of the press with the brand, type and number of units visible if possible.',
    exampleSrc: '/images/Brand:Type and numbers of units.png',
    exampleAlt: 'Example press photo with brand, type and units',
  },
  {
    id: 'insideConsolePhoto',
    title: 'Inside console or computer',
    description: 'Take one picture inside the bottom of the console or computer cabinet.',
    note: 'Required only for Heidelberg, Komori and Mitsubishi.',
    exampleSrc: '/images/inside the bottom of the console or computer.png',
    exampleAlt: 'Example inside cabinet photo',
  },
  {
    id: 'keysPhoto',
    title: 'Number of keys',
    description: 'Take one close-up picture of the number of keys on the console.',
    exampleSrc: '/images/the number of keys.png',
    exampleAlt: 'Example number of keys photo',
  },
  {
    id: 'platePhoto',
    title: 'Machine plate number',
    description: 'Take one picture of the machine plate showing model, year and units.',
    exampleSrc: '/images/Take a picture of the machine plate number..png',
    exampleAlt: 'Example machine plate number photo',
  },
];

type PreviewMap = Record<UploadFieldId, string>;
type FileMap = Record<UploadFieldId, File | null>;

const emptyPreviews: PreviewMap = {
  consolePhoto: '',
  pressPhoto: '',
  insideConsolePhoto: '',
  keysPhoto: '',
  platePhoto: '',
};

const emptyFiles: FileMap = {
  consolePhoto: null,
  pressPhoto: null,
  insideConsolePhoto: null,
  keysPhoto: null,
  platePhoto: null,
};

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 18a4 4 0 0 1-.24-7.99A5.5 5.5 0 0 1 17.3 8.1 3.8 3.8 0 1 1 18 18H7Z" />
      <path d="M12 8.5v8" />
      <path d="m8.75 11.75 3.25-3.25 3.25 3.25" />
    </svg>
  );
}

function UploadField({
  config,
  preview,
  file,
  onChange,
}: {
  config: UploadConfig;
  preview: string;
  file: File | null;
  onChange: (field: UploadFieldId, file: File | null) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);
  const inputId = `upload-${config.id}`;

  // One place to validate whatever the user gives us — picked, captured or dropped.
  const accept = (incoming: File | null | undefined) => {
    if (!incoming) return;
    if (!incoming.type.startsWith('image/')) {
      setDropError('Please choose an image file (JPG, PNG, HEIC…).');
      return;
    }
    setDropError(null);
    onChange(config.id, incoming);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    accept(event.target.files?.[0] ?? null);
    // Reset so picking the same file again still fires onChange.
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="console-simple-upload-card">
      <div className="console-simple-upload-copy">
        <h3>{config.title}</h3>
        <p>{config.description}</p>
        {config.note ? <span>{config.note}</span> : null}
      </div>

      <div className="console-simple-example">
        <div className="console-simple-example-label">Example photo</div>
        <img src={config.exampleSrc} alt={config.exampleAlt} loading="lazy" />
      </div>

      <div
        className={`console-simple-upload ${preview ? 'has-preview' : ''} ${dragging ? 'is-dragging' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          // Ignore moves between child elements of the same zone.
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          setDragging(false);
        }}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          className="console-simple-upload-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleInput}
        />

        {preview ? (
          <div className="console-simple-upload-preview">
            <img src={preview} alt="" />
            <strong>{file?.name}</strong>
            <div className="console-simple-upload-actions">
              <label htmlFor={inputId} className="console-simple-upload-action">
                Replace
              </label>
              <button
                type="button"
                className="console-simple-upload-action is-remove"
                onClick={() => {
                  setDropError(null);
                  onChange(config.id, null);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor={inputId} className="console-simple-upload-empty">
            <UploadIcon />
            <strong>Drag &amp; drop or click</strong>
            <span>Drop an image here, or tap to use the camera</span>
          </label>
        )}

        {dragging ? (
          <div className="console-simple-upload-overlay" aria-hidden="true">
            Drop to upload
          </div>
        ) : null}
      </div>

      {dropError ? (
        <p className="console-simple-upload-error" role="alert">
          {dropError}
        </p>
      ) : null}
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

export function ConsoleValidationPage({
  brand,
  faq,
}: { brand?: ConsoleValidationBrand; faq?: ConsoleValidationFaqItem[] } = {}) {
  const [files, setFiles] = useState<FileMap>(emptyFiles);
  const [previews, setPreviews] = useState<PreviewMap>(emptyPreviews);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refCode, setRefCode] = useState('');

  // Controlled so we can prefill them from the signed-in profile / IP geo.
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Reseller attribution: carry a ?ref= code through to the submission. Read
  // from the URL on mount to keep this page statically renderable.
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) setRefCode(ref.slice(0, 100));
  }, []);

  // Prefill: signed-in profile first (email/company/country), then fall back to
  // IP geo for the country only. Each setter keeps any value the user already typed.
  useEffect(() => {
    let active = true;
    (async () => {
      let countryResolved = false;

      if (authConfigured) {
        try {
          const supabase = createSupabaseBrowserClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user && active) {
            setSignedInEmail(user.email ?? null);
            if (user.email) setEmail((value) => value || user.email!);
            const { data: profile } = await supabase
              .from('profiles')
              .select('company, country')
              .eq('id', user.id)
              .maybeSingle();
            if (profile && active) {
              if (profile.company) setCompanyName((value) => value || (profile.company as string));
              if (profile.country && isKnownCountry(profile.country as string)) {
                setCountry((value) => value || (profile.country as string));
                countryResolved = true;
              }
            }
          }
        } catch {
          // Anonymous / auth not available — fine.
        }
      }

      if (!countryResolved && active) {
        try {
          const res = await fetch('/api/geo');
          if (res.ok) {
            const { country: geoCountry } = await res.json();
            if (geoCountry && active) setCountry((value) => value || geoCountry);
          }
        } catch {
          // No geo — leave the field empty.
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [authConfigured]);

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
      if (current[field]) {
        URL.revokeObjectURL(current[field]);
      }

      return {
        ...current,
        [field]: file ? URL.createObjectURL(file) : '',
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setErrorMsg(null);

    const data = new FormData(event.currentTarget);
    const uploadId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      // Photos go straight to storage at full resolution (no size limit, no
      // quality loss); only their references are sent to the API.
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
        body: JSON.stringify({
          email,
          companyName,
          country,
          machineName: data.get('machineName'),
          notes: data.get('notes'),
          ref: refCode,
          uploadId,
          photos,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Something went wrong, please retry.');
      }
      // GA4 conversion event (no-op when analytics is not loaded).
      (window as any).gtag?.('event', 'console_validation_submit', {
        event_category: 'lead',
        machine: String(data.get('machineName') ?? ''),
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Something went wrong, please retry.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="page-shell console-simple-page">
      <SiteNav current="console-validation" />

      <section className="section console-simple-section">
        <div className="container console-simple-shell">
          {submitted ? (
            <div className="console-simple-thankyou">
              <p className="section-kicker">Console validation</p>
              <h1>Thank you.</h1>
              <p>
                Your console validation request has been received. Our team reviews every submission and comes back
                within one business day with your press eligibility and the next steps.
              </p>
              <button type="button" className="button button-dark" onClick={() => setSubmitted(false)}>
                Fill another form
              </button>
            </div>
          ) : (
            <>
              <div className="console-simple-intro">
                <p className="section-kicker">
                  {brand ? `Free eligibility check · ${brand.name}` : 'Free eligibility check'}
                </p>
                <h1>
                  {brand ? `${brand.name} Console Validation` : 'Console Validation'}
                </h1>
                <p className="console-simple-tagline">The system that pays for itself.</p>
                <p className="console-simple-phone">Do everything from your phone.</p>
                {brand ? (
                  <p className="console-simple-brand-line">
                    Works with <strong>{brand.consoles}</strong> consoles on {brand.presses}.
                  </p>
                ) : null}
                <div className="console-simple-cta-row">
                  <a className="button button-accent" href="#submit">
                    Submit your information ↓
                  </a>
                </div>
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
                    {[...PRESS_BRANDS, ...PRESS_BRANDS].map((brand, i) => (
                      <span className="console-cta-press" key={`${brand.alt}-${i}`}>
                        <Image
                          src={brand.src}
                          alt={i < PRESS_BRANDS.length ? brand.alt : ''}
                          width={240}
                          height={80}
                          sizes="140px"
                        />
                      </span>
                    ))}
                  </div>
                </div>
                <p className="console-simple-brand-links">
                  Your press:{' '}
                  <a href="/console-validation/heidelberg">Heidelberg</a> ·{' '}
                  <a href="/console-validation/komori">Komori</a> ·{' '}
                  <a href="/console-validation/koenig-bauer">Koenig &amp; Bauer</a> ·{' '}
                  <a href="/console-validation/manroland">Manroland</a> ·{' '}
                  <a href="/console-validation/mitsubishi">Mitsubishi</a> ·{' '}
                  <a href="/console-validation/ryobi">Ryobi</a> ·{' '}
                  <a href="/console-validation/goss">Goss</a> ·{' '}
                  <a href="/console-validation/presstek">Presstek</a>
                </p>
                <p className="console-simple-roi-link">
                  Curious what color drift costs you? <a href="/#roi">Try the ROI calculator →</a>
                </p>
              </div>

              <form id="submit" className="console-simple-form" onSubmit={handleSubmit}>
                <input type="hidden" name="ref" value={refCode} />

                {authConfigured ? (
                  signedInEmail ? (
                    <p className="console-simple-login-hint is-signed">
                      Signed in as <strong>{signedInEmail}</strong> — your details are prefilled.
                    </p>
                  ) : (
                    <a
                      className="console-simple-login-hint"
                      href="/account/sign-in?next=/console-validation"
                    >
                      Have a Rutherford account? <strong>Log in</strong> to prefill your details and go faster →
                    </a>
                  )
                ) : null}

                <div className="console-simple-grid">
                  <label className="console-simple-field">
                    <span>Email address *</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </label>

                  <label className="console-simple-field">
                    <span>Printing company name *</span>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="Your company name"
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      required
                    />
                  </label>

                  <label className="console-simple-field">
                    <span>Country *</span>
                    <select
                      name="country"
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select a country
                      </option>
                      {COUNTRY_NAMES.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="console-simple-field">
                    <span>Machine name *</span>
                    <input
                      type="text"
                      name="machineName"
                      placeholder={brand ? brand.machinePlaceholder : 'Brand, model, units'}
                      required
                    />
                  </label>
                </div>

                <div className="console-simple-uploads">
                  {uploadFields.map((field) => (
                    <UploadField
                      key={field.id}
                      config={field}
                      preview={previews[field.id]}
                      file={files[field.id]}
                      onChange={handleFileChange}
                    />
                  ))}
                </div>

                <label className="console-simple-field console-simple-field-full">
                  <span>Additional notes</span>
                  <textarea
                    name="notes"
                    rows={5}
                    placeholder="Optional notes about the console, software version or installation constraints"
                  />
                </label>

                <div className="console-simple-submit">
                  <button className="button button-dark" type="submit" disabled={sending}>
                    {sending ? 'Sending…' : 'Send'}
                  </button>
                  {errorMsg ? <p className="console-simple-error" role="alert">{errorMsg}</p> : null}
                  <p>
                    Do everything from your phone, photos straight from the camera.
                  </p>
                </div>
              </form>
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
