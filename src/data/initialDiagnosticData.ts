export interface DiagnosticQuestion {
  id: string;
  number: number;
  category: string; // 'SQL' | 'Modélisation' | 'Normalisation' | 'Transactions' | 'Index' | 'Contraintes' | 'Sécurité' | 'Administration' | 'Performances' | 'Concepts NoSQL'
  domainId: 'sql' | 'modelisation' | 'transactions' | 'indexation' | 'administration';
  subtopicId: string;
  titleFr: string;
  titleEn: string;
  codeSnippet?: string;
  optionsFr: { id: string; text: string }[];
  optionsEn: { id: string; text: string }[];
  correctOptionId: string;
  explanationFr: string;
  explanationEn: string;
  trapWarningFr?: string;
}

export const INITIAL_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // 1. SQL - SELECT & NULL logic
  {
    id: 'diag-1',
    number: 1,
    category: 'SQL',
    domainId: 'sql',
    subtopicId: 'select',
    titleFr: 'Que renvoie l\'expression SQL suivante lorsque la colonne remise vaut NULL ?',
    titleEn: 'What does the following SQL expression return when the discount column is NULL?',
    codeSnippet: 'SELECT COALESCE(remise, 0) + 10 FROM ventes;',
    optionsFr: [
      { id: 'a', text: 'NULL' },
      { id: 'b', text: '10' },
      { id: 'c', text: 'Une erreur d\'exécution' },
      { id: 'd', text: '0' },
    ],
    optionsEn: [
      { id: 'a', text: 'NULL' },
      { id: 'b', text: '10' },
      { id: 'c', text: 'A runtime error' },
      { id: 'd', text: '0' },
    ],
    correctOptionId: 'b',
    explanationFr: 'COALESCE(remise, 0) renvoie le premier argument non NULL. Si remise est NULL, la fonction renvoie 0. L\'addition donne donc 0 + 10 = 10. Sans COALESCE, NULL + 10 aurait renvoyé NULL.',
    explanationEn: 'COALESCE returns the first non-NULL expression. If discount is NULL, it yields 0, so 0 + 10 = 10.',
    trapWarningFr: 'En SQL, toute opération arithmétique directe avec NULL (ex: NULL + 10) produit NULL.',
  },

  // 2. SQL - WHERE & Ternary Logic
  {
    id: 'diag-2',
    number: 2,
    category: 'SQL',
    domainId: 'sql',
    subtopicId: 'where',
    titleFr: 'Pourquoi la requête "SELECT * FROM employes WHERE commission = NULL;" ne renvoie-t-elle jamais aucune ligne ?',
    titleEn: 'Why does "SELECT * FROM employees WHERE commission = NULL;" never return any row?',
    optionsFr: [
      { id: 'a', text: 'Car la syntaxe génère une erreur SQL bloquante' },
      { id: 'b', text: 'Car en logique ternaire SQL, l\'égalité avec NULL évalue à UNKNOWN (ni TRUE ni FALSE)' },
      { id: 'c', text: 'Car NULL représente la chaîne de caractères vide' },
      { id: 'd', text: 'Car les index refusent de scanner les valeurs NULL' },
    ],
    optionsEn: [
      { id: 'a', text: 'Because the syntax produces a blocking SQL error' },
      { id: 'b', text: 'Because in 3-valued logic, equality with NULL evaluates to UNKNOWN' },
      { id: 'c', text: 'Because NULL represents the empty string' },
      { id: 'd', text: 'Because indexes refuse to scan NULL values' },
    ],
    correctOptionId: 'b',
    explanationFr: 'En SQL standard (norme ANSI), la comparaison avec "=" sur une valeur inconnue produit la valeur booléenne UNKNOWN. La clause WHERE ne conserve que les lignes dont le prédicat est strictement TRUE. Pour tester l\'absence de valeur, il faut impérativement utiliser "IS NULL".',
    explanationEn: 'In ANSI 3-valued logic, commission = NULL evaluates to UNKNOWN. WHERE filters out non-TRUE rows.',
    trapWarningFr: 'Piège classique n°1 en certification : toujours utiliser IS NULL ou IS NOT NULL.',
  },

  // 3. SQL - JOIN (LEFT JOIN vs WHERE filtering)
  {
    id: 'diag-3',
    number: 3,
    category: 'SQL',
    domainId: 'sql',
    subtopicId: 'join',
    titleFr: 'Dans un LEFT JOIN, quelle est la conséquence d\'ajouter un filtre sur la table de droite dans la clause WHERE au lieu de la clause ON ?',
    titleEn: 'In a LEFT JOIN, what is the consequence of placing a filter on the right table in WHERE instead of ON?',
    codeSnippet: 'SELECT c.nom, c.ville, v.montant\nFROM clients c\nLEFT JOIN ventes v ON c.id = v.client_id\nWHERE v.montant > 500;',
    optionsFr: [
      { id: 'a', text: 'Aucune différence, le plan d\'exécution est strictement identique' },
      { id: 'b', text: 'Le LEFT JOIN se comporte comme un INNER JOIN et élimine tous les clients sans vente' },
      { id: 'c', text: 'Les clients sans vente sont conservés avec la mention montant = 0' },
      { id: 'd', text: 'Le moteur de base de données lève une exception de syntaxe' },
    ],
    optionsEn: [
      { id: 'a', text: 'No difference, the plan is strictly identical' },
      { id: 'b', text: 'The LEFT JOIN degrades into an INNER JOIN, discarding clients with no sales' },
      { id: 'c', text: 'Clients with no sales are kept with amount = 0' },
      { id: 'd', text: 'The DBMS raises a syntax exception' },
    ],
    correctOptionId: 'b',
    explanationFr: 'Pour un client sans vente, les colonnes de ventes (v.*) sont générées avec la valeur NULL. Dans le WHERE, la condition "NULL > 500" s\'évalue à UNKNOWN, ce qui élimine la ligne. Le LEFT JOIN est donc dégradé en INNER JOIN.',
    explanationEn: 'Unmatched rows have v.amount = NULL. NULL > 500 is UNKNOWN, discarding them like an INNER JOIN.',
    trapWarningFr: 'Pour conserver les lignes gauches non appariées, le filtre sur la table droite doit rester dans le ON.',
  },

  // 4. SQL - GROUP BY & HAVING
  {
    id: 'diag-4',
    number: 4,
    category: 'SQL',
    domainId: 'sql',
    subtopicId: 'group_by',
    titleFr: 'Quelle est la différence fondamentale entre la clause WHERE et la clause HAVING ?',
    titleEn: 'What is the fundamental difference between WHERE and HAVING?',
    optionsFr: [
      { id: 'a', text: 'WHERE s\'applique avant l\'agrégation sur les lignes individuelles, HAVING filtre les groupes agrégés' },
      { id: 'b', text: 'HAVING est réservé uniquement aux fonctions textuelles et LIKE' },
      { id: 'c', text: 'WHERE s\'exécute après le GROUP BY tandis que HAVING s\'exécute avant' },
      { id: 'd', text: 'Il n\'y a aucune différence, HAVING est un simple alias historique de WHERE' },
    ],
    optionsEn: [
      { id: 'a', text: 'WHERE filters individual rows before grouping, HAVING filters aggregated groups' },
      { id: 'b', text: 'HAVING is only reserved for text and LIKE functions' },
      { id: 'c', text: 'WHERE executes after GROUP BY, while HAVING executes before' },
      { id: 'd', text: 'No difference, HAVING is just an alias for WHERE' },
    ],
    correctOptionId: 'a',
    explanationFr: 'WHERE filtre les tuples individuels avant tout calcul de regroupement. HAVING intervient après le GROUP BY pour filtrer les résultats agrégés calculés par SUM, COUNT, AVG, etc.',
    explanationEn: 'WHERE filters row by row prior to aggregation. HAVING filters group results calculated by aggregates.',
  },

  // 5. Modélisation - Relations N:M & Table de liaison
  {
    id: 'diag-5',
    number: 5,
    category: 'Modélisation',
    domainId: 'modelisation',
    subtopicId: 'schema_ddl',
    titleFr: 'Comment modélise-t-on correctement une relation Plusieurs-à-Plusieurs (N:M) entre les entités ÉTUDIANT et COURS dans un modèle relationnel ?',
    titleEn: 'How is a Many-to-Many (M:N) relationship modeled between STUDENT and COURSE in a relational schema?',
    optionsFr: [
      { id: 'a', text: 'En ajoutant un tableau d\'identifiants de cours dans une colonne JSON de la table ÉTUDIANT' },
      { id: 'b', text: 'En créant une table intermédiaire associative (ex: INSCRIPTION) avec les clés étrangères des deux tables' },
      { id: 'c', text: 'En dupliquant la table COURS pour chaque étudiant inscrit' },
      { id: 'd', text: 'Une relation N:M est interdite en base de données relationnelle' },
    ],
    optionsEn: [
      { id: 'a', text: 'By storing an array of course IDs in a JSON column of STUDENT' },
      { id: 'b', text: 'By introducing an associative junction table with both foreign keys' },
      { id: 'c', text: 'By duplicating the COURSE table for each enrolled student' },
      { id: 'd', text: 'Many-to-many relationships are forbidden in RDBMS' },
    ],
    correctOptionId: 'b',
    explanationFr: 'La règle fondamentale de modélisation relationnelle pour une relation N:M consiste à créer une table de jonction associative (junction table) dont la clé primaire composite est formée des clés étrangères pointant vers les deux tables parentes.',
    explanationEn: 'M:N relationships require an associative junction table holding foreign keys to both parents.',
  },

  // 6. Contraintes - Intégrité référentielle & CASCADE
  {
    id: 'diag-6',
    number: 6,
    category: 'Contraintes',
    domainId: 'modelisation',
    subtopicId: 'constraints_keys',
    titleFr: 'Que se passe-t-il lors de la suppression d\'une ligne parente si la clé étrangère est définie avec "ON DELETE CASCADE" ?',
    titleEn: 'What happens when a parent row is deleted if the foreign key specifies "ON DELETE CASCADE"?',
    optionsFr: [
      { id: 'a', text: 'La suppression est bloquée si des lignes dépendantes existent' },
      { id: 'b', text: 'Les lignes enfants associées dans la table fille sont automatiquement supprimées' },
      { id: 'c', text: 'La clé étrangère des lignes enfants est automatiquement mise à NULL' },
      { id: 'd', text: 'Une sauvegarde automatique de la table parente est générée' },
    ],
    optionsEn: [
      { id: 'a', text: 'The deletion is blocked if dependent child rows exist' },
      { id: 'b', text: 'All associated child rows in the referencing table are automatically deleted' },
      { id: 'c', text: 'The child foreign key columns are set to NULL' },
      { id: 'd', text: 'An automatic backup is taken' },
    ],
    correctOptionId: 'b',
    explanationFr: 'ON DELETE CASCADE propage automatiquement la suppression du parent vers tous les enregistrements enfants correspondants. Si l\'on souhaite interdire la suppression, on utilise RESTRICT ou NO ACTION.',
    explanationEn: 'ON DELETE CASCADE propagates parent deletion to all referencing child rows automatically.',
  },

  // 7. Normalisation - Première Forme Normale (1NF)
  {
    id: 'diag-7',
    number: 7,
    category: 'Normalisation',
    domainId: 'modelisation',
    subtopicId: 'norm_3nf',
    titleFr: 'Laquelle des situations suivantes viole directement la Première Forme Normale (1NF) ?',
    titleEn: 'Which of the following scenarios directly violates First Normal Form (1NF)?',
    optionsFr: [
      { id: 'a', text: 'Une table ne possède pas d\'index B-Tree' },
      { id: 'b', text: 'Une colonne "telephones" contient plusieurs numéros séparés par des virgules dans la même cellule' },
      { id: 'c', text: 'Une clé étrangère référence une table externe' },
      { id: 'd', text: 'Une colonne contient des valeurs numériques négatives' },
    ],
    optionsEn: [
      { id: 'a', text: 'A table has no B-Tree index' },
      { id: 'b', text: 'A column "phones" stores multiple phone numbers separated by commas in a single cell' },
      { id: 'c', text: 'A foreign key references an external table' },
      { id: 'd', text: 'A column contains negative numbers' },
    ],
    correctOptionId: 'b',
    explanationFr: 'La 1NF impose que chaque attribut contienne une valeur atomique (indivisible) et qu\'il n\'y ait pas de groupes répétitifs ou de listes concaténées au sein d\'une même cellule.',
    explanationEn: '1NF requires all attributes to be atomic (no repeating groups, no delimited lists).',
  },

  // 8. Normalisation - Troisième Forme Normale (3NF) & Dépendance Transitive
  {
    id: 'diag-8',
    number: 8,
    category: 'Normalisation',
    domainId: 'modelisation',
    subtopicId: 'norm_3nf',
    titleFr: 'Qu\'est-ce qui caractérise une violation de la Troisième Forme Normale (3NF) dans une table déjà en 2NF ?',
    titleEn: 'What characterizes a violation of Third Normal Form (3NF) in a table that is already in 2NF?',
    optionsFr: [
      { id: 'a', text: 'La présence d\'une dépendance fonctionnelle transitive entre attributs non-clés (X → Y → Z)' },
      { id: 'b', text: 'L\'utilisation d\'un identifiant auto-incrémenté' },
      { id: 'c', text: 'L\'absence de contrainte NOT NULL sur la clé primaire' },
      { id: 'd', text: 'Le dépassement de 10 colonnes dans la table' },
    ],
    optionsEn: [
      { id: 'a', text: 'The existence of a transitive functional dependency between non-key attributes (X -> Y -> Z)' },
      { id: 'b', text: 'Using an auto-incrementing surrogate key' },
      { id: 'c', text: 'Missing NOT NULL constraint on primary key' },
      { id: 'd', text: 'Having more than 10 columns in a table' },
    ],
    correctOptionId: 'a',
    explanationFr: 'La 3NF exige qu\'aucun attribut non-clé ne dépende d\'un autre attribut non-clé par transitivité. Par exemple, si id_client → code_postal et code_postal → nom_ville, le nom de ville doit être extrait dans une table dédiée pour éliminer la redondance.',
    explanationEn: '3NF requires that every non-key attribute depends only on the primary key, eliminating transitive dependencies.',
  },

  // 9. Transactions - Propriétés ACID
  {
    id: 'diag-9',
    number: 9,
    category: 'Transactions',
    domainId: 'transactions',
    subtopicId: 'acid_props',
    titleFr: 'Quelle propriété ACID garantit qu\'une transaction validée (COMMIT) ne sera jamais perdue, même en cas de panne de courant immédiate du serveur ?',
    titleEn: 'Which ACID property guarantees that a committed transaction is never lost even if the server crashes immediately?',
    optionsFr: [
      { id: 'a', text: 'Atomicité (Atomicity)' },
      { id: 'b', text: 'Cohérence (Consistency)' },
      { id: 'c', text: 'Isolation (Isolation)' },
      { id: 'd', text: 'Durabilité (Durability)' },
    ],
    optionsEn: [
      { id: 'a', text: 'Atomicity' },
      { id: 'b', text: 'Consistency' },
      { id: 'c', text: 'Isolation' },
      { id: 'd', text: 'Durability' },
    ],
    correctOptionId: 'd',
    explanationFr: 'La Durabilité (Durability) garantit que les effets d\'un COMMIT sont persistés de manière permanente sur support non-volatile (via le journal WAL / Redo Log) et résistent aux pannes matérielles.',
    explanationEn: 'Durability guarantees that committed data persists even during crashes, via write-ahead logging (WAL).',
  },

  // 10. Transactions - Niveaux d'isolation ANSI (Read Committed vs Repeatable Read)
  {
    id: 'diag-10',
    number: 10,
    category: 'Transactions',
    domainId: 'transactions',
    subtopicId: 'isolation_levels',
    titleFr: 'Quel phénomène d\'anomalie de concurrence le niveau d\'isolation "READ COMMITTED" permet-il encore de subir ?',
    titleEn: 'Which concurrency anomaly can still occur under the "READ COMMITTED" isolation level?',
    optionsFr: [
      { id: 'a', text: 'La lecture sale (Dirty Read : lire des modifications non commitées)' },
      { id: 'b', text: 'La lecture non-répétable (Non-repeatable Read : une même requête SELECT relue dans la même transaction voit des valeurs modifiées)' },
      { id: 'c', text: 'La corruption physique des blocs de données' },
      { id: 'd', text: 'L\'interdiction complète des transactions concurrentes' },
    ],
    optionsEn: [
      { id: 'a', text: 'Dirty Read (reading uncommitted changes)' },
      { id: 'b', text: 'Non-repeatable Read (rereading the same row within a transaction sees modified values)' },
      { id: 'c', text: 'Physical block corruption' },
      { id: 'd', text: 'Complete denial of concurrent transactions' },
    ],
    correctOptionId: 'b',
    explanationFr: 'READ COMMITTED interdit les Dirty Reads (on ne lit que des données validées). En revanche, si une autre transaction modifie et commite une ligne entre deux lectures, la première transaction observera deux valeurs différentes (Non-repeatable Read). Pour l\'empêcher, il faut REPEATABLE READ ou SERIALIZABLE.',
    explanationEn: 'READ COMMITTED prevents dirty reads, but allows non-repeatable reads and phantom reads.',
  },

  // 11. Transactions - Verrous & Deadlocks
  {
    id: 'diag-11',
    number: 11,
    category: 'Transactions',
    domainId: 'transactions',
    subtopicId: 'locks_deadlocks',
    titleFr: 'Qu\'est-ce qu\'un interblocage (Deadlock) entre deux transactions et comment le moteur relationnel réagit-il ?',
    titleEn: 'What is a Deadlock between two transactions and how does the relational engine react?',
    optionsFr: [
      { id: 'a', text: 'Une situation d\'attente circulaire où chaque transaction attend un verrou détenu par l\'autre ; le moteur détecte le cycle et annule (ROLLBACK) l\'une des transactions' },
      { id: 'b', text: 'Une saturation de la mémoire vive obligeant à redémarrer le serveur' },
      { id: 'c', text: 'Un verrou partagé converti en verrou temporaire' },
      { id: 'd', text: 'Une erreur de clé dupliquée' },
    ],
    optionsEn: [
      { id: 'a', text: 'A circular wait where each holds a lock the other needs; the engine breaks it by rolling back one victim' },
      { id: 'b', text: 'A memory leak requiring a reboot' },
      { id: 'c', text: 'A shared lock converted to temporary' },
      { id: 'd', text: 'A duplicate key error' },
    ],
    correctOptionId: 'a',
    explanationFr: 'Un deadlock est un blocage mutuel cyclique (T1 attend T2 et T2 attend T1). Le composant Deadlock Detector du SGBD identifie le cycle dans le graphe d\'attente et sacrifie une transaction ("victim") en effectuant un ROLLBACK automatique.',
    explanationEn: 'Deadlocks represent circular dependencies in the wait-for graph. The DBMS detects the cycle and aborts one transaction.',
  },

  // 12. Index - B-Tree vs Full Table Scan
  {
    id: 'diag-12',
    number: 12,
    category: 'Index',
    domainId: 'indexation',
    subtopicId: 'btree_bitmap',
    titleFr: 'Pour quelle colonne un index B-Tree traditionnel est-il le plus efficace ?',
    titleEn: 'For which column is a traditional B-Tree index most effective?',
    optionsFr: [
      { id: 'a', text: 'Une colonne "genre" avec seulement 2 valeurs possibles (M/F) sur 5 millions de lignes' },
      { id: 'b', text: 'Une colonne "numero_securite_sociale" à très forte sélectivité (valeurs quasi-uniques)' },
      { id: 'c', text: 'Une colonne contenant de très longs textes non filtrés' },
      { id: 'd', text: 'Une colonne modifiée 10 000 fois par seconde par des UPDATEs' },
    ],
    optionsEn: [
      { id: 'a', text: 'A gender column with only 2 distinct values across 5M rows' },
      { id: 'b', text: 'A national ID column with very high selectivity (near-unique values)' },
      { id: 'c', text: 'A long unstructured text column never filtered on' },
      { id: 'd', text: 'A column undergoing 10,000 UPDATEs per second' },
    ],
    correctOptionId: 'b',
    explanationFr: 'Les index B-Tree sont optimaux pour les colonnes à haute sélectivité (très grand nombre de valeurs distinctes) car ils permettent d\'atteindre une ligne en quelques accès disques O(log N). Pour les faibles cardinalités (ex: 2 valeurs), un Full Table Scan ou un index Bitmap est préférable.',
    explanationEn: 'B-Tree indexes excel at high selectivity columns where very few rows match each lookup.',
  },

  // 13. Index - Règle du préfixe le plus à gauche (Composite Index)
  {
    id: 'diag-13',
    number: 13,
    category: 'Index',
    domainId: 'indexation',
    subtopicId: 'composite_indexes',
    titleFr: 'Soit un index composite créé sur (nom, prenom, date_naissance). Quelle requête NE PEUT PAS utiliser cet index de manière optimale ?',
    titleEn: 'Given a composite index on (last_name, first_name, birth_date), which query CANNOT use this index optimally?',
    optionsFr: [
      { id: 'a', text: 'SELECT * FROM clients WHERE nom = \'Dupont\';' },
      { id: 'b', text: 'SELECT * FROM clients WHERE nom = \'Dupont\' AND prenom = \'Jean\';' },
      { id: 'c', text: 'SELECT * FROM clients WHERE date_naissance = \'1990-05-12\';' },
      { id: 'd', text: 'SELECT * FROM clients WHERE nom = \'Dupont\' AND date_naissance = \'1990-05-12\';' },
    ],
    optionsEn: [
      { id: 'a', text: 'WHERE last_name = \'Dupont\'' },
      { id: 'b', text: 'WHERE last_name = \'Dupont\' AND first_name = \'Jean\'' },
      { id: 'c', text: 'WHERE birth_date = \'1990-05-12\'' },
      { id: 'd', text: 'WHERE last_name = \'Dupont\' AND birth_date = \'1990-05-12\'' },
    ],
    correctOptionId: 'c',
    explanationFr: 'La règle du préfixe le plus à gauche (Leftmost Prefix Rule) stipule qu\'un index composite (A, B, C) ne peut servir de point d\'entrée dans l\'arbre que si la première colonne (A) est présente dans la clause WHERE. Une recherche sur C seul sans A nécessite un scan complet.',
    explanationEn: 'The leftmost prefix rule requires the leading index column (last_name) in the predicate to seek the B-Tree.',
    trapWarningFr: 'Piège fréquent d\'optimisation : créer un index composite sans respecter l\'ordre des filtres fréquents.',
  },

  // 14. Performances - Analyse du plan d\'exécution (EXPLAIN)
  {
    id: 'diag-14',
    number: 14,
    category: 'Performances',
    domainId: 'indexation',
    subtopicId: 'explain_plan',
    titleFr: 'Lors de l\'analyse d\'une commande "EXPLAIN", que signifie généralement l\'opération "TABLE ACCESS FULL" (ou Seq Scan) ?',
    titleEn: 'In an EXPLAIN execution plan, what does a "TABLE ACCESS FULL" (or Seq Scan) generally indicate?',
    optionsFr: [
      { id: 'a', text: 'L\'utilisation de l\'index le plus performant possible' },
      { id: 'b', text: 'La lecture séquentielle de l\'intégralité des blocs de la table sur le disque' },
      { id: 'c', text: 'La mise en mémoire cache permanente de la table' },
      { id: 'd', text: 'Une erreur de permission d\'accès' },
    ],
    optionsEn: [
      { id: 'a', text: 'Optimal usage of the fastest index' },
      { id: 'b', text: 'Sequential reading of every block of the table from disk' },
      { id: 'c', text: 'Permanent in-memory caching of the table' },
      { id: 'd', text: 'A permission access violation' },
    ],
    correctOptionId: 'b',
    explanationFr: 'TABLE ACCESS FULL (ou Seq Scan sous PostgreSQL) signifie que le moteur parcourt l\'intégralité de la table ligne par ligne. Sur une table volumineuse, si un filtre très sélectif est appliqué, c\'est le signe typique d\'un index manquant ou inopérant.',
    explanationEn: 'Full Table Scan reads every physical block of the table sequentially, usually signaling a missing index on selective filters.',
  },

  // 15. Sécurité - Privilèges & DCL (GRANT / REVOKE)
  {
    id: 'diag-15',
    number: 15,
    category: 'Sécurité',
    domainId: 'administration',
    subtopicId: 'roles_privileges',
    titleFr: 'Quelle commande SQL permet de donner le droit de lecture sur la table "commandes" à l\'utilisateur "analyste" tout en lui interdisant de transmettre ce droit à d\'autres ?',
    titleEn: 'Which SQL statement grants SELECT on "orders" to "analyst" without allowing them to grant it further?',
    optionsFr: [
      { id: 'a', text: 'GRANT SELECT ON commandes TO analyste;' },
      { id: 'b', text: 'GRANT SELECT ON commandes TO analyste WITH GRANT OPTION;' },
      { id: 'c', text: 'ALLOW USER analyste READ ON commandes;' },
      { id: 'd', text: 'ALTER TABLE commandes ADD PERMISSION analyste;' },
    ],
    optionsEn: [
      { id: 'a', text: 'GRANT SELECT ON orders TO analyst;' },
      { id: 'b', text: 'GRANT SELECT ON orders TO analyst WITH GRANT OPTION;' },
      { id: 'c', text: 'ALLOW USER analyst READ ON orders;' },
      { id: 'd', text: 'ALTER TABLE orders ADD PERMISSION analyst;' },
    ],
    correctOptionId: 'a',
    explanationFr: 'La commande standard est "GRANT SELECT ON table TO user;". Si l\'on ajoutait "WITH GRANT OPTION", l\'utilisateur recevrait le pouvoir de déléguer ce privilège à des tiers.',
    explanationEn: 'GRANT SELECT ON table TO user gives read access. Adding WITH GRANT OPTION would permit sub-granting.',
  },

  // 16. Sécurité - Injection SQL & Requêtes préparées
  {
    id: 'diag-16',
    number: 16,
    category: 'Sécurité',
    domainId: 'administration',
    subtopicId: 'roles_privileges',
    titleFr: 'Quel est le moyen le plus efficace pour immuniser une application contre les attaques par injection SQL ?',
    titleEn: 'What is the most effective technique to protect an application against SQL injection attacks?',
    optionsFr: [
      { id: 'a', text: 'Utiliser systématiquement des requêtes préparées avec variables de liaison (Prepared Statements & Bind Parameters)' },
      { id: 'b', text: 'Chiffrer le mot de passe de connexion à la base en MD5' },
      { id: 'c', text: 'Remplacer les guillemets simples par des guillemets doubles dans le code front-end' },
      { id: 'd', text: 'Redémarrer le serveur de base de données chaque nuit' },
    ],
    optionsEn: [
      { id: 'a', text: 'Always use parameterized queries and prepared statements with bind parameters' },
      { id: 'b', text: 'Encrypt the database password with MD5' },
      { id: 'c', text: 'Replace single quotes with double quotes in client code' },
      { id: 'd', text: 'Reboot the database nightly' },
    ],
    correctOptionId: 'a',
    explanationFr: 'Les requêtes préparées séparent strictement la logique SQL (pré-compilée par le moteur) des données d\'entrée (bind variables). Même si un pirate saisit "OR 1=1; DROP TABLE", le moteur traite la saisie comme une simple valeur littérale et non du code exécutable.',
    explanationEn: 'Prepared statements separate SQL syntax compilation from user parameter data, neutralizing injection.',
  },

  // 17. Administration - Sauvegardes & Point-in-Time Recovery
  {
    id: 'diag-17',
    number: 17,
    category: 'Administration',
    domainId: 'administration',
    subtopicId: 'backup_recovery',
    titleFr: 'Pour réaliser une restauration à un instant précis dans le passé (Point-in-Time Recovery ou PITR), de quoi a-t-on impérativement besoin en plus de la sauvegarde complète ?',
    titleEn: 'To execute a Point-in-Time Recovery (PITR), what is strictly required in addition to a full backup?',
    optionsFr: [
      { id: 'a', text: 'Des journaux de transactions continus archivés (WAL / Archive Redo Logs)' },
      { id: 'b', text: 'D\'une réplique exacte de tous les index B-Tree' },
      { id: 'c', text: 'D\'un export CSV des métadonnées' },
      { id: 'd', text: 'Du mot de passe administrateur root' },
    ],
    optionsEn: [
      { id: 'a', text: 'Archived transaction logs (WAL / Archive Redo Logs)' },
      { id: 'b', text: 'An exact clone of all B-Tree indexes' },
      { id: 'c', text: 'A CSV dump of metadata' },
      { id: 'd', text: 'The root admin password' },
    ],
    correctOptionId: 'a',
    explanationFr: 'Le PITR applique d\'abord la sauvegarde complète la plus récente, puis rejoue (Roll-Forward) séquentiellement les fichiers de logs de transactions archivés (WAL / Redo Logs) jusqu\'au timestamp exact souhaité (ex: 1 seconde avant un DROP TABLE accidentel).',
    explanationEn: 'PITR restores the base backup and replays archived transaction write-ahead logs (WAL) up to the target timestamp.',
  },

  // 18. Administration - Stockage & Maintenance (VACUUM / Tablespaces)
  {
    id: 'diag-18',
    number: 18,
    category: 'Administration',
    domainId: 'administration',
    subtopicId: 'data_dictionary',
    titleFr: 'Sous un SGBD utilisant le MVCC (ex: PostgreSQL), quel est le rôle de la commande VACUUM ?',
    titleEn: 'In an MVCC database such as PostgreSQL, what is the primary role of VACUUM?',
    optionsFr: [
      { id: 'a', text: 'Récupérer l\'espace disque occupé par les lignes périmées (dead tuples) issues des UPDATE et DELETE' },
      { id: 'b', text: 'Supprimer définitivement les utilisateurs inactifs depuis 30 jours' },
      { id: 'c', text: 'Convertir les tables relationnelles en format NoSQL' },
      { id: 'd', text: 'Accélérer les requêtes réseau en compressant les trames TCP' },
    ],
    optionsEn: [
      { id: 'a', text: 'Reclaim space occupied by dead tuples from UPDATE and DELETE operations' },
      { id: 'b', text: 'Delete users inactive for 30 days' },
      { id: 'c', text: 'Convert tables to NoSQL format' },
      { id: 'd', text: 'Compress network TCP packets' },
    ],
    correctOptionId: 'a',
    explanationFr: 'En architecture MVCC, un UPDATE ou DELETE ne supprime pas immédiatement la ligne sur le disque pour préserver les transactions concurrentes. VACUUM nettoie ces lignes mortes (dead tuples), évite le bloat (gonflement de la table) et met à jour les statistiques pour l\'optimiseur.',
    explanationEn: 'MVCC marks deleted/updated rows as dead. VACUUM reclaims their space and prevents table bloat.',
  },

  // 19. Concepts NoSQL - Relationnel vs Document / Key-Value
  {
    id: 'diag-19',
    number: 19,
    category: 'Concepts NoSQL',
    domainId: 'administration',
    subtopicId: 'schema_ddl',
    titleFr: 'Quel est l\'avantage architectural majeur d\'une base NoSQL orientée Document (ex: MongoDB / Firestore) par rapport à une base relationnelle normalisée ?',
    titleEn: 'What is the primary architectural advantage of a Document NoSQL database over a normalized relational schema?',
    optionsFr: [
      { id: 'a', text: 'L\'encapsulation de structures hiérarchiques complexes dans un seul document évitant les jointures coûteuses' },
      { id: 'b', text: 'L\'absence totale de disques durs physiques' },
      { id: 'c', text: 'L\'obligation stricte de respecter la 3ème forme normale' },
      { id: 'd', text: 'L\'interdiction de créer des index' },
    ],
    optionsEn: [
      { id: 'a', text: 'Embedding complex hierarchies in a single document avoiding expensive joins' },
      { id: 'b', text: 'No physical storage requirement' },
      { id: 'c', text: 'Strict compliance with 3NF' },
      { id: 'd', text: 'Prohibition of indexes' },
    ],
    correctOptionId: 'a',
    explanationFr: 'Les bases Document stockent les données sous forme de documents semi-structurés (JSON/BSON). En dénormalisant et imbriquant les données associées, on évite les jointures relationnelles lourdes lors de la lecture d\'une entité complète.',
    explanationEn: 'Document stores allow embedding sub-documents, enabling fast retrieval of aggregate roots without relational JOINs.',
  },

  // 20. Architecture & Théorème CAP
  {
    id: 'diag-20',
    number: 20,
    category: 'Concepts NoSQL',
    domainId: 'administration',
    subtopicId: 'acid_props',
    titleFr: 'Selon le théorème CAP appliqué aux bases de données distribuées, que doit choisir un système lors d\'une partition réseau (P) ?',
    titleEn: 'According to the CAP theorem in distributed databases, what trade-off must be made during a network partition (P)?',
    optionsFr: [
      { id: 'a', text: 'Choisir entre la Cohérence forte (C - Consistency) et la Disponibilité (A - Availability)' },
      { id: 'b', text: 'Choisir entre le protocole HTTP et le protocole TCP' },
      { id: 'c', text: 'Choisir entre les disques SSD et la mémoire vive' },
      { id: 'd', text: 'Le théorème CAP impose d\'avoir obligatoirement les trois propriétés simultanément' },
    ],
    optionsEn: [
      { id: 'a', text: 'Choose between strong Consistency (C) and Availability (A)' },
      { id: 'b', text: 'Choose between HTTP and TCP' },
      { id: 'c', text: 'Choose between SSD and RAM' },
      { id: 'd', text: 'CAP requires all three simultaneously' },
    ],
    correctOptionId: 'a',
    explanationFr: 'Le théorème de Brewer (CAP) démontre qu\'en présence d\'une rupture de communication réseau (Partition Tolerance), un système distribué ne peut garantir simultanément la cohérence stricte de tous les nœuds (Consistency) et la réponse garantie à chaque requête (Availability). On doit trancher entre CP ou AP.',
    explanationEn: 'Under network partitions, a distributed system must sacrifice either Consistency (yielding stale data) or Availability (rejecting writes/reads).',
  },
];
