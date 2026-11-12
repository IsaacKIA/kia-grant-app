import React, { useState } from 'react';
import { 
  X, CheckSquare, Square, AlertTriangle, FileText, CheckCircle2, 
  DollarSign, Award, ArrowRight, Save, Clock, ShieldAlert 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { STAGES } from './PipelineView';
import { calculateReadiness } from '../data/criteria';

export default function ClientDetailModal({ client, onClose, onSaveClient, onOpenCalculator }) {
  const [formData, setFormData] = useState({ ...client });
  const readiness = calculateReadiness(formData.scores);

  const toggleChecklist = (key) => {
    setFormData(prev => {
      const nextChecklist = {
        ...prev.checklist,
        [key]: !prev.checklist[key]
      };
      
      // If grantWon is turned on, trigger celebration confetti!
      if (key === 'grantWon' && !prev.checklist.grantWon) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      return {
        ...prev,
        checklist: nextChecklist
      };
    });
  };

  const toggleRedFlag = (flag) => {
    setFormData(prev => ({
      ...prev,
      redFlags: {
        ...prev.redFlags,
        [flag]: !prev.redFlags[flag]
      }
    }));
  };

  const handleSave = () => {
    onSaveClient(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h2 className="text-xl font-bold tracking-tight">{formData.businessName}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${readiness.tier.badgeClass}`}>
                {readiness.totalScore}/100 • {readiness.tier.label}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Founder: <strong className="text-slate-200">{formData.clientName}</strong> • Sector: <span className="text-amber-400 font-semibold">{formData.sector}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenCalculator(formData)}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition"
            >
              Recalculate Score
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Info & Fee Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] text-slate-500 uppercase font-bold block mb-1">
                Current Pipeline Stage
              </span>
              <select
                value={formData.stage}
                onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
                className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-amber-500"
              >
                {STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 uppercase font-bold block mb-1">
                Commitment Fee (GHS 200)
              </span>
              <button
                onClick={() => setFormData(prev => ({ ...prev, commitmentFeePaid: !prev.commitmentFeePaid }))}
                className={`w-full text-xs font-bold px-3 py-2 rounded-lg border flex items-center justify-center space-x-1.5 transition ${
                  formData.commitmentFeePaid
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{formData.commitmentFeePaid ? 'Fee Received (GHS 200)' : 'Fee Pending — Mark Received'}</span>
              </button>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 uppercase font-bold block mb-1">
                Target Grant Size
              </span>
              <input
                type="text"
                value={formData.targetGrantSize || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, targetGrantSize: e.target.value }))}
                placeholder="e.g. GHS 100,000 - GHS 300,000"
                className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-2 bg-white"
              />
            </div>
          </div>

          {/* Google Drive Document Vault */}
          {formData.gdriveFolder && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-base">📁</span>
                  <h4 className="font-bold text-xs uppercase text-slate-900 tracking-wider">
                    Google Drive Client Vault: {formData.gdriveFolder.name}
                  </h4>
                  <span className="text-[10px] font-extrabold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                    {formData.gdriveFolder.fileCount} Verified Files
                  </span>
                </div>
                {formData.gdriveFolder.url && (
                  <a
                    href={formData.gdriveFolder.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center space-x-1 underline"
                  >
                    <span>Open in Drive</span>
                    <span>↗</span>
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.gdriveFolder.files && formData.gdriveFolder.files.length > 0 ? (
                  formData.gdriveFolder.files.map((file, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 font-medium shadow-2xs"
                    >
                      <FileText className="w-3 h-3 text-slate-400 mr-1" />
                      {file}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No files uploaded yet in Google Drive folder.</span>
                )}
              </div>
            </div>
          )}

          {/* 7-Stage Detailed Checklist from Notion */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Full 7-Stage Pipeline Checklist (Notion Dashboard)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stage 1 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <h4 className="font-bold text-xs text-blue-700 uppercase mb-3 pb-1 border-b border-blue-100">
                  🟢 Stage 1: Onboarding & Commitment
                </h4>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.intakeFilled || false}
                      onChange={() => toggleChecklist('intakeFilled')}
                      className="rounded text-amber-500"
                    />
                    <span>Client filled grant intake form</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.initialAssessmentDone || false}
                      onChange={() => toggleChecklist('initialAssessmentDone')}
                      className="rounded text-amber-500"
                    />
                    <span>Initial assessment completed</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.agreementSigned || false}
                      onChange={() => toggleChecklist('agreementSigned')}
                      className="rounded text-amber-500"
                    />
                    <span>Service agreement signed</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.feeReceived || false}
                      onChange={() => toggleChecklist('feeReceived')}
                      className="rounded text-amber-500"
                    />
                    <span>Commitment fee (GHS 200) received</span>
                  </label>
                </div>
              </div>

              {/* Stage 2 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <h4 className="font-bold text-xs text-amber-700 uppercase mb-3 pb-1 border-b border-amber-100">
                  🟡 Stage 2: Documentation & Preparation
                </h4>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.regVerified || false}
                      onChange={() => toggleChecklist('regVerified')}
                      className="rounded text-amber-500"
                    />
                    <span>Business registration verified</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.tinConfirmed || false}
                      onChange={() => toggleChecklist('tinConfirmed')}
                      className="rounded text-amber-500"
                    />
                    <span>TIN & bank details confirmed</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.bizPlanDrafted || false}
                      onChange={() => toggleChecklist('bizPlanDrafted')}
                      className="rounded text-amber-500"
                    />
                    <span>Business plan / concept note drafted</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.pitchDeckReady || false}
                      onChange={() => toggleChecklist('pitchDeckReady')}
                      className="rounded text-amber-500"
                    />
                    <span>Pitch deck prepared / refined</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.financialProjections || false}
                      onChange={() => toggleChecklist('financialProjections')}
                      className="rounded text-amber-500"
                    />
                    <span>Financial projections developed</span>
                  </label>
                </div>
              </div>

              {/* Stage 3 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <h4 className="font-bold text-xs text-indigo-700 uppercase mb-3 pb-1 border-b border-indigo-100">
                  🔵 Stage 3: Grant Search & Matching
                </h4>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.grantsIdentified || false}
                      onChange={() => toggleChecklist('grantsIdentified')}
                      className="rounded text-amber-500"
                    />
                    <span>Priority grants mapped (Top 3–5)</span>
                  </label>
                  <div className="mt-2 text-[11px] text-slate-500">
                    <strong>Selected Opportunities:</strong>
                    <ul className="list-disc list-inside mt-1 text-slate-700">
                      {(formData.priorityGrants || []).map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Stage 4 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <h4 className="font-bold text-xs text-purple-700 uppercase mb-3 pb-1 border-b border-purple-100">
                  🟣 Stage 4: Application Development
                </h4>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.narrativeDrafted || false}
                      onChange={() => toggleChecklist('narrativeDrafted')}
                      className="rounded text-amber-500"
                    />
                    <span>Grant narrative & impact drafted</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.internalReview || false}
                      onChange={() => toggleChecklist('internalReview')}
                      className="rounded text-amber-500"
                    />
                    <span>Kia internal quality review completed</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.clientApproval || false}
                      onChange={() => toggleChecklist('clientApproval')}
                      className="rounded text-amber-500"
                    />
                    <span>Client approval obtained</span>
                  </label>
                </div>
              </div>

              {/* Stage 5 & 6 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <h4 className="font-bold text-xs text-pink-700 uppercase mb-3 pb-1 border-b border-pink-100">
                  🔴 Stage 5: Submission & Tracking
                </h4>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.submitted || false}
                      onChange={() => toggleChecklist('submitted')}
                      className="rounded text-amber-500"
                    />
                    <span>Application officially submitted to donor</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.submissionReceipt || false}
                      onChange={() => toggleChecklist('submissionReceipt')}
                      className="rounded text-amber-500"
                    />
                    <span>Submission receipt logged</span>
                  </label>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-emerald-50/40">
                <h4 className="font-bold text-xs text-emerald-800 uppercase mb-3 pb-1 border-b border-emerald-200 flex items-center justify-between">
                  <span>⭐ Stage 6: Grant Outcome & Success Fee</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </h4>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-emerald-900">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.grantWon || false}
                      onChange={() => toggleChecklist('grantWon')}
                      className="rounded text-emerald-600 w-4 h-4"
                    />
                    <span>🎉 GRANT WON / AWARDED!</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.checklist?.successFeeInvoiced || false}
                      onChange={() => toggleChecklist('successFeeInvoiced')}
                      className="rounded text-emerald-600"
                    />
                    <span>Kia success fee percentage invoiced</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Risk & Red Flags Monitor */}
          <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/30 space-y-3">
            <h4 className="font-bold text-xs text-rose-800 uppercase flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Risk & Red Flags Monitor</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {Object.entries({
                delayedResponses: 'Delayed client responses',
                missingInfo: 'Missing / inconsistent info',
                complianceRisk: 'Compliance / GRA risk',
                unrealisticExpectations: 'Unrealistic expectations',
                documentationIssues: 'Critical doc gaps'
              }).map(([flagKey, flagLabel]) => (
                <label key={flagKey} className="flex items-center space-x-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.redFlags?.[flagKey] || false}
                    onChange={() => toggleRedFlag(flagKey)}
                    className="rounded text-rose-600"
                  />
                  <span className="text-slate-700 text-[11px] font-medium">{flagLabel}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Strategy Notes */}
          <div className="space-y-2">
            <label className="font-bold text-xs uppercase tracking-wider text-slate-700 block">
              Internal Strategy Notes (Consultant Eyes Only)
            </label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Record notes on client progress, donor interview feedback, next deliverables..."
              className="w-full text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Client Record</span>
          </button>
        </div>
      </div>
    </div>
  );
}
