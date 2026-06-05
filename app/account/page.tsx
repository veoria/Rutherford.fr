import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { AccountPage } from '@/components/account-page';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { ALL_COURSES } from '@/data/academy-courses';

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

  // Pull enrollments + pass subscription
  const [{ data: enrollments }, { data: passSub }, { data: profile }] = await Promise.all([
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
  ]);

  // Lead-capture gate: finish onboarding before the account dashboard.
  if (!isOnboarded(profile)) {
    redirect('/account/onboarding?next=/account');
  }

  const enrolledCourses = (enrollments ?? [])
    .map((row) => {
      const course = ALL_COURSES.find((c) => c.id === row.course_slug);
      if (!course) return null;
      return {
        slug: course.id,
        title: course.title,
        duration: course.duration,
        modules: course.modules,
        tone: course.tone,
        source: row.source as 'free' | 'purchase' | 'pass' | 'grant',
        grantedAt: row.granted_at as string,
        expiresAt: row.expires_at as string | null,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

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
    />
  );
}
