import {
  Task,
  TeamMember,
  ApiEndpointDefinition,
  MySqlTableDefinition,
  PyTestCase
} from '../types';

export const SEED_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'user-1',
    name: 'Yash Patil',
    role: 'Lead Architect & Reviewer',
    avatarBg: 'bg-indigo-600',
    initials: 'YP',
    email: 'patilyashv166@gmail.com',
  },
  {
    id: 'user-2',
    name: 'Alex Rivera',
    role: 'Frontend Engineer (React)',
    avatarBg: 'bg-emerald-600',
    initials: 'AR',
    email: 'alex.rivera@engineering.internal',
  },
  {
    id: 'user-3',
    name: 'Maya Chen',
    role: 'Backend Engineer (Flask/MySQL)',
    avatarBg: 'bg-amber-600',
    initials: 'MC',
    email: 'maya.chen@engineering.internal',
  },
  {
    id: 'user-4',
    name: 'Jordan Taylor',
    role: 'Security & QA Automation',
    avatarBg: 'bg-rose-600',
    initials: 'JT',
    email: 'jordan.taylor@engineering.internal',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    taskId: 'TASK-101',
    title: 'Implement JWT Authentication & Bearer Header Validation in Flask',
    description: 'Construct secure stateless token authentication for the Flask REST API. Enforce RS256 token verification, claims validation (iss, aud, exp), and role-based permissions (admin, engineer, qa) on protected task mutation routes.',
    status: 'DONE',
    priority: 'P0',
    assignee: SEED_TEAM_MEMBERS[2], // Maya
    reporter: SEED_TEAM_MEMBERS[0], // Yash
    tags: ['Security', 'Flask', 'JWT', 'Backend'],
    estimatedHours: 8,
    actualHours: 6.5,
    dueDate: '2026-11-10',
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-04T16:30:00Z',
    securityReviewed: true,
    acceptanceCriteria: [
      {
        id: 'ac-101-1',
        scenarioTitle: 'Valid JWT with non-expired timestamp',
        givenClause: 'Given an HTTP request with Authorization: Bearer <valid_jwt>',
        whenClause: 'When the endpoint parses token claims',
        thenClause: 'Then request context attaches user_id and role with HTTP 200/201 response',
        isVerified: true,
        reviewedBy: 'Yash Patil',
        edgeCaseNote: 'Verified clock skew tolerance set to 60s max',
      },
      {
        id: 'ac-101-2',
        scenarioTitle: 'Expired or tampered token rejection',
        givenClause: 'Given an expired JWT or signature mismatch',
        whenClause: 'When decorated @require_auth executes',
        thenClause: 'Then abort with HTTP 401 Unauthorized and standard error JSON payload',
        isVerified: true,
        reviewedBy: 'Yash Patil',
        edgeCaseNote: 'Ensure raw exception stack trace is never leaked in 401 responses',
      },
      {
        id: 'ac-101-3',
        scenarioTitle: 'Role authorization boundary check',
        givenClause: 'Given an authenticated user without admin privileges',
        whenClause: 'When invoking DELETE /api/v1/tasks/{id}',
        thenClause: 'Then return HTTP 403 Forbidden with code INSUFFICIENT_PERMISSIONS',
        isVerified: true,
        reviewedBy: 'Yash Patil',
      },
    ],
    subtasks: [
      { id: 'sub-1', title: 'Install PyJWT and cryptography libraries', completed: true },
      { id: 'sub-2', title: 'Write @require_auth decorator with Bearer parsing', completed: true },
      { id: 'sub-3', title: 'Add role validation helper for write/delete actions', completed: true },
      { id: 'sub-4', title: 'Integrate unit tests in test_auth_jwt.py', completed: true },
    ],
    auditLogs: [
      {
        id: 'log-1',
        timestamp: '2026-11-01T09:15:00Z',
        author: 'Yash Patil',
        action: 'Created Task',
        details: 'Drafted specification with 3 acceptance criteria and edge case checklist',
      },
      {
        id: 'log-2',
        timestamp: '2026-11-03T14:20:00Z',
        author: 'Maya Chen',
        action: 'Status Change',
        details: 'Moved from IN_PROGRESS to CODE_REVIEW. PR #12 opened.',
      },
      {
        id: 'log-3',
        timestamp: '2026-11-04T16:30:00Z',
        author: 'Yash Patil',
        action: 'Code Review & Sign-off',
        details: 'Verified cryptographic padding and input null bytes handling. Moved to DONE.',
      },
    ],
  },
  {
    id: 'task-2',
    taskId: 'TASK-102',
    title: 'Design MySQL Relational Schema & Indexes for High-Density Task Queries',
    description: 'Model relational tables in MySQL 8.0: `users`, `tasks`, `acceptance_criteria`, `subtasks`, and `task_audit_logs`. Define composite indexes on `(status, priority, due_date)` to optimize Kanban board loads and list filters under high concurrency.',
    status: 'DONE',
    priority: 'P1',
    assignee: SEED_TEAM_MEMBERS[2], // Maya
    reporter: SEED_TEAM_MEMBERS[0], // Yash
    tags: ['Database', 'MySQL', 'Schema', 'Performance'],
    estimatedHours: 6,
    actualHours: 5,
    dueDate: '2026-11-12',
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-05T11:00:00Z',
    securityReviewed: true,
    acceptanceCriteria: [
      {
        id: 'ac-102-1',
        scenarioTitle: 'Cascading deletion and referential integrity',
        givenClause: 'Given an existing task with 4 acceptance criteria and 5 subtasks',
        whenClause: 'When DELETE statement runs on the task row',
        thenClause: 'Then child acceptance_criteria and subtasks rows cascade delete cleanly without orphan records',
        isVerified: true,
        reviewedBy: 'Yash Patil',
      },
      {
        id: 'ac-102-2',
        scenarioTitle: 'Indexed query performance on status & priority filters',
        givenClause: 'Given 50,000 seeded tasks in the MySQL table',
        whenClause: 'When querying SELECT * WHERE status="IN_PROGRESS" ORDER BY priority ASC',
        thenClause: 'Then query uses idx_tasks_status_priority with index lookup scan time < 5ms',
        isVerified: true,
        reviewedBy: 'Yash Patil',
        edgeCaseNote: 'EXPLAIN plan checked: type=ref, key=idx_tasks_status_priority',
      },
    ],
    subtasks: [
      { id: 'sub-201', title: 'Write DDL migration script with foreign keys', completed: true },
      { id: 'sub-202', title: 'Add UTF8mb4 character set for multi-language support', completed: true },
      { id: 'sub-203', title: 'Benchmark composite index plans with EXPLAIN ANALYZE', completed: true },
    ],
    auditLogs: [
      {
        id: 'log-102-1',
        timestamp: '2026-11-02T10:00:00Z',
        author: 'Yash Patil',
        action: 'Created Task',
        details: 'Specified 3NF schema and foreign key constraints',
      },
      {
        id: 'log-102-2',
        timestamp: '2026-11-05T11:00:00Z',
        author: 'Yash Patil',
        action: 'Approved Schema',
        details: 'Schema migrated successfully to Azure Database for MySQL Flexible Server',
      },
    ],
  },
  {
    id: 'task-3',
    taskId: 'TASK-103',
    title: 'Build Interactive Kanban Board with Optimistic Status Transitions',
    description: 'Construct the React Kanban workspace supporting drag-over drops and immediate status transitions across Backlog, Todo, In Progress, Code Review, QA, and Done. Provide keyboard shortcuts, acceptance criteria completion meters, and offline rollback.',
    status: 'IN_PROGRESS',
    priority: 'P1',
    assignee: SEED_TEAM_MEMBERS[1], // Alex
    reporter: SEED_TEAM_MEMBERS[0], // Yash
    tags: ['React', 'UI', 'Kanban', 'Frontend'],
    estimatedHours: 12,
    actualHours: 9.5,
    dueDate: '2026-11-14',
    createdAt: '2026-11-03T08:30:00Z',
    updatedAt: '2026-11-08T07:15:00Z',
    securityReviewed: true,
    acceptanceCriteria: [
      {
        id: 'ac-103-1',
        scenarioTitle: 'Instant optimistic UI update with rollback on failure',
        givenClause: 'Given a card moved from IN_PROGRESS to CODE_REVIEW',
        whenClause: 'When status update is triggered',
        thenClause: 'Then UI immediately relocates card to new column and reverts if server returns error',
        isVerified: true,
        reviewedBy: 'Yash Patil',
      },
      {
        id: 'ac-103-2',
        scenarioTitle: 'Acceptance Criteria completion meter visibility',
        givenClause: 'Given a task with 3 verified out of 4 total acceptance criteria',
        whenClause: 'When rendering card in any Kanban column',
        thenClause: 'Then card displays explicit "3/4 AC (75%)" progress indicator',
        isVerified: true,
        reviewedBy: 'Jordan Taylor',
      },
      {
        id: 'ac-103-3',
        scenarioTitle: 'Guard against moving to Done if Acceptance Criteria fail',
        givenClause: 'Given a task with 1 or more unverified or failed acceptance criteria',
        whenClause: 'When user attempts to move task to DONE status',
        thenClause: 'Then prompt verification warning dialog asking confirmation or blocking direct transition',
        isVerified: false,
        reviewedBy: 'Pending Review',
        edgeCaseNote: 'Edge case flagged during Yash code review: enforce soft-block dialog with override note',
      },
    ],
    subtasks: [
      { id: 'sub-301', title: 'Implement Kanban column layout with responsive scroll', completed: true },
      { id: 'sub-302', title: 'Add quick column relocation dropdown and hotkeys', completed: true },
      { id: 'sub-303', title: 'Implement AC verification guard modal when moving to Done', completed: false },
      { id: 'sub-304', title: 'Ensure accessible ARIA labels for column transitions', completed: true },
    ],
    auditLogs: [
      {
        id: 'log-301',
        timestamp: '2026-11-03T08:30:00Z',
        author: 'Yash Patil',
        action: 'Created Task',
        details: 'Spec includes AC completion meter and status transition rules',
      },
      {
        id: 'log-302',
        timestamp: '2026-11-07T18:00:00Z',
        author: 'Alex Rivera',
        action: 'Progress Update',
        details: 'Added drag-over dropzones and smooth spring animations',
      },
    ],
  },
  {
    id: 'task-4',
    taskId: 'TASK-104',
    title: 'Input Validation & Security Hardening: XSS Stripping & SQL Injection Prevention',
    description: 'Review and sanitize all inbound REST request payloads. Implement Marshmallow/Pydantic schemas with strict string length constraints (titles <= 200 chars), HTML tag stripping on descriptions, parameterized MySQL queries, and header security checks.',
    status: 'QA_VERIFY',
    priority: 'P0',
    assignee: SEED_TEAM_MEMBERS[3], // Jordan
    reporter: SEED_TEAM_MEMBERS[0], // Yash
    tags: ['Security', 'Validation', 'OWASP', 'QA'],
    estimatedHours: 8,
    actualHours: 7,
    dueDate: '2026-11-11',
    createdAt: '2026-11-03T11:00:00Z',
    updatedAt: '2026-11-07T14:45:00Z',
    securityReviewed: true,
    acceptanceCriteria: [
      {
        id: 'ac-104-1',
        scenarioTitle: 'XSS script injection rejection in description',
        givenClause: 'Given a POST /api/v1/tasks body with <script>alert("xss")</script> in description',
        whenClause: 'When backend validation filter runs',
        thenClause: 'Then raw script tags are stripped or HTML-escaped before storing to database',
        isVerified: true,
        reviewedBy: 'Yash Patil',
      },
      {
        id: 'ac-104-2',
        scenarioTitle: 'SQL injection payload in task search query',
        givenClause: 'Given a search query parameter "?q=\' OR 1=1; --"',
        whenClause: 'When MySQL parameterized query executes',
        thenClause: 'Then query is treated as literal search string with no unauthorized table dump',
        isVerified: true,
        reviewedBy: 'Jordan Taylor',
      },
      {
        id: 'ac-104-3',
        scenarioTitle: 'Negative hour estimation validation error',
        givenClause: 'Given estimated_hours: -5.0 or non-numeric value in payload',
        whenClause: 'When schema validation decorator runs',
        thenClause: 'Then abort with HTTP 422 Unprocessable Entity detailing field constraints',
        isVerified: true,
        reviewedBy: 'Yash Patil',
      },
    ],
    subtasks: [
      { id: 'sub-401', title: 'Write regex and HTML sanitization pre-processor', completed: true },
      { id: 'sub-402', title: 'Add SQLAlchemy parameterized prepared statements', completed: true },
      { id: 'sub-403', title: 'Add security regression tests in test_security_sanitization.py', completed: true },
    ],
    auditLogs: [
      {
        id: 'log-401',
        timestamp: '2026-11-03T11:00:00Z',
        author: 'Yash Patil',
        action: 'Task Created',
        details: 'Strict OWASP Top 10 checklist defined for agent execution',
      },
      {
        id: 'log-402',
        timestamp: '2026-11-06T16:00:00Z',
        author: 'Jordan Taylor',
        action: 'Security Audit Passed',
        details: 'Zero vulnerabilities found on DAST scan. Moving to QA_VERIFY.',
      },
    ],
  },
  {
    id: 'task-5',
    taskId: 'TASK-105',
    title: 'Automated PyTest Test Suite with 95%+ Branch Coverage',
    description: 'Implement a comprehensive PyTest automated test suite covering CRUD operations, token tampering, edge cases (Unicode characters, null boundaries, max string limits), and acceptance criteria verification workflows.',
    status: 'DONE',
    priority: 'P1',
    assignee: SEED_TEAM_MEMBERS[3], // Jordan
    reporter: SEED_TEAM_MEMBERS[0], // Yash
    tags: ['Testing', 'PyTest', 'CI/CD', 'Automation'],
    estimatedHours: 10,
    actualHours: 8.5,
    dueDate: '2026-11-13',
    createdAt: '2026-11-04T09:00:00Z',
    updatedAt: '2026-11-06T17:00:00Z',
    securityReviewed: true,
    acceptanceCriteria: [
      {
        id: 'ac-105-1',
        scenarioTitle: 'Test suite passes all unit and integration assertions',
        givenClause: 'Given the complete pytest test suite executed via CLI',
        whenClause: 'When running pytest tests/ -v --cov=app',
        thenClause: 'Then all 16 test cases pass in under 2 seconds with 0 failures',
        isVerified: true,
        reviewedBy: 'Yash Patil',
      },
      {
        id: 'ac-105-2',
        scenarioTitle: 'Branch coverage threshold verification',
        givenClause: 'Given pytest-cov execution against REST endpoints',
        whenClause: 'When coverage report is compiled',
        thenClause: 'Then total statement and branch coverage is strictly >= 95%',
        isVerified: true,
        reviewedBy: 'Yash Patil',
        edgeCaseNote: 'Actual measured coverage achieved: 98.4%',
      },
    ],
    subtasks: [
      { id: 'sub-501', title: 'Set up SQLite in-memory test database fixture', completed: true },
      { id: 'sub-502', title: 'Write test_task_crud.py with edge case payloads', completed: true },
      { id: 'sub-503', title: 'Write test_acceptance_criteria.py with Gherkin checks', completed: true },
      { id: 'sub-504', title: 'Write test_auth_jwt.py and test_security_sanitization.py', completed: true },
    ],
    auditLogs: [
      {
        id: 'log-501',
        timestamp: '2026-11-04T09:00:00Z',
        author: 'Yash Patil',
        action: 'Created Task',
        details: 'Instructed Claude Code to draft PyTest suite following AAA (Arrange-Act-Assert) pattern',
      },
      {
        id: 'log-502',
        timestamp: '2026-11-06T17:00:00Z',
        author: 'Yash Patil',
        action: 'Review Completed',
        details: 'Verified test assertions handle mocked database sessions properly',
      },
    ],
  },
  {
    id: 'task-6',
    taskId: 'TASK-106',
    title: 'Deploy Production Containers on Azure App Service & Flexible MySQL',
    description: 'Configure multi-stage Dockerfile container build for React SPA and Flask REST API. Deploy to Azure App Service with Linux container runtime. Establish secure Virtual Network private endpoint to Azure Database for MySQL Flexible Server.',
    status: 'DONE',
    priority: 'P0',
    assignee: SEED_TEAM_MEMBERS[0], // Yash
    reporter: SEED_TEAM_MEMBERS[0], // Yash
    tags: ['DevOps', 'Azure', 'Docker', 'Cloud'],
    estimatedHours: 14,
    actualHours: 11,
    dueDate: '2026-11-08',
    createdAt: '2026-11-05T08:00:00Z',
    updatedAt: '2026-11-07T19:30:00Z',
    securityReviewed: true,
    acceptanceCriteria: [
      {
        id: 'ac-106-1',
        scenarioTitle: 'Health check probe returns 200 OK under load',
        givenClause: 'Given Azure Application Gateway probing GET /api/health',
        whenClause: 'When container is running and MySQL connection pool is healthy',
        thenClause: 'Then respond with 200 OK and database latency < 15ms',
        isVerified: true,
        reviewedBy: 'Yash Patil',
      },
      {
        id: 'ac-106-2',
        scenarioTitle: 'Enforce HTTPS and TLS 1.3 encryption in transit',
        givenClause: 'Given an HTTP request sent to Azure custom domain',
        whenClause: 'When connection initializes',
        thenClause: 'Then Azure App Service automatically redirects HTTP to HTTPS with HSTS header',
        isVerified: true,
        reviewedBy: 'Yash Patil',
      },
      {
        id: 'ac-106-3',
        scenarioTitle: 'Secrets injection via Azure Key Vault reference',
        givenClause: 'Given DB_PASSWORD and JWT_SECRET_KEY required at runtime',
        whenClause: 'When container starts on App Service',
        thenClause: 'Then values are securely populated from Azure Key Vault without being stored in source code',
        isVerified: true,
        reviewedBy: 'Yash Patil',
      },
    ],
    subtasks: [
      { id: 'sub-601', title: 'Write production Dockerfile with non-root user', completed: true },
      { id: 'sub-602', title: 'Provision Azure App Service Plan (B1 Linux)', completed: true },
      { id: 'sub-603', title: 'Provision Azure Database for MySQL Flexible Server', completed: true },
      { id: 'sub-604', title: 'Configure GitHub Actions CI/CD deployment pipeline', completed: true },
    ],
    auditLogs: [
      {
        id: 'log-601',
        timestamp: '2026-11-05T08:00:00Z',
        author: 'Yash Patil',
        action: 'Deployment Started',
        details: 'Azure resource group `rg-taskflow-prod` created in East US',
      },
      {
        id: 'log-602',
        timestamp: '2026-11-07T19:30:00Z',
        author: 'Yash Patil',
        action: 'Production Live',
        details: 'Live endpoint responding with zero downtime deployment',
      },
    ],
  },
  {
    id: 'task-7',
    taskId: 'TASK-107',
    title: 'High-Density Task Table View with Multi-Select Batch Actions',
    description: 'Implement an alternate high-density tabular view for power users. Support multi-row selection, batch status updates (Mark Done, Change Priority, Reassign), sorting by arbitrary columns, and keyboard selection.',
    status: 'TODO',
    priority: 'P2',
    assignee: SEED_TEAM_MEMBERS[1], // Alex
    reporter: SEED_TEAM_MEMBERS[0], // Yash
    tags: ['React', 'Table', 'UX', 'Frontend'],
    estimatedHours: 6,
    actualHours: 0,
    dueDate: '2026-11-18',
    createdAt: '2026-11-06T14:00:00Z',
    updatedAt: '2026-11-06T14:00:00Z',
    securityReviewed: false,
    acceptanceCriteria: [
      {
        id: 'ac-107-1',
        scenarioTitle: 'Batch update multiple selected tasks to DONE',
        givenClause: 'Given 5 tasks selected via checkboxes',
        whenClause: 'When user clicks "Batch Mark Done" action button',
        thenClause: 'Then all 5 tasks transition to DONE status and toast notification reports success count',
        isVerified: false,
        reviewedBy: 'Pending Review',
      },
    ],
    subtasks: [
      { id: 'sub-701', title: 'Implement tabular row layout with tabular numerals', completed: true },
      { id: 'sub-702', title: 'Add checkbox selection state with indeterminate select-all', completed: true },
      { id: 'sub-703', title: 'Implement batch action bar floating docked trigger', completed: true },
    ],
    auditLogs: [
      {
        id: 'log-701',
        timestamp: '2026-11-06T14:00:00Z',
        author: 'Yash Patil',
        action: 'Created Task',
        details: 'Requested tabular view for high-volume backlog triage',
      },
    ],
  },
  {
    id: 'task-8',
    taskId: 'TASK-108',
    title: 'Acceptance Criteria Matrix & Quality Review Compliance Dashboard',
    description: 'Build a dedicated Acceptance Criteria Matrix view that renders all tasks alongside their Gherkin Given/When/Then scenarios, verification checkmarks, edge case notes, and auditor sign-offs.',
    status: 'CODE_REVIEW',
    priority: 'P2',
    assignee: SEED_TEAM_MEMBERS[1], // Alex
    reporter: SEED_TEAM_MEMBERS[0], // Yash
    tags: ['AcceptanceCriteria', 'QA', 'Compliance', 'Frontend'],
    estimatedHours: 7,
    actualHours: 5.5,
    dueDate: '2026-11-16',
    createdAt: '2026-11-07T10:00:00Z',
    updatedAt: '2026-11-08T06:30:00Z',
    securityReviewed: true,
    acceptanceCriteria: [
      {
        id: 'ac-108-1',
        scenarioTitle: 'Filter tasks by Acceptance Criteria status',
        givenClause: 'Given 8 total tasks with varying AC verification statuses',
        whenClause: 'When filtering by "Has Unverified ACs"',
        thenClause: 'Then only tasks with pending or failed acceptance criteria remain visible',
        isVerified: true,
        reviewedBy: 'Yash Patil',
      },
    ],
    subtasks: [
      { id: 'sub-801', title: 'Render AC matrix table with Gherkin syntax highlights', completed: true },
      { id: 'sub-802', title: 'Add quick toggle for AC verification with reviewer stamping', completed: true },
      { id: 'sub-803', title: 'Add edge case notes editor popover', completed: true },
    ],
    auditLogs: [
      {
        id: 'log-801',
        timestamp: '2026-11-07T10:00:00Z',
        author: 'Yash Patil',
        action: 'Created Task',
        details: 'Essential view to guarantee no PR merges without verified ACs',
      },
    ],
  },
];

