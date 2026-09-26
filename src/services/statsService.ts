import { QuestionAttemptTelemetry, TopicResponseTimeStat, PedagogicalSpeedProfile } from '../types';

export interface UserBadge {
  id: string;
  title: string;
  descFr: string;
  descEn: string;
  unlocked: boolean;
  date?: string;
  progress?: string;
  iconName: 'Flame' | 'Terminal' | 'ShieldCheck' | 'Award' | 'Database' | 'Zap';
  color: string;
}

export interface DomainAccuracyItem {
  id: string;
  title: string;
  percent: number;
  accentColor: string;
}

export interface WeeklyDayActivity {
  dayId: 'lun' | 'mar' | 'mer' | 'jeu' | 'ven';
  dayLabelFr: string;
  dayLabelEn: string;
  fullDayFr: string;
  fullDayEn: string;
  blocksCount: number; // e.g. 7, 9, 5, 10, 11
  questions: number;
  accuracy: number;
  avgTimeSeconds: number;
  focusTopicFr: string;
  focusTopicEn: string;
}

export interface WeeklyActivitySummary {
  questionsThisWeek: number;      // 127
  accuracyThisWeek: number;       // 81 (%)
  avgTimeSecondsThisWeek: number; // 32 (s)
  currentStreakDays: number;      // 6 (jours)
  deltaSqlPercent: number;        // +12 (%)
  deltaBannerFr: string;          // « Depuis la semaine dernière : +12 % sur SQL »
  deltaBannerEn: string;          // « Since last week: +12% on SQL »
  dailyProgression: WeeklyDayActivity[];
}

export interface UserStatsData {
  overallAccuracy: number;
  accuracyDelta: string;
  avgVelocity: string;
  questionsAnswered: number;
  streakDays: number;
  passProbability: number;
  badges: UserBadge[];
  domainBreakdown: DomainAccuracyItem[];
  lastResetDate: string | null;
  topicResponseStats?: TopicResponseTimeStat[];
  attemptTelemetryLogs?: QuestionAttemptTelemetry[];
  weeklyActivity?: WeeklyActivitySummary;
}

const STORAGE_KEY = 'dbmastery_user_stats_v1';
const TELEMETRY_STORAGE_KEY = 'dbmastery_attempt_telemetry_v1';

/**
 * Données initiales Exactitude × Temps moyen correspondant exactement à l'exemple demandé :
 * SELECT     94 %   12 s
 * JOIN       72 %   31 s
 * GROUP BY   81 %   24 s
 * CTE        58 %   47 s
 */
