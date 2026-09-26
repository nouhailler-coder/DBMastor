import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Brain,
  BookOpen,
  Eye,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Code2,
  AlertTriangle,
  HelpCircle,
  Lock,
  Unlock
} from 'lucide-react';

export interface ProgressiveExplainContent {
  hintFr: string;
  hintEn: string;
  explanationFr: string;
  explanationEn: string;
  course: {
    titleFr: string;
    titleEn: string;
    fullTheoryFr: string;
    fullTheoryEn: string;
    exampleCode: string;
    edgeCasesFr: string[];
    edgeCasesEn: string[];
  };
}

interface ProgressiveExplainPanelProps {
  questionId: string;
  topic?: string;
  subtopic?: string;
  trapName?: string;
  promptText: string;
  codeSnippet?: string;
  explanationText?: string;
  correctOptionLetter?: string;
  correctOptionText?: string;
  hasSelectedAnswer?: boolean;
  onRevealSolution?: () => void;
  onFocusAnswer?: () => void;
  onHintUsed?: (level: 'hint' | 'explain' | 'course' | 'solution') => void;
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  defaultOpenLevel?: 'none' | 'hint' | 'explain' | 'course' | 'solution';
}

/**
 * Génère automatiquement les 3 niveaux progressifs (💡 Indice, 🧠 Explication, 📖 Cours complet + exemples + cas particuliers)
 * adaptés au sujet SQL de la question sans dévoiler immédiatement la réponse.
 */
