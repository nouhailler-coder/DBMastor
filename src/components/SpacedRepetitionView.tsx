import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  Sparkles,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  FastForward,
  TrendingUp,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  Code2,
  Calendar,
  Award,
  HelpCircle,
  ChevronRight,
  Activity
} from 'lucide-react';
import {
  SpacedRepetitionItem,
  SpacedRepetitionStats,
  CertificationTrackId,
  NavigationTab
} from '../types';
import {
  loadSpacedRepetitionItems,
  getDueSpacedItems,
  getSpacedRepetitionStats,
  getVirtualTimeOffsetDays,
  setVirtualTimeOffsetDays,
  formatNextReviewDelay,
  resetSpacedRepetitionToDefault,
  getSimulatedNow
} from '../services/spacedRepetitionService';
import { SpacedRepetitionRunnerModal } from './SpacedRepetitionRunnerModal';

interface SpacedRepetitionViewProps {
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  selectedCert: CertificationTrackId;
  onNavigateToTab?: (tab: NavigationTab) => void;
}

export const SpacedRepetitionView: React.FC<SpacedRepetitionViewProps> = ({
  lang,
  theme = 'dark',
  selectedCert,
  onNavigateToTab,
}) => {
  const isFr = lang === 'fr';

  const [items, setItems] = useState<SpacedRepetitionItem[]>(() => loadSpacedRepetitionItems());
  const [stats, setStats] = useState<SpacedRepetitionStats>(() => getSpacedRepetitionStats(selectedCert));
  const [virtualOffset, setVirtualOffset] = useState<number>(() => getVirtualTimeOffsetDays());

  // Search and filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Runner modal state
  const [isRunnerOpen, setIsRunnerOpen] = useState<boolean>(false);
  const [targetReviewItemId, setTargetReviewItemId] = useState<string | undefined>(undefined);

  const refresh = () => {
    setItems(loadSpacedRepetitionItems());
    setStats(getSpacedRepetitionStats(selectedCert));
    setVirtualOffset(getVirtualTimeOffsetDays());
  };

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener('dbmastery:spaced_repetition_updated', handleUpdate);
    return () => {
      window.removeEventListener('dbmastery:spaced_repetition_updated', handleUpdate);
    };
  }, [selectedCert]);

  const handleSimulateDays = (days: number) => {
    setVirtualTimeOffsetDays(virtualOffset + days);
  };

  const handleResetTime = () => {
    setVirtualTimeOffsetDays(0);
  };

  const handleResetNotions = () => {
    if (window.confirm(isFr ? 'Réinitialiser toutes les notions de répétition espacée aux valeurs d\'origine ?' : 'Reset all spaced repetition concepts to default values?')) {
      resetSpacedRepetitionToDefault();
      refresh();
    }
  };

  const simulatedDate = getSimulatedNow();
  const simulatedDateStr = simulatedDate.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Filtered items
  const filteredItems = useMemo(() => {
    const nowMs = simulatedDate.getTime();
    return items.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.titleFr.toLowerCase().includes(q) ||
          item.titleEn.toLowerCase().includes(q) ||
          item.promptFr.toLowerCase().includes(q) ||
          item.promptEn.toLowerCase().includes(q) ||
          item.pillar.toLowerCase().includes(q) ||
          (item.keyRuleFr && item.keyRuleFr.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Pillar
      if (selectedPillar !== 'all' && item.pillar !== selectedPillar) {
        return false;
      }

      // Status
      if (selectedStatus === 'due') {
        const nextMs = new Date(item.nextReviewAt).getTime();
        return nextMs <= nowMs;
      }
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, selectedPillar, selectedStatus, simulatedDate]);

  const dueItems = useMemo(() => getDueSpacedItems(selectedCert), [items, simulatedDate, selectedCert]);

  return (
    <div
      id="spaced-repetition-view"
      className="p-6 max-w-[1720px] mx-auto w-full flex flex-col gap-6 animate-fade-in"
    >
      {/* Runner Modal */}
      <SpacedRepetitionRunnerModal
        isOpen={isRunnerOpen}
        onClose={() => {
          setIsRunnerOpen(false);
          setTargetReviewItemId(undefined);
          refresh();
        }}
        lang={lang}
        selectedCert={selectedCert}
        targetItemId={targetReviewItemId}
        onSessionCompleted={() => {
          refresh();
        }}
      />

      {/* Hero Banner with Pedagogical Explanation */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-[#00172c] via-[#0b1c30] to-[#001f3b] border border-[#38bdf8]/40 shadow-xl flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#0284c7]/30">
              <Brain className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs uppercase font-bold tracking-wider text-[#38bdf8]">
                  {isFr ? 'Moteur Pédagogique' : 'Learning Engine'}
                </span>
                <span className="text-[#64748b]" aria-hidden="true">·</span>
                <span className="font-mono text-xs text-[#4edea3] font-semibold">
                  Algorithme SM-2 / FSRS & Courbe d'Ebbinghaus
                </span>
                {virtualOffset > 0 && (
                  <>
                    <span className="text-[#64748b]" aria-hidden="true">·</span>
                    <span className="font-mono text-xs text-[#f59e0b] bg-[#f59e0b]/15 px-2 py-0.5 rounded border border-[#f59e0b]/40">
                      {isFr ? `Date simulée : +${virtualOffset}j (${simulatedDateStr})` : `Virtual Date: +${virtualOffset}d (${simulatedDateStr})`}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isFr ? 'Répétition Espacée — Ancrage Réflexe & Anti-Oubli' : 'Spaced Repetition — Reflex Memory Consolidation'}
              </h1>
              <p className="text-xs sm:text-sm text-[#bfc7d2] max-w-3xl leading-relaxed">
                {isFr
                  ? 'Une notion mal maîtrisée revient au moment précis où le cerveau s\'apprête à l\'oublier. Chaque révision réussie espace la prochaine séance (1j ➔ 3j ➔ 7j ➔ 16j), transformant l\'effort d\'analyse en automatisme certifié.'
                  : 'Concepts return at the optimal recall window before memory decay. Each successful review expands interval spacing (1d ➔ 3d ➔ 7d ➔ 16d), turning conscious analysis into effortless exam reflexes.'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleResetNotions}
              className="px-3.5 py-2.5 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#89929b] hover:text-[#d3e4fe] font-mono text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title={isFr ? 'Réinitialiser les notions' : 'Reset concepts'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFr ? 'Réinitialiser' : 'Reset'}</span>
            </button>

            <button
              id="view-launch-due-session-btn"
              onClick={() => {
                setTargetReviewItemId(undefined);
                setIsRunnerOpen(true);
              }}
              disabled={dueItems.length === 0}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                dueItems.length > 0
                  ? 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] text-white shadow-[#0284c7]/30 hover:scale-[1.02]'
                  : 'bg-[#1b2b3f] text-[#89929b] cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>
                {dueItems.length > 0
                  ? isFr
                    ? `Lancer la Révision (${dueItems.length} notions)`
                    : `Start Review (${dueItems.length} due)`
                  : isFr
                  ? 'Toutes les révisions sont à jour !'
                  : 'All caught up!'}
              </span>
            </button>
          </div>
        </div>

        {/* Visual Ladder matching User Specification */}
        <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-2.5 z-10">
          <div className="flex items-center justify-between text-xs text-[#89929b]">
            <span className="font-semibold text-[#d3e4fe]">
              {isFr ? 'Séquence mathématique de rétention :' : 'Mathematical retention ladder:'}
            </span>
            <span className="font-mono text-xs text-[#4edea3]">
              {isFr ? 'Formule FSRS : S_new = S * (1 + Factor)' : 'FSRS Formula: S_new = S * (1 + Factor)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#102034] border border-[#1b2b3f] flex flex-col gap-1">
              <span className="text-[10px] text-[#89929b] uppercase font-bold">1. Question</span>
              <span className="text-white font-bold text-xs">{isFr ? 'Test initial' : 'Initial trial'}</span>
              <span className="text-[10px] text-[#89929b]">{isFr ? 'Évaluation continue' : 'Continuous test'}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#f43f5e]/10 border border-[#f43f5e]/30 flex flex-col gap-1">
              <span className="text-[10px] text-[#f43f5e] uppercase font-bold">2. Erreur</span>
              <span className="text-white font-bold text-xs">{isFr ? 'Révision dans 1 jour' : 'Review in 1 day'}</span>
              <span className="text-[10px] text-[#f43f5e]">{isFr ? 'Stabilité = 1.0j' : 'Stability = 1.0d'}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex flex-col gap-1">
              <span className="text-[10px] text-[#f59e0b] uppercase font-bold">3. 1ère Bonne réponse</span>
              <span className="text-white font-bold text-xs">{isFr ? 'Révision dans 3 jours' : 'Review in 3 days'}</span>
              <span className="text-[10px] text-[#f59e0b]">{isFr ? 'Stabilité = 3.0j' : 'Stability = 3.0d'}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex flex-col gap-1">
              <span className="text-[10px] text-[#38bdf8] uppercase font-bold">4. 2ème Bonne réponse</span>
              <span className="text-white font-bold text-xs">{isFr ? 'Révision dans 7 jours' : 'Review in 7 days'}</span>
              <span className="text-[10px] text-[#38bdf8]">{isFr ? 'Stabilité = 7.0j' : 'Stability = 7.0d'}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#4edea3]/10 border border-[#4edea3]/30 flex flex-col gap-1">
              <span className="text-[10px] text-[#4edea3] uppercase font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                5. Maîtrisé
              </span>
              <span className="text-white font-bold text-xs">{isFr ? 'Révision à 16j - 35j' : 'Review in 16d - 35d'}</span>
              <span className="text-[10px] text-[#4edea3]">{isFr ? 'Ancrage définitif' : 'Permanent recall'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col gap-1">
          <span className="font-mono text-[10px] text-[#89929b] uppercase">{isFr ? 'Dues aujourd\'hui' : 'Due Today'}</span>
          <span className={`text-2xl font-bold font-mono ${stats.dueTodayCount > 0 ? 'text-[#38bdf8]' : 'text-[#4edea3]'}`}>
            {stats.dueTodayCount}
          </span>
          <span className="text-[10px] font-mono text-[#89929b]">{isFr ? 'à réviser' : 'to review'}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col gap-1">
          <span className="font-mono text-[10px] text-[#f43f5e] uppercase">{isFr ? 'En apprentissage' : 'Learning'}</span>
          <span className="text-2xl font-bold font-mono text-[#f43f5e]">
            {stats.learningCount}
          </span>
          <span className="text-[10px] font-mono text-[#89929b]">{isFr ? 'intervalles 1 jour' : '1-day intervals'}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col gap-1">
          <span className="font-mono text-[10px] text-[#f59e0b] uppercase">{isFr ? 'En révision' : 'Review'}</span>
          <span className="text-2xl font-bold font-mono text-[#f59e0b]">
            {stats.reviewCount}
          </span>
          <span className="text-[10px] font-mono text-[#89929b]">{isFr ? 'intervalles 3j - 7j' : '3d - 7d intervals'}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col gap-1">
          <span className="font-mono text-[10px] text-[#4edea3] uppercase">{isFr ? 'Maîtrisées' : 'Mastered'}</span>
          <span className="text-2xl font-bold font-mono text-[#4edea3]">
            {stats.masteredCount}
          </span>
          <span className="text-[10px] font-mono text-[#89929b]">{isFr ? 'rétention durable' : 'long-term'}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col gap-1">
          <span className="font-mono text-[10px] text-[#89929b] uppercase">{isFr ? 'Stabilité Moyenne' : 'Avg Stability'}</span>
          <span className="text-2xl font-bold font-mono text-[#89ceff]">
            {stats.averageStabilityDays} <span className="text-xs font-normal text-[#89929b]">{isFr ? 'j' : 'd'}</span>
          </span>
          <span className="text-[10px] font-mono text-[#89929b]">{isFr ? 'durée de mémoire' : 'memory half-life'}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col gap-1">
          <span className="font-mono text-[10px] text-[#89929b] uppercase">{isFr ? 'Taux de Rétention' : 'Retention Rate'}</span>
          <span className="text-2xl font-bold font-mono text-white">
            {stats.retentionRatePercent}%
          </span>
          <span className="text-[10px] font-mono text-[#4edea3]">{stats.totalReviewsDone} {isFr ? 'répétitions' : 'reviews'}</span>
        </div>
      </div>

      {/* Time Machine Simulator Toolbar */}
      <div className="p-4 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <FastForward className="w-4 h-4 text-[#f59e0b]" />
          <div className="flex flex-col">
            <span className="font-mono font-bold text-white text-xs">
              {isFr ? 'Simulateur Temporel de Révision (Time Machine)' : 'Virtual Time Travel Simulator'}
            </span>
            <span className="text-[11px] text-[#89929b]">
              {isFr
                ? 'Testez en direct l\'apparition des révisions à J+1, J+3 et J+7 sans attendre plusieurs jours réels'
                : 'Instantly test due notifications at Day+1, Day+3, and Day+7 without waiting real calendar days'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => handleSimulateDays(1)}
            className="px-3 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#1b2b3f] transition-all cursor-pointer"
          >
            +1 {isFr ? 'jour (Erreurs dues)' : 'day (Errors due)'}
          </button>
          <button
            onClick={() => handleSimulateDays(3)}
            className="px-3 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#1b2b3f] transition-all cursor-pointer"
          >
            +3 {isFr ? 'jours (1ères réussites dues)' : 'days (1st success due)'}
          </button>
          <button
            onClick={() => handleSimulateDays(7)}
            className="px-3 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] border border-[#1b2b3f] transition-all cursor-pointer"
          >
            +7 {isFr ? 'jours (2èmes réussites dues)' : 'days (2nd success due)'}
          </button>

          {virtualOffset > 0 && (
            <button
              onClick={handleResetTime}
              className="px-3 py-1.5 rounded-lg bg-[#f43f5e]/15 hover:bg-[#f43f5e]/30 text-[#f43f5e] border border-[#f43f5e]/40 transition-all flex items-center gap-1.5 cursor-pointer font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFr ? 'Réinitialiser à Aujourd\'hui' : 'Reset to Today'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#89929b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isFr ? 'Rechercher une notion, code SQL, règle...' : 'Search concept, SQL code, rule...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] text-xs text-white placeholder-[#89929b] focus:outline-none focus:border-[#38bdf8]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Pillar filter */}
          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] text-xs text-[#d3e4fe] focus:outline-none focus:border-[#38bdf8]"
          >
            <option value="all">{isFr ? 'Tous les piliers' : 'All Pillars'}</option>
            <option value="sql">SQL</option>
            <option value="modelisation">{isFr ? 'Modélisation' : 'Modeling'}</option>
            <option value="transactions">Transactions</option>
            <option value="administration">Administration</option>
            <option value="indexes">Indexes</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] text-xs text-[#d3e4fe] focus:outline-none focus:border-[#38bdf8]"
          >
            <option value="all">{isFr ? 'Tous les statuts' : 'All Statuses'}</option>
            <option value="due">{isFr ? '⏰ Dues aujourd\'hui' : '⏰ Due Today'}</option>
            <option value="learning">{isFr ? '🔴 En apprentissage (1j)' : '🔴 Learning (1d)'}</option>
            <option value="review">{isFr ? '🟡 En révision (3j - 7j)' : '🟡 Review (3d - 7d)'}</option>
            <option value="mastered">{isFr ? '🟢 Maîtrisées (16j+)' : '🟢 Mastered (16d+)'}</option>
          </select>
        </div>
      </div>

      {/* Notions Data Table */}
      <div className="rounded-2xl bg-[#0b1c30] border border-[#1b2b3f] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#000f21] border-b border-[#1b2b3f] font-mono text-[10px] text-[#89929b] uppercase tracking-wider">
                <th className="py-3 px-4">{isFr ? 'Notion & Pilier' : 'Concept & Pillar'}</th>
                <th className="py-3 px-3">{isFr ? 'Maîtrise' : 'Mastery'}</th>
                <th className="py-3 px-3">{isFr ? 'Stabilité' : 'Stability'}</th>
                <th className="py-3 px-3">{isFr ? 'Difficulté' : 'Difficulty'}</th>
                <th className="py-3 px-3">{isFr ? 'Prochaine Révision' : 'Next Review'}</th>
                <th className="py-3 px-3">{isFr ? 'Succès / Échecs' : 'Success / Fail'}</th>
                <th className="py-3 px-3">{isFr ? 'Statut SM-2' : 'SM-2 Status'}</th>
                <th className="py-3 px-4 text-right">{isFr ? 'Action' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#102034]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#89929b]">
                    {isFr ? 'Aucune notion ne correspond à vos filtres.' : 'No concepts match your filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isDue = new Date(item.nextReviewAt).getTime() <= simulatedDate.getTime();
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#102034]/50 transition-colors"
                    >
                      {/* Title & Pillar */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#0284c7]/20 text-[#38bdf8] uppercase font-bold border border-[#0284c7]/40">
                              {item.pillar}
                            </span>
                            <span className="font-bold text-white text-xs">
                              {isFr ? item.titleFr : item.titleEn}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#89929b] line-clamp-1">
                            {isFr ? item.promptFr : item.promptEn}
                          </span>
                        </div>
                      </td>

                      {/* Mastery */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2 font-mono">
                          <div className="w-16 bg-[#102034] h-2 rounded-full overflow-hidden border border-[#1b2b3f]">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.mastery >= 85 ? 'bg-[#4edea3]' : item.mastery >= 50 ? 'bg-[#38bdf8]' : 'bg-[#f43f5e]'
                              }`}
                              style={{ width: `${item.mastery}%` }}
                            />
                          </div>
                          <span className="text-white font-bold text-xs">{item.mastery}%</span>
                        </div>
                      </td>

                      {/* Stability */}
                      <td className="py-3.5 px-3 font-mono">
                        <span className="text-[#4edea3] font-bold">
                          {item.stability} <span className="text-[10px] text-[#89929b] font-normal">{isFr ? 'jours' : 'days'}</span>
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3.5 px-3 font-mono">
                        <span className="text-[#f59e0b] font-bold">
                          {item.difficulty} <span className="text-[10px] text-[#89929b] font-normal">/10</span>
                        </span>
                      </td>

                      {/* Next Review */}
                      <td className="py-3.5 px-3 font-mono">
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${isDue ? 'text-[#f43f5e]' : 'text-[#89ceff]'}`}>
                            {formatNextReviewDelay(item.nextReviewAt, lang)}
                          </span>
                          <span className="text-[9px] text-[#89929b]">
                            Int. : {item.interval}j
                          </span>
                        </div>
                      </td>

                      {/* Success / Failure Count */}
                      <td className="py-3.5 px-3 font-mono">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[#4edea3] font-bold">+{item.successCount}</span>
                          <span className="text-[#89929b]">/</span>
                          <span className="text-[#f43f5e] font-bold">-{item.failureCount}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 font-mono">
                        {item.status === 'mastered' ? (
                          <span className="text-[10px] text-[#4edea3] font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {isFr ? 'Maîtrisé' : 'Mastered'}
                          </span>
                        ) : item.status === 'review' ? (
                          <span className="text-[10px] text-[#f59e0b] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {isFr ? 'En révision' : 'Review'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#f43f5e] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {isFr ? 'Apprentissage' : 'Learning'}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setTargetReviewItemId(item.id);
                            setIsRunnerOpen(true);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                            isDue
                              ? 'bg-[#38bdf8] hover:bg-[#0284c7] text-[#00223d] hover:text-white shadow-md'
                              : 'bg-[#102034] hover:bg-[#1b2b3f] text-[#89ceff]'
                          }`}
                        >
                          {isDue ? (isFr ? 'Réviser' : 'Review') : (isFr ? 'Revoir' : 'Replay')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
