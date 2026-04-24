-- ============================================================
-- SUPABASE STORAGE SETUP
-- Run this in Supabase SQL Editor AFTER the main schema
-- ============================================================

-- Create vendor-assets bucket (private — served via signed URLs)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vendor-assets',
  'vendor-assets',
  false,
  5242880, -- 5MB
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do nothing;

-- Vendors can upload their own files
create policy "vendors_upload_own"
  on storage.objects for insert
  with check (
    bucket_id = 'vendor-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Vendors can read their own files
create policy "vendors_read_own"
  on storage.objects for select
  using (
    bucket_id = 'vendor-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Vendors can delete their own files
create policy "vendors_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'vendor-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can read all vendor assets
create policy "admins_read_all"
  on storage.objects for select
  using (
    bucket_id = 'vendor-assets'
    and exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
