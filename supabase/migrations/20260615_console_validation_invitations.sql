-- Invitations a reseller / distributor / team member sends to a client to fill
-- out a console validation themselves. The token in the email link is the
-- capability (no account needed). On completion the row is marked and linked.
create table if not exists public.console_validation_invitations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  inviter_id uuid not null references auth.users (id) on delete cascade,
  inviter_company text,
  client_email text not null,
  company text,
  machine text,
  note text,
  locale text not null default 'en',
  status text not null default 'pending' check (status in ('pending', 'completed', 'expired')),
  validation_id uuid references public.console_validations (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

alter table public.console_validation_invitations enable row level security;

-- The inviter can list their own invitations (the portal reads via the user
-- session). Creation, token lookup and completion run through the service-role
-- client in the API, which bypasses RLS.
create policy "CV invitations: inviter read"
  on public.console_validation_invitations
  for select
  using (auth.uid() = inviter_id);

create index if not exists cv_invitations_inviter_idx
  on public.console_validation_invitations (inviter_id, created_at desc);
