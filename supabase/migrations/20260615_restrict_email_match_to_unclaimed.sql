-- Tighten the "self read" RLS so the contact-email match only surfaces
-- UNCLAIMED (logged-out) submissions. Previously a record already owned by an
-- account (user_id set) also appeared in any *other* account whose verified
-- login email happened to equal the typed contact email — e.g. a console
-- validation created under an Apple sign-in but with a work email as contact
-- showed up under the work-email account. Owned records must stay private to
-- their owner (+ reseller + admin); only user_id IS NULL rows are claimable by
-- a matching verified email.

alter policy "Console validations: self read" on public.console_validations
using (
  (auth.uid() = user_id)
  or (auth.uid() = reseller_id)
  or (user_id is null and lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
  or (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
);

alter policy "Support tickets: self read" on public.support_tickets
using (
  (auth.uid() = user_id)
  or (user_id is null and lower(email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
  or (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
);

alter policy "Support messages: self read" on public.support_messages
using (
  exists (
    select 1
    from public.support_tickets t
    where t.id = support_messages.ticket_id
      and (
        (t.user_id = auth.uid())
        or (t.user_id is null and lower(t.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
        or (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
      )
  )
);
