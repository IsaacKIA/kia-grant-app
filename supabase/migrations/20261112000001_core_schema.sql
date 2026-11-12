-- ============================================================================
-- KIA GRANT MANAGEMENT SYSTEM 2.0
-- Migration 001: Core Database Schema DDL
-- Date: 2026-11-12
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE staff_role_enum AS ENUM (
        'ceo',
        'team_leader',
        'application_officer',
        'finance_officer',
        'admin'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE case_status_enum AS ENUM (
        'intake',
        'onboarding_fee_pending',
        'documentation',
        'readiness_assessment',
        'grant_matching',
        'application_development',
        'internal_review',
        'approved_for_submission',
        'submitted',
        'under_funder_review',
        'outcome_recorded',
        'waiting_on_client',
        'waiting_on_funder',
        'on_hold',
        'withdrawn',
        'closed'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE document_status_enum AS ENUM (
        'not_required',
        'missing',
        'requested',
        'uploaded',
        'under_review',
        'verified',
        'correction_required',
        'rejected',
        'expired'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE opportunity_status_enum AS ENUM (
        'draft',
        'pending_verification',
        'verified_open',
        'upcoming',
        'closed',
        'expired',
        'suspended',
        'archived'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE application_status_enum AS ENUM (
        'opportunity_selected',
        'eligibility_review',
        'information_collection',
        'proposal_preparation',
        'budget_preparation',
        'internal_review',
        'client_confirmation',
        'approved_for_submission',
        'submitted',
        'under_funder_review',
        'decision_received',
        'awarded',
        'rejected',
        'closed',
        'withdrawn'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE task_status_enum AS ENUM (
        'pending',
        'in_progress',
        'waiting_on_client',
        'waiting_on_funder',
        'blocked',
        'completed',
        'cancelled'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status_enum AS ENUM ('draft', 'issued', 'partially_paid', 'paid', 'cancelled', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('pending_verification', 'verified', 'rejected', 'reconciled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('momo_mtn', 'momo_telecel', 'momo_at', 'bank_transfer', 'bank_deposit', 'cash', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Shared timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. USERS & ROLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    role staff_role_enum NOT NULL DEFAULT 'application_officer',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. CRM: ORGANIZATIONS & CONTACTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name TEXT NOT NULL,
    trading_name TEXT,
    applicant_type TEXT NOT NULL, -- Startup, SME, NGO, Cooperative, Individual
    sector TEXT NOT NULL,         -- Agribusiness, Tech, Manufacturing, etc.
    business_stage TEXT NOT NULL, -- Idea, Pre-revenue, Early-stage, Growth
    registration_type TEXT,       -- Sole Proprietorship, Limited Liability, LBG, Unregistered
    registration_number TEXT,     -- ORC / RGD registration number
    tin_number TEXT,              -- Tax Identification Number / Ghana Card PIN
    year_established INT,
    region TEXT NOT NULL DEFAULT 'Greater Accra',
    district TEXT,
    address TEXT,
    website TEXT,
    created_by UUID REFERENCES staff_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone_primary TEXT NOT NULL,
    phone_whatsapp TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    id_card_type TEXT,            -- Ghana Card, Passport, Voter ID
    id_card_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. CASES & ASSIGNMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT UNIQUE NOT NULL, -- e.g. 'KIA-CASE-2026-0001'
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    primary_contact_id UUID REFERENCES contacts(id),
    status case_status_enum NOT NULL DEFAULT 'intake',
    current_officer_id UUID REFERENCES staff_users(id),
    onboarding_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    next_action_description TEXT,
    next_action_due_date DATE,
    waiting_reason TEXT,
    inactivity_flag BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS case_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    assigned_officer_id UUID NOT NULL REFERENCES staff_users(id),
    assigned_by UUID NOT NULL REFERENCES staff_users(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    unassigned_at TIMESTAMPTZ,
    reassignment_reason TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================================
-- 4. AGREEMENTS & FINANCIALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    agreement_number TEXT UNIQUE NOT NULL,
    version INT NOT NULL DEFAULT 1,
    engagement_fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 200.00,
    success_fee_percentage NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    terms_summary TEXT,
    signed_date DATE,
    status TEXT NOT NULL DEFAULT 'draft',
    signed_document_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    agreement_id UUID REFERENCES agreements(id),
    invoice_type TEXT NOT NULL DEFAULT 'onboarding_fee',
    amount_due NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'GHS',
    status invoice_status_enum NOT NULL DEFAULT 'issued',
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    created_by UUID REFERENCES staff_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'GHS',
    payment_method payment_method_enum NOT NULL,
    transaction_reference TEXT NOT NULL,
    payer_name TEXT,
    payment_date DATE NOT NULL,
    status payment_status_enum NOT NULL DEFAULT 'pending_verification',
    verified_by UUID REFERENCES staff_users(id),
    verified_at TIMESTAMPTZ,
    receipt_document_url TEXT,
    verification_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. TASKS & ACCOUNTABILITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_number TEXT UNIQUE NOT NULL,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    application_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID NOT NULL REFERENCES staff_users(id),
    created_by UUID NOT NULL REFERENCES staff_users(id),
    priority task_priority_enum NOT NULL DEFAULT 'medium',
    status task_status_enum NOT NULL DEFAULT 'pending',
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    completion_evidence TEXT,
    escalation_level INT NOT NULL DEFAULT 0, -- 0: normal, 1: escalated to TL, 2: escalated to CEO
    escalated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 6. AUDIT & AUTOMATION LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES staff_users(id),
    actor_name TEXT,
    actor_role TEXT,
    actor_type TEXT NOT NULL DEFAULT 'staff',
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 7. LEGACY MIGRATION STAGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS legacy_migration_staging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id TEXT UNIQUE NOT NULL,
    raw_data JSONB NOT NULL,
    parsed_client_name TEXT,
    parsed_business_name TEXT,
    parsed_sector TEXT,
    parsed_commitment_fee_paid BOOLEAN,
    migration_status TEXT NOT NULL DEFAULT 'quarantined',
    reconciliation_notes TEXT,
    migrated_case_id UUID REFERENCES cases(id),
    reconciled_by UUID REFERENCES staff_users(id),
    reconciled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

