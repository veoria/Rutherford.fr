'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type SupportUploadId = 'support1' | 'support2' | 'support3';

type UploadConfig = { id: SupportUploadId; title: string; description: string };
type FileMap = Record<SupportUploadId, File | null>;
type PreviewMap = Record<SupportUploadId, string>;

const supportUploads: UploadConfig[] = [
  { id: 'support1', title: 'First picture', description: 'We need to see the full screen and not only a detail.' },
  { id: 'support2', title: 'Second picture', description: 'If you have a red error box, please touch it and capture the error message.' },
  { id: 'support3', title: 'Optional picture', description: 'Add any extra picture that can help us understand the issue faster.' },
];

const emptyFiles: FileMap = { support1: null, support2: null, support3: null };
const emptyPreviews: PreviewMap = { support1: '', support2: '', support3: '' };

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 18a4 4 0 0 1-.24-7.99A5.5 5.5 0 0 1 17.3 8.1 3.8 3.8 0 1 1 18 18H7Z" />
      <path d="M12 8.5v8" />
      <path d="m8.75 11.75 3.25-3.25 3.25 3.25" />
    </svg>
  );
}

function SupportUploadField({
  config,
  preview,
  file,
  onChange,
}: {
  config: UploadConfig;
  preview: string;
  file: File | null;
  onChange: (field: SupportUploadId, file: File | null) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(config.id, event.target.files?.[0] ?? null);
  };
  return (
    <div className="console-simple-upload-card">
      <div className="console-simple-upload-copy">
        <h3>{config.title}</h3>
        <p>{config.description}</p>
      </div>
      <label className={`console-simple-upload ${preview ? 'has-preview' : ''}`}>
        <input type="file" accept="image/*" onChange={handleChange} />
        {preview ? (
          <div className="console-simple-upload-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" />
            <strong>{file?.name}</strong>
          </div>
        ) : (
          <div className="console-simple-upload-empty">
            <UploadIcon />
            <strong>Upload image</strong>
            <span>Tap to use camera or choose a file</span>
          </div>
        )}
      </label>
    </div>
  );
}

export function SupportPage() {
  const [files, setFiles] = useState<FileMap>(emptyFiles);
  const [previews, setPreviews] = useState<PreviewMap>(emptyPreviews);
  const [email, setEmail] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [anydesk, setAnydesk] = useState('');
  const [problem, setProblem] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (!authConfigured) return;
    let active = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await createSupabaseBrowserClient().auth.getUser();
        if (user?.email && active) {
          setEmail(user.email);
          setSignedIn(true);
        }
      } catch {
        /* anonymous */
      }
    })();
    return () => {
      active = false;
    };
  }, [authConfigured]);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((value) => value && URL.revokeObjectURL(value));
    };
  }, [previews]);

  const handleFileChange = (field: SupportUploadId, file: File | null) => {
    setFiles((current) => ({ ...current, [field]: file }));
    setPreviews((current) => {
      if (current[field]) URL.revokeObjectURL(current[field]);
      return { ...current, [field]: file ? URL.createObjectURL(file) : '' };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !problem.trim()) {
      setError('Please enter your email and describe the problem.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const photos: { field: string; path: string }[] = [];
      const chosen = supportUploads.map((u) => ({ field: u.id, file: files[u.id] })).filter((x) => x.file);
      if (authConfigured && chosen.length) {
        const supabase = createSupabaseBrowserClient();
        const uploadId = (
          (typeof crypto !== 'undefined' && crypto.randomUUID?.()) ||
          Math.random().toString(36).slice(2)
        ).replace(/[^a-z0-9-]/gi, '');
        for (const { field, file } of chosen) {
          const ext = (file!.name.split('.').pop() || 'jpg').toLowerCase();
          const urlRes = await fetch('/api/console-validation/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field, uploadId, ext }),
          });
          if (!urlRes.ok) continue;
          const { path, token } = await urlRes.json();
          const { error: upErr } = await supabase.storage
            .from('console-validations')
            .uploadToSignedUrl(path, token, file!);
          if (!upErr) photos.push({ field, path });
        }
      }

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), anydesk: anydesk.trim(), description: problem.trim(), photos }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => null);
        throw new Error(b?.error ?? 'Something went wrong, please retry.');
      }
      const b = await res.json().catch(() => null);
      setReference(b?.reference ?? null);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong, please retry.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="page-shell console-simple-page">
      <SiteNav current="support" />

      <section className="section console-simple-section">
        <div className="container console-simple-shell">
          {submitted ? (
            <div className="console-simple-thankyou">
              <p className="section-kicker">Support</p>
              <h1>Thank you for your request.</h1>
              <p>
                {reference ? (
                  <>
                    Your ticket reference is <strong>#{reference}</strong>.{' '}
                  </>
                ) : null}
                We&apos;ve emailed you a confirmation. Our team will get back to you as quickly as possible.
              </p>
              <a className="button button-dark" href={signedIn ? '/account/support' : '/account/sign-in?next=/account/support'}>
                Track my ticket →
              </a>
            </div>
          ) : (
            <>
              <div className="console-simple-intro">
                <p className="section-kicker">Support</p>
                <h1>We are here to help you.</h1>
                <p>
                  Tell us what is happening on your press and share your AnyDesk number so our team can connect (with
                  your permission). We reply within one business day — and you can track your ticket from your account.
                </p>
              </div>

              <form className="console-simple-form" onSubmit={handleSubmit}>
                <div className="console-simple-stack">
                  <label className="console-simple-field">
                    <span>Email *</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={sending || signedIn}
                    />
                  </label>

                  <label className="console-simple-field">
                    <span>AnyDesk support number</span>
                    <input
                      type="text"
                      name="anydesk"
                      placeholder="e.g. 123 456 789"
                      value={anydesk}
                      onChange={(e) => setAnydesk(e.target.value)}
                      disabled={sending}
                    />
                  </label>
                </div>

                <label className="console-simple-field console-simple-field-full">
                  <span>Explain your problem *</span>
                  <textarea
                    name="problem"
                    rows={6}
                    placeholder="What happens, on which press / software, and since when? You can use your local language, but English helps us answer faster."
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    required
                    disabled={sending}
                  />
                </label>

                <div className="console-simple-uploads">
                  {supportUploads.map((upload) => (
                    <SupportUploadField
                      key={upload.id}
                      config={upload}
                      preview={previews[upload.id]}
                      file={files[upload.id]}
                      onChange={handleFileChange}
                    />
                  ))}
                </div>

                {error ? <p className="signin-message signin-message-error">{error}</p> : null}

                <div className="console-simple-submit">
                  <button className="button button-dark" type="submit" disabled={sending}>
                    {sending ? 'Sending…' : 'Send support request'}
                  </button>
                  <p>Mobile friendly. You can take and upload the photos directly from your phone.</p>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
