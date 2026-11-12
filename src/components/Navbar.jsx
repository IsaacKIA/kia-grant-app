import React from 'react';
import { 
  Activity, Users, CheckSquare, TrendingUp, Calculator, 
  Target, FileText, Database, UserPlus, Clock, Award, DollarSign, Zap 
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  clientCount, 
  verifiedFees, 
  overdueTasksCount, 
  underReviewDocsCount = 0,
  onOpenNewClient 
}) {
  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <span className="font-black text-sm tracking-tighter">KIA</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-lg text-white">KIA-START UP</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                  CONSULT
                </span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Enterprise Grant Management & Operational Recovery System</p>
            </div>
          </div>

          {/* Quick Metrics Header */}
          <div className="hidden md:flex items-center space-x-4 text-xs">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center space-x-2">
              <span className="text-slate-400">Active Cases:</span>
              <span className="font-bold text-white text-sm">{clientCount}</span>
            </div>

            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center space-x-2">
              <span className="text-slate-400">Verified Fees:</span>
              <span className="font-bold text-emerald-400 text-sm">GH₵ {verifiedFees.toLocaleString()}</span>
            </div>

            {overdueTasksCount > 0 && (
              <div className="bg-rose-950/80 border border-rose-800 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-rose-300 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-bold text-xs">{overdueTasksCount} Overdue Tasks</span>
              </div>
            )}

            <button
              onClick={onOpenNewClient}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all text-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard Client</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 py-2 overflow-x-auto text-xs font-semibold">
          {/* CEO Dashboard */}
          <button
            onClick={() => setActiveTab('ceo_dashboard')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'ceo_dashboard'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Executive Radar</span>
          </button>

          {/* CRM */}
          <button
            onClick={() => setActiveTab('crm_cases')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'crm_cases'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Client CRM ({clientCount})</span>
          </button>

          {/* Documents Hub */}
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'documents'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documents Hub</span>
            {underReviewDocsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-1" />
            )}
          </button>

          {/* Tasks Workbench */}
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks & Accountability</span>
            {overdueTasksCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-1" />
            )}
          </button>

          {/* Applications Pipeline */}
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Applications Pipeline</span>
          </button>

          {/* Grant Catalogue */}
          <button
            onClick={() => setActiveTab('grants')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'grants'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Grant Catalogue</span>
          </button>

          {/* Grant Matcher */}
          <button
            onClick={() => setActiveTab('matcher')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'matcher'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Grant Matcher</span>
          </button>

          {/* Readiness Diagnostic */}
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Readiness Diagnostic</span>
          </button>

          {/* Finance & Fees */}
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'finance'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Finance Desk</span>
          </button>

          {/* Automation Radar */}
          <button
            onClick={() => setActiveTab('automation')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'automation'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Automation Radar</span>
          </button>

          {/* Operational Reports */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Operational Reports</span>
          </button>

          {/* Legacy Recovery */}
          <button
            onClick={() => setActiveTab('legacy_recovery')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'legacy_recovery'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-amber-300 hover:text-amber-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Legacy Recovery</span>
          </button>
        </div>
      </div>
    </header>
  );
}
