export type MasteryStatus = 'mastered' | 'in_progress' | 'critical_gap';

export interface MasterySubtopic {
  id: string;
  name: string;
  domainId: string;
  domainName: string;
  score: number;             // 0-100%
  previousScore: number;     // 0-100%
  totalAttempts: number;
  correctAttempts: number;
  status: MasteryStatus;
  isLeafLast: boolean;       // for rendering └── vs ├──
  summaryFr: string;
  summaryEn: string;
  diagnosticFr: string;
  diagnosticEn: string;
  commonPitfallFr: string;
  commonPitfallEn: string;
  recommendedActionFr: string;
  recommendedActionEn: string;
}

export interface MasteryDomain {
  id: string;
  name: string;
  score: number;             // 0-100%
  previousScore: number;
  status: MasteryStatus;
  descriptionFr: string;
  descriptionEn: string;
  subtopics: MasterySubtopic[];
}

export interface MasteryTreeData {
  domains: MasteryDomain[];
  overallScore: number;
  lastUpdated: string;
  totalQuestionsAnalyzed: number;
}

export interface MasteryImpactDelta {
  subtopicId: string;
  subtopicName: string;
  domainId: string;
  domainName: string;
  oldScore: number;
  newScore: number;
  diff: number;
  correct: number;
  total: number;
  newStatus: MasteryStatus;
}

export interface MasteryImpactReport {
  overallOldScore: number;
  overallNewScore: number;
  overallDiff: number;
  deltas: MasteryImpactDelta[];
  newMasteredCount: number;
  newGapsCount: number;
}

const STORAGE_KEY = 'dbmastery_mastery_tree_v1';

export function computeMasteryStatus(score: number): MasteryStatus {
  if (score >= 80) return 'mastered';
  if (score >= 65) return 'in_progress';
  return 'critical_gap';
}

/**
 * Données de référence exactement conformes à la demande utilisateur :
 * 
 * SQL                         82 %
 * ├── SELECT                  96 %
 * ├── WHERE                   91 %
 * ├── JOIN                    67 %
 * ├── GROUP BY                81 %
 * └── Subqueries              54 %
 * 
 * Modélisation                74 %
 * Transactions                61 %
 * Indexation                  48 %
 * Administration              72 %
 */
