import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AccountPage } from '@/components/account-page';
import { ALL_COURSES, FREE_COURSES } from '@/data/academy-courses';

export const metadata: Metadata = {
  title: 'Account dashboard (demo) | Rutherford Academy',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const isoDayUTC = (d: Date) => d.toISOString().slice(0, 10);

// Auth-free preview of the account dashboard so the UI can be reviewed
// without a Supabase session. Uses sample data only.
export default function AccountDemoRoute() {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();

  // Sample activity: learner active 5 of the last 7 days, 25 XP today.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const now = new Date();
  const sampleXp = [15, 30, 0, 20, 45, 0, 25]; // oldest → today
  const weekly = sampleXp.map((xp, i) => ({
    iso: isoDayUTC(new Date(now.getTime() - (6 - i) * DAY_MS)),
    xp,
  }));
  const activeDays = weekly.filter((d) => d.xp > 0).map((d) => d.iso);

  return (
    <AccountPage
      user={{
        email: 'demo@rutherford.fr',
        fullName: 'Demo User',
        avatarUrl: null,
      }}
      passSubscription={{
        status: 'active',
        currentPeriodEnd: '2027-05-01',
        cancelAt: null,
      }}
      enrolledCourses={[
        {
          slug: 'fundamentals',
          title: 'Offset Color Management Fundamentals',
          duration: '45 min',
          modules: 5,
          tone: 'free',
          source: 'free',
          grantedAt: '2026-03-10',
          expiresAt: null,
          completedCount: 5,
          completedAt: '2026-03-18',
          certificateLabel: 'Offset Color Management Fundamentals',
          hasQuiz: true,
          quizPassed: true,
          quizScore: 9,
          quizTotal: 10,
          certified: true,
          certifiedAt: '2026-03-18',
        },
        {
          slug: 'closed-loop-flagship',
          title: 'The Complete Closed-Loop Color Masterclass',
          duration: '120 min',
          modules: 8,
          tone: 'premium',
          source: 'pass',
          grantedAt: '2026-04-02',
          expiresAt: null,
          completedCount: 3,
          completedAt: null,
          certificateLabel: null,
          hasQuiz: true,
          quizPassed: false,
          quizScore: null,
          quizTotal: null,
          certified: false,
          certifiedAt: null,
        },
        {
          slug: 'measurecolor-production',
          title: 'MeasureColor Production: From Setup to Daily Operation',
          duration: '90 min',
          modules: 6,
          tone: 'premium',
          source: 'purchase',
          grantedAt: '2026-04-20',
          expiresAt: null,
          completedCount: 0,
          completedAt: null,
          certificateLabel: null,
          hasQuiz: true,
          quizPassed: false,
          quizScore: null,
          quizTotal: null,
          certified: false,
          certifiedAt: null,
        },
      ]}
      streak={1}
      streakBest={4}
      daily={{ goalXp: 20, todayXp: 25 }}
      weekly={weekly}
      activeDays={activeDays}
      resume={{
        slug: 'closed-loop-flagship',
        title: 'The Complete Closed-Loop Color Masterclass',
        moduleIndex: 3,
        moduleTitle: 'Reading the press: density, ΔE and tolerances',
      }}
      catalog={{ total: ALL_COURSES.length, freeSlugs: FREE_COURSES.map((c) => c.id) }}
      isTeam={false}
    />
  );
}
