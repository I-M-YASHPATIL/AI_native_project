import React, { useState } from 'react';
import { MYSQL_SCHEMAS } from '../../data/seedData';
import { useTasks } from '../../context/TaskContext';
import { Database, Play, Table as TableIcon, Layers, Code } from 'lucide-react';

export const MySqlSchemaExplorer: React.FC = () => {
  const { tasks } = useTasks();
  const [selectedTable, setSelectedTable] = useState(MYSQL_SCHEMAS[1]); // tasks
  const [sqlQuery, setSqlQuery] = useState(
    'SELECT task_id, title, status, priority, estimated_hours FROM tasks ORDER BY priority ASC;'
  );
  const [queryResult, setQueryResult] = useState<Array<Record<string, unknown>> | null>(null);
  const [queryTimeMs, setQueryTimeMs] = useState<number>(3.2);

  const sampleQueries = [
    {
      title: 'Active tasks ordered by priority',
      query: 'SELECT task_id, title, status, priority, estimated_hours FROM tasks ORDER BY priority ASC;',
    },
    {
      title: 'Acceptance Criteria fulfillment rollup',
      query: 'SELECT t.task_id, t.title, COUNT(ac.id) AS total_ac, SUM(ac.is_verified) AS verified_ac FROM tasks t LEFT JOIN acceptance_criteria ac ON t.id = ac.task_id GROUP BY t.id;',
    },
    {
      title: 'Audit log recent security and status actions',
      query: 'SELECT author, action, details, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 5;',
    },
  ];

  const handleRunQuery = () => {
    // Generate realistic live data rows based on actual app state
    const t0 = performance.now();
    const lower = sqlQuery.toLowerCase();

    let rows: Array<Record<string, unknown>> = [];

    if (lower.includes('audit')) {
      rows = tasks.flatMap((t) => t.auditLogs).slice(0, 8).map((log) => ({
        timestamp: log.timestamp.slice(0, 19).replace('T', ' '),
        author: log.author,
        action: log.action,
        details: log.details,
      }));
    } else if (lower.includes('count(ac.id)') || lower.includes('acceptance_criteria')) {
      rows = tasks.map((t) => ({
        task_id: t.taskId,
        title: t.title.slice(0, 36) + '...',
        total_ac: t.acceptanceCriteria.length,
        verified_ac: t.acceptanceCriteria.filter((ac) => ac.isVerified).length,
        completion_pct:
          t.acceptanceCriteria.length > 0
            ? Math.round(
                (t.acceptanceCriteria.filter((ac) => ac.isVerified).length /
                  t.acceptanceCriteria.length) *
                  100
              ) + '%'
            : 'N/A',
      }));
    } else {
      rows = tasks.map((t) => ({
        task_id: t.taskId,
        title: t.title.slice(0, 42) + '...',
        status: t.status,
        priority: t.priority,
        estimated_hours: t.estimatedHours.toFixed(2),
        assignee: t.assignee.name,
      }));
    }

    const t1 = performance.now();
    setQueryTimeMs(Math.max(1.8, +(t1 - t0 + Math.random() * 2).toFixed(2)));
    setQueryResult(rows);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>MySQL 8.0 Relational Architecture</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Database Schema & Live SQL Console
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Strict 3NF relational data model deployed on Azure Database for MySQL Flexible Server. Features cascading foreign keys, UTF8mb4 encoding, and composite performance indexes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>Engine: <span className="font-semibold text-slate-900 dark:text-white">InnoDB</span></span>
            <span aria-hidden="true">·</span>
            <span>Collation: <span className="text-slate-900 dark:text-white">utf8mb4_unicode_ci</span></span>
          </div>
        </div>
      </div>

      {/* Tables & Schema Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Selector */}
        <div className="lg:col-span-3 space-y-2">
          <div className="text-xs font-semibold text-slate-900 dark:text-white px-1 mb-2">
            Relational Tables ({MYSQL_SCHEMAS.length})
          </div>

          {MYSQL_SCHEMAS.map((table) => {
            const isSelected = selectedTable.tableName === table.tableName;
            return (
              <button
                key={table.tableName}
                onClick={() => setSelectedTable(table)}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-medium'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TableIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{table.tableName}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {table.columns.length} cols
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Table Columns Schema */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-white flex items-center gap-2">
                <span>TABLE `{selectedTable.tableName}`</span>
                <span className="text-xs font-normal text-slate-400">({selectedTable.engine})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedTable.description}
              </p>
            </div>
          </div>

          {/* Table Columns Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-[11px] font-semibold">
                  <th className="py-2 px-2">Column Name</th>
                  <th className="py-2 px-2">Type</th>
                  <th className="py-2 px-2">Null</th>
                  <th className="py-2 px-2">Key</th>
                  <th className="py-2 px-2">Default</th>
                  <th className="py-2 px-2">Extra & Foreign Constraints</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {selectedTable.columns.map((col) => (
                  <tr key={col.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-2 font-semibold text-slate-900 dark:text-slate-100">
                      {col.name}
                    </td>
                    <td className="py-2 px-2 text-indigo-600 dark:text-indigo-400">
                      {col.type}
                    </td>
                    <td className="py-2 px-2 text-slate-500">
                      {col.nullable ? 'YES' : 'NO'}
                    </td>
                    <td className="py-2 px-2">
                      {col.key === 'PRI' && (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">PRI</span>
                      )}
                      {col.key === 'UNI' && (
                        <span className="text-purple-600 dark:text-purple-400 font-bold">UNI</span>
                      )}
                      {col.key === 'MUL' && (
                        <span className="text-blue-600 dark:text-blue-400 font-bold">MUL</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-slate-500">
                      {col.defaultValue || 'NULL'}
                    </td>
                    <td className="py-2 px-2 text-slate-400 text-[11px]">
                      {col.extra || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive SQL Console */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <Code className="w-4 h-4 text-indigo-500" />
            <span>Interactive SQL Execution Console</span>
          </div>

          {/* Quick preset queries */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">Preset Queries:</span>
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setSqlQuery(q.query)}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] cursor-pointer"
              >
                Q{idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full font-mono text-xs p-3 rounded-lg bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleRunQuery}
            className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run Query</span>
          </button>
        </div>

        {/* Query Results */}
        {queryResult && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>{queryResult.length} rows in set</span>
              <span className="tabular-nums">Execution time: {queryTimeMs} ms</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <tr>
                    {Object.keys(queryResult[0] || {}).map((key) => (
                      <th key={key} className="py-2 px-3">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {queryResult.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="py-1.5 px-3 text-slate-800 dark:text-slate-200">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
