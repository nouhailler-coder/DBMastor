import React from 'react';
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
  Sparkles
} from 'lucide-react';
import { examDomainMatrix } from '../data/mockData';

interface StatsViewProps {
  lang: 'fr' | 'en';
}

export const StatsView: React.FC<StatsViewProps> = ({ lang }) => {
  const isFr = lang === 'fr';

  const badges = [
    {
      id: 'b1',
      title: 'DBA Consistency',
      desc: isFr ? '5 jours d\'affilée de révisions régulières' : '5 consecutive days of revision study',
      unlocked: true,
      date: isFr ? 'Obtenu le 18 Fév' : 'Unlocked Feb 18',
      icon: Flame,
      color: '#4edea3',
    },
    {
      id: 'b2',
      title: 'Window Function Master',
      desc: isFr ? '100% de réussite sur DENSE_RANK & PARTITION BY' : '100% score on DENSE_RANK & PARTITION BY',
      unlocked: true,
      date: isFr ? 'Obtenu le 15 Fév' : 'Unlocked Feb 15',
      icon: Terminal,
      color: '#93ccff',
    },
    {
      id: 'b3',
      title: 'Null Trap Survivor',
      desc: isFr ? 'A déjoué le piège NOT IN face à des NULLs 5 fois' : 'Avoided NOT IN with NULLs trap 5 times',
      unlocked: true,
      date: isFr ? 'Obtenu le 12 Fév' : 'Unlocked Feb 12',
      icon: ShieldCheck,
      color: '#89ceff',
    },
    {
      id: 'b4',
      title: 'Oracle 19c Slayer',
      desc: isFr ? 'Score supérieur à 90% sur un examen blanc officiel' : 'Score > 90% on official practice exam',
      unlocked: true,
      date: isFr ? 'Obtenu Hier' : 'Unlocked Yesterday',
      icon: Award,
      color: '#f59e0b',
    },
    {
      id: 'b5',
      title: 'Polyglot DBA',
      desc: isFr ? 'Exécuter des requêtes sur 4 dialectes différents' : 'Execute queries across 4 different SQL engines',
      unlocked: false,
      progress: '3/4 dialectes',
      icon: Database,
      color: '#89929b',
    },
    {
      id: 'b6',
      title: 'Speed Resolver',
      desc: isFr ? 'Moins de 45 secondes par question sur 30 questions' : 'Less than 45s per question on 30 questions',
      unlocked: false,
      progress: '21/30 questions',
      icon: Zap,
      color: '#89929b',
    },
  ];

  return (
    <div id="stats-view-container" className="p-6 max-w-[1720px] mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#4edea3] bg-[#003824]/40 px-2.5 py-0.5 rounded-full border border-[#4edea3]/30 font-semibold">
            {isFr ? 'Analyse de Performance' : 'Performance Analytics'}
          </span>
          <span className="text-[#89929b] font-mono text-xs">•</span>
          <span className="font-mono text-xs text-[#93ccff]">
            {isFr ? 'Cohorte Mondiale' : 'Global Cohort'}
          </span>
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
            <span className="text-3xl font-bold text-[#d3e4fe] font-sans">82.4%</span>
            <span className="font-mono text-xs text-[#4edea3] font-semibold">+3.1%</span>
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
            <span className="text-3xl font-bold text-[#d3e4fe] font-sans">1m 14s</span>
            <span className="font-mono text-xs text-[#93ccff]">/ {isFr ? 'question' : 'item'}</span>
          </div>
          <span className="font-mono text-[10px] text-[#4edea3] font-semibold">
            {isFr ? '1.4x plus rapide que la moyenne' : '1.4x faster than cohort avg'}
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
            <span className="text-3xl font-bold text-[#d3e4fe] font-sans">4</span>
            <span className="font-mono text-base text-[#89929b]">/ 6</span>
          </div>
          <span className="font-mono text-[10px] text-[#89929b]">
            67% {isFr ? 'de la collection' : 'of collection completed'}
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
            <span className="text-3xl font-bold text-[#4edea3] font-sans">94.8%</span>
          </div>
          <span className="font-mono text-[10px] text-[#89929b]">
            {isFr ? 'Basé sur 842 questions résolues' : 'Based on 842 answered items'}
          </span>
        </div>
      </div>

      {/* Badges Collection Grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-[#d3e4fe]">
          {isFr ? 'Collection des Badges DBA' : 'DBA Badge Showcase'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((b) => {
            const Icon = b.icon;
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
                  style={{ backgroundColor: `${b.color}20`, border: `1px solid ${b.color}40` }}
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
                        Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#bfc7d2] leading-snug">{b.desc}</p>
                  <span className="font-mono text-[10px] text-[#89929b] mt-0.5">
                    {b.unlocked ? b.date : `Progression: ${b.progress}`}
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
          {examDomainMatrix.map((d, i) => (
            <div key={i} className="flex flex-col gap-1">
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
