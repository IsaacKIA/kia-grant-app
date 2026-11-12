import React, { useState } from 'react';
import { 
  Users, CheckCircle2, Clock, AlertTriangle, ChevronRight, 
  Search, Filter, Plus, ArrowRight, ShieldCheck, DollarSign, Award, Eye
} from 'lucide-react';
import { calculateReadiness } from '../data/criteria';

export const STAGES = [
  { id: 'Stage 1: Onboarding', label: '1. Onboarding & Fee', color: 'border-blue-500/80 bg-blue-50/50' },
  { id: 'Stage 2: Documentation', label: '2. Documentation', color: 'border-amber-500/80 bg-amber-50/50' },
  { id: 'Stage 3: Grant Matching', label: '3. Grant Matching', color: 'border-indigo-500/80 bg-indigo-50/50' },
  { id: 'Stage 4: Application Development', label: '4. Application Writing', color: 'border-purple-500/80 bg-purple-50/50' },
  { id: 'Stage 5: Submission & Tracking', label: '5. Submission & Tracking', color: 'border-pink-500/80 bg-pink-50/50' },
  { id: 'Stage 6: Grant Outcome', label: '6. Outcome & Success Fee', color: 'border-emerald-500/80 bg-emerald-50/50' },
  { id: 'Stage 7: Post-Award Support', label: '7. Post-Award Support', color: 'border-teal-500/80 bg-teal-50/50' },
];

export default function PipelineView({ 
  clients, 
  onSelectClient, 
  onOpenCalculator, 
  onOpenNewClient,
  onUpdateClientStage 
}) {
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'

  const sectors = ['All', ...new Set(clients.map(c => c.sector))];

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.businessName.toLowerCase().includes(search.toLowerCase());
    const matchesSector = selectedSector === 'All' || c.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-1 items-center space-x-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client or business name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {sectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'kanban' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={onOpenNewClient}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Client</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 items-start overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stageClients = filteredClients.filter(c => c.stage === stage.id);
            return (
              <div 
                key={stage.id} 
                className="bg-slate-100/80 rounded-xl p-3 border border-slate-200/80 min-w-[260px] flex flex-col h-full"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                    {stage.label}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {stageClients.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[75vh]">
                  {stageClients.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      No clients here
                    </div>
                  ) : (
                    stageClients.map(client => {
                      const readiness = calculateReadiness(client.scores);
                      const hasRedFlag = Object.values(client.redFlags || {}).some(Boolean);

                      return (
                        <div
                          key={client.id}
                          className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer relative group"
                          onClick={() => onSelectClient(client)}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1.5">
                            <h4 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-amber-600 transition">
                              {client.businessName}
                            </h4>
                            {hasRedFlag && (
                              <span title="Risk Red Flag Active" className="text-rose-500 flex-shrink-0">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mb-2">{client.clientName}</p>

                          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              {client.sector}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${readiness.tier.badgeClass}`}>
                              {readiness.totalScore}/100 • {readiness.tier.label}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <span className={`font-semibold text-[11px] flex items-center space-x-1 ${
                              client.commitmentFeePaid ? 'text-emerald-600' : 'text-amber-600'
                            }`}>
                              <DollarSign className="w-3 h-3 inline" />
                              <span>{client.commitmentFeePaid ? 'GHS 200 Paid' : 'Fee Pending'}</span>
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenCalculator(client);
                              }}
                              className="text-[11px] font-semibold text-slate-600 hover:text-amber-600 underline"
                            >
                              Audit
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Business & Client</th>
                  <th className="px-4 py-3.5">Sector</th>
                  <th className="px-4 py-3.5">Readiness Score</th>
                  <th className="px-4 py-3.5">Current Stage</th>
                  <th className="px-4 py-3.5">GHS 200 Fee</th>
                  <th className="px-4 py-3.5">Red Flags</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map(client => {
                  const readiness = calculateReadiness(client.scores);
                  const hasRedFlag = Object.values(client.redFlags || {}).some(Boolean);

                  return (
                    <tr key={client.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => onSelectClient(client)}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{client.businessName}</div>
                        <div className="text-xs text-slate-500">{client.clientName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                          {client.sector}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-bold border ${readiness.tier.badgeClass}`}>
                          {readiness.totalScore} / 100 — {readiness.tier.label}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={client.stage}
                          onChange={(e) => onUpdateClientStage(client.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded px-2 py-1 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {STAGES.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          client.commitmentFeePaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {client.commitmentFeePaid ? 'GHS 200 Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {hasRedFlag ? (
                          <span className="inline-flex items-center text-xs text-rose-600 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Alert
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Clean</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onOpenCalculator(client)}
                            className="text-xs bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 px-2.5 py-1 rounded font-medium transition"
                          >
                            Audit
                          </button>
                          <button
                            onClick={() => onSelectClient(client)}
                            className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded font-medium transition"
                          >
                            Checklist
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
