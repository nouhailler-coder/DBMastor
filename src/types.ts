export type NavigationTab = 
  | 'dashboard'
  | 'exams'
  | 'sandbox'
  | 'syllabus'
  | 'flashcards'
  | 'analytics';

export type FlashcardMasteryStatus = 'unseen' | 'review' | 'learning' | 'mastered';

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
