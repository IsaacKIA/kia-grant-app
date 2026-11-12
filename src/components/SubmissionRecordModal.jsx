import React, { useState } from 'react';
import { X, Send, ShieldCheck, FileCheck, AlertTriangle } from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { authService } from '../services/authService';

export default function SubmissionRecordModal({ application, onClose, onSubmitted }) {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!application) return null;

  const currentUser = authService.getCurrentUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      alert('Official funder submission reference ID is strictly mandatory.');
      return;
    }

    setIsSubmitting(true);
    try {
      await applicationService.recordSubmissionEvidence(application.id, {
        submissionReferenceNumber: referenceNumber.trim(),
        submissionEvidenceUrl: evidenceNote.trim() || 'Submission receipt logged in private storage',
        notes: `Submitted by ${currentUser.fullName} on ${new Date().toLocaleDateString('en-GB')}`
      });
      setIsSubmitting(false);
      onSubmitted();
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-teal-400 font-bold uppercase text-[10px] tracking-wider">
              <FileCheck className="w-4 h-4" />
              <span>Submission Evidence Desk</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Record External Submission: {application.applicationNumber}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{application.clientName} • {application.grantTitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] space-y-1">
            <strong className="font-bold block">Mandatory Verification Rule 3.5:</strong>
            <p>
              Applications must NEVER be marked "Submitted" without physical confirmation evidence from the donor portal or official receipt email.
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase block mb-1">
              Funder Portal Submission Reference ID *
            </label>
            <input
              type="text"
              placeholder="e.g. GEA-YS-2026-99214 or TEF-APP-781923"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase block mb-1">
              Confirmation Screenshot Reference / Receipt Details *
            </label>
            <textarea
              rows="3"
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              placeholder="e.g. Received official confirmation email from tefconnect.net at 14:32 GMT; confirmation screenshot saved in case dossier."
              className="w-full border border-slate-300 rounded-lg p-2.5"
              required
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500">
            Submitting Officer: <strong className="text-slate-800">{currentUser.fullName} ({currentUser.roleLabel})</strong>
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
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Verifying...' : 'Confirm Submission to Funder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

