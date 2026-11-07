import React from 'react';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { Zap, Target, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface TrainingSessionsSectionProps {
  t: LandingTranslations['sessions'];
  onOpenApp: (tab?: string) => void;
}

export const TrainingSessionsSection: React.FC<TrainingSessionsSectionProps> = ({ t, onOpenApp }) => {
  return (
    <section id="training" className="py-24 bg-[#050c18] border-t border-[#1b2b3f] relative">
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

        {/* 2 Formats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1 — Quick Training (5 min) */}
          <div className="bg-gradient-to-b from-[#0b1728] to-[#030a14] border border-[#38bdf8]/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative flex flex-col justify-between hover:border-[#38bdf8]/60 transition-all hover:-translate-y-1 group">
            <div 
              aria-hidden="true" 
              className="absolute -top-12 -right-12 w-48 h-48 bg-[#0284c7]/10 blur-[80px] pointer-events-none rounded-full"
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-[#38bdf8] font-bold uppercase tracking-wider">
                  {t.quick.kicker}
                </span>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-sky-950 text-sky-300 border border-sky-800/70 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>5 MIN</span>
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 group-hover:text-[#38bdf8] transition-colors">
                {t.quick.title}
              </h3>

              <div className="space-y-3.5 mb-8">
                {t.quick.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#38bdf8]/10 border border-[#38bdf8]/30 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-[#38bdf8]" />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-300">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#1b2b3f]">
              <button
                type="button"
                onClick={() => onOpenApp('short_session_5m')}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#38bdf8] hover:to-[#0284c7] text-white font-bold text-sm shadow-lg shadow-[#0284c7]/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.quick.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2 — Training Session (30 min) */}
          <div className="bg-gradient-to-b from-[#0b1728] to-[#030a14] border border-[#4edea3]/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative flex flex-col justify-between hover:border-[#4edea3]/60 transition-all hover:-translate-y-1 group">
            <div 
              aria-hidden="true" 
              className="absolute -top-12 -right-12 w-48 h-48 bg-[#4edea3]/10 blur-[80px] pointer-events-none rounded-full"
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-[#4edea3] font-bold uppercase tracking-wider">
                  {t.training.kicker}
                </span>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/70 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>30 MIN</span>
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 group-hover:text-[#4edea3] transition-colors">
                {t.training.title}
              </h3>

              <div className="space-y-3.5 mb-8">
                {t.training.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#4edea3]/10 border border-[#4edea3]/30 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-[#4edea3]" />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-300">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#1b2b3f]">
              <button
                type="button"
                onClick={() => onOpenApp('short_session_30m')}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#4edea3] to-[#25a56d] hover:from-[#5eedb0] hover:to-[#2cb97b] text-[#031427] font-bold text-sm shadow-lg shadow-[#4edea3]/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.training.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
