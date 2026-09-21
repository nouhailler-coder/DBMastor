import { GlossaryTerm } from '../../types';

export const CAT3_DATA_TYPES_TERMS: GlossaryTerm[] = [
  {
    id: 'int-integer',
    termFr: 'INT / INTEGER',
    termEn: 'INT / INTEGER',
    category: 3,
    categoryNameFr: 'Types de données (Data Types)',
    categoryNameEn: 'SQL Data Types',
    shortDefFr: 'Nombre entier signé standard (généralement codé sur 4 octets / 32 bits, de -2 147 483 648 à +2 147 483 647).',
    shortDefEn: 'A standard signed 32-bit integer holding whole numbers from -2,147,483,648 to +2,147,483,647.',
    fullExplanationFr: 'Type fondamental pour les compteurs, les identifiants et les clés primaires. Selon la volumétrie nécessaire, les SGBD proposent également `SMALLINT` (2 octets), `TINYINT` (1 octet sous MySQL) et `BIGINT` (8 octets, indispensable pour les tables dépassant 2 milliards de lignes).',
    fullExplanationEn: 'The core numeric type for counts and identifiers. Varied precisions include SMALLINT (2 bytes) and BIGINT (8 bytes, essential for high-volume sequence keys).',
    codeSnippet: `CREATE TABLE inventaire (
  id BIGINT PRIMARY KEY,       -- Jusqu'à 9 trillions de lignes
  quantite INT NOT NULL,       -- Entier 32 bits standard
  seuil_alerte SMALLINT        -- Entier 16 bits (-32768 à +32767)
);`,
    codeSnippetCommentFr: 'Utilisation des différentes tailles d\'entiers selon le volume attendu.',
    codeSnippetCommentEn: 'Choosing appropriate integer sizes to optimize disk and buffer storage.',
    dialects: {
      universal: true,
      postgres: 'Prend en charge `SMALLINT` (2o), `INTEGER` (4o), `BIGINT` (8o). Auto-incrément : `SERIAL` (4o), `BIGSERIAL` (8o) ou `GENERATED AS IDENTITY`.',
      mysql: 'Propose également `TINYINT` (1o), `MEDIUMINT` (3o) et le mot-clé `UNSIGNED` (ex: `INT UNSIGNED` de 0 à 4.29 milliards).',
      sqlServer: 'Propose `TINYINT` (0 à 255 non signé), `SMALLINT`, `INT`, `BIGINT`.',
      oracle: 'Oracle mappe `INTEGER` et `INT` vers `NUMBER(38)` sous le capot.',
    },
    crossReferences: [
      { id: 'decimal-numeric', labelFr: 'DECIMAL / NUMERIC', labelEn: 'DECIMAL / NUMERIC' },
      { id: 'primary-key', labelFr: 'Clé primaire (PK)', labelEn: 'Primary Key' },
    ],
    tags: ['Numérique', 'Entier', 'Stockage', 'Clé primaire'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Pour les clés primaires de tables transactionnelles à forte croissance (logs, commandes, transactions bancaires), utilisez immédiatement `BIGINT` dès le premier jour pour éviter la redoutée panne d\'épuisement des entiers 32 bits.',
    proTipEn: 'Use BIGINT upfront for primary keys on high-velocity transactional tables to avoid catastrophic integer overflow outages.',
  },
  {
    id: 'varchar',
    termFr: 'VARCHAR(n)',
    termEn: 'VARCHAR(n)',
    category: 3,
    categoryNameFr: 'Types de données (Data Types)',
    categoryNameEn: 'SQL Data Types',
    shortDefFr: 'Chaîne de caractères de longueur variable, stockant uniquement le nombre réel de caractères saisis jusqu\'à un plafond maximal `n`.',
    shortDefEn: 'A variable-length character string storing only the characters supplied, capped at maximum length `n`.',
    fullExplanationFr: 'Contrairement à `CHAR(n)`, `VARCHAR(n)` n\'ajoute pas d\'espaces de remplissage à droite. Il utilise 1 ou 2 octets supplémentaires en préfixe pour mémoriser la longueur réelle de la chaîne. Idéal pour les emails, noms, titres et descriptions courtes.',
    fullExplanationEn: 'Unlike fixed CHAR, VARCHAR only occupies the actual string length plus 1-2 length-prefix bytes, conserving storage for names, emails, and textual descriptions.',
    codeSnippet: `CREATE TABLE utilisateurs (
  login VARCHAR(30) NOT NULL,   -- Longueur max 30 caractères
  email VARCHAR(150) NOT NULL,  -- Longueur max 150 caractères
  biographie VARCHAR(500)       -- Longueur max 500 caractères
);`,
    codeSnippetCommentFr: 'Dimensionnement adapté de colonnes textuelles à taille variable.',
    codeSnippetCommentEn: 'Sizing variable-length string columns according to real data boundaries.',
    dialects: {
      universal: true,
      oracle: 'En Oracle, la recommandation officielle est d\'utiliser `VARCHAR2(n)` (ex: `VARCHAR2(150 CHAR)` pour compter en caractères et non en octets).',
      postgres: '`VARCHAR(n)` ou `VARCHAR` sans longueur (équivalent à `TEXT`). Aucun avantage de performance de VARCHAR(n) sur TEXT en Postgres.',
      sqlServer: '`VARCHAR(n)` utilise le jeu ASCII/ANSI local. Pour l\'Unicode UTF-16, utiliser `NVARCHAR(n)` (préfixé par N, ex: `N\'Bonjour\'`).',
      mysql: '`VARCHAR(n)` compte en caractères. La limite maximale d\'une ligne sous MySQL/InnoDB est de 65 535 octets.',
    },
    crossReferences: [
      { id: 'char', labelFr: 'CHAR(n)', labelEn: 'CHAR(n)' },
      { id: 'text', labelFr: 'TEXT', labelEn: 'TEXT' },
    ],
    tags: ['Texte', 'Chaîne', 'Optimisation'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'En Oracle et MySQL, spécifiez toujours la sémantique de caractères (ex: `VARCHAR2(50 CHAR)` en Oracle) pour éviter que des caractères multi-octets comme \'é\' ou \'€\' ne dépassent la limite.',
    proTipEn: 'Ensure character length semantics (not byte length) are enabled when handling UTF-8 multi-byte characters.',
  },
  {
    id: 'char',
    termFr: 'CHAR(n)',
    termEn: 'CHAR(n)',
    category: 3,
    categoryNameFr: 'Types de données (Data Types)',
    categoryNameEn: 'SQL Data Types',
    shortDefFr: 'Chaîne de caractères de longueur fixe. Si la chaîne insérée est plus courte que `n`, elle est automatiquement complétée par des espaces à droite.',
    shortDefEn: 'A fixed-length character string. If the stored text is shorter than `n`, it is padded with trailing spaces.',
    fullExplanationFr: 'Recommandé exclusivement pour des données dont la longueur est strictement invariable (ex: code pays ISO-2 `FR`, code devise ISO-3 `EUR`, code postal fixe, hachage SHA-256 de 64 caractères). Pour les longueurs variables, CHAR gaspille de l\'espace disque et complique les comparaisons en raison des espaces de fin.',
    fullExplanationEn: 'Recommended only for genuinely fixed-size codes (e.g. 2-letter ISO country codes, 3-letter currency codes, SHA-256 hex strings). Trailing whitespace padding can complicate equality comparisons.',
    codeSnippet: `CREATE TABLE devises (
  code_iso CHAR(3) PRIMARY KEY, -- Toujours 3 lettres exactes: 'EUR', 'USD'
  symbole VARCHAR(5) NOT NULL,
  pays_origine CHAR(2) NOT NULL -- Code ISO-2: 'FR', 'US', 'JP'
);`,
    codeSnippetCommentFr: 'Utilisation légitime de CHAR pour des codes normalisés immuables.',
    codeSnippetCommentEn: 'Legitimate usage of fixed-length CHAR for standardized ISO codes.',
    dialects: {
      universal: true,
      sqlServer: 'Pour Unicode à longueur fixe, utiliser `NCHAR(n)`.',
      oracle: '`CHAR(n)` applique la comparaison "Blank-Padded" : \'FR \' = \'FR\' est évalué à TRUE.',
      postgres: 'Les espaces de remplissage sont conservés au stockage, mais ignorés lors de certaines comparaisons d\'égalité.',
      mysql: 'MySQL retire les espaces de remplissage à la lecture par défaut.',
    },
    crossReferences: [
      { id: 'varchar', labelFr: 'VARCHAR(n)', labelEn: 'VARCHAR(n)' },
      { id: 'text', labelFr: 'TEXT', labelEn: 'TEXT' },
    ],
    tags: ['Texte', 'Longueur fixe', 'ISO'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Ne jamais utiliser `CHAR(n)` pour un prénom ou un email sous peine de gaspiller l\'espace disque et de provoquer des bugs de comparaison avec les espaces de remplissage.',
    proTipEn: 'Never use CHAR for variable data like names or emails; trailing spaces waste storage and create subtle query match bugs.',
  },
  {
    id: 'text',
    termFr: 'TEXT (et CLOB)',
    termEn: 'TEXT (and CLOB)',
    category: 3,
    categoryNameFr: 'Types de données (Data Types)',
    categoryNameEn: 'SQL Data Types',
    shortDefFr: 'Chaîne de caractères de très grande dimension permettant de stocker de volumineux contenus textuels (articles, JSON, logs).',
    shortDefEn: 'A high-capacity character large object data type designed to store massive textual payloads like articles, markdown, or logs.',
    fullExplanationFr: 'Permet de stocker jusqu\'à 1 Go (PostgreSQL) ou 4 Go de texte. Pour ne pas encombrer les pages de données principales de la table, les SGBD stockent souvent les valeurs volumineuses hors-ligne dans des pages spéciales (TOAST en Postgres, LOB pages en Oracle/SQL Server).',
    fullExplanationEn: 'Stores large documents up to multiple gigabytes. Engines store these out-of-line in dedicated overflow pages (TOAST in PostgreSQL, LOB storage in Oracle) to keep primary rows compact.',
    codeSnippet: `CREATE TABLE billets_blog (
  id INT PRIMARY KEY,
  titre VARCHAR(200) NOT NULL,
  contenu TEXT NOT NULL,         -- Texte intégral sans limite arbitraire
  format_markup VARCHAR(20) DEFAULT 'markdown'
);`,
    codeSnippetCommentFr: 'Stockage de corps d\'articles de blog sans restriction de taille.',
    codeSnippetCommentEn: 'Storing rich body text without arbitrary truncation limits.',
    dialects: {
      universal: false,
      postgres: '`TEXT` est le type de prédilection en PostgreSQL. Il est aussi performant que `VARCHAR` et n\'a pas de limite artificielle.',
      mysql: 'Propose `TINYTEXT` (255o), `TEXT` (64 Ko), `MEDIUMTEXT` (16 Mo) et `LONGTEXT` (4 Go).',
      oracle: 'Oracle utilise le type `CLOB` (Character Large Object) au lieu de `TEXT`.',
      sqlServer: '`VARCHAR(MAX)` ou `NVARCHAR(MAX)` est la syntaxe moderne recommandée (`TEXT` est déprécié en T-SQL).',
    },
    crossReferences: [
      { id: 'varchar', labelFr: 'VARCHAR(n)', labelEn: 'VARCHAR(n)' },
      { id: 'char', labelFr: 'CHAR(n)', labelEn: 'CHAR(n)' },
    ],
    tags: ['LOB', 'Grand volume', 'TOAST', 'Contenu'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
    proTipFr: 'En SQL Server, préférez toujours `VARCHAR(MAX)` à l\'ancien type obsolète `TEXT`. En Oracle, utilisez `CLOB`.',
    proTipEn: 'In SQL Server, always use VARCHAR(MAX) instead of the deprecated TEXT type. In Oracle, use CLOB.',
  },
  {
    id: 'date-timestamp',
    termFr: 'DATE / TIMESTAMP',
    termEn: 'DATE / TIMESTAMP',
    category: 3,
    categoryNameFr: 'Types de données (Data Types)',
    categoryNameEn: 'SQL Data Types',
    shortDefFr: 'Types temporels représentant soit une date de calendrier seule (DATE), soit une date combinée avec une heure et une fraction de seconde (TIMESTAMP).',
    shortDefEn: 'Temporal types representing either a calendar date alone (DATE) or a date combined with time and fractional seconds (TIMESTAMP).',
    fullExplanationFr: 'Les types temporels permettent les opérations arithmétiques d\'intervalles, de comparaisons et d\'extractions de composants (jour, mois, année). De nombreux moteurs proposent des variantes avec fuseau horaire (`TIMESTAMP WITH TIME ZONE`), indispensables pour les architectures réparties à l\'échelle mondiale.',
    fullExplanationEn: 'Temporal data types enable date arithmetic, interval computation, and component extraction (EXTRACT year/month). Timezone-aware variants prevent cross-region conversion errors.',
    codeSnippet: `-- Création avec date seule et horodatage complet
CREATE TABLE evenements (
  id INT PRIMARY KEY,
  date_evenement DATE NOT NULL,              -- '2024-06-15'
  cree_le TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Extraction et calcul d'écart
SELECT 
  id, 
  EXTRACT(YEAR FROM date_evenement) AS annee,
  CURRENT_TIMESTAMP - cree_le AS duree_depuis_creation
FROM evenements;`,
    codeSnippetCommentFr: 'Manipulation de dates pures et d\'horodatages avec fuseau horaire.',
    codeSnippetCommentEn: 'Handling calendar dates and timezone-aware timestamps with arithmetic.',
    dialects: {
      universal: false,
      oracle: 'En Oracle, `DATE` inclut DEJA l\'heure, les minutes et les secondes (pas de fraction de seconde) ! Pour les fractions de seconde, utiliser `TIMESTAMP`.',
      postgres: 'Prend en charge `DATE`, `TIME`, `TIMESTAMP`, et `TIMESTAMPTZ` (recommandé en production).',
      mysql: '`DATETIME` (plage 1000 à 9999 sans conversion UTC) vs `TIMESTAMP` (converti en UTC, limité à 2038).',
      sqlServer: 'Propose `DATE`, `TIME`, `DATETIME2` (recommandé), et `DATETIMEOFFSET` pour les fuseaux horaires.',
    },
    crossReferences: [
      { id: 'default-constraint', labelFr: 'Contrainte DEFAULT', labelEn: 'DEFAULT' },
      { id: 'types-donnees', labelFr: 'Types de données', labelEn: 'Data Types' },
    ],
    tags: ['Temporel', 'Calendrier', 'Timezone', 'UTC'],
    difficulty: 'intermediate',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Pour les horodatages d\'audit (création, modification), stockez toujours en UTC ou avec fuseau horaire (`TIMESTAMPTZ` en Postgres, `DATETIMEOFFSET` en SQL Server).',
    proTipEn: 'Store event audit timestamps in UTC or timezone-aware types to avoid Daylight Saving Time conversion anomalies.',
  },
  {
    id: 'boolean',
    termFr: 'BOOLEAN',
    termEn: 'BOOLEAN',
    category: 3,
    categoryNameFr: 'Types de données (Data Types)',
    categoryNameEn: 'SQL Data Types',
    shortDefFr: 'Type logique représentant deux états de vérité : TRUE (vrai) ou FALSE (faux), ainsi que l\'état indéterminé NULL (logique ternaire).',
    shortDefEn: 'A logical truth type accepting TRUE, FALSE, or the indeterminate NULL state under 3-valued logic.',
    fullExplanationFr: 'La norme ANSI SQL définit un type BOOLEAN gérant la logique ternaire (TRUE, FALSE, UNKNOWN). Alors que PostgreSQL le prend nativement en charge avec élégance, MySQL et SQL Server le simulent historiquement par des types numériques réduits (TINYINT / BIT).',
    fullExplanationEn: 'ANSI SQL defines BOOLEAN for 3-valued truth evaluations. While PostgreSQL natively supports it, MySQL and SQL Server map it to TINYINT(1) and BIT.',
    codeSnippet: `CREATE TABLE abonnements (
  id INT PRIMARY KEY,
  est_actif BOOLEAN NOT NULL DEFAULT TRUE,
  renouvellement_auto BOOLEAN DEFAULT FALSE
);

-- Requête de filtrage direct
SELECT id FROM abonnements WHERE est_actif IS TRUE;`,
    codeSnippetCommentFr: 'Utilisation d\'une colonne logique booléenne dans les prédicats.',
    codeSnippetCommentEn: 'Declaring boolean columns and filtering with predicate logic.',
    dialects: {
      universal: false,
      postgres: 'Type natif `BOOLEAN` (ou `BOOL`). Accepte `true`, `false`, `\'t\'`, `\'f\'`, `\'yes\'`, `\'no\'`, `\'1\'`, `\'0\'`.',
      mysql: '`BOOLEAN` et `BOOL` sont des synonymes stricts de `TINYINT(1)` (1 = TRUE, 0 = FALSE).',
      sqlServer: 'N\'a pas de type BOOLEAN SQL. Utilise le type `BIT` (0, 1 ou NULL).',
      oracle: 'Avant Oracle 23c, il n\'existait AUCUN type BOOLEAN pour les colonnes de tables SQL (on utilisait `CHAR(1)` avec `CHECK (col IN (\'Y\',\'N\'))`). Le type BOOLEAN SQL a été introduit avec Oracle 23c.',
    },
    crossReferences: [
      { id: 'where', labelFr: 'Clause WHERE', labelEn: 'WHERE Clause' },
      { id: 'check-constraint', labelFr: 'Contrainte CHECK', labelEn: 'CHECK' },
    ],
    tags: ['Logique', 'Booléen', 'Vrai/Faux'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Sur Oracle (< 23c) et SQL Server, encapsulez vos vérifications logiques dans des contraintes `CHECK` explicites pour garantir qu\'aucun chiffre autre que 0 et 1 ne soit inséré.',
    proTipEn: 'In older Oracle and SQL Server, use explicit CHECK constraints to restrict flag columns to 0/1 or Y/N.',
  },
  {
    id: 'decimal-numeric',
    termFr: 'DECIMAL / NUMERIC',
    termEn: 'DECIMAL / NUMERIC',
    category: 3,
    categoryNameFr: 'Types de données (Data Types)',
    categoryNameEn: 'SQL Data Types',
    shortDefFr: 'Nombre à virgule fixe à précision exacte, indispensable pour les calculs monétaires, comptables et scientifiques où aucun arrondi d\'imprécision n\'est toléré.',
    shortDefEn: 'An exact fixed-point numeric type, essential for financial, monetary, and scientific data where floating-point approximation is intolerable.',
    fullExplanationFr: 'Défini sous la forme `DECIMAL(p, s)` où `p` est la précision totale (nombre total de chiffres) et `s` est l\'échelle (nombre de chiffres après la virgule). Contrairement à `FLOAT` ou `REAL` (virgule flottante binaire approximative IEEE 754), `DECIMAL` stocke les chiffres en base 10 exacte.',
    fullExplanationEn: 'Declared as DECIMAL(precision, scale). Unlike imprecise binary floating-point types (FLOAT/REAL), DECIMAL stores exact decimal digits without binary rounding errors.',
    codeSnippet: `CREATE TABLE transactions (
  id INT PRIMARY KEY,
  -- 12 chiffres au total, dont 2 après la virgule (max: 9 999 999 999.99)
  montant DECIMAL(12, 2) NOT NULL,
  taux_tva NUMERIC(5, 4) NOT NULL  -- Ex: 0.2000 (20%)
);`,
    codeSnippetCommentFr: 'Définition exacte pour montants financiers et taux de taxation.',
    codeSnippetCommentEn: 'Configuring precise monetary amounts and tax percentages.',
    dialects: {
      universal: true,
      postgres: '`NUMERIC` et `DECIMAL` sont synonymes et peuvent stocker jusqu\'à 1000 chiffres de précision.',
      mysql: '`DECIMAL(M, D)` supporte jusqu\'à 65 chiffres au total.',
      sqlServer: '`DECIMAL(p, s)` supporte jusqu\'à 38 chiffres de précision.',
      oracle: 'Oracle utilise `NUMBER(p, s)`. `DECIMAL(p, s)` est un alias reconnu converti en NUMBER.',
    },
    crossReferences: [
      { id: 'int-integer', labelFr: 'INT / INTEGER', labelEn: 'INT / INTEGER' },
      { id: 'check-constraint', labelFr: 'Contrainte CHECK', labelEn: 'CHECK' },
    ],
    tags: ['Finance', 'Précision exacte', 'Virgule fixe', 'Monnaie'],
    difficulty: 'intermediate',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Ne JAMAIS utiliser `FLOAT` ou `DOUBLE` pour stocker des prix ou des soldes bancaires : les erreurs d\'arrondis binaires (ex: 0.1 + 0.2 = 0.30000000000000004) fausseraient vos bilans comptables.',
    proTipEn: 'Never use FLOAT or DOUBLE for money. Binary floating-point arithmetic errors will corrupt financial ledgers.',
  },
];
