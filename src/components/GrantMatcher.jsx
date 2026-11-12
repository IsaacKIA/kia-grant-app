import React, { useState } from 'react';
import { 
  Target, CheckCircle2, AlertTriangle, AlertCircle, 
  ExternalLink, ArrowRight, ShieldCheck, DollarSign, Clock, Sparkles 
} from 'lucide-react';
import { matchingService } from '../services/matchingService';
import { crmService } from '../services/crmService';
import { applicationService } from '../services/applicationService';

export default function GrantMatcher({ onApplicationAdopted }) {
  const [cases] = useState(() => crmService.getCases());
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || '');
  const [filterClassification, setFilterClassification] = useState('All');
  const [adoptingGrantId, setAdoptingGrantId] = useState(null);

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const matches = selectedCase ? matchingService.matchAllGrantsForCase(selectedCase) : [];

  const filteredMatches = matches.filter(m => {
    if (filterClassification === 'All') return true;
    if (filterClassification === 'Eligible') return m.classification.includes('Eligible');
    if (filterClassification === 'InfoRequired') return m.classification.includes('Information Required');
    if (filterClassification === 'Disqualified') return m.classification.includes('Disqualified');
    return true;
  });

  const handleAdopt = async (match) => {
    try {
      const newApp = await applicationService.adoptOpportunity({
        caseId: selectedCase.id,
        clientName: selectedCase.tradingName,
        opportunityId: match.grant.id,
        targetFundingAmount: match.grant.minFundingAmount
      });
      alert(`Success! Created application ${newApp.applicationNumber} targeting ${match.grant.title}.`);
      if (onApplicationAdopted) onApplicationAdopted(newApp);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-amber-600 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Explainable Rule-Based Grant Matching Engine</span>
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Evaluate Eligibility for {selectedCase?.tradingName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-references verified sector, applicant entity structure, operational region, and readiness thresholds against funder rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Select Client Case:
            </label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.tradingName} ({c.sector} • {c.applicantType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Filter Fit:
            </label>
            <select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium"
            >
              <option value="All">All Classifications</option>
              <option value="Eligible">Eligible Only</option>
              <option value="InfoRequired">Information Required</option>
              <option value="Disqualified">Disqualified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Match Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMatches.map(match => {
          const grant = match.grant;

          return (
            <div 
              key={grant.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
            >
              <div className="space-y-3">
                {/* Header & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {grant.fundingOrganization}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {grant.title}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${match.badgeClass}`}>
                    {match.classification}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Funding Window</span>
                    <strong className="text-slate-900">GH₵ {grant.minFundingAmount.toLocaleString()} – {grant.maxFundingAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Deadline</span>
                    <strong className="text-slate-900">{grant.closingDate || 'Rolling'}</strong>
                  </div>
                </div>

                {/* Explainable Evaluation Rules */}
                <div className="space-y-2 text-xs pt-1">
                  {/* Satisfied Criteria */}
                  {match.satisfiedCriteria.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">
                        Criteria Satisfied ({match.satisfiedCriteria.length})
                      </span>
                      {match.satisfiedCriteria.map((c, i) => (
                        <div key={i} className="flex items-start space-x-1.5 text-[11px] text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Missing Info */}
                  {match.missingInformation.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">
                        Required Actions & Evidence Gaps ({match.missingInformation.length})
                      </span>
                      {match.missingInformation.map((m, i) => (
                        <div key={i} className="flex items-start space-x-1.5 text-[11px] text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Disqualifying Reasons */}
                  {match.disqualifyingReasons.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold uppercase text-rose-700 tracking-wider">
                        Disqualifying Conditions ({match.disqualifyingReasons.length})
                      </span>
                      {match.disqualifyingReasons.map((d, i) => (
                        <div key={i} className="flex items-start space-x-1.5 text-[11px] text-rose-800">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommended Next Action */}
                <div className="bg-slate-100 p-2.5 rounded-lg text-[11px] text-slate-700">
                  <strong>Recommended Action:</strong> {match.recommendedAction}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={grant.officialSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 font-bold text-amber-600 hover:text-amber-700"
                >
                  <span>Official Funder Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {match.isAdoptable && (
                  <button
                    onClick={() => handleAdopt(match)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition flex items-center space-x-1 shadow-sm"
                  >
                    <span>Adopt for Application Prep</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
