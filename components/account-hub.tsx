'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { MemberRole, OrgMember, ResellerClientOrg, Team } from '@/lib/organizations';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import type { AccountType } from '@/data/account-types';

export type ResellerClient = {
  name: string;
  country: string | null;
  presses: number;
  eligible: number;
  open: number;
};

type Props = {
  accountType: AccountType;
  team: Team;
  selfId: string;
  networkResellers: ResellerClientOrg[];
  email: string;
  memberSince: string | null;
  profile: {
    fullName: string | null;
    avatarUrl: string | null;
    country: string | null;
    company: string | null;
    jobTitle: string | null;
  };
  academy: {
    level: number;
    percentIntoLevel: number;
    xp: number;
    xpToNext: number;
    isMax: boolean;
    completedModules: number;
    totalModules: number;
    certificates: number;
  };
  consoleStat: { eligible: number; open: number };
  supportStat: { status: string | null; newMessage: boolean };
  resume: { slug: string; title: string; moduleIndex: number; moduleTitle: string } | null;
  resellerClients: ResellerClient[];
};

// Accent colour per role (matches the design handoff).
const TONE: Record<AccountType, string> = {
  client: '#1B6FF3',
  reseller: '#1E874B',
  distributor: '#6D28D9',
  team: '#16130F',
};

const LANG_NAME: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  es: 'Español',
};

const RANK_NAMES: Record<Locale, string[]> = {
  en: ['Apprentice', 'Operator', 'Colorist', 'Color Expert', 'Closed-Loop Master'],
  fr: ['Apprenti', 'Opérateur', 'Coloriste', 'Expert couleur', 'Maître closed-loop'],
  de: ['Einsteiger', 'Bediener', 'Kolorist', 'Farbexperte', 'Closed-Loop-Meister'],
  it: ['Apprendista', 'Operatore', 'Colorista', 'Esperto colore', 'Maestro closed-loop'],
  es: ['Aprendiz', 'Operador', 'Colorista', 'Experto en color', 'Maestro closed-loop'],
};

