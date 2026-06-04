'use client';

import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { type Locale, useLanguage } from '@/components/language-provider';

type EnrolledCourse = {
  slug: string;
  title: string;
  duration: string;
  modules: number;
  tone: 'free' | 'premium';
  source: 'free' | 'purchase' | 'pass' | 'grant';
  grantedAt: string;
  expiresAt: string | null;
};

type PassSubscription = {
  status: 'active' | 'past_due' | 'canceled' | 'incomplete';
  currentPeriodEnd: string | null;
  cancelAt: string | null;
};

type Props = {
  user: { email: string; fullName: string | null; avatarUrl: string | null };
  enrolledCourses: EnrolledCourse[];
  passSubscription: PassSubscription | null;
};

type AccountCopy = {
  accountKicker: string;
  signOut: string;
  passKicker: string;
  passActiveTitle: string;
  passInactiveTitle: string;
  active: string;
  cancelsOn: (date: string) => string;
  renewsOn: (date: string) => string;
  lifetime: string;
  manageSub: string;
  passPitch: string;
  seePass: string;
  coursesKicker: string;
  continueLearning: string;
  noCourses: string;
  emptyBody: string;
  freeCourses: string;
  premiumMasterclasses: string;
  modules: string;
  continueCta: string;
  sourceLabel: Record<EnrolledCourse['source'], string>;
};

const COPY: Record<Locale, AccountCopy> = {
  en: {
    accountKicker: 'Your account',
    signOut: 'Sign out',
    passKicker: 'Academy Pass',
    passActiveTitle: 'Pass active',
    passInactiveTitle: 'Get unlimited access to every masterclass',
    active: 'Active',
    cancelsOn: (d) => `Cancels on ${d}`,
    renewsOn: (d) => `Renews on ${d}`,
    lifetime: 'Lifetime access — no renewal required.',
    manageSub: 'Manage subscription',
    passPitch: 'Six premium masterclasses, six certificates, lifetime access, private Q&A community.',
    seePass: 'See the Pass',
    coursesKicker: 'Your courses',
    continueLearning: 'Continue learning',
    noCourses: 'No courses yet',
    emptyBody:
      'You don’t have any enrolled courses yet. Start with a free intro course or browse the premium masterclasses.',
    freeCourses: 'Free courses',
    premiumMasterclasses: 'Premium masterclasses',
    modules: 'modules',
    continueCta: 'Continue',
    sourceLabel: { free: 'Free', purchase: 'Purchased', pass: 'Academy Pass', grant: 'Granted' },
  },
  fr: {
    accountKicker: 'Votre compte',
    signOut: 'Se déconnecter',
    passKicker: 'Academy Pass',
    passActiveTitle: 'Pass actif',
    passInactiveTitle: 'Accédez à toutes les masterclasses sans limite',
    active: 'Actif',
    cancelsOn: (d) => `Résiliation le ${d}`,
    renewsOn: (d) => `Renouvellement le ${d}`,
    lifetime: 'Accès à vie — aucun renouvellement nécessaire.',
    manageSub: 'Gérer l’abonnement',
    passPitch:
      'Six masterclasses premium, six certificats, accès à vie, communauté privée de questions-réponses.',
    seePass: 'Voir le Pass',
    coursesKicker: 'Vos cours',
    continueLearning: 'Continuez votre apprentissage',
    noCourses: 'Aucun cours pour l’instant',
    emptyBody:
      'Vous n’avez encore aucun cours. Commencez par un cours d’introduction gratuit ou parcourez les masterclasses premium.',
    freeCourses: 'Cours gratuits',
    premiumMasterclasses: 'Masterclasses premium',
    modules: 'modules',
    continueCta: 'Continuer',
    sourceLabel: { free: 'Gratuit', purchase: 'Acheté', pass: 'Academy Pass', grant: 'Accordé' },
  },
  de: {
    accountKicker: 'Ihr Konto',
    signOut: 'Abmelden',
    passKicker: 'Academy Pass',
    passActiveTitle: 'Pass aktiv',
    passInactiveTitle: 'Unbegrenzter Zugang zu allen Masterclasses',
    active: 'Aktiv',
    cancelsOn: (d) => `Endet am ${d}`,
    renewsOn: (d) => `Verlängerung am ${d}`,
    lifetime: 'Lebenslanger Zugang — keine Verlängerung erforderlich.',
    manageSub: 'Abonnement verwalten',
    passPitch: 'Sechs Premium-Masterclasses, sechs Zertifikate, lebenslanger Zugang, private Q&A-Community.',
    seePass: 'Pass ansehen',
    coursesKicker: 'Ihre Kurse',
    continueLearning: 'Setzen Sie das Lernen fort',
    noCourses: 'Noch keine Kurse',
    emptyBody:
      'Sie haben noch keine Kurse gebucht. Beginnen Sie mit einem kostenlosen Einführungskurs oder entdecken Sie die Premium-Masterclasses.',
    freeCourses: 'Kostenlose Kurse',
    premiumMasterclasses: 'Premium-Masterclasses',
    modules: 'Module',
    continueCta: 'Weiter',
    sourceLabel: { free: 'Kostenlos', purchase: 'Gekauft', pass: 'Academy Pass', grant: 'Gewährt' },
  },
  it: {
    accountKicker: 'Il suo account',
    signOut: 'Esci',
    passKicker: 'Academy Pass',
    passActiveTitle: 'Pass attivo',
    passInactiveTitle: 'Accesso illimitato a tutte le masterclass',
    active: 'Attivo',
    cancelsOn: (d) => `Termina il ${d}`,
    renewsOn: (d) => `Si rinnova il ${d}`,
    lifetime: 'Accesso a vita — nessun rinnovo necessario.',
    manageSub: 'Gestisci l’abbonamento',
    passPitch:
      'Sei masterclass premium, sei certificati, accesso a vita, community privata di domande e risposte.',
    seePass: 'Scopri il Pass',
    coursesKicker: 'I suoi corsi',
    continueLearning: 'Continui a imparare',
    noCourses: 'Ancora nessun corso',
    emptyBody:
      'Non ha ancora alcun corso. Inizi con un corso introduttivo gratuito o esplori le masterclass premium.',
    freeCourses: 'Corsi gratuiti',
    premiumMasterclasses: 'Masterclass premium',
    modules: 'moduli',
    continueCta: 'Continua',
    sourceLabel: { free: 'Gratuito', purchase: 'Acquistato', pass: 'Academy Pass', grant: 'Concesso' },
  },
  es: {
    accountKicker: 'Su cuenta',
    signOut: 'Cerrar sesión',
    passKicker: 'Academy Pass',
    passActiveTitle: 'Pass activo',
    passInactiveTitle: 'Acceso ilimitado a todas las masterclasses',
    active: 'Activo',
    cancelsOn: (d) => `Se cancela el ${d}`,
    renewsOn: (d) => `Se renueva el ${d}`,
    lifetime: 'Acceso de por vida — sin renovación.',
    manageSub: 'Gestionar suscripción',
    passPitch:
      'Seis masterclasses premium, seis certificados, acceso de por vida, comunidad privada de preguntas y respuestas.',
    seePass: 'Ver el Pass',
    coursesKicker: 'Sus cursos',
    continueLearning: 'Continúe aprendiendo',
    noCourses: 'Aún no hay cursos',
    emptyBody:
      'Todavía no tiene ningún curso. Empiece con un curso de introducción gratuito o explore las masterclasses premium.',
    freeCourses: 'Cursos gratuitos',
    premiumMasterclasses: 'Masterclasses premium',
    modules: 'módulos',
    continueCta: 'Continuar',
    sourceLabel: { free: 'Gratis', purchase: 'Comprado', pass: 'Academy Pass', grant: 'Concedido' },
  },
};

