-- Lot 3 — l'organisation devient la source de vérité (brief § 3.2 + § 2.6).
--
-- 1. organizations.pipedrive_org_id: CRM anchor so Pipedrive flows match by id,
--    never again by the free-text company string (§ 2.4.4).
-- 2. client_systems.sold_by_org_id: per-press channel attribution — the org
--    that carried the ORDER (reseller / X-Rite), NULL = direct Rutherford sale.
--    Parc visibility follows this column, never the prospection (§ 2.6.2).
-- 3. Backfill: align profiles.organization_id for users whose only active
--    membership points elsewhere while their profile has no org yet (the safe
--    subset of the dual-source divergence; ambiguous cases stay for the admin).

alter table public.organizations
  add column if not exists pipedrive_org_id bigint;

alter table public.client_systems
  add column if not exists sold_by_org_id uuid references public.organizations(id) on delete set null;

create index if not exists client_systems_sold_by_org_id_idx
  on public.client_systems (sold_by_org_id);

update public.profiles p
set organization_id = m.org_id
from (
  select user_id, min(org_id::text)::uuid as org_id
  from public.organization_members
  where status = 'active'
  group by user_id
  having count(*) = 1
) m
where p.id = m.user_id
  and p.organization_id is null;
