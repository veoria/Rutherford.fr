-- Rutherford Academy — final-assessment (QCM) attempts
-- Records each attempt at a course's end-of-course assessment. A course's
-- certificate is unlocked by a passing attempt (passed = true).

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_slug text not null,
  score integer not null,
  total integer not null,
  passed boolean not null,
  answers jsonb,
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_id_idx on public.quiz_attempts (user_id);
create index if not exists quiz_attempts_user_course_idx on public.quiz_attempts (user_id, course_slug);

alter table public.quiz_attempts enable row level security;

-- Users can read and create their own attempts. Scoring happens server-side
-- (the correct answers never reach the browser), but the row is still written
-- under the user's own auth context, so self insert/select is all that's needed.
drop policy if exists "Quiz attempts: self read" on public.quiz_attempts;
create policy "Quiz attempts: self read" on public.quiz_attempts
  for select using (auth.uid() = user_id);

drop policy if exists "Quiz attempts: self insert" on public.quiz_attempts;
create policy "Quiz attempts: self insert" on public.quiz_attempts
  for insert with check (auth.uid() = user_id);
