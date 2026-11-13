import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, AlertTriangle, ShieldAlert, Plus, 
  User, UserCheck, Calendar, ArrowRight, Filter, Search, CheckSquare 
} from 'lucide-react';
import { taskService } from '../services/taskService';
import { authService, STAFF_USERS } from '../services/authService';

export default function TasksView() {
  const [tasks, setTasks] = useState(() => taskService.getTasks());
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'my_tasks', 'due_today', 'overdue', 'escalations', 'waiting_client'
  const [search, setSearch] = useState('');
  
  // Modals
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [completingTask, setCompletingTask] = useState(null);
  const [reassigningTask, setReassigningTask] = useState(null);

  // Forms
  const [completionEvidence, setCompletionEvidence] = useState('');
  const [newOfficerId, setNewOfficerId] = useState('');
  const [reassignReason, setReassignReason] = useState('');

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskClient, setNewTaskClient] = useState('');
  const [newTaskOfficerId, setNewOfficerIdForm] = useState(STAFF_USERS[0]?.id || 'staff-01');
  const [newTaskDue, setNewTaskDue] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  const currentUser = authService.getCurrentUser();
  const today = new Date().toISOString().split('T')[0];

  const refreshTasks = () => {
    setTasks(taskService.getTasks());
  };

  const officers = STAFF_USERS.filter(s => s.role === 'application_officer' || s.role === 'team_leader');

  const filteredTasks = tasks.filter(t => {
    // Text search
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.taskNumber.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'my_tasks') {
      return t.assignedToId === currentUser.id && t.status !== 'completed' && t.status !== 'cancelled';
    }
    if (activeFilter === 'due_today') {
      return t.dueDate === today && t.status !== 'completed' && t.status !== 'cancelled';
    }
    if (activeFilter === 'overdue') {
      return t.dueDate < today && t.status !== 'completed' && t.status !== 'cancelled';
    }
    if (activeFilter === 'escalations') {
      return t.escalationLevel > 0 && t.status !== 'completed' && t.status !== 'cancelled';
    }
    if (activeFilter === 'waiting_client') {
      return t.status === 'waiting_on_client';
    }
    return true; // 'all'
  });

  const handleExecuteComplete = async (e) => {
    e.preventDefault();
    if (!completingTask) return;
    try {
      await taskService.updateTaskStatus(completingTask.id, 'completed', completionEvidence);
      setCompletingTask(null);
      setCompletionEvidence('');
      refreshTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExecuteReassignment = async (e) => {
    e.preventDefault();
    if (!reassigningTask || !newOfficerId) return;
    try {
      await taskService.reassignTask(reassigningTask.id, newOfficerId, reassignReason);
      setReassigningTask(null);
      setNewOfficerId('');
      setReassignReason('');
      refreshTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateNewTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await taskService.createTask({
        title: newTaskTitle,
        description: newTaskDesc,
        clientName: newTaskClient || 'General Advisory',
        assignedToId: newTaskOfficerId,
        priority: newTaskPriority,
        dueDate: newTaskDue
      });
      setIsNewTaskOpen(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskClient('');
      refreshTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Team Task & Accountability Workbench
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational task queues, daily due dates, and automated multi-level supervisor escalations.
          </p>
        </div>

        <button
          onClick={() => setIsNewTaskOpen(true)}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Create New Task</span>
        </button>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveFilter('my_tasks')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeFilter === 'my_tasks' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Tasks ({tasks.filter(t => t.assignedToId === currentUser.id && t.status !== 'completed').length})
        </button>
        <button
          onClick={() => setActiveFilter('due_today')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeFilter === 'due_today' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Due Today ({tasks.filter(t => t.dueDate === today && t.status !== 'completed').length})
        </button>
        <button
          onClick={() => setActiveFilter('overdue')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeFilter === 'overdue' ? 'bg-rose-600 text-white font-bold' : 'text-rose-600 hover:bg-rose-50'
          }`}
        >
          Overdue ({tasks.filter(t => t.dueDate < today && t.status !== 'completed').length})
        </button>
        <button
          onClick={() => setActiveFilter('escalations')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 ${
            activeFilter === 'escalations' ? 'bg-rose-700 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Escalations ({tasks.filter(t => t.escalationLevel > 0 && t.status !== 'completed').length})</span>
        </button>
        <button
          onClick={() => setActiveFilter('waiting_client')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeFilter === 'waiting_client' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Waiting on Client ({tasks.filter(t => t.status === 'waiting_on_client').length})
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            No tasks found in this queue.
          </div>
        ) : (
          filteredTasks.map(task => {
            const officer = STAFF_USERS.find(s => s.id === task.assignedToId);
            return (
              <div 
                key={task.id}
                className={`bg-white rounded-xl p-4 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  task.escalationLevel === 2 
                    ? 'border-rose-400 bg-rose-50/30 shadow-sm'
                    : task.escalationLevel === 1
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400">
                      {task.taskNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {task.clientName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      task.priority === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.status.replace(/_/g, ' ')}
                    </span>

                    {/* Escalation Badges */}
                    {task.escalationLevel === 2 && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                        <ShieldAlert className="w-3 h-3" />
                        <span>CEO Level 2 Escalation ({task.daysOverdue}d overdue)</span>
                      </span>
                    )}
                    {task.escalationLevel === 1 && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Team Leader Escalation</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-500 max-w-2xl">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assigned: <strong className="text-slate-800">{officer?.fullName || 'Unassigned'}</strong></span>
                    </span>
                    <span className="flex items-center space-x-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due: <strong className={task.isOverdue ? 'text-rose-600' : 'text-slate-800'}>{task.dueDate}</strong></span>
                    </span>
                    {task.completedAt && (
                      <span className="text-emerald-600 font-bold">
                        Completed on {new Date(task.completedAt).toLocaleDateString('en-GB')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  {task.status !== 'completed' && (
                    <>
                      <button
                        onClick={() => {
                          setReassigningTask(task);
                          setNewOfficerId(task.assignedToId);
                        }}
                        className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition"
                      >
                        Reassign
                      </button>
                      <button
                        onClick={() => setCompletingTask(task)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Complete Task Modal */}
      {completingTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Record Task Completion</h3>
                <p className="text-xs text-slate-400 mt-0.5">{completingTask.taskNumber}: {completingTask.title}</p>
              </div>
              <button onClick={() => setCompletingTask(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleExecuteComplete} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Completion Evidence & Verification Notes *
                </label>
                <textarea
                  rows="3"
                  value={completionEvidence}
                  onChange={(e) => setCompletionEvidence(e.target.value)}
                  placeholder="e.g. Verified valid Form 3 filed on 14 Jan 2026 with ORC stamp; renewed till Jan 2027..."
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  required
                />
                <span className="text-[10px] text-slate-400 italic block mt-1">
                  Rule 3.4: Tasks cannot be marked completed without documenting verification evidence.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingTask(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {reassigningTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Reassign Task Responsibility</h3>
                <p className="text-xs text-slate-400 mt-0.5">{reassigningTask.taskNumber}</p>
              </div>
              <button onClick={() => setReassigningTask(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleExecuteReassignment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Assign to Officer *
                </label>
                <select
                  value={newOfficerId}
                  onChange={(e) => setNewOfficerId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
                  required
                >
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>{o.fullName} — {o.roleLabel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
                  Reassignment Reason *
                </label>
                <textarea
                  rows="2"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="e.g. Urgent workload rebalance due to approaching funder deadline..."
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReassigningTask(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
                >
                  Save Reassignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Create New Operational Task</h3>
              <button onClick={() => setIsNewTaskOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateNewTask} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Conduct eligibility check for GEA YouStart..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Client / Organization Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cocoveg Farms"
                  value={newTaskClient}
                  onChange={(e) => setNewTaskClient(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Detailed instructions or specific checklist items..."
                  className="w-full border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Assign Officer *</label>
                  <select
                    value={newTaskOfficerId}
                    onChange={(e) => setNewOfficerIdForm(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
                    required
                  >
                    {officers.map(o => (
                      <option key={o.id} value={o.id}>{o.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

