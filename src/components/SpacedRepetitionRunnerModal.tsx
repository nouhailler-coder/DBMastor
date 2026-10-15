import React, { useState, useEffect } from 'react';
import {
  Brain,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  TrendingUp,
  Award,
  Layers,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Info,
  ExternalLink
} from 'lucide-react';
import {
  SpacedRepetitionItem,
  SpacedReviewRating,
  CertificationTrackId
} from '../types';
import {
  getDueSpacedItems,
  recordSpacedReview,
  calculateNextSpacedState,
  formatNextReviewDelay,
  getSimulatedNow
} from '../services/spacedRepetitionService';

interface SpacedRepetitionRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'en';
  selectedCert: CertificationTrackId;
  targetItemId?: string; // If reviewing a specific notion directly
  onSessionCompleted?: () => void;
}

export const SpacedRepetitionRunnerModal: React.FC<SpacedRepetitionRunnerModalProps> = ({
  isOpen,
  onClose,
  lang,
  selectedCert,
  targetItemId,
  onSessionCompleted,
}) => {
  const isFr = lang === 'fr';

  const [queue, setQueue] = useState<SpacedRepetitionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [sessionResults, setSessionResults] = useState<{
    itemId: string;
    titleFr: string;
    titleEn: string;
    rating: SpacedReviewRating;
    previousInterval: number;
    newInterval: number;
    newMastery: number;
    newStability: number;
  }[]>([]);

  // Load items when modal opens
  useEffect(() => {
    if (isOpen) {
      const due = getDueSpacedItems(selectedCert);
      if (targetItemId) {
        const specific = due.find((i) => i.id === targetItemId);
        if (specific) {
          setQueue([specific]);
        } else {
          setQueue(due.length > 0 ? due : []);
        }
      } else {
        setQueue(due.length > 0 ? due : []);
      }
      setCurrentIndex(0);
      setIsRevealed(false);
      setIsFinished(false);
      setSessionResults([]);
    }
  }, [isOpen, selectedCert, targetItemId]);

  if (!isOpen) return null;

  const currentItem: SpacedRepetitionItem | undefined = queue[currentIndex];

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleRate = (rating: SpacedReviewRating) => {
    if (!currentItem) return;

    // Calcul de l'état suivant via l'algorithme SM-2 / FSRS
    const nextState = calculateNextSpacedState(currentItem, rating);
    recordSpacedReview(currentItem.id, rating);

    setSessionResults((prev) => [
      ...prev,
      {
        itemId: currentItem.id,
        titleFr: currentItem.titleFr,
        titleEn: currentItem.titleEn,
        rating,
        previousInterval: currentItem.interval,
        newInterval: nextState.interval,
        newMastery: nextState.mastery,
        newStability: nextState.stability,
      },
    ]);

    if (currentIndex < queue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
      setCopiedCode(false);
    } else {
      setIsFinished(true);
      if (onSessionCompleted) {
        onSessionCompleted();
      }
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Preview intervals for current item
  const previewAgain = currentItem ? calculateNextSpacedState(currentItem, 'again') : null;
  const previewHard = currentItem ? calculateNextSpacedState(currentItem, 'hard') : null;
  const previewGood = currentItem ? calculateNextSpacedState(currentItem, 'good') : null;
  const previewEasy = currentItem ? calculateNextSpacedState(currentItem, 'easy') : null;

  return (
    <div
      id="spaced-repetition-runner-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-3xl bg-[#0b1c30] border border-[#1b2b3f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-[#000f21] border-b border-[#102034] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shadow-md">
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#38bdf8] uppercase font-bold tracking-wider">
                  {isFr ? 'Répétition Espacée' : 'Spaced Repetition'}
                </span>
                <span className="text-[#64748b]" aria-hidden="true">·</span>
                <span className="font-mono text-[10px] text-[#4edea3]">SM-2 / FSRS</span>
              </div>
              <h3 className="text-sm font-bold text-white">
                {isFinished
                  ? isFr ? 'Séance de révision terminée !' : 'Review Session Complete!'
                  : queue.length > 0
                  ? isFr
                    ? `Notion ${currentIndex + 1} sur ${queue.length}`
                    : `Concept ${currentIndex + 1} of ${queue.length}`
                  : isFr
                  ? 'Aucune notion en attente'
                  : 'No pending cards'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFinished && queue.length > 0 && (
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#102034] text-[#89929b] border border-[#1b2b3f]">
                {currentIndex + 1} / {queue.length}
              </span>
            )}
            <button
              id="close-spaced-runner-btn"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#89929b] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5 flex-1">
          {queue.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-[#003824] border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3] shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">
                {isFr ? 'Mémoire parfaitement à jour !' : 'All caught up!'}
              </h4>
              <p className="text-xs text-[#89929b] max-w-md leading-relaxed">
                {isFr
                  ? 'Aucune notion n\'est arrivée à échéance pour le moment. Vos révisions futures sont programmées selon la courbe de l\'oubli.'
                  : 'No concepts are due for review right now. Future sessions are scheduled along your retention curve.'}
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {isFr ? 'Fermer' : 'Close'}
              </button>
            </div>
          ) : isFinished ? (
            /* Session completion summary */
            <div className="py-6 flex flex-col gap-5">
              <div className="p-5 rounded-2xl bg-[#00172c] border border-[#4edea3]/40 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="w-14 h-14 rounded-2xl bg-[#003824] border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3] shrink-0 shadow-lg">
                  <Award className="w-7 h-7" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-base font-bold text-white">
                    {isFr ? 'Félicitations, révision espacée validée !' : 'Great job, spaced review complete!'}
                  </h4>
                  <p className="text-xs text-[#89929b] leading-relaxed">
                    {isFr
                      ? `${sessionResults.length} notion(s) mise(s) à jour. Les intervalles de répétition ont été recalculés selon votre taux d'exactitude.`
                      : `${sessionResults.length} concept(s) updated. Spaced intervals have been recalibrated based on your recall accuracy.`}
                  </p>
                </div>
              </div>

              {/* Results table */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs font-semibold text-[#89ceff]">
                  {isFr ? 'Détail des ajustements SM-2 / FSRS :' : 'SM-2 / FSRS Recalibration Details:'}
                </span>

                <div className="flex flex-col gap-2">
                  {sessionResults.map((res, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          res.rating === 'again' ? 'bg-[#f43f5e]' : res.rating === 'hard' ? 'bg-[#f59e0b]' : 'bg-[#4edea3]'
                        }`} />
                        <span className="font-semibold text-white">
                          {isFr ? res.titleFr : res.titleEn}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-[11px] shrink-0">
                        <span className="text-[#89929b]">
                          Intervalle : <strong className="text-white">{res.previousInterval}j ➔ {res.newInterval}j</strong>
                        </span>
                        <span className="text-[#89929b]">
                          Stabilité : <strong className="text-[#4edea3]">{res.newStability}j</strong>
                        </span>
                        <span className="text-[#89929b]">
                          Maîtrise : <strong className="text-[#38bdf8]">{res.newMastery}%</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#38bdf8] hover:bg-[#0284c7] text-[#00223d] hover:text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  {isFr ? 'Terminer & Retourner au Tableau de Bord' : 'Finish & Return to Dashboard'}
                </button>
              </div>
            </div>
          ) : currentItem ? (
            /* Active notion card */
            <div className="flex flex-col gap-5">
              {/* Concept Metadata Bar */}
              <div className="p-3 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#0284c7]/20 text-[#38bdf8] font-bold uppercase border border-[#0284c7]/40 text-[10px]">
                    {currentItem.pillar}
                  </span>
                  <span className="text-white font-semibold">
                    {isFr ? currentItem.titleFr : currentItem.titleEn}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#89929b]">
                  <span>Difficulté : <strong className="text-[#f59e0b]">{currentItem.difficulty}/10</strong></span>
                  <span>Stabilité : <strong className="text-[#4edea3]">{currentItem.stability}j</strong></span>
                  <span>Maîtrise : <strong className="text-white">{currentItem.mastery}%</strong></span>
                </div>
              </div>

              {/* Question / Prompt Box */}
              <div className="p-5 rounded-2xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#89929b] uppercase font-bold tracking-wider">
                    {isFr ? 'Question & Mise en Situation' : 'Question & Context'}
                  </span>
                  <span className="font-mono text-[10px] text-[#4edea3]">
                    {isFr ? 'Ancrage actif' : 'Active Recall'}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {isFr ? currentItem.promptFr : currentItem.promptEn}
                </h4>

                {/* SQL Code Snippet if present */}
                {currentItem.codeSnippet && (
                  <div className="relative rounded-xl bg-[#030914] border border-[#1b2b3f] p-3.5 font-mono text-xs overflow-x-auto text-[#89ceff]">
                    <button
                      onClick={() => handleCopyCode(currentItem.codeSnippet!)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#89929b] hover:text-white transition-colors"
                      title={isFr ? 'Copier le code SQL' : 'Copy SQL snippet'}
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#4edea3]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <pre className="pr-8">{currentItem.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {/* Reveal Answer Button or Answer Details */}
              {!isRevealed ? (
                <div className="flex justify-center pt-2">
                  <button
                    id="reveal-spaced-answer-btn"
                    onClick={handleReveal}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-bold text-sm shadow-xl shadow-[#0284c7]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>{isFr ? 'Révéler la Réponse & Règle d\'Or' : 'Reveal Answer & Golden Rule'}</span>
                  </button>
                </div>
              ) : (
                /* Revealed Explanation + 4 Grading Buttons */
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-[#00172c] border border-[#0284c7]/40 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold tracking-wider">
                        {isFr ? 'Réponse Correcte & Explication' : 'Correct Answer & Explanation'}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-white leading-relaxed">
                      {isFr ? currentItem.correctAnswerFr : currentItem.correctAnswerEn}
                    </div>

                    <p className="text-xs text-[#bfc7d2] leading-relaxed border-t border-[#1b2b3f] pt-2.5">
                      {isFr ? currentItem.explanationFr : currentItem.explanationEn}
                    </p>

                    {(currentItem.keyRuleFr || currentItem.keyRuleEn) && (
                      <div className="p-3 rounded-xl bg-[#0284c7]/10 border border-[#0284c7]/30 text-xs font-mono text-[#89ceff] flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-[#38bdf8] mt-0.5" />
                        <span>{isFr ? currentItem.keyRuleFr : currentItem.keyRuleEn}</span>
                      </div>
                    )}
                  </div>

                  {/* 4 Interactive SM-2 / FSRS Grading Buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    <span className="font-mono text-[11px] text-[#89929b] text-center">
                      {isFr
                        ? 'Comment avez-vous restitué cette notion ? (Ajuste l\'algorithme de répétition espacée)'
                        : 'How well did you recall this concept? (Calibrates SM-2 / FSRS interval)'}
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* Rating: AGAIN / ERREUR */}
                      <button
                        onClick={() => handleRate('again')}
                        className="p-3 rounded-xl bg-[#f43f5e]/15 hover:bg-[#f43f5e]/25 border border-[#f43f5e]/40 flex flex-col items-center gap-1 transition-all cursor-pointer group hover:scale-[1.02]"
                      >
                        <span className="text-xs font-bold text-[#f43f5e] group-hover:text-white">
                          ❌ {isFr ? 'Erreur / Oublié' : 'Error / Forgot'}
                        </span>
                        <span className="font-mono text-[10px] text-white font-bold bg-[#f43f5e]/30 px-2 py-0.5 rounded">
                          {previewAgain ? `${previewAgain.interval} ${isFr ? 'jour' : 'day'}` : '1 j'}
                        </span>
                        <span className="text-[9px] text-[#89929b] font-mono">
                          {isFr ? 'Rechute mnésique' : 'Reset reps to 0'}
                        </span>
                      </button>

                      {/* Rating: HARD / DIFFICILE */}
                      <button
                        onClick={() => handleRate('hard')}
                        className="p-3 rounded-xl bg-[#f59e0b]/15 hover:bg-[#f59e0b]/25 border border-[#f59e0b]/40 flex flex-col items-center gap-1 transition-all cursor-pointer group hover:scale-[1.02]"
                      >
                        <span className="text-xs font-bold text-[#f59e0b] group-hover:text-white">
                          ⚠️ {isFr ? 'Difficile' : 'Hard'}
                        </span>
                        <span className="font-mono text-[10px] text-white font-bold bg-[#f59e0b]/30 px-2 py-0.5 rounded">
                          {previewHard ? `${previewHard.interval} ${isFr ? 'jours' : 'days'}` : '2 j'}
                        </span>
                        <span className="text-[9px] text-[#89929b] font-mono">
                          {isFr ? 'Stabilité +20%' : 'Stability +20%'}
                        </span>
                      </button>

                      {/* Rating: GOOD / BONNE RÉPONSE (Exact sequence: 3j -> 7j -> 16j) */}
                      <button
                        onClick={() => handleRate('good')}
                        className="p-3 rounded-xl bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 border border-[#38bdf8]/40 flex flex-col items-center gap-1 transition-all cursor-pointer group hover:scale-[1.02]"
                      >
                        <span className="text-xs font-bold text-[#38bdf8] group-hover:text-white">
                          ✅ {isFr ? 'Bonne réponse' : 'Good recall'}
                        </span>
                        <span className="font-mono text-[10px] text-white font-bold bg-[#38bdf8]/30 px-2 py-0.5 rounded">
                          {previewGood ? `${previewGood.interval} ${isFr ? 'jours' : 'days'}` : '3 j'}
                        </span>
                        <span className="text-[9px] text-[#89929b] font-mono">
                          {isFr ? 'Consolidation' : 'Consolidating'}
                        </span>
                      </button>

                      {/* Rating: EASY / PARFAIT */}
                      <button
                        onClick={() => handleRate('easy')}
                        className="p-3 rounded-xl bg-[#4edea3]/15 hover:bg-[#4edea3]/25 border border-[#4edea3]/40 flex flex-col items-center gap-1 transition-all cursor-pointer group hover:scale-[1.02]"
                      >
                        <span className="text-xs font-bold text-[#4edea3] group-hover:text-white">
                          ⚡ {isFr ? 'Facile / Réflexe' : 'Easy / Reflex'}
                        </span>
                        <span className="font-mono text-[10px] text-white font-bold bg-[#4edea3]/30 px-2 py-0.5 rounded">
                          {previewEasy ? `${previewEasy.interval} ${isFr ? 'jours' : 'days'}` : '12 j+'}
                        </span>
                        <span className="text-[9px] text-[#89929b] font-mono">
                          {isFr ? 'Maîtrise immédiate' : 'Instant mastery'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