export const INITIAL_MASTERY_TREE: MasteryTreeData = {
  overallScore: 67, // moyenne pondérée globale
  lastUpdated: new Date().toISOString(),
  totalQuestionsAnalyzed: 842,
  domains: [
    {
      id: 'sql',
      name: 'SQL',
      score: 82,
      previousScore: 80,
      status: 'mastered',
      descriptionFr: 'Langage d\'interrogation relationnelle (DQL), projections, filtrages, jointures et agrégations.',
      descriptionEn: 'Relational query language (DQL), projections, filtering, joins, and aggregations.',
      subtopics: [
        {
          id: 'select',
          name: 'SELECT',
          domainId: 'sql',
          domainName: 'SQL',
          score: 96,
          previousScore: 95,
          totalAttempts: 210,
          correctAttempts: 202,
          status: 'mastered',
          isLeafLast: false,
          summaryFr: 'Projections, DISTINCT, expressions scalaires, COALESCE & CASE WHEN.',
          summaryEn: 'Projections, DISTINCT, scalar expressions, COALESCE & CASE WHEN.',
          diagnosticFr: 'Automatisme parfait. Aucune hésitation sur la syntaxe et les expressions calculées.',
          diagnosticEn: 'Reflex mastery. Flawless syntax and computed expression execution.',
          commonPitfallFr: 'Oubli du ELSE dans les CASE ou confusion sur la précédence des opérateurs.',
          commonPitfallEn: 'Missing ELSE in CASE statements or operator precedence confusion.',
          recommendedActionFr: 'Acquis • Maintenir la rapidité d\'exécution',
          recommendedActionEn: 'Mastered • Maintain speed of execution',
        },
        {
          id: 'where',
          name: 'WHERE',
          domainId: 'sql',
          domainName: 'SQL',
          score: 91,
          previousScore: 89,
          totalAttempts: 184,
          correctAttempts: 167,
          status: 'mastered',
          isLeafLast: false,
          summaryFr: 'Prédicats de filtrage, logique ternaire (TRUE/FALSE/UNKNOWN), LIKE, BETWEEN, IN.',
          summaryEn: 'Filtering predicates, three-valued logic (TRUE/FALSE/UNKNOWN), LIKE, BETWEEN, IN.',
          diagnosticFr: 'Maîtrise solide du filtrage en ligne brute et des opérateurs de comparaison.',
          diagnosticEn: 'Solid mastery of row-level filtering and comparison operators.',
          commonPitfallFr: 'Utilisation de = NULL au lieu de IS NULL (renvoie toujours UNKNOWN).',
          commonPitfallEn: 'Using = NULL instead of IS NULL (always yields UNKNOWN).',
          recommendedActionFr: 'Acquis • Excellente régularité',
          recommendedActionEn: 'Mastered • High consistency',
        },
        {
          id: 'join',
          name: 'JOIN',
          domainId: 'sql',
          domainName: 'SQL',
          score: 67,
          previousScore: 64,
          totalAttempts: 156,
          correctAttempts: 104,
          status: 'in_progress',
          isLeafLast: false,
          summaryFr: 'Jointures ANSI : INNER, LEFT, RIGHT, FULL, CROSS et SELF-JOIN.',
          summaryEn: 'ANSI Joins: INNER, LEFT, RIGHT, FULL, CROSS, and SELF-JOIN.',
          diagnosticFr: 'Lacune identifiée : confusion fréquente sur le filtrage dans la clause ON vs WHERE dans les LEFT JOIN.',
          diagnosticEn: 'Identified gap: frequent confusion filtering in ON vs WHERE in LEFT JOINs.',
          commonPitfallFr: 'Filtrer la table de droite dans le WHERE transforme silencieusement le LEFT JOIN en INNER JOIN.',
          commonPitfallEn: 'Filtering the right table in WHERE silently degrades LEFT JOIN into INNER JOIN.',
          recommendedActionFr: 'Prioritaire : S\'entraîner sur ON vs WHERE et préservation des NULLs',
          recommendedActionEn: 'Priority: Drill ON vs WHERE and NULL preservation',
        },
        {
          id: 'group_by',
          name: 'GROUP BY',
          domainId: 'sql',
          domainName: 'SQL',
          score: 81,
          previousScore: 81,
          totalAttempts: 142,
          correctAttempts: 115,
          status: 'mastered',
          isLeafLast: false,
          summaryFr: 'Partitions de regroupement, fonctions d\'agrégation (SUM, AVG, COUNT, MAX) et HAVING.',
          summaryEn: 'Grouping sets, aggregate functions (SUM, AVG, COUNT, MAX), and HAVING.',
          diagnosticFr: 'Bonne compréhension générale, attention à la règle des colonnes non agrégées dans le SELECT.',
          diagnosticEn: 'Good overall grasp, watch out for unaggregated columns in SELECT.',
          commonPitfallFr: 'Tenter de filtrer des agrégats dans le WHERE ou omettre des colonnes du GROUP BY.',
          commonPitfallEn: 'Attempting to filter aggregates in WHERE or omitting columns in GROUP BY.',
          recommendedActionFr: 'Solide • Réviser les subtilités de COUNT(*) vs COUNT(colonne)',
          recommendedActionEn: 'Solid • Review subtleties of COUNT(*) vs COUNT(column)',
        },
        {
          id: 'subqueries',
          name: 'Subqueries',
          domainId: 'sql',
          domainName: 'SQL',
          score: 54,
          previousScore: 56,
          totalAttempts: 120,
          correctAttempts: 65,
          status: 'critical_gap',
          isLeafLast: true,
          summaryFr: 'Sous-requêtes scalaires, corrélées, EXISTS / NOT EXISTS, IN / NOT IN, ANY / ALL.',
          summaryEn: 'Scalar subqueries, correlated subqueries, EXISTS / NOT EXISTS, IN / NOT IN, ANY / ALL.',
          diagnosticFr: 'Point faible critique : échec récurrent sur le piège du NOT IN face à une sous-requête retournant NULL.',
          diagnosticEn: 'Critical weak point: recurrent failure on NOT IN trap when subquery returns NULL.',
          commonPitfallFr: 'Si la sous-requête NOT IN contient au moins un NULL, la condition globale renvoie 0 ligne.',
          commonPitfallEn: 'If a NOT IN subquery contains at least one NULL, the entire predicate returns 0 rows.',
          recommendedActionFr: 'Urgent : Remplacer systématiquement NOT IN par NOT EXISTS',
          recommendedActionEn: 'Urgent: Systematically prefer NOT EXISTS over NOT IN',
        },
      ],
    },
    {
      id: 'modelisation',
      name: 'Modélisation',
      score: 74,
      previousScore: 72,
      status: 'in_progress',
      descriptionFr: 'Conception relationnelle, intégrité des données, formes normales et DDL.',
      descriptionEn: 'Relational design, data integrity, normal forms, and DDL.',
      subtopics: [
        {
          id: 'norm_3nf',
          name: 'Formes Normales (1NF-3NF)',
          domainId: 'modelisation',
          domainName: 'Modélisation',
          score: 76,
          previousScore: 74,
          totalAttempts: 88,
          correctAttempts: 67,
          status: 'in_progress',
          isLeafLast: false,
          summaryFr: 'Atomicité 1NF, dépendance fonctionnelle totale 2NF, élimination des dépendances transitives 3NF.',
          summaryEn: '1NF atomicity, 2NF full functional dependency, 3NF transitive dependency removal.',
          diagnosticFr: 'Compris conceptuellement mais hésitation sur la détection des dépendances transitives.',
          diagnosticEn: 'Conceptually understood but hesitation detecting transitive dependencies.',
          commonPitfallFr: 'Confondre dépendance partielle sur une clé composite et dépendance transitive.',
          commonPitfallEn: 'Confusing partial dependency on composite key with transitive dependency.',
          recommendedActionFr: 'Pratiquer 5 cas concrets de décomposition 2NF vers 3NF',
          recommendedActionEn: 'Practice 5 decomposition cases from 2NF to 3NF',
        },
        {
          id: 'constraints_keys',
          name: 'Clés & Contraintes DDL',
          domainId: 'modelisation',
          domainName: 'Modélisation',
          score: 85,
          previousScore: 84,
          totalAttempts: 104,
          correctAttempts: 88,
          status: 'mastered',
          isLeafLast: false,
          summaryFr: 'PRIMARY KEY, FOREIGN KEY, ON DELETE CASCADE/SET NULL, CHECK, UNIQUE, NOT NULL.',
          summaryEn: 'PRIMARY KEY, FOREIGN KEY, ON DELETE CASCADE/SET NULL, CHECK, UNIQUE, NOT NULL.',
          diagnosticFr: 'Très bonne maîtrise des contraintes d\'intégrité et des règles d\'action référentielle.',
          diagnosticEn: 'Very good mastery of integrity constraints and referential action rules.',
          commonPitfallFr: 'Oublier qu\'une contrainte CHECK accepte la valeur NULL (NULL IS UNKNOWN, donc pas FALSE).',
          commonPitfallEn: 'Forgetting that CHECK constraints accept NULL (NULL IS UNKNOWN, thus not FALSE).',
          recommendedActionFr: 'Acquis • Maîtrise opérationnelle confirmée',
          recommendedActionEn: 'Mastered • Confirmed operational command',
        },
        {
          id: 'schema_ddl',
          name: 'Schémas DDL & Types',
          domainId: 'modelisation',
          domainName: 'Modélisation',
          score: 61,
          previousScore: 58,
          totalAttempts: 70,
          correctAttempts: 43,
          status: 'critical_gap',
          isLeafLast: true,
          summaryFr: 'CREATE TABLE, ALTER TABLE, types numériques vs caractères (VARCHAR2, CHAR, CLOB) et dates.',
          summaryEn: 'CREATE TABLE, ALTER TABLE, numeric vs character types (VARCHAR2, CHAR, CLOB) and dates.',
          diagnosticFr: 'Ralentissement sur les opérations ALTER TABLE complexes (conversion de type et valeurs par défaut).',
          diagnosticEn: 'Slowdown on complex ALTER TABLE operations (type conversion and DEFAULT values).',
          commonPitfallFr: 'Modifier une colonne en NOT NULL quand la table contient déjà des lignes NULL.',
          commonPitfallEn: 'Altering a column to NOT NULL when table already contains NULL rows.',
          recommendedActionFr: 'Réviser les restrictions d\'ALTER TABLE et les types temporels',
          recommendedActionEn: 'Review ALTER TABLE restrictions and temporal types',
        },
      ],
    },
    {
      id: 'transactions',
      name: 'Transactions',
      score: 61,
      previousScore: 59,
      status: 'critical_gap',
      descriptionFr: 'Propriétés ACID, contrôle de concurrence, niveaux d\'isolation et mécanismes de verrouillage.',
      descriptionEn: 'ACID properties, concurrency control, isolation levels, and locking mechanisms.',
      subtopics: [
        {
          id: 'acid_props',
          name: 'Propriétés ACID',
          domainId: 'transactions',
          domainName: 'Transactions',
          score: 72,
          previousScore: 70,
          totalAttempts: 65,
          correctAttempts: 47,
          status: 'in_progress',
          isLeafLast: false,
          summaryFr: 'Atomicité, Cohérence, Isolation, Durabilité. COMMIT, ROLLBACK et SAVEPOINT.',
          summaryEn: 'Atomicity, Consistency, Isolation, Durability. COMMIT, ROLLBACK, and SAVEPOINT.',
          diagnosticFr: 'Les bases de COMMIT/ROLLBACK sont acquises mais les cas de SAVEPOINT partiels méritent révision.',
          diagnosticEn: 'Basic COMMIT/ROLLBACK understood, but partial SAVEPOINT cases need review.',
          commonPitfallFr: 'Penser qu\'un ROLLBACK TO SAVEPOINT termine la transaction (il ne la valide pas).',
          commonPitfallEn: 'Thinking ROLLBACK TO SAVEPOINT terminates transaction (it does not commit it).',
          recommendedActionFr: 'Valider la gestion des SAVEPOINT avec 3 exercices',
          recommendedActionEn: 'Validate SAVEPOINT management with 3 drills',
        },
        {
          id: 'isolation_levels',
          name: 'Niveaux d\'Isolation ANSI',
          domainId: 'transactions',
          domainName: 'Transactions',
          score: 52,
          previousScore: 54,
          totalAttempts: 72,
          correctAttempts: 37,
          status: 'critical_gap',
          isLeafLast: false,
          summaryFr: 'Read Uncommitted, Read Committed, Repeatable Read, Serializable. Dirty reads, Non-repeatable, Phantoms.',
          summaryEn: 'Read Uncommitted, Read Committed, Repeatable Read, Serializable. Dirty, non-repeatable, phantom reads.',
          diagnosticFr: 'Point faible récurrent de certification : confusion sur les phénomènes autorisés par chaque niveau.',
          diagnosticEn: 'Frequent certification trap: confusion on anomalies allowed per isolation level.',
          commonPitfallFr: 'Croire que Repeatable Read empêche les lectures fantômes (seul Serializable les empêche en standard).',
          commonPitfallEn: 'Believing Repeatable Read prevents phantom reads (only Serializable does in ANSI).',
          recommendedActionFr: 'Mémoriser la matrice ANSI 4 niveaux × 3 anomalies',
          recommendedActionEn: 'Memorize ANSI matrix 4 levels × 3 anomalies',
        },
        {
          id: 'locks_deadlocks',
          name: 'Verrous & Deadlocks',
          domainId: 'transactions',
          domainName: 'Transactions',
          score: 59,
          previousScore: 55,
          totalAttempts: 58,
          correctAttempts: 34,
          status: 'critical_gap',
          isLeafLast: true,
          summaryFr: 'Verrous partagés (S), exclusifs (X), verrouillage de ligne (Row-level) et interblocages (Deadlocks).',
          summaryEn: 'Shared locks (S), exclusive locks (X), row-level locking, and deadlocks.',
          diagnosticFr: 'Difficulté à prédire les situations de blocage mutuel et la résolution automatique des SGBD.',
          diagnosticEn: 'Difficulty predicting mutual wait graphs and DBMS automated deadlock detection.',
          commonPitfallFr: 'Confondre un blocage temporaire (attente) avec un interblocage cyclique réel (deadlock).',
          commonPitfallEn: 'Confusing temporary lock contention with true cyclical deadlocks.',
          recommendedActionFr: 'Étudier les diagrammes temporels d\'interblocage',
          recommendedActionEn: 'Study lock graph timing diagrams',
        },
      ],
    },
    {
      id: 'indexation',
      name: 'Indexation',
      score: 48,
      previousScore: 46,
      status: 'critical_gap',
      descriptionFr: 'Structures d\'index (B-Tree, Bitmap), optimisation des plans d\'accès et coût d\'exécution CBO.',
      descriptionEn: 'Index structures (B-Tree, Bitmap), access path tuning, and CBO query cost.',
      subtopics: [
        {
          id: 'btree_bitmap',
          name: 'B-Tree vs Bitmap',
          domainId: 'indexation',
          domainName: 'Indexation',
          score: 50,
          previousScore: 48,
          totalAttempts: 60,
          correctAttempts: 30,
          status: 'critical_gap',
          isLeafLast: false,
          summaryFr: 'Arbres B*Tree pour cardinalité élevée (OLTP) vs Index Bitmap pour faible cardinalité (Data Warehouse).',
          summaryEn: 'B*Tree for high cardinality (OLTP) vs Bitmap for low cardinality (Data Warehouse).',
          diagnosticFr: 'Choix inadéquat du type d\'index en fonction de la sélectivité et du taux de mise à jour DML.',
          diagnosticEn: 'Suboptimal index choice based on selectivity and DML write frequency.',
          commonPitfallFr: 'Poser un index Bitmap sur une table transactionnelle à fort volume de UPDATE/INSERT (verrous de bloc).',
          commonPitfallEn: 'Placing Bitmap indexes on transactional tables with heavy concurrent DML (block locking).',
          recommendedActionFr: 'Apprendre la règle : B-Tree = sélectivité haute ; Bitmap = DW en lecture seule',
          recommendedActionEn: 'Learn rule: B-Tree = high selectivity; Bitmap = read-only DW',
        },
        {
          id: 'composite_indexes',
          name: 'Index Composites & Scans',
          domainId: 'indexation',
          domainName: 'Indexation',
          score: 44,
          previousScore: 42,
          totalAttempts: 52,
          correctAttempts: 23,
          status: 'critical_gap',
          isLeafLast: false,
          summaryFr: 'Règle du préfixe le plus à gauche, Index Range Scan, Index Unique Scan, Full Table Scan.',
          summaryEn: 'Leftmost prefix rule, Index Range Scan, Index Unique Scan, Full Table Scan.',
          diagnosticFr: 'Point faible le plus prononcé : non-utilisation d\'un index composite quand la première colonne manque.',
          diagnosticEn: 'Most pronounced weak point: skipping composite index when leading column is omitted.',
          commonPitfallFr: 'Appliquer une fonction sur la colonne indexée (ex: UPPER(nom) = \'DUPONT\') désactive l\'index standard.',
          commonPitfallEn: 'Applying a function to indexed column (e.g. UPPER(name)) suppresses standard index use.',
          recommendedActionFr: 'Priorité absolue : Réviser le principe du préfixe et les index basés sur fonctions',
          recommendedActionEn: 'Absolute priority: Review leading prefix rule and function-based indexes',
        },
        {
          id: 'explain_plan',
          name: 'EXPLAIN PLAN & Optimiseur',
          domainId: 'indexation',
          domainName: 'Indexation',
          score: 50,
          previousScore: 47,
          totalAttempts: 48,
          correctAttempts: 24,
          status: 'critical_gap',
          isLeafLast: true,
          summaryFr: 'Lecture d\'un plan d\'exécution, coût CBO, cardinalité estimée, prédicats d\'accès vs filtres.',
          summaryEn: 'Reading execution plans, CBO cost, estimated cardinality, access vs filter predicates.',
          diagnosticFr: 'Lecture hésitante de l\'arbre d\'opérations hiérarchiques dans un plan EXPLAIN PLAN.',
          diagnosticEn: 'Hesitant interpretation of hierarchical operations in EXPLAIN PLAN.',
          commonPitfallFr: 'Confondre le coût relatif de l\'optimiseur avec le temps réel en millisecondes.',
          commonPitfallEn: 'Confusing optimizer relative cost with wall-clock execution time.',
          recommendedActionFr: 'Pratiquer la lecture de 5 plans d\'exécution réels',
          recommendedActionEn: 'Practice interpreting 5 real execution plans',
        },
      ],
    },
    {
      id: 'administration',
      name: 'Administration',
      score: 72,
      previousScore: 71,
      status: 'in_progress',
      descriptionFr: 'Sécurité, privilèges, rôles système, sauvegardes et vues du dictionnaire de données.',
      descriptionEn: 'Security, privileges, system roles, backups, and data dictionary views.',
      subtopics: [
        {
          id: 'roles_privileges',
          name: 'Rôles & Privilèges',
          domainId: 'administration',
          domainName: 'Administration',
          score: 84,
          previousScore: 83,
          totalAttempts: 80,
          correctAttempts: 67,
          status: 'mastered',
          isLeafLast: false,
          summaryFr: 'GRANT, REVOKE, WITH GRANT OPTION, WITH ADMIN OPTION, privilèges système vs objet.',
          summaryEn: 'GRANT, REVOKE, WITH GRANT OPTION, WITH ADMIN OPTION, system vs object privileges.',
          diagnosticFr: 'Excellente compréhension des droits d\'accès et de la hiérarchie des rôles DBA.',
          diagnosticEn: 'Strong understanding of access permissions and DBA role hierarchy.',
          commonPitfallFr: 'Différence entre WITH GRANT OPTION (révoqué en cascade) et WITH ADMIN OPTION (non révoqué en cascade).',
          commonPitfallEn: 'Difference between WITH GRANT OPTION (cascading revoke) vs WITH ADMIN OPTION (no cascade).',
          recommendedActionFr: 'Acquis • Bien retenir la révocation en cascade',
          recommendedActionEn: 'Mastered • Remember cascading revokes',
        },
        {
          id: 'backup_recovery',
          name: 'Sauvegardes & Restauration',
          domainId: 'administration',
          domainName: 'Administration',
          score: 68,
          previousScore: 66,
          totalAttempts: 62,
          correctAttempts: 42,
          status: 'in_progress',
          isLeafLast: false,
          summaryFr: 'Sauvegardes logiques (Data Pump / pg_dump) vs physiques (RMAN / WAL archiving), mode ARCHIVELOG.',
          summaryEn: 'Logical backups (Data Pump / pg_dump) vs physical (RMAN / WAL archiving), ARCHIVELOG mode.',
          diagnosticFr: 'Les sauvegardes logiques sont maîtrisées, attention aux scénarios de point-in-time recovery (PITR).',
          diagnosticEn: 'Logical backups solid, review point-in-time recovery (PITR) scenarios.',
          commonPitfallFr: 'Croire qu\'un export logique permet une restauration sans perte en cas de crash disque.',
          commonPitfallEn: 'Believing logical exports allow zero-data-loss recovery on disk failure.',
          recommendedActionFr: 'Réviser les scénarios PITR et la relecture des journaux redo',
          recommendedActionEn: 'Review PITR scenarios and redo log replay',
        },
        {
          id: 'data_dictionary',
          name: 'Dictionnaire de données',
          domainId: 'administration',
          domainName: 'Administration',
          score: 64,
          previousScore: 63,
          totalAttempts: 55,
          correctAttempts: 35,
          status: 'critical_gap',
          isLeafLast: true,
          summaryFr: 'Vues système DBA_*, ALL_*, USER_*, V$ (Oracle) / pg_catalog & information_schema (Postgres).',
          summaryEn: 'System views DBA_*, ALL_*, USER_*, V$ (Oracle) / pg_catalog & information_schema (Postgres).',
          diagnosticFr: 'Hésitation sur la portée de USER_* (mes objets) vs ALL_* (accessibles) vs DBA_* (tous).',
          diagnosticEn: 'Hesitation on scope: USER_* (owned) vs ALL_* (accessible) vs DBA_* (entire instance).',
          commonPitfallFr: 'Oublier que ALL_* n\'affiche que les objets pour lesquels l\'utilisateur a reçu un privilège.',
          commonPitfallEn: 'Forgetting ALL_* only displays objects for which the user holds privileges.',
          recommendedActionFr: 'Mémoriser la distinction USER_ / ALL_ / DBA_ en 3 minutes',
          recommendedActionEn: 'Memorize USER_ / ALL_ / DBA_ distinction in 3 minutes',
        },
      ],
    },
  ],
};

