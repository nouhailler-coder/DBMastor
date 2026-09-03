import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  Flag, 
  Copy, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Terminal, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
  Database
} from 'lucide-react';
import { sampleExamQuestions } from '../data/mockData';
import { ExamQuestion } from '../types';

interface PracticeExamViewProps {
  lang: 'fr' | 'en';
  onFinishExam: (score: number) => void;
}

export const PracticeExamView: React.FC<PracticeExamViewProps> = ({ lang, onFinishExam }) => {
  const isFr = lang === 'fr';

  // Timer state (starts at 1h 24m 09s = 5049 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState(5049);
  const [isTimerActive, setIsTimerActive] = useState(true);

  // Question & Answers state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(23); // 0-indexed -> Question 24
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({
    23: ['opt-a'], // Option A pre-selected as shown in screenshot
  });
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({
    4: true,
    11: true,
    23: true,
  });
  const [instantExplanations, setInstantExplanations] = useState(true);
  const [explanationExpanded, setExplanationExpanded] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'flagged' | 'unanswered'>('all');

  // Scratchpad state
  const [scratchQuery, setScratchQuery] = useState("SELECT * FROM hr.employees WHERE department_id = 90;");
  const [scratchOutput, setScratchOutput] = useState<string | null>(null);
  const [isScratchRunning, setIsScratchRunning] = useState(false);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, secondsRemaining]);

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalExamQuestions = 78;
  const currentQ: ExamQuestion = sampleExamQuestions[currentQuestionIndex % sampleExamQuestions.length];
  const currentSelections = selectedAnswers[currentQuestionIndex] || [];
  const isCurrentFlagged = !!flaggedQuestions[currentQuestionIndex];

  // Option selection toggle (handles choose TWO)
  const handleToggleOption = (optId: string) => {
    const current = [...(selectedAnswers[currentQuestionIndex] || [])];
    const exists = current.includes(optId);
    let updated: string[];

    if (exists) {
      updated = current.filter((id) => id !== optId);
    } else {
      if (currentQ.correctCount === 1) {
        updated = [optId];
      } else {
        if (current.length >= currentQ.correctCount) {
          updated = [current[1], optId];
        } else {
          updated = [...current, optId];
        }
      }
    }

    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: updated,
    });
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions({
      ...flaggedQuestions,
      [currentQuestionIndex]: !isCurrentFlagged,
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentQ.sqlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunScratch = () => {
    setIsScratchRunning(true);
    setTimeout(() => {
      setIsScratchRunning(false);
      setScratchOutput(
        `SQL*Plus Release 19.0.0.0.0 - Production
Connected to: Oracle Database 19c Enterprise Edition Release 19.3.0.0.0
SQL> ${scratchQuery.trim()}

EMPLOYEE_ID FIRST_NAME  LAST_NAME   EMAIL      SALARY
----------- ----------- ----------- ---------- ------
100         Steven      King        SKING       24000
101         Neena       Kochhar     NKOCHHAR    17000
102         Lex         De Haan     LDEHAAN     17000

3 rows selected. Elapsed: 00:00:00.04`
      );
    }, 450);
  };

  // Compute answers count
  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const remainingCount = totalExamQuestions - answeredCount;

  return (
    <div id="practice-exam-view" className="p-6 max-w-[1720px] mx-auto w-full flex flex-col gap-6">
      {/* 1. EXAM META HEADER */}
      <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Exam title & meta */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#000f21] border border-[#1b2b3f] flex items-center justify-center text-[#93ccff]">
            <Database className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#93ccff] font-bold">Oracle 1Z0-071</span>
              <span className="text-[#89929b] font-mono text-xs">•</span>
              <span className="text-xs text-[#bfc7d2]">
                {isFr ? 'Simulation Officielle 19c' : 'Official 19c Simulation'}
              </span>
            </div>
            <h1 className="text-base font-bold text-[#d3e4fe]">
              {isFr ? 'Examen Blanc SQL Database #03 (Chronométré)' : 'Database SQL Practice Exam #3'}
            </h1>
          </div>
        </div>

        {/* Right: Timer, Progress bar, Instant Explanations toggle, Finish button */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Live Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0b1c30] border border-[#1b2b3f]">
            <Timer className="w-4 h-4 text-[#4edea3]" />
            <div className="flex flex-col">
              <span className="font-mono text-[9px] text-[#89929b] uppercase">
                {isFr ? 'Temps Restant' : 'Time Left'}
              </span>
              <span className="font-mono text-xs font-bold text-[#d3e4fe] tracking-wider">
                {formatTime(secondsRemaining)} <span className="text-[#89929b] text-[10px]">/ 02:00:00</span>
              </span>
            </div>
            <button
              onClick={() => setIsTimerActive(!isTimerActive)}
              className="p-1 text-[#89929b] hover:text-[#d3e4fe] transition-colors ml-1"
              title={isTimerActive ? 'Pause' : 'Reprendre'}
            >
              {isTimerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Question Metric & Progress */}
          <div className="flex flex-col gap-1 min-w-[140px]">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#d3e4fe] font-semibold">
                {isFr ? 'Question' : 'Question'} {currentQuestionIndex + 1} <span className="text-[#89929b]">/ {totalExamQuestions}</span>
              </span>
              <span className="text-[#93ccff]">
                {Math.round(((currentQuestionIndex + 1) / totalExamQuestions) * 100)}%
              </span>
            </div>
            <div className="w-full bg-[#000f21] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#3198dc] h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalExamQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Instant Explanations Switch */}
          <div className="flex items-center gap-2 bg-[#0b1c30] px-3 py-1.5 rounded-lg border border-[#1b2b3f]">
            <span className="font-mono text-[10px] text-[#bfc7d2] whitespace-nowrap">
              {isFr ? 'Explications instantanées' : 'Instant Explanations'}
            </span>
            <button
              onClick={() => setInstantExplanations(!instantExplanations)}
              className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center p-0.5 ${
                instantExplanations ? 'bg-[#3198dc]' : 'bg-[#26364a]'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                  instantExplanations ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>

          {/* Finish & Evaluate Button */}
          <button
            onClick={() => onFinishExam(91)}
            className="px-3.5 py-2 bg-[#93000a]/70 hover:bg-[#93000a] text-[#ffdad6] font-semibold text-xs rounded-lg border border-[#ffb4ab]/30 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>{isFr ? 'Terminer & Évaluer' : 'Finish & Evaluate'}</span>
          </button>
        </div>
      </div>

      {/* 2. TWO COLUMNS LAYOUT: QUESTION WORKSPACE & NAVIGATION PALETTE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: MASTER QUESTION WORKSPACE (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Question Card Header */}
          <div className="bg-[#102034] p-5 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1b2b3f]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#1b2b3f] text-[#93ccff] font-mono text-[11px] font-semibold border border-[#26364a]">
                  {currentQ.domain}
                </span>
                <span className="font-mono text-[11px] text-[#89929b]">
                  // {currentQ.subdomain}
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs text-[#89929b]">
                <span className="text-[#bfc7d2]">{currentQ.qid}</span>
                <span>•</span>
                <span>{isFr ? 'Temps moyen:' : 'Avg time:'} {currentQ.averageTime}</span>
              </div>
            </div>

            {/* Prompt context */}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-[#d3e4fe] leading-relaxed">
                {currentQ.prompt}
              </p>
              <div className="bg-[#000f21] px-3 py-1.5 rounded-lg border border-[#1b2b3f] text-xs font-mono text-[#89ceff]">
                EMPLOYEES {currentQ.tableContext}
              </div>
            </div>

            {/* Formatted SQL Code Block */}
            <div className="relative rounded-xl overflow-hidden border border-[#26364a] bg-[#000f21] shadow-inner">
              <div className="flex items-center justify-between px-3.5 py-2 bg-[#0b1c30] border-b border-[#1b2b3f]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                  <span className="font-mono text-xs text-[#bfc7d2] ml-2 font-medium">
                    oracle_session_19c_pdb1.sql
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#89929b]">
                    {currentQ.sqlDialect}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2 py-1 bg-[#1b2b3f] hover:bg-[#26364a] text-[#bfc7d2] rounded text-[10px] font-mono transition-colors"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-[#4edea3]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? (isFr ? 'Copié' : 'Copied') : (isFr ? 'Copier' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* Code lines */}
              <div className="p-4 font-mono text-xs leading-relaxed text-[#d3e4fe] overflow-x-auto">
                <table className="border-collapse">
                  <tbody>
                    {currentQ.sqlCode.split('\n').map((line, idx) => (
                      <tr key={idx} className="hover:bg-[#102034]/40">
                        <td className="pr-4 text-[#89929b] select-none text-right font-mono text-[11px] w-6">
                          {idx + 1}
                        </td>
                        <td className="whitespace-pre text-[#93ccff]">
                          {line}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-[#0b1c30] p-3.5 rounded-lg border border-[#1b2b3f]">
              <p className="text-sm font-semibold text-[#d3e4fe]">
                {currentQ.questionText}
              </p>
            </div>

            {/* 4 Options Grid */}
            <div className="flex flex-col gap-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = currentSelections.includes(opt.id);
                const showValidation = instantExplanations && currentSelections.length > 0;
                const isCorrect = opt.isCorrect;

                let borderStyle = 'border-[#1b2b3f] bg-[#0b1c30]';
                if (isSelected) {
                  if (showValidation) {
                    borderStyle = isCorrect 
                      ? 'border-[#4edea3] bg-[#003824]/25 ring-1 ring-[#4edea3]' 
                      : 'border-[#ffb4ab] bg-[#690005]/20 ring-1 ring-[#ffb4ab]';
                  } else {
                    borderStyle = 'border-[#3198dc] bg-[#102034] ring-1 ring-[#3198dc]';
                  }
                } else if (showValidation && isCorrect) {
                  borderStyle = 'border-[#4edea3]/50 bg-[#003824]/10';
                }

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleToggleOption(opt.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${borderStyle}`}
                  >
                    {/* Checkbox box */}
                    <div
                      className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 font-mono text-xs font-bold transition-all ${
                        isSelected
                          ? showValidation && !isCorrect
                            ? 'bg-[#93000a] text-white'
                            : 'bg-[#3198dc] text-[#002c47]'
                          : 'border border-[#3f4850] bg-[#000f21]'
                      }`}
                    >
                      {isSelected ? (showValidation && !isCorrect ? '✕' : '✓') : ''}
                    </div>

                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#93ccff]">
                          {opt.label}
                        </span>
                        {isSelected && (
                          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#3198dc]/20 text-[#93ccff]">
                            {isFr ? 'Sélectionné' : 'Selected'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#d3e4fe] leading-relaxed">
                        {opt.text}
                      </p>

                      {showValidation && (
                        <p className={`text-[11px] font-mono mt-1 ${isCorrect ? 'text-[#4edea3]' : 'text-[#ffb4ab]'}`}>
                          {isCorrect ? '✓ ' : '✕ '} {opt.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PEDAGOGICAL EDUCATIONAL SECTION */}
            {instantExplanations && (
              <div className="mt-2 rounded-xl bg-[#0b1c30] border border-[#26364a] overflow-hidden">
                <button
                  onClick={() => setExplanationExpanded(!explanationExpanded)}
                  className="w-full px-4 py-3 bg-[#102034] flex items-center justify-between border-b border-[#1b2b3f] hover:bg-[#1b2b3f] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#4edea3]" />
                    <span className="text-xs font-bold text-[#d3e4fe]">
                      {currentQ.explanation.title}
                    </span>
                  </div>
                  {explanationExpanded ? <ChevronUp className="w-4 h-4 text-[#89929b]" /> : <ChevronDown className="w-4 h-4 text-[#89929b]" />}
                </button>

                {explanationExpanded && (
                  <div className="p-4 flex flex-col gap-4">
                    {/* SQL Execution Cycle Visual Steps */}
                    <div className="flex flex-col gap-2">
                      <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
                        {isFr ? 'Ordre d\'Évaluation Logique des Clauses SQL' : 'SQL Logical Clause Evaluation Order'}
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {currentQ.explanation.flowSteps.map((s, idx) => (
                          <div 
                            key={idx}
                            className={`p-2 rounded-lg border text-center flex flex-col gap-0.5 ${
                              s.isFinal 
                                ? 'bg-[#003824]/30 border-[#4edea3]/50 text-[#4edea3]' 
                                : 'bg-[#000f21] border-[#1b2b3f] text-[#d3e4fe]'
                            }`}
                          >
                            <span className="font-mono text-[10px] font-bold">{s.step}</span>
                            <span className="text-[9px] text-[#89929b]">{s.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Rationale */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-[#000f21] border border-[#1b2b3f] flex flex-col gap-2">
                        <span className="font-mono text-[10px] text-[#4edea3] uppercase font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isFr ? 'Pourquoi A et C sont VRAIES' : 'Why A & C are TRUE'}
                        </span>
                        {currentQ.explanation.correctReasons.map((r, i) => (
                          <p key={i} className="text-xs text-[#bfc7d2] leading-relaxed">
                            {r}
                          </p>
                        ))}
                      </div>

                      <div className="p-3 rounded-lg bg-[#000f21] border border-[#1b2b3f] flex flex-col gap-2">
                        <span className="font-mono text-[10px] text-[#ffb4ab] uppercase font-semibold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          {isFr ? 'Pourquoi B et D sont FAUSSES' : 'Why B & D are FALSE'}
                        </span>
                        {currentQ.explanation.incorrectReasons.map((r, i) => (
                          <div key={i} className="flex flex-col gap-0.5">
                            <span className="font-mono text-[11px] text-[#ffb4ab] font-bold">
                              {r.option} : {r.error}
                            </span>
                            <p className="text-xs text-[#bfc7d2] leading-relaxed">
                              {r.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Official Doc Reference */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#000f21] border border-[#1b2b3f] font-mono text-[10px]">
                      <span className="text-[#89929b] flex items-center gap-1.5 truncate">
                        <Info className="w-3.5 h-3.5 text-[#93ccff] shrink-0" />
                        {currentQ.explanation.docRef}
                      </span>
                      <a 
                        href="https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/SELECT.html" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#93ccff] hover:underline flex items-center gap-1 shrink-0 ml-2"
                      >
                        Doc Oracle <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1b2b3f]">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-3.5 py-2 rounded-lg bg-[#1b2b3f] hover:bg-[#26364a] text-xs font-semibold text-[#d3e4fe] disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isFr ? 'Précédent' : 'Previous'}</span>
              </button>

              <button
                onClick={handleToggleFlag}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                  isCurrentFlagged 
                    ? 'bg-[#ffb4ab]/15 border-[#ffb4ab] text-[#ffb4ab]' 
                    : 'bg-[#0b1c30] border-[#1b2b3f] text-[#bfc7d2] hover:text-[#d3e4fe]'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{isFr ? 'Marquer pour révision' : 'Flag for Review'}</span>
              </button>

              <button
                onClick={() => setCurrentQuestionIndex(Math.min(totalExamQuestions - 1, currentQuestionIndex + 1))}
                className="px-4 py-2 rounded-lg bg-[#3198dc] hover:bg-[#93ccff] text-[#002c47] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#3198dc]/20"
              >
                <span>{isFr ? 'Enregistrer & Suivant' : 'Save & Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: EXAM QUESTION PALETTE & TOOLS (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* QUESTION PALETTE GRID */}
          <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#d3e4fe]">
                {isFr ? 'Grille de l\'Examen (78 questions)' : 'Exam Palette (78 items)'}
              </h3>
              <span className="font-mono text-[10px] text-[#4edea3]">
                {answeredCount} {isFr ? 'répondues' : 'answered'}
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#000f21] border border-[#1b2b3f]">
              <button
                onClick={() => setFilterMode('all')}
                className={`py-1 text-[11px] font-mono rounded font-medium transition-colors ${
                  filterMode === 'all' ? 'bg-[#1b2b3f] text-[#d3e4fe]' : 'text-[#89929b] hover:text-[#bfc7d2]'
                }`}
              >
                {isFr ? 'Toutes' : 'All'} ({totalExamQuestions})
              </button>
              <button
                onClick={() => setFilterMode('flagged')}
                className={`py-1 text-[11px] font-mono rounded font-medium transition-colors ${
                  filterMode === 'flagged' ? 'bg-[#1b2b3f] text-[#ffb4ab]' : 'text-[#89929b] hover:text-[#bfc7d2]'
                }`}
              >
                {isFr ? 'Marquées' : 'Flagged'} ({flaggedCount})
              </button>
              <button
                onClick={() => setFilterMode('unanswered')}
                className={`py-1 text-[11px] font-mono rounded font-medium transition-colors ${
                  filterMode === 'unanswered' ? 'bg-[#1b2b3f] text-[#89ceff]' : 'text-[#89929b] hover:text-[#bfc7d2]'
                }`}
              >
                {isFr ? 'Restantes' : 'Remaining'} ({remainingCount})
              </button>
            </div>

            {/* Question numbers grid */}
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto pr-1 py-1">
              {Array.from({ length: totalExamQuestions }).map((_, i) => {
                const isCurrent = i === currentQuestionIndex;
                const isAnswered = !!selectedAnswers[i];
                const isFlagged = !!flaggedQuestions[i];

                if (filterMode === 'flagged' && !isFlagged) return null;
                if (filterMode === 'unanswered' && isAnswered) return null;

                let itemClass = 'bg-[#000f21] text-[#89929b] border-[#1b2b3f] hover:border-[#3198dc]';
                if (isCurrent) {
                  itemClass = 'bg-[#3198dc] text-[#002c47] font-bold border-[#93ccff] ring-2 ring-[#3198dc]/50 shadow-md';
                } else if (isFlagged) {
                  itemClass = 'bg-[#93000a]/40 text-[#ffb4ab] border-[#ffb4ab]/40';
                } else if (isAnswered) {
                  itemClass = 'bg-[#003824]/40 text-[#4edea3] border-[#4edea3]/40';
                }

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`h-7 rounded text-[11px] font-mono border transition-all flex items-center justify-center relative ${itemClass}`}
                  >
                    {i + 1}
                    {isFlagged && !isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] absolute top-0.5 right-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-[#89929b] pt-2 border-t border-[#1b2b3f]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3198dc]"></span> {isFr ? 'Actuelle' : 'Current'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span> {isFr ? 'Répondue' : 'Answered'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span> {isFr ? 'Marquée' : 'Flagged'}
              </span>
            </div>
          </div>

          {/* SQL SCRATCHPAD SANDBOX */}
          <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#4edea3]" />
                <h3 className="text-sm font-bold text-[#d3e4fe]">
                  {isFr ? 'Brouillon & Console SQL' : 'SQL Scratchpad Sandbox'}
                </h3>
              </div>
              <span className="font-mono text-[9px] text-[#89929b]">Oracle DUAL / HR</span>
            </div>
            <p className="text-[11px] text-[#bfc7d2] leading-snug">
              {isFr 
                ? 'Testez une clause SQL, vérifiez des conversions ou évaluez un plan d\'exécution en direct.' 
                : 'Test a SQL clause, check conversions or verify an execution plan live.'}
            </p>

            <textarea
              value={scratchQuery}
              onChange={(e) => setScratchQuery(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-[#000f21] border border-[#1b2b3f] rounded-lg font-mono text-xs text-[#93ccff] outline-none focus:border-[#3198dc] resize-none"
            />

            <div className="flex items-center justify-between">
              <button
                onClick={() => setScratchQuery("SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM dual;")}
                className="font-mono text-[10px] text-[#89929b] hover:text-[#d3e4fe] transition-colors"
              >
                Exemple: SYSDATE
              </button>
              <button
                onClick={handleRunScratch}
                disabled={isScratchRunning}
                className="px-3 py-1.5 bg-[#1b2b3f] hover:bg-[#26364a] text-[#4edea3] font-mono text-xs rounded-lg transition-colors flex items-center gap-1.5 border border-[#26364a]"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isScratchRunning ? 'Exécution...' : 'Tester la requête'}</span>
              </button>
            </div>

            {scratchOutput && (
              <div className="p-2.5 bg-[#000f21] rounded-lg border border-[#1b2b3f] font-mono text-[10px] text-[#4edea3] whitespace-pre-wrap max-h-36 overflow-y-auto">
                {scratchOutput}
              </div>
            )}
          </div>

          {/* AVAILABLE EXAM SCHEMAS LIST */}
          <div className="bg-[#0b1c30] p-4 rounded-xl border border-[#1b2b3f] flex flex-col gap-2 shadow-inner">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Schémas Disponibles à l\'Épreuve' : 'Available Exam Schemas'}
            </span>
            <div className="flex flex-col gap-1.5 font-mono text-xs text-[#bfc7d2]">
              <div className="flex justify-between py-1 border-b border-[#1b2b3f]">
                <span className="text-[#93ccff]">HR.EMPLOYEES</span>
                <span className="text-[#89929b]">107 {isFr ? 'lignes' : 'rows'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1b2b3f]">
                <span className="text-[#93ccff]">HR.DEPARTMENTS</span>
                <span className="text-[#89929b]">27 {isFr ? 'lignes' : 'rows'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#93ccff]">HR.JOB_HISTORY</span>
                <span className="text-[#89929b]">10 {isFr ? 'lignes' : 'rows'}</span>
              </div>
            </div>
          </div>

          {/* Proctored SSL Info */}
          <div className="flex items-center gap-2 font-mono text-[10px] text-[#89929b] px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4edea3]" />
            <span>{isFr ? 'Session sécurisée Certiport SSL 256-bit' : 'Official Proctored Exam SSL 256-bit'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
