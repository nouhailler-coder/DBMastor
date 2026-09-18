import { FlashcardItem } from '../types';

export const mysql908Dom02Part1Flashcards: FlashcardItem[] = [
  // =========================================================================
  // SECTION 1 : FICHIERS D'OPTIONS (my.cnf / my.ini), DÉMARRAGE & PRIORITÉS (Cartes 1 à 12)
  // Chemins de recherche, groupes d'options, directives d'inclusion, options CLI
  // =========================================================================
  {
    id: 'fc-mysql908-dom02-001',
    cardNumber: 1,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Ordre de recherche et de lecture des fichiers my.cnf sous Linux',
    difficulty: 'medium',
    tags: ['my.cnf', 'Configuration', 'Startup', 'Linux', 'Options'],
    front: {
      question: 'Dans quel ordre précis le serveur mysqld sous Linux recherche-t-il et charge-t-il ses fichiers d\'options par défaut ?',
      hint: 'Pensez à l\'arborescence système globale jusqu\'au répertoire personnel de l\'utilisateur.',
    },
    back: {
      answer: 'Sous Linux / Unix, mysqld lit les fichiers d\'options dans l\'ordre suivant (du premier au dernier) :\n\n1. `/etc/my.cnf` (global)\n2. `/etc/mysql/my.cnf` (global)\n3. `SYSCONFDIR/my.cnf` (généralement `/usr/local/mysql/etc/my.cnf` ou `/etc/mysql/` selon le packaging)\n4. `$MYSQL_HOME/my.cnf` (spécifique au serveur s\'il est défini)\n5. Le fichier spécifié par `--defaults-extra-file` (si renseigné au démarrage)\n6. `~/.my.cnf` (spécifique à l\'utilisateur exécutant)\n7. `~/.mylogin.cnf` (identifiants chiffrés créés par `mysql_config_editor`, lu uniquement par les clients)',
      explanation: 'Si une même directive figure dans plusieurs fichiers, c\'est la dernière option lue qui écrase les précédentes (sauf les options en ligne de commande qui ont la priorité absolue sur tous les fichiers).',
      examTrap: 'Attention : mysqld ne lit PAS ~/.mylogin.cnf ! Ce fichier chiffré est réservé aux utilitaires clients (mysql, mysqldump, mysqladmin).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Using Option Files (4.2.2.2)',
    },
  },
  {
    id: 'fc-mysql908-dom02-002',
    cardNumber: 2,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Gestion des options --defaults-file, --defaults-extra-file et --no-defaults',
    difficulty: 'hard',
    tags: ['Startup', 'my.cnf', 'CLI Options', 'Defaults', 'Troubleshooting'],
    front: {
      question: 'Quelle est la différence fondamentale entre les options de démarrage --defaults-file, --defaults-extra-file et --no-defaults ?',
      hint: 'L\'une remplace tous les fichiers standards, l\'autre s\'ajoute après les fichiers globaux, et la troisième ignore tous les fichiers.',
    },
    back: {
      answer: 'Différences fondamentales :\n\n- `--defaults-file=path` : Remplace intégralement la liste des fichiers d\'options par défaut. Seul ce fichier spécifique sera lu ; tous les autres (/etc/my.cnf, etc.) sont ignorés.\n- `--defaults-extra-file=path` : Est lu après les fichiers d\'options globaux du système (/etc/my.cnf), mais avant le fichier utilisateur (~/.my.cnf). Il s\'ajoute sans supprimer les fichiers par défaut.\n- `--no-defaults` : Ordonne à mysqld de ne lire ABSOLUMENT AUCUN fichier d\'options au démarrage. Seules les valeurs par défaut compilées et les arguments passés sur la ligne de commande seront utilisés.',
      explanation: 'Ces options doivent impérativement être spécifiées en PREMIER argument sur la ligne de commande de démarrage, sinon elles sont ignorées ou génèrent une erreur.',
      examTrap: 'Si vous placez --defaults-file après d\'autres paramètres CLI (ex: mysqld --port=3307 --defaults-file=/opt/my.cnf), le serveur renverra une erreur ou ignorera le fichier ! Elle DOIT être la première option.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Command-Line Options that Affect Option Files',
    },
  },
  {
    id: 'fc-mysql908-dom02-003',
    cardNumber: 3,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Structure des groupes d\'options ([mysqld], [client], [server])',
    difficulty: 'easy',
    tags: ['my.cnf', 'Option Groups', 'Client', 'Server', 'Syntax'],
    front: {
      question: 'À quoi servent les en-têtes de groupe entre crochets (ex: [mysqld], [client], [mysql]) dans un fichier my.cnf et quels programmes les lisent ?',
      codeSnippet: `[client]
port = 3306
socket = /var/run/mysqld/mysqld.sock

[mysqld]
max_connections = 500
default_storage_engine = InnoDB

[mysql]
no-auto-rehash`,
      hint: 'Chaque exécutable du package MySQL consulte uniquement certains groupes spécifiques.',
    },
    back: {
      answer: 'Les groupes délimitent les directives appliquées à chaque utilitaire ou démon :\n\n- `[mysqld]` ou `[server]` : Lu uniquement par le démon serveur `mysqld`.\n- `[client]` : Lu par TOUS les programmes clients MySQL standards (`mysql`, `mysqldump`, `mysqladmin`, `mysqlcheck`, `mysqlbinlog`).\n- `[mysql]` : Lu spécifiquement par le client interactif en ligne de commande `mysql` (ex: `no-auto-rehash`, `prompt`).\n- `[mysqldump]` : Lu exclusivement par l\'utilitaire d\'export logique `mysqldump`.\n- `[mysqld_safe]` : Lu par le script de surveillance historique `mysqld_safe`.',
      explanation: 'Placer une directive propre au serveur (comme `innodb_buffer_pool_size`) sous la section `[client]` provoquera l\'échec des outils clients lors de leur connexion avec l\'erreur "unknown variable".',
      examTrap: 'Ne jamais mettre de paramètres spécifiques au serveur dans [client]. Si vous y mettez "innodb_buffer_pool_size = 1G", mysqldump et le client mysql refuseront de démarrer !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Option File Syntax',
    },
  },
  {
    id: 'fc-mysql908-dom02-004',
    cardNumber: 4,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Directives d\'inclusion !include et !includedir',
    difficulty: 'medium',
    tags: ['my.cnf', 'Inclusion', 'Modularity', 'Administration'],
    front: {
      question: 'Comment fonctionnent les directives d\'inclusion !include et !includedir dans my.cnf et quelles sont leurs contraintes ?',
      codeSnippet: `!include /etc/mysql/conf.d/tuning.cnf
!includedir /etc/mysql/conf.d/`,
      hint: 'Faites attention à l\'absence d\'espace, au point d\'exclamation et à l\'ordre de lecture des fichiers du répertoire.',
    },
    back: {
      answer: 'Règles de fonctionnement :\n\n- `!include chemin_fichier` : Inclut un fichier spécifique unique.\n- `!includedir chemin_repertoire` : Recherche et inclut tous les fichiers se terminant par `.cnf` présents dans le répertoire cible, classés par **ordre alphabétique** de nom de fichier.\n- **Contraintes** :\n  1. Le point d\'exclamation initial `!` est obligatoire.\n  2. Aucun espace ne doit exister entre `!` et la commande (`!include` ou `!includedir`).\n  3. Les fichiers temporaires, éditeurs (.bak, .swp) ou ne finissant pas par `.cnf` sont ignorés par `!includedir`.',
      explanation: 'La modularité apportée par !includedir permet aux gestionnaires de paquets (Debian/Ubuntu, RedHat) de scinder la configuration en blocs (mysql.cnf, mysqld.cnf, etc.).',
      examTrap: 'Dans !includedir, les fichiers sont lus par ordre alphabétique ASCII. Un fichier nommé 10-innodb.cnf sera lu et écrasé par 90-innodb.cnf si la même variable y est redéfinie !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Including Option Files',
    },
  },
  {
    id: 'fc-mysql908-dom02-005',
    cardNumber: 5,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Priorité absolue de résolution des paramètres de configuration',
    difficulty: 'medium',
    tags: ['Precedence', 'Configuration', 'CLI', 'my.cnf', 'Variables'],
    front: {
      question: 'Quel est l\'ordre de priorité final pour déterminer la valeur d\'un paramètre au démarrage de MySQL 8.0 parmi : les valeurs compilées, les fichiers my.cnf, mysqld-auto.cnf, et les options de ligne de commande ?',
      hint: 'De la source la moins prioritaire à la source souveraine ultime.',
    },
    back: {
      answer: 'Ordre de précédence de la plus basse à la plus haute priorité :\n\n1. **Valeurs par défaut compilées dans le binaire** (valeur par défaut d\'usine).\n2. **Fichiers d\'options traditionnels** (`/etc/my.cnf`, `~/.my.cnf`, etc. lus dans l\'ordre standard).\n3. **Fichier de configuration persisté dynamiquement** (`mysqld-auto.cnf` généré par `SET PERSIST`).\n4. **Options spécifiées en ligne de commande** lors de l\'invocation du binaire `mysqld` (ex: `--port=3307`).',
      explanation: 'Les options passées en ligne de commande ont TOUJOURS le dernier mot et écrasent toutes les valeurs présentes dans n\'importe quel fichier de configuration, y compris `mysqld-auto.cnf`.',
      examTrap: 'Le fichier mysqld-auto.cnf (généré par SET PERSIST) prend le pas sur /etc/my.cnf ! Mais une option passée en ligne de commande écrasera même mysqld-auto.cnf.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server Configuration Precedence',
    },
  },
  {
    id: 'fc-mysql908-dom02-006',
    cardNumber: 6,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Validation de la configuration hors-ligne avec mysqld --validate-config',
    difficulty: 'easy',
    tags: ['mysqld', 'Validation', 'Troubleshooting', 'Administration'],
    front: {
      question: 'Quelle commande permet à un DBA de vérifier la validité syntaxique de tous les fichiers de configuration de MySQL 8.0 sans lancer le serveur en production ?',
      codeSnippet: `mysqld --validate-config`,
      hint: 'Introduit dans MySQL 8.0.16 pour éviter les arrêts impromptus dus à des fautes de frappe dans my.cnf.',
    },
    back: {
      answer: 'La commande `mysqld --validate-config` démarre le serveur en mode vérification seule :\n\n- Elle analyse tous les fichiers d\'options et vérifie la validité des variables et des syntaxes.\n- Si aucune erreur n\'est détectée, elle retourne un code de sortie `0` sans démarrer le processus démon.\n- En cas d\'erreur (variable inconnue, syntaxe invalide), elle affiche l\'erreur sur `stderr` et retourne un code non nul (`1`).\n- On peut également cibler un fichier particulier : `mysqld --defaults-file=/etc/my.cnf --validate-config`.',
      explanation: 'Avant cette option de MySQL 8.0.16, une faute de frappe dans my.cnf n\'était découverte qu\'au redémarrage nocturne de production, entraînant un échec de boot.',
      examTrap: 'mysqld --print-defaults n\'effectue PAS de validation : il affiche simplement les valeurs lues dans les fichiers sans vérifier si elles sont valides ou acceptées par le serveur.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server Option: --validate-config',
    },
  },
  {
    id: 'fc-mysql908-dom02-007',
    cardNumber: 7,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Contrôle réseau du serveur : bind-address et skip-networking',
    difficulty: 'medium',
    tags: ['Networking', 'Security', 'my.cnf', 'bind-address'],
    front: {
      question: 'Quelles sont les implications des directives bind-address et skip-networking sur l\'accessibilité du serveur MySQL 8.0 ?',
      codeSnippet: `[mysqld]
bind-address = 127.0.0.1,192.168.1.50
# ou
skip-networking`,
      hint: 'L\'une permet de spécifier plusieurs adresses IP (nouveauté MySQL 8.0), l\'autre coupe totalement la pile TCP/IP.',
    },
    back: {
      answer: 'Comportements réseau :\n\n- `bind-address` : Définit les interfaces réseau sur lesquelles MySQL écoute les connexions TCP/IP. Sous MySQL 8.0, on peut spécifier une liste d\'adresses IPv4/IPv6 séparées par des virgules (ex: `127.0.0.1,192.168.1.50`) ou `*` / `0.0.0.0` pour écouter sur toutes les interfaces.\n- `skip-networking` : Désactive complètement la pile TCP/IP. Le serveur n\'ouvre aucun port réseau (le port 3306 n\'est pas écouté). Seules les connexions locales via socket Unix (`.sock`) ou mémoire partagée / named pipe (Windows) sont autorisées.',
      explanation: 'skip-networking est une mesure de durcissement idéale pour les environnements de maintenance locale ou pour des applications hébergées sur le même serveur que MySQL.',
      examTrap: 'Si skip-networking est actif, tenter de se connecter avec `mysql -h 127.0.0.1 -P 3306` échouera ! Seul `mysql -h localhost` (qui utilise le socket Unix) fonctionnera.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server Networking Options',
    },
  },
  {
    id: 'fc-mysql908-dom02-008',
    cardNumber: 8,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Modes de démarrage d\'urgence : skip-grant-tables et read-only',
    difficulty: 'hard',
    tags: ['Security', 'Troubleshooting', 'Emergency', 'skip-grant-tables'],
    front: {
      question: 'Quelles mesures de sécurité MySQL 8.0 impose-t-il automatiquement lorsque le serveur est démarré avec l\'option --skip-grant-tables ?',
      hint: 'Pourquoi un serveur démarré avec cette option n\'est-il plus immédiatement piratable via le réseau ?',
    },
    back: {
      answer: 'Sous MySQL 8.0, l\'activation de `--skip-grant-tables` entraîne automatiquement :\n\n1. L\'activation implicite de `--skip-networking` : le serveur refuse d\'ouvrir le port réseau TCP/IP pour empêcher toute connexion distante sans mot de passe.\n2. La désactivation du système de privilèges (tout utilisateur local se connectant via socket a un accès total sans contrôle de mot de passe).\n3. La désactivation des tablespaces utilisateur chiffrés et de certains composants de sécurité.\n\nPour réactiver le réseau si nécessaire (déconseillé), il faut spécifier explicitement `--skip-grant-tables --skip-networking=OFF`.',
      explanation: 'Cette protection intégrée évite qu\'un administrateur réinitialisant le mot de passe root n\'expose par inadvertance sa base de données à l\'ensemble du réseau d\'entreprise ou à Internet.',
      examTrap: 'Sous MySQL 8.0, lorsque le serveur démarre avec --skip-grant-tables, les commandes de gestion de compte comme `ALTER USER` échouent avec une erreur tant que vous n\'avez pas exécuté `FLUSH PRIVILEGES;` !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - How to Reset the Root Password',
    },
  },
  {
    id: 'fc-mysql908-dom02-009',
    cardNumber: 9,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Convention de nommage des options : tirets (-) vs underscores (_)',
    difficulty: 'easy',
    tags: ['Syntax', 'my.cnf', 'CLI', 'Conventions'],
    front: {
      question: 'Dans les fichiers my.cnf et sur la ligne de commande, quelle est la règle d\'équivalence entre les tirets (-) et les underscores (_) pour les noms de variables ?',
      codeSnippet: `innodb-buffer-pool-size = 4G
innodb_buffer_pool_size = 4G`,
      hint: 'Sont-ils interchangeables dans les fichiers d\'options et en SQL ?',
    },
    back: {
      answer: 'Règles d\'équivalence :\n\n- Dans les **fichiers d\'options (`my.cnf`)** et sur la **ligne de commande**, les tirets (`-`) et les underscores (`_`) sont strictement **interchangeables** pour les noms de paramètres (ex: `innodb-buffer-pool-size` équivaut exactement à `innodb_buffer_pool_size`).\n- En revanche, dans les **instructions SQL** (`SET GLOBAL`, `SELECT @@...`), seuls les **underscores (`_`)** sont acceptés par le parseur SQL (ex: `SET GLOBAL max_connections = 200;` est valide, mais `max-connections` provoque une erreur syntaxique).',
      explanation: 'En SQL, le caractère tiret `-` représente l\'opérateur de soustraction arithmétique, ce qui le rend incompatible avec les identifiants de variables système sans délimiteurs.',
      examTrap: 'Ne jamais utiliser de tirets dans une requête SQL ! `SELECT @@innodb-buffer-pool-size` sera interprété comme une soustraction et renverra une erreur de syntaxe.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Option Modifiers and Syntax',
    },
  },
  {
    id: 'fc-mysql908-dom02-010',
    cardNumber: 10,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Unités de mesure et suffixes dans my.cnf',
    difficulty: 'easy',
    tags: ['my.cnf', 'Syntax', 'Units', 'Buffer Pool'],
    front: {
      question: 'Quels suffixes de taille sont supportés dans my.cnf et comment sont-ils interprétés pour la mémoire (binaire vs décimal) ?',
      codeSnippet: `innodb_buffer_pool_size = 8G
max_allowed_packet = 64M
sort_buffer_size = 512K`,
      hint: 'S\'agit-il de multiples de 1024 (Kibi/Mebi/Gibi) ou de 1000 ?',
    },
    back: {
      answer: 'Dans les fichiers d\'options `my.cnf` et sur la ligne de commande, les suffixes reconnus sont :\n\n- `K` ou `k` : Kilo-octets binaires ($1024$ octets ou 1 KiB)\n- `M` ou `m` : Méga-octets binaires ($1024^2 = 1\\,048\\,576$ octets ou 1 MiB)\n- `G` ou `g` : Giga-octets binaires ($1024^3 = 1\\,073\\,741\\,824$ octets ou 1 GiB)\n- `T` ou `t` (supporté pour certaines variables volumineuses) : Téra-octets ($1024^4$ octets)\n\nIls sont TOUJOURS interprétés en base 2 (multiples de 1024) et non en base 10.',
      explanation: 'En SQL en revanche, les suffixes ne sont pas toujours acceptés directement dans les requêtes `SET GLOBAL` où il est souvent requis de fournir la valeur entière en octets purs ou une expression arithmétique (`SET GLOBAL sort_buffer_size = 512 * 1024;`).',
      examTrap: 'Ne pas ajouter "B" ou "o" (ex: "8GB" ou "8Go" est invalide et empêchera le serveur de démarrer ! Seule la lettre "G" ou "g" est acceptée).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Using Option Files',
    },
  },
  {
    id: 'fc-mysql908-dom02-011',
    cardNumber: 11,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Variables dépendantes : read_only vs super_read_only',
    difficulty: 'medium',
    tags: ['Variables', 'Replication', 'Security', 'read_only'],
    front: {
      question: 'Quelle est la différence fondamentale entre les variables système read_only et super_read_only ?',
      codeSnippet: `SET GLOBAL read_only = ON;
-- vs
SET GLOBAL super_read_only = ON;`,
      hint: 'Que se passe-t-il pour un utilisateur disposant du privilège CONNECTION_ADMIN ou SUPER ?',
    },
    back: {
      answer: 'Différence essentielle :\n\n- `read_only = ON` : Empêche toute modification (INSERT, UPDATE, DELETE) par les utilisateurs normaux. Cependant, les utilisateurs disposant du privilège `SUPER` ou `SYSTEM_VARIABLES_ADMIN` (comme le compte administrateur `root`) peuvent toujours écrire dans les tables !\n- `super_read_only = ON` : Bloque les écritures pour TOUT LE MONDE, Y COMPRIS les utilisateurs disposant du privilège `SUPER` ou `SYSTEM_VARIABLES_ADMIN`.\n\n*Effet de cascade* : Activer `super_read_only = ON` active automatiquement `read_only = ON`. Désactiver `read_only = OFF` désactive automatiquement `super_read_only = OFF`.',
      explanation: '`super_read_only` est indispensable sur les réplicas (read-only replicas) pour éviter toute écriture accidentelle par un script s\'exécutant avec le compte root.',
      examTrap: 'Sur un replica, le thread de réplication (applier) continue d\'appliquer les modifications venant de la source même si super_read_only est activé !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: super_read_only',
    },
  },
  {
    id: 'fc-mysql908-dom02-012',
    cardNumber: 12,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Inspection des options effectives avec mysqladmin variables',
    difficulty: 'easy',
    tags: ['mysqladmin', 'CLI', 'Inspection', 'Variables'],
    front: {
      question: 'Quel utilitaire client permet d\'inspecter directement l\'état de toutes les variables du serveur depuis le terminal sans ouvrir de session SQL interactive ?',
      codeSnippet: `mysqladmin -u root -p variables`,
      hint: 'Utilitaire d\'administration en ligne de commande standard fourni avec le client MySQL.',
    },
    back: {
      answer: 'L\'utilitaire `mysqladmin` avec la sous-commande `variables` permet de lister toutes les variables système globales du serveur sous forme de tableau texte.\n\nExemples courants :\n- `mysqladmin -u root -p variables`\n- Filtrer avec grep : `mysqladmin -u root -p variables | grep buffer_pool`\n- Consulter l\'état des compteurs de statut : `mysqladmin -u root -p extended-status`\n- Vérifier la santé du serveur : `mysqladmin -u root -p ping`',
      explanation: 'Très utile pour les scripts de monitoring shell, les vérifications d\'orchestration (Ansible, Kubernetes) et les diagnostics rapides sans interface SQL.',
      examTrap: 'mysqladmin variables ne retourne que les variables globales. Les variables de session n\'y apparaissent pas puisqu\'il s\'agit d\'une commande ponctuelle.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqladmin — A MySQL Server Administration Program',
    },
  },

  // =========================================================================
  // SECTION 2 : VARIABLES SYSTÈME, PORTÉES & PERSISTANCE DYNAMIQUE (Cartes 13 à 26)
  // GLOBAL, SESSION, ReadOnly, SET PERSIST, SET PERSIST_ONLY, mysqld-auto.cnf, RESET PERSIST
  // =========================================================================
  {
    id: 'fc-mysql908-dom02-013',
    cardNumber: 13,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Portées des variables système : GLOBAL vs SESSION vs ReadOnly',
    difficulty: 'easy',
    tags: ['Variables', 'Scope', 'Session', 'Global'],
    front: {
      question: 'Quelles sont les trois catégories de portée (scopes) pour les variables système dans MySQL 8.0 ?',
      hint: 'Certaines affectent toutes les connexions, d\'autres uniquement la session courante, et d\'autres ne sont modifiables qu\'au boot.',
    },
    back: {
      answer: 'Les trois catégories de portée sont :\n\n1. **GLOBAL** : Affecte le fonctionnement global du serveur et sert de valeur par défaut pour les nouvelles connexions qui s\'ouvrent (ex: `max_connections`, `innodb_buffer_pool_size`).\n2. **SESSION** : Propre à chaque connexion client individuelle (ex: `sql_mode`, `autocommit`, `time_zone`, `foreign_key_checks`). Modifier une variable de session n\'affecte aucune autre connexion active.\n3. **ReadOnly (Statique)** : Fixée au démarrage du serveur (via `my.cnf` ou la ligne de commande) et impossible à modifier dynamiquement en cours d\'exécution (ex: `innodb_page_size`, `datadir`, `lower_case_table_names`).',
      explanation: 'Beaucoup de variables possèdent à la fois une portée GLOBAL et SESSION (ex: `sort_buffer_size`, `sql_mode`). Modifier la valeur SESSION modifie la requête en cours, modifier la valeur GLOBAL modifie les futures sessions.',
      examTrap: 'Modifier une variable GLOBAL (ex: SET GLOBAL sql_mode = ...) n\'affecte JAMAIS les sessions clientes déjà connectées ! Seules les nouvelles connexions héritent de la nouvelle valeur.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - System Variable Scope',
    },
  },
  {
    id: 'fc-mysql908-dom02-014',
    cardNumber: 14,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Limitation historique de SET GLOBAL et solution MySQL 8.0',
    difficulty: 'easy',
    tags: ['SET GLOBAL', 'Persistence', 'my.cnf', 'SET PERSIST'],
    front: {
      question: 'Pourquoi l\'utilisation historique de SET GLOBAL variable = value présentait-elle un risque majeur pour les DBAs avant MySQL 8.0 ?',
      codeSnippet: `SET GLOBAL max_connections = 1000;`,
      hint: 'Que se passe-t-il lorsque le serveur redémarre suite à une panne ou une maintenance ?',
    },
    back: {
      answer: 'La commande `SET GLOBAL` modifie la variable **uniquement en mémoire vive (RAM)** :\n\n- La modification prend effet immédiatement pour le serveur en cours d\'exécution.\n- **Le risque majeur** : Dès que le serveur redémarre (reboot programmé ou crash), la modification en mémoire est perdue et le serveur recharge l\'ancienne valeur figurant dans le fichier `my.cnf` sur disque.\n- Avant MySQL 8.0, le DBA devait obligatoirement penser à modifier manuellement le fichier `/etc/my.cnf` en plus d\'exécuter le `SET GLOBAL` pour pérenniser le réglage.',
      explanation: 'Pour résoudre ce problème classique de désynchronisation entre la configuration en mémoire et sur disque, MySQL 8.0 a introduit la clause `SET PERSIST`.',
      examTrap: 'SET GLOBAL ne modifie jamais aucun fichier sur disque ! Seul SET PERSIST écrit la valeur sur disque.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - SET Syntax for Variable Assignment',
    },
  },
  {
    id: 'fc-mysql908-dom02-015',
    cardNumber: 15,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Fonctionnement de SET PERSIST sous MySQL 8.0',
    difficulty: 'medium',
    tags: ['SET PERSIST', 'mysqld-auto.cnf', 'Dynamic Variables', 'MySQL 8.0'],
    front: {
      question: 'Que réalise exactement la commande SET PERSIST variable = value et où l\'information est-elle enregistrée sur disque ?',
      codeSnippet: `SET PERSIST max_connections = 1000;`,
      hint: 'Elle opère une double action : en mémoire et dans un fichier JSON dédié.',
    },
    back: {
      answer: '`SET PERSIST` réalise deux actions simultanées :\n\n1. **En mémoire vive** : Elle modifie immédiatement la variable système globale pour l\'instance en cours d\'exécution (équivalent à un `SET GLOBAL`).\n2. **Sur disque** : Elle écrit la directive dans un fichier de configuration dédié nommé **`mysqld-auto.cnf`**, stocké dans le répertoire de données (`datadir`) au format **JSON**.\n\nAu prochain redémarrage, MySQL lit ce fichier après les fichiers `my.cnf` traditionnels, garantissant ainsi la pérennité du paramètre.',
      explanation: 'Cette fonctionnalité permet de configurer le serveur à distance via de simples commandes SQL sans avoir besoin d\'un accès SSH ou filesystem au serveur physique.',
      examTrap: 'SET PERSIST n\'écrit JAMAIS dans /etc/my.cnf ! Il écrit exclusivement dans le fichier JSON mysqld-auto.cnf situé dans le datadir.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Persisted System Variables',
    },
  },
  {
    id: 'fc-mysql908-dom02-016',
    cardNumber: 16,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Différence entre SET PERSIST et SET PERSIST_ONLY',
    difficulty: 'hard',
    tags: ['SET PERSIST_ONLY', 'ReadOnly', 'mysqld-auto.cnf', 'Privileges'],
    front: {
      question: 'Quelle est la différence fondamentale entre SET PERSIST et SET PERSIST_ONLY sous MySQL 8.0 ?',
      codeSnippet: `SET PERSIST_ONLY ft_min_word_len = 3;`,
      hint: 'Pensez aux variables en lecture seule (ReadOnly) qui ne peuvent pas être changées dynamiquement à chaud.',
    },
    back: {
      answer: 'Différence fondamentale :\n\n- `SET PERSIST` : Modifie la valeur **immédiatement en mémoire vive (RAM)** ET l\'écrit dans `mysqld-auto.cnf`. Elle ne fonctionne QUE pour les variables dynamiques.\n- `SET PERSIST_ONLY` : Écrit la valeur dans `mysqld-auto.cnf` pour les futurs redémarrages **SANS modifier la valeur courante en mémoire**. Elle permet de configurer des variables statiques / en lecture seule (`ReadOnly`) qui ne peuvent être prises en compte qu\'au boot.',
      explanation: 'Tenter d\'exécuter `SET PERSIST` sur une variable en lecture seule (ex: `innodb_page_size`) déclenchera une erreur "Variable is a read only variable". En revanche, `SET PERSIST_ONLY` réussira sans erreur.',
      examTrap: 'SET PERSIST_ONLY ne change pas le comportement de l\'instance actuelle ! La nouvelle valeur ne sera active qu\'après un redémarrage complet du service mysqld.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Non-dynamic Persisted System Variables',
    },
  },
  {
    id: 'fc-mysql908-dom02-017',
    cardNumber: 17,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Structure et contenu du fichier mysqld-auto.cnf',
    difficulty: 'medium',
    tags: ['mysqld-auto.cnf', 'JSON', 'datadir', 'Internals'],
    front: {
      question: 'Quel est le format du fichier mysqld-auto.cnf généré par MySQL 8.0 et pourquoi est-il formellement déconseillé de l\'éditer manuellement ?',
      codeSnippet: `{
  "Version": 2,
  "mysql_server": {
    "max_connections": {
      "Value": "1000",
      "Metadata": {
        "Timestamp": 1715000000000000,
        "User": "root",
        "Host": "localhost"
      }
    }
  }
}`,
      hint: 'Il contient des métadonnées horodatées et une corruption de sa syntaxe empêchera le boot du serveur.',
    },
    back: {
      answer: 'Caractéristiques de `mysqld-auto.cnf` :\n\n- **Format** : Fichier structuré en **JSON** valide contenant la version du schéma, le nom de chaque variable, sa valeur, ainsi que des métadonnées d\'audit (horodatage en microsecondes, compte utilisateur et hôte ayant exécuté la commande).\n- **Emplacement** : Directement à la racine du `datadir`.\n- **Interdiction d\'édition manuelle** : Si un administrateur introduit une erreur de syntaxe JSON ou une valeur invalide, le serveur `mysqld` refusera purement et simplement de démarrer.\n- **Bonne pratique** : Toujours utiliser les instructions SQL dédiées (`SET PERSIST`, `RESET PERSIST`).',
      explanation: 'Les métadonnées permettent de tracer avec exactitude qui a modifié un paramètre et à quelle heure, ce qui constitue une amélioration majeure pour l\'audit de conformité.',
      examTrap: 'Le fichier mysqld-auto.cnf n\'utilise PAS la syntaxe INI traditionnelle de my.cnf (sections [mysqld]) ! C\'est strictement du JSON.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The mysqld-auto.cnf File',
    },
  },
  {
    id: 'fc-mysql908-dom02-018',
    cardNumber: 18,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Privilèges requis pour SET PERSIST et SET PERSIST_ONLY',
    difficulty: 'hard',
    tags: ['Security', 'Privileges', 'SET PERSIST', 'Dynamic Privileges'],
    front: {
      question: 'Quels privilèges dynamiques précis sont indispensables pour exécuter respectivement SET PERSIST et SET PERSIST_ONLY dans MySQL 8.0 ?',
      hint: 'MySQL 8.0 a introduit des privilèges granulaires pour remplacer le privilège omnipotent SUPER.',
    },
    back: {
      answer: 'Privilèges requis :\n\n- Pour `SET PERSIST variable = value` :\n  - Requiert le privilège dynamique **`SYSTEM_VARIABLES_ADMIN`** (ou l\'ancien privilège `SUPER`).\n- Pour `SET PERSIST_ONLY variable = value` (sur une variable en lecture seule) :\n  - Requiert **`SYSTEM_VARIABLES_ADMIN`** ET le privilège dédié **`PERSIST_RO_VARIABLES_ADMIN`** (ou `SUPER`).',
      explanation: 'Cette granularité permet de déléguer la modification des variables dynamiques courantes à un opérateur sans lui permettre de modifier les variables d\'architecture sensibles qui affectent le prochain boot.',
      examTrap: 'Posséder SYSTEM_VARIABLES_ADMIN seul ne suffit PAS pour exécuter SET PERSIST_ONLY sur une variable statique ! Il faut obligatoirement PERSIST_RO_VARIABLES_ADMIN.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Privileges for Persisted System Variables',
    },
  },
  {
    id: 'fc-mysql908-dom02-019',
    cardNumber: 19,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Suppression et réinitialisation des paramètres persistés avec RESET PERSIST',
    difficulty: 'medium',
    tags: ['RESET PERSIST', 'mysqld-auto.cnf', 'Rollback', 'Configuration'],
    front: {
      question: 'Comment supprimer une variable persistée ou réinitialiser l\'ensemble de mysqld-auto.cnf à l\'aide de l\'instruction RESET PERSIST ?',
      codeSnippet: `-- Supprimer une variable spécifique
RESET PERSIST max_connections;

-- Avec clause de sécurité
RESET PERSIST IF EXISTS max_connections;

-- Réinitialisation complète
RESET PERSIST;`,
      hint: 'Que fait RESET PERSIST sans argument ? Supprime-t-il la valeur en mémoire ?',
    },
    back: {
      answer: 'Fonctionnement de `RESET PERSIST` :\n\n- `RESET PERSIST variable_name;` : Supprime la variable spécifique du fichier `mysqld-auto.cnf`.\n- `RESET PERSIST IF EXISTS variable_name;` : Évite de lever une erreur `ER_VAR_DOES_NOT_EXIST` si la variable n\'était pas présente dans le fichier.\n- `RESET PERSIST;` (sans argument) : Supprime **TOUTES** les variables enregistrées dans `mysqld-auto.cnf` (vide intégralement le fichier).\n\n**Point clé** : `RESET PERSIST` ne modifie PAS la valeur en mémoire vive de l\'instance actuelle ! Elle empêche simplement son chargement lors du prochain redémarrage.',
      explanation: 'Après un RESET PERSIST, l\'instance continue de tourner avec sa configuration courante en RAM jusqu\'au prochain redémarrage où elle rechargera my.cnf.',
      examTrap: 'RESET PERSIST ne remet pas la variable à sa valeur par défaut dans la session active ! Il supprime uniquement son inscription dans le fichier JSON mysqld-auto.cnf sur disque.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - RESET PERSIST Syntax',
    },
  },
  {
    id: 'fc-mysql908-dom02-020',
    cardNumber: 20,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Dépannage d\'urgence : désactivation du chargement de mysqld-auto.cnf',
    difficulty: 'hard',
    tags: ['Troubleshooting', 'Disaster Recovery', 'mysqld-auto.cnf', 'Startup'],
    front: {
      question: 'Si une mauvaise valeur persistée dans mysqld-auto.cnf empêche le serveur MySQL 8.0 de démarrer, quelle option de ligne de commande permet d\'ignorer ce fichier au boot ?',
      codeSnippet: `mysqld --no-defaults --persisted-globals-load=OFF`,
      hint: 'Paramètre booléen de démarrage contrôlant le chargement des variables persistées.',
    },
    back: {
      answer: 'L\'option de démarrage est :\n\n`--persisted-globals-load=OFF` (ou `0`)\n\nEffets :\n- Le serveur `mysqld` démarre normalement en lisant ses fichiers `my.cnf` standards mais **ignore totalement le fichier `mysqld-auto.cnf`**.\n- Une fois le serveur démarré, le DBA peut se connecter et corriger la variable fautive avec `RESET PERSIST variable;` ou inspecter le problème en toute sécurité.',
      explanation: 'Cette option est la planche de salut officielle d\'Oracle en cas de mauvaise manipulation de variables système persistées.',
      examTrap: 'Ne supprimez pas le fichier mysqld-auto.cnf à la main au niveau de l\'OS tant que vous n\'avez pas essayé --persisted-globals-load=OFF !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server Option: --persisted-globals-load',
    },
  },
  {
    id: 'fc-mysql908-dom02-021',
    cardNumber: 21,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Tables du Performance Schema : persisted_variables et variables_info',
    difficulty: 'medium',
    tags: ['Performance Schema', 'Variables', 'Audit', 'persisted_variables'],
    front: {
      question: 'Quelles tables du schéma performance_schema permettent d\'auditer respectivement les variables persistées dans mysqld-auto.cnf et la source de chaque variable active ?',
      codeSnippet: `SELECT * FROM performance_schema.persisted_variables;
SELECT * FROM performance_schema.variables_info WHERE VARIABLE_NAME = 'max_connections';`,
      hint: 'L\'une liste le contenu du fichier JSON, l\'autre indique d\'où vient la valeur (COMPILED, GLOBAL, COMMAND_LINE, etc.).',
    },
    back: {
      answer: 'Tables d\'audit clés :\n\n1. **`performance_schema.persisted_variables`** :\n   - Affiche les variables actuellement enregistrées dans `mysqld-auto.cnf` avec leurs colonnes `VARIABLE_NAME` et `VARIABLE_VALUE`.\n2. **`performance_schema.variables_info`** :\n   - Fournit l\'historique et la source d\'initialisation de chaque variable (`VARIABLE_SOURCE` : `COMPILED`, `GLOBAL`, `SERVER`, `COMMAND_LINE`, `PERSISTED`, `EXPLICIT`, etc.).\n   - Affiche également `SET_TIME`, `SET_USER` et `SET_HOST` pour savoir quel utilisateur a modifié le paramètre.',
      explanation: 'Ces tables permettent de comprendre immédiatement pourquoi une variable a une valeur inattendue en production sans avoir à chercher dans tous les fichiers my.cnf du disque.',
      examTrap: 'Si une variable a été modifiée en ligne de commande, variables_info indiquera COMMAND_LINE, ce qui explique pourquoi elle ignore la valeur du my.cnf.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The persisted_variables and variables_info Tables',
    },
  },
  {
    id: 'fc-mysql908-dom02-022',
    cardNumber: 22,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Ajustement automatique des valeurs numériques (Min / Max / Troncature)',
    difficulty: 'medium',
    tags: ['Variables', 'Auto-adjustment', 'Warning', 'Buffer Pool'],
    front: {
      question: 'Que fait MySQL si vous tentez d\'assigner à une variable système une valeur inférieure à son minimum autorisé ou supérieure à son maximum autorisé ?',
      codeSnippet: `SET GLOBAL max_connections = 999999999;
SHOW WARNINGS;`,
      hint: 'La commande échoue-t-elle ou la valeur est-elle ajustée automatiquement avec un avertissement ?',
    },
    back: {
      answer: 'Comportement d\'ajustement automatique :\n\n- MySQL **ne rejette pas** la commande par une erreur bloquante.\n- Il ajuste automatiquement la variable au **plancher minimal** ou au **plafond maximal** autorisé par l\'architecture du système.\n- Si la valeur n\'est pas un multiple requis (ex: `innodb_buffer_pool_size` qui doit être un multiple de `chunk_size * instances`), MySQL l\'arrondit automatiquement au multiple supérieur le plus proche.\n- Un **Warning** (`ER_TRUNCATED_WRONG_VALUE`) est levé pour notifier l\'administrateur de l\'ajustement.',
      explanation: 'Consulter `SHOW WARNINGS;` après avoir modifié des variables dynamiques en mémoire est une excellente pratique pour vérifier la valeur réellement retenue.',
      examTrap: 'Ne partez pas du principe que la valeur en mémoire est exactement celle que vous avez saisie ! Vérifiez toujours avec SELECT @@variable après l\'affectation.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variable Reference',
    },
  },
  {
    id: 'fc-mysql908-dom02-023',
    cardNumber: 23,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Comportement des variables de session à la déconnexion',
    difficulty: 'easy',
    tags: ['Session', 'Variables', 'Memory', 'Lifecycle'],
    front: {
      question: 'Que deviennent les modifications apportées à une variable avec SET SESSION lorsqu\'un client se déconnecte du serveur ?',
      codeSnippet: `SET SESSION sql_mode = 'NO_ENGINE_SUBSTITUTION';`,
      hint: 'Les réglages persistent-ils pour les connexions suivantes sur le même thread ?',
    },
    back: {
      answer: 'À la déconnexion du client :\n\n- Toutes les valeurs de variables de session modifiées par ce client sont **immédiatement détruites et libérées de la mémoire**.\n- La session suivante (même si le thread de connexion est réutilisé par le cache de threads `thread_cache_size`) sera initialisée à nouveau avec les valeurs globales par défaut du serveur (`GLOBAL`).',
      explanation: 'Les variables de session sont strictement isolées au niveau de la structure de données `THD` de chaque thread client.',
      examTrap: 'Si votre application utilise un pool de connexions (HikariCP, Tomcat), une variable de session modifiée peut persister pour la requête suivante si la connexion n\'est pas proprement réinitialisée !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - System Variable Scope',
    },
  },
  {
    id: 'fc-mysql908-dom02-024',
    cardNumber: 24,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Gestion des variables de chaîne : sql_mode sous MySQL 8.0',
    difficulty: 'medium',
    tags: ['sql_mode', 'Syntax', 'Standards', 'Strict Mode'],
    front: {
      question: 'Quels sont les modes SQL majeurs inclus par défaut dans la variable sql_mode sous MySQL 8.0 et quel est leur impact ?',
      codeSnippet: `SELECT @@GLOBAL.sql_mode;`,
      hint: 'STRICT_TRANS_TABLES, ONLY_FULL_GROUP_BY, ERROR_FOR_DIVISION_BY_ZERO, NO_ENGINE_SUBSTITUTION...',
    },
    back: {
      answer: 'Par défaut, MySQL 8.0 inclut :\n\n- `ONLY_FULL_GROUP_BY` : Interdit les colonnes non agrégées dans le `SELECT` qui ne figurent pas dans le `GROUP BY` (conformité standard SQL).\n- `STRICT_TRANS_TABLES` : Mode strict pour moteurs transactionnels (rejette les données tronquées ou invalides par une erreur plutôt qu\'un avertissement).\n- `NO_ZERO_IN_DATE` et `NO_ZERO_DATE` : Rejette les dates du type \'0000-00-00\'.\n- `ERROR_FOR_DIVISION_BY_ZERO` : Rejette la division par zéro par une erreur lors des insertions.\n- `NO_ENGINE_SUBSTITUTION` : Si le moteur spécifié dans `CREATE TABLE` n\'est pas disponible, renvoie une erreur au lieu de substituer silencieusement par le moteur par défaut.',
      explanation: 'Ce durcissement par défaut garantit l\'intégrité des données et aligne MySQL sur les standards stricts SQL ANSI.',
      examTrap: 'Désactiver ONLY_FULL_GROUP_BY pour "faciliter la migration de vieilles requêtes" masque des bugs de logique graves où MySQL choisit une valeur arbitraire non déterministe.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server SQL Modes',
    },
  },
  {
    id: 'fc-mysql908-dom02-025',
    cardNumber: 25,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Persistance conditionnelle : persistance des variables d\'un plugin ou composant',
    difficulty: 'hard',
    tags: ['Components', 'Plugins', 'SET PERSIST', 'mysqld-auto.cnf'],
    front: {
      question: 'Que se passe-t-il si vous persistez la variable d\'un plugin ou d\'un composant avec SET PERSIST, puis que vous désinstallez ce plugin avant de redémarrer le serveur ?',
      hint: 'Le serveur refuse-t-il de démarrer ou émet-il un avertissement ?',
    },
    back: {
      answer: 'Comportement au redémarrage :\n\n- Si une variable persistée dans `mysqld-auto.cnf` appartient à un plugin ou composant qui n\'est plus chargé au démarrage, le serveur `mysqld` **émet un avertissement dans son journal des erreurs** (`Error Log`) et continue son démarrage.\n- Il ne bloque pas le démarrage du serveur.\n- La variable reste présente dans `mysqld-auto.cnf` jusqu\'à ce que vous exécutiez `RESET PERSIST variable_name;`.',
      explanation: 'Cette tolérance évite qu\'une désinstallation de plugin tiers ne rende l\'instance MySQL totalement inopérante au prochain boot.',
      examTrap: 'Contrairement à une variable système inconnue dans my.cnf qui peut empêcher le boot, les variables inconnues dans mysqld-auto.cnf génèrent généralement un avertissement dans l\'error log.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Persisted System Variables',
    },
  },
  {
    id: 'fc-mysql908-dom02-026',
    cardNumber: 26,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Attribution de variables dynamiques par requête avec Optimizer Hints',
    difficulty: 'hard',
    tags: ['Optimizer Hints', 'SET_VAR', 'Tuning', 'Performance'],
    front: {
      question: 'Comment modifier la valeur d\'une variable système uniquement pour une requête SELECT spécifique sous MySQL 8.0 sans modifier la session entière ?',
      codeSnippet: `SELECT /*+ SET_VAR(sort_buffer_size = 16M) */ id, name 
FROM large_table 
ORDER BY name;`,
      hint: 'L\'indice d\'optimiseur /*+ SET_VAR(...) */ introduit dans MySQL 8.0.',
    },
    back: {
      answer: 'Sous MySQL 8.0, on utilise l\'indice d\'optimiseur (Optimizer Hint) **`SET_VAR`** :\n\n- Syntaxe : `/*+ SET_VAR(nom_variable = valeur) */` placé immédiatement après le verbe SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).\n- Effet : La variable système spécifiée (ex: `sort_buffer_size`, `join_buffer_size`, `max_execution_time`) prend temporairement cette nouvelle valeur **uniquement pendant l\'exécution de cette unique requête**.\n- Dès que la requête se termine, la variable de session reprend instantanément sa valeur initiale.',
      explanation: 'Cela évite de devoir gonfler des buffers de tri globalement pour tout le serveur alors qu\'une seule requête lourde en a besoin.',
      examTrap: 'Toutes les variables ne sont pas compatibles avec SET_VAR ! Seules les variables de session désignées par MySQL comme "hint-capable" peuvent être altérées ainsi.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Variable-Setting Hint Syntax (SET_VAR)',
    },
  },

  // =========================================================================
  // SECTION 3 : JOURNAL DES ERREURS (ERROR LOG) & ARCHITECTURE DES COMPOSANTS (Cartes 27 à 38)
  // Architecture log_error_services, filtres, puits JSON/texte, log_timestamps, verbosité
  // =========================================================================
  {
    id: 'fc-mysql908-dom02-027',
    cardNumber: 27,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Rôle fondamental et configuration de l\'Error Log (log_error)',
    difficulty: 'easy',
    tags: ['Error Log', 'Troubleshooting', 'log_error', 'Logs'],
    front: {
      question: 'Quel est le rôle du journal des erreurs (Error Log) de MySQL et comment configure-t-on son chemin dans my.cnf ?',
      codeSnippet: `[mysqld]
log_error = /var/log/mysql/mysqld.err`,
      hint: 'Il trace le démarrage, l\'arrêt, les crashs, les corruptions et les erreurs critiques.',
    },
    back: {
      answer: 'Le journal des erreurs enregistre :\n\n1. Les événements de démarrage et d\'arrêt du démon `mysqld`.\n2. Les phases de crash recovery du moteur InnoDB au démarrage.\n3. Les messages d\'erreurs système critiques, avertissements et blocages.\n4. Les erreurs de réplication (arrêts de threads IO/SQL) et échecs de connexion réseau répétés.\n\nConfiguration dans `my.cnf` :\n`log_error = /chemin/vers/fichier.err`\nSi aucun fichier n\'est spécifié, il s\'écrit par défaut sous Linux dans `datadir/host_name.err` (ou sur `stderr`).',
      explanation: 'C\'est le tout premier journal que le DBA doit consulter lorsqu\'un serveur refuse de démarrer ou redémarre inopinément.',
      examTrap: 'log_error est une variable statique (ReadOnly) : vous ne pouvez pas modifier son emplacement à chaud avec SET GLOBAL ! Il faut redémarrer le serveur.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The Error Log',
    },
  },
  {
    id: 'fc-mysql908-dom02-028',
    cardNumber: 28,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Nouvelle architecture des composants de journalisation sous MySQL 8.0',
    difficulty: 'hard',
    tags: ['log_error_services', 'Components', 'Architecture', 'MySQL 8.0'],
    front: {
      question: 'Comment fonctionne l\'architecture modulaire des composants de journalisation d\'erreur sous MySQL 8.0 (variable log_error_services) ?',
      codeSnippet: `SELECT @@GLOBAL.log_error_services;
-- Défaut : 'log_filter_internal; log_sink_internal'`,
      hint: 'Comprenez la distinction entre un composant filtre (filter) et un composant récepteur/puits (sink).',
    },
    back: {
      answer: 'Sous MySQL 8.0, la journalisation des erreurs est gérée par une chaîne de composants configurée via `log_error_services` :\n\n1. **Composants Filtres (Filters)** : Analysent, filtrent ou modifient les événements d\'erreur (ex: `log_filter_internal` qui applique `log_error_verbosity`).\n2. **Composants Puits / Récepteurs (Sinks)** : Écrivent les messages filtrés vers une destination (ex: `log_sink_internal` pour le format texte traditionnel, `log_sink_json` pour du JSON, ou `log_sink_syseventlog` pour syslog / Windows Event Log).\n\nLes composants sont exécutés dans l\'ordre de la chaîne spécifiée par des points-virgules.',
      explanation: 'Cette architecture permet d\'écrire simultanément dans un fichier texte classique et dans un flux JSON consommé en temps réel par Elasticsearch / Datadog.',
      examTrap: 'Si vous configurez log_error_services sans inclure de filtre (log_filter_internal), les variables de filtrage comme log_error_verbosity n\'auront plus aucun effet !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Error Logging Components',
    },
  },
  {
    id: 'fc-mysql908-dom02-029',
    cardNumber: 29,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Niveaux de verbosité du journal des erreurs : log_error_verbosity',
    difficulty: 'easy',
    tags: ['log_error_verbosity', 'Error Log', 'Verbosité', 'Filtering'],
    front: {
      question: 'Quelles sont les trois valeurs possibles pour la variable log_error_verbosity et quels types de messages filtrent-elles ?',
      codeSnippet: `SET GLOBAL log_error_verbosity = 2;`,
      hint: '1 = Erreurs seules, 2 = Erreurs + Avertissements, 3 = Erreurs + Avertissements + Notes.',
    },
    back: {
      answer: 'Niveaux de `log_error_verbosity` :\n\n- **1** : Uniquement les **Erreurs (Errors)** fatales/critiques.\n- **2** (Par défaut sous MySQL 8.0) : Les **Erreurs** ET les **Avertissements (Warnings)** (ex: connexions avortées, variables dépréciées).\n- **3** : Les **Erreurs**, les **Avertissements** ET les **Notes d\'information (Notes)** (ex: synchronisation de réplication, création automatique de tablespaces, informations d\'audit).\n\nRecommandation en production : Garder le niveau `2` par défaut, ou passer temporairement à `3` lors du dépannage d\'incidents.',
      explanation: 'Le niveau 3 peut générer un volume élevé d\'écriture disque si le serveur subit de nombreuses connexions éphémères.',
      examTrap: 'Ne pas régler log_error_verbosity à 1 en production : vous masqueriez les alertes de réplication et les déconnexions anormales qui annoncent souvent des pannes imminentes !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: log_error_verbosity',
    },
  },
  {
    id: 'fc-mysql908-dom02-030',
    cardNumber: 30,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Activation de la journalisation d\'erreurs au format JSON (log_sink_json)',
    difficulty: 'hard',
    tags: ['JSON', 'log_sink_json', 'Components', 'Observability'],
    front: {
      question: 'Quelles sont les deux étapes requises sous MySQL 8.0 pour activer la journalisation des erreurs au format structuré JSON ?',
      codeSnippet: `INSTALL COMPONENT 'file://component_log_sink_json';
SET PERSIST log_error_services = 'log_filter_internal; log_sink_json';`,
      hint: 'Il faut d\'abord charger le composant externe, puis l\'ajouter à la chaîne de services de log.',
    },
    back: {
      answer: 'Les deux étapes nécessaires sont :\n\n1. **Installer le composant récepteur JSON** :\n   `INSTALL COMPONENT \'file://component_log_sink_json\';`\n2. **Activer le service dans la chaîne de log** :\n   `SET PERSIST log_error_services = \'log_filter_internal; log_sink_json\';` (ou conserver à la fois le format texte et JSON avec `\'log_filter_internal; log_sink_internal; log_sink_json\'`).\n\nMySQL génère alors un fichier parallèle nommé `mysqld.err.00.json` parfaitement structuré pour les collecteurs de logs (Fluentd, Logstash).',
      explanation: 'Chaque ligne JSON contient les clés standardisées : timestamp, prio, err_code, err_symbol, msg, subsystem.',
      examTrap: 'Ne pas oublier le préfixe file:// dans la commande INSTALL COMPONENT, sinon le chargeur de composants échouera à localiser la bibliothèque dynamique.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - JSON Log Sink Component',
    },
  },
  {
    id: 'fc-mysql908-dom02-031',
    cardNumber: 31,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Horodatage des journaux : log_timestamps (UTC vs SYSTEM)',
    difficulty: 'medium',
    tags: ['log_timestamps', 'Timezone', 'Logs', 'Troubleshooting'],
    front: {
      question: 'Pourquoi les horodatages dans les journaux MySQL 8.0 semblent-ils parfois décalés de plusieurs heures par rapport à l\'heure de la machine hôte et comment y remédier ?',
      codeSnippet: `SELECT @@GLOBAL.log_timestamps;
-- Défaut : 'UTC'`,
      hint: 'MySQL 8.0 utilise par défaut le fuseau UTC pour tous ses journaux.',
    },
    back: {
      answer: 'Cause et solution :\n\n- **Cause** : Par défaut, sous MySQL 8.0, la variable système `log_timestamps` est réglée sur **`UTC`**. Si votre serveur est situé sur le fuseau Paris/Europe (UTC+1 ou UTC+2 en été), les lignes du journal afficheront un écart de 1 ou 2 heures avec l\'heure locale.\n- **Remède** : Pour aligner les timestamps des logs sur le fuseau horaire du système d\'exploitation, exécutez :\n  `SET PERSIST log_timestamps = SYSTEM;`',
      explanation: 'Le choix d\'UTC par défaut simplifie la corrélation d\'incidents sur des clusters de serveurs répartis sur plusieurs datacenters ou fuseaux horaires mondiaux.',
      examTrap: 'log_timestamps affecte l\'Error Log ET le Slow Query Log / General Log s\'ils écrivent dans des fichiers. Ne soyez pas surpris de voir des heures UTC après une nouvelle installation.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: log_timestamps',
    },
  },
  {
    id: 'fc-mysql908-dom02-032',
    cardNumber: 32,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Suppression ciblée de messages d\'erreur bruyants : log_error_suppression_list',
    difficulty: 'hard',
    tags: ['Error Log', 'Suppression', 'Troubleshooting', 'MySQL 8.0'],
    front: {
      question: 'Comment empêcher des codes d\'avertissement répétitifs et non critiques d\'inonder le journal des erreurs sous MySQL 8.0 ?',
      codeSnippet: `SET PERSIST log_error_suppression_list = 'MY-010003,MY-010004';`,
      hint: 'Variable introduite dans MySQL 8.0.13 acceptant une liste de codes d\'erreur numériques ou symboliques.',
    },
    back: {
      answer: 'Sous MySQL 8.0.13+, on utilise la variable **`log_error_suppression_list`** :\n\n- Elle prend une liste de codes d\'erreurs séparés par des virgules (ex: `\'MY-010003,MY-010914,10003\'`).\n- Les événements correspondants ne sont plus écrits dans le journal des erreurs.\n- **Restrictions majeures** : Seuls les messages d\'avertissement (`Warning`) et de note d\'information (`Note`) peuvent être supprimés. Il est **impossible de supprimer les messages d\'erreur critiques (`Error`)**.',
      explanation: 'Très utile pour masquer les avertissements de connexions non autorisées répétitives émises par des sondes de santé de répartiteurs de charge (load balancers).',
      examTrap: 'Vous ne pouvez jamais masquer une erreur fatale avec cette variable ! Le moteur garantit que les erreurs critiques restent toujours consignées.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: log_error_suppression_list',
    },
  },
  {
    id: 'fc-mysql908-dom02-033',
    cardNumber: 33,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Rotation à chaud des journaux d\'erreur avec FLUSH ERROR LOGS',
    difficulty: 'medium',
    tags: ['FLUSH ERROR LOGS', 'Logrotate', 'Maintenance', 'Linux'],
    front: {
      question: 'Quelle est la procédure exacte pour effectuer la rotation du journal des erreurs avec l\'utilitaire Linux logrotate sans arrêter MySQL ?',
      codeSnippet: `/var/log/mysql/mysqld.err {
    daily
    rotate 7
    postrotate
        mysqladmin --local flush-error-log
    endscript
}`,
      hint: 'Il faut renommer le fichier au niveau de l\'OS puis demander au démon MySQL de rouvrir le descripteur de fichier.',
    },
    back: {
      answer: 'Procédure standard de rotation :\n\n1. L\'utilitaire OS (`logrotate`) renomme le fichier actif (ex: `mysqld.err` $\\rightarrow$ `mysqld.err.1`).\n2. Le démon `mysqld` continuant d\'écrire dans l\'ancien descripteur de fichier ouvert, il faut lui signaler de le fermer et de rouvrir un nouveau fichier `mysqld.err`.\n3. Pour cela, exécuter l\'une des commandes suivantes :\n   - En SQL : `FLUSH ERROR LOGS;` (ou `FLUSH LOGS;`)\n   - En ligne de commande : `mysqladmin flush-error-log`\n4. Le serveur recrée immédiatement un nouveau fichier vierge `mysqld.err` et reprend ses écritures.',
      explanation: 'Sans cette notification `FLUSH`, Linux continue d\'écrire dans le fichier renommé même s\'il s\'appelle `mysqld.err.1.gz`, jusqu\'à saturation complète du disque.',
      examTrap: 'Renommer ou supprimer le fichier .err avec "rm" ne libère pas l\'espace disque tant que le processus mysqld détient le descripteur de fichier ouvert ! Il faut obligatoirement flusher.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - FLUSH Statement Syntax',
    },
  },
  {
    id: 'fc-mysql908-dom02-034',
    cardNumber: 34,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Anatomie d\'une ligne de log d\'erreur sous MySQL 8.0',
    difficulty: 'easy',
    tags: ['Error Log', 'Format', 'Anatomy', 'Troubleshooting'],
    front: {
      question: 'Identifiez les différents composants d\'une ligne moderne du journal des erreurs sous MySQL 8.0 :',
      codeSnippet: `2026-09-18T14:32:01.123456Z 0 [Warning] [MY-010003] [Server] Could not increase number of max_open_files to more than 5000.`,
      hint: 'Timestamp UTC, Thread ID, Sévérité, Code symbolique d\'erreur, Sous-système et Message.',
    },
    back: {
      answer: 'Composants d\'une ligne de log sous MySQL 8.0 :\n\n1. `2026-09-18T14:32:01.123456Z` : Horodatage ISO-8601 avec précision à la microseconde (fuseau UTC par le "Z").\n2. `0` : Identifiant du thread interne du serveur (0 indique un thread principal ou système).\n3. `[Warning]` : Niveau de sévérité (`[System]`, `[Error]`, `[Warning]`, `[Note]`).\n4. `[MY-010003]` : Code d\'erreur MySQL standardisé à 6 chiffres préfixé par "MY-".\n5. `[Server]` : Sous-système émetteur (ex: `[Server]`, `[InnoDB]`, `[Repl]`).\n6. Texte descriptif en anglais détaillant la cause de l\'alerte.',
      explanation: 'Le code standardisé `[MY-XXXXXX]` facilite grandement la recherche dans la documentation officielle d\'Oracle et la création d\'expressions régulières pour les SIEM.',
      examTrap: 'Sous MySQL 5.7 et antérieur, le format était non structuré et ne comportait pas les codes d\'erreur normalisés [MY-XXXXXX].',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Error Log Message Format',
    },
  },
  {
    id: 'fc-mysql908-dom02-035',
    cardNumber: 35,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Surveillance des connexions avortées : log_error_verbosity et log_error_services',
    difficulty: 'medium',
    tags: ['Security', 'Aborted Connections', 'Troubleshooting', 'Error Log'],
    front: {
      question: 'Quel paramètre permettait historiquement de tracer les connexions échouées et comment cela est-il géré sous MySQL 8.0 ?',
      codeSnippet: `log_error_verbosity = 2
-- Anciennement log_warnings = 2 sous MySQL 5.7`,
      hint: 'Les connexions interrompues ou avec mauvais mot de passe sont enregistrées comme Warnings.',
    },
    back: {
      answer: 'Gestion des connexions avortées :\n\n- Sous MySQL 8.0, l\'ancienne variable `log_warnings` est supprimée au profit de **`log_error_verbosity`**.\n- Lorsque `log_error_verbosity >= 2`, MySQL consigne automatiquement dans l\'Error Log tous les avertissements de type :\n  `Aborted connection X to db: \'unconnected\' user: \'baduser\' host: \'192.168.1.100\' (Got an error reading communication packets)` ou `(Access denied for user...)`.\n- On peut également surveiller les compteurs globaux de statut : `SHOW GLOBAL STATUS LIKE \'Aborted_%\';` (`Aborted_connects` et `Aborted_clients`).',
      explanation: 'Ces messages permettent de détecter des attaques par force brute sur les mots de passe ou des micro-coupures réseau entre les serveurs applicatifs et la base de données.',
      examTrap: 'log_warnings a été totalement retiré de MySQL 8.0. Si vous le mettez dans votre my.cnf, le serveur refusera de démarrer avec l\'erreur "unknown variable".',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Communication Errors and Aborted Connections',
    },
  },
  {
    id: 'fc-mysql908-dom02-036',
    cardNumber: 36,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Journalisation système : intégration avec syslog sous Linux',
    difficulty: 'hard',
    tags: ['syslog', 'Systemd', 'Logging', 'Components'],
    front: {
      question: 'Comment router les messages d\'erreur de MySQL 8.0 vers le démon syslog de Linux plutôt que dans un fichier plat traditionnel ?',
      codeSnippet: `INSTALL COMPONENT 'file://component_log_sink_syseventlog';
SET PERSIST log_error_services = 'log_filter_internal; component_log_sink_syseventlog';`,
      hint: 'Utilisation du composant log_sink_syseventlog qui remplace l\'ancien wrapper mysqld_safe syslog.',
    },
    back: {
      answer: 'Sous MySQL 8.0, le routage natif vers syslog s\'effectue via le composant d\'évènements système :\n\n1. Installer le composant : `INSTALL COMPONENT \'file://component_log_sink_syseventlog\';`\n2. Définir le service dans la chaîne de logs : `SET PERSIST log_error_services = \'log_filter_internal; component_log_sink_syseventlog\';`\n3. Les messages sont alors transmis directement au démon `rsyslog` ou `systemd-journald` de Linux avec la facilité configurée (par défaut `daemon`).',
      explanation: 'Dans les architectures conteneurisées (Docker/Kubernetes), on préfère souvent laisser log_error vide ou sur stderr pour que le conteneur capte nativement les logs stdout/stderr.',
      examTrap: 'Sous MySQL 8.0, l\'option historique --syslog du script mysqld_safe est dépréciée au profit de l\'architecture par composants de mysqld.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - System Log Sink Component',
    },
  },
  {
    id: 'fc-mysql908-dom02-037',
    cardNumber: 37,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Journalisation de la phase de Crash Recovery d\'InnoDB dans l\'Error Log',
    difficulty: 'medium',
    tags: ['Crash Recovery', 'InnoDB', 'Error Log', 'Redo Log'],
    front: {
      question: 'Quelles mentions caractéristiques apparaissent dans l\'Error Log lors du redémarrage réussi d\'un serveur MySQL après un crash non planifié ?',
      hint: 'Recherchez les étapes ARIES d\'InnoDB : Redo Log, Undo Log et point de synchronisation LSN.',
    },
    back: {
      answer: 'Lors du crash recovery, l\'Error Log consigne :\n\n1. `[InnoDB] Database was not shut down normally!` : Indique que le dirty page flush n\'a pas eu lieu.\n2. `[InnoDB] Starting crash recovery from checkpoint LSN=...` : Début du rejeu du Redo Log.\n3. `[InnoDB] 128 transaction(s) which must be rolled back or cleaned up` : Identification des transactions non validées au moment du crash.\n4. `[InnoDB] Rolling back trx with id ...` : Phase d\'annulation via les Undo Logs.\n5. `[InnoDB] Crash recovery finished.` : Fin de la phase de récupération, le moteur est cohérent et prêt à recevoir les connexions.',
      explanation: 'Si le serveur boucle indéfiniment lors de cette phase en raison d\'une corruption physique grave, le DBA doit recourir au paramètre `innodb_force_recovery`.',
      examTrap: 'Ne coupez jamais violemment un serveur pendant la ligne "Starting crash recovery" ! Interrompre le recovery peut corrompre définitivement les pages de données.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - InnoDB Recovery',
    },
  },
  {
    id: 'fc-mysql908-dom02-038',
    cardNumber: 38,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Désactivation des logs de console lors de l\'exécution en interactif',
    difficulty: 'easy',
    tags: ['Console', 'stderr', 'my.cnf', 'Options'],
    front: {
      question: 'Où vont les messages d\'erreur de mysqld si l\'option log_error n\'est pas spécifiée dans my.cnf lors d\'un lancement manuel en ligne de commande ?',
      hint: 'Flux de sortie d\'erreur standard du terminal.',
    },
    back: {
      answer: 'Si `log_error` n\'est pas configuré et que `mysqld` est exécuté directement dans un terminal interactif :\n\n- Les messages d\'erreurs sont envoyés directement sur **`stderr` (la sortie d\'erreur standard de la console)**.\n- Aucun fichier `.err` n\'est créé sur le disque.\n- Pour rediriger dans un fichier en ligne de commande : `mysqld --log-error=/var/log/mysql/mysqld.err &`',
      explanation: 'Ce comportement par défaut est très pratique pour exécuter MySQL dans des conteneurs Docker légers où la commande `docker logs` capture le flux standard.',
      examTrap: 'Si vous lancez mysqld via systemd sans log_error, systemd capture généralement stderr et le stocke dans le journal binaire (journalctl -u mysql).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Default Error Logging Behavior',
    },
  },

  // =========================================================================
  // SECTION 4 : JOURNAL GÉNÉRAL (GENERAL LOG) & SLOW QUERY LOG (Cartes 39 à 50)
  // general_log, log_output (FILE/TABLE), slow_query_log, long_query_time,
  // log_queries_not_using_indexes, log_slow_extra, mysqldumpslow
  // =========================================================================
  {
    id: 'fc-mysql908-dom02-039',
    cardNumber: 39,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Fonctionnement et activation du General Query Log',
    difficulty: 'easy',
    tags: ['General Log', 'Troubleshooting', 'Audit', 'Performance'],
    front: {
      question: 'Que consigne exactement le General Query Log de MySQL et comment l\'active-t-on dynamiquement ?',
      codeSnippet: `SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/var/log/mysql/general.log';`,
      hint: 'Il enregistre absolument tout : chaque connexion, déconnexion et requête SQL exécutée.',
    },
    back: {
      answer: 'Le General Query Log enregistre chronologiquement :\n\n1. Chaque établissement et fermeture de connexion client (adresse IP, utilisateur, heure).\n2. **Absolument chaque requête SQL** reçue par le serveur, avant même son exécution ou son optimisation (y compris les requêtes `SELECT` simples, syntaxiquement fausses ou annulées).\n\nActivation dynamique :\n`SET GLOBAL general_log = \'ON\';`\n`SET GLOBAL general_log_file = \'/chemin/vers/fichier.log\';`',
      explanation: 'C\'est l\'outil de diagnostic ultime pour observer en temps réel ce qu\'une application envoie au serveur lorsqu\'on n\'a pas accès au code source.',
      examTrap: 'Ne JAMAIS laisser le General Query Log actif en production ! Sur un serveur traitant 5000 QPS, il va saturer le disque en quelques heures et dégrader les performances de 20 à 30%.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The General Query Log',
    },
  },
  {
    id: 'fc-mysql908-dom02-040',
    cardNumber: 40,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Destination des journaux : log_output = FILE vs TABLE',
    difficulty: 'medium',
    tags: ['log_output', 'General Log', 'Slow Log', 'mysql tables'],
    front: {
      question: 'Quelles sont les implications du réglage de la variable log_output sur FILE vs TABLE pour le General Log et le Slow Query Log ?',
      codeSnippet: `SET GLOBAL log_output = 'TABLE';
-- ou
SET GLOBAL log_output = 'FILE,TABLE';`,
      hint: 'L\'une écrit dans le filesystem, l\'autre écrit dans les tables mysql.general_log et mysql.slow_log.',
    },
    back: {
      answer: 'Options de destination via `log_output` :\n\n- **`FILE`** (Défaut) : Écrit dans des fichiers texte standard sur disque (`general_log_file` et `slow_query_log_file`). Rapide et peu coûteux en verrouillage.\n- **`TABLE`** : Écrit directement dans les tables système dédiées **`mysql.general_log`** et **`mysql.slow_log`** (moteur de stockage CSV par défaut).\n  - Permet d\'interroger les logs en SQL : `SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;`\n- **`NONE`** : Désactive l\'écriture des logs même si les variables de logs sont à ON.\n- **`FILE,TABLE`** : Écrit simultanément dans les deux destinations.',
      explanation: 'Écrire en table facilite grandement les requêtes d\'analyse ad-hoc, mais le moteur CSV ne disposant pas d\'index, les requêtes `SELECT` sur ces tables effectuent un scan complet.',
      examTrap: 'La table mysql.general_log peut grossir de façon incontrôlée sous log_output=TABLE. Pour la purger, il faut faire un TRUNCATE TABLE mysql.general_log;.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Selecting General Query Log and Slow Query Log Output Destinations',
    },
  },
  {
    id: 'fc-mysql908-dom02-041',
    cardNumber: 41,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Activation et rôle du Slow Query Log',
    difficulty: 'easy',
    tags: ['Slow Query Log', 'Performance', 'Tuning', 'Troubleshooting'],
    front: {
      question: 'Qu\'est-ce que le Slow Query Log (journal des requêtes lentes) et quelles variables contrôlent son activation et son fichier cible ?',
      codeSnippet: `SET GLOBAL slow_query_log = 'ON';
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow-query.log';`,
      hint: 'Il consigne les requêtes dont le temps d\'exécution réel dépasse un seuil paramétré.',
    },
    back: {
      answer: 'Le Slow Query Log consigne toutes les requêtes SQL dont le temps d\'exécution a dépassé le seuil de durée fixé par `long_query_time` et qui ont examiné au moins `min_examined_row_limit` lignes.\n\nVariables de configuration :\n- `slow_query_log` : `ON` ou `OFF` (dynamique).\n- `slow_query_log_file` : Chemin complet du fichier de log.\n- Contrairement au General Log, son impact de performance est négligeable si le seuil est judicieusement calibré, ce qui en fait un outil de production incontournable.',
      explanation: 'Le Slow Query Log est la source numéro 1 pour identifier les requêtes nécessitant de nouveaux index ou une réécriture.',
      examTrap: 'Une requête n\'est enregistrée dans le Slow Log qu\'APRÈS la fin de son exécution complète ! Si une requête est bloquée indéfiniment par un verrou, elle n\'y apparaîtra pas tant qu\'elle ne s\'est pas terminée ou annulée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The Slow Query Log',
    },
  },
  {
    id: 'fc-mysql908-dom02-042',
    cardNumber: 42,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Configuration du seuil long_query_time en microsecondes',
    difficulty: 'medium',
    tags: ['long_query_time', 'Slow Query Log', 'Tuning', 'Microseconds'],
    front: {
      question: 'Quelle est l\'unité de mesure de la variable long_query_time sous MySQL 8.0 et quelle valeur minimale peut-on lui attribuer ?',
      codeSnippet: `SET GLOBAL long_query_time = 0.05; -- 50 millisecondes
-- ou
SET GLOBAL long_query_time = 0;    -- Toutes les requêtes`,
      hint: 'Elle accepte des nombres à virgule flottante permettant de descendre jusqu\'à la microseconde.',
    },
    back: {
      answer: 'Caractéristiques de `long_query_time` :\n\n- **Unité** : En secondes, mais accepte des **fractions décimales jusqu\'à 6 chiffres après la virgule (précision à la microseconde)**.\n- Exemples :\n  - `10` (défaut historique) : 10 secondes.\n  - `1.0` : 1 seconde.\n  - `0.1` : 100 millisecondes.\n  - `0.01` : 10 millisecondes.\n  - `0` : Enregistre absolument TOUTES les requêtes exécutées par le serveur.\n- La condition est stricte : le temps d\'exécution doit être **strictement supérieur** (`>`) à `long_query_time`.',
      explanation: 'Régler long_query_time à 0.1 ou 0.2 (100 à 200 ms) est le standard moderne recommandé en production pour capturer les micro-blocages.',
      examTrap: 'Le temps d\'attente d\'acquisition des verrous (Lock Time) n\'est PAS inclus dans le temps d\'exécution pour le calcul du dépassement de long_query_time ! C\'est le temps d\'exécution pur de la requête.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: long_query_time',
    },
  },
  {
    id: 'fc-mysql908-dom02-043',
    cardNumber: 43,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Journalisation des requêtes sans index : log_queries_not_using_indexes',
    difficulty: 'medium',
    tags: ['Indexes', 'Slow Query Log', 'Full Table Scan', 'Optimization'],
    front: {
      question: 'Que provoque l\'activation de log_queries_not_using_indexes = ON et quel paramètre permet d\'éviter la saturation du disque ?',
      codeSnippet: `SET GLOBAL log_queries_not_using_indexes = 'ON';
SET GLOBAL log_throttle_queries_not_using_indexes = 50;`,
      hint: 'Toutes les requêtes réalisant un Full Table Scan sont loguées, même si elles durent 1 milliseconde.',
    },
    back: {
      answer: 'Fonctionnement :\n\n- **`log_queries_not_using_indexes = ON`** : Force l\'enregistrement dans le Slow Log de toute requête qui effectue un balayage complet de table (Full Table Scan) ou de clé, **même si son temps d\'exécution est inférieur à `long_query_time`**.\n- **Risque de saturation** : Si une petite table système ou de référence de 5 lignes est scannée 10 000 fois par minute sans index, le Slow Log sera submergé de lignes identiques.\n- **Protection** : **`log_throttle_queries_not_using_indexes = N`** limite le nombre de ces requêtes écrites dans le log à $N$ par minute pour un même profil, évitant ainsi le déni de service I/O.',
      explanation: 'Idéal en environnement de test ou de préproduction pour traquer les clauses WHERE sur colonnes non indexées.',
      examTrap: 'Sur une table de 3 lignes, l\'optimiseur choisit délibérément un scan complet (ALL) car c\'est plus rapide qu\'un B-tree. log_queries_not_using_indexes va logger cette requête même si son plan est parfait.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The Slow Query Log',
    },
  },
  {
    id: 'fc-mysql908-dom02-044',
    cardNumber: 44,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Filtrage par volume de données examinées : min_examined_row_limit',
    difficulty: 'medium',
    tags: ['min_examined_row_limit', 'Slow Query Log', 'Noise Reduction', 'Tuning'],
    front: {
      question: 'Quel est l\'effet de la variable min_examined_row_limit sur le Slow Query Log et comment aide-t-elle à réduire le bruit ?',
      codeSnippet: `SET GLOBAL min_examined_row_limit = 1000;`,
      hint: 'Elle ignore les requêtes qui lisent très peu d\'enregistrements.',
    },
    back: {
      answer: 'Rôle de `min_examined_row_limit` :\n\n- MySQL n\'enregistrera dans le Slow Query Log **QUE** les requêtes qui ont dû examiner au moins ce nombre de lignes (`Rows_examined >= min_examined_row_limit`).\n- Si une requête dépasse `long_query_time` mais qu\'elle n\'a examiné que 5 lignes (par exemple parce qu\'elle a été bloquée par un verrou de ligne ou une fonction `SLEEP()`), elle sera **ignorée et non consignée**.\n- Réglage recommandé : `100` ou `1000` pour éliminer le bruit causé par les petites tables scannées rapidement.',
      explanation: 'Permet de cibler spécifiquement les requêtes générant de lourds balayages I/O en mémoire et sur disque.',
      examTrap: 'Si vous réglez min_examined_row_limit = 10000, une requête lente bloquée par un lock de 30 secondes qui ne touche qu\'une seule ligne ne figurera pas dans le slow log !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: min_examined_row_limit',
    },
  },
  {
    id: 'fc-mysql908-dom02-045',
    cardNumber: 45,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Enrichissement du Slow Log sous MySQL 8.0.14+ avec log_slow_extra',
    difficulty: 'hard',
    tags: ['log_slow_extra', 'MySQL 8.0', 'Observability', 'Slow Log'],
    front: {
      question: 'Quelles informations diagnostiques avancées sont ajoutées au Slow Query Log lorsque l\'option log_slow_extra est activée sous MySQL 8.0.14+ ?',
      codeSnippet: `SET GLOBAL log_slow_extra = 'ON';`,
      hint: 'Octets envoyés, tables temporaires disque, temps de CPU et informations de thread.',
    },
    back: {
      answer: 'Lorsque `log_slow_extra = ON`, MySQL enrichit chaque entrée du Slow Log avec des métriques de bas niveau ultra-précises :\n\n- `Thread_id` : Identifiant unique de connexion.\n- `Errno` : Code d\'erreur retourné à l\'application.\n- `Bytes_sent` et `Bytes_received` : Volume réseau transféré.\n- `Killed` : Indique si la requête a été tuée en cours de route.\n- `Tmp_tables` et `Tmp_disk_tables` : Nombre de tables temporaires créées en mémoire et débordées sur disque.\n- `Tmp_table_sizes` et `Tmp_disk_table_size` : Espace RAM/disque consommé par les tables temporaires.\n- `Sort_merge_passes` : Nombre de passes de tri externe sur disque.\n- `InnoDB_trx_id` : ID de la transaction InnoDB.',
      explanation: 'Permet d\'identifier instantanément si la lenteur d\'une requête vient d\'un mauvais tri sur disque ou d\'un transfert massif de données sur le réseau.',
      examTrap: 'log_slow_extra ne s\'applique que lorsque log_output = FILE. Il n\'ajoute pas de colonnes supplémentaires à la table mysql.slow_log si log_output = TABLE.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: log_slow_extra',
    },
  },
  {
    id: 'fc-mysql908-dom02-046',
    cardNumber: 46,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Inclusion des instructions DDL administratives : log_slow_admin_statements',
    difficulty: 'medium',
    tags: ['DDL', 'Slow Query Log', 'OPTIMIZE TABLE', 'ALTER TABLE'],
    front: {
      question: 'Pourquoi les opérations lourdes comme ALTER TABLE, OPTIMIZE TABLE ou CHECK TABLE n\'apparaissent-elles pas par défaut dans le Slow Query Log et comment les y inclure ?',
      codeSnippet: `SET GLOBAL log_slow_admin_statements = 'ON';`,
      hint: 'Les commandes administratives DDL sont exclues par défaut du slow log.',
    },
    back: {
      answer: 'Comportement et activation :\n\n- Par défaut, `log_slow_admin_statements = OFF` : MySQL ignore délibérément les commandes d\'administration système même si elles durent plusieurs heures.\n- En basculant `SET GLOBAL log_slow_admin_statements = \'ON\';` :\n  - Toutes les opérations administratives lentes telles que `ALTER TABLE`, `ANALYZE TABLE`, `CHECK TABLE`, `CREATE INDEX`, `DROP INDEX` et `OPTIMIZE TABLE` seront consignées dès qu\'elles dépassent `long_query_time`.\n- Recommandé pour mesurer l\'impact des migrations de schémas en production.',
      explanation: 'Un gros ALTER TABLE de 45 minutes peut saturer les I/O du serveur sans qu\'un DBA ne comprenne pourquoi s\'il ne consulte que le slow log standard sans cette option.',
      examTrap: 'N\'oubliez pas que log_slow_admin_statements respecte aussi long_query_time. Si long_query_time est à 10s, un ANALYZE TABLE prenant 2s n\'y sera pas.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: log_slow_admin_statements',
    },
  },
  {
    id: 'fc-mysql908-dom02-047',
    cardNumber: 47,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Agrégation et analyse du Slow Log avec l\'utilitaire mysqldumpslow',
    difficulty: 'medium',
    tags: ['mysqldumpslow', 'CLI', 'Profiling', 'Aggregation'],
    front: {
      question: 'Quelles sont les options les plus importantes de l\'utilitaire standard mysqldumpslow pour analyser un volumineux fichier de requêtes lentes ?',
      codeSnippet: `mysqldumpslow -s t -t 10 /var/log/mysql/slow.log
mysqldumpslow -s c -t 5 /var/log/mysql/slow.log`,
      hint: '-s pour le critère de tri (t=temps total, c=nombre d\'appels, at=temps moyen), -t pour limiter le nombre de résultats.',
    },
    back: {
      answer: 'Options clés de `mysqldumpslow` (qui abstrait automatiquement les chaînes et nombres pour regrouper les requêtes similaires) :\n\n- `-s critère` : Règle le tri :\n  - `t` : Temps total cumulé d\'exécution (Total Time).\n  - `at` : Temps moyen d\'exécution par requête (Average Time).\n  - `l` / `al` : Temps de verrouillage (Lock Time / Average Lock Time).\n  - `c` : Nombre total d\'occurrences/exécutions (Count).\n  - `r` / `ar` : Nombre de lignes retournées (Rows sent).\n- `-t N` : Affiche uniquement le Top $N$ des requêtes les plus coûteuses.\n- `-g pattern` : Filtre les requêtes correspondant à une expression régulière.',
      explanation: 'Exemple typique d\'audit DBA : `mysqldumpslow -s t -t 10 slow.log` donne immédiatement les 10 modèles de requêtes qui consomment le plus de ressources cumulées sur le serveur.',
      examTrap: 'mysqldumpslow est un script Perl fourni de base avec les paquets MySQL client/serveur. Il ne requiert aucune connexion SQL à la base.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - mysqldumpslow — Summarize Slow Query Log Files',
    },
  },
  {
    id: 'fc-mysql908-dom02-048',
    cardNumber: 48,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Anatomie d\'un bloc d\'entrée dans le Slow Query Log',
    difficulty: 'easy',
    tags: ['Slow Query Log', 'Format', 'Anatomy', 'Analysis'],
    front: {
      question: 'Interprétez les différentes métriques contenues dans cette entrée standard du Slow Query Log :',
      codeSnippet: `# Time: 2026-09-18T15:20:00.654321Z
# User@Host: app_user[app_user] @ app_server [192.168.1.50]  Id:    42
# Query_time: 4.512345  Lock_time: 0.000120 Rows_sent: 25  Rows_examined: 500000
SET timestamp=1789800000;
SELECT * FROM orders WHERE customer_id = 9999 ORDER BY order_date DESC;`,
      hint: 'Comparez Query_time avec Lock_time, et surtout Rows_sent avec Rows_examined !',
    },
    back: {
      answer: 'Analyse des métriques :\n\n1. `Time` : Heure exacte de fin d\'exécution de la requête.\n2. `User@Host` : Utilisateur SQL et adresse IP cliente source (`Id: 42` est le Connection ID).\n3. `Query_time: 4.512345` : Temps d\'exécution total (4,51 secondes).\n4. `Lock_time: 0.000120` : Temps d\'attente d\'acquisition des verrous (très faible : le problème n\'est pas un verrouillage).\n5. **`Rows_sent: 25` vs `Rows_examined: 500000`** : **Le goulet d\'étranglement évident !** Le serveur a dû parcourir 500 000 lignes pour n\'en retourner que 25 à l\'utilisateur. Un index sur `customer_id` (ou index composite `customer_id, order_date`) est manquant.',
      explanation: 'Le ratio `Rows_examined / Rows_sent` est l\'indicateur d\'efficacité numéro un pour tout DBA examinant le Slow Log.',
      examTrap: 'Si Lock_time est proche de Query_time (ex: Query_time=10s, Lock_time=9.8s), la requête en elle-même est rapide, mais a attendu qu\'une autre transaction libère un verrou !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Slow Query Log Content',
    },
  },
  {
    id: 'fc-mysql908-dom02-049',
    cardNumber: 49,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Désactivation du slow log au niveau session pour opérations de maintenance',
    difficulty: 'medium',
    tags: ['Session', 'Maintenance', 'Slow Query Log', 'sql_log_off'],
    front: {
      question: 'Comment un administrateur exécutant un script de maintenance ponctuel peut-il empêcher ses requêtes de polluer le Slow Query Log sans désactiver le log pour l\'ensemble du serveur ?',
      codeSnippet: `SET SESSION sql_log_off = 'ON';
-- Exécuter la maintenance lourde ici...
SET SESSION sql_log_off = 'OFF';`,
      hint: 'Variable de session sql_log_off.',
    },
    back: {
      answer: 'En configurant la variable de session :\n\n`SET SESSION sql_log_off = \'ON\';`\n\nEffets :\n- Toutes les requêtes exécutées à l\'intérieur de cette session spécifique ne seront **plus écrites ni dans le General Log ni dans le Slow Query Log**, même si elles durent 30 minutes.\n- Le reste des connexions clientes sur le serveur continuent d\'être tracées normalement selon la configuration globale.\n- Requiert le privilège `SYSTEM_VARIABLES_ADMIN` ou `SUPER`.',
      explanation: 'Très utile pour les scripts de purge de données historiques, de reformatage ou d\'indexation où l\'on sait à l\'avance que les requêtes seront longues.',
      examTrap: 'Ne pas confondre sql_log_off (désactive le general log et slow log pour la session) avec sql_log_bin (qui désactive le journal binaire pour la réplication).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: sql_log_off',
    },
  },
  {
    id: 'fc-mysql908-dom02-050',
    cardNumber: 50,
    domainId: 'mysql-908-dom-02',
    domainCode: 'DOM-02',
    domainTitle: 'Configuration du serveur (my.cnf), Variables, Journaux & Performance',
    subtopic: 'Procédure de rotation de la table mysql.slow_log',
    difficulty: 'hard',
    tags: ['mysql.slow_log', 'TABLE', 'Truncate', 'Maintenance'],
    front: {
      question: 'Si log_output = \'TABLE\' est configuré, quelle est la procédure correcte et sûre pour vider ou archiver la table mysql.slow_log sans bloquer le serveur ?',
      codeSnippet: `RENAME TABLE mysql.slow_log TO mysql.slow_log_old;
-- ou
TRUNCATE TABLE mysql.slow_log;`,
      hint: 'TRUNCATE TABLE mysql.slow_log est supporté directement sous MySQL 8.0.',
    },
    back: {
      answer: 'Deux méthodes autorisées sous MySQL 8.0 :\n\n**Méthode 1 (Purge directe sans interruption)** :\n`TRUNCATE TABLE mysql.slow_log;`\n(MySQL autorise nativement le TRUNCATE sur cette table même pendant que le serveur écrit dedans).\n\n**Méthode 2 (Archivage avec RENAME)** :\n1. Désactiver temporairement le log : `SET GLOBAL slow_query_log = \'OFF\';`\n2. Renommer la table : `RENAME TABLE mysql.slow_log TO mysql.slow_log_archive;`\n3. Recréer la structure vierge : `CREATE TABLE mysql.slow_log LIKE mysql.slow_log_archive;`\n4. Réactiver le log : `SET GLOBAL slow_query_log = \'ON\';`',
      explanation: 'Ne jamais tenter de supprimer le fichier CSV sur le filesystem directement pendant que mysqld tourne.',
      examTrap: 'Sous les anciennes versions, RENAME TABLE sur mysql.slow_log sans couper le log échouait avec une erreur de table verrouillée. TRUNCATE TABLE est aujourd\'hui la méthode la plus propre.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Managing General and Slow Query Logs',
    },
  },
];
