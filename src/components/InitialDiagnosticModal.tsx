import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Copy,
  Check,
  Brain,
  ShieldCheck,
  Target,
  BarChart3,
  Clock,
  Layers,
  BookOpen,
  X,
  Play
} from 'lucide-react';
import { INITIAL_DIAGNOSTIC_QUESTIONS, DiagnosticQuestion } from '../data/initialDiagnosticData';
import {
  evaluateInitialDiagnostic,
  getSavedInitialDiagnostic,
  InitialDiagnosticResult,
  generateAsciiBar
} from '../services/initialDiagnosticService';

interface InitialDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'en';
  onStartTargetedSession?: (domainId?: string) => void;
  onNavigateToDashboard?: () => void;
}

export const InitialDiagnosticModal: React.FC<InitialDiagnosticModalProps> = ({
  isOpen,
  onClose,
  lang,
  onStartTargetedSession,
  onNavigateToDashboard,
}) => {
  const isFr = lang === 'fr';

  // Phases du modal : 'intro' | 'runner' | 'result'
  const [phase, setPhase] = useState<'intro' | 'runner' | 'result'>('intro');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [result, setResult] = useState<InitialDiagnosticResult | null>(() => getSavedInitialDiagnostic());
  const [copiedAscii, setCopiedAscii] = useState<boolean>(false);
  const [showReviewList, setShowReviewList] = useState<boolean>(false);

  // Chronomètre de session
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && phase === 'runner') {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, phase]);

  // Synchronisation si un résultat existait déjà
  useEffect(() => {
    if (isOpen) {
      const existing = getSavedInitialDiagnostic();
      if (existing) {
        setResult(existing);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ: DiagnosticQuestion = INITIAL_DIAGNOSTIC_QUESTIONS[currentIndex];
  const totalQuestions = INITIAL_DIAGNOSTIC_QUESTIONS.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleStartDiagnostic = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setElapsedSeconds(0);
    setShowReviewList(false);
    setPhase('runner');
  };

  const handleSelectOption = (optId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(optId);
  };

  const handleSubmitCurrentAnswer = () => {
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
      // Fin du questionnaire : Calcul et restitution du profil
      const updatedAnswers = {
        ...userAnswers,
        [currentQ.id]: selectedOption || '',
      };
      const finalResult = evaluateInitialDiagnostic(updatedAnswers, elapsedSeconds);
      setResult(finalResult);
      setPhase('result');
    }
  };

  const handleCopyAsciiProfile = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.rawAsciiProfile);
    setCopiedAscii(true);
    setTimeout(() => setCopiedAscii(false), 2000);
  };

  const getDomainColor = (domainId: string) => {
    switch (domainId) {
      case 'sql':
        return 'text-[#38bdf8] bg-[#0284c7]/15 border-[#38bdf8]/30';
      case 'modelisation':
        return 'text-[#a78bfa] bg-[#7c3aed]/15 border-[#a78bfa]/30';
      case 'transactions':
        return 'text-[#fbbf24] bg-[#b45309]/15 border-[#fbbf24]/30';
      case 'indexation':
        return 'text-[#f43f5e] bg-[#be123c]/15 border-[#f43f5e]/30';
      case 'administration':
      default:
        return 'text-[#4edea3] bg-[#003824]/60 border-[#4edea3]/30';
    }
  };

  return (
    <div
      id="initial-diagnostic-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        id="initial-diagnostic-modal"
        className="relative w-full max-w-4xl my-auto rounded-2xl bg-[#0b1c30] border border-[#26364a] text-[#d3e4fe] shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Glow décoratif */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#0284c7]/10 rounded-full blur-3xl pointer-events-none" />

        {/* TOP BAR : Branding, Phase & Close Button */}
        <div className="px-6 py-4 bg-[#071322] border-b border-[#1b2b3f] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shadow-lg shadow-[#0284c7]/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                  DBMASTOR
                </span>
                <span className="text-[#89929b] text-xs">•</span>
                <span className="font-mono text-[11px] text-[#4edea3] font-semibold">
                  {isFr ? 'Moteur Adaptatif IA' : 'Adaptive AI Engine'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {isFr ? 'Diagnostic Initial — 20 questions' : 'Initial Diagnostic — 20 Questions'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {phase === 'runner' && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#102034] border border-[#1b2b3f] font-mono text-xs text-[#93ccff]">
                <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>{formatTime(elapsedSeconds)}</span>
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
        {/* PHASE 1 : INTRODUCTION                                                    */}
        {/* ========================================================================= */}
        {phase === 'intro' && (
          <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#0284c7]/20 text-[#38bdf8] border border-[#38bdf8]/30 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                {isFr ? 'Calibrage Fondamental du Profil' : 'Fundamental Profile Calibration'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-sans text-white">
                {isFr
                  ? 'Évaluez vos compétences pour personnaliser vos séances'
                  : 'Assess your skills to personalize your training sessions'}
              </h3>
              <p className="text-sm text-[#bfc7d2] leading-relaxed max-w-2xl">
                {isFr
                  ? 'Ce diagnostic initial de 20 questions permet à l\'application d\'analyser précisément ce que vous maîtrisez et ce qui vous manque, afin que l\'IA puisse ensuite générer automatiquement vos séances d\'entraînement ciblées.'
                  : 'This 20-question initial assessment lets the system evaluate what you have mastered and identify your critical gaps, allowing the AI to generate personalized training sessions.'}
              </p>
            </div>

            {/* Grille des 10 thèmes couverts */}
            <div className="p-5 rounded-2xl bg-[#071322] border border-[#1b2b3f] flex flex-col gap-3">
              <span className="font-mono text-xs font-bold text-[#89ceff] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#38bdf8]" />
                {isFr ? 'Les 10 thématiques couvertes par le test :' : 'The 10 covered areas:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs font-mono">
                {[
                  { name: 'SQL', desc: 'Projections, JOINS, GROUP BY' },
                  { name: 'Modélisation', desc: 'Relations N:M, Schémas' },
                  { name: 'Normalisation', desc: '1NF, 2NF, 3NF & Boyce-Codd' },
                  { name: 'Transactions', desc: 'ACID, Isolation & Locks' },
                  { name: 'Index', desc: 'B-Tree, Leftmost Prefix' },
                  { name: 'Contraintes', desc: 'PK, FK, CASCADE, Check' },
                  { name: 'Sécurité', desc: 'DCL GRANT/REVOKE, Injection' },
                  { name: 'Administration', desc: 'Backup, PITR, Vacuum' },
                  { name: 'Performances', desc: 'EXPLAIN, Table Full Scan' },
                  { name: 'Concepts NoSQL', desc: 'Document, Théorème CAP' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-1"
                  >
                    <span className="font-bold text-[#d3e4fe] flex items-center gap-1">
                      <span className="text-[#38bdf8]">•</span> {item.name}
                    </span>
                    <span className="text-[10px] text-[#89929b] leading-tight">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Restitution attendue après le diagnostic */}
            <div className="p-4 rounded-xl bg-[#00172c] border border-[#0284c7]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8] shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-white">
                    {isFr ? 'Génération de votre profil personnalisé' : 'Personalized Profile Generation'}
                  </span>
                  <span className="text-xs text-[#93ccff]">
                    {isFr
                      ? 'Votre arbre « MON NIVEAU » sera immédiatement calibré avec vos vrais pourcentages.'
                      : 'Your "MY LEVEL" tree will be immediately calibrated with real percentage scores.'}
                  </span>
                </div>
              </div>

              {result && (
                <button
                  onClick={() => setPhase('result')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] text-xs font-mono font-bold border border-[#38bdf8]/30 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isFr ? 'Voir mon dernier profil →' : 'View last profile →'}
                </button>
              )}
            </div>

            {/* Actions CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#89929b] hover:text-[#d3e4fe] font-mono text-xs font-semibold transition-colors cursor-pointer"
              >
                {isFr ? 'Faire plus tard' : 'Take later'}
              </button>
              <button
                onClick={handleStartDiagnostic}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-bold text-sm shadow-lg shadow-[#0284c7]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {result
                    ? isFr
                      ? 'Refaire le Diagnostic (20 questions)'
                      : 'Retake Diagnostic (20 questions)'
                    : isFr
                    ? 'Démarrer le Diagnostic (20 questions)'
                    : 'Start Diagnostic (20 questions)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 2 : QUIZ RUNNER (20 QUESTIONS)                                      */}
        {/* ========================================================================= */}
        {phase === 'runner' && (
          <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-5">
            {/* Progression & Thème */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#38bdf8]">
                    Question {currentIndex + 1} / {totalQuestions}
                  </span>
                  <span className="text-[#89929b]">•</span>
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${getDomainColor(
                      currentQ.domainId
                    )}`}
                  >
                    [{currentQ.category.toUpperCase()}]
                  </span>
                </div>
                <span className="text-[#89929b]">{progressPercent}% complété</span>
              </div>

              {/* Barre de progression fluide */}
              <div className="w-full h-2 rounded-full bg-[#102034] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0284c7] to-[#38bdf8] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Énoncé de la question */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[#071322] border border-[#1b2b3f]">
              <h4 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                {isFr ? currentQ.titleFr : currentQ.titleEn}
              </h4>

              {currentQ.codeSnippet && (
                <div className="p-3.5 rounded-xl bg-[#000d1a] border border-[#1b2b3f] font-mono text-xs text-[#7dd3fc] overflow-x-auto whitespace-pre">
                  {currentQ.codeSnippet}
                </div>
              )}
            </div>

            {/* Options de réponse */}
            <div className="flex flex-col gap-2.5">
              {(isFr ? currentQ.optionsFr : currentQ.optionsEn).map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isCorrect = opt.id === currentQ.correctOptionId;

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
                    onClick={() => handleSelectOption(opt.id)}
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
                      {opt.id.toUpperCase()}
                    </div>
                    <span className="leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Explication pédagogique immédiate */}
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
                      {isFr ? 'RÉPONSE INCORRECTE — ANCRAGE PÉDAGOGIQUE :' : 'INCORRECT ANSWER — EXPLANATION:'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#d3e4fe] leading-relaxed">
                  {isFr ? currentQ.explanationFr : currentQ.explanationEn}
                </p>

                {currentQ.trapWarningFr && (
                  <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-[#fbbf24] font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#fbbf24]" />
                    <span>{currentQ.trapWarningFr}</span>
                  </div>
                )}
              </div>
            )}

            {/* Barre d'action basse */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1b2b3f]">
              <span className="text-xs font-mono text-[#89929b]">
                {isFr ? 'Prenez le temps d\'analyser chaque question' : 'Take your time on each item'}
              </span>

              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitCurrentAnswer}
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
                      ? 'Calculer & Découvrir Mon Profil →'
                      : 'Calculate & View My Profile →'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 3 : RÉSULTAT & RESTITUTION DU PROFIL (DEMANDE UTILISATEUR EXACTE)   */}
        {/* ========================================================================= */}
        {phase === 'result' && result && (
          <div className="p-6 sm:p-8 overflow-y-auto flex flex-col gap-6">
            {/* EN-TÊTE DU RÉSULTAT */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#00223d] to-[#0b1c30] border border-[#0284c7]/40 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#0284c7]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] shadow-inner">
                  <Target className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-mono text-[#38bdf8] uppercase tracking-wider font-bold">
                    {isFr ? 'DIAGNOSTIC TERMINÉ • PROFIL ÉTABLI' : 'DIAGNOSTIC COMPLETE • PROFILE READY'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-sans text-white">
                    {isFr ? 'Votre profil de compétences DBMastor' : 'Your DBMastor Skill Profile'}
                  </h3>
                  <span className="text-xs text-[#bfc7d2]">
                    {isFr
                      ? `20 questions analysées en ${formatTime(result.durationSeconds || 320)} • Score global : ${result.overallScore}%`
                      : `20 questions analyzed in ${formatTime(result.durationSeconds || 320)} • Overall score: ${result.overallScore}%`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleCopyAsciiProfile}
                  className="px-3 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] text-xs font-mono font-semibold flex items-center gap-1.5 border border-[#38bdf8]/30 transition-colors cursor-pointer"
                  title={isFr ? 'Copier le profil textuel' : 'Copy ASCII Profile'}
                >
                  {copiedAscii ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4edea3]" />
                      <span className="text-[#4edea3]">{isFr ? 'Copié !' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Copier le profil' : 'Copy Profile'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SECTION CENTRALE : RESTITUTION EXACTE DU PROFIL DEMANDÉ PAR L'UTILISATEUR */}
            <div className="p-6 rounded-2xl bg-[#000d1a] border border-[#1b2b3f] font-mono flex flex-col gap-4 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {isFr ? 'Votre profil' : 'Your Profile'}
                </span>
                <span className="text-xs text-[#4edea3] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
                  {isFr ? 'Synchronisé avec MON NIVEAU' : 'Synced with MY LEVEL'}
                </span>
              </div>

              {/* Lignes par domaine avec la barre ASCII exacte (████████░░) */}
              <div className="flex flex-col gap-3 py-1">
                {result.domainScores.map((domain) => {
                  const isMastered = domain.score >= 75;
                  const isCritical = domain.score < 50;

                  return (
                    <div
                      key={domain.domainId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-[#071322] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#d3e4fe] w-36 shrink-0">
                          {isFr ? domain.nameFr : domain.nameEn}
                        </span>
                        {/* Barre de blocs ASCII demandée par l'utilisateur */}
                        <span className="text-base tracking-widest text-[#38bdf8] select-all font-bold">
                          {domain.barAscii}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 justify-end">
                        <span
                          className={`text-sm font-bold w-14 text-right ${
                            isMastered
                              ? 'text-[#4edea3]'
                              : isCritical
                              ? 'text-[#f43f5e]'
                              : 'text-[#38bdf8]'
                          }`}
                        >
                          {domain.score} %
                        </span>

                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
                            isMastered
                              ? 'bg-[#003824]/80 text-[#4edea3] border-[#4edea3]/40'
                              : isCritical
                              ? 'bg-[#3d000a]/80 text-[#f43f5e] border-[#f43f5e]/50'
                              : 'bg-[#002c47]/80 text-[#38bdf8] border-[#38bdf8]/40'
                          }`}
                        >
                          {isMastered
                            ? isFr
                              ? 'Maîtrisé'
                              : 'Mastered'
                            : isCritical
                            ? isFr
                              ? 'Lacune critique'
                              : 'Critical Gap'
                            : isFr
                            ? 'Solide / En cours'
                            : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message de confirmation : Votre parcours est maintenant personnalisé */}
              <div className="pt-3 border-t border-[#1b2b3f] flex items-center gap-2 text-xs text-[#4edea3] font-bold">
                <Sparkles className="w-4 h-4 text-[#4edea3]" />
                <span>
                  {isFr
                    ? 'Votre parcours est maintenant personnalisé.'
                    : 'Your learning path is now fully personalized.'}
                </span>
              </div>
            </div>

            {/* CE QUE L'IA DÉDUIT DE VOTRE PROFIL & SÉANCES ADAPTATIVES */}
            <div className="p-5 rounded-2xl bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-3">
              <span className="font-mono text-xs font-bold text-[#38bdf8] uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#38bdf8]" />
                {isFr ? 'Plan d\'action généré par l\'IA pour vos futures séances :' : 'AI Adaptive Action Plan for Future Sessions:'}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {(isFr ? result.recommendationsFr : result.recommendationsEn).slice(0, 4).map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#071322] border border-[#1b2b3f] flex items-start gap-2.5">
                    <span className="text-[#38bdf8] font-bold mt-0.5">•</span>
                    <p className="text-[#bfc7d2] leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* VOLET DE DÉTAIL DES 20 RÉPONSES (OPTIONNEL) */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowReviewList((prev) => !prev)}
                className="text-xs font-mono text-[#89ceff] hover:underline flex items-center gap-1.5 self-start cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>
                  {showReviewList
                    ? isFr
                      ? 'Masquer le corrigé détaillé des 20 questions'
                      : 'Hide detailed answers'
                    : isFr
                    ? 'Consulter le corrigé et les pièges des 20 questions'
                    : 'Review detailed answers for all 20 questions'}
                </span>
              </button>

              {showReviewList && (
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#071322] border border-[#1b2b3f] max-h-72 overflow-y-auto">
                  {INITIAL_DIAGNOSTIC_QUESTIONS.map((q) => {
                    const chosen = result.userAnswers[q.id];
                    const isRight = chosen === q.correctOptionId;
                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-lg border text-xs flex flex-col gap-1 ${
                          isRight
                            ? 'bg-[#002819]/40 border-[#4edea3]/30'
                            : 'bg-[#2a0810]/40 border-[#f43f5e]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#d3e4fe]">
                            Q{q.number}. {isFr ? q.titleFr : q.titleEn}
                          </span>
                          <span className={isRight ? 'text-[#4edea3] font-bold' : 'text-[#f43f5e] font-bold'}>
                            {isRight ? (isFr ? 'Exact' : 'Correct') : (isFr ? 'Faux' : 'Wrong')}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#89929b] leading-tight">
                          {isFr ? q.explanationFr : q.explanationEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* BOUTONS D'ACTION FINALE */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1b2b3f]">
              <button
                onClick={handleStartDiagnostic}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#89929b] hover:text-white font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isFr ? 'Refaire le Diagnostic' : 'Retake Diagnostic'}</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToDashboard) {
                      onNavigateToDashboard();
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe] font-bold text-xs flex items-center justify-center gap-2 border border-[#26364a] transition-colors cursor-pointer"
                >
                  <span>{isFr ? 'Voir MON NIVEAU sur le Dashboard' : 'View MY LEVEL on Dashboard'}</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onStartTargetedSession) {
                      onStartTargetedSession(result.weakestDomainId);
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-bold text-xs shadow-lg shadow-[#0284c7]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#fbbf24] fill-[#fbbf24]" />
                  <span>
                    {isFr
                      ? `Lancer 1ère séance IA ciblée sur mes lacunes →`
                      : `Start 1st AI session on weak spots →`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
