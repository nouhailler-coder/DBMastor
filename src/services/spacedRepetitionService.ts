import { SpacedRepetitionItem, SpacedRepetitionStats, SpacedReviewRating, CertificationTrackId } from '../types';

const STORAGE_KEY = 'dbmastery_spaced_repetition_items_v1';
const TIME_OFFSET_KEY = 'dbmastery_spaced_virtual_time_offset_days_v1';

/**
 * Catalogue initial de notions calibrées couvrant SQL, Modélisation, Transactions,
 * Administration, Index et Sécurité.
 * Conforme à la demande utilisateur :
 * - mastery (0-100)
 * - stability (jours)
 * - difficulty (1-10)
 * - lastReviewedAt (ISO)
 * - nextReviewAt (ISO)
 * - successCount (number)
 * - failureCount (number)
 */
export const INITIAL_SPACED_NOTIONS: SpacedRepetitionItem[] = [
  {
    id: 'sr-join-left-null',
    conceptId: 'sql-left-join-null-traps',
    titleFr: 'Prédicat WHERE sur table droite d\'un LEFT JOIN',
    titleEn: 'WHERE predicate on right table of a LEFT JOIN',
    pillar: 'sql',
    trackId: 'oracle-1z0-071',
    promptFr: 'Pourquoi un prédicat "WHERE b.status = \'ACTIVE\'" transforme-t-il silencieusement un LEFT JOIN en INNER JOIN ?',
    promptEn: 'Why does a "WHERE b.status = \'ACTIVE\'" clause silently convert a LEFT JOIN into an INNER JOIN?',
    codeSnippet: 'SELECT a.id, b.status \nFROM table_a a \nLEFT JOIN table_b b ON a.b_id = b.id \nWHERE b.status = \'ACTIVE\';',
    correctAnswerFr: 'Le WHERE est évalué APRÈS la jointure. Les lignes non matchées de table_b ont b.status = NULL. L\'expression "NULL = \'ACTIVE\'" s\'évalue à UNKNOWN (faux), éliminant toutes les lignes préservées du LEFT JOIN.',
    correctAnswerEn: 'WHERE filters AFTER the join. Unmatched rows produce NULL for b.status. "NULL = \'ACTIVE\'" evaluates to UNKNOWN, discarding outer rows and turning the join into an INNER JOIN.',
    explanationFr: 'Pour conserver le comportement externe du LEFT JOIN, la condition doit impérativement figurer dans la clause ON : "LEFT JOIN table_b b ON a.b_id = b.id AND b.status = \'ACTIVE\'".',
    explanationEn: 'To retain outer join behavior, place the filter inside the ON clause: "LEFT JOIN table_b b ON a.b_id = b.id AND b.status = \'ACTIVE\'".',
    keyRuleFr: 'Règle d\'or : un filtre sur la table droite dans WHERE annule l\'effet externe du LEFT JOIN.',
    keyRuleEn: 'Golden rule: right-table WHERE filters annihilate outer join rows unless checking IS NULL.',
    mastery: 42,
    stability: 1.0,
    difficulty: 6.8,
    lastReviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    nextReviewAt: new Date(Date.now() - 3600000).toISOString(), // Dû aujourd'hui
    successCount: 1,
    failureCount: 2,
    interval: 1,
    reps: 0,
    lapses: 1,
    status: 'learning',
  },
  {
    id: 'sr-tx-read-committed-phantom',
    conceptId: 'tx-isolation-levels',
    titleFr: 'Niveau d\'isolation READ COMMITTED et Phantoms',
    titleEn: 'READ COMMITTED isolation level and Phantom Reads',
    pillar: 'transactions',
    trackId: 'oracle-1z0-071',
    promptFr: 'Quelles anomalies de concurrence sont autorisées sous le niveau standard READ COMMITTED ?',
    promptEn: 'Which concurrency anomalies are allowed under READ COMMITTED isolation?',
    codeSnippet: 'SET TRANSACTION ISOLATION LEVEL READ COMMITTED;\n-- Transaction T1 lit 10 lignes\n-- T2 insère 2 nouvelles lignes et COMMIT\n-- T1 réexécute la même requête',
    correctAnswerFr: 'Le niveau READ COMMITTED empêche les Dirty Reads (lectures sales), mais AUTORISE les Non-Repeatable Reads (lectures non répétables) et les Phantom Reads (lectures fantômes).',
    correctAnswerEn: 'READ COMMITTED prevents Dirty Reads, but ALLOWS Non-Repeatable Reads and Phantom Reads.',
    explanationFr: 'Chaque instruction SQL dans T1 voit un instantané (snapshot) frais au moment du début de l\'instruction, permettant de voir les modifications validées par d\'autres transactions entre deux SELECT de la même transaction.',
    explanationEn: 'Each SQL statement in T1 sees committed data at statement start time, allowing committed inserts/updates to become visible between statements.',
    keyRuleFr: 'Pour interdire les Phantom Reads en norme ANSI SQL, il faut SERIALIZABLE (ou REPEATABLE READ avec verrous de prédicats / Next-Key Locks).',
    keyRuleEn: 'To prevent Phantom Reads, ANSI SQL mandates SERIALIZABLE (or engine-specific Next-Key Locks in REPEATABLE READ).',
    mastery: 25,
    stability: 1.0,
    difficulty: 7.4,
    lastReviewedAt: new Date(Date.now() - 86400000).toISOString(),
    nextReviewAt: new Date(Date.now() - 7200000).toISOString(), // Dû aujourd'hui (erreur récente)
    successCount: 0,
    failureCount: 1,
    interval: 1,
    reps: 0,
    lapses: 0,
    status: 'learning',
  },
  {
    id: 'sr-index-sargable-predicates',
    conceptId: 'index-sargability',
    titleFr: 'Prédicats SARGable et fonctions dans le WHERE',
    titleEn: 'SARGable predicates and functions on indexed columns',
    pillar: 'indexes',
    trackId: 'oracle-1z0-071',
    promptFr: 'Pourquoi la requête "WHERE UPPER(last_name) = \'DUPONT\'" ignore-t-elle un index B-Tree standard sur last_name ?',
    promptEn: 'Why does "WHERE UPPER(last_name) = \'DUPONT\'" ignore a standard B-Tree index on last_name?',
    codeSnippet: 'CREATE INDEX idx_emp_name ON employees(last_name);\n-- Requête exécutée :\nSELECT * FROM employees WHERE UPPER(last_name) = \'DUPONT\';',
    correctAnswerFr: 'L\'index stocke les valeurs brutes de last_name, pas le résultat de UPPER(). Le moteur doit appliquer UPPER() sur chaque ligne de la table (Full Table Scan), sauf s\'il existe un Function-Based Index.',
    correctAnswerEn: 'The index stores raw last_name values, not UPPER(last_name). The optimizer must evaluate UPPER() on every row (Full Table Scan), unless a Function-Based Index exists.',
    explanationFr: 'Un prédicat est non-SARGable (Search Argument Able) dès qu\'une expression transforme la colonne. Solution : créer un index basé sur une fonction "CREATE INDEX idx_emp_upper ON employees(UPPER(last_name));" ou stocker en majuscules.',
    explanationEn: 'Applying a scalar function to an indexed column invalidates direct index range scans. Use a function-based index or normalized storage.',
    keyRuleFr: 'Pas de fonction arithmétique ou textuelle sur la colonne indexée dans le WHERE.',
    keyRuleEn: 'Do not wrap indexed columns in functions within WHERE clauses.',
    mastery: 72,
    stability: 3.2,
    difficulty: 4.8,
    lastReviewedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    nextReviewAt: new Date(Date.now() + 86400000 * 2).toISOString(), // Révision dans 2 jours
    successCount: 2,
    failureCount: 1,
    interval: 3,
    reps: 1,
    lapses: 0,
    status: 'review',
  },
  {
    id: 'sr-group-by-having-vs-where',
    conceptId: 'sql-aggregation-filtering',
    titleFr: 'Différence sémantique WHERE vs HAVING',
    titleEn: 'Semantic difference between WHERE and HAVING',
    pillar: 'sql',
    trackId: 'oracle-1z0-071',
    promptFr: 'Quelle est la différence d\'évaluation entre WHERE et HAVING lors d\'une requête avec agrégation ?',
    promptEn: 'What is the evaluation timing difference between WHERE and HAVING during aggregation?',
    codeSnippet: 'SELECT department_id, COUNT(*) \nFROM employees \nWHERE salary > 3000 \nGROUP BY department_id \nHAVING COUNT(*) >= 5;',
    correctAnswerFr: 'WHERE filtre les lignes individuelles AVANT le regroupement et l\'agrégation. HAVING filtre les groupes APRÈS le calcul des fonctions d\'agrégation (COUNT, SUM, AVG, MAX, MIN).',
    correctAnswerEn: 'WHERE filters individual source rows BEFORE grouping and aggregation. HAVING filters grouped rows AFTER aggregate functions are evaluated.',
    explanationFr: 'On ne peut jamais utiliser de fonction d\'agrégation dans WHERE (ex: WHERE COUNT(*) > 5 est syntaxiquement invalide). Réciproquement, filtrer sur une colonne brute dans HAVING est valide mais sous-optimal.',
    explanationEn: 'Aggregate functions cannot appear in WHERE. Placing non-aggregate column filters in HAVING degrades performance by grouping unnecessary rows.',
    keyRuleFr: 'WHERE = filtre sur les lignes sources. HAVING = filtre sur le résultat des agrégats du GROUP BY.',
    keyRuleEn: 'WHERE filters rows before grouping; HAVING filters groups after aggregate calculation.',
    mastery: 92,
    stability: 8.5,
    difficulty: 3.2,
    lastReviewedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    nextReviewAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    successCount: 4,
    failureCount: 0,
    interval: 7,
    reps: 2,
    lapses: 0,
    status: 'mastered',
  },
  {
    id: 'sr-cte-recursive-anchor',
    conceptId: 'sql-cte-recursive',
    titleFr: 'Structure d\'une CTE Récursive (Ancre & Membre Récursif)',
    titleEn: 'Recursive CTE structure (Anchor & Recursive Member)',
    pillar: 'sql',
    trackId: 'oracle-1z0-071',
    promptFr: 'Quels sont les deux composants obligatoires réunis par UNION ALL dans une CTE récursive ?',
    promptEn: 'What two mandatory components are joined by UNION ALL in a recursive CTE?',
    codeSnippet: 'WITH RECURSIVE org_tree AS (\n  SELECT emp_id, manager_id, 1 AS depth FROM employees WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.emp_id, e.manager_id, t.depth + 1 FROM employees e JOIN org_tree t ON e.manager_id = t.emp_id\n)\nSELECT * FROM org_tree;',
    correctAnswerFr: 'Le membre d\'ancrage (Anchor Member) qui produit le jeu de résultats de base sans référence à la CTE, et le membre récursif (Recursive Member) qui fait référence au nom de la CTE pour itérer.',
    correctAnswerEn: 'The Anchor Member producing the initial baseline dataset, and the Recursive Member referencing the CTE name to traverse the hierarchy.',
    explanationFr: 'La récursion s\'arrête dès que le membre récursif ne retourne aucune nouvelle ligne. Sans condition d\'arrêt ou en présence de cycles, la récursion peut boucler indéfiniment.',
    explanationEn: 'Recursion halts when the recursive step returns empty. Proper termination conditions and cycle prevention are crucial.',
    keyRuleFr: 'CTE Récursive = Ancre (non récursive) + UNION ALL + Étape itérative faisant référence à la CTE.',
    keyRuleEn: 'Recursive CTE = Non-recursive Anchor + UNION ALL + Recursive step referencing the CTE.',
    mastery: 60,
    stability: 3.0,
    difficulty: 6.5,
    lastReviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    nextReviewAt: new Date(Date.now() + 86400000).toISOString(), // Dû demain
    successCount: 2,
    failureCount: 1,
    interval: 3,
    reps: 1,
    lapses: 0,
    status: 'review',
  },
  {
    id: 'sr-model-3nf-transitive-deps',
    conceptId: 'model-normalization-3nf',
    titleFr: '3ème Forme Normale (3NF) et Dépendances Transitives',
    titleEn: '3rd Normal Form (3NF) and Transitive Dependencies',
    pillar: 'modelisation',
    trackId: 'oracle-1z0-071',
    promptFr: 'Quelle condition stricte distingue la 3NF de la 2NF dans la modélisation relationnelle ?',
    promptEn: 'What strict condition distinguishes 3NF from 2NF in relational data modeling?',
    codeSnippet: '-- Table Commandes (2NF mais pas 3NF) :\n-- (order_id -> customer_id -> customer_city)',
    correctAnswerFr: 'En 3NF, la relation doit être en 2NF et AUCUN attribut non-clé ne doit dépendre transitivement de la clé primaire (pas de X -> Y -> Z où Y n\'est pas superclé).',
    correctAnswerEn: 'In 3NF, the relation must be in 2NF and NO non-key attribute may transitively depend on the primary key (no non-prime attribute determining another non-prime attribute).',
    explanationFr: 'Dans l\'exemple, customer_city dépend de customer_id qui dépend de order_id. Pour passer en 3NF, il faut décomposer en table CLIENTS (customer_id, customer_city) et COMMANDES (order_id, customer_id).',
    explanationEn: 'Decompose into CUSTOMERS and ORDERS to eliminate update/delete anomalies on customer_city.',
    keyRuleFr: '2NF = dépendance pleine à la clé primaire. 3NF = pas de dépendance transitive entre colonnes non clés.',
    keyRuleEn: '2NF = full functional dependency on PK. 3NF = zero transitive dependencies between non-key attributes.',
    mastery: 50,
    stability: 2.5,
    difficulty: 5.5,
    lastReviewedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    nextReviewAt: new Date(Date.now() - 86400000).toISOString(), // Dû aujourd'hui
    successCount: 1,
    failureCount: 1,
    interval: 1,
    reps: 0,
    lapses: 1,
    status: 'learning',
  },
  {
    id: 'sr-admin-undo-rollback-retention',
    conceptId: 'admin-undo-tablespace',
    titleFr: 'Gestion UNDO et erreur ORA-01555 Snapshot Too Old',
    titleEn: 'UNDO management and ORA-01555 Snapshot Too Old error',
    pillar: 'administration',
    trackId: 'oracle-1z0-071',
    promptFr: 'Quelle est la cause fondamentale de l\'erreur "ORA-01555: snapshot too old: rollback segment number with name ... too small" ?',
    promptEn: 'What is the root cause of "ORA-01555: snapshot too old" in an MVCC database engine?',
    codeSnippet: 'ORA-01555: snapshot too old: rollback segment number 11 with name "_SYSSMU11_2345$" too small',
    correctAnswerFr: 'Une requête longue a besoin de lire l\'état passé d\'un bloc (Read Consistency), mais les blocs UNDO correspondants ont été écrasés (overwritten) car UNDO_RETENTION était trop court ou le tablespace UNDO manquait d\'espace.',
    correctAnswerEn: 'A long-running query requires reconstructed historical row images (Read Consistency), but the required UNDO records were overwritten because UNDO_RETENTION expired or UNDO tablespace was full.',
    explanationFr: 'En lecture cohérente MVCC, le moteur reconstruit les blocs via le tablespace UNDO. Si une transaction concurrente modifie et COMMIT des millions de lignes, l\'UNDO ancien est purgé et la requête longue échoue.',
    explanationEn: 'MVCC reconstructs past blocks using UNDO segments. If concurrent modifications overwrite unexpired undo, long queries terminate with ORA-01555.',
    keyRuleFr: 'ORA-01555 = UNDO purgé pendant qu\'un SELECT de longue durée en avait encore besoin.',
    keyRuleEn: 'ORA-01555 = UNDO overwritten while a long reader still required historical block reconstruction.',
    mastery: 35,
    stability: 1.0,
    difficulty: 7.2,
    lastReviewedAt: new Date(Date.now() - 86400000).toISOString(),
    nextReviewAt: new Date(Date.now() - 3600000).toISOString(), // Dû aujourd'hui
    successCount: 0,
    failureCount: 2,
    interval: 1,
    reps: 0,
    lapses: 0,
    status: 'learning',
  },
  {
    id: 'sr-sql-null-in-subquery',
    conceptId: 'sql-not-in-null-trap',
    titleFr: 'Piège du NOT IN avec sous-requête retournant un NULL',
    titleEn: 'NOT IN trap with subquery returning a NULL value',
    pillar: 'sql',
    trackId: 'oracle-1z0-071',
    promptFr: 'Pourquoi la requête "WHERE dept_id NOT IN (SELECT manager_dept_id FROM ...)" retourne-t-elle 0 ligne si la sous-requête contient un NULL ?',
    promptEn: 'Why does "WHERE dept_id NOT IN (SELECT manager_dept_id ...)" return 0 rows if the subquery contains a NULL?',
    codeSnippet: 'SELECT * FROM departments \nWHERE id NOT IN (SELECT manager_dept_id FROM managers); \n-- managers contient au moins un NULL !',
    correctAnswerFr: '"x NOT IN (1, 2, NULL)" équivaut à "(x <> 1) AND (x <> 2) AND (x <> NULL)". Or "x <> NULL" s\'évalue toujours à UNKNOWN. Comme TRUE AND UNKNOWN donne UNKNOWN, aucune ligne n\'est retenue.',
    correctAnswerEn: '"x NOT IN (1, 2, NULL)" expands to "(x <> 1) AND (x <> 2) AND (x <> NULL)". Since "x <> NULL" is always UNKNOWN, the whole conjunct evaluates to UNKNOWN, returning zero rows.',
    explanationFr: 'C\'est l\'un des pièges les plus fréquents en certification. Solution obligatoire : filtrer "WHERE manager_dept_id IS NOT NULL" dans la sous-requête, ou utiliser NOT EXISTS.',
    explanationEn: 'Classic exam trap. Fix: add WHERE col IS NOT NULL to subquery, or rewrite using NOT EXISTS.',
    keyRuleFr: 'NOT IN avec un NULL dans la liste retourne TOUJOURS zéro ligne (UNKNOWN). Utiliser NOT EXISTS.',
    keyRuleEn: 'NOT IN with any NULL in the candidate set returns EMPTY. Prefer NOT EXISTS.',
    mastery: 80,
    stability: 5.5,
    difficulty: 4.5,
    lastReviewedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    nextReviewAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    successCount: 3,
    failureCount: 1,
    interval: 7,
    reps: 2,
    lapses: 0,
    status: 'review',
  }
];

