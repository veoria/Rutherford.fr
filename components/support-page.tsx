'use client';

import { ChangeEvent, DragEvent, FormEvent, useEffect, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { SUPPORT_COUNTRIES } from '@/lib/support-countries';

type SupportUploadId = 'support1' | 'support2' | 'support3';
type FileMap = Record<SupportUploadId, File | null>;
type PreviewMap = Record<SupportUploadId, string>;

const emptyFiles: FileMap = { support1: null, support2: null, support3: null };
const emptyPreviews: PreviewMap = { support1: '', support2: '', support3: '' };

// Map a free-form country (IP geo / profile) onto the Asana Country options.
const COUNTRY_ALIASES: Record<string, string> = {
  'united states': 'USA',
  'united states of america': 'USA',
  us: 'USA',
  usa: 'USA',
  'united kingdom': 'UK',
  'great britain': 'UK',
  england: 'UK',
  gb: 'UK',
  uk: 'UK',
  deutschland: 'Germany',
  allemagne: 'Germany',
  germany: 'Germany',
  espagne: 'Spain',
  'españa': 'Spain',
  italie: 'Italy',
  italia: 'Italy',
  japon: 'Japan',
  chine: 'China',
  inde: 'India',
  mexique: 'Mexico',
  russie: 'Russia',
  'arabie saoudite': 'Saudi Arabia',
  'afrique du sud': 'South Africa',
  emirats: 'UAE',
  'united arab emirates': 'UAE',
};

function mapCountry(raw?: string | null): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!v) return null;
  const exact = (SUPPORT_COUNTRIES as readonly string[]).find((c) => c.toLowerCase() === v.toLowerCase());
  if (exact) return exact;
  return COUNTRY_ALIASES[v.toLowerCase()] ?? null;
}

type PhotoCard = { title: string; desc: string };
type FaqItem = { q: string; a: string };

