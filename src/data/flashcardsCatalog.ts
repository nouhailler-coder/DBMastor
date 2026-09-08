import { FlashcardItem, CertificationTrackId } from '../types';
import { oracleDom01Flashcards } from './flashcardsOracleDom01';
import { oracleDom02Flashcards } from './flashcardsOracleDom02';
import { oracleDom03Flashcards } from './flashcardsOracleDom03';
import { oracleDom04Flashcards } from './flashcardsOracleDom04';
import { oracleDom05Flashcards } from './flashcardsOracleDom05';
import { oracleDom06Flashcards } from './flashcardsOracleDom06';
import { azure900Dom01Flashcards } from './flashcardsAzure900Dom01';
import { azure900Dom02Flashcards } from './flashcardsAzure900Dom02';
import { azure900Dom03Flashcards } from './flashcardsAzure900Dom03';
import { azure900Dom04Flashcards } from './flashcardsAzure900Dom04';

export interface DomainFlashcardMeta {
  domainId: string;
  domainCode: string;
  titleFr: string;
  titleEn: string;
  accentColor: string;
  weight: string;
  cardCount: number;
  available: boolean;
  descFr?: string;
  descEn?: string;
}

export const certificationFlashcardDomains: Record<CertificationTrackId, DomainFlashcardMeta[]> = {
  // ==========================================
  // 1. ORACLE DATABASE SQL (1Z0-071)
  // ==========================================
  'oracle-1z0-071': [
    {
      domainId: 'oracle-dom-01',
      domainCode: 'DOM-01',
      titleFr: 'Récupération des données avec SELECT & Fonctions scalaires',
      titleEn: 'Data Retrieval with SELECT & Single-Row Functions',
      accentColor: '#3198dc',
      weight: '~18%',
      cardCount: 100,
      available: true,
      descFr: 'Projections, alias, concaténation (||), clauses WHERE, LIKE, INSTR, SUBSTR, ROUND, TRUNC et calculs sur dates.',
      descEn: 'Projections, aliases, concatenation, WHERE, LIKE, INSTR, SUBSTR, ROUND, TRUNC and date arithmetic.',
    },
    {
      domainId: 'oracle-dom-02',
      domainCode: 'DOM-02',
      titleFr: 'Fonctions de conversion & Expressions conditionnelles DECODE / CASE',
      titleEn: 'Conversion Functions & Conditional Expressions DECODE / CASE',
      accentColor: '#89ceff',
      weight: '~14%',
      cardCount: 100,
      available: true,
      descFr: 'TO_CHAR, TO_DATE, TO_NUMBER avec modèles de formats (RR vs YY). Logique conditionnelle imbriquée.',
      descEn: 'TO_CHAR, TO_DATE, TO_NUMBER format masks (RR vs YY). Nested conditional logic.',
    },
    {
      domainId: 'oracle-dom-03',
      domainCode: 'DOM-03',
      titleFr: 'Agrégats, GROUP BY & Clause HAVING',
      titleEn: 'Aggregates, GROUP BY & HAVING Clause',
      accentColor: '#4edea3',
      weight: '~16%',
      cardCount: 100,
      available: true,
      descFr: 'COUNT(*), AVG, SUM avec gestion des NULL. Règle d\'or : colonnes dans le SELECT non agrégées obligatoires dans GROUP BY.',
      descEn: 'COUNT(*), AVG, SUM and NULL handling. Mandatory non-aggregated SELECT columns in GROUP BY.',
    },
    {
      domainId: 'oracle-dom-04',
      domainCode: 'DOM-04',
      titleFr: 'Jointures relationnelles ANSI & Syntaxe propriétaire Oracle (+)',
      titleEn: 'ANSI Relational Joins & Proprietary Oracle (+) Syntax',
      accentColor: '#f59e0b',
      weight: '~18%',
      cardCount: 100,
      available: true,
      descFr: 'INNER, LEFT, RIGHT, FULL OUTER JOIN, CROSS JOIN, NATURAL JOIN, clause USING vs ON, self-joins et limitation du (+).',
      descEn: 'INNER, LEFT, RIGHT, FULL OUTER JOIN, CROSS JOIN, NATURAL JOIN, USING vs ON clauses, self-joins and (+) limits.',
    },
    {
      domainId: 'oracle-dom-05',
      domainCode: 'DOM-05',
      titleFr: 'Sous-requêtes simples, corrélées & Opérateurs d\'ensemble',
      titleEn: 'Single-row, Multiple-row, Correlated Subqueries & Set Operators',
      accentColor: '#a78bfa',
      weight: '~18-20%',
      cardCount: 100,
      available: true,
      descFr: 'Sous-requêtes scalaires, opérateurs IN, ANY, ALL, corrélations EXISTS/NOT EXISTS, UNION, UNION ALL, INTERSECT, MINUS.',
      descEn: 'Scalar subqueries, IN, ANY, ALL, correlated EXISTS/NOT EXISTS, UNION, UNION ALL, INTERSECT, MINUS.',
    },
    {
      domainId: 'oracle-dom-06',
      domainCode: 'DOM-06',
      titleFr: 'Objets de schéma, DDL, DML & Contrôle transactionnel',
      titleEn: 'Schema Objects, DDL, DML & Transaction Control',
      accentColor: '#f43f5e',
      weight: '~14-16%',
      cardCount: 100,
      available: true,
      descFr: 'Tables, contraintes (PK, FK, CHECK), vues, séquences, synonymes, MERGE, INSERT ALL, TRUNCATE, FLASHBACK, COMMIT/ROLLBACK.',
      descEn: 'Tables, constraints, views, sequences, synonyms, MERGE, INSERT ALL, TRUNCATE, FLASHBACK, COMMIT/ROLLBACK.',
    },
  ],

  // ==========================================
  // 2. MICROSOFT AZURE DATA FUNDAMENTALS (DP-900)
  // ==========================================
  'azure-dp-900': [
    {
      domainId: 'azure-900-dom-01',
      domainCode: 'DOM-01',
      titleFr: 'Concepts fondamentaux des données (Structured, Semi-Structured, Unstructured)',
      titleEn: 'Core Data Concepts (Structured, Semi-Structured, Unstructured)',
      accentColor: '#4edea3',
      weight: '25-30%',
      cardCount: 100,
      available: true,
      descFr: 'Différences formats (Relationnel, JSON, Parquet, CSV, Vidéo), caractéristiques Batch vs Streaming, et garanties ACID vs BASE.',
      descEn: 'Data formats (Relational, JSON, Parquet, CSV), Batch vs Streaming characteristics, ACID vs BASE transaction guarantees.',
    },
    {
      domainId: 'azure-900-dom-02',
      domainCode: 'DOM-02',
      titleFr: 'Services de données relationnelles sur Azure',
      titleEn: 'Relational Data Services on Azure',
      accentColor: '#3198dc',
      weight: '20-25%',
      cardCount: 100,
      available: true,
      descFr: 'Azure SQL Database, SQL Managed Instance, SQL Server sur VM Azure, et serveurs flexibles PostgreSQL / MySQL.',
      descEn: 'Azure SQL Database, SQL Managed Instance, SQL Server on Azure VMs, and Flexible Servers for PostgreSQL / MySQL.',
    },
    {
      domainId: 'azure-900-dom-03',
      domainCode: 'DOM-03',
      titleFr: 'Services de données non relationnelles (Azure Cosmos DB & Storage)',
      titleEn: 'Non-Relational Data Services (Azure Cosmos DB & Storage)',
      accentColor: '#89ceff',
      weight: '15-20%',
      cardCount: 100,
      available: true,
      descFr: 'Azure Cosmos DB et ses APIs (NoSQL, MongoDB, Cassandra, Gremlin, Table), Blob Storage et ses niveaux (Hot, Cool, Cold, Archive).',
      descEn: 'Azure Cosmos DB and its APIs (NoSQL, MongoDB, Cassandra, Gremlin, Table), Azure Blob Storage tiers (Hot, Cool, Cold, Archive).',
    },
    {
      domainId: 'azure-900-dom-04',
      domainCode: 'DOM-04',
      titleFr: 'Charges de travail analytiques, Azure Synapse & Power BI',
      titleEn: 'Analytics Workloads, Azure Synapse & Power BI',
      accentColor: '#f59e0b',
      weight: '25-30%',
      cardCount: 100,
      available: true,
      descFr: 'Entrepôts de données modernes (Data Warehouses vs Data Lakes), Azure Synapse Analytics, Azure Data Factory (ETL/ELT), Databricks et Power BI.',
      descEn: 'Modern Data Warehouses vs Data Lakes, Azure Synapse Analytics, Azure Data Factory (ETL/ELT), Databricks and Power BI.',
    },
  ],

  // ==========================================
  // 3. AZURE DATABASE ADMINISTRATOR (DP-300 / DP-800)
  // ==========================================
  'azure-dp-800': [
    {
      domainId: 'azure-800-dom-01',
      domainCode: 'DOM-01',
      titleFr: 'Planification, Déploiement & Migration des ressources de données Azure',
      titleEn: 'Planning, Deploying & Migrating Azure Data Resources',
      accentColor: '#3198dc',
      weight: '25-30%',
      cardCount: 0,
      available: false,
      descFr: 'Dimensionnement des vCores, DTUs, tiers Hyperscale, Business Critical, pools élastiques et migration DMS.',
      descEn: 'vCore sizing, DTUs, Hyperscale tiers, Business Critical, elastic pools and Azure Database Migration Service.',
    },
    {
      domainId: 'azure-800-dom-02',
      domainCode: 'DOM-02',
      titleFr: 'Sécurité, Chiffrement & Conformité (TDE, Always Encrypted, RBAC)',
      titleEn: 'Security, Encryption & Compliance (TDE, Always Encrypted, RBAC)',
      accentColor: '#4edea3',
      weight: '15-20%',
      cardCount: 0,
      available: false,
      descFr: 'Authentification Entra ID (Azure AD), pare-feu, points de terminaison privés, Dynamic Data Masking, TDE et Always Encrypted.',
      descEn: 'Entra ID (Azure AD) auth, firewalls, Private Endpoints, Dynamic Data Masking, TDE with BYOK and Always Encrypted.',
    },
    {
      domainId: 'azure-800-dom-03',
      domainCode: 'DOM-03',
      titleFr: 'Surveillance, Optimisation & Réglage des performances (Query Store)',
      titleEn: 'Monitoring, Optimization & Performance Tuning (Query Store)',
      accentColor: '#f59e0b',
      weight: '20-25%',
      cardCount: 0,
      available: false,
      descFr: 'Vues de gestion dynamique (DMV), Query Store, forçage de plans d\'exécution, statistiques et index fragmentés.',
      descEn: 'Dynamic Management Views (DMVs), Query Store, execution plan forcing, statistics and index maintenance.',
    },
    {
      domainId: 'azure-800-dom-04',
      domainCode: 'DOM-04',
      titleFr: 'Haute disponibilité & Reprise après sinistre (Always On, Géo-réplication)',
      titleEn: 'High Availability & Disaster Recovery (Always On, Geo-Replication)',
      accentColor: '#a78bfa',
      weight: '20-25%',
      cardCount: 0,
      available: false,
      descFr: 'Groupes de basculement automatique (Auto-failover groups), réplication géo-distribuée, sauvegardes LTR et PITR.',
      descEn: 'Auto-failover groups, active geo-replication, Point-in-time Restore (PITR) and Long-Term Retention (LTR).',
    },
  ],

  // ==========================================
  // 4. POSTGRESQL EDB CERTIFIED ASSOCIATE
  // ==========================================
  'postgres-edb': [
    {
      domainId: 'pg-edb-dom-01',
      domainCode: 'DOM-01',
      titleFr: 'Architecture interne du serveur & Processus d\'arrière-plan',
      titleEn: 'Internal Server Architecture & Background Processes',
      accentColor: '#4edea3',
      weight: '20%',
      cardCount: 0,
      available: false,
      descFr: 'Mémoire partagée (Shared Buffers, WAL Buffers), mémoire locale (work_mem), processus Postmaster, BgWriter, Checkpointer, WalWriter et Autovacuum.',
      descEn: 'Shared memory (Shared Buffers, WAL Buffers), per-operation work_mem, Postmaster, BgWriter, Checkpointer, WalWriter and Autovacuum.',
    },
    {
      domainId: 'pg-edb-dom-02',
      domainCode: 'DOM-02',
      titleFr: 'Installation, Initialisation (initdb) & postgresql.conf',
      titleEn: 'Installation, Initialization (initdb) & postgresql.conf',
      accentColor: '#3198dc',
      weight: '20%',
      cardCount: 0,
      available: false,
      descFr: 'Création de cluster avec initdb, arborescence $PGDATA, rechargement des paramètres (pg_reload_conf vs redémarrage), et réglage des paramètres clés.',
      descEn: 'initdb cluster creation, $PGDATA hierarchy, parameter reload (pg_reload_conf vs restart) and tuning.',
    },
    {
      domainId: 'pg-edb-dom-03',
      domainCode: 'DOM-03',
      titleFr: 'Sécurité, Rôles, Authentification pg_hba.conf & Droits',
      titleEn: 'Security, Roles, pg_hba.conf Authentication & Privileges',
      accentColor: '#89ceff',
      weight: '20%',
      cardCount: 0,
      available: false,
      descFr: 'Fichier de contrôle d\'accès hôte pg_hba.conf (méthodes scram-sha-256, md5, reject), gestion des rôles (LOGIN, SUPERUSER) et hiérarchie GRANT/REVOKE.',
      descEn: 'pg_hba.conf host access file (scram-sha-256, md5, reject), roles (LOGIN, SUPERUSER) and GRANT/REVOKE hierarchy.',
    },
    {
      domainId: 'pg-edb-dom-04',
      domainCode: 'DOM-04',
      titleFr: 'Maintenance, MVCC, VACUUM, ANALYZE & Réindexation',
      titleEn: 'Maintenance, MVCC, VACUUM, ANALYZE & Reindexing',
      accentColor: '#f59e0b',
      weight: '20%',
      cardCount: 0,
      available: false,
      descFr: 'Modèle de concurrence multi-version (xmin, xmax, dead tuples, bloat), VACUUM standard vs VACUUM FULL, ANALYZE, autovacuum et REINDEX CONCURRENTLY.',
      descEn: 'Multi-version concurrency (xmin, xmax, dead tuples, bloat), VACUUM vs VACUUM FULL, ANALYZE and REINDEX CONCURRENTLY.',
    },
    {
      domainId: 'pg-edb-dom-05',
      domainCode: 'DOM-05',
      titleFr: 'Sauvegardes physiques, logiques (pg_dump) & Réplication streaming',
      titleEn: 'Physical & Logical Backups (pg_dump) & Streaming Replication',
      accentColor: '#a78bfa',
      weight: '20%',
      cardCount: 0,
      available: false,
      descFr: 'Sauvegarde logique avec pg_dump / pg_dumpall, sauvegarde physique à chaud avec pg_basebackup, archivage WAL et réplication physique en continu.',
      descEn: 'Logical backups with pg_dump / pg_dumpall, online physical backup with pg_basebackup, WAL archiving and streaming replication.',
    },
  ],

  // ==========================================
  // 5. ORACLE MYSQL 8.0 DBA (1Z0-908)
  // ==========================================
  'mysql-80-dba': [
    {
      domainId: 'mysql-908-dom-01',
      domainCode: 'DOM-01',
      titleFr: 'Architecture MySQL 8.0, Moteur InnoDB & Gestion de la mémoire',
      titleEn: 'MySQL 8.0 Architecture, InnoDB Engine & Memory Management',
      accentColor: '#f59e0b',
      weight: '20%',
      cardCount: 0,
      available: false,
      descFr: 'Sous-système serveur vs moteurs de stockage plaggables. InnoDB Buffer Pool, Log Buffer, Redo Log, Undo Tablespaces et Doublewrite Buffer.',
      descEn: 'Server subsystem vs storage engines. InnoDB Buffer Pool, Log Buffer, Redo Log, Undo Tablespaces and Doublewrite Buffer.',
    },
    {
      domainId: 'mysql-908-dom-02',
      domainCode: 'DOM-02',
      titleFr: 'Configuration du serveur (my.cnf), Variables & Journaux',
      titleEn: 'Server Configuration (my.cnf), System Variables & Logs',
      accentColor: '#3198dc',
      weight: '20%',
      cardCount: 0,
      available: false,
      descFr: 'Fichier my.cnf, variables système dynamiques (SET PERSIST vs SET GLOBAL), journal des erreurs, slow query log et journal binaire (binlog).',
      descEn: 'my.cnf file, dynamic system variables (SET PERSIST vs SET GLOBAL), error log, slow query log and binary log (binlog).',
    },
    {
      domainId: 'mysql-908-dom-03',
      domainCode: 'DOM-03',
      titleFr: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
      titleEn: 'Security, User Management, Roles & Authentication',
      accentColor: '#4edea3',
      weight: '20%',
      cardCount: 0,
      available: false,
      descFr: 'Plugin caching_sha2_password, syntaxe de compte \'user\'@\'host\', rôles SQL, privilèges statiques et dynamiques, composant Password Validation.',
      descEn: 'caching_sha2_password plugin, account syntax \'user\'@\'host\', SQL roles, static and dynamic privileges, password validation component.',
    },
    {
      domainId: 'mysql-908-dom-04',
      domainCode: 'DOM-04',
      titleFr: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
      titleEn: 'Physical (MEB) & Logical Backup (mysqldump) & Restore',
      accentColor: '#89ceff',
      weight: '20%',
      cardCount: 0,
      available: false,
      descFr: 'Sauvegardes logiques avec mysqldump et mysqlpump (options --single-transaction, --master-data), sauvegarde physique en ligne avec MySQL Enterprise Backup.',
      descEn: 'Logical backups with mysqldump / mysqlpump (--single-transaction), online physical backup with MySQL Enterprise Backup (MEB).',
    },
    {
      domainId: 'mysql-908-dom-05',
      domainCode: 'DOM-05',
      titleFr: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
      titleEn: 'Binary Replication (GTID), InnoDB Cluster Group Replication & HA',
      accentColor: '#a78bfa',
      weight: '20%',
      cardCount: 0,
      available: false,
      descFr: 'Réplication asynchrone et semi-synchrone, identifiants de transactions globales (GTID), topologie Primaire/Secondaire, et réplication de groupe (Group Replication).',
      descEn: 'Asynchronous and semi-synchronous replication, Global Transaction Identifiers (GTID), Primary/Secondary topology and Group Replication.',
    },
  ],
};

export const oracle1z0071DomainList: DomainFlashcardMeta[] = certificationFlashcardDomains['oracle-1z0-071'];

export const getCertificationDomains = (certId: CertificationTrackId): DomainFlashcardMeta[] => {
  return certificationFlashcardDomains[certId] || certificationFlashcardDomains['oracle-1z0-071'];
};

export const getTotalFlashcardsForCert = (certId: CertificationTrackId): number => {
  const domains = getCertificationDomains(certId);
  return domains.reduce((sum, d) => sum + d.cardCount, 0);
};

export const allFlashcardsCatalog: Record<string, FlashcardItem[]> = {
  'oracle-dom-01': oracleDom01Flashcards,
  'oracle-dom-02': oracleDom02Flashcards,
  'oracle-dom-03': oracleDom03Flashcards,
  'oracle-dom-04': oracleDom04Flashcards,
  'oracle-dom-05': oracleDom05Flashcards,
  'oracle-dom-06': oracleDom06Flashcards,
  'azure-900-dom-01': azure900Dom01Flashcards,
  'azure-900-dom-02': azure900Dom02Flashcards,
  'azure-900-dom-03': azure900Dom03Flashcards,
  'azure-900-dom-04': azure900Dom04Flashcards,
};

