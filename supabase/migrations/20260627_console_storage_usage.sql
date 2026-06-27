-- Report the size of the console-validations storage bucket, for the monthly
-- storage alert (/api/cron/storage-check) and the admin storage report
-- (/api/admin/storage). SECURITY DEFINER so the service role can read
-- storage.objects without exposing the storage schema broadly.
create or replace function public.console_storage_usage()
returns table (objects bigint, bytes bigint)
language sql
security definer
set search_path = ''
as $$
  select count(*)::bigint,
         coalesce(sum((metadata->>'size')::bigint), 0)::bigint
  from storage.objects
  where bucket_id = 'console-validations';
$$;

revoke all on function public.console_storage_usage() from anon, authenticated;
