import React, { useState, useEffect } from 'react';
import {
  Target,
  Sparkles,
  Clock,
  Play,
  CheckCircle2,
  TrendingUp,
  Brain,
  RotateCcw,
  Zap,
  ArrowRight,
  ShieldAlert,
  Award
} from 'lucide-react';
import {
  getRecommendedDailySessionConfig,
  DailySessionConfig,
  isDailySessionCompletedToday,
  loadDailySessionState,
  DailySessionState
} from '../services/dailySessionService';

interface DailySessionCardProps {
  lang: 'fr' | 'en';
  onStartDailySession: () => void;
}

export const DailySessionCard: React.FC<DailySessionCardProps> = ({
  lang,
  onStartDailySession,
}) => {
  const isFr = lang === 'fr';
  const [config, setConfig] = useState<DailySessionConfig>(() =>
    getRecommendedDailySessionConfig(lang)
  );
  const [sessionState, setSessionState] = useState<DailySessionState>(() =>
    loadDailySessionState()
  );
  const [isCompletedToday, setIsCompletedToday] = useState<boolean>(() =>
    isDailySessionCompletedToday()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getRecommendedDailySessionConfig(lang));
      setSessionState(loadDailySessionState());
      setIsCompletedToday(isDailySessionCompletedToday());
    };

    window.addEventListener('dbmastery:daily_session_completed', handleUpdate);
    window.addEventListener('dbmastery:mastery_updated', handleUpdate);
    window.addEventListener('dbmastery:competencies_updated', handleUpdate);

    return () => {
      window.removeEventListener('dbmastery:daily_session_completed', handleUpdate);
      window.removeEventListener('dbmastery:mastery_updated', handleUpdate);
      window.removeEventListener('dbmastery:competencies_updated', handleUpdate);
    };
  }, [lang]);

  return (
    <div
      id="daily-session-hero-card"
      className="relative w-full rounded-2xl bg-gradient-to-r from-[#00223d] via-[#091b30] to-[#041224] border-2 border-[#0284c7]/50 shadow-[0_15px_45px_rgba(2,132,199,0.18)] p-6 lg:p-7 overflow-hidden transition-all flex flex-col gap-5"
    >
      {/* Glow décoratif d'ambiance */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* QUESTION INTRODUCTIVE DE L'UTILISATEUR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2b3f] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0284c7]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] shadow-inner shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#38bdf8] font-bold">
              {isFr ? 'Question Fréquente' : 'Core Question'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
              {isFr ? '« Que dois-je travailler aujourd\'hui ? »' : '"What should I study today?"'}
            </h2>
          </div>
        </div>

        {/* Badge d'état si déjà fait aujourd'hui */}
        {isCompletedToday ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#003824] border border-[#4edea3]/50 text-[#4edea3] font-mono text-xs font-bold self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
            <span>
              {isFr
                ? `Séance du jour validée (${sessionState.lastScore}%)`
                : `Today's session completed (${sessionState.lastScore}%)`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0284c7]/20 border border-[#38bdf8]/30 text-[#93ccff] font-mono text-xs font-semibold self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>{isFr ? 'Calcul automatique IA' : 'Auto-computed by AI'}</span>
          </div>
        )}
      </div>

      {/* CORPS PRINCIPAL DE LA RECOMMANDATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Colonne Gauche : Titre, Kicker, 15 questions & 12 minutes */}
        <div className="lg:col-span-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#002f54] text-[#38bdf8] border border-[#38bdf8]/40 flex items-center gap-1.5 shadow-sm">
              <Target className="w-3.5 h-3.5 text-[#38bdf8]" />
              {isFr ? '🎯 Ma séance du jour' : '🎯 Today\'s Session'}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            {isFr ? 'Séance recommandée' : 'Recommended Session'}
          </h3>

          <div className="flex items-center gap-3 text-sm font-mono text-[#bfc7d2] pt-0.5">
            <span className="font-bold text-[#d3e4fe] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span>
              15 questions
            </span>
            <span className="text-[#89929b]">•</span>
            <span className="flex items-center gap-1.5 text-[#93ccff]">
              <Clock className="w-4 h-4 text-[#38bdf8]" />
              ≈ 12 minutes
            </span>
          </div>

          <p className="text-xs text-[#89929b] leading-relaxed pt-1">
            {isFr
              ? 'L\'algorithme calcule et sélectionne vos notions les plus urgentes pour maximiser votre rétention sans perdre de temps.'
              : 'The algorithm picks your most urgent topics to maximize retention with zero decision fatigue.'}
          </p>
        </div>

        {/* Colonne Centrale : Décomposition exacte demandée par l'utilisateur */}
        <div className="lg:col-span-5 bg-[#000e1f] p-4 sm:p-5 rounded-2xl border border-[#1b2b3f] flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono border-b border-[#1b2b3f] pb-2">
            <span className="text-[#89929b] uppercase font-bold tracking-wider">
              {isFr ? 'Notion ciblée' : 'Targeted Topic'}
            </span>
            <span className="text-[#89929b] uppercase font-bold tracking-wider">
              {isFr ? 'Volume calculé' : 'Question Volume'}
            </span>
          </div>

          <div className="flex flex-col gap-2 font-mono text-xs">
            {config.breakdown.map((item) => (
              <div
                key={item.topicId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b1c30] hover:bg-[#102034] border border-[#1b2b3f] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                  <span className="font-bold text-white text-sm">{item.topicName}</span>
                  {item.currentScore !== undefined && (
                    <span className="text-[10px] text-[#89929b] hidden sm:inline">
                      ({item.currentScore}% actuel)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#38bdf8] text-sm">
                    {item.count} questions
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mention Difficulté : progressive */}
          <div className="pt-2 border-t border-[#1b2b3f] flex items-center justify-between text-xs font-mono">
            <span className="text-[#4edea3] font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#4edea3]" />
              {isFr ? 'Difficulté : progressive' : 'Difficulty: progressive'}
            </span>
            <span className="text-[11px] text-[#89929b]">
              {isFr ? 'Niveau 1 → 2 → 3' : 'Level 1 → 2 → 3'}
            </span>
          </div>
        </div>

        {/* Colonne Droite : Bouton [ COMMENCER ] */}
        <div className="lg:col-span-3 flex flex-col justify-center items-stretch gap-3">
          <button
            id="start-daily-session-btn"
            onClick={onStartDailySession}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-extrabold text-base tracking-wide shadow-xl shadow-[#0284c7]/35 hover:shadow-[#0284c7]/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-[#7dd3fc]/50 group"
          >
            <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
            <span>{isCompletedToday ? (isFr ? '[ RECOMMENCER ]' : '[ RETAKE ]') : (isFr ? '[ COMMENCER ]' : '[ START ]')}</span>
          </button>

          <span className="text-center font-mono text-[11px] text-[#89929b]">
            {isFr
              ? 'Mise à jour immédiate de MON NIVEAU à la fin'
              : 'Immediate update of MY LEVEL upon completion'}
          </span>
        </div>
      </div>
    </div>
  );
};
