import { CertificationTrackId, DomainMasteryItem, CheatSheet } from '../types';

export interface KeywordPillar {
  title: string;
  color: string;
  keywords: string[];
}

export const certificationDomainMatrices: Record<CertificationTrackId, DomainMasteryItem[]> = {
  // ==========================================
  // 1. ORACLE DATABASE SQL (1Z0-071)
  // ==========================================
  'oracle-1z0-071': [
    {
      id: 'oracle-dom-01',
      code: 'DOM-01 // CORE SELECT',
      title: 'Récupération des données avec SELECT & Fonctions scalaires',
      desc: 'Projections, alias, concaténation (||), clauses WHERE, LIKE, INSTR, SUBSTR, ROUND, TRUNC et calculs sur dates.',
      sheetsRead: '8/8 fiches lues',
      percent: 92,
      weight: '~18%',
      status: 'mastered',
      statusLabel: 'Maîtrisé ✓',
      badgeClass: 'bg-[#003824] text-[#4edea3]',
      accentColor: '#4edea3',
      footnote: 'Prêt pour test blanc',
      sheetDetail: {
        objectives: [
          'Écrire des requêtes SELECT utilisant la projection et les alias de colonnes (avec ou sans AS, guillemets pour casse et espaces)',
          'Utiliser la concaténation de chaînes avec l\'opérateur || et les chaînes littérales q\'<...>\'',
          'Filtrer les résultats avec WHERE, opérateurs de comparaison (=, !=, <>, ^=, <, <=, >, >=)',
          'Maîtriser les prédicats IN, BETWEEN ... AND ..., LIKE (jokers % et _, clause ESCAPE) et IS NULL',
          'Appliquer les fonctions scalaires de caractères : LOWER, UPPER, INITCAP, SUBSTR, INSTR, LENGTH, LPAD, RPAD, TRIM, REPLACE',
          'Appliquer les fonctions numériques : ROUND, TRUNC, MOD, CEIL, FLOOR, POWER',
          'Manipuler les dates Oracle : SYSDATE, CURRENT_DATE, ADD_MONTHS, MONTHS_BETWEEN, NEXT_DAY, LAST_DAY et arithmétique des dates',
        ],
        keyConcepts: [
          {
            title: 'Ordre d\'exécution logique d\'une requête SQL',
            description: 'Contrairement à l\'ordre d\'écriture (SELECT ... FROM ... WHERE ...), le moteur Oracle exécute dans l\'ordre : 1. FROM (jointures) -> 2. WHERE (filtrage ligne) -> 3. GROUP BY -> 4. HAVING -> 5. SELECT (projections, alias) -> 6. ORDER BY. C\'est pourquoi un alias défini dans SELECT n\'est JAMAIS utilisable dans la clause WHERE !',
          },
          {
            title: 'Arithmétique des dates Oracle',
            description: 'Le type DATE stocke jour, mois, année, heure, minute, seconde. Ajouter un entier n à une date ajoute n jours (SYSDATE + 7 = dans 7 jours). Ajouter n/24 ajoute n heures. Soustraire deux dates (date1 - date2) renvoie un NOMBRE décimal de jours d\'écart.',
          },
          {
            title: 'Fonctions SUBSTR vs INSTR',
            description: 'SUBSTR(str, pos, [len]) extrait une sous-chaîne. Si pos est négatif, le décompte commence à partir de la fin (-1 = dernier caractère). INSTR(str, substr, [start], [occurrence]) renvoie la position numérique (1-based) de la chaîne cherchée, ou 0 si introuvable.',
          },
        ],
        codeExamples: [
          {
            title: 'Requête SELECT complexe avec fonctions scalaires et filtrage',
            language: 'sql',
            code: `SELECT 
  employee_id,
  UPPER(last_name) || ', ' || INITCAP(first_name) AS full_name,
  salary,
  ROUND(salary * 1.085, 2) AS adjusted_salary,
  TRUNC(MONTHS_BETWEEN(SYSDATE, hire_date) / 12) AS seniority_years,
  LAST_DAY(hire_date) AS first_month_end
FROM hr.employees
WHERE department_id IN (50, 80, 90)
  AND (last_name LIKE 'M%' OR last_name LIKE '%son')
  AND salary BETWEEN 5000 AND 15000
ORDER BY seniority_years DESC, salary ASC;`,
            explanation: 'Démontre la concaténation, les fonctions de casse, ROUND sur valeur décimale, MONTHS_BETWEEN pour calcul d\'ancienneté et filtrage multi-critères avec précédence des parenthèses.',
          },
          {
            title: 'Gestion des caractères d\'échappement dans LIKE',
            language: 'sql',
            code: `-- Trouver les codes produits contenant un vrai underscore '_'
SELECT product_id, product_code
FROM oe.product_information
WHERE product_code LIKE '%\\_%' ESCAPE '\\';`,
            explanation: 'La clause ESCAPE spécifie le caractère d\'échappement permettant de désactiver le joker _ ou %.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Utilisation d\'un alias du SELECT dans la clause WHERE',
            description: 'Erreur ORA-00904 "invalid identifier". Le WHERE est évalué AVANT le SELECT, l\'alias n\'existe pas encore à ce stade.',
            wrongSyntax: 'SELECT salary * 12 AS annual_sal FROM emp WHERE annual_sal > 50000; -- ÉCHEC',
            correctSyntax: 'SELECT salary * 12 AS annual_sal FROM emp WHERE (salary * 12) > 50000; -- VALIDE',
          },
          {
            trapTitle: 'SUBSTR avec position négative et longueur nulle',
            description: 'SUBSTR(\'ORACLE\', -3, 2) commence à \'C\' (3e depuis la fin) et extrait 2 caractères : renvoie \'CL\'. Si la longueur spécifiée est <= 0, Oracle renvoie NULL.',
          },
          {
            trapTitle: 'Différence entre ROUND et TRUNC sur les dates',
            description: 'ROUND(SYSDATE, \'MM\') arrondit au premier jour du mois courant si le jour <= 15, ou au 1er du mois suivant si >= 16. En revanche, TRUNC(SYSDATE, \'MM\') tronque TOUJOURS au 1er jour du mois courant.',
          },
        ],
        checklist: [
          'Savoir identifier les cas où un alias nécessite des doubles guillemets (sensibilité à la casse, espaces)',
          'Maîtriser la précédence des opérateurs logiques : NOT > AND > OR',
          'Savoir calculer précisément le résultat de INSTR et SUBSTR imbriqués',
          'Retenir que toute comparaison arithmétique avec NULL (ex: col = NULL) renvoie UNKNOWN et échoue',
        ],
        mnemonic: 'Ordre d\'exécution logique : "F-W-G-H-S-O" -> From, Where, Group by, Having, Select, Order by.',
        officialRef: 'Oracle Database SQL Language Reference 19c - Chapter 5: Single-Row Functions',
      },
    },
    {
      id: 'oracle-dom-02',
      code: 'DOM-02 // LOGIC & CONV',
      title: 'Fonctions de conversion & Expressions conditionnelles DECODE / CASE',
      desc: 'TO_CHAR, TO_DATE, TO_NUMBER avec modèles de formats (RR vs YY). Logique conditionnelle imbriquée.',
      sheetsRead: '6/7 fiches lues',
      percent: 85,
      weight: '~14%',
      status: 'mastered',
      statusLabel: 'Maîtrisé',
      badgeClass: 'bg-[#003824] text-[#4edea3]',
      accentColor: '#4edea3',
      footnote: 'Dernière révision: Hier',
      sheetDetail: {
        objectives: [
          'Distinguer conversion de types de données implicite et explicite',
          'Utiliser TO_CHAR avec nombres (9, 0, $, L, C, MI, PR, RN)',
          'Utiliser TO_CHAR et TO_DATE avec formats de dates (YYYY, RRRR, RR, YY, MON, MONTH, DY, DAY, HH24, MI, SS, SSSS)',
          'Comprendre les règles du format de siècle RR vs YY',
          'Appliquer les fonctions de gestion des NULL : NVL, NVL2, NULLIF, COALESCE',
          'Implémenter la logique conditionnelle via DECODE et expression CASE (Simple et Searched)',
        ],
        keyConcepts: [
          {
            title: 'Format d\'année RR vs YY',
            description: 'YY se base strictement sur le siècle de l\'année courante. RR permet d\'interpréter les années à 2 chiffres : si l\'année courante est entre 50-99 et l\'année saisie entre 00-49, RR déduit le siècle suivant. Si les deux sont dans la même moitié (00-49), le siècle courant est conservé.',
          },
          {
            title: 'Expressions de gestion des NULL (NVL, NVL2, NULLIF, COALESCE)',
            description: 'NVL(expr1, expr2) : si expr1 est NULL, renvoie expr2 (expr1 et expr2 doivent avoir le même type). NVL2(expr1, expr2, expr3) : si expr1 n\'est pas NULL, renvoie expr2, sinon expr3. NULLIF(expr1, expr2) : renvoie NULL si expr1 = expr2, sinon renvoie expr1. COALESCE(e1, e2, ... en) : court-circuite et renvoie la première expression NON NULL.',
          },
        ],
        codeExamples: [
          {
            title: 'CASE vs DECODE pour évaluation de paliers salariaux',
            language: 'sql',
            code: `SELECT last_name, salary,
  -- Expression CASE Searched
  CASE 
    WHEN salary < 3000 THEN 'Catégorie C'
    WHEN salary BETWEEN 3000 AND 8000 THEN 'Catégorie B'
    ELSE 'Catégorie A'
  END AS salary_grade,
  -- DECODE pour équivalence discrète
  DECODE(department_id, 
    10, 'Administration',
    20, 'Marketing',
    60, 'IT Support',
    'Autre Département'
  ) AS dept_name,
  -- NVL2 pour prime conditionnelle
  NVL2(commission_pct, salary * (1 + commission_pct), salary) AS total_comp
FROM hr.employees;`,
            explanation: 'DECODE ne teste que l\'égalité, tandis que CASE supporte les prédicats complexes et les comparaisons de plages.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Compatibilité de types dans NVL',
            description: 'NVL convertit toujours le 2e argument dans le type de données du 1er argument. Si la conversion échoue, ORA-01722: invalid number se produit.',
            wrongSyntax: 'NVL(commission_pct, \'Aucune commission\') -- commission_pct est NUMBER -> ÉCHEC !',
            correctSyntax: 'NVL(TO_CHAR(commission_pct), \'Aucune commission\') -- VALIDE',
          },
          {
            trapTitle: 'NULLIF avec deux types incomparables ou le 1er argument littéral NULL',
            description: 'NULLIF ne peut pas avoir NULL comme 1er paramètre : NULLIF(NULL, 10) déclenche une erreur de syntaxe immédiate.',
          },
        ],
        checklist: [
          'Connaître le modèle de masque de format TO_CHAR : "fm" supprime les espaces de cadrage',
          'Savoir que DECODE est propriétaire Oracle, alors que CASE est standard ANSI SQL',
          'Vérifier que tous les types de retour d\'un CASE sont compatibles',
        ],
        mnemonic: 'NVL2 : 1 test, 2 choix -> Si NON NULL choix 1, Si NULL choix 2.',
        officialRef: 'Oracle SQL Language Reference - Conversion Functions',
      },
    },
    {
      id: 'oracle-dom-03',
      code: 'DOM-03 // AGGREGATIONS',
      title: 'Agrégats, GROUP BY et clause HAVING',
      desc: 'COUNT(*), AVG, SUM avec gestion des NULL. Règle d\'or : colonnes dans le SELECT non agrégées obligatoires dans GROUP BY.',
      sheetsRead: '5/6 fiches lues',
      percent: 78,
      weight: '~16%',
      status: 'consolidating',
      statusLabel: 'En consolidation',
      badgeClass: 'bg-[#0b1c30] text-[#89ceff]',
      accentColor: '#89ceff',
      footnote: 'Exercice HAVING requis',
      sheetDetail: {
        objectives: [
          'Utiliser les fonctions d\'agrégation : AVG, COUNT, MAX, MIN, SUM, STDDEV, VARIANCE',
          'Comprendre le comportement spécifique des fonctions de groupe face aux valeurs NULL',
          'Créer des groupes de données avec la clause GROUP BY',
          'Filtrer les groupes formés avec la clause HAVING',
          'Imbriquer des fonctions de groupe (maximum 2 niveaux d\'imbrication dans Oracle)',
          'Utiliser les extensions de groupement avancées : ROLLUP, CUBE et GROUPING SETS',
        ],
        keyConcepts: [
          {
            title: 'Comportement des agrégats face à NULL',
            description: 'Toutes les fonctions d\'agrégation (sauf COUNT(*)) IGNORENT complètement les valeurs NULL. AVG(commission_pct) calcule la moyenne uniquement sur les lignes où commission_pct IS NOT NULL ! Pour forcer l\'inclusion des NULL à zéro, utiliser AVG(NVL(commission_pct, 0)).',
          },
          {
            title: 'Règle impérative GROUP BY',
            description: 'Toute colonne ou expression présente dans la clause SELECT qui n\'est PAS incluse dans une fonction d\'agrégation DOIT obligatoirement figurer dans la clause GROUP BY. L\'inverse n\'est pas vrai : une colonne peut figurer dans GROUP BY sans être dans le SELECT.',
          },
          {
            title: 'WHERE vs HAVING',
            description: 'WHERE filtre les lignes INDIVIDUELLES AVANT le regroupement et ne peut JAMAIS contenir de fonction de groupe (ex: WHERE AVG(salary) > 5000 est INTERDIT). HAVING filtre les GROUPES APRÈS leur constitution.',
          },
        ],
        codeExamples: [
          {
            title: 'Groupement multi-colonnes avec HAVING et imbrication',
            language: 'sql',
            code: `SELECT 
  department_id,
  job_id,
  COUNT(*) AS employee_count,
  ROUND(AVG(salary), 2) AS avg_salary,
  MAX(salary) AS max_salary
FROM hr.employees
WHERE hire_date >= DATE '2015-01-01'
GROUP BY department_id, job_id
HAVING AVG(salary) > 6000 AND COUNT(*) >= 2
ORDER BY department_id, avg_salary DESC;`,
            explanation: 'Démontre le filtrage préalable des lignes (WHERE) puis le regroupement composite et enfin le filtrage des agrégats (HAVING).',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Fonction d\'agrégation dans la clause WHERE',
            description: 'Erreur ORA-00934: group function is not allowed here. Ne jamais tolérer d\'agrégat dans WHERE.',
            wrongSyntax: 'SELECT dept_id FROM emp WHERE COUNT(*) > 5 GROUP BY dept_id; -- ERREUR',
            correctSyntax: 'SELECT dept_id FROM emp GROUP BY dept_id HAVING COUNT(*) > 5; -- VALIDE',
          },
          {
            trapTitle: 'Imbrication de fonctions de groupe avec colonnes non agrégées',
            description: 'Si vous écrivez MAX(AVG(salary)), la clause SELECT ne peut contenir AUCUNE autre colonne individuelle !',
            wrongSyntax: 'SELECT department_id, MAX(AVG(salary)) FROM employees GROUP BY department_id; -- ORA-00937',
            correctSyntax: 'SELECT MAX(AVG(salary)) FROM employees GROUP BY department_id; -- VALIDE',
          },
        ],
        checklist: [
          'Vérifier que COUNT(*) compte toutes les lignes y compris les doublons et les NULLs',
          'Vérifier que COUNT(colonne) ne compte QUE les lignes non NULL',
          'Se rappeler que l\'imbrication de fonctions d\'agrégation est limitée à 2 niveaux',
        ],
        mnemonic: 'WHERE filtre les lignes, HAVING filtre les groupes.',
        officialRef: 'Oracle SQL Language Reference - Group Functions',
      },
    },
    {
      id: 'oracle-dom-04',
      code: 'DOM-04 // RELATIONS & JOINS',
      title: 'Jointures multiples, Auto-jointures & ANSI vs Oracle (+)',
      desc: 'NATURAL JOIN, JOIN USING vs ON, FULL OUTER JOIN et syntaxe historique (+). Gestion des collisions de clés.',
      sheetsRead: '4/8 fiches lues',
      percent: 60,
      weight: '~18%',
      status: 'review_needed',
      statusLabel: 'À renforcer',
      badgeClass: 'bg-[#1b2b3f] text-[#93ccff]',
      accentColor: '#93ccff',
      footnote: '3 labs à terminer',
      sheetDetail: {
        objectives: [
          'Écrire des requêtes avec jointures ANSI SQL : NATURAL JOIN, JOIN USING, JOIN ON',
          'Créer des jointures externes : LEFT OUTER JOIN, RIGHT OUTER JOIN, FULL OUTER JOIN',
          'Gérer les auto-jointures (Self-Join) avec alias de tables obligatoires',
          'Écrire des produits cartésiens (CROSS JOIN) et comprendre les conditions de déclenchement',
          'Comprendre la syntaxe historique propriétaire Oracle avec (+) et ses restrictions strictes',
        ],
        keyConcepts: [
          {
            title: 'NATURAL JOIN et collisions involontaires',
            description: 'Le NATURAL JOIN joint automatiquement sur TOUTES les colonnes portant le MÊME NOM dans les deux tables. Piège : si deux tables ont à la fois DEPARTMENT_ID et MANAGER_ID identiques en nom, le NATURAL JOIN joindra sur LES DEUX colonnes !',
          },
          {
            title: 'Règle stricte de la clause USING',
            description: 'Une colonne référencée dans une clause USING (col_name) ne doit JAMAIS être préfixée par un nom de table ou un alias dans la clause SELECT ou WHERE ! Écrire e.department_id avec USING (department_id) déclenche l\'erreur ORA-25154.',
          },
          {
            title: 'Restrictions de l\'opérateur historique (+)',
            description: '1. (+) se place du côté déficitaire en lignes (qui recevra les NULL). 2. Une condition de jointure ne peut pas utiliser (+) des deux côtés à la fois (pas de FULL OUTER JOIN direct avec (+)). 3. (+) ne peut pas être combiné avec la clause OR ou IN.',
          },
        ],
        codeExamples: [
          {
            title: 'Jointures multiples ANSI SQL avec filtres additionnels',
            language: 'sql',
            code: `SELECT 
  e.last_name,
  e.salary,
  d.department_name,
  l.city,
  m.last_name AS manager_name
FROM hr.employees e
JOIN hr.departments d ON e.department_id = d.department_id
JOIN hr.locations l ON d.location_id = l.location_id
LEFT OUTER JOIN hr.employees m ON e.manager_id = m.employee_id
WHERE e.salary > 5000;`,
            explanation: 'Démontre une jointure interne multiple chaînée, combinée à une auto-jointure externe gauche pour conserver les employés sans manager.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Préfixe de table interdit avec USING',
            description: 'ORA-25154: column part of USING clause cannot have a qualifier.',
            wrongSyntax: 'SELECT e.department_id FROM emp e JOIN dept d USING (department_id); -- ERREUR !',
            correctSyntax: 'SELECT department_id FROM emp e JOIN dept d USING (department_id); -- VALIDE',
          },
          {
            trapTitle: 'FULL OUTER JOIN impossible avec (+)',
            description: 'WHERE e.dept_id(+) = d.dept_id(+) est strictement interdit et renvoie ORA-01468: a predicate may reference only one outer-joined table.',
          },
        ],
        checklist: [
          'Vérifier que la clause ON permet de joindre des colonnes de noms différents ou avec des conditions non équi-jointures',
          'Vérifier qu\'un FULL OUTER JOIN conserve les lignes non appariées des deux côtés',
          'Maîtriser la conversion d\'une jointure (+) vers la syntaxe standard ANSI',
        ],
        mnemonic: 'USING : pas de préfixe ! (+) se place du côté où manquent les données.',
        officialRef: 'Oracle SQL Language Reference - Joins and Outer Joins',
      },
    },
    {
      id: 'oracle-dom-05',
      code: 'DOM-05 // SUBQUERIES & SETS',
      title: 'Sous-requêtes corrélées et opérateurs UNION / MINUS',
      desc: 'Opérateurs EXISTS, NOT EXISTS, ANY/ALL, sous-requêtes scalaires et règles de compatibilité de types pour SET operators.',
      sheetsRead: '3/9 fiches lues',
      percent: 45,
      weight: '~20%',
      status: 'high_priority',
      statusLabel: 'Prioritaire',
      badgeClass: 'bg-[#93000a] text-[#ffb4ab]',
      accentColor: '#ffb4ab',
      footnote: 'Attention : taux d\'échec élevé',
      sheetDetail: {
        objectives: [
          'Écrire des sous-requêtes mono-ligne (=, <, >, <=, >=, <>) et multi-lignes (IN, ANY, ALL)',
          'Utiliser des sous-requêtes corrélées et comprendre leur évaluation ligne par ligne',
          'Utiliser les opérateurs de test d\'existence EXISTS et NOT EXISTS',
          'Combiner des requêtes avec UNION, UNION ALL, INTERSECT, MINUS',
          'Respecter les règles de compatibilité de colonnes et de types des opérateurs ensemblistes',
          'Utiliser les sous-requêtes scalaires dans SELECT, WHERE et HAVING',
        ],
        keyConcepts: [
          {
            title: 'Le piège mortel : NOT IN face à une valeur NULL',
            description: 'Si la sous-requête renvoie au moins une valeur NULL, l\'opérateur NOT IN évalue TOUJOURS à UNKNOWN pour chaque ligne de la table externe. Résultat : la requête ne renvoie AUCUNE ligne ! Avec NOT EXISTS, les NULLs ne bloquent pas le test car EXISTS teste la présence d\'au moins une ligne retournée, pas une égalité de valeur.',
          },
          {
            title: 'UNION vs UNION ALL',
            description: 'UNION ALL concatène simplement les flux de données sans aucun tri ni dédoublonnage (très rapide). UNION applique un tri interne pour éliminer les doublons (plus coûteux en I/O et mémoire temporaire).',
          },
          {
            title: 'Règles strictes des SET Operators',
            description: '1. Même nombre de colonnes dans chaque composante. 2. Les colonnes doivent appartenir au même groupe de types de données. 3. Les noms de colonnes du résultat final sont dictés par la PREMIÈRE requête. 4. La clause ORDER BY ne peut figurer qu\'UNE SEULE FOIS, tout à la fin.',
          },
        ],
        codeExamples: [
          {
            title: 'Sous-requête corrélée avec EXISTS pour identifier les managers',
            language: 'sql',
            code: `-- Employés qui sont managers d'au moins un collaborateur
SELECT e.employee_id, e.last_name, e.salary
FROM hr.employees e
WHERE EXISTS (
  SELECT 1 
  FROM hr.employees sub
  WHERE sub.manager_id = e.employee_id
);`,
            explanation: 'Le moteur stoppe l\'exécution de la sous-requête dès la première ligne satisfaite (court-circuitage très performant).',
          },
        ],
        examTraps: [
          {
            trapTitle: 'ORDER BY placé au milieu d\'un UNION',
            description: 'Erreur ORA-00933: SQL command not properly ended. ORDER BY ne peut se trouver que sur la toute dernière composante.',
          },
          {
            trapTitle: 'NOT IN avec sous-requête contenant des NULLs',
            description: 'Ne renvoie strictement rien (0 lignes). Préférez TOUJOURS NOT EXISTS ou filtrez WHERE col IS NOT NULL dans la sous-requête.',
          },
        ],
        checklist: [
          'Vérifier qu\'une sous-requête mono-ligne ne peut retourner qu\'au plus UNE seule valeur',
          'Retenir que MINUS (Oracle) correspond à EXCEPT (PostgreSQL/SQL Server)',
          'Savoir qu\'aucun tri implicite n\'est garanti par UNION ALL',
        ],
        mnemonic: 'NULL dans NOT IN = Empty Set garanti !',
        officialRef: 'Oracle SQL Language Reference - Subqueries & Set Operators',
      },
    },
    {
      id: 'oracle-dom-06',
      code: 'DOM-06 // DDL & OBJECTS',
      title: 'Manipulation du schéma DDL, Contraintes, Index et Vues',
      desc: 'CREATE TABLE, ALTER, DROP vs TRUNCATE, FLASHBACK, contraintes CASCADE, et dictionnaires de données USER_TABLES.',
      sheetsRead: '2/10 fiches lues',
      percent: 35,
      weight: '~14%',
      status: 'behind',
      statusLabel: 'En retard',
      badgeClass: 'bg-[#26364a] text-[#bfc7d2]',
      accentColor: '#93ccff',
      footnote: 'Planifié pour la semaine 3',
      sheetDetail: {
        objectives: [
          'Créer des tables avec CREATE TABLE, types de données VARCHAR2, NUMBER, DATE, TIMESTAMP, CHAR',
          'Définir et gérer les contraintes : PRIMARY KEY, FOREIGN KEY (ON DELETE CASCADE / SET NULL), UNIQUE, NOT NULL, CHECK',
          'Modifier la structure des tables avec ALTER TABLE (ADD, MODIFY, DROP COLUMN, SET UNUSED, READ ONLY)',
          'Comparer DROP TABLE, TRUNCATE TABLE et DELETE',
          'Créer des Vues (CREATE VIEW, OR REPLACE, WITH CHECK OPTION, WITH READ ONLY)',
          'Créer des Séquences (NEXTVAL, CURRVAL), des Index (B-Tree, Unique) et des Synonymes',
        ],
        keyConcepts: [
          {
            title: 'TRUNCATE vs DELETE vs DROP',
            description: 'DELETE est une commande DML : génère de l\'Undo, supporte WHERE, et peut être annulée par ROLLBACK. TRUNCATE est une commande DDL : libère immédiatement les extents de stockage, réinitialise le High Water Mark (HWM), applique un COMMIT implicite et NE PEUT PAS être annulée par ROLLBACK. DROP supprime la structure et les données (placée dans la corbeille RECYCLEBIN sauf si PURGE est spécifié).',
          },
          {
            title: 'Commit implicite des instructions DDL',
            description: 'Toute instruction DDL (CREATE, ALTER, DROP, TRUNCATE) déclenche AUTOMATIQUEMENT un COMMIT avant et après son exécution ! Elle valide de manière irréversible toutes les transactions DML en attente dans la session courante.',
          },
        ],
        codeExamples: [
          {
            title: 'Création de table avec contraintes inline et out-of-line',
            language: 'sql',
            code: `CREATE TABLE hr.project_assignments (
  assignment_id NUMBER(8) CONSTRAINT pk_assignment PRIMARY KEY,
  employee_id   NUMBER(6) NOT NULL,
  project_code  VARCHAR2(10) CONSTRAINT chk_prj_code CHECK (LENGTH(project_code) >= 3),
  assigned_date DATE DEFAULT SYSDATE,
  billing_rate  NUMBER(7,2),
  CONSTRAINT fk_assign_emp FOREIGN KEY (employee_id) 
    REFERENCES hr.employees(employee_id) 
    ON DELETE CASCADE,
  CONSTRAINT unq_emp_prj UNIQUE (employee_id, project_code)
);`,
            explanation: 'Démontre les contraintes de clé primaire, clé étrangère avec suppression en cascade, contrainte CHECK et contrainte d\'unicité composite.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'CURRVAL appelé avant NEXTVAL',
            description: 'ORA-08002: sequence CURRVAL is not yet defined in this session. NEXTVAL doit être appelé au moins une fois dans la session avant de pouvoir lire CURRVAL.',
          },
          {
            trapTitle: 'DROP COLUMN sur une colonne de clé primaire référencée',
            description: 'Échoue sans la clause CASCADE CONSTRAINTS : ALTER TABLE dept DROP COLUMN dept_id CASCADE CONSTRAINTS;',
          },
        ],
        checklist: [
          'Savoir que la corbeille RECYCLEBIN permet de récupérer une table via FLASHBACK TABLE t TO BEFORE DROP',
          'Retenir que SET UNUSED permet de masquer logiquement une colonne sans subir le coût I/O d\'un DROP COLUMN immédiat',
          'Vérifier que WITH CHECK OPTION empêche les INSERT/UPDATE qui excluraient la ligne de la vue',
        ],
        mnemonic: 'DDL valide toujours la transaction (COMMIT automatique instantané).',
        officialRef: 'Oracle SQL Language Reference - Schema Objects & DDL',
      },
    },
  ],

  // ==========================================
  // 2. MICROSOFT AZURE DATA FUNDAMENTALS (DP-900)
  // ==========================================
  'azure-dp-900': [
    {
      id: 'azure-900-dom-01',
      code: 'DOM-01 // DATA CONCEPTS',
      title: 'Concepts fondamentaux des données (Structured, Semi-Structured, Unstructured)',
      desc: 'Différences formats (Relationnel, JSON, Parquet, CSV, Vidéo), caractéristiques Batch vs Streaming, et garanties ACID vs BASE.',
      sheetsRead: '5/5 fiches lues',
      percent: 95,
      weight: '25-30%',
      status: 'mastered',
      statusLabel: 'Maîtrisé ✓',
      badgeClass: 'bg-[#003824] text-[#4edea3]',
      accentColor: '#4edea3',
      footnote: 'Prêt pour l\'épreuve',
      sheetDetail: {
        objectives: [
          'Identifier les caractéristiques des données structurées (tables, colonnes, types stricts)',
          'Identifier les caractéristiques des données semi-structurées (JSON, XML, YAML, clés-valeurs, graphes)',
          'Identifier les caractéristiques des données non structurées (fichiers binaires, images, audio, PDF)',
          'Comparer le traitement par lots (Batch processing) et le traitement en continu (Streaming processing)',
          'Comprendre les propriétés transactionnelles ACID (Atomicité, Cohérence, Isolation, Durabilité)',
        ],
        keyConcepts: [
          {
            title: 'Batch Processing vs Stream Processing',
            description: 'Le traitement Batch traite de gros volumes de données au repos à intervalles réguliers (forte latence, haut débit). Le traitement en streaming traite des événements au fil de l\'eau en temps réel avec une latence quasi nulle (micro-secondes ou secondes), géré sur Azure via Event Hubs ou IoT Hub.',
          },
          {
            title: 'Structure des données et formats de stockage',
            description: 'Structuré : schéma rigide appliqué à l\'écriture (Schema-on-Write). Semi-structuré : structure dynamique auto-descriptive (schéma appliqué à la lecture - Schema-on-Read). Non-structuré : aucun format standardisé, stocké typiquement dans Azure Blob Storage sous forme d\'octets bruts.',
          },
        ],
        codeExamples: [
          {
            title: 'Représentation semi-structurée JSON vs table relationnelle',
            language: 'json',
            code: `{
  "customerId": 1042,
  "name": "Acme Industrial Corp",
  "active": true,
  "contact": {
    "email": "ops@acme.com",
    "phone": "+33 1 40 00 00 00"
  },
  "subscriptions": [
    { "service": "Azure SQL", "tier": "General Purpose" },
    { "service": "Azure Synapse", "tier": "DW100c" }
  ]
}`,
            explanation: 'JSON permet de stocker des structures hiérarchiques et des tableaux sans nécessiter de jointures relationnelles.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Confondre données semi-structurées et non-structurées',
            description: 'Un fichier JSON ou XML est SEMI-STRUCTURÉ car il contient des balises/attributs identifiables. Une photo JPEG ou un fichier vidéo est STRICTEMENT NON-STRUCTURÉ.',
          },
        ],
        checklist: [
          'Savoir que la visualisation analytique finale s\'effectue typiquement dans Power BI',
          'Distinguer OLTP (Transactionnel, écritures fréquentes) et OLAP (Analytique, lectures massives)',
        ],
        mnemonic: 'ACID pour les transactions OLTP, BASE pour les systèmes distribués NoSQL.',
        officialRef: 'Microsoft Learn DP-900: Describe core data concepts',
      },
    },
    {
      id: 'azure-900-dom-02',
      code: 'DOM-02 // RELATIONAL AZURE',
      title: 'Services de données relationnelles sur Azure',
      desc: 'Azure SQL Database, SQL Managed Instance, SQL Server sur machines virtuelles Azure, et serveurs flexibles PostgreSQL / MySQL.',
      sheetsRead: '4/5 fiches lues',
      percent: 82,
      weight: '20-25%',
      status: 'mastered',
      statusLabel: 'Maîtrisé',
      badgeClass: 'bg-[#003824] text-[#4edea3]',
      accentColor: '#4edea3',
      footnote: 'Révision PaaS vs IaaS',
      sheetDetail: {
        objectives: [
          'Comparer les options IaaS (SQL Server sur VM Azure) et PaaS (Azure SQL Database, SQL Managed Instance)',
          'Comprendre le cas d\'usage de SQL Managed Instance (migration lift-and-shift avec compatibilité quasi 100%)',
          'Comprendre Azure Database for PostgreSQL Flexible Server et Azure Database for MySQL Flexible Server',
          'Identifier les modèles d\'achat : vCore (contrôle des ressources indépendant) vs DTU (bundle préconfiguré)',
        ],
        keyConcepts: [
          {
            title: 'Spectre IaaS vs PaaS pour SQL sur Azure',
            description: 'SQL sur VM Azure (IaaS) : vous gérez l\'OS, les correctifs et les disques. SQL Managed Instance (PaaS) : compatibilité maximale avec SQL Server local (SQL Agent, Service Broker, CLR), idéal pour les migrations existantes. Azure SQL Database (PaaS) : base singleton entièrement gérée, sans accès au système d\'exploitation sous-jacent.',
          },
        ],
        codeExamples: [
          {
            title: 'Requête Transact-SQL type Azure SQL Database',
            language: 'sql',
            code: `-- Création de table avec colonne d'identité et compression de page
CREATE TABLE dbo.CustomerOrders (
  OrderID INT IDENTITY(1,1) PRIMARY KEY,
  CustomerName NVARCHAR(100) NOT NULL,
  OrderDate DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  Amount DECIMAL(18,2) NOT NULL
) WITH (DATA_COMPRESSION = PAGE);`,
            explanation: 'Transact-SQL standard compatible avec Azure SQL Database et Managed Instance.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Recommander Azure SQL Database pour une application utilisant des requêtes multi-bases (Cross-Database queries)',
            description: 'Azure SQL Database ne supporte pas nativement les requêtes cross-database avec la syntaxe [db].[schema].[table]. Il faut recommander SQL Managed Instance ou des requêtes élastiques.',
          },
        ],
        checklist: [
          'Savoir que Managed Instance supporte le SQL Agent natif pour la planification',
          'Retenir le niveau de service Hyperscale (jusqu\'à 100 To avec sauvegarde instantanée)',
        ],
        mnemonic: 'Migration legacy -> Managed Instance. Nouvelle application cloud-native -> Azure SQL Database.',
        officialRef: 'Microsoft Learn DP-900: Explore relational data in Azure',
      },
    },
    {
      id: 'azure-900-dom-03',
      code: 'DOM-03 // NON-RELATIONAL',
      title: 'Services de données non relationnelles (Azure Cosmos DB & Storage)',
      desc: 'Azure Cosmos DB et ses API (NoSQL, MongoDB, Cassandra, Gremlin, Table), Azure Blob Storage et ses niveaux d\'accès (Hot, Cool, Cold, Archive).',
      sheetsRead: '4/5 fiches lues',
      percent: 80,
      weight: '15-20%',
      status: 'consolidating',
      statusLabel: 'En consolidation',
      badgeClass: 'bg-[#0b1c30] text-[#89ceff]',
      accentColor: '#89ceff',
      footnote: 'Fiches Cosmos DB validées',
      sheetDetail: {
        objectives: [
          'Décrire Azure Cosmos DB comme base NoSQL mondialement distribuée avec latence garantie < 10 ms',
          'Identifier les 5 APIs Cosmos DB : API for NoSQL (Document/Core), MongoDB, Apache Cassandra, Apache Gremlin (Graphe), Table',
          'Décrire Azure Blob Storage et les conteneurs de stockage',
          'Comparer les niveaux d\'accès Blob : Chaud (Hot), Froid (Cool), Froid profond (Cold), Archive',
          'Comprendre Azure Files (partages SMB/NFS) et Azure Table Storage',
        ],
        keyConcepts: [
          {
            title: 'APIs Cosmos DB et modèles de données',
            description: 'Cosmos DB est multi-modèle. API for NoSQL stocke des documents JSON et se requête en SQL. API Gremlin stocke des entités (noeuds) et des relations (arêtes) pour les réseaux et graphes. API Cassandra pour les tables colonnaires larges.',
          },
          {
            title: 'Niveaux d\'accès Blob Storage',
            description: 'Hot : accès fréquent, coût de stockage élevé mais coût d\'accès minimal. Cool : conservé >= 30 jours, accès rare. Cold : conservé >= 90 jours. Archive : données hors-ligne (coût de stockage quasi nul, mais délai de réhydratation de plusieurs heures pour y accéder !).',
          },
        ],
        codeExamples: [
          {
            title: 'Requête Cosmos DB API for NoSQL (syntaxe de type SQL sur JSON)',
            language: 'sql',
            code: `SELECT c.id, c.name, c.contact.email, sub.service
FROM c
JOIN sub IN c.subscriptions
WHERE c.active = true AND sub.tier = 'General Purpose';`,
            explanation: 'Cosmos DB permet d\'interroger des documents JSON hiérarchiques avec une syntaxe très proche du SELECT SQL.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Tenter de lire immédiatement un Blob dans le niveau Archive',
            description: 'Un blob au niveau Archive est hors-ligne. Toute tentative de lecture directe échoue avec une erreur HTTP 409. Il doit d\'abord être réhydraté vers Hot ou Cool.',
          },
        ],
        checklist: [
          'Associer API Gremlin = Données de Graphe / Réseaux sociaux',
          'Associer Azure Files = Remplacement de partage de fichiers sur serveur local via SMB',
        ],
        mnemonic: 'Graphe = Gremlin, Documents = NoSQL/Mongo, Clé-Valeur = Table, Large-colonne = Cassandra.',
        officialRef: 'Microsoft Learn DP-900: Explore non-relational data in Azure',
      },
    },
    {
      id: 'azure-900-dom-04',
      code: 'DOM-04 // ANALYTICS & WAREHOUSING',
      title: 'Charges de travail analytiques, Azure Synapse & Power BI',
      desc: 'Entrepôts de données modernes (Data Warehouses vs Data Lakes), Azure Synapse Analytics, Azure Data Factory (ETL/ELT), Databricks et Power BI.',
      sheetsRead: '4/4 fiches lues',
      percent: 88,
      weight: '25-30%',
      status: 'mastered',
      statusLabel: 'Maîtrisé',
      badgeClass: 'bg-[#003824] text-[#4edea3]',
      accentColor: '#4edea3',
      footnote: 'Architecture unifiée',
      sheetDetail: {
        objectives: [
          'Distinguer Data Warehouse (données relationnelles modélisées en schéma en étoile/flocon) et Data Lake (stockage brut tous formats)',
          'Comprendre les piliers d\'Azure Synapse Analytics : Dedicated SQL Pools, Serverless SQL Pools, Apache Spark Pools, Data Pipelines',
          'Comprendre le rôle d\'Azure Data Factory (ADF) pour l\'ingestion et la transformation de données (pipelines et flux de données)',
          'Identifier les capacités d\'Azure Databricks (plateforme Apache Spark managée pour Big Data et Machine Learning)',
          'Identifier les composants Power BI (Power BI Desktop, Power BI Service, rapports, tableaux de bord interactifs)',
        ],
        keyConcepts: [
          {
            title: 'ETL vs ELT',
            description: 'ETL traditionnel : Extract -> Transform (sur serveur applicatif intermédiaire) -> Load. ELT moderne : Extract -> Load (chargement des données brutes directement dans le Data Lake / Synapse) -> Transform (transformation massivement parallèle exécutée directement par le moteur du data warehouse).',
          },
        ],
        codeExamples: [
          {
            title: 'Requête Synapse Serverless SQL interrogeant directement un fichier Parquet',
            language: 'sql',
            code: `-- Interroger directement des fichiers Parquet stockés dans un Data Lake ADLS Gen2
SELECT 
  VendorID,
  COUNT(*) AS trip_count,
  AVG(total_amount) AS avg_fare
FROM OPENROWSET(
  BULK 'https://datalake.dfs.core.windows.net/trips/year=2024/*.parquet',
  FORMAT = 'PARQUET'
) AS [trips]
GROUP BY VendorID;`,
            explanation: 'OPENROWSET dans Synapse Serverless permet d\'analyser des gigaoctets de données sans avoir à instancier de serveur au préalable.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Confondre Power BI Dashboard et Power BI Report',
            description: 'Un rapport (Report) est multi-pages avec des graphiques interactifs et des filtres complexes. Un tableau de bord (Dashboard) est une page UNIQUE regroupant des visuels épinglés provenant de plusieurs rapports différents (disponible uniquement dans le Service Power BI SaaS, pas dans Power BI Desktop).',
          },
        ],
        checklist: [
          'Savoir qu\'Azure Data Factory = orchestrateur ETL/ELT sans serveur',
          'Retenir que Synapse Analytics réunit data warehousing et big data analytics en une interface unique',
        ],
        mnemonic: 'ADLS Gen2 = Le lac de données, Synapse = L\'usine de calcul analytique, Power BI = L\'écran de restitution.',
        officialRef: 'Microsoft Learn DP-900: Explore data analytics in Azure',
      },
    },
  ],

  // ==========================================
  // 3. AZURE DATABASE ADMINISTRATOR (DP-300 / DP-800)
  // ==========================================
  'azure-dp-800': [
    {
      id: 'azure-800-dom-01',
      code: 'DOM-01 // DEPLOY & SCALE',
      title: 'Planification et déploiement de ressources de plateforme de données',
      desc: 'Dimensionnement vCore vs DTU, niveaux de service (General Purpose, Business Critical, Hyperscale), pools élastiques et licences avec Azure Hybrid Benefit.',
      sheetsRead: '4/6 fiches lues',
      percent: 72,
      weight: '20-25%',
      status: 'consolidating',
      statusLabel: 'En consolidation',
      badgeClass: 'bg-[#0b1c30] text-[#89ceff]',
      accentColor: '#89ceff',
      footnote: 'Labs de migration en cours',
      sheetDetail: {
        objectives: [
          'Évaluer les exigences de dimensionnement, performance et stockage pour Azure SQL',
          'Configurer les niveaux de service : General Purpose (stockage distant détaché), Business Critical (stockage local NVMe ultra-rapide et réplica local haute dispo), Hyperscale (architecture multi-niveaux)',
          'Déployer des pools élastiques (Elastic Pools) pour consolider des dizaines de bases avec des charges variables',
          'Configurer la tarification avec Azure Hybrid Benefit (AHB) et les instances réservées',
        ],
        keyConcepts: [
          {
            title: 'Business Critical vs General Purpose',
            description: 'General Purpose utilise Azure Premium Storage séparé du calcul (RTO un peu plus long en cas de crash de nœud). Business Critical utilise des disques SSD NVMe locaux ultra-rapides et déploie automatiquement un groupe de disponibilité Always On à 4 réplicas (3 en lecture seule, 1 en écriture), garantissant une latence minimale.',
          },
        ],
        codeExamples: [
          {
            title: 'Déploiement d\'un pool élastique avec Azure CLI',
            language: 'bash',
            code: `az sql elastic-pool create \\
  --resource-group rg-data-prod \\
  --server sql-srv-prod \\
  --name ep-clients-prod \\
  --edition GeneralPurpose \\
  --family Gen5 \\
  --capacity 8 \\
  --db-min-capacity 0.25 \\
  --db-max-capacity 2`,
            explanation: 'Crée un pool élastique permettant de mutualiser 8 vCores entre plusieurs bases avec un plafond par base.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Oublier le Read-Scale Out dans Business Critical',
            description: 'Le niveau Business Critical inclut GRATUITEMENT un réplica en lecture seule. Vous pouvez router les requêtes de reporting en ajoutant ApplicationIntent=ReadOnly dans votre chaîne de connexion.',
          },
        ],
        checklist: [
          'Savoir quand migrer vers Hyperscale (besoin de monter au-delà de 4 To ou temps de sauvegarde quasi-instantané)',
          'Configurer l\'auto-pause sur les niveaux Serverless pour réduire les coûts hors heures ouvrées',
        ],
        mnemonic: 'Business Critical = NVMe local + 4 réplicas Always On inclus.',
        officialRef: 'Microsoft Learn DP-300: Plan and implement data platform resources',
      },
    },
    {
      id: 'azure-800-dom-02',
      code: 'DOM-02 // SECURITY & ENCRYPTION',
      title: 'Sécurité, Chiffrement & Conformité (TDE, Masking, Always Encrypted)',
      desc: 'Transparent Data Encryption (TDE avec Bring Your Own Key / Key Vault), Always Encrypted, Dynamic Data Masking (DDM), Row-Level Security et Microsoft Entra ID.',
      sheetsRead: '5/6 fiches lues',
      percent: 85,
      weight: '15-20%',
      status: 'mastered',
      statusLabel: 'Maîtrisé',
      badgeClass: 'bg-[#003824] text-[#4edea3]',
      accentColor: '#4edea3',
      footnote: 'Dernière révision réussie',
      sheetDetail: {
        objectives: [
          'Configurer l\'authentification Microsoft Entra ID (anciennement Azure AD) et désactiver l\'authentification SQL locale',
          'Mettre en œuvre Transparent Data Encryption (TDE) avec clé gérée par le client (Azure Key Vault)',
          'Configurer Always Encrypted avec enclaves sécurisées (chiffrement de bout en bout où même le DBA ne peut voir la donnée)',
          'Appliquer le masquage dynamique des données (Dynamic Data Masking - DDM) avec fonctions email, partial, random, default',
          'Mettre en œuvre la sécurité au niveau de la ligne (Row-Level Security - RLS) via des fonctions de prédicat de sécurité',
        ],
        keyConcepts: [
          {
            title: 'TDE vs Always Encrypted vs DDM',
            description: 'TDE chiffre les données au repos sur le disque (fichiers MDF/LDF et sauvegardes). Always Encrypted chiffre la donnée dès le pilote client, empêchant l\'administrateur de base de données de voir les données en clair en mémoire. DDM masque la donnée à l\'affichage pour les utilisateurs non privilégiés (mais ne chiffre pas physiquement la colonne).',
          },
        ],
        codeExamples: [
          {
            title: 'Configuration de Dynamic Data Masking et Row-Level Security',
            language: 'sql',
            code: `-- Masquage dynamique de colonnes sensibles
ALTER TABLE dbo.Customers
ALTER COLUMN CreditCardNumber ADD MASKED WITH (FUNCTION = 'partial(0,"XXXX-XXXX-XXXX-",4)');

-- Sécurité au niveau ligne (RLS)
CREATE SCHEMA sec;
GO
CREATE FUNCTION sec.fn_tenant_predicate(@TenantId INT)
RETURNS TABLE WITH SCHEMABINDING AS
RETURN SELECT 1 AS result 
WHERE @TenantId = CAST(SESSION_CONTEXT(N'TenantId') AS INT);
GO
CREATE SECURITY POLICY sec.TenantPolicy
ADD FILTER PREDICATE sec.fn_tenant_predicate(TenantId) ON dbo.Orders
WITH (STATE = ON);`,
            explanation: 'Combine DDM pour protéger les numéros de cartes de crédit et RLS pour cloisonner les données multi-tenants.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Croire que Dynamic Data Masking empêche l\'inférence par requête WHERE',
            description: 'DDM masque l\'affichage, mais un utilisateur sans privilège UNMASK peut déduire une valeur via une clause WHERE (ex: WHERE Salary = 50000 renvoie la ligne si vrai). DDM n\'est pas un mécanisme de contrôle d\'accès cryptographique.',
          },
        ],
        checklist: [
          'Retenir que le rôle SQL admin Entra ID est requis pour configurer l\'authentification sans mot de passe',
          'Toujours sauvegarder la clé de chiffrement racine lors de la rotation de clé TDE dans Key Vault',
        ],
        mnemonic: 'TDE = Chiffrement au repos, Always Encrypted = Chiffrement en transit et en mémoire, DDM = Masque d\'affichage.',
        officialRef: 'Microsoft Learn DP-300: Implement a secure environment',
      },
    },
    {
      id: 'azure-800-dom-03',
      code: 'DOM-03 // QUERY TUNING',
      title: 'Surveillance & Optimisation des performances des requêtes',
      desc: 'Query Store, DMV sys.dm_exec_*, statistiques de requêtes, plans d\'exécution réels vs estimés, et indexation columnstore.',
      sheetsRead: '3/7 fiches lues',
      percent: 55,
      weight: '20-25%',
      status: 'review_needed',
      statusLabel: 'À renforcer',
      badgeClass: 'bg-[#1b2b3f] text-[#93ccff]',
      accentColor: '#93ccff',
      footnote: 'Analyser les DMV de requêtes lentes',
      sheetDetail: {
        objectives: [
          'Activer et configurer le Query Store (Magasin des requêtes) pour capturer l\'historique des plans et des temps d\'exécution',
          'Identifier les régressions de performances de requêtes et forcer un plan stable (Force Plan)',
          'Diagnostiquer les statistiques de cardinalité périmées et leur impact sur le choix du plan',
          'Analyser les types d\'attente majeurs (Wait Stats) : PAGEIOLATCH, ASYNC_NETWORK_IO, LCK_M_*, CXPACKET',
          'Créer et maintenir les index : Clustered, Nonclustered, Filtered, et Columnstore pour les agrégations lourdes',
        ],
        keyConcepts: [
          {
            title: 'Query Store et régression de plan',
            description: 'Query Store agit comme la boîte noire d\'un avion pour la base. Il conserve les plans d\'exécution successifs d\'une requête avec leurs métriques de consommation CPU/IO. Si un nouveau plan s\'avère catastrophique, le DBA peut forcer l\'ancien plan en un clic ou via sp_query_store_force_plan.',
          },
        ],
        codeExamples: [
          {
            title: 'Détection des requêtes consommatrices de CPU via les DMV',
            language: 'sql',
            code: `SELECT TOP 5
  qs.total_worker_time / qs.execution_count AS avg_cpu_time,
  qs.execution_count,
  SUBSTRING(st.text, (qs.statement_start_offset/2) + 1,
    ((CASE qs.statement_end_offset 
      WHEN -1 THEN DATALENGTH(st.text)
      ELSE qs.statement_end_offset END 
      - qs.statement_start_offset)/2) + 1) AS query_text,
  qp.query_plan
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
CROSS APPLY sys.dm_exec_query_plan(qs.plan_handle) qp
ORDER BY avg_cpu_time DESC;`,
            explanation: 'Extrait les 5 requêtes consommant le plus de CPU moyen avec leur plan d\'exécution graphique XML.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Forcer un plan avec Query Store sur une requête avec des index supprimés',
            description: 'Si l\'index utilisé par le plan forcé a été supprimé, le moteur ne peut plus l\'utiliser et bascule en plan alternatif en enregistrant un statut d\'échec dans Query Store.',
          },
        ],
        checklist: [
          'Savoir que Automatic Tuning peut forcer automatiquement les derniers bons plans et créer des index manquants',
          'Rechercher les scans de table et les avertissements de conversion implicite (Implicit Conversion) dans les plans',
        ],
        mnemonic: 'Query Store = Boîte noire d\'exécution : capturer, comparer, forcer.',
        officialRef: 'Microsoft Learn DP-300: Monitor and optimize query performance',
      },
    },
    {
      id: 'azure-800-dom-04',
      code: 'DOM-04 // HA & DR',
      title: 'Haute Disponibilité (HA) & Reprise après Sinistre (DR)',
      desc: 'Groupes de basculement automatique (Auto-Failover Groups), Géo-réplication active, rétention des sauvegardes LTR (Long-Term Retention) et RPO/RTO.',
      sheetsRead: '4/6 fiches lues',
      percent: 68,
      weight: '20-25%',
      status: 'consolidating',
      statusLabel: 'En consolidation',
      badgeClass: 'bg-[#0b1c30] text-[#89ceff]',
      accentColor: '#89ceff',
      footnote: 'Cas pratique Failover à finaliser',
      sheetDetail: {
        objectives: [
          'Calculer et respecter les objectifs de RPO (Recovery Point Objective) et RTO (Recovery Time Objective)',
          'Configurer la géo-réplication active (Active Geo-Replication) jusqu\'à 4 réplicas secondaires lisibles',
          'Configurer les groupes de basculement automatique (Auto-failover groups) avec points de terminaison d\'écouteurs stables',
          'Mettre en œuvre les sauvegardes automatisées et la conservation à long terme (Long-Term Retention - LTR jusqu\'à 10 ans)',
          'Effectuer une restauration à un instant précis (Point-in-Time Restore - PITR)',
        ],
        keyConcepts: [
          {
            title: 'Active Geo-Replication vs Auto-Failover Groups',
            description: 'Active Geo-Replication opère au niveau de la base de données individuelle (basculement manuel requis, chaîne de connexion à modifier). Auto-Failover Groups opère au niveau groupe de bases avec basculement automatique orchestré par Azure et URL d\'écouteur stable (read-write listener) sans aucune modification de code applicatif.',
          },
        ],
        codeExamples: [
          {
            title: 'Création d\'un Auto-Failover Group avec Azure PowerShell',
            language: 'powershell',
            code: `$primaryServer = "sql-eastus-prod"
$secondaryServer = "sql-westus-dr"
$rg = "rg-databases"

New-AzSqlDatabaseFailoverGroup -ResourceGroupName $rg \`
  -ServerName $primaryServer \`
  -FailoverGroupName "fog-sales-prod" \`
  -PartnerServerName $secondaryServer \`
  -FailoverPolicy Automatic \`
  -GracePeriodWithDataLossHours 1`,
            explanation: 'Crée un groupe de basculement inter-régions avec basculement automatique en cas de panne de la région primaire.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Supposition que la géo-réplication est synchrone',
            description: 'Sur Azure SQL, la réplication entre régions distantes est STRICTEMENT ASYNCHRONE pour ne pas pénaliser les commits de transactions locales. En cas de sinistre majeur, un basculement forcé peut impliquer une perte minime de données (RPO > 0).',
          },
        ],
        checklist: [
          'Retenir que PITR permet de restaurer à la seconde près dans la limite de la période de rétention (1 à 35 jours)',
          'Vérifier que les sauvegardes LTR sont stockées dans Azure Backup Vault avec stockage géorépliqué (RA-GRS)',
        ],
        mnemonic: 'Failover Group = Écouteur DNS stable + failover multi-bases automatisé.',
        officialRef: 'Microsoft Learn DP-300: Plan and implement High Availability & Disaster Recovery',
      },
    },
  ],

  // ==========================================
  // 4. POSTGRESQL EDB CERTIFIED ASSOCIATE
  // ==========================================
  'postgres-edb': [
    {
      id: 'pg-edb-dom-01',
      code: 'DOM-01 // ARCHITECTURE & BG',
      title: 'Architecture interne du serveur & Processus d\'arrière-plan',
      desc: 'Mémoire partagée (Shared Buffers, WAL Buffers), mémoire locale (work_mem), processus Postmaster, BgWriter, Checkpointer, WalWriter et Autovacuum.',
      sheetsRead: '5/5 fiches lues',
      percent: 90,
      weight: '20%',
      status: 'mastered',
      statusLabel: 'Maîtrisé ✓',
      badgeClass: 'bg-[#003824] text-[#4edea3]',
      accentColor: '#4edea3',
      footnote: 'Prêt pour l\'épreuve',
      sheetDetail: {
        objectives: [
          'Identifier les structures mémoire globales : Shared Buffers, WAL Buffers, CLOG Buffers',
          'Identifier les structures mémoire allouées par session de connexion : work_mem, maintenance_work_mem, temp_buffers',
          'Décrire le rôle du processus maître (Postmaster) et le modèle multi-processus de PostgreSQL',
          'Comprendre les fonctions respectives de Checkpointer et Background Writer (BgWriter)',
          'Comprendre le rôle du WalWriter et l\'écriture du journal de transactions (Write-Ahead Logging)',
        ],
        keyConcepts: [
          {
            title: 'shared_buffers vs work_mem',
            description: 'shared_buffers est un bloc de mémoire partagée alloué au démarrage du serveur (recommandé à ~25% de la RAM totale). work_mem n\'est PAS partagée : elle est allouée PAR OPÉRATION de tri (ORDER BY, DISTINCT) ou de hachage (Hash Join) au sein d\'une requête. Une requête complexe avec 4 tris peut allouer 4 fois work_mem !',
          },
          {
            title: 'Checkpointer vs BgWriter',
            description: 'Le Checkpointer vide périodiquement TOUS les blocs modifiés (dirty buffers) sur le disque et écrit un point de contrôle dans le WAL (garantie de crash recovery). Le BgWriter nettoie les buffers sales en continu par petits lots pour garantir qu\'un processus client trouve toujours un buffer propre libre sans attendre un I/O synchrone.',
          },
        ],
        codeExamples: [
          {
            title: 'Consultation des processus d\'arrière-plan actifs sous psql',
            language: 'sql',
            code: `-- Visualiser les processus PostgreSQL en cours d'exécution
SELECT pid, backend_type, state, wait_event_type, wait_event
FROM pg_stat_activity
ORDER BY backend_type;`,
            explanation: 'Affiche postmaster, background writer, checkpointer, autovacuum launcher et les connexions clientes.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Augmenter imprudemment work_mem sur un serveur à haute concurrence',
            description: 'Régler work_mem = 1 Go avec max_connections = 500 peut déclencher un Out Of Memory (OOM Killer) du système d\'exploitation Linux qui tuera le processus postmaster.',
          },
        ],
        checklist: [
          'Savoir que max_connections multiplie l\'exposition à work_mem',
          'Retenir que le WAL permet la durabilité (D dans ACID) avant même l\'écriture sur le fichier de données',
        ],
        mnemonic: 'shared_buffers = le cache global de lecture, work_mem = le plan de travail privé de chaque tri.',
        officialRef: 'EnterpriseDB Postgres Training - Chapter 2: PostgreSQL Architecture',
      },
    },
    {
      id: 'pg-edb-dom-02',
      code: 'DOM-02 // INSTALL & CONFIG',
      title: 'Installation, Initialisation (initdb) & postgresql.conf',
      desc: 'Création de cluster avec initdb, arborescence $PGDATA, rechargement des paramètres (pg_reload_conf vs redémarrage), et réglage des paramètres clés.',
      sheetsRead: '4/5 fiches lues',
      percent: 80,
      weight: '20%',
      status: 'mastered',
      statusLabel: 'Maîtrisé',
      badgeClass: 'bg-[#003824] text-[#4edea3]',
      accentColor: '#4edea3',
      footnote: 'Fiches de configuration terminées',
      sheetDetail: {
        objectives: [
          'Initialiser un cluster PostgreSQL avec initdb (options --data-checksums, -E UTF8, -D)',
          'Identifier les fichiers critiques dans $PGDATA (PG_VERSION, global/, base/, pg_wal/, postgresql.conf)',
          'Modifier postgresql.conf et appliquer les modifications via SELECT pg_reload_conf() ou pg_ctl reload',
          'Différencier les paramètres modifiables à chaud (context: sighup, user) de ceux nécessitant un redémarrage (context: postmaster, ex: shared_buffers, max_connections)',
        ],
        keyConcepts: [
          {
            title: 'Niveaux de contexte des paramètres dans pg_settings',
            description: 'Consultez la vue système pg_settings. Si le contexte est "postmaster", un redémarrage complet du service est obligatoire. Si le contexte est "sighup", un simple rechargement suffit. Si le contexte est "user", l\'utilisateur peut le modifier pour sa session courante avec SET param = value.',
          },
        ],
        codeExamples: [
          {
            title: 'Initialisation d\'un cluster sécurisé avec checksums et rechargement dynamique',
            language: 'bash',
            code: `# Initialisation du cluster avec détection de corruption sur disque
initdb -D /var/lib/postgresql/16/data --data-checksums -E UTF8 --locale=fr_FR.UTF-8

# Dans psql : vérifier si un paramètre nécessite un redémarrage
SELECT name, setting, unit, context, pending_restart 
FROM pg_settings 
WHERE name IN ('shared_buffers', 'work_mem', 'listen_addresses');`,
            explanation: 'La colonne pending_restart indique clairement si une modification en attente attend un redémarrage.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Oublier que les checksums de données ne peuvent pas être activés à chaud a posteriori',
            description: 'L\'option --data-checksums doit être définie lors de initdb, ou activée hors-ligne avec l\'utilitaire pg_checksums lorsque le serveur est totalement arrêté.',
          },
        ],
        checklist: [
          'Savoir localiser le fichier postmaster.pid pour déterminer si le serveur tourne',
          'Utiliser pg_ctl status / start / stop / reload avec le paramètre -D',
        ],
        mnemonic: 'initdb crée le cluster, pg_reload_conf applique sans coupure.',
        officialRef: 'EnterpriseDB Postgres Training - Cluster Setup and Tuning',
      },
    },
    {
      id: 'pg-edb-dom-03',
      code: 'DOM-03 // ROLES & SECURITY',
      title: 'Gestion des Rôles, Schémas & Privilèges (pg_hba.conf)',
      desc: 'Structure de pg_hba.conf (type, database, user, address, auth-method), rôles avec/sans LOGIN (groupes), GRANT / REVOKE et search_path.',
      sheetsRead: '4/5 fiches lues',
      percent: 75,
      weight: '20%',
      status: 'consolidating',
      statusLabel: 'En consolidation',
      badgeClass: 'bg-[#0b1c30] text-[#89ceff]',
      accentColor: '#89ceff',
      footnote: 'Exercices pg_hba à peaufiner',
      sheetDetail: {
        objectives: [
          'Comprendre le contrôle d\'accès réseau via le fichier pg_hba.conf',
          'Déchiffrer les types de connexion : local (socket unix), host (TCP/IP), hostssl',
          'Choisir les méthodes d\'authentification : scram-sha-256 (recommandé), md5, trust, reject, cert',
          'Créer et administrer les rôles (CREATE ROLE, LOGIN, SUPERUSER, CREATEDB, INHERIT)',
          'Gérer les privilèges sur les tables et séquences (GRANT, REVOKE, DEFAULT PRIVILEGES)',
          'Administrer les schémas et configurer la variable search_path',
        ],
        keyConcepts: [
          {
            title: 'Fonctionnement de pg_hba.conf (Première règle correspondante gagne)',
            description: 'PostgreSQL lit pg_hba.conf de HAUT EN BAS. Dès qu\'une ligne correspond au type de connexion, à la base demandée, à l\'utilisateur et à l\'adresse IP source, cette règle est APPLIQUÉE IMMÉDIATEMENT sans examiner les lignes suivantes. Si la méthode échoue, la connexion est rejetée.',
          },
          {
            title: 'Unification des Utilisateurs et des Groupes : les Rôles',
            description: 'Sous PostgreSQL, les utilisateurs et les groupes sont tous deux des "Rôles". La seule différence est l\'attribut LOGIN : un rôle avec LOGIN équivaut à un utilisateur, un rôle sans LOGIN fait office de groupe dont les privilèges sont hérités.',
          },
        ],
        codeExamples: [
          {
            title: 'Exemple de configuration pg_hba.conf durcie et création de rôles avec héritage',
            language: 'sql',
            code: `-- Dans pg_hba.conf :
-- host  all  all  192.168.1.0/24  scram-sha-256

-- Création d'un groupe en lecture seule et assignation
CREATE ROLE readonly_group NOLOGIN;
GRANT USAGE ON SCHEMA public TO readonly_group;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_group;

CREATE ROLE analyst_user LOGIN PASSWORD 'StrongPass!123' INHERIT;
GRANT readonly_group TO analyst_user;`,
            explanation: 'analyst_user hérite automatiquement des droits du groupe readonly_group via l\'attribut INHERIT.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Oublier le privilège USAGE sur le schéma',
            description: 'Accorder SELECT sur une table ne suffit pas : si l\'utilisateur n\'a pas le privilège USAGE sur le schéma contenant la table, il recevra l\'erreur "permission denied for schema".',
          },
        ],
        checklist: [
          'Ne jamais laisser "trust" sur une adresse IP ouverte ou externe',
          'Toujours configurer ALTER DEFAULT PRIVILEGES pour les tables futures',
        ],
        mnemonic: 'Schéma = Porte d\'entrée (USAGE nécessaire), Table = Contenu (SELECT nécessaire).',
        officialRef: 'EnterpriseDB Postgres Training - User and Security Administration',
      },
    },
    {
      id: 'pg-edb-dom-04',
      code: 'DOM-04 // MVCC & VACUUM',
      title: 'Maintenance, Mécanisme MVCC & Autovacuum',
      desc: 'Modèle MVCC (xmin, xmax), génération de lignes mortes (dead tuples), nettoyage avec VACUUM (standard vs FULL), détection du bloat et gel d\'identifiants de transactions (Freeze).',
      sheetsRead: '3/5 fiches lues',
      percent: 60,
      weight: '20%',
      status: 'review_needed',
      statusLabel: 'À renforcer',
      badgeClass: 'bg-[#1b2b3f] text-[#93ccff]',
      accentColor: '#93ccff',
      footnote: 'Maîtriser xmin/xmax et wraparound',
      sheetDetail: {
        objectives: [
          'Expliquer le contrôle de concurrence multi-versions (MVCC) et la non-bloquance des lectures par les écritures',
          'Analyser les colonnes système cachées : xmin (ID de transaction créatrice), xmax (ID de transaction modificatrice/supprimante)',
          'Comprendre comment UPDATE et DELETE produisent des lignes obsolètes (dead tuples)',
          'Différencier VACUUM standard (récupère l\'espace interne sans verrouiller) et VACUUM FULL (réécrit la table sur disque avec verrou exclusif lourd)',
          'Comprendre le rôle du démon Autovacuum et le risque critique de Transaction ID Wraparound',
        ],
        keyConcepts: [
          {
            title: 'Comment fonctionne un UPDATE sous PostgreSQL',
            description: 'Un UPDATE ne modifie jamais la ligne en place (in-place) ! Il renseigne le xmax de l\'ancienne ligne (la marquant comme morte) et insère une NOUVELLE version de ligne avec un nouveau xmin. Tant que VACUUM n\'est pas passé, l\'espace de l\'ancienne version reste occupé sur le disque (table bloat).',
          },
          {
            title: 'Transaction ID Wraparound',
            description: 'Les numéros de transaction (XID) sont des entiers 32 bits (environ 4 milliards de transactions possibles). Si aucun gel (VACUUM FREEZE) n\'est opéré avant 2 milliards de transactions, PostgreSQL se met en mode d\'arrêt d\'urgence en lecture seule pour éviter la perte de données catastrophique.',
          },
        ],
        codeExamples: [
          {
            title: 'Inspection des dead tuples et lancement d\'un VACUUM ANALYZE',
            language: 'sql',
            code: `-- Identifier les tables ayant le plus de lignes mortes
SELECT relname, n_live_tup, n_dead_tup,
  ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_pct,
  last_vacuum, last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- Nettoyer et mettre à jour les statistiques de l'optimiseur
VACUUM (VERBOSE, ANALYZE) sales.orders;`,
            explanation: 'VACUUM ANALYZE libère l\'espace dans la Free Space Map (FSM) et rafraîchit les statistiques pour le planificateur.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Exécuter VACUUM FULL en production aux heures de pointe',
            description: 'VACUUM FULL pose un verrou AccessExclusiveLock sur la table entière, bloquant TOUTES les lectures et écritures jusqu\'à réécriture complète du fichier.',
          },
        ],
        checklist: [
          'Savoir que autovacuum_vacuum_scale_factor (défaut 0.20) déclenche autovacuum quand 20% des lignes sont mortes',
          'Vérifier que autovacuum est toujours activé (autovacuum = on)',
        ],
        mnemonic: 'UPDATE = DELETE ancienne version + INSERT nouvelle version.',
        officialRef: 'EnterpriseDB Postgres Training - Routine Maintenance and Vacuuming',
      },
    },
    {
      id: 'pg-edb-dom-05',
      code: 'DOM-05 // BACKUP & RECOVERY',
      title: 'Sauvegardes Logiques & Physiques (pg_dump, WAL archiving, PITR)',
      desc: 'pg_dump, pg_dumpall, pg_basebackup, archivage continu des WAL (archive_command) et restauration à un point dans le temps (PITR).',
      sheetsRead: '3/5 fiches lues',
      percent: 65,
      weight: '20%',
      status: 'consolidating',
      statusLabel: 'En consolidation',
      badgeClass: 'bg-[#0b1c30] text-[#89ceff]',
      accentColor: '#89ceff',
      footnote: 'Fiches PITR validées',
      sheetDetail: {
        objectives: [
          'Créer des sauvegardes logiques avec pg_dump (formats : custom -Fc, directory -Fd, plain text)',
          'Utiliser pg_dumpall pour exporter l\'intégralité du cluster y compris les rôles globaux et tablespaces',
          'Restaurer avec pg_restore et psql',
          'Réaliser des sauvegardes physiques complètes avec pg_basebackup',
          'Configurer l\'archivage continu des journaux WAL (wal_level = replica, archive_mode = on, archive_command)',
          'Exécuter une restauration à un instant précis (Point-In-Time Recovery - PITR) avec recovery_target_time',
        ],
        keyConcepts: [
          {
            title: 'Sauvegarde Logique vs Sauvegarde Physique',
            description: 'pg_dump (logique) exporte les commandes SQL (CREATE, INSERT) ou un binaire portable. Ne sauvegarde pas les rôles ni les configurations globales du cluster (utiliser pg_dumpall --globals-only). pg_basebackup (physique) copie bloc à bloc les fichiers de $PGDATA pendant que le serveur tourne : beaucoup plus rapide pour les très grosses bases (plusieurs To).',
          },
          {
            title: 'Principe du PITR',
            description: 'Pour restaurer à 14h32 après un DROP TABLE accidentel : 1. Restaurer le pg_basebackup antérieur. 2. Créer le fichier signal recovery.signal. 3. Configurer restore_command pour rejouer les segments WAL archivés. 4. Définir recovery_target_time = \'2025-03-15 14:31:59\'.',
          },
        ],
        codeExamples: [
          {
            title: 'Sauvegarde physique à chaud avec pg_basebackup et archive_command',
            language: 'bash',
            code: `# Sauvegarde physique complète du cluster avec inclusion des WAL
pg_basebackup -h localhost -p 5432 -U replicator -D /backups/base_20250315 -Ft -z -P -Xs

# Configuration postgresql.conf pour archivage continu :
# wal_level = replica
# archive_mode = on
# archive_command = 'test ! -f /mnt/wal_archive/%f && cp %p /mnt/wal_archive/%f'`,
            explanation: 'archive_command expédie chaque segment de 16 Mo dès qu\'il est clos.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Oublier que pg_dump sur une seule base ne sauvegarde PAS les mots de passe et rôles',
            description: 'Les rôles et tablespaces sont stockés au niveau du cluster entier dans la base template/globale, non inclus dans pg_dump dbname.',
          },
        ],
        checklist: [
          'Retenir que recovery.signal indique au serveur de démarrer en mode récupération',
          'Savoir que pg_restore -j permet la restauration parallèle multithreadée',
        ],
        mnemonic: 'pg_dump = SQL/portabilité, pg_basebackup + WAL = zéro perte de données (RPO=0).',
        officialRef: 'EnterpriseDB Postgres Training - Backup, Recovery and PITR',
      },
    },
  ],

  // ==========================================
  // 5. ORACLE MYSQL 8.0 DBA (1Z0-908)
  // ==========================================
  'mysql-80-dba': [
    {
      id: 'mysql-908-dom-01',
      code: 'DOM-01 // INNODB ARCHITECTURE',
      title: 'Architecture du Serveur & Moteur de stockage InnoDB',
      desc: 'Structures mémoire (Buffer Pool, Log Buffer), structures disque (Tablespaces ibdata1 / file-per-table, Redo Log, Undo Log, Doublewrite Buffer).',
      sheetsRead: '4/5 fiches lues',
      percent: 85,
      weight: '22%',
      status: 'mastered',
      statusLabel: 'Maîtrisé',
      badgeClass: 'bg-[#003824] text-[#4edea3]',
      accentColor: '#4edea3',
      footnote: 'Fiches Buffer Pool révisées',
      sheetDetail: {
        objectives: [
          'Décrire l\'architecture du serveur MySQL : couche de connexion, optimiseur/analyseur SQL, couche des moteurs de stockage',
          'Configurer et dimensionner le Buffer Pool InnoDB (innodb_buffer_pool_size, instances, algorithme LRU)',
          'Comprendre le rôle et le fonctionnement du Doublewrite Buffer pour éviter la corruption de pages déchirées (torn pages)',
          'Administrer les Redo Logs (innodb_redo_log_capacity) et les Undo Tablespaces (troncature automatique)',
          'Gérer les fichiers tablespaces : innodb_file_per_table, tablespaces généraux, transport de tablespaces',
        ],
        keyConcepts: [
          {
            title: 'Le rôle crucial du Doublewrite Buffer',
            description: 'Dans les systèmes d\'exploitation, les blocs de disque sont souvent de 4 Ko alors que les pages InnoDB font 16 Ko. Si une panne survient pendant l\'écriture d\'une page, celle-ci est "déchirée" (partiellement écrite). Le Doublewrite Buffer écrit d\'abord les pages dans une zone contiguë séquentielle avant d\'écrire dans les fichiers de données finaux, permettant une restauration infaillible.',
          },
        ],
        codeExamples: [
          {
            title: 'Diagnostic de l\'état interne d\'InnoDB sous MySQL 8.0',
            language: 'sql',
            code: `-- Afficher les métriques de mémoire, I/O et verrous InnoDB
SHOW ENGINE INNODB STATUS\\G

-- Vérifier la taille et le taux de succès du Buffer Pool
SELECT 
  VARIABLE_NAME, 
  VARIABLE_VALUE 
FROM performance_schema.global_status 
WHERE VARIABLE_NAME IN ('Innodb_buffer_pool_read_requests', 'Innodb_buffer_pool_reads');`,
            explanation: 'Permet de calculer le hit ratio du Buffer Pool (généralement souhaité > 99%).',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Confondre le Redo Log et le Binary Log',
            description: 'Le Redo Log est propre à InnoDB et sert au crash recovery (rejouer les transactions validées non écrites sur disque). Le Binary Log (binlog) est au niveau du serveur MySQL global et sert à la réplication et aux restaurations Point-In-Time.',
          },
        ],
        checklist: [
          'Savoir que innodb_buffer_pool_size est dynamique sous MySQL 8.0 (modifiable sans redémarrage)',
          'Retenir que sous MySQL 8.0, innodb_file_per_table est activé par défaut (ON)',
        ],
        mnemonic: 'Buffer Pool = Cache RAM, Redo = Crash recovery InnoDB, Binlog = Réplication globale.',
        officialRef: 'Oracle MySQL 8.0 Reference Manual - The InnoDB Storage Engine',
      },
    },
    {
      id: 'mysql-908-dom-02',
      code: 'DOM-02 // PERFORMANCE & TUNING',
      title: 'Surveillance & Optimisation des Performances',
      desc: 'my.cnf, Slow Query Log, schéma Performance Schema, schéma sys, commande EXPLAIN et EXPLAIN ANALYZE.',
      sheetsRead: '3/5 fiches lues',
      percent: 65,
      weight: '20%',
      status: 'consolidating',
      statusLabel: 'En consolidation',
      badgeClass: 'bg-[#0b1c30] text-[#89ceff]',
      accentColor: '#89ceff',
      footnote: 'Pratique EXPLAIN ANALYZE',
      sheetDetail: {
        objectives: [
          'Configurer et analyser le Slow Query Log (slow_query_log, long_query_time, log_queries_not_using_indexes)',
          'Exploiter le Performance Schema et ses instruments/consommateurs pour tracer les goulets d\'étranglement',
          'Utiliser le schéma sys pour identifier les index inutilisés et les instructions les plus lentes',
          'Interpréter le plan d\'exécution avec EXPLAIN (types : system, const, eq_ref, ref, range, index, ALL)',
          'Utiliser EXPLAIN ANALYZE (introduit dans MySQL 8.0.18) pour comparer le coût estimé et le temps d\'exécution réel',
        ],
        keyConcepts: [
          {
            title: 'Hiérarchie des types de jointure dans EXPLAIN',
            description: 'Du meilleur au pire : const (clé primaire/unique avec valeur littérale) -> eq_ref (jointure sur clé primaire) -> ref (index non unique) -> range (parcours d\'intervalle) -> index (scan complet de l\'index) -> ALL (scan complet de table = danger absolu).',
          },
        ],
        codeExamples: [
          {
            title: 'Analyse d\'une requête avec EXPLAIN ANALYZE sous MySQL 8.0',
            language: 'sql',
            code: `EXPLAIN ANALYZE
SELECT c.customer_id, c.first_name, o.order_date, o.total_amount
FROM sakila.customer c
JOIN sakila.rental r ON c.customer_id = r.customer_id
JOIN sakila.payment o ON r.rental_id = o.rental_id
WHERE o.amount > 10.00;`,
            explanation: 'Affiche l\'arbre d\'exécution avec le temps au premier et au dernier enregistrement pour chaque étape.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Confondre le type index et ALL dans EXPLAIN',
            description: 'Le type "index" n\'est PAS un accès rapide par index : c\'est un scan complet de tout l\'index (Full Index Scan). Bien que souvent plus rapide qu\'un scan complet de table "ALL" en raison de la compacité de l\'index, il ne s\'agit pas d\'une recherche par clé ciblée.',
          },
        ],
        checklist: [
          'Vérifier sys.schema_unused_indexes pour repérer les index inutiles dégradant les performances DML',
          'Activer log_slow_extra pour inclure les détails des verrous dans le journal des requêtes lentes',
        ],
        mnemonic: 'EXPLAIN prédit, EXPLAIN ANALYZE exécute et mesure réellement.',
        officialRef: 'Oracle MySQL 8.0 Reference Manual - Optimization and EXPLAIN',
      },
    },
    {
      id: 'mysql-908-dom-03',
      code: 'DOM-03 // REPLICATION & HA',
      title: 'Haute Disponibilité & Réplication MySQL (GTID & Group Replication)',
      desc: 'Réplication basée sur les binlogs, GTID (Global Transaction Identifier), topologie Source/Replica, semi-synchrone et MySQL InnoDB Cluster (Group Replication).',
      sheetsRead: '3/5 fiches lues',
      percent: 58,
      weight: '20%',
      status: 'review_needed',
      statusLabel: 'À renforcer',
      badgeClass: 'bg-[#1b2b3f] text-[#93ccff]',
      accentColor: '#93ccff',
      footnote: '3 labs de configuration GTID',
      sheetDetail: {
        objectives: [
          'Configurer la réplication asynchrone traditionnelle basée sur coordonnées fichier/position',
          'Configurer la réplication moderne basée sur les GTID (gtid_mode = ON, enforce_gtid_consistency = ON)',
          'Démarrer et gérer les threads de réplication : IO Thread et SQL (Applier) Thread via START REPLICA',
          'Mettre en œuvre la réplication semi-synchrone (rpl_semi_sync_source_enabled)',
          'Comprendre les principes de MySQL Group Replication et MySQL InnoDB Cluster (Paxos consensus)',
        ],
        keyConcepts: [
          {
            title: 'Pourquoi les GTID simplifient le basculement',
            description: 'Un GTID (source_id:transaction_id) identifie de façon unique et universelle chaque transaction validée sur le cluster. Le replica sait automatiquement où reprendre sans que le DBA n\'ait à chercher manuellement les coordonnées MASTER_LOG_FILE et MASTER_LOG_POS.',
          },
        ],
        codeExamples: [
          {
            title: 'Configuration d\'un replica sous MySQL 8.0 avec syntaxe CHANGE REPLICATION SOURCE',
            language: 'sql',
            code: `-- Configuration du replica avec identifiant automatique GTID
CHANGE REPLICATION SOURCE TO
  SOURCE_HOST = '192.168.1.10',
  SOURCE_PORT = 3306,
  SOURCE_USER = 'repl_user',
  SOURCE_PASSWORD = 'ReplPassword!2025',
  SOURCE_AUTO_POSITION = 1,
  SOURCE_SSL = 1;

START REPLICA;
SHOW REPLICA STATUS\\G`,
            explanation: 'SOURCE_AUTO_POSITION = 1 active l\'échange automatique des transactions manquantes par GTID.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Utiliser l\'ancienne syntaxe CHANGE MASTER sous MySQL 8.0.22+',
            description: 'MySQL 8.0.22 a déprécié "CHANGE MASTER TO" et "SLAVE" au profit de la terminologie inclusive "CHANGE REPLICATION SOURCE TO" et "REPLICA".',
          },
        ],
        checklist: [
          'Vérifier que Replica_IO_Running et Replica_SQL_Running sont tous deux à Yes',
          'Savoir que server_id doit être strictement unique pour chaque membre du cluster',
        ],
        mnemonic: 'SOURCE_AUTO_POSITION = 1 avec GTID évite toute erreur manuelle de coordonnées.',
        officialRef: 'Oracle MySQL 8.0 Reference Manual - Replication and Group Replication',
      },
    },
    {
      id: 'mysql-908-dom-04',
      code: 'DOM-04 // SECURITY & ROLES',
      title: 'Sécurité, Gestion des Utilisateurs & Rôles',
      desc: 'Mécanisme d\'authentification caching_sha2_password, gestion des privilèges (statiques et dynamiques), rôles, validation des mots de passe et chiffrement.',
      sheetsRead: '4/5 fiches lues',
      percent: 78,
      weight: '18%',
      status: 'mastered',
      statusLabel: 'Maîtrisé',
      badgeClass: 'bg-[#003824] text-[#4edea3]',
      accentColor: '#4edea3',
      footnote: 'Fiches rôles et privilèges validées',
      sheetDetail: {
        objectives: [
          'Comprendre le plugin d\'authentification par défaut caching_sha2_password',
          'Créer des comptes avec spécification de l\'hôte (\'user\'@\'host\', wildcards %, sous-réseaux CIDR)',
          'Attribuer et révoquer des privilèges globaux, de base, de table et de colonne',
          'Utiliser les privilèges dynamiques de MySQL 8.0 (ex: BACKUP_ADMIN, SYSTEM_VARIABLES_ADMIN, INNODB_REDO_LOG_ENABLE)',
          'Créer, assigner et activer des Rôles (CREATE ROLE, SET DEFAULT ROLE)',
        ],
        keyConcepts: [
          {
            title: 'L\'hôte dans le compte utilisateur MySQL',
            description: 'Un compte MySQL est toujours défini par deux composantes : \'nom_utilisateur\'@\'nom_hôte\'. L\'utilisateur \'admin\'@\'localhost\' est un compte complètement DISTINCT de \'admin\'@\'%\'. MySQL utilise la règle de l\'hôte le plus spécifique en cas de concordance multiple.',
          },
        ],
        codeExamples: [
          {
            title: 'Création de rôle avec privilèges dynamiques et attribution',
            language: 'sql',
            code: `-- Créer un rôle pour l'équipe d'exploitation
CREATE ROLE 'backup_operator';
GRANT BACKUP_ADMIN, RELOAD, SELECT ON *.* TO 'backup_operator';

CREATE USER 'sammy'@'192.168.1.%' IDENTIFIED BY 'VerySecurePass#2025';
GRANT 'backup_operator' TO 'sammy'@'192.168.1.%';
SET DEFAULT ROLE 'backup_operator' TO 'sammy'@'192.168.1.%';`,
            explanation: 'SET DEFAULT ROLE garantit que le rôle est actif dès la connexion sans avoir à exécuter SET ROLE.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Oublier d\'activer le rôle avec SET DEFAULT ROLE',
            description: 'Si un rôle est accordé (GRANT role TO user) mais n\'est pas configuré comme rôle par défaut, l\'utilisateur se connecte sans aucun privilège tant qu\'il n\'exécute pas SET ROLE role_name;',
          },
        ],
        checklist: [
          'Connaître le composant validate_password et ses politiques (LOW, MEDIUM, STRONG)',
          'Utiliser mysql_secure_installation pour supprimer les comptes anonymes et la base test',
        ],
        mnemonic: 'User@Host : L\'hôte le plus spécifique a toujours la priorité.',
        officialRef: 'Oracle MySQL 8.0 Reference Manual - Security and Account Management',
      },
    },
    {
      id: 'mysql-908-dom-05',
      code: 'DOM-05 // BACKUPS & UTILITIES',
      title: 'Sauvegardes, Restauration & Utilitaires MySQL Shell',
      desc: 'mysqldump (sauvegarde logique), MySQL Enterprise Backup (sauvegarde physique à chaud), et les utilitaires modernes de MySQL Shell (util.dumpInstance, util.loadDump).',
      sheetsRead: '3/5 fiches lues',
      percent: 62,
      weight: '20%',
      status: 'consolidating',
      statusLabel: 'En consolidation',
      badgeClass: 'bg-[#0b1c30] text-[#89ceff]',
      accentColor: '#89ceff',
      footnote: 'Fiches MySQL Shell complétées',
      sheetDetail: {
        objectives: [
          'Créer des sauvegardes cohérentes avec mysqldump (--single-transaction, --master-data=2 / --source-data=2)',
          'Comprendre MySQL Enterprise Backup (MEB) et les sauvegardes physiques incrémentielles à chaud',
          'Utiliser les utilitaires haute vitesse de MySQL Shell : util.dumpInstance(), util.dumpSchemas(), util.loadDump() avec multithreading et compression ZSTD',
          'Mener une restauration Point-in-Time en appliquant les binlogs avec mysqlbinlog',
        ],
        keyConcepts: [
          {
            title: 'mysqldump avec --single-transaction',
            description: 'Pour les tables InnoDB, l\'option --single-transaction positionne le niveau d\'isolation sur REPEATABLE READ et prend une sauvegarde cohérente sans poser de verrou bloquant sur les tables. Piège : si une seule table non-InnoDB (ex: MyISAM) est présente, la cohérence n\'est pas garantie sans verrous.',
          },
          {
            title: 'MySQL Shell Dump & Load vs mysqldump',
            description: 'MySQL Shell util.dumpInstance() découpe les tables volumineuses en morceaux et écrit en parallèle avec de multiples threads tout en compressant. La vitesse de sauvegarde et de restauration (util.loadDump) est souvent 10 à 30 fois plus rapide que mysqldump !',
          },
        ],
        codeExamples: [
          {
            title: 'Sauvegarde moderne ultra-rapide avec MySQL Shell',
            language: 'javascript',
            code: `// Dans MySQL Shell en mode JavaScript :
util.dumpInstance('/backups/full_instance_20250315', {
  threads: 8,
  compression: 'zstd',
  consistent: true,
  showProgress: true
});

// Restauration parallèle correspondante :
util.loadDump('/backups/full_instance_20250315', {
  threads: 8,
  resetProgress: true
});`,
            explanation: 'Utilise le parallélisme 8 threads et la compression Zstandard pour des performances d\'entreprise maximales.',
          },
        ],
        examTraps: [
          {
            trapTitle: 'Oublier --single-transaction dans mysqldump sur un serveur de production',
            description: 'Sans --single-transaction, mysqldump exécute LOCK TABLES et bloque complètement les transactions d\'écriture sur toute l\'application pendant toute la durée du dump.',
          },
        ],
        checklist: [
          'Savoir rejouer un binlog avec mysqlbinlog --start-datetime / --stop-datetime',
          'Retenir que MySQL Shell est l\'outil privilégié par Oracle pour les migrations cloud OCI',
        ],
        mnemonic: 'InnoDB = --single-transaction obligatoire avec mysqldump.',
        officialRef: 'Oracle MySQL 8.0 Reference Manual - Backup and Recovery',
      },
    },
  ],
};

