-- Optional: public bucket for project thumbnail uploads.
-- The API also creates this bucket on first upload if it is missing.

insert into storage.buckets (id, name, public, file_size_limit)
values ('project-thumbnails', 'project-thumbnails', true, 5242880)
on conflict (id) do nothing;

drop policy if exists "project_thumbnails_public_read" on storage.objects;
create policy "project_thumbnails_public_read"
  on storage.objects for select
  using (bucket_id = 'project-thumbnails');

drop policy if exists "project_thumbnails_admin_write" on storage.objects;
create policy "project_thumbnails_admin_write"
  on storage.objects for insert
  with check (
    bucket_id = 'project-thumbnails'
    and public.is_admin()
  );
