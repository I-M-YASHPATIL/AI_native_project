import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import { TaskStatus, TaskPriority } from '../../types';
import {
  X,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  ShieldCheck,
  AlertTriangle,
  History,
  FileText,
  ListTodo,
  CheckSquare
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    deleteTask,
    updateTaskStatus,
    toggleAcceptanceCriterion,
    addAcceptanceCriterion,
    deleteAcceptanceCriterion,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    teamMembers,
    currentUser,
  } = useTasks();

  const task = tasks.find((t) => t.id === selectedTaskId);

  // Editable local state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('P2');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [assigneeId, setAssigneeId] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [actualHours, setActualHours] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'ac' | 'subtasks' | 'details' | 'audit'>('ac');

  // Inline AC creator
  const [newAcTitle, setNewAcTitle] = useState('');
  const [newAcGiven, setNewAcGiven] = useState('');
  const [newAcWhen, setNewAcWhen] = useState('');
  const [newAcThen, setNewAcThen] = useState('');
  const [showAddAc, setShowAddAc] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
      setAssigneeId(task.assignee.id);
      setEstimatedHours(task.estimatedHours);
      setActualHours(task.actualHours);
      setDueDate(task.dueDate);
    }
  }, [task]);

  if (!task) return null;

  const handleSaveMeta = () => {
    const assignedMember = teamMembers.find((m) => m.id === assigneeId) || task.assignee;
    updateTask(task.id, {
      title: title.trim() || task.title,
      description: description.trim(),
      priority,
      assignee: assignedMember,
      estimatedHours,
      actualHours,
      dueDate,
    });
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    updateTaskStatus(task.id, newStatus);
  };

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleCreateAc = () => {
    if (!newAcTitle.trim()) return;
    addAcceptanceCriterion(task.id, {
      scenarioTitle: newAcTitle.trim(),
      givenClause: newAcGiven.trim() || 'Given authenticated request',
      whenClause: newAcWhen.trim() || 'When endpoint is called',
      thenClause: newAcThen.trim() || 'Then satisfies verification',
    });
    setNewAcTitle('');
    setNewAcGiven('');
    setNewAcWhen('');
    setNewAcThen('');
    setShowAddAc(false);
  };

  const totalAC = task.acceptanceCriteria.length;
  const verifiedAC = task.acceptanceCriteria.filter((ac) => ac.isVerified).length;
  const acRate = totalAC > 0 ? Math.round((verifiedAC / totalAC) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {task.taskId}
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">
              Created {task.createdAt.slice(0, 10)}
            </span>
            {task.securityReviewed && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium ml-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security Verified</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedTaskId(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Quick Controls */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveMeta}
            className="w-full text-base font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition-colors"
          />

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Status Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Status:</span>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white font-medium cursor-pointer"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CODE_REVIEW">Code Review</option>
                <option value="QA_VERIFY">QA Verify</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Priority:</span>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value as TaskPriority);
                  updateTask(task.id, { priority: e.target.value as TaskPriority });
                }}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white font-medium font-mono cursor-pointer"
              >
                <option value="P0">P0 - Critical</option>
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Medium</option>
                <option value="P3">P3 - Low</option>
              </select>
            </div>

            {/* Assignee */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Assignee:</span>
              <select
                value={assigneeId}
                onChange={(e) => {
                  setAssigneeId(e.target.value);
                  const mem = teamMembers.find((m) => m.id === e.target.value);
                  if (mem) updateTask(task.id, { assignee: mem });
                }}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white font-medium cursor-pointer"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* AC Fulfillment Meter */}
            <div className="flex items-center gap-1.5 ml-auto font-mono tabular-nums">
              <span className="text-slate-400">AC:</span>
              <span
                className={`font-semibold ${
                  verifiedAC < totalAC
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {verifiedAC}/{totalAC} ({acRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('ac')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'ac'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Acceptance Criteria ({totalAC})</span>
          </button>

          <button
            onClick={() => setActiveTab('subtasks')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'subtasks'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Subtasks ({task.subtasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Specification & Estimates</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail ({task.auditLogs.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {/* AC Tab */}
          {activeTab === 'ac' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Click 'Verify' to certify the criterion has met the specification.
                </span>
                <button
                  onClick={() => setShowAddAc(!showAddAc)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Criterion</span>
                </button>
              </div>

              {/* Add form */}
              {showAddAc && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <input
                    type="text"
                    placeholder="Scenario Title"
                    value={newAcTitle}
                    onChange={(e) => setNewAcTitle(e.target.value)}
                    className="w-full px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                    <input
                      type="text"
                      placeholder="Given"
                      value={newAcGiven}
                      onChange={(e) => setNewAcGiven(e.target.value)}
                      className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="When"
                      value={newAcWhen}
                      onChange={(e) => setNewAcWhen(e.target.value)}
                      className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Then"
                      value={newAcThen}
                      onChange={(e) => setNewAcThen(e.target.value)}
                      className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddAc(false)}
                      className="px-2.5 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateAc}
                      className="px-2.5 py-1 bg-indigo-600 text-white rounded font-medium"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {/* List */}
              <div className="space-y-3">
                {task.acceptanceCriteria.map((ac) => (
                  <div
                    key={ac.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-semibold text-slate-900 dark:text-white">
                            {ac.scenarioTitle}
                          </h5>
                          {ac.isVerified ? (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              Verified by {ac.reviewedBy || currentUser.name}
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              Pending Sign-off
                            </span>
                          )}
                        </div>

                        {/* Gherkin clause */}
                        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800/80">
                          <div><span className="text-indigo-600 font-semibold">GIVEN:</span> {ac.givenClause}</div>
                          <div><span className="text-indigo-600 font-semibold">WHEN:</span> {ac.whenClause}</div>
                          <div><span className="text-emerald-600 font-semibold">THEN:</span> {ac.thenClause}</div>
                        </div>

                        {ac.edgeCaseNote && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 italic">
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>{ac.edgeCaseNote}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleAcceptanceCriterion(task.id, ac.id)}
                          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                            ac.isVerified
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {ac.isVerified ? 'Verified' : 'Verify AC'}
                        </button>
                        <button
                          onClick={() => deleteAcceptanceCriterion(task.id, ac.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {task.acceptanceCriteria.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No acceptance criteria attached. Add one to enforce quality gates.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subtasks Tab */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <form onSubmit={handleCreateSubtask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add technical subtask checklist item..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                >
                  Add Subtask
                </button>
              </form>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {task.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => toggleSubtask(task.id, st.id)}
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <span
                        className={`${
                          st.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>

                    <button
                      onClick={() => deleteSubtask(task.id, st.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {task.subtasks.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No subtasks added yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details & Specs Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Description & Acceptance Specs
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSaveMeta}
                  className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Estimated Hours:</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                    onBlur={handleSaveMeta}
                    className="w-full px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Actual Hours Logged:</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={actualHours}
                    onChange={(e) => setActualHours(parseFloat(e.target.value) || 0)}
                    onBlur={handleSaveMeta}
                    className="w-full px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Due Date:</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    onBlur={handleSaveMeta}
                    className="w-full px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Audit Trail Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-3 font-mono text-xs">
              {task.auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-slate-900 dark:text-white">{log.author}</span>
                    <span className="tabular-nums text-[11px]">{log.timestamp.slice(0, 19).replace('T', ' ')} UTC</span>
                  </div>
                  <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                    {log.action}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                    {log.details}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40 text-xs">
          <div className="text-slate-500">
            Reporter: <span className="text-slate-900 dark:text-white font-medium">{task.reporter.name}</span>
          </div>

          <button
            onClick={() => setSelectedTaskId(null)}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            Done Editing
          </button>
        </div>
      </div>
    </div>
  );
};
