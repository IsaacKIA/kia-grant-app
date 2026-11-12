import React, { useState } from 'react';
import { Printer, Download, Compass, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { PILLARS, READINESS_TIERS, calculateReadiness } from '../data/criteria';

export default function PrintableReport({ clients, selectedClient, onBack }) {
  const [activeClientId, setActiveClientId] = useState(selectedClient?.id || clients[0]?.id || '');
  const client = clients.find(c => c.id === activeClientId) || clients[0];
  const readiness = calculateReadiness(client?.scores || {});

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
          <Printer className="w-4 h-4" />
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
              Official Diagnostic Report
            </span>
            <span className="text-xs text-slate-500">
              Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
            <span className="text-slate-500 font-semibold block">Consultant</span>
            <strong className="text-slate-900 text-sm">{client?.assignedConsultant}</strong>
          </div>
        </div>

        {/* Executive Score Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Grant Readiness Scorecard
            </span>
            <h2 className="text-2xl font-black mt-1">
              {readiness.tier.label}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
              {readiness.tier.recommendation}
            </p>
          </div>

          <div className="flex-shrink-0 text-center bg-white/10 px-6 py-4 rounded-xl border border-white/20">
            <div className="text-4xl font-black text-amber-400">{readiness.totalScore}</div>
            <div className="text-[10px] text-slate-300 uppercase font-semibold">out of 100 points</div>
          </div>
        </div>

        {/* 10-Pillar Breakdown Table */}
        <div className="space-y-3 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Pillar-by-Pillar Evaluation (20 Sub-Criteria)
          </h3>
          <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Pillar</th>
                <th className="px-3 py-2.5 text-center">Score</th>
                <th className="px-3 py-2.5 text-center">Max</th>
                <th className="px-3 py-2.5 text-center">Achievement</th>
                <th className="px-3 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PILLARS.map(p => {
                const pillarScore = p.subCriteria.reduce((s, sub) => s + (client?.scores?.[sub.id] || 0), 0);
                const pct = Math.round((pillarScore / p.maxPoints) * 100);
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-2 font-medium text-slate-800">{p.name}</td>
                    <td className="px-3 py-2 text-center font-bold">{pillarScore}</td>
                    <td className="px-3 py-2 text-center text-slate-500">{p.maxPoints}</td>
                    <td className="px-3 py-2 text-center font-semibold">{pct}%</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pct >= 80 ? 'bg-emerald-100 text-emerald-800' : pct >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {pct >= 80 ? 'Verified' : pct >= 60 ? 'Moderate' : 'Needs Fix'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Roadmap */}
        <div className="space-y-3 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            High-Priority Remediation Roadmap
          </h3>
          <div className="space-y-2 text-xs">
            {readiness.gaps.slice(0, 5).map((gap, i) => (
              <div key={i} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  {i + 1}
                </span>
                <div>
                  <strong className="text-slate-900">{gap.criterion}:</strong>{' '}
                  <span className="text-slate-600">{gap.fixAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Grants Identified */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mb-8 text-xs">
          <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[11px]">
            Target Grant Windows Identified:
          </h4>
          <div className="flex flex-wrap gap-2">
            {(client?.priorityGrants || []).map((grant, i) => (
              <span key={i} className="px-3 py-1 rounded-md bg-white border border-slate-300 font-bold text-slate-800">
                🎯 {grant}
              </span>
            ))}
          </div>
        </div>

        {/* Signoff */}
        <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
          <div>
            <p className="font-bold text-slate-900">Lead Consultant</p>
            <p className="text-slate-500">Kia-Start Up Consult</p>
          </div>
          <div className="text-right">
            <div className="w-36 border-b border-slate-400 mb-1"></div>
            <p className="text-slate-500 text-[10px]">Authorized Signature & Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
