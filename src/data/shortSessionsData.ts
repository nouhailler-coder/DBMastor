import { TargetedSessionQuestion, TargetedSessionPayload } from '../types';
import { UserCompetency } from '../services/competencyService';

export type ShortSessionMode = 'quick_5min' | 'training_30min';

export interface ShortSessionConfig {
  mode: ShortSessionMode;
  kickerFr: string;
  kickerEn: string;
  title: string;
  questionsCount: number;
  durationMinutes: number;
  bullet1Fr: string;
  bullet1En: string;
  bullet2Fr: string;
  bullet2En: string;
  bullet3Fr: string;
  bullet3En: string;
  ctaFr: string;
  ctaEn: string;
}

export const SHORT_SESSION_CONFIGS: Record<ShortSessionMode, ShortSessionConfig> = {
  quick_5min: {
    mode: 'quick_5min',
    kickerFr: '« J\'ai 5 minutes »',
    kickerEn: '"I have 5 minutes"',
    title: '⚡ Quick Training',
    questionsCount: 5,
    durationMinutes: 5,
    bullet1Fr: '5 questions',
    bullet1En: '5 questions',
    bullet2Fr: '5 minutes',
    bullet2En: '5 minutes',
    bullet3Fr: 'Notions faibles uniquement',
    bullet3En: 'Weak concepts only',
    ctaFr: 'Commencer',
    ctaEn: 'Start',
  },
  training_30min: {
    mode: 'training_30min',
    kickerFr: '« J\'ai 30 minutes »',
    kickerEn: '"I have 30 minutes"',
    title: '🎯 Training Session',
    questionsCount: 20,
    durationMinutes: 30,
    bullet1Fr: '20 questions',
    bullet1En: '20 questions',
    bullet2Fr: 'Difficulté progressive',
    bullet2En: 'Progressive difficulty',
    bullet3Fr: 'Adaptée à mon niveau',
    bullet3En: 'Adapted to my level',
    ctaFr: 'Commencer',
    ctaEn: 'Start',
  },
};

