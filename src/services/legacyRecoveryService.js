import { INITIAL_CLIENTS } from '../data/initialClients';
import { auditService } from './auditService';

const LEGACY_STAGING_KEY = 'kia_legacy_staging_v2';

export const legacyRecoveryService = {
  getStagedLegacyClients() {
    const saved = localStorage.getItem(LEGACY_STAGING_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse staged legacy clients:', e);
      }
    }

    // Initialize from INITIAL_CLIENTS with quarantine analysis
    const staged = INITIAL_CLIENTS.map(c => {
      // Analyze evidence gaps and unverified assumptions
      const missingFields = [];
      if (!c.clientName) missingFields.push('Founder Full Name');
      if (!c.sector) missingFields.push('Business Sector');
      if (!c.targetGrantSize) missingFields.push('Target Grant Size');

      const unverifiedItems = [];
      if (c.commitmentFeePaid) {
        unverifiedItems.push('Commitment Fee claimed paid without bank/MoMo receipt evidence');
      } else {
        unverifiedItems.push('Commitment Fee outstanding (GH₵ 200)');
      }

      if (c.scores && Object.keys(c.scores).length > 0) {
        unverifiedItems.push('Diagnostic scores recorded without verified assessor identity or supporting documents');
      }

      if (c.checklist?.submitted) {
        unverifiedItems.push('Application marked submitted without funder reference number');
      }

      return {
        legacyId: c.id,
        businessName: c.businessName || 'Unnamed Business',
        founderName: c.clientName || 'Unknown Founder',
        sector: c.sector || 'Unspecified',
        legacyStage: c.stage || 'Stage 1: Onboarding',
        claimedFeePaid: Boolean(c.commitmentFeePaid),
        targetGrantSize: c.targetGrantSize || 'Not specified',
        gdriveFolder: c.gdriveFolder || '',
        rawScores: c.scores || {},
        rawChecklist: c.checklist || {},
        quarantineStatus: 'quarantined', // 'quarantined', 'under_review', 'reconciled_ready', 'activated'
        missingFields,
        unverifiedItems,
        reconciliationNotes: '',
        assignedOfficerId: null,
        reconciledBy: null,
        reconciledAt: null,
        dateOnboarded: c.dateOnboarded || '2026-01-01'
      };
    });

    localStorage.setItem(LEGACY_STAGING_KEY, JSON.stringify(staged));
    return staged;
  },

  updateLegacyRecord(legacyId, updates) {
    const clients = this.getStagedLegacyClients();
    const updated = clients.map(c => {
      if (c.legacyId === legacyId) {
        return {
          ...c,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    localStorage.setItem(LEGACY_STAGING_KEY, JSON.stringify(updated));
    return updated.find(c => c.legacyId === legacyId);
  },

  async reconcileAndActivate(legacyId, { assignedOfficerId, feeVerified, transactionRef, notes }) {
    const clients = this.getStagedLegacyClients();
    const target = clients.find(c => c.legacyId === legacyId);
    if (!target) throw new Error('Legacy record not found');

    const updated = clients.map(c => {
      if (c.legacyId === legacyId) {
        return {
          ...c,
          quarantineStatus: 'activated',
          assignedOfficerId,
          feeVerified,
          transactionRef: transactionRef || 'LEGACY-RECONCILED',
          reconciliationNotes: notes,
          reconciledAt: new Date().toISOString()
        };
      }
      return c;
    });

    localStorage.setItem(LEGACY_STAGING_KEY, JSON.stringify(updated));

    await auditService.logEvent({
      entityType: 'legacy_recovery',
      entityId: legacyId,
      action: 'reconcile_and_activate',
      previousState: { status: target.quarantineStatus },
      newState: { status: 'activated', assignedOfficerId, feeVerified },
      notes: `Reconciled legacy client ${target.businessName} with notes: ${notes}`
    });

    return target;
  }
};
