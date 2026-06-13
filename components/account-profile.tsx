'use client';

import { useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { COUNTRIES, JOB_TITLE_KEYS, type JobTitleKey } from '@/data/onboarding-options';
import type { AccountType } from '@/data/account-types';

type Copy = {
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
  loginEmailLabel: string;
  notifLabel: string;
  notifPlaceholder: string;
  notifHint: string;
  typeLabel: string;
  typeHint: string;
  submit: string;
  saving: string;
  saved: string;
  errorRequired: string;
  errorGeneric: string;
  roles: Record<JobTitleKey, string>;
  types: Record<AccountType, string>;
};

const COPY: Record<Locale, Copy> = {
  en: {
    title: 'My profile',
    subtitle: 'Keep your details up to date — we use them to tailor your support and reach you about your requests.',
    nameLabel: 'Full name',
    namePlaceholder: 'Jane Doe',
    countryLabel: 'Country',
    selectCountry: 'Select your country',
    companyLabel: 'Company',
    companyPlaceholder: 'Acme Printing',
    roleLabel: 'Your role',
    selectRole: 'Select your role',
    loginEmailLabel: 'Login email',
    notifLabel: 'Notification email (optional)',
    notifPlaceholder: 'notifications@company.com',
    notifHint: 'Where we send updates about your requests. Leave empty to use your login email.',
    typeLabel: 'Account type',
    typeHint: 'Set by Rutherford — based on your organization.',
    submit: 'Save changes',
    saving: 'Saving…',
    saved: 'Profile saved.',
    errorRequired: 'Please fill in name, country, company and role.',
    errorGeneric: 'Something went wrong. Please try again.',
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
    types: {
      client: 'Direct client',
      reseller: 'Reseller',
      distributor: 'Distributor (X-Rite)',
      team: 'Rutherford team',
    },
  },
  fr: {
    title: 'Mon profil',
    subtitle: 'Gardez vos informations à jour — elles nous servent à adapter votre support et à vous joindre au sujet de vos demandes.',
    nameLabel: 'Nom complet',
    namePlaceholder: 'Jean Dupont',
    countryLabel: 'Pays',
    selectCountry: 'Sélectionnez votre pays',
    companyLabel: 'Société',
    companyPlaceholder: 'Imprimerie Dupont',
    roleLabel: 'Votre poste',
    selectRole: 'Sélectionnez votre poste',
    loginEmailLabel: 'Email de connexion',
    notifLabel: 'Email de notification (facultatif)',
    notifPlaceholder: 'notifications@entreprise.com',
    notifHint: 'L’adresse où nous envoyons le suivi de vos demandes. Laissez vide pour utiliser votre email de connexion.',
    typeLabel: 'Type de compte',
    typeHint: 'Défini par Rutherford — selon votre organisation.',
    submit: 'Enregistrer',
    saving: 'Enregistrement…',
    saved: 'Profil enregistré.',
    errorRequired: 'Veuillez renseigner le nom, le pays, la société et le poste.',
    errorGeneric: 'Une erreur est survenue. Veuillez réessayer.',
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
    types: {
      client: 'Client direct',
      reseller: 'Revendeur',
      distributor: 'Distributeur (X-Rite)',
      team: 'Équipe Rutherford',
    },
  },
  de: {
    title: 'Mein Profil',
    subtitle: 'Halten Sie Ihre Angaben aktuell — wir nutzen sie, um Ihren Support anzupassen und Sie zu Ihren Anfragen zu erreichen.',
    nameLabel: 'Vollständiger Name',
    namePlaceholder: 'Max Mustermann',
    countryLabel: 'Land',
    selectCountry: 'Land auswählen',
    companyLabel: 'Unternehmen',
    companyPlaceholder: 'Musterdruck GmbH',
    roleLabel: 'Ihre Rolle',
    selectRole: 'Rolle auswählen',
    loginEmailLabel: 'Login-E-Mail',
    notifLabel: 'Benachrichtigungs-E-Mail (optional)',
    notifPlaceholder: 'benachrichtigung@firma.com',
    notifHint: 'Wohin wir Updates zu Ihren Anfragen senden. Leer lassen, um Ihre Login-E-Mail zu verwenden.',
    typeLabel: 'Kontotyp',
    typeHint: 'Von Rutherford festgelegt — anhand Ihrer Organisation.',
    submit: 'Speichern',
    saving: 'Wird gespeichert…',
    saved: 'Profil gespeichert.',
    errorRequired: 'Bitte Name, Land, Unternehmen und Rolle ausfüllen.',
    errorGeneric: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
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
    types: {
      client: 'Direktkunde',
      reseller: 'Wiederverkäufer',
      distributor: 'Distributor (X-Rite)',
      team: 'Rutherford-Team',
    },
  },
  it: {
    title: 'Il mio profilo',
    subtitle: 'Mantenga aggiornati i suoi dati — li usiamo per adattare il supporto e contattarla in merito alle sue richieste.',
    nameLabel: 'Nome e cognome',
    namePlaceholder: 'Mario Rossi',
    countryLabel: 'Paese',
    selectCountry: 'Selezioni il suo paese',
    companyLabel: 'Azienda',
    companyPlaceholder: 'Tipografia Rossi',
    roleLabel: 'Il suo ruolo',
    selectRole: 'Selezioni il suo ruolo',
    loginEmailLabel: 'Email di accesso',
    notifLabel: 'Email di notifica (facoltativa)',
    notifPlaceholder: 'notifiche@azienda.com',
    notifHint: 'Dove inviamo gli aggiornamenti sulle sue richieste. Lasci vuoto per usare l’email di accesso.',
    typeLabel: 'Tipo di account',
    typeHint: 'Definito da Rutherford — in base alla sua organizzazione.',
    submit: 'Salva',
    saving: 'Salvataggio…',
    saved: 'Profilo salvato.',
    errorRequired: 'Compili nome, paese, azienda e ruolo.',
    errorGeneric: 'Si è verificato un errore. Riprovi.',
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
    types: {
      client: 'Cliente diretto',
      reseller: 'Rivenditore',
      distributor: 'Distributore (X-Rite)',
      team: 'Team Rutherford',
    },
  },
  es: {
    title: 'Mi perfil',
    subtitle: 'Mantenga sus datos actualizados — los usamos para adaptar su soporte y contactarle sobre sus solicitudes.',
    nameLabel: 'Nombre completo',
    namePlaceholder: 'Juan Pérez',
    countryLabel: 'País',
    selectCountry: 'Seleccione su país',
    companyLabel: 'Empresa',
    companyPlaceholder: 'Imprenta Pérez',
    roleLabel: 'Su puesto',
    selectRole: 'Seleccione su puesto',
    loginEmailLabel: 'Email de acceso',
    notifLabel: 'Email de notificación (opcional)',
    notifPlaceholder: 'notificaciones@empresa.com',
    notifHint: 'Dónde enviamos las novedades de sus solicitudes. Déjelo vacío para usar su email de acceso.',
    typeLabel: 'Tipo de cuenta',
    typeHint: 'Definido por Rutherford — según su organización.',
    submit: 'Guardar',
    saving: 'Guardando…',
    saved: 'Perfil guardado.',
    errorRequired: 'Complete nombre, país, empresa y puesto.',
    errorGeneric: 'Algo salió mal. Inténtelo de nuevo.',
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
    types: {
      client: 'Cliente directo',
      reseller: 'Revendedor',
      distributor: 'Distribuidor (X-Rite)',
      team: 'Equipo Rutherford',
    },
  },
};

type Props = {
  email: string;
  accountType: AccountType;
  defaults: {
    fullName: string;
    country: string;
    company: string;
    jobTitle: string;
    notificationEmail: string;
  };
};

export function AccountProfile({ email, accountType, defaults }: Props) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const [fullName, setFullName] = useState(defaults.fullName);
  const [country, setCountry] = useState(defaults.country);
  const [company, setCompany] = useState(defaults.company);
  const [jobTitle, setJobTitle] = useState(defaults.jobTitle);
  const [notif, setNotif] = useState(defaults.notificationEmail);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim() || !country || !company.trim() || !jobTitle) {
      setStatus('error');
      setErrorMsg(t.errorRequired);
      return;
    }
    setStatus('saving');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          country,
          company: company.trim(),
          job_title: jobTitle,
          notification_email: notif.trim(),
        }),
      });
      if (res.ok) {
        setStatus('saved');
        return;
      }
      if (res.status === 401) {
        window.location.href = `/account/sign-in?next=${encodeURIComponent('/account/profile')}`;
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
            <p className="section-kicker">Rutherford</p>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </header>

          <div className="signin-card">
            <form className="signin-form" onSubmit={handleSubmit}>
              <label htmlFor="pf-name" className="signin-label">
                {t.nameLabel}
              </label>
              <input
                id="pf-name"
                type="text"
                className="signin-input"
                placeholder={t.namePlaceholder}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={status === 'saving'}
              />

              <label htmlFor="pf-country" className="signin-label">
                {t.countryLabel}
              </label>
              <select
                id="pf-country"
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

              <label htmlFor="pf-company" className="signin-label">
                {t.companyLabel}
              </label>
              <input
                id="pf-company"
                type="text"
                className="signin-input"
                placeholder={t.companyPlaceholder}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                disabled={status === 'saving'}
              />

              <label htmlFor="pf-role" className="signin-label">
                {t.roleLabel}
              </label>
              <select
                id="pf-role"
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

              <label htmlFor="pf-notif" className="signin-label">
                {t.notifLabel}
              </label>
              <input
                id="pf-notif"
                type="email"
                className="signin-input"
                placeholder={t.notifPlaceholder}
                value={notif}
                onChange={(e) => setNotif(e.target.value)}
                disabled={status === 'saving'}
              />
              <p className="signin-fine signin-fine-tight">{t.notifHint}</p>

              <button
                type="submit"
                className="button button-accent signin-submit"
                disabled={status === 'saving'}
              >
                {status === 'saving' ? t.saving : t.submit}
              </button>
            </form>

            {status === 'saved' ? (
              <p className="signin-message signin-message-ok">{t.saved}</p>
            ) : null}
            {status === 'error' && errorMsg ? (
              <p className="signin-message signin-message-error">{errorMsg}</p>
            ) : null}

            <div className="account-profile-meta">
              <div>
                <span className="account-profile-meta-k">{t.loginEmailLabel}</span>
                <span className="account-profile-meta-v">{email}</span>
              </div>
              <div>
                <span className="account-profile-meta-k">{t.typeLabel}</span>
                <span className="account-profile-meta-v">
                  <span className={`account-type-badge account-type-${accountType}`}>
                    {t.types[accountType]}
                  </span>
                </span>
                <span className="signin-fine signin-fine-tight">{t.typeHint}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
