import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { AccountPage } from '@/components/account-page';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { ALL_COURSES, FREE_COURSES } from '@/data/academy-courses';
import { getLessonsForCourse } from '@/data/academy-lessons';
import {
  bestStreakFromDays,
  completedByCourse,
  currentStreakFromDays,
  isoDayUTC,
  lastCompletionByCourse,
  type ProgressRow,
} from '@/lib/progress';
import { courseHasQuiz } from '@/data/academy-quizzes';

export const metadata: Metadata = {
  title: 'Your Academy | Rutherford Academy',
};

// Fallback word for an untitled module in the "continue where you left off"
// hero, keyed by the middleware's x-locale header.
const MODULE_WORD: Record<string, string> = {
  en: 'Module', fr: 'Module', de: 'Modul', it: 'Modulo', es: 'Módulo', pt: 'Módulo',
};

export const dynamic = 'force-dynamic';

export default async function AccountAcademyRoute() {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/account/sign-in?next=/account/academy');
  }

  // Pull enrollments + pass subscription + per-module progress + assessment attempts
  const [
    { data: enrollments },
    { data: passSub },
    { data: profile },
    { data: progressRows },
    { data: quizAttempts },
  ] = await Promise.all([
    supabase
      .from('user_course_access')
      .select('course_slug, source, granted_at, expires_at')
      .eq('user_id', user.id),
    supabase
      .from('pass_subscriptions')
      .select('status, current_period_end, cancel_at')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('full_name, avatar_url, country, company, job_title, onboarded_at')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('course_progress')
      .select('course_slug, lesson_index, completed_at')
      .eq('user_id', user.id),
    supabase
      .from('quiz_attempts')
      .select('course_slug, score, total, passed, created_at')
      .eq('user_id', user.id),
  ]);

  // Lead-capture gate: finish onboarding before the academy dashboard.
  if (!isOnboarded(profile)) {
    redirect('/account/onboarding?next=/account/academy');
  }

  const rows = (progressRows ?? []) as ProgressRow[];
  const doneByCourse = completedByCourse(rows);
  const lastByCourse = lastCompletionByCourse(rows);

  // Aggregate assessment attempts per course: best score + whether/when passed.
  type QuizRow = { course_slug: string; score: number; total: number; passed: boolean; created_at: string };
  const quizByCourse: Record<string, { passed: boolean; best: { score: number; total: number } | null; passedAt: string | null }> = {};
  for (const r of (quizAttempts ?? []) as QuizRow[]) {
    const cur = quizByCourse[r.course_slug] ?? { passed: false, best: null, passedAt: null };
    if (r.passed) {
      cur.passed = true;
      if (!cur.passedAt || r.created_at < cur.passedAt) cur.passedAt = r.created_at;
    }
    if (r.total > 0 && (!cur.best || r.score / r.total > cur.best.score / cur.best.total)) {
      cur.best = { score: r.score, total: r.total };
    }
    quizByCourse[r.course_slug] = cur;
  }

  // Daily-habit signals from "activity" events: a completed module = 10 XP, a
  // passed assessment = 50 XP. Drives the streak, daily goal and weekly chart.
  const XP_MODULE = 10;
  const XP_QUIZ = 50;
  const xpByDay = new Map<string, number>();
  const addXp = (iso: string, xp: number) => xpByDay.set(iso, (xpByDay.get(iso) ?? 0) + xp);
  for (const r of rows) addXp(r.completed_at.slice(0, 10), XP_MODULE);
  for (const r of (quizAttempts ?? []) as QuizRow[]) if (r.passed) addXp(r.created_at.slice(0, 10), XP_QUIZ);

  const activeDaySet = new Set(xpByDay.keys());
  const now = new Date();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const streak = currentStreakFromDays(activeDaySet, now);
  const streakBest = bestStreakFromDays(activeDaySet);
  const todayXp = xpByDay.get(isoDayUTC(now)) ?? 0;
  const dailyGoalXp = 20;
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const iso = isoDayUTC(new Date(now.getTime() - (6 - i) * DAY_MS));
    return { iso, xp: xpByDay.get(iso) ?? 0 };
  });
  const cutoff = isoDayUTC(new Date(now.getTime() - 59 * DAY_MS));
  const activeDays = [...activeDaySet].filter((d) => d >= cutoff).sort();

  // The learner's library = the always-free intro courses (any onboarded user
  // can watch them, even without an enrollment row) plus the premium courses
  // they have unlocked through a purchase or active pass.
  const freeSlugs = new Set(FREE_COURSES.map((c) => c.id));
  const accessRowBySlug = new Map((enrollments ?? []).map((row) => [row.course_slug as string, row]));

  const enrolledCourses = ALL_COURSES.filter(
    (course) => freeSlugs.has(course.id) || accessRowBySlug.has(course.id)
  ).map((course) => {
    const row = accessRowBySlug.get(course.id);
    const done = (doneByCourse[course.id] ?? []).filter((i) => i >= 0 && i < course.modules);
    const completedCount = done.length;
    const isComplete = course.modules > 0 && completedCount >= course.modules;

    // A course with a final assessment is certified by passing it; a course
    // without one falls back to "all modules complete".
    const hasQuiz = courseHasQuiz(course.id);
    const q = quizByCourse[course.id];
    const quizPassed = Boolean(q?.passed);
    const certified = hasQuiz ? quizPassed : isComplete;
    const certifiedAt = hasQuiz
      ? q?.passedAt ?? null
      : isComplete
        ? lastByCourse[course.id] ?? null
        : null;

    return {
      slug: course.id,
      title: course.title,
      duration: course.duration,
      modules: course.modules,
      tone: course.tone,
      source: (row?.source as 'free' | 'purchase' | 'pass' | 'grant') ?? 'free',
      grantedAt: (row?.granted_at as string) ?? '',
      expiresAt: (row?.expires_at as string | null) ?? null,
      completedCount,
      completedAt: isComplete ? lastByCourse[course.id] ?? null : null,
      certificateLabel: course.certificate ?? null,
      hasQuiz,
      quizPassed,
      quizScore: q?.best?.score ?? null,
      quizTotal: q?.best?.total ?? null,
      certified,
      certifiedAt,
    };
  });

  // "Continue where you left off": first library course with an unfinished module.
  const moduleWord = MODULE_WORD[headers().get('x-locale') ?? 'en'] ?? 'Module';
  let resume: { slug: string; title: string; moduleIndex: number; moduleTitle: string } | null = null;
  for (const course of enrolledCourses) {
    if (course.completedCount >= course.modules) continue;
    const done = new Set(doneByCourse[course.slug] ?? []);
    let nextIndex = 0;
    while (nextIndex < course.modules && done.has(nextIndex)) nextIndex += 1;
    const lessons = getLessonsForCourse(course.slug);
    resume = {
      slug: course.slug,
      title: course.title,
      moduleIndex: nextIndex,
      moduleTitle: lessons?.[nextIndex]?.title ?? `${moduleWord} ${nextIndex + 1}`,
    };
    break;
  }

  return (
    <AccountPage
      user={{
        email: user.email ?? '',
        fullName: profile?.full_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      }}
      enrolledCourses={enrolledCourses}
      passSubscription={
        passSub
          ? {
              status: passSub.status as 'active' | 'past_due' | 'canceled' | 'incomplete',
              currentPeriodEnd: passSub.current_period_end as string | null,
              cancelAt: passSub.cancel_at as string | null,
            }
          : null
      }
      streak={streak}
      streakBest={streakBest}
      daily={{ goalXp: dailyGoalXp, todayXp }}
      weekly={weekly}
      activeDays={activeDays}
      resume={resume}
      catalog={{ total: ALL_COURSES.length, freeSlugs: FREE_COURSES.map((c) => c.id) }}
    />
  );
}
