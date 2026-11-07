import React from 'react';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { Activity, TrendingUp, Clock, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AnalyticsSectionProps {
  t: LandingTranslations['analytics'];
  onOpenApp: (tab?: string) => void;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ t, onOpenApp }) => {
  const metricsList = [
    { key: 'accuracy', ...t.metrics.accuracy, icon: TrendingUp, color: 'text-[#4edea3]' },
    { key: 'streak', ...t.metrics.streak, icon: Award, color: 'text-amber-400' },
    { key: 'responseTime', ...t.metrics.responseTime, icon: Clock, color: 'text-[#38bdf8]' },
    { key: 'topicsMastered', ...t.metrics.topicsMastered, icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  return (
    <section id="analytics" className="py-24 bg-[#030a14] border-t border-[#1b2b3f] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#38bdf8] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
            {t.tag}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t.headline}
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 4 Big KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {metricsList.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.key}
                className="bg-[#0b1728]/80 border border-[#1b2b3f] rounded-2xl p-6 backdrop-blur-sm hover:border-[#38bdf8]/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
                    {metric.label}
                  </span>
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
                  {metric.value}
                </div>
                <div className="text-xs text-slate-400 leading-snug">
                  {metric.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytics Interactive Dashboard Preview Graphic */}
        <div className="bg-[#071322] border border-[#1b2b3f] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#1b2b3f]">
            <div>
              <span className="text-xs font-mono text-[#38bdf8] font-bold uppercase tracking-wider">
                Cartographie Personnelle
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                Progression et santé des compétences SQL
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onOpenApp('activity')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#38bdf8] text-xs font-mono font-bold transition-colors shrink-0 border border-[#1b2b3f] cursor-pointer"
            >
              <span>Accéder à Mon Activité</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Topic Mastery Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-medium">Projections SELECT & Scalar Functions</span>
                  <span className="text-[#4edea3] font-bold">98% • Maîtrisé</span>
                </div>
                <div className="h-2 rounded-full bg-[#0b1728] overflow-hidden">
                  <div className="h-full bg-[#4edea3] rounded-full" style={{ width: '98%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-medium">WHERE Predicates & Logique Ternaire (NULL)</span>
                  <span className="text-[#4edea3] font-bold">90% • Solide</span>
                </div>
                <div className="h-2 rounded-full bg-[#0b1728] overflow-hidden">
                  <div className="h-full bg-[#4edea3] rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-medium">GROUP BY & HAVING Post-Aggregation Filters</span>
                  <span className="text-[#38bdf8] font-bold">80% • En cours</span>
                </div>
                <div className="h-2 rounded-full bg-[#0b1728] overflow-hidden">
                  <div className="h-full bg-[#38bdf8] rounded-full" style={{ width: '80%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-medium">Jointures relationnelles (ON vs WHERE)</span>
                  <span className="text-amber-400 font-bold">60% • Fragile</span>
                </div>
                <div className="h-2 rounded-full bg-[#0b1728] overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-300 font-medium">Sous-requêtes & NOT IN avec NULL</span>
                  <span className="text-red-400 font-bold">40% • Révision SM-2 requise</span>
                </div>
                <div className="h-2 rounded-full bg-[#0b1728] overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: '40%' }} />
                </div>
              </div>
            </div>

            {/* Diagnostic Alert Box */}
            <div className="bg-[#0b1728]/80 border border-[#1b2b3f] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                <Activity className="w-4 h-4" />
                <span>ANALYSE DE PERFORMANCE PAR DOMAINE</span>
              </div>
              <h4 className="text-base font-bold text-white">
                Recommandation pour votre prochaine séance :
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Votre temps moyen sur les jointures complexes dépasse le seuil cible. Une session courte de 5 questions sur les prédicats dans la clause ON est planifiée dans votre file de révision.
              </p>
              <button
                type="button"
                onClick={() => onOpenApp('short_session_5m')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs font-mono transition-colors cursor-pointer"
              >
                Lancer la séance de révision ciblée
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
