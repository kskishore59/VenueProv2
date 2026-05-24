-- =============================================================================
-- VenuePro Storage Buckets and Tenant-Scoped Security Policies
-- =============================================================================

-- ─── 1. Initialize Storage Buckets ──────────────────────────────────────────
-- Creates venuepro-media and receipts storage buckets with size and type checks.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  (
    'venuepro-media', 
    'venuepro-media', 
    true, 
    10485760, -- 10MB limit
    array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
  ),
  (
    'receipts', 
    'receipts', 
    true, 
    10485760, -- 10MB limit
    array['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
  )
on conflict (id) do update set 
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ─── 2. Clean Legacy Policies ────────────────────────────────────────────────
drop policy if exists "Storage SELECT Policy" on storage.objects;
drop policy if exists "Storage INSERT Policy" on storage.objects;
drop policy if exists "Storage DELETE Policy" on storage.objects;

-- ─── 3. Establish Tenant-Scoped Storage RLS ───────────────────────────────
-- Allow public retrieval of files under our public media and receipts buckets.
create policy "Storage SELECT Policy" on storage.objects
  for select using (bucket_id in ('venuepro-media', 'receipts'));

-- Restrict uploads: User must be logged in and the target root folder name 
-- (which holds the organization's id) must match their profile's org_id.
create policy "Storage INSERT Policy" on storage.objects
  for insert with check (
    bucket_id in ('venuepro-media', 'receipts')
    and auth.uid() is not null
    and (storage.foldername(name))[1] = (
      select org_id::text from public.profiles where id = auth.uid()
    )
  );

-- Restrict deletes: User must be logged in and can only delete files 
-- located inside their own organization's subdirectory.
create policy "Storage DELETE Policy" on storage.objects
  for delete using (
    bucket_id in ('venuepro-media', 'receipts')
    and auth.uid() is not null
    and (storage.foldername(name))[1] = (
      select org_id::text from public.profiles where id = auth.uid()
    )
  );
