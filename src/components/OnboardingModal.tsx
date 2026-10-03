import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  Lightbulb,
  Brain,
  BookOpen,
  Activity,
  Terminal,
  Cloud,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Play,
  ShieldCheck,
  X,
} from 'lucide-react';
import { CertificationTrackId, NavigationTab } from '../types';
import { ShortSessionMode } from '../data/shortSessionsData';
import { AppLogo } from './AppLogo';
import logoImg from '../assets/images/dbmastery_logo_1790662821248.jpg';
import { hasCompletedInitialDiagnostic } from '../services/initialDiagnosticService';

const ONBOARDING_STORAGE_KEY = 'dbmastery_onboarding_completed_v1';

export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markOnboardingCompleted(): void {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } catch {
    // ignore storage errors
  }
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'en';
  selectedCert: CertificationTrackId;
  onSelectCert: (cert: CertificationTrackId) => void;
  onStartShortSession: (mode: ShortSessionMode) => void;
  onNavigateToTab: (tab: NavigationTab) => void;
  onOpenContextualHelp: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  lang,
  selectedCert,
  onSelectCert,
  onStartShortSession,
  onNavigateToTab,
  onOpenContextualHelp,
}) => {
  const isFr = lang === 'fr';
  const [step, setStep] = useState(0);
  const [previewExplainLevel, setPreviewExplainLevel] = useState<'hint' | 'explain' | 'course'>('hint');

  if (!isOpen) return null;

  const totalSteps = 6;

  const handleComplete = () => {
    markOnboardingCompleted();
    onClose();
    if (!hasCompletedInitialDiagnostic()) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dbmastery:open_initial_diagnostic'));
      }, 350);
    }
  };

  const certChoices: { id: CertificationTrackId; name: string; tag: string }[] = [
    { id: 'oracle-1z0-071', name: 'Oracle Database SQL (1Z0-071)', tag: 'Oracle SQL' },
    { id: 'postgres-edb', name: 'PostgreSQL EDB Associate', tag: 'PostgreSQL' },
    { id: 'mysql-80-dba', name: 'MySQL 8.0 Administrator', tag: 'MySQL 8.0' },
    { id: 'azure-dp-900', name: 'Azure Data Fundamentals (DP-900)', tag: 'Azure SQL' },
  ];

  return (
    <div
      id="onboarding-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        id="onboarding-modal"
        className="relative w-full max-w-3xl my-auto rounded-2xl bg-[#0b1c30] border border-[#38bdf8]/40 text-[#d3e4fe] shadow-[0_20px_60px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col"
      >
        {/* TOP HEADER : Logo + Progress Pills + Skip */}
        <div className="px-6 py-4 bg-[#000f21] border-b border-[#1b2b3f] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" subtitle={isFr ? 'Guide de démarrage' : 'Onboarding Tour'} />
          </div>

          {/* Step Indicators */}
          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setStep(idx)}
                aria-label={`Étape ${idx + 1}`}
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
            onClick={handleComplete}
            className="px-3 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-xs font-mono text-[#89929b] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isFr ? 'Passer' : 'Skip'}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* BODY CONTENT BY STEP */}
        <div className="p-6 sm:p-8 flex flex-col gap-6 min-h-[390px] justify-between">
          {/* ============================================================
              ÉTAPE 1 : Bienvenue + Logo Officiel + Choix de Certification
             ============================================================ */}
          {step === 0 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-2xl bg-[#061322] border border-[#1b2b3f]">
                <img
                  src={logoImg}
                  alt="Logo officiel DBMastery Studio"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#38bdf8]/50 shadow-lg shrink-0"
                />
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4edea3]">
                    {isFr ? 'Étape 1 / 6 • Bienvenue' : 'Step 1 / 6 • Welcome'}
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#d3e4fe] tracking-tight">
                    {isFr
                      ? 'Bienvenue sur DBMastery Studio'
                      : 'Welcome to DBMastery Studio'}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#bfc7d2] leading-relaxed">
                    {isFr
                      ? 'Votre environnement d\'entraînement adaptatif pour maîtriser SQL, l\'architecture SGBD et réussir vos certifications techniques.'
                      : 'Your adaptive training studio to master SQL, database internals, and pass your technical certifications.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="font-mono text-xs uppercase tracking-wider font-bold text-[#89ceff]">
                  {isFr
                    ? 'Sélectionnez votre certification cible :'
                    : 'Select your target certification:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {certChoices.map((c) => {
                    const active = selectedCert === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onSelectCert(c.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          active
                            ? 'bg-[#0284c7] border-[#0284c7] text-white shadow-md ring-2 ring-[#38bdf8]/50'
                            : 'bg-[#102034] border-[#26364a] text-[#d3e4fe] hover:border-[#38bdf8]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck
                            className={`w-4 h-4 shrink-0 ${
                              active ? 'text-white' : 'text-[#89ceff]'
                            }`}
                          />
                          <span className={`text-xs font-bold ${active ? 'text-white' : 'text-[#d3e4fe]'}`}>
                            {c.name}
                          </span>
                        </div>
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold border ${
                            active
                              ? 'bg-[#0369a1] text-white border-white/30'
                              : 'bg-[#0b1c30] text-[#93ccff] border-[#1b2b3f]'
                          }`}
                        >
                          {c.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              ÉTAPE 2 : Sessions Courtes (« J'ai 5 minutes » & « J'ai 30 minutes »)
             ============================================================ */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#fbbf24]">
                  {isFr ? 'Étape 2 / 6 • Sessions Courtes Quotidiennes' : 'Step 2 / 6 • Daily Short Sessions'}
                </span>
                <h2 className="text-2xl font-extrabold text-[#d3e4fe]">
                  {isFr
                    ? 'Entraînez-vous selon le temps dont vous disposez'
                    : 'Train based on the time you have'}
                </h2>
                <p className="text-xs sm:text-sm text-[#bfc7d2]">
                  {isFr
                    ? 'Deux formats accessibles en 1 clic depuis le Tableau de bord, Mon activité et la barre latérale :'
                    : 'Two formats accessible in 1 click from the Dashboard, My Activity, and the Sidebar:'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 5 minutes */}
                <div className="p-4 rounded-2xl bg-[#061322] border border-[#f59e0b]/50 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-xs font-bold text-[#fbbf24]">
                      {isFr ? '« J\'ai 5 minutes »' : '"I have 5 minutes"'}
                    </span>
                    <h3 className="text-lg font-extrabold text-[#d3e4fe]">⚡ Quick Training</h3>
                    <ul className="font-mono text-xs text-[#d3e4fe] space-y-1.5 mt-1">
                      <li>• <strong>5 questions</strong></li>
                      <li>• <strong className="text-[#fbbf24]">5 minutes</strong></li>
                      <li>• <strong className="text-[#4edea3]">{isFr ? 'Notions faibles uniquement' : 'Weak concepts only'}</strong></li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleComplete();
                      onStartShortSession('quick_5min');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-[#0b1c30] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isFr ? 'Tester maintenant (5 min)' : 'Try now (5 min)'}</span>
                  </button>
                </div>

                {/* 30 minutes */}
                <div className="p-4 rounded-2xl bg-[#061322] border border-[#38bdf8]/50 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-xs font-bold text-[#38bdf8]">
                      {isFr ? '« J\'ai 30 minutes »' : '"I have 30 minutes"'}
                    </span>
                    <h3 className="text-lg font-extrabold text-[#d3e4fe]">🎯 Training Session</h3>
                    <ul className="font-mono text-xs text-[#d3e4fe] space-y-1.5 mt-1">
                      <li>• <strong>20 questions</strong></li>
                      <li>• <strong className="text-[#38bdf8]">{isFr ? 'Difficulté progressive' : 'Progressive difficulty'}</strong></li>
                      <li>• <strong className="text-[#4edea3]">{isFr ? 'Adaptée à mon niveau' : 'Adapted to my level'}</strong></li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleComplete();
                      onStartShortSession('training_30min');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isFr ? 'Tester maintenant (30 min)' : 'Try now (30 min)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              ÉTAPE 3 : Pédagogie Progressive « Explique-moi » (3 Niveaux)
             ============================================================ */}
          {step === 2 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4edea3]">
                  {isFr ? 'Étape 3 / 6 • Assistance Pédagogique' : 'Step 3 / 6 • Pedagogical Assistance'}
                </span>
                <h2 className="text-2xl font-extrabold text-[#d3e4fe]">
                  {isFr
                    ? 'Fonctionnalité « Explique-moi » à 3 niveaux'
                    : '3-Level "Explain to Me" Feature'}
                </h2>
                <p className="text-xs sm:text-sm text-[#bfc7d2]">
                  {isFr
                    ? 'Pour chaque question, progressez à votre rythme sans dévoiler immédiatement la réponse finale :'
                    : 'For every question, get progressive help without immediately spoiling the final answer:'}
                </p>
              </div>

              {/* Interactive Demo of the 3 levels */}
              <div className="p-4 rounded-2xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewExplainLevel('hint')}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer transition-all ${
                      previewExplainLevel === 'hint'
                        ? 'bg-[#f59e0b] text-[#0b1c30]'
                        : 'bg-[#0b1c30] text-[#fbbf24] border border-[#f59e0b]/40'
                    }`}
                  >
                    💡 {isFr ? 'Indice' : 'Hint'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewExplainLevel('explain')}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer transition-all ${
                      previewExplainLevel === 'explain'
                        ? 'bg-[#0284c7] text-white'
                        : 'bg-[#0b1c30] text-[#38bdf8] border border-[#38bdf8]/40'
                    }`}
                  >
                    🧠 {isFr ? 'Explication' : 'Explanation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewExplainLevel('course')}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold cursor-pointer transition-all ${
                      previewExplainLevel === 'course'
                        ? 'bg-[#10b981] text-[#003824]'
                        : 'bg-[#0b1c30] text-[#4edea3] border border-[#10b981]/40'
                    }`}
                  >
                    📖 {isFr ? 'Cours' : 'Course'}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] text-xs leading-relaxed">
                  {previewExplainLevel === 'hint' && (
                    <div className="flex flex-col gap-1">
                      <span className="font-mono font-bold text-[#fbbf24]">💡 Indice (Niveau 1)</span>
                      <p className="text-[#d3e4fe]">
                        {isFr
                          ? 'Regarde attentivement la condition du JOIN et vérifie si le filtre porte sur la clause ON ou la clause WHERE.'
                          : 'Look closely at the JOIN condition and check whether the filter is placed in ON or WHERE.'}
                      </p>
                    </div>
                  )}
                  {previewExplainLevel === 'explain' && (
                    <div className="flex flex-col gap-1">
                      <span className="font-mono font-bold text-[#38bdf8]">🧠 Explication (Niveau 2)</span>
                      <p className="text-[#d3e4fe]">
                        {isFr
                          ? 'Le LEFT JOIN conserve toutes les lignes de la table gauche. Si aucune ligne ne correspond à droite, les colonnes de droite valent NULL.'
                          : 'LEFT JOIN preserves all rows from the left table. Unmatched right columns are filled with NULL.'}
                      </p>
                    </div>
                  )}
                  {previewExplainLevel === 'course' && (
                    <div className="flex flex-col gap-1">
                      <span className="font-mono font-bold text-[#4edea3]">📖 Cours complet (Niveau 3)</span>
                      <p className="text-[#d3e4fe]">
                        {isFr
                          ? 'Explication complète + requête d\'exemple commentée + cas particuliers d\'examen (ON vs WHERE sur jointure externe).'
                          : 'Complete lesson + commented SQL query example + exam edge cases (ON vs WHERE on outer joins).'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              ÉTAPE 4 : Historique Personnel « Mon activité »
             ============================================================ */}
          {step === 3 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                  {isFr ? 'Étape 4 / 6 • Historique Personnel' : 'Step 4 / 6 • Personal Activity Ledger'}
                </span>
                <h2 className="text-2xl font-extrabold text-[#d3e4fe]">
                  {isFr ? 'Page dédiée « Mon activité »' : 'Dedicated "My Activity" Page'}
                </h2>
                <p className="text-xs sm:text-sm text-[#bfc7d2]">
                  {isFr
                    ? 'Suivez votre rythme hebdomadaire, cliquez sur un jour (Lun–Ven) pour filtrer vos sessions et mesurez votre gain sur SQL :'
                    : 'Track your weekly pace, click any day (Mon–Fri) to filter sessions, and measure your SQL gain:'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#061322] border border-[#1b2b3f] font-mono text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-[#89929b] font-bold uppercase text-[11px]">
                    {isFr ? 'Mon activité • Cette semaine' : 'My Activity • This Week'}
                  </div>
                  <div className="flex justify-between"><span>Questions</span><strong className="text-[#d3e4fe]">127</strong></div>
                  <div className="flex justify-between"><span>{isFr ? 'Réussite' : 'Accuracy'}</span><strong className="text-[#4edea3]">81 %</strong></div>
                  <div className="flex justify-between"><span>{isFr ? 'Temps moyen' : 'Avg time'}</span><strong className="text-[#38bdf8]">32 s</strong></div>
                  <div className="flex justify-between"><span>{isFr ? 'Série actuelle' : 'Current streak'}</span><strong className="text-[#fbbf24]">6 jours</strong></div>
                </div>

                <div className="space-y-1">
                  <div className="text-[#89929b] font-bold uppercase text-[11px]">Progression</div>
                  <div>Lun &nbsp;&nbsp;<span className="text-[#4edea3]">███████</span></div>
                  <div>Mar &nbsp;&nbsp;<span className="text-[#4edea3]">█████████</span></div>
                  <div>Mer &nbsp;&nbsp;<span className="text-[#4edea3]">█████</span></div>
                  <div>Jeu &nbsp;&nbsp;<span className="text-[#4edea3]">██████████</span></div>
                  <div>Ven &nbsp;&nbsp;<span className="text-[#4edea3]">███████████</span></div>
                  <div className="pt-1 text-[#4edea3] font-bold">
                    « Depuis la semaine dernière : +12 % sur SQL »
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              ÉTAPE 5 : Lab SQL Live (AlaSQL) & Skill Map 4D
             ============================================================ */}
          {step === 4 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4edea3]">
                  {isFr ? 'Étape 5 / 6 • Pratique Interactive' : 'Step 5 / 6 • Interactive Practice'}
                </span>
                <h2 className="text-2xl font-extrabold text-[#d3e4fe]">
                  {isFr
                    ? 'Lab SQL Live & Skill Map Quadridimensionnelle'
                    : 'Live SQL Sandbox & 4D Skill Map'}
                </h2>
                <p className="text-xs sm:text-sm text-[#bfc7d2]">
                  {isFr
                    ? 'Exécutez de vraies requêtes SQL dans votre navigateur et visualisez l\'évolution de vos compétences sur 4 dimensions :'
                    : 'Execute real SQL queries in your browser and visualize your competency growth across 4 pillars:'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#38bdf8] font-bold text-sm">
                    <Terminal className="w-4 h-4" />
                    <span>{isFr ? 'Moteur SQL In-Memory' : 'In-Memory SQL Engine'}</span>
                  </div>
                  <p className="text-xs text-[#bfc7d2] leading-relaxed">
                    {isFr
                      ? 'Testez vos jointures, GROUP BY, HAVING et sous-requêtes en direct sur le schéma RH (EMPLOYEES, DEPARTMENTS).'
                      : 'Test your JOINs, GROUP BY, HAVING, and subqueries live against the HR schema.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#4edea3] font-bold text-sm">
                    <Activity className="w-4 h-4" />
                    <span>{isFr ? 'Recalcul Dynamique des Scores' : 'Dynamic Competency Recalculation'}</span>
                  </div>
                  <p className="text-xs text-[#bfc7d2] leading-relaxed">
                    {isFr
                      ? 'Chaque session met à jour vos scores de maîtrise (JOIN, Subqueries, Indexes, GROUP BY) avec détection des pièges.'
                      : 'Every session updates your mastery scores with automatic SQL trap detection.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              ÉTAPE 6 : Cloud Firestore, Aide Contextuelle & Infobulles
             ============================================================ */}
          {step === 5 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4edea3]">
                  {isFr ? 'Étape 6 / 6 • Prêt à démarrer !' : 'Step 6 / 6 • Ready to Start!'}
                </span>
                <h2 className="text-2xl font-extrabold text-[#d3e4fe]">
                  {isFr
                    ? 'Aide Contextuelle, Infobulles & Synchronisation Cloud'
                    : 'Contextual Help, Smart Tooltips & Cloud Sync'}
                </h2>
                <p className="text-xs sm:text-sm text-[#bfc7d2]">
                  {isFr
                    ? 'Tout est en place pour accompagner votre progression au quotidien :'
                    : 'Everything is set up to support your daily SQL progression:'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#38bdf8]">
                    <HelpCircle className="w-4 h-4" />
                    <span>{isFr ? 'Aide Contextuelle (?)' : 'Contextual Help (?)'}</span>
                  </div>
                  <p className="text-[11px] text-[#bfc7d2] leading-relaxed">
                    {isFr
                      ? 'Cliquez sur « Aide contextuelle » en bas à droite ou dans la barre supérieure pour obtenir les astuces SQL de l\'écran actif.'
                      : 'Click "Contextual Help" at the bottom-right or top bar for screen-specific SQL tips.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#4edea3]">
                    <Sparkles className="w-4 h-4" />
                    <span>{isFr ? 'Infobulles (Tooltips)' : 'Smart Tooltips'}</span>
                  </div>
                  <p className="text-[11px] text-[#bfc7d2] leading-relaxed">
                    {isFr
                      ? 'Survolez les métriques, badges et boutons pour lire les définitions et objectifs pédagogiques.'
                      : 'Hover over metrics, badges, and buttons to read pedagogical definitions.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#fbbf24]">
                    <Cloud className="w-4 h-4" />
                    <span>{isFr ? 'Google Cloud Firestore' : 'Google Cloud Firestore'}</span>
                  </div>
                  <p className="text-[11px] text-[#bfc7d2] leading-relaxed">
                    {isFr
                      ? 'Utilisez le bouton « Connexion Google » pour sauvegarder votre série et vos statistiques en temps réel.'
                      : 'Use the "Google Sign-In" button to back up your streak and stats in real time.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              FOOTER NAVIGATION : Précédent / Suivant / Terminer
             ============================================================ */}
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

            <div className="font-mono text-xs text-[#89929b]">
              {step + 1} / {totalSteps}
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
                onClick={handleComplete}
                className="px-6 py-2.5 rounded-xl font-extrabold text-xs bg-[#10b981] hover:bg-[#059669] text-[#003824] shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isFr ? 'Commencer l\'entraînement' : 'Start Training'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
