'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';

type SupportUploadId = 'firstPicture' | 'secondPicture' | 'optionalPicture';

type UploadConfig = {
  id: SupportUploadId;
  title: string;
  description: string;
};

type FileMap = Record<SupportUploadId, File | null>;
type PreviewMap = Record<SupportUploadId, string>;

const supportUploads: UploadConfig[] = [
  {
    id: 'firstPicture',
    title: 'First picture',
    description: 'We need to see the full screen and not only a detail.',
  },
  {
    id: 'secondPicture',
    title: 'Second picture',
    description: 'If you have a red error box, please touch it and capture the error message.',
  },
  {
    id: 'optionalPicture',
    title: 'Optional picture',
    description: 'Add any extra picture that can help us understand the issue faster.',
  },
];

const emptyFiles: FileMap = {
  firstPicture: null,
  secondPicture: null,
  optionalPicture: null,
};

const emptyPreviews: PreviewMap = {
  firstPicture: '',
  secondPicture: '',
  optionalPicture: '',
};

const countryOptions = [
  'Belgium',
  'Canada',
  'China',
  'France',
  'Germany',
  'Italy',
  'Japan',
  'Morocco',
  'Netherlands',
  'Poland',
  'Portugal',
  'Spain',
  'Sweden',
  'Switzerland',
  'United Kingdom',
  'United States',
];

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
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((value) => {
        if (value) URL.revokeObjectURL(value);
      });
    };
  }, [previews]);

  const handleFileChange = (field: SupportUploadId, file: File | null) => {
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                You will receive an email with your support number. Our team will review your message and get back to
                you as quickly as possible.
              </p>
              <button type="button" className="button button-dark" onClick={() => setSubmitted(false)}>
                Send another request
              </button>
            </div>
          ) : (
            <>
              <div className="console-simple-intro">
                <p className="section-kicker">Support</p>
                <h1>We are here to help you.</h1>
                <div className="console-simple-intro-image">
                  <Image
                    src="/images/Hugues on console press offset.jpg"
                    alt="Rutherford support technician on press console"
                    width={1152}
                    height={768}
                    priority
                    sizes="(max-width: 768px) 100vw, 960px"
                  />
                </div>
                <p>
                  Tell us what is happening on your press and send the essential information first. This form is
                  optimized for mobile so it can be completed directly from the pressroom.
                </p>
              </div>

              <form className="console-simple-form" onSubmit={handleSubmit}>
                <div className="console-simple-stack">
                  <label className="console-simple-field">
                    <span>Country *</span>
                    <select name="country" defaultValue="" required>
                      <option value="" disabled>
                        Select a country
                      </option>
                      {countryOptions.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="console-simple-field">
                    <span>Printing company name *</span>
                    <input type="text" name="companyName" placeholder="Your company name" required />
                  </label>

                  <label className="console-simple-field">
                    <span>Email *</span>
                    <input type="email" name="email" placeholder="name@example.com" required />
                  </label>

                  <label className="console-simple-field">
                    <span>AnyDesk support number</span>
                    <input type="text" name="anydesk" placeholder="Type your AnyDesk number" />
                  </label>
                </div>

                <label className="console-simple-field console-simple-field-full">
                  <span>Explain your problem *</span>
                  <textarea
                    name="problem"
                    rows={6}
                    placeholder="You can use your local language, but English helps us answer faster."
                    required
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

                <div className="console-simple-submit">
                  <button className="button button-dark" type="submit">
                    Send support request
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