export function loadMasteryTree(): MasteryTreeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveMasteryTree(INITIAL_MASTERY_TREE);
      return INITIAL_MASTERY_TREE;
    }
    const parsed = JSON.parse(raw) as MasteryTreeData;
    if (!parsed || !Array.isArray(parsed.domains) || parsed.domains.length === 0) {
      saveMasteryTree(INITIAL_MASTERY_TREE);
      return INITIAL_MASTERY_TREE;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load mastery tree from storage:', err);
    return INITIAL_MASTERY_TREE;
  }
}

export function saveMasteryTree(data: MasteryTreeData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dbmastery:mastery_updated', { detail: { tree: data } })
      );
    }
  } catch (err) {
    console.error('Failed to save mastery tree to storage:', err);
  }
}

export function resetMasteryTree(): MasteryTreeData {
  saveMasteryTree(INITIAL_MASTERY_TREE);
  return INITIAL_MASTERY_TREE;
}

export interface MasteryDiagnosticSummary {
  masteredSubtopics: MasterySubtopic[];
  inProgressSubtopics: MasterySubtopic[];
  criticalGapsSubtopics: MasterySubtopic[];
  topPriorityWeakness: MasterySubtopic;
  globalVerdictFr: string;
  globalVerdictEn: string;
  strengthsSummaryFr: string;
  strengthsSummaryEn: string;
  gapsSummaryFr: string;
  gapsSummaryEn: string;
}

