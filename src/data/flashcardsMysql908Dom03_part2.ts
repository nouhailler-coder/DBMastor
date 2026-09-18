import { FlashcardItem } from '../types';

export const mysql908Dom03Part2Flashcards: FlashcardItem[] = [
  // =========================================================================
  // SECTION 4 : PRIVILÈGES DYNAMIQUES MODERNES (MYSQL 8.0) (Cartes 51 à 63)
  // SYSTEM_VARIABLES_ADMIN, PERSIST_RO_VARIABLES_ADMIN, BACKUP_ADMIN,
  // CLONE_ADMIN, CONNECTION_ADMIN, ROLE_ADMIN, REPLICATION_APPLIER,
  // INNODB_REDO_LOG_ENABLE, TABLE_ENCRYPTION_ADMIN, mysql.global_grants
  // =========================================================================
  {
    id: 'fc-mysql908-dom03-051',
    cardNumber: 51,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Architecture et stockage des privilèges dynamiques sous MySQL 8.0',
    difficulty: 'medium',
    tags: ['Dynamic Privileges', 'mysql.global_grants', 'Architecture', 'MySQL 8.0'],
    front: {
      question: 'Où et comment les privilèges dynamiques introduits dans MySQL 8.0 sont-ils persistés, et comment un composant tiers peut-il en déclarer de nouveaux ?',
      codeSnippet: `SELECT * FROM mysql.global_grants;
-- Colonnes : USER | HOST | PRIVILEGE | WITH_GRANT_OPTION`,
      hint: 'Stockés dans la table système mysql.global_grants et enregistrés dynamiquement en mémoire au runtime.',
    },
    back: {
      answer: 'Architecture des privilèges dynamiques :\n\n- **Stockage physique** : Contrairement aux privilèges statiques qui occupent des colonnes booléennes fixes dans `mysql.user`, les privilèges dynamiques sont enregistrés comme des lignes clé/valeur dans la table système **`mysql.global_grants`**.\n- **Enregistrement au runtime** : Le serveur au démarrage, ainsi que les plugins ou composants chargés (`INSTALL COMPONENT`), déclarent dynamiquement de nouveaux noms de privilèges auprès du sous-système de sécurité de MySQL.\n- **Extensibilité** : Dès qu\'un composant (ex: `component_validate_password` ou un plugin d\'audit) est déchargé, ses privilèges dynamiques peuvent être désenregistrés.\n- S\'appliquent **exclusivement au niveau global** avec la syntaxe standard `GRANT PRIVILEGE_NAME ON *.* TO ...`.',
      explanation: 'Cette architecture élimine le besoin de modifier la structure de la table mysql.user à chaque nouvelle fonctionnalité ajoutée.',
      examTrap: 'Vous ne pouvez pas accorder de privilège dynamique sur une base spécifique (ex: GRANT BACKUP_ADMIN ON db.* TO ... provoque une erreur de syntaxe). Seul ON *.* est valide.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Dynamic Privileges',
    },
  },
  {
    id: 'fc-mysql908-dom03-052',
    cardNumber: 52,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilèges d\'administration des variables : SYSTEM_VARIABLES_ADMIN vs SESSION_VARIABLES_ADMIN',
    difficulty: 'medium',
    tags: ['SYSTEM_VARIABLES_ADMIN', 'SESSION_VARIABLES_ADMIN', 'Variables', 'Privileges'],
    front: {
      question: 'Quelle est la différence entre le privilège dynamique SYSTEM_VARIABLES_ADMIN et SESSION_VARIABLES_ADMIN sous MySQL 8.0 ?',
      codeSnippet: `GRANT SYSTEM_VARIABLES_ADMIN ON *.* TO 'lead_dba'@'%';
GRANT SESSION_VARIABLES_ADMIN ON *.* TO 'app_tuning'@'%';`,
      hint: 'L\'un permet de modifier les variables globales du serveur (SET GLOBAL), l\'autre contrôle la modification de variables sensibles au niveau session.',
    },
    back: {
      answer: 'Différences entre les privilèges de variables :\n\n- **`SYSTEM_VARIABLES_ADMIN`** :\n  - Autorise l\'instruction **`SET GLOBAL`** sur la majorité des variables système dynamiques globales.\n  - Autorise l\'instruction **`SET PERSIST`** pour rendre les variables globales persistantes après redémarrage dans `mysqld-auto.cnf`.\n  - Remplace la majorité des anciens usages du privilège monolithique `SUPER`.\n- **`SESSION_VARIABLES_ADMIN`** :\n  - Autorise la modification au niveau **session** (`SET SESSION`) de certaines variables critiques ou sensibles qui sont normalement restreintes (ex: `sql_log_bin`, `pseudo_thread_id`, `auto_increment_increment` dans certains contextes).\n  - Permet d\'empêcher les utilisateurs ordinaires de désactiver la journalisation binaire dans leur session.',
      explanation: 'Permet d\'empêcher un compte applicatif de surcharger des paramètres de session critiques pour la réplication.',
      examTrap: 'SYSTEM_VARIABLES_ADMIN seul ne permet pas d\'exécuter SET PERSIST_ONLY sur des variables statiques en lecture seule ! Il faut en plus PERSIST_RO_VARIABLES_ADMIN.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - System Variable Privileges',
    },
  },
  {
    id: 'fc-mysql908-dom03-053',
    cardNumber: 53,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Modification des variables statiques en lecture seule : PERSIST_RO_VARIABLES_ADMIN',
    difficulty: 'hard',
    tags: ['PERSIST_RO_VARIABLES_ADMIN', 'SET PERSIST_ONLY', 'ReadOnly', 'Security'],
    front: {
      question: 'Quel privilège dynamique spécifique est indispensable pour enregistrer une modification d\'une variable statique (read-only) via SET PERSIST_ONLY ?',
      codeSnippet: `SET PERSIST_ONLY innodb_buffer_pool_size = 8589934592;
-- Requiert à la fois SYSTEM_VARIABLES_ADMIN et PERSIST_RO_VARIABLES_ADMIN`,
      hint: 'PERSIST_RO_VARIABLES_ADMIN protège contre la modification accidentelle des paramètres de démarrage du moteur.',
    },
    back: {
      answer: 'Le privilège requis est **`PERSIST_RO_VARIABLES_ADMIN`** :\n\n- Les variables système statiques (en lecture seule au runtime, ex: `innodb_buffer_pool_instances`, `bind_address`, `datadir`) ne peuvent pas être modifiées par un simple `SET GLOBAL`.\n- MySQL 8.0 permet d\'écrire leur future valeur dans le fichier `mysqld-auto.cnf` via la syntaxe `SET PERSIST_ONLY nom_variable = valeur;`.\n- Pour exécuter cette commande, l\'administrateur doit obligatoirement posséder **les deux privilèges** :\n  1. `SYSTEM_VARIABLES_ADMIN` (ou `SUPER`)\n  2. `PERSIST_RO_VARIABLES_ADMIN`.\n- Cette double sécurité empêche un administrateur délégué de rendre le serveur inopérant lors du prochain reboot.',
      explanation: 'La clause PERSIST_ONLY n\'altère pas la valeur active en mémoire mais garantit son application au prochain démarrage du serveur.',
      examTrap: 'Posséder uniquement SYSTEM_VARIABLES_ADMIN ne suffit pas pour exécuter SET PERSIST_ONLY sur une variable read-only ! L\'erreur ER_SPECIFIC_ACCESS_DENIED_ERROR sera retournée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The PERSIST_RO_VARIABLES_ADMIN Privilege',
    },
  },
  {
    id: 'fc-mysql908-dom03-054',
    cardNumber: 54,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilège de sauvegarde moderne : BACKUP_ADMIN',
    difficulty: 'medium',
    tags: ['BACKUP_ADMIN', 'LOCK INSTANCE FOR BACKUP', 'MEB', 'Backup'],
    front: {
      question: 'À quoi sert le privilège dynamique BACKUP_ADMIN sous MySQL 8.0 et quelle instruction moderne de sauvegarde permet-il d\'exécuter ?',
      codeSnippet: `GRANT BACKUP_ADMIN ON *.* TO 'backup_operator'@'%';
-- Dans la session de sauvegarde :
LOCK INSTANCE FOR BACKUP;
-- Copie physique des fichiers InnoDB...
UNLOCK INSTANCE;`,
      hint: 'Permet de verrouiller l\'instance contre les modifications DDL et suppressions de tables sans bloquer les DML (INSERT, UPDATE, DELETE).',
    },
    back: {
      answer: 'Rôle du privilège **`BACKUP_ADMIN`** :\n\n- Permet d\'exécuter l\'instruction **`LOCK INSTANCE FOR BACKUP;`** et **`UNLOCK INSTANCE;`**.\n- **Révolution par rapport à l\'ancien `FLUSH TABLES WITH READ LOCK`** :\n  - `FLUSH TABLES WITH READ LOCK` bloquait **toutes les écritures (DML et DDL)** sur l\'ensemble du serveur, causant des gels de production.\n  - `LOCK INSTANCE FOR BACKUP` interdit les opérations **DDL** (`ALTER TABLE`, `CREATE TABLE`, `DROP TABLE`) et le renommage/suppression de fichiers sous-jacents, mais **laisse passer les opérations DML ordinaires (`INSERT`, `UPDATE`, `DELETE`)** !\n- Requis par les outils de sauvegarde physique modernes comme **MySQL Enterprise Backup (MEB)** et Percona XtraBackup.',
      explanation: 'Permet aux sauvegardes physiques à chaud de s\'exécuter sans aucun impact sur le trafic transactionnel des utilisateurs.',
      examTrap: 'BACKUP_ADMIN ne donne pas le droit d\'accéder aux données via SELECT ! Le compte de sauvegarde physique doit avoir BACKUP_ADMIN et SELECT/RELOAD selon l\'outil.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - LOCK INSTANCE FOR BACKUP & BACKUP_ADMIN',
    },
  },
  {
    id: 'fc-mysql908-dom03-055',
    cardNumber: 55,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilège pour le plugin de clonage physique : CLONE_ADMIN',
    difficulty: 'hard',
    tags: ['CLONE_ADMIN', 'Clone Plugin', 'Provisioning', 'Replication'],
    front: {
      question: 'Quels privilèges sont indispensables sur le serveur source et sur le serveur destinataire pour exécuter la commande CLONE INSTANCE FROM sous MySQL 8.0.17+ ?',
      codeSnippet: `CLONE INSTANCE FROM 'donor_user'@'donor_host':3306
  IDENTIFIED BY 'DonorSecret#2026';`,
      hint: 'BACKUP_ADMIN sur le donneur, CLONE_ADMIN sur le receveur.',
    },
    back: {
      answer: 'Privilèges pour le plugin de clonage (`CLONE INSTANCE`) :\n\n- **Sur le serveur Donneur (Source)** :\n  - Le compte distant (`donor_user`) doit posséder le privilège dynamique **`BACKUP_ADMIN`**.\n  - Ce privilège permet au donneur de geler les opérations DDL pendant la transmission des snapshots de tablespaces.\n- **Sur le serveur Receveur (Destinataire)** :\n  - L\'utilisateur local qui lance l\'instruction `CLONE INSTANCE` doit posséder le privilège dynamique **`CLONE_ADMIN`**.\n  - `CLONE_ADMIN` autorise le receveur à vider ses tablespaces locaux, écraser le `datadir`, recharger les données du donneur et redémarrer automatiquement l\'instance mysqld.',
      explanation: 'Le plugin Clone permet de provisionner un réplica ou un nœud InnoDB Cluster de plusieurs téraoctets à la vitesse du réseau.',
      examTrap: 'CLONE_ADMIN inclut implicitement le privilège BACKUP_ADMIN et SHUTDOWN sur le serveur receveur pour lui permettre de redémarrer automatiquement après le clonage.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Privileges for Cloning',
    },
  },
  {
    id: 'fc-mysql908-dom03-056',
    cardNumber: 56,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Gestion des connexions saturées et terminaison de threads : CONNECTION_ADMIN',
    difficulty: 'medium',
    tags: ['CONNECTION_ADMIN', 'KILL', 'max_connections', 'Security'],
    front: {
      question: 'Quelles sont les deux capacités critiques accordées par le privilège dynamique CONNECTION_ADMIN sous MySQL 8.0 ?',
      codeSnippet: `GRANT CONNECTION_ADMIN ON *.* TO 'duty_dba'@'%';
-- Capacité 1 : Connexion sur le port d'administration ou slot réservé
-- Capacité 2 :
KILL 1042; -- Tue la requête ou connexion d'un autre utilisateur`,
      hint: 'Se connecter quand max_connections est atteint, et terminer les requêtes/connexions appartenant à d\'autres utilisateurs.',
    },
    back: {
      answer: 'Les deux rôles clés de `CONNECTION_ADMIN` :\n\n1. **Connexion d\'urgence en cas de saturation** :\n   - Lorsque le plafond de `max_connections` est atteint pour les utilisateurs réguliers, un utilisateur possédant `CONNECTION_ADMIN` est autorisé à utiliser la connexion d\'urgence réservée supplémentaire (`max_connections + 1`) ou à se connecter sur le port d\'administration dédié (`admin_port`).\n2. **Terminaison forcée de threads concurrents (`KILL`)** :\n   - Sans ce privilège, un utilisateur ne peut faire un `KILL` que sur ses propres sessions.\n   - Avec `CONNECTION_ADMIN`, il peut exécuter `KILL QUERY connection_id` ou `KILL CONNECTION connection_id` sur **n\'importe quel thread exécuté par un autre utilisateur**.\n- Remplace l\'ancien usage de `SUPER` pour le dépannage opérationnel.',
      explanation: 'Essentiel pour permettre aux outils de surveillance de purger les requêtes bloquantes.',
      examTrap: 'Si le compte ciblé par le KILL possède le privilège SYSTEM_USER, le DBA qui tente le KILL doit impérativement posséder LUI-AUSSI le privilège SYSTEM_USER !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The CONNECTION_ADMIN Privilege',
    },
  },
  {
    id: 'fc-mysql908-dom03-057',
    cardNumber: 57,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Administration globale des rôles SQL : ROLE_ADMIN',
    difficulty: 'medium',
    tags: ['ROLE_ADMIN', 'Roles', 'RBAC', 'Privileges'],
    front: {
      question: 'Que permet le privilège dynamique ROLE_ADMIN et en quoi diffère-t-il de la clause WITH ADMIN OPTION ?',
      codeSnippet: `GRANT ROLE_ADMIN ON *.* TO 'security_officer'@'%';`,
      hint: 'ROLE_ADMIN permet d\'accorder et de révoquer n\'importe quel rôle sans avoir reçu le rôle avec WITH ADMIN OPTION.',
    },
    back: {
      answer: 'Rôle du privilège dynamique **`ROLE_ADMIN`** :\n\n- **Pouvoir global sur le RBAC** : Permet d\'accorder (`GRANT role TO user`) et de révoquer (`REVOKE role FROM user`) **absolument tous les rôles définis sur l\'instance**, à n\'importe quel utilisateur.\n- Permet également d\'exécuter `SET DEFAULT ROLE` pour n\'importe quel compte.\n- **Différence avec `WITH ADMIN OPTION`** :\n  - `WITH ADMIN OPTION` est accordé pour un rôle précis (ex: `GRANT role1 TO user WITH ADMIN OPTION;`) : l\'utilisateur ne peut déléguer que ce rôle `role1` spécifique.\n  - `ROLE_ADMIN` est un privilège d\'administration global qui s\'applique à **l\'ensemble des rôles existants et futurs**, sans restriction.',
      explanation: 'Indispensable pour le Responsable de la Sécurité des Systèmes d\'Information (RSSI) ou le gestionnaire d\'identités.',
      examTrap: 'ROLE_ADMIN ne donne pas automatiquement le droit de créer ou supprimer des rôles ! Pour CREATE ROLE et DROP ROLE, il faut posséder le privilège statique CREATE USER ou ROLE_ADMIN.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The ROLE_ADMIN Privilege',
    },
  },
  {
    id: 'fc-mysql908-dom03-058',
    cardNumber: 58,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Sécurisation de la réplication : REPLICATION_APPLIER et REPLICATION_SLAVE_ADMIN',
    difficulty: 'hard',
    tags: ['REPLICATION_APPLIER', 'REPLICATION_SLAVE_ADMIN', 'Replication', 'Security'],
    front: {
      question: 'Quel est le rôle du privilège dynamique REPLICATION_APPLIER introduit pour sécuriser l\'exécution des transactions répliquées par les threads appliers ?',
      hint: 'Contrôle le contexte d\'autorisation des transactions répliquées et protège contre l\'injection de requêtes malveillantes via le flux binaire.',
    },
    back: {
      answer: 'Rôle de `REPLICATION_APPLIER` et `REPLICATION_SLAVE_ADMIN` :\n\n- **`REPLICATION_SLAVE_ADMIN`** : Permet de démarrer, arrêter et configurer les canaux de réplication (`START REPLICA`, `STOP REPLICA`, `CHANGE REPLICATION SOURCE TO`).\n- **`REPLICATION_APPLIER` (MySQL 8.0.19+)** :\n  - Attribué à l\'utilisateur défini dans `PRIVILEGE_CHECKS_USER` sur le canal de réplication.\n  - Lorsque le canal applique des transactions venues de la source, MySQL vérifie que cet utilisateur possède les privilèges nécessaires (`INSERT`, `UPDATE`, etc.) pour exécuter les modifications.\n  - **Sécurité critique** : Empêche un pirate ayant compromis une instance source d\'injecter des commandes destructrices ou d\'élèver ses privilèges sur les réplicas cibles.',
      explanation: 'La clause PRIVILEGE_CHECKS_USER associée à REPLICATION_APPLIER est la recommandation majeure d\'Oracle pour sécuriser les architectures de réplication.',
      examTrap: 'Si le PRIVILEGE_CHECKS_USER ne possède pas REPLICATION_APPLIER, le thread applier refuse de démarrer avec l\'erreur ER_CANNOT_START_REPLICA.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The REPLICATION_APPLIER Privilege',
    },
  },
  {
    id: 'fc-mysql908-dom03-059',
    cardNumber: 59,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Consultation du code source des routines : privilège SHOW_ROUTINE',
    difficulty: 'medium',
    tags: ['SHOW_ROUTINE', 'Stored Procedures', 'Security', 'Least Privilege'],
    front: {
      question: 'Comment autoriser un auditeur à examiner le code source des procédures et fonctions stockées sans lui donner le droit dangereux de les modifier ou de les supprimer ?',
      codeSnippet: `GRANT SHOW_ROUTINE ON *.* TO 'code_auditor'@'%';
-- L'auditeur peut maintenant exécuter :
SHOW CREATE PROCEDURE finance.facturation;`,
      hint: 'Le privilège SHOW_ROUTINE sépare la lecture du code de la modification (ALTER ROUTINE).',
    },
    back: {
      answer: 'Le privilège dynamique **`SHOW_ROUTINE`** (introduit sous MySQL 8.0.20) :\n\n- **Problème historique** : Auparavant, pour afficher le code source d\'une routine stockée (`SHOW CREATE PROCEDURE / FUNCTION`) ou interroger `information_schema.ROUTINES`, l\'utilisateur devait être le créateur (`DEFINER`) ou détenir le privilège `ALTER ROUTINE` (qui donne le pouvoir de supprimer ou modifier la routine !).\n- **Solution moderne** : Accorder `SHOW_ROUTINE` permet de **lire intégralement les définitions et le code source** de toutes les routines stockées de l\'instance sans accorder aucun droit de modification ni d\'exécution (`EXECUTE`).',
      explanation: 'Respect parfait du principe de moindre privilège pour les développeurs, auditeurs et outils d\'intégration continue (CI/CD).',
      examTrap: 'SHOW_ROUTINE ne donne pas le droit d\'exécuter la procédure ! Pour lancer la procédure, il faut le privilège EXECUTE.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The SHOW_ROUTINE Privilege',
    },
  },
  {
    id: 'fc-mysql908-dom03-060',
    cardNumber: 60,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Accélération des imports massifs : INNODB_REDO_LOG_ENABLE',
    difficulty: 'hard',
    tags: ['INNODB_REDO_LOG_ENABLE', 'Redo Log', 'Bulk Loading', 'Performance'],
    front: {
      question: 'Quel privilège dynamique permet de désactiver temporairement l\'écriture du journal Redo d\'InnoDB pour accélérer un import massif de données initial ?',
      codeSnippet: `ALTER INSTANCE DISABLE INNODB REDO_LOG;
-- Import massif de données...
ALTER INSTANCE ENABLE INNODB REDO_LOG;`,
      hint: 'INNODB_REDO_LOG_ENABLE autorise les commandes ALTER INSTANCE DISABLE/ENABLE INNODB REDO_LOG.',
    },
    back: {
      answer: 'Le privilège requis est **`INNODB_REDO_LOG_ENABLE`** (MySQL 8.0.21+) :\n\n- **Usage** : Permet d\'exécuter `ALTER INSTANCE DISABLE INNODB REDO_LOG;` et `ENABLE INNODB REDO_LOG;`.\n- **Bénéfice** : Élimine totalement les I/O synchrones sur le journal Redo lors de l\'insertion de plusieurs gigaoctets/téraoctets de données initiales, doublant la vitesse de chargement.\n- **Risque d\'accident** : Pendant la période où le Redo Log est désactivé, **l\'instance n\'est plus crash-safe** ! En cas de panne matérielle ou de coupure de courant, les données peuvent être irrémédiablement corrompues et la base doit être réinitialisée.',
      explanation: 'À réserver exclusivement à l\'initialisation d\'un nouveau nœud réplica ou à un chargement batch avant mise en production.',
      examTrap: 'Le Redo Log ne peut pas être désactivé si la variable innodb_redo_log_capacity est en cours d\'ajustement ou si le serveur participe à un groupe de réplication.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Disabling Redo Logging & INNODB_REDO_LOG_ENABLE',
    },
  },
  {
    id: 'fc-mysql908-dom03-061',
    cardNumber: 61,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Dérogation aux obligations de chiffrement : TABLE_ENCRYPTION_ADMIN',
    difficulty: 'hard',
    tags: ['TABLE_ENCRYPTION_ADMIN', 'TDE', 'Encryption', 'Compliance'],
    front: {
      question: 'Quand la variable default_table_encryption est à ON, quel privilège permet à un utilisateur de créer volontairement une table non chiffrée ?',
      codeSnippet: `-- default_table_encryption = ON (Obligation d'entreprise)
-- L'utilisateur tente de déroger à la règle :
CREATE TABLE temp_scratchpad (id INT) ENCRYPTION = 'N';`,
      hint: 'TABLE_ENCRYPTION_ADMIN permet de contourner les politiques strictes de chiffrement imposées au niveau du schéma ou du serveur.',
    },
    back: {
      answer: 'Le privilège requis est **`TABLE_ENCRYPTION_ADMIN`** :\n\n- Si la variable système globale `table_encryption_privilege_check = ON` est activée :\n  - Tout utilisateur qui tente de créer une table sans chiffrement (`ENCRYPTION = \'N\'`) alors que la base ou le serveur impose le chiffrement par défaut sera bloqué.\n  - De même, un utilisateur tentant de chiffrer une table avec un paramètre différent de la clause par défaut du schéma sera rejeté.\n  - Seul un utilisateur détenant **`TABLE_ENCRYPTION_ADMIN`** est autorisé à surcharger le réglage d\'inversion de chiffrement (`ENCRYPTION=\'N\'` ou `ENCRYPTION=\'Y\'`).',
      explanation: 'Empêche des développeurs de créer des tables contenant des données sensibles en clair sur disque par simple oubli.',
      examTrap: 'Sans table_encryption_privilege_check = ON, le privilège TABLE_ENCRYPTION_ADMIN n\'est pas vérifié et n\'importe qui peut surcharger la clause.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Defining an Encryption Default for Schemas and General Tablespaces',
    },
  },
  {
    id: 'fc-mysql908-dom03-062',
    cardNumber: 62,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilèges dynamiques ciblés : FLUSH_PRIVILEGES, FLUSH_STATUS, FLUSH_TABLES',
    difficulty: 'medium',
    tags: ['FLUSH_PRIVILEGES', 'FLUSH_STATUS', 'Dynamic Privileges', 'Least Privilege'],
    front: {
      question: 'Pourquoi MySQL 8.0 a-t-il introduit les privilèges dynamiques FLUSH_PRIVILEGES, FLUSH_STATUS, FLUSH_TABLES et FLUSH_USER_RESOURCES ?',
      hint: 'Pour éviter de devoir accorder le privilège statique global RELOAD qui donnait trop de pouvoirs.',
    },
    back: {
      answer: 'Objectif de la granularité des privilèges `FLUSH_*` :\n\n- Auparavant, exécuter n\'importe quel `FLUSH` nécessitait le privilège statique `RELOAD`, qui autorisait aussi `FLUSH TABLES WITH READ LOCK` (gel du serveur) et `RESET MASTER`.\n- MySQL 8.0 a introduit des privilèges dynamiques chirurgicaux :\n  - **`FLUSH_PRIVILEGES`** : Recharger les tables d\'autorisations sans pouvoir bloquer les tables.\n  - **`FLUSH_STATUS`** : Réinitialiser les compteurs de performance sans toucher aux données.\n  - **`FLUSH_TABLES`** : Purger le cache des tables ouvertes.\n  - **`FLUSH_USER_RESOURCES`** : Réinitialiser les compteurs de quotas de ressources par utilisateur.',
      explanation: 'Permet d\'accorder aux scripts de métrologie ou de provisioning exactement la permission dont ils ont besoin.',
      examTrap: 'Si un utilisateur détient le privilège statique RELOAD, il peut toujours exécuter tous les FLUSH par rétrocompatibilité.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Dynamic Privileges: FLUSH Operations',
    },
  },
  {
    id: 'fc-mysql908-dom03-063',
    cardNumber: 63,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Attribution du droit de délégation sur un privilège dynamique',
    difficulty: 'hard',
    tags: ['Dynamic Privileges', 'WITH GRANT OPTION', 'Delegation', 'Security'],
    front: {
      question: 'Comment accorder un privilège dynamique avec le droit de le transmettre à d\'autres utilisateurs (délégation) ?',
      codeSnippet: `GRANT BACKUP_ADMIN ON *.* TO 'lead_infra'@'%' 
WITH GRANT OPTION;`,
      hint: 'La clause WITH GRANT OPTION s\'applique également aux privilèges dynamiques et positionne WITH_GRANT_OPTION à Y dans mysql.global_grants.',
    },
    back: {
      answer: 'Délégation d\'un privilège dynamique :\n\n- Comme pour les privilèges statiques, la clause **`WITH GRANT OPTION`** est pleinement supportée sur les privilèges dynamiques :\n  ```sql\n  GRANT CONNECTION_ADMIN, BACKUP_ADMIN ON *.* \n  TO \'lead_infra\'@\'%\' \n  WITH GRANT OPTION;\n  ```\n- Conséquence dans le catalogue :\n  Dans la table système `mysql.global_grants`, la colonne `WITH_GRANT_OPTION` prend la valeur **`\'Y\'`** pour les lignes correspondantes.\n- Le titulaire peut désormais exécuter `GRANT BACKUP_ADMIN ON *.* TO \'junior_infra\'@\'%\';` en toute autonomie.',
      explanation: 'Pour révoquer uniquement le droit de transmission sans révoquer le privilège lui-même : REVOKE GRANT OPTION ON *.* FROM ...',
      examTrap: 'WITH GRANT OPTION doit être placé en fin d\'instruction. Si l\'utilisateur tente d\'accorder un privilège dynamique qu\'il ne possède pas avec grant option, l\'instruction est rejetée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Granting Dynamic Privileges',
    },
  },

  // =========================================================================
  // SECTION 5 : RÔLES SQL & MODÈLE RBAC (Cartes 64 à 75)
  // CREATE/DROP ROLE, GRANT ... TO role, Rôles actifs vs par défaut,
  // SET ROLE, activate_all_roles_on_login, mandatory_roles, mysql.role_edges
  // =========================================================================
  {
    id: 'fc-mysql908-dom03-064',
    cardNumber: 64,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Qu\'est-ce qu\'un rôle SQL et comment est-il représenté en interne ?',
    difficulty: 'easy',
    tags: ['Roles', 'RBAC', 'Internals', 'mysql.user'],
    front: {
      question: 'Qu\'est-ce qu\'un rôle SQL dans MySQL 8.0 et quelle est sa particularité de stockage dans la table mysql.user ?',
      codeSnippet: `CREATE ROLE 'app_readonly';
SELECT user, host, account_locked, password_expired 
FROM mysql.user WHERE user = 'app_readonly';`,
      hint: 'Un rôle est techniquement un compte utilisateur verrouillé par défaut, sans mot de passe possible.',
    },
    back: {
      answer: 'Nature et représentation interne d\'un rôle SQL :\n\n- **Définition** : Un rôle est une collection nommée de privilèges (statiques ou dynamiques) que l\'on peut attribuer à un ou plusieurs utilisateurs ou à d\'autres rôles (RBAC - Role-Based Access Control).\n- **Représentation interne dans `mysql.user`** :\n  - Un rôle est enregistré dans la table **`mysql.user`** exactement comme un compte classique (avec l\'hôte `\'%\'` par défaut si non précisé).\n  - Il a la colonne **`account_locked = \'Y\'`** (verrouillé) et `password_expired = \'Y\'`.\n  - **Impossibilité de se connecter** : Un rôle ne peut jamais ouvrir de session directe ni posséder de mot de passe.\n- Les associations entre rôles et utilisateurs sont enregistrées dans la table de graphe **`mysql.role_edges`**.',
      explanation: 'Le modèle RBAC simplifie drastiquement la gouvernance : lors de l\'arrivée d\'un collaborateur, on lui assigne un rôle métier plutôt que 50 permissions individuelles.',
      examTrap: 'On ne peut pas faire un "ALTER USER \'mon_role\'@\'%\' ACCOUNT UNLOCK;" pour se connecter dessus comme un utilisateur standard !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Using Roles',
    },
  },
  {
    id: 'fc-mysql908-dom03-065',
    cardNumber: 65,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Création et suppression de rôles : CREATE ROLE et DROP ROLE',
    difficulty: 'easy',
    tags: ['CREATE ROLE', 'DROP ROLE', 'Syntax', 'RBAC'],
    front: {
      question: 'Quelle est la syntaxe pour créer plusieurs rôles avec clause d\'existence et comment les supprimer proprement ?',
      codeSnippet: `CREATE ROLE IF NOT EXISTS 'analyst', 'developer'@'localhost', 'auditor';
DROP ROLE IF EXISTS 'developer'@'localhost';`,
      hint: 'Syntaxe similaire à CREATE USER et DROP USER, requiert CREATE USER ou ROLE_ADMIN.',
    },
    back: {
      answer: 'Gestion des rôles :\n\n- **Création** :\n  ```sql\n  CREATE ROLE IF NOT EXISTS \'role_analyst\', \'role_dev\'@\'localhost\';\n  ```\n  - Si l\'hôte n\'est pas spécifié, MySQL applique automatiquement `\'%\'`.\n  - Requiert le privilège `CREATE USER` ou `ROLE_ADMIN`.\n- **Suppression** :\n  ```sql\n  DROP ROLE IF EXISTS \'role_dev\'@\'localhost\';\n  ```\n  - Supprime le rôle de `mysql.user`, nettoie les arêtes du graphe dans `mysql.role_edges` et les configurations de rôles par défaut dans `mysql.default_roles`.\n  - Les utilisateurs qui possédaient ce rôle perdent immédiatement les privilèges associés dès leur prochaine vérification de session.',
      explanation: 'DROP ROLE est atomique et crash-safe sous MySQL 8.0.',
      examTrap: 'DROP USER peut également supprimer un rôle technique puisqu\'il figure dans mysql.user, mais l\'instruction standard et recommandée reste DROP ROLE.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - CREATE ROLE & DROP ROLE Statements',
    },
  },
  {
    id: 'fc-mysql908-dom03-066',
    cardNumber: 66,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Attribution de privilèges à un rôle',
    difficulty: 'easy',
    tags: ['GRANT', 'Roles', 'RBAC', 'Privileges'],
    front: {
      question: 'Comment alimenter un rôle en privilèges SQL sur différentes bases et tables ?',
      codeSnippet: `GRANT SELECT ON erp.* TO 'role_reader';
GRANT INSERT, UPDATE, DELETE ON erp.commandes TO 'role_editor';
GRANT EXECUTE ON PROCEDURE erp.cloturer_mois TO 'role_editor';`,
      hint: 'La syntaxe GRANT est identique à celle utilisée pour un compte utilisateur standard.',
    },
    back: {
      answer: 'Attribution de privilèges à un rôle :\n\n- On utilise la commande standard `GRANT` en ciblant le nom du rôle :\n  ```sql\n  GRANT SELECT ON erp.* TO \'role_reader\';\n  GRANT INSERT, UPDATE ON erp.commandes TO \'role_reader\';\n  GRANT BACKUP_ADMIN ON *.* TO \'role_infra\';\n  ```\n- Un rôle peut recevoir n\'importe quelle combinaison de :\n  1. Privilèges statiques globaux, bases, tables, colonnes ou routines.\n  2. Privilèges dynamiques (`BACKUP_ADMIN`, `SYSTEM_VARIABLES_ADMIN`).\n- Toute modification des privilèges d\'un rôle (ajout via `GRANT` ou retrait via `REVOKE`) est **immédiatement répercutée** sur tous les utilisateurs connectés pour lesquels ce rôle est actuellement actif !',
      explanation: 'Cette réactivité dynamique en temps réel évite d\'avoir à reconnecter les utilisateurs pour propager un correctif de droits.',
      examTrap: 'On ne peut pas utiliser IDENTIFIED BY lors d\'un GRANT vers un rôle (les rôles n\'ont pas de mot de passe).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Granting Privileges to Roles',
    },
  },
  {
    id: 'fc-mysql908-dom03-067',
    cardNumber: 67,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Attribution de rôles aux utilisateurs et clause WITH ADMIN OPTION',
    difficulty: 'medium',
    tags: ['WITH ADMIN OPTION', 'Roles', 'Delegation', 'RBAC'],
    front: {
      question: 'Comment assigner un rôle à un utilisateur et quelle est la fonction de la clause WITH ADMIN OPTION ?',
      codeSnippet: `GRANT 'role_reader' TO 'alice'@'%', 'bob'@'%';
GRANT 'role_editor' TO 'charlie'@'%' WITH ADMIN OPTION;`,
      hint: 'WITH ADMIN OPTION permet au bénéficiaire de réassigner ce rôle à d\'autres utilisateurs.',
    },
    back: {
      answer: 'Attribution de rôles et délégation :\n\n- **Syntaxe d\'attribution** : `GRANT \'nom_role\' TO \'utilisateur\'@\'host\';`\n- **Clause `WITH ADMIN OPTION`** :\n  - Confère à l\'utilisateur (`charlie`) le droit de transmettre ce rôle spécifique (`role_editor`) à d\'autres comptes ou rôles, et de le révoquer.\n  - Analogue à `WITH GRANT OPTION`, mais appliqué spécifiquement au graphe de rôles.\n  - Requiert que l\'utilisateur qui accorde le rôle possède lui-même soit le rôle avec `WITH ADMIN OPTION`, soit le privilège dynamique global `ROLE_ADMIN`.',
      explanation: 'Permet à un chef de projet d\'intégrer de nouveaux membres dans son équipe sans solliciter le DBA.',
      examTrap: 'Ne confondez pas WITH GRANT OPTION (pour les privilèges SQL sur les objets) et WITH ADMIN OPTION (pour l\'attribution des rôles) !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Granting Roles to Users or Other Roles',
    },
  },
  {
    id: 'fc-mysql908-dom03-068',
    cardNumber: 68,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Rôles applicables vs rôles actifs (Active Roles)',
    difficulty: 'hard',
    tags: ['Active Roles', 'Applicable Roles', 'Troubleshooting', 'RBAC'],
    front: {
      question: 'Un utilisateur à qui l\'on vient d\'accorder le rôle \'role_reader\' se connecte, mais reçoit "Access denied" sur la base autorisée. Pourquoi et quelle étape manque-t-il ?',
      codeSnippet: `GRANT 'role_reader' TO 'david'@'%';
-- David se connecte :
SELECT * FROM erp.articles;
-- ERROR 1142 (42000): SELECT command denied to user 'david'@'%' for table 'articles'`,
      hint: 'Par défaut dans MySQL, un rôle accordé n\'est PAS activé lors de l\'ouverture de session ! Il doit être activé par SET ROLE ou défini comme rôle par défaut.',
    },
    back: {
      answer: 'Cause du blocage : le rôle n\'est pas **ACTIF** !\n\n- Dans le modèle RBAC de MySQL, un rôle accordé à un utilisateur est un **rôle applicable (Applicable Role)**, mais il est **inactif par défaut** lors de la connexion.\n- Tant qu\'un rôle n\'est pas activé en mémoire dans la session, ses privilèges ne sont pas évalués par le moteur de sécurité.\n- **Pour résoudre le problème (3 solutions)** :\n  1. L\'utilisateur active son rôle dans sa session : `SET ROLE \'role_reader\';` (ou `SET ROLE ALL;`).\n  2. L\'administrateur définit ce rôle comme rôle par défaut à la connexion : `SET DEFAULT ROLE ALL TO \'david\'@\'%\';`.\n  3. Le serveur active automatiquement tous les rôles via la variable globale : `activate_all_roles_on_login = ON`.',
      explanation: 'C\'est le piège numéro un rencontré par les administrateurs découvrant les rôles sous MySQL 8.0.',
      examTrap: 'Question d\'examen ultra-fréquente : "Un utilisateur a reçu un rôle mais ne peut pas faire de SELECT". La réponse est TOUJOURS : le rôle n\'a pas été activé en session.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Activating Roles',
    },
  },
  {
    id: 'fc-mysql908-dom03-069',
    cardNumber: 69,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Activation et basculement de rôles en session avec SET ROLE',
    difficulty: 'medium',
    tags: ['SET ROLE', 'Session', 'Security Context', 'RBAC'],
    front: {
      question: 'Quelles sont les variantes de la commande SET ROLE permettant d\'activer tous ses rôles, aucun rôle, ou d\'en exclure certains ?',
      codeSnippet: `SET ROLE 'role_analyst';
SET ROLE ALL;
SET ROLE ALL EXCEPT 'role_admin';
SET ROLE NONE;
SET ROLE DEFAULT;`,
      hint: 'SET ROLE modifie immédiatement la liste des privilèges actifs de la session courante.',
    },
    back: {
      answer: 'Syntaxe et variantes de `SET ROLE` :\n\n- **`SET ROLE \'r1\', \'r2\';`** : Active uniquement les rôles désignés et désactive tous les autres.\n- **`SET ROLE ALL;`** : Active l\'intégralité des rôles applicables à l\'utilisateur connecté.\n- **`SET ROLE ALL EXCEPT \'r_admin\';`** : Active tous les rôles accordés sauf celui spécifié (utile pour limiter temporairement ses privilèges pour un script).\n- **`SET ROLE NONE;`** : Désactive **absolument tous les rôles** ; l\'utilisateur ne conserve que ses privilèges attribués directement à son compte.\n- **`SET ROLE DEFAULT;`** : Réactive les rôles définis comme par défaut dans `mysql.default_roles`.',
      explanation: 'Permet à un utilisateur à privilèges multiples de basculer dans un profil restreint pour exécuter des tâches ordinaires en toute sécurité.',
      examTrap: 'SET ROLE ne fonctionne que pour les rôles que l\'utilisateur s\'est vu explicitement accorder avec GRANT.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - SET ROLE Statement',
    },
  },
  {
    id: 'fc-mysql908-dom03-070',
    cardNumber: 70,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Configuration des rôles par défaut : SET DEFAULT ROLE',
    difficulty: 'medium',
    tags: ['SET DEFAULT ROLE', 'mysql.default_roles', 'Automation', 'RBAC'],
    front: {
      question: 'Quelle instruction permet au DBA de faire en sorte qu\'un utilisateur active automatiquement ses rôles dès qu\'il ouvre une session sans devoir exécuter SET ROLE ?',
      codeSnippet: `SET DEFAULT ROLE ALL TO 'analyst_user'@'%';
SET DEFAULT ROLE 'role_read', 'role_write' TO 'dev'@'%';
SET DEFAULT ROLE NONE TO 'intern'@'%';`,
      hint: 'Instruction SET DEFAULT ROLE, dont la configuration est persistée dans la table mysql.default_roles.',
    },
    back: {
      answer: 'Instruction `SET DEFAULT ROLE` :\n\n- Permet d\'assigner un ensemble de rôles qui deviendront **automatiquement actifs dès l\'authentification du client** :\n  ```sql\n  SET DEFAULT ROLE ALL TO \'analyst_user\'@\'%\';\n  SET DEFAULT ROLE \'role_read\' TO \'bob\'@\'%\';\n  ```\n- **Stockage** : Cette configuration est persistée dans la table système **`mysql.default_roles`** (`HOST`, `USER`, `DEFAULT_ROLE_HOST`, `DEFAULT_ROLE_USER`).\n- Requiert le privilège `ROLE_ADMIN` ou que l\'utilisateur modifie ses propres rôles par défaut.\n- Évite toute friction applicative avec les outils tiers (BI, applications Web) qui ne savent pas exécuter `SET ROLE`.',
      explanation: 'Si de nouveaux rôles sont accordés ultérieurement à un utilisateur ayant DEFAULT ROLE ALL, ils seront également activés automatiquement au login suivant.',
      examTrap: 'SET DEFAULT ROLE ALL n\'active pas les rôles dans la session en cours du DBA ! Cela configure le comportement pour les futures connexions du compte ciblé.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - SET DEFAULT ROLE Statement',
    },
  },
  {
    id: 'fc-mysql908-dom03-071',
    cardNumber: 71,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Activation globale automatique : variable activate_all_roles_on_login',
    difficulty: 'medium',
    tags: ['activate_all_roles_on_login', 'Configuration', 'RBAC', 'my.cnf'],
    front: {
      question: 'Quelle variable système globale permet d\'ordonner à MySQL d\'activer systématiquement tous les rôles accordés pour tous les utilisateurs lors de leur connexion ?',
      codeSnippet: `SET PERSIST activate_all_roles_on_login = ON;`,
      hint: 'activate_all_roles_on_login surcharge le besoin de SET DEFAULT ROLE individuel.',
    },
    back: {
      answer: 'Variable système globale : **`activate_all_roles_on_login`** :\n\n- **Valeur par défaut** : `OFF` (conformité stricte avec le standard SQL où les rôles doivent être activés explicitement).\n- **Si positionnée à `ON`** :\n  - Dès qu\'un utilisateur se connecte avec succès, le serveur exécute implicitement un `SET ROLE ALL` pour sa session.\n  - Tous les rôles qui lui ont été attribués deviennent actifs immédiatement.\n  - Rend inutile la maintenance individuelle de `SET DEFAULT ROLE` pour chaque utilisateur.\n- Peut être configurée dans `my.cnf` ou persistée dynamiquement avec `SET PERSIST`.',
      explanation: 'Très populaire dans les entreprises qui adoptent massivement le RBAC pour éviter les tickets de support liés à l\'oubli d\'activation des rôles.',
      examTrap: 'Si activate_all_roles_on_login est à ON, la table mysql.default_roles est ignorée au login au profit de tous les rôles applicables.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: activate_all_roles_on_login',
    },
  },
  {
    id: 'fc-mysql908-dom03-072',
    cardNumber: 72,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Rôles obligatoires du serveur : variable mandatory_roles',
    difficulty: 'hard',
    tags: ['mandatory_roles', 'Compliance', 'Security Baseline', 'RBAC'],
    front: {
      question: 'Comment imposer un ensemble de rôles de sécurité minimum à tous les utilisateurs du serveur sans exception via mandatory_roles ?',
      codeSnippet: `# Dans my.cnf ou via SET PERSIST :
mandatory_roles = 'role_audit,role_security_baseline@%'`,
      hint: 'mandatory_roles force l\'attribution de ces rôles à tout utilisateur se connectant.',
    },
    back: {
      answer: 'Fonctionnement de **`mandatory_roles`** :\n\n- Variable système (définie dans `my.cnf` ou via `SET PERSIST mandatory_roles = \'role1,role2@%\';`).\n- **Effet obligatoire** : Les rôles listés sont **automatiquement attribués à TOUS les utilisateurs** se connectant au serveur MySQL.\n- Ils ne peuvent pas être révoqués individuellement avec `REVOKE`.\n- Même si un utilisateur exécute `SET ROLE NONE;`, les rôles obligatoires de `mandatory_roles` **restent actifs et ne peuvent pas être désactivés** par la session.\n- Permet d\'imposer un cadre de sécurité inviolable (ex: droit d\'audit, lecture seule sur des référentiels transverses).',
      explanation: 'Idéal pour garantir la conformité aux audits de sécurité (SOC2, ISO 27001) sur l\'ensemble du parc.',
      examTrap: 'Si un rôle listé dans mandatory_roles n\'existe pas dans mysql.user au démarrage, le serveur démarre mais enregistre une erreur dans le log d\'erreur.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: mandatory_roles',
    },
  },
  {
    id: 'fc-mysql908-dom03-073',
    cardNumber: 73,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Rôles imbriqués et graphe d\'héritage : table mysql.role_edges',
    difficulty: 'hard',
    tags: ['role_edges', 'Nested Roles', 'Graph', 'Inheritance'],
    front: {
      question: 'Comment fonctionne l\'héritage entre rôles (rôles imbriqués) dans MySQL 8.0 et quelle table stocke ce graphe acyclique ?',
      codeSnippet: `CREATE ROLE 'junior_dev', 'senior_dev';
GRANT SELECT ON db.* TO 'junior_dev';
GRANT INSERT, UPDATE ON db.* TO 'senior_dev';
-- Imbrication :
GRANT 'junior_dev' TO 'senior_dev';
GRANT 'senior_dev' TO 'alice'@'%';`,
      hint: 'Un rôle peut être accordé à un autre rôle, formant un graphe de rôles stocké dans mysql.role_edges.',
    },
    back: {
      answer: 'Graphe d\'héritage et rôles imbriqués :\n\n- **Héritage direct** : Lorsqu\'un rôle (`junior_dev`) est accordé à un autre rôle (`senior_dev`), `senior_dev` hérite automatiquement de tous les privilèges de `junior_dev`.\n- Lorsque l\'utilisateur `alice` active `senior_dev`, elle reçoit automatiquement les privilèges combinés de `senior_dev` ET de `junior_dev`.\n- **Table système `mysql.role_edges`** :\n  - Stocke les arêtes du graphe orienté (`FROM_USER`, `FROM_HOST`, `TO_USER`, `TO_HOST`, `WITH_ADMIN_OPTION`).\n- MySQL prévient automatiquement les cycles infinis lors de l\'évaluation des privilèges.',
      explanation: 'Permet de modéliser fidèlement les hiérarchies d\'équipes techniques dans les grandes organisations.',
      examTrap: 'Si vous révoquez junior_dev de senior_dev, alice perd immédiatement les privilèges associés sans que sa session ne soit interrompue.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Role Graph & mysql.role_edges Table',
    },
  },
  {
    id: 'fc-mysql908-dom03-074',
    cardNumber: 74,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Révocation de rôles avec REVOKE',
    difficulty: 'medium',
    tags: ['REVOKE', 'Roles', 'RBAC', 'Privileges'],
    front: {
      question: 'Quelle est la syntaxe pour retirer un rôle à un utilisateur ou retirer un sous-rôle à un rôle parent ?',
      codeSnippet: `REVOKE 'role_editor' FROM 'charlie'@'%';
REVOKE 'junior_dev' FROM 'senior_dev';`,
      hint: 'REVOKE role_name FROM target_user_or_role.',
    },
    back: {
      answer: 'Révocation de rôles :\n\n```sql\nREVOKE \'role_name\' FROM \'user\'@\'host\';\nREVOKE \'sub_role\' FROM \'parent_role\';\n```\n\nEffets :\n- Supprime l\'arête d\'association correspondante dans la table `mysql.role_edges`.\n- Si le rôle figurait dans les rôles par défaut de l\'utilisateur (`mysql.default_roles`), il en est retiré automatiquement.\n- Si l\'utilisateur avait une session active exploitant ce rôle, les privilèges apportés par ce rôle sont **immédiatement invalidés** pour les requêtes suivantes de sa session.\n- Requiert le privilège `ROLE_ADMIN` ou la possession du rôle avec `WITH ADMIN OPTION`.',
      explanation: 'Pour détruire complètement le rôle du serveur, il faut faire DROP ROLE.',
      examTrap: 'Ne pas confondre révoquer un PRIVILÈGE d\'un rôle (REVOKE SELECT ON db.* FROM role;) et révoquer un RÔLE d\'un utilisateur (REVOKE role FROM user;).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Revoking Roles',
    },
  },
  {
    id: 'fc-mysql908-dom03-075',
    cardNumber: 75,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Inspection des rôles actifs : CURRENT_ROLE() et tables de Performance Schema',
    difficulty: 'medium',
    tags: ['CURRENT_ROLE', 'Performance Schema', 'Inspection', 'RBAC'],
    front: {
      question: 'Comment vérifier quels rôles sont actuellement actifs dans sa propre session et quelles tables du Performance Schema exposent l\'état des rôles ?',
      codeSnippet: `SELECT CURRENT_ROLE();
-- Tables de Performance Schema :
-- performance_schema.enabled_roles
-- performance_schema.applicable_roles`,
      hint: 'Fonction SQL CURRENT_ROLE() et tables enabled_roles / applicable_roles.',
    },
    back: {
      answer: 'Inspection des rôles en session :\n\n1. **Fonction SQL `CURRENT_ROLE()`** :\n   - Retourne la liste des rôles actifs pour la session sous forme de chaîne (`\'`r1`@`%`,`r2`@`%\'`) ou `NONE` si aucun rôle n\'est actif.\n2. **Tables du Performance Schema** :\n   - **`performance_schema.applicable_roles`** : Liste tous les rôles qui ont été accordés à l\'utilisateur connecté (qu\'ils soient activés ou non).\n   - **`performance_schema.enabled_roles`** : Liste uniquement les rôles qui sont **actuellement activés** dans la session en cours.\n3. **Visualisation graphique avec `ROLES_GRAPHML()`** :\n   - Fonction retournant une chaîne XML/GraphML modélisant tout le graphe de rôles du serveur pour affichage dans un outil comme Gephi ou yEd.',
      explanation: 'Permet un débogage rapide lorsqu\'un utilisateur ne comprend pas pourquoi une instruction lui est refusée.',
      examTrap: 'Si CURRENT_ROLE() retourne NONE, l\'utilisateur ne bénéficie d\'aucun privilège issu de ses rôles ! Il doit exécuter SET ROLE.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Information Functions: CURRENT_ROLE',
    },
  },

  // =========================================================================
  // SECTION 6 : COMPOSANT PASSWORD VALIDATION & GOUVERNANCE DES RESSOURCES (Cartes 76 à 84)
  // validate_password component, POLICIES (LOW, MEDIUM, STRONG),
  // MAX_QUERIES_PER_HOUR, MAX_USER_CONNECTIONS, admin_address/admin_port,
  // VALIDATE_PASSWORD_STRENGTH, Partial Revokes (partial_revokes=ON)
  // =========================================================================
  {
    id: 'fc-mysql908-dom03-076',
    cardNumber: 76,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Installation et architecture du composant validate_password',
    difficulty: 'medium',
    tags: ['validate_password', 'Components', 'Password Policy', 'Installation'],
    front: {
      question: 'Comment installer le composant validate_password sous MySQL 8.0 et pourquoi remplace-t-il l\'ancien plugin ?',
      codeSnippet: `INSTALL COMPONENT 'file://component_validate_password';
-- Pour désinstaller :
-- UNINSTALL COMPONENT 'file://component_validate_password';`,
      hint: 'MySQL 8.0 a migré l\'ancien plugin vers la nouvelle architecture des composants serveur.',
    },
    back: {
      answer: 'Installation du composant `validate_password` :\n\n- **Commande d\'installation** :\n  ```sql\n  INSTALL COMPONENT \'file://component_validate_password\';\n  ```\n- **Pourquoi un composant ?** :\n  - L\'architecture des composants de MySQL 8.0 surpasse l\'ancien système de plugins (meilleure encapsulation, chargement indépendant sans modifier les tables système).\n  - L\'ancien plugin `validate_password.so` est déprécié.\n- Dès son installation, le composant intercepte toute instruction `CREATE USER`, `ALTER USER` ou `SET PASSWORD` et rejette les mots de passe ne respectant pas les règles de complexité avec l\'erreur `ER_NOT_VALID_PASSWORD`.\n- Les variables associées sont désormais préfixées par `validate_password.*`.',
      explanation: 'Le composant s\'enregistre dans la table `mysql.component` et se recharge automatiquement à chaque redémarrage du serveur.',
      examTrap: 'Ne chargez pas simultanément l\'ancien plugin validate_password et le nouveau composant component_validate_password sous peine de conflits.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The Password Validation Component',
    },
  },
  {
    id: 'fc-mysql908-dom03-077',
    cardNumber: 77,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Niveaux de politique de complexité : LOW, MEDIUM et STRONG',
    difficulty: 'medium',
    tags: ['validate_password', 'Policies', 'LOW', 'MEDIUM', 'STRONG'],
    front: {
      question: 'Quelles sont les exigences précises des trois politiques de validation de mot de passe LOW, MEDIUM et STRONG ?',
      codeSnippet: `SET PERSIST validate_password.policy = 'MEDIUM';`,
      hint: 'LOW teste la longueur, MEDIUM ajoute la mixité des caractères, STRONG ajoute le fichier dictionnaire.',
    },
    back: {
      answer: 'Les 3 politiques de `validate_password.policy` :\n\n1. **`LOW` (0)** :\n   - Vérifie uniquement la **longueur minimale** du mot de passe (`validate_password.length`, par défaut 8 caractères).\n2. **`MEDIUM` (1 - Valeur par défaut courante)** :\n   - Satisfait toutes les exigences de `LOW`.\n   - **ET** exige un nombre minimum de chiffres (`number_count`, déf: 1).\n   - **ET** exige un nombre de minuscules et de majuscules (`mixed_case_count`, déf: 1).\n   - **ET** exige un nombre de caractères spéciaux (`special_char_count`, déf: 1).\n3. **`STRONG` (2)** :\n   - Satisfait toutes les exigences de `MEDIUM`.\n   - **ET** compare le mot de passe à un **fichier dictionnaire** de mots courants (`validate_password.dictionary_file`) : tout mot de plus de 4 lettres figurant dans le dictionnaire est rejeté.',
      explanation: 'La politique STRONG est indispensable pour les environnements bancaires ou régis par des contraintes de sécurité étatiques.',
      examTrap: 'validate_password.length par défaut vaut 8, mais si vous mettez une politique MEDIUM avec 2 chiffres, 2 majuscules, 2 minuscules et 2 caractères spéciaux, le minimum réel sera 8 automatiquement.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Password Validation Options and Variables',
    },
  },
  {
    id: 'fc-mysql908-dom03-078',
    cardNumber: 78,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Vérification par fichier dictionnaire dans validate_password',
    difficulty: 'hard',
    tags: ['validate_password', 'Dictionary', 'STRONG', 'Security'],
    front: {
      question: 'Comment configurer et activer la vérification de mots de passe par dictionnaire pour interdire l\'utilisation de termes d\'entreprise courants ?',
      codeSnippet: `SET PERSIST validate_password.dictionary_file = '/var/lib/mysql-files/forbidden_words.txt';
SET PERSIST validate_password.policy = 'STRONG';`,
      hint: 'Nécessite de renseigner validate_password.dictionary_file et de positionner policy sur STRONG.',
    },
    back: {
      answer: 'Configuration du dictionnaire de mots de passe :\n\n1. Créer un fichier texte contenant un mot interdit par ligne (en minuscules) :\n   ```text\n   password\n   entreprise\n   azerty\n   admin123\n   ```\n2. Définir le chemin dans MySQL :\n   ```sql\n   SET PERSIST validate_password.dictionary_file = \'/etc/mysql/words.txt\';\n   SET PERSIST validate_password.policy = \'STRONG\';\n   ```\n3. **Fonctionnement de la comparaison** :\n   - Lors de la création d\'un compte, les sous-chaînes de 4 caractères consécutifs ou plus du mot de passe proposé sont confrontées aux entrées du dictionnaire (sans distinction de casse).\n   - Si une correspondance est trouvée, le mot de passe est rejeté avec `ER_NOT_VALID_PASSWORD`.',
      explanation: 'Bloque les variantes simples comme "P@ssword123!" qui valideraient sinon une politique MEDIUM.',
      examTrap: 'Le fichier dictionnaire doit être accessible en lecture par l\'utilisateur système de l\'OS mysql (droits chmod/chown).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - validate_password.dictionary_file',
    },
  },
  {
    id: 'fc-mysql908-dom03-079',
    cardNumber: 79,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Test interactif de robustesse : fonction VALIDATE_PASSWORD_STRENGTH()',
    difficulty: 'easy',
    tags: ['VALIDATE_PASSWORD_STRENGTH', 'Functions', 'Security', 'Testing'],
    front: {
      question: 'Quelle fonction SQL intégrée au composant validate_password permet de mesurer le score de robustesse d\'un mot de passe sur une échelle de 0 à 100 ?',
      codeSnippet: `SELECT VALIDATE_PASSWORD_STRENGTH('weak');       -- Score : 0
SELECT VALIDATE_PASSWORD_STRENGTH('Tr0ub4dor&3'); -- Score : 100`,
      hint: 'Fonction VALIDATE_PASSWORD_STRENGTH() retournant un entier de 0 à 100.',
    },
    back: {
      answer: 'La fonction **`VALIDATE_PASSWORD_STRENGTH(\'mot_de_passe\')`** :\n\n- Évalue un mot de passe candidat contre la politique actuellement active du composant `validate_password`.\n- Retourne un score sous forme d\'entier compris entre **`0` et `100`** :\n  - `0` à `25` : Extrêmement faible (rejeté par toutes les politiques).\n  - `50` : Satisfait la politique `LOW` (longueur suffisante).\n  - `75` : Satisfait la politique `MEDIUM` (mélange de caractères respecté).\n  - `100` : Satisfait la politique `STRONG` (très robuste, aucun mot de dictionnaire détecté).\n- Permet aux applications frontend ou aux scripts de pré-validation de tester les mots de passe avant de soumettre un `ALTER USER`.',
      explanation: 'Cette fonction est chargée automatiquement avec le composant validate_password.',
      examTrap: 'Si le composant component_validate_password n\'est pas installé, l\'appel à la fonction VALIDATE_PASSWORD_STRENGTH() renvoie une erreur FUNCTION does not exist.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - VALIDATE_PASSWORD_STRENGTH()',
    },
  },
  {
    id: 'fc-mysql908-dom03-080',
    cardNumber: 80,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Gouvernance des ressources : MAX_QUERIES, UPDATES et CONNECTIONS PER HOUR',
    difficulty: 'medium',
    tags: ['Resource Governance', 'MAX_QUERIES_PER_HOUR', 'Rate Limiting', 'Security'],
    front: {
      question: 'Comment limiter le taux de requêtes, de modifications et de connexions par heure pour un compte utilisateur spécifique ?',
      codeSnippet: `ALTER USER 'external_crawler'@'%' WITH
  MAX_QUERIES_PER_HOUR 10000
  MAX_UPDATES_PER_HOUR 500
  MAX_CONNECTIONS_PER_HOUR 50;`,
      hint: 'Clauses MAX_QUERIES_PER_HOUR, MAX_UPDATES_PER_HOUR et MAX_CONNECTIONS_PER_HOUR dans CREATE/ALTER USER.',
    },
    back: {
      answer: 'Limites de ressources horaires par compte :\n\n- **`MAX_QUERIES_PER_HOUR count`** : Plafonne le nombre total de requêtes (SELECT, etc.) que le compte peut exécuter par tranche d\'une heure.\n- **`MAX_UPDATES_PER_HOUR count`** : Plafonne les requêtes modifiant des données (INSERT, UPDATE, DELETE, CREATE, etc.).\n- **`MAX_CONNECTIONS_PER_HOUR count`** : Plafonne le nombre d\'ouvertures de sessions réussies par heure.\n- **Comportement en cas de dépassement** : Le serveur renvoie une erreur `ER_USER_LIMIT_REACHED` et bloque l\'action jusqu\'à la fin de l\'heure courante.\n- **Réinitialisation manuelle** : L\'administrateur peut remettre à zéro tous les compteurs horaires avec la commande : `FLUSH USER_RESOURCES;`.',
      explanation: 'Protège le serveur contre les dérives de scripts de scrapping ou les boucles infinies de code applicatif.',
      examTrap: 'Une valeur de 0 (défaut) signifie qu\'aucune limite n\'est imposée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Setting Account Resource Limits',
    },
  },
  {
    id: 'fc-mysql908-dom03-081',
    cardNumber: 81,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Limitation des sessions simultanées : MAX_USER_CONNECTIONS',
    difficulty: 'medium',
    tags: ['MAX_USER_CONNECTIONS', 'max_user_connections', 'Resource Governance'],
    front: {
      question: 'Comment empêcher un compte applicatif défaillant de monopoliser l\'ensemble des connexions du serveur MySQL ?',
      codeSnippet: `-- Au niveau global :
SET PERSIST max_user_connections = 50;

-- Au niveau individuel pour un compte :
ALTER USER 'batch_job'@'%' WITH MAX_USER_CONNECTIONS 3;`,
      hint: 'Variable globale max_user_connections ou clause MAX_USER_CONNECTIONS par compte.',
    },
    back: {
      answer: 'Contrôle des connexions concurrentes avec `MAX_USER_CONNECTIONS` :\n\n1. **Au niveau global (`max_user_connections`)** :\n   - Variable globale qui limite le nombre de sessions ouvertes simultanément par n\'importe quel compte.\n2. **Au niveau individuel (`WITH MAX_USER_CONNECTIONS N`)** :\n   - Clause de `CREATE USER` ou `ALTER USER` qui fixe le plafond de sessions concurrentes pour ce compte spécifique (ex: 3 connexions max).\n   - Si le compte tente une 4ème connexion, il reçoit `ERROR 1203 (42000): User batch_job already has more than \'max_user_connections\' active connections`.\n   - Surcharge la valeur globale pour ce compte.',
      explanation: 'Empêche qu\'une fuite de connexions dans un microservice ne sature le pool global max_connections et ne rende le serveur inaccessible aux autres applications.',
      examTrap: 'Si MAX_USER_CONNECTIONS est à 0 sur le compte, il hérite de la variable globale max_user_connections.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Limiting Account Resources: MAX_USER_CONNECTIONS',
    },
  },
  {
    id: 'fc-mysql908-dom03-082',
    cardNumber: 82,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Interface d\'administration dédiée : admin_address, admin_port et SERVICE_CONNECTION_ADMIN',
    difficulty: 'hard',
    tags: ['admin_port', 'admin_address', 'SERVICE_CONNECTION_ADMIN', 'High Availability'],
    front: {
      question: 'Comment configurer un port d\'administration réseau dédié sous MySQL 8.0.14+ pour garantir l\'accès du DBA même en cas de saturation totale du port standard 3306 ?',
      codeSnippet: `# Dans my.cnf :
admin_address = '127.0.0.1'
admin_port = 33062

-- Privilège requis sur le compte du DBA :
GRANT SERVICE_CONNECTION_ADMIN ON *.* TO 'admin'@'localhost';`,
      hint: 'Variables admin_address / admin_port et privilège dynamique SERVICE_CONNECTION_ADMIN.',
    },
    back: {
      answer: 'Interface réseau d\'administration dédiée (MySQL 8.0.14+) :\n\n- **Principe** : Permet au serveur d\'écouter sur une adresse IP et un port TCP séparés (ex: `admin_port = 33062`), indépendamment du port standard (3306).\n- **Bénéfice absolu** : Ce canal d\'administration ne possède **aucune limite de connexions** soumise à `max_connections`. Le DBA peut toujours s\'y connecter pour diagnostiquer la panne, même si 10 000 connexions saturent le port 3306.\n- **Sécurisation par privilège** :\n  - Seuls les utilisateurs possédant le privilège dynamique **`SERVICE_CONNECTION_ADMIN`** sont autorisés à ouvrir une session sur cette interface dédiée.\n  - Toute tentative d\'un utilisateur ordinaire est rejetée.',
      explanation: 'Remplace l\'ancien mécanisme fragile du slot unique supplémentaire `max_connections + 1` qui pouvait être consommé par inadvertance.',
      examTrap: 'admin_address ne supporte pas le joker 0.0.0.0 sous certaines versions ; il est recommandé de le lier à une interface réseau privée d\'administration ou à 127.0.0.1.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Administrative Interface Support',
    },
  },
  {
    id: 'fc-mysql908-dom03-083',
    cardNumber: 83,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Révocations partielles de privilèges globaux : partial_revokes',
    difficulty: 'hard',
    tags: ['partial_revokes', 'Global Privileges', 'Fine-Grained Security', 'Compliance'],
    front: {
      question: 'Comment autoriser un utilisateur à faire des SELECT sur toutes les bases actuelles et futures du serveur, SAUF sur la base ultra-confidentielle "rh_salaires" ?',
      codeSnippet: `SET PERSIST partial_revokes = ON;
GRANT SELECT ON *.* TO 'general_dev'@'%';
REVOKE SELECT ON rh_salaires.* FROM 'general_dev'@'%';`,
      hint: 'Activer la variable système partial_revokes = ON.',
    },
    back: {
      answer: 'Fonctionnalité des révocations partielles (**Partial Revokes**) :\n\n1. **Activation requise** :\n   `SET PERSIST partial_revokes = ON;`\n2. **Fonctionnement** :\n   - Par défaut, MySQL interdit d\'exécuter un `REVOKE` au niveau base si le privilège provient de `*.*`.\n   - Avec `partial_revokes = ON`, MySQL autorise des **exceptions explicites** à un droit global :\n     ```sql\n     GRANT SELECT, INSERT ON *.* TO \'general_dev\'@\'%\';\n     REVOKE SELECT, INSERT ON rh_salaires.* FROM \'general_dev\'@\'%\';\n     ```\n3. **Résultat** : L\'utilisateur a les droits sur toutes les bases existantes et sur toutes les bases qui seront créées à l\'avenir, mais son accès est expressément bloqué sur `rh_salaires`.\n4. Les restrictions partielles sont stockées dans la colonne `User_attributes` de `mysql.user`.',
      explanation: 'Évite de devoir écrire 200 lignes de GRANT pour 200 schémas différents quand on veut juste en exclure un seul.',
      examTrap: 'Une fois qu\'une révocation partielle a été définie pour au moins un utilisateur, la variable partial_revokes ne peut plus être repassée à OFF tant que toutes les révocations partielles n\'ont pas été nettoyées !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Partial Revokes for Privileges',
    },
  },
  {
    id: 'fc-mysql908-dom03-084',
    cardNumber: 84,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilège SYSTEM_USER et protection des comptes administratifs',
    difficulty: 'hard',
    tags: ['SYSTEM_USER', 'Privilege Escalation', 'Security', 'Administration'],
    front: {
      question: 'À quoi sert le privilège dynamique SYSTEM_USER sous MySQL 8.0 et comment protège-t-il les super-administrateurs contre les DBAs juniors ?',
      codeSnippet: `GRANT SYSTEM_USER ON *.* TO 'root'@'localhost';`,
      hint: 'Distingue les utilisateurs réguliers des utilisateurs système : un utilisateur régulier ne peut ni modifier ni tuer un utilisateur système.',
    },
    back: {
      answer: 'Rôle du privilège dynamique **`SYSTEM_USER`** :\n\n- Établit une distinction formelle entre les **comptes système** (`SYSTEM_USER`) et les **comptes réguliers** :\n  1. **Protection contre la modification** : Un administrateur possédant des privilèges standard (comme `CREATE USER`, `DROP USER`, `GRANT`) mais ne possédant PAS `SYSTEM_USER` ne peut **ni modifier (`ALTER USER`), ni supprimer (`DROP USER`), ni révoquer les privilèges** d\'un compte doté de `SYSTEM_USER`.\n  2. **Protection contre la terminaison (`KILL`)** : Il ne peut pas tuer les requêtes ou sessions appartenant à un `SYSTEM_USER`.\n  3. **Protection des triggers/vues** : Il ne peut pas créer d\'objet dont le `DEFINER` est un compte système.\n- Empêche un DBA junior délégué de s\'approprier le compte `root` ou d\'altérer les procédures de sauvegarde du super-admin.',
      explanation: 'Crucial pour la sécurité dans les environnements infogérés où plusieurs équipes d\'exploitation cohabitent.',
      examTrap: 'Lors d\'une mise à jour vers MySQL 8.0, assurez-vous que les comptes d\'administration principaux reçoivent bien le privilège SYSTEM_USER.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The SYSTEM_USER Dynamic Privilege',
    },
  },

  // =========================================================================
  // SECTION 7 : CHIFFREMENT DU RÉSEAU (TLS/SSL) & CONNEXIONS SÉCURISÉES (Cartes 85 à 92)
  // require_secure_transport, REQUIRE SSL/X509/CIPHER/ISSUER/SUBJECT,
  // auto_generate_certs, tls_version, tls_ciphersuites, ALTER INSTANCE RELOAD TLS
  // =========================================================================
  {
    id: 'fc-mysql908-dom03-085',
    cardNumber: 85,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Obligation globale de chiffrement réseau : require_secure_transport',
    difficulty: 'medium',
    tags: ['require_secure_transport', 'TLS', 'SSL', 'Encryption in Transit'],
    front: {
      question: 'Comment obliger l\'ensemble des connexions clientes à utiliser impérativement un canal chiffré (TLS/SSL) ou un socket local sous MySQL 8.0 ?',
      codeSnippet: `SET PERSIST require_secure_transport = ON;`,
      hint: 'La variable système require_secure_transport = ON rejette toutes les connexions TCP/IP en clair.',
    },
    back: {
      answer: 'Obligation de chiffrement réseau avec `require_secure_transport` :\n\n- Variable globale dynamique : `SET PERSIST require_secure_transport = ON;`.\n- **Effet radical** :\n  - Rejette instantanément toute tentative de connexion via TCP/IP non chiffrée avec l\'erreur `ER_SECURE_TRANSPORT_REQUIRED` (ERROR 3159 : *Connections using insecure transport are prohibited*).\n  - Seules sont autorisées les connexions via **TLS/SSL**, ou les connexions locales directes via **socket UNIX** ou mémoire partagée (considérées comme intrinsèquement sécurisées).\n- Annule et prévaut sur toute configuration utilisateur individuelle qui n\'exigerait pas SSL.',
      explanation: 'Exigence fondamentale pour la conformité HIPAA, PCI-DSS et RGPD pour protéger les données en transit contre les écoutes sur le réseau local.',
      examTrap: 'Avant d\'activer require_secure_transport = ON en production, vérifiez que tous vos connecteurs applicatifs ont bien TLS configuré, sinon ils seront tous rejetés instantanément !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: require_secure_transport',
    },
  },
  {
    id: 'fc-mysql908-dom03-086',
    cardNumber: 86,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Contraintes TLS fines par utilisateur : REQUIRE SSL, X509, ISSUER et SUBJECT',
    difficulty: 'hard',
    tags: ['REQUIRE SSL', 'X509', 'Certificates', 'Mutual TLS', 'Security'],
    front: {
      question: 'Quelle est la hiérarchie des clauses REQUIRE (NONE, SSL, X509, ISSUER, SUBJECT, CIPHER) dans CREATE USER pour exiger une authentification mutuelle par certificat client ?',
      codeSnippet: `CREATE USER 'payment_gateway'@'%' IDENTIFIED BY 'Pass123!'
  REQUIRE SUBJECT '/CN=gateway.corp.com'
  AND ISSUER '/C=FR/O=Security Corp/CN=Corp CA';`,
      hint: 'REQUIRE SSL exige un chiffrement TLS simple, REQUIRE X509 exige un certificat client valide, ISSUER/SUBJECT imposent des métadonnées strictes du certificat.',
    },
    back: {
      answer: 'Hiérarchie des clauses `REQUIRE` de sécurité transport :\n\n1. **`REQUIRE NONE`** : Comportement par défaut (chiffrement optionnel selon le client).\n2. **`REQUIRE SSL`** : La connexion doit impérativement être chiffrée en TLS, mais aucun certificat d\'identité client n\'est exigé.\n3. **`REQUIRE X509`** : Exige le chiffrement TLS **ET** que le client présente un **certificat X509 valide** émis par une autorité de certification (CA) approuvée par le serveur (`ssl_ca`). Authentification mutuelle mTLS.\n4. **`REQUIRE ISSUER \'ca_dn\'`** : Exige un certificat client émis spécifiquement par cette autorité de certification précise.\n5. **`REQUIRE SUBJECT \'client_dn\'`** : Exige que le certificat client contienne exactement ce sujet d\'identification (nom de machine).\n6. **`REQUIRE CIPHER \'cipher_name\'`** : Exige une méthode de chiffrement cryptographique spécifique.',
      explanation: 'L\'utilisation combinée de REQUIRE ISSUER et REQUIRE SUBJECT constitue le niveau de sécurité d\'authentification réseau le plus élevé dans MySQL.',
      examTrap: 'Si le client fournit un certificat expiré ou signé par une CA inconnue du serveur, la connexion avec REQUIRE X509 échoue dès la phase de négociation TLS.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - CREATE USER: Transport Layer Security Options',
    },
  },
  {
    id: 'fc-mysql908-dom03-087',
    cardNumber: 87,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Génération automatique des certificats SSL/TLS au démarrage',
    difficulty: 'easy',
    tags: ['auto_generate_certs', 'mysql_ssl_rsa_setup', 'TLS', 'Certificates'],
    front: {
      question: 'Comment MySQL 8.0 gère-t-il automatiquement la création de son autorité de certification (CA) et de ses certificats SSL/TLS par défaut ?',
      codeSnippet: `SHOW VARIABLES LIKE 'auto_generate_certs';
-- Valeur : ON`,
      hint: 'Variable auto_generate_certs = ON et utilitaire mysql_ssl_rsa_setup.',
    },
    back: {
      answer: 'Génération automatique des certificats SSL sous MySQL 8.0 :\n\n- **Variable `auto_generate_certs = ON`** (Activée par défaut) :\n  - Au démarrage de `mysqld`, si aucun certificat SSL n\'est explicitement configuré et qu\'aucun certificat n\'existe dans le `datadir`, le serveur crée automatiquement :\n    1. `ca.pem` et `ca-key.pem` (Autorité de certification auto-signée)\n    2. `server-cert.pem` et `server-key.pem` (Certificat et clé privée du serveur)\n    3. `client-cert.pem` et `client-key.pem` (Certificat et clé client pour tests mTLS)\n    4. `public_key.pem` et `private_key.pem` (Clés RSA pour `caching_sha2_password`).\n- **Utilitaire externe** : L\'outil binaire `mysql_ssl_rsa_setup` peut être exécuté manuellement pour pré-générer ces fichiers avant de démarrer l\'instance.',
      explanation: 'Permet à MySQL 8.0 d\'offrir un chiffrement TLS prêt à l\'emploi dès la première minute post-installation sans aucune configuration manuelle.',
      examTrap: 'Les certificats auto-générés ont une validité standard (généralement 1 ou 3 ans) : en production d\'entreprise, il est impératif d\'utiliser des certificats signés par la PKI interne de l\'entreprise.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Creating SSL and RSA Certificates Automatically',
    },
  },
  {
    id: 'fc-mysql908-dom03-088',
    cardNumber: 88,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Protocoles TLS supportés et configuration de tls_version',
    difficulty: 'medium',
    tags: ['tls_version', 'TLSv1.2', 'TLSv1.3', 'Compliance', 'Security'],
    front: {
      question: 'Quelles versions du protocole TLS sont supportées par MySQL 8.0 et comment interdire les protocoles obsolètes (TLSv1.0 et TLSv1.1) ?',
      codeSnippet: `SET PERSIST tls_version = 'TLSv1.2,TLSv1.3';`,
      hint: 'Variable tls_version définissant la liste des protocoles autorisés séparés par des virgules.',
    },
    back: {
      answer: 'Configuration de `tls_version` :\n\n- **Statut des protocoles sous MySQL 8.0** :\n  - **TLSv1.0 et TLSv1.1** : Dépréciés et **désactivés par défaut** (considérés comme non sûrs par les normes de sécurité PCI-DSS et RFC 8996).\n  - **TLSv1.2 et TLSv1.3** : Pleinement supportés et activés par défaut.\n- **Configuration stricte** :\n  ```sql\n  SET PERSIST tls_version = \'TLSv1.2,TLSv1.3\';\n  ```\n  - Pour restreindre uniquement au protocole le plus moderne et le plus rapide (handshake à 1 RTT) : `tls_version = \'TLSv1.3\'`.\n- Tout client tentant une négociation avec un protocole non listé sera immédiatement rejeté.',
      explanation: 'TLS 1.3 apporte une réduction significative de la latence lors de l\'établissement des connexions sécurisées.',
      examTrap: 'Si vous configurez tls_version=\'TLSv1.3\', assurez-vous qu\'OpenSSL sur votre système hôte est au minimum en version 1.1.1.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: tls_version',
    },
  },
  {
    id: 'fc-mysql908-dom03-089',
    cardNumber: 89,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Suites de chiffrement : tls_ciphersuites (TLS 1.3) vs ssl_cipher (TLS 1.2)',
    difficulty: 'hard',
    tags: ['tls_ciphersuites', 'ssl_cipher', 'Ciphers', 'Cryptography'],
    front: {
      question: 'Pourquoi MySQL 8.0 dispose-t-il de deux variables distinctes pour configurer les suites de chiffrement cryptographiques ?',
      codeSnippet: `-- Pour TLSv1.2 :
ssl_cipher = 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256'

-- Pour TLSv1.3 :
tls_ciphersuites = 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256'`,
      hint: 'TLS 1.3 utilise une architecture de suites de chiffrement totalement distincte de TLS 1.2 dans les spécifications OpenSSL.',
    },
    back: {
      answer: 'Distinction entre les deux variables de suites de chiffrement :\n\n- **`ssl_cipher` (pour TLSv1.2 et antérieurs)** :\n  - Configure la liste des algorithmes de chiffrement pour les connexions négociées en TLS 1.2.\n  - Syntaxe standard OpenSSL avec séparateur deux-points (`:`).\n- **`tls_ciphersuites` (pour TLSv1.3 uniquement)** :\n  - Dans la spécification TLS 1.3 (RFC 8446), le mécanisme d\'échange de clés est dissocié de l\'algorithme de chiffrement symétrique.\n  - Accepte des suites modernes comme `TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256`.\n  - Séparées par deux-points (`:`) sous OpenSSL.',
      explanation: 'Cette dissociation garantit une compatibilité parfaite avec les exigences de durcissement ANSI et NIST.',
      examTrap: 'Spécifier une suite de chiffrement TLS 1.3 dans la variable ssl_cipher est ignoré ou provoque une erreur d\'initialisation TLS.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Encrypted Connection TLS Protocols and Ciphers',
    },
  },
  {
    id: 'fc-mysql908-dom03-090',
    cardNumber: 90,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Rechargement à chaud des certificats SSL/TLS : ALTER INSTANCE RELOAD TLS',
    difficulty: 'medium',
    tags: ['ALTER INSTANCE RELOAD TLS', 'Zero Downtime', 'Certificates', 'Rotation'],
    front: {
      question: 'Quelle instruction SQL permet de renouveler les certificats SSL/TLS expirés du serveur MySQL sans redémarrer le processus mysqld ?',
      codeSnippet: `ALTER INSTANCE RELOAD TLS;
-- ou avec retour en arrière si les certificats sont invalides :
ALTER INSTANCE RELOAD TLS NO ROLLBACK ON ERROR;`,
      hint: 'Instruction ALTER INSTANCE RELOAD TLS introduite sous MySQL 8.0.',
    },
    back: {
      answer: 'Instruction : **`ALTER INSTANCE RELOAD TLS;`** (MySQL 8.0)\n\n- **Problème résolu** : Historiquement, le renouvellement annuel des certificats SSL exigeait un redémarrage complet de l\'instance de base de données.\n- **Fonctionnement** :\n  1. L\'administrateur ou un agent certbot/Let\'s Encrypt remplace les fichiers `.pem` (`server-cert.pem`, etc.) sur le disque.\n  2. L\'administrateur exécute `ALTER INSTANCE RELOAD TLS;`.\n  3. Le serveur relit les fichiers de clés et certificats, re-vérifie leur validité cryptographique et les applique **à chaud pour toutes les futures connexions**.\n  4. **Sécurité Rollback** : Si les nouveaux certificats sont corrompus ou invalides, l\'instruction échoue et MySQL conserve automatiquement les anciens certificats en mémoire sans interruption de service.',
      explanation: 'Indispensable pour maintenir un taux de disponibilité 99,999% avec rotation automatique des certificats tous les 90 jours.',
      examTrap: 'Requiert le privilège CONNECTION_ADMIN ou RELOAD pour être exécutée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - ALTER INSTANCE Statement: RELOAD TLS',
    },
  },
  {
    id: 'fc-mysql908-dom03-091',
    cardNumber: 91,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Diagnostic et audit de l\'état TLS de la session',
    difficulty: 'easy',
    tags: ['SHOW STATUS', 'TLS', 'Audit', 'Monitoring'],
    front: {
      question: 'Quelles variables de statut permettent de vérifier immédiatement si la session en cours est bien chiffrée et avec quel protocole et algorithme ?',
      codeSnippet: `SHOW STATUS LIKE 'Ssl_cipher';
SHOW STATUS LIKE 'Ssl_version';
SHOW STATUS LIKE 'Ssl_verify_result';`,
      hint: 'Variables de session Ssl_cipher et Ssl_version.',
    },
    back: {
      answer: 'Variables de diagnostic TLS de la session :\n\n- **`Ssl_cipher`** : Affiche le nom de l\'algorithme de chiffrement négocié (ex: `TLS_AES_256_GCM_SHA384`). Si la session n\'est pas chiffrée, la valeur est **vide** (`""`).\n- **`Ssl_version`** : Affiche la version du protocole active (ex: `TLSv1.3` ou `TLSv1.2`).\n- **`Ssl_verify_result`** : Vaut `0` si le certificat X509 présenté a été vérifié avec succès contre l\'autorité de certification `ca.pem`.\n- **Au niveau global** : `SHOW GLOBAL STATUS LIKE \'Ssl_accepts\';` (nombre de connexions TLS réussies), `Ssl_finished_accepts`, etc.',
      explanation: 'Ces métriques sont idéales dans les tests unitaires et les sondes de santé pour valider la sécurisation des flux.',
      examTrap: 'Si Ssl_cipher est vide dans la session d\'un développeur, c\'est que sa connexion circule en texte clair non chiffré sur le réseau !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server Status Variables: Ssl_cipher',
    },
  },
  {
    id: 'fc-mysql908-dom03-092',
    cardNumber: 92,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Table de Performance Schema tls_channel_status pour les canaux multiples',
    difficulty: 'hard',
    tags: ['tls_channel_status', 'Performance Schema', 'Multi-Channel', 'TLS'],
    front: {
      question: 'Quelle table du Performance Schema permet de superviser l\'état TLS des différents canaux de communication (serveur principal, interface admin, réplication) ?',
      codeSnippet: `SELECT CHANNEL, PROPERTY_NAME, PROPERTY_VALUE 
FROM performance_schema.tls_channel_status;`,
      hint: 'Table performance_schema.tls_channel_status introduite sous MySQL 8.0.21.',
    },
    back: {
      answer: 'Table **`performance_schema.tls_channel_status`** (MySQL 8.0.21+) :\n\n- Expose les propriétés TLS détaillées pour **chaque canal réseau distinct** géré par l\'instance :\n  - Canal `mysql_main` (port standard 3306)\n  - Canal `mysql_admin` (port d\'administration 33062)\n  - Canaux de réplication (appliers de réplication de groupe ou de réplication binaire).\n- Affiche pour chaque canal :\n  - Le certificat utilisé et son empreinte\n  - La date d\'expiration exacte du certificat (`Valid_until`)\n  - Les protocoles autorisés et suites de chiffrement effectives.\n- Permet aux agents de supervision d\'alerter 30 jours avant l\'expiration d\'un certificat sans parser les fichiers du disque.',
      explanation: 'Offre une observabilité complète et centralisée sur l\'ensemble des couches de chiffrement réseau de MySQL.',
      examTrap: 'Cette table n\'est peuplée que si le Performance Schema est activé (performance_schema = ON).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The tls_channel_status Table',
    },
  },

  // =========================================================================
  // SECTION 8 : CHIFFREMENT DES DONNÉES AU REPOS (TDE), KEYRINGS & ENTERPRISE SECURITY (Cartes 93 à 100)
  // Architecture TDE (Master Key vs Tablespace Key), Keyring plugins/components,
  // ENCRYPTION='Y', default_table_encryption, redo/undo log encrypt, binlog_encryption,
  // ROTATE MASTER KEY, Data Masking & Firewall
  // =========================================================================
  {
    id: 'fc-mysql908-dom03-093',
    cardNumber: 93,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Architecture TDE à deux niveaux : Master Key vs Tablespace Key',
    difficulty: 'hard',
    tags: ['TDE', 'Master Key', 'Tablespace Key', 'Envelope Encryption', 'Security'],
    front: {
      question: 'Comment fonctionne l\'architecture de chiffrement à deux niveaux (Envelope Encryption) de MySQL TDE (Transparent Data Encryption) ?',
      hint: 'Une clé interne par tablespace pour chiffrer les blocs physiques, protégée par une clé maîtresse externe stockée dans un Keyring.',
    },
    back: {
      answer: 'Architecture TDE à double niveau de clés :\n\n1. **Clé de Tablespace (Tablespace Key / Data Encryption Key - DEK)** :\n   - Chaque tablespace chiffré (`.ibd`) possède sa propre clé symétrique AES-256 générée aléatoirement.\n   - Cette clé sert à chiffrer et déchiffrer les blocs de données (pages de 16 Ko) lors des lectures/écritures disque.\n   - La clé de tablespace est chiffrée par la Master Key et stockée dans l\'en-tête (Header page 0) du fichier `.ibd` lui-même.\n2. **Clé Maîtresse (Master Key / Key Encryption Key - KEK)** :\n   - Clé maîtresse externe gérée par le serveur MySQL.\n   - Elle n\'est **JAMAIS stockée dans les fichiers de base de données** : elle est conservée en sécurité dans un coffre de clés externe (**Keyring**).\n   - Elle ne sert qu\'à chiffrer/déchiffrer les clés de tablespaces.\n   - Permet la rotation de clé instantanée sans réécrire les téraoctets de données.',
      explanation: 'Si un pirate dérobe le disque dur ou un fichier .ibd, les données sont totalement indéchiffrables sans la Master Key du Keyring.',
      examTrap: 'Ne confondez pas : les données ne sont PAS chiffrées directement par la Master Key ! Elles sont chiffrées par la Tablespace Key, qui est elle-même chiffrée par la Master Key.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - InnoDB Data-at-Rest Encryption Architecture',
    },
  },
  {
    id: 'fc-mysql908-dom03-094',
    cardNumber: 94,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Composants et plugins Keyring pour la gestion des clés TDE',
    difficulty: 'hard',
    tags: ['Keyring', 'component_keyring_file', 'Oracle Key Vault', 'TDE'],
    front: {
      question: 'Quels sont les différents fournisseurs de Keyring disponibles sous MySQL 8.0 pour stocker la clé maîtresse TDE ?',
      codeSnippet: `INSTALL COMPONENT 'file://component_keyring_file';`,
      hint: 'Fichier local (keyring_file), fichier chiffré (keyring_encrypted_file), coffres d\'entreprise (Oracle Key Vault, AWS KMS, HashiCorp Vault).',
    },
    back: {
      answer: 'Fournisseurs de Keyring sous MySQL 8.0 :\n\n- **Composants / Plugins de base (Community)** :\n  - `component_keyring_file` / `keyring_file` : Stocke les clés dans un fichier plat local sur le système de fichiers hôte.\n  - `keyring_encrypted_file` : Stocke les clés dans un fichier local lui-même chiffré par mot de passe.\n- **Keyrings d\'entreprise (MySQL Enterprise Edition)** :\n  - `keyring_okv` : Intégration matérielle avec **Oracle Key Vault** (gestion centralisée des clés d\'entreprise).\n  - `keyring_aws` : Intégration native avec Amazon Web Services Key Management Service (AWS KMS).\n  - `keyring_hashicorp` : Intégration avec HashiCorp Vault via API REST.\n  - `keyring_oci` : Intégration avec Oracle Cloud Infrastructure Vault.',
      explanation: 'En environnement de production réglementé (PCI-DSS), stocker la clé sur le même disque que les données est proscrit ; un HSM ou KMS réseau est obligatoire.',
      examTrap: 'Le composant keyring doit obligatoirement être chargé dès le tout début du démarrage du serveur avant qu\'InnoDB n\'initialise ses tablespaces.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Keyring',
    },
  },
  {
    id: 'fc-mysql908-dom03-095',
    cardNumber: 95,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Chiffrement d\'une table et d\'un tablespace général InnoDB',
    difficulty: 'medium',
    tags: ['ENCRYPTION', 'InnoDB', 'Tablespace', 'TDE'],
    front: {
      question: 'Quelle est la syntaxe pour chiffrer une table individuelle (file-per-table) et un tablespace général sous MySQL 8.0 ?',
      codeSnippet: `-- Table file-per-table :
CREATE TABLE medical_records (
  id INT PRIMARY KEY,
  diagnostic TEXT
) ENCRYPTION = 'Y';

-- Tablespace général :
CREATE TABLESPACE ts_secure ADD DATAFILE 'ts_secure.ibd' ENCRYPTION = 'Y';`,
      hint: 'Clause ENCRYPTION = \'Y\' dans CREATE TABLE ou ALTER TABLE.',
    },
    back: {
      answer: 'Syntaxe de chiffrement TDE InnoDB :\n\n1. **Création d\'une table chiffrée** :\n   ```sql\n   CREATE TABLE medical_records (...) ENCRYPTION = \'Y\';\n   ```\n2. **Chiffrement à chaud d\'une table existante** :\n   ```sql\n   ALTER TABLE legacy_customers ENCRYPTION = \'Y\';\n   ```\n   - MySQL réécrit les pages en les chiffrant sans bloquer les lectures/écritures (`ALGORITHM=INPLACE`).\n3. **Tablespace général chiffré** :\n   ```sql\n   CREATE TABLESPACE secure_space ADD DATAFILE \'sec.ibd\' ENCRYPTION = \'Y\';\n   CREATE TABLE t1 (...) TABLESPACE secure_space;\n   ```\n   - Toutes les tables résidant dans ce tablespace partagé sont automatiquement chiffrées.',
      explanation: 'Le déchiffrement est transparent en RAM : une fois dans le Buffer Pool, les données sont en clair pour le processeur.',
      examTrap: 'Si le Keyring n\'est pas chargé au démarrage de mysqld, toute tentative d\'exécuter CREATE TABLE ... ENCRYPTION=\'Y\' échoue avec une erreur.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - InnoDB Data-at-Rest Encryption',
    },
  },
  {
    id: 'fc-mysql908-dom03-096',
    cardNumber: 96,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Chiffrement par défaut des schémas : DEFAULT ENCRYPTION et default_table_encryption',
    difficulty: 'medium',
    tags: ['DEFAULT ENCRYPTION', 'default_table_encryption', 'Compliance', 'TDE'],
    front: {
      question: 'Comment imposer que toutes les nouvelles tables créées dans une base de données soient automatiquement chiffrées sans que le développeur n\'ait à spécifier ENCRYPTION = \'Y\' ?',
      codeSnippet: `CREATE DATABASE banking_db DEFAULT ENCRYPTION = 'Y';
-- Ou au niveau de toute l'instance :
SET PERSIST default_table_encryption = ON;`,
      hint: 'Clause DEFAULT ENCRYPTION = \'Y\' sur la base, et variable globale default_table_encryption = ON.',
    },
    back: {
      answer: 'Chiffrement par défaut des bases de données sous MySQL 8.0 :\n\n1. **Au niveau de la base de données** :\n   ```sql\n   CREATE DATABASE banking_db DEFAULT ENCRYPTION = \'Y\';\n   ALTER DATABASE existing_db DEFAULT ENCRYPTION = \'Y\';\n   ```\n   - Toute table créée dans `banking_db` sans mentionner la clause `ENCRYPTION` hérite automatiquement du réglage `ENCRYPTION = \'Y\'`.\n2. **Au niveau global de l\'instance** :\n   ```sql\n   SET PERSIST default_table_encryption = ON;\n   ```\n   - Définit le comportement par défaut pour toute nouvelle base ou table créée sur le serveur si non spécifié.\n3. Pour interdire formellement toute création de table non chiffrée, combiner avec `table_encryption_privilege_check = ON`.',
      explanation: 'Garantit l\'application systématique des politiques de sécurité même en cas d\'oubli dans les scripts de migration applicative.',
      examTrap: 'Changer DEFAULT ENCRYPTION sur une base ne chiffre pas rétroactivement les tables existantes ! Il faut exécuter ALTER TABLE t ENCRYPTION=\'Y\' pour les convertir.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Defining an Encryption Default for Schemas',
    },
  },
  {
    id: 'fc-mysql908-dom03-097',
    cardNumber: 97,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Chiffrement des journaux physiques : Redo Log et Undo Tablespaces',
    difficulty: 'hard',
    tags: ['innodb_redo_log_encrypt', 'innodb_undo_log_encrypt', 'Redo Log', 'Undo Log', 'TDE'],
    front: {
      question: 'Pourquoi chiffrer les tables InnoDB ne suffit-il pas à garantir la confidentialité des données au repos, et comment chiffrer le Redo Log et les Undo Logs ?',
      codeSnippet: `SET PERSIST innodb_redo_log_encrypt = ON;
SET PERSIST innodb_undo_log_encrypt = ON;`,
      hint: 'Des données sensibles en clair transitent et résident temporairement dans les fichiers ib_logfile* et les undo tablespaces.',
    },
    back: {
      answer: 'Nécessité de chiffrer les journaux internes InnoDB :\n\n- **Risque de fuite** : Même si les tables `.ibd` sont chiffrées, les écritures transactionnelles (`INSERT`, `UPDATE`) écrivent des images de lignes dans le **Redo Log** (`#innodb_redo/`) et des versions antérieures de lignes dans les **Undo Tablespaces** (`undo_001`, `undo_002`). Un pirate analysant ces fichiers y retrouverait les données en clair !\n- **Activation du chiffrement des journaux** :\n  ```sql\n  SET PERSIST innodb_redo_log_encrypt = ON;\n  SET PERSIST innodb_undo_log_encrypt = ON;\n  ```\n- Les pages de Redo et d\'Undo sont immédiatement chiffrées avec la clé du Keyring avant d\'être flushées sur le disque.',
      explanation: 'Indispensable pour une conformité "Data at Rest Encryption" complète et rigoureuse.',
      examTrap: 'Le chiffrement du Redo Log et de l\'Undo Log nécessite obligatoirement qu\'un Keyring soit chargé et actif sur l\'instance.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Encrypting Redo Log & Undo Tablespaces',
    },
  },
  {
    id: 'fc-mysql908-dom03-098',
    cardNumber: 98,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Chiffrement des journaux binaires et de relais : binlog_encryption',
    difficulty: 'hard',
    tags: ['binlog_encryption', 'Binary Log', 'Relay Log', 'Replication', 'TDE'],
    front: {
      question: 'Comment activer le chiffrement des journaux binaires (Binlog) et des Relay Logs sur disque sous MySQL 8.0.14+ ?',
      codeSnippet: `SET PERSIST binlog_encryption = ON;
SHOW VARIABLES LIKE 'binlog_encryption';`,
      hint: 'Variable système dynamique binlog_encryption = ON.',
    },
    back: {
      answer: 'Chiffrement du journal binaire avec `binlog_encryption` :\n\n- Introduit sous MySQL 8.0.14 pour combler la dernière faille de persistance des données au repos.\n- **Activation** : `SET PERSIST binlog_encryption = ON;` (dynamique, sans redémarrage).\n- **Architecture de chiffrement** :\n  - Utilise une clé maîtresse de binlog (**Binary Log Encryption Key**) stockée dans le Keyring.\n  - Chaque fichier de binlog et de relay log possède un en-tête chiffré de 512 octets contenant sa clé de fichier unique.\n- **Rotation automatique** : Lors de l\'activation, le serveur ferme immédiatement le binlog en cours et en ouvre un nouveau chiffré.\n- Les utilitaires comme `mysqlbinlog` peuvent lire ces fichiers chiffrés en leur fournissant l\'accès au keyring.',
      explanation: 'Empêche l\'exfiltration de transactions complètes par copie non autorisée des fichiers binlog sur le système de fichiers.',
      examTrap: 'Si binlog_encryption = ON, vous ne pouvez pas lire le fichier binlog directement avec un viewer hexadécimal ni avec un vieux client mysqlbinlog pré-8.0.14.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Encrypting Binary Log Files and Relay Log Files',
    },
  },
  {
    id: 'fc-mysql908-dom03-099',
    cardNumber: 99,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Rotation à chaud de la clé maîtresse TDE : ROTATE MASTER KEY',
    difficulty: 'hard',
    tags: ['ROTATE MASTER KEY', 'Key Rotation', 'Zero Downtime', 'TDE', 'Compliance'],
    front: {
      question: 'Comment renouveler la clé maîtresse de chiffrement InnoDB et celle du journal binaire sans réécrire les tables et sans coupure de service ?',
      codeSnippet: `ALTER INSTANCE ROTATE INNODB MASTER KEY;
ALTER INSTANCE ROTATE BINLOG MASTER KEY;`,
      hint: 'Instructions ALTER INSTANCE ROTATE INNODB MASTER KEY et ROTATE BINLOG MASTER KEY.',
    },
    back: {
      answer: 'Rotation des clés maîtresses sous MySQL 8.0 :\n\n1. **Rotation pour InnoDB TDE** :\n   ```sql\n   ALTER INSTANCE ROTATE INNODB MASTER KEY;\n   ```\n   - Génère une nouvelle Master Key dans le Keyring.\n   - Relit les clés de tablespaces (`DEK`) dans les en-têtes de chaque fichier `.ibd`, les re-chiffre avec la nouvelle Master Key et met à jour l\'en-tête.\n   - **Opération quasi-instantanée** : Les millions de lignes de données ne sont PAS réécrites !\n2. **Rotation pour le Binlog** :\n   ```sql\n   ALTER INSTANCE ROTATE BINLOG MASTER KEY;\n   ```\n   - Génère une nouvelle clé de binlog dans le Keyring et archive l\'ancienne.\n- Répond aux exigences de conformité PCI-DSS (rotation obligatoire des clés tous les ans).',
      explanation: 'Cette rotation est atomique et peut être automatisée via un cron ou un ordonnanceur de tâches.',
      examTrap: 'Requiert le privilège ENCRYPTION_KEY_ADMIN ou SUPER.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Rotating the Master Encryption Key',
    },
  },
  {
    id: 'fc-mysql908-dom03-100',
    cardNumber: 100,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Sécurité avancée Enterprise : Data Masking & MySQL Enterprise Firewall',
    difficulty: 'hard',
    tags: ['Data Masking', 'Enterprise Firewall', 'Enterprise Security', 'WAF'],
    front: {
      question: 'Quelles sont les fonctionnalités de MySQL Enterprise Data Masking et les 3 modes opérationnels de MySQL Enterprise Firewall ?',
      hint: 'Masquage dynamique de données personnelles (RGPD) et pare-feu applicatif basé sur une liste blanche de profils de requêtes SQL.',
    },
    back: {
      answer: 'Solutions de sécurité avancées de MySQL Enterprise Edition :\n\n1. **MySQL Enterprise Data Masking and De-Identification** :\n   - Masquage dynamique de données sensibles à la volée (`mask_inner()`, `mask_outer()`, `mask_ssn()`, `mask_payment_card()`).\n   - Génération de jeux de données de test anonymisés conformes RGPD/HIPAA (`gen_rnd_email()`, `gen_rnd_pan()`).\n2. **MySQL Enterprise Firewall (Pare-feu SQL intégré)** :\n   - Protège contre les injections SQL (SQLi) et les requêtes pirates non autorisées en apprenant le profil des applications via une liste blanche.\n   - **3 modes opérationnels par compte utilisateur** :\n     1. **`RECORDING`** : Phase d\'apprentissage où le firewall enregistre la signature normalisée de toutes les requêtes légitimes envoyées par l\'application.\n     2. **`PROTECTING`** : Mode actif de blocage ; toute requête ne figurant pas dans la liste blanche est **rejetée immédiatement** avec une erreur de sécurité.\n     3. **`DETECTING`** : Mode audit silencieux ; laisse passer la requête inconnue mais génère une alerte dans l\'audit log.',
      explanation: 'Permet d\'empêcher une faille SQLi de siphonner la base même si le code applicatif PHP/Java contient une vulnérabilité.',
      examTrap: 'Le firewall opère sur des signatures normalisées (Digests) : SELECT * FROM users WHERE id = 1 et SELECT * FROM users WHERE id = 42 partagent la même règle.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Enterprise Firewall & Data Masking',
    },
  },
];
