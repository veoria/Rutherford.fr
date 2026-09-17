'use client';

import { useId, useState, type FormEvent } from 'react';
import { useLanguage, type Locale } from '@/components/language-provider';
import { trackConversion } from '@/lib/track';

// "The Pressroom Letter": monthly newsletter signup, synced to Pipedrive
// (marketing status "subscribed") for Pipedrive Campaigns. Explicit consent
// checkbox, honeypot field, no double opt-in on our side.

type Copy = {
  kicker: string;
  title: string;
  lead: string;
  placeholder: string;
  submit: string;
  sending: string;
  consent: string;
  privacy: string;
  success: string;
  errorEmail: string;
  errorConsent: string;
  errorGeneric: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'The Pressroom Letter',
    title: 'One email a month on offset color.',
    lead: 'A new article, one production figure, one video. No sales pitch.',
    placeholder: 'Your work email',
    submit: 'Subscribe',
    sending: 'Sending…',
    consent: 'I agree to receive the Rutherford.fr newsletter. Unsubscribe in one click from any email.',
    privacy: 'Privacy policy',
    success: 'You are subscribed. The next letter lands in your inbox at the start of the month.',
    errorEmail: 'Please enter a valid email address.',
    errorConsent: 'Please tick the consent box to subscribe.',
    errorGeneric: 'Something went wrong, please retry.',
  },
  fr: {
    kicker: 'The Pressroom Letter',
    title: 'Un e-mail par mois sur la couleur offset.',
    lead: 'Un nouvel article, un chiffre de production, une vidéo. Pas de discours commercial.',
    placeholder: 'Votre e-mail professionnel',
    submit: 'S’inscrire',
    sending: 'Envoi…',
    consent: 'J’accepte de recevoir la newsletter Rutherford.fr. Désinscription en un clic depuis chaque e-mail.',
    privacy: 'Politique de confidentialité',
    success: 'Inscription confirmée. La prochaine lettre arrive en début de mois.',
    errorEmail: 'Merci de saisir une adresse e-mail valide.',
    errorConsent: 'Merci de cocher la case de consentement.',
    errorGeneric: 'Une erreur est survenue, merci de réessayer.',
  },
  de: {
    kicker: 'The Pressroom Letter',
    title: 'Eine E-Mail im Monat zur Offsetfarbe.',
    lead: 'Ein neuer Artikel, eine Produktionskennzahl, ein Video. Keine Verkaufsrhetorik.',
    placeholder: 'Ihre geschäftliche E-Mail',
    submit: 'Abonnieren',
    sending: 'Wird gesendet…',
    consent: 'Ich möchte den Rutherford.fr Newsletter erhalten. Abmeldung mit einem Klick in jeder E-Mail.',
    privacy: 'Datenschutz',
    success: 'Sie sind angemeldet. Der nächste Letter kommt zum Monatsanfang.',
    errorEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    errorConsent: 'Bitte bestätigen Sie die Einwilligung.',
    errorGeneric: 'Ein Fehler ist aufgetreten, bitte erneut versuchen.',
  },
  it: {
    kicker: 'The Pressroom Letter',
    title: 'Una e-mail al mese sul colore offset.',
    lead: 'Un nuovo articolo, un dato di produzione, un video. Nessun discorso commerciale.',
    placeholder: 'La sua e-mail di lavoro',
    submit: 'Iscriviti',
    sending: 'Invio…',
    consent: 'Accetto di ricevere la newsletter Rutherford.fr. Disiscrizione con un clic da ogni e-mail.',
    privacy: 'Informativa privacy',
    success: 'Iscrizione confermata. La prossima lettera arriva a inizio mese.',
    errorEmail: 'Inserisca un indirizzo e-mail valido.',
    errorConsent: 'Selezioni la casella del consenso.',
    errorGeneric: 'Si è verificato un errore, riprovi.',
  },
  es: {
    kicker: 'The Pressroom Letter',
    title: 'Un e-mail al mes sobre el color offset.',
    lead: 'Un artículo nuevo, una cifra de producción, un vídeo. Sin discurso comercial.',
    placeholder: 'Su e-mail profesional',
    submit: 'Suscribirse',
    sending: 'Enviando…',
    consent: 'Acepto recibir la newsletter de Rutherford.fr. Baja con un clic desde cada e-mail.',
    privacy: 'Política de privacidad',
    success: 'Suscripción confirmada. La próxima carta llega a principios de mes.',
    errorEmail: 'Introduzca una dirección de e-mail válida.',
    errorConsent: 'Marque la casilla de consentimiento.',
    errorGeneric: 'Se ha producido un error, inténtelo de nuevo.',
  },
  pt: {
    kicker: 'The Pressroom Letter',
    title: 'Um e-mail por mês sobre cor offset.',
    lead: 'Um novo artigo, um número de produção, um vídeo. Sem discurso comercial.',
    placeholder: 'O seu e-mail profissional',
    submit: 'Subscrever',
    sending: 'A enviar…',
    consent: 'Aceito receber a newsletter Rutherford.fr. Cancelamento com um clique em cada e-mail.',
    privacy: 'Política de privacidade',
    success: 'Subscrição confirmada. A próxima carta chega no início do mês.',
    errorEmail: 'Introduza um endereço de e-mail válido.',
    errorConsent: 'Assinale a caixa de consentimento.',
    errorGeneric: 'Ocorreu um erro, tente novamente.',
  },
};

export function NewsletterSignup({ variant = 'inline', source }: { variant?: 'footer' | 'inline'; source: string }) {
  const { locale } = useLanguage();
  const t = COPY[locale] ?? COPY.en;
  const uid = useId();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError(t.errorEmail);
    if (!consent) return setError(t.errorConsent);
    setStatus('sending');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), consent, locale, source, website }),
      });
      if (!res.ok) throw new Error('request failed');
      trackConversion('newsletter_signup', { source, locale });
      setStatus('sent');
    } catch {
      setStatus('idle');
      setError(t.errorGeneric);
    }
  };

  return (
    <section className={`newsletter-signup newsletter-signup-${variant}`} aria-labelledby={`${uid}-title`}>
      <div className="newsletter-signup-copy">
        <p className="newsletter-signup-kicker">{t.kicker}</p>
        <h2 id={`${uid}-title`} className="newsletter-signup-title">
          {t.title}
        </h2>
        <p className="newsletter-signup-lead">{t.lead}</p>
      </div>

      {status === 'sent' ? (
        <p className="newsletter-signup-success" role="status">
          {t.success}
        </p>
      ) : (
        <form className="newsletter-signup-form" onSubmit={handleSubmit} noValidate>
          <div className="newsletter-signup-row">
            <label className="sr-only" htmlFor={`${uid}-email`}>
              {t.placeholder}
            </label>
            <input
              id={`${uid}-email`}
              className="newsletter-signup-input"
              type="email"
              autoComplete="email"
              placeholder={t.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'sending'}
              required
            />
            <button type="submit" className="newsletter-signup-button" disabled={status === 'sending'}>
              {status === 'sending' ? t.sending : t.submit}
            </button>
          </div>
          <label className="newsletter-signup-consent" htmlFor={`${uid}-consent`}>
            <input
              id={`${uid}-consent`}
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={status === 'sending'}
            />
            <span>
              {t.consent} <a href="/confidentialite">{t.privacy}</a>
            </span>
          </label>
          <input
            className="footer-honeypot"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          {error ? (
            <p className="newsletter-signup-error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
