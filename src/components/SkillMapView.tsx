import React, { useState } from 'react';
import {
  Network,
  Terminal,
  Clock,
  Target,
  BookOpen,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  Sliders,
  Database,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  TrendingUp,
  Award
} from 'lucide-react';
import { SkillNode, SkillMetricDimensions, NavigationTab } from '../types';
import {
  sqlSkillTreeData,
  generateAsciiSkillTree,
  profileComparisonCases
} from '../data/skillMapData';
import { getStoredCompetencies, UserCompetency } from '../services/competencyService';

interface SkillMapViewProps {
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  onNavigateToTab?: (tab: NavigationTab) => void;
  onOpenTargetedSession?: () => void;
}

export const SkillMapView: React.FC<SkillMapViewProps> = ({
  lang,
  theme = 'dark',
  onNavigateToTab,
  onOpenTargetedSession
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  // Compétences utilisateur synchronisées
  const [competencies, setCompetencies] = useState<UserCompetency[]>(() => getStoredCompetencies());

  React.useEffect(() => {
    const handleUpdate = () => {
      setCompetencies(getStoredCompetencies());
    };
    window.addEventListener('dbmastery:competencies_updated', handleUpdate);
    return () => window.removeEventListener('dbmastery:competencies_updated', handleUpdate);
  }, []);

  const keyWeaknesses = [
    competencies.find((c) => c.id === 'join') || { id: 'join', name: 'JOIN', currentScore: 54 },
    competencies.find((c) => c.id === 'subqueries') || { id: 'subqueries', name: 'Subqueries', currentScore: 47 },
    competencies.find((c) => c.id === 'indexes') || { id: 'indexes', name: 'Indexes', currentScore: 61 },
  ];

  // Dimension active pour le tri / affichage
  const [activeDimension, setActiveDimension] = useState<
    'composite' | 'knowledge' | 'accuracy' | 'speed' | 'consistency'
  >('composite');

  // Mode d'affichage : Arbre Interactif vs Vue Terminal CLI
  const [viewStyle, setViewStyle] = useState<'visual' | 'ascii'>('visual');

  // Noeuds dépliés pour les sous-compétences
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'sql-join': true,
    'sql-having': true
  });

  // Compétence sélectionnée pour le tiroir d'inspection
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(sqlSkillTreeData[2]); // JOIN par défaut

  // Copie de l'arbre ASCII
  const [copiedAscii, setCopiedAscii] = useState(false);

  // État du simulateur cognitif interactif
  const [simAccuracy, setSimAccuracy] = useState<number>(80);
  const [simTimeSeconds, setSimTimeSeconds] = useState<number>(240); // 4 minutes
  const [simKnowledge, setSimKnowledge] = useState<number>(85);
  const [simConsistency, setSimConsistency] = useState<number>(50);

  // Formule de vitesse : temps cible (30s) / temps réel, plafonné à 100%
  const calculateSpeedScore = (timeSec: number, targetSec: number = 30) => {
    if (timeSec <= targetSec) {
      // Entre 0 et targetSec -> 90% à 100%
      return Math.min(100, Math.round(90 + (1 - timeSec / targetSec) * 10));
    }
    // Au-delà du temps cible, pénalité progressive
    const ratio = targetSec / timeSec;
    return Math.max(5, Math.min(85, Math.round(ratio * 90)));
  };

  const simSpeedScore = calculateSpeedScore(simTimeSeconds, 30);
  const simCompositeScore = Math.round(
    simKnowledge * 0.2 + simAccuracy * 0.35 + simSpeedScore * 0.3 + simConsistency * 0.15
  );

  const toggleNodeExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleCopyAscii = () => {
    const text = generateAsciiSkillTree(sqlSkillTreeData, activeDimension);
    navigator.clipboard.writeText(text);
    setCopiedAscii(true);
    setTimeout(() => setCopiedAscii(false), 2000);
  };

  // Helper de badge couleur selon le score
  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'text-[#10b981] bg-[#10b981]/15 border-[#10b981]/30';
    if (score >= 65) return 'text-[#0284c7] bg-[#0284c7]/15 border-[#0284c7]/30';
    if (score >= 40) return 'text-[#f59e0b] bg-[#f59e0b]/15 border-[#f59e0b]/30';
    return 'text-[#ef4444] bg-[#ef4444]/15 border-[#ef4444]/30';
  };

  const getDimensionValue = (node: SkillNode, dim: typeof activeDimension): number => {
    if (dim === 'composite') return node.compositeScore;
    if (dim === 'knowledge') return node.dimensions.knowledge;
    if (dim === 'accuracy') return node.dimensions.accuracy;
    if (dim === 'speed') return node.dimensions.speed;
    return node.dimensions.consistency;
  };

  const dimensionTabs: {
    id: typeof activeDimension;
    labelFr: string;
    labelEn: string;
    icon: any;
    descFr: string;
    descEn: string;
  }[] = [
    {
      id: 'composite',
      labelFr: 'Score Global',
      labelEn: 'Mastery Index',
      icon: Award,
      descFr: 'Pondération mathématique des 4 piliers cognitifs',
      descEn: 'Mathematical balance of the 4 cognitive pillars'
    },
    {
      id: 'knowledge',
      labelFr: 'Connaissance',
      labelEn: 'Knowledge',
      icon: BookOpen,
      descFr: 'Couverture du syllabus et des règles de syntaxe',
      descEn: 'Syllabus coverage and syntactic grammar acquisition'
    },
    {
      id: 'accuracy',
      labelFr: 'Exactitude',
      labelEn: 'Accuracy',
      icon: Target,
      descFr: 'Taux de réponses justes et détection des pièges',
      descEn: 'Correct answer ratio and exam trap avoidance'
    },
    {
      id: 'speed',
      labelFr: 'Rapidité & Réflexe',
      labelEn: 'Cognitive Speed',
      icon: Zap,
      descFr: 'Temps de résolution vs benchmark cible professionnel',
      descEn: 'Resolution time vs professional benchmark target'
    },
    {
      id: 'consistency',
      labelFr: 'Régularité',
      labelEn: 'Consistency',
      icon: RotateCcw,
      descFr: 'Répétabilité des succès et rétention espacée',
      descEn: 'Repetition resilience and spaced retention'
    }
  ];

  return (
    <div id="skill-map-view" className="max-w-[1720px] mx-auto w-full flex flex-col gap-6 p-6">
      {/* 1. EN-TÊTE PRINCIPAL & PROBLÉMATIQUE COGNITIVE */}
      <div
        className={`p-6 rounded-2xl border shadow-md flex flex-col gap-4 ${
          isLight
            ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
            : 'bg-[#0b1c30] border-[#1b2b3f] text-[#d3e4fe]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] flex items-center justify-center text-white shadow-lg shadow-[#0284c7]/20">
              <Network className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-[#0284c7]/10 text-[#0284c7] border border-[#0284c7]/30">
                  {isFr ? 'Cartographie des Compétences' : 'Skill Tree Architecture'}
                </span>
                <span className="text-xs text-[#64748b]">•</span>
                <span className="text-xs text-[#10b981] font-semibold">
                  {isFr ? 'Modèle Quadridimensionnel' : '4-Dimensional Cognitive Model'}
                </span>
              </div>
              <h1 className="text-2xl font-bold mt-1">
                {isFr ? 'Skill Map SQL : Arborescence & Métriques' : 'SQL Skill Map: Tree & Metrics'}
              </h1>
            </div>
          </div>

          {/* Switcher vue Visuelle vs Terminal ASCII */}
          <div
            className={`flex items-center p-1 rounded-xl border ${
              isLight ? 'bg-[#f1f5f9] border-[#cbd5e1]' : 'bg-[#000f21] border-[#1b2b3f]'
            }`}
          >
            <button
              onClick={() => setViewStyle('visual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewStyle === 'visual'
                  ? isLight
                    ? 'bg-white text-[#0284c7] shadow-sm'
                    : 'bg-[#102034] text-[#38bdf8] shadow-sm'
                  : 'text-[#64748b] hover:text-[#0f172a] dark:hover:text-[#d3e4fe]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isFr ? 'Arborescence Visuelle' : 'Visual Hierarchy'}</span>
            </button>

            <button
              onClick={() => setViewStyle('ascii')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewStyle === 'ascii'
                  ? isLight
                    ? 'bg-white text-[#0284c7] shadow-sm'
                    : 'bg-[#102034] text-[#38bdf8] shadow-sm'
                  : 'text-[#64748b] hover:text-[#0f172a] dark:hover:text-[#d3e4fe]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{isFr ? 'Terminal ASCII' : 'ASCII CLI Tree'}</span>
            </button>
          </div>
        </div>

        {/* BANNIÈRE FAIBLESSES ET CRÉER UNE SÉANCE PERSONNALISÉE */}
        <div
          className={`p-4.5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md ${
            isLight
              ? 'bg-gradient-to-r from-[#e0f2fe] via-[#f0f9ff] to-white border-[#7dd3fc] text-[#0f172a]'
              : 'bg-gradient-to-r from-[#0284c7]/20 via-[#0b2742] to-[#102034] border-[#0284c7]/40 text-[#d3e4fe]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#38bdf8] text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm">
                  {isFr ? 'Mes faiblesses détectées par DBMastor' : 'My Weaknesses Detected by DBMastor'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30 font-bold">
                  {isFr ? '3 priorités' : '3 priorities'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-xs mt-1">
                <span>JOIN: <strong className="text-[#38bdf8] font-extrabold">{keyWeaknesses[0].currentScore} %</strong></span>
                <span className="text-[#64748b]">•</span>
                <span>Subqueries: <strong className="text-[#f43f5e] font-extrabold">{keyWeaknesses[1].currentScore} %</strong></span>
                <span className="text-[#64748b]">•</span>
                <span>Indexes: <strong className="text-[#fbbf24] font-extrabold">{keyWeaknesses[2].currentScore} %</strong></span>
              </div>
            </div>
          </div>
          <button
            id="skillmap-create-targeted-session-btn"
            onClick={onOpenTargetedSession}
            className="w-full md:w-auto py-2.5 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0284c7] hover:from-[#0369a1] hover:to-[#0284c7] text-white flex items-center justify-center gap-2 shadow-md shadow-[#0284c7]/25 transition-all shrink-0 active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-[#38bdf8]" />
            <span>{isFr ? 'Créer une séance personnalisée (10Q)' : 'Create Targeted Session (10Q)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cadrage pédagogique : Pourquoi distinguer les 4 dimensions ? */}
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
            isLight
              ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1]'
              : 'bg-[#002847]/70 border-[#0284c7]/40 text-[#93ccff]'
          }`}
        >
          <Sparkles className="w-5 h-5 shrink-0 text-[#0284c7] mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold">
              {isFr
                ? 'Fondement de l\'évaluation : Pourquoi séparer Connaissance, Exactitude, Rapidité et Régularité ?'
                : 'Evaluation Foundation: Why separate Knowledge, Accuracy, Speed and Consistency?'}
            </span>
            <p className={isLight ? 'text-[#334155]' : 'text-[#bfc7d2]'}>
              {isFr
                ? '« Un candidat qui répond correctement à 8 questions sur 10 mais met 4 minutes par question n\'a pas du tout le même niveau qu\'un profil qui valide 9/10 en 20 secondes. » Le premier est encore en sur-délibération ou en tâtonnement, tandis que le second possède des automatismes réflexes indispensables pour la production et les examens chronométrés.'
                : '"A candidate answering 8/10 correctly in 4 minutes per question has a fundamentally different level than someone achieving 9/10 in 20 seconds." The former is still guessing or over-deliberating, while the latter has developed true cognitive reflexes.'}
            </p>
          </div>
        </div>

        {/* Onglets sélecteurs de dimension */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2">
          {dimensionTabs.map((dim) => {
            const DimIcon = dim.icon;
            const isCurrent = activeDimension === dim.id;

            return (
              <button
                key={dim.id}
                onClick={() => setActiveDimension(dim.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  isCurrent
                    ? isLight
                      ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-md shadow-[#0284c7]/20 font-bold'
                      : 'bg-[#0284c7]/20 border-[#38bdf8] text-[#38bdf8] shadow-sm font-bold'
                    : isLight
                    ? 'bg-[#f8fafc] border-[#e2e8f0] hover:bg-white text-[#475569]'
                    : 'bg-[#102034] border-[#1b2b3f] hover:bg-[#16273f] text-[#89929b]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    {isFr ? dim.labelFr : dim.labelEn}
                  </span>
                  <DimIcon className="w-3.5 h-3.5 opacity-80" />
                </div>
                <span
                  className={`text-[10px] leading-tight truncate ${
                    isCurrent
                      ? isLight
                        ? 'text-white/80'
                        : 'text-[#d3e4fe]'
                      : 'text-[#64748b]'
                  }`}
                >
                  {isFr ? dim.descFr : dim.descEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ZONE PRINCIPALE : ARBRE ASCII vs ARBRE VISUEL (2/3) + TIROIR INSPECTION (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNE GAUCHE (8 COLS) : ARBORESCENCE */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* VUE ASCII TERMINAL */}
          {viewStyle === 'ascii' && (
            <div
              className={`p-6 rounded-2xl border shadow-lg font-mono flex flex-col gap-4 ${
                isLight
                  ? 'bg-[#000f21] border-[#1b2b3f] text-[#38bdf8]'
                  : 'bg-[#000f21] border-[#1b2b3f] text-[#38bdf8]'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
                <div className="flex items-center gap-2 text-xs">
                  <Terminal className="w-4 h-4 text-[#10b981]" />
                  <span className="text-[#89929b]">$ dbmastery skill-tree --metric={activeDimension}</span>
                </div>
                <button
                  onClick={handleCopyAscii}
                  className="px-3 py-1 rounded-lg border border-[#1b2b3f] text-xs font-sans text-[#89929b] hover:text-white hover:bg-[#102034] flex items-center gap-1.5 transition-all"
                >
                  {copiedAscii ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      <span className="text-[#10b981]">{isFr ? 'Copié !' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Copier l\'arborescence' : 'Copy Tree'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bloc ASCII pur */}
              <pre className="text-sm sm:text-base leading-relaxed overflow-x-auto whitespace-pre p-2 text-[#93ccff]">
                {generateAsciiSkillTree(sqlSkillTreeData, activeDimension)}
              </pre>

              <div className="pt-2 border-t border-[#1b2b3f] flex items-center justify-between text-[11px] text-[#64748b]">
                <span>
                  {isFr
                    ? `Affichage calibré sur : ${dimensionTabs.find((d) => d.id === activeDimension)?.labelFr}`
                    : `Calibrated on: ${dimensionTabs.find((d) => d.id === activeDimension)?.labelEn}`}
                </span>
                <span>{sqlSkillTreeData.length} {isFr ? 'branches répertoriées' : 'branches cataloged'}</span>
              </div>
            </div>
          )}

          {/* VUE VISUELLE ARBORESCENTE AVEC LES 4 DIMENSIONS SIMULTANÉES */}
          {viewStyle === 'visual' && (
            <div className="flex flex-col gap-3">
              {sqlSkillTreeData.map((node, idx) => {
                const isExpanded = !!expandedNodes[node.id];
                const isSelected = selectedSkill?.id === node.id;
                const nodeVal = getDimensionValue(node, activeDimension);
                const isLast = idx === sqlSkillTreeData.length - 1;

                return (
                  <div
                    key={node.id}
                    className={`rounded-2xl border transition-all shadow-sm ${
                      isSelected
                        ? isLight
                          ? 'border-[#0284c7] ring-2 ring-[#0284c7]/20 bg-white'
                          : 'border-[#38bdf8] ring-2 ring-[#38bdf8]/20 bg-[#102034]'
                        : isLight
                        ? 'border-[#e2e8f0] bg-white hover:border-[#cbd5e1]'
                        : 'border-[#1b2b3f] bg-[#0b1c30] hover:border-[#26364a]'
                    }`}
                  >
                    {/* Ligne principale du noeud */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Titre & Symbole de branche */}
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <button
                          onClick={() => toggleNodeExpand(node.id)}
                          className="p-1 rounded text-[#64748b] hover:text-[#0284c7] transition-colors"
                        >
                          {node.children && node.children.length > 0 ? (
                            isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )
                          ) : (
                            <span className="font-mono text-xs text-[#64748b]">
                              {isLast ? '└' : '├'}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => setSelectedSkill(node)}
                          className="text-left flex flex-col"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-bold tracking-tight text-[#0284c7] dark:text-[#38bdf8]">
                              {node.name}
                            </span>
                            <span
                              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${getScoreBadgeColor(
                                node.compositeScore
                              )}`}
                            >
                              {node.compositeScore}%
                            </span>
                          </div>
                          <span className="text-xs text-[#64748b] line-clamp-1">
                            {isFr ? node.descriptionFr : node.descriptionEn}
                          </span>
                        </button>
                      </div>

                      {/* Les 4 Dimensions en barres d'un coup d'œil */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 max-w-md">
                        {/* 1. Connaissance */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-[#64748b]">
                              {isFr ? 'Connais.' : 'Know.'}
                            </span>
                            <span className="font-bold">{node.dimensions.knowledge}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-[#0284c7] rounded-full transition-all"
                              style={{ width: `${node.dimensions.knowledge}%` }}
                            />
                          </div>
                        </div>

                        {/* 2. Exactitude */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-[#64748b]">
                              {isFr ? 'Exact.' : 'Accur.'}
                            </span>
                            <span className="font-bold">{node.dimensions.accuracy}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-[#10b981] rounded-full transition-all"
                              style={{ width: `${node.dimensions.accuracy}%` }}
                            />
                          </div>
                        </div>

                        {/* 3. Rapidité */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-[#64748b]">
                              {isFr ? 'Rapid.' : 'Speed'}
                            </span>
                            <span className="font-bold">
                              {node.dimensions.averageTimeSeconds}s
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                node.dimensions.speed >= 75
                                  ? 'bg-[#10b981]'
                                  : node.dimensions.speed >= 45
                                  ? 'bg-[#f59e0b]'
                                  : 'bg-[#ef4444]'
                              }`}
                              style={{ width: `${node.dimensions.speed}%` }}
                            />
                          </div>
                        </div>

                        {/* 4. Régularité */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-[#64748b]">
                              {isFr ? 'Régul.' : 'Consist.'}
                            </span>
                            <span className="font-bold">
                              {node.dimensions.consistency}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-[#8b5cf6] rounded-full transition-all"
                              style={{ width: `${node.dimensions.consistency}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bouton inspecter */}
                      <button
                        onClick={() => setSelectedSkill(node)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[#0284c7] text-white border-[#0284c7]'
                            : isLight
                            ? 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                            : 'bg-[#102034] text-[#93ccff] border-[#1b2b3f] hover:bg-[#16273f]'
                        }`}
                      >
                        {isFr ? 'Inspecter' : 'Inspect'}
                      </button>
                    </div>

                    {/* Sous-noeuds dépliés (Children) */}
                    {isExpanded && node.children && (
                      <div className="px-5 pb-4 pt-1 flex flex-col gap-2 border-t border-[#1b2b3f]/15">
                        {node.children.map((child, cIdx) => {
                          const isChildLast = cIdx === node.children!.length - 1;

                          return (
                            <div
                              key={child.id}
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                                isLight
                                  ? 'bg-[#f8fafc] border-[#e2e8f0]'
                                  : 'bg-[#000f21]/70 border-[#1b2b3f]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[#64748b]">
                                  {isChildLast ? '└──' : '├──'}
                                </span>
                                <span className="font-mono font-bold text-sm">
                                  {child.name}
                                </span>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 font-mono text-[11px] text-[#64748b]">
                                  <span>
                                    {isFr ? 'Exactitude :' : 'Accuracy:'}{' '}
                                    <strong className="text-[#10b981]">
                                      {child.dimensions.accuracy}%
                                    </strong>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {isFr ? 'Temps :' : 'Time:'}{' '}
                                    <strong className="text-[#0284c7]">
                                      {child.dimensions.averageTimeSeconds}s
                                    </strong>
                                  </span>
                                </div>

                                <span
                                  className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${getScoreBadgeColor(
                                    child.compositeScore
                                  )}`}
                                >
                                  {child.compositeScore}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLONNE DROITE (4 COLS) : TIROIR D'INSPECTION DE LA COMPÉTENCE SÉLECTIONNÉE */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {selectedSkill ? (
            <div
              className={`p-6 rounded-2xl border shadow-md flex flex-col gap-5 sticky top-20 ${
                isLight
                  ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
                  : 'bg-[#102034] border-[#1b2b3f] text-[#d3e4fe]'
              }`}
            >
              {/* Entête compétence sélectionnée */}
              <div className="flex items-start justify-between gap-2 pb-4 border-b border-[#1b2b3f]/20">
                <div className="flex flex-col">
                  <span className="font-mono text-xs uppercase text-[#0284c7] font-bold">
                    {selectedSkill.category}
                  </span>
                  <h3 className="text-xl font-bold font-mono text-[#0284c7] dark:text-[#38bdf8]">
                    {selectedSkill.name}
                  </h3>
                  <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                    {isFr ? selectedSkill.descriptionFr : selectedSkill.descriptionEn}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-xl font-mono text-sm font-bold border ${getScoreBadgeColor(
                    selectedSkill.compositeScore
                  )}`}
                >
                  {selectedSkill.compositeScore}%
                </div>
              </div>

              {/* Grille analytique des 4 dimensions */}
              <div className="grid grid-cols-2 gap-3">
                {/* Connaissance */}
                <div
                  className={`p-3 rounded-xl border flex flex-col gap-1 ${
                    isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#0b1c30] border-[#1b2b3f]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                    <BookOpen className="w-3.5 h-3.5 text-[#0284c7]" />
                    <span>{isFr ? 'Connaissance' : 'Knowledge'}</span>
                  </div>
                  <span className="text-lg font-bold font-mono">
                    {selectedSkill.dimensions.knowledge}%
                  </span>
                  <span className="text-[10px] text-[#64748b]">
                    {isFr ? 'Couverture du syllabus' : 'Syllabus coverage'}
                  </span>
                </div>

                {/* Exactitude */}
                <div
                  className={`p-3 rounded-xl border flex flex-col gap-1 ${
                    isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#0b1c30] border-[#1b2b3f]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                    <Target className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>{isFr ? 'Exactitude' : 'Accuracy'}</span>
                  </div>
                  <span className="text-lg font-bold font-mono text-[#10b981]">
                    {selectedSkill.dimensions.accuracy}%
                  </span>
                  <span className="text-[10px] text-[#64748b]">
                    {selectedSkill.dimensions.totalAttempts} {isFr ? 'questions résolues' : 'trials'}
                  </span>
                </div>

                {/* Rapidité */}
                <div
                  className={`p-3 rounded-xl border flex flex-col gap-1 ${
                    isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#0b1c30] border-[#1b2b3f]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                    <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>{isFr ? 'Temps Moyen' : 'Avg Time'}</span>
                  </div>
                  <span className="text-lg font-bold font-mono">
                    {selectedSkill.dimensions.averageTimeSeconds}s
                  </span>
                  <span className="text-[10px] text-[#64748b]">
                    {isFr ? 'Cible :' : 'Target:'} ~{selectedSkill.dimensions.targetTimeSeconds}s
                  </span>
                </div>

                {/* Régularité */}
                <div
                  className={`p-3 rounded-xl border flex flex-col gap-1 ${
                    isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#0b1c30] border-[#1b2b3f]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                    <RotateCcw className="w-3.5 h-3.5 text-[#8b5cf6]" />
                    <span>{isFr ? 'Régularité' : 'Consistency'}</span>
                  </div>
                  <span className="text-lg font-bold font-mono">
                    {selectedSkill.dimensions.consistency}%
                  </span>
                  <span className="text-[10px] text-[#64748b]">
                    {isFr ? 'Série :' : 'Streak:'} {selectedSkill.dimensions.streak} {isFr ? 'succès' : 'in row'}
                  </span>
                </div>
              </div>

              {/* Diagnostic de benchmark */}
              <div
                className={`p-3.5 rounded-xl border text-xs leading-normal flex items-start gap-2.5 ${
                  selectedSkill.dimensions.speed < 50
                    ? isLight
                      ? 'bg-[#fffbeb] border-[#fde68a] text-[#b45309]'
                      : 'bg-[#451a03]/40 border-[#f59e0b]/40 text-[#fde68a]'
                    : isLight
                    ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]'
                    : 'bg-[#052e16]/40 border-[#10b981]/40 text-[#4edea3]'
                }`}
              >
                <Zap className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">
                    {isFr ? 'Diagnostic Cognitif :' : 'Cognitive Diagnostic:'}
                  </span>
                  <span>
                    {isFr
                      ? selectedSkill.benchmarkLabelFr
                      : selectedSkill.benchmarkLabelEn}
                  </span>
                </div>
              </div>

              {/* Pièges classiques identifiés sur ce domaine */}
              {selectedSkill.commonTrapsFr && (
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-[#ef4444]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Pièges Fréquents d\'Examen :' : 'Exam Pitfalls:'}</span>
                  </span>
                  <ul className="text-xs text-[#64748b] space-y-1.5 list-disc pl-4 leading-relaxed">
                    {(isFr
                      ? selectedSkill.commonTrapsFr
                      : selectedSkill.commonTrapsEn || selectedSkill.commonTrapsFr
                    ).map((trap, tIdx) => (
                      <li key={tIdx}>{trap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions directes vers les autres modules */}
              <div className="flex flex-col gap-2 pt-3 border-t border-[#1b2b3f]/20">
                {onNavigateToTab && (
                  <>
                    <button
                      onClick={() => onNavigateToTab('exams')}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-[#0284c7]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Lancer le cycle adaptatif sur cette notion' : 'Launch adaptive loop on this skill'}</span>
                    </button>

                    <button
                      onClick={() => onNavigateToTab('sandbox')}
                      className="w-full py-2 rounded-xl font-semibold text-xs border border-[#1b2b3f] hover:bg-black/5 flex items-center justify-center gap-2 transition-all"
                    >
                      <Terminal className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>{isFr ? 'Tester dans le Lab SQL' : 'Experiment in SQL Lab'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`p-6 rounded-2xl border text-center text-xs text-[#64748b] ${
                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#102034] border-[#1b2b3f]'
              }`}
            >
              {isFr
                ? 'Sélectionnez une compétence dans l\'arborescence pour afficher son bilan quadridimensionnel détaillé.'
                : 'Select a skill in the tree to display its full 4-dimensional breakdown.'}
            </div>
          )}
        </div>
      </div>

      {/* 3. SECTION SPÉCIALE : LE SIMULATEUR COGNITIF & LES 2 PROFILS COMPARÉS */}
      <div
        className={`p-6 rounded-2xl border shadow-lg flex flex-col gap-6 ${
          isLight
            ? 'bg-white border-[#e2e8f0] text-[#0f172a]'
            : 'bg-[#102034] border-[#1b2b3f] text-[#d3e4fe]'
        }`}
      >
        <div className="flex items-center gap-2.5 text-[#0284c7] font-mono text-xs font-bold uppercase">
          <Sliders className="w-5 h-5" />
          <span>
            {isFr
              ? 'Laboratoire de Métriques Cognitives : Démonstration du Modèle'
              : 'Cognitive Metrics Lab: Model Demonstration'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">
            {isFr
              ? 'Comparatif Direct : 8/10 en 4 minutes vs 9/10 en 20 secondes'
              : 'Direct Comparison: 8/10 in 4 minutes vs 9/10 in 20 seconds'}
          </h2>
          <p className="text-xs text-[#64748b] max-w-3xl leading-relaxed">
            {isFr
              ? 'Le score brut (QCM classique) ne suffit pas. Observez comment la vitesse et la régularité révèlent la différence entre la connaissance hésitante et l\'automatisme professionnel.'
              : 'Raw test scores are misleading. Observe how speed and consistency differentiate hesitant deliberation from expert reflex.'}
          </p>
        </div>

        {/* 2 Profils prédéfinis côte à côte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profileComparisonCases.map((profile, pIdx) => {
            const isReflex = profile.profileType === 'reflex_pro';

            return (
              <div
                key={pIdx}
                className={`p-5 rounded-2xl border-2 flex flex-col justify-between gap-4 ${
                  isReflex
                    ? isLight
                      ? 'bg-[#f0fdf4] border-[#10b981] text-[#0f172a]'
                      : 'bg-[#052e16]/30 border-[#10b981] text-[#d3e4fe]'
                    : isLight
                    ? 'bg-[#fffbeb] border-[#f59e0b] text-[#0f172a]'
                    : 'bg-[#451a03]/30 border-[#f59e0b] text-[#d3e4fe]'
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base">
                      {isFr ? profile.titleFr : profile.titleEn}
                    </span>
                    <span
                      className={`font-mono text-sm font-extrabold px-3 py-1 rounded-xl border ${
                        isReflex
                          ? 'bg-[#10b981] text-white border-[#10b981]'
                          : 'bg-[#f59e0b] text-white border-[#f59e0b]'
                      }`}
                    >
                      {profile.compositeScore}% {isFr ? 'Global' : 'Composite'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-black/5 dark:bg-black/20 flex flex-col">
                      <span className="text-[#64748b] text-[10px]">
                        {isFr ? 'Score Brut :' : 'Raw Score:'}
                      </span>
                      <strong className="text-sm">{profile.scoreRatio}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/5 dark:bg-black/20 flex flex-col">
                      <span className="text-[#64748b] text-[10px]">
                        {isFr ? 'Temps / Question :' : 'Time / Question:'}
                      </span>
                      <strong
                        className={`text-sm ${
                          isReflex ? 'text-[#10b981]' : 'text-[#f59e0b]'
                        }`}
                      >
                        {profile.avgTime}
                      </strong>
                    </div>
                  </div>

                  <p className="text-xs text-[#64748b] leading-relaxed">
                    {isFr ? profile.verdictFr : profile.verdictEn}
                  </p>
                </div>

                {/* Barres des 4 dimensions */}
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-black/10 dark:border-white/10 text-[10px] font-mono">
                  <div>
                    <span className="text-[#64748b]">Connais.</span>
                    <div className="font-bold">{profile.dimensions.knowledge}%</div>
                  </div>
                  <div>
                    <span className="text-[#64748b]">Exactitude</span>
                    <div className="font-bold text-[#10b981]">{profile.dimensions.accuracy}%</div>
                  </div>
                  <div>
                    <span className="text-[#64748b]">Rapidité</span>
                    <div className={`font-bold ${isReflex ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {profile.dimensions.speed}%
                    </div>
                  </div>
                  <div>
                    <span className="text-[#64748b]">Régularité</span>
                    <div className="font-bold text-[#8b5cf6]">{profile.dimensions.consistency}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Simulateur interactif de profil personnalisé */}
        <div
          className={`p-5 rounded-2xl border flex flex-col gap-4 ${
            isLight ? 'bg-[#f8fafc] border-[#e2e8f0]' : 'bg-[#0b1c30] border-[#1b2b3f]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0284c7]" />
              <span>{isFr ? 'Simulateur Interactif de Candidat' : 'Interactive Candidate Simulator'}</span>
            </span>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span>{isFr ? 'Score Composite Calculé :' : 'Computed Composite Score:'}</span>
              <span className={`px-2.5 py-0.5 rounded-lg font-bold border ${getScoreBadgeColor(simCompositeScore)}`}>
                {simCompositeScore}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Slider Exactitude */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748b]">{isFr ? 'Exactitude (Réponses justes)' : 'Accuracy'}</span>
                <span className="font-mono font-bold text-[#10b981]">{simAccuracy}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={simAccuracy}
                onChange={(e) => setSimAccuracy(Number(e.target.value))}
                className="accent-[#10b981] cursor-pointer"
              />
            </div>

            {/* Slider Temps de réponse */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748b]">{isFr ? 'Temps / question' : 'Time / question'}</span>
                <span className="font-mono font-bold text-[#0284c7]">{simTimeSeconds}s ({Math.floor(simTimeSeconds / 60)}m{simTimeSeconds % 60}s)</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={simTimeSeconds}
                onChange={(e) => setSimTimeSeconds(Number(e.target.value))}
                className="accent-[#0284c7] cursor-pointer"
              />
            </div>

            {/* Slider Connaissance */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748b]">{isFr ? 'Couverture Connaissance' : 'Knowledge'}</span>
                <span className="font-mono font-bold">{simKnowledge}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={simKnowledge}
                onChange={(e) => setSimKnowledge(Number(e.target.value))}
                className="accent-[#0284c7] cursor-pointer"
              />
            </div>

            {/* Slider Régularité */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748b]">{isFr ? 'Régularité temporelle' : 'Consistency'}</span>
                <span className="font-mono font-bold text-[#8b5cf6]">{simConsistency}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={simConsistency}
                onChange={(e) => setSimConsistency(Number(e.target.value))}
                className="accent-[#8b5cf6] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
