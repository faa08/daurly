-- ============================================================
-- SQL MIGRATION: ADD SYSTEM_SETTINGS TABLE FOR MAINTENANCE MODE
-- Jalankan query ini di Supabase SQL Editor Anda
-- ============================================================

-- 1. Definisikan fungsi is_app_admin() terlebih dahulu jika belum ada
CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id_user = auth.uid() AND role = 'admin'
  );
$$;

-- 2. Membuat tabel system_settings untuk menyimpan status maintenance
CREATE TABLE IF NOT EXISTS system_settings (
    key          VARCHAR(100) PRIMARY KEY,
    value        JSONB NOT NULL,
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Mengaktifkan Row Level Security (RLS) pada tabel tersebut
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 4. Membuat policy agar semua pengunjung (publik) bisa mengecek status maintenance (READ saja)
DROP POLICY IF EXISTS "Allow public read system_settings" ON system_settings;
CREATE POLICY "Allow public read system_settings" ON system_settings
    FOR SELECT USING (true);

-- 5. Membuat policy agar hanya admin yang bisa mengubah/mengatur data ini
DROP POLICY IF EXISTS "Admins manage system_settings" ON system_settings;
CREATE POLICY "Admins manage system_settings" ON system_settings
    FOR ALL USING (public.is_app_admin()) WITH CHECK (public.is_app_admin());

-- 6. Memasukkan data awal (default) dengan status maintenance bernilai false (tidak aktif)
INSERT INTO system_settings (key, value)
VALUES ('maintenance_mode', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 7. Muat ulang cache skema Supabase agar tabel baru langsung terbaca oleh API
NOTIFY pgrst, 'reload schema';
