import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  HelpCircle, 
  Lightbulb, 
  Terminal,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  fetchMistakeExplanation, 
  fetchSimilarQuestion, 
  MistakeExplanation, 
  SimilarQuestion 
} from '../services/geminiTutorService';

interface GeminiPedagogicalTutorProps {
  questionPrompt: string;
  codeSnippet?: string;
  chosenLetter: string;
  chosenText: string;
  correctLetter: string;
  correctText: string;
  conceptName?: string;
  explanation?: string;
  lang?: 'fr' | 'en';
  theme?: 'light' | 'dark';
  autoLoadExplanation?: boolean;
}

export const GeminiPedagogicalTutor: React.FC<GeminiPedagogicalTutorProps> = ({
  questionPrompt,
  codeSnippet,
  chosenLetter,
  chosenText,
  correctLetter,
  correctText,
  conceptName = 'Notion SQL',
  explanation = '',
  lang = 'fr',
  theme = 'light',
  autoLoadExplanation = true,
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [explanationData, setExplanationData] = useState<MistakeExplanation | null>(null);

  // Question similaire générée par Gemini
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [similarQuestion, setSimilarQuestion] = useState<SimilarQuestion | null>(null);
  const [selectedSimilarOption, setSelectedSimilarOption] = useState<string | null>(null);
  const [hasValidatedSimilar, setHasValidatedSimilar] = useState(false);

  // Charger l'explication pédagogique
  const loadExplanation = async () => {
    setIsLoadingExplanation(true);
    try {
      const activeLang: 'fr' | 'en' = lang === 'en' ? 'en' : 'fr';
      const data = await fetchMistakeExplanation({
        questionPrompt,
        codeSnippet,
        chosenLetter,
        chosenText,
        correctLetter,
        correctText,
        conceptName,
        explanation,
        lang: activeLang,
      });
      setExplanationData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  useEffect(() => {
    if (autoLoadExplanation && !explanationData) {
      loadExplanation();
    }
  }, [questionPrompt, chosenLetter, correctLetter]);

  // Demander une question similaire
  const handleRequestSimilarQuestion = async () => {
    setIsLoadingSimilar(true);
    setSelectedSimilarOption(null);
    setHasValidatedSimilar(false);
    try {
      const activeLang: 'fr' | 'en' = lang === 'en' ? 'en' : 'fr';
      const data = await fetchSimilarQuestion({
        conceptName,
        trapOrigin: explanationData?.trapOrigin || 'Piège conceptuel SQL',
        originalPrompt: questionPrompt,
        lang: activeLang,
      });
      setSimilarQuestion(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  const handleSelectSimilarOption = (optId: string) => {
    if (hasValidatedSimilar) return;
    setSelectedSimilarOption(optId);
  };

  const handleValidateSimilar = () => {
    if (!selectedSimilarOption) return;
    setHasValidatedSimilar(true);
  };

  const isSimilarCorrect = selectedSimilarOption === similarQuestion?.correctOptionId;

  return (
    <div className={`rounded-2xl border transition-all overflow-hidden shadow-sm ${
      isLight ? 'bg-gradient-to-br from-[#f0f9ff]/70 via-white to-[#f8fafc] border-[#bae6fd]' : 'bg-gradient-to-br from-[#0c2438] via-[#0b1c30] to-[#000f21] border-[#0284c7]/40'
    }`}>
      {/* En-tête du Tuteur Pédagogique */}
      <div className="p-4 sm:p-5 border-b border-[#bae6fd]/60 dark:border-[#1b2b3f] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] text-white flex items-center justify-center shadow-md shadow-[#0284c7]/25">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-[#0f172a] dark:text-[#d3e4fe]">
                {isFr ? 'Tuteur Pédagogique IA' : 'AI Pedagogical Tutor'}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0284c7]/15 text-[#0284c7] border border-[#0284c7]/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Gemini 3.8 Flash
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#64748b]">
              {isFr ? 'Analyse cognitive des erreurs et renforcement ciblé' : 'Cognitive error diagnosis & targeted reinforcement'}
            </span>
          </div>
        </div>

        {!explanationData && !isLoadingExplanation && (
          <button
            onClick={loadExplanation}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-all flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isFr ? 'Pourquoi ma réponse est fausse ?' : 'Why is my answer wrong?'}</span>
          </button>
        )}
      </div>

      {/* Corps du diagnostic */}
      <div className="p-5 sm:p-6 flex flex-col gap-5">
        {isLoadingExplanation && (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-[#0284c7]">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-mono font-bold">
              {isFr ? 'Gemini analyse la cause cognitive de votre erreur...' : 'Gemini is diagnosing your mistake...'}
            </span>
          </div>
        )}

        {explanationData && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Titre : Pourquoi ma réponse est fausse ? */}
            <div className="flex flex-col gap-1.5">
              <h5 className="text-base sm:text-lg font-black text-[#0f172a] dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>
                {isFr ? 'Pourquoi ma réponse est fausse ?' : 'Why is my answer wrong?'}
              </h5>

              {/* Rappels du choix étudiant et de la bonne réponse */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/25">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{explanationData.chosenSummary}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{explanationData.correctSummary}</span>
                </div>
              </div>
            </div>

            {/* Le piège vient de la différence entre... */}
            <div className={`p-4 rounded-xl border flex flex-col gap-2.5 ${
              isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#000f21] border-[#1b2b3f]'
            }`}>
              <p className="text-sm font-bold text-[#0f172a] dark:text-[#d3e4fe] leading-snug">
                {explanationData.trapOrigin}
              </p>

              {/* Puces percutantes */}
              <ul className="space-y-1.5 text-xs text-[#334155] dark:text-[#cbd5e1] pl-1">
                {explanationData.bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[#0284c7] font-bold shrink-0">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formule mnémotechnique : 💡 À retenir : */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#0284c7]/15 to-[#38bdf8]/10 border border-[#0284c7]/30 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0284c7] uppercase tracking-wide">
                <Lightbulb className="w-4 h-4 text-[#f59e0b] fill-current" />
                <span>{isFr ? 'À retenir :' : 'Key Takeaway:'}</span>
              </div>
              <pre className="font-mono text-xs sm:text-sm font-bold text-[#0f172a] dark:text-white whitespace-pre-line leading-relaxed pl-1">
                {explanationData.keyTakeaway.replace('💡 À retenir :', '').trim()}
              </pre>
            </div>

            {/* BOUTON D'ACTION : [Donne-moi une question similaire] */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                id="gemini-similar-question-btn"
                onClick={handleRequestSimilarQuestion}
                disabled={isLoadingSimilar}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#0369a1] hover:to-[#075985] text-white shadow-md shadow-[#0284c7]/25 transition-all flex items-center justify-center gap-2"
              >
                {isLoadingSimilar ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isFr ? 'Génération par Gemini en cours...' : 'Gemini is drafting a question...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isFr ? 'Donne-moi une question similaire' : 'Give me a similar question'}</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-[#64748b]">
                {isFr ? 'Permet de vérifier immédiatement que vous avez assimilé la règle.' : 'Test immediately if you mastered the rule.'}
              </span>
            </div>
          </div>
        )}

        {/* SECTION QUESTION SIMILAIRE GÉNÉRÉE */}
        {similarQuestion && (
          <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col gap-4 animate-fade-in ${
            isLight ? 'bg-white border-[#0284c7]/40 shadow-md' : 'bg-[#000f21] border-[#0284c7]/60 shadow-lg'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0] dark:border-[#1b2b3f]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
                <span className="font-mono text-xs font-bold text-[#0284c7]">
                  {isFr ? 'Question d\'application directe (Générée par Gemini)' : 'Direct Application Question (Gemini)'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#64748b]">
                {conceptName}
              </span>
            </div>

            {/* Énoncé */}
            <p className="text-sm font-bold text-[#0f172a] dark:text-[#d3e4fe] leading-snug">
              {similarQuestion.prompt}
            </p>

            {/* Snippet SQL si fourni */}
            {similarQuestion.codeSnippet && (
              <pre className="p-3 rounded-xl bg-[#000f21] border border-[#1b2b3f] text-[#38bdf8] font-mono text-xs overflow-x-auto">
                <code>{similarQuestion.codeSnippet}</code>
              </pre>
            )}

            {/* 4 Options de réponse */}
            <div className="flex flex-col gap-2 pt-1">
              {similarQuestion.options.map((opt) => {
                const isSelected = selectedSimilarOption === opt.id;
                const isCorrect = similarQuestion.correctOptionId === opt.id;

                let optClass = isLight 
                  ? 'bg-[#f8fafc] border-[#cbd5e1] hover:border-[#0284c7] hover:bg-[#f1f5f9]' 
                  : 'bg-[#0b1c30] border-[#1b2b3f] hover:border-[#38bdf8] hover:bg-[#102034]';

                if (hasValidatedSimilar) {
                  if (isCorrect) {
                    optClass = 'bg-[#10b981]/15 border-[#10b981] text-[#059669] dark:text-[#4edea3] font-bold';
                  } else if (isSelected && !isCorrect) {
                    optClass = 'bg-[#ef4444]/15 border-[#ef4444] text-[#ef4444] font-medium line-through';
                  }
                } else if (isSelected) {
                  optClass = isLight
                    ? 'bg-[#0284c7]/10 border-[#0284c7] ring-1 ring-[#0284c7]'
                    : 'bg-[#0284c7]/20 border-[#38bdf8] ring-1 ring-[#38bdf8]';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectSimilarOption(opt.id)}
                    disabled={hasValidatedSimilar}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 text-xs ${optClass}`}
                  >
                    <span className="font-mono font-bold text-sm shrink-0">{opt.letter}.</span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Validation & Feedback */}
            {!hasValidatedSimilar ? (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleValidateSimilar}
                  disabled={!selectedSimilarOption}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isFr ? 'Valider ma réponse' : 'Submit answer'}</span>
                </button>
              </div>
            ) : (
              <div className="mt-2 p-4 rounded-xl border flex flex-col gap-3 animate-fade-in bg-[#f8fafc] dark:bg-[#000f21] border-[#cbd5e1] dark:border-[#1b2b3f]">
                <div className="flex items-center gap-2">
                  {isSimilarCorrect ? (
                    <div className="flex items-center gap-2 text-[#10b981] font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{isFr ? '🎉 Bravo ! Tu as parfaitement assimilé la règle.' : '🎉 Great job! You have mastered the rule.'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[#ef4444] font-bold text-sm">
                      <XCircle className="w-5 h-5" />
                      <span>{isFr ? 'Pas tout à fait ! Regarde l\'explication ci-dessous :' : 'Not quite! Check out the explanation below:'}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#475569] dark:text-[#cbd5e1] leading-relaxed">
                  {similarQuestion.explanation}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#e2e8f0] dark:border-[#1b2b3f]">
                  <span className="text-[11px] font-mono text-[#0284c7] font-semibold">
                    💡 {similarQuestion.takeaway}
                  </span>

                  <button
                    onClick={handleRequestSimilarQuestion}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0284c7]/10 hover:bg-[#0284c7]/20 text-[#0284c7] border border-[#0284c7]/30 transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Autre question sur cette notion' : 'Another question'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
