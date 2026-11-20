import React, { useState } from 'react';
import { 
  Target, Search, Filter, ExternalLink, ShieldCheck, Users,
  Calendar, DollarSign, Award, Clock, Plus, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { grantService } from '../services/grantService';
import { authService } from '../services/authService';
import { crmService } from '../services/crmService';
import { matchingService } from '../services/matchingService';
import { ECONOMIC_SECTORS } from '../data/sectors';

export default function GrantCatalogueView({ onAdoptOpportunity }) {
  const [grants, setGrants] = useState(() => grantService.getGrants());
  const [activeCases] = useState(() => crmService.getCases());
  const [expandedRecGrantId, setExpandedRecGrantId] = useState(null);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Verification modal state
  const [verifyingGrant, setVerifyingGrant] = useState(null);
  const [verifiedUrl, setVerifiedUrl] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');

  // New grant modal state
  const [isCreatingGrant, setIsCreatingGrant] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDonor, setNewDonor] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSector, setNewSector] = useState('Agribusiness');
  const [newMinAmount, setNewMinAmount] = useState('50000');
  const [newMaxAmount, setNewMaxAmount] = useState('300000');
  const [newDeadline, setNewDeadline] = useState('2026-12-31');
  const [newMinScore, setNewMinScore] = useState('60');
  const [newDesc, setNewDesc] = useState('');

  const currentUser = authService.getCurrentUser();
  const isTeamLeadOrCeo = currentUser.role === 'team_leader' || currentUser.role === 'ceo' || currentUser.role === 'admin';

  const refreshGrants = () => {
    setGrants(grantService.getGrants());
  };

  const sectors = ['All', ...ECONOMIC_SECTORS.map(s => s.value)];

  const statusOrder = {
    verified_open: 0,
    pending_verification: 1,
    upcoming: 2,
    closed: 3,
    expired: 4
  };

  const filteredGrants = grants
    .filter(g => {
      const matchesSearch = 
        g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.fundingOrganization.toLowerCase().includes(search.toLowerCase()) ||
        g.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesSector = sectorFilter === 'All' || g.targetSectors.includes(sectorFilter);
      const matchesStatus = statusFilter === 'All' || g.status === statusFilter;

      return matchesSearch && matchesSector && matchesStatus;
    })
    .sort((a, b) => {
      const orderA = statusOrder[a.status] ?? 5;
      const orderB = statusOrder[b.status] ?? 5;
      if (orderA !== orderB) return orderA - orderB;

      // Within the same status, show earliest closing/opening date first
      const dateA = a.status === 'upcoming' ? (a.openingDate || '9999-12-31') : (a.closingDate || '9999-12-31');
      const dateB = b.status === 'upcoming' ? (b.openingDate || '9999-12-31') : (b.closingDate || '9999-12-31');
      return dateA.localeCompare(dateB);
    });

  const handleExecuteVerification = async (e) => {
    e.preventDefault();
    if (!verifyingGrant) return;
    try {
      await grantService.verifyGrantOpportunity(verifyingGrant.id, {
        officialSourceUrl: verifiedUrl,
        notes: verificationNotes
      });
      setVerifyingGrant(null);
      setVerifiedUrl('');
      setVerificationNotes('');
      refreshGrants();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateGrant = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDonor.trim()) return;

    try {
      await grantService.createGrantOpportunity({
        title: newTitle.trim(),
        fundingOrganization: newDonor.trim(),
        officialSourceUrl: newUrl.trim() || 'https://official-funder-source.org',
        targetSectors: [newSector],
        eligibleApplicantTypes: ['SME', 'Startup'],
        eligibleBusinessStages: ['Early-stage Growth'],
        eligibleRegions: ['All 16 Regions of Ghana'],
        minFundingAmount: Number(newMinAmount),
        maxFundingAmount: Number(newMaxAmount),
        closingDate: newDeadline,
        minReadinessScore: Number(newMinScore),
        description: newDesc.trim() || 'Verified grant funding opportunity for Ghanaian enterprises.',
        requiresRegistration: true,
        requiredLegalTypes: ['Limited Liability', 'Sole Proprietorship'],
        requiresBankStatements: true,
        donorFocus: 'Economic development, youth employment, and sustainable enterprise growth.'
      });

      setIsCreatingGrant(false);
      setNewTitle('');
      setNewDonor('');
      setNewUrl('');
      setNewDesc('');
      refreshGrants();
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
            Verified Grant Opportunity Catalogue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-vetted local and international funding opportunities with official source URLs, verified eligibility criteria, and deadlines.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingGrant(true)}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add Opportunity Draft</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search grants by title, funding donor, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium"
          >
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="verified_open">Verified Open</option>
            <option value="upcoming">Upcoming</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="closed">Closed / Archived</option>
          </select>
        </div>
      </div>

      {/* Grants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGrants.map(grant => {
          const isOpen = grant.status === 'verified_open';
          const isUpcoming = grant.status === 'upcoming';
          const isPending = grant.status === 'pending_verification';

          return (
            <div 
              key={grant.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
            >
              <div className="space-y-3">
                {/* Status & Donor Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {grant.fundingOrganization}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {grant.title}
                    </h3>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                    isOpen ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    isUpcoming ? 'bg-purple-50 text-purple-800 border-purple-300' :
                    isPending ? 'bg-amber-50 text-amber-800 border-amber-300' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {grant.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {grant.isAnnualRecurring && (
                  <div className="inline-flex items-center space-x-1.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Calendar className="w-3 h-3" />
                    <span>Annual Cycle &bull; Opens {grant.openingDate}</span>
                  </div>
                )}

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {grant.description}
                </p>

                {/* Key Metrics Pill Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Funding Amount</span>
                    <strong className="text-slate-900 font-bold">
                      GH₵ {grant.minFundingAmount.toLocaleString()} – {grant.maxFundingAmount.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Closing Deadline</span>
                    <strong className="text-slate-900 font-bold">
                      {grant.closingDate || 'Ongoing Batches'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Min Readiness Score</span>
                    <strong className="text-amber-600 font-bold">
                      {grant.minReadinessScore} / 100
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Registration Rule</span>
                    <strong className="text-slate-900">
                      {grant.requiresRegistration ? 'ORC Required' : 'Open / Unregistered'}
                    </strong>
                  </div>
                </div>

                {/* Sectors */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {grant.targetSectors.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Recommended Qualifying Clients */}
                {(() => {
                  const recommendations = matchingService.getRecommendedClientsForGrant(grant, activeCases);
                  const isExpanded = expandedRecGrantId === grant.id;
                  return (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setExpandedRecGrantId(isExpanded ? null : grant.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition ${
                          recommendations.length > 0
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {recommendations.length > 0
                              ? `${recommendations.length} Qualifying Client${recommendations.length > 1 ? 's' : ''} Recommended`
                              : 'No Qualifying Clients Yet'}
                          </span>
                        </span>
                        <span className="text-[11px] underline">{isExpanded ? 'Hide' : 'View'}</span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-1.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs">
                          {recommendations.length === 0 ? (
                            <p className="text-[11px] text-slate-500 px-1 py-1">
                              No active registered clients currently match this grant&apos;s sector, entity type, and region.
                            </p>
                          ) : (
                            recommendations.map(({ clientCase, evaluation }) => (
                              <div key={clientCase.id} className="bg-white rounded-lg p-2.5 border border-slate-200 flex items-center justify-between gap-2">
                                <div>
                                  <div className="font-bold text-slate-900">{clientCase.legalName}</div>
                                  <div className="text-[10px] text-slate-500">
                                    {clientCase.sector} &bull; {clientCase.applicantType} &bull; Score: {evaluation.clientScore}/100
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${evaluation.badgeClass}`}>
                                  {evaluation.missingInformation.length === 0 ? 'Strong Match' : `${evaluation.missingInformation.length} Gap(s)`}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={grant.officialSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 font-bold text-amber-600 hover:text-amber-700"
                >
                  <span>Official Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center space-x-2">
                  {!isOpen && isTeamLeadOrCeo && (
                    <button
                      onClick={() => {
                        setVerifyingGrant(grant);
                        setVerifiedUrl(grant.officialSourceUrl);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                    >
                      Verify as Open
                    </button>
                  )}

                  {onAdoptOpportunity && (
                    <button
                      onClick={() => onAdoptOpportunity(grant)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                    >
                      Match with Client
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verify Grant Modal */}
      {verifyingGrant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Official Source Verification</h3>
                <p className="text-xs text-slate-400 mt-0.5">{verifyingGrant.title}</p>
              </div>
              <button onClick={() => setVerifyingGrant(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleExecuteVerification} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Official Funder Website / Guidelines URL *
                </label>
                <input
                  type="url"
                  value={verifiedUrl}
                  onChange={(e) => setVerifiedUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Verification Notes / Window Details
                </label>
                <textarea
                  rows="3"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="e.g. Confirmed active batch call published on official portal on 12 Feb 2026..."
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyingGrant(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                >
                  Confirm Verification & Mark Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Grant Modal */}
      {isCreatingGrant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Grant Opportunity Draft</h3>
              <button onClick={() => setIsCreatingGrant(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateGrant} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Grant Opportunity Title *</label>
                <input
                  type="text"
                  placeholder="e.g. USAID West Africa Trade Hub Challenge Fund"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Funding Organization *</label>
                  <input
                    type="text"
                    placeholder="e.g. USAID / Palladium"
                    value={newDonor}
                    onChange={(e) => setNewDonor(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Primary Sector *</label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
                  >
                    {ECONOMIC_SECTORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Official Source URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Min Funding (GHS)</label>
                  <input
                    type="number"
                    value={newMinAmount}
                    onChange={(e) => setNewMinAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Max Funding (GHS)</label>
                  <input
                    type="number"
                    value={newMaxAmount}
                    onChange={(e) => setNewMaxAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Min Score</label>
                  <input
                    type="number"
                    value={newMinScore}
                    onChange={(e) => setNewMinScore(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Description & Eligibility Criteria</label>
                <textarea
                  rows="3"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detail target applicant profile, mandatory documents, and guidelines..."
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingGrant(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
                >
                  Save Opportunity Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

