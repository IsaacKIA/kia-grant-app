import React, { useState } from 'react';
import { 
  X, Building2, User, Clock, CheckCircle2, DollarSign, Calendar, 
  FileText, ShieldAlert, ArrowRight, Plus, AlertTriangle, ShieldCheck,
  Link2, Copy, Check, UploadCloud, Eye
} from 'lucide-react';
import { crmService, CASE_STATUS_CONFIG } from '../services/crmService';
import { taskService } from '../services/taskService';
import { auditService } from '../services/auditService';
import { authService, STAFF_USERS } from '../services/authService';
import { documentService } from '../services/documentService';
import DocumentReviewModal from './DocumentReviewModal';

export default function CaseDossierModal({ initialCase, onClose, onCaseUpdated }) {
  const [currentCase, setCurrentCase] = useState(initialCase);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'documents', 'finance', 'tasks', 'audit'
  const [caseTasks, setCaseTasks] = useState(() => {
    return taskService.getTasks().filter(t => t.caseId === initialCase.id);
  });
  const [auditLogs, setAuditLogs] = useState([]);

  // Documents state
  const [caseReqs, setCaseReqs] = useState(() => {
    return documentService.getCaseRequirements(initialCase.id);
  });
  const [reviewingDoc, setReviewingDoc] = useState(null);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // New task form state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  // Case edit state
  const [statusVal, setStatusVal] = useState(currentCase.status);
  const [nextActionDesc, setNextActionDesc] = useState(currentCase.nextActionDescription || '');
  const [nextActionDue, setNextActionDue] = useState(currentCase.nextActionDueDate || '');
  const [waitingReasonVal, setWaitingReasonVal] = useState(currentCase.waitingReason || '');
  const [isSaving, setIsSaving] = useState(false);

  // Fee verify state
  const [verifyTxRef, setVerifyTxRef] = useState(currentCase.engagementFee?.transactionRef || '');

  const currentUser = authService.getCurrentUser();
  const isFinanceOrCeo = currentUser.role === 'finance_officer' || currentUser.role === 'ceo' || currentUser.role === 'admin';
  const assignedOfficer = STAFF_USERS.find(s => s.id === currentCase.currentOfficerId);
  const statusCfg = CASE_STATUS_CONFIG[currentCase.status] || CASE_STATUS_CONFIG.intake;

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await crmService.updateCaseStatus(currentCase.id, statusVal, {
        nextActionDescription: nextActionDesc,
        nextActionDueDate: nextActionDue,
        waitingReason: waitingReasonVal
      });
      setCurrentCase(updated);
      onCaseUpdated(updated);
      setIsSaving(false);
    } catch (err) {
      alert(err.message);
      setIsSaving(false);
    }
  };

  const handleVerifyFee = async () => {
    if (!verifyTxRef.trim()) {
      alert('Please enter or confirm the transaction reference ID.');
      return;
    }
    try {
      const updated = await crmService.verifyEngagementFee(currentCase.id, {
        transactionRef: verifyTxRef,
        notes: `Verified by ${currentUser.fullName}`
      });
      setCurrentCase(updated);
      onCaseUpdated(updated);
      alert('Engagement fee verified successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const created = await taskService.createTask({
        caseId: currentCase.id,
        clientName: currentCase.tradingName,
        title: newTaskTitle,
        assignedToId: currentCase.currentOfficerId,
        priority: newTaskPriority,
        dueDate: newTaskDue
      });
      setCaseTasks(prev => [created, ...prev]);
      setIsAddingTask(false);
      setNewTaskTitle('');
    } catch (err) {
      alert(err.message);
    }
  };

  // Load audit logs when switching to audit tab
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === 'audit') {
      const logs = await auditService.getRecentAuditEvents(50, 'case');
      setAuditLogs(logs.filter(l => l.entityId === currentCase.id));
    }
  };

  const completeness = documentService.calculateCompleteness(currentCase.id);

  const handleGenerateLink = () => {
    const tokenObj = documentService.generateUploadToken(currentCase.id, currentCase.tradingName);
    setGeneratedLink(tokenObj);
    setCopiedLink(false);
  };

  const handleCopy = () => {
    if (generatedLink?.uploadUrl) {
      navigator.clipboard.writeText(generatedLink.uploadUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const refreshCaseReqs = () => {
    setCaseReqs(documentService.getCaseRequirements(currentCase.id));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                {currentCase.caseNumber}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {currentCase.tradingName}
              </h2>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Founder: <strong className="text-slate-200">{currentCase.primaryContact.fullName}</strong> ({currentCase.primaryContact.phone}) • Sector: <span className="text-amber-400 font-semibold">{currentCase.sector}</span> • Officer: <span className="text-slate-200 font-medium">{assignedOfficer?.fullName || 'Unassigned'}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 border-b border-slate-200 flex space-x-4 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => handleTabChange('overview')}
            className={`py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'overview' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Action Plan
          </button>

          <button
            onClick={() => handleTabChange('documents')}
            className={`py-3 border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'documents' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Documents & Evidence ({completeness.percentage}%)</span>
            {completeness.underReview > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('finance')}
            className={`py-3 border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'finance' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Finance & Fees</span>
            {currentCase.engagementFee?.isVerified ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('tasks')}
            className={`py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'tasks' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Case Tasks ({caseTasks.length})
          </button>

          <button
            onClick={() => handleTabChange('audit')}
            className={`py-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'audit' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Audit Trail
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* TAB 1: OVERVIEW & STATUS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Accountability Box */}
              <form onSubmit={handleSaveStatus} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-extrabold uppercase text-[11px] text-slate-700 tracking-wider">
                    Mandatory Operational Accountability Controls
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Rule 3.3: Every active case must have an explicit next action and due date.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 uppercase block mb-1">
                      Current Case Status *
                    </label>
                    <select
                      value={statusVal}
                      onChange={(e) => setStatusVal(e.target.value)}
                      className="w-full font-bold border border-slate-300 rounded-lg p-2.5 bg-white"
                    >
                      {Object.entries(CASE_STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 uppercase block mb-1">
                      Next Action Due Date *
                    </label>
                    <input
                      type="date"
                      value={nextActionDue}
                      onChange={(e) => setNextActionDue(e.target.value)}
                      className="w-full font-bold border border-slate-300 rounded-lg p-2.5 bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Next Specific Action Required *
                  </label>
                  <textarea
                    rows="2"
                    value={nextActionDesc}
                    onChange={(e) => setNextActionDesc(e.target.value)}
                    placeholder="e.g. Follow up on ORC Form 3 page 2 signature, or conduct readiness diagnostic..."
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Documented Waiting Reason (if blocked or waiting on client/funder)
                  </label>
                  <input
                    type="text"
                    value={waitingReasonVal}
                    onChange={(e) => setWaitingReasonVal(e.target.value)}
                    placeholder="e.g. Waiting on client to retrieve physical tax certificate from GRA..."
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-sm"
                  >
                    {isSaving ? 'Updating...' : 'Save Case Updates'}
                  </button>
                </div>
              </form>

              {/* Organization Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Legal Name</span>
                  <strong className="text-slate-900">{currentCase.legalName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Registration No</span>
                  <strong className="text-slate-900">{currentCase.registrationNumber || 'Pending'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">TIN / Ghana Card</span>
                  <strong className="text-slate-900">{currentCase.tinNumber || 'Not provided'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Onboarding Date</span>
                  <strong className="text-slate-900">{currentCase.onboardingDate}</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DOCUMENTS & EVIDENCE */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Completeness Summary Banner */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase font-extrabold text-amber-600 tracking-wider">
                      Document Completeness Meter
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {completeness.verified} of {completeness.total} Verified
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-48 bg-slate-200 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${completeness.percentage}%` }}
                      />
                    </div>
                    <span className="text-base font-black text-slate-900">{completeness.percentage}%</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleGenerateLink}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-sm"
                  >
                    <Link2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Generate Client Upload Link</span>
                  </button>
                </div>
              </div>

              {/* Generated Link Alert */}
              {generatedLink && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-900 font-bold">Secure Upload Link Generated (Valid 72h):</strong>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Single-client scoped
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink.uploadUrl}
                      className="flex-1 bg-white border border-slate-300 rounded p-1.5 text-xs font-mono"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded font-bold hover:bg-slate-800 flex items-center space-x-1"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Requirements Checklist Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-bold">Required Document</th>
                      <th className="py-3 px-4 font-bold">Category</th>
                      <th className="py-3 px-4 font-bold text-center">Status</th>
                      <th className="py-3 px-4 font-bold">Uploaded File</th>
                      <th className="py-3 px-4 font-bold text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {caseReqs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400">
                          No document checklist generated yet.
                        </td>
                      </tr>
                    ) : (
                      caseReqs.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4">
                            <strong className="text-slate-900 block font-bold">{req.documentName}</strong>
                            {req.rejectionReason && (
                              <span className="text-rose-600 text-[10px] font-semibold block mt-0.5">
                                Reason: {req.rejectionReason}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {req.category}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                              req.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                              req.status === 'correction_required' ? 'bg-rose-100 text-rose-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {req.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-mono text-[11px]">
                            {req.uploadedFile ? req.uploadedFile.fileName : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {req.uploadedFile ? (
                              <button
                                onClick={() => setReviewingDoc(req)}
                                className="px-3 py-1 bg-slate-900 text-white rounded font-bold hover:bg-slate-800"
                              >
                                Review
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Awaiting Upload</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCE & FEES */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Standard Onboarding Engagement Fee Ledger
                    </h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Invoice: <span className="font-mono font-bold text-slate-700">{currentCase.engagementFee?.invoiceNumber}</span>
                    </p>
                  </div>
                  <div>
                    {currentCase.engagementFee?.isVerified ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified & Cleared</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-amber-700 bg-amber-50 border border-amber-300 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Pending Financial Audit</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Amount Due</span>
                    <strong className="text-base text-slate-900">GH₵ {currentCase.engagementFee?.amountDue}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Amount Paid</span>
                    <strong className="text-base text-slate-900">GH₵ {currentCase.engagementFee?.amountPaid}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Payment Reference</span>
                    <strong className="text-base font-mono text-slate-900">
                      {currentCase.engagementFee?.transactionRef || 'None entered'}
                    </strong>
                  </div>
                </div>

                {/* Finance Verification Action for Authorized Roles */}
                {!currentCase.engagementFee?.isVerified && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-3">
                    <div className="flex items-start space-x-2">
                      <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-900 block font-bold">
                          Finance Verification Desk
                        </strong>
                        <p className="text-amber-800 text-[11px]">
                          {isFinanceOrCeo 
                            ? 'As an authorized Finance Officer or CEO, confirm receipt of funds against KIA bank or mobile money merchant statement.'
                            : 'Only Finance/Admin officers or the CEO can verify payment evidence.'}
                        </p>
                      </div>
                    </div>

                    {isFinanceOrCeo && (
                      <div className="flex items-center space-x-3 pt-2">
                        <input
                          type="text"
                          placeholder="Confirm MTN MoMo / Bank Reference ID..."
                          value={verifyTxRef}
                          onChange={(e) => setVerifyTxRef(e.target.value)}
                          className="flex-1 border border-slate-300 rounded-lg p-2 bg-white text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyFee}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
                        >
                          Verify & Clear Fee
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  Active Tasks for {currentCase.tradingName}
                </h3>
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Add Task Sub-form */}
              {isAddingTask && (
                <form onSubmit={handleCreateTask} className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">Create New Task</h4>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Task Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Review uploaded tax clearance certificate..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Due Date *</label>
                      <input
                        type="date"
                        value={newTaskDue}
                        onChange={(e) => setNewTaskDue(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingTask(false)}
                      className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 text-white rounded font-bold hover:bg-slate-800"
                    >
                      Save Task
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              <div className="space-y-2.5">
                {caseTasks.length === 0 ? (
                  <p className="text-slate-400 py-6 text-center">No active tasks created for this case.</p>
                ) : (
                  caseTasks.map(task => (
                    <div key={task.id} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{task.taskNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            task.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {task.status.replace(/_/g, ' ')}
                          </span>
                          {task.isOverdue && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              {task.daysOverdue}d Overdue
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs">{task.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">Due: {task.dueDate}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Case Activity & Audit History
              </h3>
              {auditLogs.length === 0 ? (
                <p className="text-slate-400 py-6 text-center">No audit records found for this case yet.</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map(log => (
                    <div key={log.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
                        <strong className="text-slate-800">{log.actorName} ({log.actorRole})</strong>
                        <span>{new Date(log.timestamp).toLocaleString('en-GB')}</span>
                      </div>
                      <p className="text-slate-700 font-medium">{log.notes || `Action: ${log.action}`}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {reviewingDoc && (
        <DocumentReviewModal
          requirement={reviewingDoc}
          onClose={() => setReviewingDoc(null)}
          onReviewed={refreshCaseReqs}
        />
      )}
    </div>
  );
}

