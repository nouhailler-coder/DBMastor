import { TargetedSessionQuestion } from '../types';
import {
  DAILY_SESSION_QUESTIONS_CATALOG,
  DailySessionConfig,
  DailySessionTopicBreakdown
} from '../data/dailySessionQuestions';

export type { DailySessionConfig, DailySessionTopicBreakdown };
import { loadMasteryTree, applyExamSessionToMastery } from './masteryTreeService';
import { getStoredCompetencies, recalculateCompetenciesAfterSession } from './competencyService';
import { recordQuestionAttemptTelemetry } from './statsService';
import { recordTrapAttempt } from './trapService';

export interface DailySessionState {
  lastCompletedDate: string | null; // 'YYYY-MM-DD'
  lastScore: number | null;
  totalCompletedCount: number;
}

const STORAGE_KEY = 'dbmastery_daily_session_state_v1';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadDailySessionState(): DailySessionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { lastCompletedDate: null, lastScore: null, totalCompletedCount: 0 };
    }
    return JSON.parse(raw);
  } catch {
    return { lastCompletedDate: null, lastScore: null, totalCompletedCount: 0 };
  }
}

export function saveDailySessionState(state: DailySessionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function isDailySessionCompletedToday(): boolean {
  const state = loadDailySessionState();
  return state.lastCompletedDate === getTodayDateString();
}

/**
 * Calcule automatiquement la recommandation de la séance du jour selon l'état actuel de l'utilisateur :
 * 15 questions • ≈ 12 minutes
 * JOIN : 5 questions
 * Transactions : 4 questions
 * Indexes : 3 questions
 * SQL avancé : 3 questions
 * Difficulté : progressive
 */
export function getRecommendedDailySessionConfig(lang: 'fr' | 'en' = 'fr'): DailySessionConfig {
  const isFr = lang === 'fr';
  const tree = loadMasteryTree();

  // Recherche des scores réels pour affichage enrichi
  const joinSubtopic = tree.domains
    .find((d) => d.id === 'sql')
    ?.subtopics.find((s) => s.id === 'join');
  const txDomain = tree.domains.find((d) => d.id === 'transactions');
  const idxDomain = tree.domains.find((d) => d.id === 'indexation');
  const subqSubtopic = tree.domains
    .find((d) => d.id === 'sql')
    ?.subtopics.find((s) => s.id === 'subqueries');

  const breakdown: DailySessionTopicBreakdown[] = [
    {
      topicId: 'join',
      topicName: 'JOIN',
      count: 5,
      currentScore: joinSubtopic ? joinSubtopic.score : 67,
    },
    {
      topicId: 'transactions',
      topicName: isFr ? 'Transactions' : 'Transactions',
      count: 4,
      currentScore: txDomain ? txDomain.score : 61,
    },
    {
      topicId: 'indexes',
      topicName: isFr ? 'Indexes' : 'Indexes',
      count: 3,
      currentScore: idxDomain ? idxDomain.score : 48,
    },
    {
      topicId: 'sql_advanced',
      topicName: isFr ? 'SQL avancé' : 'Advanced SQL',
      count: 3,
      currentScore: subqSubtopic ? subqSubtopic.score : 54,
    },
  ];

  return {
    id: `daily-${getTodayDateString()}`,
    titleFr: 'Séance recommandée',
    titleEn: 'Recommended Session',
    totalQuestions: 15,
    estimatedMinutes: 12,
    difficultyLabelFr: 'Difficulté : progressive',
    difficultyLabelEn: 'Difficulty: progressive',
    breakdown,
  };
}

/**
 * Récupère les 15 questions ordonnées avec difficulté progressive pour la séance du jour
 */
export function getDailySessionQuestions(lang: 'fr' | 'en' = 'fr'): TargetedSessionQuestion[] {
  const catalog = lang === 'en' ? DAILY_SESSION_QUESTIONS_CATALOG.en : DAILY_SESSION_QUESTIONS_CATALOG.fr;
  return [...catalog];
}

export interface DailySessionCompletionResult {
  score: number; // 0-100%
  totalCorrect: number;
  totalQuestions: number;
  durationSeconds: number;
  topicResults: {
    topicId: string;
    topicName: string;
    correct: number;
    total: number;
    scorePercent: number;
  }[];
  date: string;
}

/**
 * Enregistre la complétion de la séance du jour et met à jour en cascade :
 * 1. L'état de la séance du jour (date, score)
 * 2. L'arbre hiérarchique MON NIVEAU
 * 3. Les compétences du modèle DBMastor
 * 4. La télémétrie et les pièges
 */
export function recordDailySessionCompletion(
  userAnswers: Record<string, string>,
  questions: TargetedSessionQuestion[],
  durationSeconds: number
): DailySessionCompletionResult {
  let totalCorrect = 0;
  const topicCounts: Record<string, { topicName: string; correct: number; total: number }> = {};

  const perQuestionDuration = Math.max(15, Math.round(durationSeconds / Math.max(1, questions.length)));

  questions.forEach((q) => {
    const chosen = userAnswers[q.id];
    const isCorrect = chosen === q.correctOptionId;
    if (isCorrect) totalCorrect++;

    if (!topicCounts[q.topicId]) {
      topicCounts[q.topicId] = { topicName: q.topicName, correct: 0, total: 0 };
    }
    topicCounts[q.topicId].total++;
    if (isCorrect) topicCounts[q.topicId].correct++;

    // Enregistrement télémétrie stats
    try {
      recordQuestionAttemptTelemetry({
        questionId: q.id,
        answer: chosen || '',
        isCorrect,
        timeSpent: perQuestionDuration,
        difficulty: q.difficulty === 'hard' ? 4 : q.difficulty === 'intermediate' ? 3 : 2,
        topic: q.topicName,
      });

      if (q.trapMetadata) {
        recordTrapAttempt(q.trapMetadata, isCorrect);
      }
    } catch {
      // ignore
    }
  });

  const finalScore = Math.round((totalCorrect / questions.length) * 100);

  const topicResults = Object.keys(topicCounts).map((tId) => {
    const item = topicCounts[tId];
    return {
      topicId: tId,
      topicName: item.topicName,
      correct: item.correct,
      total: item.total,
      scorePercent: Math.round((item.correct / item.total) * 100),
    };
  });

  // Mise à jour de l'état local
  const prevState = loadDailySessionState();
  const nextState: DailySessionState = {
    lastCompletedDate: getTodayDateString(),
    lastScore: finalScore,
    totalCompletedCount: prevState.totalCompletedCount + 1,
  };
  saveDailySessionState(nextState);

  // Mise à jour de l'arbre hiérarchique MON NIVEAU
  try {
    const sessionTreeResults = topicResults.map((tr) => ({
      topicId: tr.topicId,
      correct: tr.correct,
      total: tr.total,
    }));
    applyExamSessionToMastery(sessionTreeResults);
  } catch (err) {
    console.error('Error updating mastery tree after daily session', err);
  }

  // Recalcul des compétences globales
  try {
    const sessionCompResults = topicResults.map((tr) => ({
      topicId: tr.topicId,
      correct: tr.correct,
      total: tr.total,
    }));
    recalculateCompetenciesAfterSession(sessionCompResults);
  } catch (err) {
    console.error('Error recalculating competencies after daily session', err);
  }

  const result: DailySessionCompletionResult = {
    score: finalScore,
    totalCorrect,
    totalQuestions: questions.length,
    durationSeconds,
    topicResults,
    date: getTodayDateString(),
  };

  // Événements globaux pour rafraîchir l'UI
  window.dispatchEvent(new CustomEvent('dbmastery:daily_session_completed', { detail: result }));
  window.dispatchEvent(new CustomEvent('dbmastery:mastery_updated'));
  window.dispatchEvent(new CustomEvent('dbmastery:competencies_updated'));

  return result;
}
