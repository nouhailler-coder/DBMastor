import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Layers, 
  Terminal, 
  Database, 
  ChevronRight, 
  Sparkles, 
  Code2, 
  ListOrdered, 
  Activity, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { defaultSqlExercise } from '../data/mockData';

interface SqlLabViewProps {
  lang: 'fr' | 'en';
}

type Dialect = 'oracle' | 'postgres' | 'mysql' | 'azure';
type LabTab = 'results' | 'plan' | 'diagnostics' | 'verification';

export const SqlLabView: React.FC<SqlLabViewProps> = ({ lang }) => {
  const isFr = lang === 'fr';

  const [selectedDialect, setSelectedDialect] = useState<Dialect>('oracle');
  const [activeLabTab, setActiveLabTab] = useState<LabTab>('results');
  const [sqlCode, setSqlCode] = useState(defaultSqlExercise.initialSql);
  const [isRunning, setIsRunning] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const dialects: { id: Dialect; label: string; version: string }[] = [
    { id: 'oracle', label: 'Oracle 19c SQL', version: 'v19.3.0 EE' },
    { id: 'postgres', label: 'PostgreSQL 15', version: 'v15.6' },
    { id: 'mysql', label: 'MySQL 8.0', version: 'v8.0.35' },
    { id: 'azure', label: 'Azure SQL', version: 'v12.0.2' },
  ];

  const handleRunQuery = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasExecuted(true);
      setActiveLabTab('results');
    }, 400);
  };

  const handleFormatCode = () => {
    // Simple query indentation formatter
    setSqlCode((prev) =>
      prev
        .replace(/\bFROM\b/gi, '\nFROM')
        .replace(/\bWHERE\b/gi, '\nWHERE')
        .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
        .replace(/\bORDER BY\b/gi, '\nORDER BY')
        .replace(/\bHAVING\b/gi, '\nHAVING')
    );
  };

  const handleResetCode = () => {
    setSqlCode(defaultSqlExercise.initialSql);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  return (
    <div id="sql-lab-view" className="p-6 max-w-[1720px] mx-auto w-full flex flex-col gap-6">
      {/* 1. TOP DIALECT SELECTOR & BAR */}
      <div className="bg-[#102034] p-3.5 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#4edea3]" />
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-[#d3e4fe]">
              {isFr ? 'Lab SQL & Pratique Interactive' : 'SQL Lab & Interactive Practice'}
            </h1>
            <span className="font-mono text-[10px] text-[#89929b]">
              {isFr ? 'Moteur d\'exécution analytique multi-dialectes' : 'Multi-dialect analytical query sandbox'}
            </span>
          </div>
        </div>

        {/* Dialect selector pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#000f21] rounded-lg border border-[#1b2b3f]">
          {dialects.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDialect(d.id)}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all ${
                selectedDialect === d.id
                  ? 'bg-[#3198dc] text-[#002c47] font-bold shadow-sm'
                  : 'text-[#bfc7d2] hover:text-[#d3e4fe] hover:bg-[#1b2b3f]'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TWO MAIN PANELS: GUIDED EXERCISE (LEFT 4 COLS) & CODE/CONSOLE (RIGHT 8 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: GUIDED EXERCISE & SCHEMA EXPLORER (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Exercise Objectives Card */}
          <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#003824]/40 border border-[#4edea3]/30">
                {defaultSqlExercise.level}
              </span>
              <span className="font-mono text-xs text-[#89929b] font-semibold">
                +25 XP Oracle
              </span>
            </div>

            <h2 className="text-sm font-bold text-[#d3e4fe]">
              {defaultSqlExercise.title}
            </h2>

            <p className="text-xs text-[#bfc7d2] leading-relaxed">
              {defaultSqlExercise.objectiveText}
            </p>

            {/* Checklist */}
            <div className="flex flex-col gap-2 pt-1">
              {defaultSqlExercise.checklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs bg-[#0b1c30] p-2.5 rounded-lg border border-[#1b2b3f]">
                  <CheckCircle2 className="w-4 h-4 text-[#4edea3] shrink-0 mt-0.5" />
                  <span className="text-[#d3e4fe] font-mono leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-lg bg-[#000f21] border border-[#1b2b3f] text-[11px] text-[#89929b] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#93ccff] shrink-0" />
              <span>
                {isFr ? 'Astuce: DENSE_RANK() ne crée aucun saut de rang en cas d\'ex-aequo.' : 'Tip: DENSE_RANK() does not create gaps in rank ranking.'}
              </span>
            </div>
          </div>

          {/* Schema Explorer */}
          <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#93ccff]" />
                <h3 className="text-sm font-bold text-[#d3e4fe]">
                  {isFr ? 'Explorateur de Schéma' : 'Schema Explorer'}
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[#89929b]">hr_schema</span>
            </div>

            {/* Table 1: hr.employees */}
            <div className="rounded-lg bg-[#0b1c30] border border-[#1b2b3f] overflow-hidden">
              <div className="px-3 py-2 bg-[#1b2b3f] flex items-center justify-between font-mono text-xs text-[#d3e4fe] font-bold">
                <span>hr.employees</span>
                <span className="text-[10px] text-[#4edea3]">107 {isFr ? 'lignes' : 'rows'}</span>
              </div>
              <div className="p-2.5 flex flex-col gap-1 font-mono text-[11px]">
                <div className="flex justify-between text-[#89ceff]">
                  <span>employee_id (PK)</span>
                  <span className="text-[#89929b]">NUMBER(6)</span>
                </div>
                <div className="flex justify-between text-[#bfc7d2]">
                  <span>first_name</span>
                  <span className="text-[#89929b]">VARCHAR2(20)</span>
                </div>
                <div className="flex justify-between text-[#bfc7d2]">
                  <span>last_name</span>
                  <span className="text-[#89929b]">VARCHAR2(25) NOT NULL</span>
                </div>
                <div className="flex justify-between text-[#93ccff]">
                  <span>department_id (FK)</span>
                  <span className="text-[#89929b]">NUMBER(4)</span>
                </div>
                <div className="flex justify-between text-[#4edea3]">
                  <span>salary</span>
                  <span className="text-[#89929b]">NUMBER(8,2)</span>
                </div>
                <div className="flex justify-between text-[#bfc7d2]">
                  <span>hire_date</span>
                  <span className="text-[#89929b]">DATE</span>
                </div>
              </div>
            </div>

            {/* Table 2: hr.departments */}
            <div className="rounded-lg bg-[#0b1c30] border border-[#1b2b3f] overflow-hidden">
              <div className="px-3 py-2 bg-[#1b2b3f] flex items-center justify-between font-mono text-xs text-[#d3e4fe] font-bold">
                <span>hr.departments</span>
                <span className="text-[10px] text-[#89929b]">27 {isFr ? 'lignes' : 'rows'}</span>
              </div>
              <div className="p-2.5 flex flex-col gap-1 font-mono text-[11px]">
                <div className="flex justify-between text-[#89ceff]">
                  <span>department_id (PK)</span>
                  <span className="text-[#89929b]">NUMBER(4)</span>
                </div>
                <div className="flex justify-between text-[#bfc7d2]">
                  <span>department_name</span>
                  <span className="text-[#89929b]">VARCHAR2(30)</span>
                </div>
                <div className="flex justify-between text-[#bfc7d2]">
                  <span>manager_id</span>
                  <span className="text-[#89929b]">NUMBER(6)</span>
                </div>
              </div>
            </div>

            {/* Mini Relational Link */}
            <div className="p-2 rounded bg-[#000f21] border border-[#1b2b3f] font-mono text-[10px] text-[#89929b] text-center">
              employees.department_id <span className="text-[#4edea3]">───(FK ➔ PK)───</span> departments.department_id
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: SQL EDITOR & CONSOLE (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* SQL CODE EDITOR */}
          <div className="bg-[#102034] rounded-xl border border-[#1b2b3f] shadow-md overflow-hidden flex flex-col">
            {/* Editor Toolbar Header */}
            <div className="px-4 py-2.5 bg-[#0b1c30] border-b border-[#1b2b3f] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#93ccff]" />
                <span className="font-mono text-xs font-bold text-[#d3e4fe]">query_window_01.sql</span>
                <span className="font-mono text-[10px] text-[#4edea3] bg-[#003824]/40 px-1.5 py-0.5 rounded">
                  {isFr ? 'Prêt' : 'Ready'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 text-[#89929b] hover:text-[#d3e4fe] transition-colors"
                  title="Copier SQL"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#4edea3]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleFormatCode}
                  className="px-2.5 py-1 text-xs font-mono text-[#bfc7d2] hover:text-[#d3e4fe] bg-[#1b2b3f] hover:bg-[#26364a] rounded transition-colors"
                >
                  Format SQL
                </button>
                <button
                  onClick={handleResetCode}
                  className="px-2 py-1 text-xs font-mono text-[#89929b] hover:text-[#d3e4fe] bg-[#1b2b3f] rounded transition-colors"
                  title="Réinitialiser"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRunQuery}
                  disabled={isRunning}
                  className="px-4 py-1.5 bg-[#3198dc] hover:bg-[#93ccff] text-[#002c47] font-mono text-xs font-bold rounded-lg shadow-md shadow-[#3198dc]/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunning ? (isFr ? 'Exécution...' : 'Running...') : (isFr ? 'Exécuter (Ctrl+Entrée)' : 'Run (Ctrl+Enter)')}</span>
                </button>
              </div>
            </div>

            {/* Editable SQL Code Area */}
            <div className="p-4 bg-[#000f21] font-mono text-xs">
              <textarea
                value={sqlCode}
                onChange={(e) => setSqlCode(e.target.value)}
                rows={11}
                className="w-full bg-transparent text-[#93ccff] font-mono text-xs leading-relaxed outline-none resize-none selection:bg-[#3198dc]/30"
                spellCheck={false}
              />
            </div>
          </div>

          {/* EXECUTION RESULTS, PLAN & VERIFICATION CONSOLE */}
          <div className="bg-[#102034] rounded-xl border border-[#1b2b3f] shadow-md overflow-hidden flex flex-col">
            {/* Console Tabs */}
            <div className="flex items-center px-4 bg-[#0b1c30] border-b border-[#1b2b3f] overflow-x-auto">
              <button
                onClick={() => setActiveLabTab('results')}
                className={`py-2.5 px-3 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeLabTab === 'results'
                    ? 'border-[#3198dc] text-[#d3e4fe] font-bold'
                    : 'border-transparent text-[#89929b] hover:text-[#bfc7d2]'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>{isFr ? 'Résultats (10 lignes)' : 'Query Results (10 rows)'}</span>
              </button>

              <button
                onClick={() => setActiveLabTab('plan')}
                className={`py-2.5 px-3 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeLabTab === 'plan'
                    ? 'border-[#3198dc] text-[#d3e4fe] font-bold'
                    : 'border-transparent text-[#89929b] hover:text-[#bfc7d2]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{isFr ? 'Plan d\'Exécution' : 'Execution Plan'}</span>
              </button>

              <button
                onClick={() => setActiveLabTab('diagnostics')}
                className={`py-2.5 px-3 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeLabTab === 'diagnostics'
                    ? 'border-[#3198dc] text-[#d3e4fe] font-bold'
                    : 'border-transparent text-[#89929b] hover:text-[#bfc7d2]'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{isFr ? 'Diagnostics & Messages' : 'Messages & Diagnostics'}</span>
              </button>

              <button
                onClick={() => setActiveLabTab('verification')}
                className={`py-2.5 px-3 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeLabTab === 'verification'
                    ? 'border-[#4edea3] text-[#4edea3] font-bold'
                    : 'border-transparent text-[#89929b] hover:text-[#bfc7d2]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
                <span>{isFr ? 'Validation (3/3 validé)' : 'Test Verification (3/3)'}</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-4 flex flex-col gap-3 min-h-[260px]">
              {/* Validation Success Banner */}
              {hasExecuted && (
                <div className="p-3 rounded-lg bg-[#003824]/40 border border-[#4edea3]/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-[#4edea3] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#d3e4fe]">
                        {isFr ? 'Succès ! 100% Validation Réussie' : 'Success! 100% Verification Passed'}
                      </span>
                      <span className="text-[11px] text-[#bfc7d2]">
                        {isFr 
                          ? 'Votre requête respecte strictement les clauses analytiques attendues par l\'examen Oracle 1Z0-071.'
                          : 'Your query complies strictly with the analytical clauses expected by Oracle 1Z0-071.'}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-[#4edea3] font-bold bg-[#000f21] px-2.5 py-1 rounded border border-[#4edea3]/30 whitespace-nowrap">
                    +25 XP
                  </span>
                </div>
              )}

              {/* TAB 1: RESULTS TABLE */}
              {activeLabTab === 'results' && (
                <div className="rounded-lg bg-[#000f21] border border-[#1b2b3f] overflow-x-auto shadow-inner">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="bg-[#0b1c30] border-b border-[#1b2b3f] text-[#89929b]">
                        {defaultSqlExercise.defaultOutput.columns.map((col, i) => (
                          <th key={i} className="px-3.5 py-2 text-[11px] font-semibold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#102034]">
                      {defaultSqlExercise.defaultOutput.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[#102034]/60 transition-colors text-[#d3e4fe]">
                          {row.map((val, cIdx) => (
                            <td key={cIdx} className="px-3.5 py-2 text-xs">
                              {cIdx === 4 ? (
                                <span className="px-1.5 py-0.5 rounded bg-[#3198dc]/20 text-[#93ccff] font-bold">
                                  {val}
                                </span>
                              ) : cIdx === 5 ? (
                                <span className="text-[#4edea3] font-semibold">{val}</span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: EXECUTION PLAN */}
              {activeLabTab === 'plan' && (
                <div className="p-3 bg-[#000f21] rounded-lg border border-[#1b2b3f] font-mono text-xs text-[#d3e4fe] flex flex-col gap-2">
                  <span className="text-[#89929b] text-[11px] pb-1 border-b border-[#1b2b3f]">
                    Plan Hash Value: 3829103847 • Cost: 4 • CPU: 0.012s
                  </span>
                  <div className="whitespace-pre text-[#93ccff] leading-relaxed">
{`--------------------------------------------------------------------------------------
| Id  | Operation                     | Name      | Rows  | Bytes | Cost (%CPU)| Time     |
--------------------------------------------------------------------------------------
|   0 | SELECT STATEMENT              |           |    10 |   540 |     4   (0)| 00:00:01 |
|   1 |  WINDOW BUFFER                |           |    10 |   540 |     4   (0)| 00:00:01 |
|   2 |   WINDOW SORT                 |           |    10 |   540 |     4   (0)| 00:00:01 |
|   3 |    TABLE ACCESS FULL          | EMPLOYEES |   107 |  5778 |     3   (0)| 00:00:01 |
--------------------------------------------------------------------------------------

Predicate Information (identified by operation id):
---------------------------------------------------
   1 - filter(ROW_NUMBER() OVER (...) <= 10)`}
                  </div>
                </div>
              )}

              {/* TAB 3: DIAGNOSTICS */}
              {activeLabTab === 'diagnostics' && (
                <div className="p-3 bg-[#000f21] rounded-lg border border-[#1b2b3f] font-mono text-xs flex flex-col gap-2">
                  <span className="text-[#4edea3]">
                    ✓ Parsing syntaxique validé sans warning.
                  </span>
                  <span className="text-[#4edea3]">
                    ✓ Résolution des colonnes de la table hr.employees complétée.
                  </span>
                  <span className="text-[#93ccff]">
                    ℹ Mémoire PGA allouée pour le buffer de fenêtrage analytique: 64 KB.
                  </span>
                  <span className="text-[#89929b]">
                    Temps d'exécution serveur: 14ms.
                  </span>
                </div>
              )}

              {/* TAB 4: VERIFICATION */}
              {activeLabTab === 'verification' && (
                <div className="flex flex-col gap-2.5 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[#003824]/30 border border-[#4edea3]/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
                      <span className="text-[#d3e4fe]">1. Présence de DENSE_RANK() avec PARTITION BY department_id</span>
                    </div>
                    <span className="text-[#4edea3] font-bold">PASSED</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#003824]/30 border border-[#4edea3]/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
                      <span className="text-[#d3e4fe]">2. Fenêtre glissante running_total avec bornes UNBOUNDED PRECEDING</span>
                    </div>
                    <span className="text-[#4edea3] font-bold">PASSED</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#003824]/30 border border-[#4edea3]/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
                      <span className="text-[#d3e4fe]">3. Correspondance exacte des types et projection des attributs demandés</span>
                    </div>
                    <span className="text-[#4edea3] font-bold">PASSED</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
