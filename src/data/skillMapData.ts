import { SkillNode, SkillProfileComparison } from '../types';

export const sqlSkillTreeData: SkillNode[] = [
  {
    id: 'sql-select',
    name: 'SELECT',
    category: 'core_dql',
    descriptionFr: 'Projection de colonnes, expressions scalaires, déduplication DISTINCT, alias et arithmétique de base.',
    descriptionEn: 'Column projection, scalar expressions, DISTINCT deduplication, aliases and basic arithmetic.',
    level: 'fundamental',
    dimensions: {
      knowledge: 100,
      accuracy: 98,
      speed: 96,
      consistency: 97,
      averageTimeSeconds: 14,
      targetTimeSeconds: 20,
      totalAttempts: 148,
      streak: 24
    },
    compositeScore: 98,
    children: [
      {
        id: 'select-projections',
        name: 'Projections & Expressions',
        category: 'core_dql',
        descriptionFr: 'Colonnes calculées, opérateurs arithmétiques et concaténation.',
        descriptionEn: 'Computed columns, arithmetic operators and string concatenation.',
        level: 'fundamental',
        dimensions: {
          knowledge: 100,
          accuracy: 100,
          speed: 98,
          consistency: 99,
          averageTimeSeconds: 11,
          targetTimeSeconds: 15,
          totalAttempts: 64,
          streak: 22
        },
        compositeScore: 100
      },
      {
        id: 'select-distinct',
        name: 'DISTINCT & Elimination des doublons',
        category: 'core_dql',
        descriptionFr: 'Application de DISTINCT sur n-uplets complets et coût de tri sous-jacent.',
        descriptionEn: 'DISTINCT across entire row tuples and sort overhead.',
        level: 'fundamental',
        dimensions: {
          knowledge: 100,
          accuracy: 96,
          speed: 94,
          consistency: 95,
          averageTimeSeconds: 16,
          targetTimeSeconds: 20,
          totalAttempts: 52,
          streak: 15
        },
        compositeScore: 97
      },
      {
        id: 'select-aliases',
        name: 'Alias de colonnes et règles de portée',
        category: 'core_dql',
        descriptionFr: 'Alias double-quoted case-sensitive et indisponibilité dans le WHERE.',
        descriptionEn: 'Double-quoted case sensitive aliases and unavailability in WHERE clause.',
        level: 'fundamental',
        dimensions: {
          knowledge: 100,
          accuracy: 97,
          speed: 95,
          consistency: 96,
          averageTimeSeconds: 14,
          targetTimeSeconds: 20,
          totalAttempts: 32,
          streak: 18
        },
        compositeScore: 97
      }
    ],
    commonTrapsFr: [
      'Tenter d\'utiliser un alias de colonne défini dans le SELECT directement dans la clause WHERE.',
      'Croire que DISTINCT ne s\'applique qu\'à la première colonne listée au lieu de la ligne entière.'
    ],
    commonTrapsEn: [
      'Attempting to use a column alias defined in SELECT inside the WHERE clause.',
      'Assuming DISTINCT applies only to the first column instead of the full row.'
    ],
    benchmarkLabelFr: 'Réflexe instinctif (<15s) - 0 hésitation syntaxique',
    benchmarkLabelEn: 'Instinctive reflex (<15s) - zero syntax hesitation'
  },
  {
    id: 'sql-where',
    name: 'WHERE',
    category: 'core_dql',
    descriptionFr: 'Prédicats de filtrage de lignes, logique ternaire tri-valuée (TRUE/FALSE/UNKNOWN avec NULL), BETWEEN, IN et LIKE.',
    descriptionEn: 'Row filtering predicates, 3-valued logic (NULL evaluation), BETWEEN, IN and LIKE operators.',
    level: 'fundamental',
    dimensions: {
      knowledge: 95,
      accuracy: 92,
      speed: 86,
      consistency: 88,
      averageTimeSeconds: 22,
      targetTimeSeconds: 25,
      totalAttempts: 126,
      streak: 16
    },
    compositeScore: 90,
    children: [
      {
        id: 'where-null-logic',
        name: 'Logique ternaire & IS NULL',
        category: 'core_dql',
        descriptionFr: 'Comparaisons avec NULL (= NULL retourne UNKNOWN), NVL / COALESCE.',
        descriptionEn: 'Null comparisons (= NULL returns UNKNOWN), NVL / COALESCE handling.',
        level: 'intermediate',
        dimensions: {
          knowledge: 92,
          accuracy: 88,
          speed: 84,
          consistency: 86,
          averageTimeSeconds: 24,
          targetTimeSeconds: 25,
          totalAttempts: 48,
          streak: 11
        },
        compositeScore: 88
      },
      {
        id: 'where-between-in',
        name: 'BETWEEN, IN et opérateurs d\'intervalle',
        category: 'core_dql',
        descriptionFr: 'Bornes inclusives de BETWEEN, listes de constantes et gestion de NULL dans IN.',
        descriptionEn: 'Inclusive boundaries of BETWEEN, constant lists and NULL in IN predicates.',
        level: 'fundamental',
        dimensions: {
          knowledge: 98,
          accuracy: 95,
          speed: 90,
          consistency: 92,
          averageTimeSeconds: 19,
          targetTimeSeconds: 20,
          totalAttempts: 42,
          streak: 14
        },
        compositeScore: 94
      },
      {
        id: 'where-pattern-matching',
        name: 'LIKE, jokers (% et _) et clause ESCAPE',
        category: 'core_dql',
        descriptionFr: 'Échappement des caractères réservés avec ESCAPE et sensibilité à la casse.',
        descriptionEn: 'Escaping wildcard characters with ESCAPE and collation sensitivity.',
        level: 'intermediate',
        dimensions: {
          knowledge: 92,
          accuracy: 90,
          speed: 82,
          consistency: 84,
          averageTimeSeconds: 25,
          targetTimeSeconds: 25,
          totalAttempts: 36,
          streak: 8
        },
        compositeScore: 87
      }
    ],
    commonTrapsFr: [
      'Écrire "WHERE col = NULL" au lieu de "WHERE col IS NULL" (ne renvoie jamais de ligne).',
      'Oublier que BETWEEN est toujours strictement inclusif pour les deux bornes (borne_inf AND borne_sup).'
    ],
    commonTrapsEn: [
      'Writing "WHERE col = NULL" instead of "WHERE col IS NULL" (always returns UNKNOWN).',
      'Forgetting that BETWEEN is fully inclusive of both endpoints.'
    ],
    benchmarkLabelFr: 'Bonne fluidité (20-25s) - vigilance requise sur NULL',
    benchmarkLabelEn: 'Good fluidity (20-25s) - vigilance needed on NULL'
  },
  {
    id: 'sql-join',
    name: 'JOIN',
    category: 'advanced_query',
    descriptionFr: 'Jointures relationnelles ANSI SQL : INNER, LEFT/RIGHT OUTER, FULL OUTER, CROSS, SELF JOIN et filtrage ON vs WHERE.',
    descriptionEn: 'ANSI SQL relational joins: INNER, LEFT/RIGHT OUTER, FULL OUTER, CROSS, SELF JOIN, ON vs WHERE predicate pushdown.',
    level: 'intermediate',
    dimensions: {
      knowledge: 75,
      accuracy: 62,
      speed: 48,
      consistency: 55,
      averageTimeSeconds: 68,
      targetTimeSeconds: 35,
      totalAttempts: 110,
      streak: 4
    },
    compositeScore: 60,
    children: [
      {
        id: 'join-inner',
        name: 'INNER JOIN & Prédicats d\'équi-jointure',
        category: 'advanced_query',
        descriptionFr: 'Matching strict des clés étrangères et élimination des non-appariés.',
        descriptionEn: 'Strict foreign key matching and exclusion of unreferenced rows.',
        level: 'fundamental',
        dimensions: {
          knowledge: 95,
          accuracy: 90,
          speed: 82,
          consistency: 85,
          averageTimeSeconds: 28,
          targetTimeSeconds: 30,
          totalAttempts: 38,
          streak: 12
        },
        compositeScore: 88
      },
      {
        id: 'join-left-outer',
        name: 'LEFT OUTER JOIN & Préservation des lignes',
        category: 'advanced_query',
        descriptionFr: 'Conservation de la table de gauche et génération de NULLs côté droit.',
        descriptionEn: 'Preserving left table rows and generating NULL values on right.',
        level: 'intermediate',
        dimensions: {
          knowledge: 70,
          accuracy: 55,
          speed: 40,
          consistency: 48,
          averageTimeSeconds: 84,
          targetTimeSeconds: 35,
          totalAttempts: 42,
          streak: 2
        },
        compositeScore: 53
      },
      {
        id: 'join-on-vs-where',
        name: 'Prédicats dans ON vs WHERE (Null-Rejecting)',
        category: 'advanced_query',
        descriptionFr: 'Filtrage pendant la jointure vs filtrage post-jointure qui casse le LEFT JOIN.',
        descriptionEn: 'Join-time filtering vs post-join WHERE filter that mutates outer join into inner.',
        level: 'advanced',
        dimensions: {
          knowledge: 60,
          accuracy: 42,
          speed: 30,
          consistency: 38,
          averageTimeSeconds: 98,
          targetTimeSeconds: 40,
          totalAttempts: 30,
          streak: 1
        },
        compositeScore: 42
      }
    ],
    commonTrapsFr: [
      'Placer un filtre sur la table de droite dans la clause WHERE d\'un LEFT JOIN (transforme silencieusement le LEFT JOIN en INNER JOIN !).',
      'Confondre le produit cartésien CROSS JOIN accidentel (oubli de clause ON) avec une jointure multiple.'
    ],
    commonTrapsEn: [
      'Placing a right table filter in the WHERE clause of a LEFT JOIN (unintentionally converts it into an INNER JOIN!).',
      'Accidental CROSS Cartesian product when omitting ON conditions.'
    ],
    benchmarkLabelFr: 'Point de fragilité identifié : temps excessif (>1m) sur ON vs WHERE',
    benchmarkLabelEn: 'Identified weakness: excessive deliberation time (>1m) on ON vs WHERE'
  },
  {
    id: 'sql-groupby',
    name: 'GROUP BY',
    category: 'aggregation',
    descriptionFr: 'Partitionnement des lignes en groupes d\'agrégation, fonctions vectorielles (COUNT, SUM, AVG, MIN, MAX), gestion des NULL.',
    descriptionEn: 'Row partitioning into aggregate buckets, vector functions (COUNT, SUM, AVG, MIN, MAX), NULL group handling.',
    level: 'intermediate',
    dimensions: {
      knowledge: 88,
      accuracy: 82,
      speed: 74,
      consistency: 78,
      averageTimeSeconds: 38,
      targetTimeSeconds: 35,
      totalAttempts: 94,
      streak: 9
    },
    compositeScore: 80,
    children: [
      {
        id: 'group-aggregates',
        name: 'Fonctions de groupe & NULL',
        category: 'aggregation',
        descriptionFr: 'COUNT(*) compte les lignes avec NULL, SUM/AVG ignorent silencieusement les NULLs.',
        descriptionEn: 'COUNT(*) tallies all rows, SUM/AVG ignore NULLs.',
        level: 'fundamental',
        dimensions: {
          knowledge: 94,
          accuracy: 90,
          speed: 82,
          consistency: 88,
          averageTimeSeconds: 26,
          targetTimeSeconds: 30,
          totalAttempts: 36,
          streak: 12
        },
        compositeScore: 89
      },
      {
        id: 'group-column-mandate',
        name: 'Règle stricte des colonnes non agrégées',
        category: 'aggregation',
        descriptionFr: 'Toute colonne non agrégée du SELECT doit impérativement figurer dans le GROUP BY.',
        descriptionEn: 'Every non-aggregated column in SELECT must be present in GROUP BY clause.',
        level: 'intermediate',
        dimensions: {
          knowledge: 85,
          accuracy: 78,
          speed: 70,
          consistency: 72,
          averageTimeSeconds: 44,
          targetTimeSeconds: 35,
          totalAttempts: 34,
          streak: 6
        },
        compositeScore: 76
      },
      {
        id: 'group-rollup-cube',
        name: 'Extensions ROLLUP & CUBE',
        category: 'aggregation',
        descriptionFr: 'Sous-totaux hiérarchiques et super-agrégats multidimensionnels.',
        descriptionEn: 'Hierarchical sub-totals and multidimensional cross-tab aggregates.',
        level: 'advanced',
        dimensions: {
          knowledge: 80,
          accuracy: 72,
          speed: 64,
          consistency: 68,
          averageTimeSeconds: 52,
          targetTimeSeconds: 40,
          totalAttempts: 24,
          streak: 5
        },
        compositeScore: 71
      }
    ],
    commonTrapsFr: [
      'Oublier qu\'AVG(commission_pct) calcule la moyenne uniquement sur les employés ayant une commission (ignorant les NULLs), faussant la moyenne d\'entreprise si NVL() n\'est pas appliqué.',
      'Tenter de grouper sur un alias défini dans le SELECT.'
    ],
    commonTrapsEn: [
      'Ignoring that AVG() drops NULLs, distorting true enterprise averages unless NVL/COALESCE is supplied.',
      'Grouping by aliases declared in SELECT in standard ANSI SQL.'
    ],
    benchmarkLabelFr: 'Solide maîtrise globale (38s) - attention aux sous-totaux',
    benchmarkLabelEn: 'Solid overall mastery (38s) - watch out for sub-totals'
  },
  {
    id: 'sql-having',
    name: 'HAVING',
    category: 'aggregation',
    descriptionFr: 'Filtrage post-agrégation appliqué aux groupes consolidés. Différence d\'ordre d\'évaluation par rapport à WHERE.',
    descriptionEn: 'Post-aggregation filtering applied to consolidated buckets. Execution order difference vs WHERE.',
    level: 'intermediate',
    dimensions: {
      knowledge: 65,
      accuracy: 52,
      speed: 42,
      consistency: 46,
      averageTimeSeconds: 76,
      targetTimeSeconds: 35,
      totalAttempts: 72,
      streak: 3
    },
    compositeScore: 50,
    children: [
      {
        id: 'having-vs-where',
        name: 'Ordre d\'exécution WHERE vs HAVING',
        category: 'aggregation',
        descriptionFr: 'WHERE filtre avant agrégation, HAVING filtre après calcul des groupes.',
        descriptionEn: 'WHERE eliminates rows before grouping, HAVING filters groups after aggregation.',
        level: 'intermediate',
        dimensions: {
          knowledge: 72,
          accuracy: 60,
          speed: 48,
          consistency: 52,
          averageTimeSeconds: 65,
          targetTimeSeconds: 35,
          totalAttempts: 28,
          streak: 4
        },
        compositeScore: 58
      },
      {
        id: 'having-predicates',
        name: 'Prédicats agrégés dans HAVING',
        category: 'aggregation',
        descriptionFr: 'Utilisation de COUNT() > 5 ou AVG() dans le HAVING sans les projeter dans le SELECT.',
        descriptionEn: 'Using COUNT() > 5 or AVG() in HAVING without necessarily projecting in SELECT.',
        level: 'intermediate',
        dimensions: {
          knowledge: 62,
          accuracy: 48,
          speed: 38,
          consistency: 42,
          averageTimeSeconds: 82,
          targetTimeSeconds: 35,
          totalAttempts: 26,
          streak: 2
        },
        compositeScore: 47
      },
      {
        id: 'having-optimization',
        name: 'Optimisation de performance WHERE vs HAVING',
        category: 'aggregation',
        descriptionFr: 'Toujours filtrer les colonnes scalaires dans WHERE pour réduire le volume avant GROUP BY.',
        descriptionEn: 'Always pre-filter scalar rows in WHERE to reduce data payload before grouping.',
        level: 'advanced',
        dimensions: {
          knowledge: 58,
          accuracy: 44,
          speed: 36,
          consistency: 40,
          averageTimeSeconds: 88,
          targetTimeSeconds: 40,
          totalAttempts: 18,
          streak: 2
        },
        compositeScore: 44
      }
    ],
    commonTrapsFr: [
      'Placer une condition non agrégée (ex: "department_id = 10") dans HAVING au lieu de WHERE, ce qui force la base à regrouper toute la table avant de jeter les groupes.',
      'Tenter d\'écrire des fonctions de groupe comme "WHERE COUNT(*) > 1" (interdit en SQL).'
    ],
    commonTrapsEn: [
      'Placing scalar row conditions in HAVING instead of WHERE, forcing the optimizer to group the entire table first.',
      'Attempting to write group functions like "WHERE COUNT(*) > 1" (illegal syntax).'
    ],
    benchmarkLabelFr: 'Hésitation marquée (>1m15s) sur la frontière WHERE/HAVING',
    benchmarkLabelEn: 'Marked hesitation (>1m15s) on the WHERE/HAVING boundary'
  },
  {
    id: 'sql-subqueries',
    name: 'Subqueries',
    category: 'advanced_query',
    descriptionFr: 'Sous-requêtes scalaires, multilignes (IN, ANY, ALL) et corrélées. Impact des NULL dans "NOT IN (SELECT ...)"',
    descriptionEn: 'Scalar subqueries, multi-row (IN, ANY, ALL) and correlated subqueries. NULL hazard in NOT IN clauses.',
    level: 'advanced',
    dimensions: {
      knowledge: 55,
      accuracy: 42,
      speed: 32,
      consistency: 36,
      averageTimeSeconds: 115,
      targetTimeSeconds: 45,
      totalAttempts: 68,
      streak: 2
    },
    compositeScore: 40,
    children: [
      {
        id: 'subq-scalar',
        name: 'Sous-requêtes scalaires & SELECT',
        category: 'advanced_query',
        descriptionFr: 'Sous-requête retournant exactement 1 ligne et 1 colonne. Erreur ORA-01427.',
        descriptionEn: 'Subquery returning exactly 1 row and 1 column. Error ORA-01427 when returning multiple.',
        level: 'intermediate',
        dimensions: {
          knowledge: 70,
          accuracy: 60,
          speed: 48,
          consistency: 50,
          averageTimeSeconds: 78,
          targetTimeSeconds: 40,
          totalAttempts: 24,
          streak: 3
        },
        compositeScore: 57
      },
      {
        id: 'subq-not-in-null',
        name: 'Piège critique NOT IN avec NULL',
        category: 'advanced_query',
        descriptionFr: 'Si la sous-requête retourne un seul NULL, NOT IN renvoie 0 ligne pour toute la table !',
        descriptionEn: 'If the subquery returns even a single NULL, NOT IN yields 0 rows for the entire query!',
        level: 'advanced',
        dimensions: {
          knowledge: 48,
          accuracy: 32,
          speed: 22,
          consistency: 28,
          averageTimeSeconds: 135,
          targetTimeSeconds: 45,
          totalAttempts: 26,
          streak: 1
        },
        compositeScore: 31
      },
      {
        id: 'subq-correlated',
        name: 'Sous-requêtes corrélées & EXISTS',
        category: 'advanced_query',
        descriptionFr: 'Sous-requête ré-évaluée par ligne externe, court-circuit booléen de EXISTS.',
        descriptionEn: 'Subquery re-evaluated per outer candidate row, boolean short-circuiting of EXISTS.',
        level: 'advanced',
        dimensions: {
          knowledge: 52,
          accuracy: 38,
          speed: 28,
          consistency: 32,
          averageTimeSeconds: 125,
          targetTimeSeconds: 50,
          totalAttempts: 18,
          streak: 1
        },
        compositeScore: 37
      }
    ],
    commonTrapsFr: [
      'Le piège mortel NOT IN (SELECT manager_id FROM employees) : comme au moins 1 manager_id est NULL (le PDG), l\'évaluation devient UNKNOWN pour toutes les lignes et le résultat est vide !',
      'Préférer NOT IN à NOT EXISTS sans sécuriser "WHERE col IS NOT NULL".'
    ],
    commonTrapsEn: [
      'The notorious NOT IN with NULL hazard: if any subquery item is NULL, NOT IN evaluates to UNKNOWN for all rows!',
      'Using NOT IN instead of NOT EXISTS without guaranteeing non-nullability.'
    ],
    benchmarkLabelFr: 'Temps de résolution critique (>1m50s) : manque d\'automatismes',
    benchmarkLabelEn: 'Critical resolution time (>1m50s): lack of cognitive reflex'
  },
  {
    id: 'sql-cte',
    name: 'CTE',
    category: 'advanced_query',
    descriptionFr: 'Common Table Expressions (clause WITH), factorisation de requêtes complexes, CTEs multiples et récursivité.',
    descriptionEn: 'Common Table Expressions (WITH clause), modular query breakdown, chaining, and recursive anchors.',
    level: 'advanced',
    dimensions: {
      knowledge: 35,
      accuracy: 22,
      speed: 15,
      consistency: 18,
      averageTimeSeconds: 165,
      targetTimeSeconds: 55,
      totalAttempts: 40,
      streak: 1
    },
    compositeScore: 20,
    children: [
      {
        id: 'cte-syntax',
        name: 'Syntaxe WITH & Chaînage multiple',
        category: 'advanced_query',
        descriptionFr: 'Un seul mot-clé WITH, séparateur par virgule pour plusieurs sous-ensembles nommés.',
        descriptionEn: 'Single WITH keyword, comma-separated chaining of named resultsets.',
        level: 'intermediate',
        dimensions: {
          knowledge: 50,
          accuracy: 38,
          speed: 28,
          consistency: 30,
          averageTimeSeconds: 110,
          targetTimeSeconds: 45,
          totalAttempts: 16,
          streak: 2
        },
        compositeScore: 36
      },
      {
        id: 'cte-recursive',
        name: 'CTE Récursives (Ancre + UNION ALL + Terminaison)',
        category: 'advanced_query',
        descriptionFr: 'Parcours d\'arbres hiérarchiques (organigrammes, nomenclatures de pièces BOM).',
        descriptionEn: 'Hierarchical tree traversals (org charts, bill of materials) with anchor and recursive term.',
        level: 'expert',
        dimensions: {
          knowledge: 22,
          accuracy: 12,
          speed: 8,
          consistency: 10,
          averageTimeSeconds: 210,
          targetTimeSeconds: 65,
          totalAttempts: 14,
          streak: 0
        },
        compositeScore: 12
      },
      {
        id: 'cte-optimization',
        name: 'Matérialisation vs Inlining de CTE',
        category: 'advanced_query',
        descriptionFr: 'Différence de comportement selon le moteur (PostgreSQL MATERIALIZED vs Oracle Cost Optimizer).',
        descriptionEn: 'Engine-specific optimization hints (PostgreSQL MATERIALIZED vs Oracle optimizer).',
        level: 'expert',
        dimensions: {
          knowledge: 28,
          accuracy: 16,
          speed: 10,
          consistency: 14,
          averageTimeSeconds: 180,
          targetTimeSeconds: 60,
          totalAttempts: 10,
          streak: 0
        },
        compositeScore: 16
      }
    ],
    commonTrapsFr: [
      'Répéter le mot-clé WITH entre chaque CTE (syntaxe invalide : un seul WITH au début, puis des virgules).',
      'Oublier la condition d\'arrêt dans une CTE récursive, provoquant une boucle infinie ou l\'erreur de profondeur max.'
    ],
    commonTrapsEn: [
      'Repeating the WITH keyword between CTE declarations (syntax error: single WITH, then commas).',
      'Missing termination predicate in recursive member causing runaway loop.'
    ],
    benchmarkLabelFr: 'Compétence émergente : en cours d\'assimilation (2m45s/question)',
    benchmarkLabelEn: 'Emerging skill: currently acquiring (2m45s/question)'
  },
  {
    id: 'sql-window-functions',
    name: 'Window Functions',
    category: 'advanced_query',
    descriptionFr: 'Calculs analytiques partitionnés sans effondrement des lignes : OVER (PARTITION BY ... ORDER BY ...), ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD.',
    descriptionEn: 'Analytic partitioning without row collapse: OVER clause, ROW_NUMBER, RANK, DENSE_RANK, offset functions LAG/LEAD.',
    level: 'expert',
    dimensions: {
      knowledge: 20,
      accuracy: 10,
      speed: 8,
      consistency: 8,
      averageTimeSeconds: 240,
      targetTimeSeconds: 60,
      totalAttempts: 34,
      streak: 0
    },
    compositeScore: 10,
    children: [
      {
        id: 'win-ranking',
        name: 'ROW_NUMBER vs RANK vs DENSE_RANK',
        category: 'advanced_query',
        descriptionFr: 'Gestion des ex-æquo : continu sans trou (DENSE_RANK) vs avec saut de rang (RANK).',
        descriptionEn: 'Tie resolution: consecutive gapless (DENSE_RANK) vs rank skipping (RANK).',
        level: 'intermediate',
        dimensions: {
          knowledge: 30,
          accuracy: 18,
          speed: 12,
          consistency: 14,
          averageTimeSeconds: 190,
          targetTimeSeconds: 50,
          totalAttempts: 14,
          streak: 1
        },
        compositeScore: 18
      },
      {
        id: 'win-offset',
        name: 'LAG, LEAD & Comparaisons temporelles',
        category: 'advanced_query',
        descriptionFr: 'Accès aux valeurs de la ligne précédente ou suivante sans auto-jointure coûteuse.',
        descriptionEn: 'Accessing preceding or succeeding rows without expensive self-joins.',
        level: 'advanced',
        dimensions: {
          knowledge: 18,
          accuracy: 8,
          speed: 6,
          consistency: 6,
          averageTimeSeconds: 260,
          targetTimeSeconds: 60,
          totalAttempts: 10,
          streak: 0
        },
        compositeScore: 9
      },
      {
        id: 'win-frames',
        name: 'Cadres de fenêtre (ROWS / RANGE BETWEEN)',
        category: 'advanced_query',
        descriptionFr: 'Cumuls mobiles, UNBOUNDED PRECEDING et piège du cadre par défaut en RANGE.',
        descriptionEn: 'Running totals, UNBOUNDED PRECEDING and default RANGE frame trap with duplicates.',
        level: 'expert',
        dimensions: {
          knowledge: 12,
          accuracy: 4,
          speed: 4,
          consistency: 4,
          averageTimeSeconds: 290,
          targetTimeSeconds: 70,
          totalAttempts: 10,
          streak: 0
        },
        compositeScore: 5
      }
    ],
    commonTrapsFr: [
      'Tenter d\'utiliser une fonction de fenêtrage dans la clause WHERE (interdit : l\'évaluation analytique se fait après WHERE et GROUP BY).',
      'Oublier que sans spécification explicite de cadre, ORDER BY déclenche RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, ce qui additionne tous les ex-æquo d\'un coup.'
    ],
    commonTrapsEn: [
      'Attempting to filter window functions in WHERE clause (illegal: evaluated post-WHERE and post-GROUP BY).',
      'Forgetting that ORDER BY defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, grouping duplicate ties together.'
    ],
    benchmarkLabelFr: 'Seuil de découverte : sur-délibération intense (4m/question)',
    benchmarkLabelEn: 'Discovery stage: high deliberation burden (4m/question)'
  }
];

