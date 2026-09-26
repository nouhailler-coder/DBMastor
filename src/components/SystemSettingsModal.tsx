import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  HardDrive, 
  Cpu, 
  Radio, 
  Sparkles, 
  AlertCircle, 
  History, 
  ToggleLeft, 
  ToggleRight,
  Zap,
  ArrowUpCircle,
  Database,
  ExternalLink,
  RotateCcw,
  BarChart3,
  Award,
  AlertTriangle,
  Flame,
  Check
} from 'lucide-react';
import { SystemVersionInfo } from '../types';
import { formatRelativeTime } from '../services/updateService';
import { 
  loadUserStats, 
  resetUserStats, 
  restoreDefaultUserStats, 
  subscribeToStats, 
  UserStatsData 
} from '../services/statsService';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemInfo: SystemVersionInfo;
  onCheckForUpdates: () => Promise<void>;
  onForceUpdate: () => Promise<void>;
  onToggleAutoUpdate: (enabled: boolean) => void;
  onChangeInterval: (minutes: number) => void;
  lang: 'fr' | 'en';
  theme?: 'light' | 'dark';
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  systemInfo,
  onCheckForUpdates,
  onForceUpdate,
  onToggleAutoUpdate,
  onChangeInterval,
  lang,
  theme = 'light',
}) => {
  const isFr = lang === 'fr';
  const isLight = theme === 'light';
  const [activeSubTab, setActiveSubTab] = useState<'updates' | 'history' | 'diagnostics' | 'data'>('updates');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [currentStats, setCurrentStats] = useState<UserStatsData>(loadUserStats);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStats(loadUserStats());
      setIsConfirmingReset(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = subscribeToStats((updated) => {
      setCurrentStats(updated);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleResetStats = () => {
    const fresh = resetUserStats();
    setCurrentStats(fresh);
    setIsConfirmingReset(false);
    setFeedbackToast(
      isFr 
        ? 'Statistiques et badges réinitialisés avec succès !' 
        : 'Statistics and badges reset successfully!'
    );
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleRestoreStats = () => {
    const restored = restoreDefaultUserStats();
    setCurrentStats(restored);
    setFeedbackToast(
      isFr 
        ? 'Données de démonstration restaurées avec succès !' 
        : 'Demo data restored successfully!'
    );
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleCheck = async () => {
    try {
      await onCheckForUpdates();
      setFeedbackToast(isFr ? 'Vérification terminée avec succès !' : 'Check completed successfully!');
      setTimeout(() => setFeedbackToast(null), 3500);
    } catch {
      setFeedbackToast(isFr ? 'Erreur lors de la vérification.' : 'Check failed.');
      setTimeout(() => setFeedbackToast(null), 3500);
    }
  };

  const handleForce = async () => {
    try {
      await onForceUpdate();
      setFeedbackToast(isFr ? 'Mise à jour forcée appliquée avec succès !' : 'Force update applied successfully!');
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch {
      setFeedbackToast(isFr ? 'Erreur lors de la mise à jour.' : 'Update failed.');
      setTimeout(() => setFeedbackToast(null), 4000);
    }
  };

  const unlockedCount = currentStats.badges.filter(b => b.unlocked).length;

  return (
    <div 
      id="system-settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="system-settings-modal-dialog"
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp transition-colors ${
          isLight 
            ? 'bg-white border border-slate-200 text-slate-900' 
            : 'bg-[#031427] border border-[#1b2b3f] text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors ${
          isLight 
            ? 'bg-slate-50 border-slate-200' 
            : 'bg-[#000f21] border-[#1b2b3f]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006398] to-[#3198dc] flex items-center justify-center text-white shadow-md shadow-[#006398]/30">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                <span>{isFr ? 'Paramètres Système & Mises à jour' : 'System Settings & Updates'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4edea3]/15 text-[#16a34a] dark:text-[#4edea3] border border-[#4edea3]/40 font-bold">
                  {systemInfo.currentVersion}
                </span>
              </h2>
              <p className={`text-xs font-mono ${
                isLight ? 'text-slate-500' : 'text-slate-300'
              }`}>
                {isFr ? 'Architecture DBMastery Engine • Gestion du cycle de vie' : 'DBMastery Engine Architecture • Lifecycle management'}
              </p>
            </div>
          </div>

          <button
            id="system-settings-close-btn"
            onClick={onClose}
            className={`p-2 rounded-lg border transition-colors ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200' 
                : 'bg-[#102034] text-slate-300 hover:text-white hover:bg-[#1b2b3f] border-[#1b2b3f]'
            }`}
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className={`px-6 pt-3 border-b flex gap-2 flex-wrap transition-colors ${
          isLight 
            ? 'bg-slate-100/70 border-slate-200' 
            : 'bg-[#0b1c30] border-[#1b2b3f]'
        }`}>
          <button
            id="tab-btn-updates"
            onClick={() => setActiveSubTab('updates')}
            className={`pb-2.5 px-3 font-mono text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeSubTab === 'updates'
                ? isLight ? 'border-sky-600 text-sky-700 font-bold' : 'border-[#3198dc] text-white font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isFr ? 'Mises à jour & Version' : 'Updates & Version'}</span>
          </button>

          <button
            id="tab-btn-history"
            onClick={() => setActiveSubTab('history')}
            className={`pb-2.5 px-3 font-mono text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeSubTab === 'history'
                ? isLight ? 'border-sky-600 text-sky-700 font-bold' : 'border-[#3198dc] text-white font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{isFr ? 'Historique des versions' : 'Release History'}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              isLight ? 'bg-slate-200 text-slate-700 font-bold' : 'bg-[#1b2b3f] text-slate-200 font-bold'
            }`}>
              {systemInfo.updateHistory.length}
            </span>
          </button>

          <button
            id="tab-btn-diagnostics"
            onClick={() => setActiveSubTab('diagnostics')}
            className={`pb-2.5 px-3 font-mono text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeSubTab === 'diagnostics'
                ? isLight ? 'border-sky-600 text-sky-700 font-bold' : 'border-[#3198dc] text-white font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-slate-900' : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isFr ? 'Diagnostics Système' : 'System Diagnostics'}</span>
          </button>

          <button
            id="tab-btn-data"
            onClick={() => setActiveSubTab('data')}
            className={`pb-2.5 px-3 font-mono text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeSubTab === 'data'
                ? 'border-rose-500 text-rose-600 font-bold'
                : isLight ? 'border-transparent text-slate-500 hover:text-rose-600' : 'border-transparent text-slate-300 hover:text-rose-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>{isFr ? 'Données & Réinitialisation' : 'Data & Reset'}</span>
          </button>
        </div>

        {/* Notification Toast inside modal */}
        {feedbackToast && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-[#00a572]/20 border border-[#4edea3]/40 text-[#4edea3] text-xs font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#4edea3]" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeSubTab === 'updates' && (
            <div className="space-y-6">
              {/* PRIMARY REQUIREMENTS SECTION: Date de sortie & Date de dernière vérification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Date de sortie */}
                <div className="p-4 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex items-start gap-3 shadow-sm">
                  <div className="p-2.5 rounded-lg bg-[#3198dc]/15 text-[#89ceff] shrink-0 mt-0.5">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[#89929b] uppercase tracking-wider block font-semibold">
                      {isFr ? 'Date de sortie de la version' : 'Release Date'}
                    </span>
                    <span id="system-release-date-value" className="text-base font-bold text-[#d3e4fe] block mt-0.5">
                      {systemInfo.releaseDate}
                    </span>
                    <span className="text-[11px] text-[#4edea3] font-mono block mt-0.5">
                      {systemInfo.currentVersion} ({systemInfo.channel === 'stable' ? (isFr ? 'Canal Stable' : 'Stable Channel') : 'Bêta'})
                    </span>
                  </div>
                </div>

                {/* 2. Date de la dernière vérification */}
                <div className="p-4 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex items-start gap-3 shadow-sm">
                  <div className="p-2.5 rounded-lg bg-[#4edea3]/15 text-[#4edea3] shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[#89929b] uppercase tracking-wider block font-semibold">
                      {isFr ? 'Dernière vérification' : 'Last Check Time'}
                    </span>
                    <span id="system-last-check-value" className="text-sm font-bold text-[#d3e4fe] block mt-0.5 font-mono">
                      {systemInfo.lastCheckedDate}
                    </span>
                    <span className="text-[11px] text-[#89ceff] font-mono block mt-0.5">
                      {formatRelativeTime(systemInfo.lastCheckedDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar when Updating */}
              {systemInfo.isUpdating && (
                <div className="p-4 rounded-xl bg-[#102034] border border-[#3198dc]/40 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-mono font-semibold">
                    <span className="flex items-center gap-2 text-[#89ceff]">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#3198dc]" />
                      {isFr ? 'Installation de la mise à jour en cours...' : 'Installing update in progress...'}
                    </span>
                    <span className="text-[#4edea3]">{systemInfo.updateProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#000f21] rounded-full overflow-hidden border border-[#1b2b3f]">
                    <div 
                      className="h-full bg-gradient-to-r from-[#3198dc] to-[#4edea3] transition-all duration-300 rounded-full"
                      style={{ width: `${systemInfo.updateProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-[#89929b] font-mono">
                    {systemInfo.statusMessage}
                  </p>
                </div>
              )}

              {/* PRIMARY REQUIREMENTS SECTION: Boutons "Vérifier les mises à jour" & "Forcer la mise à jour" */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#102034] to-[#0b1c30] border border-[#1b2b3f] space-y-4 shadow-lg">
                <div>
                  <h3 className="text-sm font-bold text-[#d3e4fe] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#89ceff]" />
                    {isFr ? 'Actions de mise à jour' : 'Update Actions'}
                  </h3>
                  <p className="text-xs text-[#bfc7d2] mt-1 leading-relaxed">
                    {isFr 
                      ? 'Recherchez de nouveaux correctifs sur le serveur officiel ou forcez une réinstallation complète des binaires et des référentiels de certification.'
                      : 'Check for new patches on official servers or force an immediate re-installation of binaries and certification repositories.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  {/* Bouton 1 : Vérifier les mises à jour */}
                  <button
                    id="btn-check-updates"
                    onClick={handleCheck}
                    disabled={systemInfo.isChecking || systemInfo.isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe] hover:text-white font-semibold text-xs border border-[#26364a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
                  >
                    <RefreshCw className={`w-4 h-4 text-[#89ceff] ${systemInfo.isChecking ? 'animate-spin' : ''}`} />
                    <span>
                      {systemInfo.isChecking 
                        ? (isFr ? 'Vérification en cours...' : 'Checking...') 
                        : (isFr ? 'Vérifier les mises à jour' : 'Check for Updates')}
                    </span>
                  </button>

                  {/* Bouton 2 : Forcer la mise à jour */}
                  <button
                    id="btn-force-update"
                    onClick={handleForce}
                    disabled={systemInfo.isChecking || systemInfo.isUpdating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3198dc] hover:bg-[#2084c7] text-[#002c47] font-bold text-xs shadow-md shadow-[#3198dc]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    <Download className={`w-4 h-4 ${systemInfo.isUpdating ? 'animate-bounce' : ''}`} />
                    <span>
                      {systemInfo.isUpdating 
                        ? (isFr ? 'Installation forcée...' : 'Forcing...') 
                        : (isFr ? 'Forcer la mise à jour' : 'Force Update')}
                    </span>
                  </button>
                </div>

                {/* Status indicator message */}
                <div className="flex items-center gap-2 text-xs font-mono pt-1 text-[#89929b]">
                  <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
                  <span>{systemInfo.statusMessage}</span>
                </div>
              </div>

              {/* PRIMARY REQUIREMENTS SECTION: Système de mises à jour automatiques en arrière-plan */}
              <div className="p-5 rounded-2xl bg-[#0b1c30] border border-[#1b2b3f] space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#f59e0b]" />
                      <h3 className="text-sm font-bold text-[#d3e4fe]">
                        {isFr ? 'Mises à jour automatiques en arrière-plan' : 'Automatic Background Updates'}
                      </h3>
                    </div>
                    <p className="text-xs text-[#89929b] leading-relaxed">
                      {isFr 
                        ? 'Vérifie régulièrement en tâche de fond la disponibilité de nouveaux correctifs et installe automatiquement les nouvelles versions sans interrompre votre session d\'étude.' 
                        : 'Periodically checks for new releases in the background and silently installs updates without disrupting your active practice.'}
                    </p>
                  </div>

                  {/* Toggle Button */}
                  <button
                    id="toggle-auto-update-btn"
                    onClick={() => onToggleAutoUpdate(!systemInfo.autoUpdateEnabled)}
                    className="shrink-0 transition-transform active:scale-95"
                    aria-label={isFr ? 'Activer / désactiver les mises à jour automatiques' : 'Toggle auto-update'}
                  >
                    {systemInfo.autoUpdateEnabled ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00a572]/20 border border-[#4edea3]/40 text-[#4edea3] font-mono text-xs font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
                        <span>{isFr ? 'ACTIVÉ' : 'ENABLED'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b2b3f] border border-[#26364a] text-[#89929b] font-mono text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-[#89929b]"></span>
                        <span>{isFr ? 'DÉSACTIVÉ' : 'DISABLED'}</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Auto Update Interval Selector */}
                {systemInfo.autoUpdateEnabled && (
                  <div className="pt-2 border-t border-[#1b2b3f]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-mono text-[#bfc7d2]">
                      {isFr ? 'Fréquence de vérification en arrière-plan :' : 'Background check frequency:'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[1, 5, 15, 60].map((mins) => (
                        <button
                          key={mins}
                          id={`interval-btn-${mins}m`}
                          onClick={() => onChangeInterval(mins)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                            systemInfo.autoUpdateIntervalMinutes === mins
                              ? 'bg-[#3198dc] text-[#002c47] font-bold shadow-sm'
                              : 'bg-[#102034] text-[#bfc7d2] hover:bg-[#1b2b3f] hover:text-[#d3e4fe] border border-[#1b2b3f]'
                          }`}
                        >
                          {mins === 1 ? (isFr ? '1 min (Démo)' : '1 min (Demo)') : `${mins} min`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reset Quick Action Card inside Updates view */}
              <div className="p-4 rounded-2xl bg-[#0b1c30] border border-[#1b2b3f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                    <h4 className="text-xs font-bold text-[#d3e4fe]">
                      {isFr ? 'Réinitialisation des Statistiques & Badges' : 'Reset Statistics & Badges'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#89929b]">
                    {isFr 
                      ? `${currentStats.overallAccuracy}% de réussite • ${currentStats.questionsAnswered} questions • ${unlockedCount}/${currentStats.badges.length} badges`
                      : `${currentStats.overallAccuracy}% accuracy • ${currentStats.questionsAnswered} questions • ${unlockedCount}/${currentStats.badges.length} badges`}
                  </p>
                </div>

                <button
                  id="btn-quick-switch-to-reset"
                  onClick={() => setActiveSubTab('data')}
                  className="px-3 py-1.5 rounded-lg bg-[#102034] hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Gérer / Réinitialiser' : 'Manage / Reset'}</span>
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b2b3f]">
                <span className="text-xs font-mono text-[#89929b] uppercase tracking-wider font-semibold">
                  {isFr ? 'Journal des versions installées' : 'Changelog & Installed Versions'}
                </span>
                <span className="text-xs font-mono text-[#4edea3]">
                  {isFr ? 'Actuel : ' : 'Current: '} {systemInfo.currentVersion}
                </span>
              </div>

              <div className="space-y-3">
                {systemInfo.updateHistory.map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    className="p-4 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] space-y-1.5 hover:border-[#26364a] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#89ceff]">
                          {item.version}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          item.type === 'auto' 
                            ? 'bg-[#4edea3]/15 text-[#4edea3] border border-[#4edea3]/30' 
                            : item.type === 'forced'
                            ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30'
                            : 'bg-[#3198dc]/15 text-[#89ceff] border border-[#3198dc]/30'
                        }`}>
                          {item.type === 'auto' ? (isFr ? 'Automatique' : 'Auto') : item.type === 'forced' ? (isFr ? 'Forcée' : 'Forced') : (isFr ? 'Manuelle' : 'Manual')}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-[#89929b]">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-[#d3e4fe] leading-relaxed">
                      {item.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#89929b] font-semibold">{isFr ? 'Moteur SQL Relationnel' : 'Relational SQL Engine'}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
                  </div>
                  <span className="text-sm font-bold text-[#d3e4fe] block">v16.2 In-Memory Sandbox</span>
                  <span className="text-[10px] text-[#89ceff] font-mono">{isFr ? 'Latence 12ms • 100% opérationnel' : '12ms latency • 100% operational'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#89929b] font-semibold">{isFr ? 'Banque de Flashcards' : 'Flashcards Bank'}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
                  </div>
                  <span className="text-sm font-bold text-[#d3e4fe] block">600 Flashcards vérifiées</span>
                  <span className="text-[10px] text-[#4edea3] font-mono">{isFr ? 'Oracle + Azure DP-900 & DP-800' : 'Oracle + Azure DP-900 & DP-800'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#89929b] font-semibold">{isFr ? 'Cache & Persistance locale' : 'Cache & Local Storage'}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
                  </div>
                  <span className="text-sm font-bold text-[#d3e4fe] block">IndexedDB / LocalStorage Synchronisé</span>
                  <span className="text-[10px] text-[#bfc7d2] font-mono">{isFr ? 'Stockage hors-ligne valide' : 'Offline storage valid'}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#89929b] font-semibold">{isFr ? 'Agent de fond Auto-Update' : 'Auto-Update Worker'}</span>
                    <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
                  </div>
                  <span className="text-sm font-bold text-[#d3e4fe] block">
                    {systemInfo.autoUpdateEnabled ? (isFr ? 'Actif en arrière-plan' : 'Active in background') : (isFr ? 'En veille' : 'Standby')}
                  </span>
                  <span className="text-[10px] text-[#89929b] font-mono">
                    {isFr ? `Intervalle : ${systemInfo.autoUpdateIntervalMinutes} min` : `Interval: ${systemInfo.autoUpdateIntervalMinutes} min`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'data' && (
            <div className="space-y-5">
              {/* Progress Summary Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-xl border transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0b1c30] border-[#1b2b3f]'
                }`}>
                  <span className={`text-[10px] font-mono uppercase block font-semibold ${
                    isLight ? 'text-slate-500' : 'text-slate-300'
                  }`}>
                    {isFr ? 'Taux Global' : 'Overall Accuracy'}
                  </span>
                  <span className={`text-xl font-bold mt-0.5 block font-sans ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {currentStats.overallAccuracy}%
                  </span>
                  <span className="text-[10px] text-[#16a34a] dark:text-[#4edea3] font-mono font-bold">
                    {currentStats.accuracyDelta}
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0b1c30] border-[#1b2b3f]'
                }`}>
                  <span className={`text-[10px] font-mono uppercase block font-semibold ${
                    isLight ? 'text-slate-500' : 'text-slate-300'
                  }`}>
                    {isFr ? 'Questions' : 'Items Solved'}
                  </span>
                  <span className={`text-xl font-bold mt-0.5 block font-sans ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    {currentStats.questionsAnswered}
                  </span>
                  <span className="text-[10px] text-[#0284c7] dark:text-[#89ceff] font-mono font-semibold">
                    {isFr ? 'Enregistrées' : 'Recorded'}
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0b1c30] border-[#1b2b3f]'
                }`}>
                  <span className={`text-[10px] font-mono uppercase block font-semibold ${
                    isLight ? 'text-slate-500' : 'text-slate-300'
                  }`}>
                    {isFr ? 'Badges Acquis' : 'Badges Earned'}
                  </span>
                  <span className={`text-xl font-bold mt-0.5 block font-sans text-amber-500`}>
                    {unlockedCount} <span className={`text-xs font-normal ${
                      isLight ? 'text-slate-400' : 'text-slate-300'
                    }`}>/ {currentStats.badges.length}</span>
                  </span>
                  <span className="text-[10px] text-amber-500 font-mono font-semibold">
                    {Math.round((unlockedCount / currentStats.badges.length) * 100)}% {isFr ? 'débloqués' : 'unlocked'}
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border transition-colors ${
                  isLight ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0b1c30] border-[#1b2b3f]'
                }`}>
                  <span className={`text-[10px] font-mono uppercase block font-semibold ${
                    isLight ? 'text-slate-500' : 'text-slate-300'
                  }`}>
                    {isFr ? 'Série Active' : 'Streak'}
                  </span>
                  <span className={`text-xl font-bold mt-0.5 block font-sans flex items-center gap-1 text-[#16a34a] dark:text-[#4edea3]`}>
                    <Flame className="w-4 h-4 text-[#16a34a] dark:text-[#4edea3]" />
                    {currentStats.streakDays} <span className={`text-xs font-normal ${
                      isLight ? 'text-slate-500' : 'text-slate-300'
                    }`}>{isFr ? 'jours' : 'days'}</span>
                  </span>
                  <span className={`text-[10px] font-mono ${
                    isLight ? 'text-slate-500' : 'text-slate-300'
                  }`}>
                    {currentStats.lastResetDate ? (isFr ? `RàZ: ${currentStats.lastResetDate}` : `Reset: ${currentStats.lastResetDate}`) : (isFr ? 'Actif' : 'Active')}
                  </span>
                </div>
              </div>

              {/* Badges Status Miniature Preview */}
              <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
                isLight ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#0b1c30] border-[#1b2b3f]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <Award className="w-4 h-4 text-amber-500" />
                    {isFr ? 'Statut actuel des Badges d\'Accomplissement' : 'Current Achievement Badges Status'}
                  </span>
                  <span className={`text-[11px] font-mono ${
                    isLight ? 'text-slate-500' : 'text-slate-300'
                  }`}>
                    {unlockedCount} {isFr ? 'sur' : 'of'} {currentStats.badges.length} {isFr ? 'déverrouillés' : 'unlocked'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentStats.badges.map((b) => (
                    <div 
                      key={b.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 transition-all ${
                        b.unlocked 
                          ? isLight 
                            ? 'bg-white border-slate-200 text-slate-800 shadow-sm' 
                            : 'bg-[#102034] border-[#1b2b3f] text-white' 
                          : isLight 
                            ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60' 
                            : 'bg-[#000f21]/60 border-[#1b2b3f]/60 text-slate-400 opacity-60'
                      }`}
                    >
                      <div 
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: b.unlocked ? `${b.color}25` : '#64748b20', color: b.unlocked ? b.color : '#94a3b8' }}
                      >
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold block truncate text-[11px]">{b.title}</span>
                        <span className={`text-[10px] font-mono block ${
                          b.unlocked 
                            ? isLight ? 'text-emerald-600 font-semibold' : 'text-[#4edea3]' 
                            : isLight ? 'text-slate-400' : 'text-slate-400'
                        }`}>
                          {b.unlocked ? (isFr ? 'Débloqué' : 'Unlocked') : (isFr ? 'Verrouillé' : 'Locked')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger Zone: Reset Statistics & Badges */}
              <div className={`p-5 rounded-2xl border space-y-4 shadow-lg transition-colors ${
                isLight 
                  ? 'bg-rose-50/60 border-rose-200' 
                  : 'bg-gradient-to-br from-rose-950/30 via-[#102034] to-[#0b1c30] border-rose-500/40'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30 shrink-0 mt-0.5">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${
                      isLight ? 'text-rose-900' : 'text-rose-200'
                    }`}>
                      <span>{isFr ? 'Réinitialisation des Statistiques & Badges' : 'Reset Statistics & Badges'}</span>
                    </h3>
                    <p className={`text-xs leading-relaxed ${
                      isLight ? 'text-slate-600' : 'text-slate-200'
                    }`}>
                      {isFr 
                        ? 'Cette action efface l\'ensemble de votre progression chiffrée : le taux de réussite global, l\'historique des questions résolues, la vitesse moyenne, la probabilité calculée et reverrouille tous les 6 badges de certification.'
                        : 'This action resets all your performance metrics: overall accuracy, questions answered, velocity, pass probability, and locks all 6 certification badges.'}
                    </p>
                  </div>
                </div>

                {/* Confirmation Box or Trigger Button */}
                {!isConfirmingReset ? (
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      id="btn-reset-stats-badges"
                      onClick={() => setIsConfirmingReset(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                    >
                      <RotateCcw className="w-4 h-4 text-white" />
                      <span>
                        {isFr ? 'Réinitialiser les statistiques et les badges' : 'Reset Statistics and Badges'}
                      </span>
                    </button>

                    <button
                      id="btn-restore-demo-stats"
                      onClick={handleRestoreStats}
                      className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-mono text-xs border transition-all ${
                        isLight 
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm' 
                          : 'bg-[#1b2b3f] hover:bg-[#26364a] text-slate-200 border-[#26364a]'
                      }`}
                      title={isFr ? 'Restaurer le jeu d\'essai' : 'Restore demo data'}
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-sky-500" />
                      <span>{isFr ? 'Restaurer données de démo' : 'Restore demo data'}</span>
                    </button>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border space-y-3 animate-fadeIn ${
                    isLight 
                      ? 'bg-rose-100/70 border-rose-300' 
                      : 'bg-rose-950/60 border-rose-500/60'
                  }`}>
                    <div className="flex items-start gap-2.5 text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className={`font-bold block ${isLight ? 'text-rose-900' : 'text-rose-100'}`}>
                          {isFr ? 'Confirmation nécessaire' : 'Confirmation required'}
                        </span>
                        <p className={`text-[11px] mt-0.5 leading-snug ${isLight ? 'text-rose-800' : 'text-rose-200'}`}>
                          {isFr 
                            ? 'Êtes-vous certain de vouloir réinitialiser vos statistiques à 0% et reverrouiller tous vos badges ? Cette action remet à zéro vos compteurs.' 
                            : 'Are you sure you want to reset your stats to 0% and lock all badges? This will reset all your counters.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      <button
                        id="btn-confirm-reset-stats"
                        onClick={handleResetStats}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isFr ? 'Oui, réinitialiser maintenant' : 'Yes, reset now'}</span>
                      </button>

                      <button
                        id="btn-cancel-reset-stats"
                        onClick={() => setIsConfirmingReset(false)}
                        className={`px-4 py-2 rounded-lg border font-semibold text-xs transition-colors ${
                          isLight 
                            ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300' 
                            : 'bg-[#102034] hover:bg-[#1b2b3f] text-white border-[#1b2b3f]'
                        }`}
                      >
                        {isFr ? 'Annuler' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between text-xs font-mono transition-colors ${
          isLight 
            ? 'bg-slate-50 border-slate-200' 
            : 'bg-[#000f21] border-[#1b2b3f]'
        }`}>
          <div className={`flex items-center gap-2 ${
            isLight ? 'text-slate-500' : 'text-slate-300'
          }`}>
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
            <span>Build {systemInfo.buildNumber}</span>
          </div>

          <button
            id="system-settings-modal-close-btn"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl border font-semibold transition-colors ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm' 
                : 'bg-[#102034] hover:bg-[#1b2b3f] text-white border-[#1b2b3f]'
            }`}
          >
            {isFr ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
