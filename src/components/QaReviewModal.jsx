import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { authService } from '../services/authService';

export default function QaReviewModal({ application, onClose, onReviewed }) {
  const [decision, setDecision] = useState('approved'); // 'approved' or 'revisions_required'
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!application) return null;

  const currentUser = authService.getCurrentUser();
  const isAuthorized = currentUser.role === 'team_leader' || currentUser.role === 'ceo' || currentUser.role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (decision === 'revisions_required' && !feedbackNotes.trim()) {
      alert('Please specify the exact revisions required before returning to the officer.');
      return;
    }

    setIsSubmitting(true);
    try {
      await applicationService.recordQaReview(application.id, {
        decision,
        feedbackNotes: feedbackNotes.trim() || 'Internal Review QA Gate approved without revisions.'
      });
      setIsSubmitting(false);
      onReviewed();
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-bold uppercase text-[10px] tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Internal Quality Assurance Gate</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Review {application.applicationNumber}: {application.clientName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{application.grantTitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Summary Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-bold uppercase text-[10px]">Target Funding Ask:</span>
              <strong className="text-slate-900 font-bold text-sm">
                GH₵ {Number(application.targetFundingAmount).toLocaleString()}
              </strong>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Proposal Narrative Summary</span>
              <p className="text-slate-700 leading-relaxed">
                {application.proposalSummary || 'Comprehensive pitch addressing funder job creation targets and value chain expansion.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Milestone Budget Breakdown</span>
              <p className="text-slate-700 leading-relaxed">
                {application.budgetSummary || 'Capital deployment schedule aligned with donor milestone disbursement guidelines.'}
              </p>
            </div>
          </div>

          {/* QA Role Authorization Notice */}
          {!isAuthorized ? (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-rose-800 text-xs">
              ⚠️ You are currently signed in as <strong>{currentUser.fullName} ({currentUser.roleLabel})</strong>. Only the Team Leader or CEO can sign off on this QA gate. Switch role in the top bar to test.
            </div>
          ) : (
            <>
              {/* QA Decision Toggle */}
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1.5">
                  QA Evaluation Decision *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('approved')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                      decision === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approve for Submission</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('revisions_required')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                      decision === 'revisions_required'
                        ? 'bg-rose-50 text-rose-800 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Request Revisions</span>
                  </button>
                </div>
              </div>

              {/* Feedback Notes */}
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  QA Notes & Review Feedback {decision === 'revisions_required' ? '*' : '(Optional)'}
                </label>
                <textarea
                  rows="3"
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder={
                    decision === 'approved'
                      ? 'e.g. Budget metrics and outgrower numbers verified against Happy Project guidelines; cleared for client confirmation.'
                      : 'e.g. Budget line item 3 overestimates equipment costs; please adjust to match supplier pro-forma invoice.'
                  }
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  required={decision === 'revisions_required'}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 font-bold rounded-lg text-white shadow-sm transition ${
                    decision === 'approved' 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmitting ? 'Recording...' : decision === 'approved' ? 'Confirm QA Approval' : 'Return for Revisions'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

