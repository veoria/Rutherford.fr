import type { User } from '@supabase/supabase-js';
import type { AccountType } from '@/data/account-types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  company: string | null;
  job_title: string | null;
  onboarded_at: string | null;
  account_type: AccountType;
  notification_email: string | null;
};

type OnboardingFields = Pick<Profile, 'country' | 'company' | 'job_title' | 'onboarded_at'>;

/**
 * A profile is "onboarded" once the lead-capture step is complete: it has a
 * stamped onboarded_at plus the three required fields.
 */
export function isOnboarded(profile: OnboardingFields | null | undefined): boolean {
  return Boolean(profile?.onboarded_at && profile.country && profile.company && profile.job_title);
}

const PROFILE_COLUMNS =
  'id, full_name, avatar_url, country, company, job_title, onboarded_at, account_type, notification_email';

/**
 * Fetch the signed-in user and their profile in one place. Returns nulls when
 * Supabase is not configured or nobody is signed in.
 */
export async function getCurrentUserAndProfile(): Promise<{ user: User | null; profile: Profile | null }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { user: null, profile: null };
  }
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', user.id).maybeSingle();
  return { user, profile: (data as Profile | null) ?? null };
}
