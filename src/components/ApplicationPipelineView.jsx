import React, { useState } from 'react';
import { 
  Search, Clock, CheckCircle2, 
  AlertTriangle, ShieldCheck, DollarSign, Send, Award, ArrowRight, Eye 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { applicationService, APPLICATION_STAGES } from '../services/applicationService';
import { STAFF_USERS } from '../services/authService';
import QaReviewModal from './QaReviewModal';
import SubmissionRecordModal from './SubmissionRecordModal';

export default function ApplicationPipelineView({ onOpenMatcher }) {
  const [applications, setApplications] = useState(() => applicationService.getApplications());
  const [search, setSearch] = useState('');
  const [officerFilter, setOfficerFilter] = useState('All');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'

  // Modals
  const [qaApp, setQaApp] = useState(null);
  const [submittingApp, setSubmittingApp] = useState(null);
  const [outcomeApp, setOutcomeApp] = useState(null);

  // Outcome form state
  const [outcomeStatus, setOutcomeStatus] = useState('awarded');
  const [awardedAmount, setAwardedAmount] = useState('');
  const [awardNotes, setAwardNotes] = useState('');

  const refreshApplications = () => {
    setApplications(applicationService.getApplications());
  };

  const handleAdvanceStage = async (appId, nextStage) => {
    try {
      await applicationService.updateApplicationStage(appId, nextStage);
      refreshApplications();
    } catch (err) {
      alert(err.message);
    }
  };

  const officers = STAFF_USERS.filter(s => s.role === 'application_officer' || s.role === 'team_leader');

  const filteredApps = applications.filter(a => {
    const matchesSearch = 
      a.clientName.toLowerCase().includes(search.toLowerCase()) ||
      a.grantTitle.toLowerCase().includes(search.toLowerCase()) ||
      a.applicationNumber.toLowerCase().includes(search.toLowerCase());
    const matchesOfficer = officerFilter === 'All' || a.assignedOfficerId === officerFilter;
    return matchesSearch && matchesOfficer;
  });

  const handleExecuteOutcome = async (e) => {
    e.preventDefault();
    if (!outcomeApp) return;

    try {
      await applicationService.recordOutcome(outcomeApp.id, {
        outcomeStatus,
        awardedAmount: outcomeStatus === 'awarded' ? awardedAmount : null,
        notes: awardNotes
      });

      if (outcomeStatus === 'awarded') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      setOutcomeApp(null);
      setAwardedAmount('');
      setAwardNotes('');
      refreshApplications();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Grant Application Acquisition Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active application preparation, internal QA quality gates, verifiable submission tracking, and grant award outcomes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md transition ${viewMode === 'kanban' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              Table View
            </button>
          </div>

          {onOpenMatcher && (
            <button
              onClick={onOpenMatcher}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Match & Adopt Grant</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, grant opportunity, or app #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200"
          />
        </div>

        <select
          value={officerFilter}
          onChange={(e) => setOfficerFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium"
        >
          <option value="All">All Application Officers</option>
          {officers.map(o => (
            <option key={o.id} value={o.id}>{o.fullName}</option>
          ))}
        </select>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {APPLICATION_STAGES.map(stage => {
            const stageApps = filteredApps.filter(a => a.status === stage.id);

            return (
              <div 
                key={stage.id}
                className="bg-slate-100/70 rounded-2xl p-3.5 border border-slate-200 flex flex-col space-y-3 w-[290px] shrink-0"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
                    <span>{stage.label}</span>
                  </h3>
                  <span className="w-5 h-5 rounded-full bg-white text-slate-700 font-bold text-[10px] flex items-center justify-center border border-slate-200 shadow-2xs">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1">
                  {stageApps.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                      No applications
                    </div>
                  ) : (
                    stageApps.map(app => {
                      const officer = STAFF_USERS.find(s => s.id === app.assignedOfficerId);
                      const isDeadlineClose = new Date(app.funderDeadline) - new Date() < 14 * 86400000;

                      return (
                        <div 
                          key={app.id}
                          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2.5 hover:shadow-md transition"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-mono font-bold text-slate-400">{app.applicationNumber}</span>
                            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                              GH₵ {Number(app.targetFundingAmount).toLocaleString()}
                            </span>
                          </div>

                          <div>
                            <strong className="text-slate-900 block text-xs font-bold leading-tight">
                              {app.clientName}
                            </strong>
                            <p className="text-[11px] text-amber-700 font-medium line-clamp-1 mt-0.5">
                              {app.grantTitle}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                            <span>Officer: <strong>{officer?.fullName.split(' ')[0] || 'Unassigned'}</strong></span>
                            <span className={`font-bold flex items-center space-x-1 ${isDeadlineClose ? 'text-rose-600' : 'text-slate-500'}`}>
                              <Clock className="w-3 h-3" />
                              <span>{app.funderDeadline}</span>
                            </span>
                          </div>

                          {/* Specific Context Actions */}
                          {app.status === 'opportunity_selected' && (
                            <button
                              onClick={() => handleAdvanceStage(app.id, 'proposal_preparation')}
                              className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center space-x-1"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span>Start Proposal Draft</span>
                            </button>
                          )}

                          {app.status === 'proposal_preparation' && (
                            <button
                              onClick={() => handleAdvanceStage(app.id, 'budget_preparation')}
                              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center space-x-1"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span>Move to Budget</span>
                            </button>
                          )}

                          {app.status === 'budget_preparation' && (
                            <button
                              onClick={() => handleAdvanceStage(app.id, 'internal_review')}
                              className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center space-x-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Send to QA Review</span>
                            </button>
                          )}

                          {app.status === 'internal_review' && (
                            <button
                              onClick={() => setQaApp(app)}
                              className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center justify-center space-x-1"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Review & Approve (QA)</span>
                            </button>
                          )}

                          {app.status === 'approved_for_submission' && (
                            <button
                              onClick={() => setSubmittingApp(app)}
                              className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition flex items-center justify-center space-x-1"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Record Submission</span>
                            </button>
                          )}

                          {(app.status === 'submitted' || app.status === 'under_funder_review') && (
                            <button
                              onClick={() => {
                                setOutcomeApp(app);
                                setAwardedAmount(String(app.targetFundingAmount));
                              }}
                              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition flex items-center justify-center space-x-1"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-400" />
                              <span>Record Final Result</span>
                            </button>
                          )}

                          {app.status === 'awarded' && (
                            <div className="bg-emerald-50 border border-emerald-300 rounded p-1.5 text-center text-[10px] text-emerald-800 font-bold">
                              🏆 Awarded GH₵ {Number(app.awardedAmount).toLocaleString()}!
                            </div>
                          )}

                          {app.status === 'rejected' && (
                            <div className="bg-rose-50 border border-rose-200 rounded p-1.5 text-center text-[10px] text-rose-700 font-bold">
                              Not Funded
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">App # & Client</th>
                  <th className="py-3 px-4 font-bold">Target Grant</th>
                  <th className="py-3 px-4 font-bold">Target Ask</th>
                  <th className="py-3 px-4 font-bold">Officer</th>
                  <th className="py-3 px-4 font-bold">Stage</th>
                  <th className="py-3 px-4 font-bold">Funder Deadline</th>
                  <th className="py-3 px-4 font-bold text-right">Next Step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map(app => {
                  const officer = STAFF_USERS.find(s => s.id === app.assignedOfficerId);
                  const stage = APPLICATION_STAGES.find(s => s.id === app.status) || APPLICATION_STAGES[0];

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="font-mono text-[10px] text-slate-400 block">{app.applicationNumber}</span>
                        <span>{app.clientName}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {app.grantTitle}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        GH₵ {Number(app.targetFundingAmount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {officer?.fullName || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stage.color}`}>
                          {stage.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {app.funderDeadline}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {app.status === 'opportunity_selected' && (
                          <button
                            onClick={() => handleAdvanceStage(app.id, 'proposal_preparation')}
                            className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
                          >
                            Start Draft
                          </button>
                        )}
                        {app.status === 'proposal_preparation' && (
                          <button
                            onClick={() => handleAdvanceStage(app.id, 'budget_preparation')}
                            className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700"
                          >
                            Move to Budget
                          </button>
                        )}
                        {app.status === 'budget_preparation' && (
                          <button
                            onClick={() => handleAdvanceStage(app.id, 'internal_review')}
                            className="px-2.5 py-1 bg-purple-600 text-white font-bold rounded hover:bg-purple-700"
                          >
                            Send to QA
                          </button>
                        )}
                        {app.status === 'internal_review' && (
                          <button
                            onClick={() => setQaApp(app)}
                            className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-400"
                          >
                            QA Review
                          </button>
                        )}
                        {app.status === 'approved_for_submission' && (
                          <button
                            onClick={() => setSubmittingApp(app)}
                            className="px-2.5 py-1 bg-teal-600 text-white font-bold rounded hover:bg-teal-700"
                          >
                            Record Submission
                          </button>
                        )}
                        {(app.status === 'submitted' || app.status === 'under_funder_review') && (
                          <button
                            onClick={() => {
                              setOutcomeApp(app);
                              setAwardedAmount(String(app.targetFundingAmount));
                            }}
                            className="px-2.5 py-1 bg-slate-900 text-white font-bold rounded hover:bg-slate-800"
                          >
                            Record Result
                          </button>
                        )}
                        {app.status === 'awarded' && (
                          <span className="text-emerald-700 font-bold text-[11px]">Awarded</span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="text-rose-600 font-bold text-[11px]">Not Funded</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QA Review Modal */}
      {qaApp && (
        <QaReviewModal
          application={qaApp}
          onClose={() => setQaApp(null)}
          onReviewed={refreshApplications}
        />
      )}

      {/* Submission Record Modal */}
      {submittingApp && (
        <SubmissionRecordModal
          application={submittingApp}
          onClose={() => setSubmittingApp(null)}
          onSubmitted={refreshApplications}
        />
      )}

      {/* Outcome Recording Modal */}
      {outcomeApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Record Funder Outcome</h3>
                <p className="text-xs text-slate-400 mt-0.5">{outcomeApp.applicationNumber} • {outcomeApp.clientName}</p>
              </div>
              <button onClick={() => setOutcomeApp(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleExecuteOutcome} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Official Decision Outcome *
                </label>
                <select
                  value={outcomeStatus}
                  onChange={(e) => setOutcomeStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-bold text-xs"
                >
                  <option value="awarded">🏆 Grant Awarded / Won</option>
                  <option value="rejected">❌ Not Funded / Rejected</option>
                </select>
              </div>

              {outcomeStatus === 'awarded' && (
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Awarded Grant Amount (GHS) *
                  </label>
                  <input
                    type="number"
                    value={awardedAmount}
                    onChange={(e) => setAwardedAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 font-bold text-sm text-slate-900"
                    required
                  />
                  <span className="text-[10px] text-amber-700 font-semibold block mt-1">
                    Note: A 5% success fee task (GH₵ {Math.round((Number(awardedAmount) || 0) * 0.05).toLocaleString()}) will automatically be issued to the Finance Officer.
                  </span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Outcome Notes / Funder Communication
                </label>
                <textarea
                  rows="3"
                  value={awardNotes}
                  onChange={(e) => setAwardNotes(e.target.value)}
                  placeholder="Official award letter details, grant execution milestones, or funder rejection feedback..."
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOutcomeApp(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
                >
                  Finalize Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