export function getMasteryDiagnostic(tree: MasteryTreeData): MasteryDiagnosticSummary {
  const allSubs: MasterySubtopic[] = [];
  tree.domains.forEach((d) => allSubs.push(...d.subtopics));

  const mastered = allSubs.filter((s) => s.score >= 80).sort((a, b) => b.score - a.score);
  const inProgress = allSubs
    .filter((s) => s.score >= 65 && s.score < 80)
    .sort((a, b) => b.score - a.score);
  const criticalGaps = allSubs.filter((s) => s.score < 65).sort((a, b) => a.score - b.score);

  const topPriority = criticalGaps[0] || allSubs[0];

  const masteredNames = mastered.slice(0, 3).map((s) => `${s.name} (${s.score}%)`).join(', ');
  const gapNames = criticalGaps.slice(0, 3).map((s) => `${s.name} (${s.score}%)`).join(', ');

  const strengthsFr = mastered.length > 0
    ? `Points forts confirmés : ${masteredNames}. Votre socle d'interrogation et de sécurité est solide.`
    : `En cours d'acquisition sur les notions fondamentales.`;
  const strengthsEn = mastered.length > 0
    ? `Confirmed strengths: ${masteredNames}. Strong foundation in querying and security.`
    : `Acquiring basic concepts.`;

  const gapsFr = criticalGaps.length > 0
    ? `Angles morts prioritaires à combler : ${gapNames}. C'est ici que se jouent les points décisifs pour l'examen.`
    : `Aucune lacune critique détectée. Tous les sous-domaines sont au-dessus de 65%.`;
  const gapsEn = criticalGaps.length > 0
    ? `Priority blind spots: ${gapNames}. Critical points needed to pass the certification exam.`
    : `No critical gaps detected. All subtopics above 65%.`;

  const globalVerdictFr = `Niveau global calculé : ${tree.overallScore}% (${mastered.length} acquis, ${inProgress.length} en consolidation, ${criticalGaps.length} lacunes critiques).`;
  const globalVerdictEn = `Overall level: ${tree.overallScore}% (${mastered.length} mastered, ${inProgress.length} in progress, ${criticalGaps.length} critical gaps).`;

  return {
    masteredSubtopics: mastered,
    inProgressSubtopics: inProgress,
    criticalGapsSubtopics: criticalGaps,
    topPriorityWeakness: topPriority,
    globalVerdictFr,
    globalVerdictEn,
    strengthsSummaryFr: strengthsFr,
    strengthsSummaryEn: strengthsEn,
    gapsSummaryFr: gapsFr,
    gapsSummaryEn: gapsEn,
  };
}

