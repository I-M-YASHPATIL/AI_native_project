import React from 'react';
import { useTasks } from '../context/TaskContext';
import { ActiveNavTab } from '../types';
import { Plus } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, setIsCreateModalOpen } = useTasks();

  const navItems: { id: ActiveNavTab; label: string }[] = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'matrix', label: 'AC Matrix' },
    { id: 'analytics', label: 'Metrics' },
    { id: 'spec', label: 'Spec & Directives' },
    { id: 'api-db', label: 'Flask & MySQL' },
    { id: 'pytest-azure', label: 'PyTest & Azure' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
          >
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              TF
            </span>
            <span>TaskFlow</span>
          </button>
        </div>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer relative ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
