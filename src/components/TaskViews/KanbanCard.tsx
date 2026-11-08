import React from 'react';
import { Task, TaskStatus } from '../../types';
import { useTasks } from '../../context/TaskContext';
import {
  ShieldCheck,
  CheckSquare,
  Clock,
  ArrowRight,
  MoreVertical,
  AlertCircle
} from 'lucide-react';

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task }) => {
  const { setSelectedTaskId, updateTaskStatus } = useTasks();
  const [showMoveMenu, setShowMoveMenu] = React.useState(false);

  // Status progression definitions
  const statusColumns: { id: TaskStatus; label: string }[] = [
    { id: 'BACKLOG', label: 'Backlog' },
    { id: 'TODO', label: 'To Do' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'CODE_REVIEW', label: 'Code Review' },
    { id: 'QA_VERIFY', label: 'QA Verify' },
    { id: 'DONE', label: 'Done' },
  ];

  const totalAC = task.acceptanceCriteria.length;
  const verifiedAC = task.acceptanceCriteria.filter((ac) => ac.isVerified).length;
  const acPercentage = totalAC > 0 ? Math.round((verifiedAC / totalAC) * 100) : 100;
  const hasUnverifiedAC = verifiedAC < totalAC;

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

  const priorityColor = {
    P0: 'text-rose-600 dark:text-rose-400 font-semibold',
    P1: 'text-amber-600 dark:text-amber-400 font-semibold',
    P2: 'text-blue-600 dark:text-blue-400',
    P3: 'text-slate-500 dark:text-slate-400',
  }[task.priority];

  // Drag start handler for native drag-and-drop
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => setSelectedTaskId(task.id)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition-all cursor-pointer select-none"
    >
      {/* Top line: Task ID and Actions */}
      <div className="flex items-center justify-between gap-2 text-xs mb-2">
        <div className="flex items-center gap-1.5 font-mono text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-slate-200">{task.taskId}</span>
          <span aria-hidden="true">·</span>
          <span className={priorityColor}>{task.priority}</span>
        </div>

        <div className="flex items-center gap-1 relative" onClick={(e) => e.stopPropagation()}>
          {task.securityReviewed && (
            <span
              title="Code reviewed for input validation & JWT security by Yash Patil"
              className="text-emerald-600 dark:text-emerald-400"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          )}

          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
            title="Move to another status column"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {/* Quick status relocation popover */}
          {showMoveMenu && (
            <div className="absolute right-0 top-6 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1">
              <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Move to status
              </div>
              {statusColumns.map((col) => (
                <button
                  key={col.id}
                  disabled={col.id === task.status}
                  onClick={() => {
                    updateTaskStatus(task.id, col.id);
                    setShowMoveMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    col.id === task.status
                      ? 'text-slate-400 bg-slate-50 dark:bg-slate-800/50 cursor-default'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  <span>{col.label}</span>
                  {col.id === task.status ? (
                    <span className="text-[10px] text-slate-400">Current</span>
                  ) : (
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h4>

      {/* Acceptance Criteria progress bar & indicator */}
      {totalAC > 0 && (
        <div className="mb-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <CheckSquare className="w-3 h-3 text-slate-400" />
              <span>AC Acceptance</span>
            </span>
            <span
              className={`font-mono tabular-nums text-xs font-medium ${
                hasUnverifiedAC
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {verifiedAC}/{totalAC} ({acPercentage}%)
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                hasUnverifiedAC ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${acPercentage}%` }}
            />
          </div>

          {hasUnverifiedAC && task.status === 'QA_VERIFY' && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>Pending verification before Done</span>
            </div>
          )}
        </div>
      )}

      {/* Subtasks summary if any */}
      {totalSubtasks > 0 && (
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
          <span>Subtasks:</span>
          <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
            {completedSubtasks}/{totalSubtasks}
          </span>
        </div>
      )}

      {/* Bottom metadata row: Assignee, Hours, Due date */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-5 h-5 rounded-full ${task.assignee.avatarBg} text-white flex items-center justify-center text-[10px] font-semibold`}
            title={`Assigned to ${task.assignee.name} (${task.assignee.role})`}
          >
            {task.assignee.initials}
          </span>
          <span className="truncate max-w-[90px]">{task.assignee.name.split(' ')[0]}</span>
        </div>

        <div className="flex items-center gap-2 font-mono tabular-nums">
          <span className="flex items-center gap-0.5 text-slate-600 dark:text-slate-400" title="Estimated hours">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{task.estimatedHours}h</span>
          </span>
          {task.actualHours > 0 && (
            <span className="text-slate-400 text-[11px]" title="Actual hours logged">
              ({task.actualHours}h)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