/**
 * Récupère le décalage de temps virtuel (en jours) pour simuler J+1, J+3, J+7
 */
export function getVirtualTimeOffsetDays(): number {
  try {
    const raw = localStorage.getItem(TIME_OFFSET_KEY);
    return raw ? parseFloat(raw) : 0;
  } catch {
    return 0;
  }
}

/**
 * Définit le décalage temporel virtuel (en jours)
 */
export function setVirtualTimeOffsetDays(offsetDays: number): void {
  try {
    localStorage.setItem(TIME_OFFSET_KEY, String(offsetDays));
    window.dispatchEvent(new CustomEvent('dbmastery:spaced_repetition_updated'));
  } catch {
    // ignore
  }
}

/**
 * Calcule la date actuelle ajustée avec le temps virtuel
 */
export function getSimulatedNow(): Date {
  const offsetMs = getVirtualTimeOffsetDays() * 86400000;
  return new Date(Date.now() + offsetMs);
}

/**
 * Charge tous les items de répétition espacée depuis localStorage
 */
export function loadSpacedRepetitionItems(): SpacedRepetitionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveSpacedRepetitionItems(INITIAL_SPACED_NOTIONS);
      return INITIAL_SPACED_NOTIONS;
    }
    const items: SpacedRepetitionItem[] = JSON.parse(raw);
    if (!items || items.length === 0) {
      saveSpacedRepetitionItems(INITIAL_SPACED_NOTIONS);
      return INITIAL_SPACED_NOTIONS;
    }
    return items;
  } catch {
    return INITIAL_SPACED_NOTIONS;
  }
}

