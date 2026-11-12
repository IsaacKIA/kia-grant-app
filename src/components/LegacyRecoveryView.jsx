import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, UserCheck, 
  Search, Filter, ArrowRight, FileText, DollarSign, Database 
} from 'lucide-react';
import { legacyRecoveryService } from '../services/legacyRecoveryService';
import { STAFF_USERS } from '../services/authService';

export default function LegacyRecoveryView({ onReconciledCase }) {
  const [stagedClients, setStagedClients] = useState(() => legacyRecoveryService.getStagedLegacyClients());
  const [selectedClient, setSelectedClient] = useState(null);
  const [search, setSearch] = useState('');
  
  // Reconcile modal form
  const [officerId, setOfficerId] = useState(STAFF_USERS[2]?.id || 'staff-03');
  const [feeVerified, setFeeVerified] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [reconciliationNotes, setReconciliationNotes] = useState('');

  const officers = STAFF_USERS.filter(s => s.role === 'application_officer' || s.role === 'team_leader');

  const filtered = stagedClients.filter(c => 
    c.businessName.toLowerCase().includes(search.toLowerCase()) ||
    c.founderName.toLowerCase().includes(search.toLowerCase()) ||
    c.legacyId.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenReconcile = (client) => {
    setSelectedClient(client);
    setFeeVerified(client.claimedFeePaid);
    setTransactionRef(client.claimedFeePaid ? 'LEGACY-MIGRATION-VERIFIED' : '');
    setReconciliationNotes('');
  };

  const handleExecuteReconcile = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      await legacyRecoveryService.reconcileAndActivate(selectedClient.legacyId, {
        assignedOfficerId: officerId,
        feeVerified,
        transactionRef,
        notes: reconciliationNotes
      });

      setStagedClients(legacyRecoveryService.getStagedLegacyClients());
      setSelectedClient(null);
      alert(`Client ${selectedClient.businessName} reconciled and marked ready for live activation!`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 font-extrabold uppercase text-xs">
            <Database className="w-4 h-4" />
            <span>Legacy Client Recovery & Data Reconciliation Desk</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Quarantine Staging Workbench ({stagedClients.length} Seed Records)
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            In compliance with Section 11 of the engineering mandate, all 14 baseline clients are quarantined as unverified candidates. No client can be treated as active until payment, ownership, and supporting evidence are reviewed.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-white px-3.5 py-2 rounded-xl border border-amber-300 font-bold text-slate-900 shadow-xs">
            <span>Quarantined: </span>
            <strong className="text-amber-600">{stagedClients.filter(c => c.quarantineStatus === 'quarantined').length}</strong>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-xl border border-emerald-300 font-bold text-slate-900 shadow-xs">
            <span>Activated: </span>
            <strong className="text-emerald-600">{stagedClients.filter(c => c.quarantineStatus === 'activated').length}</strong>
          </div>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-xs">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search legacy candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Legacy ID & Business</th>
                <th className="py-3 px-4 font-bold">Founder / Sector</th>
                <th className="py-3 px-4 font-bold">Legacy Stage</th>
                <th className="py-3 px-4 font-bold">Claimed Fee (GH₵ 200)</th>
                <th className="py-3 px-4 font-bold">Identified Audit Flags</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr key={item.legacyId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] text-slate-400 font-bold block">{item.legacyId}</span>
                    <strong className="text-slate-900 text-sm">{item.businessName}</strong>
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="text-slate-800 block">{item.founderName}</strong>
                    <span className="text-[11px] text-slate-500">{item.sector}</span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {item.legacyStage}
                  </td>

                  <td className="py-3.5 px-4">
                    {item.claimedFeePaid ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        Claimed Paid (Unverified)
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        Unpaid
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <ul className="space-y-0.5">
                      {item.unverifiedItems.map((flag, idx) => (
                        <li key={idx} className="text-[11px] text-amber-800 flex items-start space-x-1">
                          <span className="text-amber-500">•</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      item.quarantineStatus === 'activated'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {item.quarantineStatus.replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenReconcile(item)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs"
                    >
                      {item.quarantineStatus === 'activated' ? 'Re-inspect' : 'Audit & Reconcile'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconciliation Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Audit & Reconcile Legacy Candidate</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedClient.legacyId} • {selectedClient.businessName}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleExecuteReconcile} className="p-6 space-y-4 text-xs">
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold block mb-1">Audit Policy Verification:</span>
                <p className="text-[11px]">
                  Do not confirm this record until you have identified supporting evidence for the client's business details, verified their GH₵200 payment, and assigned a named officer.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Assign Responsible Application Officer *
                </label>
                <select
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
                  required
                >
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>{o.fullName} ({o.roleLabel})</option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="flex items-center space-x-2 font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={feeVerified}
                    onChange={(e) => setFeeVerified(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Verify GH₵ 200 Commitment Fee as Legitimate</span>
                </label>

                {feeVerified && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Transaction Reference / Verification Audit Note *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MTN MoMo TxID or Bank Statement Line Item"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 bg-white text-xs font-mono"
                      required={feeVerified}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Reconciliation Notes & Next Action *
                </label>
                <textarea
                  rows="3"
                  value={reconciliationNotes}
                  onChange={(e) => setReconciliationNotes(e.target.value)}
                  placeholder="Document client status, contacted date, and agreed next steps..."
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
                >
                  Confirm & Activate Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
