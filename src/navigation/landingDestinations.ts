import { NavigationTab } from '../types';
import { ShortSessionMode } from '../data/shortSessionsData';

export type LandingDestinationKey =
  | 'dashboard'
  | 'home'
  | 'accueil'
  | 'learning_path'
  | 'parcours'
  | 'mon_parcours'
  | 'training'
  | 'entrainement'
  | 'certifications'
  | 'cert_exam'
  | 'progress'
  | 'progression'
  | 'ma_progression'
  | 'sandbox'
  | 'sql_lab'
  | 'skills'
  | 'skill_map'
  | 'spaced_repetition'
  | 'syllabus'
  | 'certification_tracks'
  | 'flashcards'
  | 'activity'
  | 'analytics'
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
 * Centralized mapping between marketing/space/legacy destination identifiers
 * and the actual NavigationTab and modal runners within the DBMastery Studio workspace.
 */
export const LANDING_DESTINATION_MAP: Record<string, ResolvedNavigation> = {
  // Primary 5 spaces
  home: { tab: 'dashboard' },
  accueil: { tab: 'dashboard' },
  learning_path: { tab: 'syllabus' },
  parcours: { tab: 'syllabus' },
  mon_parcours: { tab: 'syllabus' },
  training: { tab: 'exams' },
  entrainement: { tab: 'exams' },
  certifications: { tab: 'cert_exam' },
  progress: { tab: 'skills' },
  progression: { tab: 'skills' },
  ma_progression: { tab: 'skills' },

  // Legacy & direct tab keys (100% preserved compatibility)
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
  analytics: { tab: 'analytics' },
  cert_exam: { tab: 'cert_exam' },
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

  console.warn(`[Navigation] Unknown destination requested: "${rawDestination}". Falling back safely to dashboard.`);
  return { tab: 'dashboard' };
}
