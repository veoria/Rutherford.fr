-- Admin flag for the back-office (/admin).
-- profiles already has a "self update" RLS policy, so to prevent a user from
-- escalating themselves we restrict UPDATE at the SQL grant level: authenticated
-- may only update the user-editable profile columns, never is_admin (or id /
-- stripe_customer_id). The service_role (server admin reads / Stripe webhook)
-- bypasses these grants.
alter table public.profiles add column if not exists is_admin boolean not null default false;

revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url, country, company, job_title, onboarded_at, updated_at)
  on public.profiles to authenticated;

-- Grant the flag to the owner account(s) via a separate data statement, e.g.:
--   update public.profiles set is_admin = true where id = '<auth.users.id>';
