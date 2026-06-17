-- Share one organization per company email domain.
--
-- Root cause of duplicate orgs (e.g. two @digitalview.co.za members each got
-- their own "DigitalView" reseller org): auto-creation made one org per profile
-- with no dedup. This adds organizations.email_domain (unique), merges existing
-- same-company-domain duplicates into the earliest org, and stamps the domain so
-- future sign-ups join the existing org instead of creating a new one. Public
-- webmail domains (gmail, outlook, …) are excluded — those stay individual.

alter table public.organizations add column if not exists email_domain text;

do $$
declare
  free text[] := array[
    'gmail.com','googlemail.com','outlook.com','outlook.fr','hotmail.com','hotmail.fr',
    'hotmail.co.uk','hotmail.it','live.com','live.fr','msn.com','icloud.com','me.com',
    'mac.com','yahoo.com','yahoo.fr','yahoo.co.uk','yahoo.it','ymail.com','aol.com',
    'gmx.com','gmx.de','gmx.net','proton.me','protonmail.com','pm.me','mail.com',
    'zoho.com','yandex.com','yandex.ru','qq.com','163.com','126.com','web.de',
    'free.fr','orange.fr','wanadoo.fr','laposte.net','sfr.fr','bbox.fr','neuf.fr',
    'libero.it','t-online.de'
  ];
  d record;
  canonical uuid;
  dup uuid;
begin
  -- Merge orgs that share a company domain (keyed by their owner's email),
  -- keeping the earliest-created org as canonical.
  for d in
    select split_part(lower(u.email), '@', 2) as domain
    from public.organizations o
    join public.organization_members m on m.org_id = o.id and m.role = 'owner' and m.status = 'active'
    join auth.users u on u.id = m.user_id
    where split_part(lower(u.email), '@', 2) <> ''
      and not (split_part(lower(u.email), '@', 2) = any(free))
    group by 1
    having count(distinct o.id) > 1
  loop
    select o.id into canonical
    from public.organizations o
    join public.organization_members m on m.org_id = o.id and m.role = 'owner' and m.status = 'active'
    join auth.users u on u.id = m.user_id
    where split_part(lower(u.email), '@', 2) = d.domain
    order by o.created_at asc, o.id asc
    limit 1;

    for dup in
      select distinct o.id
      from public.organizations o
      join public.organization_members m on m.org_id = o.id and m.role = 'owner' and m.status = 'active'
      join auth.users u on u.id = m.user_id
      where split_part(lower(u.email), '@', 2) = d.domain and o.id <> canonical
    loop
      -- Re-point everything that references the duplicate org.
      update public.organizations set reseller_org_id = canonical where reseller_org_id = dup;
      update public.organizations set distributor_org_id = canonical where distributor_org_id = dup;
      update public.profiles set organization_id = canonical where organization_id = dup;
      update public.invitations set org_id = canonical where org_id = dup;
      -- Move memberships to the canonical org (demoted to 'member'); drop any that
      -- would duplicate an existing membership there.
      delete from public.organization_members mm
        where mm.org_id = dup
          and exists (
            select 1 from public.organization_members c
            where c.org_id = canonical and c.user_id = mm.user_id
          );
      update public.organization_members set org_id = canonical, role = 'member' where org_id = dup;
      delete from public.organizations where id = dup;
    end loop;
  end loop;

  -- Stamp email_domain on every org whose owner has a company domain (now unique).
  update public.organizations o
    set email_domain = sub.domain
  from (
    select distinct on (o2.id) o2.id, split_part(lower(u.email), '@', 2) as domain
    from public.organizations o2
    join public.organization_members m on m.org_id = o2.id and m.role = 'owner' and m.status = 'active'
    join auth.users u on u.id = m.user_id
    where split_part(lower(u.email), '@', 2) <> ''
      and not (split_part(lower(u.email), '@', 2) = any(free))
    order by o2.id, m.created_at asc
  ) sub
  where o.id = sub.id and o.email_domain is null;
end $$;

-- One org per company domain going forward (free webmail stays unstamped/null).
create unique index if not exists organizations_email_domain_key
  on public.organizations (email_domain) where email_domain is not null;
