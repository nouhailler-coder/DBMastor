import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Search, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  Bookmark, 
  Layers, 
  Grid, 
  CreditCard, 
  Zap, 
  Copy, 
  Check, 
  BookOpen, 
  Terminal, 
  ArrowRight,
  Filter,
  CheckCircle,
  Eye,
  Info,
  Target,
  Compass,
  FileText,
  Clock,
  Sparkle
} from 'lucide-react';
import { 
  FlashcardItem, 
  FlashcardMasteryStatus, 
  NavigationTab, 
  CertificationTrackId 
} from '../types';
import { 
  getCertificationDomains, 
  getTotalFlashcardsForCert, 
  allFlashcardsCatalog,
  DomainFlashcardMeta
} from '../data/flashcardsCatalog';
import { certificationTracks } from '../data/mockData';
import { certificationDomainMatrices } from '../data/certificationDomainsData';

interface FlashcardsViewProps {
  onNavigate: (tab: NavigationTab) => void;
  selectedCert: CertificationTrackId;
  onCertChange: (cert: CertificationTrackId) => void;
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
}

const STORAGE_KEY = 'dbmastery_flashcards_progress_v1';

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  onNavigate,
  selectedCert,
  onCertChange,
  lang,
  theme = 'light',
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';

  // Certification track details
  const currentTrack = useMemo(() => {
    return certificationTracks.find((t) => t.id === selectedCert) || certificationTracks[0];
  }, [selectedCert]);

  // Dynamic domains for currently selected certification
  const currentDomainList = useMemo(() => {
    return getCertificationDomains(selectedCert);
  }, [selectedCert]);

  // Domain selection (default to first domain of selected certification)
  const [selectedDomainId, setSelectedDomainId] = useState<string>(() => {
    const list = getCertificationDomains(selectedCert);
    return list[0]?.domainId || 'oracle-dom-01';
  });

  // Automatically keep selectedDomainId valid when certification track changes
  useEffect(() => {
    const isDomainInTrack = currentDomainList.some((d) => d.domainId === selectedDomainId);
    if (!isDomainInTrack && currentDomainList.length > 0) {
      setSelectedDomainId(currentDomainList[0].domainId);
    }
  }, [selectedCert, currentDomainList, selectedDomainId]);

  // Total available flashcards count for this entire certification track
  const totalCardsForCert = useMemo(() => {
    return getTotalFlashcardsForCert(selectedCert);
  }, [selectedCert]);

  // Mastery state map: cardId -> status
  const [masteryMap, setMasteryMap] = useState<Record<string, FlashcardMasteryStatus>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Filters
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // View mode
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState<boolean>(false);

  // Save mastery map to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(masteryMap));
    } catch (e) {
      console.warn('Unable to persist flashcards progress:', e);
    }
  }, [masteryMap]);

  // Available cards for current domain
  const rawDomainCards = useMemo(() => {
    return allFlashcardsCatalog[selectedDomainId] || [];
  }, [selectedDomainId]);

  // Distinct subtopics for this domain
  const availableSubtopics = useMemo(() => {
    const set = new Set<string>();
    rawDomainCards.forEach((c) => set.add(c.subtopic));
    return Array.from(set);
  }, [rawDomainCards]);

  // Filtered cards list
  const filteredCards = useMemo(() => {
    let list = [...rawDomainCards];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.front.question.toLowerCase().includes(q) ||
          c.back.answer.toLowerCase().includes(q) ||
          c.back.explanation.toLowerCase().includes(q) ||
          (c.back.examTrap && c.back.examTrap.toLowerCase().includes(q)) ||
          c.subtopic.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Subtopic filter
    if (selectedSubtopic !== 'all') {
      list = list.filter((c) => c.subtopic === selectedSubtopic);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      list = list.filter((c) => c.difficulty === selectedDifficulty);
    }

    // Status filter
    if (selectedStatusFilter !== 'all') {
      list = list.filter((c) => {
        const s = masteryMap[c.id] || 'unseen';
        return s === selectedStatusFilter;
      });
    }

    if (isShuffled) {
      // Deterministic but shuffled sort
      list = [...list].sort((a, b) => {
        const hashA = (a.cardNumber * 9301 + 49297) % 233280;
        const hashB = (b.cardNumber * 9301 + 49297) % 233280;
        return hashA - hashB;
      });
    }

    return list;
  }, [
    rawDomainCards,
    searchQuery,
    selectedSubtopic,
    selectedDifficulty,
    selectedStatusFilter,
    isShuffled,
    masteryMap,
  ]);

  // Safely constrain currentIndex
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  }, [selectedDomainId, selectedSubtopic, selectedStatusFilter, selectedDifficulty, isShuffled]);

  const currentCard: FlashcardItem | undefined = filteredCards[currentIndex];

  // Domain statistics
  const domainStats = useMemo(() => {
    const total = rawDomainCards.length;
    if (total === 0) return { total: 0, mastered: 0, learning: 0, review: 0, unseen: 0, percent: 0 };

    let mastered = 0;
    let learning = 0;
    let review = 0;
    let unseen = 0;

    rawDomainCards.forEach((c) => {
      const status = masteryMap[c.id] || 'unseen';
      if (status === 'mastered') mastered++;
      else if (status === 'learning') learning++;
      else if (status === 'review') review++;
      else unseen++;
    });

    const percent = Math.round((mastered / total) * 100);

    return { total, mastered, learning, review, unseen, percent };
  }, [rawDomainCards, masteryMap]);

  // Set card status
  const handleSetStatus = useCallback((cardId: string, status: FlashcardMasteryStatus) => {
    setMasteryMap((prev) => ({
      ...prev,
      [cardId]: status,
    }));
  }, []);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCards.length - 1));
  }, [filteredCards.length]);

  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : 0));
  }, [filteredCards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1' && currentCard) {
        e.preventDefault();
        handleSetStatus(currentCard.id, 'review');
      } else if (e.key === '2' && currentCard) {
        e.preventDefault();
        handleSetStatus(currentCard.id, 'learning');
      } else if (e.key === '3' && currentCard) {
        e.preventDefault();
        handleSetStatus(currentCard.id, 'mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentCard, handleSetStatus]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleResetProgress = () => {
    const newMap = { ...masteryMap };
    rawDomainCards.forEach((c) => {
      delete newMap[c.id];
    });
    setMasteryMap(newMap);
    setResetConfirm(false);
  };

  const certTabs: { id: CertificationTrackId; label: string; code: string; provider: string }[] = [
    { id: 'oracle-1z0-071', label: 'Oracle Database SQL', code: '1Z0-071', provider: 'Oracle' },
    { id: 'azure-dp-900', label: 'Azure Data Fundamentals', code: 'DP-900', provider: 'Microsoft' },
    { id: 'azure-dp-800', label: 'Azure Database Admin', code: 'DP-800', provider: 'Microsoft' },
    { id: 'postgres-edb', label: 'PostgreSQL Associate', code: 'EDB 16', provider: 'EDB' },
    { id: 'mysql-80-dba', label: 'MySQL 8.0 DBA', code: '1Z0-908', provider: 'Oracle' },
  ];

  const currentDomainMeta: DomainFlashcardMeta = useMemo(() => {
    return currentDomainList.find((d) => d.domainId === selectedDomainId) || currentDomainList[0] || {
      domainId: '',
      domainCode: 'DOM-01',
      titleFr: 'Domaine',
      titleEn: 'Domain',
      accentColor: '#3198dc',
      weight: '~20%',
      cardCount: 0,
      available: false,
      descFr: '',
      descEn: '',
    };
  }, [currentDomainList, selectedDomainId]);

  const officialDomainDetail = useMemo(() => {
    const matrix = certificationDomainMatrices[selectedCert] || [];
    return matrix.find((d) => d.id === selectedDomainId);
  }, [selectedCert, selectedDomainId]);

  const availableDomainCount = useMemo(() => {
    return currentDomainList.filter((d) => d.cardCount > 0).length;
  }, [currentDomainList]);

  return (
    <div id="flashcards-view" className="p-4 sm:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-5">
      {/* 0. CERTIFICATION TRACK SELECTOR TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#102034] p-2.5 rounded-xl border border-[#1b2b3f]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono text-[#89929b] uppercase font-bold px-1 shrink-0">
            {isFr ? 'Certification :' : 'Track :'}
          </span>
          {certTabs.map((tab) => {
            const isCurrent = selectedCert === tab.id;
            const certCards = getTotalFlashcardsForCert(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => onCertChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-[#3198dc] text-[#002c47] shadow-sm ring-1 ring-[#3198dc]/50'
                    : 'text-[#bfc7d2] hover:text-[#d3e4fe] hover:bg-[#1b2b3f] bg-[#000f21]/60 border border-[#1b2b3f]'
                }`}
              >
                <span>{tab.code} • {tab.label}</span>
                {certCards > 0 ? (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isCurrent ? 'bg-[#002c47] text-[#4edea3]' : 'bg-[#003824] text-[#4edea3]'
                  }`}>
                    {certCards} {isFr ? 'cartes' : 'cards'}
                  </span>
                ) : (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                    isCurrent ? 'bg-[#002c47]/40 text-[#f59e0b]' : 'bg-[#1b2b3f] text-[#89929b]'
                  }`}>
                    {isFr ? 'À couvrir' : 'Pending'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="font-mono text-[11px] text-[#89ceff] flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#4edea3]" />
          <span>
            {totalCardsForCert > 0
              ? `${totalCardsForCert} ${isFr ? 'flashcards prêtes' : 'ready flashcards'}`
              : (isFr ? 'Cartographie des domaines' : 'Domain mapping')}
          </span>
        </div>
      </div>

      {/* 1. HEADER & META ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] text-[#93ccff] bg-[#1b2b3f] px-2.5 py-0.5 rounded-full border border-[#26364a] font-semibold flex items-center gap-1.5">
              <CreditCard className="w-3 h-3 text-[#3198dc]" />
              {currentTrack.provider} • {currentTrack.code} • {currentTrack.name}
            </span>
            <span className="text-[#89929b] font-mono text-xs">•</span>
            {currentDomainMeta.cardCount > 0 ? (
              <span className="font-mono text-xs text-[#4edea3] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {currentDomainMeta.domainCode} • {rawDomainCards.length} {isFr ? 'Flashcards Rédigées' : 'Crafted Cards'}
              </span>
            ) : (
              <span className="font-mono text-xs text-[#f59e0b] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {currentDomainMeta.domainCode} • {isFr ? '0 Flashcard rédigée (Domaine à couvrir)' : '0 Flashcard (To cover)'}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-[#d3e4fe]">
            {isFr ? 'Flashcards Interactives de Mémorisation' : 'Interactive Mastery Flashcards'}
          </h1>
          <p className="text-xs text-[#bfc7d2] max-w-2xl leading-relaxed">
            {currentDomainMeta.cardCount > 0
              ? (isFr 
                  ? `Entraînez-vous avec les ${rawDomainCards.length} fiches de mémorisation recto/verso sur le domaine ${currentDomainMeta.domainCode} (${currentDomainMeta.weight}). Révisez les règles de syntaxe, notions clés et pièges officiels ${currentTrack.name}.` 
                  : `Review ${rawDomainCards.length} active-recall flashcards for ${currentDomainMeta.domainCode} (${currentDomainMeta.weight}). Master syntax rules and traps for ${currentTrack.name}.`)
              : (isFr
                  ? `Consultez les domaines officiels du programme ${currentTrack.name} (${currentTrack.code}). Découvrez ci-dessous la cartographie des compétences et pièges d'examen prévus pour les futures flashcards de ce domaine.`
                  : `Browse official curriculum domains for ${currentTrack.name} (${currentTrack.code}). Check the competency breakdown and traps planned for upcoming flashcards.`)}
          </p>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {rawDomainCards.length > 0 && (
            <div className="flex items-center bg-[#102034] p-1 rounded-lg border border-[#1b2b3f]">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'card' 
                    ? 'bg-[#3198dc] text-[#002c47] shadow-sm' 
                    : 'text-[#bfc7d2] hover:text-[#d3e4fe]'
                }`}
                title={isFr ? 'Mode carte individuelle (Focus)' : 'Single Card Focus Mode'}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{isFr ? 'Mode Focus' : 'Focus Card'}</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-[#3198dc] text-[#002c47] shadow-sm' 
                    : 'text-[#bfc7d2] hover:text-[#d3e4fe]'
                }`}
                title={isFr ? 'Vue grille des fiches' : 'Grid overview of all cards'}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{isFr ? 'Vue Grille' : 'Grid View'}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => onNavigate('exams')}
            className="px-3 py-2 bg-[#1b2b3f] hover:bg-[#26364a] text-[#89ceff] border border-[#26364a] font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-[#4edea3]" />
            <span>{isFr ? 'Tester en Quiz' : 'Test with Quiz'}</span>
          </button>

          <button
            onClick={() => onNavigate('sandbox')}
            className="px-3 py-2 bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-[#93ccff]" />
            <span>{isFr ? 'SQL Lab' : 'SQL Lab'}</span>
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC DOMAIN SWITCHER TABS */}
      <div className="flex flex-col gap-2 bg-[#102034] p-3 rounded-xl border border-[#1b2b3f]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] text-[#89929b] uppercase tracking-wider font-semibold">
              {isFr ? `Domaines officiels ${currentTrack.name} (${currentTrack.code}) :` : `Official ${currentTrack.code} Domains:`}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#1b2b3f] text-[#93ccff] border border-[#26364a] font-bold">
              {currentDomainList.length} {isFr ? 'domaines' : 'domains'}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-[#89929b] text-[10px]">
              {isFr ? 'Couverture :' : 'Coverage:'}
            </span>
            <span className="text-[#4edea3] font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {availableDomainCount} {isFr ? 'disponible(s)' : 'ready'}
            </span>
            <span className="text-[#f59e0b] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
              {currentDomainList.length - availableDomainCount} {isFr ? 'à couvrir' : 'to cover'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
          {currentDomainList.map((dom) => {
            const isSelected = dom.domainId === selectedDomainId;
            const hasCards = dom.cardCount > 0;
            return (
              <button
                key={dom.domainId}
                onClick={() => setSelectedDomainId(dom.domainId)}
                className={`p-2.5 rounded-lg text-left border transition-all flex flex-col justify-between gap-1.5 ${
                  isSelected 
                    ? 'bg-[#1b2b3f] border-[#3198dc] shadow-md ring-1 ring-[#3198dc]/50' 
                    : hasCards
                      ? 'bg-[#000f21] border-[#1b2b3f] hover:border-[#26364a] hover:bg-[#0b1c30]'
                      : 'bg-[#000f21]/60 border-[#102034] hover:border-[#26364a] hover:bg-[#0b1c30]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${dom.accentColor}25`, color: dom.accentColor }}
                  >
                    {dom.domainCode}
                  </span>
                  <span className="font-mono text-[10px] text-[#89929b] font-semibold">
                    {dom.weight}
                  </span>
                </div>

                <div className="text-xs font-semibold text-[#d3e4fe] line-clamp-2 min-h-[32px]">
                  {isFr ? dom.titleFr : dom.titleEn}
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] pt-1 border-t border-[#1b2b3f]/50">
                  {hasCards ? (
                    <>
                      <span className="text-[#89ceff] font-semibold">{dom.cardCount} cartes</span>
                      <span className="text-[#4edea3] font-bold flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" />
                        {isFr ? 'Prêt' : 'Ready'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#89929b]">0 carte</span>
                      <span className="text-[#f59e0b] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                        {isFr ? 'À couvrir' : 'To cover'}
                      </span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DYNAMIC CONTENT: ROADMAP VIEW (IF DOMAIN HAS NO CARDS YET) OR ACTIVE FLASHCARDS ENGINE */}
      {rawDomainCards.length === 0 ? (
        <div className="flex flex-col gap-6 w-full">
          {/* Domain Status & Overview Card */}
          <div className="bg-[#102034] p-6 sm:p-8 rounded-2xl border border-[#1b2b3f] flex flex-col gap-6 shadow-lg relative overflow-hidden">
            {/* Top decorative accent bar */}
            <div 
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: currentDomainMeta.accentColor }}
            />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span 
                    className="font-mono text-xs font-bold px-2.5 py-1 rounded border"
                    style={{ 
                      backgroundColor: `${currentDomainMeta.accentColor}20`, 
                      color: currentDomainMeta.accentColor,
                      borderColor: `${currentDomainMeta.accentColor}40`
                    }}
                  >
                    {currentDomainMeta.domainCode}
                  </span>
                  <span className="font-mono text-xs text-[#89929b]">•</span>
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#000f21] text-[#93ccff] border border-[#1b2b3f] font-semibold">
                    {isFr ? 'Poids dans l\'examen :' : 'Exam Weight:'} {currentDomainMeta.weight}
                  </span>
                  <span className="font-mono text-xs text-[#89929b]">•</span>
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#3d2400] text-[#f59e0b] border border-[#f59e0b]/40 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {isFr ? '0 / 100 Flashcards • Domaine à couvrir' : '0 / 100 Flashcards • Pending Coverage'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-[#d3e4fe]">
                  {isFr ? currentDomainMeta.titleFr : currentDomainMeta.titleEn}
                </h2>

                <p className="text-sm text-[#bfc7d2] leading-relaxed max-w-4xl">
                  {isFr ? (currentDomainMeta.descFr || officialDomainDetail?.desc) : (currentDomainMeta.descEn || officialDomainDetail?.desc)}
                </p>
              </div>

              {/* Quick actions for this domain */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                <button
                  onClick={() => onNavigate('syllabus')}
                  className="px-4 py-2.5 bg-[#3198dc] hover:bg-[#89ceff] text-[#002c47] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{isFr ? 'Consulter la Fiche d\'étude' : 'View Study Sheet'}</span>
                </button>
                <button
                  onClick={() => onNavigate('exams')}
                  className="px-4 py-2 bg-[#1b2b3f] hover:bg-[#26364a] text-[#89ceff] font-semibold text-xs rounded-xl border border-[#26364a] transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-[#4edea3]" />
                  <span>{isFr ? 'Quiz sur cette certification' : 'Exam Quiz for this track'}</span>
                </button>
              </div>
            </div>

            {/* Coverage status notification */}
            <div className="bg-[#000f21] p-4 rounded-xl border border-[#1b2b3f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#1b2b3f] text-[#f59e0b] shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#d3e4fe]">
                    {isFr 
                      ? `Ce domaine est au programme officiel de ${currentTrack.name} (${currentTrack.code})` 
                      : `This domain is an official requirement for ${currentTrack.name} (${currentTrack.code})`}
                  </div>
                  <div className="text-xs text-[#89929b]">
                    {isFr 
                      ? 'Ce domaine ne dispose pas encore de flashcards rédigées. Vous pouvez découvrir ci-dessous toutes les compétences ciblées par le programme.' 
                      : 'Flashcards are not yet authored for this domain. Discover the competencies and traps targeted below.'}
                  </div>
                </div>
              </div>

              {selectedCert !== 'oracle-1z0-071' && (
                <button
                  onClick={() => onCertChange('oracle-1z0-071')}
                  className="px-3.5 py-2 bg-[#1b2b3f] hover:bg-[#26364a] text-[#4edea3] border border-[#003824] rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Basculer sur Oracle (600 cartes prêtes)' : 'Switch to Oracle (600 ready cards)'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Official Curriculum Skills to be covered */}
          {officialDomainDetail && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Objectives */}
              <div className="bg-[#102034] p-5 rounded-2xl border border-[#1b2b3f] flex flex-col gap-3 lg:col-span-2">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#93ccff]">
                  <Target className="w-4 h-4 text-[#3198dc]" />
                  <span>{isFr ? 'Objectifs d\'examen & Notions clés à couvrir (Syllabus) :' : 'Exam Objectives & Targeted Competencies:'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {officialDomainDetail.sheetDetail.objectives.map((obj, i) => (
                    <div 
                      key={i} 
                      className="p-3 bg-[#000f21] rounded-xl border border-[#1b2b3f] text-xs text-[#d3e4fe] flex items-start gap-2.5 leading-relaxed"
                    >
                      <span className="font-mono text-[10px] font-bold text-[#3198dc] bg-[#1b2b3f] px-1.5 py-0.5 rounded shrink-0">
                        #{i + 1}
                      </span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam Traps & Key Concepts */}
              <div className="flex flex-col gap-4">
                {/* Key Concepts */}
                <div className="bg-[#102034] p-5 rounded-2xl border border-[#1b2b3f] flex flex-col gap-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#4edea3]">
                    <Compass className="w-4 h-4" />
                    <span>{isFr ? 'Concepts clés majeurs' : 'Key Architecture Concepts'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {officialDomainDetail.sheetDetail.keyConcepts.map((kc, i) => (
                      <span 
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#000f21] text-[#bfc7d2] border border-[#1b2b3f] text-xs font-mono"
                      >
                        {kc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Exam Traps */}
                <div className="bg-[#102034] p-5 rounded-2xl border border-[#1b2b3f] flex flex-col gap-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#ffb4ab]">
                    <AlertTriangle className="w-4 h-4 text-[#ffb4ab]" />
                    <span>{isFr ? 'Pièges d\'examen identifiés' : 'Identified Exam Traps'}</span>
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    {officialDomainDetail.sheetDetail.examTraps.map((trap, i) => (
                      <div 
                        key={i} 
                        className="p-2.5 rounded-lg bg-[#2a1215] border border-[#690005]/40 text-xs text-[#ffb4ab] leading-relaxed"
                      >
                        {trap}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 3. MEMORIZATION PROGRESS BAR & METRICS */}
          <div className="bg-[#0b1c30] p-4 rounded-xl border border-[#1b2b3f] flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#d3e4fe]">
                  {isFr ? 'Progression de mémorisation :' : 'Memorization Progress:'}
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#003824] text-[#4edea3] border border-[#003824]">
                  {domainStats.percent}% {isFr ? 'Maîtrisé' : 'Mastered'}
                </span>
                <span className="text-xs text-[#89929b] font-mono">
                  ({domainStats.mastered} / {domainStats.total} {isFr ? 'cartes' : 'cards'})
                </span>
              </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsShuffled((prev) => !prev)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold flex items-center gap-1 border transition-all ${
                isShuffled
                  ? 'bg-[#3198dc] text-[#002c47] border-[#3198dc]'
                  : 'bg-[#102034] text-[#bfc7d2] border-[#1b2b3f] hover:text-[#d3e4fe]'
              }`}
              title={isFr ? 'Activer / désactiver l\'ordre aléatoire' : 'Toggle shuffle'}
            >
              <Shuffle className="w-3 h-3" />
              <span>{isFr ? 'Aléatoire' : 'Shuffle'}</span>
            </button>

            {resetConfirm ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#ffb4ab] font-mono">
                  {isFr ? 'Confirmer ?' : 'Confirm?'}
                </span>
                <button
                  onClick={handleResetProgress}
                  className="px-2 py-1 rounded bg-[#93000a] hover:bg-[#ba1a1a] text-white text-[11px] font-mono font-bold"
                >
                  {isFr ? 'Oui, réinitialiser' : 'Yes, reset'}
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-2 py-1 rounded bg-[#1b2b3f] text-[#bfc7d2] text-[11px] font-mono"
                >
                  {isFr ? 'Annuler' : 'Cancel'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                className="px-2.5 py-1 rounded text-xs font-mono text-[#89929b] hover:text-[#ffb4ab] hover:bg-[#1b2b3f] flex items-center gap-1 transition-colors"
                title={isFr ? 'Réinitialiser vos marqueurs de progression pour ce domaine' : 'Reset progress tags'}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isFr ? 'Réinitialiser' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full bg-[#000f21] h-2.5 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${(domainStats.mastered / (domainStats.total || 1)) * 100}%` }}
            className="bg-[#4edea3] h-full transition-all duration-300"
            title={`${domainStats.mastered} Maîtrisées`}
          />
          <div 
            style={{ width: `${(domainStats.learning / (domainStats.total || 1)) * 100}%` }}
            className="bg-[#f59e0b] h-full transition-all duration-300"
            title={`${domainStats.learning} En cours d'apprentissage`}
          />
          <div 
            style={{ width: `${(domainStats.review / (domainStats.total || 1)) * 100}%` }}
            className="bg-[#ffb4ab] h-full transition-all duration-300"
            title={`${domainStats.review} À revoir`}
          />
        </div>

        {/* Counter chips */}
        <div className="flex items-center gap-2 flex-wrap font-mono text-xs pt-1">
          <button
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${
              selectedStatusFilter === 'all' 
                ? (isLight ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300' : 'bg-[#1b2b3f] text-[#d3e4fe] font-bold border border-[#26364a]')
                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-[#89929b] hover:text-[#d3e4fe]')
            }`}
          >
            <span>{isFr ? 'Toutes' : 'All'} :</span>
            <span className={`font-bold ${isLight ? 'text-sky-800' : 'text-[#93ccff]'}`}>{domainStats.total}</span>
          </button>

          <button
            onClick={() => setSelectedStatusFilter('mastered')}
            className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${
              selectedStatusFilter === 'mastered' 
                ? (isLight ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' : 'bg-[#003824] text-[#4edea3] font-bold border border-[#4edea3]/40')
                : (isLight ? 'text-slate-600 hover:text-emerald-700' : 'text-[#89929b] hover:text-[#4edea3]')
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-emerald-600' : 'bg-[#4edea3]'}`} />
            <span>{isFr ? 'Maîtrisées' : 'Mastered'} :</span>
            <span className={`font-bold ${isLight ? 'text-emerald-800' : 'text-[#4edea3]'}`}>{domainStats.mastered}</span>
          </button>

          <button
            onClick={() => setSelectedStatusFilter('learning')}
            className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${
              selectedStatusFilter === 'learning' 
                ? (isLight ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300' : 'bg-[#4a2800] text-[#f59e0b] font-bold border border-[#f59e0b]/40')
                : (isLight ? 'text-slate-600 hover:text-amber-700' : 'text-[#89929b] hover:text-[#f59e0b]')
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-amber-500' : 'bg-[#f59e0b]'}`} />
            <span>{isFr ? 'En cours' : 'Learning'} :</span>
            <span className={`font-bold ${isLight ? 'text-amber-800' : 'text-[#f59e0b]'}`}>{domainStats.learning}</span>
          </button>

          <button
            onClick={() => setSelectedStatusFilter('review')}
            className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${
              selectedStatusFilter === 'review' 
                ? (isLight ? 'bg-red-100 text-red-900 font-bold border border-red-300' : 'bg-[#690005] text-[#ffb4ab] font-bold border border-[#ffb4ab]/40')
                : (isLight ? 'text-slate-600 hover:text-red-700' : 'text-[#89929b] hover:text-[#ffb4ab]')
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-red-600' : 'bg-[#ffb4ab]'}`} />
            <span>{isFr ? 'À revoir' : 'Review'} :</span>
            <span className={`font-bold ${isLight ? 'text-red-800' : 'text-[#ffb4ab]'}`}>{domainStats.review}</span>
          </button>

          <button
            onClick={() => setSelectedStatusFilter('unseen')}
            className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors ${
              selectedStatusFilter === 'unseen' 
                ? (isLight ? 'bg-slate-200 text-slate-900 font-bold border border-slate-300' : 'bg-[#1b2b3f] text-[#bfc7d2] font-bold border border-[#26364a]')
                : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-[#89929b] hover:text-[#bfc7d2]')
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLight ? 'bg-slate-400' : 'bg-[#3f4850]'}`} />
            <span>{isFr ? 'Non vues' : 'Unseen'} :</span>
            <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-[#bfc7d2]'}`}>{domainStats.unseen}</span>
          </button>
        </div>
      </div>

      {/* 4. FILTER BAR: SUBTOPICS, SEARCH, DIFFICULTY */}
      <div className="bg-[#102034] p-3 rounded-xl border border-[#1b2b3f] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Subtopic chips / dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#89929b] shrink-0" />
          <button
            onClick={() => setSelectedSubtopic('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSubtopic === 'all'
                ? 'bg-[#3198dc] text-[#002c47]'
                : 'text-[#bfc7d2] hover:bg-[#1b2b3f]'
            }`}
          >
            {isFr ? 'Tous les sous-thèmes' : 'All Subtopics'}
          </button>
          {availableSubtopics.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedSubtopic(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubtopic === st
                  ? 'bg-[#3198dc] text-[#002c47]'
                  : 'text-[#bfc7d2] hover:bg-[#1b2b3f]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-[#89929b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isFr ? 'Filtrer (mot-clé, code, piège)...' : 'Filter (keyword, code, trap)...'}
            className="w-full h-8 pl-8 pr-3 bg-[#000f21] border border-[#1b2b3f] text-xs text-[#d3e4fe] rounded-lg outline-none focus:border-[#3198dc]"
          />
        </div>
      </div>

      {/* 5. MAIN CONTENT AREA: FOCUS CARD MODE OR GRID VIEW */}
      {filteredCards.length === 0 ? (
        <div className="bg-[#102034] p-12 rounded-xl border border-[#1b2b3f] text-center flex flex-col items-center gap-3">
          <HelpCircle className="w-10 h-10 text-[#89929b]" />
          <h3 className="text-base font-bold text-[#d3e4fe]">
            {isFr ? 'Aucune flashcard ne correspond aux filtres' : 'No flashcards match current filters'}
          </h3>
          <p className="text-xs text-[#bfc7d2] max-w-md">
            {isFr 
              ? 'Essayez de réinitialiser la recherche ou de changer les filtres de statut et de sous-thème.' 
              : 'Try clearing your search query or adjusting status and subtopic filters.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSubtopic('all');
              setSelectedStatusFilter('all');
              setSelectedDifficulty('all');
            }}
            className="px-4 py-2 bg-[#1b2b3f] hover:bg-[#26364a] text-[#93ccff] rounded-lg text-xs font-semibold transition-colors"
          >
            {isFr ? 'Effacer tous les filtres' : 'Clear all filters'}
          </button>
        </div>
      ) : viewMode === 'card' && currentCard ? (
        /* FOCUS CARD MODE */
        <div className="flex flex-col items-center gap-4 sm:gap-5 w-full">
          {/* Card Header Info & Quick Jumper */}
          <div className="w-full max-w-5xl flex items-center justify-between text-xs font-mono text-[#89929b] px-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#93ccff]">
                Carte #{currentCard.cardNumber}
              </span>
              <span>•</span>
              <span className="text-[#bfc7d2] font-semibold">{currentCard.subtopic}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#d3e4fe]">
                {currentIndex + 1} / {filteredCards.length}
              </span>
              <span className="hidden sm:inline text-[10px] text-[#89929b]">
                ({isFr ? 'Espace pour retourner, Flèches ← →' : 'Space to flip, Arrows ← →'})
              </span>
            </div>
          </div>

          {/* 3D INTERACTIVE FLIP CARD CONTAINER - EXPANDED TO FULL VISIBLE SURFACE */}
          <div className="w-full max-w-5xl min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] perspective-1000">
            <div 
              className={`relative w-full h-full min-h-[480px] sm:min-h-[520px] lg:min-h-[560px] rounded-2xl transition-transform duration-500 transform-style-preserve-3d cursor-pointer select-none ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={handleFlip}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleFlip();
                }
              }}
              title={isFr ? 'Cliquer pour retourner la carte' : 'Click to flip card'}
            >
              {/* FRONT OF THE CARD (RECTO) */}
              <div className={`absolute inset-0 w-full h-full rounded-2xl border-2 p-5 sm:p-7 lg:p-8 flex flex-col justify-between shadow-xl backface-hidden transition-colors overflow-y-auto ${
                isLight 
                  ? 'bg-white border-slate-200 hover:border-sky-400 shadow-slate-200/50' 
                  : 'bg-[#102034] border-[#1b2b3f] hover:border-[#3198dc]/70'
              }`}>
                <div className="flex flex-col gap-4">
                  {/* Top Bar of Front */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border ${
                        isLight
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-[#3198dc]/20 text-[#93ccff] border-[#3198dc]/40'
                      }`}>
                        {currentCard.domainCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                        currentCard.difficulty === 'hard'
                          ? isLight ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/30'
                          : currentCard.difficulty === 'medium'
                            ? isLight ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-[#4a2800]/30 text-[#f59e0b] border border-[#f59e0b]/30'
                            : isLight ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#003824]/30 text-[#4edea3] border border-[#4edea3]/30'
                      }`}>
                        {currentCard.difficulty}
                      </span>
                    </div>

                    {/* Current Mastery Tag on Card */}
                    <div>
                      {masteryMap[currentCard.id] === 'mastered' ? (
                        <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold flex items-center gap-1 border ${
                          isLight
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-[#003824] text-[#4edea3] border-[#4edea3]/30'
                        }`}>
                          <CheckCircle className="w-3.5 h-3.5" />
                          {isFr ? 'Maîtrisé' : 'Mastered'}
                        </span>
                      ) : masteryMap[currentCard.id] === 'learning' ? (
                        <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold border ${
                          isLight
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-[#4a2800] text-[#f59e0b] border-[#f59e0b]/30'
                        }`}>
                          {isFr ? 'En cours' : 'Learning'}
                        </span>
                      ) : masteryMap[currentCard.id] === 'review' ? (
                        <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold border ${
                          isLight
                            ? 'bg-red-50 text-red-700 border-red-300'
                            : 'bg-[#690005] text-[#ffb4ab] border-[#ffb4ab]/30'
                        }`}>
                          {isFr ? 'À revoir' : 'Review'}
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-semibold border ${
                          isLight
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-[#000f21] text-[#89929b] border-[#1b2b3f]'
                        }`}>
                          {isFr ? 'Non vue' : 'Unseen'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question */}
                  <div className="py-1">
                    <span className={`font-mono text-[11px] uppercase tracking-wider font-bold block mb-2 ${
                      isLight ? 'text-sky-700' : 'text-[#89ceff]'
                    }`}>
                      {isFr ? 'QUESTION D\'EXAMEN :' : 'EXAM QUESTION:'}
                    </span>
                    <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold leading-relaxed ${
                      isLight ? 'text-slate-900' : 'text-[#d3e4fe]'
                    }`}>
                      {currentCard.front.question}
                    </h2>
                  </div>

                  {/* Code snippet on Front if any */}
                  {currentCard.front.codeSnippet && (
                    <div className={`p-3.5 rounded-lg border font-mono text-xs sm:text-sm whitespace-pre-wrap shadow-inner leading-relaxed ${
                      isLight 
                        ? 'bg-slate-50 border-slate-200 text-sky-900' 
                        : 'bg-[#000f21] border-[#1b2b3f] text-[#93ccff]'
                    }`}>
                      {currentCard.front.codeSnippet}
                    </div>
                  )}

                  {/* Hint Toggle */}
                  {currentCard.front.hint && (
                    <div 
                      className="mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint((prev) => !prev);
                      }}
                    >
                      <button
                        type="button"
                        className={`text-xs font-semibold flex items-center gap-1.5 focus:outline-none ${
                          isLight ? 'text-sky-700 hover:text-sky-800' : 'text-[#89ceff] hover:text-[#93ccff]'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showHint ? (isFr ? 'Masquer l\'indice' : 'Hide hint') : (isFr ? 'Afficher un indice' : 'Show hint')}</span>
                      </button>
                      {showHint && (
                        <div className={`mt-2 p-3 rounded-lg border text-xs sm:text-sm animate-in fade-in slide-in-from-top-1 ${
                          isLight 
                            ? 'bg-amber-50 border-amber-200 text-amber-900 font-medium' 
                            : 'bg-[#0b1c30] border-[#1b2b3f] text-[#bfc7d2]'
                        }`}>
                          💡 {currentCard.front.hint}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Flip Indicator */}
                <div className={`pt-4 mt-4 border-t flex items-center justify-between text-xs font-mono ${
                  isLight ? 'border-slate-200 text-slate-500' : 'border-[#1b2b3f] text-[#89929b]'
                }`}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentCard.tags.map((t) => (
                      <span key={t} className={`px-2 py-0.5 rounded text-[10px] ${
                        isLight ? 'bg-slate-100 text-slate-600 font-medium' : 'bg-[#000f21] text-[#89929b]'
                      }`}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className={`flex items-center gap-1.5 font-semibold group transition-colors ${
                    isLight ? 'text-sky-700 hover:text-sky-800' : 'text-[#3198dc] hover:text-[#93ccff]'
                  }`}>
                    <span>{isFr ? 'Cliquer pour voir la réponse' : 'Click to see answer'}</span>
                    <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                  </div>
                </div>
              </div>

              {/* BACK OF THE CARD (VERSO) - FULL VISIBLE EXPANDED SURFACE */}
              <div className={`absolute inset-0 w-full h-full rounded-2xl border-2 p-5 sm:p-7 lg:p-8 flex flex-col justify-between rotate-y-180 backface-hidden overflow-y-auto transition-colors ${
                isLight 
                  ? 'bg-white border-emerald-400/80 shadow-2xl shadow-emerald-950/5' 
                  : 'bg-[#0b1c30] border-[#4edea3]/40 shadow-2xl'
              }`}>
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Top Bar of Back */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                        isLight
                          ? 'text-emerald-800 bg-emerald-100/90 border-emerald-300'
                          : 'text-[#4edea3] bg-[#003824] border-[#4edea3]/30'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isFr ? 'RÉPONSE & RÈGLE ORACLE' : 'ORACLE RULE & ANSWER'}
                      </span>
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                        isLight 
                          ? 'bg-slate-100 text-slate-700 border-slate-200 font-semibold' 
                          : 'bg-[#102034] text-[#89929b] border-[#1b2b3f]'
                      }`}>
                        {currentCard.domainCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentCard.back.ruleRef && (
                        <span className={`hidden sm:inline-flex items-center gap-1 font-mono text-[11px] font-medium ${
                          isLight ? 'text-sky-700' : 'text-[#89ceff]'
                        }`}>
                          <Info className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-[#3198dc]'}`} />
                          {currentCard.back.ruleRef}
                        </span>
                      )}
                      <span className={`font-mono text-xs font-bold ${
                        isLight ? 'text-slate-500' : 'text-[#89929b]'
                      }`}>
                        #{currentCard.cardNumber}
                      </span>
                    </div>
                  </div>

                  {/* Direct Answer Banner - Full width and prominent */}
                  <div className={`p-4 rounded-xl border flex flex-col gap-1.5 shadow-sm transition-colors ${
                    isLight 
                      ? 'bg-emerald-50/90 border-emerald-200 shadow-emerald-950/5' 
                      : 'bg-[#003824]/35 border-[#4edea3]/40'
                  }`}>
                    <span className={`font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isLight ? 'text-emerald-800' : 'text-[#4edea3]'
                    }`}>
                      {isFr ? 'RÉPONSE DIRECTE :' : 'CORE ANSWER:'}
                    </span>
                    <p className={`text-sm sm:text-base font-bold leading-snug ${
                      isLight ? 'text-slate-900' : 'text-[#e6f4ea]'
                    }`}>
                      {currentCard.back.answer}
                    </p>
                  </div>

                  {/* Detailed Explanation */}
                  <div className={`text-xs sm:text-sm leading-relaxed ${
                    isLight ? 'text-slate-800 font-normal' : 'text-[#d3e4fe]/90'
                  }`}>
                    {currentCard.back.explanation}
                  </div>

                  {/* Responsive Grid for Code Snippet & Exam Trap */}
                  {(currentCard.back.codeSnippet || currentCard.back.examTrap) && (
                    <div className={`grid gap-3 ${
                      currentCard.back.codeSnippet && currentCard.back.examTrap 
                        ? 'grid-cols-1 md:grid-cols-2' 
                        : 'grid-cols-1'
                    }`}>
                      {/* Code Snippet Box */}
                      {currentCard.back.codeSnippet && (
                        <div className="relative group/code flex flex-col h-full">
                          <div className={`p-3 rounded-lg border font-mono text-xs sm:text-[13px] whitespace-pre-wrap shadow-inner leading-relaxed flex-1 ${
                            isLight
                              ? 'bg-slate-50 border-slate-200 text-sky-900'
                              : 'bg-[#000f21] border-[#1b2b3f] text-[#93ccff]'
                          }`}>
                            {currentCard.back.codeSnippet}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(currentCard.back.codeSnippet!, currentCard.id);
                            }}
                            className={`absolute top-2 right-2 p-1.5 rounded transition-opacity ${
                              isLight
                                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                : 'bg-[#1b2b3f] hover:bg-[#26364a] text-[#89ceff] opacity-80 hover:opacity-100'
                            }`}
                            title={isFr ? 'Copier le code' : 'Copy code'}
                          >
                            {copiedCodeId === currentCard.id ? (
                              <Check className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-[#4edea3]'}`} />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Exam Trap Alert Callout */}
                      {currentCard.back.examTrap && (
                        <div className={`p-3 sm:p-3.5 rounded-lg border flex items-start gap-2.5 h-full ${
                          isLight
                            ? 'bg-red-50/90 border-red-200'
                            : 'bg-[#690005]/25 border-[#ffb4ab]/40'
                        }`}>
                          <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isLight ? 'text-red-600' : 'text-[#ffb4ab]'
                          }`} />
                          <div className="flex flex-col gap-1">
                            <span className={`font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                              isLight ? 'text-red-700' : 'text-[#ffb4ab]'
                            }`}>
                              {isFr ? '⚠️ PIÈGE CLASSIQUE 1Z0-071 :' : '⚠️ 1Z0-071 EXAM TRAP:'}
                            </span>
                            <p className={`text-xs sm:text-[13px] leading-relaxed font-medium ${
                              isLight ? 'text-red-950' : 'text-[#ffdad6]'
                            }`}>
                              {currentCard.back.examTrap}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Syllabus reference fallback if hidden on top */}
                  {currentCard.back.ruleRef && (
                    <div className={`sm:hidden flex items-center gap-1.5 font-mono text-[10px] ${
                      isLight ? 'text-slate-500' : 'text-[#89929b]'
                    }`}>
                      <Info className={`w-3 h-3 ${isLight ? 'text-sky-600' : 'text-[#3198dc]'}`} />
                      <span>{isFr ? 'Syllabus :' : 'Syllabus:'}</span>
                      <span className={`font-semibold ${isLight ? 'text-sky-700' : 'text-[#89ceff]'}`}>
                        {currentCard.back.ruleRef}
                      </span>
                    </div>
                  )}
                </div>

                {/* Flip back indicator */}
                <div className={`pt-3 mt-3 border-t flex items-center justify-between text-xs font-mono ${
                  isLight ? 'border-slate-200 text-slate-500' : 'border-[#1b2b3f] text-[#89929b]'
                }`}>
                  <span>{isFr ? 'Évaluez votre maîtrise ci-dessous' : 'Tag your mastery level below'}</span>
                  <div className={`flex items-center gap-1.5 font-semibold group transition-colors ${
                    isLight ? 'text-emerald-700 hover:text-emerald-800' : 'text-[#4edea3] hover:text-[#93ccff]'
                  }`}>
                    <span>{isFr ? 'Retourner la carte' : 'Flip back'}</span>
                    <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MASTERY ACTIONS & NAVIGATION CONTROLS BAR */}
          <div className={`w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border ${
            isLight ? 'bg-white border-slate-200 shadow-md' : 'bg-[#102034] border-[#1b2b3f]'
          }`}>
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className={`w-full sm:w-auto px-4 py-2 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-95 ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200' 
                  : 'bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe]'
              }`}
              title={isFr ? 'Carte précédente (Flèche gauche)' : 'Previous card (Left Arrow)'}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isFr ? 'Précédent' : 'Previous'}</span>
            </button>

            {/* Mastery Tag Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center flex-wrap">
              <button
                onClick={() => {
                  handleSetStatus(currentCard.id, 'review');
                  handleNext();
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                  masteryMap[currentCard.id] === 'review'
                    ? 'bg-red-600 text-white ring-2 ring-red-400'
                    : isLight
                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                      : 'bg-[#690005]/40 hover:bg-[#690005] text-[#ffb4ab] border border-[#ffb4ab]/30'
                }`}
                title={isFr ? 'Touche [1] du clavier' : 'Key [1]'}
              >
                <span>🔴</span>
                <span>{isFr ? 'À revoir' : 'Review'}</span>
                <span className="text-[10px] opacity-75 font-mono">[1]</span>
              </button>

              <button
                onClick={() => {
                  handleSetStatus(currentCard.id, 'learning');
                  handleNext();
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                  masteryMap[currentCard.id] === 'learning'
                    ? 'bg-amber-500 text-slate-900 ring-2 ring-amber-400'
                    : isLight
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-[#4a2800]/40 hover:bg-[#4a2800] text-[#f59e0b] border border-[#f59e0b]/30'
                }`}
                title={isFr ? 'Touche [2] du clavier' : 'Key [2]'}
              >
                <span>🟡</span>
                <span>{isFr ? 'En cours' : 'Learning'}</span>
                <span className="text-[10px] opacity-75 font-mono">[2]</span>
              </button>

              <button
                onClick={() => {
                  handleSetStatus(currentCard.id, 'mastered');
                  handleNext();
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                  masteryMap[currentCard.id] === 'mastered'
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-md shadow-emerald-600/20'
                    : isLight
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-[#003824]/40 hover:bg-[#003824] text-[#4edea3] border border-[#4edea3]/30'
                }`}
                title={isFr ? 'Touche [3] du clavier' : 'Key [3]'}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isFr ? 'Maîtrisé' : 'Mastered'}</span>
                <span className="text-[10px] opacity-75 font-mono">[3]</span>
              </button>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-4 py-2 bg-[#3198dc] hover:bg-[#93ccff] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-[#3198dc]/20"
              title={isFr ? 'Carte suivante (Flèche droite)' : 'Next card (Right Arrow)'}
            >
              <span>{isFr ? 'Suivant' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* GRID VIEW OF CARDS */
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#89929b]">
              {filteredCards.length} {isFr ? 'flashcards affichées' : 'flashcards displayed'}
            </span>
            <span className="text-xs text-[#93ccff] font-mono">
              {isFr ? 'Cliquez sur une fiche pour l\'ouvrir en Mode Focus' : 'Click any card to open in Focus Mode'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card, idx) => {
              const status = masteryMap[card.id] || 'unseen';
              const statusBadge = 
                status === 'mastered' 
                  ? (isLight ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-[#003824] text-[#4edea3] border border-[#4edea3]/40')
                  : status === 'learning'
                    ? (isLight ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-[#4a2800] text-[#f59e0b] border border-[#f59e0b]/40')
                    : status === 'review'
                      ? (isLight ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-[#690005] text-[#ffb4ab] border border-[#ffb4ab]/40')
                      : (isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-[#000f21] text-[#89929b] border border-[#1b2b3f]');

              const statusLabel = 
                status === 'mastered' ? (isFr ? 'Maîtrisé' : 'Mastered') :
                status === 'learning' ? (isFr ? 'En cours' : 'Learning') :
                status === 'review' ? (isFr ? 'À revoir' : 'Review') :
                (isFr ? 'Non vue' : 'Unseen');

              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setViewMode('card');
                    setIsFlipped(false);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-md ${
                    isLight
                      ? 'bg-white border-slate-200 hover:border-sky-400 hover:bg-slate-50/50'
                      : 'bg-[#102034] border-[#1b2b3f] hover:border-[#3198dc] hover:bg-[#13253c]'
                  }`}
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-[10px] font-bold ${
                        isLight ? 'text-sky-700' : 'text-[#93ccff]'
                      }`}>
                        #{card.cardNumber} • {card.domainCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${statusBadge}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className={`font-mono text-[10px] ${
                      isLight ? 'text-sky-700 font-semibold' : 'text-[#89ceff]'
                    }`}>
                      {card.subtopic}
                    </div>

                    <h3 className={`text-xs font-bold transition-colors leading-snug line-clamp-3 ${
                      isLight ? 'text-slate-900 group-hover:text-sky-600' : 'text-[#d3e4fe] group-hover:text-[#93ccff]'
                    }`}>
                      {card.front.question}
                    </h3>

                    {card.front.codeSnippet && (
                      <div className={`p-2 rounded border font-mono text-[10px] line-clamp-2 ${
                        isLight ? 'bg-slate-50 border-slate-200 text-sky-900' : 'bg-[#000f21] border-[#1b2b3f] text-[#93ccff]'
                      }`}>
                        {card.front.codeSnippet}
                      </div>
                    )}
                  </div>

                  <div className={`pt-2 border-t flex items-center justify-between font-mono text-[10px] ${
                    isLight ? 'border-slate-100' : 'border-[#1b2b3f]'
                  }`}>
                    <span className={isLight ? 'text-slate-500' : 'text-[#89929b]'}>
                      {isFr ? 'Règle :' : 'Rule:'} {card.back.ruleRef || 'Oracle SQL'}
                    </span>
                    <span className={`inline-flex items-center gap-1 font-semibold ${
                      isLight ? 'text-sky-600 group-hover:text-sky-700' : 'text-[#3198dc] group-hover:text-[#93ccff]'
                    }`}>
                      <span>{isFr ? 'Étudier' : 'Study'}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}

      {/* 6. SYLLABUS CORRELATION FOOTER */}
      <div className="bg-[#000f21] p-4 rounded-xl border border-[#1b2b3f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-[#bfc7d2]">
          <BookOpen className="w-4 h-4 text-[#3198dc] shrink-0" />
          <span>
            {isFr 
              ? 'Besoin de revoir la théorie complète du domaine ? Consultez la fiche intégrale.' 
              : 'Need to review the in-depth theory? Open the complete domain study sheet.'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('syllabus')}
            className="px-3 py-1.5 rounded-lg bg-[#1b2b3f] hover:bg-[#26364a] text-[#89ceff] font-semibold text-xs transition-colors flex items-center gap-1"
          >
            <span>{isFr ? 'Fiches d\'étude' : 'Study Sheets'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('sandbox')}
            className="px-3 py-1.5 rounded-lg bg-[#3198dc] hover:bg-[#93ccff] text-[#002c47] font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isFr ? 'Tester dans le SQL Lab' : 'Test in SQL Lab'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
