import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Users, Target, CheckSquare, Award, ArrowRight } from 'lucide-react';
import { crmService } from '../services/crmService';
import { applicationService } from '../services/applicationService';
import { grantService } from '../services/grantService';
import { taskService } from '../services/taskService';

export default function GlobalSearchModal({ isOpen, onClose, onSelectCase, onNavigateTab }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!isOpen) return { clients: [], apps: [], grants: [], tasks: [] };
    const q = query.trim().toLowerCase();

    const clients = crmService.getCases().filter(c =>
      !q ||
      c.legalName.toLowerCase().includes(q) ||
      (c.tradingName || '').toLowerCase().includes(q) ||
      (c.caseNumber || '').toLowerCase().includes(q) ||
      (c.sector || '').toLowerCase().includes(q)
    ).slice(0, 5);

    const apps = applicationService.getApplications().filter(a =>
      !q ||
      a.clientName.toLowerCase().includes(q) ||
      a.grantTitle.toLowerCase().includes(q) ||
      (a.applicationNumber || '').toLowerCase().includes(q)
    ).slice(0, 4);

    const grants = grantService.getGrants().filter(g =>
      !q ||
      g.title.toLowerCase().includes(q) ||
      g.funder.toLowerCase().includes(q)
    ).slice(0, 4);

    const tasks = taskService.getTasks().filter(t =>
      t.status !== 'completed' && (
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.clientName || '').toLowerCase().includes(q)
      )
    ).slice(0, 4);

    return { clients, apps, grants, tasks };
  }, [isOpen, query]);

  if (!isOpen) return null;

  const totalCount =
    results.clients.length +
    results.apps.length +
    results.grants.length +
    results.tasks.length;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-16 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients, case numbers, grant applications, funders, or tasks..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5">
          {totalCount === 0 ? (
            <div className="text-center py-10 text-sm text-slate-500">
              No matching records found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <>
              {results.clients.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    <span>Clients</span>
                  </h3>
                  <div className="space-y-1.5">
                    {results.clients.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSelectCase(c);
                          onClose();
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-amber-50 border border-transparent hover:border-amber-200 transition flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-900">{c.legalName}</div>
                          <div className="text-xs text-slate-500">{c.caseNumber} &bull; {c.sector} &bull; {c.applicantType}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-amber-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.apps.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    <span>Grant Applications</span>
                  </h3>
                  <div className="space-y-1.5">
                    {results.apps.map(a => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          onNavigateTab('applications');
                          onClose();
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{a.clientName} — {a.grantTitle}</div>
                          <div className="text-xs text-slate-500">{a.applicationNumber} &bull; Stage: {a.status.replace(/_/g, ' ')}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.tasks.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Open Tasks</span>
                  </h3>
                  <div className="space-y-1.5">
                    {results.tasks.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          onNavigateTab('tasks');
                          onClose();
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{t.title}</div>
                          <div className="text-xs text-slate-500">{t.clientName || 'Internal'} &bull; Due {t.dueDate}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.grants.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-500" />
                    <span>Grant Opportunities</span>
                  </h3>
                  <div className="space-y-1.5">
                    {results.grants.map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          onNavigateTab('grants');
                          onClose();
                        }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{g.title}</div>
                          <div className="text-xs text-slate-500">{g.funder} &bull; Deadline {g.deadline}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

