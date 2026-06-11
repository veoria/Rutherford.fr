import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AccountPage } from '@/components/account-page';

export const metadata: Metadata = {
  title: 'Account dashboard (demo) | Rutherford Academy',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

// Auth-free preview of the account dashboard so the UI can be reviewed
// without a Supabase session. Uses sample data only.
export default function AccountDemoRoute() {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();

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
    />
  );
}
