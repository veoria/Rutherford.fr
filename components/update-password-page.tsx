'use client';

import { useEffect, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const MIN_PASSWORD = 8;

type Copy = {
  title: string;
  subtitle: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmLabel: string;
  confirmPlaceholder: string;
  submit: string;
  saving: string;
  saved: string;
  tooShort: string;
  mismatch: string;
  errorGeneric: string;
  expiredTitle: string;
  expiredText: string;
  backToSignin: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    title: 'Set a new password',
    subtitle: 'Choose a password to sign in with next time — no email link needed.',
    passwordLabel: 'New password',
    passwordPlaceholder: 'At least 8 characters',
    confirmLabel: 'Confirm password',
    confirmPlaceholder: 'Re-enter your password',
    submit: 'Save password',
    saving: 'Saving…',
    saved: 'Password saved. Redirecting…',
    tooShort: 'Password must be at least 8 characters.',
    mismatch: 'The two passwords don’t match.',
    errorGeneric: 'Something went wrong. Please try again.',
    expiredTitle: 'Link expired',
    expiredText: 'This password link is no longer valid. Request a new one from the sign-in page.',
    backToSignin: 'Back to sign in',
  },
  fr: {
    title: 'Définir un nouveau mot de passe',
    subtitle: 'Choisissez un mot de passe pour vos prochaines connexions — sans lien e-mail.',
    passwordLabel: 'Nouveau mot de passe',
    passwordPlaceholder: 'Au moins 8 caractères',
    confirmLabel: 'Confirmez le mot de passe',
    confirmPlaceholder: 'Saisissez à nouveau le mot de passe',
    submit: 'Enregistrer le mot de passe',
    saving: 'Enregistrement…',
    saved: 'Mot de passe enregistré. Redirection…',
    tooShort: 'Le mot de passe doit comporter au moins 8 caractères.',
    mismatch: 'Les deux mots de passe ne correspondent pas.',
    errorGeneric: 'Une erreur est survenue. Veuillez réessayer.',
    expiredTitle: 'Lien expiré',
    expiredText: 'Ce lien de mot de passe n’est plus valide. Demandez-en un nouveau depuis la page de connexion.',
    backToSignin: 'Retour à la connexion',
  },
  de: {
    title: 'Neues Passwort festlegen',
    subtitle: 'Wählen Sie ein Passwort für die nächste Anmeldung — ohne E-Mail-Link.',
    passwordLabel: 'Neues Passwort',
    passwordPlaceholder: 'Mindestens 8 Zeichen',
    confirmLabel: 'Passwort bestätigen',
    confirmPlaceholder: 'Passwort erneut eingeben',
    submit: 'Passwort speichern',
    saving: 'Wird gespeichert…',
    saved: 'Passwort gespeichert. Weiterleitung…',
    tooShort: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
    mismatch: 'Die beiden Passwörter stimmen nicht überein.',
    errorGeneric: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    expiredTitle: 'Link abgelaufen',
    expiredText: 'Dieser Passwort-Link ist nicht mehr gültig. Fordern Sie auf der Anmeldeseite einen neuen an.',
    backToSignin: 'Zurück zur Anmeldung',
  },
  it: {
    title: 'Imposta una nuova password',
    subtitle: 'Scelga una password per i prossimi accessi — senza link via e-mail.',
    passwordLabel: 'Nuova password',
    passwordPlaceholder: 'Almeno 8 caratteri',
    confirmLabel: 'Conferma password',
    confirmPlaceholder: 'Reinserisca la password',
    submit: 'Salva password',
    saving: 'Salvataggio…',
    saved: 'Password salvata. Reindirizzamento…',
    tooShort: 'La password deve contenere almeno 8 caratteri.',
    mismatch: 'Le due password non corrispondono.',
    errorGeneric: 'Si è verificato un errore. Riprovi.',
    expiredTitle: 'Link scaduto',
    expiredText: 'Questo link per la password non è più valido. Ne richieda uno nuovo dalla pagina di accesso.',
    backToSignin: 'Torna all’accesso',
  },
  es: {
    title: 'Establecer una nueva contraseña',
    subtitle: 'Elija una contraseña para sus próximos inicios de sesión — sin enlace por correo.',
    passwordLabel: 'Nueva contraseña',
    passwordPlaceholder: 'Al menos 8 caracteres',
    confirmLabel: 'Confirme la contraseña',
    confirmPlaceholder: 'Vuelva a introducir la contraseña',
    submit: 'Guardar contraseña',
    saving: 'Guardando…',
    saved: 'Contraseña guardada. Redirigiendo…',
    tooShort: 'La contraseña debe tener al menos 8 caracteres.',
    mismatch: 'Las dos contraseñas no coinciden.',
    errorGeneric: 'Algo salió mal. Inténtelo de nuevo.',
    expiredTitle: 'Enlace caducado',
    expiredText: 'Este enlace de contraseña ya no es válido. Solicite uno nuevo desde la página de inicio de sesión.',
    backToSignin: 'Volver al inicio de sesión',
  },
  pt: {
    title: 'Defina uma nova palavra-passe',
    subtitle: 'Escolha uma palavra-passe para iniciar sessão da próxima vez, sem ligação por email.',
    passwordLabel: 'Nova palavra-passe',
    passwordPlaceholder: 'Pelo menos 8 caracteres',
    confirmLabel: 'Confirmar palavra-passe',
    confirmPlaceholder: 'Volte a introduzir a palavra-passe',
    submit: 'Guardar palavra-passe',
    saving: 'A guardar…',
    saved: 'Palavra-passe guardada. A redirecionar…',
    tooShort: 'A palavra-passe deve ter pelo menos 8 caracteres.',
    mismatch: 'As duas palavras-passe não coincidem.',
    errorGeneric: 'Ocorreu um erro. Tente novamente.',
    expiredTitle: 'Ligação expirada',
    expiredText: 'Esta ligação de palavra-passe já não é válida. Solicite uma nova a partir da página de início de sessão.',
    backToSignin: 'Voltar ao início de sessão',
  },
};

