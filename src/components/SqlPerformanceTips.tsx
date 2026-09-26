import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Cpu, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  Database
} from 'lucide-react';

export type Dialect = 'oracle' | 'postgres' | 'mysql' | 'azure';

export interface PerformanceTip {
  id: string;
  keyword: string;
  severity: 'critical' | 'warning' | 'info' | 'good';
  category: 'index' | 'memory' | 'io' | 'antipattern' | 'dialect';
  titleFr: string;
  titleEn: string;
  triggerFr: string;
  triggerEn: string;
  descriptionFr: string;
  descriptionEn: string;
  recommendationFr: string;
  recommendationEn: string;
  exampleBefore?: string;
  exampleAfter?: string;
  dialectNoteFr?: string;
  dialectNoteEn?: string;
}

interface SqlPerformanceTipsProps {
  sqlCode: string;
  selectedDialect: Dialect;
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  onSwitchToPlanTab?: () => void;
}

export const SqlPerformanceTips: React.FC<SqlPerformanceTipsProps> = ({
  sqlCode,
  selectedDialect,
  lang,
  theme,
  onSwitchToPlanTab
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.querySelector('.theme-light') !== null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [expandedTipId, setExpandedTipId] = useState<string | null>(null);

  // Dynamic analysis of SQL code against DBA best practice patterns
  const detectedTips = useMemo<PerformanceTip[]>(() => {
    const code = sqlCode || '';
    const tips: PerformanceTip[] = [];

    // 1. SELECT * pattern
    if (/\bSELECT\s+(?:DISTINCT\s+)?(?:\*|(?:[a-zA-Z0-9_.]+\s*,\s*)*\*)/i.test(code)) {
      tips.push({
        id: 'select-star',
        keyword: 'SELECT *',
        severity: 'warning',
        category: 'io',
        titleFr: 'Projection exhaustive (SELECT *)',
        titleEn: 'Unfiltered Column Projection (SELECT *)',
        triggerFr: 'Mot-clé détecté : SELECT *',
        triggerEn: 'Detected keyword: SELECT *',
        descriptionFr: 'Récupérer toutes les colonnes désactive les index couvrants (Index-Only Scan), augmente le trafic I/O réseau et consomme inutilement de la mémoire tampon.',
        descriptionEn: 'Retrieving all columns disables Index-Only Scans, increases network and disk I/O, and unnecessarily inflates buffer cache consumption.',
        recommendationFr: 'Déclarez explicitement uniquement les colonnes nécessaires à la requête.',
        recommendationEn: 'Explicitly project only the columns strictly needed by the application.',
        exampleBefore: 'SELECT * FROM hr.employees WHERE department_id = 10;',
        exampleAfter: 'SELECT employee_id, last_name, salary FROM hr.employees WHERE department_id = 10;'
      });
    }

    // 2. LIKE with leading wildcard (%abc or _abc)
    if (/\bLIKE\s+['"][%_]/i.test(code)) {
      tips.push({
        id: 'like-leading-wildcard',
        keyword: "LIKE '%...'",
        severity: 'critical',
        category: 'index',
        titleFr: 'Prédicat non-sargable (LIKE avec % initial)',
        titleEn: 'Non-Sargable Predicate (Leading Wildcard LIKE)',
        triggerFr: "Mot-clé détecté : LIKE '%...'",
        triggerEn: "Detected pattern: LIKE '%...'",
        descriptionFr: 'Un caractère joker au début de la chaîne rend le prédicat non-sargable : le moteur SQL ne peut pas parcourir l\'arbre B-Tree de l\'index et bascule en Full Table Scan (FTS).',
        descriptionEn: 'A leading wildcard prevents the optimizer from performing a B-Tree Index Range Scan, forcing a costly Full Table Scan (FTS).',
        recommendationFr: 'Privilégiez une recherche par préfixe (LIKE \'val%\') ou déployez un index Text/Full-Text (Oracle Text CONTAINS ou pg_trgm).',
        recommendationEn: 'Use prefix searches (LIKE \'val%\') or implement a Full-Text/Trigram index (Oracle Text CONTAINS or PostgreSQL pg_trgm).',
        exampleBefore: "SELECT * FROM hr.employees WHERE last_name LIKE '%son';",
        exampleAfter: "-- Préférer la recherche préfixe :\nSELECT * FROM hr.employees WHERE last_name LIKE 'John%';"
      });
    }

    // 3. NOT IN with Subquery
    if (/\bNOT\s+IN\s*\(\s*SELECT\b/i.test(code)) {
      tips.push({
        id: 'not-in-subquery',
        keyword: 'NOT IN (SELECT...)',
        severity: 'critical',
        category: 'antipattern',
        titleFr: 'Piège à NULL et Anti-Join inefficace (NOT IN)',
        titleEn: 'NULL Trap & Suboptimal Anti-Join (NOT IN)',
        triggerFr: 'Mot-clé détecté : NOT IN (SELECT ...)',
        triggerEn: 'Detected pattern: NOT IN (SELECT ...)',
        descriptionFr: 'Si la sous-requête contient une seule valeur NULL, NOT IN évalue toute l\'expression à UNKNOWN et ne retourne aucun résultat. De plus, cela bloque souvent les transformations optimisées en HASH ANTI JOIN.',
        descriptionEn: 'If the subquery yields even one NULL value, NOT IN evaluates to UNKNOWN and returns zero rows, often blocking efficient HASH ANTI JOIN transformations.',
        recommendationFr: 'Remplacez NOT IN par NOT EXISTS ou un LEFT JOIN ... WHERE ... IS NULL.',
        recommendationEn: 'Replace NOT IN with NOT EXISTS or a LEFT JOIN with an IS NULL condition.',
        exampleBefore: 'SELECT * FROM hr.departments WHERE department_id NOT IN (SELECT department_id FROM hr.employees);',
        exampleAfter: 'SELECT d.* FROM hr.departments d WHERE NOT EXISTS (\n  SELECT 1 FROM hr.employees e WHERE e.department_id = d.department_id\n);'
      });
    }

    // 4. UNION without ALL
    if (/\bUNION(?!\s+ALL\b)/i.test(code)) {
      tips.push({
        id: 'union-dedup',
        keyword: 'UNION (sans ALL)',
        severity: 'warning',
        category: 'memory',
        titleFr: 'Dédoublonnage coûteux (UNION vs UNION ALL)',
        titleEn: 'Expensive Deduplication (UNION vs UNION ALL)',
        triggerFr: 'Mot-clé détecté : UNION',
        triggerEn: 'Detected keyword: UNION',
        descriptionFr: 'Le mot-clé UNION effectue implicitement un tri ou un hachage (SORT UNIQUE / HASH UNIQUE) pour éliminer les doublons. Si les ensembles de données sont déjà disjoints, cette opération pénalise l\'UC et la mémoire temporaire.',
        descriptionEn: 'UNION executes an implicit SORT UNIQUE or HASH UNIQUE step. If the subsets are already disjoint, this wastes CPU and memory.',
        recommendationFr: 'Utilisez UNION ALL dès que les doublons n\'existent pas ou sont acceptables.',
        recommendationEn: 'Use UNION ALL whenever duplicates do not exist or are acceptable for the business logic.',
        exampleBefore: 'SELECT employee_id FROM hr.employees\nUNION\nSELECT manager_id FROM hr.departments;',
        exampleAfter: 'SELECT employee_id FROM hr.employees\nUNION ALL\nSELECT manager_id FROM hr.departments;'
      });
    }

    // 5. Functions wrapping indexed columns in WHERE
    if (/\bWHERE\b.*?\b(UPPER|LOWER|TO_CHAR|TO_DATE|DATE|SUBSTR|SUBSTRING|TRUNC|ROUND|YEAR|MONTH)\s*\(\s*[a-zA-Z0-9_.]+\s*\)\s*(=|<|>|LIKE|IN)/i.test(code)) {
      tips.push({
        id: 'function-in-where',
        keyword: 'UPPER() / TRUNC() dans WHERE',
        severity: 'warning',
        category: 'index',
        titleFr: 'Fonction sur colonne indexée dans WHERE',
        titleEn: 'Function on Indexed Column in WHERE',
        triggerFr: 'Mot-clé détecté : Fonction scalaire dans WHERE',
        triggerEn: 'Detected pattern: Scalar function in WHERE',
        descriptionFr: 'Appliquer une fonction sur une colonne dans la clause WHERE neutralise l\'utilisation des index B-Tree ordinaires, forçant un parcours séquentiel de table.',
        descriptionEn: 'Wrapping an indexed column inside a scalar function disables ordinary B-Tree index lookups and triggers a full table scan.',
        recommendationFr: 'Créez un index basé sur une fonction (Oracle Function-Based Index / Postgres Expression Index) ou adaptez la requête sans transformer la colonne.',
        recommendationEn: 'Create a Function-Based Index (FBI) or rewrite the predicate without mutating the column value.',
        exampleBefore: "WHERE UPPER(last_name) = 'KING'",
        exampleAfter: "-- Solution 1: Index basé sur fonction\nCREATE INDEX idx_emp_upper_name ON hr.employees(UPPER(last_name));\n-- Solution 2: Requête sans mutation\nWHERE last_name = 'King'"
      });
    }

    // 6. HAVING without aggregates
    if (/\bHAVING\b.*?(?:[a-zA-Z0-9_.]+\s*(?:=|>|<|LIKE|IN))/i.test(code) && !/\bHAVING\b.*?(?:SUM|COUNT|AVG|MIN|MAX)\s*\(/i.test(code)) {
      tips.push({
        id: 'having-filtering',
        keyword: 'HAVING',
        severity: 'warning',
        category: 'memory',
        titleFr: 'Filtrage post-agrégation dans HAVING',
        titleEn: 'Late Filtering in HAVING Clause',
        triggerFr: 'Mot-clé détecté : HAVING sur colonnes simples',
        triggerEn: 'Detected pattern: HAVING on raw columns',
        descriptionFr: 'Les conditions dans HAVING sont évaluées après le regroupement (GROUP BY). Déplacer ces critères dans WHERE permet d\'éliminer les lignes en amont et d\'alléger l\'agrégation en mémoire.',
        descriptionEn: 'Conditions in HAVING are evaluated after GROUP BY. Moving raw column filters to WHERE reduces rows before aggregation and saves memory.',
        recommendationFr: 'Réservez HAVING uniquement aux fonctions d\'agrégation (ex: HAVING COUNT(*) > 2) et filtrez les attributs standards dans WHERE.',
        recommendationEn: 'Reserve HAVING strictly for aggregate conditions (e.g. HAVING COUNT(*) > 2) and filter column attributes in WHERE.',
        exampleBefore: 'SELECT department_id, COUNT(*) FROM hr.employees GROUP BY department_id HAVING department_id = 10;',
        exampleAfter: 'SELECT department_id, COUNT(*) FROM hr.employees WHERE department_id = 10 GROUP BY department_id;'
      });
    }

    // 7. DISTINCT usage
    if (/\bSELECT\s+DISTINCT\b/i.test(code)) {
      tips.push({
        id: 'distinct-overhead',
        keyword: 'DISTINCT',
        severity: 'info',
        category: 'memory',
        titleFr: 'Consommation mémoire de DISTINCT',
        titleEn: 'Memory Overhead with DISTINCT',
        triggerFr: 'Mot-clé détecté : SELECT DISTINCT',
        triggerEn: 'Detected keyword: SELECT DISTINCT',
        descriptionFr: 'DISTINCT déclenche une opération HASH UNIQUE ou SORT UNIQUE. En conception de requêtes, DISTINCT est souvent utilisé pour pallier un produit cartésien partiel causé par un JOIN mal contraint.',
        descriptionEn: 'DISTINCT triggers a HASH UNIQUE or SORT UNIQUE pass. It is frequently employed to mask duplicate rows caused by incomplete JOIN conditions.',
        recommendationFr: 'Vérifiez les clés de jointure (ON) pour garantir la cardinalité au lieu d\'éliminer les doublons après coup.',
        recommendationEn: 'Verify your JOIN predicates to guarantee natural cardinality rather than de-duplicating rows post-join.'
      });
    }

    // 8. Analytical Window Functions optimization (OVER / PARTITION BY / ORDER BY)
    if (/\bOVER\s*\(/i.test(code)) {
      tips.push({
        id: 'window-function-tuning',
        keyword: 'OVER (PARTITION BY ... ORDER BY)',
        severity: 'info',
        category: 'index',
        titleFr: 'Optimisation de l\'accès pour Window Functions',
        titleEn: 'Access Path Tuning for Analytic Window Functions',
        triggerFr: 'Mot-clé détecté : Fonctions de fenêtrage (OVER / PARTITION BY)',
        triggerEn: 'Detected pattern: Window functions (OVER / PARTITION BY)',
        descriptionFr: 'Les clauses PARTITION BY et ORDER BY dans OVER() nécessitent un tri en mémoire (WINDOW SORT). Un index composite aligné permet au moteur de lire les données pré-triées et d\'éliminer le coût de tri.',
        descriptionEn: 'PARTITION BY and ORDER BY clauses require a WINDOW SORT in memory. A composite index aligned with these columns allows the engine to stream pre-sorted data without sorting.',
        recommendationFr: 'Créez un index composite couvrant : (colonne_partition, colonne_order DESC/ASC) pour éviter les débordements sur disque temporaire.',
        recommendationEn: 'Create a composite index covering: (partition_col, order_col) to avoid spill-over to temporary disk.',
        exampleBefore: 'DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC)',
        exampleAfter: '-- Index d\'accès direct sans tri :\nCREATE INDEX idx_emp_dept_sal ON hr.employees(department_id, salary DESC);'
      });
    }

    // 9. CROSS JOIN or comma join without where
    if (/\bCROSS\s+JOIN\b/i.test(code) || /\bFROM\s+[a-zA-Z0-9_.]+\s*,\s*[a-zA-Z0-9_.]+(?!\s*WHERE)/i.test(code)) {
      tips.push({
        id: 'cartesian-join',
        keyword: 'CROSS JOIN',
        severity: 'critical',
        category: 'antipattern',
        titleFr: 'Risque de produit cartésien (CROSS JOIN)',
        titleEn: 'Cartesian Product Risk (CROSS JOIN)',
        triggerFr: 'Mot-clé détecté : CROSS JOIN ou jointure sans prédicat',
        triggerEn: 'Detected pattern: CROSS JOIN or comma join without predicate',
        descriptionFr: 'Un produit cartésien génère le produit des lignes des deux tables (N × M), ce qui peut saturer la mémoire et le temp tablespace en quelques secondes.',
        descriptionEn: 'A Cartesian product yields N × M rows, rapidly overflowing memory and temp tablespaces.',
        recommendationFr: 'Spécifiez une clause INNER JOIN avec une condition ON d\'intégrité référentielle.',
        recommendationEn: 'Use an explicit INNER JOIN with a rigorous ON clause matching foreign keys.'
      });
    }

    // 10. Multiple OR in WHERE
    if (/\bWHERE\b.*?\bOR\b/i.test(code)) {
      tips.push({
        id: 'or-predicates',
        keyword: 'OR dans WHERE',
        severity: 'info',
        category: 'index',
        titleFr: 'Prédicats multiples avec OR',
        titleEn: 'Multiple Predicates with OR',
        triggerFr: 'Mot-clé détecté : Opérateur OR dans WHERE',
        triggerEn: 'Detected keyword: OR in WHERE clause',
        descriptionFr: 'Un prédicat OR sur plusieurs colonnes distinctes neutralise l\'utilisation d\'un index composite unique et pousse l\'optimiseur vers une concaténation d\'index (CONCATENATION) ou un scan complet.',
        descriptionEn: 'An OR condition across multiple columns prevents single composite index lookups, prompting index concatenation or a full table scan.',
        recommendationFr: 'Évaluez si un UNION ALL de deux sous-requêtes indépendantes indexées offre une vitesse d\'accès supérieure.',
        recommendationEn: 'Consider whether a UNION ALL of two distinct indexed queries yields better execution times.'
      });
    }

    // 11. Dialect-specific proactive pro-tip
    if (selectedDialect === 'oracle') {
      tips.push({
        id: 'dialect-oracle',
        keyword: 'Oracle 19c Engine',
        severity: 'good',
        category: 'dialect',
        titleFr: 'Moteur Oracle 19c : Gestion du PGA et Plan d\'Exécution',
        titleEn: 'Oracle 19c Engine: PGA Sizing & Window Buffer',
        triggerFr: 'Dialecte actif : Oracle 19c',
        triggerEn: 'Active dialect: Oracle 19c',
        descriptionFr: 'Oracle 19c alloue des buffers de fenêtrage dans la PGA (Private Global Area). Pour les requêtes analytiques sur de volumineuses tables, surveillez le paramètre pga_aggregate_limit.',
        descriptionEn: 'Oracle 19c allocates window buffers in the PGA (Private Global Area). For large analytical queries, monitor the pga_aggregate_limit parameter.',
        recommendationFr: 'Consultez l\'onglet "Plan d\'Exécution" pour vérifier la présence de l\'opération WINDOW BUFFER sans débordement sur TEMP.',
        recommendationEn: 'Review the "Execution Plan" tab to verify WINDOW BUFFER operations without temporary tablespace spillage.'
      });
    } else if (selectedDialect === 'postgres') {
      tips.push({
        id: 'dialect-postgres',
        keyword: 'PostgreSQL 15 Engine',
        severity: 'good',
        category: 'dialect',
        titleFr: 'Moteur PostgreSQL 15 : Paramétrage work_mem',
        titleEn: 'PostgreSQL 15 Engine: work_mem Sizing',
        triggerFr: 'Dialecte actif : PostgreSQL 15',
        triggerEn: 'Active dialect: PostgreSQL 15',
        descriptionFr: 'Sous PostgreSQL, chaque étape WindowAgg ou Sort consomme de la mémoire allouée par work_mem. Si la table dépasse ce seuil, PostgreSQL bascule sur disque temporaire (external merge).',
        descriptionEn: 'In PostgreSQL, WindowAgg and Sort steps consume memory defined by work_mem. Exceeding this budget causes external disk merges.',
        recommendationFr: 'Augmentez localement work_mem pour la session analytique : SET work_mem = "64MB";',
        recommendationEn: 'Tune work_mem locally for analytical sessions: SET work_mem = "64MB";'
      });
    } else if (selectedDialect === 'mysql') {
      tips.push({
        id: 'dialect-mysql',
        keyword: 'MySQL 8.0 Engine',
        severity: 'good',
        category: 'dialect',
        titleFr: 'Moteur MySQL 8.0 : Surveillance Filesort',
        titleEn: 'MySQL 8.0 Engine: Filesort Inspection',
        triggerFr: 'Dialecte actif : MySQL 8.0',
        triggerEn: 'Active dialect: MySQL 8.0',
        descriptionFr: 'MySQL 8 supporte les fonctions analytiques natives. Surveillez dans EXPLAIN la mention "Using filesort", qui indique qu\'aucun index ne permet de satisfaire l\'ORDER BY de la fenêtre.',
        descriptionEn: 'MySQL 8 natively supports analytic functions. Look out for "Using filesort" in EXPLAIN, indicating missing indexes for the window ORDER BY.',
        recommendationFr: 'Vérifiez la variable sort_buffer_size et ajoutez un index composite pour éliminer le filesort.',
        recommendationEn: 'Tune sort_buffer_size and add a composite index to eliminate filesort.'
      });
    } else if (selectedDialect === 'azure') {
      tips.push({
        id: 'dialect-azure',
        keyword: 'Azure SQL Engine',
        severity: 'good',
        category: 'dialect',
        titleFr: 'Moteur Azure SQL : Batch Mode on Rowstore',
        titleEn: 'Azure SQL Engine: Batch Mode on Rowstore',
        triggerFr: 'Dialecte actif : Azure SQL',
        triggerEn: 'Active dialect: Azure SQL',
        descriptionFr: 'Azure SQL intègre l\'Intelligent Query Processing (IQP) qui permet l\'exécution en mode batch sur les structures rowstore pour accélérer les fonctions analytiques et agrégats.',
        descriptionEn: 'Azure SQL includes Intelligent Query Processing (IQP) allowing Batch Mode on Rowstore to accelerate window and aggregate workloads.',
        recommendationFr: 'Assurez-vous que le niveau de compatibilité est ≥ 150 pour tirer parti du Batch Mode.',
        recommendationEn: 'Ensure database compatibility level is ≥ 150 to leverage Batch Mode processing.'
      });
    }

    return tips;
  }, [sqlCode, selectedDialect]);

  // Filtered tips
  const filteredTips = useMemo(() => {
    if (activeFilter === 'all') return detectedTips;
    return detectedTips.filter(t => t.severity === activeFilter);
  }, [detectedTips, activeFilter]);

  const criticalCount = detectedTips.filter(t => t.severity === 'critical').length;
  const warningCount = detectedTips.filter(t => t.severity === 'warning').length;
  const infoCount = detectedTips.filter(t => t.severity === 'info' || t.severity === 'good').length;

  const getSeverityBadge = (severity: PerformanceTip['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isLight
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
          }`}>
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            {isFr ? 'Critique' : 'Critical'}
          </span>
        );
      case 'warning':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isLight
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
          }`}>
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            {isFr ? 'Optimisation' : 'Warning'}
          </span>
        );
      case 'good':
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isLight
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-[#003824] text-[#4edea3] border border-[#4edea3]/40'
          }`}>
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {isFr ? 'Moteur SQL' : 'Engine Pro-Tip'}
          </span>
        );
      case 'info':
      default:
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isLight
              ? 'bg-sky-100 text-sky-900 border border-sky-300'
              : 'bg-[#002c47] text-[#89ceff] border border-[#3198dc]/30'
          }`}>
            <Info className="w-3 h-3 text-sky-500" />
            {isFr ? 'Indexation' : 'Indexing'}
          </span>
        );
    }
  };

  return (
    <div 
      id="sql-performance-tips-panel"
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isLight
          ? 'bg-white border-slate-200 shadow-sm'
          : 'bg-[#102034] border-[#1b2b3f] shadow-md'
      }`}
    >
      {/* Header bar */}
      <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2.5 ${
        isLight
          ? 'bg-slate-50 border-slate-200'
          : 'bg-[#0b1c30] border-[#1b2b3f]'
      }`}>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className={`p-1.5 rounded-lg border ${
            isLight 
              ? 'bg-sky-50 text-sky-700 border-sky-200' 
              : 'bg-[#3198dc]/15 text-[#89ceff] border-[#3198dc]/30'
          }`}>
            <Sparkles className={`w-4 h-4 ${isLight ? 'text-sky-600' : 'text-[#4edea3]'}`} />
          </div>
          <div className="flex items-center gap-2">
            <h3 className={`text-xs font-bold flex items-center gap-1.5 font-sans ${
              isLight ? 'text-slate-900' : 'text-[#d3e4fe]'
            }`}>
              <span>Performance Tips</span>
              <span className={isLight ? 'text-slate-400' : 'text-[#89929b]'}>•</span>
              <span className={`font-mono text-[11px] ${
                isLight ? 'text-sky-700 font-semibold' : 'text-[#89ceff]'
              }`}>
                {isFr ? 'Analyseur en Temps Réel' : 'Real-time Query Analyzer'}
              </span>
            </h3>

            {/* Counters Badge */}
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 font-semibold'
                : 'bg-[#000f21] border-[#1b2b3f] text-[#d3e4fe]'
            }`}>
              {detectedTips.length} {isFr ? (detectedTips.length > 1 ? 'conseils' : 'conseil') : (detectedTips.length > 1 ? 'tips' : 'tip')}
            </span>
          </div>

          {/* Quick status summary chips */}
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px]">
            {criticalCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded font-semibold border ${
                isLight
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}>
                {criticalCount} {isFr ? 'critique' : 'critical'}
              </span>
            )}
            {warningCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded font-semibold border ${
                isLight
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                {warningCount} {isFr ? 'optimisation' : 'optimization'}
              </span>
            )}
            {criticalCount === 0 && warningCount === 0 && (
              <span className={`px-1.5 py-0.5 rounded font-semibold border ${
                isLight
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-[#003824] text-[#4edea3] border border-[#4edea3]/30'
              }`}>
                ✓ {isFr ? 'Code optimisé' : 'Clean query'}
              </span>
            )}
          </div>
        </div>

        {/* Action controls & collapse toggle */}
        <div className="flex items-center gap-2">
          {/* Quick Filter tabs */}
          {detectedTips.length > 1 && isExpanded && (
            <div className={`flex items-center p-0.5 rounded-lg border text-[10px] font-mono ${
              isLight ? 'bg-slate-200/70 border-slate-300' : 'bg-[#000f21] border-[#1b2b3f]'
            }`}>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeFilter === 'all' 
                    ? (isLight ? 'bg-white text-slate-900 font-bold shadow-xs' : 'bg-[#1b2b3f] text-[#d3e4fe] font-bold') 
                    : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-[#89929b] hover:text-[#d3e4fe]')
                }`}
              >
                {isFr ? 'Tous' : 'All'} ({detectedTips.length})
              </button>
              {criticalCount > 0 && (
                <button
                  onClick={() => setActiveFilter('critical')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    activeFilter === 'critical' 
                      ? (isLight ? 'bg-rose-600 text-white font-bold' : 'bg-rose-500/30 text-rose-300 font-bold') 
                      : (isLight ? 'text-rose-700 hover:text-rose-900 font-medium' : 'text-rose-400/80 hover:text-rose-300')
                  }`}
                >
                  {isFr ? 'Critiques' : 'Critical'} ({criticalCount})
                </button>
              )}
              {warningCount > 0 && (
                <button
                  onClick={() => setActiveFilter('warning')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    activeFilter === 'warning' 
                      ? (isLight ? 'bg-amber-600 text-white font-bold' : 'bg-amber-500/30 text-amber-300 font-bold') 
                      : (isLight ? 'text-amber-700 hover:text-amber-900 font-medium' : 'text-amber-400/80 hover:text-amber-300')
                  }`}
                >
                  {isFr ? 'Alertes' : 'Warnings'} ({warningCount})
                </button>
              )}
            </div>
          )}

          <button
            id="toggle-performance-tips-btn"
            onClick={() => setIsExpanded(prev => !prev)}
            className={`p-1 rounded-md transition-colors flex items-center gap-1 text-xs font-mono ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-[#89929b] hover:text-[#d3e4fe] hover:bg-[#1b2b3f]'
            }`}
            title={isExpanded ? (isFr ? 'Réduire le volet' : 'Collapse panel') : (isFr ? 'Déployer le volet' : 'Expand panel')}
          >
            <span className="text-[11px] hidden md:inline">
              {isExpanded ? (isFr ? 'Masquer' : 'Hide') : (isFr ? 'Afficher' : 'Show')}
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Panel Content (Expandable) */}
      {isExpanded && (
        <div className={`p-3.5 flex flex-col gap-2.5 ${
          isLight ? 'bg-slate-50/60' : 'bg-[#000f21]'
        }`}>
          {filteredTips.length === 0 ? (
            <div className={`p-4 rounded-lg border text-center text-xs flex items-center justify-center gap-2 ${
              isLight
                ? 'bg-white border-slate-200 text-slate-600'
                : 'bg-[#0b1c30] border-[#1b2b3f] text-[#89929b]'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{isFr ? 'Aucun avertissement dans ce filtre.' : 'No tips found for this filter.'}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredTips.map((tip) => {
                const isDetailOpen = expandedTipId === tip.id;
                return (
                  <div
                    key={tip.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      isLight
                        ? tip.severity === 'critical'
                          ? 'bg-rose-50 border-rose-200 hover:border-rose-300 shadow-xs'
                          : tip.severity === 'warning'
                          ? 'bg-amber-50 border-amber-200 hover:border-amber-300 shadow-xs'
                          : tip.severity === 'good'
                          ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        : tip.severity === 'critical'
                        ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-500/60 text-rose-100'
                        : tip.severity === 'warning'
                        ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-500/60 text-amber-100'
                        : tip.severity === 'good'
                        ? 'bg-[#003824]/40 border-[#4edea3]/40 hover:border-[#4edea3]/60 text-emerald-100'
                        : 'bg-[#0b1c30] border-[#1b2b3f] hover:border-[#26364a] text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      {/* Top Row: Severity + Keyword trigger pill */}
                      <div className="flex items-center justify-between gap-2">
                        {getSeverityBadge(tip.severity)}
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold truncate max-w-[180px] border ${
                          isLight
                            ? 'text-sky-900 bg-sky-100/70 border-sky-200'
                            : 'text-[#93ccff] bg-[#000f21] border-[#1b2b3f]'
                        }`}>
                          {tip.keyword}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className={`text-xs font-bold leading-snug ${
                        isLight
                          ? tip.severity === 'critical'
                            ? 'text-rose-950 font-bold'
                            : tip.severity === 'warning'
                            ? 'text-amber-950 font-bold'
                            : tip.severity === 'good'
                            ? 'text-emerald-950 font-bold'
                            : 'text-slate-900 font-bold'
                          : 'text-white font-bold'
                      }`}>
                        {isFr ? tip.titleFr : tip.titleEn}
                      </h4>

                      {/* Explanation */}
                      <p className={`text-[11px] leading-relaxed ${
                        isLight
                          ? tip.severity === 'critical'
                            ? 'text-rose-900'
                            : tip.severity === 'warning'
                            ? 'text-amber-900'
                            : tip.severity === 'good'
                            ? 'text-emerald-900'
                            : 'text-slate-700'
                          : 'text-slate-200'
                      }`}>
                        {isFr ? tip.descriptionFr : tip.descriptionEn}
                      </p>

                      {/* Recommendation Callout */}
                      <div className={`p-2.5 rounded-lg border flex items-start gap-2 text-[11px] ${
                        isLight
                          ? tip.severity === 'critical'
                            ? 'bg-rose-100/80 border-rose-300 text-rose-950 font-medium'
                            : tip.severity === 'warning'
                            ? 'bg-amber-100/80 border-amber-300 text-amber-950 font-medium'
                            : tip.severity === 'good'
                            ? 'bg-emerald-100/80 border-emerald-300 text-emerald-950 font-medium'
                            : 'bg-sky-50 border-sky-200 text-sky-950 font-medium'
                          : 'bg-[#000f21] border-[#1b2b3f] text-[#4edea3]'
                      }`}>
                        <Zap className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isLight
                            ? tip.severity === 'critical'
                              ? 'text-rose-700'
                              : tip.severity === 'warning'
                              ? 'text-amber-700'
                              : tip.severity === 'good'
                              ? 'text-emerald-700'
                              : 'text-sky-700'
                            : 'text-[#4edea3]'
                        }`} />
                        <span className="font-sans leading-tight">
                          {isFr ? tip.recommendationFr : tip.recommendationEn}
                        </span>
                      </div>

                      {/* Optional Code Example Drawer */}
                      {tip.exampleBefore && (
                        <div className="pt-1">
                          <button
                            onClick={() => setExpandedTipId(isDetailOpen ? null : tip.id)}
                            className={`text-[10px] font-mono flex items-center gap-1 transition-colors font-medium ${
                              isLight
                                ? 'text-sky-700 hover:text-sky-900'
                                : 'text-[#89ceff] hover:text-white'
                            }`}
                          >
                            <span>{isDetailOpen ? (isFr ? 'Masquer exemple de code' : 'Hide code example') : (isFr ? 'Voir exemple optimisé' : 'View optimized example')}</span>
                            {isDetailOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {isDetailOpen && (
                            <div className={`mt-2 p-2.5 rounded-lg border font-mono text-[10px] space-y-2.5 ${
                              isLight
                                ? 'bg-white border-slate-200'
                                : 'bg-[#000f21] border-[#1b2b3f]'
                            }`}>
                              <div>
                                <span className={`font-bold block mb-1 ${
                                  isLight ? 'text-rose-700' : 'text-rose-400'
                                }`}>
                                  {isFr ? '❌ Motif non-optimal :' : '❌ Suboptimal pattern:'}
                                </span>
                                <pre className={`whitespace-pre-wrap p-2 rounded-lg border text-[11px] leading-relaxed font-mono ${
                                  isLight
                                    ? 'bg-rose-50 text-rose-950 border-rose-200'
                                    : 'bg-black/60 text-rose-200 border-rose-500/30'
                                }`}>
                                  {tip.exampleBefore}
                                </pre>
                              </div>
                              {tip.exampleAfter && (
                                <div>
                                  <span className={`font-bold block mb-1 ${
                                    isLight ? 'text-emerald-700' : 'text-[#4edea3]'
                                  }`}>
                                    {isFr ? '✓ Recommandation DBA :' : '✓ Recommended DBA pattern:'}
                                  </span>
                                  <pre className={`whitespace-pre-wrap p-2 rounded-lg border text-[11px] leading-relaxed font-mono ${
                                    isLight
                                      ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                                      : 'bg-[#002c47]/50 text-emerald-200 border-emerald-500/40'
                                  }`}>
                                    {tip.exampleAfter}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer link to Plan tab if relevant */}
                    {onSwitchToPlanTab && (tip.category === 'index' || tip.category === 'memory') && (
                      <div className={`pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                        isLight ? 'border-slate-200 text-slate-600' : 'border-[#1b2b3f] text-[#89929b]'
                      }`}>
                        <span className="flex items-center gap-1">
                          <Cpu className={`w-3 h-3 ${isLight ? 'text-sky-600' : 'text-[#3198dc]'}`} />
                          <span>{isFr ? 'Vérifier dans le plan d\'exécution' : 'Inspect execution plan'}</span>
                        </span>
                        <button
                          onClick={onSwitchToPlanTab}
                          className={`flex items-center gap-1 font-semibold transition-colors ${
                            isLight
                              ? 'text-sky-700 hover:text-sky-900'
                              : 'text-[#89ceff] hover:text-white'
                          }`}
                        >
                          <span>{isFr ? 'Ouvrir Plan' : 'Open Plan'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
