import { GlossaryTerm } from '../../types';

export const CAT7_ADVANCED_OPTIMIZATION_TERMS: GlossaryTerm[] = [
  {
    id: 'aggregation-functions',
    termFr: 'Fonctions d\'agrégation (COUNT, SUM, AVG, MIN, MAX)',
    termEn: 'Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)',
    category: 7,
    categoryNameFr: 'Concepts avancés et Optimisation',
    categoryNameEn: 'Advanced SQL & Optimization',
    shortDefFr: 'Fonctions effectuant un calcul statistique sur un ensemble de lignes pour retourner une unique valeur scalaire récapitulative.',
    shortDefEn: 'Functions computing summary statistics across multiple rows, returning a single scalar value per group.',
    fullExplanationFr: 'Les cinq fonctions standards ANSI sont : `COUNT()` (nombre de lignes ou de valeurs non-nulles), `SUM()` (somme arithmétique), `AVG()` (moyenne arithmétique), `MIN()` (valeur minimale) et `MAX()` (valeur maximale). À l\'exception de `COUNT(*)`, toutes les fonctions d\'agrégation ignorent silencieusement les valeurs `NULL`.',
    fullExplanationEn: 'The core ANSI aggregates summarize datasets. With the notable exception of COUNT(*), all aggregate functions systematically ignore NULL values.',
    codeSnippet: `SELECT 
  COUNT(*) AS total_lignes,
  COUNT(commission) AS lignes_avec_commission, -- Ignore les NULLs
  SUM(salaire) AS masse_salariale,
  ROUND(AVG(salaire), 2) AS salaire_moyen,
  MIN(salaire) AS salaire_plancher,
  MAX(salaire) AS salaire_plafond
FROM employes;`,
    codeSnippetCommentFr: 'Calcul de statistiques complètes et comportement face aux valeurs NULL.',
    codeSnippetCommentEn: 'Computing summary metrics and illustrating NULL handling.',
    dialects: {
      universal: true,
      postgres: 'Supporte la clause `FILTER (WHERE condition)` : `COUNT(*) FILTER (WHERE actif = TRUE) AS actifs`.',
      oracle: 'Propose également `MEDIAN()` et `STATS_MODE()` en standard.',
      sqlServer: 'Supporte `COUNT_BIG()` pour renvoyer un BIGINT si le comptage dépasse 2 milliards.',
      mysql: 'Propose `GROUP_CONCAT()` pour concaténer des chaînes de caractères au sein d\'un groupe.',
    },
    crossReferences: [
      { id: 'group-by', labelFr: 'Clause GROUP BY', labelEn: 'GROUP BY' },
      { id: 'having', labelFr: 'Clause HAVING', labelEn: 'HAVING' },
      { id: 'window-functions', labelFr: 'Fonction de fenêtrage', labelEn: 'Window Functions' },
    ],
    tags: ['Statistiques', 'KPI', 'Calcul', 'Agrégat', 'NULL'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: '`COUNT(*)` compte le nombre absolu de lignes (y compris si toutes les colonnes valent NULL). `COUNT(colonne)` ne compte que les lignes où `colonne IS NOT NULL`.',
    proTipEn: 'COUNT(*) counts total rows; COUNT(column) counts only records where column IS NOT NULL.',
  },
  {
    id: 'subquery',
    termFr: 'Sous-requête (Subquery)',
    termEn: 'Subquery',
    category: 7,
    categoryNameFr: 'Concepts avancés et Optimisation',
    categoryNameEn: 'Advanced SQL & Optimization',
    shortDefFr: 'Requête SELECT imbriquée à l\'intérieur d\'une autre instruction SQL (SELECT, INSERT, UPDATE, DELETE).',
    shortDefEn: 'A nested SELECT statement embedded within an outer SQL statement.',
    fullExplanationFr: 'Une sous-requête peut être : scalaire (retourne 1 seule valeur, utilisable dans le SELECT ou WHERE), à colonnes multiples (utilisable avec `IN`), ou corrélée (fait référence à une colonne de la requête parente et s\'évalue pour chaque ligne candidate).',
    fullExplanationEn: 'Can be scalar (returns single value), multi-row (paired with IN/EXISTS), or correlated (references outer query attributes evaluated row-by-row).',
    codeSnippet: `-- 1. Sous-requête scalaire dans le WHERE (trouver les salaires supérieurs à la moyenne)
SELECT nom, salaire
FROM employes
WHERE salaire > (SELECT AVG(salaire) FROM employes);

-- 2. Sous-requête corrélée avec EXISTS (clients ayant au moins 1 facture impayée)
SELECT c.nom
FROM clients c
WHERE EXISTS (
  SELECT 1 FROM factures f 
  WHERE f.client_id = c.client_id AND f.statut = 'impayee'
);`,
    codeSnippetCommentFr: 'Sous-requête scalaire autonome et sous-requête corrélée avec EXISTS.',
    codeSnippetCommentEn: 'Scalar subquery compared with correlated EXISTS subquery.',
    dialects: {
      universal: true,
      mysql: 'Exige obligatoirement un alias pour les sous-requêtes dans la clause FROM (`FROM (SELECT ...) AS sous_table`).',
      postgres: 'Exige également un alias pour les tables dérivées dans le FROM.',
    },
    crossReferences: [
      { id: 'cte', labelFr: 'CTE (WITH)', labelEn: 'CTE' },
      { id: 'where', labelFr: 'Clause WHERE', labelEn: 'WHERE' },
      { id: 'inner-join', labelFr: 'INNER JOIN', labelEn: 'INNER JOIN' },
    ],
    tags: ['Sous-requête', 'Imbrication', 'EXISTS', 'Scalaire'],
    difficulty: 'intermediate',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Pour vérifier l\'existence d\'une ligne liée, privilégiez `WHERE EXISTS (SELECT 1 ...)` plutôt que `WHERE col IN (SELECT col ...)` : `EXISTS` s\'arrête dès la première correspondance (court-circuit) et est insensible aux valeurs NULL.',
    proTipEn: 'Prefer EXISTS over IN for correlated existence checks: it short-circuits instantly upon the first match and handles NULLs safely.',
  },
  {
    id: 'cte',
    termFr: 'CTE (Common Table Expression - Clause WITH)',
    termEn: 'CTE (Common Table Expression - WITH Clause)',
    category: 7,
    categoryNameFr: 'Concepts avancés et Optimisation',
    categoryNameEn: 'Advanced SQL & Optimization',
    shortDefFr: 'Résultat temporaire nommé, défini au tout début d\'une requête via la clause WITH, facilitant la lisibilité et permettant la récursion.',
    shortDefEn: 'A named temporary result set declared at query start using WITH, vastly enhancing readability and enabling hierarchical recursion.',
    fullExplanationFr: 'Les CTE remplacent avantageusement les sous-requêtes imbriquées complexes en découpant le raisonnement en étapes logiques séquentielles. Les CTE récursives (`WITH RECURSIVE`) permettent d\'explorer des structures hiérarchiques (organigrammes, arbres de catégories, parcours de graphes).',
    fullExplanationEn: 'Replaces deeply nested subqueries with clean, sequential pipelines. Recursive CTEs navigate hierarchies and parent-child organizational trees.',
    codeSnippet: `-- CTE simple pour clarifier un pipeline de données
WITH ventes_par_client AS (
  SELECT 
    client_id,
    SUM(montant) AS total_achats,
    COUNT(id) AS nombre_commandes
  FROM commandes
  GROUP BY client_id
),
clients_fissures AS (
  SELECT client_id, total_achats
  FROM ventes_par_client
  WHERE total_achats > 5000
)
SELECT c.nom, cf.total_achats
FROM clients_fissures cf
JOIN clients c ON c.client_id = cf.client_id;`,
    codeSnippetCommentFr: 'Pipeline analytique lisible avec CTEs chaînées.',
    codeSnippetCommentEn: 'Chained CTE pipeline decomposing analytical calculations.',
    dialects: {
      universal: true,
      postgres: 'Prend en charge `WITH RECURSIVE` ainsi que les clauses d\'optimisation `MATERIALIZED` ou `NOT MATERIALIZED` (Postgres 12+).',
      mysql: 'Supporte les CTEs et `WITH RECURSIVE` depuis MySQL 8.0 (non disponible en MySQL 5.7).',
      sqlServer: 'Supporte les CTEs et les CTE récursives (utilise le mot-clé `WITH` direct sans exiger le mot-clé `RECURSIVE`). Attention : l\'instruction précédant une clause WITH doit impérativement se terminer par un point-virgule (`;`).',
      oracle: 'Supporte la clause WITH (également appelée subquery refactoring) et les CTEs récursives depuis 11gR2.',
    },
    crossReferences: [
      { id: 'subquery', labelFr: 'Sous-requête', labelEn: 'Subquery' },
      { id: 'view', labelFr: 'Vue (View)', labelEn: 'View' },
      { id: 'window-functions', labelFr: 'Fonction de fenêtrage', labelEn: 'Window Functions' },
    ],
    tags: ['CTE', 'WITH', 'Récursion', 'Lisibilité', 'Pipeline'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
    proTipFr: 'En SQL Server, assurez-vous de toujours mettre un point-virgule (`;`) juste avant le mot-clé `WITH`, sous peine d\'une erreur de syntaxe immédiate.',
    proTipEn: 'In SQL Server, always prefix a CTE statement with a semicolon (;WITH ...) to guard against statement delimiter parsing errors.',
  },
  {
    id: 'view',
    termFr: 'Vue (View) et Vue matérialisée',
    termEn: 'View and Materialized View',
    category: 7,
    categoryNameFr: 'Concepts avancés et Optimisation',
    categoryNameEn: 'Advanced SQL & Optimization',
    shortDefFr: 'Table virtuelle définie par une requête SQL sauvegardée. Une vue simple ne stocke aucune donnée physique ; une vue matérialisée persiste les résultats sur disque.',
    shortDefEn: 'A virtual table backed by a stored SQL query. Standard views hold no data; materialized views cache results to disk.',
    fullExplanationFr: 'Une vue standard agit comme une macro : chaque fois qu\'on l\'interroge, le SGBD exécute la requête sous-jacente. Elle permet de simplifier les requêtes complexes, de masquer des colonnes sensibles (sécurité) ou d\'assurer la compatibilité ascendante. Une vue matérialisée stocke physiquement le résultat pour accélérer les calculs analytiques lourds, nécessitant un rafraîchissement périodique (`REFRESH MATERIALIZED VIEW`).',
    fullExplanationEn: 'Standard views abstract complex logic and restrict access. Materialized views persist aggregated results to disk, refreshed periodically for analytics.',
    codeSnippet: `-- 1. Création d'une vue standard (aucun stockage disque supplémentaire)
CREATE VIEW vue_clients_actifs AS
SELECT client_id, nom, email, ville
FROM clients
WHERE statut = 'actif' AND suspendu = FALSE;

-- Utilisation transparente comme une table
SELECT * FROM vue_clients_actifs WHERE ville = 'Paris';

-- 2. Création d'une vue matérialisée (Postgres / Oracle)
CREATE MATERIALIZED VIEW mv_ventes_mensuelles AS
SELECT 
  DATE_TRUNC('month', date_vente) AS mois,
  SUM(montant) AS ca_total
FROM ventes
GROUP BY 1;`,
    codeSnippetCommentFr: 'Déclaration d\'une vue virtuelle et d\'une vue matérialisée persistée.',
    codeSnippetCommentEn: 'Creating standard virtual view and cached materialized view.',
    dialects: {
      universal: false,
      postgres: 'Supporte `CREATE VIEW` et `CREATE MATERIALIZED VIEW ... REFRESH MATERIALIZED VIEW CONCURRENTLY`.',
      oracle: 'Supporte les vues standard et les vues matérialisées (`FAST REFRESH` via Materialized View Logs).',
      sqlServer: 'Utilise la notion de vues indexées (`CREATE VIEW ... WITH SCHEMABINDING` suivi de `CREATE UNIQUE CLUSTERED INDEX`).',
      mysql: 'MySQL supporte `CREATE VIEW`. Il NE supporte PAS nativement les vues matérialisées (doit être simulé via des tables de cache périodiques ou des triggers).',
    },
    crossReferences: [
      { id: 'table', labelFr: 'Table', labelEn: 'Table' },
      { id: 'cte', labelFr: 'CTE (WITH)', labelEn: 'CTE' },
      { id: 'index', labelFr: 'Index', labelEn: 'Index' },
    ],
    tags: ['Vue', 'Vue matérialisée', 'Sécurité', 'Abstraction', 'Cache'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
    proTipFr: 'Utilisez les vues comme couche d\'abstraction (Semantic Layer) pour vos outils de Business Intelligence (Power BI, Tableau) : cela isole vos tableaux de bord des changements de structure interne des tables.',
    proTipEn: 'Deploy views as an abstraction layer for BI tools to protect reports from underlying table schema refactoring.',
  },
  {
    id: 'index',
    termFr: 'Index (B-Tree, Clustered, Non-Clustered)',
    termEn: 'Index (B-Tree, Clustered, Non-Clustered)',
    category: 7,
    categoryNameFr: 'Concepts avancés et Optimisation',
    categoryNameEn: 'Advanced SQL & Optimization',
    shortDefFr: 'Structure de données auxiliaire (généralement en arbre B-Tree) permettant d\'accélérer considérablement la recherche et le tri des lignes.',
    shortDefEn: 'An auxiliary data structure (typically balanced B-Tree) that drastically accelerates search, range scanning, and ordering.',
    fullExplanationFr: 'Fonctionne comme l\'index alphabétique à la fin d\'un dictionnaire. Au lieu de scanner séquentiellement chaque page de données (Full Table Scan), le moteur parcourt l\'arbre en $O(\\log N)$. Compromis fondamental : les index accélèrent les lectures (`SELECT`), mais ralentissent les écritures (`INSERT`, `UPDATE`, `DELETE`) car l\'index doit être mis à jour, et consomment de l\'espace disque supplémentaire.',
    fullExplanationEn: 'Replaces O(N) full table scans with O(log N) tree traversals. Trade-off: accelerates reads while increasing disk footprint and write overhead.',
    codeSnippet: `-- Index B-Tree simple sur une colonne fréquemment filtrée
CREATE INDEX idx_clients_email ON clients(email);

-- Index composite (l'ordre des colonnes est crucial : règle du préfixe le plus sélectif)
CREATE INDEX idx_commandes_client_date ON commandes(client_id, date_commande);

-- Index unique
CREATE UNIQUE INDEX idx_produits_code_barre ON produits(code_barre);`,
    codeSnippetCommentFr: 'Création d\'un index simple, composite et unique.',
    codeSnippetCommentEn: 'Creating single-column, multi-column composite, and unique indexes.',
    dialects: {
      universal: true,
      mysql: 'Sous InnoDB, chaque table possède un index clusterisé (la Clé Primaire) où les lignes de données sont physiquement stockées dans les feuilles de l\'arbre. Les autres index sont secondaires et stockent la clé primaire comme pointeur.',
      sqlServer: 'Distingue explicitement `CLUSTERED INDEX` (1 seul par table, réorganise physiquement les données) et `NONCLUSTERED INDEX` (jusqu\'à 999 par table). Supporte les index filtrés (`WHERE col IS NOT NULL`) et les colonnes incluses (`INCLUDE (col)`).',
      postgres: 'Propose plusieurs moteurs d\'indexation : B-Tree (défaut), Hash, GiST (géospatial/PostGIS), GIN (texte intégral, tableaux, JSONB), BRIN (données ordonnées massives, logs).',
      oracle: 'Supporte les index B-Tree, Bitmap (très performants en Data Warehouse sur faible cardinalité), et les index basés sur des fonctions (`CREATE INDEX ... ON emp(UPPER(nom))`).',
    },
    crossReferences: [
      { id: 'primary-key', labelFr: 'Clé primaire (PK)', labelEn: 'Primary Key' },
      { id: 'where', labelFr: 'Clause WHERE', labelEn: 'WHERE' },
      { id: 'order-by', labelFr: 'Clause ORDER BY', labelEn: 'ORDER BY' },
    ],
    tags: ['Index', 'B-Tree', 'Performance', 'Optimisation', 'Clustered'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
    proTipFr: 'Règle d\'index composite : si vous créez un index sur `(A, B)`, il accélère les requêtes filtrant sur `A` ou sur `(A et B)`, mais PAS les requêtes filtrant uniquement sur `B` (règle du préfixe gauche).',
    proTipEn: 'Leftmost prefix rule: a composite index on (A, B) accelerates queries on A or (A, B), but cannot serve queries filtering only on B.',
  },
  {
    id: 'stored-procedure',
    termFr: 'Procédure stockée (Stored Procedure)',
    termEn: 'Stored Procedure',
    category: 7,
    categoryNameFr: 'Concepts avancés et Optimisation',
    categoryNameEn: 'Advanced SQL & Optimization',
    shortDefFr: 'Programme composé d\'instructions SQL et de structures de contrôle procédurales (boucles, conditions, transactions), compilé et stocké côté serveur.',
    shortDefEn: 'A precompiled batch of procedural SQL statements with control flow (loops, conditionals, transactions) stored on the database server.',
    fullExplanationFr: 'Exécutée directement au plus près des données, une procédure stockée réduit le trafic réseau en éliminant les allers-retours avec l\'application client. Elle permet d\'encapsuler des règles métier complexes, de centraliser la sécurité (les utilisateurs exécutent la procédure sans accès direct aux tables), et peut accepter des paramètres entrants (`IN`) et renvoyer des paramètres sortants (`OUT`).',
    fullExplanationEn: 'Executes within the engine, minimizing network latency for multi-step processes. Enforces security barriers and procedural transactional logic.',
    codeSnippet: `-- Exemple standard de procédure stockée avec paramètres
CREATE PROCEDURE transferer_fonds(
  IN p_source_id INT,
  IN p_cible_id INT,
  IN p_montant DECIMAL(10,2)
)
BEGIN
  -- Début de la logique transactionnelle
  UPDATE comptes SET solde = solde - p_montant WHERE id = p_source_id;
  UPDATE comptes SET solde = solde + p_montant WHERE id = p_cible_id;
END;

-- Exécution depuis le client :
-- CALL transferer_fonds(10, 20, 150.00); (MySQL / Postgres 11+)
-- EXEC transferer_fonds 10, 20, 150.00; (SQL Server)`,
    codeSnippetCommentFr: 'Procédure transactionnelle sécurisée exécutée côté serveur.',
    codeSnippetCommentEn: 'Server-side transactional stored procedure with parameters.',
    dialects: {
      universal: false,
      oracle: 'Langage PL/SQL riche avec packages (`CREATE OR REPLACE PROCEDURE ...`). Appel : `EXEC nom_proc;`',
      sqlServer: 'Dialecte T-SQL (`CREATE PROCEDURE ... AS BEGIN ... END`). Appel : `EXECUTE nom_proc;`',
      postgres: 'Historiquement utilisait des fonctions `CREATE FUNCTION ... RETURNS void`. Les véritables procédures `CREATE PROCEDURE` avec contrôle transactionnel autonome (`COMMIT`/`ROLLBACK` internes) ont été introduites avec PostgreSQL 11.',
      mysql: 'Syntaxe `CREATE PROCEDURE ... BEGIN ... END` avec commande `DELIMITER //` requise dans les consoles clients.',
    },
    crossReferences: [
      { id: 'trigger', labelFr: 'Déclencheur (Trigger)', labelEn: 'Trigger' },
      { id: 'transaction', labelFr: 'Transaction', labelEn: 'Transaction' },
      { id: 'tcl-concept', labelFr: 'TCL', labelEn: 'TCL' },
    ],
    tags: ['Procédure', 'PL/SQL', 'T-SQL', 'Encapsulation', 'Sécurité'],
    difficulty: 'advanced',
    audience: ['developer'],
    proTipFr: 'Privilégiez les procédures stockées pour les traitements batch nocturnes lourds à forte densité de données, mais évitez d\'y disséminer de la logique de présentation d\'interface.',
    proTipEn: 'Leverage stored procedures for batch operations and heavy data reconciliation to cut network latency.',
  },
  {
    id: 'trigger',
    termFr: 'Déclencheur (Trigger)',
    termEn: 'Trigger',
    category: 7,
    categoryNameFr: 'Concepts avancés et Optimisation',
    categoryNameEn: 'Advanced SQL & Optimization',
    shortDefFr: 'Action procédurale exécutée automatiquement par le SGBD en réaction à un événement DML précis (INSERT, UPDATE ou DELETE) sur une table.',
    shortDefEn: 'A specialized stored routine automatically invoked by the DBMS in response to a DML event (INSERT, UPDATE, DELETE) on a table.',
    fullExplanationFr: 'Les déclencheurs permettent d\'automatiser la tenue de journaux d\'audit immuables, de synchroniser des données dénormalisées, ou de bloquer des opérations non conformes. Ils peuvent s\'exécuter avant l\'opération (`BEFORE`), après (`AFTER`), ou à la place de celle-ci (`INSTEAD OF` sur les vues). Ils ont accès aux pseudo-lignes `NEW` (nouvelles valeurs) et `OLD` (anciennes valeurs).',
    fullExplanationEn: 'Triggers automate audit logging and data synchronization. Operating as BEFORE, AFTER, or INSTEAD OF events, accessing OLD and NEW pseudo-records.',
    codeSnippet: `-- Exemple PostgreSQL / MySQL de trigger d'audit
CREATE TRIGGER trg_audit_modifications_employes
AFTER UPDATE ON employes
FOR EACH ROW
BEGIN
  IF OLD.salaire <> NEW.salaire THEN
    INSERT INTO audit_salaires (employe_id, ancien_salaire, nouveau_salaire, modifie_le)
    VALUES (OLD.id, OLD.salaire, NEW.salaire, CURRENT_TIMESTAMP);
  END IF;
END;`,
    codeSnippetCommentFr: 'Capture automatique et horodatée de tout changement de salaire.',
    codeSnippetCommentEn: 'Automatic audit trail capturing salary mutations via BEFORE/AFTER pseudo-records.',
    dialects: {
      universal: false,
      postgres: 'PostgreSQL exige de séparer la fonction de trigger (`CREATE FUNCTION ... RETURNS trigger`) de l\'attachement du déclencheur (`CREATE TRIGGER ... EXECUTE FUNCTION ...`).',
      oracle: 'Supporte `BEFORE`, `AFTER`, et `INSTEAD OF` au niveau ligne (`FOR EACH ROW`) ou instruction (`FOR EACH STATEMENT`). Attention à l\'erreur classique de table en mutation (`ORA-04091`).',
      sqlServer: 'Dans T-SQL, les déclencheurs s\'exécutent toujours au niveau de l\'instruction et utilisent les pseudo-tables de session `inserted` et `deleted`.',
      mysql: 'Supporte `BEFORE/AFTER INSERT/UPDATE/DELETE FOR EACH ROW`. Ne supporte pas les triggers au niveau statement.',
    },
    crossReferences: [
      { id: 'stored-procedure', labelFr: 'Procédure stockée', labelEn: 'Stored Procedure' },
      { id: 'update', labelFr: 'UPDATE', labelEn: 'UPDATE' },
    ],
    tags: ['Trigger', 'Audit', 'Automatisation', 'Événement'],
    difficulty: 'advanced',
    audience: ['developer'],
    proTipFr: 'Utilisez les triggers avec parcimonie : étant exécutés de manière invisible, des cascades complexes de triggers peuvent ralentir les écritures et rendre le débogage extrêmement ardu.',
    proTipEn: 'Use triggers judiciously: hidden recursive trigger logic can severely degrade write throughput and obscure failure tracing.',
  },
  {
    id: 'window-functions',
    termFr: 'Fonction de fenêtrage (Window Function - Clause OVER)',
    termEn: 'Window Function (OVER Clause)',
    category: 7,
    categoryNameFr: 'Concepts avancés et Optimisation',
    categoryNameEn: 'Advanced SQL & Optimization',
    shortDefFr: 'Fonction effectuant un calcul analytique sur un ensemble de lignes liées à la ligne actuelle, sans réduire les lignes en un groupe unique comme le ferait GROUP BY.',
    shortDefEn: 'Performs analytical calculations across a partition of rows related to the current row, without collapsing rows into a single summary record.',
    fullExplanationFr: 'Révolution du SQL moderne (standard ANSI SQL:2003). Grâce à la clause `OVER (PARTITION BY ... ORDER BY ...)`, chaque ligne conserve son identité tout en accédant aux totaux du groupe, aux classements (`ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`), aux décalages (`LAG()`, `LEAD()`) et aux moyennes mobiles.',
    fullExplanationEn: 'Standardized in ANSI SQL:2003. Evaluates ranking, running totals, and moving averages via OVER (PARTITION BY ... ORDER BY ...) while retaining raw row granularity.',
    codeSnippet: `SELECT 
  nom,
  departement,
  salaire,
  -- 1. Rang du salaire au sein de son département
  DENSE_RANK() OVER (
    PARTITION BY departement 
    ORDER BY salaire DESC
  ) AS rang_departement,
  
  -- 2. Salaire du collègue immédiatement mieux payé (décalage)
  LAG(salaire, 1) OVER (
    PARTITION BY departement 
    ORDER BY salaire ASC
  ) AS salaire_precedent,
  
  -- 3. Total cumulé progressif (Running Total)
  SUM(salaire) OVER (
    PARTITION BY departement 
    ORDER BY date_embauche
  ) AS cumul_salarial
FROM employes;`,
    codeSnippetCommentFr: 'Démonstration de classement, décalage (LAG) et cumul progressif.',
    codeSnippetCommentEn: 'Computing departmental ranks, lag lookups, and running totals.',
    dialects: {
      universal: true,
      postgres: 'Prise en charge complète depuis 8.4 avec clauses de cadrage de fenêtre (`ROWS BETWEEN ...`).',
      mysql: 'Intégré depuis MySQL 8.0 (non disponible en MySQL 5.7).',
      oracle: 'Support pionnier historique très complet dès Oracle 8i.',
      sqlServer: 'Support complet étendu depuis SQL Server 2012.',
    },
    crossReferences: [
      { id: 'group-by', labelFr: 'Clause GROUP BY', labelEn: 'GROUP BY' },
      { id: 'aggregation-functions', labelFr: 'Fonctions d\'agrégation', labelEn: 'Aggregate Functions' },
      { id: 'order-by', labelFr: 'Clause ORDER BY', labelEn: 'ORDER BY' },
    ],
    tags: ['Window Function', 'OVER', 'PARTITION BY', 'DENSE_RANK', 'LAG/LEAD', 'Analytique'],
    difficulty: 'advanced',
    audience: ['developer', 'data_analyst'],
    proTipFr: 'Pour trouver les $N$ premiers éléments par catégorie (ex: les 3 meilleurs vendeurs de chaque région), utilisez une CTE combinant `ROW_NUMBER() OVER (PARTITION BY region ORDER BY ventes DESC)` puis filtrez `WHERE rang <= 3`.',
    proTipEn: 'Use ROW_NUMBER() in a CTE to solve Top-N-per-group analytics: `WHERE rank <= N`.',
  },
];