export const initialTopicResponseStats: TopicResponseTimeStat[] = [
  {
    topic: 'SELECT',
    accuracy: 94,
    avgTimeSeconds: 12,
    targetTimeSeconds: 20,
    totalAttempts: 36,
    correctAttempts: 34,
    helpRequestsRate: 3,
    profile: 'reflex_mastery',
    diagnosticFr: 'Automatisme acquis : lecture immédiate des projections, DISTINCT et alias sans hésitation.',
    diagnosticEn: 'Reflex mastery: immediate reading of projections, DISTINCT, and aliases without hesitation.',
    adaptiveActionFr: 'Mode Blitz activé • Difficulté maintenue à 4/5 sans indice',
    adaptiveActionEn: 'Blitz Mode enabled • Difficulty locked at 4/5 without hints',
  },
  {
    topic: 'JOIN',
    accuracy: 72,
    avgTimeSeconds: 31,
    targetTimeSeconds: 25,
    totalAttempts: 29,
    correctAttempts: 21,
    helpRequestsRate: 24,
    profile: 'hesitant_analytic',
    diagnosticFr: 'Hésitation sur le filtrage WHERE vs ON dans les LEFT JOIN (+6s au-dessus de la cible).',
    diagnosticEn: 'Hesitation on WHERE vs ON filtering in LEFT JOINs (+6s above target threshold).',
    adaptiveActionFr: 'Injecter des exercices chronométrés ciblés sur LEFT vs INNER JOIN',
    adaptiveActionEn: 'Inject timed drills focused on LEFT vs INNER JOIN',
  },
  {
    topic: 'GROUP BY',
    accuracy: 81,
    avgTimeSeconds: 24,
    targetTimeSeconds: 25,
    totalAttempts: 26,
    correctAttempts: 21,
    helpRequestsRate: 12,
    profile: 'operational_steady',
    diagnosticFr: 'Bonne vélocité opérationnelle, légers ralentissements sur les clauses HAVING avec fonctions imbriquées.',
    diagnosticEn: 'Good operational velocity, slight slowdowns on HAVING clauses with nested aggregates.',
    adaptiveActionFr: 'Consolider par 3 questions de niveau 3 sur WHERE vs HAVING',
    adaptiveActionEn: 'Consolidate with 3 level-3 questions on WHERE vs HAVING',
  },
  {
    topic: 'CTE',
    accuracy: 58,
    avgTimeSeconds: 47,
    targetTimeSeconds: 30,
    totalAttempts: 19,
    correctAttempts: 11,
    helpRequestsRate: 42,
    profile: 'cognitive_overload',
    diagnosticFr: 'Surcharge cognitive détectée (47s/question + 42% d\'appels à l\'aide) sur WITH RECURSIVE et portée des CTE.',
    diagnosticEn: 'Cognitive overload detected (47s/question + 42% help requests) on WITH RECURSIVE and CTE scope.',
    adaptiveActionFr: 'Déclencher un mini-cours guidé + décomposition pas-à-pas sans chrono',
    adaptiveActionEn: 'Trigger guided mini-course + step-by-step untimed decomposition',
  },
  {
    topic: 'SUBQUERIES',
    accuracy: 64,
    avgTimeSeconds: 38,
    targetTimeSeconds: 28,
    totalAttempts: 22,
    correctAttempts: 14,
    helpRequestsRate: 31,
    profile: 'hesitant_analytic',
    diagnosticFr: 'Temps d\'analyse élevé sur les sous-requêtes corrélées et le piège NOT IN avec NULL.',
    diagnosticEn: 'High analysis time on correlated subqueries and the NOT IN with NULL trap.',
    adaptiveActionFr: 'Rappel visuel EXISTS vs NOT IN + série adaptative difficulté 2→3',
    adaptiveActionEn: 'Visual reminder EXISTS vs NOT IN + adaptive series difficulty 2→3',
  },
  {
    topic: 'WINDOW',
    accuracy: 88,
    avgTimeSeconds: 19,
    targetTimeSeconds: 25,
    totalAttempts: 25,
    correctAttempts: 22,
    helpRequestsRate: 8,
    profile: 'reflex_mastery',
    diagnosticFr: 'Excellente maîtrise de PARTITION BY et DENSE_RANK avec exécution rapide (19s).',
    diagnosticEn: 'Strong mastery of PARTITION BY and DENSE_RANK with fast execution (19s).',
    adaptiveActionFr: 'Augmenter la complexité vers ROWS vs RANGE UNBOUNDED PRECEDING',
    adaptiveActionEn: 'Increase complexity toward ROWS vs RANGE UNBOUNDED PRECEDING',
  },
];

/**
 * Journal initial des tentatives individuelles stockées avec la structure exacte demandée :
 * questionId, attemptId, answer, isCorrect, timeSpent, difficulty, topic, timestamp
 */
