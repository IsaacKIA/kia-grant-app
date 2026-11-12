import { PILLARS, READINESS_TIERS } from '../data/criteria';
import { authService } from './authService';
import { auditService } from './auditService';

const LOCAL_ASSESSMENTS_KEY = 'kia_readiness_assessments_v2';

export const readinessService = {
  getFramework() {
    return {
      version: 'v2.0-2026',
      name: 'KIA 20-Metric Readiness Matrix',
      pillars: PILLARS
    };
  },

  getAllAssessments(caseId = null) {
    const saved = localStorage.getItem(LOCAL_ASSESSMENTS_KEY);
    let list = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse readiness assessments:', e);
      }
    }

    if (caseId) {
      return list.filter(a => a.caseId === caseId);
    }
    return list;
  },

  getLatestAssessmentForCase(caseId) {
    const all = this.getAllAssessments(caseId);
    if (all.length === 0) return null;
    return all.sort((a, b) => new Date(b.assessedAt) - new Date(a.assessedAt))[0];
  },

  calculateScore(responses) {
    let totalScore = 0;
    let applicableMax = 0;
    const gaps = [];

    PILLARS.forEach(pillar => {
      pillar.subCriteria.forEach(sub => {
        const resp = responses[sub.id];
        const isNA = resp?.isNotApplicable || false;
        const scoreVal = typeof resp === 'number' ? resp : (resp?.score ?? 0);

        if (!isNA) {
          totalScore += scoreVal;
          applicableMax += 5; // 5 points max per sub-criterion

          if (scoreVal < 4) {
            gaps.push({
              pillar: pillar.name,
              criterionId: sub.id,
              criterionTitle: sub.title,
              score: scoreVal,
              severity: scoreVal <= 2 ? 'high' : 'medium',
              fixAction: sub.fixAction,
              evidenceLinked: resp?.evidenceDocId ? true : false
            });
          }
        }
      });
    });

    // Normalize if any criterion is marked N/A, ensuring 0-100 scale remains fair
    let normalizedScore = totalScore;
    if (applicableMax > 0 && applicableMax < 100) {
      normalizedScore = Math.round((totalScore / applicableMax) * 100);
    }

    const tier = READINESS_TIERS.find(t => normalizedScore >= t.min && normalizedScore <= t.max) || READINESS_TIERS[3];

    return {
      rawScore: totalScore,
      totalScore: normalizedScore,
      tier,
      gaps,
      applicableMax
    };
  },

  async saveAssessment({ caseId, clientName, responses, assessmentNotes = '' }) {
    const currentStaff = authService.getCurrentUser();
    const result = this.calculateScore(responses);

    const assessmentRecord = {
      id: `diag-${Date.now().toString().slice(-6)}`,
      caseId,
      clientName,
      assessorId: currentStaff.id,
      assessorName: currentStaff.fullName,
      assessorRole: currentStaff.roleLabel,
      totalScore: result.totalScore,
      tier: result.tier,
      responses, // subId -> { score, isNotApplicable, evidenceDocId, notes }
      gaps: result.gaps,
      assessmentNotes,
      assessedAt: new Date().toISOString(),
      frameworkVersion: 'v2.0-2026'
    };

    const existing = this.getAllAssessments();
    const updated = [assessmentRecord, ...existing];
    localStorage.setItem(LOCAL_ASSESSMENTS_KEY, JSON.stringify(updated));

    await auditService.logEvent({
      entityType: 'readiness_assessment',
      entityId: assessmentRecord.id,
      action: 'conduct_assessment',
      newState: { totalScore: result.totalScore, tier: result.tier.label },
      notes: `Diagnostic assessment conducted for ${clientName}: ${result.totalScore}/100 (${result.tier.label}) by ${currentStaff.fullName}`
    });

    return assessmentRecord;
  }
};