export function buildProgressivePedagogy(params: {
  topic?: string;
  subtopic?: string;
  trapName?: string;
  promptText: string;
  codeSnippet?: string;
  explanationText?: string;
}): ProgressiveExplainContent {
  const combined = `${params.topic || ''} ${params.subtopic || ''} ${params.trapName || ''} ${params.promptText || ''} ${params.codeSnippet || ''}`.toUpperCase();

  // Cas 1 : JOIN / LEFT JOIN vs INNER JOIN (Exemple de référence de l'utilisateur)
  if (combined.includes('JOIN')) {
    return {
      hintFr:
        "Regarde attentivement la condition du JOIN et vérifie où est placé le filtre (dans la clause ON ou dans la clause WHERE).",
      hintEn:
        "Look closely at the JOIN condition and check where the filter is placed (inside the ON clause vs. the WHERE clause).",
      explanationFr:
        "Le LEFT JOIN conserve toutes les lignes de la table gauche, même sans correspondance à droite (les colonnes de droite valent alors NULL). Mais si tu filtres ensuite une colonne de la table droite dans le WHERE avec une égalité stricte, tu élimines ces lignes NULL.",
      explanationEn:
        "LEFT JOIN preserves all rows from the left table, even when there is no match on the right (right columns become NULL). However, filtering a right-table column in WHERE with a strict equality removes those NULL rows.",
      course: {
        titleFr: 'Maîtrise complète : LEFT JOIN vs INNER JOIN & Placement des Prédicats',
        titleEn: 'Complete Mastery: LEFT JOIN vs INNER JOIN & Predicate Placement',
        fullTheoryFr:
          "Dans l'ordre logique d'évaluation SQL, la clause ON est évaluée pendant la construction de la jointure externe, tandis que la clause WHERE est évaluée après. Sur un LEFT OUTER JOIN, un prédicat placé dans ON filtre uniquement les lignes candidates de la table droite tout en préservant les lignes de la table gauche (complétées par NULL). À l'inverse, placer ce même prédicat dans WHERE détruit les lignes où la table droite est NULL, transformant tacitement le LEFT JOIN en INNER JOIN.",
        fullTheoryEn:
          "In SQL logical query processing, the ON clause is evaluated during the outer join construction, whereas WHERE is evaluated after. On a LEFT OUTER JOIN, a predicate inside ON filters only the right table while preserving all left table rows (padded with NULL). Placing that predicate in WHERE eliminates NULL-extended rows, turning the LEFT JOIN into an INNER JOIN.",
        exampleCode: `-- ❌ PIÈGE : Le WHERE élimine les départements sans employé (équivaut à un INNER JOIN)
SELECT d.dept_name, e.emp_id
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
WHERE e.status = 'ACTIVE';

-- ✅ CORRECT : Le filtre dans ON conserve tous les départements
SELECT d.dept_name, e.emp_id
FROM departments d
LEFT JOIN employees e 
  ON d.dept_id = e.dept_id 
 AND e.status = 'ACTIVE';`,
        edgeCasesFr: [
          "Cas particulier 1 (Anti-Join) : `WHERE e.emp_id IS NULL` après un LEFT JOIN est le seul cas volontaire où WHERE sert à isoler les lignes orphelines.",
          "Cas particulier 2 (FULL OUTER JOIN) : Un filtre `COALESCE(a.id, b.id) > 10` permet de filtrer sans perdre un côté de la jointure symétrique.",
          "Cas particulier 3 (Optimiseur CBO) : L'optimiseur réécrit automatiquement un LEFT JOIN en INNER JOIN dans le plan d'exécution s'il prouve que le WHERE rejette les NULL."
        ],
        edgeCasesEn: [
          "Edge Case 1 (Anti-Join): `WHERE e.emp_id IS NULL` after a LEFT JOIN intentionally isolates unmatched rows.",
          "Edge Case 2 (FULL OUTER JOIN): Filtering on `COALESCE(a.id, b.id)` preserves unmatched rows from both sides.",
          "Edge Case 3 (CBO Optimizer): The query planner automatically simplifies LEFT JOIN to INNER JOIN when WHERE rejects NULLs."
        ],
      },
    };
  }

  // Cas 2 : GROUP BY / HAVING vs WHERE
  if (combined.includes('GROUP BY') || combined.includes('HAVING') || combined.includes('COUNT(') || combined.includes('AVG(')) {
    return {
      hintFr:
        "Observe à quel moment le filtrage doit agir : avant le regroupement des lignes individuelles ou après le calcul de la fonction d'agrégation ?",
      hintEn:
        "Check when the filter needs to apply: before grouping individual rows, or after computing the aggregate function?",
      explanationFr:
        "La clause WHERE filtre les lignes brutes avant le GROUP BY (et ne peut jamais contenir de fonction d'agrégation comme COUNT, SUM, AVG). La clause HAVING intervient après le GROUP BY pour filtrer les groupes constitués.",
      explanationEn:
        "The WHERE clause filters raw rows before GROUP BY (and cannot contain aggregates like COUNT, SUM, AVG). The HAVING clause runs after GROUP BY to filter aggregated groups.",
      course: {
        titleFr: 'Ordre d\'exécution SQL : WHERE vs GROUP BY vs HAVING',
        titleEn: 'SQL Execution Order: WHERE vs GROUP BY vs HAVING',
        fullTheoryFr:
          "Le moteur SQL exécute toujours les clauses dans cet ordre strict : 1. FROM/JOIN → 2. WHERE → 3. GROUP BY → 4. HAVING → 5. SELECT → 6. ORDER BY. Toute colonne présente dans le SELECT hors fonction d'agrégation doit obligatoirement figurer dans le GROUP BY.",
        fullTheoryEn:
          "The SQL engine always evaluates clauses in this strict order: 1. FROM/JOIN → 2. WHERE → 3. GROUP BY → 4. HAVING → 5. SELECT → 6. ORDER BY. Any non-aggregated column in SELECT must appear in GROUP BY.",
        exampleCode: `-- ✅ Combinaison optimale WHERE (pré-filtrage) + HAVING (post-agrégation)
SELECT department_id, COUNT(*) AS nb_employes, AVG(salary) AS moy_salaire
FROM employees
WHERE status = 'ACTIVE'          -- 1. Filtre les lignes avant agrégation (utilise l'index)
GROUP BY department_id           -- 2. Regroupe par département
HAVING COUNT(*) >= 5             -- 3. Filtre les groupes ayant au moins 5 employés actifs
ORDER BY moy_salaire DESC;`,
        edgeCasesFr: [
          "Cas particulier 1 (`COUNT(*)` vs `COUNT(col)`) : `COUNT(*)` compte toutes les lignes du groupe y compris les NULL, tandis que `COUNT(commission)` ignore les valeurs NULL.",
          "Cas particulier 2 (`AVG` sur NULL) : `AVG(val)` divise uniquement par le nombre de valeurs non-NULL. Utilisez `AVG(COALESCE(val, 0))` pour inclure les absents.",
          "Cas particulier 3 (Alias SELECT) : En SQL standard et Oracle/Postgres, un alias défini dans `SELECT` n'est pas encore visible dans `WHERE` ni `HAVING`."
        ],
        edgeCasesEn: [
          "Edge Case 1 (`COUNT(*)` vs `COUNT(col)`): `COUNT(*)` counts all rows including NULLs, while `COUNT(col)` ignores NULLs.",
          "Edge Case 2 (`AVG` with NULL): `AVG(val)` divides only by non-NULL rows; wrap with `COALESCE(val, 0)` if needed.",
          "Edge Case 3 (SELECT Aliases): Standard SQL does not allow referencing a SELECT alias inside WHERE or HAVING."
        ],
      },
    };
  }

  // Cas 3 : CTE / WITH RECURSIVE / Sous-requêtes / NULL NOT IN
  if (combined.includes('CTE') || combined.includes('WITH') || combined.includes('NOT IN') || combined.includes('EXISTS') || combined.includes('SUBQ')) {
    return {
      hintFr:
        "Vérifie le comportement de l'opérateur face à une valeur NULL dans l'ensemble retourné ou la condition d'arrêt de la récursion.",
      hintEn:
        "Check how the operator behaves when a NULL value is present in the returned set or recursion termination condition.",
      explanationFr:
        "En logique ternaire SQL (TRUE, FALSE, UNKNOWN), `x NOT IN (10, 20, NULL)` équivaut à `x <> 10 AND x <> 20 AND x <> NULL`. Comme `x <> NULL` vaut toujours UNKNOWN, toute la clause WHERE retourne 0 ligne !",
      explanationEn:
        "In SQL three-valued logic (TRUE, FALSE, UNKNOWN), `x NOT IN (10, 20, NULL)` expands to `x <> 10 AND x <> 20 AND x <> NULL`. Because `x <> NULL` is UNKNOWN, the entire WHERE clause returns 0 rows!",
      course: {
        titleFr: 'Sous-requêtes, CTE Récursives et Logique Ternaire NULL',
        titleEn: 'Subqueries, Recursive CTEs & Three-Valued NULL Logic',
        fullTheoryFr:
          "Pour tester l'absence de correspondance en présence potentielle de valeurs NULL, privilégiez toujours `NOT EXISTS` (qui teste l'existence de lignes et ignore la valeur des colonnes) ou filtrez explicitement `WHERE col IS NOT NULL` dans la sous-requête. Pour les CTE (`WITH`), rappelez-vous que leur portée est strictement limitée à l'instruction SQL qui suit immédiatement.",
        fullTheoryEn:
          "To test non-existence safely when NULLs may exist, always prefer `NOT EXISTS` or filter `WHERE col IS NOT NULL` inside the subquery. For CTEs (`WITH`), their scope is strictly limited to the single SQL statement that immediately follows.",
        exampleCode: `-- ❌ PIÈGE : Retourne 0 ligne si manager_id contient un seul NULL
SELECT emp_name FROM employees
WHERE emp_id NOT IN (SELECT manager_id FROM employees);

-- ✅ SOLUTION ROBUSTE : NOT EXISTS est insensible aux NULL
SELECT e.emp_name FROM employees e
WHERE NOT EXISTS (
  SELECT 1 FROM employees m WHERE m.manager_id = e.emp_id
);`,
        edgeCasesFr: [
          "Cas particulier 1 (`IN` vs `NOT IN`) : `IN (10, 20, NULL)` utilise `OR` et fonctionne pour 10 et 20, tandis que `NOT IN` utilise `AND` et échoue totalement dès le premier NULL.",
          "Cas particulier 2 (`WITH RECURSIVE`) : Doit obligatoirement comporter un membre d'ancrage, l'opérateur `UNION ALL` (ou `UNION`) et une condition d'arrêt sur la profondeur.",
          "Cas particulier 3 (Matérialisation CTE) : Sous PostgreSQL 12+, une CTE appelée une seule fois est fusionnée (inlined) sauf si `MATERIALIZED` est spécifié."
        ],
        edgeCasesEn: [
          "Edge Case 1 (`IN` vs `NOT IN`): `IN` uses `OR` and still matches non-null values, whereas `NOT IN` uses `AND` and fails completely on a single NULL.",
          "Edge Case 2 (`WITH RECURSIVE`): Requires an anchor member, `UNION ALL`, and a termination condition.",
          "Edge Case 3 (CTE Materialization): Modern optimizers inline single-use CTEs unless `MATERIALIZED` is specified."
        ],
      },
    };
  }

  // Cas 4 : Index / Performance / Transactions / Défaut enrichi
  return {
    hintFr:
      params.trapName
        ? `Regarde attentivement le mécanisme lié à « ${params.trapName} » dans l'énoncé et vérifie l'ordre des opérations.`
        : "Regarde attentivement les clauses de la requête et identifie quelle opération est évaluée en premier par le moteur SGBD.",
    hintEn:
      params.trapName
        ? `Look closely at the "${params.trapName}" mechanism in the prompt and check the order of operations.`
        : "Look closely at the query clauses and identify which operation the DBMS evaluates first.",
    explanationFr:
      params.explanationText
        ? `${params.explanationText.split('.')[0]}. Analyse comment cette règle écarte les options contenant un piège syntaxique ou de verrouillage.`
        : "Le moteur SGBD applique les règles de visibilité transactionnelle (MVCC) et d'accès par index (SARGability) avant de projeter le résultat final.",
    explanationEn:
      params.explanationText
        ? `${params.explanationText.split('.')[0]}. Analyze how this rule eliminates options containing a syntax or locking trap.`
        : "The database engine enforces transactional visibility (MVCC) and index SARGability rules before projecting the final result.",
    course: {
      titleFr: `Cours Complet : ${params.topic || 'Architecture SQL'} — ${params.subtopic || params.trapName || 'Règles Officielles'}`,
      titleEn: `Complete Course: ${params.topic || 'SQL Architecture'} — ${params.subtopic || params.trapName || 'Official Rules'}`,
      fullTheoryFr:
        params.explanationText ||
        "Pour réussir les questions de certification sur l'optimisation et les transactions, vérifiez systématiquement : 1) Si une fonction entoure la colonne indexée (désactivant l'Index Range Scan standard), 2) Si la première colonne (Leading Column) de l'index composite est présente dans le prédicat, et 3) Quel niveau d'isolation (READ COMMITTED vs SERIALIZABLE) régit la transaction.",
      fullTheoryEn:
        params.explanationText ||
        "To master certification questions on optimization and transactions, systematically check: 1) Whether a function wraps the indexed column, 2) Whether the composite index leading column is present in the predicate, and 3) Which isolation level governs the transaction.",
      exampleCode:
        params.codeSnippet ||
        `-- ❌ Non-SARGable : Fonction sur la colonne indexée (Full Table Scan)
SELECT * FROM orders WHERE EXTRACT(YEAR FROM order_date) = 2025;

-- ✅ SARGable : Prédicat par intervalle exploitant l'index B-Tree
SELECT * FROM orders
WHERE order_date >= DATE '2025-01-01'
  AND order_date <  DATE '2026-01-01';`,
      edgeCasesFr: [
        "Cas particulier 1 (Index Composite) : Un index sur `(dept_id, job_id)` n'est utilisé efficacement que si `dept_id` est filtré (sauf Index Skip Scan à faible cardinalité).",
        "Cas particulier 2 (Transactions & DDL) : Sous Oracle, toute instruction DDL (`CREATE`, `ALTER`, `TRUNCATE`) émet un `COMMIT` implicite avant et après son exécution.",
        "Cas particulier 3 (SAVEPOINT) : `ROLLBACK TO SAVEPOINT sp1` annule les modifications depuis `sp1` sans terminer la transaction ni libérer les verrous antérieurs."
      ],
      edgeCasesEn: [
        "Edge Case 1 (Composite Index): An index on `(dept_id, job_id)` requires filtering on `dept_id` for a standard Range Scan.",
        "Edge Case 2 (Transactions & DDL): In Oracle, any DDL statement issues an implicit `COMMIT` before and after execution.",
        "Edge Case 3 (SAVEPOINT): `ROLLBACK TO SAVEPOINT` undoes changes after the savepoint without ending the transaction."
      ],
    },
  };
}

