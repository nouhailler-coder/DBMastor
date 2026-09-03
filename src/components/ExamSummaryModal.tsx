import React from 'react';
import { Award, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck, X } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#102034] rounded-2xl border border-[#26364a] shadow-2xl p-6 flex flex-col gap-5 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#4edea3]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#89929b] hover:text-[#d3e4fe] p-1.5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#003824] to-[#4edea3]/30 border border-[#4edea3]/50 flex items-center justify-center text-[#4edea3] shadow-lg shadow-[#4edea3]/20">
            <Award className="w-8 h-8" />
          </div>
          <span className="font-mono text-xs text-[#4edea3] font-bold tracking-widest uppercase">
            {passed ? (isFr ? 'EXAMEN RÉUSSI • VALIDÉ' : 'EXAM PASSED • CERTIFIED') : 'NON VALIDÉ'}
          </span>
          <h2 className="text-2xl font-bold text-[#d3e4fe]">
            {isFr ? 'Rapport d\'Évaluation Officiel' : 'Official Performance Evaluation'}
          </h2>
          <p className="text-xs text-[#bfc7d2] max-w-sm">
            {isFr
              ? 'Simulation d\'examen Oracle 1Z0-071 Database SQL 19c Enterprise complétée avec succès.'
              : 'Oracle 1Z0-071 Database SQL 19c Enterprise practice session completed.'}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-[#0b1c30] p-4 rounded-xl border border-[#1b2b3f] flex items-center justify-around text-center">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Votre Score' : 'Your Score'}
            </span>
            <span className="text-3xl font-bold font-mono text-[#4edea3]">{score}%</span>
          </div>
          <div className="w-px h-10 bg-[#1b2b3f]"></div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Seuil Requis' : 'Passing Threshold'}
            </span>
            <span className="text-3xl font-bold font-mono text-[#93ccff]">70%</span>
          </div>
          <div className="w-px h-10 bg-[#1b2b3f]"></div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              XP Gagnés
            </span>
            <span className="text-3xl font-bold font-mono text-[#89ceff]">+150</span>
          </div>
        </div>

        {/* Domain highlights */}
        <div className="flex flex-col gap-2 text-xs font-mono">
          <div className="flex justify-between p-2 rounded bg-[#000f21] border border-[#1b2b3f]">
            <span className="text-[#bfc7d2]">Domaine 3: Group By & Having</span>
            <span className="text-[#4edea3] font-bold">100% (2/2)</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-[#000f21] border border-[#1b2b3f]">
            <span className="text-[#bfc7d2]">Domaine 1: Logique des NULLs</span>
            <span className="text-[#4edea3] font-bold">100% (1/1)</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onReview}
            className="w-full py-2.5 px-4 bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 border border-[#26364a]"
          >
            <CheckCircle2 className="w-4 h-4 text-[#93ccff]" />
            <span>{isFr ? 'Revoir les Explications' : 'Review Explanations'}</span>
          </button>

          <button
            onClick={onReturnDashboard}
            className="w-full py-2.5 px-4 bg-[#3198dc] hover:bg-[#93ccff] text-[#002c47] font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#3198dc]/20"
          >
            <span>{isFr ? 'Retour au Tableau de Bord' : 'Return to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
