import React from 'react';
import { Award, Compass, Calculator, Target, FileText, UserPlus, TrendingUp } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, clientCount, avgScore, totalFees, onOpenNewClient }) {
  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Compass className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-lg text-white">KIA-START UP</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">CONSULT</span>
              </div>
              <p className="text-xs text-slate-400">Client Grant Management & Readiness System</p>
            </div>
          </div>

          {/* Quick Metrics Header */}
          <div className="hidden md:flex items-center space-x-6 text-xs">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center space-x-2">
              <span className="text-slate-400">Total Clients:</span>
              <span className="font-bold text-white text-sm">{clientCount}</span>
            </div>
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center space-x-2">
              <span className="text-slate-400">Avg Readiness:</span>
              <span className="font-bold text-emerald-400 text-sm">{avgScore} / 100</span>
            </div>
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center space-x-2">
              <span className="text-slate-400">Commitment Fees:</span>
              <span className="font-bold text-amber-400 text-sm">GHS {totalFees.toLocaleString()}</span>
            </div>
            <button
              onClick={onOpenNewClient}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-all text-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard Client</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 py-2 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'pipeline'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>7-Stage Pipeline CRM</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'calculator'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Readiness Calculator (0–100)</span>
          </button>

          <button
            onClick={() => setActiveTab('matcher')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'matcher'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Grant Matcher</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Diagnostic Reports</span>
          </button>
        </div>
      </div>
    </header>
  );
}
