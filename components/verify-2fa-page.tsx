'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Copy = {
  kicker: string;
  title: string;
  subtitle: string;
  codeLabel: string;
  codePlaceholder: string;
  verify: string;
  verifying: string;
  noFactor: string;
  enable: string;
  errGeneric: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'Security check',
    title: 'Confirm it’s you',
    subtitle: 'Enter the 6-digit code from your authenticator app to continue.',
    codeLabel: '6-digit code',
    codePlaceholder: '123456',
    verify: 'Verify',
    verifying: 'Verifying…',
    noFactor: 'You need two-factor authentication to access this area.',
    enable: 'Enable two-factor',
    errGeneric: 'Something went wrong. Please try again.',
  },
  fr: {
    kicker: 'Vérification de sécurité',
    title: 'Confirmez votre identité',
    subtitle: 'Saisissez le code à 6 chiffres de votre application d’authentification pour continuer.',
    codeLabel: 'Code à 6 chiffres',
    codePlaceholder: '123456',
    verify: 'Vérifier',
    verifying: 'Vérification…',
    noFactor: 'La double authentification est requise pour accéder à cet espace.',
    enable: 'Activer la double authentification',
    errGeneric: 'Une erreur est survenue. Veuillez réessayer.',
  },
  de: {
    kicker: 'Sicherheitsprüfung',
    title: 'Bestätigen Sie, dass Sie es sind',
    subtitle: 'Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein, um fortzufahren.',
    codeLabel: '6-stelliger Code',
    codePlaceholder: '123456',
    verify: 'Prüfen',
    verifying: 'Wird geprüft…',
    noFactor: 'Für diesen Bereich ist eine Zwei-Faktor-Authentifizierung erforderlich.',
    enable: 'Zwei-Faktor aktivieren',
    errGeneric: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
  },
  it: {
    kicker: 'Verifica di sicurezza',
    title: 'Confermi la sua identità',
    subtitle: 'Inserisca il codice a 6 cifre della sua app di autenticazione per continuare.',
    codeLabel: 'Codice a 6 cifre',
    codePlaceholder: '123456',
    verify: 'Verifica',
    verifying: 'Verifica…',
    noFactor: 'Per accedere a quest’area è necessaria l’autenticazione a due fattori.',
    enable: 'Attiva la doppia autenticazione',
    errGeneric: 'Si è verificato un errore. Riprovi.',
  },
  es: {
    kicker: 'Comprobación de seguridad',
    title: 'Confirme que es usted',
    subtitle: 'Introduzca el código de 6 dígitos de su app de autenticación para continuar.',
    codeLabel: 'Código de 6 dígitos',
    codePlaceholder: '123456',
    verify: 'Verificar',
    verifying: 'Verificando…',
    noFactor: 'Necesita autenticación de dos factores para acceder a esta área.',
    enable: 'Activar doble factor',
    errGeneric: 'Algo salió mal. Inténtelo de nuevo.',
  },
};

function safeNext(value: string | null): string {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  return '/account';
}

export function Verify2faPage() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const search = useSearchParams();
  const next = safeNext(search.get('next'));
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'working' | 'nofactor' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Find the verified factor and open a challenge up-front.
  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (!totp) {
        if (active) setStatus('nofactor');
        return;
      }
      const { data: ch, error } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (error || !ch) {
        if (active) {
          setStatus('error');
          setErrorMsg(error?.message ?? t.errGeneric);
        }
        return;
      }
      if (active) {
        setFactorId(totp.id);
        setChallengeId(ch.id);
        setStatus('ready');
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!factorId || !challengeId) return;
    setStatus('working');
    setErrorMsg(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      // Re-open a fresh challenge so the user can retry.
      const { data: ch } = await supabase.auth.mfa.challenge({ factorId });
      if (ch) setChallengeId(ch.id);
      return;
    }
    window.location.href = next;
  };

  return (
    <main className="page-shell" id="top">
      <SiteNav current="account" />

      <section className="signin-section section">
        <div className="container signin-shell">
          <header className="signin-head">
            <p className="section-kicker">{t.kicker}</p>
            <h1>{t.title}</h1>
            <p>{status === 'nofactor' ? t.noFactor : t.subtitle}</p>
          </header>

          <div className="signin-card">
            {status === 'nofactor' ? (
              <a className="button button-accent signin-submit" href={`/account/security?next=${encodeURIComponent(next)}`}>
                {t.enable}
              </a>
            ) : (
              <form className="signin-form" onSubmit={submit}>
                <label htmlFor="v2fa-code" className="signin-label">
                  {t.codeLabel}
                </label>
                <input
                  id="v2fa-code"
                  className="signin-input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder={t.codePlaceholder}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                  disabled={status === 'loading' || status === 'working'}
                />
                <button
                  type="submit"
                  className="button button-accent signin-submit"
                  disabled={status === 'loading' || status === 'working' || code.length < 6}
                >
                  {status === 'working' ? t.verifying : t.verify}
                </button>
                {status === 'error' && errorMsg ? (
                  <p className="signin-message signin-message-error">{errorMsg}</p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