// Helper to generate the exact ASCII Tree Block
export function generateAsciiSkillTree(
  skills: SkillNode[],
  metric: 'composite' | 'knowledge' | 'accuracy' | 'speed' | 'consistency' = 'composite'
): string {
  const lines: string[] = ['SQL'];
  
  skills.forEach((skill, idx) => {
    const isLast = idx === skills.length - 1;
    const branch = isLast ? '└── ' : '├── ';
    const paddedName = skill.name.padEnd(18, ' ');
    
    let val = skill.compositeScore;
    if (metric === 'knowledge') val = skill.dimensions.knowledge;
    if (metric === 'accuracy') val = skill.dimensions.accuracy;
    if (metric === 'speed') val = skill.dimensions.speed;
    if (metric === 'consistency') val = skill.dimensions.consistency;
    
    // Bar generator: 10 blocks
    const filledCount = Math.round((val / 100) * 10);
    const emptyCount = 10 - filledCount;
    const bar = '█'.repeat(filledCount) + '░'.repeat(emptyCount);
    const paddedPercent = `${val}%`.padStart(4, ' ');
    
    lines.push(`${branch}${paddedName} ${bar}  ${paddedPercent}`);
  });
  
  return lines.join('\n');
}

// Interactive Profiles comparison illustrating the prompt quote:
// "Parce qu'un utilisateur qui répond correctement à 8 questions sur 10 mais met 4 minutes par question n'a pas le même niveau qu'un utilisateur qui fait 9/10 en 20 secondes."
export const profileComparisonCases: SkillProfileComparison[] = [
  {
    titleFr: 'Profil A : « L\'Analyste Hésitant »',
    titleEn: 'Profile A: "The Hesitant Analyst"',
    scoreRatio: '8 / 10',
    avgTime: '4m 00s / question',
    dimensions: {
      knowledge: 85,
      accuracy: 80,
      speed: 20,         // Vélocité très basse en raison des 240s vs 30s de référence
      consistency: 50,
      averageTimeSeconds: 240,
      targetTimeSeconds: 30,
      totalAttempts: 10,
      streak: 4
    },
    compositeScore: 54, // (85*0.2) + (80*0.35) + (20*0.3) + (50*0.15) = 17 + 28 + 6 + 7.5 = 58.5
    profileType: 'hesitant',
    verdictFr: 'Bonne base théorique, mais sur-délibération bloquante. L\'utilisateur teste mentalement ou hésite sur la syntaxe. En production ou en examen certifié, le temps manquera sur les requêtes complexes.',
    verdictEn: 'Good theoretical ground, but high deliberation delay. User hesitates on syntax. In production or proctored exam conditions, time will run out on complex queries.'
  },
  {
    titleFr: 'Profil B : « L\'Architecte Réflexe »',
    titleEn: 'Profile B: "The Reflex Pro Architect"',
    scoreRatio: '9 / 10',
    avgTime: '20s / question',
    dimensions: {
      knowledge: 95,
      accuracy: 90,
      speed: 98,         // 20s vs benchmark 30s -> réflexe immédiat
      consistency: 94,
      averageTimeSeconds: 20,
      targetTimeSeconds: 30,
      totalAttempts: 10,
      streak: 8
    },
    compositeScore: 94,
    profileType: 'reflex_pro',
    verdictFr: 'Maîtrise d\'élite et automatismes cognitifs acquis. La syntaxe est un réflexe, les pièges classiques sont identifiés en un coup d\'œil. Excellente prévisibilité en production.',
    verdictEn: 'Elite mastery and automated cognitive reflexes. Syntax is second nature, traps are spotted instantly. High reliability in production.'
  }
];
