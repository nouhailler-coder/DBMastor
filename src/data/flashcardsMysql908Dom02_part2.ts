import { FlashcardItem } from '../types';

export const mysql908Dom02Part2Flashcards: FlashcardItem[] = [
  // =========================================================================
  // SECTION 5 : JOURNAL BINAIRE (BINARY LOG - BINLOG) & AUDIT (Cartes 51 à 65)
  // log_bin, binlog_format (ROW), binlog_row_image, expiration, sync_binlog,
  // mysqlbinlog, PURGE BINARY LOGS, sql_log_bin
  // =========================================================================
  {
    id: 'fc-mysql908-dom02-051',
    cardNumber: 51,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Rôle fondamental du Binary Log et activation par défaut sous MySQL 8.0',
    difficulty: 'easy',
    tags: ['Binlog', 'Replication', 'PITR', 'MySQL 8.0'],
    front: {
      question: 'Quels sont les deux rôles fondamentaux du journal binaire (Binary Log) et quel est son statut d\'activation par défaut sous MySQL 8.0 ?',
      codeSnippet: `SELECT @@GLOBAL.log_bin;
-- Résultat : 1 (ON)`,
      hint: 'Pensez à la haute disponibilité vers d\'autres serveurs et à la restauration après un incident.',
    },
    back: {
      answer: 'Les deux rôles fondamentaux du Binary Log sont :\n\n1. **La Réplication (Replication)** : Fournit le flux continu des modifications de données envoyées par la source aux replicas pour maintenir la synchronisation.\n2. **La Récupération à un instant précis (Point-In-Time Recovery - PITR)** : Permet de rejouer toutes les transactions validées depuis la dernière sauvegarde physique jusqu\'à la seconde précédant une erreur humaine (`DROP TABLE`, etc.).\n\n**Statut sous MySQL 8.0** : `log_bin = ON` par défaut (activé dès l\'installation d\'usine).',
      explanation: 'Contrairement à MySQL 5.7 où le binlog était désactivé par défaut, MySQL 8.0 le pré-active pour encourager les déploiements prêts pour la réplication et la sauvegarde.',
      examTrap: 'Ne confondez pas le Binlog avec le Redo Log d\'InnoDB ! Le Redo Log est physique et interne à InnoDB (crash recovery). Le Binlog est logique et géré au niveau serveur pour tout moteur.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The Binary Log',
    },
  },
  {
    id: 'fc-mysql908-dom02-052',
    cardNumber: 52,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Formats de journalisation binaire : binlog_format (ROW vs STATEMENT vs MIXED)',
    difficulty: 'medium',
    tags: ['binlog_format', 'ROW', 'STATEMENT', 'Replication'],
    front: {
      question: 'Quels sont les trois formats de binlog_format et pourquoi le format ROW est-il le standard obligatoire par défaut sous MySQL 8.0 ?',
      codeSnippet: `SELECT @@GLOBAL.binlog_format;
-- Résultat : ROW`,
      hint: 'Comment enregistrer les fonctions non déterministes comme NOW(), RAND() ou UUID() sans désynchroniser les replicas ?',
    },
    back: {
      answer: 'Les trois formats de journalisation binaire sont :\n\n1. **`ROW` (Par défaut)** : Enregistre l\'image exacte avant/après de chaque ligne modifiée. Garantit une réplication 100% cohérente et déterministe.\n2. **`STATEMENT`** : Enregistre le texte brut de la requête SQL (ex: `UPDATE ... WHERE ...`). Moins volumineux mais sujet à des désynchronisations sévères avec les fonctions non déterministes (`NOW()`, `UUID()`, `LIMIT` sans `ORDER BY`).\n3. **`MIXED`** : Utilise le format STATEMENT par défaut et bascule automatiquement en ROW pour les requêtes non déterministes.\n\n*Note MySQL 8.0* : Le format STATEMENT et MIXED sont dépréciés au profit exclusif de `ROW`.',
      explanation: 'Avec le format ROW, ce qui s\'est réellement passé sur la source est reproduit bit à bit sur le replica, éliminant tout écart d\'interprétation SQL.',
      examTrap: 'Une requête `UPDATE table SET col = UUID();` en format STATEMENT génèrera des UUID différents sur la source et le replica ! Le format ROW résout définitivement ce problème.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Binary Logging Formats',
    },
  },
  {
    id: 'fc-mysql908-dom02-053',
    cardNumber: 53,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Images de lignes dans le journal binaire : binlog_row_image',
    difficulty: 'hard',
    tags: ['binlog_row_image', 'ROW', 'Optimization', 'Storage'],
    front: {
      question: 'Quelles sont les valeurs possibles de la variable binlog_row_image et quel est leur impact sur le volume disque des journaux binaires ?',
      codeSnippet: `SET GLOBAL binlog_row_image = 'MINIMAL';
-- Options : FULL (défaut), MINIMAL, NOBLOB`,
      hint: 'Doit-on enregistrer toutes les colonnes de la table ou seulement celles qui ont changé ?',
    },
    back: {
      answer: 'Valeurs de `binlog_row_image` (au format `ROW`) :\n\n- **`FULL`** (Défaut) : Enregistre toutes les colonnes de la ligne dans l\'image avant (Before Image) et dans l\'image après (After Image), même si une seule colonne a été modifiée.\n- **`MINIMAL`** : N\'enregistre dans l\'image avant que les colonnes nécessaires à l\'identification de la ligne (clé primaire), et dans l\'image après uniquement les colonnes dont la valeur a effectivement changé.\n- **`NOBLOB`** : Comme `FULL`, sauf pour les colonnes `BLOB` et `TEXT` qui sont exclues si elles n\'ont pas été altérées.\n\n*Bénéfice de MINIMAL* : Réduit considérablement la taille des fichiers binlog sur les tables très larges comportant de nombreuses colonnes.',
      explanation: 'MINIMAL permet des gains d\'espace et de bande passante réseau très importants en réplication haute fréquence.',
      examTrap: 'Si vous utilisez des outils d\'audit de CDC (Change Data Capture comme Debezium) qui ont besoin de voir l\'ancienne valeur de toutes les colonnes, binlog_row_image DOIT rester à FULL.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: binlog_row_image',
    },
  },
  {
    id: 'fc-mysql908-dom02-054',
    cardNumber: 54,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Rétention automatique des journaux binaires : binlog_expire_logs_seconds',
    difficulty: 'easy',
    tags: ['binlog_expire_logs_seconds', 'Retention', 'Purge', 'MySQL 8.0'],
    front: {
      question: 'Quelle variable contrôle la durée d\'expiration automatique des fichiers binlog sous MySQL 8.0 et quelle ancienne variable remplace-t-elle ?',
      codeSnippet: `SET PERSIST binlog_expire_logs_seconds = 259200; -- 3 jours (3 * 86400)`,
      hint: 'Elle s\'exprime désormais en secondes pour permettre des purges plus fines que la journée entière.',
    },
    back: {
      answer: 'Sous MySQL 8.0 :\n\n- **`binlog_expire_logs_seconds`** est la variable moderne officielle qui définit la durée de rétention en secondes (défaut : `2592000` secondes = 30 jours).\n- Elle remplace la variable dépréciée **`expire_logs_days`** qui ne permettait qu\'une précision au jour le jour.\n- Si les deux variables sont définies dans `my.cnf`, c\'est `binlog_expire_logs_seconds` qui prend la priorité absolue.\n- La purge automatique est déclenchée lors du démarrage du serveur, lors d\'une rotation de binlog (`FLUSH BINARY LOGS`) ou après une transaction validée.',
      explanation: 'Permet sur des bases très actives de configurer une purge après 6 heures (21600 secondes) pour éviter la saturation du disque.',
      examTrap: 'Régler binlog_expire_logs_seconds = 0 désactive complètement la purge automatique ! Les fichiers binlog s\'accumuleront indéfiniment jusqu\'à remplir le disque.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: binlog_expire_logs_seconds',
    },
  },
  {
    id: 'fc-mysql908-dom02-055',
    cardNumber: 55,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Taille maximale des fichiers binaires : max_binlog_size',
    difficulty: 'medium',
    tags: ['max_binlog_size', 'Rotation', 'Binlog', 'Filesystem'],
    front: {
      question: 'Comment fonctionne la rotation des fichiers binaires via max_binlog_size et pourquoi un fichier binlog peut-il parfois dépasser cette limite ?',
      codeSnippet: `SET GLOBAL max_binlog_size = 1073741824; -- 1 GiB (défaut)`,
      hint: 'Une transaction atomique ne peut jamais être scindée entre deux fichiers binlog différents.',
    },
    back: {
      answer: 'Mécanisme de rotation par taille :\n\n- Dès qu\'un fichier binlog atteint ou dépasse la taille fixée par `max_binlog_size` (défaut : 1 GiB), MySQL ferme le fichier actif et ouvre un nouveau fichier incrémenté (ex: `binlog.000001` $\\rightarrow$ `binlog.000002`).\n- **Pourquoi un fichier peut dépasser cette limite** :\n  MySQL applique la règle d\'**atomicité transactionnelle** : une transaction ne peut jamais être coupée à cheval sur deux fichiers binlog. Si une grosse transaction (ex: modification massive de 1,5 Go) est enregistrée, MySQL terminera la transaction entière dans le fichier courant, qui dépassera temporairement `max_binlog_size` avant que la rotation n\'ait lieu.',
      explanation: 'Cette intégrité garantit qu\'un replica qui rejoue un fichier binlog applique toujours des transactions atomiques complètes.',
      examTrap: 'Ne réglez jamais max_binlog_size en dessous de 4096 octets (4 Ko). La valeur maximale possible est de 1 GiB.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: max_binlog_size',
    },
  },
  {
    id: 'fc-mysql908-dom02-056',
    cardNumber: 56,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Durabilité ACID et synchronisation disque du Binlog : sync_binlog',
    difficulty: 'hard',
    tags: ['sync_binlog', 'ACID', 'Durability', 'Crash Recovery', 'Performance'],
    front: {
      question: 'Quelles sont les valeurs possibles de la variable sync_binlog et quel est le compromis fondamental entre durabilité ACID et performances d\'écriture ?',
      codeSnippet: `SET GLOBAL sync_binlog = 1; -- Valeur par défaut sous MySQL 8.0
-- vs
SET GLOBAL sync_binlog = 0;
-- vs
SET GLOBAL sync_binlog = N;`,
      hint: 'Chaque commit entraîne-t-il un fsync() synchrone du fichier binaire sur le disque ?',
    },
    back: {
      answer: 'Valeurs et compromis de `sync_binlog` :\n\n- **`sync_binlog = 1`** (Défaut MySQL 8.0) : Le fichier binaire est synchronisé sur disque (`fsync()`) **à chaque commit de transaction**. Offre la durabilité ACID maximale : en cas de coupure de courant, aucune transaction validée n\'est perdue dans le binlog.\n- **`sync_binlog = 0`** : Le serveur ne synchronise jamais explicitement ; il laisse le système d\'exploitation vider ses buffers en tâche de fond. Débit maximal, mais risque de perdre des transactions validées non flushées en cas de crash de l\'OS.\n- **`sync_binlog = N`** ($N > 1$) : Le serveur effectue un `fsync()` toutes les $N$ transactions validées. Bon compromis performance/risque en environnement IOPS limité.',
      explanation: 'Pour une résilience absolue et une réplication sans désynchronisation après crash (Crash-Safe Replica), il faut impérativement associer `sync_binlog = 1` et `innodb_flush_log_at_trx_commit = 1`.',
      examTrap: 'Si sync_binlog=0 et que le serveur subit un crash matériel, le binlog peut être en retard sur InnoDB : des transactions validées dans la base n\'auront pas été écrites dans le binlog et ne seront jamais répliquées !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: sync_binlog',
    },
  },
  {
    id: 'fc-mysql908-dom02-057',
    cardNumber: 57,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Mécanisme de validation de groupe binaire : Binary Log Group Commit (BLGC)',
    difficulty: 'hard',
    tags: ['BLGC', 'Group Commit', 'Performance', 'Concurrency', 'Internals'],
    front: {
      question: 'Comment fonctionne le mécanisme Binary Log Group Commit (BLGC) dans MySQL 8.0 pour limiter le goulot d\'étranglement des fsync() lors de commits concurrents ?',
      hint: 'Il regroupe les écritures de plusieurs threads clients simultanés en trois étapes ordonnées (Flush, Sync, Commit).',
    },
    back: {
      answer: 'Le Binary Log Group Commit (BLGC) organise la validation en pipeline de 3 files d\'attente ordonnées dirigées par un thread "Leader" pour un lot de threads "Followers" :\n\n1. **Stage 1 : Flush Stage** : Le Leader écrit les transactions de son groupe depuis la mémoire vers le cache du système d\'exploitation du fichier binlog.\n2. **Stage 2 : Sync Stage** : Le Leader effectue un UNIQUE appel système `fsync()` pour l\'ensemble du groupe de transactions (mutualisation du coût I/O physique).\n3. **Stage 3 : Commit Stage** : Le Leader valide le groupe de transactions dans le moteur de stockage InnoDB.\n\nOn peut ajuster le regroupement avec `binlog_group_commit_sync_delay` (microsecondes d\'attente) et `binlog_group_commit_sync_no_delay_count`.',
      explanation: 'Sans Group Commit, un serveur subissant 10 000 commits par seconde devrait effectuer 10 000 fsync/sec, ce qui saturerait même des SSD NVMe haut de gamme.',
      examTrap: 'Le Group Commit n\'ajoute de la latence que si vous configurez artificiellement binlog_group_commit_sync_delay > 0. Par défaut, il opère de manière opportuniste sans délai artificiel.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Binary Log Group Commit',
    },
  },
  {
    id: 'fc-mysql908-dom02-058',
    cardNumber: 58,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Extraction et rejeu avec l\'utilitaire mysqlbinlog',
    difficulty: 'medium',
    tags: ['mysqlbinlog', 'CLI', 'PITR', 'Recovery'],
    front: {
      question: 'Quelles sont les options fondamentales de l\'utilitaire mysqlbinlog pour extraire une plage exacte de transactions lors d\'une récupération après sinistre (Point-in-Time Recovery) ?',
      codeSnippet: `mysqlbinlog --start-datetime="2026-09-18 10:00:00" \\
           --stop-datetime="2026-09-18 10:45:00" \\
           --database=production_db \\
           /var/lib/mysql/binlog.000042 | mysql -u root -p`,
      hint: 'Filtrage par date/heure (--start/stop-datetime) et par position d\'offset (--start/stop-position).',
    },
    back: {
      answer: 'Options fondamentales de `mysqlbinlog` :\n\n- `--start-datetime="AAAA-MM-JJ HH:MM:SS"` et `--stop-datetime="..."` : Filtre les événements selon leur horodatage (idéal pour cibler la période approximative de l\'incident).\n- `--start-position=N` et `--stop-position=N` : Spécifie la position en octets exacte dans le fichier (méthode la plus précise pour s\'arrêter juste avant un `DROP TABLE` accidentel).\n- `-d, --database=nom_db` : Filtre les événements survenus sur un schéma spécifique.\n- `--idempotent` : Ignore les erreurs de doublons lors du rejeu.\n- Injection directe : En pipant la sortie vers le client `mysql`, on réapplique les transactions dans la base.',
      explanation: 'Pour éviter de rejouer le DROP TABLE fautif, le DBA identifie l\'offset exact du DROP TABLE dans le log et définit `--stop-position` sur la position de fin de la transaction précédente.',
      examTrap: 'Ne lancez jamais mysqlbinlog sur plusieurs fichiers indépendamment sans les passer dans un seul flux mysql si vous utilisez des tables temporaires ou GTID ! Utilisez : mysqlbinlog binlog.000001 binlog.000002 | mysql',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Point-in-Time (Incremental) Recovery Using the Binary Log',
    },
  },
  {
    id: 'fc-mysql908-dom02-059',
    cardNumber: 59,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Décodage des événements ROW dans mysqlbinlog (--base64-output=DECODE-ROWS)',
    difficulty: 'hard',
    tags: ['mysqlbinlog', 'ROW', 'DECODE-ROWS', 'Troubleshooting'],
    front: {
      question: 'Pourquoi la lecture directe d\'un fichier binlog au format ROW avec mysqlbinlog affiche-t-elle des blocs de code Base64 illisibles et quelle commande permet de les décoder en pseudo-SQL lisible ?',
      codeSnippet: `mysqlbinlog --base64-output=DECODE-ROWS -v /var/lib/mysql/binlog.000042`,
      hint: 'Les options --base64-output=DECODE-ROWS associées aux drapeaux de verbosité -v ou -vv.',
    },
    back: {
      answer: 'Cause et solution de décodage :\n\n- **Cause** : Au format `ROW`, les modifications sont encodées sous forme binaire brute encapsulée dans des blocs `BINLOG \'...\'` encodés en Base64 pour garantir la fidélité des types.\n- **Solution pour lecture humaine** :\n  Exécuter `mysqlbinlog --base64-output=DECODE-ROWS -v binlog.000042` :\n  - `--base64-output=DECODE-ROWS` supprime l\'affichage des blocs Base64 bruts.\n  - `-v` (verbose) reconstitue des instructions pseudo-SQL commentées avec les valeurs des colonnes (`### UPDATE mytable SET @1=... WHERE @1=...`).\n  - `-vv` (très verbeux) ajoute en plus les noms réels et les types des colonnes SQL.',
      explanation: 'Indispensable pour examiner les lignes modifiées sans risquer de corrompre l\'affichage du terminal.',
      examTrap: 'La sortie produite avec --base64-output=DECODE-ROWS ne peut PAS être réinjectée dans le client mysql pour un rejeu car les données brutes ont été masquées ! Elle sert uniquement à l\'audit humain.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqlbinlog Row Event Display',
    },
  },
  {
    id: 'fc-mysql908-dom02-060',
    cardNumber: 60,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Purge manuelle et sécurisée des journaux binaires : PURGE BINARY LOGS',
    difficulty: 'medium',
    tags: ['PURGE BINARY LOGS', 'Maintenance', 'Disk Space', 'Administration'],
    front: {
      question: 'Quelles sont les deux syntaxes SQL sécurisées pour supprimer manuellement d\'anciens fichiers binaires et pourquoi est-il formellement interdit de faire un rm binlog.* sous Linux ?',
      codeSnippet: `PURGE BINARY LOGS TO 'binlog.000042';
PURGE BINARY LOGS BEFORE '2026-09-01 00:00:00';`,
      hint: 'Pensez au fichier d\'index binlog.index qui référence tous les fichiers existants.',
    },
    back: {
      answer: 'Syntaxes SQL officielles :\n\n1. `PURGE BINARY LOGS TO \'nom_fichier\';` : Supprime tous les fichiers dont le numéro de séquence est strictement inférieur au fichier mentionné (celui-ci est conservé).\n2. `PURGE BINARY LOGS BEFORE \'date_heure\';` : Supprime tous les fichiers dont la dernière modification est antérieure à la date spécifiée.\n\n**Interdiction absolue de faire `rm` au niveau OS** :\nLe serveur maintient un fichier d\'inventaire nommé **`binlog.index`**. Si vous supprimez des fichiers avec `rm`, le fichier d\'index devient inconsistant, provoquant des échecs de réplication et des erreurs critiques lors des futurs `FLUSH LOGS` ou sauvegardes physiques.',
      explanation: 'PURGE BINARY LOGS supprime physiquement les fichiers tout en mettant à jour atomiquement le fichier binlog.index.',
      examTrap: 'Ne purgez jamais un fichier binaire qui n\'a pas encore été consommé et appliqué par tous vos replicas ! Vérifiez l\'état des replicas avant de purger.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - PURGE BINARY LOGS Syntax',
    },
  },
  {
    id: 'fc-mysql908-dom02-061',
    cardNumber: 61,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Terminologie inclusive MySQL 8.0.22+ : SHOW BINARY LOG STATUS',
    difficulty: 'easy',
    tags: ['Inclusive Language', 'SHOW BINARY LOG STATUS', 'MySQL 8.0.22', 'Replica'],
    front: {
      question: 'Quelle commande moderne introduite dans MySQL 8.0.22 remplace l\'ancienne commande SHOW MASTER STATUS pour observer le fichier binaire courant et sa position ?',
      codeSnippet: `SHOW BINARY LOG STATUS;
-- Remplacement de SHOW MASTER STATUS`,
      hint: 'Terminologie inclusive adoptée par Oracle pour éliminer les termes Master/Slave.',
    },
    back: {
      answer: 'La commande moderne est **`SHOW BINARY LOG STATUS;`**\n\nElle retourne un tableau à 4 colonnes :\n1. `File` : Nom du fichier binaire actuellement actif en écriture (ex: `binlog.000050`).\n2. `Position` : Offset actuel en octets (position de fin de la dernière transaction validée).\n3. `Binlog_Do_DB` / `Binlog_Ignore_DB` : Règles de filtrage de bases configurées.\n4. `Executed_Gtid_Set` : Ensemble de tous les GTID ayant été validés sur ce serveur.\n\n*Note* : `SHOW MASTER STATUS` fonctionne encore sous forme d\'alias déprécié mais déclenche un avertissement.',
      explanation: 'De même, `SHOW SLAVE STATUS` est remplacé par `SHOW REPLICA STATUS`, et `RESET MASTER` est remplacé par `RESET BINARY LOGS AND GTIDS`.',
      examTrap: 'Dans l\'examen 1Z0-908, privilégiez toujours la syntaxe inclusive moderne : SHOW BINARY LOG STATUS et SHOW REPLICA STATUS.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - SHOW BINARY LOG STATUS Statement',
    },
  },
  {
    id: 'fc-mysql908-dom02-062',
    cardNumber: 62,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Désactivation de la journalisation binaire pour la session courante : sql_log_bin',
    difficulty: 'medium',
    tags: ['sql_log_bin', 'Session', 'Maintenance', 'Replication'],
    front: {
      question: 'Comment un administrateur peut-il exécuter un script de correction de données sur un serveur sans que ces requêtes ne soient répliquées sur les réplicas ?',
      codeSnippet: `SET SESSION sql_log_bin = 0;
-- Exécution des requêtes locales...
SET SESSION sql_log_bin = 1;`,
      hint: 'Variable de session sql_log_bin.',
    },
    back: {
      answer: 'En configurant la variable de session :\n\n`SET SESSION sql_log_bin = 0;` (ou `OFF`)\n\nEffets :\n- Les requêtes DDL ou DML exécutées dans cette session **ne seront pas inscrites dans le journal binaire**.\n- Par conséquent, les réplicas ne recevront jamais ces modifications et ne les rejoueront pas.\n- Requiert le privilège dynamique `SYSTEM_VARIABLES_ADMIN`, `SESSION_VARIABLES_ADMIN` ou `SUPER`.\n- Ne pas oublier de réactiver `SET SESSION sql_log_bin = 1;` avant de clore le travail.',
      explanation: 'Essentiel pour effectuer des corrections de données désynchronisées localement ou pour charger un index temporaire sur un seul nœud.',
      examTrap: 'sql_log_bin est une variable STRICTEMENT de session ! Tenter de faire "SET GLOBAL sql_log_bin = 0;" renverra une erreur immédiate.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: sql_log_bin',
    },
  },
  {
    id: 'fc-mysql908-dom02-063',
    cardNumber: 63,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Dimensionnement du cache de transaction binaire : binlog_cache_size',
    difficulty: 'medium',
    tags: ['binlog_cache_size', 'Memory', 'Disk Spilling', 'Performance'],
    front: {
      question: 'Quel est le rôle de binlog_cache_size et quelles variables de statut permettent de détecter si des transactions débordent sur le disque ?',
      codeSnippet: `SHOW GLOBAL STATUS LIKE 'Binlog_cache_%';`,
      hint: 'Chaque thread dispose d\'un buffer mémoire pour préparer ses transactions avant commit.',
    },
    back: {
      answer: 'Fonctionnement de `binlog_cache_size` :\n\n- Pendant l\'exécution d\'une transaction, MySQL accumule les modifications binaires dans un cache mémoire alloué par connexion (`binlog_cache_size`, par défaut 32 Ko).\n- Si une transaction génère plus d\'octets que cette limite (ex: grosse insertion en masse), MySQL crée un **fichier temporaire sur disque** pour stocker le surplus.\n- **Indicateurs de statut** :\n  - `Binlog_cache_use` : Nombre de transactions ayant utilisé le cache mémoire.\n  - `Binlog_cache_disk_use` : Nombre de transactions ayant dû déborder sur disque.\n- **Règle de tuning** : Si `Binlog_cache_disk_use` est élevé par rapport à `Binlog_cache_use`, il convient d\'augmenter `binlog_cache_size`.',
      explanation: 'Éviter les écritures temporaires sur disque lors des transactions améliore considérablement la latence des commits.',
      examTrap: 'binlog_cache_size est alloué par connexion active démarrant une transaction ! Ne l\'augmentez pas aveuglément à 500 Mo sous peine d\'épuiser la RAM avec 500 connexions.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: binlog_cache_size',
    },
  },
  {
    id: 'fc-mysql908-dom02-064',
    cardNumber: 64,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Audit de sécurité : composant MySQL Enterprise Audit',
    difficulty: 'hard',
    tags: ['Audit', 'Security', 'Enterprise', 'Compliance'],
    front: {
      question: 'Quelles sont les capacités du composant d\'audit MySQL Enterprise Audit et comment filtre-t-il les événements de sécurité ?',
      hint: 'Écriture au format XML ou JSON chiffré, filtrage fin par règles déclaratives.',
    },
    back: {
      answer: 'MySQL Enterprise Audit offre un cadre de conformité réglementaire (SOX, HIPAA, PCI-DSS, RGPD) :\n\n- Intercepte au niveau du serveur toutes les connexions, déconnexions, échecs d\'authentification et requêtes SQL exécutées.\n- **Filtrage déclaratif en JSON** : Permet de définir des filtres complexes (ex: auditer uniquement les modifications DDL, ou uniquement les accès aux tables financières par des utilisateurs non administrateurs).\n- **Formats de sortie** : Fichier XML standard ou flux JSON indexable.\n- **Protection contre la falsification** : Signature cryptographique et chiffrement des journaux d\'audit.',
      explanation: 'Ce module permet aux entreprises de garantir qu\'aucun administrateur à privilèges ne peut modifier subrepticement des données sensibles sans laisser de trace inaltérable.',
      examTrap: 'MySQL Enterprise Audit est une fonctionnalité commerciale Oracle (Enterprise Edition) qui s\'installe sous forme de composant (component_audit_api).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - MySQL Enterprise Audit',
    },
  },
  {
    id: 'fc-mysql908-dom02-065',
    cardNumber: 65,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Différence entre FLUSH BINARY LOGS et FLUSH LOGS',
    difficulty: 'easy',
    tags: ['FLUSH', 'Binlog', 'Rotation', 'Maintenance'],
    front: {
      question: 'Quelle est la différence entre la commande FLUSH BINARY LOGS et la commande globale FLUSH LOGS sous MySQL 8.0 ?',
      codeSnippet: `FLUSH BINARY LOGS;
-- vs
FLUSH LOGS;`,
      hint: 'L\'une cible spécifiquement la rotation du binlog, l\'autre effectue la rotation de tous les journaux du serveur simultanément.',
    },
    back: {
      answer: 'Différence de périmètre :\n\n- **`FLUSH BINARY LOGS;`** : Ferme le fichier journal binaire courant et en ouvre immédiatement un nouveau avec le numéro de séquence suivant (ex: `binlog.000001` $\\rightarrow$ `binlog.000002`). N\'affecte aucun autre journal.\n- **`FLUSH LOGS;`** (Général) : Effectue la rotation simultanée de **TOUS** les journaux activés sur l\'instance : Error Log, General Log, Slow Query Log, Relay Log et Binary Log.',
      explanation: 'Préférer toujours `FLUSH BINARY LOGS` dans les scripts de sauvegarde pour éviter de déclencher des fermetures inopinées de l\'Error Log ou du Slow Log.',
      examTrap: 'FLUSH LOGS sans argument exige le privilège RELOAD.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - FLUSH Statement Syntax',
    },
  },

  // =========================================================================
  // SECTION 6 : PERFORMANCE SCHEMA (ARCHITECTURE & INSTRUMENTATION) (Cartes 66 à 78)
  // Architecture mémoire lockless, instruments, consumers, setup_tables,
  // events_statements_*, events_waits_*, digest hash, memory metrics
  // =========================================================================
  {
    id: 'fc-mysql908-dom02-066',
    cardNumber: 66,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Architecture interne et conception sans verrouillage du Performance Schema',
    difficulty: 'medium',
    tags: ['Performance Schema', 'Architecture', 'Lockless', 'RAM'],
    front: {
      question: 'Quelles sont les caractéristiques de conception interne du Performance Schema qui lui permettent de mesurer l\'activité sans effondrer les performances du serveur ?',
      hint: 'Tables entièrement en mémoire RAM, algorithmes sans mutex globaux, buffers circulaires pré-alloués.',
    },
    back: {
      answer: 'Caractéristiques architecturales majeures :\n\n1. **Stockage 100% en mémoire vive (RAM)** : Aucune table de `performance_schema` n\'écrit sur disque ni n\'utilise InnoDB. Tout réside dans des tampons mémoire dédiés.\n2. **Conception Lockless (sans verrous lourds)** : Utilise des opérations atomiques et des pointeurs sans mutex globaux pour ne pas bloquer les threads de travail de MySQL.\n3. **Buffers circulaires pré-alloués** : Les tables d\'historique ont une taille fixe maximale allouée au boot ; les événements les plus anciens sont écrasés par les nouveaux sans coût d\'allocation dynamique.\n4. **Surcoût (Overhead) minimal** : Généralement inférieur à 1 à 3% du CPU en configuration standard.',
      explanation: 'Le Performance Schema a été conçu dès l\'origine pour pouvoir rester actif 24h/24 en production sur les systèmes les plus exigeants.',
      examTrap: 'Vous ne pouvez pas créer de tables utilisateur ou modifier le schéma dans performance_schema ! C\'est un moteur de stockage interne en lecture seule (sauf tables de configuration setup_*).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Performance Schema Architecture',
    },
  },
  {
    id: 'fc-mysql908-dom02-067',
    cardNumber: 67,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Concepts jumeaux : Instruments vs Consumers',
    difficulty: 'easy',
    tags: ['Performance Schema', 'Instruments', 'Consumers', 'Concepts'],
    front: {
      question: 'Quelle est la distinction fondamentale entre un "Instrument" et un "Consumer" dans le Performance Schema de MySQL ?',
      hint: 'L\'un est une sonde dans le code source qui produit une mesure, l\'autre est la destination qui stocke ou agrège cette mesure.',
    },
    back: {
      answer: 'Distinction fondamentale :\n\n- **Instrument (Sonde / Capteur)** : Point de mesure inséré directement dans le code source de MySQL pour détecter un événement spécifique (ex: ouverture d\'un fichier, attente d\'un mutex, exécution d\'une instruction SQL).\n- **Consumer (Consommateur / Destination)** : Table ou structure de destination du Performance Schema qui reçoit, filtre et stocke les événements générés par les instruments actifs (ex: `events_statements_current`, `events_waits_history`).\n\n*Règle d\'or* : Pour qu\'un événement apparaisse dans une table, il faut impérativement que l\'instrument ET le consommateur soient tous deux activés (`ENABLED = \'YES\'`).',
      explanation: 'Si un instrument est actif mais qu\'aucun consommateur n\'écoute, la sonde exécute son code mais le résultat est jeté immédiatement.',
      examTrap: 'Activer un consommateur dans setup_consumers ne sert à rien si l\'instrument correspondant dans setup_instruments est désactivé (ENABLED=\'NO\') !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Performance Schema Instruments and Consumers',
    },
  },
  {
    id: 'fc-mysql908-dom02-068',
    cardNumber: 68,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Arborescence et nommage hiérarchique des instruments',
    difficulty: 'medium',
    tags: ['Instruments', 'Hierarchy', 'wait', 'statement', 'stage'],
    front: {
      question: 'Quelle est la signification des préfixes majeurs dans la hiérarchie des noms d\'instruments (ex: wait/*, stage/*, statement/*, memory/*) ?',
      codeSnippet: `wait/io/file/innodb/innodb_data_file
stage/sql/Sorting result
statement/sql/select
memory/innodb/buf_buf_pool`,
      hint: 'Chaque préfixe correspond à un niveau d\'abstraction de la trace d\'exécution.',
    },
    back: {
      answer: 'Hiérarchie des préfixes d\'instruments :\n\n- **`wait/*`** : Événements de latence et d\'attente de bas niveau (I/O disque `wait/io/file/`, verrous de verrouillage/mutex `wait/synch/mutex/`, socket réseau `wait/io/socket/`).\n- **`stage/*`** : Étapes intermédiaires franchies par le serveur lors de l\'exécution d\'une requête (ex: `Creating sort index`, `Sending data`, `Sorting result`).\n- **`statement/*`** : Instructions SQL complètes (`statement/sql/select`, `statement/sql/insert`, `statement/abstract/query`).\n- **`transaction/*`** : Suivi du cycle de vie des transactions (`transaction`).\n- **`memory/*`** : Suivi des allocations de mémoire vive par sous-système (`memory/innodb/*`, `memory/sql/*`).',
      explanation: 'Cette structure arborescente permet de filtrer facilement des familles entières d\'instruments à l\'aide de clauses LIKE SQL (ex: `WHERE NAME LIKE \'wait/io/%\'`).',
      examTrap: 'Les instruments memory/* ne disposent pas de métrique de temps (colonne TIMED toujours à NO) car ils mesurent des octets alloués et non une durée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Instrument Naming Conventions',
    },
  },
  {
    id: 'fc-mysql908-dom02-069',
    cardNumber: 69,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Configuration dynamique des instruments dans setup_instruments',
    difficulty: 'medium',
    tags: ['setup_instruments', 'ENABLED', 'TIMED', 'Configuration'],
    front: {
      question: 'Quelles sont les deux colonnes de contrôle dans performance_schema.setup_instruments et comment activer le chronométrage des I/O de table ?',
      codeSnippet: `UPDATE performance_schema.setup_instruments
SET ENABLED = 'YES', TIMED = 'YES'
WHERE NAME LIKE 'wait/io/table/%';`,
      hint: 'ENABLED active la collecte de l\'événement, TIMED active la mesure du temps en picosecondes.',
    },
    back: {
      answer: 'Colonnes de configuration dans `setup_instruments` :\n\n- **`ENABLED`** (`YES`/`NO`) : Indique si la sonde doit être exécutée et si l\'événement doit être collecté.\n- **`TIMED`** (`YES`/`NO`) : Indique si le chronomètre de haute précision (en picosecondes) doit mesurer la durée de l\'événement.\n\n*Activation* : Un simple `UPDATE` SQL sur cette table prend effet **instantanément et dynamiquement** pour toutes les requêtes ultérieures sans redémarrer MySQL.',
      explanation: 'Désactiver `TIMED` tout en laissant `ENABLED = \'YES\'` permet de compter le nombre d\'occurrences d\'un événement sans payer le surcoût du calcul d\'horodatage.',
      examTrap: 'Les modifications faites via UPDATE dans setup_instruments ne sont valables qu\'en mémoire vive ! Au redémarrage, elles sont perdues sauf si vous les configurez dans my.cnf via performance-schema-instrument=...',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The setup_instruments Table',
    },
  },
  {
    id: 'fc-mysql908-dom02-070',
    cardNumber: 70,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Hiérarchie des tables d\'historique : current vs history vs history_long',
    difficulty: 'medium',
    tags: ['Consumers', 'History', 'current', 'history_long'],
    front: {
      question: 'Quelle est la différence de granularité et de rétention entre les tables events_statements_current, events_statements_history et events_statements_history_long ?',
      hint: 'L\'une montre l\'instruction en cours, l\'autre les N dernières par thread, et la troisième les N dernières pour tout le serveur.',
    },
    back: {
      answer: 'Les trois niveaux d\'historique des consommateurs :\n\n1. **`events_statements_current`** : Contient uniquement **l\'instruction en cours d\'exécution** pour chaque thread connecté (1 ligne par thread).\n2. **`events_statements_history`** : Conserve les **$N$ dernières instructions exécutées par chaque thread** (par défaut 10 lignes par thread). Dès qu\'un thread se déconnecte, son historique est purgé.\n3. **`events_statements_history_long`** : Conserve les **$N$ dernières instructions exécutées sur l\'ensemble du serveur**, tous threads confondus, dans un buffer circulaire global (par défaut 10 000 lignes).\n\n*Cette déclinaison existe également pour les événements `events_waits_*`, `events_stages_*` et `events_transactions_*`.*',
      explanation: 'Permet de choisir le niveau de profondeur historique adapté sans saturer la mémoire vive du serveur.',
      examTrap: 'events_statements_history_long peut être écrasé très vite sur un serveur très sollicité. 10 000 requêtes peuvent être consommées en 2 secondes.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Performance Schema Event Tables',
    },
  },
  {
    id: 'fc-mysql908-dom02-071',
    cardNumber: 71,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Filtrage de surveillance par compte utilisateur : table setup_actors',
    difficulty: 'hard',
    tags: ['setup_actors', 'Filtering', 'Targeted Tracing', 'Tuning'],
    front: {
      question: 'Comment configurer le Performance Schema pour surveiller uniquement les requêtes d\'un utilisateur spécifique sans instrumenter le reste des comptes ?',
      codeSnippet: `-- Désactiver la surveillance pour tout le monde
UPDATE performance_schema.setup_actors 
SET ENABLED = 'NO', HISTORY = 'NO' 
WHERE USER = '%';

-- Activer uniquement pour l'utilisateur suspect
INSERT INTO performance_schema.setup_actors (HOST, USER, ROLE, ENABLED, HISTORY)
VALUES ('%', 'problematic_user', '%', 'YES', 'YES');`,
      hint: 'Utilisation de la table performance_schema.setup_actors.',
    },
    back: {
      answer: 'La table **`performance_schema.setup_actors`** contrôle quels comptes utilisateurs sont instrumentés :\n\n- Par défaut, elle contient une ligne `HOST=\'%\', USER=\'%\', ROLE=\'%\', ENABLED=\'YES\', HISTORY=\'YES\'` (tout le monde est surveillé).\n- Pour cibler un utilisateur problématique en minimisant l\'overhead global :\n  1. Passer la ligne par défaut à `ENABLED = \'NO\', HISTORY = \'NO\'`.\n  2. Insérer une règle ciblant précisément le compte applicatif fautif (`USER = \'app_user\'`).\n- Dès lors, seuls les threads ouverts par ce compte enregistreront des événements dans les tables de consommation.',
      explanation: 'Technique d\'isolation hautement recommandée sur des serveurs critiques en production pour traquer un bug spécifique sans surcharger la mémoire.',
      examTrap: 'Modifier setup_actors n\'affecte que les NOUVELLES connexions établies après la modification ! Les connexions déjà ouvertes continuent avec leur état d\'instrumentation initial.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The setup_actors Table',
    },
  },
  {
    id: 'fc-mysql908-dom02-072',
    cardNumber: 72,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Agrégation des requêtes par signature : table events_statements_summary_by_digest',
    difficulty: 'medium',
    tags: ['Digest', 'Query Normalization', 'Summary', 'Performance Schema'],
    front: {
      question: 'Qu\'est-ce que la table events_statements_summary_by_digest dans le Performance Schema et pourquoi est-elle la table la plus précieuse pour le DBA ?',
      codeSnippet: `SELECT DIGEST_TEXT, COUNT_STAR, SUM_TIMER_WAIT/1000000000000 AS total_sec,
       AVG_TIMER_WAIT/1000000000000 AS avg_sec, SUM_ROWS_EXAMINED
FROM performance_schema.events_statements_summary_by_digest
ORDER BY SUM_TIMER_WAIT DESC LIMIT 5;`,
      hint: 'Elle agrège les requêtes en remplaçant les valeurs littérales par des points d\'interrogation.',
    },
    back: {
      answer: 'La table `events_statements_summary_by_digest` agrège les requêtes selon leur **empreinte syntaxique normalisée (Digest)** :\n\n- Le serveur remplace toutes les valeurs littérales par `?` (ex: `SELECT * FROM users WHERE id = 42` et `SELECT * FROM users WHERE id = 100` partagent le même Digest `SELECT * FROM users WHERE id = ?`).\n- Pour chaque signature unique, elle maintient des statistiques cumulées :\n  - `COUNT_STAR` : Nombre total d\'exécutions.\n  - `SUM_TIMER_WAIT` : Temps total cumulé passé par le CPU sur cette requête.\n  - `AVG_TIMER_WAIT` : Temps moyen d\'exécution.\n  - `SUM_ROWS_EXAMINED`, `SUM_CREATED_TMP_DISK_TABLES`, `SUM_SORT_ROWS`.\n- Permet d\'identifier immédiatement le Top 5 des requêtes responsables de la charge globale du serveur.',
      explanation: 'Contrairement aux tables d\'historique circulaires, cette table conserve les compteurs cumulatifs depuis le démarrage du serveur ou le dernier TRUNCATE.',
      examTrap: 'Les unités de temps dans le Performance Schema brut sont en picosecondes (10^-12 s) ! Il faut diviser par 1 000 000 000 000 pour obtenir des secondes (ou utiliser le schéma sys).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Statement Summary Tables',
    },
  },
  {
    id: 'fc-mysql908-dom02-073',
    cardNumber: 73,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Calcul et unicité du Digest Hash d\'une requête SQL',
    difficulty: 'hard',
    tags: ['Digest', 'MD5', 'SHA-256', 'Internals'],
    front: {
      question: 'Comment MySQL calcule-t-il le DIGEST (valeur hexadécimale de 64 caractères) dans le Performance Schema ?',
      hint: 'Hachage cryptographique SHA-256 de la chaîne de jetons normalisée issue de l\'analyse lexicale.',
    },
    back: {
      answer: 'Calcul du Digest Hash :\n\n1. Lors de la phase de parsing, l\'analyseur lexical transforme la requête en une suite de jetons (tokens) normalisés.\n2. Les constantes, commentaires et espaces superflus sont supprimés ou remplacés par `?`.\n3. MySQL applique une fonction de hachage cryptographique **SHA-256** sur cette séquence de jetons.\n4. Le résultat est une chaîne hexadécimale de 64 caractères stockée dans la colonne `DIGEST` (ex: `a1b2c3d4...`).\n5. Deux requêtes ayant la même structure algorithmique mais des valeurs différentes produiront rigoureusement le même `DIGEST`.',
      explanation: 'Ce hash stable permet de corréler une requête à travers le temps et entre différents serveurs d\'un même cluster.',
      examTrap: 'La taille maximale du texte de digest est plafonnée par la variable performance_schema_max_digest_length (par défaut 1024 octets). Les requêtes géantes sont tronquées au-delà.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Statement Digesting',
    },
  },
  {
    id: 'fc-mysql908-dom02-074',
    cardNumber: 74,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Mesure de la consommation mémoire avec memory_summary_global_by_event_name',
    difficulty: 'medium',
    tags: ['Memory', 'RAM', 'Profiling', 'Performance Schema'],
    front: {
      question: 'Quelle table du Performance Schema permet de visualiser en temps réel la quantité exacte de mémoire RAM consommée par chaque sous-système de MySQL ?',
      codeSnippet: `SELECT EVENT_NAME, 
       CURRENT_NUMBER_OF_BYTES_USED / 1024 / 1024 AS current_mb,
       HIGH_NUMBER_OF_BYTES_USED / 1024 / 1024 AS peak_mb
FROM performance_schema.memory_summary_global_by_event_name
ORDER BY CURRENT_NUMBER_OF_BYTES_USED DESC LIMIT 10;`,
      hint: 'memory_summary_global_by_event_name.',
    },
    back: {
      answer: 'La table **`performance_schema.memory_summary_global_by_event_name`** :\n\n- Fournit le détail des allocations de mémoire pour chaque instrument de la famille `memory/*`.\n- Colonnes clés :\n  - `CURRENT_NUMBER_OF_BYTES_USED` : Mémoire actuellement allouée en RAM par ce composant.\n  - `HIGH_NUMBER_OF_BYTES_USED` : Pic maximal (high-water mark) de mémoire allouée depuis le boot.\n  - `COUNT_ALLOC` et `COUNT_FREE` : Nombre total d\'allocations et libérations (détection de fuites de mémoire).\n- Permet de surveiller le Buffer Pool InnoDB, le cache de connexions, les tables temporaires TempTable, etc.',
      explanation: 'Idéal pour comprendre pourquoi le processus mysqld consomme 28 Go de RAM sur une machine hôte de 32 Go.',
      examTrap: 'Par défaut, certains instruments de mémoire ne sont pas activés au boot. Vérifiez leur état dans setup_instruments WHERE NAME LIKE \'memory/%\'.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Memory Summary Tables',
    },
  },
  {
    id: 'fc-mysql908-dom02-075',
    cardNumber: 75,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Surveillance des verrous de métadonnées : metadata_locks',
    difficulty: 'hard',
    tags: ['MDL', 'metadata_locks', 'DDL', 'Troubleshooting'],
    front: {
      question: 'Quelle table du Performance Schema permet d\'identifier la session responsable d\'un blocage "Waiting for table metadata lock" paralysant une opération DDL ?',
      codeSnippet: `SELECT * FROM performance_schema.metadata_locks;`,
      hint: 'Les verrous de métadonnées (MDL) protègent la définition de structure des tables.',
    },
    back: {
      answer: 'La table **`performance_schema.metadata_locks`** :\n\n- Affiche tous les verrous de métadonnées actuellement détenus ou en attente sur les tables, schémas ou fonctions.\n- Colonnes clés :\n  - `OBJECT_SCHEMA` et `OBJECT_NAME` : La table concernée.\n  - `LOCK_TYPE` : Type de verrou (`SHARED_READ`, `SHARED_WRITE`, `EXCLUSIVE`).\n  - `LOCK_STATUS` : `GRANTED` (verrou obtenu) ou `PENDING` (session bloquée en attente).\n  - `OWNER_THREAD_ID` : L\'identifiant du thread qui détient le verrou bloquant.\n- Pour débloquer la situation, le DBA identifie le `PROCESSLIST_ID` correspondant et exécute `KILL connection_id;`.',
      explanation: 'Un simple `SELECT` laissé ouvert dans une transaction non validée bloque tout `ALTER TABLE` ultérieur en attente de verrou exclusif MDL.',
      examTrap: 'L\'instrument wait/lock/metadata/sql/mdl est activé par défaut sous MySQL 8.0, rendant cette table immédiatement disponible en cas de crise de production.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The metadata_locks Table',
    },
  },
  {
    id: 'fc-mysql908-dom02-076',
    cardNumber: 76,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Activation globale du Performance Schema et paramètre en lecture seule',
    difficulty: 'easy',
    tags: ['Performance Schema', 'Startup', 'ReadOnly', 'my.cnf'],
    front: {
      question: 'Peut-on activer ou désactiver entièrement le moteur du Performance Schema à chaud avec SET GLOBAL ?',
      codeSnippet: `performance_schema = ON`,
      hint: 'Il alloue ses structures de données de base au démarrage du processus.',
    },
    back: {
      answer: 'Non, c\'est **impossible** :\n\n- La variable système `performance_schema` est strictement **ReadOnly (en lecture seule)**.\n- Elle ne peut être définie que dans le fichier d\'options `my.cnf` sous la section `[mysqld]` ou comme paramètre de ligne de commande lors de l\'invocation du binaire `mysqld`.\n- Pour l\'activer ou la désactiver, un redémarrage complet du serveur est obligatoire.\n- Sous MySQL 8.0, elle est activée par défaut (`performance_schema = ON`).',
      explanation: 'Les pools de mémoire internes du Performance Schema sont pré-alloués et dimensionnés pendant la phase d\'initialisation du serveur.',
      examTrap: 'Tenter d\'exécuter `SET GLOBAL performance_schema = OFF;` échouera avec l\'erreur `ER_INCORRECT_GLOBAL_LOCAL_VAR` (Variable is a read only variable).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: performance_schema',
    },
  },
  {
    id: 'fc-mysql908-dom02-077',
    cardNumber: 77,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Suivi des erreurs SQL d\'application : events_errors_summary_by_account_by_error',
    difficulty: 'medium',
    tags: ['Errors', 'Diagnostics', 'Application', 'Performance Schema'],
    front: {
      question: 'Comment savoir quelles erreurs SQL (ex: violations de contrainte UNIQUE, erreurs de syntaxe) une application génère le plus fréquemment sans consulter le code applicatif ?',
      codeSnippet: `SELECT * FROM performance_schema.events_errors_summary_by_account_by_error
WHERE ERROR_NUMBER != 0
ORDER BY SUM_ERROR_RAISED DESC;`,
      hint: 'Table d\'agrégation des erreurs du Performance Schema introduite dans MySQL 8.0.',
    },
    back: {
      answer: 'La table **`performance_schema.events_errors_summary_by_account_by_error`** (et ses variantes `_by_user`, `_global`) :\n\n- Enregistre et comptabilise chaque code d\'erreur SQL levé par le serveur vers les clients.\n- Colonnes clés :\n  - `ERROR_NUMBER` : Numéro de l\'erreur (ex: `1062` pour Duplicate entry, `1048` pour Column cannot be null).\n  - `ERROR_NAME` : Nom symbolique de l\'erreur (`ER_DUP_ENTRY`).\n  - `SUM_ERROR_RAISED` : Nombre total de fois où cette erreur a été déclenchée.\n  - `FIRST_SEEN` et `LAST_SEEN` : Horodatages de première et dernière apparition.\n- Permet de détecter les bugs de développement en production.',
      explanation: 'Indispensable pour identifier les applications qui bombardent la base avec des requêtes invalides ou des échecs d\'insertion silencieux.',
      examTrap: 'Cette table trace les erreurs renvoyées au client, même si l\'application gère l\'exception en interne et ne la logue pas dans ses propres fichiers de log.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Error Summary Tables',
    },
  },
  {
    id: 'fc-mysql908-dom02-078',
    cardNumber: 78,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Réinitialisation des compteurs du Performance Schema avec TRUNCATE',
    difficulty: 'easy',
    tags: ['TRUNCATE', 'Reset', 'Performance Schema', 'Counters'],
    front: {
      question: 'Comment remettre à zéro les compteurs statistiques d\'une table de synthèse du Performance Schema sans redémarrer le serveur ?',
      codeSnippet: `TRUNCATE TABLE performance_schema.events_statements_summary_by_digest;`,
      hint: 'La commande TRUNCATE TABLE est supportée sur les tables de synthèse.',
    },
    back: {
      answer: 'En exécutant l\'instruction **`TRUNCATE TABLE`** sur la table de synthèse ciblée :\n\n- Exemples :\n  - `TRUNCATE TABLE performance_schema.events_statements_summary_by_digest;`\n  - `TRUNCATE TABLE performance_schema.events_waits_summary_global_by_event_name;`\n- Effet : Réinitialise instantanément tous les compteurs cumulés (`COUNT_STAR = 0`, `SUM_TIMER_WAIT = 0`, etc.) à zéro.\n- Permet d\'isoler et de mesurer l\'impact d\'une session de tests de charge (benchmarking) en repartant d\'un compteur vierge.',
      explanation: 'Requiert le privilège `DROP` sur la table concernée du schéma performance_schema.',
      examTrap: 'Seules les tables de synthèse et d\'historique acceptent le TRUNCATE. Les tables de configuration de base (setup_instruments, etc.) ne peuvent pas être tronquées.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Truncating Performance Schema Tables',
    },
  },

  // =========================================================================
  // SECTION 7 : LE SCHÉMA SYS (SYS SCHEMA - VUES & DIAGNOSTICS) (Cartes 79 à 88)
  // Vues simplifiées, vues x$, index inutilisés, redondance, statement_analysis,
  // verrous, format_time, format_bytes, sys.diagnostics()
  // =========================================================================
  {
    id: 'fc-mysql908-dom02-079',
    cardNumber: 79,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Nature et architecture du schéma sys (Sys Schema)',
    difficulty: 'easy',
    tags: ['sys schema', 'Views', 'Abstraction', 'Usability'],
    front: {
      question: 'Qu\'est-ce que le schéma sys (sys schema) de MySQL 8.0 et quelle est sa relation avec le Performance Schema et l\'Information Schema ?',
      hint: 'Une couche d\'abstraction composée de vues et fonctions facilitant la lecture des données brutes de performance.',
    },
    back: {
      answer: 'Le schéma `sys` est une **couche d\'abstraction de haut niveau** intégrée par défaut dans MySQL 8.0 :\n\n- Il est constitué d\'un ensemble de **vues SQL**, de **fonctions utilitaires** et de **procédures stockées**.\n- Il ne stocke aucune donnée physique propre : il interroge et formate les tables complexes et ésotériques de `performance_schema` et `information_schema`.\n- Son objectif : Traduire les picosecondes et octets bruts en unités lisibles par un être humain (secondes, minutes, Ko, Mo, Go) et fournir des diagnostics prêts à l\'emploi pour le DBA.',
      explanation: 'Créé initialement par Mark Leith chez Oracle, il évite aux administrateurs d\'écrire des requêtes SQL de 50 lignes avec des jointures complexes pour un simple diagnostic de lenteur.',
      examTrap: 'Si le Performance Schema est désactivé (performance_schema=OFF), la plupart des vues du schéma sys renverront des résultats vides ou des erreurs !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The sys Schema',
    },
  },
  {
    id: 'fc-mysql908-dom02-080',
    cardNumber: 80,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Vues régulières vs Vues x$ dans le schéma sys',
    difficulty: 'medium',
    tags: ['sys schema', 'x$ views', 'Formatting', 'Monitoring Tools'],
    front: {
      question: 'Quelle est la différence fondamentale entre une vue standard du schéma sys et sa variante préfixée par x$ (ex: host_summary vs x$host_summary) ?',
      codeSnippet: `SELECT * FROM sys.host_summary;
SELECT * FROM sys.x$host_summary;`,
      hint: 'L\'une formate avec des unités de texte (ex: \'1.25 GiB\', \'3.42 s\'), l\'autre fournit des chiffres bruts pour les scripts.',
    },
    back: {
      answer: 'Différence essentielle :\n\n- **Vues standard (ex: `sys.statement_analysis`)** : Destinées à l\'**analyse humaine directe**. Elles convertissent les temps en durées textuelles lisibles (`5.20 s`, `12.45 m`) et les volumes en unités de stockage (`1.50 GiB`, `450.00 MiB`).\n- **Vues x$ (ex: `sys.x$statement_analysis`)** : Destinées aux **outils de monitoring automatisés** (Grafana, Prometheus, Datadog) ou aux calculs SQL personnalisés. Elles retournent des nombres entiers purs non formatés (temps en picosecondes, tailles en octets).\n\n*Règle de performance* : Les vues `x$` sont plus rapides à interroger car elles s\'affranchissent des fonctions de formatage de chaînes.',
      explanation: 'Si vous voulez faire un `ORDER BY` numérique ou calculer des moyennes arithmétiques, utilisez toujours les vues `x$`.',
      examTrap: 'Trier sur une colonne formatée de vue standard (ORDER BY total_latency) peut produire un tri alphabétique erroné où "10 s" arrive avant "2 s" ! Utilisez la vue x$ correspondante.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - sys Schema View Conventions',
    },
  },
  {
    id: 'fc-mysql908-dom02-081',
    cardNumber: 81,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Détection des index inutilisés avec sys.schema_unused_indexes',
    difficulty: 'easy',
    tags: ['Indexes', 'sys.schema_unused_indexes', 'Optimization', 'DML'],
    front: {
      question: 'Comment repérer facilement tous les index secondaires d\'une base de données qui n\'ont jamais été utilisés depuis le démarrage du serveur ?',
      codeSnippet: `SELECT object_schema, object_name, index_name 
FROM sys.schema_unused_indexes 
WHERE object_schema NOT IN ('mysql', 'sys');`,
      hint: 'Vue sys.schema_unused_indexes.',
    },
    back: {
      answer: 'En interrogeant la vue **`sys.schema_unused_indexes`** :\n\n- Elle filtre et liste tous les index secondaires pour lesquels le Performance Schema n\'a enregistré aucun événement de lecture (`wait/io/table/%`).\n- **Pourquoi est-ce crucial** :\n  Chaque index inutile ralentit chaque `INSERT`, `UPDATE` et `DELETE` sur la table, consomme de la mémoire dans le Buffer Pool et occupe de l\'espace disque.\n- Les supprimer permet de libérer des ressources et d\'accélérer les écritures.\n- Elle n\'affiche jamais les clés primaires (`PRIMARY`).',
      explanation: 'Attention : il faut s\'assurer que le serveur a fonctionné sur une période représentative (ex: incluant les clôtures comptables de fin de mois) avant de supprimer un index.',
      examTrap: 'Si le serveur vient tout juste de redémarrer il y a 10 minutes, TOUS les index apparaîtront comme inutilisés ! Laissez tourner la production plusieurs jours avant d\'auditer.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The schema_unused_indexes View',
    },
  },
  {
    id: 'fc-mysql908-dom02-082',
    cardNumber: 82,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Détection des index redondants et dupliqués avec sys.schema_redundant_indexes',
    difficulty: 'medium',
    tags: ['Indexes', 'Redundancy', 'sys.schema_redundant_indexes', 'Tuning'],
    front: {
      question: 'Qu\'est-ce qu\'un index redondant et comment la vue sys.schema_redundant_indexes aide-t-elle le DBA à les éliminer ?',
      codeSnippet: `SELECT table_schema, table_name, redundant_index_name, dominant_index_name, subpart_exists
FROM sys.schema_redundant_indexes;`,
      hint: 'Un index sur (A) est redondant si un index composite sur (A, B) existe déjà sur la même table.',
    },
    back: {
      answer: 'Définition et diagnostic :\n\n- **Index redondant** : Un index dont les colonnes forment un préfixe strict d\'un autre index composite existant (ex: un index sur `(last_name)` est totalement redondant si un index sur `(last_name, first_name)` existe sur la même table).\n- Le B-tree de l\'index composite permet déjà d\'effectuer des recherches exactes sur le premier champ.\n- La vue **`sys.schema_redundant_indexes`** identifie ces doublons et affiche le nom de l\'index dominant (`dominant_index_name`) ainsi que l\'instruction `sql_drop_index` prête à être exécutée.',
      explanation: 'Supprimer l\'index redondant allège le coût de maintenance lors des DML sans dégrader aucune requête de lecture.',
      examTrap: 'Si l\'index le plus court possède une contrainte UNIQUE mais que l\'index composite ne l\'a pas, l\'index court n\'est PAS redondant car il assure l\'intégrité des données.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The schema_redundant_indexes View',
    },
  },
  {
    id: 'fc-mysql908-dom02-083',
    cardNumber: 83,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Analyse des requêtes les plus lentes avec sys.statement_analysis',
    difficulty: 'easy',
    tags: ['sys.statement_analysis', 'Profiling', 'Tuning', 'Top Queries'],
    front: {
      question: 'Quelle vue du schéma sys permet d\'obtenir immédiatement le profil d\'exécution des requêtes les plus consommatrices de temps avec des temps formatés et lisibles ?',
      codeSnippet: `SELECT query, exec_count, total_latency, avg_latency, rows_examined, rows_sent
FROM sys.statement_analysis
ORDER BY total_latency DESC LIMIT 10;`,
      hint: 'Vue d\'analyse globale des requêtes basée sur events_statements_summary_by_digest.',
    },
    back: {
      answer: 'La vue **`sys.statement_analysis`** :\n\n- Fournit le classement des requêtes normalisées les plus coûteuses du serveur.\n- Colonnes majeures :\n  - `query` : Texte normalisé du digest de la requête.\n  - `exec_count` : Nombre total d\'exécutions.\n  - `total_latency` : Temps total cumulé passé par MySQL sur cette requête.\n  - `avg_latency` : Temps moyen par exécution.\n  - `rows_examined` et `rows_sent` : Lignes lues vs lignes utiles retournées.\n  - `full_scan` : Indique si la requête effectue un scan complet de table.',
      explanation: 'C\'est la première vue que consulte un consultant en performance pour savoir sur quelles requêtes concentrer ses efforts d\'indexation.',
      examTrap: 'Une requête très rapide de 2 ms exécutée 1 million de fois cumulera 2000 secondes et sera en tête de liste ! Ne vous fiez pas qu\'à avg_latency : total_latency montre la charge réelle imposée au serveur.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The statement_analysis View',
    },
  },
  {
    id: 'fc-mysql908-dom02-084',
    cardNumber: 84,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Traque des scans complets de tables avec sys.statements_with_full_table_scans',
    difficulty: 'medium',
    tags: ['Full Table Scan', 'sys views', 'Optimization', 'I/O'],
    front: {
      question: 'Comment lister spécifiquement les requêtes qui génèrent des scans complets de tables (Full Table Scans) et qui parcourent le plus grand nombre de lignes ?',
      codeSnippet: `SELECT query, exec_count, total_latency, no_index_used_count, rows_examined
FROM sys.statements_with_full_table_scans
ORDER BY rows_examined DESC LIMIT 5;`,
      hint: 'Vue sys.statements_with_full_table_scans.',
    },
    back: {
      answer: 'La vue **`sys.statements_with_full_table_scans`** :\n\n- Filtre exclusivement les requêtes dont l\'exécution a nécessité un scan complet de table ou de clé sans condition sélective.\n- Colonnes d\'alerte :\n  - `no_index_used_count` : Nombre de fois où la requête a tourné sans index.\n  - `no_good_index_used_count` : Nombre de fois où un index existait mais a été jugé inefficace par l\'optimiseur.\n  - `rows_examined` : Nombre astronomique de lignes lues séquentiellement en mémoire.\n- Permet d\'éradiquer les requêtes dévastatrices pour le Buffer Pool.',
      explanation: 'Ces requêtes sont les premières candidates pour l\'ajout d\'un index ou l\'utilisation d\'un index couvrant.',
      examTrap: 'Un scan complet sur une table de 10 lignes est normal et efficace. Concentrez-vous sur les requêtes dont rows_examined dépasse plusieurs milliers.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The statements_with_full_table_scans View',
    },
  },
  {
    id: 'fc-mysql908-dom02-085',
    cardNumber: 85,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Diagnostic des blocages et verrous avec sys.innodb_lock_waits',
    difficulty: 'hard',
    tags: ['Locks', 'Blocking', 'sys.innodb_lock_waits', 'Troubleshooting'],
    front: {
      question: 'Quelle vue du schéma sys permet de corréler directement la session bloquée et la session responsable du blocage lors d\'une contention sur un verrou de ligne InnoDB ?',
      codeSnippet: `SELECT waiting_trx_id, waiting_pid, waiting_query,
       blocking_trx_id, blocking_pid, blocking_query, wait_age
FROM sys.innodb_lock_waits;`,
      hint: 'sys.innodb_lock_waits expose les colonnes waiting_* et blocking_*.',
    },
    back: {
      answer: 'La vue **`sys.innodb_lock_waits`** :\n\n- Fournit une mise en relation limpide entre la victime et le coupable du blocage :\n  - `waiting_pid` : Process ID de la connexion en attente bloquée.\n  - `waiting_query` : Requête actuellement bloquée.\n  - `blocking_pid` : **Process ID de la connexion qui détient le verrou et bloque les autres !**\n  - `blocking_query` : Dernière requête exécutée par la session bloquante.\n  - `wait_age` : Durée du blocage en secondes.\n- Le DBA peut immédiatement exécuter `KILL <blocking_pid>;` pour débloquer l\'ensemble des files d\'attente.',
      explanation: 'Avant cette vue, le DBA devait croiser manuellement information_schema.innodb_locks, innodb_lock_waits et innodb_trx.',
      examTrap: 'La session bloquante peut être "en veille" (Sleep) si elle a exécuté un UPDATE dans une transaction puis n\'a jamais fait de COMMIT ! Son blocking_query peut être NULL, mais son blocking_pid est bien renseigné.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The innodb_lock_waits View',
    },
  },
  {
    id: 'fc-mysql908-dom02-086',
    cardNumber: 86,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Surveillance de la mémoire globale avec sys.memory_global_by_current_bytes',
    difficulty: 'medium',
    tags: ['Memory', 'sys.memory_global_by_current_bytes', 'RAM', 'Buffer Pool'],
    front: {
      question: 'Quelle vue du schéma sys affiche la mémoire allouée par type d\'événement avec des tailles lisibles (Mo, Go) classées de la plus gourmande à la plus petite ?',
      codeSnippet: `SELECT event_name, current_count, current_alloc, high_alloc
FROM sys.memory_global_by_current_bytes
LIMIT 5;`,
      hint: 'sys.memory_global_by_current_bytes.',
    },
    back: {
      answer: 'La vue **`sys.memory_global_by_current_bytes`** :\n\n- Classe tous les sous-systèmes de MySQL selon leur occupation mémoire instantanée en RAM.\n- Colonnes formatées :\n  - `current_alloc` : Espace RAM consommé actuellement (ex: `12.00 GiB` pour `memory/innodb/buf_buf_pool`).\n  - `high_alloc` : Pic maximal historique atteint par ce composant.\n  - `current_count` : Nombre de blocs actuellement alloués.\n- Permet d\'identifier immédiatement une fuite mémoire ou une table temporaire interne démesurée.',
      explanation: 'Très utile pour vérifier en direct si l\'allocation du Buffer Pool correspond bien à ce qui a été demandé dans my.cnf.',
      examTrap: 'N\'oubliez pas que la mémoire globale inclut les buffers de session (sort_buffer_size, join_buffer_size) multipliés par le nombre de connexions actives.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The memory_global_by_current_bytes View',
    },
  },
  {
    id: 'fc-mysql908-dom02-087',
    cardNumber: 87,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Fonctions de conversion et de formatage : sys.format_time et sys.format_bytes',
    difficulty: 'easy',
    tags: ['sys functions', 'format_time', 'format_bytes', 'Usability'],
    front: {
      question: 'Quelles sont les deux fonctions utilitaires du schéma sys utilisées pour convertir des picosecondes en durées lisibles et des octets en tailles compréhensibles ?',
      codeSnippet: `SELECT sys.format_time(1234567890123) AS latency,
       sys.format_bytes(1073741824) AS size;`,
      hint: 'sys.format_time() et sys.format_bytes().',
    },
    back: {
      answer: 'Les deux fonctions utilitaires standard sont :\n\n1. **`sys.format_time(picoseconds)`** :\n   - Prend un entier représentant des picosecondes ($10^{-12}$ s) et renvoie une chaîne formatée automatiquement avec l\'unité la plus appropriée (`ps`, `ns`, `us`, `ms`, `s`, `m`, `h`, `d`).\n   - Ex: `1234567890123` ps $\\rightarrow$ `1.23 s`.\n2. **`sys.format_bytes(bytes)`** :\n   - Prend un entier d\'octets et renvoie une chaîne formatée (`bytes`, `KiB`, `MiB`, `GiB`, `TiB`).\n   - Ex: `1073741824` $\\rightarrow$ `1.00 GiB`.',
      explanation: 'Vous pouvez utiliser ces fonctions directement dans vos propres requêtes personnalisées sur le Performance Schema.',
      examTrap: 'Attention : le Performance Schema utilise les picosecondes (10^-12), pas les microsecondes (10^-6) ni les millisecondes (10^-3) ! La fonction sys.format_time attend strictement des picosecondes.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - sys Schema Formatting Functions',
    },
  },
  {
    id: 'fc-mysql908-dom02-088',
    cardNumber: 88,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Rapport complet d\'audit automatisé : procédure sys.diagnostics()',
    difficulty: 'hard',
    tags: ['sys.diagnostics', 'Procedure', 'Health Check', 'Audit'],
    front: {
      question: 'Que réalise la procédure stockée sys.diagnostics() et comment l\'invoque-t-on pour capturer un audit complet du système sur un intervalle donné ?',
      codeSnippet: `CALL sys.diagnostics(120, 30, 'current');`,
      hint: 'Elle capture plusieurs snapshots des variables, métriques de statut et requêtes pour générer un rapport exhaustif.',
    },
    back: {
      answer: 'La procédure `sys.diagnostics(max_runtime, interval, auto_config)` capture un diagnostic global complet du serveur :\n\n- Paramètres :\n  - `max_runtime` (ex: 120 secondes) : Durée totale de la session de diagnostic.\n  - `interval` (ex: 30 secondes) : Fréquence de capture des snapshots intermédiaires.\n  - `auto_config` (`\'current\'`, `\'medium\'`, `\'full\'`) : Active temporairement des instruments supplémentaires si nécessaire.\n- **Contenu du rapport généré** :\n  - Configuration système et variables globales.\n  - Différentiel des compteurs de statut (`SHOW GLOBAL STATUS`).\n  - Profils de requêtes lentes, index inutilisés, verrous actifs, I/O disques et allocations de mémoire.',
      explanation: 'C\'est l\'outil standard d\'assistance Oracle Support pour comprendre un comportement erratique sans installer d\'outils tiers.',
      examTrap: 'sys.diagnostics() peut générer des dizaines de milliers de lignes de sortie. Redirigez toujours sa sortie vers un fichier texte dans le terminal : mysql -e "CALL sys.diagnostics(60, 10, \'current\')" > diag.txt',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The diagnostics() Procedure',
    },
  },

  // =========================================================================
  // SECTION 8 : OPTIMISEUR SQL, EXPLAIN & EXPLAIN ANALYZE (Cartes 89 à 100)
  // Cost-Based Optimizer, EXPLAIN formats, EXPLAIN ANALYZE (MySQL 8.0.18),
  // join types hierarchy, Extra, ICP, Hash Join, Histogrammes, Hints
  // =========================================================================
  {
    id: 'fc-mysql908-dom02-089',
    cardNumber: 89,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Le modèle de coût de l\'optimiseur (Cost-Based Optimizer - CBO)',
    difficulty: 'medium',
    tags: ['Optimizer', 'CBO', 'Cost Model', 'server_cost'],
    front: {
      question: 'Comment l\'optimiseur de requêtes MySQL (Cost-Based Optimizer) choisit-il son plan d\'exécution et quelles tables permettent d\'ajuster ses constantes de coût ?',
      hint: 'Il calcule le coût estimé en unités de coût (CPU et I/O disque) pour chaque chemin possible.',
    },
    back: {
      answer: 'Fonctionnement du Cost-Based Optimizer (CBO) :\n\n- Pour une requête donnée, le CBO évalue plusieurs plans d\'accès possibles (index vs table scan, ordre des jointures) et **calcule un coût numérique estimé** basé sur les coûts I/O disque et CPU attendus.\n- Le plan affichant le coût estimé le plus faible est sélectionné pour l\'exécution.\n- **Tables de configuration du coût (dans le schéma `mysql`)** :\n  1. **`mysql.server_cost`** : Coûts généraux d\'opérations CPU du serveur (`row_evaluate_cost`, `key_compare_cost`, `disk_temptable_create_cost`).\n  2. **`mysql.engine_cost`** : Coûts d\'accès aux blocs de stockage (`io_block_read_cost`, `memory_block_read_cost`).',
      explanation: 'Sur des serveurs équipés de disques SSD NVMe ultra-rapides, certains DBAs réduisent `io_block_read_cost` pour que l\'optimiseur prenne plus volontiers en compte des accès disques rapides.',
      examTrap: 'Après avoir modifié les tables server_cost ou engine_cost, il faut impérativement exécuter `FLUSH OPTIMIZER_COSTS;` pour charger les nouvelles constantes en mémoire.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The Optimizer Cost Model',
    },
  },
  {
    id: 'fc-mysql908-dom02-090',
    cardNumber: 90,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Formats de sortie de la commande EXPLAIN',
    difficulty: 'easy',
    tags: ['EXPLAIN', 'JSON', 'TREE', 'Formats'],
    front: {
      question: 'Quels sont les trois formats de sortie supportés par la commande EXPLAIN sous MySQL 8.0 ?',
      codeSnippet: `EXPLAIN SELECT ...;
EXPLAIN FORMAT=JSON SELECT ...;
EXPLAIN FORMAT=TREE SELECT ...;`,
      hint: 'Tableau tabulaire traditionnel, structure arborescente JSON, et arbre d\'exécution hiérarchique TREE.',
    },
    back: {
      answer: 'Formats de sortie supportés :\n\n1. **`TRADITIONAL`** (Défaut) : Tableau classique à colonnes (`id`, `select_type`, `table`, `type`, `possible_keys`, `key`, `rows`, `Extra`).\n2. **`FORMAT=JSON`** : Structure hiérarchique détaillée en JSON exposant les coûts d\'optimiseur calculés (`query_cost`, `read_cost`, `eval_cost`) et les expressions de calcul de jointure.\n3. **`FORMAT=TREE`** (Introduit dans MySQL 8.0.16) : Arbre d\'exécution hiérarchique textuel montrant exactement l\'imbrication des itérateurs d\'exécution (Table scan, Index lookup, Filter, Sort, Nested loop inner join).',
      explanation: 'Le format TREE est devenu le format le plus intuitif sous MySQL 8.0 pour visualiser immédiatement l\'ordre d\'imbrication des opérations.',
      examTrap: 'EXPLAIN ne montre que ce que l\'optimiseur *estime* qu\'il va se passer. La requête n\'est PAS exécutée ! Pour mesurer la réalité, il faut utiliser EXPLAIN ANALYZE.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - EXPLAIN Statement',
    },
  },
  {
    id: 'fc-mysql908-dom02-091',
    cardNumber: 91,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Révolution du profiling : EXPLAIN ANALYZE sous MySQL 8.0.18+',
    difficulty: 'hard',
    tags: ['EXPLAIN ANALYZE', 'Volcano Iterator', 'Profiling', 'MySQL 8.0.18'],
    front: {
      question: 'Qu\'apporte EXPLAIN ANALYZE par rapport à un EXPLAIN classique et quelles métriques réelles mesure-t-il sur chaque nœud de l\'arbre ?',
      codeSnippet: `EXPLAIN ANALYZE
SELECT c.customer_id, o.amount
FROM customer c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= '2026-01-01';`,
      hint: 'Il exécute réellement la requête et compare l\'estimation à la réalité (actual time, rows, loops).',
    },
    back: {
      answer: 'EXPLAIN ANALYZE (MySQL 8.0.18+) **exécute réellement la requête** et profile chaque étape de l\'arbre d\'itérateurs :\n\nSur chaque nœud, il affiche deux volets de données :\n1. **L\'estimation de l\'optimiseur** : `(cost=... rows=...)`.\n2. **La mesure réelle chronométrée** : `(actual time=t1..t2 rows=N loops=L)` :\n   - `t1` : Temps en millisecondes pour renvoyer la **première ligne** de cette étape.\n   - `t2` : Temps en millisecondes pour renvoyer la **dernière ligne** de cette étape.\n   - `rows` : Nombre réel de lignes produites par cet itérateur.\n   - `loops` : Nombre de fois où cet itérateur a été répété en boucle.',
      explanation: 'Permet de détecter immédiatement les erreurs d\'estimation de l\'optimiseur (ex: l\'optimiseur estimait 10 lignes, mais en réalité 500 000 lignes ont été lues).',
      examTrap: 'ATTENTION : EXPLAIN ANALYZE EXÉCUTE VRAIMENT LA REQUÊTE ! Ne lancez jamais un EXPLAIN ANALYZE sur un DELETE massif en production pensant que c\'est un simple test sans conséquence !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - EXPLAIN ANALYZE Syntax and Output Format',
    },
  },
  {
    id: 'fc-mysql908-dom02-092',
    cardNumber: 92,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Hiérarchie absolue des types d\'accès (colonne type) dans EXPLAIN',
    difficulty: 'medium',
    tags: ['type', 'EXPLAIN', 'Hierarchy', 'Access Methods'],
    front: {
      question: 'Quel est l\'ordre hiérarchique des types d\'accès (colonne type dans EXPLAIN), du plus rapide et performant au plus lent et destructeur ?',
      hint: 'Du meilleur (const) au pire (ALL).',
    },
    back: {
      answer: 'Hiérarchie officielle des types d\'accès (du meilleur au pire) :\n\n1. **`system`** : Table à 1 seule ligne (cas particulier de const).\n2. **`const`** : Recherche par clé primaire (`PRIMARY`) ou index `UNIQUE` avec une valeur constante (1 seule ligne possible, temps quasi nul).\n3. **`eq_ref`** : Jointure sur clé primaire ou index unique (1 seule ligne lue par ligne de la table précédente).\n4. **`ref`** : Recherche via un index non unique ou préfixe de clé.\n5. **`fulltext`** : Recherche par index plein texte.\n6. **`ref_or_null`** : Comme `ref`, mais recherche en plus les valeurs `NULL`.\n7. **`index_merge`** : Fusion de plusieurs index séparés.\n8. **`range`** : Balayage d\'un intervalle indexé (`BETWEEN`, `>`, `<`, `IN()`).\n9. **`index`** : **Full Index Scan** (balaye tout l\'arbre de l\'index de A à Z).\n10. **`ALL`** : **Full Table Scan** (balayage complet de toute la table physique sur disque).',
      explanation: 'Le but premier de tout DBA lors du tuning d\'une requête lente est d\'éliminer le type `ALL` et de hisser le type vers `range`, `ref`, `eq_ref` ou `const`.',
      examTrap: 'Le type eq_ref est le meilleur type de jointure possible entre deux tables ! Ne pas le confondre avec ref (qui est pour un index non unique).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - EXPLAIN Join Types',
    },
  },
  {
    id: 'fc-mysql908-dom02-093',
    cardNumber: 93,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Le piège classique de l\'examen : type = index vs type = ALL',
    difficulty: 'medium',
    tags: ['Exam Trap', 'type=index', 'type=ALL', 'EXPLAIN'],
    front: {
      question: 'Pourquoi voir "type: index" dans un plan EXPLAIN n\'est-il PAS synonyme d\'une recherche rapide par index et en quoi diffère-t-il de type: ALL ?',
      codeSnippet: `id: 1, select_type: SIMPLE, table: orders, type: index, key: idx_status, rows: 500000`,
      hint: 'type: index signifie Full Index Scan : toutes les entrées de l\'index sont scannées.',
    },
    back: {
      answer: 'Différence critique :\n\n- **`type: index` = Full Index Scan** :\n  MySQL lit **l\'intégralité des nœuds feuilles de l\'arbre d\'index, du début à la fin**.\n  Ce n\'est PAS un lookup par clé sélective ! Il parcourt toutes les entrées de l\'index (souvent pour éviter un filesort ou parce que toutes les colonnes requises sont dans l\'index).\n  Bien que généralement plus rapide que `ALL` car un fichier d\'index est plus compact en mémoire qu\'une table entière, cela reste un balayage complet massif.\n- **`type: ALL` = Full Table Scan** :\n  MySQL lit l\'intégralité de la table physique sur disque page par page.',
      explanation: 'Une recherche rapide par index affiche `type: ref`, `eq_ref`, `const` ou `range`. Si vous voyez `type: index`, l\'index est scanné en entier.',
      examTrap: 'Piège d\'examen numéro 1 : Croire que "type: index" est optimal parce qu\'il y a le mot "index". C\'est un scan complet ! Seul son volume I/O est légèrement inférieur à ALL.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - EXPLAIN Join Types (type: index)',
    },
  },
  {
    id: 'fc-mysql908-dom02-094',
    cardNumber: 94,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Interprétation des colonnes key_len, ref et filtered dans EXPLAIN',
    difficulty: 'hard',
    tags: ['key_len', 'filtered', 'EXPLAIN', 'Composite Index'],
    front: {
      question: 'Que signifient exactement les colonnes key_len et filtered dans la sortie d\'un EXPLAIN ?',
      codeSnippet: `table: users, key: idx_name_age, key_len: 203, rows: 1000, filtered: 10.00`,
      hint: 'key_len indique la fraction d\'octets utilisée d\'un index composite, filtered est le pourcentage de lignes retenues après filtrage.',
    },
    back: {
      answer: 'Interprétation précise :\n\n- **`key_len`** : Longueur en octets de la clé d\'index effectivement utilisée par MySQL pour filtrer les lignes :\n  - Permet de vérifier combien de colonnes d\'un index composite sont réellement exploitées (ex: sur un index `(col1 VARCHAR(50), col2 INT)`, si `key_len` ne fait que la taille de `col1`, la deuxième colonne `col2` n\'a pas pu être utilisée).\n  - Rappel : sous `utf8mb4`, 1 caractère VARCHAR(50) réserve jusqu\'à $50 \\times 4 = 200$ octets + 2 octets de longueur + 1 octet si nullable = 203 octets.\n- **`filtered`** : Pourcentage estimé de lignes qui satisferont les conditions du filtre restant après l\'accès par index (ex: `10.00%` signifie que sur 1 000 lignes lues, seules 100 passeront à l\'étape suivante).',
      explanation: 'Un `filtered: 100%` combiné à un bon index signifie qu\'aucune ligne inutile n\'a été lue pour rien.',
      examTrap: 'Ne pas confondre rows et filtered : le nombre de lignes estimées transmises à la jointure suivante est : rows * (filtered / 100).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - EXPLAIN Output Columns',
    },
  },
  {
    id: 'fc-mysql908-dom02-095',
    cardNumber: 95,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Les mentions critiques de la colonne Extra : Using index vs Using filesort',
    difficulty: 'medium',
    tags: ['Extra', 'Using index', 'Using filesort', 'Using temporary'],
    front: {
      question: 'Que signifient les mentions "Using index", "Using filesort" et "Using temporary" dans la colonne Extra d\'un EXPLAIN ?',
      hint: 'L\'une est l\'idéal absolu (Covering Index), les deux autres sont des alertes de surcoût I/O et mémoire.',
    },
    back: {
      answer: 'Signification des mentions clés de la colonne Extra :\n\n- **`Using index` (Couvrant / Covering Index)** : **L\'idéal absolu de performance.** Toutes les colonnes demandées dans la requête se trouvent directement à l\'intérieur de l\'arbre d\'index. MySQL n\'a pas besoin de faire de "double lookup" pour lire la ligne physique dans la table principale (Clustered Index).\n- **`Using filesort`** : MySQL doit effectuer une passe de tri supplémentaire en mémoire ou sur disque (dans `sort_buffer_size`) pour ordonner les résultats (`ORDER BY`), car aucun index n\'était ordonné comme requis.\n- **`Using temporary`** : MySQL doit créer une table temporaire en mémoire ou sur disque pour résoudre la requête (fréquent avec `GROUP BY` sur colonnes non indexées ou jointures complexes).',
      explanation: 'Éliminer un "Using filesort" et un "Using temporary" via un index composite adapté est l\'un des gains de performance les plus spectaculaires en base de données.',
      examTrap: 'Ne confondez pas "Using index" dans la colonne Extra (très bon : covering index) avec "type: index" dans la colonne type (mauvais : full index scan) !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - EXPLAIN Extra Information',
    },
  },
  {
    id: 'fc-mysql908-dom02-096',
    cardNumber: 96,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Optimisation Index Condition Pushdown (ICP) : Using index condition',
    difficulty: 'hard',
    tags: ['ICP', 'Using index condition', 'Optimization', 'Storage Engine'],
    front: {
      question: 'Comment fonctionne l\'optimisation Index Condition Pushdown (ICP) indiquée par "Using index condition" dans la colonne Extra ?',
      codeSnippet: `SELECT * FROM people 
WHERE zipcode = '75001' AND address LIKE '%Saint%';
-- Index : idx_zip_address (zipcode, address)`,
      hint: 'Le moteur de stockage évalue la clause WHERE directement dans l\'index avant de charger la ligne complète.',
    },
    back: {
      answer: 'Index Condition Pushdown (ICP) :\n\n- **Sans ICP** : Le moteur de stockage (InnoDB) utilise l\'index pour trouver toutes les entrées correspondant à `zipcode = \'75001\'`, puis lit chaque ligne complète dans la table physique et la transmet à la couche SQL Server pour que celle-ci teste le `address LIKE \'%Saint%\'`.\n- **Avec ICP (Using index condition)** : La couche Serveur délègue (push down) la condition sur `address` directement au moteur de stockage InnoDB. InnoDB évalue la condition directement au niveau de la feuille d\'index **AVANT** d\'aller lire la ligne dans la table physique.\n- Si la condition n\'est pas remplie, la lecture de la ligne complète est évitée.',
      explanation: 'Réduit drastiquement le nombre d\'accès disques (read lookups) sur les tables volumineuses.',
      examTrap: 'ICP n\'est utilisable que sur les index secondaires, jamais sur le Clustered Index (la clé primaire contient déjà toutes les colonnes de la ligne).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Index Condition Pushdown Optimization',
    },
  },
  {
    id: 'fc-mysql908-dom02-097',
    cardNumber: 97,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Algorithmes de jointure sous MySQL 8.0 : Hash Join vs Block Nested Loop (BNL)',
    difficulty: 'hard',
    tags: ['Hash Join', 'BNL', 'Jointures', 'MySQL 8.0.18', 'Algorithm'],
    front: {
      question: 'Quel algorithme moderne de jointure a été introduit dans MySQL 8.0.18 pour remplacer définitivement le mécanisme historique Block Nested Loop (BNL) ?',
      hint: 'Construction d\'une table de hachage en mémoire à partir de la plus petite table de la jointure.',
    },
    back: {
      answer: 'L\'algorithme **`Hash Join`** (introduit dans MySQL 8.0.18, remplaçant totalement BNL depuis 8.0.20) :\n\n- Fonctionnement en 2 phases :\n  1. **Phase de construction (Build phase)** : MySQL lit la plus petite table en mémoire et construit une table de hachage (Hash Table) en utilisant les colonnes de jointure comme clé.\n  2. **Phase de sondage (Probe phase)** : MySQL parcourt la seconde table (la plus volumineuse) et teste chaque ligne contre la table de hachage en mémoire vive.\n- Si la table de hachage dépasse `join_buffer_size`, elle déborde proprement sur disque via des partitions de hachage (Grace Hash Join).\n- **Performance** : Infiniment plus rapide que l\'ancien Block Nested Loop ($O(M+N)$ vs $O(M \\times N)$).',
      explanation: 'S\'applique automatiquement aux jointures d\'équi-jointure (`ON t1.col = t2.col`) sans index disponible.',
      examTrap: 'L\'ancien algorithme Block Nested Loop (BNL) a été complètement supprimé du code de MySQL 8.0.20+. L\'indice /*+ BNL() */ active désormais en réalité un Hash Join !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Hash Join Optimization',
    },
  },
  {
    id: 'fc-mysql908-dom02-098',
    cardNumber: 98,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Statistiques avancées sans index : les Histogrammes sous MySQL 8.0',
    difficulty: 'medium',
    tags: ['Histograms', 'ANALYZE TABLE', 'Optimizer', 'Statistics', 'MySQL 8.0'],
    front: {
      question: 'Pourquoi et comment créer un histogramme de statistiques sur une colonne non indexée sous MySQL 8.0 ?',
      codeSnippet: `ANALYZE TABLE customer 
UPDATE HISTOGRAM ON country_code, age 
WITH 100 BUCKETS;`,
      hint: 'Permet à l\'optimiseur de connaître la répartition asymétrique des données sans subir le coût d\'un index physique.',
    },
    back: {
      answer: 'Rôle et création des histogrammes :\n\n- **Problème résolu** : Sur des colonnes non indexées ou à faible cardinalité asymétrique (ex: `status`, `country_code`), l\'optimiseur ne connaît pas la distribution des valeurs et fait des estimations statistiques fausses.\n- Créer un index physique B-Tree complet serait trop coûteux en écritures DML.\n- **Solution** : Un **histogramme** est une statistique compacte stockée dans le Data Dictionary (`mysql.column_statistics`) décrivant la distribution des données réparties en tranches (Buckets).\n- Deux types d\'histogrammes :\n  - `Singleton` : 1 seau par valeur distincte (si nombre de valeurs distinctes $\\le$ BUCKETS).\n  - `Equi-height` : Seaux de hauteur équivalente pour les plages de valeurs continues.',
      explanation: 'Les histogrammes améliorent spectaculairement la précision de la colonne `filtered` d\'EXPLAIN sans aucun coût de maintenance lors des INSERT/UPDATE.',
      examTrap: 'Les histogrammes ne sont PAS mis à jour automatiquement lors des DML ! Il faut réexécuter périodiquement `ANALYZE TABLE ... UPDATE HISTOGRAM` via un batch ou un cron.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Optimizer Statistics - Histogram Statistics Analysis',
    },
  },
  {
    id: 'fc-mysql908-dom02-099',
    cardNumber: 99,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Syntaxe moderne des indices d\'optimiseur (Optimizer Hints) sous MySQL 8.0',
    difficulty: 'medium',
    tags: ['Optimizer Hints', 'Syntax', 'INDEX', 'JOIN_ORDER'],
    front: {
      question: 'Quelle est la syntaxe moderne standardisée des Optimizer Hints sous MySQL 8.0 et pourquoi est-elle supérieure aux anciennes clauses FORCE INDEX ?',
      codeSnippet: `SELECT /*+ NO_INDEX(t1 idx_status) JOIN_ORDER(t2, t1) */ *
FROM orders t1
JOIN customers t2 ON t1.customer_id = t2.id;`,
      hint: 'Commentaires SQL spéciaux débutant par /*+ ... */ insérés après le mot-clé SELECT.',
    },
    back: {
      answer: 'Caractéristiques des Optimizer Hints modernes sous MySQL 8.0 :\n\n- **Syntaxe standard** : `/*+ HINT_NAME(...) */` placé immédiatement après le verbe SQL (`SELECT`, `UPDATE`, `DELETE`).\n- **Exemples majeurs** :\n  - `/*+ INDEX(table idx_name) */` : Suggère d\'utiliser cet index.\n  - `/*+ NO_INDEX(table idx_name) */` : Interdit l\'utilisation d\'un index spécifique.\n  - `/*+ JOIN_ORDER(t1, t2, t3) */` : Impose l\'ordre d\'évaluation des jointures.\n  - `/*+ HASH_JOIN(t1) */` / `/*+ NO_HASH_JOIN(t1) */` : Contrôle l\'utilisation de Hash Join.\n- **Avantages sur FORCE INDEX** :\n  1. Les hints n\'altèrent pas la syntaxe SQL ANSI (ils sont ignorés comme des commentaires par d\'autres SGBD).\n  2. Permettent de contrôler des aspects impossibles avec FORCE INDEX (ordre de jointure, algorithmes, sous-requêtes, variables).',
      explanation: 'Permet de forcer un bon plan temporaire en production en attendant la publication d\'un correctif logiciel.',
      examTrap: 'Si le nom de la table ou de l\'index contient une faute de frappe, MySQL n\'échoue PAS avec une erreur : il ignore silencieusement le hint et émet un simple Warning (visible via SHOW WARNINGS;).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Optimizer Hints',
    },
  },
  {
    id: 'fc-mysql908-dom02-100',
    cardNumber: 100,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Suppression d\'index sécurisée en production : les Invisible Indexes',
    difficulty: 'easy',
    tags: ['Invisible Indexes', 'ALTER INDEX', 'Risk Management', 'MySQL 8.0'],
    front: {
      question: 'Comment tester en toute sécurité l\'impact de la suppression d\'un index en production sans risquer de dégrader les requêtes applicatives ?',
      codeSnippet: `ALTER TABLE orders ALTER INDEX idx_old_date INVISIBLE;
-- Test de la production...
ALTER TABLE orders ALTER INDEX idx_old_date VISIBLE;`,
      hint: 'Les index invisibles (Invisible Indexes) sont ignorés par l\'optimiseur mais continuent d\'être mis à jour par le moteur de stockage.',
    },
    back: {
      answer: 'Fonctionnement des **Invisible Indexes** (Index Invisibles sous MySQL 8.0) :\n\n- En passant un index en `INVISIBLE` :\n  1. L\'optimiseur de requêtes **l\'ignore totalement** et ne peut plus l\'utiliser pour générer des plans d\'exécution.\n  2. En revanche, le moteur de stockage InnoDB **continue de le maintenir et de le mettre à jour à chaque INSERT/UPDATE/DELETE**.\n- **Procédure de décommissionnement sans risque** :\n  1. Rendre l\'index invisible (`ALTER TABLE ... ALTER INDEX ... INVISIBLE`).\n  2. Surveiller les performances et le Slow Log pendant plusieurs jours.\n  3. Si une requête se dégrade, réactiver l\'index **instantanément** sans reconstruire les données (`ALTER TABLE ... ALTER INDEX ... VISIBLE`).\n  4. Si aucun incident n\'est constaté, supprimer l\'index définitivement avec `DROP INDEX`.',
      explanation: 'Cette fonctionnalité élimine le stress des suppressions d\'index qui nécessitaient auparavant de reconstruire des tables de plusieurs téraoctets si l\'index s\'avérait indispensable.',
      examTrap: 'Une clé primaire (PRIMARY KEY) ne peut JAMAIS être rendue invisible ! MySQL interdira l\'opération.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Invisible Indexes',
    },
  },
];
