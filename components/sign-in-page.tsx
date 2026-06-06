'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type SignInCopy = {
  title: string;
  subtitle: string;
  google: string;
  apple: string;
  or: string;
  emailLabel: string;
  emailPlaceholder: string;
  sending: string;
  sendLink: string;
  inboxBefore: string;
  inboxFallback: string;
  inboxAfter: string;
  fine: string;
};

const COPY: Record<Locale, SignInCopy> = {
  en: {
    title: 'Sign in or create an account',
    subtitle:
      'Sign in to track your progress, access your enrolled masterclasses, and manage your Academy Pass subscription.',
    google: 'Continue with Google',
    apple: 'Continue with Apple',
    or: 'or',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@company.com',
    sending: 'Sending…',
    sendLink: 'Send magic link',
    inboxBefore: 'Check your inbox at ',
    inboxFallback: 'your address',
    inboxAfter: '. The sign-in link expires in 1 hour.',
    fine: 'By continuing you agree to our terms. We use your email only to sign you in and to send course-related notifications.',
  },
  fr: {
    title: 'Connectez-vous ou créez un compte',
    subtitle:
      'Connectez-vous pour suivre votre progression, accéder à vos masterclasses et gérer votre abonnement Academy Pass.',
    google: 'Continuer avec Google',
    apple: 'Continuer avec Apple',
    or: 'ou',
    emailLabel: 'Adresse e-mail',
    emailPlaceholder: 'vous@entreprise.com',
    sending: 'Envoi…',
    sendLink: 'Envoyer le lien de connexion',
    inboxBefore: 'Vérifiez votre boîte de réception à l’adresse ',
    inboxFallback: 'indiquée',
    inboxAfter: '. Le lien de connexion expire dans 1 heure.',
    fine: 'En continuant, vous acceptez nos conditions. Nous utilisons votre e-mail uniquement pour vous connecter et vous envoyer des notifications liées aux cours.',
  },
  de: {
    title: 'Anmelden oder Konto erstellen',
    subtitle:
      'Melden Sie sich an, um Ihren Fortschritt zu verfolgen, auf Ihre gebuchten Masterclasses zuzugreifen und Ihr Academy-Pass-Abonnement zu verwalten.',
    google: 'Weiter mit Google',
    apple: 'Weiter mit Apple',
    or: 'oder',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'name@unternehmen.com',
    sending: 'Wird gesendet…',
    sendLink: 'Anmeldelink senden',
    inboxBefore: 'Prüfen Sie Ihren Posteingang unter ',
    inboxFallback: 'Ihrer Adresse',
    inboxAfter: '. Der Anmeldelink ist 1 Stunde lang gültig.',
    fine: 'Mit der Fortsetzung akzeptieren Sie unsere Bedingungen. Wir verwenden Ihre E-Mail-Adresse ausschließlich, um Sie anzumelden und Ihnen kursbezogene Benachrichtigungen zu senden.',
  },
  it: {
    title: 'Accedi o crea un account',
    subtitle:
      'Acceda per seguire i suoi progressi, consultare le sue masterclass e gestire il suo abbonamento Academy Pass.',
    google: 'Continua con Google',
    apple: 'Continua con Apple',
    or: 'oppure',
    emailLabel: 'Indirizzo e-mail',
    emailPlaceholder: 'nome@azienda.com',
    sending: 'Invio…',
    sendLink: 'Invia il link di accesso',
    inboxBefore: 'Controlli la sua casella di posta all’indirizzo ',
    inboxFallback: 'indicato',
    inboxAfter: '. Il link di accesso scade tra 1 ora.',
    fine: 'Continuando, accetta le nostre condizioni. Utilizziamo la sua e-mail esclusivamente per l’accesso e per inviarle notifiche relative ai corsi.',
  },
  es: {
    title: 'Inicie sesión o cree una cuenta',
    subtitle:
      'Inicie sesión para seguir su progreso, acceder a sus masterclasses y gestionar su suscripción Academy Pass.',
    google: 'Continuar con Google',
    apple: 'Continuar con Apple',
    or: 'o',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'nombre@empresa.com',
    sending: 'Enviando…',
    sendLink: 'Enviar enlace de acceso',
    inboxBefore: 'Revise su bandeja de entrada en ',
    inboxFallback: 'su correo electrónico',
    inboxAfter: '. El enlace de acceso caduca en 1 hora.',
    fine: 'Al continuar, acepta nuestras condiciones. Utilizamos su correo únicamente para iniciar su sesión y enviarle notificaciones relacionadas con los cursos.',
  },
};

