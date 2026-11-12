import React, { useState } from 'react';
import { Target, CheckCircle2, AlertCircle, Sparkles, Filter, ExternalLink, BookmarkPlus, ArrowRight } from 'lucide-react';
import { GRANTS_CATALOG } from '../data/grantsData';
import { calculateReadiness } from '../data/criteria';

export default function GrantMatcher({ clients, onUpdatePriorityGrants }) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [sectorFilter, setSectorFilter] = useState('All');

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const readiness = calculateReadiness(selectedClient?.scores || {});

  const sectors = ['All', 'Agribusiness', 'Technology & Services', 'Beauty & Personal Care', 'NGO / Social Enterprise'];

  const filteredGrants = GRANTS_CATALOG.filter(grant => {
    if (sectorFilter === 'All') return true;
    return grant.targetSectors.includes(sectorFilter);
  });

  const togglePriorityGrant = (grantName) => {
    if (!selectedClient) return;
    const current = selectedClient.priorityGrants || [];
    let updated;
    if (current.includes(grantName)) {
      updated = current.filter(g => g !== grantName);
    } else {
      updated = [...current, grantName];
    }
    onUpdatePriorityGrants(selectedClient.id, updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-amber-600">
            Intelligent Grant Matchmaking
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Match Grants for {selectedClient?.businessName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Matching algorithms cross-reference sector eligibility and readiness thresholds ({readiness.totalScore}/100).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Select Client:
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.businessName} ({c.sector})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Filter Sector:
            </label>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
            >
              {sectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grant Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGrants.map(grant => {
          const isSectorMatch = grant.targetSectors.includes(selectedClient?.sector);
          const isScoreEligible = readiness.totalScore >= grant.minReadinessScore;
          const isSelected = (selectedClient?.priorityGrants || []).includes(grant.name);

          let fitStatus = {
            label: 'High Fit — Grant-Ready',
            class: 'bg-emerald-50 text-emerald-700 border-emerald-300',
            eligible: true
          };

          if (!isSectorMatch) {
            fitStatus = {
              label: 'Sector Mismatch',
              class: 'bg-slate-100 text-slate-500 border-slate-200',
              eligible: false
            };
          } else if (!isScoreEligible) {
            fitStatus = {
              label: `Score Gap (Requires ${grant.minReadinessScore} pts, Client has ${readiness.totalScore})`,
              class: 'bg-amber-50 text-amber-700 border-amber-300',
              eligible: false
            };
          }

          return (
            <div
              key={grant.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm transition hover:shadow-md flex flex-col justify-between ${
                isSelected ? 'ring-2 ring-amber-500 border-amber-500' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                      {grant.donor}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {grant.name}
                    </h3>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border flex-shrink-0 ${fitStatus.class}`}>
                    {fitStatus.label}
                  </span>
                </div>

                {/* Amount & Type Pills */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 font-bold text-slate-800">
                    💰 {grant.amountRange}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 font-semibold text-slate-600">
                    ⏱ Deadline: {grant.deadline}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 font-semibold text-slate-600">
                    📁 {grant.fundingType}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong className="text-slate-800">Donor Priority:</strong> {grant.donorFocus}
                </p>

                {/* Eligibility Criteria */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Core Eligibility Requirements:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {grant.eligibility.map((req, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Min. Score: <strong className="text-slate-800">{grant.minReadinessScore} / 100</strong>
                </span>

                <button
                  onClick={() => togglePriorityGrant(grant.name)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition ${
                    isSelected
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>{isSelected ? '✓ In Client Priority List' : '+ Add to Priority Grants'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
