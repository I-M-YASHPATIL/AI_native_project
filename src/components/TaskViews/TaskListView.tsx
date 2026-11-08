import React, { useState, useMemo } from 'react';
import { useTasks } from '../../context/TaskContext';
import { Task, TaskStatus, TaskPriority } from '../../types';
import {
  ArrowUpDown,
  ShieldCheck,
  CheckSquare,
  Clock,
  Trash2,
  CheckCircle,
  X
} from 'lucide-react';

type SortColumn = 'taskId' | 'title' | 'status' | 'priority' | 'acProgress' | 'hours' | 'dueDate';
type SortDirection = 'asc' | 'desc';

export const TaskListView: React.FC = () => {
  const {
    filteredTasks,
    selectedTaskIds,
    toggleSelectTask,
    selectAllTasks,
    clearSelection,
    setSelectedTaskId,
    updateTaskStatus,
    batchUpdateStatus,
    batchDelete,
  } = useTasks();

  const [sortCol, setSortCol] = useState<SortColumn>('taskId');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortCol === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(column);
      setSortDir('asc');
    }
  };

  const priorityWeight: Record<TaskPriority, number> = {
    P0: 0,
    P1: 1,
    P2: 2,
    P3: 3,
  };

  const statusWeight: Record<TaskStatus, number> = {
    BACKLOG: 0,
    TODO: 1,
    IN_PROGRESS: 2,
    CODE_REVIEW: 3,
    QA_VERIFY: 4,
    DONE: 5,
  };

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let cmp = 0;
      switch (sortCol) {
        case 'taskId':
          cmp = a.taskId.localeCompare(b.taskId);
          break;
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'status':
          cmp = statusWeight[a.status] - statusWeight[b.status];
          break;
        case 'priority':
          cmp = priorityWeight[a.priority] - priorityWeight[b.priority];
          break;
        case 'hours':
          cmp = a.estimatedHours - b.estimatedHours;
          break;
        case 'dueDate':
          cmp = a.dueDate.localeCompare(b.dueDate);
          break;
        case 'acProgress': {
          const aRate = a.acceptanceCriteria.length > 0
            ? a.acceptanceCriteria.filter((ac) => ac.isVerified).length / a.acceptanceCriteria.length
            : 1;
          const bRate = b.acceptanceCriteria.length > 0
            ? b.acceptanceCriteria.filter((ac) => ac.isVerified).length / b.acceptanceCriteria.length
            : 1;
          cmp = aRate - bRate;
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredTasks, sortCol, sortDir]);

  const allSelected =
    sortedTasks.length > 0 && sortedTasks.every((t) => selectedTaskIds.includes(t.id));

  const handleSelectAllToggle = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllTasks(sortedTasks.map((t) => t.id));
    }
  };

  const statusLabels: Record<TaskStatus, string> = {
    BACKLOG: 'Backlog',
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    CODE_REVIEW: 'Code Review',
    QA_VERIFY: 'QA Verify',
    DONE: 'Done',
  };

  return (
    <div className="w-full relative">
      {/* Batch Action Floating Drawer */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-900 text-white dark:bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center font-mono tabular-nums text-[11px]">
              {selectedTaskIds.length}
            </span>
            <span>Selected</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => batchUpdateStatus(selectedTaskIds, 'DONE')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>

            <button
              onClick={() => batchUpdateStatus(selectedTaskIds, 'IN_PROGRESS')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer"
            >
              <span>Move In Progress</span>
            </button>

            <button
              onClick={() => batchDelete(selectedTaskIds)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-rose-600 hover:bg-rose-700 rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <button
            onClick={clearSelection}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition-colors ml-1 cursor-pointer"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main High-Density Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold select-none">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAllToggle}
                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                    aria-label="Select all tasks"
                  />
                </th>
                <th
                  onClick={() => handleSort('taskId')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Task ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('title')}
                  className="py-2.5 px-3 min-w-[280px] cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Title & Acceptance Criteria</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('priority')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('acProgress')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>AC Progress</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Assignee</th>
                <th
                  onClick={() => handleSort('hours')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Hours</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dueDate')}
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Due Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {sortedTasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                const totalAC = task.acceptanceCriteria.length;
                const verifiedAC = task.acceptanceCriteria.filter((ac) => ac.isVerified).length;
                const acRate = totalAC > 0 ? Math.round((verifiedAC / totalAC) * 100) : 100;

                const priorityColor = {
                  P0: 'text-rose-600 dark:text-rose-400 font-semibold',
                  P1: 'text-amber-600 dark:text-amber-400 font-semibold',
                  P2: 'text-blue-600 dark:text-blue-400',
                  P3: 'text-slate-500 dark:text-slate-400',
                }[task.priority];

                return (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`h-11 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                      isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectTask(task.id)}
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                        aria-label={`Select task ${task.taskId}`}
                      />
                    </td>

                    <td className="py-2 px-3 font-mono font-medium text-slate-900 dark:text-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{task.taskId}</span>
                        {task.securityReviewed && (
                          <span title="Reviewed for JWT & input sanitization">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">
                      <div className="truncate max-w-[340px]">{task.title}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{task.tags.slice(0, 3).join(', ')}</span>
                        {task.subtasks.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap font-mono">
                      <span className={priorityColor}>{task.priority}</span>
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap">
                      {totalAC > 0 ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono tabular-nums text-xs font-medium ${
                              verifiedAC < totalAC
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {verifiedAC}/{totalAC} ({acRate}%)
                          </span>
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${verifiedAC < totalAC ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${acRate}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">No AC</span>
                      )}
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-5 h-5 rounded-full ${task.assignee.avatarBg} text-white flex items-center justify-center text-[10px] font-semibold`}
                        >
                          {task.assignee.initials}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[90px]">
                          {task.assignee.name.split(' ')[0]}
                        </span>
                      </div>
                    </td>

                    <td className="py-2 px-3 text-right whitespace-nowrap font-mono tabular-nums text-slate-600 dark:text-slate-400">
                      <span>{task.estimatedHours}h</span>
                      {task.actualHours > 0 && (
                        <span className="text-slate-400 text-[11px] ml-1">({task.actualHours}h)</span>
                      )}
                    </td>

                    <td className="py-2 px-3 whitespace-nowrap font-mono tabular-nums text-slate-500 dark:text-slate-400 text-[11px]">
                      {task.dueDate}
                    </td>
                  </tr>
                );
              })}

              {sortedTasks.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                    No tasks match the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
