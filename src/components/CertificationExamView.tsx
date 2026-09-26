import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Timer, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Flag, 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  Brain, 
  RotateCcw, 
  Play, 
  Pause, 
  Sparkles, 
  Terminal, 
  BookOpen, 
  ShieldCheck, 
  ChevronRight, 
  Layers, 
  FileText,
  Filter,
  BarChart3,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { 
  certificationExamQuestions, 
  certificationConcepts 
} from '../data/certificationExamQuestions';
import { 
  CertExamQuestionItem, 
  ExamPillar, 
  CertExamResultReport, 
  CognitiveConcept 
} from '../types';
import { GeminiPedagogicalTutor } from './GeminiPedagogicalTutor';
import { ProgressiveExplainPanel } from './ProgressiveExplainPanel';
import { recordTrapAttempt } from '../services/trapService';
import { recordQuestionAttemptTelemetry } from '../services/statsService';

interface CertificationExamViewProps {
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  onNavigateToTab?: (tab: string) => void;
  onFinishExamCallback?: (score: number) => void;
}

export const CertificationExamView: React.FC<CertificationExamViewProps> = ({
  lang,
  theme = 'light',
  onNavigateToTab,
  onFinishExamCallback,
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  // Exam phase: 'intro' | 'active' | 'results' | 'review'
  const [phase, setPhase] = useState<'intro' | 'active' | 'results' | 'review'>('active');

  // Total questions count (default 60 questions as requested)
  const totalQuestions = certificationExamQuestions.length; // 60 questions
  const totalDurationSeconds = 90 * 60; // 90 minutes = 5400 seconds

  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(16); // 0-indexed -> Question 17 as in example!
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>(() => {
    // Initialiser quelques réponses pour une immersion immédiate réaliste
    const initial: Record<number, string> = {};
    for (let i = 0; i < 16; i++) {
      const q = certificationExamQuestions[i];
      // Pour simuler 78%, on donne en majorité la bonne réponse et 3 erreurs
      if (i === 1 || i === 7 || i === 13) {
        // Mauvaise réponse simulée
        const wrongOpt = q.options.find(o => o.id !== q.correctOptionId);
        if (wrongOpt) initial[i] = wrongOpt.id;
      } else {
        initial[i] = q.correctOptionId;
      }
    }
    return initial;
  });

  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({
    3: true,
    11: true,
    16: true, // Q17 marquée
  });

  // Timer: 01:12:34 comme dans la maquette de l'utilisateur (4354 secondes restantes)
  const [secondsRemaining, setSecondsRemaining] = useState(4354);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showConfirmFinishModal, setShowConfirmFinishModal] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'flagged' | 'unanswered'>('all');
  const [selectedConceptForDetail, setSelectedConceptForDetail] = useState<CognitiveConcept | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'errors' | 'flagged'>('errors');
  const [expandedTutorIndex, setExpandedTutorIndex] = useState<number | null>(null);
  const [tutorModalData, setTutorModalData] = useState<{
    q: CertExamQuestionItem;
    userAns: string;
  } | null>(null);

  // Calcul du temps écoulé
  const elapsedSeconds = totalDurationSeconds - secondsRemaining;

  // Compte à rebours
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (phase === 'active' && isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleCompleteExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase, isTimerRunning, secondsRemaining]);

  // Formatage du chronomètre (HH:MM:SS)
  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ: CertExamQuestionItem = certificationExamQuestions[currentQuestionIndex] || certificationExamQuestions[0];
  const isCurrentFlagged = !!flaggedQuestions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
  const questionStartTimeRef = useRef<number>(Date.now());
  const hintUsedOnCurrentQRef = useRef<boolean>(false);

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    hintUsedOnCurrentQRef.current = false;
  }, [currentQuestionIndex]);

  // Construction de la barre ASCII demandée: "██████████████░░░░░░░░░░  28 %"
  const totalBlocks = 24;
  const filledBlocksCount = Math.round((progressPercent / 100) * totalBlocks);
  const asciiProgressBar = '█'.repeat(filledBlocksCount) + '░'.repeat(Math.max(0, totalBlocks - filledBlocksCount));

  // Gestion de la sélection d'une option
  const handleSelectOption = (optId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optId,
    }));
    const isCorrect = optId === currentQ.correctOptionId;
    const elapsedQuestionSecs = Math.max(3, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
    const chosenOpt = currentQ.options.find((o) => o.id === optId);

    recordQuestionAttemptTelemetry({
      questionId: currentQ.id,
      answer: chosenOpt ? `Option ${chosenOpt.letter}` : optId,
      isCorrect,
      timeSpent: elapsedQuestionSecs,
      difficulty: currentQ.trapMetadata?.difficulty || 3,
      topic: currentQ.trapMetadata?.subtopic || currentQ.trapMetadata?.topic || currentQ.pillar.toUpperCase(),
      hintRequested: hintUsedOnCurrentQRef.current,
    });

    if (currentQ.trapMetadata) {
      recordTrapAttempt(currentQ.trapMetadata, isCorrect);
    }
  };

  // Bascule du statut Révision
  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestionIndex]: !prev[currentQuestionIndex],
    }));
  };

  // Terminer l'examen et calculer le rapport complet
  const examReport: CertExamResultReport = useMemo(() => {
    let correctCount = 0;
    const pillarStats: Record<ExamPillar, { correct: number; total: number; labelFr: string; labelEn: string }> = {
      sql: { correct: 0, total: 0, labelFr: 'SQL (DQL, Jointures, Agrégats)', labelEn: 'SQL (DQL, Joins, Aggregates)' },
      modelisation: { correct: 0, total: 0, labelFr: 'Modélisation & DDL (Schémas, Intégrité, 3NF)', labelEn: 'Data Modeling & DDL (Schema, Integrity, 3NF)' },
      transactions: { correct: 0, total: 0, labelFr: 'Transactions & Concurrence (ACID, Locks, MVCC)', labelEn: 'Transactions & Concurrency (ACID, Locks, MVCC)' },
      administration: { correct: 0, total: 0, labelFr: 'Administration & Performance (Index, CBO, Plans)', labelEn: 'Administration & Performance (Indexes, CBO, Plans)' },
    };

    const conceptErrorsMap: Record<string, { count: number; questionNumbers: number[] }> = {};

    certificationExamQuestions.forEach((q, idx) => {
      pillarStats[q.pillar].total += 1;
      const userAns = selectedAnswers[idx];
      const isCorrect = userAns === q.correctOptionId;

      if (isCorrect) {
        correctCount += 1;
        pillarStats[q.pillar].correct += 1;
      } else {
        // Erreur ou non répondu
        if (!conceptErrorsMap[q.conceptId]) {
          conceptErrorsMap[q.conceptId] = { count: 0, questionNumbers: [] };
        }
        conceptErrorsMap[q.conceptId].count += 1;
        conceptErrorsMap[q.conceptId].questionNumbers.push(q.number);
      }
    });

    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    const pillarBreakdown = {
      sql: {
        pillar: 'sql' as ExamPillar,
        labelFr: pillarStats.sql.labelFr,
        labelEn: pillarStats.sql.labelEn,
        correctCount: pillarStats.sql.correct,
        totalCount: pillarStats.sql.total,
        percentage: pillarStats.sql.total > 0 ? Math.round((pillarStats.sql.correct / pillarStats.sql.total) * 100) : 0,
      },
      modelisation: {
        pillar: 'modelisation' as ExamPillar,
        labelFr: pillarStats.modelisation.labelFr,
        labelEn: pillarStats.modelisation.labelEn,
        correctCount: pillarStats.modelisation.correct,
        totalCount: pillarStats.modelisation.total,
        percentage: pillarStats.modelisation.total > 0 ? Math.round((pillarStats.modelisation.correct / pillarStats.modelisation.total) * 100) : 0,
      },
      transactions: {
        pillar: 'transactions' as ExamPillar,
        labelFr: pillarStats.transactions.labelFr,
        labelEn: pillarStats.transactions.labelEn,
        correctCount: pillarStats.transactions.correct,
        totalCount: pillarStats.transactions.total,
        percentage: pillarStats.transactions.total > 0 ? Math.round((pillarStats.transactions.correct / pillarStats.transactions.total) * 100) : 0,
      },
      administration: {
        pillar: 'administration' as ExamPillar,
        labelFr: pillarStats.administration.labelFr,
        labelEn: pillarStats.administration.labelEn,
        correctCount: pillarStats.administration.correct,
        totalCount: pillarStats.administration.total,
        percentage: pillarStats.administration.total > 0 ? Math.round((pillarStats.administration.correct / pillarStats.administration.total) * 100) : 0,
      },
    };

    const cognitiveErrors = Object.entries(conceptErrorsMap)
      .map(([conceptId, data]) => ({
        concept: certificationConcepts[conceptId] || {
          id: conceptId,
          nameFr: conceptId,
          nameEn: conceptId,
          pillar: 'sql' as ExamPillar,
          diagnosticFr: 'Notion nécessitant une consolidation théorique.',
          diagnosticEn: 'Concept requiring theoretical reinforcement.',
          ruleRefFr: 'Standard SQL & SGBD',
          ruleRefEn: 'Standard SQL & DBMS',
          recommendedActionFr: 'Consulter la documentation officielle.',
          recommendedActionEn: 'Consult official documentation.',
        },
        errorCount: data.count,
        questionNumbers: data.questionNumbers,
      }))
      .sort((a, b) => b.errorCount - a.errorCount);

    return {
      scorePercent,
      passed: scorePercent >= 70,
      totalQuestions,
      answeredCount,
      correctCount,
      reviewCount: flaggedCount,
      elapsedSeconds,
      pillarBreakdown,
      cognitiveErrors,
    };
  }, [selectedAnswers, flaggedQuestions, totalQuestions, elapsedSeconds]);

  const handleCompleteExam = () => {
    setShowConfirmFinishModal(false);
    setIsTimerRunning(false);
    setPhase('results');
    if (onFinishExamCallback) {
      onFinishExamCallback(examReport.scorePercent);
    }
  };

  // Prérégler le résultat typique demandé par l'utilisateur (78%, SQL 85%, etc.)
  const handleLoadDemo78Result = () => {
    // Remplir 47 bonnes réponses sur 60 = 78.33% => 78%
    const demoAnswers: Record<number, string> = {};
    const wrongIndices = [1, 2, 7, 13, 23, 25, 27, 34, 38, 41, 49, 52, 57]; // 13 erreurs => 47 justes / 60 = 78%
    certificationExamQuestions.forEach((q, idx) => {
      if (wrongIndices.includes(idx)) {
        const wrongOpt = q.options.find(o => o.id !== q.correctOptionId);
        demoAnswers[idx] = wrongOpt ? wrongOpt.id : 'opt-wrong';
      } else {
        demoAnswers[idx] = q.correctOptionId;
      }
    });
    setSelectedAnswers(demoAnswers);
    setFlaggedQuestions({ 1: true, 7: true, 23: true, 38: true, 41: true, 49: true, 52: true, 57: true });
    setSecondsRemaining(totalDurationSeconds - (54 * 60)); // 54 min comme demandé !
    setIsTimerRunning(false);
    setPhase('results');
  };

  const handleRestartExam = () => {
    setSelectedAnswers({});
    setFlaggedQuestions({});
    setCurrentQuestionIndex(0);
    setSecondsRemaining(totalDurationSeconds);
    setIsTimerRunning(true);
    setPhase('active');
  };

  // Questions à revoir pour la revue détaillée
  const filteredReviewQuestions = useMemo(() => {
    return certificationExamQuestions.map((q, idx) => {
      const userAns = selectedAnswers[idx];
      const isCorrect = userAns === q.correctOptionId;
      const isFlagged = !!flaggedQuestions[idx];
      return { q, idx, userAns, isCorrect, isFlagged };
    }).filter(item => {
      if (reviewFilter === 'errors') return !item.isCorrect;
      if (reviewFilter === 'flagged') return item.isFlagged;
      return true;
    });
  }, [selectedAnswers, flaggedQuestions, reviewFilter]);

  // Pillar badge styling
  const getPillarBadge = (pillar: ExamPillar) => {
    switch (pillar) {
      case 'sql':
        return { label: 'SQL', bg: 'bg-[#0284c7]/15 text-[#0284c7] border-[#0284c7]/30' };
      case 'modelisation':
        return { label: isFr ? 'Modélisation' : 'Modeling', bg: 'bg-[#8b5cf6]/15 text-[#8b5cf6] border-[#8b5cf6]/30' };
      case 'transactions':
        return { label: 'Transactions', bg: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30' };
      case 'administration':
        return { label: 'Administration', bg: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30' };
    }
  };

  return (
    <div id="certification-exam-view" className="p-4 sm:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6 font-sans">
      
      {/* =========================================================================
          VUE 1 : EXAMEN ACTIF (EN COURS DE PASSAGE)
          Exactement fidèle à la maquette de l'utilisateur :
          "Examen blanc / 60 questions — 90 minutes / Question 17 / 60
           ██████████████░░░░░░░░░░  28 %
           Temps restant 01:12:34
           [ Question ] ○ A ○ B ○ C ○ D
           [Marquer pour révision]  [Suivant]"
         ========================================================================= */}
      {phase === 'active' && (
        <div className="flex flex-col gap-5">
          {/* BANDEAU SUPÉRIEUR OFFICIEL DE L'EXAMEN BLANC */}
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#102034] border-[#1b2b3f]'
          }`}>
            {/* Titre & Compteur Question */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] text-white flex items-center justify-center shadow-md shadow-[#0284c7]/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight text-[#0f172a] dark:text-[#d3e4fe]">
                      {isFr ? 'Examen blanc' : 'Practice Exam'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0284c7]/15 text-[#0284c7]">
                      {isFr ? 'Certification Officielle' : 'Official Proctored'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#64748b]">
                    {isFr ? '60 questions — 90 minutes' : '60 questions — 90 minutes'}
                  </p>
                </div>
              </div>

              {/* Séparateur vertical */}
              <div className="hidden sm:block w-px h-8 bg-[#cbd5e1] dark:bg-[#1b2b3f]"></div>

              {/* Question 17 / 60 & Barre de progression */}
              <div className="flex flex-col gap-1 min-w-[240px]">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-[#0284c7] dark:text-[#38bdf8]">
                    {isFr ? `Question ${currentQuestionIndex + 1} / ${totalQuestions}` : `Question ${currentQuestionIndex + 1} / ${totalQuestions}`}
                  </span>
                  <span className="text-[#64748b]">{progressPercent} %</span>
                </div>
                {/* Barre de progression graphique et ASCII */}
                <div className="w-full bg-[#e2e8f0] dark:bg-[#000f21] h-2.5 rounded-full overflow-hidden border border-[#cbd5e1] dark:border-[#1b2b3f]">
                  <div 
                    className="bg-gradient-to-r from-[#0284c7] to-[#38bdf8] h-full transition-all duration-300 rounded-full" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="font-mono text-[10px] text-[#94a3b8] tracking-wider hidden sm:block">
                  {asciiProgressBar} <span className="font-bold text-[#0284c7]">{progressPercent} %</span>
                </div>
              </div>
            </div>

            {/* Temps restant & Actions rapides */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Chronomètre central */}
              <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 shadow-inner ${
                secondsRemaining < 600
                  ? 'bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444] animate-pulse'
                  : secondsRemaining < 1200
                  ? 'bg-[#f59e0b]/10 border-[#f59e0b] text-[#f59e0b]'
                  : isLight ? 'bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a]' : 'bg-[#000f21] border-[#1b2b3f] text-[#d3e4fe]'
              }`}>
                <Timer className="w-4 h-4 text-[#0284c7] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-mono font-semibold text-[#64748b] leading-tight">
                    {isFr ? 'Temps restant' : 'Time Remaining'}
                  </span>
                  <span className="font-mono text-base font-extrabold tracking-widest">
                    {formatTimer(secondsRemaining)}
                  </span>
                </div>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
                  className="p-1 rounded-md text-[#64748b] hover:text-[#0284c7] transition-colors ml-1"
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>
              </div>

              {/* Bouton de démonstration directe du score cible 78% (pour tester sans attendre 60 questions) */}
              <button
                onClick={handleLoadDemo78Result}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#0284c7]/10 hover:bg-[#0284c7]/20 text-[#0284c7] border border-[#0284c7]/30 transition-all flex items-center gap-1.5"
                title="Charger directement le résultat 78% demandé avec diagnostic des erreurs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isFr ? 'Voir Résultat Type (78%)' : 'Simulate 78% Score'}</span>
              </button>

              {/* Bouton Terminer l'examen */}
              <button
                onClick={() => setShowConfirmFinishModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#10b981] hover:bg-[#059669] text-white shadow-sm transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isFr ? 'Terminer l\'examen' : 'Submit Exam'}</span>
              </button>
            </div>
          </div>

          {/* CORPS PRINCIPAL DE L'EXAMEN : QUESTION & PALETTE (2 colonnes) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ZONE QUESTION PRINCIPALE (8 colonnes) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className={`p-6 sm:p-7 rounded-2xl border shadow-sm flex flex-col gap-5 transition-colors ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#102034] border-[#1b2b3f]'
              }`}>
                
                {/* Meta de la question : Domaine, Métadonnées de Piège & Statut */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e2e8f0] dark:border-[#1b2b3f]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${getPillarBadge(currentQ.pillar).bg}`}>
                      {getPillarBadge(currentQ.pillar).label}
                    </span>
                    <span className="text-xs font-medium text-[#64748b]">
                      {isFr ? currentQ.domainNameFr : currentQ.domainNameEn}
                    </span>
                    {currentQ.trapMetadata && (
                      <>
                        <span className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-[#f59e0b]/15 text-[#d97706] dark:text-[#fbbf24] border border-[#f59e0b]/30 flex items-center gap-1">
                          ⚠️ {isFr ? 'Piège :' : 'Trap:'} {currentQ.trapMetadata.trap}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-[#0284c7]/10 text-[#0284c7] border border-[#0284c7]/20">
                          {currentQ.trapMetadata.topic} › {currentQ.trapMetadata.subtopic} · Diff {currentQ.trapMetadata.difficulty}/5 · ⏱ {currentQ.trapMetadata.estimatedTime}s
                        </span>
                      </>
                    )}
                  </div>

                  {isCurrentFlagged && (
                    <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 flex items-center gap-1">
                      <Flag className="w-3 h-3 fill-current" />
                      {isFr ? 'Marquée pour révision' : 'Marked for review'}
                    </span>
                  )}
                </div>

                {/* Énoncé / Prompt de la question */}
                <div className="flex flex-col gap-2.5">
                  <h2 className="text-base sm:text-lg font-bold text-[#0f172a] dark:text-[#d3e4fe] leading-snug">
                    {isFr ? currentQ.promptFr : currentQ.promptEn}
                  </h2>

                  {/* Contexte de schéma si disponible */}
                  {currentQ.schemaContext && (
                    <div className="font-mono text-xs text-[#0284c7] dark:text-[#38bdf8] bg-[#0284c7]/5 p-2 rounded-lg border border-[#0284c7]/20">
                      {currentQ.schemaContext}
                    </div>
                  )}

                  {/* Snippet SQL avec coloration */}
                  {currentQ.codeSnippet && (
                    <div className="relative mt-1">
                      <pre className="p-3.5 rounded-xl bg-[#000f21] border border-[#1b2b3f] text-[#38bdf8] font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
                        <code>{currentQ.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>

                {/* OPTIONS DE RÉPONSE : ○ A, ○ B, ○ C, ○ D */}
                <div className="flex flex-col gap-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                    {isFr ? 'Choisissez une réponse :' : 'Select one option:'}
                  </span>

                  {currentQ.options.map((opt) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group ${
                          isSelected
                            ? isLight
                              ? 'bg-[#0284c7]/10 border-[#0284c7] ring-1 ring-[#0284c7]'
                              : 'bg-[#0284c7]/20 border-[#38bdf8] ring-1 ring-[#38bdf8]'
                            : isLight
                            ? 'bg-[#f8fafc] border-[#cbd5e1] hover:border-[#0284c7]/60 hover:bg-[#f1f5f9]'
                            : 'bg-[#000f21] border-[#1b2b3f] hover:border-[#38bdf8]/50 hover:bg-[#0b1c30]'
                        }`}
                      >
                        {/* Indicateur Cercle Radio ○ / ● */}
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isSelected
                            ? 'bg-[#0284c7] border-[#0284c7] text-white shadow-sm'
                            : isLight
                            ? 'border-[#94a3b8] bg-white group-hover:border-[#0284c7]'
                            : 'border-[#475569] bg-[#102034] group-hover:border-[#38bdf8]'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>

                        {/* Lettre & Texte de l'option */}
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-mono text-xs font-bold ${
                            isSelected ? 'text-[#0284c7] dark:text-[#38bdf8]' : 'text-[#64748b]'
                          }`}>
                            {isFr ? `Option ${opt.letter}` : `Option ${opt.letter}`}
                          </span>
                          <span className={`text-sm leading-relaxed ${
                            isSelected 
                              ? 'text-[#0f172a] dark:text-white font-medium' 
                              : isLight ? 'text-[#334155]' : 'text-[#cbd5e1]'
                          }`}>
                            {isFr ? opt.textFr : opt.textEn}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* FONCTIONNALITÉ « EXPLIQUE-MOI » : [Réponse] [Indice] [Expliquer] [Voir la solution] (3 Niveaux : 💡 Indice, 🧠 Explication, 📖 Cours) */}
                <ProgressiveExplainPanel
                  questionId={currentQ.id}
                  topic={currentQ.trapMetadata?.topic || currentQ.pillar.toUpperCase()}
                  subtopic={currentQ.trapMetadata?.subtopic}
                  trapName={currentQ.trapMetadata?.trap}
                  promptText={isFr ? currentQ.promptFr : currentQ.promptEn}
                  codeSnippet={currentQ.codeSnippet}
                  explanationText={isFr ? currentQ.explanationFr : currentQ.explanationEn}
                  correctOptionLetter={currentQ.options.find(o => o.id === currentQ.correctOptionId)?.letter}
                  correctOptionText={
                    isFr
                      ? currentQ.options.find(o => o.id === currentQ.correctOptionId)?.textFr
                      : currentQ.options.find(o => o.id === currentQ.correctOptionId)?.textEn
                  }
                  hasSelectedAnswer={selectedAnswers[currentQuestionIndex] !== undefined}
                  onHintUsed={() => {
                    hintUsedOnCurrentQRef.current = true;
                  }}
                  lang={lang}
                  theme={theme}
                />

                {/* BAS DE CARTE : ACTIONS DE NAVIGATION ET MARQUAGE
                    [Marquer pour révision]      [Précédent]  [Suivant] */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0] dark:border-[#1b2b3f]">
                  {/* Bouton [Marquer pour révision] */}
                  <button
                    onClick={handleToggleFlag}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                      isCurrentFlagged
                        ? 'bg-[#ef4444]/15 border-[#ef4444] text-[#ef4444]'
                        : isLight
                        ? 'bg-[#f1f5f9] border-[#cbd5e1] text-[#475569] hover:bg-[#e2e8f0]'
                        : 'bg-[#000f21] border-[#1b2b3f] text-[#94a3b8] hover:bg-[#0b1c30] hover:text-[#d3e4fe]'
                    }`}
                  >
                    <Flag className={`w-4 h-4 ${isCurrentFlagged ? 'fill-current' : ''}`} />
                    <span>{isFr ? 'Marquer pour révision' : 'Flag for review'}</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    {/* Bouton [Précédent] */}
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold border disabled:opacity-40 transition-colors flex items-center gap-1.5 bg-[#f1f5f9] dark:bg-[#000f21] border-[#cbd5e1] dark:border-[#1b2b3f] text-[#334155] dark:text-[#d3e4fe] hover:bg-[#e2e8f0] dark:hover:bg-[#1b2b3f]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Précédent' : 'Previous'}</span>
                    </button>

                    {/* Bouton [Suivant] */}
                    {currentQuestionIndex < totalQuestions - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-[#0284c7]/20 transition-all flex items-center gap-1.5"
                      >
                        <span>{isFr ? 'Suivant' : 'Next'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowConfirmFinishModal(true)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#10b981] hover:bg-[#059669] text-white shadow-md shadow-[#10b981]/20 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isFr ? 'Terminer l\'examen' : 'Submit Exam'}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* VOLET LATÉRAL : GRILLE DE L'EXAMEN & PALETTE (4 colonnes) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className={`p-5 rounded-2xl border shadow-sm flex flex-col gap-4 transition-colors ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#102034] border-[#1b2b3f]'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0f172a] dark:text-[#d3e4fe]">
                    {isFr ? `Palette des 60 questions` : `Exam Question Palette (60)`}
                  </h3>
                  <span className="font-mono text-xs font-bold text-[#0284c7]">
                    {answeredCount} / {totalQuestions}
                  </span>
                </div>

                {/* Filtres de la palette */}
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#f1f5f9] dark:bg-[#000f21] border border-[#cbd5e1] dark:border-[#1b2b3f]">
                  <button
                    onClick={() => setPaletteFilter('all')}
                    className={`py-1 text-[11px] font-mono rounded-lg font-bold transition-all ${
                      paletteFilter === 'all'
                        ? 'bg-white dark:bg-[#102034] text-[#0284c7] shadow-sm'
                        : 'text-[#64748b] hover:text-[#0f172a]'
                    }`}
                  >
                    {isFr ? 'Toutes' : 'All'} ({totalQuestions})
                  </button>
                  <button
                    onClick={() => setPaletteFilter('flagged')}
                    className={`py-1 text-[11px] font-mono rounded-lg font-bold transition-all ${
                      paletteFilter === 'flagged'
                        ? 'bg-white dark:bg-[#102034] text-[#ef4444] shadow-sm'
                        : 'text-[#64748b] hover:text-[#ef4444]'
                    }`}
                  >
                    {isFr ? 'Marquées' : 'Flagged'} ({flaggedCount})
                  </button>
                  <button
                    onClick={() => setPaletteFilter('unanswered')}
                    className={`py-1 text-[11px] font-mono rounded-lg font-bold transition-all ${
                      paletteFilter === 'unanswered'
                        ? 'bg-white dark:bg-[#102034] text-[#8b5cf6] shadow-sm'
                        : 'text-[#64748b] hover:text-[#8b5cf6]'
                    }`}
                  >
                    {isFr ? 'Restantes' : 'Remaining'} ({totalQuestions - answeredCount})
                  </button>
                </div>

                {/* Grille numérotée 1 à 60 */}
                <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-6 gap-1.5 max-h-[380px] overflow-y-auto p-1 pr-1.5">
                  {certificationExamQuestions.map((_, i) => {
                    const isCurrent = i === currentQuestionIndex;
                    const isAnswered = selectedAnswers[i] !== undefined;
                    const isFlagged = !!flaggedQuestions[i];

                    if (paletteFilter === 'flagged' && !isFlagged) return null;
                    if (paletteFilter === 'unanswered' && isAnswered) return null;

                    let btnClass = isLight 
                      ? 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1] hover:border-[#0284c7]' 
                      : 'bg-[#000f21] text-[#89929b] border-[#1b2b3f] hover:border-[#38bdf8]';

                    if (isCurrent) {
                      btnClass = 'bg-[#0284c7] text-white font-extrabold border-[#0284c7] ring-2 ring-[#0284c7]/40 shadow-sm';
                    } else if (isFlagged) {
                      btnClass = 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/40 font-bold';
                    } else if (isAnswered) {
                      btnClass = isLight
                        ? 'bg-[#10b981]/15 text-[#059669] border-[#10b981]/40 font-bold'
                        : 'bg-[#10b981]/20 text-[#4edea3] border-[#10b981]/40 font-bold';
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentQuestionIndex(i)}
                        className={`h-8 rounded-lg text-xs font-mono border transition-all flex items-center justify-center relative ${btnClass}`}
                      >
                        {i + 1}
                        {isFlagged && !isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] absolute top-1 right-1"></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Légende */}
                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#64748b] pt-3 border-t border-[#e2e8f0] dark:border-[#1b2b3f]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span> {isFr ? 'Actuelle' : 'Current'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> {isFr ? 'Répondue' : 'Answered'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span> {isFr ? 'Marquée' : 'Flagged'}
                  </span>
                </div>

                {/* Raccourci vers le Lab SQL */}
                <div className="mt-2 p-3 rounded-xl bg-[#0284c7]/5 border border-[#0284c7]/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#0284c7]" />
                    <span className="text-xs font-bold text-[#0284c7]">
                      {isFr ? 'Console SQL & Sandbox' : 'SQL Lab Sandbox'}
                    </span>
                  </div>
                  {onNavigateToTab && (
                    <button
                      onClick={() => onNavigateToTab('sandbox')}
                      className="text-xs text-[#0284c7] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>{isFr ? 'Ouvrir' : 'Open'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          VUE 2 : RÉSULTATS D'EXAMEN & NOTIONS QUI EXPLIQUENT LES ERREURS
          Exactement ce que l'utilisateur a demandé :
          "RESULTAT : 78 %
           SQL 85 %
           Modélisation 72 %
           Transactions 81 %
           Administration 69 %
           Questions à revoir : 8
           Temps : 54 min
           Et surtout :
           « Tu n'as pas seulement obtenu 78 %. Voici les notions qui expliquent tes erreurs. »"
         ========================================================================= */}
      {phase === 'results' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          {/* BANDEAU SUPÉRIEUR DU RÉSULTAT */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 transition-colors ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#102034] border-[#1b2b3f]'
          }`}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
              {/* Grand badge score circulaire */}
              <div className={`w-24 h-24 rounded-3xl border-2 flex flex-col items-center justify-center shadow-xl ${
                examReport.passed
                  ? 'bg-gradient-to-tr from-[#003824] to-[#10b981]/25 border-[#10b981] text-[#10b981]'
                  : 'bg-gradient-to-tr from-[#450a0a] to-[#ef4444]/25 border-[#ef4444] text-[#ef4444]'
              }`}>
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                  {isFr ? 'RESULTAT' : 'SCORE'}
                </span>
                <span className="font-mono text-3xl font-extrabold tracking-tight">
                  {examReport.scorePercent} %
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    examReport.passed
                      ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30'
                      : 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30'
                  }`}>
                    {examReport.passed 
                      ? (isFr ? '✓ VALIDÉ (SEUIL 70% ATTEINT)' : '✓ PASSED (70% THRESHOLD MET)')
                      : (isFr ? 'NON VALIDÉ (SEUIL 70% REQUIS)' : 'DID NOT PASS (70% REQUIRED)')}
                  </span>
                  <span className="text-xs font-medium text-[#64748b]">
                    {isFr ? 'Simulation Examen Blanc Officiel' : 'Official Proctored Simulation'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-[#d3e4fe] tracking-tight">
                  {isFr ? 'Bilan de Compétences Certification' : 'Certification Competency Report'}
                </h1>
                <p className="text-xs sm:text-sm text-[#64748b] max-w-xl">
                  {isFr
                    ? 'Évaluation complète sur 60 questions réparties selon les 4 piliers officiels du standard de base de données.'
                    : 'Comprehensive evaluation over 60 questions mapped to official database certification pillars.'}
                </p>
              </div>
            </div>

            {/* Actions : Revoir les réponses & Relancer */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setPhase('review')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-[#0284c7]/20 transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isFr ? 'Revoir toutes les questions' : 'Review all questions'}</span>
              </button>

              <button
                onClick={handleRestartExam}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 bg-[#f1f5f9] dark:bg-[#000f21] border-[#cbd5e1] dark:border-[#1b2b3f] text-[#334155] dark:text-[#d3e4fe] hover:bg-[#e2e8f0] dark:hover:bg-[#1b2b3f]"
              >
                <RotateCcw className="w-4 h-4 text-[#0284c7]" />
                <span>{isFr ? 'Refaire un examen blanc' : 'Retake exam'}</span>
              </button>
            </div>
          </div>

          {/* DÉTAIL PAR DOMAINE ET MÉTRIQUES D'EXAMEN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 4 PILIERS DU RÉSULTAT (SQL, Modélisation, Transactions, Administration) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-5 transition-colors ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#102034] border-[#1b2b3f]'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] dark:border-[#1b2b3f]">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#0284c7]" />
                    <h2 className="text-base font-bold text-[#0f172a] dark:text-[#d3e4fe]">
                      {isFr ? 'Performance par Piliers d\'Évaluation' : 'Performance by Assessment Pillars'}
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-[#64748b]">
                    {isFr ? 'Pondération Officielle' : 'Official Weighting'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PILIER 1: SQL */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                    isLight ? 'bg-[#f8fafc] border-[#cbd5e1]' : 'bg-[#000f21] border-[#1b2b3f]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#0284c7]"></span>
                        <span className="font-bold text-sm text-[#0f172a] dark:text-[#d3e4fe]">SQL</span>
                      </div>
                      <span className="font-mono text-xl font-extrabold text-[#0284c7]">
                        {examReport.pillarBreakdown.sql.percentage} %
                      </span>
                    </div>
                    <div className="w-full bg-[#e2e8f0] dark:bg-[#102034] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#0284c7] h-full rounded-full transition-all duration-700" 
                        style={{ width: `${examReport.pillarBreakdown.sql.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-[#64748b]">
                      <span>{examReport.pillarBreakdown.sql.correctCount} / {examReport.pillarBreakdown.sql.totalCount} {isFr ? 'correctes' : 'correct'}</span>
                      <span className="font-semibold text-[#10b981]">{isFr ? 'Solide' : 'Strong'}</span>
                    </div>
                  </div>

                  {/* PILIER 2: Modélisation */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                    isLight ? 'bg-[#f8fafc] border-[#cbd5e1]' : 'bg-[#000f21] border-[#1b2b3f]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#8b5cf6]"></span>
                        <span className="font-bold text-sm text-[#0f172a] dark:text-[#d3e4fe]">
                          {isFr ? 'Modélisation' : 'Modeling'}
                        </span>
                      </div>
                      <span className="font-mono text-xl font-extrabold text-[#8b5cf6]">
                        {examReport.pillarBreakdown.modelisation.percentage} %
                      </span>
                    </div>
                    <div className="w-full bg-[#e2e8f0] dark:bg-[#102034] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#8b5cf6] h-full rounded-full transition-all duration-700" 
                        style={{ width: `${examReport.pillarBreakdown.modelisation.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-[#64748b]">
                      <span>{examReport.pillarBreakdown.modelisation.correctCount} / {examReport.pillarBreakdown.modelisation.totalCount} {isFr ? 'correctes' : 'correct'}</span>
                      <span className="font-semibold text-[#0284c7]">{isFr ? 'À consolider' : 'Consolidate'}</span>
                    </div>
                  </div>

                  {/* PILIER 3: Transactions */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                    isLight ? 'bg-[#f8fafc] border-[#cbd5e1]' : 'bg-[#000f21] border-[#1b2b3f]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
                        <span className="font-bold text-sm text-[#0f172a] dark:text-[#d3e4fe]">Transactions</span>
                      </div>
                      <span className="font-mono text-xl font-extrabold text-[#10b981]">
                        {examReport.pillarBreakdown.transactions.percentage} %
                      </span>
                    </div>
                    <div className="w-full bg-[#e2e8f0] dark:bg-[#102034] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#10b981] h-full rounded-full transition-all duration-700" 
                        style={{ width: `${examReport.pillarBreakdown.transactions.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-[#64748b]">
                      <span>{examReport.pillarBreakdown.transactions.correctCount} / {examReport.pillarBreakdown.transactions.totalCount} {isFr ? 'correctes' : 'correct'}</span>
                      <span className="font-semibold text-[#10b981]">{isFr ? 'Très bon' : 'Very good'}</span>
                    </div>
                  </div>

                  {/* PILIER 4: Administration */}
                  <div className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                    isLight ? 'bg-[#f8fafc] border-[#cbd5e1]' : 'bg-[#000f21] border-[#1b2b3f]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
                        <span className="font-bold text-sm text-[#0f172a] dark:text-[#d3e4fe]">Administration</span>
                      </div>
                      <span className="font-mono text-xl font-extrabold text-[#f59e0b]">
                        {examReport.pillarBreakdown.administration.percentage} %
                      </span>
                    </div>
                    <div className="w-full bg-[#e2e8f0] dark:bg-[#102034] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#f59e0b] h-full rounded-full transition-all duration-700" 
                        style={{ width: `${examReport.pillarBreakdown.administration.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-[#64748b]">
                      <span>{examReport.pillarBreakdown.administration.correctCount} / {examReport.pillarBreakdown.administration.totalCount} {isFr ? 'correctes' : 'correct'}</span>
                      <span className="font-semibold text-[#f59e0b]">{isFr ? 'Priorité révision' : 'Review priority'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MÉTRIQUES RAPIDES (Questions à revoir : 8, Temps : 54 min) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-4 transition-colors ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#102034] border-[#1b2b3f]'
              }`}>
                <h3 className="text-sm font-bold text-[#0f172a] dark:text-[#d3e4fe]">
                  {isFr ? 'Métriques de la Session' : 'Session Telemetry'}
                </h3>

                <div className="flex flex-col gap-3 font-mono text-xs">
                  {/* Questions à revoir */}
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-[#fef2f2] border-[#fecaca]' : 'bg-[#450a0a]/20 border-[#ef4444]/30'
                  }`}>
                    <div className="flex items-center gap-2 text-[#ef4444]">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-sans font-bold">
                        {isFr ? 'Questions à revoir' : 'Questions to review'}
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-[#ef4444]">
                      {totalQuestions - examReport.correctCount}
                    </span>
                  </div>

                  {/* Temps passé */}
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-[#f8fafc] border-[#cbd5e1]' : 'bg-[#000f21] border-[#1b2b3f]'
                  }`}>
                    <div className="flex items-center gap-2 text-[#0284c7]">
                      <Timer className="w-4 h-4" />
                      <span className="font-sans font-bold text-[#0f172a] dark:text-[#d3e4fe]">
                        {isFr ? 'Temps passé' : 'Time elapsed'}
                      </span>
                    </div>
                    <span className="text-sm font-extrabold text-[#0284c7]">
                      {Math.max(1, Math.round(examReport.elapsedSeconds / 60))} min
                    </span>
                  </div>

                  {/* Questions répondues */}
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-[#f8fafc] border-[#cbd5e1]' : 'bg-[#000f21] border-[#1b2b3f]'
                  }`}>
                    <div className="flex items-center gap-2 text-[#10b981]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-sans font-bold text-[#0f172a] dark:text-[#d3e4fe]">
                        {isFr ? 'Questions traitées' : 'Completed questions'}
                      </span>
                    </div>
                    <span className="text-sm font-extrabold text-[#10b981]">
                      {examReport.answeredCount} / {totalQuestions}
                    </span>
                  </div>
                </div>

                {/* Recommandation DBA */}
                <div className="p-3 rounded-xl bg-[#0284c7]/5 border border-[#0284c7]/20 flex flex-col gap-1 text-xs">
                  <span className="font-bold text-[#0284c7]">
                    {isFr ? 'Recommandation Coach :' : 'Coach Recommendation:'}
                  </span>
                  <p className="text-[#64748b] leading-relaxed">
                    {isFr
                      ? 'Concentrez vos prochaines 48h sur les colonnes directrices d\'index composites et l\'élimination des lectures fantômes en SERIALIZABLE.'
                      : 'Focus on composite index leading column mechanics and phantom read anomalies under SERIALIZABLE.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* =========================================================================
              ET SURTOUT : LE COEUR DEMANDÉ PAR L'UTILISATEUR
              « Tu n'as pas seulement obtenu 78 %. Voici les notions qui expliquent tes erreurs. »
             ========================================================================= */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg transition-colors ${
            isLight ? 'bg-gradient-to-br from-white to-[#f0f9ff] border-[#bae6fd]' : 'bg-gradient-to-br from-[#102034] to-[#082f49]/30 border-[#0284c7]/40'
          }`}>
            
            {/* Header avec la citation exacte demandée */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e2e8f0] dark:border-[#1b2b3f]">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#0284c7]/30">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs font-bold text-[#0284c7] uppercase tracking-wider">
                    {isFr ? 'Diagnostic Cognitif & Analyse des Pièges' : 'Cognitive Diagnosis & Conceptual Trap Analysis'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white tracking-tight leading-snug">
                    {isFr 
                      ? `« Tu n'as pas seulement obtenu ${examReport.scorePercent} %. Voici les notions qui expliquent tes erreurs. »`
                      : `“You didn't just score ${examReport.scorePercent}%. Here are the concepts that explain your mistakes.”`}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30">
                  {examReport.cognitiveErrors.length} {isFr ? 'notions ciblées' : 'notions identified'}
                </span>
              </div>
            </div>

            {/* LISTE DES CARTES DIAGNOSTIQUES POUR CHAQUE NOTION EN ERREUR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              {examReport.cognitiveErrors.slice(0, 6).map(({ concept, errorCount, questionNumbers }) => {
                const badge = getPillarBadge(concept.pillar);
                const sampleQ = certificationExamQuestions.find(q => q.conceptId === concept.id);
                const trapMeta = sampleQ?.trapMetadata;
                return (
                  <div
                    key={concept.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 group hover:shadow-md ${
                      isLight 
                        ? 'bg-white border-[#e2e8f0] hover:border-[#0284c7]' 
                        : 'bg-[#000f21] border-[#1b2b3f] hover:border-[#38bdf8]/60'
                    }`}
                  >
                    <div className="flex flex-col gap-2.5">
                      {/* En-tête : Pilier, Titre & Fréquence */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#ef4444]/15 text-[#ef4444] line-through opacity-75">
                            ❌ {errorCount} {errorCount > 1 ? (isFr ? 'mauvaises réponses' : 'wrong answers') : (isFr ? 'mauvaise réponse' : 'wrong answer')}
                          </span>
                          {trapMeta && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#f59e0b]/15 text-[#d97706] dark:text-[#fbbf24] border border-[#f59e0b]/30">
                              Piège : {trapMeta.trap}
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-[#64748b]">
                          {isFr ? `Questions : ${questionNumbers.slice(0, 4).map(n => `Q${n}`).join(', ')}` : `Questions: ${questionNumbers.slice(0, 4).map(n => `Q${n}`).join(', ')}`}
                        </span>
                      </div>

                      {/* Alerte Piège Récurrent (vs simple compteur) */}
                      {trapMeta && (
                        <div className="p-2.5 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-xs font-extrabold text-[#b45309] dark:text-[#fbbf24] flex items-center gap-2">
                          <span>
                            {isFr 
                              ? (trapMeta.warningMsgFr || `⚠️ Tu fais régulièrement l'erreur ${trapMeta.trap}.`)
                              : (trapMeta.warningMsgEn || `⚠️ You regularly make the ${trapMeta.trap} mistake.`)}
                          </span>
                        </div>
                      )}

                      {/* Nom de la notion */}
                      <h4 className="text-base font-bold text-[#0f172a] dark:text-[#d3e4fe] group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8] transition-colors">
                        {isFr ? concept.nameFr : concept.nameEn}
                      </h4>

                      {/* Diagnostic explicatif de l'erreur */}
                      <p className="text-xs text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
                        {isFr ? concept.diagnosticFr : concept.diagnosticEn}
                      </p>

                      {/* Métadonnées structurées du piège */}
                      {trapMeta && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-[#f1f5f9] dark:bg-[#102034] text-[#475569] dark:text-[#94a3b8]">
                            topic: "{trapMeta.topic}"
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#f1f5f9] dark:bg-[#102034] text-[#475569] dark:text-[#94a3b8]">
                            subtopic: "{trapMeta.subtopic}"
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#f1f5f9] dark:bg-[#102034] text-[#475569] dark:text-[#94a3b8]">
                            difficulty: {trapMeta.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#0284c7]/10 text-[#0284c7]">
                            concepts: [{trapMeta.concepts.map(c => `"${c}"`).join(', ')}]
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#f1f5f9] dark:bg-[#102034] text-[#475569] dark:text-[#94a3b8]">
                            estimatedTime: {trapMeta.estimatedTime}s
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Règle d'or & Action corrective */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-[#e2e8f0] dark:border-[#1b2b3f]">
                      <div className="p-2.5 rounded-xl bg-[#0284c7]/5 border border-[#0284c7]/20 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7] shrink-0 mt-0.5" />
                        <span className="text-[11px] font-medium text-[#0284c7] leading-snug">
                          {isFr ? concept.ruleRefFr : concept.ruleRefEn}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[11px] text-[#64748b] truncate max-w-[260px]">
                          {isFr ? concept.recommendedActionFr : concept.recommendedActionEn}
                        </span>
                        {onNavigateToTab && (
                          <button
                            onClick={() => onNavigateToTab('syllabus')}
                            className="text-[#0284c7] hover:underline font-bold text-xs flex items-center gap-1 shrink-0 ml-2"
                          >
                            <span>{isFr ? 'Fiche de révision' : 'Study sheet'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Bouton vers le Tuteur Pédagogique Gemini */}
                      <button
                        onClick={() => {
                          const mistakenQ = certificationExamQuestions.find(q => q.conceptId === concept.id);
                          if (mistakenQ) {
                            const qIdx = certificationExamQuestions.findIndex(q => q.id === mistakenQ.id);
                            const uAns = selectedAnswers[qIdx] || 'q-fake';
                            setTutorModalData({ q: mistakenQ, userAns: uAns });
                          }
                        }}
                        className="mt-1 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#0284c7]/10 to-[#38bdf8]/10 hover:from-[#0284c7]/20 hover:to-[#38bdf8]/20 border border-[#0284c7]/30 text-[#0284c7] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                        <span>{isFr ? 'Pourquoi ma réponse est fausse ? (Tuteur IA)' : 'Why is my answer wrong? (AI Tutor)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bouton d'action pour explorer la revue complète */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setPhase('review')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-extrabold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-[#0284c7]/25 transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isFr ? 'Inspecter les explications de chaque question' : 'Inspect each question explanation'}</span>
              </button>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('sandbox')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 bg-white dark:bg-[#000f21] border-[#cbd5e1] dark:border-[#1b2b3f] text-[#334155] dark:text-[#d3e4fe] hover:bg-[#f1f5f9] dark:hover:bg-[#1b2b3f]"
                >
                  <Terminal className="w-4 h-4 text-[#10b981]" />
                  <span>{isFr ? 'Tester les requêtes dans le Lab SQL' : 'Test queries in SQL Lab'}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          VUE 3 : REVUE DÉTAILLÉE QUESTION PAR QUESTION
         ========================================================================= */}
      {phase === 'review' && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className={`p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#102034] border-[#1b2b3f]'
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPhase('results')}
                className="p-2 rounded-xl border bg-[#f1f5f9] dark:bg-[#000f21] border-[#cbd5e1] dark:border-[#1b2b3f] text-[#334155] dark:text-[#d3e4fe] hover:bg-[#e2e8f0]"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-[#0f172a] dark:text-[#d3e4fe]">
                  {isFr ? 'Revue Détaillée des Questions' : 'Detailed Question Review'}
                </h2>
                <p className="text-xs text-[#64748b]">
                  {isFr ? 'Analysez vos réponses face aux solutions officielles' : 'Inspect your choices against official answers'}
                </p>
              </div>
            </div>

            {/* Filtres de revue */}
            <div className="flex items-center p-1 rounded-xl bg-[#f1f5f9] dark:bg-[#000f21] border border-[#cbd5e1] dark:border-[#1b2b3f]">
              <button
                onClick={() => setReviewFilter('errors')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reviewFilter === 'errors'
                    ? 'bg-white dark:bg-[#102034] text-[#ef4444] shadow-sm'
                    : 'text-[#64748b] hover:text-[#ef4444]'
                }`}
              >
                {isFr ? 'Erreurs uniquement' : 'Errors only'} ({totalQuestions - examReport.correctCount})
              </button>
              <button
                onClick={() => setReviewFilter('flagged')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reviewFilter === 'flagged'
                    ? 'bg-white dark:bg-[#102034] text-[#f59e0b] shadow-sm'
                    : 'text-[#64748b] hover:text-[#f59e0b]'
                }`}
              >
                {isFr ? 'Marquées' : 'Flagged'} ({flaggedCount})
              </button>
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reviewFilter === 'all'
                    ? 'bg-white dark:bg-[#102034] text-[#0284c7] shadow-sm'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                {isFr ? 'Toutes' : 'All'} ({totalQuestions})
              </button>
            </div>
          </div>

          {/* Liste des questions passées en revue */}
          <div className="flex flex-col gap-4">
            {filteredReviewQuestions.map(({ q, idx, userAns, isCorrect, isFlagged }) => {
              const concept = certificationConcepts[q.conceptId];
              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl border shadow-sm flex flex-col gap-4 transition-colors ${
                    isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#102034] border-[#1b2b3f]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] dark:border-[#1b2b3f]">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isCorrect
                          ? 'bg-[#10b981]/20 text-[#10b981]'
                          : 'bg-[#ef4444]/20 text-[#ef4444]'
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </span>
                      <span className="font-bold text-sm text-[#0f172a] dark:text-[#d3e4fe]">
                        {isFr ? `Question ${idx + 1} / ${totalQuestions}` : `Question ${idx + 1} / ${totalQuestions}`}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getPillarBadge(q.pillar).bg}`}>
                        {getPillarBadge(q.pillar).label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isFlagged && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ef4444]/15 text-[#ef4444]">
                          {isFr ? 'Marquée' : 'Flagged'}
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isCorrect ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-[#ef4444]/15 text-[#ef4444]'
                      }`}>
                        {isCorrect ? (isFr ? 'Correcte (+1 pt)' : 'Correct (+1 pt)') : (isFr ? 'Erreur (0 pt)' : 'Incorrect (0 pt)')}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-[#0f172a] dark:text-[#d3e4fe]">
                    {isFr ? q.promptFr : q.promptEn}
                  </h3>

                  {q.codeSnippet && (
                    <pre className="p-3 rounded-xl bg-[#000f21] border border-[#1b2b3f] text-[#38bdf8] font-mono text-xs overflow-x-auto">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt) => {
                      const isOptionSelected = userAns === opt.id;
                      const isOptionCorrect = q.correctOptionId === opt.id;

                      let optClass = isLight ? 'bg-[#f8fafc] border-[#cbd5e1]' : 'bg-[#000f21] border-[#1b2b3f]';
                      if (isOptionCorrect) {
                        optClass = 'bg-[#10b981]/15 border-[#10b981] text-[#059669] dark:text-[#4edea3] font-bold';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        optClass = 'bg-[#ef4444]/15 border-[#ef4444] text-[#ef4444] font-bold line-through';
                      }

                      return (
                        <div key={opt.id} className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${optClass}`}>
                          <span className="font-mono font-bold">{opt.letter}.</span>
                          <span className="leading-snug">{isFr ? opt.textFr : opt.textEn}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explication & Notion associée + Métadonnées de Piège */}
                  <div className="mt-2 p-3.5 rounded-xl bg-[#0284c7]/5 border border-[#0284c7]/20 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#0284c7]">
                        <Brain className="w-3.5 h-3.5" />
                        <span>{isFr ? 'Notion clé :' : 'Key concept:'} {isFr ? concept?.nameFr : concept?.nameEn}</span>
                      </div>
                      {q.trapMetadata && (
                        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-[#f59e0b]/15 text-[#d97706] dark:text-[#fbbf24] font-bold border border-[#f59e0b]/30">
                            ⚠️ trap: "{q.trapMetadata.trap}"
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#0284c7]/10 text-[#0284c7]">
                            {q.trapMetadata.topic} › {q.trapMetadata.subtopic} (Diff {q.trapMetadata.difficulty}/5 · {q.trapMetadata.estimatedTime}s)
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
                      {isFr ? q.explanationFr : q.explanationEn}
                    </p>
                  </div>

                  {/* TUTEUR PÉDAGOGIQUE GEMINI POUR LES ERREURS */}
                  {!isCorrect && (
                    <div className="mt-2 flex flex-col gap-2">
                      <button
                        onClick={() => setExpandedTutorIndex(expandedTutorIndex === idx ? null : idx)}
                        className="w-full py-2.5 px-4 rounded-xl border flex items-center justify-between transition-all bg-gradient-to-r from-[#0284c7]/15 via-[#38bdf8]/10 to-transparent border-[#0284c7]/30 text-[#0284c7] font-extrabold text-xs shadow-sm hover:border-[#0284c7]"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#0284c7]" />
                          <span>
                            {isFr 
                              ? 'Pourquoi ma réponse est fausse ? (Tuteur Pédagogique Gemini)' 
                              : 'Why is my answer wrong? (Gemini Pedagogical Tutor)'}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#0284c7]/15">
                          {expandedTutorIndex === idx ? (isFr ? 'Fermer ▲' : 'Close ▲') : (isFr ? 'Ouvrir ▼' : 'Open ▼')}
                        </span>
                      </button>

                      {expandedTutorIndex === idx && (
                        <div className="mt-2 animate-fade-in">
                          <GeminiPedagogicalTutor
                            questionPrompt={isFr ? q.promptFr : q.promptEn}
                            codeSnippet={q.codeSnippet}
                            chosenLetter={q.options.find((o) => o.id === userAns)?.letter || 'B'}
                            chosenText={isFr ? (q.options.find((o) => o.id === userAns)?.textFr || 'Choix sélectionné') : (q.options.find((o) => o.id === userAns)?.textEn || 'Selected option')}
                            correctLetter={q.options.find((o) => o.id === q.correctOptionId)?.letter || 'C'}
                            correctText={isFr ? (q.options.find((o) => o.id === q.correctOptionId)?.textFr || '') : (q.options.find((o) => o.id === q.correctOptionId)?.textEn || '')}
                            conceptName={isFr ? concept?.nameFr : concept?.nameEn}
                            explanation={isFr ? q.explanationFr : q.explanationEn}
                            lang={lang}
                            theme={theme}
                            autoLoadExplanation={true}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bouton retour résultat */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setPhase('results')}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-[#0284c7] text-white shadow-md transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isFr ? 'Retour à la synthèse des résultats' : 'Back to results summary'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMATION AVANT DE TERMINER L'EXAMEN */}
      {showConfirmFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`relative w-full max-w-md p-6 rounded-2xl border shadow-2xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-[#cbd5e1]' : 'bg-[#102034] border-[#1b2b3f]'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0284c7]/15 text-[#0284c7] flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f172a] dark:text-[#d3e4fe]">
                  {isFr ? 'Valider et terminer l\'examen ?' : 'Submit and finish exam?'}
                </h3>
                <p className="text-xs text-[#64748b]">
                  {isFr ? 'Votre score officiel sera calculé immédiatement.' : 'Your official score will be calculated immediately.'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8fafc] dark:bg-[#000f21] border border-[#e2e8f0] dark:border-[#1b2b3f] flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748b]">{isFr ? 'Questions répondues :' : 'Answered:'}</span>
                <span className="font-bold text-[#10b981]">{answeredCount} / {totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">{isFr ? 'Questions restantes :' : 'Unanswered:'}</span>
                <span className="font-bold text-[#ef4444]">{totalQuestions - answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">{isFr ? 'Questions marquées :' : 'Flagged:'}</span>
                <span className="font-bold text-[#f59e0b]">{flaggedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">{isFr ? 'Temps restant :' : 'Time left:'}</span>
                <span className="font-bold text-[#0284c7]">{formatTimer(secondsRemaining)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmFinishModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border bg-white dark:bg-[#000f21] border-[#cbd5e1] dark:border-[#1b2b3f] text-[#334155] dark:text-[#d3e4fe]"
              >
                {isFr ? 'Poursuivre l\'examen' : 'Keep testing'}
              </button>
              <button
                onClick={handleCompleteExam}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#10b981] hover:bg-[#059669] text-white shadow-md shadow-[#10b981]/20"
              >
                {isFr ? 'Oui, calculer mon résultat' : 'Yes, submit exam'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TUTEUR PÉDAGOGIQUE GEMINI */}
      {tutorModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8">
            <button
              onClick={() => setTutorModalData(null)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-[#ef4444] text-white flex items-center justify-center font-bold text-sm shadow-lg hover:bg-[#dc2626] transition-all"
            >
              ✕
            </button>
            <GeminiPedagogicalTutor
              questionPrompt={isFr ? tutorModalData.q.promptFr : tutorModalData.q.promptEn}
              codeSnippet={tutorModalData.q.codeSnippet}
              chosenLetter={tutorModalData.q.options.find((o) => o.id === tutorModalData.userAns)?.letter || 'B'}
              chosenText={isFr 
                ? (tutorModalData.q.options.find((o) => o.id === tutorModalData.userAns)?.textFr || 'Choix utilisateur') 
                : (tutorModalData.q.options.find((o) => o.id === tutorModalData.userAns)?.textEn || 'User option')}
              correctLetter={tutorModalData.q.options.find((o) => o.id === tutorModalData.q.correctOptionId)?.letter || 'C'}
              correctText={isFr 
                ? (tutorModalData.q.options.find((o) => o.id === tutorModalData.q.correctOptionId)?.textFr || '') 
                : (tutorModalData.q.options.find((o) => o.id === tutorModalData.q.correctOptionId)?.textEn || '')}
              conceptName={isFr 
                ? certificationConcepts[tutorModalData.q.conceptId]?.nameFr 
                : certificationConcepts[tutorModalData.q.conceptId]?.nameEn}
              explanation={isFr ? tutorModalData.q.explanationFr : tutorModalData.q.explanationEn}
              lang={lang}
              theme={theme}
              autoLoadExplanation={true}
            />
          </div>
        </div>
      )}

    </div>
  );
};
