-- Press equipment & support history — ties the installed base and support
-- tickets to the presses declared in "Mon atelier".
--
-- client_systems
--   press_id       the press this system/device is installed on (nullable:
--                  legacy rows stay unplaced until the team links them).
--   kind           what the row is: the Rutherford software (license, version)
--                  or one of the tracked hardware items — measurement device
--                  (IntelliTrax2, spectro…), the ColorLoop PC/server, or the
--                  console interface box. Versions reuse installed_version /
--                  latest_version (software version, firmware or OS).
--   serial_number  hardware serial number.
--
-- support_tickets.press_id  the press a ticket is about ("Support" button on a
--   press card), so each press carries its own support history.

alter table public.client_systems
  add column if not exists press_id uuid references public.presses (id) on delete set null,
  add column if not exists kind text not null default 'software'
    check (kind in ('software', 'measurement_device', 'pc', 'console_interface')),
  add column if not exists serial_number text;
create index if not exists client_systems_press_idx on public.client_systems (press_id);

alter table public.support_tickets
  add column if not exists press_id uuid references public.presses (id) on delete set null;
create index if not exists support_tickets_press_idx on public.support_tickets (press_id);
