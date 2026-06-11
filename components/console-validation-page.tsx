'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';

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
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(config.id, event.target.files?.[0] ?? null);
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

      <label className={`console-simple-upload ${preview ? 'has-preview' : ''}`}>
        <input type="file" accept="image/*" capture="environment" onChange={handleChange} />
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

export function ConsoleValidationPage() {
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                Your request has been prepared. If you want, I can next connect this form to email, CRM or database
                storage so the submissions are actually collected automatically.
              </p>
              <button type="button" className="button button-dark" onClick={() => setSubmitted(false)}>
                Fill another form
              </button>
            </div>
          ) : (
            <>
              <div className="console-simple-intro">
                <p className="section-kicker">Console validation</p>
                <h1>Validate your press console.</h1>
                <div className="console-simple-intro-image">
                  <Image
                    src="/images/Bundle Rutherford-4.jpg"
                    alt="Rutherford console validation setup"
                    width={1024}
                    height={768}
                    priority
                    sizes="(max-width: 768px) 100vw, 960px"
                  />
                </div>
                <p>
                  Fill in the information below and upload the requested pictures. The form is designed to be simple on
                  desktop and very easy to complete on a phone.
                </p>
              </div>

              <form className="console-simple-form" onSubmit={handleSubmit}>
                <div className="console-simple-grid">
                  <label className="console-simple-field">
                    <span>Email address *</span>
                    <input type="email" name="email" placeholder="name@example.com" required />
                  </label>

                  <label className="console-simple-field">
                    <span>Printing company name *</span>
                    <input type="text" name="companyName" placeholder="Your company name" required />
                  </label>

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
                    <span>Machine name *</span>
                    <input type="text" name="machineName" placeholder="Brand, model, units" required />
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
                  <button className="button button-dark" type="submit">
                    Send
                  </button>
                  <p>
                    Mobile friendly. Images can be taken directly from the phone camera.
                  </p>
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
