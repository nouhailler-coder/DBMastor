import React, { useState } from 'react';
import { executeSql, SqlQueryResult } from '../../services/sqlEngineService';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { Play, Sparkles, Check, Database, ExternalLink } from 'lucide-react';

interface SqlLabSectionProps {
  t: LandingTranslations['sqlLab'];
  onOpenApp: (tab?: string) => void;
}

export const SqlLabSection: React.FC<SqlLabSectionProps> = ({ t, onOpenApp }) => {
  const [query, setQuery] = useState(
`SELECT 
    department_id, 
    COUNT(*) AS employee_count
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 5;`
  );

  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(() => {
    return executeSql(
      `SELECT department_id, COUNT(*) AS employee_count FROM employees GROUP BY department_id HAVING COUNT(*) > 5;`
    );
  });

  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const res = executeSql(query);
      setQueryResult(res);
      setIsExecuting(false);
    }, 50);
  };

  const sampleQueries = [
    {
      label: 'GROUP BY & HAVING',
      sql: `SELECT 
    department_id, 
    COUNT(*) AS employee_count
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 5;`
    },
    {
      label: 'INNER JOIN & Salary',
      sql: `SELECT 
    e.last_name, 
    d.department_name, 
    e.salary
FROM employees e
JOIN departments d ON e.department_id = d.department_id
WHERE e.salary > 6500
ORDER BY e.salary DESC;`
    },
    {
      label: 'DENSE_RANK Window',
      sql: `SELECT 
    last_name, 
    department_id, 
    salary,
    DENSE_RANK(salary) AS salary_rank
FROM employees
WHERE department_id = 60
ORDER BY salary DESC;`
    }
  ];

  return (
    <section id="sqllab" className="py-24 bg-[#050c18] border-t border-[#1b2b3f] relative overflow-hidden">
      {/* Background radial glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#0284c7]/10 blur-[140px] pointer-events-none rounded-full"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#38bdf8] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            {t.tag}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t.headline}
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {t.features.slice(0, 4).map((feature, idx) => (
            <div 
              key={idx}
              className="bg-[#0b1728]/80 border border-[#1b2b3f] p-4 rounded-xl backdrop-blur-sm hover:border-[#38bdf8]/40 transition-colors"
            >
              <div className="text-xs font-mono text-[#4edea3] font-bold mb-1">0{idx + 1} // CAPABILITY</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-200">{feature}</div>
            </div>
          ))}
        </div>

        {/* Interactive SQL Lab Editor Card */}
        <div className="bg-[#030a14] border border-[#1b2b3f] rounded-2xl shadow-2xl overflow-hidden">
          {/* Editor Header */}
          <div className="bg-[#081322] border-b border-[#1b2b3f] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="h-4 w-px bg-slate-700 mx-1" />
              <span className="text-xs font-mono text-slate-400 font-medium">{t.sampleTitle}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60 font-semibold">
                AlaSQL Engine
              </span>
            </div>

            {/* Preset Query Switchers */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Requêtes types :</span>
              {sampleQueries.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(item.sql);
                    const res = executeSql(item.sql);
                    setQueryResult(res);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-colors ${
                    query.trim() === item.sql.trim()
                      ? 'bg-[#0284c7] text-white font-bold shadow'
                      : 'bg-[#102034] hover:bg-[#1b2b3f] text-slate-300 border border-slate-700/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editor & Control */}
          <div className="p-4 sm:p-6 bg-[#030a14]/95 border-b border-[#1b2b3f]">
            <label htmlFor="landing-sql-input" className="sr-only">SQL Query Input</label>
            <textarea
              id="landing-sql-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={6}
              spellCheck={false}
              className="w-full bg-[#071322] font-mono text-sm sm:text-base text-[#4edea3] p-4 rounded-xl border border-[#1b2b3f] focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] outline-none resize-y selection:bg-[#0284c7]/30"
              placeholder="SELECT ... FROM ...;"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRunQuery}
                  disabled={isExecuting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4edea3] to-[#25a56d] hover:from-[#5eedb0] hover:to-[#2cb97b] text-[#031427] font-bold text-sm shadow-lg shadow-[#4edea3]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isExecuting ? t.executing : t.runQuery}</span>
                </button>

                {queryResult && (
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-[#4edea3] font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      {queryResult.rowCount} {t.rowsCount}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>{queryResult.executionTimeMs} ms</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onOpenApp('sandbox')}
                className="inline-flex items-center gap-2 text-xs font-mono text-[#38bdf8] hover:text-[#7dd3fc] font-semibold transition-colors cursor-pointer"
              >
                <span>Ouvrir l'Interactive SQL Lab complet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Results Output Section */}
          <div className="p-4 sm:p-6 bg-[#020710]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Résultat de l'exécution
              </span>
              <span className="text-xs font-mono text-slate-500">
                Tables in-memory : <code className="text-slate-300">employees</code> (44 rows), <code className="text-slate-300">departments</code> (4 rows)
              </span>
            </div>

            {queryResult?.error ? (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 font-mono text-xs">
                <div className="font-bold mb-1">Erreur SQL :</div>
                {queryResult.error}
              </div>
            ) : queryResult && queryResult.columns.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-[#1b2b3f] bg-[#071322]">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-[#0b1728] border-b border-[#1b2b3f] text-slate-300">
                      {queryResult.columns.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-4 font-bold tracking-wider text-[#38bdf8] uppercase">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b2b3f]/60 text-slate-200">
                    {queryResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#102034]/60 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-4">
                            {cell === null ? (
                              <span className="text-slate-500 italic">NULL</span>
                            ) : typeof cell === 'number' ? (
                              <span className="text-amber-400 font-bold">{cell}</span>
                            ) : (
                              <span>{String(cell)}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                {queryResult?.rowCount === 0 ? 'Aucune ligne retournée (0 rows)' : 'Exécutez une requête pour afficher les données'}
              </div>
            )}

            {/* Disclaimer Callout */}
            <div className="mt-6 flex items-start gap-3 p-3.5 rounded-xl bg-[#0b1728]/80 border border-[#1b2b3f] text-xs text-slate-400">
              <Database className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 font-medium">Architecture sécurisée : </strong>
                {t.notice}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
