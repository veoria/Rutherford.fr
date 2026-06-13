-- Organizations, team membership & invitations — foundation for the account
-- hub's management panels (real "Équipe" / clients / reseller network).
--
-- Model:
--   organizations            one per account (client printer / reseller /
--                            distributor / internal team). Optional links up
--                            the chain: a client org's managing reseller, and
--                            a reseller org's distributor.
--   organization_members     a user's membership in an org, with a role
--                            (owner / admin / member) and status (active /
--                            invited).
--   invitations              a pending invite (by email) to join an org —
--                            resolved when the invitee signs in.
--   profiles.organization_id the user's primary org.
--
-- Writes go through the service-role client in the API (after an owner/admin
-- check); RLS here only grants members READ access to their own org + peers.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'client' check (type in ('client', 'reseller', 'distributor', 'team')),
  country text,
  logo_url text,
  reseller_org_id uuid references public.organizations (id) on delete set null,
  distributor_org_id uuid references public.organizations (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'active' check (status in ('active', 'invited')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);
create index if not exists organization_members_user_idx on public.organization_members (user_id);

alter table public.profiles
  add column if not exists organization_id uuid references public.organizations (id) on delete set null;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  kind text not null default 'member' check (kind in ('member', 'client', 'reseller')),
  token text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  invited_by uuid references auth.users (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);
create index if not exists invitations_pending_email_idx
  on public.invitations (lower(email)) where status = 'pending';

-- ── RLS: members read their own org + peers (writes via service-role) ──
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.invitations enable row level security;

drop policy if exists "members read their orgs" on public.organizations;
create policy "members read their orgs" on public.organizations
  for select to authenticated
  using (id in (select org_id from public.organization_members where user_id = auth.uid()));

drop policy if exists "members read org peers" on public.organization_members;
create policy "members read org peers" on public.organization_members
  for select to authenticated
  using (org_id in (select org_id from public.organization_members where user_id = auth.uid()));

-- ── Backfill: one org per existing profile, the user as its owner ──
do $$
declare
  p record;
  new_org uuid;
begin
  for p in
    select id, company, country, account_type from public.profiles where organization_id is null
  loop
    insert into public.organizations (name, type, country)
      values (
        coalesce(nullif(trim(p.company), ''), 'Mon compte'),
        case when p.account_type in ('client', 'reseller', 'distributor', 'team') then p.account_type else 'client' end,
        p.country
      )
      returning id into new_org;
    insert into public.organization_members (org_id, user_id, role, status)
      values (new_org, p.id, 'owner', 'active')
      on conflict (org_id, user_id) do nothing;
    update public.profiles set organization_id = new_org where id = p.id;
  end loop;
end $$;
