-- ============================================================================
-- KIA GRANT MANAGEMENT SYSTEM 2.0
-- Migration 003: Document Requirements, Client Upload Tokens & Portal RPCs
-- Date: 2026-11-20
-- ============================================================================

-- 1. Document Requirements per Case
CREATE TABLE IF NOT EXISTS case_doc_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    template_code TEXT NOT NULL,
    document_name TEXT NOT NULL,
    category TEXT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    status document_status_enum NOT NULL DEFAULT 'missing',
    uploaded_file JSONB,
    verified_by UUID REFERENCES staff_users(id),
    verified_by_name TEXT,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Secure Password-less Client Upload Tokens
CREATE TABLE IF NOT EXISTS client_upload_tokens (
    token TEXT PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    issued_by UUID REFERENCES staff_users(id),
    issued_by_name TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    upload_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON case_doc_requirements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_upload_tokens TO authenticated;

ALTER TABLE case_doc_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_upload_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active staff access doc requirements" ON case_doc_requirements;
CREATE POLICY "Active staff access doc requirements"
  ON case_doc_requirements FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

DROP POLICY IF EXISTS "Active staff access upload tokens" ON client_upload_tokens;
CREATE POLICY "Active staff access upload tokens"
  ON client_upload_tokens FOR ALL
  TO authenticated
  USING (public.is_active_staff())
  WITH CHECK (public.is_active_staff());

-- 3. Allow password-less client uploads into private bucket (path scoped, no public read/list)
DROP POLICY IF EXISTS "Client token holders can upload documents" ON storage.objects;
CREATE POLICY "Client token holders can upload documents"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'client-documents');

-- 4. SECURITY DEFINER RPC: Validate token & return only that client's requirements
CREATE OR REPLACE FUNCTION public.get_client_portal_by_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tok client_upload_tokens%ROWTYPE;
  v_reqs JSONB;
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
    'requirements', v_reqs
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_client_portal_by_token(TEXT) TO anon, authenticated;

-- 5. SECURITY DEFINER RPC: Record client document upload (enforces token -> case_id ownership)
CREATE OR REPLACE FUNCTION public.record_client_document_upload(
  p_token TEXT,
  p_requirement_id UUID,
  p_file_name TEXT,
  p_file_size TEXT,
  p_mime_type TEXT,
  p_storage_path TEXT,
  p_client_note TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tok client_upload_tokens%ROWTYPE;
  v_req case_doc_requirements%ROWTYPE;
  v_file JSONB;
BEGIN
  SELECT * INTO v_tok FROM client_upload_tokens WHERE token = p_token;
  IF NOT FOUND OR v_tok.is_revoked OR now() > v_tok.expires_at THEN
    RAISE EXCEPTION 'Invalid, revoked, or expired upload token.';
  END IF;

  SELECT * INTO v_req FROM case_doc_requirements WHERE id = p_requirement_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Document requirement not found.';
  END IF;

  IF v_req.case_id <> v_tok.case_id THEN
    RAISE EXCEPTION 'ACCESS DENIED: Upload token does not match this client case.';
  END IF;

  v_file := jsonb_build_object(
    'id', 'file-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
    'fileName', p_file_name,
    'fileSize', p_file_size,
    'mimeType', p_mime_type,
    'storagePath', p_storage_path,
    'clientNote', COALESCE(p_client_note, ''),
    'uploadedAt', now(),
    'uploadedByType', 'client_link'
  );

  UPDATE case_doc_requirements
  SET status = 'under_review',
      uploaded_file = v_file,
      rejection_reason = '',
      notes = CASE WHEN COALESCE(trim(p_client_note), '') <> '' THEN 'Client Note: ' || trim(p_client_note) ELSE notes END,
      updated_at = now()
  WHERE id = p_requirement_id;

  RETURN jsonb_build_object('ok', true, 'uploadedFile', v_file);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_client_document_upload(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
