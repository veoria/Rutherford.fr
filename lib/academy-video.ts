import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { AcademyCourse } from '@/data/academy-courses';

// Private Supabase Storage bucket holding the course .mp4 files.
// The files are uploaded with the same basename they had under /public
// (e.g. "closed-loop-flagship.mp4").
const VIDEO_BUCKET = 'academy-videos';
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 4; // 4 hours — comfortably longer than any lesson.

/** Storage object key for a course video, derived from its original path. */
export function courseVideoKey(course: Pick<AcademyCourse, 'id' | 'videoSrc'>): string {
  return course.videoSrc.split('/').pop() || `${course.id}.mp4`;
}

/**
 * Returns a short-lived signed URL for the course video, or null when it can't
 * be issued (Supabase not configured, file missing, etc.). Callers MUST gate on
 * access first — this is the only place a video URL is ever produced, so a video
 * is never reachable without a prior access check.
 */
export async function getSignedCourseVideoUrl(
  course: Pick<AcademyCourse, 'id' | 'videoSrc'>
): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.storage
      .from(VIDEO_BUCKET)
      .createSignedUrl(courseVideoKey(course), SIGNED_URL_TTL_SECONDS);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}
