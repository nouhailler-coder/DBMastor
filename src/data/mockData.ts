import { CertificationTrack, CertificationTrackId, ExamQuestion, CheatSheet, SqlExercise } from '../types';

export const certificationTracks: CertificationTrack[] = [
  {
    id: 'oracle-1z0-071',
    code: '1Z0-071',
    name: 'Oracle Database SQL',
    category: 'SQL Certified Associate',
    progress: 82,
    totalQuestions: 420,
    chaptersCount: 12,
    status: 'high_priority',
    recommendation: 'Revoir les jointures complexes et sous-requêtes corrélées (EXISTS, MINUS).',
    accentColor: '#93ccff',
    iconName: 'database',
    targetExamDate: '15 Mars 2025',
    syllabusUrl: 'https://education.oracle.com/oracle-database-sql/pexam_1Z0-071',
    provider: 'Oracle University',
    examCodeLabel: 'Oracle 1Z0-071',
    officialTopicsCount: 12,
  },
  {
    id: 'azure-dp-900',
    code: 'DP-900',
    name: 'Azure Data Fundamentals',
    category: 'Cloud Relational & Fundamentals',
    progress: 64,
    totalQuestions: 310,
    chaptersCount: 8,
    status: 'in_progress',
    recommendation: 'Revoir la sécurité Azure SQL & Managed Instances (RBAC & TDE, Always Encrypted).',
    accentColor: '#89ceff',
    iconName: 'cloud',
    targetExamDate: '28 Avril 2025',
    syllabusUrl: 'https://learn.microsoft.com/credentials/certifications/resources/study-guides/dp-900',
    provider: 'Microsoft Learn',
    examCodeLabel: 'Microsoft DP-900',
    officialTopicsCount: 4,
  },
  {
    id: 'azure-dp-800',
    code: 'DP-800 / DP-300',
    name: 'Azure Database Administrator',
    category: 'Administering Relational Cloud Databases',
    progress: 45,
    totalQuestions: 340,
    chaptersCount: 10,
    status: 'in_progress',
    recommendation: 'Revoir la haute disponibilité Always On, les replicas géo-distribués et l\'optimisation des index.',
    accentColor: '#3198dc',
    iconName: 'cloud',
    targetExamDate: '18 Mai 2025',
    syllabusUrl: 'https://learn.microsoft.com/credentials/certifications/resources/study-guides/dp-300',
    provider: 'Microsoft Learn',
    examCodeLabel: 'Microsoft DP-300 / DP-800',
    officialTopicsCount: 6,
  },
  {
    id: 'postgres-edb',
    code: 'EDB ASSOC',
    name: 'PostgreSQL Associate',
    category: 'PostgreSQL EDB Certified Associate 16',
    progress: 15,
    totalQuestions: 250,
    chaptersCount: 10,
    status: 'not_started',
    recommendation: 'Revoir l\'architecture MVCC, autovacuum et le Write-Ahead Logging (WAL).',
    accentColor: '#4edea3',
    iconName: 'server',
    targetExamDate: '10 Juin 2025',
    syllabusUrl: 'https://www.enterprisedb.com/services-support/edb-training/certification',
    provider: 'EnterpriseDB (EDB)',
    examCodeLabel: 'EDB PostgreSQL 16 Associate',
    officialTopicsCount: 8,
  },
  {
    id: 'mysql-80-dba',
    code: '1Z0-908',
    name: 'Oracle MySQL 8.0 DBA',
    category: 'Database Administrator Certified Professional',
    progress: 30,
    totalQuestions: 280,
    chaptersCount: 9,
    status: 'scheduled',
    recommendation: 'Revoir InnoDB Buffer Pool, GTID Replication et performance_schema.',
    accentColor: '#f59e0b',
    iconName: 'terminal',
    targetExamDate: '22 Juillet 2025',
    syllabusUrl: 'https://education.oracle.com/mysql-80-database-administrator/pexam_1Z0-908',
    provider: 'Oracle University',
    examCodeLabel: 'Oracle 1Z0-908',
    officialTopicsCount: 11,
  },
];

