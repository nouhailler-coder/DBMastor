import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Target,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  Award,
  Clock,
  Brain,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Code2,
  Database,
  Sparkles,
  ShieldCheck,
  Layers,
  Zap,
  Info,
  ExternalLink,
  Check,
  TrendingUp,
  BookmarkCheck,
  BarChart3
} from 'lucide-react';
import {
  AdaptiveLearningModule,
  LearningCycleStep,
  AdaptiveQuestion,
  MiniCourseModule,
  QuestionAttemptLog
} from '../types';
import { adaptiveLearningModules } from '../data/adaptiveLearningData';
import { ProgressiveExplainPanel } from './ProgressiveExplainPanel';

interface AdaptiveLearningViewProps {
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  onNavigateToTab?: (tab: string) => void;
}

export const AdaptiveLearningView: React.FC<AdaptiveLearningViewProps> = ({
  lang,
  theme = 'dark',
  onNavigateToTab
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  // Module actif
  const [selectedModuleId, setSelectedModuleId] = useState<string>('sql-joins-mastery');
  const activeModule: AdaptiveLearningModule =
    adaptiveLearningModules.find((m) => m.id === selectedModuleId) || adaptiveLearningModules[0];

  // Étape du cycle pédagogique (Apprendre -> S'entraîner -> Se tromper -> Comprendre -> Rejouer -> Valider)
  const [currentStep, setCurrentStep] = useState<LearningCycleStep>('learn');

  // État de la phase "S'entraîner" (10 questions initiales)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [attemptLogs, setAttemptLogs] = useState<QuestionAttemptLog[]>([]);

  // Faiblesse détectée lors de l'étape "Se tromper"
  const [detectedWeaknessId, setDetectedWeaknessId] = useState<string>('left_join');

  // État de la phase "Rejouer" (5 questions ciblées de remédiation)
  const [remedyIndex, setRemedyIndex] = useState<number>(0);
  const [remedyAnswers, setRemedyAnswers] = useState<Record<string, string[]>>({});
  const [remedySubmitted, setRemedySubmitted] = useState<Record<string, boolean>>({});

  // Chronomètre live par question
  const [timerTick, setTimerTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calcul du temps passé sur la question active
  const elapsedSecondsOnCurrentQ = Math.floor((Date.now() - questionStartTime) / 1000);

  // Remise à zéro lors du changement de question
  const handleNextQuestion = () => {
    const currentQ = activeModule.initialQuestions[currentQuestionIndex];
    if (currentQ) {
      const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      setQuestionTimes((prev) => ({
        ...prev,
        [currentQ.id]: (prev[currentQ.id] || 0) + elapsed
      }));
    }

    if (currentQuestionIndex < activeModule.initialQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      // Analyse et passage au diagnostic
      triggerDiagnostic();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  // Sélection d'option
  const handleSelectOption = (questionId: string, optId: string, correctCount: number) => {
    const prev = selectedAnswers[questionId] || [];
    let updated: string[];
    if (correctCount === 1) {
      updated = [optId];
    } else {
      if (prev.includes(optId)) {
        updated = prev.filter((id) => id !== optId);
      } else {
        updated = [...prev, optId];
      }
    }
    setSelectedAnswers((prevMap) => ({ ...prevMap, [questionId]: updated }));
  };

  // Moteur de diagnostic adaptatif
  const triggerDiagnostic = () => {
    const questions = activeModule.initialQuestions;
    const subconceptStats: Record<
      string,
      { total: number; correct: number; totalTime: number; errors: number }
    > = {};

    questions.forEach((q) => {
      const subId = q.subconceptId;
      if (!subconceptStats[subId]) {
        subconceptStats[subId] = { total: 0, correct: 0, totalTime: 0, errors: 0 };
      }
      subconceptStats[subId].total += 1;

      const userAnswers = selectedAnswers[q.id] || [];
      const correctOptionIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
      const isCorrect =
        correctOptionIds.length === userAnswers.length &&
        correctOptionIds.every((id) => userAnswers.includes(id));

      if (isCorrect) {
        subconceptStats[subId].correct += 1;
      } else {
        subconceptStats[subId].errors += 1;
      }
      subconceptStats[subId].totalTime += questionTimes[q.id] || 35;
    });

    // Trouver la sous-notion la plus fragile (taux d'erreur max ou temps d'hésitation le plus élevé)
    let worstConceptId = 'left_join';
    let worstScore = 999;

    Object.entries(subconceptStats).forEach(([subId, stats]) => {
      const successRate = stats.correct / stats.total;
      if (successRate < worstScore) {
        worstScore = successRate;
        worstConceptId = subId;
      }
    });

    // Si l'utilisateur a tout bon, on propose quand même une consolidation avancée sur on_vs_where ou left_join
    if (worstScore === 1) {
      worstConceptId = 'on_vs_where';
    }

    setDetectedWeaknessId(worstConceptId);
    setCurrentStep('diagnose');
  };

  // Données de remédiation
  const currentMiniCourse: MiniCourseModule | undefined =
    activeModule.miniCourses[detectedWeaknessId] ||
    activeModule.miniCourses['left_join'] ||
    Object.values(activeModule.miniCourses)[0];

  const currentRemedyQuestions: AdaptiveQuestion[] =
    activeModule.remediationQuestions[detectedWeaknessId] ||
    activeModule.remediationQuestions['left_join'] ||
    [];

  // Réinitialisation du module pour rejouer
  const handleResetModule = () => {
    setCurrentStep('learn');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuestionTimes({});
    setQuestionStartTime(Date.now());
    setRemedyIndex(0);
    setRemedyAnswers({});
    setRemedySubmitted({});
  };

  // Étapes visuelles du cycle pédagogique
  const cycleStepsList: { key: LearningCycleStep; labelFr: string; labelEn: string; icon: any }[] = [
    { key: 'learn', labelFr: '1. Apprendre', labelEn: '1. Learn', icon: BookOpen },
    { key: 'train', labelFr: '2. S\'entraîner', labelEn: '2. Train', icon: Target },
    { key: 'diagnose', labelFr: '3. Se tromper (Diagnostic)', labelEn: '3. Diagnose', icon: AlertTriangle },
    { key: 'understand', labelFr: '4. Comprendre (Mini-cours)', labelEn: '4. Understand', icon: Lightbulb },
    { key: 'remedy', labelFr: '5. Rejouer (Ciblé)', labelEn: '5. Replay', icon: RotateCcw },
    { key: 'validate', labelFr: '6. Valider', labelEn: '6. Validate', icon: Award }
  ];

  // Calcul des métriques globales
  const totalQuestionsCount = activeModule.initialQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const currentQ = activeModule.initialQuestions[currentQuestionIndex];
  const userCurrentAnswers = currentQ ? selectedAnswers[currentQ.id] || [] : [];

  // Helper pour coloration SQL simple
  const renderSqlSnippet = (sql: string) => {
    return (
      <pre
        className={`p-4 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto border ${
          isLight
            ? 'bg-[#f8fafc] text-[#0f172a] border-[#e2e8f0]'
            : 'bg-[#000f21] text-[#d3e4fe] border-[#1b2b3f]'
        }`}
      >
        <code>{sql}</code>
      </pre>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. BANNIÈRE SUPÉRIEURE DU CYCLE D'APPRENTISSAGE ADAPTATIF */}
      <div
        className={`p-5 rounded-2xl border transition-all shadow-md ${
          isLight
            ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
            : 'bg-[#0b1c30] border-[#1b2b3f] text-[#d3e4fe]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shadow-lg shadow-[#0284c7]/20">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase bg-[#0284c7]/10 text-[#0284c7] border border-[#0284c7]/30">
                  {isFr ? 'Système d\'Apprentissage Adaptatif' : 'Adaptive Learning Engine'}
                </span>
                <span className="text-xs text-[#64748b] hidden sm:inline">•</span>
                <span className="text-xs text-[#64748b] hidden sm:inline font-medium">
                  {activeModule.category}
                </span>
              </div>
              <h1 className="text-xl font-bold mt-0.5 flex items-center gap-2">
                {isFr ? activeModule.titleFr : activeModule.titleEn}
              </h1>
            </div>
          </div>

          {/* Module Selector & Navigation */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748b] font-medium hidden md:inline">
              {isFr ? 'Parcours :' : 'Track:'}
            </span>
            <select
              value={selectedModuleId}
              onChange={(e) => {
                setSelectedModuleId(e.target.value);
                handleResetModule();
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium focus:outline-none focus:ring-2 focus:ring-[#0284c7] ${
                isLight
                  ? 'bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a]'
                  : 'bg-[#102034] border-[#1b2b3f] text-[#d3e4fe]'
              }`}
            >
              {adaptiveLearningModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {isFr ? m.titleFr : m.titleEn}
                </option>
              ))}
            </select>

            <button
              onClick={handleResetModule}
              title={isFr ? 'Recommencer le cycle' : 'Reset cycle'}
              className={`p-2 rounded-lg border transition-all ${
                isLight
                  ? 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] border-[#cbd5e1]'
                  : 'bg-[#102034] text-[#89929b] hover:text-[#d3e4fe] border-[#1b2b3f]'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PROGRESSION INTERACTIVE DU CYCLE DES 6 ÉTAPES */}
        <div className="mt-5 pt-4 border-t border-[#1b2b3f]/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {cycleStepsList.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.key;
              const isPast =
                cycleStepsList.findIndex((s) => s.key === currentStep) > idx;

              return (
                <button
                  key={step.key}
                  onClick={() => setCurrentStep(step.key)}
                  className={`px-3 py-2 rounded-xl text-left transition-all flex items-center gap-2.5 border ${
                    isActive
                      ? isLight
                        ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-md shadow-[#0284c7]/20 font-bold'
                        : 'bg-[#3198dc] text-white border-[#3198dc] shadow-md shadow-[#3198dc]/30 font-bold'
                      : isPast
                      ? isLight
                        ? 'bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd]'
                        : 'bg-[#102034] text-[#38bdf8] border-[#1b2b3f]'
                      : isLight
                      ? 'bg-[#f8fafc] text-[#64748b] border-[#e2e8f0] opacity-75'
                      : 'bg-[#000f21]/60 text-[#89929b] border-[#102034] opacity-75'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isPast
                        ? isLight
                          ? 'bg-[#0284c7]/10 text-[#0284c7]'
                          : 'bg-[#38bdf8]/10 text-[#38bdf8]'
                        : 'bg-black/10 text-[#64748b]'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs truncate">
                    {isFr ? step.labelFr : step.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ÉTAPE 1 : APPRENDRE (Objectifs, Cartographie & Cadrage) */}
      {/* ========================================================================= */}
      {currentStep === 'learn' && (
        <div className="flex flex-col gap-6">
          <div
            className={`p-6 rounded-2xl border ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
                : 'bg-[#102034] border-[#1b2b3f] text-[#d3e4fe]'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 text-[#0284c7]">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider">
                {isFr ? 'Phase 1 : Socle & Objectifs Pédagogiques' : 'Phase 1 : Core & Learning Goals'}
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2">
              {isFr
                ? `Maîtriser les rouages de : ${activeModule.titleFr}`
                : `Mastering the Mechanics of: ${activeModule.titleEn}`}
            </h2>
            <p className="text-sm text-[#64748b] mb-6 max-w-3xl leading-relaxed">
              {isFr ? activeModule.shortDescriptionFr : activeModule.shortDescriptionEn}
            </p>

            {/* Cartographie des sous-notions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {activeModule.subconcepts.map((concept) => (
                <div
                  key={concept.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isLight
                      ? 'bg-[#f8fafc] border-[#e2e8f0] hover:border-[#0284c7]'
                      : 'bg-[#0b1c30] border-[#1b2b3f] hover:border-[#38bdf8]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#0284c7]/10 text-[#0284c7]">
                      {concept.name}
                    </span>
                    <Layers className="w-4 h-4 text-[#64748b]" />
                  </div>
                  <p className="text-xs text-[#64748b] leading-normal">
                    {isFr ? concept.shortDescFr : concept.shortDescEn}
                  </p>
                </div>
              ))}
            </div>

            {/* Prérequis recommandés */}
            <div
              className={`p-4 rounded-xl border mb-8 ${
                isLight ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-[#00281b] border-[#00a572]/40'
              }`}
            >
              <div className="flex items-center gap-2 text-[#10b981] font-semibold text-xs mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{isFr ? 'Prérequis attendus pour cette validation :' : 'Prerequisites for this track:'}</span>
              </div>
              <ul className="text-xs text-[#64748b] space-y-1 list-disc pl-5">
                {(isFr ? activeModule.prerequisitesFr : activeModule.prerequisitesEn).map(
                  (req, idx) => (
                    <li key={idx}>{req}</li>
                  )
                )}
              </ul>
            </div>

            {/* Bouton de démarrage du cycle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1b2b3f]/20">
              <div className="flex items-center gap-3 text-xs text-[#64748b]">
                <Clock className="w-4 h-4 text-[#0284c7]" />
                <span>
                  {isFr
                    ? 'Durée estimée : 10 questions de diagnostic (~8-10 min)'
                    : 'Estimated duration: 10 diagnostic questions (~8-10 min)'}
                </span>
              </div>

              <button
                onClick={() => {
                  setCurrentStep('train');
                  setQuestionStartTime(Date.now());
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white shadow-lg shadow-[#0284c7]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{isFr ? 'Lancer l\'entraînement adaptatif (10 questions)' : 'Start Adaptive Training (10 questions)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 2 : S'ENTRAÎNER (10 Questions avec chronomètre et sous-notions) */}
      {/* ========================================================================= */}
      {currentStep === 'train' && currentQ && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ZONE PRINCIPALE DE QUESTION (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div
              className={`p-6 rounded-2xl border shadow-md flex flex-col gap-4 ${
                isLight
                  ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
                  : 'bg-[#102034] border-[#1b2b3f] text-[#d3e4fe]'
              }`}
            >
              {/* Entête de la question */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1b2b3f]/20">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#0284c7]/10 text-[#0284c7] font-mono text-xs font-bold border border-[#0284c7]/30">
                    {currentQ.subconceptLabel}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                      currentQ.difficulty === 'easy'
                        ? 'bg-[#10b981]/15 text-[#10b981]'
                        : currentQ.difficulty === 'medium'
                        ? 'bg-[#f59e0b]/15 text-[#f59e0b]'
                        : 'bg-[#ef4444]/15 text-[#ef4444]'
                    }`}
                  >
                    {currentQ.difficulty}
                  </span>
                </div>

                {/* Chronomètre par question */}
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg border font-mono text-xs ${
                    isLight
                      ? 'bg-[#f8fafc] border-[#cbd5e1] text-[#334155]'
                      : 'bg-[#000f21] border-[#1b2b3f] text-[#38bdf8]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>
                    {Math.floor(elapsedSecondsOnCurrentQ / 60)}:
                    {(elapsedSecondsOnCurrentQ % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-[#64748b]">
                    / ~{currentQ.targetTimeSeconds}s
                  </span>
                </div>
              </div>

              {/* Énoncé de la question */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs text-[#64748b]">
                  {isFr ? 'Question' : 'Question'} {currentQuestionIndex + 1} / {totalQuestionsCount}
                </span>
                <p className="text-base font-semibold leading-relaxed">
                  {isFr ? currentQ.promptFr : currentQ.promptEn}
                </p>
              </div>

              {/* Code SQL associé si présent */}
              {currentQ.sqlCode && (
                <div className="my-1">{renderSqlSnippet(currentQ.sqlCode)}</div>
              )}

              {/* Options de réponse */}
              <div className="flex flex-col gap-2.5 mt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = userCurrentAnswers.includes(opt.id);

                  return (
                    <button
                      key={opt.id}
                      onClick={() =>
                        handleSelectOption(currentQ.id, opt.id, currentQ.correctCount)
                      }
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                        isSelected
                          ? isLight
                            ? 'bg-[#f0f9ff] border-[#0284c7] text-[#0f172a] shadow-sm'
                            : 'bg-[#0284c7]/20 border-[#38bdf8] text-[#d3e4fe] shadow-sm'
                          : isLight
                          ? 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-white text-[#334155]'
                          : 'bg-[#0b1c30] border-[#1b2b3f] hover:bg-[#102034] text-[#bfc7d2]'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-[#0284c7] text-white'
                            : isLight
                            ? 'bg-[#e2e8f0] text-[#475569]'
                            : 'bg-[#1b2b3f] text-[#89929b]'
                        }`}
                      >
                        {opt.label}
                      </div>
                      <span className="text-sm leading-relaxed flex-1">
                        {isFr ? opt.textFr : opt.textEn}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* FONCTIONNALITÉ « EXPLIQUE-MOI » : [Réponse] [Indice] [Expliquer] [Voir la solution] */}
              <ProgressiveExplainPanel
                questionId={currentQ.id}
                topic={currentQ.domain}
                subtopic={currentQ.subconceptLabel}
                promptText={isFr ? currentQ.promptFr : currentQ.promptEn}
                codeSnippet={currentQ.sqlCode}
                explanationText={
                  isFr
                    ? currentQ.options.find(o => o.isCorrect)?.explanationFr
                    : currentQ.options.find(o => o.isCorrect)?.explanationEn
                }
                correctOptionLetter={currentQ.options.find(o => o.isCorrect)?.label}
                correctOptionText={
                  isFr
                    ? currentQ.options.find(o => o.isCorrect)?.textFr
                    : currentQ.options.find(o => o.isCorrect)?.textEn
                }
                hasSelectedAnswer={userCurrentAnswers.length > 0}
                lang={lang}
                theme={theme}
              />

              {/* Navigation entre questions */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#1b2b3f]/20">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePrevQuestion}
                  className="px-4 py-2 rounded-xl text-xs font-medium border disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Précédente' : 'Previous'}</span>
                </button>

                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-[#0284c7]/20 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <span>
                    {currentQuestionIndex === totalQuestionsCount - 1
                      ? isFr
                        ? 'Valider & Lancer le Diagnostic'
                        : 'Submit & Run Diagnostic'
                      : isFr
                      ? 'Question Suivante'
                      : 'Next Question'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* PALETTE LATÉRALE DES QUESTIONS & SUIVI PROGRESSIF (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div
              className={`p-5 rounded-2xl border shadow-md flex flex-col gap-4 ${
                isLight
                  ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
                  : 'bg-[#102034] border-[#1b2b3f] text-[#d3e4fe]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">
                  {isFr ? 'Matrice des Questions' : 'Questions Palette'}
                </span>
                <span className="text-xs text-[#0284c7] font-mono font-semibold">
                  {answeredCount} / {totalQuestionsCount} {isFr ? 'répondues' : 'answered'}
                </span>
              </div>

              {/* Grille des 10 questions */}
              <div className="grid grid-cols-5 gap-2">
                {activeModule.initialQuestions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const isAnswered = !!(selectedAnswers[q.id] && selectedAnswers[q.id].length > 0);

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
                        setQuestionTimes((prev) => ({
                          ...prev,
                          [currentQ.id]: (prev[currentQ.id] || 0) + elapsed
                        }));
                        setCurrentQuestionIndex(idx);
                        setQuestionStartTime(Date.now());
                      }}
                      className={`h-11 rounded-xl font-mono text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                        isCurrent
                          ? 'border-[#0284c7] ring-2 ring-[#0284c7]/30 bg-[#0284c7] text-white shadow-sm'
                          : isAnswered
                          ? isLight
                            ? 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0369a1]'
                            : 'bg-[#002847] border-[#0284c7] text-[#38bdf8]'
                          : isLight
                          ? 'bg-[#f8fafc] border-[#e2e8f0] text-[#64748b]'
                          : 'bg-[#0b1c30] border-[#1b2b3f] text-[#89929b]'
                      }`}
                    >
                      <span>Q{idx + 1}</span>
                      <span className="text-[8px] font-normal truncate max-w-[40px]">
                        {q.subconceptLabel.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bouton rapide d'analyse directe */}
              <button
                onClick={triggerDiagnostic}
                className="w-full mt-2 py-2.5 rounded-xl border font-semibold text-xs text-[#0284c7] hover:bg-[#0284c7]/10 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isFr ? 'Diagnostiquer mes lacunes maintenant' : 'Diagnose my weaknesses now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 3 : SE TROMPER / DIAGNOSTIC AUTOMATISÉ DES FAIBLESSES */}
      {/* ========================================================================= */}
      {currentStep === 'diagnose' && (
        <div className="flex flex-col gap-6">
          <div
            className={`p-6 rounded-2xl border shadow-lg ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
                : 'bg-[#102034] border-[#1b2b3f] text-[#d3e4fe]'
            }`}
          >
            <div className="flex items-center gap-2.5 text-[#f59e0b] mb-2 font-mono text-xs font-bold uppercase">
              <AlertTriangle className="w-5 h-5" />
              <span>{isFr ? 'Phase 3 : Analyse Diagnostique des Faiblesses' : 'Phase 3 : Weakness Diagnostic'}</span>
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {isFr ? 'Bilan & Diagnostic Cognitif de Votre Entraînement' : 'Training Assessment & Cognitive Diagnosis'}
            </h2>
            <p className="text-sm text-[#64748b] mb-6 max-w-3xl">
              {isFr
                ? 'Le moteur a analysé vos réponses, vos erreurs et vos temps d\'hésitation pour cartographier vos points forts et isoler la notion exacte qui nécessite une consolidation.'
                : 'The engine analyzed your answers, errors, and deliberation times to pinpoint the exact concept requiring remediation.'}
            </p>

            {/* CARTE D'ALERTE FAIBLESSE DÉTECTÉE */}
            <div
              className={`p-5 rounded-2xl border-2 mb-6 ${
                isLight
                  ? 'bg-[#fffbeb] border-[#f59e0b] text-[#78350f]'
                  : 'bg-[#451a03]/40 border-[#f59e0b] text-[#fde68a]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f59e0b] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-[#f59e0b]/20 font-bold">
                      {isFr ? 'Faiblesse Critique Détectée' : 'Critical Weakness Detected'}
                    </span>
                    <span className="font-bold text-base">
                      {currentMiniCourse?.subconceptLabel || detectedWeaknessId}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">
                    {isFr
                      ? currentMiniCourse?.diagnosisSummaryFr
                      : currentMiniCourse?.diagnosisSummaryEn}
                  </p>
                  <p className="text-xs text-[#b45309] font-mono mt-1">
                    {isFr
                      ? 'Recommandation : Un mini-cours ciblé de 3 minutes vous permettra d\'éradiquer ce piège définitivement.'
                      : 'Recommendation: A targeted 3-minute mini-course will permanently eradicate this trap.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Boutons d'action diagnostique */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1b2b3f]/20">
              <button
                onClick={() => setCurrentStep('train')}
                className="px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 hover:bg-black/5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isFr ? 'Revoir mes 10 questions' : 'Review my 10 questions'}</span>
              </button>

              <button
                onClick={() => setCurrentStep('understand')}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white shadow-lg shadow-[#0284c7]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
              >
                <span>{isFr ? 'Étape 4 : Ouvrir le Mini-Cours de Remédiation' : 'Step 4: Open Targeted Mini-Course'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 4 : COMPRENDRE (Mini-Cours Interactif & Pièges d'Examen) */}
      {/* ========================================================================= */}
      {currentStep === 'understand' && currentMiniCourse && (
        <div className="flex flex-col gap-6">
          <div
            className={`p-6 rounded-2xl border shadow-lg ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
                : 'bg-[#102034] border-[#1b2b3f] text-[#d3e4fe]'
            }`}
          >
            {/* Header du mini cours */}
            <div className="flex items-center gap-2 text-[#0284c7] mb-2 font-mono text-xs font-bold uppercase">
              <Lightbulb className="w-5 h-5" />
              <span>{isFr ? 'Phase 4 : Mini-Cours de Remédiation Ciblée' : 'Phase 4 : Targeted Mini-Course'}</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">
              {isFr ? currentMiniCourse.titleFr : currentMiniCourse.titleEn}
            </h2>
            <p className="text-sm text-[#64748b] mb-6">
              {isFr ? currentMiniCourse.subtitleFr : currentMiniCourse.subtitleEn}
            </p>

            {/* RÈGLE D'OR ENCADRÉE */}
            <div
              className={`p-5 rounded-2xl border-l-4 border-l-[#0284c7] mb-6 ${
                isLight ? 'bg-[#f0f9ff] border-[#bae6fd]' : 'bg-[#002847] border-[#0284c7]'
              }`}
            >
              <div className="flex items-center gap-2 text-[#0284c7] font-bold text-sm mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{isFr ? 'RÈGLE FONDAMENTALE À GRAVER' : 'FUNDAMENTAL GOLDEN RULE'}</span>
              </div>
              <p className="text-sm font-semibold leading-relaxed">
                {isFr ? currentMiniCourse.keyRuleFr : currentMiniCourse.keyRuleEn}
              </p>
            </div>

            {/* SCHÉMA VISUEL CONCEPTUEL */}
            {currentMiniCourse.visualDiagram && (
              <div className="mb-6 flex flex-col gap-2">
                <span className="font-bold text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#0284c7]" />
                  <span>
                    {isFr
                      ? currentMiniCourse.visualDiagram.titleFr
                      : currentMiniCourse.visualDiagram.titleEn}
                  </span>
                </span>
                <pre
                  className={`p-4 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto border ${
                    isLight
                      ? 'bg-[#f8fafc] text-[#0f172a] border-[#cbd5e1]'
                      : 'bg-[#000f21] text-[#93ccff] border-[#1b2b3f]'
                  }`}
                >
                  {currentMiniCourse.visualDiagram.asciiIllustration}
                </pre>
                <span className="text-xs text-[#64748b] italic">
                  {isFr
                    ? currentMiniCourse.visualDiagram.legendFr
                    : currentMiniCourse.visualDiagram.legendEn}
                </span>
              </div>
            )}

            {/* BLOC COMPARATIF PIÈGE VS BONNE PRATIQUE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Le Piège */}
              <div
                className={`p-4 rounded-xl border flex flex-col gap-2 ${
                  isLight ? 'bg-[#fef2f2] border-[#fecaca]' : 'bg-[#450a0a]/30 border-[#ef4444]/40'
                }`}
              >
                <div className="flex items-center gap-2 text-[#ef4444] font-bold text-xs">
                  <XCircle className="w-4 h-4" />
                  <span>{isFr ? 'Le Piège Classique (Code Erroné)' : 'The Classic Trap (Buggy Code)'}</span>
                </div>
                <pre className="p-3 rounded-lg bg-black/20 font-mono text-[11px] overflow-x-auto text-[#ef4444]">
                  {currentMiniCourse.trapSnippet.wrongCode}
                </pre>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  {isFr
                    ? currentMiniCourse.trapSnippet.wrongWhyFr
                    : currentMiniCourse.trapSnippet.wrongWhyEn}
                </p>
              </div>

              {/* La Bonne Pratique */}
              <div
                className={`p-4 rounded-xl border flex flex-col gap-2 ${
                  isLight ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-[#052e16]/30 border-[#10b981]/40'
                }`}
              >
                <div className="flex items-center gap-2 text-[#10b981] font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isFr ? 'La Bonne Pratique (Code Robuste)' : 'Best Practice (Clean Code)'}</span>
                </div>
                <pre className="p-3 rounded-lg bg-black/20 font-mono text-[11px] overflow-x-auto text-[#10b981]">
                  {currentMiniCourse.trapSnippet.correctCode}
                </pre>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  {isFr
                    ? currentMiniCourse.trapSnippet.correctWhyFr
                    : currentMiniCourse.trapSnippet.correctWhyEn}
                </p>
              </div>
            </div>

            {/* BOUTON VERS LA PHASE REJOUER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1b2b3f]/20">
              <button
                onClick={() => setCurrentStep('diagnose')}
                className="px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isFr ? 'Retour au diagnostic' : 'Back to diagnostic'}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentStep('remedy');
                  setRemedyIndex(0);
                }}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-lg shadow-[#10b981]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
              >
                <span>
                  {isFr
                    ? 'Étape 5 : Rejouer 5 questions ciblées de remédiation'
                    : 'Step 5: Replay 5 targeted remediation questions'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 5 : REJOUER (5 Questions Ciblées de Remédiation) */}
      {/* ========================================================================= */}
      {currentStep === 'remedy' && currentRemedyQuestions.length > 0 && (
        <div className="flex flex-col gap-6">
          {(() => {
            const remedyQ = currentRemedyQuestions[remedyIndex] || currentRemedyQuestions[0];
            const currentRemedyAns = remedyAnswers[remedyQ.id] || [];
            const isSubmitted = !!remedySubmitted[remedyQ.id];

            return (
              <div
                className={`p-6 rounded-2xl border shadow-lg flex flex-col gap-5 ${
                  isLight
                    ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
                    : 'bg-[#102034] border-[#1b2b3f] text-[#d3e4fe]'
                }`}
              >
                {/* Header question de remédiation */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]/20">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#10b981]/15 text-[#10b981] font-mono text-xs font-bold">
                      {isFr ? 'Remédiation Ciblée' : 'Targeted Remediation'}
                    </span>
                    <span className="text-xs text-[#64748b]">
                      {remedyIndex + 1} / {currentRemedyQuestions.length}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-[#0284c7] font-semibold">
                    {remedyQ.subconceptLabel}
                  </span>
                </div>

                {/* Prompt */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold leading-relaxed">
                    {isFr ? remedyQ.promptFr : remedyQ.promptEn}
                  </h3>
                  {remedyQ.sqlCode && renderSqlSnippet(remedyQ.sqlCode)}
                </div>

                {/* Options */}
                <div className="flex flex-col gap-2.5">
                  {remedyQ.options.map((opt) => {
                    const isSelected = currentRemedyAns.includes(opt.id);
                    let optStyle = isLight
                      ? 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-white text-[#334155]'
                      : 'bg-[#0b1c30] border-[#1b2b3f] hover:bg-[#102034] text-[#bfc7d2]';

                    if (isSubmitted) {
                      if (opt.isCorrect) {
                        optStyle = isLight
                          ? 'bg-[#dcfce7] border-[#16a34a] text-[#15803d] font-semibold'
                          : 'bg-[#052e16] border-[#10b981] text-[#4edea3] font-semibold';
                      } else if (isSelected && !opt.isCorrect) {
                        optStyle = isLight
                          ? 'bg-[#fee2e2] border-[#dc2626] text-[#b91c1c]'
                          : 'bg-[#450a0a] border-[#ef4444] text-[#fca5a5]';
                      }
                    } else if (isSelected) {
                      optStyle = isLight
                        ? 'bg-[#f0f9ff] border-[#0284c7] text-[#0f172a]'
                        : 'bg-[#0284c7]/20 border-[#38bdf8] text-[#d3e4fe]';
                    }

                    return (
                      <div key={opt.id} className="flex flex-col gap-1">
                        <button
                          disabled={isSubmitted}
                          onClick={() => {
                            setRemedyAnswers((prev) => ({
                              ...prev,
                              [remedyQ.id]: [opt.id]
                            }));
                          }}
                          className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${optStyle}`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-[#0284c7] text-white'
                                : isLight
                                ? 'bg-[#e2e8f0] text-[#475569]'
                                : 'bg-[#1b2b3f] text-[#89929b]'
                            }`}
                          >
                            {opt.label}
                          </div>
                          <span className="text-sm leading-relaxed flex-1">
                            {isFr ? opt.textFr : opt.textEn}
                          </span>
                        </button>

                        {/* Explication immédiate après soumission */}
                        {isSubmitted && (
                          <div
                            className={`px-4 py-2 rounded-lg text-xs leading-normal ml-9 border ${
                              opt.isCorrect
                                ? isLight
                                  ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]'
                                  : 'bg-[#052e16]/40 border-[#10b981]/30 text-[#4edea3]'
                                : isLight
                                ? 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
                                : 'bg-[#450a0a]/30 border-[#ef4444]/30 text-[#fca5a5]'
                            }`}
                          >
                            {isFr ? opt.explanationFr : opt.explanationEn}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Actions de validation par question */}
                <div className="flex items-center justify-between pt-4 border-t border-[#1b2b3f]/20">
                  <button
                    disabled={remedyIndex === 0}
                    onClick={() => setRemedyIndex((prev) => prev - 1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border disabled:opacity-30 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Précédente' : 'Previous'}</span>
                  </button>

                  {!isSubmitted ? (
                    <button
                      disabled={currentRemedyAns.length === 0}
                      onClick={() =>
                        setRemedySubmitted((prev) => ({ ...prev, [remedyQ.id]: true }))
                      }
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#10b981] hover:bg-[#059669] text-white shadow-md shadow-[#10b981]/20 disabled:opacity-40"
                    >
                      {isFr ? 'Vérifier ma réponse' : 'Check My Answer'}
                    </button>
                  ) : remedyIndex < currentRemedyQuestions.length - 1 ? (
                    <button
                      onClick={() => setRemedyIndex((prev) => prev + 1)}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center gap-1.5"
                    >
                      <span>{isFr ? 'Question suivante' : 'Next question'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentStep('validate')}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0284c7] to-[#10b981] text-white shadow-lg flex items-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      <span>{isFr ? 'Valider la Maîtrise du Module' : 'Validate Track Mastery'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÉTAPE 6 : VALIDER (Matrice de Maîtrise & Certification Débloquée) */}
      {/* ========================================================================= */}
      {currentStep === 'validate' && (
        <div className="flex flex-col gap-6">
          <div
            className={`p-8 rounded-2xl border shadow-xl text-center flex flex-col items-center gap-6 ${
              isLight
                ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
                : 'bg-[#102034] border-[#1b2b3f] text-[#d3e4fe]'
            }`}
          >
            {/* Trophée & Badge */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#10b981] to-[#00a572] flex items-center justify-center text-white shadow-xl shadow-[#10b981]/30">
              <Award className="w-10 h-10" />
            </div>

            <div className="flex flex-col items-center gap-2 max-w-xl">
              <span className="px-3 py-1 rounded-full bg-[#10b981]/15 text-[#10b981] text-xs font-bold font-mono uppercase tracking-wider">
                {isFr ? 'Cycle d\'Apprentissage Terminé avec Succès' : 'Learning Cycle Successfully Completed'}
              </span>
              <h2 className="text-3xl font-extrabold">
                {isFr ? 'Compétence Validée & Certifiée !' : 'Skill Validated & Certified!'}
              </h2>
              <p className="text-sm text-[#64748b] leading-relaxed">
                {isFr
                  ? `Vous avez complété l'entraînement, compris la source exacte de votre hésitation sur "${currentMiniCourse?.subconceptLabel || 'les jointures'}", et validé la série ciblée de rattrapage sans erreur.`
                  : `You completed training, mastered your specific weakness, and confirmed retention through targeted remediation.`}
              </p>
            </div>

            {/* MATRICE DES NOTIONS VALIDÉES */}
            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-left my-2">
              {activeModule.subconcepts.map((sub) => (
                <div
                  key={sub.id}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                    isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#0b1c30] border-[#1b2b3f]'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#10b981]/15 text-[#10b981] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate">{sub.name}</span>
                    <span className="text-[10px] text-[#10b981] font-semibold">
                      {isFr ? '100% Validé' : '100% Validated'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Boutons de conclusion */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <button
                onClick={handleResetModule}
                className="px-5 py-2.5 rounded-xl border text-xs font-semibold hover:bg-black/5 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isFr ? 'Recommencer ce module' : 'Restart this module'}</span>
              </button>

              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('glossary')}
                  className="px-5 py-2.5 rounded-xl border text-xs font-semibold text-[#0284c7] hover:bg-[#0284c7]/10 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{isFr ? 'Consulter le Glossaire SQL' : 'Browse SQL Glossary'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  // Basculer sur le module suivant (ex: Agrégation)
                  setSelectedModuleId('sql-aggregation-mastery');
                  handleResetModule();
                }}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white shadow-lg shadow-[#0284c7]/20 flex items-center gap-2"
              >
                <span>{isFr ? 'Passer au Module : Agrégation & GROUP BY' : 'Next Module: Aggregation & GROUP BY'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
