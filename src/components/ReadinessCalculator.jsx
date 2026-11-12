import React, { useState, useEffect } from 'react';
import { 
  Calculator, CheckCircle, AlertCircle, Sparkles, ChevronDown, 
  ChevronUp, ArrowRight, Download, Save, RefreshCw, Info, ShieldCheck
} from 'lucide-react';
import { PILLARS, READINESS_TIERS, calculateReadiness } from '../data/criteria';

export default function ReadinessCalculator({ 
  clients, 
  selectedClient, 
  onSaveScores, 
  onExportReport 
}) {
  const [activeClientId, setActiveClientId] = useState(selectedClient?.id || clients[0]?.id || '');
  const [localScores, setLocalScores] = useState({});
  const [openPillars, setOpenPillars] = useState({ legal: true, business_model: true });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync when selected client changes or component mounts
  useEffect(() => {
    const current = clients.find(c => c.id === activeClientId);
    if (current) {
      setLocalScores(current.scores || {});
    }
  }, [activeClientId, clients]);

  useEffect(() => {
    if (selectedClient && selectedClient.id !== activeClientId) {
      setActiveClientId(selectedClient.id);
    }
  }, [selectedClient]);

  const currentClient = clients.find(c => c.id === activeClientId) || clients[0];
  const readiness = calculateReadiness(localScores);

  const togglePillar = (id) => {
    setOpenPillars(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setScore = (subId, val) => {
    setLocalScores(prev => ({
      ...prev,
      [subId]: val
    }));
    setSaveSuccess(false);
  };

  const handleSave = () => {
    if (currentClient) {
      onSaveScores(currentClient.id, localScores);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Client Switcher & Score Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Client Selector & Info */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-600">
              Diagnostic Assessment
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={activeClientId}
                onChange={(e) => setActiveClientId(e.target.value)}
                className="text-base font-bold bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.businessName} ({c.clientName})
                  </option>
                ))}
              </select>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                {currentClient?.sector}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Evaluated against Kia-Start Up Consult’s 20-Metric Readiness Matrix (0–100 Scale).
            </p>
          </div>

          {/* Dynamic Score Meter */}
          <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="relative flex items-center justify-center">
              <div 
                className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 shadow-sm"
                style={{ borderColor: readiness.tier.color, backgroundColor: 'white' }}
              >
                <span className="text-2xl font-black text-slate-900">{readiness.totalScore}</span>
                <span className="text-[10px] font-semibold text-slate-400 -mt-1">/ 100</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${readiness.tier.badgeClass}`}>
                  {readiness.tier.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium max-w-xs">
                {readiness.tier.summary}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveSuccess ? 'Saved!' : 'Save Score'}</span>
              </button>
              <button
                onClick={() => onExportReport(currentClient, localScores)}
                className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pillar Summary Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mt-6 pt-6 border-t border-slate-100">
          {PILLARS.map((p, idx) => {
            const pillarScore = p.subCriteria.reduce((sum, sub) => sum + (localScores[sub.id] || 0), 0);
            const pct = Math.round((pillarScore / p.maxPoints) * 100);
            return (
              <div key={p.id} className="bg-slate-50 p-2 rounded-lg border border-slate-200/60 text-center">
                <div className="text-[10px] text-slate-500 font-semibold truncate mb-1">
                  P{idx + 1}. {p.name.split('.')[1]?.trim().split('&')[0]}
                </div>
                <div className="text-xs font-extrabold text-slate-900">
                  {pillarScore} / {p.maxPoints}
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content: Scoring Matrix + Gap Analysis Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 10 Pillars Rubric */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              Scoring Rubric (20 Concrete Sub-Criteria)
            </h3>
            <span className="text-xs text-slate-500">
              Select 0 to 5 points for each metric
            </span>
          </div>

          <div className="space-y-3">
            {PILLARS.map((pillar, pIdx) => {
              const isOpen = openPillars[pillar.id] !== false;
              const pillarCurrent = pillar.subCriteria.reduce((s, sub) => s + (localScores[sub.id] || 0), 0);

              return (
                <div key={pillar.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  {/* Pillar Header Accordion */}
                  <button
                    onClick={() => togglePillar(pillar.id)}
                    className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                        {pIdx + 1}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900">{pillar.name}</span>
                        <p className="text-xs text-slate-500">{pillar.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700">
                        {pillarCurrent} / {pillar.maxPoints} pts
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {/* Sub-Criteria Rows */}
                  {isOpen && (
                    <div className="p-5 divide-y divide-slate-100 space-y-4">
                      {pillar.subCriteria.map((sub, sIdx) => {
                        const currentVal = localScores[sub.id] ?? 0;
                        return (
                          <div key={sub.id} className={sIdx > 0 ? "pt-4" : ""}>
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                              <div>
                                <h5 className="font-semibold text-xs text-slate-900">
                                  {sub.title}
                                </h5>
                                <p className="text-xs text-slate-500">{sub.description}</p>
                              </div>

                              {/* 0 to 5 Score Buttons */}
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                {[0, 1, 2, 3, 4, 5].map((scoreNum) => {
                                  const isSelected = currentVal === scoreNum;
                                  return (
                                    <button
                                      key={scoreNum}
                                      onClick={() => setScore(sub.id, scoreNum)}
                                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                        isSelected
                                          ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow'
                                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                      }`}
                                    >
                                      {scoreNum}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Active Score Guidance text */}
                            <div className="bg-slate-50 rounded-lg p-2.5 text-xs border border-slate-200/60 flex items-start space-x-2">
                              <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-600">
                                <strong className="text-slate-800">
                                  Score {currentVal}/5: 
                                </strong>{' '}
                                {sub.guidance[currentVal] || 
                                  (currentVal <= 2 ? sub.guidance[2] : currentVal <= 4 ? sub.guidance[4] : sub.guidance[5])}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Gap Analysis & Action Roadmap */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-sm text-slate-900">Gap Analysis & Fixes</h4>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {readiness.gaps.length} Action Items
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Items with score &lt; 4 preventing {currentClient?.businessName} from qualifying for competitive donor grants:
            </p>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {readiness.gaps.length === 0 ? (
                <div className="text-center py-6 text-xs text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                  <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                  <strong>Exceptional Readiness!</strong>
                  <p className="text-slate-600 mt-1">
                    No critical gaps detected. This startup is positioned for competitive international donor submissions.
                  </p>
                </div>
              ) : (
                readiness.gaps.map((gap, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-lg border text-xs ${
                      gap.severity === 'high' 
                        ? 'bg-rose-50/70 border-rose-200' 
                        : 'bg-amber-50/70 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className={gap.severity === 'high' ? 'text-rose-900' : 'text-amber-900'}>
                        {gap.criterion}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white font-extrabold text-slate-700">
                        {gap.currentScore} / 5
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      👉 <strong>Action:</strong> {gap.fixAction}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={handleSave}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs transition shadow-sm"
              >
                Save Diagnostic & Update Stage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
