import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  AlertTriangle,
  FileCheck2,
  Search
} from 'lucide-react';

export const AcceptanceCriteriaMatrix: React.FC = () => {
  const { tasks, toggleAcceptanceCriterion, addAcceptanceCriterion, currentUser, setSelectedTaskId } = useTasks();
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingTaskId, setAddingTaskId] = useState<string | null>(null);

  // New criterion form state
  const [newTitle, setNewTitle] = useState('');
  const [newGiven, setNewGiven] = useState('');
  const [newWhen, setNewWhen] = useState('');
  const [newThen, setNewThen] = useState('');
  const [newEdgeCase, setNewEdgeCase] = useState('');

  // Calculations
  const allCriteria = tasks.flatMap((t) =>
    t.acceptanceCriteria.map((ac) => ({ ...ac, task: t }))
  );

  const totalCount = allCriteria.length;
  const verifiedCount = allCriteria.filter((c) => c.isVerified).length;
  const pendingCount = totalCount - verifiedCount;
  const passRate = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 100;

  const handleCreateCriterion = (taskId: string) => {
    if (!newTitle.trim() || !newGiven.trim()) return;
    addAcceptanceCriterion(taskId, {
      scenarioTitle: newTitle.trim(),
      givenClause: newGiven.trim(),
      whenClause: newWhen.trim() || 'When invoked',
      thenClause: newThen.trim() || 'Then satisfies invariant',
      edgeCaseNote: newEdgeCase.trim() || undefined,
    });
    setAddingTaskId(null);
    setNewTitle('');
    setNewGiven('');
    setNewWhen('');
    setNewThen('');
    setNewEdgeCase('');
  };

  const filteredTasks = tasks.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTask = t.title.toLowerCase().includes(q) || t.taskId.toLowerCase().includes(q);
      const matchAC = t.acceptanceCriteria.some(
        (ac) =>
          ac.scenarioTitle.toLowerCase().includes(q) ||
          ac.givenClause.toLowerCase().includes(q) ||
          (ac.edgeCaseNote && ac.edgeCaseNote.toLowerCase().includes(q))
      );
      if (!matchTask && !matchAC) return false;
    }
    if (filterMode === 'pending') {
      return t.acceptanceCriteria.some((ac) => !ac.isVerified);
    }
    if (filterMode === 'verified') {
      return t.acceptanceCriteria.every((ac) => ac.isVerified) && t.acceptanceCriteria.length > 0;
    }
    return true;
  });

  return (
    <div className="w-full space-y-6">
      {/* Top Section: Audit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Total Scenarios Defined
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalCount}
            </span>
            <FileCheck2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            Across {tasks.length} active project tasks
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Verified & Signed Off
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {verifiedCount}
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            Audited for correctness & security
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Pending QA Verification
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {pendingCount}
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            Blocks transition to DONE status
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            AC Fulfillment Rate
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {passRate}%
            </span>
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${passRate}%` }} />
          </div>
        </div>
      </div>

      {/* Control Strip: Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterMode === 'pending'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Has Pending AC ({tasks.filter((t) => t.acceptanceCriteria.some((ac) => !ac.isVerified)).length})
          </button>
          <button
            onClick={() => setFilterMode('verified')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterMode === 'verified'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fully Verified ({tasks.filter((t) => t.acceptanceCriteria.every((ac) => ac.isVerified) && t.acceptanceCriteria.length > 0).length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search scenario or edge case..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Grouped Criteria Cards */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const totalTaskAC = task.acceptanceCriteria.length;
          const verifiedTaskAC = task.acceptanceCriteria.filter((ac) => ac.isVerified).length;
          const allVerified = totalTaskAC > 0 && verifiedTaskAC === totalTaskAC;

          return (
            <div
              key={task.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs"
            >
              {/* Task Header in Matrix */}
              <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    onClick={() => setSelectedTaskId(task.id)}
                    className="font-mono text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    {task.taskId}
                  </span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <h4
                    onClick={() => setSelectedTaskId(task.id)}
                    className="text-xs font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    {task.title}
                  </h4>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Status: {task.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono text-xs font-medium tabular-nums ${
                      allVerified
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {verifiedTaskAC}/{totalTaskAC} AC Verified
                  </span>

                  <button
                    onClick={() => setAddingTaskId(addingTaskId === task.id ? null : task.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add AC</span>
                  </button>
                </div>
              </div>

              {/* Inline Add AC Form */}
              {addingTaskId === task.id && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Append Acceptance Criteria Scenario to {task.taskId}
                  </div>
                  <input
                    type="text"
                    placeholder="Scenario Title (e.g. Reject negative hour values with HTTP 422)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Given [initial state / preconditions]"
                      value={newGiven}
                      onChange={(e) => setNewGiven(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="When [action / endpoint execution]"
                      value={newWhen}
                      onChange={(e) => setNewWhen(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Then [expected result / HTTP status]"
                      value={newThen}
                      onChange={(e) => setNewThen(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Edge Case / Security Note (Optional)"
                    value={newEdgeCase}
                    onChange={(e) => setNewEdgeCase(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setAddingTaskId(null)}
                      className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleCreateCriterion(task.id)}
                      className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer"
                    >
                      Save Criterion
                    </button>
                  </div>
                </div>
              )}

              {/* Criteria List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {task.acceptanceCriteria.map((ac, idx) => (
                  <div
                    key={ac.id}
                    className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400">AC-{idx + 1}</span>
                        <h5 className="text-xs font-semibold text-slate-900 dark:text-white">
                          {ac.scenarioTitle}
                        </h5>
                      </div>

                      {/* Gherkin clauses */}
                      <div className="bg-slate-50 dark:bg-slate-950/60 rounded-lg p-2.5 font-mono text-[11px] space-y-1 border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300">
                        <div>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">GIVEN </span>
                          {ac.givenClause.replace(/^Given\s+/i, '')}
                        </div>
                        <div>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">WHEN </span>
                          {ac.whenClause.replace(/^When\s+/i, '')}
                        </div>
                        <div>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">THEN </span>
                          {ac.thenClause.replace(/^Then\s+/i, '')}
                        </div>
                      </div>

                      {ac.edgeCaseNote && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 italic">
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>Edge Case Note: {ac.edgeCaseNote}</span>
                        </div>
                      )}
                    </div>

                    {/* Verification Action */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <div className="text-right text-[11px]">
                        {ac.isVerified ? (
                          <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Verified by {ac.reviewedBy || currentUser.name}
                          </div>
                        ) : (
                          <div className="text-amber-600 dark:text-amber-400 font-medium">
                            Pending Sign-off
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => toggleAcceptanceCriterion(task.id, ac.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                          ac.isVerified
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {ac.isVerified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Verify AC</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {task.acceptanceCriteria.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    No acceptance criteria defined for this task yet.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
