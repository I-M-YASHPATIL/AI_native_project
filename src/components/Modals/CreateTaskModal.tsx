import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { TaskPriority, TaskStatus, AcceptanceCriterion } from '../../types';
import { X, Plus, Trash2, Sparkles, ShieldCheck } from 'lucide-react';

export const CreateTaskModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createTask, teamMembers, currentUser } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('P2');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [assigneeId, setAssigneeId] = useState<string>(currentUser.id);
  const [estimatedHours, setEstimatedHours] = useState<number>(4);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [tagsInput, setTagsInput] = useState('React, Frontend');
  const [securityReviewed, setSecurityReviewed] = useState(false);

  // Initial acceptance criteria
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<Array<Omit<AcceptanceCriterion, 'id' | 'isVerified'>>>([
    {
      scenarioTitle: 'Standard functional path satisfies spec requirements',
      givenClause: 'Given authenticated user session',
      whenClause: 'When feature is executed',
      thenClause: 'Then output matches expected state and returns 200 OK',
      edgeCaseNote: 'Check boundary inputs and null values',
    },
  ]);

  if (!isCreateModalOpen) return null;

  const handleAddAc = () => {
    setAcceptanceCriteria((prev) => [
      ...prev,
      {
        scenarioTitle: '',
        givenClause: 'Given valid preconditions',
        whenClause: 'When endpoint / component renders',
        thenClause: 'Then verifies invariant',
      },
    ]);
  };

  const handleRemoveAc = (index: number) => {
    setAcceptanceCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateAc = (index: number, field: string, value: string) => {
    setAcceptanceCriteria((prev) =>
      prev.map((ac, i) => (i === index ? { ...ac, [field]: value } : ac))
    );
  };

  const applyTemplate = (type: 'security' | 'api' | 'db') => {
    if (type === 'security') {
      setTitle('Enforce JWT Bearer Authentication & Rate Limiting');
      setDescription('Secure REST endpoints with RS256 token verification, claims check, and leaky-bucket rate limiting.');
      setPriority('P0');
      setTagsInput('Security, JWT, Flask, OWASP');
      setAcceptanceCriteria([
        {
          scenarioTitle: 'Reject missing or malformed Authorization header with HTTP 401',
          givenClause: 'Given an HTTP request without valid Bearer token',
          whenClause: 'When @require_auth decorator parses headers',
          thenClause: 'Then return HTTP 401 Unauthorized with standardized JSON error',
        },
        {
          scenarioTitle: 'Rate limiter caps burst traffic at 60 requests per minute',
          givenClause: 'Given 65 requests sent within 60 seconds from same IP',
          whenClause: 'When 61st request arrives',
          thenClause: 'Then respond with HTTP 429 Too Many Requests and Retry-After header',
          edgeCaseNote: 'Ensure Redis/in-memory rate bucket resets correctly',
        },
      ]);
    } else if (type === 'api') {
      setTitle('Flask REST Endpoint for Subtask Bulk Completion');
      setDescription('Provide PATCH /api/v1/tasks/{id}/subtasks/batch route with transactional consistency.');
      setPriority('P1');
      setTagsInput('API, Flask, Backend');
      setAcceptanceCriteria([
        {
          scenarioTitle: 'Batch update subtask statuses in single transaction',
          givenClause: 'Given a task with 3 active subtasks',
          whenClause: 'When payload sends list of subtask IDs with completed: true',
          thenClause: 'Then all subtasks update atomically and audit log entry is saved',
        },
      ]);
    } else if (type === 'db') {
      setTitle('MySQL Index Optimization on Task Filter Query Plans');
      setDescription('Add composite index idx_tasks_status_priority_due to optimize Kanban columns query.');
      setPriority('P1');
      setTagsInput('MySQL, Database, Performance');
      setAcceptanceCriteria([
        {
          scenarioTitle: 'Kanban query execution time below 5 milliseconds',
          givenClause: 'Given 100,000 tasks stored in tasks table',
          whenClause: 'When executing SELECT by status and priority',
          thenClause: 'Then EXPLAIN plan confirms index scan with latency < 5ms',
        },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedMember = teamMembers.find((m) => m.id === assigneeId) || currentUser;
    const cleanTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const formattedAcs: AcceptanceCriterion[] = acceptanceCriteria
      .filter((ac) => ac.scenarioTitle.trim())
      .map((ac, idx) => ({
        id: `ac-${Date.now()}-${idx}`,
        ...ac,
        isVerified: false,
      }));

    createTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assignee: assignedMember,
      estimatedHours: Number(estimatedHours) || 0,
      dueDate,
      tags: cleanTags.length > 0 ? cleanTags : ['Engineering'],
      securityReviewed,
      acceptanceCriteria: formattedAcs,
      subtasks: [
        { id: `sub-${Date.now()}-1`, title: 'Review specification & edge cases', completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Implementation & unit tests', completed: false },
      ],
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create Engineering Task
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Define task metadata, priority, and formal Acceptance Criteria scenarios.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates Banner */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-slate-500 font-medium">Quick Spec Presets:</span>
          <button
            type="button"
            onClick={() => applyTemplate('security')}
            className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] cursor-pointer"
          >
            Security & JWT
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('api')}
            className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] cursor-pointer"
          >
            REST API
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('db')}
            className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-[11px] cursor-pointer"
          >
            MySQL Index
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              maxLength={255}
              placeholder="e.g. Implement JWT Bearer Authentication in Flask"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Specification & Engineering Notes
            </label>
            <textarea
              rows={3}
              placeholder="Describe technical implementation details, architectural boundaries, edge cases..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 3-Column Meta Row: Priority, Status, Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="P0">P0 - Critical (Blocker)</option>
                <option value="P1">P1 - High (Core Milestone)</option>
                <option value="P2">P2 - Medium (Standard)</option>
                <option value="P3">P3 - Low (Enhancement)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Workflow Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CODE_REVIEW">Code Review</option>
                <option value="QA_VERIFY">QA Verify</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3-Column Meta Row: Hours, Due Date, Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="Security, React, Flask"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Acceptance Criteria Builder Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Acceptance Criteria Scenarios
                </span>
                <p className="text-[11px] text-slate-400">
                  Required criteria verified prior to marking task Done.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddAc}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Scenario</span>
              </button>
            </div>

            <div className="space-y-3">
              {acceptanceCriteria.map((ac, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-slate-400">AC #{idx + 1}</span>
                    {acceptanceCriteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAc(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Scenario Title (e.g. Rejects empty task title with HTTP 400)"
                    value={ac.scenarioTitle}
                    onChange={(e) => handleUpdateAc(idx, 'scenarioTitle', e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white font-medium"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Given [preconditions]"
                      value={ac.givenClause}
                      onChange={(e) => handleUpdateAc(idx, 'givenClause', e.target.value)}
                      className="px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="When [action / trigger]"
                      value={ac.whenClause}
                      onChange={(e) => handleUpdateAc(idx, 'whenClause', e.target.value)}
                      className="px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Then [expected result]"
                      value={ac.thenClause}
                      onChange={(e) => handleUpdateAc(idx, 'thenClause', e.target.value)}
                      className="px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security sign-off checkbox */}
          <div className="pt-2 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              id="securityReviewed"
              checked={securityReviewed}
              onChange={(e) => setSecurityReviewed(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="securityReviewed" className="text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Reviewed for input validation, XSS sanitization, and JWT permissions</span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
