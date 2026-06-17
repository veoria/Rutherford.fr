'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { AuthSteps } from '@/components/auth-steps';
import { type Locale, useLanguage } from '@/components/language-provider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// Front-end demo mode: sign-in buttons drop straight into the sample
// dashboard so collaborators can walk the UI without real auth.
const DEMO_AUTH = false;
const DEMO_DASHBOARD = '/account/demo';

const MIN_PASSWORD = 8;

type SignInCopy = {
  title: string;
  subtitle: string;
  google: string;
  apple: string;
  or: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  signIn: string;
  createAccount: string;
  working: string;
  forgot: string;
  toSignup: string;
  toSignin: string;
  magicInstead: string;
  needEmail: string;
  resetSent: string;
  confirmSent: string;
  inboxBefore: string;
  inboxFallback: string;
  inboxAfter: string;
  tfaPrompt: string;
  codeLabel: string;
  codePlaceholder: string;
  verify: string;
  errGeneric: string;
  fine: string;
  // Mode-aware heading + create-account helpers + "check your email" panels.
  titleSignup: string;
  subtitleSignup: string;
  pwHint: string;
  confirmTitle: string;
  confirmBefore: string;
  confirmAfter: string;
  linkTitle: string;
  resetTitle: string;
  back: string;
};

