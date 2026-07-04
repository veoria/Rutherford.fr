-- Client systems — the installed base behind "Mon système" in the account hub.
--
-- One row per installed system (press + software) of an organization, managed
-- by the Rutherford team in the org back-office. Clients (org members) read
-- their own rows: license, AnyDesk id, installed vs latest version (an update
-- is "available" when the two differ).
--
-- Writes go through the service-role client in the admin API; RLS only grants
-- members READ access to their own org's systems.

create table if not exists public.client_systems (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  product text not null,
  machine text,
  license_key text,
  license_status text not null default 'active' check (license_status in ('active', 'trial', 'expired', 'suspended')),
  license_expires_at date,
  anydesk_id text,
  installed_version text,
  latest_version text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists client_systems_org_idx on public.client_systems (org_id);

alter table public.client_systems enable row level security;

drop policy if exists "members read their org systems" on public.client_systems;
create policy "members read their org systems" on public.client_systems
  for select to authenticated
  using (org_id in (select org_id from public.organization_members where user_id = auth.uid()));
