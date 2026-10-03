import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Brain,
  ShieldCheck,
  X,
  Award,
  Layers,
  ChevronRight,
  Flame,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { TargetedSessionQuestion } from '../types';
import {
  getDailySessionQuestions,
  recordDailySessionCompletion,
  DailySessionCompletionResult,
  getRecommendedDailySessionConfig,
  DailySessionConfig
} from '../services/dailySessionService';

interface DailySessionRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'en';
  onNavigateToDashboard?: () => void;
}

export const DailySessionRunnerModal: React.FC<DailySessionRunnerModalProps> = ({
  isOpen,
  onClose,
  lang,
  onNavigateToDashboard,
}) => {
  const isFr = lang === 'fr';

  // Questions du jour (15 questions)
  const [questions, setQuestions] = useState<TargetedSessionQuestion[]>(() =>
    getDailySessionQuestions(lang)
  );
  const [config, setConfig] = useState<DailySessionConfig>(() =>
    getRecommendedDailySessionConfig(lang)
  );

  // Index actif (0 à 14)
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  // Chronomètre de 12 minutes (720 secondes)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(12 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Résultat de complétion
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [completionResult, setCompletionResult] = useState<DailySessionCompletionResult | null>(null);

  // Recharger lors de l'ouverture
  useEffect(() => {
    if (isOpen) {
      setQuestions(getDailySessionQuestions(lang));
      setConfig(getRecommendedDailySessionConfig(lang));
      setCurrentIndex(0);
      setUserAnswers({});
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setSecondsRemaining(12 * 60);
      setElapsedSeconds(0);
      setIsFinished(false);
      setCompletionResult(null);
    }
  }, [isOpen, lang]);

  // Chronomètre
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && !isFinished) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isFinished]);

  if (!isOpen) return null;

  const currentQ: TargetedSessionQuestion = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleSelectOption = (optId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;
    setIsAnswerSubmitted(true);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: selectedOption,
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Fin de la séance : enregistrement et affichage de la synthèse
      const updatedAnswers = {
        ...userAnswers,
        [currentQ.id]: selectedOption || '',
      };
      const result = recordDailySessionCompletion(updatedAnswers, questions, elapsedSeconds);
      setCompletionResult(result);
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setSecondsRemaining(12 * 60);
    setElapsedSeconds(0);
    setIsFinished(false);
    setCompletionResult(null);
  };

  const getTopicColor = (topicId: string) => {
    switch (topicId) {
      case 'join':
        return 'text-[#38bdf8] bg-[#0284c7]/20 border-[#38bdf8]/40';
      case 'transactions':
        return 'text-[#fbbf24] bg-[#b45309]/20 border-[#fbbf24]/40';
      case 'indexes':
        return 'text-[#f43f5e] bg-[#be123c]/20 border-[#f43f5e]/40';
      case 'sql_advanced':
      default:
        return 'text-[#a78bfa] bg-[#7c3aed]/20 border-[#a78bfa]/40';
    }
  };

  const getDifficultyBadge = (difficulty: string, label: string) => {
    switch (difficulty) {
      case 'easy':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#003824] text-[#4edea3] border border-[#4edea3]/40">
            {label}
          </span>
        );
      case 'intermediate':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#002c47] text-[#38bdf8] border border-[#38bdf8]/40">
            {label}
          </span>
        );
      case 'hard':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#3d000a] text-[#f43f5e] border border-[#f43f5e]/50">
            {label}
          </span>
        );
    }
  };

  return (
    <div
      id="daily-session-runner-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        id="daily-session-runner-card"
        className="relative w-full max-w-4xl my-auto rounded-2xl bg-[#0b1c30] border border-[#26364a] text-[#d3e4fe] shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Glow décoratif */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#0284c7]/15 rounded-full blur-3xl pointer-events-none" />

        {/* TOP BAR : Branding, Kicker & Close */}
        <div className="px-6 py-4 bg-[#071322] border-b border-[#1b2b3f] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shadow-lg shadow-[#0284c7]/25 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#38bdf8] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                  {isFr ? '🎯 MA SÉANCE DU JOUR' : '🎯 TODAY\'S SESSION'}
                </span>
                <span className="text-[#89929b] text-xs">•</span>
                <span className="font-mono text-[11px] text-[#4edea3] font-semibold">
                  15 questions • ≈ 12 min
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {isFr
                  ? 'Programme optimisé selon vos faiblesses'
                  : 'Targeted daily workout based on your weak spots'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isFinished && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#102034] border border-[#1b2b3f] font-mono text-xs font-bold text-[#93ccff]">
                <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className={secondsRemaining <= 120 ? 'text-[#f43f5e] animate-pulse font-bold' : ''}>
                  {formatTimer(secondsRemaining)}
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#89929b] hover:text-white hover:bg-[#1b2b3f] transition-colors cursor-pointer"
              title={isFr ? 'Fermer' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ÉTAPE A : EN COURS D'EXÉCUTION (15 QUESTIONS)                             */}
        {/* ========================================================================= */}
        {!isFinished ? (
          <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-5">
            {/* Header de la question active */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#38bdf8] text-sm">
                    Question {currentIndex + 1} / {totalQuestions}
                  </span>
                  <span className="text-[#89929b]">•</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${getTopicColor(
                      currentQ.topicId
                    )}`}
                  >
                    {currentQ.topicName}
                  </span>
                  <span className="hidden sm:inline">
                    {getDifficultyBadge(currentQ.difficulty, currentQ.difficultyLabel)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#89929b] text-[11px] font-mono">
                    {progressPercent}% complété
                  </span>
                </div>
              </div>

              {/* Barre de progression avec mini-segments */}
              <div className="w-full h-2 rounded-full bg-[#102034] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#4edea3] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Répétition du plan de séance (JOIN 5, Tx 4, Idx 3, SQL avancé 3) */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#89929b] overflow-x-auto pt-0.5">
                <span className="font-bold text-[#d3e4fe] shrink-0">
                  {isFr ? 'Plan du jour :' : 'Today plan:'}
                </span>
                <span className={currentIndex < 5 ? 'text-[#38bdf8] font-bold underline' : 'text-[#89929b]'}>
                  JOIN (5)
                </span>
                <span>•</span>
                <span className={currentIndex >= 5 && currentIndex < 9 ? 'text-[#fbbf24] font-bold underline' : 'text-[#89929b]'}>
                  Transactions (4)
                </span>
                <span>•</span>
                <span className={currentIndex >= 9 && currentIndex < 12 ? 'text-[#f43f5e] font-bold underline' : 'text-[#89929b]'}>
                  Indexes (3)
                </span>
                <span>•</span>
                <span className={currentIndex >= 12 ? 'text-[#a78bfa] font-bold underline' : 'text-[#89929b]'}>
                  SQL avancé (3)
                </span>
              </div>
            </div>

            {/* Énoncé de la question */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[#071322] border border-[#1b2b3f]">
              <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                {currentQ.prompt}
              </h3>

              {currentQ.codeSnippet && (
                <div className="p-3.5 rounded-xl bg-[#000d1a] border border-[#1b2b3f] font-mono text-xs text-[#7dd3fc] overflow-x-auto whitespace-pre">
                  {currentQ.codeSnippet}
                </div>
              )}
            </div>

            {/* Options de réponse */}
            <div className="flex flex-col gap-2.5">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOption === opt.id || selectedOption === opt.letter;
                const isCorrect =
                  opt.id === currentQ.correctOptionId || opt.letter === currentQ.correctOptionId;

                let optClasses =
                  'p-4 rounded-xl border font-sans text-sm flex items-start gap-3 transition-all cursor-pointer text-left ';

                if (!isAnswerSubmitted) {
                  if (isSelected) {
                    optClasses +=
                      'bg-[#0284c7]/20 border-[#38bdf8] text-white shadow-md shadow-[#0284c7]/10';
                  } else {
                    optClasses +=
                      'bg-[#102034]/70 border-[#1b2b3f] hover:border-[#26364a] hover:bg-[#102034] text-[#d3e4fe]';
                  }
                } else {
                  if (isCorrect) {
                    optClasses +=
                      'bg-[#003824]/60 border-[#4edea3] text-[#6ffbbe] shadow-md shadow-[#4edea3]/10';
                  } else if (isSelected && !isCorrect) {
                    optClasses +=
                      'bg-[#3d000a]/60 border-[#f43f5e] text-[#ffb4ab] shadow-md shadow-[#f43f5e]/10';
                  } else {
                    optClasses += 'bg-[#102034]/40 border-[#1b2b3f] text-[#89929b] opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.letter || opt.id)}
                    disabled={isAnswerSubmitted}
                    className={optClasses}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected
                          ? isAnswerSubmitted
                            ? isCorrect
                              ? 'bg-[#4edea3] text-[#003824]'
                              : 'bg-[#f43f5e] text-white'
                            : 'bg-[#38bdf8] text-[#002c47]'
                          : isAnswerSubmitted && isCorrect
                          ? 'bg-[#4edea3] text-[#003824]'
                          : 'bg-[#1b2b3f] text-[#89929b]'
                      }`}
                    >
                      {opt.letter || opt.id}
                    </div>
                    <span className="leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Explication & Piège pédagogique immédiat */}
            {isAnswerSubmitted && (
              <div
                className={`p-4 rounded-xl border flex flex-col gap-2 animate-fade-in ${
                  selectedOption === currentQ.correctOptionId
                    ? 'bg-[#002819] border-[#4edea3]/40 text-[#d3e4fe]'
                    : 'bg-[#2a0810] border-[#f43f5e]/40 text-[#d3e4fe]'
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-xs font-bold">
                  {selectedOption === currentQ.correctOptionId ? (
                    <span className="text-[#4edea3] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
                      {isFr ? 'EXCELLENTE RÉPONSE !' : 'CORRECT ANSWER!'}
                    </span>
                  ) : (
                    <span className="text-[#f43f5e] flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-[#f43f5e]" />
                      {isFr
                        ? 'RÉPONSE INCORRECTE — ANCRAGE PÉDAGOGIQUE :'
                        : 'INCORRECT ANSWER — EXPLANATION:'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#d3e4fe] leading-relaxed">
                  {currentQ.explanation}
                </p>

                {currentQ.keyTakeaway && (
                  <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-[#4edea3] font-mono font-semibold">
                    <span>{currentQ.keyTakeaway}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1b2b3f]">
              <span className="text-xs font-mono text-[#89929b]">
                {isFr ? 'Difficulté progressive (15 questions)' : 'Progressive difficulty (15 items)'}
              </span>

              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    selectedOption
                      ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-[#0284c7]/20'
                      : 'bg-[#1b2b3f] text-[#89929b] cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>{isFr ? 'Valider ma réponse' : 'Submit Answer'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#4edea3] to-[#22c55e] hover:from-[#22c55e] hover:to-[#16a34a] text-[#003824] shadow-lg shadow-[#4edea3]/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>
                    {currentIndex < totalQuestions - 1
                      ? isFr
                        ? 'Question suivante →'
                        : 'Next Question →'
                      : isFr
                      ? 'Terminer ma séance du jour →'
                      : 'Finish today\'s session →'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* ÉTAPE B : RAPPORT DE FIN DE SÉANCE DU JOUR                                */
          /* ========================================================================= */
          <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#002b1c] via-[#001f38] to-[#0b1c30] border border-[#4edea3]/40 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#003824] border border-[#4edea3]/50 flex items-center justify-center text-[#4edea3] shadow-lg shadow-[#4edea3]/25">
                  <Award className="w-7 h-7" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-mono text-[#4edea3] uppercase tracking-wider font-bold">
                    {isFr ? 'SÉANCE DU JOUR VALIDÉE' : 'DAILY SESSION COMPLETED'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-sans text-white">
                    {isFr ? 'Bravo ! Votre entraînement quotidien est validé' : 'Well done! Today\'s workout completed'}
                  </h3>
                  <span className="text-xs text-[#bfc7d2]">
                    {isFr
                      ? `15 questions résolues en ${formatTimer(elapsedSeconds)} • Score : ${completionResult?.score}% (${completionResult?.totalCorrect}/15)`
                      : `15 questions resolved in ${formatTimer(elapsedSeconds)} • Score: ${completionResult?.score}% (${completionResult?.totalCorrect}/15)`}
                  </span>
                </div>
              </div>

              <div className="text-center sm:text-right px-4 py-2 rounded-xl bg-[#000d1a] border border-[#1b2b3f]">
                <span className="font-mono text-[10px] text-[#89929b] uppercase block">
                  {isFr ? 'Score de la séance' : 'Session Score'}
                </span>
                <span className="text-3xl font-mono font-bold text-[#4edea3]">
                  {completionResult?.score}%
                </span>
              </div>
            </div>

            {/* DÉCOMPOSITION PAR PILIER (JOIN 5, Transactions 4, Indexes 3, SQL avancé 3) */}
            <div className="p-5 rounded-2xl bg-[#071322] border border-[#1b2b3f] flex flex-col gap-3 font-mono">
              <span className="text-xs font-bold text-[#89ceff] uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#38bdf8]" />
                {isFr ? 'Résultats par compétence travaillée :' : 'Results by drilled competency:'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {completionResult?.topicResults.map((t) => (
                  <div
                    key={t.topicId}
                    className="p-3.5 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{t.topicName}</span>
                      <span className="text-[11px] text-[#89929b]">
                        {t.correct}/{t.total}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#102034] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          t.scorePercent >= 75
                            ? 'bg-[#4edea3]'
                            : t.scorePercent >= 50
                            ? 'bg-[#38bdf8]'
                            : 'bg-[#f43f5e]'
                        }`}
                        style={{ width: `${t.scorePercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-0.5 text-[11px]">
                      <span className="text-[#89929b]">Taux :</span>
                      <span
                        className={`font-bold ${
                          t.scorePercent >= 75
                            ? 'text-[#4edea3]'
                            : t.scorePercent >= 50
                            ? 'text-[#38bdf8]'
                            : 'text-[#f43f5e]'
                        }`}
                      >
                        {t.scorePercent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IMPACT EN DIRECT SUR « MON NIVEAU » */}
            <div className="p-4 rounded-xl bg-[#00172c] border border-[#0284c7]/40 flex items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-[#4edea3] shrink-0" />
                <span className="text-[#d3e4fe] leading-snug">
                  {isFr
                    ? 'Votre arbre de compétences « MON NIVEAU » a été mis à jour automatiquement avec vos nouveaux scores.'
                    : 'Your "MY LEVEL" mastery tree was automatically updated with your new performance scores.'}
                </span>
              </div>
              <span className="text-[#4edea3] font-bold shrink-0">✓ Synchronisé</span>
            </div>

            {/* BOUTONS D'ACTION */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1b2b3f]">
              <button
                onClick={handleRestart}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#89929b] hover:text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isFr ? 'Refaire la séance' : 'Restart session'}</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToDashboard) {
                      onNavigateToDashboard();
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-bold text-xs shadow-lg shadow-[#0284c7]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{isFr ? 'Consulter MON NIVEAU sur le Dashboard →' : 'View MY LEVEL on Dashboard →'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
