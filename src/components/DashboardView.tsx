import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cloud,
  Compass,
  Play,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { certificationTracks } from '../data/mockData';
import { ShortSessionMode } from '../data/shortSessionsData';
import { User } from '../services/firebaseSyncService';
import {
  getSavedInitialDiagnostic,
  InitialDiagnosticResult,
} from '../services/initialDiagnosticService';
import { getSpacedRepetitionStats } from '../services/spacedRepetitionService';
import {
  loadUserStats,
  subscribeToStats,
  UserStatsData,
} from '../services/statsService';
import {
  getFutureExamCountdown,
  loadUserPreferences,
  UserPreferences,
} from '../services/userPreferencesService';
import { CertificationTrackId, NavigationTab } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onSelectTrack: (id: CertificationTrackId) => void;
  selectedCert?: CertificationTrackId;
  lang: 'fr' | 'en';
  onOpenTargetedSession?: () => void;
  onStartShortSession?: (mode: ShortSessionMode) => void;
  onStartDailySession?: () => void;
  onOpenSpacedRunner?: () => void;
  onOpenOnboarding?: () => void;
  currentUser?: User | null;
  cloudSyncedCount?: number;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  selectedCert = 'oracle-1z0-071' as CertificationTrackId,
  lang,
  onOpenTargetedSession,
  onStartDailySession,
  onOpenSpacedRunner,
  onOpenOnboarding,
  currentUser,
  cloudSyncedCount = 0,
  onGoogleSignIn,
}) => {
  const isFr = lang === 'fr';
  const [stats, setStats] = useState<UserStatsData>(() => loadUserStats());
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadUserPreferences());
  const [diagnosticResult, setDiagnosticResult] = useState<InitialDiagnosticResult | null>(() =>
    getSavedInitialDiagnostic()
  );
  const [spacedStats, setSpacedStats] = useState(() =>
    getSpacedRepetitionStats(prefs.targetCert === null ? undefined : (prefs.targetCert ?? selectedCert))
  );

  useEffect(() => {
    const refreshPrefsAndDiag = () => {
      const nextPrefs = loadUserPreferences();
      setPrefs(nextPrefs);
      setDiagnosticResult(getSavedInitialDiagnostic());
      setSpacedStats(
        getSpacedRepetitionStats(
          nextPrefs.targetCert === null ? undefined : (nextPrefs.targetCert ?? selectedCert)
        )
      );
    };

    const unsubStats = subscribeToStats((updated) => {
      setStats(updated);
    });

    window.addEventListener('dbmastery:preferences_updated', refreshPrefsAndDiag);
    window.addEventListener('dbmastery:diagnostic_completed', refreshPrefsAndDiag);
    window.addEventListener('dbmastery:diagnostic_reset', refreshPrefsAndDiag);
    window.addEventListener('dbmastery:spaced_repetition_updated', refreshPrefsAndDiag);

    refreshPrefsAndDiag();

    return () => {
      unsubStats();
      window.removeEventListener('dbmastery:preferences_updated', refreshPrefsAndDiag);
      window.removeEventListener('dbmastery:diagnostic_completed', refreshPrefsAndDiag);
      window.removeEventListener('dbmastery:diagnostic_reset', refreshPrefsAndDiag);
      window.removeEventListener('dbmastery:spaced_repetition_updated', refreshPrefsAndDiag);
    };
  }, [selectedCert]);

  const isFreeSqlMode = prefs.targetCert === null && prefs.objective !== 'prepare_certification';
  const effectiveCertId = prefs.targetCert ?? selectedCert;
  const activeTrack =
    certificationTracks.find((t) => t.id === effectiveCertId) || certificationTracks[0];

  const firstName = useMemo(() => {
    const rawName = currentUser?.displayName?.trim();
    if (!rawName) return null;
    return rawName.split(/\s+/)[0];
  }, [currentUser?.displayName]);

  const greetingTitle = firstName
    ? isFr
      ? `Bonjour, ${firstName}`
      : `Hello, ${firstName}`
    : isFr
    ? 'Bienvenue sur DBMastery Studio'
    : 'Welcome to DBMastery Studio';

  const recentLogs = stats.attemptTelemetryLogs || [];
  const topicStats = stats.topicResponseStats || [];
  const hasRealSessions = stats.questionsAnswered > 0 || recentLogs.length > 0;

  // Compétences réellement maîtrisées (issues de l'activité réelle ou du diagnostic effectué)
  const masteredMetrics = useMemo(() => {
    if (topicStats.length > 0) {
      const mastered = topicStats.filter((t) => t.accuracy >= 80).length;
      return { mastered, evaluated: topicStats.length };
    }
    if (diagnosticResult) {
      const mastered = diagnosticResult.domainScores.filter((d) => d.score >= 80).length;
      return { mastered, evaluated: diagnosticResult.domainScores.length };
    }
    return { mastered: 0, evaluated: 0 };
  }, [diagnosticResult, topicStats]);

  // Point faible réel le plus prioritaire
  const weakestRealTopic = useMemo(() => {
    const weakTopics = topicStats
      .filter((t) => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy);
    if (weakTopics.length > 0) {
      return {
        label: weakTopics[0].topic,
        score: weakTopics[0].accuracy,
        source: 'practice' as const,
      };
    }
    if (diagnosticResult) {
      const weakDomains = diagnosticResult.domainScores
        .filter((d) => d.score < 70)
        .sort((a, b) => a.score - b.score);
      if (weakDomains.length > 0) {
        return {
          label: isFr ? weakDomains[0].nameFr : weakDomains[0].nameEn,
          score: weakDomains[0].score,
          source: 'diagnostic' as const,
        };
      }
    }
    return null;
  }, [diagnosticResult, isFr, topicStats]);

  const examCountdown = useMemo(
    () => (isFreeSqlMode ? null : getFutureExamCountdown(prefs.targetExamDate, lang)),
    [isFreeSqlMode, lang, prefs.targetExamDate]
  );

  // Bloc B — Action dominante unique
  const continueAction = useMemo(() => {
    if (prefs.lastActivity) {
      return {
        tab: prefs.lastActivity.tab,
        subtitle: isFr
          ? `Reprendre votre dernière activité : ${prefs.lastActivity.labelFr}`
          : `Resume your last activity: ${prefs.lastActivity.labelEn}`,
        ctaLabel: isFr ? 'Continuer mon apprentissage' : 'Continue my learning',
      };
    }
    if (isFreeSqlMode) {
      return {
        tab: 'sandbox' as NavigationTab,
        subtitle: isFr
          ? 'Pratiquez SQL en direct sur le schéma relationnel ou démarrez un quiz guidé.'
          : 'Practice live SQL queries on the relational schema or start a guided quiz.',
        ctaLabel: isFr ? 'Continuer mon apprentissage' : 'Continue my learning',
      };
    }
    return {
      tab: 'exams' as NavigationTab,
      subtitle: isFr
        ? `Lancez une session d'entraînement adaptée à votre objectif (${activeTrack.code}).`
        : `Start an adaptive training session aligned with your goal (${activeTrack.code}).`,
      ctaLabel: isFr ? 'Continuer mon apprentissage' : 'Continue my learning',
    };
  }, [activeTrack.code, isFr, isFreeSqlMode, prefs.lastActivity]);

  // Bloc C — Une seule recommandation pilotée par les données
  const recommendation = useMemo(() => {
    if (weakestRealTopic) {
      return {
        badge: isFr ? 'Priorité ciblée' : 'Targeted Priority',
        title: isFr
          ? `Consolider ${weakestRealTopic.label} (${weakestRealTopic.score}%)`
          : `Strengthen ${weakestRealTopic.label} (${weakestRealTopic.score}%)`,
        reason: isFr
          ? `Pourquoi ce choix : votre précision mesurée sur ${weakestRealTopic.label} est inférieure à 70 %.`
          : `Why this choice: your measured accuracy on ${weakestRealTopic.label} is currently below 70%.`,
        actionLabel: isFr ? 'Lancer une séance ciblée' : 'Start targeted drill',
        onLaunch: () => {
          if (onOpenTargetedSession) {
            onOpenTargetedSession();
          } else {
            onNavigate('exams');
          }
        },
      };
    }

    if (hasRealSessions && spacedStats.dueTodayCount > 0) {
      return {
        badge: isFr ? 'Répétition espacée SM-2' : 'SM-2 Spaced Repetition',
        title: isFr
          ? `${spacedStats.dueTodayCount} notion${spacedStats.dueTodayCount > 1 ? 's' : ''} à réviser aujourd'hui`
          : `${spacedStats.dueTodayCount} concept${spacedStats.dueTodayCount > 1 ? 's' : ''} due for review`,
        reason: isFr
          ? 'Pourquoi ce choix : ces notions arrivent à échéance de mémorisation optimale.'
          : 'Why this choice: these concepts have reached their optimal retention review window.',
        actionLabel: isFr ? 'Réviser maintenant' : 'Review now',
        onLaunch: () => {
          if (onOpenSpacedRunner) {
            onOpenSpacedRunner();
          } else {
            onNavigate('spaced_repetition');
          }
        },
      };
    }

    if (!diagnosticResult && !hasRealSessions) {
      return {
        badge: isFr ? 'Calibration optionnelle' : 'Optional Calibration',
        title: isFr
          ? 'Évaluation initiale des compétences (20 questions)'
          : 'Initial Skill Assessment (20 questions)',
        reason: isFr
          ? 'Pourquoi ce choix : calibrer votre niveau réel permet d’adapter vos prochains exercices sans partir de zéro.'
          : 'Why this choice: calibrating your baseline tailors upcoming exercises to your actual skill gaps.',
        actionLabel: isFr ? 'Évaluer mon niveau' : 'Assess my level',
        onLaunch: () => {
          window.dispatchEvent(new CustomEvent('dbmastery:open_initial_diagnostic'));
        },
      };
    }

    return {
      badge: isFr ? 'Entraînement du jour' : 'Daily Training',
      title: isFr
        ? 'Séance SQL progressive (15 questions)'
        : 'Progressive SQL Session (15 questions)',
      reason: isFr
        ? 'Pourquoi ce choix : entretenez vos réflexes SQL et complétez votre progression hebdomadaire.'
        : 'Why this choice: keep your SQL reflexes sharp and build your weekly learning streak.',
      actionLabel: isFr ? 'Démarrer la séance' : 'Start session',
      onLaunch: () => {
        if (onStartDailySession) {
          onStartDailySession();
        } else {
          onNavigate('exams');
        }
      },
    };
  }, [
    diagnosticResult,
    hasRealSessions,
    isFr,
    onNavigate,
    onOpenSpacedRunner,
    onOpenTargetedSession,
    onStartDailySession,
    spacedStats.dueTodayCount,
    weakestRealTopic,
  ]);

  return (
    <div
      id="dashboard-view-container"
      className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full flex flex-col gap-6"
    >
      {/* BLOC A — En-tête personnalisé */}
      <section
        id="dashboard-block-a-header"
        aria-label={isFr ? 'En-tête personnalisé' : 'Personalized Header'}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#1b2b3f]"
      >
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#102034] text-[#93ccff] font-mono text-[11px] font-semibold border border-[#26364a]">
              <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
              {isFreeSqlMode
                ? isFr
                  ? 'Objectif : Apprendre SQL sans certification'
                  : 'Goal: Learn SQL without certification'
                : isFr
                ? `Objectif : ${activeTrack.name} (${activeTrack.code})`
                : `Goal: ${activeTrack.name} (${activeTrack.code})`}
            </span>

            {onOpenOnboarding && (
              <button
                type="button"
                onClick={onOpenOnboarding}
                className="text-xs font-mono text-[#89ceff] hover:underline cursor-pointer px-1.5 py-0.5 rounded focus-visible:outline-2 focus-visible:outline-[#38bdf8]"
              >
                {isFr ? 'Ajuster' : 'Adjust'}
              </button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#d3e4fe]">
            {greetingTitle}
          </h1>
          <p className="text-sm text-[#bfc7d2] max-w-2xl">
            {hasRealSessions
              ? isFr
                ? 'Retrouvez votre progression réelle et poursuivez votre entraînement SQL en un clic.'
                : 'Review your real progress and resume your SQL training in one click.'
              : isFr
              ? 'Votre espace est prêt. Lancez une première activité pour suivre votre progression SQL.'
              : 'Your studio is ready. Start a first activity to begin tracking your SQL mastery.'}
          </p>
        </div>

        {/* Statut auth / sync discret */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#102034] border border-[#1b2b3f] text-xs font-mono text-[#bfc7d2]">
              <Cloud className="w-3.5 h-3.5 text-[#4edea3]" />
              <span>
                {isFr ? 'Sync Cloud' : 'Cloud Sync'} ({cloudSyncedCount})
              </span>
            </div>
          ) : (
            onGoogleSignIn && (
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] border border-[#26364a] text-xs font-semibold text-[#d3e4fe] transition-colors cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>{isFr ? 'Synchroniser mon compte' : 'Sync account'}</span>
              </button>
            )
          )}
        </div>
      </section>

      {/* BLOC B — Carte CTA dominante unique */}
      <section
        id="dashboard-block-b-cta"
        aria-label={isFr ? 'Action principale' : 'Primary Action'}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c2438] via-[#102034] to-[#0b1c30] border border-[#3198dc]/50 p-6 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex flex-col gap-2 max-w-2xl">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#4edea3]">
            {prefs.lastActivity
              ? isFr
                ? 'Reprise rapide'
                : 'Quick Resume'
              : isFr
              ? 'Prochaine étape'
              : 'Next Step'}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {continueAction.ctaLabel}
          </h2>
          <p className="text-sm text-[#bfc7d2] leading-relaxed">{continueAction.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            id="dashboard-primary-continue-btn"
            type="button"
            onClick={() => onNavigate(continueAction.tab)}
            className="px-6 py-3.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm shadow-lg shadow-[#0284c7]/25 transition-all active:scale-[0.99] inline-flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{continueAction.ctaLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* BLOC C — Prochaine session recommandée (1 seule carte) */}
      <section
        id="dashboard-block-c-recommendation"
        aria-label={isFr ? 'Session recommandée' : 'Recommended Session'}
        className="rounded-2xl bg-[#0b1c30] border border-[#1b2b3f] p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#102034] border border-[#26364a] flex items-center justify-center text-[#38bdf8] shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">
              {recommendation.badge}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#d3e4fe]">
              {recommendation.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#bfc7d2] leading-relaxed">
              {recommendation.reason}
            </p>
          </div>
        </div>

        <button
          id="dashboard-recommended-session-btn"
          type="button"
          onClick={recommendation.onLaunch}
          className="px-4 py-2.5 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#26364a] font-semibold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <span>{recommendation.actionLabel}</span>
          <ChevronRight className="w-4 h-4 text-[#38bdf8]" />
        </button>
      </section>

      {/* BLOC D — Progression réelle (4 indicateurs max) */}
      <section
        id="dashboard-block-d-metrics"
        aria-label={isFr ? 'Indicateurs de progression' : 'Progress Indicators'}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* 1. Précision réelle */}
        <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Précision globale' : 'Overall Accuracy'}
            </span>
            <TrendingUp className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#d3e4fe] font-mono">
            {hasRealSessions ? `${stats.overallAccuracy}%` : '--'}
          </div>
          <span className="text-xs text-[#bfc7d2]">
            {hasRealSessions
              ? isFr
                ? `${stats.questionsAnswered} question${stats.questionsAnswered > 1 ? 's' : ''} résolue${stats.questionsAnswered > 1 ? 's' : ''}`
                : `${stats.questionsAnswered} question${stats.questionsAnswered > 1 ? 's' : ''} answered`
              : isFr
              ? 'Aucune session enregistrée'
              : 'No sessions recorded yet'}
          </span>
        </div>

        {/* 2. Compétences maîtrisées */}
        <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Compétences maîtrisées' : 'Mastered Skills'}
            </span>
            <ShieldCheck className="w-4 h-4 text-[#93ccff]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#d3e4fe] font-mono">
            {masteredMetrics.evaluated > 0
              ? `${masteredMetrics.mastered} / ${masteredMetrics.evaluated}`
              : '0'}
          </div>
          <span className="text-xs text-[#bfc7d2]">
            {masteredMetrics.evaluated > 0
              ? isFr
                ? 'Seuil de maîtrise ≥ 80 %'
                : 'Mastery threshold ≥ 80%'
              : isFr
              ? 'Évaluation initiale à réaliser'
              : 'No skills evaluated yet'}
          </span>
        </div>

        {/* 3. Révisions SM-2 dues */}
        <button
          type="button"
          onClick={() => onNavigate('spaced_repetition')}
          className="text-left bg-[#102034] hover:bg-[#12253c] p-4 rounded-xl border border-[#1b2b3f] flex flex-col justify-between gap-2 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Révisions SM-2 dues' : 'SM-2 Due Reviews'}
            </span>
            <RefreshCw className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#d3e4fe] font-mono">
            {spacedStats.dueTodayCount}
          </div>
          <span className="text-xs text-[#89ceff]">
            {isFr ? 'Ouvrir les révisions →' : 'Open reviews →'}
          </span>
        </button>

        {/* 4. Objectif / Échéance réelle */}
        <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFreeSqlMode
                ? isFr
                  ? 'Mode actif'
                  : 'Active Mode'
                : isFr
                ? 'Échéance examen'
                : 'Exam Target'}
            </span>
            {isFreeSqlMode ? (
              <BookOpen className="w-4 h-4 text-[#4edea3]" />
            ) : (
              <Calendar className="w-4 h-4 text-[#f59e0b]" />
            )}
          </div>

          {isFreeSqlMode ? (
            <>
              <div className="text-xl font-extrabold text-[#d3e4fe]">
                {isFr ? 'SQL Libre' : 'Free SQL'}
              </div>
              <span className="text-xs text-[#bfc7d2]">
                {isFr ? 'Apprentissage sans certification' : 'Learning without certification'}
              </span>
            </>
          ) : examCountdown ? (
            <>
              <div className="text-xl font-extrabold text-[#d3e4fe] font-mono">
                {isFr ? `J-${examCountdown.daysRemaining}` : `D-${examCountdown.daysRemaining}`}
              </div>
              <span className="text-xs text-[#bfc7d2]">
                {examCountdown.formattedDate} • {activeTrack.code}
              </span>
            </>
          ) : (
            <>
              <div className="text-xl font-extrabold text-[#d3e4fe] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#93ccff]" />
                <span>{activeTrack.code}</span>
              </div>
              <span className="text-xs text-[#bfc7d2]">
                {isFr ? 'Aucune échéance planifiée' : 'No exam date set'}
              </span>
            </>
          )}
        </div>
      </section>

      {/* BLOC E — Activité récente (compacte) */}
      <section
        id="dashboard-block-e-activity"
        aria-label={isFr ? 'Activité récente' : 'Recent Activity'}
        className="rounded-2xl bg-[#0b1c30] border border-[#1b2b3f] p-5 sm:p-6 shadow-md flex flex-col gap-4"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#1b2b3f] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#38bdf8]" />
            <h3 className="text-base font-bold text-[#d3e4fe]">
              {isFr ? 'Activité récente' : 'Recent Activity'}
            </h3>
          </div>
          <button
            id="dashboard-open-activity-page-btn"
            type="button"
            onClick={() => onNavigate('activity')}
            className="text-xs font-mono font-semibold text-[#38bdf8] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{isFr ? 'Voir tout l\'historique' : 'View full history'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-[#bfc7d2]">
              {isFr
                ? 'Aucune session récente pour le moment. Vos prochains quiz et exercices SQL apparaîtront ici.'
                : 'No recent activity yet. Your upcoming SQL quizzes and lab exercises will appear here.'}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('sandbox')}
              className="px-3.5 py-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] border border-[#26364a] text-xs font-semibold text-[#89ceff] shrink-0 cursor-pointer"
            >
              {isFr ? 'Ouvrir le Lab SQL' : 'Open SQL Lab'}
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-[#1b2b3f]">
            {recentLogs.slice(0, 5).map((log) => (
              <li
                key={log.attemptId}
                className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {log.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-[#4edea3] shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#ffb4ab] shrink-0" />
                  )}
                  <span className="px-2 py-0.5 rounded bg-[#102034] text-[#38bdf8] font-bold shrink-0">
                    {log.topic}
                  </span>
                  <span className="text-[#d3e4fe] truncate">{log.answer}</span>
                </div>
                <span className="text-[#89929b] shrink-0">{log.timeSpent} s</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
