-- Last known assignee of every task in the Asana Support project — form tickets
-- and tasks created by hand in Asana alike. The Asana webhook compares the live
-- assignee with this row to ping the new assignee on Discord exactly once per
-- change. Server-only (service role): RLS on, no policy.
create table if not exists public.support_task_assignees (
  task_gid text primary key,
  -- Asana user gid; '' when the task is unassigned (keeps comparisons null-free).
  assignee_gid text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.support_task_assignees enable row level security;
