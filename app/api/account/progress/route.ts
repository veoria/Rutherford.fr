import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getCourseBySlug } from '@/data/academy-courses';
import { getCourseAccess } from '@/lib/entitlements';

export const dynamic = 'force-dynamic';

/**
 * Record or clear completion of a single course module for the signed-in user.
 *
 * Body: { courseSlug: string, lessonIndex: number, completed: boolean }
 *
 * Writes go through the user's own RLS policies (self insert / self delete on
 * course_progress). We still re-check course access here so progress can only
 * accrue on content the user is actually allowed to read.
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
  const lessonIndex = typeof payload.lessonIndex === 'number' ? payload.lessonIndex : NaN;
  const completed = payload.completed === true;

  const course = getCourseBySlug(courseSlug);
  if (!course) {
    return NextResponse.json({ error: 'Unknown course' }, { status: 400 });
  }
  if (!Number.isInteger(lessonIndex) || lessonIndex < 0 || lessonIndex >= course.modules) {
    return NextResponse.json({ error: 'Invalid module' }, { status: 400 });
  }

  const access = await getCourseAccess(course);
  if (!access.hasAccess) {
    return NextResponse.json({ error: 'No access to this course' }, { status: 403 });
  }

  if (completed) {
    const { error } = await supabase
      .from('course_progress')
      .upsert(
        { user_id: user.id, course_slug: courseSlug, lesson_index: lessonIndex },
        { onConflict: 'user_id,course_slug,lesson_index', ignoreDuplicates: true }
      );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase
      .from('course_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('course_slug', courseSlug)
      .eq('lesson_index', lessonIndex);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the authoritative set of completed indices for this course so the
  // client can reconcile its optimistic state.
  const { data } = await supabase
    .from('course_progress')
    .select('lesson_index')
    .eq('user_id', user.id)
    .eq('course_slug', courseSlug);
  const completedLessons = (data ?? []).map((r) => r.lesson_index as number).sort((a, b) => a - b);

  return NextResponse.json({ ok: true, completedLessons });
}
