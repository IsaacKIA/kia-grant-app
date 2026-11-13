import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { authService } from '../services/authService';

export default function LoginPage({ onLoginSuccess, onBackToWelcome }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const authenticatedUser = await authService.authenticateStaff(email, password);
      onLoginSuccess(authenticatedUser);
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="p-2 rounded-lg bg-slate-900 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Staff Sign In</h1>
          </div>
          <p className="text-sm text-slate-600 mb-6">
            Enter your KIA-Start Up Consult staff email and password to open your workspace.
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
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@kia-startup.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 transition shadow-sm"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>{isSubmitting ? 'Verifying...' : 'Sign In to Workspace'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Security Notice</p>
            <p>
              Staff accounts are managed by the Founder &amp; CEO. If you need an account or password reset, contact Isaac Agya Koomson.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
