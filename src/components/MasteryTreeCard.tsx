import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Target,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Brain,
  Filter,
  RefreshCw,
  Award,
  Layers
} from 'lucide-react';
import {
  MasteryTreeData,
  MasteryDomain,
  MasterySubtopic,
  MasteryStatus,
  loadMasteryTree,
  getMasteryDiagnostic,
  MasteryDiagnosticSummary,
  resetMasteryTree
} from '../services/masteryTreeService';

interface MasteryTreeCardProps {
  lang: 'fr' | 'en';
  onStartTargetedTopic?: (subtopicId: string, topicName: string) => void;
  onNavigateToSyllabus?: () => void;
  compactMode?: boolean;
}

export const MasteryTreeCard: React.FC<MasteryTreeCardProps> = ({
  lang,
  onStartTargetedTopic,
  onNavigateToSyllabus,
  compactMode = false,
}) => {
  const isFr = lang === 'fr';
  const [treeData, setTreeData] = useState<MasteryTreeData>(() => loadMasteryTree());
  const [filterMode, setFilterMode] = useState<'all' | 'mastered' | 'gaps' | 'in_progress'>('all');
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({
    sql: true,
    modelisation: true,
    transactions: true,
    indexation: true,
    administration: true,
  });
  const [selectedSubtopic, setSelectedSubtopic] = useState<MasterySubtopic | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setTreeData(loadMasteryTree());
    };
    window.addEventListener('dbmastery:mastery_updated', handleUpdate);
    window.addEventListener('dbmastery:competencies_recalculated', handleUpdate);
    return () => {
      window.removeEventListener('dbmastery:mastery_updated', handleUpdate);
      window.removeEventListener('dbmastery:competencies_recalculated', handleUpdate);
    };
  }, []);

  const diagnostic: MasteryDiagnosticSummary = getMasteryDiagnostic(treeData);

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  const getStatusBadge = (status: MasteryStatus, score: number) => {
    switch (status) {
      case 'mastered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#003824]/80 text-[#4edea3] border border-[#4edea3]/40">
            <CheckCircle2 className="w-3 h-3 text-[#4edea3]" />
            {isFr ? 'Maîtrisé' : 'Mastered'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#002c47]/80 text-[#38bdf8] border border-[#38bdf8]/40">
            <TrendingUp className="w-3 h-3 text-[#38bdf8]" />
            {isFr ? 'Solide / En cours' : 'Solid / Learning'}
          </span>
        );
      case 'critical_gap':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#3d000a]/80 text-[#f43f5e] border border-[#f43f5e]/50 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-[#f43f5e]" />
            {isFr ? 'Lacune critique' : 'Critical Gap'}
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#4edea3]';
    if (score >= 65) return 'text-[#38bdf8]';
    return 'text-[#f43f5e]';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-gradient-to-r from-[#00a572] to-[#4edea3]';
    if (score >= 65) return 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8]';
    return 'bg-gradient-to-r from-[#be123c] to-[#f43f5e]';
  };

  // Filtrage des sous-sujets selon l'onglet sélectionné
  const filterSubtopic = (sub: MasterySubtopic): boolean => {
    if (filterMode === 'all') return true;
    if (filterMode === 'mastered') return sub.status === 'mastered';
    if (filterMode === 'gaps') return sub.status === 'critical_gap';
    if (filterMode === 'in_progress') return sub.status === 'in_progress';
    return true;
  };

  const handleLaunchSubtopicTraining = (sub: MasterySubtopic) => {
    if (onStartTargetedTopic) {
      onStartTargetedTopic(sub.id, sub.name);
    } else {
      window.dispatchEvent(
        new CustomEvent('dbmastery:open_targeted_session', {
          detail: { subtopicId: sub.id, topicName: sub.name },
        })
      );
    }
  };

  return (
    <div
      id="mastery-tree-card"
      className="w-full bg-[#102034] rounded-2xl border border-[#1b2b3f] shadow-2xl p-5 lg:p-7 flex flex-col gap-6 relative overflow-hidden transition-all"
    >
      {/* Glow d'ambiance en arrière-plan */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0284c7]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* HEADER : Titre MON NIVEAU & Diagnostic global */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1b2b3f] pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#002c47] to-[#0284c7]/40 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] shrink-0 shadow-lg shadow-[#0284c7]/20">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[#1b2b3f] text-[#38bdf8] border border-[#26364a]">
                {isFr ? 'Cœur de la Progression' : 'Core Progression Engine'}
              </span>
              <span className="text-[10px] font-mono text-[#4edea3] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                {treeData.totalQuestionsAnalyzed} {isFr ? 'questions analysées' : 'questions analyzed'}
              </span>
            </div>
            <h2 className="text-2xl font-bold font-mono text-[#d3e4fe] tracking-tight flex items-center gap-3">
              <span>{isFr ? 'MON NIVEAU' : 'MY LEVEL & MASTERY'}</span>
              <span className="text-xl px-2.5 py-0.5 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] text-[#4edea3] font-mono font-bold">
                {treeData.overallScore}%
              </span>
            </h2>
            <p className="text-xs text-[#bfc7d2] max-w-2xl leading-relaxed">
              {isFr
                ? 'L\'application sait exactement ce que vous maîtrisez et ce que vous ne maîtrisez pas, décomposé par arbre hiérarchique de compétences.'
                : 'The system diagnoses exactly what you have mastered and what you have not, decomposed by a hierarchical skill tree.'}
            </p>
          </div>
        </div>

        {/* Bouton d'action rapide sur la lacune prioritaire et Diagnostic Initial */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('dbmastery:open_initial_diagnostic'))}
            className="px-3.5 py-2.5 rounded-xl bg-[#001f38] hover:bg-[#002f54] text-[#38bdf8] hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-2 border border-[#38bdf8]/40 shadow-md shadow-[#0284c7]/20 transition-all cursor-pointer whitespace-nowrap"
            title={isFr ? 'Passer ou refaire le diagnostic initial de 20 questions' : 'Take or retake the 20-question initial diagnostic'}
          >
            <Brain className="w-4 h-4 text-[#38bdf8]" />
            <span>{isFr ? '🎯 Diagnostic Initial (20Q)' : '🎯 Initial Diagnostic (20Q)'}</span>
          </button>

          <button
            onClick={() => handleLaunchSubtopicTraining(diagnostic.topPriorityWeakness)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#be123c] to-[#f43f5e] hover:from-[#e11d48] hover:to-[#fb7185] text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#f43f5e]/25 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>
              {isFr
                ? `Travailler ma pire lacune : ${diagnostic.topPriorityWeakness.name} (${diagnostic.topPriorityWeakness.score}%)`
                : `Drill Priority Gap: ${diagnostic.topPriorityWeakness.name} (${diagnostic.topPriorityWeakness.score}%)`}
            </span>
          </button>
        </div>
      </div>

      {/* DIAGNOSTIC PANEL : Ce que vous maîtrisez vs Ce que vous ne maîtrisez pas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Colonne Gauche : CE QUE JE MAÎTRISE */}
        <div className="p-3.5 rounded-xl bg-[#002417]/40 border border-[#00a572]/40 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#003824] text-[#4edea3] shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold font-mono text-[#4edea3] uppercase tracking-wider">
                {isFr ? 'Ce que vous maîtrisez (Acquis)' : 'What you have mastered (Solid)'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/30 font-bold">
                {diagnostic.masteredSubtopics.length} {isFr ? 'notions' : 'skills'}
              </span>
            </div>
            <p className="text-[11px] text-[#d3e4fe] leading-relaxed">
              {diagnostic.strengthsSummaryFr}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {diagnostic.masteredSubtopics.map((sub) => (
                <span
                  key={sub.id}
                  className="px-2 py-0.5 rounded bg-[#0b1c30] text-[#4edea3] text-[10px] font-mono border border-[#4edea3]/30"
                >
                  ✓ {sub.name} <strong className="ml-1">{sub.score}%</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne Droite : CE QUE JE NE MAÎTRISE PAS */}
        <div className="p-3.5 rounded-xl bg-[#2e0008]/40 border border-[#f43f5e]/40 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#3d000a] text-[#f43f5e] shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold font-mono text-[#f43f5e] uppercase tracking-wider">
                {isFr ? 'Ce que vous ne maîtrisez pas (Lacunes)' : 'What you do not master (Gaps)'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f43f5e]/20 text-[#f43f5e] border border-[#f43f5e]/30 font-bold">
                {diagnostic.criticalGapsSubtopics.length} {isFr ? 'urgences' : 'gaps'}
              </span>
            </div>
            <p className="text-[11px] text-[#ffb4ab] leading-relaxed">
              {diagnostic.gapsSummaryFr}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {diagnostic.criticalGapsSubtopics.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleLaunchSubtopicTraining(sub)}
                  className="px-2 py-0.5 rounded bg-[#0b1c30] hover:bg-[#3d000a] text-[#f43f5e] text-[10px] font-mono border border-[#f43f5e]/30 flex items-center gap-1 transition-colors cursor-pointer"
                  title={isFr ? 'Cliquer pour vous entraîner sur cette notion' : 'Click to drill this skill'}
                >
                  ⚠ {sub.name} <strong className="ml-1 text-[#ffb4ab]">{sub.score}%</strong>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] text-xs font-mono">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              filterMode === 'all'
                ? 'bg-[#0284c7] text-white shadow'
                : 'text-[#89929b] hover:text-[#d3e4fe]'
            }`}
          >
            {isFr ? 'Arbre Complet (5 Domaines)' : 'Full Tree (5 Domains)'}
          </button>
          <button
            onClick={() => setFilterMode('gaps')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
              filterMode === 'gaps'
                ? 'bg-[#be123c] text-white shadow'
                : 'text-[#f43f5e] hover:bg-[#be123c]/20'
            }`}
          >
            <span>{isFr ? 'Mes Lacunes Critiques' : 'Critical Gaps'}</span>
            <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px]">
              {diagnostic.criticalGapsSubtopics.length}
            </span>
          </button>
          <button
            onClick={() => setFilterMode('mastered')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
              filterMode === 'mastered'
                ? 'bg-[#00a572] text-white shadow'
                : 'text-[#4edea3] hover:bg-[#00a572]/20'
            }`}
          >
            <span>{isFr ? 'Notions Maîtrisées' : 'Mastered Skills'}</span>
            <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px]">
              {diagnostic.masteredSubtopics.length}
            </span>
          </button>
          <button
            onClick={() => setFilterMode('in_progress')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
              filterMode === 'in_progress'
                ? 'bg-[#0369a1] text-white shadow'
                : 'text-[#38bdf8] hover:bg-[#0369a1]/20'
            }`}
          >
            <span>{isFr ? 'En Consolidation' : 'In Progress'}</span>
            <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px]">
              {diagnostic.inProgressSubtopics.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#89929b]">
          <span className="hidden sm:inline">
            {isFr ? 'Astuce : Cliquez sur une notion pour lancer 5 questions ciblées' : 'Tip: Click any skill to drill 5 targeted questions'}
          </span>
        </div>
      </div>

      {/* ARBRE HIÉRARCHIQUE DE COMPÉTENCES (TREE STRUCTURE) */}
      <div className="flex flex-col gap-3 font-mono">
        {treeData.domains.map((domain) => {
          const visibleSubtopics = domain.subtopics.filter(filterSubtopic);
          const isExpanded = expandedDomains[domain.id] ?? true;

          // Si le filtre masque tous les sous-sujets et qu'on n'est pas en "all", on masque le domaine
          if (filterMode !== 'all' && visibleSubtopics.length === 0) {
            return null;
          }

          return (
            <div
              key={domain.id}
              className="rounded-xl bg-[#0b1c30]/90 border border-[#1b2b3f] overflow-hidden transition-all shadow-sm hover:border-[#26364a]"
            >
              {/* Entête du Domaine Parent (ex: SQL 82 %, Modélisation 74 %) */}
              <div
                onClick={() => toggleDomain(domain.id)}
                className="p-3.5 px-4 bg-[#0e2238] hover:bg-[#122b46] flex items-center justify-between gap-3 cursor-pointer select-none transition-colors border-b border-[#1b2b3f]/60"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="p-1 rounded text-[#89929b] hover:text-[#d3e4fe]"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#38bdf8]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#89929b]" />
                    )}
                  </button>
                  <span className="text-sm font-bold tracking-wide text-[#d3e4fe]">
                    {domain.name}
                  </span>
                  <span className="text-xs text-[#89929b] hidden md:inline">
                    • {domain.subtopics.length} {isFr ? 'sous-compétences' : 'subtopics'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Barre visuelle du domaine */}
                  <div className="hidden sm:flex items-center gap-2 w-32">
                    <div className="flex-1 h-2 rounded-full bg-[#1b2b3f] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getBarColor(domain.score)}`}
                        style={{ width: `${domain.score}%` }}
                      ></div>
                    </div>
                  </div>

                  <span className={`text-base font-bold font-mono ${getScoreColor(domain.score)}`}>
                    {domain.score} %
                  </span>

                  {getStatusBadge(domain.status, domain.score)}
                </div>
              </div>

              {/* Arbre des Sous-Sujets (avec connecteurs ├── et └──) */}
              {isExpanded && (
                <div className="divide-y divide-[#1b2b3f]/40 bg-[#071322]">
                  {visibleSubtopics.map((sub, idx) => {
                    const isLast = idx === visibleSubtopics.length - 1;
                    const isSelected = selectedSubtopic?.id === sub.id;

                    return (
                      <div
                        key={sub.id}
                        className={`p-3 px-4 pl-6 flex flex-col gap-2 transition-colors hover:bg-[#0d2035] ${
                          isSelected ? 'bg-[#0f243c]' : ''
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          {/* Branche et nom (ex: ├── SELECT, └── Subqueries) */}
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-sm text-[#38bdf8] font-mono select-none shrink-0">
                              {isLast ? '└──' : '├──'}
                            </span>
                            <span className="text-xs font-bold text-[#d3e4fe] tracking-wide">
                              {sub.name}
                            </span>
                            <span className="text-[11px] text-[#89929b] truncate hidden lg:inline max-w-sm">
                              ({sub.summaryFr})
                            </span>
                          </div>

                          {/* Statut, Score et Bouton d'action */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-7 sm:pl-0">
                            {/* Petite barre de progression sous-sujet */}
                            <div className="hidden md:flex items-center gap-2 w-24">
                              <div className="flex-1 h-1.5 rounded-full bg-[#1b2b3f] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getBarColor(sub.score)}`}
                                  style={{ width: `${sub.score}%` }}
                                ></div>
                              </div>
                            </div>

                            <span
                              className={`text-xs font-bold font-mono w-12 text-right ${getScoreColor(
                                sub.score
                              )}`}
                            >
                              {sub.score} %
                            </span>

                            {getStatusBadge(sub.status, sub.score)}

                            {/* Bouton pour s'entraîner directement sur cette notion */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLaunchSubtopicTraining(sub);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#1b2b3f] hover:bg-[#0284c7] text-[#93ccff] hover:text-white font-mono text-[11px] font-bold flex items-center gap-1 transition-colors border border-[#26364a] cursor-pointer"
                              title={
                                isFr
                                  ? `Lancer 5 questions ciblées sur ${sub.name}`
                                  : `Drill 5 questions on ${sub.name}`
                              }
                            >
                              <Zap className="w-3 h-3 text-[#38bdf8]" />
                              <span>{isFr ? 'S\'entraîner' : 'Drill'}</span>
                            </button>

                            {/* Déplier les détails pédagogiques */}
                            <button
                              onClick={() =>
                                setSelectedSubtopic((prev) => (prev?.id === sub.id ? null : sub))
                              }
                              className="text-[11px] text-[#89ceff] hover:underline"
                            >
                              {isSelected ? (isFr ? 'Masquer' : 'Hide') : (isFr ? 'Détails' : 'Details')}
                            </button>
                          </div>
                        </div>

                        {/* Volet détail déplié pour cette notion */}
                        {isSelected && (
                          <div className="mt-2 p-3 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] ml-6 flex flex-col gap-2 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-[#89929b] uppercase font-bold">
                                  {isFr ? 'Diagnostic de votre niveau :' : 'Skill Diagnosis:'}
                                </span>
                                <p className="text-[#d3e4fe] leading-snug">
                                  {sub.diagnosticFr}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono text-[#f43f5e] uppercase font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-[#f43f5e]" />
                                  {isFr ? 'Piège récurrent détecté :' : 'Recurrent Trap:'}
                                </span>
                                <p className="text-[#ffb4ab] leading-snug">
                                  {sub.commonPitfallFr}
                                </p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-[#1b2b3f] flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[11px] font-mono text-[#4edea3]">
                                💡 {sub.recommendedActionFr}
                              </span>
                              <div className="flex items-center gap-2">
                                {onNavigateToSyllabus && (
                                  <button
                                    onClick={onNavigateToSyllabus}
                                    className="px-2.5 py-1 rounded bg-[#102034] text-[#89ceff] hover:text-white border border-[#1b2b3f] text-[11px] flex items-center gap-1"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    <span>{isFr ? 'Fiche mémo' : 'Study Sheet'}</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleLaunchSubtopicTraining(sub)}
                                  className="px-3 py-1 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-[11px] font-bold flex items-center gap-1.5 shadow"
                                >
                                  <Zap className="w-3 h-3" />
                                  <span>
                                    {isFr
                                      ? `Lancer 5 questions sur ${sub.name}`
                                      : `Start 5 questions on ${sub.name}`}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER : Synthèse d'action et réinitialisation de test */}
      <div className="pt-3 border-t border-[#1b2b3f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#89929b]">
          <Sparkles className="w-4 h-4 text-[#fbbf24]" />
          <span>
            {isFr
              ? 'L\'arbre évolue automatiquement après chaque tentative d\'examen ou de quiz.'
              : 'The mastery tree updates adaptively after every quiz or practice session.'}
          </span>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('dbmastery:open_initial_diagnostic'))}
            className="text-[11px] text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer font-bold"
            title={isFr ? 'Passer ou refaire le diagnostic initial de 20 questions' : 'Take or retake the 20-question initial diagnostic'}
          >
            <Target className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>{isFr ? '🎯 Diagnostic initial (20 questions)' : '🎯 Initial Diagnostic (20 questions)'}</span>
          </button>
          <span className="text-[#26364a]">•</span>
          <button
            onClick={() => {
              const fresh = resetMasteryTree();
              setTreeData(fresh);
            }}
            className="text-[11px] text-[#89929b] hover:text-[#d3e4fe] underline flex items-center gap-1 cursor-pointer"
            title={isFr ? 'Réinitialiser aux valeurs de référence' : 'Reset to default reference values'}
          >
            <RefreshCw className="w-3 h-3" />
            <span>{isFr ? 'Réinitialiser l\'arbre' : 'Reset tree'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
