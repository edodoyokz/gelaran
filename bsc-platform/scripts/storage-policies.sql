-- ============================================================
-- SUPABASE STORAGE POLICIES
-- ============================================================
-- Jalankan di Supabase SQL Editor
-- RLS sudah diaktifkan secara default oleh Supabase pada storage.objects
-- Jadi kita hanya perlu membuat policies

-- ============================================================
-- HAPUS POLICIES LAMA (jika ada) - untuk fresh install
-- ============================================================
DO $$
BEGIN
    -- Avatars
    DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
    DROP POLICY IF EXISTS "avatars_auth_insert" ON storage.objects;
    DROP POLICY IF EXISTS "avatars_auth_update" ON storage.objects;
    DROP POLICY IF EXISTS "avatars_auth_delete" ON storage.objects;
    
    -- Events
    DROP POLICY IF EXISTS "events_public_read" ON storage.objects;
    DROP POLICY IF EXISTS "events_auth_insert" ON storage.objects;
    DROP POLICY IF EXISTS "events_auth_update" ON storage.objects;
    DROP POLICY IF EXISTS "events_auth_delete" ON storage.objects;
    
    -- Organizers
    DROP POLICY IF EXISTS "organizers_public_read" ON storage.objects;
    DROP POLICY IF EXISTS "organizers_auth_insert" ON storage.objects;
    DROP POLICY IF EXISTS "organizers_auth_update" ON storage.objects;
    DROP POLICY IF EXISTS "organizers_auth_delete" ON storage.objects;
    
    -- Tickets
    DROP POLICY IF EXISTS "tickets_auth_read" ON storage.objects;
    DROP POLICY IF EXISTS "tickets_auth_insert" ON storage.objects;
END $$;

-- ============================================================
-- AVATARS BUCKET - Public read, authenticated write
-- ============================================================
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- ============================================================
-- EVENTS BUCKET - Public read, authenticated write
-- ============================================================
CREATE POLICY "events_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'events');

CREATE POLICY "events_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'events');

CREATE POLICY "events_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'events');

CREATE POLICY "events_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'events');

-- ============================================================
-- ORGANIZERS BUCKET - Public read, authenticated write
-- ============================================================
CREATE POLICY "organizers_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'organizers');

CREATE POLICY "organizers_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'organizers');

CREATE POLICY "organizers_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'organizers');

CREATE POLICY "organizers_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'organizers');

-- ============================================================
-- TICKETS BUCKET - Private (authenticated only)
-- ============================================================
CREATE POLICY "tickets_auth_read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'tickets');

CREATE POLICY "tickets_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tickets');

-- ============================================================
-- VERIFIKASI
-- ============================================================
SELECT 
    policyname,
    tablename,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
