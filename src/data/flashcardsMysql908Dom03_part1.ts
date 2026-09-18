import { FlashcardItem } from '../types';

export const mysql908Dom03Part1Flashcards: FlashcardItem[] = [
  // =========================================================================
  // SECTION 1 : COMPTES UTILISATEURS, SYNTAXE, CYCLE DE VIE & MOTS DE PASSE (Cartes 1 à 15)
  // Syntaxe 'user'@'host', localhost vs 127.0.0.1, CREATE/ALTER/DROP/RENAME USER,
  // ACCOUNT LOCK, PASSWORD EXPIRE, FAILED_LOGIN_ATTEMPTS, DUAL PASSWORDS
  // =========================================================================
  {
    id: 'fc-mysql908-dom03-001',
    cardNumber: 1,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Syntaxe d\'identité d\'un compte utilisateur : \'user_name\'@\'host_name\'',
    difficulty: 'easy',
    tags: ['Account', 'Host', 'Syntax', 'Authentication'],
    front: {
      question: 'Comment MySQL identifie-t-il de manière unique un compte client et quelles sont les règles de résolution de la partie hôte (\'host_name\') ?',
      codeSnippet: `CREATE USER 'app_user'@'192.168.1.%' IDENTIFIED BY 'Password123!';
CREATE USER 'reporter'@'%.example.com' IDENTIFIED BY 'Password123!';`,
      hint: 'L\'identité combine le nom d\'utilisateur et la machine d\'origine ; le joker % et les masques CIDR sont pris en charge.',
    },
    back: {
      answer: 'MySQL identifie tout compte sous la forme stricte **`\'user_name\'@\'host_name\'`** :\n\n- Si la partie hôte est omise (ex: `CREATE USER \'john\';`), MySQL lui assigne automatiquement le joker par défaut **`\'%\'`** (toute adresse IP distante, sauf localhost via socket).\n- Le caractère joker **`%`** remplace n\'importe quelle chaîne de caractères dans un nom d\'hôte ou une adresse IP (ex: `\'192.168.1.%\'`).\n- Le joker **`_`** remplace exactement un caractère.\n- Les masques de sous-réseau IPv4 au format CIDR ou décimal sont valides : `\'192.168.1.0/255.255.255.0\'` ou `\'192.168.1.0/24\'` (depuis MySQL 8.0).\n- `\'user\'@\'192.168.1.10\'` et `\'user\'@\'%\'` sont deux comptes **totalement distincts**, avec leurs propres mots de passe et leurs propres privilèges.',
      explanation: 'La distinction fine par hôte permet d\'accorder des privilèges d\'administration uniquement depuis une machine bastion et des droits de lecture seule depuis les postes de travail.',
      examTrap: 'Dans mysql.user, \'user\'@\'%\' ne correspond PAS aux connexions locales Unix via localhost ! Une connexion locale cherchera en priorité un compte \'user\'@\'localhost\'.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Specifying Account Names',
    },
  },
  {
    id: 'fc-mysql908-dom03-002',
    cardNumber: 2,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Différence critique entre \'localhost\' et \'127.0.0.1\'',
    difficulty: 'medium',
    tags: ['localhost', 'Socket', 'TCP/IP', 'Networking', 'Security'],
    front: {
      question: 'Pourquoi un utilisateur défini comme \'dev\'@\'127.0.0.1\' ne peut-il pas se connecter avec la commande client standard "mysql -u dev -p" sous Linux ?',
      codeSnippet: `CREATE USER 'dev'@'127.0.0.1' IDENTIFIED BY 'Pass123!';
-- Connexion depuis le même serveur :
$ mysql -u dev -p
-- Erreur : ERROR 1045 (28000): Access denied for user 'dev'@'localhost'`,
      hint: 'Pensez au protocole de transport : socket de domaine UNIX vs pile réseau TCP/IP.',
    },
    back: {
      answer: 'Sous Linux / Unix, les règles de transport diffèrent fondamentalement :\n\n- **`localhost`** (sans spécifier d\'hôte ou avec `-h localhost`) force le client MySQL à utiliser un **socket de domaine UNIX local** (ex: `/var/run/mysqld/mysqld.sock`). Le serveur résout cette connexion comme provenant de l\'hôte virtuel **`localhost`**.\n- **`127.0.0.1`** (avec `-h 127.0.0.1 -P 3306`) force le client à utiliser la **pile réseau TCP/IP** sur l\'interface de boucle locale (loopback).\n\nPour que `dev` puisse se connecter via socket local, il faut créer `\'dev\'@\'localhost\'`, ou spécifier explicitement le protocole TCP avec : `mysql -h 127.0.0.1 -u dev -p`.',
      explanation: 'Sur Windows, named pipes ou shared memory jouent un rôle similaire pour les connexions locales, tandis que TCP/IP écoute sur 127.0.0.1.',
      examTrap: 'Piège d\'examen classique : "CREATE USER \'admin\'@\'127.0.0.1\'" ne permet PAS de se connecter via un socket UNIX local sans passer -h 127.0.0.1 ou --protocol=TCP.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Connection Management & Transport Protocols',
    },
  },
  {
    id: 'fc-mysql908-dom03-003',
    cardNumber: 3,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Ordre de résolution et de tri des comptes dans mysql.user',
    difficulty: 'hard',
    tags: ['mysql.user', 'Authentication', 'Resolution', 'Matching Order'],
    front: {
      question: 'Lorsqu\'un client se connecte, comment le serveur MySQL détermine-t-il quel compte de la table mysql.user tester en premier lorsqu\'il existe plusieurs comptes correspondants ?',
      codeSnippet: `-- Comptes existants dans mysql.user :
-- 1) 'alice'@'%'
-- 2) 'alice'@'192.168.1.50'
-- 3) ''@'192.168.1.50' (utilisateur anonyme)
-- Alice se connecte depuis 192.168.1.50 : quel compte est évalué ?`,
      hint: 'MySQL trie les lignes de mysql.user en mémoire selon la spécificité décroissante de l\'hôte, puis du nom d\'utilisateur.',
    },
    back: {
      answer: 'Le serveur MySQL trie les lignes de `mysql.user` en mémoire selon l\'ordre suivant :\n\n1. **Colonne `Host` la plus spécifique d\'abord** :\n   - Les adresses IP littérales et noms d\'hôtes exacts (sans joker) sont prioritaires.\n   - Viennent ensuite les masques de sous-réseau et les motifs avec jokers (`%`, `_`).\n   - Le joker global `\'%\'` seul arrive en dernier.\n2. **Colonne `User` la plus spécifique ensuite** :\n   - Les noms d\'utilisateurs non vides sont prioritaires sur les utilisateurs anonymes (`User = \'\'`).\n\nDans l\'exemple, Alice se connectant depuis `192.168.1.50` correspondra à **`\'alice\'@\'192.168.1.50\'`** (hôte exact et utilisateur exact). Si seul `\'\'@\'192.168.1.50\'` existait face à `\'alice\'@\'%\'`, l\'utilisateur anonyme avec hôte exact l\'emporterait !',
      explanation: 'Cette règle de tri "Hôte le plus spécifique d\'abord" explique pourquoi un compte anonyme sur une IP exacte peut masquer un compte nommé défini sur \'%\'.',
      examTrap: 'Attention au piège de l\'utilisateur anonyme : un compte \'\'@\'serveur1\' prend le pas sur \'bob\'@\'%\' lorsque Bob se connecte depuis serveur1 ! C\'est pourquoi il faut toujours supprimer les comptes anonymes.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Access Control, Stage 1: Connection Verification',
    },
  },
  {
    id: 'fc-mysql908-dom03-004',
    cardNumber: 4,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Création de comptes avec CREATE USER et options modernes',
    difficulty: 'easy',
    tags: ['CREATE USER', 'Syntax', 'Security', 'MySQL 8.0'],
    front: {
      question: 'Quelle est la syntaxe complète pour créer un utilisateur sous MySQL 8.0 en spécifiant un mot de passe, un verrouillage initial et une obligation de changer de mot de passe à la première connexion ?',
      codeSnippet: `CREATE USER IF NOT EXISTS 'dba_junior'@'%'
  IDENTIFIED BY 'InitialPassword#2026'
  PASSWORD EXPIRE
  ACCOUNT LOCK;`,
      hint: 'Combinaison des clauses IDENTIFIED BY, PASSWORD EXPIRE et ACCOUNT LOCK.',
    },
    back: {
      answer: 'Syntaxe standard sous MySQL 8.0 :\n\n```sql\nCREATE USER IF NOT EXISTS \'nom_user\'@\'host\'\n  IDENTIFIED BY \'mot_de_passe\'\n  PASSWORD EXPIRE\n  ACCOUNT LOCK;\n```\n\nEffets des clauses :\n- `IDENTIFIED BY` : Stocke le mot de passe chiffré selon le plugin par défaut (`caching_sha2_password`).\n- `PASSWORD EXPIRE` : Force l\'expiration immédiate du mot de passe ; l\'utilisateur ne pourra exécuter aucune requête tant qu\'il n\'aura pas fait un `ALTER USER ... IDENTIFIED BY ...`.\n- `ACCOUNT LOCK` : Verrouille le compte dès sa création (interdit la connexion jusqu\'au déverrouillage manuel par le DBA).\n- Requiert le privilège `CREATE USER` ou `SYSTEM_USER`.',
      explanation: 'Cette combinaison est la bonne pratique de provisionnement sécurisé : le compte est créé inactif, puis déverrouillé lors de la prise de poste de l\'employé.',
      examTrap: 'Sous MySQL 8.0, la commande "GRANT ... TO \'user\'@\'host\' IDENTIFIED BY \'pass\';" N\'EST PLUS AUTORISÉE ! On doit impérativement utiliser CREATE USER avant de faire un GRANT.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - CREATE USER Statement',
    },
  },
  {
    id: 'fc-mysql908-dom03-005',
    cardNumber: 5,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Modification de compte avec ALTER USER',
    difficulty: 'medium',
    tags: ['ALTER USER', 'Password', 'Security', 'Administration'],
    front: {
      question: 'Quelles opérations courantes d\'administration des identités sont effectuées exclusivement via l\'instruction ALTER USER ?',
      codeSnippet: `ALTER USER 'john'@'%' 
  IDENTIFIED BY 'BrandNewSecret#2026'
  ACCOUNT UNLOCK;`,
      hint: 'Changement de mot de passe, déverrouillage, changement de plugin, réglage des quotas de ressources et politiques TLS.',
    },
    back: {
      answer: 'L\'instruction `ALTER USER` permet de modifier tous les attributs d\'un compte existant sans toucher à ses privilèges :\n\n1. **Changement de mot de passe** : `IDENTIFIED BY \'nouveau_mdp\'`\n2. **Verrouillage / Déverrouillage** : `ACCOUNT LOCK` / `ACCOUNT UNLOCK`\n3. **Gestion de l\'expiration** : `PASSWORD EXPIRE NEVER` ou `PASSWORD EXPIRE INTERVAL 90 DAY`\n4. **Changement de plugin d\'authentification** : `IDENTIFIED WITH caching_sha2_password BY \'pass\'`\n5. **Limites de ressources** : `WITH MAX_QUERIES_PER_HOUR 500 MAX_USER_CONNECTIONS 5`\n6. **Exigences TLS** : `REQUIRE SSL` ou `REQUIRE X509`\n7. **Rotation de double mot de passe** : `RETAIN CURRENT PASSWORD` / `DISCARD OLD PASSWORD`.',
      explanation: 'ALTER USER est atomique et prend effet immédiatement pour toutes les nouvelles connexions établies.',
      examTrap: 'Pour modifier son propre mot de passe sans privilège administrateur, un utilisateur standard peut exécuter : ALTER USER USER() IDENTIFIED BY \'mon_nouveau_mdp\';',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - ALTER USER Statement',
    },
  },
  {
    id: 'fc-mysql908-dom03-006',
    cardNumber: 6,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Suppression de compte avec DROP USER et nettoyage des privilèges',
    difficulty: 'medium',
    tags: ['DROP USER', 'Privileges', 'Cleanup', 'Atomicity'],
    front: {
      question: 'Que se passe-t-il pour les privilèges d\'un utilisateur lorsque la commande DROP USER est exécutée sous MySQL 8.0, et cette opération est-elle atomique ?',
      codeSnippet: `DROP USER IF EXISTS 'stagiaire'@'192.168.1.%', 'test_user'@'localhost';`,
      hint: 'Contrairement aux versions antérieures à 5.7, DROP USER nettoie automatiquement toutes les tables d\'autorisations.',
    },
    back: {
      answer: 'Comportement de `DROP USER` sous MySQL 8.0 :\n\n- **Nettoyage automatique et exhaustif** : Supprime l\'enregistrement du compte dans `mysql.user` ET révoque immédiatement **tous ses privilèges** dans les tables associées (`mysql.db`, `mysql.tables_priv`, `mysql.columns_priv`, `mysql.procs_priv`, `mysql.default_roles`, `mysql.role_edges`, `mysql.global_grants`). Aucun privilège orphelin ne subsiste.\n- **Atomicité transactionnelle** : `DROP USER` est une opération DDL entièrement **atomique et crash-safe** sous MySQL 8.0 (grâce au dictionnaire de données transactionnel InnoDB). Si la commande cible plusieurs utilisateurs et qu\'un échec survient, toute l\'opération est rollbackée.\n- Les sessions déjà ouvertes par cet utilisateur ne sont pas déconnectées instantanément, mais aucune nouvelle session ne peut être établie.',
      explanation: 'Sous de très anciennes versions de MySQL, DROP USER laissait des résidus dans mysql.db, ce qui n\'est plus du tout le cas sous MySQL 8.0.',
      examTrap: 'DROP USER ne tue pas les connexions actives de l\'utilisateur ! Pour l\'expulser immédiatement, le DBA doit exécuter KILL connection_id pour chaque session résiduelle.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - DROP USER Statement',
    },
  },
  {
    id: 'fc-mysql908-dom03-007',
    cardNumber: 7,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Renommage de compte avec RENAME USER',
    difficulty: 'easy',
    tags: ['RENAME USER', 'Security', 'Refactoring', 'Administration'],
    front: {
      question: 'Quelle est la syntaxe pour renommer un compte utilisateur ou changer son masque d\'hôte sans réinitialiser ses privilèges ni son mot de passe ?',
      codeSnippet: `RENAME USER 'old_app'@'192.168.1.10' TO 'new_app'@'192.168.1.%';`,
      hint: 'RENAME USER transfère automatiquement tous les privilèges existants vers la nouvelle identité.',
    },
    back: {
      answer: 'L\'instruction officielle est :\n\n`RENAME USER \'ancien_user\'@\'ancien_host\' TO \'nouveau_user\'@\'nouveau_host\';`\n\nPropriétés clés :\n- Transfère automatiquement **le mot de passe chiffré**, les privilèges globaux, de base, de table, de colonne, les rôles associés et les attributs du compte.\n- Permet de renommer plusieurs comptes en une seule instruction atomique séparée par des virgules :\n  `RENAME USER \'u1\'@\'%\' TO \'u1_old\'@\'%\', \'u2\'@\'%\' TO \'u2_old\'@\'%\';`\n- Requiert le privilège `CREATE USER` (ou le déprécié `UPDATE` sur le schéma `mysql`).',
      explanation: 'Idéal lors d\'une migration réseau pour changer la contrainte d\'IP d\'un compte sans devoir re-générer un mot de passe ni réécrire tous les GRANTs.',
      examTrap: 'Si le compte de destination existe déjà, la commande échoue avec une erreur et l\'ancien compte reste intact.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - RENAME USER Statement',
    },
  },
  {
    id: 'fc-mysql908-dom03-008',
    cardNumber: 8,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Verrouillage et déverrouillage manuel de compte : ACCOUNT LOCK / UNLOCK',
    difficulty: 'easy',
    tags: ['ACCOUNT LOCK', 'ACCOUNT UNLOCK', 'Security', 'User Management'],
    front: {
      question: 'Comment verrouiller temporairement un compte suspect sans changer son mot de passe ni supprimer ses privilèges, et quel message d\'erreur reçoit le client ?',
      codeSnippet: `ALTER USER 'suspicious_dev'@'%' ACCOUNT LOCK;
-- Tentative de connexion du client :
-- ERROR 3118 (HY000): Access denied for user 'suspicious_dev'@'...'. Account is locked.`,
      hint: 'La clause ACCOUNT LOCK positionne la colonne account_locked à Y dans mysql.user.',
    },
    back: {
      answer: 'Verrouillage et déverrouillage :\n\n- **Verrouillage** : `ALTER USER \'user\'@\'host\' ACCOUNT LOCK;`\n  - Positionne l\'attribut `account_locked = \'Y\'` dans `mysql.user`.\n  - Toute nouvelle tentative de connexion est rejetée immédiatement avec l\'erreur standard `ER_ACCOUNT_HAS_BEEN_LOCKED` (ERROR 3118).\n  - Le mot de passe, l\'historique et tous les privilèges restent strictement préservés.\n- **Déverrouillage** : `ALTER USER \'user\'@\'host\' ACCOUNT UNLOCK;`\n  - Rétablit instantanément l\'accès sans aucune autre manipulation.',
      explanation: 'Méthode recommandée par les normes de sécurité lorsqu\'un salarié quitte temporairement l\'entreprise (congé sabbatique, enquête interne).',
      examTrap: 'Le verrouillage n\'interrompt pas les sessions en cours de l\'utilisateur ! Il empêche seulement les futures connexions.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Account Locking',
    },
  },
  {
    id: 'fc-mysql908-dom03-009',
    cardNumber: 9,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Politique d\'expiration des mots de passe : PASSWORD EXPIRE',
    difficulty: 'medium',
    tags: ['PASSWORD EXPIRE', 'default_password_lifetime', 'Compliance', 'Security'],
    front: {
      question: 'Quelles sont les options pour configurer l\'expiration périodique des mots de passe au niveau global et au niveau individuel sous MySQL 8.0 ?',
      codeSnippet: `-- Expiration globale tous les 90 jours :
SET PERSIST default_password_lifetime = 90;

-- Expiration individuelle :
ALTER USER 'analyst'@'%' PASSWORD EXPIRE INTERVAL 60 DAY;
ALTER USER 'service_daemon'@'%' PASSWORD EXPIRE NEVER;`,
      hint: 'default_password_lifetime au niveau serveur, et clauses INTERVAL N DAY / NEVER au niveau compte.',
    },
    back: {
      answer: 'Gestion de l\'expiration des mots de passe :\n\n1. **Au niveau global (my.cnf ou SET PERSIST)** :\n   - Variable `default_password_lifetime = N` (en jours, défaut : `0` = jamais expirant sous 8.0).\n   - Si $N > 0$, tous les comptes n\'ayant pas de règle explicite expirent au bout de $N$ jours.\n2. **Au niveau individuel (par compte)** :\n   - `PASSWORD EXPIRE` : Expiration manuelle immédiate.\n   - `PASSWORD EXPIRE INTERVAL N DAY` : Définit une durée de vie propre à ce compte, qui surcharge la variable globale.\n   - `PASSWORD EXPIRE NEVER` : Désactive l\'expiration pour ce compte (crucial pour les comptes de service applicatifs ou de réplication).\n   - `PASSWORD EXPIRE DEFAULT` : Réinitialise le compte pour suivre la politique globale du serveur.',
      explanation: 'Quand un mot de passe expire, le client peut toujours se connecter mais MySQL place la session dans un "mode restreint" : toute commande échoue sauf `ALTER USER` pour changer son mot de passe.',
      examTrap: 'Attention : sous MySQL 5.7.4 à 5.7.10, default_password_lifetime valait 360 jours par défaut, causant des blocages inopinés. Sous MySQL 8.0, sa valeur par défaut est 0 (désactivé).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Password Expiration Policy',
    },
  },
  {
    id: 'fc-mysql908-dom03-010',
    cardNumber: 10,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Historique et non-réutilisation des mots de passe : PASSWORD HISTORY & REUSE INTERVAL',
    difficulty: 'medium',
    tags: ['PASSWORD HISTORY', 'PASSWORD REUSE INTERVAL', 'Compliance', 'Security'],
    front: {
      question: 'Comment empêcher les utilisateurs de réutiliser leurs anciens mots de passe en combinant nombre d\'occurrences et délai calendaire ?',
      codeSnippet: `ALTER USER 'accounting_user'@'%'
  PASSWORD HISTORY 5
  PASSWORD REUSE INTERVAL 365 DAY;`,
      hint: 'PASSWORD HISTORY compte le nombre de changements passés, PASSWORD REUSE INTERVAL mesure le temps écoulé.',
    },
    back: {
      answer: 'Politique anti-réutilisation de mots de passe sous MySQL 8.0 :\n\n1. **Contrôle par nombre de changements** :\n   - Global : `password_history = N`\n   - Par compte : `ALTER USER ... PASSWORD HISTORY N;`\n   - Interdit de réutiliser l\'un des $N$ derniers mots de passe précédents.\n2. **Contrôle par durée calendaire** :\n   - Global : `password_reuse_interval = N` (en jours)\n   - Par compte : `ALTER USER ... PASSWORD REUSE INTERVAL N DAY;`\n   - Interdit de réutiliser un mot de passe utilisé au cours des $N$ derniers jours.\n3. **Cumul des deux règles** :\n   - Si les deux sont définies, le nouveau mot de passe doit satisfaire les DEUX contraintes simultanément.',
      explanation: 'L\'historique des empreintes de mot de passe est stocké de manière sécurisée dans la table système `mysql.password_history`.',
      examTrap: 'Pour rétablir un compte afin qu\'il suive la politique globale du serveur, utilisez : PASSWORD HISTORY DEFAULT PASSWORD REUSE INTERVAL DEFAULT.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Password Reuse Policy',
    },
  },
  {
    id: 'fc-mysql908-dom03-011',
    cardNumber: 11,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Protection anti-brute-force : FAILED_LOGIN_ATTEMPTS & PASSWORD_LOCK_TIME',
    difficulty: 'hard',
    tags: ['FAILED_LOGIN_ATTEMPTS', 'PASSWORD_LOCK_TIME', 'Brute Force', 'Security'],
    front: {
      question: 'Comment configurer un compte pour qu\'il se verrouille automatiquement pendant 3 jours après 4 tentatives consécutives de mot de passe erroné ?',
      codeSnippet: `ALTER USER 'portal_user'@'%'
  FAILED_LOGIN_ATTEMPTS 4
  PASSWORD_LOCK_TIME 3;`,
      hint: 'Clauses FAILED_LOGIN_ATTEMPTS et PASSWORD_LOCK_TIME.',
    },
    back: {
      answer: 'Configuration du verrouillage automatique anti-brute-force :\n\n```sql\nALTER USER \'portal_user\'@\'%\'\n  FAILED_LOGIN_ATTEMPTS 4\n  PASSWORD_LOCK_TIME 3;\n```\n\nFonctionnement :\n- `FAILED_LOGIN_ATTEMPTS N` : Nombre d\'échecs consécutifs autorisés avant verrouillage automatique (défaut : 0 = désactivé).\n- `PASSWORD_LOCK_TIME M` : Durée du verrouillage automatique en jours (défaut : 0 = verrouillage permanent nécessitant intervention manuelle du DBA via `ACCOUNT UNLOCK`).\n- Dès que 4 échecs surviennent, le compte est verrouillé pour 3 jours (72h).\n- Une connexion réussie avant d\'atteindre 4 réinitialise le compteur d\'échecs à 0.',
      explanation: 'Ce mécanisme protège efficacement contre les dictionnaires et les attaques automatisées sans nécessiter d\'outils tiers comme fail2ban.',
      examTrap: 'PASSWORD_LOCK_TIME s\'exprime en JOURS ! Pour verrouiller 1 jour, mettez 1. Mettre PASSWORD_LOCK_TIME UNBOUNDED signifie que le compte reste verrouillé jusqu\'à déverrouillage manuel.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Failed-Login Tracking and Temporary Account Locking',
    },
  },
  {
    id: 'fc-mysql908-dom03-012',
    cardNumber: 12,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Fonctionnalité de doubles mots de passe (Dual Passwords) : RETAIN CURRENT PASSWORD',
    difficulty: 'hard',
    tags: ['Dual Passwords', 'RETAIN CURRENT PASSWORD', 'Zero Downtime', 'Rotation'],
    front: {
      question: 'Qu\'est-ce que la fonctionnalité Dual Passwords introduite dans MySQL 8.0 et comment permet-elle la rotation des identifiants applicatifs sans interruption de service ?',
      codeSnippet: `ALTER USER 'app_prod'@'%'
  IDENTIFIED BY 'NewSecurePass2026!'
  RETAIN CURRENT PASSWORD;`,
      hint: 'Le compte accepte simultanément le nouveau mot de passe primaire et l\'ancien mot de passe secondaire.',
    },
    back: {
      answer: 'La fonctionnalité **Dual Passwords** permet à un compte de posséder simultanément deux mots de passe valides (un primaire et un secondaire) :\n\n- **Problème résolu** : Dans un cluster de 50 serveurs applicatifs, changer un mot de passe provoquait des erreurs 1045 lors du déploiement progressif (rolling update) car l\'ancien mot de passe était invalidé d\'un coup.\n- **Étape 1** : L\'administrateur exécute `ALTER USER ... IDENTIFIED BY \'NewPass\' RETAIN CURRENT PASSWORD;`.\n- Le nouveau mot de passe devient le **Primary Password** et l\'ancien est conservé comme **Secondary Password**.\n- Les deux mots de passe sont acceptés pour la connexion pendant toute la durée de la mise à jour des applications.',
      explanation: 'Une fois tous les nœuds applicatifs redéployés avec le nouveau mot de passe, l\'administrateur révoque l\'ancien mot de passe secondaire.',
      examTrap: 'Un compte ne peut avoir qu\'UN SEUL mot de passe secondaire. Si vous ré-exécutez RETAIN CURRENT PASSWORD une 2ème fois, le mot de passe secondaire précédent est écrasé par le mot de passe primaire sortant.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Dual Password Support',
    },
  },
  {
    id: 'fc-mysql908-dom03-013',
    cardNumber: 13,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Suppression du mot de passe secondaire : DISCARD OLD PASSWORD',
    difficulty: 'medium',
    tags: ['Dual Passwords', 'DISCARD OLD PASSWORD', 'Rotation', 'Security'],
    front: {
      question: 'Quelle instruction finalise le cycle de rotation d\'un double mot de passe en supprimant définitivement le mot de passe secondaire ?',
      codeSnippet: `ALTER USER 'app_prod'@'%' DISCARD OLD PASSWORD;`,
      hint: 'DISCARD OLD PASSWORD invalide immédiatement le mot de passe secondaire.',
    },
    back: {
      answer: 'L\'instruction de clôture est :\n\n`ALTER USER \'nom_compte\'@\'host\' DISCARD OLD PASSWORD;`\n\nEffets :\n- Supprime le mot de passe secondaire (`password_timestamp` secondaire purgé).\n- Dès cet instant, seule la connexion avec le mot de passe primaire (`NewSecurePass2026!`) est autorisée.\n- Toute tentative d\'authentification avec l\'ancien mot de passe est rejetée avec une erreur `ER_ACCESS_DENIED_ERROR`.\n- Clôture formellement la fenêtre de transition de sécurité.',
      explanation: 'Cette commande ne modifie pas le mot de passe primaire actif.',
      examTrap: 'Si vous oubliez d\'exécuter DISCARD OLD PASSWORD, l\'ancien mot de passe reste indéfiniment valide, laissant une brèche de sécurité ouverte.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Dual Password Support: Discarding Secondary Passwords',
    },
  },
  {
    id: 'fc-mysql908-dom03-014',
    cardNumber: 14,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Attributs et métadonnées JSON des comptes : COMMENT et ATTRIBUTE',
    difficulty: 'medium',
    tags: ['ATTRIBUTE', 'COMMENT', 'JSON', 'Metadata', 'MySQL 8.0'],
    front: {
      question: 'Comment attacher des métadonnées métier structurées en JSON ou un commentaire textuel à un compte utilisateur dans MySQL 8.0 ?',
      codeSnippet: `CREATE USER 'microservice_cart'@'%' IDENTIFIED BY 'Pass123!'
  COMMENT 'Compte de paiement v2'
  ATTRIBUTE '{"owner": "Team Billing", "environment": "Production", "cost_center": 402}';`,
      hint: 'Clauses COMMENT pour le texte brut et ATTRIBUTE pour un document JSON indexé.',
    },
    back: {
      answer: 'Sous MySQL 8.0, les clauses `COMMENT` et `ATTRIBUTE` permettent d\'enrichir la fiche du compte :\n\n- **`COMMENT \'texte\'`** : Stocke un texte libre descriptif.\n- **`ATTRIBUTE \'{"clé": "valeur", ...}\'`** : Stocke un document JSON valide.\n- Pour modifier ou fusionner des attributs ultérieurement :\n  `ALTER USER \'user\'@\'%\' ATTRIBUTE \'{"owner": "New Team"}\';`\n- **Consultation des attributs** :\n  Interroger la table `information_schema.USER_ATTRIBUTES` qui expose les colonnes `USER`, `HOST`, et `ATTRIBUTE` au format JSON natif.',
      explanation: 'Permet aux scripts d\'audit et d\'orchestration (DevOps, Terraform) de mapper les comptes de base de données avec les propriétaires de services de l\'entreprise.',
      examTrap: 'Pour supprimer un attribut spécifique sans effacer les autres, passez une valeur null dans le JSON : ALTER USER \'user\'@\'%\' ATTRIBUTE \'{"cost_center": null}\';',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - User Comments and User Attributes',
    },
  },
  {
    id: 'fc-mysql908-dom03-015',
    cardNumber: 15,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Architecture interne de la table mysql.user sous MySQL 8.0',
    difficulty: 'hard',
    tags: ['mysql.user', 'InnoDB', 'Data Dictionary', 'Internals'],
    front: {
      question: 'Quels changements architecturaux majeurs ont été apportés aux tables système d\'authentification (mysql.user, etc.) sous MySQL 8.0 par rapport à MySQL 5.7 ?',
      hint: 'Disparition des tables MyISAM au profit du dictionnaire de données transactionnel InnoDB, suppression de colonnes obsolètes.',
    },
    back: {
      answer: 'Changements architecturaux majeurs sous MySQL 8.0 :\n\n1. **Moteur InnoDB transactionnel** : Toutes les tables du schéma `mysql` (`user`, `db`, `tables_priv`, etc.) utilisent désormais le moteur **InnoDB** au lieu de MyISAM. Les modifications de droits sont crash-safe et atomiques.\n2. **Suppression de la colonne `Password`** : La colonne historique `Password` a été totalement supprimée au profit exclusif de `authentication_string` et `plugin`.\n3. **Introduction de `account_locked` et `password_expired`** : Colonnes dédiées aux statuts de sécurité.\n4. **Nouvelles tables de support RBAC et clés** :\n   - `mysql.role_edges` (graphe de rôles)\n   - `mysql.default_roles` (rôles par défaut)\n   - `mysql.global_grants` (privilèges dynamiques)\n   - `mysql.password_history` (historique anti-réutilisation).',
      explanation: 'L\'interdiction de modifier directement `mysql.user` via des `UPDATE` SQL est renforcée : il faut utiliser impérativement la syntaxe déclarative `CREATE USER / ALTER USER / GRANT`.',
      examTrap: 'Tenter de faire un "INSERT INTO mysql.user ..." direct sans utiliser CREATE USER est une pratique bannie qui peut corrompre les métadonnées internes du dictionnaire de données.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Grant Tables Structure',
    },
  },

  // =========================================================================
  // SECTION 2 : PLUGINS & MÉTHODES D'AUTHENTIFICATION (Cartes 16 à 30)
  // caching_sha2_password, mysql_native_password, sha256_password,
  // PAM, LDAP, Windows Kerberos, auth_socket, MFA (MySQL 8.0.27+)
  // =========================================================================
  {
    id: 'fc-mysql908-dom03-016',
    cardNumber: 16,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Plugin par défaut sous MySQL 8.0 : caching_sha2_password',
    difficulty: 'easy',
    tags: ['caching_sha2_password', 'SHA-256', 'Authentication', 'MySQL 8.0'],
    front: {
      question: 'Quel est le plugin d\'authentification par défaut dans MySQL 8.0 et quels sont ses deux atouts majeurs par rapport à mysql_native_password et sha256_password ?',
      codeSnippet: `SELECT user, host, plugin FROM mysql.user WHERE user = 'root';
-- Résultat : root | localhost | caching_sha2_password`,
      hint: 'Chiffrement SHA-256 robuste contre le cassage et cache mémoire en RAM pour des connexions ultra-rapides.',
    },
    back: {
      answer: 'Le plugin par défaut est **`caching_sha2_password`** :\n\n1. **Sécurité cryptographique de pointe (SHA-256 + Salage)** : Utilise l\'algorithme SHA-256 avec salage fort à 20 octets, rendant les attaques par rainbow tables et par force brute totalement inopérantes (contrairement au vieil algorithme SHA-1 de `mysql_native_password`).\n2. **Performances extrêmes grâce au cache mémoire (Fast Authentication)** : Le serveur conserve en mémoire vive un cache des hash de session. Pour les connexions successives d\'un même client, l\'authentification s\'effectue instantanément sans calcul RSA lourd, résolvant le goulot d\'étranglement de latence de l\'ancien plugin `sha256_password`.',
      explanation: 'Il allie la sécurité absolue de `sha256_password` et la rapidité de connexion de `mysql_native_password`.',
      examTrap: 'Les très vieux connecteurs clients (anciens PHP PDO, vieux drivers JDBC pré-8.0) ne supportant pas caching_sha2_password refuseront la connexion avec une erreur "Authentication plugin caching_sha2_password cannot be loaded".',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Caching SHA-2 Pluggable Authentication',
    },
  },
  {
    id: 'fc-mysql908-dom03-017',
    cardNumber: 17,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Dépréciation et vulnérabilités de mysql_native_password',
    difficulty: 'medium',
    tags: ['mysql_native_password', 'SHA-1', 'Deprecation', 'Security'],
    front: {
      question: 'Pourquoi le plugin d\'authentification historique mysql_native_password est-il déprécié sous MySQL 8.0 et quel est son mécanisme de hachage ?',
      codeSnippet: `CREATE USER 'legacy_app'@'%' 
  IDENTIFIED WITH mysql_native_password BY 'OldPass123!';
-- Avertissement de dépréciation déclenché`,
      hint: 'Double hachage SHA-1 sans sel unique par utilisateur.',
    },
    back: {
      answer: 'Raisons de la dépréciation de `mysql_native_password` :\n\n1. **Algorithme SHA-1 dépassé** : Utilise la formule `SHA1(SHA1(password)) ^ SHA1(seed + SHA1(SHA1(password)))`. SHA-1 souffre de faiblesses mathématiques et de collisions démontrées.\n2. **Absence de salage (salt) persistant** : Deux utilisateurs ayant le même mot de passe ont rigoureusement la même chaîne de hachage dans la colonne `authentication_string`, ce qui facilite les attaques massives par dictionnaires précalculés.\n3. **Statut MySQL 8.0** : Déprécié dès MySQL 8.0, désactivé par défaut sous MySQL 8.4 LTS, et voué à une suppression totale dans les versions futures.',
      explanation: 'Oracle recommande de migrer impérativement tous les comptes vers `caching_sha2_password`.',
      examTrap: 'Si vous configurez un compte avec mysql_native_password sous MySQL 8.0, cela fonctionne encore mais déclenche un avertissement dans les logs d\'erreur.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Native Pluggable Authentication',
    },
  },
  {
    id: 'fc-mysql908-dom03-018',
    cardNumber: 18,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Fonctionnement interne du plugin caching_sha2_password : Fast Auth vs Full Auth',
    difficulty: 'hard',
    tags: ['caching_sha2_password', 'Fast Auth', 'RSA', 'Challenge-Response', 'Internals'],
    front: {
      question: 'Quelles sont les deux phases d\'authentification de caching_sha2_password (Fast Authentication vs Full Authentication) et quand l\'échange de clé RSA est-il requis ?',
      hint: 'Le cache mémoire permet une validation immédiate ; en cas d\'échec de cache (cache miss), une négociation chiffrée RSA ou TLS intervient.',
    },
    back: {
      answer: 'Fonctionnement en 2 phases de `caching_sha2_password` :\n\n1. **Phase 1 : Fast Authentication (Cache Hit)** :\n   - Le serveur envoie un aléa (nonce / scramble).\n   - Le client calcule la réponse avec son hash SHA-256 local et l\'envoie.\n   - Si l\'empreinte correspond au hash présent dans le **cache mémoire en RAM** du serveur, la connexion est accordée immédiatement sans chiffrement asymétrique lourd.\n2. **Phase 2 : Full Authentication (Cache Miss / Première connexion)** :\n   - Si le client se connecte pour la première fois ou si le cache du serveur a été purgé (`FLUSH PRIVILEGES`), le serveur demande le mot de passe complet.\n   - **Sécurité** : Pour ne jamais faire transiter le mot de passe en clair, le client doit soit être connecté via une session **TLS/SSL**, soit chiffrer son mot de passe avec la **clé publique RSA du serveur** (`rsa_public_key`).\n   - Une fois validé, le serveur insère le résultat dans son cache mémoire pour les futures connexions.',
      explanation: 'Ce design procure à la fois une imperméabilité aux écoutes réseau (eavesdropping) et une latence de reconnexion inférieure à la milliseconde.',
      examTrap: 'Si la connexion n\'est pas en TLS et que le client ne possède pas la clé publique RSA du serveur, la connexion en Fast Auth "cache miss" échouera avec l\'erreur "Public Key Retrieval is not allowed".',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - caching_sha2_password Architecture',
    },
  },
  {
    id: 'fc-mysql908-dom03-019',
    cardNumber: 19,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Plugin sha256_password vs caching_sha2_password',
    difficulty: 'medium',
    tags: ['sha256_password', 'caching_sha2_password', 'Comparison'],
    front: {
      question: 'Pourquoi le plugin sha256_password introduit dans MySQL 5.6 est-il déprécié au profit de caching_sha2_password dans MySQL 8.0 ?',
      hint: 'L\'ancien sha256_password effectuait un chiffrement RSA complet à chaque connexion, pénalisant lourdement le CPU.',
    },
    back: {
      answer: 'Différences majeures :\n\n- **`sha256_password` (Ancien / Déprécié)** :\n  - Imposait une négociation RSA complète ou TLS à **chaque ouverture de session**.\n  - En cas de volume élevé de connexions (ex: applications Web sans pool de connexions persistent), le coût CPU du chiffrement asymétrique RSA saturait le serveur.\n- **`caching_sha2_password` (Standard moderne)** :\n  - Conserve la robustesse SHA-256.\n  - Introduit le cache mémoire serveur : le coût RSA n\'est payé qu\'une seule fois lors du premier contact.\n  - Toutes les connexions suivantes sont validées instantanément par simple comparaison de hash (Fast Auth).\n- `sha256_password` est officiellement déprécié sous MySQL 8.0.',
      explanation: 'caching_sha2_password élimine le seul défaut de sha256_password qui était son coût de calcul à la connexion.',
      examTrap: 'Ne configurez plus de nouveaux utilisateurs avec sha256_password. Utilisez toujours caching_sha2_password.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - SHA-256 Pluggable Authentication',
    },
  },
  {
    id: 'fc-mysql908-dom03-020',
    cardNumber: 20,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Migration progressive d\'un compte vers caching_sha2_password',
    difficulty: 'medium',
    tags: ['Migration', 'caching_sha2_password', 'ALTER USER', 'Compatibility'],
    front: {
      question: 'Quelle instruction SQL permet de convertir un compte existant sous mysql_native_password vers le standard caching_sha2_password ?',
      codeSnippet: `ALTER USER 'crm_user'@'%'
  IDENTIFIED WITH caching_sha2_password BY 'SecretCrm#2026';`,
      hint: 'Clause IDENTIFIED WITH plugin_name BY \'password\'.',
    },
    back: {
      answer: 'Instruction de migration :\n\n```sql\nALTER USER \'crm_user\'@\'%\'\n  IDENTIFIED WITH caching_sha2_password BY \'NouveauMotDePasseFort!\';\n```\n\nPrécautions indispensables :\n1. Vérifier au préalable que le connecteur client (ex: MySQL Connector/J $\\ge$ 8.0, PHP mysqli avec mysqlnd moderne, Python mysql-connector) prend en charge `caching_sha2_password`.\n2. Si l\'application se connecte sans TLS/SSL, s\'assurer que le client a accès à la clé publique RSA du serveur (`--get-server-public-key=true` ou `allowPublicKeyRetrieval=true` dans la chaîne JDBC de transition).\n3. Faire se connecter l\'application au moins une fois pour pré-peupler le cache d\'authentification du serveur.',
      explanation: 'Si le mot de passe n\'est pas spécifié avec BY, le compte se retrouve sans mot de passe ou avec un hash invalide.',
      examTrap: 'Ne pas oublier de renseigner le mot de passe lors de la conversion avec IDENTIFIED WITH ! Faire juste "ALTER USER u IDENTIFIED WITH caching_sha2_password;" vide la chaîne de hachage.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Upgrading to caching_sha2_password',
    },
  },
  {
    id: 'fc-mysql908-dom03-021',
    cardNumber: 21,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Authentification externe via PAM (Pluggable Authentication Modules)',
    difficulty: 'hard',
    tags: ['PAM', 'Enterprise', 'authentication_pam', 'Proxy Users'],
    front: {
      question: 'Comment fonctionne le plugin d\'authentification authentication_pam dans MySQL Enterprise et quel rôle joue le mécanisme de Proxy User ?',
      hint: 'Délègue la validation du mot de passe au système Linux/Unix (Shadow, Kerberos, RADIUS) et mappe l\'utilisateur de l\'OS vers un compte SQL générique.',
    },
    back: {
      answer: 'Fonctionnement de `authentication_pam` (MySQL Enterprise) :\n\n1. **Délégation externe** : Lorsqu\'un client se connecte, MySQL transfère les identifiants au sous-système PAM de l\'OS hôte (qui valide contre `/etc/shadow`, un serveur RADIUS, Kerberos ou Active Directory).\n2. **Mécanisme de Proxy User (Utilisateur Mandataire)** :\n   - Au lieu de créer 500 comptes MySQL individuels, le DBA crée un compte proxy générique : `CREATE USER \'pam_user\'@\'%\' IDENTIFIED WITH authentication_pam;`.\n   - PAM retourne un nom d\'utilisateur externe validé (ex: `alice`).\n   - MySQL mappe l\'utilisateur externe vers un compte interne sans privilèges de login (`app_readonly`) via la commande : `GRANT PROXY ON \'app_readonly\' TO \'pam_user\'@\'%\';`.\n3. L\'utilisateur hérite immédiatement des privilèges du compte cible sans que MySQL ne gère ses mots de passe.',
      explanation: 'Centralise la gestion des accès et permet de révoquer l\'accès d\'un administrateur directement dans l\'annuaire d\'entreprise.',
      examTrap: 'authentication_pam est une fonctionnalité commerciale (MySQL Enterprise Edition) qui nécessite le chargement de la bibliothèque auth_pam.so.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - PAM Pluggable Authentication',
    },
  },
  {
    id: 'fc-mysql908-dom03-022',
    cardNumber: 22,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Authentification LDAP : authentication_ldap_simple vs authentication_ldap_sasl',
    difficulty: 'hard',
    tags: ['LDAP', 'SASL', 'Active Directory', 'Enterprise'],
    front: {
      question: 'Quelle est la différence entre authentication_ldap_simple et authentication_ldap_sasl dans MySQL Enterprise Edition ?',
      hint: 'L\'un utilise une liaison simple (Simple Bind) et exige TLS, l\'autre prend en charge les méthodes avancées Kerberos/GSSAPI.',
    },
    back: {
      answer: 'Différences entre les deux plugins LDAP :\n\n- **`authentication_ldap_simple`** :\n  - Établit une liaison simple (**Simple Bind**) avec le serveur LDAP / Active Directory.\n  - Le client transmet son mot de passe au serveur MySQL, qui le vérifie auprès du serveur LDAP via une connexion sécurisée (LDAPS / StartTLS).\n  - Simple à déployer mais requiert impérativement un canal chiffré.\n- **`authentication_ldap_sasl`** :\n  - Utilise le framework **SASL** (Simple Authentication and Security Layer).\n  - Prend en charge des mécanismes cryptographiques avancés comme **GSSAPI / Kerberos** ou SCRAM-SHA.\n  - Permet le Single Sign-On (SSO) transparent : le mot de passe ne transite jamais à travers MySQL ; seul un ticket Kerberos est validé.',
      explanation: 'Ces plugins permettent l\'intégration directe dans les infrastructures Active Directory d\'entreprise.',
      examTrap: 'authentication_ldap_simple refuse de fonctionner si la connexion entre le client et MySQL n\'est pas chiffrée en TLS, pour éviter toute fuite de mot de passe.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - LDAP Pluggable Authentication',
    },
  },
  {
    id: 'fc-mysql908-dom03-023',
    cardNumber: 23,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Authentification sans mot de passe locale : auth_socket',
    difficulty: 'medium',
    tags: ['auth_socket', 'Security', 'Linux', 'Socket'],
    front: {
      question: 'Comment fonctionne le plugin auth_socket sous Linux et pourquoi est-il souvent utilisé pour le compte root local ?',
      codeSnippet: `CREATE USER 'backup_operator'@'localhost'
  IDENTIFIED WITH auth_socket;`,
      hint: 'Vérifie que l\'utilisateur système Linux exécutant la commande mysql correspond exactement au nom d\'utilisateur MySQL.',
    },
    back: {
      answer: 'Fonctionnement de `auth_socket` :\n\n- Le plugin vérifie l\'identité du client via le **socket UNIX local** à l\'aide des structures système du noyau OS (`SO_PEERCRED`).\n- Si l\'utilisateur système Linux qui lance le client `mysql` a le même nom d\'utilisateur que le compte MySQL (ex: l\'utilisateur Linux `root` ou `backup_operator`), la connexion est accordée **sans demander de mot de passe**.\n- Si un autre utilisateur Linux tente de se connecter sous ce compte, l\'accès est refusé immédiatement.\n\n*Avantage pour root* : Permet d\'exécuter des scripts de maintenance cron ou des sauvegardes en `sudo mysql` sans stocker de mot de passe root en clair dans des fichiers.',
      explanation: 'Ce plugin est couramment activé par défaut pour le compte root lors de l\'installation de MySQL sur les distributions Debian et Ubuntu.',
      examTrap: 'auth_socket ne fonctionne STRICTEMENT que via un socket UNIX local ! Il est impossible de se connecter à distance ou via TCP/IP avec ce plugin.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Socket Peer-Credential Pluggable Authentication',
    },
  },
  {
    id: 'fc-mysql908-dom03-024',
    cardNumber: 24,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Authentification Multi-Facteurs (MFA) sous MySQL 8.0.27+',
    difficulty: 'hard',
    tags: ['MFA', 'Multi-Factor', 'Security', 'MySQL 8.0.27'],
    front: {
      question: 'Comment configurer l\'authentification multi-facteurs (MFA) jusqu\'à 3 facteurs successifs pour un compte sous MySQL 8.0.27+ ?',
      codeSnippet: `CREATE USER 'sec_admin'@'%'
  IDENTIFIED WITH caching_sha2_password BY 'MainSecret#2026'
  AND IDENTIFIED WITH authentication_fido BY '...'
  AND IDENTIFIED WITH authentication_openid_connect;`,
      hint: 'Utilisation de la clause AND IDENTIFIED WITH pour enchaîner les facteurs (jusqu\'à 3 méthodes d\'authentification).',
    },
    back: {
      answer: 'Sous MySQL 8.0.27+, la syntaxe **`AND IDENTIFIED WITH`** permet de chaîner de 2 à 3 facteurs d\'authentification obligatoires :\n\n```sql\nALTER USER \'sec_admin\'@\'%\'\n  IDENTIFIED WITH caching_sha2_password BY \'MasterPass#2026\'\n  AND IDENTIFIED WITH authentication_fido\n  AND IDENTIFIED WITH authentication_webauthn;\n```\n\nFonctionnement :\n- Le client doit valider le **Facteur 1** (mot de passe standard).\n- Le serveur challenge ensuite le client pour le **Facteur 2** (ex: clé physique FIDO/WebAuthn, token temporaire TOTP ou LDAP).\n- Éventuellement, le **Facteur 3** est validé.\n- La connexion n\'est autorisée que si **TOUS les facteurs** ont retourné un succès.',
      explanation: 'Répond aux exigences des normes bancaires, militaires et de conformité PCI-DSS 4.0 pour l\'accès aux bases de données sensibles.',
      examTrap: 'Si le client MySQL ou le connecteur n\'est pas mis à jour vers une version 8.0.27+, il ne saura pas répondre au deuxième facteur et la connexion sera rejetée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Multi-Factor Authentication',
    },
  },
  {
    id: 'fc-mysql908-dom03-025',
    cardNumber: 25,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Impact de FLUSH PRIVILEGES sur le cache d\'authentification',
    difficulty: 'medium',
    tags: ['FLUSH PRIVILEGES', 'caching_sha2_password', 'Cache', 'Administration'],
    front: {
      question: 'Quel est l\'effet secondaire de la commande FLUSH PRIVILEGES sur les sessions utilisant le plugin caching_sha2_password ?',
      codeSnippet: `FLUSH PRIVILEGES;`,
      hint: 'Il purge le cache mémoire en RAM, forçant toutes les prochaines connexions à subir une Full Authentication (RSA/TLS).',
    },
    back: {
      answer: 'Effets de `FLUSH PRIVILEGES` sous MySQL 8.0 :\n\n1. Recharge les tables d\'autorisation (`mysql.user`, `mysql.db`, etc.) depuis le disque vers les structures mémoire du serveur.\n2. **Purge intégrale du cache en mémoire vive de `caching_sha2_password`** :\n   - Toutes les entrées du cache de mots de passe rapides sont vidées.\n   - Par conséquent, la prochaine connexion de chaque client subira une **Full Authentication** (nécessitant TLS ou un échange de clé RSA) au lieu d\'une Fast Authentication instantanée.\n   - Peut entraîner un pic temporaire de consommation CPU si des centaines de clients se reconnectent simultanément.',
      explanation: 'Inutile d\'exécuter FLUSH PRIVILEGES après un CREATE USER, ALTER USER ou GRANT : ces instructions mettent à jour la mémoire et le disque de manière atomique en temps réel.',
      examTrap: 'FLUSH PRIVILEGES n\'est requis QUE si vous avez effectué des manipulations manuelles directes non recommandées avec INSERT/UPDATE/DELETE sur les tables de la base mysql.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - FLUSH Statement & caching_sha2_password Memory Cache',
    },
  },
  {
    id: 'fc-mysql908-dom03-026',
    cardNumber: 26,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Gestion des paires de clés RSA pour l\'authentification sha256',
    difficulty: 'hard',
    tags: ['RSA', 'Keys', 'caching_sha2_password', 'SSL'],
    front: {
      question: 'Quelles variables système définissent les fichiers de clés RSA publiques et privées utilisés pour l\'authentification sécurisée des mots de passe ?',
      codeSnippet: `SHOW VARIABLES LIKE '%rsa%';
-- rsa_private_key_path : private_key.pem
-- sha256_password_public_key_path : public_key.pem
-- caching_sha2_password_private_key_path
-- caching_sha2_password_public_key_path`,
      hint: 'Ces fichiers PEM sont générés automatiquement dans le datadir au démarrage par auto_generate_certs.',
    },
    back: {
      answer: 'Variables de gestion des clés RSA :\n\n- `caching_sha2_password_private_key_path` : Chemin vers la clé privée du serveur (ex: `private_key.pem`), utilisée pour déchiffrer le mot de passe reçu.\n- `caching_sha2_password_public_key_path` : Chemin vers la clé publique du serveur (ex: `public_key.pem`), mise à disposition des clients pour chiffrer leur mot de passe lors d\'une Full Authentication sans TLS.\n- Si `auto_generate_certs = ON`, le serveur crée automatiquement ces paires de clés au premier démarrage dans le `datadir`.\n- Le serveur peut envoyer sa clé publique au client si la variable `caching_sha2_password_auto_generate_rsa_keys` est active.',
      explanation: 'Ces clés ne sont exploitées que si la connexion réseau entre le client et le serveur n\'utilise pas déjà un canal sécurisé TLS/SSL natif.',
      examTrap: 'La clé privée private_key.pem ne doit JAMAIS être partagée ! Seule la clé public_key.pem peut être distribuée aux machines clientes.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - SHA-256 Authentication Key Management',
    },
  },
  {
    id: 'fc-mysql908-dom03-027',
    cardNumber: 27,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Résolution de l\'erreur client "Public Key Retrieval is not allowed"',
    difficulty: 'hard',
    tags: ['Public Key', 'Troubleshooting', 'JDBC', 'caching_sha2_password'],
    front: {
      question: 'Pourquoi une application Java/JDBC ou un client CLI échoue-t-il avec l\'erreur "Public Key Retrieval is not allowed" et comment la résoudre en toute sécurité ?',
      codeSnippet: `// Erreur typique :
java.sql.SQLNonTransientConnectionException: 
Public Key Retrieval is not allowed`,
      hint: 'Le client tente une Full Auth sans TLS et refuse par précaution de télécharger la clé publique du serveur sans accord explicite.',
    },
    back: {
      answer: 'Cause et solutions de l\'erreur "Public Key Retrieval" :\n\n- **Cause** : Le client se connecte sans TLS/SSL sur un compte utilisant `caching_sha2_password` (ou `sha256_password`). Le serveur exige un mot de passe chiffré par RSA, mais pour éviter une attaque Man-In-The-Middle, le driver refuse de demander spontanément la clé publique au serveur.\n- **Solution 1 (Recommandée)** : **Activer TLS/SSL** (`useSSL=true`). Dès lors que le canal est chiffré, l\'échange RSA est court-circuité.\n- **Solution 2** : Fournir la clé publique locale au client via le paramètre `serverRsaPublicKeyFile=/chemin/public_key.pem` (ou CLI `--server-public-key-path=...`).\n- **Solution 3 (Dev uniquement)** : Autoriser explicitement le client à récupérer la clé du serveur avec le paramètre `allowPublicKeyRetrieval=true` (ou CLI `--get-server-public-key`).',
      explanation: 'allowPublicKeyRetrieval=true en environnement non TLS expose à ce qu\'un attaquant MITM fournisse sa propre clé publique pour intercepter le mot de passe.',
      examTrap: 'Ne jamais activer allowPublicKeyRetrieval=true en production sans TLS ! Privilégiez toujours le chiffrement TLS natif qui rend cette option inutile.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Connecting Using SHA-256 Authentication',
    },
  },
  {
    id: 'fc-mysql908-dom03-028',
    cardNumber: 28,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Composant d\'authentification FIDO / WebAuthn (MySQL 8.0.27+)',
    difficulty: 'hard',
    tags: ['FIDO', 'WebAuthn', 'MFA', 'Security'],
    front: {
      question: 'Quel composant permet l\'authentification par clé de sécurité matérielle (YubiKey, biométrie) sous MySQL 8.0 ?',
      codeSnippet: `INSTALL COMPONENT 'file://component_authentication_fido';`,
      hint: 'Le composant d\'authentification FIDO basé sur le standard FIDO2/WebAuthn.',
    },
    back: {
      answer: 'Le composant **`component_authentication_fido`** (ou `authentication_fido_client` côté client) :\n\n- Implémente le protocole d\'authentification sans mot de passe ou multi-facteurs **FIDO2 / WebAuthn**.\n- Permet à un utilisateur de s\'authentifier en insérant et en touchant une clé physique USB (ex: YubiKey) ou via un capteur d\'empreintes biométrique (Touch ID, Windows Hello).\n- Le serveur génère un challenge cryptographique et vérifie la signature numérique renvoyée par le matériel cryptographique sécurisé.\n- S\'intègre dans la politique MFA de l\'entreprise comme second facteur obligatoire.',
      explanation: 'Rend le vol d\'identifiants totalement inefficace : même si le pirate connaît le mot de passe, il ne possède pas la clé matérielle physique.',
      examTrap: 'Nécessite que le client terminal prenne en charge l\'interaction FIDO (MySQL Shell ou client officiel 8.0.27+).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - FIDO Pluggable Authentication',
    },
  },
  {
    id: 'fc-mysql908-dom03-029',
    cardNumber: 29,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Audit de l\'attribution des plugins d\'authentification dans le parc',
    difficulty: 'easy',
    tags: ['Audit', 'mysql.user', 'Plugins', 'Compliance'],
    front: {
      question: 'Quelle requête SQL permet au DBA de recenser l\'ensemble des utilisateurs encore configurés avec un plugin d\'authentification déprécié ou non sécurisé ?',
      codeSnippet: `SELECT user, host, plugin, account_locked, password_expired
FROM mysql.user
WHERE plugin != 'caching_sha2_password'
ORDER BY plugin, user;`,
      hint: 'Interroger mysql.user en filtrant sur la colonne plugin.',
    },
    back: {
      answer: 'Requête d\'audit standard :\n\n```sql\nSELECT user, host, plugin, authentication_string, \n       account_locked, password_expired\nFROM mysql.user\nWHERE plugin IN (\'mysql_native_password\', \'sha256_password\')\nORDER BY user, host;\n```\n\nObjectifs de l\'audit :\n- Identifier les comptes techniques ou applicatifs risquant d\'être bloqués lors d\'une future montée de version de MySQL.\n- Repérer les comptes orphelins ou sans mot de passe (`authentication_string = \'\'`).\n- Planifier la migration ordonnée vers `caching_sha2_password`.',
      explanation: 'À exécuter systématiquement avant toute opération de migration vers MySQL 8.4 LTS où mysql_native_password est désactivé.',
      examTrap: 'Les comptes dont la colonne plugin vaut \'auth_socket\' ne doivent pas être migrés vers caching_sha2_password s\'ils sont réservés à des crons système locaux.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Checking Account Plugins',
    },
  },
  {
    id: 'fc-mysql908-dom03-030',
    cardNumber: 30,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Comportement d\'un compte avec mot de passe expiré lors de la connexion',
    difficulty: 'medium',
    tags: ['PASSWORD EXPIRE', 'Sandbox', 'Restricted Mode', 'Security'],
    front: {
      question: 'Que se passe-t-il exactement lorsqu\'un utilisateur dont le mot de passe a expiré établit une session avec le serveur MySQL ?',
      codeSnippet: `-- L'utilisateur réussit à se connecter, mais :
SELECT * FROM clients;
-- ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.`,
      hint: 'Le serveur autorise la connexion mais place immédiatement la session en mode restreint "Sandbox".',
    },
    back: {
      answer: 'Comportement en mode mot de passe expiré (*Expired Password Restricted Mode*) :\n\n1. **Connexion acceptée** : Le client réussit à franchir l\'authentification (ne reçoit pas d\'erreur 1045).\n2. **Session bridée en mode Sandbox** : Le serveur bloque l\'exécution de toute instruction SQL ordinaire (DML, DDL, requêtes `SELECT`, `SHOW TABLES`, etc.) et renvoie l\'erreur `ER_MUST_CHANGE_PASSWORD` (ERROR 1820).\n3. **Unique action autorisée** : L\'utilisateur ne peut exécuter que l\'instruction de mise à jour de son propre mot de passe :\n   `ALTER USER USER() IDENTIFIED BY \'NouveauPassValide123!\';`\n4. Dès que cette commande réussit, la session sort instantanément du mode Sandbox et reprend un comportement normal.',
      explanation: 'Permet aux applications et utilisateurs de corriger eux-mêmes leur mot de passe expiré sans intervention du DBA.',
      examTrap: 'L\'option disconnect_on_expired_password = ON force le serveur à rejeter purement et simplement la connexion si le mot de passe est expiré, au lieu de permettre le mode sandbox.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Password Expiration and the Sandbox Mode',
    },
  },

  // =========================================================================
  // SECTION 3 : SYSTÈME DE PRIVILÈGES STATIQUES & NIVEAUX D'ACCÈS (Cartes 31 à 50)
  // Niveaux (Global, DB, Table, Column, Routine, Proxy), GRANT/REVOKE,
  // WITH GRANT OPTION, DEFINER vs INVOKER, FILE, PROCESS, SUPER déprécié
  // =========================================================================
  {
    id: 'fc-mysql908-dom03-031',
    cardNumber: 31,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Différence fondamentale entre privilèges statiques et dynamiques',
    difficulty: 'medium',
    tags: ['Static Privileges', 'Dynamic Privileges', 'Architecture', 'MySQL 8.0'],
    front: {
      question: 'Quelle est la distinction fondamentale entre un privilège statique et un privilège dynamique dans MySQL 8.0 ?',
      hint: 'Les statiques sont figés dans le code source du serveur ; les dynamiques peuvent être enregistrés par des composants ou plugins.',
    },
    back: {
      answer: 'Distinction fondamentale sous MySQL 8.0 :\n\n- **Privilèges Statiques (Static / Built-in)** :\n  - Privilèges traditionnels intégrés et figés dans le binaire de `mysqld` (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `DROP`, `RELOAD`, `FILE`, `SUPER`, etc.).\n  - Définis par des colonnes fixes dans les tables système (`mysql.user`, `mysql.db`, `mysql.tables_priv`).\n  - S\'appliquent au niveau global ou à des objets spécifiques (bases, tables, colonnes).\n- **Privilèges Dynamiques (Dynamic)** :\n  - Nouveauté de MySQL 8.0 pour remplacer le privilège monolithique `SUPER`.\n  - Enregistrés dynamiquement au démarrage par le serveur, des plugins ou des composants (`SYSTEM_VARIABLES_ADMIN`, `BACKUP_ADMIN`, `CLONE_ADMIN`, etc.).\n  - Stockés de façon extensible dans la table `mysql.global_grants`.\n  - S\'appliquent **exclusivement au niveau global**.',
      explanation: 'Les privilèges dynamiques permettent à des extensions tierces ou aux composants Enterprise de déclarer leurs propres permissions sans modifier le schéma de base de données.',
      examTrap: 'Un privilège dynamique ne peut JAMAIS être accordé sur une base ou une table spécifique ! La syntaxe "GRANT BACKUP_ADMIN ON my_db.* TO ..." est invalide.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Static Versus Dynamic Privileges',
    },
  },
  {
    id: 'fc-mysql908-dom03-032',
    cardNumber: 32,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Les 6 niveaux de privilèges dans MySQL',
    difficulty: 'easy',
    tags: ['Privilege Levels', 'Global', 'Database', 'Table', 'Column', 'Routine'],
    front: {
      question: 'Quels sont les différents niveaux de granularité auxquels des privilèges peuvent être accordés dans MySQL ?',
      codeSnippet: `GRANT SELECT ON *.* TO ...;               -- Niveau 1
GRANT SELECT ON production.* TO ...;       -- Niveau 2
GRANT SELECT ON production.orders TO ...;  -- Niveau 3
GRANT SELECT (id, montant) ON ... TO ...;  -- Niveau 4
GRANT EXECUTE ON PROCEDURE ... TO ...;     -- Niveau 5
GRANT PROXY ON 'app_user' TO ...;          -- Niveau 6`,
      hint: 'Du serveur entier jusqu\'à la colonne individuelle et aux routines stockées.',
    },
    back: {
      answer: 'Les 6 niveaux de privilèges dans MySQL :\n\n1. **Niveau Global (`*.*`)** : S\'applique à toutes les bases et au serveur (stocké dans `mysql.user` et `mysql.global_grants`).\n2. **Niveau Base de données (`db_name.*`)** : S\'applique à toutes les tables d\'un schéma (stocké dans `mysql.db`).\n3. **Niveau Table (`db_name.table_name`)** : S\'applique à tous les champs d\'une table (stocké dans `mysql.tables_priv`).\n4. **Niveau Colonne (`SELECT (col1, col2) ON table`)** : S\'applique uniquement aux colonnes désignées (stocké dans `mysql.columns_priv`).\n5. **Niveau Routine (`EXECUTE ON PROCEDURE/FUNCTION`)** : S\'applique à une procédure ou fonction (stocké dans `mysql.procs_priv`).\n6. **Niveau Proxy (`PROXY ON target_user`)** : Autorise un utilisateur à emprunter l\'identité d\'un autre (stocké dans `mysql.proxies_priv`).',
      explanation: 'Le moteur de sécurité de MySQL vérifie les privilèges du niveau le plus large (global) vers le plus précis (colonne) : si le niveau supérieur l\'autorise, le test s\'arrête avec succès.',
      examTrap: 'Accorder SELECT sur *.* donne le droit de lire TOUTES les tables de TOUTES les bases présentes et futures ! À réserver strictement aux administrateurs.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Privilege Levels',
    },
  },
  {
    id: 'fc-mysql908-dom03-033',
    cardNumber: 33,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Interdiction de créer des utilisateurs implicitement via GRANT',
    difficulty: 'easy',
    tags: ['GRANT', 'CREATE USER', 'Security', 'MySQL 8.0'],
    front: {
      question: 'Pourquoi la commande "GRANT SELECT ON db.* TO \'nouveau\'@\'%\' IDENTIFIED BY \'pass\';" échoue-t-elle avec une erreur de syntaxe sous MySQL 8.0 ?',
      hint: 'MySQL 8.0 a définitivement supprimé la création implicite de comptes par GRANT.',
    },
    back: {
      answer: 'Raison du rejet sous MySQL 8.0 :\n\n- Sous les anciennes versions de MySQL (5.6 et antérieures), `GRANT` pouvait créer un compte à la volée s\'il n\'existait pas en lui assignant un mot de passe avec `IDENTIFIED BY`.\n- Cette pratique a été dépréciée en 5.7 et **totalement supprimée sous MySQL 8.0** car elle favorisait la création accidentelle de comptes mal configurés et non audités.\n- **Procédure obligatoire en 2 étapes sous MySQL 8.0** :\n  1. `CREATE USER \'nouveau\'@\'%\' IDENTIFIED BY \'pass\';`\n  2. `GRANT SELECT ON db.* TO \'nouveau\'@\'%\';`\n\nSi vous tentez un `GRANT ... TO ... IDENTIFIED BY ...`, le parseur lève une erreur `ERROR 1064 (42000): You have an error in your SQL syntax`.',
      explanation: 'Cette séparation stricte garantit que les privilèges et la gestion d\'identité restent deux domaines d\'administration distincts.',
      examTrap: 'Question classique d\'examen : identifier si un script MySQL 5.7 contenant des GRANT ... IDENTIFIED BY fonctionnera sur MySQL 8.0. La réponse est NON, échec garanti.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - GRANT Statement',
    },
  },
  {
    id: 'fc-mysql908-dom03-034',
    cardNumber: 34,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Délégation de privilèges : clause WITH GRANT OPTION',
    difficulty: 'medium',
    tags: ['WITH GRANT OPTION', 'Delegation', 'Privileges', 'Security'],
    front: {
      question: 'Que permet la clause WITH GRANT OPTION et quelles sont ses limites strictes de délégation ?',
      codeSnippet: `GRANT SELECT, INSERT ON sales.* TO 'team_lead'@'%' 
WITH GRANT OPTION;`,
      hint: 'L\'utilisateur peut déléguer à d\'autres uniquement les privilèges qu\'il détient lui-même sur ce périmètre.',
    },
    back: {
      answer: 'Rôle et limites de `WITH GRANT OPTION` :\n\n- **Délégation** : Autorise le bénéficiaire (`team_lead`) à accorder à d\'autres comptes les privilèges qu\'il possède sur le périmètre désigné (`sales.*`).\n- **Limites de sécurité strictes** :\n  1. Il ne peut transmettre **QUE** les privilèges qu\'il détient personnellement (il ne peut pas donner `DELETE` s\'il n\'a que `SELECT` et `INSERT`).\n  2. Il ne peut transmettre des droits que sur le périmètre exact accordé (`sales.*`, pas sur d\'autres bases).\n  3. Il peut également révoquer les privilèges qu\'il a lui-même accordés.',
      explanation: 'Accorder WITH GRANT OPTION au niveau global (*.*) équivaut quasiment à donner les pleins pouvoirs administratifs sur le serveur.',
      examTrap: 'Si on révoque les privilèges de team_lead, MySQL n\'applique PAS de révocation en cascade (cascading revokes) ! Les utilisateurs à qui team_lead avait donné des droits conservent leurs privilèges.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The GRANT OPTION Privilege',
    },
  },
  {
    id: 'fc-mysql908-dom03-035',
    cardNumber: 35,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilèges granulaires au niveau colonne',
    difficulty: 'medium',
    tags: ['Column Privileges', 'Fine-Grained Security', 'SELECT', 'UPDATE'],
    front: {
      question: 'Comment autoriser un utilisateur à lire uniquement le nom et l\'email d\'une table clients tout en lui interdisant l\'accès aux colonnes bancaires ?',
      codeSnippet: `GRANT SELECT (client_id, nom, email) ON crm.clients TO 'support_rep'@'%';
GRANT UPDATE (email) ON crm.clients TO 'support_rep'@'%';`,
      hint: 'Spécifier la liste des colonnes autorisées entre parenthèses immédiatement après le nom du privilège.',
    },
    back: {
      answer: 'Syntaxe des privilèges au niveau colonne :\n\n```sql\nGRANT SELECT (client_id, nom, email) ON crm.clients TO \'support_rep\'@\'%\';\nGRANT UPDATE (email) ON crm.clients TO \'support_rep\'@\'%\';\n```\n\nFonctionnement :\n- L\'utilisateur peut exécuter : `SELECT client_id, nom, email FROM crm.clients;` avec succès.\n- S\'il tente un `SELECT * FROM crm.clients;` ou s\'il référence la colonne `numero_carte_credit`, la requête échoue avec `ERROR 1143 (42000): SELECT command denied to user ... for column ...`.\n- Les privilèges de colonnes sont enregistrés dans la table système `mysql.columns_priv`.\n- Seuls les privilèges `SELECT`, `INSERT`, `UPDATE` et `REFERENCES` peuvent être restreints à des colonnes.',
      explanation: 'Idéal pour appliquer le principe du moindre privilège sans créer de vues supplémentaires.',
      examTrap: 'DELETE ne peut PAS être accordé au niveau colonne ! Une suppression supprime la ligne entière, donc DELETE ne s\'accorde qu\'au niveau table, base ou global.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Column-Level Privileges',
    },
  },
  {
    id: 'fc-mysql908-dom03-036',
    cardNumber: 36,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilèges sur les routines stockées : EXECUTE et ALTER ROUTINE',
    difficulty: 'medium',
    tags: ['Stored Procedures', 'EXECUTE', 'ALTER ROUTINE', 'Security'],
    front: {
      question: 'Quels privilèges contrôlent l\'exécution, la modification et la suppression des procédures et fonctions stockées dans MySQL ?',
      codeSnippet: `GRANT EXECUTE ON PROCEDURE finance_db.calculer_tva TO 'comptable'@'%';
GRANT ALTER ROUTINE ON PROCEDURE finance_db.calculer_tva TO 'lead_dev'@'%';`,
      hint: 'EXECUTE pour exécuter, ALTER ROUTINE pour modifier ou supprimer (DROP), CREATE ROUTINE pour en créer de nouvelles.',
    },
    back: {
      answer: 'Privilèges sur les routines stockées :\n\n- **`EXECUTE`** : Autorise l\'utilisateur à exécuter la procédure ou la fonction (`CALL nom_procedure(...)` ou appel dans un `SELECT`).\n- **`ALTER ROUTINE`** : Autorise l\'utilisateur à modifier ou supprimer la routine (`ALTER PROCEDURE`, `DROP PROCEDURE`).\n- **`CREATE ROUTINE`** : Accordé au niveau de la base (`ON db.*`) pour créer de nouvelles procédures ou fonctions.\n- **Attribution automatique** : Par défaut, la variable `automatic_sp_privileges = ON` accorde automatiquement `EXECUTE` et `ALTER ROUTINE` au créateur de la routine au moment de son `CREATE PROCEDURE`.',
      explanation: 'Permet de créer des APIs SQL sécurisées : donner EXECUTE sur des procédures stockées sans donner aucun droit SELECT/INSERT direct sur les tables sous-jacentes.',
      examTrap: 'Si automatic_sp_privileges est à ON, le développeur qui crée la procédure reçoit le droit de la supprimer (ALTER ROUTINE). En production, certains DBAs désactivent ce paramètre pour garder la maîtrise des déploiements.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Routine Privileges',
    },
  },
  {
    id: 'fc-mysql908-dom03-037',
    cardNumber: 37,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Contexte d\'exécution de sécurité : DEFINER vs INVOKER',
    difficulty: 'hard',
    tags: ['DEFINER', 'INVOKER', 'SQL SECURITY', 'Privilege Escalation'],
    front: {
      question: 'Quelle est la différence fondamentale entre SQL SECURITY DEFINER et SQL SECURITY INVOKER dans une vue ou une procédure stockée, et quel est le risque de sécurité associé à DEFINER ?',
      codeSnippet: `CREATE PROCEDURE generer_rapport()
SQL SECURITY DEFINER -- (Option par défaut !)
BEGIN
  SELECT * FROM confidential_salaries;
END;`,
      hint: 'DEFINER exécute la routine avec les privilèges de son créateur ; INVOKER l\'exécute avec les privilèges de l\'utilisateur qui l\'appelle.',
    },
    back: {
      answer: 'Différence entre `DEFINER` et `INVOKER` :\n\n- **`SQL SECURITY DEFINER` (Par défaut)** :\n  - La routine ou la vue s\'exécute avec **les privilèges du compte créateur (DEFINER)**.\n  - Si `admin_root` crée une procédure `DEFINER`, un utilisateur lambda n\'ayant aucun droit sur les tables peut quand même consulter des données confidentielles si on lui accorde `EXECUTE`.\n  - **Risque majeur** : Élévation de privilèges non contrôlée si la procédure exécute du SQL dynamique (`PREPARE / EXECUTE`).\n- **`SQL SECURITY INVOKER`** :\n  - La routine s\'exécute avec **les privilèges de l\'utilisateur qui l\'invoque (l\'appelant)**.\n  - Si l\'appelant n\'a pas les droits `SELECT` directs sur les tables manipulées, la procédure échoue immédiatement.',
      explanation: 'DEFINER permet d\'encapsuler des accès privilégiés de manière contrôlée, mais exige un audit rigoureux du compte DEFINER spécifié.',
      examTrap: 'Si le compte mentionné dans DEFINER (\'createur\'@\'localhost\') est supprimé avec DROP USER, la vue ou la procédure devient orpheline et renvoie une erreur systématique à chaque appel.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Stored Programs and Views: Security Context',
    },
  },
  {
    id: 'fc-mysql908-dom03-038',
    cardNumber: 38,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilège FILE et restriction par secure_file_priv',
    difficulty: 'hard',
    tags: ['FILE', 'secure_file_priv', 'LOAD DATA INFILE', 'Security'],
    front: {
      question: 'Quel est le danger du privilège FILE et comment la variable système secure_file_priv protège-t-elle le système de fichiers du serveur ?',
      codeSnippet: `GRANT FILE ON *.* TO 'etl_user'@'%';
-- Requête risquée :
SELECT LOAD_FILE('/etc/passwd');
SELECT * INTO OUTFILE '/var/www/html/backdoor.php' FROM users;`,
      hint: 'Le privilège FILE permet de lire/écrire des fichiers sur le serveur avec les droits du processus mysqld.',
    },
    back: {
      answer: 'Danger du privilège `FILE` et parade `secure_file_priv` :\n\n- **Danger de `FILE`** : Accordé au niveau global (`*.*`), il permet d\'écrire des fichiers arbitraires sur l\'OS hôte (`SELECT ... INTO OUTFILE`) ou de lire des fichiers système (`LOAD_FILE(\'/etc/shadow\')`), créant un risque critique d\'exécution de code à distance.\n- **Contrôle via `secure_file_priv`** (Variable statique en lecture seule) :\n  - `secure_file_priv = /var/lib/mysql-files/` : Les imports/exports de fichiers (`LOAD DATA`, `INTO OUTFILE`) sont **strictement confinés** à ce répertoire dédié.\n  - `secure_file_priv = NULL` : Désactive complètement toute lecture ou écriture de fichiers par le serveur (sécurité maximale).\n  - `secure_file_priv = ""` (chaîne vide) : Aucune restriction de répertoire (extrêmement dangereux, vivement déconseillé).',
      explanation: 'Par défaut, les packages MySQL configurent secure_file_priv sur un répertoire restreint, interdisant toute écriture dans /tmp ou /etc.',
      examTrap: 'Le privilège FILE ne peut être accordé qu\'au niveau GLOBAL (*.*) ! Tenter de faire "GRANT FILE ON db.* TO ..." échoue.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Server System Variables: secure_file_priv',
    },
  },
  {
    id: 'fc-mysql908-dom03-039',
    cardNumber: 39,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilège PROCESS et visibilité des requêtes concurrentes',
    difficulty: 'medium',
    tags: ['PROCESS', 'SHOW PROCESSLIST', 'Security', 'Monitoring'],
    front: {
      question: 'Quelle est l\'étendue du privilège PROCESS et quelles informations confidentielles peut-il exposer à un utilisateur non autorisé ?',
      codeSnippet: `SHOW PROCESSLIST;
-- ou interrogation de information_schema.processlist`,
      hint: 'Sans ce privilège, l\'utilisateur ne voit que ses propres threads ; avec ce privilège, il voit les requêtes de tous les utilisateurs.',
    },
    back: {
      answer: 'Étendue et risques du privilège `PROCESS` :\n\n- **Sans `PROCESS`** : Un utilisateur qui exécute `SHOW PROCESSLIST` ne voit **que ses propres connexions et requêtes en cours**.\n- **Avec `PROCESS`** : L\'utilisateur peut observer **tous les threads de tous les utilisateurs du serveur**, y compris les requêtes exécutées par `root` ou les applications financières.\n- **Risque de fuite** : Il peut voir passer en clair des requêtes contenant des données sensibles dans la colonne `INFO` (ex: `INSERT INTO clients VALUES (\'1234-5678-9012\', \'secret\')` ou `ALTER USER ... IDENTIFIED BY \'mot_de_passe\'`).\n- Privilège strictement global (`*.*`), à réserver aux outils de métrologie et aux DBAs.',
      explanation: 'Sous MySQL 8.0, l\'accès aux tables de threads du Performance Schema est également conditionné par ce privilège.',
      examTrap: 'PROCESS permet de VOIR les requêtes des autres, mais il ne donne PAS le droit de les tuer (KILL) ! Pour tuer le thread d\'un autre compte, il faut CONNECTION_ADMIN.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The PROCESS Privilege',
    },
  },
  {
    id: 'fc-mysql908-dom03-040',
    cardNumber: 40,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilège RELOAD et ses opérations associées',
    difficulty: 'medium',
    tags: ['RELOAD', 'FLUSH', 'Operations', 'Maintenance'],
    front: {
      question: 'Quelles commandes administratives précises nécessitent la possession du privilège RELOAD ?',
      codeSnippet: `GRANT RELOAD ON *.* TO 'maintenance_bot'@'%';`,
      hint: 'Toutes les variantes des commandes FLUSH (FLUSH TABLES, FLUSH LOGS, FLUSH PRIVILEGES, RESET MASTER).',
    },
    back: {
      answer: 'Le privilège statique global `RELOAD` autorise :\n\n1. L\'exécution de toutes les variantes de **`FLUSH`** :\n   - `FLUSH PRIVILEGES` (rechargement des tables de droits)\n   - `FLUSH LOGS`, `FLUSH BINARY LOGS`, `FLUSH ERROR LOGS`\n   - `FLUSH TABLES`, `FLUSH TABLES WITH READ LOCK` (verrouillage pour sauvegarde)\n   - `FLUSH STATUS`, `FLUSH USER_RESOURCES`, `FLUSH HOSTS`\n2. L\'exécution de **`RESET MASTER`** (ou `RESET BINARY LOGS AND GTIDS`).\n3. L\'utilisation de la commande client **`mysqladmin reload`**, `mysqladmin refresh` ou `mysqladmin flush-tables`.',
      explanation: 'Indispensable pour les comptes exécutant des sauvegardes physiques ou des rotations de fichiers logs.',
      examTrap: 'Sous MySQL 8.0, pour simplement exécuter FLUSH PRIVILEGES, on peut désormais utiliser le privilège dynamique plus restreint FLUSH_PRIVILEGES sans donner RELOAD complet.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Privileges Provided by MySQL: RELOAD',
    },
  },
  {
    id: 'fc-mysql908-dom03-041',
    cardNumber: 41,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilège SHUTDOWN et arrêt du serveur',
    difficulty: 'easy',
    tags: ['SHUTDOWN', 'mysqladmin', 'Security', 'Administration'],
    front: {
      question: 'Que permet le privilège SHUTDOWN et comment un administrateur peut-il arrêter proprement une instance MySQL à distance ?',
      codeSnippet: `GRANT SHUTDOWN ON *.* TO 'cluster_manager'@'%';
-- Arrêt via SQL sous MySQL 8.0 :
SHUTDOWN;
-- ou via utilitaire CLI :
$ mysqladmin -u cluster_manager -p shutdown`,
      hint: 'Autorise l\'instruction SQL SHUTDOWN et la commande mysqladmin shutdown.',
    },
    back: {
      answer: 'Le privilège `SHUTDOWN` :\n\n- Autorise l\'instruction SQL native **`SHUTDOWN;`** introduite sous MySQL 5.7/8.0.\n- Permet à l\'outil client `mysqladmin shutdown` d\'ordonner l\'arrêt gracieux du démon `mysqld`.\n- **Processus d\'arrêt propre** : Arrêt de l\'écoute réseau, attente ou rollback des transactions en cours, flush des dirty pages du Buffer Pool InnoDB sur disque, fermeture propre du Redo Log et arrêt des threads système.\n- Privilège strictement global (`*.*`) à haute criticité.',
      explanation: 'Nécessaire pour les orchestrateurs de haute disponibilité (Orchestrator, Kubernetes Operator) pour arrêter un nœud défaillant.',
      examTrap: 'Ne confondez pas SHUTDOWN (qui arrête mysqld) avec KILL (qui tue une connexion client spécifique).',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - SHUTDOWN Statement',
    },
  },
  {
    id: 'fc-mysql908-dom03-042',
    cardNumber: 42,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilège CREATE USER et périmètre d\'administration des comptes',
    difficulty: 'medium',
    tags: ['CREATE USER', 'User Management', 'Privileges', 'Security'],
    front: {
      question: 'Quelles sont toutes les instructions de gestion des comptes rendues possibles par la détention du seul privilège CREATE USER ?',
      hint: 'CREATE USER, ALTER USER, DROP USER, RENAME USER et les commandes de révocation globale.',
    },
    back: {
      answer: 'Le privilège `CREATE USER` donne un contrôle complet sur le cycle de vie des comptes :\n\n1. **`CREATE USER`** : Créer de nouveaux comptes et définir leurs mots de passe/attributs.\n2. **`ALTER USER`** : Modifier les mots de passe, verrouiller/déverrouiller des comptes (`ACCOUNT LOCK/UNLOCK`), changer les quotas.\n3. **`DROP USER`** : Supprimer des comptes et révoquer automatiquement leurs droits.\n4. **`RENAME USER`** : Renommer des comptes.\n5. **`REVOKE ALL PRIVILEGES ...`** : Révoquer l\'ensemble des privilèges d\'un utilisateur.\n\n*Attention* : Il ne permet PAS d\'accorder de nouveaux privilèges SQL (`GRANT SELECT`, etc.) sauf si l\'utilisateur possède également `GRANT OPTION` ou les privilèges en question.',
      explanation: 'Idéal pour déléguer la gestion des mots de passe à une équipe Helpdesk / Support sans leur donner de droits de lecture sur les bases métiers.',
      examTrap: 'Sous MySQL 8.0, un utilisateur possédant CREATE USER ne peut pas modifier un compte possédant le privilège dynamique SYSTEM_USER sans posséder lui-même SYSTEM_USER !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The CREATE USER Privilege',
    },
  },
  {
    id: 'fc-mysql908-dom03-043',
    cardNumber: 43,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilèges EVENT et TRIGGER',
    difficulty: 'medium',
    tags: ['EVENT', 'TRIGGER', 'Automation', 'Privileges'],
    front: {
      question: 'Quels privilèges sont indispensables pour créer, modifier et supprimer des tâches planifiées (Events) et des déclencheurs (Triggers) ?',
      codeSnippet: `GRANT EVENT ON ecom.* TO 'batch_user'@'%';
GRANT TRIGGER ON ecom.orders TO 'app_user'@'%';`,
      hint: 'EVENT pour l\'Event Scheduler, TRIGGER pour les déclencheurs automatiques sur INSERT/UPDATE/DELETE.',
    },
    back: {
      answer: 'Privilèges d\'automatisation :\n\n- **`EVENT`** :\n  - Permet d\'exécuter `CREATE EVENT`, `ALTER EVENT`, `DROP EVENT`.\n  - S\'accorde au niveau base (`ON db.*`) ou global (`ON *.*`).\n  - Nécessite que la variable globale `event_scheduler = ON` soit active pour que les tâches s\'exécutent en arrière-plan.\n- **`TRIGGER`** :\n  - Permet d\'exécuter `CREATE TRIGGER` et `DROP TRIGGER` sur une table.\n  - S\'accorde au niveau table (`ON db.table`), base ou global.\n  - Pour créer un trigger, l\'utilisateur doit également disposer des privilèges requis par les requêtes exécutées à l\'intérieur du trigger (ex: `UPDATE`, `INSERT`).',
      explanation: 'Historiquement (pré-5.1.6), la gestion des triggers exigeait le privilège SUPER. TRIGGER est désormais un privilège dédié indépendant.',
      examTrap: 'Pour supprimer un trigger (DROP TRIGGER), le privilège TRIGGER est nécessaire sur la table concernée.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Privileges for Stored Objects',
    },
  },
  {
    id: 'fc-mysql908-dom03-044',
    cardNumber: 44,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Privilèges pour la réplication : REPLICATION SLAVE et REPLICATION CLIENT',
    difficulty: 'medium',
    tags: ['Replication', 'REPLICATION SLAVE', 'REPLICATION CLIENT', 'HA'],
    front: {
      question: 'Quelle est la différence de rôle entre le privilège REPLICATION SLAVE et le privilège REPLICATION CLIENT ?',
      codeSnippet: `CREATE USER 'repl_user'@'192.168.1.%' IDENTIFIED BY 'ReplPass#2026';
GRANT REPLICATION SLAVE ON *.* TO 'repl_user'@'192.168.1.%';
GRANT REPLICATION CLIENT ON *.* TO 'monitor_user'@'%';`,
      hint: 'L\'un permet de lire le flux de transactions binaires (dump binlog), l\'autre permet de sonder l\'état de la réplication.',
    },
    back: {
      answer: 'Différence entre les deux privilèges de réplication :\n\n- **`REPLICATION SLAVE`** :\n  - Utilisé par le thread I/O d\'un **serveur réplica** pour se connecter à la source et demander la transmission du flux d\'événements binaires (`binlog dump`).\n  - Obligatoire pour le compte de réplication configuré dans `CHANGE REPLICATION SOURCE TO ...`.\n- **`REPLICATION CLIENT`** :\n  - N\'autorise pas le téléchargement des événements binaires.\n  - Permet uniquement d\'interroger le statut de la réplication : `SHOW REPLICA STATUS`, `SHOW BINARY LOG STATUS` et `SHOW BINARY LOGS`.\n  - Utilisé par les sondes de supervision (Nagios, Zabbix, Prometheus mysqld_exporter).',
      explanation: 'Ces deux privilèges s\'accordent impérativement au niveau GLOBAL (*.*).',
      examTrap: 'Ne donnez jamais REPLICATION SLAVE à un outil de monitoring ! Accordez-lui uniquement REPLICATION CLIENT selon le principe du moindre privilège.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Replication Privileges',
    },
  },
  {
    id: 'fc-mysql908-dom03-045',
    cardNumber: 45,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Dépréciation du privilège monolithique SUPER sous MySQL 8.0',
    difficulty: 'hard',
    tags: ['SUPER', 'Deprecation', 'Dynamic Privileges', 'Principle of Least Privilege'],
    front: {
      question: 'Pourquoi le privilège SUPER est-il officiellement déprécié sous MySQL 8.0 et quelle était la faille philosophique de ce super-droit historique ?',
      hint: 'SUPER était un fourre-tout accordant plus de 30 permissions critiques distinctes sans granularité.',
    },
    back: {
      answer: 'Raisons de la dépréciation de `SUPER` :\n\n1. **Violation du principe du moindre privilège** : Donner `SUPER` à un développeur pour qu\'il puisse faire un `KILL` de sa propre requête lui donnait en même temps le droit de modifier des variables globales critiques (`SET GLOBAL`), d\'arrêter la réplication, de forcer des connexions quand le serveur est plein et de bypasser les verrous de lecture.\n2. **Découpage sous MySQL 8.0 en privilèges dynamiques granulaires** :\n   - `SET GLOBAL` $\\rightarrow$ `SYSTEM_VARIABLES_ADMIN`\n   - `KILL thread` $\\rightarrow$ `CONNECTION_ADMIN`\n   - `PURGE BINARY LOGS` $\\rightarrow$ `BINLOG_ADMIN`\n   - `STOP REPLICA` $\\rightarrow$ `REPLICATION_SLAVE_ADMIN`\n   - `LOCK INSTANCE FOR BACKUP` $\\rightarrow$ `BACKUP_ADMIN`.\n3. Sous MySQL 8.0, utiliser `SUPER` déclenche un avertissement dans les logs.',
      explanation: 'La décomposition de SUPER permet de créer des profils d\'administration spécialisés (admin sauvegarde, admin réplication, exploitant N1) sans risques collatéraux.',
      examTrap: 'SUPER existe toujours en 8.0 pour assurer la rétrocompatibilité, mais l\'examen 1Z0-908 teste rigoureusement les privilèges dynamiques alternatifs !',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - The SUPER Privilege Deprecation',
    },
  },
  {
    id: 'fc-mysql908-dom03-046',
    cardNumber: 46,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Règles de syntaxe de REVOKE et pièges de périmètre',
    difficulty: 'medium',
    tags: ['REVOKE', 'Syntax', 'Scope Matching', 'Troubleshooting'],
    front: {
      question: 'Pourquoi la commande "REVOKE SELECT ON sales.orders FROM \'user\'@\'%\';" échoue-t-elle si le privilège SELECT a été accordé au niveau de la base avec "sales.*" ?',
      hint: 'REVOKE doit correspondre exactement au niveau auquel le privilège a été accordé (sauf si partial_revokes est activé).',
    },
    back: {
      answer: 'Règle de correspondance exacte de `REVOKE` :\n\n- Par défaut dans MySQL, les tables de privilèges sont partitionnées par niveau hiérarchique (`mysql.user`, `mysql.db`, `mysql.tables_priv`).\n- Si un privilège a été accordé au niveau de la base (`GRANT ... ON sales.*`), MySQL a créé une ligne dans `mysql.db`.\n- Tenter de révoquer au niveau table (`REVOKE ... ON sales.orders`) cherche une ligne dans `mysql.tables_priv`. N\'en trouvant aucune, MySQL renvoie une erreur : `ERROR 1147 (42000): There is no such grant defined for user...`.\n- **Règle d\'or** : On ne peut révoquer un privilège qu\'au niveau exact où il a été accordé (`ON *.*`, `ON db.*`, ou `ON db.table`).',
      explanation: 'Pour restreindre un privilège global sur une seule base sans tout casser, il faut activer la fonctionnalité moderne des révocations partielles (Partial Revokes).',
      examTrap: 'Vérifiez toujours le niveau exact avec SHOW GRANTS FOR \'user\'@\'host\' avant de rédiger vos ordres REVOKE.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - REVOKE Statement',
    },
  },
  {
    id: 'fc-mysql908-dom03-047',
    cardNumber: 47,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Révocation totale des droits : REVOKE ALL PRIVILEGES',
    difficulty: 'medium',
    tags: ['REVOKE ALL PRIVILEGES', 'GRANT OPTION', 'Security'],
    front: {
      question: 'Que révoque exactement la commande "REVOKE ALL PRIVILEGES, GRANT OPTION FROM \'user\'@\'%\';" et que conserve le compte utilisateur ?',
      codeSnippet: `REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'john'@'%';`,
      hint: 'Elle supprime tous les privilèges à tous les niveaux, mais le compte utilisateur lui-même existe toujours avec son mot de passe.',
    },
    back: {
      answer: 'Effets de `REVOKE ALL PRIVILEGES, GRANT OPTION` :\n\n- Révoque tous les privilèges statiques et dynamiques accordés à l\'utilisateur sur tous les niveaux (`*.*`, bases, tables, colonnes, routines).\n- Supprime la capacité de délégation (`GRANT OPTION`).\n- **Ce qui est conservé** :\n  - Le compte utilisateur **existe toujours** dans `mysql.user`.\n  - Son mot de passe reste actif.\n  - Ses attributs, limites de ressources et rôles restent configurés.\n  - L\'utilisateur peut toujours se connecter au serveur, mais il ne pourra accéder à aucune base de données (sauf `information_schema` et les tables publiques temporaires).',
      explanation: 'Pour supprimer totalement le compte et ses droits en une seule fois, l\'instruction recommandée est DROP USER.',
      examTrap: 'REVOKE ALL PRIVILEGES seul n\'enlève pas toujours le privilège GRANT OPTION ! Il est obligatoire d\'ajouter explicitement ", GRANT OPTION" dans la clause REVOKE.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - REVOKE Syntax',
    },
  },
  {
    id: 'fc-mysql908-dom03-048',
    cardNumber: 48,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Inspection des privilèges avec SHOW GRANTS',
    difficulty: 'easy',
    tags: ['SHOW GRANTS', 'Audit', 'CURRENT_USER', 'Privileges'],
    front: {
      question: 'Quelles sont les commandes permettant d\'inspecter les privilèges accordés à la session courante et à un utilisateur distant spécifique ?',
      codeSnippet: `SHOW GRANTS; -- Privilèges de la session courante
SHOW GRANTS FOR 'reporter'@'192.168.1.%';
SHOW GRANTS FOR 'reporter'@'192.168.1.%' USING 'role_analyst';`,
      hint: 'SHOW GRANTS affiche les lignes GRANT équivalentes nécessaires pour recréer les privilèges.',
    },
    back: {
      answer: 'Commandes d\'inspection `SHOW GRANTS` :\n\n- **`SHOW GRANTS;`** (ou `SHOW GRANTS FOR CURRENT_USER();`) : Affiche tous les privilèges détenus par la session connectée, y compris les privilèges hérités des rôles actifs.\n- **`SHOW GRANTS FOR \'user\'@\'host\';`** : Affiche les privilèges attribués directement au compte ciblé (requiert les droits administratifs).\n- **Clause `USING`** : `SHOW GRANTS FOR \'user\'@\'host\' USING \'role1\', \'role2\';` permet d\'observer les privilèges combinés qu\'aurait cet utilisateur si ces rôles précis étaient activés.\n- La sortie est formatée sous forme d\'instructions `GRANT` prêtes à être exportées dans un script.',
      explanation: 'Indispensable pour auditer les droits réels avant toute modification de sécurité.',
      examTrap: 'Pour exécuter SHOW GRANTS sur un autre utilisateur, il faut disposer du privilège SYSTEM_VARIABLES_ADMIN, du déprécié SELECT sur le schéma mysql, ou de la permission SHOW DATABASES si on possède des droits sur ses bases.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - SHOW GRANTS Statement',
    },
  },
  {
    id: 'fc-mysql908-dom03-049',
    cardNumber: 49,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Différence essentielle : CURRENT_USER() vs USER()',
    difficulty: 'medium',
    tags: ['CURRENT_USER', 'USER', 'Functions', 'Authentication'],
    front: {
      question: 'Quelle est la différence fondamentale entre la fonction CURRENT_USER() et la fonction USER() (ou SYSTEM_USER()) dans MySQL ?',
      codeSnippet: `SELECT USER(), CURRENT_USER();
-- Résultat :
-- USER()         : 'alice'@'pc42.internal.lan'
-- CURRENT_USER() : 'alice'@'%'`,
      hint: 'L\'un retourne les identifiants fournis lors de la négociation TCP, l\'autre retourne le compte d\'autorisation authentifié par le serveur.',
    },
    back: {
      answer: 'Différence fondamentale :\n\n- **`USER()`** (ou `SESSION_USER()`, `SYSTEM_USER()`) :\n  - Représente **la chaîne littérale envoyée par le client** lors de la négociation de connexion (nom d\'utilisateur déclaré + nom d\'hôte ou adresse IP physique du client distant).\n- **`CURRENT_USER()`** :\n  - Représente **le compte d\'autorisation réel** que le serveur a validé dans `mysql.user` pour autoriser cette session.\n  - C\'est ce compte qui détermine les privilèges effectifs et les accès de la session.\n  - En cas d\'utilisateur anonyme ou d\'utilisation de proxy user, `CURRENT_USER()` retourne le compte mandataire ou effectif.',
      explanation: 'Dans les procédures stockées définies avec DEFINER, CURRENT_USER() renvoie le compte du DEFINER pendant l\'exécution, tandis que USER() renvoie toujours l\'appelant connecté.',
      examTrap: 'Piège d\'examen récurrent : dans un déclencheur de sécurité ou un audit d\'accès, fiez-vous toujours à CURRENT_USER() pour connaître les droits réels appliqués, et non à USER().',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - Information Functions: CURRENT_USER',
    },
  },
  {
    id: 'fc-mysql908-dom03-050',
    cardNumber: 50,
    domainId: 'mysql-908-dom-03',
    domainCode: 'DOM-03',
    domainTitle: 'Sécurité, Gestion des utilisateurs, Rôles & Authentification',
    subtopic: 'Vues de métadonnées des privilèges dans INFORMATION_SCHEMA',
    difficulty: 'medium',
    tags: ['INFORMATION_SCHEMA', 'USER_PRIVILEGES', 'Audit', 'Metadata'],
    front: {
      question: 'Quelles sont les 4 vues standards de INFORMATION_SCHEMA permettant d\'auditer les privilèges accordés aux utilisateurs par requête SQL ?',
      codeSnippet: `SELECT * FROM information_schema.USER_PRIVILEGES;
SELECT * FROM information_schema.SCHEMA_PRIVILEGES;
SELECT * FROM information_schema.TABLE_PRIVILEGES;
SELECT * FROM information_schema.COLUMN_PRIVILEGES;`,
      hint: 'Une vue pour le niveau global, une pour les bases, une pour les tables et une pour les colonnes.',
    },
    back: {
      answer: 'Les 4 vues d\'audit de privilèges dans `INFORMATION_SCHEMA` :\n\n1. **`USER_PRIVILEGES`** : Liste tous les privilèges accordés au **niveau global** (`*.*`) pour chaque compte (`GRANTEE`, `PRIVILEGE_TYPE`, `IS_GRANTABLE`).\n2. **`SCHEMA_PRIVILEGES`** : Liste les privilèges accordés au niveau **schéma / base de données** (`TABLE_SCHEMA`).\n3. **`TABLE_PRIVILEGES`** : Liste les privilèges accordés au niveau **table individuelle** (`TABLE_SCHEMA`, `TABLE_NAME`).\n4. **`COLUMN_PRIVILEGES`** : Liste les privilèges accordés sur des **colonnes spécifiques** (`COLUMN_NAME`).\n\n*Note MySQL 8.0* : Pour les privilèges dynamiques, interroger la table `mysql.global_grants`.',
      explanation: 'Ces vues permettent de programmer des scripts d\'audit automatisés sans analyser le texte brut de SHOW GRANTS.',
      examTrap: 'Un utilisateur ordinaire interrogeant ces vues ne verra que les lignes correspondant aux privilèges qu\'il détient lui-même.',
      ruleRef: 'Oracle MySQL 8.0 Reference Manual - INFORMATION_SCHEMA Privilege Tables',
    },
  },
];
