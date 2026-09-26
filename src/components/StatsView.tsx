import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Flame, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Database, 
  Lock, 
  RotateCcw,
  Settings,
  AlertCircle
} from 'lucide-react';
import { 
  loadUserStats, 
  subscribeToStats, 
  UserStatsData, 
  restoreDefaultUserStats,
  resetUserStats
} from '../services/statsService';
import { ResponseTimeAnalyticsCard } from './ResponseTimeAnalyticsCard';

interface StatsViewProps {
  lang: 'fr' | 'en';
  onOpenSettings?: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ lang, onOpenSettings }) => {
  const isFr = lang === 'fr';
  const [stats, setStats] = useState<UserStatsData>(loadUserStats);
  const [showQuickResetConfirm, setShowQuickResetConfirm] = useState(false);

  useEffect(() => {
    setStats(loadUserStats());
    const unsubscribe = subscribeToStats((newStats) => {
      setStats(newStats);
    });
    return unsubscribe;
  }, []);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return Flame;
      case 'Terminal': return Terminal;
      case 'ShieldCheck': return ShieldCheck;
      case 'Award': return Award;
      case 'Database': return Database;
      case 'Zap': return Zap;
      default: return Award;
    }
  };

  const unlockedCount = stats.badges.filter((b) => b.unlocked).length;

  const handleQuickReset = () => {
    resetUserStats();
    setShowQuickResetConfirm(false);
  };

  const handleQuickRestore = () => {
    restoreDefaultUserStats();
  };

  return (
    <div id="stats-view-container" className="p-6 max-w-[1720px] mx-auto w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header with Settings Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#4edea3] bg-[#003824]/40 px-2.5 py-0.5 rounded-full border border-[#4edea3]/30 font-semibold">
              {isFr ? 'Analyse de Performance' : 'Performance Analytics'}
            </span>
            <span className="text-[#89929b] font-mono text-xs">•</span>
            <span className="font-mono text-xs text-[#93ccff]">
              {isFr ? 'Cohorte Mondiale' : 'Global Cohort'}
            </span>
            {stats.lastResetDate && (
              <>
                <span className="text-[#89929b] font-mono text-xs">•</span>
                <span className="font-mono text-[10px] text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded border border-[#f59e0b]/30">
                  {isFr ? `Réinitialisé : ${stats.lastResetDate}` : `Reset: ${stats.lastResetDate}`}
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#d3e4fe]">
            {isFr ? 'Statistiques & Badges d\'Accomplissement' : 'Stats & Achievement Badges'}
          </h1>
          <p className="text-xs text-[#bfc7d2] max-w-2xl">
            {isFr 
              ? 'Mesurez votre vitesse d\'exécution, vos taux de réussite par domaine et collectionnez les certifications et récompenses techniques.' 
              : 'Measure your execution velocity, domain accuracy rates, and collect technical achievements and badges.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenSettings && (
            <button
              id="stats-open-settings-btn"
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] font-mono text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              <Settings className="w-3.5 h-3.5 text-[#89ceff]" />
              <span>{isFr ? 'Paramètres & Données' : 'Settings & Data'}</span>
            </button>
          )}

          {stats.questionsAnswered === 0 && unlockedCount === 0 && (
            <button
              id="stats-restore-demo-btn"
              onClick={handleQuickRestore}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1b2b3f] hover:bg-[#26364a] text-[#89ceff] font-mono text-xs border border-[#26364a] transition-all"
              title={isFr ? 'Restaurer les statistiques de démonstration' : 'Restore demo stats'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFr ? 'Restaurer Démo' : 'Restore Demo'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notice if stats have been reset */}
      {stats.questionsAnswered === 0 && (
        <div className="p-4 rounded-xl bg-[#102034] border border-[#f59e0b]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-[#d3e4fe]">
            <AlertCircle className="w-5 h-5 text-[#f59e0b] shrink-0" />
            <div>
              <span className="font-bold block text-sm text-[#f59e0b]">
                {isFr ? 'Statistiques et badges remis à zéro' : 'Statistics and badges reset to zero'}
              </span>
              <p className="text-[11px] text-[#bfc7d2] mt-0.5">
                {isFr 
                  ? 'Vos compteurs ont été réinitialisés depuis les paramètres. Lancez des quiz ou réalisez des exercices SQL pour déverrouiller vos premiers badges.' 
                  : 'Your progress was reset from settings. Complete quizzes or SQL lab exercises to unlock your first badges.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleQuickRestore}
            className="px-3 py-1.5 rounded-lg bg-[#f59e0b]/20 hover:bg-[#f59e0b]/30 text-[#f59e0b] border border-[#f59e0b]/40 font-mono font-semibold transition-all self-start sm:self-auto shrink-0"
          >
            {isFr ? 'Recharger données de démo' : 'Reload demo data'}
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Taux de Réussite Global' : 'Overall Accuracy'}
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#d3e4fe] font-sans">
              {stats.overallAccuracy}%
            </span>
            <span className="font-mono text-xs text-[#4edea3] font-semibold">
              {stats.accuracyDelta}
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#89929b]">
            {isFr ? 'Sur les 30 derniers jours' : 'Over the last 30 days'}
          </span>
        </div>

        <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Vitesse Moyenne' : 'Avg Velocity'}
            </span>
            <Clock className="w-4 h-4 text-[#93ccff]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#d3e4fe] font-sans">
              {stats.avgVelocity}
            </span>
            {stats.avgVelocity !== '--' && (
              <span className="font-mono text-xs text-[#93ccff]">/ {isFr ? 'question' : 'item'}</span>
            )}
          </div>
          <span className="font-mono text-[10px] text-[#4edea3] font-semibold">
            {stats.questionsAnswered > 0 
              ? (isFr ? '1.4x plus rapide que la moyenne' : '1.4x faster than cohort avg') 
              : (isFr ? 'Aucune session chronométrée' : 'No timed sessions')}
          </span>
        </div>

        <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Badges Débloqués' : 'Badges Unlocked'}
            </span>
            <Award className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#d3e4fe] font-sans">
              {unlockedCount}
            </span>
            <span className="font-mono text-base text-[#89929b]">/ {stats.badges.length}</span>
          </div>
          <span className="font-mono text-[10px] text-[#89929b]">
            {Math.round((unlockedCount / stats.badges.length) * 100)}% {isFr ? 'de la collection' : 'of collection completed'}
          </span>
        </div>

        <div className="bg-[#102034] p-4 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#89929b] uppercase font-semibold">
              {isFr ? 'Probabilité de Réussite' : 'Predicted Pass Probability'}
            </span>
            <TrendingUp className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#4edea3] font-sans">
              {stats.passProbability}%
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#89929b]">
            {isFr ? `Basé sur ${stats.questionsAnswered} questions résolues` : `Based on ${stats.questionsAnswered} answered items`}
          </span>
        </div>
      </div>

      {/* Response Time & Accuracy Matrix + Raw Telemetry Journal */}
      <ResponseTimeAnalyticsCard lang={lang} compact={false} />

      {/* Badges Collection Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#d3e4fe]">
            {isFr ? 'Collection des Badges DBA' : 'DBA Badge Showcase'}
          </h2>
          <span className="text-xs font-mono text-[#89ceff]">
            {unlockedCount} / {stats.badges.length} {isFr ? 'acquis' : 'earned'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.badges.map((b) => {
            const Icon = getBadgeIcon(b.iconName);
            return (
              <div
                key={b.id}
                className={`p-4 rounded-xl border shadow-md flex items-start gap-3.5 transition-all ${
                  b.unlocked
                    ? 'bg-[#102034] border-[#1b2b3f] hover:border-[#26364a]'
                    : 'bg-[#0b1c30]/50 border-[#1b2b3f] opacity-60'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                  style={{ 
                    backgroundColor: b.unlocked ? `${b.color}20` : '#1b2b3f40', 
                    border: `1px solid ${b.unlocked ? `${b.color}40` : '#1b2b3f'}` 
                  }}
                >
                  {b.unlocked ? (
                    <Icon className="w-6 h-6" style={{ color: b.color }} />
                  ) : (
                    <Lock className="w-5 h-5 text-[#89929b]" />
                  )}
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#d3e4fe]">{b.title}</span>
                    {b.unlocked && (
                      <span className="font-mono text-[9px] text-[#4edea3] bg-[#003824]/40 px-1.5 py-0.5 rounded border border-[#4edea3]/30">
                        {isFr ? 'Débloqué' : 'Unlocked'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#bfc7d2] leading-snug">
                    {isFr ? b.descFr : b.descEn}
                  </p>
                  <span className="font-mono text-[10px] text-[#89929b] mt-0.5">
                    {b.unlocked ? b.date : `${isFr ? 'Progression :' : 'Progress:'} ${b.progress || (isFr ? 'Verrouillé' : 'Locked')}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Domain Breakdown Bars */}
      <div className="bg-[#102034] p-5 rounded-xl border border-[#1b2b3f] shadow-md flex flex-col gap-4">
        <h2 className="text-base font-bold text-[#d3e4fe]">
          {isFr ? 'Répartition de Précision par Domaine Technique' : 'Domain Accuracy Breakdown'}
        </h2>

        <div className="flex flex-col gap-3">
          {stats.domainBreakdown.map((d) => (
            <div key={d.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#d3e4fe]">{d.title}</span>
                <span className="font-bold" style={{ color: d.accentColor }}>{d.percent}%</span>
              </div>
              <div className="w-full bg-[#000f21] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${d.percent}%`, backgroundColor: d.accentColor }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
