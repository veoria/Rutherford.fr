// Final-assessment (QCM) content for Rutherford Academy.
//
// SERVER-ONLY: this file contains the correct answers. Never import it from a
// 'use client' module — the browser must only ever receive the sanitized
// PublicQuiz (see toPublicQuiz), and scoring happens server-side so a pass
// cannot be forged. Questions are written in English to match the (English)
// lesson content; the surrounding UI chrome is localized separately.

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  /** Indices of the correct option(s). Length > 1 means multiple correct. */
  correct: number[];
  explanation: string;
  /** 1-based module this question relates to, for "review the module" links. */
  moduleRef?: number;
};

export type CourseQuiz = {
  /** Fraction of questions required to pass, 0..1. */
  passThreshold: number;
  questions: QuizQuestion[];
};

/** Question shape safe to ship to the browser (no answers, no explanations). */
export type PublicQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  multiple: boolean;
  moduleRef?: number;
};

export type PublicQuiz = {
  passThreshold: number;
  questions: PublicQuizQuestion[];
};

export const COURSE_QUIZZES: Record<string, CourseQuiz> = {
  // Pilot — "Offset Color Management Fundamentals" (free, 5 modules).
  fundamentals: {
    passThreshold: 0.8,
    questions: [
      {
        id: 'q1',
        prompt: 'On a production press, what is the most defensible definition of "good color"?',
        options: [
          'Whatever the operator on shift approves by eye',
          'A measured match to a target, within a defined ΔE tolerance, verified by a measurement device',
          'The densest sheet the press is able to produce',
          'Whatever the brand owner accepted on the previous job',
        ],
        correct: [1],
        explanation:
          'Good color must be anchored to a target, carry a ΔE tolerance, and be verified by measurement — not by subjective operator approval, which changes with the person and the shift.',
        moduleRef: 1,
      },
      {
        id: 'q2',
        prompt:
          'ISO 12647-2 — the part brand owners usually cite for packaging — covers which process, and what does it define?',
        options: [
          'Flexo; it defines anilox volumes',
          'Sheetfed offset; it defines paper classes (PT1–PT5), TVI curves and CIELAB aim points',
          'Digital toner; it defines screening angles',
          'Gravure; it defines cylinder engraving depths',
        ],
        correct: [1],
        explanation:
          '12647-2 is the offset part. It defines paper classes PT1–PT5, target tonal value increase (TVI) curves, and CIELAB aim points for the solids.',
        moduleRef: 2,
      },
      {
        id: 'q3',
        prompt:
          'Which measurement condition uses a D50 illuminant with the UV component included, and is the modern default for papers with optical brighteners?',
        options: ['M0', 'M1', 'M2', 'M3'],
        correct: [1],
        explanation:
          'M1 (D50, UV included, per ISO 13655) is the modern default and the right choice for OBA-containing stock. M0 is legacy tungsten, M2 excludes UV, and M3 is polarized.',
        moduleRef: 3,
      },
      {
        id: 'q4',
        prompt: 'Why is the M3 (polarized) condition useful when reading a sheet during the run?',
        options: [
          'It adds UV to exaggerate optical brighteners',
          'It removes surface gloss, so wet ink reads closer to how it will read dry',
          'It is the only condition brand owners will accept',
          'It measures faster than the other conditions',
        ],
        correct: [1],
        explanation:
          'M3 is polarized: it removes surface gloss, which is why it is handy on wet ink during the run. It typically reads a higher density than M0/M1/M2.',
        moduleRef: 3,
      },
      {
        id: 'q5',
        prompt: 'On the press floor, which of these statements are correct? (Select all that apply.)',
        options: [
          'Operators work in density because it responds directly to ink-key movement',
          'ΔE00 (CIEDE2000) is the modern color-difference metric cited in brand specifications',
          'Density and ΔE are the same measurement under two different names',
          'ΔE 1976 is preferred over ΔE00 for modern tolerances',
        ],
        correct: [0, 1],
        explanation:
          'Density drives ink-key decisions; ΔE00 is the perceptually-correlated metric brand owners specify. They are different things, and ΔE00 superseded the older ΔE 1976.',
        moduleRef: 4,
      },
      {
        id: 'q6',
        prompt: 'What is the anchor of the G7 calibration methodology?',
        options: [
          'Maximum solid ink density',
          'Gray balance and the neutral print density curve',
          "The brand owner's PANTONE book",
          'Dot gain on the yellow channel only',
        ],
        correct: [1],
        explanation:
          'G7 is anchored on gray balance: if the CMY grays neutralize and the neutral density curve matches target, the rest of the gamut follows. It is process-agnostic.',
        moduleRef: 5,
      },
    ],
  },
};

export function getQuizForCourse(slug: string): CourseQuiz | undefined {
  return COURSE_QUIZZES[slug];
}

export function courseHasQuiz(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(COURSE_QUIZZES, slug);
}

/** Strip answers/explanations so the question set is safe to send to the client. */
export function toPublicQuiz(quiz: CourseQuiz): PublicQuiz {
  return {
    passThreshold: quiz.passThreshold,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      multiple: q.correct.length > 1,
      moduleRef: q.moduleRef,
    })),
  };
}
