import React, { useEffect } from 'react';
import { 
  X, 
  FileCheck2, 
  CreditCard, 
  Terminal, 
  BookOpen, 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  RefreshCw, 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  Globe, 
  Sun, 
  Moon, 
  ChevronRight,
  Radio,
  Cpu,
  Sparkles,
  Layers
} from 'lucide-react';
import { NavigationTab, CertificationTrackId, SystemVersionInfo } from '../types';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  selectedCert: CertificationTrackId;
  onCertChange: (cert: CertificationTrackId) => void;
  onOpenSystemSettings: () => void;
  systemInfo: SystemVersionInfo;
  lang: 'fr' | 'en';
  onLangToggle: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  selectedCert,
  onCertChange,
  onOpenSystemSettings,
  systemInfo,
  lang,
  onLangToggle,
  theme,
  onThemeToggle,
}) => {
  const isFr = lang === 'fr';

  // Fermeture par la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Empêcher le scroll du body quand le tiroir est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavigate = (tab: NavigationTab) => {
    onTabChange(tab);
    onClose();
  };

  const categories = [
    {
      id: 'cat-evaluations',
      titleFr: 'Évaluations & Certifications',
      titleEn: 'Exams & Certifications',
      color: '#3198dc',
      items: [
        {
          id: 'item-exams',
          tab: 'exams' as NavigationTab,
          labelFr: 'Simulateur d\'examens chronométrés',
          labelEn: 'Timed Exam Simulator',
          descFr: 'Conditions réelles d\'examen, explications détaillées et questions pièges.',
          descEn: 'Real exam conditions, instant explanations, and trap questions.',
          icon: FileCheck2,
          badge: isFr ? 'Mode Réel' : 'Real Mode',
        },
        {
          id: 'item-dashboard',
          tab: 'dashboard' as NavigationTab,
          labelFr: 'Tableau de bord de certification',
          labelEn: 'Certification Dashboard',
          descFr: 'Vue d\'ensemble de votre préparation et sprints recommandés.',
          descEn: 'Preparation overview and recommended study sprints.',
          icon: LayoutDashboard,
          badge: isFr ? 'Pilotage' : 'Overview',
        },
      ],
    },
    {
      id: 'cat-revision',
      titleFr: 'Apprentissage & Mémorisation',
      titleEn: 'Learning & Memorization',
      color: '#4edea3',
      items: [
        {
          id: 'item-flashcards',
          tab: 'flashcards' as NavigationTab,
          labelFr: 'Flashcards interactives (1600+)',
          labelEn: 'Interactive Flashcards (1600+)',
          descFr: 'Cartes mémoires avec syntaxe T-SQL/PL-SQL/Postgres, architecture HA/DR, pièges et justifications.',
          descEn: 'Memory cards with T-SQL/PL-SQL/Postgres syntax, HA/DR architecture, traps, and justifications.',
          icon: CreditCard,
          badge: '1600+ Cartes',
        },
        {
          id: 'item-syllabus',
          tab: 'syllabus' as NavigationTab,
          labelFr: 'Fiches de révision & Compétences',
          labelEn: 'Study Sheets & Skills Matrix',
          descFr: 'Syllabus officiel, clauses indispensables et règles de syntaxe.',
          descEn: 'Official syllabus, key clauses, and syntax rules.',
          icon: BookOpen,
          badge: isFr ? 'Référentiel' : 'Curriculum',
        },
      ],
    },
    {
      id: 'cat-practice',
      titleFr: 'Pratique & Laboratoire SQL',
      titleEn: 'Practice & SQL Laboratory',
      color: '#f59e0b',
      items: [
        {
          id: 'item-sandbox',
          tab: 'sandbox' as NavigationTab,
          labelFr: 'Lab SQL interactif & Bac à sable',
          labelEn: 'Interactive SQL Lab & Sandbox',
          descFr: 'Console d\'exécution SQL en direct sur les dialectes Oracle, Azure SQL, Postgres.',
          descEn: 'Live SQL console running Oracle, Azure SQL, Postgres dialects.',
          icon: Terminal,
          badge: isFr ? 'Console Active' : 'Active Console',
        },
      ],
    },
    {
      id: 'cat-analytics',
      titleFr: 'Analyses & Progression',
      titleEn: 'Analytics & Mastery',
      color: '#a855f7',
      items: [
        {
          id: 'item-analytics',
          tab: 'analytics' as NavigationTab,
          labelFr: 'Statistiques avancées & Badges',
          labelEn: 'Advanced Stats & Badges',
          descFr: 'Taux de réussite par domaine, temps moyen par question et badges acquis.',
          descEn: 'Success rate per domain, average response time, and unlocked badges.',
          icon: BarChart3,
          badge: isFr ? 'Scores' : 'Scores',
        },
      ],
    },
  ];

  const certOptions: { id: CertificationTrackId; label: string; icon: string }[] = [
    { id: 'oracle-1z0-071', label: 'Oracle Database SQL (1Z0-071)', icon: '🔴' },
    { id: 'azure-dp-900', label: 'Azure Data Fundamentals (DP-900)', icon: '🔷' },
    { id: 'azure-dp-800', label: 'Azure Database Admin (DP-300 / DP-800)', icon: '🟢' },
    { id: 'postgres-edb', label: 'PostgreSQL EDB Certified Associate', icon: '🐘' },
    { id: 'mysql-80-dba', label: 'MySQL 8.0 Database Administrator', icon: '🐬' },
  ];

  return (
    <div 
      id="hamburger-menu-overlay"
      className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      {/* Sliding Drawer from Left */}
      <div 
        id="hamburger-drawer-panel"
        className="w-full max-w-md md:max-w-lg h-full bg-[#031427] border-r border-[#1b2b3f] shadow-2xl flex flex-col justify-between overflow-hidden animate-slideInLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#1b2b3f] bg-[#000f21]/95 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006398] to-[#3198dc] flex items-center justify-center text-white shadow-lg shadow-[#006398]/30">
              <Database className="w-5 h-5 text-[#93ccff]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#d3e4fe] flex items-center gap-2">
                <span>DBMastery Studio</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#3198dc]/20 text-[#89ceff] border border-[#3198dc]/30">
                  {systemInfo.currentVersion}
                </span>
              </h2>
              <p className="text-xs text-[#89929b] font-mono">
                {isFr ? 'Menu de navigation & Fonctionnalités' : 'Navigation Menu & Features'}
              </p>
            </div>
          </div>

          <button
            id="hamburger-close-btn"
            onClick={onClose}
            aria-label={isFr ? 'Fermer le menu' : 'Close menu'}
            className="p-2 rounded-lg bg-[#102034] text-[#89929b] hover:text-[#d3e4fe] hover:bg-[#1b2b3f] border border-[#1b2b3f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body: Categorized Features */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Quick Active Certification Switcher */}
          <div className="p-3 bg-[#0b1c30] rounded-xl border border-[#1b2b3f] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#89929b] font-mono">
              <span className="flex items-center gap-1.5 font-semibold text-[#89ceff]">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isFr ? 'Filière de certification active' : 'Active certification track'}
              </span>
              <span className="text-[10px] text-[#4edea3]">
                {isFr ? 'Changer en 1 clic' : 'Switch anytime'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {certOptions.map((c) => {
                const isSelected = selectedCert === c.id;
                return (
                  <button
                    key={c.id}
                    id={`quick-cert-btn-${c.id}`}
                    onClick={() => onCertChange(c.id)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-all font-medium border ${
                      isSelected
                        ? 'bg-[#3198dc]/20 text-[#89ceff] border-[#3198dc]/40 font-semibold'
                        : 'bg-[#102034]/60 text-[#bfc7d2] border-transparent hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
                    }`}
                  >
                    <span className="text-sm shrink-0">{c.icon}</span>
                    <span className="truncate text-[11px]">{c.label}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-[#4edea3] ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories Grid */}
          <div className="space-y-5">
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#89929b]">
                    {isFr ? cat.titleFr : cat.titleEn}
                  </h3>
                </div>

                <div className="space-y-1.5">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.tab;
                    return (
                      <button
                        key={item.id}
                        id={item.id}
                        onClick={() => handleNavigate(item.tab)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left border group ${
                          isActive
                            ? 'bg-[#102034] border-[#3198dc]/40 shadow-sm'
                            : 'bg-[#0b1c30]/70 border-[#1b2b3f]/80 hover:bg-[#102034] hover:border-[#26364a]'
                        }`}
                      >
                        <div 
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isActive ? 'bg-[#3198dc] text-[#002c47]' : 'bg-[#1b2b3f] text-[#89ceff] group-hover:bg-[#3198dc]/20'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-semibold truncate ${isActive ? 'text-[#89ceff]' : 'text-[#d3e4fe] group-hover:text-white'}`}>
                              {isFr ? item.labelFr : item.labelEn}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1b2b3f] text-[#bfc7d2] shrink-0 border border-[#26364a]">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#89929b] line-clamp-1 mt-0.5">
                            {isFr ? item.descFr : item.descEn}
                          </p>
                        </div>

                        <ChevronRight className={`w-4 h-4 shrink-0 mt-2 text-[#89929b] transition-transform group-hover:translate-x-0.5 ${isActive ? 'text-[#89ceff]' : ''}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Paramètres & Mise à jour CTA Card */}
          <div className="p-4 bg-gradient-to-br from-[#102034] to-[#0b1c30] rounded-2xl border border-[#3198dc]/30 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#3198dc]/20 flex items-center justify-center text-[#89ceff]">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#d3e4fe]">
                    {isFr ? 'Paramètres Système & Mises à jour' : 'System Settings & Updates'}
                  </h4>
                  <p className="text-[10px] text-[#89929b] font-mono">
                    {systemInfo.currentVersion} • {isFr ? 'Version officielle' : 'Official Build'}
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00a572]/20 border border-[#4edea3]/30 text-[10px] font-mono font-semibold text-[#4edea3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                {systemInfo.autoUpdateEnabled ? (isFr ? 'Auto-update actif' : 'Auto-update on') : (isFr ? 'Manuel' : 'Manual')}
              </span>
            </div>

            <p className="text-[11px] text-[#bfc7d2] leading-relaxed">
              {isFr 
                ? 'Consultez la date de sortie, la dernière vérification et forcez l\'installation immédiate des derniers correctifs.' 
                : 'View release date, last checked time, and force installation of the latest updates.'}
            </p>

            <button
              id="hamburger-open-system-settings-btn"
              onClick={() => {
                onClose();
                onOpenSystemSettings();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#3198dc] hover:bg-[#2084c7] text-[#002c47] font-bold text-xs shadow-md transition-all active:scale-[0.98]"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isFr ? 'Ouvrir les Paramètres Système' : 'Open System Settings'}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            </button>
          </div>
        </div>

        {/* Bottom Drawer Footer: Theme, Lang, Status */}
        <div className="p-4 border-t border-[#1b2b3f] bg-[#000f21]/90 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {/* Lang toggle */}
            <button
              id="hamburger-lang-toggle"
              onClick={onLangToggle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] font-mono text-[11px] font-medium"
            >
              <Globe className="w-3.5 h-3.5 text-[#89ceff]" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Theme toggle */}
            <button
              id="hamburger-theme-toggle"
              onClick={onThemeToggle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] font-mono text-[11px] font-medium"
            >
              {theme === 'light' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>{isFr ? 'Clair' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#89ceff]" />
                  <span>{isFr ? 'Sombre' : 'Dark'}</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[10px] font-mono text-[#89929b] text-right">
            <span>{isFr ? 'Moteur SQL Connecté' : 'Engine Connected'}</span>
            <span className="block text-[#4edea3]">● {isFr ? 'Prêt' : 'Ready'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
