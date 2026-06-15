-- Record who set the Asana approval verdict (Approved / Changes requested /
-- Rejected) on a console validation, and when. Written by the Asana webhook.
alter table public.console_validations
  add column if not exists reviewed_by text,
  add column if not exists reviewed_at timestamptz;
