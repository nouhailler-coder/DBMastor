import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper de fallback pédagogique déterministe
function generateLocalMistakeExplanation({
  chosenLetter,
  chosenText,
  correctLetter,
  correctText,
  conceptName,
  questionPrompt,
  explanation,
  isFr,
}: {
  chosenLetter: string;
  chosenText: string;
  correctLetter: string;
  correctText: string;
  conceptName: string;
  questionPrompt: string;
  explanation: string;
  isFr: boolean;
}) {
  const lowerPrompt = (questionPrompt + ' ' + conceptName + ' ' + explanation).toLowerCase();

  // Cas WHERE vs HAVING
  if (lowerPrompt.includes('having') || lowerPrompt.includes('group by') || lowerPrompt.includes('agrégat')) {
    return isFr ? {
      chosenSummary: `Tu as choisi ${chosenLetter}.`,
      correctSummary: `La bonne réponse est ${correctLetter}.`,
      trapOrigin: 'Le piège vient de la différence entre WHERE et HAVING.',
      bulletPoints: [
        'WHERE filtre les lignes individuelles AVANT le regroupement (GROUP BY).',
        'HAVING filtre les groupes résultants APRÈS l\'agrégation.',
        'Une fonction d\'agrégat (ex: COUNT, SUM, AVG) ne peut JAMAIS être évaluée dans la clause WHERE.',
      ],
      keyTakeaway: '💡 À retenir :\nWHERE → filtre les lignes\nHAVING → filtre les groupes',
    } : {
      chosenSummary: `You chose ${chosenLetter}.`,
      correctSummary: `The correct answer is ${correctLetter}.`,
      trapOrigin: 'The trap lies in the core distinction between WHERE and HAVING.',
      bulletPoints: [
        'WHERE filters individual rows BEFORE grouping (GROUP BY).',
        'HAVING filters aggregated groups AFTER group formation.',
        'Aggregate functions (e.g., COUNT, SUM, AVG) cannot appear in WHERE predicates.',
      ],
      keyTakeaway: '💡 Key Takeaway:\nWHERE → rows\nHAVING → groups',
    };
  }

  // Cas Index composite et leading column
  if (lowerPrompt.includes('index') || lowerPrompt.includes('colonne directrice') || lowerPrompt.includes('b-tree')) {
    return isFr ? {
      chosenSummary: `Tu as choisi ${chosenLetter}.`,
      correctSummary: `La bonne réponse est ${correctLetter}.`,
      trapOrigin: 'Le piège vient de la règle de la colonne directrice (Leftmost Prefix Rule) d\'un index composite.',
      bulletPoints: [
        'Un index composite sur (A, B, C) n\'est utilisable en recherche d\'arbre que si la colonne A est présente dans le prédicat.',
        'Filtrer uniquement sur B ou C oblige le SGBD à faire un Index Full Scan ou un Table Full Scan.',
        'L\'ordre de déclaration des colonnes dans CREATE INDEX est déterminant pour l\'efficacité.',
      ],
      keyTakeaway: '💡 À retenir :\nColonne 1 présente → Index Range Scan rapide\nColonne 1 absente → Balayage complet (Scan)',
    } : {
      chosenSummary: `You chose ${chosenLetter}.`,
      correctSummary: `The correct answer is ${correctLetter}.`,
      trapOrigin: 'The trap stems from the Leftmost Prefix Rule of composite B-Tree indexes.',
      bulletPoints: [
        'A composite index on (A, B, C) can only seek if the leading column A is tested.',
        'Filtering only on B or C triggers an index skip scan or full table scan.',
        'Column declaration order strictly dictates seekability.',
      ],
      keyTakeaway: '💡 Key Takeaway:\nLeading column present → Fast Index Seek\nLeading column missing → Full Scan',
    };
  }

  // Cas Transactions & Niveaux d'isolation (ACID)
  if (lowerPrompt.includes('isolation') || lowerPrompt.includes('serializable') || lowerPrompt.includes('fantôme') || lowerPrompt.includes('read committed')) {
    return isFr ? {
      chosenSummary: `Tu as choisi ${chosenLetter}.`,
      correctSummary: `La bonne réponse est ${correctLetter}.`,
      trapOrigin: 'Le piège vient de la frontière entre lecture non reproductible et lecture fantôme.',
      bulletPoints: [
        'READ COMMITTED : voit les commits concurrents, autorise les lectures non reproductibles.',
        'REPEATABLE READ : garantit que les lignes lues ne changent pas, mais autorise parfois l\'insertion de nouvelles lignes (fantômes).',
        'SERIALIZABLE : isolation totale interdisant toute anomalie de concurrence.',
      ],
      keyTakeaway: '💡 À retenir :\nLignes existantes modifiées → Non-Repeatable Read\nNouvelles lignes insérées → Phantom Read',
    } : {
      chosenSummary: `You chose ${chosenLetter}.`,
      correctSummary: `The correct answer is ${correctLetter}.`,
      trapOrigin: 'The trap lies between Non-Repeatable Read and Phantom Read anomalies.',
      bulletPoints: [
        'READ COMMITTED permits non-repeatable reads and phantom inserts.',
        'REPEATABLE READ locks existing rows but may allow new inserts.',
        'SERIALIZABLE completely isolates transactions against all anomalies.',
      ],
      keyTakeaway: '💡 Key Takeaway:\nModified rows → Non-Repeatable Read\nNewly inserted rows → Phantom Read',
    };
  }

  // Cas Jointure externe ON vs WHERE
  if (lowerPrompt.includes('join') || lowerPrompt.includes('jointure') || lowerPrompt.includes('left join')) {
    return isFr ? {
      chosenSummary: `Tu as choisi ${chosenLetter}.`,
      correctSummary: `La bonne réponse est ${correctLetter}.`,
      trapOrigin: 'Le piège vient du moment où le prédicat s\'applique dans une jointure externe (LEFT JOIN).',
      bulletPoints: [
        'Dans ON : conditionne l\'appariement de la table de droite sans éliminer les lignes de la table de gauche.',
        'Dans WHERE : s\'applique APRÈS la jointure et élimine les lignes NULL, transformant de facto le LEFT JOIN en INNER JOIN !',
      ],
      keyTakeaway: '💡 À retenir :\nFiltre dans ON → préserve toutes les lignes de gauche\nFiltre dans WHERE → filtre les résultats finaux (perte du LEFT JOIN)',
    } : {
      chosenSummary: `You chose ${chosenLetter}.`,
      correctSummary: `The correct answer is ${correctLetter}.`,
      trapOrigin: 'The trap lies in WHERE vs ON predicate placement during an outer join.',
      bulletPoints: [
        'Predicate in ON governs matching without discarding left table rows.',
        'Predicate in WHERE filters post-join, converting a LEFT JOIN into an accidental INNER JOIN.',
      ],
      keyTakeaway: '💡 Key Takeaway:\nON condition → keeps unmatched left rows\nWHERE condition → eliminates NULLs (acts as INNER JOIN)',
    };
  }

  // Explication générique structurée
  return isFr ? {
    chosenSummary: `Tu as choisi ${chosenLetter}.`,
    correctSummary: `La bonne réponse est ${correctLetter}.`,
    trapOrigin: `Le piège repose sur les règles fondamentales de : ${conceptName || 'cette notion SQL'}.`,
    bulletPoints: [
      explanation ? explanation.slice(0, 140) + '...' : 'La norme SQL impose une priorité stricte d\'évaluation.',
      `L'option ${chosenLetter} confond le comportement standard avec une exception spécifique.`,
      `L'option ${correctLetter} applique rigoureusement le standard ANSI et les garanties d'intégrité.`,
    ],
    keyTakeaway: `💡 À retenir :\n${chosenLetter} → confusion fréquente\n${correctLetter} → règle standard officielle`,
  } : {
    chosenSummary: `You chose ${chosenLetter}.`,
    correctSummary: `The correct answer is ${correctLetter}.`,
    trapOrigin: `The trap revolves around core mechanics of: ${conceptName || 'this SQL concept'}.`,
    bulletPoints: [
      explanation ? explanation.slice(0, 140) + '...' : 'SQL standard rules enforce a strict order of evaluation.',
      `Option ${chosenLetter} confuses standard behavior with an edge-case assumption.`,
      `Option ${correctLetter} strictly honors ANSI specifications.`,
    ],
    keyTakeaway: `💡 Key Takeaway:\n${chosenLetter} → common trap\n${correctLetter} → official standard rule`,
  };
}

