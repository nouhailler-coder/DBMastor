import React, { useEffect, useState } from 'react';
import {
  Home,
  Compass,
  Terminal,
  Award,
  TrendingUp,
  MoreHorizontal,
  X,
  BookOpen,
  BookMarked,
  Brain,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Network,
  BarChart3,
  Activity,
  Settings,
  HelpCircle,
  Scale,
  Globe,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { CertificationTrackId, NavigationTab } from '../types';
import { PRIMARY_SPACES, PrimarySpaceId, getSpaceForTab } from '../navigation/spaces';
import type { User } from '../services/firebaseSyncService';

interface MobileBottomNavProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  lang: 'fr' | 'en';
  onLangToggle: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  selectedCert: CertificationTrackId;
  onCertChange: (cert: CertificationTrackId) => void;
  isAdmin?: boolean;
  currentUser?: User | null;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
  onOpenSystemSettings: () => void;
  onOpenOnboarding?: () => void;
  onOpenContextualHelp?: () => void;
  onOpenLegalMentions?: () => void;
  onOpenLanding?: () => void;
}

const SPACE_ICONS: Record<PrimarySpaceId, React.ElementType> = {
  home: Home,
  learning_path: Compass,
  training: Terminal,
  certifications: Award,
  progress: TrendingUp,
};