type Copy = {
  eyebrow: string;
  roles: Record<AccountType, string>;
  editProfile: string;
  signOut: string;
  quickAccess: string;
  tiles: {
    academyT: string; academyS: string;
    consoleT: string; consoleS: string;
    supportT: string; supportS: string;
    teamT: string; teamS: string;
    clientsT: string; clientsS: string;
    networkT: string; networkS: string;
    adminT: string; adminS: string;
  };
  stat: {
    eligible: (n: number) => string;
    open: (n: number) => string;
    supportReply: string;
    supportOpen: string;
    supportAction: string;
    supportNewMsg: string;
    youOnly: string;
    clientsCount: (n: number) => string;
    networkSoon: string;
    backoffice: string;
  };
  resumeKicker: string;
  resumeCta: string;
  moduleWord: string;
  settingsT: string;
  settingsS: string;
  rowName: string; rowEmail: string; rowCompany: string; rowCountry: string; rowLang: string; rowPwd: string;
  manage: {
    teamTitle: string; teamSub: string;
    clientsTitle: string; clientsSub: string;
    networkTitle: string; networkSub: string;
    tabClients: (n: number) => string;
    tabTeam: string;
    owner: string;
    inviteMember: string; inviteClient: string; addReseller: string;
    soonTeam: string; soonNetwork: string; clientsEmpty: string;
    pressUnit: (n: number) => string;
    eligibleShort: (n: number) => string;
    openShort: (n: number) => string;
    adminTitle: string; adminSub: string; adminCta: string;
    adminTag: string; memberTag: string; invitedTag: string; invitePending: string; inviteSend: string; inviteEmailPh: string;
    remove: string; revoke: string; networkEmpty: string;
  };
  academyH: string;
  levelWord: string;
  xpUnit: string;
  xpToNext: (n: number, rank: string) => string;
  maxLevel: string;
  statModules: string;
  statCertificates: string;
  supportH: string;
  supportChat: string; supportChatS: string;
  supportHelp: string; supportHelpS: string;
  supportMail: string; supportMailS: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    eyebrow: 'Your account',
    roles: { client: 'Client', reseller: 'Reseller', distributor: 'X-Rite distributor', team: 'Rutherford team' },
    editProfile: 'Edit profile', signOut: 'Sign out', quickAccess: 'Quick access',
    tiles: {
      academyT: 'Academy', academyS: 'Your color masterclasses',
      consoleT: 'Console Validation', consoleS: 'Your press validations',
      supportT: 'Support', supportS: 'Help & documentation',
      teamT: 'My team', teamS: 'Manage your operators',
      clientsT: 'My clients', clientsS: 'Printers you follow',
      networkT: 'My network', networkS: 'Partner resellers',
      adminT: 'Admin', adminS: 'Back-office',
    },
    stat: {
      eligible: (n) => `${n} eligible`, open: (n) => `${n} in progress`,
      supportReply: 'Reply within 1 business day', supportOpen: 'Ticket in progress', supportAction: 'Action needed', supportNewMsg: 'New message', youOnly: 'Just you',
      clientsCount: (n) => `${n} client${n === 1 ? '' : 's'}`, networkSoon: 'Coming soon', backoffice: 'Back-office',
    },
    resumeKicker: 'Pick up where you left off', resumeCta: 'Continue', moduleWord: 'Module',
    settingsT: 'Account information', settingsS: 'Manage your profile and preferences',
    rowName: 'Full name', rowEmail: 'Email address', rowCompany: 'Company', rowCountry: 'Country', rowLang: 'Language', rowPwd: 'Password',
    manage: {
      teamTitle: 'My team', teamSub: 'Who can access this account',
      clientsTitle: 'Clients & team', clientsSub: 'Your clients and your team',
      networkTitle: 'Reseller network', networkSub: 'The resellers in your network',
      tabClients: (n) => `Clients (${n})`, tabTeam: 'Team', owner: 'Owner',
      inviteMember: 'Invite a member', inviteClient: 'Invite a client', addReseller: 'Add a reseller',
      soonTeam: 'Team invitations are coming soon.', soonNetwork: 'Your network will appear here.', clientsEmpty: 'No client validations yet.',
      pressUnit: (n) => `${n} press${n === 1 ? '' : 'es'}`, eligibleShort: (n) => `${n} eligible`, openShort: (n) => `${n} open`,
      adminTitle: 'Back-office', adminSub: 'Rutherford team tools', adminCta: 'Open admin',
      adminTag: 'Admin', memberTag: 'Member', invitedTag: 'Invited', invitePending: 'Invitation sent', inviteSend: 'Send invite', inviteEmailPh: 'name@company.com',
      remove: 'Remove', revoke: 'Revoke', networkEmpty: 'No resellers in your network yet.',
    },
    academyH: 'Academy', levelWord: 'Level', xpUnit: 'XP',
    xpToNext: (n, rank) => `${n} XP to ${rank}`, maxLevel: 'Top rank reached',
    statModules: 'Modules', statCertificates: 'Certificates',
    supportH: 'Support',
    supportChat: 'Chat with support', supportChatS: 'Reply within one business day',
    supportHelp: 'Help centre', supportHelpS: 'Product guides & docs',
    supportMail: 'Email us', supportMailS: 'contact@rutherford.fr',
  },
  fr: {
    eyebrow: 'Votre compte',
    roles: { client: 'Client', reseller: 'Revendeur', distributor: 'Distributeur X-Rite', team: 'Équipe Rutherford' },
    editProfile: 'Modifier le profil', signOut: 'Se déconnecter', quickAccess: 'Accès rapide',
    tiles: {
      academyT: 'Academy', academyS: 'Vos masterclasses couleur',
      consoleT: 'Console Validation', consoleS: 'Vos validations de presse',
      supportT: 'Support', supportS: 'Aide & documentation',
      teamT: 'Mon équipe', teamS: 'Gérez vos opérateurs',
      clientsT: 'Mes clients', clientsS: 'Imprimeurs que vous suivez',
      networkT: 'Mon réseau', networkS: 'Revendeurs partenaires',
      adminT: 'Admin', adminS: 'Back-office',
    },
    stat: {
      eligible: (n) => `${n} éligible${n === 1 ? '' : 's'}`, open: (n) => `${n} en cours`,
      supportReply: 'Réponse < 1 j ouvré', supportOpen: 'Ticket en cours', supportAction: 'Action requise', supportNewMsg: 'Nouveau message', youOnly: 'Vous uniquement',
      clientsCount: (n) => `${n} client${n === 1 ? '' : 's'}`, networkSoon: 'Bientôt', backoffice: 'Back-office',
    },
    resumeKicker: 'Reprenez où vous en étiez', resumeCta: 'Continuer', moduleWord: 'Module',
    settingsT: 'Informations du compte', settingsS: 'Gérez votre profil et vos préférences',
    rowName: 'Nom complet', rowEmail: 'Adresse email', rowCompany: 'Société', rowCountry: 'Pays', rowLang: 'Langue', rowPwd: 'Mot de passe',
    manage: {
      teamTitle: 'Mon équipe', teamSub: 'Qui peut accéder à ce compte',
      clientsTitle: 'Clients & équipe', clientsSub: 'Vos clients et votre équipe',
      networkTitle: 'Réseau revendeurs', networkSub: 'Les revendeurs de votre réseau',
      tabClients: (n) => `Clients (${n})`, tabTeam: 'Équipe', owner: 'Propriétaire',
      inviteMember: 'Inviter un membre', inviteClient: 'Inviter un client', addReseller: 'Ajouter un revendeur',
      soonTeam: 'Les invitations d’équipe arrivent bientôt.', soonNetwork: 'Votre réseau apparaîtra ici.', clientsEmpty: 'Aucune validation client pour l’instant.',
      pressUnit: (n) => `${n} presse${n === 1 ? '' : 's'}`, eligibleShort: (n) => `${n} éligible${n === 1 ? '' : 's'}`, openShort: (n) => `${n} en cours`,
      adminTitle: 'Back-office', adminSub: 'Outils de l’équipe Rutherford', adminCta: 'Ouvrir l’admin',
      adminTag: 'Admin', memberTag: 'Membre', invitedTag: 'Invité', invitePending: 'Invitation envoyée', inviteSend: 'Envoyer l’invitation', inviteEmailPh: 'nom@entreprise.com',
      remove: 'Retirer', revoke: 'Révoquer', networkEmpty: 'Aucun revendeur dans votre réseau pour l’instant.',
    },
    academyH: 'Academy', levelWord: 'Niveau', xpUnit: 'XP',
    xpToNext: (n, rank) => `${n} XP avant ${rank}`, maxLevel: 'Rang maximum atteint',
    statModules: 'Modules', statCertificates: 'Certificats',
    supportH: 'Support',
    supportChat: 'Discuter avec le support', supportChatS: 'Réponse en moins d’un jour ouvré',
    supportHelp: 'Centre d’aide', supportHelpS: 'Guides & documentation produit',
    supportMail: 'Nous écrire', supportMailS: 'contact@rutherford.fr',
  },
  de: {
    eyebrow: 'Ihr Konto',
    roles: { client: 'Kunde', reseller: 'Wiederverkäufer', distributor: 'X-Rite-Distributor', team: 'Rutherford-Team' },
    editProfile: 'Profil bearbeiten', signOut: 'Abmelden', quickAccess: 'Schnellzugriff',
    tiles: {
      academyT: 'Academy', academyS: 'Ihre Farb-Masterclasses',
      consoleT: 'Console Validation', consoleS: 'Ihre Maschinen-Validierungen',
      supportT: 'Support', supportS: 'Hilfe & Dokumentation',
      teamT: 'Mein Team', teamS: 'Verwalten Sie Ihre Bediener',
      clientsT: 'Meine Kunden', clientsS: 'Druckereien, die Sie betreuen',
      networkT: 'Mein Netzwerk', networkS: 'Partner-Wiederverkäufer',
      adminT: 'Admin', adminS: 'Back-office',
    },
    stat: {
      eligible: (n) => `${n} geeignet`, open: (n) => `${n} laufend`,
      supportReply: 'Antwort < 1 Werktag', supportOpen: 'Ticket in Bearbeitung', supportAction: 'Aktion erforderlich', supportNewMsg: 'Neue Nachricht', youOnly: 'Nur Sie',
      clientsCount: (n) => `${n} Kunde${n === 1 ? '' : 'n'}`, networkSoon: 'Demnächst', backoffice: 'Back-office',
    },
    resumeKicker: 'Weitermachen, wo Sie aufgehört haben', resumeCta: 'Fortsetzen', moduleWord: 'Modul',
    settingsT: 'Kontoinformationen', settingsS: 'Profil und Einstellungen verwalten',
    rowName: 'Vollständiger Name', rowEmail: 'E-Mail-Adresse', rowCompany: 'Unternehmen', rowCountry: 'Land', rowLang: 'Sprache', rowPwd: 'Passwort',
    manage: {
      teamTitle: 'Mein Team', teamSub: 'Wer auf dieses Konto zugreifen kann',
      clientsTitle: 'Kunden & Team', clientsSub: 'Ihre Kunden und Ihr Team',
      networkTitle: 'Wiederverkäufer-Netzwerk', networkSub: 'Die Wiederverkäufer in Ihrem Netzwerk',
      tabClients: (n) => `Kunden (${n})`, tabTeam: 'Team', owner: 'Inhaber',
      inviteMember: 'Mitglied einladen', inviteClient: 'Kunde einladen', addReseller: 'Wiederverkäufer hinzufügen',
      soonTeam: 'Team-Einladungen folgen in Kürze.', soonNetwork: 'Ihr Netzwerk erscheint hier.', clientsEmpty: 'Noch keine Kunden-Validierungen.',
      pressUnit: (n) => `${n} Maschine${n === 1 ? '' : 'n'}`, eligibleShort: (n) => `${n} geeignet`, openShort: (n) => `${n} offen`,
      adminTitle: 'Back-office', adminSub: 'Werkzeuge des Rutherford-Teams', adminCta: 'Admin öffnen',
      adminTag: 'Admin', memberTag: 'Mitglied', invitedTag: 'Eingeladen', invitePending: 'Einladung gesendet', inviteSend: 'Einladung senden', inviteEmailPh: 'name@firma.com',
      remove: 'Entfernen', revoke: 'Zurückziehen', networkEmpty: 'Noch keine Wiederverkäufer in Ihrem Netzwerk.',
    },
    academyH: 'Academy', levelWord: 'Level', xpUnit: 'XP',
    xpToNext: (n, rank) => `${n} XP bis ${rank}`, maxLevel: 'Höchster Rang erreicht',
    statModules: 'Module', statCertificates: 'Zertifikate',
    supportH: 'Support',
    supportChat: 'Mit dem Support chatten', supportChatS: 'Antwort < 1 Werktag',
    supportHelp: 'Hilfecenter', supportHelpS: 'Produktanleitungen & Doku',
    supportMail: 'Schreiben Sie uns', supportMailS: 'contact@rutherford.fr',
  },
  it: {
    eyebrow: 'Il suo account',
    roles: { client: 'Cliente', reseller: 'Rivenditore', distributor: 'Distributore X-Rite', team: 'Team Rutherford' },
    editProfile: 'Modifica profilo', signOut: 'Esci', quickAccess: 'Accesso rapido',
    tiles: {
      academyT: 'Academy', academyS: 'Le sue masterclass sul colore',
      consoleT: 'Console Validation', consoleS: 'Le sue validazioni di macchina',
      supportT: 'Support', supportS: 'Aiuto & documentazione',
      teamT: 'Il mio team', teamS: 'Gestisci i tuoi operatori',
      clientsT: 'I miei clienti', clientsS: 'Stampatori che segui',
      networkT: 'La mia rete', networkS: 'Rivenditori partner',
      adminT: 'Admin', adminS: 'Back-office',
    },
    stat: {
      eligible: (n) => `${n} idonee`, open: (n) => `${n} in corso`,
      supportReply: 'Risposta < 1 g lavorativo', supportOpen: 'Ticket in corso', supportAction: 'Azione richiesta', supportNewMsg: 'Nuovo messaggio', youOnly: 'Solo lei',
      clientsCount: (n) => `${n} client${n === 1 ? 'e' : 'i'}`, networkSoon: 'Presto', backoffice: 'Back-office',
    },
    resumeKicker: 'Riprenda da dove era rimasto', resumeCta: 'Continua', moduleWord: 'Modulo',
    settingsT: 'Informazioni dell’account', settingsS: 'Gestisci profilo e preferenze',
    rowName: 'Nome completo', rowEmail: 'Indirizzo email', rowCompany: 'Azienda', rowCountry: 'Paese', rowLang: 'Lingua', rowPwd: 'Password',
    manage: {
      teamTitle: 'Il mio team', teamSub: 'Chi può accedere a questo account',
      clientsTitle: 'Clienti & team', clientsSub: 'I suoi clienti e il suo team',
      networkTitle: 'Rete rivenditori', networkSub: 'I rivenditori della sua rete',
      tabClients: (n) => `Clienti (${n})`, tabTeam: 'Team', owner: 'Proprietario',
      inviteMember: 'Invita un membro', inviteClient: 'Invita un cliente', addReseller: 'Aggiungi un rivenditore',
      soonTeam: 'Gli inviti al team arrivano presto.', soonNetwork: 'La sua rete apparirà qui.', clientsEmpty: 'Nessuna validazione cliente per ora.',
      pressUnit: (n) => `${n} macchin${n === 1 ? 'a' : 'e'}`, eligibleShort: (n) => `${n} idonee`, openShort: (n) => `${n} in corso`,
      adminTitle: 'Back-office', adminSub: 'Strumenti del team Rutherford', adminCta: 'Apri admin',
      adminTag: 'Admin', memberTag: 'Membro', invitedTag: 'Invitato', invitePending: 'Invito inviato', inviteSend: 'Invia invito', inviteEmailPh: 'nome@azienda.com',
      remove: 'Rimuovi', revoke: 'Revoca', networkEmpty: 'Ancora nessun rivenditore nella sua rete.',
    },
    academyH: 'Academy', levelWord: 'Livello', xpUnit: 'XP',
    xpToNext: (n, rank) => `${n} XP a ${rank}`, maxLevel: 'Rango massimo raggiunto',
    statModules: 'Moduli', statCertificates: 'Certificati',
    supportH: 'Support',
    supportChat: 'Chatta con il support', supportChatS: 'Risposta entro 1 g lavorativo',
    supportHelp: 'Centro assistenza', supportHelpS: 'Guide & documentazione',
    supportMail: 'Scrivici', supportMailS: 'contact@rutherford.fr',
  },
  es: {
    eyebrow: 'Su cuenta',
    roles: { client: 'Cliente', reseller: 'Distribuidor', distributor: 'Distribuidor X-Rite', team: 'Equipo Rutherford' },
    editProfile: 'Editar perfil', signOut: 'Cerrar sesión', quickAccess: 'Acceso rápido',
    tiles: {
      academyT: 'Academy', academyS: 'Sus masterclasses de color',
      consoleT: 'Console Validation', consoleS: 'Sus validaciones de prensa',
      supportT: 'Support', supportS: 'Ayuda & documentación',
      teamT: 'Mi equipo', teamS: 'Gestione sus operadores',
      clientsT: 'Mis clientes', clientsS: 'Impresores que sigue',
      networkT: 'Mi red', networkS: 'Revendedores asociados',
      adminT: 'Admin', adminS: 'Back-office',
    },
    stat: {
      eligible: (n) => `${n} aptas`, open: (n) => `${n} en curso`,
      supportReply: 'Respuesta < 1 día hábil', supportOpen: 'Ticket en curso', supportAction: 'Acción requerida', supportNewMsg: 'Nuevo mensaje', youOnly: 'Solo usted',
      clientsCount: (n) => `${n} cliente${n === 1 ? '' : 's'}`, networkSoon: 'Pronto', backoffice: 'Back-office',
    },
    resumeKicker: 'Retome donde lo dejó', resumeCta: 'Continuar', moduleWord: 'Módulo',
    settingsT: 'Información de la cuenta', settingsS: 'Gestione su perfil y preferencias',
    rowName: 'Nombre completo', rowEmail: 'Correo electrónico', rowCompany: 'Empresa', rowCountry: 'País', rowLang: 'Idioma', rowPwd: 'Contraseña',
    manage: {
      teamTitle: 'Mi equipo', teamSub: 'Quién puede acceder a esta cuenta',
      clientsTitle: 'Clientes & equipo', clientsSub: 'Sus clientes y su equipo',
      networkTitle: 'Red de revendedores', networkSub: 'Los revendedores de su red',
      tabClients: (n) => `Clientes (${n})`, tabTeam: 'Equipo', owner: 'Propietario',
      inviteMember: 'Invitar a un miembro', inviteClient: 'Invitar a un cliente', addReseller: 'Añadir un revendedor',
      soonTeam: 'Las invitaciones de equipo llegan pronto.', soonNetwork: 'Su red aparecerá aquí.', clientsEmpty: 'Aún no hay validaciones de clientes.',
      pressUnit: (n) => `${n} prensa${n === 1 ? '' : 's'}`, eligibleShort: (n) => `${n} aptas`, openShort: (n) => `${n} en curso`,
      adminTitle: 'Back-office', adminSub: 'Herramientas del equipo Rutherford', adminCta: 'Abrir admin',
      adminTag: 'Admin', memberTag: 'Miembro', invitedTag: 'Invitado', invitePending: 'Invitación enviada', inviteSend: 'Enviar invitación', inviteEmailPh: 'nombre@empresa.com',
      remove: 'Quitar', revoke: 'Revocar', networkEmpty: 'Aún no hay revendedores en su red.',
    },
    academyH: 'Academy', levelWord: 'Nivel', xpUnit: 'XP',
    xpToNext: (n, rank) => `${n} XP para ${rank}`, maxLevel: 'Rango máximo alcanzado',
    statModules: 'Módulos', statCertificates: 'Certificados',
    supportH: 'Support',
    supportChat: 'Chatear con soporte', supportChatS: 'Respuesta en menos de 1 día hábil',
    supportHelp: 'Centro de ayuda', supportHelpS: 'Guías & documentación',
    supportMail: 'Escríbanos', supportMailS: 'contact@rutherford.fr',
  },
};

