import React, { useState } from 'react';
import { 
  Search, 
  Flame, 
  Bell, 
  ShieldCheck, 
  Check, 
  Globe, 
  SlidersHorizontal, 
  ExternalLink, 
  BookOpen, 
  Sun, 
  Moon,
  Menu,
  Settings,
  RefreshCw,
  LogIn,
  LogOut,
  Cloud
} from 'lucide-react';
import { CertificationTrackId, SystemVersionInfo } from '../types';
import { certificationTracks } from '../data/mockData';
import type { User } from '../services/firebaseSyncService';

interface HeaderProps {
  selectedCert: CertificationTrackId;
  onCertChange: (cert: CertificationTrackId) => void;
  lang: 'fr' | 'en';
  onLangToggle: () => void;
  onSearchQuery?: (q: string) => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  onOpenHamburger: () => void;
  onOpenSystemSettings: () => void;
  systemInfo: SystemVersionInfo;
  currentUser?: User | null;
  isAuthReady?: boolean;
  cloudSyncedCount?: number;
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
  onOpenHamburger,
  onOpenSystemSettings,
  systemInfo,
  currentUser,
  isAuthReady = true,
  cloudSyncedCount = 0,
  onGoogleSignIn,
  onSignOut,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const isFr = lang === 'fr';

  const certOptions: { id: CertificationTrackId; label: string }[] = [
    { id: 'oracle-1z0-071', label: 'Oracle Database SQL 1Z0-071' },
    { id: 'azure-dp-900', label: 'Azure Data Fundamentals DP-900' },
    { id: 'azure-dp-800', label: 'Azure Data Engineer DP-800' },
    { id: 'postgres-edb', label: 'PostgreSQL EDB Certified Associate' },
    { id: 'mysql-80-dba', label: 'MySQL 8.0 Database Administrator' },
  ];

  const notifications = [
    { id: 1, titleFr: 'Nouveau sprint de révision', titleEn: 'New revision sprint', timeFr: 'Il y a 10 min', timeEn: '10m ago', unread: true },
    { id: 2, titleFr: 'Score d\'évaluation validé (91%)', titleEn: 'Exam score verified (91%)', timeFr: 'Hier', timeEn: 'Yesterday', unread: false },
    { id: 3, titleFr: 'Mise à jour syllabus 1Z0-071', titleEn: '1Z0-071 syllabus updated', timeFr: 'Il y a 2 jours', timeEn: '2d ago', unread: false },
  ];

  const currentTrack = certificationTracks.find((t) => t.id === selectedCert);
  const currentSyllabusUrl = currentTrack?.syllabusUrl || 'https://education.oracle.com/oracle-database-sql/pexam_1Z0-071';

  return (
    <header 
      id="main-app-header" 
      className="fixed top-0 left-64 right-0 h-16 bg-[#031427]/95 backdrop-blur-xl z-40 px-4 flex items-center justify-between gap-3 border-b border-[#1b2b3f] shadow-[0_1px_8px_rgba(0,0,0,0.2)]"
    >
      {/* Left: Hamburger Button, Cert dropdown & Search */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {/* Hamburger Menu Button */}
        <button
          id="header-hamburger-btn"
          onClick={onOpenHamburger}
          title={isFr ? 'Ouvrir le menu des fonctionnalités' : 'Open features menu'}
          aria-label={isFr ? 'Menu des fonctionnalités' : 'Features Menu'}
          className="flex items-center gap-1.5 p-2 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] hover:border-[#3198dc]/50 text-[#89ceff] hover:text-[#d3e4fe] transition-all shadow-sm active:scale-95 shrink-0 group"
        >
          <Menu className="w-5 h-5 text-[#89ceff] group-hover:text-white transition-colors" />
          <span className="hidden 2xl:inline text-xs font-mono font-semibold text-[#d3e4fe]">
            {isFr ? 'Menu' : 'Menu'}
          </span>
        </button>

        {/* Certification Selector */}
        <div className="relative flex items-center bg-[#1b2b3f] border border-[#26364a] rounded-lg px-2 py-1.5 shadow-sm shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#89ceff] mr-1.5 shrink-0" />
          <select
            id="cert-dropdown-select"
            value={selectedCert}
            onChange={(e) => onCertChange(e.target.value as CertificationTrackId)}
            className="bg-transparent text-[#d3e4fe] font-mono text-xs outline-none cursor-pointer pr-2 font-semibold appearance-none max-w-[135px] lg:max-w-[190px] 2xl:max-w-none truncate"
          >
            {certOptions.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#102034] text-[#d3e4fe]">
                {opt.label}
              </option>
            ))}
          </select>
          <SlidersHorizontal className="w-3 h-3 text-[#89929b] pointer-events-none" />
        </div>

