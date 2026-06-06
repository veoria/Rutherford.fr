import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CertificateView } from '@/components/certificate-view';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { getCourseBySlug } from '@/data/academy-courses';
import { getLessonsForCourse } from '@/data/academy-lessons';
import { courseHasQuiz } from '@/data/academy-quizzes';

export const metadata: Metadata = {
  title: 'Certificate — Rutherford Academy',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** Stable, deterministic certificate reference from the user + course. */
function certReference(userId: string, slug: string): string {
  const seed = `${userId}:${slug}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (Math.imul(hash, 31) + seed.charCodeAt(i)) >>> 0;
  const code = hash.toString(36).toUpperCase().padStart(6, '0').slice(-6);
  const initials = slug.replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase();
  return `RA-${initials}-${code}`;
}

export default async function CertificateRoute({ params }: { params: { slug: string } }) {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();
  const course = getCourseBySlug(params.slug);
  if (!course) notFound();

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/account/sign-in?next=${encodeURIComponent(`/account/certificate/${params.slug}`)}`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company, country, job_title, onboarded_at')
    .eq('id', user.id)
    .maybeSingle();
  if (!isOnboarded(profile)) {
    redirect(`/account/onboarding?next=${encodeURIComponent(`/account/certificate/${params.slug}`)}`);
  }

  // A certificate exists only when the course is certified: pass its final
  // assessment, or — for a course without one — complete every module.
  const hasQuiz = courseHasQuiz(course.id);
  let certified = false;
  let issuedDate: string | null = null;
  let scorePct: number | null = null;

  if (hasQuiz) {
    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('score, total, passed, created_at')
      .eq('user_id', user.id)
      .eq('course_slug', course.id);
    const rows = (attempts ?? []) as { score: number; total: number; passed: boolean; created_at: string }[];
    const passed = rows.filter((r) => r.passed);
    certified = passed.length > 0;
    if (certified) {
      issuedDate = passed.reduce<string | null>(
        (min, r) => (!min || r.created_at < min ? r.created_at : min),
        null
      );
      let best = 0;
      for (const r of rows) if (r.total > 0) best = Math.max(best, r.score / r.total);
      scorePct = Math.round(best * 100);
    }
  } else {
    const total = getLessonsForCourse(course.id)?.length ?? course.modules;
    const { data: prog } = await supabase
      .from('course_progress')
      .select('lesson_index, completed_at')
      .eq('user_id', user.id)
      .eq('course_slug', course.id);
    const rows = (prog ?? []) as { lesson_index: number; completed_at: string }[];
    const done = new Set(rows.filter((r) => r.lesson_index >= 0 && r.lesson_index < total).map((r) => r.lesson_index));
    certified = total > 0 && done.size >= total;
    if (certified) {
      issuedDate = rows.reduce<string | null>(
        (max, r) => (!max || r.completed_at > max ? r.completed_at : max),
        null
      );
    }
  }

  // Not certified yet — send them back to the dashboard rather than showing a blank certificate.
  if (!certified) {
    redirect('/account');
  }

  return (
    <CertificateView
      recipientName={(profile?.full_name as string) || (user.email ?? '')}
      company={(profile?.company as string) ?? null}
      courseTitle={course.title}
      distinction={course.certificate ?? null}
      durationLabel={course.duration}
      modules={course.modules}
      scorePct={scorePct}
      issuedDate={issuedDate}
      reference={certReference(user.id, course.id)}
    />
  );
}
