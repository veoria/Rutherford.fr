import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CertificateView } from '@/components/certificate-view';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isOnboarded } from '@/lib/profile';
import { getCourseBySlug } from '@/data/academy-courses';
import { certReference, resolveCertification } from '@/lib/certificate';

export const metadata: Metadata = {
  title: 'Certificate — Rutherford Academy',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

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

  const { certified, issuedDate, scorePct } = await resolveCertification(supabase, user.id, course);
  // Not certified yet — send them back rather than showing a blank certificate.
  if (!certified) {
    redirect('/account/academy');
  }

  return (
    <CertificateView
      slug={course.id}
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
