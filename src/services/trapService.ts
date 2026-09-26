import { QuestionTrapMetadata, TrapDiagnosticRecord } from '../types';

const STORAGE_KEY = 'dbmastery_trap_history_v1';

/**
 * Pièges de certification par défaut pré-calibrés
 * Reflétant les points faibles réels de l'étudiant (JOIN 54%, Subqueries 47%, Indexes 61%)
 */
export const DEFAULT_TRAP_RECORDS: TrapDiagnosticRecord[] = [
  {
    trapId: 'left_vs_inner_join',
    trap: 'LEFT vs INNER JOIN',
    topic: 'SQL',
    subtopic: 'JOIN',
    difficulty: 3,
    concepts: ['NULL', 'JOIN'],
    estimatedTime: 45,
    totalAttempts: 5,
    errorCount: 4,
    successCount: 1,
    lastEncountered: new Date().toISOString(),
    warningFr: "Tu fais régulièrement l'erreur INNER JOIN vs LEFT JOIN.",
    warningEn: 'You regularly make the INNER JOIN vs LEFT JOIN mistake.',
    antidoteRuleFr: 'Placer une condition sur la table externe dans le WHERE élimine les NULLs post-jointure et convertit silencieusement le LEFT JOIN en INNER JOIN. La condition DOIT être dans la clause ON.',
    antidoteRuleEn: 'Filtering an outer table in the WHERE clause discards NULL rows, silently turning a LEFT JOIN into an INNER JOIN. Place the condition in the ON clause.',
    masteryStatus: 'critical_alert',
  },
  {
    trapId: 'null_not_in_3vl',
    trap: 'NOT IN avec NULL',
    topic: 'SQL',
    subtopic: 'Subqueries',
    difficulty: 4,
    concepts: ['NULL', 'NOT IN', '3VL'],
    estimatedTime: 50,
    totalAttempts: 4,
    errorCount: 3,
    successCount: 1,
    lastEncountered: new Date(Date.now() - 3600000 * 2).toISOString(),
    warningFr: "Tu tombes régulièrement dans le piège de la logique ternaire avec NOT IN et NULL (renvoie 0 ligne).",
    warningEn: 'You consistently fall for the three-valued logic trap with NOT IN and NULL values (yields 0 rows).',
    antidoteRuleFr: 'Si une sous-requête avec NOT IN contient un seul NULL, la condition globale produit UNKNOWN pour chaque ligne. Utiliser NOT EXISTS ou `WHERE col IS NOT NULL`.',
    antidoteRuleEn: 'If a NOT IN subquery contains even a single NULL, every test evaluates to UNKNOWN. Use NOT EXISTS instead.',
    masteryStatus: 'critical_alert',
  },
  {
    trapId: 'index_suppression_func',
    trap: "Suppression d'index par fonction",
    topic: 'Administration',
    subtopic: 'Indexes',
    difficulty: 3,
    concepts: ['B-Tree', 'SARGABLE', 'Index Seek'],
    estimatedTime: 45,
    totalAttempts: 3,
    errorCount: 2,
    successCount: 1,
    lastEncountered: new Date(Date.now() - 3600000 * 5).toISOString(),
    warningFr: "Tu appliques fréquemment des fonctions sur des colonnes indexées, neutralisant l'index seek.",
    warningEn: 'You frequently wrap indexed columns with functions, forcing full table scans instead of index seeks.',
    antidoteRuleFr: 'Une expression non sargable comme `WHERE UPPER(nom) = \'DUPONT\'` empêche le parcours d\'index B-Tree. Créer un index basé sur une fonction ou conserver la colonne brute.',
    antidoteRuleEn: 'Non-sargable expressions like `UPPER(col) = val` disable B-Tree seeks. Use a function-based index or preserve raw columns.',
    masteryStatus: 'critical_alert',
  },
  {
    trapId: 'where_vs_having_aggregates',
    trap: 'HAVING vs WHERE',
    topic: 'SQL',
    subtopic: 'GROUP BY',
    difficulty: 2,
    concepts: ['GROUP BY', 'AGGREGATION', 'WHERE'],
    estimatedTime: 40,
    totalAttempts: 4,
    errorCount: 1,
    successCount: 3,
    lastEncountered: new Date(Date.now() - 3600000 * 8).toISOString(),
    warningFr: "Tu confonds le filtrage avant agrégation (WHERE) et le filtrage après agrégation (HAVING).",
    warningEn: 'You confuse pre-aggregate filtering (WHERE) with post-aggregate filtering (HAVING).',
    antidoteRuleFr: 'WHERE filtre les tuples individuels avant constitution des groupes. HAVING filtre les groupes formés. Les fonctions d\'agrégation (SUM, AVG, COUNT) sont interdites dans le WHERE.',
    antidoteRuleEn: 'WHERE eliminates raw rows before grouping. HAVING filters aggregated partitions. Aggregate functions are prohibited in WHERE.',
    masteryStatus: 'learning',
  },
  {
    trapId: 'phantom_vs_non_repeatable_read',
    trap: 'Non-Repeatable Read vs Phantom Read',
    topic: 'Transactions',
    subtopic: 'Isolation',
    difficulty: 4,
    concepts: ['ACID', 'REPEATABLE READ', 'SERIALIZABLE'],
    estimatedTime: 60,
    totalAttempts: 3,
    errorCount: 2,
    successCount: 1,
    lastEncountered: new Date(Date.now() - 3600000 * 12).toISOString(),
    warningFr: "Tu confonds Non-Repeatable Read (mise à jour) et Phantom Read (insertion de nouvelle ligne).",
    warningEn: 'You confuse Non-Repeatable Read (modified existing row) and Phantom Read (newly inserted row).',
    antidoteRuleFr: 'Non-Repeatable Read = une ligne existante relue avec de nouvelles valeurs (prévenu par REPEATABLE READ). Phantom Read = de nouvelles lignes apparaissent dans la plage (seul SERIALIZABLE protège rigoureusement).',
    antidoteRuleEn: 'Non-Repeatable Read modifies an existing row. Phantom Read inserts new rows in the predicate range. Only SERIALIZABLE eliminates both.',
    masteryStatus: 'critical_alert',
  },
  {
    trapId: 'savepoint_lock_retention',
    trap: 'ROLLBACK TO SAVEPOINT & Verrous',
    topic: 'Transactions',
    subtopic: 'Locking',
    difficulty: 3,
    concepts: ['SAVEPOINT', 'LOCKS', 'ROLLBACK'],
    estimatedTime: 45,
    totalAttempts: 2,
    errorCount: 1,
    successCount: 1,
    lastEncountered: new Date(Date.now() - 3600000 * 24).toISOString(),
    warningFr: "Tu supposes à tort qu'un ROLLBACK partiel libère les verrous de session.",
    warningEn: 'You incorrectly assume partial rollback releases acquired locks.',
    antidoteRuleFr: '`ROLLBACK TO SAVEPOINT` annule les modifications DML mais MAINTIENT la transaction active et conserve tous les verrous exclusifs jusqu\'au COMMIT ou ROLLBACK final.',
    antidoteRuleEn: 'ROLLBACK TO SAVEPOINT undoes changes post-savepoint but preserves active transaction state and locks until final COMMIT.',
    masteryStatus: 'learning',
  },
];

