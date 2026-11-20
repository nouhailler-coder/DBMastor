import { CertificationTrackId, NavigationTab } from '../types';

export type LearningObjective =
  | 'learn_sql'
  | 'prepare_certification'
  | 'improve_dba'
  | 'interview_prep';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'unsure';

export interface LastActivityRecord {
  tab: NavigationTab;
  labelFr: string;
  labelEn: string;
  topic?: string;
  timestamp: string;
}

export interface UserPreferences {
  onboardingCompleted: boolean;
  objective: LearningObjective | null;
  /** null = Apprendre SQL sans certification */
  targetCert: CertificationTrackId | null;
  level: SkillLevel | null;
  /** Date ISO optionnelle (YYYY-MM-DD) configurée par l'utilisateur */
  targetExamDate: string | null;
  lastActivity: LastActivityRecord | null;
  updatedAt: string;
}

const PREFS_STORAGE_KEY = 'dbmastery_user_preferences_v2';
const LEGACY_ONBOARDING_KEY = 'dbmastery_onboarding_completed_v1';

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  onboardingCompleted: false,
  objective: null,
  targetCert: null,
  level: null,
  targetExamDate: null,
  lastActivity: null,
  updatedAt: '',
};

const TAB_LABELS: Record<NavigationTab, { fr: string; en: string }> = {
  dashboard: { fr: 'Tableau de bord', en: 'Dashboard' },
  syllabus: { fr: 'Fiches & syllabus', en: 'Study Sheets & Syllabus' },
  glossary: { fr: 'Glossaire SQL', en: 'SQL Glossary' },
  exams: { fr: 'Quiz & apprentissage', en: 'Adaptive Quiz' },
  sandbox: { fr: 'Lab SQL interactif', en: 'Interactive SQL Lab' },
  flashcards: { fr: 'Flashcards', en: 'Flashcards' },
  spaced_repetition: { fr: 'Répétition espacée', en: 'Spaced Repetition' },
  cert_exam: { fr: 'Examen blanc (60Q)', en: 'Practice Exam (60Q)' },
  skills: { fr: 'Carte de compétences', en: 'Skill Map' },
  analytics: { fr: 'Statistiques & badges', en: 'Stats & Badges' },
  activity: { fr: 'Mon activité', en: 'My Activity' },
  access_control: { fr: 'Contrôle d\'accès', en: 'Access Control' },
};

export function loadUserPreferences(): UserPreferences {
  try {
    const legacyCompleted = localStorage.getItem(LEGACY_ONBOARDING_KEY) === 'true';
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_USER_PREFERENCES,
        onboardingCompleted: legacyCompleted,
      };
    }
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      ...DEFAULT_USER_PREFERENCES,
      ...parsed,
      onboardingCompleted: Boolean(parsed.onboardingCompleted || legacyCompleted),
    };
  } catch {
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

export function saveUserPreferences(next: Partial<UserPreferences>): UserPreferences {
  const current = loadUserPreferences();
  const merged: UserPreferences = {
    ...current,
    ...next,
    onboardingCompleted: Boolean(
      next.onboardingCompleted !== undefined ? next.onboardingCompleted : current.onboardingCompleted
    ),
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(merged));
    if (merged.onboardingCompleted) {
      localStorage.setItem(LEGACY_ONBOARDING_KEY, 'true');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dbmastery:preferences_updated', { detail: merged }));
    }
  } catch {
    // ignore storage errors
  }

  return merged;
}

/**
 * Fusionne sans écraser les préférences existantes lors d'une reconnexion
 */
export function mergeUserPreferences(remote: Partial<UserPreferences> | null | undefined): UserPreferences {
  const local = loadUserPreferences();
  if (!remote) return local;

  const localTs = local.updatedAt ? Date.parse(local.updatedAt) : 0;
  const remoteTs = remote.updatedAt ? Date.parse(remote.updatedAt) : 0;
  const preferRemote = remoteTs > localTs;

  const merged: UserPreferences = {
    onboardingCompleted: Boolean(local.onboardingCompleted || remote.onboardingCompleted),
    objective: (preferRemote ? remote.objective : local.objective) ?? local.objective ?? remote.objective ?? null,
    targetCert: preferRemote
      ? remote.targetCert !== undefined
        ? remote.targetCert
        : local.targetCert
      : local.targetCert !== undefined
      ? local.targetCert
      : remote.targetCert ?? null,
    level: (preferRemote ? remote.level : local.level) ?? local.level ?? remote.level ?? null,
    targetExamDate:
      (preferRemote ? remote.targetExamDate : local.targetExamDate) ??
      local.targetExamDate ??
      remote.targetExamDate ??
      null,
    lastActivity:
      (preferRemote ? remote.lastActivity : local.lastActivity) ??
      local.lastActivity ??
      remote.lastActivity ??
      null,
    updatedAt: new Date(Math.max(localTs, remoteTs, Date.now())).toISOString(),
  };

  return saveUserPreferences(merged);
}

export function recordLastLearningActivity(tab: NavigationTab, topic?: string): UserPreferences | null {
  if (tab === 'dashboard' || tab === 'access_control') {
    return null;
  }
  const labels = TAB_LABELS[tab] || { fr: 'Entraînement', en: 'Training' };
  return saveUserPreferences({
    lastActivity: {
      tab,
      labelFr: labels.fr,
      labelEn: labels.en,
      topic,
      timestamp: new Date().toISOString(),
    },
  });
}

export function getFutureExamCountdown(
  targetExamDate: string | null | undefined,
  lang: 'fr' | 'en'
): { formattedDate: string; daysRemaining: number } | null {
  if (!targetExamDate) return null;
  const parsed = new Date(`${targetExamDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((parsed.getTime() - today.getTime()) / 86400000);
  if (diffDays <= 0) {
    return null;
  }

  const formattedDate = parsed.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return { formattedDate, daysRemaining: diffDays };
}
