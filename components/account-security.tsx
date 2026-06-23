'use client';

import { useEffect, useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Copy = {
  kicker: string;
  title: string;
  subtitle: string;
  back: string;
  pwTitle: string;
  pwDesc: string;
  pwBtn: string;
  tfaTitle: string;
  tfaOn: string;
  tfaDescOn: string;
  tfaDescOff: string;
  enable: string;
  disable: string;
  enrollHint: string;
  secretHint: string;
  codeLabel: string;
  codePlaceholder: string;
  verify: string;
  verifying: string;
  cancel: string;
  enabledMsg: string;
  errGeneric: string;
  loading: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'Account security',
    title: 'Password & two-factor',
    subtitle: 'Manage how you sign in and add an extra layer of protection.',
    back: '← Back to account',
    pwTitle: 'Password',
    pwDesc: 'Set or change the password you use to sign in — no email link needed.',
    pwBtn: 'Change password',
    tfaTitle: 'Two-factor authentication',
    tfaOn: 'Enabled',
    tfaDescOn: 'You’ll be asked for a code from your authenticator app each time you sign in with a password.',
    tfaDescOff: 'Add a one-time code from an authenticator app (Google Authenticator, 1Password, Authy…) on top of your password.',
    enable: 'Enable two-factor',
    disable: 'Turn off',
    enrollHint: 'Scan this QR code with your authenticator app, then enter the 6-digit code it shows.',
    secretHint: 'Can’t scan? Enter this key manually:',
    codeLabel: '6-digit code',
    codePlaceholder: '123456',
    verify: 'Verify & enable',
    verifying: 'Verifying…',
    cancel: 'Cancel',
    enabledMsg: 'Two-factor authentication is on.',
    errGeneric: 'Something went wrong. Please try again.',
    loading: 'Loading…',
  },
  fr: {
    kicker: 'Sécurité du compte',
    title: 'Mot de passe et double authentification',
    subtitle: 'Gérez votre méthode de connexion et ajoutez une protection supplémentaire.',
    back: '← Retour au compte',
    pwTitle: 'Mot de passe',
    pwDesc: 'Définissez ou modifiez le mot de passe de connexion — sans lien e-mail.',
    pwBtn: 'Changer le mot de passe',
    tfaTitle: 'Double authentification',
    tfaOn: 'Activée',
    tfaDescOn: 'Un code de votre application d’authentification vous sera demandé à chaque connexion par mot de passe.',
    tfaDescOff: 'Ajoutez un code à usage unique d’une application d’authentification (Google Authenticator, 1Password, Authy…) en plus de votre mot de passe.',
    enable: 'Activer la double authentification',
    disable: 'Désactiver',
    enrollHint: 'Scannez ce QR code avec votre application d’authentification, puis saisissez le code à 6 chiffres affiché.',
    secretHint: 'Impossible de scanner ? Saisissez cette clé manuellement :',
    codeLabel: 'Code à 6 chiffres',
    codePlaceholder: '123456',
    verify: 'Vérifier et activer',
    verifying: 'Vérification…',
    cancel: 'Annuler',
    enabledMsg: 'La double authentification est activée.',
    errGeneric: 'Une erreur est survenue. Veuillez réessayer.',
    loading: 'Chargement…',
  },
  de: {
    kicker: 'Kontosicherheit',
    title: 'Passwort & Zwei-Faktor',
    subtitle: 'Verwalten Sie Ihre Anmeldung und fügen Sie eine zusätzliche Schutzebene hinzu.',
    back: '← Zurück zum Konto',
    pwTitle: 'Passwort',
    pwDesc: 'Legen Sie das Passwort für die Anmeldung fest oder ändern Sie es — ohne E-Mail-Link.',
    pwBtn: 'Passwort ändern',
    tfaTitle: 'Zwei-Faktor-Authentifizierung',
    tfaOn: 'Aktiviert',
    tfaDescOn: 'Bei jeder Anmeldung mit Passwort werden Sie nach einem Code aus Ihrer Authenticator-App gefragt.',
    tfaDescOff: 'Ergänzen Sie Ihr Passwort um einen Einmalcode aus einer Authenticator-App (Google Authenticator, 1Password, Authy…).',
    enable: 'Zwei-Faktor aktivieren',
    disable: 'Deaktivieren',
    enrollHint: 'Scannen Sie diesen QR-Code mit Ihrer Authenticator-App und geben Sie den angezeigten 6-stelligen Code ein.',
    secretHint: 'Scannen nicht möglich? Geben Sie diesen Schlüssel manuell ein:',
    codeLabel: '6-stelliger Code',
    codePlaceholder: '123456',
    verify: 'Prüfen & aktivieren',
    verifying: 'Wird geprüft…',
    cancel: 'Abbrechen',
    enabledMsg: 'Die Zwei-Faktor-Authentifizierung ist aktiv.',
    errGeneric: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    loading: 'Wird geladen…',
  },
  it: {
    kicker: 'Sicurezza dell’account',
    title: 'Password e doppia autenticazione',
    subtitle: 'Gestisca il metodo di accesso e aggiunga un livello di protezione in più.',
    back: '← Torna all’account',
    pwTitle: 'Password',
    pwDesc: 'Imposti o modifichi la password di accesso — senza link via e-mail.',
    pwBtn: 'Cambia password',
    tfaTitle: 'Autenticazione a due fattori',
    tfaOn: 'Attiva',
    tfaDescOn: 'Le verrà chiesto un codice dalla sua app di autenticazione a ogni accesso con password.',
    tfaDescOff: 'Aggiunga un codice monouso da un’app di autenticazione (Google Authenticator, 1Password, Authy…) oltre alla password.',
    enable: 'Attiva la doppia autenticazione',
    disable: 'Disattiva',
    enrollHint: 'Scansioni questo codice QR con la sua app di autenticazione, poi inserisca il codice a 6 cifre mostrato.',
    secretHint: 'Non riesce a scansionare? Inserisca questa chiave manualmente:',
    codeLabel: 'Codice a 6 cifre',
    codePlaceholder: '123456',
    verify: 'Verifica e attiva',
    verifying: 'Verifica…',
    cancel: 'Annulla',
    enabledMsg: 'L’autenticazione a due fattori è attiva.',
    errGeneric: 'Si è verificato un errore. Riprovi.',
    loading: 'Caricamento…',
  },
  es: {
    kicker: 'Seguridad de la cuenta',
    title: 'Contraseña y doble factor',
    subtitle: 'Gestione cómo inicia sesión y añada una capa de protección adicional.',
    back: '← Volver a la cuenta',
    pwTitle: 'Contraseña',
    pwDesc: 'Establezca o cambie la contraseña de acceso — sin enlace por correo.',
    pwBtn: 'Cambiar contraseña',
    tfaTitle: 'Autenticación de dos factores',
    tfaOn: 'Activada',
    tfaDescOn: 'Se le pedirá un código de su app de autenticación cada vez que inicie sesión con contraseña.',
    tfaDescOff: 'Añada un código de un solo uso de una app de autenticación (Google Authenticator, 1Password, Authy…) además de su contraseña.',
    enable: 'Activar doble factor',
    disable: 'Desactivar',
    enrollHint: 'Escanee este código QR con su app de autenticación e introduzca el código de 6 dígitos que muestra.',
    secretHint: '¿No puede escanear? Introduzca esta clave manualmente:',
    codeLabel: 'Código de 6 dígitos',
    codePlaceholder: '123456',
    verify: 'Verificar y activar',
    verifying: 'Verificando…',
    cancel: 'Cancelar',
    enabledMsg: 'La autenticación de dos factores está activada.',
    errGeneric: 'Algo salió mal. Inténtelo de nuevo.',
    loading: 'Cargando…',
  },
};

