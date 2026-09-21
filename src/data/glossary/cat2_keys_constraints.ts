import { GlossaryTerm } from '../../types';

export const CAT2_KEYS_CONSTRAINTS_TERMS: GlossaryTerm[] = [
  {
    id: 'primary-key',
    termFr: 'Clé primaire (Primary Key - PK)',
    termEn: 'Primary Key (PK)',
    category: 2,
    categoryNameFr: 'Clés et Contraintes (Constraints)',
    categoryNameEn: 'Keys & Constraints',
    shortDefFr: 'Colonne (ou ensemble de colonnes) identifiant de manière unique et certaine chaque ligne d\'une table. Ne peut jamais contenir de valeur NULL.',
    shortDefEn: 'A column or combination of columns that uniquely identifies each row in a table. It strictly prohibits NULL values.',
    fullExplanationFr: 'La clé primaire applique à la fois une contrainte d\'unicité absolue (UNIQUE) et de non-nullité (NOT NULL). Le moteur SGBD crée automatiquement un index unique sous-jacent (souvent un index clustered en SQL Server ou l\'index clusterisé principal en InnoDB MySQL) pour optimiser les recherches par identifiant.',
    fullExplanationEn: 'A primary key enforces both UNIQUE and NOT NULL constraints. The relational engine automatically generates an underlying unique index (frequently a clustered index) to accelerate point lookups.',
    codeSnippet: `-- Définition inline ou en contrainte de table nommée
CREATE TABLE utilisateurs (
  id INT NOT NULL,
  matricule VARCHAR(20) NOT NULL,
  nom VARCHAR(50) NOT NULL,
  CONSTRAINT pk_utilisateurs PRIMARY KEY (id)
);

-- Clé primaire composite (plusieurs colonnes)
CREATE TABLE details_commande (
  commande_id INT NOT NULL,
  ligne_numero INT NOT NULL,
  produit_id INT NOT NULL,
  quantite INT NOT NULL,
  CONSTRAINT pk_details_commande PRIMARY KEY (commande_id, ligne_numero)
);`,
    codeSnippetCommentFr: 'Déclaration d\'une clé primaire simple et d\'une clé primaire composite.',
    codeSnippetCommentEn: 'Declaring single-column and multi-column composite primary keys.',
    dialects: {
      universal: true,
      postgres: 'Création implicite d\'un index B-Tree unique portant le nom de la contrainte.',
      mysql: 'Dans le moteur InnoDB, la clé primaire constitue obligatoirement l\'index clusterisé (Clustered Index). Si aucune PK n\'est définie, InnoDB utilise la première clé UNIQUE NOT NULL ou génère un GEN_CLUST_INDEX masqué.',
      sqlServer: 'Par défaut, la clé primaire est créée comme `CLUSTERED`. On peut spécifier `PRIMARY KEY NONCLUSTERED` si nécessaire.',
      oracle: 'Oracle crée automatiquement un index unique associé portant le même nom que la contrainte.',
    },
    crossReferences: [
      { id: 'foreign-key', labelFr: 'Clé étrangère (FK)', labelEn: 'Foreign Key' },
      { id: 'unique-constraint', labelFr: 'Contrainte UNIQUE', labelEn: 'UNIQUE Constraint' },
      { id: 'not-null', labelFr: 'Contrainte NOT NULL', labelEn: 'NOT NULL' },
      { id: 'index', labelFr: 'Index', labelEn: 'Index' },
    ],
    tags: ['Intégrité', 'Identifiant', 'Index Clustered', 'Contraintes'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Préférez une clé de substitution (Surrogate Key) entière ou UUIDv7 stable plutôt qu\'une clé naturelle variable (ex: adresse email susceptible d\'être modifiée par l\'utilisateur).',
    proTipEn: 'Prefer immutable surrogate keys (integer sequences or UUIDv7) over mutable natural keys like email addresses.',
  },
  {
    id: 'foreign-key',
    termFr: 'Clé étrangère (Foreign Key - FK)',
    termEn: 'Foreign Key (FK)',
    category: 2,
    categoryNameFr: 'Clés et Contraintes (Constraints)',
    categoryNameEn: 'Keys & Constraints',
    shortDefFr: 'Colonne qui établit un lien d\'intégrité référentielle entre deux tables en pointant vers la clé primaire ou unique d\'une table parente.',
    shortDefEn: 'A column referencing the primary or unique key of another table to maintain strict referential integrity.',
    fullExplanationFr: 'La clé étrangère empêche l\'insertion de lignes orphelines (ex: une commande pour un client qui n\'existe pas). Elle permet aussi de paramétrer les actions en cascade en cas de mise à jour ou de suppression dans la table parente : `ON DELETE CASCADE`, `ON DELETE SET NULL`, ou `ON DELETE RESTRICT` (par défaut).',
    fullExplanationEn: 'A foreign key prevents orphan child records. It also configures referential actions upon parent mutation: CASCADE, SET NULL, or RESTRICT / NO ACTION.',
    codeSnippet: `CREATE TABLE commandes (
  commande_id INT PRIMARY KEY,
  client_id INT NOT NULL,
  date_commande DATE NOT NULL,
  CONSTRAINT fk_commandes_client
    FOREIGN KEY (client_id) 
    REFERENCES clients (client_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);`,
    codeSnippetCommentFr: 'Définition d\'une contrainte de clé étrangère avec clause d\'intégrité ON DELETE/UPDATE.',
    codeSnippetCommentEn: 'Foreign key constraint with ON DELETE and ON UPDATE actions.',
    dialects: {
      universal: true,
      postgres: 'Supporte ON DELETE CASCADE, SET NULL, SET DEFAULT, RESTRICT, NO ACTION.',
      mysql: 'Le moteur InnoDB requiert et vérifie les clés étrangères. L\'ancien moteur MyISAM ignorait silencieusement les déclarations FK !',
      sqlServer: 'Supporte ON DELETE CASCADE / SET NULL / SET DEFAULT / NO ACTION. Attention aux blocages lors des cascades multiples circulaires.',
      oracle: 'Oracle ne supporte pas `ON UPDATE CASCADE` nativement (uniquement ON DELETE CASCADE ou ON DELETE SET NULL).',
      specialNoteFr: 'Pensez toujours à indexer manuellement les colonnes de clés étrangères côté enfant (MySQL le fait automatiquement, mais Postgres, Oracle et SQL Server ne le font pas par défaut !).',
    },
    crossReferences: [
      { id: 'primary-key', labelFr: 'Clé primaire (PK)', labelEn: 'Primary Key' },
      { id: 'table', labelFr: 'Table', labelEn: 'Table' },
      { id: 'inner-join', labelFr: 'INNER JOIN', labelEn: 'INNER JOIN' },
    ],
    tags: ['Intégrité référentielle', 'Jointure', 'Cascade'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Indexez systématiquement la colonne de clé étrangère dans la table enfant pour éviter les scans séquentiels complets lors des jointures et des suppressions dans la table parente.',
    proTipEn: 'Always create an index on foreign key columns in child tables to avoid full table lockups on parent row deletions.',
  },
  {
    id: 'not-null',
    termFr: 'Contrainte NOT NULL',
    termEn: 'NOT NULL Constraint',
    category: 2,
    categoryNameFr: 'Clés et Contraintes (Constraints)',
    categoryNameEn: 'Keys & Constraints',
    shortDefFr: 'Règle interdisant formellement l\'absence de valeur (valeur NULL) dans une colonne lors de l\'insertion ou de la mise à jour.',
    shortDefEn: 'A column rule that forbids the missing/unknown state (NULL values) during record insertion or modification.',
    fullExplanationFr: 'Par défaut, en SQL, toute colonne accepte les valeurs NULL (valeur manquante ou inconnue). La contrainte NOT NULL oblige l\'application à fournir une valeur explicite ou à se reposer sur une contrainte DEFAULT.',
    fullExplanationEn: 'By default, columns allow NULL. Applying NOT NULL forces explicit data entry and shields queries from the complexities of ternary (three-valued) Boolean logic.',
    codeSnippet: `CREATE TABLE articles (
  article_id INT PRIMARY KEY,
  titre VARCHAR(100) NOT NULL, -- Obligatoire
  sous_titre VARCHAR(200) NULL  -- Optionnel
);`,
    codeSnippetCommentFr: 'Spécification de colonne obligatoire vs optionnelle.',
    codeSnippetCommentEn: 'Contrasting required NOT NULL and optional nullable columns.',
    dialects: {
      universal: true,
      postgres: 'Peut être modifiée via `ALTER TABLE articles ALTER COLUMN titre SET NOT NULL;`',
      mysql: 'Modifiée via `ALTER TABLE articles MODIFY titre VARCHAR(100) NOT NULL;`',
      oracle: 'Modifiée via `ALTER TABLE articles MODIFY (titre NOT NULL);`',
      sqlServer: 'Modifiée via `ALTER TABLE articles ALTER COLUMN titre VARCHAR(100) NOT NULL;`',
    },
    crossReferences: [
      { id: 'primary-key', labelFr: 'Clé primaire (PK)', labelEn: 'Primary Key' },
      { id: 'default-constraint', labelFr: 'Contrainte DEFAULT', labelEn: 'DEFAULT' },
    ],
    tags: ['Intégrité', 'Logique ternaire', 'Validation'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Une chaîne vide (\'\') est considérée comme NULL sous Oracle (spécificité historique), alors qu\'elle est distincte de NULL sous PostgreSQL, MySQL et SQL Server.',
    proTipEn: 'Oracle treats empty string (\'\') identically to NULL, whereas Postgres, MySQL, and SQL Server treat it as a distinct empty string.',
  },
  {
    id: 'unique-constraint',
    termFr: 'Contrainte UNIQUE',
    termEn: 'UNIQUE Constraint',
    category: 2,
    categoryNameFr: 'Clés et Contraintes (Constraints)',
    categoryNameEn: 'Keys & Constraints',
    shortDefFr: 'Garantit que toutes les valeurs renseignées dans une colonne (ou un groupe de colonnes) sont strictement distinctes.',
    shortDefEn: 'Guarantees that all non-null values stored within a column or group of columns are strictly distinct.',
    fullExplanationFr: 'Contrairement à la clé primaire, une table peut comporter plusieurs contraintes UNIQUE. La norme ANSI SQL autorise généralement plusieurs valeurs NULL dans une colonne UNIQUE (puisque deux inconnues ne sont pas considérées comme égales), sauf en SQL Server où une seule valeur NULL était historiquement tolérée.',
    fullExplanationEn: 'Unlike primary keys, multiple UNIQUE constraints can exist per table. Most engines permit multiple NULLs in unique columns under standard 3-valued logic.',
    codeSnippet: `CREATE TABLE membres (
  membre_id INT PRIMARY KEY,
  numero_licence VARCHAR(30),
  email VARCHAR(120),
  CONSTRAINT uq_membres_licence UNIQUE (numero_licence),
  CONSTRAINT uq_membres_email UNIQUE (email)
);`,
    codeSnippetCommentFr: 'Déclaration de plusieurs contraintes d\'unicité sur des clés candidates.',
    codeSnippetCommentEn: 'Defining multiple unique constraints on candidate business keys.',
    dialects: {
      universal: true,
      postgres: 'Autorise plusieurs lignes avec NULL dans une colonne UNIQUE (supporte aussi UNIQUE NULLS NOT DISTINCT depuis PG 15).',
      mysql: 'Autorise plusieurs NULLs dans une colonne UNIQUE sous InnoDB.',
      sqlServer: 'Par défaut, autorise une SEULE valeur NULL. Pour en autoriser plusieurs, utiliser un index filtré : `CREATE UNIQUE NONCLUSTERED INDEX idx_licence ON membres(numero_licence) WHERE numero_licence IS NOT NULL;`',
      oracle: 'Autorise plusieurs NULLs. Deux lignes ne violent la contrainte que si toutes les colonnes de la contrainte composite sont non-nulles et égales.',
    },
    crossReferences: [
      { id: 'primary-key', labelFr: 'Clé primaire (PK)', labelEn: 'Primary Key' },
      { id: 'index', labelFr: 'Index', labelEn: 'Index' },
    ],
    tags: ['Unicité', 'Index unique', 'Clé candidate'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Pour les contraintes uniques sur colonnes optionnelles en SQL Server, pensez toujours à créer un index unique filtré (`WHERE col IS NOT NULL`).',
    proTipEn: 'In SQL Server, use a filtered unique index (`WHERE col IS NOT NULL`) if you need to allow multiple NULL values.',
  },
  {
    id: 'check-constraint',
    termFr: 'Contrainte CHECK',
    termEn: 'CHECK Constraint',
    category: 2,
    categoryNameFr: 'Clés et Contraintes (Constraints)',
    categoryNameEn: 'Keys & Constraints',
    shortDefFr: 'Vérifie et valide qu\'une expression logique ou condition métier spécifique est respectée pour chaque valeur insérée ou modifiée.',
    shortDefEn: 'Validates that a Boolean logical condition is evaluated to TRUE (or UNKNOWN) for every row inserted or updated.',
    fullExplanationFr: 'La contrainte CHECK permet de restreindre le domaine d\'une colonne au-delà de son type simple (ex: `prix > 0`, `age >= 18`, `statut IN (\'attente\', \'valide\', \'annule\')`). La contrainte est validée tant que la condition ne retourne pas FALSE (une évaluation UNKNOWN due à un NULL est acceptée).',
    fullExplanationEn: 'CHECK constraints enforce domain business rules directly at the storage layer, rejecting any write where the predicate evaluates to FALSE.',
    codeSnippet: `CREATE TABLE employes (
  employe_id INT PRIMARY KEY,
  nom VARCHAR(50) NOT NULL,
  age INT NOT NULL,
  salaire DECIMAL(10, 2) NOT NULL,
  CONSTRAINT chk_employe_age CHECK (age >= 18 AND age <= 70),
  CONSTRAINT chk_employe_salaire CHECK (salaire > 0)
);`,
    codeSnippetCommentFr: 'Validation d\'intervalles d\'âges et de montants positifs stricts.',
    codeSnippetCommentEn: 'Enforcing age ranges and positive monetary amounts using CHECK constraints.',
    dialects: {
      universal: true,
      mysql: 'Les contraintes CHECK étaient syntaxiquement tolérées mais purement IGNORÉES par MySQL avant la version 8.0.16. Depuis 8.0.16+, elles sont pleinement appliquées.',
      postgres: 'Support complet et performant. Permet également d\'utiliser des fonctions immutables.',
      sqlServer: 'Support complet avec option `WITH NOCHECK` pour désactiver la validation lors de chargements massifs.',
      oracle: 'Support complet. Ne peut pas référencer d\'autres tables ni de pseudo-colonnes (comme SYSDATE).',
    },
    crossReferences: [
      { id: 'not-null', labelFr: 'Contrainte NOT NULL', labelEn: 'NOT NULL' },
      { id: 'table', labelFr: 'Table', labelEn: 'Table' },
    ],
    tags: ['Validation métier', 'Intégrité de domaine', 'Règles'],
    difficulty: 'intermediate',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Pour les colonnes à valeurs d\'état finies (ex: `statut`), une contrainte `CHECK (statut IN (\'A\', \'B\', \'C\'))` est souvent plus légère et portable qu\'un type ENUM propriétaire.',
    proTipEn: 'A CHECK IN list constraint is often more portable across engines than vendor-specific ENUM types.',
  },
  {
    id: 'default-constraint',
    termFr: 'Contrainte DEFAULT',
    termEn: 'DEFAULT Constraint',
    category: 2,
    categoryNameFr: 'Clés et Contraintes (Constraints)',
    categoryNameEn: 'Keys & Constraints',
    shortDefFr: 'Attribue automatiquement une valeur prédéfinie à une colonne si aucune valeur n\'est explicitement fournie lors de l\'opération d\'insertion.',
    shortDefEn: 'Automatically populates a predefined value into a column when an INSERT omits the field.',
    fullExplanationFr: 'La clause DEFAULT évite aux requêtes INSERT d\'avoir à spécifier des valeurs constantes courantes (comme le statut initial d\'une commande ou la date courante `CURRENT_TIMESTAMP`). Si une insertion passe explicitement le mot-clé `DEFAULT`, la valeur par défaut est également appliquée.',
    fullExplanationEn: 'DEFAULT provides a fallback value during INSERT operations, streamlining client queries and guaranteeing sensible default data states.',
    codeSnippet: `CREATE TABLE abonnements (
  abonnement_id INT PRIMARY KEY,
  client_id INT NOT NULL,
  actif BOOLEAN DEFAULT TRUE,
  tentatives_connexion INT DEFAULT 0,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion sans spécifier les colonnes par défaut
INSERT INTO abonnements (abonnement_id, client_id)
VALUES (1, 504);
-- actif vaudra TRUE, tentatives 0, et date_creation l'horodatage actuel.`,
    codeSnippetCommentFr: 'Valeurs par défaut booléennes, numériques et temporelles.',
    codeSnippetCommentEn: 'Applying boolean, integer counter, and timestamp defaults.',
    dialects: {
      universal: true,
      postgres: 'Supporte les fonctions comme `CURRENT_TIMESTAMP`, `now()`, ou des séquences.',
      mysql: 'Depuis MySQL 8.0.13, les expressions par défaut dynamiques (ex: `DEFAULT (UUID())`) sont supportées entre parenthèses.',
      sqlServer: 'Utilise `GETDATE()` ou `SYSUTCDATETIME()`. La contrainte DEFAULT peut avoir son propre nom explicite : `CONSTRAINT df_actif DEFAULT 1 FOR actif`.',
      oracle: 'Utilise `DEFAULT SYSDATE` ou `DEFAULT CURRENT_TIMESTAMP`.',
    },
    crossReferences: [
      { id: 'not-null', labelFr: 'Contrainte NOT NULL', labelEn: 'NOT NULL' },
      { id: 'table', labelFr: 'Table', labelEn: 'Table' },
      { id: 'insert', labelFr: 'INSERT', labelEn: 'INSERT' },
    ],
    tags: ['Valeur par défaut', 'Insertion', 'Horodatage'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Attention : passer explicitement `NULL` dans un INSERT (`VALUES (1, 504, NULL)`) n\'invoque PAS la valeur DEFAULT, mais insère réellement la valeur NULL (sauf si la colonne est NOT NULL, auquel cas une erreur est levée).',
    proTipEn: 'Explicitly passing NULL in an INSERT will NOT invoke DEFAULT; use the keyword DEFAULT or omit the column.',
  },
];
