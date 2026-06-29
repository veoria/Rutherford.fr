'use client';

import { useCallback, useEffect, useState } from 'react';
import { type Locale, useLanguage } from '@/components/language-provider';
import type { AppModule, AppStep } from '@/data/academy-app';
import { AcademyIllustration } from '@/components/academy-illustration';

type PlayerCopy = {
  exit: string;
  back: string;
  cont: string;
  validate: string;
  tryAgain: string;
  moduleValidated: (num: string) => string;
  nextUnlocked: string;
  courseComplete: string;
  startNext: (num: string) => string;
  finish: string;
  stepCounter: (cur: number, total: number) => string;
  moduleLabel: (num: string) => string;
  captureLabel: string;
  captureHint: string;
};

const PLAYER_COPY: Record<Locale, PlayerCopy> = {
  en: {
    exit: 'Exit',
    back: 'Back',
    cont: 'Continue',
    validate: 'Validate module',
    tryAgain: 'Try again.',
    moduleValidated: (n) => `Module ${n} validated`,
    nextUnlocked: 'The next module is unlocked. Keep going or come back later — your progress is saved.',
    courseComplete: 'Course complete — back to the course for your assessment and certificate.',
    startNext: (n) => `Start module ${n}`,
    finish: 'Finish',
    stepCounter: (cur, total) => `${cur}/${total}`,
    moduleLabel: (n) => `Module ${n}`,
    captureLabel: 'Product capture to insert',
    captureHint: 'see Captures-Requises.md',
  },
  fr: {
    exit: 'Quitter',
    back: 'Retour',
    cont: 'Continuer',
    validate: 'Valider le module',
    tryAgain: 'Réessayez.',
    moduleValidated: (n) => `Module ${n} validé`,
    nextUnlocked: 'Le module suivant est déverrouillé. Continuez ou revenez plus tard — votre progression est enregistrée.',
    courseComplete: 'Cours terminé — retournez au cours pour l’évaluation et le certificat.',
    startNext: (n) => `Démarrer le module ${n}`,
    finish: 'Terminer',
    stepCounter: (cur, total) => `${cur}/${total}`,
    moduleLabel: (n) => `Module ${n}`,
    captureLabel: 'Capture produit à insérer',
    captureHint: 'voir Captures-Requises.md',
  },
  de: {
    exit: 'Schließen',
    back: 'Zurück',
    cont: 'Weiter',
    validate: 'Modul bestätigen',
    tryAgain: 'Erneut versuchen.',
    moduleValidated: (n) => `Modul ${n} bestätigt`,
    nextUnlocked: 'Das nächste Modul ist freigeschaltet. Weiter so oder später zurückkommen — Ihr Fortschritt ist gespeichert.',
    courseComplete: 'Kurs abgeschlossen — zurück zum Kurs für Prüfung und Zertifikat.',
    startNext: (n) => `Modul ${n} starten`,
    finish: 'Fertig',
    stepCounter: (cur, total) => `${cur}/${total}`,
    moduleLabel: (n) => `Modul ${n}`,
    captureLabel: 'Produktaufnahme einzufügen',
    captureHint: 'siehe Captures-Requises.md',
  },
  it: {
    exit: 'Esci',
    back: 'Indietro',
    cont: 'Continua',
    validate: 'Convalida il modulo',
    tryAgain: 'Riprovi.',
    moduleValidated: (n) => `Modulo ${n} convalidato`,
    nextUnlocked: 'Il modulo successivo è sbloccato. Continui o torni più tardi — i suoi progressi sono salvati.',
    courseComplete: 'Corso completato — torni al corso per la valutazione e il certificato.',
    startNext: (n) => `Inizia il modulo ${n}`,
    finish: 'Termina',
    stepCounter: (cur, total) => `${cur}/${total}`,
    moduleLabel: (n) => `Modulo ${n}`,
    captureLabel: 'Acquisizione prodotto da inserire',
    captureHint: 'vedi Captures-Requises.md',
  },
  es: {
    exit: 'Salir',
    back: 'Atrás',
    cont: 'Continuar',
    validate: 'Validar el módulo',
    tryAgain: 'Inténtelo de nuevo.',
    moduleValidated: (n) => `Módulo ${n} validado`,
    nextUnlocked: 'El siguiente módulo está desbloqueado. Siga o vuelva más tarde — su progreso está guardado.',
    courseComplete: 'Curso completado — vuelva al curso para la evaluación y el certificado.',
    startNext: (n) => `Empezar el módulo ${n}`,
    finish: 'Finalizar',
    stepCounter: (cur, total) => `${cur}/${total}`,
    moduleLabel: (n) => `Módulo ${n}`,
    captureLabel: 'Captura de producto por insertar',
    captureHint: 'ver Captures-Requises.md',
  },
  pt: {
    exit: 'Sair',
    back: 'Voltar',
    cont: 'Continuar',
    validate: 'Validar o módulo',
    tryAgain: 'Tente novamente.',
    moduleValidated: (n) => `Módulo ${n} validado`,
    nextUnlocked: 'O módulo seguinte está desbloqueado. Continue ou volte mais tarde. O seu progresso fica guardado.',
    courseComplete: 'Curso concluído. Volte ao curso para a avaliação e o certificado.',
    startNext: (n) => `Iniciar o módulo ${n}`,
    finish: 'Terminar',
    stepCounter: (cur, total) => `${cur}/${total}`,
    moduleLabel: (n) => `Módulo ${n}`,
    captureLabel: 'Captura de produto a inserir',
    captureHint: 'ver Captures-Requises.md',
  },
};

