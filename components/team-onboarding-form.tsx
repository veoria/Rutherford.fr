'use client';

import { useState } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';
import { TEAM_ROLE_KEYS } from '@/data/onboarding-options';
import { TEAM_ROLE_LABELS } from '@/data/team-role-labels';

// Dedicated onboarding for internal staff (rutherford.fr / veoria.fr /
// studiodelaroche.fr). Company + country are known from the domain and set
// server-side, so we only confirm the name and ask for an internal role.
type TeamCopy = {
  kicker: string;
  title: string;
  subtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  roleLabel: string;
  selectRole: string;
  submit: string;
  saving: string;
  errorRequired: string;
  errorGeneric: string;
  fine: string;
};

const COPY: Record<Locale, TeamCopy> = {
  en: {
    kicker: 'Rutherford team',
    title: 'Welcome to the team',
    subtitle: 'One quick step to set up your workspace.',
    nameLabel: 'Full name',
    namePlaceholder: 'Jane Doe',
    roleLabel: 'Your role',
    selectRole: 'Select your role',
    submit: 'Enter the workspace',
    saving: 'Saving…',
    errorRequired: 'Please fill in all fields.',
    errorGeneric: 'Something went wrong. Please try again.',
    fine: 'Your company and country are set automatically from your email.',
  },
  fr: {
    kicker: 'Équipe Rutherford',
    title: 'Bienvenue dans l’équipe',
    subtitle: 'Une étape rapide pour configurer votre espace.',
    nameLabel: 'Nom complet',
    namePlaceholder: 'Jean Dupont',
    roleLabel: 'Votre rôle',
    selectRole: 'Sélectionnez votre rôle',
    submit: 'Accéder à l’espace',
    saving: 'Enregistrement…',
    errorRequired: 'Veuillez remplir tous les champs.',
    errorGeneric: 'Une erreur est survenue. Veuillez réessayer.',
    fine: 'Votre société et votre pays sont renseignés automatiquement à partir de votre e-mail.',
  },
  de: {
    kicker: 'Rutherford-Team',
    title: 'Willkommen im Team',
    subtitle: 'Ein kurzer Schritt, um Ihren Arbeitsbereich einzurichten.',
    nameLabel: 'Vollständiger Name',
    namePlaceholder: 'Max Mustermann',
    roleLabel: 'Ihre Rolle',
    selectRole: 'Rolle auswählen',
    submit: 'Zum Arbeitsbereich',
    saving: 'Wird gespeichert…',
    errorRequired: 'Bitte füllen Sie alle Felder aus.',
    errorGeneric: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    fine: 'Unternehmen und Land werden automatisch aus Ihrer E-Mail-Adresse übernommen.',
  },
  it: {
    kicker: 'Team Rutherford',
    title: 'Benvenuto nel team',
    subtitle: 'Un passaggio veloce per configurare il suo spazio.',
    nameLabel: 'Nome e cognome',
    namePlaceholder: 'Mario Rossi',
    roleLabel: 'Il suo ruolo',
    selectRole: 'Selezioni il suo ruolo',
    submit: 'Accedi allo spazio',
    saving: 'Salvataggio…',
    errorRequired: 'Compili tutti i campi.',
    errorGeneric: 'Si è verificato un errore. Riprovi.',
    fine: 'Azienda e paese sono impostati automaticamente dalla sua e-mail.',
  },
  es: {
    kicker: 'Equipo Rutherford',
    title: 'Bienvenido al equipo',
    subtitle: 'Un paso rápido para configurar su espacio.',
    nameLabel: 'Nombre completo',
    namePlaceholder: 'Juan Pérez',
    roleLabel: 'Su rol',
    selectRole: 'Seleccione su rol',
    submit: 'Acceder al espacio',
    saving: 'Guardando…',
    errorRequired: 'Complete todos los campos.',
    errorGeneric: 'Algo salió mal. Inténtelo de nuevo.',
    fine: 'Su empresa y país se rellenan automáticamente a partir de su correo.',
  },
  pt: {
    kicker: 'Equipa Rutherford',
    title: 'Bem-vindo à equipa',
    subtitle: 'Um passo rápido para configurar o seu espaço de trabalho.',
    nameLabel: 'Nome completo',
    namePlaceholder: 'João Silva',
    roleLabel: 'A sua função',
    selectRole: 'Selecione a sua função',
    submit: 'Aceder ao espaço de trabalho',
    saving: 'A guardar…',
    errorRequired: 'Preencha todos os campos.',
    errorGeneric: 'Ocorreu um erro. Tente novamente.',
    fine: 'A sua empresa e o seu país são preenchidos automaticamente a partir do seu email.',
  },
};

type Props = {
  next: string;
  needsName: boolean;
  defaultName: string;
};

export function TeamOnboardingForm({ next, needsName, defaultName }: Props) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const roles = TEAM_ROLE_LABELS[locale];
  const [fullName, setFullName] = useState(defaultName);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = fullName.trim();
    if (!role || (needsName && !trimmedName)) {
      setStatus('error');
      setErrorMsg(t.errorRequired);
      return;
    }
    setStatus('saving');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/account/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_role: role, ...(needsName ? { full_name: trimmedName } : {}) }),
      });
      if (res.ok) {
        window.location.href = next;
        return;
      }
      if (res.status === 401) {
        window.location.href = `/account/sign-in?next=${encodeURIComponent('/account/onboarding')}`;
        return;
      }
      setStatus('error');
      setErrorMsg(t.errorGeneric);
    } catch {
      setStatus('error');
      setErrorMsg(t.errorGeneric);
    }
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

          <div className="signin-card">
            <form className="signin-form" onSubmit={handleSubmit}>
              {needsName ? (
                <>
                  <label htmlFor="team-name" className="signin-label">
                    {t.nameLabel}
                  </label>
                  <input
                    id="team-name"
                    type="text"
                    className="signin-input"
                    placeholder={t.namePlaceholder}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={status === 'saving'}
                  />
                </>
              ) : null}

              <label htmlFor="team-role" className="signin-label">
                {t.roleLabel}
              </label>
              <select
                id="team-role"
                className="signin-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={status === 'saving'}
              >
                <option value="" disabled>
                  {t.selectRole}
                </option>
                {TEAM_ROLE_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {roles[key]}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="button button-accent signin-submit"
                disabled={status === 'saving'}
              >
                {status === 'saving' ? t.saving : t.submit}
              </button>
            </form>

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
