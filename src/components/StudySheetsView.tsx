import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Download, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Layers, 
  ArrowRight,
  Sparkles,
  BookmarkCheck,
  CreditCard,
  Target
} from 'lucide-react';
import { certificationProgramsCatalog } from '../data/mockData';
import { 
  certificationDomainMatrices, 
  certificationCheatSheets, 
  certificationKeywordsPillars 
} from '../data/certificationDomainsData';
import { CertificationTrackId, NavigationTab, DomainMasteryItem, CheatSheet } from '../types';
import { DomainDetailModal } from './DomainDetailModal';

interface StudySheetsViewProps {
  selectedCert: CertificationTrackId;
  onCertChange: (cert: CertificationTrackId) => void;
  onNavigate: (tab: NavigationTab) => void;
  lang: 'fr' | 'en';
}

export const StudySheetsView: React.FC<StudySheetsViewProps> = ({
  selectedCert,
  onCertChange,
  onNavigate,
  lang,
}) => {
  const isFr = lang === 'fr';
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedMatrixId, setCopiedMatrixId] = useState<string | null>(null);
  const [downloadToast, setDownloadToast] = useState(false);
  const [selectedDomainModal, setSelectedDomainModal] = useState<DomainMasteryItem | null>(null);

  const certTabs: { id: CertificationTrackId; label: string; code: string }[] = [
    { id: 'oracle-1z0-071', label: 'Oracle 1Z0-071', code: '1Z0-071' },
    { id: 'azure-dp-900', label: 'Azure DP-900', code: 'DP-900' },
    { id: 'azure-dp-800', label: 'Azure DP-800', code: 'DP-800' },
    { id: 'postgres-edb', label: 'PostgreSQL EDB', code: 'EDB-PG' },
    { id: 'mysql-80-dba', label: 'MySQL 8.0', code: '1Z0-908' },
  ];

  const currentProgram = certificationProgramsCatalog.find((p) => p.id === selectedCert) || certificationProgramsCatalog[0];

  // Dynamic content retrieved based on active certification
  const activeDomains = certificationDomainMatrices[selectedCert] || certificationDomainMatrices['oracle-1z0-071'];
  const activeCheatSheets = certificationCheatSheets[selectedCert] || certificationCheatSheets['oracle-1z0-071'];
  const activeKeywordsPillars = certificationKeywordsPillars[selectedCert] || certificationKeywordsPillars['oracle-1z0-071'];

  const handleCopyMatrix = (sheet: CheatSheet) => {
    const tableData = sheet.tableData;
    if (!tableData) return;
    const md = `| ${tableData.headers.join(' | ')} |\n| ${tableData.headers.map(() => '---').join(' | ')} |\n` +
      tableData.rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
    navigator.clipboard.writeText(md);
    setCopiedMatrixId(sheet.id);
    setTimeout(() => setCopiedMatrixId(null), 2000);
  };

  const handleDownloadPdf = () => {
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 2500);
  };

  // Filter domains based on search filter
  const filteredDomains = activeDomains.filter(
    (d) =>
      d.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.desc.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.code.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div id="study-sheets-view" className="p-6 max-w-[1720px] mx-auto w-full flex flex-col gap-6">
      {/* Toast */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4edea3] text-[#003824] font-semibold text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-[#6ffbbe]/40 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {isFr 
              ? `Fiche de synthèse PDF pour ${currentProgram.name} générée !` 
              : `Summary PDF sheet for ${currentProgram.name} generated!`}
          </span>
        </div>
      )}

      {/* 1. HEADER & META ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#93ccff] bg-[#1b2b3f] px-2.5 py-0.5 rounded-full border border-[#26364a] font-semibold">
              Curriculum {currentProgram.provider} • v2024/2025
            </span>
            <span className="text-[#89929b] font-mono text-xs">•</span>
            <span className="font-mono text-xs text-[#4edea3] font-semibold">
              {activeDomains.length} {isFr ? 'Domaines' : 'Domains'} • {activeCheatSheets.length} {isFr ? 'Fiches Synthèses' : 'Key Sheets'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#d3e4fe]">
            {isFr ? 'Fiches Mémos & Objectifs d\'Épreuve' : 'Exam Objectives & Study Sheets'}
          </h1>
          <p className="text-xs text-[#bfc7d2] max-w-2xl">
            {isFr 
              ? `Synthèses ultra-denses, pièges classiques et fiches complètes pour la certification ${currentProgram.name} (${currentProgram.code}). Cliquez sur un domaine pour ouvrir sa fiche détaillée.` 
              : `Concise high-yield cheat sheets, edge-case traps, and full domain study sheets for ${currentProgram.name} (${currentProgram.code}). Click any domain to open its full sheet.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigate('flashcards')}
            className="px-3.5 py-2 bg-[#1b2b3f] hover:bg-[#26364a] text-[#89ceff] border border-[#26364a] font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#3198dc]" />
            <span>{isFr ? 'Flashcards DOM-01 à 06 (600)' : 'DOM-01-06 Flashcards (600)'}</span>
          </button>

          <button
            onClick={() => onNavigate('exams')}
            className="px-3.5 py-2 bg-[#3198dc] hover:bg-[#93ccff] text-[#002c47] font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-[#3198dc]/20 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isFr ? 'Générer un quiz ciblé' : 'Generate Targeted Quiz'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-3.5 py-2 bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#93ccff]" />
            <span>{isFr ? 'Fiche PDF récapitulative' : 'Download Summary PDF'}</span>
          </button>
        </div>
      </div>

      {/* 2. CERTIFICATION TRACK TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#102034] p-2 rounded-xl border border-[#1b2b3f]">
        {/* Track tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {certTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onCertChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                selectedCert === tab.id
                  ? 'bg-[#3198dc] text-[#002c47] shadow-sm'
                  : 'text-[#bfc7d2] hover:text-[#d3e4fe] hover:bg-[#1b2b3f]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-[#89929b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={isFr ? `Filtrer ${currentProgram.code}...` : `Filter ${currentProgram.code}...`}
            className="w-full h-8 pl-8 pr-3 bg-[#000f21] border border-[#1b2b3f] text-xs text-[#d3e4fe] rounded-lg outline-none focus:border-[#3198dc]"
          />
        </div>
      </div>

      {/* 2.5 OFFICIAL CURRICULUM SYLLABUS DIRECT ACCESS BANNER */}
      <div className="bg-[#102034] p-4 rounded-xl border border-[#26364a] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
            style={{ backgroundColor: `${currentProgram.accentColor}20`, border: `1px solid ${currentProgram.accentColor}40` }}
          >
            <BookOpen className="w-5 h-5" style={{ color: currentProgram.accentColor }} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase"
                style={{ backgroundColor: `${currentProgram.accentColor}20`, color: currentProgram.accentColor }}
              >
                {currentProgram.providerBadge} • {currentProgram.code}
              </span>
              <span className="text-xs font-mono text-[#89929b]">
                {isFr ? 'Seuil:' : 'Pass:'} {currentProgram.passingScore} • {currentProgram.duration} • {currentProgram.questionsCount}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#d3e4fe]">
              {currentProgram.name}
            </h3>
            <p className="text-xs text-[#bfc7d2] max-w-2xl leading-relaxed">
              {isFr ? currentProgram.description.fr : currentProgram.description.en}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <a
            href={currentProgram.officialSyllabusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-lg bg-[#3198dc] hover:bg-[#93ccff] text-[#002c47] font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-[#3198dc]/20 active:scale-95 whitespace-nowrap"
            title={isFr ? "Accéder à la page du programme officiel" : "Access official syllabus page"}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isFr ? 'Programme officiel de l\'examen' : 'Official Exam Syllabus'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {currentProgram.studyGuideUrl && (
            <a
              href={currentProgram.studyGuideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-[#000f21] hover:bg-[#1b2b3f] text-[#89ceff] hover:text-[#d3e4fe] border border-[#1b2b3f] hover:border-[#26364a] font-semibold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
              title={isFr ? "Guide d'étude & préparation officiel" : "Official Study Guide"}
            >
              <span>{isFr ? 'Guide d\'étude' : 'Study Guide'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* 3. SECTION 1: DYNAMIC EXAM DOMAIN MASTERY MATRIX */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#93ccff]" />
            <h2 className="text-base font-bold text-[#d3e4fe]">
              {isFr 
                ? `Matrice de Maîtrise des Domaines - ${currentProgram.name} (${currentProgram.code})` 
                : `Domain Mastery Matrix - ${currentProgram.name} (${currentProgram.code})`}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#89929b]">
              {activeDomains.length} {isFr ? 'domaines officiels' : 'official domains'}
            </span>
            <span className="hidden sm:inline-block font-mono text-[11px] text-[#4edea3] bg-[#003824]/30 px-2 py-0.5 rounded border border-[#003824]">
              {isFr ? '⚡ Cliquer sur un domaine pour ouvrir sa fiche intégrale' : '⚡ Click any domain to open full study sheet'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDomains.map((dom) => (
            <div
              key={dom.id}
              onClick={() => setSelectedDomainModal(dom)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedDomainModal(dom);
                }
              }}
              className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col justify-between hover:border-[#3198dc] hover:bg-[#13253c] transition-all group cursor-pointer active:scale-[0.99] relative overflow-hidden"
              title={isFr ? `Cliquer pour consulter l'intégralité de la fiche : ${dom.title}` : `Click to view full study sheet: ${dom.title}`}
            >
              {/* Subtle top indicator */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: dom.accentColor }}
              />

              <div className="flex flex-col gap-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#93ccff] font-bold">
                    {dom.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${dom.badgeClass}`}>
                    {dom.statusLabel}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#d3e4fe] group-hover:text-[#93ccff] transition-colors leading-snug">
                  {dom.title}
                </h3>

                <p className="text-xs text-[#bfc7d2] leading-relaxed line-clamp-3">
                  {dom.desc}
                </p>

                {/* Progress bar */}
                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#89929b]">{dom.sheetsRead}</span>
                    <span className="text-[#d3e4fe] font-bold">{dom.percent}%</span>
                  </div>
                  <div className="w-full bg-[#000f21] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${dom.percent}%`, backgroundColor: dom.accentColor }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#1b2b3f] font-mono text-[10px]">
                <span className="text-[#89929b]">{isFr ? 'Pondération:' : 'Weight:'} {dom.weight}</span>
                <span className="inline-flex items-center gap-1 text-[#89ceff] font-semibold group-hover:text-[#93ccff] group-hover:underline">
                  <span>{isFr ? 'Fiche complète' : 'Full sheet'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SECTION 2: DYNAMIC HIGH-YIELD CHEAT SHEETS */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-[#4edea3]" />
            <h2 className="text-base font-bold text-[#d3e4fe]">
              {isFr ? `Fiches Mémos & Pièges à Haut Rendement - ${currentProgram.code}` : `High-Yield Cheat Sheets - ${currentProgram.code}`}
            </h2>
          </div>
          <span className="font-mono text-xs text-[#89929b]">
            {activeCheatSheets.length} {isFr ? 'fiches de synthèse' : 'curated sheets'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {activeCheatSheets.map((sheet, index) => {
            const isTrap = sheet.badgeType === 'trap';
            const isMatrix = sheet.badgeType === 'matrix';
            const isDdl = sheet.badgeType === 'ddl';

            const borderColor = isTrap 
              ? 'border-[#ffb4ab]/30' 
              : isMatrix 
                ? 'border-[#89ceff]/30' 
                : 'border-[#4edea3]/30';

            const badgeBg = isTrap 
              ? 'bg-[#93000a]/30 text-[#ffb4ab] border-[#ffb4ab]/30' 
              : isMatrix 
                ? 'bg-[#00a2e6]/20 text-[#89ceff] border-[#89ceff]/30' 
                : 'bg-[#003824]/40 text-[#4edea3] border-[#4edea3]/30';

            return (
              <div 
                key={sheet.id}
                className={`bg-[#102034] p-5 rounded-xl border ${borderColor} shadow-md flex flex-col justify-between gap-4`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${badgeBg}`}>
                      {sheet.tag}
                    </span>
                    <span className="font-mono text-xs text-[#89929b]">#0{index + 1}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#d3e4fe]">
                    {sheet.title}
                  </h3>

                  <p className="text-xs text-[#bfc7d2] leading-relaxed">
                    {sheet.summary}
                  </p>

                  {/* Table format */}
                  {sheet.tableData && (
                    <div className="overflow-x-auto rounded-lg border border-[#1b2b3f] bg-[#000f21]">
                      <table className="w-full text-left font-mono text-[10px]">
                        <thead>
                          <tr className="bg-[#0b1c30] border-b border-[#1b2b3f] text-[#89929b]">
                            {sheet.tableData.headers.map((h, idx) => (
                              <th key={idx} className="p-2 font-semibold whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#102034] text-[#d3e4fe]">
                          {sheet.tableData.rows.map((r, rIdx) => (
                            <tr key={rIdx} className="hover:bg-[#102034]/50">
                              <td className="p-2 text-[#93ccff] font-bold whitespace-nowrap">{r[0]}</td>
                              <td className="p-2 text-[#4edea3] whitespace-nowrap">{r[1]}</td>
                              <td className="p-2 text-[#bfc7d2]">{r[2]}</td>
                              <td className="p-2 text-[#bfc7d2]">{r[3]}</td>
                              {r[4] && <td className="p-2 text-[#89ceff] whitespace-nowrap">{r[4]}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Code snippet */}
                  {sheet.codeSnippet && (
                    <div className="p-3 bg-[#000f21] rounded-lg border border-[#1b2b3f] font-mono text-[11px] text-[#93ccff] whitespace-pre-wrap leading-relaxed shadow-inner">
                      {sheet.codeSnippet}
                    </div>
                  )}

                  {/* Rules section */}
                  {sheet.rules && (
                    <div className="flex flex-col gap-2">
                      <div className="p-2.5 rounded-lg bg-[#003824]/20 border border-[#4edea3]/40 flex flex-col gap-1">
                        <span className="font-mono text-[10px] text-[#4edea3] font-bold uppercase">
                          ✓ {sheet.rules.allowed.title} ({sheet.rules.allowed.subtitle})
                        </span>
                        <p className="text-[11px] text-[#bfc7d2] leading-snug">
                          {sheet.rules.allowed.desc}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#690005]/20 border border-[#ffb4ab]/40 flex flex-col gap-1">
                        <span className="font-mono text-[10px] text-[#ffb4ab] font-bold uppercase">
                          ✕ {sheet.rules.prohibited.title} ({sheet.rules.prohibited.subtitle})
                        </span>
                        <p className="text-[11px] text-[#bfc7d2] leading-snug">
                          {sheet.rules.prohibited.desc}
                        </p>
                      </div>

                      {sheet.rules.keyClause && (
                        <div className="p-2 rounded bg-[#000f21] border border-[#1b2b3f] font-mono text-[10px] text-[#93ccff]">
                          {sheet.rules.keyClause}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mnemonic tip */}
                  {sheet.mnemonicTip && (
                    <div className="p-2.5 bg-[#0b1c30] rounded-lg border border-[#1b2b3f] text-xs text-[#4edea3] flex items-start gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-snug">{sheet.mnemonicTip}</span>
                    </div>
                  )}
                </div>

                {/* Bottom action button */}
                {sheet.tableData ? (
                  <button
                    onClick={() => handleCopyMatrix(sheet)}
                    className="w-full py-2 px-3 bg-[#1b2b3f] hover:bg-[#26364a] text-[#89ceff] font-mono text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-[#26364a]"
                  >
                    {copiedMatrixId === sheet.id ? <Check className="w-3.5 h-3.5 text-[#4edea3]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>
                      {copiedMatrixId === sheet.id 
                        ? (isFr ? 'Copié en Markdown !' : 'Copied!') 
                        : (isFr ? 'Copier en Markdown' : 'Copy as Markdown')}
                    </span>
                  </button>
                ) : isTrap ? (
                  <button
                    onClick={() => onNavigate('sandbox')}
                    className="w-full py-2 px-3 bg-[#1b2b3f] hover:bg-[#26364a] text-[#93ccff] font-mono text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-[#26364a]"
                  >
                    <span>{isFr ? 'Tester ce cas dans le Lab' : 'Test case in SQL Lab'}</span>
                    <Terminal className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('exams')}
                    className="w-full py-2 px-3 bg-[#1b2b3f] hover:bg-[#26364a] text-[#4edea3] font-mono text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-[#26364a]"
                  >
                    <span>{isFr ? 'Lancer quiz d\'entraînement' : 'Practice quiz on this'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SECTION 3: DYNAMIC RECURRING OBJECTIVES & KEYWORDS PILLARS */}
      <div className="bg-[#102034] p-5 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-bold text-[#d3e4fe]">
            {isFr 
              ? `Mots-Clés Récurrents & Piliers d'Épreuve - ${currentProgram.code}` 
              : `Recurring Exam Keywords & Core Pillars - ${currentProgram.code}`}
          </h3>
          <span className="font-mono text-xs text-[#89929b]">
            {currentProgram.provider} Certification Standards
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {activeKeywordsPillars.map((pillar, idx) => (
            <div key={idx} className="p-3 bg-[#000f21] rounded-lg border border-[#1b2b3f] flex flex-col gap-2">
              <span className="font-bold text-xs" style={{ color: pillar.color }}>
                {pillar.title}
              </span>
              <div className="flex flex-wrap gap-1">
                {pillar.keywords.map((kw) => (
                  <span key={kw} className="px-1.5 py-0.5 rounded bg-[#102034] text-[#93ccff] text-[10px]">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. ALL CERTIFICATION SYLLABI DIRECTORY */}
      <div className="bg-[#0b1c30] p-5 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#89ceff]" />
            <h3 className="text-sm font-bold text-[#d3e4fe] uppercase tracking-wider font-mono">
              {isFr ? 'Répertoire des Liens vers les Programmes Officiels' : 'Official Curriculum & Syllabus Directory'}
            </h3>
          </div>
          <span className="font-mono text-xs text-[#89929b]">
            {isFr ? '5 programmes d\'examen certifiés' : '5 certified exam tracks'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {certificationProgramsCatalog.map((prog) => {
            const isCurrent = prog.id === selectedCert;
            return (
              <div
                key={prog.id}
                className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between gap-3 ${
                  isCurrent 
                    ? 'bg-[#102034] border-[#3198dc] ring-1 ring-[#3198dc]/30' 
                    : 'bg-[#000f21] border-[#1b2b3f] hover:border-[#26364a]'
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span 
                      className="font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase"
                      style={{ backgroundColor: `${prog.accentColor}20`, color: prog.accentColor }}
                    >
                      {prog.providerBadge} • {prog.code}
                    </span>
                    {isCurrent && (
                      <span className="font-mono text-[9px] text-[#4edea3] bg-[#003824]/40 px-1.5 py-0.5 rounded font-bold">
                        {isFr ? 'ACTIF' : 'ACTIVE'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#d3e4fe]">
                    {prog.name}
                  </h4>
                  <div className="text-[11px] font-mono text-[#89929b]">
                    {isFr ? 'Durée:' : 'Duration:'} {prog.duration} • {prog.questionsCount}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#1b2b3f] text-xs font-mono">
                  <a
                    href={prog.officialSyllabusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#93ccff] hover:text-[#d3e4fe] hover:underline font-semibold"
                  >
                    <span>{isFr ? 'Programme' : 'Syllabus'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {prog.studyGuideUrl && (
                    <>
                      <span className="text-[#89929b]">•</span>
                      <a
                        href={prog.studyGuideUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#89ceff] hover:text-[#d3e4fe] hover:underline font-semibold"
                      >
                        <span>{isFr ? 'Guide' : 'Guide'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                  {!isCurrent && (
                    <button
                      onClick={() => onCertChange(prog.id)}
                      className="ml-auto text-[10px] text-[#89929b] hover:text-[#d3e4fe] hover:underline"
                    >
                      {isFr ? 'Basculer ↗' : 'Switch ↗'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL STUDY SHEET MODAL (WHEN USER CLICKS ON ANY DOMAIN SECTION) */}
      <DomainDetailModal
        isOpen={!!selectedDomainModal}
        onClose={() => setSelectedDomainModal(null)}
        domain={selectedDomainModal}
        domainsList={activeDomains}
        onSelectDomain={(dom) => setSelectedDomainModal(dom)}
        selectedCert={selectedCert}
        lang={lang}
        onLaunchQuizForDomain={() => {
          onNavigate('exams');
        }}
        onOpenLab={() => {
          onNavigate('sandbox');
        }}
        onOpenFlashcards={() => {
          onNavigate('flashcards');
        }}
      />
    </div>
  );
};
