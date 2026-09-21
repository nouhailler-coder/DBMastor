import { GlossaryTerm } from '../../types';

export const CAT5_CLAUSES_OPERATORS_TERMS: GlossaryTerm[] = [
  {
    id: 'where',
    termFr: 'Clause WHERE',
    termEn: 'WHERE Clause',
    category: 5,
    categoryNameFr: 'Clauses et Opérateurs de requête',
    categoryNameEn: 'Query Clauses & Operators',
    shortDefFr: 'Filtre les lignes individuelles d\'une table avant tout regroupement ou calcul d\'agrégation, selon des conditions booléennes.',
    shortDefEn: 'Filters individual rows from source tables before any grouping or aggregation takes place, evaluating Boolean predicates.',
    fullExplanationFr: 'La clause `WHERE` est évaluée très tôt dans le cycle d\'exécution SQL (juste après le `FROM` et les `JOIN`). Elle permet au moteur d\'exploiter les index disponibles (Index Seek/Scan) pour éliminer immédiatement les lignes non pertinentes et limiter les I/O disques.',
    fullExplanationEn: 'Evaluated immediately after FROM and JOINs. Allows the query optimizer to utilize index seeks to discard non-matching rows early.',
    codeSnippet: `SELECT nom, salaire, departement
FROM employes
WHERE departement = 'Finance' 
  AND salaire >= 3500 
  AND statut_embauche IS NOT NULL;`,
    codeSnippetCommentFr: 'Filtrage multi-critères avec égalité, comparaison et test de nullité.',
    codeSnippetCommentEn: 'Multi-criteria filtering using equality, range, and nullability checks.',
    dialects: {
      universal: true,
      specialNoteFr: 'Il est formellement interdit d\'utiliser des fonctions d\'agrégation directement dans un WHERE (ex: `WHERE SUM(salaire) > 5000` est une erreur de syntaxe). Utilisez `HAVING` pour filtrer sur les agrégats.',
    },
    crossReferences: [
      { id: 'having', labelFr: 'Clause HAVING', labelEn: 'HAVING Clause' },
      { id: 'group-by', labelFr: 'Clause GROUP BY', labelEn: 'GROUP BY' },
      { id: 'select', labelFr: 'SELECT', labelEn: 'SELECT' },
    ],
    tags: ['Filtrage', 'Prédicat', 'Index', 'Clause'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Évitez d\'envelopper les colonnes indexées dans des fonctions dans le WHERE (ex: `WHERE UPPER(email) = \'TEST@DOMAINE.COM\'` ou `WHERE YEAR(date_cmd) = 2024`) car cela rend le prédicat non-sargable et force un Full Table Scan !',
    proTipEn: 'Avoid wrapping indexed columns in functions inside WHERE (non-sargable) to prevent optimizer fallback to full table scans.',
  },
  {
    id: 'group-by',
    termFr: 'Clause GROUP BY',
    termEn: 'GROUP BY Clause',
    category: 5,
    categoryNameFr: 'Clauses et Opérateurs de requête',
    categoryNameEn: 'Query Clauses & Operators',
    shortDefFr: 'Regroupe les lignes ayant des valeurs identiques dans les colonnes spécifiées pour produire une seule ligne récapitulative par groupe.',
    shortDefEn: 'Collapses rows with identical values in specified columns into aggregate summary rows.',
    fullExplanationFr: 'Utilisée conjointement avec les fonctions d\'agrégation (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`). Règle d\'or ANSI SQL : toute colonne présente dans la clause `SELECT` qui ne fait pas l\'objet d\'une fonction d\'agrégation DOIT obligatoirement figurer dans la clause `GROUP BY`.',
    fullExplanationEn: 'Paired with aggregation functions. Every non-aggregated column appearing in the SELECT list must be included in the GROUP BY expression list.',
    codeSnippet: `SELECT 
  categorie,
  statut,
  COUNT(*) AS nombre_articles,
  SUM(stock * prix_unitaire) AS valeur_totale,
  AVG(prix_unitaire) AS prix_moyen
FROM articles
WHERE disponible = TRUE
GROUP BY categorie, statut;`,
    codeSnippetCommentFr: 'Agrégation sur deux dimensions avec comptage, somme et moyenne.',
    codeSnippetCommentEn: 'Two-dimensional grouping computing count, sum, and average.',
    dialects: {
      universal: true,
      mysql: 'Dans les anciennes versions (ou sans le mode SQL strict `ONLY_FULL_GROUP_BY`), MySQL tolérait des colonnes dans le SELECT absentes du GROUP BY, provoquant des résultats imprévisibles. Le mode strict est activé par défaut en 5.7+ et 8.0.',
      postgres: 'Strictement conforme ANSI SQL. Supporte également `GROUP BY ROLLUP(...)` et `GROUPING SETS`.',
      oracle: 'Conformité stricte ANSI. Supporte `GROUP BY CUBE` et `ROLLUP`.',
    },
    crossReferences: [
      { id: 'having', labelFr: 'Clause HAVING', labelEn: 'HAVING Clause' },
      { id: 'aggregation-functions', labelFr: 'Fonctions d\'agrégation', labelEn: 'Aggregate Functions' },
      { id: 'where', labelFr: 'Clause WHERE', labelEn: 'WHERE Clause' },
    ],
    tags: ['Agrégation', 'Regroupement', 'Statistiques', 'BI'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Pour des analyses multi-niveaux (ex: sous-totaux par pays puis total mondial), découvrez l\'extension `GROUP BY ROLLUP(pays, ville)`.',
    proTipEn: 'Use GROUP BY ROLLUP for automatic multi-level subtotal and grand total calculations.',
  },
  {
    id: 'having',
    termFr: 'Clause HAVING',
    termEn: 'HAVING Clause',
    category: 5,
    categoryNameFr: 'Clauses et Opérateurs de requête',
    categoryNameEn: 'Query Clauses & Operators',
    shortDefFr: 'Filtre les groupes de lignes produits par la clause GROUP BY après calcul des fonctions d\'agrégation.',
    shortDefEn: 'Filters aggregated groups resulting from GROUP BY based on summary calculations and conditions.',
    fullExplanationFr: 'Alors que `WHERE` filtre les lignes individuelles avant le calcul des agrégats, `HAVING` filtre les groupes constitués après calcul. `HAVING` autorise et teste directement le résultat des fonctions d\'agrégation (`COUNT() > 10`, `AVG(note) >= 4.5`).',
    fullExplanationEn: 'While WHERE filters individual rows prior to grouping, HAVING evaluates aggregate expressions after grouping has resolved.',
    codeSnippet: `SELECT 
  client_id, 
  COUNT(commande_id) AS nb_commandes,
  SUM(montant) AS total_depense
FROM commandes
WHERE annee = 2024               -- 1. Filtrage en amont sur les lignes
GROUP BY client_id              -- 2. Regroupement par client
HAVING COUNT(commande_id) >= 5  -- 3. Filtrage en aval sur les agrégats
   AND SUM(montant) > 1000;`,
    codeSnippetCommentFr: 'Combinaison canonique : WHERE (lignes) + GROUP BY + HAVING (groupes).',
    codeSnippetCommentEn: 'Canonical pipeline combining row-level WHERE with group-level HAVING.',
    dialects: {
      universal: true,
      postgres: 'Conforme ANSI. Peut filtrer sur des agrégats non projetés dans le SELECT.',
      oracle: 'Conforme ANSI.',
      sqlServer: 'Conforme ANSI.',
      mysql: 'Permet également d\'utiliser des alias du SELECT dans le HAVING sous MySQL.',
    },
    crossReferences: [
      { id: 'group-by', labelFr: 'Clause GROUP BY', labelEn: 'GROUP BY' },
      { id: 'where', labelFr: 'Clause WHERE', labelEn: 'WHERE' },
      { id: 'aggregation-functions', labelFr: 'Fonctions d\'agrégation', labelEn: 'Aggregate Functions' },
    ],
    tags: ['Filtrage de groupe', 'Agrégation', 'Clause', 'KPI'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Ne mettez jamais dans le `HAVING` un filtre qui ne dépend pas d\'un agrégat (ex: `HAVING annee = 2024`) ! Placez-le toujours dans le `WHERE` pour que les lignes soient écartées dès le départ par les index.',
    proTipEn: 'Never place non-aggregated filters in HAVING; keep them in WHERE to allow index filtering before costly grouping.',
  },
  {
    id: 'order-by',
    termFr: 'Clause ORDER BY',
    termEn: 'ORDER BY Clause',
    category: 5,
    categoryNameFr: 'Clauses et Opérateurs de requête',
    categoryNameEn: 'Query Clauses & Operators',
    shortDefFr: 'Trie le jeu de résultats final retourné par la requête selon une ou plusieurs colonnes, par ordre croissant (ASC) ou décroissant (DESC).',
    shortDefEn: 'Sorts the final query result set across one or multiple columns in ascending (ASC) or descending (DESC) order.',
    fullExplanationFr: 'En SQL, l\'ordre physique de stockage des données dans une table n\'est jamais déterministe. Seule la clause `ORDER BY` garantit un tri prédictible. Si elle est omise, le SGBD peut retourner les lignes dans n\'importe quel ordre (selon les caches ou le parallélisme).',
    fullExplanationEn: 'Relational data sets are inherently unordered mathematical sets. Deterministic sorting is only achieved through an explicit ORDER BY clause.',
    codeSnippet: `SELECT nom, departement, salaire
FROM employes
ORDER BY 
  departement ASC,       -- 1er critère alphabétique
  salaire DESC;          -- 2e critère en cas d'égalité (plus gros salaire en premier)`,
    codeSnippetCommentFr: 'Tri multi-colonnes combinant ordre croissant et décroissant.',
    codeSnippetCommentEn: 'Multi-column sorting combining ascending and descending directions.',
    dialects: {
      universal: true,
      postgres: 'Prend en charge `NULLS FIRST` ou `NULLS LAST` pour positionner explicitement les NULLs.',
      oracle: 'Oracle place les NULLs à la fin par défaut en ASC (et en premier en DESC). Supporte `NULLS FIRST` / `NULLS LAST`.',
      mysql: 'MySQL place les NULLs en tête en ASC (les considère comme les plus petites valeurs).',
      sqlServer: 'Considère les NULLs comme les plus petites valeurs possibles.',
    },
    crossReferences: [
      { id: 'limit-offset', labelFr: 'LIMIT / OFFSET', labelEn: 'LIMIT / OFFSET' },
      { id: 'select', labelFr: 'SELECT', labelEn: 'SELECT' },
    ],
    tags: ['Tri', 'Classement', 'ASC', 'DESC', 'NULLS'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Pour les paginations avec LIMIT ou TOP, n\'oubliez jamais d\'inclure la clé primaire dans l\'ORDER BY pour assurer un tri 100% stable et éviter les lignes dupliquées entre pages.',
    proTipEn: 'Always tie-break paginated ORDER BY clauses with a unique primary key to avoid unstable result pagination.',
  },
  {
    id: 'limit-offset',
    termFr: 'LIMIT / OFFSET (et TOP / FETCH FIRST)',
    termEn: 'LIMIT / OFFSET (and TOP / FETCH FIRST)',
    category: 5,
    categoryNameFr: 'Clauses et Opérateurs de requête',
    categoryNameEn: 'Query Clauses & Operators',
    shortDefFr: 'Restreint le nombre maximal de lignes retournées par une requête et permet de sauter un nombre donné de lignes (pagination).',
    shortDefEn: 'Restricts the maximum row count returned and offsets rows for UI pagination.',
    fullExplanationFr: 'Indispensable pour implémenter la pagination dans les applications web et mobiles. La norme ANSI SQL:2008 a standardisé la clause `OFFSET n ROWS FETCH NEXT m ROWS ONLY`, mais de nombreux moteurs utilisent historiquement des syntaxes propriétaires (`LIMIT m OFFSET n` ou `TOP n`).',
    fullExplanationEn: 'Crucial for web pagination. While ANSI SQL:2008 standardized OFFSET ... FETCH NEXT ... ROWS ONLY, engines feature dialect syntax variations.',
    codeSnippet: `-- Syntaxe universelle moderne (Postgres, MySQL, Oracle 12c+, SQL Server 2012+) :
SELECT id, nom, date_creation
FROM clients
ORDER BY id ASC
OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;

-- Syntaxe courte populaire (PostgreSQL, MySQL, SQLite) :
SELECT id, nom
FROM clients
ORDER BY id ASC
LIMIT 10 OFFSET 20; -- Récupère les lignes 21 à 30`,
    codeSnippetCommentFr: 'Pagination standardisée ANSI vs syntaxe courte LIMIT/OFFSET.',
    codeSnippetCommentEn: 'Comparing ANSI standard OFFSET FETCH with LIMIT/OFFSET syntax.',
    dialects: {
      universal: false,
      postgres: 'Supporte à la fois `LIMIT m OFFSET n` et la norme ANSI `OFFSET n ROWS FETCH NEXT m ROWS ONLY`.',
      mysql: 'Supporte `LIMIT [offset,] count` (ex: `LIMIT 20, 10` équivaut à `LIMIT 10 OFFSET 20`) et la norme ANSI en 8.0+.',
      sqlServer: 'Historiquement `SELECT TOP (10) ...`. Depuis SQL Server 2012+, supporte la norme standard `ORDER BY col OFFSET n ROWS FETCH NEXT m ROWS ONLY`. (Attention : ORDER BY est obligatoire avec OFFSET/FETCH !).',
      oracle: 'Avant Oracle 12c : `WHERE ROWNUM <= 10`. Depuis 12c+ : norme standard `OFFSET n ROWS FETCH NEXT m ROWS ONLY`.',
    },
    crossReferences: [
      { id: 'order-by', labelFr: 'Clause ORDER BY', labelEn: 'ORDER BY' },
      { id: 'select', labelFr: 'SELECT', labelEn: 'SELECT' },
    ],
    tags: ['Pagination', 'Performance', 'Dialectes', 'Top N'],
    difficulty: 'intermediate',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Pour les grandes tables, `OFFSET 1000000` est très lent (le moteur doit lire et ignorer 1 million de lignes). Préférez la "pagination par curseur" ou "Keyset Pagination" : `WHERE id > dernier_id ORDER BY id LIMIT 10`.',
    proTipEn: 'High offsets are slow; prefer Keyset Pagination (`WHERE id > last_seen_id ORDER BY id LIMIT 10`) for deep scrolling.',
  },
  {
    id: 'distinct',
    termFr: 'DISTINCT',
    termEn: 'DISTINCT',
    category: 5,
    categoryNameFr: 'Clauses et Opérateurs de requête',
    categoryNameEn: 'Query Clauses & Operators',
    shortDefFr: 'Élimine les lignes en double dans le résultat d\'une requête SELECT pour ne conserver que les combinaisons uniques de valeurs.',
    shortDefEn: 'Deduplicates rows from the query output, returning only unique value combinations across projected columns.',
    fullExplanationFr: 'S\'applique à l\'ensemble des colonnes listées dans la clause `SELECT` (et non à une seule colonne isolée). Il déclenche généralement une opération de hachage (Hash Aggregate) ou de tri en mémoire pour éliminer les doublons.',
    fullExplanationEn: 'Applies across the entire tuple of projected columns, triggering in-memory sorting or hash aggregation to deduplicate records.',
    codeSnippet: `-- Obtenir la liste unique des pays des clients
SELECT DISTINCT pays, ville
FROM clients
ORDER BY pays, ville;

-- Comptage du nombre de valeurs uniques
SELECT COUNT(DISTINCT categorie) AS nb_categories_uniques
FROM produits;`,
    codeSnippetCommentFr: 'Extraction de couples uniques et comptage distinct d\'entités.',
    codeSnippetCommentEn: 'Extracting distinct location pairs and distinct value counting.',
    dialects: {
      universal: true,
      postgres: 'Prend en charge l\'extension puissante `DISTINCT ON (colonne)` permettant de conserver la première ligne d\'un groupe selon un tri spécifique.',
      oracle: 'Supporte `DISTINCT` (et son synonyme historique `UNIQUE`).',
      sqlServer: 'Supporte `DISTINCT`.',
      mysql: 'Supporte `DISTINCT`.',
    },
    crossReferences: [
      { id: 'select', labelFr: 'SELECT', labelEn: 'SELECT' },
      { id: 'group-by', labelFr: 'GROUP BY', labelEn: 'GROUP BY' },
      { id: 'union', labelFr: 'UNION', labelEn: 'UNION' },
    ],
    tags: ['Dédoublonnage', 'Unicité', 'Projection'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Méfiez-vous de l\'utilisation réflexe de DISTINCT pour "masquer" des doublons causés par une mauvaise jointure cartésienne 1-N. Corrigez toujours la condition de jointure à la source.',
    proTipEn: 'Do not use DISTINCT as a band-aid to mask accidental Cartesian duplication caused by incorrect join conditions.',
  },
  {
    id: 'operateurs-logiques',
    termFr: 'Opérateurs logiques (AND, OR, NOT)',
    termEn: 'Logical Operators (AND, OR, NOT)',
    category: 5,
    categoryNameFr: 'Clauses et Opérateurs de requête',
    categoryNameEn: 'Query Clauses & Operators',
    shortDefFr: 'Opérateurs combinant des expressions booléennes selon les règles de l\'algèbre de Boole et de la logique ternaire (TRUE, FALSE, UNKNOWN).',
    shortDefEn: 'Boolean operators combining conditions under three-valued logic (TRUE, FALSE, UNKNOWN).',
    fullExplanationFr: 'Priorité des opérateurs : `NOT` est prioritaire sur `AND`, qui est lui-même prioritaire sur `OR` (`NOT` > `AND` > `OR`). En cas de doute ou d\'imbrication de conditions, l\'utilisation de parenthèses explicites est indispensable.',
    fullExplanationEn: 'Operator precedence order: NOT > AND > OR. Always use explicit parentheses when combining mixed logical conditions.',
    codeSnippet: `-- Piège classique de priorité sans parenthèses :
-- Sans parenthèses : (ville = 'Paris' AND age > 30) OR statut = 'VIP'
SELECT nom FROM membres
WHERE (ville = 'Paris' OR ville = 'Lyon') 
  AND age >= 18 
  AND NOT suspendu;`,
    codeSnippetCommentFr: 'Priorité logique explicite grâce aux parenthèses.',
    codeSnippetCommentEn: 'Parenthesizing compound logical conditions to avoid precedence bugs.',
    dialects: {
      universal: true,
      mysql: 'MySQL supporte également les opérateurs symboliques `&&`, `||`, `!`.',
      postgres: 'Strictement conforme ANSI SQL.',
    },
    crossReferences: [
      { id: 'where', labelFr: 'Clause WHERE', labelEn: 'WHERE' },
      { id: 'operateurs-comparaison', labelFr: 'Opérateurs de comparaison', labelEn: 'Comparison Operators' },
    ],
    tags: ['Logique', 'Booléen', 'Prédicats', 'Parenthèses'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'En SQL, `TRUE OR NULL` donne `TRUE`, mais `FALSE AND NULL` donne `FALSE` et `TRUE AND NULL` donne `UNKNOWN`.',
    proTipEn: 'Under 3VL: TRUE OR NULL evaluates to TRUE, but TRUE AND NULL evaluates to UNKNOWN.',
  },
  {
    id: 'operateurs-comparaison',
    termFr: 'Opérateurs de comparaison (=, <>, !=, <, >, <=, >=)',
    termEn: 'Comparison Operators (=, <>, !=, <, >, <=, >=)',
    category: 5,
    categoryNameFr: 'Clauses et Opérateurs de requête',
    categoryNameEn: 'Query Clauses & Operators',
    shortDefFr: 'Symboles relationnels comparant deux valeurs ou expressions pour évaluer si elles sont égales, inégales ou ordonnées.',
    shortDefEn: 'Relational symbols evaluating equality, inequality, and relative ordering between two expressions.',
    fullExplanationFr: 'La norme ANSI SQL préconise `<>` pour l\'inégalité, bien que `!=` soit universellement accepté par tous les SGBD modernes. Règle fondamentale : comparer une valeur avec `NULL` via `=` ou `<>` donne TOUJOURS `UNKNOWN` (utilisez `IS NULL`).',
    fullExplanationEn: 'ANSI standard specifies <> for inequality, though != is universally supported. Any comparison with NULL yields UNKNOWN.',
    codeSnippet: `SELECT titre, prix, stock
FROM livres
WHERE prix >= 15.00 
  AND stock <> 0          -- Différent de 0 (norme ANSI)
  AND auteur != 'Anonyme'; -- Syntaxe alternative acceptée`,
    codeSnippetCommentFr: 'Comparaisons numériques et textuelles.',
    codeSnippetCommentEn: 'Numeric range and string inequality comparison checks.',
    dialects: {
      universal: true,
      mysql: 'MySQL propose l\'opérateur spécial `<=>` (NULL-safe equal operator) qui permet de comparer `val1 <=> val2` en renvoyant TRUE si les deux sont NULL.',
      postgres: 'PostgreSQL supporte l\'opérateur standard `IS DISTINCT FROM` pour les comparaisons sécurisées vis-à-vis des NULLs.',
      sqlServer: 'Supporte `=` et `<>` ou `!=`.',
      oracle: 'Supporte `=` et `<>` ou `!=`.',
    },
    crossReferences: [
      { id: 'where', labelFr: 'Clause WHERE', labelEn: 'WHERE' },
      { id: 'operateurs-speciaux', labelFr: 'Opérateurs spéciaux', labelEn: 'Special Operators' },
    ],
    tags: ['Comparaison', 'Inégalité', 'Égalité', 'Prédicats'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
  },
  {
    id: 'operateurs-speciaux',
    termFr: 'Opérateurs spéciaux (IN, BETWEEN, LIKE, IS NULL)',
    termEn: 'Special Operators (IN, BETWEEN, LIKE, IS NULL)',
    category: 5,
    categoryNameFr: 'Clauses et Opérateurs de requête',
    categoryNameEn: 'Query Clauses & Operators',
    shortDefFr: 'Opérateurs avancés permettant de tester l\'appartenance à une liste (IN), l\'inclusion dans un intervalle (BETWEEN), le filtrage par motif (LIKE), et l\'absence de valeur (IS NULL).',
    shortDefEn: 'Expressive operators checking list membership (IN), range inclusion (BETWEEN), pattern matching (LIKE), and nullability (IS NULL).',
    fullExplanationFr: 'Ces opérateurs simplifient l\'écriture des requêtes : `BETWEEN a AND b` est inclusif (équivalent à `>= a AND <= b`). `LIKE` utilise `%` (zéro ou plusieurs caractères) et `_` (un caractère exact). `IS NULL` est le seul moyen légitime de vérifier si une valeur est absente.',
    fullExplanationEn: 'BETWEEN is fully inclusive. LIKE utilizes % (wildcard 0..N chars) and _ (single char). IS NULL is mandatory for checking absent data.',
    codeSnippet: `-- 1. Appartenance à une liste ou sous-requête
SELECT * FROM clients WHERE pays IN ('France', 'Belgique', 'Suisse');

-- 2. Intervalle inclusif
SELECT * FROM factures WHERE date_facture BETWEEN '2024-01-01' AND '2024-03-31';

-- 3. Recherche par motif (commence par 'Tech' et finit par 'corp')
SELECT * FROM entreprises WHERE nom LIKE 'Tech%corp';

-- 4. Test d'absence / présence de valeur
SELECT * FROM commandes WHERE date_livraison IS NULL;
SELECT * FROM commandes WHERE date_livraison IS NOT NULL;`,
    codeSnippetCommentFr: 'Démonstration des 4 opérateurs de filtrage indispensables.',
    codeSnippetCommentEn: 'Comprehensive demo of list, interval, pattern, and nullness checks.',
    dialects: {
      universal: true,
      postgres: 'Propose également `ILIKE` pour les recherches LIKE insensibles à la casse (Case-Insensitive), et les opérateurs regex `~` et `~*`.',
      mysql: '`LIKE` est insensible à la casse par défaut selon le collationnement de la colonne (ex: `utf8mb4_general_ci`).',
      oracle: '`LIKE` est sensible à la casse par défaut. Pour ignorer la casse, utiliser `REGEXP_LIKE(col, motif, \'i\')` ou `UPPER(col) LIKE UPPER(motif)`.',
      sqlServer: 'Sensibilité à la casse dépendante du collationnement (CI = Case-Insensitive, CS = Case-Sensitive).',
    },
    crossReferences: [
      { id: 'not-null', labelFr: 'Contrainte NOT NULL', labelEn: 'NOT NULL' },
      { id: 'where', labelFr: 'Clause WHERE', labelEn: 'WHERE' },
      { id: 'subquery', labelFr: 'Sous-requête', labelEn: 'Subquery' },
    ],
    tags: ['IN', 'BETWEEN', 'LIKE', 'IS NULL', 'Wildcards'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Attention avec `NOT IN` contenant des valeurs NULL : si la liste ou sous-requête contient ne serait-ce qu\'une seule valeur NULL, toute l\'expression `NOT IN` retourne UNKNOWN et ne renvoie AUCUNE ligne ! Préférez `NOT EXISTS`.',
    proTipEn: 'If a NOT IN subquery returns a single NULL, the entire expression evaluates to UNKNOWN. Prefer NOT EXISTS.',
  },
];
