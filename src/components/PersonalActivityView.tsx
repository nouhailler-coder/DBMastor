import React, { useState, useEffect, useMemo } from 'react';
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
  Check,
  XCircle,
  Filter,
  Award,
  Play,
  BookOpen,
} from 'lucide-react';
import {
  loadUserStats,
  subscribeToStats,
  UserStatsData,
  initialEmptyWeeklyActivity,
  recordQuestionAttemptTelemetry,
  resetUserStats,
} from '../services/statsService';
import { NavigationTab } from '../types';
import type { User } from '../services/firebaseSyncService';
import { ShortSessionsWidget } from './ShortSessionsWidget';
import { ShortSessionMode } from '../data/shortSessionsData';

interface PersonalActivityViewProps {
  lang: 'fr' | 'en';
  onNavigate?: (tab: NavigationTab) => void;
  onOpenTargetedSession?: () => void;
  onStartShortSession?: (mode: ShortSessionMode) => void;
  currentUser?: User | null;
  cloudSyncedCount?: number;
}

export const PersonalActivityView: React.FC<PersonalActivityViewProps> = ({
  lang,
  onNavigate,
  onOpenTargetedSession,
  onStartShortSession,
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

  const weekly = stats.weeklyActivity || initialEmptyWeeklyActivity;
  const telemetryLogs = stats.attemptTelemetryLogs || [];
  const topicStats = stats.topicResponseStats || [];
  const hasRealActivity = weekly.questionsThisWeek > 0 || telemetryLogs.length > 0;

  const selectedDayObj =
    selectedDay === 'all'
      ? null
      : weekly.dailyProgression.find((d) => d.dayId === selectedDay) || null;

  const dayToJsDayMap: Record<'lun' | 'mar' | 'mer' | 'jeu' | 'ven', number[]> = {
    lun: [1],
    mar: [2],
    mer: [3],
    jeu: [4],
    ven: [5, 6, 0],
  };

  const filteredLogs = useMemo(() => {
    if (selectedDay === 'all') return telemetryLogs;
    const allowedDays = dayToJsDayMap[selectedDay];
    return telemetryLogs.filter((log) => {
      const parsed = new Date(log.timestamp);
      if (Number.isNaN(parsed.getTime())) return false;
      return allowedDays.includes(parsed.getDay());
    });
  }, [selectedDay, telemetryLogs]);

  const handleLogPracticeAttempt = () => {
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

  const handleResetActivity = () => {
    resetUserStats();
    setSelectedDay('all');
  };

  const activeDaysCount = weekly.dailyProgression.filter((d) => d.questions > 0).length || 1;
  const avgPerActiveDay = weekly.questionsThisWeek > 0
    ? Math.round(weekly.questionsThisWeek / activeDaysCount)
    : 0;

  return (
    <div
      id="personal-activity-view"
      className="p-4 sm:p-6 max-w-[1680px] mx-auto w-full flex flex-col gap-6 animate-fadeIn"
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
              ? 'Suivi hebdomadaire de votre volume réel de questions, taux de réussite, vitesse de réponse et progression SQL.'
              : 'Weekly tracking of your actual question volume, accuracy rate, response speed, and SQL progression.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="activity-simulate-attempt-btn"
            type="button"
            onClick={handleLogPracticeAttempt}
            className="px-3.5 py-2 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#89ceff] border border-[#26364a] font-mono text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#4edea3]" />
            <span>
              {justSimulated
                ? isFr
                  ? '✓ Question enregistrée (+1)'
                  : '✓ Question logged (+1)'
                : isFr
                ? '+ Enregistrer 1 exercice'
                : '+ Log 1 solved exercise'}
            </span>
          </button>

          {hasRealActivity && (
            <button
              id="activity-reset-btn"
              type="button"
              onClick={handleResetActivity}
              title={isFr ? 'Remettre les statistiques locales à zéro' : 'Reset local statistics to zero'}
              className="px-3 py-2 rounded-xl bg-[#0b1c30] hover:bg-[#1b2b3f] text-[#bfc7d2] border border-[#1b2b3f] font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFr ? 'Réinitialiser' : 'Reset'}</span>
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

      {/* SYSTÈME DE SESSIONS COURTES */}
      <ShortSessionsWidget
        lang={lang}
        compact
        onStartShortSession={(mode) => {
          if (onStartShortSession) {
            onStartShortSession(mode);
          } else {
            window.dispatchEvent(new CustomEvent('dbmastery:start_short_session', { detail: mode }));
          }
        }}
      />

      {/* HERO SECTION : MON ACTIVITÉ / CETTE SEMAINE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div
          id="mon-activite-cette-semaine-card"
          className="xl:col-span-7 bg-[#0b1c30] rounded-2xl border border-[#26364a] shadow-xl overflow-hidden flex flex-col justify-between"
        >
          <div className="px-6 py-4 bg-[#000f21] border-b border-[#1b2b3f] flex items-center justify-between gap-2">
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
                {weekly.currentStreakDays} {isFr ? 'jours actifs' : 'active days'}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            <div className="bg-[#061322] rounded-xl border border-[#1b2b3f] p-5 font-mono">
              <div className="text-[11px] uppercase tracking-widest text-[#89929b] mb-3 font-bold flex items-center justify-between">
                <span>{isFr ? 'Bilan de la semaine' : 'Weekly Summary'}</span>
                <span className="text-[#4edea3]">● {isFr ? 'Données réelles' : 'Real telemetry'}</span>
              </div>

              <div className="divide-y divide-[#1b2b3f]/80 text-sm sm:text-base">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#bfc7d2] font-medium">{isFr ? 'Questions' : 'Questions'}</span>
                  <span id="metric-weekly-questions" className="text-white font-extrabold text-lg tracking-tight">
                    {weekly.questionsThisWeek}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#bfc7d2] font-medium">{isFr ? 'Réussite' : 'Accuracy'}</span>
                  <span id="metric-weekly-accuracy" className="text-[#4edea3] font-extrabold text-lg tracking-tight">
                    {weekly.questionsThisWeek > 0 ? `${weekly.accuracyThisWeek} %` : '--'}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#bfc7d2] font-medium">{isFr ? 'Temps moyen' : 'Average time'}</span>
                  <span id="metric-weekly-avg-time" className="text-[#38bdf8] font-extrabold text-lg tracking-tight">
                    {weekly.questionsThisWeek > 0 ? `${weekly.avgTimeSecondsThisWeek} s` : '--'}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-[#bfc7d2] font-medium">{isFr ? 'Série actuelle' : 'Current streak'}</span>
                  <span id="metric-weekly-streak" className="text-[#f59e0b] font-extrabold text-lg tracking-tight flex items-center gap-1.5">
                    <span>
                      {weekly.currentStreakDays} {isFr ? 'jours' : 'days'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Progression Lun..Ven */}
            <div className="bg-[#061322] rounded-xl border border-[#1b2b3f] p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    {isFr ? 'Progression' : 'Progression'}
                  </h3>
                  <p className="text-[11px] text-[#89929b] font-mono mt-0.5">
                    {isFr
                      ? 'Cliquez sur un jour (Lun–Ven) pour filtrer les tentatives correspondantes'
                      : 'Click a day (Mon–Fri) to filter matching attempts'}
                  </p>
                </div>
                {selectedDay !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay('all')}
                    className="text-[11px] font-mono text-[#38bdf8] hover:underline cursor-pointer shrink-0"
                  >
                    {isFr ? 'Voir toute la semaine' : 'Show full week'}
                  </button>
                )}
              </div>

              <div className="space-y-2.5 font-mono">
                {weekly.dailyProgression.map((day) => {
                  const isSelected = selectedDay === day.dayId;
                  const blockString = day.blocksCount > 0 ? '█'.repeat(day.blocksCount) : '—';
                  const widthPercent = Math.min(100, Math.round((day.blocksCount / 12) * 100));

                  return (
                    <button
                      key={day.dayId}
                      id={`progression-day-${day.dayId}`}
                      type="button"
                      onClick={() => setSelectedDay(selectedDay === day.dayId ? 'all' : day.dayId)}
                      className={`w-full p-2.5 rounded-xl border transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#102034] border-[#38bdf8] shadow-sm'
                          : 'bg-[#0b1c30]/80 border-[#1b2b3f] hover:bg-[#102034]/70 hover:border-[#26364a]'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <span
                          className={`w-10 text-sm font-bold shrink-0 ${
                            isSelected ? 'text-[#38bdf8]' : 'text-[#d3e4fe]'
                          }`}
                        >
                          {isFr ? day.dayLabelFr : day.dayLabelEn}
                        </span>

                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span
                            className={`text-sm sm:text-base tracking-tighter leading-none font-mono ${
                              day.blocksCount > 0 ? 'text-[#4edea3]' : 'text-[#89929b]'
                            }`}
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

                      <div className="flex items-center gap-3 text-xs shrink-0 self-end sm:self-center">
                        <span className="px-2 py-0.5 rounded bg-[#030d1a] text-[#d3e4fe] border border-[#1b2b3f] font-bold">
                          {day.questions} Q
                        </span>
                        <span className="text-[#4edea3] font-bold w-11 text-right">
                          {day.questions > 0 ? `${day.accuracy} %` : '--'}
                        </span>
                        <span className="text-[#89929b] w-10 text-right">
                          {day.questions > 0 ? `${day.avgTimeSeconds} s` : '--'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Banner résumé hebdomadaire réel */}
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
                    {isFr ? 'Synthèse Hebdomadaire' : 'Weekly Synthesis'}
                  </span>
                  <p className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    {isFr ? weekly.deltaBannerFr : weekly.deltaBannerEn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): 4 KPI Cards + Topic Performance Breakdown */}
        <div className="xl:col-span-5 flex flex-col gap-6 justify-between">
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
              </div>
              <span className="font-mono text-[11px] text-[#bfc7d2]">
                {weekly.questionsThisWeek > 0
                  ? isFr
                    ? `Moyenne : ~${avgPerActiveDay} questions / jour actif`
                    : `Average: ~${avgPerActiveDay} questions / active day`
                  : isFr
                  ? 'Lancez un quiz pour démarrer'
                  : 'Start a quiz to track volume'}
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
                  {weekly.questionsThisWeek > 0 ? `${weekly.accuracyThisWeek} %` : '--'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#bfc7d2]">
                {isFr ? 'Seuil examen cible : 70 %' : 'Target exam threshold: 70%'}
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
                  {weekly.questionsThisWeek > 0 ? `${weekly.avgTimeSecondsThisWeek} s` : '--'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#bfc7d2]">
                {isFr ? 'Cible : ≤ 45 s / question' : 'Target: ≤ 45s / question'}
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
                {weekly.currentStreakDays > 0
                  ? isFr
                    ? 'Série active'
                    : 'Active streak'
                  : isFr
                  ? 'Prêt à démarrer'
                  : 'Ready to begin'}
              </span>
            </div>
          </div>

          {/* Performance par Sujet SQL issue des tentatives réelles */}
          <div className="bg-[#0b1c30] rounded-2xl border border-[#1b2b3f] p-5 shadow-lg flex-1 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b2b3f] pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold">
                  {isFr ? 'Performance par Domaine SQL' : 'SQL Topic Breakdown'}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {isFr ? 'Précision & Temps mesurés' : 'Measured Accuracy & Speed'}
                </h3>
              </div>
              <Award className="w-5 h-5 text-[#4edea3]" />
            </div>

            {topicStats.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#061322] border border-[#1b2b3f] text-center space-y-3">
                <p className="text-xs text-[#bfc7d2]">
                  {isFr
                    ? 'Aucune session SQL enregistrée pour le moment. Résolvez votre premier quiz ou exercice pour voir apparaître vos scores par notion.'
                    : 'No SQL sessions recorded yet. Solve your first quiz or exercise to see topic-level accuracy.'}
                </p>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('exams')}
                    className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isFr ? 'Démarrer un quiz' : 'Start a quiz'}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {topicStats.slice(0, 5).map((item) => (
                  <div
                    key={item.topic}
                    className="p-3 rounded-xl border bg-[#061322] border-[#1b2b3f]"
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="font-bold text-[#d3e4fe]">{item.topic}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#89929b]">{item.avgTimeSeconds} s</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#003824] text-[#4edea3] font-extrabold text-[11px] border border-[#4edea3]/30">
                          {item.accuracy} %
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[#030d1a] rounded-full overflow-hidden flex">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-[#4edea3]"
                        style={{ width: `${item.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DERNIÈRES TENTATIVES ENREGISTRÉES */}
      <div className="bg-[#0b1c30] rounded-2xl border border-[#1b2b3f] p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2b3f] pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4edea3]" />
              <span>
                {isFr
                  ? 'Dernières tentatives enregistrées'
                  : 'Latest Recorded Attempts'}
              </span>
              {selectedDayObj && (
                <span className="px-2 py-0.5 rounded bg-[#0284c7]/20 border border-[#38bdf8]/40 font-mono text-xs text-[#38bdf8] font-bold">
                  {isFr ? selectedDayObj.fullDayFr : selectedDayObj.fullDayEn}
                </span>
              )}
            </h3>
            <p className="text-xs text-[#89929b]">
              {isFr
                ? 'Chaque question résolue met automatiquement à jour votre progression et votre synchronisation cloud.'
                : 'Every solved question automatically updates your progression ledger.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#89929b]" />
            <span className="font-mono text-xs text-[#4edea3]">
              {filteredLogs.length} {isFr ? 'entrées' : 'entries'}
            </span>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#061322] border border-[#1b2b3f] text-center">
            <p className="text-xs text-[#bfc7d2]">
              {isFr
                ? 'Aucune tentative enregistrée pour cette sélection.'
                : 'No recorded attempts for this selection yet.'}
            </p>
          </div>
        ) : (
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
                {filteredLogs.slice(0, 10).map((log) => (
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
        )}
      </div>
    </div>
  );
};