/**
 * Sauvegarde les items dans localStorage
 */
export function saveSpacedRepetitionItems(items: SpacedRepetitionItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('dbmastery:spaced_repetition_updated'));
  } catch (e) {
    console.warn('Unable to persist spaced repetition items:', e);
  }
}

/**
 * Réinitialise aux notions par défaut
 */
export function resetSpacedRepetitionToDefault(): void {
  localStorage.removeItem(TIME_OFFSET_KEY);
  saveSpacedRepetitionItems(INITIAL_SPACED_NOTIONS);
}

/**
 * Algorithme de Répétition Espacée inspiré SM-2 / FSRS :
 * Conforme exactement à l'énoncé de l'utilisateur :
 * Question -> Erreur -> Révision dans 1 jour -> Bonne réponse -> Révision dans 3 jours -> Bonne réponse -> Révision dans 7 jours -> Maîtrisé
 *
 * Paramètres d'évaluation :
 * - rating : 'again' (Erreur) | 'hard' (Difficile) | 'good' (Bonne réponse) | 'easy' (Parfait / Réflexe)
 */
export function calculateNextSpacedState(
  item: SpacedRepetitionItem,
  rating: SpacedReviewRating
): SpacedRepetitionItem {
  const simulatedNow = getSimulatedNow();
  const isSuccess = rating !== 'again';

  let newInterval: number;
  let newReps: number;
  let newMastery: number;
  let newStability: number;
  let newDifficulty: number = item.difficulty;
  let newLapses: number = item.lapses;
  let newStatus: 'new' | 'learning' | 'review' | 'mastered' = item.status;

  if (rating === 'again') {
    // ❌ ERREUR / À REVOIR :
    // Révision dans 1 jour impérativement
    newInterval = 1;
    newReps = 0;
    if (item.reps > 0 || item.status === 'mastered') {
      newLapses += 1;
    }
    // Chute de la stabilité mnésique et hausse de la difficulté
    newStability = Math.max(1.0, Math.round((item.stability * 0.45) * 10) / 10);
    newDifficulty = Math.min(10, Math.round((item.difficulty + 1.2) * 10) / 10);
    newMastery = Math.max(15, Math.round(item.mastery * 0.55));
    newStatus = 'learning';
  } else if (rating === 'hard') {
    // ⚠️ DIFFICILE MAIS JUSTE :
    newReps = item.reps + 1;
    newInterval = Math.max(2, Math.round(item.interval * 1.3));
    newStability = Math.round((item.stability * 1.2) * 10) / 10;
    newDifficulty = Math.min(10, Math.round((item.difficulty + 0.3) * 10) / 10);
    newMastery = Math.min(95, Math.round(item.mastery + 12));
    newStatus = newReps >= 3 && newMastery >= 80 ? 'mastered' : 'review';
  } else if (rating === 'good') {
    // ✅ BONNE RÉPONSE (Échelle exacte de l'utilisateur : 1j -> 3j -> 7j -> Maîtrisé) :
    if (item.reps === 0) {
      newInterval = 3; // Révision dans 3 jours
      newReps = 1;
      newMastery = Math.max(55, Math.min(75, item.mastery + 25));
      newStability = 3.0;
      newStatus = 'review';
    } else if (item.reps === 1) {
      newInterval = 7; // Révision dans 7 jours
      newReps = 2;
      newMastery = Math.max(78, Math.min(88, item.mastery + 20));
      newStability = 7.0;
      newStatus = 'review';
    } else {
      // 3ème bonne réponse consécutive ou plus -> MAÎTRISÉ !
      const factor = 1.9 + Math.max(0, (10 - item.difficulty) * 0.08);
      newInterval = Math.round(item.interval * factor);
      newReps = item.reps + 1;
      newMastery = Math.min(100, Math.max(90, item.mastery + 15));
      newStability = Math.round((item.stability * 2.1) * 10) / 10;
      newStatus = 'mastered';
    }
    newDifficulty = Math.max(1.0, Math.round((item.difficulty - 0.25) * 10) / 10);
  } else {
    // ⚡ FACILE / RÉFLEXE IMMÉDIAT ('easy') :
    if (item.reps === 0) {
      newInterval = 4;
      newReps = 1;
      newMastery = Math.max(70, item.mastery + 35);
      newStability = 4.0;
      newStatus = 'review';
    } else if (item.reps === 1) {
      newInterval = 12;
      newReps = 2;
      newMastery = Math.max(88, item.mastery + 25);
      newStability = 12.0;
      newStatus = 'mastered';
    } else {
      newInterval = Math.round(item.interval * 2.5);
      newReps = item.reps + 2;
      newMastery = 100;
      newStability = Math.round((item.stability * 2.6) * 10) / 10;
      newStatus = 'mastered';
    }
    newDifficulty = Math.max(1.0, Math.round((item.difficulty - 0.6) * 10) / 10);
  }

  // Calcul de la prochaine date de révision : maintenant + newInterval jours
  const nextDateMs = simulatedNow.getTime() + newInterval * 86400000;
  const nextReviewAt = new Date(nextDateMs).toISOString();

  const historyEntry = {
    reviewedAt: simulatedNow.toISOString(),
    rating,
    result: (isSuccess ? 'success' : 'failure') as 'success' | 'failure',
    intervalGranted: newInterval,
    stabilityAfter: newStability,
    difficultyAfter: newDifficulty,
  };

  const updatedHistory = [...(item.history || []), historyEntry].slice(-20);

  return {
    ...item,
    mastery: newMastery,
    stability: newStability,
    difficulty: newDifficulty,
    lastReviewedAt: simulatedNow.toISOString(),
    nextReviewAt,
    successCount: isSuccess ? item.successCount + 1 : item.successCount,
    failureCount: !isSuccess ? item.failureCount + 1 : item.failureCount,
    interval: newInterval,
    reps: newReps,
    lapses: newLapses,
    status: newStatus,
    history: updatedHistory,
  };
}

