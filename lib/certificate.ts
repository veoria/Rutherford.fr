import type { SupabaseClient } from '@supabase/supabase-js';
import type { AcademyCourse } from '@/data/academy-courses';
import { getLessonsForCourse } from '@/data/academy-lessons';
import { courseHasQuiz } from '@/data/academy-quizzes';

/** Stable, deterministic certificate reference from the user + course. */
export function certReference(userId: string, slug: string): string {
  const seed = `${userId}:${slug}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (Math.imul(hash, 31) + seed.charCodeAt(i)) >>> 0;
  const code = hash.toString(36).toUpperCase().padStart(6, '0').slice(-6);
  const initials = slug.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase();
  return `RA-${initials}-${code}`;
}

export type Certification = {
  certified: boolean;
  issuedDate: string | null;
  scorePct: number | null;
};

/**
 * Whether the user has earned the course certificate, and when. A course with a
 * final assessment is certified by passing it; a course without one falls back
 * to "every module complete". Shared by the certificate page and the PDF route.
 */
export async function resolveCertification(
  supabase: SupabaseClient,
  userId: string,
  course: AcademyCourse
): Promise<Certification> {
  if (courseHasQuiz(course.id)) {
    const { data } = await supabase
      .from('quiz_attempts')
      .select('score, total, passed, created_at')
      .eq('user_id', userId)
      .eq('course_slug', course.id);
    const rows = (data ?? []) as { score: number; total: number; passed: boolean; created_at: string }[];
    const passed = rows.filter((r) => r.passed);
    if (passed.length === 0) return { certified: false, issuedDate: null, scorePct: null };
    const issuedDate = passed.reduce<string | null>(
      (min, r) => (!min || r.created_at < min ? r.created_at : min),
      null
    );
    let best = 0;
    for (const r of rows) if (r.total > 0) best = Math.max(best, r.score / r.total);
    return { certified: true, issuedDate, scorePct: Math.round(best * 100) };
  }

  const total = getLessonsForCourse(course.id)?.length ?? course.modules;
  const { data } = await supabase
    .from('course_progress')
    .select('lesson_index, completed_at')
    .eq('user_id', userId)
    .eq('course_slug', course.id);
  const rows = (data ?? []) as { lesson_index: number; completed_at: string }[];
  const done = new Set(rows.filter((r) => r.lesson_index >= 0 && r.lesson_index < total).map((r) => r.lesson_index));
  if (total <= 0 || done.size < total) return { certified: false, issuedDate: null, scorePct: null };
  const issuedDate = rows.reduce<string | null>(
    (max, r) => (!max || r.completed_at > max ? r.completed_at : max),
    null
  );
  return { certified: true, issuedDate, scorePct: null };
}
