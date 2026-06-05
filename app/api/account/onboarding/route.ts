import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isJobTitleKey, isKnownCountry } from '@/data/onboarding-options';

export const dynamic = 'force-dynamic';

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
  const country = typeof payload.country === 'string' ? payload.country.trim() : '';
  const company = typeof payload.company === 'string' ? payload.company.trim() : '';
  const jobTitle = typeof payload.job_title === 'string' ? payload.job_title.trim() : '';
  const fullName = typeof payload.full_name === 'string' ? payload.full_name.trim() : '';

  if (
    !country ||
    !company ||
    !jobTitle ||
    !isKnownCountry(country) ||
    !isJobTitleKey(jobTitle) ||
    company.length > 200
  ) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    country,
    company,
    job_title: jobTitle,
    onboarded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (fullName) update.full_name = fullName.slice(0, 200);

  const { error } = await supabase.from('profiles').update(update).eq('id', user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
