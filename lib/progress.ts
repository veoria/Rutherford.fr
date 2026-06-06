import { createSupabaseServerClient } from '@/lib/supabase/server';

export type ProgressRow = {
  course_slug: string;
  lesson_index: number;
  completed_at: string;
};

/** All of a user's completed-module rows (RLS scopes this to themselves). */
export async function getUserProgress(userId: string): Promise<ProgressRow[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('course_progress')
    .select('course_slug, lesson_index, completed_at')
    .eq('user_id', userId);
  return (data ?? []) as ProgressRow[];
}

/** Completed lesson indices grouped by course slug, each sorted ascending. */
export function completedByCourse(rows: ProgressRow[]): Record<string, number[]> {
  const map: Record<string, number[]> = {};
  for (const row of rows) {
    (map[row.course_slug] ??= []).push(row.lesson_index);
  }
  for (const slug of Object.keys(map)) map[slug].sort((a, b) => a - b);
  return map;
}

/** Latest completion timestamp per course (ISO string), for certificate dates. */
export function lastCompletionByCourse(rows: ProgressRow[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const row of rows) {
    if (!map[row.course_slug] || row.completed_at > map[row.course_slug]) {
      map[row.course_slug] = row.completed_at;
    }
  }
  return map;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Current daily streak: consecutive UTC days with at least one completed
 * module, counted back from today (or yesterday, so a streak survives until the
 * end of the next day). Returns 0 when there is no recent activity.
 */
export function currentStreak(rows: ProgressRow[], now: Date = new Date()): number {
  if (rows.length === 0) return 0;
  const days = new Set(rows.map((row) => row.completed_at.slice(0, 10)));
  const today = isoDay(now);
  const yesterday = isoDay(new Date(now.getTime() - DAY_MS));

  let cursor: Date;
  if (days.has(today)) cursor = new Date(`${today}T00:00:00.000Z`);
  else if (days.has(yesterday)) cursor = new Date(`${yesterday}T00:00:00.000Z`);
  else return 0;

  let streak = 0;
  while (days.has(isoDay(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}