/**
 * Récupère l'historique complet des pièges stocké localement
 */
export function getStoredTraps(): TrapDiagnosticRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveTraps(DEFAULT_TRAP_RECORDS);
      return DEFAULT_TRAP_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveTraps(DEFAULT_TRAP_RECORDS);
      return DEFAULT_TRAP_RECORDS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load trap records:', err);
    return DEFAULT_TRAP_RECORDS;
  }
}

/**
 * Sauvegarde la liste des pièges et émet un événement
 */
export function saveTraps(traps: TrapDiagnosticRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(traps));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dbmastery:traps_updated', {
        detail: { traps }
      }));
    }
  } catch (err) {
    console.error('Failed to save trap records:', err);
  }
}

/**
 * Enregistre une tentative sur une question avec métadonnées de piège
 */
export function recordTrapAttempt(
  meta: QuestionTrapMetadata,
  isSuccess: boolean
): {
  record: TrapDiagnosticRecord;
  isRecurringTrap: boolean;
  alertMessageFr: string;
} {
  const traps = getStoredTraps();
  const trapKey = meta.trap.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  let existingIndex = traps.findIndex(
    (t) => t.trap.toLowerCase() === meta.trap.toLowerCase() || t.trapId === trapKey
  );

  let updatedRecord: TrapDiagnosticRecord;

  if (existingIndex >= 0) {
    const prev = traps[existingIndex];
    const newTotal = prev.totalAttempts + 1;
    const newErrors = prev.errorCount + (isSuccess ? 0 : 1);
    const newSuccess = prev.successCount + (isSuccess ? 1 : 0);

    let status: 'critical_alert' | 'learning' | 'mastered' = 'learning';
    if (newErrors >= 2 && newErrors / newTotal >= 0.4) {
      status = 'critical_alert';
    } else if (newSuccess >= 3 && newErrors / newTotal < 0.25) {
      status = 'mastered';
    }

    updatedRecord = {
      ...prev,
      totalAttempts: newTotal,
      errorCount: newErrors,
      successCount: newSuccess,
      lastEncountered: new Date().toISOString(),
      masteryStatus: status,
      difficulty: meta.difficulty || prev.difficulty,
      estimatedTime: meta.estimatedTime || prev.estimatedTime,
      concepts: Array.from(new Set([...prev.concepts, ...meta.concepts])),
    };
    traps[existingIndex] = updatedRecord;
  } else {
    updatedRecord = {
      trapId: trapKey,
      trap: meta.trap,
      topic: meta.topic,
      subtopic: meta.subtopic,
      difficulty: meta.difficulty || 3,
      concepts: meta.concepts || [],
      estimatedTime: meta.estimatedTime || 45,
      totalAttempts: 1,
      errorCount: isSuccess ? 0 : 1,
      successCount: isSuccess ? 1 : 0,
      lastEncountered: new Date().toISOString(),
      warningFr: meta.warningMsgFr || `Tu fais régulièrement l'erreur sur ${meta.trap}.`,
      warningEn: meta.warningMsgEn || `You regularly make the mistake on ${meta.trap}.`,
      antidoteRuleFr: meta.antidoteRuleFr || 'Vérifiez la règle fondamentale du standard SQL sur ce concept.',
      antidoteRuleEn: meta.antidoteRuleEn || 'Check standard SQL rules on this concept.',
      masteryStatus: isSuccess ? 'learning' : 'critical_alert',
    };
    traps.unshift(updatedRecord);
  }

  saveTraps(traps);
  window.dispatchEvent(new CustomEvent('dbmastery:trap_recorded', { detail: updatedRecord }));

  const isRecurring = updatedRecord.errorCount >= 2;
  const alertMsg = isRecurring 
    ? `⚠️ ${updatedRecord.warningFr}`
    : isSuccess 
    ? `✓ Bravo ! Tu as contourné le piège « ${updatedRecord.trap} ».` 
    : `⚠️ Piège détecté : ${updatedRecord.trap}.`;

  return {
    record: updatedRecord,
    isRecurringTrap: isRecurring,
    alertMessageFr: alertMsg,
  };
}

