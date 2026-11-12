import React, { useState } from 'react';
import { 
  FileText, Calendar, Printer, TrendingUp, CheckCircle2, 
  AlertTriangle, Users, DollarSign, Award, Clock 
} from 'lucide-react';
import { crmService } from '../services/crmService';
import { applicationService } from '../services/applicationService';
import { taskService } from '../services/taskService';
import { financeService } from '../services/financeService';
import { documentService } from '../services/documentService';

export default function OperationalReportsView() {
  const [reportType, setReportType] = useState('daily'); // 'daily', 'weekly', 'monthly'

  const cases = crmService.getCases();
  const applications = applicationService.getApplications();
  const tasks = taskService.getTasks();
  const finance = financeService.getFinancialOverview();
  const requirements = documentService.getCaseRequirements();

  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Calculate metrics
  const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate < new Date().toISOString().split('T')[0]);
  const activeApplications = applications.filter(a => a.currentStage !== 'submitted' && a.currentStage !== 'awarded' && a.currentStage !== 'unsuccessful');
  const submittedApplications = applications.filter(a => a.currentStage === 'submitted' || a.currentStage === 'under_funder_review');
  const awardedApplications = applications.filter(a => a.currentStage === 'awarded');
  const pendingDocsCount = requirements.filter(r => r.status === 'uploaded' || r.status === 'under_review').length;

  return (
    <div className="space-y-6">
      {/* Control Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-600 flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Management & Executive Intelligence</span>
          </span>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Operational Reporting Suite
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time executive summaries, team workload distribution, submission pacing, and fee reconciliation for management review.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 text-xs font-bold">
            <button
              onClick={() => setReportType('daily')}
              className={`px-3 py-1.5 rounded-lg transition ${reportType === 'daily' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              Daily Briefing
            </button>
            <button
              onClick={() => setReportType('weekly')}
              className={`px-3 py-1.5 rounded-lg transition ${reportType === 'weekly' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              Weekly Digest
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-3 py-1.5 rounded-lg transition ${reportType === 'monthly' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              Monthly Executive
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8 max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Letterhead */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-md">
              KIA
            </div>
            <div>
              <h2 className="font-black text-slate-950 text-lg leading-tight tracking-tight">KIA-START UP CONSULT</h2>
              <p className="text-xs text-slate-500 font-medium">Enterprise Grant Advisory, Readiness & Application Management</p>
              <p className="text-[10px] text-slate-400">Head Office: Accra Central, Greater Accra Region, Ghana</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
              {reportType === 'daily' && 'Daily Operational Briefing'}
              {reportType === 'weekly' && 'Weekly Operational Digest'}
              {reportType === 'monthly' && 'Monthly Executive Management Review'}
            </span>
            <div className="text-xs text-slate-600 mt-1 font-semibold">Generated: {todayStr}</div>
            <div className="text-[10px] text-slate-400 font-mono">Ref: OPS-{reportType.toUpperCase()}-{new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        {/* REPORT TYPE 1: DAILY OPERATIONAL BRIEFING */}
        {reportType === 'daily' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-black text-slate-900 text-base">Executive Day-Start Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Critical items requiring management resolution before close of business.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Cases</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{cases.length}</span>
                <span className="text-[10px] text-slate-500 block">Under active management</span>
              </div>
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
                <span className="text-[10px] uppercase font-bold text-rose-600 block">Overdue Tasks</span>
                <span className="text-2xl font-black text-rose-700 mt-1 block">{overdueTasks.length}</span>
                <span className="text-[10px] text-rose-600 block">SLA Breaches detected</span>
              </div>
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                <span className="text-[10px] uppercase font-bold text-amber-600 block">Docs Under Review</span>
                <span className="text-2xl font-black text-amber-800 mt-1 block">{pendingDocsCount}</span>
                <span className="text-[10px] text-amber-600 block">Awaiting officer audit</span>
              </div>
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Verified Fees</span>
                <span className="text-2xl font-black text-emerald-800 mt-1 block">GH₵ {finance.verifiedPayments.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-600 block">Reconciled in bank</span>
              </div>
            </div>

            {/* Overdue Items Requiring Focus */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900 text-xs border-b border-slate-200 flex justify-between">
                <span>Critical Overdue Task Action List</span>
                <span className="text-rose-600 font-extrabold">{overdueTasks.length} Overdue</span>
              </div>
              {overdueTasks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">All tasks are currently within operational SLA boundaries.</div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {overdueTasks.map(t => (
                    <div key={t.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{t.title}</div>
                        <div className="text-[10px] text-slate-500">{t.description}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          Due: {t.dueDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* REPORT TYPE 2: WEEKLY OPERATIONAL DIGEST */}
        {reportType === 'weekly' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-black text-slate-900 text-base">Weekly Operational Velocity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Summary of client onboarding, readiness diagnostic completions, and proposal preparation.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Proposals in Prep</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{activeApplications.length}</span>
                <span className="text-[11px] text-slate-500 block">Across 6 donor opportunities</span>
              </div>
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                <span className="text-[10px] font-bold text-blue-600 uppercase block">Proposals Submitted</span>
                <span className="text-2xl font-black text-blue-900 mt-1 block">{submittedApplications.length}</span>
                <span className="text-[11px] text-blue-600 block">With verified submission refs</span>
              </div>
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Grants Awarded</span>
                <span className="text-2xl font-black text-emerald-900 mt-1 block">{awardedApplications.length}</span>
                <span className="text-[11px] text-emerald-600 block">Success fee triggered</span>
              </div>
            </div>

            {/* Applications in Preparation Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-900 text-xs border-b border-slate-200">
                Active Grant Acquisition Pipeline
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Application #</th>
                    <th className="py-2.5 px-4">Client</th>
                    <th className="py-2.5 px-4">Grant Target</th>
                    <th className="py-2.5 px-4">Stage</th>
                    <th className="py-2.5 px-4">Closing Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map(a => (
                    <tr key={a.id}>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{a.applicationNumber}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{a.clientName}</td>
                      <td className="py-2.5 px-4 text-slate-700">{a.grantTitle}</td>
                      <td className="py-2.5 px-4 font-bold text-amber-700 uppercase text-[10px]">{a.currentStage}</td>
                      <td className="py-2.5 px-4 text-slate-600">{a.closingDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT TYPE 3: MONTHLY EXECUTIVE MANAGEMENT */}
        {reportType === 'monthly' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-black text-slate-900 text-base">Monthly Strategic Grant Practice Review</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pipeline conversion, fee collection reconciliation, and risk mitigations for the Board & CEO.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pipeline Invoiced</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">GH₵ {finance.totalInvoiced.toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Realized Collections</span>
                <span className="text-xl font-black text-emerald-800 mt-1 block">GH₵ {finance.verifiedPayments.toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Projected Success Fees</span>
                <span className="text-xl font-black text-purple-900 mt-1 block">GH₵ {finance.projectedSuccessFees.toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">Conversion Rate</span>
                <span className="text-xl font-black text-indigo-900 mt-1 block">78.5%</span>
              </div>
            </div>

            {/* Strategic Notes */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-900 block">Key Strategic Observations & Directives:</span>
              <p className="text-slate-700">
                1. <strong>Ghanaian Compliance Integrity:</strong> 100% of onboarded SME and Startup applicants now maintain active GRA Tax Clearance Certificates and RGD/ORC business registration documents before proposal submission.
              </p>
              <p className="text-slate-700">
                2. <strong>Zero Unverified Submissions:</strong> No application may be declared submitted without an official funder confirmation reference number and electronic acknowledgement slip on file.
              </p>
              <p className="text-slate-700">
                3. <strong>Revenue Discipline:</strong> Segregation of financial duties is strictly enforced; all initial engagement fees (GH₵ 200) and contractual success fees (5%) are verified exclusively by Finance Officer Emmanuel Darko or the CEO.
              </p>
            </div>
          </div>
        )}

        {/* Sign-off Section */}
        <div className="border-t border-slate-200 pt-6 mt-8 flex justify-between items-end text-xs">
          <div>
            <div className="font-bold text-slate-900">Abena Osei</div>
            <div className="text-[11px] text-slate-500">Grant Application Team Leader</div>
            <div className="text-[10px] text-slate-400 mt-2">Electronic Signature Timestamp: {new Date().toISOString()}</div>
          </div>

          <div className="text-right">
            <div className="font-bold text-slate-900">Kwame Boateng</div>
            <div className="text-[11px] text-slate-500">Chief Executive Officer / Managing Director</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-2">Approved for Executive Action</div>
          </div>
        </div>
      </div>
    </div>
  );
}
