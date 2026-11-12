import React, { useState } from 'react';
import { 
  FileText, CheckCircle2, AlertTriangle, Clock, UploadCloud, 
  Search, Filter, Link2, Copy, Check, ShieldCheck, Eye, ArrowRight 
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { crmService } from '../services/crmService';
import DocumentReviewModal from './DocumentReviewModal';

export default function DocumentHubView({ onSelectCase, onOpenClientPortalSim }) {
  const [requirements, setRequirements] = useState(() => documentService.getCaseRequirements());
  const [cases] = useState(() => crmService.getCases());
  const [activeTab, setActiveTab] = useState('review_queue'); // 'review_queue', 'all_docs', 'tokens'
  const [search, setSearch] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState('All');
  
  // Review Modal State
  const [reviewingReq, setReviewingReq] = useState(null);

  // Link Generator State
  const [tokenGenCaseId, setTokenGenCaseId] = useState(cases[0]?.id || '');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [copied, setCopied] = useState(false);

  const refreshData = () => {
    setRequirements(documentService.getCaseRequirements());
  };

  const reviewQueue = requirements.filter(r => r.status === 'under_review' || r.status === 'uploaded');
  const missingQueue = requirements.filter(r => r.status === 'missing' || r.status === 'correction_required');
  const verifiedCount = requirements.filter(r => r.status === 'verified').length;

  const filteredRequirements = requirements.filter(r => {
    const matchesSearch = 
      r.documentName.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (r.uploadedFile?.fileName || '').toLowerCase().includes(search.toLowerCase());
    const matchesCase = selectedCaseId === 'All' || r.caseId === selectedCaseId;
    return matchesSearch && matchesCase;
  });

  const handleGenerateToken = (e) => {
    e.preventDefault();
    const targetCase = cases.find(c => c.id === tokenGenCaseId);
    if (!targetCase) return;

    const tokenObj = documentService.generateUploadToken(targetCase.id, targetCase.tradingName);
    setGeneratedToken(tokenObj);
    setCopied(false);
  };

  const handleCopyLink = () => {
    if (generatedToken?.uploadUrl) {
      navigator.clipboard.writeText(generatedToken.uploadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Intelligent Document Hub & Verification Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository for client supporting evidence, secure token upload links, and staff verification workflows.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('tokens')}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
        >
          <Link2 className="w-4 h-4 text-amber-400" />
          <span>Generate Secure Client Link</span>
        </button>
      </div>

      {/* Aggregate Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Review */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Under Staff Review</span>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-black ${reviewQueue.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {reviewQueue.length}
            </span>
            <span className="text-xs text-slate-400">Needs review &lt;24h</span>
          </div>
        </div>

        {/* Verified Documents */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Verified Documents</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600">
              {verifiedCount}
            </span>
            <span className="text-xs text-slate-400">/ {requirements.length} Total</span>
          </div>
        </div>

        {/* Missing / Correction */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Outstanding / Missing</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-rose-600">
              {missingQueue.length}
            </span>
            <span className="text-xs text-slate-400">Requires follow-up</span>
          </div>
        </div>

        {/* Overall Completeness */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Global Verification Rate</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">
              {requirements.length > 0 ? Math.round((verifiedCount / requirements.length) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-400">Completeness</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setActiveTab('review_queue')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
            activeTab === 'review_queue' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Pending Verification Queue</span>
          {reviewQueue.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('all_docs')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'all_docs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Client Checklists ({requirements.length})
        </button>

        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${
            activeTab === 'tokens' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Link2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Upload Link Generator</span>
        </button>
      </div>

      {/* TAB 1: PENDING REVIEW QUEUE */}
      {activeTab === 'review_queue' && (
        <div className="space-y-3">
          {reviewQueue.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
              ✅ All uploaded client documents have been inspected and verified!
            </div>
          ) : (
            reviewQueue.map(req => (
              <div
                key={req.id}
                className="bg-white rounded-xl p-4 border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-400 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                      {req.clientName}
                    </span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      Under Review
                    </span>
                    <span className="text-[10px] text-slate-400">{req.category}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {req.documentName}
                  </h3>

                  <p className="text-xs text-slate-500">
                    File: <strong className="text-slate-700">{req.uploadedFile?.fileName}</strong> ({req.uploadedFile?.fileSize}) • Uploaded {new Date(req.uploadedFile?.uploadedAt).toLocaleString('en-GB')}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setReviewingReq(req)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Inspect & Verify</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: ALL CHECKLISTS */}
      {activeTab === 'all_docs' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search document name, client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium"
            >
              <option value="All">All Client Cases</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.tradingName}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-bold">Client / Case</th>
                    <th className="py-3 px-4 font-bold">Document Requirement</th>
                    <th className="py-3 px-4 font-bold">Category</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold">Uploaded File</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequirements.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {req.clientName}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {req.documentName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {req.category}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                          req.status === 'correction_required' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {req.uploadedFile ? req.uploadedFile.fileName : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {req.uploadedFile ? (
                          <button
                            onClick={() => setReviewingReq(req)}
                            className="px-2.5 py-1 bg-slate-900 text-white rounded font-bold hover:bg-slate-800"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Awaiting Upload</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UPLOAD LINK GENERATOR */}
      {activeTab === 'tokens' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Generate Secure Client Upload Link
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Creates a time-limited (72h), cryptographically unguessable token link for client document uploads without password creation.
            </p>
          </div>

          <form onSubmit={handleGenerateToken} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 uppercase block mb-1">
                Select Client Case *
              </label>
              <select
                value={tokenGenCaseId}
                onChange={(e) => setTokenGenCaseId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} — {c.tradingName} ({c.primaryContact.fullName})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-sm"
            >
              Generate Cryptographic Upload Link
            </button>
          </form>

          {generatedToken && (
            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  Ready for Client: {generatedToken.clientName}
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono">
                  Expires in 72 Hours
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={generatedToken.uploadUrl}
                  className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono text-slate-700"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 flex items-center space-x-1"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-600">
                <span>Direct client link: send via WhatsApp or Email.</span>
                {onOpenClientPortalSim && (
                  <button
                    onClick={() => onOpenClientPortalSim(generatedToken.token)}
                    className="text-amber-700 font-bold hover:underline"
                  >
                    Simulate Client Experience →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewingReq && (
        <DocumentReviewModal
          requirement={reviewingReq}
          onClose={() => setReviewingReq(null)}
          onReviewed={refreshData}
        />
      )}
    </div>
  );
}
