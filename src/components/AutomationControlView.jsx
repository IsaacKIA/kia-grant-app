import React, { useState } from 'react';
import { 
  Zap, Clock, AlertTriangle, ShieldAlert, CheckCircle2, 
  Play, RefreshCw, Calendar, ArrowRight, ShieldCheck, FileText 
} from 'lucide-react';
import { automationService, AUTOMATION_POLICIES } from '../services/automationService';

export default function AutomationControlView({ onNavigateCase }) {
  const [logs, setLogs] = useState(() => automationService.getLogs());
  const [isRunning, setIsRunning] = useState(false);
  const [lastAuditResult, setLastAuditResult] = useState(null);
  const [selectedLogForDetails, setSelectedLogForDetails] = useState(null);

  const handleRunAudit = async () => {
    setIsRunning(true);
    try {
      const result = await automationService.runOperationalAudit();
      setLastAuditResult(result);
      setLogs(automationService.getLogs());
    } catch (err) {
      alert(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-600 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Autonomous Operational Supervision</span>
          </span>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Background Automation & Escalation Radar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous background surveillance monitoring case inactivity (over 7d warning, over 14d CEO escalation), funder submission deadlines, and document chase workflows.
          </p>
        </div>

        <div>
          <button
            onClick={handleRunAudit}
            disabled={isRunning}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/10 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running System Audit...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Scheduled Audit Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Audit Trigger Results (if run) */}
      {lastAuditResult && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-sm text-white">Live Audit Execution Summary</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{new Date(lastAuditResult.runAt).toLocaleTimeString()} GMT</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Cases Scanned</span>
              <span className="text-lg font-black text-white mt-0.5 block">{lastAuditResult.casesScanned}</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Applications Scanned</span>
              <span className="text-lg font-black text-white mt-0.5 block">{lastAuditResult.applicationsScanned}</span>
            </div>
            <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-800/60">
              <span className="text-rose-400 block text-[10px] uppercase font-bold">14-Day CEO Escalations</span>
              <span className="text-lg font-black text-rose-300 mt-0.5 block">
                {lastAuditResult.inactivityCeoEscalations.length}
              </span>
            </div>
            <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-800/60">
              <span className="text-amber-400 block text-[10px] uppercase font-bold">Deadline Alerts</span>
              <span className="text-lg font-black text-amber-300 mt-0.5 block">
                {lastAuditResult.deadlineAlerts.length}
              </span>
            </div>
          </div>

          {/* Actionable Alerts Found */}
          {lastAuditResult.inactivityCeoEscalations.length > 0 && (
            <div className="bg-rose-900/30 border border-rose-700/50 rounded-xl p-3 text-xs space-y-1">
              <span className="font-bold text-rose-300 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Executive Escalation Triggered for Dormant Cases:</span>
              </span>
              <ul className="list-disc list-inside text-rose-200 text-[11px] space-y-0.5 mt-1">
                {lastAuditResult.inactivityCeoEscalations.map((esc, i) => (
                  <li key={i}>
                    <strong>{esc.clientName}</strong>: Inactive for {esc.daysInactive} days. High-priority intervention task dispatched to Team Leader & CEO.
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lastAuditResult.deadlineAlerts.length > 0 && (
            <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-3 text-xs space-y-1">
              <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Approaching Submission Deadlines:</span>
              </span>
              <ul className="list-disc list-inside text-amber-200 text-[11px] space-y-0.5 mt-1">
                {lastAuditResult.deadlineAlerts.map((d, i) => (
                  <li key={i}>
                    <strong>{d.clientName}</strong> targeting <em>{d.grantTitle}</em>: {d.daysUntilDeadline} days remaining (Closes {d.closingDate}).
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Automated Policies Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-black text-slate-900 text-base mb-1">
          Active Scheduled Operational Policies
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Non-negotiable rules enforcing supervisory accountability, prompt client follow-up, and deadline compliance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AUTOMATION_POLICIES.map((pol) => (
            <div key={pol.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    {pol.frequency}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs mt-2">{pol.name}</h4>
                <p className="text-[11px] text-slate-600 mt-1">{pol.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-semibold text-slate-800">
                ⚡ Action: <span className="font-normal text-slate-600">{pol.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Audit Execution Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-sm">Background Automation Audit History</span>
          <span className="text-xs text-slate-400 font-mono">{logs.length} logged events</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No manual or automated scans logged yet. Click "Run Scheduled Audit Now" above to initiate the first scan.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-500 text-[11px]">
                      {new Date(log.runAt).toLocaleDateString()} {new Date(log.runAt).toLocaleTimeString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200">
                      SUCCESSFUL SCAN
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium mt-1">{log.summary}</p>
                </div>

                <button
                  onClick={() => setSelectedLogForDetails(log)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition"
                >
                  View Trace
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-black text-slate-900 text-base">Automation Execution Trace</h3>
              <button onClick={() => setSelectedLogForDetails(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><strong>Scan Timestamp:</strong> {selectedLogForDetails.runAt}</div>
                <div><strong>Log ID:</strong> <span className="font-mono">{selectedLogForDetails.id}</span></div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Execution Findings:</span>
                <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-[11px] font-mono overflow-x-auto">
                  {JSON.stringify(selectedLogForDetails.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
