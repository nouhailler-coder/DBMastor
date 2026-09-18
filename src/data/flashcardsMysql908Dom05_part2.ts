import { FlashcardItem } from '../types';

export const mysql908Dom05Part2Flashcards: FlashcardItem[] = [
  // =========================================================================
  // SECTION 4 : RÉPLICATION PARALLÈLE (MTS), CRASH-SAFETY & SEMI-SYNCHRONE (Cartes 51 à 68)
  // MTS, replica_parallel_workers, replica_parallel_type (LOGICAL_CLOCK),
  // binlog_transaction_dependency_tracking (WRITESET), crash-safe, semi-sync AFTER_SYNC
  // =========================================================================
  {
    id: 'fc-mysql908-dom05-051',
    cardNumber: 51,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Réplication multi-threadée (MTS) et résorption du goulot d\'étranglement applicateur',
    difficulty: 'medium',
    tags: ['MTS', 'Multi-Threaded Slave', 'Parallel Applier', 'Performance', 'Lag'],
    front: {
      question: 'Pourquoi la réplication mono-thread traditionnelle causait-elle un retard de réplication (Lag) chronique et comment le MTS résout-il ce problème ?',
      hint: 'Sur la source, des centaines de transactions s\'exécutent en parallèle, mais l\'ancien réplica ne possédait qu\'un unique thread SQL séquentiel.',
    },
    back: {
      answer: 'Problème de l\'applicateur mono-thread et solution MTS :\n\n- **Le goulot d\'étranglement historique** :\n  - Sur la Source : des centaines de connexions clientes exécutent des transactions simultanément en profitant de tous les cœurs CPU et des disques SSD NVMe.\n  - Sur l\'ancien Réplica : un seul et unique thread SQL (`Replica SQL Thread`) devait réexécuter toutes ces transactions les unes après les autres de manière strictement séquentielle.\n  - Résultat : dès qu\'une écriture lourde (ou un pic de charge) survenait, `Seconds_Behind_Source` explosait.\n- **La solution Multi-Threaded Replica (MTS)** :\n  - Un **thread Coordinateur** lit les Relay Logs et distribue intelligemment les transactions indépendantes à un pool de **threads Workers** qui les appliquent en parallèle dans InnoDB.',
      explanation: 'Permet au réplica de suivre le rythme d\'écriture de sources massives multi-cœurs.',
      examTrap: 'Le thread I/O reste unique : c\'est l\'application SQL (Applier) qui est parallélisée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Multi-Threaded Replication',
    },
  },
  {
    id: 'fc-mysql908-dom05-052',
    cardNumber: 52,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Dimensionnement des workers parallèles : replica_parallel_workers',
    difficulty: 'easy',
    tags: ['replica_parallel_workers', 'slave_parallel_workers', 'MTS', 'Tuning'],
    front: {
      question: 'Quel paramètre système définit le nombre de threads d\'application parallèles sur un réplica et quelle valeur désactive le MTS ?',
      codeSnippet: `mysql> SET GLOBAL replica_parallel_workers = 16;
-- slave_parallel_workers = 16 (alias rétrocompatible)`,
      hint: 'replica_parallel_workers ; 0 désactive la parallélisation et revient au thread SQL mono-thread.',
    },
    back: {
      answer: 'Configuration de `replica_parallel_workers` (remplace `slave_parallel_workers`) :\n\n- **Valeur par défaut** : 4 en MySQL 8.0 (0 sous 5.7).\n- **Comportement selon la valeur** :\n  - `= 0` : Désactive le MTS. Un seul thread SQL traite les événements de manière séquentielle.\n  - `> 0` (ex: 8, 16, 32) : Active le mode MTS. Le thread SQL principal devient le **Coordinateur**, et il alloue le travail à $N$ **threads Workers** exécutant les commits en parallèle.\n- **Recommandation de dimensionnement** :\n  - Généralement aligné sur le nombre de cœurs CPU disponibles sur le réplica (ex: entre 8 et 32 selon la volumétrie d\'écriture).\n- **Prérequis pour modifier à chaud** : Exécuter `STOP REPLICA SQL_THREAD;` avant le `SET GLOBAL`.',
      explanation: 'Une valeur trop élevée (ex: 128 workers sur 4 cœurs CPU) dégrade les performances par contentions de verrous internes.',
      examTrap: 'Définir replica_parallel_workers=1 ne revient pas exactement au mode mono-thread : cela conserve le surcoût de communication du coordinateur.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - replica_parallel_workers System Variable',
    },
  },
  {
    id: 'fc-mysql908-dom05-053',
    cardNumber: 53,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Politiques d\'ordonnancement parallèle : replica_parallel_type',
    difficulty: 'hard',
    tags: ['replica_parallel_type', 'DATABASE', 'LOGICAL_CLOCK', 'Parallel Scheduling'],
    front: {
      question: 'Quelle est la différence cruciale entre replica_parallel_type=DATABASE et replica_parallel_type=LOGICAL_CLOCK ?',
      codeSnippet: `[mysqld]
# Ancien mode (5.6/5.7) :
replica_parallel_type = DATABASE
# Mode moderne recommandé (MySQL 8.0) :
replica_parallel_type = LOGICAL_CLOCK`,
      hint: 'DATABASE ne parallélise que si les transactions touchent des schémas différents ; LOGICAL_CLOCK parallélise même au sein d\'une même base.',
    },
    back: {
      answer: 'Comparaison des politiques de parallélisation (`replica_parallel_type`) :\n\n1. **`DATABASE` (Ancien modèle par schéma)** :\n   - Les transactions ne sont parallélisées que si elles ciblent des **bases de données (schémas) différentes**.\n   - *Défaut rédhibitoire* : Si toute l\'application réside dans une seule base de données (ce qui est le cas de 95% des architectures), toutes les transactions vont sur le même worker et la réplication redevient 100% séquentielle !\n2. **`LOGICAL_CLOCK` (Modèle moderne transactionnel)** :\n   - Parallélise les transactions au sein d\'une **même base de données et même entre tables différentes**.\n   - Se base sur l\'historique des verrous acquis sur la source : deux transactions qui n\'étaient pas en conflit de verrouillage sur la source peuvent être réexécutées en parallèle sur le réplica.',
      explanation: 'LOGICAL_CLOCK est la seule politique viable pour éliminer le lag dans les applications monolithiques modernes.',
      examTrap: 'DATABASE est obsolète en 8.0 : LOGICAL_CLOCK doit toujours être privilégié.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - replica_parallel_type System Variable',
    },
  },
  {
    id: 'fc-mysql908-dom05-054',
    cardNumber: 54,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'L\'algorithme LOGICAL_CLOCK et les marqueurs last_committed / sequence_number',
    difficulty: 'hard',
    tags: ['LOGICAL_CLOCK', 'last_committed', 'sequence_number', 'mysqlbinlog'],
    front: {
      question: 'Comment le réplica sait-il que deux transactions peuvent s\'exécuter en parallèle en examinant last_committed et sequence_number dans le binlog ?',
      codeSnippet: `# at 450
#260918 10:00:00 server id 1 ... GTID ... last_committed=1 sequence_number=2
# at 920
#260918 10:00:00 server id 1 ... GTID ... last_committed=1 sequence_number=3`,
      hint: 'Toutes les transactions partageant la même valeur de last_committed ont été commitées ensemble et peuvent être rejouées en parallèle.',
    },
    back: {
      answer: 'Fonctionnement de l\'algorithme `LOGICAL_CLOCK` :\n\n- Chaque transaction enregistrée dans le Binary Log contient un en-tête d\'horloge logique composé de deux entiers :\n  1. **`sequence_number`** : L\'identifiant d\'ordre monotone de la transaction courante.\n  2. **`last_committed`** : Le `sequence_number` de la transaction la plus récente qui était déjà commitée lorsque la transaction courante a commencé à acquérir ses verrous.\n- **Règle mathématique d\'exécution parallèle sur le Réplica** :\n  - Deux transactions $T_A$ et $T_B$ peuvent s\'exécuter simultanément sur deux workers distincts si et seulement si elles possèdent le **même `last_committed`**, ou si le `sequence_number` de l\'une est inférieur ou égal au `last_committed` de l\'autre.\n  - Dans l\'exemple : la transaction 2 et la transaction 3 ont toutes deux `last_committed=1` : elles n\'étaient pas en conflit sur la source et sont donc exécutées en même temps sur le réplica !',
      explanation: 'Mécanisme élégant hérité du commit groupé binaire (Binary Log Group Commit).',
      examTrap: 'Si last_committed est différent, les transactions doivent attendre la fin de la précédente pour préserver la cohérence des lectures.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Binary Log Group Commit and MTS',
    },
  },
  {
    id: 'fc-mysql908-dom05-055',
    cardNumber: 55,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Détection des dépendances de transactions : binlog_transaction_dependency_tracking',
    difficulty: 'hard',
    tags: ['binlog_transaction_dependency_tracking', 'COMMIT_ORDER', 'WRITESET', 'WRITESET_SESSION', 'Throughput'],
    front: {
      question: 'Quelles sont les 3 options de binlog_transaction_dependency_tracking sur la Source et pourquoi WRITESET décuple-t-il la parallélisation ?',
      codeSnippet: `[mysqld]
# Sur la Source :
binlog_transaction_dependency_tracking = WRITESET
transaction_write_set_extraction = XXHASH64`,
      hint: 'COMMIT_ORDER dépend des commits simultanés ; WRITESET analyse les lignes réelles modifiées et permet de paralléliser même des transactions différées.',
    },
    back: {
      answer: 'Les 3 modes de `binlog_transaction_dependency_tracking` (configuré sur la Source) :\n\n1. **`COMMIT_ORDER` (Historique)** :\n   - Les transactions ne sont considérées comme parallélisables que si elles ont été commitées **exactement au même instant dans le même groupe de commit** sur la source.\n   - Si les requêtes arrivent de manière légèrement décalée, elles ne partagent pas le même `last_committed`.\n2. **`WRITESET` (Recommandé en production MySQL 8.0)** :\n   - La source calcule une empreinte de hash (`XXHASH64`) de chaque ligne et clé primaire touchée par la transaction.\n   - Deux transactions touchant des lignes différentes reçoivent le même `last_committed`, **même si elles ont été commitées avec plusieurs secondes d\'écart sur la source** !\n   - Décuple le parallélisme sur le réplica (multiplie souvent par 10 la vitesse de rattrapage du lag).\n3. **`WRITESET_SESSION`** :\n   - Identique à `WRITESET`, mais impose en plus que les transactions issues d\'une même session cliente restent ordonnées séquentiellement.',
      explanation: 'Le réglage WRITESET est le secret des architectures à très fort débit de réplication.',
      examTrap: 'WRITESET exige que transaction_write_set_extraction=XXHASH64 et binlog_format=ROW soient activés sur la source.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - binlog_transaction_dependency_tracking System Variable',
    },
  },
  {
    id: 'fc-mysql908-dom05-056',
    cardNumber: 56,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Préservation de l\'ordre de validation : replica_preserve_commit_order',
    difficulty: 'hard',
    tags: ['replica_preserve_commit_order', 'slave_preserve_commit_order', 'Consistency', 'Gap Prevention'],
    front: {
      question: 'À quoi sert replica_preserve_commit_order=ON et quel risque élimine-t-il lorsque des transactions sont exécutées en parallèle par les workers ?',
      codeSnippet: `mysql> SET GLOBAL replica_preserve_commit_order = ON;`,
      hint: 'Empêche une transaction rapide de se commiter avant une transaction lente qui la précédait dans le binlog de la source.',
    },
    back: {
      answer: 'Rôle fondamental de `replica_preserve_commit_order = ON` :\n\n- **Le problème sans cette option (`OFF`)** :\n  - Deux transactions indépendantes $T_1$ et $T_2$ sont attribuées au Worker 1 et Worker 2.\n  - Si $T_1$ est lourde (ex: modifie 1 000 lignes) et $T_2$ est légère (1 ligne), le Worker 2 peut commiter $T_2$ **avant** que le Worker 1 n\'ait fini $T_1$ !\n  - Conséquences : les applications lisant sur le réplica voient des transactions apparaître dans le désordre, et des "trous" temporaires apparaissent dans `gtid_executed`.\n- **Avec `replica_preserve_commit_order = ON` (Recommandé)** :\n  - Les workers exécutent leurs calculs en parallèle, mais **au moment du `COMMIT` final, le Worker 2 attend que le Worker 1 ait validé $T_1$**.\n  - L\'ordre de commit sur le réplica est strictement identique à celui de la source.\n  - Indispensable si le réplica sert lui-même de source en cascade ou pour Group Replication.',
      explanation: 'Garantit l\'absence d\'anomalies de lecture pour les clients du réplica.',
      examTrap: 'Peut provoquer des deadlocks entre workers si replica_parallel_type n\'est pas configuré sur LOGICAL_CLOCK.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - replica_preserve_commit_order System Variable',
    },
  },
  {
    id: 'fc-mysql908-dom05-057',
    cardNumber: 57,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Réplication Crash-Safe : relay_log_recovery et sync_relay_log_info',
    difficulty: 'hard',
    tags: ['relay_log_recovery', 'sync_relay_log_info', 'Crash-Safe', 'Disaster Recovery'],
    front: {
      question: 'Comment les paramètres relay_log_recovery=ON et sync_relay_log_info=1 garantissent-ils la reprise automatique sans corruption après un crash du réplica ?',
      codeSnippet: `[mysqld]
relay_log_recovery = ON
relay_log_info_repository = TABLE
sync_relay_log_info = 1`,
      hint: 'Au redémarrage, MySQL ignore et tronque tous les logs relais existants non validés et retélécharge les transactions depuis la source.',
    },
    back: {
      answer: 'Mécanisme de `relay_log_recovery = ON` lors d\'un crash :\n\n- **Le problème sans cette option** :\n  - En cas de coupure de courant brutale, le dernier fichier Relay Log écrit sur disque par le thread I/O peut être tronqué ou corrompu à mi-événement.\n  - Au redémarrage, le thread SQL tente de lire cet événement incomplet et s\'arrête avec une erreur fatale.\n- **Le sauvetage par `relay_log_recovery = ON`** :\n  1. Au redémarrage de `mysqld`, le serveur lit la position exactement commitée dans la table InnoDB `mysql.slave_relay_log_info`.\n  2. Il **efface et détruit tous les fichiers Relay Logs restants** sur le disque.\n  3. Le thread I/O initialise un tout nouveau Relay Log et demande à la Source de lui renvoyer le flux à partir de la dernière position validée par le thread SQL.\n  4. La réplication reprend sans aucune intervention du DBA.',
      explanation: 'Configuration universellement obligatoire sur tout réplica de production critique.',
      examTrap: 'relay_log_recovery exige impérativement relay_log_info_repository = TABLE.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - relay_log_recovery System Variable',
    },
  },
  {
    id: 'fc-mysql908-dom05-058',
    cardNumber: 58,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Réplication semi-synchrone : combler le fossé entre asynchrone et synchrone',
    difficulty: 'medium',
    tags: ['Semi-Synchronous', 'RPO=0', 'High Availability', 'Architecture'],
    front: {
      question: 'Quel est l\'objectif fondamental de la réplication semi-synchrone et quel compromis apporte-t-elle par rapport à la réplication asynchrone ?',
      hint: 'La source attend qu\'au moins un réplica ait écrit la transaction dans son Relay Log avant de confirmer le commit au client.',
    },
    back: {
      answer: 'Objectif et compromis de la réplication semi-synchrone :\n\n- **En réplication asynchrone pure** :\n  - La source commit localement et renvoie immédiatement le succès au client. Elle envoie le binlog au réplica sans attendre de réponse.\n  - *Risque* : Si la source crashe avant la transmission réseau, des transactions commitées sont définitivement perdues ($RPO > 0$).\n- **En réplication semi-synchrone** :\n  - La source n\'acquitte le succès au client applicatif **qu\'après avoir reçu un accusé de réception (ACK)** certifiant qu\'au moins un réplica a bien reçu la transaction et l\'a écrite dans son Relay Log.\n- **Garantie** : Garantit un **RPO = 0** (zéro perte de données en cas de crash de la source).\n- **Compromis** : Ajoute une latence réseau (RTT) sur chaque écriture cliente.',
      explanation: 'Le réplica n\'a pas besoin d\'avoir appliqué la transaction dans InnoDB, juste de l\'avoir sécurisée dans son Relay Log.',
      examTrap: 'Ce n\'est pas du synchrone absolu : le réplica n\'a pas encore exécuté la donnée, il a simplement garanti sa persistance sur disque.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Semi-Synchronous Replication Overview',
    },
  },
  {
    id: 'fc-mysql908-dom05-059',
    cardNumber: 59,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Installation et activation des plugins semi-synchrones sous MySQL 8.0',
    difficulty: 'medium',
    tags: ['Plugins', 'rpl_semi_sync_source', 'rpl_semi_sync_replica', 'Installation'],
    front: {
      question: 'Quels plugins doivent être installés respectivement sur la Source et sur le Réplica pour activer la réplication semi-synchrone ?',
      codeSnippet: `-- Sur la Source :
INSTALL PLUGIN rpl_semi_sync_source SONAME 'semisync_source.so';
SET GLOBAL rpl_semi_sync_source_enabled = 1;

-- Sur le Réplica :
INSTALL PLUGIN rpl_semi_sync_replica SONAME 'semisync_replica.so';
SET GLOBAL rpl_semi_sync_replica_enabled = 1;`,
      hint: 'Plugins rpl_semi_sync_source et rpl_semi_sync_replica (remplaçant rpl_semi_sync_master et rpl_semi_sync_slave).',
    },
    back: {
      answer: 'Installation des composants semi-synchrones :\n\n1. **Côté Source** :\n   ```sql\n   INSTALL PLUGIN rpl_semi_sync_source SONAME \'semisync_source.so\';\n   SET GLOBAL rpl_semi_sync_source_enabled = 1;\n   ```\n   *(Sous `my.cnf` : `rpl_semi_sync_source_enabled = 1`)*.\n2. **Côté Réplica** :\n   ```sql\n   INSTALL PLUGIN rpl_semi_sync_replica SONAME \'semisync_replica.so\';\n   SET GLOBAL rpl_semi_sync_replica_enabled = 1;\n   ```\n   *(Sous `my.cnf` : `rpl_semi_sync_replica_enabled = 1`)*.\n3. **Redémarrage du thread I/O** :\n   - Après l\'activation sur le réplica, il faut redémarrer le thread I/O (`STOP REPLICA IO_THREAD; START REPLICA IO_THREAD;`) pour qu\'il signale à la source sa capacité semi-synchrone.',
      explanation: 'En production moderne, les deux plugins sont souvent installés sur tous les serveurs pour faciliter les bascules.',
      examTrap: 'Oublier d\'activer la variable rpl_semi_sync_replica_enabled=1 sur le réplica laisse la source en attente d\'ACK.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Installing Semi-Synchronous Replication',
    },
  },
  {
    id: 'fc-mysql908-dom05-060',
    cardNumber: 60,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Modes d\'attente d\'ACK : AFTER_SYNC (Lossless) vs AFTER_COMMIT',
    difficulty: 'hard',
    tags: ['AFTER_SYNC', 'AFTER_COMMIT', 'Phantom Reads', 'Lossless Replication'],
    front: {
      question: 'Pourquoi le mode AFTER_SYNC (par défaut en 8.0) est-il qualifié de "Lossless" contrairement à l\'ancien mode AFTER_COMMIT ?',
      codeSnippet: `mysql> SET GLOBAL rpl_semi_sync_source_wait_point = 'AFTER_SYNC';
-- VS
mysql> SET GLOBAL rpl_semi_sync_source_wait_point = 'AFTER_COMMIT';`,
      hint: 'En AFTER_COMMIT, la transaction est validée dans le moteur avant l\'ACK : si la source crashe à cet instant, les autres clients ont vu des données qui n\'existent pas sur le réplica (Phantom Read).',
    },
    back: {
      answer: 'Comparaison des points d\'attente (`rpl_semi_sync_source_wait_point`) :\n\n- **1. Mode `AFTER_COMMIT` (Ancien mode MySQL 5.5/5.6)** :\n  1. La source écrit dans le binaire log.\n  2. La source **commite dans le moteur de stockage InnoDB** (les modifications deviennent visibles pour les autres sessions locales).\n  3. La source envoie le binlog et attend l\'ACK du réplica.\n  4. *Catastrophe en cas de crash* : Si la source crashe à l\'étape 3, un client local a déjà vu la transaction validée ("Lecture fantôme"), mais le réplica promu ne possède PAS cette transaction ! Il y a divergence et perte de données.\n- **2. Mode `AFTER_SYNC` (Mode sans perte / Lossless - Par défaut en 8.0)** :\n  1. La source écrit dans le binlog et flush dans le moteur.\n  2. **Elle attend l\'ACK du réplica AVANT de commiter dans InnoDB !**\n  3. Aucun client local ne peut voir les modifications tant que le réplica n\'a pas acquitté la réception.\n  4. Si la source crashe à l\'attente, la transaction est annulée au rollback local, et le réplica n\'a rien perdu.',
      explanation: 'AFTER_SYNC élimine les lectures fantômes et garantit une cohérence parfaite lors du basculement.',
      examTrap: 'AFTER_SYNC est la configuration impérative testée lors de l\'examen 1Z0-908.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - rpl_semi_sync_source_wait_point',
    },
  },
  {
    id: 'fc-mysql908-dom05-061',
    cardNumber: 61,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Quorum d\'accusés de réception : rpl_semi_sync_source_wait_for_replica_count',
    difficulty: 'medium',
    tags: ['wait_for_replica_count', 'Quorum', 'High Availability', 'Redundancy'],
    front: {
      question: 'Comment configurer la Source pour qu\'elle exige les accusés de réception d\'au moins 2 réplicas avant de valider chaque transaction ?',
      codeSnippet: `mysql> SET GLOBAL rpl_semi_sync_source_wait_for_replica_count = 2;`,
      hint: 'Paramètre rpl_semi_sync_source_wait_for_replica_count (valeur par défaut : 1).',
    },
    back: {
      answer: 'Configuration du quorum d\'ACK (`wait_for_replica_count`) :\n\n- **Rôle** :\n  - Définit le nombre strict d\'accusés de réception distincts que la source doit recevoir pour chaque transaction avant de clôturer le commit.\n- **Cas d\'usage** :\n  - Dans une architecture à 3 réplicas (1 Source + 3 Réplicas) répartis sur 3 zones de disponibilité (AZ) :\n  - Fixer la variable à `2` garantit que les données sont enregistrées dans au moins 2 zones distinctes en plus de la source.\n  - Même si la source et 1 réplica disparaissent simultanément, la donnée est certaine d\'exister sur le réplica survivant.\n- **Attention au dimensionnement** : La latence de chaque transaction correspondra au RTT du deuxième réplica le plus lent.',
      explanation: 'Offre une flexibilité de durabilité multi-sites puissante.',
      examTrap: 'Si le nombre de réplicas connectés devient inférieur à cette valeur, le timeout s\'écoulera sur chaque transaction.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - rpl_semi_sync_source_wait_for_replica_count',
    },
  },
  {
    id: 'fc-mysql908-dom05-062',
    cardNumber: 62,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Gestion du timeout et bascule en mode asynchrone dégradé',
    difficulty: 'medium',
    tags: ['rpl_semi_sync_source_timeout', 'Failover', 'Degraded Mode', 'Timeout'],
    front: {
      question: 'Que se passe-t-il lorsque le délai rpl_semi_sync_source_timeout expire sans réception d\'ACK et comment le mode semi-synchrone est-il rétabli ?',
      codeSnippet: `mysql> SET GLOBAL rpl_semi_sync_source_timeout = 10000; -- 10 secondes (10 000 ms)`,
      hint: 'La source bascule en mode asynchrone pour ne pas bloquer les écritures clientes, et repasse automatiquement en semi-synchrone dès le rattrapage.',
    },
    back: {
      answer: 'Comportement lors de l\'expiration du timeout semi-synchrone :\n\n1. **Expiration du délai (`rpl_semi_sync_source_timeout`)** :\n   - Si un réplica plante ou que le réseau coupe, la source attend pendant le délai configuré (10 secondes par défaut).\n   - Dès que le délai expire, la source **désactive temporairement le mode semi-synchrone** (`Rpl_semi_sync_source_status = OFF`).\n   - Elle valide la transaction cliente et bascule immédiatement en **mode asynchrone pur** pour que l\'application ne reste pas bloquée indéfiniment.\n2. **Rétablissement automatique (Auto-Healing)** :\n   - Dès que le réplica se reconnecte, vide son retard et acquitte avec succès une transaction suivante :\n   - La source réactive instantanément le mode semi-synchrone (`Rpl_semi_sync_source_status = ON`) sans aucune intervention humaine !',
      explanation: 'Mécanisme d\'auto-défense évitant un arrêt complet de la production lors d\'un incident réseau.',
      examTrap: 'Pendant la période où le statut est à OFF, le système fonctionne en asynchrone (perte potentielle si crash de la source).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - rpl_semi_sync_source_timeout',
    },
  },
  {
    id: 'fc-mysql908-dom05-063',
    cardNumber: 63,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Surveillance clinique de la réplication semi-synchrone',
    difficulty: 'medium',
    tags: ['Rpl_semi_sync_source_status', 'Rpl_semi_sync_source_yes_tx', 'Monitoring', 'Status Variables'],
    front: {
      question: 'Quelles variables de statut permettent de surveiller la santé de la réplication semi-synchrone et de détecter des bascules asynchrones ?',
      codeSnippet: `mysql> SHOW GLOBAL STATUS LIKE 'Rpl_semi_sync_source_%';
+--------------------------------------------+-------+
| Variable_name                              | Value |
+--------------------------------------------+-------+
| Rpl_semi_sync_source_status                | ON    |
| Rpl_semi_sync_source_yes_tx                | 45012 |
| Rpl_semi_sync_source_no_tx                 | 3     |
| Rpl_semi_sync_source_connected_replicas   | 2     |
+--------------------------------------------+-------+`,
      hint: 'Rpl_semi_sync_source_status (ON/OFF), yes_tx (transactions acquittées), no_tx (transactions tombées en timeout).',
    },
    back: {
      answer: 'Indicateurs de surveillance semi-synchrone :\n\n- **`Rpl_semi_sync_source_status`** :\n  - `ON` : Le serveur fonctionne actuellement avec les garanties semi-synchrones.\n  - `OFF` : Le serveur est actuellement dégradé en mode asynchrone (alerte critique P1 !).\n- **`Rpl_semi_sync_source_yes_tx`** :\n  - Nombre total de transactions validées avec succès après avoir reçu leur accusé de réception.\n- **`Rpl_semi_sync_source_no_tx`** :\n  - Nombre de transactions commitées en mode dégradé suite à l\'expiration du timeout (doit idéalement rester à 0).\n- **`Rpl_semi_sync_source_connected_replicas`** :\n  - Nombre actuel de réplicas connectés supportant le protocole semi-synchrone.',
      explanation: 'Tout accroissement de no_tx indique des instabilités réseau ou des réplicas saturés.',
      examTrap: 'Si Rpl_semi_sync_source_connected_replicas est à 0, le serveur basculera à OFF dès la prochaine écriture.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Monitoring Semi-Synchronous Replication',
    },
  },

  // =========================================================================
  // SECTION 5 : MYSQL GROUP REPLICATION (MGR) (Cartes 64 à 85)
  // Architecture Paxos (XCom), Prérequis, Quorum 2f+1, Single/Multi-Primary,
  // Conflits/Certification, Flow Control, États des membres, Split-Brain, Consistency
  // =========================================================================
  {
    id: 'fc-mysql908-dom05-064',
    cardNumber: 64,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Architecture fondamentale de MySQL Group Replication (MGR)',
    difficulty: 'medium',
    tags: ['Group Replication', 'MGR', 'Paxos', 'XCom', 'Shared-Nothing'],
    front: {
      question: 'Quels sont les fondements architecturaux de MySQL Group Replication et comment assure-t-il la synchronisation sans perte de données ?',
      hint: 'Moteur de consensus distribué basé sur Paxos (XCom) et architecture à mémoire partagée nulle (Shared-Nothing).',
    },
    back: {
      answer: 'Fondements de MySQL Group Replication (MGR) :\n\n- **Architecture Shared-Nothing** :\n  - Chaque nœud possède sa propre copie intégrale et indépendante des données sur son propre disque (pas de baie SAN partagée ni de SPOF matériel).\n- **Moteur de communication de groupe (XCom)** :\n  - Implémente une variante du protocole de consensus distribué **Paxos**.\n  - Garantit que tous les membres du groupe reçoivent l\'intégralité des transactions **dans un ordre global absolument identique et total** (*Total Order Multicast*).\n- **Certification distribuée** :\n  - Chaque nœud certifie localement les transactions entrantes : si deux nœuds tentent de modifier la même ligne simultanément, la première transaction ayant franchi le consensus l\'emporte (*First-Commit-Wins*), la seconde subit un rollback automatique.',
      explanation: 'Représente le niveau le plus abouti de haute disponibilité native sous MySQL.',
      examTrap: 'Group Replication n\'est pas un cluster sharding (comme NDB) : chaque serveur stocke 100% des données.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Group Replication Technology',
    },
  },
  {
    id: 'fc-mysql908-dom05-065',
    cardNumber: 65,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Prérequis techniques obligatoires pour exécuter Group Replication',
    difficulty: 'hard',
    tags: ['MGR Prerequisites', 'InnoDB', 'Primary Key', 'GTID', 'ROW Format'],
    front: {
      question: 'Quels sont les 6 prérequis techniques stricts imposés par MySQL 8.0 pour pouvoir démarrer Group Replication sur une instance ?',
      hint: 'Moteur InnoDB, clé primaire sur chaque table, GTID=ON, format ROW, binlog_checksum, et extraction de write sets.',
    },
    back: {
      answer: 'Les 6 prérequis absolus de Group Replication :\n\n1. **Moteur de stockage InnoDB exclusivement** : Les tables MyISAM ou MEMORY ne sont pas transactionnelles et sont proscrites pour les données répliquées.\n2. **Clé primaire obligatoire sur TOUTES les tables** : `sql_require_primary_key = ON`. Indispensable pour que MGR puisse identifier les lignes et détecter les conflits.\n3. **Identifiants globaux GTID activés** : `gtid_mode = ON` et `enforce_gtid_consistency = ON`.\n4. **Format binaire ROW** : `binlog_format = ROW` et `log_replica_updates = ON`.\n5. **Extraction des Write Sets** : `transaction_write_set_extraction = XXHASH64`.\n6. **Dépôt des métadonnées en table** : `master_info_repository = TABLE` et `relay_log_info_repository = TABLE`.',
      explanation: 'Si un seul de ces prérequis fait défaut, le plugin Group Replication refuse de démarrer avec une erreur fatale.',
      examTrap: 'Une table sans clé primaire ne pourra pas être modifiée dans un groupe MGR.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Group Replication Requirements',
    },
  },
  {
    id: 'fc-mysql908-dom05-066',
    cardNumber: 66,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Formule mathématique de quorum Paxos et tolérance aux pannes',
    difficulty: 'medium',
    tags: ['Paxos Quorum', 'Fault Tolerance', 'Formula', 'Cluster Size'],
    front: {
      question: 'Quelle est la formule mathématique liant le nombre de membres d\'un groupe MGR et le nombre maximal de pannes matérielles tolérées simultanément ?',
      hint: 'Formule standard Paxos : N = 2f + 1, où f est le nombre de pannes tolérées.',
    },
    back: {
      answer: 'Tolérance aux pannes et quorum Paxos :\n\n$$\\text{Nombre de membres requis } (N) = 2f + 1$$\n- Où **$f$** est le nombre de serveurs pouvant tomber en panne simultanément sans interrompre le cluster :\n  - **Pour tolérer $f = 1$ panne** : Il faut au minimum **3 membres** ($2 \\times 1 + 1$). Quorum requis pour valider = 2 votes.\n  - **Pour tolérer $f = 2$ pannes** : Il faut au minimum **5 membres** ($2 \\times 2 + 1$). Quorum requis pour valider = 3 votes.\n  - **Pour tolérer $f = 3$ pannes** : Il faut au minimum **7 membres** ($2 \\times 3 + 1$). Quorum requis = 4 votes.\n- **Taille maximale supportée** : Un groupe MGR peut comporter jusqu\'à **9 membres** maximum.',
      explanation: 'Un cluster à 2 nœuds ne peut tolérer AUCUNE panne (si 1 nœud meurt, le restant n\'a plus la majorité absolue de 2/2 et se bloque).',
      examTrap: 'Ne jamais déployer un cluster de production avec un nombre pair de membres (ex: 4 nœuds ne tolèrent qu\'une seule panne, comme 3 nœuds).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Fault Tolerance in Group Replication',
    },
  },
  {
    id: 'fc-mysql908-dom05-067',
    cardNumber: 67,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Modes opérationnels : Single-Primary vs Multi-Primary',
    difficulty: 'medium',
    tags: ['Single-Primary', 'Multi-Primary', 'Topology', 'MGR Modes'],
    front: {
      question: 'Quelles sont les différences majeures entre le mode Single-Primary et le mode Multi-Primary dans Group Replication ?',
      codeSnippet: `[mysqld]
# Mode Single-Primary (Recommandé par défaut) :
group_replication_single_primary_mode = ON
group_replication_enforce_update_everywhere_checks = OFF

# Mode Multi-Primary :
group_replication_single_primary_mode = OFF
group_replication_enforce_update_everywhere_checks = ON`,
      hint: 'En Single-Primary, un seul nœud accepte les écritures (les autres sont read-only). En Multi-Primary, tous les nœuds acceptent les écritures.',
    },
    back: {
      answer: 'Comparaison Single-Primary vs Multi-Primary :\n\n1. **Mode Single-Primary (Par défaut et fortement recommandé)** :\n   - **Un seul serveur désigné comme Primary** accepte les écritures (`read_only = OFF`).\n   - Tous les autres membres sont automatiquement basculés en lecture seule stricte (`super_read_only = ON`).\n   - En cas de panne du Primary, le groupe élit automatiquement un nouveau Primary sans aucun conflit de données.\n2. **Mode Multi-Primary** :\n   - **Tous les membres du groupe acceptent simultanément les écritures et modifications DML**.\n   - Nécessite la certification distribuée pour détecter les collisions.\n   - *Contraintes fortes* : Les verrous de tables explicites et DDL ne sont pas supportés de façon coordonnée ; risque de rollbacks applicatifs élevés sur les lignes concurrentes.',
      explanation: 'Oracle recommande Single-Primary pour la quasi-totalité des architectures d\'entreprise.',
      examTrap: 'En Multi-Primary, deux requêtes concurrentes modifiant la même ligne sur deux nœuds différents provoqueront l\'annulation (rollback) de l\'une d\'elles.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Single-Primary Versus Multi-Primary Mode',
    },
  },
  {
    id: 'fc-mysql908-dom05-068',
    cardNumber: 68,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Règles d\'élection automatique du nouveau Primary en Single-Primary',
    difficulty: 'hard',
    tags: ['Primary Election', 'member_weight', 'Failover Algorithm', 'MGR'],
    front: {
      question: 'En cas de crash du Primary en mode Single-Primary, selon quels critères hiérarchiques précis le groupe choisit-il le successeur ?',
      hint: '1. Poids configuré (member_weight), 2. Version de MySQL (patch le plus bas d\'abord), 3. Ordre lexicographique du server_uuid.',
    },
    back: {
      answer: 'Algorithme d\'élection du nouveau Primary en cas de basculement :\n\nLorsqu\'un nouveau Primary doit être élu, les membres restants appliquent l\'ordre d\'évaluation suivant :\n1. **Version MySQL la plus basse en cas de versions mixtes** :\n   - Si le groupe contient des serveurs 8.0.28 et 8.0.32 lors d\'un rolling upgrade, le serveur avec la version la plus ancienne (8.0.28) est élu prioritairement pour préserver la compatibilité binaire avec les autres nœuds.\n2. **Le poids configuré (`group_replication_member_weight`)** :\n   - Si les versions sont identiques, le serveur ayant la plus grande valeur de poids (entier de 0 à 100, 50 par défaut) est élu. Idéal pour privilégier une machine plus puissante.\n3. **L\'ordre alphabétique du `server_uuid` (Tie-Breaker)** :\n   - En cas d\'égalité de version et de poids, le serveur dont l\'UUID est le plus petit dans l\'ordre lexicographique ASCII est automatiquement choisi.',
      explanation: 'Assure un déterminisme absolu sur tous les membres sans risque de double élection.',
      examTrap: 'Une machine plus puissante peut être élue à coup sûr simplement en configurant group_replication_member_weight=100.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Group Replication Primary Election',
    },
  },
  {
    id: 'fc-mysql908-dom05-069',
    cardNumber: 69,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Certification des transactions et First-Commit-Wins en Multi-Primary',
    difficulty: 'hard',
    tags: ['Certification Process', 'First-Commit-Wins', 'Write Sets', 'Conflict Detection'],
    front: {
      question: 'Comment fonctionne le processus de certification dans Group Replication pour résoudre les conflits d\'écritures simultanées entre deux nœuds ?',
      hint: 'Comparaison des write sets avec la base de certification locale ; la première transaction ordonnée par Paxos gagne.',
    },
    back: {
      answer: 'Mécanisme de certification et règle First-Commit-Wins :\n\n1. **Extraction du Write Set** :\n   - Lorsqu\'une transaction s\'exécute localement sur le Nœud 1, le moteur extrait les empreintes des clés primaires modifiées (`Write Set`).\n2. **Soumission au Consensus Paxos** :\n   - Lors du `COMMIT`, le Nœud 1 ne valide pas immédiatement : il diffuse le Write Set au groupe via XCom.\n3. **Ordonnancement global** :\n   - Paxos attribue un numéro d\'ordre global strict à ce message.\n4. **Certification locale sur chaque nœud** :\n   - Chaque nœud compare le Write Set de la transaction avec les transactions qui ont été certifiées depuis que cette transaction a démarré.\n   - **Si aucun conflit** : La transaction passe la certification et est validée sur tous les nœuds.\n   - **Si conflit de clé détecté** : La transaction arrivée en seconde position dans l\'ordre Paxos **échoue la certification**. Le nœud local effectue un `ROLLBACK` automatique et renvoie une erreur au client applicatif.',
      explanation: 'Garantit l\'intégrité des données sans nécessiter de verrous distribués à deux phases (2PC).',
      examTrap: 'L\'application doit être conçue pour intercepter et rejouer les erreurs de rollback générées par la certification.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Transaction Certification',
    },
  },
  {
    id: 'fc-mysql908-dom05-070',
    cardNumber: 70,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Contrôle de flux (Flow Control) pour protéger les membres lents',
    difficulty: 'medium',
    tags: ['Flow Control', 'Throttling', 'MGR', 'group_replication_flow_control_mode'],
    front: {
      question: 'Quel problème résout le mécanisme de Flow Control dans Group Replication et comment fonctionne son mécanisme de throttling ?',
      hint: 'Ralentit les écritures sur les nœuds rapides si la file d\'attente de certification d\'un nœud lent dépasse un seuil critique.',
    },
    back: {
      answer: 'Rôle et mécanisme du Flow Control (`group_replication_flow_control_mode`) :\n\n- **Le problème résolu** :\n  - Si le Nœud 1 (très puissant) envoie 10 000 transactions/sec alors que le Nœud 3 (plus lent ou saturé en I/O disque) ne peut en certifier et appliquer que 2 000/sec, la file d\'attente du Nœud 3 grossit indéfiniment jusqu\'à épuisement de la mémoire RAM.\n- **L\'action de régulation (Flow Control Throttling)** :\n  - Les membres surveillent la taille de leur file de certification et de leur file d\'application.\n  - Si un membre signale que sa file dépasse les seuils configurés, **le groupe bride automatiquement la vitesse d\'écriture sur le Primary (ou tous les écrivains)** en injectant des micro-délais dans les commits clients.\n  - Les écritures sont ralenties juste assez pour permettre au membre en retard de résorber son arriéré.',
      explanation: 'Évite qu\'un membre ne soit exclu du groupe suite à un retard d\'application trop important.',
      examTrap: 'Désactiver le Flow Control peut mener au crash par Out-Of-Memory des nœuds secondaires.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Group Replication Flow Control',
    },
  },
  {
    id: 'fc-mysql908-dom05-071',
    cardNumber: 71,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Cycle de vie et états d\'un membre MGR : OFFLINE, RECOVERING, ONLINE, etc.',
    difficulty: 'medium',
    tags: ['Member States', 'ONLINE', 'RECOVERING', 'UNREACHABLE', 'ERROR'],
    front: {
      question: 'Quels sont les différents états possibles d\'un membre dans performance_schema.replication_group_members et que signifie RECOVERING ?',
      codeSnippet: `mysql> SELECT MEMBER_ID, MEMBER_STATE, MEMBER_ROLE 
       FROM performance_schema.replication_group_members;`,
      hint: 'OFFLINE -> STARTING -> RECOVERING -> ONLINE. Également UNREACHABLE et ERROR.',
    },
    back: {
      answer: 'Les 6 états d\'un membre de groupe (`MEMBER_STATE`) :\n\n1. **`OFFLINE`** : Le plugin est chargé mais le serveur ne participe à aucun groupe.\n2. **`STARTING`** : Le serveur est en train d\'initialiser sa couche réseau XCom et de joindre le groupe.\n3. **`RECOVERING`** : Le membre a rejoint le groupe, mais il est en train de rattraper son retard de données (Distributed Recovery) depuis un membre donateur (Donor). Il n\'accepte pas encore de requêtes.\n4. **`ONLINE`** : Le membre est 100% synchronisé, participe pleinement au consensus Paxos et traite les requêtes.\n5. **`UNREACHABLE`** : Le serveur ne répond plus aux heartbeats périodiques (soupçon de crash ou panne réseau).\n6. **`ERROR`** : Le membre a échoué pendant la récupération ou la certification et a quitté le groupe actif.',
      explanation: 'Un membre ne peut traiter le trafic applicatif qu\'une fois dans l\'état ONLINE.',
      examTrap: 'Tant qu\'un membre est en statut RECOVERING, il ne peut pas être élu Primary.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Group Replication Member States',
    },
  },
  {
    id: 'fc-mysql908-dom05-072',
    cardNumber: 72,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Récupération distribuée (Distributed Recovery) : Binlog vs InnoDB Clone Plugin',
    difficulty: 'hard',
    tags: ['Distributed Recovery', 'InnoDB Clone', 'Donor', 'State Transfer'],
    front: {
      question: 'Comment un nouveau nœud intégrant un groupe MGR récupère-t-il les données manquantes et quel est le rôle d\'InnoDB Clone ?',
      hint: 'Le nœud choisit un donateur (Donor) et utilise soit le clonage physique si l\'écart est grand, soit le streaming binlog si l\'écart est faible.',
    },
    back: {
      answer: 'Fonctionnement de la Récupération Distribuée (Distributed Recovery) :\n\n1. **Sélection d\'un Donateur (Donor)** :\n   - Le membre rejoignant choisit un membre `ONLINE` existant pour lui servir de donateur de données.\n2. **Choix de la méthode de transfert** :\n   - **Méthode 1 : Clonage physique (InnoDB Clone Plugin)** :\n     - Si le plugin `clone` est actif et que l\'écart de transactions est massif (ou nœud vierge) :\n     - Le donateur transfère directement les fichiers de données physiques à chaud sur le réseau.\n     - Le nouveau membre redémarre automatiquement sur les nouvelles données clonées.\n   - **Méthode 2 : Streaming binaire classique** :\n     - Si l\'écart est court et que le donateur possède tous les GTID manquants dans ses binlogs, le nœud télécharge et applique le différentiel via un canal de réplication interne (`group_replication_recovery`).\n3. Une fois l\'écart comblé, le nœud bascule en `ONLINE`.',
      explanation: 'InnoDB Clone permet d\'intégrer un nœud de 10 To en quelques dizaines de minutes sans dump logique.',
      examTrap: 'Pour que le clonage automatique fonctionne, le plugin clone doit être pré-installé sur tous les serveurs du cluster.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Group Replication Distributed Recovery',
    },
  },
  {
    id: 'fc-mysql908-dom05-073',
    cardNumber: 73,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Gestion du partitionnement réseau (Split-Brain) et déblocage de quorum minoritaire',
    difficulty: 'hard',
    tags: ['Split-Brain', 'Quorum Loss', 'group_replication_force_members', 'Disaster Recovery'],
    front: {
      question: 'Que se passe-t-il si un groupe de 5 membres subit une coupure réseau isolant 2 nœuds d\'un côté et 3 nœuds de l\'autre, et comment débloquer une minorité ?',
      codeSnippet: `mysql> SET GLOBAL group_replication_force_members = '192.168.1.11:33061,192.168.1.12:33061';`,
      hint: 'La majorité (3 nœuds) continue de fonctionner ; la minorité (2 nœuds) se bloque pour éviter le Split-Brain ; group_replication_force_members pour forcer le quorum.',
    },
    back: {
      answer: 'Gestion du partitionnement réseau et Split-Brain :\n\n- **Protection automatique contre le Split-Brain** :\n  - Sur un cluster de 5 nœuds, le quorum absolu est de 3 voix ($> 50\\%$).\n  - **Côté Majorité (3 nœuds)** : Possède 3/5 des voix. Il continue d\'élire un Primary, de certifier et de traiter les écritures normalement.\n  - **Côté Minorité (2 nœuds)** : N\'atteint pas le quorum (2 < 3). Les nœuds refusent toute transaction cliente et se mettent en attente pour empêcher la création de données divergentes concurrentes (Split-Brain).\n- **Procédure de déblocage d\'urgence (si la majorité a été détruite physiquement)** :\n  - Si un datacenter a brûlé avec les 3 nœuds majoritaires, les 2 nœuds survivants sont bloqués.\n  - L\'administrateur DBA force manuellement un nouveau quorum sur les nœuds restants via :\n    ```sql\n    SET GLOBAL group_replication_force_members = \'192.168.1.11:33061,192.168.1.12:33061\';\n    ```\n  - Le groupe se reforme instantanément à 2 nœuds avec un nouveau quorum fixé à 2.',
      explanation: 'group_replication_force_members est une commande de sauvetage d\'extrême urgence.',
      examTrap: 'Ne jamais exécuter group_replication_force_members des deux côtés d\'une partition réseau sous peine de créer un Split-Brain irréversible.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Network Partitioning in Group Replication',
    },
  },
  {
    id: 'fc-mysql908-dom05-074',
    cardNumber: 74,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Niveaux de cohérence transactionnelle de groupe : group_replication_consistency',
    difficulty: 'hard',
    tags: ['group_replication_consistency', 'EVENTUAL', 'BEFORE', 'AFTER', 'Consistency Guarantees'],
    front: {
      question: 'Quelles sont les garanties offertes par les options EVENTUAL, BEFORE, AFTER et BEFORE_AND_AFTER de group_replication_consistency ?',
      codeSnippet: `mysql> SET GLOBAL group_replication_consistency = 'AFTER';`,
      hint: 'EVENTUAL ne bloque pas les lectures/écritures ; BEFORE attend l\'application des transactions antérieures avant de lire ; AFTER attend la réplication avant d\'acquitter.',
    },
    back: {
      answer: 'Niveaux de la variable `group_replication_consistency` :\n\n1. **`EVENTUAL` (Par défaut)** :\n   - Les transactions en écriture n\'attendent pas d\'être exécutées sur les réplicas avant de terminer.\n   - Une lecture immédiate sur un nœud secondaire peut retourner des données légèrement obsolètes.\n2. **`BEFORE`** :\n   - Une transaction en lecture sur un nœud attend que toutes les transactions globales qui la précèdent dans l\'ordre de certification soient complètement appliquées avant de lire les données.\n   - Garantit une lecture 100% à jour (élimine le lag de lecture).\n3. **`AFTER`** :\n   - Une transaction en écriture sur le Primary attend d\'avoir été **appliquée sur tous les autres membres du groupe** avant de renvoyer le succès au client.\n   - Garantit que dès que le client reçoit son OK, n\'importe quelle lecture sur n\'importe quel nœud verra immédiatement sa modification.\n4. **`BEFORE_AND_AFTER`** : Combine les deux garanties (cohérence linéaire absolue, au prix d\'une latence accrue).',
      explanation: 'Permet de configurer la cohérence à chaud au niveau global ou par session pour des transactions critiques.',
      examTrap: 'AFTER ralentit les écritures en les synchronisant sur l\'application complète par tous les membres du groupe.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Group Replication Consistency Guarantees',
    },
  },
  {
    id: 'fc-mysql908-dom05-075',
    cardNumber: 75,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Action en cas d\'expulsion ou d\'échec de groupe : group_replication_exit_state_action',
    difficulty: 'medium',
    tags: ['exit_state_action', 'READ_ONLY', 'ABORT_SERVER', 'OFFLINE_MODE'],
    front: {
      question: 'Comment configurer le comportement d\'un serveur MySQL s\'il est expulsé ou s\'il perd la communication avec le groupe MGR ?',
      codeSnippet: `mysql> SET GLOBAL group_replication_exit_state_action = 'ABORT_SERVER';`,
      hint: 'READ_ONLY bascule en super_read_only ; ABORT_SERVER arrête immédiatement le processus mysqld pour éviter les lectures fantômes ; OFFLINE_MODE bloque les non-admins.',
    },
    back: {
      answer: 'Options de `group_replication_exit_state_action` :\n\n- Définit l\'action automatique d\'un nœud lorsqu\'il passe dans l\'état `ERROR` ou est expulsé du groupe :\n  1. **`READ_ONLY` (Par défaut)** :\n     - Le serveur bascule immédiatement en `super_read_only = ON`.\n     - Il refuse toute écriture, mais **laisse les connexions clientes existantes lire les données locales** (qui peuvent devenir périmées).\n  2. **`ABORT_SERVER` (Option la plus stricte pour la haute disponibilité)** :\n     - Le serveur **tue immédiatement son propre processus `mysqld` (crash intentionnel)**.\n     - Évite que des load-balancers ou des clients ne continuent d\'interroger une machine déconnectée.\n     - Si un gestionnaire système (systemd, Kubernetes) est configuré, la machine est redémarrée automatiquement.\n  3. **`OFFLINE_MODE`** :\n     - Le serveur passe en mode hors-ligne : déconnecte tous les clients actifs non-administrateurs et refuse les nouvelles connexions.',
      explanation: 'ABORT_SERVER est très populaire dans les architectures conteneurisées pour provoquer une résurrection propre du pod.',
      examTrap: 'En mode READ_ONLY, un proxy mal configuré peut continuer à envoyer du trafic de lecture vers un nœud isolé du reste du monde.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Responses to Failure in Group Replication',
    },
  },

  // =========================================================================
  // SECTION 6 : INNODB CLUSTER, ROUTER & CLUSTERSET (Cartes 76 à 100)
  // MySQL Shell AdminAPI, dba.createCluster, checkInstanceConfiguration,
  // cluster.status(), MySQL Router (bootstrap, ports 6446/6447), ClusterSet, ReplicaSet
  // =========================================================================
  {
    id: 'fc-mysql908-dom05-076',
    cardNumber: 76,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Architecture globale d\'une solution MySQL InnoDB Cluster',
    difficulty: 'easy',
    tags: ['InnoDB Cluster', 'Architecture', 'MySQL Shell', 'MySQL Router', 'Group Replication'],
    front: {
      question: 'Quels sont les 3 composants logiciels clés qui constituent la solution intégrée MySQL InnoDB Cluster d\'Oracle ?',
      hint: 'MySQL Server avec Group Replication, MySQL Shell (AdminAPI), et MySQL Router.',
    },
    back: {
      answer: 'Les 3 piliers de MySQL InnoDB Cluster :\n\n1. **MySQL Server avec Group Replication** :\n   - Les instances de base de données exécutant le moteur InnoDB et le consensus Paxos MGR pour la tolérance aux pannes et la cohérence des données.\n2. **MySQL Shell (et son API AdminAPI `dba`)** :\n   - L\'interface unifiée d\'administration et de scripting (en Python ou JavaScript).\n   - Élimine la configuration manuelle complexe : crée le cluster, configure les instances, orchestre les ajouts de nœuds et gère les bascules en une seule ligne de commande.\n3. **MySQL Router** :\n   - Le proxy de routage transparent de niveau 4 placé entre les applications clientes et le cluster.\n   - Détecte automatiquement l\'état du cluster et redirige le trafic d\'écriture vers le Primary et de lecture vers les Secondaries.',
      explanation: 'Fournit une solution de haute disponibilité clé en main officielle sans outil tiers.',
      examTrap: 'InnoDB Cluster n\'est pas un logiciel séparé : c\'est l\'orchestration conjointe de ces 3 composants officiels.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL InnoDB Cluster Overview',
    },
  },
  {
    id: 'fc-mysql908-dom05-077',
    cardNumber: 77,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Audit et préparation d\'une instance avec MySQL Shell : dba.checkInstanceConfiguration',
    difficulty: 'medium',
    tags: ['MySQL Shell', 'dba.checkInstanceConfiguration', 'dba.configureInstance', 'Prerequisites'],
    front: {
      question: 'Comment vérifier et corriger automatiquement la configuration d\'une instance MySQL avant de l\'intégrer dans un InnoDB Cluster avec MySQL Shell ?',
      codeSnippet: `// Dans MySQL Shell en mode JavaScript :
dba.checkInstanceConfiguration('clusteradmin@node2:3306');
dba.configureInstance('clusteradmin@node2:3306');`,
      hint: 'dba.checkInstanceConfiguration teste tous les prérequis (GTID, ROW, etc.) et dba.configureInstance applique les modifications requises.',
    },
    back: {
      answer: 'Validation et configuration d\'instance via MySQL Shell :\n\n1. **`dba.checkInstanceConfiguration(instance)`** :\n   - Se connecte à l\'instance cible et inspecte plus de 20 paramètres critiques (`gtid_mode`, `enforce_gtid_consistency`, `binlog_format`, `master_info_repository`, etc.).\n   - Renvoie un rapport JSON détaillé indiquant les paramètres conformes et ceux devant être corrigés (`status: ok` ou `error`).\n2. **`dba.configureInstance(instance)`** :\n   - Corrige automatiquement toutes les anomalies détectées !\n   - Crée le compte administrateur local, active `SET PERSIST` pour inscrire les réglages dans le fichier `mysqld-auto.cnf`, et redémarre l\'instance si nécessaire avec l\'accord du DBA.',
      explanation: 'Évite les erreurs humaines de configuration manuelle dans my.cnf.',
      examTrap: 'Si une instance a des paramètres non persistés, elle risque de rompre le cluster au prochain redémarrage.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Configuring Instances for InnoDB Cluster',
    },
  },
  {
    id: 'fc-mysql908-dom05-078',
    cardNumber: 78,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Création initiale du Cluster sous MySQL Shell : dba.createCluster',
    difficulty: 'medium',
    tags: ['dba.createCluster', 'MySQL Shell', 'AdminAPI', 'Bootstrap'],
    front: {
      question: 'Quelle commande MySQL Shell initialise un nouveau cluster InnoDB et quelles structures de métadonnées sont créées lors de cette étape ?',
      codeSnippet: `// Connecté sur le premier nœud (node1) :
var cluster = dba.createCluster('productionCluster');`,
      hint: 'dba.createCluster crée le schéma interne mysql_innodb_cluster_metadata et démarre Group Replication.',
    },
    back: {
      answer: 'Initialisation du cluster via `dba.createCluster()` :\n\n- **Action exécutée** :\n  1. Démarre Group Replication sur le nœud connecté, qui devient automatiquement le **Primary initial** du groupe.\n  2. Crée le schéma de métadonnées interne **`mysql_innodb_cluster_metadata`**.\n  3. Enregistre dans ces tables la topologie, le nom du cluster, la liste des instances et les identifiants de consensus.\n  4. Retourne un objet JavaScript/Python `Cluster` manipulable en mémoire dans le shell.\n- **Options disponibles** :\n  - `dba.createCluster(\'nom\', {multiPrimary: true})` : Pour créer un cluster Multi-Primary.\n  - `dba.createCluster(\'nom\', {ipAllowlist: \'192.168.1.0/24\'})` : Pour restreindre les communications XCom.',
      explanation: 'Le schéma de métadonnées est lu en temps réel par MySQL Router pour adapter son routage.',
      examTrap: 'Ne supprimez jamais manuellement les tables du schéma mysql_innodb_cluster_metadata.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Creating an InnoDB Cluster',
    },
  },
  {
    id: 'fc-mysql908-dom05-079',
    cardNumber: 79,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Ajout d\'un nœud dans le cluster : cluster.addInstance',
    difficulty: 'medium',
    tags: ['cluster.addInstance', 'recoveryMethod', 'Clone', 'Incremental'],
    front: {
      question: 'Comment ajouter une deuxième instance à un cluster existant avec MySQL Shell et quelles options de synchronisation initiale (recoveryMethod) sont proposées ?',
      codeSnippet: `cluster.addInstance('clusteradmin@node2:3306', {
  recoveryMethod: 'auto' // ou 'clone' ou 'incremental'
});`,
      hint: 'recoveryMethod: auto choisit le clonage si la base est vide ou si l\'écart de GTID est trop grand, sinon la réplication incrémentale.',
    },
    back: {
      answer: 'Ajout d\'une instance via `cluster.addInstance()` :\n\n- **Mécanisme** :\n  - Vérifie les prérequis du nœud cible, initialise le plugin Group Replication et le rattache au groupe.\n- **Les 3 options de `recoveryMethod`** :\n  1. **`\'clone\'`** : Utilise le plugin InnoDB Clone. Efface les données locales du nouveau nœud et copie l\'intégralité physique des données depuis un membre actif du cluster, puis redémarre automatiquement.\n  2. **`\'incremental\'`** : Utilise la réplication par les binlogs (Distributed Recovery). Applicable uniquement si le nouveau nœud possède déjà un historique proche et que le cluster dispose de tous les binlogs manquants.\n  3. **`\'auto\'` (Par défaut)** : MySQL Shell analyse l\'état de la cible. Si elle est vide ou a un retard irréversible, il choisit `clone` ; si l\'écart est modéré, il choisit `incremental`.',
      explanation: 'Rend l\'extension d\'un cluster trivialement automatisable.',
      examTrap: 'L\'option clone détruit toutes les données préexistantes sur l\'instance cible : Shell demande une confirmation explicite.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Adding Instances to an InnoDB Cluster',
    },
  },
  {
    id: 'fc-mysql908-dom05-080',
    cardNumber: 80,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Supervision complète du cluster via cluster.status()',
    difficulty: 'medium',
    tags: ['cluster.status', 'Monitoring', 'JSON Output', 'Health Check'],
    front: {
      question: 'Quelles sont les sections fondamentales retournées par la commande cluster.status() dans MySQL Shell pour évaluer la santé du cluster ?',
      codeSnippet: `cluster.status();
// Retourne un document JSON complet`,
      hint: 'clusterName, topology (avec rôle PRIMARY/SECONDARY, statut ONLINE, mode de réplication), et clusterErrors.',
    },
    back: {
      answer: 'Analyse de la sortie de `cluster.status()` :\n\n- **`clusterName`** : Nom identifiant du cluster.\n- **`status` global** :\n  - `OK` : Tous les membres sont `ONLINE` et le quorum est parfait.\n  - `OK_NO_TOLERANCE` : Le cluster fonctionne mais ne peut plus tolérer aucune panne supplémentaire (ex: 2 membres en vie sur 3).\n  - `NO_QUORUM` : Le cluster a perdu sa majorité et les écritures sont bloquées.\n- **`topology`** : Dictionnaire de chaque instance listant :\n  - `address` : Nom d\'hôte et port.\n  - `mode` : `R/W` (Read-Write pour le Primary) ou `R/O` (Read-Only pour les Secondaries).\n  - `role` : `HA` (Primary ou Secondary).\n  - `status` : `ONLINE`, `RECOVERING`, `UNREACHABLE`.\n  - `applierWorkerThreads` : Nombre de workers parallèles MTS actifs.',
      explanation: 'C\'est l\'outil de diagnostic par excellence de l\'administrateur MySQL.',
      examTrap: 'Si le statut indique OK_NO_TOLERANCE, toute nouvelle panne entraînera la perte de quorum et l\'arrêt des écritures.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Monitoring an InnoDB Cluster',
    },
  },
  {
    id: 'fc-mysql908-dom05-081',
    cardNumber: 81,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Gestion manuelle du Primary sous MySQL Shell : cluster.setPrimaryInstance',
    difficulty: 'medium',
    tags: ['setPrimaryInstance', 'Switchover', 'Controlled Failover', 'AdminAPI'],
    front: {
      question: 'Comment réaliser un basculement manuel et maîtrisé (Switchover) vers un autre nœud pour une opération de maintenance avec MySQL Shell ?',
      codeSnippet: `// Connecté au cluster :
cluster.setPrimaryInstance('node3:3306');`,
      hint: 'cluster.setPrimaryInstance("instance_address") promeut le nœud cible en Primary et rétrograde l\'ancien Primary en Secondary.',
    },
    back: {
      answer: 'Bascule manuelle via `cluster.setPrimaryInstance()` :\n\n- **Usage** :\n  - Utilisé lors des opérations de maintenance programmée (mise à jour de noyau Linux, ajout de RAM, patching MySQL).\n- **Séquence exécutée sous le capot** :\n  1. L\'ancien Primary termine ses transactions en cours et bascule en `super_read_only = ON` (devient un Secondary).\n  2. Le nœud cible (`node3:3306`) applique le reliquat éventuel de son Relay Log.\n  3. Le nœud cible bascule en `read_only = OFF` et devient le nouveau **Primary** officiel.\n  4. Les métadonnées du cluster sont mises à jour.\n  5. MySQL Router détecte instantanément la modification de rôle et redirige les flux d\'écriture vers `node3` sans interruption pour l\'application.',
      explanation: 'Permet une maintenance sans interruption de service mesurable (zéro downtime maintenance).',
      examTrap: 'Ne tentez jamais de forcer un switchover en modifiant read_only manuellement par SQL : passez impérativement par AdminAPI.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Changing the Primary Instance',
    },
  },
  {
    id: 'fc-mysql908-dom05-082',
    cardNumber: 82,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Retrait propre d\'une instance et dissolution de cluster : removeInstance et dissolve',
    difficulty: 'medium',
    tags: ['removeInstance', 'dissolve', 'Decommissioning', 'AdminAPI'],
    front: {
      question: 'Comment retirer proprement une instance d\'un cluster InnoDB et comment dissoudre complètement le cluster si nécessaire ?',
      codeSnippet: `cluster.removeInstance('node3:3306');
// Pour détruire le cluster :
cluster.dissolve({force: false});`,
      hint: 'cluster.removeInstance met à jour le quorum et les métadonnées ; cluster.dissolve arrête MGR et supprime les métadonnées.',
    },
    back: {
      answer: 'Décommissionnement et dissolution dans MySQL Shell :\n\n1. **`cluster.removeInstance(\'node:port\')`** :\n   - Arrête Group Replication sur le nœud cible.\n   - Supprime ses références dans le schéma `mysql_innodb_cluster_metadata`.\n   - **Recalcule immédiatement le quorum** du cluster sur le nombre réduit de membres (crucial pour que le cluster ne cherche plus à attendre les votes de ce nœud).\n2. **`cluster.dissolve()`** :\n   - Désactive Group Replication sur tous les membres du cluster.\n   - Supprime le schéma de métadonnées `mysql_innodb_cluster_metadata`.\n   - Les serveurs redeviennent des instances MySQL autonomes indépendantes avec leurs données conservées intactes.',
      explanation: 'Toujours retirer formellement une machine avant de l\'éteindre définitivement pour préserver le calcul de quorum.',
      examTrap: 'Éteindre une machine sans faire removeInstance abaisse la tolérance aux pannes du cluster.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Removing Instances from an InnoDB Cluster',
    },
  },
  {
    id: 'fc-mysql908-dom05-083',
    cardNumber: 83,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Rôle architectural de MySQL Router dans InnoDB Cluster',
    difficulty: 'easy',
    tags: ['MySQL Router', 'Proxy', 'L4 Proxy', 'High Availability', 'Architecture'],
    front: {
      question: 'Quel est le rôle exact de MySQL Router et pourquoi est-il qualifié de mandataire léger de niveau 4 (L4) ?',
      hint: 'Routage transparent des connexions TCP applicatives vers le Primary (écriture) ou les Secondaries (lecture) avec basculement automatique.',
    },
    back: {
      answer: 'Rôle et conception de MySQL Router :\n\n- **Mandataire léger de niveau 4 (Transport Layer Proxy)** :\n  - N\'analyse pas le contenu SQL complet des requêtes (contrairement à un proxy de niveau 7) : il route directement les flux TCP/IP avec une latence quasi nulle (< 1 ms).\n- **Fonctionnalités clés** :\n  1. **Séparation Écriture / Lecture** : Expose des ports dédiés (un port RW et un port RO).\n  2. **Découverte dynamique de la topologie** : Interroge régulièrement le schéma de métadonnées du cluster. S\'il y a une bascule de Primary, MySQL Router réoriente le trafic d\'écriture en quelques millisecondes.\n  3. **Répartition de charge (Load Balancing)** : Distribue les requêtes de lecture en Round-Robin entre tous les nœuds Secondaries disponibles.',
      explanation: 'Généralement installé directement sur les serveurs applicatifs (Web/API) pour éviter tout goulot d\'étranglement réseau centralisé.',
      examTrap: 'MySQL Router ne fait pas de découpage automatique requête par requête d\'une même connexion : l\'application doit se connecter sur le port RW ou le port RO.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Router Overview',
    },
  },
  {
    id: 'fc-mysql908-dom05-084',
    cardNumber: 84,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Amorçage et configuration automatique de MySQL Router : --bootstrap',
    difficulty: 'medium',
    tags: ['--bootstrap', 'mysqlrouter', 'Configuration', 'Metadata Cache'],
    front: {
      question: 'Quelle commande système amorce (bootstrap) MySQL Router pour le connecter à un InnoDB Cluster existant ?',
      codeSnippet: `$ mysqlrouter --bootstrap clusteradmin@node1:3306 \\
  --user=mysqlrouter \\
  --conf-base-dir=/etc/mysqlrouter \\
  --directory=/opt/myrouter`,
      hint: 'mysqlrouter --bootstrap suivi de la chaîne de connexion d\'un membre actif du cluster.',
    },
    back: {
      answer: 'Amorçage automatique via `mysqlrouter --bootstrap` :\n\n- **Opérations exécutées lors du bootstrap** :\n  1. Se connecte au nœud spécifié (`node1:3306`) et lit les tables de métadonnées du cluster.\n  2. Récupère la liste de tous les membres et de leurs adresses.\n  3. Crée automatiquement un compte de service interne MySQL pour que Router puisse surveiller la topologie.\n  4. Génère le fichier de configuration de production `mysqlrouter.conf` avec les sections de routage et de cache de métadonnées.\n- Après cette étape, il suffit de démarrer le service : `systemctl start mysqlrouter`.\n- Si `node1` tombe plus tard, Router utilisera sa liste des autres nœuds mémorisée pour continuer à se synchroniser.',
      explanation: 'Permet de configurer un proxy hautement disponible en moins de 10 secondes.',
      examTrap: 'Le compte utilisé pour le bootstrap doit posséder des droits administratifs sur le cluster pour créer les comptes de surveillance.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Bootstrapping MySQL Router',
    },
  },
  {
    id: 'fc-mysql908-dom05-085',
    cardNumber: 85,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Ports réseau par défaut de MySQL Router (Standard et X-Protocol)',
    difficulty: 'easy',
    tags: ['Ports', '6446', '6447', 'X-Protocol', 'Routing'],
    front: {
      question: 'Quels sont les 4 ports TCP d\'écoute par défaut configurés par MySQL Router et à quels usages correspondent-ils ?',
      hint: '6446 (Read-Write classique), 6447 (Read-Only classique), 64460 (RW X-Protocol), 64470 (RO X-Protocol).',
    },
    back: {
      answer: 'Les 4 ports par défaut de MySQL Router :\n\n- **Protocole MySQL Classique (Port 3306 standard)** :\n  1. **`6446` (Read/Write)** :\n     - Route toutes les connexions entrantes exclusivement vers le serveur **PRIMARY** actuel du cluster (écritures et lectures critiques).\n  2. **`6447` (Read/Only)** :\n     - Distribue les connexions clientes en lecture seule sur l\'ensemble des nœuds **SECONDARY** (avec bascule sur le Primary si tous les Secondaries sont hors service).\n- **Protocole MySQL X-Protocol (Port 33060 / Document Store / NoSQL)** :\n  3. **`64460` (Read/Write X-Protocol)** : Vers le Primary en X-Protocol.\n  4. **`64470` (Read/Only X-Protocol)** : Vers les Secondaries en X-Protocol.',
      explanation: 'L\'application configure simplement deux pools de connexions : port 6446 pour l\'écriture, port 6447 pour la lecture.',
      examTrap: 'Les applications ne doivent plus se connecter sur le port 3306 direct des serveurs MySQL mais sur 6446/6447 du Router.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Router Default Ports',
    },
  },
  {
    id: 'fc-mysql908-dom05-086',
    cardNumber: 86,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Bascule transparente et gestion des connexions coupées lors d\'un Failover',
    difficulty: 'hard',
    tags: ['Failover', 'Connection Handling', 'Transparent Reroute', 'MySQL Router'],
    front: {
      question: 'Comment MySQL Router gère-t-il les connexions clientes actives lorsqu\'un Primary crashe et qu\'un nouveau Primary est élu ?',
      hint: 'Router détecte la mort de l\'ancien Primary, ferme les sockets clientes orphelines pour forcer la reconnexion, et route les nouvelles connexions vers le nouveau Primary.',
    },
    back: {
      answer: 'Comportement de MySQL Router lors d\'un basculement de Primary :\n\n1. **Détection du crash** :\n   - Le thread de surveillance (`Metadata Cache`) de MySQL Router détecte la mort du Primary ou reçoit la mise à jour des métadonnées indiquant le nouveau Primary.\n2. **Nettoyage des connexions mortes** :\n   - Router ferme immédiatement les sockets TCP des clients qui étaient connectés à l\'ancien Primary tombé.\n   - L\'application cliente reçoit une déconnexion (`Connection reset by peer` / `MySQL server has gone away`).\n3. **Routage des nouvelles requêtes** :\n   - Dès que le pool applicatif se reconnecte sur le port 6446, MySQL Router le connecte instantanément au **nouveau Primary élu**.\n   - Le temps de bascule total est généralement inférieur à 1 à 3 secondes.',
      explanation: 'Nécessite que l\'application implémente une logique classique de reconnexion automatique en cas de rupture de socket.',
      examTrap: 'MySQL Router ne peut pas rejouer magiquement en mémoire une transaction non commitée qui a été coupée en plein vol.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Router Failover Handling',
    },
  },
  {
    id: 'fc-mysql908-dom05-087',
    cardNumber: 87,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Disaster Recovery multi-régions : MySQL InnoDB ClusterSet',
    difficulty: 'hard',
    tags: ['ClusterSet', 'Disaster Recovery', 'Multi-Region', 'Asynchronous Replication', 'HA/DR'],
    front: {
      question: 'Qu\'est-ce que MySQL InnoDB ClusterSet et comment combine-t-il Group Replication et la réplication asynchrone pour le PRA/DRP ?',
      hint: 'Liaison asynchrone entre un cluster Primary local et un ou plusieurs clusters Replica distants dans d\'autres datacenters ou régions cloud.',
    },
    back: {
      answer: 'Architecture de MySQL InnoDB ClusterSet :\n\n- **Le problème de Group Replication sur longue distance (WAN)** :\n  - MGR utilise Paxos : si les nœuds sont séparés par un océan (latence de 100 ms), chaque transaction subit un ralentissement rédhibitoire.\n- **La solution InnoDB ClusterSet** :\n  - **Cluster Primaire (Primary Cluster)** : Un InnoDB Cluster MGR complet (3 nœuds) situé dans la Région A (ex: Paris) garantissant une haute disponibilité locale à faible latence.\n  - **Clusters Répliques (Replica Clusters)** : Un ou plusieurs InnoDB Clusters MGR complets situés dans des régions distantes (ex: New York, Tokyo).\n  - **Lien asynchrone inter-régions** : Le Primary de Paris réplique de manière asynchrone vers le Primary de New York.\n  - En cas de perte totale de la région Paris, l\'administrateur peut promouvoir le cluster de New York en nouveau cluster principal en une seule commande Shell.',
      explanation: 'Offre le summum de l\'architecture résiliente : HA locale synchrone + DR géographique asynchrone.',
      examTrap: 'Le basculement d\'un ClusterSet vers une région secondaire n\'est pas automatique par défaut pour éviter un Split-Brain intercontinental.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL InnoDB ClusterSet',
    },
  },
  {
    id: 'fc-mysql908-dom05-088',
    cardNumber: 88,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Commandes de gestion d\'un ClusterSet sous MySQL Shell',
    difficulty: 'hard',
    tags: ['createClusterSet', 'ClusterSet AdminAPI', 'status', 'Switchover'],
    front: {
      question: 'Quelles sont les commandes MySQL Shell pour créer un ClusterSet, lui ajouter un cluster réplique et basculer le trafic ?',
      codeSnippet: `// Création du ClusterSet depuis le cluster principal :
var clusterSet = cluster.createClusterSet('globalClusterSet');

// Ajout d'un cluster réplique distant :
clusterSet.createReplicaCluster('node_ny1:3306', 'nyCluster');

// Basculement contrôlé (Switchover) :
clusterSet.setPrimaryCluster('nyCluster');`,
      hint: 'cluster.createClusterSet, clusterSet.createReplicaCluster, et clusterSet.setPrimaryCluster.',
    },
    back: {
      answer: 'Administration d\'un ClusterSet avec AdminAPI :\n\n1. **`cluster.createClusterSet(\'nom\')`** :\n   - Transforme le cluster local en **Primary Cluster** d\'un ensemble global et initialise le canal de réplication ClusterSet.\n2. **`clusterSet.createReplicaCluster(instance, \'nomCluster\')`** :\n   - Déploie et configure un nouveau cluster MGR dans la région distante et le relie automatiquement par réplication GTID au cluster principal.\n3. **`clusterSet.status()`** :\n   - Affiche la santé globale des deux clusters et le retard de réplication inter-régions.\n4. **`clusterSet.setPrimaryCluster(\'nyCluster\')`** :\n   - Effectue un basculement maîtrisé (Switchover) : inverse le sens de la réplication asynchrone sans aucune perte de données.',
      explanation: 'Toutes les configurations de canaux et de GTID sous-jacentes sont gérées automatiquement par MySQL Shell.',
      examTrap: 'En cas de sinistre total (datacenter détruit), on utilise clusterSet.forcePrimaryCluster() pour forcer la promotion.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Managing an InnoDB ClusterSet',
    },
  },
  {
    id: 'fc-mysql908-dom05-089',
    cardNumber: 89,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Alternative allégée : MySQL InnoDB ReplicaSet',
    difficulty: 'medium',
    tags: ['InnoDB ReplicaSet', 'dba.createReplicaSet', 'Lightweight HA', 'No Paxos'],
    front: {
      question: 'Qu\'est-ce que MySQL InnoDB ReplicaSet, en quoi diffère-t-il d\'InnoDB Cluster et quand est-il recommandé ?',
      hint: 'Utilise la réplication asynchrone traditionnelle sans Group Replication ni Paxos, tout en conservant l\'administration par Shell et le routage par Router.',
    },
    back: {
      answer: 'Présentation de MySQL InnoDB ReplicaSet :\n\n- **Définition** :\n  - Solution managée combinant **MySQL Server**, **MySQL Shell** (`dba.createReplicaSet`) et **MySQL Router**, mais basée sur la **réplication asynchrone standard (ou semi-synchrone)** plutôt que sur Group Replication.\n- **Pourquoi cette alternative existe-t-elle ?** :\n  1. Group Replication impose des contraintes strictes (InnoDB pur, clés primaires partout, communication réseau multicast/XCom parfois bloquée par certains hébergeurs cloud).\n  2. Pour des environnements légers ou des serveurs à faibles ressources (ex: 2 petites machines) ne pouvant pas maintenir un quorum de 3 nœuds Paxos.\n- **Limitation majeure par rapport à InnoDB Cluster** :\n  - Le basculement en cas de panne (Failover) n\'est **PAS automatique** par défaut : il nécessite une intervention via MySQL Shell (`replicaSet.forcePrimaryInstance()`).',
      explanation: 'Idéal pour moderniser une infrastructure de réplication classique sans la complexité d\'un consensus distribué.',
      examTrap: 'ReplicaSet n\'offre pas de basculement automatique sans perte (zéro failover autonome).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL InnoDB ReplicaSet',
    },
  },
  {
    id: 'fc-mysql908-dom05-090',
    cardNumber: 90,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Sécurisation des communications XCom dans Group Replication',
    difficulty: 'medium',
    tags: ['group_replication_ip_allowlist', 'Security', 'XCom', 'SSL/TLS'],
    front: {
      question: 'Comment restreindre et chiffrer les communications internes de consensus XCom entre les membres d\'un cluster MGR ?',
      codeSnippet: `[mysqld]
group_replication_ip_allowlist = '10.0.0.1,10.0.0.2,10.0.0.3,192.168.1.0/24'
group_replication_ssl_mode = REQUIRED`,
      hint: 'group_replication_ip_allowlist pour le filtrage IP et group_replication_ssl_mode pour le chiffrement TLS du trafic inter-nœuds.',
    },
    back: {
      answer: 'Sécurisation de la couche réseau MGR / XCom :\n\n1. **Filtrage par liste blanche (`group_replication_ip_allowlist`)** :\n   - Définit la liste exacte des adresses IP ou sous-réseaux CIDR autorisés à dialoguer sur le port XCom (port 33061 par défaut).\n   - Toute tentative de connexion provenant d\'une IP non listée est rejetée immédiatement avant même l\'authentification.\n2. **Chiffrement du protocole de consensus (`group_replication_ssl_mode`)** :\n   - `REQUIRED` : Exige que tous les échanges de consensus Paxos et de transfert de transactions soient chiffrés via TLS.\n   - `VERIFY_CA` / `VERIFY_IDENTITY` : Vérifie l\'authenticité des certificats numériques des pairs.\n- Indispensable pour empêcher l\'insertion d\'un nœud pirate capable de manipuler le quorum.',
      explanation: 'Protège l\'infrastructure contre les attaques d\'injection ou d\'écoute réseau.',
      examTrap: 'Par défaut, group_replication_ip_allowlist n\'autorise que les adresses privées et localhost.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Group Replication Security and IP Allowlist',
    },
  },
  {
    id: 'fc-mysql908-dom05-091',
    cardNumber: 91,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Port de communication de groupe XCom : calcul et rôle',
    difficulty: 'easy',
    tags: ['XCom Port', '33061', 'Networking', 'Firewall'],
    front: {
      question: 'Quel est le port réseau par défaut utilisé par le protocole de communication de groupe XCom et comment est-il calculé ?',
      codeSnippet: `[mysqld]
group_replication_local_address = '10.0.0.1:33061'`,
      hint: 'Conventionnellement, port d\'écoute MySQL (3306) multiplié par 10 + 1 = 33061.',
    },
    back: {
      answer: 'Le port de consensus XCom (`group_replication_local_address`) :\n\n- **Rôle** :\n  - C\'est le port TCP dédié exclusivement aux échanges internes du protocole Paxos entre les instances du cluster (votes de consensus, messages de heartbeats, diffusion des write sets).\n  - Les clients applicatifs ne doivent JAMAIS se connecter sur ce port.\n- **Valeur conventionnelle** :\n  - Par défaut : **`33061`** (si MySQL écoute sur 3306).\n  - Si l\'instance écoute sur le port 3307, l\'adresse locale XCom sera configurée sur 33071.\n- **Configuration Firewall / Réseau** :\n  - Ce port doit impérativement être ouvert en communication bidirectionnelle entre tous les membres du groupe, mais hermétiquement fermé vers l\'extérieur.',
      explanation: 'Une mauvaise ouverture du port 33061 est la première cause d\'échec de démarrage de MGR.',
      examTrap: 'Ne pas confondre le port XCom (33061) avec le port X-Protocol de MySQL (33060).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - group_replication_local_address',
    },
  },
  {
    id: 'fc-mysql908-dom05-092',
    cardNumber: 92,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Vérification de l\'état de santé de MySQL Router : API REST et sockets',
    difficulty: 'medium',
    tags: ['MySQL Router REST API', 'Health Check', 'Monitoring', 'HTTP API'],
    front: {
      question: 'Comment monitorer l\'état interne de MySQL Router et obtenir des métriques via son API HTTP intégrée ?',
      codeSnippet: `[http_server]
port = 8443
ssl = 1

[routing:bootstrap_rw]
bind_port = 6446
...`,
      hint: 'Composant http_server intégré de MySQL Router exposant des points d\'accès REST JSON sur les routes /api/v2/routes.',
    },
    back: {
      answer: 'Supervision de MySQL Router via l\'API HTTP / REST :\n\n- **Activation** :\n  - MySQL Router intègre un mini serveur HTTP (`http_server`) et un composant de métadonnées REST (`rest_api`).\n- **Endpoints de surveillance** :\n  - `GET /api/v2/routes` : Liste les routes configurées (RW, RO) et leur état.\n  - `GET /api/v2/routes/{name}/health` : Retourne un statut de santé immédiat pour les sondes Kubernetes (Liveness/Readiness probe).\n  - `GET /api/v2/routes/{name}/destinations` : Liste les serveurs cibles MySQL avec le nombre de connexions actives, le statut UP/DOWN, et la latence constatée.\n- Permet d\'intégrer MySQL Router directement dans les dashboards Grafana ou les équilibreurs de charge F5/HAProxy.',
      explanation: 'Essentiel pour l\'orchestration dans les architectures modernes de conteneurs.',
      examTrap: 'Par défaut, le composant HTTP n\'est pas activé si l\'option n\'a pas été demandée lors du bootstrap.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Router REST API',
    },
  },
  {
    id: 'fc-mysql908-dom05-093',
    cardNumber: 93,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Gestion des transactions distribuées (XA) sous Group Replication',
    difficulty: 'hard',
    tags: ['XA Transactions', 'Two-Phase Commit', 'Limitations', 'MGR'],
    front: {
      question: 'Quel est le support et quelles sont les restrictions des transactions XA (distribuées) dans MySQL Group Replication ?',
      hint: 'Supportées à partir de MySQL 8.0.19 sous certaines conditions, mais incompatibles avec le mode Multi-Primary.',
    },
    back: {
      answer: 'Support des transactions XA dans Group Replication :\n\n- **Évolution historique** :\n  - Antérieurement à MySQL 8.0.19, les transactions XA (`XA START`, `XA PREPARE`, `XA COMMIT`) étaient strictement incompatibles avec Group Replication.\n- **Support moderne (MySQL 8.0.19+)** :\n  - Les transactions XA sont **pleinement supportées en mode Single-Primary**.\n  - La phase `XA PREPARE` est synchronisée entre les membres via le consensus Paxos.\n- **Restriction absolue** :\n  - Les transactions XA restent **formellement interdites en mode Multi-Primary** (`group_replication_single_primary_mode = OFF`) car le protocole Paxos 1-phase de MGR ne peut pas s\'entrelacer avec la préparation 2-phases d\'un coordinateur externe sans risque de blocage insoluble.',
      explanation: 'Garantit la compatibilité avec les serveurs d\'applications Java EE / Spring sous Single-Primary.',
      examTrap: 'En mode Multi-Primary, l\'exécution d\'un XA START génère immédiatement une erreur SQL.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Support for XA Transactions in Group Replication',
    },
  },
  {
    id: 'fc-mysql908-dom05-094',
    cardNumber: 94,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Comportement des tables temporaires dans Group Replication',
    difficulty: 'medium',
    tags: ['Temporary Tables', 'CREATE TEMPORARY TABLE', 'Replication Rules', 'MGR'],
    front: {
      question: 'Comment les tables temporaires (CREATE TEMPORARY TABLE) sont-elles gérées dans un cluster Group Replication ?',
      hint: 'Elles ne sont jamais répliquées aux autres nœuds et leur utilisation au sein de transactions sous GTID est restreinte.',
    },
    back: {
      answer: 'Gestion des tables temporaires sous Group Replication :\n\n1. **Non-réplication** :\n   - Les tables créées via `CREATE TEMPORARY TABLE` sont purement locales à la session cliente connectée sur le serveur.\n   - Elles ne sont **JAMAIS répliquées aux autres membres du groupe** (aucun événement n\'est transmis par XCom).\n2. **Conséquence lors d\'un basculement de Primary** :\n   - Si le Primary crashe ou que la session bascule sur un autre serveur, la table temporaire **disparaît instantanément** pour l\'application !\n3. **Restriction GTID** :\n   - Sous `enforce_gtid_consistency = ON`, il est interdit d\'exécuter `CREATE TEMPORARY TABLE` ou `DROP TEMPORARY TABLE` au sein d\'une transaction explicite (`BEGIN ... COMMIT`).',
      explanation: 'En haute disponibilité, préférez l\'utilisation de tables de travail régulières non temporaires ou des CTE.',
      examTrap: 'Ne vous reposez jamais sur des tables temporaires pour stocker des états multi-requêtes dans une architecture clusterisée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Group Replication Limitations: Temporary Tables',
    },
  },
  {
    id: 'fc-mysql908-dom05-095',
    cardNumber: 95,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Rolling Upgrade (Mise à niveau progressive) d\'un InnoDB Cluster sans coupure',
    difficulty: 'hard',
    tags: ['Rolling Upgrade', 'Zero Downtime', 'Version Compatibility', 'Maintenance'],
    front: {
      question: 'Quelle est la procédure pas-à-pas officielle pour mettre à niveau un cluster 3 nœuds (ex: de 8.0.28 à 8.0.32) sans interruption de service ?',
      hint: 'Mettre à niveau les Secondaries un par un, puis basculer le Primary sur un nœud mis à niveau, et enfin mettre à niveau l\'ancien Primary.',
    },
    back: {
      answer: 'Procédure de Rolling Upgrade sans arrêt d\'un InnoDB Cluster :\n\n1. **Règle de compatibilité ascendante de MGR** :\n   - Un groupe MGR peut fonctionner avec des membres de versions mineures différentes lors d\'une transition.\n   - Un nœud en version supérieure peut répliquer depuis une version inférieure, mais l\'inverse est proscrit pour le Primary.\n2. **Séquence opérationnelle** :\n   - **Étape 1** : Mettre à niveau le Secondary 1 (retrait propre du trafic, stop MySQL, upgrade des binaires vers 8.0.32, restart, vérification du statut `ONLINE`).\n   - **Étape 2** : Mettre à niveau le Secondary 2 selon le même protocole.\n   - **Étape 3** : Transférer proprement le rôle de Primary vers l\'un des nœuds mis à niveau : `cluster.setPrimaryInstance(\'secondary1:3306\')`.\n   - **Étape 4** : Mettre à niveau l\'ancien Primary (qui est désormais un simple Secondary).\n3. À la fin, les 3 nœuds tournent en 8.0.32 sans que les applications n\'aient subi la moindre indisponibilité.',
      explanation: 'Méthode d\'ingénierie standard pour maintenir les clusters à jour en production 24/7.',
      examTrap: 'Ne mettez jamais à niveau le Primary en premier sans l\'avoir préalablement rétrogradé en Secondary.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Upgrading Group Replication',
    },
  },
  {
    id: 'fc-mysql908-dom05-096',
    cardNumber: 96,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Optimisation de la mémoire XCom : group_replication_message_cache_size',
    difficulty: 'hard',
    tags: ['XCom Cache', 'group_replication_message_cache_size', 'Memory Management', 'Tuning'],
    front: {
      question: 'À quoi sert group_replication_message_cache_size et comment évite-t-il les saturations de RAM sur des clusters à fort trafic ?',
      codeSnippet: `[mysqld]
group_replication_message_cache_size = 2147483648 # 2 Go (1 Go par défaut)`,
      hint: 'Limite la mémoire allouée au cache de messages XCom pour conserver les transactions nécessaires aux membres qui se reconnectent.',
    },
    back: {
      answer: 'Rôle de `group_replication_message_cache_size` :\n\n- **Mécanisme du cache XCom** :\n  - Le moteur de communication XCom conserve en mémoire vive un historique des messages de consensus récents.\n  - Si un membre subit une micro-coupure réseau de 5 secondes, à sa reconnexion, XCom lui rejoue directement les messages manquants depuis son cache mémoire sans avoir à déclencher une procédure lourde de récupération distribuée.\n- **Protection contre l\'épuisement mémoire (OOM)** :\n  - Fixe un plafond strict (1 Go par défaut) à la mémoire occupée par ce cache.\n  - Dès que la limite est atteinte, XCom purge les messages les plus anciens pour protéger la mémoire globale du serveur.\n  - Si un membre reste déconnecté trop longtemps et que ses messages ont été purgés du cache XCom, il passera automatiquement par la récupération par binlog.',
      explanation: 'Paramètre fondamental de stabilité sur les instances soumises à de volumineux volumes de transactions par seconde.',
      examTrap: 'Une valeur trop faible force des récupérations distribuées complètes lors de perturbations réseau mineures.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - group_replication_message_cache_size',
    },
  },
  {
    id: 'fc-mysql908-dom05-097',
    cardNumber: 97,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Rétablissement d\'une instance après défaillance : rebootClusterFromCompleteOutage',
    difficulty: 'hard',
    tags: ['rebootClusterFromCompleteOutage', 'Disaster Recovery', 'Blackout', 'AdminAPI'],
    front: {
      question: 'Comment redémarrer un cluster InnoDB après une coupure de courant générale ayant éteint simultanément l\'ensemble des nœuds ?',
      codeSnippet: `// Dans MySQL Shell connecté sur le nœud le plus à jour :
dba.rebootClusterFromCompleteOutage('productionCluster');`,
      hint: 'dba.rebootClusterFromCompleteOutage identifie l\'instance avec le GTID le plus avancé pour reformer le cluster en toute sécurité.',
    },
    back: {
      answer: 'Procédure de reprise après arrêt complet (`rebootClusterFromCompleteOutage`) :\n\n- **Le problème après un blackout général** :\n  - Tous les serveurs ont été arrêtés en même temps.\n  - Au redémarrage des machines, aucun serveur ne peut redémarrer MGR de lui-même car aucun n\'atteint le quorum nécessaire pour reformer le groupe.\n- **La solution via MySQL Shell** :\n  1. L\'administrateur se connecte à l\'instance qui possède le `gtid_executed` le plus récent (ou laisse Shell interroger toutes les instances).\n  2. Il exécute :\n     ```javascript\n     dba.rebootClusterFromCompleteOutage(\'productionCluster\');\n     ```\n  3. Shell inspecte l\'historique des transactions de tous les nœuds disponibles, sélectionne le nœud le plus avancé comme Primary initial, redémarre le groupe et y réintègre tous les autres membres un par un sans perte de données.',
      explanation: 'Restaure l\'intégralité d\'une infrastructure complexe en une commande unique après un incident majeur.',
      examTrap: 'Tenter de faire dba.createCluster sur un nœud après un crash écraserait les métadonnées et briserait le cluster.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Rebooting an InnoDB Cluster from Major Outage',
    },
  },
  {
    id: 'fc-mysql908-dom05-098',
    cardNumber: 98,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Contraintes sur les DDL concurrents dans Group Replication',
    difficulty: 'medium',
    tags: ['DDL Limitations', 'Online DDL', 'Schema Changes', 'MGR'],
    front: {
      question: 'Quelles sont les restrictions et bonnes pratiques lors de l\'exécution d\'opérations DDL (ALTER TABLE, CREATE INDEX) sur un cluster MGR ?',
      hint: 'Les DDL ne sont pas transactionnels et ne participent pas à la certification ; exécuter en période creuse sur le Primary en Single-Primary.',
    },
    back: {
      answer: 'Règles d\'exécution des DDL dans Group Replication :\n\n- **Nature des opérations DDL** :\n  - En MySQL, les DDL (`ALTER TABLE`, `DROP TABLE`) provoquent un commit implicite et ne génèrent pas de Write Sets au sens ligne par ligne.\n  - Ils ne sont **pas soumis au processus de certification optimiste** de MGR.\n- **Règles impératives** :\n  1. **En Single-Primary** : Les DDL doivent être exécutés exclusivement sur le Primary. Ils sont logués dans le binlog et répliqués séquentiellement aux Secondaries.\n  2. **En Multi-Primary** : Il est formellement interdit d\'exécuter des DDL concurrents sur deux nœuds différents touchant les mêmes tables sous peine de blocages et de divergences de schéma.\n  3. **Bonne pratique** : Utiliser `ALGORITHM=INPLACE` ou des outils de migration en ligne comme `gh-ost` ou `pt-online-schema-change` pour éviter de bloquer les réplicas.',
      explanation: 'Un DDL lourd bloque l\'application des événements sur les Secondaries s\'il n\'est pas exécuté en ligne.',
      examTrap: 'Un DDL qui échoue à mi-parcours sur un réplica (ex: manque d\'espace disque) fait passer immédiatement le membre en état ERROR.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Group Replication Limitations: DDL',
    },
  },
  {
    id: 'fc-mysql908-dom05-099',
    cardNumber: 99,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Table de diagnostic performance_schema.replication_group_member_stats',
    difficulty: 'medium',
    tags: ['replication_group_member_stats', 'Performance Schema', 'Queues', 'Conflict Counts'],
    front: {
      question: 'Quelles métriques cruciales de performance et de décalage sont fournies par performance_schema.replication_group_member_stats ?',
      codeSnippet: `mysql> SELECT MEMBER_ID, 
       COUNT_TRANSACTIONS_IN_QUEUE, 
       COUNT_TRANSACTIONS_CHECKED, 
       COUNT_CONFLICTS_DETECTED, 
       COUNT_TRANSACTIONS_ROWS_VALIDATING 
FROM performance_schema.replication_group_member_stats;`,
      hint: 'File d\'attente de certification (IN_QUEUE), conflits détectés (CONFLICTS_DETECTED), et transactions certifiées.',
    },
    back: {
      answer: 'Indicateurs de `replication_group_member_stats` :\n\n- **`COUNT_TRANSACTIONS_IN_QUEUE`** :\n  - Nombre de transactions reçues via XCom attendant d\'être certifiées.\n  - Si ce chiffre grandit continuellement, le nœud est surchargé et risque de déclencher le Flow Control.\n- **`COUNT_TRANSACTIONS_CHECKED`** :\n  - Nombre total de transactions inspectées par le module de certification local.\n- **`COUNT_CONFLICTS_DETECTED`** :\n  - Nombre de transactions ayant échoué la certification en raison d\'un conflit de clé (particulièrement instructif en Multi-Primary).\n- **`COUNT_TRANSACTIONS_ROWS_VALIDATING`** :\n  - Taille courante de la table de hachage interne des Write Sets utilisée pour certifier les transactions entrantes.',
      explanation: 'Permet une observabilité microscopique du moteur de consensus distribué.',
      examTrap: 'Une valeur élevée de COUNT_CONFLICTS_DETECTED en Multi-Primary prouve que l\'application écrit sur les mêmes données depuis plusieurs nœuds.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - replication_group_member_stats Table',
    },
  },
  {
    id: 'fc-mysql908-dom05-100',
    cardNumber: 100,
    domainId: 'mysql-908-dom-05',
    domainCode: 'DOM-05',
    domainTitle: 'Réplication binaire (GTID), Groupe InnoDB Cluster & Haute disponibilité',
    subtopic: 'Matrice décisionnelle : Choisir entre Asynchrone, Semi-Synchrone, Group Replication et ClusterSet',
    difficulty: 'hard',
    tags: ['Architecture Matrix', 'Decision Guide', 'RPO', 'RTO', 'Summary'],
    front: {
      question: 'Quelle est la matrice décisionnelle pour choisir entre Réplication Asynchrone, Semi-Synchrone, InnoDB Cluster (MGR) et InnoDB ClusterSet ?',
      hint: 'Comparer selon le RPO (perte tolérée), RTO (temps de reprise), complexité matérielle, et distance réseau (LAN vs WAN).',
    },
    back: {
      answer: 'Matrice décisionnelle d\'architecture Haute Disponibilité MySQL :\n\n| Solution | RPO (Perte) | RTO (Basculement) | Portée Réseau | Mécanisme | Quorum Requis |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| **Asynchrone Standard** | $> 0$ (perte si crash source) | Manuel (minutes) | WAN / LAN | Streaming Binlog mono/multi-thread | Non (2 nœuds suffisent) |\n| **Semi-Synchrone (AFTER_SYNC)** | $= 0$ (si quorum ACK OK) | Manuel ou scripté | LAN / Faible latence | ACK avant commit | Non (Source + Réplica) |\n| **InnoDB Cluster (MGR)** | **$= 0$ (Zéro perte)** | **Automatique (< 3s)** | **LAN / Même région** | **Paxos XCom + Certification** | **Oui (Min 3 nœuds, 2f+1)** |\n| **InnoDB ClusterSet** | **$= 0$ (local)**, $> 0$ (si sinistre régional) | **Auto en local, Manuel inter-régions** | **Multi-Régions / Intercontinental** | **MGR local + Lien asynchrone** | **Quorum local par cluster** |\n\n- **Synthèse** : Privilégier **InnoDB Cluster** pour la production critique au sein d\'un datacenter/cloud local, et adjoindre un **ClusterSet** dès qu\'une exigence de plan de reprise d\'activité (PRA/DRP) multi-sites géographique est requise.',
      explanation: 'Synthétise l\'ensemble des connaissances d\'architecture requises pour la certification 1Z0-908.',
      examTrap: 'Ne déployez jamais Group Replication sur des liens WAN intercontinentaux à forte latence sans passer par InnoDB ClusterSet.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - High Availability Solutions Comparison',
    },
  },
];
