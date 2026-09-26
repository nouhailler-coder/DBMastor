import alasql from 'alasql';

export interface SqlQueryResult {
  success: boolean;
  columns: string[];
  rows: (string | number | null)[][];
  rawRows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
  statementType?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'OTHER';
}

export interface ValidationCriterion {
  id: string;
  labelFr: string;
  labelEn: string;
  passed: boolean;
  detailFr: string;
  detailEn: string;
}

export interface ExerciseValidation {
  score: number; // 0 to 100
  allPassed: boolean;
  criteria: ValidationCriterion[];
}

export interface SqlTrainingExercise {
  id: string;
  titleFr: string;
  titleEn: string;
  categoryFr: string;
  categoryEn: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  xp: number;
  instructionFr: string;
  instructionEn: string;
  initialSql: string;
  solutionSql: string;
  hintFr: string;
  hintEn: string;
  expectedOutputSummaryFr: string;
  expectedOutputSummaryEn: string;
  validate: (sql: string, result: SqlQueryResult) => ExerciseValidation;
}

let isInitialized = false;

// Register Oracle/PostgreSQL custom analytical functions on alasql
function registerCustomFunctions() {
  try {
    // DENSE_RANK support for window functions
    if (!(alasql as any).fn.DENSE_RANK) {
      let currentDenseRank = 1;
      let lastVal: any = null;
      (alasql as any).fn.DENSE_RANK = function(val?: any) {
        if (val !== undefined) {
          if (lastVal !== null && val !== lastVal) {
            currentDenseRank++;
          }
          lastVal = val;
        }
        return currentDenseRank;
      };
    }

    // NVL (Oracle) equivalent to COALESCE
    if (!(alasql as any).fn.NVL) {
      (alasql as any).fn.NVL = function(expr1: any, expr2: any) {
        return (expr1 !== null && expr1 !== undefined) ? expr1 : expr2;
      };
    }

    // TO_CHAR date formatter helper
    if (!(alasql as any).fn.TO_CHAR) {
      (alasql as any).fn.TO_CHAR = function(val: any) {
        return String(val ?? '');
      };
    }
  } catch (err) {
    console.warn('Could not register custom SQL functions:', err);
  }
}

