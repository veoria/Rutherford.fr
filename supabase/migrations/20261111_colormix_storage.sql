-- ColorMix on Rutherford accounts (11 Nov 2026).
--
-- ColorMix (colorloop.ai/color-mix.html, the ink formulation tool of ColorLoop)
-- signs in with the Rutherford account: same auth.users, same profiles. It keeps
-- what a printer builds there (their colors, column choices, the Kitchen's order
-- under way and saved formulas, their ink library and stock) as four JSON files
-- in a private Storage bucket, one folder per account:
--   cmx/<user id>/colors.json, maps.json, kitchen.json, library.json
--
-- Additive only: a new bucket and four policies scoped to it. No table, no
-- trigger, nothing on the existing buckets or on profiles. Each signed-in account
-- reads, writes and deletes in its own folder only; nobody else, signed in or
-- not, can list or read it. The service role (GDPR export and erasure in
-- app/api/account/data/route.ts) bypasses these policies.

-- the bucket: private, JSON only, 20 MB a file (5,000 spectral colors are about 3.5 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cmx', 'cmx', false, 20971520, array['application/json'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- the policies: the first folder of the path is the account's id
drop policy if exists "cmx: read own folder" on storage.objects;
create policy "cmx: read own folder" on storage.objects for select to authenticated
  using (bucket_id = 'cmx' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "cmx: add to own folder" on storage.objects;
create policy "cmx: add to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'cmx' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "cmx: replace in own folder" on storage.objects;
create policy "cmx: replace in own folder" on storage.objects for update to authenticated
  using (bucket_id = 'cmx' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'cmx' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "cmx: delete in own folder" on storage.objects;
create policy "cmx: delete in own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'cmx' and (storage.foldername(name))[1] = (select auth.uid())::text);
