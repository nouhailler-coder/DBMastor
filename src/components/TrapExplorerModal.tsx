import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Tag,
  Timer,
  Info,
  Zap,
  ArrowRight,
  Brain,
  RotateCcw
} from 'lucide-react';
import { TrapDiagnosticRecord, QuestionTrapMetadata } from '../types';
import { getStoredTraps, resetTrapsToDefault, saveTraps } from '../services/trapService';

interface TrapExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
  onLaunchTargetedSession?: () => void;
}

export const TrapExplorerModal: React.FC<TrapExplorerModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme = 'dark',
  onLaunchTargetedSession,
}) => {
  if (!isOpen) return null;

  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  const [traps, setTraps] = useState<TrapDiagnosticRecord[]>(() => getStoredTraps());
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTrapId, setActiveTrapId] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setTraps(getStoredTraps());
    };
    window.addEventListener('dbmastery:traps_updated', handleUpdate);
    return () => window.removeEventListener('dbmastery:traps_updated', handleUpdate);
  }, []);

  const filteredTraps = traps.filter((t) => {
    const matchesTopic = selectedTopic === 'all' || t.topic.toLowerCase() === selectedTopic.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      t.trap.toLowerCase().includes(query) ||
      t.subtopic.toLowerCase().includes(query) ||
      t.concepts.some((c) => c.toLowerCase().includes(query)) ||
      t.warningFr.toLowerCase().includes(query);
    return matchesTopic && matchesQuery;
  });

  const activeTrap = traps.find((t) => t.trapId === activeTrapId) || filteredTraps[0] || traps[0];

  const topics = ['all', 'SQL', 'Modélisation', 'Transactions', 'Administration'];

  const handleReset = () => {
    const fresh = resetTrapsToDefault();
    setTraps(fresh);
    setActiveTrapId(fresh[0]?.trapId || null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0b1c30] rounded-3xl border border-[#26364a] shadow-2xl flex flex-col overflow-hidden">
        {/* Glow de fond */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#f59e0b]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* HEADER */}
        <div className="p-5 sm:p-6 border-b border-[#1b2b3f] flex items-center justify-between gap-4 bg-[#102034]/70">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#78350f] to-[#f59e0b]/30 border border-[#f59e0b]/60 flex items-center justify-center text-[#fbbf24] shadow-lg shadow-[#f59e0b]/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-[#f59e0b] px-2 py-0.5 rounded bg-[#f59e0b]/15 uppercase tracking-wider">
                  {isFr ? 'Observatoire des Pièges' : 'Pitfall Observatory'}
                </span>
                <span className="text-xs font-mono text-[#89929b]">•</span>
                <span className="text-xs font-mono text-[#38bdf8] font-bold">
                  {traps.length} {isFr ? 'pièges répertoriés' : 'cataloged traps'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#d3e4fe] tracking-tight">
                {isFr ? 'Cartographie des Pièges & Diagnostic Cognitif' : 'Certification Trap Matrix & Cognitive Diagnostics'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#89929b] hover:text-[#d3e4fe] hover:bg-[#1b2b3f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BARRE DE RECHERCHE & FILTRES */}
        <div className="p-4 border-b border-[#1b2b3f] bg-[#000f21]/60 flex flex-wrap items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#89929b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFr ? "Rechercher un piège, un concept (ex: JOIN, NULL)..." : "Search pitfall, concept..."}
              className="w-full pl-9 pr-4 py-2 bg-[#102034] border border-[#1b2b3f] focus:border-[#38bdf8] rounded-xl text-xs text-[#d3e4fe] placeholder-[#89929b] outline-none font-mono transition-colors"
            />
          </div>

          {/* Filtres par Topic */}
          <div className="flex flex-wrap items-center gap-1.5">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedTopic.toLowerCase() === t.toLowerCase()
                    ? 'bg-[#38bdf8] text-[#002c47] shadow-sm'
                    : 'bg-[#102034] text-[#89929b] hover:text-[#d3e4fe] border border-[#1b2b3f]'
                }`}
              >
                {t === 'all' ? (isFr ? 'Tous les piliers' : 'All pillars') : t}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENU PRINCIPAL : 2 COLONNES (LISTE DES PIÈGES & DÉTAIL DU PIÈGE SÉLECTIONNÉ) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          
          {/* COLONNE GAUCHE (5 cols) : LISTE DES PIÈGES AVEC BADGES */}
          <div className="lg:col-span-5 border-r border-[#1b2b3f] p-4 flex flex-col gap-2.5 overflow-y-auto">
            {filteredTraps.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#89929b] font-mono">
                {isFr ? 'Aucun piège ne correspond à votre recherche.' : 'No traps found matching criteria.'}
              </div>
            ) : (
              filteredTraps.map((t) => {
                const isSelected = activeTrap?.trapId === t.trapId;
                const isRecurring = t.errorCount >= 2;
                return (
                  <button
                    key={t.trapId}
                    onClick={() => setActiveTrapId(t.trapId)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-[#12253c] border-[#38bdf8] ring-2 ring-[#38bdf8]/40 shadow-lg'
                        : 'bg-[#102034] border-[#1b2b3f] hover:border-[#26364a] hover:bg-[#1b2b3f]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isRecurring ? (
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-extrabold bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40 flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {isFr ? 'RÉCURRENT' : 'RECURRING'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
                            {isFr ? 'SOUS CONTRÔLE' : 'IN CHECK'}
                          </span>
                        )}
                        <span className="font-mono text-xs text-[#89929b]">
                          {t.topic} • {t.subtopic}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#fbbf24]">
                        Diff. {t.difficulty}/5
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#d3e4fe]">
                        {t.trap}
                      </h4>
                      <span className="font-mono text-xs font-bold text-[#ef4444] shrink-0">
                        {t.errorCount} {isFr ? 'erreurs' : 'errors'} / {t.totalAttempts}
                      </span>
                    </div>

                    {/* Alerte textuelle directe */}
                    <p className="text-[11px] text-[#fef08a] font-medium leading-snug line-clamp-2">
                      ⚠️ {isFr ? t.warningFr : t.warningEn}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* COLONNE DROITE (7 cols) : FICHE TECHNIQUE DU PIÈGE SÉLECTIONNÉ */}
          <div className="lg:col-span-7 p-6 overflow-y-auto flex flex-col gap-5 bg-[#000f21]/40">
            {activeTrap && (
              <>
                {/* BANNIÈRE DE STATUT DU PIÈGE */}
                <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                  activeTrap.errorCount >= 2
                    ? 'bg-gradient-to-r from-[#78350f]/30 to-[#f59e0b]/15 border-[#f59e0b]'
                    : 'bg-[#102034] border-[#1b2b3f]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#f59e0b] tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {isFr ? 'Alerte Diagnostique Active' : 'Active Diagnostic Alert'}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#d3e4fe]">
                      {activeTrap.errorCount} {isFr ? 'erreurs enregistrées' : 'recorded errors'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#fef08a] leading-tight">
                    ⚠️ {isFr ? activeTrap.warningFr : activeTrap.warningEn}
                  </h3>
                  <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-[#89929b]">
                    <span>{isFr ? 'Plutôt qu\'un simple :' : 'Far superior to:'}</span>
                    <span className="text-[#ef4444] font-bold">
                      ❌ {activeTrap.errorCount} {isFr ? 'mauvaises réponses' : 'wrong answers'}
                    </span>
                  </div>
                </div>

                {/* FICHE DE MÉTADONNÉES FORMAT JSON DEMANDÉ */}
                <div className="p-4 rounded-2xl bg-[#000f21] border border-[#1b2b3f] flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#38bdf8]">
                      {isFr ? 'Métadonnées normalisées de la question' : 'Standardized Question Metadata'}
                    </span>
                    <span className="text-[10px] font-mono text-[#89929b]">JSON Structure</span>
                  </div>

                  <pre className="p-3.5 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] font-mono text-xs text-[#d3e4fe] overflow-x-auto leading-relaxed">
{`{
  topic: "${activeTrap.topic}",
  subtopic: "${activeTrap.subtopic}",
  difficulty: ${activeTrap.difficulty},
  trap: "${activeTrap.trap}",
  concepts: [${activeTrap.concepts.map((c) => `"${c}"`).join(', ')}],
  estimatedTime: ${activeTrap.estimatedTime}
}`}
                  </pre>
                </div>

                {/* RÈGLE D'OR & ANTIDOTE */}
                <div className="p-4 rounded-2xl bg-[#102034] border border-[#38bdf8]/40 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
                    <span className="font-mono text-xs font-bold text-[#38bdf8]">
                      {isFr ? 'RÈGLE TECHNIQUE ANTIDOTE (POUR LA CERTIFICATION)' : 'ANTIDOTE TECHNICAL RULE'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#d3e4fe] leading-relaxed">
                    {isFr ? activeTrap.antidoteRuleFr : activeTrap.antidoteRuleEn}
                  </p>
                </div>

                {/* STATISTIQUES COGNITIVES DU CANDIDAT */}
                <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col">
                    <span className="text-[10px] text-[#89929b] uppercase">{isFr ? 'Tentatives' : 'Attempts'}</span>
                    <span className="text-base font-extrabold text-[#d3e4fe] mt-0.5">{activeTrap.totalAttempts}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col">
                    <span className="text-[10px] text-[#89929b] uppercase">{isFr ? 'Erreurs' : 'Errors'}</span>
                    <span className="text-base font-extrabold text-[#ef4444] mt-0.5">{activeTrap.errorCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#102034] border border-[#1b2b3f] flex flex-col">
                    <span className="text-[10px] text-[#89929b] uppercase">{isFr ? 'Temps estimé' : 'Est. Time'}</span>
                    <span className="text-base font-extrabold text-[#38bdf8] mt-0.5">{activeTrap.estimatedTime}s</span>
                  </div>
                </div>

                {/* BOUTON D'ACTION IMMÉDIATE */}
                {onLaunchTargetedSession && (
                  <button
                    onClick={() => {
                      onClose();
                      onLaunchTargetedSession();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0284c7] hover:from-[#0369a1] hover:to-[#0284c7] text-white font-extrabold text-xs shadow-lg shadow-[#0284c7]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-[#38bdf8]" />
                    <span>
                      {isFr 
                        ? `Lancer la séance ciblée anti-pièges (${activeTrap.trap})`
                        : `Launch targeted drill for ${activeTrap.trap}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-[#1b2b3f] bg-[#102034] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-[#000f21] hover:bg-[#1b2b3f] text-[#89929b] hover:text-[#d3e4fe] border border-[#1b2b3f] text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFr ? 'Réinitialiser l\'historique des pièges' : 'Reset trap history'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe] font-semibold text-xs border border-[#26364a] transition-colors"
          >
            {isFr ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