function formatDate(value: string | null, locale: Locale) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
}

export function AccountPage({ user, enrolledCourses, passSubscription }: Props) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const hasActivePass = passSubscription?.status === 'active';

  const handleOpenPortal = async () => {
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    if (!res.ok) return;
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <main className="page-shell" id="top">
      <SiteNav />

      <section className="account-hero section">
        <div className="container account-hero-shell">
          <div className="account-hero-identity">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="account-hero-avatar" src={user.avatarUrl} alt="" />
            ) : (
              <div className="account-hero-avatar account-hero-avatar-placeholder" aria-hidden="true">
                {(user.fullName || user.email).slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="section-kicker">{t.accountKicker}</p>
              <h1 className="account-hero-title">{user.fullName ?? user.email}</h1>
              <p className="account-hero-sub">{user.email}</p>
            </div>
          </div>
          <form action="/api/auth/sign-out" method="post">
            <button type="submit" className="button button-light account-signout">
              {t.signOut}
            </button>
          </form>
        </div>
      </section>

      <section className="account-pass section">
        <div className="container">
          <header className="account-section-head">
            <p className="section-kicker">{t.passKicker}</p>
            <h2>{hasActivePass ? t.passActiveTitle : t.passInactiveTitle}</h2>
          </header>
          {hasActivePass ? (
            <div className="account-pass-card">
              <div>
                <p className="account-pass-status">{t.active}</p>
                {passSubscription?.currentPeriodEnd ? (
                  <p className="account-pass-detail">
                    {passSubscription?.cancelAt
                      ? t.cancelsOn(formatDate(passSubscription.cancelAt, locale) ?? '')
                      : t.renewsOn(formatDate(passSubscription.currentPeriodEnd, locale) ?? '')}
                  </p>
                ) : (
                  <p className="account-pass-detail">{t.lifetime}</p>
                )}
              </div>
              <button type="button" className="button button-light" onClick={handleOpenPortal}>
                {t.manageSub}
              </button>
            </div>
          ) : (
            <div className="account-pass-card">
              <div>
                <p className="account-pass-detail">{t.passPitch}</p>
              </div>
              <a className="button button-accent" href="/academy#bundle">
                {t.seePass} →
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="account-courses section">
        <div className="container">
          <header className="account-section-head">
            <p className="section-kicker">{t.coursesKicker}</p>
            <h2>{enrolledCourses.length > 0 ? t.continueLearning : t.noCourses}</h2>
          </header>
          {enrolledCourses.length === 0 ? (
            <div className="account-empty">
              <p>{t.emptyBody}</p>
              <div className="account-empty-actions">
                <a className="button button-dark" href="/academy#free">
                  {t.freeCourses}
                </a>
                <a className="button button-accent" href="/academy#premium">
                  {t.premiumMasterclasses}
                </a>
              </div>
            </div>
          ) : (
            <ul className="account-course-list">
              {enrolledCourses.map((course) => (
                <li key={course.slug} className="account-course-card">
                  <div className="account-course-meta">
                    <span className="account-course-source">{t.sourceLabel[course.source]}</span>
                    <span className="account-course-duration">
                      {course.duration} · {course.modules} {t.modules}
                    </span>
                  </div>
                  <h3 className="account-course-title">
                    <a href={`/academy/${course.slug}`}>{course.title}</a>
                  </h3>
                  <a className="account-course-cta" href={`/academy/${course.slug}`}>
                    {t.continueCta} <span aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
