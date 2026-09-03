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
  BookOpen
} from 'lucide-react';
import { certificationTracks, examHistory, certificationProgramsCatalog } from '../data/mockData';
import { NavigationTab, CertificationTrackId } from '../types';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onSelectTrack: (id: CertificationTrackId) => void;
  lang: 'fr' | 'en';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectTrack,
  lang,
}) => {
  const isFr = lang === 'fr';
  const [isLaunchingQuiz, setIsLaunchingQuiz] = useState(false);
  const [quizNotice, setQuizNotice] = useState<string | null>(null);

  const handleLaunchQuiz = () => {
    setIsLaunchingQuiz(true);
    setTimeout(() => {
      setIsLaunchingQuiz(false);
      setQuizNotice(
        isFr 
          ? 'Quiz adaptatif 1Z0-071 généré (15 questions). Redirection vers l\'examen...' 
          : 'Smart Quiz 1Z0-071 generated (15 items). Redirecting to exam session...'
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

        {/* Quick Status Strip */}
        <div className="flex items-center gap-2 bg-[#0b1c30] p-1.5 rounded-xl border border-[#1b2b3f] shadow-md shrink-0">
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
            {isFr ? '4 cursus actifs' : '4 active tracks'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {certificationTracks.map((track) => {
            const isOracle = track.id === 'oracle-1z0-071';
            const isAzure = track.id === 'azure-dp-900';
            const isPostgres = track.id === 'postgres-edb';

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

            return (
              <div 
                key={track.id}
                className="relative bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col justify-between hover:border-[#26364a] hover:bg-[#1b2b3f]/50 transition-all group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-[#000f21] border border-[#1b2b3f] flex items-center justify-center p-2 shadow-inner">
                      {isOracle ? (
                        <Database className="w-5 h-5 text-[#ffb4ab]" />
                      ) : isAzure ? (
                        <Cloud className="w-5 h-5 text-[#89ceff]" />
                      ) : isPostgres ? (
                        <Terminal className="w-5 h-5 text-[#4edea3]" />
                      ) : (
                        <Activity className="w-5 h-5 text-[#f59e0b]" />
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-semibold tracking-wider uppercase ${badgeStyle}`}>
                      {badgeText}
                    </span>
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
                        backgroundColor: isOracle ? '#4edea3' : isAzure ? '#89ceff' : '#93ccff' 
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
                      isOracle 
                        ? 'bg-[#3198dc] text-[#002c47] hover:bg-[#93ccff] shadow-sm'
                        : 'bg-[#26364a] text-[#d3e4fe] hover:bg-[#1b2b3f] hover:text-[#93ccff]'
                    }`}
                  >
                    <span>
                      {isOracle ? (isFr ? 'Reprendre la révision' : 'Resume Training') : (isFr ? 'Continuer le module' : 'Continue')}
                    </span>
                    {isOracle ? <Play className="w-3.5 h-3.5 fill-current" /> : <ArrowRight className="w-3.5 h-3.5" />}
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

          {/* TOP WEAK POINTS TO REINFORCE */}
          <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" />
                <h3 className="text-sm font-bold text-[#d3e4fe]">
                  {isFr ? 'Points Faibles Ciblés' : 'Targeted Weak Points'}
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[#89929b]">Précision &lt; 60%</span>
            </div>

            <div className="flex flex-col gap-2">
              {/* Weak point 1 */}
              <div className="p-2.5 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-1.5 hover:bg-[#1b2b3f] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#d3e4fe]">
                    {isFr ? 'Vues Matérialisées & Fast Refresh' : 'Materialized Views & Fast Refresh'}
                  </span>
                  <span className="font-mono text-xs text-[#ffb4ab] font-bold">45%</span>
                </div>
                <div className="w-full bg-[#000f21] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#ffb4ab] h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
                <span className="font-mono text-[10px] text-[#89929b]">Oracle 1Z0-071 • 14 {isFr ? 'erreurs' : 'errors'}</span>
              </div>

              {/* Weak point 2 */}
              <div className="p-2.5 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-1.5 hover:bg-[#1b2b3f] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#d3e4fe]">
                    {isFr ? 'Azure Role-Based Access Control' : 'Azure Role-Based Access Control'}
                  </span>
                  <span className="font-mono text-xs text-[#89ceff] font-bold">52%</span>
                </div>
                <div className="w-full bg-[#000f21] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#89ceff] h-full rounded-full" style={{ width: '52%' }}></div>
                </div>
                <span className="font-mono text-[10px] text-[#89929b]">Azure DP-900 • 9 {isFr ? 'erreurs' : 'errors'}</span>
              </div>

              {/* Weak point 3 */}
              <div className="p-2.5 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-1.5 hover:bg-[#1b2b3f] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#d3e4fe]">
                    {isFr ? 'Indexation B-Tree vs Hash' : 'B-Tree vs Hash Indexing'}
                  </span>
                  <span className="font-mono text-xs text-[#89ceff] font-bold">58%</span>
                </div>
                <div className="w-full bg-[#000f21] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#89ceff] h-full rounded-full" style={{ width: '58%' }}></div>
                </div>
                <span className="font-mono text-[10px] text-[#89929b]">PostgreSQL & MySQL • 8 {isFr ? 'erreurs' : 'errors'}</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('syllabus')}
              className="mt-1 w-full py-2 px-3 bg-[#1b2b3f] hover:bg-[#26364a] text-[#93ccff] font-mono text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-[#26364a]"
            >
              <span>{isFr ? 'Drills de Révision Ciblée' : 'Targeted Remediation Drills'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

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
                onClick={() => onNavigate('syllabus')}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0b1c30] hover:bg-[#1b2b3f] border border-[#1b2b3f] transition-colors text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#93ccff]/10 text-[#93ccff]">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#d3e4fe] group-hover:text-[#93ccff] transition-colors">
                      {isFr ? 'Flashcards Syntaxe SQL' : 'SQL Syntax Flashcards'}
                    </span>
                    <span className="font-mono text-[10px] text-[#89929b]">
                      {isFr ? '142 cartes mémos Oracle & ANSI' : '142 cheat-sheet cards Oracle & ANSI'}
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
    </div>
  );
};
