/**
 * KIA Grant Management System 2.0 - Finance & Invoicing Service
 * 
 * Manages engagement fees (default GH₵200), contractual success fees (3-10%),
 * official invoice generation, payment receipts, and reconciliation workflows.
 * Enforces separation of duties: only Finance Officer or CEO can verify payments.
 */

import { auditService } from './auditService';
import { authService } from './authService';
import { supabase, isSupabaseConfigured, isUuid } from '../lib/supabase';

const INVOICES_STORAGE_KEY = 'kia_finance_invoices_v3';
const PAYMENTS_STORAGE_KEY = 'kia_finance_payments_v3';

// Standard Initial Engagement Fee
export const DEFAULT_ENGAGEMENT_FEE = 200; // GH₵
export const DEFAULT_SUCCESS_FEE_PERCENTAGE = 5; // 5%

const SEED_INVOICES = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-001',
    caseId: 'case-001',
    clientName: 'Cocoveg Farms',
    applicantType: 'SME',
    invoiceType: 'engagement_fee',
    currency: 'GHS',
    items: [
      {
        description: 'Client Intake, Grant Readiness Assessment & Priority Opportunity Matching',
        quantity: 1,
        unitPrice: 200,
        amount: 200
      }
    ],
    subtotal: 200,
    discount: 0,
    totalAmount: 200,
    amountPaid: 200,
    status: 'paid', // draft, issued, partially_paid, paid, cancelled
    issuedDate: '2026-01-15',
    dueDate: '2026-01-22',
    notes: 'Standard onboarding engagement agreement fee.',
    paymentDetails: {
      momoNumber: '024 123 4567 (KIA START-UP CONSULT)',
      bankName: 'GCB Bank - High Street Branch',
      accountNumber: '1011122334455',
      accountName: 'KIA-START UP CONSULT LTD'
    },
    createdBy: 'staff-05',
    createdAt: '2026-01-15T09:30:00Z'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-002',
    caseId: 'case-002',
    clientName: 'Amacares',
    applicantType: 'SME',
    invoiceType: 'engagement_fee',
    currency: 'GHS',
    items: [
      {
        description: 'Cooperative Onboarding, Compliance Verification & Assessment Fee',
        quantity: 1,
        unitPrice: 200,
        amount: 200
      }
    ],
    subtotal: 200,
    discount: 0,
    totalAmount: 200,
    amountPaid: 0,
    status: 'issued',
    issuedDate: '2026-02-01',
    dueDate: '2026-02-08',
    notes: 'Awaiting MoMo transfer from cooperative treasurer.',
    paymentDetails: {
      momoNumber: '024 123 4567 (KIA START-UP CONSULT)',
      bankName: 'GCB Bank - High Street Branch',
      accountNumber: '1011122334455',
      accountName: 'KIA-START UP CONSULT LTD'
    },
    createdBy: 'staff-05',
    createdAt: '2026-02-01T11:00:00Z'
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2026-003',
    caseId: 'case-003',
    clientName: 'Union Farms',
    applicantType: 'SME',
    invoiceType: 'engagement_fee',
    currency: 'GHS',
    items: [
      {
        description: 'Client Intake, Grant Readiness Assessment & Priority Opportunity Matching',
        quantity: 1,
        unitPrice: 200,
        amount: 200
      }
    ],
    subtotal: 200,
    discount: 0,
    totalAmount: 200,
    amountPaid: 200,
    status: 'paid',
    issuedDate: '2026-02-10',
    dueDate: '2026-02-17',
    notes: 'Paid via MTN MoMo.',
    paymentDetails: {
      momoNumber: '024 123 4567 (KIA START-UP CONSULT)',
      bankName: 'GCB Bank - High Street Branch',
      accountNumber: '1011122334455',
      accountName: 'KIA-START UP CONSULT LTD'
    },
    createdBy: 'staff-05',
    createdAt: '2026-02-10T14:20:00Z'
  },
  {
    id: 'inv-004',
    invoiceNumber: 'INV-2026-004',
    caseId: 'case-003',
    clientName: 'Union Farms',
    applicantType: 'SME',
    invoiceType: 'success_fee',
    currency: 'GHS',
    items: [
      {
        description: 'Contractual Success Fee (5%) on Grant Award: AfDB AFAWA Healthcare Diagnostic Expansion Grant (GH₵ 120,000 awarded)',
        quantity: 1,
        unitPrice: 6000,
        amount: 6000
      }
    ],
    subtotal: 6000,
    discount: 0,
    totalAmount: 6000,
    amountPaid: 0,
    status: 'issued',
    issuedDate: '2026-02-28',
    dueDate: '2026-03-14',
    notes: 'Success fee payable within 14 days of funder first tranche disbursement.',
    paymentDetails: {
      momoNumber: '024 123 4567 (KIA START-UP CONSULT)',
      bankName: 'GCB Bank - High Street Branch',
      accountNumber: '1011122334455',
      accountName: 'KIA-START UP CONSULT LTD'
    },
    createdBy: 'staff-05',
    createdAt: '2026-02-28T16:00:00Z'
  }
];

