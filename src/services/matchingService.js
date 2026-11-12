import { grantService } from './grantService';
import { documentService } from './documentService';
import { readinessService } from './readinessService';

export const matchingService = {
  evaluateMatch(caseRecord, grantRecord) {
    const satisfiedCriteria = [];
    const missingInformation = [];
    const disqualifyingReasons = [];

    // 1. Sector Eligibility
    const isSectorMatch = grantRecord.targetSectors.includes(caseRecord.sector);
    if (isSectorMatch) {
      satisfiedCriteria.push(`Sector Alignment: Target sector "${caseRecord.sector}" is explicitly eligible.`);
    } else {
      disqualifyingReasons.push(`Sector Mismatch: Grant targets [${grantRecord.targetSectors.join(', ')}], but client operates in "${caseRecord.sector}".`);
    }

    // 2. Applicant Type Eligibility
    const isApplicantTypeMatch = grantRecord.eligibleApplicantTypes.includes(caseRecord.applicantType);
    if (isApplicantTypeMatch) {
      satisfiedCriteria.push(`Applicant Type Match: Organization structure "${caseRecord.applicantType}" is eligible.`);
    } else {
      disqualifyingReasons.push(`Entity Structure Ineligible: Grant accepts [${grantRecord.eligibleApplicantTypes.join(', ')}], client is "${caseRecord.applicantType}".`);
    }

    // 3. Regional Corridor Eligibility
    const isAllRegions = grantRecord.eligibleRegions.some(r => r.toLowerCase().includes('all') || r.toLowerCase().includes('ghana'));
    const isSpecificRegionMatch = grantRecord.eligibleRegions.some(r => r.toLowerCase().includes((caseRecord.region || '').toLowerCase()));
    
    if (isAllRegions || isSpecificRegionMatch) {
      satisfiedCriteria.push(`Geographical Eligibility: Operating region "${caseRecord.region || 'Ghana'}" is covered.`);
    } else {
      disqualifyingReasons.push(`Geographic Exclusion: Grant is restricted to [${grantRecord.eligibleRegions.join(', ')}], client is located in "${caseRecord.region}".`);
    }

    // 4. Legal Registration & Formalization
    const hasRegNumber = Boolean(caseRecord.registrationNumber && caseRecord.registrationNumber !== 'Pending');
    if (grantRecord.requiresRegistration) {
      if (hasRegNumber) {
        satisfiedCriteria.push(`Legal Registration: Business registration record verified (${caseRecord.registrationNumber}).`);
      } else {
        missingInformation.push(`Formal Registration Missing: Funder requires ORC Certificate / Form 3. Client registration status is pending.`);
      }
    } else {
      satisfiedCriteria.push(`Registration Flexibility: Funder accepts unregistered early-stage initiatives.`);
    }

    // 5. Readiness Score Threshold
    const caseAssessment = readinessService.getLatestAssessmentForCase(caseRecord.id);
    const clientScore = caseAssessment ? caseAssessment.totalScore : (caseRecord.scores ? readinessService.calculateScore(caseRecord.scores).totalScore : 0);

    if (clientScore >= grantRecord.minReadinessScore) {
      satisfiedCriteria.push(`Readiness Score Satisfied: Client diagnostic score (${clientScore}/100) meets or exceeds funder threshold (${grantRecord.minReadinessScore}/100).`);
    } else {
      missingInformation.push(`Diagnostic Score Gap: Client score (${clientScore}/100) is below minimum funder threshold (${grantRecord.minReadinessScore}/100). Remediation needed.`);
    }

    // 6. Documentation Completeness
    const docCompleteness = documentService.calculateCompleteness(caseRecord.id);
    if (grantRecord.requiresBankStatements && docCompleteness.verified === 0) {
      missingInformation.push(`Banking Verification Required: Funder requires 12-month corporate banking evidence.`);
    }

    // Determine Classification
    let classification = 'Potential Match';
    let badgeClass = 'bg-blue-50 text-blue-700 border-blue-300';
    let recommendedAction = 'Review client documents and prepare application concept note.';

    if (grantRecord.status === 'upcoming') {
      classification = 'Upcoming Call';
      badgeClass = 'bg-purple-50 text-purple-700 border-purple-300';
      recommendedAction = `Opportunity opening on ${grantRecord.openingDate}. Assemble draft proposals in advance.`;
    } else if (grantRecord.status === 'closed' || grantRecord.status === 'expired') {
      classification = 'Closed / Unavailable';
      badgeClass = 'bg-slate-100 text-slate-500 border-slate-300';
      recommendedAction = 'Do not apply. Await next funding cycle announcement.';
    } else if (disqualifyingReasons.length > 0) {
      classification = 'Not Eligible / Disqualified';
      badgeClass = 'bg-rose-50 text-rose-700 border-rose-300';
      recommendedAction = 'Disqualified due to fundamental sector or geographic criteria. Do not proceed.';
    } else if (missingInformation.length > 0) {
      classification = 'Information Required';
      badgeClass = 'bg-amber-50 text-amber-700 border-amber-300';
      recommendedAction = `Address ${missingInformation.length} outstanding evidence item(s) before advancing to application preparation.`;
    } else {
      classification = 'Eligible Based on Verified Information';
      badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold';
      recommendedAction = 'Client satisfies all core funder rules. Fast-track Stage 4 narrative and budget drafting.';
    }

    return {
      grant: grantRecord,
      classification,
      badgeClass,
      satisfiedCriteria,
      missingInformation,
      disqualifyingReasons,
      recommendedAction,
      isAdoptable: classification.includes('Eligible') || classification.includes('Information Required') || classification.includes('Potential')
    };
  },

  matchAllGrantsForCase(caseRecord) {
    const grants = grantService.getGrants();
    return grants.map(grant => this.evaluateMatch(caseRecord, grant));
  }
};

