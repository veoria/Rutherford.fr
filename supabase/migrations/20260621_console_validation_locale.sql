-- Remember the visitor's site language at intake so every email about the
-- request (acknowledgement, eligibility verdict, more-info, relayed messages)
-- is sent in that language. Nullable; emails fall back to English when unset.
alter table public.console_validations
  add column if not exists locale text;
