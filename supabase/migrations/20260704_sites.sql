-- Sites (usines) — a location level between the client organization and its
-- installed systems, so one client account can hold several plants.
--
-- Model:
--   sites              one row per plant/site of an organization. Optional
--                      address + a site-level AnyDesk id (a shared support
--                      connection for the whole site).
--   client_systems.site_id  a system is installed at a site (nullable — legacy
--                      rows and "not yet placed" systems keep site_id null).
--   site_members       restricts a user to specific sites of their org. A user
--                      with NO rows sees ALL their org's sites (default-open);
--                      any rows narrow them to exactly those sites. Owners /
--                      admins always see every site regardless.
--
-- Writes go through the service-role client in the admin API (after an
-- owner/admin check); RLS here grants members READ access, honouring the
-- site_members restriction.

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  country text,
  city text,
  address text,
  postal_code text,
  anydesk_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sites_org_idx on public.sites (org_id);

alter table public.client_systems
  add column if not exists site_id uuid references public.sites (id) on delete set null;
create index if not exists client_systems_site_idx on public.client_systems (site_id);

create table if not exists public.site_members (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (site_id, user_id)
);
create index if not exists site_members_user_idx on public.site_members (user_id);

-- ── RLS ──
alter table public.sites enable row level security;
alter table public.site_members enable row level security;

-- A member reads a site of their org, honouring an explicit site_members
-- restriction: if the user has ANY site_members row for the org, only those
-- sites are visible; with no rows, all the org's sites are visible.
drop policy if exists "members read their org sites" on public.sites;
create policy "members read their org sites" on public.sites
  for select to authenticated
  using (
    org_id in (select org_id from public.organization_members where user_id = auth.uid())
    and (
      not exists (
        select 1
        from public.site_members sm
        join public.sites s2 on s2.id = sm.site_id
        where sm.user_id = auth.uid() and s2.org_id = sites.org_id
      )
      or id in (select site_id from public.site_members where user_id = auth.uid())
    )
  );

drop policy if exists "members read their site memberships" on public.site_members;
create policy "members read their site memberships" on public.site_members
  for select to authenticated
  using (user_id = auth.uid());

-- ── Backfill: one "Site principal" per org that already has systems, and
--    attach that org's existing systems to it. Idempotent-ish: only creates a
--    default site for orgs that have systems but no site yet. ──
do $$
declare
  o record;
  new_site uuid;
begin
  for o in
    select distinct cs.org_id
    from public.client_systems cs
    where cs.site_id is null
      and not exists (select 1 from public.sites s where s.org_id = cs.org_id)
  loop
    insert into public.sites (org_id, name)
      values (o.org_id, 'Site principal')
      returning id into new_site;
    update public.client_systems
      set site_id = new_site
      where org_id = o.org_id and site_id is null;
  end loop;
end $$;
