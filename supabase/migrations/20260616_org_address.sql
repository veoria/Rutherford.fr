-- Postal address for organizations — surfaced in the admin back-office so
-- reseller / distributor / client orgs can carry a full address alongside the
-- existing country + logo. All nullable; no change for existing rows.

alter table public.organizations add column if not exists address text;
alter table public.organizations add column if not exists postal_code text;
alter table public.organizations add column if not exists city text;
