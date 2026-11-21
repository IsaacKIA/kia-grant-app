import { auditService } from './auditService';
import { taskService } from './taskService';
import { authService } from './authService';
import { crmService } from './crmService';
import { applicationService } from './applicationService';
import { supabase, isSupabaseConfigured, isUuid } from '../lib/supabase';

function mapSupabaseReqRow(row) {
  return {
    id: row.id,
    caseId: row.case_id,
    clientName: row.client_name,
    templateCode: row.template_code,
    documentName: row.document_name,
    category: row.category,
    isMandatory: row.is_mandatory !== false,
    status: row.status || 'missing',
    uploadedFile: row.uploaded_file || null,
    verifiedBy: row.verified_by || null,
    verifiedByName: row.verified_by_name || null,
    verifiedAt: row.verified_at || null,
    rejectionReason: row.rejection_reason || '',
    notes: row.notes || ''
  };
}

const LOCAL_DOC_REQUIREMENTS_KEY = 'kia_case_doc_requirements_v3';
const LOCAL_UPLOAD_TOKENS_KEY = 'kia_upload_tokens_v3';

// Standard Document Templates by Entity Type & Sector
export const DOCUMENT_TEMPLATES = [
  {
    id: 'tmpl-orc-cert',
    code: 'ORC_REG_CERT',
    name: 'ORC / RGD Registration Certificate & Form 3',
    category: 'Legal & Registration',
    description: 'Official incorporation certificate from the Registrar General / Office of the Registrar of Companies with active Form 3 annual return renewal.',
    defaultMandatory: true,
    applicableApplicantTypes: ['Startup', 'SME', 'NGO', 'Cooperative']
  },
  {
    id: 'tmpl-tin-ghcard',
    code: 'TIN_GHCARD',
    name: 'Tax Identification Number (TIN) / Ghana Card Proof',
    category: 'Legal & Registration',
    description: 'Valid Tax Identification Number documentation or official Ghana Card linkages for all registered directors and authorized signatories.',
    defaultMandatory: true,
    applicableApplicantTypes: ['Startup', 'SME', 'NGO', 'Cooperative', 'Individual']
  },
  {
    id: 'tmpl-bank-stmt',
    code: 'BANK_STMT_12M',
    name: 'Corporate Bank Account Statements (12 Months)',
    category: 'Financial Records',
    description: 'Official bank-stamped operational account statements for the past 12 consecutive months reflecting commercial cashflows and business transactions.',
    defaultMandatory: true,
    applicableApplicantTypes: ['Startup', 'SME', 'NGO', 'Cooperative']
  },
  {
    id: 'tmpl-fin-audited',
    code: 'FIN_AUDITED_2YR',
    name: 'Audited Financial Statements / Management Accounts (2–3 Years)',
    category: 'Financial Records',
    description: 'Chartered accountant certified or internal management profit & loss statements, balance sheets, and cash flow reports.',
    defaultMandatory: false,
    applicableApplicantTypes: ['SME', 'NGO', 'Cooperative']
  },
  {
    id: 'tmpl-biz-plan',
    code: 'BIZ_PLAN_NOTE',
    name: 'Comprehensive Business Plan or Concept Note',
    category: 'Operational & Strategy',
    description: 'A 15–30 page operational plan covering executive summary, target market, competitive advantage, management team, and grant deployment milestones.',
    defaultMandatory: true,
    applicableApplicantTypes: ['Startup', 'SME', 'NGO', 'Cooperative', 'Individual']
  },
  {
    id: 'tmpl-pitch-deck',
    code: 'PITCH_DECK',
    name: 'Professional Investor / Grant Pitch Deck (10–12 Slides)',
    category: 'Operational & Strategy',
    description: 'High-impact slide presentation summarizing the problem-solution fit, market traction, business model, and specific funding ask.',
    defaultMandatory: true,
    applicableApplicantTypes: ['Startup', 'SME', 'NGO', 'Cooperative', 'Individual']
  },
  {
    id: 'tmpl-ops-proof',
    code: 'OPS_PROOF',
    name: 'Proof of Commercial Operations & Facility Photos',
    category: 'Operational & Strategy',
    description: 'High-resolution photographs of production facilities, farm sites, customer receipts, off-taker agreements, or supplier MoUs.',
    defaultMandatory: true,
    applicableApplicantTypes: ['Startup', 'SME', 'NGO', 'Cooperative']
  },
  {
    id: 'tmpl-permits',
    code: 'REGULATORY_PERMITS',
    name: 'Sector Regulatory Permits (FDA, EPA, Standards Authority)',
    category: 'Compliance & Governance',
    description: 'Valid operating permits or certifications relevant to the sector (e.g. FDA food manufacturing registration, EPA environmental permit).',
    defaultMandatory: false,
    applicableApplicantTypes: ['Startup', 'SME']
  }
];

