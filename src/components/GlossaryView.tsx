import React, { useState, useMemo } from 'react';
import { 
  BookMarked, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Terminal, 
  Layers, 
  Tag, 
  ArrowRight,
  Database,
  Sparkles,
  ShieldCheck,
  Cpu,
  GraduationCap,
  Code2
} from 'lucide-react';
import { ALL_GLOSSARY_TERMS, GLOSSARY_CATEGORIES, GLOSSARY_STATS } from '../data/glossary';
import { GlossaryTerm, GlossaryAudience, GlossaryDifficulty } from '../types';

interface GlossaryViewProps {
  lang: 'fr' | 'en';
  initialSearchQuery?: string;
  onNavigateToTab?: (tab: string) => void;
  theme?: 'light' | 'dark';
}

// Token-based SQL syntax renderer for high-contrast, crystal-clear code snippets in both themes
const renderHighlightedSql = (code: string, isLight: boolean) => {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    // Comment line
    if (trimmed.startsWith('--')) {
      return (
        <div key={lineIdx} className={isLight ? 'text-[#059669] italic font-medium' : 'text-[#6ee7b7] italic'}>
          {line}
        </div>
      );
    }

    // Split tokens preserving whitespace, delimiters, strings
    const tokens = line.split(/(\s+|[(),;=<>]+|'[^']*')/g);

    return (
      <div key={lineIdx} className="leading-relaxed">
        {tokens.map((token, tokIdx) => {
          if (!token) return null;
          const upper = token.toUpperCase();
          // SQL Keywords
          if (/^(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|ADD|CONSTRAINT|PRIMARY|KEY|FOREIGN|REFERENCES|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|ON|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|UNION|ALL|AS|DISTINCT|CASE|WHEN|THEN|ELSE|END|AND|OR|NOT|IN|EXISTS|IS|NULL|LIKE|BETWEEN|BEGIN|COMMIT|ROLLBACK|INDEX|VIEW|TRIGGER|FUNCTION|PROCEDURE|RETURNS|EXEC|WITH)$/.test(upper)) {
            return (
              <span key={tokIdx} className={isLight ? 'text-[#0284c7] font-bold' : 'text-[#38bdf8] font-bold'}>
                {token}
              </span>
            );
          }
          // SQL Data Types & Functions
          if (/^(VARCHAR|VARCHAR2|CHAR|TEXT|INT|INTEGER|BIGINT|SMALLINT|DECIMAL|NUMERIC|NUMBER|FLOAT|DOUBLE|REAL|BOOLEAN|DATE|TIME|TIMESTAMP|INTERVAL|UUID|JSON|JSONB|SERIAL|BIGSERIAL|BLOB|CLOB|COUNT|SUM|AVG|MIN|MAX|ROUND|COALESCE|CONCAT|SUBSTRING|LENGTH|NOW|CURRENT_TIMESTAMP|ROW_NUMBER|RANK|DENSE_RANK|OVER|PARTITION)$/.test(upper)) {
            return (
              <span key={tokIdx} className={isLight ? 'text-[#7c3aed] font-semibold' : 'text-[#c084fc] font-semibold'}>
                {token}
              </span>
            );
          }
          // String literals
          if (token.startsWith("'") && token.endsWith("'")) {
            return (
              <span key={tokIdx} className={isLight ? 'text-[#b45309] font-medium' : 'text-[#fbbf24]'}>
                {token}
              </span>
            );
          }
          // Numbers
          if (/^\d+(\.\d+)?$/.test(token)) {
            return (
              <span key={tokIdx} className={isLight ? 'text-[#d97706] font-medium' : 'text-[#f59e0b]'}>
                {token}
              </span>
            );
          }
          // Default identifiers, operators and spaces
          return (
            <span key={tokIdx} className={isLight ? 'text-[#0f172a]' : 'text-[#d3e4fe]'}>
              {token}
            </span>
          );
        })}
      </div>
    );
  });
};

