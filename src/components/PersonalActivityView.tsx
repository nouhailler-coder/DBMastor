import React, { useState, useEffect } from 'react';
import {
  Activity,
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Zap,
  Sparkles,
  Cloud,
  RotateCcw,
  Terminal,
  ArrowUpRight,
  Check,
  XCircle,
  Filter,
  Award,
  Play,
  BookOpen
} from 'lucide-react';
import {
  loadUserStats,
  subscribeToStats,
  UserStatsData,
  initialWeeklyActivity,
  recordQuestionAttemptTelemetry,
  restoreDefaultUserStats
} from '../services/statsService';
import { NavigationTab } from '../types';
import type { User } from '../services/firebaseSyncService';

interface PersonalActivityViewProps {
  lang: 'fr' | 'en';
  onNavigate?: (tab: NavigationTab) => void;
  onOpenTargetedSession?: () => void;
  currentUser?: User | null;
  cloudSyncedCount?: number;
}

interface WeeklySessionHistoryItem {
  id: string;
  dayId: 'lun' | 'mar' | 'mer' | 'jeu' | 'ven';
  dayLabelFr: string;
  dayLabelEn: string;
  timeLabel: string;
  titleFr: string;
  titleEn: string;
  modeFr: string;
  modeEn: string;
  questionsCount: number;
  accuracy: number;
  avgTimeSeconds: number;
  deltaFr: string;
  deltaEn: string;
  accentColor: string;
}

const WEEKLY_SESSIONS: WeeklySessionHistoryItem[] = [
  {
    id: 'sess-ven-1',
    dayId: 'ven',
    dayLabelFr: 'Vendredi',
    dayLabelEn: 'Friday',
    timeLabel: '18:15',
    titleFr: 'Sprint CTE Récursives & Window Functions (PARTITION BY)',
    titleEn: 'Recursive CTEs & Window Functions Sprint (PARTITION BY)',
    modeFr: 'Apprentissage Adaptatif',
    modeEn: 'Adaptive Learning',
    questionsCount: 23,
    accuracy: 83,
    avgTimeSeconds: 30,
    deltaFr: '+14 % sur CTE & OVER()',
    deltaEn: '+14% on CTE & OVER()',
    accentColor: '#4edea3',
  },
  {
    id: 'sess-ven-2',
    dayId: 'ven',
    dayLabelFr: 'Vendredi',
    dayLabelEn: 'Friday',
    timeLabel: '09:30',
    titleFr: 'Séance Ciblée IA — Déjouer les pièges LEFT vs INNER JOIN',
    titleEn: 'Targeted AI Drill — Overcoming LEFT vs INNER JOIN Traps',
    modeFr: 'Séance Ciblée IA (10Q)',
    modeEn: 'Targeted AI Drill (10Q)',
    questionsCount: 10,
    accuracy: 80,
    avgTimeSeconds: 33,
    deltaFr: '+15 % sur JOIN',
    deltaEn: '+15% on JOIN',
    accentColor: '#38bdf8',
  },
  {
    id: 'sess-jeu-1',
    dayId: 'jeu',
    dayLabelFr: 'Jeudi',
    dayLabelEn: 'Thursday',
    timeLabel: '19:05',
    titleFr: 'Sous-requêtes Corrélées & Piège NOT IN avec NULL',
    titleEn: 'Correlated Subqueries & NOT IN with NULL Trap',
    modeFr: 'Quiz Chronométré',
    modeEn: 'Timed Quiz',
    questionsCount: 31,
    accuracy: 84,
    avgTimeSeconds: 30,
    deltaFr: '+13 % sur EXISTS / NOT IN',
    deltaEn: '+13% on EXISTS / NOT IN',
    accentColor: '#4edea3',
  },
  {
    id: 'sess-mer-1',
    dayId: 'mer',
    dayLabelFr: 'Mercredi',
    dayLabelEn: 'Wednesday',
    timeLabel: '20:10',
    titleFr: 'Consolidation GROUP BY, HAVING & Fonctions d\'Agrégation',
    titleEn: 'GROUP BY, HAVING & Aggregate Functions Consolidation',
    modeFr: 'Révision Ciblée',
    modeEn: 'Focused Review',
    questionsCount: 15,
    accuracy: 80,
    avgTimeSeconds: 31,
    deltaFr: '+11 % sur GROUP BY',
    deltaEn: '+11% on GROUP BY',
    accentColor: '#93ccff',
  },
  {
    id: 'sess-mar-1',
    dayId: 'mar',
    dayLabelFr: 'Mardi',
    dayLabelEn: 'Tuesday',
    timeLabel: '18:40',
    titleFr: 'Jointures ANSI Multi-Tables & Auto-Jointures (SELF JOIN)',
    titleEn: 'Multi-Table ANSI Joins & Self-Joins (SELF JOIN)',
    modeFr: 'Entraînement Examen',
    modeEn: 'Exam Drill',
    questionsCount: 27,
    accuracy: 81,
    avgTimeSeconds: 33,
    deltaFr: '+12 % sur SQL JOIN',
    deltaEn: '+12% on SQL JOIN',
    accentColor: '#38bdf8',
  },
  {
    id: 'sess-lun-1',
    dayId: 'lun',
    dayLabelFr: 'Lundi',
    dayLabelEn: 'Monday',
    timeLabel: '17:50',
    titleFr: 'Fondamentaux DQL : SELECT DISTINCT, COALESCE & Tri ORDER BY',
    titleEn: 'DQL Fundamentals: SELECT DISTINCT, COALESCE & ORDER BY Sorting',
    modeFr: 'Diagnostic Hebdo',
    modeEn: 'Weekly Diagnostic',
    questionsCount: 21,
    accuracy: 76,
    avgTimeSeconds: 35,
    deltaFr: '+8 % sur SELECT',
    deltaEn: '+8% on SELECT',
    accentColor: '#f59e0b',
  },
];

