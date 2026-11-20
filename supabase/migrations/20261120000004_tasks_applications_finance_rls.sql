-- ============================================================================
-- KIA GRANT MANAGEMENT SYSTEM 2.0
-- Migration 004: Grant Applications Table & RLS for Tasks, Applications, Finance
-- Date: 2026-11-20
-- ============================================================================

-- 1. Grant Applications Table
CREATE TABLE IF NOT EXISTS grant_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT UNIQUE NOT NULL,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    opportunity_id TEXT NOT NULL,
    grant_title TEXT NOT NULL,
    funder TEXT,
    status application_status_enum NOT NULL DEFAULT 'opportunity_selected',
    assigned_officer_id UUID REFERENCES staff_users(id),
    target_funding_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    awarded_amount NUMERIC(14, 2),
    funder_deadline DATE,
    qa_status TEXT DEFAULT 'pending',
    qa_reviewed_by UUID REFERENCES staff_users(id),
    qa_reviewed_at TIMESTAMPTZ,
    qa_notes TEXT DEFAULT '',
    submission_reference_number TEXT,
    submission_evidence_url TEXT,
    submitted_at TIMESTAMPTZ,
    submitted_by UUID REFERENCES staff_users(id),
    outcome_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Grants & RLS for Tasks, Applications, Invoices, Payments
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON grant_applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO authenticated;

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active staff access tasks" ON tasks;
CREATE POLICY "Active staff access tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

DROP POLICY IF EXISTS "Active staff access grant applications" ON grant_applications;
CREATE POLICY "Active staff access grant applications"
  ON grant_applications FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

DROP POLICY IF EXISTS "Active staff access invoices" ON invoices;
CREATE POLICY "Active staff access invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

DROP POLICY IF EXISTS "Active staff access payments" ON payments;
CREATE POLICY "Active staff access payments"
  ON payments FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());
