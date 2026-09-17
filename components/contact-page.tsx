'use client';

import { useState, type FormEvent } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { readAttribution } from '@/lib/attribution';
import { COUNTRY_NAMES } from '@/lib/countries';
import { trackConversion } from '@/lib/track';

type Topic = 'retrofit' | 'colorloop' | 'quote' | 'partnership' | 'press' | 'other';
const TOPICS: Topic[] = ['retrofit', 'colorloop', 'quote', 'partnership', 'press', 'other'];

type Copy = {
  kicker: string;
  title: string;
  lead: string;
  consoleHint: string;
  consoleLink: string;
  formTitle: string;
  name: string;
  email: string;
  company: string;
  country: string;
  countryPlaceholder: string;
  topic: string;
  topics: Record<Topic, string>;
  message: string;
  messagePh: string;
  wantsCall: string;
  phone: string;
  phonePh: string;
  submit: string;
  sending: string;
  privacy: string;
  successTitle: string;
  successBody: string;
  backHome: string;
  errors: { email: string; message: string; phone: string; generic: string };
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'Contact',
    title: 'Talk to a color expert',
    lead: 'A question about closed-loop color, a press retrofit or ColorLoop? Write to us, a Rutherford expert answers within one business day.',
    consoleHint: 'Want to know if your press qualifies?',
    consoleLink: 'Run the free console validation',
    formTitle: 'Your message',
    name: 'Name',
    email: 'Work email',
    company: 'Company',
    country: 'Country',
    countryPlaceholder: 'Select a country',
    topic: 'Topic',
    topics: {
      retrofit: 'Press retrofit',
      colorloop: 'ColorLoop software',
      quote: 'Quote or pricing',
      partnership: 'Reseller or partnership',
      press: 'Press and media',
      other: 'Other',
    },
    message: 'Message',
    messagePh: 'Your press, your production and what you would like to improve.',
    wantsCall: 'I would like to be called back',
    phone: 'Phone',
    phonePh: '+33 6 00 00 00 00',
    submit: 'Send message',
    sending: 'Sending…',
    privacy: 'Your details are only used to answer your request.',
    successTitle: 'Message sent',
    successBody: 'Thank you. A Rutherford expert will answer within one business day.',
    backHome: 'Back to home',
    errors: {
      email: 'Please enter a valid email address.',
      message: 'Please write a short message (10 characters minimum).',
      phone: 'Please add a phone number so we can call you back.',
      generic: 'Something went wrong, please retry.',
    },
  },
  fr: {
    kicker: 'Contact',
    title: 'Parlez à un expert couleur',
    lead: 'Une question sur le closed-loop, un rétrofit de presse ou ColorLoop ? Écrivez-nous, un expert Rutherford répond sous un jour ouvré.',
    consoleHint: 'Vous voulez savoir si votre presse est éligible ?',
    consoleLink: 'Lancer la validation console gratuite',
    formTitle: 'Votre message',
    name: 'Nom',
    email: 'E-mail professionnel',
    company: 'Société',
    country: 'Pays',
    countryPlaceholder: 'Choisir un pays',
    topic: 'Sujet',
    topics: {
      retrofit: 'Rétrofit de presse',
      colorloop: 'Logiciel ColorLoop',
      quote: 'Devis ou tarifs',
      partnership: 'Revendeur ou partenariat',
      press: 'Presse et médias',
      other: 'Autre',
    },
    message: 'Message',
    messagePh: 'Votre presse, votre production et ce que vous souhaitez améliorer.',
    wantsCall: 'Je souhaite être rappelé',
    phone: 'Téléphone',
    phonePh: '+33 6 00 00 00 00',
    submit: 'Envoyer le message',
    sending: 'Envoi…',
    privacy: 'Vos coordonnées servent uniquement à répondre à votre demande.',
    successTitle: 'Message envoyé',
    successBody: 'Merci. Un expert Rutherford vous répond sous un jour ouvré.',
    backHome: 'Retour à l’accueil',
    errors: {
      email: 'Merci de saisir une adresse e-mail valide.',
      message: 'Merci d’écrire un court message (10 caractères minimum).',
      phone: 'Merci d’indiquer un numéro de téléphone pour être rappelé.',
      generic: 'Une erreur est survenue, merci de réessayer.',
    },
  },
  de: {
    kicker: 'Kontakt',
    title: 'Sprechen Sie mit einem Farbexperten',
    lead: 'Eine Frage zu Closed-Loop-Farbe, zur Nachrüstung einer Druckmaschine oder zu ColorLoop? Schreiben Sie uns, ein Rutherford Experte antwortet innerhalb eines Werktags.',
    consoleHint: 'Möchten Sie wissen, ob Ihre Druckmaschine geeignet ist?',
    consoleLink: 'Kostenlose Konsolenvalidierung starten',
    formTitle: 'Ihre Nachricht',
    name: 'Name',
    email: 'Geschäftliche E-Mail',
    company: 'Unternehmen',
    country: 'Land',
    countryPlaceholder: 'Land auswählen',
    topic: 'Thema',
    topics: {
      retrofit: 'Nachrüstung der Druckmaschine',
      colorloop: 'ColorLoop Software',
      quote: 'Angebot oder Preise',
      partnership: 'Händler oder Partnerschaft',
      press: 'Presse und Medien',
      other: 'Sonstiges',
    },
    message: 'Nachricht',
    messagePh: 'Ihre Druckmaschine, Ihre Produktion und was Sie verbessern möchten.',
    wantsCall: 'Ich möchte zurückgerufen werden',
    phone: 'Telefon',
    phonePh: '+49 170 0000000',
    submit: 'Nachricht senden',
    sending: 'Wird gesendet…',
    privacy: 'Ihre Angaben werden nur zur Beantwortung Ihrer Anfrage verwendet.',
    successTitle: 'Nachricht gesendet',
    successBody: 'Vielen Dank. Ein Rutherford Experte antwortet innerhalb eines Werktags.',
    backHome: 'Zurück zur Startseite',
    errors: {
      email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      message: 'Bitte schreiben Sie eine kurze Nachricht (mindestens 10 Zeichen).',
      phone: 'Bitte geben Sie eine Telefonnummer für den Rückruf an.',
      generic: 'Ein Fehler ist aufgetreten, bitte erneut versuchen.',
    },
  },
  it: {
    kicker: 'Contatti',
    title: 'Parli con un esperto del colore',
    lead: 'Una domanda sul closed-loop, sul retrofit di una macchina o su ColorLoop? Ci scriva, un esperto Rutherford risponde entro un giorno lavorativo.',
    consoleHint: 'Vuole sapere se la sua macchina è idonea?',
    consoleLink: 'Avvii la validazione console gratuita',
    formTitle: 'Il suo messaggio',
    name: 'Nome',
    email: 'E-mail di lavoro',
    company: 'Azienda',
    country: 'Paese',
    countryPlaceholder: 'Selezioni un paese',
    topic: 'Argomento',
    topics: {
      retrofit: 'Retrofit della macchina',
      colorloop: 'Software ColorLoop',
      quote: 'Preventivo o prezzi',
      partnership: 'Rivenditore o partnership',
      press: 'Stampa e media',
      other: 'Altro',
    },
    message: 'Messaggio',
    messagePh: 'La sua macchina, la sua produzione e cosa desidera migliorare.',
    wantsCall: 'Desidero essere richiamato',
    phone: 'Telefono',
    phonePh: '+39 333 000 0000',
    submit: 'Invia il messaggio',
    sending: 'Invio…',
    privacy: 'I suoi dati servono solo a rispondere alla sua richiesta.',
    successTitle: 'Messaggio inviato',
    successBody: 'Grazie. Un esperto Rutherford risponde entro un giorno lavorativo.',
    backHome: 'Torna alla home',
    errors: {
      email: 'Inserisca un indirizzo e-mail valido.',
      message: 'Scriva un breve messaggio (almeno 10 caratteri).',
      phone: 'Indichi un numero di telefono per essere richiamato.',
      generic: 'Si è verificato un errore, riprovi.',
    },
  },
  es: {
    kicker: 'Contacto',
    title: 'Hable con un experto en color',
    lead: '¿Una pregunta sobre closed-loop, el retrofit de una prensa o ColorLoop? Escríbanos, un experto de Rutherford responde en un día laborable.',
    consoleHint: '¿Quiere saber si su prensa es apta?',
    consoleLink: 'Iniciar la validación de consola gratuita',
    formTitle: 'Su mensaje',
    name: 'Nombre',
    email: 'E-mail profesional',
    company: 'Empresa',
    country: 'País',
    countryPlaceholder: 'Seleccione un país',
    topic: 'Asunto',
    topics: {
      retrofit: 'Retrofit de prensa',
      colorloop: 'Software ColorLoop',
      quote: 'Presupuesto o precios',
      partnership: 'Distribuidor o colaboración',
      press: 'Prensa y medios',
      other: 'Otro',
    },
    message: 'Mensaje',
    messagePh: 'Su prensa, su producción y lo que desea mejorar.',
    wantsCall: 'Deseo que me llamen',
    phone: 'Teléfono',
    phonePh: '+34 600 000 000',
    submit: 'Enviar mensaje',
    sending: 'Enviando…',
    privacy: 'Sus datos solo se utilizan para responder a su solicitud.',
    successTitle: 'Mensaje enviado',
    successBody: 'Gracias. Un experto de Rutherford responderá en un día laborable.',
    backHome: 'Volver al inicio',
    errors: {
      email: 'Introduzca una dirección de e-mail válida.',
      message: 'Escriba un mensaje breve (10 caracteres como mínimo).',
      phone: 'Indique un número de teléfono para que le llamemos.',
      generic: 'Se ha producido un error, inténtelo de nuevo.',
    },
  },
  pt: {
    kicker: 'Contacto',
    title: 'Fale com um especialista em cor',
    lead: 'Uma questão sobre closed-loop, o retrofit de uma máquina ou o ColorLoop? Escreva-nos, um especialista Rutherford responde num dia útil.',
    consoleHint: 'Quer saber se a sua máquina é elegível?',
    consoleLink: 'Iniciar a validação de consola gratuita',
    formTitle: 'A sua mensagem',
    name: 'Nome',
    email: 'E-mail profissional',
    company: 'Empresa',
    country: 'País',
    countryPlaceholder: 'Selecione um país',
    topic: 'Assunto',
    topics: {
      retrofit: 'Retrofit de máquina',
      colorloop: 'Software ColorLoop',
      quote: 'Orçamento ou preços',
      partnership: 'Revendedor ou parceria',
      press: 'Imprensa e media',
      other: 'Outro',
    },
    message: 'Mensagem',
    messagePh: 'A sua máquina, a sua produção e o que pretende melhorar.',
    wantsCall: 'Pretendo ser contactado por telefone',
    phone: 'Telefone',
    phonePh: '+351 910 000 000',
    submit: 'Enviar mensagem',
    sending: 'A enviar…',
    privacy: 'Os seus dados servem apenas para responder ao seu pedido.',
    successTitle: 'Mensagem enviada',
    successBody: 'Obrigado. Um especialista Rutherford responde num dia útil.',
    backHome: 'Voltar ao início',
    errors: {
      email: 'Introduza um endereço de e-mail válido.',
      message: 'Escreva uma mensagem curta (mínimo 10 caracteres).',
      phone: 'Indique um número de telefone para ser contactado.',
      generic: 'Ocorreu um erro, tente novamente.',
    },
  },
};

