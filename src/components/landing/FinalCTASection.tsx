import React from 'react';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { AppLogo } from '../AppLogo';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';

interface FinalCTASectionProps {
  t: LandingTranslations['finalCta'];
  onOpenApp: (tab?: string) => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ t, onOpenApp }) => {
  return (
    <section className="py-24 bg-[#030812] border-t border-[#1b2b3f] relative overflow-hidden">
      {/* Background glow effects */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-[#0284c7]/15 via-[#4edea3]/10 to-[#38bdf8]/15 blur-[150px] pointer-events-none rounded-full"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Brand Icon */}
        <div className="flex justify-center mb-8">
          <div className="p-3 rounded-2xl bg-[#0b1728] border border-[#1b2b3f] shadow-2xl shadow-sky-950/50">
            <AppLogo size={56} className="rounded-xl shadow-inner" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 max-w-3xl mx-auto">
          {t.headline}
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button
            type="button"
            onClick={() => onOpenApp()}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0284c7] hover:from-[#38bdf8] hover:via-[#0284c7] hover:to-[#0369a1] text-white font-bold text-base shadow-xl shadow-[#0284c7]/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.primaryBtn}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onOpenApp('sandbox')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0b1728] hover:bg-[#102034] text-slate-200 hover:text-white font-bold text-base border border-[#1b2b3f] transition-all hover:border-[#38bdf8]/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-[#4edea3]" />
            <span>{t.secondaryBtn}</span>
          </button>
        </div>

        {/* Supporting note */}
        <div className="text-xs font-mono text-slate-400">
          {t.notice}
        </div>
      </div>
    </section>
  );
};
