export type NavigationTab = 
  | 'dashboard'
  | 'activity'
  | 'cert_exam'
  | 'skills'
  | 'exams'
  | 'sandbox'
  | 'syllabus'
  | 'flashcards'
  | 'analytics'
  | 'glossary';

export type ExamPillar = 'sql' | 'modelisation' | 'transactions' | 'administration';

export interface CognitiveConcept {
  id: string;
  nameFr: string;
  nameEn: string;
  pillar: ExamPillar;
  diagnosticFr: string;
  diagnosticEn: string;
  ruleRefFr: string;
  ruleRefEn: string;
  recommendedActionFr: string;
  recommendedActionEn: string;
}

export interface CertExamQuestionItem {
  id: string;
  number: number;
  pillar: ExamPillar;
  domainNameFr: string;
  domainNameEn: string;
  promptFr: string;
  promptEn: string;
  codeSnippet?: string;
  schemaContext?: string;
  options: {
    id: string;
    letter: 'A' | 'B' | 'C' | 'D';
    textFr: string;
    textEn: string;
  }[];
  correctOptionId: string;
  conceptId: string;
  explanationFr: string;
  explanationEn: string;
  trapMetadata?: QuestionTrapMetadata;
}

export interface PillarScoreBreakdown {
  pillar: ExamPillar;
  labelFr: string;
  labelEn: string;
  correctCount: number;
  totalCount: number;
  percentage: number;
}

export interface CertExamResultReport {
  scorePercent: number;
  passed: boolean;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  reviewCount: number;
  elapsedSeconds: number;
  pillarBreakdown: Record<ExamPillar, PillarScoreBreakdown>;
  cognitiveErrors: {
    concept: CognitiveConcept;
    errorCount: number;
    questionNumbers: number[];
  }[];
}

export type FlashcardMasteryStatus = 'unseen' | 'review' | 'learning' | 'mastered';

export interface SkillMetricDimensions {
  knowledge: number;        // 0-100% (Couverture théorique du syllabus / concepts)
  accuracy: number;         // 0-100% (Taux de justesse technique sans pièges)
  speed: number;            // 0-100% (Indice de vélocité cognitive vs seuil cible)
  consistency: number;      // 0-100% (Régularité temporelle / rétention espacée)
  averageTimeSeconds: number; // Temps moyen réel mesuré (ex: 22s vs 240s)
  targetTimeSeconds: number;  // Temps de référence attendu pour un profil certifié
  totalAttempts: number;      // Volume de questions / requêtes résolues
  streak: number;             // Série de réussites consécutives
}

export interface SkillNode {
  id: string;
  name: string;
  category: 'core_dql' | 'advanced_query' | 'aggregation' | 'ddl_schema' | 'performance_tuning';
  descriptionFr: string;
  descriptionEn: string;
  level: 'fundamental' | 'intermediate' | 'advanced' | 'expert';
  dimensions: SkillMetricDimensions;
  compositeScore: number;     // Score global pondéré
  children?: SkillNode[];
  commonTrapsFr?: string[];
  commonTrapsEn?: string[];
  benchmarkLabelFr?: string;
  benchmarkLabelEn?: string;
}

export interface SkillProfileComparison {
  titleFr: string;
  titleEn: string;
  scoreRatio: string;
  avgTime: string;
  dimensions: SkillMetricDimensions;
  compositeScore: number;
  profileType: 'hesitant' | 'reflex_pro' | 'unsteady' | 'novice';
  verdictFr: string;
  verdictEn: string;
}