export const FLASK_API_ENDPOINTS: ApiEndpointDefinition[] = [
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    description: 'Authenticates engineer or reviewer and generates JWT Bearer access token',
    requiresAuth: false,
    sampleRequestBody: {
      email: 'patilyashv166@gmail.com',
      password: '••••••••••••',
    },
    expectedResponseStatus: 200,
    sampleResponseBody: {
      access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6InBhdGlseWFzaHYxNjZAZ21haWwuY29tIiwiZXhwIjoxNzk0MjE2MDAwfQ...',
      token_type: 'Bearer',
      expires_in: 3600,
      user: {
        id: 'user-1',
        name: 'Yash Patil',
        role: 'admin',
      },
    },
  },
  {
    method: 'GET',
    path: '/api/v1/tasks',
    description: 'Retrieves paginated tasks with filtering by status, priority, or search term',
    requiresAuth: true,
    expectedResponseStatus: 200,
    sampleResponseBody: {
      items: [
        {
          id: 'task-1',
          task_id: 'TASK-101',
          title: 'Implement JWT Authentication & Bearer Header Validation in Flask',
          status: 'DONE',
          priority: 'P0',
          assignee_id: 'user-3',
          acceptance_criteria_count: 3,
          acceptance_criteria_verified: 3,
        },
      ],
      total: 8,
      page: 1,
      per_page: 20,
    },
  },
  {
    method: 'POST',
    path: '/api/v1/tasks',
    description: 'Creates a new task. Enforces schema validation, XSS sanitization, and priority limits.',
    requiresAuth: true,
    requiredRole: 'engineer',
    sampleRequestBody: {
      title: 'Configure automated DB backup snapshot cron on Azure',
      description: 'Scheduled daily automated backup snapshots for MySQL flexible server.',
      priority: 'P2',
      status: 'TODO',
      assignee_id: 'user-3',
      estimated_hours: 4.0,
      acceptance_criteria: [
        {
          scenario_title: 'Automated snapshot triggers at 02:00 UTC',
          given_clause: 'Given scheduled cron job 0 2 * * *',
          when_clause: 'When Azure CLI command az mysql flexible-server backup create executes',
          then_clause: 'Then backup snapshot completes with status Succeeded and 30-day retention',
        },
      ],
    },
    expectedResponseStatus: 201,
    sampleResponseBody: {
      message: 'Task created successfully',
      task_id: 'TASK-109',
      id: 'task-9',
      created_at: '2026-11-08T07:45:00Z',
    },
  },
  {
    method: 'PATCH',
    path: '/api/v1/tasks/{id}/status',
    description: 'Updates task status. Enforces acceptance criteria verification before transition to DONE.',
    requiresAuth: true,
    sampleRequestBody: {
      status: 'DONE',
      override_unverified_ac: false,
    },
    expectedResponseStatus: 200,
    sampleResponseBody: {
      message: 'Task status updated to DONE',
      previous_status: 'QA_VERIFY',
      current_status: 'DONE',
      all_criteria_verified: true,
    },
  },
  {
    method: 'POST',
    path: '/api/v1/tasks/{id}/acceptance-criteria',
    description: 'Appends a formal Gherkin acceptance criteria scenario to an existing task',
    requiresAuth: true,
    sampleRequestBody: {
      scenario_title: 'Invalid payload returns HTTP 422 with validation errors',
      given_clause: 'Given a malformed JSON payload with negative hours',
      when_clause: 'When parsed by Flask request validator',
      then_clause: 'Then return 422 with field-level diagnostic messages',
      edge_case_note: 'Ensure schema returns JSON error dict without Python traceback',
    },
    expectedResponseStatus: 201,
    sampleResponseBody: {
      id: 'ac-109-1',
      task_id: 'task-1',
      scenario_title: 'Invalid payload returns HTTP 422 with validation errors',
      is_verified: false,
    },
  },
  {
    method: 'DELETE',
    path: '/api/v1/tasks/{id}',
    description: 'Deletes a task and cascades deletion to child ACs and subtasks. Admin role required.',
    requiresAuth: true,
    requiredRole: 'admin',
    expectedResponseStatus: 204,
    sampleResponseBody: {},
  },
];

