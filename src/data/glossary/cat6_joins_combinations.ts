import { GlossaryTerm } from '../../types';

export const CAT6_JOINS_COMBINATIONS_TERMS: GlossaryTerm[] = [
  {
    id: 'inner-join',
    termFr: 'INNER JOIN (Jointure interne)',
    termEn: 'INNER JOIN',
    category: 6,
    categoryNameFr: 'Jointures (Joins) et Combinaisons',
    categoryNameEn: 'Joins & Set Operations',
    shortDefFr: 'Retourne uniquement les lignes qui présentent une correspondance exacte entre les deux tables selon le prédicat de jointure (ON).',
    shortDefEn: 'Returns only records that satisfy the matching predicate in both tables.',
    fullExplanationFr: 'C\'est la jointure par défaut en SQL (écrire simplement `JOIN` équivaut à `INNER JOIN`). Si une ligne de la table A n\'a aucune correspondance dans la table B (ou vice-versa), elle est purement et simplement écartée du résultat final.',
    fullExplanationEn: 'The default join behavior. Rows from either table lacking a matching pair in the opposing table are omitted from the output.',
    codeSnippet: `SELECT 
  c.client_id,
  c.nom AS nom_client,
  cmd.commande_id,
  cmd.montant
FROM clients c
INNER JOIN commandes cmd 
  ON c.client_id = cmd.client_id;
-- Seuls les clients ayant passé au moins une commande apparaissent`,
    codeSnippetCommentFr: 'Jointure interne associant clients et commandes correspondantes.',
    codeSnippetCommentEn: 'Standard inner join matching customers with their respective orders.',
    dialects: {
      universal: true,
      specialNoteFr: 'L\'ancienne syntaxe ANSI 89 avec virgule dans le FROM (`FROM clients c, commandes cmd WHERE c.id = cmd.client_id`) est considérée comme obsolète et dangereuse (risque d\'oubli du WHERE provoquant un produit cartésien).',
    },
    crossReferences: [
      { id: 'left-join', labelFr: 'LEFT JOIN', labelEn: 'LEFT JOIN' },
      { id: 'foreign-key', labelFr: 'Clé étrangère (FK)', labelEn: 'Foreign Key' },
      { id: 'cross-join', labelFr: 'CROSS JOIN', labelEn: 'CROSS JOIN' },
    ],
    tags: ['Jointure', 'Intersection', 'INNER JOIN', 'ON'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Assurez-vous toujours que les colonnes de jointure sont indexées et partagent le même type de données exact (ex: éviter de joindre un INT avec un VARCHAR, ce qui désactive les index).',
    proTipEn: 'Ensure join columns share identical data types and are indexed to prevent full scan hash join fallbacks.',
  },
  {
    id: 'left-join',
    termFr: 'LEFT (OUTER) JOIN (Jointure externe gauche)',
    termEn: 'LEFT (OUTER) JOIN',
    category: 6,
    categoryNameFr: 'Jointures (Joins) et Combinaisons',
    categoryNameEn: 'Joins & Set Operations',
    shortDefFr: 'Retourne toutes les lignes de la table de gauche, accompagnées des données correspondantes de la table de droite, ou de valeurs NULL si aucune correspondance n\'existe.',
    shortDefEn: 'Returns all rows from the left table, with matching rows from the right table, or NULL if no match exists.',
    fullExplanationFr: 'Indispensable pour trouver des entités sans enfants (ex: "trouver les clients qui n\'ont jamais passé de commande" via `LEFT JOIN ... WHERE cmd.id IS NULL`). `LEFT OUTER JOIN` et `LEFT JOIN` sont de parfaits synonymes.',
    fullExplanationEn: 'Preserves every row from the left table. Essential for finding orphan parents using anti-join patterns (`WHERE right.id IS NULL`).',
    codeSnippet: `-- 1. Afficher TOUS les clients et leurs commandes éventuelles
SELECT 
  c.client_id,
  c.nom,
  cmd.commande_id,
  cmd.montant
FROM clients c
LEFT JOIN commandes cmd 
  ON c.client_id = cmd.client_id;

-- 2. Anti-Jointure : Trouver les clients SANS aucune commande
SELECT c.client_id, c.nom
FROM clients c
LEFT JOIN commandes cmd ON c.client_id = cmd.client_id
WHERE cmd.commande_id IS NULL;`,
    codeSnippetCommentFr: 'Jointure gauche exhaustive et patron d\'anti-jointure pour isoler les orphelins.',
    codeSnippetCommentEn: 'Preserving left table rows and anti-join pattern finding zero-order customers.',
    dialects: {
      universal: true,
      oracle: 'Oracle supportait l\'ancienne syntaxe propriétaire `c.id = cmd.client_id(+)`. La syntaxe standard ANSI `LEFT JOIN` est la seule recommandée depuis Oracle 9i.',
    },
    crossReferences: [
      { id: 'inner-join', labelFr: 'INNER JOIN', labelEn: 'INNER JOIN' },
      { id: 'right-join', labelFr: 'RIGHT JOIN', labelEn: 'RIGHT JOIN' },
      { id: 'full-join', labelFr: 'FULL JOIN', labelEn: 'FULL JOIN' },
    ],
    tags: ['Jointure externe', 'LEFT JOIN', 'Anti-jointure', 'NULL'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Attention au piège : si vous mettez un filtre sur la table de droite dans la clause `WHERE` (ex: `WHERE cmd.montant > 100`), votre `LEFT JOIN` est automatiquement transformé en `INNER JOIN` (car les lignes avec NULL sont éliminées) ! Mettez ce filtre dans la clause `ON` pour préserver le LEFT JOIN.',
    proTipEn: 'Filtering right-table columns in WHERE converts a LEFT JOIN into an INNER JOIN. Place conditional filters inside the ON clause instead.',
  },
  {
    id: 'right-join',
    termFr: 'RIGHT (OUTER) JOIN (Jointure externe droite)',
    termEn: 'RIGHT (OUTER) JOIN',
    category: 6,
    categoryNameFr: 'Jointures (Joins) et Combinaisons',
    categoryNameEn: 'Joins & Set Operations',
    shortDefFr: 'Retourne toutes les lignes de la table de droite, accompagnées des correspondances de la table de gauche, ou de NULL en cas d\'absence de correspondance.',
    shortDefEn: 'Returns all records from the right table, paired with matching left rows, or NULL where no match exists.',
    fullExplanationFr: 'C\'est le symétrique exact du `LEFT JOIN`. Dans la pratique professionnelle, les développeurs et analystes privilégient quasi-exclusivement le `LEFT JOIN` (en réordonnant simplement les tables dans la clause `FROM`) car il se lit plus naturellement de gauche à droite.',
    fullExplanationEn: 'The mirrored equivalent of LEFT JOIN. Most engineering style guides favor rewriting queries with LEFT JOIN for natural left-to-right cognitive flow.',
    codeSnippet: `SELECT 
  c.nom AS nom_client,
  cmd.commande_id,
  cmd.montant
FROM clients c
RIGHT JOIN commandes cmd 
  ON c.client_id = cmd.client_id;
-- Équivaut rigoureusement à :
-- FROM commandes cmd LEFT JOIN clients c ON c.client_id = cmd.client_id`,
    codeSnippetCommentFr: 'Jointure droite garantissant la présence de toutes les commandes.',
    codeSnippetCommentEn: 'Right join ensuring all orders are preserved regardless of client presence.',
    dialects: {
      universal: true,
      specialNoteFr: 'Règle de style courante : préférez réécrire avec `LEFT JOIN` pour améliorer la lisibilité du code SQL dans les projets d\'équipe.',
    },
    crossReferences: [
      { id: 'left-join', labelFr: 'LEFT JOIN', labelEn: 'LEFT JOIN' },
      { id: 'inner-join', labelFr: 'INNER JOIN', labelEn: 'INNER JOIN' },
    ],
    tags: ['Jointure externe', 'RIGHT JOIN', 'Symétrie'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
  },
  {
    id: 'full-join',
    termFr: 'FULL (OUTER) JOIN (Jointure externe totale)',
    termEn: 'FULL (OUTER) JOIN',
    category: 6,
    categoryNameFr: 'Jointures (Joins) et Combinaisons',
    categoryNameEn: 'Joins & Set Operations',
    shortDefFr: 'Retourne toutes les lignes dès lors qu\'il existe une correspondance dans l\'une ou l\'autre des tables. Les colonnes sans correspondance reçoivent la valeur NULL.',
    shortDefEn: 'Returns all rows when there is a match in either the left or right table, filling missing attributes with NULLs.',
    fullExplanationFr: 'Combine le résultat d\'un `LEFT JOIN` et d\'un `RIGHT JOIN`. Très utile en réconciliation de données comptables ou de stocks pour repérer les écarts bilatéraux (lignes présentes à gauche mais pas à droite, et inversement).',
    fullExplanationEn: 'Merges LEFT and RIGHT outer joins. Highly valued in financial reconciliation and data audits to uncover bilateral discrepancies.',
    codeSnippet: `-- Syntaxe standard ANSI (Postgres, Oracle, SQL Server) :
SELECT 
  c.nom AS client,
  cmd.commande_id,
  cmd.montant
FROM clients c
FULL OUTER JOIN commandes cmd 
  ON c.client_id = cmd.client_id;

-- Émulation sous MySQL (qui ne supporte pas FULL OUTER JOIN nativement) :
SELECT c.nom, cmd.commande_id, cmd.montant
FROM clients c LEFT JOIN commandes cmd ON c.client_id = cmd.client_id
UNION
SELECT c.nom, cmd.commande_id, cmd.montant
FROM clients c RIGHT JOIN commandes cmd ON c.client_id = cmd.client_id;`,
    codeSnippetCommentFr: 'Syntaxe standard ANSI et émulation via UNION sous MySQL.',
    codeSnippetCommentEn: 'Standard ANSI FULL JOIN contrasted with MySQL UNION workaround.',
    dialects: {
      universal: false,
      postgres: 'Support natif complet de `FULL OUTER JOIN`.',
      oracle: 'Support natif complet de `FULL OUTER JOIN`.',
      sqlServer: 'Support natif complet de `FULL OUTER JOIN`.',
      mysql: 'MySQL NE SUPPORTE PAS la syntaxe FULL OUTER JOIN ! Il est obligatoire de l\'émuler en combinant un `LEFT JOIN` et un `RIGHT JOIN` reliés par un opérateur `UNION`.',
      specialNoteFr: 'Point clé d\'examen et d\'entretien : MySQL est le seul grand SGBD à ne pas supporter directement FULL OUTER JOIN.',
    },
    crossReferences: [
      { id: 'left-join', labelFr: 'LEFT JOIN', labelEn: 'LEFT JOIN' },
      { id: 'right-join', labelFr: 'RIGHT JOIN', labelEn: 'RIGHT JOIN' },
      { id: 'union', labelFr: 'UNION', labelEn: 'UNION' },
    ],
    tags: ['FULL JOIN', 'Réconciliation', 'Écarts', 'MySQL Workaround'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
    proTipFr: 'Pour isoler uniquement les enregistrements non appariés des deux côtés (différence symétrique), ajoutez : `WHERE tableA.id IS NULL OR tableB.id IS NULL`.',
    proTipEn: 'Add `WHERE tableA.id IS NULL OR tableB.id IS NULL` to isolate only mismatched records on either side.',
  },
  {
    id: 'cross-join',
    termFr: 'CROSS JOIN (Produit cartésien)',
    termEn: 'CROSS JOIN (Cartesian Product)',
    category: 6,
    categoryNameFr: 'Jointures (Joins) et Combinaisons',
    categoryNameEn: 'Joins & Set Operations',
    shortDefFr: 'Produit le produit cartésien de deux tables, en combinant chaque ligne de la table A avec chaque ligne de la table B sans condition de jointure.',
    shortDefEn: 'Produces the Cartesian product of two tables, matching every row from table A with every row from table B.',
    fullExplanationFr: 'Si la table A compte $M$ lignes et la table B compte $N$ lignes, le résultat comportera exactement $M \times N$ lignes. Utilisé délibérément pour générer des matrices (ex: toutes les tailles $\times$ toutes les couleurs d\'un vêtement, ou calendrier de dates $\times$ liste d\'employés).',
    fullExplanationEn: 'Outputs M x N rows. Used intentionally to generate multidimensional grids (e.g. all product colors x all sizes, or dates x stores).',
    codeSnippet: `SELECT 
  c.nom_couleur,
  t.nom_taille,
  CONCAT('Article - ', c.nom_couleur, ' / ', t.nom_taille) AS declinaison
FROM couleurs c
CROSS JOIN tailles t;
-- Si 5 couleurs et 4 tailles = 20 lignes générées automatiquement`,
    codeSnippetCommentFr: 'Génération de toutes les déclinaisons possibles d\'un catalogue.',
    codeSnippetCommentEn: 'Generating combinations of product attributes via Cartesian product.',
    dialects: {
      universal: true,
      postgres: 'Supporte `CROSS JOIN`.',
      mysql: 'Sous MySQL, `CROSS JOIN`, `JOIN` et `INNER JOIN` sans clause `ON` sont syntaxiquement synonymes.',
      oracle: 'Supporte `CROSS JOIN`.',
      sqlServer: 'Supporte `CROSS JOIN`.',
    },
    crossReferences: [
      { id: 'inner-join', labelFr: 'INNER JOIN', labelEn: 'INNER JOIN' },
      { id: 'table', labelFr: 'Table', labelEn: 'Table' },
    ],
    tags: ['Produit cartésien', 'Combinaison', 'Matrice', 'Multiplication'],
    difficulty: 'intermediate',
    audience: ['developer', 'data_analyst'],
    proTipFr: 'Gare aux erreurs d\'inadvertance : oublier la clause `ON` dans un `JOIN` traditionnel génère un produit cartésien accidentel qui peut figer votre serveur de base de données en saturant la RAM !',
    proTipEn: 'Omitting a join predicate unintentionally triggers a massive Cartesian explosion that can exhaust server memory.',
  },
  {
    id: 'union',
    termFr: 'UNION',
    termEn: 'UNION',
    category: 6,
    categoryNameFr: 'Jointures (Joins) et Combinaisons',
    categoryNameEn: 'Joins & Set Operations',
    shortDefFr: 'Combine verticalement les résultats de deux requêtes SELECT en éliminant automatiquement tous les doublons.',
    shortDefEn: 'Vertically combines result sets from two queries, automatically filtering out duplicate rows.',
    fullExplanationFr: 'Contrairement aux jointures qui combinent des tables horizontalement (colonnes côte à côte), `UNION` empile les lignes les unes sous les autres. Conditions impératives : les deux requêtes doivent projeter exactement le même nombre de colonnes et ces colonnes doivent avoir des types de données compatibles dans le même ordre.',
    fullExplanationEn: 'Stacks rows vertically. Both queries must project the identical number of columns with compatible data types in matching positional order.',
    codeSnippet: `-- Liste consolidée et dédoublonnée des contacts
SELECT email, 'Client' AS source FROM clients WHERE actif = TRUE
UNION
SELECT email, 'Fournisseur' AS source FROM fournisseurs WHERE actif = TRUE
ORDER BY email;`,
    codeSnippetCommentFr: 'Consolidation de deux tables avec suppression automatique des doublons.',
    codeSnippetCommentEn: 'Vertical combination deduplicating email contacts across two tables.',
    dialects: {
      universal: true,
      specialNoteFr: 'Pour trier le résultat d\'un UNION, la clause `ORDER BY` doit impérativement être placée tout à la fin de la dernière requête et utiliser les noms de colonnes de la première requête.',
    },
    crossReferences: [
      { id: 'union-all', labelFr: 'UNION ALL', labelEn: 'UNION ALL' },
      { id: 'distinct', labelFr: 'DISTINCT', labelEn: 'DISTINCT' },
    ],
    tags: ['Ensembles', 'UNION', 'Dédoublonnage', 'Empilement'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: '`UNION` effectue un tri coûteux en mémoire pour dédoublonner. Si vous savez avec certitude que vos deux jeux de données sont disjoints, utilisez TOUJOURS `UNION ALL` pour de bien meilleures performances.',
    proTipEn: 'UNION triggers expensive sort-based deduplication. Use UNION ALL whenever sets are already mutually disjoint.',
  },
  {
    id: 'union-all',
    termFr: 'UNION ALL',
    termEn: 'UNION ALL',
    category: 6,
    categoryNameFr: 'Jointures (Joins) et Combinaisons',
    categoryNameEn: 'Joins & Set Operations',
    shortDefFr: 'Combine verticalement les résultats de deux requêtes SELECT SANS éliminer les doublons, conservant toutes les lignes.',
    shortDefEn: 'Vertically concatenates two result sets without deduplication, preserving all rows and duplicates.',
    fullExplanationFr: 'Beaucoup plus rapide qu\'un `UNION` simple, car le moteur se contente de concaténer les flux de données sans exécuter d\'opération de tri ou de hachage en mémoire. C\'est le choix par défaut à privilégier pour les requêtes analytiques et les tables partitionnées.',
    fullExplanationEn: 'Drastically faster than UNION because it bypasses in-memory sorting and hashing. Ideal for partition unioning and high-throughput ELT.',
    codeSnippet: `-- Agrégation rapide de données historiques et actives
SELECT transaction_id, montant, date_transac FROM transactions_2023
UNION ALL
SELECT transaction_id, montant, date_transac FROM transactions_2024;`,
    codeSnippetCommentFr: 'Concaténation immédiate de tables annuelles volumineuses sans tri.',
    codeSnippetCommentEn: 'High-speed vertical concatenation of partition tables without sort overhead.',
    dialects: {
      universal: true,
      specialNoteFr: 'Recommandé systématiquement dans les vues partitionnées ou les pipelines de données.',
    },
    crossReferences: [
      { id: 'union', labelFr: 'UNION', labelEn: 'UNION' },
      { id: 'distinct', labelFr: 'DISTINCT', labelEn: 'DISTINCT' },
    ],
    tags: ['Ensembles', 'Performance', 'UNION ALL', 'Concaténation'],
    difficulty: 'beginner',
    audience: ['beginner', 'developer', 'data_analyst'],
    proTipFr: 'Règle d\'or de performance : utilisez `UNION ALL` par défaut, sauf si le dédoublonnage métier des lignes est expressément requis par votre spécification.',
    proTipEn: 'Default to UNION ALL unless business requirements explicitly necessitate duplicate removal.',
  },
];
