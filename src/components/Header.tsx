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
  Moon
} from 'lucide-react';
import { CertificationTrackId } from '../types';
import { certificationTracks } from '../data/mockData';

interface HeaderProps {
  selectedCert: CertificationTrackId;
  onCertChange: (cert: CertificationTrackId) => void;
  lang: 'fr' | 'en';
  onLangToggle: () => void;
  onSearchQuery?: (q: string) => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCert,
  onCertChange,
  lang,
  onLangToggle,
  onSearchQuery,
  theme = 'light',
  onThemeToggle,
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
      className="fixed top-0 left-64 right-0 h-16 bg-[#031427]/90 backdrop-blur-xl z-40 px-6 flex items-center justify-between border-b border-[#1b2b3f] shadow-[0_1px_8px_rgba(0,0,0,0.2)]"
    >
      {/* Left: Cert dropdown & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {/* Certification Selector */}
        <div className="relative flex items-center bg-[#1b2b3f] border border-[#26364a] rounded-lg px-3 py-1.5 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#89ceff] mr-2 shrink-0" />
          <select
            id="cert-dropdown-select"
            value={selectedCert}
            onChange={(e) => onCertChange(e.target.value as CertificationTrackId)}
            className="bg-transparent text-[#d3e4fe] font-mono text-xs outline-none cursor-pointer pr-3 font-semibold appearance-none"
          >
            {certOptions.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#102034] text-[#d3e4fe]">
                {opt.label}
              </option>
            ))}
          </select>
          <SlidersHorizontal className="w-3 h-3 text-[#89929b] pointer-events-none -ml-1" />
        </div>

        {/* Official Syllabus External Link */}
        <a
          href={currentSyllabusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#89ceff] hover:text-[#d3e4fe] border border-[#1b2b3f] hover:border-[#26364a] text-xs font-semibold transition-all shadow-sm group shrink-0"
          title={isFr ? `Consulter le programme officiel ${currentTrack?.name || ''} (${currentTrack?.provider || ''})` : `Open official curriculum for ${currentTrack?.name || ''}`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#93ccff]" />
          <span className="font-mono text-[11px]">{isFr ? 'Programme officiel' : 'Official Syllabus'}</span>
          <ExternalLink className="w-3 h-3 text-[#89929b] group-hover:text-[#93ccff]" />
        </a>

        {/* Global Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#89929b] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onSearchQuery?.(e.target.value);
            }}
            placeholder={isFr ? "Rechercher questions, clauses SQL, codes d'erreur..." : "Search questions, SQL clauses, error codes..."}
            className="w-full h-9 pl-9 pr-8 bg-[#0b1c30] border border-[#1b2b3f] text-[#d3e4fe] placeholder-[#89929b] text-xs rounded-lg outline-none focus:border-[#3198dc] focus:bg-[#102034] transition-all"
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

      {/* Right: Countdown, Lang Switch, Notifications, User */}
      <div className="flex items-center gap-3">
        {/* Countdown Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#102034] border border-[#1b2b3f] rounded-full">
          <Flame className="w-3.5 h-3.5 text-[#4edea3]" />
          <span className="font-mono text-xs text-[#d3e4fe] font-semibold">
            {isFr ? '14 jours restants' : '14 days remaining'}
          </span>
        </div>

        {/* Language Toggle FR / EN */}
        <button
          id="lang-toggle-btn"
          onClick={onLangToggle}
          title={isFr ? 'Basculer en anglais' : 'Switch to French'}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] rounded-lg text-xs font-mono font-medium text-[#bfc7d2] hover:text-[#d3e4fe] transition-colors"
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
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#102034] hover:bg-[#1b2b3f] border border-[#1b2b3f] rounded-lg text-xs font-mono font-medium text-[#bfc7d2] hover:text-[#d3e4fe] transition-colors"
        >
          {theme === 'light' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="hidden sm:inline text-[11px] font-medium">{isFr ? 'Clair' : 'Light'}</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#89ceff]" />
              <span className="hidden sm:inline text-[11px] font-medium">{isFr ? 'Sombre' : 'Dark'}</span>
            </>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
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

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1b2b3f]">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3198dc] to-[#4edea3] flex items-center justify-center font-bold text-xs text-[#002c47] ring-1 ring-[#93ccff]/40 shadow-sm">
              SL
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#4edea3] ring-1 ring-[#031427]"></span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[#d3e4fe] leading-tight">Sarah L.</span>
            <span className="font-mono text-[10px] text-[#89929b] leading-tight">
              {isFr ? 'DBA Cloud Trainee' : 'Cloud DBA Trainee'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
