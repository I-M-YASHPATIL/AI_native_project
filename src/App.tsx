import React, { useEffect, useState } from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Header } from './components/Header';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import { KanbanBoard } from './components/TaskViews/KanbanBoard';
import { TaskListView } from './components/TaskViews/TaskListView';
import { AcceptanceCriteriaMatrix } from './components/TaskViews/AcceptanceCriteriaMatrix';
import { MetricsView } from './components/TaskViews/MetricsView';
import { SpecViewer } from './components/EngineeringHub/SpecViewer';
import { FlaskApiPlayground } from './components/EngineeringHub/FlaskApiPlayground';
import { MySqlSchemaExplorer } from './components/EngineeringHub/MySqlSchemaExplorer';
import { PyTestRunner } from './components/EngineeringHub/PyTestRunner';
import { CreateTaskModal } from './components/Modals/CreateTaskModal';
import { TaskDetailModal } from './components/Modals/TaskDetailModal';
import { AcGuardModal } from './components/Modals/AcGuardModal';
import { ToastContainer } from './components/ToastContainer';
import { Code2, Database } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    viewMode,
    setIsCreateModalOpen,
    setSelectedTaskId,
    selectedTaskId,
    isCreateModalOpen,
    pendingDoneTask,
  } = useTasks();

  const [apiDbSubTab, setApiDbSubTab] = useState<'api' | 'mysql'>('api');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsCreateModalOpen(true);
      } else if (e.key === '1') {
        setActiveTab('tasks');
      } else if (e.key === '2') {
        setActiveTab('matrix');
      } else if (e.key === '3') {
        setActiveTab('analytics');
      } else if (e.key === '4') {
        setActiveTab('spec');
      } else if (e.key === '5') {
        setActiveTab('api-db');
      } else if (e.key === '6') {
        setActiveTab('pytest-azure');
      } else if (e.key === 'Escape') {
        if (isCreateModalOpen) setIsCreateModalOpen(false);
        if (selectedTaskId) setSelectedTaskId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateModalOpen, selectedTaskId, setIsCreateModalOpen, setSelectedTaskId, setActiveTab]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Sub Header / Control Toolbar */}
      <WorkspaceToolbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Tasks (Kanban vs Table) */}
        {activeTab === 'tasks' && (
          <div>
            {viewMode === 'kanban' ? <KanbanBoard /> : <TaskListView />}
          </div>
        )}

        {/* Tab 2: Acceptance Criteria Matrix */}
        {activeTab === 'matrix' && <AcceptanceCriteriaMatrix />}

        {/* Tab 3: Metrics & Velocity */}
        {activeTab === 'analytics' && <MetricsView />}

        {/* Tab 4: Engineering Spec & Agent Directives */}
        {activeTab === 'spec' && <SpecViewer />}

        {/* Tab 5: Flask REST API & MySQL Explorer */}
        {activeTab === 'api-db' && (
          <div className="space-y-6">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setApiDbSubTab('api')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  apiDbSubTab === 'api'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Flask REST & JWT Sandbox</span>
              </button>
              <button
                onClick={() => setApiDbSubTab('mysql')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  apiDbSubTab === 'mysql'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>MySQL Schema & SQL Console</span>
              </button>
            </div>

            {apiDbSubTab === 'api' ? <FlaskApiPlayground /> : <MySqlSchemaExplorer />}
          </div>
        )}

        {/* Tab 6: PyTest Runner & Azure Telemetry */}
        {activeTab === 'pytest-azure' && <PyTestRunner />}
      </main>

      {/* Footer strictly minimal and anti-slop */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 mt-auto text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">TaskFlow Spec & Engineering Suite</span>
            <span aria-hidden="true">·</span>
            <span>React.js + Flask REST on MySQL 8.0</span>
            <span aria-hidden="true">·</span>
            <span>Deployed on Azure</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Reviewed by Yash Patil</span>
            <span aria-hidden="true">·</span>
            <span>Hotkeys: <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">N</kbd> New Task, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">1-6</kbd> Switch Tab</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <CreateTaskModal />
      <TaskDetailModal />
      <AcGuardModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}