const ICON: Record<string, ReactNode> = {
  acad: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 4 2.5 9 12 14l9.5-5L12 4z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M6 11v4.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  console: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M3 9h18M7 14h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="16.5" cy="14" r="1.3" fill="currentColor"/></svg>,
  support: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 18l-2 3V8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M9 10h6M9 13h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  team: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.7"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M16 6.5a3 3 0 0 1 0 5.8M17.5 19c0-2.2-.9-3.9-2.2-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  network: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2.4" stroke="currentColor" strokeWidth="1.7"/><circle cx="5" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.7"/><circle cx="19" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.7"/><path d="M12 7.4v3.6M10.4 13l-3.4 3M13.6 13l3.4 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  clients: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 20V9l8-5 8 5v11" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M9 20v-5h6v5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  admin: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.2-2.8 7.5-7 9-4.2-1.5-7-4.8-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  arrow: <svg className="ah-tile-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h13m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevR: <svg className="ah-support-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chat: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 16l-2 3V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  doc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 3h8l4 4v14H6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 3v4h4M9 13h6M9 16h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
};

function initials(name: string | null, email: string): string {
  const base = (name ?? '').trim();
  if (base) {
    const parts = base.split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || base[0].toUpperCase();
  }
  return (email[0] ?? '?').toUpperCase();
}

