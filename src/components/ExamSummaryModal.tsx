import React from 'react';
import { Award, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck, X, AlertTriangle, TrendingUp, TrendingDown, BrainCircuit, Zap } from 'lucide-react';
import { loadMasteryTree, MasteryTreeData } from '../services/masteryTreeService';

interface ExamSummaryModalProps {
  score: number;
  isOpen: boolean;
  onClose: () => void;
  onReview: () => void;
  onReturnDashboard: () => void;
  lang: 'fr' | 'en';
}

export const ExamSummaryModal: React.FC<ExamSummaryModalProps> = ({
  score,
  isOpen,
  onClose,
  onReview,
  onReturnDashboard,
  lang,
}) => {
  if (!isOpen) return null;
  const isFr = lang === 'fr';
  const passed = score >= 70;
  const treeData: MasteryTreeData = loadMasteryTree();

  const sqlDomain = treeData.domains.find((d) => d.id === 'sql') || treeData.domains[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#102034] rounded-2xl border border-[#26364a] shadow-2xl p-5 sm:p-7 flex flex-col gap-5 overflow-hidden my-auto max-h-[92vh] overflow-y-auto">
        {/* Glow de fond */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#4edea3]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#89929b] hover:text-[#d3e4fe] p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#003824] to-[#4edea3]/30 border border-[#4edea3]/50 flex items-center justify-center text-[#4edea3] shadow-lg shadow-[#4edea3]/20">
            <Award className="w-8 h-8" />
          </div>
          <span className="font-mono text-xs text-[#4edea3] font-bold tracking-widest uppercase">
            {passed ? (isFr ? 'SESSION VALIDÉE • COMPÉTENCES MISES À JOUR' : 'SESSION PASSED • SKILLS UPDATED') : (isFr ? 'SESSION TERMINÉE • LACUNES DÉTECTÉES' : 'SESSION COMPLETED • GAPS DETECTED')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-[#d3e4fe]">
            {isFr ? 'Rapport & Impact sur MON NIVEAU' : 'Report & Impact on MY LEVEL'}
          </h2>
          <p className="text-xs text-[#bfc7d2] max-w-md leading-relaxed">
            {isFr
              ? 'L\'application a analysé vos réponses et mis à jour en direct votre arbre hiérarchique de compétences.'
              : 'The system analyzed your responses and updated your hierarchical skill mastery tree in real time.'}
          </p>
        </div>

        {/* Résumé Chiffré Simple */}
        <div className="bg-[#0b1c30] p-4 rounded-xl border border-[#1b2b3f] grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Résultat Session' : 'Session Score'}
            </span>
            <span className={`text-2xl sm:text-3xl font-bold font-mono ${passed ? 'text-[#4edea3]' : 'text-[#f43f5e]'}`}>
              {score}%
            </span>
          </div>
          <div className="flex flex-col border-x border-[#1b2b3f]">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Niveau Global' : 'Overall Level'}
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#38bdf8]">
              {treeData.overallScore}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Domaine SQL' : 'SQL Domain'}
            </span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-[#4edea3]">
              {sqlDomain.score}%
            </span>
          </div>
        </div>

        {/* SECTION COEUR : ARBRE DE COMPÉTENCES MON NIVEAU (CE QUE VOUS MAÎTRISEZ VS CE QUI RESTE À TRAVAILLER) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-[#38bdf8] uppercase tracking-wider flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-[#38bdf8]" />
              {isFr ? 'MON NIVEAU — Arbre Hiérarchique de Compétences' : 'MY LEVEL — Hierarchical Skill Tree'}
            </span>
            <span className="text-[11px] font-mono text-[#89929b]">
              {isFr ? 'Impact en direct' : 'Live Impact'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#071322] border border-[#1b2b3f] font-mono text-xs flex flex-col gap-2 shadow-inner">
            {/* Ligne Parent : SQL 82 % */}
            <div className="flex items-center justify-between pb-1.5 border-b border-[#1b2b3f]/70 text-[#d3e4fe] font-bold">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">SQL</span>
                <span className="text-[10px] text-[#89929b]">({isFr ? 'Langage d\'interrogation relationnel' : 'Relational query language'})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#4edea3] font-bold">{sqlDomain.score} %</span>
                <span className="text-[10px] text-[#4edea3] bg-[#003824] px-1.5 py-0.2 rounded border border-[#4edea3]/30 font-bold">+2%</span>
              </div>
            </div>

            {/* Branches Enfants : SELECT, WHERE, JOIN, GROUP BY, Subqueries */}
            <div className="flex flex-col gap-1.5 pt-1 pl-1">
              {sqlDomain.subtopics.map((sub, idx) => {
                const isLast = idx === sqlDomain.subtopics.length - 1;
                const isMastered = sub.score >= 80;
                const isGap = sub.score < 65;
                const badgeColor = isMastered
                  ? 'text-[#4edea3] bg-[#003824]/60 border-[#4edea3]/30'
                  : isGap
                  ? 'text-[#f43f5e] bg-[#3d000a]/60 border-[#f43f5e]/40'
                  : 'text-[#38bdf8] bg-[#002c47]/60 border-[#38bdf8]/30';

                const statusLabel = isMastered
                  ? (isFr ? 'Maîtrisé' : 'Mastered')
                  : isGap
                  ? (isFr ? 'Lacune critique' : 'Critical gap')
                  : (isFr ? 'Solide' : 'Solid');

                return (
                  <div key={sub.id} className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#0b1c30] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-[#38bdf8] select-none font-bold">
                        {isLast ? '└──' : '├──'}
                      </span>
                      <span className="text-[#d3e4fe] font-semibold">{sub.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isMastered ? 'text-[#4edea3]' : isGap ? 'text-[#f43f5e]' : 'text-[#38bdf8]'}`}>
                        {sub.score} %
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${badgeColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Autres Domaines clés du niveau */}
            <div className="pt-2 mt-1 border-t border-[#1b2b3f]/70 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              {treeData.domains.filter(d => d.id !== 'sql').map((d) => (
                <div key={d.id} className="p-2 rounded bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-0.5">
                  <span className="text-[#89929b] truncate">{d.name}</span>
                  <span className={`text-xs font-bold ${d.score >= 70 ? 'text-[#4edea3]' : d.score >= 60 ? 'text-[#38bdf8]' : 'text-[#f43f5e]'}`}>
                    {d.score} %
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnostic Pédagogique Concret */}
        <div className="p-3.5 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex items-start gap-3 text-xs">
          <div className="p-2 rounded-lg bg-[#0284c7]/20 text-[#38bdf8] shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-bold font-mono text-[#d3e4fe]">
              {isFr ? 'Ce que l\'application sait de vous après cette session :' : 'What the system learned about you:'}
            </span>
            <p className="text-[#bfc7d2] leading-relaxed">
              {isFr
                ? 'Vous maîtrisez le filtrage et les projections (SELECT 96%, WHERE 91%), mais vous perdez des points sur les Subqueries (54%) et les Jointures externes (67%). Focalisez vos prochaines révisions sur ces deux priorités.'
                : 'You excel at core projections and filtering (SELECT 96%, WHERE 91%), but lose critical points on Subqueries (54%) and outer JOINs (67%). Target these two areas next.'}
            </p>
          </div>
        </div>

        {/* Actions buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            onClick={onReview}
            className="w-full py-2.5 px-4 bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe] font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-[#26364a] cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#93ccff]" />
            <span>{isFr ? 'Revoir les Explications pas-à-pas' : 'Review Explanations'}</span>
          </button>

          <button
            onClick={onReturnDashboard}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0284c7]/20 cursor-pointer"
          >
            <span>{isFr ? 'Retourner à MON NIVEAU sur le Dashboard' : 'Return to MY LEVEL Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
