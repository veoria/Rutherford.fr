-- Support tickets — mirrors console_validations: the /support form writes a row,
-- the Asana webhook syncs status from the ticket's column/section, and the
-- account tracker reads it back (RLS scopes each user to their own tickets).
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  name text,
  anydesk text,
  description text not null,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  asana_task_gid text,
  photos jsonb not null default '{}'::jsonb,
  source text default 'rutherford.fr/support',
  customer_reply text,
  customer_reply_at timestamptz
);
create index if not exists support_tickets_asana_idx on public.support_tickets (asana_task_gid);

alter table public.support_tickets enable row level security;

drop policy if exists "Support tickets: self read" on public.support_tickets;
create policy "Support tickets: self read" on public.support_tickets
  for select to authenticated
  using (
    auth.uid() = user_id
    or lower(email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
