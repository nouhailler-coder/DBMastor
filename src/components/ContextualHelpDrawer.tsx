import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  Sparkles,
  Zap,
  Target,
  Lightbulb,
  BookOpen,
  Compass,
  CheckCircle2,
  Terminal,
  Activity,
  ShieldCheck,
  Keyboard,
  Eye,
  EyeOff,
  Play,
  ArrowRight,
} from 'lucide-react';
import { NavigationTab } from '../types';
import { ShortSessionMode } from '../data/shortSessionsData';
import { getTooltipsEnabled, setTooltipsEnabled } from './SmartTooltip';
import { AppLogo } from './AppLogo';

interface ContextualHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  currentTab: NavigationTab;
  lang: 'fr' | 'en';
  onOpenOnboarding: () => void;
  onStartShortSession: (mode: ShortSessionMode) => void;
  onNavigateToTab: (tab: NavigationTab) => void;
}

interface TabContextualGuide {
  titleFr: string;
  titleEn: string;
  summaryFr: string;
  summaryEn: string;
  stepsFr: { title: string; detail: string }[];
  stepsEn: { title: string; detail: string }[];
  sqlTipsFr: { code: string; rule: string }[];
  sqlTipsEn: { code: string; rule: string }[];
}

const CONTEXTUAL_GUIDES: Record<NavigationTab, TabContextualGuide> = {
  dashboard: {
    titleFr: 'Tableau de bord & Pilotage SQL',
    titleEn: 'Dashboard & SQL Command Center',
    summaryFr:
      'Votre centre de contrôle quotidien : lancez une session courte (5 ou 30 min), suivez votre préparation à la certification et identifiez immédiatement vos 3 notions SQL les plus fragiles.',
    summaryEn:
      'Your daily command center: launch a 5 or 30-min short session, track your exam readiness, and spot your top 3 weakest SQL concepts.',
    stepsFr: [
      {
        title: '⚡ Session 5 min ou 🎯 Session 30 min',
        detail:
          'Choisissez « J\'ai 5 minutes » (5 questions sur vos notions faibles) ou « J\'ai 30 minutes » (20 questions à difficulté progressive).',
      },
      {
        title: '📊 Encart « Mon activité — Cette semaine »',
        detail:
          'Consultez votre volume hebdomadaire (127 questions, 81 % de réussite, 32 s/question, série de 6 jours) et cliquez pour ouvrir l\'historique complet.',
      },
      {
        title: '🧠 Diagnostic & Pièges SQL récurrents',
        detail:
          'Survolez les cartes de compétences pour afficher les infobulles détaillées et lancer un entraînement ciblé.',
      },
    ],
    stepsEn: [
      {
        title: '⚡ 5-min Quick or 🎯 30-min Training Session',
        detail:
          'Pick "I have 5 minutes" (5 questions on weak concepts) or "I have 30 minutes" (20 progressive questions).',
      },
      {
        title: '📊 "My Activity — This Week" Card',
        detail:
          'Review your weekly volume (127 questions, 81% accuracy, 32s avg time, 6-day streak) and click to inspect full logs.',
      },
      {
        title: '🧠 SQL Trap Diagnostics',
        detail:
          'Hover over skill indicators to reveal smart tooltips and launch targeted remediation drills.',
      },
    ],
    sqlTipsFr: [
      {
        code: 'LEFT JOIN t2 ON t1.id = t2.id AND t2.sal > 5000',
        rule: 'Filtrez la table externe dans ON (et non dans WHERE) pour ne pas transformer un LEFT JOIN en INNER JOIN.',
      },
      {
        code: 'WHERE id NOT EXISTS (SELECT 1 FROM ...)',
        rule: 'Préférez toujours NOT EXISTS à NOT IN dès qu\'une colonne de sous-requête est susceptible de contenir NULL.',
      },
    ],
    sqlTipsEn: [
      {
        code: 'LEFT JOIN t2 ON t1.id = t2.id AND t2.sal > 5000',
        rule: 'Filter the outer table in ON (not WHERE) to avoid turning a LEFT JOIN into an INNER JOIN.',
      },
      {
        code: 'WHERE id NOT EXISTS (SELECT 1 FROM ...)',
        rule: 'Prefer NOT EXISTS over NOT IN whenever the subquery column might contain NULL values.',
      },
    ],
  },
  activity: {
    titleFr: 'Mon activité — Historique Personnel',
    titleEn: 'My Activity — Personal History',
    summaryFr:
      'Visualisez votre régularité quotidienne du Lundi au Vendredi, votre progression hebdomadaire (+12 % sur SQL) et inspectez chaque question répondue.',
    summaryEn:
      'Visualize your Monday-to-Friday consistency, weekly SQL delta (+12% on SQL), and inspect every answered question.',
    stepsFr: [
      {
        title: '📅 Filtrage par jour (Lun → Ven)',
        detail:
          'Cliquez sur n\'importe quelle barre de progression (Lun, Mar, Mer, Jeu, Ven) pour isoler les métriques et tentatives de cette journée.',
      },
      {
        title: '📈 Delta hebdomadaire (+12 % sur SQL)',
        detail:
          'Comparez vos progrès par sous-domaine SQL (SELECT, JOIN, GROUP BY, Subqueries, CTE) par rapport à la semaine précédente.',
      },
      {
        title: '☁️ Synchronisation Cloud Firestore',
        detail:
          'Connectez votre compte Google pour sauvegarder automatiquement votre série de 6 jours et vos statistiques sur le Cloud.',
      },
    ],
    stepsEn: [
      {
        title: '📅 Day-by-Day Filter (Mon → Fri)',
        detail:
          'Click any progress bar (Mon to Fri) to isolate that day\'s accuracy, speed, and question log.',
      },
      {
        title: '📈 Weekly Delta (+12% on SQL)',
        detail:
          'Compare your week-over-week gains across SELECT, JOIN, GROUP BY, Subqueries, and CTEs.',
      },
      {
        title: '☁️ Cloud Firestore Sync',
        detail:
          'Sign in with Google to persist your 6-day streak and telemetry across all your devices.',
      },
    ],
    sqlTipsFr: [
      {
        code: 'COUNT(*) vs COUNT(commission_pct)',
        rule: 'COUNT(*) compte toutes les lignes (NULL inclus), tandis que COUNT(colonne) ignore les valeurs NULL.',
      },
    ],
    sqlTipsEn: [
      {
        code: 'COUNT(*) vs COUNT(commission_pct)',
        rule: 'COUNT(*) counts all rows including NULLs, whereas COUNT(column) ignores NULL values.',
      },
    ],
  },
  cert_exam: {
    titleFr: 'Simulateur d\'Examen Blanc (60Q • 90 min)',
    titleEn: 'Full Certification Exam Simulator (60Q • 90m)',
    summaryFr:
      'Entraînez-vous dans les conditions officielles d\'examen (Oracle 1Z0-071, PostgreSQL, Azure DP-300) avec chronomètre strict et seuil de réussite.',
    summaryEn:
      'Practice under official exam conditions (Oracle 1Z0-071, PostgreSQL, Azure DP-300) with strict timer and passing score threshold.',
    stepsFr: [
      {
        title: '🚩 Marquage des questions (Flag)',
        detail:
          'Marquez les questions complexes pour y revenir avant la soumission finale de la copie.',
      },
      {
        title: '💡 Aide « Explique-moi » en mode révision',
        detail:
          'Utilisez les 3 niveaux (Indice → Explication → Cours) lors de la correction détaillée.',
      },
    ],
    stepsEn: [
      {
        title: '🚩 Question Flagging',
        detail: 'Flag tricky questions to review them before submitting your final exam.',
      },
      {
        title: '💡 3-Level "Explain to Me" Review',
        detail: 'Use Hint → Explanation → Course during post-exam debriefing.',
      },
    ],
    sqlTipsFr: [
      {
        code: 'CREATE INDEX ... -> COMMIT implicite',
        rule: 'En Oracle Database, toute instruction DDL (CREATE, ALTER, DROP, TRUNCATE) valide définitivement la transaction en cours.',
      },
    ],
    sqlTipsEn: [
      {
        code: 'CREATE INDEX ... -> Implicit COMMIT',
        rule: 'In Oracle Database, any DDL statement automatically commits the active transaction.',
      },
    ],
  },
  skills: {
    titleFr: 'Skill Map Quadridimensionnelle',
    titleEn: '4D SQL Skill Map',
    summaryFr:
      'Cartographie complète de votre maîtrise sur les 4 piliers : Syntaxe SQL, Modélisation Relationnelle, Architecture SGBD et Optimisation.',
    summaryEn:
      'Complete mastery map across 4 pillars: SQL Syntax, Relational Modeling, RDBMS Architecture, and Tuning.',
    stepsFr: [
      {
        title: '🎯 Ciblage des nœuds fragiles',
        detail:
          'Cliquez sur une compétence en orange ou rouge pour lancer immédiatement une session de remédiation.',
      },
    ],
    stepsEn: [
      {
        title: '🎯 Weak Node Remediation',
        detail: 'Click any amber or red skill node to launch a targeted drill immediately.',
      },
    ],
    sqlTipsFr: [
      {
        code: '1NF → 2NF (Toute la clé) → 3NF (Rien que la clé)',
        rule: 'Une dépendance fonctionnelle entre deux attributs non-clés viole la 3ème Forme Normale (3NF).',
      },
    ],
    sqlTipsEn: [
      {
        code: '1NF → 2NF (Whole key) → 3NF (Nothing but the key)',
        rule: 'A transitive dependency between two non-key attributes violates 3NF.',
      },
    ],
  },
  exams: {
    titleFr: 'Apprentissage Adaptatif & Quiz (« Explique-moi »)',
    titleEn: 'Adaptive Learning & Quiz ("Explain to Me")',
    summaryFr:
      'Entraînement intelligent avec le module pédagogique « Explique-moi » à 3 niveaux gradués pour comprendre chaque piège sans dévoiler directement la réponse.',
    summaryEn:
      'Smart training featuring the 3-tier "Explain to Me" system so you master SQL traps without spoiling the answer immediately.',
    stepsFr: [
      {
        title: '💡 Niveau 1 : Indice',
        detail:
          'Cliquez sur [Indice] pour orienter votre regard sur la clause SQL critique (ex: condition du JOIN ou présence de NULL).',
      },
      {
        title: '🧠 Niveau 2 : Explication',
        detail:
          'Cliquez sur [Expliquer] pour comprendre le mécanisme d\'évaluation du moteur SGBD.',
      },
      {
        title: '📖 Niveau 3 : Cours & Voir la solution',
        detail:
          'Accédez à la fiche de cours complète avec exemples SQL et cas particuliers d\'examen.',
      },
    ],
    stepsEn: [
      {
        title: '💡 Level 1: Hint',
        detail: 'Click [Hint] to focus on the critical SQL clause without spoiling the answer.',
      },
      {
        title: '🧠 Level 2: Explanation',
        detail: 'Click [Explain] to understand how the RDBMS engine evaluates the query.',
      },
      {
        title: '📖 Level 3: Full Lesson & Solution',
        detail: 'Read the complete reference card with SQL examples and edge cases.',
      },
    ],
    sqlTipsFr: [
      {
        code: 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY',
        rule: 'Un alias défini dans SELECT n\'est visible que dans ORDER BY (jamais dans WHERE ni GROUP BY).',
      },
    ],
    sqlTipsEn: [
      {
        code: 'FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY',
        rule: 'A column alias defined in SELECT can only be referenced in ORDER BY.',
      },
    ],
  },
  flashcards: {
    titleFr: 'Flashcards Mémoire Active (2400+)',
    titleEn: 'Active Recall Flashcards (2400+)',
    summaryFr:
      'Mémorisation espacée (Spaced Repetition) sur la syntaxe SQL, les codes d\'erreur ORA-* et l\'architecture interne.',
    summaryEn:
      'Spaced repetition flashcards covering SQL syntax, ORA-* error codes, and database internals.',
    stepsFr: [
      {
        title: '🔄 Retourner la carte & Auto-évaluation',
        detail:
          'Cliquez sur la carte pour révéler la réponse, puis indiquez votre niveau de maîtrise (À revoir / Maîtrisé).',
      },
    ],
    stepsEn: [
      {
        title: '🔄 Flip & Self-Grade',
        detail: 'Click the card to reveal the answer and rate your confidence level.',
      },
    ],
    sqlTipsFr: [
      {
        code: 'RANK() vs DENSE_RANK()',
        rule: 'Après deux 2e ex-aequo, RANK() passe au rang 4 tandis que DENSE_RANK() attribue le rang 3.',
      },
    ],
    sqlTipsEn: [
      {
        code: 'RANK() vs DENSE_RANK()',
        rule: 'After two tied 2nd places, RANK() jumps to 4 whereas DENSE_RANK() assigns 3.',
      },
    ],
  },
  glossary: {
    titleFr: 'Glossaire Technique SQL & SGBD',
    titleEn: 'Technical SQL & RDBMS Glossary',
    summaryFr:
      'Référentiel bilingue des concepts clés : ACID, MVCC, SGA/PGA, B-Tree, Bitmap Index, CTE, Window Functions.',
    summaryEn:
      'Bilingual reference of core concepts: ACID, MVCC, SGA/PGA, B-Tree, Bitmap Index, CTE, Window Functions.',
    stepsFr: [
      {
        title: '🔍 Recherche instantanée par mot-clé',
        detail: 'Filtrez par catégorie ou tapez une clause SQL pour obtenir sa définition et un exemple.',
      },
    ],
    stepsEn: [
      {
        title: '🔍 Instant Keyword Search',
        detail: 'Filter by category or type a SQL clause to view its definition and syntax.',
      },
    ],
    sqlTipsFr: [
      {
        code: 'SARGable Predicate',
        rule: 'Évitez d\'appliquer une fonction (UPPER, TO_CHAR, NVL) sur une colonne indexée dans WHERE.',
      },
    ],
    sqlTipsEn: [
      {
        code: 'SARGable Predicate',
        rule: 'Avoid wrapping indexed columns inside functions in WHERE clauses.',
      },
    ],
  },
  sandbox: {
    titleFr: 'Lab SQL Live & Pratique (Moteur AlaSQL)',
    titleEn: 'Live SQL Lab & Sandbox (AlaSQL Engine)',
    summaryFr:
      'Écrivez et exécutez de vraies requêtes SQL directement dans votre navigateur sur les tables EMPLOYEES, DEPARTMENTS, JOBS et LOCATIONS.',
    summaryEn:
      'Write and execute real SQL queries directly in your browser against EMPLOYEES, DEPARTMENTS, JOBS, and LOCATIONS.',
    stepsFr: [
      {
        title: '▶️ Exécution SQL Temps Réel',
        detail:
          'Modifiez la requête dans l\'éditeur et cliquez sur Exécuter pour inspecter le jeu de résultats.',
      },
      {
        title: '💡 Défis SQL guidés avec « Explique-moi »',
        detail:
          'Utilisez les indices gradués si votre requête ne retourne pas le résultat attendu.',
      },
    ],
    stepsEn: [
      {
        title: '▶️ Real-Time SQL Execution',
        detail: 'Edit the query in the code editor and click Run to inspect the result set.',
      },
      {
        title: '💡 Guided SQL Challenges',
        detail: 'Use progressive hints if your query output differs from the expected result.',
      },
    ],
    sqlTipsFr: [
      {
        code: 'GROUP BY department_id HAVING AVG(salary) > 6000',
        rule: 'Toute colonne présente dans SELECT hors fonction d\'agrégation doit obligatoirement figurer dans GROUP BY.',
      },
    ],
    sqlTipsEn: [
      {
        code: 'GROUP BY department_id HAVING AVG(salary) > 6000',
        rule: 'Every non-aggregated column in SELECT must appear in the GROUP BY clause.',
      },
    ],
  },
  syllabus: {
    titleFr: 'Fiches de Révision & Programme Officiel',
    titleEn: 'Study Sheets & Official Syllabus',
    summaryFr:
      'Synthèses de cours structurées par objectif d\'examen avec exemples SQL prêts à copier.',
    summaryEn:
      'Structured study sheets organized by exam objective with copy-ready SQL examples.',
    stepsFr: [
      {
        title: '📖 Lecture active par module',
        detail: 'Sélectionnez un chapitre pour afficher les règles syntaxiques et les cas limites.',
      },
    ],
    stepsEn: [
      {
        title: '📖 Active Module Study',
        detail: 'Select a chapter to display syntax rules and exam edge cases.',
      },
    ],
    sqlTipsFr: [
      {
        code: 'UNION vs UNION ALL',
        rule: 'UNION élimine les doublons via un tri coûteux ; UNION ALL concatène tout instantanément.',
      },
    ],
    sqlTipsEn: [
      {
        code: 'UNION vs UNION ALL',
        rule: 'UNION deduplicates rows; UNION ALL concatenates all rows without sorting overhead.',
      },
    ],
  },
  analytics: {
    titleFr: 'Statistiques Avancées & Badges',
    titleEn: 'Advanced Analytics & Badges',
    summaryFr:
      'Analyse granulaire de votre temps de réponse, courbe de rétention et badges de maîtrise débloqués.',
    summaryEn:
      'Granular analysis of your response speed, retention curve, and unlocked mastery badges.',
    stepsFr: [
      {
        title: '⏱️ Analyse Vitesse vs Précision',
        detail: 'Identifiez les sujets où vous répondez trop vite (erreurs d\'inattention) ou trop lentement.',
      },
    ],
    stepsEn: [
      {
        title: '⏱️ Speed vs Accuracy Breakdown',
        detail: 'Spot topics where you rush into traps or spend excessive time.',
      },
    ],
    sqlTipsFr: [
      {
        code: 'Objectif Examen : < 45 s / question',
        rule: 'En certification officielle (60 questions en 90 min), visez 35 à 45 secondes par question QCM.',
      },
    ],
    sqlTipsEn: [
      {
        code: 'Exam Target: < 45s / question',
        rule: 'In official certifications (60 questions in 90m), aim for 35-45 seconds per question.',
      },
    ],
  },
  access_control: {
    titleFr: 'Contrôle d\'Accès & Sécurité Firestore (RBAC Gatekeeper)',
    titleEn: 'Firestore Access Control & Security (RBAC Gatekeeper)',
    summaryFr:
      'Gérez la liste des utilisateurs autorisés dans Firestore (/user_access) et testez le blocage serveur en temps réel.',
    summaryEn:
      'Manage authorized users in Firestore (/user_access) and test server-side blocking in real time.',
    stepsFr: [
      {
        title: '🔐 Simulateur en 1 clic (Approved / Pending / Revoked)',
        detail:
          'Basculez votre propre statut dans Firestore et cliquez sur « Tester une écriture Firestore » pour observer le verdict 200 ALLOWED ou 403 PERMISSION_DENIED.',
      },
      {
        title: '🛡️ Gatekeeper Plein Écran',
        detail:
          'Activez le mode Gatekeeper Strict ou cliquez sur « Prévisualiser l\'écran de blocage » pour voir l\'interface présentée aux utilisateurs non autorisés.',
      },
    ],
    stepsEn: [
      {
        title: '🔐 1-Click Live Simulator (Approved / Pending / Revoked)',
        detail:
          'Switch your own status in Firestore and click "Test Firestore Write" to observe the 200 ALLOWED or 403 PERMISSION_DENIED verdict.',
      },
      {
        title: '🛡️ Full-Screen Gatekeeper',
        detail:
          'Enable Strict Gatekeeper mode or click "Preview Lock Screen" to see the interface shown to unauthorized users.',
      },
    ],
    sqlTipsFr: [
      {
        code: 'isApprovedUser(userId) → status == "approved"',
        rule: 'Même si un utilisateur modifie le code client, Firestore vérifie directement sur le serveur que son document /user_access/{uid} possède status == "approved".',
      },
    ],
    sqlTipsEn: [
      {
        code: 'isApprovedUser(userId) → status == "approved"',
        rule: 'Even if a user tampers with client code, Firestore verifies server-side that /user_access/{uid} has status == "approved".',
      },
    ],
  },
};

