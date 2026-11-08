import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { TaskStatus } from '../../types';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  badgeColor: string;
  description: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'BACKLOG',
    title: 'Backlog',
    badgeColor: 'bg-slate-500',
    description: 'Upcoming features and technical debt',
  },
  {
    id: 'TODO',
    title: 'To Do',
    badgeColor: 'bg-blue-500',
    description: 'Prioritized for current sprint',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    badgeColor: 'bg-indigo-500',
    description: 'Active engineer implementation',
  },
  {
    id: 'CODE_REVIEW',
    title: 'Code Review',
    badgeColor: 'bg-purple-500',
    description: 'Peer & security audit underway',
  },
  {
    id: 'QA_VERIFY',
    title: 'QA & Verify',
    badgeColor: 'bg-amber-500',
    description: 'AC scenario validation & PyTest',
  },
  {
    id: 'DONE',
    title: 'Done',
    badgeColor: 'bg-emerald-500',
    description: 'Verified & merged to production',
  },
];

export const KanbanBoard: React.FC = () => {
  const { filteredTasks, updateTaskStatus, setIsCreateModalOpen } = useTasks();
  const [activeDragColumn, setActiveDragColumn] = useState<TaskStatus | null>(null);

  const handleDragOver = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDragColumn !== columnId) {
      setActiveDragColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setActiveDragColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    setActiveDragColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTaskStatus(taskId, columnId);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div className="min-w-[1280px] grid grid-cols-6 gap-3.5 items-start">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isDragTarget = activeDragColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col bg-slate-100/70 dark:bg-slate-900/40 rounded-xl p-2.5 min-h-[580px] border transition-colors ${
                isDragTarget
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-inner'
                  : 'border-slate-200/80 dark:border-slate-800/80'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.badgeColor}`} />
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 tracking-tight">
                    {col.title}
                  </h3>
                  <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                    {colTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title={`Add task to ${col.title}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card List in Column */}
              <div className="flex-1 flex flex-col gap-2.5">
                {colTasks.map((task) => (
                  <KanbanCard key={task.id} task={task} />
                ))}

                {colTasks.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500">No tasks in {col.title.toLowerCase()}</p>
                    <p className="text-[11px] text-slate-400/80 dark:text-slate-600 mt-1">Drag cards here</p>
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