export const ProgressiveExplainPanel: React.FC<ProgressiveExplainPanelProps> = ({
  questionId,
  topic,
  subtopic,
  trapName,
  promptText,
  codeSnippet,
  explanationText,
  correctOptionLetter,
  correctOptionText,
  hasSelectedAnswer = false,
  onRevealSolution,
  onFocusAnswer,
  onHintUsed,
  lang,
  theme = 'dark',
  defaultOpenLevel = 'none',
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  const [activeLevel, setActiveLevel] = useState<'none' | 'hint' | 'explain' | 'course' | 'solution'>(
    defaultOpenLevel
  );

  // Réinitialiser le volet quand on change de question (sauf si defaultOpenLevel est forcé)
  useEffect(() => {
    setActiveLevel(defaultOpenLevel);
  }, [questionId, defaultOpenLevel]);

  const pedagogy = buildProgressivePedagogy({
    topic,
    subtopic,
    trapName,
    promptText,
    codeSnippet,
    explanationText,
  });

  const handleSelectLevel = (level: 'hint' | 'explain' | 'course' | 'solution') => {
    if (activeLevel === level) {
      setActiveLevel('none');
      return;
    }
    setActiveLevel(level);
    if (onHintUsed) {
      onHintUsed(level);
    }
    if (level === 'solution' && onRevealSolution) {
      onRevealSolution();
    }
  };

  return (
    <div className="flex flex-col gap-3 my-1">
      {/* =====================================================================
          BARRE D'ACTIONS PROGRESSIVE PAR QUESTION :
          [Réponse]  [Indice]  [Expliquer]  [Voir la solution]
         ===================================================================== */}
      <div
        className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 transition-colors ${
          isLight
            ? 'bg-[#f8fafc] border-[#cbd5e1]'
            : 'bg-[#0b1c30] border-[#1b2b3f]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[#0284c7]/15 text-[#38bdf8] font-mono text-[10px] font-bold uppercase tracking-wider border border-[#0284c7]/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {isFr ? '« Explique-moi »' : '“Explain to me”'}
          </span>
          <span className="text-[11px] text-[#89929b] hidden sm:inline">
            {isFr
              ? 'Aide graduée en 3 niveaux sans dévoiler immédiatement la réponse'
              : '3-tier progressive help without immediately spoiling the answer'}
          </span>
        </div>

        {/* Les 4 boutons demandés : [Réponse] [Indice] [Expliquer] [Voir la solution] (+ accès direct 📖 Cours) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* 1. [Réponse] */}
          <button
            type="button"
            onClick={() => {
              setActiveLevel('none');
              if (onFocusAnswer) onFocusAnswer();
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all flex items-center gap-1.5 ${
              hasSelectedAnswer
                ? 'bg-[#10b981]/15 text-[#4edea3] border-[#10b981]/40'
                : isLight
                ? 'bg-white text-[#334155] border-[#cbd5e1] hover:border-[#0284c7]'
                : 'bg-[#102034] text-[#d3e4fe] border-[#26364a] hover:border-[#38bdf8]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4edea3]" />
            <span>{isFr ? 'Réponse' : 'Answer'}</span>
          </button>

          {/* 2. [Indice] -> Niveau 1 : 💡 Indice */}
          <button
            type="button"
            onClick={() => handleSelectLevel('hint')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeLevel === 'hint'
                ? 'bg-[#f59e0b] text-[#000f21] border-[#f59e0b] shadow-md shadow-[#f59e0b]/20'
                : 'bg-[#f59e0b]/10 text-[#fbbf24] border-[#f59e0b]/30 hover:bg-[#f59e0b]/20'
            }`}
          >
            <span>💡</span>
            <span>{isFr ? 'Indice' : 'Hint'}</span>
          </button>

          {/* 3. [Expliquer] -> Niveau 2 : 🧠 Explication (+ Niveau 3 : 📖 Cours) */}
          <button
            type="button"
            onClick={() => handleSelectLevel('explain')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeLevel === 'explain' || activeLevel === 'course'
                ? 'bg-[#0284c7] text-white border-[#38bdf8] shadow-md shadow-[#0284c7]/25'
                : 'bg-[#0284c7]/15 text-[#38bdf8] border-[#0284c7]/30 hover:bg-[#0284c7]/25'
            }`}
          >
            <span>🧠</span>
            <span>{isFr ? 'Expliquer' : 'Explain'}</span>
          </button>

          {/* Bouton direct Niveau 3 : [📖 Cours] */}
          <button
            type="button"
            onClick={() => handleSelectLevel('course')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeLevel === 'course'
                ? 'bg-[#8b5cf6] text-white border-[#a78bfa] shadow-md shadow-[#8b5cf6]/25'
                : 'bg-[#8b5cf6]/15 text-[#c084fc] border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/25'
            }`}
          >
            <span>📖</span>
            <span>{isFr ? 'Cours' : 'Course'}</span>
          </button>

          {/* 4. [Voir la solution] */}
          <button
            type="button"
            onClick={() => handleSelectLevel('solution')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all flex items-center gap-1.5 ${
              activeLevel === 'solution'
                ? 'bg-[#10b981] text-[#002c47] border-[#4edea3] shadow-md shadow-[#10b981]/25'
                : 'bg-[#10b981]/10 text-[#4edea3] border-[#10b981]/30 hover:bg-[#10b981]/20'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isFr ? 'Voir la solution' : 'See solution'}</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          VOLET DÉPLIANT PROGRESSIF (NIVEAU 1 -> NIVEAU 2 -> NIVEAU 3 -> SOLUTION)
         ===================================================================== */}
      {activeLevel !== 'none' && (
        <div
          className={`p-4 rounded-xl border transition-all animate-fade-in flex flex-col gap-3.5 ${
            isLight
              ? 'bg-white border-[#cbd5e1] shadow-md'
              : 'bg-[#000f21] border-[#1b2b3f] shadow-xl'
          }`}
        >
          {/* Stepper des 3 niveaux pédagogiques */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1b2b3f]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveLevel('hint')}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeLevel === 'hint'
                    ? 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]'
                    : 'text-[#89929b] hover:text-[#d3e4fe]'
                }`}
              >
                <span>1. 💡 {isFr ? 'Indice' : 'Hint'}</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#64748b]" />
              <button
                type="button"
                onClick={() => setActiveLevel('explain')}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeLevel === 'explain'
                    ? 'bg-[#0284c7]/20 text-[#38bdf8] border border-[#38bdf8]'
                    : 'text-[#89929b] hover:text-[#d3e4fe]'
                }`}
              >
                <span>2. 🧠 {isFr ? 'Explication' : 'Explanation'}</span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#64748b]" />
              <button
                type="button"
                onClick={() => setActiveLevel('course')}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeLevel === 'course'
                    ? 'bg-[#8b5cf6]/20 text-[#c084fc] border border-[#a78bfa]'
                    : 'text-[#89929b] hover:text-[#d3e4fe]'
                }`}
              >
                <span>3. 📖 {isFr ? 'Cours & Cas particuliers' : 'Course & Edge Cases'}</span>
              </button>
            </div>

            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#102034] text-[#93ccff] border border-[#1b2b3f]">
              {activeLevel === 'solution'
                ? isFr
                  ? '🔓 Solution dévoilée'
                  : '🔓 Solution revealed'
                : isFr
                ? '🔒 Réponse masquée (réflexion active)'
                : '🔒 Answer hidden (active recall)'}
            </span>
          </div>

          {/* NIVEAU 1 : 💡 INDICE */}
          {activeLevel === 'hint' && (
            <div className="p-3.5 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-[#fbbf24] flex items-center gap-2">
                  <span className="text-base">💡</span>
                  {isFr ? 'Indice (Niveau 1 / 3)' : 'Hint (Level 1 / 3)'}
                </span>
                <span className="font-mono text-[10px] text-[#fbbf24]/80">
                  {isFr ? 'Orientation sans donner la réponse' : 'Guidance without spoiling'}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#0f172a] dark:text-[#fef08a] leading-relaxed">
                {isFr ? pedagogy.hintFr : pedagogy.hintEn}
              </p>
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectLevel('explain')}
                  className="px-3 py-1.5 rounded-lg bg-[#0284c7]/20 hover:bg-[#0284c7]/30 text-[#38bdf8] border border-[#0284c7]/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>{isFr ? 'Besoin de plus ? Passer à 🧠 Explication' : 'Need more? Go to 🧠 Explanation'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* NIVEAU 2 : 🧠 EXPLICATION */}
          {activeLevel === 'explain' && (
            <div className="p-3.5 rounded-xl bg-[#0284c7]/10 border border-[#0284c7]/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-[#38bdf8] flex items-center gap-2">
                  <span className="text-base">🧠</span>
                  {isFr ? 'Explication du mécanisme (Niveau 2 / 3)' : 'Mechanism Explanation (Level 2 / 3)'}
                </span>
                <span className="font-mono text-[10px] text-[#38bdf8]/80">
                  {isFr ? 'Raisonnement SQL' : 'SQL Reasoning'}
                </span>
              </div>
              <p className="text-sm text-[#0f172a] dark:text-[#d3e4fe] leading-relaxed">
                {isFr ? pedagogy.explanationFr : pedagogy.explanationEn}
              </p>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectLevel('hint')}
                  className="font-mono text-[11px] text-[#89929b] hover:text-[#d3e4fe]"
                >
                  ← {isFr ? 'Retour à 💡 Indice' : 'Back to 💡 Hint'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLevel('course')}
                  className="px-3 py-1.5 rounded-lg bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/30 text-[#c084fc] border border-[#8b5cf6]/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>{isFr ? 'Approfondir avec 📖 Cours & Exemples' : 'Deep dive with 📖 Course & Examples'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* NIVEAU 3 : 📖 COURS COMPLET + EXEMPLES + CAS PARTICULIERS */}
          {activeLevel === 'course' && (
            <div className="p-4 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-[#c084fc] flex items-center gap-2">
                  <span className="text-base">📖</span>
                  {isFr ? pedagogy.course.titleFr : pedagogy.course.titleEn}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#8b5cf6]/20 text-[#c084fc]">
                  {isFr ? 'Niveau 3 / 3 — Fiche de Cours' : 'Level 3 / 3 — Study Course'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#0f172a] dark:text-[#d3e4fe] leading-relaxed">
                {isFr ? pedagogy.course.fullTheoryFr : pedagogy.course.fullTheoryEn}
              </p>

              {/* Exemple SQL commenté */}
              <div className="rounded-xl overflow-hidden border border-[#1b2b3f] bg-[#051020]">
                <div className="px-3 py-1.5 bg-[#0b1c30] border-b border-[#1b2b3f] font-mono text-[10px] text-[#93ccff] font-bold flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>{isFr ? 'Exemple comparatif SQL (Piège vs Bonne Pratique)' : 'Comparative SQL Example (Trap vs Best Practice)'}</span>
                </div>
                <pre className="p-3 font-mono text-xs text-[#38bdf8] overflow-x-auto leading-relaxed">
                  <code>{pedagogy.course.exampleCode}</code>
                </pre>
              </div>

              {/* Cas particuliers de certification */}
              <div className="p-3 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-1.5">
                <span className="font-mono text-[11px] font-bold text-[#fbbf24] uppercase">
                  {isFr ? '⚠️ Cas particuliers à connaître pour l\'examen :' : '⚠️ Edge cases to know for the exam:'}
                </span>
                <ul className="space-y-1.5 text-xs text-[#bfc7d2] list-disc pl-4">
                  {(isFr ? pedagogy.course.edgeCasesFr : pedagogy.course.edgeCasesEn).map((ec, i) => (
                    <li key={i} className="leading-relaxed">
                      {ec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* VOIR LA SOLUTION COMPLÈTE */}
          {activeLevel === 'solution' && (
            <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/40 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-[#4edea3] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  {isFr ? 'Solution Officielle Dévoilée' : 'Official Solution Revealed'}
                </span>
                {correctOptionLetter && (
                  <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-extrabold bg-[#10b981] text-[#002c47]">
                    {isFr ? `Bonne réponse : Option ${correctOptionLetter}` : `Correct Answer: Option ${correctOptionLetter}`}
                  </span>
                )}
              </div>

              {correctOptionText && (
                <div className="p-2.5 rounded-lg bg-[#000f21]/80 border border-[#10b981]/30 text-xs font-semibold text-[#4edea3]">
                  {correctOptionLetter ? `${correctOptionLetter}. ` : ''}
                  {correctOptionText}
                </div>
              )}

              <p className="text-xs sm:text-sm text-[#0f172a] dark:text-[#d3e4fe] leading-relaxed">
                {explanationText || (isFr ? pedagogy.explanationFr : pedagogy.explanationEn)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