export function getShortSessionQuestionsCatalog(isFr: boolean): TargetedSessionQuestion[] {
  return [
    // =====================================================
    // PALIER 1 : NIVEAU 1 — FONDAMENTAL (Questions 1 à 6)
    // =====================================================
    {
      id: 'ss-q01-join-weak',
      index: 1,
      topicId: 'join',
      topicName: 'JOIN',
      difficulty: 'easy',
      difficultyLabel: isFr ? 'Niveau 1 — Fondamental (Notion faible)' : 'Level 1 — Fundamental (Weak concept)',
      prompt: isFr
        ? 'Vous souhaitez lister tous les départements de la table DEPARTMENTS, y compris ceux qui ne comptent aucun employé dans la table EMPLOYEES. Quelle jointure devez-vous écrire ?'
        : 'You want to list all departments from DEPARTMENTS, including those with no employees in EMPLOYEES. Which join should you write?',
      codeSnippet: `SELECT d.department_name, COUNT(e.employee_id) AS emp_count
FROM departments d
/* VOTRE JOINTURE ICI */
GROUP BY d.department_name;`,
      options: [
        { id: 'A', letter: 'A', text: 'INNER JOIN employees e ON d.department_id = e.department_id' },
        { id: 'B', letter: 'B', text: 'LEFT OUTER JOIN employees e ON d.department_id = e.department_id' },
        { id: 'C', letter: 'C', text: 'RIGHT OUTER JOIN employees e ON d.department_id = e.department_id' },
        { id: 'D', letter: 'D', text: 'CROSS JOIN employees e' },
      ],
      correctOptionId: 'B',
      explanation: isFr
        ? 'LEFT OUTER JOIN conserve l\'intégralité des lignes de la table de gauche (DEPARTMENTS). Pour un département sans employé, e.employee_id vaut NULL et COUNT(e.employee_id) retourne 0.'
        : 'LEFT OUTER JOIN preserves all rows from the left table (DEPARTMENTS). Unmatched rows have NULL employee_id and COUNT(e.employee_id) returns 0.',
      keyTakeaway: isFr
        ? '💡 À retenir : Table principale à gauche + conserver les lignes sans correspondance = LEFT OUTER JOIN.'
        : '💡 Key Takeaway: Main table on left + keep unmatched rows = LEFT OUTER JOIN.',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'JOIN',
        difficulty: 2,
        trap: 'LEFT vs INNER JOIN',
        concepts: ['LEFT JOIN', 'COUNT(col)', 'NULL'],
        estimatedTime: 35,
      },
    },
    {
      id: 'ss-q02-subq-weak',
      index: 2,
      topicId: 'subqueries',
      topicName: 'Subqueries',
      difficulty: 'easy',
      difficultyLabel: isFr ? 'Niveau 1 — Fondamental (Notion faible)' : 'Level 1 — Fundamental (Weak concept)',
      prompt: isFr
        ? 'On souhaite afficher les employés dont le salaire est strictement supérieur au salaire moyen de toute l\'entreprise. Quelle requête est valide ?'
        : 'You want to display employees whose salary is strictly greater than the company-wide average salary. Which query is valid?',
      codeSnippet: `SELECT first_name, last_name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'WHERE salary > AVG(salary)' : 'WHERE salary > AVG(salary)' },
        { id: 'B', letter: 'B', text: isFr ? 'WHERE salary > (SELECT AVG(salary) FROM employees)' : 'WHERE salary > (SELECT AVG(salary) FROM employees)' },
        { id: 'C', letter: 'C', text: isFr ? 'HAVING salary > AVG(salary)' : 'HAVING salary > AVG(salary)' },
        { id: 'D', letter: 'D', text: isFr ? 'GROUP BY salary HAVING salary > AVG(salary)' : 'GROUP BY salary HAVING salary > AVG(salary)' },
      ],
      correctOptionId: 'B',
      explanation: isFr
        ? 'Une fonction d\'agrégation (AVG) ne peut pas figurer directement dans une clause WHERE. Une sous-requête scalaire (SELECT AVG(salary) FROM employees) calcule d\'abord la moyenne unique pour la comparer à chaque ligne.'
        : 'An aggregate function (AVG) cannot appear directly in a WHERE clause. A scalar subquery computes the single average value first.',
      keyTakeaway: isFr
        ? '💡 À retenir : Comparer une ligne à une moyenne globale dans WHERE exige une sous-requête scalaire.'
        : '💡 Key Takeaway: Comparing a row against a global average in WHERE requires a scalar subquery.',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'Subqueries',
        difficulty: 2,
        trap: 'Sous-requête scalaire vs Agrégat dans WHERE',
        concepts: ['Subqueries', 'AVG', 'WHERE'],
        estimatedTime: 35,
      },
    },
    {
      id: 'ss-q03-idx-weak',
      index: 3,
      topicId: 'indexes',
      topicName: 'Indexes',
      difficulty: 'easy',
      difficultyLabel: isFr ? 'Niveau 1 — Fondamental (Notion faible)' : 'Level 1 — Fundamental (Weak concept)',
      prompt: isFr
        ? 'Lorsqu\'vous déclarez une contrainte PRIMARY KEY sur la colonne EMPLOYEE_ID lors d\'un CREATE TABLE, quelle action l\'optimiseur SGBD effectue-t-il automatiquement ?'
        : 'When you declare a PRIMARY KEY constraint on EMPLOYEE_ID during CREATE TABLE, what does the RDBMS automatically perform?',
      codeSnippet: `CREATE TABLE employees (
  employee_id NUMBER(6) CONSTRAINT emp_pk PRIMARY KEY,
  last_name   VARCHAR2(25) NOT NULL
);`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'Il crée automatiquement un index B-Tree UNIQUE sur la colonne employee_id.' : 'It automatically creates a UNIQUE B-Tree index on employee_id.' },
        { id: 'B', letter: 'B', text: isFr ? 'Il crée un index Bitmap compressé sur toutes les colonnes de la table.' : 'It creates a compressed Bitmap index on all columns.' },
        { id: 'C', letter: 'C', text: isFr ? 'Aucun index n\'est créé tant que l\'administrateur n\'exécute pas CREATE INDEX.' : 'No index is created until the DBA runs CREATE INDEX.' },
        { id: 'D', letter: 'D', text: isFr ? 'Il partitionne automatiquement la table par hachage.' : 'It automatically hash-partitions the table.' },
      ],
      correctOptionId: 'A',
      explanation: isFr
        ? 'Pour garantir l\'unicité et accélérer les jointures sur la clé primaire, les SGBD (Oracle, PostgreSQL, MySQL, SQL Server) créent automatiquement un index B-Tree unique (sauf si un index existe déjà sur cette colonne).'
        : 'To enforce uniqueness and speed up primary key lookups, RDBMS engines automatically create a unique B-Tree index.',
      keyTakeaway: isFr
        ? '💡 À retenir : PRIMARY KEY ou UNIQUE = création implicite d\'un index B-Tree unique.'
        : '💡 Key Takeaway: PRIMARY KEY or UNIQUE = implicit Unique B-Tree index creation.',
      trapMetadata: {
        topic: 'Administration',
        subtopic: 'Indexes',
        difficulty: 2,
        trap: 'Index implicite sur PRIMARY KEY / UNIQUE',
        concepts: ['B-Tree', 'PRIMARY KEY', 'UNIQUE'],
        estimatedTime: 30,
      },
    },
    {
      id: 'ss-q04-groupby',
      index: 4,
      topicId: 'groupby',
      topicName: 'GROUP BY & HAVING',
      difficulty: 'easy',
      difficultyLabel: isFr ? 'Niveau 1 — Fondamental' : 'Level 1 — Fundamental',
      prompt: isFr
        ? 'Quelle est la différence fondamentale entre COUNT(*) et COUNT(commission_pct) sur la table EMPLOYEES ?'
        : 'What is the core difference between COUNT(*) and COUNT(commission_pct) on the EMPLOYEES table?',
      codeSnippet: `SELECT COUNT(*) AS total_rows,
       COUNT(commission_pct) AS with_comm
FROM employees;`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'Aucune différence, les deux retournent toujours le même entier.' : 'No difference, both always return the exact same integer.' },
        { id: 'B', letter: 'B', text: isFr ? 'COUNT(*) compte toutes les lignes (y compris NULL), tandis que COUNT(commission_pct) ignore les valeurs NULL.' : 'COUNT(*) counts all rows including NULLs, whereas COUNT(commission_pct) ignores NULL values.' },
        { id: 'C', letter: 'C', text: isFr ? 'COUNT(commission_pct) élimine automatiquement les doublons comme DISTINCT.' : 'COUNT(commission_pct) automatically removes duplicates like DISTINCT.' },
        { id: 'D', letter: 'D', text: isFr ? 'COUNT(*) génère une erreur si une ligne contient uniquement des NULL.' : 'COUNT(*) raises an error if a row has NULLs.' },
      ],
      correctOptionId: 'B',
      explanation: isFr
        ? 'Toutes les fonctions d\'agrégation SQL (SUM, AVG, MIN, MAX, COUNT(colonne)) ignorent les valeurs NULL, à la seule exception de COUNT(*) qui compte le nombre physique de lignes.'
        : 'All SQL aggregate functions ignore NULL values except COUNT(*), which counts total rows.',
      keyTakeaway: isFr
        ? '💡 À retenir : COUNT(*) = toutes les lignes | COUNT(col) = lignes où col IS NOT NULL.'
        : '💡 Key Takeaway: COUNT(*) = all rows | COUNT(col) = non-NULL rows only.',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'GROUP BY',
        difficulty: 1,
        trap: 'COUNT(*) vs COUNT(colonne)',
        concepts: ['COUNT', 'NULL', 'Aggregates'],
        estimatedTime: 25,
      },
    },
    {
      id: 'ss-q05-where-null',
      index: 5,
      topicId: 'select',
      topicName: 'Logique 3VL & NULL',
      difficulty: 'easy',
      difficultyLabel: isFr ? 'Niveau 1 — Fondamental' : 'Level 1 — Fundamental',
      prompt: isFr
        ? 'Que retourne la requête suivante si 35 employés ont la valeur NULL dans la colonne COMMISSION_PCT ?'
        : 'What does the following query return if 35 employees have NULL in COMMISSION_PCT?',
      codeSnippet: `SELECT employee_id, last_name
FROM employees
WHERE commission_pct = NULL;`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'Les 35 employés sans commission.' : 'The 35 employees without commission.' },
        { id: 'B', letter: 'B', text: isFr ? 'Aucune ligne (0 ligne retournée), car toute comparaison avec = NULL vaut UNKNOWN.' : 'Zero rows (0 rows returned), because any comparison with = NULL evaluates to UNKNOWN.' },
        { id: 'C', letter: 'C', text: isFr ? 'Une erreur de syntaxe ORA-00936.' : 'A syntax error ORA-00936.' },
        { id: 'D', letter: 'D', text: isFr ? 'Tous les employés de la table.' : 'All employees in the table.' },
      ],
      correctOptionId: 'B',
      explanation: isFr
        ? 'En SQL (logique ternaire 3VL), `commission_pct = NULL` ou `!= NULL` ne retourne jamais TRUE mais UNKNOWN. La clause WHERE ne conserve que les lignes où le prédicat est TRUE. Il faut obligatoirement utiliser `IS NULL`.'
        : 'In three-valued logic (3VL), `= NULL` evaluates to UNKNOWN, not TRUE. Use `IS NULL` instead.',
      keyTakeaway: isFr
        ? '💡 À retenir : Jamais `= NULL` ni `<> NULL` ! Toujours `IS NULL` ou `IS NOT NULL`.'
        : '💡 Key Takeaway: Never use `= NULL`! Always use `IS NULL` or `IS NOT NULL`.',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'SELECT',
        difficulty: 1,
        trap: 'Comparaison = NULL vs IS NULL',
        concepts: ['NULL', '3VL', 'WHERE'],
        estimatedTime: 25,
      },
    },
    {
      id: 'ss-q06-order-alias',
      index: 6,
      topicId: 'select',
      topicName: 'Ordre d\'Exécution SQL',
      difficulty: 'easy',
      difficultyLabel: isFr ? 'Niveau 1 — Fondamental' : 'Level 1 — Fundamental',
      prompt: isFr
        ? 'Dans quelle clause d\'une même requête SELECT pouvez-vous référencer directement un alias de colonne défini dans la liste SELECT ?'
        : 'In which clause of the same SELECT query can you directly reference a column alias defined in the SELECT list?',
      codeSnippet: `SELECT employee_id, salary * 12 AS annual_salary
FROM employees
/* OÙ PEUT-ON UTILISER annual_salary ? */`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'Uniquement dans la clause ORDER BY.' : 'Only in the ORDER BY clause.' },
        { id: 'B', letter: 'B', text: isFr ? 'Dans la clause WHERE et la clause ORDER BY.' : 'In both WHERE and ORDER BY clauses.' },
        { id: 'C', letter: 'C', text: isFr ? 'Dans la clause GROUP BY et HAVING en standard ANSI strict.' : 'In GROUP BY and HAVING under strict ANSI SQL.' },
        { id: 'D', letter: 'D', text: isFr ? 'Dans la clause ON d\'une jointure.' : 'In the ON clause of a join.' },
      ],
      correctOptionId: 'A',
      explanation: isFr
        ? 'L\'ordre logique d\'évaluation SQL est : 1. FROM/JOIN → 2. WHERE → 3. GROUP BY → 4. HAVING → 5. SELECT (création des alias) → 6. ORDER BY. Seule la clause ORDER BY est exécutée après SELECT.'
        : 'Logical SQL evaluation order is: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. Only ORDER BY runs after SELECT.',
      keyTakeaway: isFr
        ? '💡 À retenir : Les alias du SELECT n\'existent qu\'à partir de l\'étape 5 → utilisables dans ORDER BY.'
        : '💡 Key Takeaway: SELECT aliases only exist at step 5 → usable in ORDER BY.',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'SELECT',
        difficulty: 2,
        trap: 'Visibilité des alias dans WHERE vs ORDER BY',
        concepts: ['Alias', 'ORDER BY', 'WHERE'],
        estimatedTime: 30,
      },
    },

    // =====================================================
    // PALIER 2 : NIVEAU 2 — INTERMÉDIAIRE (Questions 7 à 14)
    // =====================================================
    {
      id: 'ss-q07-join-on-vs-where-weak',
      index: 7,
      topicId: 'join',
      topicName: 'JOIN',
      difficulty: 'intermediate',
      difficultyLabel: isFr ? 'Niveau 2 — Intermédiaire (Notion faible)' : 'Level 2 — Intermediate (Weak concept)',
      prompt: isFr
        ? 'Examinez ces deux requêtes utilisant un LEFT JOIN. Pourquoi la Requête 2 perd-elle les départements sans employé gagnant plus de 10 000 € ?'
        : 'Examine these two LEFT JOIN queries. Why does Query 2 lose departments that have no employee earning over 10,000?',
      codeSnippet: `-- Requête 1 :
SELECT d.department_name, e.last_name
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id AND e.salary > 10000;

-- Requête 2 :
SELECT d.department_name, e.last_name
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
WHERE e.salary > 10000;`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'Dans la Requête 2, `WHERE e.salary > 10000` s\'applique APRÈS la jointure et élimine les lignes où `e.salary` est NULL, transformant le LEFT JOIN en INNER JOIN.' : 'In Query 2, `WHERE e.salary > 10000` runs AFTER the join and filters out NULL `e.salary` rows, turning the LEFT JOIN into an INNER JOIN.' },
        { id: 'B', letter: 'B', text: isFr ? 'La clause ON ne supporte pas l\'opérateur AND en SQL ANSI.' : 'The ON clause does not support the AND operator in ANSI SQL.' },
        { id: 'C', letter: 'C', text: isFr ? 'Les deux requêtes retournent exactement le même jeu de résultats.' : 'Both queries return the exact same result set.' },
        { id: 'D', letter: 'D', text: isFr ? 'La Requête 1 produit un produit cartésien.' : 'Query 1 produces a Cartesian product.' },
      ],
      correctOptionId: 'A',
      explanation: isFr
        ? 'C\'est le piège n°1 sur les jointures externes : placer une condition sur la table de droite dans `WHERE` (sauf `IS NULL`) élimine toutes les lignes complétées par des `NULL` lors du `LEFT JOIN`, annulant l\'effet externe.'
        : 'Filtering the right-hand table in `WHERE` rejects the `NULL`-padded rows produced by `LEFT JOIN`, effectively converting it into an `INNER JOIN`.',
      keyTakeaway: isFr
        ? '💡 À retenir : Dans un LEFT JOIN, filtrez la table de droite dans `ON` pour garder toutes les lignes de gauche.'
        : '💡 Key Takeaway: In a LEFT JOIN, filter the right table inside `ON` to preserve unmatched left rows.',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'JOIN',
        difficulty: 3,
        trap: 'Filtre dans ON vs WHERE sur LEFT JOIN',
        concepts: ['LEFT JOIN', 'ON vs WHERE', 'NULL'],
        estimatedTime: 45,
      },
    },
    {
      id: 'ss-q08-subq-notin-null-weak',
      index: 8,
      topicId: 'subqueries',
      topicName: 'Subqueries',
      difficulty: 'intermediate',
      difficultyLabel: isFr ? 'Niveau 2 — Intermédiaire (Notion faible)' : 'Level 2 — Intermediate (Weak concept)',
      prompt: isFr
        ? 'On cherche les employés qui ne sont managers d\'aucun employé. Dans la table EMPLOYEES, le PDG a `manager_id = NULL`. Que retourne cette requête ?'
        : 'You want to find employees who do not manage anyone. In EMPLOYEES, the CEO has `manager_id = NULL`. What does this query return?',
      codeSnippet: `SELECT employee_id, last_name
FROM employees
WHERE employee_id NOT IN (SELECT manager_id FROM employees);`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'Tous les employés qui ne dirigent personne.' : 'All employees who do not manage anyone.' },
        { id: 'B', letter: 'B', text: isFr ? 'Aucune ligne (0 ligne retournée) car la sous-requête contient au moins une valeur NULL.' : 'Zero rows (0 rows returned) because the subquery returns at least one NULL value.' },
        { id: 'C', letter: 'C', text: isFr ? 'Uniquement le PDG.' : 'Only the CEO.' },
        { id: 'D', letter: 'D', text: isFr ? 'Une erreur ORA-01427 (single-row subquery returns more than one row).' : 'An ORA-01427 error.' },
      ],
      correctOptionId: 'B',
      explanation: isFr
        ? '`x NOT IN (100, 101, NULL)` équivaut à `x != 100 AND x != 101 AND x != NULL`. Or `x != NULL` vaut toujours `UNKNOWN`, et `TRUE AND UNKNOWN` vaut `UNKNOWN`. Aucune ligne ne passe le `WHERE` ! Utilisez `NOT EXISTS` ou ajoutez `WHERE manager_id IS NOT NULL` dans la sous-requête.'
        : '`x NOT IN (..., NULL)` expands to `AND x != NULL`, which is always UNKNOWN. Thus 0 rows are returned. Always use `NOT EXISTS` or filter out NULLs.',
      keyTakeaway: isFr
        ? '💡 À retenir : `NOT IN` + un seul `NULL` dans la sous-requête = 0 ligne retournée ! Préférez `NOT EXISTS`.'
        : '💡 Key Takeaway: `NOT IN` + any `NULL` in subquery = 0 rows returned! Prefer `NOT EXISTS`.',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'Subqueries',
        difficulty: 4,
        trap: 'NOT IN avec NULL retourne 0 ligne',
        concepts: ['NOT IN', 'NULL', 'NOT EXISTS'],
        estimatedTime: 45,
      },
    },
    {
      id: 'ss-q09-idx-leftmost-weak',
      index: 9,
      topicId: 'indexes',
      topicName: 'Indexes',
      difficulty: 'intermediate',
      difficultyLabel: isFr ? 'Niveau 2 — Intermédiaire (Notion faible)' : 'Level 2 — Intermediate (Weak concept)',
      prompt: isFr
        ? 'Un index B-Tree composite est défini par : `CREATE INDEX idx_emp_comp ON employees(department_id, job_id, salary)`. Quelle clause WHERE ne peut PAS utiliser un Index Range Scan classique sur la colonne de tête ?'
        : 'A composite B-Tree index is defined as `CREATE INDEX idx_emp_comp ON employees(department_id, job_id, salary)`. Which WHERE clause CANNOT use a standard leading-column Index Range Scan?',
      codeSnippet: `-- Index composite : (department_id, job_id, salary)`,
      options: [
        { id: 'A', letter: 'A', text: 'WHERE department_id = 60 AND job_id = \'IT_PROG\'' },
        { id: 'B', letter: 'B', text: 'WHERE department_id = 90' },
        { id: 'C', letter: 'C', text: 'WHERE job_id = \'SA_REP\' AND salary > 8000' },
        { id: 'D', letter: 'D', text: 'WHERE department_id = 50 AND salary > 4000' },
      ],
      correctOptionId: 'C',
      explanation: isFr
        ? 'Selon la règle du préfixe gauche (Leftmost Prefix Rule), un index B-Tree composite `(department_id, job_id, salary)` est trié d\'abord par `department_id`. Sans `department_id` dans le prédicat (Option C), le moteur ne peut pas descendre directement l\'arbre B-Tree par sa racine.'
        : 'By the Leftmost Prefix Rule, a composite index `(department_id, job_id, salary)` is sorted first by `department_id`. Omitting `department_id` prevents a direct B-Tree Range Scan.',
      keyTakeaway: isFr
        ? '💡 À retenir : Un index composite (A, B, C) exige la colonne directrice A pour un Index Range Scan.'
        : '💡 Key Takeaway: Composite index (A, B, C) requires leading column A for an Index Range Scan.',
      trapMetadata: {
        topic: 'Administration',
        subtopic: 'Indexes',
        difficulty: 3,
        trap: 'Règle de la colonne de tête (Leftmost Prefix)',
        concepts: ['Composite Index', 'B-Tree', 'Leading Column'],
        estimatedTime: 40,
      },
    },
    {
      id: 'ss-q10-groupby-where-having',
      index: 10,
      topicId: 'groupby',
      topicName: 'GROUP BY & HAVING',
      difficulty: 'intermediate',
      difficultyLabel: isFr ? 'Niveau 2 — Intermédiaire' : 'Level 2 — Intermediate',
      prompt: isFr
        ? 'Vous devez afficher l\'identifiant du département et le salaire moyen pour les départements dont le salaire moyen dépasse 6 000 €, en excluant les employés ayant le poste `ST_CLERK`. Quelle requête est optimale ?'
        : 'You must display department_id and average salary for departments with an average salary over 6,000, excluding employees with job_id `ST_CLERK`. Which query is optimal?',
      codeSnippet: `SELECT department_id, AVG(salary)
FROM employees
WHERE job_id <> 'ST_CLERK'
GROUP BY department_id
HAVING AVG(salary) > 6000;`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'Filtrer `job_id <> \'ST_CLERK\'` dans WHERE et `AVG(salary) > 6000` dans HAVING.' : 'Filter `job_id <> \'ST_CLERK\'` in WHERE and `AVG(salary) > 6000` in HAVING.' },
        { id: 'B', letter: 'B', text: isFr ? 'Placer les deux conditions dans la clause HAVING.' : 'Place both conditions in the HAVING clause.' },
        { id: 'C', letter: 'C', text: isFr ? 'Placer les deux conditions dans la clause WHERE.' : 'Place both conditions in the WHERE clause.' },
        { id: 'D', letter: 'D', text: isFr ? 'Filtrer `AVG(salary) > 6000` dans WHERE et `job_id` dans HAVING.' : 'Filter `AVG(salary) > 6000` in WHERE and `job_id` in HAVING.' },
      ],
      correctOptionId: 'A',
      explanation: isFr
        ? 'La clause `WHERE` élimine les lignes `ST_CLERK` AVANT le regroupement (ce qui réduit le volume à agréger et modifie la moyenne du groupe), puis `HAVING` filtre les groupes calculés.'
        : '`WHERE` filters individual rows BEFORE grouping, whereas `HAVING` filters aggregated groups AFTER `GROUP BY`.',
      keyTakeaway: isFr
        ? '💡 À retenir : WHERE filtre les lignes brutes avant GROUP BY ; HAVING filtre les agrégats après GROUP BY.'
        : '💡 Key Takeaway: WHERE filters raw rows before GROUP BY; HAVING filters aggregates after GROUP BY.',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'GROUP BY',
        difficulty: 3,
        trap: 'WHERE vs HAVING',
        concepts: ['WHERE', 'GROUP BY', 'HAVING'],
        estimatedTime: 35,
      },
    },
    {
      id: 'ss-q11-self-join',
      index: 11,
      topicId: 'join',
      topicName: 'JOIN',
      difficulty: 'intermediate',
      difficultyLabel: isFr ? 'Niveau 2 — Intermédiaire' : 'Level 2 — Intermediate',
      prompt: isFr
        ? 'Pour afficher chaque employé avec le nom de son manager (stocké dans la même table EMPLOYEES), quelle condition d\'auto-jointure (SELF JOIN) est exacte ?'
        : 'To display each employee alongside their manager\'s name (stored in the same EMPLOYEES table), which SELF JOIN condition is accurate?',
      codeSnippet: `SELECT e.last_name AS employee, m.last_name AS manager
FROM employees e
LEFT JOIN employees m ON /* CONDITION */;`,
      options: [
        { id: 'A', letter: 'A', text: 'ON e.employee_id = m.manager_id' },
        { id: 'B', letter: 'B', text: 'ON e.manager_id = m.employee_id' },
        { id: 'C', letter: 'C', text: 'ON e.manager_id = m.manager_id' },
        { id: 'D', letter: 'D', text: 'NATURAL JOIN employees m' },
      ],
      correctOptionId: 'B',
      explanation: isFr
        ? 'Pour trouver le manager de l\'employé `e`, la clé étrangère `e.manager_id` doit pointer vers la clé primaire `m.employee_id` de l\'alias `m` représentant le manager.'
        : 'To find the manager of employee `e`, the foreign key `e.manager_id` must match the primary key `m.employee_id` of the manager alias `m`.',
      keyTakeaway: isFr
        ? '💡 À retenir : En auto-jointure Employé → Manager : `employe.manager_id = manager.employee_id`.'
        : '💡 Key Takeaway: In an Employee → Manager self-join: `emp.manager_id = mgr.employee_id`.',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'JOIN',
        difficulty: 3,
        trap: 'Inversion FK/PK dans un SELF JOIN',
        concepts: ['SELF JOIN', 'Foreign Key', 'Alias'],
        estimatedTime: 35,
      },
    },
    {
      id: 'ss-q12-set-operators',
      index: 12,
      topicId: 'select',
      topicName: 'Opérateurs Ensemblistes',
      difficulty: 'intermediate',
      difficultyLabel: isFr ? 'Niveau 2 — Intermédiaire' : 'Level 2 — Intermediate',
      prompt: isFr
        ? 'Quelle est la différence de comportement et de performance entre `UNION` et `UNION ALL` ?'
        : 'What is the behavior and performance difference between `UNION` and `UNION ALL`?',
      codeSnippet: `SELECT employee_id, job_id FROM employees
UNION ALL
SELECT employee_id, job_id FROM job_history;`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'UNION élimine les doublons (tri/hachage coûteux), tandis que UNION ALL concatène toutes les lignes sans déduplication (beaucoup plus rapide).' : 'UNION removes duplicates (costly sort/hash), whereas UNION ALL concatenates all rows without deduplication (much faster).' },
        { id: 'B', letter: 'B', text: isFr ? 'UNION ALL élimine les doublons et les valeurs NULL.' : 'UNION ALL removes duplicates and NULL values.' },
        { id: 'C', letter: 'C', text: isFr ? 'UNION autorise un nombre différent de colonnes entre les deux SELECT.' : 'UNION allows a different number of columns between the two SELECTs.' },
        { id: 'D', letter: 'D', text: isFr ? 'Il n\'y a aucune différence de plan d\'exécution.' : 'There is no difference in execution plan.' },
      ],
      correctOptionId: 'A',
      explanation: isFr
        ? '`UNION` effectue un `SORT UNIQUE` (ou Hash Unique) pour supprimer les doublons entre les deux ensembles. `UNION ALL` conserve toutes les lignes telles quelles sans coût de tri.'
        : '`UNION` performs a costly deduplication sort/hash, while `UNION ALL` streams all rows directly.',
      keyTakeaway: isFr
        ? '💡 À retenir : Utilisez toujours `UNION ALL` sauf si vous avez explicitement besoin de dédupliquer.'
        : '💡 Key Takeaway: Always prefer `UNION ALL` unless duplicate elimination is strictly required.',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'SELECT',
        difficulty: 2,
        trap: 'UNION vs UNION ALL (Coût du tri implicite)',
        concepts: ['UNION', 'UNION ALL', 'Performance'],
        estimatedTime: 30,
      },
    },
    {
      id: 'ss-q13-transactions-acid',
      index: 13,
      topicId: 'transactions',
      topicName: 'Transactions & ACID',
      difficulty: 'intermediate',
      difficultyLabel: isFr ? 'Niveau 2 — Intermédiaire' : 'Level 2 — Intermediate',
      prompt: isFr
        ? 'Une transaction exécute un `INSERT INTO orders ...`, puis un `CREATE INDEX idx_ord ON orders(order_date)`, suivi immédiatement d\'un `ROLLBACK;`. Que se passe-t-il en Oracle Database ?'
        : 'A transaction runs `INSERT INTO orders ...`, then `CREATE INDEX idx_ord ON orders(order_date)`, followed immediately by `ROLLBACK;`. What happens in Oracle Database?',
      codeSnippet: `INSERT INTO orders VALUES (501, SYSDATE, 'PENDING');
CREATE INDEX idx_ord_date ON orders(order_date);
ROLLBACK;`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'La ligne 501 et l\'index sont tous deux annulés par le ROLLBACK.' : 'Both row 501 and the index are rolled back.' },
        { id: 'B', letter: 'B', text: isFr ? 'La ligne 501 reste définitivement enregistrée car l\'instruction DDL `CREATE INDEX` déclenche un `COMMIT` implicite avant et après son exécution.' : 'Row 501 remains permanently committed because the DDL statement `CREATE INDEX` issues an implicit `COMMIT` before and after execution.' },
        { id: 'C', letter: 'C', text: isFr ? 'Le ROLLBACK supprime la ligne 501 mais conserve l\'index.' : 'ROLLBACK deletes row 501 but keeps the index.' },
        { id: 'D', letter: 'D', text: isFr ? 'Oracle génère une erreur car un DDL est interdit après un INSERT.' : 'Oracle raises an error because DDL is forbidden after INSERT.' },
      ],
      correctOptionId: 'B',
      explanation: isFr
        ? 'En Oracle, toute instruction DDL (`CREATE`, `ALTER`, `DROP`, `TRUNCATE`) émet un `COMMIT` implicite avant de s\'exécuter, puis un second `COMMIT` après. Le `ROLLBACK` suivant n\'a donc plus rien à annuler.'
        : 'In Oracle, every DDL statement issues an implicit COMMIT before and after execution, permanently committing prior DML changes.',
      keyTakeaway: isFr
        ? '💡 À retenir : En Oracle, toute commande DDL (CREATE, ALTER, DROP, TRUNCATE) provoque un COMMIT implicite !'
        : '💡 Key Takeaway: In Oracle, any DDL command triggers an automatic implicit COMMIT!',
      trapMetadata: {
        topic: 'Transactions',
        subtopic: 'ACID & DDL',
        difficulty: 3,
        trap: 'COMMIT implicite déclenché par une instruction DDL',
        concepts: ['COMMIT', 'ROLLBACK', 'DDL'],
        estimatedTime: 40,
      },
    },
    {
      id: 'ss-q14-normalisation-3nf',
      index: 14,
      topicId: 'normalisation',
      topicName: 'Modélisation & 3NF',
      difficulty: 'intermediate',
      difficultyLabel: isFr ? 'Niveau 2 — Intermédiaire' : 'Level 2 — Intermediate',
      prompt: isFr
        ? 'Dans une table `EMPLOYEES (employee_id [PK], department_id, department_name)`, tous les attributs dépendent de `employee_id`, mais `department_name` dépend directement de `department_id`. Quelle forme normale est violée ?'
        : 'In table `EMPLOYEES (employee_id [PK], department_id, department_name)`, `department_name` depends on `department_id` which depends on `employee_id`. Which normal form is violated?',
      codeSnippet: `EMPLOYEES (
  employee_id     PK,
  department_id,
  department_name  -- Dépend de department_id (non-clé)
)`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'La Première Forme Normale (1NF — atomicité).' : 'First Normal Form (1NF — atomicity).' },
        { id: 'B', letter: 'B', text: isFr ? 'La Deuxième Forme Normale (2NF — dépendance partielle).' : 'Second Normal Form (2NF — partial dependency).' },
        { id: 'C', letter: 'C', text: isFr ? 'La Troisième Forme Normale (3NF — dépendance fonctionnelle transitive entre attributs non-clés).' : 'Third Normal Form (3NF — transitive functional dependency between non-key attributes).' },
        { id: 'D', letter: 'D', text: isFr ? 'Aucune, la table est déjà en 3NF.' : 'None, the table is already in 3NF.' },
      ],
      correctOptionId: 'C',
      explanation: isFr
        ? 'Une dépendance transitive (`employee_id → department_id → department_name`) où un attribut non-clé détermine un autre attribut non-clé viole la 3ème Forme Normale (3NF).'
        : 'A transitive dependency (`PK → non-key A → non-key B`) violates Third Normal Form (3NF).',
      keyTakeaway: isFr
        ? '💡 À retenir : 1NF = Atomicité | 2NF = Toute la clé | 3NF = Rien que la clé (zéro dépendance transitive).'
        : '💡 Key Takeaway: 1NF = Atomic | 2NF = The whole key | 3NF = Nothing but the key (no transitive dependency).',
      trapMetadata: {
        topic: 'Modélisation',
        subtopic: 'Normalisation',
        difficulty: 3,
        trap: 'Confusion 2NF (partielle) vs 3NF (transitive)',
        concepts: ['2NF', '3NF', 'Dépendance Transitive'],
        estimatedTime: 40,
      },
    },

    // =====================================================
    // PALIER 3 : NIVEAU 3 — AVANCÉ & PIÈGES (Questions 15 à 20)
    // =====================================================
    {
      id: 'ss-q15-idx-function-weak',
      index: 15,
      topicId: 'indexes',
      topicName: 'Indexes',
      difficulty: 'hard',
      difficultyLabel: isFr ? 'Niveau 3 — Avancé & Piège (Notion faible)' : 'Level 3 — Advanced & Trap (Weak concept)',
      prompt: isFr
        ? 'Un index B-Tree standard existe sur `employees(last_name)`. Pourquoi la requête ci-dessous effectue-t-elle un Full Table Scan au lieu d\'utiliser l\'index, et comment y remédier ?'
        : 'A standard B-Tree index exists on `employees(last_name)`. Why does the query below perform a Full Table Scan instead of an Index Seek, and how do you fix it?',
      codeSnippet: `SELECT employee_id, first_name, last_name
FROM employees
WHERE UPPER(last_name) = 'KING';`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'La fonction `UPPER()` appliquée sur la colonne indexée neutralise l\'index B-Tree standard (prédicat non-SARGable). Il faut créer un Function-Based Index `CREATE INDEX idx_emp_up ON employees(UPPER(last_name))`.' : 'Applying `UPPER()` on the indexed column suppresses the standard B-Tree index. You must create a Function-Based Index on `UPPER(last_name)`.' },
        { id: 'B', letter: 'B', text: isFr ? 'Les chaînes en majuscules ne sont jamais indexées dans un B-Tree.' : 'Uppercase strings are never indexed in a B-Tree.' },
        { id: 'C', letter: 'C', text: isFr ? 'Il suffit d\'ajouter `ORDER BY last_name` pour forcer l\'index.' : 'Adding `ORDER BY last_name` forces the index.' },
        { id: 'D', letter: 'D', text: isFr ? 'Il faut remplacer `=` par `LIKE`.' : 'You must replace `=` with `LIKE`.' },
      ],
      correctOptionId: 'A',
      explanation: isFr
        ? 'L\'index B-Tree stocke les valeurs brutes de `last_name` (`\'King\'`), pas le résultat de `UPPER(last_name)`. Envelopper la colonne dans une fonction empêche la recherche dichotomique dans l\'arbre, sauf si on crée un index fonctionnel (Function-Based Index).'
        : 'A standard B-Tree stores raw `last_name` values, not `UPPER(last_name)`. Wrapping the column in a function prevents an index seek unless a Function-Based Index is created.',
      keyTakeaway: isFr
        ? '💡 À retenir : Fonction sur colonne indexée dans WHERE = Index neutralisé ! Créez un Function-Based Index.'
        : '💡 Key Takeaway: Function on indexed column in WHERE = Index suppressed! Use a Function-Based Index.',
      trapMetadata: {
        topic: 'Administration',
        subtopic: 'Indexes',
        difficulty: 4,
        trap: 'Suppression d\'index par fonction (Non-SARGable)',
        concepts: ['Function-Based Index', 'SARGABLE', 'Full Table Scan'],
        estimatedTime: 45,
      },
    },
    {
      id: 'ss-q16-subq-correlated-exists',
      index: 16,
      topicId: 'subqueries',
      topicName: 'Subqueries',
      difficulty: 'hard',
      difficultyLabel: isFr ? 'Niveau 3 — Avancé & Piège (Notion faible)' : 'Level 3 — Advanced & Trap (Weak concept)',
      prompt: isFr
        ? 'Dans une sous-requête corrélée utilisant l\'opérateur `EXISTS`, quel est l\'impact d\'écrire `SELECT 1` ou `SELECT NULL` au lieu de `SELECT *` dans la sous-requête ?'
        : 'In a correlated subquery using `EXISTS`, what is the impact of writing `SELECT 1` or `SELECT NULL` instead of `SELECT *` inside the subquery?',
      codeSnippet: `SELECT d.department_id, d.department_name
FROM departments d
WHERE EXISTS (
  SELECT NULL
  FROM employees e
  WHERE e.department_id = d.department_id
);`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? '`SELECT NULL` fait échouer `EXISTS` et retourne 0 ligne.' : '`SELECT NULL` causes `EXISTS` to return FALSE and 0 rows.' },
        { id: 'B', letter: 'B', text: isFr ? '`EXISTS` teste uniquement la présence d\'au moins une ligne correspondante et ignore la liste SELECT : `SELECT 1`, `SELECT *` et `SELECT NULL` retournent exactement le même résultat TRUE dès la 1ère ligne trouvée.' : '`EXISTS` only checks whether at least one matching row exists and ignores the SELECT list: `SELECT 1`, `SELECT *`, and `SELECT NULL` all return TRUE on the first match.' },
        { id: 'C', letter: 'C', text: isFr ? '`SELECT *` oblige le moteur à transférer toutes les colonnes en mémoire.' : '`SELECT *` forces the engine to materialize all columns in memory.' },
        { id: 'D', letter: 'D', text: isFr ? '`EXISTS` ne fonctionne pas avec une sous-requête corrélée.' : '`EXISTS` does not work with correlated subqueries.' },
      ],
      correctOptionId: 'B',
      explanation: isFr
        ? 'C\'est un classique de l\'examen Oracle 1Z0-071 : l\'opérateur `EXISTS` effectue un Semi-Join (arrêt dès la première ligne trouvée) et n\'évalue même pas la projection du `SELECT`. Même `SELECT NULL` retourne `TRUE` si une ligne vérifie le `WHERE` interne !'
        : '`EXISTS` performs a semi-join short-circuiting on the first matching row and completely ignores the SELECT projection—even `SELECT NULL` evaluates to TRUE!',
      keyTakeaway: isFr
        ? '💡 À retenir : `EXISTS (SELECT NULL ...)` est 100 % valide et retourne TRUE dès qu\'une ligne existe !'
        : '💡 Key Takeaway: `EXISTS (SELECT NULL ...)` is 100% valid and returns TRUE as soon as a row exists!',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'Subqueries',
        difficulty: 4,
        trap: 'EXISTS (SELECT NULL ...) en examen Oracle 1Z0-071',
        concepts: ['EXISTS', 'Semi-Join', 'Correlated Subquery'],
        estimatedTime: 50,
      },
    },
    {
      id: 'ss-q17-window-rank-vs-dense',
      index: 17,
      topicId: 'cte',
      topicName: 'Window Functions & CTE',
      difficulty: 'hard',
      difficultyLabel: isFr ? 'Niveau 3 — Avancé & Piège' : 'Level 3 — Advanced & Trap',
      prompt: isFr
        ? 'Quatre employés d\'un département ont pour salaires : `12000`, `10000`, `10000`, `9000`. Quels rangs retournent respectivement `RANK()` et `DENSE_RANK()` pour le salaire `9000` ?'
        : 'Four employees in a department have salaries: `12000`, `10000`, `10000`, `9000`. What ranks do `RANK()` and `DENSE_RANK()` assign to salary `9000`?',
      codeSnippet: `SELECT salary,
       RANK()       OVER (ORDER BY salary DESC) AS rnk,
       DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rnk
FROM employees;`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'RANK() retourne 4 (saute le rang 3 après l\'ex-aequo) et DENSE_RANK() retourne 3 (aucun trou dans la numérotation).' : 'RANK() returns 4 (skips rank 3 after the tie) and DENSE_RANK() returns 3 (no gap in numbering).' },
        { id: 'B', letter: 'B', text: isFr ? 'RANK() retourne 3 et DENSE_RANK() retourne 4.' : 'RANK() returns 3 and DENSE_RANK() returns 4.' },
        { id: 'C', letter: 'C', text: isFr ? 'Les deux retournent 4.' : 'Both return 4.' },
        { id: 'D', letter: 'D', text: isFr ? 'RANK() retourne 2 et DENSE_RANK() retourne 3.' : 'RANK() returns 2 and DENSE_RANK() returns 3.' },
      ],
      correctOptionId: 'A',
      explanation: isFr
        ? 'Avec les salaires `12000 (1er)`, `10000 (2e)`, `10000 (2e)` : `RANK()` compte le nombre de lignes précédentes et attribue `4` (`1, 2, 2, 4`), tandis que `DENSE_RANK()` attribue des rangs consécutifs sans saut : `3` (`1, 2, 2, 3`).'
        : 'For `12000, 10000, 10000, 9000`: `RANK()` produces `1, 2, 2, 4` (leaves a gap), whereas `DENSE_RANK()` produces `1, 2, 2, 3` (no gap).',
      keyTakeaway: isFr
        ? '💡 À retenir : `RANK()` = classement olympique avec saut (1, 2, 2, 4) | `DENSE_RANK()` = sans saut (1, 2, 2, 3).'
        : '💡 Key Takeaway: `RANK()` = skips after ties (1, 2, 2, 4) | `DENSE_RANK()` = consecutive (1, 2, 2, 3).',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'CTE',
        difficulty: 4,
        trap: 'RANK() vs DENSE_RANK() en cas d\'ex-aequo',
        concepts: ['RANK', 'DENSE_RANK', 'OVER()'],
        estimatedTime: 45,
      },
    },
    {
      id: 'ss-q18-natural-join-trap',
      index: 18,
      topicId: 'join',
      topicName: 'JOIN',
      difficulty: 'hard',
      difficultyLabel: isFr ? 'Niveau 3 — Avancé & Piège' : 'Level 3 — Advanced & Trap',
      prompt: isFr
        ? 'Les tables `EMPLOYEES` et `DEPARTMENTS` possèdent toutes les deux les colonnes `DEPARTMENT_ID` et `MANAGER_ID`. Que fait réellement `SELECT * FROM employees NATURAL JOIN departments` ?'
        : 'Both `EMPLOYEES` and `DEPARTMENTS` have columns named `DEPARTMENT_ID` and `MANAGER_ID`. What does `SELECT * FROM employees NATURAL JOIN departments` actually do?',
      codeSnippet: `SELECT *
FROM employees
NATURAL JOIN departments;`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'Il joint uniquement sur la clé primaire/étrangère déclarée DEPARTMENT_ID.' : 'It joins only on the declared foreign key DEPARTMENT_ID.' },
        { id: 'B', letter: 'B', text: isFr ? 'Il joint automatiquement sur TOUTES les colonnes portant le même nom (`department_id` ET `manager_id`), ne retournant que les employés dont le manager est aussi le chef du département !' : 'It automatically joins on ALL columns with matching names (`department_id` AND `manager_id`), restricting results to employees whose manager is also the department head!' },
        { id: 'C', letter: 'C', text: isFr ? 'Il génère une erreur d\'ambiguïté de colonne.' : 'It raises a column ambiguity error.' },
        { id: 'D', letter: 'D', text: isFr ? 'Il ignore les colonnes ayant des valeurs NULL dans une seule des deux tables.' : 'It ignores columns with NULLs in only one table.' },
      ],
      correctOptionId: 'B',
      explanation: isFr
        ? '`NATURAL JOIN` n\'inspecte pas les contraintes de clés étrangères : il effectue une équi-jointure aveugle sur TOUTES les colonnes homonymes (`e.department_id = d.department_id AND e.manager_id = d.manager_id`). De plus, aucun préfixe de table n\'est autorisé sur les colonnes communes.'
        : '`NATURAL JOIN` blindly joins on ALL columns sharing the same name (`department_id` AND `manager_id`), not just foreign keys.',
      keyTakeaway: isFr
        ? '💡 À retenir : `NATURAL JOIN` joint sur TOUTES les colonnes de même nom. Préférez `JOIN ... ON` ou `USING`.'
        : '💡 Key Takeaway: `NATURAL JOIN` joins on ALL identically named columns. Prefer `JOIN ... ON`.',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'JOIN',
        difficulty: 4,
        trap: 'NATURAL JOIN sur plusieurs colonnes homonymes',
        concepts: ['NATURAL JOIN', 'USING', 'Equi-Join'],
        estimatedTime: 50,
      },
    },
    {
      id: 'ss-q19-truncate-vs-delete',
      index: 19,
      topicId: 'transactions',
      topicName: 'Transactions & DDL/DML',
      difficulty: 'hard',
      difficultyLabel: isFr ? 'Niveau 3 — Avancé & Piège' : 'Level 3 — Advanced & Trap',
      prompt: isFr
        ? 'Parmi les affirmations suivantes comparant `TRUNCATE TABLE emp` et `DELETE FROM emp`, laquelle est techniquement EXACTE ?'
        : 'Which of the following statements comparing `TRUNCATE TABLE emp` and `DELETE FROM emp` is technically ACCURATE?',
      codeSnippet: `TRUNCATE TABLE temp_sales;
-- vs
DELETE FROM temp_sales;`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'TRUNCATE est une instruction DDL qui réinitialise le High Water Mark (HWM), génère un minimum d\'Undo et ne déclenche PAS les triggers ON DELETE FOR EACH ROW.' : 'TRUNCATE is a DDL statement that resets the High Water Mark (HWM), generates minimal Undo, and does NOT fire ON DELETE row-level triggers.' },
        { id: 'B', letter: 'B', text: isFr ? 'TRUNCATE accepte une clause WHERE pour filtrer les lignes à purger.' : 'TRUNCATE accepts a WHERE clause to filter rows.' },
        { id: 'C', letter: 'C', text: isFr ? 'DELETE réinitialise automatiquement l\'espace disque alloué sous le High Water Mark.' : 'DELETE automatically releases space below the High Water Mark.' },
        { id: 'D', letter: 'D', text: isFr ? 'TRUNCATE déclenche les triggers BEFORE DELETE.' : 'TRUNCATE fires BEFORE DELETE triggers.' },
      ],
      correctOptionId: 'A',
      explanation: isFr
        ? '`TRUNCATE` est une opération DDL : elle désalloue les extents au-dessus de la taille minimale, abaisse le High Water Mark (HWM), ne balaye pas les lignes une par une (pas de trigger DML par ligne) et fait un `COMMIT` implicite.'
        : '`TRUNCATE` is DDL: it resets the High Water Mark, generates minimal Undo, does not fire row-level DELETE triggers, and commits implicitly in Oracle.',
      keyTakeaway: isFr
        ? '💡 À retenir : `TRUNCATE` = DDL, HWM réinitialisé, pas de clause WHERE, pas de triggers DML, COMMIT implicite.'
        : '💡 Key Takeaway: `TRUNCATE` = DDL, resets HWM, no WHERE clause, no row triggers, implicit COMMIT.',
      trapMetadata: {
        topic: 'Transactions',
        subtopic: 'DDL vs DML',
        difficulty: 4,
        trap: 'TRUNCATE vs DELETE (Triggers & High Water Mark)',
        concepts: ['TRUNCATE', 'DELETE', 'High Water Mark'],
        estimatedTime: 45,
      },
    },
    {
      id: 'ss-q20-cte-recursive',
      index: 20,
      topicId: 'cte',
      topicName: 'Window Functions & CTE',
      difficulty: 'hard',
      difficultyLabel: isFr ? 'Niveau 3 — Avancé & Piège' : 'Level 3 — Advanced & Trap',
      prompt: isFr
        ? 'Dans une CTE récursive ANSI (`WITH org_chart (emp_id, mgr_id, lvl) AS (...)`), quelle structure est obligatoire pour éviter une erreur de syntaxe ou une boucle infinie ?'
        : 'In an ANSI recursive CTE (`WITH org_chart (emp_id, mgr_id, lvl) AS (...)`), what structure is mandatory?',
      codeSnippet: `WITH org_chart (employee_id, last_name, manager_id, lvl) AS (
  SELECT employee_id, last_name, manager_id, 1
  FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.employee_id, e.last_name, e.manager_id, o.lvl + 1
  FROM employees e
  JOIN org_chart o ON e.manager_id = o.employee_id
)
SELECT * FROM org_chart;`,
      options: [
        { id: 'A', letter: 'A', text: isFr ? 'Un membre ancre (Anchor Member) initial relié par `UNION ALL` à un membre récursif (Recursive Member) qui fait référence au nom de la CTE.' : 'An initial Anchor Member connected via `UNION ALL` to a Recursive Member referencing the CTE name.' },
        { id: 'B', letter: 'B', text: isFr ? 'Trois blocs SELECT reliés par INTERSECT.' : 'Three SELECT blocks connected by INTERSECT.' },
        { id: 'C', letter: 'C', text: isFr ? 'Une clause GROUP BY obligatoire dans le membre récursif.' : 'A mandatory GROUP BY clause inside the recursive member.' },
        { id: 'D', letter: 'D', text: isFr ? 'Une jointure externe LEFT JOIN obligatoire avec la CTE.' : 'A mandatory LEFT JOIN with the CTE.' },
      ],
      correctOptionId: 'A',
      explanation: isFr
        ? 'Une CTE récursive repose toujours sur deux branches liées par `UNION ALL` : 1) Le membre ancre (point de départ, ex: `WHERE manager_id IS NULL`), et 2) Le membre récursif qui joint la table source à la CTE elle-même jusqu\'à épuisement de la hiérarchie.'
        : 'A recursive CTE requires an Anchor Member and a Recursive Member joined by `UNION ALL`.',
      keyTakeaway: isFr
        ? '💡 À retenir : CTE Récursive = Membre Ancre + `UNION ALL` + Membre Récursif.'
        : '💡 Key Takeaway: Recursive CTE = Anchor Member + `UNION ALL` + Recursive Member.',
      trapMetadata: {
        topic: 'SQL',
        subtopic: 'CTE',
        difficulty: 5,
        trap: 'Architecture d\'une CTE Récursive (Anchor + UNION ALL)',
        concepts: ['WITH', 'Recursive CTE', 'UNION ALL'],
        estimatedTime: 50,
      },
    },
  ];
}

