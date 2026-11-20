import { authService, STAFF_USERS } from './authService';
import { auditService } from './auditService';
import { supabase, isSupabaseConfigured, isUuid } from '../lib/supabase';

const LOCAL_TASKS_KEY = 'kia_tasks_v3';

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
        if (Array.isArray(parsed)) {
          return this.computeEscalations(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved tasks:', e);
      }
    }
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify([]));
    return [];
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

  async syncTasksFromSupabase() {
    if (!isSupabaseConfigured || !supabase) return this.getTasks();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return this.getTasks();

      const { data, error } = await supabase
        .from('tasks')
        .select('*, cases(organizations(trading_name, legal_name))')
        .order('created_at', { ascending: false });

      if (error || !Array.isArray(data)) return this.getTasks();

      const cached = this.getTasks();
      const mapped = data.map(row => {
        const localMatch = cached.find(t => t.id === row.id || t.taskNumber === row.task_number);
        const org = row.cases?.organizations;
        const orgObj = Array.isArray(org) ? org[0] : org;
        return {
          id: row.id,
          taskNumber: row.task_number,
          caseId: row.case_id,
          clientName: orgObj?.trading_name || orgObj?.legal_name || localMatch?.clientName || 'General / Internal',
          title: row.title,
          description: row.description || '',
          assignedToId: row.assigned_to,
          createdById: row.created_by,
          priority: row.priority || 'medium',
          status: row.status || 'pending',
          dueDate: row.due_date,
          escalationLevel: row.escalation_level || 0,
          escalatedAt: row.escalated_at || null,
          completionEvidence: row.completion_evidence || '',
          completedAt: row.completed_at || null,
          createdAt: row.created_at,
          reassignments: localMatch?.reassignments || []
        };
      });

      return this.saveTasks(mapped);
    } catch (e) {
      console.warn('Supabase tasks sync skipped:', e);
      return this.getTasks();
    }
  },

  getTasksByCaseId(caseId) {
    const tasks = this.getTasks();
    return tasks.filter(t => t.caseId === caseId);
  },

  async createTask({ caseId, clientName, title, description, assignedToId, priority = 'medium', dueDate }) {
    const currentStaff = authService.getCurrentUser();
    const tasks = this.getTasks();
    const taskNumber = `TSK-2026-${String(tasks.length + 1).padStart(4, '0')}`;
    let taskId = `tsk-${Date.now().toString().slice(-5)}`;
    const resolvedAssignee = assignedToId || currentStaff.id;
    const resolvedDue = dueDate || new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured && supabase && isUuid(resolvedAssignee) && isUuid(currentStaff?.id)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: row, error } = await supabase
          .from('tasks')
          .insert({
            task_number: taskNumber,
            case_id: isUuid(caseId) ? caseId : null,
            title,
            description: description || '',
            assigned_to: resolvedAssignee,
            created_by: currentStaff.id,
            priority,
            status: 'pending',
            due_date: resolvedDue
          })
          .select()
          .single();
        if (!error && row?.id) taskId = row.id;
      }
    }

    const newTask = {
      id: taskId,
      taskNumber,
      caseId: caseId || null,
      clientName: clientName || 'General / Internal',
      title,
      description: description || '',
      assignedToId: resolvedAssignee,
      createdById: currentStaff.id,
      priority,
      status: 'pending',
      dueDate: resolvedDue,
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

    if (isSupabaseConfigured && supabase && isUuid(taskId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('tasks')
          .update({
            status: newStatus,
            completion_evidence: newStatus === 'completed' ? completionEvidence : current.completionEvidence,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : null
          })
          .eq('id', taskId);
      }
    }

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

    if (isSupabaseConfigured && supabase && isUuid(taskId) && isUuid(newOfficerId)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('tasks')
          .update({ assigned_to: newOfficerId })
          .eq('id', taskId);
      }
    }

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
