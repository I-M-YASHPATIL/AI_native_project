import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TeamMember,
  AcceptanceCriterion,
  Subtask,
  AuditLogEntry,
  ActiveNavTab,
  TaskViewMode
} from '../types';
import { INITIAL_TASKS, SEED_TEAM_MEMBERS } from '../data/seedData';

interface TaskFilterState {
  search: string;
  status: TaskStatus | 'ALL';
  priority: TaskPriority | 'ALL';
  assigneeId: string | 'ALL';
  onlyUnverifiedAC: boolean;
}

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  currentUser: TeamMember;
  setCurrentUser: (user: TeamMember) => void;
  teamMembers: TeamMember[];
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  viewMode: TaskViewMode;
  setViewMode: (mode: TaskViewMode) => void;
  filters: TaskFilterState;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilterState>>;
  resetFilters: () => void;
  
  // Selection for batch actions
  selectedTaskIds: string[];
  toggleSelectTask: (taskId: string) => void;
  selectAllTasks: (taskIds: string[]) => void;
  clearSelection: () => void;

  // Modals & Panels
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  pendingDoneTask: { task: Task; pendingCount: number } | null;
  setPendingDoneTask: (val: { task: Task; pendingCount: number } | null) => void;

  // CRUD actions
  createTask: (data: Partial<Task>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus, bypassGuard?: boolean) => boolean;

  // AC actions
  toggleAcceptanceCriterion: (taskId: string, criterionId: string) => void;
  addAcceptanceCriterion: (taskId: string, criterion: Omit<AcceptanceCriterion, 'id' | 'isVerified'>) => void;
  deleteAcceptanceCriterion: (taskId: string, criterionId: string) => void;

  // Subtask actions
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // Batch actions
  batchUpdateStatus: (taskIds: string[], status: TaskStatus) => void;
  batchDelete: (taskIds: string[]) => void;

  // Data management
  resetToDemoData: () => void;
  exportDataToJson: () => void;
  importDataFromJson: (jsonStr: string) => boolean;

  // Theme
  isDark: boolean;
  toggleTheme: () => void;

  // Toast notifications
  toasts: ToastNotification[];
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'taskflow_tasks_v2';
const THEME_STORAGE_KEY = 'taskflow_theme';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_TASKS;
  });

  const [currentUser, setCurrentUser] = useState<TeamMember>(SEED_TEAM_MEMBERS[0]);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('tasks');
  const [viewMode, setViewMode] = useState<TaskViewMode>('kanban');

  const [filters, setFilters] = useState<TaskFilterState>({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    assigneeId: 'ALL',
    onlyUnverifiedAC: false,
  });

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [pendingDoneTask, setPendingDoneTask] = useState<{ task: Task; pendingCount: number } | null>(null);

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Dark mode setup
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  // Save tasks to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // storage full or disabled
    }
  }, [tasks]);

  // Toast manager
  const addToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status !== 'ALL' && task.status !== filters.status) return false;
      if (filters.priority !== 'ALL' && task.priority !== filters.priority) return false;
      if (filters.assigneeId !== 'ALL' && task.assignee.id !== filters.assigneeId) return false;
      if (filters.onlyUnverifiedAC) {
        const hasUnverified = task.acceptanceCriteria.some((ac) => !ac.isVerified);
        if (!hasUnverified) return false;
      }
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const inTitle = task.title.toLowerCase().includes(query);
        const inId = task.taskId.toLowerCase().includes(query);
        const inDesc = task.description.toLowerCase().includes(query);
        const inTags = task.tags.some((t) => t.toLowerCase().includes(query));
        const inAssignee = task.assignee.name.toLowerCase().includes(query);
        if (!inTitle && !inId && !inDesc && !inTags && !inAssignee) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'ALL',
      priority: 'ALL',
      assigneeId: 'ALL',
      onlyUnverifiedAC: false,
    });
  }, []);

  // Selection
  const toggleSelectTask = useCallback((taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  }, []);

  const selectAllTasks = useCallback((taskIds: string[]) => {
    setSelectedTaskIds(taskIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  // Task Mutations
  const createTask = useCallback((data: Partial<Task>): Task => {
    const nextNum = tasks.length + 101;
    const now = new Date().toISOString();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      taskId: `TASK-${nextNum}`,
      title: data.title?.trim() || 'Untitled Task',
      description: data.description?.trim() || '',
      status: data.status || 'TODO',
      priority: data.priority || 'P2',
      assignee: data.assignee || currentUser,
      reporter: currentUser,
      acceptanceCriteria: data.acceptanceCriteria || [],
      subtasks: data.subtasks || [],
      tags: data.tags || ['Feature'],
      estimatedHours: data.estimatedHours ?? 4,
      actualHours: data.actualHours ?? 0,
      dueDate: data.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now,
      securityReviewed: data.securityReviewed ?? false,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          author: currentUser.name,
          action: 'Created Task',
          details: `Created with priority ${data.priority || 'P2'} and status ${data.status || 'TODO'}`,
        },
      ],
    };

    setTasks((prev) => [newTask, ...prev]);
    addToast(`Created ${newTask.taskId}: "${newTask.title.slice(0, 30)}..."`, 'success');
    return newTask;
  }, [tasks.length, currentUser, addToast]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newLogs: AuditLogEntry[] = [...t.auditLogs];
        if (updates.status && updates.status !== t.status) {
          newLogs.push({
            id: `log-${Date.now()}`,
            timestamp: now,
            author: currentUser.name,
            action: 'Status Updated',
            details: `Changed from ${t.status} to ${updates.status}`,
          });
        }
        if (updates.priority && updates.priority !== t.priority) {
          newLogs.push({
            id: `log-${Date.now()}`,
            timestamp: now,
            author: currentUser.name,
            action: 'Priority Updated',
            details: `Changed from ${t.priority} to ${updates.priority}`,
          });
        }
        return {
          ...t,
          ...updates,
          updatedAt: now,
          auditLogs: newLogs,
        };
      })
    );
  }, [currentUser.name]);

  const updateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus, bypassGuard = false): boolean => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;

    // Quality Guard: Check Acceptance Criteria if moving to DONE
    if (newStatus === 'DONE' && !bypassGuard && task.acceptanceCriteria.length > 0) {
      const unverified = task.acceptanceCriteria.filter((ac) => !ac.isVerified);
      if (unverified.length > 0) {
        setPendingDoneTask({ task, pendingCount: unverified.length });
        return false;
      }
    }

    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const logDetail = bypassGuard
          ? `Status changed from ${t.status} to ${newStatus} (Admin QA Override approved)`
          : `Status changed from ${t.status} to ${newStatus}`;

        return {
          ...t,
          status: newStatus,
          updatedAt: now,
          auditLogs: [
            ...t.auditLogs,
            {
              id: `log-${Date.now()}`,
              timestamp: now,
              author: currentUser.name,
              action: 'Status Change',
              details: logDetail,
            },
          ],
        };
      })
    );

    addToast(`Updated ${task.taskId} status to ${newStatus}`, 'info');
    return true;
  }, [tasks, currentUser.name, addToast]);

  const deleteTask = useCallback((taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTaskIds((prev) => prev.filter((id) => id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    if (task) {
      addToast(`Deleted ${task.taskId}`, 'warning');
    }
  }, [tasks, selectedTaskId, addToast]);

  // Acceptance Criteria operations
  const toggleAcceptanceCriterion = useCallback((taskId: string, criterionId: string) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        let changedTitle = '';
        let wasVerified = false;
        const nextCriteria = t.acceptanceCriteria.map((ac) => {
          if (ac.id !== criterionId) return ac;
          changedTitle = ac.scenarioTitle;
          wasVerified = ac.isVerified;
          return {
            ...ac,
            isVerified: !ac.isVerified,
            reviewedBy: !ac.isVerified ? currentUser.name : undefined,
          };
        });

        const newLogs: AuditLogEntry[] = [
          ...t.auditLogs,
          {
            id: `log-${Date.now()}`,
            timestamp: now,
            author: currentUser.name,
            action: wasVerified ? 'AC Unverified' : 'AC Verified & Signed Off',
            details: `Scenario "${changedTitle}" marked as ${wasVerified ? 'Pending' : 'Verified'}`,
          },
        ];

        return {
          ...t,
          acceptanceCriteria: nextCriteria,
          updatedAt: now,
          auditLogs: newLogs,
        };
      })
    );
    addToast('Acceptance criterion status updated', 'success');
  }, [currentUser.name, addToast]);

  const addAcceptanceCriterion = useCallback((taskId: string, criterion: Omit<AcceptanceCriterion, 'id' | 'isVerified'>) => {
    const now = new Date().toISOString();
    const newAc: AcceptanceCriterion = {
      id: `ac-${Date.now()}`,
      ...criterion,
      isVerified: false,
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          acceptanceCriteria: [...t.acceptanceCriteria, newAc],
          updatedAt: now,
          auditLogs: [
            ...t.auditLogs,
            {
              id: `log-${Date.now()}`,
              timestamp: now,
              author: currentUser.name,
              action: 'Added Acceptance Criteria',
              details: `Added scenario: "${criterion.scenarioTitle}"`,
            },
          ],
        };
      })
    );
    addToast('New acceptance criterion attached to task', 'info');
  }, [currentUser.name, addToast]);

  const deleteAcceptanceCriterion = useCallback((taskId: string, criterionId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          acceptanceCriteria: t.acceptanceCriteria.filter((ac) => ac.id !== criterionId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Subtask operations
  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st)),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    if (!title.trim()) return;
    const newSubtask: Subtask = {
      id: `sub-${Date.now()}`,
      title: title.trim(),
      completed: false,
    };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: [...t.subtasks, newSubtask],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Batch actions
  const batchUpdateStatus = useCallback((taskIds: string[], status: TaskStatus) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (!taskIds.includes(t.id)) return t;
        return {
          ...t,
          status,
          updatedAt: now,
          auditLogs: [
            ...t.auditLogs,
            {
              id: `log-${Date.now()}`,
              timestamp: now,
              author: currentUser.name,
              action: 'Batch Status Update',
              details: `Batch moved to ${status}`,
            },
          ],
        };
      })
    );
    setSelectedTaskIds([]);
    addToast(`Batch updated ${taskIds.length} tasks to ${status}`, 'success');
  }, [currentUser.name, addToast]);

  const batchDelete = useCallback((taskIds: string[]) => {
    setTasks((prev) => prev.filter((t) => !taskIds.includes(t.id)));
    setSelectedTaskIds([]);
    addToast(`Deleted ${taskIds.length} tasks`, 'warning');
  }, [addToast]);

  // Data reset & export
  const resetToDemoData = useCallback(() => {
    setTasks(INITIAL_TASKS);
    setSelectedTaskIds([]);
    setSelectedTaskId(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }
    addToast('Reset workspace to initial demo tasks & test data', 'info');
  }, [addToast]);

  const exportDataToJson = useCallback(() => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskflow-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Exported tasks to JSON file', 'success');
  }, [tasks, addToast]);

  const importDataFromJson = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].taskId) {
        setTasks(parsed);
        addToast(`Successfully imported ${parsed.length} tasks`, 'success');
        return true;
      }
      throw new Error('Invalid JSON format for tasks');
    } catch {
      addToast('Failed to import JSON: Invalid task schema format', 'error');
      return false;
    }
  }, [addToast]);

  const value = {
    tasks,
    filteredTasks,
    currentUser,
    setCurrentUser,
    teamMembers: SEED_TEAM_MEMBERS,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    resetFilters,
    selectedTaskIds,
    toggleSelectTask,
    selectAllTasks,
    clearSelection,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedTaskId,
    setSelectedTaskId,
    pendingDoneTask,
    setPendingDoneTask,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    toggleAcceptanceCriterion,
    addAcceptanceCriterion,
    deleteAcceptanceCriterion,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    batchUpdateStatus,
    batchDelete,
    resetToDemoData,
    exportDataToJson,
    importDataFromJson,
    isDark,
    toggleTheme,
    toasts,
    addToast,
    removeToast,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