function fmtMonth(iso: string | null, locale: Locale): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

type Tile = { ic: string; cls: string; t: string; s: string; href: string; statDot?: string; statV: string; statM?: string };

export function AccountHub(props: Props) {
  const { accountType, team, selfId, networkResellers, email, memberSince, profile, academy, consoleStat, supportStat, resume, resellerClients } = props;
  const { locale } = useLanguage();
  const t = COPY[locale];
  const accent = TONE[accountType];
  const rank = RANK_NAMES[locale][Math.min(academy.level - 1, 4)] ?? '';
  const nextRank = RANK_NAMES[locale][Math.min(academy.level, 4)] ?? '';

  const academyStat = `${t.levelWord} ${academy.level} · ${rank}`;
  const consoleStatV = consoleStat.eligible > 0 ? t.stat.eligible(consoleStat.eligible) : t.stat.open(consoleStat.open);
  const consoleStatM = consoleStat.eligible > 0 && consoleStat.open > 0 ? t.stat.open(consoleStat.open) : '';

  const academyTile: Tile = { ic: 'acad', cls: 'blue', t: t.tiles.academyT, s: t.tiles.academyS, href: '/account/academy', statDot: 'blue', statV: academyStat, statM: `${academy.xp} ${t.xpUnit}` };
  const consoleTile: Tile = { ic: 'console', cls: 'ink', t: t.tiles.consoleT, s: t.tiles.consoleS, href: '/account/console-validations', statDot: consoleStat.eligible > 0 ? 'green' : 'amber', statV: consoleStatV, statM: consoleStatM };
  const supportStatV = supportStat.newMessage
    ? t.stat.supportNewMsg
    : supportStat.status === 'waiting_customer'
      ? t.stat.supportAction
      : supportStat.status
        ? t.stat.supportOpen
        : t.stat.supportReply;
  const supportDot =
    supportStat.newMessage || supportStat.status === 'waiting_customer'
      ? 'amber'
      : supportStat.status
        ? 'blue'
        : undefined;
  const supportTile: Tile = { ic: 'support', cls: 'ink', t: t.tiles.supportT, s: t.tiles.supportS, href: '/account/support', statDot: supportDot, statV: supportStatV };

  let roleTile: Tile;
  if (accountType === 'reseller') {
    roleTile = { ic: 'clients', cls: 'green', t: t.tiles.clientsT, s: t.tiles.clientsS, href: '#account-manage', statDot: 'green', statV: t.stat.clientsCount(resellerClients.length) };
  } else if (accountType === 'distributor') {
    roleTile = { ic: 'network', cls: 'violet', t: t.tiles.networkT, s: t.tiles.networkS, href: '#account-manage', statV: t.stat.networkSoon };
  } else if (accountType === 'team') {
    roleTile = { ic: 'admin', cls: 'ink', t: t.tiles.adminT, s: t.tiles.adminS, href: '/admin', statV: t.stat.backoffice };
  } else {
    roleTile = { ic: 'team', cls: 'green', t: t.tiles.teamT, s: t.tiles.teamS, href: '#account-manage', statV: t.stat.youOnly };
  }

  const tiles: Tile[] =
    accountType === 'reseller'
      ? [academyTile, roleTile, consoleTile, supportTile]
      : accountType === 'distributor'
        ? [roleTile, consoleTile, academyTile, supportTile]
        : [academyTile, consoleTile, roleTile, supportTile];

  return (
    <main className="page-shell" id="top">
      <SiteNav current="account" />

      <section className="ah-section section">
        <div className="container ah-wrap" style={{ ['--role' as string]: accent }}>
          {/* Profile band */}
          <div className="ah-profile">
            <MediaUpload
              kind="avatar"
              currentUrl={profile.avatarUrl}
              fallback={initials(profile.fullName, email)}
              shape="circle"
              editable
              bg={accent}
              fg="#ffffff"
            />
            <div className="ah-id">
              <div className="ah-eyebrow">{t.eyebrow}</div>
              <div className="ah-name-row">
                <h1 className="ah-name">{profile.fullName || email}</h1>
                <span className="ah-role"><span className="ah-role-dot" />{t.roles[accountType]}</span>
              </div>
              <div className="ah-co">
                {profile.company || team.org?.logoUrl || team.myRole === 'owner' || team.myRole === 'admin' ? (
                  <MediaUpload
                    kind="logo"
                    currentUrl={team.org?.logoUrl ?? null}
                    fallback={initials(profile.company, profile.company || 'CO')}
                    shape="square"
                    editable={team.myRole === 'owner' || team.myRole === 'admin'}
                    bg="#f1efec"
                    fg="#16130f"
                  />
                ) : null}
                {profile.company ? <span className="ah-co-name">{profile.company}</span> : null}
                <span className="ah-meta">
                  {email}
                  {memberSince ? <span className="ah-since"> · {fmtMonth(memberSince, locale)}</span> : null}
                </span>
              </div>
            </div>
            <div className="ah-actions">
              <a className="button button-light" href="/account/profile">{t.editProfile}</a>
              <form action="/api/auth/sign-out" method="post">
                <button type="submit" className="button button-light">{t.signOut}</button>
              </form>
            </div>
          </div>

          {/* Resume (Academy) — for every role when there is something to resume */}
          {resume ? (
            <a className="ah-resume" href={`/academy/${resume.slug}`}>
              <span className="ah-resume-ic">{ICON.acad}</span>
              <span className="ah-resume-main">
                <span className="ah-resume-eb">{t.resumeKicker}</span>
                <span className="ah-resume-t">{resume.title}</span>
                <span className="ah-resume-s">{t.moduleWord} {resume.moduleIndex + 1} · {resume.moduleTitle}</span>
              </span>
              <span className="button button-accent ah-resume-cta">{t.resumeCta} →</span>
            </a>
          ) : null}

          {/* Quick access */}
          <div className="ah-section-h"><span className="ah-section-t">{t.quickAccess}</span></div>
          <div className="ah-tiles">
            {tiles.map((tile, i) => (
              <a className="ah-tile" href={tile.href} key={i}>
                <div className={`ah-tile-ic ${tile.cls}`}>{ICON[tile.ic]}</div>
                <div className="ah-tile-t">{tile.t}{ICON.arrow}</div>
                <div className="ah-tile-s">{tile.s}</div>
                <div className="ah-tile-stat">
                  {tile.statDot ? <span className={`ah-pulse ${tile.statDot}`} /> : null}
                  {tile.statV}
                  {tile.statM ? <span className="ah-mono"> · {tile.statM}</span> : null}
                </div>
              </a>
            ))}
          </div>

          {/* Body */}
          <div className="ah-grid">
            <div className="ah-stack">
              <SettingsCard t={t} locale={locale} profile={profile} email={email} />
              {accountType !== 'team' ? (
                <ManagePanel
                  t={t}
                  accountType={accountType}
                  team={team}
                  selfId={selfId}
                  networkResellers={networkResellers}
                  clients={resellerClients}
                />
              ) : (
                <div className="ah-card" id="account-manage">
                  <div className="ah-card-h">
                    <div><div className="ah-card-t">{t.manage.adminTitle}</div><div className="ah-card-s">{t.manage.adminSub}</div></div>
                  </div>
                  <div className="ah-card-bd">
                    <a className="button button-dark" href="/admin">{t.manage.adminCta} →</a>
                  </div>
                </div>
              )}
            </div>
            <aside className="ah-aside">
              <AcademyMini t={t} academy={academy} rank={rank} nextRank={nextRank} />
              <SupportMini t={t} />
            </aside>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function SettingsCard({ t, locale, profile, email }: { t: Copy; locale: Locale; profile: Props['profile']; email: string }) {
  const rows: [string, string][] = [
    [t.rowName, profile.fullName || '—'],
    [t.rowEmail, email],
    [t.rowCompany, profile.company || '—'],
    [t.rowCountry, profile.country || '—'],
    [t.rowLang, LANG_NAME[locale]],
  ];
  return (
    <div className="ah-card">
      <div className="ah-card-h">
        <div><div className="ah-card-t">{t.settingsT}</div><div className="ah-card-s">{t.settingsS}</div></div>
        <a className="button button-light" href="/account/profile">{t.editProfile}</a>
      </div>
      <div className="ah-card-bd">
        {rows.map(([k, v], i) => (
          <div className="ah-row" key={i}>
            <span className="ah-row-k">{k}</span>
            <span className="ah-row-v">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonRow({
  av,
  accent,
  name,
  sub,
  tag,
  square,
  right,
}: {
  av: string;
  accent: string;
  name: string;
  sub: string;
  tag?: string;
  square?: boolean;
  right?: ReactNode;
}) {
  return (
    <div className="ah-person">
      <span className={`ah-mono-av${square ? ' sq' : ''}`} style={{ background: `${accent}1A`, color: accent }}>{av}</span>
      <div className="ah-person-main">
        <div className="ah-person-n">{name}{tag ? <span className="ah-tag">{tag}</span> : null}</div>
        <div className="ah-person-sub">{sub}</div>
      </div>
      {right ?? null}
    </div>
  );
}

function roleTag(t: Copy, role: MemberRole): string {
  return role === 'owner' ? t.manage.owner : role === 'admin' ? t.manage.adminTag : t.manage.memberTag;
}

function MemberControls({ t, member }: { t: Copy; member: OrgMember }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const run = async (req: () => Promise<Response>) => {
    setBusy(true);
    try {
      const res = await req();
      if (res.ok) router.refresh();
    } catch {
      /* ignore */
    }
    setBusy(false);
  };
  return (
    <span className="ah-member-ctl">
      <select
        className="ah-role-select"
        value={member.role}
        disabled={busy}
        onChange={(e) =>
          run(() =>
            fetch('/api/account/team/member', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: member.userId, role: e.target.value }),
            })
          )
        }
      >
        <option value="member">{t.manage.memberTag}</option>
        <option value="admin">{t.manage.adminTag}</option>
      </select>
      <button
        type="button"
        className="ah-member-remove"
        disabled={busy}
        title={t.manage.remove}
        aria-label={t.manage.remove}
        onClick={() =>
          run(() => fetch(`/api/account/team/member?userId=${encodeURIComponent(member.userId)}`, { method: 'DELETE' }))
        }
      >
        ✕
      </button>
    </span>
  );
}

function RevokeButton({ t, invitationId }: { t: Copy; invitationId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="ah-revoke"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await fetch(`/api/account/team/member?invitationId=${encodeURIComponent(invitationId)}`, {
            method: 'DELETE',
          });
          if (res.ok) router.refresh();
        } catch {
          /* ignore */
        }
        setBusy(false);
      }}
    >
      {t.manage.revoke}
    </button>
  );
}

function MediaUpload({
  kind,
  currentUrl,
  fallback,
  shape,
  editable,
  bg,
  fg,
}: {
  kind: 'avatar' | 'logo';
  currentUrl: string | null;
  fallback: ReactNode;
  shape: 'circle' | 'square';
  editable: boolean;
  bg: string;
  fg: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const cls = `ah-media ah-media-${shape}${editable ? ' is-editable' : ''}`;
  const inner = (
    <>
      {currentUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt="" />
      ) : (
        <span className="ah-media-fallback" style={{ color: fg }}>{fallback}</span>
      )}
      {editable ? (
        <span className="ah-media-cam">
          {busy ? (
            '…'
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 8.5h3l1.2-2h7.6L17 8.5h3v10H4v-10z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          )}
        </span>
      ) : null}
    </>
  );
  if (!editable) {
    return (
      <span className={cls} style={{ background: bg }}>
        {inner}
      </span>
    );
  }
  return (
    <label className={cls} style={{ background: bg }}>
      {inner}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        hidden
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          const fd = new FormData();
          fd.append('file', file);
          fd.append('kind', kind);
          try {
            const res = await fetch('/api/account/media', { method: 'POST', body: fd });
            if (res.ok) router.refresh();
          } catch {
            /* ignore */
          }
          setBusy(false);
          e.target.value = '';
        }}
      />
    </label>
  );
}

