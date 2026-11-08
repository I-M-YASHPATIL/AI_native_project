import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { AlertTriangle, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export const AcGuardModal: React.FC = () => {
  const {
    pendingDoneTask,
    setPendingDoneTask,
    updateTaskStatus,
    setSelectedTaskId,
  } = useTasks();

  if (!pendingDoneTask) return null;

  const { task, pendingCount } = pendingDoneTask;

  const handleOverride = () => {
    updateTaskStatus(task.id, 'DONE', true);
    setPendingDoneTask(null);
  };

  const handleReview = () => {
    setPendingDoneTask(null);
    setSelectedTaskId(task.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
        <button
          onClick={() => setPendingDoneTask(null)}
          className="absolute right-3 top-3 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Quality Gate: Unverified Criteria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{task.taskId}</span> has{' '}
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {pendingCount} unverified Acceptance Criteria
              </span>. The engineering spec requires all scenarios to be verified before transition to <span className="font-semibold text-emerald-600">DONE</span>.
            </p>
          </div>
        </div>

        {/* Pending AC Scenarios preview */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Pending Scenarios:
          </div>
          {task.acceptanceCriteria
            .filter((ac) => !ac.isVerified)
            .map((ac) => (
              <div key={ac.id} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="truncate">{ac.scenarioTitle}</span>
              </div>
            ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <button
            onClick={() => setPendingDoneTask(null)}
            className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleReview}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Review & Verify AC</span>
          </button>

          <button
            onClick={handleOverride}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Admin QA Override</span>
          </button>
        </div>
      </div>
    </div>
  );
};