const TAB_ICONS: Record<NavigationTab, React.ElementType> = {
  dashboard: Home,
  syllabus: BookOpen,
  glossary: BookMarked,
  exams: Brain,
  sandbox: Terminal,
  flashcards: CreditCard,
  spaced_repetition: RotateCcw,
  cert_exam: ShieldCheck,
  skills: Network,
  analytics: BarChart3,
  activity: Activity,
  access_control: ShieldCheck,
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  lang,
  onLangToggle,
  theme,
  onThemeToggle,
  selectedCert,
  onCertChange,
  isAdmin = false,
  currentUser,
  onGoogleSignIn,
  onSignOut,
  onOpenSystemSettings,
  onOpenOnboarding,
  onOpenContextualHelp,
  onOpenLegalMentions,
  onOpenLanding,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isFr = lang === 'fr';
  const activeSpace = getSpaceForTab(currentTab);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMoreOpen) {
        setIsMoreOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMoreOpen]);

  useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMoreOpen]);

  const handleSelectTab = (tab: NavigationTab) => {
    onTabChange(tab);
    setIsMoreOpen(false);
  };

  return (
    <>
      <nav
        id="mobile-bottom-nav"
        aria-label={isFr ? 'Navigation mobile principale' : 'Primary mobile navigation'}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b1c30]/95 backdrop-blur-xl border-t border-[#1b2b3f] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.35)]"
      >
        <div className="grid grid-cols-6 items-stretch max-w-full">
          {PRIMARY_SPACES.map((space) => {
            const Icon = SPACE_ICONS[space.id];
            const isActive = activeSpace === space.id;
            return (
              <button
                key={space.id}
                id={`mobile-nav-${space.id}`}
                type="button"
                onClick={() => handleSelectTab(space.defaultTab)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={isFr ? space.labelFr : space.labelEn}
                className={`min-h-[52px] px-1 py-1.5 flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#38bdf8] bg-[#102034]/80'
                    : 'text-[#9fb0c4] hover:text-[#d3e4fe]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#38bdf8]' : 'text-[#9fb0c4]'}`} />
                <span className="text-[10px] font-medium leading-none truncate max-w-full">
                  {isFr ? space.mobileLabelFr : space.mobileLabelEn}
                </span>
              </button>
            );
          })}

          <button
            id="mobile-nav-more"
            type="button"
            onClick={() => setIsMoreOpen(true)}
            aria-expanded={isMoreOpen}
            aria-haspopup="dialog"
            aria-label={isFr ? 'Plus d\'outils et réglages' : 'More tools and settings'}
            className={`min-h-[52px] px-1 py-1.5 flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              isMoreOpen || currentTab === 'access_control'
                ? 'text-[#38bdf8] bg-[#102034]/80'
                : 'text-[#9fb0c4] hover:text-[#d3e4fe]'
            }`}
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-medium leading-none truncate max-w-full">
              {isFr ? 'Plus' : 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-up More Drawer / Sheet on Mobile */}
      {isMoreOpen && (
        <div
          id="mobile-more-backdrop"
          className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={isFr ? 'Tous les espaces et outils' : 'All spaces and tools'}
            className="w-full max-h-[85vh] bg-[#0b1c30] border-t border-[#1b2b3f] rounded-t-2xl shadow-2xl flex flex-col overflow-hidden text-[#d3e4fe]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle + Header */}
            <div className="px-4 py-3.5 border-b border-[#1b2b3f] bg-[#031427] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">
                  {isFr ? 'Outils & Paramètres' : 'Tools & Settings'}
                </h2>
                <p className="text-[11px] text-[#9fb0c4]">
                  {isFr ? 'Accès rapide aux 5 espaces DBMastery' : 'Quick access to all 5 DBMastery spaces'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label={isFr ? 'Fermer le menu' : 'Close menu'}
                className="min-w-[44px] min-h-[44px] rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] flex items-center justify-center border border-[#1b2b3f] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-safe">
              {/* Auth quick action */}
              <div className="p-3 rounded-xl bg-[#102034] border border-[#1b2b3f] flex items-center justify-between gap-2">
                {currentUser ? (
                  <>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {currentUser.displayName || currentUser.email}
                      </p>
                      <p className="text-[11px] text-[#4edea3]">
                        {isFr ? 'Compte connecté' : 'Signed in'}
                      </p>
                    </div>
                    {onSignOut && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreOpen(false);
                          onSignOut();
                        }}
                        className="min-h-[44px] px-3 rounded-lg bg-[#0b1c30] text-[#ffb4ab] border border-[#1b2b3f] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{isFr ? 'Déconnexion' : 'Sign out'}</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">
                        {isFr ? 'Synchronisation cloud' : 'Cloud sync'}
                      </p>
                      <p className="text-[11px] text-[#9fb0c4]">
                        {isFr ? 'Sauvegardez votre progression' : 'Save your progress across devices'}
                      </p>
                    </div>
                    {onGoogleSignIn && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreOpen(false);
                          onGoogleSignIn();
                        }}
                        className="min-h-[44px] px-3 rounded-lg bg-[#0284c7] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>{isFr ? 'Connexion' : 'Sign In'}</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Active certification switcher */}
              <div className="space-y-1.5">
                <label
                  htmlFor="mobile-cert-select"
                  className="block text-[11px] font-mono uppercase tracking-wider text-[#9fb0c4]"
                >
                  {isFr ? 'Certification cible' : 'Target certification'}
                </label>
                <select
                  id="mobile-cert-select"
                  value={selectedCert}
                  onChange={(e) => onCertChange(e.target.value as CertificationTrackId)}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#102034] border border-[#1b2b3f] text-xs font-semibold text-white outline-none focus:border-[#38bdf8]"
                >
                  <option value="oracle-1z0-071">Oracle Database SQL 1Z0-071</option>
                  <option value="azure-dp-900">Azure Data Fundamentals DP-900</option>
                  <option value="azure-dp-800">Azure Data Engineer DP-800</option>
                  <option value="postgres-edb">PostgreSQL EDB Certified Associate</option>
                  <option value="mysql-80-dba">MySQL 8.0 Database Administrator</option>
                </select>
              </div>

              {/* All 5 spaces & their tools */}
              <div className="space-y-4">
                {PRIMARY_SPACES.map((space) => (
                  <div key={space.id} className="space-y-1.5">
                    <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#89ceff] font-semibold px-1">
                      {isFr ? space.labelFr : space.labelEn}
                    </h3>
                    <div className="grid grid-cols-1 gap-1.5">
                      {space.tabs.map((item) => {
                        const ItemIcon = TAB_ICONS[item.tab];
                        const isItemActive = currentTab === item.tab;
                        return (
                          <button
                            key={item.tab}
                            type="button"
                            onClick={() => handleSelectTab(item.tab)}
                            className={`min-h-[44px] px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-left border transition-colors cursor-pointer ${
                              isItemActive
                                ? 'bg-[#0284c7]/25 border-[#38bdf8]/50 text-white'
                                : 'bg-[#102034]/70 border-[#1b2b3f] text-[#d3e4fe] hover:bg-[#102034]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ItemIcon className="w-4 h-4 text-[#38bdf8] shrink-0" />
                              <span className="text-xs font-semibold truncate">
                                {isFr ? item.labelFr : item.labelEn}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#9fb0c4] shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Short sessions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    window.dispatchEvent(new CustomEvent('dbmastery:start_short_session', { detail: 'quick_5min' }));
                  }}
                  className="min-h-[44px] p-2.5 rounded-xl bg-[#102034] border border-[#f59e0b]/40 text-left flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#fbbf24] shrink-0" />
                  <span className="text-xs font-bold text-white">5 min (5Q)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    window.dispatchEvent(new CustomEvent('dbmastery:start_short_session', { detail: 'training_30min' }));
                  }}
                  className="min-h-[44px] p-2.5 rounded-xl bg-[#102034] border border-[#38bdf8]/40 text-left flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <span className="text-xs font-bold text-white">30 min (20Q)</span>
                </button>
              </div>

              {/* Preferences & Utilities */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onLangToggle}
                  className="min-h-[44px] px-3 rounded-xl bg-[#102034] border border-[#1b2b3f] text-xs font-semibold text-[#d3e4fe] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#38bdf8]" />
                  <span>{lang === 'fr' ? 'Français (FR)' : 'English (EN)'}</span>
                </button>

                <button
                  type="button"
                  onClick={onThemeToggle}
                  className="min-h-[44px] px-3 rounded-xl bg-[#102034] border border-[#1b2b3f] text-xs font-semibold text-[#d3e4fe] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {theme === 'light' ? (
                    <>
                      <Sun className="w-4 h-4 text-[#f59e0b]" />
                      <span>{isFr ? 'Thème clair' : 'Light theme'}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-[#89ceff]" />
                      <span>{isFr ? 'Thème sombre' : 'Dark theme'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    onOpenSystemSettings();
                  }}
                  className="min-h-[44px] px-3 rounded-xl bg-[#102034] border border-[#1b2b3f] text-xs font-semibold text-[#d3e4fe] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#89ceff]" />
                  <span>{isFr ? 'Paramètres' : 'Settings'}</span>
                </button>

                {onOpenContextualHelp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenContextualHelp();
                    }}
                    className="min-h-[44px] px-3 rounded-xl bg-[#102034] border border-[#1b2b3f] text-xs font-semibold text-[#d3e4fe] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-[#38bdf8]" />
                    <span>{isFr ? 'Aide' : 'Help'}</span>
                  </button>
                )}

                {onOpenOnboarding && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenOnboarding();
                    }}
                    className="min-h-[44px] px-3 rounded-xl bg-[#102034] border border-[#1b2b3f] text-xs font-semibold text-[#4edea3] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>{isFr ? 'Guide / Objectifs' : 'Setup / Goals'}</span>
                  </button>
                )}

                {onOpenLegalMentions && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenLegalMentions();
                    }}
                    className="min-h-[44px] px-3 rounded-xl bg-[#102034] border border-[#1b2b3f] text-xs font-semibold text-[#d3e4fe] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Scale className="w-4 h-4 text-[#38bdf8]" />
                    <span>{isFr ? 'Mentions légales' : 'Legal notice'}</span>
                  </button>
                )}
              </div>

              {onOpenLanding && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    onOpenLanding();
                  }}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#031427] border border-[#1b2b3f] text-xs font-semibold text-[#89ceff] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>{isFr ? 'Revenir à la page de présentation' : 'Back to landing page'}</span>
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleSelectTab('access_control')}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#102034] border border-[#4edea3]/40 text-xs font-bold text-[#4edea3] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isFr ? 'Administration & Contrôle d\'Accès' : 'Admin & Access Control'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
