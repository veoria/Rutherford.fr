-- Account classification + optional notification email.
--
-- account_type: how an account relates to Rutherford. DERIVED server-side and
-- never self-declared, so it stays trustworthy:
--   * email domain rutherford.fr / veoria.fr / studiodelaroche.fr → 'team'
--   * email domain xrite.com                                      → 'distributor'
--   * otherwise the Pipedrive person label (Reseller → 'reseller',
--     Customer → 'client'); default 'client'.
-- notification_email: optional address where transactional emails are sent
-- instead of the login email.
alter table public.profiles
  add column if not exists account_type text not null default 'client'
    check (account_type in ('client', 'reseller', 'distributor', 'team')),
  add column if not exists notification_email text;

-- The user may edit their own profile fields + notification email, but NOT
-- account_type (server/service-role derived only). Re-grant the editable
-- column allowlist with notification_email added; account_type is deliberately
-- excluded so the existing revoke from 20260606 keeps it out of reach.
grant update (full_name, avatar_url, country, company, job_title, onboarded_at, notification_email, updated_at)
  on public.profiles to authenticated;
