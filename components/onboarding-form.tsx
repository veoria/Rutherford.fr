'use client';

import { useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { COUNTRIES, JOB_TITLE_KEYS, type JobTitleKey } from '@/data/onboarding-options';

type OnboardingCopy = {
  title: string;
  subtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  countryLabel: string;
  selectCountry: string;
  companyLabel: string;
  companyPlaceholder: string;
  roleLabel: string;
  selectRole: string;
  submit: string;
  saving: string;
  errorRequired: string;
  errorGeneric: string;
  fine: string;
  roles: Record<JobTitleKey, string>;
};

const COPY: Record<Locale, OnboardingCopy> = {
  en: {
    title: 'Tell us about you',
    subtitle:
      'One quick step before you start. It helps us tailor the courses, certificates and support to your role.',
    nameLabel: 'Full name',
    namePlaceholder: 'Jane Doe',
    countryLabel: 'Country',
    selectCountry: 'Select your country',
    companyLabel: 'Company',
    companyPlaceholder: 'Acme Printing',
    roleLabel: 'Your role',
    selectRole: 'Select your role',
    submit: 'Continue',
    saving: 'Saving…',
    errorRequired: 'Please fill in all fields.',
    errorGeneric: 'Something went wrong. Please try again.',
    fine: 'We use this only to personalize your experience and, where relevant, to contact you about Rutherford solutions.',
    roles: {
      operator: 'Press operator',
      prepress: 'Prepress / Repro',
      production_manager: 'Production manager',
      quality_color: 'Quality / Color manager',
      purchasing: 'Purchasing',
      management: 'Owner / Management',
      brand_owner: 'Brand owner / Packaging buyer',
      sales_marketing: 'Sales / Marketing',
      other: 'Other',
    },
  },
  fr: {
    title: 'Parlez-nous de vous',
    subtitle:
      'Une étape rapide avant de commencer. Cela nous aide à adapter les cours, les certificats et le support à votre métier.',
    nameLabel: 'Nom complet',
    namePlaceholder: 'Jean Dupont',
    countryLabel: 'Pays',
    selectCountry: 'Sélectionnez votre pays',
    companyLabel: 'Société',
    companyPlaceholder: 'Imprimerie Dupont',
    roleLabel: 'Votre poste',
    selectRole: 'Sélectionnez votre poste',
    submit: 'Continuer',
    saving: 'Enregistrement…',
    errorRequired: 'Veuillez remplir tous les champs.',
    errorGeneric: 'Une erreur est survenue. Veuillez réessayer.',
    fine: 'Nous utilisons ces informations uniquement pour personnaliser votre expérience et, le cas échéant, vous contacter au sujet des solutions Rutherford.',
    roles: {
      operator: 'Conducteur de presse',
      prepress: 'Prépresse / Photogravure',
      production_manager: 'Responsable de production',
      quality_color: 'Qualité / Responsable couleur',
      purchasing: 'Achats',
      management: 'Direction / Dirigeant',
      brand_owner: 'Marque / Acheteur packaging',
      sales_marketing: 'Commercial / Marketing',
      other: 'Autre',
    },
  },
  de: {
    title: 'Erzählen Sie uns von sich',
    subtitle:
      'Ein kurzer Schritt, bevor Sie starten. So können wir Kurse, Zertifikate und Support auf Ihre Rolle abstimmen.',
    nameLabel: 'Vollständiger Name',
    namePlaceholder: 'Max Mustermann',
    countryLabel: 'Land',
    selectCountry: 'Land auswählen',
    companyLabel: 'Unternehmen',
    companyPlaceholder: 'Musterdruck GmbH',
    roleLabel: 'Ihre Rolle',
    selectRole: 'Rolle auswählen',
    submit: 'Weiter',
    saving: 'Wird gespeichert…',
    errorRequired: 'Bitte füllen Sie alle Felder aus.',
    errorGeneric: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    fine: 'Wir verwenden diese Angaben ausschließlich, um Ihr Erlebnis zu personalisieren und Sie gegebenenfalls zu Rutherford-Lösungen zu kontaktieren.',
    roles: {
      operator: 'Maschinenführer',
      prepress: 'Druckvorstufe / Repro',
      production_manager: 'Produktionsleiter',
      quality_color: 'Qualität / Farbmanagement',
      purchasing: 'Einkauf',
      management: 'Geschäftsführung / Inhaber',
      brand_owner: 'Markeninhaber / Verpackungseinkauf',
      sales_marketing: 'Vertrieb / Marketing',
      other: 'Sonstiges',
    },
  },
  it: {
    title: 'Ci parli di lei',
    subtitle:
      'Un passaggio veloce prima di iniziare. Ci aiuta ad adattare i corsi, i certificati e il supporto al suo ruolo.',
    nameLabel: 'Nome e cognome',
    namePlaceholder: 'Mario Rossi',
    countryLabel: 'Paese',
    selectCountry: 'Selezioni il suo paese',
    companyLabel: 'Azienda',
    companyPlaceholder: 'Tipografia Rossi',
    roleLabel: 'Il suo ruolo',
    selectRole: 'Selezioni il suo ruolo',
    submit: 'Continua',
    saving: 'Salvataggio…',
    errorRequired: 'Compili tutti i campi.',
    errorGeneric: 'Si è verificato un errore. Riprovi.',
    fine: 'Utilizziamo questi dati solo per personalizzare la sua esperienza ed eventualmente contattarla in merito alle soluzioni Rutherford.',
    roles: {
      operator: 'Conduttore di stampa',
      prepress: 'Prestampa / Fotolito',
      production_manager: 'Responsabile di produzione',
      quality_color: 'Qualità / Responsabile colore',
      purchasing: 'Acquisti',
      management: 'Direzione / Titolare',
      brand_owner: 'Brand / Acquirente packaging',
      sales_marketing: 'Vendite / Marketing',
      other: 'Altro',
    },
  },
  es: {
    title: 'Cuéntenos sobre usted',
    subtitle:
      'Un paso rápido antes de empezar. Nos ayuda a adaptar los cursos, los certificados y el soporte a su puesto.',
    nameLabel: 'Nombre completo',
    namePlaceholder: 'Juan Pérez',
    countryLabel: 'País',
    selectCountry: 'Seleccione su país',
    companyLabel: 'Empresa',
    companyPlaceholder: 'Imprenta Pérez',
    roleLabel: 'Su puesto',
    selectRole: 'Seleccione su puesto',
    submit: 'Continuar',
    saving: 'Guardando…',
    errorRequired: 'Complete todos los campos.',
    errorGeneric: 'Algo salió mal. Inténtelo de nuevo.',
    fine: 'Utilizamos estos datos solo para personalizar su experiencia y, si procede, contactarle sobre las soluciones Rutherford.',
    roles: {
      operator: 'Operador de prensa',
      prepress: 'Preimpresión / Fotomecánica',
      production_manager: 'Responsable de producción',
      quality_color: 'Calidad / Responsable de color',
      purchasing: 'Compras',
      management: 'Dirección / Propietario',
      brand_owner: 'Marca / Comprador de packaging',
      sales_marketing: 'Ventas / Marketing',
      other: 'Otro',
    },
  },
};

type Props = {
  next: string;
  needsName: boolean;
  defaultName: string;
};

export function OnboardingForm({ next, needsName, defaultName }: Props) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const [fullName, setFullName] = useState(defaultName);
  const [country, setCountry] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = fullName.trim();
    if (!country || !company.trim() || !jobTitle || (needsName && !trimmedName)) {
      setStatus('error');
      setErrorMsg(t.errorRequired);
      return;
    }
    setStatus('saving');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/account/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country,
          company: company.trim(),
          job_title: jobTitle,
          ...(needsName ? { full_name: trimmedName } : {}),
        }),
      });
      if (res.ok) {
        window.location.href = next;
        return;
      }
      if (res.status === 401) {
        window.location.href = `/account/sign-in?next=${encodeURIComponent('/account/onboarding')}`;
        return;
      }
      setStatus('error');
      setErrorMsg(t.errorGeneric);
    } catch {
      setStatus('error');
      setErrorMsg(t.errorGeneric);
    }
  };

  return (
    <main className="page-shell" id="top">
      <SiteNav current="account" />

      <section className="signin-section section">
        <div className="container signin-shell">
          <header className="signin-head">
            <p className="section-kicker">Rutherford Academy</p>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </header>

          <div className="signin-card">
            <form className="signin-form" onSubmit={handleSubmit}>
              {needsName ? (
                <>
                  <label htmlFor="onb-name" className="signin-label">
                    {t.nameLabel}
                  </label>
                  <input
                    id="onb-name"
                    type="text"
                    className="signin-input"
                    placeholder={t.namePlaceholder}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={status === 'saving'}
                  />
                </>
              ) : null}

              <label htmlFor="onb-country" className="signin-label">
                {t.countryLabel}
              </label>
              <select
                id="onb-country"
                className="signin-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                disabled={status === 'saving'}
              >
                <option value="" disabled>
                  {t.selectCountry}
                </option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <label htmlFor="onb-company" className="signin-label">
                {t.companyLabel}
              </label>
              <input
                id="onb-company"
                type="text"
                className="signin-input"
                placeholder={t.companyPlaceholder}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                disabled={status === 'saving'}
              />

              <label htmlFor="onb-role" className="signin-label">
                {t.roleLabel}
              </label>
              <select
                id="onb-role"
                className="signin-input"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                disabled={status === 'saving'}
              >
                <option value="" disabled>
                  {t.selectRole}
                </option>
                {JOB_TITLE_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {t.roles[key]}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="button button-accent signin-submit"
                disabled={status === 'saving'}
              >
                {status === 'saving' ? t.saving : t.submit}
              </button>
            </form>

            {status === 'error' && errorMsg ? (
              <p className="signin-message signin-message-error">{errorMsg}</p>
            ) : null}

            <p className="signin-fine">{t.fine}</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