export const sampleExamQuestions: ExamQuestion[] = [
  {
    id: 'q24',
    qid: '1Z0-071-EN-0941',
    domain: 'DOMAINE 3: RESTRICTION & TRI DES DONNÉES',
    subdomain: 'Fonctions d\'agrégation & Clauses GROUP BY',
    averageTime: '1m 45s',
    prompt: 'Examinez l\'instruction SQL suivante exécutée sur une instance Oracle 19c Enterprise Database avec la table EMPLOYEES possédant les attributs de schéma standard:',
    tableContext: '(EMPLOYEE_ID, FIRST_NAME, LAST_NAME, DEPARTMENT_ID, SALARY, HIRE_DATE)',
    sqlCode: `SELECT   department_id, AVG(salary) AS avg_sal
FROM     employees
WHERE    hire_date >= DATE '2020-01-01'
GROUP BY department_id
HAVING   AVG(salary) > 5000
ORDER BY avg_sal DESC;`,
    sqlDialect: 'Dialecte SQL*Plus / Oracle 19c',
    questionText: 'Quelles assertions parmi les suivantes sont VRAIES concernant le flux d\'exécution logique, la visibilité des alias et les clauses de cette requête ? (Choisissez DEUX réponses)',
    correctCount: 2,
    options: [
      {
        id: 'opt-a',
        label: 'OPTION A',
        text: 'La clause ORDER BY peut valablement référencer l\'alias de colonne avg_sal car le moteur Oracle traite le tri après la phase logique de projection du SELECT.',
        isCorrect: true,
        explanation: 'Dans le cycle d\'évaluation SQL logique, ORDER BY intervient après le SELECT, donc les alias sont visibles et valides.',
      },
      {
        id: 'opt-b',
        label: 'OPTION B',
        text: 'La clause HAVING AVG(salary) > 5000 pourrait être remplacée par HAVING avg_sal > 5000 sans provoquer d\'erreur de syntaxe à l\'exécution.',
        isCorrect: false,
        explanation: 'En Oracle SQL, la clause HAVING est évaluée avant le SELECT. L\'alias avg_sal n\'est pas encore connu, ce qui génère l\'erreur ORA-00904: "AVG_SAL": invalid identifier.',
      },
      {
        id: 'opt-c',
        label: 'OPTION C',
        text: 'La clause WHERE filtre les lignes candidates individuelles avant la formation des groupes et le calcul d\'agrégats, éliminant les employés embauchés avant le 1er janvier 2020.',
        isCorrect: true,
        explanation: 'La clause WHERE s\'applique avant le GROUP BY et exclut les lignes individuelles avant tout calcul d\'agrégation.',
      },
      {
        id: 'opt-d',
        label: 'OPTION D',
        text: 'La requête échouera car toute colonne présente dans la clause HAVING doit obligatoirement être également déclarée dans la clause GROUP BY.',
        isCorrect: false,
        explanation: 'La clause HAVING accepte parfaitement des fonctions d\'agrégat (comme AVG(salary)) calculées sur des colonnes qui ne sont pas dans le GROUP BY.',
      },
    ],
    explanation: {
      title: 'Explication Pédagogique Détaillée & Cycle d\'Exécution SQL Oracle',
      flowSteps: [
        { step: '1. FROM', label: 'Tables sources', desc: 'Identifie et joint les tables (EMPLOYEES)' },
        { step: '2. WHERE', label: 'Filtre lignes', desc: 'Filtre les lignes individuelles (hire_date)' },
        { step: '3. GROUP BY', label: 'Agrégation', desc: 'Regroupe les lignes par department_id' },
        { step: '4. HAVING', label: 'Filtre groupes', desc: 'Filtre sur condition agrégée (AVG > 5000)' },
        { step: '5. SELECT', label: 'Alias créés', desc: 'Projection des colonnes et création des alias' },
        { step: '6. ORDER BY', label: 'Tri final', desc: 'Tri final du résultat (alias avg_sal accessible)', isFinal: true },
      ],
      correctReasons: [
        'Option A: La clause ORDER BY est exécutée en dernier. Les alias de colonnes définis dans le bloc SELECT y sont parfaitement accessibles et autorisés.',
        'Option C: La clause WHERE élimine les enregistrements individuels avant toute étape de regroupement ou de calcul de moyenne (AVG).',
      ],
      incorrectReasons: [
        {
          option: 'Option B',
          error: 'ORA-00904: "AVG_SAL": identificateur non valide',
          explanation: 'En Oracle SQL, les alias de colonnes ne sont pas reconnus durant l\'évaluation de HAVING car HAVING s\'exécute avant SELECT.',
        },
        {
          option: 'Option D',
          error: 'Règle d\'agrégation invalide',
          explanation: 'HAVING accepte les fonctions de groupe calculées sur n\'importe quelle colonne du schéma source sans exiger sa présence dans GROUP BY.',
        },
      ],
      docRef: 'Oracle® Database SQL Language Reference, 19c - Ch. 19 "SELECT Queries and Subqueries"',
      docUrl: 'https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/SELECT.html',
    },
  },
  {
    id: 'q25',
    qid: '1Z0-071-EN-0782',
    domain: 'DOMAINE 1: RÉCUPÉRATION DES DONNÉES',
    subdomain: 'Opérateurs de comparaison & NULLs',
    averageTime: '1m 15s',
    prompt: 'Examinez la requête suivante exécutée sur une table EMPLOYEES où COMMISSION_PCT contient des valeurs NULL:',
    tableContext: '(EMPLOYEE_ID, LAST_NAME, SALARY, COMMISSION_PCT)',
    sqlCode: `SELECT last_name, salary, commission_pct
FROM   employees
WHERE  commission_pct NOT IN (0.1, 0.2, NULL);`,
    sqlDialect: 'Dialecte SQL*Plus / Oracle 19c',
    questionText: 'Quel est le résultat de l\'exécution de cette requête SQL ?',
    correctCount: 1,
    options: [
      {
        id: 'opt-25a',
        label: 'OPTION A',
        text: 'La requête retourne tous les employés dont la commission est différente de 0.1 et 0.2, y compris les employés sans commission.',
        isCorrect: false,
        explanation: 'Faux, la présence de NULL rend le prédicat inconnu.',
      },
      {
        id: 'opt-25b',
        label: 'OPTION B',
        text: 'Aucune ligne n\'est retournée car l\'opérateur NOT IN avec une valeur NULL évalue à UNKNOWN pour chaque ligne candidate.',
        isCorrect: true,
        explanation: 'En logique ternaire SQL, NOT IN (..., NULL) se traduit par (x != 0.1 AND x != 0.2 AND x != NULL). Comme x != NULL vaut UNKNOWN, toute la condition vaut UNKNOWN/FALSE.',
      },
      {
        id: 'opt-25c',
        label: 'OPTION C',
        text: 'La requête génère une erreur ORA-01722: invalid number lors de la conversion du littéral NULL.',
        isCorrect: false,
        explanation: 'NULL est un littéral valide dans une liste IN.',
      },
      {
        id: 'opt-25d',
        label: 'OPTION D',
        text: 'Seuls les employés avec commission_pct IS NULL sont retournés par la projection.',
        isCorrect: false,
        explanation: 'Aucune ligne n\'est retournée.',
      },
    ],
    explanation: {
      title: 'Piège classique de l\'opérateur NOT IN face à des valeurs NULL',
      flowSteps: [
        { step: '1. FROM', label: 'Table EMPLOYEES', desc: 'Scan de la table' },
        { step: '2. WHERE', label: 'Test NOT IN', desc: 'Évaluation de la condition ternaire' },
        { step: '3. RÉSULTAT', label: '0 ligne retournée', desc: 'Ensemble vide en retour', isFinal: true },
      ],
      correctReasons: [
        'Option B est VRAIE : L\'expression x NOT IN (a, b, NULL) est équivalente à (x != a AND x != b AND x != NULL). Comme x != NULL est UNKNOWN, le résultat global est toujours UNKNOWN.',
      ],
      incorrectReasons: [
        {
          option: 'Option A & D',
          error: 'Comportement faussé',
          explanation: 'Ne confondez pas IN (qui peut matcher) et NOT IN (qui s\'annule complètement en présence de NULL).',
        },
      ],
      docRef: 'Oracle SQL Reference 19c - Logical Conditions and Three-Valued Logic',
    },
  },
];