const SEED_PAYMENTS = [
  {
    id: 'pay-001',
    receiptNumber: 'REC-2026-001',
    invoiceId: 'inv-001',
    caseId: 'case-001',
    clientName: 'Cocoveg Farms',
    amount: 200,
    paymentMethod: 'MTN Mobile Money',
    transactionReference: 'TXN-MM-89230192',
    paymentDate: '2026-01-16',
    proofDocumentUrl: 'receipts/agrofresh_momo_slip.pdf',
    verificationStatus: 'verified',
    verifiedBy: 'staff-05', // Emmanuel Darko
    verifiedAt: '2026-01-16T15:00:00Z',
    verificationNotes: 'Reconciled with MTN MoMo merchant statement.',
    recordedBy: 'staff-03',
    createdAt: '2026-01-16T10:15:00Z'
  },
  {
    id: 'pay-002',
    receiptNumber: 'REC-2026-002',
    invoiceId: 'inv-003',
    caseId: 'case-003',
    clientName: 'Union Farms',
    amount: 200,
    paymentMethod: 'Bank Transfer (GCB)',
    transactionReference: 'GCB-TRF-004921',
    paymentDate: '2026-02-11',
    proofDocumentUrl: 'receipts/healthpoint_gcb_slip.pdf',
    verificationStatus: 'verified',
    verifiedBy: 'staff-05',
    verifiedAt: '2026-02-12T09:30:00Z',
    verificationNotes: 'Confirmed on online banking credit alert.',
    recordedBy: 'staff-05',
    createdAt: '2026-02-11T16:45:00Z'
  }
];

class FinanceService {
  constructor() {
    this.invoices = this.loadInvoices();
    this.payments = this.loadPayments();
  }

