import { GlossaryTerm } from '../../types';

export const CAT8_THEORY_ARCHITECTURE_TERMS: GlossaryTerm[] = [
  {
    id: 'relational-model',
    termFr: 'Modèle relationnel (Relational Model)',
    termEn: 'Relational Model',
    category: 8,
    categoryNameFr: 'Théorie et Architecture',
    categoryNameEn: 'Database Theory & Architecture',
    shortDefFr: 'Modèle théorique conçu par Edgar F. Codd en 1970, représentant les données sous forme de relations mathématiques (tables) composées de tuples (lignes) et d\'attributs (colonnes).',
    shortDefEn: 'Theoretical data management model introduced by Edgar F. Codd (1970), structuring data as mathematical relations (tables) composed of tuples and attributes.',
    fullExplanationFr: 'Fondé sur la théorie mathématique des ensembles et la logique des prédicats du premier ordre. Le modèle relationnel sépare strictement la représentation logique des données de leur implémentation physique sur le matériel, permettant d\'écrire des requêtes déclaratives (SQL) sans devoir spécifier les algorithmes de parcours de fichiers.',
    fullExplanationEn: 'Rooted in set theory and first-order predicate logic. Decouples logical query declaration from physical disk storage, allowing query optimizers to independently select execution plans.',
    codeSnippet: `-- Représentation déclarative relationnelle :
-- L'utilisateur exprime CE QU'IL VEUT, et non COMMENT le récupérer :
SELECT c.nom, SUM(cmd.montant) AS total
FROM clients c
JOIN commandes cmd ON c.client_id = cmd.client_id
GROUP BY c.nom;`,
    codeSnippetCommentFr: 'Nature déclarative du modèle relationnel.',
    codeSnippetCommentEn: 'Declarative query paradigm in the relational model.',
    dialects: {
      universal: true,
      specialNoteFr: 'Codd a énoncé les célèbres 12 règles de Codd pour définir un véritable SGBD relationnel (RDBMS).',
    },
    crossReferences: [
      { id: 'database', labelFr: 'Base de données', labelEn: 'Database' },
      { id: 'table', labelFr: 'Table', labelEn: 'Table' },
      { id: 'normalisation', labelFr: 'Normalisation (1NF, 2NF, 3NF)', labelEn: 'Normalization' },
    ],
    tags: ['Théorie', 'Codd', 'Mathématiques', 'Modélisation', 'Algèbre relationnelle'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
  },
  {
    id: 'normalisation',
    termFr: 'Normalisation (1NF, 2NF, 3NF, BCNF)',
    termEn: 'Normalization (1NF, 2NF, 3NF, BCNF)',
    category: 8,
    categoryNameFr: 'Théorie et Architecture',
    categoryNameEn: 'Database Theory & Architecture',
    shortDefFr: 'Processus méthodique de structuration d\'une base relationnelle visant à éliminer la redondance des données et prévenir les anomalies d\'insertion, de mise à jour et de suppression.',
    shortDefEn: 'Methodical schema structuring process designed to eliminate data redundancy and prevent update/deletion anomalies.',
    fullExplanationFr: 'Les formes normales s\'emboîtent successivement :\\n- **1NF (Première Forme Normale)** : Chaque cellule contient une valeur atomique (indivisible), pas de listes ou de tableaux multivalués, et chaque ligne possède une clé primaire identifiante.\\n- **2NF (Deuxième Forme Normale)** : Respecte la 1NF + tout attribut non-clé dépend pleinement de la totalité de la clé primaire (et non d\'une sous-partie de clé composite).\\n- **3NF (Troisième Forme Normale)** : Respecte la 2NF + aucune dépendance fonctionnelle transitive (un attribut non-clé ne doit pas dépendre d\'un autre attribut non-clé). Résumé célèbre : "La clé, toute la clé, et rien que la clé !".',
    fullExplanationEn: 'Progressive normal forms: 1NF enforces atomic values; 2NF eliminates partial functional dependencies on composite keys; 3NF eliminates transitive dependencies between non-key attributes.',
    codeSnippet: `-- Exemple de violation 1NF (valeurs non atomiques) :
-- Table incorrecte : commande_id | produits
--                    1           | 'Pomme, Poire, Banane'

-- Modélisation normalisée en 3NF :
CREATE TABLE commandes (
  commande_id INT PRIMARY KEY,
  client_id INT NOT NULL,
  date_commande DATE NOT NULL
);

CREATE TABLE lignes_commande (
  commande_id INT NOT NULL,
  produit_id INT NOT NULL,
  quantite INT NOT NULL,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (commande_id, produit_id),
  FOREIGN KEY (commande_id) REFERENCES commandes(commande_id)
);`,
    codeSnippetCommentFr: 'Passage d\'une table dénormalisée avec tableau textuel à une structure 3NF propre.',
    codeSnippetCommentEn: 'Transitioning from non-atomic denormalized rows to 3NF relational tables.',
    dialects: {
      universal: true,
      postgres: 'Bien que les types `ARRAY` ou `JSONB` soient pris en charge par PostgreSQL, les stocker dans des tables transactionnelles relationnelles rompt la 1NF pure au profit de flexibilité NoSQL.',
    },
    crossReferences: [
      { id: 'denormalisation', labelFr: 'Dénormalisation', labelEn: 'Denormalization' },
      { id: 'primary-key', labelFr: 'Clé primaire (PK)', labelEn: 'Primary Key' },
      { id: 'foreign-key', labelFr: 'Clé étrangère (FK)', labelEn: 'Foreign Key' },
    ],
    tags: ['Normalisation', '1NF', '2NF', '3NF', 'BCNF', 'Intégrité'],
    difficulty: 'intermediate',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Pour les applications OLTP (transactionnelles en ligne), visez toujours la 3NF pour garantir une intégrité parfaite et des écritures sans redondance.',
    proTipEn: 'Target 3NF for OLTP transactional applications to eliminate redundancy and update anomalies.',
  },
  {
    id: 'denormalisation',
    termFr: 'Dénormalisation',
    termEn: 'Denormalization',
    category: 8,
    categoryNameFr: 'Théorie et Architecture',
    categoryNameEn: 'Database Theory & Architecture',
    shortDefFr: 'Stratégie d\'optimisation délibérée consistant à réintroduire de la redondance dans un schéma de données pour accélérer drastiquement les requêtes de lecture complexes.',
    shortDefEn: 'A conscious optimization strategy introducing intentional data redundancy to minimize expensive joins and accelerate analytical read queries.',
    fullExplanationFr: 'Privilégiée dans les entrepôts de données (Data Warehouses) et les schémas en étoile (Star Schemas / Kimball). En stockant directement des attributs pré-calculés (ex: `total_commandes_client` ou `nom_categorie` dans la table des ventes), on évite d\'avoir à joindre 5 ou 6 tables à chaque requête analytique, au prix d\'une synchronisation plus complexe lors des écritures.',
    fullExplanationEn: 'Ubiquitous in analytical databases and OLAP star schemas. Trades write complexity and storage overhead for lightning-fast aggregation queries without deep multi-table joins.',
    codeSnippet: `-- Table de faits dénormalisée (Data Warehouse / Schéma en étoile)
CREATE TABLE faits_ventes (
  vente_id BIGINT PRIMARY KEY,
  date_id INT NOT NULL,
  produit_id INT NOT NULL,
  produit_nom VARCHAR(100),       -- Dénormalisé pour éviter le JOIN
  categorie_nom VARCHAR(50),     -- Dénormalisé pour filtrage instantané
  magasin_ville VARCHAR(50),      -- Dénormalisé
  montant_ht DECIMAL(10,2),
  tva DECIMAL(10,2),
  montant_ttc DECIMAL(10,2)       -- Pré-calculé
);`,
    codeSnippetCommentFr: 'Structure dénormalisée pour entrepôt de données décisionnel.',
    codeSnippetCommentEn: 'Denormalized fact table structured for fast analytical reporting.',
    dialects: {
      universal: true,
      specialNoteFr: 'Typique des architectures OLAP (ClickHouse, BigQuery, Snowflake, Redshift).',
    },
    crossReferences: [
      { id: 'normalisation', labelFr: 'Normalisation', labelEn: 'Normalization' },
      { id: 'view', labelFr: 'Vue matérialisée', labelEn: 'Materialized View' },
    ],
    tags: ['Dénormalisation', 'OLAP', 'Data Warehouse', 'Performance', 'Redondance'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
    proTipFr: 'Ne dénormalisez jamais prématurément dans un système transactionnel : commencez en 3NF stricte, indexez intelligemment, et ne dénormalisez que sur la base de benchmarks de performance prouvés.',
    proTipEn: 'Avoid premature denormalization in OLTP systems; measure index utilization and query profiles before duplicating attributes.',
  },
  {
    id: 'acid',
    termFr: 'Propriétés ACID (Atomicité, Cohérence, Isolation, Durabilité)',
    termEn: 'ACID Properties (Atomicity, Consistency, Isolation, Durability)',
    category: 8,
    categoryNameFr: 'Théorie et Architecture',
    categoryNameEn: 'Database Theory & Architecture',
    shortDefFr: 'Quatre garanties fondamentales assurées par les moteurs de bases de données relationnelles pour certifier la fiabilité absolue des transactions.',
    shortDefEn: 'The four cornerstone guarantees of relational database engines ensuring transactional reliability and data integrity.',
    fullExplanationFr: 'Les 4 piliers indispensables :\\n- **A - Atomicité (All or Nothing)** : Soit toutes les opérations de la transaction sont menées à bien, soit aucune ne l\'est (en cas de panne, tout est annulé par ROLLBACK).\\n- **C - Cohérence (Consistency)** : Une transaction fait passer la base d\'un état valide à un autre état valide, en respectant scrupuleusement toutes les contraintes d\'intégrité (clés, CHECK, NOT NULL).\\n- **I - Isolation** : Les transactions concurrentes s\'exécutent sans interférer de façon corruptrice les unes avec les autres.\\n- **D - Durabilité** : Une fois le COMMIT confirmé, les données sont écrites de manière pérenne sur support persistant et résisteront à un crash ou une coupure électrique immédiate.',
    fullExplanationEn: 'Atomicity ensures all-or-nothing operations; Consistency maintains database invariant rules and constraints; Isolation arbitrates concurrent access anomalies; Durability guarantees committed writes survive sudden server crashes.',
    codeSnippet: `-- Démonstration de l'atomicité et de la cohérence ACID :
BEGIN;
  -- Débit d'un compte
  UPDATE comptes SET solde = solde - 200 WHERE id = 1;
  -- Si une panne ou une violation de contrainte intervient ici,
  -- l'atomicité garantit que le compte 1 n'est pas débité dans le vide !
  UPDATE comptes SET solde = solde + 200 WHERE id = 2;
COMMIT; -- Durabilité assurée par le Write-Ahead Logging (WAL)`,
    codeSnippetCommentFr: 'Transaction bancaire incarnant les garanties ACID.',
    codeSnippetCommentEn: 'Transactional transfer showcasing ACID atomicity and WAL durability.',
    dialects: {
      universal: true,
      postgres: 'Implémenté via le moteur MVCC et le journal des transactions WAL (Write-Ahead Log).',
      mysql: 'Le moteur InnoDB est pleinement ACID (grâce au Redo Log, Undo Log et Doublewrite Buffer). L\'ancien moteur MyISAM n\'était PAS conforme ACID !',
      oracle: 'Architecture Redo/Undo robuste pionnière de l\'ACID.',
      sqlServer: 'Garantie via le Transaction Log (.ldf) et Checkpoints.',
    },
    crossReferences: [
      { id: 'tcl-concept', labelFr: 'TCL', labelEn: 'TCL' },
      { id: 'commit', labelFr: 'COMMIT', labelEn: 'COMMIT' },
      { id: 'rollback', labelFr: 'ROLLBACK', labelEn: 'ROLLBACK' },
      { id: 'locks-concurrency', labelFr: 'Verrous et Concurrence', labelEn: 'Locks & Concurrency' },
    ],
    tags: ['ACID', 'Transactions', 'Fiabilité', 'WAL', 'Atomicité'],
    difficulty: 'intermediate',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'C\'est la conformité ACID qui distingue historiquement la rigueur des SGBD relationnels (Postgres, MySQL InnoDB, Oracle) des systèmes NoSQL de type "Eventual Consistency" (BASE).',
    proTipEn: 'ACID guarantees distinguish relational robustness from eventual consistency NoSQL systems.',
  },
  {
    id: 'locks-concurrency',
    termFr: 'Verrous, Niveaux d\'isolation et Concurrence (Locks, Deadlocks, MVCC)',
    termEn: 'Locks, Isolation Levels & Concurrency (Locks, Deadlocks, MVCC)',
    category: 8,
    categoryNameFr: 'Théorie et Architecture',
    categoryNameEn: 'Database Theory & Architecture',
    shortDefFr: 'Mécanismes régissant les accès simultanés de plusieurs sessions aux mêmes données, arbitrant entre débit et intégrité via les niveaux d\'isolation ANSI.',
    shortDefEn: 'Mechanisms governing simultaneous multi-user database access, balancing concurrency throughput against isolation anomalies.',
    fullExplanationFr: 'Les 4 niveaux d\'isolation ANSI SQL standards sont (du plus permissif au plus strict) :\\n1. **Read Uncommitted** : Permet les lectures sales (Dirty Reads).\\n2. **Read Committed** : Empêche la lecture de modifications non validées (niveau par défaut de PostgreSQL, Oracle et SQL Server).\\n3. **Repeatable Read** : Garantit qu\'une ligne relue dans la même transaction aura toujours la même valeur (niveau par défaut de MySQL InnoDB).\\n4. **Serializable** : Équivalent à une exécution purement séquentielle des transactions.\\n\\nLes moteurs modernes utilisent le **MVCC (Multi-Version Concurrency Control)** : "les lecteurs ne bloquent pas les rédacteurs, et les rédacteurs ne bloquent pas les lecteurs". Un **Deadlock** (interblocage) se produit lorsque la transaction 1 attend un verrou détenu par la transaction 2, qui attend elle-même un verrou détenu par la transaction 1.',
    fullExplanationEn: 'The 4 ANSI isolation levels: Read Uncommitted, Read Committed, Repeatable Read, and Serializable. Modern engines employ MVCC (readers do not lock writers; writers do not lock readers). Deadlocks occur upon circular resource lock dependencies.',
    codeSnippet: `-- Définir le niveau d'isolation pour la transaction :
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

BEGIN;
  -- Verrouillage pessimiste explicite d'une ligne pour écriture imminente :
  SELECT * FROM inventaire 
  WHERE produit_id = 42 
  FOR UPDATE; -- Pose un verrou exclusif sur la ligne
  
  UPDATE inventaire SET stock = stock - 1 WHERE produit_id = 42;
COMMIT;`,
    codeSnippetCommentFr: 'Configuration de l\'isolation et pose d\'un verrou pessimiste SELECT FOR UPDATE.',
    codeSnippetCommentEn: 'Setting isolation levels and acquiring row-level exclusive locks with SELECT FOR UPDATE.',
    dialects: {
      universal: true,
      mysql: 'Niveau par défaut : `REPEATABLE READ`. Détecte automatiquement les deadlocks et annule la transaction la moins coûteuse.',
      postgres: 'Niveau par défaut : `READ COMMITTED`. Utilise MVCC avec xmin/xmax au niveau tuple. Détection automatique des verrous cycliques via `deadlock_timeout`.',
      oracle: 'Niveau par défaut : `READ COMMITTED`. Ne propose que READ COMMITTED et SERIALIZABLE (pas de Repeatable Read direct).',
      sqlServer: 'Niveau par défaut : `READ COMMITTED` (avec verrous partagés S-locks). Propose également `READ_COMMITTED_SNAPSHOT` (RCSI) pour activer le MVCC en RAM tempdb.',
    },
    crossReferences: [
      { id: 'acid', labelFr: 'Propriétés ACID', labelEn: 'ACID' },
      { id: 'tcl-concept', labelFr: 'TCL', labelEn: 'TCL' },
    ],
    tags: ['Concurrence', 'Isolation', 'MVCC', 'Deadlock', 'FOR UPDATE', 'Verrous'],
    difficulty: 'advanced',
    audience: ['developer'],
    proTipFr: 'Pour éviter les deadlocks applicatifs, assurez-vous que toutes vos procédures et requêtes accèdent et verrouillent toujours les tables et les lignes dans le même ordre déterministe (ex: triées par identifiant croissant).',
    proTipEn: 'Prevent deadlocks by always acquiring row and table locks in a deterministic order across all application code.',
  },
  {
    id: 'sharding-replication',
    termFr: 'Sharding vs Réplication (Architecture distribuée)',
    termEn: 'Sharding vs Replication (Distributed Architecture)',
    category: 8,
    categoryNameFr: 'Théorie et Architecture',
    categoryNameEn: 'Database Theory & Architecture',
    shortDefFr: 'Deux stratégies complémentaires de mise à l\'échelle d\'une base de données : la réplication copie l\'intégralité des données sur plusieurs serveurs, tandis que le sharding partitionne horizontalement les données en fragments distincts.',
    shortDefEn: 'Two core database scaling paradigms: replication duplicates identical data across multiple nodes, whereas sharding horizontally partitions distinct data subsets across disparate servers.',
    fullExplanationFr: 'Distinction architecturale majeure :\\n- **Réplication (Primaire $\to$ Réplicas)** : Le serveur primaire reçoit les écritures (`INSERT`, `UPDATE`), puis propage les modifications aux réplicas secondaires qui traitent les requêtes en lecture seule (`SELECT`). Elle offre la haute disponibilité (basculement en cas de panne) et le passage à l\'échelle des lectures.\\n- **Sharding (Partitionnement horizontal distribué)** : La base est découpée selon une clé de sharding (ex: `client_id % 4` ou par zone géographique). Chaque nœud ne stocke qu\'une fraction des données. Permet de dépasser la capacité disque et mémoire d\'un serveur unique pour les écritures massives, mais complique grandement les jointures multi-nœuds et les transactions distribuées (protocole 2PC).',
    fullExplanationEn: 'Replication duplicates write logs to read replicas for fault-tolerance and read scaling. Sharding splits row subsets across nodes via shard keys to scale write capacity and storage beyond single-machine limits.',
    codeSnippet: `-- Exemple de partitionnement déclaratif (PostgreSQL) préparant au sharding :
CREATE TABLE metriques_serveurs (
  serveur_id INT NOT NULL,
  date_mesure DATE NOT NULL,
  charge_cpu DECIMAL(5,2)
) PARTITION BY RANGE (date_mesure);

-- Partition mensuelle spécifique
CREATE TABLE metriques_2024_01 PARTITION OF metriques_serveurs
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');`,
    codeSnippetCommentFr: 'Partitionnement horizontal natif facilitant la distribution des volumes.',
    codeSnippetCommentEn: 'Declarative table partitioning paving the path for distributed sharding.',
    dialects: {
      universal: false,
      mysql: 'Réplication asynchrone ou semi-synchrone native (via Binary Log - binlog). MySQL Group Replication / InnoDB Cluster.',
      postgres: 'Réplication en streaming physique basée sur le WAL. Extensions distribuées comme Citus Data pour le sharding natif distribué.',
      oracle: 'Oracle Data Guard pour la réplication et la reprise après sinistre, Oracle RAC pour le cluster partagé, et Oracle Sharding.',
      sqlServer: 'Always On Availability Groups (AG) pour la réplication et le basculement haute disponibilité.',
    },
    crossReferences: [
      { id: 'database', labelFr: 'Base de données', labelEn: 'Database' },
      { id: 'acid', labelFr: 'Propriétés ACID', labelEn: 'ACID' },
      { id: 'index', labelFr: 'Index', labelEn: 'Index' },
    ],
    tags: ['Architecture', 'Scalabilité', 'Sharding', 'Réplication', 'Haute Disponibilité', 'Distribué'],
    difficulty: 'advanced',
    audience: ['developer'],
    proTipFr: 'N\'adoptez le sharding que si vous avez épuisé la mise à l\'échelle verticale (Scale-Up), l\'optimisation des index, et l\'ajout de réplicas de lecture : le sharding ajoute une immense complexité opérationnelle.',
    proTipEn: 'Exhaust vertical scaling, index tuning, and read replicas before adopting sharding; distributed transactions carry enormous operational overhead.',
  },
];