export function ContactPage() {
  const { locale } = useLanguage();
  const t = COPY[locale] ?? COPY.en;
  const lhref = (path: string) => (locale === 'en' ? path : `/${locale}${path}`);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('');
  const [topic, setTopic] = useState<Topic>('retrofit');
  const [message, setMessage] = useState('');
  const [wantsCall, setWantsCall] = useState(false);
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError(t.errors.email);
    if (message.trim().length < 10) return setError(t.errors.message);
    if (wantsCall && !phone.trim()) return setError(t.errors.phone);

    setSending(true);
    try {
      const attribution = readAttribution();
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email.trim(),
          company,
          country,
          topic,
          message,
          wantsCall,
          phone: wantsCall ? phone : '',
          locale,
          source: attribution?.source ?? attribution?.referrer ?? attribution?.landing ?? '',
          website,
        }),
      });
      if (!res.ok) throw new Error('request failed');
      trackConversion('contact_submit', { topic, country });
      setSent(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError(t.errors.generic);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="page-shell console-simple-page">
      <SiteNav />

      <section className="section console-simple-section">
        <div className="container console-simple-shell">
          {sent ? (
            <div className="cv-page">
              <div className="cv-wrap">
                <div className="cv-success">
                  <div className="cv-seal-wrap">
                    <span className="cv-seal-burst" />
                    <div className="cv-seal">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 12.5l5 5L20 6.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="cv-suc-eyebrow">{t.kicker}</div>
                  <h1 className="cv-suc-title">{t.successTitle}</h1>
                  <p className="cv-suc-p">{t.successBody}</p>
                  <div className="cv-suc-actions">
                    <a className="cv-btn-ghost" href={lhref('/')}>
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
                <p className="console-simple-tagline">{t.lead}</p>
                <p className="contact-console-hint">
                  {t.consoleHint} <a href={lhref('/console-validation')}>{t.consoleLink} →</a>
                </p>
              </div>

              <div className="cv-page cv-stage-form">
                <div className="cv-wrap">
                  <form className="cv-stepcard contact-form" onSubmit={handleSubmit} noValidate>
                    <div className="cv-step-h">{t.formTitle}</div>
                    <div className="cv-grid2">
                      <label className="cv-field" htmlFor="contact-name">
                        <span className="cv-label">{t.name}</span>
                        <input id="contact-name" className="cv-input" type="text" autoComplete="name" maxLength={120} value={name} onChange={(e) => setName(e.target.value)} disabled={sending} />
                      </label>
                      <label className="cv-field" htmlFor="contact-email">
                        <span className="cv-label">
                          {t.email} <em>*</em>
                        </span>
                        <input id="contact-email" className="cv-input" type="email" autoComplete="email" maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} disabled={sending} required />
                      </label>
                      <label className="cv-field" htmlFor="contact-company">
                        <span className="cv-label">{t.company}</span>
                        <input id="contact-company" className="cv-input" type="text" autoComplete="organization" maxLength={200} value={company} onChange={(e) => setCompany(e.target.value)} disabled={sending} />
                      </label>
                      <label className="cv-field" htmlFor="contact-country">
                        <span className="cv-label">{t.country}</span>
                        <span className="cv-selwrap">
                          <select id="contact-country" className="cv-input cv-select" value={country} onChange={(e) => setCountry(e.target.value)} disabled={sending}>
                            <option value="">{t.countryPlaceholder}</option>
                            {COUNTRY_NAMES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </span>
                      </label>
                      <label className="cv-field cv-field-full" htmlFor="contact-topic">
                        <span className="cv-label">{t.topic}</span>
                        <span className="cv-selwrap">
                          <select id="contact-topic" className="cv-input cv-select" value={topic} onChange={(e) => setTopic(e.target.value as Topic)} disabled={sending}>
                            {TOPICS.map((key) => (
                              <option key={key} value={key}>
                                {t.topics[key]}
                              </option>
                            ))}
                          </select>
                        </span>
                      </label>
                    </div>

                    <label className="cv-field cv-field-full cv-notes" htmlFor="contact-message">
                      <span className="cv-label">
                        {t.message} <em>*</em>
                      </span>
                      <textarea id="contact-message" className="cv-input" rows={6} maxLength={5000} placeholder={t.messagePh} value={message} onChange={(e) => setMessage(e.target.value)} disabled={sending} required />
                    </label>

                    <label className="contact-call" htmlFor="contact-wants-call">
                      <input id="contact-wants-call" type="checkbox" checked={wantsCall} onChange={(e) => setWantsCall(e.target.checked)} disabled={sending} />
                      <span>{t.wantsCall}</span>
                    </label>

                    {wantsCall ? (
                      <label className="cv-field contact-phone" htmlFor="contact-phone">
                        <span className="cv-label">
                          {t.phone} <em>*</em>
                        </span>
                        <input id="contact-phone" className="cv-input" type="tel" autoComplete="tel" maxLength={40} placeholder={t.phonePh} value={phone} onChange={(e) => setPhone(e.target.value)} disabled={sending} />
                      </label>
                    ) : null}

                    <input className="footer-honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} />

                    {error ? (
                      <p className="cv-error" role="alert">
                        {error}
                      </p>
                    ) : null}

                    <div className="cv-stepnav">
                      <span className="contact-privacy">
                        {t.privacy} <a href="/confidentialite">↗</a>
                      </span>
                      <button type="submit" className="cv-btn-primary" disabled={sending}>
                        {sending ? t.sending : `${t.submit} →`}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
