import React, { useState } from 'react';
import { X, UserPlus, DollarSign } from 'lucide-react';

export default function NewClientModal({ isOpen, onClose, onAddClient }) {
  const [formData, setFormData] = useState({
    clientName: '',
    businessName: '',
    sector: 'Agribusiness',
    targetGrantSize: 'GHS 50,000 – GHS 200,000',
    assignedConsultant: 'Lead Consultant (Kia)',
    commitmentFeePaid: true,
    commitmentFeeAmount: 200,
    notes: 'Onboarded via Kia Client Intake.'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.businessName) return;

    // Create fresh client with default starter score matrix
    const newClient = {
      id: `kia-${Date.now().toString().slice(-4)}`,
      ...formData,
      dateOnboarded: new Date().toISOString().split('T')[0],
      stage: 'Stage 1: Onboarding',
      priorityGrants: formData.sector === 'Agribusiness' 
        ? ['GEA / World Bank YouStart', 'Mastercard Foundation / Agri-Impact'] 
        : ['NEIP Innovation Grant', 'Tony Elumelu Foundation'],
      scores: {
        legal_reg: 2,
        legal_bank: 2,
        model_value: 3,
        model_traction: 3,
        doc_plan: 2,
        doc_pitch: 1,
        doc_traction: 2,
        fin_records: 1,
        fin_projections: 1,
        comp_tax: 1,
        comp_permits: 2,
        team_founder: 3,
        team_skills: 2,
        sector_donor: formData.sector === 'Agribusiness' ? 5 : 4,
        sector_scale: 3,
        impact_jobs: 3,
        impact_esg: 3,
        grant_history: 0,
        app_comm: 4,
        app_commitment: formData.commitmentFeePaid ? 5 : 2
      },
      redFlags: {
        delayedResponses: false,
        missingInfo: true,
        complianceRisk: false,
        unrealisticExpectations: false,
        documentationIssues: true
      },
      checklist: {
        intakeFilled: true,
        initialAssessmentDone: false,
        agreementSigned: false,
        feeReceived: formData.commitmentFeePaid,
        regVerified: false,
        tinConfirmed: false,
        bizPlanDrafted: false,
        pitchDeckReady: false,
        financialProjections: false,
        complianceResolved: false,
        grantsIdentified: false,
        narrativeDrafted: false,
        submitted: false,
        grantWon: false
      }
    };

    onAddClient(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Onboard New Grant Client</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase block mb-1">
              Founder / Client Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ama Mensah"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase block mb-1">
              Business / Venture Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Gold Coast Organics"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase block mb-1">
                Industry Sector
              </label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Agribusiness">Agribusiness</option>
                <option value="Technology & Services">Technology & Services</option>
                <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                <option value="NGO / Social Enterprise">NGO / Social Enterprise</option>
                <option value="General Commerce & Services">General Commerce & Services</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase block mb-1">
                Target Grant Size
              </label>
              <input
                type="text"
                value={formData.targetGrantSize}
                onChange={(e) => setFormData({ ...formData, targetGrantSize: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase block mb-1">
              Assigned Consultant
            </label>
            <input
              type="text"
              value={formData.assignedConsultant}
              onChange={(e) => setFormData({ ...formData, assignedConsultant: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Commitment Fee Status */}
          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
            <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={formData.commitmentFeePaid}
                onChange={(e) => setFormData({ ...formData, commitmentFeePaid: e.target.checked })}
                className="rounded text-amber-500 w-4 h-4"
              />
              <span>Client paid initial GHS 200 Commitment Fee</span>
            </label>
            <p className="text-[11px] text-slate-500 mt-1 pl-6">
              Receipt will be marked as paid and client enters Stage 1 active pipeline.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-sm"
            >
              Onboard Client & Launch Audit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
