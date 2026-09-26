import React, { useState } from 'react';
import { 
  Calendar, 
  Timer, 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle, 
  Clock, 
  Award, 
  Play, 
  ArrowRight, 
  Rocket, 
  Compass, 
  Zap, 
  Sliders, 
  AlertTriangle, 
  Flame, 
  Layers, 
  ChevronRight,
  Database,
  Cloud,
  CheckCircle2,
  Terminal,
  Activity,
  ExternalLink,
  BookOpen,
  BookMarked,
  Network,
  Sparkles
} from 'lucide-react';
import { certificationTracks, examHistory, certificationProgramsCatalog } from '../data/mockData';
import { NavigationTab, CertificationTrackId } from '../types';
import { getStoredCompetencies, UserCompetency } from '../services/competencyService';
import { TrapDiagnosticsCard } from './TrapDiagnosticsCard';
import { TrapExplorerModal } from './TrapExplorerModal';
import { ResponseTimeAnalyticsCard } from './ResponseTimeAnalyticsCard';
import { ProgressiveExplainPanel } from './ProgressiveExplainPanel';
import type { User } from '../services/firebaseSyncService';
import { LogOut } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onSelectTrack: (id: CertificationTrackId) => void;
  selectedCert?: CertificationTrackId;
  lang: 'fr' | 'en';
  onOpenTargetedSession?: () => void;
  currentUser?: User | null;
  cloudSyncedCount?: number;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectTrack,
  selectedCert = 'oracle-1z0-071',
  lang,
  onOpenTargetedSession,
  currentUser,
  cloudSyncedCount = 0,
  onGoogleSignIn,
  onSignOut,
}) => {
  const isFr = lang === 'fr';
  const [isLaunchingQuiz, setIsLaunchingQuiz] = useState(false);
  const [quizNotice, setQuizNotice] = useState<string | null>(null);
  const [competencies, setCompetencies] = useState<UserCompetency[]>(() => getStoredCompetencies());
  const [isTrapExplorerOpen, setIsTrapExplorerOpen] = useState(false);
  const [demoJoinAnswer, setDemoJoinAnswer] = useState<string | null>(null);

  React.useEffect(() => {
    const handleUpdate = () => {
      setCompetencies(getStoredCompetencies());
    };
    window.addEventListener('dbmastery:competencies_updated', handleUpdate);
    return () => window.removeEventListener('dbmastery:competencies_updated', handleUpdate);
  }, []);

  const activeTrackObj = certificationTracks.find(t => t.id === selectedCert) || certificationTracks[0];

  const handleLaunchQuiz = () => {
    setIsLaunchingQuiz(true);
    setTimeout(() => {
      setIsLaunchingQuiz(false);
      setQuizNotice(
        isFr 
          ? `Quiz adaptatif ${activeTrackObj?.code || '1Z0-071'} généré (15 questions). Redirection vers l'examen...` 
          : `Smart Quiz ${activeTrackObj?.code || '1Z0-071'} generated (15 items). Redirecting to exam session...`
      );
      setTimeout(() => {
        setQuizNotice(null);
        onNavigate('exams');
      }, 1200);
    }, 800);
  };

  const days = [
    { label: isFr ? 'L' : 'M', completed: true, current: false },
    { label: isFr ? 'M' : 'T', completed: true, current: false },
    { label: isFr ? 'M' : 'W', completed: true, current: false },
    { label: isFr ? 'J' : 'T', completed: false, current: false },
    { label: isFr ? 'V' : 'F', completed: true, current: false },
    { label: isFr ? 'S' : 'S', completed: false, current: true },
    { label: isFr ? 'D' : 'S', completed: false, current: false },
  ];

  return (
    <div id="dashboard-view-container" className="p-6 max-w-[1720px] mx-auto w-full flex flex-col gap-6">
      {/* Toast Notice */}
      {quizNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4edea3] text-[#003824] font-semibold text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-[#6ffbbe]/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{quizNotice}</span>
        </div>
      )}

      {/* PAGE TITLE & HERO CONTEXT */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#1b2b3f] text-[#93ccff] font-mono text-[10px] uppercase tracking-wider font-semibold border border-[#26364a]">
              {isFr ? 'Système d\'Apprentissage Adaptatif' : 'Adaptive Learning System'}
            </span>
            <span className="text-[#89929b] font-mono text-xs">•</span>
            <span className="font-mono text-xs text-[#4edea3] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
              {isFr ? 'Moteur v16.2 Connecté' : 'Engine v16.2 Sync'}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#d3e4fe] font-sans">
            {isFr ? 'Tableau de Bord de Révision Certification' : 'Certification Revision Dashboard'}
          </h1>
          <p className="text-sm text-[#bfc7d2] max-w-2xl leading-relaxed">
            {isFr 
              ? 'Suivez votre progression vers les certifications officielles Database et lancez des sessions de révision ciblées assistées par IA.' 
              : 'Track your readiness across official database certifications and launch targeted AI-powered daily study sessions.'}
          </p>
        </div>

        {/* Quick Status Strip + Connexion Google */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0b1c30] p-1.5 rounded-xl border border-[#1b2b3f] shadow-md shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#102034] rounded-lg border border-[#4edea3]/40">
              <Cloud className="w-4 h-4 text-[#4edea3]" />
              <div className="flex flex-col">
                <span className="font-mono text-[9px] text-[#4edea3] uppercase font-bold">
                  Firestore Cloud ({cloudSyncedCount})
                </span>
                <span className="text-xs font-semibold text-[#d3e4fe] truncate max-w-[130px]">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'Connecté'}
                </span>
              </div>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title={isFr ? 'Se déconnecter' : 'Sign out'}
                  className="p-1 rounded bg-[#0b1c30] hover:bg-[#1b2b3f] text-[#ffb4ab] ml-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              id="dashboard-top-google-signin-btn"
              type="button"
              onClick={onGoogleSignIn}
              className="px-3.5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center gap-2 border border-[#38bdf8]/50 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
                </svg>
              </span>
              <span className="text-white font-bold">{isFr ? 'Connexion Google' : 'Google Sign-In'}</span>
            </button>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#102034] rounded-lg border border-[#1b2b3f]">
            <Calendar className="w-4 h-4 text-[#89ceff]" />
            <div className="flex flex-col">
              <span className="font-mono text-[9px] text-[#89929b] uppercase font-medium">
                {isFr ? 'Examen Cible' : 'Target Exam'}
              </span>
              <span className="text-xs font-semibold text-[#d3e4fe]">
                {isFr ? '15 Mars 2025' : 'March 15, 2025'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#102034] rounded-lg border border-[#1b2b3f]">
            <Timer className="w-4 h-4 text-[#4edea3]" />
            <div className="flex flex-col">
              <span className="font-mono text-[9px] text-[#89929b] uppercase font-medium">
                {isFr ? 'Compte à Rebours' : 'Countdown'}
              </span>
              <span className="font-mono text-xs font-bold text-[#4edea3]">D-22</span>
            </div>
          </div>
        </div>
      </div>

      {/* BANNIÈRE CENTRALE EXAMEN BLANC DE CERTIFICATION */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#003859] via-[#0b2742] to-[#102034] border border-[#3198dc]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3198dc] to-[#89ceff] text-[#002c47] flex items-center justify-center shrink-0 shadow-lg shadow-[#3198dc]/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3198dc]/20 text-[#89ceff] border border-[#3198dc]/30">
                {isFr ? 'ÉLÉMENT CENTRAL' : 'CENTRAL SIMULATION'}
              </span>
              <span className="text-xs font-mono text-[#4edea3]">
                {isFr ? 'Conditions réelles d\'examen' : 'Real exam conditions'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {isFr ? 'Examen Blanc : 60 questions — 90 minutes' : 'Practice Exam: 60 questions — 90 minutes'}
            </h2>
            <p className="text-xs text-[#bfc7d2] max-w-xl leading-relaxed">
              {isFr 
                ? 'Simulation chronométrée officielle avec répartition par piliers (SQL, Modélisation, Transactions, Administration) et diagnostic personnalisé des notions expliquant chaque erreur.'
                : 'Official timed proctored exam with pillar breakdown (SQL, Modeling, Transactions, Administration) and cognitive error diagnosis.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            id="launch-cert-exam-banner-btn"
            onClick={() => onNavigate('cert_exam')}
            className="w-full md:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-[#3198dc] hover:bg-[#2084c6] text-[#002c47] hover:text-white shadow-lg shadow-[#3198dc]/30 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isFr ? 'Démarrer l\'Examen Blanc (90 min)' : 'Start Practice Exam (90 min)'}</span>
          </button>
        </div>
      </div>

      {/* WIDGET HISTORIQUE PERSONNEL : MON ACTIVITÉ — CETTE SEMAINE */}
      <div
        id="dashboard-personal-activity-card"
        className="bg-[#0b1c30] rounded-2xl border border-[#26364a] shadow-lg p-5 flex flex-col lg:flex-row items-stretch justify-between gap-6"
      >
        {/* Left: Mon activité / Cette semaine */}
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between border-b border-[#1b2b3f] pb-3">
            <div>
              <span className="font-mono text-[10px] text-[#4edea3] uppercase font-bold tracking-wider">
                {isFr ? 'Historique personnel' : 'Personal History'}
              </span>
              <h3 className="text-lg font-extrabold text-white leading-tight">
                {isFr ? 'Mon activité — Cette semaine' : 'My Activity — This week'}
              </h3>
            </div>
            <button
              id="dashboard-open-activity-page-btn"
              type="button"
              onClick={() => onNavigate('activity')}
              className="px-3.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center gap-1.5 border border-[#38bdf8]/40 shadow-sm transition-all cursor-pointer"
            >
              <span>{isFr ? 'Ouvrir la page Mon activité' : 'Open My Activity page'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-xl bg-[#061322] border border-[#1b2b3f]">
              <span className="text-[11px] text-[#89929b] block">{isFr ? 'Questions' : 'Questions'}</span>
              <span className="text-xl font-extrabold text-white">127</span>
            </div>
            <div className="p-3 rounded-xl bg-[#061322] border border-[#1b2b3f]">
              <span className="text-[11px] text-[#89929b] block">{isFr ? 'Réussite' : 'Accuracy'}</span>
              <span className="text-xl font-extrabold text-[#4edea3]">81 %</span>
            </div>
            <div className="p-3 rounded-xl bg-[#061322] border border-[#1b2b3f]">
              <span className="text-[11px] text-[#89929b] block">{isFr ? 'Temps moyen' : 'Average time'}</span>
              <span className="text-xl font-extrabold text-[#38bdf8]">32 s</span>
            </div>
            <div className="p-3 rounded-xl bg-[#061322] border border-[#1b2b3f]">
              <span className="text-[11px] text-[#89929b] block">{isFr ? 'Série actuelle' : 'Current streak'}</span>
              <span className="text-xl font-extrabold text-[#f59e0b]">
                6 {isFr ? 'jours' : 'days'}
              </span>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-[#003824]/50 border border-[#4edea3]/40 flex items-center justify-between">
            <span className="font-mono text-xs sm:text-sm font-extrabold text-white">
              « {isFr ? 'Depuis la semaine dernière : +12 % sur SQL' : 'Since last week: +12% on SQL'} »
            </span>
            <span className="font-mono text-xs font-bold text-[#4edea3] shrink-0 ml-2">+12 % SQL</span>
          </div>
        </div>

        {/* Right: Progression Lun..Ven */}
        <div
          onClick={() => onNavigate('activity')}
          className="lg:w-80 bg-[#061322] hover:bg-[#102034]/80 rounded-xl border border-[#1b2b3f] p-4 font-mono flex flex-col justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {isFr ? 'Progression' : 'Progression'}
            </span>
            <span className="text-[10px] text-[#38bdf8]">{isFr ? 'Détails →' : 'Details →'}</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="w-10 text-[#bfc7d2] font-bold">Lun</span>
              <span className="text-[#4edea3] flex-1">███████</span>
              <span className="text-[#89929b]">21 Q</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="w-10 text-[#bfc7d2] font-bold">Mar</span>
              <span className="text-[#4edea3] flex-1">█████████</span>
              <span className="text-[#89929b]">27 Q</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="w-10 text-[#bfc7d2] font-bold">Mer</span>
              <span className="text-[#4edea3] flex-1">█████</span>
              <span className="text-[#89929b]">15 Q</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="w-10 text-[#bfc7d2] font-bold">Jeu</span>
              <span className="text-[#4edea3] flex-1">██████████</span>
              <span className="text-[#89929b]">31 Q</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="w-10 text-[#bfc7d2] font-bold">Ven</span>
              <span className="text-[#4edea3] flex-1">███████████</span>
              <span className="text-[#89929b]">33 Q</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. KEY METRICS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Readiness Score */}
        <div className="relative overflow-hidden bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col justify-between group hover:border-[#3198dc]/50 transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#93ccff]/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#bfc7d2] uppercase tracking-wider font-semibold">
              {isFr ? 'Score Global de Préparation' : 'Overall Readiness Score'}
            </span>
            <span className="p-1.5 rounded-lg bg-[#26364a] text-[#93ccff]">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-[#d3e4fe] font-sans">78%</span>
            <span className="font-mono text-xs text-[#4edea3] font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +4.2% {isFr ? 'ce mois' : 'this month'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="w-full bg-[#000f21] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#93ccff] h-full rounded-full transition-all duration-700" style={{ width: '78%' }}></div>
            </div>
            <span className="font-mono text-[10px] text-[#89929b]">
              {isFr ? 'Seuil de validation: 70%' : 'Target passing score: 70%'}
            </span>
          </div>
        </div>

        {/* Metric 2: Questions Reviewed */}
        <div className="relative overflow-hidden bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col justify-between group hover:border-[#89ceff]/50 transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#89ceff]/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#bfc7d2] uppercase tracking-wider font-semibold">
              {isFr ? 'Questions Terminées' : 'Questions Completed'}
            </span>
            <span className="p-1.5 rounded-lg bg-[#26364a] text-[#89ceff]">
              <HelpCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-[#d3e4fe] font-sans">842</span>
            <span className="text-base text-[#89929b] font-mono">/ 1200</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="w-full bg-[#000f21] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#89ceff] h-full rounded-full transition-all duration-700" style={{ width: '70.1%' }}></div>
            </div>
            <span className="font-mono text-[10px] text-[#89929b]">
              {isFr ? '70.1% de la banque de questions' : '70.1% of global question bank'}
            </span>
          </div>
        </div>

        {/* Metric 3: Study Time */}
        <div className="relative overflow-hidden bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col justify-between group hover:border-[#4edea3]/50 transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#4edea3]/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#bfc7d2] uppercase tracking-wider font-semibold">
              {isFr ? 'Temps d\'Étude Cumulé' : 'Cumulative Study Time'}
            </span>
            <span className="p-1.5 rounded-lg bg-[#26364a] text-[#4edea3]">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-[#d3e4fe] font-sans">46h</span>
            <span className="text-base text-[#89929b] font-mono">15m</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-[#89929b]">
            <span>+6h {isFr ? 'cette semaine' : 'this week'}</span>
            <span className="text-[#4edea3] font-semibold">92% {isFr ? 'de l\'objectif' : 'of target'}</span>
          </div>
        </div>

        {/* Metric 4: Next Target Exam */}
        <div className="relative overflow-hidden bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col justify-between group hover:border-[#3198dc]/50 transition-all">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#3198dc]/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#bfc7d2] uppercase tracking-wider font-semibold">
              {isFr ? 'Échéance Prochaine Épreuve' : 'Next Exam Deadline'}
            </span>
            <span className="p-1.5 rounded-lg bg-[#3198dc] text-[#002c47]">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="my-2 flex flex-col">
            <span className="text-xl font-bold text-[#d3e4fe] font-sans">
              {isFr ? '15 Mars 2025' : 'March 15, 2025'}
            </span>
            <span className="font-mono text-xs text-[#93ccff] font-semibold">Oracle 1Z0-071</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-[#89929b]">{isFr ? 'Centre Certiport' : 'Certiport Center'}</span>
            <span className="text-[#4edea3] font-semibold">{isFr ? 'Inscription Validée' : 'Registration Confirmed'}</span>
          </div>
        </div>
      </div>

      {/* 2. CERTIFICATION TRACKS GRID (4 CURSUS) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#93ccff]" />
            <h2 className="text-lg font-semibold text-[#d3e4fe]">
              {isFr ? 'Vos Parcours de Certification' : 'Your Certification Tracks'}
            </h2>
          </div>
          <span className="font-mono text-xs text-[#89929b]">
            {isFr ? '5 cursus certifiants actifs' : '5 active certification tracks'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {certificationTracks.map((track) => {
            const isOracle = track.id === 'oracle-1z0-071';
            const isAzureDp900 = track.id === 'azure-dp-900';
            const isAzureDp800 = track.id === 'azure-dp-800';
            const isPostgres = track.id === 'postgres-edb';
            const isMysql = track.id === 'mysql-80-dba';

            let badgeText = '';
            let badgeStyle = '';
            if (track.status === 'high_priority') {
              badgeText = isFr ? 'PRIORITÉ HAUTE' : 'IN HIGH PRIORITY';
              badgeStyle = 'bg-[#93000a]/50 text-[#ffb4ab] border border-[#ffb4ab]/30';
            } else if (track.status === 'in_progress') {
              badgeText = isFr ? 'EN COURS' : 'IN PROGRESS';
              badgeStyle = 'bg-[#00a2e6]/20 text-[#89ceff] border border-[#89ceff]/30';
            } else if (track.status === 'not_started') {
              badgeText = isFr ? 'NON COMMENCÉ' : 'NOT STARTED';
              badgeStyle = 'bg-[#26364a] text-[#bfc7d2] border border-[#3f4850]';
            } else {
              badgeText = isFr ? 'PLANIFIÉ' : 'SCHEDULED';
              badgeStyle = 'bg-[#26364a] text-[#89ceff] border border-[#3f4850]';
            }

            const isSelected = track.id === selectedCert;

            return (
              <div 
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={`relative p-4 rounded-xl border shadow-md flex flex-col justify-between transition-all group cursor-pointer ${
                  isSelected 
                    ? 'bg-[#12253c] border-[#3198dc] ring-2 ring-[#3198dc]/50 shadow-lg' 
                    : 'bg-[#102034] border-[#1b2b3f] hover:border-[#26364a] hover:bg-[#1b2b3f]/50'
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-[#000f21] border border-[#1b2b3f] flex items-center justify-center p-2 shadow-inner">
                      {isOracle ? (
                        <Database className="w-5 h-5 text-[#ffb4ab]" />
                      ) : isAzureDp800 ? (
                        <Database className="w-5 h-5 text-[#3198dc]" />
                      ) : isAzureDp900 ? (
                        <Cloud className="w-5 h-5 text-[#89ceff]" />
                      ) : isPostgres ? (
                        <Terminal className="w-5 h-5 text-[#4edea3]" />
                      ) : (
                        <Activity className="w-5 h-5 text-[#f59e0b]" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-wider uppercase bg-[#3198dc] text-[#002c47]">
                          {isFr ? 'ACTIF' : 'ACTIVE'}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-semibold tracking-wider uppercase ${badgeStyle}`}>
                        {badgeText}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-xs text-[#93ccff] font-semibold">{track.code}</span>
                      <span className="font-mono text-sm text-[#d3e4fe] font-bold">{track.progress}%</span>
                    </div>
                    <h3 className="text-base font-bold text-[#d3e4fe] mt-0.5 group-hover:text-[#93ccff] transition-colors">
                      {track.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-[#89929b] mt-0.5">
                      <span>{track.totalQuestions} questions • {track.chaptersCount} {isFr ? 'chapitres' : 'chapters'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                      <span className="text-[#89ceff] font-medium">{track.provider}</span>
                      <a
                        href={track.syllabusUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[#93ccff] hover:text-[#d3e4fe] hover:underline font-semibold transition-colors"
                        title={isFr ? `Accéder au programme officiel ${track.name}` : `Open official curriculum for ${track.name}`}
                      >
                        <span>{isFr ? 'Programme' : 'Syllabus'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#000f21] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${track.progress}%`,
                        backgroundColor: isOracle ? '#ffb4ab' : isAzureDp800 ? '#3198dc' : isAzureDp900 ? '#89ceff' : isPostgres ? '#4edea3' : '#f59e0b' 
                      }}
                    ></div>
                  </div>

                  {/* AI Recommendation */}
                  <div className="bg-[#0b1c30] p-2.5 rounded-lg border border-[#1b2b3f]">
                    <span className="font-mono text-[9px] text-[#89929b] uppercase block font-semibold mb-1">
                      {isFr ? 'RECOMMANDATION IA' : 'AI RECOMMENDATION'}
                    </span>
                    <p className="text-xs text-[#bfc7d2] leading-snug line-clamp-2">
                      {track.recommendation}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button 
                    onClick={() => {
                      onSelectTrack(track.id);
                      if (isOracle) onNavigate('exams');
                      else onNavigate('syllabus');
                    }}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 ${
                      isSelected 
                        ? 'bg-[#3198dc] text-[#002c47] hover:bg-[#93ccff] shadow-sm'
                        : 'bg-[#26364a] text-[#d3e4fe] hover:bg-[#1b2b3f] hover:text-[#93ccff]'
                    }`}
                  >
                    <span>
                      {isSelected ? (isFr ? 'Cursus sélectionné' : 'Active Track') : (isFr ? 'Ouvrir cursus' : 'Select Track')}
                    </span>
                    {isSelected ? <Play className="w-3.5 h-3.5 fill-current" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>

                  <a
                    href={track.syllabusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2.5 bg-[#000f21] hover:bg-[#1b2b3f] text-[#89ceff] hover:text-[#d3e4fe] border border-[#1b2b3f] hover:border-[#26364a] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                    title={isFr ? `Consulter le programme officiel de ${track.name}` : `View official curriculum for ${track.name}`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#93ccff]" />
                    <ExternalLink className="w-3 h-3 text-[#89929b]" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CENTRAL SECTION: 2 COLUMNS (8 COLS & 4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* RECOMMENDED DAILY SMART SESSION CARD */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#102034] via-[#1b2b3f] to-[#102034] p-6 rounded-xl border border-[#26364a] shadow-xl">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#3198dc]/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4edea3]"></span>
                  </span>
                  <span className="font-mono text-[10px] text-[#4edea3] uppercase tracking-widest font-semibold">
                    {isFr ? 'Session Recommandée Aujourd\'hui' : 'Recommended Session Today'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#000f21] border border-[#1b2b3f] text-[#89929b] font-mono text-[10px]">
                  Algorithme SM-2 • Répétition Espacée
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-[#d3e4fe]">
                  {isFr ? 'Sprint de Récupération des Points Faibles' : 'Weak Points Recovery Sprint'}
                </h2>
                <p className="text-xs text-[#bfc7d2] leading-relaxed max-w-xl">
                  {isFr 
                    ? 'L\'IA a identifié 15 questions critiques échouées cette semaine, principalement ciblées sur les clauses GROUP BY, les filtres HAVING et les agrégations imbriquées Oracle SQL.'
                    : 'AI identified 15 critical questions failed this week, focusing heavily on Oracle SQL GROUP BY clauses, HAVING filters, and nested aggregations.'}
                </p>
              </div>

              {/* Quiz Highlights */}
              <div className="grid grid-cols-3 gap-3 py-1">
                <div className="flex flex-col p-2.5 rounded-lg bg-[#000f21]/70 border border-[#1b2b3f]">
                  <span className="font-mono text-[9px] text-[#89929b] uppercase font-medium">Questions</span>
                  <span className="font-mono text-base font-bold text-[#d3e4fe]">15 {isFr ? 'items' : 'items'}</span>
                </div>
                <div className="flex flex-col p-2.5 rounded-lg bg-[#000f21]/70 border border-[#1b2b3f]">
                  <span className="font-mono text-[9px] text-[#89929b] uppercase font-medium">
                    {isFr ? 'Temps Estimé' : 'Estimated Time'}
                  </span>
                  <span className="font-mono text-base font-bold text-[#d3e4fe]">15 min</span>
                </div>
                <div className="flex flex-col p-2.5 rounded-lg bg-[#000f21]/70 border border-[#1b2b3f]">
                  <span className="font-mono text-[9px] text-[#89929b] uppercase font-medium">
                    {isFr ? 'Impact Estimé' : 'Estimated Impact'}
                  </span>
                  <span className="font-mono text-base font-bold text-[#4edea3]">+3.8% {isFr ? 'score' : 'score'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  id="launch-smart-quiz-btn"
                  onClick={handleLaunchQuiz}
                  disabled={isLaunchingQuiz}
                  className="flex-1 py-2.5 px-4 bg-[#3198dc] text-[#002c47] font-semibold text-xs rounded-lg hover:bg-[#93ccff] active:scale-[0.99] shadow-lg shadow-[#3198dc]/20 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {isLaunchingQuiz 
                      ? (isFr ? 'Génération du quiz adaptatif...' : 'Generating quiz...') 
                      : (isFr ? 'Lancer le Quiz Intelligent (15 min)' : 'Launch Smart Quiz (15 min)')}
                  </span>
                </button>
                <button 
                  onClick={() => onNavigate('syllabus')}
                  className="py-2.5 px-3.5 bg-[#000f21] border border-[#1b2b3f] text-[#bfc7d2] hover:text-[#d3e4fe] text-xs font-medium rounded-lg hover:bg-[#1b2b3f] transition-all flex items-center justify-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Personnaliser' : 'Customize'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* STATISTIQUES DE TEMPS DE RÉPONSE & EXACTITUDE PAR SUJET */}
          <ResponseTimeAnalyticsCard
            lang={lang}
            compact={false}
            onOpenTargetedSession={onOpenTargetedSession}
            onNavigateToStats={() => onNavigate('analytics')}
          />

          {/* DÉMONSTRATION INTERACTIVE DE LA FONCTIONNALITÉ « EXPLIQUE-MOI » (3 NIVEAUX PROGRESSIFS) */}
          <div className="bg-[#102034] p-5 rounded-xl border border-[#3198dc]/40 shadow-lg flex flex-col gap-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1b2b3f]">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#0284c7]/20 text-[#38bdf8] font-mono text-[11px] font-bold border border-[#0284c7]/30">
                  SQL › JOIN
                </span>
                <span className="font-bold text-sm text-[#d3e4fe]">
                  {isFr
                    ? 'Question Flash — Assistance graduée « Explique-moi » (💡 Indice ➔ 🧠 Explication ➔ 📖 Cours)'
                    : 'Flash Question — “Explain to me” 3-Tier Progressive Help'}
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#4edea3]">
                {isFr ? 'Sans dévoiler immédiatement la réponse' : 'Without immediately spoiling the answer'}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-[#d3e4fe] leading-relaxed">
              {isFr
                ? 'On souhaite lister TOUS les départements, y compris ceux sans employé actif, en affichant uniquement les employés dont le statut est ACTIVE. Quelle requête est correcte ?'
                : 'We want to list ALL departments, including those with no active employees, showing only employees whose status is ACTIVE. Which query is correct?'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDemoJoinAnswer('A')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  demoJoinAnswer === 'A'
                    ? 'bg-[#ef4444]/15 border-[#ef4444] text-[#ffb4ab]'
                    : 'bg-[#000f21] border-[#1b2b3f] text-[#bfc7d2] hover:border-[#38bdf8]'
                }`}
              >
                <span className="font-bold text-[#38bdf8] block mb-1">Option A :</span>
                <code>LEFT JOIN employees e ON d.id = e.dept_id WHERE e.status = 'ACTIVE'</code>
              </button>
              <button
                type="button"
                onClick={() => setDemoJoinAnswer('B')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  demoJoinAnswer === 'B'
                    ? 'bg-[#10b981]/15 border-[#4edea3] text-[#4edea3]'
                    : 'bg-[#000f21] border-[#1b2b3f] text-[#bfc7d2] hover:border-[#38bdf8]'
                }`}
              >
                <span className="font-bold text-[#38bdf8] block mb-1">Option B :</span>
                <code>LEFT JOIN employees e ON d.id = e.dept_id AND e.status = 'ACTIVE'</code>
              </button>
            </div>

            <ProgressiveExplainPanel
              questionId="dashboard-demo-join-q1"
              topic="SQL"
              subtopic="JOIN"
              trapName="LEFT vs INNER JOIN"
              promptText="On souhaite lister TOUS les départements, y compris ceux sans employé actif."
              explanationText="L'Option B place la condition e.status = 'ACTIVE' dans la clause ON du LEFT JOIN, ce qui préserve les départements sans employé actif (complétés par NULL)."
              correctOptionLetter="B"
              correctOptionText="LEFT JOIN employees e ON d.id = e.dept_id AND e.status = 'ACTIVE'"
              hasSelectedAnswer={demoJoinAnswer !== null}
              onRevealSolution={() => setDemoJoinAnswer('B')}
              lang={lang}
              theme="dark"
              defaultOpenLevel="hint"
            />
          </div>

          {/* RECENT PRACTICE EXAM SESSIONS & SCORE CHART */}
          <div className="bg-[#102034] p-5 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-[#d3e4fe]">
                  {isFr ? 'Sessions d\'Examens Blancs Récents' : 'Recent Practice Exam Sessions'}
                </h3>
                <p className="text-xs text-[#89929b]">
                  {isFr ? 'Évolution de votre performance sur les 5 dernières simulations chronométrées' : 'Performance trend across the last 5 timed simulations'}
                </p>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px]">
                <span className="flex items-center gap-1.5 text-[#4edea3]">
                  <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span> Oracle SQL
                </span>
                <span className="flex items-center gap-1.5 text-[#89ceff]">
                  <span className="w-2 h-2 rounded-full bg-[#89ceff]"></span> Azure Data
                </span>
              </div>
            </div>

            {/* Inline SVG Visual Trend Chart */}
            <div className="w-full bg-[#0b1c30] p-4 rounded-xl border border-[#1b2b3f] flex flex-col gap-3">
              <div className="relative h-44 w-full flex items-end">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 140">
                  {/* Background Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#1b2b3f" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#1b2b3f" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#1b2b3f" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Passing Threshold (70% -> y=45) */}
                  <line x1="0" y1="45" x2="500" y2="45" stroke="#3f4850" strokeWidth="1.5" strokeDasharray="2 2" />
                  <text x="8" y="41" fill="#89929b" fontSize="10" className="font-mono">
                    70% {isFr ? 'Seuil de Réussite' : 'Passing Score'}
                  </text>

                  {/* Gradient Fill under curve */}
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4edea3" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4edea3" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path d="M 25,95 L 140,82 L 255,102 L 370,68 L 475,32 L 475,140 L 25,140 Z" fill="url(#scoreGrad)" />

                  {/* Main Trend Line (Scores: 62% -> 72% -> 68% -> 84% -> 91%) */}
                  <path
                    d="M 25,95 L 140,82 L 255,102 L 370,68 L 475,32"
                    fill="none"
                    stroke="#4edea3"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  <circle cx="25" cy="95" r="4" fill="#031427" stroke="#4edea3" strokeWidth="2" />
                  <circle cx="140" cy="82" r="4" fill="#031427" stroke="#4edea3" strokeWidth="2" />
                  <circle cx="255" cy="102" r="4" fill="#031427" stroke="#ffb4ab" strokeWidth="2" />
                  <circle cx="370" cy="68" r="4" fill="#031427" stroke="#4edea3" strokeWidth="2" />
                  <circle cx="475" cy="32" r="6" fill="#4edea3" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>

              <div className="flex justify-between font-mono text-[10px] text-[#89929b] px-1">
                <span>02 Fév (62%)</span>
                <span>08 Fév (72%)</span>
                <span>12 Fév (68%)</span>
                <span>17 Fév (84%)</span>
                <span className="text-[#4edea3] font-bold">{isFr ? 'Hier (91%)' : 'Yesterday (91%)'}</span>
              </div>
            </div>

            {/* History Table Rows */}
            <div className="flex flex-col gap-2">
              {examHistory.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onNavigate('exams')}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0b1c30] hover:bg-[#1b2b3f] transition-all border border-[#1b2b3f] cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded bg-[#4edea3]/10 text-[#4edea3] font-mono text-xs font-bold border border-[#4edea3]/20">
                      {item.score}%
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#d3e4fe] group-hover:text-[#93ccff] transition-colors">
                        {item.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#89929b]">
                        {item.date} • {item.questions} questions • {item.duration}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-[#4edea3]/15 text-[#4edea3] font-mono text-[10px] font-bold">
                      {item.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#89929b] group-hover:text-[#d3e4fe] transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* WEEKLY GOAL CARD */}
          <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#4edea3]" />
                <h3 className="text-sm font-bold text-[#d3e4fe]">
                  {isFr ? 'Objectif Hebdomadaire' : 'Weekly Goal'}
                </h3>
              </div>
              <span className="font-mono text-xs text-[#4edea3] font-bold">4 / 5 {isFr ? 'jours' : 'days'}</span>
            </div>
            <p className="text-xs text-[#bfc7d2] leading-relaxed">
              {isFr 
                ? 'Plus qu\'une session pour valider votre régularité et décrocher le badge ' 
                : 'Just one more session to complete your streak and unlock the '}
              <strong className="text-[#93ccff]">DBA Consistency</strong>.
            </p>

            {/* Day tracker circles */}
            <div className="grid grid-cols-7 gap-1 py-1">
              {days.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="font-mono text-[10px] text-[#89929b]">{d.label}</span>
                  <div 
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all shadow-sm ${
                      d.completed
                        ? 'bg-[#4edea3] text-[#003824]'
                        : d.current
                        ? 'bg-[#3198dc] text-[#002c47] ring-2 ring-[#93ccff]/50 animate-pulse'
                        : 'bg-[#1b2b3f] text-[#89929b]'
                    }`}
                  >
                    {d.completed ? '✓' : d.current ? '●' : '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MES FAIBLESSES (CIBLÉES PAR IA) */}
          <div className="bg-[#102034] p-4.5 rounded-xl border border-[#3198dc]/35 shadow-lg flex flex-col gap-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" />
                <h3 className="text-sm font-bold text-[#d3e4fe]">
                  {isFr ? 'Mes faiblesses' : 'My Weaknesses'}
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[#38bdf8] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#38bdf8]" />
                Gemini 3.8
              </span>
            </div>

            <div className="flex flex-col gap-2.5 font-mono text-xs">
              {/* JOIN */}
              {(() => {
                const joinComp = competencies.find((c) => c.id === 'join') || { currentScore: 54 };
                const score = joinComp.currentScore;
                const barColor = score >= 70 ? '#10b981' : score >= 60 ? '#f59e0b' : '#38bdf8';
                return (
                  <div className="p-2.5 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-1.5 hover:border-[#38bdf8]/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#d3e4fe] tracking-wide">JOIN</span>
                      <span className="font-extrabold text-sm" style={{ color: barColor }}>{score} %</span>
                    </div>
                    <div className="w-full bg-[#000f21] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: barColor }}></div>
                    </div>
                  </div>
                );
              })()}

              {/* Subqueries */}
              {(() => {
                const subComp = competencies.find((c) => c.id === 'subqueries') || { currentScore: 47 };
                const score = subComp.currentScore;
                const barColor = score >= 70 ? '#10b981' : score >= 60 ? '#f59e0b' : '#f43f5e';
                return (
                  <div className="p-2.5 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-1.5 hover:border-[#f43f5e]/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#d3e4fe] tracking-wide">Subqueries</span>
                      <span className="font-extrabold text-sm" style={{ color: barColor }}>{score} %</span>
                    </div>
                    <div className="w-full bg-[#000f21] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: barColor }}></div>
                    </div>
                  </div>
                );
              })()}

              {/* Indexes */}
              {(() => {
                const idxComp = competencies.find((c) => c.id === 'indexes') || { currentScore: 61 };
                const score = idxComp.currentScore;
                const barColor = score >= 70 ? '#10b981' : score >= 60 ? '#fbbf24' : '#f43f5e';
                return (
                  <div className="p-2.5 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-1.5 hover:border-[#fbbf24]/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#d3e4fe] tracking-wide">Indexes</span>
                      <span className="font-extrabold text-sm" style={{ color: barColor }}>{score} %</span>
                    </div>
                    <div className="w-full bg-[#000f21] h-1.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: barColor }}></div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* [Créer une séance personnalisée] */}
            <button 
              id="dashboard-create-targeted-session-btn"
              onClick={() => {
                if (onOpenTargetedSession) {
                  onOpenTargetedSession();
                }
              }}
              className="mt-1 w-full py-2.5 px-3.5 bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0284c7] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-extrabold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-md shadow-[#0284c7]/20 active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{isFr ? 'Créer une séance personnalisée' : 'Create Personalized Session'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SYSTÈME DE PIÈGES DE CERTIFICATION */}
          <TrapDiagnosticsCard
            lang={lang}
            theme="dark"
            onOpenTargetedSession={onOpenTargetedSession}
            onOpenTrapExplorer={() => setIsTrapExplorerOpen(true)}
          />

          {/* QUICK SHORTCUTS & UTILITIES */}
          <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#93ccff]" />
              <h3 className="text-sm font-bold text-[#d3e4fe]">
                {isFr ? 'Raccourcis Pratiques' : 'Quick Shortcuts'}
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => onNavigate('skills')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0b1c30] hover:bg-[#1b2b3f] border border-[#1b2b3f] transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#0284c7]/20 text-[#38bdf8]">
                    <Network className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#d3e4fe] group-hover:text-[#38bdf8] transition-colors">
                      {isFr ? 'Skill Map SQL (Arborescence & 4D)' : 'SQL Skill Map (Tree & 4D Metrics)'}
                    </span>
                    <span className="font-mono text-[10px] text-[#89929b]">
                      {isFr ? 'Connaissance, Exactitude, Rapidité et Régularité' : 'Knowledge, Accuracy, Speed and Consistency'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#89929b] group-hover:text-[#d3e4fe]" />
              </button>

              <button 
                onClick={() => onNavigate('exams')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0b1c30] hover:bg-[#1b2b3f] border border-[#1b2b3f] transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#4edea3]/10 text-[#4edea3]">
                    <Play className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#d3e4fe] group-hover:text-[#93ccff] transition-colors">
                      {isFr ? 'Mode Blitz (5 min)' : 'Blitz Mode (5 min)'}
                    </span>
                    <span className="font-mono text-[10px] text-[#89929b]">
                      {isFr ? '10 questions chrono sans indice' : '10 timed questions without hints'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#89929b] group-hover:text-[#d3e4fe]" />
              </button>

              <button 
                onClick={() => onNavigate('flashcards')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0b1c30] hover:bg-[#1b2b3f] border border-[#1b2b3f] transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#93ccff]/10 text-[#93ccff]">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#d3e4fe] group-hover:text-[#93ccff] transition-colors">
                      {isFr ? 'Flashcards Mémorisation' : 'Mastery Flashcards'}
                    </span>
                    <span className="font-mono text-[10px] text-[#89929b]">
                      {isFr ? '2400+ cartes interactives (Oracle SQL, Azure DP-900/DP-300, Postgres EDB & MySQL 8.0 DBA)' : '2400+ interactive cards (Oracle SQL, Azure DP-900/DP-300, Postgres EDB & MySQL 8.0 DBA)'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#89929b] group-hover:text-[#d3e4fe]" />
              </button>

              <button 
                onClick={() => onNavigate('glossary')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0b1c30] hover:bg-[#1b2b3f] border border-[#1b2b3f] transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#4edea3]/10 text-[#4edea3]">
                    <BookMarked className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#d3e4fe] group-hover:text-[#4edea3] transition-colors">
                      {isFr ? 'Glossaire SQL (8 Catégories)' : 'SQL Glossary (8 Categories)'}
                    </span>
                    <span className="font-mono text-[10px] text-[#89929b]">
                      {isFr ? 'Concepts, contraintes, commandes DDL/DML, dialectes & astuces' : 'Core concepts, constraints, DDL/DML commands, dialects & tips'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#89929b] group-hover:text-[#d3e4fe]" />
              </button>

              <button 
                onClick={() => onNavigate('sandbox')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0b1c30] hover:bg-[#1b2b3f] border border-[#1b2b3f] transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#89ceff]/10 text-[#89ceff]">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#d3e4fe] group-hover:text-[#93ccff] transition-colors">
                      {isFr ? 'Console Sandbox Interactive' : 'Live Sandbox Console'}
                    </span>
                    <span className="font-mono text-[10px] text-[#89929b]">
                      PostgreSQL v16.2 scratchpad
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#89929b] group-hover:text-[#d3e4fe]" />
              </button>
            </div>
          </div>

          {/* MOTIVATIONAL COMMUNITY STRIP */}
          <div className="bg-[#0b1c30] p-4 rounded-xl border border-[#1b2b3f] flex items-center gap-3.5 shadow-inner">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#006398] to-[#4edea3] flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6 text-[#002c47]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#d3e4fe]">
                {isFr ? 'Top 8% des Candidats' : 'Top 8% of Candidates'}
              </span>
              <span className="text-[11px] text-[#bfc7d2] leading-tight">
                {isFr 
                  ? 'Votre vitesse de résolution moyenne est 1.4x plus rapide que la cohorte.' 
                  : 'Your average resolution speed is 1.4x faster than the cohort.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. OFFICIAL CERTIFICATION SYLLABI & PROGRAMS REPOSITORY */}
      <div id="official-syllabi-section" className="bg-[#102034] p-6 rounded-xl border border-[#1b2b3f] shadow-lg flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2b3f] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1b2b3f] flex items-center justify-center text-[#93ccff] border border-[#26364a]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#d3e4fe]">
                {isFr ? 'Programmes & Référentiels d\'Épreuve Officiels' : 'Official Certification Syllabi & Exam Objectives'}
              </h2>
              <p className="text-xs text-[#bfc7d2]">
                {isFr 
                  ? 'Liens directs vers les objectifs d\'évaluation, guides d\'étude et plateformes d\'examen des organismes certificateurs.'
                  : 'Direct links to official exam objectives, study guides, and registration portals from certification bodies.'}
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-[#4edea3] bg-[#003824]/40 px-2.5 py-1 rounded-full border border-[#4edea3]/30 font-semibold">
            {isFr ? '5 Référentiels Certifiés' : '5 Certified Syllabi'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificationProgramsCatalog.map((prog) => (
            <div 
              key={prog.id}
              className="bg-[#0b1c30] p-4 rounded-xl border border-[#1b2b3f] hover:border-[#26364a] transition-all flex flex-col justify-between gap-3 shadow-sm group"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span 
                    className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border"
                    style={{ 
                      backgroundColor: `${prog.accentColor}15`, 
                      color: prog.accentColor,
                      borderColor: `${prog.accentColor}30` 
                    }}
                  >
                    {prog.providerBadge}
                  </span>
                  <span className="font-mono text-[11px] text-[#89929b] font-semibold">
                    {prog.code}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#d3e4fe] group-hover:text-[#93ccff] transition-colors leading-snug">
                    {prog.name}
                  </h3>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-[#89929b] mt-1 flex-wrap">
                    <span>{isFr ? 'Niveau:' : 'Level:'} {prog.level}</span>
                    <span>•</span>
                    <span>{isFr ? 'Seuil:' : 'Pass:'} {prog.passingScore}</span>
                    <span>•</span>
                    <span>{prog.duration}</span>
                  </div>
                </div>

                <p className="text-xs text-[#bfc7d2] leading-relaxed line-clamp-3">
                  {isFr ? prog.description.fr : prog.description.en}
                </p>

                {/* Key official domains */}
                <div className="bg-[#000f21] p-2.5 rounded-lg border border-[#1b2b3f] flex flex-col gap-1.5">
                  <span className="font-mono text-[9px] text-[#89929b] uppercase font-semibold">
                    {isFr ? 'Piliers du programme officiel' : 'Core Syllabus Domains'}
                  </span>
                  <div className="flex flex-col gap-1">
                    {prog.keyDomains.slice(0, 3).map((dom, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-[#bfc7d2] truncate max-w-[200px]">
                          {isFr ? dom.titleFr : dom.titleEn}
                        </span>
                        <span className="font-mono text-[10px] text-[#93ccff] font-semibold">{dom.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#1b2b3f]">
                <a
                  href={prog.officialSyllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-[#1b2b3f] hover:bg-[#26364a] text-[#93ccff] hover:text-[#d3e4fe] border border-[#26364a] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                  title={isFr ? `Accéder au programme officiel ${prog.name}` : `Open official curriculum for ${prog.name}`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Programme officiel' : 'Official Syllabus'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {prog.studyGuideUrl && (
                  <a
                    href={prog.studyGuideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#000f21] hover:bg-[#1b2b3f] text-[#bfc7d2] hover:text-[#d3e4fe] border border-[#1b2b3f] rounded-lg transition-colors shrink-0"
                    title={isFr ? "Guide d'étude & préparation officiel" : "Official Study Guide"}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#89ceff]" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL OBSERVATOIRE DES PIÈGES */}
      <TrapExplorerModal
        isOpen={isTrapExplorerOpen}
        onClose={() => setIsTrapExplorerOpen(false)}
        lang={lang}
        theme="dark"
        onLaunchTargetedSession={() => {
          setIsTrapExplorerOpen(false);
          if (onOpenTargetedSession) {
            onOpenTargetedSession();
          }
        }}
      />
    </div>
  );
};
