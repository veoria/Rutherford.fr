import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { AcademyCoursePage } from '@/components/academy-course-page';
import { ALL_COURSES, getCourseBySlug } from '@/data/academy-courses';
import { getCourseAccess } from '@/lib/entitlements';

type RouteParams = { slug: string };

export const dynamic = 'force-dynamic';

export function generateStaticParams(): RouteParams[] {
  return ALL_COURSES.map((course) => ({ slug: course.id }));
}

export function generateMetadata({ params }: { params: RouteParams }): Metadata {
  const course = getCourseBySlug(params.slug);
  if (!course) return { title: 'Rutherford Academy' };
  return {
    title: `${course.title} — Rutherford Academy`,
    description: course.description,
  };
}

export default async function AcademyCourseRoute({ params }: { params: RouteParams }) {
  if (process.env.NEXT_PUBLIC_ACADEMY_ENABLED !== 'true') notFound();
  const course = getCourseBySlug(params.slug);
  if (!course) {
    notFound();
  }
  const access = await getCourseAccess(course);
  // Signed in but onboarding not finished: force the lead-capture step before any
  // course content. The marketing page itself stays public for signed-out visitors.
  if (access.signedIn && !access.onboarded) {
    redirect(`/account/onboarding?next=${encodeURIComponent(`/academy/${course.id}`)}`);
  }
  return <AcademyCoursePage course={course} access={access} />;
}
