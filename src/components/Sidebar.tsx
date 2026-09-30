import React from 'react';
import { 
  LayoutDashboard, 
  FileCheck2, 
  Terminal, 
  BookOpen, 
  CreditCard,
  BarChart3, 
  Database,
  Radio,
  Menu,
  Settings,
  BookMarked,
  Brain,
  Network,
  ShieldCheck,
  Zap,
  Cloud,
  LogOut,
  Activity,
  Compass,
  HelpCircle
} from 'lucide-react';
import { NavigationTab } from '../types';
import type { User } from '../services/firebaseSyncService';
import { AppLogo } from './AppLogo';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  lang: 'fr' | 'en';
  onOpenHamburger?: () => void;
  onOpenSystemSettings?: () => void;
  onOpenOnboarding?: () => void;
  onOpenContextualHelp?: () => void;
  systemVersion?: string;
  currentUser?: User | null;
  cloudSyncedCount?: number;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onTabChange, 
  lang,
  onOpenHamburger,
  onOpenSystemSettings,
  onOpenOnboarding,
  onOpenContextualHelp,
  systemVersion = 'v2.4.2',
  currentUser,
  cloudSyncedCount = 0,
  onGoogleSignIn,
  onSignOut
}) => {
  const isFr = lang === 'fr';

  const navItems: { id: NavigationTab; labelFr: string; labelEn: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', labelFr: 'Tableau de bord', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'activity', labelFr: 'Mon activité', labelEn: 'My Activity', icon: Activity, badge: '+12% SQL' },
    { id: 'cert_exam', labelFr: 'Examen Blanc (60Q)', labelEn: 'Certification Exam (60Q)', icon: ShieldCheck, badge: '60Q • 90m' },
    { id: 'skills', labelFr: 'Skill Map (Compétences)', labelEn: 'Skill Map (Skills)', icon: Network },
    { id: 'exams', labelFr: 'Apprentissage & Quiz', labelEn: 'Adaptive Learning & Quiz', icon: Brain },
    { id: 'flashcards', labelFr: 'Flashcards (2400+)', labelEn: 'Flashcards (2400+)', icon: CreditCard },
    { id: 'glossary', labelFr: 'Glossaire SQL', labelEn: 'SQL Glossary', icon: BookMarked },
    { id: 'sandbox', labelFr: 'Lab SQL & Pratique', labelEn: 'SQL Lab & Practice', icon: Terminal },
    { id: 'syllabus', labelFr: 'Fiches & Compétences', labelEn: 'Study Sheets & Skills', icon: BookOpen },
    { id: 'analytics', labelFr: 'Statistiques & Badges', labelEn: 'Stats & Badges', icon: BarChart3 },
    { id: 'access_control', labelFr: 'Contrôle d\'Accès', labelEn: 'Access Control (RBAC)', icon: ShieldCheck, badge: 'Firestore' },
  ];

  return (
    <aside 
      id="main-sidebar" 
      className="fixed left-0 top-0 h-full w-64 bg-[#0b1c30] z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-r border-[#1b2b3f]"
    >
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between bg-[#000f21] border-b border-[#102034]">
          <AppLogo size="md" subtitle="Studio Engine" />

          {/* Hamburger Icon in Sidebar header */}
          {onOpenHamburger && (
            <button
              id="sidebar-hamburger-btn"
              onClick={onOpenHamburger}
              title={isFr ? 'Menu des fonctionnalités' : 'Features menu'}
              className="p-1.5 rounded-lg bg-[#102034] text-[#89ceff] hover:bg-[#1b2b3f] hover:text-white border border-[#1b2b3f] transition-all"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Google Auth / Firestore Sync Quick Action in Sidebar Top */}
        <div className="px-3 pt-3 pb-1">
          {currentUser ? (
            <div className="p-2.5 rounded-xl bg-[#102034] border border-[#4edea3]/40 flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {(currentUser.displayName || currentUser.email || 'DB').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#d3e4fe] truncate">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'Apprenant'}
                  </span>
                  <span className="font-mono text-[10px] text-[#4edea3] flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    Firestore ({cloudSyncedCount})
                  </span>
                </div>
              </div>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title={isFr ? 'Se déconnecter' : 'Sign out'}
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
              className="w-full py-2 px-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#38bdf8]/50 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
                </svg>
              </span>
              <span className="text-white font-bold">{isFr ? 'Connexion Google' : 'Google Sign-In'}</span>
            </button>
          )}
        </div>

        {/* Section Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="text-[#89929b] font-mono text-[10px] uppercase tracking-wider font-semibold">
            {isFr ? 'Navigation Principale' : 'Main Navigation'}
          </div>
          {onOpenHamburger && (
            <button
              id="sidebar-menu-categories-link"
              onClick={onOpenHamburger}
              className="text-[10px] font-mono text-[#89ceff] hover:underline flex items-center gap-1"
            >
              <span>{isFr ? 'Catégories' : 'Categories'}</span>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left text-sm font-medium ${
                  isActive
                    ? 'bg-[#3198dc] text-[#002c47] font-semibold shadow-sm'
                    : 'text-[#bfc7d2] hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#002c47]' : 'text-[#93ccff]'}`} />
                  <span className="truncate">{isFr ? item.labelFr : item.labelEn}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-[#002c47]/20 text-[#002c47]' : 'bg-[#0284c7]/20 text-[#38bdf8]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area with Cluster Status & System Settings */}
      <div className="flex flex-col gap-2 p-3">
        {/* Système de Sessions Courtes : ⚡ 5 min & 🎯 30 min */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            id="sidebar-quick-5m-btn"
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('dbmastery:start_short_session', { detail: 'quick_5min' }))
            }
            className="p-2 rounded-lg bg-[#061322] hover:bg-[#102034] border border-[#f59e0b]/40 hover:border-[#f59e0b] text-left transition-all flex flex-col gap-0.5 cursor-pointer"
          >
            <span className="font-mono text-[10px] text-[#fbbf24] font-bold">⚡ 5 min</span>
            <span className="text-[11px] font-bold text-white leading-tight">
              {isFr ? 'Quick (5Q)' : 'Quick (5Q)'}
            </span>
          </button>
          <button
            id="sidebar-training-30m-btn"
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('dbmastery:start_short_session', { detail: 'training_30min' }))
            }
            className="p-2 rounded-lg bg-[#061322] hover:bg-[#102034] border border-[#38bdf8]/40 hover:border-[#38bdf8] text-left transition-all flex flex-col gap-0.5 cursor-pointer"
          >
            <span className="font-mono text-[10px] text-[#38bdf8] font-bold">🎯 30 min</span>
            <span className="text-[11px] font-bold text-white leading-tight">
              {isFr ? 'Session (20Q)' : 'Session (20Q)'}
            </span>
          </button>
        </div>

        {/* Quick Launch Targeted AI Drill */}
        <button
          id="sidebar-targeted-session-btn"
          onClick={() => window.dispatchEvent(new CustomEvent('dbmastery:open_targeted_session'))}
          className="w-full p-2.5 rounded-lg bg-gradient-to-r from-[#0284c7]/25 via-[#0369a1]/30 to-[#0284c7]/25 border border-[#0284c7]/40 text-[#38bdf8] hover:border-[#38bdf8] transition-all flex items-center justify-between text-xs font-mono font-bold shadow-sm group"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#38bdf8] group-hover:scale-110 transition-transform" />
            <span className="text-white text-[11px]">{isFr ? 'Séance Ciblée IA (10Q)' : 'Targeted AI Drill (10Q)'}</span>
          </div>
          <span className="text-[10px] bg-[#0284c7] px-1.5 py-0.5 rounded text-white font-mono">
            Gemini
          </span>
        </button>

        {/* Guide Onboarding & Aide Contextuelle */}
        <div className="grid grid-cols-2 gap-1.5">
          {onOpenOnboarding && (
            <button
              id="sidebar-onboarding-btn"
              type="button"
              onClick={onOpenOnboarding}
              className="px-2.5 py-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] border border-[#4edea3]/30 hover:border-[#4edea3] text-xs font-mono font-bold text-[#4edea3] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isFr ? 'Onboarding' : 'Tour'}</span>
            </button>
          )}
          {onOpenContextualHelp && (
            <button
              id="sidebar-contextual-help-btn"
              type="button"
              onClick={onOpenContextualHelp}
              className="px-2.5 py-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] border border-[#38bdf8]/30 hover:border-[#38bdf8] text-xs font-mono font-bold text-[#93ccff] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isFr ? 'Aide (?)' : 'Help (?)'}</span>
            </button>
          )}
        </div>

        {/* System Settings & Version Link */}
        {onOpenSystemSettings && (
          <button
            id="sidebar-system-settings-btn"
            onClick={onOpenSystemSettings}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#bfc7d2] hover:text-[#d3e4fe] border border-[#1b2b3f] text-xs font-mono transition-all group"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-[#89ceff] group-hover:rotate-45 transition-transform" />
              <span>{isFr ? 'Paramètres & Mises à jour' : 'Settings & Updates'}</span>
            </div>
            <span className="text-[10px] font-bold text-[#4edea3] bg-[#00a572]/20 px-1.5 py-0.5 rounded border border-[#4edea3]/30">
              {systemVersion}
            </span>
          </button>
        )}

        {/* Cluster Sandbox Status Footer */}
        <div className="p-3 bg-[#000f21] rounded-lg border border-[#1b2b3f] flex flex-col gap-1.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#4edea3] uppercase font-semibold flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-[#4edea3] animate-pulse" />
              Cluster Sandbox
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
          </div>
          <p className="font-mono text-[11px] text-[#89929b] leading-tight">
            {isFr ? 'v16.2 Enterprise Engine connecté. Latence 12ms.' : 'v16.2 Enterprise Engine connected. 12ms latency.'}
          </p>
        </div>
      </div>
    </aside>
  );
};