export const examDomainMatrix = [
  {
    code: 'DOM-01 // CORE SELECT',
    title: 'Récupération des données avec SELECT & Fonctions scalaires',
    desc: 'Projections, alias, concaténation (||), clauses WHERE, LIKE, INSTR, SUBSTR, ROUND, TRUNC et dates.',
    sheetsRead: '8/8 fiches lues',
    percent: 92,
    weight: '~18%',
    status: 'mastered',
    statusLabel: 'Maîtrisé ✓',
    badgeClass: 'bg-tertiary/15 text-tertiary',
    accentColor: '#4edea3',
    footnote: 'Prêt pour test blanc',
  },
  {
    code: 'DOM-02 // LOGIC & CONV',
    title: 'Fonctions de conversion & Expressions conditionnelles DECODE / CASE',
    desc: 'TO_CHAR, TO_DATE, TO_NUMBER avec modèles de formats (RR vs YY). Logique conditionnelle imbriquée.',
    sheetsRead: '6/7 fiches lues',
    percent: 85,
    weight: '~14%',
    status: 'mastered',
    statusLabel: 'Maîtrisé',
    badgeClass: 'bg-tertiary/15 text-tertiary',
    accentColor: '#4edea3',
    footnote: 'Dernière révision: Hier',
  },
  {
    code: 'DOM-03 // AGGREGATIONS',
    title: 'Agrégats, GROUP BY et HAVING',
    desc: 'COUNT(*), AVG, SUM avec valeurs NULL. Règle d\'or : colonnes dans le SELECT non agrégées obligatoires dans GROUP BY.',
    sheetsRead: '5/6 fiches lues',
    percent: 78,
    weight: '~16%',
    status: 'consolidating',
    statusLabel: 'En consolidation',
    badgeClass: 'bg-secondary-container/20 text-secondary',
    accentColor: '#89ceff',
    footnote: 'Exercice HAVING requis',
  },
  {
    code: 'DOM-04 // RELATIONS & JOINS',
    title: 'Jointures multiples, Auto-jointures & ANSI vs Oracle (+)',
    desc: 'NATURAL JOIN, JOIN USING vs ON, FULL OUTER JOIN et syntaxe historique (+). Gestion des collisions de clés.',
    sheetsRead: '4/8 fiches lues',
    percent: 60,
    weight: '~18%',
    status: 'review_needed',
    statusLabel: 'À renforcer',
    badgeClass: 'bg-primary-container/25 text-primary-fixed-dim',
    accentColor: '#93ccff',
    footnote: '3 labs à terminer',
  },
  {
    code: 'DOM-05 // SUBQUERIES & SETS',
    title: 'Sous-requêtes corrélées et opérateurs UNION / MINUS',
    desc: 'Opérateurs EXISTS, NOT EXISTS, ANY/ALL, sous-requêtes scalaires et règles de compatibilité de types pour SET operators.',
    sheetsRead: '3/9 fiches lues',
    percent: 45,
    weight: '~20%',
    status: 'high_priority',
    statusLabel: 'Prioritaire',
    badgeClass: 'bg-error/15 text-error',
    accentColor: '#ffb4ab',
    footnote: 'Attention : taux d\'échec élevé',
  },
  {
    code: 'DOM-06 // DDL & OBJECTS',
    title: 'Manipulation du schéma DDL, Contraintes, Index et Vues',
    desc: 'CREATE TABLE, ALTER, DROP vs TRUNCATE, FLASHBACK, contraintes CASCADE, et dictionnaires de données USER_TABLES.',
    sheetsRead: '2/10 fiches lues',
    percent: 35,
    weight: '~14%',
    status: 'behind',
    statusLabel: 'En retard',
    badgeClass: 'bg-surface-container-highest text-on-surface-variant',
    accentColor: '#93ccff',
    footnote: 'Planifié pour la semaine 3',
  },
];