type Copy = {
  kicker: string;
  title: string;
  tagline: string;
  phoneLine: string;
  ctaPrimary: string;
  ctaSecondary: string;
  reassure: string[];
  formTitle: string;
  signedInPrefix: string;
  loginPrompt: string;
  emailLabel: string;
  emailPh: string;
  companyLabel: string;
  companyPh: string;
  anydeskLabel: string;
  anydeskPh: string;
  countryLabel: string;
  countryPlaceholder: string;
  subjectLabel: string;
  subjectPh: string;
  anydeskHelpTitle: string;
  anydeskHelp: string;
  problemLabel: string;
  problemPh: string;
  photosTitle: string;
  dropHint: string;
  photoAdded: string;
  replace: string;
  photoCards: [PhotoCard, PhotoCard, PhotoCard];
  submit: string;
  sending: string;
  submitHint: string;
  errFields: string;
  errGeneric: string;
  nextTitle: string;
  nextSteps: [string, string, string];
  faqTitle: string;
  faq: FaqItem[];
  successTitle: string;
  successRefPre: string;
  successBody: string;
  copyLabel: string;
  copiedLabel: string;
  trackCta: string;
  backHome: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'Support',
    title: 'We’re here to help you.',
    tagline: 'Remote support for your pressroom.',
    phoneLine: 'Snap a photo and send it straight from your phone.',
    ctaPrimary: 'Open a ticket',
    ctaSecondary: 'Talk to an expert',
    reassure: ['Expert team', 'Reply within 1 business day', 'We connect only with your permission', 'No commitment'],
    formTitle: 'How can we help?',
    signedInPrefix: 'Signed in as',
    loginPrompt: 'Have a Rutherford account? Log in to prefill your details.',
    emailLabel: 'Email',
    emailPh: 'name@example.com',
    companyLabel: 'Company',
    companyPh: 'Your company',
    anydeskLabel: 'AnyDesk support number',
    anydeskPh: 'e.g. 123 456 789',
    countryLabel: 'Country',
    countryPlaceholder: 'Select your country',
    subjectLabel: 'Subject',
    subjectPh: 'Short summary of the problem',
    anydeskHelpTitle: 'What is AnyDesk?',
    anydeskHelp:
      'AnyDesk lets our team see your screen to help faster. Download it free from anydesk.com, open it, and copy the 9-digit address shown under “Your Desk”. We connect only when you accept the request on your machine.',
    problemLabel: 'Explain your problem',
    problemPh:
      'What happens, on which press / software, and since when? You can write in your own language — English helps us answer faster.',
    photosTitle: 'Add photos (optional)',
    dropHint: 'Take a photo or drag & drop',
    photoAdded: 'Photo added',
    replace: 'Replace',
    photoCards: [
      { title: 'Full screen', desc: 'One picture of the whole screen, not just a detail.' },
      { title: 'Error message', desc: 'If you see a red error box, tap it and capture the message.' },
      { title: 'Anything else', desc: 'Any extra picture that helps us understand faster.' },
    ],
    submit: 'Send support request',
    sending: 'Sending…',
    submitHint: 'Mobile friendly — take and upload photos straight from your phone.',
    errFields: 'Please fill in the required fields (email, subject and description).',
    errGeneric: 'Something went wrong, please retry.',
    nextTitle: 'What happens next',
    nextSteps: [
      'Our team reviews your request and photos.',
      'We reach out — and connect via AnyDesk only with your permission.',
      'We follow up until it’s solved. Track everything from your account.',
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'What is AnyDesk and is it safe?',
        a: 'AnyDesk is a remote-access tool that lets our team see your console screen to help faster. The connection starts only when you accept it on your machine, and you can end it at any time. Download it free at anydesk.com.',
      },
      {
        q: 'Where do I find my AnyDesk number?',
        a: 'Open AnyDesk on the console computer. Your 9-digit address is shown under “Your Desk” — copy it into the form.',
      },
      {
        q: 'How fast will you reply?',
        a: 'We reply within one business day, usually much sooner. Keep your ticket reference for any follow-up.',
      },
      {
        q: 'Can I follow my ticket?',
        a: 'Yes. With a Rutherford account, every ticket and its status appears under My account → Support, and we email you whenever the status changes.',
      },
    ],
    successTitle: 'Thank you for your request.',
    successRefPre: 'Your ticket reference',
    successBody: 'We’ve emailed you a confirmation. Our team will get back to you as quickly as possible.',
    copyLabel: 'Copy',
    copiedLabel: 'Copied',
    trackCta: 'Track my ticket',
    backHome: 'Back to rutherford.fr',
  },
  fr: {
    kicker: 'Support',
    title: 'Nous sommes là pour vous aider.',
    tagline: 'Une assistance à distance pour votre atelier.',
    phoneLine: 'Prenez une photo et envoyez-la directement depuis votre téléphone.',
    ctaPrimary: 'Ouvrir un ticket',
    ctaSecondary: 'Parlez à un expert',
    reassure: ['Équipe experte', 'Réponse sous 1 jour ouvré', 'Connexion uniquement avec votre accord', 'Sans engagement'],
    formTitle: 'Comment pouvons-nous vous aider ?',
    signedInPrefix: 'Connecté en tant que',
    loginPrompt: 'Vous avez un compte Rutherford ? Connectez-vous pour pré-remplir vos informations.',
    emailLabel: 'E-mail',
    emailPh: 'nom@exemple.com',
    companyLabel: 'Société',
    companyPh: 'Votre société',
    anydeskLabel: 'Numéro de support AnyDesk',
    anydeskPh: 'ex. 123 456 789',
    countryLabel: 'Pays',
    countryPlaceholder: 'Sélectionnez votre pays',
    subjectLabel: 'Objet',
    subjectPh: 'Résumé court du problème',
    anydeskHelpTitle: 'Qu’est-ce qu’AnyDesk ?',
    anydeskHelp:
      'AnyDesk permet à notre équipe de voir votre écran pour vous aider plus vite. Téléchargez-le gratuitement sur anydesk.com, ouvrez-le et copiez l’adresse à 9 chiffres affichée sous « Votre poste ». La connexion ne démarre que lorsque vous l’acceptez sur votre machine.',
    problemLabel: 'Expliquez votre problème',
    problemPh:
      'Que se passe-t-il, sur quelle presse / quel logiciel, et depuis quand ? Vous pouvez écrire dans votre langue — l’anglais nous aide à répondre plus vite.',
    photosTitle: 'Ajoutez des photos (facultatif)',
    dropHint: 'Prenez une photo ou glissez-déposez',
    photoAdded: 'Photo ajoutée',
    replace: 'Remplacer',
    photoCards: [
      { title: 'Écran complet', desc: 'Une photo de tout l’écran, pas seulement d’un détail.' },
      { title: 'Message d’erreur', desc: 'Si une fenêtre d’erreur rouge s’affiche, touchez-la et capturez le message.' },
      { title: 'Autre chose', desc: 'Toute photo supplémentaire qui nous aide à comprendre plus vite.' },
    ],
    submit: 'Envoyer la demande',
    sending: 'Envoi…',
    submitHint: 'Compatible mobile — prenez et envoyez les photos directement depuis votre téléphone.',
    errFields: 'Veuillez remplir les champs obligatoires (e-mail, objet et description).',
    errGeneric: 'Une erreur est survenue, veuillez réessayer.',
    nextTitle: 'Et après ?',
    nextSteps: [
      'Notre équipe examine votre demande et vos photos.',
      'Nous vous contactons — la connexion AnyDesk ne se fait qu’avec votre accord.',
      'Nous assurons le suivi jusqu’à la résolution. Suivez tout depuis votre compte.',
    ],
    faqTitle: 'Questions fréquentes',
    faq: [
      {
        q: 'Qu’est-ce qu’AnyDesk et est-ce sûr ?',
        a: 'AnyDesk est un outil d’accès à distance qui permet à notre équipe de voir l’écran de votre console pour vous aider plus vite. La connexion ne démarre que lorsque vous l’acceptez sur votre machine, et vous pouvez y mettre fin à tout moment. Téléchargement gratuit sur anydesk.com.',
      },
      {
        q: 'Où trouver mon numéro AnyDesk ?',
        a: 'Ouvrez AnyDesk sur l’ordinateur de la console. Votre adresse à 9 chiffres s’affiche sous « Votre poste » — copiez-la dans le formulaire.',
      },
      {
        q: 'Sous quel délai répondez-vous ?',
        a: 'Nous répondons sous un jour ouvré, généralement bien plus vite. Conservez la référence de votre ticket pour tout suivi.',
      },
      {
        q: 'Puis-je suivre mon ticket ?',
        a: 'Oui. Avec un compte Rutherford, chaque ticket et son statut apparaissent dans Mon compte → Support, et nous vous envoyons un e-mail à chaque changement de statut.',
      },
    ],
    successTitle: 'Merci pour votre demande.',
    successRefPre: 'Référence de votre ticket',
    successBody: 'Nous vous avons envoyé une confirmation par e-mail. Notre équipe vous répondra dans les plus brefs délais.',
    copyLabel: 'Copier',
    copiedLabel: 'Copié',
    trackCta: 'Suivre mon ticket',
    backHome: 'Retour à rutherford.fr',
  },
  de: {
    kicker: 'Support',
    title: 'Wir sind für Sie da.',
    tagline: 'Fernsupport für Ihre Druckerei.',
    phoneLine: 'Foto machen und direkt vom Smartphone senden.',
    ctaPrimary: 'Ticket öffnen',
    ctaSecondary: 'Sprechen Sie mit einem Experten',
    reassure: ['Experten-Team', 'Antwort < 1 Werktag', 'Verbindung nur mit Ihrer Zustimmung', 'Unverbindlich'],
    formTitle: 'Wie können wir helfen?',
    signedInPrefix: 'Angemeldet als',
    loginPrompt: 'Haben Sie ein Rutherford-Konto? Melden Sie sich an, um Ihre Angaben vorauszufüllen.',
    emailLabel: 'E-Mail',
    emailPh: 'name@beispiel.com',
    companyLabel: 'Unternehmen',
    companyPh: 'Ihr Unternehmen',
    anydeskLabel: 'AnyDesk-Supportnummer',
    anydeskPh: 'z. B. 123 456 789',
    countryLabel: 'Land',
    countryPlaceholder: 'Land auswählen',
    subjectLabel: 'Betreff',
    subjectPh: 'Kurze Zusammenfassung des Problems',
    anydeskHelpTitle: 'Was ist AnyDesk?',
    anydeskHelp:
      'Mit AnyDesk kann unser Team Ihren Bildschirm sehen, um schneller zu helfen. Laden Sie es kostenlos unter anydesk.com herunter, öffnen Sie es und kopieren Sie die 9-stellige Adresse unter „Dieser Arbeitsplatz“. Die Verbindung startet erst, wenn Sie sie an Ihrer Maschine bestätigen.',
    problemLabel: 'Erklären Sie Ihr Problem',
    problemPh:
      'Was passiert, an welcher Druckmaschine / Software und seit wann? Sie können in Ihrer Sprache schreiben — Englisch hilft uns, schneller zu antworten.',
    photosTitle: 'Fotos hinzufügen (optional)',
    dropHint: 'Foto aufnehmen oder hierher ziehen',
    photoAdded: 'Foto hinzugefügt',
    replace: 'Ersetzen',
    photoCards: [
      { title: 'Ganzer Bildschirm', desc: 'Ein Foto des gesamten Bildschirms, nicht nur eines Details.' },
      { title: 'Fehlermeldung', desc: 'Wenn ein rotes Fehlerfenster erscheint, tippen Sie darauf und erfassen Sie die Meldung.' },
      { title: 'Sonstiges', desc: 'Jedes weitere Foto, das uns hilft, schneller zu verstehen.' },
    ],
    submit: 'Anfrage senden',
    sending: 'Senden…',
    submitHint: 'Mobilfreundlich — Fotos direkt vom Smartphone aufnehmen und senden.',
    errFields: 'Bitte füllen Sie die Pflichtfelder aus (E-Mail, Betreff und Beschreibung).',
    errGeneric: 'Etwas ist schiefgelaufen, bitte erneut versuchen.',
    nextTitle: 'Wie geht es weiter?',
    nextSteps: [
      'Unser Team prüft Ihre Anfrage und Ihre Fotos.',
      'Wir melden uns — die AnyDesk-Verbindung erfolgt nur mit Ihrer Zustimmung.',
      'Wir bleiben dran, bis es gelöst ist. Verfolgen Sie alles in Ihrem Konto.',
    ],
    faqTitle: 'Häufige Fragen',
    faq: [
      {
        q: 'Was ist AnyDesk und ist es sicher?',
        a: 'AnyDesk ist ein Fernzugriffstool, mit dem unser Team Ihren Konsolenbildschirm sehen kann, um schneller zu helfen. Die Verbindung startet erst, wenn Sie sie an Ihrer Maschine bestätigen, und Sie können sie jederzeit beenden. Kostenlos unter anydesk.com.',
      },
      {
        q: 'Wo finde ich meine AnyDesk-Nummer?',
        a: 'Öffnen Sie AnyDesk auf dem Konsolencomputer. Ihre 9-stellige Adresse erscheint unter „Dieser Arbeitsplatz“ — kopieren Sie sie in das Formular.',
      },
      {
        q: 'Wie schnell antworten Sie?',
        a: 'Wir antworten innerhalb eines Werktags, meist deutlich schneller. Bewahren Sie Ihre Ticket-Referenz für Rückfragen auf.',
      },
      {
        q: 'Kann ich mein Ticket verfolgen?',
        a: 'Ja. Mit einem Rutherford-Konto sehen Sie jedes Ticket und seinen Status unter Mein Konto → Support, und bei jeder Statusänderung senden wir Ihnen eine E-Mail.',
      },
    ],
    successTitle: 'Vielen Dank für Ihre Anfrage.',
    successRefPre: 'Ihre Ticket-Referenz',
    successBody: 'Wir haben Ihnen eine Bestätigung per E-Mail gesendet. Unser Team meldet sich schnellstmöglich.',
    copyLabel: 'Kopieren',
    copiedLabel: 'Kopiert',
    trackCta: 'Mein Ticket verfolgen',
    backHome: 'Zurück zu rutherford.fr',
  },
  it: {
    kicker: 'Supporto',
    title: 'Siamo qui per aiutarla.',
    tagline: 'Assistenza da remoto per la sua sala stampa.',
    phoneLine: 'Scatti una foto e la invii direttamente dal telefono.',
    ctaPrimary: 'Apri un ticket',
    ctaSecondary: 'Parla con un esperto',
    reassure: ['Team di esperti', 'Risposta entro 1 giorno lavorativo', 'Connessione solo con il suo consenso', 'Senza impegno'],
    formTitle: 'Come possiamo aiutarla?',
    signedInPrefix: 'Accesso come',
    loginPrompt: 'Ha un account Rutherford? Acceda per precompilare i suoi dati.',
    emailLabel: 'E-mail',
    emailPh: 'nome@esempio.com',
    companyLabel: 'Azienda',
    companyPh: 'La sua azienda',
    anydeskLabel: 'Numero di supporto AnyDesk',
    anydeskPh: 'es. 123 456 789',
    countryLabel: 'Paese',
    countryPlaceholder: 'Selezioni il suo paese',
    subjectLabel: 'Oggetto',
    subjectPh: 'Breve riassunto del problema',
    anydeskHelpTitle: 'Cos’è AnyDesk?',
    anydeskHelp:
      'AnyDesk permette al nostro team di vedere il suo schermo per aiutarla più velocemente. Lo scarichi gratuitamente su anydesk.com, lo apra e copi l’indirizzo a 9 cifre mostrato sotto « Questa postazione ». La connessione si avvia solo quando la accetta sulla sua macchina.',
    problemLabel: 'Spieghi il suo problema',
    problemPh:
      'Cosa succede, su quale macchina da stampa / software e da quando? Può scrivere nella sua lingua — l’inglese ci aiuta a rispondere più in fretta.',
    photosTitle: 'Aggiunga foto (facoltativo)',
    dropHint: 'Scatti una foto o trascini qui',
    photoAdded: 'Foto aggiunta',
    replace: 'Sostituisci',
    photoCards: [
      { title: 'Schermo intero', desc: 'Una foto di tutto lo schermo, non solo di un dettaglio.' },
      { title: 'Messaggio di errore', desc: 'Se compare un riquadro di errore rosso, lo tocchi e catturi il messaggio.' },
      { title: 'Altro', desc: 'Qualsiasi foto in più che ci aiuti a capire più in fretta.' },
    ],
    submit: 'Invia la richiesta',
    sending: 'Invio…',
    submitHint: 'Ottimizzato per mobile — scatti e invii le foto direttamente dal telefono.',
    errFields: 'Compili i campi obbligatori (e-mail, oggetto e descrizione).',
    errGeneric: 'Qualcosa è andato storto, riprovi.',
    nextTitle: 'E poi?',
    nextSteps: [
      'Il nostro team esamina la sua richiesta e le foto.',
      'La contattiamo — la connessione AnyDesk avviene solo con il suo consenso.',
      'Seguiamo il caso fino alla risoluzione. Segua tutto dal suo account.',
    ],
    faqTitle: 'Domande frequenti',
    faq: [
      {
        q: 'Cos’è AnyDesk ed è sicuro?',
        a: 'AnyDesk è uno strumento di accesso remoto che permette al nostro team di vedere lo schermo della sua console per aiutarla più velocemente. La connessione si avvia solo quando la accetta sulla sua macchina e può interromperla in qualsiasi momento. Gratuito su anydesk.com.',
      },
      {
        q: 'Dove trovo il mio numero AnyDesk?',
        a: 'Apra AnyDesk sul computer della console. Il suo indirizzo a 9 cifre compare sotto « Questa postazione » — lo copi nel modulo.',
      },
      {
        q: 'In quanto tempo rispondete?',
        a: 'Rispondiamo entro un giorno lavorativo, di solito molto prima. Conservi il riferimento del ticket per ogni contatto successivo.',
      },
      {
        q: 'Posso seguire il mio ticket?',
        a: 'Sì. Con un account Rutherford, ogni ticket e il suo stato compaiono in Il mio account → Support, e le inviamo un’e-mail a ogni cambio di stato.',
      },
    ],
    successTitle: 'Grazie per la sua richiesta.',
    successRefPre: 'Riferimento del suo ticket',
    successBody: 'Le abbiamo inviato una conferma via e-mail. Il nostro team le risponderà il prima possibile.',
    copyLabel: 'Copia',
    copiedLabel: 'Copiato',
    trackCta: 'Segui il mio ticket',
    backHome: 'Torna a rutherford.fr',
  },
  es: {
    kicker: 'Soporte',
    title: 'Estamos aquí para ayudarle.',
    tagline: 'Asistencia remota para su sala de prensa.',
    phoneLine: 'Haga una foto y envíela directamente desde su teléfono.',
    ctaPrimary: 'Abrir un ticket',
    ctaSecondary: 'Hable con un experto',
    reassure: ['Equipo experto', 'Respuesta en menos de 1 día hábil', 'Conexión solo con su permiso', 'Sin compromiso'],
    formTitle: '¿Cómo podemos ayudarle?',
    signedInPrefix: 'Sesión iniciada como',
    loginPrompt: '¿Tiene una cuenta Rutherford? Inicie sesión para rellenar sus datos.',
    emailLabel: 'Correo electrónico',
    emailPh: 'nombre@ejemplo.com',
    companyLabel: 'Empresa',
    companyPh: 'Su empresa',
    anydeskLabel: 'Número de soporte AnyDesk',
    anydeskPh: 'ej. 123 456 789',
    countryLabel: 'País',
    countryPlaceholder: 'Seleccione su país',
    subjectLabel: 'Asunto',
    subjectPh: 'Resumen breve del problema',
    anydeskHelpTitle: '¿Qué es AnyDesk?',
    anydeskHelp:
      'AnyDesk permite a nuestro equipo ver su pantalla para ayudarle más rápido. Descárguelo gratis en anydesk.com, ábralo y copie la dirección de 9 cifras que aparece bajo « Este escritorio ». La conexión solo se inicia cuando usted la acepta en su máquina.',
    problemLabel: 'Explique su problema',
    problemPh:
      '¿Qué ocurre, en qué prensa / software y desde cuándo? Puede escribir en su idioma — el inglés nos ayuda a responder más rápido.',
    photosTitle: 'Añada fotos (opcional)',
    dropHint: 'Haga una foto o arrastre aquí',
    photoAdded: 'Foto añadida',
    replace: 'Reemplazar',
    photoCards: [
      { title: 'Pantalla completa', desc: 'Una foto de toda la pantalla, no solo de un detalle.' },
      { title: 'Mensaje de error', desc: 'Si aparece un recuadro de error rojo, tóquelo y capture el mensaje.' },
      { title: 'Cualquier otra cosa', desc: 'Cualquier foto adicional que nos ayude a entender más rápido.' },
    ],
    submit: 'Enviar la solicitud',
    sending: 'Enviando…',
    submitHint: 'Compatible con móvil — haga y envíe las fotos directamente desde su teléfono.',
    errFields: 'Complete los campos obligatorios (correo, asunto y descripción).',
    errGeneric: 'Algo salió mal, vuelva a intentarlo.',
    nextTitle: '¿Y después?',
    nextSteps: [
      'Nuestro equipo revisa su solicitud y sus fotos.',
      'Le contactamos — la conexión AnyDesk solo se realiza con su permiso.',
      'Hacemos seguimiento hasta resolverlo. Sígalo todo desde su cuenta.',
    ],
    faqTitle: 'Preguntas frecuentes',
    faq: [
      {
        q: '¿Qué es AnyDesk y es seguro?',
        a: 'AnyDesk es una herramienta de acceso remoto que permite a nuestro equipo ver la pantalla de su consola para ayudarle más rápido. La conexión solo se inicia cuando usted la acepta en su máquina, y puede finalizarla en cualquier momento. Gratis en anydesk.com.',
      },
      {
        q: '¿Dónde encuentro mi número AnyDesk?',
        a: 'Abra AnyDesk en el ordenador de la consola. Su dirección de 9 cifras aparece bajo « Este escritorio » — cópiela en el formulario.',
      },
      {
        q: '¿En cuánto tiempo responden?',
        a: 'Respondemos en un día hábil, normalmente mucho antes. Conserve la referencia de su ticket para cualquier seguimiento.',
      },
      {
        q: '¿Puedo seguir mi ticket?',
        a: 'Sí. Con una cuenta Rutherford, cada ticket y su estado aparecen en Mi cuenta → Soporte, y le enviamos un correo cada vez que cambia el estado.',
      },
    ],
    successTitle: 'Gracias por su solicitud.',
    successRefPre: 'Referencia de su ticket',
    successBody: 'Le hemos enviado una confirmación por correo. Nuestro equipo le responderá lo antes posible.',
    copyLabel: 'Copiar',
    copiedLabel: 'Copiado',
    trackCta: 'Seguir mi ticket',
    backHome: 'Volver a rutherford.fr',
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

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SupportUploadField({
  id,
  card,
  dropHint,
  photoAdded,
  replace,
  preview,
  onChange,
}: {
  id: SupportUploadId;
  card: PhotoCard;
  dropHint: string;
  photoAdded: string;
  replace: string;
  preview: string;
  onChange: (field: SupportUploadId, file: File | null) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const accept = (f: File | null | undefined) => {
    if (f && f.type.startsWith('image/')) onChange(id, f);
  };
  return (
    <div className="console-simple-upload-card">
      <div className="console-simple-upload-copy">
        <h3>{card.title}</h3>
        <p>{card.desc}</p>
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
          accept(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        <input
          className="cv-drop-input"
          type="file"
          accept="image/*"
          aria-label={card.title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            accept(e.target.files?.[0] ?? null);
            e.currentTarget.value = '';
          }}
        />
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="cv-drop-thumb" src={preview} alt="" />
            <b>{photoAdded}</b>
            <span className="cv-drop-replace">{replace}</span>
          </>
        ) : (
          <>
            <CameraIcon />
            {dropHint}
          </>
        )}
      </div>
    </div>
  );
}