function InviteForm({ t, kind = 'member' }: { t: Copy; kind?: 'member' | 'client' | 'reseller' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(false);
    try {
      const res = await fetch('/api/account/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role: 'member', kind }),
      });
      if (res.ok) {
        setEmail('');
        router.refresh();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setBusy(false);
  };

  return (
    <form className="ah-invite-form" onSubmit={submit}>
      <input
        type="email"
        className={`ah-invite-input${error ? ' err' : ''}`}
        placeholder={t.manage.inviteEmailPh}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(false);
        }}
        disabled={busy}
        required
      />
      <button type="submit" className="ah-invite-send" disabled={busy}>
        {busy ? '…' : t.manage.inviteSend}
      </button>
    </form>
  );
}

function ManagePanel({
  t,
  accountType,
  team,
  selfId,
  networkResellers,
  clients,
}: {
  t: Copy;
  accountType: AccountType;
  team: Team;
  selfId: string;
  networkResellers: ResellerClientOrg[];
  clients: ResellerClient[];
}) {
  const [tab, setTab] = useState<'clients' | 'team'>(accountType === 'reseller' ? 'clients' : 'team');
  const accent = TONE[accountType];
  const title = accountType === 'distributor' ? t.manage.networkTitle : accountType === 'reseller' ? t.manage.clientsTitle : t.manage.teamTitle;
  const sub = accountType === 'distributor' ? t.manage.networkSub : accountType === 'reseller' ? t.manage.clientsSub : t.manage.teamSub;
  const canManage = team.myRole === 'owner' || team.myRole === 'admin';

  const teamView = (
    <>
      <div className="ah-people">
        {team.members.map((m) => (
          <PersonRow
            key={m.userId}
            av={initials(m.name, m.email)}
            accent={accent}
            name={m.name || m.email}
            sub={m.email}
            tag={roleTag(t, m.role)}
            right={canManage && m.role !== 'owner' && m.userId !== selfId ? <MemberControls t={t} member={m} /> : undefined}
          />
        ))}
        {team.pending.map((p) => (
          <PersonRow
            key={p.id}
            av={initials(null, p.email)}
            accent={accent}
            name={p.email}
            sub={t.manage.invitePending}
            tag={t.manage.invitedTag}
            right={canManage ? <RevokeButton t={t} invitationId={p.id} /> : undefined}
          />
        ))}
      </div>
      {canManage ? <InviteForm t={t} /> : null}
    </>
  );

  return (
    <div className="ah-card" id="account-manage">
      <div className="ah-card-h">
        <div><div className="ah-card-t">{title}</div><div className="ah-card-s">{sub}</div></div>
      </div>

      {accountType === 'reseller' ? (
        <div className="ah-tabs">
          <button className={`ah-tab${tab === 'clients' ? ' on' : ''}`} onClick={() => setTab('clients')}>{t.manage.tabClients(clients.length)}</button>
          <button className={`ah-tab${tab === 'team' ? ' on' : ''}`} onClick={() => setTab('team')}>{t.manage.tabTeam}</button>
        </div>
      ) : null}

      <div className="ah-card-bd">
        {accountType === 'distributor' ? (
          <>
            {networkResellers.length ? (
              <div className="ah-people">
                {networkResellers.map((r) => (
                  <PersonRow
                    key={r.orgId}
                    av={initials(r.name, r.name)}
                    accent={accent}
                    square
                    name={r.name}
                    sub={`${r.country ? r.country + ' · ' : ''}${t.stat.clientsCount(r.memberCount)}`}
                  />
                ))}
              </div>
            ) : (
              <p className="ah-empty">{t.manage.networkEmpty}</p>
            )}
            {canManage ? <InviteForm t={t} kind="reseller" /> : null}
          </>
        ) : accountType === 'reseller' && tab === 'clients' ? (
          <>
            {clients.length ? (
              <div className="ah-people">
                {clients.map((c, i) => (
                  <PersonRow
                    key={i}
                    av={initials(c.name, c.name)}
                    accent={accent}
                    square
                    name={c.name}
                    sub={`${c.country ? c.country + ' · ' : ''}${t.manage.pressUnit(c.presses)}${c.eligible ? ' · ' + t.manage.eligibleShort(c.eligible) : ''}${c.open ? ' · ' + t.manage.openShort(c.open) : ''}`}
                  />
                ))}
              </div>
            ) : (
              <p className="ah-empty">{t.manage.clientsEmpty}</p>
            )}
            {canManage ? <InviteForm t={t} kind="client" /> : null}
          </>
        ) : (
          teamView
        )}
      </div>
    </div>
  );
}

