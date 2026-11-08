import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { TaskStatus, TaskPriority } from '../../types';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';

export const MetricsView: React.FC = () => {
  const { tasks, teamMembers } = useTasks();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter((t) => ['IN_PROGRESS', 'CODE_REVIEW', 'QA_VERIFY'].includes(t.status)).length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalEstimatedHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const totalActualHours = tasks.reduce((sum, t) => sum + t.actualHours, 0);

  const securityReviewedTasks = tasks.filter((t) => t.securityReviewed).length;
  const securityReviewRate = totalTasks > 0 ? Math.round((securityReviewedTasks / totalTasks) * 100) : 0;

  const totalACs = tasks.reduce((sum, t) => sum + t.acceptanceCriteria.length, 0);
  const verifiedACs = tasks.reduce(
    (sum, t) => sum + t.acceptanceCriteria.filter((ac) => ac.isVerified).length,
    0
  );
  const acRate = totalACs > 0 ? Math.round((verifiedACs / totalACs) * 100) : 100;

  // Status breakdown
  const statusCounts: Record<TaskStatus, number> = {
    BACKLOG: tasks.filter((t) => t.status === 'BACKLOG').length,
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    CODE_REVIEW: tasks.filter((t) => t.status === 'CODE_REVIEW').length,
    QA_VERIFY: tasks.filter((t) => t.status === 'QA_VERIFY').length,
    DONE: tasks.filter((t) => t.status === 'DONE').length,
  };

  // Priority breakdown
  const priorityCounts: Record<TaskPriority, number> = {
    P0: tasks.filter((t) => t.priority === 'P0').length,
    P1: tasks.filter((t) => t.priority === 'P1').length,
    P2: tasks.filter((t) => t.priority === 'P2').length,
    P3: tasks.filter((t) => t.priority === 'P3').length,
  };

  return (
    <div className="w-full space-y-6">
      {/* KPI Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Sprint Completion
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {completionRate}%
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-mono tabular-nums">
            {doneTasks} of {totalTasks} tasks completed
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Active Engineering Velocity
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
              {inProgressTasks} Tasks
            </span>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            In Progress, Code Review, or QA
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Logged vs Estimated Hours
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalActualHours}h / {totalEstimatedHours}h
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            {Math.round((totalActualHours / (totalEstimatedHours || 1)) * 100)}% burn efficiency
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Security & AC Compliance
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {acRate}%
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-mono tabular-nums">
            {verifiedACs}/{totalACs} ACs & {securityReviewRate}% Security audit
          </div>
        </div>
      </div>

      {/* Middle Row: Status Funnel & Priority Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workflow Status Funnel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Workflow Status Distribution
          </h3>
          <div className="space-y-3">
            {[
              { id: 'BACKLOG', label: 'Backlog', count: statusCounts.BACKLOG, color: 'bg-slate-400' },
              { id: 'TODO', label: 'To Do', count: statusCounts.TODO, color: 'bg-blue-500' },
              { id: 'IN_PROGRESS', label: 'In Progress', count: statusCounts.IN_PROGRESS, color: 'bg-indigo-500' },
              { id: 'CODE_REVIEW', label: 'Code Review', count: statusCounts.CODE_REVIEW, color: 'bg-purple-500' },
              { id: 'QA_VERIFY', label: 'QA Verify', count: statusCounts.QA_VERIFY, color: 'bg-amber-500' },
              { id: 'DONE', label: 'Done', count: statusCounts.DONE, color: 'bg-emerald-500' },
            ].map((item) => {
              const pct = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {item.count} tasks ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Matrix */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Priority Severity Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20">
              <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">P0 - Critical</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-rose-900 dark:text-rose-200 mt-1">
                {priorityCounts.P0}
              </div>
              <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Blocker / Security</div>
            </div>

            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">P1 - High</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-900 dark:text-amber-200 mt-1">
                {priorityCounts.P1}
              </div>
              <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">Core MVP Milestone</div>
            </div>

            <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">P2 - Medium</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-blue-900 dark:text-blue-200 mt-1">
                {priorityCounts.P2}
              </div>
              <div className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1">Standard Feature</div>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-400">P3 - Low</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-200 mt-1">
                {priorityCounts.P3}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Polish / Minor Enhancement</div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            P0 and P1 tasks require explicit code review and acceptance criteria verification prior to deployment.
          </div>
        </div>
      </div>

      {/* Team Member Workload Allocation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>Team Engineering Allocation</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teamMembers.map((member) => {
            const memberTasks = tasks.filter((t) => t.assignee.id === member.id);
            const memberHours = memberTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
            const memberDone = memberTasks.filter((t) => t.status === 'DONE').length;

            return (
              <div
                key={member.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-6 h-6 rounded-full ${member.avatarBg} text-white flex items-center justify-center text-xs font-semibold`}
                    >
                      {member.initials}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {member.role}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 font-mono tabular-nums text-slate-600 dark:text-slate-400 mt-3">
                    <div className="flex justify-between">
                      <span>Assigned Tasks:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{memberTasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{memberDone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Workload:</span>
                      <span>{memberHours} hrs</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
