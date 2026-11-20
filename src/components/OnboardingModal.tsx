import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Compass,
  Database,
  Play,
  Scale,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  X,
} from 'lucide-react';
import logoImg from '../assets/images/dbmastery_logo_1790662821248.jpg';
import { ShortSessionMode } from '../data/shortSessionsData';
import {
  LearningObjective,
  loadUserPreferences,
  saveUserPreferences,
  SkillLevel,
} from '../services/userPreferencesService';
import { CertificationTrackId, NavigationTab } from '../types';
import { AppLogo } from './AppLogo';

export function hasCompletedOnboarding(): boolean {
  return loadUserPreferences().onboardingCompleted;
}

export function markOnboardingCompleted(): void {
  saveUserPreferences({ onboardingCompleted: true });
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'en';
  selectedCert: CertificationTrackId;
  onSelectCert: (cert: CertificationTrackId) => void;
  onStartShortSession: (mode: ShortSessionMode) => void;
  onNavigateToTab: (tab: NavigationTab) => void;
  onOpenContextualHelp?: () => void;
  onOpenLegalMentions?: () => void;
}

interface MiniDiagQuestion {
  id: string;
  topic: string;
  promptFr: string;
  promptEn: string;
  code: string;
  options: { id: string; labelFr: string; labelEn: string }[];
  correctId: string;
}