/**
 * Récupère les pièges récurrents (au moins 2 erreurs ou taux d'échec > 40%)
 */
export function getRecurringTraps(): TrapDiagnosticRecord[] {
  const traps = getStoredTraps();
  return traps
    .filter((t) => t.errorCount >= 2 || (t.totalAttempts >= 2 && t.errorCount / t.totalAttempts >= 0.5))
    .sort((a, b) => b.errorCount - a.errorCount);
}

/**
 * Récupère le piège le plus critique (ex: "LEFT vs INNER JOIN")
 */
export function getTopCriticalTrap(): TrapDiagnosticRecord {
  const recurrings = getRecurringTraps();
  if (recurrings.length > 0) {
    return recurrings[0];
  }
  const traps = getStoredTraps();
  return traps[0] || DEFAULT_TRAP_RECORDS[0];
}

/**
 * Statistiques globales sur les pièges
 */
export function getTrapDiagnosticsSummary() {
  const traps = getStoredTraps();
  const recurring = getRecurringTraps();
  const totalErrors = traps.reduce((acc, t) => acc + t.errorCount, 0);
  const totalAttempts = traps.reduce((acc, t) => acc + t.totalAttempts, 0);
  const masteredCount = traps.filter((t) => t.masteryStatus === 'mastered').length;

  return {
    totalTrapsMonitored: traps.length,
    criticalAlertsCount: recurring.length,
    totalErrors,
    totalAttempts,
    masteredCount,
    overallTrapResistance: totalAttempts > 0 ? Math.round(((totalAttempts - totalErrors) / totalAttempts) * 100) : 0,
    topTrap: getTopCriticalTrap(),
    recurringTraps: recurring,
  };
}

/**
 * Réinitialise aux pièges initiaux
 */
export function resetTrapsToDefault(): TrapDiagnosticRecord[] {
  saveTraps(DEFAULT_TRAP_RECORDS);
  return DEFAULT_TRAP_RECORDS;
}
