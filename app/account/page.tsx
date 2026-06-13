import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AccountHub, type ResellerClient } from '@/components/account-hub';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { ALL_COURSES } from '@/data/academy-courses';
import { courseHasQuiz } from '@/data/academy-quizzes';
import { getLessonsForCourse } from '@/data/academy-lessons';
import { overallStats, type CourseStat } from '@/lib/gamification';
import { getTeamForUser } from '@/lib/organizations';
import type { AccountType } from '@/data/account-types';

export const metadata: Metadata = {
  title: 'Your account | Rutherford',
};

export const dynamic = 'force-dynamic';

const OPEN_CV = ['submitted', 'in_review', 'changes_requested'];
const HAS_ADMIN = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);

export default async function AccountHubRoute() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/account/sign-in?next=/account');
  }

  const [{ data: profile }, { data: progressRows }, { data: quizAttempts }, { data: ownCv }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, avatar_url, country, company, job_title, onboarded_at, account_type')
        .eq('id', user.id)
        .maybeSingle(),
      supabase.from('course_progress').select('course_slug, lesson_index').eq('user_id', user.id),
      supabase.from('quiz_attempts').select('course_slug, passed').eq('user_id', user.id),
      supabase.from('console_validations').select('status').eq('user_id', user.id),
    ]);

  // Lead-capture gate: complete the profile before the account hub.
  if (!isOnboarded(profile)) {
    redirect('/account/onboarding?next=/account');
  }

  const accountType = ((profile?.account_type as AccountType) ?? 'client') as AccountType;

  // ── Academy progress (shown for every role) ──
  const progress = (progressRows ?? []) as { course_slug: string; lesson_index: number }[];
  const passedSlugs = new Set(
    ((quizAttempts ?? []) as { course_slug: string; passed: boolean }[])
      .filter((q) => q.passed)
      .map((q) => q.course_slug)
  );
  const doneByCourse = new Map<string, Set<number>>();
  for (const r of progress) {
    const set = doneByCourse.get(r.course_slug) ?? new Set<number>();
    set.add(r.lesson_index);
    doneByCourse.set(r.course_slug, set);
  }
  const courseStats: CourseStat[] = ALL_COURSES.map((c) => {
    const done = [...(doneByCourse.get(c.id) ?? [])].filter((i) => i >= 0 && i < c.modules).length;
    const certified = courseHasQuiz(c.id) ? passedSlugs.has(c.id) : c.modules > 0 && done >= c.modules;
    return { completedCount: done, total: c.modules, certified };
  });
  const stats = overallStats(courseStats);

  // "Continue where you left off" — first started-but-unfinished course.
  let resume: { slug: string; title: string; moduleIndex: number; moduleTitle: string } | null = null;
  for (const c of ALL_COURSES) {
    const done = doneByCourse.get(c.id);
    if (!done || done.size === 0 || done.size >= c.modules) continue;
    let next = 0;
    while (next < c.modules && done.has(next)) next += 1;
    const lessons = getLessonsForCourse(c.id);
    resume = {
      slug: c.id,
      title: c.title,
      moduleIndex: next,
      moduleTitle: lessons?.[next]?.title ?? `Module ${next + 1}`,
    };
    break;
  }

  // Own console validations — for the Console Validation tile stat.
  const ownStatuses = ((ownCv ?? []) as { status: string }[]).map((r) => r.status);
  const cvEligible = ownStatuses.filter((s) => s === 'can_be_connected').length;
  const cvOpen = ownStatuses.filter((s) => OPEN_CV.includes(s)).length;

  // Reseller → clients (real, from console_validations.reseller_id). Privileged
  // read scoped to this reseller; the user RLS policy doesn't cover it.
  let resellerClients: ResellerClient[] = [];
  if (accountType === 'reseller' && HAS_ADMIN) {
    try {
      const { data } = await createSupabaseAdminClient()
        .from('console_validations')
        .select('company, country, machine, status, email, created_at')
        .eq('reseller_id', user.id)
        .order('created_at', { ascending: false });
      const byClient = new Map<string, ResellerClient>();
      for (const r of (data ?? []) as {
        company: string | null;
        country: string | null;
        machine: string | null;
        status: string;
        email: string;
        created_at: string;
      }[]) {
        const key = (r.company || r.email || 'client').toLowerCase();
        const cur =
          byClient.get(key) ??
          ({ name: r.company || r.email, country: r.country, presses: 0, eligible: 0, open: 0 } as ResellerClient);
        cur.presses += 1;
        if (r.status === 'can_be_connected') cur.eligible += 1;
        if (OPEN_CV.includes(r.status)) cur.open += 1;
        byClient.set(key, cur);
      }
      resellerClients = [...byClient.values()];
    } catch {
      resellerClients = [];
    }
  }

  const team = await getTeamForUser(user.id);

  return (
    <AccountHub
      accountType={accountType}
      team={team}
      email={user.email ?? ''}
      memberSince={(user.created_at as string) ?? null}
      profile={{
        fullName: profile?.full_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        country: profile?.country ?? null,
        company: profile?.company ?? null,
        jobTitle: (profile?.job_title as string | null) ?? null,
      }}
      academy={{
        level: stats.level.level,
        percentIntoLevel: stats.level.percentIntoLevel,
        xp: stats.xp,
        xpToNext: stats.level.xpToNext,
        isMax: stats.level.isMax,
        completedModules: stats.completedModules,
        totalModules: stats.totalModules,
        certificates: stats.certifiedCount,
      }}
      consoleStat={{ eligible: cvEligible, open: cvOpen }}
      resume={resume}
      resellerClients={resellerClients}
    />
  );
}