  loadInvoices() {
    try {
      const data = localStorage.getItem(INVOICES_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load finance invoices:', e);
    }
    this.saveInvoices([]);
    return [];
  }

  saveInvoices(invoices) {
    this.invoices = invoices;
    try {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    } catch (e) {
      console.error('Failed to save finance invoices:', e);
    }
  }

  loadPayments() {
    try {
      const data = localStorage.getItem(PAYMENTS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load finance payments:', e);
    }
    this.savePayments([]);
    return [];
  }

  savePayments(payments) {
    this.payments = payments;
    try {
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
    } catch (e) {
      console.error('Failed to save finance payments:', e);
    }
  }

  async syncFinanceFromSupabase() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [{ data: invRows }, { data: payRows }] = await Promise.all([
        supabase.from('invoices').select('*, cases(organizations(legal_name, trading_name, applicant_type))').order('created_at', { ascending: false }),
        supabase.from('payments').select('*, cases(organizations(legal_name, trading_name))').order('created_at', { ascending: false })
      ]);

      if (Array.isArray(invRows)) {
        const mappedInvoices = invRows.map(row => {
          const localMatch = this.invoices.find(i => i.id === row.id || i.invoiceNumber === row.invoice_number);
          const org = row.cases?.organizations;
          const orgObj = Array.isArray(org) ? org[0] : org;
          return {
            id: row.id,
            invoiceNumber: row.invoice_number,
            caseId: row.case_id,
            clientName: orgObj?.trading_name || orgObj?.legal_name || localMatch?.clientName || 'Client',
            applicantType: orgObj?.applicant_type || localMatch?.applicantType || 'SME',
            invoiceType: row.invoice_type || 'engagement_fee',
            currency: row.currency || 'GHS',
            items: localMatch?.items || [{
              description: row.invoice_type === 'success_fee' ? 'Contractual Grant Success Fee' : 'Grant Readiness & Onboarding Engagement Fee',
              quantity: 1,
              unitPrice: Number(row.amount_due),
              amount: Number(row.amount_due)
            }],
            subtotal: Number(row.amount_due),
            discount: 0,
            totalAmount: Number(row.amount_due),
            amountPaid: Number(row.amount_paid) || 0,
            status: row.status || 'issued',
            issuedDate: row.issued_date,
            dueDate: row.due_date,
            notes: localMatch?.notes || '',
            paymentDetails: localMatch?.paymentDetails || {
              momoNumber: '024 123 4567 (KIA START-UP CONSULT)',
              bankName: 'GCB Bank - High Street Branch',
              accountNumber: '1011122334455',
              accountName: 'KIA-START UP CONSULT LTD'
            },
            createdBy: row.created_by,
            createdAt: row.created_at
          };
        });
        this.saveInvoices(mappedInvoices);
      }

      if (Array.isArray(payRows)) {
        const mappedPayments = payRows.map(row => {
          const localMatch = this.payments.find(p => p.id === row.id);
          const org = row.cases?.organizations;
          const orgObj = Array.isArray(org) ? org[0] : org;
          return {
            id: row.id,
            receiptNumber: localMatch?.receiptNumber || `REC-${row.created_at?.slice(0, 4) || '2026'}-${row.id.slice(0, 4).toUpperCase()}`,
            invoiceId: row.invoice_id,
            caseId: row.case_id,
            clientName: orgObj?.trading_name || orgObj?.legal_name || localMatch?.clientName || 'Client',
            amount: Number(row.amount),
            paymentMethod: row.payment_method,
            transactionReference: row.transaction_reference,
            paymentDate: row.payment_date,
            proofDocumentUrl: row.receipt_document_url || '',
            verificationStatus: row.status || 'pending_verification',
            verifiedBy: row.verified_by || null,
            verifiedAt: row.verified_at || null,
            verificationNotes: row.verification_notes || '',
            recordedBy: localMatch?.recordedBy || null,
            createdAt: row.created_at
          };
        });
        this.savePayments(mappedPayments);
      }
    } catch (e) {
      console.warn('Supabase finance sync skipped:', e);
    }
  }

  getInvoices() {
    return [...this.invoices];
  }

  getPayments() {
    return [...this.payments];
  }

  getInvoiceById(id) {
    return this.invoices.find(inv => inv.id === id) || null;
  }

  getInvoicesByCaseId(caseId) {
    return this.invoices.filter(inv => inv.caseId === caseId);
  }

  getPaymentsByCaseId(caseId) {
    return this.payments.filter(p => p.caseId === caseId);
  }