export const initialAttemptTelemetryLogs: QuestionAttemptTelemetry[] = [
  {
    questionId: 'q-cte-04',
    attemptId: 'att-9084',
    answer: 'Option B (WITH RECURSIVE sans UNION ALL)',
    isCorrect: false,
    timeSpent: 52,
    difficulty: 4,
    topic: 'CTE',
    timestamp: '2025-02-24T18:42:10Z',
    hintRequested: true,
  },
  {
    questionId: 'q-join-03',
    attemptId: 'att-9083',
    answer: 'Option A (INNER JOIN implicite)',
    isCorrect: false,
    timeSpent: 36,
    difficulty: 3,
    topic: 'JOIN',
    timestamp: '2025-02-24T18:39:05Z',
    hintRequested: true,
  },
  {
    questionId: 'q-select-12',
    attemptId: 'att-9082',
    answer: 'Option C (SELECT DISTINCT)',
    isCorrect: true,
    timeSpent: 11,
    difficulty: 2,
    topic: 'SELECT',
    timestamp: '2025-02-24T18:36:40Z',
    hintRequested: false,
  },
  {
    questionId: 'q-groupby-07',
    attemptId: 'att-9081',
    answer: 'Option D (HAVING COUNT(*) > 5)',
    isCorrect: true,
    timeSpent: 23,
    difficulty: 3,
    topic: 'GROUP BY',
    timestamp: '2025-02-24T18:34:12Z',
    hintRequested: false,
  },
  {
    questionId: 'q-cte-02',
    attemptId: 'att-9080',
    answer: 'Option A (Portée limitée à la requête)',
    isCorrect: true,
    timeSpent: 43,
    difficulty: 3,
    topic: 'CTE',
    timestamp: '2025-02-24T18:31:50Z',
    hintRequested: true,
  },
  {
    questionId: 'q-join-01',
    attemptId: 'att-9079',
    answer: 'Option B (ON d.dept_id = e.dept_id AND ...)',
    isCorrect: true,
    timeSpent: 28,
    difficulty: 3,
    topic: 'JOIN',
    timestamp: '2025-02-24T18:29:15Z',
    hintRequested: false,
  },
  {
    questionId: 'q-select-09',
    attemptId: 'att-9078',
    answer: 'Option A (COALESCE(commission, 0))',
    isCorrect: true,
    timeSpent: 13,
    difficulty: 2,
    topic: 'SELECT',
    timestamp: '2025-02-24T18:27:02Z',
    hintRequested: false,
  },
  {
    questionId: 'q-groupby-03',
    attemptId: 'att-9077',
    answer: 'Option C (Colonne non agrégée dans SELECT)',
    isCorrect: false,
    timeSpent: 26,
    difficulty: 3,
    topic: 'GROUP BY',
    timestamp: '2025-02-24T18:24:48Z',
    hintRequested: false,
  },
];

export const initialWeeklyActivity: WeeklyActivitySummary = {
  questionsThisWeek: 127,
  accuracyThisWeek: 81,
  avgTimeSecondsThisWeek: 32,
  currentStreakDays: 6,
  deltaSqlPercent: 12,
  deltaBannerFr: 'Depuis la semaine dernière : +12 % sur SQL',
  deltaBannerEn: 'Since last week: +12% on SQL',
  dailyProgression: [
    {
      dayId: 'lun',
      dayLabelFr: 'Lun',
      dayLabelEn: 'Mon',
      fullDayFr: 'Lundi',
      fullDayEn: 'Monday',
      blocksCount: 7,
      questions: 21,
      accuracy: 76,
      avgTimeSeconds: 35,
      focusTopicFr: 'SELECT, Projections & COALESCE',
      focusTopicEn: 'SELECT, Projections & COALESCE',
    },
    {
      dayId: 'mar',
      dayLabelFr: 'Mar',
      dayLabelEn: 'Tue',
      fullDayFr: 'Mardi',
      fullDayEn: 'Tuesday',
      blocksCount: 9,
      questions: 27,
      accuracy: 81,
      avgTimeSeconds: 33,
      focusTopicFr: 'JOIN ANSI (INNER vs LEFT JOIN)',
      focusTopicEn: 'ANSI JOINs (INNER vs LEFT JOIN)',
    },
    {
      dayId: 'mer',
      dayLabelFr: 'Mer',
      dayLabelEn: 'Wed',
      fullDayFr: 'Mercredi',
      fullDayEn: 'Wednesday',
      blocksCount: 5,
      questions: 15,
      accuracy: 80,
      avgTimeSeconds: 31,
      focusTopicFr: 'GROUP BY, HAVING & Agrégations',
      focusTopicEn: 'GROUP BY, HAVING & Aggregations',
    },
    {
      dayId: 'jeu',
      dayLabelFr: 'Jeu',
      dayLabelEn: 'Thu',
      fullDayFr: 'Jeudi',
      fullDayEn: 'Thursday',
      blocksCount: 10,
      questions: 31,
      accuracy: 84,
      avgTimeSeconds: 30,
      focusTopicFr: 'Sous-requêtes, EXISTS vs NOT IN',
      focusTopicEn: 'Subqueries, EXISTS vs NOT IN',
    },
    {
      dayId: 'ven',
      dayLabelFr: 'Ven',
      dayLabelEn: 'Fri',
      fullDayFr: 'Vendredi',
      fullDayEn: 'Friday',
      blocksCount: 11,
      questions: 33,
      accuracy: 82,
      avgTimeSeconds: 31,
      focusTopicFr: 'CTE Récursives & Window Functions',
      focusTopicEn: 'Recursive CTEs & Window Functions',
    },
  ],
};

