import { auditService } from './auditService';
import { taskService } from './taskService';
import { authService, STAFF_USERS } from './authService';
import { crmService } from './crmService';
import { grantService } from './grantService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(val) {
  return typeof val === 'string' && UUID_REGEX.test(val);
}

const LOCAL_APPLICATIONS_KEY = 'kia_grant_applications_v3';

export const APPLICATION_STAGES = [
  { id: 'opportunity_selected', label: '1. Opportunity Selected', color: 'border-blue-500 bg-blue-50/50' },
  { id: 'proposal_preparation', label: '2. Proposal Narrative', color: 'border-indigo-500 bg-indigo-50/50' },
  { id: 'budget_preparation', label: '3. Milestone Budget', color: 'border-purple-500 bg-purple-50/50' },
  { id: 'internal_review', label: '4. Internal QA Gate', color: 'border-amber-500 bg-amber-50/50' },
  { id: 'approved_for_submission', label: '5. Approved for Submission', color: 'border-emerald-500 bg-emerald-50/50' },
  { id: 'submitted', label: '6. Submitted to Funder', color: 'border-teal-600 bg-teal-50/50' },
  { id: 'under_funder_review', label: '7. Under Funder Review', color: 'border-cyan-600 bg-cyan-50/50' },
  { id: 'awarded', label: '8. Awarded & Success Fee', color: 'border-emerald-600 bg-emerald-100/50' },
  { id: 'rejected', label: '9. Outcome: Not Funded', color: 'border-rose-400 bg-rose-50/50' }
];