// Seed Document Requirements mapped to seed cases
function generateSeedRequirements() {
  return [
    {
      id: 'req-001',
      caseId: 'case-001',
      clientName: 'Cocoveg Farms',
      templateCode: 'ORC_REG_CERT',
      documentName: 'ORC / RGD Registration Certificate & Form 3',
      category: 'Legal & Registration',
      isMandatory: true,
      status: 'under_review',
      uploadedFile: {
        id: 'file-001',
        fileName: 'cocoveg_orc_certificate_2025.pdf',
        fileSize: '2.4 MB',
        mimeType: 'application/pdf',
        uploadedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        uploadedByType: 'client_link',
        downloadUrl: '#'
      },
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: '',
      notes: 'Client uploaded scanned copy; pending officer inspection of Form 3 renewal date.'
    },
    {
      id: 'req-002',
      caseId: 'case-001',
      clientName: 'Cocoveg Farms',
      templateCode: 'BANK_STMT_12M',
      documentName: 'Corporate Bank Account Statements (12 Months)',
      category: 'Financial Records',
      isMandatory: true,
      status: 'missing',
      uploadedFile: null,
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: '',
      notes: 'Requested from founder Kojo Adjei.'
    },
    {
      id: 'req-003',
      caseId: 'case-001',
      clientName: 'Cocoveg Farms',
      templateCode: 'BIZ_PLAN_NOTE',
      documentName: 'Comprehensive Business Plan or Concept Note',
      category: 'Operational & Strategy',
      isMandatory: true,
      status: 'verified',
      uploadedFile: {
        id: 'file-002',
        fileName: 'Cocoveg_Farms_Business_Plan_v3.pdf',
        fileSize: '4.8 MB',
        mimeType: 'application/pdf',
        uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        uploadedByType: 'staff',
        downloadUrl: '#'
      },
      verifiedBy: 'staff-03', // Kofi Mensah
      verifiedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      rejectionReason: '',
      notes: 'Reviewed and confirmed compliant with institutional donor standards.'
    },
    {
      id: 'req-004',
      caseId: 'case-002',
      clientName: 'Amacares',
      templateCode: 'ORC_REG_CERT',
      documentName: 'ORC / RGD Registration Certificate & Form 3',
      category: 'Legal & Registration',
      isMandatory: true,
      status: 'verified',
      uploadedFile: {
        id: 'file-003',
        fileName: 'Amacares_Health_ORC_Form3.pdf',
        fileSize: '1.9 MB',
        mimeType: 'application/pdf',
        uploadedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        uploadedByType: 'client_link',
        downloadUrl: '#'
      },
      verifiedBy: 'staff-03',
      verifiedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      rejectionReason: '',
      notes: 'Incorporation verified as Limited Liability with active annual renewal.'
    },
    {
      id: 'req-005',
      caseId: 'case-002',
      clientName: 'Amacares',
      templateCode: 'FIN_AUDITED_2YR',
      documentName: 'Audited Financial Statements / Management Accounts (2–3 Years)',
      category: 'Financial Records',
      isMandatory: true,
      status: 'correction_required',
      uploadedFile: {
        id: 'file-004',
        fileName: 'Amacares_Accounts_Draft.xlsx',
        fileSize: '850 KB',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        uploadedByType: 'client_link',
        downloadUrl: '#'
      },
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: 'The uploaded file is an uncertified internal draft. Mastercard Foundation requires chartered accountant signed financial statements or verified bank statements.',
      notes: 'Correction request issued to Dr. Ama Serwaa.'
    },
    {
      id: 'req-006',
      caseId: 'case-003',
      clientName: 'Union Farms',
      templateCode: 'OPS_PROOF',
      documentName: 'Proof of Commercial Operations & Land Lease',
      category: 'Operational & Strategy',
      isMandatory: true,
      status: 'missing',
      uploadedFile: null,
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: '',
      notes: 'Awaiting land lease registration documentation.'
    }
  ];
}

