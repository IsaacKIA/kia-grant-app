import React from 'react';
import { Shield, User, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react';
import { STAFF_USERS } from '../services/authService';

export default function RoleSwitcherBar({ currentUser, onSwitchUser }) {
  return (
    <div className="bg-slate-950 text-slate-300 border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center space-x-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
          SIMULATED IAM SESSION
        </span>
        <span className="text-slate-400">Active User:</span>
        <strong className="text-white font-semibold flex items-center space-x-1.5">
          <User className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentUser.fullName}</span>
        </strong>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
          {currentUser.roleLabel}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-slate-400 text-[11px] font-medium flex items-center space-x-1">
          <KeyRound className="w-3 h-3 text-slate-400" />
          <span>Switch Operational Role:</span>
        </label>
        <select
          value={currentUser.id}
          onChange={(e) => onSwitchUser(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          {STAFF_USERS.map(staff => (
            <option key={staff.id} value={staff.id}>
              {staff.fullName} — {staff.roleLabel}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
