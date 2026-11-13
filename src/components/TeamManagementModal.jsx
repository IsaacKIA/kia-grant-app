import React, { useState } from 'react';
import {
  Users, UserPlus, ShieldCheck, ShieldAlert, X, CheckCircle2, Mail, Phone, Lock
} from 'lucide-react';
import { authService, STAFF_ROLE_OPTIONS } from '../services/authService';

export default function TeamManagementModal({ isOpen, onClose, currentUser, onTeamUpdated }) {
  const [staffList, setStaffList] = useState(() => authService.getAllStaffUsers());
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(2); // Default: Grant Application Officer
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const isFounderCeo = currentUser?.role === 'ceo';

  const refreshList = () => {
    const updated = authService.getAllStaffUsers();
    setStaffList(updated);
    if (onTeamUpdated) onTeamUpdated(updated);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const chosenRole = STAFF_ROLE_OPTIONS[selectedOptionIdx] || STAFF_ROLE_OPTIONS[2];
    try {
      const added = await authService.addTeamMember({
        fullName,
        email,
        phone,
        role: chosenRole.role,
        roleLabel: chosenRole.label
      });
      setFullName('');
      setEmail('');
      setPhone('');
      setSuccessMsg(`Added ${added.fullName} as ${added.roleLabel}. Temporary password: ${added.tempPassword}`);
      refreshList();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleRoleChange = async (memberId, newIdx) => {
    setErrorMsg('');
    setSuccessMsg('');
    const chosenRole = STAFF_ROLE_OPTIONS[Number(newIdx)];
    if (!chosenRole) return;
    try {
      const updated = await authService.updateTeamMemberRole(memberId, chosenRole.role, chosenRole.label);
      setSuccessMsg(`Updated ${updated.fullName}'s role to ${updated.roleLabel}.`);
      refreshList();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleStatus = async (memberId) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const updated = await authService.toggleTeamMemberStatus(memberId);
      setSuccessMsg(`${updated.fullName} is now ${updated.isActive ? 'Active' : 'Inactive'}.`);
      refreshList();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Team & Role Access Management</h2>
              <p className="text-xs text-slate-300">
                Founder & CEO Governance • Authorized by Isaac Agya Koomson
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Authorization Notice */}
          {!isFounderCeo ? (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Read-Only View — Founder / CEO Authorization Required</strong>
                <p className="mt-0.5 text-amber-800">
                  Only the Founder &amp; CEO (<strong>Isaac Agya Koomson</strong>) can add team members or assign/change user roles. Sign out and sign in as the Founder &amp; CEO to manage staff.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddMember} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                  <UserPlus className="w-4 h-4 text-amber-600" />
                  <span>Add New Team Member / User</span>
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Founder / CEO Access Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Yaw Boateng"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Work Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yaw@kia-startup.com"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +233 24 000 0000"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Assign Role *</label>
                  <select
                    value={selectedOptionIdx}
                    onChange={(e) => setSelectedOptionIdx(Number(e.target.value))}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {STAFF_ROLE_OPTIONS.map((opt, idx) => (
                      <option key={`${opt.role}-${idx}`} value={idx}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-500">
                  <strong>Role Scope:</strong> {STAFF_ROLE_OPTIONS[selectedOptionIdx]?.description}
                </p>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition whitespace-nowrap flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Team Member</span>
                </button>
              </div>
            </form>
          )}

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Team Directory */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Authorized KIA-START UP CONSULT Staff ({staffList.length})
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {staffList.map((member) => {
                const currentOptionIdx = STAFF_ROLE_OPTIONS.findIndex(
                  opt => opt.role === member.role && opt.label === member.roleLabel
                );
                const fallbackIdx = STAFF_ROLE_OPTIONS.findIndex(opt => opt.role === member.role);

                return (
                  <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{member.fullName}</span>
                        {member.isFounder || member.role === 'ceo' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>Founder / CEO</span>
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            member.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {member.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{member.email}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{member.phone}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isFounderCeo && !(member.isFounder || member.id === 'staff-01') ? (
                        <>
                          <select
                            value={currentOptionIdx >= 0 ? currentOptionIdx : (fallbackIdx >= 0 ? fallbackIdx : 2)}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            {STAFF_ROLE_OPTIONS.map((opt, idx) => (
                              <option key={`${opt.role}-${idx}`} value={idx}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(member.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                              member.isActive !== false
                                ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                                : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {member.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                          {member.roleLabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

