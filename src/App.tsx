import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PracticeExamView } from './components/PracticeExamView';
import { SqlLabView } from './components/SqlLabView';
import { StudySheetsView } from './components/StudySheetsView';
import { FlashcardsView } from './components/FlashcardsView';
import { StatsView } from './components/StatsView';
import { ExamSummaryModal } from './components/ExamSummaryModal';
import { HamburgerMenu } from './components/HamburgerMenu';
import { SystemSettingsModal } from './components/SystemSettingsModal';
import { NavigationTab, CertificationTrackId, SystemVersionInfo } from './types';
import { 
  getInitialSystemVersionInfo, 
  saveSystemVersionInfo, 
  formatFullDateTime, 
  getNextSimulatedVersion 
} from './services/updateService';
import { Zap, CheckCircle2, X, RefreshCw, Settings } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedCert, setSelectedCert] = useState<CertificationTrackId>('oracle-1z0-071');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [searchQuery, setSearchQuery] = useState('');
  const [examModalScore, setExamModalScore] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('dbmastery_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  // États pour le Menu Hamburger et les Paramètres Système
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemVersionInfo>(() => getInitialSystemVersionInfo());
  const [bgUpdateToast, setBgUpdateToast] = useState<{
    version: string;
    type: 'auto' | 'forced';
    notes: string;
  } | null>(null);

  const systemInfoRef = useRef(systemInfo);
  systemInfoRef.current = systemInfo;

  const handleLangToggle = () => {
    setLang((prev) => (prev === 'fr' ? 'en' : 'fr'));
  };

  const handleThemeToggle = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('dbmastery_theme', next);
      return next;
    });
  };

  const handleFinishExam = (score: number) => {
    setExamModalScore(score);
  };

  // ==========================================
  // SYSTÈME DE MISE À JOUR (VÉRIFIER & FORCER)
  // ==========================================

  // 1. Bouton "Vérifier les mises à jour"
  const handleCheckForUpdates = async () => {
    setSystemInfo((prev) => ({
      ...prev,
      isChecking: true,
      statusMessage: lang === 'fr' ? 'Vérification des répertoires officiels...' : 'Checking official repositories...',
    }));

    await new Promise((resolve) => setTimeout(resolve, 1400));

    const nowStr = formatFullDateTime(new Date());
    setSystemInfo((prev) => {
      const updated: SystemVersionInfo = {
        ...prev,
        isChecking: false,
        lastCheckedDate: nowStr,
        statusMessage: lang === 'fr' 
          ? `Vérification effectuée à ${nowStr.split('à')[1]?.trim() || nowStr}. Système à jour.` 
          : `Checked at ${nowStr}. System is up-to-date.`,
      };
      saveSystemVersionInfo(updated);
      return updated;
    });
  };

  // 2. Bouton "Forcer la mise à jour"
  const handleForceUpdate = async () => {
    setSystemInfo((prev) => ({
      ...prev,
      isUpdating: true,
      updateProgress: 15,
      statusMessage: lang === 'fr' ? 'Téléchargement forcé des modules...' : 'Forcing module download...',
    }));

    await new Promise((resolve) => setTimeout(resolve, 500));
    setSystemInfo((prev) => ({ ...prev, updateProgress: 45, statusMessage: lang === 'fr' ? 'Compilation des index et cache SQL...' : 'Compiling indexes and SQL cache...' }));

    await new Promise((resolve) => setTimeout(resolve, 600));
    setSystemInfo((prev) => ({ ...prev, updateProgress: 80, statusMessage: lang === 'fr' ? 'Application des binaires du moteur...' : 'Applying engine binaries...' }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    const currentVer = systemInfoRef.current.currentVersion;
    const nextVer = getNextSimulatedVersion(currentVer);
    const nowStr = formatFullDateTime(new Date());

    setSystemInfo((prev) => {
      const updated: SystemVersionInfo = {
        ...prev,
        currentVersion: nextVer.version,
        releaseDate: nextVer.releaseDate,
        lastCheckedDate: nowStr,
        isUpdating: false,
        updateProgress: 100,
        statusMessage: lang === 'fr'
          ? `Mise à jour ${nextVer.version} installée et active.`
          : `Update ${nextVer.version} installed and active.`,
        updateHistory: [
          {
            id: `forced-${Date.now()}`,
            timestamp: nowStr,
            version: nextVer.version,
            type: 'forced',
            notes: nextVer.notes,
          },
          ...prev.updateHistory,
        ],
      };
      saveSystemVersionInfo(updated);
      return updated;
    });

    setBgUpdateToast({
      version: nextVer.version,
      type: 'forced',
      notes: nextVer.notes,
    });
  };

  // Interrupteur Mises à jour automatiques
  const handleToggleAutoUpdate = (enabled: boolean) => {
    setSystemInfo((prev) => {
      const updated = { ...prev, autoUpdateEnabled: enabled };
      saveSystemVersionInfo(updated);
      return updated;
    });
  };

  // Fréquence des vérifications automatiques
  const handleChangeInterval = (minutes: number) => {
    setSystemInfo((prev) => {
      const updated = { ...prev, autoUpdateIntervalMinutes: minutes };
      saveSystemVersionInfo(updated);
      return updated;
    });
  };

  // =========================================================================
  // SYSTÈME DE MISES À JOUR AUTOMATIQUES EN ARRIÈRE-PLAN (BACKGROUND RUNNER)
  // Vérifie régulièrement en arrière-plan et installe automatiquement les versions
  // =========================================================================
  useEffect(() => {
    const intervalMs = Math.max(systemInfo.autoUpdateIntervalMinutes * 60 * 1000, 30000);

    const intervalId = setInterval(() => {
      const currentInfo = systemInfoRef.current;
      if (!currentInfo.autoUpdateEnabled || currentInfo.isUpdating || currentInfo.isChecking) {
        return;
      }

      // Exécution silencieuse en arrière-plan
      const nowStr = formatFullDateTime(new Date());
      const nextVer = getNextSimulatedVersion(currentInfo.currentVersion);

      // Simulation d'une nouvelle version disponible détectée et installée silencieusement
      const updated: SystemVersionInfo = {
        ...currentInfo,
        currentVersion: nextVer.version,
        releaseDate: nextVer.releaseDate,
        lastCheckedDate: nowStr,
        statusMessage: lang === 'fr' 
          ? `Version ${nextVer.version} installée automatiquement en arrière-plan.`
          : `Version ${nextVer.version} automatically installed in background.`,
        updateHistory: [
          {
            id: `auto-${Date.now()}`,
            timestamp: nowStr,
            version: nextVer.version,
            type: 'auto',
            notes: nextVer.notes,
          },
          ...currentInfo.updateHistory,
        ],
      };

      setSystemInfo(updated);
      saveSystemVersionInfo(updated);

      // Notification discrète à l'utilisateur
      setBgUpdateToast({
        version: nextVer.version,
        type: 'auto',
        notes: nextVer.notes,
      });
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [systemInfo.autoUpdateIntervalMinutes, systemInfo.autoUpdateEnabled, lang]);

  // Fermeture automatique du toast après 6 secondes
  useEffect(() => {
    if (bgUpdateToast) {
      const timer = setTimeout(() => setBgUpdateToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [bgUpdateToast]);

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-200 ${
      isLight 
        ? 'theme-light bg-[#f8fafc] text-[#0f172a] selection:bg-[#0284c7]/20 selection:text-[#0284c7]' 
        : 'theme-dark bg-[#031427] text-[#d3e4fe] selection:bg-[#3198dc]/30 selection:text-[#93ccff]'
    }`}>
      {/* Fixed Sidebar with Hamburger and System Settings entrypoints */}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={(tab) => setCurrentTab(tab)} 
        lang={lang}
        onOpenHamburger={() => setIsHamburgerOpen(true)}
        onOpenSystemSettings={() => setIsSystemSettingsOpen(true)}
        systemVersion={systemInfo.currentVersion}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64 min-w-0">
        {/* Fixed Header with Hamburger Button and System Settings */}
        <Header
          selectedCert={selectedCert}
          onCertChange={setSelectedCert}
          lang={lang}
          onLangToggle={handleLangToggle}
          onSearchQuery={setSearchQuery}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          onOpenHamburger={() => setIsHamburgerOpen(true)}
          onOpenSystemSettings={() => setIsSystemSettingsOpen(true)}
          systemInfo={systemInfo}
        />

        {/* View Switcher Container with Top Margin for Fixed Header */}
        <main className="mt-16 flex-1 pb-16 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectTrack={(id) => {
                setSelectedCert(id);
              }}
              selectedCert={selectedCert}
              lang={lang}
            />
          )}

          {currentTab === 'exams' && (
            <PracticeExamView
              lang={lang}
              onFinishExam={handleFinishExam}
            />
          )}

          {currentTab === 'sandbox' && (
            <SqlLabView
              lang={lang}
            />
          )}

          {currentTab === 'syllabus' && (
            <StudySheetsView
              selectedCert={selectedCert}
              onCertChange={setSelectedCert}
              onNavigate={(tab) => setCurrentTab(tab)}
              lang={lang}
            />
          )}

          {currentTab === 'flashcards' && (
            <FlashcardsView
              onNavigate={(tab) => setCurrentTab(tab)}
              selectedCert={selectedCert}
              onCertChange={setSelectedCert}
              lang={lang}
              theme={theme}
            />
          )}

          {currentTab === 'analytics' && (
            <StatsView
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* Categorized Hamburger Menu Drawer */}
      <HamburgerMenu
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        selectedCert={selectedCert}
        onCertChange={setSelectedCert}
        onOpenSystemSettings={() => setIsSystemSettingsOpen(true)}
        systemInfo={systemInfo}
        lang={lang}
        onLangToggle={handleLangToggle}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      {/* System Settings & Updates Modal */}
      <SystemSettingsModal
        isOpen={isSystemSettingsOpen}
        onClose={() => setIsSystemSettingsOpen(false)}
        systemInfo={systemInfo}
        onCheckForUpdates={handleCheckForUpdates}
        onForceUpdate={handleForceUpdate}
        onToggleAutoUpdate={handleToggleAutoUpdate}
        onChangeInterval={handleChangeInterval}
        lang={lang}
      />

      {/* Floating Background Auto-Update Toast Notification */}
      {bgUpdateToast && (
        <div 
          id="bg-update-toast"
          className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl bg-[#031427]/95 border border-[#3198dc]/50 shadow-2xl backdrop-blur-xl animate-slideInRight flex items-start gap-3 text-[#d3e4fe]"
        >
          <div className="p-2 rounded-xl bg-[#00a572]/20 text-[#4edea3] shrink-0 mt-0.5 border border-[#4edea3]/30">
            <Zap className="w-5 h-5 text-[#4edea3]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                {bgUpdateToast.type === 'auto' 
                  ? (lang === 'fr' ? 'Mise à jour en arrière-plan' : 'Background Update')
                  : (lang === 'fr' ? 'Mise à jour forcée' : 'Forced Update')}
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#3198dc]/20 text-[#89ceff] border border-[#3198dc]/40">
                  {bgUpdateToast.version}
                </span>
              </span>
              <button
                onClick={() => setBgUpdateToast(null)}
                className="text-[#89929b] hover:text-[#d3e4fe] p-1"
                aria-label="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-[#bfc7d2] mt-1 leading-snug">
              {bgUpdateToast.notes}
            </p>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#1b2b3f] text-[10px] font-mono">
              <span className="text-[#4edea3] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {lang === 'fr' ? 'Prêt à l\'emploi' : 'Ready to use'}
              </span>
              <button
                onClick={() => {
                  setBgUpdateToast(null);
                  setIsSystemSettingsOpen(true);
                }}
                className="text-[#89ceff] hover:underline"
              >
                {lang === 'fr' ? 'Voir détails →' : 'View details →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Exam Completion Modal */}
      {examModalScore !== null && (
        <ExamSummaryModal
          score={examModalScore}
          isOpen={examModalScore !== null}
          onClose={() => setExamModalScore(null)}
          onReview={() => {
            setExamModalScore(null);
            setCurrentTab('exams');
          }}
          onReturnDashboard={() => {
            setExamModalScore(null);
            setCurrentTab('dashboard');
          }}
          lang={lang}
        />
      )}
    </div>
  );
}
