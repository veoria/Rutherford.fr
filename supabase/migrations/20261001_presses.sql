-- Presses — the client's own press inventory ("Mon atelier").
--
-- Distinct from the two existing press-shaped records:
--   console_validations  prospection: "is this console compatible?"
--   client_systems       what Rutherford installed (license, AnyDesk, version),
--                        maintained by the Rutherford team.
-- A press here is declared by the client: every machine of the pressroom,
-- equipped or not, placed on one of the org's sites (plants). The configurator
-- mirrors the ROI estimator (sheet format, colors, production profile) so the
-- same vocabulary carries through the site.
--
-- Writes go through /api/account/presses with the service-role client after a
-- membership check; RLS grants members READ access to their org's presses.

create table if not exists public.presses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  site_id uuid references public.sites (id) on delete set null,
  name text,
  manufacturer text not null,
  model text,
  sheet_format text not null default 'b1' check (sheet_format in ('b3', 'b2', 'b1', 'vlf')),
  colors smallint not null default 4 check (colors between 1 and 16),
  coater boolean not null default false,
  perfecting boolean not null default false,
  production_profile text check (production_profile in ('commercial', 'packaging', 'luxe')),
  console text,
  year smallint check (year between 1950 and 2100),
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists presses_org_idx on public.presses (org_id);
create index if not exists presses_site_idx on public.presses (site_id);

alter table public.presses enable row level security;

drop policy if exists "members read their org presses" on public.presses;
create policy "members read their org presses" on public.presses
  for select to authenticated
  using (org_id in (select org_id from public.organization_members where user_id = auth.uid()));
