import { authService, STAFF_USERS } from './authService';
import { auditService } from './auditService';

const LOCAL_TASKS_KEY = 'kia_tasks_v2';

export const INITIAL_TASKS = [
  {
    id: 'tsk-001',
    taskNumber: 'TSK-2026-0001',
    caseId: 'case-001',
    clientName: 'Cocoveg Farms',
    title: 'Verify Registrar General Certificate & Form 3',
    description: 'Inspect uploaded ORC incorporation certificate and confirm valid Form 3 status with annual renewal.',
    assignedToId: 'staff-03', // Kofi Mensah
    createdById: 'staff-02',  // Abena Osei (TL)
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], // 4 days overdue -> Escalation Level 2 (CEO)
    escalationLevel: 2,
    escalatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    completionEvidence: '',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    reassignments: []
  },
  {
    id: 'tsk-002',
    taskNumber: 'TSK-2026-0002',
    caseId: 'case-002',
    clientName: 'Amacares',
    title: 'Review 3-Year Audited Financial Statements',
    description: 'Examine income statements and reconcile with bank turnover records for Mastercard Foundation HAPPY eligibility.',
    assignedToId: 'staff-03', // Kofi Mensah
    createdById: 'staff-02',  // Abena Osei (TL)
    priority: 'urgent',
    status: 'in_progress',
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], // 1 day overdue -> Escalation Level 1 (Team Leader)
    escalationLevel: 1,
    escalatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    completionEvidence: '',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    reassignments: []
  },
  {
    id: 'tsk-003',
    taskNumber: 'TSK-2026-0003',
    caseId: 'case-003',
    clientName: 'Union Farms',
    title: 'Send Upload Request Link for Land Lease Agreement',
    description: 'Generate secure upload link and remind founder to upload signed 10-year agricultural land lease.',
    assignedToId: 'staff-04', // Efua Addo
    createdById: 'staff-02',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date().toISOString().split('T')[0], // Due Today!
    escalationLevel: 0,
    escalatedAt: null,
    completionEvidence: '',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    reassignments: []
  },
  {
    id: 'tsk-004',
    taskNumber: 'TSK-2026-0004',
    caseId: 'case-004',
    clientName: 'Noor Ventures',
    title: 'Verify MTN MoMo Commitment Fee Receipt',
    description: 'Verify GHS 200 transaction reference momo_789423 against KIA commercial MoMo merchant statement.',
    assignedToId: 'staff-05', // Emmanuel Darko (Finance)
    createdById: 'staff-03',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    escalationLevel: 0,
    escalatedAt: null,
    completionEvidence: '',
    createdAt: new Date().toISOString(),
    reassignments: []
  },
  {
    id: 'tsk-005',
    taskNumber: 'TSK-2026-0005',
    caseId: 'case-005',
    clientName: 'Gadak Agro Service Limited',
    title: 'Conduct Initial 20-Metric Readiness Assessment',
    description: 'Execute comprehensive diagnostic interview with founder on governance, traction, and financial records.',
    assignedToId: 'staff-04', // Efua Addo
    createdById: 'staff-02',
    priority: 'medium',
    status: 'waiting_on_client',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    escalationLevel: 0,
    escalatedAt: null,
    completionEvidence: '',
    createdAt: new Date().toISOString(),
    reassignments: []
  }
];

export const taskService = {
  getTasks() {
    const saved = localStorage.getItem(LOCAL_TASKS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return this.computeEscalations(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved tasks:', e);
      }
    }
    const evaluated = this.computeEscalations(INITIAL_TASKS);
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(evaluated));
    return evaluated;
  },

  computeEscalations(taskList) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    return taskList.map(task => {
      if (task.status === 'completed' || task.status === 'cancelled') {
        return task;
      }

      const due = new Date(task.dueDate);
      const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));

      let level = 0;
      if (diffDays >= 3) {
        level = 2; // Escalated to CEO
      } else if (diffDays >= 1) {
        level = 1; // Escalated to Team Leader
      }

      return {
        ...task,
        escalationLevel: level,
        isOverdue: task.dueDate < today,
        isDueToday: task.dueDate === today,
        daysOverdue: Math.max(0, diffDays)
      };
    });
  },

  saveTasks(tasks) {
    const evaluated = this.computeEscalations(tasks);
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(evaluated));
    return evaluated;
  },

  async createTask({ caseId, clientName, title, description, assignedToId, priority = 'medium', dueDate }) {
    const currentStaff = authService.getCurrentUser();
    const tasks = this.getTasks();
    const newTask = {
      id: `tsk-${Date.now().toString().slice(-5)}`,
      taskNumber: `TSK-2026-${String(tasks.length + 1).padStart(4, '0')}`,
      caseId: caseId || null,
      clientName: clientName || 'General / Internal',
      title,
      description: description || '',
      assignedToId: assignedToId || currentStaff.id,
      createdById: currentStaff.id,
      priority,
      status: 'pending',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      escalationLevel: 0,
      escalatedAt: null,
      completionEvidence: '',
      createdAt: new Date().toISOString(),
      reassignments: []
    };

    const updated = [newTask, ...tasks];
    this.saveTasks(updated);

    await auditService.logEvent({
      entityType: 'task',
      entityId: newTask.id,
      action: 'create_task',
      newState: newTask,
      notes: `Created task "${title}" assigned to ${STAFF_USERS.find(s => s.id === assignedToId)?.fullName || 'officer'}`
    });

    return newTask;
  },

  async updateTaskStatus(taskId, newStatus, completionEvidence = '') {
    const tasks = this.getTasks();
    const current = tasks.find(t => t.id === taskId);
    if (!current) throw new Error('Task not found');

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          completionEvidence: newStatus === 'completed' ? completionEvidence : t.completionEvidence,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    this.saveTasks(updated);

    await auditService.logEvent({
      entityType: 'task',
      entityId: taskId,
      action: 'update_status',
      previousState: { status: current.status },
      newState: { status: newStatus, completionEvidence },
      notes: `Task status updated to ${newStatus}`
    });

    return updated.find(t => t.id === taskId);
  },

  async reassignTask(taskId, newOfficerId, reason = '') {
    const currentStaff = authService.getCurrentUser();
    const tasks = this.getTasks();
    const current = tasks.find(t => t.id === taskId);
    if (!current) throw new Error('Task not found');

    const previousOfficer = STAFF_USERS.find(s => s.id === current.assignedToId);
    const newOfficer = STAFF_USERS.find(s => s.id === newOfficerId);

    const reassignRecord = {
      fromOfficerId: current.assignedToId,
      fromOfficerName: previousOfficer?.fullName || 'Unknown',
      toOfficerId: newOfficerId,
      toOfficerName: newOfficer?.fullName || 'Unknown',
      reassignedById: currentStaff.id,
      reassignedByName: currentStaff.fullName,
      reason: reason || 'Operational workload rebalancing',
      timestamp: new Date().toISOString()
    };

    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          assignedToId: newOfficerId,
          reassignments: [...(t.reassignments || []), reassignRecord],
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    this.saveTasks(updated);

    await auditService.logEvent({
      entityType: 'task',
      entityId: taskId,
      action: 'reassign_task',
      previousState: { assignedToId: current.assignedToId },
      newState: { assignedToId: newOfficerId, reason },
      notes: `Reassigned from ${reassignRecord.fromOfficerName} to ${reassignRecord.toOfficerName}: ${reason}`
    });

    return updated.find(t => t.id === taskId);
  }
};
