import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Code2, 
  Copy, 
  Check, 
  Play, 
  Terminal, 
  Lightbulb, 
  ExternalLink,
  CreditCard,
  Target,
  Sparkles
} from 'lucide-react';
import { DomainMasteryItem, CertificationTrackId } from '../types';
import { certificationProgramsCatalog } from '../data/mockData';

interface DomainDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: DomainMasteryItem | null;
  domainsList: DomainMasteryItem[];
  onSelectDomain: (domain: DomainMasteryItem) => void;
  selectedCert: CertificationTrackId;
  lang: 'fr' | 'en';
  onLaunchQuizForDomain?: (domainTitle: string) => void;
  onOpenLab?: () => void;
  onOpenFlashcards?: () => void;
}

export const DomainDetailModal: React.FC<DomainDetailModalProps> = ({
  isOpen,
  onClose,
  domain,
  domainsList,
  onSelectDomain,
  selectedCert,
  lang,
  onLaunchQuizForDomain,
  onOpenLab,
  onOpenFlashcards,
}) => {
  const isFr = lang === 'fr';
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  if (!isOpen || !domain) return null;

  const currentProgram = 
    certificationProgramsCatalog.find((p) => p.id === selectedCert) || 
    certificationProgramsCatalog[0];
  const currentIndex = domainsList.findIndex((d) => d.id === domain.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < domainsList.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      onSelectDomain(domainsList[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onSelectDomain(domainsList[currentIndex + 1]);
    }
  };

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleChecklist = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sheet = domain.sheetDetail;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] bg-[#0b1c30] text-[#d3e4fe] rounded-2xl border border-[#26364a] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-[#1b2b3f] bg-[#000f21]/80 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#102034] text-[#89ceff] border border-[#26364a] font-mono text-xs font-semibold">
                <Target className="w-3.5 h-3.5 text-[#3198dc]" />
                {currentProgram?.code || 'CERT'}
              </span>
              <span className="font-mono text-xs text-[#89929b]">•</span>
              <span className="font-mono text-xs text-[#93ccff] font-medium">
                {currentProgram?.provider || 'Official'}
              </span>
              <span className="font-mono text-xs text-[#89929b]">•</span>
              <span className="px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-[#102034] text-[#4edea3] border border-[#1b2b3f]">
                {isFr ? `Poids examen : ${domain.weight}` : `Exam weight: ${domain.weight}`}
              </span>
            </div>

            {/* Navigation & Close */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#102034] rounded-lg border border-[#1b2b3f] p-0.5">
                <button
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  title={isFr ? 'Domaine précédent' : 'Previous domain'}
                  className="p-1.5 rounded text-[#bfc7d2] hover:text-[#d3e4fe] hover:bg-[#1b2b3f] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono text-xs text-[#89929b]">
                  {currentIndex + 1} / {domainsList.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={!hasNext}
                  title={isFr ? 'Domaine suivant' : 'Next domain'}
                  className="p-1.5 rounded text-[#bfc7d2] hover:text-[#d3e4fe] hover:bg-[#1b2b3f] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-[#102034] border border-[#1b2b3f] text-[#89929b] hover:text-[#d3e4fe] hover:bg-[#1b2b3f] transition-colors"
                title={isFr ? 'Fermer la fiche' : 'Close study sheet'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <div className="font-mono text-xs font-semibold text-[#89ceff] tracking-wider mb-1">
              {domain.code}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#d3e4fe] tracking-tight">
              {domain.title}
            </h2>
            <p className="text-sm text-[#bfc7d2] mt-1.5 leading-relaxed">
              {domain.desc}
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex items-center gap-4 pt-2 border-t border-[#1b2b3f]/60 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-mono text-[#89929b]">
              <span>{isFr ? 'Statut actuel :' : 'Current status:'}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${domain.badgeClass}`}>
                {domain.statusLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#89929b]">
              <span>{isFr ? 'Couverture :' : 'Coverage:'}</span>
              <span className="text-[#d3e4fe] font-semibold">{domain.sheetsRead} ({domain.percent}%)</span>
            </div>
            {sheet?.officialRef && (
              <div className="flex items-center gap-1.5 text-xs text-[#89ceff] ml-auto font-mono">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="truncate max-w-[280px] sm:max-w-md">{sheet.officialRef}</span>
              </div>
            )}
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. OFFICIAL SYLLABUS OBJECTIVES */}
          {sheet?.objectives && sheet.objectives.length > 0 && (
            <div className="bg-[#102034] p-4 sm:p-5 rounded-xl border border-[#1b2b3f] space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#89ceff]" />
                <h3 className="text-sm font-bold text-[#d3e4fe] uppercase tracking-wider font-mono">
                  {isFr ? 'Objectifs Officiels & Exigences de l\'Épreuve' : 'Official Exam Syllabus Objectives'}
                </h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {sheet.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[#bfc7d2] leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#4edea3] shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 2. THEORETICAL DEEP-DIVE */}
          {sheet?.keyConcepts && sheet.keyConcepts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#4edea3]" />
                <h3 className="text-sm font-bold text-[#d3e4fe] uppercase tracking-wider font-mono">
                  {isFr ? 'Principes Fondamentaux & Fonctionnement Interne' : 'Core Theoretical Principles & Mechanics'}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {sheet.keyConcepts.map((concept, i) => (
                  <div key={i} className="p-4 bg-[#102034] rounded-xl border border-[#1b2b3f] space-y-1.5">
                    <h4 className="text-sm font-bold text-[#93ccff] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3198dc]"></span>
                      {concept.title}
                    </h4>
                    <p className="text-xs text-[#bfc7d2] leading-relaxed">
                      {concept.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. PRACTICAL CODE EXAMPLES */}
          {sheet?.codeExamples && sheet.codeExamples.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#89ceff]" />
                <h3 className="text-sm font-bold text-[#d3e4fe] uppercase tracking-wider font-mono">
                  {isFr ? 'Syntaxes Types & Extraits de Code Essentiels' : 'Standard Syntax & Essential Code Snippets'}
                </h3>
              </div>
              <div className="space-y-4">
                {sheet.codeExamples.map((ex, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-[#26364a] bg-[#000f21]">
                    <div className="px-4 py-2.5 bg-[#102034] border-b border-[#1b2b3f] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#d3e4fe]">{ex.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-[#000f21] text-[#89929b]">
                          {ex.language}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(ex.code, i)}
                        className="flex items-center gap-1 text-[11px] font-mono text-[#89ceff] hover:text-[#d3e4fe] px-2 py-1 rounded bg-[#000f21] hover:bg-[#1b2b3f] transition-colors"
                      >
                        {copiedIndex === i ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#4edea3]" />
                            <span>{isFr ? 'Copié !' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isFr ? 'Copier' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono text-[#93ccff] overflow-x-auto leading-relaxed">
                      <code>{ex.code}</code>
                    </pre>
                    {ex.explanation && (
                      <div className="px-4 py-2.5 bg-[#0b1c30] border-t border-[#1b2b3f] text-xs text-[#bfc7d2]">
                        <span className="font-semibold text-[#89ceff]">Note : </span>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. EXAM TRAPS & PITFALLS */}
          {sheet?.examTraps && sheet.examTraps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" />
                <h3 className="text-sm font-bold text-[#ffb4ab] uppercase tracking-wider font-mono">
                  {isFr ? 'Pièges d\'Examen Majeurs & Règles Strictes' : 'Major Exam Pitfalls & Strict Rules'}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {sheet.examTraps.map((trap, i) => (
                  <div key={i} className="p-4 bg-[#102034] rounded-xl border border-[#93000a]/40 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#93000a]/20 text-[#ffb4ab] border border-[#93000a]/40">
                        {isFr ? 'PIÈGE RECURRENT' : 'CRITICAL TRAP'}
                      </span>
                      <h4 className="text-sm font-bold text-[#d3e4fe]">{trap.trapTitle}</h4>
                    </div>
                    <p className="text-xs text-[#bfc7d2] leading-relaxed">
                      {trap.description}
                    </p>
                    {(trap.wrongSyntax || trap.correctSyntax) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                        {trap.wrongSyntax && (
                          <div className="p-2.5 rounded-lg bg-[#93000a]/15 border border-[#93000a]/30 text-[#ffb4ab]">
                            <div className="text-[10px] uppercase font-bold text-[#ffb4ab] mb-1 flex items-center gap-1">
                              <span>✕ {isFr ? 'Syntaxe Erronée' : 'Incorrect Syntax'}</span>
                            </div>
                            <code>{trap.wrongSyntax}</code>
                          </div>
                        )}
                        {trap.correctSyntax && (
                          <div className="p-2.5 rounded-lg bg-[#003824]/20 border border-[#003824] text-[#4edea3]">
                            <div className="text-[10px] uppercase font-bold text-[#4edea3] mb-1 flex items-center gap-1">
                              <span>✓ {isFr ? 'Syntaxe Valide' : 'Valid Syntax'}</span>
                            </div>
                            <code>{trap.correctSyntax}</code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. MNEMONIC & CHECKLIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sheet?.mnemonic && (
              <div className="p-4 bg-[#102034] rounded-xl border border-[#26364a] flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#f59e0b] uppercase">
                  <Lightbulb className="w-4 h-4 text-[#f59e0b]" />
                  <span>{isFr ? 'Astuce Mnémotechnique' : 'Memory Mnemonic'}</span>
                </div>
                <p className="text-xs text-[#d3e4fe] leading-relaxed italic bg-[#000f21] p-3 rounded-lg border border-[#1b2b3f]">
                  "{sheet.mnemonic}"
                </p>
              </div>
            )}

            {sheet?.checklist && sheet.checklist.length > 0 && (
              <div className="p-4 bg-[#102034] rounded-xl border border-[#26364a] flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#4edea3] uppercase">
                  <Sparkles className="w-4 h-4 text-[#4edea3]" />
                  <span>{isFr ? 'Checklist d\'Auto-Évaluation' : 'Self-Assessment Checklist'}</span>
                </div>
                <div className="space-y-1.5">
                  {sheet.checklist.map((item, i) => {
                    const key = `${domain.id}-chk-${i}`;
                    const isChecked = !!checkedItems[key];
                    return (
                      <label 
                        key={i} 
                        className="flex items-start gap-2 text-xs text-[#bfc7d2] cursor-pointer hover:text-[#d3e4fe] select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleChecklist(key)}
                          className="mt-0.5 rounded border-[#26364a] bg-[#000f21] text-[#4edea3] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className={isChecked ? 'line-through text-[#89929b]' : ''}>
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-[#1b2b3f] bg-[#000f21]/90 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {currentProgram?.officialSyllabusUrl && (
              <a
                href={currentProgram.officialSyllabusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#89ceff] hover:underline font-mono"
              >
                <span>{isFr ? 'Programme Officiel Vendeur' : 'Official Vendor Syllabus'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenFlashcards && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFlashcards();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1b2b3f] hover:bg-[#26364a] text-[#89ceff] border border-[#26364a] font-mono text-xs font-semibold transition-colors shadow-sm"
              >
                <CreditCard className="w-3.5 h-3.5 text-[#3198dc]" />
                <span>{isFr ? 'Flashcards du Domaine' : 'Domain Flashcards'}</span>
              </button>
            )}

            {onOpenLab && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLab();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#26364a] font-mono text-xs font-semibold transition-colors"
              >
                <Terminal className="w-3.5 h-3.5 text-[#4edea3]" />
                <span>{isFr ? 'Tester dans SQL Lab' : 'Practice in SQL Lab'}</span>
              </button>
            )}

            {onLaunchQuizForDomain && (
              <button
                onClick={() => {
                  onClose();
                  onLaunchQuizForDomain(domain.title);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#3198dc] hover:bg-[#4edea3] text-[#001f28] hover:text-[#002112] font-semibold text-xs transition-all shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isFr ? 'Lancer Quiz sur ce Domaine' : 'Quiz on this Domain'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#bfc7d2] font-semibold text-xs border border-[#1b2b3f] transition-colors"
            >
              {isFr ? 'Fermer' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
