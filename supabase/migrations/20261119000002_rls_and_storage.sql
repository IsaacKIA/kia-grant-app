-- ============================================================================
-- KIA GRANT MANAGEMENT SYSTEM 2.0
-- Migration 002: Row-Level Security (RLS), CEO Seed & Private Document Storage
-- Date: 2026-11-19
-- ============================================================================

-- 1. Seed Founder & CEO account (Isaac Agya Koomson)
INSERT INTO staff_users (email, full_name, phone_number, role, is_active)
VALUES ('info@kiastartupconsult.com', 'Isaac Agya Koomson', '+233 24 411 2233', 'ceo', true)
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    role = 'ceo',
    is_active = true;

-- 2. Helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_users
    WHERE (auth_user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'))
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.current_staff_role()
RETURNS staff_role_enum
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.staff_users
  WHERE (auth_user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'))
    AND is_active = true
  LIMIT 1;
$$;

-- 3. Enable RLS on core tables
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- staff_users: active staff can view directory; only CEO can add/update staff
DROP POLICY IF EXISTS "Active staff can view staff directory" ON staff_users;
CREATE POLICY "Active staff can view staff directory"
  ON staff_users FOR SELECT
  TO authenticated
  USING (public.is_active_staff());

DROP POLICY IF EXISTS "Only CEO can insert staff" ON staff_users;
CREATE POLICY "Only CEO can insert staff"
  ON staff_users FOR INSERT
  TO authenticated
  WITH CHECK (public.current_staff_role() = 'ceo');

DROP POLICY IF EXISTS "Only CEO can update staff" ON staff_users;
CREATE POLICY "Only CEO can update staff"
  ON staff_users FOR UPDATE
  TO authenticated
  USING (public.current_staff_role() = 'ceo')
  WITH CHECK (public.current_staff_role() = 'ceo');

-- organizations, contacts, cases: active authenticated staff access
DROP POLICY IF EXISTS "Active staff access organizations" ON organizations;
CREATE POLICY "Active staff access organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

DROP POLICY IF EXISTS "Active staff access contacts" ON contacts;
CREATE POLICY "Active staff access contacts"
  ON contacts FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

DROP POLICY IF EXISTS "Active staff access cases" ON cases;
CREATE POLICY "Active staff access cases"
  ON cases FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

-- 4. Private Storage Bucket for Client Documents (15 MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-documents',
  'client-documents',
  false,
  15728640,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Active staff can read client documents" ON storage.objects;
CREATE POLICY "Active staff can read client documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'client-documents' AND public.is_active_staff());

DROP POLICY IF EXISTS "Active staff can upload client documents" ON storage.objects;
CREATE POLICY "Active staff can upload client documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'client-documents' AND public.is_active_staff());