export const initialDefaultStats: UserStatsData = {
  overallAccuracy: 81.0,
  accuracyDelta: '+12%',
  avgVelocity: '32s',
  questionsAnswered: 842,
  streakDays: 6,
  passProbability: 94.8,
  badges: [
    {
      id: 'b1',
      title: 'DBA Consistency',
      descFr: "5 jours d'affilée de révisions régulières",
      descEn: '5 consecutive days of revision study',
      unlocked: true,
      date: 'Obtenu le 18 Fév',
      iconName: 'Flame',
      color: '#4edea3',
    },
    {
      id: 'b2',
      title: 'Window Function Master',
      descFr: '100% de réussite sur DENSE_RANK & PARTITION BY',
      descEn: '100% score on DENSE_RANK & PARTITION BY',
      unlocked: true,
      date: 'Obtenu le 15 Fév',
      iconName: 'Terminal',
      color: '#93ccff',
    },
    {
      id: 'b3',
      title: 'Null Trap Survivor',
      descFr: 'A déjoué le piège NOT IN face à des NULLs 5 fois',
      descEn: 'Avoided NOT IN with NULLs trap 5 times',
      unlocked: true,
      date: 'Obtenu le 12 Fév',
      iconName: 'ShieldCheck',
      color: '#89ceff',
    },
    {
      id: 'b4',
      title: 'Oracle 19c Slayer',
      descFr: 'Score supérieur à 90% sur un examen blanc officiel',
      descEn: 'Score > 90% on official practice exam',
      unlocked: true,
      date: 'Obtenu Hier',
      iconName: 'Award',
      color: '#f59e0b',
    },
    {
      id: 'b5',
      title: 'Polyglot DBA',
      descFr: 'Exécuter des requêtes sur 4 dialectes différents',
      descEn: 'Execute queries across 4 different SQL engines',
      unlocked: false,
      progress: '3/4 dialectes',
      iconName: 'Database',
      color: '#89929b',
    },
    {
      id: 'b6',
      title: 'Speed Resolver',
      descFr: 'Moins de 45 secondes par question sur 30 questions',
      descEn: 'Less than 45s per question on 30 questions',
      unlocked: false,
      progress: '21/30 questions',
      iconName: 'Zap',
      color: '#89929b',
    },
  ],
  domainBreakdown: [
    { id: 'd1', title: 'Requêtes Analytiques & Window Functions', percent: 88, accentColor: '#4edea3' },
    { id: 'd2', title: 'Jointures ANSI & Corrélations', percent: 82, accentColor: '#93ccff' },
    { id: 'd3', title: 'Contraintes d\'Intégrité & DDL', percent: 79, accentColor: '#89ceff' },
    { id: 'd4', title: 'Transactions, MVCC & Isolation', percent: 74, accentColor: '#f59e0b' },
    { id: 'd5', title: 'Indexation & Plans d\'Exécution', percent: 68, accentColor: '#ef4444' },
  ],
  lastResetDate: null,
  topicResponseStats: initialTopicResponseStats,
  attemptTelemetryLogs: initialAttemptTelemetryLogs,
  weeklyActivity: initialWeeklyActivity,
};

