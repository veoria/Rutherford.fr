-- Capture who handles a console validation: the Asana assignee, plus the task
-- followers (the board adds Shajith as a follower on every request). Lets the
-- admin see / filter "validations X handles", not just "validated by X"
-- (reviewed_by, which is only the approver and only set once a verdict lands).
--
-- Populated by the Asana webhook on every task change (app/api/asana-webhook),
-- so it reflects reassignments too. Nullable / empty until the next change.
alter table public.console_validations
  add column if not exists assignee text,
  add column if not exists followers text[] not null default '{}';
