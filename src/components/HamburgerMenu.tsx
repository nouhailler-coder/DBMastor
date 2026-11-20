import React, { useEffect } from 'react';
import {
  X,
  Home,
  CreditCard,
  Terminal,
  Compass,
  LayoutDashboard,
  TrendingUp,
  Settings,
  ShieldCheck,
  Database,
  CheckCircle2,
  Globe,
  Sun,
  Moon,
  ChevronRight,
  BookMarked,
  Brain,
  RotateCcw,
  Scale,
  Bell,
} from 'lucide-react';
import { NavigationTab, CertificationTrackId, SystemVersionInfo } from '../types';
import {
  getHamburgerSections,
  HamburgerIconKey,
  HamburgerMenuItem,
} from '../navigation/hamburgerItems';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onOpenLanding?: () => void;
  selectedCert: CertificationTrackId;
  onCertChange: (cert: CertificationTrackId) => void;
  isAdmin?: boolean;
  onOpenSystemSettings: () => void;
  onOpenLegalMentions?: () => void;
  systemInfo: SystemVersionInfo;
  lang: 'fr' | 'en';
  onLangToggle: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const ICON_COMPONENTS: Record<HamburgerIconKey, React.ElementType> = {
  home: Home,
  'layout-dashboard': LayoutDashboard,
  compass: Compass,
  brain: Brain,
  'shield-check': ShieldCheck,
  'trending-up': TrendingUp,
  terminal: Terminal,
  'book-marked': BookMarked,
  'credit-card': CreditCard,
  'rotate-ccw': RotateCcw,
  bell: Bell,
};

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  onOpenLanding,
  selectedCert,
  onCertChange,
  isAdmin = false,
  onOpenSystemSettings,
  onOpenLegalMentions,
  systemInfo,
  lang,
  onLangToggle,
  theme,
  onThemeToggle,
}) => {
  const isFr = lang === 'fr';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const handleSelectItem = (item: HamburgerMenuItem) => {
    if (item.action === 'landing') {
      onClose();
      if (onOpenLanding) {
        onOpenLanding();
      } else {
        window.dispatchEvent(new CustomEvent('dbmastery:open_landing'));
      }
      return;
    }

    if (item.tab) {
      onTabChange(item.tab);
      if (item.dispatchEvent) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent(item.dispatchEvent!));
        }, 50);
      }
    }
    onClose();
  };

  const sections = getHamburgerSections(isAdmin);

  const certOptions: { id: CertificationTrackId; label: string }[] = [
    { id: 'oracle-1z0-071', label: 'Oracle Database SQL (1Z0-071)' },
    { id: 'azure-dp-900', label: 'Azure Data Fundamentals (DP-900)' },
    { id: 'azure-dp-800', label: 'Azure Database Admin (DP-800)' },
    { id: 'postgres-edb', label: 'PostgreSQL EDB Certified Associate' },
    { id: 'mysql-80-dba', label: 'MySQL 8.0 Database Administrator' },
  ];

  return (
    <div
      id="hamburger-menu-overlay"
      className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-md transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        id="hamburger-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={isFr ? 'Menu de navigation complet' : 'Full navigation menu'}
        className="w-full max-w-md md:max-w-lg h-full bg-[#031427] border-r border-[#1b2b3f] shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-[#1b2b3f] bg-[#000f21]/95 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006398] to-[#3198dc] flex items-center justify-center text-white">
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
                {isFr ? 'Navigation & outils DBMastor' : 'DBMastor Navigation & Tools'}
              </p>
            </div>
          </div>

          <button
            id="hamburger-close-btn"
            type="button"
            onClick={onClose}
            aria-label={isFr ? 'Fermer le menu' : 'Close menu'}
            className="p-2 rounded-lg bg-[#102034] text-[#89929b] hover:text-[#d3e4fe] hover:bg-[#1b2b3f] border border-[#1b2b3f] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          <div className="space-y-5">
            {sections.map((section) => (
              <div key={section.id} id={`hamburger-section-${section.id}`} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: section.accentColor }}
                  />
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#9fb0c4]">
                    {isFr ? section.titleFr : section.titleEn}
                  </h3>
                </div>

                <div className="space-y-1.5">
                  {section.items.map((item) => {
                    const Icon = ICON_COMPONENTS[item.icon];
                    const isActive =
                      item.action === 'tab' &&
                      item.tab === currentTab &&
                      !item.dispatchEvent;
                    return (
                      <button
                        key={item.id}
                        id={item.id}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left border group cursor-pointer ${
                          isActive
                            ? 'bg-[#102034] border-[#3198dc]/40 shadow-sm'
                            : item.action === 'landing'
                            ? 'bg-[#0b1c30] border-[#38bdf8]/30 hover:bg-[#102034] hover:border-[#38bdf8]/60'
                            : 'bg-[#0b1c30]/70 border-[#1b2b3f]/80 hover:bg-[#102034] hover:border-[#26364a]'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isActive ? 'bg-[#3198dc] text-[#002c47]' : 'bg-[#1b2b3f] text-[#89ceff]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-xs font-semibold block truncate ${
                              isActive ? 'text-[#89ceff]' : 'text-[#d3e4fe] group-hover:text-white'
                            }`}
                          >
                            {isFr ? item.labelFr : item.labelEn}
                          </span>
                          <p className="text-[11px] text-[#9fb0c4] line-clamp-1 mt-0.5">
                            {isFr ? item.descFr : item.descEn}
                          </p>
                        </div>

                        <ChevronRight className="w-4 h-4 shrink-0 mt-2 text-[#89929b]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0b1c30] rounded-xl border border-[#1b2b3f] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#89929b] font-mono">
              <span className="flex items-center gap-1.5 font-semibold text-[#89ceff]">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isFr ? 'Filière de certification active' : 'Active certification track'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {certOptions.map((c) => {
                const isSelected = selectedCert === c.id;
                return (
                  <button
                    key={c.id}
                    id={`quick-cert-btn-${c.id}`}
                    type="button"
                    onClick={() => onCertChange(c.id)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-all font-medium border cursor-pointer ${
                      isSelected
                        ? 'bg-[#3198dc]/20 text-[#89ceff] border-[#3198dc]/40 font-semibold'
                        : 'bg-[#102034]/60 text-[#bfc7d2] border-transparent hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
                    }`}
                  >
                    <span className="truncate text-[11px]">{c.label}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-[#4edea3] ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-[#0b1c30] rounded-2xl border border-[#1b2b3f] space-y-2.5">
            <button
              id="hamburger-open-system-settings-btn"
              type="button"
              onClick={() => {
                onClose();
                onOpenSystemSettings();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#3198dc] hover:bg-[#2084c7] text-[#002c47] font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isFr ? 'Paramètres système' : 'System Settings'}</span>
            </button>

            <button
              id="hamburger-open-legal-btn"
              type="button"
              onClick={() => {
                onClose();
                if (onOpenLegalMentions) {
                  onOpenLegalMentions();
                } else {
                  window.dispatchEvent(new CustomEvent('dbmastery:open_legal_mentions'));
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#89ceff] hover:text-[#d3e4fe] border border-[#1b2b3f] text-xs font-mono transition-all cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{isFr ? 'Mentions légales' : 'Legal Notices'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-[#1b2b3f] bg-[#000f21]/90 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              id="hamburger-lang-toggle"
              type="button"
              onClick={onLangToggle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] font-mono text-[11px] font-medium cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#89ceff]" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <button
              id="hamburger-theme-toggle"
              type="button"
              onClick={onThemeToggle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] font-mono text-[11px] font-medium cursor-pointer"
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

          <span className="text-[10px] font-mono text-[#9fb0c4]">
            {systemInfo.currentVersion}
          </span>
        </div>
      </div>
    </div>
  );
};
