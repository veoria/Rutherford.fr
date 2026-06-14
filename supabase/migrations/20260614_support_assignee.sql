-- Show the client who is handling their ticket. The assignee's name is synced
-- from the Asana task by the webhook (display only; nullable).
alter table public.support_tickets
  add column if not exists assignee_name text;