  getFinancialOverview() {
    const totalInvoiced = this.invoices
      .filter(i => i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.totalAmount, 0);

    const verifiedPayments = this.payments
      .filter(p => p.verificationStatus === 'verified')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingVerificationPayments = this.payments
      .filter(p => p.verificationStatus === 'pending_verification')
      .reduce((sum, p) => sum + p.amount, 0);

    const outstandingBalance = Math.max(0, totalInvoiced - verifiedPayments);

    const engagementFeesCollected = this.payments
      .filter(p => {
        if (p.verificationStatus !== 'verified') return false;
        const inv = this.invoices.find(i => i.id === p.invoiceId);
        return inv && inv.invoiceType === 'engagement_fee';
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const successFeesCollected = this.payments
      .filter(p => {
        if (p.verificationStatus !== 'verified') return false;
        const inv = this.invoices.find(i => i.id === p.invoiceId);
        return inv && inv.invoiceType === 'success_fee';
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const projectedSuccessFees = this.invoices
      .filter(i => i.invoiceType === 'success_fee' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.totalAmount, 0);

    return {
      totalInvoiced,
      verifiedPayments,
      pendingVerificationPayments,
      outstandingBalance,
      engagementFeesCollected,
      successFeesCollected,
      projectedSuccessFees,
      invoicesCount: this.invoices.length,
      paidInvoicesCount: this.invoices.filter(i => i.status === 'paid').length
    };
  }

  async createInvoice({
    caseId,
    clientName,
    applicantType,
    invoiceType = 'engagement_fee',
    items,
    notes = '',
    dueDate
  }) {
    const currentUser = authService.getCurrentUser();
    const count = this.invoices.length + 1;
    const invoiceNumber = `INV-2026-${String(count).padStart(3, '0')}`;
    
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * (item.quantity || 1)), 0);
    const totalAmount = subtotal;
    const resolvedDue = dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    let invoiceId = `inv-${Date.now()}`;

    if (isSupabaseConfigured && supabase && isUuid(caseId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { crmService } = await import('./crmService');
        const caseObj = await crmService.getCaseById(caseId);
        if (caseObj?.organizationId && isUuid(caseObj.organizationId)) {
          const { data: row, error } = await supabase
            .from('invoices')
            .insert({
              invoice_number: invoiceNumber,
              case_id: caseId,
              organization_id: caseObj.organizationId,
              invoice_type: invoiceType,
              amount_due: totalAmount,
              amount_paid: 0,
              currency: 'GHS',
              status: 'issued',
              due_date: resolvedDue,
              created_by: isUuid(currentUser?.id) ? currentUser.id : null
            })
            .select()
            .single();
          if (!error && row?.id) invoiceId = row.id;
        }
      }
    }

    const newInvoice = {
      id: invoiceId,
      invoiceNumber,
      caseId,
      clientName,
      applicantType: applicantType || 'SME',
      invoiceType,
      currency: 'GHS',
      items: items.map(it => ({
        description: it.description,
        quantity: it.quantity || 1,
        unitPrice: Number(it.unitPrice),
        amount: Number(it.unitPrice) * (it.quantity || 1)
      })),
      subtotal,
      discount: 0,
      totalAmount,
      amountPaid: 0,
      status: 'issued',
      issuedDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      notes,
      paymentDetails: {
        momoNumber: '024 123 4567 (KIA START-UP CONSULT)',
        bankName: 'GCB Bank - High Street Branch',
        accountNumber: '1011122334455',
        accountName: 'KIA-START UP CONSULT LTD'
      },
      createdBy: currentUser.id,
      createdAt: new Date().toISOString()
    };

    const updated = [newInvoice, ...this.invoices];
    this.saveInvoices(updated);

    await auditService.logAction({
      userId: currentUser.id,
      action: 'create_invoice',
      entityType: 'invoice',
      entityId: newInvoice.id,
      details: {
        invoiceNumber,
        clientName,
        totalAmount,
        invoiceType
      }
    });

    return newInvoice;
  }

  async recordPayment({
    invoiceId,
    caseId,
    clientName,
    amount,
    paymentMethod,
    transactionReference,
    paymentDate,
    proofDocumentUrl = ''
  }) {
    const currentUser = authService.getCurrentUser();
    const num = this.payments.length + 1;
    const receiptNumber = `REC-2026-${String(num).padStart(3, '0')}`;

    // Auto-verify ONLY if recorded by Finance Officer or CEO
    const canAutoVerify = currentUser.role === 'finance_officer' || currentUser.role === 'ceo' || currentUser.role === 'admin';
    const initialStatus = canAutoVerify ? 'verified' : 'pending_verification';
    let paymentId = `pay-${Date.now()}`;

    if (isSupabaseConfigured && supabase && isUuid(invoiceId) && isUuid(caseId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: row, error } = await supabase
          .from('payments')
          .insert({
            invoice_id: invoiceId,
            case_id: caseId,
            amount: Number(amount),
            currency: 'GHS',
            payment_method: paymentMethod || 'momo_mtn',
            transaction_reference: transactionReference,
            payer_name: clientName,
            payment_date: paymentDate || new Date().toISOString().split('T')[0],
            status: initialStatus,
            verified_by: canAutoVerify && isUuid(currentUser?.id) ? currentUser.id : null,
            verified_at: canAutoVerify ? new Date().toISOString() : null,
            receipt_document_url: proofDocumentUrl || null
          })
          .select()
          .single();
        if (!error && row?.id) paymentId = row.id;
      }
    }

    const newPayment = {
      id: paymentId,
      receiptNumber,
      invoiceId,
      caseId,
      clientName,
      amount: Number(amount),
      paymentMethod,
      transactionReference,
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      proofDocumentUrl,
      verificationStatus: initialStatus,
      verifiedBy: canAutoVerify ? currentUser.id : null,
      verifiedAt: canAutoVerify ? new Date().toISOString() : null,
      verificationNotes: canAutoVerify ? 'Directly recorded and verified by finance staff.' : '',
      recordedBy: currentUser.id,
      createdAt: new Date().toISOString()
    };

    const updatedPayments = [newPayment, ...this.payments];
    this.savePayments(updatedPayments);

    if (canAutoVerify) {
      this.recalculateInvoiceStatus(invoiceId);
      await this.syncEngagementFeeToCrm(invoiceId, currentUser.id, transactionReference);
    }

    await auditService.logAction({
      userId: currentUser.id,
      action: 'record_payment',
      entityType: 'payment',
      entityId: newPayment.id,
      details: {
        receiptNumber,
        amount,
        paymentMethod,
        transactionReference,
        verificationStatus: initialStatus
      }
    });

    return newPayment;
  }

  async verifyPayment(paymentId, { verificationNotes = '' }) {
    const currentUser = authService.getCurrentUser();
    
    // Non-negotiable segregation of duties
    if (currentUser.role !== 'finance_officer' && currentUser.role !== 'ceo' && currentUser.role !== 'admin') {
      throw new Error('ACCESS DENIED: Only Finance Officer Emmanuel Darko or the CEO may verify payments.');
    }

    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) throw new Error('Payment record not found.');

    payment.verificationStatus = 'verified';
    payment.verifiedBy = currentUser.id;
    payment.verifiedAt = new Date().toISOString();
    payment.verificationNotes = verificationNotes || 'Reconciled with official financial statement.';

    this.savePayments([...this.payments]);

    if (isSupabaseConfigured && supabase && isUuid(paymentId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('payments')
          .update({
            status: 'verified',
            verified_by: isUuid(currentUser?.id) ? currentUser.id : null,
            verified_at: payment.verifiedAt,
            verification_notes: payment.verificationNotes
          })
          .eq('id', paymentId);
      }
    }

    // Recalculate invoice paid amount
    if (payment.invoiceId) {
      this.recalculateInvoiceStatus(payment.invoiceId);
      await this.syncEngagementFeeToCrm(payment.invoiceId, currentUser.id, payment.transactionReference);
    }

    await auditService.logAction({
      userId: currentUser.id,
      action: 'verify_payment',
      entityType: 'payment',
      entityId: payment.id,
      details: {
        receiptNumber: payment.receiptNumber,
        amount: payment.amount,
        verifiedBy: currentUser.fullName,
        notes: payment.verificationNotes
      }
    });

    return payment;
  }

