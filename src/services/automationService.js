/**
 * KIA Grant Management System 2.0 - Automation & Escalation Service
 * 
 * Scheduled Operational Radar:
 * 1. Inactivity Detection: flags cases dormant for >7 days (Warning) and >14 days (CEO Escalation).
 * 2. Grant Deadline Monitoring: 14, 7, 3, 1-day urgency alerts for pending applications.
 * 3. Document Completeness Radar: detects clients with incomplete checklists >3 days post-onboarding.
 * 4. Background Audit Runner: automated trigger simulation creating actionable tasks for officers.
 */

import { crmService } from './crmService';
import { applicationService } from './applicationService';
import { documentService } from './documentService';
import { taskService } from './taskService';
import { auditService } from './auditService';
import { grantService } from './grantService';

const AUTOMATION_LOGS_STORAGE_KEY = 'kia_automation_logs_v2';

export const AUTOMATION_POLICIES = [
  {
    id: 'pol-01',
    name: 'Case Inactivity Warning (7 Days)',
    frequency: 'Daily at 08:00 GMT',
    description: 'Generates warning alert if an active case has no logged activity for over 7 days.',
    action: 'Flags case and notifies assigned officer.'
  },
  {
    id: 'pol-02',
    name: 'Case Inactivity CEO Escalation (14 Days)',
    frequency: 'Daily at 08:00 GMT',
    description: 'Generates executive escalation directly to CEO and Team Leader if an active case has no activity for over 14 days.',
    action: 'Creates urgent priority-high management intervention task.'
  },
  {
    id: 'pol-03',
    name: 'Grant Submission Deadline Radar (14d, 7d, 3d, 1d)',
    frequency: 'Daily at 07:30 GMT',
    description: 'Monitors closing dates of active proposals and issues countdown alerts to drafting officers.',
    action: 'Increases task priority and notifies Team Leader when <3 days remain.'
  },
  {
    id: 'pol-04',
    name: 'Missing Client Documents Chase Trigger',
    frequency: 'Every 48 Hours',
    description: 'Identifies clients onboarded >3 days with unsubmitted mandatory documentation.',
    action: 'Queues WhatsApp/SMS/Email document reminder link.'
  },
  {
    id: 'pol-05',
    name: 'Overdue Task Supervisory Auto-Escalation',
    frequency: 'Hourly',
    description: 'Escalates overdue tasks to Team Leader after 1 business day, and to CEO after 3 business days.',
    action: 'Promotes task escalation level and sends system notification.'
  }
];

class AutomationService {
  constructor() {
    this.logs = this.loadLogs();
  }

