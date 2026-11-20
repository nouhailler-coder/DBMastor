import React, { useState } from 'react';
import {
  Search,
  Bell,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  Sun,
  Moon,
  Menu,
  Settings,
  LogOut,
  Cloud,
  HelpCircle,
} from 'lucide-react';
import { CertificationTrackId, SystemVersionInfo } from '../types';
import type { User } from '../services/firebaseSyncService';
import { AppLogo } from './AppLogo';

interface HeaderProps {
  selectedCert: CertificationTrackId;
  onCertChange: (cert: CertificationTrackId) => void;
  lang: 'fr' | 'en';
  onLangToggle: () => void;
  onSearchQuery?: (q: string) => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  isSidebarCollapsed?: boolean;
  isAdmin?: boolean;
  onOpenHamburger: () => void;
  onOpenSystemSettings: () => void;
  onOpenOnboarding?: () => void;
  onOpenContextualHelp?: () => void;
  onOpenLegalMentions?: () => void;
  systemInfo: SystemVersionInfo;
  currentUser?: User | null;
  isAuthReady?: boolean;
  cloudSyncedCount?: number;
  accessStatus?: 'pending' | 'approved' | 'revoked' | null;
  onOpenAccessControl?: () => void;
  onOpenLanding?: () => void;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCert,
  onCertChange,
  lang,
  onLangToggle,
  onSearchQuery,
  theme = 'light',
  onThemeToggle,
  isSidebarCollapsed = false,
  isAdmin = false,
  onOpenHamburger,
  onOpenSystemSettings,
  onOpenContextualHelp,
  systemInfo,
  currentUser,
  cloudSyncedCount = 0,
  accessStatus,
  onOpenAccessControl,
  onGoogleSignIn,
  onSignOut,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const isFr = lang === 'fr';

  const certOptions: { id: CertificationTrackId; label: string }[] = [
    { id: 'oracle-1z0-071', label: 'Oracle SQL 1Z0-071' },
    { id: 'azure-dp-900', label: 'Azure Data DP-900' },
    { id: 'azure-dp-800', label: 'Azure Data DP-800' },
    { id: 'postgres-edb', label: 'PostgreSQL EDB' },
    { id: 'mysql-80-dba', label: 'MySQL 8.0 DBA' },
  ];

  return (
    <header
      id="main-app-header"
      className={`fixed top-0 left-0 ${
        isSidebarCollapsed ? 'md:left-20' : 'md:left-64'
      } right-0 h-16 bg-[#031427]/95 backdrop-blur-xl z-40 px-3 sm:px-4 flex items-center justify-between gap-2 border-b border-[#1b2b3f] shadow-[0_1px_8px_rgba(0,0,0,0.2)] transition-all duration-200`}
    >
      {/* Left: Mobile Logo / Hamburger + Certification Selector + Search */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="md:hidden shrink-0">
          <AppLogo size="sm" showText={false} />
        </div>

        <button
          id="header-hamburger-btn"
          type="button"
          onClick={onOpenHamburger}
          title={isFr ? 'Menu complet des outils' : 'All tools menu'}
          aria-label={isFr ? 'Menu des fonctionnalités' : 'Features Menu'}
          className="hidden sm:flex items-center justify-center p-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] text-[#89ceff] hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Certification Selector */}
        <div className="relative flex items-center bg-[#1b2b3f] border border-[#26364a] rounded-lg px-2 py-1.5 shadow-sm min-w-0 max-w-[165px] sm:max-w-[210px] md:max-w-[230px]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#89ceff] mr-1.5 shrink-0" />
          <label htmlFor="cert-dropdown-select" className="sr-only">
            {isFr ? 'Filière de certification' : 'Certification track'}
          </label>
          <select
            id="cert-dropdown-select"
            value={selectedCert}
            onChange={(e) => onCertChange(e.target.value as CertificationTrackId)}
            className="bg-transparent text-[#d3e4fe] font-mono text-xs outline-none cursor-pointer pr-1.5 font-semibold appearance-none w-full truncate"
          >
            {certOptions.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#102034] text-[#d3e4fe]">
                {opt.label}
              </option>
            ))}
          </select>
          <SlidersHorizontal className="w-3 h-3 text-[#89929b] pointer-events-none shrink-0" />
        </div>