// Helper de génération de question similaire locale
function generateLocalSimilarQuestion({
  conceptName,
  originalPrompt,
  isFr,
}: {
  conceptName: string;
  originalPrompt: string;
  isFr: boolean;
}) {
  const lower = (conceptName + ' ' + originalPrompt).toLowerCase();

  if (lower.includes('having') || lower.includes('group by') || lower.includes('agrégat') || lower.includes('where')) {
    return isFr ? {
      prompt: 'Dans la table `employees`, on souhaite afficher les départements comptant plus de 5 salariés ayant un salaire supérieur à 3 000 €. Quelle est la requête SQL syntaxiquement et logiquement exacte ?',
      codeSnippet: `-- Option A :\nSELECT department_id, COUNT(*) FROM employees WHERE salary > 3000 AND COUNT(*) > 5 GROUP BY department_id;\n-- Option B :\nSELECT department_id, COUNT(*) FROM employees WHERE salary > 3000 GROUP BY department_id HAVING COUNT(*) > 5;`,
      options: [
        { id: 'A', letter: 'A', text: 'Placer COUNT(*) > 5 dans la clause WHERE avec le salaire.' },
        { id: 'B', letter: 'B', text: 'WHERE salary > 3000 GROUP BY department_id HAVING COUNT(*) > 5 (correct).' },
        { id: 'C', letter: 'C', text: 'HAVING salary > 3000 GROUP BY department_id WHERE COUNT(*) > 5.' },
        { id: 'D', letter: 'D', text: 'Il est impossible de combiner WHERE et HAVING dans la même requête.' },
      ],
      correctOptionId: 'B',
      explanation: 'WHERE salary > 3000 filtre d\'abord les employés individuellement, puis GROUP BY regroupe par département, et HAVING COUNT(*) > 5 filtre les groupes résultants.',
      takeaway: 'WHERE filtre les lignes sources, HAVING filtre les métriques agrégées.',
    } : {
      prompt: 'In table `employees`, you want to display departments with more than 5 employees whose salary exceeds $3,000. Which SQL statement is correct?',
      codeSnippet: `SELECT department_id, COUNT(*) FROM employees WHERE salary > 3000 GROUP BY department_id HAVING COUNT(*) > 5;`,
      options: [
        { id: 'A', letter: 'A', text: 'Place COUNT(*) > 5 in the WHERE clause.' },
        { id: 'B', letter: 'B', text: 'Filter salary > 3000 in WHERE, then filter COUNT(*) > 5 in HAVING.' },
        { id: 'C', letter: 'C', text: 'Place both predicates in HAVING.' },
        { id: 'D', letter: 'D', text: 'WHERE and HAVING cannot coexist in one statement.' },
      ],
      correctOptionId: 'B',
      explanation: 'WHERE filters rows before aggregation; HAVING filters groups after aggregation.',
      takeaway: 'WHERE → row filter, HAVING → group filter.',
    };
  }

  // Question de pratique par défaut sur l'intégrité et indexation
  return isFr ? {
    prompt: 'Soit un index composite `CREATE INDEX idx_emp_dept_job ON employees(department_id, job_id)`. Laquelle des requêtes suivantes tirera pleinement parti de la colonne directrice en recherche d\'arbre (Index Range Scan) ?',
    codeSnippet: `SELECT * FROM employees WHERE department_id = 50 AND job_id = 'IT_PROG';`,
    options: [
      { id: 'A', letter: 'A', text: 'SELECT * FROM employees WHERE job_id = \'IT_PROG\';' },
      { id: 'B', letter: 'B', text: 'SELECT * FROM employees WHERE department_id = 50;' },
      { id: 'C', letter: 'C', text: 'SELECT * FROM employees WHERE UPPER(department_id) = 50;' },
      { id: 'D', letter: 'D', text: 'SELECT * FROM employees WHERE job_id LIKE \'%PROG\';' },
    ],
    correctOptionId: 'B',
    explanation: 'La colonne directrice `department_id` est spécifiée seule, ce qui permet un parcours direct de l\'arbre d\'index. L\'option A commence par la seconde colonne et ne peut pas faire de seek.',
    takeaway: 'Un index composite (A, B) s\'utilise sur A, ou sur A et B, mais pas sur B seul.',
  } : {
    prompt: 'Given a composite index `CREATE INDEX idx_emp_dept_job ON employees(department_id, job_id)`. Which query exploits the index leading column for an Index Range Scan?',
    codeSnippet: `SELECT * FROM employees WHERE department_id = 50;`,
    options: [
      { id: 'A', letter: 'A', text: 'WHERE job_id = \'IT_PROG\';' },
      { id: 'B', letter: 'B', text: 'WHERE department_id = 50;' },
      { id: 'C', letter: 'C', text: 'WHERE UPPER(department_id) = 50;' },
      { id: 'D', letter: 'D', text: 'WHERE job_id LIKE \'%PROG\';' },
    ],
    correctOptionId: 'B',
    explanation: 'The leading column department_id is queried, satisfying the leftmost prefix requirement.',
    takeaway: 'Composite index (A, B) requires column A in the predicate for an index seek.',
  };
}