export const ContextualHelpDrawer: React.FC<ContextualHelpDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
  currentTab,
  lang,
  onOpenOnboarding,
  onStartShortSession,
  onNavigateToTab,
}) => {
  const isFr = lang === 'fr';
  const [tooltipsActive, setTooltipsActive] = useState<boolean>(() => getTooltipsEnabled());

  useEffect(() => {
    const syncHandler = (e: Event) => {
      const ce = e as CustomEvent<boolean>;
      setTooltipsActive(Boolean(ce.detail));
    };
    window.addEventListener('dbmastery:tooltips_toggled', syncHandler);
    return () => window.removeEventListener('dbmastery:tooltips_toggled', syncHandler);
  }, []);

  const handleToggleTooltips = () => {
    const next = !tooltipsActive;
    setTooltipsActive(next);
    setTooltipsEnabled(next);
  };

  const guide = CONTEXTUAL_GUIDES[currentTab] || CONTEXTUAL_GUIDES.dashboard;
  const steps = isFr ? guide.stepsFr : guide.stepsEn;
  const sqlTips = isFr ? guide.sqlTipsFr : guide.sqlTipsEn;

  return (
    <>
      {/* BOUTON FLOTTANT D'AIDE CONTEXTUELLE (Toujours accessible en bas à droite) */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          id="floating-contextual-help-btn"
          type="button"
          onClick={onOpen}
          title={isFr ? 'Ouvrir l\'aide contextuelle de cette page' : 'Open contextual help for this page'}
          className="px-4 py-2.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-[0_8px_25px_rgba(2,132,199,0.45)] border border-[#38bdf8]/60 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-[#93ccff]" />
          <span>{isFr ? 'Aide contextuelle' : 'Contextual Help'}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#061322]/70 text-[#4edea3] font-mono text-[10px]">
            ?
          </span>
        </button>
      </div>

      {/* DRAWER LATÉRAL D'AIDE CONTEXTUELLE */}
      {isOpen && (
        <div
          id="contextual-help-drawer-backdrop"
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        >
          <aside
            id="contextual-help-drawer"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md h-full bg-[#0b1c30] border-l border-[#1b2b3f] text-[#d3e4fe] shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            {/* Header du Drawer */}
            <div className="p-5 bg-[#000f21] border-b border-[#1b2b3f] flex items-center justify-between gap-3 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <AppLogo size="sm" showText={false} />
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#4edea3] font-bold">
                    {isFr ? 'Aide Contextuelle Interactive' : 'Interactive Contextual Help'}
                  </span>
                  <h2 className="text-base font-extrabold text-[#d3e4fe] leading-snug">
                    {isFr ? guide.titleFr : guide.titleEn}
                  </h2>
                </div>
              </div>
              <button
                id="close-contextual-help-btn"
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-[#102034] hover:bg-[#ef4444] text-[#89929b] hover:text-white flex items-center justify-center transition-colors font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Corps du Drawer */}
            <div className="p-5 flex-1 flex flex-col gap-5">
              {/* 1. Résumé de l'écran actif */}
              <div className="p-4 rounded-xl bg-[#061322] border border-[#38bdf8]/30 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#38bdf8]">
                  <Compass className="w-4 h-4" />
                  <span>{isFr ? 'À quoi sert cet écran ?' : 'What is this screen for?'}</span>
                </div>
                <p className="text-xs text-[#d3e4fe] leading-relaxed">
                  {isFr ? guide.summaryFr : guide.summaryEn}
                </p>
              </div>

              {/* 2. Contrôle des Infobulles (Tooltips) + Relancer l'Onboarding */}
              <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#d3e4fe] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#4edea3]" />
                      <span>{isFr ? 'Infobulles pédagogiques' : 'Smart Pedagogical Tooltips'}</span>
                    </span>
                    <span className="text-[11px] text-[#89929b]">
                      {isFr
                        ? 'Afficher des explications au survol des indicateurs'
                        : 'Show explanations when hovering metrics & buttons'}
                    </span>
                  </div>
                  <button
                    id="toggle-smart-tooltips-btn"
                    type="button"
                    onClick={handleToggleTooltips}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      tooltipsActive
                        ? 'bg-[#10b981]/20 text-[#4edea3] border border-[#10b981]/50'
                        : 'bg-[#102034] text-[#89929b] border border-[#1b2b3f]'
                    }`}
                  >
                    {tooltipsActive ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isFr ? 'Actives' : 'ON'}</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>{isFr ? 'Désactivées' : 'OFF'}</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  id="relaunch-onboarding-from-help-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOnboarding();
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] border border-[#38bdf8]/40 text-xs font-bold text-[#93ccff] hover:text-white flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#38bdf8]" />
                    <span>
                      {isFr
                        ? 'Relancer le Guide d\'Onboarding (6 étapes)'
                        : 'Relaunch Interactive Onboarding Tour (6 steps)'}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* 3. Actions clés sur cette vue */}
              <div className="flex flex-col gap-2.5">
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#89ceff]">
                  {isFr ? 'Comment utiliser cette vue' : 'How to use this view'}
                </span>
                {steps.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-1"
                  >
                    <span className="text-xs font-extrabold text-[#d3e4fe]">{st.title}</span>
                    <p className="text-xs text-[#bfc7d2] leading-relaxed">{st.detail}</p>
                  </div>
                ))}
              </div>

              {/* 4. Astuces SQL contextuelles liées à cet écran */}
              <div className="flex flex-col gap-2.5">
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#fbbf24] flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Mémo SQL & Pièges d\'examen' : 'SQL Memo & Exam Traps'}</span>
                </span>
                {sqlTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#000f21] border border-[#f59e0b]/30 flex flex-col gap-1.5"
                  >
                    <code className="font-mono text-[11px] text-[#fbbf24] bg-[#0b1c30] px-2 py-1 rounded border border-[#1b2b3f] block overflow-x-auto">
                      {tip.code}
                    </code>
                    <p className="text-xs text-[#d3e4fe] leading-relaxed">{tip.rule}</p>
                  </div>
                ))}
              </div>

              {/* 5. Accès rapide aux Sessions Courtes */}
              <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-2.5">
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#4edea3]">
                  {isFr ? 'Lancer une session immédiate' : 'Launch an immediate session'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartShortSession('quick_5min');
                    }}
                    className="p-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#0b1c30] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>⚡ 5 min (5Q)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartShortSession('training_30min');
                    }}
                    className="p-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>🎯 30 min (20Q)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer du Drawer */}
            <div className="p-4 bg-[#000f21] border-t border-[#1b2b3f] flex items-center justify-between text-[11px] font-mono text-[#89929b]">
              <span>DBMastery Studio • Aide Contextuelle</span>
              <button
                type="button"
                onClick={onClose}
                className="text-[#38bdf8] hover:underline font-bold cursor-pointer"
              >
                {isFr ? 'Fermer [Échap]' : 'Close [Esc]'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
