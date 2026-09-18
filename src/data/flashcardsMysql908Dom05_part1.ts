import { FlashcardItem } from '../types';

export const mysql908Dom05Part1Flashcards: FlashcardItem[] = [
  // =========================================================================
  // SECTION 1 : ARCHITECTURE & FONDAMENTAUX DE LA RÉPLICATION BINAIRE (Cartes 1 à 15)
  // Threads de réplication, terminologie 8.0.23+, Relay Log, métadonnées,
  // server_id, CHANGE REPLICATION SOURCE TO, gestion et diagnostic SHOW REPLICA STATUS
  // =========================================================================
  {
    id: 'fc-mysql908-dom05-001',
    cardNumber: 1,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Architecture asynchrone fondamentale et flux des 3 threads de réplication',
    difficulty: 'medium',
    tags: ['Replication Architecture', 'Dump Thread', 'IO Thread', 'SQL Thread', 'Relay Log'],
    front: {
      question: 'Quels sont les 3 threads fondamentaux impliqués dans la réplication asynchrone MySQL et quel est le flux exact des événements ?',
      hint: 'Un thread côté Source (Dump thread) et deux threads côté Réplica (I/O thread et SQL/Applier thread).',
    },
    back: {
      answer: 'Les 3 threads fondamentaux et leur flux séquentiel :\n\n1. **Binlog Dump Thread (Côté Source)** :\n   - Lancé sur la Source dès qu\'un Réplica se connecte.\n   - Lit les événements dans les fichiers Binary Log de la Source et les transmet sur le flux réseau TCP au Réplica.\n2. **Replica I/O (Receiver) Thread (Côté Réplica)** :\n   - Reçoit les événements réseau envoyés par le Binlog Dump Thread.\n   - Écrit ces événements de manière séquentielle dans les journaux relais locaux (**Relay Logs**).\n3. **Replica SQL (Applier) Thread (Côté Réplica)** :\n   - Lit les événements enregistrés dans les Relay Logs locaux et les réexécute sur le moteur de stockage du Réplica pour appliquer les modifications de données.',
      explanation: 'Le découpage en 2 threads sur le réplica (I/O et SQL) découple la réception réseau rapide de l\'application disque potentiellement plus lente.',
      examTrap: 'Le Binlog Dump thread réside sur la Source, tandis que les threads I/O et SQL résident tous deux sur le Réplica.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Replication Implementation Overview',
    },
  },
  {
    id: 'fc-mysql908-dom05-002',
    cardNumber: 2,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Nouvelle terminologie inclusive MySQL 8.0.23+ et rétrocompatibilité',
    difficulty: 'easy',
    tags: ['Terminology', 'SOURCE', 'REPLICA', 'MASTER', 'SLAVE', 'Syntax'],
    front: {
      question: 'Quels termes et instructions remplacent MASTER et SLAVE à partir de MySQL 8.0.23 dans les commandes et variables de statut ?',
      codeSnippet: `-- Ancienne syntaxe (dépréciée)
CHANGE MASTER TO MASTER_HOST='192.168.1.10';
START SLAVE;
SHOW SLAVE STATUS;

-- Nouvelle syntaxe recommandée (MySQL 8.0.23+)
CHANGE REPLICATION SOURCE TO SOURCE_HOST='192.168.1.10';
START REPLICA;
SHOW REPLICA STATUS;`,
      hint: 'MASTER devient SOURCE, et SLAVE devient REPLICA dans toutes les commandes administratives.',
    },
    back: {
      answer: 'Remplacement terminologique à partir de MySQL 8.0.23 :\n\n- **Commandes SQL** :\n  - `CHANGE MASTER TO` $\\rightarrow$ **`CHANGE REPLICATION SOURCE TO`**\n  - `START SLAVE` / `STOP SLAVE` $\\rightarrow$ **`START REPLICA` / `STOP REPLICA`**\n  - `RESET SLAVE` $\\rightarrow$ **`RESET REPLICA`**\n  - `SHOW SLAVE STATUS` $\\rightarrow$ **`SHOW REPLICA STATUS`**\n  - `SHOW SLAVE HOSTS` $\\rightarrow$ **`SHOW REPLICAS`**\n- **Options et variables système** :\n  - `MASTER_HOST` $\\rightarrow$ `SOURCE_HOST`\n  - `MASTER_LOG_FILE` $\\rightarrow$ `SOURCE_LOG_FILE`\n  - `MASTER_LOG_POS` $\\rightarrow$ `SOURCE_LOG_POS`\n  - `MASTER_AUTO_POSITION` $\\rightarrow$ `SOURCE_AUTO_POSITION`\n  - `slave_parallel_workers` $\\rightarrow$ `replica_parallel_workers`\n- L\'ancienne terminologie reste supportée sous forme d\'alias pour la rétrocompatibilité, mais génère un avertissement de dépréciation.',
      explanation: 'Oracle a modernisé la syntaxe pour adopter des termes d\'ingénierie inclusifs et précis.',
      examTrap: 'L\'examen 1Z0-908 teste prioritairement la syntaxe moderne SOURCE/REPLICA, bien que l\'ancienne soit tolérée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Replication Terminology Updates',
    },
  },
  {
    id: 'fc-mysql908-dom05-003',
    cardNumber: 3,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Rôle, structure et cycle de vie des Relay Logs sur le Réplica',
    difficulty: 'medium',
    tags: ['Relay Log', 'relay_log_purge', 'I/O Thread', 'SQL Thread'],
    front: {
      question: 'Quel est le rôle exact des Relay Logs sur un Réplica et comment leur taille et leur purge automatique sont-elles gérées ?',
      hint: 'Fichiers intermédiaires stockant les transactions reçues de la source avant leur exécution par le SQL Thread ; variable relay_log_purge.',
    },
    back: {
      answer: 'Rôle et gestion des Relay Logs :\n\n- **Rôle** :\n  - Fichiers physiques locaux (nommés conventionnellement `hostname-relay-bin.00000X`) stockant les événements de réplication écrits par le thread I/O dès leur réception réseau.\n  - Assurent le tampon mémoire/disque garantissant que les événements ne sont pas perdus même si l\'application SQL prend du retard.\n- **Cycle de purge (`relay_log_purge`)** :\n  - Activé par défaut (`relay_log_purge = ON`) : dès que le thread SQL a fini de rejouer et de commiter tous les événements d\'un fichier de log relais, ce fichier est automatiquement détruit pour libérer de l\'espace disque.\n  - Si désactivé (`OFF`), les logs relais s\'accumulent indéfiniment jusqu\'à saturation du disque.\n- **Rotation** :\n  - Un nouveau log relais est créé lorsque la taille atteint `max_relay_log_size` (ou `max_binlog_size` si non défini), lors d\'un redémarrage du serveur, ou lors d\'un `FLUSH RELAY LOGS`.',
      explanation: 'Les logs relais partagent exactement la même structure binaire que les fichiers Binary Log classiques.',
      examTrap: 'Ne supprimez jamais manuellement des fichiers relay log sur le disque : utilisez FLUSH ou laissez le serveur gérer via relay_log_purge.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The Relay Log',
    },
  },
  {
    id: 'fc-mysql908-dom05-004',
    cardNumber: 4,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Répertoire des métadonnées de réplication : TABLE vs FILE',
    difficulty: 'hard',
    tags: ['master_info_repository', 'relay_log_info_repository', 'Crash-Safe', 'Metadata'],
    front: {
      question: 'Pourquoi MySQL 8.0 rend-il obligatoire l\'enregistrement des métadonnées de réplication dans des tables InnoDB plutôt que dans des fichiers texte ?',
      codeSnippet: `-- MySQL 8.0 impose :
master_info_repository = TABLE
relay_log_info_repository = TABLE
-- Tables créées :
-- mysql.slave_master_info
-- mysql.slave_relay_log_info`,
      hint: 'Permet des mises à jour transactionnelles et atomiques avec les modifications de données, assurant la crash-safety.',
    },
    back: {
      answer: 'Métadonnées dans des tables InnoDB (TABLE) vs Fichiers (FILE) :\n\n- **Problème historique des fichiers texte (`master.info` et `relay-log.info`)** :\n  - La mise à jour des positions sur disque dans un fichier plat n\'est pas coordonnée de manière atomique avec les transactions InnoDB. Un crash système pouvait laisser un décalage entre la transaction réellement validée et la position enregistrée.\n- **Avantages de `TABLE` (InnoDB)** :\n  1. **Atomicité transactionnelle (Crash-Safe Replication)** : La mise à jour de la position de réplication dans `mysql.slave_relay_log_info` est validée dans la **même transaction** que les modifications de données métier appliquées par le thread SQL.\n  2. En cas de panne de courant ou crash, le rollback annule à la fois les données et la position, garantissant l\'absence de duplication ou de saut de transaction.\n- En MySQL 8.0, la valeur `FILE` est totalement dépréciée puis retirée.',
      explanation: 'Condition indispensable pour garantir qu\'un réplica peut redémarrer sans intervention humaine après un crash intempestif.',
      examTrap: 'Ne modifiez jamais directement par SQL les tables mysql.slave_master_info ou mysql.slave_relay_log_info.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Replication Metadata Repositories',
    },
  },
  {
    id: 'fc-mysql908-dom05-005',
    cardNumber: 5,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Règle d\'unicité absolue du paramètre server_id et conséquences d\'un conflit',
    difficulty: 'easy',
    tags: ['server_id', 'Configuration', 'Topology', 'Loopback'],
    front: {
      question: 'Pourquoi chaque serveur d\'une topologie de réplication doit-il posséder un server_id unique et que se passe-t-il si deux réplicas partagent le même identifiant ?',
      codeSnippet: `[mysqld]
server_id = 101 # Doit être un entier positif non nul unique (1 à 4 294 967 295)`,
      hint: 'La source déconnecte l\'ancien réplica dès qu\'un nouveau avec le même server_id se connecte, et les événements en boucle sont filtrés.',
    },
    back: {
      answer: 'Rôle et contraintes du `server_id` :\n\n1. **Unicité stricte** :\n   - Chaque nœud de la topologie (Source, Réplicas, Nœuds intermédiaires) doit avoir un entier positif unique différent de 0.\n2. **Conséquence d\'un doublon de `server_id` entre deux réplicas** :\n   - La Source n\'autorise qu\'un seul client actif par `server_id`.\n   - Si le Réplica B se connecte avec le même `server_id` que le Réplica A, la Source déconnecte immédiatement le Réplica A pour accepter B.\n   - Le Réplica A tente aussitôt de se reconnecter, ce qui déconnecte B. Résultat : une boucle infinie de connexions/déconnexions intermittentes (*flapping*) et un arrêt complet de la réplication.\n3. **Prévention des boucles (Loop prevention)** :\n   - Dans les topologies en anneau ou multi-sources, un serveur ignore automatiquement les événements binaires portant son propre `server_id`.',
      explanation: 'Si server_id vaut 0, le serveur refuse catégoriquement d\'agir comme réplica ou source binaire.',
      examTrap: 'Ne jamais cloner une machine virtuelle ou un conteneur MySQL sans changer immédiatement le server_id dans le fichier de configuration.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Setting the Replication Server ID',
    },
  },
  {
    id: 'fc-mysql908-dom05-006',
    cardNumber: 6,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Configuration initiale de la Source et création du compte REPLICATION SLAVE',
    difficulty: 'medium',
    tags: ['Source Configuration', 'REPLICATION SLAVE', 'caching_sha2_password', 'Security'],
    front: {
      question: 'Quels paramètres de configuration minimaux doivent être activés sur la Source et quelle commande SQL crée le compte dédié à la réplication ?',
      codeSnippet: `[mysqld]
server_id = 1
log_bin = mysql-bin
binlog_format = ROW`,
      hint: 'Privilège REPLICATION SLAVE requis, avec le plugin d\'authentification par défaut caching_sha2_password.',
    },
    back: {
      answer: 'Configuration de la Source et création du compte :\n\n1. **Paramètres `my.cnf` de la Source** :\n   - `server_id = 1` (identifiant unique).\n   - `log_bin = mysql-bin` (activation du journal binaire, activé par défaut en 8.0).\n   - `binlog_format = ROW` (format recommandé et par défaut).\n2. **Création du compte utilisateur dédié** :\n   ```sql\n   CREATE USER \\\'repl_user\\\'@\\\'192.168.1.%\\\' \n     IDENTIFIED WITH caching_sha2_password BY \\\'StrongReplPassword!2026\\\';\n\n   GRANT REPLICATION SLAVE ON *.* TO \\\'repl_user\\\'@\\\'192.168.1.%\\\';\n   FLUSH PRIVILEGES;\n   ```\n- Le seul privilège nécessaire et suffisant pour répliquer est **`REPLICATION SLAVE`** (associé au niveau global `*.*`).',
      explanation: 'Donner des privilèges excessifs (comme ALL PRIVILEGES ou SUPER) à ce compte constitue une faille de sécurité majeure.',
      examTrap: 'Le privilège REPLICATION SLAVE doit impérativement s\'accorder sur *.* et non sur une base spécifique.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Creating a User for Replication',
    },
  },
  {
    id: 'fc-mysql908-dom05-007',
    cardNumber: 7,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Configuration du Réplica : instruction CHANGE REPLICATION SOURCE TO',
    difficulty: 'medium',
    tags: ['CHANGE REPLICATION SOURCE TO', 'Configuration', 'Parameters', 'Replica'],
    front: {
      question: 'Quelle est la syntaxe exacte de CHANGE REPLICATION SOURCE TO pour configurer un réplica en réplication traditionnelle basée sur les fichiers et positions binaires ?',
      codeSnippet: `mysql> CHANGE REPLICATION SOURCE TO
  SOURCE_HOST = '192.168.1.100',
  SOURCE_USER = 'repl_user',
  SOURCE_PASSWORD = 'StrongPassword!2026',
  SOURCE_PORT = 3306,
  SOURCE_LOG_FILE = 'mysql-bin.000004',
  SOURCE_LOG_POS = 705;`,
      hint: 'Spécification de l\'hôte, de l\'utilisateur, du port, du fichier source de début et de la position d\'octet.',
    },
    back: {
      answer: 'Paramètres essentiels de `CHANGE REPLICATION SOURCE TO` :\n\n- **`SOURCE_HOST`** : Adresse IP ou nom DNS de l\'instance source.\n- **`SOURCE_PORT`** : Port d\'écoute TCP de la source (3306 par défaut).\n- **`SOURCE_USER`** : Nom du compte utilisateur disposant du privilège `REPLICATION SLAVE`.\n- **`SOURCE_PASSWORD`** : Mot de passe d\'authentification du compte de réplication.\n- **`SOURCE_LOG_FILE`** : Nom exact du fichier Binary Log de départ sur la source.\n- **`SOURCE_LOG_POS`** : Décalage en octets (offset) exact de départ dans le fichier log.\n- **Important** : Cette commande n\'est autorisée que si les threads de réplication sont arrêtés (`STOP REPLICA;`).',
      explanation: 'Les paramètres sont persistés de manière sécurisée dans la table InnoDB `mysql.slave_master_info`.',
      examTrap: 'Ne jamais tenter d\'exécuter CHANGE REPLICATION SOURCE TO pendant que la réplication est active ; il faut d\'abord exécuter STOP REPLICA.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - CHANGE REPLICATION SOURCE TO Statement',
    },
  },
  {
    id: 'fc-mysql908-dom05-008',
    cardNumber: 8,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Contrôle des threads de réplication : START, STOP et contrôle granulaire',
    difficulty: 'easy',
    tags: ['START REPLICA', 'STOP REPLICA', 'Granular Control', 'Threads'],
    front: {
      question: 'Comment démarrer ou arrêter indépendamment le thread de réception réseau (I/O) et le thread d\'application (SQL) sur un réplica ?',
      codeSnippet: `mysql> STOP REPLICA IO_THREAD;
mysql> START REPLICA SQL_THREAD;`,
      hint: 'Ajout des mots-clés IO_THREAD ou SQL_THREAD après START REPLICA ou STOP REPLICA.',
    },
    back: {
      answer: 'Contrôle granulaire des threads de réplication :\n\n- **Commandes globales** :\n  - `START REPLICA;` : Démarre simultanément les deux threads (I/O et SQL).\n  - `STOP REPLICA;` : Arrête proprement les deux threads.\n- **Contrôle individuel** :\n  - `STOP REPLICA IO_THREAD;` : Interrompt la réception des événements réseau depuis la Source, mais laisse le thread SQL continuer à vider et appliquer les Relay Logs locaux existants.\n  - `STOP REPLICA SQL_THREAD;` : Suspend l\'application des données sur le réplica, tout en continuant à télécharger les journaux depuis la Source dans les Relay Logs locaux.\n  - `START REPLICA IO_THREAD;` / `START REPLICA SQL_THREAD;` : Redémarre le thread spécifique.',
      explanation: 'Très utile lors de maintenances : arrêter le SQL Thread permet de figer les données pour une sauvegarde sans déconnecter le flux réseau.',
      examTrap: 'START REPLICA sans argument démarre les deux threads s\'ils sont arrêtés.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - START REPLICA Statement',
    },
  },
  {
    id: 'fc-mysql908-dom05-009',
    cardNumber: 9,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Réinitialisation du Réplica : RESET REPLICA vs RESET REPLICA ALL',
    difficulty: 'medium',
    tags: ['RESET REPLICA', 'RESET REPLICA ALL', 'Cleanup', 'Metadata'],
    front: {
      question: 'Quelle est la différence fondamentale entre RESET REPLICA et RESET REPLICA ALL sur un réplica arrêté ?',
      codeSnippet: `mysql> STOP REPLICA;
mysql> RESET REPLICA;
-- VS
mysql> RESET REPLICA ALL;`,
      hint: 'L\'un purge uniquement les logs relais tout en conservant les identifiants de connexion, l\'autre efface complètement toute la configuration.',
    },
    back: {
      answer: 'Différence entre `RESET REPLICA` et `RESET REPLICA ALL` :\n\n- **`RESET REPLICA` (Standard)** :\n  - Supprime tous les fichiers de Relay Logs existants et réinitialise l\'index des logs relais.\n  - **Conserve intacte la configuration de connexion** (hôte, port, utilisateur, mot de passe de la source).\n  - Utile après une corruption de log relais ou pour repartir de la position courante de la source.\n- **`RESET REPLICA ALL` (Complet)** :\n  - Supprime les Relay Logs.\n  - **Efface complètement toutes les informations de connexion** enregistrées dans `mysql.slave_master_info`.\n  - Après cette commande, le réplica "oublie" totalement qu\'il a déjà été un réplica. Pour réactiver la réplication, il est obligatoire de retaper entièrement l\'instruction `CHANGE REPLICATION SOURCE TO`.',
      explanation: 'RESET REPLICA ALL est indispensable lorsqu\'on retire définitivement un serveur de la topologie ou avant de l\'intégrer dans un InnoDB Cluster.',
      examTrap: 'Exécuter RESET REPLICA ALL efface SOURCE_HOST et SOURCE_USER en mémoire et dans les tables InnoDB système.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - RESET REPLICA Statement',
    },
  },
  {
    id: 'fc-mysql908-dom05-010',
    cardNumber: 10,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Interprétation clinique de SHOW REPLICA STATUS (SHOW SLAVE STATUS)',
    difficulty: 'medium',
    tags: ['SHOW REPLICA STATUS', 'Monitoring', 'Replica_IO_Running', 'Replica_SQL_Running'],
    front: {
      question: 'Quels sont les 4 champs les plus critiques à vérifier immédiatement dans la sortie de SHOW REPLICA STATUS pour confirmer la santé d\'un réplica ?',
      codeSnippet: `mysql> SHOW REPLICA STATUS\\G
*************************** 1. row ***************************
             Replica_IO_State: Waiting for source to send event
                  Source_Host: 10.0.0.1
             Replica_IO_Running: Yes
            Replica_SQL_Running: Yes
        Seconds_Behind_Source: 0
             Last_SQL_Errno: 0`,
      hint: 'État des threads I/O et SQL (Yes/No/Connecting), décalage temporel, et numéro de dernière erreur SQL.',
    },
    back: {
      answer: 'Les 4 indicateurs cliniques vitaux de `SHOW REPLICA STATUS` :\n\n1. **`Replica_IO_Running = Yes`** :\n   - Indique que le thread récepteur est connecté à la source et reçoit les flux.\n   - S\'il est à `Connecting`, il tente de joindre la source (problème réseau, firewall, mauvais mot de passe).\n   - S\'il est à `No`, le thread est arrêté ou a rencontré une erreur fatale.\n2. **`Replica_SQL_Running = Yes`** :\n   - Indique que le thread d\'application exécute normalement les transactions.\n   - S\'il est à `No`, la réplication s\'est arrêtée suite à une erreur SQL (conflit de clé, table manquante).\n3. **`Seconds_Behind_Source = 0` (ou valeur faible)** :\n   - Mesure le retard en secondes entre l\'exécution sur la source et sur le réplica.\n4. **`Last_SQL_Errno` et `Last_SQL_Error`** :\n   - Doivent être à 0 / vide. En cas de blocage, affichent le code et le message d\'erreur exact.',
      explanation: 'Si les deux threads sont à Yes et Seconds_Behind_Source est stable et proche de 0, la réplication est parfaitement saine.',
      examTrap: 'Si Replica_IO_Running est à "Connecting", la réplication ne fonctionne pas : le réplica n\'a pas encore réussi son handshake TCP/auth.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - SHOW REPLICA STATUS Statement',
    },
  },
  {
    id: 'fc-mysql908-dom05-011',
    cardNumber: 11,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Calcul exact et cas particuliers de Seconds_Behind_Source',
    difficulty: 'hard',
    tags: ['Seconds_Behind_Source', 'Replication Lag', 'Timestamp', 'Monitoring'],
    front: {
      question: 'Comment MySQL calcule-t-il exactement la métrique Seconds_Behind_Source et que signifie une valeur NULL ?',
      hint: 'Différence entre l\'horloge du réplica et le timestamp enregistré dans la transaction par la source ; NULL signifie qu\'un thread est inactif.',
    },
    back: {
      answer: 'Mécanisme de calcul de `Seconds_Behind_Source` :\n\n- **Formule mathématique** :\n  $$\\text{Seconds\\_Behind\\_Source} = T_{\\text{current\\_replica}} - T_{\\text{event\\_source}} - \\Delta_{\\text{clock\\_skew}}$$\n  - $T_{\\text{event\\_source}}$ est l\'horodatage gravé dans l\'en-tête de la transaction sur la Source au moment de son exécution.\n  - $T_{\\text{current\\_replica}}$ est l\'heure actuelle sur le Réplica lors de la lecture du Relay Log.\n- **Signification de la valeur `NULL`** :\n  - Le thread I/O ou le thread SQL est arrêté (`No`). Impossible de mesurer le décalage.\n- **Cas particuliers et pièges** :\n  1. **Longue transaction en cours** : Si une transaction prend 1 heure à s\'exécuter sur le réplica, `Seconds_Behind_Source` augmentera continuellement jusqu\'au commit final.\n  2. **Désynchronisation NTP** : Si les horloges système de la Source et du Réplica diffèrent, la valeur peut être faussée ou afficher temporairement 0.',
      explanation: 'Une synchronisation NTP rigoureuse entre tous les serveurs est indispensable pour la fiabilité de cette métrique.',
      examTrap: 'Seconds_Behind_Source ne mesure pas le temps de transfert réseau, mais le décalage d\'horodatage de la transaction actuellement traitée par le thread SQL.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Interpreting Seconds_Behind_Source',
    },
  },
  {
    id: 'fc-mysql908-dom05-012',
    cardNumber: 12,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Diagnostic des pannes de réplication fréquentes : Erreurs 1062 et 1032',
    difficulty: 'medium',
    tags: ['Error 1062', 'Error 1032', 'Troubleshooting', 'Drift'],
    front: {
      question: 'Quelles sont les causes fondamentales des erreurs de réplication 1062 (Duplicate entry) et 1032 (Key not found) et pourquoi surviennent-elles ?',
      codeSnippet: `Last_SQL_Errno: 1062
Last_SQL_Error: Could not execute Write_rows event on table db.orders; Duplicate entry '4502' for key 'PRIMARY', Error_code: 1062
-- OU
Last_SQL_Errno: 1032
Last_SQL_Error: Could not execute Update_rows event on table db.orders; Key not found, Error_code: 1032`,
      hint: 'Modifications locales directes (écritures pirates) sur le réplica ayant désynchronisé les données par rapport à la source.',
    },
    back: {
      answer: 'Origine des erreurs 1062 et 1032 :\n\n- **Erreur 1062 (`HA_ERR_FOUND_DUPP_KEY` / Duplicate entry)** :\n  - Le thread SQL tente d\'insérer une ligne répliquée depuis la source, mais la clé primaire existe déjà localement sur le réplica.\n  - *Cause* : Une écriture en écriture directe (`INSERT`) a été effectuée sur le réplica sans passer par la source.\n- **Erreur 1032 (`HA_ERR_KEY_NOT_FOUND` / Key not found)** :\n  - Le thread SQL tente de modifier (`UPDATE`) ou supprimer (`DELETE`) une ligne sur le réplica, mais celle-ci n\'existe pas dans la table locale.\n  - *Cause* : La ligne a été effacée directement sur le réplica ou n\'avait jamais été insérée suite à un filtrage incorrect.\n- **Prévention absolue** : Activer impérativement `read_only = ON` et `super_read_only = ON` sur tous les réplicas.',
      explanation: 'Ces erreurs prouvent une divergence de données (data drift) entre la source et le réplica.',
      examTrap: 'Ignorer aveuglément ces erreurs aggrave la corruption logique des données entre les nœuds.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Replication Error Handling',
    },
  },
  {
    id: 'fc-mysql908-dom05-013',
    cardNumber: 13,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Le danger de replica_skip_errors / slave_skip_errors',
    difficulty: 'hard',
    tags: ['replica_skip_errors', 'slave_skip_errors', 'Data Integrity', 'Anti-Pattern'],
    front: {
      question: 'Pourquoi l\'utilisation du paramètre replica_skip_errors (ex: replica_skip_errors=1062,1032) est-elle formellement proscrite en production par Oracle ?',
      codeSnippet: `[mysqld]
# Pratique très dangereuse :
replica_skip_errors = 1062,1032,all`,
      hint: 'Le réplica ignore les erreurs et saute des transactions, créant une divergence silencieuse irréversible avec la source.',
    },
    back: {
      answer: 'Danger mortel de `replica_skip_errors` :\n\n- **Comportement** :\n  - Lorsqu\'une instruction échoue sur le réplica avec l\'un des codes spécifiés, le thread SQL ignore l\'erreur, ne s\'arrête pas et passe immédiatement à la transaction suivante.\n- **Conséquences désastreuses en production** :\n  1. **Divergence silencieuse des données (Data Inconsistency)** : La base du réplica n\'est plus le reflet conforme de la source. Des lignes manquantes ou incohérentes s\'accumulent sans que les alertes de monitoring ne se déclenchent.\n  2. **Effet boule de neige** : Ignorer un `INSERT` en doublon ou un `UPDATE` manquant provoquera des cascades d\'erreurs ultérieures sur les transactions dépendantes.\n  3. **Catastrophe en cas de basculement (Failover)** : Si ce réplica corrompu est promu en nouvelle source lors d\'un sinistre, l\'application lira et écrira sur des données erronées (perte d\'intégrité référentielle, commandes perdues).',
      explanation: 'La seule approche professionnelle est de corriger la donnée manquante manuellement ou de réinjecter la transaction via GTID.',
      examTrap: 'Ne configurez jamais replica_skip_errors en environnement critique de production.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - replica_skip_errors System Variable',
    },
  },
  {
    id: 'fc-mysql908-dom05-014',
    cardNumber: 14,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Protection des Réplicas en lecture seule : read_only vs super_read_only',
    difficulty: 'medium',
    tags: ['read_only', 'super_read_only', 'Security', 'SUPER Privilege'],
    front: {
      question: 'Quelle est la différence fondamentale de sécurité entre read_only=ON et super_read_only=ON sur un réplica MySQL ?',
      codeSnippet: `mysql> SET GLOBAL read_only = ON;
-- VS
mysql> SET GLOBAL super_read_only = ON;`,
      hint: 'read_only bloque les utilisateurs normaux mais autorise les utilisateurs avec SUPER / CONNECTION_ADMIN ; super_read_only bloque tout le monde sauf les threads de réplication.',
    },
    back: {
      answer: 'Différence entre `read_only` et `super_read_only` :\n\n- **`read_only = ON`** :\n  - Bloque toutes les requêtes en écriture (`INSERT`, `UPDATE`, `DELETE`, `CREATE`) pour les utilisateurs réguliers (sans privilèges administrateur).\n  - **Exception majeure** : Les utilisateurs disposant du privilège **`SUPER`** ou **`SYSTEM_VARIABLES_ADMIN`** peuvent TOUJOURS exécuter des écritures directes (un DBA connecté en `root` peut polluer le réplica par inadvertance).\n  - Les threads de réplication interne continuent d\'écrire normalement.\n- **`super_read_only = ON`** :\n  - **Bloque absolument TOUS les utilisateurs**, y compris `root` et ceux possédant le privilège `SUPER`.\n  - Seuls les threads internes de réplication (`Replica Applier Threads`) sont autorisés à modifier les tables.\n  - Activer `super_read_only = ON` active automatiquement `read_only = ON`.',
      explanation: 'Indispensable pour immuniser totalement les nœuds secondaires contre les erreurs humaines ou les mauvais routages applicatifs.',
      examTrap: 'Sous super_read_only=ON, même l\'utilisateur root reçoit l\'erreur --read-only mode s\'il tente un UPDATE manuel.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: super_read_only',
    },
  },
  {
    id: 'fc-mysql908-dom05-015',
    cardNumber: 15,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Réplication retardée intentionnelle : SOURCE_DELAY',
    difficulty: 'medium',
    tags: ['SOURCE_DELAY', 'Delayed Replication', 'Human Error Protection', 'PITR'],
    front: {
      question: 'Comment et pourquoi configure-t-on un délai de réplication intentionnel (Delayed Replication) sur un réplica ?',
      codeSnippet: `mysql> STOP REPLICA;
mysql> CHANGE REPLICATION SOURCE TO SOURCE_DELAY = 14400; -- 4 heures en secondes
mysql> START REPLICA;`,
      hint: 'Option SOURCE_DELAY ; le thread I/O télécharge immédiatement les logs mais le SQL thread attend l\'écoulement du délai avant d\'appliquer.',
    },
    back: {
      answer: 'Fonctionnement et intérêt de `SOURCE_DELAY` :\n\n- **Mécanisme** :\n  - Le paramètre `SOURCE_DELAY = N` (en secondes) ordonne au thread SQL d\'attendre qu\'au moins $N$ secondes se soient écoulées depuis l\'exécution d\'un événement sur la source avant de l\'appliquer localement.\n  - Le thread I/O continue de télécharger en temps réel les événements dans les Relay Logs sans aucun retard.\n- **Cas d\'usage principal : Bouclier anti-erreur humaine** :\n  - Si un développeur ou un DBA exécute accidentellement `DROP DATABASE production;` ou un `DELETE` sans clause `WHERE` à 10h00, et que le délai est de 4 heures (14 400 s) :\n  - Le réplica se trouve encore dans l\'état de 06h00.\n  - L\'administrateur a 4 heures pour faire `STOP REPLICA SQL_THREAD;`, puis récupérer les données intactes immédiatement sans avoir à restaurer une sauvegarde de plusieurs téraoctets.',
      explanation: 'Une assurance-vie extrêmement peu coûteuse en ressources pour récupérer rapidement après une bévue humaine.',
      examTrap: 'SOURCE_DELAY ne retarde pas le thread I/O : les Relay Logs sont à jour sur le disque du réplica.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Delayed Replication',
    },
  },

  // =========================================================================
  // SECTION 2 : FORMATS DE BINLOG, FILTRAGE & OPTIONS DES LOGS (Cartes 16 à 28)
  // STATEMENT, ROW, MIXED, binlog_row_image, filtres Source/Replica,
  // replicate_rewrite_db, binlog_expire_logs_seconds, chiffrement binlog
  // =========================================================================
  {
    id: 'fc-mysql908-dom05-016',
    cardNumber: 16,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Comparaison architecturale des formats de journaux : STATEMENT, ROW et MIXED',
    difficulty: 'medium',
    tags: ['binlog_format', 'STATEMENT', 'ROW', 'MIXED', 'Architecture'],
    front: {
      question: 'Quelles sont les caractéristiques fondamentales des 3 formats de journalisation binaire (binlog_format) sous MySQL ?',
      hint: 'STATEMENT enregistre le texte SQL brut, ROW enregistre les deltas de données modifiées, MIXED combine les deux selon le type de requête.',
    },
    back: {
      answer: 'Les 3 formats de journal binaire (`binlog_format`) :\n\n1. **`STATEMENT` (SBR - Statement-Based Replication)** :\n   - Enregistre textuellement les requêtes SQL telles qu\'exécutées par le client (`UPDATE users SET status=1...`).\n   - *Avantage* : Fichiers binlogs très compacts.\n   - *Défaut* : Risque élevé de divergence avec les fonctions non déterministes.\n2. **`ROW` (RBR - Row-Based Replication - Par défaut en 8.0)** :\n   - Enregistre les images binaires réelles des lignes modifiées (avant/après) après exécution de la requête.\n   - *Avantage* : Déterminisme absolu, sécurité transactionnelle totale, aucune ambiguïté.\n   - *Défaut* : Fichiers plus volumineux lors d\'opérations massives (`UPDATE` de 10 millions de lignes).\n3. **`MIXED` (MBR - Mixed-Based Replication)** :\n   - Utilise `STATEMENT` par défaut, mais bascule automatiquement en `ROW` si la requête contient des fonctions non déterministes (ex: `UUID()`, triggers).',
      explanation: 'MySQL 8.0 adopte ROW par défaut car la sécurité et l\'intégrité des données priment sur l\'espace disque.',
      examTrap: 'Le format STATEMENT est obsolète pour les architectures modernes et proscrit dans InnoDB Cluster / Group Replication.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Replication Formats',
    },
  },
  {
    id: 'fc-mysql908-dom05-017',
    cardNumber: 17,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Dangers et fonctions non déterministes avec binlog_format=STATEMENT',
    difficulty: 'hard',
    tags: ['STATEMENT', 'Non-Deterministic', 'UUID', 'RAND', 'Data Drift'],
    front: {
      question: 'Pourquoi l\'exécution d\'instructions contenant UUID() ou LIMIT sans ORDER BY en format STATEMENT corrompt-elle la cohérence des données du réplica ?',
      codeSnippet: `-- Exécuté en binlog_format = STATEMENT :
INSERT INTO audit_tokens (id, created_at) VALUES (UUID(), NOW());
DELETE FROM tasks WHERE status = 'PENDING' LIMIT 1;`,
      hint: 'UUID() est réévalué indépendamment sur le réplica générant une valeur différente, et LIMIT sans tri dépend de l\'organisation physique des pages.',
    },
    back: {
      answer: 'Échec de déterminisme avec `binlog_format = STATEMENT` :\n\n1. **Fonctions dynamiques et aléatoires (`UUID()`, `RAND()`, `USER()`, `VERSION()`)** :\n   - En rejouant le texte SQL brut sur le réplica, `UUID()` est évalué une seconde fois et génère un nouvel identifiant complètement différent de celui inséré sur la source !\n   - Les clés primaires et clés étrangères divergent immédiatement.\n2. **Requêtes `LIMIT` sans `ORDER BY` explicite** :\n   - L\'ordre de scan des lignes dépend de l\'optimiseur, de l\'agencement physique des pages en mémoire et du plan d\'exécution.\n   - Le réplica peut supprimer la ligne #10 tandis que la source a supprimé la ligne #42.\n3. **Moteurs et triggers complexes** : Les effets de bord de triggers imbriqués peuvent s\'exécuter dans un ordre imprévisible.',
      explanation: 'En format ROW, la ligne générée sur la source est écrite telle quelle dans le binlog, éliminant tout aléa.',
      examTrap: 'Même NOW() peut poser problème en STATEMENT si les fuseaux horaires ou le décalage réseau sont mal synchronisés.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Statement-Based Replication Hazards',
    },
  },
  {
    id: 'fc-mysql908-dom05-018',
    cardNumber: 18,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Granularité des images de lignes : binlog_row_image (FULL, MINIMAL, NOBLOB)',
    difficulty: 'medium',
    tags: ['binlog_row_image', 'FULL', 'MINIMAL', 'NOBLOB', 'I/O Optimization'],
    front: {
      question: 'Quelles sont les différences entre les 3 options de binlog_row_image (FULL, MINIMAL, NOBLOB) et quel est leur impact sur le volume des binlogs ?',
      codeSnippet: `mysql> SET GLOBAL binlog_row_image = 'MINIMAL';`,
      hint: 'FULL enregistre toutes les colonnes avant/après, MINIMAL n\'enregistre que les colonnes modifiées et la clé de recherche, NOBLOB exclut les gros champs inchangés.',
    },
    back: {
      answer: 'Options de la variable `binlog_row_image` (en format ROW) :\n\n1. **`FULL` (Valeur par défaut de MySQL 8.0)** :\n   - Enregistre l\'intégralité des colonnes de la ligne dans l\'image avant (*before-image*) et dans l\'image après (*after-image*), même si une seule colonne a été modifiée.\n   - *Avantage* : Traçabilité d\'audit parfaite et sécurité maximale pour la résolution des conflits.\n2. **`MINIMAL`** :\n   - *Before-image* : Contient uniquement les colonnes nécessaires à l\'identification de la ligne (clé primaire ou colonnes d\'index unique).\n   - *After-image* : Contient uniquement les colonnes dont la valeur a réellement changé.\n   - *Avantage* : Réduit considérablement la taille des fichiers binlogs lors d\'updates sur de larges tables.\n3. **`NOBLOB`** :\n   - Comme `FULL`, mais n\'enregistre pas les colonnes `BLOB` / `TEXT` si celles-ci n\'ont pas été modifiées par la transaction.',
      explanation: 'Group Replication impose impérativement binlog_row_image=FULL ou MINIMAL pour son mécanisme d\'extraction de write sets.',
      examTrap: 'En mode MINIMAL, si une table n\'a pas de clé primaire, toutes les colonnes doivent être enregistrées dans la before-image pour identifier la ligne.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - binlog_row_image System Variable',
    },
  },
  {
    id: 'fc-mysql908-dom05-019',
    cardNumber: 19,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Filtrage côté Source : binlog_do_db et binlog_ignore_db',
    difficulty: 'hard',
    tags: ['binlog_do_db', 'binlog_ignore_db', 'Source Filtering', 'Exam Trap'],
    front: {
      question: 'Quel est l\'effet exact de binlog_do_db et binlog_ignore_db sur la Source, et quel piège redoutable survient en format STATEMENT ?',
      codeSnippet: `[mysqld]
binlog_do_db = sales_db`,
      hint: 'En format STATEMENT, le filtre teste la base de données active (USE database) et non la table affectée par la requête.',
    },
    back: {
      answer: 'Filtrage côté Source et piège du format STATEMENT :\n\n- **Rôle** :\n  - Détermine quelles modifications sont enregistrées dans le Binary Log de la source. Ce qui n\'est pas écrit dans le binlog n\'existera jamais pour aucun réplica ni pour le PITR.\n- **Le piège classique de l\'examen (Format `STATEMENT`)** :\n  - Le filtre compare `binlog_do_db` avec la **base de données par défaut de la session** (`USE db;`) et **NON** avec la base qualifiée dans la requête !\n  - Exemple catastrophique :\n    ```sql\n    USE hr_db;\n    UPDATE sales_db.orders SET total = 100; -- N\x27est PAS écrit dans le binlog car la base active est hr_db !\n    ```\n- **En format `ROW`** :\n  - Le filtre s\'applique correctement à la base de données propriétaire de la table modifiée (`sales_db.orders`), rendant le filtrage prévisible.\n- **Bonne pratique Oracle** : Éviter de filtrer sur la source afin de préserver l\'intégrité des sauvegardes PITR.',
      explanation: 'Filtrer sur la source rend la sauvegarde binaire incomplète pour une récupération globale.',
      examTrap: 'Une requête multi-bases peut être partiellement tronquée dans le binlog si binlog_do_db est mal configuré.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Evaluation of Binary Logging Options',
    },
  },
  {
    id: 'fc-mysql908-dom05-020',
    cardNumber: 20,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Filtrage côté Réplica : replicate-do-db et replicate-ignore-db',
    difficulty: 'medium',
    tags: ['replicate-do-db', 'replicate-ignore-db', 'Replica Filtering'],
    front: {
      question: 'Comment fonctionnent replicate-do-db et replicate-ignore-db sur le Réplica et pourquoi le filtrage par table est-il plus sûr ?',
      codeSnippet: `[mysqld]
replicate_do_db = crm_db
replicate_ignore_db = logs_db`,
      hint: 'Le réplica télécharge tous les logs dans ses Relay Logs, mais le thread SQL ignore les transactions des bases exclues.',
    },
    back: {
      answer: 'Filtrage de base de données côté Réplica :\n\n- **Fonctionnement** :\n  - Le thread I/O télécharge tous les événements binaires envoyés par la source sans filtrage réseau.\n  - C\'est le **thread SQL** (Applier) qui inspecte chaque événement et décide s\'il l\'applique ou l\'ignore selon les règles définies.\n- **Pourquoi le filtrage par table est supérieur** :\n  - `replicate_do_db` souffre du même problème d\'évaluation de la base active en mode `STATEMENT`.\n  - Les règles par table (`replicate_do_table` et `replicate_wild_do_table`) examinent le nom exact et complet de la table cible (`schema.table`), indépendamment de la commande `USE db;` active lors de la connexion.',
      explanation: 'Permet de créer des réplicas spécialisés (ex: un réplica qui ne stocke que la base de reporting).',
      examTrap: 'Si une transaction modifie à la fois une table incluse et une table exclue, le comportement peut générer des incohérences référentielles.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Replication Database Options and Variables',
    },
  },
  {
    id: 'fc-mysql908-dom05-021',
    cardNumber: 21,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Filtrage par motif générique : replicate_wild_do_table et replicate_wild_ignore_table',
    difficulty: 'medium',
    tags: ['replicate_wild_do_table', 'replicate_wild_ignore_table', 'Pattern Matching', 'Filtering'],
    front: {
      question: 'Quelle est la syntaxe et la règle de correspondance de replicate_wild_do_table pour répliquer toutes les tables d\'une base ainsi qu\'un ensemble spécifique ?',
      codeSnippet: `[mysqld]
replicate_wild_do_table = \x27ecommerce.%\x27
replicate_wild_do_table = \x27analytics.fact_%\x27
replicate_wild_ignore_table = \x27ecommerce.tmp_%\x27`,
      hint: 'Utilisation des caractères génériques SQL % (zéro ou plusieurs caractères) et _ (un seul caractère).',
    },
    back: {
      answer: 'Filtrage avec motifs génériques (`wildcard`) :\n\n- **Syntaxe** : `replicate_wild_do_table = \x27schema_pattern.table_pattern\x27`\n  - `%` : Correspond à n\'importe quelle chaîne de 0 ou plusieurs caractères.\n  - `_` : Correspond exactement à un seul caractère (attention aux caractères soulignés dans les noms de tables, qui doivent être échappés par `\\_` si l\'on veut un littéral).\n- **Comportement** :\n  - `\'ecommerce.%\'` : Réplique toutes les tables du schéma `ecommerce`.\n  - `\'analytics.fact_%\'` : Réplique uniquement les tables du schéma `analytics` dont le nom commence par `fact_`.\n  - `\'ecommerce.tmp_%\'` dans ignore : Exclut toutes les tables temporaires de `ecommerce`.\n- C\'est la méthode de filtrage la plus robuste et la plus utilisée en production.',
      explanation: 'Évite les ambiguïtés liées à la commande USE active sur la session client.',
      examTrap: 'N\'oubliez pas que "_" est un joker SQL : "db.t_1" correspondra à "t11", "t21", "tA1" sauf si vous échappez "db.t\\_1".',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - replicate_wild_do_table Option',
    },
  },
  {
    id: 'fc-mysql908-dom05-022',
    cardNumber: 22,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Réécriture dynamique de schémas en vol : replicate_rewrite_db',
    difficulty: 'hard',
    tags: ['replicate_rewrite_db', 'Schema Translation', 'Multitenancy'],
    front: {
      question: 'Comment répliquer les données d\'une base de production nommée "prod_db" vers un schéma "reporting_db" sur un réplica sans modifier la source ?',
      codeSnippet: `[mysqld]
replicate_rewrite_db = 'prod_db->reporting_db'`,
      hint: 'Option replicate_rewrite_db avec la flèche "source_schema->target_schema".',
    },
    back: {
      answer: 'Fonctionnalité de réécriture de schéma (`replicate_rewrite_db`) :\n\n- **Syntaxe** : `replicate_rewrite_db = \x27from_name->to_name\x27`\n- **Mécanisme** :\n  - Lorsque le thread SQL lit un événement dans le Relay Log concernant la table `prod_db.clients`, il traduit dynamiquement le nom du schéma et exécute la modification sur `reporting_db.clients`.\n- **Cas d\'usage** :\n  1. Alimentation d\'une base de reporting ou de test avec un nom distinct.\n  2. Consolidation multi-sources : fusionner plusieurs bases régionales (ex: `paris_db`, `tokyo_db`) vers des schémas d\'agrégation.\n- **Restrictions critiques** :\n  - Ne fonctionne que sur les tables et vues.\n  - Ne réécrit PAS le code interne des procédures stockées ou triggers qui contiendraient des références en dur vers l\'ancien nom.',
      explanation: 'Permet une flexibilité totale d\'intégration sans impacter les applications écrivant sur la source.',
      examTrap: 'Si le réplica applique également des filtres replicate_do_db, ils sont évalués APRÈS la réécriture du nom de la base.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - replicate_rewrite_db Option',
    },
  },
  {
    id: 'fc-mysql908-dom05-023',
    cardNumber: 23,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Modification dynamique des filtres de réplication : CHANGE REPLICATION FILTER',
    difficulty: 'hard',
    tags: ['CHANGE REPLICATION FILTER', 'Dynamic Reconfig', 'No Restart'],
    front: {
      question: 'Quelle commande SQL permet de modifier ou réinitialiser les filtres de réplication sur un réplica sans redémarrer le démon mysqld ?',
      codeSnippet: `mysql> STOP REPLICA SQL_THREAD;
mysql> CHANGE REPLICATION FILTER 
  REPLICATE_WILD_DO_TABLE = ('shop.%', 'billing.%'),
  REPLICATE_WILD_IGNORE_TABLE = ('shop.cache_%');
mysql> START REPLICA SQL_THREAD;`,
      hint: 'Commande CHANGE REPLICATION FILTER applicable pendant que le thread SQL est à l\'arrêt.',
    },
    back: {
      answer: 'Administration dynamique via `CHANGE REPLICATION FILTER` :\n\n- **Avantage majeur** :\n  - Historiquement, toute modification de filtre de réplication nécessitait la modification de `my.cnf` et le redémarrage complet de l\'instance `mysqld`.\n  - `CHANGE REPLICATION FILTER` s\'exécute en ligne à chaud (nécessite seulement l\'arrêt du thread SQL via `STOP REPLICA SQL_THREAD`).\n- **Réinitialisation d\'un filtre (effacement)** :\n  - Pour supprimer complètement un filtre sans le remplacer, on spécifie une liste vide :\n    ```sql\n    CHANGE REPLICATION FILTER REPLICATE_DO_DB = ();\n    ```\n- **Persistance** :\n  - L\'effet est immédiat en mémoire. Pour que la règle survive au prochain redémarrage, elle doit être consignée dans le fichier `my.cnf` ou configurée via `SET PERSIST`.',
      explanation: 'Évite toute interruption de service sur les réplicas de lecture lors de l\'ajout d\'un schéma.',
      examTrap: 'CHANGE REPLICATION FILTER écrase entièrement la liste précédente pour le type de filtre spécifié (ne fait pas d\'ajout incrémental).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - CHANGE REPLICATION FILTER Statement',
    },
  },
  {
    id: 'fc-mysql908-dom05-024',
    cardNumber: 24,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Rétention et purge des journaux binaires : binlog_expire_logs_seconds',
    difficulty: 'medium',
    tags: ['binlog_expire_logs_seconds', 'PURGE BINARY LOGS', 'Disk Management', 'Retention'],
    front: {
      question: 'Quel paramètre remplace expire_logs_days en MySQL 8.0 et quelle commande purge manuellement les logs antérieurs à une date ou à un fichier ?',
      codeSnippet: `mysql> SET GLOBAL binlog_expire_logs_seconds = 604800; -- 7 jours (7 * 86400)
-- Commandes manuelles de purge :
mysql> PURGE BINARY LOGS TO 'mysql-bin.000030';
mysql> PURGE BINARY LOGS BEFORE '2026-09-01 00:00:00';`,
      hint: 'binlog_expire_logs_seconds pour la granularité à la seconde ; commande PURGE BINARY LOGS TO ou BEFORE.',
    },
    back: {
      answer: 'Gestion de la rétention des journaux binaires :\n\n- **Remplacement de variable** :\n  - En MySQL 8.0, `expire_logs_days` est déprécié au profit de **`binlog_expire_logs_seconds`** (valeur par défaut : 2 592 000 secondes = 30 jours).\n  - Permet une granularité précise (ex: conserver 12 heures de logs en période de fort volume I/O = 43 200 s).\n- **Purge manuelle (`PURGE BINARY LOGS`)** :\n  - `PURGE BINARY LOGS TO \'filename\'` : Supprime tous les fichiers binlog listés dans l\'index **antérieurs** au fichier nommé (le fichier nommé est conservé).\n  - `PURGE BINARY LOGS BEFORE \'date_heure\'` : Supprime les logs créés avant la date spécifiée.\n- **Règle absolue d\'exploitation** : Ne jamais exécuter `rm mysql-bin.*` sous Linux ! La suppression sans `PURGE` corrompt le fichier d\'index `mysql-bin.index`.',
      explanation: 'Si un réplica demande un log qui a été purgé prématurément, la réplication tombe en panne irréversible.',
      examTrap: 'PURGE BINARY LOGS TO conserve le fichier mentionné en paramètre et ne supprime que ses prédécesseurs.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - PURGE BINARY LOGS Statement',
    },
  },
  {
    id: 'fc-mysql908-dom05-025',
    cardNumber: 25,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Validation d\'intégrité des événements : binlog_checksum',
    difficulty: 'easy',
    tags: ['binlog_checksum', 'CRC32', 'Data Integrity', 'Corruption Detection'],
    front: {
      question: 'Quel est le rôle du paramètre binlog_checksum et comment protège-t-il la réplication contre les corruptions de paquets réseau ?',
      hint: 'Calcule une somme de contrôle CRC32 sur chaque événement binaire écrit et la vérifie avant l\'exécution.',
    },
    back: {
      answer: 'Rôle de `binlog_checksum` :\n\n- **Mécanisme** :\n  - Configuré par défaut à **`CRC32`** (valeurs possibles : `CRC32` ou `NONE`).\n  - La source calcule une empreinte cyclique (CRC32 de 4 octets) pour chaque événement binaire écrit sur le disque.\n- **Protection lors de la réplication** :\n  1. Le Binlog Dump Thread envoie l\'événement accompagné de sa somme CRC32.\n  2. Le thread I/O du réplica recalcule le CRC32 à la réception réseau : si un bit a sauté pendant le transit, l\'événement est rejeté et l\'erreur est signalée immédiatement.\n  3. Le thread SQL vérifie à nouveau le CRC32 en lisant le Relay Log avant de commiter les données.\n- Empêche l\'injection silencieuse de données corrompues dans les tables du réplica.',
      explanation: 'Introduit une surcharge CPU infinitésimale pour un niveau d\'assurance qualité matériel indispensable.',
      examTrap: 'Si binlog_checksum est modifié à NONE, les anciens réplicas peuvent échouer à lire les flux modernes.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - binlog_checksum System Variable',
    },
  },
  {
    id: 'fc-mysql908-dom05-026',
    cardNumber: 26,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Sécurisation et chiffrement du flux de réplication par SSL/TLS',
    difficulty: 'medium',
    tags: ['SSL/TLS', 'Encryption in Transit', 'SOURCE_SSL', 'Security'],
    front: {
      question: 'Quelles options de CHANGE REPLICATION SOURCE TO activent et imposent le chiffrement TLS lors des échanges entre la Source et le Réplica ?',
      codeSnippet: `mysql> CHANGE REPLICATION SOURCE TO
  SOURCE_SSL = 1,
  SOURCE_SSL_CA = '/etc/mysql/certs/ca.pem',
  SOURCE_SSL_CERT = '/etc/mysql/certs/client-cert.pem',
  SOURCE_SSL_KEY = '/etc/mysql/certs/client-key.pem',
  SOURCE_SSL_VERIFY_SERVER_CERT = 1;`,
      hint: 'Options SOURCE_SSL=1, certificats CA, client et vérification d\'identité d\'hôte SOURCE_SSL_VERIFY_SERVER_CERT.',
    },
    back: {
      answer: 'Chiffrement du transit de réplication (TLS) :\n\n- **Options clés** :\n  - `SOURCE_SSL = 1` : Exige que la connexion s\'établisse obligatoirement via un tunnel chiffré TLS.\n  - `SOURCE_SSL_CA` : Chemin vers le certificat de l\'autorité de certification (CA) ayant signé le certificat de la source.\n  - `SOURCE_SSL_CERT` / `SOURCE_SSL_KEY` : Certificat et clé privée du réplica pour l\'authentification mutuelle mTLS.\n  - `SOURCE_SSL_VERIFY_SERVER_CERT = 1` : Vérifie que le nom d\'hôte DNS de la source correspond exactement au Common Name (CN) ou Subject Alternative Name (SAN) du certificat serveur (protection contre les attaques Man-in-the-Middle).\n- Indispensable dès que le flux de réplication traverse un réseau public ou inter-cloud.',
      explanation: 'Les mots de passe et toutes les données en clair transitent ainsi à l\'abri des écoutes pirates.',
      examTrap: 'Si le certificat CA expire, le thread I/O passe en Replica_IO_Running=No avec une erreur SSL handshake failed.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Setting Up Replication Using SSL',
    },
  },
  {
    id: 'fc-mysql908-dom05-027',
    cardNumber: 27,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Chiffrement au repos des journaux binaires et Relay Logs : binlog_encryption',
    difficulty: 'hard',
    tags: ['binlog_encryption', 'TDE', 'Keyring', 'Encryption at Rest'],
    front: {
      question: 'Comment activer le chiffrement au repos des fichiers binlogs et logs relais sous MySQL 8.0 et quelle est l\'architecture à 2 niveaux de clés ?',
      codeSnippet: `[mysqld]
early-plugin-load = keyring_file.so
binlog_encryption = ON`,
      hint: 'Variable binlog_encryption=ON adossée à un composant Keyring stockant la clé maîtresse qui chiffre les clés de chiffrement de fichiers.',
    },
    back: {
      answer: 'Chiffrement au repos des journaux (`binlog_encryption = ON`) :\n\n- **Architecture à double niveau de clés (Two-Tier Key)** :\n  1. **Clé Maîtresse (Master Key / Keyring)** : Stockée de manière sécurisée hors des fichiers de données par un composant Keyring (`component_keyring_file` ou Vault).\n  2. **Clé de Fichier (File Password / File Key)** : Générée aléatoirement pour chaque fichier binaire individuel (`mysql-bin.000001`, `relay-bin.000001`). Elle chiffre les événements avec l\'algorithme AES-256-CTR.\n  - La clé de fichier est elle-même chiffrée par la Clé Maîtresse et stockée dans l\'en-tête du fichier de log.\n- **Rotation à chaud** :\n  - L\'instruction `ALTER INSTANCE ROTATE BINLOG MASTER KEY;` génère une nouvelle clé maîtresse sans interrompre le serveur.',
      explanation: 'Garantit la conformité RGPD/PCI-DSS si un disque ou un backup physique est dérobé.',
      examTrap: 'Sans composant Keyring initialisé au démarrage du serveur, l\'activation de binlog_encryption=ON échoue immédiatement.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Encrypting Binary Log Files and Relay Log Files',
    },
  },
  {
    id: 'fc-mysql908-dom05-028',
    cardNumber: 28,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Comportement du paramètre log_replica_updates / log_slave_updates',
    difficulty: 'medium',
    tags: ['log_replica_updates', 'log_slave_updates', 'Chained Replication', 'Topology'],
    front: {
      question: 'À quoi sert log_replica_updates (activé par défaut en 8.0) et dans quelles topologies est-il strictement obligatoire ?',
      hint: 'Ordonne au réplica d\'écrire les modifications reçues dans son propre journal binaire ; obligatoire pour les topologies en cascade (A -> B -> C).',
    },
    back: {
      answer: 'Rôle de `log_replica_updates` (remplace `log_slave_updates`) :\n\n- **Comportement** :\n  - `ON` (Par défaut en MySQL 8.0) : Dès que le thread SQL applique une transaction reçue depuis la Source, il l\'enregistre également dans son propre Binary Log local.\n  - `OFF` : Le réplica n\'enregistre dans son propre Binary Log que les requêtes exécutées localement par ses propres clients directs.\n- **Topologies exigeant impérativement `ON`** :\n  1. **Réplication en cascade / chaîne** : Serveur A $\\rightarrow$ Serveur B $\\rightarrow$ Serveur C. Pour que C reçoive les transactions de A, B doit les écrire dans son propre binlog.\n  2. **Topologies circulaires ou multi-sources**.\n  3. **Group Replication / InnoDB Cluster** : Tous les nœuds doivent obligatoirement activer cette variable.',
      explanation: 'Permet également à un réplica de servir immédiatement de nouvelle source sans perte d\'historique en cas de basculement.',
      examTrap: 'Désactiver log_replica_updates sur un réplica intermédiaire empêche immédiatement les réplicas situés en aval de recevoir les modifications.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - log_replica_updates System Variable',
    },
  },

  // =========================================================================
  // SECTION 3 : GTID (GLOBAL TRANSACTION IDENTIFIERS) : THÉORIE & DÉPANNAGE (Cartes 29 à 50)
  // Structure, Sets, gtid_mode, enforce_gtid_consistency, SOURCE_AUTO_POSITION,
  // gtid_executed, gtid_purged, mysql.gtid_executed, injection vide, dépannage
  // =========================================================================
  {
    id: 'fc-mysql908-dom05-029',
    cardNumber: 29,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Structure et composition anatomique d\'un GTID',
    difficulty: 'easy',
    tags: ['GTID', 'UUID', 'Transaction ID', 'Architecture'],
    front: {
      question: 'Quelle est la structure exacte d\'un GTID (Global Transaction Identifier) dans MySQL et comment est-il généré ?',
      codeSnippet: `3E11FA47-71CA-11E1-9E33-C80AA9E29573:14`,
      hint: 'Composé de deux éléments séparés par deux-points : l\'identifiant unique du serveur (UUID) et le numéro séquentiel de transaction.',
    },
    back: {
      answer: 'Anatomie d\'un GTID :\n\n$$\\text{GTID} = \\text{source\\_id} : \\text{transaction\\_id}$$\n\n1. **`source_id`** :\n   - C\'est le **Server UUID** du serveur sur lequel la transaction a été initialement commité (consultable via `SELECT @@GLOBAL.server_uuid;`).\n   - Identifiant unique de 128 bits au format hexadécimal généré lors du premier démarrage du serveur et stocké dans le fichier `auto.cnf`.\n2. **`transaction_id`** :\n   - Un entier non signé de 64 bits (1 à $2^{64}-1$) qui s\'incrémente de manière strictement monotone (+1) à chaque commit sur ce serveur.\n- **Caractéristique universelle** : Même si la transaction est répliquée sur 50 serveurs à travers le monde, elle conserve **exactement le même GTID** sur tous les nœuds de la topologie.',
      explanation: 'Garantit l\'unicité globale et l\'identification absolue de chaque transaction au sein d\'une infrastructure distribuée.',
      examTrap: 'Le source_id est le server_uuid (chaîne UUID) et non le server_id (entier numérique).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - GTID Format and Storage',
    },
  },
  {
    id: 'fc-mysql908-dom05-030',
    cardNumber: 30,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Notion de GTID Sets et notation par intervalles',
    difficulty: 'medium',
    tags: ['GTID Set', 'Intervals', 'Syntax', 'gtid_executed'],
    front: {
      question: 'Comment interpréter la chaîne suivante représentant un GTID Set contenant plusieurs intervalles et plusieurs serveurs ?',
      codeSnippet: `24DA1670-0513-11ED-A1EB-0242AC120002:1-15:20-25,
3E11FA47-71CA-11E1-9E33-C80AA9E29573:1-105`,
      hint: 'Une virgule sépare des serveurs différents ; un deux-points sépare l\'UUID de ses plages ; un tiret indique un intervalle continu.',
    },
    back: {
      answer: 'Décodage d\'un GTID Set :\n\n- Un **GTID Set** représente un ensemble mathématique de transactions appliquées :\n  1. **UUID #1 (`24DA1670...`)** :\n     - `:1-15` : Les transactions 1 à 15 ont été exécutées.\n     - `:20-25` : Les transactions 20 à 25 ont été exécutées.\n     - *(Remarque : Les transactions 16 à 19 n\'ont pas été appliquées, créant un "trou" temporaire ou intentionnel)*.\n  2. **Séparateur virgule `,`** :\n     - Sépare les flux provenant de serveurs d\'origine distincts.\n  3. **UUID #2 (`3E11FA47...`)** :\n     - `:1-105` : Les transactions 1 à 105 ont été exécutées de manière continue sans aucun trou.\n- Les GTID Sets sont compactés automatiquement par MySQL (ex: si la transaction 16 à 19 arrive, `1-15:20-25` devient `1-25`).',
      explanation: 'Format utilisé par gtid_executed, gtid_purged et dans les protocoles de synchronisation.',
      examTrap: 'L\'ordre d\'affichage des UUID dans un set n\'a pas d\'importance mathématique : MySQL les ordonne par ordre alphabétique.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - GTID Sets',
    },
  },
  {
    id: 'fc-mysql908-dom05-031',
    cardNumber: 31,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Avantage majeur du GTID vs réplication par positions physiques',
    difficulty: 'medium',
    tags: ['GTID vs Position', 'Auto-Positioning', 'Failover', 'High Availability'],
    front: {
      question: 'Pourquoi la réplication GTID élimine-t-elle la complexité du repérage manuel des fichiers binlogs et positions lors d\'un basculement de source ?',
      hint: 'Le réplica envoie l\'ensemble des GTID qu\'il possède déjà, et la source lui transmet automatiquement les transactions manquantes.',
    },
    back: {
      answer: 'Révolution du GTID pour la Haute Disponibilité :\n\n- **En réplication par position (Ancienne méthode)** :\n  - En cas de panne de la Source A, pour faire pointer le Réplica C vers le nouveau maître B, le DBA devait chercher manuellement dans les logs de B quel était le fichier exact (`binlog.000012`) et l\'offset d\'octet (`pos 849302`) correspondant à la dernière requête exécutée sur C (calcul fastidieux et source majeure d\'erreurs).\n- **En réplication GTID (Auto-Positioning)** :\n  - Le Réplica C se connecte à B et lui présente simplement son ensemble **`gtid_executed`** (ex: "J\'ai exécuté les transactions 1 à 500").\n  - B calcule instantanément la différence mathématique et commence automatiquement l\'envoi à partir de la transaction 501.\n  - Basculement instantané, 100% automatisable et sans aucun calcul d\'offset.',
      explanation: 'Condition sine qua non pour l\'automatisation du failover dans les orchestrateurs (MySQL Router, Orchestrator).',
      examTrap: 'Avec GTID, les paramètres SOURCE_LOG_FILE et SOURCE_LOG_POS sont totalement ignorés si SOURCE_AUTO_POSITION = 1.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Advantages of Using GTIDs',
    },
  },
  {
    id: 'fc-mysql908-dom05-032',
    cardNumber: 32,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Activation de l\'auto-positionnement : SOURCE_AUTO_POSITION = 1',
    difficulty: 'easy',
    tags: ['SOURCE_AUTO_POSITION', 'Configuration', 'GTID', 'CHANGE REPLICATION SOURCE TO'],
    front: {
      question: 'Quelle est la syntaxe exacte pour basculer un réplica en mode d\'auto-positionnement GTID avec CHANGE REPLICATION SOURCE TO ?',
      codeSnippet: `mysql> STOP REPLICA;
mysql> CHANGE REPLICATION SOURCE TO SOURCE_AUTO_POSITION = 1;
mysql> START REPLICA;`,
      hint: 'Clause SOURCE_AUTO_POSITION = 1 (remplace MASTER_AUTO_POSITION = 1).',
    },
    back: {
      answer: 'Activation de l\'auto-positionnement GTID :\n\n- **Instruction** :\n  ```sql\n  STOP REPLICA;\n  CHANGE REPLICATION SOURCE TO SOURCE_AUTO_POSITION = 1;\n  START REPLICA;\n  ```\n- **Comportement lors de la négociation de connexion** :\n  1. Le réplica transmet son union de `gtid_executed` à la source lors du handshake.\n  2. Si la source possède toutes les transactions manquantes dans ses journaux binaires actifs, elle commence le streaming sans nécessiter de coordonnées de fichiers.\n- **Pour désactiver l\'auto-positionnement** :\n  - Il faut spécifier explicitement `SOURCE_AUTO_POSITION = 0` suivi de `SOURCE_LOG_FILE = ...` et `SOURCE_LOG_POS = ...`.',
      explanation: 'C\'est la commande standard pour associer un réplica à un cluster GTID.',
      examTrap: 'SOURCE_AUTO_POSITION=1 échouera si gtid_mode n\'est pas activé à ON sur les deux serveurs.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Using GTIDs for Replication',
    },
  },
  {
    id: 'fc-mysql908-dom05-033',
    cardNumber: 33,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Procédure de migration vers GTID en ligne (Online GTID Migration) : gtid_mode',
    difficulty: 'hard',
    tags: ['gtid_mode', 'Online Migration', 'OFF_PERMISSIVE', 'ON_PERMISSIVE', 'Step-by-Step'],
    front: {
      question: 'Quelles sont les 4 étapes strictes pour activer gtid_mode en production sans redémarrage et sans interruption de service ?',
      codeSnippet: `gtid_mode = OFF
-> gtid_mode = OFF_PERMISSIVE
-> gtid_mode = ON_PERMISSIVE
-> gtid_mode = ON`,
      hint: 'Transition séquentielle obligatoire : OFF -> OFF_PERMISSIVE -> ON_PERMISSIVE -> ON sur tous les serveurs.',
    },
    back: {
      answer: 'Séquence officielle d\'activation de GTID en ligne (sans redémarrage) :\n\n1. **Étape 1 : Activer la cohérence stricte** :\n   `SET GLOBAL enforce_gtid_consistency = WARN;` (puis vérifier les logs), puis `SET GLOBAL enforce_gtid_consistency = ON;`.\n2. **Étape 2 : Autoriser la génération anonyme et GTID (`OFF_PERMISSIVE`)** :\n   `SET GLOBAL gtid_mode = OFF_PERMISSIVE;` sur tous les serveurs. (Les nouveaux événements sont anonymes mais les réplicas acceptent les deux).\n3. **Étape 3 : Imposer la génération GTID (`ON_PERMISSIVE`)** :\n   `SET GLOBAL gtid_mode = ON_PERMISSIVE;` sur tous les serveurs. (Les nouvelles transactions génèrent obligatoirement un GTID, mais les anciens réplicas acceptent encore les transactions anonymes).\n4. **Étape 4 : Vérifier qu\'il ne reste plus de transactions anonymes** :\n   Attendre que `SHOW STATUS LIKE \'Ongoing_anonymous_transaction_count\';` retourne 0 sur tous les nœuds.\n5. **Étape 5 : Verrouillage final à `ON`** :\n   `SET GLOBAL gtid_mode = ON;` sur tous les nœuds, puis activer `SOURCE_AUTO_POSITION = 1`.',
      explanation: 'Permet de migrer un parc de production sans aucune coupure de service.',
      examTrap: 'Tenter de passer directement de OFF à ON sans passer par les modes intermédiaires génère une erreur SQL immédiate.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Enabling GTID Transactions Online',
    },
  },
  {
    id: 'fc-mysql908-dom05-034',
    cardNumber: 34,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Le rôle de enforce_gtid_consistency = ON et ses interdictions strictes',
    difficulty: 'hard',
    tags: ['enforce_gtid_consistency', 'Restrictions', 'CREATE TABLE SELECT', 'Temporary Tables'],
    front: {
      question: 'Quelles opérations SQL précises sont formellement bloquées lorsque enforce_gtid_consistency est activé à ON ?',
      codeSnippet: `mysql> SET GLOBAL enforce_gtid_consistency = ON;
-- Quelle requête sera rejetée ?
mysql> CREATE TABLE new_users AS SELECT * FROM users; -- Erreur !`,
      hint: 'CREATE TABLE ... SELECT, les transactions multi-moteurs non-transactionnels, et les CREATE/DROP TEMPORARY TABLE dans les transactions.',
    },
    back: {
      answer: 'Restrictions absolues imposées par `enforce_gtid_consistency = ON` :\n\n1. **`CREATE TABLE ... AS SELECT` (CTAS) est strictement interdit** :\n   - Génère une erreur `ER_GTID_UNSAFE_CREATE_TABLE_AS_SELECT`.\n   - *Raison* : Cette instruction effectue à la fois du DDL (création) et du DML (insertion). En binaire, cela nécessiterait soit deux GTID, soit un GTID partagé rompant l\'atomicité.\n2. **`CREATE TEMPORARY TABLE` et `DROP TEMPORARY TABLE` au sein d\'une transaction explicite** :\n   - Les tables temporaires sont spécifiques à une session et ne sont pas crash-safe.\n3. **Mises à jour multi-moteurs non-transactionnelles** :\n   - Interdiction de modifier dans la même transaction une table InnoDB et une table MyISAM/MEMORY.',
      explanation: 'Garantit que chaque transaction loguée dans le binlog correspond rigoureusement à une unité d\'exécution atomique.',
      examTrap: 'Pour contourner l\'interdiction de CTAS, il faut séparer en 2 commandes : CREATE TABLE (...) puis INSERT INTO ... SELECT.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Restrictions on Replication with GTIDs',
    },
  },
  {
    id: 'fc-mysql908-dom05-035',
    cardNumber: 35,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'La variable système gtid_executed : rôle et comportement',
    difficulty: 'medium',
    tags: ['gtid_executed', 'GTID Set', 'Monitoring', 'Global Variable'],
    front: {
      question: 'Que contient exactement la variable globale @@GLOBAL.gtid_executed et quand est-elle incrémentée ?',
      codeSnippet: `mysql> SELECT @@GLOBAL.gtid_executed;`,
      hint: 'Ensemble de toutes les transactions commitées sur ce serveur ou reçues et appliquées depuis une source.',
    },
    back: {
      answer: 'Rôle de `@@GLOBAL.gtid_executed` :\n\n- **Définition** :\n  - C\'est un GTID Set représentant l\'ensemble exhaustif de toutes les transactions qui ont été appliquées et commitées sur le serveur local depuis sa création.\n- **Contenu** :\n  - Inclut à la fois les transactions nées localement (portant le `server_uuid` du serveur local) ET les transactions reçues d\'autres serveurs via la réplication (portant leurs UUID d\'origine respectifs).\n- **Moment de mise à jour** :\n  - Mis à jour **instantanément en mémoire** dès qu\'une transaction fait son `COMMIT` dans le moteur de stockage et s\'écrit dans le Binary Log.\n- **Propriété** : Variable en lecture seule (`Read-Only`). On ne peut pas faire un `SET @@GLOBAL.gtid_executed = ...` directement.',
      explanation: 'Sert de référence absolue pour savoir quel est le niveau de fraîcheur des données sur une machine.',
      examTrap: 'gtid_executed est en lecture seule : pour initialiser manuellement un historique, on manipule gtid_purged.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - gtid_executed System Variable',
    },
  },
  {
    id: 'fc-mysql908-dom05-036',
    cardNumber: 36,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'La variable système gtid_purged : rôle lors des purges et restaurations',
    difficulty: 'hard',
    tags: ['gtid_purged', 'Purged Transactions', 'Restoration', 'Backup'],
    front: {
      question: 'Que représente gtid_purged et dans quel cas précis un DBA doit-il exécuter SET @@GLOBAL.gtid_purged ?',
      codeSnippet: `mysql> SELECT @@GLOBAL.gtid_purged;
mysql> SET @@GLOBAL.gtid_purged = '+3E11FA47-71CA-11E1-9E33-C80AA9E29573:1-500000';`,
      hint: 'Transactions commitées dont les journaux binaires ont été supprimés ; initialisé après la restauration d\'un dump logique ou physique.',
    },
    back: {
      answer: 'Rôle et manipulation de `gtid_purged` :\n\n- **Définition** :\n  - C\'est un sous-ensemble strict de `gtid_executed` représentant l\'ensemble des transactions qui ont été exécutées sur ce serveur, mais dont **les fichiers Binary Log correspondants ont été purgés** du disque (`PURGE BINARY LOGS` ou expiration).\n- **Cas d\'usage critique : Restauration d\'un réplica** :\n  - Lorsque vous restaurez un réplica à partir d\'un backup `mysqldump` ou MySQL Shell d\'une base de 10 ans contenant 50 millions de transactions :\n  - Le dump contient l\'état figé au GTID 500000, mais les fichiers binlogs correspondants ne sont pas présents sur le nouveau serveur.\n  - Le dump injecte : `SET @@GLOBAL.gtid_purged = \'...:1-500000\';`.\n  - Cela informe MySQL que ces 500 000 transactions font bien partie de l\'histoire de la base, permettant à la réplication de demander directement la transaction 500001 à la source !',
      explanation: 'Depuis MySQL 8.0, la syntaxe avec le signe plus (+) permet d\'ajouter des GTID à gtid_purged sans écraser l\'existant.',
      examTrap: 'On ne peut pas définir gtid_purged si gtid_executed contient déjà d\'autres transactions et que la valeur n\'est pas vide (sauf avec + en 8.0).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - gtid_purged System Variable',
    },
  },
  {
    id: 'fc-mysql908-dom05-037',
    cardNumber: 37,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Table système interne mysql.gtid_executed et persistance sans log_bin',
    difficulty: 'hard',
    tags: ['mysql.gtid_executed', 'Crash Recovery', 'InnoDB Table', 'log_bin'],
    front: {
      question: 'Où et comment MySQL persiste-t-il les GTID pour survivre à un redémarrage, notamment si le binaire log_bin est désactivé sur un réplica ?',
      codeSnippet: `mysql> SELECT * FROM mysql.gtid_executed LIMIT 5;`,
      hint: 'Table InnoDB interne mysql.gtid_executed et compression périodique des intervalles.',
    },
    back: {
      answer: 'Persistance via la table InnoDB `mysql.gtid_executed` :\n\n1. **Rôle de la table `mysql.gtid_executed`** :\n   - Table système stockée dans le tablespace système InnoDB.\n   - Consigne les lignes `(source_uuid, interval_start, interval_end)` pour reconstituer `gtid_executed` au redémarrage du serveur.\n2. **Si `log_bin = ON`** :\n   - À chaque rotation de binlog (`FLUSH LOGS`) ou arrêt du serveur, MySQL compacte les GTID du binlog clôturé et les écrit dans `mysql.gtid_executed`.\n3. **Si `log_bin = OFF` (sur un réplica pur en lecture)** :\n   - Chaque transaction appliquée par le thread SQL est enregistrée **directement et atomiquement dans la table `mysql.gtid_executed`** en même temps que la transaction métier InnoDB.\n4. **Thread de compression périodique** :\n   - Un thread d\'arrière-plan fusionne régulièrement les lignes fragmentées (ex: transforme 10 000 lignes de transactions unitaires en un seul intervalle `1-10000`).',
      explanation: 'Garantit la pérennité absolue des GTID même si les binlogs ne sont pas archivés sur un nœud secondaire.',
      examTrap: 'Ne tentez jamais d\'insérer ou d\'effacer des lignes manuellement dans mysql.gtid_executed.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The mysql.gtid_executed Table',
    },
  },
  {
    id: 'fc-mysql908-dom05-038',
    cardNumber: 38,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Dépannage d\'erreur GTID : Injection de transaction vide (Empty Transaction)',
    difficulty: 'hard',
    tags: ['gtid_next', 'Empty Transaction', 'Troubleshooting', 'Skip Error'],
    front: {
      question: 'Comment débloquer une réplication GTID arrêtée sur une transaction fautive sans utiliser sql_replica_skip_counter ?',
      codeSnippet: `Last_SQL_Error: ... Duplicate entry '99' for key 'PRIMARY', Error_code: 1062
-- Comment sauter proprement la transaction '3E11FA47-71CA-11E1-9E33-C80AA9E29573:105' ?`,
      hint: 'Définir explicitement gtid_next sur le GTID bloquant, commiter une transaction vide (BEGIN; COMMIT;), puis repasser en AUTOMATIC.',
    },
    back: {
      answer: 'Procédure d\'injection d\'une transaction vide (Empty Transaction) :\n\n- Avec GTID, `SET GLOBAL sql_replica_skip_counter = N` est **invalide et rejeté par MySQL**.\n- **Méthode chirurgicale d\'excellence** :\n  ```sql\n  STOP REPLICA;\n  -- 1. Forcer la session à adopter l\x27identité du GTID bloquant\n  SET GTID_NEXT = \x273E11FA47-71CA-11E1-9E33-C80AA9E29573:105\x27;\n  \n  -- 2. Commiter une transaction vide sans aucune requête à l\'intérieur\n  BEGIN;\n  COMMIT;\n  \n  -- 3. Rétablir impérativement le comportement automatique\n  SET GTID_NEXT = \x27AUTOMATIC\x27;\n  \n  -- 4. Redémarrer la réplication\n  START REPLICA;\n  ```\n- **Résultat** : La transaction 105 est désormais marquée comme "exécutée" dans `gtid_executed`. Lorsque le thread SQL lit l\'événement fautif dans son Relay Log, il voit que ce GTID a déjà été commité et le saute instantanément !',
      explanation: 'Méthode officielle et la plus sûre pour contourner un blocage sans corrompre les coordonnées globales.',
      examTrap: 'Oublier d\'exécuter SET GTID_NEXT = "AUTOMATIC" bloquera toutes les requêtes futures de la session avec une erreur GTID_NEXT.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Skipping a Transaction with GTIDs',
    },
  },
  {
    id: 'fc-mysql908-dom05-039',
    cardNumber: 39,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Erreur fatale ER_MASTER_HAS_PURGED_REQUIRED_GTIDS : cause et résolution',
    difficulty: 'hard',
    tags: ['ER_MASTER_HAS_PURGED_REQUIRED_GTIDS', 'Purge Error', 'Troubleshooting', 'Lag'],
    front: {
      question: 'Quelle est la cause exacte de l\'erreur ER_MASTER_HAS_PURGED_REQUIRED_GTIDS et quelles sont les options pour réparer le réplica ?',
      codeSnippet: `Last_IO_Errno: 1236
Last_IO_Error: Got fatal error 1236 from source when reading data from binary log: 
'The slave is connecting using AUTO_POSITION, but the source has purged the binary logs containing GTIDs that the slave requires.'`,
      hint: 'Le réplica demande des transactions qui ont déjà été supprimées sur la source via PURGE BINARY LOGS.',
    },
    back: {
      answer: 'Diagnostic et résolution de l\'erreur 1236 :\n\n- **Cause** :\n  - Le réplica a été arrêté trop longtemps ou a subi un retard immense.\n  - La source a purgé ses anciens fichiers binlogs (`binlog_expire_logs_seconds`).\n  - Le réplica se connecte et demande la transaction $N$, mais celle-ci n\'existe plus sur la source car elle a été détruite physiquement.\n- **Conséquence** : La réplication est définitivement rompue et ne peut plus reprendre d\'elle-même.\n- **Solutions de réparation** :\n  1. **Clonage direct (Méthode moderne recommandée)** : Exécuter `CLONE INSTANCE FROM \'donor_user\'@\'source_host\':3306;` pour réinitialiser complètement le réplica à l\'état courant.\n  2. **Restauration d\'un backup récent** : Restaurer la dernière sauvegarde physique ou MySQL Shell dump et reconfigurer la réplication.',
      explanation: 'Pour éviter ce drame, augmentez binlog_expire_logs_seconds sur la source ou surveillez l\'espace disque.',
      examTrap: 'Aucune commande sql_replica_skip ne peut résoudre cette erreur : les données manquantes n\'existent tout simplement plus sur la source.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Troubleshooting GTID-Based Replication',
    },
  },
  {
    id: 'fc-mysql908-dom05-040',
    cardNumber: 40,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Fonctions intégrées de manipulation de GTID Sets : GTID_SUBTRACT et GTID_IS_SUBSET',
    difficulty: 'medium',
    tags: ['GTID_SUBTRACT', 'GTID_IS_SUBSET', 'SQL Functions', 'Auditing'],
    front: {
      question: 'À quoi servent les fonctions SQL GTID_SUBTRACT() et GTID_IS_SUBSET() lors de l\'audit d\'une topologie de réplication ?',
      codeSnippet: `mysql> SELECT GTID_SUBTRACT(@@GLOBAL.gtid_executed, '3E11FA47-71CA-11E1-9E33-C80AA9E29573:1-100');
mysql> SELECT GTID_IS_SUBSET('UUID:1-50', @@GLOBAL.gtid_executed);`,
      hint: 'GTID_SUBTRACT calcule la différence mathématique (manquants) et GTID_IS_SUBSET vérifie l\'inclusion.',
    },
    back: {
      answer: 'Fonctions de calcul sur les GTID Sets :\n\n- **`GTID_SUBTRACT(Set_A, Set_B)`** :\n  - Retourne tous les GTID présents dans `Set_A` qui ne sont **PAS** présents dans `Set_B` ($A \\setminus B$).\n  - *Cas d\'usage classique* : Comparer le `gtid_executed` de la Source ($A$) avec celui du Réplica ($B$) pour lister la liste exacte des transactions que le réplica n\'a pas encore reçues ou appliquées.\n- **`GTID_IS_SUBSET(Set_A, Set_B)`** :\n  - Retourne `1` (True) si tous les GTID de `Set_A` font partie de `Set_B` ($A \\subseteq B$), sinon `0` (False).\n  - Permet de vérifier instantanément si un réplica possède l\'intégralité des données d\'une sauvegarde avant de lancer une migration.',
      explanation: 'Outils mathématiques natifs précieux pour scripter des vérifications de cohérence avant un failover.',
      examTrap: 'Si GTID_SUBTRACT(Source, Replica) renvoie une chaîne vide "", cela prouve que le réplica est à 100% synchronisé avec la source.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - GTID Functions',
    },
  },
  {
    id: 'fc-mysql908-dom05-041',
    cardNumber: 41,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Synchronisation applicative garantie : WAIT_FOR_EXECUTED_GTID_SET',
    difficulty: 'hard',
    tags: ['WAIT_FOR_EXECUTED_GTID_SET', 'Read-After-Write', 'Consistency', 'Application Design'],
    front: {
      question: 'Comment une application web peut-elle garantir une cohérence de lecture immédiate (Read-After-Write) sur un réplica grâce à WAIT_FOR_EXECUTED_GTID_SET() ?',
      codeSnippet: `-- Sur le réplica, avant de lire les données :
SELECT WAIT_FOR_EXECUTED_GTID_SET('3E11FA47-71CA-11E1-9E33-C80AA9E29573:1052', 5);`,
      hint: 'Bloque la session cliente jusqu\'à ce que le réplica ait exécuté le GTID demandé, ou jusqu\'à l\'expiration du timeout.',
    },
    back: {
      answer: 'Garantie Read-After-Write avec `WAIT_FOR_EXECUTED_GTID_SET` :\n\n- **Le problème classique** :\n  - Un utilisateur modifie son profil sur la Source (opération générant le GTID `UUID:1052`).\n  - Sa requête suivante redirigée vers un Réplica en retard risque d\'afficher son ancien profil !\n- **La solution avec `WAIT_FOR_EXECUTED_GTID_SET(gtid_set [, timeout])`** :\n  1. L\'application récupère le GTID généré lors de l\'écriture sur la source.\n  2. Avant de lire sur le réplica, elle exécute `SELECT WAIT_FOR_EXECUTED_GTID_SET(\'UUID:1052\', 5);`.\n  3. Si le réplica a déjà commité ce GTID, la fonction retourne immédiatement `0`.\n  4. S\'il a quelques millisecondes de retard, la session cliente est mise en sommeil jusqu\'à ce que le thread SQL valide la transaction.\n  5. Si le délai de 5 secondes expire sans validation, la fonction retourne `1` (timeout).',
      explanation: 'Élimine les anomalies de réplication asynchrone pour les opérations sensibles de l\'utilisateur.',
      examTrap: 'Ne définissez pas un timeout infini ou trop élevé, sous peine d\'engorger les pools de connexions PHP/Java si la réplication est bloquée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - WAIT_FOR_EXECUTED_GTID_SET Function',
    },
  },
  {
    id: 'fc-mysql908-dom05-042',
    cardNumber: 42,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Injection de transaction avec GTID manuel imposé',
    difficulty: 'medium',
    tags: ['GTID_NEXT', 'Manual GTID', 'ETL', 'Data Injection'],
    front: {
      question: 'Comment forcer MySQL à attribuer un GTID précis à une transaction spécifique exécutée localement ?',
      codeSnippet: `mysql> SET GTID_NEXT = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA:1';
mysql> INSERT INTO config (param, value) VALUES ('site_status', 'maintenance');
mysql> COMMIT;
mysql> SET GTID_NEXT = \x27AUTOMATIC\x27;`,
      hint: 'Affecter le GTID désiré à la variable de session GTID_NEXT avant le COMMIT.',
    },
    back: {
      answer: 'Attribution manuelle de GTID (`SET GTID_NEXT`) :\n\n- Par défaut, `GTID_NEXT = \'AUTOMATIC\'` : le serveur attribue automatiquement le `server_uuid` local et le numéro séquentiel suivant lors du commit.\n- **En spécifiant un GTID explicite** :\n  - Le serveur accepte d\'écrire la transaction dans le binaire log sous l\'UUID et le numéro imposés (même s\'il s\'agit de l\'UUID d\'un autre serveur d\'une ancienne infrastructure).\n  - Si ce GTID existe déjà dans `gtid_executed`, l\'instruction est ignorée silencieusement (comportement d\'idempotence).\n- **Règle absolue** : Toujours exécuter `SET GTID_NEXT = \x27AUTOMATIC\x27;` immédiatement après le `COMMIT` pour ne pas perturber les requêtes suivantes de la connexion.',
      explanation: 'Utilisé massivement par les outils de reprise après sinistre, les scripts de synchronisation et les imports de sauvegardes.',
      examTrap: 'Si vous oubliez le COMMIT ou ROLLBACK après avoir défini un GTID explicite, la fermeture de session annule la réservation du GTID.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - GTID_NEXT System Variable',
    },
  },
  {
    id: 'fc-mysql908-dom05-043',
    cardNumber: 43,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Réinitialisation complète de l\'historique GTID : RESET MASTER',
    difficulty: 'hard',
    tags: ['RESET MASTER', 'RESET BINARY LOGS AND GTIDS', 'Purge', 'Danger'],
    front: {
      question: 'Quel est l\'effet exact de RESET MASTER (ou RESET BINARY LOGS AND GTIDS) sur une instance configurée avec GTID ?',
      codeSnippet: `mysql> RESET MASTER;
-- En MySQL 8.0.22+ :
mysql> RESET BINARY LOGS AND GTIDS;`,
      hint: 'Supprime tous les fichiers binlogs, vide gtid_executed, gtid_purged et la table mysql.gtid_executed.',
    },
    back: {
      answer: 'Action destructrice de `RESET MASTER` / `RESET BINARY LOGS AND GTIDS` :\n\n1. **Suppression physique de tous les fichiers Binary Log** listés dans le fichier index (`mysql-bin.00000X`).\n2. **Remise à zéro de l\'index** : le prochain log créé s\'appellera `mysql-bin.000001`.\n3. **Effacement complet de l\'historique GTID** :\n   - Vide entièrement `@@GLOBAL.gtid_executed` et `@@GLOBAL.gtid_purged`.\n   - Tronque la table système `mysql.gtid_executed`.\n- **Avertissement de production majeur** :\n  - Ne jamais exécuter cette commande sur une Source en production connectée à des réplicas ! Les réplicas perdront tout repère d\'auto-positionnement et la réplication tombera immédiatement en panne.',
      explanation: 'À réserver exclusivement lors de l\'initialisation d\'un nouveau serveur avant sa mise en service.',
      examTrap: 'RESET MASTER n\'affecte pas les Relay Logs du réplica (qui sont effacés par RESET REPLICA).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - RESET MASTER Statement',
    },
  },
  {
    id: 'fc-mysql908-dom05-044',
    cardNumber: 44,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Export logique de bases sous GTID : mysqldump --set-gtid-purged',
    difficulty: 'hard',
    tags: ['--set-gtid-purged', 'mysqldump', 'Backup', 'GTID'],
    front: {
      question: 'Quelles sont les implications des options --set-gtid-purged=ON, OFF et COMMENTED lors de l\'utilisation de mysqldump ?',
      codeSnippet: `$ mysqldump --set-gtid-purged=ON ...
$ mysqldump --set-gtid-purged=OFF ...
$ mysqldump --set-gtid-purged=COMMENTED ...`,
      hint: 'ON génère une instruction SET gtid_purged non commentée, OFF ne génère rien, COMMENTED l\'ajoute sous forme de commentaire désactivé.',
    },
    back: {
      answer: 'Comportement de l\'option `--set-gtid-purged` de `mysqldump` :\n\n- **`--set-gtid-purged=ON`** :\n  - Écrit `SET @@GLOBAL.gtid_purged = \'...\';` en clair dans l\'en-tête du fichier SQL.\n  - *Usage* : Idéal pour initialiser un tout nouveau réplica à partir de zéro.\n  - *Danger* : Échouera à la restauration si la base cible contient déjà d\'autres transactions et que `gtid_executed` n\'est pas vide.\n- **`--set-gtid-purged=OFF`** :\n  - N\'inclut aucune mention de GTID dans l\'export.\n  - *Usage* : Recommandé pour extraire une table ou une base spécifique destinée à être importée dans un environnement de test ou un serveur sans toucher à ses compteurs GTID.\n- **`--set-gtid-purged=COMMENTED`** :\n  - Écrit la commande `SET @@GLOBAL.gtid_purged` encadrée par des commentaires SQL. Elle ne s\'exécute pas automatiquement mais reste consultable pour le DBA.',
      explanation: 'Indispensable pour réussir les imports de sauvegardes partielles sans corrompre les métadonnées GTID.',
      examTrap: 'Ne pas spécifier cette option sur un serveur où gtid_mode=ON génère un avertissement de mysqldump.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldump GTID Options',
    },
  },
  {
    id: 'fc-mysql908-dom05-045',
    cardNumber: 45,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Gestion des transactions anonymes sous gtid_mode=ON : Anonymous Transactions',
    difficulty: 'medium',
    tags: ['Anonymous Transactions', 'ASSIGN_GTIDS_TO_ANONYMOUS_TRANSACTIONS', 'GTID Migration'],
    front: {
      question: 'Comment répliquer depuis une ancienne Source sans GTID (anonyme) vers un Réplica moderne où gtid_mode=ON ?',
      codeSnippet: `mysql> CHANGE REPLICATION SOURCE TO
  ASSIGN_GTIDS_TO_ANONYMOUS_TRANSACTIONS = LOCAL;
-- OU
  ASSIGN_GTIDS_TO_ANONYMOUS_TRANSACTIONS = '3E11FA47-71CA-11E1-9E33-C80AA9E29573';`,
      hint: 'Option ASSIGN_GTIDS_TO_ANONYMOUS_TRANSACTIONS dans CHANGE REPLICATION SOURCE TO.',
    },
    back: {
      answer: 'Attribution de GTID aux flux anonymes (`ASSIGN_GTIDS_TO_ANONYMOUS_TRANSACTIONS`) :\n\n- **Problème** :\n  - Si la source tourne en `gtid_mode = OFF` (transactions anonymes) et que le réplica tourne en `gtid_mode = ON`, le réplica refuse par défaut d\'appliquer les transactions dépourvues de GTID.\n- **Solution MySQL 8.0** :\n  - L\'option **`ASSIGN_GTIDS_TO_ANONYMOUS_TRANSACTIONS`** génère automatiquement un GTID à la volée sur le réplica pour chaque transaction anonyme reçue :\n    - `= LOCAL` : Attribue un GTID basé sur le `server_uuid` du réplica local.\n    - `= \'UUID\'` : Attribue un GTID basé sur un UUID spécifique spécifié par le DBA.\n- Permet une transition douce lors de migrations d\'anciennes versions MySQL 5.7 vers MySQL 8.0.',
      explanation: 'Élimine le besoin de basculer tous les serveurs d\'un coup lors d\'une montée de version hétérogène.',
      examTrap: 'Ne jamais utiliser le même UUID personnalisé pour deux réplicas recevant le même flux sous peine de conflits de GTID.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Replication from a Source without GTIDs',
    },
  },
  {
    id: 'fc-mysql908-dom05-046',
    cardNumber: 46,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Promotion instantanée d\'un Réplica en Source (Failover GTID)',
    difficulty: 'medium',
    tags: ['Failover', 'Promotion', 'High Availability', 'GTID'],
    front: {
      question: 'Quelles sont les 3 étapes SQL minimales pour promouvoir un réplica en nouvelle source opérationnelle en mode GTID ?',
      codeSnippet: `-- Sur le réplica promu :
mysql> STOP REPLICA;
mysql> RESET REPLICA ALL;
mysql> SET GLOBAL read_only = OFF;
mysql> SET GLOBAL super_read_only = OFF;`,
      hint: 'Arrêt de la réplication, suppression des métadonnées de liaison, et désactivation du mode lecture seule.',
    },
    back: {
      answer: 'Procédure de promotion d\'un réplica en nouvelle source :\n\n1. **Arrêter la réplication et vérifier que tout le Relay Log est appliqué** :\n   ```sql\n   STOP REPLICA IO_THREAD;\n   -- Attendre que Replica_SQL_Running termine l\'application des logs\n   STOP REPLICA;\n   ```\n2. **Détacher le serveur de son ancien rôle de réplica** :\n   ```sql\n   RESET REPLICA ALL;\n   ```\n3. **Ouvrir le serveur aux écritures applicatives** :\n   ```sql\n   SET GLOBAL super_read_only = OFF;\n   SET GLOBAL read_only = OFF;\n   ```\n- En mode GTID, les autres réplicas restants peuvent être rattachés à cette nouvelle source d\'un simple `CHANGE REPLICATION SOURCE TO SOURCE_HOST=\'nouveau_maitre\', SOURCE_AUTO_POSITION=1;` sans aucun calcul d\'offset !',
      explanation: 'La simplicité de cette bascule est la raison pour laquelle GTID est obligatoire pour tout cluster haute disponibilité.',
      examTrap: 'Oublier d\'annuler super_read_only bloque immédiatement les écritures de l\'application cliente.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Switching Sources During Failover with GTIDs',
    },
  },
  {
    id: 'fc-mysql908-dom05-047',
    cardNumber: 47,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Idempotence transactionnelle native sous GTID',
    difficulty: 'easy',
    tags: ['Idempotency', 'Skip Already Applied', 'GTID Concept', 'Safety'],
    front: {
      question: 'Que fait un réplica MySQL en mode GTID s\'il reçoit une transaction dont le GTID est déjà présent dans son gtid_executed ?',
      hint: 'Il l\'ignore silencieusement sans lever d\'erreur de duplication.',
    },
    back: {
      answer: 'Principe d\'idempotence avec GTID :\n\n- Lorsqu\'un réplica reçoit un événement binaire portant un identifiant $G$ :\n  1. Il vérifie si $G \\in \\text{gtid\\_executed}$.\n  2. **Si oui (déjà présent)** : Le thread SQL **ignore silencieusement et immédiatement la transaction** sans réexécuter son contenu et passe directement à l\'événement suivant.\n  3. **Si non (absent)** : La transaction est exécutée, validée et son GTID $G$ est ajouté à `gtid_executed`.\n- **Bénéfice absolu** :\n  - Élimine tout risque d\'erreur d\'insertion en double (`Duplicate entry`) si plusieurs chemins de réplication renvoient le même flux (ex: topologies en diamant ou multi-sources).',
      explanation: 'Propriété fondamentale permettant la convergence mathématique de tous les nœuds d\'un cluster.',
      examTrap: 'En réplication par position classique, renvoyer la même transaction provoque une erreur 1062 et stoppe la réplication.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - GTID Lifecycle and Processing',
    },
  },
  {
    id: 'fc-mysql908-dom05-048',
    cardNumber: 48,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Réplication multi-sources (Multi-Source Replication) avec canaux de réplication',
    difficulty: 'hard',
    tags: ['Multi-Source', 'Replication Channels', 'FOR CHANNEL', 'Aggregation'],
    front: {
      question: 'Comment configurer un réplica pour qu\'il agrège les données de deux sources distinctes à l\'aide des canaux de réplication (Channels) ?',
      codeSnippet: `mysql> CHANGE REPLICATION SOURCE TO 
  SOURCE_HOST = 'source_paris', SOURCE_AUTO_POSITION = 1 
  FOR CHANNEL \x27paris_channel\x27;

mysql> CHANGE REPLICATION SOURCE TO 
  SOURCE_HOST = 'source_london', SOURCE_AUTO_POSITION = 1 
  FOR CHANNEL \x27london_channel\x27;`,
      hint: 'Clause FOR CHANNEL "channel_name" ajoutée à toutes les commandes administratives.',
    },
    back: {
      answer: 'Réplication Multi-Sources via les Canaux (Channels) :\n\n- **Concept** :\n  - Permet à un unique serveur réplica de se connecter simultanément à plusieurs serveurs sources distincts (jusqu\'à 256 canaux) pour consolider les données dans un entrepôt central.\n  - Chaque canal possède son propre thread I/O, ses propres Relay Logs et son propre thread SQL.\n- **Syntaxe de gestion avec `FOR CHANNEL`** :\n  - `START REPLICA FOR CHANNEL \x27paris_channel\x27;`\n  - `STOP REPLICA FOR CHANNEL \'london_channel\';`\n  - `SHOW REPLICA STATUS FOR CHANNEL \'paris_channel\';`\n- **Exigence impérative** : `master_info_repository = TABLE` et `relay_log_info_repository = TABLE` sont obligatoires pour le multi-sources.',
      explanation: 'Idéal pour centraliser les sauvegardes ou créer des nœuds d\'analyse globale multi-régions.',
      examTrap: 'Les noms de tables ou de clés ne doivent pas entrer en conflit entre les deux sources sauf si elles écrivent dans des schémas différents.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Multi-Source Replication',
    },
  },
  {
    id: 'fc-mysql908-dom05-049',
    cardNumber: 49,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Surveillance de la réplication via les tables Performance Schema',
    difficulty: 'medium',
    tags: ['Performance Schema', 'replication_connection_status', 'replication_applier_status', 'Monitoring'],
    front: {
      question: 'Quelles tables du schéma performance_schema remplacent avantageusement SHOW REPLICA STATUS pour monitorer programmatiquement la réplication en SQL ?',
      codeSnippet: `mysql> SELECT CHANNEL_NAME, SERVICE_STATE, LAST_ERROR_MESSAGE 
       FROM performance_schema.replication_connection_status;

mysql> SELECT CHANNEL_NAME, SERVICE_STATE, LAST_ERROR_NUMBER 
       FROM performance_schema.replication_applier_status_by_worker;`,
      hint: 'Tables replication_connection_status (thread I/O) et replication_applier_status (thread SQL).',
    },
    back: {
      answer: 'Tables Performance Schema de surveillance de réplication :\n\n1. **`replication_connection_status`** :\n   - Surveille le thread I/O récepteur (état de connexion TCP, coordonnées reçues, `LAST_ERROR_MESSAGE`).\n2. **`replication_applier_status`** :\n   - Surveille globalement le thread SQL applicateur.\n3. **`replication_applier_status_by_worker`** :\n   - Fournit l\'état individuel de chaque thread worker si la réplication parallèle (MTS) est activée.\n4. **`replication_applier_status_by_coordinator`** :\n   - Surveille le coordinateur de distribution des transactions.\n- **Avantage majeur** : Permet de faire des requêtes `SELECT ... WHERE SERVICE_STATE = \'OFF\'` pour générer des alertes de supervision automatisées sans parser du texte brut.',
      explanation: 'Standard moderne d\'observabilité utilisé par Prometheus, Zabbix et Datadog.',
      examTrap: 'SHOW REPLICA STATUS acquiert des verrous de mutex plus lourds que de simples SELECT sur le Performance Schema.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Replication Performance Schema Tables',
    },
  },
  {
    id: 'fc-mysql908-dom05-050',
    cardNumber: 50,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Topologies de réplication supportées : Étoile, Cascade, Circulaire et Multi-Source',
    difficulty: 'medium',
    tags: ['Topology', 'Star', 'Cascaded', 'Circular', 'Architecture'],
    front: {
      question: 'Quelles sont les caractéristiques et contraintes des 4 grandes architectures de réplication (Étoile, Cascade, Circulaire et Multi-Source) ?',
      hint: 'Étoile = une source vers N réplicas ; Cascade = relais intermédiaire ; Circulaire = boucle fermée (A->B->C->A) ; Multi-Source = N sources vers 1 réplica.',
    },
    back: {
      answer: 'Les 4 grandes topologies de réplication MySQL :\n\n1. **En Étoile (One-to-Many - Standard)** :\n   - 1 Source $\\rightarrow$ $N$ Réplicas.\n   - *Usage* : Répartition de charge en lecture (Read Scale-out).\n   - *Limite* : La source sature en I/O réseau si le nombre de réplicas devient trop important (> 10-20).\n2. **En Cascade / Arborescente (Chained / Relayed)** :\n   - Source $\\rightarrow$ Réplica Relais $\\rightarrow$ Réplicas Finaux.\n   - *Usage* : Soulager la source principale (le relais distribue le flux) ou franchir un lien WAN inter-datacenter.\n   - *Prérequis* : `log_replica_updates = ON` sur le relais.\n3. **Circulaire / Anneau (Circular / Ring)** :\n   - A $\\rightarrow$ B $\\rightarrow$ C $\\rightarrow$ A.\n   - *Danger* : Vulnérable aux conflits d\'écritures simultanées et risque de boucle infinie en cas de rupture de filtrage.\n4. **Multi-Source (Many-to-One)** :\n   - Multiples sources $\\rightarrow$ 1 Réplica unique agrégeant plusieurs canaux distincts.',
      explanation: 'Chaque topologie répond à une contrainte précise de géographie réseau ou de scalabilité de lectures.',
      examTrap: 'La réplication circulaire est déconseillée en production moderne, au profit de Group Replication / InnoDB Cluster.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Replication Topologies',
    },
  },
];
