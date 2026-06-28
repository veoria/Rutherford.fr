'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { AccountSubnav } from '@/components/account-subnav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { COUNTRIES, JOB_TITLE_KEYS, TEAM_ROLE_KEYS, type JobTitleKey } from '@/data/onboarding-options';
import { TEAM_ROLE_LABELS } from '@/data/team-role-labels';
import type { AccountType } from '@/data/account-types';

// Profile-completion banner copy (the % is computed from the filled fields).
const BANNER: Record<Locale, { title: (pct: number) => string; sub: string }> = {
  en: { title: (p) => `Profile ${p}% complete`, sub: 'Complete your profile to unlock all partner features.' },
  fr: { title: (p) => `Profil complété à ${p} %`, sub: 'Complétez votre profil pour débloquer toutes les fonctionnalités partenaire.' },
  de: { title: (p) => `Profil zu ${p}% ausgefüllt`, sub: 'Vervollständigen Sie Ihr Profil, um alle Partnerfunktionen freizuschalten.' },
  it: { title: (p) => `Profilo completato al ${p}%`, sub: 'Completa il tuo profilo per sbloccare tutte le funzionalità partner.' },
  es: { title: (p) => `Perfil completado al ${p}%`, sub: 'Complete su perfil para desbloquear todas las funciones de partner.' },
};

// Read-mode copy for the redesigned profile (identity card + info/company/security
// cards). The editable form keeps using COPY below; this is the surrounding view.
type View = {
  eyebrow: string;
  pageTitle: string;
  pageSub: string;
  editProfile: string;
  back: string;
  infoTitle: string;
  companyTitle: string;
  securityTitle: string;
  edit: string;
  notProvided: string;
  funcLabel: string;
  emailField: string;
  notifField: string;
  raisonLabel: string;
  logoField: string;
  logoEmpty: string;
  passwordLabel: string;
  passwordSub: string;
  passwordBtn: string;
  twoFaTitle: string;
  twoFaSub: string;
  twoFaOff: string;
  twoFaOnLabel: string;
  twoFaEnable: string;
  twoFaManage: string;
  chip2fa: string;
};