/**
 * Met à jour un sous-sujet spécifique suite à une réponse utilisateur,
 * recalcule automatiquement le score du domaine parent et le score global.
 */
export function recordAnswerInMasteryTree(
  rawTopic: string,
  isCorrect: boolean
): MasteryTreeData {
  const currentTree = loadMasteryTree();
  const normalized = normalizeTopicToSubtopicId(rawTopic);

  let targetSubtopic: MasterySubtopic | null = null;
  let targetDomain: MasteryDomain | null = null;

  for (const domain of currentTree.domains) {
    for (const sub of domain.subtopics) {
      if (
        sub.id.toLowerCase() === normalized.toLowerCase() ||
        sub.name.toLowerCase() === normalized.toLowerCase()
      ) {
        targetSubtopic = sub;
        targetDomain = domain;
        break;
      }
    }
    if (targetSubtopic) break;
  }

  // Si non trouvé directement, cibler le sous-sujet le plus proche ou subqueries par défaut
  if (!targetSubtopic || !targetDomain) {
    targetDomain = currentTree.domains[0];
    targetSubtopic = targetDomain.subtopics[0];
  }

  const oldScore = targetSubtopic.score;
  const newAttempts = targetSubtopic.totalAttempts + 1;
  const newCorrect = targetSubtopic.correctAttempts + (isCorrect ? 1 : 0);

  // Évolution pondérée :
  // Si correct : gain +1 à +3%
  // Si erreur : recul -2 à -4%
  let delta = 0;
  if (isCorrect) {
    delta = oldScore >= 90 ? 1 : oldScore >= 75 ? 2 : 3;
  } else {
    delta = oldScore <= 40 ? -1 : oldScore <= 70 ? -2 : -3;
  }

  const newScore = Math.min(99, Math.max(15, oldScore + delta));

  targetSubtopic.previousScore = oldScore;
  targetSubtopic.score = newScore;
  targetSubtopic.totalAttempts = newAttempts;
  targetSubtopic.correctAttempts = newCorrect;
  targetSubtopic.status = computeMasteryStatus(newScore);

  // Recalcul du domaine parent (moyenne des sous-sujets)
  const domainAvg = Math.round(
    targetDomain.subtopics.reduce((acc, s) => acc + s.score, 0) /
      targetDomain.subtopics.length
  );
  targetDomain.previousScore = targetDomain.score;
  targetDomain.score = domainAvg;
  targetDomain.status = computeMasteryStatus(domainAvg);

  // Recalcul du score global
  const allSubtopics: MasterySubtopic[] = [];
  currentTree.domains.forEach((d) => allSubtopics.push(...d.subtopics));
  const overallAvg = Math.round(
    allSubtopics.reduce((acc, s) => acc + s.score, 0) / allSubtopics.length
  );

  currentTree.overallScore = overallAvg;
  currentTree.lastUpdated = new Date().toISOString();
  currentTree.totalQuestionsAnalyzed += 1;

  saveMasteryTree(currentTree);
  return currentTree;
}