export const initialEmptyStats: UserStatsData = {
  overallAccuracy: 0,
  accuracyDelta: '0.0%',
  avgVelocity: '--',
  questionsAnswered: 0,
  streakDays: 0,
  passProbability: 0,
  badges: [
    {
      id: 'b1',
      title: 'DBA Consistency',
      descFr: "5 jours d'affilée de révisions régulières",
      descEn: '5 consecutive days of revision study',
      unlocked: false,
      progress: '0/5 jours',
      iconName: 'Flame',
      color: '#89929b',
    },
    {
      id: 'b2',
      title: 'Window Function Master',
      descFr: '100% de réussite sur DENSE_RANK & PARTITION BY',
      descEn: '100% score on DENSE_RANK & PARTITION BY',
      unlocked: false,
      progress: '0/10 questions',
      iconName: 'Terminal',
      color: '#89929b',
    },
    {
      id: 'b3',
      title: 'Null Trap Survivor',
      descFr: 'A déjoué le piège NOT IN face à des NULLs 5 fois',
      descEn: 'Avoided NOT IN with NULLs trap 5 times',
      unlocked: false,
      progress: '0/5 pièges évités',
      iconName: 'ShieldCheck',
      color: '#89929b',
    },
    {
      id: 'b4',
      title: 'Oracle 19c Slayer',
      descFr: 'Score supérieur à 90% sur un examen blanc officiel',
      descEn: 'Score > 90% on official practice exam',
      unlocked: false,
      progress: '0/1 examen blanc',
      iconName: 'Award',
      color: '#89929b',
    },
    {
      id: 'b5',
      title: 'Polyglot DBA',
      descFr: 'Exécuter des requêtes sur 4 dialectes différents',
      descEn: 'Execute queries across 4 different SQL engines',
      unlocked: false,
      progress: '0/4 dialectes',
      iconName: 'Database',
      color: '#89929b',
    },
    {
      id: 'b6',
      title: 'Speed Resolver',
      descFr: 'Moins de 45 secondes par question sur 30 questions',
      descEn: 'Less than 45s per question on 30 questions',
      unlocked: false,
      progress: '0/30 questions',
      iconName: 'Zap',
      color: '#89929b',
    },
  ],
  domainBreakdown: [
    { id: 'd1', title: 'Requêtes Analytiques & Window Functions', percent: 0, accentColor: '#4edea3' },
    { id: 'd2', title: 'Jointures ANSI & Corrélations', percent: 0, accentColor: '#93ccff' },
    { id: 'd3', title: 'Contraintes d\'Intégrité & DDL', percent: 0, accentColor: '#89ceff' },
    { id: 'd4', title: 'Transactions, MVCC & Isolation', percent: 0, accentColor: '#f59e0b' },
    { id: 'd5', title: 'Indexation & Plans d\'Exécution', percent: 0, accentColor: '#ef4444' },
  ],
  lastResetDate: new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
  topicResponseStats: initialTopicResponseStats,
  attemptTelemetryLogs: initialAttemptTelemetryLogs,
  weeklyActivity: initialWeeklyActivity,
};

// Listeners for reactivity
type StatsListener = (stats: UserStatsData) => void;
const listeners: Set<StatsListener> = new Set();

export function subscribeToStats(listener: StatsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(stats: UserStatsData) {
  listeners.forEach((fn) => {
    try {
      fn(stats);
    } catch (e) {
      console.error('Error in stats listener:', e);
    }
  });
  window.dispatchEvent(new CustomEvent('dbmastery:telemetry_updated', { detail: stats }));
}

export function loadUserStats(): UserStatsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialDefaultStats;
    const parsed = JSON.parse(raw) as UserStatsData;
    if (!parsed.topicResponseStats || parsed.topicResponseStats.length === 0) {
      parsed.topicResponseStats = initialTopicResponseStats;
    }
    if (!parsed.attemptTelemetryLogs || parsed.attemptTelemetryLogs.length === 0) {
      parsed.attemptTelemetryLogs = initialAttemptTelemetryLogs;
    }
    if (!parsed.weeklyActivity || !parsed.weeklyActivity.dailyProgression) {
      parsed.weeklyActivity = initialWeeklyActivity;
    }
    return parsed;
  } catch (e) {
    console.warn('Failed to load stats from localStorage:', e);
    return initialDefaultStats;
  }
}

