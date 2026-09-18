import { FlashcardItem } from '../types';

export const mysql908Dom04Part1Flashcards: FlashcardItem[] = [
  // =========================================================================
  // SECTION 1 : STRATÉGIES DE SAUVEGARDE, RPO/RTO & CONCEPTS (Cartes 1 à 12)
  // Types (Logique vs Physique, Hot/Warm/Cold, Full/Incr/Diff), RPO/RTO, Snapshots
  // =========================================================================
  {
    id: 'fc-mysql908-dom04-001',
    cardNumber: 1,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Sauvegarde Logique vs Sauvegarde Physique : Comparaison fondamentale',
    difficulty: 'easy',
    tags: ['Backup', 'Logical', 'Physical', 'Strategy'],
    front: {
      question: 'Quelle est la différence fondamentale entre une sauvegarde logique (ex: mysqldump) et une sauvegarde physique (ex: MySQL Enterprise Backup) dans MySQL ?',
      hint: 'L\'une exporte des instructions SQL lisibles (CREATE, INSERT), l\'autre copie directement les fichiers de données bruts (.ibd, redo log).',
    },
    back: {
      answer: 'Différences majeures entre les deux approches :\n\n- **Sauvegarde Logique (Logical Backup)** :\n  - Exporte la structure et le contenu sous forme de texte ou SQL (`CREATE TABLE`, `INSERT INTO`) ou de fichiers plats délimités (CSV/TSV).\n  - **Avantages** : Indépendante de l\'architecture matérielle, version et OS ; facilement inspectable, éditable et permet de restaurer une table unique sur un serveur différent.\n  - **Inconvénients** : Lente à l\'export et **extrêmement lente à restaurer** (le serveur doit rejouer toutes les insertions, reconstruire les index et générer du redo log).\n- **Sauvegarde Physique (Physical Backup)** :\n  - Copie directe des blocs et fichiers disques bruts (`.ibd`, `ibdata1`, fichiers de configuration, journaux Redo).\n  - **Avantages** : Sauvegarde et **restauration ultra-rapides** (simple copie de fichiers disque à disque), idéale pour les bases de plusieurs téraoctets.\n  - **Inconvénients** : Fichiers plus volumineux, dépendance au format interne du moteur de stockage, non inspectable avec un éditeur de texte.',
      explanation: 'En production, la politique de sauvegarde moderne combine une sauvegarde physique quotidienne pour le RTO et des dumps logiques ciblés pour l\'archivage.',
      examTrap: 'Une sauvegarde logique ne contient pas les données internes d\'InnoDB comme les pages de buffer ou l\'historique des transactions annulées.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Backup and Recovery Types',
    },
  },
  {
    id: 'fc-mysql908-dom04-002',
    cardNumber: 2,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Niveaux d\'impact opérationnel : Hot, Warm et Cold Backups',
    difficulty: 'easy',
    tags: ['Hot Backup', 'Warm Backup', 'Cold Backup', 'Availability'],
    front: {
      question: 'Que désignent les termes Hot Backup, Warm Backup et Cold Backup dans le contexte de l\'administration MySQL ?',
      hint: 'Se classe selon l\'impact sur la disponibilité en lecture et en écriture des clients connectés.',
    },
    back: {
      answer: 'Classification selon l\'impact sur les clients :\n\n- **Hot Backup (Sauvegarde à chaud / En ligne)** :\n  - Le serveur continue de fonctionner normalement pendant la sauvegarde.\n  - Les applications clientes peuvent effectuer des lectures **ET des écritures (INSERT, UPDATE, DELETE)** sans interruption.\n  - Exemples : MySQL Enterprise Backup (`mysqlbackup`), Percona XtraBackup, ou `mysqldump` avec l\'option `--single-transaction` sur tables InnoDB.\n- **Warm Backup (Sauvegarde à tiède)** :\n  - Le serveur reste en cours d\'exécution, les clients peuvent **lire** des données, mais **toutes les écritures sont bloquées** le temps du processus.\n  - Exemple : sauvegarde avec `FLUSH TABLES WITH READ LOCK;`.\n- **Cold Backup (Sauvegarde à froid / Hors ligne)** :\n  - Le démon `mysqld` est **complètement arrêté**.\n  - Aucune lecture ni écriture n\'est possible. Copie exacte et garantie sans aucune transaction en vol.',
      explanation: 'En production 24/7, seules les sauvegardes à chaud (Hot Backups) sont tolérées par les accords de niveau de service (SLA).',
      examTrap: 'mysqldump n\'est un Hot Backup QUE pour les tables InnoDB avec --single-transaction ! Sur du MyISAM ou d\'autres moteurs sans MVCC, il provoque un verrou de lecture (Warm Backup).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Hot, Warm, and Cold Backups',
    },
  },
  {
    id: 'fc-mysql908-dom04-003',
    cardNumber: 3,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Métriques RPO et RTO : Définition et impact sur l\'architecture de sauvegarde',
    difficulty: 'medium',
    tags: ['RPO', 'RTO', 'Disaster Recovery', 'SLA'],
    front: {
      question: 'Que signifient les acronymes RPO et RTO, et comment influencent-ils la fréquence des sauvegardes et la rétention du Binary Log ?',
      hint: 'RPO mesure la quantité maximale de données perdues admise en temps ; RTO mesure le temps nécessaire pour rétablir le service.',
    },
    back: {
      answer: 'Définitions et implications architecturales :\n\n- **RPO (Recovery Point Objective - Perte de données maximale admissible)** :\n  - Détermine le point temporel le plus ancien auquel les données doivent être restaurées en cas de crash (ex: "perte maximale de 5 minutes").\n  - Pour atteindre un RPO quasi-nul ($RPO \\approx 0$), il est **obligatoire d\'activer le Binary Log** avec `sync_binlog = 1` et de répliquer ou sauvegarder en continu les binlogs hors du serveur.\n- **RTO (Recovery Time Objective - Temps de rétablissement maximal admissible)** :\n  - Détermine la durée tolérée pour remettre la base de données en ligne et opérationnelle (ex: "remise en service en moins de 30 minutes").\n  - Pour minimiser le RTO sur une base de 10 To, une **sauvegarde physique** est obligatoire car un dump logique nécessiterait des dizaines d\'heures de rejeu SQL.',
      explanation: 'Le choix entre sauvegarde logique, physique, snapshots de stockage et réplication découle directement des exigences de RPO et RTO fixées par l\'entreprise.',
      examTrap: 'Une sauvegarde complète quotidienne seule sans Binary Log donne un RPO de 24 heures ! Le Binary Log est indispensable pour réduire le RPO à la dernière seconde.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Disaster Recovery: RPO and RTO',
    },
  },
  {
    id: 'fc-mysql908-dom04-004',
    cardNumber: 4,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Sauvegardes Complètes, Différentielles et Incrémentales',
    difficulty: 'medium',
    tags: ['Full Backup', 'Incremental', 'Differential', 'Strategy'],
    front: {
      question: 'Quelle est la différence entre une sauvegarde différentielle et une sauvegarde incrémentale dans MySQL Enterprise Backup ?',
      hint: 'L\'incrémentale sauvegarde les changements depuis la dernière sauvegarde (quelle qu\'elle soit), la différentielle sauvegarde depuis la dernière complète.',
    },
    back: {
      answer: 'Comparaison des types de sauvegardes périodiques :\n\n- **Sauvegarde Complète (Full Backup)** :\n  - Copie l\'intégralité des données et fichiers de l\'instance à un instant $T_0$. Sert de référence absolue pour toutes les restaurations.\n- **Sauvegarde Incrémentale (Incremental Backup)** :\n  - Copie uniquement les pages de données modifiées (LSN supérieur) depuis **la dernière sauvegarde réussie**, qu\'elle soit complète ou incrémentale.\n  - *Restauration* : Nécessite la Complète initiale + **TOUTES les incrémentales intermédiaires dans l\'ordre strict**.\n- **Sauvegarde Différentielle (Differential Backup)** :\n  - Copie toutes les pages modifiées depuis **la dernière sauvegarde Complète** de référence.\n  - *Restauration* : Nécessite uniquement la Complète initiale + **la toute dernière sauvegarde différentielle**.',
      explanation: 'L\'incrémentale est plus rapide à l\'export mais plus longue et risquée à restaurer (si un incrément est corrompu, la chaîne est rompue). La différentielle simplifie la restauration.',
      examTrap: 'Dans MySQL Enterprise Backup, les sauvegardes incrémentales utilisent le Log Sequence Number (LSN) des pages InnoDB pour détecter les blocs altérés.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Incremental and Differential Backups',
    },
  },
  {
    id: 'fc-mysql908-dom04-005',
    cardNumber: 5,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Principe du Point-In-Time Recovery (PITR)',
    difficulty: 'medium',
    tags: ['PITR', 'Binary Log', 'Recovery', 'Architecture'],
    front: {
      question: 'Quel est le principe fondamental du Point-In-Time Recovery (PITR) et quels sont les deux composants techniques indispensables pour le réaliser ?',
      hint: 'Une sauvegarde de référence (complète) et la séquence ininterrompue des journaux binaires (Binlogs) postérieurs à la sauvegarde.',
    },
    back: {
      answer: 'Principe fondamental du PITR (Restauration à un instant précis) :\n\n- Permet de restaurer la base de données dans l\'état exact où elle se trouvait à une seconde ou position binaire précise (ex: juste avant qu\'un administrateur n\'exécute un `DROP TABLE` accidentel à 14:32:15).\n- **Les deux composants obligatoires** :\n  1. **Une sauvegarde cohérente de référence** (physique ou logique) capturée à un instant connu ($T_{backup}$).\n  2. **Tous les Binary Logs (Binlogs)** générés de façon continue depuis le point de terminaison de cette sauvegarde jusqu\'à l\'instant ciblé ($T_{cible}$).\n- **Processus** :\n  1. Restaurer la sauvegarde de référence.\n  2. Extraire et rejouer les transactions des binlogs via `mysqlbinlog` en s\'arrêtant strictement avant la transaction fautive.',
      explanation: 'Sans journaux binaires actifs, il est impossible de restaurer les données modifiées entre deux sauvegardes complètes.',
      examTrap: 'Si un seul fichier binlog de la chaîne est manquant ou purgé prématurément, le PITR ne peut pas dépasser ce point de rupture.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Point-in-Time (Incremental) Recovery',
    },
  },
  {
    id: 'fc-mysql908-dom04-006',
    cardNumber: 6,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Sauvegarde par Snapshot de volume de stockage (LVM / SAN / Cloud)',
    difficulty: 'hard',
    tags: ['Snapshot', 'LVM', 'LOCK INSTANCE FOR BACKUP', 'Storage'],
    front: {
      question: 'Quelles commandes MySQL doivent obligatoirement encadrer la prise d\'un snapshot de volume de stockage (LVM / EBS / Cloud Disk) pour garantir la cohérence des tablespaces ?',
      codeSnippet: `-- Procédure recommandée sous MySQL 8.0 :
LOCK INSTANCE FOR BACKUP;
-- (Prise du snapshot de stockage de quelques secondes)
UNLOCK INSTANCE;`,
      hint: 'LOCK INSTANCE FOR BACKUP empêche les suppressions et renommages de fichiers sans bloquer les DML ordinaires.',
    },
    back: {
      answer: 'Procédure pour snapshots de volume de stockage :\n\n- **Méthode moderne recommandée sous MySQL 8.0** :\n  ```sql\n  LOCK INSTANCE FOR BACKUP;\n  -- Déclencher le snapshot LVM / AWS EBS / GCP Persistent Disk\n  UNLOCK INSTANCE;\n  ```\n  - `LOCK INSTANCE FOR BACKUP` interdit les opérations DDL (`ALTER`, `DROP`, `RENAME`), les modifications de tablespaces et les suppressions de fichiers sous-jacents, **tout en laissant passer les transactions `INSERT`, `UPDATE`, `DELETE`**.\n  - Le snapshot résultant correspond à un état "crash-consistent" identique à une coupure de courant : au démarrage, InnoDB effectuera son crash-recovery automatique via le Redo Log inclus dans le snapshot.\n- **Ancienne méthode stricte** : `FLUSH TABLES WITH READ LOCK;` (bloquait absolument toutes les écritures, risquant de saturer les connexions applicatives).',
      explanation: 'Tous les fichiers de données InnoDB, le Redo Log et le Undo Tablespace doivent impérativement résider sur le même volume snapshoté (ou snapshot cohérent multi-volumes).',
      examTrap: 'Ne prenez JAMAIS un snapshot de disque sans verrouiller l\'instance au préalable, sinon les pages peuvent être copiées dans un état déchiré (torn pages) non récupérable.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Making Backups Using Storage Snapshots',
    },
  },
  {
    id: 'fc-mysql908-dom04-007',
    cardNumber: 7,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Validation périodique et exercices de restauration (Restore Drills)',
    difficulty: 'easy',
    tags: ['Drills', 'Compliance', 'Audit', 'Best Practices'],
    front: {
      question: 'Pourquoi une stratégie de sauvegarde est-elle considérée comme non fiable tant que des tests de restauration automatisés réguliers ne sont pas exécutés ?',
      hint: 'Une sauvegarde n\'a de valeur que si elle peut être restaurée avec succès dans les temps impartis.',
    },
    back: {
      answer: 'Importance vitale de la validation des sauvegardes :\n\n- **La règle d\'or du DBA** : *"L\'état d\'une sauvegarde n\'est jamais garanti tant que la restauration n\'a pas été testée et vérifiée avec succès."*\n- **Risques fréquents découverts lors d\'un vrai sinistre** :\n  - Fichier de sauvegarde corrompu ou tronqué (espace disque insuffisant à la sauvegarde).\n  - Clé de chiffrement Keyring manquante pour les tablespaces TDE chiffrés.\n  - Chaîne de journaux binaires rompue (fichier purgé par `binlog_expire_logs_seconds`).\n  - Restauration durant 14 heures alors que le SLA RTO n\'en accorde que 2.\n- **Bonne pratique industrielle** : Automatiser hebdomadairement la restauration d\'un backup sur un serveur de test isolé (sandbox), démarrer `mysqld`, exécuter `CHECK TABLE` et valider les sommes de contrôle.',
      explanation: 'Les réglementations (ISO 27001, SOC2, PCI-DSS) exigent la preuve formelle et tracée d\'exercices de restauration réguliers.',
      examTrap: 'Vérifier uniquement le code retour 0 de mysqldump ou la présence du fichier .sql/.tar ne garantit en rien que les données sont intègres.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Disaster Recovery Planning',
    },
  },
  {
    id: 'fc-mysql908-dom04-008',
    cardNumber: 8,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Rétention et purge des Binary Logs en relation avec la politique de sauvegarde',
    difficulty: 'medium',
    tags: ['binlog_expire_logs_seconds', 'Purge', 'Retention', 'PITR'],
    front: {
      question: 'Comment calibrer la durée de rétention des journaux binaires (binlog_expire_logs_seconds) pour sécuriser le PITR sans saturer le disque ?',
      codeSnippet: `-- Exemple : conservation pendant 7 jours (7 * 86400 = 604800 secondes) :
SET PERSIST binlog_expire_logs_seconds = 604800;`,
      hint: 'La rétention des binlogs doit toujours couvrir au minimum la durée séparant deux sauvegardes complètes plus une marge de sécurité.',
    },
    back: {
      answer: 'Règles de rétention des Binary Logs pour le PITR :\n\n- La durée de rétention des fichiers binlog (définie par `binlog_expire_logs_seconds` sous MySQL 8.0) **doit impérativement être supérieure à l\'intervalle entre deux sauvegardes complètes**.\n- *Exemple de dimensionnement* :\n  - Si une sauvegarde complète est effectuée chaque dimanche à 02h00, la rétention minimale absolue doit être de **8 à 14 jours**.\n  - Si la sauvegarde de dimanche échoue ou est corrompue, les binlogs permettent encore de faire un PITR depuis la sauvegarde complète du dimanche précédent.\n- **Purge manuelle sécurisée** : Avant de supprimer d\'anciens binlogs avec `PURGE BINARY LOGS`, le DBA doit s\'assurer qu\'une sauvegarde complète postérieure a été validée.',
      explanation: 'Sous MySQL 8.0, binlog_expire_logs_seconds remplace l\'ancienne variable en jours expire_logs_days.',
      examTrap: 'Ne supprimez JAMAIS un fichier de binlog avec la commande OS "rm binlog.*" ! Utilisez toujours PURGE BINARY LOGS pour maintenir l\'intégrité de binlog.index.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: binlog_expire_logs_seconds',
    },
  },
  {
    id: 'fc-mysql908-dom04-009',
    cardNumber: 9,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Impact du chiffrement TDE sur la procédure de sauvegarde',
    difficulty: 'hard',
    tags: ['TDE', 'Keyring', 'Encryption', 'Backup', 'Security'],
    front: {
      question: 'Qu\'advient-il d\'une sauvegarde physique de tablespaces InnoDB chiffrés (TDE) si le fichier de Keyring du serveur n\'est pas sauvegardé simultanément ?',
      hint: 'Les données chiffrées sont définitivement irrécupérables sans la clé maîtresse stockée dans le Keyring.',
    },
    back: {
      answer: 'Impact critique du chiffrement TDE sur les sauvegardes :\n\n- Les tablespaces chiffrés (`ENCRYPTION = \'Y\'`) contiennent des clés de tablespace chiffrées par la **Master Key** du serveur.\n- La Master Key réside **exclusivement dans le coffre Keyring** (`keyring_file`, `component_keyring_file`, Oracle Key Vault), et **JAMAIS** dans les fichiers `.ibd` de données.\n- **Conséquence fatale** : Si le serveur de production est détruit et que vous disposez d\'une sauvegarde physique des fichiers de données mais que le fichier de Keyring (ou l\'accès au KMS) est perdu, **la totalité de la base de données est définitivement perdue et indéchiffrable**.\n- **Obligation absolue** : Sauvegarder et versionner le Keyring (`keyring_file_data`) dans un emplacement sécurisé hors site à chaque modification ou rotation de clé.',
      explanation: 'MySQL Enterprise Backup prend en charge l\'inclusion sécurisée des clés de chiffrement avec l\'option `--keyring`.',
      examTrap: 'mysqldump extrait les données en clair (déchiffrées en RAM par mysqld) : son fichier .sql n\'a donc pas besoin du Keyring pour être restauré, mais il doit lui-même être protégé/chiffré au repos.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Backing Up Encrypted Tablespaces',
    },
  },
  {
    id: 'fc-mysql908-dom04-010',
    cardNumber: 10,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Sauvegarde hors-site et règle du 3-2-1',
    difficulty: 'easy',
    tags: ['3-2-1 Rule', 'Offsite', 'Disaster Recovery', 'Security'],
    front: {
      question: 'En quoi consiste la règle de sauvegarde universelle "3-2-1" appliquée aux bases de données MySQL d\'entreprise ?',
      hint: '3 copies, 2 supports différents, 1 copie hors-site (off-site / cloud distant).',
    },
    back: {
      answer: 'La règle universelle "3-2-1" appliquée à MySQL :\n\n- **3 copies des données** : Les données de production en cours d\'exécution + au moins 2 copies de sauvegardes distinctes.\n- **2 supports / médias différents** : Par exemple, une copie sur stockage disque local ou NAS/SAN haute performance (pour un RTO de restauration immédiat) et une copie sur stockage objet Cloud (S3, OCI Object Storage) ou bande magnétique.\n- **1 copie hors-site (Off-site)** : Au moins une sauvegarde doit résider dans un datacenter géographiquement distant ou une région cloud différente, pour survivre à un sinistre majeur (incendie du datacenter, inondation, cyberattaque par ransomware sur le réseau local).\n- **Complément moderne (+1)** : 1 copie immuable (WORM - Write Once, Read Many) protégée contre toute suppression ou chiffrement par un pirate.',
      explanation: 'Indispensable pour garantir la résilience de l\'entreprise face aux désastres physiques et aux cyberattaques.',
      examTrap: 'Conserver les sauvegardes sur le même serveur ou le même SAN que les données de production viole la règle et annule toute protection en cas de crash du contrôleur RAID.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Backup Strategies and Best Practices',
    },
  },
  {
    id: 'fc-mysql908-dom04-011',
    cardNumber: 11,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Sauvegardes de tablespaces de transport (Transportable Tablespaces)',
    difficulty: 'hard',
    tags: ['Transportable Tablespaces', 'FLUSH TABLES FOR EXPORT', 'Granular Backup'],
    front: {
      question: 'Comment extraire physiquement une table InnoDB individuelle d\'une instance pour la transférer et la restaurer sur une autre instance ?',
      codeSnippet: `-- Sur le serveur source :
FLUSH TABLES my_table FOR EXPORT;
-- (Copie de my_table.ibd et my_table.cfg)
UNLOCK TABLES;

-- Sur le serveur cible :
ALTER TABLE my_table DISCARD TABLESPACE;
-- (Copie des fichiers dans le datadir cible)
ALTER TABLE my_table IMPORT TABLESPACE;`,
      hint: 'Utilisation de FLUSH TABLES ... FOR EXPORT et de la commande ALTER TABLE ... IMPORT TABLESPACE.',
    },
    back: {
      answer: 'Procédure des Transportable Tablespaces (TTS) :\n\n1. **Sur l\'instance Source** :\n   - Prérequis : la table doit être en `file-per-table` (`innodb_file_per_table = ON`).\n   - Exécuter : `FLUSH TABLES nom_table FOR EXPORT;`.\n   - InnoDB purge le buffer pool sur disque, fige le fichier `.ibd` et génère un fichier de métadonnées binaires `.cfg`.\n   - Copier `nom_table.ibd` et `nom_table.cfg` vers la machine cible, puis exécuter `UNLOCK TABLES;`.\n2. **Sur l\'instance Cible** :\n   - Créer la table avec la même structure DDL exacte : `CREATE TABLE nom_table (...);`.\n   - Détacher le tablespace vide : `ALTER TABLE nom_table DISCARD TABLESPACE;`.\n   - Déposer les fichiers `.ibd` et `.cfg` dans le répertoire de la base du `datadir` cible.\n   - Réintégrer le tablespace : `ALTER TABLE nom_table IMPORT TABLESPACE;`.\n   - InnoDB ajuste les LSN et met à jour le dictionnaire de données.',
      explanation: 'Permet de restaurer ou déplacer une table de 500 Go en quelques secondes sans passer par un export SQL.',
      examTrap: 'Le fichier .cfg est indispensable pour synchroniser les métadonnées et le schéma d\'index ! Sans lui, IMPORT TABLESPACE peut échouer ou être moins sécurisé.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Transportable Tablespaces',
    },
  },
  {
    id: 'fc-mysql908-dom04-012',
    cardNumber: 12,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Gestion du verrouillage global : FLUSH TABLES WITH READ LOCK (FTWRL)',
    difficulty: 'medium',
    tags: ['FTWRL', 'Locks', 'Global Lock', 'Troubleshooting'],
    front: {
      question: 'Quels sont les effets et les dangers majeurs de la commande "FLUSH TABLES WITH READ LOCK;" sur une instance en production ?',
      codeSnippet: `FLUSH TABLES WITH READ LOCK;
-- Opération de sauvegarde...
UNLOCK TABLES;`,
      hint: 'Bloque toutes les opérations d\'écriture (DML et DDL) sur l\'ensemble du serveur et vide les tables ouvertes du cache.',
    },
    back: {
      answer: 'Fonctionnement et risques de `FLUSH TABLES WITH READ LOCK` (FTWRL) :\n\n- **Effets** :\n  1. Ferme toutes les tables ouvertes du cache et force l\'écriture des modifications sur disque.\n  2. Positionne un **verrou de lecture global (Global Read Lock)** sur l\'ensemble de l\'instance.\n  3. Interdit absolument toutes les requêtes en écriture (`INSERT`, `UPDATE`, `DELETE`, `CREATE`, `DROP`, `ALTER`, `COMMIT`).\n  4. Seules les requêtes en lecture seule (`SELECT`) sont autorisées.\n- **Dangers majeurs en production** :\n  - Si une transaction longue ou un `SELECT` lourd était déjà en cours lors du lancement de FTWRL, la commande attend la fin de ce SELECT.\n  - Pendant cette attente, **toutes les autres requêtes en écriture s\'empilent derrière**.\n  - En quelques secondes, le pool `max_connections` est saturé et le serveur refuse toute nouvelle connexion (panne générale de l\'application).',
      explanation: 'Sous MySQL 8.0, pour les sauvegardes physiques, FTWRL doit être remplacé par `LOCK INSTANCE FOR BACKUP`.',
      examTrap: 'Si la session qui a exécuté FTWRL se déconnecte inopinément (timeout réseau), le verrou est automatiquement libéré par le serveur.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - FLUSH TABLES Statement',
    },
  },

  // =========================================================================
  // SECTION 2 : SAUVEGARDE LOGIQUE AVEC MYSQLEDUMP (Cartes 13 à 32)
  // Options --single-transaction, --source-data / --master-data, --routines,
  // --triggers, --events, --quick, --extended-insert, --hex-blob, --set-gtid-purged
  // =========================================================================
  {
    id: 'fc-mysql908-dom04-013',
    cardNumber: 13,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'L\'option vitale --single-transaction dans mysqldump',
    difficulty: 'medium',
    tags: ['mysqldump', '--single-transaction', 'InnoDB', 'MVCC'],
    front: {
      question: 'Comment fonctionne l\'option --single-transaction de mysqldump et pourquoi permet-elle une sauvegarde cohérente à chaud des tables InnoDB sans bloquer les écritures ?',
      codeSnippet: `$ mysqldump --single-transaction --all-databases > full_dump.sql`,
      hint: 'Bascule la session en niveau d\'isolation REPEATABLE READ et démarre une transaction avec snapshot MVCC.',
    },
    back: {
      answer: 'Fonctionnement de `--single-transaction` :\n\n1. Avant de lire les tables, `mysqldump` configure le niveau d\'isolation de sa session à **`REPEATABLE READ`** et démarre une transaction avec `START TRANSACTION /*!40100 WITH CONSISTENT SNAPSHOT */`.\n2. Grâce au mécanisme **MVCC (Multi-Version Concurrency Control)** d\'InnoDB, la session de dump lit une vue statique et cohérente des données telle qu\'elle existait au moment exact du snapshot.\n3. **Non-bloquant** : Les autres transactions peuvent continuer à insérer, modifier ou supprimer des lignes dans les tables InnoDB sans aucun blocage pendant toute la durée du dump.\n4. Les modifications concurrentes génèrent de nouvelles versions dans les Undo Logs qu\'InnoDB masque à la session de dump.',
      explanation: 'C\'est l\'option fondamentale à inclure systématiquement pour sauvegarder des bases InnoDB en production.',
      examTrap: 'Attention : --single-transaction ne protège PAS les tables non-transactionnelles (ex: MyISAM ou tables temporaires système) ! Pour elles, les données peuvent être incohérentes.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: --single-transaction',
    },
  },
  {
    id: 'fc-mysql908-dom04-014',
    cardNumber: 14,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Interaction entre DDL concurrent et --single-transaction',
    difficulty: 'hard',
    tags: ['mysqldump', 'DDL', 'Metadata Locks', 'Troubleshooting'],
    front: {
      question: 'Que se passe-t-il si un utilisateur exécute une instruction DDL (ALTER TABLE ou DROP TABLE) sur une table pendant que mysqldump --single-transaction est en cours ?',
      codeSnippet: `-- Erreur fréquente lors d'un dump en production :
mysqldump: Error 1412: Table definition has changed, please retry transaction 
when dumping table 'orders' at row: 450000`,
      hint: 'La transaction cohérente détecte une modification de métadonnées incompatible dans le Data Dictionary et échoue.',
    },
    back: {
      answer: 'Conséquence d\'une modification DDL pendant `--single-transaction` :\n\n- Bien que `--single-transaction` protège contre les modifications de données (DML), **elle ne peut pas protéger contre les altérations de structure (DDL)**.\n- Si un `ALTER TABLE`, `DROP TABLE`, `TRUNCATE TABLE` ou `OPTIMIZE TABLE` intervient sur une table non encore lue par le dump :\n  1. L\'instruction DDL acquiert un verrou exclusif de métadonnées (MDL - Metadata Lock).\n  2. Lorsque `mysqldump` tente d\'accéder à la table modifiée, la version de schéma en mémoire ne correspond plus à celle du snapshot initial de la transaction.\n  3. Le dump avorte brutalement avec l\'erreur `ERROR 1412 (HY000): Table definition has changed, please retry transaction`.\n- **Règle d\'exploitation** : Interdire tout déploiement de schéma ou migration DDL pendant les fenêtres de sauvegarde.',
      explanation: 'Les verrous de métadonnées (MDL) garantissent que les données ne sont pas lues avec une définition de colonnes incohérente.',
      examTrap: 'Ne lancez jamais de scripts d\'ALTER TABLE ou de maintenance périodique en même temps que vos sauvegardes de nuit.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump and Metadata Locking',
    },
  },
  {
    id: 'fc-mysql908-dom04-015',
    cardNumber: 15,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Enregistrement des coordonnées du Binlog : --source-data (vs --master-data)',
    difficulty: 'medium',
    tags: ['--source-data', '--master-data', 'Binlog', 'Replication', 'PITR'],
    front: {
      question: 'À quoi sert l\'option --source-data (anciennement --master-data) de mysqldump et quelle est la différence entre les valeurs 1 et 2 ?',
      codeSnippet: `$ mysqldump --single-transaction --source-data=2 --all-databases > backup.sql`,
      hint: 'Écrit le nom du fichier binlog et la position exacte (ou les GTID) correspondant à l\'état du dump.',
    },
    back: {
      answer: 'Rôle de `--source-data` (remplaçant officiel de `--master-data` sous 8.0) :\n\n- Enregistre dans l\'en-tête du fichier dump le nom du fichier journal binaire et la **position exacte** du serveur source au moment du dump (indispensable pour le PITR et pour provisionner un réplica).\n- **Valeur `1`** :\n  - Écrit la commande SQL directe non commentée :\n    `CHANGE REPLICATION SOURCE TO SOURCE_LOG_FILE=\'binlog.000003\', SOURCE_LOG_POS=450;`\n  - Lors de la restauration sur un réplica, cette commande est exécutée automatiquement.\n- **Valeur `2` (La plus courante)** :\n  - Écrit la même commande mais **encadrée par des commentaires SQL** (`-- CHANGE REPLICATION SOURCE...`).\n  - Permet d\'inspecter visuellement les coordonnées dans le fichier sans configurer automatiquement de réplication lors de la restauration.',
      explanation: 'Couplée avec --single-transaction, mysqldump acquiert brièvement un verrou global pour lire la position du binlog avant d\'ouvrir son snapshot.',
      examTrap: 'Sous MySQL 8.0.23+, l\'option --master-data est dépréciée au profit de la terminologie inclusive --source-data.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: --source-data',
    },
  },
  {
    id: 'fc-mysql908-dom04-016',
    cardNumber: 16,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Inclusion des objets programmés : --routines, --triggers et --events',
    difficulty: 'easy',
    tags: ['mysqldump', '--routines', '--triggers', '--events', 'Stored Objects'],
    front: {
      question: 'Parmi les Triggers, les Procédures/Fonctions stockées (Routines) et les Tâches planifiées (Events), lesquels sont inclus par défaut dans mysqldump et quelles options permettent de les forcer ?',
      codeSnippet: `$ mysqldump --routines --events --triggers --all-databases > full.sql`,
      hint: 'Les triggers sont inclus par défaut, mais pas les routines ni les événements !',
    },
    back: {
      answer: 'Comportement par défaut et options indispensables :\n\n- **Triggers (Déclencheurs)** :\n  - **Inclus par défaut** dans `mysqldump` (`--triggers=TRUE`).\n  - Pour les désactiver expressément : `--skip-triggers`.\n- **Routines (Procédures stockées & Fonctions)** :\n  - **EXCLUES par défaut !**\n  - Doivent être explicitement demandées avec l\'option **`--routines`** (ou `-R`).\n- **Events (Tâches planifiées de l\'Event Scheduler)** :\n  - **EXCLUS par défaut !**\n  - Doivent être explicitement demandés avec l\'option **`--events`** (ou `-E`).\n\n*Règle d\'or du DBA* : Toujours exécuter `mysqldump --routines --events --triggers ...` pour ne rien perdre du patrimoine applicatif.',
      explanation: 'Oublier --routines et --events est l\'une des erreurs les plus fréquentes en production, entraînant la perte de toute la logique métier lors d\'un restore.',
      examTrap: 'Pour dumper les routines, l\'utilisateur doit disposer du privilège SELECT sur mysql.proc (historique) ou du privilège SHOW_ROUTINE sous MySQL 8.0.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: Stored Object Options',
    },
  },
  {
    id: 'fc-mysql908-dom04-017',
    cardNumber: 17,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Séparation de la structure et des données : --no-data vs --no-create-info',
    difficulty: 'easy',
    tags: ['mysqldump', '--no-data', '--no-create-info', 'DDL', 'DML'],
    front: {
      question: 'Quelles options de mysqldump permettent d\'extraire uniquement le schéma (DDL pur) ou inversement uniquement les données (DML pur) ?',
      codeSnippet: `-- Dump de structure seule :
$ mysqldump --no-data my_database > schema.sql

-- Dump des données seules :
$ mysqldump --no-create-info my_database > data.sql`,
      hint: '--no-data (ou -d) omet les lignes INSERT ; --no-create-info (ou -t) omet les CREATE TABLE.',
    },
    back: {
      answer: 'Options de découpage DDL / DML :\n\n- **`--no-data` (ou `-d`)** :\n  - Exporte **uniquement la définition des structures** (`CREATE TABLE`, `CREATE VIEW`, index, contraintes, et routines si combiné avec `--routines`).\n  - N\'écrit aucune ligne d\'insertion `INSERT INTO`.\n  - Idéal pour initialiser un environnement de développement vierge ou auditer le dictionnaire de données dans Git.\n- **`--no-create-info` (ou `-t`)** :\n  - Exporte **uniquement les données** sous forme d\'instructions `INSERT INTO`.\n  - N\'écrit aucune instruction `CREATE TABLE` ni `DROP TABLE`.\n  - Idéal pour recharger des données dans une structure déjà existante.',
      explanation: 'La combinaison de ces options permet de recréer les tables d\'abord, de charger les données ensuite, et d\'ajouter les contraintes clés étrangères à la fin.',
      examTrap: 'Si vous restaurez un dump généré avec --no-create-info sur une base où les tables n\'existent pas encore, toutes les requêtes échoueront avec "Table does not exist".',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: Data and Schema Options',
    },
  },
  {
    id: 'fc-mysql908-dom04-018',
    cardNumber: 18,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Optimisation de la mémoire et du débit : option --quick',
    difficulty: 'medium',
    tags: ['mysqldump', '--quick', 'Memory', 'OOM', 'Performance'],
    front: {
      question: 'Quel problème critique l\'option --quick de mysqldump résout-elle lors de la sauvegarde de tables contenant des dizaines de millions de lignes ?',
      codeSnippet: `$ mysqldump --quick --single-transaction db_huge > dump.sql`,
      hint: 'Force mysqldump à récupérer les lignes du serveur une par une au lieu de bufferiser toute la table en mémoire RAM côté client.',
    },
    back: {
      answer: 'Rôle de l\'option `--quick` (ou `-q`) :\n\n- **Sans `--quick`** : Par défaut en API C MySQL, le client utilise `mysql_store_result()`, ce qui force le client à charger **l\'intégralité du résultat de la table en mémoire RAM** avant de commencer à écrire la première ligne sur le disque. Sur une table de 50 Go, le processus `mysqldump` sature la RAM et est tué par l\'OOM-Killer Linux.\n- **Avec `--quick`** : Utilise la fonction API `mysql_use_result()` : le client récupère et écrit les lignes **flux par flux (streaming ligne par ligne)** au fur et à mesure de leur lecture.\n- L\'empreinte mémoire RAM de `mysqldump` reste négligeable et constante ($< 50$ Mo), quelle que soit la taille de la table.\n- **Note** : `--quick` est activé par défaut dans le groupe d\'options standards de `mysqldump` sous MySQL 8.0.',
      explanation: 'Permet de dumper des tables de plusieurs centaines de gigaoctets sans saturer la mémoire du client.',
      examTrap: 'Ne confondez pas : --quick ne rend pas la requête plus rapide sur le disque, il évite la mise en cache RAM massive côté client.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: --quick',
    },
  },
  {
    id: 'fc-mysql908-dom04-019',
    cardNumber: 19,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Optimisation de la vitesse de réinsertion : --extended-insert',
    difficulty: 'medium',
    tags: ['mysqldump', '--extended-insert', 'Bulk Insert', 'Performance'],
    front: {
      question: 'Pourquoi l\'option --extended-insert est-elle cruciale pour la vitesse de restauration d\'un dump logique SQL ?',
      codeSnippet: `-- Avec --extended-insert (par défaut) :
INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie');

-- Sans --extended-insert (--skip-extended-insert) :
INSERT INTO users VALUES (1, 'Alice');
INSERT INTO users VALUES (2, 'Bob');
INSERT INTO users VALUES (3, 'Charlie');`,
      hint: 'Regroupe des milliers de lignes dans une seule instruction INSERT à valeurs multiples, réduisant la charge réseau, le parsing et les commits.',
    },
    back: {
      answer: 'Bénéfices de `--extended-insert` (syntaxe multi-lignes) :\n\n1. **Réduction massive de l\'overhead SQL** : Exécuter 10 000 instructions `INSERT INTO ...` individuelles impose au parseur 10 000 analyses syntaxiques, 10 000 allers-retours protocole et 10 000 mises à jour d\'index.\n2. **Vitesse de restauration décuplée (10x à 50x plus rapide)** : En regroupant les valeurs par paquets de plusieurs mégaoctets (calibrés par `net_buffer_length` et `max_allowed_packet`), InnoDB insère les blocs de manière séquentielle et beaucoup plus efficace.\n3. **Taille du fichier réduite** : Évite de répéter la chaîne `INSERT INTO nom_table VALUES` pour chaque ligne enregistrée.\n- Activé par défaut sous MySQL 8.0.',
      explanation: 'Désactiver cette option (--skip-extended-insert) n\'a d\'intérêt que pour déboguer ligne par ligne ou pour faire des diffs textuels Git.',
      examTrap: 'Pour restaurer un gros dump généré avec --extended-insert, le serveur cible doit avoir un max_allowed_packet suffisant (ex: 64M ou 128M) pour accepter les très gros paquets SQL.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: --extended-insert',
    },
  },
  {
    id: 'fc-mysql908-dom04-020',
    cardNumber: 20,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Préservation des données binaires : l\'option --hex-blob',
    difficulty: 'medium',
    tags: ['mysqldump', '--hex-blob', 'BLOB', 'Corruption', 'Charset'],
    front: {
      question: 'Quel risque court-on lors de la sauvegarde et restauration de colonnes BLOB, VARBINARY ou images sans l\'option --hex-blob ?',
      codeSnippet: `$ mysqldump --hex-blob --single-transaction my_app > backup.sql`,
      hint: 'Les caractères nuls, retours chariots et octets non-ASCII peuvent être corrompus par les conversions de jeux de caractères.',
    },
    back: {
      answer: 'Rôle indispensable de `--hex-blob` :\n\n- **Problème sans `--hex-blob`** :\n  - `mysqldump` écrit les données binaires sous forme de chaînes de caractères brutes échappées avec des antislashs.\n  - Lors de la restauration, si le client ou le serveur de destination utilise un jeu de caractères différent (ex: UTF-8 vs Latin1), les octets 0x00, retours à la ligne ou séquences binaires d\'images (PNG, PDF) ou clés cryptographiques peuvent être réencodés et **irrémédiablement corrompus**.\n- **Solution avec `--hex-blob`** :\n  - Convertit toutes les colonnes binaires (`BINARY`, `VARBINARY`, `BLOB`, `BIT`) en notation hexadécimale sécurisée à base de chiffres hexadécimaux purs (ex: `0xFFD8FFE0...`).\n  - Aucun risque d\'altération par les filtres de jeux de caractères texte.',
      explanation: 'Augmente légèrement la taille du fichier dump pour les champs binaires, mais garantit une intégrité binaire à 100%.',
      examTrap: 'Obligatoire dès que la base stocke des documents, images, clés privées ou jetons binaires UUID en format compact.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: --hex-blob',
    },
  },
  {
    id: 'fc-mysql908-dom04-021',
    cardNumber: 21,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Gestion des GTID dans mysqldump : --set-gtid-purged',
    difficulty: 'hard',
    tags: ['mysqldump', '--set-gtid-purged', 'GTID', 'Replication'],
    front: {
      question: 'Que contrôle l\'option --set-gtid-purged de mysqldump et quelles sont les conséquences des valeurs AUTO, ON, OFF et COMMENTED ?',
      codeSnippet: `$ mysqldump --set-gtid-purged=OFF my_db > table_copy.sql`,
      hint: 'Contrôle si le dump doit inclure l\'instruction SET @@GLOBAL.gtid_purged pour initialiser les GTID sur le serveur cible.',
    },
    back: {
      answer: 'Rôle de `--set-gtid-purged` (Indispensable sous MySQL 8.0 avec GTID) :\n\n- **`AUTO` (Par défaut)** :\n  - Si les GTID sont activés sur le serveur source, ajoute l\'instruction `SET @@GLOBAL.gtid_purged = \'...\'` au début du dump.\n- **`ON`** : Force l\'écriture de `SET @@GLOBAL.gtid_purged`. Échoue si les GTID ne sont pas activés sur le serveur source.\n- **`OFF`** :\n  - N\'inclut **aucune mention** de GTID dans le dump.\n  - **Cas d\'usage classique** : Quand vous voulez juste copier une table ou une base vers un autre serveur sans écraser son historique GTID global !\n- **`COMMENTED` (MySQL 8.0.23+)** :\n  - Écrit la valeur sous forme de commentaire désactivé, permettant une exécution manuelle contrôlée.',
      explanation: 'Sur un serveur cible où gtid_mode=ON et où des transactions ont déjà eu lieu, exécuter un dump avec set-gtid-purged=ON échoue car gtid_purged ne peut être configuré que sur une instance vierge.',
      examTrap: 'Piège d\'examen classique : tenter de restaurer un dump pris avec --set-gtid-purged=ON sur un serveur de dev non vide déclenche : ERROR 3546: @@GLOBAL.GTID_PURGED cannot be changed.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: --set-gtid-purged',
    },
  },
  {
    id: 'fc-mysql908-dom04-022',
    cardNumber: 22,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Sauvegarde de plusieurs bases ou de toute l\'instance : --databases vs --all-databases',
    difficulty: 'easy',
    tags: ['mysqldump', '--databases', '--all-databases', 'Syntax'],
    front: {
      question: 'Quelle est la différence fondamentale dans le fichier généré entre "mysqldump db1 db2" et "mysqldump --databases db1 db2" ?',
      codeSnippet: `-- Commande A :
$ mysqldump db1 table1 table2 > backupA.sql

-- Commande B :
$ mysqldump --databases db1 db2 > backupB.sql`,
      hint: '--databases ajoute les instructions CREATE DATABASE IF NOT EXISTS et USE db dans le dump.',
    },
    back: {
      answer: 'Différence critique de syntaxe :\n\n- **Sans `--databases` (`mysqldump db1 table1 table2`)** :\n  - Le premier argument est la base, les arguments suivants sont interprétés comme des noms de **tables** spécifiques de cette base.\n  - Le fichier dump généré ne contient **AUCUNE instruction `CREATE DATABASE` ni `USE`**.\n  - Lors de la restauration, l\'administrateur doit obligatoirement pré-créer la base et la cibler : `mysql target_db < backupA.sql`.\n- **Avec `--databases` (ou `-B`) (`mysqldump --databases db1 db2`)** :\n  - Tous les arguments sont traités comme des noms de **bases de données distinctes**.\n  - Le dump inclut automatiquement `CREATE DATABASE IF NOT EXISTS db1; USE db1;` avant les tables de chaque schéma.\n- **Avec `--all-databases` (ou `-A`)** : Dumpe l\'intégralité des bases du serveur, y compris la base système `mysql`.',
      explanation: 'Omettre --databases en listant deux bases génère une erreur "Table db2 doesn\'t exist in db1".',
      examTrap: 'mysqldump db1 db2 sans -B cherchera à exporter la table "db2" de la base "db1" !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: Database Selection Syntax',
    },
  },
  {
    id: 'fc-mysql908-dom04-023',
    cardNumber: 23,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Gestion des dépendances de vues (Views) dans mysqldump',
    difficulty: 'medium',
    tags: ['mysqldump', 'Views', 'Dependencies', 'CREATE ALGORITHM'],
    front: {
      question: 'Comment mysqldump résout-il le problème des dépendances croisées entre vues (une vue faisant référence à une autre vue qui n\'est pas encore créée) ?',
      hint: 'Il crée d\'abord des tables temporaires factices avec la même structure de colonnes, puis les remplace à la fin par les vraies définitions de vues.',
    },
    back: {
      answer: 'Mécanisme de résolution des vues par `mysqldump` en deux passes :\n\n1. **Première passe (Tables factices / Mock Tables)** :\n   - Pour chaque vue, `mysqldump` génère d\'abord une instruction `CREATE TABLE ...` temporaire factice avec la liste exacte des noms et types de colonnes.\n   - Cela permet à d\'autres vues ou procédures créées ultérieurement dans le script de valider leurs liaisons sans déclencher d\'erreur `Table doesn\'t exist`.\n2. **Deuxième passe (Remplacement par la vue réelle)** :\n   - Tout à la fin du fichier dump, `mysqldump` supprime la table factice (`DROP TABLE IF EXISTS nom_vue;`) et exécute le véritable `CREATE ALGORITHM=UNDEFINED DEFINER=... VIEW nom_vue AS SELECT ...;`.\n- Ce mécanisme garantit une restauration fluide quel que soit l\'ordre d\'imbrication des vues.',
      explanation: 'Sans cette technique, un script de dump échouerait si la vue B interrogeait la vue A définie plus bas dans le fichier.',
      examTrap: 'Si le dump s\'arrête au milieu suite à une erreur, les tables factices subsistent et vous perdez la définition de la vue.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump and Views Handling',
    },
  },
  {
    id: 'fc-mysql908-dom04-024',
    cardNumber: 24,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Restauration d\'un fichier de dump logique SQL',
    difficulty: 'easy',
    tags: ['mysql', 'Restore', 'Logical Restore', 'CLI'],
    front: {
      question: 'Quelles sont les méthodes en ligne de commande pour réimporter un dump logique compressé ou brut dans une instance MySQL ?',
      codeSnippet: `# Méthode 1 : Fichier brut
$ mysql -u root -p < full_dump.sql

# Méthode 2 : Fichier compressé gzip à la volée
$ zcat full_dump.sql.gz | mysql -u root -p

# Méthode 3 : Depuis le client interactif
mysql> source /backup/full_dump.sql;`,
      hint: 'Redirection standard shell <, commande zcat/gunzip en tube ou instruction source dans le client mysql.',
    },
    back: {
      answer: 'Méthodes de restauration d\'un dump SQL :\n\n1. **Redirection shell directe** :\n   `mysql -u root -p [nom_base] < backup.sql`\n   (Si le dump a été généré sans `--databases`, il faut obligatoirement spécifier la base cible sur la ligne de commande).\n2. **Décompression et flux direct (évite d\'écrire un fichier décompressé de 100 Go)** :\n   `gunzip -c backup.sql.gz | mysql -u root -p`\n   ou `pv backup.sql.gz | zcat | mysql -u root -p` (permet de visualiser la vitesse de progression avec `pv`).\n3. **Dans le client interactif `mysql`** :\n   `mysql> SOURCE /chemin/vers/backup.sql;`\n   (Attention : le client charge l\'intégralité du script de manière synchrone).',
      explanation: 'Le rejeu s\'effectue sous forme de transactions SQL ordinaires qui reconstruisent l\'ensemble des index et génèrent du redo log.',
      examTrap: 'Pour accélérer une restauration massive, désactiver temporairement les vérifications de clés étrangères et la journalisation binaire dans la session de restauration.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Reloading SQL-Format Backups',
    },
  },
  {
    id: 'fc-mysql908-dom04-025',
    cardNumber: 25,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Accélération de la restauration : foreign_key_checks et unique_checks',
    difficulty: 'medium',
    tags: ['Performance', 'foreign_key_checks', 'unique_checks', 'Optimization'],
    front: {
      question: 'Pourquoi mysqldump inclut-il systématiquement "SET FOREIGN_KEY_CHECKS = 0;" et "SET UNIQUE_CHECKS = 0;" au début des fichiers générés ?',
      codeSnippet: `/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;`,
      hint: 'Permet d\'insérer les tables dans n\'importe quel ordre sans blocage de contraintes et accélère les écritures.',
    },
    back: {
      answer: 'Raison de la désactivation temporaire des contrôles :\n\n1. **Éviter les erreurs d\'ordre d\'insertion (Circular Dependencies)** :\n   - Si la table `commandes` fait référence à `clients`, mais que `commandes` est restaurée en premier, chaque `INSERT` échouerait avec une violation de clé étrangère.\n   - Avec `FOREIGN_KEY_CHECKS = 0`, les données sont insérées sans vérifier l\'existence de la ligne parente pendant le chargement.\n2. **Performance d\'insertion brute** :\n   - `FOREIGN_KEY_CHECKS = 0` et `UNIQUE_CHECKS = 0` désactivent la vérification immédiate des doublons dans les index secondaires pour chaque ligne.\n   - Permet à InnoDB d\'utiliser massivement le **Change Buffer** en mémoire pour fusionner les écritures d\'index, réduisant les I/O aléatoires par 10.',
      explanation: 'À la fin du dump, mysqldump rétablit les valeurs d\'origine avec `SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;`.',
      examTrap: 'Si votre dump est corrompu ou incomplet, désactiver FOREIGN_KEY_CHECKS peut masquer des orphelins dans vos données restaurées.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Speed of INSERT Statements',
    },
  },
  {
    id: 'fc-mysql908-dom04-026',
    cardNumber: 26,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Désactivation de la journalisation binaire lors de la restauration : sql_log_bin = 0',
    difficulty: 'medium',
    tags: ['sql_log_bin', 'Replication', 'Restore', 'Binlog'],
    front: {
      question: 'Pourquoi et comment doit-on désactiver l\'écriture des requêtes dans le Binary Log lors de la restauration d\'un dump sur un serveur autonome ou réplica ?',
      codeSnippet: `mysql> SET SESSION sql_log_bin = 0;
mysql> SOURCE /backups/large_database.sql;
mysql> SET SESSION sql_log_bin = 1;`,
      hint: 'Évite de doubler les I/O disques en re-générant des centaines de Go de binlogs inutiles ou de polluer les réplicas en cascade.',
    },
    back: {
      answer: 'Intérêt de `SET SESSION sql_log_bin = 0;` lors d\'un restore :\n\n1. **Économie massive d\'I/O et d\'espace disque** :\n   - Restaurer un dump de 200 Go réécrira sinon 200 Go d\'événements binaires dans les fichiers binlog du serveur, saturant inutilement le disque et gaspillant les IOPS.\n2. **Éviter la réplication involontaire** :\n   - Si le serveur est un nœud source (Primary), réimporter un backup avec `sql_log_bin = ON` transmettrait toutes les instructions de restauration à l\'ensemble des serveurs réplicas du cluster, provoquant un écrasement ou des conflits d\'intégrité.\n3. **Privilège requis** : Sous MySQL 8.0, positionner `sql_log_bin = 0` nécessite le privilège dynamique **`SYSTEM_VARIABLES_ADMIN`** ou `SESSION_VARIABLES_ADMIN` (ou `SUPER`).',
      explanation: 'Cette bonne pratique divise le temps de restauration par deux en supprimant l\'écriture synchrone dans le binlog.',
      examTrap: 'Ne désactivez PAS sql_log_bin si vous êtes précisément en train de monter un nouveau maître dont les réplicas doivent recevoir les tables de référence.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: sql_log_bin',
    },
  },
  {
    id: 'fc-mysql908-dom04-027',
    cardNumber: 27,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Sauvegarde sélective de tables avec exclusion : --ignore-table',
    difficulty: 'easy',
    tags: ['mysqldump', '--ignore-table', 'Selective Backup', 'Optimization'],
    front: {
      question: 'Comment exclure des tables volumineuses de logs ou temporaires lors d\'un export mysqldump ?',
      codeSnippet: `$ mysqldump --databases ecom \
  --ignore-table=ecom.audit_log_2025 \
  --ignore-table=ecom.http_sessions > ecom_clean.sql`,
      hint: 'Option --ignore-table sous la forme exacte nom_base.nom_table répétée pour chaque table à ignorer.',
    },
    back: {
      answer: 'Utilisation de l\'option `--ignore-table` :\n\n- **Syntaxe stricte** :\n  `--ignore-table=nom_base.nom_table`\n  (Le nom de la base et le nom de la table doivent obligatoirement être spécifiés ensemble, séparés par un point).\n- Pour exclure plusieurs tables, il faut répéter l\'option autant de fois que nécessaire :\n  `--ignore-table=db.t1 --ignore-table=db.t2`.\n- **Effet** : La table désignée est totalement ignorée (ni sa structure `CREATE TABLE` ni ses données ne figureront dans le fichier dump).\n- Permet d\'économiser des dizaines de gigaoctets en omettant les tables d\'audit ou de cache reconstruisibles.',
      explanation: 'Idéal pour concevoir des sauvegardes allégées pour les environnements de recette et de pré-production.',
      examTrap: 'Si une vue fait référence à une table que vous avez ignorée, la restauration du dump générera une erreur lors de la création de la vue.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: --ignore-table',
    },
  },
  {
    id: 'fc-mysql908-dom04-028',
    cardNumber: 28,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Filtrage de données par clause WHERE dans mysqldump',
    difficulty: 'medium',
    tags: ['mysqldump', '--where', 'Selective Backup', 'Filtering'],
    front: {
      question: 'Comment extraire uniquement les données récentes (ex: les commandes passées depuis le 1er janvier 2026) avec mysqldump ?',
      codeSnippet: `$ mysqldump --single-transaction ecom orders \
  --where="date_creation >= '2026-01-01'" > orders_recent.sql`,
      hint: 'Option --where="condition SQL valide".',
    },
    back: {
      answer: 'Option `--where` (ou `-w`) de `mysqldump` :\n\n- Permet de spécifier une clause conditionnelle SQL valide appliquée à la lecture des lignes exportées :\n  `mysqldump db_name tbl_name --where="statut = \'ACTIF\' AND id > 1000"`.\n- **Fonctionnement interne** : Lors du dump de la table, `mysqldump` substitue la requête par défaut `SELECT * FROM table` par `SELECT * FROM table WHERE condition`.\n- **Attention** : Cette condition est appliquée à **toutes les tables** exportées lors de la commande. Il est donc fortement recommandé de n\'utiliser `--where` qu\'en ciblant une seule table spécifique.',
      explanation: 'Très pratique pour extraire un échantillon représentatif de données pour reproduire un bug en environnement de test.',
      examTrap: 'Si vous appliquez --where="date_commande > \'2026-01-01\'" sur plusieurs tables dont certaines ne possèdent pas la colonne date_commande, le dump échouera avec "Unknown column in where clause".',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: --where',
    },
  },
  {
    id: 'fc-mysql908-dom04-029',
    cardNumber: 29,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Export de données sous forme délimitée tabulaire (CSV/TSV) : --tab',
    difficulty: 'hard',
    tags: ['mysqldump', '--tab', 'CSV', 'TSV', 'Fast Load'],
    front: {
      question: 'Que produit l\'option --tab de mysqldump et pourquoi offre-t-elle des vitesses de restauration très supérieures au format SQL classique ?',
      codeSnippet: `$ mysqldump --tab=/var/lib/mysql-files/ --single-transaction ecom`,
      hint: 'Génère deux fichiers par table : un fichier .sql pour la structure et un fichier .txt délimité pour les données.',
    },
    back: {
      answer: 'Fonctionnement de l\'option `--tab=directory_path` :\n\n1. **Génération de 2 fichiers distincts par table** :\n   - `table.sql` : Contient l\'instruction `CREATE TABLE` générée par le client `mysqldump`.\n   - `table.txt` : Contient les données brutes sous forme de texte délimité par des tabulations, généré directement par le serveur via `SELECT ... INTO OUTFILE`.\n2. **Restauration ultra-rapide** :\n   - Au lieu d\'exécuter des millions de `INSERT INTO`, les données sont rechargées avec l\'instruction native haute vitesse **`LOAD DATA INFILE`**.\n   - Les débits d\'ingestion sont 5 à 10 fois plus rapides qu\'un dump SQL standard.',
      explanation: 'Nécessite que le répertoire de destination soit accessible par mysqld et configuré dans la variable secure_file_priv.',
      examTrap: 'Ne fonctionne que si mysqldump est exécuté sur la même machine physique que le serveur mysqld (ou si un partage NFS/SMB partagé existe), car le serveur écrit lui-même les fichiers .txt.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: --tab Option',
    },
  },
  {
    id: 'fc-mysql908-dom04-030',
    cardNumber: 30,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Privilèges minimaux nécessaires pour exécuter mysqldump',
    difficulty: 'medium',
    tags: ['mysqldump', 'Privileges', 'Security', 'Least Privilege'],
    front: {
      question: 'Quels sont les privilèges minimaux stricts requis pour qu\'un utilisateur puisse exécuter une sauvegarde cohérente avec mysqldump --single-transaction ?',
      codeSnippet: `GRANT SELECT, RELOAD, LOCK TABLES, SHOW VIEW, \n      PROCESS, TRIGGER ON *.* TO 'backup_user'@'localhost';`,
      hint: 'SELECT pour lire les données, RELOAD pour FLUSH TABLES, SHOW VIEW pour les vues, TRIGGER pour les déclencheurs, LOCK TABLES pour les verrous.',
    },
    back: {
      answer: 'Privilèges requis pour un compte `mysqldump` :\n\n- **`SELECT`** sur toutes les tables à sauvegarder (lecture des lignes).\n- **`SHOW VIEW`** pour inspecter et extraire la définition des vues SQL.\n- **`TRIGGER`** pour sauvegarder les déclencheurs.\n- **`LOCK TABLES`** (si `--single-transaction` n\'est pas utilisé ou pour les tables non-InnoDB).\n- **`RELOAD`** obligatoire si `--source-data` ou `--master-data` est spécifié (pour exécuter le verrou bref de lecture de binlog).\n- **`PROCESS`** pour afficher les informations de threads et optimiser les flux.\n- Pour les routines stockées : **`SHOW_ROUTINE`** (ou `SELECT` sur `mysql.proc` en pré-8.0).',
      explanation: 'Respecte le principe du moindre privilège sans accorder les pleins pouvoirs d\'administration.',
      examTrap: 'Si vous omettez RELOAD alors que vous passez --source-data, mysqldump échoue immédiatement avec "Access denied; you need RELOAD privilege".',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump: Privileges Required',
    },
  },
  {
    id: 'fc-mysql908-dom04-031',
    cardNumber: 31,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Compression des dumps à la volée',
    difficulty: 'easy',
    tags: ['mysqldump', 'Compression', 'gzip', 'Storage'],
    front: {
      question: 'Quelle est la méthode recommandée pour compresser un export mysqldump à la volée sans saturer l\'espace disque intermédiaire ?',
      codeSnippet: `$ mysqldump --single-transaction --all-databases \
  | gzip -c > /backups/full_dump_$(date +%F).sql.gz`,
      hint: 'Utilisation d\'un tube Unix pipe vers gzip, pigz (parallèle) ou zstd.',
    },
    back: {
      answer: 'Compression à la volée via pipeline Unix :\n\n- **Méthode standard avec gzip** :\n  `mysqldump [options] | gzip -c > /chemin/dump.sql.gz`\n- **Méthode haute performance avec `pigz` (Parallel Gzip)** :\n  `mysqldump [options] | pigz -p 8 > /chemin/dump.sql.gz`\n  (Exploite tous les cœurs CPU pour compresser 10 fois plus vite).\n- **Méthode avec Zstandard (zstd)** :\n  `mysqldump [options] | zstd -T0 > /chemin/dump.sql.zst`\n  (Meilleur taux de compression et décompression ultra-rapide).\n- **Avantage capital** : Le dump SQL textuel n\'est jamais écrit en clair sur le disque, économisant jusqu\'à **80% d\'espace disque** pendant toute l\'opération.',
      explanation: 'Les dumps SQL se compressent exceptionnellement bien (ratio 5:1 à 8:1) car ils sont constitués de texte répétitif.',
      examTrap: 'Surveillez le CPU : compresser avec gzip niveau 9 peut saturer le processeur et ralentir le dump. Le niveau par défaut (6) ou pigz est recommandé.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Backing Up MySQL Databases with mysqldump',
    },
  },
  {
    id: 'fc-mysql908-dom04-032',
    cardNumber: 32,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Export cohérent des utilisateurs sous MySQL 8.0 sans mysqldump de mysql.user',
    difficulty: 'hard',
    tags: ['mysql.user', 'SHOW CREATE USER', 'User Backup', 'Security'],
    front: {
      question: 'Pourquoi dumper la table système mysql.user avec mysqldump pour la restaurer sur un autre serveur MySQL 8.0 est-il fortement déconseillé, et quelle est la méthode recommandée ?',
      hint: 'La table mysql.user fait partie du dictionnaire de données InnoDB interne ; on doit exporter les comptes via SHOW CREATE USER et SHOW GRANTS.',
    },
    back: {
      answer: 'Problème de `mysql.user` et méthode officielle :\n\n- **Danger sous MySQL 8.0** :\n  - La table `mysql.user` réside dans le dictionnaire de données transactionnel InnoDB interne de MySQL 8.0.\n  - Injecter un `INSERT INTO mysql.user ...` issu d\'une autre instance risque de corrompre les métadonnées internes, les plugins d\'authentification et les structures de rôles.\n- **Méthode recommandée par Oracle** :\n  - Exporter les définitions déclaratives DDL des comptes et leurs droits via l\'utilitaire `mysqlpump` avec `--users` ou le script SQL généré par `SHOW CREATE USER` et `SHOW GRANTS` :\n    ```sql\n    SHOW CREATE USER \'alice\'@\'%\';\n    SHOW GRANTS FOR \'alice\'@\'%\';\n    ```\n  - Ou utiliser l\'utilitaire **MySQL Shell Dump & Load** qui exporte nativement les utilisateurs avec `dumpUsers: true` de façon propre et indépendante du dictionnaire de données.',
      explanation: 'Garantit une migration d\'utilisateurs propre même entre versions mineures différentes.',
      examTrap: 'Ne faites jamais "mysqldump mysql user > user.sql" pour le restaurer à l\'aveugle sur une autre version de MySQL 8.0.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Backing Up User Accounts and Privileges',
    },
  },

  // =========================================================================
  // SECTION 3 : SAUVEGARDE LOGIQUE AVANCÉE : MYSQLPUMP ET MYSQL SHELL UTILITIES (Cartes 33 à 50)
  // mysqlpump parallélisme, MySQL Shell Dump Instance, dumpSchemas, dumpTables,
  // util.loadDump, multi-threading, streaming S3/OCI, zstd
  // =========================================================================
  {
    id: 'fc-mysql908-dom04-033',
    cardNumber: 33,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Architecture multi-thread de mysqlpump',
    difficulty: 'medium',
    tags: ['mysqlpump', 'Parallelism', 'Performance', 'Multi-thread'],
    front: {
      question: 'Quels avantages majeurs l\'utilitaire mysqlpump apporte-t-il par rapport à mysqldump pour la vitesse d\'export ?',
      codeSnippet: `$ mysqlpump --default-parallelism=8 \
  --parallel-schemas=4:db1,db2,db3,db4 \
  --compress-output=LZ4 > backup.lz4`,
      hint: 'Parallélisme multi-thread sur plusieurs schémas et tables, et compression intégrée en streaming LZ4/ZLIB.',
    },
    back: {
      answer: 'Avantages clés de `mysqlpump` :\n\n1. **Parallélisme multi-thread natif** :\n   - Alors que `mysqldump` est strictement mono-thread (table après table séquentiellement), `mysqlpump` permet de dumper plusieurs tables et schémas **simultanément en parallèle** (`--default-parallelism=N`).\n2. **Compression native intégrée** :\n   - Compresse le flux de sortie directement avec des algorithmes modernes ultra-rapides (`--compress-output=LZ4` ou `ZLIB`) sans nécessiter de pipe Unix externe.\n3. **Extraction dédiée des comptes utilisateurs** :\n   - Option `--users` pour exporter proprement les comptes, mots de passe et privilèges sous forme de `CREATE USER` et `GRANT` déclaratifs.\n4. **Restauration plus rapide** : Sépare la création des index secondaires après le chargement des données.',
      explanation: 'Introduit dans MySQL 5.7 pour moderniser les sauvegardes logiques massives.',
      examTrap: 'Attention : mysqlpump ne garantit PAS la cohérence transactionnelle globale sur plusieurs threads en même temps que mysqldump --single-transaction !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqlpump - A Database Backup Program',
    },
  },
  {
    id: 'fc-mysql908-dom04-034',
    cardNumber: 34,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Limites de cohérence transactionnelle de mysqlpump',
    difficulty: 'hard',
    tags: ['mysqlpump', 'Consistency', 'Transaction', 'Comparison'],
    front: {
      question: 'Pourquoi mysqlpump ne peut-il pas garantir un snapshot transactionnel unique cohérent sur l\'ensemble des tables lorsqu\'il fonctionne en mode multi-thread ?',
      hint: 'Chaque thread ouvre sa propre transaction indépendante à un instant T légèrement décalé.',
    },
    back: {
      answer: 'Limite critique de cohérence de `mysqlpump` :\n\n- Dans `mysqldump`, **un seul thread unique** ouvre une transaction cohérente globale (`START TRANSACTION WITH CONSISTENT SNAPSHOT`), garantissant que toutes les tables sont figées au même instant exact.\n- Dans `mysqlpump` multi-thread :\n  - Chaque thread de travail ouvre **sa propre session et sa propre transaction indépendante** au moment où il commence à traiter sa table.\n  - Si des écritures ont lieu entre le démarrage du Thread 1 (qui dumpe `clients` à 02:00:00) et le démarrage du Thread 4 (qui dumpe `commandes` à 02:00:05), les données entre les deux tables **ne sont pas cohérentes au même instant $T$** !\n- **Conséquence** : Ne convient pas pour une sauvegarde cohérente en environnement de production hautement transactionnel sans gel des écritures.',
      explanation: 'Cette limitation a conduit Oracle à concevoir la nouvelle génération d\'utilitaires : le MySQL Shell Dump & Load Utility.',
      examTrap: 'N\'utilisez pas mysqlpump multi-threads en production si vous devez garantir une cohérence transactionnelle inter-tables absolue sans verrous.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqlpump Concurrency and Consistency',
    },
  },
  {
    id: 'fc-mysql908-dom04-035',
    cardNumber: 35,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Révolution MySQL Shell : util.dumpInstance()',
    difficulty: 'medium',
    tags: ['MySQL Shell', 'util.dumpInstance', 'Modern Backup', 'High Speed'],
    front: {
      question: 'Qu\'est-ce que l\'utilitaire util.dumpInstance() de MySQL Shell et pourquoi surpasse-t-il radicalement mysqldump et mysqlpump ?',
      codeSnippet: `// Dans MySQL Shell (mode JS) :
util.dumpInstance('/backups/shell_dump_2026', {
  threads: 16,
  compression: 'zstd',
  consistent: true
});`,
      hint: 'Sauvegarde logique parallélisée par chunks, cohérence transactionnelle garantie, compression zstd, export cloud direct.',
    },
    back: {
      answer: 'Le **MySQL Shell Dump & Load Utility** (`util.dumpInstance()`) :\n\n- Outil officiel recommandé par Oracle pour toutes les sauvegardes logiques sous MySQL 8.0.\n- **Atouts majeurs** :\n  1. **Cohérence transactionnelle garantie** (`consistent: true`) : Un thread coordinateur initialise un snapshot global, puis tous les threads de travail partagent la même cohérence de données.\n  2. **Découpage par Chunks (Parallélisme au sein d\'une même table)** : Les grandes tables sont partitionnées par blocs de lignes et exportées par plusieurs threads en parallèle.\n  3. **Export multi-fichiers haute performance** : Écrit des fichiers tabulaires TSV compressés en **Zstandard (`zstd`)**.\n  4. **Support Cloud Natif** : Peut écrire directement vers Amazon S3, Oracle Cloud Infrastructure (OCI) Object Storage ou Azure Blob Storage sans toucher au disque local.',
      explanation: 'Permet de dumper une base de 1 To en moins d\'une heure là où mysqldump mettait 12 heures.',
      examTrap: 'util.dumpInstance() s\'exécute depuis le client MySQL Shell (mysqlsh), et non depuis l\'ancien client mysql en ligne de commande.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Shell Instance Dump Utility',
    },
  },
  {
    id: 'fc-mysql908-dom04-036',
    cardNumber: 36,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Sauvegarde de schémas spécifiques avec util.dumpSchemas()',
    difficulty: 'medium',
    tags: ['MySQL Shell', 'util.dumpSchemas', 'Cloud', 'Backup'],
    front: {
      question: 'Quelle est la syntaxe pour sauvegarder deux schémas spécifiques en parallèle avec 8 threads vers un bucket cloud OCI ou AWS S3 via MySQL Shell ?',
      codeSnippet: `// Dans MySQL Shell :
util.dumpSchemas(['erp', 'analytics'], 's3://my-backup-bucket/daily_dump', {
  threads: 8,
  s3BucketName: 'my-backup-bucket',
  s3Region: 'eu-west-3'
});`,
      hint: 'util.dumpSchemas(schemasArray, outputDirectory, optionsObject).',
    },
    back: {
      answer: 'Utilisation de `util.dumpSchemas()` dans MySQL Shell :\n\n- **Syntaxe** :\n  `util.dumpSchemas([liste_schemas], destination, {options});`\n- **Paramètres clés** :\n  - Premier argument : tableau JavaScript de noms de bases (ex: `[\'crm\', \'billing\']`).\n  - Deuxième argument : répertoire local (`/var/backups/dump1`) ou URI de stockage objet Cloud (`@s3://...`, `@oci://...`).\n  - Options : `threads: 8` (nombre de threads de travail), `bytesPerChunk: "64M"` (taille des morceaux de tables pour le parallélisme), `compression: "zstd"`.\n- Enregistre les métadonnées, le DDL et les fichiers de données TSV compressés de manière optimisée.',
      explanation: 'Idéal pour migrer ou sauvegarder un sous-ensemble d\'applications vers le Cloud.',
      examTrap: 'Ne pas oublier que MySQL Shell utilise le protocole X Protocol (port 33060) par défaut, mais fonctionne également sur le port classique 3306.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Shell Schema Dump Utility',
    },
  },
  {
    id: 'fc-mysql908-dom04-037',
    cardNumber: 37,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Restauration ultra-rapide avec util.loadDump()',
    difficulty: 'hard',
    tags: ['MySQL Shell', 'util.loadDump', 'Fast Restore', 'Parallel Load'],
    front: {
      question: 'Pourquoi l\'utilitaire util.loadDump() de MySQL Shell restaure-t-il les données jusqu\'à 20 fois plus vite qu\'un simple import SQL classique ?',
      codeSnippet: `util.loadDump('/backups/shell_dump_2026', {
  threads: 16,
  loadData: true,
  deferTableIndexes: 'all',
  resetProgress: false
});`,
      hint: 'Chargement parallèle multi-thread via LOAD DATA, différé de construction des index secondaires, et reprise sur incident.',
    },
    back: {
      answer: 'Optimisations massives de `util.loadDump()` :\n\n1. **Chargement parallèle multi-threads (`threads: 16`)** : Les chunks de fichiers d\'une même table ou de tables différentes sont insérés simultanément par 16 threads en parallèle via des commandes `LOAD DATA LOCAL INFILE` ultra-rapides.\n2. **Différé des index secondaires (`deferTableIndexes: \'all\'`)** :\n   - Au lieu d\'insérer ligne par ligne dans les B-Trees des index secondaires (très coûteux en I/O aléatoires), `loadDump` crée les tables **sans index secondaires**.\n   - Une fois toutes les données chargées en masse séquentielle, il reconstruit tous les index secondaires en une seule passe triée (Sorted Index Build).\n3. **Reprise sur incident (State tracking)** : Si l\'import s\'interrompt (ex: coupure réseau), `loadDump` sait reprendre exactement là où il s\'était arrêté sans tout recharger.',
      explanation: 'Cette technologie transforme une restauration de 12 heures en une opération de 40 minutes.',
      examTrap: 'Pour utiliser deferTableIndexes, le serveur cible doit être en MySQL 8.0+. Sur MySQL 5.7, cette option n\'est pas supportée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Shell Dump Loading Utility',
    },
  },
  {
    id: 'fc-mysql908-dom04-038',
    cardNumber: 38,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Sauvegarde et restauration sélective de tables avec util.dumpTables()',
    difficulty: 'medium',
    tags: ['util.dumpTables', 'MySQL Shell', 'Selective Restore'],
    front: {
      question: 'Comment sauvegarder une liste de tables spécifiques d\'une base avec découpage en morceaux (chunks) via util.dumpTables() ?',
      codeSnippet: `util.dumpTables('sales_db', ['orders', 'order_items'], '/backups/orders_chunked', {
  threads: 8,
  bytesPerChunk: '128M'
});`,
      hint: 'util.dumpTables(schema, tablesArray, outputDir, options).',
    },
    back: {
      answer: 'Utilisation de `util.dumpTables()` :\n\n- Permet d\'exporter un groupe de tables spécifiques d\'un schéma donné sans toucher au reste de la base.\n- **Paramètre `bytesPerChunk: \'128M\'`** :\n  - Si la table `order_items` fait 20 Go, MySQL Shell la découpe virtuellement en plusieurs dizaines de morceaux de 128 Mo chacun.\n  - Les 8 threads lisent et écrivent simultanément les différents intervalles de clés primaires.\n- À la restauration, ces morceaux sont rechargés en parallèle, exploitant à 100% la bande passante I/O du stockage NVMe.',
      explanation: 'Idéal pour extraire des tables volumineuses afin de les migrer vers un entrepôt de données.',
      examTrap: 'Pour que le découpage par chunk fonctionne de manière optimale, la table doit posséder une clé primaire entière ou indexée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Shell Table Dump Utility',
    },
  },
  {
    id: 'fc-mysql908-dom04-039',
    cardNumber: 39,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Filtrage et exclusion d\'objets dans MySQL Shell Dump',
    difficulty: 'medium',
    tags: ['MySQL Shell', 'excludeTables', 'excludeSchemas', 'Filtering'],
    front: {
      question: 'Quelles options permettent d\'exclure des tables spécifiques ou des schémas entiers lors d\'un appel à util.dumpInstance() ?',
      codeSnippet: `util.dumpInstance('/backups/prod_dump', {
  excludeSchemas: ['temp_db', 'staging'],
  excludeTables: ['analytics.raw_events', 'logs.audit_trail'],
  dumpUsers: true,
  threads: 8
});`,
      hint: 'Options excludeSchemas et excludeTables prenant des tableaux de chaînes de caractères.',
    },
    back: {
      answer: 'Options de filtrage dans les utilitaires MySQL Shell Dump :\n\n- **`excludeSchemas: [\'db1\', \'db2\']`** : Exclut totalement ces bases de données de l\'export.\n- **`excludeTables: [\'schema.table1\', \'schema.table2\']`** : Exclut des tables spécifiques tout en conservant le reste du schéma.\n- **`dumpUsers: true`** : Exporte automatiquement les définitions de tous les utilisateurs (`CREATE USER`), leurs mots de passe chiffrés, leurs rôles et leurs privilèges (`GRANT`).\n- **`dumpRoutines: true` / `dumpEvents: true` / `dumpTriggers: true`** : Tous activés à `true` par défaut dans MySQL Shell (contrairement à mysqldump !).',
      explanation: 'Fournit une interface déclarative JSON beaucoup plus propre et prévisible que les longues lignes de commandes CLI.',
      examTrap: 'Contrairement à mysqldump où routines et events sont à false par défaut, MySQL Shell les inclut par défaut à true.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Shell Dump Filtering Options',
    },
  },
  {
    id: 'fc-mysql908-dom04-040',
    cardNumber: 40,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Contrôle du mode de compatibilité Cloud : ociMds',
    difficulty: 'hard',
    tags: ['MySQL Shell', 'HeatWave', 'Cloud Migration', 'ociMds'],
    front: {
      question: 'À quoi sert l\'option "compatibility: [\'ociMds\']" dans util.dumpInstance() ou util.dumpSchemas() ?',
      codeSnippet: `util.dumpInstance('/backups/cloud_ready', {
  compatibility: ['ociMds'],
  threads: 8
});`,
      hint: 'Valide et adapte les structures DDL pour garantir la compatibilité avec MySQL Database Service (MDS / HeatWave) dans le cloud Oracle.',
    },
    back: {
      answer: 'Rôle de l\'option `compatibility: [\'ociMds\']` :\n\n- Prépare et vérifie le dump pour une importation directe sans erreur dans **Oracle Cloud Infrastructure (OCI) MySQL Database Service (MDS / HeatWave)**.\n- **Actions automatiques de conformité** :\n  1. Supprime les clauses de tablespaces non supportées dans le Cloud (`TABLESPACE = ...`).\n  2. Supprime ou ajuste les clauses `DEFINER` problématiques sur les vues et procédures.\n  3. Vérifie l\'absence de moteurs obsolètes (interdit MyISAM, force InnoDB).\n  4. Vérifie que chaque table possède une clé primaire explicite (exigence MDS).\n  5. Supprime les privilèges réservés aux super-administrateurs système non autorisés en DBaaS managé.',
      explanation: 'Évite les échecs d\'importation lors d\'une migration d\'une base On-Premise vers le Cloud managé.',
      examTrap: 'Si des tables ont un moteur MyISAM, l\'utilitaire lève une alerte bloquante avant même d\'avoir exporté les données.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Compatibility Options for OCI MDS',
    },
  },
  {
    id: 'fc-mysql908-dom04-041',
    cardNumber: 41,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Dry Run et diagnostic de faisabilité avec util.dumpInstance()',
    difficulty: 'easy',
    tags: ['MySQL Shell', 'dryRun', 'Validation', 'Audit'],
    front: {
      question: 'Comment tester la faisabilité d\'un dump complet avec MySQL Shell sans écrire aucun fichier sur disque pour vérifier l\'absence d\'erreurs ?',
      codeSnippet: `util.dumpInstance('/backups/test_run', {
  dryRun: true
});`,
      hint: 'Option dryRun: true simule tout le processus et affiche les statistiques d\'estimation.',
    },
    back: {
      answer: 'L\'option **`dryRun: true`** dans MySQL Shell :\n\n- Exécute l\'ensemble des étapes de vérification pré-dump sans écrire aucune donnée sur le disque ni dans le bucket cloud :\n  1. Vérifie les privilèges de l\'utilisateur connecté sur toutes les bases.\n  2. Inspecte la taille de toutes les tables et estime le volume total.\n  3. Calcule le plan de découpage en chunks et le nombre de threads optimal.\n  4. Détecte les incompatibilités éventuelles (vues orphelines, triggers en erreur, moteurs non supportés).\n  5. Affiche un rapport complet récapitulatif dans la console de commande.',
      explanation: 'Idéal à exécuter avant de planifier un job de sauvegarde nocturne ou une migration de production.',
      examTrap: 'dryRun: true ne verrouille pas les tables et ne perturbe en rien la production.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Shell Utilities: dryRun Option',
    },
  },
  {
    id: 'fc-mysql908-dom04-042',
    cardNumber: 42,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Gestion des index secondaires différés dans util.loadDump : deferTableIndexes',
    difficulty: 'hard',
    tags: ['deferTableIndexes', 'util.loadDump', 'B-Tree', 'Performance'],
    front: {
      question: 'Quelles sont les valeurs possibles de l\'option deferTableIndexes dans util.loadDump() et comment impactent-elles les performances d\'importation ?',
      codeSnippet: `util.loadDump('/backups/dump', {
  deferTableIndexes: 'all' // ou 'none', 'fulltext'
});`,
      hint: 'all diffère tous les index secondaires, fulltext ne diffère que les index de recherche plein texte, none conserve les index à la création.',
    },
    back: {
      answer: 'Fonctionnement de `deferTableIndexes` dans `util.loadDump()` :\n\n- **`\'all\'` (Valeur recommandée pour vitesse maximale)** :\n  - Supprime tous les index secondaires (non uniques) et index FULLTEXT de l\'instruction DDL initiale `CREATE TABLE`.\n  - Seule la Clé Primaire (Clustered Index) est créée.\n  - Les données sont chargées en masse à vitesse séquentielle pure.\n  - Une fois toutes les données insérées, MySQL exécute un `ALTER TABLE ... ADD INDEX` optimisé avec tri parallèle (Fast Index Creation).\n- **`\'fulltext\'`** :\n  - Ne diffère que les index `FULLTEXT` (qui sont les plus lents à mettre à jour pendant des `INSERT`).\n- **`\'none\'`** :\n  - Crée tous les index dès le début (les performances d\'insertion chutent fortement sur les grosses tables).',
      explanation: 'Construire les index une fois les données présentes est mathématiquement beaucoup plus rapide que d\'insérer un million de fois dans un B-Tree.',
      examTrap: 'Les contraintes d\'unicité (UNIQUE KEY) et clés primaires ne peuvent pas être différées car elles garantissent l\'intégrité des lignes.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Shell Loading: Index Deferral',
    },
  },
  {
    id: 'fc-mysql908-dom04-043',
    cardNumber: 43,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Gestion de la reprise sur erreur avec util.loadDump : resetProgress',
    difficulty: 'medium',
    tags: ['util.loadDump', 'resetProgress', 'Resilience', 'Troubleshooting'],
    front: {
      question: 'Si un util.loadDump() échoue au bout de 2 heures suite à une coupure réseau, comment reprendre l\'importation là où elle s\'était arrêtée ?',
      codeSnippet: `// Relance après correction de la panne réseau :
util.loadDump('/backups/dump', {
  threads: 16,
  resetProgress: false // (Valeur par défaut !)
});`,
      hint: 'MySQL Shell stocke l\'état d\'avancement de chaque chunk dans une table de suivi interne ou fichier de métadonnées.',
    },
    back: {
      answer: 'Mécanisme de reprise sur incident de `util.loadDump()` :\n\n- `util.loadDump()` conserve un journal d\'état d\'avancement (`load-progress.<UUID>.json` ou table de métadonnées) qui enregistre chaque chunk de fichier déjà inséré et validé.\n- **En cas d\'échec** (interruption réseau, panne de courant, crash temporaire) :\n  - Il suffit de **relancer exactement la même commande `util.loadDump(...)`**.\n  - Par défaut (`resetProgress: false`), l\'utilitaire lit le journal de progression, ignore tous les chunks déjà injectés avec succès, et reprend immédiatement le chargement des chunks restants.\n- **Pour recommencer de zéro** : Spécifier explicitement `resetProgress: true` (nécessite de nettoyer manuellement les tables pré-insérées).',
      explanation: 'Évite de devoir recommencer un chargement de 12 heures qui a échoué à 95%.',
      examTrap: 'Si vous changez le répertoire de destination ou modifiez les fichiers du dump entre-temps, l\'état de progression devient invalide.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Shell Load Utility Progress Tracking',
    },
  },
  {
    id: 'fc-mysql908-dom04-044',
    cardNumber: 44,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Importation sélective dans util.loadDump : includeTables et excludeTables',
    difficulty: 'easy',
    tags: ['util.loadDump', 'includeTables', 'Selective Restore'],
    front: {
      question: 'Comment restaurer uniquement 2 tables spécifiques à partir d\'un dump d\'instance complète généré par MySQL Shell ?',
      codeSnippet: `util.loadDump('/backups/full_dump_instance', {
  includeTables: ['billing.invoices', 'billing.payments'],
  threads: 4
});`,
      hint: 'Option includeTables prenant la liste des tables à restaurer.',
    },
    back: {
      answer: 'Restauration sélective avec `includeTables` :\n\n- Même si le dump contient 500 tables de l\'ensemble de l\'instance, vous pouvez charger chirurgicalement uniquement celles requises :\n  ```javascript\n  util.loadDump(\'/backups/full_instance\', {\n    includeTables: [\'shop.products\', \'shop.categories\'],\n    threads: 4\n  });\n  ```\n- `util.loadDump` n\'analyse et ne charge que les fichiers DDL et les chunks de données appartenant aux tables ciblées.\n- Vous pouvez également utiliser `includeSchemas` pour ne restaurer qu\'un schéma unique parmi une instance complète.',
      explanation: 'Permet de récupérer rapidement une table effacée par erreur par un utilisateur sans restaurer toute l\'instance.',
      examTrap: 'Assurez-vous que les dépendances (clés étrangères vers d\'autres tables) ne provoquent pas de violation si vous ne restaurez pas les tables parentes.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Selective Loading with MySQL Shell',
    },
  },
  {
    id: 'fc-mysql908-dom04-045',
    cardNumber: 45,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Vérification de somme de contrôle et d\'intégrité dans MySQL Shell Dump',
    difficulty: 'medium',
    tags: ['MySQL Shell', 'Checksum', 'Integrity', 'Verification'],
    front: {
      question: 'Comment MySQL Shell garantit-il qu\'aucun chunk de fichier de données n\'a été corrompu ou altéré pendant le transfert réseau ou le stockage ?',
      hint: 'Des sommes de contrôle (checksums) sont calculées à l\'écriture et validées automatiquement à la lecture.',
    },
    back: {
      answer: 'Intégrité et sommes de contrôle dans MySQL Shell Dump :\n\n- Lors de l\'exécution de `util.dumpInstance()` ou `dumpSchemas()`, MySQL Shell génère automatiquement un fichier de métadonnées `@.manifest.json` qui consigne :\n  1. La liste exhaustive de tous les fichiers et chunks générés.\n  2. Les sommes de contrôle cryptographiques (hashes) de chaque fichier compressé.\n  3. Le nombre exact de lignes par table et par chunk.\n- Lors de l\'exécution de `util.loadDump()`, le chargeur recalcule systématiquement le hash de chaque chunk avant décompression.\n- Si un octet a été corrompu par un disque ou un transfert réseau altéré, le chunk est immédiatement rejeté avec une alerte d\'intégrité explicite.',
      explanation: 'Apporte un niveau de sécurité et de conformité largement supérieur aux simples dumps mysqldump non vérifiés.',
      examTrap: 'Ne modifiez jamais manuellement le contenu d\'un fichier de données sans recalculer les métadonnées dans le manifest, sinon loadDump refusera de le charger.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Shell Dump Manifest and Checksums',
    },
  },
  {
    id: 'fc-mysql908-dom04-046',
    cardNumber: 46,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Mode d\'importation d\'utilisateurs dans util.loadDump : loadUsers',
    difficulty: 'medium',
    tags: ['loadUsers', 'util.loadDump', 'Security', 'User Accounts'],
    front: {
      question: 'Comment contrôler la restauration des comptes utilisateurs lors d\'un chargement avec util.loadDump() ?',
      codeSnippet: `util.loadDump('/backups/full_dump', {
  loadUsers: true // ou false
});`,
      hint: 'loadUsers: true recrée les comptes et rôles à partir des métadonnées du dump.',
    },
    back: {
      answer: 'Gestion des utilisateurs avec `loadUsers` :\n\n- Si le dump a été produit avec `dumpUsers: true`, il contient un fichier spécial décrivant tous les utilisateurs, mots de passe et rôles.\n- Lors du chargement avec `util.loadDump()` :\n  - `loadUsers: true` : Recrée automatiquement tous les comptes utilisateurs, leurs privilèges et leurs rôles sur le serveur cible.\n  - `loadUsers: false` : Ignore totalement les comptes d\'accès et ne restaure que les schémas et données (idéal pour rafraîchir un environnement de pré-production sans écraser les comptes locaux).\n- Les comptes système par défaut de MySQL (comme `mysql.sys`, `mysql.session`) sont automatiquement filtrés pour éviter tout conflit interne.',
      explanation: 'Permet une migration complète serveur-à-serveur sans script de recréation de droits.',
      examTrap: 'Pour utiliser loadUsers: true, l\'utilisateur exécutant loadDump doit disposer des privilèges CREATE USER et GRANT OPTION sur le serveur cible.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Restoring Users with MySQL Shell',
    },
  },
  {
    id: 'fc-mysql908-dom04-047',
    cardNumber: 47,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Transformation de schémas à la volée avec util.loadDump : schemaMapping',
    difficulty: 'hard',
    tags: ['schemaMapping', 'util.loadDump', 'Refactoring', 'Migration'],
    front: {
      question: 'Comment restaurer des données dumpées depuis la base "production_erp" vers une base renommée "dev_erp_test" sans modifier les fichiers du dump ?',
      codeSnippet: `util.loadDump('/backups/prod_dump', {
  schemaMapping: {
    'production_erp': 'dev_erp_test'
  }
});`,
      hint: 'Option schemaMapping associant l\'ancien nom de schéma au nouveau nom cible.',
    },
    back: {
      answer: 'Fonctionnalité `schemaMapping` de `util.loadDump()` :\n\n- Permet de rediriger à la volée le chargement des tables vers un schéma portant un nom différent :\n  ```javascript\n  util.loadDump(\'/backups/prod_dump\', {\n    schemaMapping: {\n      \'ecommerce_prod\': \'ecommerce_stage\'\n    }\n  });\n  ```\n- **Avantage décisif** :\n  - Dans un dump `mysqldump` traditionnel, renommer le schéma cible exigeait d\'éditer un fichier texte de 50 Go avec `sed` pour remplacer toutes les mentions `USE ecommerce_prod;`.\n  - `util.loadDump` intercepte les flux et applique le renommage dynamiquement en mémoire pendant l\'importation.',
      explanation: 'Indispensable pour rafraîchir des bases de tests ou créer des environnements éphémères de staging.',
      examTrap: 'Si le schéma cible dev_erp_test n\'existe pas, util.loadDump le crée automatiquement si createDatabase est activé.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Schema Mapping in MySQL Shell',
    },
  },
  {
    id: 'fc-mysql908-dom04-048',
    cardNumber: 48,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Gestion des caractères délimiteurs dans les fichiers de dump MySQL Shell',
    difficulty: 'medium',
    tags: ['TSV', 'Formatting', 'Delimiters', 'Internals'],
    front: {
      question: 'Quel format de données interne MySQL Shell utilise-t-il pour stocker les lignes de données dans les fichiers de chunks ?',
      hint: 'Fichiers texte tabulaires délimités par des tabulations (TSV) et fins de ligne Unix (LF), compressés par zstd.',
    },
    back: {
      answer: 'Format interne des chunks MySQL Shell :\n\n- Les données sont stockées au format tabulaire **TSV (Tab-Separated Values)** standard :\n  - Séparateur de colonnes : caractère tabulation (`\\t`).\n  - Séparateur de lignes : saut de ligne Unix (`\\n` - LF).\n  - Valeurs nulles : représentées par `\\N`.\n  - Échappement : antislash (`\\`).\n- Ce format est directement compatible avec le moteur interne d\'ingestion ultra-rapide `LOAD DATA LOCAL INFILE` d\'InnoDB.\n- Les fichiers sont compressés par défaut avec **Zstandard (`.zst`)**, offrant un ratio de compression proche de gzip avec une vitesse de décompression 5 fois supérieure.',
      explanation: 'Zstandard est un algorithme créé par Facebook / Meta, optimisé pour les débits élevés en RAM.',
      examTrap: 'Vous pouvez inspecter un chunk individuel en utilisant l\'utilitaire CLI zstd : "zstd -d -c table@1.tsv.zst | head -n 20".',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Dump File Formats and Structure',
    },
  },
  {
    id: 'fc-mysql908-dom04-049',
    cardNumber: 49,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Parallélisme au niveau des chunks d\'une table : bytesPerChunk',
    difficulty: 'hard',
    tags: ['bytesPerChunk', 'Parallelism', 'Performance', 'Tuning'],
    front: {
      question: 'Comment l\'option bytesPerChunk permet-elle à MySQL Shell de dumper une table unique de 500 Go en utilisant 32 threads simultanément ?',
      hint: 'MySQL Shell sonde la clé primaire et partitionne la table en plages de lignes autonomes de taille estimée équivalente à bytesPerChunk.',
    },
    back: {
      answer: 'Mécanisme de découpage par Chunks dans MySQL Shell :\n\n1. Pour les tables volumineuses, MySQL Shell n\'assigne pas la table à un seul thread unique.\n2. Il analyse l\'index de la clé primaire (ou un index unique non nul) pour estimer la distribution des lignes.\n3. Il calcule des intervalles de valeurs de clés primaires équivalant approximativement au volume spécifié par **`bytesPerChunk`** (par défaut `64M` ou `128M`).\n4. Chaque intervalle (ex: `WHERE id BETWEEN 1 AND 500000`, `WHERE id BETWEEN 500001 AND 1000000`) est attribué à un thread de travail différent.\n5. **32 threads peuvent ainsi extraire simultanément la même table** sans aucun verrou bloquant.\n6. Chaque thread écrit son propre fichier chunk (`table@1.tsv.zst`, `table@2.tsv.zst`, etc.).',
      explanation: 'C\'est cette innovation architecturale majeure qui surpasse définitivement mysqldump.',
      examTrap: 'Si une table ne possède aucune clé primaire ni aucun index unique, elle ne peut pas être découpée en chunks et sera traitée par un seul thread.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Parallel Table Chunking in MySQL Shell',
    },
  },
  {
    id: 'fc-mysql908-dom04-050',
    cardNumber: 50,
    domainId: 'mysql-908-dom-04',
    domainCode: 'DOM-04',
    domainTitle: 'Sauvegarde physique (MEB) et logique (mysqldump) & Restauration',
    subtopic: 'Comparatif synthétique des 3 utilitaires logiques : mysqldump vs mysqlpump vs MySQL Shell',
    difficulty: 'medium',
    tags: ['Comparison', 'mysqldump', 'mysqlpump', 'MySQL Shell', 'Exam Matrix'],
    front: {
      question: 'Dans la matrice de compétences 1Z0-908, comment choisir entre mysqldump, mysqlpump et MySQL Shell Dump Utility ?',
      hint: 'mysqldump pour les petits exports simples et scripts historiques ; mysqlpump pour le parallélisme de schémas 5.7 ; MySQL Shell pour toutes les sauvegardes modernes 8.0 haute performance et cloud.',
    },
    back: {
      answer: 'Matrice de décision officielle Oracle :\n\n- **`mysqldump`** :\n  - *Points forts* : Universel, préinstallé partout, simple, cohérence parfaite avec `--single-transaction`.\n  - *Limites* : Mono-thread (lent sur les gros volumes), restauration très lente.\n  - *Usage* : Petites bases ($< 10$ Go), scripts shell simples, migrations ponctuelles de tables.\n- **`mysqlpump`** :\n  - *Points forts* : Multi-thread au niveau des tables, compression native LZ4.\n  - *Limites* : Pas de cohérence globale multi-tables en mode parallèle.\n  - *Usage* : Transition historique, en voie d\'effacement devant MySQL Shell.\n- **`MySQL Shell Dump & Load` (`util.dumpInstance`)** :\n  - *Points forts* : Découpage multi-chunks d\'une même table, cohérence globale garantie, compression zstd, direct Cloud Object Storage, restauration ultra-rapide avec index différés et reprise sur panne.\n  - *Usage* : **Recommandation officielle d\'Oracle pour tout volume moyen à massif sous MySQL 8.0**.',
      explanation: 'Pour l\'examen 1Z0-908, MySQL Shell est mis en avant comme l\'outil d\'avenir pour les sauvegardes logiques.',
      examTrap: 'Pour l\'examen, retenez que mysqldump est mono-thread alors que MySQL Shell et mysqlpump sont multi-threads.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Comparing Logical Backup Tools',
    },
  },
];