/**
 * Enregistre une révision pour une notion donnée
 */
export function recordSpacedReview(
  itemId: string,
  rating: SpacedReviewRating
): SpacedRepetitionItem | null {
  const items = loadSpacedRepetitionItems();
  const index = items.findIndex((i) => i.id === itemId || i.conceptId === itemId);

  if (index === -1) return null;

  const currentItem = items[index];
  const updatedItem = calculateNextSpacedState(currentItem, rating);

  items[index] = updatedItem;
  saveSpacedRepetitionItems(items);

  return updatedItem;
}

/**
 * Enregistre un échec ou un succès survenu n'importe où dans l'application
 * (Examen blanc, Flashcards, Quiz adaptatif, Séance quotidienne, Lab SQL).
 * Si la notion n'existe pas encore dans la répétition espacée, elle est automatiquement créée !
 */
export function recordExternalConceptAttempt(
  conceptId: string,
  isSuccess: boolean,
  metadata?: {
    titleFr?: string;
    titleEn?: string;
    pillar?: string;
    trackId?: CertificationTrackId;
    promptFr?: string;
    promptEn?: string;
    explanationFr?: string;
    explanationEn?: string;
  }
): SpacedRepetitionItem {
  const items = loadSpacedRepetitionItems();
  let item = items.find((i) => i.conceptId === conceptId || i.id === conceptId);

  const simulatedNow = getSimulatedNow();

  if (!item) {
    // Création automatique de la notion
    item = {
      id: `sr-${conceptId}-${Date.now()}`,
      conceptId,
      titleFr: metadata?.titleFr || `Notion : ${conceptId}`,
      titleEn: metadata?.titleEn || `Concept: ${conceptId}`,
      pillar: metadata?.pillar || 'sql',
      trackId: metadata?.trackId || 'oracle-1z0-071',
      promptFr: metadata?.promptFr || `Réviser les principes clés de la notion ${conceptId}.`,
      promptEn: metadata?.promptEn || `Review key principles of concept ${conceptId}.`,
      correctAnswerFr: metadata?.explanationFr || 'Maîtrise validée lors des exercices pratiques.',
      correctAnswerEn: metadata?.explanationEn || 'Mastery validated during practical drills.',
      explanationFr: metadata?.explanationFr || 'Consolidation active recommandée par l\'algorithme de répétition espacée.',
      explanationEn: metadata?.explanationEn || 'Active spaced repetition review recommended.',
      mastery: isSuccess ? 60 : 25,
      stability: isSuccess ? 2.5 : 1.0,
      difficulty: isSuccess ? 5.0 : 6.5,
      lastReviewedAt: simulatedNow.toISOString(),
      nextReviewAt: new Date(simulatedNow.getTime() + (isSuccess ? 3 : 1) * 86400000).toISOString(),
      successCount: isSuccess ? 1 : 0,
      failureCount: !isSuccess ? 1 : 0,
      interval: isSuccess ? 3 : 1,
      reps: isSuccess ? 1 : 0,
      lapses: !isSuccess ? 1 : 0,
      status: isSuccess ? 'review' : 'learning',
    };
    items.unshift(item);
    saveSpacedRepetitionItems(items);
    return item;
  }

  const rating: SpacedReviewRating = isSuccess ? 'good' : 'again';
  const updatedItem = calculateNextSpacedState(item, rating);
  const idx = items.findIndex((i) => i.id === item!.id);
  if (idx !== -1) {
    items[idx] = updatedItem;
    saveSpacedRepetitionItems(items);
  }
  return updatedItem;
}

