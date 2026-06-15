'use client';

import { type Locale, useLanguage } from '@/components/language-provider';

// Three-step progress shared across the sign-up journey so the path reads as one
// flow: create the account → confirm the email → complete the profile, then in.
// Shown on the "check your email" confirmation and on the onboarding form.
const STEP_LABELS: Record<Locale, [string, string, string]> = {
  en: ['Account', 'Email', 'Profile'],
  fr: ['Compte', 'E-mail', 'Profil'],
  de: ['Konto', 'E-Mail', 'Profil'],
  it: ['Account', 'E-mail', 'Profilo'],
  es: ['Cuenta', 'Correo', 'Perfil'],
};

export function AuthSteps({ active }: { active: 1 | 2 | 3 }) {
  const { locale } = useLanguage();
  const labels = STEP_LABELS[locale] ?? STEP_LABELS.en;
  return (
    <ol className="auth-steps" aria-label="Progress">
      {labels.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const state = n < active ? 'done' : n === active ? 'current' : 'future';
        return (
          <li key={label} className={`auth-step is-${state}`} aria-current={n === active ? 'step' : undefined}>
            <span className="auth-step-dot">{n < active ? '✓' : n}</span>
            <span className="auth-step-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