const VIEW: Record<Locale, View> = {
  en: {
    eyebrow: 'Partner area',
    pageTitle: 'Profile',
    pageSub: 'Your personal details, your company and your security.',
    editProfile: 'Edit profile',
    back: '← Back',
    infoTitle: 'Personal information',
    companyTitle: 'Company',
    securityTitle: 'Security',
    edit: 'Edit',
    notProvided: 'Not provided',
    funcLabel: 'Role',
    emailField: 'Email',
    notifField: 'Notification email',
    raisonLabel: 'Company name',
    logoField: 'Company logo',
    logoEmpty: 'No logo',
    passwordLabel: 'Password',
    passwordSub: 'Set or change your sign-in password.',
    passwordBtn: 'Change password',
    twoFaTitle: 'Two-factor authentication (2FA)',
    twoFaSub: 'Adds an extra layer of security to your partner account.',
    twoFaOff: 'Not enabled',
    twoFaOnLabel: 'Enabled',
    twoFaEnable: 'Enable 2FA',
    twoFaManage: 'Manage 2FA',
    chip2fa: 'Two-factor (2FA)',
  },
  fr: {
    eyebrow: 'Espace partenaire',
    pageTitle: 'Profil',
    pageSub: 'Vos informations personnelles, votre société et votre sécurité.',
    editProfile: 'Modifier le profil',
    back: '← Retour',
    infoTitle: 'Informations personnelles',
    companyTitle: 'Société',
    securityTitle: 'Sécurité',
    edit: 'Modifier',
    notProvided: 'Non renseigné',
    funcLabel: 'Fonction',
    emailField: 'E-mail',
    notifField: 'E-mail de notification',
    raisonLabel: 'Raison sociale',
    logoField: 'Logo de la société',
    logoEmpty: 'Aucun logo',
    passwordLabel: 'Mot de passe',
    passwordSub: 'Définissez ou modifiez votre mot de passe de connexion.',
    passwordBtn: 'Changer le mot de passe',
    twoFaTitle: 'Authentification à deux facteurs (2FA)',
    twoFaSub: 'Renforce la sécurité de votre compte partenaire.',
    twoFaOff: 'Non activée',
    twoFaOnLabel: 'Activée',
    twoFaEnable: 'Activer la 2FA',
    twoFaManage: 'Gérer la 2FA',
    chip2fa: 'Authentification 2FA',
  },
  de: {
    eyebrow: 'Partnerbereich',
    pageTitle: 'Profil',
    pageSub: 'Ihre persönlichen Daten, Ihr Unternehmen und Ihre Sicherheit.',
    editProfile: 'Profil bearbeiten',
    back: '← Zurück',
    infoTitle: 'Persönliche Informationen',
    companyTitle: 'Unternehmen',
    securityTitle: 'Sicherheit',
    edit: 'Bearbeiten',
    notProvided: 'Nicht angegeben',
    funcLabel: 'Funktion',
    emailField: 'E-Mail',
    notifField: 'Benachrichtigungs-E-Mail',
    raisonLabel: 'Firmenname',
    logoField: 'Firmenlogo',
    logoEmpty: 'Kein Logo',
    passwordLabel: 'Passwort',
    passwordSub: 'Legen Sie Ihr Anmeldepasswort fest oder ändern Sie es.',
    passwordBtn: 'Passwort ändern',
    twoFaTitle: 'Zwei-Faktor-Authentifizierung (2FA)',
    twoFaSub: 'Erhöht die Sicherheit Ihres Partnerkontos.',
    twoFaOff: 'Nicht aktiviert',
    twoFaOnLabel: 'Aktiviert',
    twoFaEnable: '2FA aktivieren',
    twoFaManage: '2FA verwalten',
    chip2fa: 'Zwei-Faktor (2FA)',
  },
  it: {
    eyebrow: 'Area partner',
    pageTitle: 'Profilo',
    pageSub: 'I suoi dati personali, la sua azienda e la sua sicurezza.',
    editProfile: 'Modifica profilo',
    back: '← Indietro',
    infoTitle: 'Informazioni personali',
    companyTitle: 'Azienda',
    securityTitle: 'Sicurezza',
    edit: 'Modifica',
    notProvided: 'Non indicato',
    funcLabel: 'Funzione',
    emailField: 'E-mail',
    notifField: 'E-mail di notifica',
    raisonLabel: 'Ragione sociale',
    logoField: 'Logo aziendale',
    logoEmpty: 'Nessun logo',
    passwordLabel: 'Password',
    passwordSub: 'Imposti o modifichi la password di accesso.',
    passwordBtn: 'Cambia password',
    twoFaTitle: 'Autenticazione a due fattori (2FA)',
    twoFaSub: 'Rafforza la sicurezza del suo account partner.',
    twoFaOff: 'Non attiva',
    twoFaOnLabel: 'Attiva',
    twoFaEnable: 'Attiva la 2FA',
    twoFaManage: 'Gestisci la 2FA',
    chip2fa: 'Due fattori (2FA)',
  },
  es: {
    eyebrow: 'Área de partner',
    pageTitle: 'Perfil',
    pageSub: 'Sus datos personales, su empresa y su seguridad.',
    editProfile: 'Editar perfil',
    back: '← Volver',
    infoTitle: 'Información personal',
    companyTitle: 'Empresa',
    securityTitle: 'Seguridad',
    edit: 'Editar',
    notProvided: 'No indicado',
    funcLabel: 'Función',
    emailField: 'Correo',
    notifField: 'Email de notificación',
    raisonLabel: 'Razón social',
    logoField: 'Logo de la empresa',
    logoEmpty: 'Sin logo',
    passwordLabel: 'Contraseña',
    passwordSub: 'Establezca o cambie su contraseña de acceso.',
    passwordBtn: 'Cambiar contraseña',
    twoFaTitle: 'Autenticación de dos factores (2FA)',
    twoFaSub: 'Refuerza la seguridad de su cuenta de partner.',
    twoFaOff: 'No activada',
    twoFaOnLabel: 'Activada',
    twoFaEnable: 'Activar 2FA',
    twoFaManage: 'Gestionar 2FA',
    chip2fa: 'Doble factor (2FA)',
  },
};

// Initials for the avatar circle — same convention as the header chip.
function pfInitials(name: string, email: string): string {
  const n = name.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
  return (email.slice(0, 2) || '?').toUpperCase();
}

