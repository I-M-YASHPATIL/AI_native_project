export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'CODE_REVIEW' | 'QA_VERIFY' | 'DONE';

export interface AcceptanceCriterion {
  id: string;
  scenarioTitle: string; // e.g. "Given valid JWT and task payload"
  givenClause: string;
  whenClause: string;
  thenClause: string;
  isVerified: boolean;
  reviewedBy?: string;
  edgeCaseNote?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  details: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
  initials: string;
  email: string;
}

export interface Task {
  id: string;
  taskId: string; // e.g. "TASK-101"
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: TeamMember;
  reporter: TeamMember;
  acceptanceCriteria: AcceptanceCriterion[];
  subtasks: Subtask[];
  tags: string[];
  estimatedHours: number;
  actualHours: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  securityReviewed: boolean;
  auditLogs: AuditLogEntry[];
}

export type ActiveNavTab = 'tasks' | 'matrix' | 'analytics' | 'spec' | 'api-db' | 'pytest-azure';
export type TaskViewMode = 'kanban' | 'list';

export interface ApiEndpointDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requiresAuth: boolean;
  requiredRole?: string;
  sampleRequestBody?: Record<string, unknown>;
  expectedResponseStatus: number;
  sampleResponseBody: Record<string, unknown>;
}

export interface MySqlTableColumn {
  name: string;
  type: string;
  nullable: boolean;
  key: 'PRI' | 'UNI' | 'MUL' | '';
  defaultValue?: string;
  extra?: string;
}

export interface MySqlTableDefinition {
  tableName: string;
  description: string;
  engine: string;
  columns: MySqlTableColumn[];
}

export interface PyTestCase {
  id: string;
  module: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'running' | 'idle';
  durationMs: number;
  category: 'unit' | 'edge_case' | 'security' | 'integration';
  assertions: string[];
  failureMessage?: string;
}
