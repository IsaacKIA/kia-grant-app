import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, AlertTriangle, ShieldCheck, 
  Clock, Lock, Check, AlertCircle, ArrowLeft 
} from 'lucide-react';
import { documentService } from '../services/documentService';

export default function ClientUploadPortal({ token, onExitPortal }) {
  const [tokenStatus, setTokenStatus] = useState({ valid: false, checking: true });
  const [requirements, setRequirements] = useState([]);
  const [activeReqId, setActiveReqId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [clientNote, setClientNote] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenStatus({ valid: false, checking: false, error: 'No upload token provided in URL.' });
      return;
    }
    let cancelled = false;
    (async () => {
      const val = await documentService.validateUploadTokenAsync(token);
      if (cancelled) return;
      if (val.valid) {
        setTokenStatus({ valid: true, checking: false, tokenRecord: val.tokenRecord });
        const reqs = val.requirements || [];
        setRequirements(reqs);
        if (reqs.length > 0) setActiveReqId(reqs[0].id);
      } else {
        setTokenStatus({ valid: false, checking: false, error: val.error });
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxBytes = 15 * 1024 * 1024; // 15 MB
      const allowedExt = /\.(pdf|doc|docx|png|jpg|jpeg)$/i;
      if (!allowedExt.test(file.name)) {
        alert('Unsupported file type. Please upload a PDF, Word (.doc/.docx), PNG, or JPG file.');
        e.target.value = '';
        return;
      }
      if (file.size > maxBytes) {
        alert('File is too large. Maximum allowed size is 15 MB.');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !activeReqId) return;

    setIsSubmitting(true);
    try {
      await documentService.uploadClientFile(activeReqId, {
        file: selectedFile,
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        mimeType: selectedFile.type || 'application/octet-stream',
        clientNote: clientNote.trim()
      }, token);

      // Refresh list
      const refreshedVal = await documentService.validateUploadTokenAsync(token);
      setRequirements(refreshedVal.valid ? (refreshedVal.requirements || []) : []);
      setSelectedFile(null);
      setClientNote('');
      setIsSubmitting(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) {
      setIsSubmitting(false);
      alert(err.message);
    }
  };

  if (tokenStatus.checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <Clock className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold">Validating secure upload token...</p>
        </div>
      </div>
    );
  }

  if (!tokenStatus.valid) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Link Invalid or Expired</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {tokenStatus.error || 'The secure document upload link is invalid or has expired.'}
          </p>
          <div className="bg-slate-50 p-4 rounded-xl text-[11px] text-slate-500 border border-slate-200">
            For assistance, contact your assigned KIA Grant Consultant or email <span className="text-slate-800 font-bold">advisory@kia-startup.com</span>.
          </div>
          {onExitPortal && (
            <button
              onClick={onExitPortal}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Staff Portal</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const activeReq = requirements.find(r => r.id === activeReqId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
              KIA
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">KIA-START UP CONSULT</span>
              <span className="text-[10px] text-slate-400">Secure Client Document Upload Portal</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>Encrypted Session</span>
            </span>
            {onExitPortal && (
              <button
                onClick={onExitPortal}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-bold"
              >
                Exit Portal
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Document Request for {tokenStatus.tokenRecord?.clientName}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Please upload the required supporting documents listed below. Files are encrypted and delivered directly to your assigned grant advisory team in Accra.
          </p>
        </div>

        {/* Upload Success Alert */}
        {uploadSuccess && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-emerald-800 text-xs flex items-center space-x-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="font-bold block">Document Uploaded Successfully!</strong>
              <span>Your file has been delivered and queued for officer verification.</span>
            </div>
          </div>
        )}

        {/* Requirements Grid & Upload Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Requirements Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
            <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider px-2">
              Required Documents ({requirements.length})
            </h2>

            <div className="space-y-1.5">
              {requirements.map(req => {
                const isSelected = req.id === activeReqId;
                const isUploaded = req.status === 'under_review' || req.status === 'uploaded';
                const isVerified = req.status === 'verified';
                const isRejected = req.status === 'correction_required';

                return (
                  <button
                    key={req.id}
                    onClick={() => setActiveReqId(req.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-start justify-between ${
                      isSelected 
                        ? 'border-amber-500 bg-amber-50/50 shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <strong className={`font-bold block text-xs ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                        {req.documentName}
                      </strong>
                      <span className="text-[10px] text-slate-400 block">{req.category}</span>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isVerified ? (
                        <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 block">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : isUploaded ? (
                        <span className="p-1 rounded-full bg-blue-100 text-blue-700 block text-[9px] font-bold px-1.5">
                          Review
                        </span>
                      ) : isRejected ? (
                        <span className="p-1 rounded-full bg-rose-100 text-rose-700 block">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Upload Pane */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            {activeReq ? (
              <form onSubmit={handleUploadSubmit} className="space-y-5 text-xs">
                <div>
                  <div className="flex items-center space-x-2 text-amber-600 font-bold uppercase text-[10px] tracking-wider mb-1">
                    <span>Target Document</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeReq.documentName}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    {activeReq.notes || 'Please upload the original or clear scanned copy of this document.'}
                  </p>
                </div>

                {/* Rejection Notice if applicable */}
                {activeReq.status === 'correction_required' && (
                  <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-rose-800 text-xs space-y-1">
                    <strong className="font-bold flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Correction Requested by Advisor:</span>
                    </strong>
                    <p className="pl-5 text-rose-900">{activeReq.rejectionReason}</p>
                  </div>
                )}

                {/* File Dropzone */}
                <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center space-y-3 bg-slate-50/50 transition">
                  <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
                  <div>
                    <label className="cursor-pointer font-bold text-amber-600 hover:text-amber-700">
                      <span>Click to select file</span>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
                        className="hidden"
                      />
                    </label>
                    <span className="text-slate-500"> or drag and drop</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Accepted: PDF, PNG, JPG, Word (.docx), Excel (.xlsx) • Max 25MB
                  </p>
                </div>

                {/* Selected File Feedback */}
                {selectedFile && (
                  <div className="bg-white p-3.5 rounded-xl border border-amber-300 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <strong className="text-slate-900">{selectedFile.name}</strong>
                      <span className="text-slate-400 text-[11px]">({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Client Note */}
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Add Optional Note or Remarks
                  </label>
                  <textarea
                    rows="2"
                    value={clientNote}
                    onChange={(e) => setClientNote(e.target.value)}
                    placeholder="e.g. Scanned official copy from Registrar General with active 2026 renewal stamp..."
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedFile || isSubmitting}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition shadow-sm ${
                    selectedFile && !isSubmitting
                      ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Uploading Document...' : 'Submit Document to Grant Team'}
                </button>
              </form>
            ) : (
              <p className="text-slate-400 py-12 text-center">Select a document requirement from the list on the left.</p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-[11px] text-slate-400">
        © 2026 KIA-START UP CONSULT • Encrypted Client Document Upload Portal
      </footer>
    </div>
  );
}