export const GlossaryView: React.FC<GlossaryViewProps> = ({ 
  lang, 
  initialSearchQuery = '',
  theme = 'light',
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [selectedAudience, setSelectedAudience] = useState<GlossaryAudience | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<GlossaryDifficulty | 'all'>('all');
  const [selectedDialect, setSelectedDialect] = useState<'all' | 'postgres' | 'mysql' | 'sqlServer' | 'oracle'>('all');

  // Term expansion state (all terms can be expanded/collapsed)
  const [expandedTermIds, setExpandedTermIds] = useState<Record<string, boolean>>({});
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  // Toggle single term expansion
  const toggleExpand = (termId: string) => {
    setExpandedTermIds(prev => ({
      ...prev,
      [termId]: !prev[termId]
    }));
  };

  // Expand all / Collapse all
  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    ALL_GLOSSARY_TERMS.forEach(t => {
      allExpanded[t.id] = true;
    });
    setExpandedTermIds(allExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedTermIds({});
  };

  // Copy code snippet helper
  const handleCopySnippet = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetId(id);
    setTimeout(() => {
      setCopiedSnippetId(null);
    }, 2000);
  };

  // Filter terms logic
  const filteredTerms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return ALL_GLOSSARY_TERMS.filter(term => {
      // Category filter
      if (selectedCategory !== 'all' && term.category !== selectedCategory) {
        return false;
      }

      // Audience filter
      if (selectedAudience !== 'all' && !term.audience.includes(selectedAudience)) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && term.difficulty !== selectedDifficulty) {
        return false;
      }

      // Dialect filter
      if (selectedDialect !== 'all') {
        if (!term.dialects) return false;
        if (selectedDialect === 'postgres' && !term.dialects.postgres && !term.dialects.universal) return false;
        if (selectedDialect === 'mysql' && !term.dialects.mysql && !term.dialects.universal) return false;
        if (selectedDialect === 'sqlServer' && !term.dialects.sqlServer && !term.dialects.universal) return false;
        if (selectedDialect === 'oracle' && !term.dialects.oracle && !term.dialects.universal) return false;
      }

      // Search query filter across multiple fields
      if (query) {
        const matchFr = term.termFr.toLowerCase().includes(query);
        const matchEn = term.termEn.toLowerCase().includes(query);
        const matchDefFr = term.shortDefFr.toLowerCase().includes(query);
        const matchDefEn = term.shortDefEn.toLowerCase().includes(query);
        const matchExplanation = term.fullExplanationFr.toLowerCase().includes(query) || term.fullExplanationEn.toLowerCase().includes(query);
        const matchSnippet = term.codeSnippet ? term.codeSnippet.toLowerCase().includes(query) : false;
        const matchTags = term.tags ? term.tags.some(t => t.toLowerCase().includes(query)) : false;
        const matchCategory = term.categoryNameFr.toLowerCase().includes(query) || term.categoryNameEn.toLowerCase().includes(query);

        return matchFr || matchEn || matchDefFr || matchDefEn || matchExplanation || matchSnippet || matchTags || matchCategory;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedAudience, selectedDifficulty, selectedDialect]);

  // Jump to specific term from cross-reference click
  const handleSelectCrossReference = (termId: string) => {
    // Reset filters that might hide the target term
    setSelectedCategory('all');
    setSelectedAudience('all');
    setSelectedDifficulty('all');
    setSelectedDialect('all');
    setSearchQuery('');
    
    // Expand the target term
    setExpandedTermIds(prev => ({ ...prev, [termId]: true }));

    // Scroll to element
    setTimeout(() => {
      const el = document.getElementById(`glossary-term-${termId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[#3198dc]');
        setTimeout(() => el.classList.remove('ring-2', 'ring-[#3198dc]'), 2500);
      }
    }, 100);
  };

  return (
    <div id="glossary-view-container" className={`min-h-screen p-4 md:p-8 transition-colors ${
      isLight ? 'bg-[#f8fafc] text-[#0f172a]' : 'bg-[#071322] text-[#e0e7f1]'
    }`}>
      {/* Top Banner & Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b ${
          isLight ? 'border-[#e2e8f0]' : 'border-[#18293e]'
        }`}>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#059669] mb-1.5">
              <BookMarked className="w-4 h-4 text-[#059669]" />
              <span>{isFr ? 'Référentiel & Norme ANSI SQL' : 'ANSI SQL Standard & Reference'}</span>
            </div>
            <h1 className={`text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3 ${
              isLight ? 'text-[#0f172a]' : 'text-white'
            }`}>
              <span>{isFr ? 'Glossaire SQL Universel & Dialectes' : 'Universal SQL Glossary & Dialects'}</span>
              <span className={`text-xs font-mono font-normal px-2.5 py-1 rounded-full border ${
                isLight 
                  ? 'bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd]' 
                  : 'bg-[#3198dc]/20 text-[#89ceff] border-[#3198dc]/30'
              }`}>
                {ALL_GLOSSARY_TERMS.length} {isFr ? 'termes définis' : 'terms defined'}
              </span>
            </h1>
            <p className={`text-sm mt-1 max-w-3xl leading-relaxed ${
              isLight ? 'text-[#475569]' : 'text-[#93a7c1]'
            }`}>
              {isFr 
                ? 'Structure logique en 8 catégories essentielles pour débutants, développeurs et analystes de données. Comprend définitions formelles, snippets de code exécutables, particularités PostgreSQL, MySQL, SQL Server, Oracle et astuces de performance.' 
                : 'Logically structured in 8 essential categories for beginners, developers, and data analysts. Features formal definitions, executable code snippets, PostgreSQL, MySQL, SQL Server, and Oracle dialect notes.'}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className={`flex items-center gap-2 self-start md:self-auto p-2 rounded-xl border text-xs font-mono shadow-sm ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#0b1c30] border-[#1b2b3f]'
          }`}>
            <div className={`px-3 py-1.5 rounded-lg text-center ${
              isLight ? 'bg-[#f1f5f9]' : 'bg-[#102034]'
            }`}>
              <span className="block text-[#059669] font-bold text-sm">8</span>
              <span className={`text-[10px] uppercase font-semibold ${isLight ? 'text-[#64748b]' : 'text-[#78889b]'}`}>
                {isFr ? 'Catégories' : 'Categories'}
              </span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-center ${
              isLight ? 'bg-[#f1f5f9]' : 'bg-[#102034]'
            }`}>
              <span className={`block font-bold text-sm ${isLight ? 'text-[#0284c7]' : 'text-[#89ceff]'}`}>4</span>
              <span className={`text-[10px] uppercase font-semibold ${isLight ? 'text-[#64748b]' : 'text-[#78889b]'}`}>
                {isFr ? 'Dialectes' : 'Dialects'}
              </span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-center ${
              isLight ? 'bg-[#f1f5f9]' : 'bg-[#102034]'
            }`}>
              <span className={`block font-bold text-sm ${isLight ? 'text-[#d97706]' : 'text-[#f59e0b]'}`}>
                {GLOSSARY_STATS.totalTerms}
              </span>
              <span className={`text-[10px] uppercase font-semibold ${isLight ? 'text-[#64748b]' : 'text-[#78889b]'}`}>
                {isFr ? 'Entrées' : 'Entries'}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Main Search Bar */}
          <div className="relative flex-1">
            <Search className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isLight ? 'text-[#64748b]' : 'text-[#78889b]'
            }`} />
            <input
              id="glossary-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFr 
                ? 'Rechercher un terme (ex: Clé primaire, LEFT JOIN, CTE, VARCHAR, ACID, GROUP BY)...' 
                : 'Search any term (e.g. Primary Key, LEFT JOIN, CTE, VARCHAR, ACID)...'}
              className={`w-full pl-11 pr-10 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                isLight 
                  ? 'bg-white border border-[#cbd5e1] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#0284c7] focus:ring-[#0284c7]/20 shadow-sm' 
                  : 'bg-[#0b1c30] border border-[#1e344e] text-white placeholder-[#687a8e] focus:border-[#3198dc] focus:ring-[#3198dc]/30'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono hover:underline ${
                  isLight ? 'text-[#0284c7]' : 'text-[#89ceff]'
                }`}
              >
                {isFr ? 'Effacer' : 'Clear'}
              </button>
            )}
          </div>

          {/* Quick Selectors: Audience, Difficulty & Dialect */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Audience filter */}
            <div className={`flex items-center gap-1 border rounded-lg p-1 shadow-sm ${
              isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#0b1c30] border-[#1b2b3f]'
            }`}>
              <span className={`px-2 font-mono uppercase text-[10px] ${
                isLight ? 'text-[#64748b]' : 'text-[#6d8095]'
              }`}>
                {isFr ? 'Public :' : 'Target:'}
              </span>
              <button
                onClick={() => setSelectedAudience('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedAudience === 'all' 
                    ? (isLight ? 'bg-[#0284c7] text-white font-bold' : 'bg-[#3198dc] text-[#002840] font-bold') 
                    : (isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#9ab0c8] hover:text-white')
                }`}
              >
                {isFr ? 'Tous' : 'All'}
              </button>
              <button
                onClick={() => setSelectedAudience('beginner')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedAudience === 'beginner' 
                    ? (isLight ? 'bg-[#059669] text-white font-bold' : 'bg-[#4edea3] text-[#003820] font-bold') 
                    : (isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#9ab0c8] hover:text-white')
                }`}
              >
                {isFr ? 'Débutants' : 'Beginners'}
              </button>
              <button
                onClick={() => setSelectedAudience('developer')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedAudience === 'developer' 
                    ? (isLight ? 'bg-[#0284c7] text-white font-bold' : 'bg-[#3198dc] text-[#002840] font-bold') 
                    : (isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#9ab0c8] hover:text-white')
                }`}
              >
                Devs
              </button>
              <button
                onClick={() => setSelectedAudience('data_analyst')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedAudience === 'data_analyst' 
                    ? (isLight ? 'bg-[#7c3aed] text-white font-bold' : 'bg-[#a855f7] text-white font-bold') 
                    : (isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#9ab0c8] hover:text-white')
                }`}
              >
                {isFr ? 'Analystes' : 'Analysts'}
              </button>
            </div>

            {/* Dialect Filter */}
            <div className={`flex items-center gap-1 border rounded-lg p-1 shadow-sm ${
              isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#0b1c30] border-[#1b2b3f]'
            }`}>
              <span className={`px-2 font-mono uppercase text-[10px] ${
                isLight ? 'text-[#64748b]' : 'text-[#6d8095]'
              }`}>SGBD :</span>
              <select
                id="glossary-dialect-select"
                value={selectedDialect}
                onChange={(e) => setSelectedDialect(e.target.value as any)}
                className={`border rounded px-2 py-1 text-xs focus:outline-none ${
                  isLight 
                    ? 'bg-[#f8fafc] text-[#0284c7] border-[#cbd5e1] font-semibold' 
                    : 'bg-[#102034] text-[#89ceff] border-[#1e344e]'
                }`}
              >
                <option value="all">{isFr ? 'Tous les dialectes' : 'All Dialects'}</option>
                <option value="postgres">🐘 PostgreSQL</option>
                <option value="mysql">🐬 MySQL (InnoDB)</option>
                <option value="sqlServer">🔷 SQL Server (T-SQL)</option>
                <option value="oracle">🔴 Oracle (PL/SQL)</option>
              </select>
            </div>

            {/* Expand / Collapse All */}
            <div className={`flex items-center gap-1 border rounded-lg p-1 shadow-sm ${
              isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#0b1c30] border-[#1b2b3f]'
            }`}>
              <button
                onClick={handleExpandAll}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${
                  isLight 
                    ? 'text-[#0284c7] hover:bg-[#f1f5f9]' 
                    : 'text-[#89ceff] hover:bg-[#102034]'
                }`}
                title={isFr ? 'Déplier toutes les fiches' : 'Expand all terms'}
              >
                {isFr ? 'Déplier tout' : 'Expand all'}
              </button>
              <span className={isLight ? 'text-[#cbd5e1]' : 'text-[#2b3d52]'}>|</span>
              <button
                onClick={handleCollapseAll}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${
                  isLight 
                    ? 'text-[#64748b] hover:bg-[#f1f5f9]' 
                    : 'text-[#78889b] hover:bg-[#102034]'
                }`}
                title={isFr ? 'Replier toutes les fiches' : 'Collapse all terms'}
              >
                {isFr ? 'Replier' : 'Collapse'}
              </button>
            </div>
          </div>
        </div>

        {/* 8 Categories Navigation Strip */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            id="glossary-cat-btn-all"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border shadow-sm ${
              selectedCategory === 'all'
                ? (isLight ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-md shadow-[#0284c7]/20' : 'bg-[#3198dc] text-[#002840] border-[#3198dc] shadow-md shadow-[#3198dc]/20')
                : (isLight ? 'bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9] hover:text-[#0f172a]' : 'bg-[#0b1c30] text-[#93a7c1] border-[#18293e] hover:bg-[#102034] hover:text-white')
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isFr ? 'Toutes les catégories' : 'All Categories'}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isLight ? 'bg-black/10' : 'bg-black/20'}`}>
              {ALL_GLOSSARY_TERMS.length}
            </span>
          </button>

          {GLOSSARY_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const termCount = ALL_GLOSSARY_TERMS.filter(t => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                id={`glossary-cat-btn-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border shadow-sm ${
                  isSelected
                    ? 'text-white shadow-md'
                    : isLight
                    ? 'bg-white text-[#475569] border-[#e2e8f0] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                    : 'bg-[#0b1c30] text-[#93a7c1] border-[#18293e] hover:bg-[#102034] hover:text-white'
                }`}
                style={isSelected ? { backgroundColor: cat.accentColor, borderColor: cat.accentColor, color: '#001a2e' } : {}}
              >
                <span className="font-mono text-[11px] font-bold opacity-80">#{cat.id}</span>
                <span>{isFr ? cat.titleFr : cat.titleEn}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${isLight ? 'bg-black/10' : 'bg-black/20'}`}>
                  {termCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Results Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredTerms.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border p-8 shadow-sm ${
            isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#0b1c30] border-[#1b2b3f]'
          }`}>
            <Database className={`w-12 h-12 mx-auto mb-3 ${isLight ? 'text-[#94a3b8]' : 'text-[#465b73]'}`} />
            <h3 className={`text-lg font-bold mb-1 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
              {isFr ? 'Aucun terme trouvé' : 'No matching terms found'}
            </h3>
            <p className={`text-sm max-w-md mx-auto mb-4 ${isLight ? 'text-[#64748b]' : 'text-[#78889b]'}`}>
              {isFr 
                ? 'Aucun terme ne correspond à vos critères de recherche ou de filtrage actuels.' 
                : 'No terms matched your search keywords or filter configuration.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedAudience('all');
                setSelectedDifficulty('all');
                setSelectedDialect('all');
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                isLight 
                  ? 'bg-[#0284c7] text-white hover:bg-[#0369a1]' 
                  : 'bg-[#3198dc] text-[#002840] hover:bg-[#45a4e4]'
              }`}
            >
              {isFr ? 'Réinitialiser tous les filtres' : 'Reset All Filters'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTerms.map((term) => {
              const isExpanded = !!expandedTermIds[term.id];
              const categoryMeta = GLOSSARY_CATEGORIES.find(c => c.id === term.category);
              const catColor = categoryMeta?.accentColor || '#3198dc';

              return (
                <div
                  key={term.id}
                  id={`glossary-term-${term.id}`}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isLight
                      ? isExpanded 
                        ? 'bg-white border-[#cbd5e1] shadow-lg shadow-slate-200/80 ring-1 ring-[#0284c7]/20' 
                        : 'bg-white border-[#e2e8f0] hover:border-[#cbd5e1] shadow-sm'
                      : isExpanded 
                        ? 'bg-[#0b1c30] border-[#294263] shadow-lg shadow-black/40' 
                        : 'bg-[#0b1c30] border-[#18293e] hover:border-[#233852]'
                  }`}
                >
                  {/* Term Header (Always visible) */}
                  <div 
                    onClick={() => toggleExpand(term.id)}
                    className={`p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none transition-colors ${
                      isLight ? 'hover:bg-slate-50/70' : 'hover:bg-[#0f233a]/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      {/* Category & Badges Bar */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span 
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md tracking-wide"
                          style={{ 
                            backgroundColor: `${catColor}${isLight ? '15' : '25'}`, 
                            color: catColor, 
                            border: `1px solid ${catColor}${isLight ? '40' : '40'}` 
                          }}
                        >
                          {isFr ? term.categoryNameFr : term.categoryNameEn}
                        </span>

                        {/* Difficulty Badge */}
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                          term.difficulty === 'beginner' 
                            ? (isLight ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]' : 'bg-[#00a572]/15 text-[#4edea3] border-[#00a572]/30') 
                            : term.difficulty === 'intermediate'
                            ? (isLight ? 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]' : 'bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30')
                            : (isLight ? 'bg-[#faf5ff] text-[#7c3aed] border-[#e9d5ff]' : 'bg-[#a855f7]/15 text-[#c084fc] border-[#a855f7]/30')
                        }`}>
                          {term.difficulty === 'beginner' 
                            ? (isFr ? 'Débutant' : 'Beginner') 
                            : term.difficulty === 'intermediate'
                            ? (isFr ? 'Intermédiaire' : 'Intermediate')
                            : (isFr ? 'Avancé' : 'Advanced')}
                        </span>

                        {/* Audience Badges */}
                        <div className={`flex items-center gap-1 text-[10px] font-mono ${
                          isLight ? 'text-[#64748b]' : 'text-[#78889b]'
                        }`}>
                          {term.audience.map(aud => (
                            <span key={aud} className={`px-1.5 py-0.5 rounded border ${
                              isLight ? 'bg-[#f1f5f9] border-[#e2e8f0] text-[#475569]' : 'bg-[#122336] border-[#1b2f44]'
                            }`}>
                              {aud === 'beginner' ? 'Beginner' : aud === 'developer' ? 'Dev' : 'Analyst'}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Term Names (French + English) */}
                      <div className="flex items-baseline gap-2.5 flex-wrap">
                        <h2 className={`text-lg md:text-xl font-bold tracking-tight ${
                          isLight ? 'text-[#0f172a]' : 'text-white'
                        }`}>
                          {term.termFr}
                        </h2>
                        {term.termEn && term.termEn !== term.termFr && (
                          <span className={`text-xs font-mono font-medium ${
                            isLight ? 'text-[#64748b]' : 'text-[#899fb8]'
                          }`}>
                            ({term.termEn})
                          </span>
                        )}
                      </div>

                      {/* Crisp Short Definition */}
                      <p className={`text-sm mt-1.5 leading-relaxed ${
                        isLight ? 'text-[#334155]' : 'text-[#cbd7e6]'
                      }`}>
                        {isFr ? term.shortDefFr : term.shortDefEn}
                      </p>
                    </div>

                    {/* Expand Toggle Button */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm ${
                          isExpanded 
                            ? (isLight ? 'bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd]' : 'bg-[#3198dc]/20 text-[#89ceff] border-[#3198dc]/40') 
                            : (isLight ? 'bg-[#f1f5f9] text-[#475569] border-[#e2e8f0] hover:text-[#0f172a] hover:bg-[#e2e8f0]' : 'bg-[#102034] text-[#78889b] border-[#1b2b3f] hover:text-white')
                        }`}
                      >
                        <span className="hidden sm:inline">
                          {isExpanded ? (isFr ? 'Masquer' : 'Less') : (isFr ? 'Détails & Code' : 'Details & Code')}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content Drawer */}
                  {isExpanded && (
                    <div className={`border-t p-5 space-y-6 ${
                      isLight ? 'border-[#e2e8f0] bg-[#f8fafc]' : 'border-[#18293e] bg-[#081729]'
                    }`}>
                      {/* Deep Explanation */}
                      <div>
                        <h3 className={`text-xs font-mono uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5 ${
                          isLight ? 'text-[#0284c7]' : 'text-[#89ceff]'
                        }`}>
                          <Terminal className="w-3.5 h-3.5" />
                          <span>{isFr ? 'Explication détaillée & Fonctionnement interne' : 'In-Depth Concept & Mechanics'}</span>
                        </h3>
                        <p className={`text-sm leading-relaxed whitespace-pre-line p-4 rounded-xl border shadow-sm ${
                          isLight 
                            ? 'bg-white border-[#e2e8f0] text-[#1e293b]' 
                            : 'bg-[#0c1e33] border-[#192d44] text-[#b8c9dd]'
                        }`}>
                          {isFr ? term.fullExplanationFr : term.fullExplanationEn}
                        </p>
                      </div>

                      {/* Code Snippet - High Contrast and Legible in Light & Dark Mode */}
                      {term.codeSnippet && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                              isLight ? 'text-[#059669]' : 'text-[#4edea3]'
                            }`}>
                              <Code2 className="w-3.5 h-3.5" />
                              <span>{isFr ? 'Snippet SQL Illustratif' : 'Illustrative SQL Snippet'}</span>
                            </h3>
                            <button
                              id={`copy-snippet-${term.id}`}
                              onClick={() => handleCopySnippet(term.codeSnippet!, term.id)}
                              className={`flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border transition-all shadow-sm ${
                                isLight 
                                  ? 'bg-white text-[#0284c7] hover:text-[#0369a1] border-[#cbd5e1] hover:bg-[#f1f5f9]' 
                                  : 'bg-[#102034] text-[#89ceff] hover:text-white border-[#1b2b3f]'
                              }`}
                            >
                              {copiedSnippetId === term.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#059669]" />
                                  <span className={isLight ? 'text-[#059669]' : 'text-[#4edea3]'}>{isFr ? 'Copié !' : 'Copied!'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>{isFr ? 'Copier' : 'Copy'}</span>
                                </>
                              )}
                            </button>
                          </div>
                          
                          <div className={`rounded-xl overflow-hidden border shadow-sm ${
                            isLight 
                              ? 'border-[#cbd5e1] bg-white' 
                              : 'border-[#1e344e] bg-[#020b14]'
                          }`}>
                            <pre className={`p-4 font-mono text-xs overflow-x-auto leading-relaxed ${
                              isLight ? 'text-[#0f172a]' : 'text-[#d3e4fe]'
                            }`}>
                              <code>{renderHighlightedSql(term.codeSnippet, isLight)}</code>
                            </pre>
                            {term.codeSnippetCommentFr && (
                              <div className={`px-4 py-2 border-t text-[11px] font-mono ${
                                isLight 
                                  ? 'bg-[#f1f5f9] border-[#e2e8f0] text-[#475569]' 
                                  : 'bg-[#061220] border-[#132233] text-[#78889b]'
                              }`}>
                                💡 {isFr ? term.codeSnippetCommentFr : term.codeSnippetCommentEn}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dialects Specificity Grid */}
                      {term.dialects && (
                        <div>
                          <h3 className={`text-xs font-mono uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5 ${
                            isLight ? 'text-[#b45309]' : 'text-[#fbbf24]'
                          }`}>
                            <Database className="w-3.5 h-3.5" />
                            <span>{isFr ? 'Particularités par SGBD & Dialectes' : 'Dialect & Engine Specifics'}</span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* PostgreSQL */}
                            {term.dialects.postgres && (
                              <div className={`p-3 rounded-xl border shadow-sm ${
                                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#0c1e33] border-[#192d44]'
                              }`}>
                                <div className={`text-xs font-bold flex items-center gap-1.5 mb-1 ${
                                  isLight ? 'text-[#0284c7]' : 'text-[#89ceff]'
                                }`}>
                                  <span>🐘 PostgreSQL</span>
                                </div>
                                <p className={`text-xs leading-relaxed ${
                                  isLight ? 'text-[#334155]' : 'text-[#a3b5ca]'
                                }`}>
                                  {term.dialects.postgres}
                                </p>
                              </div>
                            )}

                            {/* MySQL */}
                            {term.dialects.mysql && (
                              <div className={`p-3 rounded-xl border shadow-sm ${
                                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#0c1e33] border-[#192d44]'
                              }`}>
                                <div className={`text-xs font-bold flex items-center gap-1.5 mb-1 ${
                                  isLight ? 'text-[#d97706]' : 'text-[#f59e0b]'
                                }`}>
                                  <span>🐬 MySQL (InnoDB)</span>
                                </div>
                                <p className={`text-xs leading-relaxed ${
                                  isLight ? 'text-[#334155]' : 'text-[#a3b5ca]'
                                }`}>
                                  {term.dialects.mysql}
                                </p>
                              </div>
                            )}

                            {/* SQL Server */}
                            {term.dialects.sqlServer && (
                              <div className={`p-3 rounded-xl border shadow-sm ${
                                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#0c1e33] border-[#192d44]'
                              }`}>
                                <div className={`text-xs font-bold flex items-center gap-1.5 mb-1 ${
                                  isLight ? 'text-[#059669]' : 'text-[#4edea3]'
                                }`}>
                                  <span>🔷 SQL Server (T-SQL)</span>
                                </div>
                                <p className={`text-xs leading-relaxed ${
                                  isLight ? 'text-[#334155]' : 'text-[#a3b5ca]'
                                }`}>
                                  {term.dialects.sqlServer}
                                </p>
                              </div>
                            )}

                            {/* Oracle */}
                            {term.dialects.oracle && (
                              <div className={`p-3 rounded-xl border shadow-sm ${
                                isLight ? 'bg-white border-[#e2e8f0]' : 'bg-[#0c1e33] border-[#192d44]'
                              }`}>
                                <div className={`text-xs font-bold flex items-center gap-1.5 mb-1 ${
                                  isLight ? 'text-[#dc2626]' : 'text-[#ef4444]'
                                }`}>
                                  <span>🔴 Oracle Database</span>
                                </div>
                                <p className={`text-xs leading-relaxed ${
                                  isLight ? 'text-[#334155]' : 'text-[#a3b5ca]'
                                }`}>
                                  {term.dialects.oracle}
                                </p>
                              </div>
                            )}
                          </div>

                          {term.dialects.specialNoteFr && (
                            <div className={`mt-2.5 p-3 rounded-xl border text-xs flex items-start gap-2 shadow-sm ${
                              isLight 
                                ? 'bg-[#f0f9ff] border-[#bae6fd] text-[#0369a1]' 
                                : 'bg-[#17263b] border-[#233a57] text-[#89ceff]'
                            }`}>
                              <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${
                                isLight ? 'text-[#d97706]' : 'text-[#fbbf24]'
                              }`} />
                              <span>{isFr ? term.dialects.specialNoteFr : term.dialects.specialNoteEn}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pro Tip Callout */}
                      {term.proTipFr && (
                        <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 shadow-sm ${
                          isLight 
                            ? 'bg-[#ecfdf5] border-[#a7f3d0]' 
                            : 'bg-[#00a572]/10 border-[#00a572]/30'
                        }`}>
                          <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isLight ? 'text-[#059669]' : 'text-[#4edea3]'
                          }`} />
                          <div>
                            <span className={`font-bold uppercase tracking-wider block mb-0.5 font-mono ${
                              isLight ? 'text-[#059669]' : 'text-[#4edea3]'
                            }`}>
                              {isFr ? 'Astuce Pro / Piège d\'optimisation :' : 'Pro Tip / Optimizer Trap:'}
                            </span>
                            <span className={`leading-relaxed ${
                              isLight ? 'text-[#065f46]' : 'text-[#cbe9dc]'
                            }`}>
                              {isFr ? term.proTipFr : term.proTipEn}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Cross References & Tags Footer */}
                      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t text-xs ${
                        isLight ? 'border-[#e2e8f0]' : 'border-[#142538]'
                      }`}>
                        {/* Cross References */}
                        {term.crossReferences && term.crossReferences.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-mono ${isLight ? 'text-[#64748b]' : 'text-[#64778d]'}`}>
                              {isFr ? 'Voir aussi :' : 'See also:'}
                            </span>
                            {term.crossReferences.map((ref) => (
                              <button
                                key={ref.id}
                                onClick={() => handleSelectCrossReference(ref.id)}
                                className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 font-mono text-[11px] shadow-sm ${
                                  isLight 
                                    ? 'bg-white text-[#0284c7] hover:bg-[#0284c7] hover:text-white border-[#cbd5e1]' 
                                    : 'bg-[#102034] text-[#89ceff] hover:bg-[#3198dc] hover:text-[#002840] border-[#1b2b3f]'
                                }`}
                              >
                                <span>{isFr ? ref.labelFr : ref.labelEn}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Tags */}
                        {term.tags && (
                          <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                            <Tag className={`w-3 h-3 ${isLight ? 'text-[#94a3b8]' : 'text-[#586b80]'}`} />
                            {term.tags.map((t) => (
                              <span 
                                key={t} 
                                onClick={() => setSearchQuery(t)}
                                className={`cursor-pointer text-[10px] font-mono px-2 py-0.5 rounded border transition-colors shadow-sm ${
                                  isLight 
                                    ? 'bg-white text-[#64748b] hover:text-[#0284c7] hover:border-[#0284c7] border-[#e2e8f0]' 
                                    : 'bg-[#102034] text-[#78889b] hover:text-[#89ceff] border-[#1b2b3f]'
                                }`}
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
