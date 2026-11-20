import { authService, STAFF_USERS } from './authService';
import { auditService } from './auditService';
import { supabase, isSupabaseConfigured, isUuid } from '../lib/supabase';

export const CASE_STATUS_CONFIG = {
  intake: { label: 'Intake / New', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  onboarding_fee_pending: { label: 'Fee Pending', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  documentation: { label: 'Documentation', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  readiness_assessment: { label: 'Readiness Diagnostic', color: 'bg-purple-50 text-purple-700 border-purple-300' },
  grant_matching: { label: 'Grant Matching', color: 'bg-indigo-50 text-indigo-700 border-indigo-300' },
  application_development: { label: 'Application Drafting', color: 'bg-pink-50 text-pink-700 border-pink-300' },
  internal_review: { label: 'Internal Review / QA', color: 'bg-cyan-50 text-cyan-700 border-cyan-300' },
  approved_for_submission: { label: 'Approved for Submission', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  submitted: { label: 'Submitted to Funder', color: 'bg-emerald-600 text-white border-emerald-700' },
  under_funder_review: { label: 'Under Funder Review', color: 'bg-teal-50 text-teal-700 border-teal-300' },
  outcome_recorded: { label: 'Outcome Finalized', color: 'bg-slate-200 text-slate-800 border-slate-400' },
  waiting_on_client: { label: 'Waiting on Client', color: 'bg-orange-50 text-orange-700 border-orange-300' },
  on_hold: { label: 'On Hold', color: 'bg-slate-100 text-slate-600 border-slate-300' },
  closed: { label: 'Closed', color: 'bg-slate-200 text-slate-600 border-slate-400' }
};

const LOCAL_CRM_CASES_KEY = 'kia_crm_cases_v3';

// Standard operational baseline seed cases mapped from initial clients, with explicit accountability
function generateSeedCases() {
  return [
    {
      id: 'case-001',
      caseNumber: 'KIA-CASE-2026-0001',
      legalName: 'Cocoveg Farms Enterprise',
      tradingName: 'Cocoveg Farms',
      applicantType: 'SME',
      sector: 'Agribusiness',
      businessStage: 'Early-stage Growth',
      region: 'Eastern Region',
      registrationNumber: 'BN-8923412',
      tinNumber: 'P0019827364',
      primaryContact: {
        fullName: 'Kojo Adjei',
        title: 'Managing Director',
        phone: '+233 24 555 1234',
        email: 'kojo@cocoveg.com',
        whatsapp: '+233 24 555 1234'
      },
      currentOfficerId: 'staff-03', // Kofi Mensah
      status: 'documentation',
      onboardingDate: '2026-01-15',
      lastActivityAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      nextActionDescription: 'Verify uploaded ORC Form 3 renewal and corporate bank statements.',
      nextActionDueDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], // Overdue!
      waitingReason: '',
      inactivityFlag: false,
      engagementFee: {
        invoiceNumber: 'INV-2026-0001',
        amountDue: 200,
        amountPaid: 200,
        isVerified: true,
        verifiedBy: 'staff-05', // Emmanuel Darko (Finance)
        transactionRef: 'MTN-MOMO-892341'
      },
      targetGrantSize: 'GHS 100,000 – GHS 500,000',
      activeApplicationsCount: 1
    },
    {
      id: 'case-002',
      caseNumber: 'KIA-CASE-2026-0002',
      legalName: 'Amacares Health Solutions Ltd',
      tradingName: 'Amacares',
      applicantType: 'Startup',
      sector: 'Technology & Services',
      businessStage: 'Early-stage',
      region: 'Greater Accra',
      registrationNumber: 'CS-4412920',
      tinNumber: 'C0087612341',
      primaryContact: {
        fullName: 'Dr. Ama Serwaa',
        title: 'Co-Founder & CEO',
        phone: '+233 20 888 4321',
        email: 'ama@amacares.org',
        whatsapp: '+233 20 888 4321'
      },
      currentOfficerId: 'staff-03', // Kofi Mensah
      status: 'grant_matching',
      onboardingDate: '2026-01-20',
      lastActivityAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      nextActionDescription: 'Confirm eligible windows for TEF & Mastercard Foundation HAPPY Project.',
      nextActionDueDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], // Overdue!
      waitingReason: '',
      inactivityFlag: false,
      engagementFee: {
        invoiceNumber: 'INV-2026-0002',
        amountDue: 200,
        amountPaid: 200,
        isVerified: true,
        verifiedBy: 'staff-05',
        transactionRef: 'STANBIC-EFT-99120'
      },
      targetGrantSize: 'GHS 200,000 – GHS 1,000,000',
      activeApplicationsCount: 2
    },
    {
      id: 'case-003',
      caseNumber: 'KIA-CASE-2026-0003',
      legalName: 'Union Farms Cooperative Union',
      tradingName: 'Union Farms',
      applicantType: 'Cooperative',
      sector: 'Agribusiness',
      businessStage: 'Growth',
      region: 'Ashanti Region',
      registrationNumber: 'CO-119283',
      tinNumber: 'P007823412',
      primaryContact: {
        fullName: 'Kwabena Darko',
        title: 'Chairman',
        phone: '+233 24 333 9988',
        email: 'unionfarms@gmail.com',
        whatsapp: '+233 24 333 9988'
      },
      currentOfficerId: 'staff-04', // Efua Addo
      status: 'documentation',
      onboardingDate: '2026-02-01',
      lastActivityAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      nextActionDescription: 'Receive and inspect 10-year agricultural land lease agreement.',
      nextActionDueDate: new Date().toISOString().split('T')[0], // Due Today!
      waitingReason: 'Waiting on client to scan physical lease from Kumasi lands commission.',
      inactivityFlag: false,
      engagementFee: {
        invoiceNumber: 'INV-2026-0003',
        amountDue: 200,
        amountPaid: 200,
        isVerified: true,
        verifiedBy: 'staff-05',
        transactionRef: 'GCB-DEP-4491'
      },
      targetGrantSize: 'GHS 150,000 – GHS 600,000',
      activeApplicationsCount: 1
    },
    {
      id: 'case-004',
      caseNumber: 'KIA-CASE-2026-0004',
      legalName: 'Noor Ventures Enterprise',
      tradingName: 'Noor Ventures',
      applicantType: 'Individual / Startup',
      sector: 'General Commerce & Services',
      businessStage: 'Idea / Pre-revenue',
      region: 'Northern Region',
      registrationNumber: 'Pending ORC',
      tinNumber: 'GHA-78912345-0',
      primaryContact: {
        fullName: 'Amina Mohammed',
        title: 'Proprietor',
        phone: '+233 55 111 2244',
        email: 'noor.ventures@yahoo.com',
        whatsapp: '+233 55 111 2244'
      },
      currentOfficerId: 'staff-04', // Efua Addo
      status: 'onboarding_fee_pending',
      onboardingDate: '2026-02-10',
      lastActivityAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      nextActionDescription: 'Follow up on payment confirmation of GH₵200 engagement fee.',
      nextActionDueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
      waitingReason: 'Client claims MoMo transferred; Finance verifying statement.',
      inactivityFlag: false,
      engagementFee: {
        invoiceNumber: 'INV-2026-0004',
        amountDue: 200,
        amountPaid: 0,
        isVerified: false,
        verifiedBy: null,
        transactionRef: ''
      },
      targetGrantSize: 'GHS 20,000 – GHS 100,000',
      activeApplicationsCount: 0
    },
    {
      id: 'case-005',
      caseNumber: 'KIA-CASE-2026-0005',
      legalName: 'Gadak Agro Service Limited',
      tradingName: 'Gadak Agro',
      applicantType: 'SME',
      sector: 'Agribusiness',
      businessStage: 'Early-stage Growth',
      region: 'Volta Region',
      registrationNumber: 'CS-7718902',
      tinNumber: 'C009918234',
      primaryContact: {
        fullName: 'Gershon Gadakor',
        title: 'CEO',
        phone: '+233 24 999 7766',
        email: 'gadakagro@gmail.com',
        whatsapp: '+233 24 999 7766'
      },
      currentOfficerId: 'staff-03', // Kofi Mensah
      status: 'readiness_assessment',
      onboardingDate: '2026-02-05',
      lastActivityAt: new Date(Date.now() - 9 * 86400000).toISOString(), // > 7 days -> Inactivity Warning!
      nextActionDescription: 'Complete 20-metric readiness diagnostic interview.',
      nextActionDueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      waitingReason: '',
      inactivityFlag: true,
      engagementFee: {
        invoiceNumber: 'INV-2026-0005',
        amountDue: 200,
        amountPaid: 200,
        isVerified: true,
        verifiedBy: 'staff-05',
        transactionRef: 'MTN-MOMO-771299'
      },
      targetGrantSize: 'GHS 100,000 – GHS 400,000',
      activeApplicationsCount: 1
    }
  ];
}

export const crmService = {
  getCases() {
    const saved = localStorage.getItem(LOCAL_CRM_CASES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return this.computeCaseFlags(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved CRM cases:', e);
      }
    }
    localStorage.setItem(LOCAL_CRM_CASES_KEY, JSON.stringify([]));
    return [];
  },

  computeCaseFlags(caseList) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    return caseList.map(c => {
      const daysSinceActivity = Math.floor((now - new Date(c.lastActivityAt)) / (1000 * 60 * 60 * 24));
      const isOverdue = c.nextActionDueDate && c.nextActionDueDate < today;
      const isDueToday = c.nextActionDueDate && c.nextActionDueDate === today;
      const isInactive = daysSinceActivity >= 7 && !c.waitingReason;

      return {
        ...c,
        daysSinceActivity,
        isOverdue,
        isDueToday,
        inactivityFlag: isInactive
      };
    });
  },

  saveCases(cases) {
    const computed = this.computeCaseFlags(cases);
    localStorage.setItem(LOCAL_CRM_CASES_KEY, JSON.stringify(computed));
    return computed;
  },

  async syncCasesFromSupabase() {
    if (!isSupabaseConfigured || !supabase) return this.getCases();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return this.getCases();

      const { data, error } = await supabase
        .from('cases')
        .select('*, organizations(*), contacts(*)')
        .order('created_at', { ascending: false });

      if (error || !Array.isArray(data)) {
        console.warn('Supabase cases sync error:', error?.message);
        return this.getCases();
      }

      const existingLocal = this.getCases();
      const mapped = data.map((row, idx) => {
        const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
        const contact = Array.isArray(row.contacts) ? row.contacts[0] : row.contacts;
        const cached = existingLocal.find(c => c.id === row.id || c.caseNumber === row.case_number);

        return {
          id: row.id,
          organizationId: row.organization_id,
          primaryContactId: row.primary_contact_id,
          caseNumber: row.case_number,
          legalName: org?.legal_name || cached?.legalName || row.case_number,
          tradingName: org?.trading_name || org?.legal_name || cached?.tradingName || row.case_number,
          applicantType: org?.applicant_type || cached?.applicantType || 'SME',
          sector: org?.sector || cached?.sector || 'General Commerce & Services',
          businessStage: org?.business_stage || cached?.businessStage || 'Early-stage Growth',
          region: org?.region || cached?.region || 'Greater Accra',
          registrationNumber: org?.registration_number || cached?.registrationNumber || '',
          tinNumber: org?.tin_number || cached?.tinNumber || '',
          primaryContact: {
            fullName: contact?.full_name || cached?.primaryContact?.fullName || 'Primary Contact',
            title: contact?.title || cached?.primaryContact?.title || 'Founder / Representative',
            phone: contact?.phone_primary || cached?.primaryContact?.phone || '',
            email: contact?.email || cached?.primaryContact?.email || '',
            whatsapp: contact?.phone_whatsapp || contact?.phone_primary || cached?.primaryContact?.whatsapp || ''
          },
          currentOfficerId: row.current_officer_id || cached?.currentOfficerId || STAFF_USERS[0]?.id || 'staff-01',
          status: row.status || 'intake',
          onboardingDate: row.onboarding_date || (row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          lastActivityAt: row.last_activity_at || row.updated_at || row.created_at || new Date().toISOString(),
          nextActionDescription: row.next_action_description || cached?.nextActionDescription || '',
          nextActionDueDate: row.next_action_due_date || cached?.nextActionDueDate || '',
          waitingReason: row.waiting_reason || '',
          inactivityFlag: Boolean(row.inactivity_flag),
          engagementFee: cached?.engagementFee || {
            invoiceNumber: `INV-2026-${String(idx + 1).padStart(4, '0')}`,
            amountDue: 200,
            amountPaid: row.status !== 'onboarding_fee_pending' && row.status !== 'intake' ? 200 : 0,
            isVerified: row.status !== 'onboarding_fee_pending' && row.status !== 'intake',
            verifiedBy: null,
            transactionRef: '',
            paymentMethod: 'momo_mtn'
          },
          targetGrantSize: cached?.targetGrantSize || 'GHS 50,000 – GHS 200,000',
          activeApplicationsCount: cached?.activeApplicationsCount || 0
        };
      });

      return this.saveCases(mapped);
    } catch (e) {
      console.warn('Supabase cases sync skipped:', e);
      return this.getCases();
    }
  },

  async getCaseById(caseId) {
    const cases = this.getCases();
    return cases.find(c => c.id === caseId) || null;
  },

  async registerClient({
    legalName,
    tradingName,
    applicantType,
    sector,
    businessStage,
    region = 'Greater Accra',
    registrationNumber = '',
    tinNumber = '',
    primaryContact,
    assignedOfficerId,
    targetGrantSize,
    engagementFeeAmount = 200,
    feePaymentMethod = 'momo_mtn',
    feeTransactionRef = ''
  }) {
    const currentStaff = authService.getCurrentUser();
    const cases = this.getCases();

    // Check potential duplicate
    const duplicate = cases.find(c => 
      c.legalName.toLowerCase() === legalName.trim().toLowerCase() ||
      (c.primaryContact.phone && c.primaryContact.phone === primaryContact.phone)
    );

    if (duplicate) {
      throw new Error(`A client with this name or primary phone already exists (${duplicate.caseNumber}: ${duplicate.legalName}).`);
    }

    const caseNumber = `KIA-CASE-2026-${String(cases.length + 1).padStart(4, '0')}`;
    const invoiceNumber = `INV-2026-${String(cases.length + 1).padStart(4, '0')}`;
    let newCaseId = `case-${Date.now().toString().slice(-5)}`;
    let organizationId = null;
    let primaryContactId = null;

    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const officerUuid = isUuid(assignedOfficerId)
          ? assignedOfficerId
          : (isUuid(currentStaff?.id) ? currentStaff.id : null);

        const { data: orgRow, error: orgErr } = await supabase
          .from('organizations')
          .insert({
            legal_name: legalName.trim(),
            trading_name: tradingName ? tradingName.trim() : legalName.trim(),
            applicant_type: applicantType,
            sector,
            business_stage: businessStage,
            region,
            registration_number: registrationNumber || null,
            tin_number: tinNumber || null,
            created_by: isUuid(currentStaff?.id) ? currentStaff.id : null
          })
          .select()
          .single();

        if (orgErr) throw new Error(`Could not save organization to Supabase: ${orgErr.message}`);
        organizationId = orgRow.id;

        const { data: contactRow, error: contactErr } = await supabase
          .from('contacts')
          .insert({
            organization_id: organizationId,
            full_name: primaryContact.fullName,
            title: primaryContact.title || 'Founder / Representative',
            email: primaryContact.email || null,
            phone_primary: primaryContact.phone,
            phone_whatsapp: primaryContact.whatsapp || primaryContact.phone,
            is_primary: true
          })
          .select()
          .single();

        if (contactErr) throw new Error(`Could not save contact to Supabase: ${contactErr.message}`);
        primaryContactId = contactRow.id;

        const { data: caseRow, error: caseErr } = await supabase
          .from('cases')
          .insert({
            case_number: caseNumber,
            organization_id: organizationId,
            primary_contact_id: primaryContactId,
            status: 'onboarding_fee_pending',
            current_officer_id: officerUuid,
            next_action_description: 'Verify initial engagement fee payment and issue formal onboarding checklist.',
            next_action_due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
          })
          .select()
          .single();

        if (caseErr) throw new Error(`Could not save case to Supabase: ${caseErr.message}`);
        newCaseId = caseRow.id;
      }
    }

    const newCase = {
      id: newCaseId,
      organizationId,
      primaryContactId,
      caseNumber,
      legalName: legalName.trim(),
      tradingName: tradingName ? tradingName.trim() : legalName.trim(),
      applicantType,
      sector,
      businessStage,
      region,
      registrationNumber,
      tinNumber,
      primaryContact: {
        fullName: primaryContact.fullName,
        title: primaryContact.title || 'Founder / Representative',
        phone: primaryContact.phone,
        email: primaryContact.email || '',
        whatsapp: primaryContact.whatsapp || primaryContact.phone
      },
      currentOfficerId: assignedOfficerId || 'staff-03',
      status: 'onboarding_fee_pending',
      onboardingDate: new Date().toISOString().split('T')[0],
      lastActivityAt: new Date().toISOString(),
      nextActionDescription: 'Verify initial engagement fee payment and issue formal onboarding checklist.',
      nextActionDueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      waitingReason: '',
      inactivityFlag: false,
      engagementFee: {
        invoiceNumber,
        amountDue: engagementFeeAmount,
        amountPaid: feeTransactionRef ? engagementFeeAmount : 0,
        isVerified: false, // Must be verified by Finance separately!
        verifiedBy: null,
        transactionRef: feeTransactionRef,
        paymentMethod: feePaymentMethod
      },
      targetGrantSize: targetGrantSize || 'GHS 50,000 – GHS 200,000',
      activeApplicationsCount: 0
    };

    const updated = [newCase, ...cases];
    this.saveCases(updated);

    await auditService.logEvent({
      entityType: 'case',
      entityId: newCase.id,
      action: 'register_client',
      newState: newCase,
      notes: `Registered client ${newCase.legalName} (${newCase.caseNumber}) assigned to officer ${assignedOfficerId}`
    });

    return newCase;
  },

  async updateCaseStatus(caseId, newStatus, { nextActionDescription, nextActionDueDate, waitingReason = '' }) {
    const currentStaff = authService.getCurrentUser();
    const cases = this.getCases();
    const current = cases.find(c => c.id === caseId);
    if (!current) throw new Error('Case not found');

    const updated = cases.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          status: newStatus,
          nextActionDescription: nextActionDescription || c.nextActionDescription,
          nextActionDueDate: nextActionDueDate || c.nextActionDueDate,
          waitingReason: waitingReason,
          lastActivityAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    this.saveCases(updated);

    if (isSupabaseConfigured && supabase && isUuid(caseId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('cases')
          .update({
            status: newStatus,
            next_action_description: nextActionDescription || current.nextActionDescription,
            next_action_due_date: nextActionDueDate || current.nextActionDueDate,
            waiting_reason: waitingReason,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', caseId);
      }
    }

    await auditService.logEvent({
      entityType: 'case',
      entityId: caseId,
      action: 'update_status',
      previousState: { status: current.status },
      newState: { status: newStatus, nextActionDescription, nextActionDueDate },
      notes: `Case ${current.caseNumber} moved to ${newStatus}`
    });

    return updated.find(c => c.id === caseId);
  },

  async reassignCase(caseId, newOfficerId, reason = '') {
    const currentStaff = authService.getCurrentUser();
    const cases = this.getCases();
    const current = cases.find(c => c.id === caseId);
    if (!current) throw new Error('Case not found');

    const previousOfficer = STAFF_USERS.find(s => s.id === current.currentOfficerId);
    const newOfficer = STAFF_USERS.find(s => s.id === newOfficerId);

    const updated = cases.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          currentOfficerId: newOfficerId,
          lastActivityAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    this.saveCases(updated);

    if (isSupabaseConfigured && supabase && isUuid(caseId) && isUuid(newOfficerId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('cases')
          .update({
            current_officer_id: newOfficerId,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', caseId);
      }
    }

    await auditService.logEvent({
      entityType: 'case',
      entityId: caseId,
      action: 'reassign_case',
      previousState: { officerId: current.currentOfficerId },
      newState: { officerId: newOfficerId, reason },
      notes: `Case ${current.caseNumber} reassigned from ${previousOfficer?.fullName} to ${newOfficer?.fullName}: ${reason}`
    });

    return updated.find(c => c.id === caseId);
  },

  async verifyEngagementFee(caseId, { transactionRef, notes = '' }) {
    const currentStaff = authService.getCurrentUser();
    if (currentStaff.role !== 'finance_officer' && currentStaff.role !== 'ceo' && currentStaff.role !== 'admin') {
      throw new Error('Only the Finance Officer or CEO can verify engagement fee payments.');
    }

    const cases = this.getCases();
    const current = cases.find(c => c.id === caseId);
    if (!current) throw new Error('Case not found');

    const updated = cases.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          status: c.status === 'onboarding_fee_pending' ? 'documentation' : c.status,
          engagementFee: {
            ...c.engagementFee,
            amountPaid: c.engagementFee.amountDue,
            isVerified: true,
            verifiedBy: currentStaff.id,
            verifiedAt: new Date().toISOString(),
            transactionRef: transactionRef || c.engagementFee.transactionRef
          },
          lastActivityAt: new Date().toISOString(),
          nextActionDescription: 'Generate dynamic document checklist and issue client upload link.',
          nextActionDueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
        };
      }
      return c;
    });

    this.saveCases(updated);

    if (isSupabaseConfigured && supabase && isUuid(caseId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('cases')
          .update({
            status: current.status === 'onboarding_fee_pending' ? 'documentation' : current.status,
            next_action_description: 'Generate dynamic document checklist and issue client upload link.',
            next_action_due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
            last_activity_at: new Date().toISOString()
          })
          .eq('id', caseId);
      }
    }

    await auditService.logEvent({
      entityType: 'finance',
      entityId: caseId,
      action: 'verify_engagement_fee',
      newState: { isVerified: true, transactionRef },
      notes: `Verified engagement fee GH₵${current.engagementFee.amountDue} for ${current.legalName}. Ref: ${transactionRef}`
    });

    return updated.find(c => c.id === caseId);
  }
};