export function saveUserStats(stats: UserStatsData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    notifyListeners(stats);
  } catch (e) {
    console.error('Failed to save stats to localStorage:', e);
  }
}

export function resetUserStats(): UserStatsData {
  const resetStats: UserStatsData = {
    ...initialEmptyStats,
    lastResetDate: new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
  saveUserStats(resetStats);
  return resetStats;
}

export function restoreDefaultUserStats(): UserStatsData {
  saveUserStats(initialDefaultStats);
  return initialDefaultStats;
}

export function classifyPedagogicalSpeedProfile(
  accuracy: number,
  avgTimeSeconds: number,
  targetTimeSeconds = 25
): PedagogicalSpeedProfile {
  if (accuracy >= 85 && avgTimeSeconds <= targetTimeSeconds) {
    return 'reflex_mastery';
  }
  if (accuracy >= 75 && avgTimeSeconds <= targetTimeSeconds + 8) {
    return 'operational_steady';
  }
  if (accuracy < 68 && avgTimeSeconds <= 14) {
    return 'impulsive_trap';
  }
  if (accuracy < 68 && avgTimeSeconds > targetTimeSeconds + 5) {
    return 'cognitive_overload';
  }
  return 'hesitant_analytic';
}

/**
 * Enregistre une tentative de question avec la structure exacte demandée :
 * questionId, attemptId, answer, isCorrect, timeSpent, difficulty, topic, timestamp
 * et met à jour les statistiques par sujet (Exactitude & Temps moyen)
 */
export function recordQuestionAttemptTelemetry(input: {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
  difficulty: number;
  topic: string;
  hintRequested?: boolean;
}): QuestionAttemptTelemetry {
  const stats = loadUserStats();
  const normalizedTopic = normalizeSqlTopic(input.topic);
  const clampedTime = Math.max(2, Math.min(300, Math.round(input.timeSpent)));

  const newAttempt: QuestionAttemptTelemetry = {
    questionId: input.questionId,
    attemptId: `att-${Math.floor(1000 + Math.random() * 9000)}`,
    answer: input.answer,
    isCorrect: input.isCorrect,
    timeSpent: clampedTime,
    difficulty: input.difficulty || 3,
    topic: normalizedTopic,
    timestamp: new Date().toISOString(),
    hintRequested: !!input.hintRequested,
  };

  const currentLogs = stats.attemptTelemetryLogs || initialAttemptTelemetryLogs;
  const updatedLogs = [newAttempt, ...currentLogs].slice(0, 50);

  const currentTopics = [...(stats.topicResponseStats || initialTopicResponseStats)];
  const existingIdx = currentTopics.findIndex(
    (t) => t.topic.toUpperCase() === normalizedTopic.toUpperCase()
  );

  if (existingIdx >= 0) {
    const item = currentTopics[existingIdx];
    const newTotal = item.totalAttempts + 1;
    const newCorrect = item.correctAttempts + (input.isCorrect ? 1 : 0);
    const newAccuracy = Math.round((newCorrect / newTotal) * 100);
    const newAvgTime = Math.round(
      (item.avgTimeSeconds * item.totalAttempts + clampedTime) / newTotal
    );
    const newProfile = classifyPedagogicalSpeedProfile(
      newAccuracy,
      newAvgTime,
      item.targetTimeSeconds
    );

    currentTopics[existingIdx] = {
      ...item,
      totalAttempts: newTotal,
      correctAttempts: newCorrect,
      accuracy: newAccuracy,
      avgTimeSeconds: newAvgTime,
      profile: newProfile,
      helpRequestsRate: input.hintRequested
        ? Math.min(100, item.helpRequestsRate + 3)
        : Math.max(0, item.helpRequestsRate - 1),
    };
  } else {
    const newAccuracy = input.isCorrect ? 100 : 0;
    const newProfile = classifyPedagogicalSpeedProfile(newAccuracy, clampedTime, 25);
    currentTopics.push({
      topic: normalizedTopic,
      accuracy: newAccuracy,
      avgTimeSeconds: clampedTime,
      targetTimeSeconds: 25,
      totalAttempts: 1,
      correctAttempts: input.isCorrect ? 1 : 0,
      helpRequestsRate: input.hintRequested ? 100 : 0,
      profile: newProfile,
      diagnosticFr: input.isCorrect
        ? 'Exécution validée sur ce sujet.'
        : 'Erreur détectée — consolidation recommandée.',
      diagnosticEn: input.isCorrect
        ? 'Execution validated on this topic.'
        : 'Error detected — consolidation recommended.',
      adaptiveActionFr: 'Continuer le suivi adaptatif sur ce sujet',
      adaptiveActionEn: 'Continue adaptive tracking on this topic',
    });
  }

  const prevWeekly = stats.weeklyActivity || initialWeeklyActivity;
  const newWeeklyQuestions = prevWeekly.questionsThisWeek + 1;
  const prevCorrectCount = Math.round((prevWeekly.accuracyThisWeek / 100) * prevWeekly.questionsThisWeek);
  const newWeeklyAccuracy = Math.round(
    ((prevCorrectCount + (input.isCorrect ? 1 : 0)) / newWeeklyQuestions) * 100
  );
  const newWeeklyAvgTime = Math.round(
    (prevWeekly.avgTimeSecondsThisWeek * prevWeekly.questionsThisWeek + clampedTime) /
      newWeeklyQuestions
  );
  const updatedDaily = prevWeekly.dailyProgression.map((day, idx) => {
    if (idx === prevWeekly.dailyProgression.length - 1) {
      const nextQ = day.questions + 1;
      const prevDayCorrect = Math.round((day.accuracy / 100) * day.questions);
      const nextAcc = Math.round(((prevDayCorrect + (input.isCorrect ? 1 : 0)) / nextQ) * 100);
      const nextTime = Math.round((day.avgTimeSeconds * day.questions + clampedTime) / nextQ);
      return {
        ...day,
        questions: nextQ,
        accuracy: nextAcc,
        avgTimeSeconds: nextTime,
        blocksCount: Math.min(16, Math.max(day.blocksCount, Math.round(nextQ / 3))),
      };
    }
    return day;
  });

  saveUserStats({
    ...stats,
    questionsAnswered: (stats.questionsAnswered || 842) + 1,
    topicResponseStats: currentTopics,
    attemptTelemetryLogs: updatedLogs,
    weeklyActivity: {
      ...prevWeekly,
      questionsThisWeek: newWeeklyQuestions,
      accuracyThisWeek: newWeeklyAccuracy,
      avgTimeSecondsThisWeek: newWeeklyAvgTime,
      dailyProgression: updatedDaily,
    },
  });

  try {
    localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch {
    // ignore storage errors
  }

  window.dispatchEvent(new CustomEvent('dbmastery:attempt_recorded', { detail: newAttempt }));

  return newAttempt;
}

export function normalizeSqlTopic(rawTopic: string): string {
  const upper = (rawTopic || 'SELECT').toUpperCase().trim();
  if (upper.includes('JOIN')) return 'JOIN';
  if (upper.includes('GROUP') || upper.includes('HAVING') || upper.includes('AGGR')) return 'GROUP BY';
  if (upper.includes('CTE') || upper.includes('WITH') || upper.includes('RECURS')) return 'CTE';
  if (upper.includes('SUBQ') || upper.includes('IN') || upper.includes('EXISTS')) return 'SUBQUERIES';
  if (upper.includes('WINDOW') || upper.includes('OVER') || upper.includes('RANK')) return 'WINDOW';
  if (upper.includes('SELECT') || upper.includes('DISTINCT') || upper.includes('DQL')) return 'SELECT';
  return upper;
}

