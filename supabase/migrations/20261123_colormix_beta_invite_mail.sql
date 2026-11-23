-- ColorMix Kitchen beta: remember when the "you are invited" email went out.
-- Additive. The job /api/cron/colormix-invites mails the rows of cmx_beta whose
-- invite_mail_at is null, once, then stamps them.
--
-- Everyone already on the list is stamped now, so nobody invited before this
-- change receives an email.

alter table public.cmx_beta add column if not exists invite_mail_at timestamptz;

update public.cmx_beta set invite_mail_at = now() where invite_mail_at is null;
