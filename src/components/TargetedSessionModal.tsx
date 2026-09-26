import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Timer,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BarChart3,
  TrendingUp,
  Brain,
  ShieldCheck,
  Copy,
  Check,
  AlertTriangle,
  Layers,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { TargetedSessionPayload, TargetedSessionQuestion } from '../types';
import { fetchTargetedSession } from '../services/geminiTutorService';
import { 
  getStoredCompetencies, 
  recalculateCompetenciesAfterSession,
  CompetencyRecalculationResult,
  UserCompetency,
  resetCompetenciesToDefault
} from '../services/competencyService';
import { recordTrapAttempt, getRecurringTraps } from '../services/trapService';
import { recordQuestionAttemptTelemetry } from '../services/statsService';
import { GeminiPedagogicalTutor } from './GeminiPedagogicalTutor';
import { ProgressiveExplainPanel } from './ProgressiveExplainPanel';

interface TargetedSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  onNavigateToTab?: (tab: string) => void;
  autoStart?: boolean;
}

export const TargetedSessionModal: React.FC<TargetedSessionModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme = 'dark',
  onNavigateToTab,
  autoStart = false,
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  // Phases: 'preview' (Mes faiblesses) -> 'generating' -> 'session_ready' -> 'active_quiz' -> 'recalculated_results'
  const [phase, setPhase] = useState<'preview' | 'generating' | 'session_ready' | 'active_quiz' | 'recalculated_results'>('preview');

  // Compétences utilisateur
  const [competencies, setCompetencies] = useState<UserCompetency[]>(() => getStoredCompetencies());

  // Données de la séance générée
  const [sessionData, setSessionData] = useState<TargetedSessionPayload | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Chronomètre de 15 minutes (900 secondes)
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [questionStartMs, setQuestionStartMs] = useState<number>(() => Date.now());

  useEffect(() => {
    setQuestionStartMs(Date.now());
  }, [currentQuestionIndex, phase]);

  // Résultat du recalcul DBMastor
  const [recalcResult, setRecalcResult] = useState<CompetencyRecalculationResult | null>(null);

  // Recharger les compétences à l'ouverture
  useEffect(() => {
    if (isOpen) {
      const current = getStoredCompetencies();
      setCompetencies(current);
      if (autoStart) {
        handleGenerateSession();
      } else {
        setPhase('preview');
      }
    }
  }, [isOpen, autoStart]);

  // Écouter les événements de mise à jour des compétences
  useEffect(() => {
    const handleUpdate = () => {
      setCompetencies(getStoredCompetencies());
    };
    window.addEventListener('dbmastery:competencies_updated', handleUpdate);
    return () => window.removeEventListener('dbmastery:competencies_updated', handleUpdate);
  }, []);

  // Timer de la séance
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (phase === 'active_quiz' && isTimerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase, isTimerActive, secondsRemaining]);

  if (!isOpen) return null;

  // Filtrer les 3 faiblesses clés pour l'aperçu (JOIN, Subqueries, Indexes en priorité)
  const keyWeaknesses = [
    competencies.find((c) => c.id === 'join') || { id: 'join', name: 'JOIN', currentScore: 54, accentColor: '#38bdf8' },
    competencies.find((c) => c.id === 'subqueries') || { id: 'subqueries', name: 'Subqueries', currentScore: 47, accentColor: '#f43f5e' },
    competencies.find((c) => c.id === 'indexes') || { id: 'indexes', name: 'Indexes', currentScore: 61, accentColor: '#fbbf24' },
  ];

  // 1. Déclencher la génération de la séance ciblée avec Gemini
  const handleGenerateSession = async () => {
    setPhase('generating');
    try {
      const data = await fetchTargetedSession({
        topics: [
          { id: 'join', name: 'JOIN', count: 5, currentScore: keyWeaknesses[0].currentScore },
          { id: 'subqueries', name: 'Subqueries', count: 3, currentScore: keyWeaknesses[1].currentScore },
          { id: 'indexes', name: 'Indexes', count: 2, currentScore: keyWeaknesses[2].currentScore },
        ],
        totalQuestions: 10,
        difficulty: 'progressive',
        lang,
      });
      setSessionData(data);
      setPhase('session_ready');
    } catch (err) {
      console.error(err);
      // En cas d'erreur inattendue
      setPhase('session_ready');
    }
  };

  // 2. Commencer la séance
  const handleStartSession = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSecondsRemaining(15 * 60);
    setIsTimerActive(true);
    setPhase('active_quiz');
  };

  // 3. Répondre à une question
  const handleSelectOption = (optId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optId,
    });

    if (currentQ) {
      const isCorrect = optId === currentQ.correctOptionId;
      const elapsedSecs = Math.max(3, Math.round((Date.now() - questionStartMs) / 1000));
      const chosenOpt = currentQ.options.find((o) => o.id === optId);

      recordQuestionAttemptTelemetry({
        questionId: currentQ.id,
        answer: chosenOpt ? `Option ${chosenOpt.letter}` : optId,
        isCorrect,
        timeSpent: elapsedSecs,
        difficulty: currentQ.trapMetadata?.difficulty || (currentQ.difficulty === 'hard' ? 4 : currentQ.difficulty === 'intermediate' ? 3 : 2),
        topic: currentQ.trapMetadata?.subtopic || currentQ.topicName || 'JOIN',
        hintRequested: !isCorrect,
      });

      if (currentQ.trapMetadata) {
        recordTrapAttempt(currentQ.trapMetadata, isCorrect);
      }
    }
  };

  // 4. Copier le code SQL
  const handleCopyCode = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // 5. Terminer la séance et recalculer les compétences
  const handleFinishSession = () => {
    setIsTimerActive(false);
    if (!sessionData) return;

    // Calcul des résultats par thématique (JOIN, Subqueries, Indexes)
    const breakdownResults: Record<string, { correct: number; total: number }> = {
      join: { correct: 0, total: 0 },
      subqueries: { correct: 0, total: 0 },
      indexes: { correct: 0, total: 0 },
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

    const sessionResultsArray = Object.entries(breakdownResults).map(([topicId, val]) => ({
      topicId,
      correct: val.correct,
      total: val.total,
    }));

    // RECALCUL DÉFINITIF DES COMPÉTENCES PAR DBMASTOR
    const result = recalculateCompetenciesAfterSession(sessionResultsArray);
    setRecalcResult(result);
    setCompetencies(result.updatedCompetencies);
    setPhase('recalculated_results');
  };

  // Formatage du chronomètre (MM:SS)
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ: TargetedSessionQuestion | undefined = sessionData?.questions[currentQuestionIndex];
  const userSelectedOptionId = selectedAnswers[currentQuestionIndex];
  const isQuestionAnswered = !!userSelectedOptionId;
  const isUserCorrect = currentQ && userSelectedOptionId === currentQ.correctOptionId;

  // Calcul du score global de la séance
  const totalCorrect = sessionData?.questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctOptionId ? 1 : 0);
  }, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className={`relative w-full max-w-4xl my-auto rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-all ${
          isLight ? 'bg-white border-[#cbd5e1] text-[#0f172a]' : 'bg-[#0b1c30] border-[#1b2b3f] text-[#d3e4fe]'
        }`}
      >
        {/* TOP BAR / HEADER */}
        <div className={`px-5 py-4 flex items-center justify-between border-b ${
          isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#000f21] border-[#102034]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] text-white flex items-center justify-center shadow-md shadow-[#0284c7]/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">
                  {isFr ? 'Génération Automatique d\'Exercices Ciblés' : 'Automatic Targeted Exercise Generation'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0284c7]/15 text-[#0284c7] border border-[#0284c7]/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#0284c7]" />
                  <span>Gemini 3.8 Flash</span>
                </span>
              </div>
              <p className="text-[11px] text-[#64748b]">
                {isFr ? 'Séance adaptative progressive basée sur vos compétences calculées' : 'Adaptive progressive drill targeting your exact weaknesses'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#ef4444] transition-all font-bold"
            title={isFr ? 'Fermer' : 'Close'}
          >
            ✕
          </button>
        </div>

        {/* CONTENU PRINCIPAL PAR PHASE */}
        <div className="p-6">
          {/* ======================================================== */}
          {/* PHASE 1 : APERÇU « MES FAIBLESSES » ET BOUTON D'ACTION   */}
          {/* ======================================================== */}
          {phase === 'preview' && (
            <div className="flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto py-4">
              <div className="text-center flex flex-col items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isFr ? 'Diagnostic Cognitif DBMastor' : 'DBMastor Cognitive Diagnostic'}
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  {isFr ? 'Mes faiblesses' : 'My Weaknesses'}
                </h2>
                <p className="text-xs text-[#64748b] max-w-md">
                  {isFr 
                    ? 'Voici les trois concepts où votre taux de réussite nécessite une consolidation prioritaire avant l\'examen de certification.' 
                    : 'Here are the three concepts where your accuracy requires priority reinforcement before certification.'}
                </p>
              </div>

              {/* LISTE EXACTE DU PROMPT UTILISATEUR :
                  JOIN             54 %
                  Subqueries       47 %
                  Indexes          61 %
              */}
              <div className="p-5 rounded-2xl border shadow-sm flex flex-col gap-4 font-mono text-sm bg-gradient-to-b from-[#0284c7]/5 to-transparent border-[#0284c7]/20">
                {keyWeaknesses.map((item) => {
                  const score = item.currentScore;
                  let barColor = '#ef4444'; // rouge
                  if (score >= 60) barColor = '#f59e0b'; // orange
                  if (score >= 70) barColor = '#10b981'; // vert

                  return (
                    <div key={item.id} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                        <span className="tracking-wide text-base">{item.name}</span>
                        <span className="font-extrabold text-base" style={{ color: barColor }}>
                          {score} %
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#e2e8f0] dark:bg-[#000f21] overflow-hidden p-0.5 border border-[#cbd5e1] dark:border-[#1b2b3f]">
                        <div 
                          className="h-full rounded-full transition-all duration-700" 
                          style={{ 
                            width: `${score}%`, 
                            backgroundColor: barColor 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#64748b]">
                        <span>{score < 50 ? (isFr ? 'Critique' : 'Critical') : score < 65 ? (isFr ? 'À consolider' : 'Consolidate') : (isFr ? 'Acceptable' : 'Acceptable')}</span>
                        <span>{isFr ? 'Objectif certification : 70%' : 'Target passing: 70%'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BOUTON D'ACTION PRINCIPAL : [Créer une séance personnalisée] */}
              <div className="flex flex-col gap-3 items-center pt-2">
                <button
                  id="create-targeted-session-btn"
                  onClick={handleGenerateSession}
                  className="w-full py-4 px-6 rounded-xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0284c7] hover:from-[#0369a1] hover:to-[#0284c7] text-white shadow-lg shadow-[#0284c7]/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5"
                >
                  <Sparkles className="w-5 h-5 text-[#38bdf8] animate-pulse" />
                  <span>{isFr ? 'Créer une séance personnalisée' : 'Create Personalized Session'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="flex items-center justify-between w-full px-2 text-[11px] text-[#64748b]">
                  <span>{isFr ? 'Génération IA ultra-ciblée' : 'Targeted AI drill generation'}</span>
                  <button 
                    onClick={() => {
                      resetCompetenciesToDefault();
                      setCompetencies(getStoredCompetencies());
                    }}
                    className="hover:underline flex items-center gap-1 text-[#0284c7]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isFr ? 'Réinitialiser faiblesses 54% / 47% / 61%' : 'Reset to default 54% / 47% / 61%'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PHASE 2 : GÉNÉRATION EN COURS VIA GEMINI                 */}
          {/* ======================================================== */}
          {phase === 'generating' && (
            <div className="py-16 flex flex-col items-center justify-center gap-5 text-center animate-fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#0284c7] animate-spin">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#38bdf8] animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-[#d3e4fe]">
                  {isFr ? 'L\'IA analyse vos 3 points faibles...' : 'AI is analyzing your 3 weaknesses...'}
                </h3>
                <p className="text-xs text-[#64748b] max-w-sm">
                  {isFr 
                    ? 'Gemini calibre 10 questions à difficulté progressive : 5 × JOIN, 3 × Subqueries, 2 × Indexes.' 
                    : 'Gemini calibrating 10 progressive questions: 5 × JOIN, 3 × Subqueries, 2 × Indexes.'}
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PHASE 3 : SÉANCE PRÊTE (RÉSUMÉ CONFORME AU PROMPT)        */}
          {/* ======================================================== */}
          {phase === 'session_ready' && (
            <div className="flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto py-2">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0284c7]/10 via-[#38bdf8]/5 to-transparent border border-[#0284c7]/30 shadow-md flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-[#0284c7]/20 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-[#0284c7] text-white">
                      <Zap className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[10px] font-mono text-[#0284c7] uppercase font-bold tracking-wider">
                        {isFr ? 'Programme d\'entraînement généré' : 'Generated Training Program'}
                      </span>
                      <h3 className="text-xl font-extrabold text-[#0f172a] dark:text-white">
                        {isFr ? 'Séance personnalisée' : 'Personalized Session'}
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#10b981]/15 text-[#10b981] font-mono text-xs font-bold border border-[#10b981]/30">
                    10 questions
                  </span>
                </div>

                {/* DISTRIBUTION DEMANDÉE :
                    10 questions
                    5 × JOIN
                    3 × Subqueries
                    2 × Indexes
                */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#000f21] border border-[#cbd5e1] dark:border-[#1b2b3f] flex flex-col gap-1">
                    <span className="font-mono text-xs text-[#0284c7] font-bold">5 × JOIN</span>
                    <span className="text-xs font-semibold text-[#0f172a] dark:text-[#d3e4fe]">
                      {isFr ? 'Jointures relationnelles' : 'Relational Joins'}
                    </span>
                    <span className="text-[10px] text-[#64748b]">Score actuel: 54%</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#000f21] border border-[#cbd5e1] dark:border-[#1b2b3f] flex flex-col gap-1">
                    <span className="font-mono text-xs text-[#f43f5e] font-bold">3 × Subqueries</span>
                    <span className="text-xs font-semibold text-[#0f172a] dark:text-[#d3e4fe]">
                      {isFr ? 'Sous-requêtes & NOT IN' : 'Subqueries & NOT IN'}
                    </span>
                    <span className="text-[10px] text-[#64748b]">Score actuel: 47%</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#000f21] border border-[#cbd5e1] dark:border-[#1b2b3f] flex flex-col gap-1">
                    <span className="font-mono text-xs text-[#fbbf24] font-bold">2 × Indexes</span>
                    <span className="text-xs font-semibold text-[#0f172a] dark:text-[#d3e4fe]">
                      {isFr ? 'Colonne de tête & FBI' : 'Leading Column & FBI'}
                    </span>
                    <span className="text-[10px] text-[#64748b]">Score actuel: 61%</span>
                  </div>
                </div>

                {/* PROPRIÉTÉS CLÉS : Difficulté progressive • Durée estimée 15 min */}
                <div className="p-4 rounded-xl bg-white/60 dark:bg-[#000f21]/60 border border-[#cbd5e1] dark:border-[#1b2b3f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#0284c7]" />
                    <span className="text-[#64748b]">{isFr ? 'Difficulté :' : 'Difficulty:'}</span>
                    <span className="font-bold text-[#0284c7]">{isFr ? 'Progressive (Niveau 1 ➔ Niveau 3)' : 'Progressive (Level 1 ➔ Level 3)'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-[#10b981]" />
                    <span className="text-[#64748b]">{isFr ? 'Durée estimée :' : 'Estimated time:'}</span>
                    <span className="font-bold text-[#10b981]">15 min</span>
                  </div>
                </div>

                {/* Bouton de lancement */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    id="start-targeted-quiz-btn"
                    onClick={handleStartSession}
                    className="flex-1 w-full py-3.5 px-6 rounded-xl font-extrabold text-sm bg-[#10b981] hover:bg-[#059669] text-white shadow-lg shadow-[#10b981]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <span>{isFr ? 'Démarrer la séance (15 min)' : 'Start Session (15 min)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPhase('preview')}
                    className="w-full sm:w-auto py-3.5 px-4 rounded-xl font-semibold text-xs border border-[#cbd5e1] dark:border-[#1b2b3f] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[#64748b]"
                  >
                    {isFr ? 'Retour aux faiblesses' : 'Back to weaknesses'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PHASE 4 : SÉANCE ACTIVE (10 QUESTIONS EN COURS)          */}
          {/* ======================================================== */}
          {phase === 'active_quiz' && currentQ && (
            <div className="flex flex-col gap-5 animate-fade-in">
              {/* Entête du quiz : Progression + Chrono 15 min */}
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0] dark:border-[#1b2b3f]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0284c7]/15 text-[#0284c7]">
                    Question {currentQuestionIndex + 1} / {sessionData?.totalQuestions || 10}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg font-mono text-xs font-bold uppercase" style={{
                    backgroundColor: currentQ.topicId === 'join' ? '#38bdf820' : currentQ.topicId === 'subqueries' ? '#f43f5e20' : '#fbbf2420',
                    color: currentQ.topicId === 'join' ? '#0284c7' : currentQ.topicId === 'subqueries' ? '#f43f5e' : '#d97706',
                  }}>
                    {currentQ.topicName}
                  </span>
                  <span className="hidden sm:inline-block text-[11px] font-mono text-[#64748b]">
                    {currentQ.difficultyLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-[#000f21] border border-[#cbd5e1] dark:border-[#1b2b3f] font-mono text-xs font-bold">
                  <Timer className="w-4 h-4 text-[#10b981]" />
                  <span className={secondsRemaining < 180 ? 'text-[#ef4444] animate-pulse' : 'text-[#10b981]'}>
                    {formatTimer(secondsRemaining)}
                  </span>
                </div>
              </div>

              {/* Barre de progression 10Q */}
              <div className="w-full bg-[#e2e8f0] dark:bg-[#000f21] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#0284c7] h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / (sessionData?.totalQuestions || 10)) * 100}%` }}
                />
              </div>

              {/* Métadonnées du Piège de Certification */}
              {currentQ.trapMetadata && (
                <div className="p-3 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-[#f59e0b]/20 text-[#f59e0b]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-extrabold text-[#fef08a]">
                      🎯 {isFr ? 'Piège :' : 'Trap:'} {currentQ.trapMetadata.trap}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#89929b]">
                    <span className="text-[#38bdf8] font-bold">⏱ {currentQ.trapMetadata.estimatedTime}s</span>
                    <span>•</span>
                    <span className="text-[#fbbf24] font-bold">Diff. {currentQ.trapMetadata.difficulty}/5</span>
                    <span>•</span>
                    <span className="text-[#c084fc]">
                      Concepts : [{currentQ.trapMetadata.concepts?.join(', ')}]
                    </span>
                  </div>
                </div>
              )}

              {/* Énoncé de la question */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#000f21] border border-[#cbd5e1] dark:border-[#1b2b3f]">
                <p className="text-sm font-semibold leading-relaxed">
                  {currentQ.prompt}
                </p>
              </div>

              {/* Extrait de code SQL */}
              {currentQ.codeSnippet && (
                <div className="rounded-xl overflow-hidden border border-[#cbd5e1] dark:border-[#1b2b3f] bg-[#000f21]">
                  <div className="px-4 py-2 bg-[#051329] border-b border-[#102034] flex items-center justify-between text-[11px] font-mono text-[#89ceff]">
                    <span>SQL Query</span>
                    <button
                      onClick={() => handleCopyCode(currentQ.codeSnippet)}
                      className="hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? (isFr ? 'Copié' : 'Copied') : (isFr ? 'Copier' : 'Copy')}</span>
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-[#93ccff] overflow-x-auto leading-relaxed">
                    {currentQ.codeSnippet}
                  </pre>
                </div>
              )}

              {/* 4 Options de réponse A, B, C, D */}
              <div className="flex flex-col gap-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = userSelectedOptionId === opt.id;
                  const isCorrect = opt.id === currentQ.correctOptionId;

                  let optClass = 'border-[#cbd5e1] dark:border-[#1b2b3f] bg-white dark:bg-[#000f21] hover:border-[#0284c7]';
                  if (isSelected) {
                    if (instantFeedback) {
                      optClass = isCorrect 
                        ? 'border-[#10b981] bg-[#10b981]/15 text-[#059669] dark:text-[#4edea3] ring-1 ring-[#10b981]' 
                        : 'border-[#ef4444] bg-[#ef4444]/15 text-[#ef4444] ring-1 ring-[#ef4444]';
                    } else {
                      optClass = 'border-[#0284c7] bg-[#0284c7]/15 text-[#0284c7] ring-1 ring-[#0284c7]';
                    }
                  } else if (instantFeedback && isQuestionAnswered && isCorrect) {
                    optClass = 'border-[#10b981]/60 bg-[#10b981]/10 text-[#10b981]';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-start gap-3 ${optClass}`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected 
                          ? instantFeedback && !isCorrect 
                            ? 'bg-[#ef4444] text-white' 
                            : 'bg-[#0284c7] text-white'
                          : 'border border-[#cbd5e1] dark:border-[#1b2b3f] text-[#64748b]'
                      }`}>
                        {opt.letter}
                      </div>
                      <div className="flex-1 leading-snug">
                        {opt.text}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* FONCTIONNALITÉ « EXPLIQUE-MOI » : [Réponse] [Indice] [Expliquer] [Voir la solution] */}
              <ProgressiveExplainPanel
                questionId={currentQ.id}
                topic={currentQ.trapMetadata?.topic || 'SQL'}
                subtopic={currentQ.trapMetadata?.subtopic || currentQ.topicName}
                trapName={currentQ.trapMetadata?.trap}
                promptText={currentQ.prompt}
                codeSnippet={currentQ.codeSnippet}
                explanationText={currentQ.explanation}
                correctOptionLetter={currentQ.options.find(o => o.id === currentQ.correctOptionId)?.letter}
                correctOptionText={currentQ.options.find(o => o.id === currentQ.correctOptionId)?.text}
                hasSelectedAnswer={isQuestionAnswered}
                lang={lang}
                theme={theme}
              />

              {/* RETOUR PÉDAGOGIQUE IMMÉDIAT & TUTEUR GEMINI EN CAS D'ERREUR */}
              {instantFeedback && isQuestionAnswered && (
                <div className="mt-2 animate-fade-in">
                  {isUserCorrect ? (
                    <div className="p-3.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex flex-col gap-1.5 text-xs text-[#059669] dark:text-[#4edea3]">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        <span>{isFr ? 'Excellente réponse !' : 'Excellent answer!'}</span>
                      </div>
                      <p className="text-xs text-[#0f172a] dark:text-[#d3e4fe] leading-relaxed">
                        {currentQ.explanation}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[#78350f]/30 to-[#f59e0b]/15 border-2 border-[#f59e0b] flex flex-col gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-[#fef08a]">
                            <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                            <span>
                              {isFr ? '⚠️ Alerte Piège de Certification :' : '⚠️ Certification Trap Triggered:'}
                            </span>
                          </div>
                          {currentQ.trapMetadata && (
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#f59e0b]/25 text-[#fef08a] font-bold">
                              {currentQ.trapMetadata.trap}
                            </span>
                          )}
                        </div>

                        {currentQ.trapMetadata?.warningMsgFr && (
                          <p className="text-xs font-black text-[#fef08a] leading-snug">
                            {isFr ? currentQ.trapMetadata.warningMsgFr : currentQ.trapMetadata.warningMsgEn}
                          </p>
                        )}

                        <p className="text-xs text-[#d3e4fe] leading-relaxed">
                          {currentQ.explanation}
                        </p>
                      </div>

                      {/* Tuteur Gemini intégré */}
                      <GeminiPedagogicalTutor
                        questionPrompt={currentQ.prompt}
                        codeSnippet={currentQ.codeSnippet}
                        chosenLetter={currentQ.options.find((o) => o.id === userSelectedOptionId)?.letter || 'B'}
                        chosenText={currentQ.options.find((o) => o.id === userSelectedOptionId)?.text || ''}
                        correctLetter={currentQ.options.find((o) => o.id === currentQ.correctOptionId)?.letter || 'C'}
                        correctText={currentQ.options.find((o) => o.id === currentQ.correctOptionId)?.text || ''}
                        conceptName={currentQ.topicName}
                        explanation={currentQ.explanation}
                        lang={lang}
                        theme={theme}
                        autoLoadExplanation={true}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Navigation du quiz */}
              <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0] dark:border-[#1b2b3f]">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-[#cbd5e1] dark:border-[#1b2b3f] text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Précédent' : 'Previous'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < (sessionData?.totalQuestions || 10) - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center gap-1.5 shadow-md shadow-[#0284c7]/20 transition-all"
                    >
                      <span>{isFr ? 'Question suivante' : 'Next Question'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      id="finish-targeted-session-btn"
                      onClick={handleFinishSession}
                      className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-[#10b981] hover:bg-[#059669] text-white flex items-center gap-1.5 shadow-md shadow-[#10b981]/25 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isFr ? 'Terminer et recalculer mes compétences' : 'Finish & Recalculate Skills'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PHASE 5 : DBMASTOR RECALCULE LES COMPÉTENCES (RÉSULTAT)  */}
          {/* ======================================================== */}
          {phase === 'recalculated_results' && recalcResult && (
            <div className="flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto py-2">
              <div className="text-center flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center justify-center shadow-lg shadow-[#10b981]/20">
                  <Award className="w-8 h-8" />
                </div>
                <span className="font-mono text-xs text-[#10b981] font-bold uppercase tracking-wider">
                  {isFr ? 'Séance personnalisée validée' : 'Personalized Session Completed'}
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  {isFr ? 'DBMastor a recalculé vos compétences' : 'DBMastor recalculated your skills'}
                </h2>
                <p className="text-xs text-[#64748b]">
                  {isFr 
                    ? `Score obtenu : ${totalCorrect} / 10 (${Math.round((totalCorrect / 10) * 100)}%). Vos taux de maîtrise ont été mis à jour.` 
                    : `Session score: ${totalCorrect} / 10 (${Math.round((totalCorrect / 10) * 100)}%). Competencies recalculated.`}
                </p>
              </div>

              {/* TABLEAU DES 3 COMPÉTENCES AVEC LEURS NOUVELLES VALEURS ET DELTAS */}
              <div className="p-5 rounded-2xl border shadow-sm flex flex-col gap-4 font-mono text-sm bg-gradient-to-b from-[#10b981]/10 via-[#0284c7]/5 to-transparent border-[#10b981]/30">
                <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider pb-1 border-b border-[#cbd5e1] dark:border-[#1b2b3f] flex justify-between">
                  <span>{isFr ? 'Compétence ciblée' : 'Targeted Skill'}</span>
                  <span>{isFr ? 'Ancien ➔ Nouveau score' : 'Previous ➔ New Score'}</span>
                </div>

                {['join', 'subqueries', 'indexes'].map((topicId) => {
                  const delta = recalcResult.deltas[topicId];
                  if (!delta) return null;

                  const isPositive = delta.diff >= 0;

                  return (
                    <div key={topicId} className="flex flex-col gap-1.5 p-3 rounded-xl bg-white dark:bg-[#000f21] border border-[#cbd5e1] dark:border-[#1b2b3f]">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                        <span className="tracking-wide text-base">{delta.topicName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#64748b] line-through text-xs">{delta.oldScore} %</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#0284c7]" />
                          <span className="font-extrabold text-base text-[#10b981]">{delta.newScore} %</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                            {isPositive ? `+${delta.diff}%` : `${delta.diff}%`}
                          </span>
                        </div>
                      </div>

                      {/* Barre animée */}
                      <div className="w-full h-3 rounded-full bg-[#e2e8f0] dark:bg-[#0b1c30] overflow-hidden p-0.5 border border-[#cbd5e1] dark:border-[#1b2b3f]">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 bg-[#10b981]" 
                          style={{ width: `${delta.newScore}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-[#64748b]">
                        <span>{delta.correct} / {delta.total} {isFr ? 'bonnes réponses' : 'correct'}</span>
                        <span className="text-[#10b981] font-semibold">{isFr ? 'Statut consolidé' : 'Consolidated status'}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Score global DBMastor */}
                <div className="pt-2 border-t border-[#cbd5e1] dark:border-[#1b2b3f] flex items-center justify-between text-xs font-bold">
                  <span className="text-[#64748b]">{isFr ? 'Indicateur Global de Préparation :' : 'Overall Readiness Index:'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base text-[#0284c7]">{recalcResult.overallReadiness.newReadiness}%</span>
                    <span className="text-xs text-[#10b981]">
                      (+{recalcResult.overallReadiness.diff}%)
                    </span>
                  </div>
                </div>

                {/* STATUT DU DÉTECTEUR DE PIÈGES */}
                <div className="mt-2 p-3.5 rounded-xl bg-gradient-to-r from-[#78350f]/20 to-[#f59e0b]/10 border border-[#f59e0b]/40 flex flex-col gap-2 font-sans">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                      <span className="text-xs font-bold text-[#fef08a]">
                        {isFr ? 'Diagnostic Cognitif des Pièges (DBMastor)' : 'Cognitive Trap Diagnosis (DBMastor)'}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#fbbf24] px-2 py-0.5 rounded bg-[#f59e0b]/20 font-bold">
                      {isFr ? 'Surveillance Active' : 'Active Tracking'}
                    </span>
                  </div>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed">
                    {isFr 
                      ? 'Les métadonnées de chaque question ont permis de qualifier précisément vos pièges récurrents (ex: LEFT vs INNER JOIN). Les alertes du tableau de bord sont synchronisées.'
                      : 'Question metadata categorized your recurring traps (e.g. LEFT vs INNER JOIN). Dashboard alerts are synchronized.'}
                  </p>
                </div>
              </div>

              {/* BOUTONS D'ACTION APRÈS RECALCUL */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (onNavigateToTab) onNavigateToTab('skills');
                    onClose();
                  }}
                  className="flex-1 w-full py-3.5 px-6 rounded-xl font-extrabold text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-[#0284c7]/20 transition-all flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>{isFr ? 'Voir ma Skill Map mise à jour' : 'View updated Skill Map'}</span>
                </button>

                <button
                  onClick={() => {
                    handleGenerateSession();
                  }}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-bold text-xs border border-[#cbd5e1] dark:border-[#1b2b3f] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[#0f172a] dark:text-[#d3e4fe] flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Refaire une séance' : 'Run another session'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto py-3.5 px-4 rounded-xl font-semibold text-xs border border-[#cbd5e1] dark:border-[#1b2b3f] text-[#64748b]"
                >
                  {isFr ? 'Fermer' : 'Close'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
