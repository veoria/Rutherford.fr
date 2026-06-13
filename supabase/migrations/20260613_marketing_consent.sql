-- Explicit marketing consent (GDPR). The lead is only pushed to the CRM when
-- the user has opted in. Defaults to false (no consent).
alter table public.profiles
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz;

-- The user may set their own consent (onboarding writes via the user session).
grant update (full_name, avatar_url, country, company, job_title, onboarded_at, notification_email, marketing_consent, marketing_consent_at, updated_at)
  on public.profiles to authenticated;