        {/* Global Search Input (lg+) */}
        <div className="relative flex-1 min-w-[140px] max-w-xs hidden lg:block">
          <Search className="w-4 h-4 text-[#89929b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onSearchQuery?.(e.target.value);
            }}
            placeholder={isFr ? 'Rechercher clauses SQL...' : 'Search SQL clauses...'}
            aria-label={isFr ? 'Rechercher dans le glossaire et les fiches' : 'Search glossary and sheets'}
            className="w-full h-9 pl-9 pr-7 bg-[#0b1c30] border border-[#1b2b3f] text-[#d3e4fe] placeholder-[#89929b] text-xs rounded-lg outline-none focus:border-[#3198dc] focus:bg-[#102034] transition-all"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue('');
                onSearchQuery?.('');
              }}
              aria-label={isFr ? 'Effacer la recherche' : 'Clear search'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#89929b] hover:text-[#d3e4fe] cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right: Auth status + Compact controls (zero overlap at all widths) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* User Auth Chip */}
        {currentUser ? (
          <div className="flex items-center gap-1.5 bg-[#102034] px-2 py-1 rounded-xl border border-[#4edea3]/40">
            <div className="w-6 h-6 rounded-full bg-[#0284c7] flex items-center justify-center font-bold text-[10px] text-white shrink-0">
              {(currentUser.displayName || currentUser.email || 'DB').slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-bold text-[#d3e4fe] leading-tight truncate max-w-[100px]">
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'DBA'}
              </span>
              <span className="font-mono text-[9px] text-[#4edea3] leading-tight flex items-center gap-1">
                <Cloud className="w-2.5 h-2.5" />
                {cloudSyncedCount > 0 ? `${cloudSyncedCount} sync` : isFr ? 'Actif' : 'Synced'}
              </span>
            </div>
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                title={isFr ? 'Se déconnecter' : 'Sign out'}
                aria-label={isFr ? 'Se déconnecter' : 'Sign out'}
                className="p-1 rounded-lg bg-[#0b1c30] hover:bg-[#1b2b3f] text-[#ffb4ab] border border-[#1b2b3f] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            id="header-google-signin-btn"
            type="button"
            onClick={onGoogleSignIn}
            aria-label={isFr ? 'Connexion Google' : 'Google Sign-In'}
            className="px-2.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center gap-1.5 border border-[#38bdf8]/40 shadow-sm transition-colors shrink-0 cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
              <svg className="w-3 h-3" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
              </svg>
            </span>
            <span className="hidden sm:inline">{isFr ? 'Connexion' : 'Sign In'}</span>
          </button>
        )}

        {/* Admin RBAC shortcut (shown only for admins or if access status requires attention) */}
        {onOpenAccessControl && (isAdmin || accessStatus === 'pending' || accessStatus === 'revoked') && (
          <button
            id="header-access-control-btn"
            type="button"
            onClick={onOpenAccessControl}
            aria-label={isFr ? 'Contrôle d\'accès' : 'Access Control'}
            title={isFr ? 'Contrôle d\'accès' : 'Access Control'}
            className={`hidden sm:flex items-center gap-1 p-2 rounded-lg text-xs font-mono font-bold border shrink-0 cursor-pointer ${
              accessStatus === 'revoked'
                ? 'bg-[#ef4444]/20 border-[#ef4444] text-[#ffb4ab]'
                : accessStatus === 'pending'
                ? 'bg-[#f59e0b]/20 border-[#fbbf24] text-[#fbbf24]'
                : 'bg-[#102034] hover:bg-[#1b2b3f] border-[#4edea3]/40 text-[#4edea3]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}

        {/* Contextual Help */}
        {onOpenContextualHelp && (
          <button
            id="header-contextual-help-btn"
            type="button"
            onClick={onOpenContextualHelp}
            aria-label={isFr ? 'Aide contextuelle' : 'Contextual help'}
            title={isFr ? 'Aide contextuelle' : 'Contextual help'}
            className="hidden sm:flex p-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] text-[#93ccff] hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        {/* Language Toggle FR / EN */}
        <button
          id="lang-toggle-btn"
          type="button"
          onClick={onLangToggle}
          title={isFr ? 'Basculer en anglais' : 'Switch to French'}
          aria-label={isFr ? 'Changer de langue (FR)' : 'Change language (EN)'}
          className="flex items-center gap-1 px-2 py-1.5 bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] rounded-lg text-xs font-mono font-semibold text-[#d3e4fe] transition-colors shrink-0 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-[#93ccff]" />
          <span>{lang.toUpperCase()}</span>
        </button>

        {/* Theme Toggle */}
        {onThemeToggle && (
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onThemeToggle}
            title={
              theme === 'light'
                ? isFr
                  ? 'Activer le thème sombre'
                  : 'Switch to dark theme'
                : isFr
                ? 'Activer le thème clair'
                : 'Switch to light theme'
            }
            aria-label={theme === 'light' ? (isFr ? 'Thème sombre' : 'Dark theme') : isFr ? 'Thème clair' : 'Light theme'}
            className="p-2 bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] rounded-lg text-[#d3e4fe] transition-colors shrink-0 cursor-pointer"
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-[#f59e0b]" />
            ) : (
              <Moon className="w-4 h-4 text-[#89ceff]" />
            )}
          </button>
        )}

        {/* System Settings */}
        <button
          id="header-system-settings-btn"
          type="button"
          onClick={onOpenSystemSettings}
          aria-label={isFr ? 'Paramètres système' : 'System settings'}
          title={isFr ? `Paramètres (${systemInfo.currentVersion})` : `Settings (${systemInfo.currentVersion})`}
          className="hidden sm:flex items-center gap-1.5 p-2 bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] rounded-lg text-xs font-mono text-[#bfc7d2] hover:text-[#d3e4fe] transition-colors shrink-0 cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#89ceff]" />
        </button>

        {/* Notifications Bell (real/clean empty state without fabricated 91% score) */}
        <div className="relative shrink-0">
          <button
            id="notifications-btn"
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="p-2 rounded-lg text-[#bfc7d2] hover:bg-[#102034] hover:text-[#d3e4fe] transition-colors border border-transparent hover:border-[#1b2b3f] cursor-pointer"
            aria-label={isFr ? 'Notifications' : 'Notifications'}
          >
            <Bell className="w-4 h-4" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-[#102034] border border-[#26364a] rounded-xl shadow-2xl p-3 z-50 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b2b3f]">
                <span className="font-semibold text-xs text-[#d3e4fe]">
                  {isFr ? 'Notifications' : 'Notifications'}
                </span>
                <span className="text-[10px] font-mono text-[#9fb0c4]">
                  {systemInfo.currentVersion}
                </span>
              </div>
              <p className="text-xs text-[#9fb0c4] py-2">
                {isFr
                  ? 'Aucune alerte en attente. Vos révisions planifiées apparaissent dans votre tableau de bord.'
                  : 'No pending alerts. Scheduled reviews appear directly on your dashboard.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
