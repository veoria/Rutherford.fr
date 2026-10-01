-- Sheet format « 145 » (106 × 145 cm, e.g. Rapida 145) between B1 and the
-- 110 × 162 cm large format.

alter table public.presses drop constraint if exists presses_sheet_format_check;
alter table public.presses
  add constraint presses_sheet_format_check check (sheet_format in ('b3', 'b2', 'b1', 'f145', 'vlf'));