export const cheatSheets: CheatSheet[] = [
  {
    id: 'sheet-1',
    number: 1,
    tag: 'PIÈGE D\'EXAMEN MAJEUR',
    badgeType: 'trap',
    title: 'NULL dans IN vs NOT IN',
    summary: 'L\'erreur la plus récurrente de l\'épreuve 1Z0-071 : un prédicat contenant NOT IN face à un ensemble comprenant une valeur NULL évalue toujours à UNKNOWN (donc 0 ligne retournée).',
    codeSnippet: `-- Scénario 1: IN évalue TRUE pour ID=10
SELECT last_name FROM employees
WHERE department_id IN (10, NULL); 
-- Résultat: retourne les employés du dept 10.

-- Scénario 2: Le piège mortel NOT IN !
SELECT last_name FROM employees
WHERE department_id NOT IN (10, NULL);
-- Résultat: AUCUNE LIGNE retournée (Empty Set) !`,
    mnemonicTip: 'Décomposez mentalement : x NOT IN (10, NULL) équivaut à (x != 10 AND x != NULL). Comme x != NULL vaut UNKNOWN, toute l\'expression s\'annule ! Préférez toujours NOT EXISTS.',
  },
  {
    id: 'sheet-2',
    number: 2,
    tag: 'MATRICE POLYGLOTTE SQL',
    badgeType: 'matrix',
    title: 'Oracle vs Postgres vs MySQL vs Azure',
    summary: 'Tableau d\'équivalences directes pour basculer facilement d\'un dialecte à l\'autre sans commettre de fautes de grammaire DML.',
    tableData: {
      headers: ['Besoin SQL', 'Oracle 19c+', 'PostgreSQL', 'MySQL 8', 'Azure SQL'],
      rows: [
        ['Pagination', 'FETCH FIRST 5 ROWS', 'LIMIT 5', 'LIMIT 5', 'TOP (5)'],
        ['Remplacer NULL', 'NVL(a, b)', 'COALESCE(a, b)', 'IFNULL(a, b)', 'COALESCE(a, b)'],
        ['Numérotation', 'ROWNUM / ROW_NUMBER()', 'ROW_NUMBER() OVER()', 'ROW_NUMBER() OVER()', 'ROW_NUMBER() OVER()'],
        ['Concaténation', 'col1 || col2', 'col1 || col2', 'CONCAT(col1, col2)', 'CONCAT(col1, col2)'],
      ],
    },
  },
  {
    id: 'sheet-3',
    number: 3,
    tag: 'VUES & OBJETS DDL',
    badgeType: 'ddl',
    title: 'Règles DML sur Vues Simples vs Complexes',
    summary: 'Synthèse des conditions impératives autorisant les opérations DML (INSERT, UPDATE, DELETE) à travers une vue SQL.',
    rules: {
      allowed: {
        title: 'Vues Simples (DML Autorisé)',
        subtitle: '1 table source',
        desc: 'Pas de fonctions de groupe (SUM, MAX), pas de DISTINCT, pas de clause GROUP BY. Toutes les colonnes NOT NULL sans DEFAULT doivent être projetées pour les INSERT.',
      },
      prohibited: {
        title: 'Vues Complexes (DML Interdit)',
        subtitle: 'Multi-tables',
        desc: 'Dès l\'apparition de GROUP BY, d\'opérateurs ensemblistes (UNION) ou de colonnes calculées sans trigger INSTEAD OF, l\'UPDATE et le DELETE sont rejetés.',
      },
      keyClause: 'Clause WITH CHECK OPTION : bloque toute mise à jour rendant la ligne invisible à la vue !',
    },
  },
];

