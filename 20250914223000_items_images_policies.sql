-- Create bucket if it does not exist
insert into storage.buckets (id, name, public)
values ('items-images', 'items-images', false)
on conflict (id) do nothing;

-- Policy: allow authenticated users to read only their own top-level UID folder
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and polname = 'objects_read_own_items_images_folder'
  ) then
    create policy objects_read_own_items_images_folder
      on storage.objects
      for select
      using (
        bucket_id = 'items-images'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end
$$;

-- Policy: allow authenticated users to insert only into their own top-level UID folder
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and polname = 'objects_insert_own_items_images_folder'
  ) then
    create policy objects_insert_own_items_images_folder
      on storage.objects
      for insert
      with check (
        bucket_id = 'items-images'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end
$$;

-- Policy: allow authenticated users to update only objects within their own top-level UID folder
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and polname = 'objects_update_own_items_images_folder'
  ) then
    create policy objects_update_own_items_images_folder
      on storage.objects
      for update
      using (
        bucket_id = 'items-images'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end
$$;

-- Policy: allow authenticated users to delete only objects within their own top-level UID folder
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and polname = 'objects_delete_own_items_images_folder'
  ) then
    create policy objects_delete_own_items_images_folder
      on storage.objects
      for delete
      using (
        bucket_id = 'items-images'
        and auth.role() = 'authenticated'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end
$$;


