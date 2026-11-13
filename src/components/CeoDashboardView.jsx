import React from 'react';
import { 
  TrendingUp, AlertTriangle, Clock, CheckCircle2, DollarSign, 
  Users, ShieldAlert, ArrowRight, Activity, FileText, UserPlus, Zap
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';

export default function CeoDashboardView({ onNavigateTab, onOpenNewClient, onOpenTeamManagement }) {
  const metrics = dashboardService.getCeoMetrics();

  return (
    <div className="space-y-6">
      {/* 30-Second Executive Summary Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 border border-slate-700 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-extrabold uppercase tracking-wider text-xs">
              <Activity className="w-4 h-4" />
              <span>Management Overview</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Today&apos;s Office Overview
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              See active clients, overdue tasks, missing documents, and confirmed payments in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenTeamManagement && (
              <button
                onClick={onOpenTeamManagement}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>Team & Roles</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('legacy_recovery')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
            >
              <span>Old Records ({metrics.quarantinedLegacyCount})</span>
            </button>
            <button
              onClick={onOpenNewClient}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Client</span>
            </button>
          </div>
        </div>
      </div>

      {/* Immediate Attention Radar (Critical Bottlenecks) */}
      {metrics.criticalAttentionItems.length > 0 && (
        <div className="bg-rose-50/80 border-2 border-rose-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
              <h3 className="text-sm font-extrabold text-rose-900 uppercase tracking-wide">
                Needs Attention Now ({metrics.criticalAttentionItems.length} Alerts)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
              Overdue / Urgent
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {metrics.criticalAttentionItems.slice(0, 6).map((item, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl p-3.5 border border-rose-200 shadow-xs flex flex-col justify-between space-y-2 hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                    <span className="text-rose-700 uppercase tracking-tight font-extrabold">
                      {item.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded">
                      Action Required
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => onNavigateTab(item.linkTab)}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-amber-600 hover:text-amber-700 pt-1 border-t border-slate-100"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Cases */}
        <div
          onClick={() => onNavigateTab('crm_cases')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 hover:border-amber-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Cases</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{metrics.activeEngagements}</span>
            <span className="text-xs text-slate-400 font-medium">/ {metrics.totalClients} Total</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Awaiting Docs: <strong className="text-slate-800">{metrics.awaitingDocumentation}</strong></span>
            <span>Ready: <strong className="text-emerald-600">{metrics.readyForMatching}</strong></span>
          </div>
        </div>

        {/* Task Escalations */}
        <div
          onClick={() => onNavigateTab('tasks')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 hover:border-amber-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue Tasks</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-black ${metrics.overdueTasksCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {metrics.overdueTasksCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">({metrics.tasksDueTodayCount} Due Today)</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>TL Level 1: <strong className="text-amber-600">{metrics.level1EscalationsCount}</strong></span>
            <span>CEO Level 2: <strong className="text-rose-600">{metrics.level2CeoEscalationsCount}</strong></span>
          </div>
        </div>

        {/* Verified Fees */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 hover:border-amber-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Fees</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-xs font-bold text-slate-500">GH₵</span>
            <span className="text-3xl font-black text-emerald-600">{metrics.verifiedFeesAmount.toLocaleString()}</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Outstanding:</span>
            <strong className="text-amber-600">GH₵ {metrics.outstandingFeesAmount.toLocaleString()}</strong>
          </div>
        </div>

        {/* Inactive Cases */}
        <div
          onClick={() => onNavigateTab('automation')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2 hover:border-amber-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Inactive Cases (&gt;7d)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-black ${metrics.inactiveCasesCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {metrics.inactiveCasesCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">Stalled cases</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            {metrics.inactiveCasesCount === 0 
              ? '✅ All active cases have fresh activity logs.' 
              : '⚠️ Management follow-up recommended.'}
          </div>
        </div>
      </div>

      {/* Staff Workload & Accountability Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Team Workload & Accountability Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live officer case load distribution, pending assignments, and overdue task count.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('tasks')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Officer / Member</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold text-center">Active Cases</th>
                <th className="py-3 px-4 font-bold text-center">Pending Tasks</th>
                <th className="py-3 px-4 font-bold text-center">Overdue Tasks</th>
                <th className="py-3 px-4 font-bold text-center">Urgent Escalations</th>
                <th className="py-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.staffWorkload.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs">
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span>{staff.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {staff.role}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    {staff.activeCasesCount}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    {staff.pendingTasksCount}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      staff.overdueTasksCount > 0 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {staff.overdueTasksCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      staff.urgentEscalationsCount > 0 
                        ? 'bg-rose-600 text-white animate-pulse' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {staff.urgentEscalationsCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigateTab('tasks')}
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline decoration-slate-300"
                    >
                      Inspect Tasks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