export const defaultSqlExercise: SqlExercise = {
  id: 'ex-12',
  number: 12,
  title: 'Certification Exercise #12 : Analytic Views & Window Functions (OVER / PARTITION BY)',
  level: 'Niveau Intermédiaire',
  objectiveText: 'Rédigez une requête retournant les employés avec leur ID, nom, département et salaire. Vous devez générer :',
  checklist: [
    'dept_salary_rank via DENSE_RANK() descendant sur le salaire par département.',
    'running_total calculant la somme cumulée des salaires chronologiquement par date d\'embauche (hire_date).',
  ],
  initialSql: `SELECT
  employee_id,
  last_name,
  department_id,
  salary,
  DENSE_RANK() OVER (
    PARTITION BY department_id 
    ORDER BY salary DESC
  ) AS dept_salary_rank,
  SUM(salary) OVER (
    PARTITION BY department_id 
    ORDER BY hire_date 
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total
FROM hr.employees;`,
  solutionSql: `SELECT employee_id, last_name, department_id, salary, DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dept_salary_rank, SUM(salary) OVER (PARTITION BY department_id ORDER BY hire_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM hr.employees;`,
  defaultOutput: {
    columns: ['EMPLOYEE_ID', 'LAST_NAME', 'DEPARTMENT_ID', 'SALARY', 'DEPT_SALARY_RANK', 'RUNNING_TOTAL'],
    rows: [
      [100, 'King', 90, '$24,000.00', 1, '$24,000.00'],
      [101, 'Kochhar', 90, '$17,000.00', 2, '$41,000.00'],
      [102, 'De Haan', 90, '$17,000.00', 2, '$58,000.00'],
      [108, 'Greenberg', 100, '$12,008.00', 1, '$12,008.00'],
      [109, 'Faviet', 100, '$9,000.00', 2, '$21,008.00'],
      [110, 'Chen', 100, '$8,200.00', 3, '$29,208.00'],
      [111, 'Sciarra', 100, '$7,700.00', 4, '$36,908.00'],
      [112, 'Urman', 100, '$7,800.00', 5, '$44,708.00'],
      [113, 'Popp', 100, '$6,900.00', 6, '$51,608.00'],
      [114, 'Raphaely', 30, '$11,000.00', 1, '$11,000.00'],
    ],
    executionTimeMs: 14,
  },
};