export function UpdatePasswordPage() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // The recovery link runs through /api/auth/callback, which establishes a
  // session before redirecting here. A logged-in user can also reach this page
  // directly to change their password. No session → the link expired.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user));
      setReady(true);
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setStatus('error');
      setErrorMsg(t.tooShort);
      return;
    }
    if (password !== confirm) {
      setStatus('error');
      setErrorMsg(t.mismatch);
      return;
    }
    setStatus('saving');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('saved');
    setTimeout(() => {
      window.location.href = '/account';
    }, 1200);
  };

  return (
    <main className="page-shell" id="top">
      <SiteNav current="account" />

      <section className="signin-section section">
        <div className="container signin-shell">
          <header className="signin-head">
            <p className="section-kicker">Rutherford Academy</p>
            <h1>{ready && !signedIn ? t.expiredTitle : t.title}</h1>
            <p>{ready && !signedIn ? t.expiredText : t.subtitle}</p>
          </header>

          <div className="signin-card">
            {!ready ? null : !signedIn ? (
              <a className="button button-accent signin-submit" href="/account/sign-in">
                {t.backToSignin}
              </a>
            ) : (
              <>
                <form className="signin-form" onSubmit={handleSubmit}>
                  <label htmlFor="pw-new" className="signin-label">
                    {t.passwordLabel}
                  </label>
                  <input
                    id="pw-new"
                    type="password"
                    className="signin-input"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={MIN_PASSWORD}
                    autoComplete="new-password"
                    disabled={status === 'saving'}
                  />

                  <label htmlFor="pw-confirm" className="signin-label">
                    {t.confirmLabel}
                  </label>
                  <input
                    id="pw-confirm"
                    type="password"
                    className="signin-input"
                    placeholder={t.confirmPlaceholder}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={MIN_PASSWORD}
                    autoComplete="new-password"
                    disabled={status === 'saving'}
                  />

                  <button
                    type="submit"
                    className="button button-accent signin-submit"
                    disabled={status === 'saving'}
                  >
                    {status === 'saving' ? t.saving : t.submit}
                  </button>
                </form>

                {status === 'saved' ? (
                  <p className="signin-message signin-message-success">{t.saved}</p>
                ) : null}
                {status === 'error' && errorMsg ? (
                  <p className="signin-message signin-message-error">{errorMsg}</p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