// ==========================================
// CHEAT SHEETS PAR CERTIFICATION
// ==========================================
export const certificationCheatSheets: Record<CertificationTrackId, CheatSheet[]> = {
  'oracle-1z0-071': [
    {
      id: 'oracle-sheet-1',
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
      id: 'oracle-sheet-2',
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
      id: 'oracle-sheet-3',
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
  ],

  'azure-dp-900': [
    {
      id: 'dp900-sheet-1',
      number: 1,
      tag: 'COSMOS DB MULTI-API',
      badgeType: 'matrix',
      title: 'Sélection de l\'API Azure Cosmos DB',
      summary: 'Matrice officielle de correspondance des APIs Cosmos DB selon le type de données et les SDKs clients sources.',
      tableData: {
        headers: ['Modèle de Données', 'API Cosmos DB', 'Format de Stockage', 'Cas d\'usage typique'],
        rows: [
          ['Document JSON', 'API for NoSQL (Core)', 'JSON dynamique', 'Applications web, profils, catalogues e-commerce'],
          ['Document BSON', 'API for MongoDB', 'BSON / JSON', 'Migration d\'apps MongoDB existantes sans refactor'],
          ['Graphes / Réseaux', 'API for Gremlin', 'Nœuds & Arêtes', 'Réseaux sociaux, détection de fraude, arbres généalogiques'],
          ['Colonnes Larges', 'API for Cassandra', 'Tables partitionnées', 'Télémétrie IoT, séries temporelles distribuées'],
          ['Clé-Valeur simple', 'API for Table', 'Entités clé-valeur', 'Migration d\'Azure Table Storage existant'],
        ],
      },
    },
    {
      id: 'dp900-sheet-2',
      number: 2,
      tag: 'STOCKAGE AZURE BLOB',
      badgeType: 'trap',
      title: 'Hiérarchie des Tiers de Stockage Blob',
      summary: 'Comparatif d\'accès, coûts et temps de réhydratation entre Hot, Cool, Cold et Archive.',
      rules: {
        allowed: {
          title: 'Niveaux Chaud (Hot) & Froid (Cool)',
          subtitle: 'Données en ligne directes',
          desc: 'Hot pour données actives. Cool pour données consultées au moins une fois par mois (conservation min. 30j). Lecture instantanée.',
        },
        prohibited: {
          title: 'Niveau Archive (Hors-ligne)',
          subtitle: 'Stockage à froid profond',
          desc: 'Stockage quasi gratuit mais lecture directe IMPOSSIBLE. Réhydratation obligatoire prenant de 1h (haute priorité) à 15h.',
        },
        keyClause: 'Toute tentative de lecture directe sur un blob au niveau Archive déclenche une erreur 409 Conflict.',
      },
    },
    {
      id: 'dp900-sheet-3',
      number: 3,
      tag: 'SYNAPSE VS DATABRICKS',
      badgeType: 'ddl',
      title: 'Composants Analytiques Modernes',
      summary: 'Distinction clé entre Azure Synapse, Databricks et Azure Data Factory pour l\'examen.',
      codeSnippet: `-- Pipeline analytique standard Azure :
1. Ingestion : Azure Data Factory / Synapse Pipelines (ETL / ELT)
2. Stockage brut : Azure Data Lake Storage Gen2 (Parquet / Delta Lake)
3. Transformation & ML : Azure Databricks ou Synapse Spark Pools
4. Data Warehouse relationnel : Azure Synapse Dedicated SQL Pool
5. Restitution décisionnelle : Power BI Desktop & Service`,
      mnemonicTip: 'ADF = Les tuyaux d\'ingestion, ADLS Gen2 = Le lac de stockage, Synapse = L\'entrepôt SQL, Power BI = L\'écran de reporting.',
    },
  ],

  'azure-dp-800': [
    {
      id: 'dp800-sheet-1',
      number: 1,
      tag: 'HAUTE DISPONIBILITÉ AZURE',
      badgeType: 'matrix',
      title: 'Niveaux de Service Azure SQL Database',
      summary: 'Différences architecturales majeures entre General Purpose, Business Critical et Hyperscale.',
      tableData: {
        headers: ['Critère', 'General Purpose', 'Business Critical', 'Hyperscale'],
        rows: [
          ['Type de stockage', 'Stockage Azure distant (NAS)', 'SSD NVMe local ultra-rapide', 'Cache SSD local + Page Servers distants'],
          ['Haute Disponibilité', 'Basculement vers nœud passif', 'Always On AG 4 nœuds inclus', '0 à 4 réplicas en lecture configurables'],
          ['Taille maximale', '4 To', '4 To', '100 To+'],
          ['Sauvegarde', 'Standard automatique', 'Standard automatique', 'Snapshots de stockage instantanés'],
        ],
      },
    },
    {
      id: 'dp800-sheet-2',
      number: 2,
      tag: 'SÉCURITÉ & CHIFFREMENT',
      badgeType: 'trap',
      title: 'TDE vs Always Encrypted vs DDM',
      summary: 'Règles de sécurité indispensables pour réussir les questions d\'architecture sécurisée DP-300 / DP-800.',
      rules: {
        allowed: {
          title: 'Chiffrement Réel (TDE & Always Encrypted)',
          subtitle: 'Cryptographie appliquée',
          desc: 'TDE protège contre le vol de fichiers physiques MDF/sauvegardes. Always Encrypted protège les données même face à un administrateur DBA curieux.',
        },
        prohibited: {
          title: 'Masquage Dynamique (DDM)',
          subtitle: 'Protection cosmétique uniquement',
          desc: 'DDM ne chiffre RIEN sur le disque ni en mémoire. Les utilisateurs avec le privilège UNMASK voient la donnée brute.',
        },
        keyClause: 'Dynamic Data Masking ne remplace JAMAIS un chiffrement de colonne lorsque la conformité RGPD/HIPAA l\'exige.',
      },
    },
    {
      id: 'dp800-sheet-3',
      number: 3,
      tag: 'OPTIMISATION QUERY STORE',
      badgeType: 'ddl',
      title: 'Forçage de Plan avec sp_query_store_force_plan',
      summary: 'Procédure d\'intervention rapide en cas de régression de performance soudaine sur une procédure stockée critique.',
      codeSnippet: `-- Vérifier l'historique des plans d'exécution dans Query Store
SELECT plan_id, query_id, count_executions, avg_duration
FROM sys.query_store_plan
WHERE query_id = 42;

-- Forcer le plan stable antérieur n°7
EXEC sp_query_store_force_plan 
  @query_id = 42, 
  @plan_id = 7;`,
      mnemonicTip: 'Si le plan forcé échoue suite à la suppression d\'un index, Query Store passe le statut en "Failed" et recompile.',
    },
  ],

  'postgres-edb': [
    {
      id: 'pg-sheet-1',
      number: 1,
      tag: 'MAINTENANCE MVCC',
      badgeType: 'trap',
      title: 'VACUUM Standard vs VACUUM FULL',
      summary: 'Différence critique entre la récupération d\'espace en ligne et le compactage bloquant sous PostgreSQL.',
      rules: {
        allowed: {
          title: 'VACUUM Standard (En ligne)',
          subtitle: 'Verrou ShareUpdateExclusiveLock',
          desc: 'Marque les dead tuples comme réutilisables dans la FSM (Free Space Map). N\'empêche ni les lectures (SELECT) ni les écritures (INSERT/UPDATE). Ne rend pas l\'espace au système d\'exploitation.',
        },
        prohibited: {
          title: 'VACUUM FULL (Exclusif lourd)',
          subtitle: 'Verrou AccessExclusiveLock',
          desc: 'Bloque TOTALEMENT la table. Réécrit l\'intégralité de la table dans un nouveau fichier physique. Nécessite 2x l\'espace disque de la table.',
        },
        keyClause: 'En production, préférez toujours l\'outil open-source pg_repack pour compacter une table sans verrouillage exclusif.',
      },
    },
    {
      id: 'pg-sheet-2',
      number: 2,
      tag: 'CONTRÔLE D\'ACCÈS PG_HBA',
      badgeType: 'matrix',
      title: 'Structure d\'une règle dans pg_hba.conf',
      summary: 'Composantes séquentielles d\'une ligne de filtrage réseau dans PostgreSQL.',
      tableData: {
        headers: ['Type', 'Base de données', 'Utilisateur', 'Adresse Client', 'Méthode d\'Auth'],
        rows: [
          ['local', 'all', 'postgres', '(aucun - socket unix)', 'peer'],
          ['host', 'all', 'all', '127.0.0.1/32', 'scram-sha-256'],
          ['hostssl', 'prod_db', 'app_user', '10.0.0.0/16', 'scram-sha-256'],
          ['host', 'all', 'all', '0.0.0.0/0', 'reject'],
        ],
      },
    },
    {
      id: 'pg-sheet-3',
      number: 3,
      tag: 'RESTAURATION PITR',
      badgeType: 'ddl',
      title: 'Fichiers & Paramètres pour Point-In-Time Recovery',
      summary: 'Les 3 étapes fondamentales pour rejouer les segments WAL jusqu\'à une seconde précise.',
      codeSnippet: `# 1. Placer le fichier déclencheur dans $PGDATA
touch $PGDATA/recovery.signal

# 2. Configurer dans postgresql.conf la commande de restauration WAL
restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p'

# 3. Définir le point d'arrêt précis
recovery_target_time = '2025-03-15 14:32:00'
recovery_target_action = 'promote'`,
      mnemonicTip: 'Sans recovery.signal sous PostgreSQL 12+, le serveur démarre normalement sans rejouer les WAL.',
    },
  ],

  'mysql-80-dba': [
    {
      id: 'mysql-sheet-1',
      number: 1,
      tag: 'MOTEUR INNODB INTERNE',
      badgeType: 'trap',
      title: 'Doublewrite Buffer & Pages Déchirées',
      summary: 'Comprendre pourquoi le Doublewrite Buffer protège MySQL contre les corruptions matérielles.',
      rules: {
        allowed: {
          title: 'Écriture Doublewrite Buffer',
          subtitle: 'Zone contiguë séquentielle',
          desc: 'Avant d\'écrire les pages de 16 Ko sur les tablespaces (.ibd), InnoDB les écrit d\'abord d\'un seul tenant dans le doublewrite buffer.',
        },
        prohibited: {
          title: 'Panne pendant l\'écriture directe',
          subtitle: 'Torn Page (Page déchirée)',
          desc: 'Si l\'OS plante au milieu des 4 blocs de 4 Ko, la page est corrompue. Au redémarrage, InnoDB restaure la page intacte depuis le doublewrite buffer.',
        },
        keyClause: 'Désactiver innodb_doublewrite ne doit être envisagé QUE sur des systèmes de fichiers garantissant l\'écriture atomique de 16 Ko (comme ZFS).',
      },
    },
    {
      id: 'mysql-sheet-2',
      number: 2,
      tag: 'RÉPLICATION GTID',
      badgeType: 'matrix',
      title: 'GTID vs Coordonnées Binlog Fichier/Position',
      summary: 'Comparatif d\'administration de la réplication MySQL 8.0.',
      tableData: {
        headers: ['Fonctionnalité', 'Réplication Fichier / Position', 'Réplication basée sur GTID'],
        rows: [
          ['Identification', 'Nom du fichier (ex: binlog.000042) + offset', 'UUID_Serveur:Transaction_ID (ex: 3E11FA47-...:1-45)'],
          ['Basculement (Failover)', 'Recherche manuelle complexe des coordonnées', 'Totalement automatisé via SOURCE_AUTO_POSITION = 1'],
          ['Risque d\'incohérence', 'Élevé en cas d\'erreur de position', 'Nul grâce au contrôle strict des transactions rejouées'],
          ['Recommandation Oracle', 'Déconseillé pour nouvelles installations', 'Standard impératif pour l\'examen 1Z0-908'],
        ],
      },
    },
    {
      id: 'mysql-sheet-3',
      number: 3,
      tag: 'UTILITAIRES MYSQL SHELL',
      badgeType: 'ddl',
      title: 'MySQL Shell Dump & Load vs mysqldump',
      summary: 'Pourquoi MySQL Shell supplante mysqldump dans les architectures modernes.',
      codeSnippet: `// Sauvegarde parallèle multi-thread avec util.dumpInstance
util.dumpInstance('/backups/mysql_full', {
  threads: 8,
  compression: 'zstd',
  chunking: true
});

// Restauration parallèle correspondante
util.loadDump('/backups/mysql_full', {
  threads: 8
});`,
      mnemonicTip: 'mysqldump est mono-thread. MySQL Shell utilise tous les cœurs CPU disponibles pour un débit 15x plus rapide.',
    },
  ],
};

// ==========================================
// PILIERS DE MOTS-CLÉS PAR CERTIFICATION
// ==========================================
export const certificationKeywordsPillars: Record<CertificationTrackId, KeywordPillar[]> = {
  'oracle-1z0-071': [
    {
      title: '1. Maîtrise des NULL & Logique',
      color: '#4edea3',
      keywords: ['NVL', 'NVL2', 'NULLIF', 'COALESCE', 'IS NULL', 'THREE-VALUED LOGIC'],
    },
    {
      title: '2. Jointures & Syntaxe ANSI',
      color: '#89ceff',
      keywords: ['NATURAL JOIN', 'USING', 'ON', 'CROSS JOIN', 'FULL OUTER', '(+)'],
    },
    {
      title: '3. Objets Dictionnaire de données',
      color: '#93ccff',
      keywords: ['USER_TABLES', 'ALL_VIEWS', 'DBA_INDEXES', 'USER_SEQUENCES', 'RECYCLEBIN'],
    },
    {
      title: '4. DDL, DML & Transactions',
      color: '#ffb4ab',
      keywords: ['COMMIT', 'ROLLBACK', 'SAVEPOINT', 'FLASHBACK', 'TRUNCATE', 'CASCADE'],
    },
  ],

  'azure-dp-900': [
    {
      title: '1. Modèles de Données & Formats',
      color: '#4edea3',
      keywords: ['RELATIONAL', 'SEMI-STRUCTURED', 'UNSTRUCTURED', 'JSON', 'PARQUET', 'ACID'],
    },
    {
      title: '2. Écosystème Azure SQL (PaaS / IaaS)',
      color: '#89ceff',
      keywords: ['AZURE SQL DB', 'MANAGED INSTANCE', 'HYPERSCALE', 'ELASTIC POOL', 'vCORE'],
    },
    {
      title: '3. NoSQL & Azure Cosmos DB',
      color: '#93ccff',
      keywords: ['API FOR NOSQL', 'MONGODB', 'GREMLIN', 'CASSANDRA', 'TABLE', 'BLOB STORAGE'],
    },
    {
      title: '4. Big Data, Synapse & Power BI',
      color: '#f59e0b',
      keywords: ['DATA LAKE GEN2', 'SYNAPSE SQL', 'SPARK POOLS', 'DATA FACTORY', 'POWER BI'],
    },
  ],

  'azure-dp-800': [
    {
      title: '1. Déploiement & Calcul Élastique',
      color: '#3198dc',
      keywords: ['GENERAL PURPOSE', 'BUSINESS CRITICAL', 'HYPERSCALE', 'DTU vs vCORE', 'ELASTIC POOLS'],
    },
    {
      title: '2. Sécurité, Chiffrement & RLS',
      color: '#4edea3',
      keywords: ['TDE + KEY VAULT', 'ALWAYS ENCRYPTED', 'DYNAMIC DATA MASKING', 'ROW-LEVEL SEC', 'ENTRA ID'],
    },
    {
      title: '3. Surveillance & Performance Query Store',
      color: '#93ccff',
      keywords: ['QUERY STORE', 'FORCE PLAN', 'sys.dm_exec_*', 'WAIT STATS', 'AUTOMATIC TUNING'],
    },
    {
      title: '4. Haute Disponibilité & BCDR',
      color: '#f59e0b',
      keywords: ['AUTO-FAILOVER GROUPS', 'GEO-REPLICATION', 'PITR', 'LTR BACKUP', 'RPO / RTO'],
    },
  ],

  'postgres-edb': [
    {
      title: '1. Architecture & Mémoire',
      color: '#4edea3',
      keywords: ['shared_buffers', 'work_mem', 'maintenance_work_mem', 'Postmaster', 'BgWriter'],
    },
    {
      title: '2. Contrôle Réseau & Rôles',
      color: '#89ceff',
      keywords: ['pg_hba.conf', 'scram-sha-256', 'CREATE ROLE', 'LOGIN', 'search_path', 'GRANT'],
    },
    {
      title: '3. Modèle MVCC & Autovacuum',
      color: '#93ccff',
      keywords: ['xmin / xmax', 'Dead Tuples', 'VACUUM ANALYZE', 'VACUUM FULL', 'XID Wraparound'],
    },
    {
      title: '4. Sauvegarde & Archivage WAL',
      color: '#ffb4ab',
      keywords: ['pg_dump', 'pg_dumpall', 'pg_basebackup', 'archive_command', 'recovery.signal', 'PITR'],
    },
  ],

  'mysql-80-dba': [
    {
      title: '1. Moteur de Stockage InnoDB',
      color: '#f59e0b',
      keywords: ['Buffer Pool', 'Doublewrite Buffer', 'Redo Log', 'Undo Log', 'ibdata1', '.ibd'],
    },
    {
      title: '2. Optimisation & Diagnostics',
      color: '#4edea3',
      keywords: ['EXPLAIN ANALYZE', 'Performance Schema', 'sys schema', 'Slow Query Log', 'my.cnf'],
    },
    {
      title: '3. Réplication & Cluster HA',
      color: '#89ceff',
      keywords: ['GTID', 'binlog', 'SOURCE_AUTO_POSITION', 'Group Replication', 'InnoDB Cluster'],
    },
    {
      title: '4. Sécurité & Utilitaires Modernes',
      color: '#93ccff',
      keywords: ['caching_sha2_password', 'CREATE ROLE', 'MySQL Shell', 'util.dumpInstance', 'MEB'],
    },
  ],
};