const SQL_WEEKLY_DELTAS = [
  {
    topic: 'SQL (Global)',
    lastWeek: 69,
    thisWeek: 81,
    delta: '+12 %',
    avgTime: '32 s',
    color: '#4edea3',
    highlight: true,
  },
  {
    topic: 'SELECT & Projections',
    lastWeek: 86,
    thisWeek: 94,
    delta: '+8 %',
    avgTime: '12 s',
    color: '#4edea3',
    highlight: false,
  },
  {
    topic: 'GROUP BY & HAVING',
    lastWeek: 70,
    thisWeek: 81,
    delta: '+11 %',
    avgTime: '24 s',
    color: '#38bdf8',
    highlight: false,
  },
  {
    topic: 'JOIN (INNER / LEFT)',
    lastWeek: 57,
    thisWeek: 72,
    delta: '+15 %',
    avgTime: '31 s',
    color: '#93ccff',
    highlight: false,
  },
  {
    topic: 'CTE & Récursivité',
    lastWeek: 44,
    thisWeek: 58,
    delta: '+14 %',
    avgTime: '47 s',
    color: '#f59e0b',
    highlight: false,
  },
];

export const PersonalActivityView: React.FC<PersonalActivityViewProps> = ({
  lang,
  onNavigate,
  onOpenTargetedSession,
  currentUser,
  cloudSyncedCount = 0,
}) => {
  const isFr = lang === 'fr';
  const [stats, setStats] = useState<UserStatsData>(loadUserStats);
  const [selectedDay, setSelectedDay] = useState<'all' | 'lun' | 'mar' | 'mer' | 'jeu' | 'ven'>('all');
  const [justSimulated, setJustSimulated] = useState(false);

  useEffect(() => {
    setStats(loadUserStats());
    const unsubscribe = subscribeToStats((updated) => {
      setStats(updated);
    });
    return unsubscribe;
  }, []);

  const weekly = stats.weeklyActivity || initialWeeklyActivity;
  const telemetryLogs = stats.attemptTelemetryLogs || [];

  const filteredSessions =
    selectedDay === 'all'
      ? WEEKLY_SESSIONS
      : WEEKLY_SESSIONS.filter((s) => s.dayId === selectedDay);

  const selectedDayObj =
    selectedDay === 'all'
      ? null
      : weekly.dailyProgression.find((d) => d.dayId === selectedDay) || null;

  const handleSimulateNewQuestion = () => {
    recordQuestionAttemptTelemetry({
      questionId: `q-sql-${Math.floor(100 + Math.random() * 900)}`,
      answer: 'SELECT dept_id, COUNT(*) FROM employees GROUP BY dept_id HAVING COUNT(*) > 5',
      isCorrect: true,
      timeSpent: 28,
      difficulty: 3,
      topic: 'GROUP BY',
      hintRequested: false,
    });
    setJustSimulated(true);
    setTimeout(() => setJustSimulated(false), 2000);
  };

  const handleResetToDefault = () => {
    restoreDefaultUserStats();
    setSelectedDay('all');
  };

  return (
    <div
      id="personal-activity-view"
      className="p-6 max-w-[1680px] mx-auto w-full flex flex-col gap-6 animate-fadeIn"
    >
      {/* Top Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-[#4edea3] bg-[#003824]/50 px-2.5 py-0.5 rounded-full border border-[#4edea3]/30 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              {isFr ? 'Historique Personnel' : 'Personal History'}
            </span>
            <span className="text-[#89929b] font-mono text-xs">•</span>
            <span className="font-mono text-xs text-[#89ceff] font-semibold">
              {isFr ? 'Mon activité — Cette semaine' : 'My Activity — This Week'}
            </span>
            {currentUser && (
              <>
                <span className="text-[#89929b] font-mono text-xs">•</span>
                <span className="font-mono text-[10px] text-[#4edea3] bg-[#102034] px-2 py-0.5 rounded border border-[#4edea3]/30 flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  Firestore Sync ({cloudSyncedCount})
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#d3e4fe] tracking-tight">
            {isFr ? 'Mon activité' : 'My Activity'}
          </h1>
          <p className="text-xs sm:text-sm text-[#bfc7d2] max-w-2xl">
            {isFr
              ? 'Suivi hebdomadaire de votre volume de questions, taux de réussite, vitesse de réponse et progression quotidienne sur SQL.'
              : 'Weekly tracking of your question volume, accuracy rate, response speed, and daily SQL progression.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="activity-simulate-attempt-btn"
            type="button"
            onClick={handleSimulateNewQuestion}
            className="px-3.5 py-2 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#89ceff] border border-[#26364a] font-mono text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#4edea3]" />
            <span>
              {justSimulated
                ? isFr
                  ? '✓ Question enregistrée (+1)'
                  : '✓ Question logged (+1)'
                : isFr
                ? '+ Simuler 1 question résolue'
                : '+ Simulate 1 solved question'}
            </span>
          </button>

          {weekly.questionsThisWeek !== 127 && (
            <button
              id="activity-reset-127-btn"
              type="button"
              onClick={handleResetToDefault}
              title={isFr ? 'Réinitialiser aux valeurs de référence (127 questions)' : 'Reset to reference values (127 questions)'}
              className="px-3 py-2 rounded-xl bg-[#0b1c30] hover:bg-[#1b2b3f] text-[#bfc7d2] border border-[#1b2b3f] font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFr ? 'Réf. 127Q' : 'Ref 127Q'}</span>
            </button>
          )}

          {onOpenTargetedSession && (
            <button
              id="activity-launch-targeted-btn"
              type="button"
              onClick={onOpenTargetedSession}
              className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center gap-2 border border-[#38bdf8]/40 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{isFr ? 'Lancer une séance ciblée (10Q)' : 'Start Targeted Session (10Q)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          HERO SECTION : EXACT "MON ACTIVITÉ / CETTE SEMAINE" LEDGER + VISUALS
         ===================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (7 cols): The Authentic "Mon activité — Cette semaine" Card */}
        <div
          id="mon-activite-cette-semaine-card"
          className="xl:col-span-7 bg-[#0b1c30] rounded-2xl border border-[#26364a] shadow-xl overflow-hidden flex flex-col justify-between"
        >
          {/* Card Top Bar */}
          <div className="px-6 py-4 bg-[#000f21] border-b border-[#1b2b3f] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0284c7]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight leading-none">
                  {isFr ? 'Mon activité' : 'My Activity'}
                </h2>
                <span className="font-mono text-xs text-[#38bdf8] font-bold mt-1 block">
                  {isFr ? 'Cette semaine' : 'This week'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#003824]/60 border border-[#4edea3]/40 font-mono text-xs font-bold text-[#4edea3] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#f59e0b]" />
                {weekly.currentStreakDays} {isFr ? 'jours actifs' : 'day streak'}
              </span>
            </div>
          </div>

          {/* Body: Structured Key-Value Table + ASCII / Visual Progression */}
          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            {/* 4 Key Metrics in Structured Ledger Format (Matching exact specification) */}
            <div className="bg-[#061322] rounded-xl border border-[#1b2b3f] p-5 font-mono">
              <div className="text-[11px] uppercase tracking-widest text-[#89929b] mb-3 font-bold flex items-center justify-between">
                <span>{isFr ? 'Bilan de la semaine' : 'Weekly Summary'}</span>
                <span className="text-[#4edea3]">● {isFr ? 'Temps réel' : 'Live'}</span>
              </div>

              <div className="divide-y divide-[#1b2b3f]/80 text-sm sm:text-base">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#bfc7d2] font-medium">
                    {isFr ? 'Questions' : 'Questions'}
                  </span>
                  <span
                    id="metric-weekly-questions"
                    className="text-white font-extrabold text-lg tracking-tight"
                  >
                    {weekly.questionsThisWeek}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#bfc7d2] font-medium">
                    {isFr ? 'Réussite' : 'Accuracy'}
                  </span>
                  <span
                    id="metric-weekly-accuracy"
                    className="text-[#4edea3] font-extrabold text-lg tracking-tight"
                  >
                    {weekly.accuracyThisWeek} %
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#bfc7d2] font-medium">
                    {isFr ? 'Temps moyen' : 'Average time'}
                  </span>
                  <span
                    id="metric-weekly-avg-time"
                    className="text-[#38bdf8] font-extrabold text-lg tracking-tight"
                  >
                    {weekly.avgTimeSecondsThisWeek} s
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#bfc7d2] font-medium">
                    {isFr ? 'Série actuelle' : 'Current streak'}
                  </span>
                  <span
                    id="metric-weekly-streak"
                    className="text-[#f59e0b] font-extrabold text-lg tracking-tight flex items-center gap-1.5"
                  >
                    <span>
                      {weekly.currentStreakDays} {isFr ? 'jours' : 'days'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Progression Section (Lun .. Ven with exact block bars ███████) */}
            <div className="bg-[#061322] rounded-xl border border-[#1b2b3f] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    {isFr ? 'Progression' : 'Progression'}
                  </h3>
                  <p className="text-[11px] text-[#89929b] font-mono mt-0.5">
                    {isFr
                      ? 'Cliquez sur un jour (Lun–Ven) pour inspecter le détail des sessions'
                      : 'Click a day (Mon–Fri) to inspect session details'}
                  </p>
                </div>
                {selectedDay !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay('all')}
                    className="text-[11px] font-mono text-[#38bdf8] hover:underline cursor-pointer"
                  >
                    {isFr ? 'Voir toute la semaine' : 'Show full week'}
                  </button>
                )}
              </div>

              <div className="space-y-2.5 font-mono">
                {weekly.dailyProgression.map((day) => {
                  const isSelected = selectedDay === day.dayId;
                  const blockString = '█'.repeat(day.blocksCount);
                  const widthPercent = Math.min(100, Math.round((day.blocksCount / 12) * 100));

                  return (
                    <button
                      key={day.dayId}
                      id={`progression-day-${day.dayId}`}
                      type="button"
                      onClick={() =>
                        setSelectedDay(selectedDay === day.dayId ? 'all' : day.dayId)
                      }
                      className={`w-full p-2.5 rounded-xl border transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#102034] border-[#38bdf8] shadow-sm'
                          : 'bg-[#0b1c30]/80 border-[#1b2b3f] hover:bg-[#102034]/70 hover:border-[#26364a]'
                      }`}
                    >
                      {/* Day Label + Block Bar (Exact visual requested: Lun     ███████) */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <span
                          className={`w-10 text-sm font-bold shrink-0 ${
                            isSelected ? 'text-[#38bdf8]' : 'text-[#d3e4fe]'
                          }`}
                        >
                          {isFr ? day.dayLabelFr : day.dayLabelEn}
                        </span>

                        {/* ASCII Block Bar + Visual Meter */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span
                            className="text-[#4edea3] text-sm sm:text-base tracking-tighter leading-none select-all font-mono"
                            aria-label={`${day.blocksCount} blocs`}
                          >
                            {blockString}
                          </span>
                          <div className="hidden md:block flex-1 h-2 bg-[#030d1a] rounded-full overflow-hidden max-w-[140px]">
                            <div
                              className="h-full bg-gradient-to-r from-[#0284c7] to-[#4edea3] rounded-full transition-all duration-300"
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Day Metrics Summary */}
                      <div className="flex items-center gap-3 text-xs shrink-0 self-end sm:self-center">
                        <span className="px-2 py-0.5 rounded bg-[#030d1a] text-[#d3e4fe] border border-[#1b2b3f] font-bold">
                          {day.questions} Q
                        </span>
                        <span className="text-[#4edea3] font-bold w-11 text-right">
                          {day.accuracy} %
                        </span>
                        <span className="text-[#89929b] w-10 text-right">
                          {day.avgTimeSeconds} s
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Highlight Quote Banner: « Depuis la semaine dernière : +12 % sur SQL » */}
            <div
              id="weekly-sql-delta-banner"
              className="p-4 rounded-xl bg-gradient-to-r from-[#003824]/80 via-[#042f2e]/80 to-[#0c2d48]/80 border border-[#4edea3]/50 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4edea3]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3] shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#4edea3] font-bold block">
                    {isFr ? 'Évolution Hebdomadaire Consolidée' : 'Consolidated Weekly Trend'}
                  </span>
                  <p className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    « {isFr ? weekly.deltaBannerFr : weekly.deltaBannerEn} »
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <span className="px-3 py-1 rounded-lg bg-[#002419] border border-[#4edea3]/40 font-mono text-xs font-extrabold text-[#4edea3] flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  +{weekly.deltaSqlPercent} % SQL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): 4 KPI Cards + Detailed SQL Weekly Delta Breakdown */}
        <div className="xl:col-span-5 flex flex-col gap-6 justify-between">
          {/* 4 Visual KPI Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#102034] p-4 rounded-2xl border border-[#1b2b3f] shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#89929b] uppercase font-bold">
                  {isFr ? 'Questions (Cette semaine)' : 'Questions (This week)'}
                </span>
                <BookOpen className="w-4 h-4 text-[#38bdf8]" />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {weekly.questionsThisWeek}
                </span>
                <span className="font-mono text-xs text-[#4edea3] font-bold">
                  +29 vs S-1
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#bfc7d2]">
                {isFr ? 'Moyenne : ~25 questions / jour' : 'Average: ~25 questions / day'}
              </span>
            </div>

            <div className="bg-[#102034] p-4 rounded-2xl border border-[#1b2b3f] shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#89929b] uppercase font-bold">
                  {isFr ? 'Réussite Hebdo' : 'Weekly Accuracy'}
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#4edea3] font-mono">
                  {weekly.accuracyThisWeek} %
                </span>
                <span className="font-mono text-xs text-[#4edea3] font-bold">
                  +12 %
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#bfc7d2]">
                {isFr ? 'Seuil examen officiel : 70 %' : 'Official exam pass mark: 70%'}
              </span>
            </div>

            <div className="bg-[#102034] p-4 rounded-2xl border border-[#1b2b3f] shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#89929b] uppercase font-bold">
                  {isFr ? 'Temps Moyen' : 'Average Time'}
                </span>
                <Clock className="w-4 h-4 text-[#38bdf8]" />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {weekly.avgTimeSecondsThisWeek} s
                </span>
                <span className="font-mono text-xs text-[#4edea3] font-bold">
                  -9 s vs S-1
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#bfc7d2]">
                {isFr ? 'Cible examen : ≤ 45 s / question' : 'Exam target: ≤ 45s / question'}
              </span>
            </div>

            <div className="bg-[#102034] p-4 rounded-2xl border border-[#1b2b3f] shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#89929b] uppercase font-bold">
                  {isFr ? 'Série Actuelle' : 'Current Streak'}
                </span>
                <Flame className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#f59e0b] font-mono">
                  {weekly.currentStreakDays} {isFr ? 'jours' : 'days'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#4edea3] font-semibold">
                {isFr ? 'Record personnel en cours 🔥' : 'Active personal record 🔥'}
              </span>
            </div>
          </div>

          {/* Detailed SQL Progression Card (+12 % sur SQL breakdown) */}
          <div className="bg-[#0b1c30] rounded-2xl border border-[#1b2b3f] p-5 shadow-lg flex-1 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b2b3f] pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold">
                  {isFr ? 'Comparatif Semaine S-1 → Cette Semaine' : 'Week-over-Week SQL Comparison'}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {isFr ? 'Détail du gain « +12 % sur SQL »' : 'Breakdown of "+12% on SQL" gain'}
                </h3>
              </div>
              <Award className="w-5 h-5 text-[#4edea3]" />
            </div>

            <div className="space-y-3">
              {SQL_WEEKLY_DELTAS.map((item) => (
                <div
                  key={item.topic}
                  className={`p-3 rounded-xl border ${
                    item.highlight
                      ? 'bg-[#102034] border-[#4edea3]/40'
                      : 'bg-[#061322] border-[#1b2b3f]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className={`font-bold ${item.highlight ? 'text-white' : 'text-[#d3e4fe]'}`}>
                      {item.topic}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#89929b]">
                        {item.lastWeek}% → <strong className="text-white">{item.thisWeek}%</strong>
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#003824] text-[#4edea3] font-extrabold text-[11px] border border-[#4edea3]/30">
                        {item.delta}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#030d1a] rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.thisWeek}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#061322] border border-[#1b2b3f] flex items-center justify-between text-xs">
              <span className="text-[#bfc7d2] font-mono">
                {isFr
                  ? 'Prochain palier recommandé : consolider CTE (58 % → 75 %)'
                  : 'Next recommended milestone: consolidate CTEs (58% → 75%)'}
              </span>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('exams')}
                  className="text-[#38bdf8] hover:underline font-mono font-bold flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                >
                  <span>{isFr ? 'S\'entraîner' : 'Practice'}</span>
                  <Play className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          HISTORIQUE DES SESSIONS DE LA SEMAINE (FILTRABLE PAR JOUR LUN..VEN)
         ===================================================================== */}
      <div className="bg-[#0b1c30] rounded-2xl border border-[#1b2b3f] p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2b3f] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#38bdf8]" />
              <h3 className="text-base font-bold text-white">
                {isFr
                  ? 'Journal détaillé des sessions de la semaine'
                  : 'Detailed Weekly Session Log'}
              </h3>
              {selectedDayObj && (
                <span className="px-2 py-0.5 rounded bg-[#0284c7]/20 border border-[#38bdf8]/40 font-mono text-xs text-[#38bdf8] font-bold">
                  {isFr ? selectedDayObj.fullDayFr : selectedDayObj.fullDayEn} ({selectedDayObj.questions} Q)
                </span>
              )}
            </div>
            <p className="text-xs text-[#89929b] mt-0.5">
              {isFr
                ? 'Historique complet des 127 questions réparties du Lundi au Vendredi.'
                : 'Complete history of the 127 questions completed from Monday to Friday.'}
            </p>
          </div>

          {/* Day Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDay('all')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                selectedDay === 'all'
                  ? 'bg-[#0284c7] text-white'
                  : 'bg-[#102034] text-[#bfc7d2] hover:bg-[#1b2b3f]'
              }`}
            >
              {isFr ? 'Tous (127Q)' : 'All (127Q)'}
            </button>
            {weekly.dailyProgression.map((d) => (
              <button
                key={d.dayId}
                type="button"
                onClick={() => setSelectedDay(d.dayId)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  selectedDay === d.dayId
                    ? 'bg-[#0284c7] text-white'
                    : 'bg-[#102034] text-[#bfc7d2] hover:bg-[#1b2b3f]'
                }`}
              >
                {isFr ? d.dayLabelFr : d.dayLabelEn} ({d.questions})
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((sess) => (
            <div
              key={sess.id}
              className="p-4 rounded-xl bg-[#102034] border border-[#1b2b3f] hover:border-[#26364a] transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#061322] text-[#38bdf8] border border-[#1b2b3f] font-bold">
                    {isFr ? sess.dayLabelFr : sess.dayLabelEn} • {sess.timeLabel}
                  </span>
                  <span className="text-[#4edea3] font-bold">
                    {isFr ? sess.deltaFr : sess.deltaEn}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">
                  {isFr ? sess.titleFr : sess.titleEn}
                </h4>
                <span className="inline-block font-mono text-[10px] text-[#89929b] uppercase">
                  {isFr ? sess.modeFr : sess.modeEn}
                </span>
              </div>

              <div className="pt-3 border-t border-[#1b2b3f] flex items-center justify-between font-mono text-xs">
                <span className="text-[#d3e4fe] font-bold">{sess.questionsCount} questions</span>
                <span className="text-[#4edea3] font-bold">
                  {sess.accuracy} % {isFr ? 'réussite' : 'accuracy'}
                </span>
                <span className="text-[#89ceff]">
                  {sess.avgTimeSeconds} s {isFr ? 'moy.' : 'avg'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          DERNIÈRES QUESTIONS RÉSOLUES (TÉLÉMÉTRIE INDIVIDUELLE)
         ===================================================================== */}
      <div className="bg-[#0b1c30] rounded-2xl border border-[#1b2b3f] p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2b3f] pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4edea3]" />
              <span>
                {isFr
                  ? 'Dernières tentatives enregistrées (Télémétrie temps réel)'
                  : 'Latest Recorded Attempts (Real-Time Telemetry)'}
              </span>
            </h3>
            <p className="text-xs text-[#89929b]">
              {isFr
                ? 'Chaque réponse met automatiquement à jour votre compteur hebdomadaire et votre synchronisation Firestore.'
                : 'Each answer automatically updates your weekly counter and Firestore synchronization.'}
            </p>
          </div>
          <span className="font-mono text-xs text-[#4edea3]">
            {telemetryLogs.length} {isFr ? 'entrées récentes' : 'recent entries'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-[#1b2b3f] text-[#89929b] text-[10px] uppercase">
                <th className="py-2.5 px-3">{isFr ? 'Statut' : 'Status'}</th>
                <th className="py-2.5 px-3">{isFr ? 'Sujet SQL' : 'SQL Topic'}</th>
                <th className="py-2.5 px-3">{isFr ? 'Question / Réponse' : 'Question / Answer'}</th>
                <th className="py-2.5 px-3">{isFr ? 'Temps' : 'Time'}</th>
                <th className="py-2.5 px-3">{isFr ? 'Difficulté' : 'Difficulty'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2b3f]/60">
              {telemetryLogs.slice(0, 8).map((log) => (
                <tr key={log.attemptId} className="hover:bg-[#102034]/60 transition-colors">
                  <td className="py-2.5 px-3">
                    {log.isCorrect ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#003824]/60 text-[#4edea3] border border-[#4edea3]/30 font-bold">
                        <Check className="w-3 h-3" /> OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ef4444]/15 text-[#ffb4ab] border border-[#ef4444]/30 font-bold">
                        <XCircle className="w-3 h-3" /> {isFr ? 'Erreur' : 'Miss'}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#38bdf8]">{log.topic}</td>
                  <td className="py-2.5 px-3 text-[#d3e4fe] truncate max-w-[320px]">
                    <span className="text-[#89929b] mr-2">[{log.questionId}]</span>
                    {log.answer}
                  </td>
                  <td className="py-2.5 px-3 text-white font-bold">{log.timeSpent} s</td>
                  <td className="py-2.5 px-3 text-[#f59e0b]">{'★'.repeat(log.difficulty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