/**
 * Applique les résultats d'un examen complet ou d'une session courte sur l'arbre de compétences
 * et produit le rapport d'impact avant/après.
 */
export function applyExamSessionToMastery(
  sessionResults: { topicId: string; correct: number; total: number }[]
): MasteryImpactReport {
  const currentTree = loadMasteryTree();
  const oldOverall = currentTree.overallScore;
  const deltas: MasteryImpactDelta[] = [];

  sessionResults.forEach((result) => {
    if (result.total === 0) return;
    const normalized = normalizeTopicToSubtopicId(result.topicId);

    for (const domain of currentTree.domains) {
      for (const sub of domain.subtopics) {
        if (
          sub.id.toLowerCase() === normalized.toLowerCase() ||
          sub.name.toLowerCase() === normalized.toLowerCase()
        ) {
          const oldScore = sub.score;
          const sessionAccuracy = Math.round((result.correct / result.total) * 100);

          let delta = 0;
          if (sessionAccuracy > oldScore) {
            delta = Math.round((sessionAccuracy - oldScore) * 0.45) + 2;
          } else if (sessionAccuracy < oldScore) {
            delta = Math.round((sessionAccuracy - oldScore) * 0.25) - 1;
          }

          const newScore = Math.min(99, Math.max(15, oldScore + delta));

          sub.previousScore = oldScore;
          sub.score = newScore;
          sub.totalAttempts += result.total;
          sub.correctAttempts += result.correct;
          sub.status = computeMasteryStatus(newScore);

          deltas.push({
            subtopicId: sub.id,
            subtopicName: sub.name,
            domainId: domain.id,
            domainName: domain.name,
            oldScore,
            newScore,
            diff: newScore - oldScore,
            correct: result.correct,
            total: result.total,
            newStatus: sub.status,
          });
        }
      }
    }
  });

  // Recalcul de chaque domaine
  currentTree.domains.forEach((d) => {
    const avg = Math.round(
      d.subtopics.reduce((acc, s) => acc + s.score, 0) / d.subtopics.length
    );
    d.previousScore = d.score;
    d.score = avg;
    d.status = computeMasteryStatus(avg);
  });

  // Recalcul global
  const allSubtopics: MasterySubtopic[] = [];
  currentTree.domains.forEach((d) => allSubtopics.push(...d.subtopics));
  const newOverall = Math.round(
    allSubtopics.reduce((acc, s) => acc + s.score, 0) / allSubtopics.length
  );

  const totalQuestionsInSession = sessionResults.reduce((acc, r) => acc + r.total, 0);

  currentTree.overallScore = newOverall;
  currentTree.lastUpdated = new Date().toISOString();
  currentTree.totalQuestionsAnalyzed += totalQuestionsInSession;

  saveMasteryTree(currentTree);

  const diag = getMasteryDiagnostic(currentTree);

  return {
    overallOldScore: oldOverall,
    overallNewScore: newOverall,
    overallDiff: newOverall - oldOverall,
    deltas,
    newMasteredCount: diag.masteredSubtopics.length,
    newGapsCount: diag.criticalGapsSubtopics.length,
  };
}

