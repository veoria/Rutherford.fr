-- Lot 4 — admin audit log (brief § 4.2.6 / § 4.5).
--
-- Every /api/admin/* mutation records who did what to which target. No admin
-- surface currently leaves any trace (only console_validations.reviewed_by,
-- and that comes from Asana). Service-role writes only; RLS enabled with zero
-- policies so anon/authenticated can't read it (the admin viewer uses the
-- service-role client after its own is_admin + AAL2 gate).

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text not null,          -- e.g. 'user.update', 'user.delete', 'org.create'
  target_type text,              -- 'user' | 'organization' | 'system' | 'site' | 'storage' | 'dropbox'
  target_id text,
  summary text,                  -- short human-readable line, French
  metadata jsonb,                -- before/after or action-specific detail
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_target_idx
  on public.admin_audit_log (target_type, target_id);

alter table public.admin_audit_log enable row level security;
