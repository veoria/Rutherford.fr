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
  pt: { title: (p) => `Perfil ${p}% completo`, sub: 'Complete o seu perfil para desbloquear todas as funcionalidades de parceiro.' },
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
  pt: {
    eyebrow: 'Área de parceiro',
    pageTitle: 'Perfil',
    pageSub: 'Os seus dados pessoais, a sua empresa e a sua segurança.',
    editProfile: 'Editar perfil',
    back: '← Voltar',
    infoTitle: 'Informações pessoais',
    companyTitle: 'Empresa',
    securityTitle: 'Segurança',
    edit: 'Editar',
    notProvided: 'Não indicado',
    funcLabel: 'Função',
    emailField: 'Email',
    notifField: 'Email de notificação',
    raisonLabel: 'Designação social',
    logoField: 'Logótipo da empresa',
    logoEmpty: 'Sem logótipo',
    passwordLabel: 'Palavra-passe',
    passwordSub: 'Defina ou altere a sua palavra-passe de início de sessão.',
    passwordBtn: 'Alterar palavra-passe',
    twoFaTitle: 'Autenticação de dois fatores (2FA)',
    twoFaSub: 'Reforça a segurança da sua conta de parceiro.',
    twoFaOff: 'Não ativada',
    twoFaOnLabel: 'Ativada',
    twoFaEnable: 'Ativar 2FA',
    twoFaManage: 'Gerir 2FA',
    chip2fa: 'Dois fatores (2FA)',
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
  pt: {
    title: 'O meu perfil',
    subtitle: 'Mantenha os seus dados atualizados, usamo-los para adaptar o seu support e contactá-lo sobre os seus pedidos.',
    nameLabel: 'Nome completo',
    namePlaceholder: 'João Silva',
    countryLabel: 'País',
    selectCountry: 'Selecione o seu país',
    companyLabel: 'Empresa',
    companyPlaceholder: 'Tipografia Silva',
    roleLabel: 'A sua função',
    selectRole: 'Selecione a sua função',
    loginEmailLabel: 'Email de início de sessão',
    notifLabel: 'Email de notificação (opcional)',
    notifPlaceholder: 'notificacoes@empresa.com',
    notifHint: 'Para onde enviamos as atualizações dos seus pedidos. Deixe vazio para usar o seu email de início de sessão.',
    typeLabel: 'Tipo de conta',
    typeHint: 'Definido pela Rutherford, com base na sua organização.',
    submit: 'Guardar',
    saving: 'A guardar…',
    saved: 'Perfil guardado.',
    errorRequired: 'Preencha nome, país, empresa e função.',
    errorGeneric: 'Ocorreu um erro. Tente novamente.',
    rgpdTitle: 'Os seus dados',
    rgpdDesc: 'Descarregue todos os dados que temos sobre si, ou elimine a sua conta de forma permanente.',
    exportBtn: 'Exportar os meus dados',
    deleteBtn: 'Eliminar a minha conta',
    deleteConfirm: 'Eliminar permanentemente a sua conta e os seus dados?',
    deleteYes: 'Sim, eliminar',
    deleteCancel: 'Cancelar',
    deleting: 'A eliminar…',
    roles: {
      operator: 'Operador de máquina',
      prepress: 'Pré-impressão / Fotomecânica',
      production_manager: 'Responsável de produção',
      quality_color: 'Qualidade / Responsável de cor',
      purchasing: 'Compras',
      management: 'Direção / Proprietário',
      brand_owner: 'Marca / Comprador de packaging',
      sales_marketing: 'Vendas / Marketing',
      other: 'Outro',
    },
    types: {
      client: 'Cliente direto',
      reseller: 'Revendedor',
      distributor: 'Distribuidor (X-Rite)',
      team: 'Equipa Rutherford',
    },
  },
};

type Props = {
  email: string;
  accountType: AccountType;
  avatarUrl: string | null;
  logoUrl: string | null;
  canManageLogo: boolean;
  defaults: {
    fullName: string;
    country: string;
    company: string;
    jobTitle: string;
    notificationEmail: string;
  };
};