function AcademyMini({ t, academy, rank, nextRank }: { t: Copy; academy: Props['academy']; rank: string; nextRank: string }) {
  const R = 28;
  const C = 2 * Math.PI * R;
  const pct = academy.percentIntoLevel;
  return (
    <div className="ah-mini">
      <div className="ah-mini-h">{t.academyH}</div>
      <div className="ah-acad">
        <div className="ah-ring">
          <svg width="64" height="64">
            <circle cx="32" cy="32" r={R} fill="none" stroke="#EEEDEA" strokeWidth="6" />
            <circle cx="32" cy="32" r={R} fill="none" stroke="var(--role)" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 32 32)" />
          </svg>
          <div className="ah-ring-n"><b>{academy.level}</b><span>{t.levelWord}</span></div>
        </div>
        <div className="ah-acad-main">
          <div className="ah-acad-t">{rank}</div>
          <div className="ah-acad-xp">{academy.xp} {t.xpUnit}</div>
          <div className="ah-acad-bar"><span style={{ width: pct + '%' }} /></div>
          <div className="ah-acad-next">{academy.isMax ? t.maxLevel : t.xpToNext(academy.xpToNext, nextRank)}</div>
        </div>
      </div>
      <div className="ah-mini-stats">
        <div className="ah-mini-stat"><b>{academy.completedModules} / {academy.totalModules}</b><span>{t.statModules}</span></div>
        <div className="ah-mini-stat"><b>{academy.certificates}</b><span>{t.statCertificates}</span></div>
      </div>
    </div>
  );
}

function SupportMini({ t }: { t: Copy }) {
  const rows: [ReactNode, string, string, string][] = [
    [ICON.chat, t.supportChat, t.supportChatS, '/support'],
    [ICON.doc, t.supportHelp, t.supportHelpS, '/blog'],
    [ICON.mail, t.supportMail, t.supportMailS, 'mailto:contact@rutherford.fr'],
  ];
  return (
    <div className="ah-mini">
      <div className="ah-mini-h">{t.supportH}</div>
      {rows.map(([ic, title, s, href], i) => (
        <a className="ah-support-row" href={href as string} key={i}>
          <span className="ah-support-ic">{ic}</span>
          <span className="ah-support-main"><span className="ah-support-t">{title}</span><span className="ah-support-s">{s}</span></span>
          {ICON.chevR}
        </a>
      ))}
    </div>
  );
}
