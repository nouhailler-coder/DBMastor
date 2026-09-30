import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
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
  Check,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Eye,
  Rows,
  Table as TableIcon,
  HelpCircle,
  Award
} from 'lucide-react';
import { 
  executeSql, 
  initializeDatabase, 
  sqlExercisesCatalog, 
  SqlQueryResult, 
  ExerciseValidation, 
  SqlTrainingExercise 
} from '../services/sqlEngineService';
import { SqlPerformanceTips } from './SqlPerformanceTips';
import { SqlDataBrowser } from './SqlDataBrowser';
import { SqlSchemaDesigner } from './SqlSchemaDesigner';

interface SqlLabViewProps {
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

type Dialect = 'oracle' | 'postgres' | 'mysql' | 'azure';
type LabTab = 'results' | 'validation' | 'plan' | 'diagnostics';
type TrioTab = 'editor' | 'browser' | 'schema';

export const SqlLabView: React.FC<SqlLabViewProps> = ({ 
  lang,
  theme = 'light',
  isFocusMode = false,
  onToggleFocusMode
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  // Trio View: SQL Editor & Console, Data Browser, Schema Designer
  const [activeTrioTab, setActiveTrioTab] = useState<TrioTab>('editor');

  // Active Exercise selection (Default: Exercise 1 - GROUP BY & COUNT)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(sqlExercisesCatalog[0].id);
  const currentExercise = sqlExercisesCatalog.find((e) => e.id === selectedExerciseId) || sqlExercisesCatalog[0];

  const [selectedDialect, setSelectedDialect] = useState<Dialect>('oracle');
  const [activeLabTab, setActiveLabTab] = useState<LabTab>('results');
  const [sqlCode, setSqlCode] = useState(currentExercise.initialSql);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showExercisePanel, setShowExercisePanel] = useState(true);
  const [editorExpanded, setEditorExpanded] = useState(false);

  // Real SQL Execution and Dynamic Validation state
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [validationResult, setValidationResult] = useState<ExerciseValidation | null>(null);

  const dialects: { id: Dialect; label: string; version: string }[] = [
    { id: 'oracle', label: 'Oracle 19c SQL', version: 'v19.3.0 EE' },
    { id: 'postgres', label: 'PostgreSQL 15', version: 'v15.6' },
    { id: 'mysql', label: 'MySQL 8.0', version: 'v8.0.35' },
    { id: 'azure', label: 'Azure SQL', version: 'v12.0.2' },
  ];

  // Initialize DB and run initial query on mount
  useEffect(() => {
    initializeDatabase();
    runQueryWithSql(currentExercise.initialSql, currentExercise);
  }, []);

  // When changing exercise, populate editor and run
  const handleSelectExercise = (exercise: SqlTrainingExercise) => {
    setSelectedExerciseId(exercise.id);
    setSqlCode(exercise.initialSql);
    runQueryWithSql(exercise.initialSql, exercise);
    setActiveLabTab('results');
  };

  // Run Query with real in-browser SQL engine
  const runQueryWithSql = (codeToRun: string, exerciseTarget: SqlTrainingExercise) => {
    setIsRunning(true);
    setTimeout(() => {
      const res = executeSql(codeToRun);
      setQueryResult(res);
      const val = exerciseTarget.validate(codeToRun, res);
      setValidationResult(val);
      setIsRunning(false);
    }, 150);
  };

  const handleRunQuery = () => {
    runQueryWithSql(sqlCode, currentExercise);
    setActiveLabTab('results');
  };

  // Keyboard shortcuts: Esc for Focus Mode, Ctrl+Enter to execute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode && onToggleFocusMode) {
        e.preventDefault();
        onToggleFocusMode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunQuery();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, onToggleFocusMode, sqlCode, currentExercise]);

  const handleFormatCode = () => {
    setSqlCode((prev) =>
      prev
        .replace(/\bFROM\b/gi, '\nFROM')
        .replace(/\bWHERE\b/gi, '\nWHERE')
        .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
        .replace(/\bORDER BY\b/gi, '\nORDER BY')
        .replace(/\bHAVING\b/gi, '\nHAVING')
        .replace(/\bJOIN\b/gi, '\nJOIN')
        .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
    );
  };

  const handleResetCode = () => {
    setSqlCode(currentExercise.initialSql);
    runQueryWithSql(currentExercise.initialSql, currentExercise);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  const handleLoadSolution = () => {
    setSqlCode(currentExercise.solutionSql);
    runQueryWithSql(currentExercise.solutionSql, currentExercise);
  };

  return (
    <div 
      id="sql-lab-view" 
      className={`mx-auto w-full flex flex-col transition-all duration-200 ${
        isFocusMode 
          ? 'p-4 max-w-full gap-4' 
          : 'p-6 max-w-[1720px] gap-6'
      }`}
    >
      {/* 1. TOP BAR (WITH DATABASE MANAGEMENT TRIO SWITCHER) */}
      <div className={`p-3 rounded-xl border shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-colors ${
        isLight 
          ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
          : isFocusMode 
            ? 'bg-[#091829] border-[#3198dc]/40 ring-1 ring-[#3198dc]/20' 
            : 'bg-[#102034] border-[#1b2b3f]'
      }`}>
        {/* Left branding & title */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Terminal className="w-5 h-5 text-[#16a34a] dark:text-[#4edea3] shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isFr ? 'Plateforme d\'Entraînement SQL' : 'SQL Training & Execution Lab'}
              </h1>
              <span className="font-mono text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-[#4edea3] px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {isFr ? 'Moteur SQL Réel (In-Memory)' : 'Real In-Memory SQL Engine'}
              </span>
              {isFocusMode && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#002c47] text-[#89ceff] border border-[#3198dc]/40 shadow-sm">
                  {isFr ? 'FOCUS ACTIF' : 'FOCUS ACTIVE'}
                </span>
              )}
            </div>
            <span className={`font-mono text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
              {isFr 
                ? 'Exécution dynamique in-browser • Validation automatique des consignes • Tables relationnelles réelles' 
                : 'Live in-browser execution • Automatic validation • Real relational datasets'}
            </span>
          </div>
        </div>

        {/* Center: TRIO NAVIGATION (Éditeur SQL + Navigateur de données + Conception de schéma) */}
        <div className={`flex items-center gap-1 p-1 rounded-xl border self-start lg:self-auto overflow-x-auto transition-colors ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#000f21] border-[#1b2b3f]'
        }`}>
          <button
            onClick={() => setActiveTrioTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTrioTab === 'editor'
                ? isLight 
                  ? 'bg-white text-sky-700 font-bold shadow-sm border border-slate-200' 
                  : 'bg-[#3198dc] text-[#002c47] font-bold shadow-sm'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-300 hover:text-white hover:bg-[#1b2b3f]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{isFr ? 'Éditeur & Console' : 'SQL Editor & Lab'}</span>
          </button>

          <button
            onClick={() => setActiveTrioTab('browser')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTrioTab === 'browser'
                ? isLight 
                  ? 'bg-white text-sky-700 font-bold shadow-sm border border-slate-200' 
                  : 'bg-[#3198dc] text-[#002c47] font-bold shadow-sm'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-300 hover:text-white hover:bg-[#1b2b3f]'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{isFr ? 'Navigateur de Données' : 'Data Browser'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
              isLight ? 'bg-slate-200 text-slate-700' : 'bg-black/40 text-slate-200'
            }`}>44</span>
          </button>

          <button
            onClick={() => setActiveTrioTab('schema')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTrioTab === 'schema'
                ? isLight 
                  ? 'bg-white text-sky-700 font-bold shadow-sm border border-slate-200' 
                  : 'bg-[#3198dc] text-[#002c47] font-bold shadow-sm'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-300 hover:text-white hover:bg-[#1b2b3f]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isFr ? 'Conception de Schéma' : 'Schema Design (ERD)'}</span>
          </button>
        </div>

        {/* Right Controls: Dialect & Focus buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dialect Selector */}
          <div className={`hidden sm:flex items-center gap-1 p-1 rounded-lg border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#000f21] border-[#1b2b3f]'
          }`}>
            {dialects.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDialect(d.id)}
                className={`px-2 py-1 rounded text-xs font-mono font-medium transition-all ${
                  selectedDialect === d.id
                    ? isLight 
                      ? 'bg-white text-sky-700 font-bold shadow-sm border border-slate-200' 
                      : 'bg-[#1b2b3f] text-white font-bold border border-[#3198dc]/30'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-300 hover:text-white'
                }`}
                title={d.version}
              >
                {d.label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Toggle Schema panel button in focus mode */}
          {isFocusMode && activeTrioTab === 'editor' && (
            <button
              onClick={() => setShowExercisePanel(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 ${
                isLight 
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm' 
                  : 'bg-[#1b2b3f] hover:bg-[#26364a] text-white border-[#26364a]'
              }`}
              title={showExercisePanel ? (isFr ? 'Masquer exercices' : 'Hide exercises') : (isFr ? 'Afficher exercices' : 'Show exercises')}
            >
              {showExercisePanel ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{showExercisePanel ? (isFr ? 'Masquer' : 'Hide') : (isFr ? 'Consignes' : 'Tasks')}</span>
            </button>
          )}

          {/* Focus Mode Toggle */}
          {onToggleFocusMode && (
            <button
              id="sql-focus-mode-toggle"
              onClick={onToggleFocusMode}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                isFocusMode 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 ring-1 ring-emerald-400/30' 
                  : isLight
                    ? 'bg-white hover:bg-slate-100 text-sky-700 border border-slate-300 shadow-sm'
                    : 'bg-[#1b2b3f] hover:bg-[#26364a] text-white border border-[#26364a]'
              }`}
            >
              {isFocusMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-white" />
                  <span>{isFr ? 'Quitter Focus (Échap)' : 'Exit Focus (Esc)'}</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-sky-500" />
                  <span>{isFr ? 'Mode Focus' : 'Focus Mode'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. TAB 2: DATA BROWSER */}
      {activeTrioTab === 'browser' && (
        <SqlDataBrowser
          lang={lang}
          theme={theme}
          onLoadQueryIntoEditor={(sql) => {
            setSqlCode(sql);
            setActiveTrioTab('editor');
            runQueryWithSql(sql, currentExercise);
          }}
        />
      )}

      {/* 3. TAB 3: SCHEMA DESIGNER */}
      {activeTrioTab === 'schema' && (
        <SqlSchemaDesigner
          lang={lang}
          theme={theme}
          onLoadQueryIntoEditor={(sql) => {
            setSqlCode(sql);
            setActiveTrioTab('editor');
            runQueryWithSql(sql, currentExercise);
          }}
        />
      )}

      {/* 4. TAB 1: SQL EDITOR & EXERCISES */}
      {activeTrioTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT PANEL: EXERCISES CATALOG & SCHEMA INSPECTOR */}
          {showExercisePanel && (
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* Exercise Selector & Details */}
              <div className={`p-4 rounded-xl border shadow-md flex flex-col gap-3 transition-colors ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#102034] border-[#1b2b3f]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                    isLight 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'bg-[#003824]/40 text-[#4edea3] border-[#4edea3]/30'
                  }`}>
                    {currentExercise.level}
                  </span>
                  <span className={`font-mono text-xs font-bold flex items-center gap-1 ${
                    isLight ? 'text-sky-700' : 'text-[#89ceff]'
                  }`}>
                    <Award className="w-3.5 h-3.5 text-[#f59e0b]" />
                    +{currentExercise.xp} XP
                  </span>
                </div>

                {/* Exercises selection tabs */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className={`text-[11px] font-mono font-semibold ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}>
                    {isFr ? 'Choisir un exercice d\'entraînement :' : 'Select training exercise:'}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {sqlExercisesCatalog.map((ex, idx) => (
                      <button
                        key={ex.id}
                        onClick={() => handleSelectExercise(ex)}
                        className={`p-2.5 rounded-lg border text-left font-mono transition-all flex items-start gap-2.5 ${
                          selectedExerciseId === ex.id
                            ? isLight 
                              ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-sm' 
                              : 'bg-[#002c47] border-[#3198dc] text-white shadow-sm'
                            : isLight 
                              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900' 
                              : 'bg-[#0b1c30] border-[#1b2b3f] text-slate-300 hover:text-white hover:border-[#26364a]'
                        }`}
                      >
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                          selectedExerciseId === ex.id 
                            ? isLight ? 'bg-sky-600 text-white' : 'bg-[#3198dc] text-[#002c47]' 
                            : isLight ? 'bg-slate-200 text-slate-700' : 'bg-[#1b2b3f] text-slate-300'
                        }`}>
                          #{idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold leading-snug ${
                            selectedExerciseId === ex.id 
                              ? isLight ? 'text-sky-950 font-bold' : 'text-white' 
                              : isLight ? 'text-slate-900' : 'text-slate-200'
                          }`}>
                            {isFr ? ex.titleFr : ex.titleEn}
                          </span>
                          <span className={`text-[10px] ${
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {isFr ? ex.categoryFr : ex.categoryEn}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Exercise Objective */}
                <div className={`p-3 rounded-lg border flex flex-col gap-2 transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b1c30] border-[#1b2b3f]'
                }`}>
                  <span className={`font-bold text-xs ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {isFr ? 'Consigne :' : 'Objective:'}
                  </span>
                  <p className={`text-xs leading-relaxed ${
                    isLight ? 'text-slate-700' : 'text-slate-200'
                  }`}>
                    {isFr ? currentExercise.instructionFr : currentExercise.instructionEn}
                  </p>

                  <div className={`p-2 rounded border text-[11px] font-mono flex items-center gap-1.5 ${
                    isLight 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                      : 'bg-[#000f21] border-[#1b2b3f] text-[#4edea3]'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{isFr ? currentExercise.expectedOutputSummaryFr : currentExercise.expectedOutputSummaryEn}</span>
                  </div>
                </div>

                {/* Solution & Hint Drawer */}
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[11px] flex items-center gap-1 ${
                    isLight ? 'text-slate-600' : 'text-slate-300'
                  }`}>
                    <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
                    {isFr ? currentExercise.hintFr : currentExercise.hintEn}
                  </span>
                  <button
                    onClick={handleLoadSolution}
                    className="text-[11px] font-mono text-sky-600 dark:text-[#89ceff] hover:underline whitespace-nowrap font-bold"
                  >
                    {isFr ? 'Charger solution' : 'Load solution'}
                  </button>
                </div>
              </div>

              {/* Real DB Tables Quick Inspector */}
              <div className={`p-4 rounded-xl border shadow-md flex flex-col gap-3 transition-colors ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#102034] border-[#1b2b3f]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-600 dark:text-[#4edea3]" />
                    <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isFr ? 'Tables Relationnelles Disponibles' : 'Available Database Tables'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setActiveTrioTab('browser')}
                    className="font-mono text-[10px] text-sky-600 dark:text-[#89ceff] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>{isFr ? 'Ouvrir navigateur' : 'Open browser'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Table 1: employees */}
                <div className={`rounded-lg border overflow-hidden transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b1c30] border-[#1b2b3f]'
                }`}>
                  <div className={`px-3 py-2 flex items-center justify-between font-mono text-xs font-bold border-b ${
                    isLight 
                      ? 'bg-slate-100 text-slate-900 border-slate-200' 
                      : 'bg-[#1b2b3f] text-white border-[#1b2b3f]'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <TableIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-[#4edea3]" />
                      <span>employees</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isLight ? 'text-emerald-700 bg-emerald-100' : 'text-[#4edea3] bg-[#003824]'
                    }`}>44 {isFr ? 'lignes' : 'rows'}</span>
                  </div>
                  <div className="p-2.5 flex flex-col gap-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className={isLight ? 'text-sky-700 font-semibold' : 'text-[#89ceff]'}>employee_id (PK)</span>
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>INT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isLight ? 'text-slate-700' : 'text-slate-200'}>department</span>
                      <span className={isLight ? 'text-emerald-700 font-bold' : 'text-[#4edea3] font-bold'}>IT (12) • HR (8) • Sales (24)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isLight ? 'text-sky-700 font-semibold' : 'text-[#93ccff]'}>department_id (FK)</span>
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>INT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isLight ? 'text-slate-700' : 'text-slate-200'}>salary</span>
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>INT</span>
                    </div>
                  </div>
                </div>

                {/* Table 2: departments */}
                <div className={`rounded-lg border overflow-hidden transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b1c30] border-[#1b2b3f]'
                }`}>
                  <div className={`px-3 py-2 flex items-center justify-between font-mono text-xs font-bold border-b ${
                    isLight 
                      ? 'bg-slate-100 text-slate-900 border-slate-200' 
                      : 'bg-[#1b2b3f] text-white border-[#1b2b3f]'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      <TableIcon className="w-3.5 h-3.5 text-sky-600 dark:text-[#89ceff]" />
                      <span>departments</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isLight ? 'text-sky-700 bg-sky-100' : 'text-[#89ceff] bg-[#002c47]'
                    }`}>4 {isFr ? 'lignes' : 'rows'}</span>
                  </div>
                  <div className="p-2.5 flex flex-col gap-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className={isLight ? 'text-sky-700 font-semibold' : 'text-[#89ceff]'}>department_id (PK)</span>
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>INT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isLight ? 'text-slate-700' : 'text-slate-200'}>department_name</span>
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>STRING (HR, IT, Sales...)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT PANEL: SQL CODE EDITOR & RESULTS CONSOLE */}
          <div className={`${showExercisePanel ? 'lg:col-span-8' : 'col-span-12'} flex flex-col gap-5`}>
            {/* SQL EDITOR CARD */}
            <div className={`rounded-xl border shadow-md overflow-hidden flex flex-col transition-colors ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#102034] border-[#1b2b3f]'
            }`}>
              {/* Editor Header */}
              <div className={`px-4 py-2.5 border-b flex items-center justify-between flex-wrap gap-2 transition-colors ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b1c30] border-[#1b2b3f]'
              }`}>
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-sky-500" />
                  <span className={`font-mono text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {isFr ? 'Éditeur SQL Interactif' : 'Interactive SQL Editor'}
                  </span>
                  <span className={`font-mono text-[10px] hidden sm:inline ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
                    ({dialects.find(d => d.id === selectedDialect)?.label})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFormatCode}
                    className={`p-1.5 rounded transition-colors text-xs font-mono flex items-center gap-1 ${
                      isLight 
                        ? 'hover:bg-slate-200 text-slate-600 hover:text-slate-900' 
                        : 'hover:bg-[#1b2b3f] text-slate-300 hover:text-white'
                    }`}
                    title={isFr ? 'Formater le code SQL' : 'Format SQL code'}
                  >
                    <span>{isFr ? 'Formater' : 'Format'}</span>
                  </button>

                  <button
                    onClick={handleResetCode}
                    className={`p-1.5 rounded transition-colors text-xs font-mono flex items-center gap-1 ${
                      isLight 
                        ? 'hover:bg-slate-200 text-slate-600 hover:text-slate-900' 
                        : 'hover:bg-[#1b2b3f] text-slate-300 hover:text-white'
                    }`}
                    title={isFr ? 'Réinitialiser la requête' : 'Reset SQL query'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isFr ? 'Réinitialiser' : 'Reset'}</span>
                  </button>

                  <button
                    onClick={handleCopyCode}
                    className={`p-1.5 rounded transition-colors text-xs font-mono flex items-center gap-1 ${
                      isLight 
                        ? 'hover:bg-slate-200 text-slate-600 hover:text-slate-900' 
                        : 'hover:bg-[#1b2b3f] text-slate-300 hover:text-white'
                    }`}
                    title={isFr ? 'Copier la requête' : 'Copy query'}
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copiedCode ? (isFr ? 'Copié' : 'Copied') : (isFr ? 'Copier' : 'Copy')}</span>
                  </button>

                  <button
                    onClick={() => setEditorExpanded(prev => !prev)}
                    className={`p-1.5 rounded transition-colors text-xs font-mono ${
                      isLight 
                        ? 'hover:bg-slate-200 text-slate-600 hover:text-slate-900' 
                        : 'hover:bg-[#1b2b3f] text-slate-300 hover:text-white'
                    }`}
                    title={editorExpanded ? (isFr ? 'Réduire' : 'Collapse') : (isFr ? 'Agrandir' : 'Expand')}
                  >
                    {editorExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>

                  {/* Big RUN QUERY Button */}
                  <button
                    onClick={handleRunQuery}
                    disabled={isRunning}
                    className="ml-1 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#0284c7] to-[#3198dc] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? (isFr ? 'Exécution...' : 'Running...') : (isFr ? '▶ Exécuter' : '▶ Run Query')}</span>
                    <span className="hidden md:inline text-[10px] opacity-75 font-normal ml-0.5">(Ctrl+Entrée)</span>
                  </button>
                </div>
              </div>

              {/* Textarea Code Input */}
              <div className={`p-4 border-b transition-colors ${
                isLight ? 'bg-[#f8fafc] border-slate-200' : 'bg-[#000f21] border-[#1b2b3f]'
              }`}>
                <textarea
                  id="sql-code-editor-textarea"
                  value={sqlCode}
                  onChange={(e) => setSqlCode(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleRunQuery();
                    }
                  }}
                  rows={editorExpanded ? 22 : (isFocusMode ? 14 : 9)}
                  className={`w-full bg-transparent font-mono text-xs leading-relaxed outline-none resize-none selection:bg-[#3198dc]/30 font-semibold ${
                    isLight ? 'text-[#0f172a]' : 'text-[#93ccff]'
                  }`}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* DYNAMIC PERFORMANCE TIPS PANEL */}
            <SqlPerformanceTips
              sqlCode={sqlCode}
              selectedDialect={selectedDialect}
              lang={lang}
              theme={theme}
              onSwitchToPlanTab={() => setActiveLabTab('plan')}
            />

            {/* REAL EXECUTION RESULTS & AUTOMATIC VALIDATION CONSOLE */}
            <div className={`rounded-xl border shadow-md overflow-hidden flex flex-col transition-colors ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#102034] border-[#1b2b3f]'
            }`}>
              {/* Console Tabs */}
              <div className={`flex items-center px-4 border-b overflow-x-auto transition-colors ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0b1c30] border-[#1b2b3f]'
              }`}>
                <button
                  onClick={() => setActiveLabTab('results')}
                  className={`py-2.5 px-3 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeLabTab === 'results'
                      ? isLight ? 'border-sky-600 text-sky-700 font-bold' : 'border-[#3198dc] text-white font-bold'
                      : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>
                    {isFr 
                      ? `Résultats réels (${queryResult ? queryResult.rowCount : 0} lignes)` 
                      : `Query Results (${queryResult ? queryResult.rowCount : 0} rows)`}
                  </span>
                </button>

                <button
                  onClick={() => setActiveLabTab('validation')}
                  className={`py-2.5 px-3 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeLabTab === 'validation'
                      ? isLight ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-[#4edea3] text-[#4edea3] font-bold'
                      : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {isFr 
                      ? `Validation (${validationResult ? validationResult.score : 0}%)` 
                      : `Validation (${validationResult ? validationResult.score : 0}%)`}
                  </span>
                </button>

                <button
                  onClick={() => setActiveLabTab('plan')}
                  className={`py-2.5 px-3 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeLabTab === 'plan'
                      ? isLight ? 'border-sky-600 text-sky-700 font-bold' : 'border-[#3198dc] text-white font-bold'
                      : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Plan d\'Exécution' : 'Execution Plan'}</span>
                </button>

                <button
                  onClick={() => setActiveLabTab('diagnostics')}
                  className={`py-2.5 px-3 text-xs font-mono font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeLabTab === 'diagnostics'
                      ? isLight ? 'border-sky-600 text-sky-700 font-bold' : 'border-[#3198dc] text-white font-bold'
                      : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Métriques Moteur' : 'Engine Metrics'}</span>
                </button>
              </div>

              {/* CONSOLE TAB CONTENT */}
              <div className="p-4 flex flex-col gap-3 min-h-[260px]">
                {/* VALIDATION SCORECARD BANNER */}
                {validationResult && (
                  <div className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    validationResult.allPassed
                      ? isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-[#003824]/40 border-[#4edea3]/40'
                      : validationResult.score > 0
                        ? isLight ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-[#f59e0b]/15 border-[#f59e0b]/40'
                        : isLight ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-[#ef4444]/15 border-[#ef4444]/40'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      {validationResult.allPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                      )}
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold flex items-center gap-2 ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {validationResult.allPassed
                            ? (isFr ? '✓ Validation Réussie ! (Score : 100 %)' : '✓ Validation Succeeded! (Score: 100%)')
                            : (isFr ? `Validation Partielle (Score : ${validationResult.score} %)` : `Partial Validation (Score: ${validationResult.score}%)`)}
                        </span>
                        <div className={`flex items-center gap-3 text-[11px] font-mono pt-0.5 flex-wrap ${
                          isLight ? 'text-slate-600' : 'text-slate-200'
                        }`}>
                          {validationResult.criteria.map((c) => (
                            <span key={c.id} className="flex items-center gap-1">
                              {c.passed ? (
                                <span className="text-emerald-600 dark:text-[#4edea3] font-bold">✓ {isFr ? c.labelFr : c.labelEn}</span>
                              ) : (
                                <span className="text-rose-600 dark:text-[#ef4444] font-semibold">✗ {isFr ? c.labelFr : c.labelEn}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-bold px-3 py-1 rounded border whitespace-nowrap ${
                        isLight 
                          ? 'bg-white text-emerald-700 border-emerald-300 shadow-sm' 
                          : 'bg-[#000f21] text-[#4edea3] border-[#4edea3]/30'
                      }`}>
                        Score : {validationResult.score} %
                      </span>
                    </div>
                  </div>
                )}

                {/* TAB 1: REAL RESULTS TABLE */}
                {activeLabTab === 'results' && (
                  <div className="flex flex-col gap-2">
                    {/* Real execution status bar */}
                    {queryResult && (
                      <div className={`flex items-center justify-between text-[11px] font-mono px-1 ${
                        isLight ? 'text-slate-600' : 'text-slate-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={queryResult.success ? 'text-emerald-600 dark:text-[#4edea3] font-bold' : 'text-rose-600 dark:text-[#ef4444] font-bold'}>
                            {queryResult.success ? '● SUCCESS' : '● ERROR'}
                          </span>
                          <span>
                            {isFr 
                              ? `${queryResult.rowCount} ligne(s) retournée(s) en ${queryResult.executionTimeMs} ms` 
                              : `${queryResult.rowCount} row(s) returned in ${queryResult.executionTimeMs} ms`}
                          </span>
                        </div>
                        <span className={`font-semibold ${isLight ? 'text-sky-700' : 'text-[#89ceff]'}`}>Moteur : In-Memory Relational Engine</span>
                      </div>
                    )}

                    {/* If SQL error occurred */}
                    {queryResult && !queryResult.success && (
                      <div className={`p-4 rounded-lg border text-xs font-mono flex flex-col gap-2 ${
                        isLight 
                          ? 'bg-rose-50 border-rose-300 text-rose-900' 
                          : 'bg-[#ef4444]/15 border-[#ef4444]/40 text-[#fca5a5]'
                      }`}>
                        <div className="flex items-center gap-2 font-bold">
                          <XCircle className="w-4 h-4 text-rose-500" />
                          <span>{isFr ? 'Erreur de syntaxe / exécution SQL :' : 'SQL Syntax / Execution Error:'}</span>
                        </div>
                        <p className={`p-2.5 rounded border ${
                          isLight 
                            ? 'bg-white border-rose-200 text-rose-950 font-bold' 
                            : 'bg-[#000f21] border-[#ef4444]/30 text-rose-200'
                        }`}>
                          {queryResult.error}
                        </p>
                        <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                          {isFr 
                            ? 'Vérifiez l\'orthographe des colonnes ("department"), des tables ("employees") et la structure des clauses SQL.' 
                            : 'Check spelling of column and table names and syntax structure.'}
                        </span>
                      </div>
                    )}

                    {/* If Successful, show real table */}
                    {queryResult && queryResult.success && (
                      <div className={`rounded-lg border overflow-x-auto shadow-sm ${
                        isLight 
                          ? 'bg-white border-slate-200' 
                          : 'bg-[#000f21] border-[#1b2b3f]'
                      }`}>
                        {queryResult.rows.length === 0 ? (
                          <div className={`p-6 text-center text-xs font-mono ${
                            isLight ? 'text-slate-500' : 'text-slate-300'
                          }`}>
                            {isFr ? 'Requête exécutée avec succès, 0 ligne retournée.' : 'Query executed successfully, 0 rows returned.'}
                          </div>
                        ) : (
                          <table className="w-full text-left font-mono text-xs">
                            <thead>
                              <tr className={`border-b ${
                                isLight 
                                  ? 'bg-slate-100 border-slate-200' 
                                  : 'bg-[#0b1c30] border-[#1b2b3f]'
                              }`}>
                                {queryResult.columns.map((col, i) => (
                                  <th key={i} className={`px-4 py-2.5 text-[11px] font-bold ${
                                    isLight ? 'text-slate-900' : 'text-white'
                                  }`}>
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#1b2b3f]'}`}>
                              {queryResult.rows.map((row, rIdx) => (
                                <tr key={rIdx} className={`transition-colors ${
                                  isLight 
                                    ? 'hover:bg-slate-50 text-slate-900' 
                                    : 'hover:bg-[#102034]/70 text-white'
                                }`}>
                                  {row.map((val, cIdx) => (
                                    <td key={cIdx} className="px-4 py-2 text-xs">
                                      {typeof val === 'number' ? (
                                        <span className={`font-bold ${isLight ? 'text-emerald-700 font-mono' : 'text-[#4edea3]'}`}>{val}</span>
                                      ) : val === 'IT' || val === 'HR' || val === 'Sales' ? (
                                        <span className={`px-2 py-0.5 rounded font-bold border ${
                                          isLight
                                            ? 'bg-sky-100 text-sky-900 border-sky-300'
                                            : 'bg-[#002c47] text-white border-[#3198dc]/40'
                                        }`}>
                                          {String(val)}
                                        </span>
                                      ) : (
                                        <span className={isLight ? 'text-slate-900 font-medium' : 'text-white'}>{String(val ?? 'NULL')}</span>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: DETAILED VALIDATION CHECKLIST */}
                {activeLabTab === 'validation' && (
                  <div className="flex flex-col gap-3 font-mono text-xs">
                    {validationResult?.criteria.map((c) => (
                      <div 
                        key={c.id} 
                        className={`p-3.5 rounded-lg border flex items-start justify-between gap-3 ${
                          c.passed 
                            ? (isLight ? 'bg-emerald-50 border-emerald-300' : 'bg-[#003824]/30 border-[#4edea3]/40')
                            : (isLight ? 'bg-rose-50 border-rose-300' : 'bg-[#ef4444]/10 border-[#ef4444]/30')
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {c.passed ? (
                            <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isLight ? 'text-emerald-600' : 'text-[#4edea3]'}`} />
                          ) : (
                            <XCircle className={`w-4 h-4 mt-0.5 shrink-0 ${isLight ? 'text-rose-600' : 'text-[#ef4444]'}`} />
                          )}
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs font-bold ${
                              isLight 
                                ? (c.passed ? 'text-emerald-950' : 'text-rose-950')
                                : 'text-[#d3e4fe]'
                            }`}>
                              {isFr ? c.labelFr : c.labelEn}
                            </span>
                            <span className={`text-[11px] ${
                              isLight
                                ? (c.passed ? 'text-emerald-900' : 'text-rose-900')
                                : 'text-[#bfc7d2]'
                            }`}>
                              {isFr ? c.detailFr : c.detailEn}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          c.passed 
                            ? (isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-[#003824] text-[#4edea3] border-[#4edea3]/40')
                            : (isLight ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-[#ef4444]/20 text-[#ef4444] border-rose-500/30')
                        }`}>
                          {c.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: EXECUTION PLAN */}
                {activeLabTab === 'plan' && (
                  <div className={`p-3 rounded-lg border font-mono text-xs flex flex-col gap-2 ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-800' 
                      : 'bg-[#000f21] border-[#1b2b3f] text-[#d3e4fe]'
                  }`}>
                    <span className={`text-[11px] pb-1 border-b ${
                      isLight ? 'border-slate-200 text-slate-500' : 'border-[#1b2b3f] text-[#89929b]'
                    }`}>
                      Execution Plan Optimizer • Cost: 3 • Execution Engine: In-Memory Engine
                    </span>
                    <div className={`whitespace-pre leading-relaxed font-semibold ${
                      isLight ? 'text-sky-900' : 'text-[#93ccff]'
                    }`}>
{`--------------------------------------------------------------------------------------
| Id  | Operation                     | Name      | Rows  | Bytes | Cost (%CPU)| Time     |
--------------------------------------------------------------------------------------
|   0 | SELECT STATEMENT              |           |     3 |   180 |     3   (0)| 00:00:01 |
|   1 |  HASH GROUP BY                |           |     3 |   180 |     3   (0)| 00:00:01 |
|   2 |   TABLE ACCESS FULL           | EMPLOYEES |    44 |  1760 |     2   (0)| 00:00:01 |
--------------------------------------------------------------------------------------

Optimizer Primitives:
  - Table 'employees' accessed via Sequential Memory Buffer
  - Aggregation hash map keyed by 'department' column (IT=12, HR=8, Sales=24)`}
                    </div>
                  </div>
                )}

                {/* TAB 4: ENGINE METRICS */}
                {activeLabTab === 'diagnostics' && (
                  <div className={`p-3 rounded-lg border font-mono text-xs flex flex-col gap-2.5 ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200' 
                      : 'bg-[#000f21] border-[#1b2b3f]'
                  }`}>
                    <div className={`flex items-center justify-between font-bold ${
                      isLight ? 'text-emerald-700' : 'text-[#4edea3]'
                    }`}>
                      <span>✓ Moteur SQL In-Memory actif (Alasql & AST Analyzer)</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-[#003824] text-[#4edea3]'
                      }`}>ONLINE</span>
                    </div>
                    <div className={`flex items-center justify-between ${
                      isLight ? 'text-slate-800' : 'text-[#d3e4fe]'
                    }`}>
                      <span>Temps de parsing & exécution :</span>
                      <span className={`font-bold ${isLight ? 'text-sky-700' : 'text-[#89ceff]'}`}>{queryResult?.executionTimeMs || 0} ms</span>
                    </div>
                    <div className={`flex items-center justify-between ${
                      isLight ? 'text-slate-700' : 'text-[#bfc7d2]'
                    }`}>
                      <span>Lignes retournées :</span>
                      <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{queryResult?.rowCount || 0} lignes</span>
                    </div>
                    <div className={`flex items-center justify-between ${
                      isLight ? 'text-slate-700' : 'text-[#bfc7d2]'
                    }`}>
                      <span>Base de données HR_CORP :</span>
                      <span className={`font-bold ${isLight ? 'text-emerald-700' : 'text-[#4edea3]'}`}>employees (44) • departments (4)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