export const MYSQL_SCHEMAS: MySqlTableDefinition[] = [
  {
    tableName: 'users',
    description: 'Stores system accounts, hashed credentials, and role privileges for JWT claims',
    engine: 'InnoDB',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, key: 'PRI', extra: 'UUID' },
      { name: 'email', type: 'VARCHAR(255)', nullable: false, key: 'UNI' },
      { name: 'name', type: 'VARCHAR(120)', nullable: false, key: '' },
      { name: 'password_hash', type: 'VARCHAR(255)', nullable: false, key: '' },
      { name: 'role', type: "ENUM('admin', 'engineer', 'qa', 'viewer')", nullable: false, key: '', defaultValue: "'engineer'" },
      { name: 'created_at', type: 'DATETIME', nullable: false, key: '', defaultValue: 'CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'DATETIME', nullable: false, key: '', defaultValue: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
    ],
  },
  {
    tableName: 'tasks',
    description: 'Main task entities with priority, status, estimations, and assignee foreign keys',
    engine: 'InnoDB',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, key: 'PRI', extra: 'UUID' },
      { name: 'task_id', type: 'VARCHAR(20)', nullable: false, key: 'UNI', extra: 'Indexed' },
      { name: 'title', type: 'VARCHAR(255)', nullable: false, key: '' },
      { name: 'description', type: 'TEXT', nullable: true, key: '' },
      { name: 'status', type: "ENUM('BACKLOG', 'TODO', 'IN_PROGRESS', 'CODE_REVIEW', 'QA_VERIFY', 'DONE')", nullable: false, key: 'MUL' },
      { name: 'priority', type: "ENUM('P0', 'P1', 'P2', 'P3')", nullable: false, key: 'MUL' },
      { name: 'assignee_id', type: 'VARCHAR(36)', nullable: true, key: 'MUL', extra: 'FK -> users(id)' },
      { name: 'reporter_id', type: 'VARCHAR(36)', nullable: false, key: 'MUL', extra: 'FK -> users(id)' },
      { name: 'estimated_hours', type: 'DECIMAL(5,2)', nullable: false, key: '', defaultValue: '0.00' },
      { name: 'actual_hours', type: 'DECIMAL(5,2)', nullable: false, key: '', defaultValue: '0.00' },
      { name: 'due_date', type: 'DATE', nullable: true, key: 'MUL' },
      { name: 'security_reviewed', type: 'TINYINT(1)', nullable: false, key: '', defaultValue: '0' },
      { name: 'created_at', type: 'DATETIME', nullable: false, key: 'MUL', defaultValue: 'CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'DATETIME', nullable: false, key: '', defaultValue: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
    ],
  },
  {
    tableName: 'acceptance_criteria',
    description: 'Formal Gherkin-style specification scenarios linked to tasks with reviewer stamp',
    engine: 'InnoDB',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, key: 'PRI', extra: 'UUID' },
      { name: 'task_id', type: 'VARCHAR(36)', nullable: false, key: 'MUL', extra: 'FK -> tasks(id) ON DELETE CASCADE' },
      { name: 'scenario_title', type: 'VARCHAR(255)', nullable: false, key: '' },
      { name: 'given_clause', type: 'TEXT', nullable: false, key: '' },
      { name: 'when_clause', type: 'TEXT', nullable: false, key: '' },
      { name: 'then_clause', type: 'TEXT', nullable: false, key: '' },
      { name: 'is_verified', type: 'TINYINT(1)', nullable: false, key: 'MUL', defaultValue: '0' },
      { name: 'reviewed_by', type: 'VARCHAR(120)', nullable: true, key: '' },
      { name: 'edge_case_note', type: 'TEXT', nullable: true, key: '' },
      { name: 'verified_at', type: 'DATETIME', nullable: true, key: '' },
    ],
  },
  {
    tableName: 'subtasks',
    description: 'Granular execution checklist items for engineering implementation',
    engine: 'InnoDB',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, key: 'PRI' },
      { name: 'task_id', type: 'VARCHAR(36)', nullable: false, key: 'MUL', extra: 'FK -> tasks(id) ON DELETE CASCADE' },
      { name: 'title', type: 'VARCHAR(255)', nullable: false, key: '' },
      { name: 'completed', type: 'TINYINT(1)', nullable: false, key: '', defaultValue: '0' },
      { name: 'position_order', type: 'INT', nullable: false, key: '', defaultValue: '0' },
    ],
  },
  {
    tableName: 'task_audit_logs',
    description: 'Immutable append-only audit trail recording status mutations and code reviews',
    engine: 'InnoDB',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', nullable: false, key: 'PRI' },
      { name: 'task_id', type: 'VARCHAR(36)', nullable: false, key: 'MUL', extra: 'FK -> tasks(id) ON DELETE CASCADE' },
      { name: 'author_name', type: 'VARCHAR(120)', nullable: false, key: '' },
      { name: 'action', type: 'VARCHAR(80)', nullable: false, key: '' },
      { name: 'details', type: 'TEXT', nullable: false, key: '' },
      { name: 'created_at', type: 'DATETIME', nullable: false, key: 'MUL', defaultValue: 'CURRENT_TIMESTAMP' },
    ],
  },
];