  loadLogs() {
    try {
      const data = localStorage.getItem(AUTOMATION_LOGS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load automation logs:', e);
    }
    return [];
  }

  saveLogs(logs) {
    this.logs = logs;
    try {
      localStorage.setItem(AUTOMATION_LOGS_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save automation logs:', e);
    }
  }

  getLogs() {
    return [...this.logs];
  }

  /**
   * Runs the comprehensive operational audit scanner across all active cases,
   * applications, and document queues.
   */
  async runOperationalAudit() {
    const cases = crmService.getCases();
    const applications = applicationService.getApplications();
    const grants = grantService.getGrants();
    const now = new Date();

    const auditResults = {
      runAt: now.toISOString(),
      casesScanned: cases.length,
      applicationsScanned: applications.length,
      inactivityWarnings: [],
      inactivityCeoEscalations: [],
      deadlineAlerts: [],
      documentChaseAlerts: [],
      tasksCreatedCount: 0
    };

    // 1. SCAN CASES FOR INACTIVITY
    for (const c of cases) {
      if (c.status === 'archived' || c.status === 'dormant') continue;

      const lastActivity = c.lastActivityAt ? new Date(c.lastActivityAt) : new Date(c.onboardingDate || now);
      const daysInactive = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      if (daysInactive >= 14) {
        auditResults.inactivityCeoEscalations.push({
          caseId: c.id,
          clientName: c.tradingName,
          officerId: c.currentOfficerId,
          daysInactive
        });

        // Ensure high priority escalation task exists
        const existingTasks = taskService.getTasksByCaseId(c.id);
        const hasEscalationTask = existingTasks.some(t => t.title.includes('CRITICAL INACTIVITY ESCALATION') && t.status !== 'completed');
        
        if (!hasEscalationTask) {
          await taskService.createTask({
            caseId: c.id,
            clientName: c.tradingName,
            title: `CRITICAL INACTIVITY ESCALATION: ${c.tradingName} (${daysInactive} days dormant)`,
            description: `Automated Radar detected that case ${c.caseNumber} has had zero staff or client activity for ${daysInactive} days. Immediate CEO & Team Leader intervention required.`,
            assignedToId: c.currentOfficerId,
            dueDate: new Date(now.getTime() + 1 * 86400000).toISOString().split('T')[0],
            priority: 'urgent'
          });
          auditResults.tasksCreatedCount++;
        }
      } else if (daysInactive >= 7) {
        auditResults.inactivityWarnings.push({
          caseId: c.id,
          clientName: c.tradingName,
          officerId: c.currentOfficerId,
          daysInactive
        });
      }
    }

    // 2. SCAN APPLICATIONS FOR DEADLINES
    for (const app of applications) {
      if (app.status === 'submitted' || app.status === 'awarded' || app.status === 'rejected') {
        continue;
      }

      const grant = grants.find(g => g.id === app.opportunityId);
      const closingDateStr = app.funderDeadline || grant?.closingDate;
      if (!closingDateStr) continue;

      const closingDate = new Date(closingDateStr);
      const daysUntilDeadline = Math.ceil((closingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDeadline <= 14) {
        const severity = daysUntilDeadline <= 3 ? 'urgent' : (daysUntilDeadline <= 7 ? 'high' : 'medium');
        auditResults.deadlineAlerts.push({
          applicationId: app.id,
          applicationNumber: app.applicationNumber,
          clientName: app.clientName,
          grantTitle: app.grantTitle,
          daysUntilDeadline,
          closingDate: closingDateStr,
          stage: app.status,
          severity
        });

        if (daysUntilDeadline <= 3 && app.status !== 'internal_review' && app.status !== 'approved_for_submission') {
          // Check if urgent deadline task already exists
          const existingTasks = taskService.getTasksByCaseId(app.caseId);
          const hasDeadlineTask = existingTasks.some(t => t.title.includes('DEADLINE CRITICAL') && t.status !== 'completed');

          if (!hasDeadlineTask) {
            await taskService.createTask({
              caseId: app.caseId,
              clientName: app.clientName,
              title: `DEADLINE CRITICAL (${daysUntilDeadline}d remaining): ${app.grantTitle}`,
              description: `Application ${app.applicationNumber} closes on ${closingDateStr}. Currently in '${app.status}'. Complete narrative/budget and route to Internal QA immediately.`,
              assignedToId: app.assignedOfficerId,
              dueDate: new Date(now.getTime() + 1 * 86400000).toISOString().split('T')[0],
              priority: 'urgent'
            });
            auditResults.tasksCreatedCount++;
          }
        }
      }
    }

    // 3. SCAN CLIENTS FOR MISSING DOCUMENTS
    for (const c of cases) {
      if (c.status === 'archived') continue;
      const progress = documentService.calculateCompleteness(c.id);
      const onboardDate = new Date(c.onboardingDate || now);
      const daysSinceOnboarding = Math.floor((now.getTime() - onboardDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceOnboarding >= 3 && progress.percentage < 100) {
        auditResults.documentChaseAlerts.push({
          caseId: c.id,
          clientName: c.tradingName,
          completeness: progress.percentage,
          missingCount: progress.missing,
          daysSinceOnboarding
        });
      }
    }

    // Record audit run in logs
    const logEntry = {
      id: `audit-${Date.now()}`,
      runAt: auditResults.runAt,
      summary: `Automated scan completed: ${auditResults.casesScanned} cases, ${auditResults.applicationsScanned} applications. Identified ${auditResults.inactivityCeoEscalations.length} CEO escalations, ${auditResults.inactivityWarnings.length} inactivity warnings, and ${auditResults.deadlineAlerts.length} deadline alerts.`,
      details: auditResults
    };

    const updatedLogs = [logEntry, ...this.logs.slice(0, 49)];
    this.saveLogs(updatedLogs);

    await auditService.logAction({
      userId: 'system-automation',
      action: 'scheduled_operational_audit',
      entityType: 'automation_system',
      entityId: logEntry.id,
      details: {
        casesScanned: auditResults.casesScanned,
        ceoEscalationsCount: auditResults.inactivityCeoEscalations.length,
        deadlineAlertsCount: auditResults.deadlineAlerts.length,
        tasksCreatedCount: auditResults.tasksCreatedCount
      }
    });

    return auditResults;
  }
}

export const automationService = new AutomationService();