export function initializeDatabase(): void {
  registerCustomFunctions();

  try {
    // Drop existing tables if re-initializing
    alasql('DROP TABLE IF EXISTS employees');
    alasql('DROP TABLE IF EXISTS departments');
    alasql('DROP TABLE IF EXISTS salaries_history');

    // 1. Table employees with realistic dataset
    // Exactly 12 in IT, 8 in HR, 24 in Sales as specifically requested!
    alasql(`
      CREATE TABLE employees (
        employee_id INT PRIMARY KEY,
        first_name STRING,
        last_name STRING,
        department STRING,
        department_id INT,
        salary INT,
        hire_date STRING
      )
    `);

    // 2. Table departments
    alasql(`
      CREATE TABLE departments (
        department_id INT PRIMARY KEY,
        department_name STRING,
        manager_id INT,
        location STRING
      )
    `);

    // Insert departments
    alasql(`INSERT INTO departments VALUES (10, 'HR', 13, 'Paris')`);
    alasql(`INSERT INTO departments VALUES (60, 'IT', 1, 'Lyon')`);
    alasql(`INSERT INTO departments VALUES (80, 'Sales', 21, 'Marseille')`);
    alasql(`INSERT INTO departments VALUES (90, 'Executive', 45, 'Paris')`);

    // Insert 12 IT employees (department = 'IT', department_id = 60)
    const itEmployees = [
      { id: 1, first: 'Thomas', last: 'Martin', sal: 6500, date: '2020-03-15' },
      { id: 2, first: 'Sarah', last: 'Bernard', sal: 7200, date: '2019-06-01' },
      { id: 3, first: 'Lucas', last: 'Dubois', sal: 5400, date: '2021-09-12' },
      { id: 4, first: 'Chloe', last: 'Robert', sal: 6100, date: '2021-02-18' },
      { id: 5, first: 'Alexandre', last: 'Richard', sal: 8000, date: '2018-11-04' },
      { id: 6, first: 'Camille', last: 'Petit', sal: 5900, date: '2022-04-20' },
      { id: 7, first: 'Maxime', last: 'Durand', sal: 6700, date: '2020-08-11' },
      { id: 8, first: 'Lea', last: 'Leroy', sal: 5200, date: '2023-01-10' },
      { id: 9, first: 'Antoine', last: 'Moreau', sal: 7500, date: '2019-01-25' },
      { id: 10, first: 'Emma', last: 'Simon', sal: 6300, date: '2021-07-30' },
      { id: 11, first: 'Hugo', last: 'Laurent', sal: 5800, date: '2022-10-05' },
      { id: 12, first: 'Manon', last: 'Lefebvre', sal: 6900, date: '2020-12-14' },
    ];
    for (const e of itEmployees) {
      alasql(
        `INSERT INTO employees VALUES (${e.id}, '${e.first}', '${e.last}', 'IT', 60, ${e.sal}, '${e.date}')`
      );
    }

    // Insert 8 HR employees (department = 'HR', department_id = 10)
    const hrEmployees = [
      { id: 13, first: 'Claire', last: 'Michel', sal: 5100, date: '2019-04-10' },
      { id: 14, first: 'Julien', last: 'Garcia', sal: 4800, date: '2021-05-19' },
      { id: 15, first: 'Ines', last: 'David', sal: 5600, date: '2018-09-01' },
      { id: 16, first: 'Nicolas', last: 'Bertrand', sal: 4500, date: '2022-02-14' },
      { id: 17, first: 'Julie', last: 'Roux', sal: 5300, date: '2020-11-20' },
      { id: 18, first: 'Romain', last: 'Vincent', sal: 4700, date: '2023-03-08' },
      { id: 19, first: 'Pauline', last: 'Fournier', sal: 5800, date: '2019-10-15' },
      { id: 20, first: 'Gabriel', last: 'Morel', sal: 4900, date: '2021-12-01' },
    ];
    for (const e of hrEmployees) {
      alasql(
        `INSERT INTO employees VALUES (${e.id}, '${e.first}', '${e.last}', 'HR', 10, ${e.sal}, '${e.date}')`
      );
    }

    // Insert 24 Sales employees (department = 'Sales', department_id = 80)
    const salesLastNames = [
      'Girard', 'Andre', 'Lefevre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'Francois',
      'Martinez', 'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guerin', 'Muller',
      'Henry', 'Roussel', 'Nicolas', 'Perrin', 'Morin', 'Mathieu', 'Clement', 'Gauthier'
    ];
    for (let i = 0; i < 24; i++) {
      const id = 21 + i;
      const sal = 3200 + ((i * 130) % 2800);
      const day = String((i % 28) + 1).padStart(2, '0');
      const month = String((i % 12) + 1).padStart(2, '0');
      alasql(
        `INSERT INTO employees VALUES (${id}, 'Sales_${i + 1}', '${salesLastNames[i]}', 'Sales', 80, ${sal}, '2022-${month}-${day}')`
      );
    }

    // Also support alias hr_employees / hr.employees for compatibility
    alasql('DROP TABLE IF EXISTS hr_employees');
    alasql('CREATE TABLE hr_employees AS SELECT * FROM employees');

    isInitialized = true;
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

/**
 * Pre-processes user query to handle SQL dialect compatibility and reserved word aliases
 */
function sanitizeQuery(rawSql: string): string {
  let query = rawSql.trim();

  // Strip trailing semicolons if multiple aren't provided
  query = query.replace(/;\s*$/, '');

  // Wrap reserved word aliases such as `AS count` or `AS group` with backticks
  query = query.replace(/\bAS\s+(count|sum|avg|min|max|order|group|by|table|select|from|where|number)\b/gi, (_match, word) => {
    return `AS \`${word}\``;
  });

  return query;
}

/**
 * Executes an arbitrary SQL query against the in-browser database engine
 */
export function executeSql(rawSql: string): SqlQueryResult {
  if (!isInitialized) {
    initializeDatabase();
  }

  const startTime = performance.now();
  const cleanedQuery = sanitizeQuery(rawSql);

  // Detect statement type
  const firstWord = cleanedQuery.split(/\s+/)[0]?.toUpperCase() || 'SELECT';
  const statementType = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP'].includes(firstWord)
    ? (firstWord as SqlQueryResult['statementType'])
    : 'OTHER';

  try {
    const rawResult = alasql(cleanedQuery);
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    // If DML/DDL return (e.g. 1 for 1 row affected)
    if (typeof rawResult === 'number') {
      return {
        success: true,
        columns: ['affected_rows'],
        rows: [[rawResult]],
        rawRows: [{ affected_rows: rawResult }],
        rowCount: rawResult,
        executionTimeMs,
        statementType
      };
    }

    // If standard array of objects from SELECT
    if (Array.isArray(rawResult)) {
      if (rawResult.length === 0) {
        return {
          success: true,
          columns: [],
          rows: [],
          rawRows: [],
          rowCount: 0,
          executionTimeMs,
          statementType
        };
      }

      const columns = Object.keys(rawResult[0]);
      const rows = rawResult.map((item) => columns.map((col) => item[col] ?? null));

      return {
        success: true,
        columns,
        rows,
        rawRows: rawResult,
        rowCount: rawResult.length,
        executionTimeMs,
        statementType
      };
    }

    return {
      success: true,
      columns: ['status'],
      rows: [['OK']],
      rawRows: [{ status: 'OK' }],
      rowCount: 1,
      executionTimeMs,
      statementType
    };
  } catch (err: any) {
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      success: false,
      columns: [],
      rows: [],
      rawRows: [],
      rowCount: 0,
      executionTimeMs,
      error: err?.message || 'Erreur d\'exécution SQL inconnue',
      statementType
    };
  }
}

/**
 * Returns all rows and columns for a given table for the Data Browser
 */
export function getTableData(tableName: string): { columns: string[]; rows: any[]; totalCount: number } {
  if (!isInitialized) {
    initializeDatabase();
  }

  try {
    const res = alasql(`SELECT * FROM ${tableName} LIMIT 100`);
    if (Array.isArray(res) && res.length > 0) {
      return {
        columns: Object.keys(res[0]),
        rows: res,
        totalCount: res.length
      };
    }
  } catch (e) {
    console.error(`Error reading table ${tableName}:`, e);
  }

  return { columns: [], rows: [], totalCount: 0 };
}

/**
 * Training Exercises Catalog (from Beginner GROUP BY to Advanced Analytic functions)
 */
export const sqlExercisesCatalog: SqlTrainingExercise[] = [
  {
    id: 'ex-group-by-count',
    titleFr: 'Décompte des effectifs par département (GROUP BY & COUNT)',
    titleEn: 'Employee Count by Department (GROUP BY & COUNT)',
    categoryFr: 'Agrégation & Regroupement',
    categoryEn: 'Aggregation & Grouping',
    level: 'Débutant',
    xp: 30,
    instructionFr: 'Écrivez une requête SQL pour compter le nombre total d\'employés pour chaque département dans la table "employees". Vous devez afficher les colonnes "department" et le nombre d\'employés ("count").',
    instructionEn: 'Write a SQL query counting the total number of employees for each department in table "employees". Output the "department" and employee "count".',
    initialSql: `-- Écrivez votre requête d'agrégation ci-dessous :
SELECT department, COUNT(*)
FROM employees
GROUP BY department;`,
    solutionSql: `SELECT department, COUNT(*) AS count
FROM employees
GROUP BY department;`,
    hintFr: 'Utilisez la fonction d\'agrégation COUNT(*) et regroupez obligatoirement les résultats avec GROUP BY department.',
    hintEn: 'Use the COUNT(*) aggregate function and group rows using GROUP BY department.',
    expectedOutputSummaryFr: '3 lignes attendues : IT (12), HR (8), Sales (24)',
    expectedOutputSummaryEn: '3 rows expected: IT (12), HR (8), Sales (24)',
    validate: (sql: string, result: SqlQueryResult): ExerciseValidation => {
      const criteria: ValidationCriterion[] = [];
      const cleanSql = sql.toUpperCase();

      // 1. Syntaxe correcte
      const hasValidSyntax = result.success && !result.error;
      criteria.push({
        id: 'syntax',
        labelFr: 'Syntaxe correcte',
        labelEn: 'Correct Syntax',
        passed: hasValidSyntax,
        detailFr: hasValidSyntax
          ? `Requête exécutée en ${result.executionTimeMs} ms sans erreur de syntaxe.`
          : `Erreur retournée par le moteur SQL : ${result.error}`,
        detailEn: hasValidSyntax
          ? `Query executed in ${result.executionTimeMs} ms with zero parser errors.`
          : `Engine error: ${result.error}`
      });

      // 2. Utilisation de GROUP BY
      const hasGroupBy = /\bGROUP\s+BY\s+DEPARTMENT\b/i.test(cleanSql);
      criteria.push({
        id: 'group_by',
        labelFr: 'GROUP BY correctement utilisé',
        labelEn: 'GROUP BY properly used',
        passed: hasGroupBy,
        detailFr: hasGroupBy
          ? 'La clause GROUP BY department est bien présente et structure l\'agrégat.'
          : 'La clause "GROUP BY department" est manquante dans votre requête.',
        detailEn: hasGroupBy
          ? 'The GROUP BY department clause is correctly present.'
          : 'The clause "GROUP BY department" is missing from your query.'
      });

      // 3. Résultat exact (3 lignes, IT=12, HR=8, Sales=24)
      let hasCorrectData = false;
      if (result.success && result.rawRows.length === 3) {
        const countsMap: Record<string, number> = {};
        for (const r of result.rawRows) {
          const dept = r.department || r.DEPARTMENT;
          // Look for count column regardless of alias or raw name
          const countVal = r.count ?? r.COUNT ?? r['COUNT(*)'] ?? r['count(*)'] ?? Object.values(r)[1];
          if (dept && countVal !== undefined) {
            countsMap[String(dept).toUpperCase()] = Number(countVal);
          }
        }

        if (countsMap['IT'] === 12 && countsMap['HR'] === 8 && countsMap['SALES'] === 24) {
          hasCorrectData = true;
        }
      }

      criteria.push({
        id: 'result_match',
        labelFr: 'Résultat correct',
        labelEn: 'Correct Result Dataset',
        passed: hasCorrectData,
        detailFr: hasCorrectData
          ? 'Toutes les valeurs correspondent exactement : IT = 12, HR = 8, Sales = 24.'
          : `Résultat non conforme : 3 départements avec respectivement 12, 8 et 24 employés sont attendus. (Reçu : ${result.rowCount} lignes).`,
        detailEn: hasCorrectData
          ? 'All rows match expected output: IT = 12, HR = 8, Sales = 24.'
          : `Result mismatch: Expected 3 rows with 12, 8, 24 counts. Received ${result.rowCount} rows.`
      });

      const passedCount = criteria.filter((c) => c.passed).length;
      const score = Math.round((passedCount / criteria.length) * 100);

      return {
        score,
        allPassed: passedCount === criteria.length,
        criteria
      };
    }
  },

  {
    id: 'ex-inner-join-filter',
    titleFr: 'Jointure relationnelle & Filtre de Salaire (INNER JOIN & WHERE)',
    titleEn: 'Relational Join & Salary Filter (INNER JOIN & WHERE)',
    categoryFr: 'Jointures & Relations',
    categoryEn: 'Joins & Relations',
    level: 'Intermédiaire',
    xp: 40,
    instructionFr: 'Sélectionnez le nom de famille (last_name), le nom du département (department_name) et le salaire (salary) pour tous les employés gagnant plus de 6000€. Triez les résultats par salaire décroissant.',
    instructionEn: 'Select the last_name, department_name, and salary for all employees earning more than 6000. Sort by salary descending.',
    initialSql: `SELECT e.last_name, d.department_name, e.salary
FROM employees e
JOIN departments d ON e.department_id = d.department_id
WHERE e.salary > 6000
ORDER BY e.salary DESC;`,
    solutionSql: `SELECT e.last_name, d.department_name, e.salary
FROM employees e
JOIN departments d ON e.department_id = d.department_id
WHERE e.salary > 6000
ORDER BY e.salary DESC;`,
    hintFr: 'Joignez les tables "employees" et "departments" via "department_id", puis filtrez avec WHERE salary > 6000.',
    hintEn: 'Join employees and departments on department_id, filter using WHERE salary > 6000.',
    expectedOutputSummaryFr: 'Employés avec salaire > 6000€ triés par ordre décroissant.',
    expectedOutputSummaryEn: 'Employees with salary > 6000 ordered descending.',
    validate: (sql: string, result: SqlQueryResult): ExerciseValidation => {
      const criteria: ValidationCriterion[] = [];
      const cleanSql = sql.toUpperCase();

      const hasValidSyntax = result.success && !result.error;
      criteria.push({
        id: 'syntax',
        labelFr: 'Syntaxe correcte',
        labelEn: 'Correct Syntax',
        passed: hasValidSyntax,
        detailFr: hasValidSyntax ? 'Requête exécutée avec succès.' : `Erreur : ${result.error}`,
        detailEn: hasValidSyntax ? 'Query executed successfully.' : `Error: ${result.error}`
      });

      const hasJoin = /\bJOIN\s+DEPARTMENTS\b/i.test(cleanSql) && /\bON\b/i.test(cleanSql);
      criteria.push({
        id: 'join_used',
        labelFr: 'Jointure JOIN correctement formulée',
        labelEn: 'JOIN clause properly formulated',
        passed: hasJoin,
        detailFr: hasJoin ? 'La jointure relationnelle avec la table departments est conforme.' : 'Clause JOIN ON manquante.',
        detailEn: hasJoin ? 'Relational JOIN with departments table is present.' : 'JOIN ON clause missing.'
      });

      const hasFilter = /\bWHERE\b.*?(?:SALARY\s*>\s*6000)/i.test(cleanSql);
      criteria.push({
        id: 'where_filter',
        labelFr: 'Filtre WHERE salary > 6000 appliqué',
        labelEn: 'WHERE salary > 6000 filter applied',
        passed: hasFilter,
        detailFr: hasFilter ? 'Condition de seuil salarial respectée.' : 'Filtre WHERE > 6000 manquant.',
        detailEn: hasFilter ? 'Salary threshold condition met.' : 'WHERE > 6000 filter missing.'
      });

      const hasRows = result.success && result.rowCount > 0 && result.rows.every(r => Number(r[2] || 0) > 6000);
      criteria.push({
        id: 'result_valid',
        labelFr: 'Résultat filtré et ordonné conforme',
        labelEn: 'Result dataset valid',
        passed: hasRows,
        detailFr: hasRows ? `${result.rowCount} employés qualifiés retournés.` : 'Les données retournées ne respectent pas le filtre salarial.',
        detailEn: hasRows ? `${result.rowCount} matching employees returned.` : 'Returned rows do not match salary criteria.'
      });

      const passedCount = criteria.filter((c) => c.passed).length;
      return {
        score: Math.round((passedCount / criteria.length) * 100),
        allPassed: passedCount === criteria.length,
        criteria
      };
    }
  },

  {
    id: 'ex-free-sql-sandbox',
    titleFr: 'Mode Bac à Sable / Requêtes Libres',
    titleEn: 'Free SQL Sandbox Mode',
    categoryFr: 'Pratique Libre & DDL/DML',
    categoryEn: 'Free Practice & DDL/DML',
    level: 'Avancé',
    xp: 50,
    instructionFr: 'Exécutez n\'importe quelle requête SQL valide sur les tables "employees" (44 lignes) et "departments" (4 lignes). Vous pouvez tester des requêtes complexes, des sous-requêtes, des agrégats ou même des créations de tables !',
    instructionEn: 'Execute any valid SQL query against "employees" (44 rows) and "departments" (4 rows). Test subqueries, aggregations, or table creations freely.',
    initialSql: `-- Testez n'importe quelle requête SQL sur la base de données :
SELECT d.department_name, AVG(e.salary) AS avg_salary, MAX(e.salary) AS max_salary
FROM employees e
JOIN departments d ON e.department_id = d.department_id
GROUP BY d.department_name
ORDER BY avg_salary DESC;`,
    solutionSql: `SELECT * FROM employees LIMIT 10;`,
    hintFr: 'Tapez SELECT * FROM employees ou SELECT * FROM departments pour explorer les données brutes.',
    hintEn: 'Type SELECT * FROM employees or SELECT * FROM departments to browse raw rows.',
    expectedOutputSummaryFr: 'Exécution libre et directe sans contrainte de validation.',
    expectedOutputSummaryEn: 'Unconstrained direct SQL execution.',
    validate: (_sql: string, result: SqlQueryResult): ExerciseValidation => {
      const hasValidSyntax = result.success && !result.error;
      return {
        score: hasValidSyntax ? 100 : 0,
        allPassed: hasValidSyntax,
        criteria: [
          {
            id: 'syntax_free',
            labelFr: 'Syntaxe SQL valide et exécutée',
            labelEn: 'Valid SQL syntax executed',
            passed: hasValidSyntax,
            detailFr: hasValidSyntax
              ? `Requête exécutée avec succès (${result.rowCount} lignes en ${result.executionTimeMs} ms).`
              : `Erreur SQL : ${result.error}`,
            detailEn: hasValidSyntax
              ? `Query executed successfully (${result.rowCount} rows in ${result.executionTimeMs} ms).`
              : `SQL Error: ${result.error}`
          }
        ]
      };
    }
  }
];
