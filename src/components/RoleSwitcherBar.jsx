import React from 'react';
import { User, Users, LogOut, ShieldCheck, Lock } from 'lucide-react';

export default function RoleSwitcherBar({ currentUser, onOpenTeamManagement, onOpenChangePassword, onSignOut }) {
  if (!currentUser) return null;

  return (
    <div className="bg-slate-950 text-slate-300 border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center space-x-2">
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <ShieldCheck className="w-3 h-3" />
          <span>AUTHENTICATED</span>
        </span>
        <span className="text-slate-400">Signed in as:</span>
        <strong className="text-white font-semibold flex items-center space-x-1.5">
          <User className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentUser.fullName}</span>
        </strong>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
          {currentUser.roleLabel}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onOpenTeamManagement && (
          <button
            type="button"
            onClick={onOpenTeamManagement}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold border transition ${
              currentUser.role === 'ceo'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{currentUser.role === 'ceo' ? 'Add / Manage Team' : 'Team List'}</span>
          </button>
        )}

        {onOpenChangePassword && (
          <button
            type="button"
            onClick={onOpenChangePassword}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-500 transition"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Change Password</span>
          </button>
        )}

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-500 transition"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );
}
