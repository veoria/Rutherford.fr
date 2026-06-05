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
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
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
