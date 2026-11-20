import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, FileText, Download, ShieldCheck } from 'lucide-react';
import { documentService } from '../services/documentService';
import { authService } from '../services/authService';

export default function DocumentReviewModal({ requirement, onClose, onReviewed }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!requirement || !requirement.uploadedFile) return null;

  const file = requirement.uploadedFile;
  const currentUser = authService.getCurrentUser();

  const handleVerify = async () => {
    setIsSubmitting(true);
    try {
      await documentService.verifyDocument(requirement.id, `Verified by ${currentUser.fullName}`);
      setIsSubmitting(false);
      onReviewed();
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      alert(err.message);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please state a specific correction reason for the client.');
      return;
    }
    setIsSubmitting(true);
    try {
      await documentService.rejectDocument(requirement.id, rejectionReason);
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
            <h3 className="font-bold text-sm">Staff Document Verification Desk</h3>
            <p className="text-xs text-slate-400 mt-0.5">{requirement.clientName} • {requirement.documentName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* File Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <strong className="text-slate-900 text-sm block">{file.fileName}</strong>
                <span className="text-slate-500 text-[11px]">
                  Size: {file.fileSize} • Uploaded: {new Date(file.uploadedAt).toLocaleString('en-GB')}
                </span>
                {file.clientNote && (
                  <p className="mt-2 text-slate-700 bg-white p-2 rounded border border-slate-200 italic">
                    "{file.clientNote}"
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  if (file.storagePath) {
                    const signedUrl = await documentService.getSignedDownloadUrl(file.storagePath);
                    if (signedUrl) {
                      window.open(signedUrl, '_blank', 'noopener,noreferrer');
                      return;
                    }
                  }
                  alert('This file was recorded in local offline mode and does not have a cloud file attached.');
                } catch (err) {
                  alert(`Could not open file: ${err.message}`);
                }
              }}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-xs hover:bg-slate-50 transition"
              title="Download / Open File"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Audit Verification Guidelines */}
          <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 text-blue-900 text-[11px] space-y-1">
            <strong className="font-bold block">Verification Checklist:</strong>
            <p>1. Check company name exactly matches registration documents.</p>
            <p>2. Verify official stamp, ORC renewal date, or bank transaction consistency.</p>
            <p>3. Do NOT mark verified if pages are missing or illegible.</p>
          </div>

          {/* Rejection Form if triggered */}
          {isRejecting ? (
            <form onSubmit={handleReject} className="space-y-3 pt-2 border-t border-slate-100">
              <label className="font-bold text-rose-800 uppercase block">
                Specific Correction Required *
              </label>
              <textarea
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Page 2 of ORC Form 3 is missing signature; please scan full Form 3 showing 2026 renewal stamp..."
                className="w-full border border-rose-300 rounded-lg p-2.5 text-xs bg-rose-50/30"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-600"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700"
                >
                  {isSubmitting ? 'Rejecting...' : 'Confirm Rejection & Issue Correction'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold rounded-lg transition"
              >
                Reject / Correction Required
              </button>

              <button
                type="button"
                onClick={handleVerify}
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center space-x-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying...' : 'Verify Document as Compliant'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