export const sampleEmployeesDb = [
  { employee_id: 100, first_name: 'Steven', last_name: 'King', department_id: 90, salary: 24000, hire_date: '2013-06-17' },
  { employee_id: 101, first_name: 'Neena', last_name: 'Kochhar', department_id: 90, salary: 17000, hire_date: '2015-09-21' },
  { employee_id: 102, first_name: 'Lex', last_name: 'De Haan', department_id: 90, salary: 17000, hire_date: '2016-01-13' },
  { employee_id: 108, first_name: 'Nancy', last_name: 'Greenberg', department_id: 100, salary: 12008, hire_date: '2017-08-17' },
  { employee_id: 109, first_name: 'Daniel', last_name: 'Faviet', department_id: 100, salary: 9000, hire_date: '2018-08-16' },
  { employee_id: 110, first_name: 'John', last_name: 'Chen', department_id: 100, salary: 8200, hire_date: '2018-09-28' },
  { employee_id: 111, first_name: 'Ismael', last_name: 'Sciarra', department_id: 100, salary: 7700, hire_date: '2019-09-30' },
  { employee_id: 112, first_name: 'Jose Manuel', last_name: 'Urman', department_id: 100, salary: 7800, hire_date: '2020-03-07' },
  { employee_id: 113, first_name: 'Luis', last_name: 'Popp', department_id: 100, salary: 6900, hire_date: '2020-12-07' },
  { employee_id: 114, first_name: 'Den', last_name: 'Raphaely', department_id: 30, salary: 11000, hire_date: '2014-12-07' },
];

export const examHistory = [
  {
    id: 'exam-04',
    title: 'Oracle 1Z0-071 Practice Exam #04 (Full)',
    date: 'Hier à 21h40',
    questions: 75,
    duration: '88 min',
    score: 91,
    status: 'PASSED',
  },
  {
    id: 'exam-sprint',
    title: 'Oracle Analytics Functions & Joins Sprint',
    date: '17 Fév',
    questions: 30,
    duration: '32 min',
    score: 84,
    status: 'PASSED',
  },
  {
    id: 'exam-azure',
    title: 'Azure DP-900 Core Services Diagnostic Test',
    date: '08 Fév',
    questions: 45,
    duration: '48 min',
    score: 72,
    status: 'PASSED',
  },
];

export interface CertificationProgramDetails {
  id: CertificationTrackId;
  name: string;
  code: string;
  provider: string;
  providerBadge: string;
  level: string;
  passingScore: string;
  duration: string;
  questionsCount: string;
  officialSyllabusUrl: string;
  studyGuideUrl?: string;
  examRegistrationUrl: string;
  accentColor: string;
  description: {
    fr: string;
    en: string;
  };
  keyDomains: {
    titleFr: string;
    titleEn: string;
    weight: string;
  }[];
}