  recalculateInvoiceStatus(invoiceId) {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const totalPaid = this.payments
      .filter(p => p.invoiceId === invoiceId && p.verificationStatus === 'verified')
      .reduce((sum, p) => sum + p.amount, 0);

    inv.amountPaid = totalPaid;
    if (totalPaid >= inv.totalAmount) {
      inv.status = 'paid';
    } else if (totalPaid > 0) {
      inv.status = 'partially_paid';
    } else {
      inv.status = 'issued';
    }

    this.saveInvoices([...this.invoices]);
  }

  async syncEngagementFeeToCrm(invoiceId, verifiedById, transactionRef) {
    const inv = this.invoices.find(i => i.id === invoiceId);
    if (!inv || inv.invoiceType !== 'engagement_fee' || inv.status !== 'paid' || !inv.caseId) return;

    try {
      const { crmService } = await import('./crmService');
      const cases = crmService.getCases();
      const target = cases.find(c => c.id === inv.caseId);
      if (!target) return;

      const updated = cases.map(c => {
        if (c.id === inv.caseId) {
          return {
            ...c,
            status: c.status === 'onboarding_fee_pending' ? 'documentation' : c.status,
            lastActivityAt: new Date().toISOString(),
            engagementFee: {
              ...c.engagementFee,
              amountPaid: inv.amountPaid,
              isVerified: true,
              verifiedBy: verifiedById,
              transactionRef: transactionRef || c.engagementFee?.transactionRef || inv.invoiceNumber
            }
          };
        }
        return c;
      });
      crmService.saveCases(updated);
    } catch (e) {
      console.warn('CRM fee sync skipped:', e);
    }
  }
}

export const financeService = new FinanceService();