export interface FlashcardItem {
  id: string;
  cardNumber: number;
  domainId: string;
  domainCode: string;
  domainTitle: string;
  subtopic: string;
  front: {
    question: string;
    codeSnippet?: string;
    hint?: string;
  };
  back: {
    answer: string;
    explanation: string;
    codeSnippet?: string;
    examTrap?: string;
    ruleRef?: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export type CertificationTrackId = 
  | 'oracle-1z0-071'
  | 'azure-dp-900'
  | 'azure-dp-800'
  | 'postgres-edb'
  | 'mysql-80-dba';

export interface CertificationTrack {
  id: CertificationTrackId;
  code: string;
  name: string;
  category: string;
  progress: number;
  totalQuestions: number;
  chaptersCount: number;
  status: 'high_priority' | 'in_progress' | 'not_started' | 'scheduled';
  recommendation: string;
  accentColor: string;
  iconName: string;
  targetExamDate?: string;
  syllabusUrl: string;
  provider: string;
  examCodeLabel?: string;
  officialTopicsCount?: number;
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ExamQuestion {
  id: string;
  qid: string;
  domain: string;
  subdomain: string;
  averageTime: string;
  prompt: string;
  tableContext: string;
  sqlCode: string;
  sqlDialect: string;
  questionText: string;
  options: QuestionOption[];
  correctCount: number; // 1 or 2
  explanation: {
    title: string;
    flowSteps: { step: string; label: string; desc: string; isFinal?: boolean }[];
    correctReasons: string[];
    incorrectReasons: { option: string; error: string; explanation: string }[];
    docRef: string;
    docUrl?: string;
  };
}

export interface ExamSessionState {
  examId: string;
  examTitle: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  secondsRemaining: number;
  isTimerRunning: boolean;
  instantExplanations: boolean;
  answers: Record<number, string[]>; // question index -> option ids
  flaggedQuestions: Record<number, boolean>;
  isFinished: boolean;
}

export interface SqlExercise {
  id: string;
  number: number;
  title: string;
  level: string;
  objectiveText: string;
  checklist: string[];
  initialSql: string;
  solutionSql: string;
  defaultOutput: {
    columns: string[];
    rows: (string | number)[][];
    executionTimeMs: number;
  };
}

export interface DomainDetailSheet {
  objectives: string[];
  keyConcepts: {
    title: string;
    description: string;
  }[];
  codeExamples: {
    title: string;
    language: string;
    code: string;
    explanation: string;
  }[];
  examTraps: {
    trapTitle: string;
    description: string;
    wrongSyntax?: string;
    correctSyntax?: string;
  }[];
  checklist: string[];
  mnemonic?: string;
  officialRef?: string;
}

export interface DomainMasteryItem {
  id: string;
  code: string;
  title: string;
  desc: string;
  sheetsRead: string;
  percent: number;
  weight: string;
  status: 'mastered' | 'consolidating' | 'review_needed' | 'high_priority' | 'behind';
  statusLabel: string;
  badgeClass: string;
  accentColor: string;
  footnote: string;
  sheetDetail?: DomainDetailSheet;
}

export interface CheatSheet {
  id: string;
  number: number;
  tag: string;
  badgeType: 'trap' | 'matrix' | 'ddl';
  title: string;
  summary: string;
  codeSnippet?: string;
  mnemonicTip?: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  rules?: {
    allowed: { title: string; subtitle: string; desc: string };
    prohibited: { title: string; subtitle: string; desc: string };
    keyClause: string;
  };
}

export interface UpdateHistoryItem {
  id: string;
  timestamp: string;
  version: string;
  type: 'auto' | 'manual' | 'forced';
  notes: string;
}

export interface SystemVersionInfo {
  currentVersion: string;
  releaseDate: string;
  buildNumber: string;
  channel: 'stable' | 'beta';
  lastCheckedDate: string;
  autoUpdateEnabled: boolean;
  autoUpdateIntervalMinutes: number;
  isChecking: boolean;
  isUpdating: boolean;
  updateProgress: number;
  statusMessage: string;
  availableUpdate?: {
    version: string;
    releaseDate: string;
    changelog: string[];
    size: string;
  } | null;
  updateHistory: UpdateHistoryItem[];
}

// ==========================================
// SQL GLOSSARY DATA INTERFACES
// ==========================================

export interface GlossaryCrossReference {
  id: string;
  labelFr: string;
  labelEn: string;
}

export interface DialectNotes {
  universal?: boolean;
  ansiStandard?: string;
  postgres?: string;
  mysql?: string;
  sqlServer?: string;
  oracle?: string;
  specialNoteFr?: string;
  specialNoteEn?: string;
}

export type GlossaryAudience = 'beginner' | 'developer' | 'data_analyst';
export type GlossaryDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface GlossaryCategoryMeta {
  id: number;
  code: string;
  titleFr: string;
  titleEn: string;
  shortDescFr: string;
  shortDescEn: string;
  accentColor: string;
  color?: string;
  iconName: string;
}

export interface GlossaryTerm {
  id: string;
  termFr: string;
  termEn: string;
  category: number; // 1 to 8
  categoryNameFr: string;
  categoryNameEn: string;
  shortDefFr: string;
  shortDefEn: string;
  fullExplanationFr: string;
  fullExplanationEn: string;
  codeSnippet?: string;
  codeSnippetCommentFr?: string;
  codeSnippetCommentEn?: string;
  dialects?: DialectNotes;
  crossReferences: GlossaryCrossReference[];
  tags: string[];
  difficulty: GlossaryDifficulty;
  audience: GlossaryAudience[];
  proTipFr?: string;
  proTipEn?: string;
}

// ==========================================
// ADAPTIVE LEARNING SYSTEM TYPES
// Cycle : Apprendre -> S'entraîner -> Se tromper -> Comprendre -> Rejouer -> Valider
// ==========================================

export type LearningCycleStep = 
  | 'overview'     // Choix du module / Objectifs
  | 'learn'        // 1. Apprendre : Fiche de cadrage & concepts initiaux
  | 'train'        // 2. S'entraîner : Série de questions adaptatives avec chronomètre
  | 'diagnose'     // 3. Se tromper / Diagnostic : Détection fine des lacunes (notion, temps, difficulté)
  | 'understand'   // 4. Comprendre : Mini-cours ciblé, schéma visuel & pièges d'examen
  | 'remedy'       // 5. Rejouer : 5 questions ciblées de remédiation
  | 'validate';    // 6. Valider : Matrice de compétences & badge de maîtrise

export interface LearningSubconcept {
  id: string;
  name: string;
  shortDescFr: string;
  shortDescEn: string;
  iconName?: string;
}

export interface AdaptiveQuestion {
  id: string;
  number: number;
  subconceptId: string;
  subconceptLabel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string;
  promptFr: string;
  promptEn: string;
  sqlCode?: string;
  options: {
    id: string;
    label: string;
    textFr: string;
    textEn: string;
    isCorrect: boolean;
    explanationFr: string;
    explanationEn: string;
  }[];
  correctCount: number;
  targetTimeSeconds: number; // expected duration in seconds
  docRef?: string;
}

export interface MiniCourseModule {
  subconceptId: string;
  subconceptLabel: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  diagnosisSummaryFr: string;
  diagnosisSummaryEn: string;
  keyRuleFr: string;
  keyRuleEn: string;
  visualDiagram?: {
    titleFr: string;
    titleEn: string;
    asciiIllustration: string;
    legendFr: string;
    legendEn: string;
  };
  trapSnippet: {
    titleFr: string;
    titleEn: string;
    wrongCode: string;
    wrongWhyFr: string;
    wrongWhyEn: string;
    correctCode: string;
    correctWhyFr: string;
    correctWhyEn: string;
  };
  goldenRules: {
    ruleFr: string;
    ruleEn: string;
  }[];
}

export interface AdaptiveLearningModule {
  id: string;
  titleFr: string;
  titleEn: string;
  category: string;
  shortDescriptionFr: string;
  shortDescriptionEn: string;
  badgeName: string;
  accentColor: string;
  subconcepts: LearningSubconcept[];
  prerequisitesFr: string[];
  prerequisitesEn: string[];
  initialQuestions: AdaptiveQuestion[]; // 10 training questions
  miniCourses: Record<string, MiniCourseModule>; // key = subconceptId
  remediationQuestions: Record<string, AdaptiveQuestion[]>; // key = subconceptId -> 5 remediation questions
}

export interface QuestionAttemptLog {
  questionId: string;
  subconceptId: string;
  selectedOptionIds: string[];
  isCorrect: boolean;
  timeSpentSeconds: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TargetedSessionQuestion {
  id: string;
  index: number;
  topicId: 'join' | 'subqueries' | 'indexes' | string;
  topicName: string;
  difficulty: 'easy' | 'intermediate' | 'hard';
  difficultyLabel: string;
  prompt: string;
  codeSnippet?: string;
  options: {
    id: string;
    letter: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
  keyTakeaway: string;
  trapMetadata?: QuestionTrapMetadata;
}

/**
 * Métadonnées de question pour le système de « pièges » de certification
 * Structure demandée :
 * {
 *   topic: "SQL",
 *   subtopic: "JOIN",
 *   difficulty: 3,
 *   trap: "LEFT vs INNER JOIN",
 *   concepts: ["NULL", "JOIN"],
 *   estimatedTime: 45
 * }
 */
export interface QuestionTrapMetadata {
  topic: string;
  subtopic: string;
  difficulty: number;
  trap: string;
  concepts: string[];
  estimatedTime: number; // en secondes (ex: 45)
  warningMsgFr?: string; // ex: "Tu fais régulièrement l'erreur INNER JOIN vs LEFT JOIN."
  warningMsgEn?: string;
  antidoteRuleFr?: string;
  antidoteRuleEn?: string;
}

export interface TrapDiagnosticRecord {
  trapId: string;
  trap: string;
  topic: string;
  subtopic: string;
  difficulty: number;
  concepts: string[];
  estimatedTime: number;
  totalAttempts: number;
  errorCount: number;
  successCount: number;
  lastEncountered: string;
  warningFr: string;
  warningEn: string;
  antidoteRuleFr: string;
  antidoteRuleEn: string;
  masteryStatus: 'critical_alert' | 'learning' | 'mastered';
}

export interface TargetedSessionPayload {
  sessionId: string;
  source: 'gemini' | 'curated_engine';
  title: string;
  estimatedDurationMinutes: number;
  totalQuestions: number;
  breakdown: {
    topicId: string;
    topicName: string;
    count: number;
  }[];
  questions: TargetedSessionQuestion[];
}

/**
 * Télémétrie brute d'une tentative de question (Temps de réponse & Exactitude)
 * Champs stockés au minimum :
 * - questionId
 * - attemptId
 * - answer
 * - isCorrect
 * - timeSpent
 * - difficulty
 * - topic
 * - timestamp
 */
export interface QuestionAttemptTelemetry {
  questionId: string;
  attemptId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number; // en secondes (ex: 12, 31, 24, 47)
  difficulty: number; // 1 à 5
  topic: string; // ex: "SELECT", "JOIN", "GROUP BY", "CTE"
  timestamp: string; // ISO 8601
  hintRequested?: boolean; // Indique si l'apprenant a demandé de l'aide / tuteur IA
}

export type PedagogicalSpeedProfile =
  | 'reflex_mastery'     // Haute exactitude + Temps court (ex: SELECT 94% / 12s)
  | 'operational_steady' // Bonne exactitude + Temps modéré (ex: GROUP BY 81% / 24s)
  | 'hesitant_analytic'  // Exactitude moyenne + Temps élevé (ex: JOIN 72% / 31s)
  | 'cognitive_overload' // Basse exactitude + Temps long (ex: CTE 58% / 47s)
  | 'impulsive_trap';    // Basse exactitude + Temps très court

export interface TopicResponseTimeStat {
  topic: string;
  accuracy: number;          // Exactitude en % (ex: 94, 72, 81, 58)
  avgTimeSeconds: number;    // Temps moyen en secondes (ex: 12, 31, 24, 47)
  targetTimeSeconds: number; // Temps cible de référence pour la certification
  totalAttempts: number;
  correctAttempts: number;
  helpRequestsRate: number;  // % de questions avec demande d'aide
  profile: PedagogicalSpeedProfile;
  diagnosticFr: string;
  diagnosticEn: string;
  adaptiveActionFr: string;
  adaptiveActionEn: string;
}



