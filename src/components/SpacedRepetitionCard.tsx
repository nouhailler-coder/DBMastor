import React, { useState, useEffect } from 'react';
import {
  Brain,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingUp,
  FastForward,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  loadSpacedRepetitionItems,
  getDueSpacedItems,
  getSpacedRepetitionStats,
  getVirtualTimeOffsetDays,
  setVirtualTimeOffsetDays,
  formatNextReviewDelay,
  getSimulatedNow
} from '../services/spacedRepetitionService';
import { SpacedRepetitionItem, SpacedRepetitionStats, CertificationTrackId } from '../types';

interface SpacedRepetitionCardProps {
  lang: 'fr' | 'en';
  selectedCert: CertificationTrackId;
  onOpenRunner: () => void;
  onNavigateToSpacedView?: () => void;
}

export const SpacedRepetitionCard: React.FC<SpacedRepetitionCardProps> = ({
  lang,
  selectedCert,
  onOpenRunner,
  onNavigateToSpacedView,
}) => {
  const isFr = lang === 'fr';

  const [stats, setStats] = useState<SpacedRepetitionStats>(() => getSpacedRepetitionStats());
  const [dueItems, setDueItems] = useState<SpacedRepetitionItem[]>(() => getDueSpacedItems());
  const [virtualOffset, setVirtualOffset] = useState<number>(() => getVirtualTimeOffsetDays());

  const refreshData = () => {
    setStats(getSpacedRepetitionStats());
    setDueItems(getDueSpacedItems());
    setVirtualOffset(getVirtualTimeOffsetDays());
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('dbmastery:spaced_repetition_updated', handleUpdate);
    return () => {
      window.removeEventListener('dbmastery:spaced_repetition_updated', handleUpdate);
    };
  }, []);

  const handleSimulateDays = (days: number) => {
    setVirtualTimeOffsetDays(virtualOffset + days);
  };

  const handleResetTime = () => {
    setVirtualTimeOffsetDays(0);
  };

  const simulatedDate = getSimulatedNow();
  const formattedSimulatedDate = simulatedDate.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div
      id="spaced-repetition-dashboard-card"
      className="p-5 sm:p-6 rounded-2xl bg-[#0b1c30] border border-[#1b2b3f] shadow-xl flex flex-col gap-5 relative overflow-hidden transition-all hover:border-[#38bdf8]/40"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#38bdf8]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header section with algorithm badge & action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#0284c7]/25">
            <Brain className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#38bdf8]">
                {isFr ? 'Répétition Espacée' : 'Spaced Repetition'}
              </span>
              <span className="text-[#64748b]" aria-hidden="true">·</span>
              <span className="font-mono text-[10px] text-[#4edea3] font-semibold">
                SM-2 / FSRS Engine
              </span>
              {virtualOffset > 0 && (
                <>
                  <span className="text-[#64748b]" aria-hidden="true">·</span>
                  <span className="font-mono text-[10px] text-[#f59e0b] bg-[#f59e0b]/10 px-1.5 py-0.5 rounded border border-[#f59e0b]/30">
                    {isFr ? `Simulation : +${virtualOffset}j (${formattedSimulatedDate})` : `Simulated: +${virtualOffset}d (${formattedSimulatedDate})`}
                  </span>
                </>
              )}
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isFr ? 'Consolidation Mnésique & Échéances de Révision' : 'Memory Retention & Scheduled Reviews'}
            </h2>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          {onNavigateToSpacedView && (
            <button
              onClick={onNavigateToSpacedView}
              className="px-3 py-2 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#89929b] hover:text-[#d3e4fe] font-mono text-xs font-semibold transition-colors cursor-pointer"
            >
              {isFr ? 'Gérer les notions' : 'Manage concepts'}
            </button>
          )}

          <button
            id="launch-spaced-repetition-btn"
            onClick={onOpenRunner}
            disabled={dueItems.length === 0}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              dueItems.length > 0
                ? 'bg-[#38bdf8] hover:bg-[#0284c7] text-[#00223d] hover:text-white shadow-[#0284c7]/25 animate-pulse'
                : 'bg-[#1b2b3f] text-[#89929b] cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {dueItems.length > 0
                ? isFr
                  ? `Réviser (${dueItems.length} notions)`
                  : `Review (${dueItems.length} due)`
                : isFr
                ? 'Aucune révision due'
                : 'All caught up!'}
            </span>
          </button>
        </div>
      </div>

      {/* Visual Progression Ladder requested by User */}
      <div className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-2 z-10">
        <div className="flex items-center justify-between text-xs text-[#89929b]">
          <span className="font-semibold text-[#d3e4fe]">
            {isFr ? 'Cycle d\'ancrage pédagogique :' : 'Memory consolidation path:'}
          </span>
          <span className="font-mono text-[11px] text-[#4edea3]">
            {isFr ? 'Taux de rétention : ' : 'Retention rate: '}
            <strong className="text-white">{stats.retentionRatePercent}%</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-[#102034] border border-[#1b2b3f] flex flex-col gap-0.5">
            <span className="text-[10px] text-[#89929b] uppercase">{isFr ? '1. Question' : '1. Question'}</span>
            <span className="text-[#d3e4fe] font-bold text-[11px]">{isFr ? 'Évaluation initiale' : 'Initial check'}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#f43f5e]/10 border border-[#f43f5e]/30 flex flex-col gap-0.5">
            <span className="text-[10px] text-[#f43f5e] font-bold uppercase">{isFr ? '2. Erreur' : '2. Error'}</span>
            <span className="text-white font-bold text-[11px]">{isFr ? 'Révision dans 1 jour' : 'Review in 1 day'}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex flex-col gap-0.5">
            <span className="text-[10px] text-[#f59e0b] font-bold uppercase">{isFr ? '3. 1ère Réussite' : '3. 1st Success'}</span>
            <span className="text-white font-bold text-[11px]">{isFr ? 'Révision dans 3 jours' : 'Review in 3 days'}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex flex-col gap-0.5">
            <span className="text-[10px] text-[#38bdf8] font-bold uppercase">{isFr ? '4. 2ème Réussite' : '4. 2nd Success'}</span>
            <span className="text-white font-bold text-[11px]">{isFr ? 'Révision dans 7 jours' : 'Review in 7 days'}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#4edea3]/10 border border-[#4edea3]/30 flex flex-col gap-0.5 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#4edea3] font-bold uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {isFr ? '5. Maîtrisé' : '5. Mastered'}
            </span>
            <span className="text-white font-bold text-[11px]">{isFr ? 'Ancrage long terme' : 'Long-term reflex'}</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 z-10">
        <div className="p-3 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col gap-1">
          <span className="font-mono text-[10px] text-[#89929b] uppercase">{isFr ? 'Dues aujourd\'hui' : 'Due Today'}</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${dueItems.length > 0 ? 'text-[#38bdf8]' : 'text-[#4edea3]'}`}>
              {stats.dueTodayCount}
            </span>
            <span className="text-[11px] text-[#89929b]">/ {stats.totalItems} notions</span>
          </div>
          <div className="w-full bg-[#1b2b3f] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#38bdf8] h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (stats.dueTodayCount / (stats.totalItems || 1)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col gap-1">
          <span className="font-mono text-[10px] text-[#89929b] uppercase">{isFr ? 'Stabilité moyenne' : 'Avg Stability'}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#4edea3]">
              {stats.averageStabilityDays}
            </span>
            <span className="text-[11px] text-[#89929b]">{isFr ? 'jours' : 'days'}</span>
          </div>
          <span className="text-[10px] font-mono text-[#89929b]">
            {isFr ? 'Durée de rétention sans oubli' : 'Retention duration'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col gap-1">
          <span className="font-mono text-[10px] text-[#89929b] uppercase">{isFr ? 'Score de Maîtrise' : 'Avg Mastery'}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats.averageMastery}%
            </span>
            <span className="text-[11px] text-[#89929b]">{stats.masteredCount} {isFr ? 'maîtrisées' : 'mastered'}</span>
          </div>
          <div className="w-full bg-[#1b2b3f] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#4edea3] h-full rounded-full transition-all"
              style={{ width: `${stats.averageMastery}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col gap-1">
          <span className="font-mono text-[10px] text-[#89929b] uppercase">{isFr ? 'Révisions effectuées' : 'Reviews Done'}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-[#d3e4fe]">
              {stats.totalReviewsDone}
            </span>
            <span className="text-[11px] text-[#89929b]">{isFr ? 'passages' : 'trials'}</span>
          </div>
          <span className="text-[10px] font-mono text-[#4edea3]">
            {stats.learningCount} {isFr ? 'en apprentissage' : 'learning'}
          </span>
        </div>
      </div>

      {/* Due notions preview list if any */}
      {dueItems.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#102034]/70 border border-[#1b2b3f] flex flex-col gap-2 z-10">
          <div className="flex items-center justify-between text-xs text-[#89929b]">
            <span className="font-semibold text-[#d3e4fe] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
              {isFr ? 'Notions prioritaires à réviser maintenant :' : 'Top priority concepts due for review:'}
            </span>
            <span className="font-mono text-[10px] text-[#38bdf8]">
              {dueItems.length} {isFr ? 'en attente' : 'pending'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            {dueItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-[#061322] border border-[#1b2b3f] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    item.status === 'learning' ? 'bg-[#f43f5e]' : item.status === 'review' ? 'bg-[#f59e0b]' : 'bg-[#4edea3]'
                  }`} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[#d3e4fe] truncate">
                      {isFr ? item.titleFr : item.titleEn}
                    </span>
                    <span className="font-mono text-[10px] text-[#89929b]">
                      Pilier : <strong className="text-[#38bdf8] uppercase">{item.pillar}</strong> · Stabilité : {item.stability}j · Succès : {item.successCount}/{item.successCount + item.failureCount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[11px] text-[#f43f5e] font-bold">
                    {formatNextReviewDelay(item.nextReviewAt, lang)}
                  </span>
                  <button
                    onClick={onOpenRunner}
                    className="p-1 rounded bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] transition-colors"
                    title={isFr ? 'Réviser' : 'Review'}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Time Travel Simulator Toolbar */}
      <div className="p-3 rounded-xl bg-[#061322]/80 border border-[#1b2b3f] flex flex-wrap items-center justify-between gap-2.5 z-10 text-xs">
        <div className="flex items-center gap-2 text-[#89929b]">
          <FastForward className="w-4 h-4 text-[#f59e0b]" />
          <span className="font-mono text-[11px] text-[#d3e4fe]">
            {isFr ? 'Simulateur temporel :' : 'Time Machine:'}
          </span>
          <span className="text-[11px] text-[#89929b] hidden md:inline">
            {isFr ? 'Avancez l\'horloge pour tester le déclenchement des intervalles' : 'Advance clock to test intervals'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <button
            onClick={() => handleSimulateDays(1)}
            className="px-2.5 py-1 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#1b2b3f] transition-all cursor-pointer"
            title={isFr ? 'Avancer de 1 jour' : 'Advance 1 day'}
          >
            +1 {isFr ? 'jour' : 'day'}
          </button>
          <button
            onClick={() => handleSimulateDays(3)}
            className="px-2.5 py-1 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#1b2b3f] transition-all cursor-pointer"
            title={isFr ? 'Avancer de 3 jours' : 'Advance 3 days'}
          >
            +3 {isFr ? 'jours' : 'days'}
          </button>
          <button
            onClick={() => handleSimulateDays(7)}
            className="px-2.5 py-1 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#1b2b3f] transition-all cursor-pointer"
            title={isFr ? 'Avancer de 7 jours' : 'Advance 7 days'}
          >
            +7 {isFr ? 'jours' : 'days'}
          </button>

          {virtualOffset > 0 && (
            <button
              onClick={handleResetTime}
              className="px-2.5 py-1 rounded-lg bg-[#f43f5e]/15 hover:bg-[#f43f5e]/30 text-[#f43f5e] border border-[#f43f5e]/30 transition-all flex items-center gap-1 cursor-pointer"
              title={isFr ? 'Réinitialiser à la date réelle' : 'Reset to real date'}
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isFr ? 'Aujourd\'hui (J+0)' : 'Reset (J+0)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
