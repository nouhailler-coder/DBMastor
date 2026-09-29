import React, { useState, useEffect } from 'react';
import {
  Zap,
  Target,
  Clock,
  Play,
  TrendingUp,
  AlertTriangle,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { ShortSessionMode } from '../data/shortSessionsData';
import { getStoredCompetencies, UserCompetency } from '../services/competencyService';

interface ShortSessionsWidgetProps {
  lang: 'fr' | 'en';
  onStartShortSession: (mode: ShortSessionMode) => void;
  compact?: boolean;
}

export const ShortSessionsWidget: React.FC<ShortSessionsWidgetProps> = ({
  lang,
  onStartShortSession,
  compact = false,
}) => {
  const isFr = lang === 'fr';
  const [competencies, setCompetencies] = useState<UserCompetency[]>(() => getStoredCompetencies());

  useEffect(() => {
    const handleUpdate = () => setCompetencies(getStoredCompetencies());
    window.addEventListener('dbmastery:competencies_updated', handleUpdate);
    return () => window.removeEventListener('dbmastery:competencies_updated', handleUpdate);
  }, []);

  const sortedWeak = [...competencies].sort((a, b) => a.currentScore - b.currentScore).slice(0, 3);
  const averageLevel =
    competencies.length > 0
      ? Math.round(competencies.reduce((acc, c) => acc + c.currentScore, 0) / competencies.length)
      : 54;

  return (
    <section
      id="short-sessions-system-section"
      aria-label={isFr ? 'Système de sessions courtes' : 'Short Training Sessions'}
      className="flex flex-col gap-3"
    >
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#4edea3]">
              {isFr ? 'Entraînement Quotidien Rapide' : 'Daily Short Sessions'}
            </span>
            <span className="text-[#89929b]" aria-hidden="true">·</span>
            <span className="text-xs text-[#bfc7d2]">
              {isFr
                ? 'Choisissez votre format selon le temps dont vous disposez'
                : 'Choose your training format based on your available time'}
            </span>
          </div>
          <div className="text-xs font-mono text-[#89929b]">
            {isFr ? 'Synchronisé avec Mon activité & Cloud Firestore' : 'Synced with My Activity & Cloud Firestore'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ============================================================
            CARTE 1 : « J'ai 5 minutes » — ⚡ Quick Training
            5 questions
            5 minutes
            Notions faibles uniquement
            [Commencer]
           ============================================================ */}
        <div
          id="short-session-card-5min"
          className="relative overflow-hidden rounded-2xl bg-[#0b1c30] border border-[#f59e0b]/40 hover:border-[#f59e0b] shadow-lg p-6 flex flex-col justify-between gap-5 transition-all group"
        >
          <div className="flex flex-col gap-4">
            {/* Header : « J'ai 5 minutes » + ⚡ Quick Training */}
            <div className="flex items-start justify-between gap-3 border-b border-[#1b2b3f] pb-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs sm:text-sm font-bold text-[#fbbf24]">
                  {isFr ? '« J\'ai 5 minutes »' : '"I have 5 minutes"'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>⚡ Quick Training</span>
                </h3>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs text-[#fbbf24] bg-[#061322] px-3 py-1.5 rounded-lg border border-[#1b2b3f]">
                <Clock className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>05:00</span>
              </div>
            </div>

            {/* Les 3 lignes exactes demandées :
                5 questions
                5 minutes
                Notions faibles uniquement
            */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-1">
                <span className="text-[11px] text-[#89929b] uppercase">
                  {isFr ? 'Volume' : 'Volume'}
                </span>
                <span className="text-base font-extrabold text-white">
                  {isFr ? '5 questions' : '5 questions'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-1">
                <span className="text-[11px] text-[#89929b] uppercase">
                  {isFr ? 'Format' : 'Duration'}
                </span>
                <span className="text-base font-extrabold text-[#fbbf24]">
                  {isFr ? '5 minutes' : '5 minutes'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-1">
                <span className="text-[11px] text-[#89929b] uppercase">
                  {isFr ? 'Ciblage' : 'Targeting'}
                </span>
                <span className="text-sm font-extrabold text-[#4edea3] leading-snug">
                  {isFr ? 'Notions faibles uniquement' : 'Weak concepts only'}
                </span>
              </div>
            </div>

            {/* Détail dynamique des notions faibles détectées */}
            <div className="px-3.5 py-2.5 rounded-xl bg-[#061322]/90 border border-[#1b2b3f] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[#89929b] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>{isFr ? 'Cibles prioritaires :' : 'Priority targets:'}</span>
              </span>
              <div className="flex items-center gap-2 text-[#d3e4fe] font-semibold">
                {sortedWeak.map((w, idx) => (
                  <React.Fragment key={w.id}>
                    {idx > 0 && <span className="text-[#89929b]" aria-hidden="true">·</span>}
                    <span>
                      {w.name} <strong className="text-[#fbbf24]">{w.currentScore}%</strong>
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Bouton [Commencer] */}
          <button
            id="start-quick-training-5m-btn"
            type="button"
            onClick={() => onStartShortSession('quick_5min')}
            className="w-full py-3.5 px-5 rounded-xl font-extrabold text-sm bg-[#f59e0b] hover:bg-[#d97706] text-[#0b1c30] shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isFr ? 'Commencer' : 'Start'}</span>
            <span className="font-mono text-xs opacity-80 ml-1">
              ({isFr ? '5 questions • 5 min' : '5 questions • 5 min'})
            </span>
          </button>
        </div>

        {/* ============================================================
            CARTE 2 : « J'ai 30 minutes » — 🎯 Training Session
            20 questions
            Difficulté progressive
            Adaptée à mon niveau
            [Commencer]
           ============================================================ */}
        <div
          id="short-session-card-30min"
          className="relative overflow-hidden rounded-2xl bg-[#0b1c30] border border-[#38bdf8]/40 hover:border-[#38bdf8] shadow-lg p-6 flex flex-col justify-between gap-5 transition-all group"
        >
          <div className="flex flex-col gap-4">
            {/* Header : « J'ai 30 minutes » + 🎯 Training Session */}
            <div className="flex items-start justify-between gap-3 border-b border-[#1b2b3f] pb-4">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs sm:text-sm font-bold text-[#38bdf8]">
                  {isFr ? '« J\'ai 30 minutes »' : '"I have 30 minutes"'}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>🎯 Training Session</span>
                </h3>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs text-[#38bdf8] bg-[#061322] px-3 py-1.5 rounded-lg border border-[#1b2b3f]">
                <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>30:00</span>
              </div>
            </div>

            {/* Les 3 lignes exactes demandées :
                20 questions
                Difficulté progressive
                Adaptée à mon niveau
            */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-1">
                <span className="text-[11px] text-[#89929b] uppercase">
                  {isFr ? 'Volume' : 'Volume'}
                </span>
                <span className="text-base font-extrabold text-white">
                  {isFr ? '20 questions' : '20 questions'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-1">
                <span className="text-[11px] text-[#89929b] uppercase">
                  {isFr ? 'Progression' : 'Ramp'}
                </span>
                <span className="text-sm font-extrabold text-[#38bdf8] leading-snug">
                  {isFr ? 'Difficulté progressive' : 'Progressive difficulty'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#061322] border border-[#1b2b3f] flex flex-col gap-1">
                <span className="text-[11px] text-[#89929b] uppercase">
                  {isFr ? 'Calibrage' : 'Calibration'}
                </span>
                <span className="text-sm font-extrabold text-[#4edea3] leading-snug">
                  {isFr ? 'Adaptée à mon niveau' : 'Adapted to my level'}
                </span>
              </div>
            </div>

            {/* Détail dynamique des 3 paliers progressifs */}
            <div className="px-3.5 py-2.5 rounded-xl bg-[#061322]/90 border border-[#1b2b3f] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[#89929b] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>{isFr ? `Calibré niveau ${averageLevel}% :` : `Calibrated level ${averageLevel}%:`}</span>
              </span>
              <div className="flex items-center gap-2 text-[#d3e4fe] font-semibold">
                <span>Q1–6 {isFr ? 'Fondamental' : 'Easy'}</span>
                <span className="text-[#89929b]" aria-hidden="true">→</span>
                <span>Q7–14 {isFr ? 'Intermédiaire' : 'Medium'}</span>
                <span className="text-[#89929b]" aria-hidden="true">→</span>
                <span className="text-[#38bdf8]">Q15–20 {isFr ? 'Avancé' : 'Hard'}</span>
              </div>
            </div>
          </div>

          {/* Bouton [Commencer] */}
          <button
            id="start-training-session-30m-btn"
            type="button"
            onClick={() => onStartShortSession('training_30min')}
            className="w-full py-3.5 px-5 rounded-xl font-extrabold text-sm bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isFr ? 'Commencer' : 'Start'}</span>
            <span className="font-mono text-xs opacity-90 ml-1">
              ({isFr ? '20 questions • 30 min' : '20 questions • 30 min'})
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
