import React, { useState } from 'react';
import { X, Building2, User, FileText, CheckCircle2, DollarSign, UserCheck, AlertCircle } from 'lucide-react';
import { crmService } from '../services/crmService';
import { STAFF_USERS } from '../services/authService';

export default function NewClientIntakeModal({ isOpen, onClose, onClientRegistered }) {
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const officers = STAFF_USERS.filter(s => s.role === 'application_officer' || s.role === 'team_leader');

  const [formData, setFormData] = useState({
    // Step 1: Organization Details
    legalName: '',
    tradingName: '',
    applicantType: 'SME',
    sector: 'Agribusiness',
    businessStage: 'Early-stage Growth',
    region: 'Greater Accra',
    registrationNumber: '',
    tinNumber: '',

    // Step 2: Primary Contact Details
    contactName: '',
    contactTitle: 'Managing Director / Founder',
    contactPhone: '',
    contactWhatsapp: '',
    contactEmail: '',

    // Step 3: Engagement Terms & Ownership
    targetGrantSize: 'GHS 100,000 – GHS 500,000',
    assignedOfficerId: officers[0]?.id || 'staff-03',
    engagementFeeAmount: 200,
    feePaymentMethod: 'momo_mtn',
    feeTransactionRef: '',
    clientClaimsPaid: false
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.legalName.trim()) {
        setErrorMsg('Please enter the organization or enterprise legal name.');
        return;
      }
    } else if (step === 2) {
      if (!formData.contactName.trim() || !formData.contactPhone.trim()) {
        setErrorMsg('Please enter the primary contact founder name and primary phone number.');
        return;
      }
    }
    setErrorMsg('');
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const createdCase = await crmService.registerClient({
        legalName: formData.legalName,
        tradingName: formData.tradingName || formData.legalName,
        applicantType: formData.applicantType,
        sector: formData.sector,
        businessStage: formData.businessStage,
        region: formData.region,
        registrationNumber: formData.registrationNumber,
        tinNumber: formData.tinNumber,
        primaryContact: {
          fullName: formData.contactName,
          title: formData.contactTitle,
          phone: formData.contactPhone,
          whatsapp: formData.contactWhatsapp || formData.contactPhone,
          email: formData.contactEmail
        },
        assignedOfficerId: formData.assignedOfficerId,
        targetGrantSize: formData.targetGrantSize,
        engagementFeeAmount: formData.engagementFeeAmount,
        feePaymentMethod: formData.feePaymentMethod,
        feeTransactionRef: formData.clientClaimsPaid ? formData.feeTransactionRef : ''
      });

      setIsSubmitting(false);
      onClientRegistered(createdCase);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Failed to register client');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>Client Registration & Intake</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Step {step} of 3: {step === 1 ? 'Organization Details' : step === 2 ? 'Founder & Contact' : 'Engagement & Assignment'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className={`flex items-center space-x-1.5 font-bold ${step >= 1 ? 'text-amber-600' : 'text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px]">1</span>
            <span>Organization</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200" />
          <div className={`flex items-center space-x-1.5 font-bold ${step >= 2 ? 'text-amber-600' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>Contact</span>
          </div>
          <div className="h-0.5 w-8 bg-slate-200" />
          <div className={`flex items-center space-x-1.5 font-bold ${step === 3 ? 'text-amber-600' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span>Assignment</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* STEP 1: Organization Details */}
          {step === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Legal Registered Entity Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aseda Agro Foods Limited"
                  value={formData.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Trading / Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aseda Foods"
                    value={formData.tradingName}
                    onChange={(e) => handleChange('tradingName', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Applicant Type *
                  </label>
                  <select
                    value={formData.applicantType}
                    onChange={(e) => handleChange('applicantType', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="Startup">Startup (0–3 yrs)</option>
                    <option value="SME">SME (Small/Medium Enterprise)</option>
                    <option value="NGO">NGO / Social Enterprise</option>
                    <option value="Cooperative">Cooperative / Association</option>
                    <option value="Individual">Individual Entrepreneur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Economic Sector *
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => handleChange('sector', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
                  >
                    <option value="Agribusiness">Agribusiness & Agro-Processing</option>
                    <option value="Technology & Services">Technology & Digital Services</option>
                    <option value="Manufacturing">Manufacturing & Value Addition</option>
                    <option value="Beauty & Personal Care">Beauty, Cosmetics & Wellness</option>
                    <option value="Healthcare & Sanitation">Healthcare & Sanitation</option>
                    <option value="General Commerce & Services">General Commerce & Services</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Business Stage *
                  </label>
                  <select
                    value={formData.businessStage}
                    onChange={(e) => handleChange('businessStage', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                  >
                    <option value="Idea / Pre-revenue">Idea / Concept Stage</option>
                    <option value="Early-stage">Early-stage (&lt;1 yr sales)</option>
                    <option value="Early-stage Growth">Growth Stage (1–3 yrs sales)</option>
                    <option value="Established Scaling">Mature Scaling (&gt;3 yrs sales)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    ORC / RGD Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS-1234520"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    TIN / Ghana Card
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. C00987654"
                    value={formData.tinNumber}
                    onChange={(e) => handleChange('tinNumber', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Founder / Contact Details */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Primary Founder / Authorized Contact Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kofi Mensah Boateng"
                  value={formData.contactName}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Official Title / Role
                  </label>
                  <input
                    type="text"
                    value={formData.contactTitle}
                    onChange={(e) => handleChange('contactTitle', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Primary Phone Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +233 24 000 1122"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +233 24 000 1122"
                    value={formData.contactWhatsapp}
                    onChange={(e) => handleChange('contactWhatsapp', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. founder@company.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Engagement Terms & Officer Assignment */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Target Grant Funding Size
                  </label>
                  <input
                    type="text"
                    value={formData.targetGrantSize}
                    onChange={(e) => handleChange('targetGrantSize', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Assign Responsible Officer *
                  </label>
                  <select
                    value={formData.assignedOfficerId}
                    onChange={(e) => handleChange('assignedOfficerId', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
                    required
                  >
                    {officers.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.fullName} ({o.roleLabel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Engagement Fee Policy Notice */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 block font-bold">
                      Standard Onboarding Engagement Fee: GH₵ 200
                    </strong>
                    <span className="text-[11px] text-slate-500">
                      Standard diagnostic intake & documentation advisory fee.
                    </span>
                  </div>
                  <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.clientClaimsPaid}
                      onChange={(e) => handleChange('clientClaimsPaid', e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Client Has Paid</span>
                  </label>
                </div>

                {formData.clientClaimsPaid && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Payment Method
                      </label>
                      <select
                        value={formData.feePaymentMethod}
                        onChange={(e) => handleChange('feePaymentMethod', e.target.value)}
                        className="w-full border border-slate-200 rounded p-1.5 bg-white text-xs"
                      >
                        <option value="momo_mtn">MTN Mobile Money</option>
                        <option value="momo_telecel">Telecel Cash</option>
                        <option value="bank_transfer">Bank Transfer / EFT</option>
                        <option value="bank_deposit">Bank Cash Deposit</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        TxID / Bank Ref *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. momo_991823"
                        value={formData.feeTransactionRef}
                        onChange={(e) => handleChange('feeTransactionRef', e.target.value)}
                        className="w-full border border-slate-200 rounded p-1.5 text-xs"
                        required={formData.clientClaimsPaid}
                      />
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 italic">
                  Note: Payment will be logged as pending verification until audited by the Finance Officer.
                </p>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-bold hover:bg-slate-50"
              >
                Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition"
              >
                Continue to Step {step + 1}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition shadow-sm"
              >
                {isSubmitting ? 'Registering...' : 'Complete Registration & Create Case'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

