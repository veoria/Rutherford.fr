import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { FREE_COURSES, type AcademyCourse } from '@/data/academy-courses';

const FREE_COURSE_SLUGS = new Set(FREE_COURSES.map((c) => c.id));

export function isFreeCourse(slug: string) {
  return FREE_COURSE_SLUGS.has(slug);
}

export type CourseAccess = {
  hasAccess: boolean;
  source: 'free' | 'purchase' | 'pass' | 'grant' | null;
  expiresAt: string | null;
  signedIn: boolean;
  onboarded: boolean;
};

/**
 * Whether the current user can read the full lessons of the course.
 *
 * Lead-capture model: ALL course content (free and premium) now requires a
 * signed-in, onboarded account. Free courses unlock once the user has completed
 * onboarding; premium courses additionally require an enrollment or active pass.
 * The marketing page (intro video, syllabus) stays public — only the lessons are
 * gated by `hasAccess`.
 */
export async function getCourseAccess(course: AcademyCourse): Promise<CourseAccess> {
  const free = isFreeCourse(course.id);

  // Graceful fallback when Supabase env vars are not yet configured: lock all
  // content and treat the visitor as signed-out.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { hasAccess: false, source: null, expiresAt: null, signedIn: false, onboarded: false };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signedIn = Boolean(user);
  let onboarded = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('country, company, job_title, onboarded_at')
      .eq('id', user.id)
      .maybeSingle();
    onboarded = isOnboarded(profile);
  }

  // Free courses: account + onboarding is the only gate.
  if (free) {
    const hasAccess = signedIn && onboarded;
    return { hasAccess, source: hasAccess ? 'free' : null, expiresAt: null, signedIn, onboarded };
  }

  // Premium courses: must also hold an enrollment or active pass.
  if (!user) {
    return { hasAccess: false, source: null, expiresAt: null, signedIn: false, onboarded: false };
  }

  // user_course_access view union's enrollments + active pass subscriptions
  const { data } = await supabase
    .from('user_course_access')
    .select('source, expires_at')
    .eq('user_id', user.id)
    .eq('course_slug', course.id)
    .maybeSingle();

  if (!data) {
    return { hasAccess: false, source: null, expiresAt: null, signedIn: true, onboarded };
  }

  return {
    hasAccess: true,
    source: (data.source ?? null) as CourseAccess['source'],
    expiresAt: (data.expires_at ?? null) as string | null,
    signedIn: true,
    onboarded,
  };
}
