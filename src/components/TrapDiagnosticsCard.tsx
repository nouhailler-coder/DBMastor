import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Brain,
  Timer,
  Tag,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Info,
  Layers,
  ChevronRight,
  Flame,
  RotateCcw
} from 'lucide-react';
import {
  getStoredTraps,
  getRecurringTraps,
  getTopCriticalTrap,
  getTrapDiagnosticsSummary,
  resetTrapsToDefault,
} from '../services/trapService';
import { TrapDiagnosticRecord } from '../types';

interface TrapDiagnosticsCardProps {
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  onOpenTargetedSession?: () => void;
  onOpenTrapExplorer?: () => void;
}

export const TrapDiagnosticsCard: React.FC<TrapDiagnosticsCardProps> = ({
  lang,
  theme = 'dark',
  onOpenTargetedSession,
  onOpenTrapExplorer,
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  const [traps, setTraps] = useState<TrapDiagnosticRecord[]>(() => getStoredTraps());
  const [selectedTrap, setSelectedTrap] = useState<TrapDiagnosticRecord | null>(() => getTopCriticalTrap());
  const [activeTab, setActiveTab] = useState<'alerts' | 'inspector'>('alerts');

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getStoredTraps();
      setTraps(updated);
      setSelectedTrap((prev) => {
        if (!prev) return getTopCriticalTrap();
        const found = updated.find((t) => t.trapId === prev.trapId);
        return found || getTopCriticalTrap();
      });
    };

    window.addEventListener('dbmastery:traps_updated', handleUpdate);
    return () => window.removeEventListener('dbmastery:traps_updated', handleUpdate);
  }, []);

  const recurring = traps
    .filter((t) => t.errorCount >= 2 || (t.totalAttempts >= 2 && t.errorCount / t.totalAttempts >= 0.5))
    .sort((a, b) => b.errorCount - a.errorCount);

  const topTrap = selectedTrap || recurring[0] || traps[0];

  const handleReset = () => {
    const defaultList = resetTrapsToDefault();
    setTraps(defaultList);
    setSelectedTrap(defaultList[0]);
  };

  return (
    <div
      id="trap-diagnostics-card"
      className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#102034] via-[#0b1c30] to-[#102034] border border-[#f59e0b]/40 shadow-xl flex flex-col gap-5 relative overflow-hidden group"
    >
      {/* Glow d'ambiance */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#f59e0b]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* HEADER : DÉTECTEUR DE PIÈGES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b2b3f]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#78350f] to-[#f59e0b]/30 border border-[#f59e0b]/50 text-[#fbbf24] flex items-center justify-center shrink-0 shadow-md shadow-[#f59e0b]/20">
            <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#f59e0b] px-2 py-0.5 rounded bg-[#f59e0b]/15 border border-[#f59e0b]/30">
                {isFr ? 'IA Cognitive • Certification' : 'Cognitive AI • Certification'}
              </span>
              <span className="text-xs font-mono text-[#89929b]">•</span>
              <span className="text-xs font-mono text-[#38bdf8] flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" />
                {isFr ? 'Analyse des Pièges' : 'Trap Detection'}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#d3e4fe] tracking-tight">
              {isFr ? 'Détecteur de Pièges de Certification' : 'Certification Trap Detector'}
            </h3>
          </div>
        </div>

        {/* Badges métriques rapides */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            {recurring.length} {isFr ? 'pièges récurrents' : 'recurring traps'}
          </span>
          {onOpenTrapExplorer && (
            <button
              onClick={onOpenTrapExplorer}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#1b2b3f] hover:bg-[#26364a] text-[#89ceff] hover:text-[#d3e4fe] border border-[#26364a] transition-all flex items-center gap-1"
            >
              <span>{isFr ? 'Observatoire' : 'Explorer'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* CONTRASTE PÉDAGOGIQUE DEMANDÉ PAR L'UTILISATEUR :
          "❌ 4 mauvaises réponses"  VS  "⚠️ Tu fais régulièrement l'erreur INNER JOIN vs LEFT JOIN." */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Approche classique / générique */}
        <div className="p-3.5 rounded-xl bg-[#000f21]/70 border border-[#ef4444]/30 flex flex-col justify-between gap-2 opacity-80">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#ef4444] uppercase font-bold tracking-wider">
              {isFr ? 'Rapport classique (Peu instructif)' : 'Traditional report (Low value)'}
            </span>
            <XCircle className="w-4 h-4 text-[#ef4444]" />
          </div>
          <div className="flex items-center gap-2 py-1">
            <span className="text-base font-extrabold text-[#ef4444] font-mono">
              ❌ {topTrap ? topTrap.errorCount : 4} {isFr ? 'mauvaises réponses.' : 'wrong answers.'}
            </span>
          </div>
          <p className="text-[11px] text-[#89929b] leading-tight">
            {isFr 
              ? 'Indique seulement le volume d\'erreurs sans expliquer la cause racine ni la confusion conceptuelle.'
              : 'Only shows error volume without diagnosing root causes or misconceptions.'}
          </p>
        </div>

        {/* Approche DBMastor IA / Métadonnées ciblées */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#78350f]/25 to-[#f59e0b]/15 border-2 border-[#f59e0b] flex flex-col justify-between gap-2 shadow-lg shadow-[#f59e0b]/10">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#fbbf24] uppercase font-extrabold tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#fbbf24]" />
              {isFr ? 'Diagnostic Cognitif DBMastor (Instructif)' : 'DBMastor Cognitive Diagnosis'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f59e0b]/20 text-[#fbbf24]">
              {isFr ? 'Cause Racine' : 'Root Cause'}
            </span>
          </div>
          <div className="py-1">
            <p className="text-sm font-extrabold text-[#fef08a] leading-snug">
              ⚠️ {topTrap ? topTrap.warningFr : "Tu fais régulièrement l'erreur INNER JOIN vs LEFT JOIN."}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#fbbf24]">
            <span>{isFr ? 'Piège identifié :' : 'Identified trap:'} {topTrap?.trap}</span>
            <span className="text-xs font-bold text-[#f59e0b]">
              {topTrap?.errorCount} {isFr ? 'erreurs' : 'errors'} / {topTrap?.totalAttempts}
            </span>
          </div>
        </div>
      </div>

      {/* INSPECTEUR DE MÉTADONNÉES DE LA QUESTION / DU PIÈGE
          Format exact :
          {
            topic: "SQL",
            subtopic: "JOIN",
            difficulty: 3,
            trap: "LEFT vs INNER JOIN",
            concepts: ["NULL", "JOIN"],
            estimatedTime: 45
          }
      */}
      {topTrap && (
        <div className="p-4 rounded-xl bg-[#000f21] border border-[#1b2b3f] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#38bdf8]" />
              <span className="font-mono text-xs font-bold text-[#d3e4fe]">
                {isFr ? 'Métadonnées de Qualification du Piège' : 'Question Trap Metadata Payload'}
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#89929b]">
              JSON Metadata Schema
            </span>
          </div>

          {/* Chips de métadonnées */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Topic */}
            <div className="px-2.5 py-1 rounded-lg bg-[#102034] border border-[#1b2b3f] flex items-center gap-1.5">
              <span className="text-[#89929b]">topic:</span>
              <span className="text-[#38bdf8] font-bold">"{topTrap.topic}"</span>
            </div>

            {/* Subtopic */}
            <div className="px-2.5 py-1 rounded-lg bg-[#102034] border border-[#1b2b3f] flex items-center gap-1.5">
              <span className="text-[#89929b]">subtopic:</span>
              <span className="text-[#4edea3] font-bold">"{topTrap.subtopic}"</span>
            </div>

            {/* Difficulty */}
            <div className="px-2.5 py-1 rounded-lg bg-[#102034] border border-[#1b2b3f] flex items-center gap-1.5">
              <span className="text-[#89929b]">difficulty:</span>
              <span className="text-[#fbbf24] font-bold">{topTrap.difficulty}</span>
              <span className="text-[10px] text-[#89929b]">/ 5</span>
            </div>

            {/* Trap Name */}
            <div className="px-2.5 py-1 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/40 flex items-center gap-1.5">
              <span className="text-[#fbbf24]">trap:</span>
              <span className="text-white font-extrabold">"{topTrap.trap}"</span>
            </div>

            {/* Concepts Array */}
            <div className="px-2.5 py-1 rounded-lg bg-[#102034] border border-[#1b2b3f] flex items-center gap-1.5">
              <span className="text-[#89929b]">concepts:</span>
              <span className="text-[#c084fc] font-bold">
                [{topTrap.concepts.map((c) => `"${c}"`).join(', ')}]
              </span>
            </div>

            {/* Estimated Time */}
            <div className="px-2.5 py-1 rounded-lg bg-[#102034] border border-[#1b2b3f] flex items-center gap-1.5">
              <Timer className="w-3 h-3 text-[#38bdf8]" />
              <span className="text-[#89929b]">estimatedTime:</span>
              <span className="text-[#38bdf8] font-bold">{topTrap.estimatedTime}s</span>
            </div>
          </div>

          {/* Règle Antidote & Explication */}
          <div className="p-3 rounded-lg bg-[#0b1c30] border border-[#1b2b3f] flex items-start gap-2.5 text-xs">
            <Info className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-[#38bdf8] font-mono text-[11px]">
                {isFr ? '💡 RÈGLE ANTIDOTE OFFICIELLE :' : '💡 OFFICIAL ANTIDOTE RULE:'}
              </span>
              <p className="text-[#cbd5e1] leading-relaxed">
                {isFr ? topTrap.antidoteRuleFr : topTrap.antidoteRuleEn}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LISTE DES AUTRES PIÈGES IDENTIFIÉS */}
      {recurring.length > 1 && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] font-bold text-[#89929b] uppercase tracking-wider">
            {isFr ? 'Autres pièges critiques sous surveillance :' : 'Other monitored pitfalls:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recurring.slice(0, 4).map((t) => {
              const isSelected = selectedTrap?.trapId === t.trapId;
              return (
                <button
                  key={t.trapId}
                  onClick={() => setSelectedTrap(t)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-[#1b2b3f] border-[#38bdf8] ring-1 ring-[#38bdf8]'
                      : 'bg-[#000f21] border-[#1b2b3f] hover:border-[#26364a]'
                  }`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                      <span className="font-mono text-xs font-bold text-[#d3e4fe] truncate">
                        {t.trap}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#89929b] truncate">
                      {t.topic} • {t.subtopic}
                    </span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 font-mono text-xs">
                    <span className="text-[#ef4444] font-bold">
                      {t.errorCount} {isFr ? 'err.' : 'err.'}
                    </span>
                    <span className="text-[10px] text-[#89929b]">
                      sur {t.totalAttempts}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIONS : Lancer la séance ciblée & Réinitialiser */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-mono text-[#89929b]">
          <span>{isFr ? 'Seuil d\'alerte :' : 'Trigger threshold:'}</span>
          <span className="text-[#fbbf24] font-bold">{isFr ? '≥ 2 erreurs sur le même piège' : '≥ 2 mistakes on same trap'}</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-[#000f21] hover:bg-[#1b2b3f] text-[#89929b] hover:text-[#d3e4fe] border border-[#1b2b3f] transition-colors"
            title={isFr ? 'Réinitialiser les pièges' : 'Reset traps'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onOpenTargetedSession && (
            <button
              id="trap-launch-targeted-session-btn"
              onClick={onOpenTargetedSession}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0284c7] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-extrabold text-xs shadow-md shadow-[#0284c7]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 text-[#38bdf8]" />
              <span>{isFr ? 'Désamorcer ces pièges (Séance ciblée)' : 'Disarm Traps (Targeted Drill)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