function generateSeedApplications() {
  return [
    {
      id: 'app-001',
      applicationNumber: 'APP-2026-0001',
      caseId: 'case-001',
      clientName: 'Cocoveg Farms',
      opportunityId: 'grant-01',
      grantTitle: 'GEA / World Bank YouStart (High-Growth SME Window)',
      assignedOfficerId: 'staff-03', // Kofi Mensah
      status: 'proposal_preparation',
      targetFundingAmount: 250000,
      currency: 'GHS',
      funderDeadline: '2026-05-30',
      internalQaDeadline: '2026-05-15',
      proposalSummary: 'Expansion of cold-storage facility and youth outgrower vegetable aggregation in Asamankese.',
      budgetSummary: 'Cold-chain equipment (GHS 150k), outgrower training (GHS 40k), working capital (GHS 60k).',
      qaReview: null,
      clientConfirmedAt: null,
      submissionReferenceNumber: '',
      submissionEvidenceUrl: '',
      submittedAt: null,
      submittedBy: null,
      outcomeStatus: null,
      awardedAmount: null,
      awardDate: null,
      awardEvidenceUrl: '',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'app-002',
      applicationNumber: 'APP-2026-0002',
      caseId: 'case-002',
      clientName: 'Amacares',
      opportunityId: 'grant-04',
      grantTitle: 'Tony Elumelu Foundation (TEF) Entrepreneurship Programme',
      assignedOfficerId: 'staff-03', // Kofi Mensah
      status: 'internal_review', // Currently in QA Gate!
      targetFundingAmount: 75000,
      currency: 'GHS',
      funderDeadline: '2026-03-31',
      internalQaDeadline: '2026-03-20',
      proposalSummary: 'Mobile-enabled telemedicine delivery connecting rural clinics with specialist physicians in Greater Accra.',
      budgetSummary: 'Software cloud infrastructure, nurse diagnostic toolkits, and pilot clinic outreach.',
      qaReview: null, // Pending QA sign-off!
      clientConfirmedAt: '2026-02-10T14:00:00Z',
      submissionReferenceNumber: '',
      submissionEvidenceUrl: '',
      submittedAt: null,
      submittedBy: null,
      outcomeStatus: null,
      awardedAmount: null,
      awardDate: null,
      awardEvidenceUrl: '',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
    },
    {
      id: 'app-003',
      applicationNumber: 'APP-2026-0003',
      caseId: 'case-002',
      clientName: 'Amacares',
      opportunityId: 'grant-02',
      grantTitle: 'Mastercard Foundation / Agri-Impact (HAPPY Project)',
      assignedOfficerId: 'staff-03',
      status: 'opportunity_selected',
      targetFundingAmount: 400000,
      currency: 'GHS',
      funderDeadline: '2026-06-30',
      internalQaDeadline: '2026-06-15',
      proposalSummary: 'Nutrition and healthcare screening integration across outgrower farming settlements.',
      budgetSummary: 'Diagnostic supplies and mobile field operations.',
      qaReview: null,
      clientConfirmedAt: null,
      submissionReferenceNumber: '',
      submissionEvidenceUrl: '',
      submittedAt: null,
      submittedBy: null,
      outcomeStatus: null,
      awardedAmount: null,
      awardDate: null,
      awardEvidenceUrl: '',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ];
}

export const applicationService = {
  getApplications() {
    const saved = localStorage.getItem(LOCAL_APPLICATIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved applications:', e);
      }
    }
    localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify([]));
    return [];
  },

  saveApplications(apps) {
    localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(apps));
    return apps;
  },

  async syncApplicationsFromSupabase() {
    if (!isSupabaseConfigured || !supabase) return this.getApplications();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return this.getApplications();

      const { data, error } = await supabase
        .from('grant_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !Array.isArray(data)) return this.getApplications();

      const cached = this.getApplications();
      const mapped = data.map(row => {
        const localMatch = cached.find(a => a.id === row.id || a.applicationNumber === row.application_number);
        return {
          id: row.id,
          applicationNumber: row.application_number,
          caseId: row.case_id,
          clientName: row.client_name,
          opportunityId: row.opportunity_id,
          grantTitle: row.grant_title,
          funder: row.funder || localMatch?.funder || '',
          assignedOfficerId: row.assigned_officer_id || localMatch?.assignedOfficerId || null,
          status: row.status || 'opportunity_selected',
          targetFundingAmount: Number(row.target_funding_amount) || 0,
          currency: localMatch?.currency || 'GHS',
          funderDeadline: row.funder_deadline || '2026-12-31',
          internalQaDeadline: localMatch?.internalQaDeadline || row.funder_deadline || '2026-12-15',
          proposalSummary: localMatch?.proposalSummary || '',
          budgetSummary: localMatch?.budgetSummary || '',
          qaReview: row.qa_reviewed_at
            ? {
                decision: row.qa_status === 'approved' ? 'approved' : 'revisions_required',
                feedbackNotes: row.qa_notes || '',
                reviewedBy: row.qa_reviewed_by,
                reviewedAt: row.qa_reviewed_at
              }
            : (localMatch?.qaReview || null),
          submissionReferenceNumber: row.submission_reference_number || '',
          submissionEvidenceUrl: row.submission_evidence_url || '',
          submittedAt: row.submitted_at || null,
          submittedBy: row.submitted_by || null,
          outcomeStatus: row.status === 'awarded' || row.status === 'rejected' ? row.status : null,
          awardedAmount: row.awarded_amount ? Number(row.awarded_amount) : null,
          createdAt: row.created_at
        };
      });

      return this.saveApplications(mapped);
    } catch (e) {
      console.warn('Supabase applications sync skipped:', e);
      return this.getApplications();
    }
  },

  async updateApplicationStage(applicationId, newStage, updates = {}) {
    return this.updateStage(applicationId, newStage, updates);
  },

  async adoptOpportunity({ caseId, clientName, opportunityId, targetFundingAmount }) {
    const currentStaff = authService.getCurrentUser();
    const grant = grantService.getGrantById(opportunityId);
    if (!grant) throw new Error('Grant opportunity not found');

    const apps = this.getApplications();
    const appNumber = `APP-2026-${String(apps.length + 1).padStart(4, '0')}`;
    let appId = `app-${Date.now().toString().slice(-6)}`;
    const resolvedTarget = Number(targetFundingAmount) || grant.minFundingAmount || 100000;
    const resolvedDeadline = grant.closingDate || '2026-12-31';

    if (isSupabaseConfigured && supabase && isUuid(caseId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: row, error } = await supabase
          .from('grant_applications')
          .insert({
            application_number: appNumber,
            case_id: caseId,
            client_name: clientName,
            opportunity_id: opportunityId,
            grant_title: grant.title,
            funder: grant.fundingOrganization || '',
            status: 'opportunity_selected',
            assigned_officer_id: isUuid(currentStaff?.id) ? currentStaff.id : null,
            target_funding_amount: resolvedTarget,
            funder_deadline: resolvedDeadline
          })
          .select()
          .single();
        if (!error && row?.id) appId = row.id;
      }
    }

    const newApp = {
      id: appId,
      applicationNumber: appNumber,
      caseId,
      clientName,
      opportunityId,
      grantTitle: grant.title,
      assignedOfficerId: currentStaff.id,
      status: 'opportunity_selected',
      targetFundingAmount: resolvedTarget,
      currency: grant.currency || 'GHS',
      funderDeadline: resolvedDeadline,
      internalQaDeadline: new Date(new Date(grant.closingDate || '2026-12-31').getTime() - 14 * 86400000).toISOString().split('T')[0],
      proposalSummary: '',
      budgetSummary: '',
      qaReview: null,
      clientConfirmedAt: null,
      submissionReferenceNumber: '',
      submissionEvidenceUrl: '',
      submittedAt: null,
      submittedBy: null,
      outcomeStatus: null,
      awardedAmount: null,
      awardDate: null,
      awardEvidenceUrl: '',
      createdAt: new Date().toISOString()
    };

    const updated = [newApp, ...apps];
    this.saveApplications(updated);

    // Create tracking task for assigned officer
    await taskService.createTask({
      caseId,
      clientName,
      title: `Draft Grant Proposal: ${grant.title}`,
      description: `Draft narrative addressing ${grant.donorFocus}. Funder deadline is ${newApp.funderDeadline}.`,
      priority: 'high',
      dueDate: newApp.internalQaDeadline
    });

    await auditService.logEvent({
      entityType: 'application',
      entityId: newApp.id,
      action: 'adopt_grant_application',
      newState: newApp,
      notes: `Created application ${appNumber} for ${clientName} targeting ${grant.title}`
    });

    return newApp;
  },

  async updateStage(applicationId, newStage, updates = {}) {
    const apps = this.getApplications();
    const target = apps.find(a => a.id === applicationId);
    if (!target) throw new Error('Application not found');

    // Rule: Cannot move to approved_for_submission without QA approval
    if (newStage === 'approved_for_submission' && (!target.qaReview || target.qaReview.decision !== 'approved')) {
      throw new Error('Approval blocked: Application must undergo Internal Review and receive QA sign-off from the Team Leader.');
    }

    // Rule: Cannot move to submitted without submission evidence
    if (newStage === 'submitted' && (!updates.submissionReferenceNumber && !target.submissionReferenceNumber)) {
      throw new Error('Submission blocked: You must record the official funder submission reference number and evidence screenshot.');
    }

    const updated = apps.map(a => {
      if (a.id === applicationId) {
        return {
          ...a,
          ...updates,
          status: newStage,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });

    this.saveApplications(updated);

    if (isSupabaseConfigured && supabase && isUuid(applicationId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('grant_applications')
          .update({ status: newStage, updated_at: new Date().toISOString() })
          .eq('id', applicationId);
      }
    }

    await auditService.logEvent({
      entityType: 'application',
      entityId: applicationId,
      action: 'update_application_stage',
      previousState: { status: target.status },
      newState: { status: newStage },
      notes: `Application ${target.applicationNumber} transitioned to ${newStage}`
    });

    return updated.find(a => a.id === applicationId);
  },

  async recordQaReview(applicationId, { decision, feedbackNotes }) {
    const currentStaff = authService.getCurrentUser();
    if (currentStaff.role !== 'team_leader' && currentStaff.role !== 'ceo' && currentStaff.role !== 'admin') {
      throw new Error('Only the Grant Application Team Leader or CEO can sign off on Internal Review QA gates.');
    }

    const apps = this.getApplications();
    const target = apps.find(a => a.id === applicationId);
    if (!target) throw new Error('Application not found');

    const qaReview = {
      decision, // 'approved' or 'revisions_required'
      feedbackNotes,
      reviewedBy: currentStaff.id,
      reviewedByName: currentStaff.fullName,
      reviewedAt: new Date().toISOString()
    };

    const nextStatus = decision === 'approved' ? 'approved_for_submission' : 'proposal_preparation';

    const updated = apps.map(a => {
      if (a.id === applicationId) {
        return {
          ...a,
          qaReview,
          status: nextStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });

    this.saveApplications(updated);

    if (isSupabaseConfigured && supabase && isUuid(applicationId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('grant_applications')
          .update({
            status: nextStatus,
            qa_status: decision === 'approved' ? 'approved' : 'revisions_required',
            qa_reviewed_by: isUuid(currentStaff?.id) ? currentStaff.id : null,
            qa_reviewed_at: qaReview.reviewedAt,
            qa_notes: feedbackNotes || ''
          })
          .eq('id', applicationId);
      }
    }

    // If revisions required, create revision task for officer
    if (decision !== 'approved') {
      await taskService.createTask({
        caseId: target.caseId,
        clientName: target.clientName,
        title: `Execute QA Revisions: ${target.grantTitle}`,
        description: `Team Leader requested revisions: "${feedbackNotes}".`,
        priority: 'urgent',
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
      });
    }

    await auditService.logEvent({
      entityType: 'application',
      entityId: applicationId,
      action: 'qa_review',
      newState: { decision, status: nextStatus },
      notes: `QA Gate ${decision.toUpperCase()} by ${currentStaff.fullName}: ${feedbackNotes}`
    });

    return updated.find(a => a.id === applicationId);
  },

  async recordSubmissionEvidence(applicationId, { submissionReferenceNumber, submissionEvidenceUrl, notes = '' }) {
    if (!submissionReferenceNumber || !submissionReferenceNumber.trim()) {
      throw new Error('A valid funder submission reference ID or application portal confirmation code is strictly required.');
    }

    const currentStaff = authService.getCurrentUser();
    const apps = this.getApplications();
    const target = apps.find(a => a.id === applicationId);
    if (!target) throw new Error('Application not found');

    const updated = apps.map(a => {
      if (a.id === applicationId) {
        return {
          ...a,
          status: 'submitted',
          submissionReferenceNumber: submissionReferenceNumber.trim(),
          submissionEvidenceUrl: submissionEvidenceUrl || 'Evidence uploaded to private storage',
          submittedAt: new Date().toISOString(),
          submittedBy: currentStaff.id,
          submittedByName: currentStaff.fullName,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });

    this.saveApplications(updated);

    if (isSupabaseConfigured && supabase && isUuid(applicationId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('grant_applications')
          .update({
            status: 'submitted',
            submission_reference_number: submissionReferenceNumber.trim(),
            submission_evidence_url: submissionEvidenceUrl || 'Evidence uploaded to private storage',
            submitted_at: new Date().toISOString(),
            submitted_by: isUuid(currentStaff?.id) ? currentStaff.id : null
          })
          .eq('id', applicationId);
      }
    }

    // Create monitoring task for funder announcements
    await taskService.createTask({
      caseId: target.caseId,
      clientName: target.clientName,
      title: `Monitor Funder Decision: ${target.grantTitle}`,
      description: `Application successfully submitted under Ref: ${submissionReferenceNumber}. Monitor evaluation updates.`,
      priority: 'medium',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    });

    await auditService.logEvent({
      entityType: 'application',
      entityId: applicationId,
      action: 'record_submission_evidence',
      newState: { status: 'submitted', submissionReferenceNumber },
      notes: `Verified submission evidence recorded for ${target.applicationNumber}. Ref: ${submissionReferenceNumber}`
    });

    return updated.find(a => a.id === applicationId);
  },

  async recordOutcome(applicationId, { outcomeStatus, awardedAmount, awardEvidenceUrl, notes = '' }) {
    const currentStaff = authService.getCurrentUser();
    const apps = this.getApplications();
    const target = apps.find(a => a.id === applicationId);
    if (!target) throw new Error('Application not found');

    const isAwarded = outcomeStatus === 'awarded';
    const parsedAmount = isAwarded ? Number(awardedAmount) : null;

    const updated = apps.map(a => {
      if (a.id === applicationId) {
        return {
          ...a,
          status: isAwarded ? 'awarded' : 'rejected',
          outcomeStatus,
          awardedAmount: parsedAmount,
          awardDate: isAwarded ? new Date().toISOString().split('T')[0] : null,
          awardEvidenceUrl: awardEvidenceUrl || '',
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });

    this.saveApplications(updated);

    if (isSupabaseConfigured && supabase && isUuid(applicationId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('grant_applications')
          .update({
            status: isAwarded ? 'awarded' : 'rejected',
            awarded_amount: parsedAmount,
            outcome_notes: notes || ''
          })
          .eq('id', applicationId);
      }
    }

    // If awarded, calculate 5% contractual success fee obligation and issue invoice
    if (isAwarded && parsedAmount > 0) {
      const successFee = Math.round(parsedAmount * 0.05); // 5% standard success fee
      const { financeService } = await import('./financeService');
      await financeService.createInvoice({
        caseId: target.caseId,
        clientName: target.clientName,
        invoiceType: 'success_fee',
        items: [
          {
            description: `Contractual Success Fee (5%) on Grant Award: ${target.grantTitle} (GH₵ ${parsedAmount.toLocaleString()} awarded)`,
            quantity: 1,
            unitPrice: successFee
          }
        ],
        notes: `Auto-generated upon grant award confirmation for ${target.applicationNumber}.`
      });

      const financeOfficer = STAFF_USERS.find(u => u.role === 'finance_officer' && u.isActive !== false)
        || STAFF_USERS[0];

      await taskService.createTask({
        caseId: target.caseId,
        clientName: target.clientName,
        title: `Collect Contractual Success Fee: GH₵ ${successFee.toLocaleString()}`,
        description: `Client awarded GH₵ ${parsedAmount.toLocaleString()} from ${target.grantTitle}. 5% success fee invoice has been issued; follow up and confirm payment.`,
        priority: 'urgent',
        assignedToId: financeOfficer?.id || 'staff-01',
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
      });
    }

    await auditService.logEvent({
      entityType: 'application',
      entityId: applicationId,
      action: 'record_outcome',
      newState: { status: isAwarded ? 'awarded' : 'rejected', awardedAmount: parsedAmount },
      notes: `Recorded outcome ${outcomeStatus.toUpperCase()} for ${target.applicationNumber}`
    });

    return updated.find(a => a.id === applicationId);
  }
};

