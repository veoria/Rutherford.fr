-- Attach orphan console validations to the account that owns the email.
--
-- A request submitted while logged out is written with user_id = NULL and is
-- tied to the person only by a read-time email match in RLS
-- (20260615_restrict_email_match_to_unclaimed.sql). So a request sent BEFORE
-- the person created their account never gets attached: it still shows on their
-- tracker (via the email match) but the row's user_id stays NULL forever — and
-- the admin "Compte" column stays empty for it.
--
-- This migration closes that gap in two parts:
--   1. an ongoing claim: when an account's email is confirmed (sign-up or a
--      later verification), attach any still-unclaimed rows with a matching
--      email;
--   2. a one-time backfill for rows that predate this trigger.
--
-- Only user_id IS NULL rows are ever touched — owned rows stay with their owner,
-- exactly as the RLS "claimable" rule already defines. On-behalf submissions
-- (user_id deliberately NULL, email = the client's) attach to the client when
-- the client signs up, which is the intended owner.

-- 1. Ongoing claim -----------------------------------------------------------
create or replace function public.claim_email_matched_console_validations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only attach once the email is verified, so an unconfirmed sign-up can't
  -- grab another person's submissions.
  if new.email is null or new.email_confirmed_at is null then
    return new;
  end if;

  update public.console_validations
  set user_id = new.id,
      updated_at = now()
  where user_id is null
    and lower(email) = lower(new.email);

  return new;
end;
$$;

-- Fires on OAuth sign-up (email already confirmed at insert) and on the
-- email/password confirmation that sets email_confirmed_at later. Scoping the
-- UPDATE event to the email_confirmed_at column keeps it off unrelated updates.
drop trigger if exists on_auth_user_confirmed_claim_cv on auth.users;
create trigger on_auth_user_confirmed_claim_cv
  after insert or update of email_confirmed_at on auth.users
  for each row
  when (new.email_confirmed_at is not null)
  execute function public.claim_email_matched_console_validations();

-- 2. One-time backfill -------------------------------------------------------
-- distinct on () keeps it deterministic if two accounts ever share an email
-- (earliest account wins), so UPDATE ... FROM can't pick an arbitrary match.
update public.console_validations cv
set user_id = m.id,
    updated_at = now()
from (
  select distinct on (lower(email)) lower(email) as email_l, id
  from auth.users
  where email is not null
    and email_confirmed_at is not null
  order by lower(email), created_at
) m
where cv.user_id is null
  and lower(cv.email) = m.email_l;
