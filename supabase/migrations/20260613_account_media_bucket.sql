-- Public bucket for profile photos + company logos.
-- Writes go through the service-role media API (which verifies ownership);
-- reads are public URLs (avatars / logos aren't sensitive).
insert into storage.buckets (id, name, public)
values ('account-media', 'account-media', true)
on conflict (id) do nothing;
