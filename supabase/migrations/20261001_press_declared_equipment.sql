-- Color equipment declared by the client on each press in "Mon atelier":
-- measurement device (IntelliTrax2, IntelliTrax…), measurement software
-- (IntelliTrax2 v2/v3, MeasureColor…) and color control software (EasySet,
-- EasyLoop, IntelliLoop, IntelliSet, ColorLoop…). Free text: a known product
-- name or whatever the client types under « Autre ». Distinct from
-- client_systems, which our team maintains (licenses, versions, serials).

alter table public.presses
  add column if not exists measurement_device text,
  add column if not exists measurement_software text,
  add column if not exists color_software text;
