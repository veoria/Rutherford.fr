-- Press order in "Mon atelier": the client arranges its presses (drag and drop
-- or arrows in « Réorganiser » mode). One order per organization, shared by
-- every member, the hub preview and the partner fleet. New presses go last.

alter table public.presses
  add column if not exists position integer not null default 0;

-- Existing presses keep their declaration order.
update public.presses p
set position = ranked.rn
from (
  select id, row_number() over (partition by org_id order by created_at, id) as rn
  from public.presses
) ranked
where ranked.id = p.id and p.position = 0;

create index if not exists presses_org_position_idx on public.presses (org_id, position);
