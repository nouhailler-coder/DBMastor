import { INITIAL_DIAGNOSTIC_QUESTIONS, DiagnosticQuestion } from '../data/initialDiagnosticData';
import {
  loadMasteryTree,
  saveMasteryTree,
  MasteryTreeData,
  computeMasteryStatus
} from './masteryTreeService';

export interface DiagnosticDomainScore {
  domainId: 'sql' | 'modelisation' | 'transactions' | 'indexation' | 'administration';
  nameFr: string;
  nameEn: string;
  score: number; // 0-100%
  correct: number;
  total: number;
  barAscii: string; // e.g. "████████░░"
  status: 'mastered' | 'in_progress' | 'critical_gap';
}

export interface InitialDiagnosticResult {
  completedAt: string;
  totalQuestions: number;
  totalCorrect: number;
  overallScore: number; // 0-100%
  durationSeconds: number;
  domainScores: DiagnosticDomainScore[];
  userAnswers: Record<string, string>; // questionId -> chosenOptionId
  rawAsciiProfile: string;
  recommendationsFr: string[];
  recommendationsEn: string[];
  weakestDomainId: string;
  strongestDomainId: string;
}

const DIAGNOSTIC_STORAGE_KEY = 'dbmastery_initial_diagnostic_result_v1';
const DIAGNOSTIC_DISMISSED_KEY = 'dbmastery_initial_diagnostic_dismissed_v1';

export function hasCompletedInitialDiagnostic(): boolean {
  try {
    const raw = localStorage.getItem(DIAGNOSTIC_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && parsed.completedAt);
  } catch {
    return false;
  }
}

