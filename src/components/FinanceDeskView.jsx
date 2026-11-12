import React, { useState } from 'react';
import { 
  DollarSign, CheckCircle2, Clock, AlertTriangle, FileText, 
  Plus, Search, Printer, ShieldCheck, ArrowRight, X, CreditCard, Building 
} from 'lucide-react';
import { financeService, DEFAULT_ENGAGEMENT_FEE, DEFAULT_SUCCESS_FEE_PERCENTAGE } from '../services/financeService';
import { authService } from '../services/authService';
import { crmService } from '../services/crmService';

export default function FinanceDeskView() {
  const [invoices, setInvoices] = useState(() => financeService.getInvoices());
  const [payments, setPayments] = useState(() => financeService.getPayments());
  const [cases] = useState(() => crmService.getCases());
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices', 'payments', 'overview'
  const [search, setSearch] = useState('');
  
  // Modals
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  // New Invoice Form
  const [invCaseId, setInvCaseId] = useState(cases[0]?.id || '');
  const [invType, setInvType] = useState('engagement_fee');
  const [invItemDesc, setInvItemDesc] = useState('Client Intake, Grant Readiness Assessment & Priority Opportunity Matching');
  const [invAmount, setInvAmount] = useState(DEFAULT_ENGAGEMENT_FEE);
  const [invDueDate, setInvDueDate] = useState(() => {
    return new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  });
  const [invNotes, setInvNotes] = useState('');

  // Record Payment Form
  const [payInvoiceId, setPayInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('MTN Mobile Money');
  const [payTxnRef, setPayTxnRef] = useState('');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);

  const currentUser = authService.getCurrentUser();
  const canVerify = currentUser.role === 'finance_officer' || currentUser.role === 'ceo' || currentUser.role === 'admin';

  const refreshFinanceData = () => {
    setInvoices(financeService.getInvoices());
    setPayments(financeService.getPayments());
  };

  const overview = financeService.getFinancialOverview();

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const targetCase = cases.find(c => c.id === invCaseId) || cases[0];
    if (!targetCase) return;

    try {
      await financeService.createInvoice({
        caseId: targetCase.id,
        clientName: targetCase.tradingName,
        applicantType: targetCase.applicantType,
        invoiceType: invType,
        items: [
          {
            description: invItemDesc,
            quantity: 1,
            unitPrice: Number(invAmount)
          }
        ],
        notes: invNotes,
        dueDate: invDueDate
      });

      setIsCreatingInvoice(false);
      refreshFinanceData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === payInvoiceId);
    if (!inv) {
      alert('Please select an invoice to apply payment to.');
      return;
    }

    try {
      await financeService.recordPayment({
        invoiceId: inv.id,
        caseId: inv.caseId,
        clientName: inv.clientName,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        transactionReference: payTxnRef,
        paymentDate: payDate,
        proofDocumentUrl: `receipts/${payTxnRef.toLowerCase().replace(/[^a-z0-9]/g, '_')}_proof.pdf`
      });

      setIsRecordingPayment(false);
      setPayAmount('');
      setPayTxnRef('');
      refreshFinanceData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerifyPayment = async (e) => {
    e.preventDefault();
    if (!verifyingPayment) return;

    try {
      await financeService.verifyPayment(verifyingPayment.id, {
        verificationNotes: verificationNotes.trim()
      });

      setVerifyingPayment(null);
      setVerificationNotes('');
      refreshFinanceData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const q = search.toLowerCase();
    return inv.invoiceNumber.toLowerCase().includes(q) ||
           inv.clientName.toLowerCase().includes(q) ||
           inv.invoiceType.toLowerCase().includes(q);
  });

  const pendingPayments = payments.filter(p => p.verificationStatus === 'pending_verification');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-600 flex items-center space-x-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Financial Controls & Revenue Ledger</span>
          </span>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Finance & Fee Reconciliation Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track onboarding engagement agreements (GH₵ {DEFAULT_ENGAGEMENT_FEE}), contractual success fees ({DEFAULT_SUCCESS_FEE_PERCENTAGE}%), official invoices, and segregation of duties.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsRecordingPayment(true)}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => setIsCreatingInvoice(true)}
            className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Invoiced</span>
          <span className="text-xl font-black text-slate-900 block mt-1">
            GH₵ {overview.totalInvoiced.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{overview.invoicesCount} active billing records</span>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Verified Collections</span>
          <span className="text-xl font-black text-emerald-800 block mt-1">
            GH₵ {overview.verifiedPayments.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">Reconciled in bank/MoMo</span>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Pending Verification</span>
          <span className="text-xl font-black text-amber-800 block mt-1">
            GH₵ {overview.pendingVerificationPayments.toLocaleString()}
          </span>
          <span className="text-[11px] text-amber-700 mt-0.5 block">
            {pendingPayments.length} slips requiring audit
          </span>
        </div>

        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-200 shadow-sm">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Projected Success Fees</span>
          <span className="text-xl font-black text-indigo-900 block mt-1">
            GH₵ {overview.projectedSuccessFees.toLocaleString()}
          </span>
          <span className="text-[11px] text-indigo-700 mt-0.5 block">
            From awarded grants pipeline
          </span>
        </div>
      </div>

      {/* Sub-Navigation & Pending Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'invoices'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Invoices Registry ({invoices.length})
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'payments'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Payment Receipts ({payments.length})</span>
            {pendingPayments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                {pendingPayments.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client, invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
          />
        </div>
      </div>

      {/* VIEW 1: INVOICES REGISTRY */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client / Organization</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Issued / Due</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{inv.clientName}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{inv.applicantType}</span>
                    </td>
                    <td className="py-3 px-4">
                      {inv.invoiceType === 'engagement_fee' ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[10px]">
                          Engagement Fee
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold text-[10px]">
                          Success Fee (5%)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>Issued: {inv.issuedDate}</div>
                      <div className="text-[10px] text-slate-400">Due: {inv.dueDate}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      GH₵ {inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">
                      GH₵ {inv.amountPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {inv.status === 'paid' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center space-x-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PAID</span>
                        </span>
                      )}
                      {inv.status === 'partially_paid' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          PARTIAL
                        </span>
                      )}
                      {inv.status === 'issued' && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                          ISSUED / DUE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition"
                      >
                        <Printer className="w-3 h-3" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: PAYMENTS & RECONCILIATION */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Pending Verification Notice */}
          {pendingPayments.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Pending Financial Reconciliation Queue ({pendingPayments.length})</span>
              </div>
              <p className="text-xs text-amber-700 mb-4">
                These payments have been declared by staff or clients but require verification against official bank or Mobile Money credit statements by Finance Officer Emmanuel Darko or the CEO.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingPayments.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-mono font-bold text-slate-900 text-xs">{p.receiptNumber}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                          Pending Audit
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 mt-1">{p.clientName}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Amount: <strong className="text-slate-900">GH₵ {p.amount.toLocaleString()}</strong> via {p.paymentMethod}
                      </p>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        Ref: {p.transactionReference} • Date: {p.paymentDate}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Officer segregation active</span>
                      <button
                        onClick={() => {
                          if (!canVerify) {
                            alert('Restricted: Switch active user role to Finance Officer Emmanuel Darko or CEO Kwame Boateng to perform payment reconciliation.');
                            return;
                          }
                          setVerifyingPayment(p);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition"
                      >
                        Reconcile & Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Payments Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-sm">
              All Payment Receipts & Bank Transactions
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method & Reference</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Audit Status</th>
                    <th className="py-3 px-4">Audited By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.clientName}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        GH₵ {p.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div>{p.paymentMethod}</div>
                        <div className="font-mono text-[10px] text-slate-400">{p.transactionReference}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.paymentDate}
                      </td>
                      <td className="py-3 px-4">
                        {p.verificationStatus === 'verified' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center space-x-1 w-fit">
                            <ShieldCheck className="w-3 h-3" />
                            <span>VERIFIED</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {p.verifiedAt ? (
                          <div>
                            <span className="font-medium text-slate-800">{p.verifiedBy}</span>
                            <div className="text-[10px] text-slate-400">{new Date(p.verifiedAt).toLocaleDateString()}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unverified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE INVOICE */}
      {isCreatingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg">Generate Official Invoice</h3>
              <button onClick={() => setIsCreatingInvoice(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 mt-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Target Client Case *</label>
                <select
                  value={invCaseId}
                  onChange={(e) => setInvCaseId(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.tradingName} ({c.caseNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Invoice Billing Category</label>
                <select
                  value={invType}
                  onChange={(e) => {
                    setInvType(e.target.value);
                    if (e.target.value === 'engagement_fee') {
                      setInvItemDesc('Client Intake, Grant Readiness Assessment & Priority Opportunity Matching');
                      setInvAmount(DEFAULT_ENGAGEMENT_FEE);
                    } else {
                      setInvItemDesc('Contractual Success Fee (5%) on Secured Grant Award');
                      setInvAmount(5000);
                    }
                  }}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                >
                  <option value="engagement_fee">Standard Engagement Fee (GH₵ 200)</option>
                  <option value="success_fee">Contractual Success Fee (3% - 10%)</option>
                  <option value="custom_advisory">Specialized Grant Proposal Advisory</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Line Item Description *</label>
                <input
                  type="text"
                  value={invItemDesc}
                  onChange={(e) => setInvItemDesc(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Amount (GH₵) *</label>
                  <input
                    type="number"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Payment Due Date *</label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Invoice Notes / Instructions</label>
                <textarea
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="e.g. Please quote invoice number when paying via MTN Mobile Money."
                  rows={2}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingInvoice(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT */}
      {isRecordingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-lg">Record Client Payment</h3>
              <button onClick={() => setIsRecordingPayment(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 mt-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Select Invoice to Credit *</label>
                <select
                  value={payInvoiceId}
                  onChange={(e) => {
                    setPayInvoiceId(e.target.value);
                    const inv = invoices.find(i => i.id === e.target.value);
                    if (inv) setPayAmount(inv.totalAmount - inv.amountPaid);
                  }}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  required
                >
                  <option value="">-- Choose Invoice --</option>
                  {invoices.filter(i => i.status !== 'paid').map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.clientName} (Due: GH₵ {inv.totalAmount - inv.amountPaid})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Payment Amount (GH₵) *</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Payment Channel *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Telecel Cash">Telecel Cash</option>
                    <option value="Bank Transfer (GCB)">Bank Transfer (GCB)</option>
                    <option value="Direct Cash Deposit">Direct Cash Deposit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Transaction Ref / MoMo ID *</label>
                <input
                  type="text"
                  value={payTxnRef}
                  onChange={(e) => setPayTxnRef(e.target.value)}
                  placeholder="e.g. TXN-MM-9831024 or GCB-DEP-102"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Payment Date *</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRecordingPayment(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECONCILE PAYMENT (Emmanuel Darko / CEO) */}
      {verifyingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Reconciliation Audit Desk</span>
              </h3>
              <button onClick={() => setVerifyingPayment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyPayment} className="space-y-4 mt-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div><strong>Client:</strong> {verifyingPayment.clientName}</div>
                <div><strong>Receipt #:</strong> <span className="font-mono">{verifyingPayment.receiptNumber}</span></div>
                <div><strong>Claimed Amount:</strong> <span className="font-bold text-emerald-700">GH₵ {verifyingPayment.amount.toLocaleString()}</span></div>
                <div><strong>Channel:</strong> {verifyingPayment.paymentMethod}</div>
                <div><strong>Reference:</strong> <span className="font-mono">{verifyingPayment.transactionReference}</span></div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Reconciliation Verification Notes *
                </label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="e.g. Cross-checked with GCB online banking credit on statement page 3."
                  rows={3}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setVerifyingPayment(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow"
                >
                  Confirm & Clear Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW / PRINT OFFICIAL INVOICE */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 my-8">
            {/* Action Bar */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 no-print">
              <span className="font-bold text-slate-900 text-sm">Official Commercial Invoice</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForPrint(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Document */}
            <div className="mt-6 space-y-6">
              {/* Header Letterhead */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm">
                      KIA
                    </div>
                    <div>
                      <h2 className="font-black text-slate-950 text-base leading-none">KIA-START UP CONSULT</h2>
                      <span className="text-[10px] text-slate-500">Grant Advisory & Enterprise Readiness Practice</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Accra Central, Greater Accra Region, Ghana<br />
                    Tel: +233 24 123 4567 • Email: billing@kiastartup.com
                  </p>
                </div>

                <div className="text-right">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">INVOICE</h1>
                  <span className="font-mono font-bold text-amber-600 text-sm block mt-0.5">
                    {selectedInvoiceForPrint.invoiceNumber}
                  </span>
                  <div className="text-xs text-slate-500 mt-1">
                    Date: {selectedInvoiceForPrint.issuedDate}<br />
                    Due Date: <strong className="text-slate-800">{selectedInvoiceForPrint.dueDate}</strong>
                  </div>
                </div>
              </div>

              {/* Billed To */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billed To:</span>
                <h3 className="font-black text-slate-900 text-base mt-0.5">{selectedInvoiceForPrint.clientName}</h3>
                <p className="text-xs text-slate-600 mt-0.5">Applicant Entity Category: {selectedInvoiceForPrint.applicantType}</p>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Unit Price</th>
                      <th className="py-2.5 px-4 text-right">Amount (GHS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoiceForPrint.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-4 font-semibold text-slate-900">{item.description}</td>
                        <td className="py-3 px-4 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-slate-600">GH₵ {item.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">GH₵ {item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan="3" className="py-2.5 px-4 text-right font-bold text-slate-700">Total Due:</td>
                      <td className="py-2.5 px-4 text-right font-black text-slate-900 text-sm">
                        GH₵ {selectedInvoiceForPrint.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Details */}
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-1">Official Payment Instructions:</span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <strong>MTN Mobile Money:</strong><br />
                    {selectedInvoiceForPrint.paymentDetails.momoNumber}
                  </div>
                  <div>
                    <strong>Bank Account:</strong><br />
                    {selectedInvoiceForPrint.paymentDetails.bankName}<br />
                    A/C: {selectedInvoiceForPrint.paymentDetails.accountNumber}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
                Thank you for your business with KIA-START UP CONSULT. Confidential & Legally Binding.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