export function buildShortSessionPayload(
  mode: ShortSessionMode,
  lang: 'fr' | 'en',
  competencies: UserCompetency[]
): TargetedSessionPayload {
  const isFr = lang === 'fr';
  const catalog = getShortSessionQuestionsCatalog(isFr);

  if (mode === 'quick_5min') {
    // Sort competencies by lowest score to target weak notions first
    const sortedWeak = [...competencies].sort((a, b) => a.currentScore - b.currentScore);
    const topWeakIds = sortedWeak.slice(0, 3).map((c) => c.id.toLowerCase());

    // Pick 5 questions focused strictly on weak concepts (Subqueries 47%, JOIN 54%, Indexes 61%)
    const weakPool = catalog.filter(
      (q) =>
        topWeakIds.includes(q.topicId.toLowerCase()) ||
        ['join', 'subqueries', 'indexes'].includes(q.topicId.toLowerCase())
    );

    const selected5 = [
      weakPool.find((q) => q.id === 'ss-q08-subq-notin-null-weak'),
      weakPool.find((q) => q.id === 'ss-q07-join-on-vs-where-weak'),
      weakPool.find((q) => q.id === 'ss-q09-idx-leftmost-weak'),
      weakPool.find((q) => q.id === 'ss-q16-subq-correlated-exists'),
      weakPool.find((q) => q.id === 'ss-q15-idx-function-weak'),
    ]
      .filter((q): q is TargetedSessionQuestion => Boolean(q))
      .map((q, idx) => {
        const comp = competencies.find((c) => c.id.toLowerCase() === q.topicId.toLowerCase());
        const scoreTag = comp ? `${comp.currentScore} %` : '54 %';
        return {
          ...q,
          index: idx + 1,
          difficultyLabel: isFr
            ? `Notion faible : ${q.topicName} (${scoreTag})`
            : `Weak concept: ${q.topicName} (${scoreTag})`,
        };
      });

    return {
      sessionId: `quick-5m-${Date.now()}`,
      source: 'curated_engine',
      title: isFr ? '⚡ Quick Training — « J\'ai 5 minutes »' : '⚡ Quick Training — "I have 5 minutes"',
      estimatedDurationMinutes: 5,
      totalQuestions: 5,
      breakdown: [
        { topicId: 'subqueries', topicName: 'Subqueries', count: 2 },
        { topicId: 'join', topicName: 'JOIN', count: 1 },
        { topicId: 'indexes', topicName: 'Indexes', count: 2 },
      ],
      questions: selected5,
    };
  }

  // Mode 'training_30min' : 20 questions, Difficulté progressive, Adaptée à mon niveau
  const avgScore =
    competencies.length > 0
      ? Math.round(competencies.reduce((acc, c) => acc + c.currentScore, 0) / competencies.length)
      : 54;

  const progressive20 = catalog.map((q, idx) => {
    const num = idx + 1;
    let stageLabel = '';
    if (num <= 6) {
      stageLabel = isFr
        ? `Palier 1/3 • Fondamental (Adapté niv. ${avgScore} %)`
        : `Stage 1/3 • Fundamental (Level ${avgScore}%)`;
    } else if (num <= 14) {
      stageLabel = isFr
        ? `Palier 2/3 • Intermédiaire (Adapté niv. ${avgScore} %)`
        : `Stage 2/3 • Intermediate (Level ${avgScore}%)`;
    } else {
      stageLabel = isFr
        ? `Palier 3/3 • Avancé & Pièges (Adapté niv. ${avgScore} %)`
        : `Stage 3/3 • Advanced & Traps (Level ${avgScore}%)`;
    }
    return {
      ...q,
      index: num,
      difficultyLabel: stageLabel,
    };
  });

  return {
    sessionId: `training-30m-${Date.now()}`,
    source: 'curated_engine',
    title: isFr ? '🎯 Training Session — « J\'ai 30 minutes »' : '🎯 Training Session — "I have 30 minutes"',
    estimatedDurationMinutes: 30,
    totalQuestions: 20,
    breakdown: [
      { topicId: 'join', topicName: 'JOIN', count: 4 },
      { topicId: 'subqueries', topicName: 'Subqueries', count: 3 },
      { topicId: 'indexes', topicName: 'Indexes', count: 3 },
      { topicId: 'groupby', topicName: 'GROUP BY & SELECT', count: 5 },
      { topicId: 'cte', topicName: 'CTE, ACID & 3NF', count: 5 },
    ],
    questions: progressive20,
  };
}
