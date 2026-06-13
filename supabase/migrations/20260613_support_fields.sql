-- Support tickets: extra intake context (company + subject) used for the Asana
-- task name "[Company] – Subject" and the account-list title, plus a one-way
-- "message to the customer" relayed from a tagged Asana comment ([client] …).
-- Columns are nullable; the existing RLS select policy already covers them.
alter table public.support_tickets
  add column if not exists company text,
  add column if not exists subject text,
  add column if not exists agent_message text,
  add column if not exists agent_message_at timestamptz,
  add column if not exists last_agent_story_gid text;
