-- ============================================================================
-- KIA GRANT MANAGEMENT SYSTEM 2.0
-- Migration 005: Include Client Case & Application Progress in Portal RPC
-- Date: 2026-11-20
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_client_portal_by_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tok client_upload_tokens%ROWTYPE;
  v_reqs JSONB;
  v_case JSONB;
  v_apps JSONB;
BEGIN
  SELECT * INTO v_tok FROM client_upload_tokens WHERE token = p_token;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid or unknown upload link.');
  END IF;
  IF v_tok.is_revoked THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This upload link has been revoked by KIA-START UP CONSULT.');
  END IF;
  IF now() > v_tok.expires_at THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This upload link has expired. Please contact your grant officer for a fresh link.');
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.is_mandatory DESC, r.created_at ASC), '[]'::jsonb)
  INTO v_reqs
  FROM case_doc_requirements r
  WHERE r.case_id = v_tok.case_id;

  SELECT jsonb_build_object(
    'caseNumber', c.case_number,
    'status', c.status,
    'nextActionDescription', c.next_action_description,
    'nextActionDueDate', c.next_action_due_date,
    'waitingReason', c.waiting_reason
  )
  INTO v_case
  FROM cases c
  WHERE c.id = v_tok.case_id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', a.id,
    'applicationNumber', a.application_number,
    'grantTitle', a.grant_title,
    'funder', a.funder,
    'status', a.status,
    'funderDeadline', a.funder_deadline,
    'targetFundingAmount', a.target_funding_amount,
    'awardedAmount', a.awarded_amount
  ) ORDER BY a.created_at DESC), '[]'::jsonb)
  INTO v_apps
  FROM grant_applications a
  WHERE a.case_id = v_tok.case_id;

  RETURN jsonb_build_object(
    'valid', true,
    'tokenRecord', jsonb_build_object(
      'token', v_tok.token,
      'caseId', v_tok.case_id,
      'clientName', v_tok.client_name,
      'issuedByName', v_tok.issued_by_name,
      'expiresAt', v_tok.expires_at,
      'uploadUrl', v_tok.upload_url
    ),
    'requirements', v_reqs,
    'caseSummary', v_case,
    'applications', v_apps
  );
END;
$$;
