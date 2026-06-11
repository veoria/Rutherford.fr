import { getQuizForCourse } from '@/data/academy-quizzes';

// SERVER-ONLY scoring. Imports the answer key from data/academy-quizzes, so it
// must never be pulled into a client bundle.

export type QuizResultItem = {
  id: string;
  correct: number[];
  your: number[];
  isCorrect: boolean;
  explanation: string;
  moduleRef?: number;
};

export type QuizResult = {
  score: number;
  total: number;
  passed: boolean;
  results: QuizResultItem[];
};

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

/**
 * Grade a submission against the course's answer key. Returns null when the
 * course has no assessment. Unknown / out-of-range option indices are ignored.
 */
export function scoreQuiz(courseSlug: string, answers: Record<string, number[]>): QuizResult | null {
  const quiz = getQuizForCourse(courseSlug);
  if (!quiz) return null;

  const results: QuizResultItem[] = quiz.questions.map((q) => {
    const raw = Array.isArray(answers[q.id]) ? answers[q.id] : [];
    const your = raw.filter((n) => Number.isInteger(n) && n >= 0 && n < q.options.length);
    return {
      id: q.id,
      correct: q.correct,
      your,
      isCorrect: sameSet(your, q.correct),
      explanation: q.explanation,
      moduleRef: q.moduleRef,
    };
  });

  const score = results.filter((r) => r.isCorrect).length;
  const total = quiz.questions.length;
  const passed = total > 0 && score / total >= quiz.passThreshold;
  return { score, total, passed, results };
}