export const PYTEST_TEST_SUITE: PyTestCase[] = [
  {
    id: 'test-1',
    module: 'tests/test_task_crud.py',
    name: 'test_create_task_with_valid_payload',
    description: 'Verifies successful task creation with all required fields, returns 201 Created and taskId',
    status: 'passed',
    durationMs: 14,
    category: 'unit',
    assertions: [
      'assert response.status_code == 201',
      'assert "task_id" in response.json',
      'assert response.json["title"] == "Valid Task Title"',
    ],
  },
  {
    id: 'test-2',
    module: 'tests/test_task_crud.py',
    name: 'test_reject_empty_task_title',
    description: 'Ensures empty strings and whitespace-only titles return 400 Bad Request with field error',
    status: 'passed',
    durationMs: 8,
    category: 'edge_case',
    assertions: [
      'assert response.status_code == 400',
      'assert "title" in response.json["errors"]',
      'assert "Title cannot be empty" in response.json["errors"]["title"]',
    ],
  },
  {
    id: 'test-3',
    module: 'tests/test_task_crud.py',
    name: 'test_title_length_exceeding_255_chars_rejected',
    description: 'Boundary test: enforces maximum VARCHAR(255) constraint gracefully in validation schema',
    status: 'passed',
    durationMs: 9,
    category: 'edge_case',
    assertions: [
      'assert response.status_code == 400',
      'assert "exceeds maximum allowed length 255" in str(response.json)',
    ],
  },
  {
    id: 'test-4',
    module: 'tests/test_task_crud.py',
    name: 'test_cascade_delete_removes_child_acceptance_criteria',
    description: 'Verifies deleting parent task row cascades and cleans up child ACs and subtasks in MySQL',
    status: 'passed',
    durationMs: 22,
    category: 'integration',
    assertions: [
      'assert client.delete(f"/api/v1/tasks/{task_id}").status_code == 204',
      'assert db.session.query(AcceptanceCriterion).filter_by(task_id=task_id).count() == 0',
      'assert db.session.query(Subtask).filter_by(task_id=task_id).count() == 0',
    ],
  },
  {
    id: 'test-5',
    module: 'tests/test_auth_jwt.py',
    name: 'test_jwt_bearer_token_validation_success',
    description: 'Verifies valid RS256 token properly populates flask.g.current_user and role',
    status: 'passed',
    durationMs: 16,
    category: 'security',
    assertions: [
      'assert response.status_code == 200',
      'assert response.json["user"]["id"] == "user-1"',
      'assert response.json["user"]["role"] == "admin"',
    ],
  },
  {
    id: 'test-6',
    module: 'tests/test_auth_jwt.py',
    name: 'test_expired_jwt_returns_401_unauthorized',
    description: 'Edge case: token with exp in the past is rejected with expired token message',
    status: 'passed',
    durationMs: 12,
    category: 'security',
    assertions: [
      'assert response.status_code == 401',
      'assert response.json["error"] == "Signature has expired"',
    ],
  },
  {
    id: 'test-7',
    module: 'tests/test_auth_jwt.py',
    name: 'test_malformed_authorization_header_rejected',
    description: 'Rejects tokens without "Bearer " prefix or corrupted base64 signature with 401',
    status: 'passed',
    durationMs: 7,
    category: 'security',
    assertions: [
      'assert response.status_code == 401',
      'assert "Invalid Authorization header format" in response.json["error"]',
    ],
  },
  {
    id: 'test-8',
    module: 'tests/test_auth_jwt.py',
    name: 'test_delete_requires_admin_role_enforcement',
    description: 'RBAC boundary: non-admin roles receive 403 Forbidden when attempting task deletion',
    status: 'passed',
    durationMs: 11,
    category: 'security',
    assertions: [
      'assert response.status_code == 403',
      'assert response.json["code"] == "INSUFFICIENT_PERMISSIONS"',
    ],
  },
  {
    id: 'test-9',
    module: 'tests/test_acceptance_criteria.py',
    name: 'test_add_acceptance_criteria_with_gherkin_syntax',
    description: 'Validates Given/When/Then scenario payload formatting and database persistence',
    status: 'passed',
    durationMs: 18,
    category: 'unit',
    assertions: [
      'assert response.status_code == 201',
      'assert response.json["scenario_title"].startswith("Given")',
      'assert response.json["is_verified"] is False',
    ],
  },
  {
    id: 'test-10',
    module: 'tests/test_acceptance_criteria.py',
    name: 'test_guard_prevent_done_status_when_criteria_unverified',
    description: 'State transition invariant: task cannot transition to DONE if required ACs are unverified',
    status: 'passed',
    durationMs: 15,
    category: 'edge_case',
    assertions: [
      'assert response.status_code == 400',
      'assert "Cannot transition to DONE: 2 acceptance criteria pending" in response.json["message"]',
    ],
  },
  {
    id: 'test-11',
    module: 'tests/test_acceptance_criteria.py',
    name: 'test_verify_acceptance_criteria_records_reviewer_and_timestamp',
    description: 'Stamps reviewer identity and ISO-8601 timestamp upon criteria verification',
    status: 'passed',
    durationMs: 13,
    category: 'unit',
    assertions: [
      'assert response.status_code == 200',
      'assert response.json["is_verified"] is True',
      'assert response.json["reviewed_by"] == "Yash Patil"',
      'assert response.json["verified_at"] is not None',
    ],
  },
  {
    id: 'test-12',
    module: 'tests/test_security_sanitization.py',
    name: 'test_xss_script_tags_stripped_from_description',
    description: 'Security check: payload with <script>alert(1)</script> has dangerous tags removed',
    status: 'passed',
    durationMs: 19,
    category: 'security',
    assertions: [
      'assert "<script>" not in response.json["description"]',
      'assert "</script>" not in response.json["description"]',
    ],
  },
  {
    id: 'test-13',
    module: 'tests/test_security_sanitization.py',
    name: 'test_sql_injection_attempt_in_filter_treated_as_literal',
    description: 'Verifies SQL injection payload "?priority=P1\' OR 1=1--" uses parameterized queries',
    status: 'passed',
    durationMs: 21,
    category: 'security',
    assertions: [
      'assert response.status_code in (200, 400)',
      'assert len(response.json.get("items", [])) == 0',
    ],
  },
  {
    id: 'test-14',
    module: 'tests/test_security_sanitization.py',
    name: 'test_negative_estimated_hours_rejected',
    description: 'Validates non-negative numerical boundary check on estimated and actual hours',
    status: 'passed',
    durationMs: 10,
    category: 'edge_case',
    assertions: [
      'assert response.status_code == 422',
      'assert "estimated_hours must be greater than or equal to 0" in str(response.json)',
    ],
  },
  {
    id: 'test-15',
    module: 'tests/test_security_sanitization.py',
    name: 'test_rate_limiting_exceeded_returns_429',
    description: 'Ensures IP/token based rate limiter caps brute force attempts at 60 req/min',
    status: 'passed',
    durationMs: 35,
    category: 'security',
    assertions: [
      'assert responses[-1].status_code == 429',
      'assert "Retry-After" in responses[-1].headers',
    ],
  },
  {
    id: 'test-16',
    module: 'tests/test_azure_deployment.py',
    name: 'test_health_check_endpoint_returns_db_connection_status',
    description: 'Azure App Service liveness probe verifies MySQL pool health and latency < 50ms',
    status: 'passed',
    durationMs: 12,
    category: 'integration',
    assertions: [
      'assert response.status_code == 200',
      'assert response.json["status"] == "healthy"',
      'assert response.json["mysql_connection"] == "connected"',
    ],
  },
];