export const documentService = {
  getCaseRequirements(caseId = null) {
    const saved = localStorage.getItem(LOCAL_DOC_REQUIREMENTS_KEY);
    let allReqs = [];
    if (saved) {
      try {
        allReqs = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse doc requirements:', e);
      }
    } else {
      allReqs = [];
      localStorage.setItem(LOCAL_DOC_REQUIREMENTS_KEY, JSON.stringify([]));
    }

    if (caseId) {
      return allReqs.filter(r => r.caseId === caseId);
    }
    return allReqs;
  },

  saveCaseRequirements(reqs) {
    localStorage.setItem(LOCAL_DOC_REQUIREMENTS_KEY, JSON.stringify(reqs));
    return reqs;
  },

  async syncDocumentsFromSupabase() {
    if (!isSupabaseConfigured || !supabase) return this.getCaseRequirements();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return this.getCaseRequirements();

      const [{ data: reqRows }, { data: tokenRows }] = await Promise.all([
        supabase.from('case_doc_requirements').select('*').order('created_at', { ascending: false }),
        supabase.from('client_upload_tokens').select('*').order('created_at', { ascending: false })
      ]);

      if (Array.isArray(reqRows)) {
        this.saveCaseRequirements(reqRows.map(mapSupabaseReqRow));
      }
      if (Array.isArray(tokenRows)) {
        const mappedTokens = tokenRows.map(t => ({
          token: t.token,
          caseId: t.case_id,
          clientName: t.client_name,
          issuedBy: t.issued_by,
          issuedByName: t.issued_by_name,
          createdAt: t.created_at,
          expiresAt: t.expires_at,
          isRevoked: Boolean(t.is_revoked),
          revokedAt: t.revoked_at || null,
          revocationReason: t.revocation_reason || '',
          uploadUrl: t.upload_url
        }));
        localStorage.setItem(LOCAL_UPLOAD_TOKENS_KEY, JSON.stringify(mappedTokens));
      }
      return this.getCaseRequirements();
    } catch (e) {
      console.warn('Supabase documents sync skipped:', e);
      return this.getCaseRequirements();
    }
  },

  // Generates automatic checklist for a case based on applicant type
  generateChecklistForCase(caseId, clientName, applicantType = 'SME') {
    const existing = this.getCaseRequirements(caseId);
    if (existing.length > 0) return existing;

    const applicableTemplates = DOCUMENT_TEMPLATES.filter(t => 
      t.applicableApplicantTypes.includes(applicantType)
    );

    const newReqs = applicableTemplates.map(tmpl => ({
      id: typeof globalThis.crypto?.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      caseId,
      clientName,
      templateCode: tmpl.code,
      documentName: tmpl.name,
      category: tmpl.category,
      isMandatory: tmpl.defaultMandatory,
      status: 'missing',
      uploadedFile: null,
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: '',
      notes: tmpl.description
    }));

    const allReqs = this.getCaseRequirements();
    const updated = [...newReqs, ...allReqs];
    this.saveCaseRequirements(updated);

    if (isSupabaseConfigured && supabase && isUuid(caseId)) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) return;
        const rows = newReqs.map(r => ({
          id: isUuid(r.id) ? r.id : undefined,
          case_id: caseId,
          client_name: clientName,
          template_code: r.templateCode,
          document_name: r.documentName,
          category: r.category,
          is_mandatory: r.isMandatory,
          status: 'missing',
          notes: r.notes
        }));
        supabase.from('case_doc_requirements').insert(rows).then(({ error }) => {
          if (error) console.warn('Supabase checklist insert warning:', error.message);
        });
      });
    }

    return newReqs;
  },

  // Calculate completeness breakdown
  calculateCompleteness(caseId) {
    const reqs = this.getCaseRequirements(caseId);
    if (reqs.length === 0) {
      return { total: 0, verified: 0, uploaded: 0, missing: 0, percentage: 0 };
    }

    const mandatoryReqs = reqs.filter(r => r.isMandatory);
    const verified = mandatoryReqs.filter(r => r.status === 'verified').length;
    const uploaded = mandatoryReqs.filter(r => r.status === 'uploaded' || r.status === 'under_review').length;
    const missing = mandatoryReqs.filter(r => r.status === 'missing' || r.status === 'correction_required' || r.status === 'rejected').length;
    const total = mandatoryReqs.length;
    const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;

    return {
      total,
      verified,
      uploaded,
      underReview: uploaded,
      missing,
      percentage,
      isFullyVerified: verified === total && total > 0
    };
  },

  // Secure Token Generation for Client Upload Links (256-bit CSPRNG)
  generateUploadToken(caseId, clientName, expiresInHours = 72) {
    const currentStaff = authService.getCurrentUser();
    const randomBytes = new Uint8Array(32);
    globalThis.crypto.getRandomValues(randomBytes);
    const hexEntropy = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
    const rawToken = `tok_live_${hexEntropy}`;
    const expiresAt = new Date(Date.now() + expiresInHours * 3600000).toISOString();

    const tokenRecord = {
      token: rawToken,
      caseId,
      clientName,
      issuedBy: currentStaff.id,
      issuedByName: currentStaff.fullName,
      createdAt: new Date().toISOString(),
      expiresAt,
      isRevoked: false,
      uploadUrl: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}?token=${rawToken}`
    };

    const savedTokens = this.getAllTokens();
    localStorage.setItem(LOCAL_UPLOAD_TOKENS_KEY, JSON.stringify([tokenRecord, ...savedTokens]));

    if (isSupabaseConfigured && supabase && isUuid(caseId)) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) return;
        supabase.from('client_upload_tokens').insert({
          token: rawToken,
          case_id: caseId,
          client_name: clientName,
          issued_by: isUuid(currentStaff?.id) ? currentStaff.id : null,
          issued_by_name: currentStaff?.fullName || 'KIA Staff',
          expires_at: expiresAt,
          is_revoked: false,
          upload_url: tokenRecord.uploadUrl
        }).then(({ error }) => {
          if (error) console.warn('Supabase upload token insert warning:', error.message);
        });
      });
    }

    auditService.logEvent({
      entityType: 'upload_token',
      entityId: rawToken,
      action: 'generate_upload_token',
      notes: `Generated secure upload link for ${clientName} (valid for ${expiresInHours}h)`
    });

    return tokenRecord;
  },

  getAllTokens() {
    const saved = localStorage.getItem(LOCAL_UPLOAD_TOKENS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  },

  validateUploadToken(tokenString) {
    const tokens = this.getAllTokens();
    const found = tokens.find(t => t.token === tokenString);
    if (!found) {
      return { valid: false, error: 'Invalid or unknown upload link.' };
    }
    if (found.isRevoked) {
      return { valid: false, error: 'This upload link has been revoked by KIA-START UP CONSULT.' };
    }
    if (new Date() > new Date(found.expiresAt)) {
      return { valid: false, error: 'This upload link has expired. Please contact your grant officer for a fresh link.' };
    }
    return { valid: true, tokenRecord: found };
  },

  async validateUploadTokenAsync(tokenString) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('get_client_portal_by_token', {
          p_token: tokenString
        });
        if (!error && data) {
          if (!data.valid) {
            return { valid: false, error: data.error || 'Invalid or expired upload link.' };
          }
          const mappedReqs = Array.isArray(data.requirements)
            ? data.requirements.map(mapSupabaseReqRow)
            : [];
          return {
            valid: true,
            source: 'supabase',
            tokenRecord: data.tokenRecord,
            requirements: mappedReqs,
            caseSummary: data.caseSummary || null,
            applications: Array.isArray(data.applications) ? data.applications : []
          };
        }
      } catch (e) {
        console.warn('Supabase portal token RPC fallback:', e);
      }
    }
    const localVal = this.validateUploadToken(tokenString);
    if (!localVal.valid) return localVal;
    const localCase = await crmService.getCaseById(localVal.tokenRecord.caseId);
    const localApps = applicationService.getApplications().filter(a => a.caseId === localVal.tokenRecord.caseId);
    return {
      ...localVal,
      source: 'local',
      requirements: this.getCaseRequirements(localVal.tokenRecord.caseId),
      caseSummary: localCase ? {
        caseNumber: localCase.caseNumber,
        status: localCase.status,
        nextActionDescription: localCase.nextActionDescription,
        nextActionDueDate: localCase.nextActionDueDate,
        waitingReason: localCase.waitingReason
      } : null,
      applications: localApps
    };
  },

  revokeToken(tokenString, reason = 'Manually revoked by staff') {
    const tokens = this.getAllTokens();
    const updated = tokens.map(t => {
      if (t.token === tokenString) {
        return { ...t, isRevoked: true, revokedAt: new Date().toISOString(), revocationReason: reason };
      }
      return t;
    });
    localStorage.setItem(LOCAL_UPLOAD_TOKENS_KEY, JSON.stringify(updated));
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('client_upload_tokens')
        .update({ is_revoked: true, revoked_at: new Date().toISOString(), revocation_reason: reason })
        .eq('token', tokenString)
        .then(() => {});
    }
  },

  async getSignedDownloadUrl(storagePath) {
    if (!storagePath || !isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.storage
      .from('client-documents')
      .createSignedUrl(storagePath, 3600);
    if (error) throw new Error(error.message);
    return data?.signedUrl || null;
  },

  // Client uploads file against a requirement
  async uploadClientFile(requirementId, { file = null, fileName, fileSize, mimeType, clientNote = '' }, tokenString = null) {
    let storagePath = null;

    if (isSupabaseConfigured && supabase && tokenString && isUuid(requirementId)) {
      let targetCaseId = null;
      const portalCheck = await this.validateUploadTokenAsync(tokenString);
      if (!portalCheck.valid) {
        throw new Error(portalCheck.error || 'Invalid upload token.');
      }
      const matchedReq = (portalCheck.requirements || []).find(r => r.id === requirementId);
      if (!matchedReq) {
        throw new Error('ACCESS DENIED: Upload token does not match this requirement.');
      }
      targetCaseId = matchedReq.caseId;

      if (file) {
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        storagePath = `${targetCaseId}/${requirementId}/${Date.now()}_${safeName}`;
        const { error: uploadErr } = await supabase.storage
          .from('client-documents')
          .upload(storagePath, file, { contentType: mimeType || 'application/octet-stream', upsert: true });
        if (uploadErr) {
          throw new Error(`File upload failed: ${uploadErr.message}`);
        }
      }

      const { data: rpcData, error: rpcErr } = await supabase.rpc('record_client_document_upload', {
        p_token: tokenString,
        p_requirement_id: requirementId,
        p_file_name: fileName,
        p_file_size: fileSize,
        p_mime_type: mimeType,
        p_storage_path: storagePath || '',
        p_client_note: clientNote || ''
      });
      if (rpcErr) {
        throw new Error(rpcErr.message);
      }

      // Sync local cache if requirement exists locally
      const allReqs = this.getCaseRequirements();
      if (allReqs.some(r => r.id === requirementId)) {
        const updatedLocal = allReqs.map(r =>
          r.id === requirementId
            ? {
                ...r,
                status: 'under_review',
                uploadedFile: rpcData?.uploadedFile || { fileName, fileSize, mimeType, storagePath, clientNote, uploadedAt: new Date().toISOString() },
                rejectionReason: '',
                notes: clientNote ? `Client Note: ${clientNote}` : r.notes
              }
            : r
        );
        this.saveCaseRequirements(updatedLocal);
      }

      return { id: requirementId, status: 'under_review', uploadedFile: rpcData?.uploadedFile };
    }

    const allReqs = this.getCaseRequirements();
    const req = allReqs.find(r => r.id === requirementId);
    if (!req) throw new Error('Requirement not found');

    if (tokenString) {
      const tokenCheck = this.validateUploadToken(tokenString);
      if (!tokenCheck.valid) {
        throw new Error(tokenCheck.error || 'Invalid upload token.');
      }
      if (tokenCheck.tokenRecord.caseId !== req.caseId) {
        throw new Error('ACCESS DENIED: Upload token does not match this client case.');
      }
    }

    const uploadedFile = {
      id: `file-${Date.now().toString().slice(-6)}`,
      fileName,
      fileSize,
      mimeType,
      storagePath,
      clientNote,
      uploadedAt: new Date().toISOString(),
      uploadedByType: 'client_link',
      downloadUrl: '#'
    };

    const updated = allReqs.map(r => {
      if (r.id === requirementId) {
        return {
          ...r,
          status: 'under_review',
          uploadedFile,
          rejectionReason: '',
          notes: clientNote ? `Client Note: ${clientNote}` : r.notes
        };
      }
      return r;
    });

    this.saveCaseRequirements(updated);

    // Automatically spawn verification task for the officer
    await taskService.createTask({
      caseId: req.caseId,
      clientName: req.clientName,
      title: `Verify Uploaded Document: ${req.documentName}`,
      description: `Client submitted "${fileName}" via secure upload portal. Review authenticity and verify Form/TIN details.`,
      priority: 'high',
      dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0] // 24hr review SLA!
    });

    await auditService.logEvent({
      entityType: 'document',
      entityId: req.id,
      action: 'client_upload',
      newState: { status: 'under_review', fileName },
      notes: `Client uploaded "${fileName}" for ${req.documentName}`
    });

    return updated.find(r => r.id === requirementId);
  },

  // Staff Review: Verify Document
  async verifyDocument(requirementId, notes = '') {
    const currentStaff = authService.getCurrentUser();
    const allReqs = this.getCaseRequirements();
    const req = allReqs.find(r => r.id === requirementId);
    if (!req) throw new Error('Requirement not found');

    const updated = allReqs.map(r => {
      if (r.id === requirementId) {
        return {
          ...r,
          status: 'verified',
          verifiedBy: currentStaff.id,
          verifiedByName: currentStaff.fullName,
          verifiedAt: new Date().toISOString(),
          rejectionReason: '',
          notes: notes || 'Verified as compliant by staff.'
        };
      }
      return r;
    });

    this.saveCaseRequirements(updated);

    if (isSupabaseConfigured && supabase && isUuid(requirementId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('case_doc_requirements')
          .update({
            status: 'verified',
            verified_by: isUuid(currentStaff?.id) ? currentStaff.id : null,
            verified_by_name: currentStaff?.fullName || null,
            verified_at: new Date().toISOString(),
            rejection_reason: '',
            notes: notes || 'Verified as compliant by staff.'
          })
          .eq('id', requirementId);
      }
    }

    await auditService.logEvent({
      entityType: 'document',
      entityId: req.id,
      action: 'verify_document',
      previousState: { status: req.status },
      newState: { status: 'verified' },
      notes: `Verified ${req.documentName} for ${req.clientName}`
    });

    return updated.find(r => r.id === requirementId);
  },

  // Staff Review: Reject Document with specific correction instructions
  async rejectDocument(requirementId, rejectionReason) {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error('A specific correction reason is required when rejecting a document.');
    }

    const currentStaff = authService.getCurrentUser();
    const allReqs = this.getCaseRequirements();
    const req = allReqs.find(r => r.id === requirementId);
    if (!req) throw new Error('Requirement not found');

    const updated = allReqs.map(r => {
      if (r.id === requirementId) {
        return {
          ...r,
          status: 'correction_required',
          verifiedBy: null,
          verifiedAt: null,
          rejectionReason: rejectionReason.trim(),
          rejectedBy: currentStaff.id,
          rejectedAt: new Date().toISOString()
        };
      }
      return r;
    });

    this.saveCaseRequirements(updated);

    if (isSupabaseConfigured && supabase && isUuid(requirementId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('case_doc_requirements')
          .update({
            status: 'correction_required',
            verified_by: null,
            verified_at: null,
            rejection_reason: rejectionReason.trim()
          })
          .eq('id', requirementId);
      }
    }

    // Create follow-up task
    await taskService.createTask({
      caseId: req.caseId,
      clientName: req.clientName,
      title: `Follow Up Document Correction: ${req.documentName}`,
      description: `Rejected document due to: "${rejectionReason}". Send correction link to client.`,
      priority: 'high',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
    });

    await auditService.logEvent({
      entityType: 'document',
      entityId: req.id,
      action: 'reject_document',
      previousState: { status: req.status },
      newState: { status: 'correction_required', rejectionReason },
      notes: `Rejected ${req.documentName}: ${rejectionReason}`
    });

    return updated.find(r => r.id === requirementId);
  }
};
