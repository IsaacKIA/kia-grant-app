import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { STAFF_USERS } from '../services/authService';

export default function LoginPage({ staffUsers, onLoginSuccess, onBackToWelcome }) {
  const usersList = staffUsers && staffUsers.length > 0 ? staffUsers : STAFF_USERS;
  const activeUsers = usersList.filter(u => u.isActive !== false);

  const [email, setEmail] = useState('ceo@kia-startup.com');
  const [passcode, setPasscode] = useState('kia2026');
  const [error, setError] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your staff email address.');
      return;
    }

    const matchedUser = usersList.find(
      u => u.email.toLowerCase() === trimmedEmail
    );

    if (!matchedUser) {
      setError('No staff account was found with that email address.');
      return;
    }

    if (matchedUser.isActive === false) {
      setError('This staff account is currently inactive. Please contact the Founder & CEO.');
      return;
    }

    if (passcode !== 'kia2026') {
      setError('Incorrect staff passcode. Use "kia2026" for this local workspace.');
      return;
    }

    onLoginSuccess(matchedUser);
  };

  const handleQuickSignIn = (staff) => {
    setError('');
    if (staff.isActive === false) {
      setError('This staff account is currently inactive.');
      return;
    }
    onLoginSuccess(staff);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToWelcome}
            className="inline-flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Welcome Page</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm">
              K
            </div>
            <span className="font-bold text-slate-900 text-sm">KIA-START UP CONSULT</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Email & Passcode Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center space-x-2.5 mb-2">
              <div className="p-2 rounded-lg bg-slate-900 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Staff Sign In</h1>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Sign in with your KIA-Start Up Consult staff email to open your workspace.
            </p>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Staff Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@kia-startup.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Staff Passcode
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter passcode"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Local workspace passcode: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">kia2026</code>
                </p>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-sm"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Sign In to Workspace</span>
              </button>
            </form>
          </div>

          {/* Right: 1-Click Quick Sign In */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center space-x-2 mb-2">
              <UserCheck className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">Quick Staff Sign In</h2>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Choose an active team account below to sign in right away.
            </p>

            <div className="space-y-2.5">
              {activeUsers.map((staff) => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => handleQuickSignIn(staff)}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-900">
                        {staff.fullName}
                      </span>
                      {staff.isFounder && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Founder & CEO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {staff.roleLabel} &bull; {staff.email}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 opacity-80 group-hover:opacity-100">
                    Sign In &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

