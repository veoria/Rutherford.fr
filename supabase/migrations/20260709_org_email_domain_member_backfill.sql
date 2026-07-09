-- Stamp organizations.email_domain from ANY active member, not just owners.
--
-- The 20260617 backfill only stamped orgs whose OWNER signs in with a company
-- domain. Orgs created by an admin (no owner) or whose domain colleagues are
-- plain members — e.g. the Bodhi reseller org with darshan@bodhi-pro.com as
-- member — stayed unstamped, so a new colleague (support@bodhi-pro.com) did
-- not auto-join at sign-up. Stamp them now, preferring the owner's domain,
-- else the earliest active member's. Free webmail domains stay excluded, and
-- a domain is only stamped when it is unambiguous: not already claimed by
-- another org, and not a candidate for two different orgs.

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
begin
  with candidates as (
    -- One candidate domain per unstamped org: owner first, then oldest member.
    select distinct on (m.org_id)
      m.org_id,
      split_part(lower(u.email), '@', 2) as domain
    from public.organization_members m
    join auth.users u on u.id = m.user_id
    join public.organizations o on o.id = m.org_id and o.email_domain is null
    where m.status = 'active'
      and split_part(lower(u.email), '@', 2) like '%.%'
      and not (split_part(lower(u.email), '@', 2) = any(free))
    order by m.org_id, (m.role <> 'owner'), m.created_at asc
  ),
  unambiguous as (
    select org_id, domain
    from candidates c
    where not exists (select 1 from public.organizations x where x.email_domain = c.domain)
      and (select count(*) from candidates c2 where c2.domain = c.domain) = 1
  )
  update public.organizations o
    set email_domain = u.domain
  from unambiguous u
  where o.id = u.org_id and o.email_domain is null;
end $$;
