-- Support conversation thread: every team message (relayed from a "[client] …"
-- Asana comment) and customer reply is kept as a row, so the client sees the
-- full history in their account. RLS mirrors support_tickets ownership.
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets (id) on delete cascade,
  created_at timestamptz not null default now(),
  author text not null check (author in ('team', 'customer')),
  body text,
  photos jsonb not null default '[]'::jsonb,
  asana_story_gid text
);
create index if not exists support_messages_ticket_idx on public.support_messages (ticket_id, created_at);
-- One row per relayed Asana comment (guards against webhook re-delivery).
create unique index if not exists support_messages_story_uniq
  on public.support_messages (asana_story_gid)
  where asana_story_gid is not null;

alter table public.support_messages enable row level security;

drop policy if exists "Support messages: self read" on public.support_messages;
create policy "Support messages: self read" on public.support_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.support_tickets t
      where t.id = support_messages.ticket_id
        and (
          t.user_id = auth.uid()
          or lower(t.email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
        )
    )
  );
