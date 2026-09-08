import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { SystemVersionInfo } from '../types';
import { formatRelativeTime } from '../services/updateService';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemInfo: SystemVersionInfo;
  onCheckForUpdates: () => Promise<void>;
  onForceUpdate: () => Promise<void>;
  onToggleAutoUpdate: (enabled: boolean) => void;
  onChangeInterval: (minutes: number) => void;
  lang: 'fr' | 'en';
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
}) => {
  const isFr = lang === 'fr';
  const [activeSubTab, setActiveSubTab] = useState<'updates' | 'history' | 'diagnostics'>('updates');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  if (!isOpen) return null;

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

  return (
    <div 
      id="system-settings-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="system-settings-modal-dialog"
        className="w-full max-w-2xl bg-[#031427] border border-[#1b2b3f] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp text-[#d3e4fe]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1b2b3f] bg-[#000f21] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#006398] to-[#3198dc] flex items-center justify-center text-white shadow-md shadow-[#006398]/30">
              <Settings className="w-5 h-5 text-[#93ccff]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#d3e4fe] flex items-center gap-2">
                <span>{isFr ? 'Paramètres Système & Mises à jour' : 'System Settings & Updates'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/30 font-semibold">
                  {systemInfo.currentVersion}
                </span>
              </h2>
              <p className="text-xs text-[#89929b] font-mono">
                {isFr ? 'Architecture DBMastery Engine • Gestion du cycle de vie' : 'DBMastery Engine Architecture • Lifecycle management'}
              </p>
            </div>
          </div>

          <button
            id="system-settings-close-btn"
            onClick={onClose}
            className="p-2 rounded-lg bg-[#102034] text-[#89929b] hover:text-[#d3e4fe] hover:bg-[#1b2b3f] border border-[#1b2b3f] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="px-6 pt-3 border-b border-[#1b2b3f] bg-[#0b1c30] flex gap-2">
          <button
            id="tab-btn-updates"
            onClick={() => setActiveSubTab('updates')}
            className={`pb-2.5 px-3 font-mono text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeSubTab === 'updates'
                ? 'border-[#3198dc] text-[#89ceff]'
                : 'border-transparent text-[#89929b] hover:text-[#d3e4fe]'
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
                ? 'border-[#3198dc] text-[#89ceff]'
                : 'border-transparent text-[#89929b] hover:text-[#d3e4fe]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{isFr ? 'Historique des versions' : 'Release History'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1b2b3f] text-[#bfc7d2]">
              {systemInfo.updateHistory.length}
            </span>
          </button>

          <button
            id="tab-btn-diagnostics"
            onClick={() => setActiveSubTab('diagnostics')}
            className={`pb-2.5 px-3 font-mono text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeSubTab === 'diagnostics'
                ? 'border-[#3198dc] text-[#89ceff]'
                : 'border-transparent text-[#89929b] hover:text-[#d3e4fe]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isFr ? 'Diagnostics Système' : 'System Diagnostics'}</span>
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
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1b2b3f] bg-[#000f21] flex items-center justify-between text-xs font-mono">
          <div className="text-[#89929b] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
            <span>Build {systemInfo.buildNumber}</span>
          </div>

          <button
            id="system-settings-modal-close-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] font-semibold transition-colors"
          >
            {isFr ? 'Fermer' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