const MINI_DIAGNOSTIC_QUESTIONS: MiniDiagQuestion[] = [
  {
    id: 'mini-1',
    topic: 'SELECT & NULL',
    promptFr: 'Quel opérateur vérifie correctement une valeur NULL en SQL ?',
    promptEn: 'Which operator correctly checks for a NULL value in SQL?',
    code: 'SELECT name FROM employees WHERE commission_pct ____ ;',
    options: [
      { id: 'a', labelFr: '= NULL', labelEn: '= NULL' },
      { id: 'b', labelFr: 'IS NULL', labelEn: 'IS NULL' },
      { id: 'c', labelFr: '== NULL', labelEn: '== NULL' },
    ],
    correctId: 'b',
  },
  {
    id: 'mini-2',
    topic: 'LEFT JOIN vs WHERE',
    promptFr: 'Où placer un filtre sur la table de droite pour préserver les lignes sans correspondance d’un LEFT JOIN ?',
    promptEn: 'Where should a right-table filter be placed to preserve unmatched rows in a LEFT JOIN?',
    code: 'FROM dept d LEFT JOIN emp e ____',
    options: [
      { id: 'a', labelFr: 'Dans la clause ON', labelEn: 'Inside the ON clause' },
      { id: 'b', labelFr: 'Dans la clause WHERE', labelEn: 'Inside the WHERE clause' },
      { id: 'c', labelFr: 'Dans la clause GROUP BY', labelEn: 'Inside the GROUP BY clause' },
    ],
    correctId: 'a',
  },
  {
    id: 'mini-3',
    topic: 'GROUP BY & HAVING',
    promptFr: 'Quelle clause filtre les groupes après le calcul d’agrégats (AVG, COUNT) ?',
    promptEn: 'Which clause filters groups after aggregate functions (AVG, COUNT) are evaluated?',
    code: 'SELECT dept_id, COUNT(*) FROM emp GROUP BY dept_id ____ COUNT(*) > 5;',
    options: [
      { id: 'a', labelFr: 'WHERE', labelEn: 'WHERE' },
      { id: 'b', labelFr: 'FILTER', labelEn: 'FILTER' },
      { id: 'c', labelFr: 'HAVING', labelEn: 'HAVING' },
    ],
    correctId: 'c',
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectCert,
  onStartShortSession,
  onNavigateToTab,
  onOpenLegalMentions,
}) => {
  const isFr = lang === 'fr';
  const totalSteps = 7;

  const [step, setStep] = useState(0);
  const [objective, setObjective] = useState<LearningObjective>('learn_sql');
  const [targetCert, setTargetCert] = useState<CertificationTrackId | null>(null);
  const [targetExamDate, setTargetExamDate] = useState<string>('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [miniAnswers, setMiniAnswers] = useState<Record<string, string>>({});
  const [miniDeferred, setMiniDeferred] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const existing = loadUserPreferences();
      setStep(0);
      setObjective(existing.objective || 'learn_sql');
      setTargetCert(existing.targetCert ?? null);
      setTargetExamDate(existing.targetExamDate || '');
      setSkillLevel(existing.level || 'beginner');
      setMiniAnswers({});
      setMiniDeferred(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const persistCurrentChoices = () => {
    saveUserPreferences({
      onboardingCompleted: true,
      objective,
      targetCert,
      level: skillLevel,
      targetExamDate: targetCert && targetExamDate ? targetExamDate : null,
    });
    if (targetCert) {
      onSelectCert(targetCert);
    }
  };

  const handleFinish = (actionTab?: NavigationTab, shortMode?: ShortSessionMode) => {
    persistCurrentChoices();
    onClose();
    if (shortMode) {
      onStartShortSession(shortMode);
      return;
    }
    if (actionTab) {
      onNavigateToTab(actionTab);
    }
  };

  const handleSkip = () => {
    saveUserPreferences({
      onboardingCompleted: true,
      objective,
      targetCert,
      level: skillLevel,
      targetExamDate: targetCert && targetExamDate ? targetExamDate : null,
    });
    onClose();
  };

  const handleOpenLegal = () => {
    if (onOpenLegalMentions) {
      onOpenLegalMentions();
    } else {
      window.dispatchEvent(new CustomEvent('dbmastery:open_legal_mentions'));
    }
  };

  const objectiveOptions: {
    id: LearningObjective;
    titleFr: string;
    titleEn: string;
    descFr: string;
    descEn: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'learn_sql',
      titleFr: 'Apprendre SQL',
      titleEn: 'Learn SQL',
      descFr: 'Maîtriser SELECT, JOIN, GROUP BY, sous-requêtes et CTE par la pratique.',
      descEn: 'Master SELECT, JOIN, GROUP BY, subqueries, and CTEs with hands-on SQL.',
      icon: Terminal,
    },
    {
      id: 'prepare_certification',
      titleFr: 'Préparer une certification',
      titleEn: 'Prepare a certification',
      descFr: 'Viser un examen officiel (Oracle, PostgreSQL, Azure ou MySQL) avec examens blancs.',
      descEn: 'Prepare for an official certification exam with realistic mock simulations.',
      icon: ShieldCheck,
    },
    {
      id: 'improve_dba',
      titleFr: 'Perfectionnement DBA',
      titleEn: 'DBA Engineering',
      descFr: 'Approfondir l’indexation, les plans d’exécution, les verrous et l’isolation ACID.',
      descEn: 'Deepen indexing, execution plans, locking, and ACID isolation mastery.',
      icon: Server,
    },
    {
      id: 'interview_prep',
      titleFr: 'Réussir mes entretiens techniques',
      titleEn: 'SQL Technical Interviews',
      descFr: 'Déjouer les pièges classiques (NULL, NOT IN, agrégats) rapidement.',
      descEn: 'Tackle classic SQL interview traps (NULL, NOT IN, aggregations) with speed.',
      icon: Briefcase,
    },
  ];

  const certChoices: { id: CertificationTrackId; name: string; tag: string }[] = [
    { id: 'oracle-1z0-071', name: 'Oracle Database SQL (1Z0-071)', tag: 'Oracle SQL' },
    { id: 'postgres-edb', name: 'PostgreSQL EDB Associate', tag: 'PostgreSQL' },
    { id: 'mysql-80-dba', name: 'MySQL 8.0 Administrator', tag: 'MySQL 8.0' },
    { id: 'azure-dp-900', name: 'Azure Data Fundamentals (DP-900)', tag: 'Azure SQL' },
  ];

  const levelChoices: {
    id: SkillLevel;
    labelFr: string;
    labelEn: string;
    descFr: string;
    descEn: string;
  }[] = [
    {
      id: 'beginner',
      labelFr: 'Débutant',
      labelEn: 'Beginner',
      descFr: 'Je découvre SQL ou souhaite revoir les bases (SELECT, WHERE, JOIN simples).',
      descEn: 'New to SQL or refreshing fundamentals (SELECT, WHERE, basic JOINs).',
    },
    {
      id: 'intermediate',
      labelFr: 'Intermédiaire',
      labelEn: 'Intermediate',
      descFr: 'Je connais les requêtes courantes mais veux maîtriser sous-requêtes, GROUP BY et pièges.',
      descEn: 'Comfortable with everyday SQL, ready for subqueries, GROUP BY, and traps.',
    },
    {
      id: 'advanced',
      labelFr: 'Avancé / DBA',
      labelEn: 'Advanced / DBA',
      descFr: 'Je vise la performance, les fonctions analytiques, les transactions et la certification.',
      descEn: 'Focused on query tuning, window functions, transactions, and certification prep.',
    },
    {
      id: 'unsure',
      labelFr: 'Je ne sais pas encore',
      labelEn: 'I am not sure yet',
      descFr: 'Démarrer avec une mini-évaluation rapide ou des exercices progressifs pour situer votre niveau.',
      descEn: 'Start with a quick calibration check or progressive drills to gauge your level.',
    },
  ];

  const miniAnsweredCount = Object.keys(miniAnswers).length;
  const miniCorrectCount = MINI_DIAGNOSTIC_QUESTIONS.filter(
    (q) => miniAnswers[q.id] === q.correctId
  ).length;
  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div
      id="onboarding-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="onboarding-modal"
        className="relative w-full max-w-3xl my-auto rounded-2xl bg-[#0b1c30] border border-[#38bdf8]/40 text-[#d3e4fe] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#000f21] border-b border-[#1b2b3f] flex items-center justify-between gap-4">
          <AppLogo size="sm" subtitle={isFr ? 'Configuration du parcours' : 'Path Setup'} />

          {/* Step Dots */}
          <div className="hidden sm:flex items-center gap-1.5" aria-label={isFr ? 'Progression de configuration' : 'Setup progress'}>
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setStep(idx)}
                aria-label={isFr ? `Étape ${idx + 1} sur ${totalSteps}` : `Step ${idx + 1} of ${totalSteps}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === step
                    ? 'w-8 bg-[#4edea3]'
                    : idx < step
                    ? 'w-3 bg-[#38bdf8]/70'
                    : 'w-2.5 bg-[#1b2b3f]'
                }`}
              />
            ))}
          </div>

          <button
            id="onboarding-skip-btn"
            type="button"
            onClick={handleSkip}
            className="px-3 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-xs font-mono text-[#bfc7d2] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isFr ? 'Passer' : 'Skip'}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-8 flex flex-col gap-6 min-h-[380px] justify-between">
          {/* STEP 1 : ACCUEIL */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-2xl bg-[#061322] border border-[#1b2b3f]">
                <img
                  src={logoImg}
                  alt="Logo officiel DBMastery Studio"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#38bdf8]/50 shadow-lg shrink-0"
                />
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4edea3]">
                    {isFr ? 'Étape 1 / 7 • Accueil' : 'Step 1 / 7 • Welcome'}
                  </span>
                  <h2 id="onboarding-modal-title" className="text-2xl font-extrabold text-[#d3e4fe] tracking-tight">
                    {isFr ? 'Bienvenue sur DBMastery Studio' : 'Welcome to DBMastery Studio'}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#bfc7d2] leading-relaxed">
                    {isFr
                      ? 'Configurez votre espace en moins d’une minute : vous pouvez passer cette configuration ou la modifier à tout moment.'
                      : 'Configure your studio in under a minute — optional at every step and editable anytime.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#061322] border border-[#f59e0b]/40 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/20 border border-[#f59e0b]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4 text-[#fbbf24]" />
                </div>
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-mono text-[10px] font-bold text-[#fbbf24] uppercase tracking-wider">
                    {isFr ? 'Plateforme pédagogique indépendante' : 'Independent Educational Platform'}
                  </span>
                  <p className="text-[#d3e4fe] text-[11px] leading-relaxed">
                    {isFr
                      ? 'DBMastery Studio est un outil d’entraînement indépendant sans affiliation avec Oracle Corporation, Microsoft Azure, PostgreSQL Global Development Group ou MySQL.'
                      : 'DBMastery Studio is an independent training platform with no affiliation to Oracle Corporation, Microsoft Azure, PostgreSQL Global Development Group, or MySQL.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenLegal}
                    className="self-start text-[11px] font-mono text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer font-semibold mt-0.5"
                  >
                    <Scale className="w-3 h-3" />
                    <span>{isFr ? 'Consulter les mentions légales' : 'View legal notice'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 : OBJECTIF D'APPRENTISSAGE */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                  {isFr ? 'Étape 2 / 7 • Objectif' : 'Step 2 / 7 • Objective'}
                </span>
                <h2 id="onboarding-modal-title" className="text-2xl font-extrabold text-[#d3e4fe] mt-1">
                  {isFr ? 'Quel est votre objectif principal ?' : 'What is your primary goal?'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {objectiveOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = objective === opt.id;
                  return (
                    <button
                      key={opt.id}
                      id={`onboarding-objective-${opt.id}`}
                      type="button"
                      onClick={() => {
                        setObjective(opt.id);
                        if (opt.id === 'learn_sql' && targetCert === null) {
                          setTargetCert(null);
                        }
                      }}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                        active
                          ? 'bg-[#0284c7] border-[#38bdf8] text-white shadow-md ring-2 ring-[#38bdf8]/40'
                          : 'bg-[#102034] border-[#26364a] text-[#d3e4fe] hover:border-[#38bdf8]'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#38bdf8]'}`} />
                        <span>{isFr ? opt.titleFr : opt.titleEn}</span>
                      </div>
                      <p className={`text-xs leading-relaxed ${active ? 'text-white/90' : 'text-[#bfc7d2]'}`}>
                        {isFr ? opt.descFr : opt.descEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 : CERTIFICATION CIBLE OPTIONNELLE */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4edea3]">
                  {isFr ? 'Étape 3 / 7 • Certification (optionnelle)' : 'Step 3 / 7 • Certification (Optional)'}
                </span>
                <h2 id="onboarding-modal-title" className="text-2xl font-extrabold text-[#d3e4fe] mt-1">
                  {isFr ? 'Préparez-vous une certification ?' : 'Are you preparing for a certification?'}
                </h2>
              </div>

              {/* Option explicite sans certification */}
              <button
                id="onboarding-cert-none-btn"
                type="button"
                onClick={() => {
                  setTargetCert(null);
                  setTargetExamDate('');
                }}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  targetCert === null
                    ? 'bg-[#003824] border-[#4edea3] text-white ring-2 ring-[#4edea3]/40'
                    : 'bg-[#102034] border-[#26364a] text-[#d3e4fe] hover:border-[#4edea3]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#4edea3] shrink-0" />
                  <div>
                    <div className="text-sm font-bold">
                      {isFr ? 'Apprendre SQL sans certification' : 'Learn SQL without certification'}
                    </div>
                    <div className="text-xs text-[#bfc7d2]">
                      {isFr
                        ? 'Parcours libre axé sur les requêtes SQL, la modélisation et le Lab SQL.'
                        : 'Certification-free track focused on SQL queries, modeling, and SQL Lab.'}
                    </div>
                  </div>
                </div>
                {targetCert === null && <CheckCircle2 className="w-5 h-5 text-[#4edea3] shrink-0" />}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {certChoices.map((c) => {
                  const active = targetCert === c.id;
                  return (
                    <button
                      key={c.id}
                      id={`onboarding-cert-${c.id}`}
                      type="button"
                      onClick={() => setTargetCert(c.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        active
                          ? 'bg-[#0284c7] border-[#38bdf8] text-white ring-2 ring-[#38bdf8]/40'
                          : 'bg-[#102034] border-[#26364a] text-[#d3e4fe] hover:border-[#38bdf8]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Database className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-[#89ceff]'}`} />
                        <span className="text-xs font-bold">{c.name}</span>
                      </div>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#0b1c30] text-[#93ccff] border border-[#1b2b3f]">
                        {c.tag}
                      </span>
                    </button>
                  );
                })}
              </div>

              {targetCert !== null && (
                <div className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label htmlFor="onboarding-exam-date" className="text-xs font-semibold text-[#bfc7d2]">
                    {isFr
                      ? 'Date d’examen envisagée (optionnel) :'
                      : 'Target exam date (optional):'}
                  </label>
                  <input
                    id="onboarding-exam-date"
                    type="date"
                    min={todayIso}
                    value={targetExamDate}
                    onChange={(e) => setTargetExamDate(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#102034] border border-[#26364a] text-xs font-mono text-[#d3e4fe]"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 4 : NIVEAU ACTUEL */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                  {isFr ? 'Étape 4 / 7 • Niveau actuel' : 'Step 4 / 7 • Current Level'}
                </span>
                <h2 id="onboarding-modal-title" className="text-2xl font-extrabold text-[#d3e4fe] mt-1">
                  {isFr ? 'Comment estimez-vous votre niveau actuel ?' : 'How would you describe your current level?'}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {levelChoices.map((lvl) => {
                  const active = skillLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      id={`onboarding-level-${lvl.id}`}
                      type="button"
                      onClick={() => setSkillLevel(lvl.id)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        active
                          ? 'bg-[#0284c7] border-[#38bdf8] text-white ring-2 ring-[#38bdf8]/40'
                          : 'bg-[#102034] border-[#26364a] text-[#d3e4fe] hover:border-[#38bdf8]'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold">{isFr ? lvl.labelFr : lvl.labelEn}</div>
                        <p className={`text-xs mt-0.5 ${active ? 'text-white/90' : 'text-[#bfc7d2]'}`}>
                          {isFr ? lvl.descFr : lvl.descEn}
                        </p>
                      </div>
                      {active && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5 : MINI-ÉVALUATION OPTIONNELLE */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#fbbf24]">
                    {isFr ? 'Étape 5 / 7 • Mini-évaluation (optionnelle)' : 'Step 5 / 7 • Quick Check (Optional)'}
                  </span>
                  <h2 id="onboarding-modal-title" className="text-2xl font-extrabold text-[#d3e4fe] mt-1">
                    {isFr ? '3 questions rapides de calibration' : '3 quick calibration questions'}
                  </h2>
                </div>
                <button
                  id="onboarding-defer-diagnostic-btn"
                  type="button"
                  onClick={() => {
                    setMiniDeferred(true);
                    setStep(5);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] border border-[#26364a] text-xs font-mono text-[#89ceff] cursor-pointer self-start sm:self-auto"
                >
                  {isFr ? 'Passer / Faire plus tard →' : 'Skip / Do later →'}
                </button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {MINI_DIAGNOSTIC_QUESTIONS.map((q, qIdx) => {
                  const chosen = miniAnswers[q.id];
                  return (
                    <div key={q.id} className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#38bdf8] uppercase">
                          Q{qIdx + 1} • {q.topic}
                        </span>
                        {chosen && (
                          <span
                            className={`font-mono text-[10px] font-bold ${
                              chosen === q.correctId ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                            }`}
                          >
                            {chosen === q.correctId
                              ? isFr ? '✓ Exact' : '✓ Correct'
                              : isFr ? 'À consolider' : 'To review'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-[#d3e4fe]">
                        {isFr ? q.promptFr : q.promptEn}
                      </p>
                      <code className="block text-[11px] font-mono text-[#93ccff] bg-[#000f21] px-2.5 py-1.5 rounded border border-[#1b2b3f]">
                        {q.code}
                      </code>
                      <div className="flex flex-wrap gap-2">
                        {q.options.map((opt) => {
                          const isSelected = chosen === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() =>
                                setMiniAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                                isSelected
                                  ? opt.id === q.correctId
                                    ? 'bg-[#003824] border-[#4edea3] text-[#4edea3] font-bold'
                                    : 'bg-[#93000a]/40 border-[#ffb4ab] text-[#ffb4ab] font-bold'
                                  : 'bg-[#102034] border-[#26364a] text-[#d3e4fe] hover:border-[#38bdf8]'
                              }`}
                            >
                              {isFr ? opt.labelFr : opt.labelEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {miniAnsweredCount > 0 && (
                <div className="text-xs font-mono text-[#4edea3]">
                  {isFr
                    ? `Résultat provisoire : ${miniCorrectCount} / ${miniAnsweredCount} réponse(s) juste(s).`
                    : `Quick result: ${miniCorrectCount} / ${miniAnsweredCount} correct.`}
                </div>
              )}
            </div>
          )}

          {/* STEP 6 : PROPOSITION DE PARCOURS PERSONNALISÉ */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4edea3]">
                  {isFr ? 'Étape 6 / 7 • Parcours proposé' : 'Step 6 / 7 • Proposed Path'}
                </span>
                <h2 id="onboarding-modal-title" className="text-2xl font-extrabold text-[#d3e4fe] mt-1">
                  {isFr ? 'Votre parcours personnalisé est prêt' : 'Your personalized path is ready'}
                </h2>
              </div>

              <div className="p-5 rounded-2xl bg-[#061322] border border-[#1b2b3f] space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between py-1.5 border-b border-[#1b2b3f]">
                  <span className="text-[#89929b]">{isFr ? 'Objectif' : 'Objective'}</span>
                  <span className="text-[#d3e4fe] font-bold">
                    {isFr
                      ? objectiveOptions.find((o) => o.id === objective)?.titleFr
                      : objectiveOptions.find((o) => o.id === objective)?.titleEn}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#1b2b3f]">
                  <span className="text-[#89929b]">{isFr ? 'Cible' : 'Track'}</span>
                  <span className="text-[#4edea3] font-bold">
                    {targetCert
                      ? certChoices.find((c) => c.id === targetCert)?.name
                      : isFr
                      ? 'Apprendre SQL sans certification'
                      : 'Learn SQL without certification'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#1b2b3f]">
                  <span className="text-[#89929b]">{isFr ? 'Niveau' : 'Level'}</span>
                  <span className="text-[#38bdf8] font-bold">
                    {isFr
                      ? levelChoices.find((l) => l.id === skillLevel)?.labelFr
                      : levelChoices.find((l) => l.id === skillLevel)?.labelEn}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[#89929b]">{isFr ? 'Mini-évaluation' : 'Quick check'}</span>
                  <span className="text-[#d3e4fe] font-bold">
                    {miniAnsweredCount > 0
                      ? `${miniCorrectCount}/${MINI_DIAGNOSTIC_QUESTIONS.length}`
                      : miniDeferred || miniAnsweredCount === 0
                      ? isFr
                        ? 'Reportée (disponible depuis le tableau de bord)'
                        : 'Deferred (available anytime from dashboard)'
                      : ''}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#bfc7d2]">
                {isFr
                  ? 'Vous pourrez ajuster votre certification cible, votre date d’examen ou relancer un diagnostic à tout moment.'
                  : 'You can update your target certification, exam date, or retake a diagnostic anytime.'}
              </p>
            </div>
          )}

          {/* STEP 7 : LANCEMENT DE LA PREMIÈRE SESSION */}
          {step === 6 && (
            <div className="flex flex-col gap-5">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4edea3]">
                  {isFr ? 'Étape 7 / 7 • Démarrer' : 'Step 7 / 7 • Launch'}
                </span>
                <h2 id="onboarding-modal-title" className="text-2xl font-extrabold text-[#d3e4fe] mt-1">
                  {isFr ? 'Choisissez votre première activité' : 'Choose your first session'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  id="onboarding-launch-quiz-btn"
                  type="button"
                  onClick={() => handleFinish('exams')}
                  className="p-4 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] border border-[#38bdf8]/40 text-left flex flex-col gap-2 cursor-pointer transition-all"
                >
                  <Target className="w-5 h-5 text-[#38bdf8]" />
                  <span className="text-sm font-bold text-[#d3e4fe]">
                    {isFr ? 'Quiz adaptatif' : 'Adaptive Quiz'}
                  </span>
                  <span className="text-xs text-[#bfc7d2]">
                    {isFr ? 'Questions SQL avec explications progressives.' : 'SQL questions with step-by-step hints.'}
                  </span>
                </button>

                <button
                  id="onboarding-launch-lab-btn"
                  type="button"
                  onClick={() => handleFinish('sandbox')}
                  className="p-4 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] border border-[#4edea3]/40 text-left flex flex-col gap-2 cursor-pointer transition-all"
                >
                  <Terminal className="w-5 h-5 text-[#4edea3]" />
                  <span className="text-sm font-bold text-[#d3e4fe]">
                    {isFr ? 'Lab SQL en direct' : 'Live SQL Lab'}
                  </span>
                  <span className="text-xs text-[#bfc7d2]">
                    {isFr ? 'Exécutez de vraies requêtes SQL dans le navigateur.' : 'Run real SQL queries right in the browser.'}
                  </span>
                </button>

                <button
                  id="onboarding-launch-quick5-btn"
                  type="button"
                  onClick={() => handleFinish(undefined, 'quick_5min')}
                  className="p-4 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] border border-[#f59e0b]/40 text-left flex flex-col gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-5 h-5 text-[#f59e0b]" />
                  <span className="text-sm font-bold text-[#d3e4fe]">
                    {isFr ? 'Session 5 minutes' : '5-Min Quick Session'}
                  </span>
                  <span className="text-xs text-[#bfc7d2]">
                    {isFr ? '5 questions rapides pour démarrer en douceur.' : '5 quick questions to warm up smoothly.'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-[#1b2b3f] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-4 py-2.5 rounded-xl font-bold text-xs border border-[#1b2b3f] bg-[#061322] hover:bg-[#102034] disabled:opacity-40 text-[#d3e4fe] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isFr ? 'Précédent' : 'Previous'}</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#89929b]">
                {step + 1} / {totalSteps}
              </span>
              <button
                type="button"
                onClick={handleOpenLegal}
                className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-[#89929b] hover:text-[#38bdf8] underline cursor-pointer"
              >
                <Compass className="w-3 h-3" />
                <span>{isFr ? 'Mentions légales' : 'Legal notice'}</span>
              </button>
            </div>

            {step < totalSteps - 1 ? (
              <button
                id="onboarding-next-btn"
                type="button"
                onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
                className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>{isFr ? 'Suivant' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="onboarding-finish-btn"
                type="button"
                onClick={() => handleFinish('dashboard')}
                className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-[#10b981] hover:bg-[#059669] text-[#003824] shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isFr ? 'Accéder au tableau de bord' : 'Go to Dashboard'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
