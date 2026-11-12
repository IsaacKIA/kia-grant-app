import React, { useState } from 'react';
import { Printer, Compass, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PILLARS } from '../data/criteria';
import { readinessService } from '../services/readinessService';
import { authService } from '../services/authService';

export default function PrintableReport({ clients, selectedClient, onBack }) {
  const [activeClientId, setActiveClientId] = useState(selectedClient?.id || clients[0]?.id || '');
  const client = clients.find(c => c.id === activeClientId) || clients[0];
  
  // Calculate readiness via service
  const readiness = readinessService.calculateScore(client?.scores || {});
  const currentUser = authService.getCurrentUser();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header (Hidden during Print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-2 rounded-lg transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Select Client for Report:
            </label>
            <select
              value={activeClientId}
              onChange={(e) => setActiveClientId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.businessName} — {c.clientName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* The Printable Document (A4 Styling) */}
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-lg max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none text-slate-800">
        {/* Letterhead */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-bold shadow">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                KIA-START UP CONSULT
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Accra, Ghana • Grant Advisory & Business Readiness Practice
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 block">
              Official Diagnostic Audit
            </span>
            <span className="text-xs text-slate-500">
              Audit Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Client Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">Business Name</span>
            <strong className="text-slate-900 text-sm">{client?.businessName}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Founder / Client</span>
            <strong className="text-slate-900 text-sm">{client?.clientName}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Sector</span>
            <strong className="text-slate-900 text-sm">{client?.sector}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Evaluating Assessor</span>
            <strong className="text-slate-900 text-sm">{currentUser.fullName}</strong>
          </div>
        </div>

        {/* Overall Score Banner */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
              Grant Readiness Index (0–100 Scale)
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-4xl font-black text-white">{readiness.totalScore}</span>
              <span className="text-slate-400 text-sm font-semibold">/ 100 Points</span>
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${readiness.tier.badgeClass}`}>
                {readiness.tier.label}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              {readiness.tier.recommendation}
            </p>
          </div>

          <div className="text-right sm:border-l border-slate-800 sm:pl-6 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Assessment Pillar Score</span>
            <span className="text-2xl font-bold text-amber-400">10 Pillars</span>
            <span className="text-[10px] text-slate-400 block">20 Evaluated Criteria</span>
          </div>
        </div>

        {/* 10 Pillars Score Summary Table */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase text-slate-900 tracking-wider mb-3">
            1. Diagnostic Pillar Performance Breakdown
          </h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Assessment Area</th>
                  <th className="py-2.5 px-4 font-bold text-center">Score</th>
                  <th className="py-2.5 px-4 font-bold text-center">Max Pts</th>
                  <th className="py-2.5 px-4 font-bold">Status Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PILLARS.map(p => {
                  let pScore = 0;
                  p.subCriteria.forEach(sub => {
                    pScore += (client?.scores?.[sub.id] || 0);
                  });
                  const ratio = pScore / p.maxPoints;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-800">{p.name}</td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-900">{pScore}</td>
                      <td className="py-2.5 px-4 text-center text-slate-400">{p.maxPoints}</td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          ratio >= 0.8 ? 'bg-emerald-50 text-emerald-700' :
                          ratio >= 0.6 ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {ratio >= 0.8 ? 'High Strength' : ratio >= 0.6 ? 'Moderate' : 'Evidence Gap'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gap Analysis & Action Roadmap */}
        <div className="mb-8 page-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase text-slate-900 tracking-wider mb-3">
            2. Prioritized Action Roadmap & Remediation Steps
          </h2>
          {readiness.gaps.length === 0 ? (
            <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">
              No critical evidence gaps detected. Client meets or exceeds institutional donor readiness thresholds across all metrics.
            </p>
          ) : (
            <div className="space-y-2.5">
              {readiness.gaps.map((gap, idx) => (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-4 ${
                    gap.severity === 'high' 
                      ? 'bg-rose-50/50 border-rose-200 text-rose-900' 
                      : 'bg-amber-50/50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <strong className="font-bold">{gap.pillar}</strong>
                      <span className="text-[10px] font-semibold text-slate-500">• {gap.criterionTitle}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        gap.severity === 'high' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                      }`}>
                        Score: {gap.score}/5
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      <strong>Remediation:</strong> {gap.fixAction}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Official Assessor Sign-Off Block */}
        <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600 page-break-inside-avoid">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Grant Advisor</span>
              <strong className="text-slate-900 text-sm block">{currentUser.fullName}</strong>
              <span className="text-slate-500">{currentUser.roleLabel} • KIA-START UP CONSULT</span>
            </div>
            <div className="h-12 border-b border-dashed border-slate-300 flex items-end pb-1">
              <span className="text-[10px] text-slate-400 italic">Signature: Verified electronically under Act 843</span>
            </div>
          </div>

          <div className="space-y-4 text-right">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Advisory Practice Validation</span>
              <strong className="text-slate-900 text-sm block">Accra Advisory Center</strong>
              <span className="text-slate-500">Official Stamp: KIA-START UP CONSULT</span>
            </div>
            <div className="h-12 border-b border-dashed border-slate-300 flex items-end justify-end pb-1">
              <span className="text-[10px] text-slate-400 italic">Report Reference: KIA-DIAG-{client?.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
