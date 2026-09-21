import { AdaptiveLearningModule } from '../types';

export const adaptiveLearningModules: AdaptiveLearningModule[] = [
  // =========================================================================
  // MODULE 1 : JOINTURES SQL MULTI-TABLES (SQL JOIN MASTERY)
  // =========================================================================
  {
    id: 'sql-joins-mastery',
    titleFr: 'Maîtrise des Jointures SQL Multi-Tables',
    titleEn: 'SQL Multi-Table Joins Mastery',
    category: 'Requêtage Relationnel & Algèbre Relationnelle',
    shortDescriptionFr: 'Apprenez à combiner plusieurs tables sans jamais tomber dans les pièges de cardinalité, de perte de lignes NULL ou de fausses jointures externes.',
    shortDescriptionEn: 'Master multi-table joins without ever falling into traps of row loss, NULL elimination, or Cartesian explosions.',
    badgeName: 'SQL Join Architect',
    accentColor: '#38bdf8',
    subconcepts: [
      {
        id: 'inner_join',
        name: 'INNER JOIN',
        shortDescFr: 'Intersection stricte basée sur un prédicat d\'égalité ou d\'inégalité.',
        shortDescEn: 'Strict intersection based on equality or inequality predicates.'
      },
      {
        id: 'left_join',
        name: 'LEFT (OUTER) JOIN',
        shortDescFr: 'Conservation intégrale des lignes de la table gauche, complétées par NULL.',
        shortDescEn: 'Full retention of left table records, padded with NULL if no match.'
      },
      {
        id: 'on_vs_where',
        name: 'ON vs WHERE dans Outer Joins',
        shortDescFr: 'Le piège n°1 : filtrer la table droite dans WHERE transforme silencieusement le LEFT JOIN en INNER JOIN.',
        shortDescEn: 'Trap #1: filtering right table in WHERE silently turns LEFT JOIN into INNER JOIN.'
      },
      {
        id: 'right_join',
        name: 'RIGHT (OUTER) JOIN',
        shortDescFr: 'Conservation des lignes de la table droite (souvent réécrit en LEFT JOIN).',
        shortDescEn: 'Retention of right table rows (frequently rewritten as LEFT JOIN for readability).'
      },
      {
        id: 'full_outer_join',
        name: 'FULL OUTER JOIN',
        shortDescFr: 'Union préservatrice des deux tables avec des NULLs des deux côtés.',
        shortDescEn: 'Preserving rows from both tables, populating NULLs on either side.'
      },
      {
        id: 'cross_join',
        name: 'CROSS JOIN',
        shortDescFr: 'Produit cartésien complet (N × M lignes) et cas d\'usage valides.',
        shortDescEn: 'Full Cartesian product (N × M rows) and legitimate analytical use cases.'
      },
      {
        id: 'self_join',
        name: 'SELF JOIN & Hiérarchies',
        shortDescFr: 'Jointure d\'une table avec elle-même (ex: employé et son manager).',
        shortDescEn: 'Joining a table to itself using aliases (e.g. employee and manager).'
      }
    ],
    prerequisitesFr: [
      'Structure des tables et clés primaires/étrangères',
      'Valeur spéciale NULL et logique ternaire (TRUE, FALSE, UNKNOWN)',
      'Syntaxe ANSI SQL-92 standard'
    ],
    prerequisitesEn: [
      'Table structures and Primary / Foreign Keys',
      'The special NULL value and three-valued logic',
      'Standard ANSI SQL-92 syntax'
    ],
    initialQuestions: [
      {
        id: 'q-join-01',
        number: 1,
        subconceptId: 'inner_join',
        subconceptLabel: 'INNER JOIN',
        difficulty: 'easy',
        domain: 'Jointures ANSI',
        targetTimeSeconds: 45,
        promptFr: 'Soit la table CLIENTS (10 lignes, IDs 1 à 10) et COMMANDES (15 lignes, dont 12 avec un client_id existant et 3 avec client_id = NULL). Combien de lignes retournera un INNER JOIN sur client_id ?',
        promptEn: 'Given table CLIENTS (10 rows, IDs 1 to 10) and ORDERS (15 rows, 12 of which have a matching client_id and 3 have client_id = NULL). How many rows will an INNER JOIN on client_id return?',
        sqlCode: `SELECT c.nom, o.id_commande 
FROM clients c
INNER JOIN commandes o ON c.id_client = o.client_id;`,
        options: [
          {
            id: 'opt-1',
            label: 'A',
            textFr: '15 lignes (toutes les commandes sont affichées)',
            textEn: '15 rows (all orders are displayed)',
            isCorrect: false,
            explanationFr: 'Faux : INNER JOIN élimine les lignes qui n\'ont pas de correspondance ou dont la clé de jointure est NULL.',
            explanationEn: 'Incorrect: INNER JOIN excludes rows without matches or where the join key is NULL.'
          },
          {
            id: 'opt-2',
            label: 'B',
            textFr: '12 lignes',
            textEn: '12 rows',
            isCorrect: true,
            explanationFr: 'Exact : seules les 12 commandes ayant un client_id valide correspondant à un client_id de la table CLIENTS satisfont le prédicat c.id_client = o.client_id.',
            explanationEn: 'Correct: only the 12 orders with a matching non-NULL client_id satisfy the equality predicate.'
          },
          {
            id: 'opt-3',
            label: 'C',
            textFr: '150 lignes (produit cartésien)',
            textEn: '150 rows (Cartesian product)',
            isCorrect: false,
            explanationFr: 'Faux : c\'est le comportement d\'un CROSS JOIN sans prédicat ON.',
            explanationEn: 'Incorrect: that is the behavior of an unconstrained CROSS JOIN.'
          },
          {
            id: 'opt-4',
            label: 'D',
            textFr: '10 lignes (uniquement les clients)',
            textEn: '10 rows (only the clients)',
            isCorrect: false,
            explanationFr: 'Faux : plusieurs commandes peuvent appartenir au même client.',
            explanationEn: 'Incorrect: a single client can hold multiple orders.'
          }
        ],
        correctCount: 1
      },
      {
        id: 'q-join-02',
        number: 2,
        subconceptId: 'left_join',
        subconceptLabel: 'LEFT (OUTER) JOIN',
        difficulty: 'easy',
        domain: 'Jointures ANSI',
        targetTimeSeconds: 50,
        promptFr: 'Vous souhaitez lister TOUS les employés, y compris ceux qui ne sont affectés à AUCUN département. Quelle jointure devez-vous utiliser avec EMPLOYEES en table de gauche ?',
        promptEn: 'You want to list ALL employees, including those who are assigned to NO department. Which join must you use with EMPLOYEES as the left table?',
        sqlCode: `SELECT e.first_name, e.last_name, d.department_name
FROM employees e
____ departments d ON e.department_id = d.department_id;`,
        options: [
          {
            id: 'opt-1',
            label: 'A',
            textFr: 'INNER JOIN',
            textEn: 'INNER JOIN',
            isCorrect: false,
            explanationFr: 'Faux : INNER JOIN supprimerait les employés ayant department_id = NULL.',
            explanationEn: 'Incorrect: INNER JOIN would eliminate employees with department_id = NULL.'
          },
          {
            id: 'opt-2',
            label: 'B',
            textFr: 'LEFT OUTER JOIN',
            textEn: 'LEFT OUTER JOIN',
            isCorrect: true,
            explanationFr: 'Exact : LEFT JOIN conserve 100% des lignes de la table de gauche (EMPLOYEES). Si un employé n\'a pas de département, department_name vaudra NULL.',
            explanationEn: 'Correct: LEFT JOIN keeps 100% of rows from the left table. If an employee has no department, department_name is filled with NULL.'
          },
          {
            id: 'opt-3',
            label: 'C',
            textFr: 'RIGHT OUTER JOIN',
            textEn: 'RIGHT OUTER JOIN',
            isCorrect: false,
            explanationFr: 'Faux : cela conserverait tous les départements même sans employés.',
            explanationEn: 'Incorrect: this would preserve all departments, not employees.'
          },
          {
            id: 'opt-4',
            label: 'D',
            textFr: 'CROSS JOIN',
            textEn: 'CROSS JOIN',
            isCorrect: false,
            explanationFr: 'Faux : cela associerait chaque employé à tous les départements.',
            explanationEn: 'Incorrect: this produces an unconstrained Cartesian product.'
          }
        ],
        correctCount: 1
      },
      {
        id: 'q-join-03',
        number: 3,
        subconceptId: 'on_vs_where',
        subconceptLabel: 'ON vs WHERE dans Outer Joins',
        difficulty: 'medium',
        domain: 'Pièges d\'exécution SQL',
        targetTimeSeconds: 65,
        promptFr: 'Examinez cette requête censée afficher tous les clients et le détail de leurs commandes payées. Quel est le piège majeur de cette écriture ?',
        promptEn: 'Inspect this query intended to display all clients and details of their paid orders. What is the major flaw in this statement?',
        sqlCode: `SELECT c.client_id, c.nom, o.numero, o.statut
FROM clients c
LEFT JOIN commandes o ON c.client_id = o.client_id
WHERE o.statut = 'PAYEE';`,
        options: [
          {
            id: 'opt-1',
            label: 'A',
            textFr: 'La requête génère une erreur ORA-00918: column ambiguously defined.',
            textEn: 'The query throws ORA-00918: column ambiguously defined.',
            isCorrect: false,
            explanationFr: 'Faux : les colonnes sont convenablement préfixées par les alias.',
            explanationEn: 'Incorrect: column aliases are properly specified.'
          },
          {
            id: 'opt-2',
            label: 'B',
            textFr: 'La clause WHERE o.statut = \'PAYEE\' élimine les clients sans commande car pour eux o.statut vaut NULL (et NULL = \'PAYEE\' s\'évalue à UNKNOWN). Le LEFT JOIN se comporte donc comme un INNER JOIN.',
            textEn: 'The WHERE o.statut = \'PAYEE\' condition eliminates clients without orders because o.statut is NULL (and NULL = \'PAYEE\' evaluates to UNKNOWN). The LEFT JOIN silently collapses into an INNER JOIN.',
            isCorrect: true,
            explanationFr: 'Exact ! C\'est le piège d\'examen classique. Tout filtre dans le WHERE portant sur la table droite d\'un LEFT JOIN annule la préservation des lignes de gauche, sauf si on écrit (o.statut = \'PAYEE\' OR o.statut IS NULL) ou si on déplace la condition dans le ON.',
            explanationEn: 'Correct! This is a legendary SQL trap. Any WHERE condition on the preserved outer table eliminates the NULL-padded rows.'
          },
          {
            id: 'opt-3',
            label: 'C',
            textFr: 'Il est interdit en standard ANSI de combiner une clause LEFT JOIN avec une clause WHERE.',
            textEn: 'It is illegal in standard ANSI to combine a LEFT JOIN with a WHERE clause.',
            isCorrect: false,
            explanationFr: 'Faux : WHERE est parfaitement valide avec un LEFT JOIN, mais il ne faut pas filtrer la table facultative sans précaution.',
            explanationEn: 'Incorrect: WHERE is fully allowed after a LEFT JOIN.'
          },
          {
            id: 'opt-4',
            label: 'D',
            textFr: 'La clause ON doit obligatoirement comporter deux conditions d\'égalité.',
            textEn: 'The ON clause must strictly contain two equality predicates.',
            isCorrect: false,
            explanationFr: 'Faux : une seule condition d\'égalité suffit.',
            explanationEn: 'Incorrect: a single predicate is perfectly sufficient.'
          }
        ],
        correctCount: 1
      },
      {
        id: 'q-join-04',
        number: 4,
        subconceptId: 'on_vs_where',
        subconceptLabel: 'ON vs WHERE dans Outer Joins',
        difficulty: 'medium',
        domain: 'Jointures ANSI',
        targetTimeSeconds: 60,
        promptFr: 'Pour corriger la requête précédente et préserver TOUS les clients (même ceux sans commande ou avec des commandes non payées), où faut-il placer la condition sur o.statut ?',
        promptEn: 'To correct the previous query and preserve ALL customers (even those with no orders or unpaid orders), where should the condition on o.statut be placed?',
        sqlCode: `SELECT c.client_id, c.nom, o.numero, o.statut
FROM clients c
LEFT JOIN commandes o 
  ON c.client_id = o.client_id AND o.statut = 'PAYEE';`,
        options: [
          {
            id: 'opt-1',
            label: 'A',
            textFr: 'Directement dans la clause ON du LEFT JOIN (comme dans le code ci-dessus).',
            textEn: 'Directly inside the ON clause of the LEFT JOIN (as shown above).',
            isCorrect: true,
            explanationFr: 'Exact : dans le ON, la condition filtre les lignes de la table droite AVANT la jointure. Les clients sans commande payée apparaissent quand même, avec numero = NULL et statut = NULL.',
            explanationEn: 'Correct: placing it in ON filters matching right-table rows before the outer join, retaining all left records.'
          },
          {
            id: 'opt-2',
            label: 'B',
            textFr: 'Dans une clause HAVING après un GROUP BY obligatoire.',
            textEn: 'In a HAVING clause after mandatory GROUP BY.',
            isCorrect: false,
            explanationFr: 'Faux : HAVING sert à filtrer après agrégation, ce qui n\'est pas requis ici.',
            explanationEn: 'Incorrect: HAVING filters aggregated groups, not needed here.'
          },
          {
            id: 'opt-3',
            label: 'C',
            textFr: 'Dans une clause QUALIFY.',
            textEn: 'Inside a QUALIFY clause.',
            isCorrect: false,
            explanationFr: 'Faux : QUALIFY filtre les fonctions de fenêtrage (Window functions).',
            explanationEn: 'Incorrect: QUALIFY filters window functions.'
          },
          {
            id: 'opt-4',
            label: 'D',
            textFr: 'Ce n\'est pas possible en une seule requête, il faut obligatoirement une table temporaire.',
            textEn: 'It is impossible in a single query; a temporary table is mandatory.',
            isCorrect: false,
            explanationFr: 'Faux : déplacer le prédicat dans le ON résout parfaitement le problème.',
            explanationEn: 'Incorrect: placing the predicate into the ON clause completely solves this.'
          }
        ],
        correctCount: 1
      },
      {
        id: 'q-join-05',
        number: 5,
        subconceptId: 'left_join',
        subconceptLabel: 'LEFT (OUTER) JOIN',
        difficulty: 'medium',
        domain: 'Anti-Jointure (Anti-Join)',
        targetTimeSeconds: 55,
        promptFr: 'Quel idiome SQL permet d\'identifier les clients qui n\'ont JAMAIS passé aucune commande (technique de l\'Anti-Join) ?',
        promptEn: 'Which SQL idiom identifies customers who have NEVER placed any order (Anti-Join technique)?',
        sqlCode: `SELECT c.client_id, c.nom
FROM clients c
LEFT JOIN commandes o ON c.client_id = o.client_id
WHERE ________ ;`,
        options: [
          {
            id: 'opt-1',
            label: 'A',
            textFr: 'o.client_id IS NULL',
            textEn: 'o.client_id IS NULL',
            isCorrect: true,
            explanationFr: 'Exact : si le client n\'a aucune commande, le LEFT JOIN génère des valeurs NULL pour toutes les colonnes de commandes. Le test o.client_id IS NULL isole exactement ces cas (Anti-Join).',
            explanationEn: 'Correct: when a client has no order, the LEFT JOIN populates all order columns with NULL. o.client_id IS NULL filters exactly those non-matching clients.'
          },
          {
            id: 'opt-2',
            label: 'B',
            textFr: 'o.client_id = NULL',
            textEn: 'o.client_id = NULL',
            isCorrect: false,
            explanationFr: 'Piège ! En SQL, = NULL s\'évalue toujours à UNKNOWN (faux en clause WHERE). On doit impérativement utiliser l\'opérateur IS NULL.',
            explanationEn: 'Trap! In SQL, = NULL evaluates to UNKNOWN. You must strictly use IS NULL.'
          },
          {
            id: 'opt-3',
            label: 'C',
            textFr: 'COUNT(o.id_commande) = 0',
            textEn: 'COUNT(o.id_commande) = 0',
            isCorrect: false,
            explanationFr: 'Faux : une fonction d\'agrégation comme COUNT ne peut pas être utilisée directement dans WHERE sans GROUP BY et HAVING.',
            explanationEn: 'Incorrect: aggregation functions cannot be put into WHERE.'
          },
          {
            id: 'opt-4',
            label: 'D',
            textFr: 'o.client_id != c.client_id',
            textEn: 'o.client_id != c.client_id',
            isCorrect: false,
            explanationFr: 'Faux : si o.client_id est NULL, la comparaison avec != donne UNKNOWN.',
            explanationEn: 'Incorrect: comparing NULL with != evaluates to UNKNOWN.'
          }
        ],
        correctCount: 1
      },
      {
        id: 'q-join-06',
        number: 6,
        subconceptId: 'full_outer_join',
        subconceptLabel: 'FULL OUTER JOIN',
        difficulty: 'medium',
        domain: 'Jointures ANSI',
        targetTimeSeconds: 60,
        promptFr: 'Considérez la table PROJETS (10 projets, dont 2 sans responsable) et EMPLOYES (50 employés, dont 42 non affectés à des projets). Que produit un FULL OUTER JOIN ?',
        promptEn: 'Consider PROJECTS (10 projects, 2 without manager) and EMPLOYEES (50 employees, 42 not assigned to projects). What does a FULL OUTER JOIN produce?',
        sqlCode: `SELECT p.nom_projet, e.nom
FROM projets p
FULL OUTER JOIN employes e ON p.responsable_id = e.id_emp;`,
        options: [
          {
            id: 'opt-1',
            label: 'A',
            textFr: 'Tous les projets appariés, PLUS les 2 projets sans responsable (avec e.nom = NULL), PLUS les 42 employés non responsables (avec p.nom_projet = NULL).',
            textEn: 'All matched projects, PLUS the 2 manager-less projects (with e.nom = NULL), PLUS the 42 unassigned employees (with p.nom_projet = NULL).',
            isCorrect: true,
            explanationFr: 'Exact : FULL OUTER JOIN réunit les résultats d\'un LEFT JOIN et d\'un RIGHT JOIN sans doublon, conservant les lignes orphelines des deux côtés.',
            explanationEn: 'Correct: FULL OUTER JOIN combines LEFT and RIGHT join results, preserving unmatched rows from both tables.'
          },
          {
            id: 'opt-2',
            label: 'B',
            textFr: 'Seulement les 8 projets qui possèdent un responsable.',
            textEn: 'Only the 8 projects that have a manager.',
            isCorrect: false,
            explanationFr: 'Faux : ceci est le résultat d\'un INNER JOIN.',
            explanationEn: 'Incorrect: that is the behavior of an INNER JOIN.'
          },
          {
            id: 'opt-3',
            label: 'C',
            textFr: '500 lignes (10 × 50).',
            textEn: '500 rows (10 × 50).',
            isCorrect: false,
            explanationFr: 'Faux : c\'est le CROSS JOIN.',
            explanationEn: 'Incorrect: that would be a CROSS JOIN.'
          },
          {
            id: 'opt-4',
            label: 'D',
            textFr: 'Une erreur de syntaxe car MySQL supporte nativement FULL OUTER JOIN.',
            textEn: 'A syntax error because MySQL natively supports FULL OUTER JOIN.',
            isCorrect: false,
            explanationFr: 'En standard ANSI SQL (et en Oracle/PostgreSQL/SQL Server), FULL OUTER JOIN est standard. (Note : MySQL nécessite l\'émulation via UNION de LEFT et RIGHT JOIN).',
            explanationEn: 'In ANSI SQL, FULL OUTER JOIN is standard syntax.'
          }
        ],
        correctCount: 1
      },
      {
        id: 'q-join-07',
        number: 7,
        subconceptId: 'cross_join',
        subconceptLabel: 'CROSS JOIN',
        difficulty: 'easy',
        domain: 'Produit Cartésien',
        targetTimeSeconds: 40,
        promptFr: 'Une table COULEURS contient 4 lignes (Rouge, Vert, Bleu, Jaune) et une table TAILLES contient 3 lignes (S, M, L). Quelle instruction permet de générer toutes les 12 combinaisons possibles de produits ?',
        promptEn: 'Table COLORS has 4 rows (Red, Green, Blue, Yellow) and SIZES has 3 rows (S, M, L). Which query generates all 12 product combinations?',
        sqlCode: `SELECT c.nom_couleur, t.nom_taille
FROM couleurs c
________ tailles t;`,
        options: [
          {
            id: 'opt-1',
            label: 'A',
            textFr: 'CROSS JOIN (sans condition ON)',
            textEn: 'CROSS JOIN (without ON clause)',
            isCorrect: true,
            explanationFr: 'Exact : CROSS JOIN effectue le produit cartésien complet (4 × 3 = 12 combinaisons).',
            explanationEn: 'Correct: CROSS JOIN produces the full Cartesian product (4 × 3 = 12 rows).'
          },
          {
            id: 'opt-2',
            label: 'B',
            textFr: 'INNER JOIN ON c.nom_couleur = t.nom_taille',
            textEn: 'INNER JOIN ON c.nom_couleur = t.nom_taille',
            isCorrect: false,
            explanationFr: 'Faux : une couleur n\'est jamais égale à une taille, le résultat contiendrait 0 ligne !',
            explanationEn: 'Incorrect: colors and sizes do not match values; this returns 0 rows.'
          },
          {
            id: 'opt-3',
            label: 'C',
            textFr: 'NATURAL JOIN',
            textEn: 'NATURAL JOIN',
            isCorrect: false,
            explanationFr: 'Faux : NATURAL JOIN cherche des colonnes de même nom.',
            explanationEn: 'Incorrect: NATURAL JOIN matches identically named columns.'
          },
          {
            id: 'opt-4',
            label: 'D',
            textFr: 'UNION ALL',
            textEn: 'UNION ALL',
            isCorrect: false,
            explanationFr: 'Faux : UNION empile les lignes (4 + 3 = 7 lignes), il ne combine pas les colonnes.',
            explanationEn: 'Incorrect: UNION appends rows, resulting in 7 rows.'
          }
        ],
        correctCount: 1
      },
      {
        id: 'q-join-08',
        number: 8,
        subconceptId: 'self_join',
        subconceptLabel: 'SELF JOIN & Hiérarchies',
        difficulty: 'medium',
        domain: 'Auto-jointures',
        targetTimeSeconds: 65,
        promptFr: 'Dans la table EMPLOYES (id_emp, nom, manager_id), le président de l\'entreprise n\'a aucun manager (manager_id IS NULL). Pour lister chaque employé avec le nom de son manager SANS exclure le président, quelle jointure faire ?',
        promptEn: 'In EMPLOYEES (id_emp, name, manager_id), the CEO has no manager (manager_id IS NULL). To display each employee with their manager\'s name WITHOUT omitting the CEO, which join is required?',
        sqlCode: `SELECT e.nom AS employe, m.nom AS manager
FROM employes e
____ employes m ON e.manager_id = m.id_emp;`,
        options: [
          {
            id: 'opt-1',
            label: 'A',
            textFr: 'INNER JOIN',
            textEn: 'INNER JOIN',
            isCorrect: false,
            explanationFr: 'Faux : le président (manager_id = NULL) serait exclu du résultat !',
            explanationEn: 'Incorrect: the CEO would be filtered out because manager_id is NULL.'
          },
          {
            id: 'opt-2',
            label: 'B',
            textFr: 'LEFT JOIN',
            textEn: 'LEFT JOIN',
            isCorrect: true,
            explanationFr: 'Exact : avec LEFT JOIN, tous les employés \'e\' sont conservés. Pour le président, m.nom sera simplement évalué à NULL.',
            explanationEn: 'Correct: LEFT JOIN retains all employees \'e\'. For the CEO, m.nom evaluates cleanly to NULL.'
          },
          {
            id: 'opt-3',
            label: 'C',
            textFr: 'CROSS JOIN',
            textEn: 'CROSS JOIN',
            isCorrect: false,
            explanationFr: 'Faux : cela associerait chaque employé à tous les autres employés sans lien hiérarchique.',
            explanationEn: 'Incorrect: that pairs every employee with everyone without hierarchy.'
          },
          {
            id: 'opt-4',
            label: 'D',
            textFr: 'RIGHT JOIN',
            textEn: 'RIGHT JOIN',
            isCorrect: false,
            explanationFr: 'Faux : cela conserverait tous les managers, même ceux qui n\'encadrent personne, mais exclurait le président.',
            explanationEn: 'Incorrect: this retains managers but drops the CEO.'
          }
        ],
        correctCount: 1
      },
      {
        id: 'q-join-09',
        number: 9,
        subconceptId: 'right_join',
        subconceptLabel: 'RIGHT (OUTER) JOIN',
        difficulty: 'easy',
        domain: 'Jointures ANSI',
        targetTimeSeconds: 45,
        promptFr: 'Quelle requête est rigoureusement sémantiquement équivalente à :\nSELECT * FROM A RIGHT JOIN B ON A.id = B.a_id ?',
        promptEn: 'Which query is strictly semantically equivalent to:\nSELECT * FROM A RIGHT JOIN B ON A.id = B.a_id ?',
        options: [
          {
            id: 'opt-1',
            label: 'A',
            textFr: 'SELECT * FROM B LEFT JOIN A ON A.id = B.a_id',
            textEn: 'SELECT * FROM B LEFT JOIN A ON A.id = B.a_id',
            isCorrect: true,
            explanationFr: 'Exact : inverser l\'ordre des tables de A RIGHT JOIN B à B LEFT JOIN A produit exactement le même ensemble de données.',
            explanationEn: 'Correct: inverting table order from A RIGHT JOIN B to B LEFT JOIN A yields the exact same preserved tuples.'
          },
          {
            id: 'opt-2',
            label: 'B',
            textFr: 'SELECT * FROM A LEFT JOIN B ON A.id = B.a_id',
            textEn: 'SELECT * FROM A LEFT JOIN B ON A.id = B.a_id',
            isCorrect: false,
            explanationFr: 'Faux : cela préserverait les lignes de A au lieu de B.',
            explanationEn: 'Incorrect: this preserves A instead of B.'
          },
          {
            id: 'opt-3',
            label: 'C',
            textFr: 'SELECT * FROM A INNER JOIN B ON A.id = B.a_id',
            textEn: 'SELECT * FROM A INNER JOIN B ON A.id = B.a_id',
            isCorrect: false,
            explanationFr: 'Faux : INNER JOIN ne préserve pas les lignes non appariées.',
            explanationEn: 'Incorrect: INNER JOIN excludes unmatched rows.'
          },
          {
            id: 'opt-4',
            label: 'D',
            textFr: 'SELECT * FROM A FULL JOIN B ON A.id = B.a_id',
            textEn: 'SELECT * FROM A FULL JOIN B ON A.id = B.a_id',
            isCorrect: false,
            explanationFr: 'Faux : FULL JOIN préserve les deux côtés.',
            explanationEn: 'Incorrect: FULL JOIN preserves both sides.'
          }
        ],
        correctCount: 1
      },
      {
        id: 'q-join-10',
        number: 10,
        subconceptId: 'on_vs_where',
        subconceptLabel: 'ON vs WHERE dans Outer Joins',
        difficulty: 'hard',
        domain: 'Performance & Algèbre Relationnelle',
        targetTimeSeconds: 75,
        promptFr: 'Soit la requête suivante. Pourquoi le plan d\'exécution transforme-t-il cette jointure en INNER JOIN ?',
        promptEn: 'Given the following query. Why does the optimizer transform this into an INNER JOIN under the hood?',
        sqlCode: `SELECT c.client_id, c.ville, f.total_ttc
FROM clients c
LEFT JOIN factures f ON c.client_id = f.client_id
WHERE f.total_ttc > 1000;`,
        options: [
          {
            id: 'opt-1',
            label: 'A',
            textFr: 'Car le prédicat f.total_ttc > 1000 est "null-intolérant" (null-rejecting) : pour toute ligne orpheline de clients, f.total_ttc vaut NULL, et NULL > 1000 s\'évalue à UNKNOWN. L\'optimiseur simplifie donc le LEFT JOIN en INNER JOIN (Outer Join Elimination).',
            textEn: 'Because f.total_ttc > 1000 is "null-rejecting": for orphan client rows, f.total_ttc is NULL, and NULL > 1000 evaluates to UNKNOWN. The query planner simplifies the LEFT JOIN into an INNER JOIN (Outer Join Elimination).',
            isCorrect: true,
            explanationFr: 'Exactement ! Le concept de "Null-Rejecting Predicate" est une règle fondamentale d\'optimisation SQL. Tout filtre sur la table droite qui rejette NULL permet au moteur de convertir le LEFT JOIN en INNER JOIN, changeant radicalement les résultats.',
            explanationEn: 'Spot on! A null-rejecting predicate on the right table permits the engine to convert the outer join into an inner join.'
          },
          {
            id: 'opt-2',
            label: 'B',
            textFr: 'Car la colonne total_ttc possède obligatoirement un index B-Tree.',
            textEn: 'Because total_ttc must possess a B-Tree index.',
            isCorrect: false,
            explanationFr: 'Faux : la présence ou l\'absence d\'index ne change pas la sémantique de la jointure.',
            explanationEn: 'Incorrect: index presence does not alter algebraic semantics.'
          },
          {
            id: 'opt-3',
            label: 'C',
            textFr: 'Car la clause ON ne spécifie pas de type de jointure HASH JOIN.',
            textEn: 'Because the ON clause omits a HASH JOIN hint.',
            isCorrect: false,
            explanationFr: 'Faux : les hints de jointure n\'affectent pas l\'intégrité des prédicats.',
            explanationEn: 'Incorrect: hints do not modify algebraic null rejection.'
          },
          {
            id: 'opt-4',
            label: 'D',
            textFr: 'Il s\'agit d\'un bogue du moteur SQL, le résultat reste un LEFT JOIN.',
            textEn: 'It is a database engine bug; the result stays a LEFT JOIN.',
            isCorrect: false,
            explanationFr: 'Faux : c\'est le comportement mathématique standard de la logique ternaire SQL.',
            explanationEn: 'Incorrect: this is the standard mathematical behavior of three-valued SQL logic.'
          }
        ],
        correctCount: 1
      }
    ],

    // MINI-COURS CIBLÉS POUR CHAQUE SOUS-NOTION
    miniCourses: {
      left_join: {
        subconceptId: 'left_join',
        subconceptLabel: 'LEFT (OUTER) JOIN & Préservation des Lignes',
        titleFr: 'Mini-Cours : Le Fonctionnement Garanti du LEFT JOIN',
        titleEn: 'Mini-Course: Guaranteed Mechanics of LEFT JOIN',
        subtitleFr: 'Comprendre pourquoi et comment la table gauche ne perd jamais la moindre ligne.',
        subtitleEn: 'Understand why and how the left table never drops a single record.',
        diagnosisSummaryFr: 'Vos réponses ou hésitations révèlent une confusion sur la conservation des lignes orphelines et l\'apparition des marqueurs NULL.',
        diagnosisSummaryEn: 'Your responses reveal uncertainty regarding orphan row preservation and NULL population.',
        keyRuleFr: 'Dans un A LEFT JOIN B, la table A (gauche) est le "maître" : 100% de ses lignes sont conservées. Si aucune ligne correspondante n\'existe dans B, les colonnes de B sont remplies avec des NULLs.',
        keyRuleEn: 'In A LEFT JOIN B, table A (left) is the master: 100% of its rows are kept. If no match exists in B, columns from B are padded with NULL.',
        visualDiagram: {
          titleFr: 'Schéma Conceptuel : Matrice de Fusion LEFT JOIN',
          titleEn: 'Conceptual Diagram: LEFT JOIN Merge Matrix',
          asciiIllustration: `
TABLE A (Clients)              TABLE B (Commandes)
+----+---------+               +--------+-----------+-------+
| ID | Nom     |               | Cmd_ID | Client_ID | Total |
+----+---------+               +--------+-----------+-------+
| 1  | Alice   | <--- match -> | 101    | 1         | 80€   |
| 2  | Bob     | <--- match -> | 102    | 2         | 120€  |
| 3  | Charlie | <- no match!  | (aucun)| (aucun)   | (aucun)|
+----+---------+               +--------+-----------+-------+
                       |
                       V  RÉSULTAT DU LEFT JOIN :
+---------+-----------+----------------+
| A.Nom   | B.Cmd_ID  | B.Total        |
+---------+-----------+----------------+
| Alice   | 101       | 80€            |
| Bob     | 102       | 120€           |
| Charlie | NULL      | NULL   <======= Charlie est CONSERVÉ !
+---------+-----------+----------------+`,
          legendFr: 'Notez que Charlie reste dans le résultat final, ses attributs de commande sont NULL.',
          legendEn: 'Notice Charlie remains in the final output, his order attributes are NULL.'
        },
        trapSnippet: {
          titleFr: 'Erreur Fréquente vs Bonne Pratique',
          titleEn: 'Frequent Pitfall vs Best Practice',
          wrongCode: `-- ERREUR : Oublier de traiter les NULLs lors d'une concaténation
SELECT c.nom || ' a commandé pour ' || o.total AS resume
FROM clients c
LEFT JOIN commandes o ON c.id = o.client_id;
-- Résultat pour Charlie : NULL ! (car en SQL standard, 'texte' || NULL donne NULL)`,
          wrongWhyFr: 'En SQL standard (hors MySQL CONCAT_WS), toute opération arithmétique ou de chaîne avec NULL donne NULL. Charlie disparaîtrait du résumé !',
          wrongWhyEn: 'In standard SQL, any arithmetic or concatenation with NULL produces NULL. Charlie completely disappears!',
          correctCode: `-- BONNE PRATIQUE : Sécuriser avec COALESCE ou NVL
SELECT c.nom || ' a commandé pour ' || COALESCE(TO_CHAR(o.total), '0€ (aucune commande)') AS resume
FROM clients c
LEFT JOIN commandes o ON c.id = o.client_id;`,
          correctWhyFr: 'COALESCE intercepte le NULL et fournit une valeur de substitution claire.',
          correctWhyEn: 'COALESCE intercepts the NULL and provides a clean fallback representation.'
        },
        goldenRules: [
          {
            ruleFr: 'Règle d\'or 1 : Le nombre de lignes retournées par un LEFT JOIN est TOUJOURS supérieur ou égal au nombre de lignes de la table de gauche (sauf si une ligne gauche correspond à plusieurs lignes droites, ce qui multiplie les lignes).',
            ruleEn: 'Golden Rule 1: Rows returned by LEFT JOIN is ALWAYS >= count(left_table) (unless 1:N matches cause duplication).'
          },
          {
            ruleFr: 'Règle d\'or 2 : Pour trouver les éléments sans correspondance (Anti-Join), filtrez dans WHERE sur la clé primaire droite avec IS NULL.',
            ruleEn: 'Golden Rule 2: To find non-matching records (Anti-Join), test the right table primary key with IS NULL.'
          }
        ]
      },

      on_vs_where: {
        subconceptId: 'on_vs_where',
        subconceptLabel: 'ON vs WHERE dans Outer Joins',
        titleFr: 'Mini-Cours : L\'Impact Fondamental du ON vs WHERE',
        titleEn: 'Mini-Course: The Fundamental Impact of ON vs WHERE',
        subtitleFr: 'Pourquoi filtrer dans WHERE annule silencieusement votre LEFT JOIN.',
        subtitleEn: 'Why filtering in WHERE silently destroys your LEFT JOIN.',
        diagnosisSummaryFr: 'Vous avez été piégé par l\'évaluation logique des prédicats. Placer une condition de filtrage sur la table droite dans WHERE élimine les lignes orphelines (transformant le LEFT JOIN en INNER JOIN).',
        diagnosisSummaryEn: 'You got caught by logical predicate evaluation. Putting a right-table filter into WHERE eliminates orphan rows, demoting LEFT JOIN to INNER JOIN.',
        keyRuleFr: 'Dans un LEFT JOIN : la clause ON décide quelles lignes sont appariées. La clause WHERE filtre l\'ensemble du résultat APRES l\'appariement. Tout prédicat dans WHERE rejetant NULL transforme le LEFT JOIN en INNER JOIN !',
        keyRuleEn: 'In a LEFT JOIN: ON controls which rows get paired. WHERE filters the entire dataset AFTER matching. Any null-rejecting predicate in WHERE converts LEFT JOIN into INNER JOIN!',
        visualDiagram: {
          titleFr: 'Comparatif du Flux d\'Exécution Logique',
          titleEn: 'Logical Evaluation Flow Comparison',
          asciiIllustration: `
CAS A : Condition dans le ON
-----------------------------
FROM clients c
LEFT JOIN commandes o ON c.id = o.client_id AND o.statut = 'PAYEE'
  -> 1. Filtre commandes payées
  -> 2. Tente d'apparier
  -> 3. SI pas de match, GARDE le client avec NULL
=> TOUS les clients sont présents !

CAS B : Condition dans le WHERE
-----------------------------
FROM clients c
LEFT JOIN commandes o ON c.id = o.client_id
WHERE o.statut = 'PAYEE'
  -> 1. LEFT JOIN produit les lignes (dont Charlie avec o.statut = NULL)
  -> 2. WHERE évalue : NULL = 'PAYEE' -> UNKNOWN (rejeté !)
=> Charlie est ÉLIMINÉ ! Le LEFT JOIN est détruit.`,
          legendFr: 'Le WHERE élimine systématiquement les NULL créés par le LEFT JOIN !',
          legendEn: 'WHERE systematically eliminates NULL values synthesized by the LEFT JOIN!'
        },
        trapSnippet: {
          titleFr: 'Le Piège Subtil du Filtre Temporel',
          titleEn: 'The Subtle Date Filter Trap',
          wrongCode: `-- FAUX : On veut tous les départements et leurs embauches de 2024
SELECT d.dept_name, e.first_name, e.hire_date
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
WHERE e.hire_date >= DATE '2024-01-01';
-- Conséquence : Les départements sans embauches en 2024 DISPARAISSENT !`,
          wrongWhyFr: 'Comme e.hire_date est NULL pour les départements sans embauche, WHERE e.hire_date >= ... les supprime tous.',
          wrongWhyEn: 'Because e.hire_date is NULL for departments without new hires, the WHERE clause filters them out.',
          correctCode: `-- EXACT : Déplacer le filtre dans la clause ON
SELECT d.dept_name, e.first_name, e.hire_date
FROM departments d
LEFT JOIN employees e 
  ON d.dept_id = e.dept_id 
  AND e.hire_date >= DATE '2024-01-01';
-- Conséquence : TOUS les départements restent présents dans le résultat !`,
          correctWhyFr: 'Le filtre s\'applique à la jonction. Les départements sans embauche récente affichent e.hire_date = NULL.',
          correctWhyEn: 'Filter applies during matching. Departments without recent hires display NULL but remain present.'
        },
        goldenRules: [
          {
            ruleFr: 'Règle d\'or : Si la condition concerne la table de droite et qu\'on veut préserver la table de gauche -> Mettre la condition dans le ON.',
            ruleEn: 'Golden Rule: If the filter targets the right table and you want to keep the left table -> Put the filter in ON.'
          },
          {
            ruleFr: 'Exception volontaire : On met une condition dans WHERE uniquement pour faire un Anti-Join (ex: WHERE o.id IS NULL).',
            ruleEn: 'Intentional Exception: Put a right-table check in WHERE only when deliberately writing an Anti-Join (e.g. WHERE o.id IS NULL).'
          }
        ]
      },

      inner_join: {
        subconceptId: 'inner_join',
        subconceptLabel: 'INNER JOIN & Prédicats d\'intersection',
        titleFr: 'Mini-Cours : Rigueur Mathématique de l\'INNER JOIN',
        titleEn: 'Mini-Course: Mathematical Rigor of INNER JOIN',
        subtitleFr: 'Comment l\'égalité stricte et les NULLs interagissent.',
        subtitleEn: 'How strict equality and NULL values interact.',
        diagnosisSummaryFr: 'Des erreurs sur l\'INNER JOIN montrent une hésitation sur le comportement face aux clés NULL ou aux jointures multi-critères.',
        diagnosisSummaryEn: 'INNER JOIN errors demonstrate hesitation regarding NULL keys or multi-column predicates.',
        keyRuleFr: 'INNER JOIN ne retourne une ligne QUE si le prédicat ON s\'évalue à TRUE. Si l\'une des clés est NULL, NULL = NULL s\'évalue à UNKNOWN (FALSE dans la jointure), donc la ligne est exclue.',
        keyRuleEn: 'INNER JOIN only returns a row if the ON predicate evaluates to TRUE. If any key is NULL, NULL = NULL is UNKNOWN, and the row is dropped.',
        trapSnippet: {
          titleFr: 'Le Piège du NULL = NULL dans un INNER JOIN',
          titleEn: 'The NULL = NULL Trap in INNER JOIN',
          wrongCode: `-- Deux employés ont manager_id = NULL
SELECT e.nom, m.nom
FROM employes e
INNER JOIN employes m ON e.manager_id = m.manager_id;`,
          wrongWhyFr: 'On pourrait penser que deux employés sans manager s\'apparient. En SQL, NULL = NULL n\'est jamais vrai !',
          wrongWhyEn: 'One might think two NULLs match each other. In SQL, NULL = NULL is never TRUE!',
          correctCode: `-- Si l'on souhaite autoriser la correspondance entre NULLs (rare) :
SELECT e.nom, m.nom
FROM employes e
INNER JOIN employes m 
  ON e.manager_id = m.manager_id 
  OR (e.manager_id IS NULL AND m.manager_id IS NULL);`,
          correctWhyFr: 'Expliciter la condition IS NULL permet d\'inclure les valeurs indéterminées.',
          correctWhyEn: 'Explicitly checking IS NULL handles undetermined values safely.'
        },
        goldenRules: [
          {
            ruleFr: 'Règle d\'or : Toujours indexer les colonnes étrangères utilisées dans la clause ON pour éviter les Full Table Scans coûteux.',
            ruleEn: 'Golden Rule: Always index foreign key columns used in the ON clause to prevent costly Full Table Scans.'
          }
        ]
      },

      cross_join: {
        subconceptId: 'cross_join',
        subconceptLabel: 'CROSS JOIN & Risques de Cardinalité',
        titleFr: 'Mini-Cours : Le Produit Cartésien Contrôlé',
        titleEn: 'Mini-Course: Controlled Cartesian Products',
        subtitleFr: 'Quand utiliser CROSS JOIN et comment éviter l\'explosion mémoire.',
        subtitleEn: 'When to use CROSS JOIN and how to prevent memory explosions.',
        diagnosisSummaryFr: 'Une hésitation sur le CROSS JOIN a été repérée. Attention aux jointures accidentelles par virgule sans clause WHERE.',
        diagnosisSummaryEn: 'Hesitation on CROSS JOIN detected. Beware of implicit comma-joins lacking WHERE filters.',
        keyRuleFr: 'CROSS JOIN génère le produit cartésien strict : N lignes × M lignes. Très utile pour des matrices de combinaisons (tailles × couleurs, calendrier de dates × magasins).',
        keyRuleEn: 'CROSS JOIN generates strict Cartesian product: N rows × M rows. Excellent for dimensional matrices.',
        trapSnippet: {
          titleFr: 'L\'ancienne syntaxe virgule oubliée',
          titleEn: 'The Forgotten Comma Join Trap',
          wrongCode: `SELECT * FROM table1, table2; -- Oubli de WHERE t1.id = t2.t1_id !
-- Si table1 a 100 000 lignes et table2 a 100 000 lignes :
-- Résultat = 10 000 000 000 lignes (crash serveur !)`,
          wrongWhyFr: 'La syntaxe pré-ANSI par virgule sans WHERE génère un CROSS JOIN involontaire catastrophique en production.',
          wrongWhyEn: 'Pre-ANSI comma join without WHERE triggers an accidental Cartesian disaster.',
          correctCode: `SELECT * 
FROM table1 t1
INNER JOIN table2 t2 ON t1.id = t2.t1_id;`,
          correctWhyFr: 'Toujours utiliser la syntaxe explicite ANSI JOIN avec la clause ON obligatoire.',
          correctWhyEn: 'Always favor explicit ANSI JOIN syntax with mandatory ON clause.'
        },
        goldenRules: [
          {
            ruleFr: 'Règle d\'or : Ne jamais employer la syntaxe par virgule (FROM A, B). Préférer CROSS JOIN explicite.',
            ruleEn: 'Golden Rule: Never use comma syntax (FROM A, B). Favor explicit CROSS JOIN.'
          }
        ]
      },

      full_outer_join: {
        subconceptId: 'full_outer_join',
        subconceptLabel: 'FULL OUTER JOIN & Rapprochements',
        titleFr: 'Mini-Cours : Le Rapprochement Intégral avec FULL JOIN',
        titleEn: 'Mini-Course: Complete Reconciliation with FULL JOIN',
        subtitleFr: 'Détecter les écarts bilatéraux entre deux référentiels de données.',
        subtitleEn: 'Detecting bilateral discrepancies between two data sources.',
        diagnosisSummaryFr: 'Le FULL OUTER JOIN est idéal pour auditer les écarts entre deux systèmes. Il conserve les lignes uniques de A ET les lignes uniques de B.',
        diagnosisSummaryEn: 'FULL OUTER JOIN is ideal for reconciling discrepancies between two systems.',
        keyRuleFr: 'FULL OUTER JOIN = LEFT JOIN UNION RIGHT JOIN. Toutes les lignes des deux tables sont retournées.',
        keyRuleEn: 'FULL OUTER JOIN = LEFT JOIN UNION RIGHT JOIN. All rows from both sides are returned.',
        trapSnippet: {
          titleFr: 'Trouver uniquement les orphelins des deux côtés',
          titleEn: 'Finding Only Orphans on Either Side',
          wrongCode: `SELECT * FROM A FULL OUTER JOIN B ON A.id = B.id; -- Retourne aussi les lignes qui matchent !`,
          wrongWhyFr: 'Ceci retourne les correspondances ET les orphelins.',
          wrongWhyEn: 'This returns matches AND orphans together.',
          correctCode: `SELECT A.id AS a_id, B.id AS b_id
FROM A
FULL OUTER JOIN B ON A.id = B.id
WHERE A.id IS NULL OR B.id IS NULL;`,
          correctWhyFr: 'La clause WHERE A.id IS NULL OR B.id IS NULL isole exactement les anomalies de rapprochement (les orphelins).',
          correctWhyEn: 'Filtering with WHERE A.id IS NULL OR B.id IS NULL precisely isolates discrepancy rows.'
        },
        goldenRules: [
          {
            ruleFr: 'Règle d\'or : En MySQL qui ne supporte pas FULL OUTER JOIN nativement, simuler avec (A LEFT JOIN B) UNION (A RIGHT JOIN B).',
            ruleEn: 'Golden Rule: In MySQL which lacks native FULL OUTER JOIN, emulate with (A LEFT JOIN B) UNION (A RIGHT JOIN B).'
          }
        ]
      }
    },

    // QUESTIONS CIBLÉES DE REMÉDIATION (5 NOUVELLES QUESTIONS PAR SOUS-NOTION)
    remediationQuestions: {
      left_join: [
        {
          id: 'rem-left-01',
          number: 1,
          subconceptId: 'left_join',
          subconceptLabel: 'LEFT JOIN Ciblé - Cardinalité',
          difficulty: 'easy',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 40,
          promptFr: 'Une table AUTEURS a 50 lignes. Une table LIVRES a 200 lignes. 5 auteurs n\'ont encore publié aucun livre. Combien de lignes AU MINIMUM retournera SELECT * FROM auteurs a LEFT JOIN livres l ON a.id = l.auteur_id ?',
          promptEn: 'Table AUTHORS has 50 rows. BOOKS has 200 rows. 5 authors have published no books yet. How many rows AT MINIMUM will SELECT * FROM authors a LEFT JOIN books l ON a.id = l.author_id return?',
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: '50 lignes (au moins une ligne pour chaque auteur)',
              textEn: '50 rows (at least one row per author)',
              isCorrect: true,
              explanationFr: 'Exact : dans un LEFT JOIN, chaque ligne de la table de gauche apparaît AU MOINS une fois. Même les 5 auteurs sans livre apparaissent (avec les colonnes du livre à NULL).',
              explanationEn: 'Correct: each record from the left table appears AT LEAST once in a LEFT JOIN.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: '45 lignes (seuls les auteurs avec livre)',
              textEn: '45 rows (only authors with books)',
              isCorrect: false,
              explanationFr: 'Faux : ce serait le cas avec un INNER JOIN !',
              explanationEn: 'Incorrect: that would be an INNER JOIN.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: '5 lignes',
              textEn: '5 rows',
              isCorrect: false,
              explanationFr: 'Faux : 5 est le nombre d\'auteurs sans livre, pas le total.',
              explanationEn: 'Incorrect: 5 is only the count of orphan authors.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: '200 lignes obligatoirement',
              textEn: 'Strictly 200 rows',
              isCorrect: false,
              explanationFr: 'Faux : 200 dépend de la répartition, le minimum garanti est 50.',
              explanationEn: 'Incorrect: 50 is the absolute minimum guaranteed.'
            }
          ],
          correctCount: 1
        },
        {
          id: 'rem-left-02',
          number: 2,
          subconceptId: 'left_join',
          subconceptLabel: 'LEFT JOIN Ciblé - Anti-Join',
          difficulty: 'medium',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 45,
          promptFr: 'Parmi ces 4 requêtes, laquelle est la SEULE syntaxiquement et sémantiquement correcte pour trouver les auteurs sans aucun livre ?',
          promptEn: 'Among these 4 queries, which is the ONLY syntactically and semantically correct one to find authors without books?',
          sqlCode: `-- Identifier les auteurs sans livres`,
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'SELECT a.id, a.nom FROM auteurs a LEFT JOIN livres l ON a.id = l.auteur_id WHERE l.id IS NULL;',
              textEn: 'SELECT a.id, a.nom FROM auteurs a LEFT JOIN livres l ON a.id = l.auteur_id WHERE l.id IS NULL;',
              isCorrect: true,
              explanationFr: 'Exact : c\'est le modèle universel de l\'Anti-Join via LEFT JOIN. Tester l.id IS NULL garantit qu\'aucun livre n\'a matché.',
              explanationEn: 'Correct: classic canonical Anti-Join pattern using LEFT JOIN with IS NULL.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'SELECT a.id, a.nom FROM auteurs a LEFT JOIN livres l ON a.id = l.auteur_id WHERE l.id = NULL;',
              textEn: 'SELECT a.id, a.nom FROM auteurs a LEFT JOIN livres l ON a.id = l.auteur_id WHERE l.id = NULL;',
              isCorrect: false,
              explanationFr: 'Piège récurrent : = NULL ne renvoie JAMAIS true en SQL !',
              explanationEn: 'Trap: = NULL never yields true in standard SQL!'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'SELECT a.id, a.nom FROM auteurs a INNER JOIN livres l ON a.id = l.auteur_id WHERE l.id IS NULL;',
              textEn: 'SELECT a.id, a.nom FROM auteurs a INNER JOIN livres l ON a.id = l.auteur_id WHERE l.id IS NULL;',
              isCorrect: false,
              explanationFr: 'Faux : INNER JOIN élimine déjà les orphelins, le résultat sera vide !',
              explanationEn: 'Incorrect: INNER JOIN already eliminates orphans; result will be empty!'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'SELECT a.id, a.nom FROM auteurs a LEFT JOIN livres l ON a.id = l.auteur_id HAVING COUNT(l.id) = 0;',
              textEn: 'SELECT a.id, a.nom FROM auteurs a LEFT JOIN livres l ON a.id = l.auteur_id HAVING COUNT(l.id) = 0;',
              isCorrect: false,
              explanationFr: 'Faux : sans GROUP BY, HAVING ne peut pas filtrer chaque auteur individuellement.',
              explanationEn: 'Incorrect: without GROUP BY, HAVING cannot isolate individual authors.'
            }
          ],
          correctCount: 1
        },
        {
          id: 'rem-left-03',
          number: 3,
          subconceptId: 'left_join',
          subconceptLabel: 'LEFT JOIN Ciblé - Colonnes Multiples',
          difficulty: 'medium',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 50,
          promptFr: 'Dans un LEFT JOIN, que vaut la fonction COALESCE(o.montant, 0) lorsqu\'un client n\'a pas de commande ?',
          promptEn: 'In a LEFT JOIN, what does COALESCE(o.montant, 0) evaluate to when a customer has no orders?',
          sqlCode: `SELECT c.nom, COALESCE(o.montant, 0) AS montant_paye
FROM clients c
LEFT JOIN commandes o ON c.id = o.client_id;`,
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: '0 (le nombre zéro)',
              textEn: '0 (the number zero)',
              isCorrect: true,
              explanationFr: 'Exact : pour un client sans commande, o.montant est NULL. COALESCE(NULL, 0) renvoie le premier argument non-NULL, soit 0.',
              explanationEn: 'Correct: COALESCE(NULL, 0) returns 0.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'NULL',
              textEn: 'NULL',
              isCorrect: false,
              explanationFr: 'Faux : le but même de COALESCE est de remplacer le NULL.',
              explanationEn: 'Incorrect: the exact purpose of COALESCE is replacing NULL.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'Une erreur de syntaxe',
              textEn: 'A syntax error',
              isCorrect: false,
              explanationFr: 'Faux : COALESCE est une fonction ANSI standard universelle.',
              explanationEn: 'Incorrect: COALESCE is standard ANSI SQL.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: '\'0\' (une chaîne vide)',
              textEn: '\'0\' (an empty string)',
              isCorrect: false,
              explanationFr: 'Faux : 0 est un entier numérique.',
              explanationEn: 'Incorrect: 0 is numeric.'
            }
          ],
          correctCount: 1
        },
        {
          id: 'rem-left-04',
          number: 4,
          subconceptId: 'left_join',
          subconceptLabel: 'LEFT JOIN Ciblé - Chaînage de Jointures',
          difficulty: 'hard',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 65,
          promptFr: 'Considérez le chaînage suivant. Pourquoi le second INNER JOIN casse-t-il le bénéfice du premier LEFT JOIN ?',
          promptEn: 'Consider the following chain. Why does the second INNER JOIN destroy the benefit of the first LEFT JOIN?',
          sqlCode: `SELECT c.nom, o.id_cmd, p.nom_produit
FROM clients c
LEFT JOIN commandes o ON c.id = o.client_id
INNER JOIN produits p ON o.produit_id = p.id;`,
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'Pour les clients sans commande, o.produit_id vaut NULL. Le INNER JOIN suivant cherche NULL = p.id, ce qui est faux et élimine ces clients du résultat final !',
              textEn: 'For clients without orders, o.produit_id is NULL. The subsequent INNER JOIN checks NULL = p.id which fails, eliminating those clients from the final output!',
              isCorrect: true,
              explanationFr: 'Exactement ! Dans une chaîne de jointures, un INNER JOIN placé après un LEFT JOIN détruit toutes les lignes préservées à moins d\'être lui-même un LEFT JOIN.',
              explanationEn: 'Spot on! Placing an INNER JOIN downstream of a LEFT JOIN discards all preserved orphan tuples.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'Car SQL interdit de mélanger LEFT JOIN et INNER JOIN dans une même requête.',
              textEn: 'Because SQL forbids mixing LEFT JOIN and INNER JOIN in the same query.',
              isCorrect: false,
              explanationFr: 'Faux : c\'est tout à fait autorisé sur le plan syntaxique.',
              explanationEn: 'Incorrect: mixing join types is completely legal syntax.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'Car les tables ne sont pas déclarées dans l\'ordre alphabétique.',
              textEn: 'Because tables are not listed in alphabetical order.',
              isCorrect: false,
              explanationFr: 'Faux : l\'ordre alphabétique n\'a aucun impact.',
              explanationEn: 'Incorrect: alphabetical order has no bearing.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'Car il manque un deuxième mot-clé FROM.',
              textEn: 'Because a second FROM keyword is missing.',
              isCorrect: false,
              explanationFr: 'Faux : il n\'y a qu\'un seul FROM par bloc de sélection.',
              explanationEn: 'Incorrect: only one FROM keyword is allowed.'
            }
          ],
          correctCount: 1
        },
        {
          id: 'rem-left-05',
          number: 5,
          subconceptId: 'left_join',
          subconceptLabel: 'LEFT JOIN Ciblé - Validation Finale',
          difficulty: 'medium',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 50,
          promptFr: 'Quelle est la façon correcte d\'écrire la requête précédente pour conserver les clients sans commande TOUT EN affichant le produit lorsqu\'une commande existe ?',
          promptEn: 'What is the correct way to write the previous query to preserve clients without orders WHILE displaying the product when an order exists?',
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'Remplacer le deuxième INNER JOIN par un LEFT JOIN : LEFT JOIN produits p ON o.produit_id = p.id',
              textEn: 'Replace the second INNER JOIN with a LEFT JOIN: LEFT JOIN produits p ON o.produit_id = p.id',
              isCorrect: true,
              explanationFr: 'Bravo ! Remplacer le second INNER JOIN par un LEFT JOIN permet à la chaîne de préserver les NULLs jusqu\'au bout.',
              explanationEn: 'Bravo! Using LEFT JOIN downstream preserves the NULLs all the way to projection.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'Remplacer le premier LEFT JOIN par un CROSS JOIN.',
              textEn: 'Replace the first LEFT JOIN with a CROSS JOIN.',
              isCorrect: false,
              explanationFr: 'Faux : cela générerait un produit cartésien.',
              explanationEn: 'Incorrect: that triggers a Cartesian explosion.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'Supprimer la table clients.',
              textEn: 'Delete the clients table.',
              isCorrect: false,
              explanationFr: 'Faux : on veut conserver les clients !',
              explanationEn: 'Incorrect: we need the clients.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'Ajouter GROUP BY c.nom à la fin.',
              textEn: 'Add GROUP BY c.nom at the end.',
              isCorrect: false,
              explanationFr: 'Faux : GROUP BY n\'évite pas la perte des lignes provoquée par l\'INNER JOIN.',
              explanationEn: 'Incorrect: GROUP BY does not rescue rows eliminated by INNER JOIN.'
            }
          ],
          correctCount: 1
        }
      ],

      on_vs_where: [
        {
          id: 'rem-onwhere-01',
          number: 1,
          subconceptId: 'on_vs_where',
          subconceptLabel: 'ON vs WHERE Ciblé - Règle de Base',
          difficulty: 'medium',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 45,
          promptFr: 'Dans la requête suivante, quelle ligne sera retournée pour un client nommé \'Dupont\' qui ne possède AUCUNE commande ?',
          promptEn: 'In the following query, what row will be returned for a customer named \'Dupont\' who has NO orders?',
          sqlCode: `SELECT c.nom, o.montant
FROM clients c
LEFT JOIN commandes o 
  ON c.id = o.client_id AND o.montant > 500;`,
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'La ligne (\'Dupont\', NULL) est retournée.',
              textEn: 'The row (\'Dupont\', NULL) is returned.',
              isCorrect: true,
              explanationFr: 'Exact : la condition sur o.montant est dans le ON. Comme Dupont n\'a pas de commande > 500, la table gauche (clients) est préservée avec montant = NULL.',
              explanationEn: 'Correct: predicate is inside the ON clause, so Dupont is preserved with montant = NULL.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'Dupont n\'apparaît pas dans le résultat.',
              textEn: 'Dupont does not appear in the result.',
              isCorrect: false,
              explanationFr: 'Faux : il n\'apparaîtrait pas si la condition était dans WHERE !',
              explanationEn: 'Incorrect: he would be eliminated only if the filter was in WHERE.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'La ligne (\'Dupont\', 0) est retournée.',
              textEn: 'The row (\'Dupont\', 0) is returned.',
              isCorrect: false,
              explanationFr: 'Faux : SQL remplit par NULL, pas par 0.',
              explanationEn: 'Incorrect: SQL pads unmatched columns with NULL, not 0.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'Une erreur ORA-00933 SQL command not properly ended.',
              textEn: 'An error ORA-00933 SQL command not properly ended.',
              isCorrect: false,
              explanationFr: 'Faux : la syntaxe est 100% valide.',
              explanationEn: 'Incorrect: syntax is completely valid.'
            }
          ],
          correctCount: 1
        },
        {
          id: 'rem-onwhere-02',
          number: 2,
          subconceptId: 'on_vs_where',
          subconceptLabel: 'ON vs WHERE Ciblé - Comparaison Directe',
          difficulty: 'medium',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 50,
          promptFr: 'Si l\'on déplace la condition dans le WHERE (WHERE o.montant > 500), que devient Dupont (qui n\'a pas de commande) ?',
          promptEn: 'If we move the condition to the WHERE clause (WHERE o.montant > 500), what happens to Dupont (who has no orders)?',
          sqlCode: `SELECT c.nom, o.montant
FROM clients c
LEFT JOIN commandes o ON c.id = o.client_id
WHERE o.montant > 500;`,
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'Dupont est définitivement exclu du résultat final.',
              textEn: 'Dupont is permanently excluded from the final result.',
              isCorrect: true,
              explanationFr: 'Exact : pour Dupont, o.montant vaut NULL. La condition NULL > 500 s\'évalue à UNKNOWN, ce qui est rejeté par WHERE !',
              explanationEn: 'Correct: for Dupont, o.montant is NULL. NULL > 500 is UNKNOWN, rejected by WHERE.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'Dupont apparaît toujours avec NULL.',
              textEn: 'Dupont still appears with NULL.',
              isCorrect: false,
              explanationFr: 'Faux : le WHERE élimine les NULLs.',
              explanationEn: 'Incorrect: the WHERE clause filters out the synthesized NULLs.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'Dupont apparaît avec montant = 500.',
              textEn: 'Dupont appears with montant = 500.',
              isCorrect: false,
              explanationFr: 'Faux : impossible.',
              explanationEn: 'Incorrect: impossible.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'La base de données lance un avertissement d\'incohérence.',
              textEn: 'The database triggers an inconsistency warning.',
              isCorrect: false,
              explanationFr: 'Faux : l\'optimiseur applique simplement le filtre.',
              explanationEn: 'Incorrect: optimizer cleanly executes the filter.'
            }
          ],
          correctCount: 1
        },
        {
          id: 'rem-onwhere-03',
          number: 3,
          subconceptId: 'on_vs_where',
          subconceptLabel: 'ON vs WHERE Ciblé - Prédicat Null-Rejecting',
          difficulty: 'hard',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 60,
          promptFr: 'Parmi les clauses WHERE suivantes appliquées à un LEFT JOIN A LEFT JOIN B ON A.id = B.a_id, laquelle NE détruit PAS le LEFT JOIN ?',
          promptEn: 'Among the following WHERE clauses applied to A LEFT JOIN B ON A.id = B.a_id, which one does NOT destroy the LEFT JOIN?',
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'WHERE (B.statut = \'ACTIF\' OR B.id IS NULL)',
              textEn: 'WHERE (B.statut = \'ACTIF\' OR B.id IS NULL)',
              isCorrect: true,
              explanationFr: 'Bravo ! Grâce à l\'alternative "OR B.id IS NULL", les lignes orphelines de la table gauche ne sont pas éliminées. Le caractère externe de la jointure est préservé.',
              explanationEn: 'Bravo! Adding "OR B.id IS NULL" prevents the elimination of preserved left rows.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'WHERE B.statut = \'ACTIF\'',
              textEn: 'WHERE B.statut = \'ACTIF\'',
              isCorrect: false,
              explanationFr: 'Détruit le LEFT JOIN car B.statut est NULL pour les orphelins.',
              explanationEn: 'Destroys LEFT JOIN because B.statut is NULL for orphans.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'WHERE B.prix > 0',
              textEn: 'WHERE B.prix > 0',
              isCorrect: false,
              explanationFr: 'Détruit le LEFT JOIN car NULL > 0 donne UNKNOWN.',
              explanationEn: 'Destroys LEFT JOIN because NULL > 0 is UNKNOWN.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'WHERE B.date_creation BETWEEN \'2024-01-01\' AND \'2024-12-31\'',
              textEn: 'WHERE B.date_creation BETWEEN \'2024-01-01\' AND \'2024-12-31\'',
              isCorrect: false,
              explanationFr: 'Détruit également le LEFT JOIN.',
              explanationEn: 'Also destroys the LEFT JOIN.'
            }
          ],
          correctCount: 1
        },
        {
          id: 'rem-onwhere-04',
          number: 4,
          subconceptId: 'on_vs_where',
          subconceptLabel: 'ON vs WHERE Ciblé - Filtre sur Table Gauche',
          difficulty: 'medium',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 50,
          promptFr: 'Où doit-on placer un filtre qui ne concerne QUE la table de gauche (ex: clients.pays = \'France\') dans un clients LEFT JOIN commandes ?',
          promptEn: 'Where should a filter that ONLY concerns the left table (e.g. clients.pays = \'France\') be placed in clients LEFT JOIN orders?',
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'Dans la clause WHERE (car on ne souhaite examiner et retourner QUE les clients français).',
              textEn: 'In the WHERE clause (since we strictly want to query and return French clients).',
              isCorrect: true,
              explanationFr: 'Exact ! Un filtre sur la table de gauche dans le WHERE est parfaitement légitime : il restreint la population des clients analysés aux seuls clients français.',
              explanationEn: 'Correct! A left-table filter in WHERE cleanly restricts the base population.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'Obligatoirement dans la clause ON.',
              textEn: 'Strictly in the ON clause.',
              isCorrect: false,
              explanationFr: 'Attention : mettre clients.pays = \'France\' dans le ON retournerait TOUS les clients (même espagnols) mais sans commande pour les non-français !',
              explanationEn: 'Warning: putting left filter into ON still returns all clients, but leaves non-French without matched orders.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'Dans une sous-requête avec UNION ALL obligatoirement.',
              textEn: 'Inside a subquery with UNION ALL strictly.',
              isCorrect: false,
              explanationFr: 'Faux : aucunement nécessaire.',
              explanationEn: 'Incorrect: completely unnecessary.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'Dans un bloc DDL.',
              textEn: 'In a DDL statement.',
              isCorrect: false,
              explanationFr: 'Faux.',
              explanationEn: 'Incorrect.'
            }
          ],
          correctCount: 1
        },
        {
          id: 'rem-onwhere-05',
          number: 5,
          subconceptId: 'on_vs_where',
          subconceptLabel: 'ON vs WHERE Ciblé - Synthèse de Maîtrise',
          difficulty: 'hard',
          domain: 'Validation Finale',
          targetTimeSeconds: 55,
          promptFr: 'Résumez la règle absolue pour un développeur SQL chevronné :',
          promptEn: 'Summarize the golden rule for a senior SQL developer:',
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'Pour filtrer les correspondances facultatives de la table droite -> clause ON. Pour filtrer le résultat global ou chercher l\'absence de correspondance (IS NULL) -> clause WHERE.',
              textEn: 'To filter optional right-table matches -> ON clause. To filter overall dataset or test non-matches (IS NULL) -> WHERE clause.',
              isCorrect: true,
              explanationFr: 'Parfait ! Cette formulation résume avec une clarté absolue la distinction fondamentale entre ON et WHERE dans les jointures externes.',
              explanationEn: 'Spot on! This perfectly captures the core distinction between ON and WHERE in outer joins.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'Toujours tout mettre dans WHERE pour la lisibilité.',
              textEn: 'Always put everything into WHERE for readability.',
              isCorrect: false,
              explanationFr: 'Faux : cela détruit les jointures externes !',
              explanationEn: 'Incorrect: that destroys outer joins!'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'Toujours tout mettre dans ON sans jamais écrire de WHERE.',
              textEn: 'Always put everything into ON without ever writing WHERE.',
              isCorrect: false,
              explanationFr: 'Faux : cela empêche le filtrage global de la table gauche.',
              explanationEn: 'Incorrect: that prevents global filtering on the left table.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'Les clauses ON et WHERE sont interchangeables en SQL.',
              textEn: 'ON and WHERE clauses are interchangeable in SQL.',
              isCorrect: false,
              explanationFr: 'Faux : uniquement dans un INNER JOIN, jamais dans un OUTER JOIN !',
              explanationEn: 'Incorrect: only in INNER JOIN, never in OUTER JOIN!'
            }
          ],
          correctCount: 1
        }
      ],

      inner_join: [
        {
          id: 'rem-inner-01',
          number: 1,
          subconceptId: 'inner_join',
          subconceptLabel: 'INNER JOIN Remédiation',
          difficulty: 'easy',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 40,
          promptFr: 'Dans un INNER JOIN entre table A (3 lignes) et table B (4 lignes), si aucune ligne ne satisfait la clause ON, combien de lignes sont retournées ?',
          promptEn: 'In an INNER JOIN between table A (3 rows) and B (4 rows), if no rows satisfy the ON clause, how many rows are returned?',
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: '0 ligne',
              textEn: '0 rows',
              isCorrect: true,
              explanationFr: 'Exact : l\'intersection est vide.',
              explanationEn: 'Correct: the intersection set is empty.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: '3 lignes',
              textEn: '3 rows',
              isCorrect: false,
              explanationFr: 'Faux : ce serait le cas avec un LEFT JOIN.',
              explanationEn: 'Incorrect: that would be a LEFT JOIN.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: '12 lignes',
              textEn: '12 rows',
              isCorrect: false,
              explanationFr: 'Faux : ce serait un CROSS JOIN.',
              explanationEn: 'Incorrect: that would be a CROSS JOIN.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'NULL',
              textEn: 'NULL',
              isCorrect: false,
              explanationFr: 'Faux.',
              explanationEn: 'Incorrect.'
            }
          ],
          correctCount: 1
        },
        {
          id: 'rem-inner-02',
          number: 2,
          subconceptId: 'inner_join',
          subconceptLabel: 'INNER JOIN Multi-Conditions',
          difficulty: 'medium',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 45,
          promptFr: 'Peut-on mettre plusieurs prédicats reliés par AND dans la clause ON d\'un INNER JOIN ?',
          promptEn: 'Can multiple predicates connected by AND be placed in the ON clause of an INNER JOIN?',
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'Oui, tout à fait (ex: ON a.id = b.a_id AND a.type = b.type)',
              textEn: 'Yes, absolutely (e.g. ON a.id = b.a_id AND a.type = b.type)',
              isCorrect: true,
              explanationFr: 'Exact : la clause ON accepte toute expression booléenne composée.',
              explanationEn: 'Correct: the ON clause accepts any composite boolean expression.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'Non, un seul prédicat est toléré.',
              textEn: 'No, only a single predicate is allowed.',
              isCorrect: false,
              explanationFr: 'Faux.',
              explanationEn: 'Incorrect.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'Uniquement avec des sous-requêtes.',
              textEn: 'Only with subqueries.',
              isCorrect: false,
              explanationFr: 'Faux.',
              explanationEn: 'Incorrect.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'Uniquement en dialecte Oracle.',
              textEn: 'Only in Oracle dialect.',
              isCorrect: false,
              explanationFr: 'Faux : c\'est le standard ANSI.',
              explanationEn: 'Incorrect: this is ANSI standard.'
            }
          ],
          correctCount: 1
        },
        {
          id: 'rem-inner-03',
          number: 3,
          subconceptId: 'inner_join',
          subconceptLabel: 'INNER JOIN Non-Équi-Jointure',
          difficulty: 'medium',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 50,
          promptFr: 'Une jointure avec ON a.salaire BETWEEN g.salaire_min AND g.salaire_max est-elle un INNER JOIN valide ?',
          promptEn: 'Is a join with ON a.salary BETWEEN g.min_salary AND g.max_salary a valid INNER JOIN?',
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'Oui, c\'est une non-équi-jointure (Theta-Join) parfaitement valide en SQL ANSI.',
              textEn: 'Yes, it is a non-equi-join (Theta-Join) fully valid in ANSI SQL.',
              isCorrect: true,
              explanationFr: 'Exact : la clause ON n\'est pas restreinte au signe =.',
              explanationEn: 'Correct: ON clause is not restricted to = equality.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'Non, seule l\'égalité stricte (=) est permise.',
              textEn: 'No, only strict equality (=) is permitted.',
              isCorrect: false,
              explanationFr: 'Faux : les opérateurs <, >, <=, >=, BETWEEN sont valides.',
              explanationEn: 'Incorrect: range operators are fully supported.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'Elle nécessite le mot-clé THETA JOIN.',
              textEn: 'It requires the THETA JOIN keyword.',
              isCorrect: false,
              explanationFr: 'Faux : THETA JOIN est un terme théorique, pas un mot-clé SQL.',
              explanationEn: 'Incorrect: Theta-Join is a mathematical concept.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'Cela génère une boucle infinie.',
              textEn: 'It triggers an infinite loop.',
              isCorrect: false,
              explanationFr: 'Faux.',
              explanationEn: 'Incorrect.'
            }
          ],
          correctCount: 1
        },
        {
          id: 'rem-inner-04',
          number: 4,
          subconceptId: 'inner_join',
          subconceptLabel: 'INNER JOIN Clés Primaires Multiples',
          difficulty: 'medium',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 45,
          promptFr: 'Sur une table de liaison n:m COMMANDES_LIGNES, quelle jointure faire pour rattacher à la fois les COMMANDES et les PRODUITS ?',
          promptEn: 'On an n:m junction table ORDER_LINES, what joins connect both ORDERS and PRODUCTS?',
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'Deux INNER JOIN consécutifs avec leurs clés respectives',
              textEn: 'Two consecutive INNER JOINs with their respective keys',
              isCorrect: true,
              explanationFr: 'Exact : FROM commandes c INNER JOIN commandes_lignes cl ON c.id = cl.cmd_id INNER JOIN produits p ON cl.produit_id = p.id.',
              explanationEn: 'Correct: two consecutive joins linking through the bridge table.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'Un seul INNER JOIN avec trois tables dans le ON',
              textEn: 'A single join with 3 tables in the ON',
              isCorrect: false,
              explanationFr: 'Faux : chaque table jointe requiert sa propre clause JOIN et ON.',
              explanationEn: 'Incorrect: each table requires its own JOIN and ON.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'Un FULL OUTER JOIN obligatoire',
              textEn: 'A mandatory FULL OUTER JOIN',
              isCorrect: false,
              explanationFr: 'Faux.',
              explanationEn: 'Incorrect.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'Un CROSS JOIN',
              textEn: 'A CROSS JOIN',
              isCorrect: false,
              explanationFr: 'Faux.',
              explanationEn: 'Incorrect.'
            }
          ],
          correctCount: 1
        },
        {
          id: 'rem-inner-05',
          number: 5,
          subconceptId: 'inner_join',
          subconceptLabel: 'INNER JOIN Synthèse',
          difficulty: 'easy',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 35,
          promptFr: 'Quelle est la valeur par défaut si l\'on écrit simplement "JOIN" sans préciser INNER ni LEFT ?',
          promptEn: 'What is the default behavior if you simply write "JOIN" without specifying INNER or LEFT?',
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'INNER JOIN (le mot-clé INNER est optionnel en standard SQL)',
              textEn: 'INNER JOIN (the INNER keyword is optional in SQL standard)',
              isCorrect: true,
              explanationFr: 'Exact : en SQL ANSI, "JOIN" est un alias exact de "INNER JOIN".',
              explanationEn: 'Correct: in ANSI SQL, "JOIN" defaults to "INNER JOIN".'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'LEFT JOIN',
              textEn: 'LEFT JOIN',
              isCorrect: false,
              explanationFr: 'Faux : LEFT JOIN doit toujours être explicitement déclaré.',
              explanationEn: 'Incorrect: LEFT JOIN must always be explicit.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'CROSS JOIN',
              textEn: 'CROSS JOIN',
              isCorrect: false,
              explanationFr: 'Faux.',
              explanationEn: 'Incorrect.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'Erreur de syntaxe',
              textEn: 'Syntax error',
              isCorrect: false,
              explanationFr: 'Faux : "JOIN" seul est universellement accepté.',
              explanationEn: 'Incorrect: "JOIN" alone is universally accepted.'
            }
          ],
          correctCount: 1
        }
      ]
    }
  },

  // =========================================================================
  // MODULE 2 : AGRÉGATION, GROUP BY & HAVING
  // =========================================================================
  {
    id: 'sql-aggregation-mastery',
    titleFr: 'Agrégation, GROUP BY & Clauses HAVING',
    titleEn: 'Aggregation, GROUP BY & HAVING Clauses',
    category: 'Analyse & Calculs d\'Agrégats',
    shortDescriptionFr: 'Maîtrisez le pipeline d\'évaluation logique : de l\'élimination pré-agrégat dans WHERE jusqu\'au filtrage post-groupe dans HAVING.',
    shortDescriptionEn: 'Master logical query processing: from pre-aggregate pruning in WHERE to post-group filtering in HAVING.',
    badgeName: 'SQL Aggregation Master',
    accentColor: '#10b981',
    subconcepts: [
      {
        id: 'where_vs_having',
        name: 'WHERE vs HAVING',
        shortDescFr: 'Filtrer des lignes élémentaires (WHERE) vs filtrer des groupes condensés (HAVING).',
        shortDescEn: 'Filtering base rows (WHERE) vs filtering aggregated buckets (HAVING).'
      },
      {
        id: 'count_star_vs_col',
        name: 'COUNT(*) vs COUNT(colonne)',
        shortDescFr: 'Le comptage de lignes physiques vs le comptage de valeurs non-NULL.',
        shortDescEn: 'Physical row count vs non-NULL column occurrence count.'
      },
      {
        id: 'group_by_rules',
        name: 'Règles du GROUP BY',
        shortDescFr: 'Toute colonne non agrégée du SELECT doit figurer dans le GROUP BY.',
        shortDescEn: 'Every non-aggregated column in SELECT must appear in GROUP BY.'
      }
    ],
    prerequisitesFr: ['Fonctions scalaires et mathématiques', 'Gestion des valeurs NULL'],
    prerequisitesEn: ['Scalar and mathematical functions', 'Handling NULL values'],
    initialQuestions: [
      {
        id: 'q-agg-01',
        number: 1,
        subconceptId: 'where_vs_having',
        subconceptLabel: 'WHERE vs HAVING',
        difficulty: 'medium',
        domain: 'Ordre d\'exécution logique',
        targetTimeSeconds: 50,
        promptFr: 'Pourquoi ne peut-on PAS utiliser la condition WHERE AVG(salaire) > 3000 ?',
        promptEn: 'Why CANNOT you write WHERE AVG(salary) > 3000?',
        sqlCode: `SELECT departement_id, AVG(salaire)
FROM employes
WHERE AVG(salaire) > 3000 -- Erreur !
GROUP BY departement_id;`,
        options: [
          {
            id: 'opt-1',
            label: 'A',
            textFr: 'Car la clause WHERE est évaluée AVANT que les groupes ne soient formés. À ce stade, la moyenne par département n\'existe pas encore.',
            textEn: 'Because WHERE is evaluated BEFORE groups are formed. At that stage, department averages do not exist yet.',
            isCorrect: true,
            explanationFr: 'Exact : dans le cycle logique (FROM -> WHERE -> GROUP BY -> HAVING), WHERE traite les lignes une par une avant l\'agrégation. Il faut utiliser HAVING.',
            explanationEn: 'Correct: WHERE operates on individual rows prior to grouping. Aggregates belong in HAVING.'
          },
          {
            id: 'opt-2',
            label: 'B',
            textFr: 'Car AVG ne fonctionne qu\'avec des entiers.',
            textEn: 'Because AVG only operates on integers.',
            isCorrect: false,
            explanationFr: 'Faux : AVG fonctionne avec tous les types numériques.',
            explanationEn: 'Incorrect: AVG works on all numerical datatypes.'
          },
          {
            id: 'opt-3',
            label: 'C',
            textFr: 'Car il manque la clause ORDER BY.',
            textEn: 'Because ORDER BY is missing.',
            isCorrect: false,
            explanationFr: 'Faux : ORDER BY est optionnel.',
            explanationEn: 'Incorrect: ORDER BY is optional.'
          },
          {
            id: 'opt-4',
            label: 'D',
            textFr: 'Car le mot-clé AVG doit s\'écrire en minuscules.',
            textEn: 'Because AVG must be lowercase.',
            isCorrect: false,
            explanationFr: 'Faux : SQL est insensible à la casse.',
            explanationEn: 'Incorrect: SQL is case-insensitive.'
          }
        ],
        correctCount: 1
      },
      {
        id: 'q-agg-02',
        number: 2,
        subconceptId: 'count_star_vs_col',
        subconceptLabel: 'COUNT(*) vs COUNT(colonne)',
        difficulty: 'easy',
        domain: 'Fonctions d\'agrégation',
        targetTimeSeconds: 40,
        promptFr: 'Une table PROSPECTS contient 10 lignes. La colonne telephone contient 7 numéros renseignés et 3 valeurs NULL. Que renvoient respectivement COUNT(*) et COUNT(telephone) ?',
        promptEn: 'Table LEADS has 10 rows. Column phone has 7 phone numbers and 3 NULL values. What do COUNT(*) and COUNT(phone) return respectively?',
        options: [
          {
            id: 'opt-1',
            label: 'A',
            textFr: 'COUNT(*) = 10 et COUNT(telephone) = 7',
            textEn: 'COUNT(*) = 10 and COUNT(phone) = 7',
            isCorrect: true,
            explanationFr: 'Exact : COUNT(*) compte le nombre de lignes physiques (incluant les NULLs), tandis que COUNT(colonne) ignore les valeurs NULL.',
            explanationEn: 'Correct: COUNT(*) tallies physical rows; COUNT(col) ignores NULL values.'
          },
          {
            id: 'opt-2',
            label: 'B',
            textFr: 'COUNT(*) = 10 et COUNT(telephone) = 10',
            textEn: 'COUNT(*) = 10 and COUNT(phone) = 10',
            isCorrect: false,
            explanationFr: 'Faux : COUNT(colonne) ignore toujours les NULLs.',
            explanationEn: 'Incorrect: COUNT(col) never counts NULLs.'
          },
          {
            id: 'opt-3',
            label: 'C',
            textFr: 'COUNT(*) = 7 et COUNT(telephone) = 7',
            textEn: 'COUNT(*) = 7 and COUNT(phone) = 7',
            isCorrect: false,
            explanationFr: 'Faux : COUNT(*) ne filtre aucune ligne.',
            explanationEn: 'Incorrect: COUNT(*) never filters rows.'
          },
          {
            id: 'opt-4',
            label: 'D',
            textFr: 'Une erreur SQL',
            textEn: 'A SQL error',
            isCorrect: false,
            explanationFr: 'Faux.',
            explanationEn: 'Incorrect.'
          }
        ],
        correctCount: 1
      }
    ],
    miniCourses: {
      where_vs_having: {
        subconceptId: 'where_vs_having',
        subconceptLabel: 'WHERE vs HAVING : Ordre d\'Évaluation Logique',
        titleFr: 'Mini-Cours : Le Flux d\'Exécution Logique SQL',
        titleEn: 'Mini-Course: The Logical SQL Execution Flow',
        subtitleFr: 'La règle FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.',
        subtitleEn: 'The core rule: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.',
        diagnosisSummaryFr: 'Une faiblesse a été détectée sur la distinction entre filtre unitaire (WHERE) et filtre d\'agrégats (HAVING).',
        diagnosisSummaryEn: 'A weakness was detected between row-level pruning (WHERE) and aggregate filtering (HAVING).',
        keyRuleFr: 'WHERE filtre les enregistrements individuels AVANT le regroupement. HAVING filtre les groupes consolidés APRÈS le calcul des agrégats.',
        keyRuleEn: 'WHERE filters individual records BEFORE grouping. HAVING filters consolidated buckets AFTER aggregates.',
        trapSnippet: {
          titleFr: 'Le Piège de Filtrer une Colonne Simple dans HAVING',
          titleEn: 'The Trap of Filtering a Simple Column in HAVING',
          wrongCode: `-- INEFFICACE : Filtrer le pays dans HAVING
SELECT pays, COUNT(*)
FROM clients
GROUP BY pays
HAVING pays = 'France';`,
          wrongWhyFr: 'Le moteur regroupe inutilement tous les pays du monde avant de n\'en garder qu\'un !',
          wrongWhyEn: 'The engine aggregates every country in the world before discarding all but one!',
          correctCode: `-- OPTIMAL : Filtrer dès le WHERE
SELECT pays, COUNT(*)
FROM clients
WHERE pays = 'France'
GROUP BY pays;`,
          correctWhyFr: 'Le WHERE élimine les lignes non pertinentes immédiatement avant tout tri ou hachage en mémoire.',
          correctWhyEn: 'WHERE prunes unwanted rows upfront before any grouping overhead in memory.'
        },
        goldenRules: [
          {
            ruleFr: 'Règle d\'or : Tout ce qui peut être filtré dans WHERE DOIT être filtré dans WHERE.',
            ruleEn: 'Golden Rule: Anything that can be pruned in WHERE MUST be pruned in WHERE.'
          }
        ]
      }
    },
    remediationQuestions: {
      where_vs_having: [
        {
          id: 'rem-agg-01',
          number: 1,
          subconceptId: 'where_vs_having',
          subconceptLabel: 'WHERE vs HAVING Remédiation',
          difficulty: 'medium',
          domain: 'Remédiation Ciblée',
          targetTimeSeconds: 45,
          promptFr: 'Pour afficher les départements ayant plus de 5 employés actifs (statut = \'ACTIF\'), où placer chaque condition ?',
          promptEn: 'To show departments with more than 5 active employees (status = \'ACTIF\'), where should each condition go?',
          options: [
            {
              id: 'rem-1',
              label: 'A',
              textFr: 'statut = \'ACTIF\' dans WHERE, et COUNT(*) > 5 dans HAVING',
              textEn: 'status = \'ACTIF\' in WHERE, and COUNT(*) > 5 in HAVING',
              isCorrect: true,
              explanationFr: 'Exact : on filtre les employés actifs dans WHERE avant de compter, puis on filtre les départements comptant plus de 5 employés dans HAVING.',
              explanationEn: 'Correct: active filter in WHERE, bucket size filter in HAVING.'
            },
            {
              id: 'rem-2',
              label: 'B',
              textFr: 'Les deux conditions dans WHERE',
              textEn: 'Both conditions in WHERE',
              isCorrect: false,
              explanationFr: 'Faux : COUNT ne peut pas aller dans WHERE.',
              explanationEn: 'Incorrect: COUNT cannot sit in WHERE.'
            },
            {
              id: 'rem-3',
              label: 'C',
              textFr: 'Les deux conditions dans HAVING',
              textEn: 'Both conditions in HAVING',
              isCorrect: false,
              explanationFr: 'Faux : sous-optimal et inutile pour statut = \'ACTIF\'.',
              explanationEn: 'Incorrect: sub-optimal.'
            },
            {
              id: 'rem-4',
              label: 'D',
              textFr: 'Dans ORDER BY',
              textEn: 'Inside ORDER BY',
              isCorrect: false,
              explanationFr: 'Faux.',
              explanationEn: 'Incorrect.'
            }
          ],
          correctCount: 1
        }
      ]
    }
  }
];
