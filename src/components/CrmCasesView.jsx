import React, { useState } from 'react';
import { 
  Search, Filter, Plus, User, ArrowRight, Clock, AlertTriangle, 
  CheckCircle2, DollarSign, Calendar, ChevronRight, UserCheck, ShieldAlert 
} from 'lucide-react';
import { crmService, CASE_STATUS_CONFIG } from '../services/crmService';
import { STAFF_USERS } from '../services/authService';

export default function CrmCasesView({ onSelectCase, onOpenNewClient }) {
  const [cases, setCases] = useState(() => crmService.getCases());
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [officerFilter, setOfficerFilter] = useState('All');
  const [reassignModalCase, setReassignModalCase] = useState(null);
  const [newOfficerId, setNewOfficerId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  const refreshCases = () => {
    setCases(crmService.getCases());
  };

  const sectors = ['All', ...new Set(cases.map(c => c.sector).filter(Boolean))];
  const officers = STAFF_USERS.filter(s => s.role === 'application_officer' || s.role === 'team_leader');

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.legalName.toLowerCase().includes(search.toLowerCase()) ||
      c.tradingName.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.primaryContact.fullName.toLowerCase().includes(search.toLowerCase());
    
    const matchesSector = sectorFilter === 'All' || c.sector === sectorFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesOfficer = officerFilter === 'All' || c.currentOfficerId === officerFilter;

    return matchesSearch && matchesSector && matchesStatus && matchesOfficer;
  });

  const handleExecuteReassignment = async (e) => {
    e.preventDefault();
    if (!reassignModalCase || !newOfficerId) return;

    try {
      await crmService.reassignCase(reassignModalCase.id, newOfficerId, reassignReason);
      setReassignModalCase(null);
      setNewOfficerId('');
      setReassignReason('');
      refreshCases();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Client Relationship Management (CRM)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository of active applicant organizations, case assignments, next actions, and operational status.
          </p>
        </div>

        <button
          onClick={onOpenNewClient}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>New Client Registration</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by case #, organization, founder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sector */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-amber-500"
          >
            {sectors.map(s => <option key={s} value={s}>Sector: {s}</option>)}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-amber-500"
          >
            <option value="All">All Statuses</option>
            {Object.entries(CASE_STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Assigned Officer */}
          <select
            value={officerFilter}
            onChange={(e) => setOfficerFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-amber-500"
          >
            <option value="All">All Officers</option>
            {officers.map(o => (
              <option key={o.id} value={o.id}>{o.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Case # & Organization</th>
                <th className="py-3.5 px-4 font-bold">Sector / Stage</th>
                <th className="py-3.5 px-4 font-bold">Primary Contact</th>
                <th className="py-3.5 px-4 font-bold">Assigned Officer</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Next Action & Due Date</th>
                <th className="py-3.5 px-4 font-bold text-center">Engagement Fee</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No client cases found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map(item => {
                  const officer = STAFF_USERS.find(s => s.id === item.currentOfficerId);
                  const statusCfg = CASE_STATUS_CONFIG[item.status] || CASE_STATUS_CONFIG.intake;

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        item.inactivityFlag ? 'bg-amber-50/30' : ''
                      }`}
                      onClick={() => onSelectCase(item)}
                    >
                      {/* Case Number & Org Name */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[10px] font-bold text-slate-400 block mb-0.5">
                          {item.caseNumber}
                        </span>
                        <strong className="text-slate-900 font-bold block text-sm">
                          {item.tradingName}
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          {item.legalName !== item.tradingName ? item.legalName : item.region}
                        </span>
                      </td>

                      {/* Sector */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {item.sector}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.applicantType} • {item.businessStage}
                        </span>
                      </td>

                      {/* Founder */}
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-900 block font-semibold">
                          {item.primaryContact.fullName}
                        </strong>
                        <span className="text-[11px] text-slate-500 block">
                          {item.primaryContact.phone}
                        </span>
                      </td>

                      {/* Officer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-800">
                            {officer?.fullName || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Next Action & Due Date */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-[11px] font-medium text-slate-800 line-clamp-1">
                          {item.nextActionDescription || 'No next action recorded'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.isOverdue 
                              ? 'bg-rose-100 text-rose-700' 
                              : item.isDueToday
                              ? 'bg-amber-100 text-amber-800'
                              : 'text-slate-500 bg-slate-100'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>Due: {item.nextActionDueDate || 'None'}</span>
                          </span>

                          {item.inactivityFlag && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Inactive &gt;7d</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Engagement Fee */}
                      <td className="py-3.5 px-4 text-center">
                        {item.engagementFee?.isVerified ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>GH₵ 200 Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <DollarSign className="w-3 h-3" />
                            <span>Unverified</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setReassignModalCase(item);
                              setNewOfficerId(item.currentOfficerId);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition"
                            title="Reassign Responsible Officer"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSelectCase(item)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-bold text-xs transition"
                          >
                            Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Officer Reassignment Modal */}
      {reassignModalCase && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Reassign Case Responsibility</h3>
                <p className="text-xs text-slate-400 mt-0.5">{reassignModalCase.caseNumber} • {reassignModalCase.legalName}</p>
              </div>
              <button 
                onClick={() => setReassignModalCase(null)} 
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteReassignment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Assign New Responsible Officer *
                </label>
                <select
                  value={newOfficerId}
                  onChange={(e) => setNewOfficerId(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2.5 bg-white"
                  required
                >
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.fullName} — {o.roleLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Reason for Reassignment *
                </label>
                <textarea
                  rows="3"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Workload rebalancing, specialist sector expertise, officer leave..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignModalCase(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
                >
                  Save Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
