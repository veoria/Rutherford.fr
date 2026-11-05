'use client';

import Image from 'next/image';
import { ChangeEvent, CSSProperties, DragEvent, FormEvent, Fragment, ReactNode, useEffect, useMemo, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { COUNTRIES, isKnownCountry } from '@/lib/countries';
import { readAttribution } from '@/lib/attribution';
import { track } from '@vercel/analytics';

type UploadFieldId = 'consolePhoto' | 'pressPhoto' | 'insideConsolePhoto' | 'keysPhoto' | 'platePhoto';

type PhotoConfig = {
  id: UploadFieldId;
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
// Titles and help text live in COPY (per locale); ids and flags never change.
const PHOTO_FIELDS: PhotoConfig[] = [
  { id: 'consolePhoto', exampleSrc: '/images/Console offset.jpg' },
  { id: 'pressPhoto', exampleSrc: '/images/Brand:Type and numbers of units.png' },
  { id: 'keysPhoto', exampleSrc: '/images/the number of keys.png' },
  { id: 'insideConsolePhoto', exampleSrc: '/images/inside the bottom of the console or computer.png', conditional: true, optional: true },
  { id: 'platePhoto', exampleSrc: '/images/Take a picture of the machine plate number..png', optional: true },
];

const CONFETTI_COLORS = ['#29ABE2', '#2E9E47', '#F7941D', '#EC0E8C', '#ED1C24', '#2E2BB8', '#1B6FF3'];

type PreviewMap = Record<UploadFieldId, string>;
type FileMap = Record<UploadFieldId, File | null>;

const emptyPreviews: PreviewMap = { consolePhoto: '', pressPhoto: '', insideConsolePhoto: '', keysPhoto: '', platePhoto: '' };
const emptyFiles: FileMap = { consolePhoto: null, pressPhoto: null, insideConsolePhoto: null, keysPhoto: null, platePhoto: null };

const photosFor = (brand: string) => PHOTO_FIELDS.filter((p) => !p.conditional || INSIDE_BRANDS.includes(brand));

// ---------------------------------------------------------------------------
// Copy. Only the displayed labels are localized: select values, payload keys,
// field names and analytics events are untouched.
// ---------------------------------------------------------------------------

type Copy = {
  // Hero
  kicker: string;
  kickerBrand: (name: string) => string;
  title: string;
  titleBrand: (name: string) => string;
  tagline: string;
  phone: string;
  /** "Works with <strong>{consoles}</strong> consoles on {presses}." */
  brandLine: (consoles: ReactNode, presses: string) => ReactNode;
  start: string;
  sketchAlt: string;
  compatible: string;
  compatibleAria: string;
  yourPress: string;
  roiQuestion: string;
  roiLink: string;
  // Stepper
  steps: [string, string, string];
  stepOf: (n: number) => string;
  // Step 1
  invitedBy: string; // after "<strong>Company</strong>"
  invited: string;
  signedInAs: string; // before "<strong>email</strong>"
  signedInBehalf: string;
  signedInSelf: string;
  loginBefore: string;
  loginStrong: string;
  loginAfter: string;
  email: string;
  emailClient: string;
  emailPh: string;
  emailClientPh: string;
  company: string;
  companyClient: string;
  companyPh: string;
  companyClientPh: string;
  country: string;
  countryPh: string;
  // Step 2
  step2Lead: string;
  pressBrand: string;
  pressBrandPh: string;
  model: string;
  modelPh: string;
  hint: (n: number, brand: string, inside: boolean) => ReactNode;
  // Step 3
  step3Lead: string;
  progress: (done: number, total: number) => ReactNode;
  photos: Record<UploadFieldId, { title: string; help: string }>;
  condNote: string;
  required: string;
  optional: string;
  uploadAria: (title: string) => string;
  photoAdded: string;
  replace: string;
  dropHint: string;
  notes: string;
  notesPh: string;
  // Nav
  back: string;
  next: string;
  sending: string;
  send: string;
  photosLeft: (n: number) => string;
  reassure: [string, string, string, string];
  // Errors
  errStep1: string;
  errStep2: string;
  errUploadStart: string;
  errUpload: (msg: string) => string;
  errGeneric: string;
  // Success
  received: string;
  thanks: string;
  keepRef: string;
  yourRef: string;
  copy: string;
  copied: string;
  sumCompany: string;
  sumCountry: string;
  sumPress: string;
  nextTitle: string;
  next1: string;
  next2: string;
  next3: string;
  trackRequest: string;
  backHome: string;
  // FAQ
  faqTitle: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'Free eligibility check',
    kickerBrand: (name) => `Free eligibility check · ${name}`,
    title: 'Console Validation',
    titleBrand: (name) => `${name} Console Validation`,
    tagline: 'The system that pays for itself.',
    phone: 'Do everything from your phone.',
    brandLine: (consoles, presses) => (
      <>
        Works with {consoles} consoles on {presses}.
      </>
    ),
    start: 'Submit your information ↓',
    sketchAlt: 'Sketch of an offset press console',
    compatible: 'Compatible consoles',
    compatibleAria: 'Compatible offset press brands',
    yourPress: 'Your press:',
    roiQuestion: 'Curious what color drift costs you?',
    roiLink: 'Try the ROI calculator →',
    steps: ['Your details', 'Your press', 'Photos'],
    stepOf: (n) => `Step ${n} of 3`,
    invitedBy: ' invited you to validate your console — your details are below.',
    invited: "You've been invited to validate your console — your details are below.",
    signedInAs: 'Signed in as ',
    signedInBehalf: " — submitting for a client. Enter the client's details below.",
    signedInSelf: ' — your details are prefilled.',
    loginBefore: 'Have a Rutherford account? ',
    loginStrong: 'Log in',
    loginAfter: ' to prefill your details and go faster',
    email: 'Email address',
    emailClient: 'Client email address',
    emailPh: 'you@company.com',
    emailClientPh: 'client@company.com',
    company: 'Printing company name',
    companyClient: 'Client company name',
    companyPh: 'Your company',
    companyClientPh: 'Client company',
    country: 'Country',
    countryPh: 'Select a country',
    step2Lead: "Pick your press brand — we'll only ask for the photos that apply to it.",
    pressBrand: 'Press brand',
    pressBrandPh: 'Select a brand',
    model: 'Machine / model name',
    modelPh: 'e.g. CD 74-5',
    hint: (n, brand, inside) => (
      <>
        We'll ask for <b>{n} photos</b> for {brand}
        {inside ? ', including an inside-console shot' : ''}.
      </>
    ),
    step3Lead: 'Straight from your phone — tap a card to use the camera.',
    progress: (done, total) => (
      <>
        <b>{done}</b> of {total} photos added
      </>
    ),
    photos: {
      consolePhoto: { title: 'Console photo', help: 'One clear picture of the full console in its environment.' },
      pressPhoto: { title: 'Press photo', help: 'The press with brand, type and number of units visible.' },
      keysPhoto: { title: 'Number of keys', help: 'Close-up of the number of keys on the console.' },
      insideConsolePhoto: { title: 'Inside console or computer', help: 'Inside the bottom of the console or computer cabinet.' },
      platePhoto: { title: 'Machine plate number', help: 'The machine plate showing model, year and units.' },
    },
    condNote: ' · for Heidelberg, Komori & Mitsubishi',
    required: 'Required',
    optional: 'Optional',
    uploadAria: (title) => `Upload ${title}`,
    photoAdded: 'Photo added',
    replace: 'Replace',
    dropHint: 'Take a photo or drag & drop',
    notes: 'Additional notes',
    notesPh: 'Anything else we should know about your press or setup.',
    back: '← Back',
    next: 'Continue →',
    sending: 'Sending…',
    send: 'Send →',
    photosLeft: (n) => `${n} photo${n > 1 ? 's' : ''} still to add`,
    reassure: ['Free', '~2 min', 'Reply within 1 business day', 'No commitment'],
    errStep1: 'Please add a valid email, your company name and your country.',
    errStep2: 'Please pick your press brand and enter the machine / model name.',
    errUploadStart: 'Could not start the photo upload, please retry.',
    errUpload: (msg) => `Photo upload failed: ${msg}`,
    errGeneric: 'Something went wrong, please retry.',
    received: 'Request received',
    thanks: "Thanks — we've got your console validation.",
    keepRef: "Keep your reference for any follow-up. We've also sent a confirmation to your email.",
    yourRef: 'Your reference',
    copy: 'Copy',
    copied: 'Copied',
    sumCompany: 'Company',
    sumCountry: 'Country',
    sumPress: 'Press',
    nextTitle: 'What happens next',
    next1: 'Our team reviews your photos.',
    next2: 'You receive a confirmation email with this reference.',
    next3: 'We reply within one business day with your press eligibility.',
    trackRequest: 'Track your request →',
    backHome: 'Back to rutherford.fr',
    faqTitle: 'Frequently asked questions',
  },

  fr: {
    kicker: 'Vérification d’éligibilité gratuite',
    kickerBrand: (name) => `Vérification d’éligibilité gratuite · ${name}`,
    title: 'Validation console',
    titleBrand: (name) => `Validation console ${name}`,
    tagline: 'Le système qui s’autofinance.',
    phone: 'Tout se fait depuis votre téléphone.',
    brandLine: (consoles, presses) => (
      <>
        Compatible avec les consoles {consoles} sur {presses}.
      </>
    ),
    start: 'Envoyer vos informations ↓',
    sketchAlt: 'Croquis d’une console de presse offset',
    compatible: 'Consoles compatibles',
    compatibleAria: 'Marques de presses offset compatibles',
    yourPress: 'Votre presse :',
    roiQuestion: 'Combien vous coûte la dérive couleur ?',
    roiLink: 'Essayez le calculateur de ROI →',
    steps: ['Vos coordonnées', 'Votre presse', 'Photos'],
    stepOf: (n) => `Étape ${n} sur 3`,
    invitedBy: ' vous invite à valider votre console — vos coordonnées figurent ci-dessous.',
    invited: 'Vous avez été invité à valider votre console — vos coordonnées figurent ci-dessous.',
    signedInAs: 'Connecté en tant que ',
    signedInBehalf: ' — demande pour un client. Indiquez les coordonnées du client ci-dessous.',
    signedInSelf: ' — vos coordonnées sont préremplies.',
    loginBefore: 'Vous avez un compte Rutherford ? ',
    loginStrong: 'Connectez-vous',
    loginAfter: ' pour préremplir vos coordonnées et gagner du temps',
    email: 'Adresse e-mail',
    emailClient: 'Adresse e-mail du client',
    emailPh: 'vous@imprimerie.fr',
    emailClientPh: 'client@imprimerie.fr',
    company: 'Nom de l’imprimerie',
    companyClient: 'Société du client',
    companyPh: 'Votre imprimerie',
    companyClientPh: 'Imprimerie du client',
    country: 'Pays',
    countryPh: 'Sélectionnez un pays',
    step2Lead: 'Choisissez la marque de votre presse — nous ne demanderons que les photos utiles pour celle-ci.',
    pressBrand: 'Marque de la presse',
    pressBrandPh: 'Sélectionnez une marque',
    model: 'Machine / modèle',
    modelPh: 'ex. CD 74-5',
    hint: (n, brand, inside) => (
      <>
        Nous vous demanderons <b>{n} photos</b> pour {brand}
        {inside ? ', dont une vue de l’intérieur de la console' : ''}.
      </>
    ),
    step3Lead: 'Directement depuis votre téléphone — touchez une carte pour ouvrir l’appareil photo.',
    progress: (done, total) => (
      <>
        <b>{done}</b> photo{done > 1 ? 's' : ''} sur {total} ajoutée{done > 1 ? 's' : ''}
      </>
    ),
    photos: {
      consolePhoto: { title: 'Photo de la console', help: 'Une photo nette de la console entière dans son environnement.' },
      pressPhoto: { title: 'Photo de la presse', help: 'La presse avec la marque, le type et le nombre de groupes visibles.' },
      keysPhoto: { title: 'Nombre de clés d’encrage', help: 'Gros plan sur les clés d’encrage de la console, pour en compter le nombre.' },
      insideConsolePhoto: { title: 'Intérieur de la console ou de l’ordinateur', help: 'L’intérieur du bas de la console ou de l’armoire informatique.' },
      platePhoto: { title: 'Plaque constructeur', help: 'La plaque constructeur indiquant le modèle, l’année et le nombre de groupes.' },
    },
    condNote: ' · pour Heidelberg, Komori et Mitsubishi',
    required: 'Obligatoire',
    optional: 'Facultatif',
    uploadAria: (title) => `Ajouter la photo : ${title}`,
    photoAdded: 'Photo ajoutée',
    replace: 'Remplacer',
    dropHint: 'Prenez une photo ou glissez-déposez',
    notes: 'Remarques complémentaires',
    notesPh: 'Tout ce que nous devrions savoir sur votre presse ou votre installation.',
    back: '← Retour',
    next: 'Continuer →',
    sending: 'Envoi…',
    send: 'Envoyer →',
    photosLeft: (n) => (n > 1 ? `Encore ${n} photos à ajouter` : 'Encore 1 photo à ajouter'),
    reassure: ['Gratuit', '~2 min', 'Réponse sous 1 jour ouvré', 'Sans engagement'],
    errStep1: 'Merci d’indiquer une adresse e-mail valide, le nom de votre société et votre pays.',
    errStep2: 'Merci de choisir la marque de votre presse et d’indiquer la machine / le modèle.',
    errUploadStart: 'Impossible de démarrer l’envoi de la photo, merci de réessayer.',
    errUpload: (msg) => `Échec de l’envoi de la photo : ${msg}`,
    errGeneric: 'Une erreur est survenue, merci de réessayer.',
    received: 'Demande reçue',
    thanks: 'Merci — votre demande de validation console est bien reçue.',
    keepRef: 'Conservez votre référence pour tout échange ultérieur. Une confirmation vous a également été envoyée par e-mail.',
    yourRef: 'Votre référence',
    copy: 'Copier',
    copied: 'Copié',
    sumCompany: 'Société',
    sumCountry: 'Pays',
    sumPress: 'Presse',
    nextTitle: 'Et ensuite ?',
    next1: 'Notre équipe examine vos photos.',
    next2: 'Vous recevez un e-mail de confirmation avec cette référence.',
    next3: 'Nous vous répondons sous un jour ouvré sur l’éligibilité de votre presse.',
    trackRequest: 'Suivre votre demande →',
    backHome: 'Retour sur rutherford.fr',
    faqTitle: 'Questions fréquentes',
  },

  de: {
    kicker: 'Kostenlose Eignungsprüfung',
    kickerBrand: (name) => `Kostenlose Eignungsprüfung · ${name}`,
    title: 'Konsolenvalidierung',
    titleBrand: (name) => `Konsolenvalidierung ${name}`,
    tagline: 'Das System, das sich selbst bezahlt.',
    phone: 'Alles direkt vom Smartphone aus.',
    brandLine: (consoles, presses) => (
      <>
        Funktioniert mit den Konsolen {consoles} an {presses}.
      </>
    ),
    start: 'Angaben übermitteln ↓',
    sketchAlt: 'Skizze der Konsole einer Offset-Druckmaschine',
    compatible: 'Kompatible Konsolen',
    compatibleAria: 'Kompatible Hersteller von Offset-Druckmaschinen',
    yourPress: 'Ihre Druckmaschine:',
    roiQuestion: 'Was kostet Sie Farbabweichung?',
    roiLink: 'Zum ROI-Rechner →',
    steps: ['Ihre Angaben', 'Ihre Druckmaschine', 'Fotos'],
    stepOf: (n) => `Schritt ${n} von 3`,
    invitedBy: ' hat Sie eingeladen, Ihre Konsole validieren zu lassen — Ihre Angaben finden Sie unten.',
    invited: 'Sie wurden eingeladen, Ihre Konsole validieren zu lassen — Ihre Angaben finden Sie unten.',
    signedInAs: 'Angemeldet als ',
    signedInBehalf: ' — Anfrage für einen Kunden. Tragen Sie unten die Angaben des Kunden ein.',
    signedInSelf: ' — Ihre Angaben sind vorausgefüllt.',
    loginBefore: 'Sie haben ein Rutherford-Konto? ',
    loginStrong: 'Melden Sie sich an',
    loginAfter: ', um Ihre Angaben vorauszufüllen und Zeit zu sparen',
    email: 'E-Mail-Adresse',
    emailClient: 'E-Mail-Adresse des Kunden',
    emailPh: 'sie@druckerei.de',
    emailClientPh: 'kunde@druckerei.de',
    company: 'Name der Druckerei',
    companyClient: 'Firma des Kunden',
    companyPh: 'Ihre Druckerei',
    companyClientPh: 'Druckerei des Kunden',
    country: 'Land',
    countryPh: 'Land auswählen',
    step2Lead: 'Wählen Sie den Hersteller Ihrer Druckmaschine — wir fragen nur die Fotos ab, die dafür relevant sind.',
    pressBrand: 'Hersteller der Druckmaschine',
    pressBrandPh: 'Hersteller auswählen',
    model: 'Maschine / Modell',
    modelPh: 'z. B. CD 74-5',
    hint: (n, brand, inside) => (
      <>
        Für {brand} bitten wir um <b>{n} Fotos</b>
        {inside ? ', darunter eine Innenaufnahme der Konsole' : ''}.
      </>
    ),
    step3Lead: 'Direkt vom Smartphone — tippen Sie auf eine Karte, um die Kamera zu öffnen.',
    progress: (done, total) => (
      <>
        <b>{done}</b> von {total} Fotos hinzugefügt
      </>
    ),
    photos: {
      consolePhoto: { title: 'Foto der Konsole', help: 'Ein klares Foto der gesamten Konsole in ihrer Umgebung.' },
      pressPhoto: { title: 'Foto der Druckmaschine', help: 'Die Druckmaschine mit sichtbarem Hersteller, Typ und Anzahl der Druckwerke.' },
      keysPhoto: { title: 'Anzahl der Farbzonen', help: 'Nahaufnahme der Farbzonen auf der Konsole, damit sich ihre Anzahl ablesen lässt.' },
      insideConsolePhoto: { title: 'Innenansicht der Konsole oder des Rechners', help: 'Das Innere des Konsolenunterbaus oder des Rechnerschranks.' },
      platePhoto: { title: 'Typenschild der Maschine', help: 'Das Typenschild mit Modell, Baujahr und Anzahl der Druckwerke.' },
    },
    condNote: ' · für Heidelberg, Komori & Mitsubishi',
    required: 'Pflicht',
    optional: 'Optional',
    uploadAria: (title) => `${title} hochladen`,
    photoAdded: 'Foto hinzugefügt',
    replace: 'Ersetzen',
    dropHint: 'Foto aufnehmen oder hierher ziehen',
    notes: 'Weitere Hinweise',
    notesPh: 'Alles, was wir sonst noch über Ihre Druckmaschine oder Installation wissen sollten.',
    back: '← Zurück',
    next: 'Weiter →',
    sending: 'Wird gesendet…',
    send: 'Absenden →',
    photosLeft: (n) => (n > 1 ? `Noch ${n} Fotos hinzuzufügen` : 'Noch 1 Foto hinzuzufügen'),
    reassure: ['Kostenlos', '~2 Min.', 'Antwort innerhalb von 1 Werktag', 'Unverbindlich'],
    errStep1: 'Bitte geben Sie eine gültige E-Mail-Adresse, Ihren Firmennamen und Ihr Land an.',
    errStep2: 'Bitte wählen Sie den Hersteller Ihrer Druckmaschine und geben Sie Maschine / Modell an.',
    errUploadStart: 'Der Foto-Upload konnte nicht gestartet werden, bitte versuchen Sie es erneut.',
    errUpload: (msg) => `Foto-Upload fehlgeschlagen: ${msg}`,
    errGeneric: 'Etwas ist schiefgelaufen, bitte versuchen Sie es erneut.',
    received: 'Anfrage eingegangen',
    thanks: 'Vielen Dank — Ihre Konsolenvalidierung ist bei uns eingegangen.',
    keepRef: 'Bewahren Sie Ihre Referenz für Rückfragen auf. Eine Bestätigung haben wir Ihnen auch per E-Mail geschickt.',
    yourRef: 'Ihre Referenz',
    copy: 'Kopieren',
    copied: 'Kopiert',
    sumCompany: 'Firma',
    sumCountry: 'Land',
    sumPress: 'Druckmaschine',
    nextTitle: 'Wie es weitergeht',
    next1: 'Unser Team prüft Ihre Fotos.',
    next2: 'Sie erhalten eine Bestätigungs-E-Mail mit dieser Referenz.',
    next3: 'Innerhalb eines Werktags erhalten Sie unsere Einschätzung zur Eignung Ihrer Druckmaschine.',
    trackRequest: 'Anfrage verfolgen →',
    backHome: 'Zurück zu rutherford.fr',
    faqTitle: 'Häufige Fragen',
  },

  it: {
    kicker: 'Verifica di idoneità gratuita',
    kickerBrand: (name) => `Verifica di idoneità gratuita · ${name}`,
    title: 'Validazione console',
    titleBrand: (name) => `Validazione console ${name}`,
    tagline: 'Il sistema che si ripaga da solo.',
    phone: 'Tutto dal suo smartphone.',
    brandLine: (consoles, presses) => (
      <>
        Compatibile con le console {consoles} {presses}.
      </>
    ),
    start: 'Invia le sue informazioni ↓',
    sketchAlt: 'Schizzo di una console di macchina offset',
    compatible: 'Console compatibili',
    compatibleAria: 'Marche di macchine offset compatibili',
    yourPress: 'La sua macchina:',
    roiQuestion: 'Quanto le costa la deriva colore?',
    roiLink: 'Provi il calcolatore ROI →',
    steps: ['I suoi dati', 'La sua macchina', 'Foto'],
    stepOf: (n) => `Passo ${n} di 3`,
    invitedBy: ' l’ha invitata a validare la sua console — i suoi dati sono riportati qui sotto.',
    invited: 'È stato invitato a validare la sua console — i suoi dati sono riportati qui sotto.',
    signedInAs: 'Ha effettuato l’accesso come ',
    signedInBehalf: ' — richiesta per conto di un cliente. Inserisca i dati del cliente qui sotto.',
    signedInSelf: ' — i suoi dati sono precompilati.',
    loginBefore: 'Ha un account Rutherford? ',
    loginStrong: 'Acceda',
    loginAfter: ' per precompilare i suoi dati e fare prima',
    email: 'Indirizzo e-mail',
    emailClient: 'E-mail del cliente',
    emailPh: 'lei@tipografia.it',
    emailClientPh: 'cliente@tipografia.it',
    company: 'Nome della tipografia',
    companyClient: 'Azienda del cliente',
    companyPh: 'La sua azienda',
    companyClientPh: 'Azienda del cliente',
    country: 'Paese',
    countryPh: 'Selezioni un paese',
    step2Lead: 'Scelga la marca della sua macchina — le chiederemo solo le foto necessarie per quel modello.',
    pressBrand: 'Marca della macchina',
    pressBrandPh: 'Selezioni una marca',
    model: 'Macchina / modello',
    modelPh: 'es. CD 74-5',
    hint: (n, brand, inside) => (
      <>
        Per {brand} le chiederemo <b>{n} foto</b>
        {inside ? ', inclusa una dell’interno della console' : ''}.
      </>
    ),
    step3Lead: 'Direttamente dal suo smartphone — tocchi una scheda per aprire la fotocamera.',
    progress: (done, total) => (
      <>
        <b>{done}</b> foto su {total} aggiunte
      </>
    ),
    photos: {
      consolePhoto: { title: 'Foto della console', help: 'Una foto nitida dell’intera console nel suo ambiente.' },
      pressPhoto: { title: 'Foto della macchina', help: 'La macchina con marca, tipo e numero di gruppi visibili.' },
      keysPhoto: { title: 'Numero di chiavi di inchiostro', help: 'Primo piano delle chiavi di inchiostro sulla console, per contarne il numero.' },
      insideConsolePhoto: { title: 'Interno della console o del computer', help: 'L’interno della parte inferiore della console o dell’armadio del computer.' },
      platePhoto: { title: 'Targhetta della macchina', help: 'La targhetta identificativa con modello, anno e numero di gruppi.' },
    },
    condNote: ' · per Heidelberg, Komori e Mitsubishi',
    required: 'Obbligatoria',
    optional: 'Facoltativa',
    uploadAria: (title) => `Carica: ${title}`,
    photoAdded: 'Foto aggiunta',
    replace: 'Sostituisci',
    dropHint: 'Scatti una foto o trascini qui il file',
    notes: 'Note aggiuntive',
    notesPh: 'Qualsiasi altra informazione utile sulla sua macchina o sulla sua installazione.',
    back: '← Indietro',
    next: 'Continua →',
    sending: 'Invio in corso…',
    send: 'Invia →',
    photosLeft: (n) => (n > 1 ? `Mancano ancora ${n} foto` : 'Manca ancora 1 foto'),
    reassure: ['Gratuita', '~2 min', 'Risposta entro 1 giorno lavorativo', 'Senza impegno'],
    errStep1: 'Inserisca un indirizzo e-mail valido, il nome della sua azienda e il suo paese.',
    errStep2: 'Selezioni la marca della sua macchina e indichi macchina / modello.',
    errUploadStart: 'Impossibile avviare il caricamento della foto, riprovi.',
    errUpload: (msg) => `Caricamento della foto non riuscito: ${msg}`,
    errGeneric: 'Si è verificato un errore, riprovi.',
    received: 'Richiesta ricevuta',
    thanks: 'Grazie — abbiamo ricevuto la sua richiesta di validazione console.',
    keepRef: 'Conservi il suo riferimento per ogni contatto successivo. Le abbiamo inviato anche una conferma via e-mail.',
    yourRef: 'Il suo riferimento',
    copy: 'Copia',
    copied: 'Copiato',
    sumCompany: 'Azienda',
    sumCountry: 'Paese',
    sumPress: 'Macchina',
    nextTitle: 'Cosa succede ora',
    next1: 'Il nostro team esamina le sue foto.',
    next2: 'Riceve un’e-mail di conferma con questo riferimento.',
    next3: 'Entro un giorno lavorativo le comunichiamo l’idoneità della sua macchina.',
    trackRequest: 'Segui la sua richiesta →',
    backHome: 'Torna a rutherford.fr',
    faqTitle: 'Domande frequenti',
  },

  es: {
    kicker: 'Comprobación de compatibilidad gratuita',
    kickerBrand: (name) => `Comprobación de compatibilidad gratuita · ${name}`,
    title: 'Validación de consola',
    titleBrand: (name) => `Validación de consola ${name}`,
    tagline: 'El sistema que se paga solo.',
    phone: 'Hágalo todo desde su móvil.',
    brandLine: (consoles, presses) => (
      <>
        Compatible con las consolas {consoles} en {presses}.
      </>
    ),
    start: 'Enviar sus datos ↓',
    sketchAlt: 'Boceto de una consola de prensa offset',
    compatible: 'Consolas compatibles',
    compatibleAria: 'Marcas de prensas offset compatibles',
    yourPress: 'Su prensa:',
    roiQuestion: '¿Cuánto le cuesta la deriva del color?',
    roiLink: 'Pruebe la calculadora de ROI →',
    steps: ['Sus datos', 'Su prensa', 'Fotos'],
    stepOf: (n) => `Paso ${n} de 3`,
    invitedBy: ' le ha invitado a validar su consola — sus datos figuran a continuación.',
    invited: 'Le han invitado a validar su consola — sus datos figuran a continuación.',
    signedInAs: 'Sesión iniciada como ',
    signedInBehalf: ' — solicitud en nombre de un cliente. Introduzca los datos del cliente a continuación.',
    signedInSelf: ' — sus datos ya están rellenados.',
    loginBefore: '¿Tiene una cuenta Rutherford? ',
    loginStrong: 'Inicie sesión',
    loginAfter: ' para rellenar sus datos automáticamente y ganar tiempo',
    email: 'Correo electrónico',
    emailClient: 'Correo electrónico del cliente',
    emailPh: 'usted@imprenta.es',
    emailClientPh: 'cliente@imprenta.es',
    company: 'Nombre de la imprenta',
    companyClient: 'Empresa del cliente',
    companyPh: 'Su empresa',
    companyClientPh: 'Empresa del cliente',
    country: 'País',
    countryPh: 'Seleccione un país',
    step2Lead: 'Elija la marca de su prensa — solo le pediremos las fotos que correspondan.',
    pressBrand: 'Marca de la prensa',
    pressBrandPh: 'Seleccione una marca',
    model: 'Máquina / modelo',
    modelPh: 'p. ej. CD 74-5',
    hint: (n, brand, inside) => (
      <>
        Para {brand} le pediremos <b>{n} fotos</b>
        {inside ? ', incluida una del interior de la consola' : ''}.
      </>
    ),
    step3Lead: 'Directamente desde su móvil — toque una tarjeta para abrir la cámara.',
    progress: (done, total) => (
      <>
        <b>{done}</b> de {total} fotos añadidas
      </>
    ),
    photos: {
      consolePhoto: { title: 'Foto de la consola', help: 'Una foto nítida de toda la consola en su entorno.' },
      pressPhoto: { title: 'Foto de la prensa', help: 'La prensa con la marca, el tipo y el número de cuerpos visibles.' },
      keysPhoto: { title: 'Número de llaves de tinta', help: 'Primer plano de las llaves de tinta de la consola, para contarlas.' },
      insideConsolePhoto: { title: 'Interior de la consola o del ordenador', help: 'El interior de la parte baja de la consola o del armario del ordenador.' },
      platePhoto: { title: 'Placa de características', help: 'La placa de características con el modelo, el año y el número de cuerpos.' },
    },
    condNote: ' · para Heidelberg, Komori y Mitsubishi',
    required: 'Obligatoria',
    optional: 'Opcional',
    uploadAria: (title) => `Subir: ${title}`,
    photoAdded: 'Foto añadida',
    replace: 'Reemplazar',
    dropHint: 'Haga una foto o arrastre y suelte',
    notes: 'Notas adicionales',
    notesPh: 'Cualquier otro dato que debamos conocer sobre su prensa o su instalación.',
    back: '← Atrás',
    next: 'Continuar →',
    sending: 'Enviando…',
    send: 'Enviar →',
    photosLeft: (n) => (n > 1 ? `Faltan ${n} fotos` : 'Falta 1 foto'),
    reassure: ['Gratis', '~2 min', 'Respuesta en 1 día laborable', 'Sin compromiso'],
    errStep1: 'Indique un correo electrónico válido, el nombre de su empresa y su país.',
    errStep2: 'Seleccione la marca de su prensa e indique la máquina / modelo.',
    errUploadStart: 'No se pudo iniciar la subida de la foto, inténtelo de nuevo.',
    errUpload: (msg) => `Error al subir la foto: ${msg}`,
    errGeneric: 'Se ha producido un error, inténtelo de nuevo.',
    received: 'Solicitud recibida',
    thanks: 'Gracias — hemos recibido su validación de consola.',
    keepRef: 'Guarde su referencia para cualquier consulta. También le hemos enviado una confirmación por correo electrónico.',
    yourRef: 'Su referencia',
    copy: 'Copiar',
    copied: 'Copiado',
    sumCompany: 'Empresa',
    sumCountry: 'País',
    sumPress: 'Prensa',
    nextTitle: 'Qué ocurre ahora',
    next1: 'Nuestro equipo revisa sus fotos.',
    next2: 'Recibe un correo de confirmación con esta referencia.',
    next3: 'En un día laborable le confirmamos la compatibilidad de su prensa.',
    trackRequest: 'Seguir su solicitud →',
    backHome: 'Volver a rutherford.fr',
    faqTitle: 'Preguntas frecuentes',
  },

  pt: {
    kicker: 'Verificação de compatibilidade gratuita',
    kickerBrand: (name) => `Verificação de compatibilidade gratuita · ${name}`,
    title: 'Validação de consola',
    titleBrand: (name) => `Validação de consola ${name}`,
    tagline: 'O sistema que se paga a si próprio.',
    phone: 'Faça tudo a partir do seu telemóvel.',
    brandLine: (consoles, presses) => (
      <>
        Compatível com as consolas {consoles} {presses}.
      </>
    ),
    start: 'Enviar os seus dados ↓',
    sketchAlt: 'Esboço de uma consola de máquina offset',
    compatible: 'Consolas compatíveis',
    compatibleAria: 'Marcas de máquinas offset compatíveis',
    yourPress: 'A sua máquina:',
    roiQuestion: 'Quanto lhe custa a deriva de cor?',
    roiLink: 'Experimente a calculadora de ROI →',
    steps: ['Os seus dados', 'A sua máquina', 'Fotos'],
    stepOf: (n) => `Passo ${n} de 3`,
    invitedBy: ' convidou-o a validar a sua consola — os seus dados encontram-se abaixo.',
    invited: 'Foi convidado a validar a sua consola — os seus dados encontram-se abaixo.',
    signedInAs: 'Sessão iniciada como ',
    signedInBehalf: ' — pedido em nome de um cliente. Introduza os dados do cliente abaixo.',
    signedInSelf: ' — os seus dados estão preenchidos.',
    loginBefore: 'Tem uma conta Rutherford? ',
    loginStrong: 'Inicie sessão',
    loginAfter: ' para preencher os seus dados automaticamente e poupar tempo',
    email: 'Endereço de e-mail',
    emailClient: 'E-mail do cliente',
    emailPh: 'nome@grafica.pt',
    emailClientPh: 'cliente@grafica.pt',
    company: 'Nome da gráfica',
    companyClient: 'Empresa do cliente',
    companyPh: 'A sua gráfica',
    companyClientPh: 'Empresa do cliente',
    country: 'País',
    countryPh: 'Selecione um país',
    step2Lead: 'Escolha a marca da sua máquina — só pediremos as fotos relevantes para ela.',
    pressBrand: 'Marca da máquina',
    pressBrandPh: 'Selecione uma marca',
    model: 'Máquina / modelo',
    modelPh: 'ex.: CD 74-5',
    hint: (n, brand, inside) => (
      <>
        Para {brand} pediremos <b>{n} fotos</b>
        {inside ? ', incluindo uma do interior da consola' : ''}.
      </>
    ),
    step3Lead: 'Diretamente do seu telemóvel — toque num cartão para abrir a câmara.',
    progress: (done, total) => (
      <>
        <b>{done}</b> de {total} fotos adicionadas
      </>
    ),
    photos: {
      consolePhoto: { title: 'Foto da consola', help: 'Uma foto nítida de toda a consola no seu ambiente.' },
      pressPhoto: { title: 'Foto da máquina', help: 'A máquina com a marca, o tipo e o número de corpos visíveis.' },
      keysPhoto: { title: 'Número de chaves de tinta', help: 'Grande plano das chaves de tinta na consola, para as contar.' },
      insideConsolePhoto: { title: 'Interior da consola ou do computador', help: 'O interior da parte inferior da consola ou do armário do computador.' },
      platePhoto: { title: 'Chapa de características', help: 'A chapa de características com o modelo, o ano e o número de corpos.' },
    },
    condNote: ' · para Heidelberg, Komori e Mitsubishi',
    required: 'Obrigatória',
    optional: 'Opcional',
    uploadAria: (title) => `Carregar: ${title}`,
    photoAdded: 'Foto adicionada',
    replace: 'Substituir',
    dropHint: 'Tire uma foto ou arraste e largue',
    notes: 'Notas adicionais',
    notesPh: 'Qualquer outra informação útil sobre a sua máquina ou instalação.',
    back: '← Voltar',
    next: 'Continuar →',
    sending: 'A enviar…',
    send: 'Enviar →',
    photosLeft: (n) => (n > 1 ? `Faltam ${n} fotos` : 'Falta 1 foto'),
    reassure: ['Gratuito', '~2 min', 'Resposta em 1 dia útil', 'Sem compromisso'],
    errStep1: 'Indique um e-mail válido, o nome da sua empresa e o seu país.',
    errStep2: 'Selecione a marca da sua máquina e indique a máquina / modelo.',
    errUploadStart: 'Não foi possível iniciar o envio da foto, tente novamente.',
    errUpload: (msg) => `Falha no envio da foto: ${msg}`,
    errGeneric: 'Ocorreu um erro, tente novamente.',
    received: 'Pedido recebido',
    thanks: 'Obrigado — recebemos o seu pedido de validação de consola.',
    keepRef: 'Guarde a sua referência para qualquer contacto posterior. Também lhe enviámos uma confirmação por e-mail.',
    yourRef: 'A sua referência',
    copy: 'Copiar',
    copied: 'Copiado',
    sumCompany: 'Empresa',
    sumCountry: 'País',
    sumPress: 'Máquina',
    nextTitle: 'O que acontece a seguir',
    next1: 'A nossa equipa analisa as suas fotos.',
    next2: 'Recebe um e-mail de confirmação com esta referência.',
    next3: 'Num dia útil respondemos sobre a compatibilidade da sua máquina.',
    trackRequest: 'Acompanhar o seu pedido →',
    backHome: 'Voltar a rutherford.fr',
    faqTitle: 'Perguntas frequentes',
  },
};

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
  t,
}: {
  config: PhotoConfig;
  brand: string;
  file: File | null;
  preview: string;
  onChange: (id: UploadFieldId, file: File | null) => void;
  t: Copy;
}) {
  const [dragging, setDragging] = useState(false);
  const required = !config.optional && (!config.conditional || INSIDE_BRANDS.includes(brand));
  const label = t.photos[config.id];
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
          <span className="cv-up-title">{label.title}</span>
          <span className={`cv-badge${required ? ' req' : ''}`}>{required ? t.required : t.optional}</span>
        </div>
        <div className="cv-up-help">
          {label.help}
          {config.conditional ? <span className="cv-cond">{t.condNote}</span> : null}
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
            aria-label={t.uploadAria(label.title)}
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
              <b>{t.photoAdded}</b>
              <span className="cv-drop-replace">{t.replace}</span>
            </>
          ) : (
            <>
              <CameraIcon />
              {t.dropHint}
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

function Reassure({ items }: { items: readonly string[] }) {
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

/** Country options: the stored/sent value stays the English name (the whole
 *  pipeline keys on it); only the visible label is localized, sorted per locale. */
function useCountryOptions(locale: Locale) {
  return useMemo(() => {
    if (locale === 'en') return COUNTRIES.map((c) => ({ value: c.name, label: c.name }));
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale], { type: 'region' });
    } catch {
      names = null;
    }
    const opts = COUNTRIES.map((c) => {
      let label = c.name;
      try {
        label = names?.of(c.code) || c.name;
      } catch {
        /* keep EN */
      }
      return { value: c.name, label };
    });
    return opts.sort((a, b) => a.label.localeCompare(b.label, locale));
  }, [locale]);
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
  const t = COPY[locale];
  const lhref = (p: string) => (locale === 'en' ? p : `/${locale}${p}`);
  const countryOptions = useCountryOptions(locale);

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
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setRefCode(ref.slice(0, 100));
    // "Check compatibility" from a press in Mon atelier: prefill the model.
    const machine = params.get('model');
    if (machine) setModel(machine.slice(0, 120));
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
      setErrorMsg(t.errStep1);
      return;
    }
    if (step === 2 && !step2Valid) {
      setErrorMsg(t.errStep2);
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
        if (!urlRes.ok) throw new Error(t.errUploadStart);
        const { path, token } = await urlRes.json();
        const { error } = await supabase.storage.from('console-validations').uploadToSignedUrl(path, token, file);
        if (error) throw new Error(t.errUpload(error.message));
        photos.push({ field, path });
      }

      const attribution = readAttribution();
      const res = await fetch('/api/console-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, companyName, country, machineName, notes, ref: refCode, invite: invite?.token, uploadId, photos, attribution }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? t.errGeneric);
      }
      const body = await res.json().catch(() => null);
      setReference(body?.reference ?? null);
      // Conversion event, sent to every analytics surface we run. Vercel Web
      // Analytics is cookieless, so it counts the leads the consent-gated
      // trackers miss.
      (window as any).gtag?.('event', 'console_validation_submit', { event_category: 'lead', machine: machineName });
      const linkedinConversion = process.env.NEXT_PUBLIC_LINKEDIN_CONVERSION_CONSOLE;
      if (linkedinConversion) (window as any).lintrk?.('track', { conversion_id: Number(linkedinConversion) });
      track('console_validation_submit', {
        country,
        machine: machineName,
        source: attribution?.source ?? attribution?.referrer ?? 'direct',
        campaign: attribution?.campaign ?? '',
      });
      (window as any).posthog?.capture?.('console_validation_submit', {
        country,
        machine: machineName,
        source: attribution?.source ?? attribution?.referrer ?? 'direct',
        campaign: attribution?.campaign ?? '',
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : t.errGeneric);
    } finally {
      setSending(false);
    }
  };

  const pressLabel = [pressBrand, model.trim()].filter(Boolean).join(' ');
  const countryLabel = countryOptions.find((c) => c.value === country)?.label ?? country;

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
                    {t.received}
                  </div>
                  <h1 className="cv-suc-title cv-reveal" style={{ animationDelay: '.22s' }}>
                    {t.thanks}
                  </h1>
                  <p className="cv-suc-p cv-reveal" style={{ animationDelay: '.29s' }}>
                    {t.keepRef}
                  </p>
                  {reference ? (
                    <div className="cv-refbox cv-reveal" style={{ animationDelay: '.36s' }}>
                      <div className="cv-ref-k">{t.yourRef}</div>
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
                        {copied ? t.copied : t.copy}
                      </button>
                    </div>
                  ) : null}
                  <div className="cv-suc-summary cv-reveal" style={{ animationDelay: '.43s' }}>
                    {[
                      [t.sumCompany, companyName],
                      [t.sumCountry, countryLabel],
                      [t.sumPress, pressLabel],
                    ].map(([k, v]) => (
                      <div key={k} className="cv-suc-cell">
                        <div className="cv-suc-k">{k}</div>
                        <div className="cv-suc-v">{v || '—'}</div>
                      </div>
                    ))}
                  </div>
                  <div className="cv-next cv-reveal" style={{ animationDelay: '.5s' }}>
                    <div className="cv-next-h">{t.nextTitle}</div>
                    <ol className="cv-next-list">
                      <li>
                        <span className="cv-next-n">1</span>{t.next1}
                      </li>
                      <li>
                        <span className="cv-next-n">2</span>{t.next2}
                      </li>
                      <li>
                        <span className="cv-next-n">3</span>{t.next3}
                      </li>
                    </ol>
                  </div>
                  <div className="cv-suc-actions cv-reveal" style={{ animationDelay: '.57s' }}>
                    <a className="cv-btn-primary" href={lhref('/account/console-validations')}>
                      {t.trackRequest}
                    </a>
                    <a className="cv-btn-ghost" href={lhref('/')}>
                      {t.backHome}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={`console-simple-intro${started ? ' is-started' : ''}`}>
                <p className="section-kicker">
                  {brand ? t.kickerBrand(brand.name) : t.kicker}
                </p>
                <h1>{brand ? t.titleBrand(brand.name) : t.title}</h1>
                <p className="console-simple-tagline">{t.tagline}</p>
                <p className="console-simple-phone">{t.phone}</p>
                {brand ? (
                  <p className="console-simple-brand-line">
                    {t.brandLine(<strong>{brand.consoles}</strong>, brand.presses)}
                  </p>
                ) : null}
                {!started ? (
                  <div className="console-simple-cta-row">
                    <button type="button" className="button button-accent" onClick={startForm}>
                      {t.start}
                    </button>
                  </div>
                ) : null}
                <div className={`cv-hero-extra${started ? ' is-out' : ''}`} aria-hidden={started}>
                  <div className="console-simple-intro-image">
                    <Image
                      src="/images/console-validation-sketch.png"
                      alt={t.sketchAlt}
                      width={1448}
                      height={1086}
                      priority
                      sizes="(max-width: 768px) 100vw, 960px"
                    />
                  </div>
                  <p className="console-simple-presses-label">{t.compatible}</p>
                  <div className="console-cta-presses console-simple-presses" aria-label={t.compatibleAria}>
                    <div className="console-cta-presses-track">
                      {[...PRESS_BRANDS, ...PRESS_BRANDS].map((b, i) => (
                        <span className="console-cta-press" key={`${b.alt}-${i}`}>
                          <Image src={b.src} alt={i < PRESS_BRANDS.length ? b.alt : ''} width={240} height={80} sizes="140px" />
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="console-simple-brand-links">
                    {t.yourPress} <a href={lhref('/console-validation/heidelberg')}>Heidelberg</a> ·{' '}
                    <a href={lhref('/console-validation/komori')}>Komori</a> ·{' '}
                    <a href={lhref('/console-validation/koenig-bauer')}>Koenig &amp; Bauer</a> ·{' '}
                    <a href={lhref('/console-validation/manroland')}>Manroland</a> ·{' '}
                    <a href={lhref('/console-validation/mitsubishi')}>Mitsubishi</a> ·{' '}
                    <a href={lhref('/console-validation/ryobi')}>Ryobi</a> · <a href={lhref('/console-validation/goss')}>Goss</a> ·{' '}
                    <a href={lhref('/console-validation/presstek')}>Presstek</a>
                  </p>
                  <p className="console-simple-roi-link">
                    {t.roiQuestion} <a href={lhref('/#roi')}>{t.roiLink}</a>
                  </p>
                </div>
              </div>

              {started ? (
              <div className="cv-page cv-stage-form" id="submit">
                <div className="cv-wrap">
                  <div className="cv-stepcap">{t.stepOf(step)}</div>
                  <div className="cv-stepper" key={step}>
                    {t.steps.map((label, i) => {
                      const n = i + 1;
                      const cls = n < step ? 'done' : n === step ? 'current' : 'future';
                      const can = n <= maxStep && n !== step;
                      return (
                        <Fragment key={i}>
                          {can ? (
                            <button type="button" className={`cv-stp ${cls}`} onClick={() => navTo(n)}>
                              <span className="cv-stp-n">{n < step ? '✓' : n}</span>
                              <span className="cv-stp-l">{label}</span>
                            </button>
                          ) : (
                            <div className={`cv-stp ${cls}`}>
                              <span className="cv-stp-n">{n < step ? '✓' : n}</span>
                              <span className="cv-stp-l">{label}</span>
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
                        <div className="cv-step-h">{t.steps[0]}</div>
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
                                  <strong>{invite.inviterCompany}</strong>
                                  {t.invitedBy}
                                </>
                              ) : (
                                <>{t.invited}</>
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
                                {t.signedInAs}
                                <strong>{signedInEmail}</strong>
                                {onBehalf ? t.signedInBehalf : t.signedInSelf}
                              </span>
                            </div>
                          ) : (
                            <a className="cv-login" href={`${lhref('/account/sign-in')}?next=${lhref('/console-validation')}`}>
                              <span className="cv-login-ic">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                                  <path d="M5 19c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                                </svg>
                              </span>
                              <span>
                                {t.loginBefore}
                                <strong>{t.loginStrong}</strong>
                                {t.loginAfter}
                              </span>
                              <span className="cv-login-arrow">→</span>
                            </a>
                          )
                        ) : null}
                        <div className="cv-grid2">
                          <label className="cv-field">
                            <span className="cv-label">
                              {onBehalf ? t.emailClient : t.email} <em>*</em>
                            </span>
                            <input
                              className="cv-input"
                              type="email"
                              placeholder={onBehalf ? t.emailClientPh : t.emailPh}
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </label>
                          <label className="cv-field">
                            <span className="cv-label">
                              {onBehalf ? t.companyClient : t.company} <em>*</em>
                            </span>
                            <input
                              className="cv-input"
                              type="text"
                              placeholder={onBehalf ? t.companyClientPh : t.companyPh}
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                            />
                          </label>
                          <label className="cv-field cv-field-full">
                            <span className="cv-label">
                              {t.country} <em>*</em>
                            </span>
                            <span className="cv-selwrap">
                              <select
                                className="cv-input cv-select"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                              >
                                <option value="">{t.countryPh}</option>
                                {countryOptions.map((c) => (
                                  <option key={c.value} value={c.value}>
                                    {c.label}
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
                        <div className="cv-step-h">{t.steps[1]}</div>
                        <p className="cv-step-p">{t.step2Lead}</p>
                        <div className="cv-grid2">
                          <label className="cv-field">
                            <span className="cv-label">
                              {t.pressBrand} <em>*</em>
                            </span>
                            <span className="cv-selwrap">
                              <select
                                className="cv-input cv-select"
                                value={pressBrand}
                                onChange={(e) => setPressBrand(e.target.value)}
                              >
                                <option value="">{t.pressBrandPh}</option>
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
                              {t.model} <em>*</em>
                            </span>
                            <input
                              className="cv-input"
                              type="text"
                              placeholder={brand?.machinePlaceholder ?? t.modelPh}
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
                            <span>{t.hint(list.length, pressBrand, inside)}</span>
                          </div>
                        ) : null}
                      </>
                    ) : null}

                    {step === 3 ? (
                      <>
                        <div className="cv-step-h">{t.steps[2]}</div>
                        <p className="cv-step-p">{t.step3Lead}</p>
                        <div className="cv-prog">
                          <div className="cv-prog-top">
                            <span>{t.progress(photosDone, list.length)}</span>
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
                              t={t}
                            />
                          ))}
                        </div>
                        <label className="cv-field cv-notes">
                          <span className="cv-label">{t.notes}</span>
                          <textarea
                            className="cv-input"
                            rows={3}
                            placeholder={t.notesPh}
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
                        {t.back}
                      </button>
                    ) : (
                      <span />
                    )}
                    {step < 3 ? (
                      <button type="button" className="cv-btn-primary" onClick={goNext}>
                        {t.next}
                      </button>
                    ) : (
                      <button type="button" className="cv-btn-primary" disabled={sending || photosLeft > 0} onClick={handleSubmit}>
                        {sending ? t.sending : t.send}
                      </button>
                    )}
                  </div>
                  {step === 3 && photosLeft > 0 ? (
                    <div className="cv-stepnote">
                      {t.photosLeft(photosLeft)}
                    </div>
                  ) : null}
                  <Reassure items={t.reassure} />
                </div>
              </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      {faq && faq.length > 0 ? (
        <section className="section console-faq-section" aria-label={t.faqTitle}>
          <div className="container console-faq-shell">
            <h2 className="console-faq-title">{t.faqTitle}</h2>
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
