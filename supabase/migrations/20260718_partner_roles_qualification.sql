-- Lot 2 — référentiels par rôle & qualification (brief § 2.2-2.3).
--
-- 1. job_roles: multi-valued role keys for PARTNER accounts (reseller /
--    distributor) — a small reseller often wears several hats. Clients and team
--    keep the single-choice job_title column; the API validates keys per
--    account_type (RESELLER_ROLE_KEYS / DISTRIBUTOR_ROLE_KEYS).
-- 2. account_type_source: how the classification was decided. 'unqualified'
--    replaces the old silent default-to-client; a confirmed source ('admin',
--    'crm', 'crm_domain', 'domain') is never overwritten by a CRM outage.
--    NULL = legacy row classified before this migration (treated as confirmed).
--    Service-role writes only — same trust model as account_type.
-- 3. partner_domains: reseller e-mail domains harvested from Pipedrive labels
--    (Reseller / OEM / Distributor) by the daily cron, so a colleague of a
--    known reseller is classified instantly at sign-in without a CRM call.

alter table public.profiles
  add column if not exists job_roles text[],
  add column if not exists account_type_source text
    check (account_type_source in ('domain', 'crm', 'crm_domain', 'admin', 'unqualified'));

-- job_roles is user-editable (validated by the API); account_type_source is
-- deliberately NOT in the grant (server-derived, like account_type).
grant update (full_name, avatar_url, country, company, job_title, job_roles, onboarded_at, notification_email, updated_at)
  on public.profiles to authenticated;

create table if not exists public.partner_domains (
  domain text primary key,
  pipedrive_label text,
  synced_at timestamptz not null default now()
);

-- Service-role only: no RLS policies on purpose (RLS enabled, zero policies →
-- anon/authenticated see nothing; the admin client bypasses RLS).
alter table public.partner_domains enable row level security;