export function SignInPage() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const search = useSearchParams();
  const next = search.get('next') ?? '/account';
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reflect redirect-back state: "magic link sent" after the email link, or an
  // error surfaced by the auth callback (?error=…) when code exchange fails.
  useEffect(() => {
    if (search.get('check_email') === '1') setStatus('sent');
    const callbackError = search.get('error');
    if (callbackError) {
      setStatus('error');
      setErrorMsg(callbackError);
    }
  }, [search]);

  const handleGoogle = async () => {
    setStatus('sending');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    }
  };

  const handleApple = async () => {
    setStatus('sending');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    }
  };

  const handleMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setStatus('sending');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const emailRedirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo, shouldCreateUser: true },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  };

  return (
    <main className="page-shell" id="top">
      <SiteNav />

      <section className="signin-section section">
        <div className="container signin-shell">
          <header className="signin-head">
            <p className="section-kicker">Rutherford Academy</p>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </header>

          <div className="signin-card">
            <button
              type="button"
              className="signin-provider signin-provider-google"
              onClick={handleGoogle}
              disabled={status === 'sending'}
            >
              <svg width="20" height="20" viewBox="10 10 20 20" aria-hidden="true">
                <path
                  d="M29.6 20.2273C29.6 19.5182 29.5364 18.8364 29.4182 18.1818H20V22.05H25.3818C25.15 23.3 24.4455 24.3591 23.3864 25.0682V27.5773H26.6182C28.5091 25.8364 29.6 23.2727 29.6 20.2273Z"
                  fill="#4285F4"
                />
                <path
                  d="M20 30C22.7 30 24.9636 29.1045 26.6181 27.5773L23.3863 25.0682C22.4909 25.6682 21.3454 26.0227 20 26.0227C17.3954 26.0227 15.1909 24.2636 14.4045 21.9H11.0636V24.4909C12.7091 27.7591 16.0909 30 20 30Z"
                  fill="#34A853"
                />
                <path
                  d="M14.4045 21.9C14.2045 21.3 14.0909 20.6591 14.0909 20C14.0909 19.3409 14.2045 18.7 14.4045 18.1V15.5091H11.0636C10.3864 16.8591 10 18.3864 10 20C10 21.6136 10.3864 23.1409 11.0636 24.4909L14.4045 21.9Z"
                  fill="#FBBC04"
                />
                <path
                  d="M20 13.9773C21.4681 13.9773 22.7863 14.4818 23.8227 15.4727L26.6909 12.6045C24.9591 10.9909 22.6954 10 20 10C16.0909 10 12.7091 12.2409 11.0636 15.5091L14.4045 18.1C15.1909 15.7364 17.3954 13.9773 20 13.9773Z"
                  fill="#E94235"
                />
              </svg>
              {t.google}
            </button>

            <button
              type="button"
              className="signin-provider signin-provider-apple"
              onClick={handleApple}
              disabled={status === 'sending'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.46 1.58-1.5 3.14-.92 1.36-1.88 2.71-3.39 2.74-1.49.03-1.95-.88-3.66-.88-1.71 0-2.22.85-3.63.91-1.45.06-2.55-1.47-3.48-2.83-1.87-2.71-3.32-7.68-1.38-11.05.97-1.66 2.7-2.71 4.57-2.74 1.43-.03 2.78.96 3.66.96.88 0 2.53-1.18 4.27-1.01.73.03 2.77.29 4.08 2.21-.11.07-2.44 1.42-2.41 4.24.03 3.37 2.96 4.49 2.99 4.5z" />
              </svg>
              {t.apple}
            </button>

            <div className="signin-divider">
              <span>{t.or}</span>
            </div>

            <form className="signin-form" onSubmit={handleMagicLink}>
              <label htmlFor="signin-email" className="signin-label">
                {t.emailLabel}
              </label>
              <input
                id="signin-email"
                type="email"
                className="signin-input"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'sending'}
              />
              <button
                type="submit"
                className="button button-accent signin-submit"
                disabled={status === 'sending' || !email}
              >
                {status === 'sending' ? t.sending : t.sendLink}
              </button>
            </form>

            {status === 'sent' ? (
              <p className="signin-message signin-message-success">
                {t.inboxBefore}
                <strong>{email || t.inboxFallback}</strong>
                {t.inboxAfter}
              </p>
            ) : null}
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
