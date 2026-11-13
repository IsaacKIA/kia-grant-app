import React, { useState } from 'react';
import {
  ArrowRight, ShieldCheck, FileText, Target, CheckCircle2, DollarSign, Link2, Lock
} from 'lucide-react';

export default function LandingPage({ onGoToLogin, onOpenClientToken }) {
  const [tokenInput, setTokenInput] = useState('');

  const handleOpenToken = (e) => {
    e.preventDefault();
    const cleaned = tokenInput.trim();
    if (!cleaned) return;
    // Support pasting either a full URL (?token=...) or just the token string
    if (cleaned.includes('token=')) {
      const match = cleaned.split('token=')[1]?.split('&')[0];
      if (match) {
        onOpenClientToken(match);
        return;
      }
    }
    onOpenClientToken(cleaned);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20">
              KIA
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-base text-white block leading-tight">
                KIA-START UP CONSULT
              </span>
              <span className="text-[11px] text-slate-400">Accra, Ghana • Grant Advisory Practice</span>
            </div>
          </div>

          <button
            onClick={onGoToLogin}
            className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Staff Sign In</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>KIA Grant Management System 2.0</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Simple, organized grant management for our entire team.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Track every client from onboarding to grant award. Collect documents safely, check grant eligibility, review proposals before submission, and confirm fee payments—all in one place.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onGoToLogin}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition"
              >
                <span>Go to Staff Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Clear Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                  <FileText className="w-4 h-4" />
                  <span>1. Clear Ownership</span>
                </div>
                <p className="text-xs text-slate-400">
                  Every client file has a named officer, next step, and due date.
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                  <Target className="w-4 h-4" />
                  <span>2. Quality Checks</span>
                </div>
                <p className="text-xs text-slate-400">
                  Documents and grant applications are reviewed before submission.
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                  <DollarSign className="w-4 h-4" />
                  <span>3. Verified Fees</span>
                </div>
                <p className="text-xs text-slate-400">
                  All Mobile Money and bank payments are confirmed by Finance.
                </p>
              </div>
            </div>
          </div>

          {/* Right Card: Client Upload Link Access */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>For Clients</span>
              </div>
              <h2 className="text-xl font-black text-white">
                Upload Your Supporting Documents
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Clients do not need a staff account or password. If your KIA Grant Officer sent you a secure upload link or code, paste it below to upload your files.
              </p>

              <form onSubmit={handleOpenToken} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">
                    Paste Upload Link or Code
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="e.g. tok_live_..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Open Client Upload Page
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        © 2026 KIA-START UP CONSULT LTD • Accra, Ghana • Internal Operations & Client Portal
      </footer>
    </div>
  );
}

