import { describe, it, expect, beforeEach } from 'vitest';
import {
  initialEmptyStats,
  loadUserStats,
  recordQuestionAttemptTelemetry,
  resetUserStats,
} from '../services/statsService';
import {
  getFutureExamCountdown,
  loadUserPreferences,
  mergeUserPreferences,
  recordLastLearningActivity,
  saveUserPreferences,
} from '../services/userPreferencesService';

describe('Dashboard Real Stats & Empty States (Zero Fake Metrics)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns clean empty stats on fresh load with zero fake 127 / 81 / 842 values', () => {
    const stats = loadUserStats();
    expect(stats.questionsAnswered).toBe(0);
    expect(stats.overallAccuracy).toBe(0);
    expect(stats.streakDays).toBe(0);
    expect(stats.avgVelocity).toBe('--');
    expect(stats.topicResponseStats).toEqual([]);
    expect(stats.attemptTelemetryLogs).toEqual([]);
    expect(stats.weeklyActivity?.questionsThisWeek).toBe(0);
    expect(stats.weeklyActivity?.accuracyThisWeek).toBe(0);
    expect(stats.weeklyActivity?.deltaSqlPercent).toBe(0);
    expect(initialEmptyStats.questionsAnswered).toBe(0);
  });

  it('computes real incremental accuracy and counts starting from 0 when recording an attempt', () => {
    const first = recordQuestionAttemptTelemetry({
      questionId: 'q-join-real-1',
      answer: 'Option B',
      isCorrect: true,
      timeSpent: 18,
      difficulty: 3,
      topic: 'JOIN',
    });

    expect(first.topic).toBe('JOIN');
    expect(first.isCorrect).toBe(true);

    const afterOne = loadUserStats();
    expect(afterOne.questionsAnswered).toBe(1);
    expect(afterOne.overallAccuracy).toBe(100);
    expect(afterOne.weeklyActivity?.questionsThisWeek).toBe(1);
    expect(afterOne.attemptTelemetryLogs?.length).toBe(1);

    recordQuestionAttemptTelemetry({
      questionId: 'q-join-real-2',
      answer: 'Option A',
      isCorrect: false,
      timeSpent: 22,
      difficulty: 3,
      topic: 'JOIN',
    });

    const afterTwo = loadUserStats();
    expect(afterTwo.questionsAnswered).toBe(2);
    expect(afterTwo.overallAccuracy).toBe(50);
    expect(afterTwo.avgVelocity).toBe('20s');
  });

  it('resets stats cleanly back to 0', () => {
    recordQuestionAttemptTelemetry({
      questionId: 'q-sel-1',
      answer: 'Option A',
      isCorrect: true,
      timeSpent: 12,
      difficulty: 2,
      topic: 'SELECT',
    });
    const reset = resetUserStats();
    expect(reset.questionsAnswered).toBe(0);
    expect(reset.overallAccuracy).toBe(0);
    expect(reset.attemptTelemetryLogs).toEqual([]);
  });
});

describe('Onboarding V2 Preferences & Exam Countdown', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists "Apprendre SQL sans certification" (targetCert: null) and onboardingCompleted', () => {
    expect(loadUserPreferences().onboardingCompleted).toBe(false);

    const saved = saveUserPreferences({
      onboardingCompleted: true,
      objective: 'learn_sql',
      targetCert: null,
      level: 'beginner',
      targetExamDate: null,
    });

    expect(saved.onboardingCompleted).toBe(true);
    expect(saved.objective).toBe('learn_sql');
    expect(saved.targetCert).toBeNull();
    expect(localStorage.getItem('dbmastery_onboarding_completed_v1')).toBe('true');

    const reloaded = loadUserPreferences();
    expect(reloaded.onboardingCompleted).toBe(true);
    expect(reloaded.targetCert).toBeNull();
  });

  it('never re-opens onboarding when merging remote preferences for configured user', () => {
    saveUserPreferences({
      onboardingCompleted: true,
      objective: 'prepare_certification',
      targetCert: 'postgres-edb',
    });

    const merged = mergeUserPreferences({
      onboardingCompleted: false,
      updatedAt: '2024-01-01T00:00:00.000Z',
    });

    expect(merged.onboardingCompleted).toBe(true);
    expect(merged.targetCert).toBe('postgres-edb');
  });

  it('never displays stale 2025 countdowns and calculates only valid future ISO exam dates', () => {
    expect(getFutureExamCountdown(null, 'fr')).toBeNull();
    expect(getFutureExamCountdown('2025-03-15', 'fr')).toBeNull();
    expect(getFutureExamCountdown('2025-03-15', 'en')).toBeNull();
    expect(getFutureExamCountdown('invalid-date', 'fr')).toBeNull();

    const futureDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const countdown = getFutureExamCountdown(futureDate, 'fr');
    expect(countdown).not.toBeNull();
    expect(countdown!.daysRemaining).toBeGreaterThanOrEqual(13);
    expect(countdown!.daysRemaining).toBeLessThanOrEqual(15);
  });

  it('records last learning activity excluding dashboard & access_control', () => {
    expect(recordLastLearningActivity('dashboard')).toBeNull();
    expect(recordLastLearningActivity('access_control')).toBeNull();

    const updated = recordLastLearningActivity('sandbox', 'JOIN');
    expect(updated).not.toBeNull();
    expect(updated!.lastActivity?.tab).toBe('sandbox');
    expect(updated!.lastActivity?.labelFr).toBe('Lab SQL interactif');
    expect(updated!.lastActivity?.labelEn).toBe('Interactive SQL Lab');
  });
});
