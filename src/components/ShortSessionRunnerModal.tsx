import React, { useState, useEffect } from 'react';
import {
  Zap,
  Target,
  Timer,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  TrendingUp,
  Copy,
  Check,
  AlertTriangle,
  Award,
  Pause,
  Play,
  Flame,
} from 'lucide-react';
import { TargetedSessionPayload, TargetedSessionQuestion } from '../types';
import {
  ShortSessionMode,
  SHORT_SESSION_CONFIGS,
  buildShortSessionPayload,
} from '../data/shortSessionsData';
import {
  getStoredCompetencies,
  recalculateCompetenciesAfterSession,
  CompetencyRecalculationResult,
  UserCompetency,
} from '../services/competencyService';
import { recordTrapAttempt } from '../services/trapService';
import { recordQuestionAttemptTelemetry } from '../services/statsService';
import { ProgressiveExplainPanel } from './ProgressiveExplainPanel';
import { GeminiPedagogicalTutor } from './GeminiPedagogicalTutor';

interface ShortSessionRunnerModalProps {
  mode: ShortSessionMode | null;
  onClose: () => void;
  onSwitchMode: (newMode: ShortSessionMode) => void;
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  onNavigateToTab?: (tab: string) => void;
}

export const ShortSessionRunnerModal: React.FC<ShortSessionRunnerModalProps> = ({
  mode,
  onClose,
  onSwitchMode,
  lang,
  theme = 'dark',
  onNavigateToTab,
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  const [competencies, setCompetencies] = useState<UserCompetency[]>(() => getStoredCompetencies());
  const [sessionData, setSessionData] = useState<TargetedSessionPayload | null>(null);
  const [phase, setPhase] = useState<'active_quiz' | 'results'>('active_quiz');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [questionStartMs, setQuestionStartMs] = useState<number>(() => Date.now());
  const [copiedCode, setCopiedCode] = useState(false);
  const [recalcResult, setRecalcResult] = useState<CompetencyRecalculationResult | null>(null);

  // Initialize session immediately when mode is set
  useEffect(() => {
    if (!mode) return;
    const currentComps = getStoredCompetencies();
    setCompetencies(currentComps);
    const payload = buildShortSessionPayload(mode, lang, currentComps);
    setSessionData(payload);
    const durationSecs = payload.estimatedDurationMinutes * 60;
    setSecondsRemaining(durationSecs);
    setTotalDurationSeconds(durationSecs);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setRecalcResult(null);
    setIsTimerActive(true);
    setPhase('active_quiz');
    setQuestionStartMs(Date.now());
  }, [mode, lang]);

  useEffect(() => {
    setQuestionStartMs(Date.now());
  }, [currentQuestionIndex]);

  // Live countdown timer
  useEffect(() => {
    if (!mode || phase !== 'active_quiz' || !isTimerActive) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, phase, isTimerActive]);

  if (!mode || !sessionData) return null;

  const config = SHORT_SESSION_CONFIGS[mode];
  const isQuick5 = mode === 'quick_5min';
  const currentQ: TargetedSessionQuestion | undefined = sessionData.questions[currentQuestionIndex];
  const userSelectedOptionId = selectedAnswers[currentQuestionIndex];
  const isQuestionAnswered = Boolean(userSelectedOptionId);
  const isUserCorrect = Boolean(currentQ && userSelectedOptionId === currentQ.correctOptionId);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optId: string) => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optId,
    }));

    const isCorrect = optId === currentQ.correctOptionId;
    const elapsedSecs = Math.max(3, Math.round((Date.now() - questionStartMs) / 1000));
    const chosenOpt = currentQ.options.find((o) => o.id === optId);

    recordQuestionAttemptTelemetry({
      questionId: currentQ.id,
      answer: chosenOpt ? `Option ${chosenOpt.letter}` : optId,
      isCorrect,
      timeSpent: elapsedSecs,
      difficulty:
        currentQ.trapMetadata?.difficulty ||
        (currentQ.difficulty === 'hard' ? 4 : currentQ.difficulty === 'intermediate' ? 3 : 2),
      topic: currentQ.trapMetadata?.subtopic || currentQ.topicName || 'SQL',
      hintRequested: !isCorrect,
    });

    if (currentQ.trapMetadata) {
      recordTrapAttempt(currentQ.trapMetadata, isCorrect);
    }
  };

  const handleCopyCode = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFinishSession = () => {
    setIsTimerActive(false);
    const breakdownResults: Record<string, { correct: number; total: number }> = {
      join: { correct: 0, total: 0 },
      subqueries: { correct: 0, total: 0 },
      indexes: { correct: 0, total: 0 },
      groupby: { correct: 0, total: 0 },
    };

    sessionData.questions.forEach((q, idx) => {
      const userChoice = selectedAnswers[idx];
      const isCorrect = userChoice === q.correctOptionId;
      const tId = q.topicId.toLowerCase();
      if (!breakdownResults[tId]) {
        breakdownResults[tId] = { correct: 0, total: 0 };
      }
      breakdownResults[tId].total += 1;
      if (isCorrect) {
        breakdownResults[tId].correct += 1;
      }
    });

    const sessionResultsArray = Object.entries(breakdownResults)
      .filter(([, val]) => val.total > 0)
      .map(([topicId, val]) => ({
        topicId,
        correct: val.correct,
        total: val.total,
      }));

    const result = recalculateCompetenciesAfterSession(sessionResultsArray);
    setRecalcResult(result);
    setCompetencies(result.updatedCompetencies);
    setPhase('results');
  };

  const handleRestartSameMode = () => {
    const currentComps = getStoredCompetencies();
    setCompetencies(currentComps);
    const payload = buildShortSessionPayload(mode, lang, currentComps);
    setSessionData(payload);
    const durationSecs = payload.estimatedDurationMinutes * 60;
    setSecondsRemaining(durationSecs);
    setTotalDurationSeconds(durationSecs);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setRecalcResult(null);
    setIsTimerActive(true);
    setPhase('active_quiz');
    setQuestionStartMs(Date.now());
  };

  const totalAnswered = Object.keys(selectedAnswers).length;
  const totalCorrect = sessionData.questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctOptionId ? 1 : 0);
  }, 0);
  const elapsedTotalSeconds = Math.max(5, totalDurationSeconds - secondsRemaining);
  const avgSecondsPerQuestion = Math.max(
    4,
    Math.round(elapsedTotalSeconds / Math.max(1, totalAnswered))
  );

  // Current progressive stage for 30-min mode
  const qNum = currentQuestionIndex + 1;
  const progressiveStage = qNum <= 6 ? 1 : qNum <= 14 ? 2 : 3;

  return (
    <div
      id="short-session-runner-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        className={`relative w-full max-w-4xl my-auto rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isLight
            ? 'bg-white border-[#cbd5e1] text-[#0f172a]'
            : 'bg-[#0b1c30] border-[#1b2b3f] text-[#d3e4fe]'
        }`}
      >
        {/* ============================================================
            TOP HEADER : Mode Title + Live Timer + Close Button
           ============================================================ */}
        <div
          className={`px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b shrink-0 ${
            isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#000f21] border-[#102034]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md ${
                isQuick5
                  ? 'bg-[#f59e0b] text-[#0b1c30]'
                  : 'bg-[#0284c7] text-white'
              }`}
            >
              {isQuick5 ? <Zap className="w-5 h-5" /> : <Target className="w-5 h-5" />}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className={isQuick5 ? 'text-[#fbbf24] font-bold' : 'text-[#38bdf8] font-bold'}>
                  {isFr ? config.kickerFr : config.kickerEn}
                </span>
                <span className="text-[#89929b]" aria-hidden="true">·</span>
                <span className="text-[#4edea3] font-semibold">
                  {isFr ? config.bullet3Fr : config.bullet3En}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                {config.title} — {isFr ? config.bullet1Fr : config.bullet1En} ({isFr ? config.bullet2Fr : config.bullet2En})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Countdown Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#061322] border border-[#1b2b3f] font-mono text-xs font-bold">
              <Timer
                className={`w-4 h-4 ${
                  secondsRemaining < 60 ? 'text-[#ef4444] animate-pulse' : 'text-[#4edea3]'
                }`}
              />
              <span
                className={`text-sm tracking-wider ${
                  secondsRemaining < 60 ? 'text-[#ef4444]' : 'text-white'
                }`}
              >
                {formatTimer(secondsRemaining)}
              </span>
              <button
                type="button"
                onClick={() => setIsTimerActive((prev) => !prev)}
                className="p-1 rounded hover:bg-[#1b2b3f] text-[#89929b] hover:text-white transition-colors cursor-pointer"
                title={isTimerActive ? 'Pause' : 'Play'}
              >
                {isTimerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              id="close-short-session-modal-btn"
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#89929b] hover:text-white hover:bg-[#ef4444] transition-all font-bold cursor-pointer"
              title={isFr ? 'Fermer' : 'Close'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ============================================================
            SCROLLABLE BODY
           ============================================================ */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {phase === 'active_quiz' && currentQ && (
            <>
              {/* Barre de contexte spécifique au mode (5 min Faiblesses vs 30 min Difficulté progressive) */}
              {isQuick5 ? (
                <div className="p-3.5 rounded-xl bg-[#061322] border border-[#f59e0b]/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#fbbf24]" />
                    <span className="font-bold text-white">
                      {isFr ? 'Mode Notions faibles uniquement :' : 'Weak concepts only mode:'}
                    </span>
                    <span className="text-[#fbbf24] font-bold">{currentQ.difficultyLabel}</span>
                  </div>
                  <div className="text-[#89929b]">
                    {isFr ? 'Objectif : 5 questions ciblées en 5 minutes' : 'Goal: 5 targeted questions in 5 minutes'}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#061322] border border-[#38bdf8]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#38bdf8]" />
                    <span className="font-bold text-white">
                      {isFr ? 'Difficulté progressive :' : 'Progressive difficulty:'}
                    </span>
                    <span className="text-[#38bdf8] font-bold">{currentQ.difficultyLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        progressiveStage === 1
                          ? 'bg-[#4edea3] text-[#003824] font-bold'
                          : 'text-[#89929b]'
                      }`}
                    >
                      1. {isFr ? 'Fondamental (1-6)' : 'Easy (1-6)'}
                    </span>
                    <span className="text-[#89929b]">→</span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        progressiveStage === 2
                          ? 'bg-[#38bdf8] text-[#002c47] font-bold'
                          : 'text-[#89929b]'
                      }`}
                    >
                      2. {isFr ? 'Intermédiaire (7-14)' : 'Medium (7-14)'}
                    </span>
                    <span className="text-[#89929b]">→</span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        progressiveStage === 3
                          ? 'bg-[#f59e0b] text-[#0b1c30] font-bold'
                          : 'text-[#89929b]'
                      }`}
                    >
                      3. {isFr ? 'Avancé (15-20)' : 'Hard (15-20)'}
                    </span>
                  </div>
                </div>
              )}

              {/* Sélecteur rapide de numéro de question + Progression */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white">
                    Question {currentQuestionIndex + 1} / {sessionData.totalQuestions}
                  </span>
                  <span className="text-[#89929b]">
                    {totalAnswered} / {sessionData.totalQuestions}{' '}
                    {isFr ? 'répondues' : 'answered'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {sessionData.questions.map((q, idx) => {
                    const ans = selectedAnswers[idx];
                    const isCurrent = idx === currentQuestionIndex;
                    const isRight = ans && ans === q.correctOptionId;
                    let pillStyle = 'bg-[#061322] border-[#1b2b3f] text-[#89929b] hover:text-white';
                    if (isCurrent) {
                      pillStyle = 'bg-[#0284c7] border-[#38bdf8] text-white font-extrabold';
                    } else if (ans) {
                      pillStyle = isRight
                        ? 'bg-[#10b981]/20 border-[#10b981]/50 text-[#4edea3] font-bold'
                        : 'bg-[#ef4444]/20 border-[#ef4444]/50 text-[#ef4444] font-bold';
                    }
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-7 h-7 rounded-lg border font-mono text-xs flex items-center justify-center transition-all cursor-pointer ${pillStyle}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Énoncé de la question */}
              <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f]">
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {currentQ.prompt}
                </p>
              </div>

              {/* Code SQL */}
              {currentQ.codeSnippet && (
                <div className="rounded-xl overflow-hidden border border-[#1b2b3f] bg-[#000f21]">
                  <div className="px-4 py-2 bg-[#051329] border-b border-[#102034] flex items-center justify-between text-[11px] font-mono text-[#89ceff]">
                    <span>SQL • {currentQ.topicName}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(currentQ.codeSnippet)}
                      className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedCode ? (
                        <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedCode ? (isFr ? 'Copié' : 'Copied') : (isFr ? 'Copier' : 'Copy')}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-[#93ccff] overflow-x-auto leading-relaxed">
                    {currentQ.codeSnippet}
                  </pre>
                </div>
              )}

              {/* 4 Options de réponse */}
              <div className="flex flex-col gap-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = userSelectedOptionId === opt.id;
                  const isCorrect = opt.id === currentQ.correctOptionId;

                  let optClass =
                    'border-[#1b2b3f] bg-[#061322] hover:border-[#38bdf8] text-[#d3e4fe]';
                  if (isSelected) {
                    optClass = isCorrect
                      ? 'border-[#10b981] bg-[#10b981]/15 text-[#4edea3] ring-1 ring-[#10b981]'
                      : 'border-[#ef4444] bg-[#ef4444]/15 text-[#ffb4ab] ring-1 ring-[#ef4444]';
                  } else if (isQuestionAnswered && isCorrect) {
                    optClass = 'border-[#10b981]/60 bg-[#10b981]/10 text-[#4edea3]';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${optClass}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? isCorrect
                              ? 'bg-[#10b981] text-[#003824]'
                              : 'bg-[#ef4444] text-white'
                            : 'border border-[#1b2b3f] text-[#89929b]'
                        }`}
                      >
                        {opt.letter}
                      </div>
                      <div className="flex-1 leading-snug">{opt.text}</div>
                    </button>
                  );
                })}
              </div>

              {/* Module « Explique-moi » à 3 niveaux : [Réponse] [Indice] [Expliquer] [Voir la solution] */}
              <ProgressiveExplainPanel
                questionId={currentQ.id}
                topic={currentQ.trapMetadata?.topic || 'SQL'}
                subtopic={currentQ.trapMetadata?.subtopic || currentQ.topicName}
                trapName={currentQ.trapMetadata?.trap}
                promptText={currentQ.prompt}
                codeSnippet={currentQ.codeSnippet}
                explanationText={currentQ.explanation}
                correctOptionLetter={
                  currentQ.options.find((o) => o.id === currentQ.correctOptionId)?.letter
                }
                correctOptionText={
                  currentQ.options.find((o) => o.id === currentQ.correctOptionId)?.text
                }
                hasSelectedAnswer={isQuestionAnswered}
                lang={lang}
                theme={theme}
              />

              {/* Feedback immédiat & Tuteur Gemini en cas d'erreur */}
              {isQuestionAnswered && (
                <div className="animate-fade-in">
                  {isUserCorrect ? (
                    <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex flex-col gap-1.5 text-xs text-[#4edea3]">
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        <span>{isFr ? 'Bonne réponse !' : 'Correct answer!'}</span>
                      </div>
                      <p className="text-[#d3e4fe] leading-relaxed">{currentQ.explanation}</p>
                      <div className="mt-1 font-mono font-bold text-[#4edea3]">
                        {currentQ.keyTakeaway}
                      </div>
                    </div>
                  ) : (
                    <GeminiPedagogicalTutor
                      questionPrompt={currentQ.prompt}
                      codeSnippet={currentQ.codeSnippet}
                      chosenLetter={
                        currentQ.options.find((o) => o.id === userSelectedOptionId)?.letter || '?'
                      }
                      chosenText={
                        currentQ.options.find((o) => o.id === userSelectedOptionId)?.text || ''
                      }
                      correctLetter={
                        currentQ.options.find((o) => o.id === currentQ.correctOptionId)?.letter ||
                        'A'
                      }
                      correctText={
                        currentQ.options.find((o) => o.id === currentQ.correctOptionId)?.text || ''
                      }
                      conceptName={currentQ.topicName}
                      explanation={`${currentQ.explanation}\n${currentQ.keyTakeaway}`}
                      lang={lang}
                      theme={theme}
                      autoTrigger={true}
                    />
                  )}
                </div>
              )}

              {/* Navigation Précédent / Suivant / Terminer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#1b2b3f]">
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs border border-[#1b2b3f] disabled:opacity-40 hover:bg-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isFr ? 'Précédent' : 'Previous'}</span>
                </button>

                {currentQuestionIndex < sessionData.totalQuestions - 1 ? (
                  <button
                    id="short-session-next-question-btn"
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(sessionData.totalQuestions - 1, prev + 1)
                      )
                    }
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isFr ? 'Question suivante' : 'Next Question'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="short-session-finish-btn"
                    type="button"
                    onClick={handleFinishSession}
                    className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-[#10b981] hover:bg-[#059669] text-[#003824] shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>{isFr ? 'Terminer et voir le bilan' : 'Finish & View Summary'}</span>
                  </button>
                )}
              </div>
            </>
          )}

          {/* ============================================================
              PHASE RÉSULTATS : Bilan de la session courte (5 min / 30 min)
             ============================================================ */}
          {phase === 'results' && (
            <div className="flex flex-col gap-6 py-2 animate-fade-in">
              <div className="text-center flex flex-col items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#4edea3]">
                  {config.title} • {isFr ? 'Session terminée' : 'Session Completed'}
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  {isFr ? 'Bilan de votre entraînement' : 'Your Training Summary'}
                </h3>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f]">
                  <span className="text-[11px] text-[#89929b] block">
                    {isFr ? 'Score' : 'Score'}
                  </span>
                  <span className="text-2xl font-extrabold text-white">
                    {totalCorrect} / {sessionData.totalQuestions}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f]">
                  <span className="text-[11px] text-[#89929b] block">
                    {isFr ? 'Réussite' : 'Accuracy'}
                  </span>
                  <span className="text-2xl font-extrabold text-[#4edea3]">
                    {Math.round((totalCorrect / sessionData.totalQuestions) * 100)} %
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f]">
                  <span className="text-[11px] text-[#89929b] block">
                    {isFr ? 'Temps moyen' : 'Avg time'}
                  </span>
                  <span className="text-2xl font-extrabold text-[#38bdf8]">
                    {avgSecondsPerQuestion} s
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f]">
                  <span className="text-[11px] text-[#89929b] block">
                    {isFr ? 'Format' : 'Format'}
                  </span>
                  <span className="text-lg font-extrabold text-[#fbbf24]">
                    {isFr ? config.bullet2Fr : config.bullet2En}
                  </span>
                </div>
              </div>

              {/* Progression des compétences ciblées */}
              {recalcResult && recalcResult.deltas.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-3">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                    {isFr
                      ? 'Impact sur vos compétences SQL'
                      : 'Impact on your SQL competencies'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    {recalcResult.deltas.map((d) => (
                      <div
                        key={d.id}
                        className="p-3 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex items-center justify-between"
                      >
                        <span className="font-bold text-white">{d.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#89929b]">{d.previousScore}%</span>
                          <span>→</span>
                          <span className="font-extrabold text-[#4edea3]">{d.newScore}%</span>
                          <span className="text-[#4edea3]">
                            ({d.delta >= 0 ? `+${d.delta}%` : `${d.delta}%`})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRestartSameMode}
                  className="px-4 py-3 rounded-xl font-bold text-xs border border-[#1b2b3f] bg-[#061322] hover:bg-[#102034] text-white flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isFr ? 'Relancer cette session' : 'Restart this session'}</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSwitchMode(isQuick5 ? 'training_30min' : 'quick_5min')}
                    className="px-4 py-3 rounded-xl font-bold text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center gap-2 cursor-pointer"
                  >
                    {isQuick5 ? <Target className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    <span>
                      {isQuick5
                        ? isFr
                          ? 'Passer au 🎯 Training Session (30 min • 20Q)'
                          : 'Switch to 🎯 Training Session (30 min • 20Q)'
                        : isFr
                        ? 'Passer au ⚡ Quick Training (5 min • 5Q)'
                        : 'Switch to ⚡ Quick Training (5 min • 5Q)'}
                    </span>
                  </button>

                  {onNavigateToTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToTab('activity');
                      }}
                      className="px-5 py-3 rounded-xl font-extrabold text-xs bg-[#10b981] hover:bg-[#059669] text-[#003824] flex items-center gap-2 cursor-pointer"
                    >
                      <span>{isFr ? 'Voir Mon activité' : 'View My Activity'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