export function SupportPage() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  const [files, setFiles] = useState<FileMap>(emptyFiles);
  const [previews, setPreviews] = useState<PreviewMap>(emptyPreviews);
  const [email, setEmail] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [company, setCompany] = useState('');
  const [anydesk, setAnydesk] = useState('');
  const [country, setCountry] = useState('');
  const [subject, setSubject] = useState('');
  const [problem, setProblem] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Prefill from the signed-in profile, then fall back to IP geo for the country.
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
          if (user?.email && active) {
            setEmail(user.email);
            setSignedIn(true);
          }
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('company, country')
              .eq('id', user.id)
              .maybeSingle();
            if (profile && active) {
              if (profile.company) setCompany((v) => v || (profile.company as string));
              const pc = mapCountry(profile.country as string | null);
              if (pc) {
                setCountry((v) => v || pc);
                countryResolved = true;
              }
            }
          }
        } catch {
          /* anonymous */
        }
      }
      if (!countryResolved && active) {
        try {
          const res = await fetch('/api/geo');
          if (res.ok) {
            const { country: geoCountry } = await res.json();
            const gc = mapCountry(geoCountry);
            if (gc && active) setCountry((v) => v || gc);
          }
        } catch {
          /* no geo */
        }
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
    if (!email.trim() || !subject.trim() || !problem.trim()) {
      setError(t.errFields);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const photos: { field: string; path: string }[] = [];
      const chosen = (Object.keys(files) as SupportUploadId[])
        .map((field) => ({ field, file: files[field] }))
        .filter((x) => x.file);
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
        body: JSON.stringify({
          email: email.trim(),
          company: company.trim(),
          anydesk: anydesk.trim(),
          country,
          subject: subject.trim(),
          description: problem.trim(),
          photos,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => null);
        throw new Error(b?.error ?? t.errGeneric);
      }
      const b = await res.json().catch(() => null);
      setReference(b?.reference ?? null);
      (window as any).gtag?.('event', 'support_request_submit', { event_category: 'support' });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errGeneric);
    } finally {
      setSending(false);
    }
  };

  const NextBlock = (
    <div className="cv-next">
      <div className="cv-next-h">{t.nextTitle}</div>
      <ol className="cv-next-list">
        {t.nextSteps.map((step, i) => (
          <li key={i}>
            <span className="cv-next-n">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <main className="page-shell console-simple-page">
      <SiteNav current="support" />

      <section className="section console-simple-section">
        <div className="container console-simple-shell">
          {submitted ? (
            <div className="cv-page">
              <div className="cv-wrap">
                <div className="cv-success">
                  <div className="cv-seal-wrap">
                    <span className="cv-seal-burst" />
                    <div className="cv-seal">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                        <path d="M4 12.5l5 5L20 6.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="cv-suc-eyebrow">{t.kicker}</div>
                  <h1 className="cv-suc-title">{t.successTitle}</h1>
                  <p className="cv-suc-p">{t.successBody}</p>
                  {reference ? (
                    <div className="cv-refbox">
                      <div className="cv-ref-k">{t.successRefPre}</div>
                      <div className="cv-ref-v">#{reference}</div>
                      <button
                        type="button"
                        className="cv-ref-copy"
                        onClick={() => {
                          navigator.clipboard?.writeText(`#${reference}`).then(
                            () => {
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1800);
                            },
                            () => {}
                          );
                        }}
                      >
                        {copied ? t.copiedLabel : t.copyLabel}
                      </button>
                    </div>
                  ) : null}
                  {NextBlock}
                  <div className="cv-suc-actions">
                    <a className="cv-btn-primary" href={signedIn ? '/account/support' : '/account/sign-in?next=/account/support'}>
                      {t.trackCta} →
                    </a>
                    <a className="cv-btn-ghost" href="/">
                      {t.backHome}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="console-simple-intro">
                <p className="section-kicker">{t.kicker}</p>
                <h1>{t.title}</h1>
                <p className="console-simple-tagline">{t.tagline}</p>
                <p className="console-simple-phone">{t.phoneLine}</p>
                <div className="console-simple-cta-row">
                  <a className="button button-accent" href="#support-form">
                    {t.ctaPrimary} ↓
                  </a>
                  <a className="button button-light" href="mailto:contact@rutherford.fr">
                    {t.ctaSecondary}
                  </a>
                </div>
                <div className="cv-reassure">
                  {t.reassure.map((item) => (
                    <span key={item} className="cv-rea">
                      <CheckIcon />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="cv-page" id="support-form">
                <div className="cv-wrap">
                  <form className="cv-stepcard" onSubmit={handleSubmit}>
                    <div className="cv-step-h">{t.formTitle}</div>

                    {authConfigured ? (
                      signedIn ? (
                        <div className="cv-login is-signed">
                          <span className="cv-login-ic">
                            <CheckIcon />
                          </span>
                          <span>
                            {t.signedInPrefix} <strong>{email}</strong>
                          </span>
                        </div>
                      ) : (
                        <a className="cv-login" href="/account/sign-in?next=/support">
                          <span className="cv-login-ic">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                              <path d="M5 19c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                            </svg>
                          </span>
                          <span>{t.loginPrompt}</span>
                          <span className="cv-login-arrow">→</span>
                        </a>
                      )
                    ) : null}

                    <div className="cv-grid2">
                      <label className="cv-field">
                        <span className="cv-label">
                          {t.emailLabel} <em>*</em>
                        </span>
                        <input
                          className="cv-input"
                          type="email"
                          placeholder={t.emailPh}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={sending || signedIn}
                        />
                      </label>
                      <label className="cv-field">
                        <span className="cv-label">{t.companyLabel}</span>
                        <input
                          className="cv-input"
                          type="text"
                          placeholder={t.companyPh}
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          disabled={sending}
                        />
                      </label>
                      <label className="cv-field">
                        <span className="cv-label">{t.anydeskLabel}</span>
                        <input
                          className="cv-input"
                          type="text"
                          inputMode="numeric"
                          placeholder={t.anydeskPh}
                          value={anydesk}
                          onChange={(e) => setAnydesk(e.target.value)}
                          disabled={sending}
                        />
                      </label>
                      <label className="cv-field">
                        <span className="cv-label">{t.countryLabel}</span>
                        <span className="cv-selwrap">
                          <select
                            className="cv-input cv-select"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            disabled={sending}
                          >
                            <option value="">{t.countryPlaceholder}</option>
                            {SUPPORT_COUNTRIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <Caret />
                        </span>
                      </label>
                      <label className="cv-field cv-field-full">
                        <span className="cv-label">
                          {t.subjectLabel} <em>*</em>
                        </span>
                        <input
                          className="cv-input"
                          type="text"
                          maxLength={200}
                          placeholder={t.subjectPh}
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          disabled={sending}
                        />
                      </label>
                    </div>

                    <div className="cv-hint">
                      <InfoIcon />
                      <span>
                        <b>{t.anydeskHelpTitle}</b> {t.anydeskHelp}
                      </span>
                    </div>

                    <label className="cv-field cv-field-full cv-notes">
                      <span className="cv-label">
                        {t.problemLabel} <em>*</em>
                      </span>
                      <textarea
                        className="cv-input"
                        rows={6}
                        placeholder={t.problemPh}
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        disabled={sending}
                      />
                    </label>

                    <div className="cv-step-p">{t.photosTitle}</div>
                    <div className="console-simple-uploads">
                      {(Object.keys(emptyFiles) as SupportUploadId[]).map((id, i) => (
                        <SupportUploadField
                          key={id}
                          id={id}
                          card={t.photoCards[i]}
                          dropHint={t.dropHint}
                          photoAdded={t.photoAdded}
                          replace={t.replace}
                          preview={previews[id]}
                          onChange={handleFileChange}
                        />
                      ))}
                    </div>

                    {error ? (
                      <p className="cv-error" role="alert">
                        {error}
                      </p>
                    ) : null}

                    <div className="cv-stepnav">
                      <span />
                      <button type="submit" className="cv-btn-primary" disabled={sending}>
                        {sending ? t.sending : `${t.submit} →`}
                      </button>
                    </div>
                    <div className="cv-stepnote">{t.submitHint}</div>
                  </form>
                </div>
              </div>

              {NextBlock}
            </>
          )}
        </div>
      </section>

      {!submitted ? (
        <section className="section console-faq-section" aria-label={t.faqTitle}>
          <div className="container console-faq-shell">
            <h2 className="console-faq-title">{t.faqTitle}</h2>
            <dl className="console-faq-list">
              {t.faq.map((item) => (
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
