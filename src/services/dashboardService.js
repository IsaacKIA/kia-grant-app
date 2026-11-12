import { crmService } from './crmService';
import { taskService } from './taskService';
import { legacyRecoveryService } from './legacyRecoveryService';
import { STAFF_USERS } from './authService';

export const dashboardService = {
  getCeoMetrics() {
    const cases = crmService.getCases();
    const tasks = taskService.getTasks();
    const legacyStaged = legacyRecoveryService.getStagedLegacyClients();

    const today = new Date().toISOString().split('T')[0];

    // Core Case Numbers
    const totalClients = cases.length;
    const activeEngagements = cases.filter(c => c.status !== 'closed' && c.status !== 'withdrawn').length;
    const awaitingDocumentation = cases.filter(c => c.status === 'documentation').length;
    const feePendingCount = cases.filter(c => c.status === 'onboarding_fee_pending' || !c.engagementFee?.isVerified).length;
    const readyForMatching = cases.filter(c => c.status === 'grant_matching' || c.status === 'application_development').length;

    // Inactive & Stalled Cases
    const inactiveCases = cases.filter(c => c.inactivityFlag);
    const overdueCases = cases.filter(c => c.isOverdue);

    // Tasks & Escalations
    const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate < today);
    const tasksDueToday = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate === today);
    const level1Escalations = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.escalationLevel === 1);
    const level2CeoEscalations = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.escalationLevel === 2);

    // Financial Metrics
    const verifiedFeesAmount = cases
      .filter(c => c.engagementFee?.isVerified)
      .reduce((sum, c) => sum + (Number(c.engagementFee.amountPaid) || 0), 0);

    const outstandingFeesAmount = cases
      .filter(c => !c.engagementFee?.isVerified)
      .reduce((sum, c) => sum + (Number(c.engagementFee.amountDue) || 200), 0);

    // Staff Workload Breakdown
    const staffWorkload = STAFF_USERS.filter(s => s.role === 'application_officer' || s.role === 'team_leader').map(staff => {
      const assignedCases = cases.filter(c => c.currentOfficerId === staff.id);
      const assignedTasks = tasks.filter(t => t.assignedToId === staff.id && t.status !== 'completed' && t.status !== 'cancelled');
      const staffOverdue = assignedTasks.filter(t => t.dueDate < today);

      return {
        id: staff.id,
        name: staff.fullName,
        role: staff.roleLabel,
        activeCasesCount: assignedCases.length,
        pendingTasksCount: assignedTasks.length,
        overdueTasksCount: staffOverdue.length,
        urgentEscalationsCount: assignedTasks.filter(t => t.escalationLevel > 0).length
      };
    });

    // Unreconciled Legacy Staged Clients
    const quarantinedLegacyCount = legacyStaged.filter(l => l.quarantineStatus === 'quarantined' || l.quarantineStatus === 'under_review').length;

    return {
      totalClients,
      activeEngagements,
      awaitingDocumentation,
      feePendingCount,
      readyForMatching,
      inactiveCasesCount: inactiveCases.length,
      overdueCasesCount: overdueCases.length,
      overdueTasksCount: overdueTasks.length,
      tasksDueTodayCount: tasksDueToday.length,
      level1EscalationsCount: level1Escalations.length,
      level2CeoEscalationsCount: level2CeoEscalations.length,
      verifiedFeesAmount,
      outstandingFeesAmount,
      quarantinedLegacyCount,
      staffWorkload,
      criticalAttentionItems: [
        ...level2CeoEscalations.map(t => ({
          type: 'level_2_escalation',
          severity: 'critical',
          title: `CEO Escalation: Task ${t.taskNumber} is ${t.daysOverdue} days overdue`,
          description: `${t.title} (${t.clientName}) — Assigned to ${STAFF_USERS.find(s => s.id === t.assignedToId)?.fullName || 'Officer'}`,
          actionLabel: 'Reassign or Intervene',
          linkTab: 'tasks'
        })),
        ...inactiveCases.map(c => ({
          type: 'case_inactivity',
          severity: 'warning',
          title: `Inactive Case Stall: ${c.legalName}`,
          description: `No recorded activity for ${c.daysSinceActivity} days. Assigned to ${STAFF_USERS.find(s => s.id === c.currentOfficerId)?.fullName || 'Officer'}.`,
          actionLabel: 'Inspect Case',
          linkTab: 'cases'
        })),
        ...overdueCases.filter(c => !inactiveCases.some(ic => ic.id === c.id)).map(c => ({
          type: 'next_action_overdue',
          severity: 'warning',
          title: `Overdue Case Milestone: ${c.legalName}`,
          description: `${c.nextActionDescription} — Due on ${c.nextActionDueDate}.`,
          actionLabel: 'Review Action',
          linkTab: 'cases'
        }))
      ]
    };
  }
};