/**
 * Retourne les notions arrivées à échéance (dues aujourd'hui ou en retard)
 */
export function getDueSpacedItems(trackId?: CertificationTrackId): SpacedRepetitionItem[] {
  const items = loadSpacedRepetitionItems();
  const simulatedNow = getSimulatedNow();
  const nowMs = simulatedNow.getTime();

  return items.filter((item) => {
    if (trackId && item.trackId !== trackId) return false;
    const nextMs = new Date(item.nextReviewAt).getTime();
    return nextMs <= nowMs;
  });
}

/**
 * Calcule les statistiques globales du système de répétition espacée
 */
export function getSpacedRepetitionStats(trackId?: CertificationTrackId): SpacedRepetitionStats {
  const items = loadSpacedRepetitionItems();
  const filtered = trackId ? items.filter((i) => i.trackId === trackId) : items;

  const simulatedNow = getSimulatedNow();
  const nowMs = simulatedNow.getTime();

  let dueTodayCount = 0;
  let learningCount = 0;
  let reviewCount = 0;
  let masteredCount = 0;
  let totalMastery = 0;
  let totalStability = 0;
  let totalSuccess = 0;
  let totalFailure = 0;

  filtered.forEach((item) => {
    const nextMs = new Date(item.nextReviewAt).getTime();
    if (nextMs <= nowMs) {
      dueTodayCount++;
    }

    if (item.status === 'mastered') masteredCount++;
    else if (item.status === 'learning') learningCount++;
    else reviewCount++;

    totalMastery += item.mastery;
    totalStability += item.stability;
    totalSuccess += item.successCount;
    totalFailure += item.failureCount;
  });

  const count = filtered.length || 1;
  const totalReviewsDone = totalSuccess + totalFailure;
  const retentionRatePercent = totalReviewsDone > 0 
    ? Math.round((totalSuccess / totalReviewsDone) * 100) 
    : 85;

  return {
    totalItems: filtered.length,
    dueTodayCount,
    learningCount,
    reviewCount,
    masteredCount,
    averageMastery: Math.round(totalMastery / count),
    averageStabilityDays: Math.round((totalStability / count) * 10) / 10,
    totalReviewsDone,
    retentionRatePercent,
  };
}

/**
 * Formate un délai relatif lisible pour la prochaine révision
 */
export function formatNextReviewDelay(nextReviewAtIso: string, lang: 'fr' | 'en' = 'fr'): string {
  const isFr = lang === 'fr';
  const simulatedNow = getSimulatedNow();
  const diffMs = new Date(nextReviewAtIso).getTime() - simulatedNow.getTime();
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMs <= 0) {
    return isFr ? 'À réviser maintenant' : 'Due for review now';
  }
  if (diffHours < 24) {
    return isFr ? `Dans ${Math.max(1, diffHours)}h` : `In ${Math.max(1, diffHours)}h`;
  }
  if (diffDays === 1) {
    return isFr ? 'Demain (1 jour)' : 'Tomorrow (1 day)';
  }
  return isFr ? `Dans ${diffDays} jours` : `In ${diffDays} days`;
}
