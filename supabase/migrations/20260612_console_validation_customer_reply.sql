-- Customer reply to a console validation (in-account "provide more details"
-- form): the latest comment and when it was sent. Photos go to storage + Asana.
alter table public.console_validations
  add column if not exists customer_reply text,
  add column if not exists customer_reply_at timestamptz;