// Fallback déterministe pour la séance d'entraînement ciblée (10 questions)
function generateLocalTargetedSession(isFr: boolean) {
  return {
    title: isFr ? 'Séance personnalisée' : 'Personalized Session',
    estimatedDurationMinutes: 15,
    totalQuestions: 10,
    breakdown: [
      { topicId: 'join', topicName: 'JOIN', count: 5 },
      { topicId: 'subqueries', topicName: 'Subqueries', count: 3 },
      { topicId: 'indexes', topicName: 'Indexes', count: 2 },
    ],
    questions: [
      // --- 5 × JOIN ---
      {
        id: 'ts-q1-join',
        index: 1,
        topicId: 'join',
        topicName: 'JOIN',
        difficulty: 'easy',
        difficultyLabel: isFr ? 'Niveau 1 - Fondamental' : 'Level 1 - Fundamental',
        prompt: isFr 
          ? 'On désire afficher le nom de chaque employé et le nom de son département uniquement pour les employés affectés à un département existant. Quelle est la clause de jointure minimale et appropriée ?'
          : 'You want to display employee names and department names only for employees assigned to an existing department. Which join clause is correct?',
        codeSnippet: `SELECT e.first_name, e.last_name, d.department_name
FROM employees e
/* CLAUSE DE JOINTURE */
ON e.department_id = d.department_id;`,
        options: [
          { id: 'A', letter: 'A', text: isFr ? 'CROSS JOIN departments d' : 'CROSS JOIN departments d' },
          { id: 'B', letter: 'B', text: isFr ? 'INNER JOIN departments d' : 'INNER JOIN departments d' },
          { id: 'C', letter: 'C', text: isFr ? 'FULL OUTER JOIN departments d' : 'FULL OUTER JOIN departments d' },
          { id: 'D', letter: 'D', text: isFr ? 'LEFT OUTER JOIN departments d' : 'LEFT OUTER JOIN departments d' },
        ],
        correctOptionId: 'B',
        explanation: isFr 
          ? 'L\'INNER JOIN retourne uniquement les lignes ayant une correspondance stricte des deux côtés selon la condition ON.'
          : 'INNER JOIN returns only rows that have matching values in both tables.',
        keyTakeaway: isFr 
          ? '💡 À retenir :\nINNER JOIN = intersection stricte des deux tables (pas de lignes sans correspondance).'
          : '💡 Key Takeaway:\nINNER JOIN = strict intersection of both tables.',
        trapMetadata: {
          topic: 'SQL',
          subtopic: 'JOIN',
          difficulty: 1,
          trap: 'INNER vs CROSS JOIN',
          concepts: ['JOIN', 'PREDICATE'],
          estimatedTime: 30,
          warningMsgFr: 'Attention à bien utiliser une clause ON avec INNER JOIN.',
          warningMsgEn: 'Remember to always provide an ON predicate with INNER JOIN.',
        },
      },
      {
        id: 'ts-q2-join',
        index: 2,
        topicId: 'join',
        topicName: 'JOIN',
        difficulty: 'easy',
        difficultyLabel: isFr ? 'Niveau 1 - Fondamental' : 'Level 1 - Fundamental',
        prompt: isFr 
          ? 'Certains nouveaux employés n\'ont pas encore de département assigné (department_id IS NULL). Quelle jointure garantit que TOUS les employés apparaissent dans le résultat, avec NULL pour les colonnes département ?'
          : 'Some new employees do not have a department yet (department_id IS NULL). Which join ensures ALL employees appear in the result, showing NULL for missing department data?',
        codeSnippet: `SELECT e.employee_id, e.last_name, d.department_name
FROM employees e
??? departments d ON e.department_id = d.department_id;`,
        options: [
          { id: 'A', letter: 'A', text: 'LEFT OUTER JOIN' },
          { id: 'B', letter: 'B', text: 'RIGHT OUTER JOIN' },
          { id: 'C', letter: 'C', text: 'INNER JOIN' },
          { id: 'D', letter: 'D', text: 'NATURAL JOIN' },
        ],
        correctOptionId: 'A',
        explanation: isFr 
          ? 'LEFT OUTER JOIN préserve toutes les lignes de la table de gauche (employees), même si aucune ligne ne correspond dans la table de droite (departments).'
          : 'LEFT OUTER JOIN preserves all rows from the left table (employees) even if no match exists in the right table.',
        keyTakeaway: isFr 
          ? '💡 À retenir :\nTable de gauche prioritaire → LEFT OUTER JOIN (colonnes de droite à NULL si orphelines).'
          : '💡 Key Takeaway:\nLeft table priority → LEFT OUTER JOIN (right columns populated with NULL if no match).',
        trapMetadata: {
          topic: 'SQL',
          subtopic: 'JOIN',
          difficulty: 2,
          trap: 'LEFT vs RIGHT JOIN',
          concepts: ['NULL', 'OUTER JOIN'],
          estimatedTime: 35,
          warningMsgFr: 'Attention au sens de la jointure externe pour préserver la bonne table.',
          warningMsgEn: 'Keep track of outer join direction to preserve the intended table.',
        },
      },
      {
        id: 'ts-q3-join',
        index: 3,
        topicId: 'join',
        topicName: 'JOIN',
        difficulty: 'intermediate',
        difficultyLabel: isFr ? 'Niveau 2 - Piège de Certification' : 'Level 2 - Certification Trap',
        prompt: isFr 
          ? "Quelle est la conséquence exacte de placer le filtre `d.department_name = 'IT'` dans la clause WHERE au lieu de la clause ON dans cette requête ?"
          : "What is the exact consequence of placing `d.department_name = 'IT'` in the WHERE clause instead of the ON clause in this query?",
        codeSnippet: `SELECT e.last_name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id
WHERE d.department_name = 'IT';`,
        options: [
          { id: 'A', letter: 'A', text: isFr ? 'La requête lève une erreur ORA-00904 car d.department_name n\'est pas accessible dans le WHERE.' : 'The query raises an ORA-00904 syntax error.' },
          { id: 'B', letter: 'B', text: isFr ? 'Le LEFT JOIN est neutralisé et se transforme en INNER JOIN : les employés sans département sont éliminés car NULL = \'IT\' est UNKNOWN.' : 'The LEFT JOIN is neutralized into an INNER JOIN: non-matching employees are eliminated because NULL = \'IT\' is UNKNOWN.' },
          { id: 'C', letter: 'C', text: isFr ? 'Tous les employés continuent d\'apparaître avec \'IT\' pour ceux qui n\'ont pas de département.' : 'All employees still appear with \'IT\' filled in for unassigned employees.' },
          { id: 'D', letter: 'D', text: isFr ? 'Le moteur Oracle applique automatiquement le filtre avant la jointure sans changer le résultat externe.' : 'Oracle optimizer pushes the filter to the ON clause automatically.' },
        ],
        correctOptionId: 'B',
        explanation: isFr 
          ? 'C\'est le piège du "Null-Rejecting Predicate". Le LEFT JOIN produit des NULL pour les employés orphelins, mais la clause WHERE évalue NULL = \'IT\' à UNKNOWN et élimine ces lignes, détruisant l\'effet du LEFT JOIN.'
          : 'This is the null-rejecting predicate trap. The WHERE clause tests NULL = \'IT\', which evaluates to UNKNOWN and discards non-matching rows, converting the LEFT JOIN into an INNER JOIN.',
        keyTakeaway: isFr 
          ? '💡 À retenir :\nFiltre sur table externe :\n- Dans ON → conserve les lignes de gauche\n- Dans WHERE → transforme en INNER JOIN !'
          : '💡 Key Takeaway:\nFilter on right table in WHERE clause destroys outer join preserving behavior.',
        trapMetadata: {
          topic: 'SQL',
          subtopic: 'JOIN',
          difficulty: 3,
          trap: 'LEFT vs INNER JOIN',
          concepts: ['NULL', 'JOIN'],
          estimatedTime: 45,
          warningMsgFr: "Tu fais régulièrement l'erreur INNER JOIN vs LEFT JOIN.",
          warningMsgEn: "You regularly make the INNER JOIN vs LEFT JOIN mistake.",
        },
      },
      {
        id: 'ts-q4-join',
        index: 4,
        topicId: 'join',
        topicName: 'JOIN',
        difficulty: 'intermediate',
        difficultyLabel: isFr ? 'Niveau 2 - Piège Syntaxe' : 'Level 2 - Syntax Trap',
        prompt: isFr 
          ? 'Dans la table `employees` et la table `departments`, les deux tables ont une colonne `department_id` ET une colonne `manager_id`. Que produit `SELECT * FROM employees NATURAL JOIN departments;` ?'
          : 'Both `employees` and `departments` share columns `department_id` AND `manager_id`. What does `SELECT * FROM employees NATURAL JOIN departments;` do?',
        codeSnippet: `SELECT * 
FROM employees 
NATURAL JOIN departments;`,
        options: [
          { id: 'A', letter: 'A', text: isFr ? 'Une jointure uniquement sur department_id car c\'est la clé étrangère déclarée.' : 'Joins only on department_id because it is the foreign key.' },
          { id: 'B', letter: 'B', text: isFr ? 'Une jointure sur TOUTES les colonnes homonymes (department_id ET manager_id), ce qui restreint drastiquement les résultats.' : 'Joins on ALL matching column names (both department_id AND manager_id), heavily restricting rows.' },
          { id: 'C', letter: 'C', text: isFr ? 'Une erreur de compilation SQL car les colonnes communes sont ambiguës.' : 'A syntax error because common column names are ambiguous.' },
          { id: 'D', letter: 'D', text: isFr ? 'Un produit cartésien entre les deux tables.' : 'A Cartesian product between the tables.' },
        ],
        correctOptionId: 'B',
        explanation: isFr 
          ? 'NATURAL JOIN fait une équi-jointure sur toutes les colonnes portant le même nom dans les deux tables. Ici, l\'employé doit être dans le département ET avoir le même manager que le département !'
          : 'NATURAL JOIN joins on every column with the same name across both tables (here both department_id and manager_id must match).',
        keyTakeaway: isFr 
          ? '💡 À retenir :\nNATURAL JOIN = jointure sur TOUTES les colonnes homonymes. Privilégier `JOIN ... USING(col)` ou `JOIN ... ON` !'
          : '💡 Key Takeaway:\nNATURAL JOIN automatically matches ALL columns with the same name.',
        trapMetadata: {
          topic: 'SQL',
          subtopic: 'JOIN',
          difficulty: 2,
          trap: 'NATURAL JOIN colonnes homonymes',
          concepts: ['NATURAL JOIN', 'SCHEMA'],
          estimatedTime: 40,
        },
      },
      {
        id: 'ts-q5-join',
        index: 5,
        topicId: 'join',
        topicName: 'JOIN',
        difficulty: 'hard',
        difficultyLabel: isFr ? 'Niveau 3 - Avancé & Maîtrise' : 'Level 3 - Advanced & Mastery',
        prompt: isFr 
          ? 'On souhaite réconcilier deux tables financières `budget` et `actuals` pour détecter les lignes présentes dans l\'une mais pas dans l\'autre, ou dans les deux. Quelle clause et fonction de regroupement sont appropriées ?'
          : 'You want to reconcile two financial tables `budget` and `actuals` to detect records present in either table or both. Which join clause and function are standard?',
        codeSnippet: `SELECT 
  COALESCE(b.cost_center, a.cost_center) AS cost_center,
  b.amount AS budget_amt,
  a.amount AS actual_amt
FROM budget b
??? actuals a ON b.cost_center = a.cost_center;`,
        options: [
          { id: 'A', letter: 'A', text: 'FULL OUTER JOIN' },
          { id: 'B', letter: 'B', text: 'LEFT OUTER JOIN' },
          { id: 'C', letter: 'C', text: 'CROSS JOIN' },
          { id: 'D', letter: 'D', text: 'UNION JOIN' },
        ],
        correctOptionId: 'A',
        explanation: isFr 
          ? 'FULL OUTER JOIN combine le comportement de LEFT et RIGHT OUTER JOIN : il préserve les lignes des deux côtés même sans correspondance, combiné avec COALESCE pour afficher la clé présente.'
          : 'FULL OUTER JOIN combines LEFT and RIGHT outer joins, returning all rows from both tables and matching where possible.',
        keyTakeaway: isFr 
          ? '💡 À retenir :\nRéconciliation bilatérale complète = FULL OUTER JOIN + COALESCE(t1.cle, t2.cle).'
          : '💡 Key Takeaway:\nFull bilateral reconciliation = FULL OUTER JOIN + COALESCE.',
        trapMetadata: {
          topic: 'SQL',
          subtopic: 'JOIN',
          difficulty: 3,
          trap: 'FULL OUTER JOIN réconciliation',
          concepts: ['FULL OUTER JOIN', 'COALESCE'],
          estimatedTime: 45,
        },
      },

      // --- 3 × SUBQUERIES ---
      {
        id: 'ts-q6-subq',
        index: 6,
        topicId: 'subqueries',
        topicName: 'Subqueries',
        difficulty: 'easy',
        difficultyLabel: isFr ? 'Niveau 1 - Fondamental' : 'Level 1 - Fundamental',
        prompt: isFr 
          ? 'Une sous-requête placée directement dans la clause SELECT principale est qualifiée de sous-requête scalaire. Quelle contrainte cardinale doit-elle impérativement respecter lors de son exécution ?'
          : 'A subquery placed directly in the outer SELECT column list is a scalar subquery. What cardinality rule must it strictly obey at execution time?',
        codeSnippet: `SELECT 
  employee_id, 
  last_name, 
  (SELECT department_name FROM departments d WHERE d.department_id = e.department_id) AS dept
FROM employees e;`,
        options: [
          { id: 'A', letter: 'A', text: isFr ? 'Elle doit retourner exactement une seule colonne et au maximum une seule ligne par ligne externe.' : 'It must return exactly one column and at most one row per outer row.' },
          { id: 'B', letter: 'B', text: isFr ? 'Elle peut retourner plusieurs colonnes si elles sont séparées par des virgules.' : 'It can return multiple columns if comma-separated.' },
          { id: 'C', letter: 'C', text: isFr ? 'Elle doit être ordonnée avec ORDER BY obligatoirement.' : 'It must have an ORDER BY clause.' },
          { id: 'D', letter: 'D', text: isFr ? 'Elle ne peut pas faire référence aux colonnes de la requête externe.' : 'It cannot reference outer query columns.' },
        ],
        correctOptionId: 'A',
        explanation: isFr 
          ? 'Une sous-requête scalaire doit obligatoirement retourner 1 seule valeur (1 ligne, 1 colonne). Si elle retourne 2 lignes ou plus, Oracle lève l\'erreur ORA-01427: single-row subquery returns more than one row.'
          : 'A scalar subquery must return at most one row and exactly one column. If multiple rows are returned, it fails with a single-row subquery violation (ORA-01427).',
        keyTakeaway: isFr 
          ? '💡 À retenir :\nSous-requête scalaire dans SELECT = 1 colonne, 1 valeur max (sinon ORA-01427).'
          : '💡 Key Takeaway:\nScalar subquery in SELECT = exactly 1 column and max 1 row.',
        trapMetadata: {
          topic: 'SQL',
          subtopic: 'Subqueries',
          difficulty: 2,
          trap: 'Sous-requête scalaire cardinalité',
          concepts: ['SCALAR', 'ORA-01427'],
          estimatedTime: 40,
        },
      },
      {
        id: 'ts-q7-subq',
        index: 7,
        topicId: 'subqueries',
        topicName: 'Subqueries',
        difficulty: 'intermediate',
        difficultyLabel: isFr ? 'Niveau 2 - Piège Critique NULL' : 'Level 2 - Critical NULL Trap',
        prompt: isFr 
          ? 'On cherche les employés qui ne sont managers de personne. Si la colonne `manager_id` contient au moins une valeur NULL dans la table `employees`, que retourne cette requête ?'
          : 'You want to find employees who are not managers. If `manager_id` contains at least one NULL value in `employees`, what does this query return?',
        codeSnippet: `SELECT last_name 
FROM employees 
WHERE employee_id NOT IN (
    SELECT manager_id 
    FROM employees
);`,
        options: [
          { id: 'A', letter: 'A', text: isFr ? 'Tous les employés non-managers correctement.' : 'All non-manager employees correctly.' },
          { id: 'B', letter: 'B', text: isFr ? 'EXACTEMENT ZÉRO LIGNE (ensemble vide).' : 'EXACTLY ZERO ROWS (empty result set).' },
          { id: 'C', letter: 'C', text: isFr ? 'Tous les employés sauf le PDG (celui dont le manager est NULL).' : 'All employees except the CEO.' },
          { id: 'D', letter: 'D', text: isFr ? 'Une erreur SQL ORA-01407 : NULL value in subquery.' : 'A syntax error ORA-01407.' },
        ],
        correctOptionId: 'B',
        explanation: isFr 
          ? 'C\'est le piège numéro 1 des certifications ! `x NOT IN (100, 101, NULL)` équivaut à `(x != 100 AND x != 101 AND x != NULL)`. Or `x != NULL` s\'évalue TOUJOURS à UNKNOWN. En logique 3-values, `TRUE AND UNKNOWN` donne `UNKNOWN`. La clause WHERE ne conserve que TRUE, donc ZÉRO ligne n\'est retournée ! Il faut ajouter `WHERE manager_id IS NOT NULL` ou utiliser `NOT EXISTS`.'
          : 'The classic NOT IN with NULL trap! `x NOT IN (1, 2, NULL)` expands to `x!=1 AND x!=2 AND x!=NULL`. Since `x!=NULL` evaluates to UNKNOWN, the entire condition evaluates to UNKNOWN, returning 0 rows. Use `NOT EXISTS` or filter out NULLs in subquery.',
        keyTakeaway: isFr 
          ? '💡 À retenir :\nNOT IN + NULL dans la sous-requête = 0 ligne retournée ! Préférer systématiquement NOT EXISTS.'
          : '💡 Key Takeaway:\nNOT IN + subquery with NULL = 0 rows returned! Always prefer NOT EXISTS.',
        trapMetadata: {
          topic: 'SQL',
          subtopic: 'Subqueries',
          difficulty: 4,
          trap: 'NOT IN avec NULL',
          concepts: ['NULL', 'NOT IN', '3VL'],
          estimatedTime: 50,
          warningMsgFr: "Tu tombes régulièrement dans le piège de la logique ternaire avec NOT IN et NULL (renvoie 0 ligne).",
          warningMsgEn: "You consistently fall for the three-valued logic trap with NOT IN and NULL values.",
        },
      },
      {
        id: 'ts-q8-subq',
        index: 8,
        topicId: 'subqueries',
        topicName: 'Subqueries',
        difficulty: 'hard',
        difficultyLabel: isFr ? 'Niveau 3 - Avancé & Performance' : 'Level 3 - Advanced & Performance',
        prompt: isFr 
          ? 'Pourquoi la clause `EXISTS` est-elle généralement plus performante et plus sûre que `IN` ou `COUNT(*) > 0` pour vérifier l\'existence d\'enfants associés ?'
          : 'Why is `EXISTS` generally faster and safer than `IN` or `COUNT(*) > 0` when checking for related child records?',
        codeSnippet: `SELECT d.department_id, d.department_name
FROM departments d
WHERE EXISTS (
    SELECT 1 
    FROM employees e 
    WHERE e.department_id = d.department_id
);`,
        options: [
          { id: 'A', letter: 'A', text: isFr ? 'Car EXISTS utilise l\'évaluation en court-circuit (Short-Circuit) : le moteur s\'arrête dès qu\'une première correspondance est trouvée.' : 'Because EXISTS uses short-circuit evaluation: it stops scanning as soon as the first match is found.' },
          { id: 'B', letter: 'B', text: isFr ? 'Car EXISTS force le calcul d\'un index bitmap temporaire en mémoire SGA.' : 'Because EXISTS forces a temporary bitmap index in SGA memory.' },
          { id: 'C', letter: 'C', text: isFr ? 'Car EXISTS ne permet pas d\'utiliser de prédicat corrélé.' : 'Because EXISTS cannot use correlated predicates.' },
          { id: 'D', letter: 'D', text: isFr ? 'Car EXISTS ignore les transactions non validées.' : 'Because EXISTS ignores uncommitted transactions.' },
        ],
        correctOptionId: 'A',
        explanation: isFr 
          ? 'EXISTS s\'arrête dès qu\'au moins une ligne valide est détectée pour le département donné, sans avoir besoin de dénombrer toutes les lignes correspondantes ni de construire un ensemble complet de clés en mémoire.'
          : 'EXISTS terminates row scanning as soon as a single match is found (short-circuit boolean evaluation), without evaluating the remaining rows.',
        keyTakeaway: isFr 
          ? '💡 À retenir :\nEXISTS = évaluation booléenne avec arrêt immédiat au premier match (Short-Circuit).'
          : '💡 Key Takeaway:\nEXISTS = boolean short-circuit evaluation on the first matching row.',
        trapMetadata: {
          topic: 'SQL',
          subtopic: 'Subqueries',
          difficulty: 3,
          trap: 'EXISTS vs IN court-circuit',
          concepts: ['EXISTS', 'SHORT-CIRCUIT'],
          estimatedTime: 45,
        },
      },

      // --- 2 × INDEXES ---
      {
        id: 'ts-q9-idx',
        index: 9,
        topicId: 'indexes',
        topicName: 'Indexes',
        difficulty: 'intermediate',
        difficultyLabel: isFr ? 'Niveau 2 - Règle de la Colonne de Tête' : 'Level 2 - Leading Column Rule',
        prompt: isFr 
          ? 'Soit un index composite créé par `CREATE INDEX idx_emp_dept_sal ON employees(department_id, salary);`. Parmi ces requêtes, laquelle NE PEUT PAS utiliser cet index sous forme d\'Index Range Scan direct ?'
          : 'Given a composite index `CREATE INDEX idx_emp_dept_sal ON employees(department_id, salary);`. Which query CANNOT perform an Index Range Scan?',
        codeSnippet: `-- Index composite : (department_id, salary)
-- Requête testée :
SELECT last_name, salary 
FROM employees 
WHERE salary > 5000;`,
        options: [
          { id: 'A', letter: 'A', text: isFr ? 'WHERE department_id = 50 AND salary > 5000' : 'WHERE department_id = 50 AND salary > 5000' },
          { id: 'B', letter: 'B', text: isFr ? 'WHERE department_id = 50' : 'WHERE department_id = 50' },
          { id: 'C', letter: 'C', text: isFr ? 'WHERE salary > 5000 (sans mentionner department_id)' : 'WHERE salary > 5000 (without department_id)' },
          { id: 'D', letter: 'D', text: isFr ? 'WHERE department_id IN (10, 20) AND salary BETWEEN 3000 AND 8000' : 'WHERE department_id IN (10, 20) AND salary BETWEEN 3000 AND 8000' },
        ],
        correctOptionId: 'C',
        explanation: isFr 
          ? 'Règle d\'or du préfixe à gauche (Leftmost Prefix Rule) : un index B-Tree composite sur (A, B) est trié d\'abord par A. Si la clause WHERE ne filtre que sur B (salary) sans fixer A (department_id), l\'arbre ne peut pas être parcouru en descente directe.'
          : 'The Leftmost Prefix Rule requires the leading column (department_id) to be part of the predicate to perform an Index Range Scan seek.',
        keyTakeaway: isFr 
          ? '💡 À retenir :\nIndex composite (A, B) → A doit être présent dans le WHERE pour un Index Range Scan seek.'
          : '💡 Key Takeaway:\nComposite index (A, B) requires leading column A for an Index Range Scan seek.',
        trapMetadata: {
          topic: 'Administration',
          subtopic: 'Indexes',
          difficulty: 3,
          trap: 'Colonne directrice d\'index composite',
          concepts: ['Composite Index', 'Leading Column', 'Range Scan'],
          estimatedTime: 45,
          warningMsgFr: "Tu oublies que filtrer sans la colonne directrice empêche l'index seek direct.",
          warningMsgEn: "Filtering without the leading index column prevents a direct B-tree seek.",
        },
      },
      {
        id: 'ts-q10-idx',
        index: 10,
        topicId: 'indexes',
        topicName: 'Indexes',
        difficulty: 'hard',
        difficultyLabel: isFr ? 'Niveau 3 - Neutralisation d\'Index' : 'Level 3 - Index Suppression',
        prompt: isFr 
          ? 'La table `employees` possède un index B-Tree standard sur la colonne `last_name`. Pourquoi la requête suivante subit-elle un balayage complet de table (Table Full Scan) au lieu d\'utiliser l\'index ?'
          : 'Table `employees` has a standard B-Tree index on `last_name`. Why does the following query perform a full table scan instead of using the index?',
        codeSnippet: `SELECT employee_id, first_name, last_name
FROM employees
WHERE UPPER(last_name) = 'KING';`,
        options: [
          { id: 'A', letter: 'A', text: isFr ? 'L\'application d\'une fonction (UPPER) sur la colonne indexée neutralise l\'index B-Tree classique. Il faut créer un Function-Based Index sur UPPER(last_name).' : 'Applying a function (UPPER) on the indexed column suppresses the standard B-Tree index. A Function-Based Index is required.' },
          { id: 'B', letter: 'B', text: isFr ? 'La chaîne \'KING\' est trop courte pour être indexée dans un arbre B-Tree.' : 'The string \'KING\' is too short for a B-Tree index.' },
          { id: 'C', letter: 'C', text: isFr ? 'Les index Oracle ne supportent pas le type VARCHAR2.' : 'Oracle indexes do not support VARCHAR2.' },
          { id: 'D', letter: 'D', text: isFr ? 'L\'optimiseur refuse d\'utiliser les index si le nom contient moins de 5 lettres.' : 'The optimizer refuses to use indexes on names under 5 letters.' },
        ],
        correctOptionId: 'A',
        explanation: isFr 
          ? 'Règle d\'or DBA : Toute transformation arithmétique ou fonctionnelle sur une colonne indexée dans le WHERE (ex: UPPER(col), col + 1, TRUNC(date)) empêche l\'optimiseur de comparer les clés brutes de l\'index. Solution : créer `CREATE INDEX idx_emp_upper_name ON employees(UPPER(last_name));`.'
          : 'Applying functions or arithmetic expressions on indexed columns in the WHERE clause suppresses standard B-Tree index usage. Solution: create a Function-Based Index.',
        keyTakeaway: isFr 
          ? '💡 À retenir :\nFonction sur colonne indexée (UPPER, TRUNC, etc.) = Index neutralisé ! Créer un Function-Based Index (FBI).'
          : '💡 Key Takeaway:\nFunction on column = Index suppressed. Create a Function-Based Index (FBI).',
        trapMetadata: {
          topic: 'Administration',
          subtopic: 'Indexes',
          difficulty: 3,
          trap: 'Suppression d\'index par fonction',
          concepts: ['B-Tree', 'SARGABLE', 'Index Seek'],
          estimatedTime: 45,
          warningMsgFr: "Tu appliques fréquemment des fonctions sur des colonnes indexées, neutralisant l'index seek.",
          warningMsgEn: "You frequently wrap indexed columns with functions, causing full table scans.",
        },
      },
    ],
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Initialisation Gemini avec @google/genai
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Statut du tuteur Gemini
  app.get('/api/gemini/status', (req, res) => {
    res.json({
      available: !!ai,
      model: 'gemini-3.8-flash',
      role: 'pedagogical_tutor',
    });
  });

  // 1. Endpoint : Pourquoi ma réponse est fausse ? (Diagnostic pédagogique)
  app.post('/api/gemini/explain-mistake', async (req, res) => {
    const {
      questionPrompt = '',
      codeSnippet = '',
      chosenLetter = 'B',
      chosenText = '',
      correctLetter = 'C',
      correctText = '',
      conceptName = '',
      explanation = '',
      lang = 'fr',
    } = req.body;

    const isFr = lang === 'fr';

    if (ai) {
      try {
        const prompt = `Tu es un tuteur pédagogique SQL d'élite pour la préparation aux examens de certification (Oracle 1Z0-071, PostgreSQL, MySQL, Azure SQL).
L'étudiant a répondu FAUX à une question et demande : "Pourquoi ma réponse est fausse ?".
Voici les faits :
- Énoncé de la question : ${questionPrompt}
${codeSnippet ? `- Snippet SQL : ${codeSnippet}` : ''}
- Choix de l'étudiant (ERREUR) : [Option ${chosenLetter}] ${chosenText}
- Bonne réponse officielle : [Option ${correctLetter}] ${correctText}
- Notion / Piège théorique : ${conceptName}
- Explication de référence : ${explanation}

Rédige l'analyse en respectant STRICTEMENT le style pédagogique suivant :
"Pourquoi ma réponse est fausse ?
Tu as choisi ${chosenLetter}.
La bonne réponse est ${correctLetter}.
Le piège vient de la différence entre [Notion A] et [Notion B].
[Point 1 expliquant la règle de Notion A]
[Point 2 expliquant la règle de Notion B]
💡 À retenir :
[Formule mnémotechnique ultra-claire avec flèches]"

Retourne STRICTEMENT du JSON :
{
  "chosenSummary": "Tu as choisi ${chosenLetter}.",
  "correctSummary": "La bonne réponse est ${correctLetter}.",
  "trapOrigin": "Le piège vient de la différence entre...",
  "bulletPoints": [
    "...",
    "..."
  ],
  "keyTakeaway": "💡 À retenir :\\n..."
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: isFr
              ? 'Tu es un tuteur pédagogique SQL concis, bienveillant et chirurgical. Pas de blabla, va droit à la cause de la confusion conceptuelle.'
              : 'You are a surgical, clear SQL certification pedagogical tutor. Explain the exact conceptual trap and provide a key takeaway.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                chosenSummary: { type: Type.STRING },
                correctSummary: { type: Type.STRING },
                trapOrigin: { type: Type.STRING },
                bulletPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                keyTakeaway: { type: Type.STRING },
              },
              required: ['chosenSummary', 'correctSummary', 'trapOrigin', 'bulletPoints', 'keyTakeaway'],
            },
          },
        });

        const text = response.text || '{}';
        const parsed = JSON.parse(text);
        return res.json({
          source: 'gemini',
          model: 'gemini-3.8-flash',
          ...parsed,
        });
      } catch (err: any) {
        console.error('[Gemini Tutor] Explain error:', err?.message || err);
      }
    }

    // Fallback pédagogique ciblé si clé absente ou hors-ligne
    const fallback = generateLocalMistakeExplanation({
      chosenLetter,
      chosenText,
      correctLetter,
      correctText,
      conceptName,
      questionPrompt,
      explanation,
      isFr,
    });
    return res.json({
      source: 'deterministic_tutor',
      ...fallback,
    });
  });

  // 2. Endpoint : Donne-moi une question similaire
  app.post('/api/gemini/similar-question', async (req, res) => {
    const {
      conceptName = '',
      trapOrigin = '',
      originalPrompt = '',
      lang = 'fr',
    } = req.body;

    const isFr = lang === 'fr';

    if (ai) {
      try {
        const prompt = `L'étudiant a fait une erreur sur ce piège conceptuel :
- Concept : ${conceptName}
- Origine du piège : ${trapOrigin}
- Question originale : ${originalPrompt}

Génère UNE NOUVELLE question similaire (QCM 4 choix A, B, C, D) permettant à l'étudiant de tester immédiatement s'il a compris la règle.
Donne exactement une bonne réponse.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: isFr
              ? 'Tu es un examinateur expert en certification SQL. Conçois une question de vérification ciblée, réaliste et formatée en JSON.'
              : 'You are an expert SQL certification examiner. Create a targeted verification question formatted in JSON.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                codeSnippet: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      letter: { type: Type.STRING },
                      text: { type: Type.STRING },
                    },
                    required: ['id', 'letter', 'text'],
                  },
                },
                correctOptionId: { type: Type.STRING },
                explanation: { type: Type.STRING },
                takeaway: { type: Type.STRING },
              },
              required: ['prompt', 'options', 'correctOptionId', 'explanation', 'takeaway'],
            },
          },
        });

        const text = response.text || '{}';
        const parsed = JSON.parse(text);
        return res.json({
          source: 'gemini',
          model: 'gemini-3.8-flash',
          ...parsed,
        });
      } catch (err: any) {
        console.error('[Gemini Tutor] Similar question error:', err?.message || err);
      }
    }

    const fallbackQuestion = generateLocalSimilarQuestion({
      conceptName,
      originalPrompt,
      isFr,
    });
    return res.json({
      source: 'deterministic_tutor',
      ...fallbackQuestion,
    });
  });

  // ==========================================
  // ROUTE 3 : GÉNÉRATION D'UNE SÉANCE PERSONNALISÉE CIBLÉE (10Q)
  // 5 × JOIN, 3 × Subqueries, 2 × Indexes (Difficulté progressive, 15 min)
  // ==========================================
  app.post('/api/gemini/generate-targeted-session', async (req, res) => {
    const {
      topics = [
        { id: 'join', name: 'JOIN', count: 5, currentScore: 54 },
        { id: 'subqueries', name: 'Subqueries', count: 3, currentScore: 47 },
        { id: 'indexes', name: 'Indexes', count: 2, currentScore: 61 },
      ],
      totalQuestions = 10,
      difficulty = 'progressive',
      lang = 'fr',
    } = req.body || {};

    const isFr = lang !== 'en';

    if (ai) {
      try {
        const prompt = `Génère une séance d'exercices personnalisée ciblée de ${totalQuestions} questions pour remédier aux faiblesses exactes de l'étudiant :
- 5 questions sur les JOIN (score actuel: 54%)
- 3 questions sur les Subqueries (score actuel: 47%)
- 2 questions sur les Indexes (score actuel: 61%)

Règles impératives :
1. Difficulté : progressive (Questions 1 à 3 fondamentales/faciles, Questions 4 à 7 intermédiaires avec pièges classiques, Questions 8 à 10 avancées/cas réels de certification).
2. Fournis pour chaque question :
   - topicId ('join' ou 'subqueries' ou 'indexes')
   - topicName ('JOIN' ou 'Subqueries' ou 'Indexes')
   - difficulty ('easy', 'intermediate', 'hard')
   - difficultyLabel (ex: 'Niveau 1 - Fondamental', 'Niveau 2 - Intermédiaire', 'Niveau 3 - Avancé & Piège')
   - prompt : énoncé clair et professionnel
   - codeSnippet : extrait SQL réaliste
   - 4 options distinctes (A, B, C, D)
   - correctOptionId (la lettre exacte 'A', 'B', 'C' ou 'D')
   - explanation : explication pédagogique chirurgicale
   - keyTakeaway : règle d'or mnémotechnique brève (💡 À retenir)
3. Les questions doivent cibler :
   - Pour JOIN : INNER JOIN vs CARTESIAN, LEFT OUTER JOIN et lignes orphelines, piège du prédicat dans ON vs WHERE, NATURAL JOIN et colonnes homonymes, FULL OUTER JOIN avec COALESCE.
   - Pour Subqueries : sous-requête scalaire, le piège critique NOT IN avec sous-requête retournant NULL, sous-requête corrélée avec EXISTS.
   - Pour Indexes : règle de la colonne de tête (Leftmost Prefix Rule) d'un index composite, et neutralisation d'index par fonction scalaires (ex: WHERE UPPER(col) = ...).`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: isFr
              ? 'Tu es DBMastor, instructeur DBA & SQL d\'élite pour les certifications Oracle (1Z0-071), PostgreSQL et MySQL. Rends un JSON strictement conforme au schéma.'
              : 'You are DBMastor, an elite SQL certification trainer. Output strict JSON matching the schema.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                estimatedDurationMinutes: { type: Type.INTEGER },
                totalQuestions: { type: Type.INTEGER },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      index: { type: Type.INTEGER },
                      topicId: { type: Type.STRING },
                      topicName: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                      difficultyLabel: { type: Type.STRING },
                      prompt: { type: Type.STRING },
                      codeSnippet: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            letter: { type: Type.STRING },
                            text: { type: Type.STRING },
                          },
                          required: ['id', 'letter', 'text'],
                        },
                      },
                      correctOptionId: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      keyTakeaway: { type: Type.STRING },
                      trapMetadata: {
                        type: Type.OBJECT,
                        properties: {
                          topic: { type: Type.STRING },
                          subtopic: { type: Type.STRING },
                          difficulty: { type: Type.INTEGER },
                          trap: { type: Type.STRING },
                          concepts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          estimatedTime: { type: Type.INTEGER },
                        },
                      },
                    },
                    required: [
                      'id',
                      'index',
                      'topicId',
                      'topicName',
                      'difficulty',
                      'difficultyLabel',
                      'prompt',
                      'options',
                      'correctOptionId',
                      'explanation',
                      'keyTakeaway',
                    ],
                  },
                },
              },
              required: ['title', 'estimatedDurationMinutes', 'totalQuestions', 'questions'],
            },
          },
        });

        const text = response.text || '{}';
        const parsed = JSON.parse(text);
        if (parsed.questions && parsed.questions.length >= 8) {
          const finalQuestions = parsed.questions.map((q: any, idx: number) => {
            if (!q.trapMetadata) {
              const defaultTraps: Record<string, any> = {
                join: { topic: 'SQL', subtopic: 'JOIN', difficulty: 3, trap: 'LEFT vs INNER JOIN', concepts: ['NULL', 'JOIN'], estimatedTime: 45 },
                subqueries: { topic: 'SQL', subtopic: 'Subqueries', difficulty: 4, trap: 'NOT IN avec NULL', concepts: ['NULL', 'NOT IN', '3VL'], estimatedTime: 50 },
                indexes: { topic: 'Administration', subtopic: 'Indexes', difficulty: 3, trap: 'Suppression d\'index par fonction', concepts: ['B-Tree', 'SARGABLE'], estimatedTime: 45 },
              };
              return {
                ...q,
                index: q.index || idx + 1,
                trapMetadata: defaultTraps[q.topicId] || {
                  topic: q.topicName || 'SQL',
                  subtopic: q.topicName || 'SQL',
                  difficulty: 3,
                  trap: `${q.topicName} piège`,
                  concepts: [q.topicName || 'SQL'],
                  estimatedTime: 45,
                },
              };
            }
            return {
              ...q,
              index: q.index || idx + 1,
            };
          });

          return res.json({
            sessionId: `session-${Date.now()}`,
            source: 'gemini',
            model: 'gemini-3.8-flash',
            title: parsed.title || (isFr ? 'Séance personnalisée' : 'Personalized Session'),
            estimatedDurationMinutes: parsed.estimatedDurationMinutes || 15,
            totalQuestions: finalQuestions.length,
            breakdown: [
              { topicId: 'join', topicName: 'JOIN', count: finalQuestions.filter((q: any) => q.topicId === 'join').length },
              { topicId: 'subqueries', topicName: 'Subqueries', count: finalQuestions.filter((q: any) => q.topicId === 'subqueries').length },
              { topicId: 'indexes', topicName: 'Indexes', count: finalQuestions.filter((q: any) => q.topicId === 'indexes').length },
            ],
            questions: finalQuestions,
          });
        }
      } catch (err: any) {
        console.error('[Gemini Targeted Session] Generation error:', err?.message || err);
      }
    }

    // Fallback riche, pédagogique et déterministe
    const fallbackSession = generateLocalTargetedSession(isFr);
    return res.json({
      sessionId: `session-${Date.now()}`,
      source: 'curated_engine',
      ...fallbackSession,
    });
  });

  // Monter Vite middleware en dev ou fichiers statiques en prod
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DBMastery] Server active on port ${PORT} (Gemini AI: ${ai ? 'gemini-3.8-flash connected' : 'fallback-tutor enabled'})`);
  });
}

startServer();