const COPY: Record<Locale, SignInCopy> = {
  en: {
    title: 'Sign in to your account',
    subtitle:
      'Sign in to track your progress, access your enrolled masterclasses, and manage your Academy Pass subscription.',
    google: 'Continue with Google',
    apple: 'Continue with Apple',
    or: 'or',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@company.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Your password',
    signIn: 'Sign in',
    createAccount: 'Create account',
    working: 'Please wait…',
    forgot: 'Forgot password?',
    toSignup: 'New here? Create an account',
    toSignin: 'Already have an account? Sign in',
    magicInstead: 'Email me a sign-in link instead',
    needEmail: 'Enter your email address first.',
    resetSent: 'Check your inbox for a link to reset your password.',
    confirmSent: 'Almost there — check your inbox to confirm your email, then sign in.',
    inboxBefore: 'Check your inbox at ',
    inboxFallback: 'your address',
    inboxAfter: '. The sign-in link expires in 1 hour.',
    tfaPrompt: 'Enter the 6-digit code from your authenticator app.',
    codeLabel: '6-digit code',
    codePlaceholder: '123456',
    verify: 'Verify',
    errGeneric: 'Something went wrong. Please try again.',
    fine: 'By continuing you agree to our terms. We use your email only to sign you in and to send course-related notifications.',
    titleSignup: 'Create your account',
    subtitleSignup: 'A free account to follow your console validations, courses and support — all in one place.',
    pwHint: 'At least 8 characters.',
    confirmTitle: 'Check your email',
    confirmBefore: 'We sent a confirmation link to ',
    confirmAfter: '. Click it to activate your account — then we’ll help you complete your profile.',
    linkTitle: 'Sign-in link sent',
    resetTitle: 'Reset link sent',
    back: '← Back',
  },
  fr: {
    title: 'Connectez-vous à votre compte',
    subtitle:
      'Connectez-vous pour suivre votre progression, accéder à vos masterclasses et gérer votre abonnement Academy Pass.',
    google: 'Continuer avec Google',
    apple: 'Continuer avec Apple',
    or: 'ou',
    emailLabel: 'Adresse e-mail',
    emailPlaceholder: 'vous@entreprise.com',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'Votre mot de passe',
    signIn: 'Se connecter',
    createAccount: 'Créer un compte',
    working: 'Veuillez patienter…',
    forgot: 'Mot de passe oublié ?',
    toSignup: 'Nouveau ? Créez un compte',
    toSignin: 'Vous avez déjà un compte ? Connectez-vous',
    magicInstead: 'Recevoir plutôt un lien de connexion par e-mail',
    needEmail: 'Saisissez d’abord votre adresse e-mail.',
    resetSent: 'Vérifiez votre boîte de réception : un lien pour réinitialiser votre mot de passe vous a été envoyé.',
    confirmSent: 'Presque terminé — vérifiez votre boîte de réception pour confirmer votre e-mail, puis connectez-vous.',
    inboxBefore: 'Vérifiez votre boîte de réception à l’adresse ',
    inboxFallback: 'indiquée',
    inboxAfter: '. Le lien de connexion expire dans 1 heure.',
    tfaPrompt: 'Saisissez le code à 6 chiffres de votre application d’authentification.',
    codeLabel: 'Code à 6 chiffres',
    codePlaceholder: '123456',
    verify: 'Vérifier',
    errGeneric: 'Une erreur est survenue. Veuillez réessayer.',
    fine: 'En continuant, vous acceptez nos conditions. Nous utilisons votre e-mail uniquement pour vous connecter et vous envoyer des notifications liées aux cours.',
    titleSignup: 'Créez votre compte',
    subtitleSignup: 'Un compte gratuit pour suivre vos validations console, vos formations et votre support au même endroit.',
    pwHint: 'Au moins 8 caractères.',
    confirmTitle: 'Vérifiez vos e-mails',
    confirmBefore: 'Nous avons envoyé un lien de confirmation à ',
    confirmAfter: '. Cliquez dessus pour activer votre compte — nous vous aiderons ensuite à compléter votre profil.',
    linkTitle: 'Lien de connexion envoyé',
    resetTitle: 'Lien de réinitialisation envoyé',
    back: '← Retour',
  },
  de: {
    title: 'Bei Ihrem Konto anmelden',
    subtitle:
      'Melden Sie sich an, um Ihren Fortschritt zu verfolgen, auf Ihre gebuchten Masterclasses zuzugreifen und Ihr Academy-Pass-Abonnement zu verwalten.',
    google: 'Weiter mit Google',
    apple: 'Weiter mit Apple',
    or: 'oder',
    emailLabel: 'E-Mail-Adresse',
    emailPlaceholder: 'name@unternehmen.com',
    passwordLabel: 'Passwort',
    passwordPlaceholder: 'Ihr Passwort',
    signIn: 'Anmelden',
    createAccount: 'Konto erstellen',
    working: 'Bitte warten…',
    forgot: 'Passwort vergessen?',
    toSignup: 'Neu hier? Konto erstellen',
    toSignin: 'Sie haben bereits ein Konto? Anmelden',
    magicInstead: 'Stattdessen Anmeldelink per E-Mail senden',
    needEmail: 'Geben Sie zuerst Ihre E-Mail-Adresse ein.',
    resetSent: 'Prüfen Sie Ihren Posteingang: Wir haben Ihnen einen Link zum Zurücksetzen des Passworts gesendet.',
    confirmSent: 'Fast geschafft — bestätigen Sie Ihre E-Mail-Adresse über den Link in Ihrem Posteingang und melden Sie sich dann an.',
    inboxBefore: 'Prüfen Sie Ihren Posteingang unter ',
    inboxFallback: 'Ihrer Adresse',
    inboxAfter: '. Der Anmeldelink ist 1 Stunde lang gültig.',
    tfaPrompt: 'Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.',
    codeLabel: '6-stelliger Code',
    codePlaceholder: '123456',
    verify: 'Prüfen',
    errGeneric: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    fine: 'Mit der Fortsetzung akzeptieren Sie unsere Bedingungen. Wir verwenden Ihre E-Mail-Adresse ausschließlich, um Sie anzumelden und Ihnen kursbezogene Benachrichtigungen zu senden.',
    titleSignup: 'Konto erstellen',
    subtitleSignup: 'Ein kostenloses Konto, um Konsolenvalidierungen, Kurse und Support an einem Ort zu verfolgen.',
    pwHint: 'Mindestens 8 Zeichen.',
    confirmTitle: 'Prüfen Sie Ihre E-Mails',
    confirmBefore: 'Wir haben einen Bestätigungslink an ',
    confirmAfter: ' gesendet. Klicken Sie darauf, um Ihr Konto zu aktivieren — danach helfen wir Ihnen, Ihr Profil zu vervollständigen.',
    linkTitle: 'Anmeldelink gesendet',
    resetTitle: 'Link zum Zurücksetzen gesendet',
    back: '← Zurück',
  },
  it: {
    title: 'Acceda al suo account',
    subtitle:
      'Acceda per seguire i suoi progressi, consultare le sue masterclass e gestire il suo abbonamento Academy Pass.',
    google: 'Continua con Google',
    apple: 'Continua con Apple',
    or: 'oppure',
    emailLabel: 'Indirizzo e-mail',
    emailPlaceholder: 'nome@azienda.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'La sua password',
    signIn: 'Accedi',
    createAccount: 'Crea un account',
    working: 'Attenda…',
    forgot: 'Password dimenticata?',
    toSignup: 'Nuovo? Crei un account',
    toSignin: 'Ha già un account? Acceda',
    magicInstead: 'Ricevi invece un link di accesso via e-mail',
    needEmail: 'Inserisca prima il suo indirizzo e-mail.',
    resetSent: 'Controlli la sua casella di posta: le abbiamo inviato un link per reimpostare la password.',
    confirmSent: 'Ci siamo quasi — controlli la sua casella di posta per confermare l’e-mail, poi acceda.',
    inboxBefore: 'Controlli la sua casella di posta all’indirizzo ',
    inboxFallback: 'indicato',
    inboxAfter: '. Il link di accesso scade tra 1 ora.',
    tfaPrompt: 'Inserisca il codice a 6 cifre della sua app di autenticazione.',
    codeLabel: 'Codice a 6 cifre',
    codePlaceholder: '123456',
    verify: 'Verifica',
    errGeneric: 'Si è verificato un errore. Riprovi.',
    fine: 'Continuando, accetta le nostre condizioni. Utilizziamo la sua e-mail esclusivamente per l’accesso e per inviarle notifiche relative ai corsi.',
    titleSignup: 'Crei il suo account',
    subtitleSignup: 'Un account gratuito per seguire le validazioni console, i corsi e il supporto in un unico posto.',
    pwHint: 'Almeno 8 caratteri.',
    confirmTitle: 'Controlli la sua e-mail',
    confirmBefore: 'Abbiamo inviato un link di conferma a ',
    confirmAfter: '. Clicchi sul link per attivare il suo account — poi la aiuteremo a completare il suo profilo.',
    linkTitle: 'Link di accesso inviato',
    resetTitle: 'Link di reimpostazione inviato',
    back: '← Indietro',
  },
  es: {
    title: 'Inicie sesión en su cuenta',
    subtitle:
      'Inicie sesión para seguir su progreso, acceder a sus masterclasses y gestionar su suscripción Academy Pass.',
    google: 'Continuar con Google',
    apple: 'Continuar con Apple',
    or: 'o',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'nombre@empresa.com',
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Su contraseña',
    signIn: 'Iniciar sesión',
    createAccount: 'Crear una cuenta',
    working: 'Espere…',
    forgot: '¿Olvidó su contraseña?',
    toSignup: '¿Nuevo? Cree una cuenta',
    toSignin: '¿Ya tiene una cuenta? Inicie sesión',
    magicInstead: 'Enviarme un enlace de acceso por correo',
    needEmail: 'Introduzca primero su correo electrónico.',
    resetSent: 'Revise su bandeja de entrada: le enviamos un enlace para restablecer su contraseña.',
    confirmSent: 'Casi listo — revise su bandeja de entrada para confirmar su correo y luego inicie sesión.',
    inboxBefore: 'Revise su bandeja de entrada en ',
    inboxFallback: 'su correo electrónico',
    inboxAfter: '. El enlace de acceso caduca en 1 hora.',
    tfaPrompt: 'Introduzca el código de 6 dígitos de su app de autenticación.',
    codeLabel: 'Código de 6 dígitos',
    codePlaceholder: '123456',
    verify: 'Verificar',
    errGeneric: 'Algo salió mal. Inténtelo de nuevo.',
    fine: 'Al continuar, acepta nuestras condiciones. Utilizamos su correo únicamente para iniciar su sesión y enviarle notificaciones relacionadas con los cursos.',
    titleSignup: 'Cree su cuenta',
    subtitleSignup: 'Una cuenta gratuita para seguir sus validaciones de consola, sus cursos y el soporte en un solo lugar.',
    pwHint: 'Al menos 8 caracteres.',
    confirmTitle: 'Revise su correo',
    confirmBefore: 'Hemos enviado un enlace de confirmación a ',
    confirmAfter: '. Haga clic en él para activar su cuenta; después le ayudaremos a completar su perfil.',
    linkTitle: 'Enlace de acceso enviado',
    resetTitle: 'Enlace de restablecimiento enviado',
    back: '← Volver',
  },
};

