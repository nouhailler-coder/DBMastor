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
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  BookmarkCheck,
  Filter
} from 'lucide-react';
import { examDomainMatrix, cheatSheets, certificationProgramsCatalog } from '../data/mockData';
import { CertificationTrackId, NavigationTab } from '../types';

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
  const [copiedMatrix, setCopiedMatrix] = useState(false);
  const [downloadToast, setDownloadToast] = useState(false);

  const certTabs: { id: CertificationTrackId; label: string }[] = [
    { id: 'oracle-1z0-071', label: 'Oracle 1Z0-071' },
    { id: 'azure-dp-900', label: 'Azure DP-900' },
    { id: 'azure-dp-800', label: 'Azure DP-800' },
    { id: 'postgres-edb', label: 'PostgreSQL EDB' },
    { id: 'mysql-80-dba', label: 'MySQL 8.0' },
  ];

  const currentProgram = certificationProgramsCatalog.find((p) => p.id === selectedCert) || certificationProgramsCatalog[0];

  const handleCopyMatrix = () => {
    const tableData = cheatSheets[1]?.tableData;
    if (!tableData) return;
    const md = `| ${tableData.headers.join(' | ')} |\n| ${tableData.headers.map(() => '---').join(' | ')} |\n` +
      tableData.rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
    navigator.clipboard.writeText(md);
    setCopiedMatrix(true);
    setTimeout(() => setCopiedMatrix(false), 2000);
  };

  const handleDownloadPdf = () => {
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 2500);
  };

  // Filter domains based on search
  const filteredDomains = examDomainMatrix.filter(
    (d) =>
      d.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.desc.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.code.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div id="study-sheets-view" className="p-6 max-w-[1720px] mx-auto w-full flex flex-col gap-6">
      {/* Toast */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4edea3] text-[#003824] font-semibold text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-[#6ffbbe]/40">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {isFr 
              ? 'Fiche de synthèse PDF générée et prête pour impression !' 
              : 'Summary PDF sheet generated and ready for print!'}
          </span>
        </div>
      )}

      {/* 1. HEADER & META ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#93ccff] bg-[#1b2b3f] px-2.5 py-0.5 rounded-full border border-[#26364a] font-semibold">
              Curriculum v2024.4
            </span>
            <span className="text-[#89929b] font-mono text-xs">•</span>
            <span className="font-mono text-xs text-[#4edea3]">
              {isFr ? '42 Fiches Validées' : '42 Cheat Sheets Validated'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#d3e4fe]">
            {isFr ? 'Fiches Mémos & Objectifs d\'Épreuve' : 'Exam Objectives & Study Sheets'}
          </h1>
          <p className="text-xs text-[#bfc7d2] max-w-2xl">
            {isFr 
              ? 'Synthèses ultra-denses des pièges classiques, comparatifs multi-SGBD et checklists de compétences requises pour l\'examen officiel.' 
              : 'Concise high-yield cheat sheets, edge-case traps, and cross-RDBMS matrix for the official certification exam.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[#89929b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={isFr ? "Filtrer domaines ou concepts..." : "Filter domains or concepts..."}
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
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* 3. SECTION 1: EXAM DOMAIN MASTERY MATRIX (6 DOMAIN CARDS) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#93ccff]" />
            <h2 className="text-base font-bold text-[#d3e4fe]">
              {isFr ? 'Matrice de Maîtrise des Domaines 1Z0-071' : 'Exam Domain Mastery Matrix (1Z0-071)'}
            </h2>
          </div>
          <span className="font-mono text-xs text-[#89929b]">
            6 {isFr ? 'domaines officiels' : 'official domains'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDomains.map((dom, i) => (
            <div
              key={i}
              className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col justify-between hover:border-[#26364a] transition-all group"
            >
              <div className="flex flex-col gap-2.5">
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

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#1b2b3f] font-mono text-[10px]">
                <span className="text-[#89929b]">{isFr ? 'Pondération:' : 'Weight:'} {dom.weight}</span>
                <span className="text-[#bfc7d2]">{dom.footnote}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SECTION 2: 3 CRITICAL INTERACTIVE CHEAT SHEETS */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4 text-[#4edea3]" />
          <h2 className="text-base font-bold text-[#d3e4fe]">
            {isFr ? 'Fiches Mémos à Haut Rendement' : 'Critical High-Yield Cheat Sheets'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* SHEET 1: NULL IN VS NOT IN */}
          <div className="bg-[#102034] p-5 rounded-xl border border-[#ffb4ab]/30 shadow-md flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-[#93000a]/30 text-[#ffb4ab] font-mono text-[10px] font-bold border border-[#ffb4ab]/30">
                  {cheatSheets[0].tag}
                </span>
                <span className="font-mono text-xs text-[#89929b]">#01</span>
              </div>

              <h3 className="text-base font-bold text-[#d3e4fe]">
                {cheatSheets[0].title}
              </h3>

              <p className="text-xs text-[#bfc7d2] leading-relaxed">
                {cheatSheets[0].summary}
              </p>

              {/* Code snippet */}
              <div className="p-3 bg-[#000f21] rounded-lg border border-[#1b2b3f] font-mono text-[11px] text-[#93ccff] whitespace-pre-wrap leading-relaxed shadow-inner">
                {cheatSheets[0].codeSnippet}
              </div>

              {/* Mnemonic tip */}
              <div className="p-2.5 bg-[#0b1c30] rounded-lg border border-[#1b2b3f] text-xs text-[#4edea3] flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{cheatSheets[0].mnemonicTip}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('sandbox')}
              className="w-full py-2 px-3 bg-[#1b2b3f] hover:bg-[#26364a] text-[#93ccff] font-mono text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-[#26364a]"
            >
              <span>{isFr ? 'Tester ce piège dans le lab' : 'Test trap in SQL Lab'}</span>
              <Terminal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SHEET 2: POLYGLOT SQL MATRIX */}
          <div className="bg-[#102034] p-5 rounded-xl border border-[#89ceff]/30 shadow-md flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-[#00a2e6]/20 text-[#89ceff] font-mono text-[10px] font-bold border border-[#89ceff]/30">
                  {cheatSheets[1].tag}
                </span>
                <span className="font-mono text-xs text-[#89929b]">#02</span>
              </div>

              <h3 className="text-base font-bold text-[#d3e4fe]">
                {cheatSheets[1].title}
              </h3>

              <p className="text-xs text-[#bfc7d2] leading-relaxed">
                {cheatSheets[1].summary}
              </p>

              {/* Matrix Table */}
              <div className="overflow-x-auto rounded-lg border border-[#1b2b3f] bg-[#000f21]">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead>
                    <tr className="bg-[#0b1c30] border-b border-[#1b2b3f] text-[#89929b]">
                      {cheatSheets[1].tableData?.headers.map((h, idx) => (
                        <th key={idx} className="p-2 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#102034] text-[#d3e4fe]">
                    {cheatSheets[1].tableData?.rows.map((r, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#102034]/50">
                        <td className="p-2 text-[#93ccff] font-bold">{r[0]}</td>
                        <td className="p-2 text-[#4edea3]">{r[1]}</td>
                        <td className="p-2 text-[#bfc7d2]">{r[2]}</td>
                        <td className="p-2 text-[#bfc7d2]">{r[3]}</td>
                        <td className="p-2 text-[#89ceff]">{r[4]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={handleCopyMatrix}
              className="w-full py-2 px-3 bg-[#1b2b3f] hover:bg-[#26364a] text-[#89ceff] font-mono text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-[#26364a]"
            >
              {copiedMatrix ? <Check className="w-3.5 h-3.5 text-[#4edea3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMatrix ? (isFr ? 'Copié en Markdown !' : 'Copied!') : (isFr ? 'Copier en Markdown' : 'Copy as Markdown')}</span>
            </button>
          </div>

          {/* SHEET 3: DML RULES ON VIEWS */}
          <div className="bg-[#102034] p-5 rounded-xl border border-[#4edea3]/30 shadow-md flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-[#003824]/40 text-[#4edea3] font-mono text-[10px] font-bold border border-[#4edea3]/30">
                  {cheatSheets[2].tag}
                </span>
                <span className="font-mono text-xs text-[#89929b]">#03</span>
              </div>

              <h3 className="text-base font-bold text-[#d3e4fe]">
                {cheatSheets[2].title}
              </h3>

              <p className="text-xs text-[#bfc7d2] leading-relaxed">
                {cheatSheets[2].summary}
              </p>

              {/* Rules Cards */}
              <div className="flex flex-col gap-2">
                <div className="p-2.5 rounded-lg bg-[#003824]/20 border border-[#4edea3]/40 flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-[#4edea3] font-bold uppercase">
                    ✓ {cheatSheets[2].rules?.allowed.title} ({cheatSheets[2].rules?.allowed.subtitle})
                  </span>
                  <p className="text-[11px] text-[#bfc7d2] leading-snug">
                    {cheatSheets[2].rules?.allowed.desc}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#690005]/20 border border-[#ffb4ab]/40 flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-[#ffb4ab] font-bold uppercase">
                    ✕ {cheatSheets[2].rules?.prohibited.title} ({cheatSheets[2].rules?.prohibited.subtitle})
                  </span>
                  <p className="text-[11px] text-[#bfc7d2] leading-snug">
                    {cheatSheets[2].rules?.prohibited.desc}
                  </p>
                </div>
              </div>

              <div className="p-2 rounded bg-[#000f21] border border-[#1b2b3f] font-mono text-[10px] text-[#93ccff]">
                {cheatSheets[2].rules?.keyClause}
              </div>
            </div>

            <button
              onClick={() => onNavigate('exams')}
              className="w-full py-2 px-3 bg-[#1b2b3f] hover:bg-[#26364a] text-[#4edea3] font-mono text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-[#26364a]"
            >
              <span>{isFr ? 'Test 10 questions pièges' : '10-question drill test'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. SECTION 3: RECURRING OBJECTIVES & KEYWORDS PILLARS */}
      <div className="bg-[#102034] p-5 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-4">
        <h3 className="text-base font-bold text-[#d3e4fe]">
          {isFr ? 'Mots-Clés Récurrents & Piliers d\'Épreuve' : 'Recurring Exam Keywords & Core Pillars'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3 bg-[#000f21] rounded-lg border border-[#1b2b3f] flex flex-col gap-2">
            <span className="text-[#4edea3] font-bold">1. Maîtrise des NULL</span>
            <div className="flex flex-wrap gap-1">
              {['NVL', 'NVL2', 'NULLIF', 'COALESCE', 'IS NULL'].map((kw) => (
                <span key={kw} className="px-1.5 py-0.5 rounded bg-[#102034] text-[#93ccff] text-[10px]">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#000f21] rounded-lg border border-[#1b2b3f] flex flex-col gap-2">
            <span className="text-[#89ceff] font-bold">2. Jointures & ANSI</span>
            <div className="flex flex-wrap gap-1">
              {['NATURAL JOIN', 'USING', 'ON', 'CROSS JOIN', '(+)'].map((kw) => (
                <span key={kw} className="px-1.5 py-0.5 rounded bg-[#102034] text-[#93ccff] text-[10px]">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#000f21] rounded-lg border border-[#1b2b3f] flex flex-col gap-2">
            <span className="text-[#93ccff] font-bold">3. Objets Dictionnaire</span>
            <div className="flex flex-wrap gap-1">
              {['USER_TABLES', 'ALL_VIEWS', 'DBA_INDEXES', 'USER_SEQUENCES'].map((kw) => (
                <span key={kw} className="px-1.5 py-0.5 rounded bg-[#102034] text-[#93ccff] text-[10px]">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#000f21] rounded-lg border border-[#1b2b3f] flex flex-col gap-2">
            <span className="text-[#ffb4ab] font-bold">4. DDL & Transactions</span>
            <div className="flex flex-wrap gap-1">
              {['COMMIT', 'ROLLBACK', 'SAVEPOINT', 'FLASHBACK', 'TRUNCATE'].map((kw) => (
                <span key={kw} className="px-1.5 py-0.5 rounded bg-[#102034] text-[#93ccff] text-[10px]">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. ALL CERTIFICATION SYLLABI DIRECTORY */}
      <div className="bg-[#102034] p-5 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#1b2b3f] pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#93ccff]" />
            <h3 className="text-sm font-bold text-[#d3e4fe]">
              {isFr ? 'Répertoire des Liens vers les Programmes Officiels' : 'Official Certification Syllabi Directory'}
            </h3>
          </div>
          <span className="font-mono text-xs text-[#89929b]">5 URLs certifiées</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {certificationProgramsCatalog.map((prog) => (
            <a
              key={prog.id}
              href={prog.officialSyllabusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#0b1c30] hover:bg-[#1b2b3f] rounded-lg border border-[#1b2b3f] hover:border-[#26364a] transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#93ccff] font-bold">{prog.code}</span>
                  <span className="text-[10px] text-[#89929b] truncate">{prog.provider}</span>
                </div>
                <span className="text-xs font-semibold text-[#d3e4fe] group-hover:text-[#93ccff] transition-colors truncate">
                  {prog.name}
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#000f21] border border-[#1b2b3f] flex items-center justify-center shrink-0 text-[#89ceff] group-hover:text-[#93ccff]">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
