-- Console-validation conversation thread: every team message (relayed from a
-- "[client] …" Asana comment) and customer reply is kept as a row, so the
-- client sees the full history in the tracker. Mirrors support_messages.
create table if not exists public.console_validation_messages (
  id uuid primary key default gen_random_uuid(),
  validation_id uuid not null references public.console_validations (id) on delete cascade,
  created_at timestamptz not null default now(),
  author text not null check (author in ('team', 'customer')),
  body text,
  photos jsonb not null default '[]'::jsonb,
  asana_story_gid text
);
create index if not exists cv_messages_validation_idx
  on public.console_validation_messages (validation_id, created_at);
-- One row per relayed Asana comment (guards against webhook re-delivery).
create unique index if not exists cv_messages_story_uniq
  on public.console_validation_messages (asana_story_gid)
  where asana_story_gid is not null;

alter table public.console_validation_messages enable row level security;

-- Readable by whoever can read the parent validation (mirror its policy).
drop policy if exists "CV messages: self read" on public.console_validation_messages;
create policy "CV messages: self read" on public.console_validation_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.console_validations v
      where v.id = console_validation_messages.validation_id
        and (
          v.user_id = auth.uid()
          or v.reseller_id = auth.uid()
          or (v.user_id is null and lower(v.email) = lower(coalesce((auth.jwt() ->> 'email'), '')))
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
        )
    )
  );

-- Dedup the team→client relay email on the originating Asana story.
alter table public.console_validations
  add column if not exists last_agent_story_gid text;
