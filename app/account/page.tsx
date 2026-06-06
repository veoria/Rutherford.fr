import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { AccountPage } from '@/components/account-page';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { ALL_COURSES, FREE_COURSES } from '@/data/academy-courses';
import { completedByCourse, currentStreak, lastCompletionByCourse, type ProgressRow } from '@/lib/progress';

export const metadata: Metadata = {
  title: 'Your account — Rutherford Academy',
};

export const dynamic = 'force-dynamic';

export default async function AccountRoute() {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/account/sign-in?next=/account');
  }

  // Pull enrollments + pass subscription + per-module progress
  const [{ data: enrollments }, { data: passSub }, { data: profile }, { data: progressRows }] =
    await Promise.all([
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
    ]);

  // Lead-capture gate: finish onboarding before the account dashboard.
  if (!isOnboarded(profile)) {
    redirect('/account/onboarding?next=/account');
  }

  const rows = (progressRows ?? []) as ProgressRow[];
  const doneByCourse = completedByCourse(rows);
  const lastByCourse = lastCompletionByCourse(rows);
  const streak = currentStreak(rows);

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
    };
  });

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
      catalog={{ total: ALL_COURSES.length, freeSlugs: FREE_COURSES.map((c) => c.id) }}
    />
  );
}
