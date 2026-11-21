import React, { useState, useEffect } from 'react';
import { 
  Calculator, CheckCircle, AlertCircle, Sparkles, ChevronDown, 
  ChevronUp, ArrowRight, Download, Save, RefreshCw, Info, ShieldCheck,
  User, Calendar, FileText
} from 'lucide-react';
import { readinessService } from '../services/readinessService';
import { authService, STAFF_USERS } from '../services/authService';
import { crmService } from '../services/crmService';

export default function ReadinessCalculator({ 
  clients, 
  selectedClient, 
  onSaveScores, 
  onExportReport 
}) {
  const [activeClientId, setActiveClientId] = useState(selectedClient?.id || clients[0]?.id || '');
  const [localResponses, setLocalResponses] = useState({});
  const [openPillars, setOpenPillars] = useState({ legal: true, business_model: true });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [assessmentNotes, setAssessmentNotes] = useState('');
  const [assessorId, setAssessorId] = useState(authService.getCurrentUser().id);

  const framework = readinessService.getFramework();
  const currentClient = clients.find(c => c.id === activeClientId) || clients[0];
  const readiness = readinessService.calculateScore(localResponses);
  const officers = STAFF_USERS.filter(s => s.role === 'application_officer' || s.role === 'team_leader' || s.role === 'ceo');

  // Sync client change & Supabase assessments
  useEffect(() => {
    readinessService.syncAssessmentsFromSupabase();
  }, []);

  useEffect(() => {
    const current = clients.find(c => c.id === activeClientId);
    if (current) {
      // Initialize responses from existing scores
      const responses = {};
      const scores = current.scores || {};
      Object.keys(scores).forEach(subId => {
        responses[subId] = {
          score: scores[subId],
          isNotApplicable: false,
          notes: ''
        };
      });
      setLocalResponses(responses);
    }
  }, [activeClientId, clients]);

  useEffect(() => {
    if (selectedClient && selectedClient.id !== activeClientId) {
      setActiveClientId(selectedClient.id);
    }
  }, [selectedClient, activeClientId]);

  const togglePillar = (id) => {
    setOpenPillars(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setScore = (subId, val) => {
    setLocalResponses(prev => ({
      ...prev,
      [subId]: {
        ...(prev[subId] || {}),
        score: val,
        isNotApplicable: false
      }
    }));
    setSaveSuccess(false);
  };

  const toggleNA = (subId) => {
    setLocalResponses(prev => ({
      ...prev,
      [subId]: {
        ...(prev[subId] || {}),
        isNotApplicable: !prev[subId]?.isNotApplicable
      }
    }));
    setSaveSuccess(false);
  };

  const setEvidenceNote = (subId, note) => {
    setLocalResponses(prev => ({
      ...prev,
      [subId]: {
        ...(prev[subId] || {}),
        notes: note
      }
    }));
  };

  const handleSave = async () => {
    if (currentClient) {
      // Save in readiness service
      await readinessService.saveAssessment({
        caseId: currentClient.id,
        clientName: currentClient.businessName,
        responses: localResponses,
        assessmentNotes
      });

      // Map back to flat scores for backward compatibility
      const flatScores = {};
      Object.keys(localResponses).forEach(k => {
        flatScores[k] = localResponses[k]?.isNotApplicable ? 0 : (localResponses[k]?.score ?? 0);
      });
      onSaveScores(currentClient.id, flatScores);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleExport = () => {
    handleSave();
    const flatScores = {};
    Object.keys(localResponses).forEach(k => {
      flatScores[k] = localResponses[k]?.isNotApplicable ? 0 : (localResponses[k]?.score ?? 0);
    });
    onExportReport(currentClient, flatScores);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Diagnostic Meter */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-600">
              Evidence-Based Readiness Diagnostic ({framework.version})
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

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Assessor: </span>
                <select
                  value={assessorId}
                  onChange={(e) => setAssessorId(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 border-b border-slate-300 focus:outline-none"
                >
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>{o.fullName} ({o.roleLabel})</option>
                  ))}
                </select>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
              </span>
            </div>
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
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${readiness.tier.badgeClass}`}>
                  {readiness.tier.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium max-w-xs">
                {readiness.tier.summary}
              </p>
              <span className="text-[10px] text-slate-400 block">
                {readiness.gaps.length} Actionable Gap Items Detected
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-5 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Evaluated against the approved 10-pillar, 20-metric framework.
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{saveSuccess ? 'Assessment Saved!' : 'Save Diagnostic Snapshot'}</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export Official A4 Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 10 Diagnostic Pillars Accordion */}
      <div className="space-y-4">
        {framework.pillars.map((pillar) => {
          const isOpen = openPillars[pillar.id] !== false;
          let pillarScore = 0;
          let pillarMax = pillar.maxPoints;

          pillar.subCriteria.forEach(sub => {
            const resp = localResponses[sub.id];
            if (!resp?.isNotApplicable) {
              pillarScore += (resp?.score ?? 0);
            }
          });

          return (
            <div key={pillar.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              {/* Pillar Header */}
              <button
                type="button"
                onClick={() => togglePillar(pillar.id)}
                className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 transition text-left"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-sm">{pillar.name}</h3>
                    <span className="text-xs font-bold text-slate-500">
                      ({pillarScore} / {pillarMax} pts)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{pillar.description}</p>
                </div>

                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {/* Sub-Criteria */}
              {isOpen && (
                <div className="p-5 divide-y divide-slate-100 space-y-4">
                  {pillar.subCriteria.map(sub => {
                    const resp = localResponses[sub.id] || {};
                    const currentScore = resp.score ?? 0;
                    const isNA = resp.isNotApplicable ?? false;

                    return (
                      <div key={sub.id} className="pt-4 first:pt-0 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1 max-w-xl">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-slate-900 text-xs">{sub.title}</h4>
                              {isNA && (
                                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                                  Marked Not Applicable
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{sub.description}</p>
                          </div>

                          {/* Score Controls */}
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleNA(sub.id)}
                              className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                                isNA ? 'bg-slate-800 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              N/A
                            </button>

                            {!isNA && (
                              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                                {[0, 1, 2, 3, 4, 5].map(pts => (
                                  <button
                                    key={pts}
                                    type="button"
                                    onClick={() => setScore(sub.id, pts)}
                                    className={`w-7 h-7 rounded-md font-bold text-xs transition ${
                                      currentScore === pts
                                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {pts}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Guidance & Evidence Input */}
                        {!isNA && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Scoring Guidance</span>
                              <p className="text-slate-600 text-[11px]">
                                {sub.guidance[currentScore] || sub.guidance[5] || 'Assess against verifiable documentation.'}
                              </p>
                              {currentScore < 4 && (
                                <p className="text-amber-700 text-[11px] font-medium mt-1">
                                  ⚠️ Fix: {sub.fixAction}
                                </p>
                              )}
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Assessor Evidence Reference</span>
                              <input
                                type="text"
                                placeholder="Cite verified document (e.g. Form 3 verified on 12 Nov)..."
                                value={resp.notes || ''}
                                onChange={(e) => setEvidenceNote(sub.id, e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-700"
                              />
                            </div>
                          </div>
                        )}
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
  );
}