type AcademyPlayerProps = {
  courseTitle: string;
  modules: AppModule[];
  /** Module indices already validated (server-side completion). */
  completedModules: number[];
  /** Module to open on mount. */
  startModule?: number;
  onClose: () => void;
  /**
   * Called when a module's last step is validated. The parent persists it via
   * POST /api/account/progress and fires palier/XP celebrations.
   */
  onModuleComplete: (moduleIndex: number) => void;
};

export function AcademyPlayer({
  courseTitle,
  modules,
  completedModules,
  startModule = 0,
  onClose,
  onModuleComplete,
}: AcademyPlayerProps) {
  const { locale } = useLanguage();
  const t = PLAYER_COPY[locale] ?? PLAYER_COPY.en;

  const [moduleIndex, setModuleIndex] = useState(startModule);
  // step === module.steps.length is the "module validated" screen.
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answeredOk, setAnsweredOk] = useState(false);
  // Modules validated during this player session (drives segment fill live).
  const [doneThisSession, setDoneThisSession] = useState<Set<number>>(new Set());

  const mod = modules[moduleIndex];
  const stepCount = mod.steps.length;
  const onDoneScreen = step >= stepCount;
  const current: AppStep | undefined = onDoneScreen ? undefined : mod.steps[step];
  const isLastStep = step === stepCount - 1;
  const isLastModule = moduleIndex === modules.length - 1;

  const isModuleDone = useCallback(
    (i: number) => completedModules.includes(i) || doneThisSession.has(i),
    [completedModules, doneThisSession]
  );

  const resetStepState = useCallback(() => {
    setPicked(null);
    setAnsweredOk(false);
  }, []);

  const pick = useCallback(
    (optionIndex: number) => {
      if (!current?.quiz || answeredOk) return;
      setPicked(optionIndex);
      if (optionIndex === current.quiz.answer) setAnsweredOk(true);
    },
    [current, answeredOk]
  );

  const goNext = useCallback(() => {
    if (onDoneScreen) {
      if (isLastModule) {
        onClose();
        return;
      }
      setModuleIndex((i) => i + 1);
      setStep(0);
      resetStepState();
      return;
    }
    // A step with a quiz is gated until answered correctly.
    if (current?.quiz && !answeredOk) return;
    if (isLastStep) {
      if (!isModuleDone(moduleIndex)) {
        setDoneThisSession((prev) => new Set(prev).add(moduleIndex));
        onModuleComplete(moduleIndex);
      }
      setStep(stepCount); // reveal the module-validated screen
    } else {
      setStep((s) => s + 1);
      resetStepState();
    }
  }, [
    onDoneScreen,
    isLastModule,
    onClose,
    current,
    answeredOk,
    isLastStep,
    isModuleDone,
    moduleIndex,
    onModuleComplete,
    stepCount,
    resetStepState,
  ]);

  const goBack = useCallback(() => {
    if (step === 0) return;
    setStep((s) => Math.min(s, stepCount) - 1);
    resetStepState();
    // Re-entering a previously answered quiz: treat as already answered so the
    // learner is not re-gated when stepping backward then forward.
    setAnsweredOk(true);
  }, [step, stepCount, resetStepState]);

  const nextDisabled = !onDoneScreen && Boolean(current?.quiz) && !answeredOk;

  // Keyboard navigation: Esc closes, arrows page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') {
        if (!nextDisabled) goNext();
      } else if (e.key === 'ArrowLeft') goBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, goNext, goBack, nextDisabled]);

  // Lock body scroll while the fullscreen player is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="academy-player" role="dialog" aria-modal="true" aria-label={courseTitle}>
      <div className="academy-player-top">
        <button type="button" className="academy-player-exit" onClick={onClose}>
          ✕&nbsp;{t.exit}
        </button>
        <div className="academy-player-crumbs">
          Academy · <b>{courseTitle}</b>
        </div>
        <div className="academy-player-chip">{t.moduleLabel(mod.num)}</div>
      </div>

      <div className="academy-player-body">
        <div className="academy-player-inner" key={`${moduleIndex}-${step}`}>
          {onDoneScreen ? (
            <div className="academy-player-done">
              <div className="academy-player-badge" aria-hidden="true">
                ✓
              </div>
              <h3>{t.moduleValidated(mod.num)}</h3>
              <p>{isLastModule ? t.courseComplete : t.nextUnlocked}</p>
            </div>
          ) : current ? (
            <>
              <div className="academy-player-lead">{current.kicker}</div>
              <h3 className="academy-player-headline">{current.headline}</h3>
              {current.paragraphs.map((para, i) => (
                // Trusted, static course copy (inline <b>/<i> only).
                <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
              ))}
              {current.illustration ? <AcademyIllustration name={current.illustration} /> : null}
              {current.capture ? (
                <div className="academy-capture" role="note">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="7" width="18" height="13" rx="3" />
                    <circle cx="12" cy="13.5" r="4" />
                    <path d="M8.5 7l1.2-2.4h4.6L15.5 7" />
                  </svg>
                  <b>{t.captureLabel}</b>
                  <span>{current.capture}</span>
                  <span className="academy-capture-hint">{t.captureHint}</span>
                </div>
              ) : null}
              {current.quiz ? (
                <div className="academy-player-quiz">
                  <p className="academy-player-q">{current.quiz.q}</p>
                  {current.quiz.options.map((opt, i) => {
                    const isPicked = picked === i;
                    const correct = i === current.quiz!.answer;
                    const cls = answeredOk && correct ? 'is-ok' : isPicked && !correct ? 'is-no' : '';
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`academy-player-opt ${cls}`}
                        onClick={() => pick(i)}
                        disabled={answeredOk}
                      >
                        {opt}
                      </button>
                    );
                  })}
                  {picked !== null ? (
                    answeredOk ? (
                      <div className="academy-player-feedback is-ok">✓ {current.quiz.ok}</div>
                    ) : (
                      <div className="academy-player-feedback is-no">
                        ✗ {current.quiz.no} {t.tryAgain}
                      </div>
                    )
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <div className="academy-player-foot">
        <div className="academy-player-step">
          {t.moduleLabel(mod.num)} · {t.stepCounter(Math.min(step + 1, stepCount + 1), stepCount + 1)}
        </div>
        <div className="academy-player-segs">
          {modules.map((m, i) => {
            const full = isModuleDone(i);
            const fill = full ? 100 : i === moduleIndex && !onDoneScreen ? Math.round((step / stepCount) * 100) : i === moduleIndex ? 100 : 0;
            return (
              <div key={i} className={`academy-player-seg ${full ? 'is-done' : ''}`} title={`${t.moduleLabel(m.num)}`}>
                <i style={{ width: `${fill}%` }} />
              </div>
            );
          })}
        </div>
        <div className="academy-player-nav">
          <button
            type="button"
            className="button button-light academy-player-btn"
            onClick={goBack}
            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
          >
            {t.back}
          </button>
          <button
            type="button"
            className="button button-accent academy-player-btn"
            onClick={goNext}
            disabled={nextDisabled}
          >
            {onDoneScreen ? (isLastModule ? t.finish : t.startNext(modules[moduleIndex + 1].num)) : isLastStep ? t.validate : t.cont}
          </button>
        </div>
      </div>
    </div>
  );
}
