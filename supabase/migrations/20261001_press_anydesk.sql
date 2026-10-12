-- AnyDesk support number per press, entered by the client in "Mon atelier"
-- (the plant-level number already lives on sites.anydesk_id, now also
-- client-editable). Prefilled in the support form opened from a press.

alter table public.presses
  add column if not exists anydesk_id text;