export const certificationProgramsCatalog: CertificationProgramDetails[] = [
  {
    id: 'oracle-1z0-071',
    name: 'Oracle Database SQL Certified Associate',
    code: '1Z0-071',
    provider: 'Oracle University',
    providerBadge: 'Oracle Certified Associate',
    level: 'Associate',
    passingScore: '63%',
    duration: '120 minutes',
    questionsCount: '78 questions QCM',
    officialSyllabusUrl: 'https://education.oracle.com/oracle-database-sql/pexam_1Z0-071',
    studyGuideUrl: 'https://education.oracle.com/fr/oracle-database-sql/pexam_1Z0-071',
    examRegistrationUrl: 'https://home.pearsonvue.com/oracle',
    accentColor: '#93ccff',
    description: {
      fr: 'Programme officiel validant la maîtrise des concepts relationnels, du langage SQL ANSI/Oracle, de la modélisation, des jointures complexes, des sous-requêtes corrélées, des fonctions analytiques de fenêtrage et du contrôle transactionnel.',
      en: 'Official curriculum demonstrating fundamental SQL techniques, relational database concepts, complex queries, subqueries, analytical window functions, and transaction control in Oracle 19c.',
    },
    keyDomains: [
      { titleFr: 'Concepts Relationnels & Modélisation', titleEn: 'Relational Database Concepts', weight: '15%' },
      { titleFr: 'Restreindre et Trier les Données (WHERE, ORDER BY)', titleEn: 'Restricting and Sorting Data', weight: '18%' },
      { titleFr: 'Fonctions Ligne & Conversion (TO_CHAR, NVL, CASE)', titleEn: 'Single-Row & Conversion Functions', weight: '17%' },
      { titleFr: 'Agrégats & Fonctions de Groupe (GROUP BY, HAVING)', titleEn: 'Aggregating Data Using Group Functions', weight: '16%' },
      { titleFr: 'Jointures ANSI & Jointures Complexes', titleEn: 'Displaying Data from Multiple Tables', weight: '18%' },
      { titleFr: 'Sous-requêtes, Opérateurs d\'Ensemble & DDL/DML', titleEn: 'Subqueries, Set Operators & DDL/DML', weight: '16%' },
    ],
  },
  {
    id: 'azure-dp-900',
    name: 'Microsoft Certified: Azure Data Fundamentals',
    code: 'DP-900',
    provider: 'Microsoft Learn',
    providerBadge: 'Microsoft Certified Fundamentals',
    level: 'Fundamentals',
    passingScore: '700 / 1000 (70%)',
    duration: '60 minutes',
    questionsCount: '40-60 questions',
    officialSyllabusUrl: 'https://learn.microsoft.com/credentials/certifications/resources/study-guides/dp-900',
    studyGuideUrl: 'https://learn.microsoft.com/credentials/certifications/exams/dp-900/',
    examRegistrationUrl: 'https://home.pearsonvue.com/microsoft',
    accentColor: '#89ceff',
    description: {
      fr: 'Programme officiel couvrant les concepts fondamentaux des données, les bases de données relationnelles et non relationnelles dans Azure, ainsi que les composants analytiques cloud (Azure Synapse, Databricks, Power BI).',
      en: 'Official syllabus covering core data concepts, relational and non-relational database services in Microsoft Azure, plus modern analytics workloads.',
    },
    keyDomains: [
      { titleFr: 'Concepts fondamentaux des données', titleEn: 'Describe core data concepts', weight: '25-30%' },
      { titleFr: 'Données relationnelles sur Azure (Azure SQL, Cosmos DB)', titleEn: 'Relational data on Azure', weight: '20-25%' },
      { titleFr: 'Données non relationnelles sur Azure (Blob, Tables)', titleEn: 'Non-relational data on Azure', weight: '15-20%' },
      { titleFr: 'Charges de travail analytiques sur Azure', titleEn: 'Analytics workload on Azure', weight: '25-30%' },
    ],
  },
  {
    id: 'azure-dp-800',
    name: 'Microsoft Certified: Azure Database Administrator Associate',
    code: 'DP-300 / DP-800',
    provider: 'Microsoft Learn',
    providerBadge: 'Microsoft Certified Associate',
    level: 'Associate / Specialty',
    passingScore: '700 / 1000 (70%)',
    duration: '100 minutes',
    questionsCount: '40-55 questions',
    officialSyllabusUrl: 'https://learn.microsoft.com/credentials/certifications/resources/study-guides/dp-300',
    studyGuideUrl: 'https://learn.microsoft.com/credentials/certifications/exams/dp-300/',
    examRegistrationUrl: 'https://home.pearsonvue.com/microsoft',
    accentColor: '#3198dc',
    description: {
      fr: 'Programme officiel d\'administration des bases de données relationnelles cloud Microsoft Azure : planification, haute disponibilité Always On, reprise après sinistre, optimisation des requêtes et sécurité avancée.',
      en: 'Official curriculum for administering relational cloud databases on Microsoft Azure: high availability, disaster recovery, query performance tuning, and robust security.',
    },
    keyDomains: [
      { titleFr: 'Planifier et déployer des ressources de plateforme de données', titleEn: 'Plan and implement data platform resources', weight: '20-25%' },
      { titleFr: 'Mettre en œuvre un environnement sécurisé', titleEn: 'Implement a secure environment', weight: '15-20%' },
      { titleFr: 'Surveiller, optimiser les performances des requêtes', titleEn: 'Monitor and optimize query performance', weight: '20-25%' },
      { titleFr: 'Planifier et mettre en œuvre la haute disponibilité (HA/DR)', titleEn: 'Plan and implement High Availability & Disaster Recovery', weight: '20-25%' },
    ],
  },
  {
    id: 'postgres-edb',
    name: 'PostgreSQL EDB Certified Associate',
    code: 'EDB ASSOC 16',
    provider: 'EnterpriseDB (EDB)',
    providerBadge: 'EnterpriseDB Certified',
    level: 'Associate',
    passingScore: '70%',
    duration: '60 minutes',
    questionsCount: '50 questions',
    officialSyllabusUrl: 'https://www.enterprisedb.com/services-support/edb-training/certification',
    studyGuideUrl: 'https://www.enterprisedb.com/training/edb-postgres-training',
    examRegistrationUrl: 'https://www.enterprisedb.com/services-support/edb-training/certification',
    accentColor: '#4edea3',
    description: {
      fr: 'Programme certifiant la compétence sur l\'architecture interne de PostgreSQL, le moteur de stockage MVCC, l\'écriture des journaux WAL, autovacuum, la configuration postgresql.conf et la sauvegarde pg_dump/pg_basebackup.',
      en: 'Official curriculum assessing core competency in PostgreSQL architecture, MVCC transactions, WAL mechanism, vacuum tuning, and enterprise backup/restore workflows.',
    },
    keyDomains: [
      { titleFr: 'Architecture du serveur & Processus d\'arrière-plan', titleEn: 'Server Architecture & Background Processes', weight: '20%' },
      { titleFr: 'Installation, Initialisation & postgresql.conf', titleEn: 'Installation, Configuration & Parameters', weight: '20%' },
      { titleFr: 'Gestion des Rôles, Schémas & Privilèges (pg_hba.conf)', titleEn: 'Security, Roles, Privileges & pg_hba.conf', weight: '20%' },
      { titleFr: 'Maintenance, Autovacuum & Verrous (Locks)', titleEn: 'Maintenance, Routine Vacuuming & Locks', weight: '20%' },
      { titleFr: 'Sauvegardes Logiques & Physiques (pg_dump, WAL archiving)', titleEn: 'Backup, Recovery & WAL Archiving', weight: '20%' },
    ],
  },
  {
    id: 'mysql-80-dba',
    name: 'Oracle MySQL 8.0 Database Administrator',
    code: '1Z0-908',
    provider: 'Oracle University',
    providerBadge: 'Oracle Certified Professional',
    level: 'Professional (OCP)',
    passingScore: '62%',
    duration: '140 minutes',
    questionsCount: '85 questions QCM',
    officialSyllabusUrl: 'https://education.oracle.com/mysql-80-database-administrator/pexam_1Z0-908',
    studyGuideUrl: 'https://education.oracle.com/fr/mysql-80-database-administrator/pexam_1Z0-908',
    examRegistrationUrl: 'https://home.pearsonvue.com/oracle',
    accentColor: '#f59e0b',
    description: {
      fr: 'Programme officiel d\'administration avancée MySQL 8.0 : architecture InnoDB, gestion de la mémoire Buffer Pool, réplication binaire & GTID, Group Replication, sécurité des comptes et diagnostic de performances.',
      en: 'Official professional curriculum for MySQL 8.0 DBA: InnoDB architecture, memory tuning, binary log & GTID replication, performance_schema diagnostics, and backup strategies.',
    },
    keyDomains: [
      { titleFr: 'Architecture du Serveur & Moteur InnoDB', titleEn: 'MySQL Architecture & InnoDB Engine', weight: '22%' },
      { titleFr: 'Surveillance & Optimisation des Performances', titleEn: 'Monitoring & Performance Schema', weight: '20%' },
      { titleFr: 'Réplication MySQL (GTID & Group Replication)', titleEn: 'MySQL Replication & High Availability', weight: '20%' },
      { titleFr: 'Sécurité, Gestion des Utilisateurs & Rôles', titleEn: 'Security, User Authentication & Roles', weight: '18%' },
      { titleFr: 'Sauvegarde, Restauration & Utilitaires MySQL Shell', titleEn: 'Backups, Recovery & MySQL Shell Utilities', weight: '20%' },
    ],
  },
];
