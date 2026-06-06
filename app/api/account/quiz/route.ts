import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCourseBySlug } from '@/data/academy-courses';
import { getCourseAccess } from '@/lib/entitlements';
import { scoreQuiz } from '@/lib/quiz';

export const dynamic = 'force-dynamic';

/**
 * Submit and grade a course's final assessment.
 *
 * Body: { courseSlug: string, answers: { [questionId]: number[] } }
 *
 * The answer key lives server-side only; we grade here, record the attempt
 * (RLS self-insert), and return the score + per-question correction so the
 * client can show what was right or wrong. A passing attempt is what unlocks
 * the course certificate.
 */
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const courseSlug = typeof payload.courseSlug === 'string' ? payload.courseSlug : '';
  const rawAnswers = (payload.answers ?? {}) as Record<string, unknown>;

  const course = getCourseBySlug(courseSlug);
  if (!course) {
    return NextResponse.json({ error: 'Unknown course' }, { status: 400 });
  }

  // Must have access to the course to be assessed on it.
  const access = await getCourseAccess(course);
  if (!access.hasAccess) {
    return NextResponse.json({ error: 'No access to this course' }, { status: 403 });
  }

  // Normalize answers to { id: number[] }.
  const answers: Record<string, number[]> = {};
  for (const [key, value] of Object.entries(rawAnswers)) {
    if (Array.isArray(value)) {
      answers[key] = value.filter((n): n is number => typeof n === 'number');
    } else if (typeof value === 'number') {
      answers[key] = [value];
    }
  }

  const result = scoreQuiz(courseSlug, answers);
  if (!result) {
    return NextResponse.json({ error: 'No assessment for this course' }, { status: 400 });
  }

  const { error } = await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    course_slug: courseSlug,
    score: result.score,
    total: result.total,
    passed: result.passed,
    answers,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(result);
}