type Mode = 'loading' | 'off' | 'enrolling' | 'on';

export function AccountSecurity() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const [mode, setMode] = useState<Mode>('loading');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      setMode('off');
      return;
    }
    setMode((data?.totp?.length ?? 0) > 0 ? 'on' : 'off');
  };

  useEffect(() => {
    void refresh();
  }, []);

  const startEnroll = async () => {
    setErr(null);
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    // Clear any abandoned, unverified factors so enroll doesn't collide.
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) {
      if (f.factor_type === 'totp' && f.status !== 'verified') {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    setBusy(false);
    if (error || !data) {
      setErr(error?.message ?? t.errGeneric);
      return;
    }
    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
    setCode('');
    setMode('enrolling');
  };

  const verifyEnroll = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!factorId) return;
    setBusy(true);
    setErr(null);
    const supabase = createSupabaseBrowserClient();
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
    if (chErr || !ch) {
      setBusy(false);
      setErr(chErr?.message ?? t.errGeneric);
      return;
    }
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setQr(null);
    setSecret(null);
    setFactorId(null);
    setCode('');
    setMode('on');
  };

  const cancelEnroll = async () => {
    setErr(null);
    if (factorId) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.mfa.unenroll({ factorId });
    }
    setFactorId(null);
    setQr(null);
    setSecret(null);
    setCode('');
    setMode('off');
  };

  const disable = async () => {
    setBusy(true);
    setErr(null);
    const supabase = createSupabaseBrowserClient();
    const { data: list } = await supabase.auth.mfa.listFactors();
    let failed: string | null = null;
    for (const f of list?.all ?? []) {
      if (f.factor_type === 'totp') {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: f.id });
        if (error) failed = error.message;
      }
    }
    setBusy(false);
    if (failed) {
      setErr(failed);
      return;
    }
    setMode('off');
  };

  return (
    <main className="page-shell" id="top">
      <SiteNav current="account" />

      <section className="signin-section section">
        <div className="container signin-shell">
          <header className="signin-head">
            <p className="section-kicker">{t.kicker}</p>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </header>

          <a className="sec-back" href="/account">{t.back}</a>

          {/* Password */}
          <div className="signin-card sec-card">
            <div className="sec-block-h">
              <h2 className="sec-h">{t.pwTitle}</h2>
            </div>
            <p className="signin-fine signin-fine-tight sec-desc">{t.pwDesc}</p>
            <a className="button button-light" href="/account/update-password">{t.pwBtn}</a>
          </div>

          {/* Two-factor */}
          <div className="signin-card sec-card">
            <div className="sec-block-h">
              <h2 className="sec-h">{t.tfaTitle}</h2>
              {mode === 'on' ? <span className="sec-badge">{t.tfaOn}</span> : null}
            </div>

            {mode === 'loading' ? (
              <p className="signin-fine signin-fine-tight">{t.loading}</p>
            ) : mode === 'on' ? (
              <>
                <p className="signin-fine signin-fine-tight sec-desc">{t.tfaDescOn}</p>
                <button type="button" className="account-btn-danger-ghost" onClick={disable} disabled={busy}>
                  {t.disable}
                </button>
              </>
            ) : mode === 'enrolling' ? (
              <form className="signin-form" onSubmit={verifyEnroll}>
                <p className="signin-fine signin-fine-tight sec-desc">{t.enrollHint}</p>
                {qr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="sec-qr" src={qr} alt="" width={180} height={180} />
                ) : null}
                {secret ? (
                  <p className="sec-secret">
                    {t.secretHint} <code>{secret}</code>
                  </p>
                ) : null}
                <label htmlFor="tfa-code" className="signin-label">{t.codeLabel}</label>
                <input
                  id="tfa-code"
                  className="signin-input"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder={t.codePlaceholder}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={busy}
                  required
                />
                <button type="submit" className="button button-accent signin-submit" disabled={busy || code.length < 6}>
                  {busy ? t.verifying : t.verify}
                </button>
                <button type="button" className="signin-link" onClick={cancelEnroll} disabled={busy}>
                  {t.cancel}
                </button>
              </form>
            ) : (
              <>
                <p className="signin-fine signin-fine-tight sec-desc">{t.tfaDescOff}</p>
                <button type="button" className="button button-accent" onClick={startEnroll} disabled={busy}>
                  {t.enable}
                </button>
              </>
            )}

            {err ? <p className="signin-message signin-message-error">{err}</p> : null}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
