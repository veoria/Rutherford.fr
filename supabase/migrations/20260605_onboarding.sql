-- Rutherford Academy — lead-capture onboarding fields
-- Run in the Supabase SQL editor (Project: cawumjturiizzhzjtuiy) or via migration.
-- Additive only: new nullable columns, no data loss.

alter table public.profiles
  add column if not exists country text,
  add column if not exists company text,
  add column if not exists job_title text,
  add column if not exists onboarded_at timestamptz;

-- A profile counts as "onboarded" once it has country + company + job_title and
-- onboarded_at is stamped. The existing "Profiles: self update" RLS policy already
-- lets a signed-in user write these on their own row, so no new policy is needed.
