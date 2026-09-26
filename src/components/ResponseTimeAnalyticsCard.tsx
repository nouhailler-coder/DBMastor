import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Brain,
  AlertTriangle,
  HelpCircle,
  Terminal,
  Play,
  RotateCcw,
  Sliders,
  Activity,
  ChevronRight,
  Sparkles,
  Database
} from 'lucide-react';
import {
  loadUserStats,
  subscribeToStats,
  recordQuestionAttemptTelemetry,
  restoreDefaultUserStats,
  UserStatsData
} from '../services/statsService';
import { TopicResponseTimeStat, QuestionAttemptTelemetry, PedagogicalSpeedProfile } from '../types';

interface ResponseTimeAnalyticsCardProps {
  lang: 'fr' | 'en';
  compact?: boolean;
  onOpenTargetedSession?: () => void;
  onNavigateToStats?: () => void;
}

export const ResponseTimeAnalyticsCard: React.FC<ResponseTimeAnalyticsCardProps> = ({
  lang,
  compact = false,
  onOpenTargetedSession,
  onNavigateToStats,
}) => {
  const isFr = lang === 'fr';
  const [stats, setStats] = useState<UserStatsData>(loadUserStats);
  const [selectedTopic, setSelectedTopic] = useState<string>('CTE');
  const [showAllTopics, setShowAllTopics] = useState<boolean>(!compact);
  const [activeTab, setActiveTab] = useState<'matrix' | 'telemetry' | 'adaptive'>('matrix');
  const [simTopic, setSimTopic] = useState<'SELECT' | 'JOIN' | 'GROUP BY' | 'CTE'>('CTE');
  const [simTime, setSimTime] = useState<number>(48);
  const [simCorrect, setSimCorrect] = useState<boolean>(false);
  const [simHint, setSimHint] = useState<boolean>(true);
  const [justRecordedId, setJustRecordedId] = useState<string | null>(null);

  useEffect(() => {
    setStats(loadUserStats());
    const unsub = subscribeToStats((updated) => {
      setStats(updated);
    });
    return unsub;
  }, []);

  const allTopicStats: TopicResponseTimeStat[] = stats.topicResponseStats || [];
  // Les 4 sujets prioritaires de la spécification : SELECT, JOIN, GROUP BY, CTE
  const coreTopicsOrder = ['SELECT', 'JOIN', 'GROUP BY', 'CTE'];
  const displayedTopics = showAllTopics
    ? allTopicStats
    : allTopicStats.filter((t) => coreTopicsOrder.includes(t.topic.toUpperCase()));

  const telemetryLogs: QuestionAttemptTelemetry[] = stats.attemptTelemetryLogs || [];
  const activeTopicDetail =
    allTopicStats.find((t) => t.topic.toUpperCase() === selectedTopic.toUpperCase()) ||
    allTopicStats[0];

  const getProfileBadge = (profile: PedagogicalSpeedProfile) => {
    switch (profile) {
      case 'reflex_mastery':
        return {
          labelFr: 'Automatisme Réflexe',
          labelEn: 'Reflex Mastery',
          color: '#4edea3',
          bg: 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30',
        };
      case 'operational_steady':
        return {
          labelFr: 'Maîtrise Opérationnelle',
          labelEn: 'Operational Steady',
          color: '#38bdf8',
          bg: 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30',
        };
      case 'hesitant_analytic':
        return {
          labelFr: 'Hésitation Analytique',
          labelEn: 'Analytical Hesitation',
          color: '#f59e0b',
          bg: 'bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30',
        };
      case 'cognitive_overload':
        return {
          labelFr: 'Surcharge Cognitive',
          labelEn: 'Cognitive Overload',
          color: '#f43f5e',
          bg: 'bg-[#f43f5e]/15 text-[#fb7185] border-[#f43f5e]/30',
        };
      case 'impulsive_trap':
        return {
          labelFr: 'Impulsivité / Piège',
          labelEn: 'Impulsive / Trap',
          color: '#ec4899',
          bg: 'bg-[#ec4899]/15 text-[#f472b6] border-[#ec4899]/30',
        };
    }
  };

  const handleSimulateAttempt = () => {
    const difficultyMap: Record<string, number> = {
      SELECT: 2,
      JOIN: 3,
      'GROUP BY': 3,
      CTE: 4,
    };
    const recorded = recordQuestionAttemptTelemetry({
      questionId: `q-${simTopic.toLowerCase().replace(/\s+/g, '')}-${Math.floor(10 + Math.random() * 89)}`,
      answer: simCorrect ? 'Option A (Syntaxe valide)' : 'Option C (Piège conceptuel)',
      isCorrect: simCorrect,
      timeSpent: simTime,
      difficulty: difficultyMap[simTopic] || 3,
      topic: simTopic,
      hintRequested: simHint,
    });
    setSelectedTopic(simTopic);
    setJustRecordedId(recorded.attemptId);
    setTimeout(() => setJustRecordedId(null), 3000);
  };

  return (
    <div
      id="response-time-analytics-card"
      className="bg-[#102034] p-5 rounded-xl border border-[#3198dc]/40 shadow-lg flex flex-col gap-4 relative overflow-hidden"
    >
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2b3f]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#4edea3] text-[#002c47] flex items-center justify-center shrink-0 shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/30">
                {isFr ? 'Indicateur Pédagogique Adaptatif' : 'Adaptive Pedagogical Indicator'}
              </span>
              <span className="font-mono text-[10px] text-[#4edea3] flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {isFr ? 'Précision × Temps × Demandes d\'aide' : 'Accuracy × Time × Help Requests'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#d3e4fe] mt-0.5">
              {isFr
                ? 'Statistiques de Temps de Réponse & Exactitude par Sujet'
                : 'Response Time & Accuracy Statistics by Topic'}
            </h3>
          </div>
        </div>

        {/* Navigation interne des onglets */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#000f21] border border-[#1b2b3f] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
              activeTab === 'matrix'
                ? 'bg-[#102034] text-[#38bdf8] border border-[#3198dc]/40 shadow-sm'
                : 'text-[#89929b] hover:text-[#d3e4fe]'
            }`}
          >
            {isFr ? 'Exactitude & Temps' : 'Accuracy & Time'}
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
              activeTab === 'telemetry'
                ? 'bg-[#102034] text-[#4edea3] border border-[#4edea3]/40 shadow-sm'
                : 'text-[#89929b] hover:text-[#d3e4fe]'
            }`}
          >
            {isFr ? `Journal (${telemetryLogs.length})` : `Telemetry (${telemetryLogs.length})`}
          </button>
          {!compact && (
            <button
              onClick={() => setActiveTab('adaptive')}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all ${
                activeTab === 'adaptive'
                  ? 'bg-[#102034] text-[#fbbf24] border border-[#f59e0b]/40 shadow-sm'
                  : 'text-[#89929b] hover:text-[#d3e4fe]'
              }`}
            >
              {isFr ? 'Simulateur Adaptatif' : 'Adaptive Simulator'}
            </button>
          )}
        </div>
      </div>

      {/* ONGLET 1 : TABLEAU EXACTITUDE / TEMPS MOYEN & ANALYSE PÉDAGOGIQUE */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* TABLEAU EXACT DEMANDÉ : SELECT 94% 12s / JOIN 72% 31s / GROUP BY 81% 24s / CTE 58% 47s */}
          <div className={compact ? 'lg:col-span-12 flex flex-col gap-3' : 'lg:col-span-7 flex flex-col gap-3'}>
            <div className="rounded-xl bg-[#000f21] border border-[#1b2b3f] overflow-hidden shadow-inner">
              {/* En-tête de table */}
              <div className="grid grid-cols-12 px-4 py-2.5 bg-[#0b1c30] border-b border-[#1b2b3f] font-mono text-[11px] font-bold text-[#93ccff] uppercase tracking-wider">
                <div className="col-span-4">{isFr ? 'Sujet SQL' : 'SQL Topic'}</div>
                <div className="col-span-3 text-right">{isFr ? 'Exactitude' : 'Accuracy'}</div>
                <div className="col-span-3 text-right">{isFr ? 'Temps moyen' : 'Avg Time'}</div>
                <div className="col-span-2 text-right hidden sm:block">{isFr ? 'Aide' : 'Help'}</div>
              </div>

              {/* Lignes de données */}
              <div className="divide-y divide-[#1b2b3f]/60 font-mono text-xs">
                {displayedTopics.map((row) => {
                  const isSelected = row.topic.toUpperCase() === selectedTopic.toUpperCase();
                  const accuracyColor =
                    row.accuracy >= 85
                      ? '#4edea3'
                      : row.accuracy >= 70
                      ? '#38bdf8'
                      : row.accuracy >= 60
                      ? '#fbbf24'
                      : '#fb7185';

                  const timeColor =
                    row.avgTimeSeconds <= 15
                      ? '#4edea3'
                      : row.avgTimeSeconds <= 28
                      ? '#38bdf8'
                      : row.avgTimeSeconds <= 35
                      ? '#fbbf24'
                      : '#fb7185';

                  return (
                    <div
                      key={row.topic}
                      onClick={() => setSelectedTopic(row.topic)}
                      className={`grid grid-cols-12 items-center px-4 py-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#12253c] border-l-2 border-l-[#38bdf8]'
                          : 'hover:bg-[#0b1c30]/80'
                      }`}
                    >
                      {/* Topic */}
                      <div className="col-span-4 flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: accuracyColor }}
                        />
                        <span className="font-bold text-[#d3e4fe] tracking-wide">{row.topic}</span>
                      </div>

                      {/* Exactitude */}
                      <div className="col-span-3 flex items-center justify-end gap-2">
                        <div className="w-14 bg-[#102034] h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${row.accuracy}%`, backgroundColor: accuracyColor }}
                          />
                        </div>
                        <span className="font-extrabold text-sm" style={{ color: accuracyColor }}>
                          {row.accuracy} %
                        </span>
                      </div>

                      {/* Temps moyen */}
                      <div className="col-span-3 text-right">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-extrabold text-sm"
                          style={{
                            color: timeColor,
                            backgroundColor: `${timeColor}15`,
                          }}
                        >
                          {row.avgTimeSeconds} s
                        </span>
                      </div>

                      {/* Taux de demande d'aide */}
                      <div className="col-span-2 text-right hidden sm:block">
                        <span
                          className={`text-[11px] font-semibold ${
                            row.helpRequestsRate >= 30
                              ? 'text-[#fb7185]'
                              : row.helpRequestsRate >= 15
                              ? 'text-[#fbbf24]'
                              : 'text-[#89929b]'
                          }`}
                        >
                          {row.helpRequestsRate}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Barre d'actions sous la table */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <button
                onClick={() => setShowAllTopics(!showAllTopics)}
                className="font-mono text-[11px] text-[#89ceff] hover:underline flex items-center gap-1"
              >
                <span>
                  {showAllTopics
                    ? isFr
                      ? 'Afficher les 4 sujets clés (SELECT, JOIN, GROUP BY, CTE)'
                      : 'Show core 4 topics (SELECT, JOIN, GROUP BY, CTE)'
                    : isFr
                    ? `Voir tous les sujets (${allTopicStats.length})`
                    : `Show all topics (${allTopicStats.length})`}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {compact && onNavigateToStats && (
                <button
                  onClick={onNavigateToStats}
                  className="font-mono text-[11px] text-[#4edea3] hover:underline font-bold flex items-center gap-1"
                >
                  <span>{isFr ? 'Ouvrir l\'analyse complète' : 'Open full analytics'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* PANNEAU DE DROITE : INTERPRÉTATION ADAPTATIVE DU SUJET SÉLECTIONNÉ */}
          {activeTopicDetail && (
            <div
              className={
                compact
                  ? 'lg:col-span-12 p-4 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-3'
                  : 'lg:col-span-5 p-4 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex flex-col justify-between gap-3.5'
              }
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#38bdf8]" />
                    <span className="font-mono text-xs font-extrabold text-[#d3e4fe]">
                      {isFr ? `Diagnostic : ${activeTopicDetail.topic}` : `Diagnosis: ${activeTopicDetail.topic}`}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                      getProfileBadge(activeTopicDetail.profile).bg
                    }`}
                  >
                    {isFr
                      ? getProfileBadge(activeTopicDetail.profile).labelFr
                      : getProfileBadge(activeTopicDetail.profile).labelEn}
                  </span>
                </div>

                {/* Métriques croisées : Exactitude + Temps moyen + Demandes d'aide */}
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <div className="p-2 rounded-lg bg-[#000f21] border border-[#1b2b3f] flex flex-col">
                    <span className="text-[9px] text-[#89929b] uppercase">
                      {isFr ? 'Exactitude' : 'Accuracy'}
                    </span>
                    <span className="text-sm font-extrabold text-[#d3e4fe]">
                      {activeTopicDetail.accuracy} %
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#000f21] border border-[#1b2b3f] flex flex-col">
                    <span className="text-[9px] text-[#89929b] uppercase">
                      {isFr ? 'Temps Moyen' : 'Avg Time'}
                    </span>
                    <span className="text-sm font-extrabold text-[#38bdf8]">
                      {activeTopicDetail.avgTimeSeconds} s{' '}
                      <span className="text-[10px] font-normal text-[#89929b]">
                        / {activeTopicDetail.targetTimeSeconds}s
                      </span>
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#000f21] border border-[#1b2b3f] flex flex-col">
                    <span className="text-[9px] text-[#89929b] uppercase">
                      {isFr ? 'Aide / Indices' : 'Help Used'}
                    </span>
                    <span className="text-sm font-extrabold text-[#fbbf24]">
                      {activeTopicDetail.helpRequestsRate} %
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#bfc7d2] leading-relaxed">
                  {isFr ? activeTopicDetail.diagnosticFr : activeTopicDetail.diagnosticEn}
                </p>

                {/* Ajustement automatique de l'exercice par le moteur adaptatif */}
                <div className="p-2.5 rounded-lg bg-[#0284c7]/10 border border-[#0284c7]/30 flex items-start gap-2">
                  <Sliders className="w-3.5 h-3.5 text-[#38bdf8] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5 text-[11px]">
                    <span className="font-mono font-bold text-[#38bdf8] uppercase text-[10px]">
                      {isFr ? 'Ajustement Adaptatif des Exercices :' : 'Adaptive Exercise Adjustment:'}
                    </span>
                    <span className="text-[#d3e4fe] font-medium">
                      {isFr ? activeTopicDetail.adaptiveActionFr : activeTopicDetail.adaptiveActionEn}
                    </span>
                  </div>
                </div>
              </div>

              {onOpenTargetedSession && (
                <button
                  onClick={onOpenTargetedSession}
                  className="w-full py-2 px-3 rounded-lg bg-[#3198dc] hover:bg-[#93ccff] text-[#002c47] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {isFr
                      ? `Adapter l'entraînement sur ${activeTopicDetail.topic}`
                      : `Adapt practice for ${activeTopicDetail.topic}`}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ONGLET 2 : JOURNAL DE TÉLÉMÉTRIE BRUTE (questionId, attemptId, answer, isCorrect, timeSpent, difficulty, topic, timestamp) */}
      {activeTab === 'telemetry' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Schéma JSON stocké */}
            <div className="lg:col-span-5 p-3.5 rounded-xl bg-[#000f21] border border-[#1b2b3f] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-[#4edea3] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  {isFr ? 'Structure d\'Enregistrement (Télémétrie)' : 'Stored Telemetry Record Schema'}
                </span>
                <span className="font-mono text-[10px] text-[#89929b]">localStorage + State</span>
              </div>
              <pre className="font-mono text-[11px] text-[#38bdf8] overflow-x-auto leading-relaxed bg-[#0b1c30] p-3 rounded-lg border border-[#1b2b3f]">
{`{
  questionId: "${telemetryLogs[0]?.questionId || 'q-cte-04'}",
  attemptId: "${telemetryLogs[0]?.attemptId || 'att-9084'}",
  answer: "${telemetryLogs[0]?.answer || 'Option B'}",
  isCorrect: ${telemetryLogs[0]?.isCorrect ?? false},
  timeSpent: ${telemetryLogs[0]?.timeSpent || 47}, // en secondes
  difficulty: ${telemetryLogs[0]?.difficulty || 4},
  topic: "${telemetryLogs[0]?.topic || 'CTE'}",
  timestamp: "${telemetryLogs[0]?.timestamp || '2025-02-24T18:42:10Z'}"
}`}
              </pre>
            </div>

            {/* Liste des tentatives enregistrées */}
            <div className="lg:col-span-7 rounded-xl bg-[#000f21] border border-[#1b2b3f] overflow-hidden">
              <div className="px-3.5 py-2 bg-[#0b1c30] border-b border-[#1b2b3f] flex items-center justify-between font-mono text-[10px] text-[#93ccff] uppercase font-bold">
                <span>{isFr ? 'Dernières Tentatives Chronométrées' : 'Recent Timed Attempts'}</span>
                <span>{telemetryLogs.length} {isFr ? 'entrées' : 'records'}</span>
              </div>
              <div className="divide-y divide-[#1b2b3f]/60 max-h-56 overflow-y-auto font-mono text-[11px]">
                {telemetryLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.attemptId}
                    className={`px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 ${
                      justRecordedId === log.attemptId ? 'bg-[#4edea3]/15 animate-pulse' : 'hover:bg-[#0b1c30]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {log.isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-[#fb7185] shrink-0" />
                      )}
                      <span className="font-bold text-[#d3e4fe]">{log.topic}</span>
                      <span className="text-[#89929b] text-[10px]">({log.questionId})</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#102034] text-[#93ccff] text-[10px]">
                        Diff {log.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {log.hintRequested && (
                        <span className="px-1.5 py-0.5 rounded bg-[#f59e0b]/15 text-[#fbbf24] text-[10px]">
                          {isFr ? '+Aide' : '+Hint'}
                        </span>
                      )}
                      <span
                        className={`font-extrabold ${
                          log.timeSpent <= 15
                            ? 'text-[#4edea3]'
                            : log.timeSpent <= 30
                            ? 'text-[#38bdf8]'
                            : 'text-[#fb7185]'
                        }`}
                      >
                        ⏱ {log.timeSpent} s
                      </span>
                      <span className="text-[10px] text-[#89929b]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 3 : SIMULATEUR D'APPRENTISSAGE ADAPTATIF (PRÉCISION × TEMPS × DEMANDES D'AIDE) */}
      {activeTab === 'adaptive' && (
        <div className="p-4 rounded-xl bg-[#000f21] border border-[#1b2b3f] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-[#d3e4fe] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#fbbf24]" />
                <span>
                  {isFr
                    ? 'Tester l\'impact d\'une nouvelle tentative sur les statistiques'
                    : 'Test how a new timed attempt updates topic statistics'}
                </span>
              </h4>
              <p className="text-xs text-[#89929b]">
                {isFr
                  ? 'Enregistrez une tentative simulée pour observer le recalcul en direct de l\'Exactitude, du Temps moyen et du profil pédagogique.'
                  : 'Record a simulated attempt to see live recalculation of Accuracy, Avg Time, and pedagogical profile.'}
              </p>
            </div>
            <button
              onClick={() => restoreDefaultUserStats()}
              className="px-2.5 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#89ceff] border border-[#1b2b3f] font-mono text-[11px] flex items-center gap-1 self-start"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isFr ? 'Réinitialiser valeurs de référence' : 'Reset reference values'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
            {/* Choix du Topic */}
            <div className="p-3 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-1.5">
              <span className="text-[10px] text-[#89929b] uppercase">{isFr ? '1. Sujet (topic)' : '1. Topic'}</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['SELECT', 'JOIN', 'GROUP BY', 'CTE'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSimTopic(t)}
                    className={`py-1.5 px-2 rounded font-bold text-[11px] border transition-all ${
                      simTopic === t
                        ? 'bg-[#3198dc] text-[#002c47] border-[#3198dc]'
                        : 'bg-[#000f21] text-[#d3e4fe] border-[#1b2b3f]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Temps passé (timeSpent) */}
            <div className="p-3 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] flex flex-col justify-between gap-1.5">
              <div className="flex justify-between">
                <span className="text-[10px] text-[#89929b] uppercase">{isFr ? '2. Temps (timeSpent)' : '2. Time Spent'}</span>
                <span className="font-extrabold text-[#38bdf8]">{simTime} s</span>
              </div>
              <input
                type="range"
                min={5}
                max={90}
                value={simTime}
                onChange={(e) => setSimTime(Number(e.target.value))}
                className="w-full accent-[#38bdf8] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-[#89929b]">
                <span>5s (Réflexe)</span>
                <span>45s+ (Lent)</span>
              </div>
            </div>

            {/* Exactitude (isCorrect) & Demande d'aide */}
            <div className="p-3 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] flex flex-col justify-between gap-2">
              <span className="text-[10px] text-[#89929b] uppercase">{isFr ? '3. Résultat & Aide' : '3. Result & Help'}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setSimCorrect(true)}
                  className={`flex-1 py-1.5 rounded text-[11px] font-bold border ${
                    simCorrect
                      ? 'bg-[#4edea3]/20 text-[#4edea3] border-[#4edea3]'
                      : 'bg-[#000f21] text-[#89929b] border-[#1b2b3f]'
                  }`}
                >
                  ✓ Correct
                </button>
                <button
                  onClick={() => setSimCorrect(false)}
                  className={`flex-1 py-1.5 rounded text-[11px] font-bold border ${
                    !simCorrect
                      ? 'bg-[#f43f5e]/20 text-[#fb7185] border-[#f43f5e]'
                      : 'bg-[#000f21] text-[#89929b] border-[#1b2b3f]'
                  }`}
                >
                  ✗ Erreur
                </button>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-[#bfc7d2] cursor-pointer">
                <input
                  type="checkbox"
                  checked={simHint}
                  onChange={(e) => setSimHint(e.target.checked)}
                  className="accent-[#fbbf24]"
                />
                <span>{isFr ? 'Aide / Indice demandé' : 'Help / Hint requested'}</span>
              </label>
            </div>

            {/* Bouton Enregistrer */}
            <div className="p-3 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] flex flex-col justify-between">
              <span className="text-[10px] text-[#89929b] uppercase">
                {isFr ? '4. Télémétrie Temps Réel' : '4. Live Telemetry'}
              </span>
              <button
                onClick={handleSimulateAttempt}
                className="w-full py-2.5 px-3 rounded-lg bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isFr ? 'Enregistrer tentative' : 'Record attempt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
