import { GlossaryTerm } from '../../types';

export const CAT4_SQL_COMMANDS_TERMS: GlossaryTerm[] = [
  // --- SOUS-LANGAGES GLOBAUX ---
  {
    id: 'ddl-concept',
    termFr: 'DDL (Data Definition Language)',
    termEn: 'DDL (Data Definition Language)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Sous-ensemble du SQL dédié à la création, la modification et la suppression de la structure des objets de schéma (tables, index, vues, etc.).',
    shortDefEn: 'The SQL subset responsible for defining, altering, and dropping database schema objects (tables, indexes, views).',
    fullExplanationFr: 'Les commandes DDL modifient le dictionnaire de données et le catalogue système. Dans la plupart des moteurs traditionnels (Oracle, MySQL), le DDL provoque un commit implicite immédiat de la transaction en cours, alors que PostgreSQL permet d\'exécuter du DDL au sein d\'une transaction annulable (`ROLLBACK`).',
    fullExplanationEn: 'DDL commands alter catalog metadata. In Oracle and MySQL, DDL causes an implicit COMMIT, whereas PostgreSQL supports transactional DDL rollbacks.',
    codeSnippet: `-- Exemples de commandes DDL
CREATE TABLE produits (id INT PRIMARY KEY, nom VARCHAR(50));
ALTER TABLE produits ADD prix DECIMAL(10,2);
DROP TABLE produits;`,
    codeSnippetCommentFr: 'Cycle de vie structurel DDL : création, altération, suppression.',
    codeSnippetCommentEn: 'Structural DDL lifecycle: create, modify, and drop objects.',
    dialects: {
      universal: true,
      postgres: 'PostgreSQL supporte le DDL transactionnel (ex: BEGIN; CREATE TABLE t(); ROLLBACK; annule la création de la table !).',
      oracle: 'En Oracle, toute commande DDL effectue un `COMMIT` automatique avant et après son exécution.',
      mysql: 'En MySQL, la majorité des DDL committent implicitement la transaction active.',
      sqlServer: 'SQL Server supporte le DDL transactionnel au sein de transactions explicites.',
    },
    crossReferences: [
      { id: 'create', labelFr: 'CREATE', labelEn: 'CREATE' },
      { id: 'alter', labelFr: 'ALTER', labelEn: 'ALTER' },
      { id: 'drop', labelFr: 'DROP', labelEn: 'DROP' },
      { id: 'truncate', labelFr: 'TRUNCATE', labelEn: 'TRUNCATE' },
    ],
    tags: ['DDL', 'Schéma', 'Métadonnées', 'Structure'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
  },
  {
    id: 'create',
    termFr: 'CREATE (DDL)',
    termEn: 'CREATE (DDL)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande DDL créant un nouvel objet de base de données : table, vue, index, schéma, fonction, procédure ou déclencheur.',
    shortDefEn: 'DDL statement creating a new database object (table, view, index, schema, sequence, trigger).',
    fullExplanationFr: 'Permet d\'instancier une nouvelle structure dans le catalogue de métadonnées. Accepte couramment la clause de protection `IF NOT EXISTS` pour éviter les erreurs lors des scripts d\'initialisation idempotents.',
    fullExplanationEn: 'Instantiates new structures in system metadata. Frequently paired with IF NOT EXISTS in migration scripts.',
    codeSnippet: `CREATE TABLE IF NOT EXISTS categories (
  categorie_id INT PRIMARY KEY,
  libelle VARCHAR(50) NOT NULL
);

CREATE INDEX idx_categories_libelle ON categories(libelle);`,
    codeSnippetCommentFr: 'Création sécurisée d\'une table et d\'un index secondaire.',
    codeSnippetCommentEn: 'Safe idempotent table and index creation.',
    dialects: {
      universal: true,
      postgres: 'Supporte `CREATE TABLE IF NOT EXISTS`.',
      mysql: 'Supporte `CREATE TABLE IF NOT EXISTS`.',
      sqlServer: 'Historiquement sans `IF NOT EXISTS`, utilise `IF OBJECT_ID(\'categories\', \'U\') IS NULL CREATE TABLE ...` ou `CREATE OR ALTER`.',
      oracle: 'Supporte `CREATE TABLE IF NOT EXISTS` depuis Oracle 23c.',
    },
    crossReferences: [
      { id: 'ddl-concept', labelFr: 'DDL', labelEn: 'DDL' },
      { id: 'table', labelFr: 'Table', labelEn: 'Table' },
    ],
    tags: ['DDL', 'Création', 'Schéma'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
  },
  {
    id: 'alter',
    termFr: 'ALTER (DDL)',
    termEn: 'ALTER (DDL)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande DDL modifiant la structure d\'un objet existant (ajouter/supprimer une colonne, renommer, poser une contrainte).',
    shortDefEn: 'DDL statement modifying an existing object structure (adding/dropping columns, renaming, attaching constraints).',
    fullExplanationFr: 'Permet de faire évoluer un schéma en production. Selon les moteurs et l\'algorithme utilisé (`ONLINE DDL`, `INPLACE`), l\'opération peut verrouiller ou non la table.',
    fullExplanationEn: 'Evolves production schema definitions. Depending on the engine and storage engine lock algorithm, ALTER can run online or require metadata locks.',
    codeSnippet: `-- Ajout d'une colonne avec contrainte
ALTER TABLE utilisateurs ADD telephone VARCHAR(20);

-- Ajout d'une contrainte de clé étrangère
ALTER TABLE commandes 
  ADD CONSTRAINT fk_cmd_usr FOREIGN KEY (client_id) REFERENCES utilisateurs(id);

-- Suppression d'une colonne
ALTER TABLE utilisateurs DROP COLUMN telephone;`,
    codeSnippetCommentFr: 'Ajout de colonne, contrainte et suppression de colonne.',
    codeSnippetCommentEn: 'Adding columns, attaching constraints, and column removal.',
    dialects: {
      universal: true,
      mysql: 'Permet `ALGORITHM=INPLACE, LOCK=NONE` pour les modifications en ligne.',
      postgres: 'L\'ajout d\'une colonne avec valeur par défaut non volatile est instantané depuis PostgreSQL 11.',
      oracle: 'Utilise `ALTER TABLE nom MODIFY (...)` pour modifier des colonnes existantes.',
    },
    crossReferences: [
      { id: 'ddl-concept', labelFr: 'DDL', labelEn: 'DDL' },
      { id: 'table', labelFr: 'Table', labelEn: 'Table' },
    ],
    tags: ['DDL', 'Modification', 'Migration'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
  },
  {
    id: 'drop',
    termFr: 'DROP (DDL)',
    termEn: 'DROP (DDL)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande DDL supprimant définitivement un objet de base de données (table, vue, index) ainsi que toutes ses données et dépendances.',
    shortDefEn: 'DDL statement permanently deleting a database object, releasing storage and removing all associated data.',
    fullExplanationFr: 'La commande `DROP` est irréversible (sauf corbeille spéciale comme la Flashback RecycleBin sous Oracle). Si d\'autres tables référencent l\'objet via des clés étrangères, la clause `CASCADE` est parfois requise pour forcer la suppression.',
    fullExplanationEn: 'DROP is irreversible without point-in-time backup recovery or recycle bins. The CASCADE clause drops downstream dependent objects.',
    codeSnippet: `-- Suppression avec garde-fou
DROP TABLE IF EXISTS logs_temporaires;

-- Suppression en cascade des contraintes dépendantes
DROP TABLE clients CASCADE; -- Syntaxe Postgres/Oracle`,
    codeSnippetCommentFr: 'Suppression conditionnelle et suppression avec retraits des dépendances.',
    codeSnippetCommentEn: 'Safe deletion with existence checks and cascade options.',
    dialects: {
      universal: true,
      oracle: 'Oracle déplace l\'objet dans la corbeille `RECYCLEBIN` (récupérable via `FLASHBACK TABLE ... TO BEFORE DROP`), sauf si la clause `PURGE` est ajoutée : `DROP TABLE t PURGE;`',
      postgres: 'Prend en charge `DROP TABLE ... CASCADE` ou `RESTRICT`.',
      sqlServer: 'Prend en charge `DROP TABLE IF EXISTS ...` depuis SQL Server 2016.',
    },
    crossReferences: [
      { id: 'ddl-concept', labelFr: 'DDL', labelEn: 'DDL' },
      { id: 'truncate', labelFr: 'TRUNCATE', labelEn: 'TRUNCATE' },
      { id: 'delete', labelFr: 'DELETE', labelEn: 'DELETE' },
    ],
    tags: ['DDL', 'Destruction', 'Suppression définitive'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'En production, préférez toujours renommer une table avant de la dropper (`ALTER TABLE t RENAME TO t_archive_old`) pour vérifier qu\'aucun service ne tente encore de l\'interroger.',
    proTipEn: 'In production, rename before dropping to confirm no active batch or API service still references the object.',
  },
  {
    id: 'truncate',
    termFr: 'TRUNCATE (DDL)',
    termEn: 'TRUNCATE (DDL)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande DDL vidant ultra-rapidement l\'intégralité du contenu d\'une table tout en conservant intacte sa structure et ses index.',
    shortDefEn: 'A fast DDL statement that deallocates all rows from a table while leaving structure and column definitions intact.',
    fullExplanationFr: 'Beaucoup plus rapide qu\'un `DELETE FROM table;` sans clause WHERE, car au lieu de scanner et supprimer les lignes une à une dans les journaux transactionnels, `TRUNCATE` désalloue directement les pages de données physiques et réinitialise les compteurs d\'auto-incrémentation.',
    fullExplanationEn: 'Significantly faster than DELETE because it deallocates data pages in bulk rather than writing individual row deletion events into undo/redo logs.',
    codeSnippet: `-- Vider instantanément une table de cache/staging
TRUNCATE TABLE staging_imports;

-- En PostgreSQL, permet de redémarrer les séquences
TRUNCATE TABLE logs RESTART IDENTITY CASCADE;`,
    codeSnippetCommentFr: 'Purge instantanée d\'une table avec remise à zéro des identifiants.',
    codeSnippetCommentEn: 'Instant table data deallocation and identity sequence reset.',
    dialects: {
      universal: true,
      postgres: 'Supporte `RESTART IDENTITY` ou `CONTINUE IDENTITY`, ainsi que `CASCADE`. Transactionnel sous Postgres !',
      mysql: 'Non annulable. Réinitialise le compteur `AUTO_INCREMENT` à 1.',
      sqlServer: 'Ne peut pas être exécuté sur une table référencée par une contrainte de clé étrangère (même si la table parente est vide).',
      oracle: 'Classé comme DDL : provoque un `COMMIT` implicite immédiat.',
    },
    crossReferences: [
      { id: 'delete', labelFr: 'DELETE (DML)', labelEn: 'DELETE' },
      { id: 'ddl-concept', labelFr: 'DDL', labelEn: 'DDL' },
    ],
    tags: ['Purge', 'Performance', 'DDL', 'Désallocation'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
    proTipFr: 'Pour vider des tables massives de logs ou d\'imports sans saturer le journal de transactions (Redo Log / WAL), privilégiez toujours TRUNCATE plutôt que DELETE.',
    proTipEn: 'Use TRUNCATE instead of DELETE for massive staging tables to avoid overflowing transaction logs and lock escalation.',
  },

  // --- DML (DATA MANIPULATION LANGUAGE) ---
  {
    id: 'dml-concept',
    termFr: 'DML (Data Manipulation Language)',
    termEn: 'DML (Data Manipulation Language)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Sous-ensemble du SQL permettant d\'interroger, d\'insérer, de modifier et de supprimer les données contenues dans les tables.',
    shortDefEn: 'The SQL subset used for querying, inserting, updating, and deleting rows in relational tables.',
    fullExplanationFr: 'Le DML regroupe les quatre verbes indispensables du SQL opérationnel : SELECT (lecture/interrogation), INSERT (création), UPDATE (modification) et DELETE (suppression). Les instructions DML s\'exécutent sous contrôle transactionnel (annulables par ROLLBACK avant validation par COMMIT).',
    fullExplanationEn: 'Encompasses the primary CRUD verbs: SELECT, INSERT, UPDATE, DELETE, and MERGE, running under transactional ACID protection.',
    codeSnippet: `-- Sélection (Read)
SELECT * FROM clients WHERE actif = TRUE;

-- Insertion (Create)
INSERT INTO clients (nom) VALUES ('Ada');

-- Mise à jour (Update)
UPDATE clients SET actif = FALSE WHERE id = 1;

-- Suppression (Delete)
DELETE FROM clients WHERE id = 1;`,
    codeSnippetCommentFr: 'Les 4 verbes fondamentaux du DML.',
    codeSnippetCommentEn: 'The 4 fundamental DML CRUD operations.',
    dialects: {
      universal: true,
      oracle: 'Oracle intègre également la commande `MERGE` (Upsert standardisé).',
    },
    crossReferences: [
      { id: 'select', labelFr: 'SELECT', labelEn: 'SELECT' },
      { id: 'insert', labelFr: 'INSERT', labelEn: 'INSERT' },
      { id: 'update', labelFr: 'UPDATE', labelEn: 'UPDATE' },
      { id: 'delete', labelFr: 'DELETE', labelEn: 'DELETE' },
    ],
    tags: ['DML', 'CRUD', 'Manipulation', 'Transactions'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
  },
  {
    id: 'select',
    termFr: 'SELECT (DML / DQL)',
    termEn: 'SELECT (DML / DQL)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande maîtresse du SQL permettant d\'extraire et d\'analyser des données à partir d\'une ou plusieurs tables ou vues.',
    shortDefEn: 'The primary SQL statement used to retrieve, project, filter, and transform data from tables and views.',
    fullExplanationFr: 'Bien qu\'écrite dans l\'ordre `SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY`, son ordre d\'évaluation logique interne est : FROM & JOIN $\to$ WHERE $\to$ GROUP BY $\to$ HAVING $\to$ SELECT $\to$ DISTINCT $\to$ ORDER BY $\to$ LIMIT.',
    fullExplanationEn: 'Logical query evaluation pipeline: FROM & JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT/OFFSET.',
    codeSnippet: `SELECT 
  pays, 
  COUNT(*) AS total_clients,
  AVG(chiffre_affaires) AS ca_moyen
FROM clients
WHERE statut = 'actif'
GROUP BY pays
HAVING COUNT(*) >= 5
ORDER BY total_clients DESC
LIMIT 10;`,
    codeSnippetCommentFr: 'Requête d\'agrégation complète illustrant les principales clauses SQL.',
    codeSnippetCommentEn: 'Complete aggregation query demonstrating core SQL clauses.',
    dialects: {
      universal: true,
      sqlServer: 'Utilise `TOP (n)` au lieu de `LIMIT n`.',
      oracle: 'Historiquement utilisait `ROWNUM` ; supporte la norme standard `FETCH FIRST n ROWS ONLY` depuis Oracle 12c.',
    },
    crossReferences: [
      { id: 'where', labelFr: 'WHERE', labelEn: 'WHERE' },
      { id: 'group-by', labelFr: 'GROUP BY', labelEn: 'GROUP BY' },
      { id: 'having', labelFr: 'HAVING', labelEn: 'HAVING' },
    ],
    tags: ['Extraction', 'Requête', 'Projection', 'DQL'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Évitez `SELECT *` en production : projetez uniquement les colonnes indispensables pour économiser la bande passante et permettre l\'utilisation d\'index couvrants (Covering Indexes).',
    proTipEn: 'Avoid SELECT * in production: project only required columns to reduce network serialization and unlock covering index scans.',
  },
  {
    id: 'insert',
    termFr: 'INSERT (DML)',
    termEn: 'INSERT (DML)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande DML ajoutant une ou plusieurs nouvelles lignes (enregistrements) dans une table existante.',
    shortDefEn: 'DML statement creating and appending one or more new rows into an existing table.',
    fullExplanationFr: 'Permet l\'insertion unitaire, l\'insertion groupée multi-lignes (`INSERT INTO ... VALUES (...), (...)`), ou l\'insertion basée sur le résultat d\'une sous-requête (`INSERT INTO ... SELECT ...`).',
    fullExplanationEn: 'Supports single-row inserts, multi-value batch inserts, and insert-as-select patterns from secondary queries.',
    codeSnippet: `-- Insertion multi-lignes en une seule requête (Batch Insert)
INSERT INTO devises (code_iso, symbole, pays_origine)
VALUES 
  ('EUR', '€', 'FR'),
  ('USD', '$', 'US'),
  ('GBP', '£', 'GB');

-- Insertion basée sur une requête SELECT
INSERT INTO clients_vip (client_id, total_depenses)
SELECT client_id, SUM(montant)
FROM commandes
GROUP BY client_id
HAVING SUM(montant) > 10000;`,
    codeSnippetCommentFr: 'Insertion par lot (batch) et insertion directe depuis un SELECT.',
    codeSnippetCommentEn: 'Batch multi-row insertion and insert-from-select pipeline.',
    dialects: {
      universal: true,
      postgres: 'Prend en charge `ON CONFLICT DO NOTHING` ou `ON CONFLICT (id) DO UPDATE SET ...` (Upsert natif).',
      mysql: 'Prend en charge `INSERT ... ON DUPLICATE KEY UPDATE` ou `INSERT IGNORE`.',
      sqlServer: 'Prend en charge `OUTPUT inserted.*` pour récupérer les clés générées.',
      oracle: 'Utilise la syntaxe `INSERT ALL` pour insérer dans plusieurs tables simultanément.',
    },
    crossReferences: [
      { id: 'dml-concept', labelFr: 'DML', labelEn: 'DML' },
      { id: 'ligne', labelFr: 'Ligne (Tuple)', labelEn: 'Row (Tuple)' },
      { id: 'default-constraint', labelFr: 'Contrainte DEFAULT', labelEn: 'DEFAULT' },
    ],
    tags: ['Insertion', 'Batch', 'Upsert', 'DML'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Pour insérer des milliers de lignes, regroupez-les toujours en un seul `INSERT ... VALUES (...), (...)` multi-lignes pour minimiser les allers-retours réseau et les commits disque.',
    proTipEn: 'Batch multiple rows into single multi-value INSERT statements to minimize roundtrips and WAL fsync locks.',
  },
  {
    id: 'update',
    termFr: 'UPDATE (DML)',
    termEn: 'UPDATE (DML)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande DML modifiant les valeurs existantes d\'une ou plusieurs colonnes dans les lignes ciblées par une condition WHERE.',
    shortDefEn: 'DML statement altering values in existing rows matching a specified WHERE condition.',
    fullExplanationFr: 'L\'instruction `UPDATE` applique de nouvelles valeurs calculées ou statiques. Si la clause `WHERE` est omise, TOUTES les lignes de la table sont irrémédiablement mises à jour.',
    fullExplanationEn: 'Applies modified values to targeted columns. Omitting the WHERE clause updates EVERY row in the entire table.',
    codeSnippet: `-- Mise à jour ciblée avec calcul
UPDATE employes
SET 
  salaire = salaire * 1.05,
  date_derniere_augmentation = CURRENT_DATE
WHERE departement = 'R&D' AND performance >= 4;`,
    codeSnippetCommentFr: 'Augmentation de 5% ciblée sur un département et une condition métier.',
    codeSnippetCommentEn: 'Targeted in-place calculation updating salary and review dates.',
    dialects: {
      universal: true,
      mysql: 'Supporte `UPDATE ... ORDER BY ... LIMIT n` pour limiter le nombre de lignes mises à jour.',
      sqlServer: 'Supporte la clause `FROM` avec jointures directes dans l\'UPDATE.',
      postgres: 'Prend en charge `UPDATE ... FROM autre_table` et la clause `RETURNING`.',
      oracle: 'Exige souvent une sous-requête corrélée ou l\'utilisation de `MERGE` pour les mises à jour basées sur jointure.',
    },
    crossReferences: [
      { id: 'dml-concept', labelFr: 'DML', labelEn: 'DML' },
      { id: 'where', labelFr: 'WHERE', labelEn: 'WHERE' },
      { id: 'transaction', labelFr: 'Transaction', labelEn: 'Transaction' },
    ],
    tags: ['Modification', 'DML', 'Mise à jour', 'Calcul'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Règle d\'or du développeur : écrivez toujours votre clause `WHERE` avant d\'écrire la clause `UPDATE ... SET`, ou testez-la d\'abord avec un `SELECT` !',
    proTipEn: 'Always draft and test your WHERE clause as a SELECT before converting it to an UPDATE statement.',
  },
  {
    id: 'delete',
    termFr: 'DELETE (DML)',
    termEn: 'DELETE (DML)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande DML supprimant une ou plusieurs lignes spécifiques d\'une table selon un critère de filtrage WHERE.',
    shortDefEn: 'DML statement removing targeted rows matching a WHERE filter from a table.',
    fullExplanationFr: 'Contrairement à `TRUNCATE`, `DELETE` journalise chaque ligne supprimée dans les journaux d\'annulation (Undo/WAL) et déclenche les triggers `AFTER DELETE`. Si la clause `WHERE` est omise, toute la table est vidée ligne par ligne.',
    fullExplanationEn: 'Unlike TRUNCATE, DELETE logs individual row removals, enforces foreign key verification, and fires AFTER DELETE triggers.',
    codeSnippet: `-- Suppression ciblée de sessions expirées
DELETE FROM sessions_utilisateurs
WHERE date_expiration < CURRENT_TIMESTAMP - INTERVAL '30 days';`,
    codeSnippetCommentFr: 'Purge ciblée de sessions expirées depuis plus de 30 jours.',
    codeSnippetCommentEn: 'Targeted purge of stale session rows older than 30 days.',
    dialects: {
      universal: true,
      postgres: 'Prend en charge `DELETE ... RETURNING *` pour inspecter les lignes effacées.',
      mysql: 'Supporte `DELETE FROM t ORDER BY date LIMIT 1000` pour purger par petits lots.',
      sqlServer: 'Supporte `DELETE TOP (1000) FROM t` et `OUTPUT deleted.*`.',
      oracle: 'Nécessite des commits réguliers en cas de suppression massive pour ne pas saturer l\'Undo Tablespace.',
    },
    crossReferences: [
      { id: 'truncate', labelFr: 'TRUNCATE', labelEn: 'TRUNCATE' },
      { id: 'drop', labelFr: 'DROP', labelEn: 'DROP' },
      { id: 'where', labelFr: 'WHERE', labelEn: 'WHERE' },
    ],
    tags: ['Suppression', 'DML', 'Nettoyage', 'Undo'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Pour supprimer des millions de lignes sans verrouiller la table ni saturer le log de transactions, exécutez le DELETE en boucle par petits lots (ex: 5000 lignes par lot).',
    proTipEn: 'Execute massive deletions in bounded batch loops (e.g. 5,000 rows per transaction) to prevent table locks and log exhaustion.',
  },

  // --- DCL (DATA CONTROL LANGUAGE) ---
  {
    id: 'dcl-concept',
    termFr: 'DCL (Data Control Language)',
    termEn: 'DCL (Data Control Language)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Sous-ensemble du SQL dédié à la gestion des autorisations, des droits d\'accès et de la sécurité des données.',
    shortDefEn: 'The SQL subset governing authentication, permissions, access security, and privilege grants.',
    fullExplanationFr: 'Le DCL repose sur deux commandes fondamentales : `GRANT` (qui accorde des privilèges ou des rôles à des utilisateurs) et `REVOKE` (qui les retire). Il permet de respecter le principe du moindre privilège.',
    fullExplanationEn: 'Comprises GRANT and REVOKE commands, applying RBAC (Role-Based Access Control) to protect sensitive database assets.',
    codeSnippet: `-- Accord de lecture seule sur une table
GRANT SELECT ON clients TO role_analyste;

-- Révocation du droit de suppression
REVOKE DELETE ON clients FROM role_analyste;`,
    codeSnippetCommentFr: 'Attribution et révocation de privilèges sécurisés.',
    codeSnippetCommentEn: 'Granting and revoking table permissions to enforce least privilege.',
    dialects: {
      universal: true,
      sqlServer: 'Possède également l\'instruction `DENY` pour interdire explicitement un privilège même s\'il est hérité d\'un rôle.',
      oracle: 'Gestion fine des privilèges système (`GRANT CREATE TABLE`) vs privilèges objet (`GRANT SELECT ON`).',
      postgres: 'Prend en charge `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ...` et les politiques RLS (Row-Level Security).',
      mysql: 'Gestion granulaire au niveau utilisateur `\'analyste\'@\'192.168.%.%\'` avec syntaxe `FLUSH PRIVILEGES;` (si modification directe des tables grant).',
    },
    crossReferences: [
      { id: 'grant', labelFr: 'GRANT', labelEn: 'GRANT' },
      { id: 'revoke', labelFr: 'REVOKE', labelEn: 'REVOKE' },
    ],
    tags: ['Sécurité', 'Privilèges', 'DCL', 'Rôles'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
  },
  {
    id: 'grant',
    termFr: 'GRANT (DCL)',
    termEn: 'GRANT (DCL)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande DCL accordant des privilèges spécifiques (SELECT, INSERT, UPDATE, EXECUTE) ou des rôles à un utilisateur ou groupe.',
    shortDefEn: 'DCL statement conferring specific access rights or role memberships to database users.',
    fullExplanationFr: 'Permet d\'ouvrir des accès ciblés sur des objets précis (ex: lecture seule sur une vue sans donner accès à la table sous-jacente). L\'option `WITH GRANT OPTION` permet au bénéficiaire de transmettre lui-même ce droit.',
    fullExplanationEn: 'Grants object privileges. The WITH GRANT OPTION enables the recipient to delegate granted rights downstream.',
    codeSnippet: `-- Donner accès en lecture et écriture à un développeur
GRANT SELECT, INSERT, UPDATE ON factures TO dev_user;

-- Attribuer un rôle à un utilisateur
GRANT role_lecture_seule TO analyste_bi;`,
    codeSnippetCommentFr: 'Attribution de privilèges DML sur table et affectation de rôle.',
    codeSnippetCommentEn: 'Assigning DML table permissions and granting role membership.',
    dialects: {
      universal: true,
      oracle: 'Supporte `WITH ADMIN OPTION` pour les privilèges système.',
      postgres: 'Permet `GRANT ... WITH GRANT OPTION`.',
    },
    crossReferences: [
      { id: 'revoke', labelFr: 'REVOKE', labelEn: 'REVOKE' },
      { id: 'dcl-concept', labelFr: 'DCL', labelEn: 'DCL' },
    ],
    tags: ['Sécurité', 'Droits', 'GRANT'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
  },
  {
    id: 'revoke',
    termFr: 'REVOKE (DCL)',
    termEn: 'REVOKE (DCL)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande DCL retirant un ou plusieurs privilèges ou rôles précédemment accordés à un utilisateur ou à un rôle.',
    shortDefEn: 'DCL statement revoking previously granted privileges or role assignments.',
    fullExplanationFr: 'Permet de fermer les accès lors de départs d\'utilisateurs ou de durcissements de sécurité. Si le privilège avait été accordé avec `WITH GRANT OPTION`, la clause `CASCADE` permet de révoquer également tous les droits dérivés.',
    fullExplanationEn: 'Revokes access grants. CASCADE recursively removes downstream privileges granted via delegation.',
    codeSnippet: `-- Retrait des droits d'insertion
REVOKE INSERT, UPDATE ON factures FROM dev_user;

-- Retrait d'un rôle
REVOKE role_administrateur FROM stagiaire;`,
    codeSnippetCommentFr: 'Révocation de droits DML et suppression de rattachement à un rôle.',
    codeSnippetCommentEn: 'Withdrawing operational DML rights and role privileges.',
    dialects: {
      universal: true,
      postgres: 'Supporte `REVOKE ALL PRIVILEGES ON TABLE ... FROM ... CASCADE;`',
      sqlServer: 'Prend en charge `CASCADE` lors de la révocation de droits accordés avec `GRANT OPTION`.',
    },
    crossReferences: [
      { id: 'grant', labelFr: 'GRANT', labelEn: 'GRANT' },
      { id: 'dcl-concept', labelFr: 'DCL', labelEn: 'DCL' },
    ],
    tags: ['Sécurité', 'Révocation', 'DCL'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
  },

  // --- TCL (TRANSACTION CONTROL LANGUAGE) ---
  {
    id: 'tcl-concept',
    termFr: 'TCL (Transaction Control Language)',
    termEn: 'TCL (Transaction Control Language)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Sous-ensemble du SQL régissant l\'exécution et la persistance des transactions (COMMIT, ROLLBACK, SAVEPOINT).',
    shortDefEn: 'The SQL subset controlling transaction boundaries and atomicity (COMMIT, ROLLBACK, SAVEPOINT).',
    fullExplanationFr: 'Garantit les propriétés ACID du moteur relationnel en permettant de regrouper plusieurs commandes DML dans une unité de travail logique indivisible (soit tout est validé, soit tout est annulé).',
    fullExplanationEn: 'Orchestrates ACID boundaries, grouping distinct write operations into all-or-nothing logical transaction units.',
    codeSnippet: `BEGIN TRANSACTION;
  UPDATE comptes SET solde = solde - 100 WHERE id = 10;
  UPDATE comptes SET solde = solde + 100 WHERE id = 20;
COMMIT;`,
    codeSnippetCommentFr: 'Transfert bancaire classique protégé par une transaction atomique.',
    codeSnippetCommentEn: 'Atomic money transfer within a transactional envelope.',
    dialects: {
      universal: true,
      postgres: '`BEGIN;` ou `START TRANSACTION;` puis `COMMIT;` ou `ROLLBACK;`',
      mysql: '`START TRANSACTION;` puis `COMMIT;` ou `ROLLBACK;`',
      sqlServer: '`BEGIN TRANSACTION;` puis `COMMIT TRANSACTION;` ou `ROLLBACK TRANSACTION;`',
      oracle: 'En Oracle, une transaction démarre implicitement dès la première instruction DML (aucun `BEGIN TRANSACTION` nécessaire). Elle se termine par `COMMIT;` ou `ROLLBACK;`.',
    },
    crossReferences: [
      { id: 'commit', labelFr: 'COMMIT', labelEn: 'COMMIT' },
      { id: 'rollback', labelFr: 'ROLLBACK', labelEn: 'ROLLBACK' },
      { id: 'savepoint', labelFr: 'SAVEPOINT', labelEn: 'SAVEPOINT' },
      { id: 'acid', labelFr: 'Propriétés ACID', labelEn: 'ACID' },
    ],
    tags: ['TCL', 'ACID', 'Transactions', 'Intégrité'],
    difficulty: 'intermediate',
    audience: ['beginner', 'developer', 'data_analyst'],
  },
  {
    id: 'commit',
    termFr: 'COMMIT (TCL)',
    termEn: 'COMMIT (TCL)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande TCL validant de manière définitive et permanente toutes les modifications apportées durant la transaction courante.',
    shortDefEn: 'TCL statement permanently persisting all database mutations performed during the active transaction.',
    fullExplanationFr: 'L\'instruction `COMMIT` déclenche l\'écriture synchrone dans le journal de transactions (Write-Ahead Log / Redo Log), libère les verrous de lignes ou de tables détenus par la session, et rend les modifications visibles aux autres utilisateurs selon le niveau d\'isolation.',
    fullExplanationEn: 'Triggers WAL fsync, persists mutations to disk, releases acquired row/table locks, and reveals changes to concurrent transactions.',
    codeSnippet: `BEGIN;
  INSERT INTO commandes (client_id, montant) VALUES (42, 199.99);
  UPDATE stock SET quantite = quantite - 1 WHERE produit_id = 15;
COMMIT; -- Les deux opérations sont gravées définitivement`,
    codeSnippetCommentFr: 'Validation finale d\'une transaction d\'achat et décrément de stock.',
    codeSnippetCommentEn: 'Persisting purchase creation and stock reduction as a single atomic unit.',
    dialects: {
      universal: true,
      postgres: '`COMMIT;` ou `END;`',
      mysql: '`COMMIT;`',
      sqlServer: '`COMMIT TRANSACTION;` ou `COMMIT WORK;`',
      oracle: '`COMMIT;` ou `COMMIT WORK;`',
    },
    crossReferences: [
      { id: 'rollback', labelFr: 'ROLLBACK', labelEn: 'ROLLBACK' },
      { id: 'tcl-concept', labelFr: 'TCL', labelEn: 'TCL' },
      { id: 'acid', labelFr: 'Propriétés ACID', labelEn: 'ACID' },
    ],
    tags: ['TCL', 'Durabilité', 'Validation', 'ACID'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'En mode interactif dans des outils comme DBeaver ou SQL Developer, vérifiez si le paramètre "Auto-Commit" est activé ou désactivé pour éviter de laisser des verrous actifs en production.',
    proTipEn: 'Verify client auto-commit settings in DBA tools to prevent lingering uncommitted write locks.',
  },
  {
    id: 'rollback',
    termFr: 'ROLLBACK (TCL)',
    termEn: 'ROLLBACK (TCL)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande TCL annulant immédiatement l\'ensemble des modifications non validées de la transaction active, rétablissant l\'état d\'origine.',
    shortDefEn: 'TCL statement completely undoing all uncommitted modifications of the current transaction, reverting data to its prior state.',
    fullExplanationFr: 'Utilisé en cas d\'erreur d\'application, d\'exception SQL ou de violation de contrainte. `ROLLBACK` consulte les segments d\'annulation (Undo) pour restaurer l\'état initial des lignes et libère tous les verrous acquis.',
    fullExplanationEn: 'Invoked during business exceptions or constraint violations. Reverts mutated tuples using undo segments and releases all active locks.',
    codeSnippet: `BEGIN;
  UPDATE inventaire SET qte = qte - 5 WHERE produit_id = 99;
  
  -- Une vérification applicative échoue (stock négatif détecté)
  -- On annule tout proprement :
ROLLBACK;`,
    codeSnippetCommentFr: 'Annulation intégrale de la transaction suite à une anomalie.',
    codeSnippetCommentEn: 'Reverting transaction state upon runtime exception.',
    dialects: {
      universal: true,
      sqlServer: '`ROLLBACK TRANSACTION;`',
      postgres: '`ROLLBACK;`',
      oracle: '`ROLLBACK;` ou `ROLLBACK TO savepoint_name;`',
      mysql: '`ROLLBACK;`',
    },
    crossReferences: [
      { id: 'commit', labelFr: 'COMMIT', labelEn: 'COMMIT' },
      { id: 'savepoint', labelFr: 'SAVEPOINT', labelEn: 'SAVEPOINT' },
      { id: 'acid', labelFr: 'Propriétés ACID', labelEn: 'ACID' },
    ],
    tags: ['TCL', 'Annulation', 'Undo', 'Atomicité'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
  },
  {
    id: 'savepoint',
    termFr: 'SAVEPOINT (TCL)',
    termEn: 'SAVEPOINT (TCL)',
    category: 4,
    categoryNameFr: 'Commandes SQL (DDL, DML, DCL, TCL)',
    categoryNameEn: 'SQL Commands (DDL, DML, DCL, TCL)',
    shortDefFr: 'Commande TCL posant un jalon intermédiaire au sein d\'une transaction pour permettre des annulations partielles (`ROLLBACK TO SAVEPOINT`).',
    shortDefEn: 'TCL statement creating an intermediate checkpoint within a transaction for granular, partial rollbacks.',
    fullExplanationFr: 'Permet d\'exécuter des opérations exploratoires ou facultatives. En cas d\'échec de l\'opération secondaire, on peut revenir au point de sauvegarde sans perdre ni annuler les opérations majeures effectuées au début de la transaction.',
    fullExplanationEn: 'Facilitates nested or speculative execution. If a non-critical sub-operation fails, the session can rollback specifically to the savepoint.',
    codeSnippet: `BEGIN;
  INSERT INTO clients (nom) VALUES ('Entreprise ACME');
  
  -- Pose d'un jalon
  SAVEPOINT client_cree;

  -- Tentative d'insertion d'une option optionnelle qui échoue
  INSERT INTO options_bonus (option_id, nom) VALUES (999, 'Option Invalide');

  -- En cas d'erreur sur l'option, on annule seulement jusqu'au jalon :
  ROLLBACK TO SAVEPOINT client_cree;

  -- On valide l'insertion du client principal !
COMMIT;`,
    codeSnippetCommentFr: 'Annulation chirurgicale d\'une étape secondaire sans annuler le client.',
    codeSnippetCommentEn: 'Partial rollback isolating sub-step failure while preserving parent record.',
    dialects: {
      universal: true,
      postgres: '`SAVEPOINT nom;` et `ROLLBACK TO SAVEPOINT nom;` (ou `RELEASE SAVEPOINT nom;` pour libérer le jalon).',
      oracle: '`SAVEPOINT nom;` et `ROLLBACK TO SAVEPOINT nom;`',
      sqlServer: '`SAVE TRANSACTION nom;` et `ROLLBACK TRANSACTION nom;`',
      mysql: '`SAVEPOINT nom;` et `ROLLBACK TO SAVEPOINT nom;`',
    },
    crossReferences: [
      { id: 'commit', labelFr: 'COMMIT', labelEn: 'COMMIT' },
      { id: 'rollback', labelFr: 'ROLLBACK', labelEn: 'ROLLBACK' },
      { id: 'transaction', labelFr: 'Transaction', labelEn: 'Transaction' },
    ],
    tags: ['TCL', 'Jalon', 'Annulation partielle', 'Transactions'],
    difficulty: 'intermediate',
    audience: ['developer'],
    proTipFr: 'Les frameworks ORM (comme Hibernate ou Prisma) utilisent intensivement les SAVEPOINTs pour implémenter les transactions imbriquées (Nested Transactions).',
    proTipEn: 'ORMs heavily employ savepoints behind the scenes to emulate nested transactions.',
  },
];
