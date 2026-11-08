import React from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskStatus, TaskPriority } from '../types';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Sun,
  Moon,
  RotateCcw,
  Download,
  Upload,
  CheckSquare,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const WorkspaceToolbar: React.FC = () => {
  const {
    activeTab,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    resetFilters,
    currentUser,
    setCurrentUser,
    teamMembers,
    isDark,
    toggleTheme,
    resetToDemoData,
    exportDataToJson,
    importDataFromJson,
    tasks,
  } = useTasks();

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataFromJson(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const isFiltered =
    filters.search !== '' ||
    filters.status !== 'ALL' ||
    filters.priority !== 'ALL' ||
    filters.assigneeId !== 'ALL' ||
    filters.onlyUnverifiedAC;

  // Compute quick counters
  const totalACs = tasks.reduce((sum, t) => sum + t.acceptanceCriteria.length, 0);
  const verifiedACs = tasks.reduce(
    (sum, t) => sum + t.acceptanceCriteria.filter((ac) => ac.isVerified).length,
    0
  );
  const acPercentage = totalACs > 0 ? Math.round((verifiedACs / totalACs) * 100) : 100;

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top line of toolbar: Section Title & Utility Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">Workspace</span>
              <span aria-hidden="true">/</span>
              <span>Azure East US</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                {tasks.length} Tasks
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                {verifiedACs}/{totalACs} AC ({acPercentage}%)
              </span>
            </div>
          </div>

          {/* Right utility toolbar: User selector & Theme toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* User switcher */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="hidden sm:inline text-slate-500 dark:text-slate-400">Reviewer:</span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const found = teamMembers.find((m) => m.id === e.target.value);
                  if (found) setCurrentUser(found);
                }}
                className="bg-transparent font-medium text-slate-900 dark:text-white focus:outline-none cursor-pointer text-xs"
                title="Switch active session persona"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id} className="dark:bg-slate-900 dark:text-white">
                    {m.name} ({m.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Export & Import actions */}
            <button
              onClick={exportDataToJson}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
              title="Export tasks to JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
              title="Import tasks from JSON"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Reset button */}
            <button
              onClick={resetToDemoData}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
              title="Reset to initial seed tasks & test data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Lower row: Only show filter controls when on 'tasks' or 'matrix' view */}
        {(activeTab === 'tasks' || activeTab === 'matrix') && (
          <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* View Switcher: Kanban vs Table */}
              {activeTab === 'tasks' && (
                <div className="flex items-center gap-0.5 p-0.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      viewMode === 'kanban'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Kanban</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                </div>
              )}

              {/* Live search input */}
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tasks, IDs, tags..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-8 pr-3 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Status filter */}
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value as TaskStatus | 'ALL' }))
                }
                className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CODE_REVIEW">Code Review</option>
                <option value="QA_VERIFY">QA Verify</option>
                <option value="DONE">Done</option>
              </select>

              {/* Priority filter */}
              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, priority: e.target.value as TaskPriority | 'ALL' }))
                }
                className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="P0">P0 - Critical</option>
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Medium</option>
                <option value="P3">P3 - Low</option>
              </select>

              {/* Assignee filter */}
              <select
                value={filters.assigneeId}
                onChange={(e) => setFilters((prev) => ({ ...prev, assigneeId: e.target.value }))}
                className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Assignees</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              {/* Filter unverified AC */}
              <button
                onClick={() =>
                  setFilters((prev) => ({ ...prev, onlyUnverifiedAC: !prev.onlyUnverifiedAC }))
                }
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  filters.onlyUnverifiedAC
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CheckSquare className="w-3 h-3" />
                <span>Pending ACs only</span>
              </button>

              {/* Clear filters button */}
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium ml-1"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
