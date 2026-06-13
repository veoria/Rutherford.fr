import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { accountTypeFromDomain } from '@/lib/account-type';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/account';
  const origin = url.origin;

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/account/sign-in?error=${encodeURIComponent(error.message)}`);
    }

    // Stamp the domain-derived classification (team / distributor) on sign-in —
    // free and reliable. Reseller / client are derived when the profile is saved.
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const byDomain = user?.email ? accountTypeFromDomain(user.email) : null;
      if (user && byDomain && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        await createSupabaseAdminClient()
          .from('profiles')
          .update({ account_type: byDomain })
          .eq('id', user.id);
      }
    } catch {
      // Best-effort — never block sign-in on classification.
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
