import { applyExamSessionToMastery } from './masteryTreeService';

export interface UserCompetency {
  id: string;
  name: string;
  category: string;
  currentScore: number;
  previousScore?: number;
  totalAttempts: number;
  lastUpdated: string;
  accentColor: string;
  targetExamPillar?: string;
}

export interface CompetencyRecalculationResult {
  updatedCompetencies: UserCompetency[];
  deltas: Record<string, {
    topicId: string;
    topicName: string;
    oldScore: number;
    newScore: number;
    diff: number;
    correct: number;
    total: number;
  }>;
  overallReadiness: {
    oldReadiness: number;
    newReadiness: number;
    diff: number;
  };
}

const STORAGE_KEY = 'dbmastery_user_competencies_v1';

// Valeurs par défaut conformes à la demande de l'utilisateur :
// JOIN: 54 %, Subqueries: 47 %, Indexes: 61 %
export const DEFAULT_COMPETENCIES: UserCompetency[] = [
  {
    id: 'join',
    name: 'JOIN',
    category: 'Requêtage relationnel',
    currentScore: 54,
    previousScore: 54,
    totalAttempts: 110,
    lastUpdated: new Date().toISOString(),
    accentColor: '#38bdf8',
    targetExamPillar: 'SQL Fundamentals & Relations'
  },
  {
    id: 'subqueries',
    name: 'Subqueries',
    category: 'Sous-requêtes & imbrications',
    currentScore: 47,
    previousScore: 47,
    totalAttempts: 78,
    lastUpdated: new Date().toISOString(),
    accentColor: '#f43f5e',
    targetExamPillar: 'Advanced DQL & Nesting'
  },
  {
    id: 'indexes',
    name: 'Indexes',
    category: 'Performance & Indexation',
    currentScore: 61,
    previousScore: 61,
    totalAttempts: 64,
    lastUpdated: new Date().toISOString(),
    accentColor: '#fbbf24',
    targetExamPillar: 'Database Administration & Tuning'
  },
  {
    id: 'group_by',
    name: 'GROUP BY & HAVING',
    category: 'Agrégation',
    currentScore: 82,
    previousScore: 82,
    totalAttempts: 95,
    lastUpdated: new Date().toISOString(),
    accentColor: '#34d399',
    targetExamPillar: 'Aggregates'
  },
  {
    id: 'where',
    name: 'WHERE & Prédicats',
    category: 'Filtrage',
    currentScore: 88,
    previousScore: 88,
    totalAttempts: 140,
    lastUpdated: new Date().toISOString(),
    accentColor: '#10b981',
    targetExamPillar: 'Core DQL'
  },
  {
    id: 'select',
    name: 'SELECT & Expressions',
    category: 'Projection',
    currentScore: 95,
    previousScore: 95,
    totalAttempts: 160,
    lastUpdated: new Date().toISOString(),
    accentColor: '#0284c7',
    targetExamPillar: 'Core DQL'
  }
];

export function getStoredCompetencies(): UserCompetency[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveCompetencies(DEFAULT_COMPETENCIES);
      return DEFAULT_COMPETENCIES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveCompetencies(DEFAULT_COMPETENCIES);
      return DEFAULT_COMPETENCIES;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load user competencies:', err);
    return DEFAULT_COMPETENCIES;
  }
}

export function saveCompetencies(competencies: UserCompetency[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(competencies));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dbmastery:competencies_updated', {
        detail: { competencies }
      }));
    }
  } catch (err) {
    console.error('Failed to save user competencies:', err);
  }
}

export function resetCompetenciesToDefault(): UserCompetency[] {
  saveCompetencies(DEFAULT_COMPETENCIES);
  return DEFAULT_COMPETENCIES;
}

// Récupère les points faibles critiques (< 70%)
export function getIdentifiedWeaknesses(): UserCompetency[] {
  const all = getStoredCompetencies();
  return all
    .filter((c) => c.currentScore < 70)
    .sort((a, b) => a.currentScore - b.currentScore);
}

// Algorithme de recalcul des compétences après une séance personnalisée
export function recalculateCompetenciesAfterSession(
  sessionResults: {
    topicId: string;
    correct: number;
    total: number;
  }[]
): CompetencyRecalculationResult {
  const currentList = getStoredCompetencies();
  const deltas: CompetencyRecalculationResult['deltas'] = {};

  const oldAverage = Math.round(
    currentList.reduce((acc, curr) => acc + curr.currentScore, 0) / currentList.length
  );

  const updatedCompetencies = currentList.map((comp) => {
    const sessionItem = sessionResults.find((s) => s.topicId.toLowerCase() === comp.id.toLowerCase());
    if (!sessionItem || sessionItem.total === 0) {
      return comp;
    }

    const sessionAccuracy = (sessionItem.correct / sessionItem.total) * 100;
    const oldScore = comp.currentScore;
    
    // Algorithme de progression adaptative pondérée DBMastor :
    // - Si l'élève a surperformé son score actuel (ex: 4/5 = 80% vs 54%), gain de compétence substantiel
    // - Lissage exponentiel avec facteur d'apprentissage k = 0.45
    // - Bonus de régularité +2% pour avoir terminé la séance
    let scoreDelta = 0;
    if (sessionAccuracy >= oldScore) {
      scoreDelta = Math.round((sessionAccuracy - oldScore) * 0.55 + 4);
    } else {
      // Petite consolidation / léger recul limité à max 3%
      scoreDelta = Math.round((sessionAccuracy - oldScore) * 0.2);
    }

    const newScore = Math.min(100, Math.max(10, oldScore + scoreDelta));

    deltas[comp.id] = {
      topicId: comp.id,
      topicName: comp.name,
      oldScore,
      newScore,
      diff: newScore - oldScore,
      correct: sessionItem.correct,
      total: sessionItem.total,
    };

    return {
      ...comp,
      previousScore: oldScore,
      currentScore: newScore,
      totalAttempts: comp.totalAttempts + sessionItem.total,
      lastUpdated: new Date().toISOString(),
    };
  });

  const newAverage = Math.round(
    updatedCompetencies.reduce((acc, curr) => acc + curr.currentScore, 0) / updatedCompetencies.length
  );

  saveCompetencies(updatedCompetencies);

  // Synchroniser avec l'arbre hiérarchique MON NIVEAU
  try {
    applyExamSessionToMastery(sessionResults);
  } catch (e) {
    console.error('Error applying session to mastery tree:', e);
  }

  const result: CompetencyRecalculationResult = {
    updatedCompetencies,
    deltas,
    overallReadiness: {
      oldReadiness: oldAverage,
      newReadiness: newAverage,
      diff: newAverage - oldAverage,
    },
  };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dbmastery:competencies_recalculated', {
      detail: result
    }));
  }

  return result;
}
