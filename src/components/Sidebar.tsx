import React from 'react';
import {
  Home,
  Compass,
  Terminal,
  Award,
  TrendingUp,
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
  LogOut,
  Cloud,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
} from 'lucide-react';
import { NavigationTab } from '../types';
import { PRIMARY_SPACES, PrimarySpaceId, getSpaceForTab } from '../navigation/spaces';
import type { User } from '../services/firebaseSyncService';
import { AppLogo } from './AppLogo';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  lang: 'fr' | 'en';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isAdmin?: boolean;
  onOpenHamburger?: () => void;
  onOpenSystemSettings?: () => void;
  onOpenOnboarding?: () => void;
  onOpenContextualHelp?: () => void;
  onOpenLegalMentions?: () => void;
  systemVersion?: string;
  currentUser?: User | null;
  cloudSyncedCount?: number;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
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

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  lang,
  isCollapsed = false,
  onToggleCollapse,
  isAdmin = false,
  onOpenHamburger,
  onOpenSystemSettings,
  onOpenOnboarding,
  onOpenContextualHelp,
  onOpenLegalMentions,
  systemVersion = 'v2.4.2',
  currentUser,
  cloudSyncedCount = 0,
  onGoogleSignIn,
  onSignOut,
}) => {
  const isFr = lang === 'fr';
  const activeSpaceId = getSpaceForTab(currentTab);

  return (
    <aside
      id="main-sidebar"
      aria-label={isFr ? 'Navigation latérale principale' : 'Primary sidebar navigation'}
      className={`hidden md:flex fixed left-0 top-0 h-full ${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-[#0b1c30] z-50 flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-r border-[#1b2b3f] transition-all duration-200`}
    >
      <div className="flex flex-col min-h-0 flex-1 overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 px-3.5 flex items-center justify-between bg-[#000f21] border-b border-[#102034] shrink-0">
          {!isCollapsed ? (
            <AppLogo size="md" subtitle="Studio Engine" />
          ) : (
            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              aria-label="DBMastery Studio"
              className="mx-auto flex items-center justify-center cursor-pointer"
            >
              <AppLogo size="sm" showText={false} />
            </button>
          )}

          <div className="flex items-center gap-1">
            {!isCollapsed && onOpenHamburger && (
              <button
                id="sidebar-hamburger-btn"
                type="button"
                onClick={onOpenHamburger}
                title={isFr ? 'Menu complet' : 'Full menu'}
                aria-label={isFr ? 'Menu complet' : 'Full menu'}
                className="p-1.5 rounded-lg bg-[#102034] text-[#89ceff] hover:bg-[#1b2b3f] hover:text-white border border-[#1b2b3f] transition-all cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            {onToggleCollapse && !isCollapsed && (
              <button
                id="sidebar-collapse-btn"
                type="button"
                onClick={onToggleCollapse}
                aria-expanded={!isCollapsed}
                aria-label={isFr ? 'Réduire le menu latéral' : 'Collapse sidebar'}
                title={isFr ? 'Réduire le menu' : 'Collapse sidebar'}
                className="p-1.5 rounded-lg bg-[#102034] text-[#9fb0c4] hover:bg-[#1b2b3f] hover:text-white border border-[#1b2b3f] transition-all cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {onToggleCollapse && isCollapsed && (
          <div className="px-3 pt-2.5 flex justify-center">
            <button
              id="sidebar-expand-btn"
              type="button"
              onClick={onToggleCollapse}
              aria-expanded={!isCollapsed}
              aria-label={isFr ? 'Déplier le menu latéral' : 'Expand sidebar'}
              title={isFr ? 'Déplier le menu' : 'Expand sidebar'}
              className="w-full py-1.5 rounded-lg bg-[#102034] text-[#89ceff] hover:bg-[#1b2b3f] hover:text-white border border-[#1b2b3f] flex items-center justify-center transition-all cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Auth Card */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          {currentUser ? (
            <div
              className={`p-2 rounded-xl bg-[#102034] border border-[#4edea3]/30 flex items-center ${
                isCollapsed ? 'justify-center' : 'justify-between gap-2'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {(currentUser.displayName || currentUser.email || 'DB').slice(0, 2).toUpperCase()}
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#d3e4fe] truncate">
                      {currentUser.displayName || currentUser.email?.split('@')[0] || (isFr ? 'Apprenant' : 'Learner')}
                    </span>
                    <span className="font-mono text-[10px] text-[#4edea3] flex items-center gap-1">
                      <Cloud className="w-3 h-3 shrink-0" />
                      {cloudSyncedCount > 0 ? `${cloudSyncedCount} sync` : isFr ? 'Connecté' : 'Connected'}
                    </span>
                  </div>
                )}
              </div>
              {!isCollapsed && onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title={isFr ? 'Se déconnecter' : 'Sign out'}
                  aria-label={isFr ? 'Se déconnecter' : 'Sign out'}
                  className="p-1.5 rounded-lg bg-[#0b1c30] hover:bg-[#1b2b3f] text-[#ffb4ab] border border-[#1b2b3f] shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              id="sidebar-google-signin-btn"
              type="button"
              onClick={onGoogleSignIn}
              title={isFr ? 'Connexion Google' : 'Google Sign-In'}
              aria-label={isFr ? 'Connexion Google' : 'Google Sign-In'}
              className={`w-full py-2 px-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#38bdf8]/40 shadow-sm transition-all cursor-pointer`}
            >
              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
                <svg className="w-3 h-3" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
                </svg>
              </span>
              {!isCollapsed && (
                <span className="truncate">{isFr ? 'Connexion Google' : 'Google Sign-In'}</span>
              )}
            </button>
          )}
        </div>

        {/* 5 Primary Spaces Navigation */}
        {!isCollapsed && (
          <div className="px-4 pt-2 pb-1.5 text-[#89929b] font-mono text-[10px] uppercase tracking-wider font-semibold">
            {isFr ? 'Espaces d\'apprentissage' : 'Learning Spaces'}
          </div>
        )}

        <nav className="flex flex-col gap-1 px-2.5" aria-label={isFr ? 'Espaces principaux' : 'Primary spaces'}>
          {PRIMARY_SPACES.map((space) => {
            const SpaceIcon = SPACE_ICONS[space.id];
            const isSpaceActive = activeSpaceId === space.id;
            const hasSubTabs = space.tabs.length > 1;

            return (
              <div key={space.id} className="flex flex-col gap-0.5">
                <button
                  id={`nav-space-${space.id}`}
                  type="button"
                  onClick={() => onTabChange(space.defaultTab)}
                  title={isFr ? space.labelFr : space.labelEn}
                  aria-current={isSpaceActive && !hasSubTabs ? 'page' : undefined}
                  aria-expanded={hasSubTabs ? isSpaceActive : undefined}
                  className={`flex items-center ${
                    isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                  } py-2.5 rounded-lg transition-all text-left text-sm font-medium cursor-pointer ${
                    isSpaceActive
                      ? 'bg-[#3198dc] text-[#002c47] font-semibold shadow-sm'
                      : 'text-[#bfc7d2] hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <SpaceIcon
                      className={`w-4 h-4 shrink-0 ${isSpaceActive ? 'text-[#002c47]' : 'text-[#93ccff]'}`}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{isFr ? space.labelFr : space.labelEn}</span>
                    )}
                  </div>
                </button>

                {/* Active space sub-navigation (only shown for the active space when expanded) */}
                {!isCollapsed && isSpaceActive && hasSubTabs && (
                  <div className="ml-4 pl-2.5 border-l border-[#1b2b3f] flex flex-col gap-0.5 py-1">
                    {space.tabs.map((sub) => {
                      const SubIcon = TAB_ICONS[sub.tab];
                      const isSubActive = currentTab === sub.tab;
                      return (
                        <button
                          key={sub.tab}
                          id={`nav-btn-${sub.tab}`}
                          type="button"
                          onClick={() => onTabChange(sub.tab)}
                          aria-current={isSubActive ? 'page' : undefined}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left cursor-pointer ${
                            isSubActive
                              ? 'bg-[#102034] text-[#38bdf8] border border-[#38bdf8]/30 font-semibold'
                              : 'text-[#9fb0c4] hover:text-[#d3e4fe] hover:bg-[#102034]/60'
                          }`}
                        >
                          <SubIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{isFr ? sub.labelFr : sub.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Secondary Admin Entrypoint (visible cleanly for admins or access requests) */}
        {isAdmin && (
          <div className="px-2.5 pt-3 mt-2 border-t border-[#102034]">
            <button
              id="nav-btn-access_control"
              type="button"
              onClick={() => onTabChange('access_control')}
              title={isFr ? 'Administration RBAC' : 'Admin Access Control'}
              aria-current={currentTab === 'access_control' ? 'page' : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                currentTab === 'access_control'
                  ? 'bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/40 font-bold'
                  : 'text-[#9fb0c4] hover:bg-[#102034] hover:text-[#4edea3]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#4edea3]" />
                {!isCollapsed && <span className="truncate">{isFr ? 'Contrôle d\'accès' : 'Access Control'}</span>}
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Compact Utility Footer */}
      <div className="flex flex-col gap-1.5 p-2.5 border-t border-[#102034] bg-[#081526] shrink-0">
        {!isCollapsed && (onOpenOnboarding || onOpenContextualHelp) && (
          <div className="grid grid-cols-2 gap-1.5">
            {onOpenOnboarding && (
              <button
                id="sidebar-onboarding-btn"
                type="button"
                onClick={onOpenOnboarding}
                className="px-2 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] text-[11px] font-mono text-[#4edea3] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{isFr ? 'Parcours' : 'Goals'}</span>
              </button>
            )}
            {onOpenContextualHelp && (
              <button
                id="sidebar-contextual-help-btn"
                type="button"
                onClick={onOpenContextualHelp}
                className="px-2 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] text-[11px] font-mono text-[#93ccff] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{isFr ? 'Aide' : 'Help'}</span>
              </button>
            )}
          </div>
        )}

        {onOpenSystemSettings && (
          <button
            id="sidebar-system-settings-btn"
            type="button"
            onClick={onOpenSystemSettings}
            title={isFr ? 'Paramètres & Mises à jour' : 'Settings & Updates'}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-2' : 'justify-between px-2.5'
            } py-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#bfc7d2] hover:text-[#d3e4fe] border border-[#1b2b3f] text-xs font-mono transition-colors cursor-pointer`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Settings className="w-3.5 h-3.5 text-[#89ceff] shrink-0" />
              {!isCollapsed && <span className="truncate">{isFr ? 'Paramètres' : 'Settings'}</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-bold text-[#4edea3] bg-[#00a572]/15 px-1.5 py-0.5 rounded">
                {systemVersion}
              </span>
            )}
          </button>
        )}

        {!isCollapsed && (
          <button
            id="sidebar-legal-mentions-btn"
            type="button"
            onClick={() => {
              if (onOpenLegalMentions) {
                onOpenLegalMentions();
              } else {
                window.dispatchEvent(new CustomEvent('dbmastery:open_legal_mentions'));
              }
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#89929b] hover:text-[#38bdf8] hover:bg-[#102034] text-[11px] font-mono transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Scale className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{isFr ? 'Mentions légales' : 'Legal notices'}</span>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
};