export function normalizeTopicToSubtopicId(raw: string): string {
  const t = (raw || '').toLowerCase().trim();
  if (t.includes('select') || t.includes('projection')) return 'select';
  if (t.includes('where') || t.includes('predicate') || t.includes('filtr')) return 'where';
  if (t.includes('join') || t.includes('jointure')) return 'join';
  if (t.includes('group') || t.includes('having') || t.includes('aggr')) return 'group_by';
  if (t.includes('subq') || t.includes('sous-req') || t.includes('cte') || t.includes('exists') || t.includes('nested')) return 'subqueries';
  if (t.includes('norm') || t.includes('3nf') || t.includes('forme')) return 'norm_3nf';
  if (t.includes('constraint') || t.includes('cle') || t.includes('key') || t.includes('pk') || t.includes('fk')) return 'constraints_keys';
  if (t.includes('ddl') || t.includes('alter') || t.includes('schema') || t.includes('table')) return 'schema_ddl';
  if (t.includes('acid') || t.includes('commit') || t.includes('rollback')) return 'acid_props';
  if (t.includes('isolat') || t.includes('serializ') || t.includes('repeat') || t.includes('read_commit')) return 'isolation_levels';
  if (t.includes('lock') || t.includes('verrou') || t.includes('deadlock')) return 'locks_deadlocks';
  if (t.includes('bitmap') || t.includes('btree') || t.includes('b-tree')) return 'btree_bitmap';
  if (t.includes('scan') || t.includes('composite') || t.includes('index')) return 'composite_indexes';
  if (t.includes('explain') || t.includes('cbo') || t.includes('cout') || t.includes('plan')) return 'explain_plan';
  if (t.includes('grant') || t.includes('revoke') || t.includes('role') || t.includes('user') || t.includes('privilege')) return 'roles_privileges';
  if (t.includes('backup') || t.includes('sauvegard') || t.includes('rman') || t.includes('recover')) return 'backup_recovery';
  if (t.includes('dict') || t.includes('vue') || t.includes('all_') || t.includes('user_') || t.includes('dba_')) return 'data_dictionary';
  return 'select';
}