type Status = 'idle' | 'working' | 'linkSent' | 'resetSent' | 'confirmSent' | 'error';

export function SignInPage() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const search = useSearchParams();
  const next = search.get('next') ?? '/account';
  // ?mode=signup lets external CTAs (e.g. the /promo reels) land directly on
  // the "Create your account" tab.
  const [mode, setMode] = useState<'signin' | 'signup'>(
    search.get('mode') === 'signup' ? 'signup' : 'signin',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // When the account has TOTP 2FA, password sign-in lands at AAL1 and we prompt
  // for the authenticator code here before completing the redirect.
  const [mfa, setMfa] = useState<{ factorId: string; challengeId: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  // Reflect redirect-back state: "magic link sent" after the email link, or an
  // error surfaced by the auth callback (?error=…) when code exchange fails.
  useEffect(() => {
    if (search.get('check_email') === '1') setStatus('linkSent');
    const callbackError = search.get('error');
    if (callbackError) {
      setStatus('error');
      setErrorMsg(callbackError);
    }
  }, [search]);

  const callbackUrl = (n: string) =>
    `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(n)}`;

  const oauth = async (provider: 'google' | 'apple') => {
    if (DEMO_AUTH) {
      window.location.href = DEMO_DASHBOARD;
      return;
    }
    setStatus('working');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl(next) },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    }
  };

  const handlePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;
    if (DEMO_AUTH) {
      window.location.href = DEMO_DASHBOARD;
      return;
    }
    setStatus('working');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus('error');
        setErrorMsg(error.message);
        return;
      }
      // TOTP 2FA: password sign-in lands at AAL1; if the account has a verified
      // factor it must step up to AAL2 with a code before we let it through.
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totp = factors?.totp?.[0];
        if (totp) {
          const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
          if (chErr || !ch) {
            setStatus('error');
            setErrorMsg(chErr?.message ?? t.errGeneric);
            return;
          }
          setMfa({ factorId: totp.id, challengeId: ch.id });
          setMfaCode('');
          setStatus('idle');
          return;
        }
      }
      window.location.href = next;
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callbackUrl(next), data: { locale } },
      });
      if (error) {
        setStatus('error');
        setErrorMsg(error.message);
        return;
      }
      // Email confirmation on → no session yet; off → straight in.
      if (data.session) {
        window.location.href = next;
        return;
      }
      setStatus('confirmSent');
    }
  };

  const verifyMfa = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mfa) return;
    setStatus('working');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.mfa.verify({
      factorId: mfa.factorId,
      challengeId: mfa.challengeId,
      code: mfaCode,
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    window.location.href = next;
  };

  const handleReset = async () => {
    if (!email) {
      setStatus('error');
      setErrorMsg(t.needEmail);
      return;
    }
    setStatus('working');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl('/account/update-password'),
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('resetSent');
  };

  const handleMagicLink = async () => {
    if (!email) {
      setStatus('error');
      setErrorMsg(t.needEmail);
      return;
    }
    if (DEMO_AUTH) {
      window.location.href = DEMO_DASHBOARD;
      return;
    }
    setStatus('working');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl(next), shouldCreateUser: true, data: { locale } },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('linkSent');
    }
  };

  const working = status === 'working';
  const isSignup = mode === 'signup';

  const switchMode = (m: 'signin' | 'signup') => {
    setMode(m);
    setStatus('idle');
    setErrorMsg(null);
  };

  // Terminal "check your email" states get a dedicated panel that replaces the
  // form, so the next step (open your inbox) is unmistakable.
  const sent: { title: string; body: React.ReactNode; steps: boolean } | null =
    status === 'confirmSent'
      ? {
          title: t.confirmTitle,
          body: (
            <>
              {t.confirmBefore}
              <strong>{email || t.inboxFallback}</strong>
              {t.confirmAfter}
            </>
          ),
          steps: true,
        }
      : status === 'linkSent'
        ? {
            title: t.linkTitle,
            body: (
              <>
                {t.inboxBefore}
                <strong>{email || t.inboxFallback}</strong>
                {t.inboxAfter}
              </>
            ),
            steps: false,
          }
        : status === 'resetSent'
          ? { title: t.resetTitle, body: t.resetSent, steps: false }
          : null;

  return (
    <main className="page-shell" id="top">
      <SiteNav />

      <section className="signin-section section">
        <div className="container signin-shell">
          <header className="signin-head">
            <p className="section-kicker">Rutherford Academy</p>
            <h1>{isSignup ? t.titleSignup : t.title}</h1>
            <p>{isSignup ? t.subtitleSignup : t.subtitle}</p>
          </header>

          <div className="signin-card">
            {mfa ? (
              <form className="signin-form" onSubmit={verifyMfa}>
                <p className="signin-fine signin-fine-tight">{t.tfaPrompt}</p>
                <label htmlFor="signin-tfa" className="signin-label">
                  {t.codeLabel}
                </label>
                <input
                  id="signin-tfa"
                  className="signin-input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder={t.codePlaceholder}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                  disabled={working}
                />
                <button
                  type="submit"
                  className="button button-accent signin-submit"
                  disabled={working || mfaCode.length < 6}
                >
                  {working ? t.working : t.verify}
                </button>
                {status === 'error' && errorMsg ? (
                  <p className="signin-message signin-message-error">{errorMsg}</p>
                ) : null}
              </form>
            ) : sent ? (
              <div className="signin-confirm">
                {sent.steps ? <AuthSteps active={2} /> : null}
                <span className="signin-confirm-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
                    <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h2>{sent.title}</h2>
                <p>{sent.body}</p>
                <button
                  type="button"
                  className="signin-link"
                  onClick={() => {
                    setStatus('idle');
                    setErrorMsg(null);
                  }}
                >
                  {t.back}
                </button>
              </div>
            ) : (
              <>
                <div className="signin-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={!isSignup}
                    className={`signin-tab${!isSignup ? ' is-active' : ''}`}
                    onClick={() => switchMode('signin')}
                    disabled={working}
                  >
                    {t.signIn}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isSignup}
                    className={`signin-tab${isSignup ? ' is-active' : ''}`}
                    onClick={() => switchMode('signup')}
                    disabled={working}
                  >
                    {t.createAccount}
                  </button>
                </div>

                <button
                  type="button"
                  className="signin-provider signin-provider-google"
                  onClick={() => oauth('google')}
                  disabled={working}
                >
                  <svg width="20" height="20" viewBox="10 10 20 20" aria-hidden="true">
                    <path d="M29.6 20.2273C29.6 19.5182 29.5364 18.8364 29.4182 18.1818H20V22.05H25.3818C25.15 23.3 24.4455 24.3591 23.3864 25.0682V27.5773H26.6182C28.5091 25.8364 29.6 23.2727 29.6 20.2273Z" fill="#4285F4" />
                    <path d="M20 30C22.7 30 24.9636 29.1045 26.6181 27.5773L23.3863 25.0682C22.4909 25.6682 21.3454 26.0227 20 26.0227C17.3954 26.0227 15.1909 24.2636 14.4045 21.9H11.0636V24.4909C12.7091 27.7591 16.0909 30 20 30Z" fill="#34A853" />
                    <path d="M14.4045 21.9C14.2045 21.3 14.0909 20.6591 14.0909 20C14.0909 19.3409 14.2045 18.7 14.4045 18.1V15.5091H11.0636C10.3864 16.8591 10 18.3864 10 20C10 21.6136 10.3864 23.1409 11.0636 24.4909L14.4045 21.9Z" fill="#FBBC04" />
                    <path d="M20 13.9773C21.4681 13.9773 22.7863 14.4818 23.8227 15.4727L26.6909 12.6045C24.9591 10.9909 22.6954 10 20 10C16.0909 10 12.7091 12.2409 11.0636 15.5091L14.4045 18.1C15.1909 15.7364 17.3954 13.9773 20 13.9773Z" fill="#E94235" />
                  </svg>
                  {t.google}
                </button>

                <button
                  type="button"
                  className="signin-provider signin-provider-apple"
                  onClick={() => oauth('apple')}
                  disabled={working}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.46 1.58-1.5 3.14-.92 1.36-1.88 2.71-3.39 2.74-1.49.03-1.95-.88-3.66-.88-1.71 0-2.22.85-3.63.91-1.45.06-2.55-1.47-3.48-2.83-1.87-2.71-3.32-7.68-1.38-11.05.97-1.66 2.7-2.71 4.57-2.74 1.43-.03 2.78.96 3.66.96.88 0 2.53-1.18 4.27-1.01.73.03 2.77.29 4.08 2.21-.11.07-2.44 1.42-2.41 4.24.03 3.37 2.96 4.49 2.99 4.5z" />
                  </svg>
                  {t.apple}
                </button>

                <div className="signin-divider">
                  <span>{t.or}</span>
                </div>

                <form className="signin-form" onSubmit={handlePassword}>
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
                    autoComplete="email"
                    disabled={working}
                  />

                  <label htmlFor="signin-password" className="signin-label">
                    {t.passwordLabel}
                  </label>
                  <input
                    id="signin-password"
                    type="password"
                    className="signin-input"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={MIN_PASSWORD}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    disabled={working}
                  />
                  {isSignup ? <p className="signin-hint">{t.pwHint}</p> : null}

                  <button
                    type="submit"
                    className="button button-accent signin-submit"
                    disabled={working || !email || !password}
                  >
                    {working ? t.working : isSignup ? t.createAccount : t.signIn}
                  </button>

                  {!isSignup ? (
                    <div className="signin-row">
                      <button type="button" className="signin-link" onClick={handleReset} disabled={working}>
                        {t.forgot}
                      </button>
                    </div>
                  ) : null}
                </form>

                {!isSignup ? (
                  <button
                    type="button"
                    className="signin-secondary"
                    onClick={handleMagicLink}
                    disabled={working || !email}
                  >
                    {t.magicInstead}
                  </button>
                ) : null}

                {status === 'error' && errorMsg ? (
                  <p className="signin-message signin-message-error">{errorMsg}</p>
                ) : null}

                <p className="signin-fine">{t.fine}</p>
              </>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