export const ENGINEERING_SPEC_MARKDOWN = `# TaskFlow Architecture & Engineering Specification

## 1. Product Overview & Invariants
TaskFlow is a production-grade task tracking and quality assurance workstation engineered with a React.js client interface, a Flask REST API backend, a MySQL 8.0 relational database, and an automated PyTest verification harness.

### Key Acceptance Criteria:
1. **Task Lifecycle Invariants**:
   - Every task has a unique human-scannable \`taskId\` (e.g., \`TASK-101\`) and UUID.
   - Status transitions follow: \`BACKLOG\` -> \`TODO\` -> \`IN_PROGRESS\` -> \`CODE_REVIEW\` -> \`QA_VERIFY\` -> \`DONE\`.
   - **Quality Guard**: A task cannot transition to \`DONE\` unless all linked Acceptance Criteria are marked \`isVerified = true\` (or explicitly overridden by an Admin with audit log entry).
2. **Security & Input Validation**:
   - JWT tokens signed with RS256 / SHA-256 with 1-hour expiration and audience verification.
   - Mandatory Bearer authentication on all mutation routes (\`POST\`, \`PUT\`, \`PATCH\`, \`DELETE\`).
   - Strict XSS HTML stripping on rich text descriptions.
   - 100% Parameterized queries across all MySQL interactions to eliminate SQL injection.
3. **Automated Testing Requirements**:
   - PyTest test suite must test happy paths, edge cases (Unicode, max lengths, null values), and security boundaries.
   - Branch coverage target >= 95%.
4. **Cloud Deployment Target**:
   - Azure App Service (Linux container runtime, multi-stage Docker build).
   - Azure Database for MySQL Flexible Server over private VNet peering.

---

## 2. Agent Prompt Directives (Used with Cursor & Claude Code)

### Prompt A: Cursor Directive (React UI Architecture)
> *"Build a modular React UI using Tailwind CSS. Implement both a Kanban drag-and-drop workspace and a high-density tabular list view. For every task card, display an Acceptance Criteria progress gauge (e.g. '3/4 AC verified'). Enforce immediate optimistic status transitions with automatic rollback upon API errors. Follow zero-pill metadata discipline and ensure WCAG AA contrast."*

### Prompt B: Claude Code Directive (Flask REST API & MySQL)
> *"Implement a Flask REST API on MySQL 8.0 with SQLAlchemy ORM and PyTest. Create tables for users, tasks, acceptance_criteria, subtasks, and task_audit_logs. Secure all mutations with JWT Bearer tokens and role-based permissions. Add Marshmallow validation schemas that reject titles > 255 chars, sanitize XSS tags, and reject negative hour inputs. Write a comprehensive PyTest suite covering unit, edge case, and security integration tests."*

### Prompt C: Engineer Review & Security Hardening (By Yash Patil)
> *"Reviewed all generated agent code: Added cascade delete constraints to MySQL foreign keys to prevent orphan criteria. Hardened JWT clock skew tolerance to 60s max. Added a state transition validator preventing tasks from moving to DONE if acceptance criteria fail. Containerized both services for Azure App Service deployment with Azure Key Vault secrets integration."*
`;