        {/* Official Syllabus External Link */}
        <a
          href={currentSyllabusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#89ceff] hover:text-[#d3e4fe] border border-[#1b2b3f] hover:border-[#26364a] text-xs font-semibold transition-all shadow-sm group shrink-0"
          title={isFr ? `Consulter le programme officiel ${currentTrack?.name || ''} (${currentTrack?.provider || ''})` : `Open official curriculum for ${currentTrack?.name || ''}`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#93ccff]" />
          <span className="font-mono text-[11px]">{isFr ? 'Programme officiel' : 'Official Syllabus'}</span>
          <ExternalLink className="w-3 h-3 text-[#89929b] group-hover:text-[#93ccff]" />
        </a>

        {/* Global Search Input */}
        <div className="relative flex-1 min-w-[110px] max-w-xs 2xl:max-w-md hidden xl:block">
          <Search className="w-4 h-4 text-[#89929b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onSearchQuery?.(e.target.value);
            }}
            placeholder={isFr ? "Rechercher clauses SQL, pièges..." : "Search SQL clauses, traps..."}
            className="w-full h-9 pl-9 pr-7 bg-[#0b1c30] border border-[#1b2b3f] text-[#d3e4fe] placeholder-[#89929b] text-xs rounded-lg outline-none focus:border-[#3198dc] focus:bg-[#102034] transition-all"
          />
          {searchValue && (
            <button 
              onClick={() => { setSearchValue(''); onSearchQuery?.(''); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#89929b] hover:text-[#d3e4fe]"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right: Firebase Google Sign-In (First & Always Visible!), System Settings, Lang Switch, Theme, Notifications */}
      <div className="flex items-center gap-2 shrink-0">
        {/* BOUTON PRINCIPAL : CONNEXION GOOGLE / STATUT FIRESTORE */}
        <div className="flex items-center pr-2 border-r border-[#1b2b3f] shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#102034] px-2.5 py-1 rounded-xl border border-[#4edea3]/50 shadow-sm">
              <div className="relative shrink-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full ring-1 ring-[#4edea3] object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#0284c7] flex items-center justify-center font-bold text-xs text-white">
                    {(currentUser.displayName || currentUser.email || 'DB').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#4edea3] ring-1 ring-[#031427]"></span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#d3e4fe] leading-tight truncate max-w-[120px]">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'DBA'}
                </span>
                <span className="font-mono text-[9px] text-[#4edea3] leading-tight flex items-center gap-1">
                  <Cloud className="w-2.5 h-2.5" />
                  Firestore ({cloudSyncedCount})
                </span>
              </div>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title={isFr ? 'Se déconnecter de Firebase' : 'Sign out from Firebase'}
                  className="p-1.5 rounded-lg bg-[#0b1c30] hover:bg-[#1b2b3f] text-[#ffb4ab] border border-[#1b2b3f] transition-colors ml-1 cursor-pointer"
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
              className="px-3.5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center gap-2 border border-[#38bdf8]/50 shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
                </svg>
              </span>
              <span className="text-white font-bold tracking-tight whitespace-nowrap">
                {isFr ? 'Connexion Google' : 'Google Sign-In'}
              </span>
            </button>
          )}
        </div>

        {/* System Settings & Update Trigger */}
        <button
          id="header-system-settings-btn"
          onClick={onOpenSystemSettings}
          title={isFr ? `Paramètres système & Mises à jour (${systemInfo.currentVersion})` : `System Settings & Updates (${systemInfo.currentVersion})`}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] hover:border-[#3198dc]/40 rounded-lg text-xs font-mono font-medium text-[#bfc7d2] hover:text-[#d3e4fe] transition-all shadow-sm active:scale-95 group shrink-0"
        >
          <Settings className={`w-3.5 h-3.5 text-[#89ceff] group-hover:rotate-45 transition-transform duration-300 ${systemInfo.isUpdating ? 'animate-spin' : ''}`} />
          <span className="text-[11px] font-semibold text-[#89ceff] hidden sm:inline">{systemInfo.currentVersion}</span>
          {systemInfo.autoUpdateEnabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" title={isFr ? 'Mises à jour auto actives' : 'Auto updates enabled'}></span>
          )}
        </button>

        {/* Language Toggle FR / EN */}
        <button
          id="lang-toggle-btn"
          onClick={onLangToggle}
          title={isFr ? 'Basculer en anglais' : 'Switch to French'}
          className="flex items-center gap-1 px-2 py-1 bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] rounded-lg text-xs font-mono font-medium text-[#bfc7d2] hover:text-[#d3e4fe] transition-colors shrink-0"
        >
          <Globe className="w-3.5 h-3.5 text-[#93ccff]" />
          <span>{lang.toUpperCase()}</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          id="theme-toggle-btn"
          onClick={onThemeToggle}
          title={
            theme === 'light'
              ? (isFr ? 'Basculer vers le thème sombre' : 'Switch to dark theme')
              : (isFr ? 'Basculer vers le thème clair' : 'Switch to light theme')
          }
          className="flex items-center gap-1.5 px-2 py-1 bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] rounded-lg text-xs font-mono font-medium text-[#bfc7d2] hover:text-[#d3e4fe] transition-colors shrink-0"
        >
          {theme === 'light' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="hidden xl:inline text-[11px] font-medium">{isFr ? 'Clair' : 'Light'}</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#89ceff]" />
              <span className="hidden xl:inline text-[11px] font-medium">{isFr ? 'Sombre' : 'Dark'}</span>
            </>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative shrink-0">
          <button
            id="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[#bfc7d2] hover:bg-[#102034] hover:text-[#d3e4fe] transition-colors border border-transparent hover:border-[#1b2b3f]"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ffb4ab]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-[#102034] border border-[#26364a] rounded-xl shadow-2xl p-3 z-50 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b2b3f]">
                <span className="font-semibold text-xs text-[#d3e4fe]">
                  {isFr ? 'Notifications' : 'Notifications'}
                </span>
                <span className="text-[10px] font-mono text-[#4edea3] bg-[#00a572]/20 px-1.5 py-0.5 rounded">
                  {isFr ? '1 nouvelle' : '1 new'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-2 rounded-lg text-xs flex flex-col gap-0.5 ${
                      n.unread ? 'bg-[#1b2b3f]/70 border border-[#3198dc]/30' : 'bg-[#0b1c30]'
                    }`}
                  >
                    <span className="text-[#d3e4fe] font-medium">{isFr ? n.titleFr : n.titleEn}</span>
                    <span className="text-[10px] text-[#89929b] font-mono">{isFr ? n.timeFr : n.timeEn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

