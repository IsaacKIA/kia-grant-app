-- ============================================================================
-- KIA GRANT MANAGEMENT SYSTEM 2.0
-- Migration 007: Readiness Assessments Table & RLS for Readiness and Legacy Staging
-- Date: 2026-11-21
-- ============================================================================

CREATE TABLE IF NOT EXISTS readiness_assessments (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    assessor_id TEXT,
    assessor_name TEXT,
    assessor_role TEXT,
    total_score INTEGER NOT NULL DEFAULT 0,
    tier JSONB NOT NULL DEFAULT '{}'::jsonb,
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
    assessment_notes TEXT DEFAULT '',
    framework_version TEXT NOT NULL DEFAULT 'v2.0-2026',
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON readiness_assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legacy_migration_staging TO authenticated;

ALTER TABLE readiness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_migration_staging ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active staff access readiness assessments" ON readiness_assessments;
CREATE POLICY "Active staff access readiness assessments"
  ON readiness_assessments FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

DROP POLICY IF EXISTS "Active staff access legacy staging" ON legacy_migration_staging;
CREATE POLICY "Active staff access legacy staging"
  ON legacy_migration_staging FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());
