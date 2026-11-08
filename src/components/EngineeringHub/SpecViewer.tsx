import React, { useState } from 'react';
import { ENGINEERING_SPEC_MARKDOWN } from '../../data/seedData';
import { Copy, Check, FileText, Bot, ShieldCheck, Sparkles } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export const SpecViewer: React.FC = () => {
  const { addToast } = useTasks();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const cursorPrompt = `Build a modular React UI using Tailwind CSS. Implement both a Kanban drag-and-drop workspace and a high-density tabular list view. For every task card, display an Acceptance Criteria progress gauge (e.g. '3/4 AC verified'). Enforce immediate optimistic status transitions with automatic rollback upon API errors. Follow zero-pill metadata discipline and ensure WCAG AA contrast.`;

  const claudeCodePrompt = `Implement a Flask REST API on MySQL 8.0 with SQLAlchemy ORM and PyTest. Create tables for users, tasks, acceptance_criteria, subtasks, and task_audit_logs. Secure all mutations with JWT Bearer tokens and role-based permissions. Add Marshmallow validation schemas that reject titles > 255 chars, sanitize XSS tags, and reject negative hour inputs. Write a comprehensive PyTest suite covering unit, edge case, and security integration tests.`;

  const yashReviewReviewNotes = `Reviewed all generated agent code:
1. Input Validation: Added strict Marshmallow schema constraints to enforce max VARCHAR(255) and reject negative/infinite float numbers.
2. XSS & HTML Sanitization: Added Bleach pre-filter to strip <script>, <iframe>, and onerror attributes on task descriptions.
3. Database Invariants: Added ON DELETE CASCADE on foreign keys in MySQL to guarantee zero orphan acceptance criteria or subtask rows.
4. JWT Hardening: Enforced RS256 algorithm validation, audience verification, and 60-second maximum clock skew leeway.
5. Quality Guard: Injected business logic preventing tasks from moving to DONE if linked Acceptance Criteria have pending or failing status.`;

  return (
    <div className="w-full space-y-6">
      {/* Intro Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" />
              <span>Specification & Agent Directives</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Engineering PRD & Quality Review Invariants
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Specification with formal acceptance criteria, prompt directives used with Cursor (Frontend) and Claude Code (Backend), and code review checklist for security, edge cases, and JWT authentication.
            </p>
          </div>

          <button
            onClick={() => copyToClipboard(ENGINEERING_SPEC_MARKDOWN, 'full-spec')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            {copiedKey === 'full-spec' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Full Spec Markdown</span>
          </button>
        </div>
      </div>

      {/* Agent Directives & Review Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cursor Prompt Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                <Bot className="w-4 h-4 text-blue-500" />
                <span>Cursor Directive (React UI)</span>
              </div>
              <button
                onClick={() => copyToClipboard(cursorPrompt, 'cursor')}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                title="Copy prompt"
              >
                {copiedKey === 'cursor' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed">
              "{cursorPrompt}"
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Target: React SPA, Kanban, AC indicators, Zero-Pill design
          </div>
        </div>

        {/* Claude Code Prompt Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Claude Code Directive (Flask & MySQL)</span>
              </div>
              <button
                onClick={() => copyToClipboard(claudeCodePrompt, 'claude')}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                title="Copy prompt"
              >
                {copiedKey === 'claude' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed">
              "{claudeCodePrompt}"
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Target: Flask REST, MySQL schemas, PyTest fixtures, JWT
          </div>
        </div>

        {/* Lead Code Review Findings Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Lead Code Review & Security Hardening</span>
              </div>
              <button
                onClick={() => copyToClipboard(yashReviewReviewNotes, 'review')}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                title="Copy review notes"
              >
                {copiedKey === 'review' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1.5 leading-relaxed">
              <div>✓ OWASP XSS HTML stripping filter added</div>
              <div>✓ MySQL cascading foreign keys configured</div>
              <div>✓ JWT clock skew & claim aud validation</div>
              <div>✓ PyTest edge-case tests with SQLite fixture</div>
              <div>✓ Quality guard: block Done without verified ACs</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Audited & Approved by Yash Patil (patilyashv166@gmail.com)
          </div>
        </div>
      </div>

      {/* Full Spec View */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          Specification Document & Requirements Matrix
        </h3>
        <div className="prose dark:prose-invert max-w-none text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed bg-slate-50 dark:bg-slate-950/80 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto whitespace-pre-wrap">
          {ENGINEERING_SPEC_MARKDOWN}
        </div>
      </div>
    </div>
  );
};
