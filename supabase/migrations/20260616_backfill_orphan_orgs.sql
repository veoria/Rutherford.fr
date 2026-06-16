-- Backfill: give every profile that still has no organization a personal one
-- (the user as owner), mirroring the original 20260613 backfill. This catches
-- accounts created *after* that one-time backfill — e.g. self-signed-up
-- resellers like GrafiSoft — so they appear in the back-office Organisations
-- list with the correct type. Idempotent: only touches profiles with a null
-- organization_id, and skips duplicate memberships.

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
