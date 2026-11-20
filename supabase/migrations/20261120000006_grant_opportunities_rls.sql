-- ============================================================================
-- KIA GRANT MANAGEMENT SYSTEM 2.0
-- Migration 006: Grant Opportunities Catalogue Table & RLS
-- Date: 2026-11-20
-- ============================================================================

CREATE TABLE IF NOT EXISTS grant_opportunities (
    id TEXT PRIMARY KEY,
    opportunity_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    funding_organization TEXT NOT NULL,
    official_source_url TEXT,
    description TEXT DEFAULT '',
    target_sectors TEXT[] NOT NULL DEFAULT '{}',
    eligible_applicant_types TEXT[] NOT NULL DEFAULT '{}',
    eligible_business_stages TEXT[] NOT NULL DEFAULT '{}',
    eligible_regions TEXT[] NOT NULL DEFAULT '{"All 16 Regions of Ghana"}',
    min_funding_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    max_funding_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    min_readiness_score INTEGER NOT NULL DEFAULT 50,
    requires_registration BOOLEAN NOT NULL DEFAULT true,
    required_legal_types TEXT[] NOT NULL DEFAULT '{}',
    requires_bank_statements BOOLEAN NOT NULL DEFAULT false,
    requires_tax_clearance BOOLEAN NOT NULL DEFAULT false,
    opening_date DATE,
    closing_date DATE,
    is_annual_recurring BOOLEAN NOT NULL DEFAULT false,
    typical_open_month INTEGER,
    typical_close_month INTEGER,
    deadline_timezone TEXT NOT NULL DEFAULT 'Africa/Accra',
    application_method TEXT DEFAULT '',
    has_application_fee BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending_verification',
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    donor_focus TEXT DEFAULT '',
    internal_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON grant_opportunities TO authenticated;

ALTER TABLE grant_opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active staff access grant opportunities" ON grant_opportunities;
CREATE POLICY "Active staff access grant opportunities"
  ON grant_opportunities FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());
