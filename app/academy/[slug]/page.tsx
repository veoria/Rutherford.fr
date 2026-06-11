import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { AcademyCoursePage } from '@/components/academy-course-page';
import { ALL_COURSES, getCourseBySlug } from '@/data/academy-courses';
import { getCourseAccess } from '@/lib/entitlements';
import { getSignedCourseVideoUrl } from '@/lib/academy-video';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getQuizForCourse, toPublicQuiz } from '@/data/academy-quizzes';

type RouteParams = { slug: string };

export const dynamic = 'force-dynamic';

export function generateStaticParams(): RouteParams[] {
  return ALL_COURSES.map((course) => ({ slug: course.id }));
}

export function generateMetadata({ params }: { params: RouteParams }): Metadata {
  const course = getCourseBySlug(params.slug);
  if (!course) return { title: 'Rutherford Academy' };
  return {
    title: `${course.title} | Rutherford Academy`,
    description: course.description,
  };
}

export default async function AcademyCourseRoute({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams?: { m?: string };
}) {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();
  const course = getCourseBySlug(params.slug);
  if (!course) {
    notFound();
  }
  // Deep-link to a specific module (used by "continue where you left off").
  const moduleParam = Number(searchParams?.m);
  const initialModule =
    Number.isInteger(moduleParam) && moduleParam >= 0 && moduleParam < course.modules ? moduleParam : 0;
  const access = await getCourseAccess(course);
  // Signed in but onboarding not finished: force the lead-capture step before any
  // course content. The marketing page itself stays public for signed-out visitors.
  if (access.signedIn && !access.onboarded) {
    redirect(`/account/onboarding?next=${encodeURIComponent(`/academy/${course.id}`)}`);
  }
  // The video lives in a private bucket; only mint a signed URL when access is granted.
  const videoUrl = access.hasAccess ? await getSignedCourseVideoUrl(course) : null;

  // The answer key never leaves the server — the client only gets the prompts.
  const quizDef = getQuizForCourse(course.id);
  const quiz = quizDef ? toPublicQuiz(quizDef) : null;

  // Load the user's per-module completion + assessment history.
  let completedLessons: number[] = [];
  let quizPassed = false;
  let quizBest: { score: number; total: number } | null = null;
  if (access.hasAccess) {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const [{ data: progress }, { data: attempts }] = await Promise.all([
        supabase
          .from('course_progress')
          .select('lesson_index')
          .eq('user_id', user.id)
          .eq('course_slug', course.id),
        supabase
          .from('quiz_attempts')
          .select('score, total, passed')
          .eq('user_id', user.id)
          .eq('course_slug', course.id),
      ]);
      completedLessons = (progress ?? []).map((row) => row.lesson_index as number);
      const rows = (attempts ?? []) as { score: number; total: number; passed: boolean }[];
      quizPassed = rows.some((r) => r.passed);
      for (const r of rows) {
        if (r.total > 0 && (!quizBest || r.score / r.total > quizBest.score / quizBest.total)) {
          quizBest = { score: r.score, total: r.total };
        }
      }
    }
  }

  return (
    <AcademyCoursePage
      course={course}
      access={access}
      videoUrl={videoUrl}
      completedLessons={completedLessons}
      quiz={quiz}
      quizPassed={quizPassed}
      quizBest={quizBest}
      initialModule={initialModule}
    />
  );
}
