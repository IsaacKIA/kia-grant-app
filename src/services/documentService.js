import { auditService } from './auditService';
import { taskService } from './taskService';
import { authService } from './authService';

const LOCAL_DOC_REQUIREMENTS_KEY = 'kia_case_doc_requirements_v2';
const LOCAL_UPLOAD_TOKENS_KEY = 'kia_upload_tokens_v2';

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
    }
    if (!allReqs || allReqs.length === 0) {
      allReqs = generateSeedRequirements();
      localStorage.setItem(LOCAL_DOC_REQUIREMENTS_KEY, JSON.stringify(allReqs));
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

  // Generates automatic checklist for a case based on applicant type
  generateChecklistForCase(caseId, clientName, applicantType = 'SME') {
    const existing = this.getCaseRequirements(caseId);
    if (existing.length > 0) return existing;

    const applicableTemplates = DOCUMENT_TEMPLATES.filter(t => 
      t.applicableApplicantTypes.includes(applicantType)
    );

    const newReqs = applicableTemplates.map(tmpl => ({
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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

  // Secure Token Generation for Client Upload Links
  generateUploadToken(caseId, clientName, expiresInHours = 72) {
    const currentStaff = authService.getCurrentUser();
    const rawToken = `tok_live_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
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

  revokeToken(tokenString, reason = 'Manually revoked by staff') {
    const tokens = this.getAllTokens();
    const updated = tokens.map(t => {
      if (t.token === tokenString) {
        return { ...t, isRevoked: true, revokedAt: new Date().toISOString(), revocationReason: reason };
      }
      return t;
    });
    localStorage.setItem(LOCAL_UPLOAD_TOKENS_KEY, JSON.stringify(updated));
  },

  // Client uploads file against a requirement
  async uploadClientFile(requirementId, { fileName, fileSize, mimeType, clientNote = '' }) {
    const allReqs = this.getCaseRequirements();
    const req = allReqs.find(r => r.id === requirementId);
    if (!req) throw new Error('Requirement not found');

    const uploadedFile = {
      id: `file-${Date.now().toString().slice(-6)}`,
      fileName,
      fileSize,
      mimeType,
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
