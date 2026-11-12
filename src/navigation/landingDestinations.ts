import { NavigationTab } from '../types';
import { ShortSessionMode } from '../data/shortSessionsData';

export type LandingDestinationKey =
  | 'dashboard'
  | 'sandbox'
  | 'sql_lab'
  | 'skills'
  | 'skill_map'
  | 'spaced_repetition'
  | 'syllabus'
  | 'certification_tracks'
  | 'flashcards'
  | 'activity'
  | 'exams'
  | 'questions'
  | 'short_session_5m'
  | 'short_session_30m'
  | 'access_control'
  | 'glossary';

export interface ResolvedNavigation {
  tab: NavigationTab;
  shortSessionMode?: ShortSessionMode;
  targetCertId?: string;
}

/**
 * Centralized mapping between marketing destination identifiers used on the Landing Page
 * and the actual NavigationTab and modal runners within the DBMastery Studio workspace.
 */
export const LANDING_DESTINATION_MAP: Record<string, ResolvedNavigation> = {
  dashboard: { tab: 'dashboard' },
  sandbox: { tab: 'sandbox' },
  sql_lab: { tab: 'sandbox' },
  skills: { tab: 'skills' },
  skill_map: { tab: 'skills' },
  spaced_repetition: { tab: 'spaced_repetition' },
  syllabus: { tab: 'syllabus' },
  certification_tracks: { tab: 'syllabus' },
  flashcards: { tab: 'flashcards' },
  activity: { tab: 'activity' },
  exams: { tab: 'exams' },
  questions: { tab: 'exams' },
  short_session_5m: { tab: 'exams', shortSessionMode: 'quick_5min' },
  short_session_30m: { tab: 'exams', shortSessionMode: 'training_30min' },
  access_control: { tab: 'access_control' },
  glossary: { tab: 'glossary' },
};

/**
 * Resolves any destination string into a typed navigation target.
 * Always guarantees a safe fallback to 'dashboard' if an unknown destination is provided.
 */
export function resolveLandingDestination(rawDestination?: string | null): ResolvedNavigation {
  if (!rawDestination) {
    return { tab: 'dashboard' };
  }

  const key = rawDestination.trim().toLowerCase();
  const matched = LANDING_DESTINATION_MAP[key];

  if (matched) {
    return matched;
  }

  console.warn(`[Navigation] Unknown landing destination requested: "${rawDestination}". Falling back safely to dashboard.`);
  return { tab: 'dashboard' };
}
