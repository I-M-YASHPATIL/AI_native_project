import React, { useState } from 'react';
import { FLASK_API_ENDPOINTS } from '../../data/seedData';
import { ApiEndpointDefinition } from '../../types';
import { useTasks } from '../../context/TaskContext';
import {
  Send,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Check,
  Code2
} from 'lucide-react';

export const FlaskApiPlayground: React.FC = () => {
  const { tasks, currentUser, createTask, addToast } = useTasks();
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDefinition>(FLASK_API_ENDPOINTS[1]); // GET /tasks
  const [requestBodyText, setRequestBodyText] = useState<string>(
    selectedEndpoint.sampleRequestBody
      ? JSON.stringify(selectedEndpoint.sampleRequestBody, null, 2)
      : ''
  );

  // JWT state & simulation options
  const [jwtRole, setJwtRole] = useState<'admin' | 'engineer' | 'qa' | 'viewer'>('admin');
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [isTokenCorrupted, setIsTokenCorrupted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Response state
  const [responseStatus, setResponseStatus] = useState<number | null>(200);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': '60',
    'X-RateLimit-Remaining': '58',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  });
  const [responseBody, setResponseBody] = useState<Record<string, unknown> | null>({
    status: 'success',
    items_count: tasks.length,
    message: 'Authenticated as Yash Patil (Role: admin). Token claims verified.',
  });

  const handleSelectEndpoint = (ep: ApiEndpointDefinition) => {
    setSelectedEndpoint(ep);
    setRequestBodyText(
      ep.sampleRequestBody ? JSON.stringify(ep.sampleRequestBody, null, 2) : ''
    );
  };

  const handleSendRequest = () => {
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);

      // Check security & auth conditions
      if (selectedEndpoint.requiresAuth) {
        if (isTokenExpired) {
          setResponseStatus(401);
          setResponseBody({
            error: 'Signature has expired',
            code: 'TOKEN_EXPIRED',
            hint: 'Token exp timestamp is in the past. Re-authenticate via POST /api/v1/auth/login.',
          });
          addToast('API Error 401: Token expired', 'error');
          return;
        }

        if (isTokenCorrupted) {
          setResponseStatus(401);
          setResponseBody({
            error: 'Invalid token signature',
            code: 'INVALID_SIGNATURE',
            hint: 'Cryptographic hash mismatch. RS256 signature verification failed.',
          });
          addToast('API Error 401: Signature mismatch', 'error');
          return;
        }

        if (selectedEndpoint.requiredRole === 'admin' && jwtRole !== 'admin') {
          setResponseStatus(403);
          setResponseBody({
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            hint: `Endpoint requires role 'admin', current token has role '${jwtRole}'.`,
          });
          addToast('API Error 403: Role forbidden', 'error');
          return;
        }
      }

      // Check input validation
      if (selectedEndpoint.method === 'POST' && selectedEndpoint.path === '/api/v1/tasks') {
        try {
          const parsed = JSON.parse(requestBodyText);
          if (!parsed.title || !parsed.title.trim()) {
            setResponseStatus(400);
            setResponseBody({
              error: 'Validation failed',
              errors: { title: ['Title is a required field and cannot be empty'] },
            });
            addToast('API Error 400: Title is required', 'error');
            return;
          }
          if (parsed.estimated_hours && parsed.estimated_hours < 0) {
            setResponseStatus(422);
            setResponseBody({
              error: 'Unprocessable Entity',
              errors: { estimated_hours: ['Must be greater than or equal to 0.0'] },
            });
            addToast('API Error 422: Negative hours rejected', 'error');
            return;
          }

          // Create the real task in UI state too!
          const created = createTask({
            title: parsed.title,
            description: parsed.description || '',
            priority: parsed.priority || 'P2',
            status: parsed.status || 'TODO',
            estimatedHours: parsed.estimated_hours || 4,
          });

          setResponseStatus(201);
          setResponseBody({
            message: 'Task created successfully',
            task_id: created.taskId,
            id: created.id,
            created_at: created.createdAt,
          });
          addToast(`API 201 Created: ${created.taskId}`, 'success');
          return;
        } catch {
          setResponseStatus(400);
          setResponseBody({ error: 'Malformed JSON payload' });
          return;
        }
      }

      // Default endpoint responses
      if (selectedEndpoint.path === '/api/v1/tasks') {
        setResponseStatus(200);
        setResponseBody({
          total: tasks.length,
          page: 1,
          per_page: 20,
          items: tasks.map((t) => ({
            id: t.id,
            task_id: t.taskId,
            title: t.title,
            status: t.status,
            priority: t.priority,
            assignee: t.assignee.name,
            ac_count: t.acceptanceCriteria.length,
            ac_verified: t.acceptanceCriteria.filter((ac) => ac.isVerified).length,
          })),
        });
        addToast('API 200 OK: Retrieved task list', 'success');
        return;
      }

      setResponseStatus(selectedEndpoint.expectedResponseStatus);
      setResponseBody(selectedEndpoint.sampleResponseBody);
      addToast(`API ${selectedEndpoint.expectedResponseStatus} Success`, 'success');
    }, 150);
  };

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'GET':
        return 'text-blue-600 dark:text-blue-400 font-bold';
      case 'POST':
        return 'text-emerald-600 dark:text-emerald-400 font-bold';
      case 'PATCH':
      case 'PUT':
        return 'text-amber-600 dark:text-amber-400 font-bold';
      case 'DELETE':
        return 'text-rose-600 dark:text-rose-400 font-bold';
      default:
        return 'text-slate-600 font-bold';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              <Code2 className="w-4 h-4" />
              <span>Flask REST API & JWT Explorer</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Interactive REST Endpoints & Authentication Sandbox
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Simulates the production Flask backend on Azure with RS256 JWT bearer authentication, Marshmallow input validation schemas, and role enforcement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              Host: <span className="text-slate-900 dark:text-white">https://api.taskflow.azurewebsites.net</span>
            </span>
          </div>
        </div>
      </div>

      {/* JWT Token Generator & Inspector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span>JWT Bearer Token Inspector (RS256 / SHA-256)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {isTokenCorrupted || isTokenExpired ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Invalid Token
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Signature Verified
              </span>
            )}
          </div>
        </div>

        {/* Token claims & simulation toggles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 text-xs">
          <div>
            <label className="text-slate-500 dark:text-slate-400 block mb-1">Claim Subject (sub):</label>
            <div className="font-mono font-medium text-slate-900 dark:text-white">{currentUser.name}</div>
          </div>

          <div>
            <label className="text-slate-500 dark:text-slate-400 block mb-1">Role Claim (role):</label>
            <select
              value={jwtRole}
              onChange={(e) => setJwtRole(e.target.value as any)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-slate-900 dark:text-white font-mono"
            >
              <option value="admin">admin (Full CRUD + Delete)</option>
              <option value="engineer">engineer (Task Write)</option>
              <option value="qa">qa (Verify ACs)</option>
              <option value="viewer">viewer (Read-only)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 dark:text-slate-400 block mb-1">Token Expiration (exp):</label>
            <button
              onClick={() => setIsTokenExpired(!isTokenExpired)}
              className={`w-full text-left px-2 py-1 rounded border font-mono transition-colors cursor-pointer ${
                isTokenExpired
                  ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isTokenExpired ? 'Expired (Simulated 401)' : 'Valid (1h lease)'}
            </button>
          </div>

          <div>
            <label className="text-slate-500 dark:text-slate-400 block mb-1">Signature Integrity:</label>
            <button
              onClick={() => setIsTokenCorrupted(!isTokenCorrupted)}
              className={`w-full text-left px-2 py-1 rounded border font-mono transition-colors cursor-pointer ${
                isTokenCorrupted
                  ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isTokenCorrupted ? 'Tampered Signature' : 'Intact RS256'}
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Endpoints on Left, Request/Response on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoint Directory */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-2">
          <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2 px-1">
            Flask REST Endpoints
          </div>

          {FLASK_API_ENDPOINTS.map((ep) => {
            const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
            return (
              <button
                key={`${ep.method}-${ep.path}`}
                onClick={() => handleSelectEndpoint(ep)}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                    : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/70 dark:border-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono">
                    <span className={getMethodBadge(ep.method)}>{ep.method}</span>
                    <span className="text-slate-800 dark:text-slate-200">{ep.path}</span>
                  </div>
                  {ep.requiresAuth && (
                    <span title="Requires Bearer Token">
                      <KeyRound className="w-3 h-3 text-amber-500 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {ep.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Column: Execution Sandbox */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Endpoint Bar & Send CTA */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className={`px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 ${getMethodBadge(selectedEndpoint.method)}`}>
                {selectedEndpoint.method}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {selectedEndpoint.path}
              </span>
            </div>

            <button
              onClick={handleSendRequest}
              disabled={isSending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Executing...' : 'Send Request'}</span>
            </button>
          </div>

          {/* Request Payload Editor (if applicable) */}
          {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Request Payload (JSON)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Content-Type: application/json</span>
              </div>
              <textarea
                rows={6}
                value={requestBodyText}
                onChange={(e) => setRequestBodyText(e.target.value)}
                className="w-full font-mono text-xs p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Live Response Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Response
              </span>
              {responseStatus && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`font-bold ${
                      responseStatus < 300
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {responseStatus} {responseStatus === 200 ? 'OK' : responseStatus === 201 ? 'Created' : 'Error'}
                  </span>
                </div>
              )}
            </div>

            {/* Response body */}
            <div className="font-mono text-xs bg-slate-950 text-slate-100 p-3.5 rounded-lg overflow-x-auto max-h-[300px]">
              <pre>{JSON.stringify(responseBody, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