export function getSavedInitialDiagnostic(): InitialDiagnosticResult | null {
  try {
    const raw = localStorage.getItem(DIAGNOSTIC_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InitialDiagnosticResult;
  } catch {
    return null;
  }
}

export function isDiagnosticDismissed(): boolean {
  try {
    return localStorage.getItem(DIAGNOSTIC_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function dismissInitialDiagnostic(): void {
  try {
    localStorage.setItem(DIAGNOSTIC_DISMISSED_KEY, 'true');
  } catch {
    // ignore
  }
}

export function resetInitialDiagnostic(): void {
  try {
    localStorage.removeItem(DIAGNOSTIC_STORAGE_KEY);
    localStorage.removeItem(DIAGNOSTIC_DISMISSED_KEY);
    window.dispatchEvent(new CustomEvent('dbmastery:diagnostic_reset'));
  } catch {
    // ignore
  }
}

/**
 * Génère une barre ASCII de 10 blocs proportionnelle au pourcentage (ex: 78% -> ████████░░)
 */
export function generateAsciiBar(score: number, length: number = 10): string {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const filledCount = Math.round((clamped / 100) * length);
  const emptyCount = length - filledCount;
  return '█'.repeat(filledCount) + '░'.repeat(emptyCount);
}

/**
 * Évalue les réponses de l'utilisateur sur les 20 questions du diagnostic
 * Calcule les scores par domaine, génère le profil ASCII et met à jour l'arbre de compétences.
 */
export function evaluateInitialDiagnostic(
  userAnswers: Record<string, string>,
  durationSeconds: number = 0
): InitialDiagnosticResult {
  const domainsMap: Record<
    'sql' | 'modelisation' | 'transactions' | 'indexation' | 'administration',
    {
      nameFr: string;
      nameEn: string;
      correct: number;
      total: number;
    }
  > = {
    sql: { nameFr: 'SQL', nameEn: 'SQL', correct: 0, total: 0 },
    modelisation: { nameFr: 'Modélisation', nameEn: 'Data Modeling', correct: 0, total: 0 },
    transactions: { nameFr: 'Transactions', nameEn: 'Transactions & ACID', correct: 0, total: 0 },
    indexation: { nameFr: 'Indexation', nameEn: 'Indexing & Tuning', correct: 0, total: 0 },
    administration: { nameFr: 'Administration', nameEn: 'Administration & Security', correct: 0, total: 0 },
  };

  const subtopicMap: Record<string, { correct: number; total: number; domainId: string }> = {};

  let totalCorrect = 0;
  const totalQuestions = INITIAL_DIAGNOSTIC_QUESTIONS.length;

  INITIAL_DIAGNOSTIC_QUESTIONS.forEach((q) => {
    const isCorrect = userAnswers[q.id] === q.correctOptionId;
    if (isCorrect) {
      totalCorrect++;
    }

    if (domainsMap[q.domainId]) {
      domainsMap[q.domainId].total++;
      if (isCorrect) {
        domainsMap[q.domainId].correct++;
      }
    }

    if (!subtopicMap[q.subtopicId]) {
      subtopicMap[q.subtopicId] = { correct: 0, total: 0, domainId: q.domainId };
    }
    subtopicMap[q.subtopicId].total++;
    if (isCorrect) {
      subtopicMap[q.subtopicId].correct++;
    }
  });

  const overallScore = Math.round((totalCorrect / totalQuestions) * 100);

  const domainScores: DiagnosticDomainScore[] = (
    Object.keys(domainsMap) as (keyof typeof domainsMap)[]
  ).map((domId) => {
    const d = domainsMap[domId];
    const score = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
    return {
      domainId: domId,
      nameFr: d.nameFr,
      nameEn: d.nameEn,
      score,
      correct: d.correct,
      total: d.total,
      barAscii: generateAsciiBar(score, 10),
      status: computeMasteryStatus(score),
    };
  });

  // Triage pour identifier point fort et point faible
  const sortedDomains = [...domainScores].sort((a, b) => a.score - b.score);
  const weakest = sortedDomains[0];
  const strongest = sortedDomains[sortedDomains.length - 1];

  // Construction du profil ASCII exact comme demandé par l'utilisateur
  // SQL                    ████████░░ 78 %
  // Modélisation            ██████░░░░ 61 %
  // Transactions            ████░░░░░░ 43 %
  // Indexation              ███░░░░░░░ 32 %
  // Administration          ███████░░░ 71 %
  const padRight = (str: string, width: number) => {
    return str + ' '.repeat(Math.max(0, width - str.length));
  };

  const asciiLines: string[] = [
    'Votre profil',
    '',
    ...domainScores.map(
      (d) => `${padRight(d.nameFr, 24)} ${d.barAscii} ${d.score} %`
    ),
    '',
    'Votre parcours est maintenant personnalisé.',
  ];
  const rawAsciiProfile = asciiLines.join('\n');

  // Génération des recommandations pédagogiques adaptatives pour l'IA
  const recommendationsFr: string[] = [];
  const recommendationsEn: string[] = [];

  domainScores.forEach((d) => {
    if (d.score < 50) {
      recommendationsFr.push(
        `Alerte critique sur ${d.nameFr} (${d.score}%) : vos prochaines séances IA intégreront en priorité des questions d'ancrage fondamental et des fiches mémos.`
      );
      recommendationsEn.push(
        `Critical gap in ${d.nameEn} (${d.score}%): next AI sessions will prioritize fundamental concepts and flashcards.`
      );
    } else if (d.score < 75) {
      recommendationsFr.push(
        `Axe d'accélération sur ${d.nameFr} (${d.score}%) : séances de consolidation recommandées sur les pièges fréquents.`
      );
      recommendationsEn.push(
        `Reinforcement recommended for ${d.nameEn} (${d.score}%): targeted practice on frequent exam traps.`
      );
    } else {
      recommendationsFr.push(
        `Base solide sur ${d.nameFr} (${d.score}%) : niveau maintenu avec des quiz éclairs espacés.`
      );
      recommendationsEn.push(
        `Solid foundation in ${d.nameEn} (${d.score}%): maintain through spaced repetition.`
      );
    }
  });

  const result: InitialDiagnosticResult = {
    completedAt: new Date().toISOString(),
    totalQuestions,
    totalCorrect,
    overallScore,
    durationSeconds,
    domainScores,
    userAnswers,
    rawAsciiProfile,
    recommendationsFr,
    recommendationsEn,
    weakestDomainId: weakest ? weakest.domainId : 'indexation',
    strongestDomainId: strongest ? strongest.domainId : 'sql',
  };

  // Sauvegarde locale du résultat
  try {
    localStorage.setItem(DIAGNOSTIC_STORAGE_KEY, JSON.stringify(result));
    localStorage.removeItem(DIAGNOSTIC_DISMISSED_KEY);
  } catch (err) {
    console.error('Failed to store diagnostic result', err);
  }

  // MISE À JOUR DU CŒUR DE L'APPLICATION (Arbre hiérarchique MON NIVEAU)
  applyDiagnosticToMasteryTree(domainScores, subtopicMap);

  // Émission de l'événement global pour synchroniser les composants
  window.dispatchEvent(new CustomEvent('dbmastery:diagnostic_completed', { detail: result }));
  window.dispatchEvent(new CustomEvent('dbmastery:mastery_updated'));

  return result;
}

/**
 * Calibre l'arbre hiérarchique de compétences (`masteryTreeService`) selon les résultats du diagnostic initial
 */
function applyDiagnosticToMasteryTree(
  domainScores: DiagnosticDomainScore[],
  subtopicMap: Record<string, { correct: number; total: number; domainId: string }>
): void {
  const currentTree: MasteryTreeData = loadMasteryTree();

  // Mise à jour de chaque domaine et sous-notion
  domainScores.forEach((dScore) => {
    const domain = currentTree.domains.find((d) => d.id === dScore.domainId);
    if (!domain) return;

    domain.previousScore = domain.score;
    domain.score = dScore.score;
    domain.status = dScore.status;

    // Ajustement proportionnel des sous-notions de ce domaine
    domain.subtopics.forEach((sub) => {
      sub.previousScore = sub.score;
      const subStat = subtopicMap[sub.id];
      if (subStat && subStat.total > 0) {
        // Si le sous-sujet a été testé directement dans le diagnostic
        const directScore = Math.round((subStat.correct / subStat.total) * 100);
        sub.score = directScore;
        sub.totalAttempts += subStat.total;
        sub.correctAttempts += subStat.correct;
      } else {
        // Sinon, alignement proportionnel pondéré avec le score du domaine
        const delta = dScore.score - domain.previousScore;
        const adjusted = Math.max(25, Math.min(98, Math.round(sub.score + delta * 0.4)));
        sub.score = adjusted;
      }
      sub.status = computeMasteryStatus(sub.score);
    });
  });

  // Recalcul du score global
  const allSubtopics = currentTree.domains.flatMap((d) => d.subtopics);
  const newOverall = Math.round(
    allSubtopics.reduce((acc, s) => acc + s.score, 0) / allSubtopics.length
  );

  currentTree.overallScore = newOverall;
  currentTree.lastUpdated = new Date().toISOString();
  currentTree.totalQuestionsAnalyzed += 20;

  saveMasteryTree(currentTree);
}