// One labelled value in an info/company card; missing values show red "Not provided".
function ProfileField({ label, value, empty }: { label: string; value: string; empty: string }) {
  const has = Boolean(value && value.trim());
  return (
    <div className="profile-field">
      <span className="profile-field-k">{label}</span>
      <span className={`profile-field-v${has ? '' : ' is-empty'}`}>{has ? value : empty}</span>
    </div>
  );
}

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
  rgpdTitle: string;
  rgpdDesc: string;
  exportBtn: string;
  deleteBtn: string;
  deleteConfirm: string;
  deleteYes: string;
  deleteCancel: string;
  deleting: string;
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
    rgpdTitle: 'Your data',
    rgpdDesc: 'Download everything we hold about you, or permanently delete your account.',
    exportBtn: 'Export my data',
    deleteBtn: 'Delete my account',
    deleteConfirm: 'Permanently delete your account and data?',
    deleteYes: 'Yes, delete',
    deleteCancel: 'Cancel',
    deleting: 'Deleting…',
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
    rgpdTitle: 'Vos données',
    rgpdDesc: 'Téléchargez toutes les données que nous détenons sur vous, ou supprimez définitivement votre compte.',
    exportBtn: 'Exporter mes données',
    deleteBtn: 'Supprimer mon compte',
    deleteConfirm: 'Supprimer définitivement votre compte et vos données ?',
    deleteYes: 'Oui, supprimer',
    deleteCancel: 'Annuler',
    deleting: 'Suppression…',
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
    rgpdTitle: 'Ihre Daten',
    rgpdDesc: 'Laden Sie alle Daten herunter, die wir über Sie speichern, oder löschen Sie Ihr Konto endgültig.',
    exportBtn: 'Meine Daten exportieren',
    deleteBtn: 'Mein Konto löschen',
    deleteConfirm: 'Konto und Daten endgültig löschen?',
    deleteYes: 'Ja, löschen',
    deleteCancel: 'Abbrechen',
    deleting: 'Wird gelöscht…',
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
    rgpdTitle: 'I suoi dati',
    rgpdDesc: 'Scarichi tutti i dati che conserviamo su di lei, o elimini definitivamente il suo account.',
    exportBtn: 'Esporta i miei dati',
    deleteBtn: 'Elimina il mio account',
    deleteConfirm: 'Eliminare definitivamente account e dati?',
    deleteYes: 'Sì, elimina',
    deleteCancel: 'Annulla',
    deleting: 'Eliminazione…',
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
    rgpdTitle: 'Sus datos',
    rgpdDesc: 'Descargue todos los datos que tenemos sobre usted, o elimine su cuenta permanentemente.',
    exportBtn: 'Exportar mis datos',
    deleteBtn: 'Eliminar mi cuenta',
    deleteConfirm: '¿Eliminar permanentemente su cuenta y datos?',
    deleteYes: 'Sí, eliminar',
    deleteCancel: 'Cancelar',
    deleting: 'Eliminando…',
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
  const v = VIEW[locale];
  // Internal team: company + country are fixed by the domain, so we hide those
  // fields and offer the internal role taxonomy instead of the printing roles.
  const isTeam = accountType === 'team';
  const teamRoles = TEAM_ROLE_LABELS[locale];
  const [fullName, setFullName] = useState(defaults.fullName);
  const [country, setCountry] = useState(defaults.country);
  const [company, setCompany] = useState(defaults.company);
  const [jobTitle, setJobTitle] = useState(defaults.jobTitle);
  const [notif, setNotif] = useState(defaults.notificationEmail);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Read view (cards) vs. edit view (the form). Defaults to the read view.
  const [editing, setEditing] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  // Real 2FA state, read straight from Supabase MFA factors.
  const [twoFa, setTwoFa] = useState<'loading' | 'on' | 'off'>('loading');

  // Co-brand / company logo (top-right of the Société card), same lookup as the subnav.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createSupabaseBrowserClient();
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active || !data.user) return;
      const { data: prof } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', data.user.id)
        .maybeSingle();
      const orgId = (prof?.organization_id as string | null) ?? null;
      if (!orgId) return;
      const { data: org } = await supabase.from('organizations').select('logo_url').eq('id', orgId).maybeSingle();
      if (active) setLogoUrl((org?.logo_url as string | null) ?? null);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Whether the account has an active TOTP factor — drives the security card + chip.
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setTwoFa('off');
      return;
    }
    const supabase = createSupabaseBrowserClient();
    let active = true;
    (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!active) return;
      setTwoFa(!error && (data?.totp?.length ?? 0) > 0 ? 'on' : 'off');
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/account/data', { method: 'DELETE' });
      if (res.ok) {
        window.location.href = '/';
        return;
      }
    } catch {
      /* ignore */
    }
    setDeleting(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim() || !jobTitle || (!isTeam && (!country || !company.trim()))) {
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
        setEditing(false);
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

  const banner = BANNER[locale];
  const twoFaKnown = twoFa !== 'loading';
  const twoFaOn = twoFa === 'on';
  const roleLabel = jobTitle
    ? isTeam
      ? teamRoles[jobTitle as keyof typeof teamRoles] ?? ''
      : t.roles[jobTitle as JobTitleKey] ?? ''
    : '';
  const displayName = fullName.trim() || email;
  const identitySub = [roleLabel, !isTeam ? company.trim() : ''].filter(Boolean).join(' · ');

  // Completion = filled personal/company fields + 2FA (email is always set).
  type Item = { key: string; done: boolean; label: string; kind: 'edit' | 'security' };
  const items: Item[] = [
    { key: 'name', done: Boolean(fullName.trim()), label: t.nameLabel, kind: 'edit' },
    ...(!isTeam
      ? [
          { key: 'company', done: Boolean(company.trim()), label: t.companyLabel, kind: 'edit' as const },
          { key: 'country', done: Boolean(country.trim()), label: t.countryLabel, kind: 'edit' as const },
        ]
      : []),
    { key: 'role', done: Boolean(jobTitle.trim()), label: t.roleLabel, kind: 'edit' },
    ...(twoFaKnown ? [{ key: '2fa', done: twoFaOn, label: v.chip2fa, kind: 'security' as const }] : []),
  ];
  const doneCount = 1 + items.filter((i) => i.done).length; // +1: email is always set
  const completionPct = Math.round((doneCount / (items.length + 1)) * 100);
  const missing = items.filter((i) => !i.done);

  const openEdit = () => {
    setStatus('idle');
    setErrorMsg(null);
    setEditing(true);
  };

  return (
    <main className="page-shell" id="top">
      <SiteNav current="account" />
      <AccountSubnav current="profile" />

      <section className="section profile-section">
        <div className="container profile-shell">
          <div className="profile-head">
            <p className="profile-eyebrow">{v.eyebrow}</p>
            <h1 className="profile-h1">{v.pageTitle}</h1>
            <p className="profile-sub">{v.pageSub}</p>
          </div>

          {status === 'saved' && !editing ? (
            <p className="signin-message signin-message-ok profile-msg">{t.saved}</p>
          ) : null}

          {editing ? (
            <div className="profile-edit">
              <button type="button" className="profile-back" onClick={() => setEditing(false)}>
                {v.back}
              </button>
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

                  {!isTeam ? (
                    <>
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
                    </>
                  ) : null}

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
                    {isTeam
                      ? TEAM_ROLE_KEYS.map((key) => (
                          <option key={key} value={key}>
                            {teamRoles[key]}
                          </option>
                        ))
                      : JOB_TITLE_KEYS.map((key) => (
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

                {status === 'error' && errorMsg ? (
                  <p className="signin-message signin-message-error">{errorMsg}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              {completionPct < 100 ? (
                <section className="profile-banner">
                  <div className="profile-banner-row">
                    <div className="profile-banner-main">
                      <h2 className="profile-banner-title">{banner.title(completionPct)}</h2>
                      <p className="profile-banner-sub">{banner.sub}</p>
                    </div>
                    {missing.length ? (
                      <div className="profile-banner-chips">
                        {missing.map((m) =>
                          m.kind === 'security' ? (
                            <a key={m.key} href="/account/security" className="profile-chip">
                              <span className="profile-chip-plus">+</span>
                              {m.label}
                            </a>
                          ) : (
                            <button key={m.key} type="button" className="profile-chip" onClick={openEdit}>
                              <span className="profile-chip-plus">+</span>
                              {m.label}
                            </button>
                          ),
                        )}
                      </div>
                    ) : null}
                  </div>
                  <div className="profile-banner-bar">
                    <span style={{ width: `${completionPct}%` }} />
                  </div>
                </section>
              ) : null}

              <section className="profile-identity">
                <span className="profile-avatar" aria-hidden="true">
                  {pfInitials(fullName, email)}
                  <span className="profile-avatar-dot" />
                </span>
                <div className="profile-identity-main">
                  <h2 className="profile-identity-name">{displayName}</h2>
                  {identitySub ? <p className="profile-identity-role">{identitySub}</p> : null}
                </div>
                <button type="button" className="profile-photo-btn" onClick={openEdit}>
                  {v.editProfile}
                </button>
              </section>

              <div className="profile-grid">
                <section className="profile-card">
                  <div className="profile-card-h">
                    <h3 className="profile-card-title">{v.infoTitle}</h3>
                    <button type="button" className="profile-edit-link" onClick={openEdit}>
                      {v.edit}
                    </button>
                  </div>
                  <div className="profile-fields">
                    <ProfileField label={t.nameLabel} value={fullName} empty={v.notProvided} />
                    <ProfileField label={v.funcLabel} value={roleLabel} empty={v.notProvided} />
                    <ProfileField label={v.emailField} value={email} empty={v.notProvided} />
                    <ProfileField label={v.notifField} value={notif} empty={v.notProvided} />
                  </div>
                </section>

                <section className="profile-card">
                  <div className="profile-card-h">
                    <h3 className="profile-card-title">{v.companyTitle}</h3>
                    <button type="button" className="profile-edit-link" onClick={openEdit}>
                      {v.edit}
                    </button>
                  </div>
                  <div className="profile-fields">
                    <ProfileField label={v.raisonLabel} value={company} empty={v.notProvided} />
                    <ProfileField label={t.typeLabel} value={t.types[accountType]} empty={v.notProvided} />
                    <ProfileField label={t.countryLabel} value={country} empty={v.notProvided} />
                    <div className="profile-field">
                      <span className="profile-field-k">{v.logoField}</span>
                      <div className="profile-logo-box">
                        {logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="profile-logo-img" src={logoUrl} alt="" />
                        ) : (
                          <span className="profile-logo-empty">{v.logoEmpty}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <section className="profile-card profile-security">
                <h3 className="profile-card-title">{v.securityTitle}</h3>
                <div className="profile-sec-row">
                  <div>
                    <div className="profile-sec-k">{v.passwordLabel}</div>
                    <div className="profile-sec-sub">{v.passwordSub}</div>
                  </div>
                  <a className="profile-sec-btn" href="/account/update-password">
                    {v.passwordBtn}
                  </a>
                </div>
                <div className="profile-sec-row profile-sec-row-last">
                  <div className="profile-sec-2fa">
                    <span className={`profile-2fa-pill${twoFaOn ? ' is-on' : ''}`}>
                      <span className="profile-2fa-dot" />
                      {twoFaOn ? v.twoFaOnLabel : v.twoFaOff}
                    </span>
                    <div>
                      <div className="profile-sec-k">{v.twoFaTitle}</div>
                      <div className="profile-sec-sub">{v.twoFaSub}</div>
                    </div>
                  </div>
                  <a className="profile-sec-btn-accent" href="/account/security">
                    {twoFaOn ? v.twoFaManage : v.twoFaEnable}
                  </a>
                </div>
              </section>

              <section className="profile-card profile-rgpd-card">
                <h3 className="profile-card-title">{t.rgpdTitle}</h3>
                <p className="profile-sec-sub profile-rgpd-desc">{t.rgpdDesc}</p>
                <div className="account-profile-rgpd-actions">
                  <a className="button button-light" href="/api/account/data">
                    {t.exportBtn}
                  </a>
                  {confirmDelete ? (
                    <span className="account-profile-del-confirm">
                      <span>{t.deleteConfirm}</span>
                      <button type="button" className="button button-light" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                        {t.deleteCancel}
                      </button>
                      <button type="button" className="account-btn-danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? t.deleting : t.deleteYes}
                      </button>
                    </span>
                  ) : (
                    <button type="button" className="account-btn-danger-ghost" onClick={() => setConfirmDelete(true)}>
                      {t.deleteBtn}
                    </button>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