// Media-upload copy (profile photo + company logo, edited inline on this page).
const MEDIA: Record<
  Locale,
  {
    photoEdit: string;
    logoDrop: string;
    logoManaged: string;
    logoForbidden: string;
    uploadError: string;
    loginNote: string;
    teamFixed: string;
  }
> = {
  en: {
    photoEdit: 'Change photo',
    logoDrop: 'Upload a logo',
    logoManaged: 'Managed by your administrator',
    logoForbidden: 'Only an organization owner or admin can change the logo.',
    uploadError: 'Upload failed — use a PNG, JPG, WebP or SVG under 4 MB.',
    loginNote: 'Used to sign in',
    teamFixed: 'Company name and country are set by your Rutherford domain.',
  },
  fr: {
    photoEdit: 'Changer la photo',
    logoDrop: 'Déposer un logo',
    logoManaged: 'Géré par votre administrateur',
    logoForbidden: 'Seul un propriétaire ou administrateur de l’organisation peut changer le logo.',
    uploadError: 'Échec de l’envoi — utilisez un PNG, JPG, WebP ou SVG de moins de 4 Mo.',
    loginNote: 'Sert à la connexion',
    teamFixed: 'La raison sociale et le pays sont définis par votre domaine Rutherford.',
  },
  de: {
    photoEdit: 'Foto ändern',
    logoDrop: 'Logo hochladen',
    logoManaged: 'Von Ihrem Administrator verwaltet',
    logoForbidden: 'Nur ein Inhaber oder Administrator der Organisation kann das Logo ändern.',
    uploadError: 'Upload fehlgeschlagen — PNG, JPG, WebP oder SVG unter 4 MB verwenden.',
    loginNote: 'Für die Anmeldung',
    teamFixed: 'Firmenname und Land werden durch Ihre Rutherford-Domain festgelegt.',
  },
  it: {
    photoEdit: 'Cambia foto',
    logoDrop: 'Carica un logo',
    logoManaged: 'Gestito dal suo amministratore',
    logoForbidden: 'Solo un proprietario o amministratore dell’organizzazione può cambiare il logo.',
    uploadError: 'Caricamento non riuscito — usi un PNG, JPG, WebP o SVG sotto i 4 MB.',
    loginNote: 'Per l’accesso',
    teamFixed: 'Ragione sociale e paese sono definiti dal suo dominio Rutherford.',
  },
  es: {
    photoEdit: 'Cambiar foto',
    logoDrop: 'Subir un logo',
    logoManaged: 'Gestionado por su administrador',
    logoForbidden: 'Solo un propietario o administrador de la organización puede cambiar el logo.',
    uploadError: 'Error al subir — use un PNG, JPG, WebP o SVG de menos de 4 MB.',
    loginNote: 'Para iniciar sesión',
    teamFixed: 'La razón social y el país los define su dominio Rutherford.',
  },
  pt: {
    photoEdit: 'Alterar fotografia',
    logoDrop: 'Carregar um logótipo',
    logoManaged: 'Gerido pelo seu administrador',
    logoForbidden: 'Apenas um proprietário ou administrador da organização pode alterar o logótipo.',
    uploadError: 'Falha no carregamento, use um PNG, JPG, WebP ou SVG com menos de 4 MB.',
    loginNote: 'Usado para iniciar sessão',
    teamFixed: 'A designação social e o país são definidos pelo seu domínio Rutherford.',
  },
};

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8.5h3l1.2-2h7.6L17 8.5h3v10H4v-10z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function AccountProfile({
  email,
  accountType,
  avatarUrl: avatarUrl0,
  logoUrl: logoUrl0,
  canManageLogo,
  defaults,
}: Props) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const v = VIEW[locale];
  const media = MEDIA[locale];
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
  // Read view (cards) vs. inline edit mode (same cards, fields become inputs).
  const [editing, setEditing] = useState(false);
  // Photo / logo + manage rights come from the server (reliable under RLS).
  const [logoUrl, setLogoUrl] = useState<string | null>(logoUrl0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(avatarUrl0);
  const [uploading, setUploading] = useState<'avatar' | 'logo' | null>(null);
  const [mediaErr, setMediaErr] = useState<string | null>(null);
  // Real 2FA state, read straight from Supabase MFA factors.
  const [twoFa, setTwoFa] = useState<'loading' | 'on' | 'off'>('loading');

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

  const uploadMedia = async (kind: 'avatar' | 'logo', file: File) => {
    setUploading(kind);
    setMediaErr(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', kind);
      const res = await fetch('/api/account/media', { method: 'POST', body: fd });
      if (!res.ok) {
        setMediaErr(kind === 'logo' && res.status === 403 ? media.logoForbidden : media.uploadError);
        setUploading(null);
        return;
      }
      const { url } = await res.json();
      if (url) {
        if (kind === 'avatar') setAvatarUrl(url as string);
        else setLogoUrl(url as string);
      }
    } catch {
      setMediaErr(media.uploadError);
    }
    setUploading(null);
  };

  const onPickFile = (kind: 'avatar' | 'logo') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = '';
    if (file) void uploadMedia(kind, file);
  };

  const handleCancel = () => {
    setFullName(defaults.fullName);
    setCountry(defaults.country);
    setCompany(defaults.company);
    setJobTitle(defaults.jobTitle);
    setNotif(defaults.notificationEmail);
    setStatus('idle');
    setErrorMsg(null);
    setMediaErr(null);
    setEditing(false);
  };

  const handleSave = async () => {
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
            <h1 className="profile-h1">{v.pageTitle}</h1>
            <p className="profile-sub">{v.pageSub}</p>
          </div>

          {status === 'saved' && !editing ? (
            <p className="signin-message signin-message-ok profile-msg">{t.saved}</p>
          ) : null}

          {!editing && completionPct < 100 ? (
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
            {editing ? (
              <label className="profile-avatar profile-avatar-edit" title={media.photoEdit}>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={onPickFile('avatar')} />
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="profile-avatar-img" src={avatarUrl} alt="" />
                ) : (
                  pfInitials(fullName, email)
                )}
                <span className="profile-avatar-cam">{uploading === 'avatar' ? '…' : <CameraIcon />}</span>
              </label>
            ) : (
              <span className="profile-avatar" aria-hidden="true">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="profile-avatar-img" src={avatarUrl} alt="" />
                ) : (
                  pfInitials(fullName, email)
                )}
                <span className="profile-avatar-dot" />
              </span>
            )}
            <div className="profile-identity-main">
              <h2 className="profile-identity-name">{displayName}</h2>
              {identitySub ? <p className="profile-identity-role">{identitySub}</p> : null}
              {mediaErr ? <p className="profile-media-err">{mediaErr}</p> : null}
            </div>
            {editing ? (
              <div className="profile-edit-actions">
                <button type="button" className="profile-photo-btn" onClick={handleCancel} disabled={status === 'saving'}>
                  {t.deleteCancel}
                </button>
                <button type="button" className="button button-accent profile-save-btn" onClick={handleSave} disabled={status === 'saving'}>
                  {status === 'saving' ? t.saving : t.submit}
                </button>
              </div>
            ) : (
              <button type="button" className="profile-photo-btn" onClick={openEdit}>
                {v.editProfile}
              </button>
            )}
          </section>

          {editing && status === 'error' && errorMsg ? (
            <p className="signin-message signin-message-error profile-msg">{errorMsg}</p>
          ) : null}

          <div className="profile-grid">
            <section className="profile-card">
              <div className="profile-card-h">
                <h3 className="profile-card-title">{v.infoTitle}</h3>
                {!editing ? (
                  <button type="button" className="profile-edit-link" onClick={openEdit}>
                    {v.edit}
                  </button>
                ) : null}
              </div>
              <div className="profile-fields">
                {editing ? (
                  <>
                    <label className="profile-field profile-field-edit">
                      <span className="profile-field-k">{t.nameLabel}</span>
                      <input
                        className="profile-input"
                        type="text"
                        value={fullName}
                        placeholder={t.namePlaceholder}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={status === 'saving'}
                      />
                    </label>
                    <label className="profile-field profile-field-edit">
                      <span className="profile-field-k">{v.funcLabel}</span>
                      <select
                        className="profile-input"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
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
                    </label>
                    <div className="profile-field">
                      <span className="profile-field-k">{v.emailField}</span>
                      <span className="profile-field-v">{email}</span>
                      <span className="profile-field-note">{media.loginNote}</span>
                    </div>
                    <label className="profile-field profile-field-edit">
                      <span className="profile-field-k">{v.notifField}</span>
                      <input
                        className="profile-input"
                        type="email"
                        value={notif}
                        placeholder={t.notifPlaceholder}
                        onChange={(e) => setNotif(e.target.value)}
                        disabled={status === 'saving'}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <ProfileField label={t.nameLabel} value={fullName} empty={v.notProvided} />
                    <ProfileField label={v.funcLabel} value={roleLabel} empty={v.notProvided} />
                    <ProfileField label={v.emailField} value={email} empty={v.notProvided} />
                    <ProfileField label={v.notifField} value={notif} empty={v.notProvided} />
                  </>
                )}
              </div>
            </section>

            <section className="profile-card">
              <div className="profile-card-h">
                <h3 className="profile-card-title">{v.companyTitle}</h3>
                {!editing ? (
                  <button type="button" className="profile-edit-link" onClick={openEdit}>
                    {v.edit}
                  </button>
                ) : null}
              </div>
              <div className="profile-fields">
                {editing && !isTeam ? (
                  <label className="profile-field profile-field-edit">
                    <span className="profile-field-k">{v.raisonLabel}</span>
                    <input
                      className="profile-input"
                      type="text"
                      value={company}
                      placeholder={t.companyPlaceholder}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={status === 'saving'}
                    />
                  </label>
                ) : (
                  <ProfileField label={v.raisonLabel} value={company} empty={v.notProvided} />
                )}
                <ProfileField label={t.typeLabel} value={t.types[accountType]} empty={v.notProvided} />
                {editing && !isTeam ? (
                  <label className="profile-field profile-field-edit">
                    <span className="profile-field-k">{t.countryLabel}</span>
                    <select
                      className="profile-input"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={status === 'saving'}
                    >
                      <option value="" disabled>
                        {t.selectCountry}
                      </option>
                      {COUNTRIES.map((co) => (
                        <option key={co} value={co}>
                          {co}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <ProfileField label={t.countryLabel} value={country} empty={v.notProvided} />
                )}
                <div className="profile-field">
                  <span className="profile-field-k">{v.logoField}</span>
                  {editing && canManageLogo ? (
                    <label className="profile-logo-box profile-logo-drop" title={media.logoDrop}>
                      <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={onPickFile('logo')} />
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="profile-logo-img" src={logoUrl} alt="" />
                      ) : (
                        <span className="profile-logo-empty">{media.logoDrop}</span>
                      )}
                      <span className="profile-logo-cam">{uploading === 'logo' ? '…' : <CameraIcon />}</span>
                    </label>
                  ) : (
                    <>
                      <div className="profile-logo-box">
                        {logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="profile-logo-img" src={logoUrl} alt="" />
                        ) : (
                          <span className="profile-logo-empty">{v.logoEmpty}</span>
                        )}
                      </div>
                      {editing && !canManageLogo && logoUrl ? (
                        <span className="profile-field-note">{media.logoManaged}</span>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
              {editing && isTeam ? <p className="profile-field-note profile-team-note">{media.teamFixed}</p> : null}
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
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
