import React, { useState } from 'react';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { HelpCircle, AlertCircle, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ProgressiveExplanationSectionProps {
  t: LandingTranslations['pedagogy'];
  onOpenApp: (tab?: string) => void;
}

export const ProgressiveExplanationSection: React.FC<ProgressiveExplanationSectionProps> = ({ t, onOpenApp }) => {
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1);

  return (
    <section id="pedagogy" className="py-24 bg-[#030a14] border-t border-[#1b2b3f] relative">
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

        {/* 3 Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Level 1 */}
          <div
            onClick={() => setActiveLevel(1)}
            className={`cursor-pointer rounded-2xl p-6 border transition-all ${
              activeLevel === 1
                ? 'bg-sky-950/40 border-[#38bdf8] shadow-lg shadow-sky-950/40 ring-1 ring-[#38bdf8]'
                : 'bg-[#0b1728]/70 border-[#1b2b3f] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-[#38bdf8]">
                {t.levels.level1.title}
              </span>
              <span className={`w-3 h-3 rounded-full ${activeLevel === 1 ? 'bg-[#38bdf8]' : 'bg-slate-700'}`} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{t.levels.level1.subtitle}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              {t.levels.level1.desc}
            </p>
            <div className="p-3 bg-[#071322] rounded-xl border border-[#1b2b3f] text-xs font-mono text-sky-300 italic">
              {t.levels.level1.quote}
            </div>
          </div>

          {/* Level 2 */}
          <div
            onClick={() => setActiveLevel(2)}
            className={`cursor-pointer rounded-2xl p-6 border transition-all ${
              activeLevel === 2
                ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500'
                : 'bg-[#0b1728]/70 border-[#1b2b3f] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-amber-400">
                {t.levels.level2.title}
              </span>
              <span className={`w-3 h-3 rounded-full ${activeLevel === 2 ? 'bg-amber-400' : 'bg-slate-700'}`} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{t.levels.level2.subtitle}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              {t.levels.level2.desc}
            </p>
            <div className="p-3 bg-[#071322] rounded-xl border border-[#1b2b3f] text-xs font-mono text-amber-300 italic">
              {t.levels.level2.quote}
            </div>
          </div>

          {/* Level 3 */}
          <div
            onClick={() => setActiveLevel(3)}
            className={`cursor-pointer rounded-2xl p-6 border transition-all ${
              activeLevel === 3
                ? 'bg-emerald-950/40 border-[#4edea3] shadow-lg shadow-emerald-950/40 ring-1 ring-[#4edea3]'
                : 'bg-[#0b1728]/70 border-[#1b2b3f] hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-[#4edea3]">
                {t.levels.level3.title}
              </span>
              <span className={`w-3 h-3 rounded-full ${activeLevel === 3 ? 'bg-[#4edea3]' : 'bg-slate-700'}`} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{t.levels.level3.subtitle}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              {t.levels.level3.desc}
            </p>
            <div className="p-3 bg-[#071322] rounded-xl border border-[#1b2b3f] text-xs font-mono text-emerald-300 italic">
              {t.levels.level3.quote}
            </div>
          </div>
        </div>

        {/* Interactive Example Demonstration Box */}
        <div className="bg-[#071322] border border-[#1b2b3f] rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#1b2b3f]">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold mb-1">
                <span>{t.sampleQuestion.label}</span>
                <span>•</span>
                <span>Examen 1Z0-071 & Entretien</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">
                {t.sampleQuestion.prompt}
              </h4>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0b1728] p-1 rounded-xl border border-[#1b2b3f] shrink-0">
              <button
                type="button"
                onClick={() => setActiveLevel(1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  activeLevel === 1 ? 'bg-[#0284c7] text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Niveau 1
              </button>
              <button
                type="button"
                onClick={() => setActiveLevel(2)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  activeLevel === 2 ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Niveau 2
              </button>
              <button
                type="button"
                onClick={() => setActiveLevel(3)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  activeLevel === 3 ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Niveau 3
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#030a14] border border-[#1b2b3f] font-mono text-xs sm:text-sm text-[#4edea3] mb-6">
            {t.sampleQuestion.sql}
          </div>

          <div className="p-4 rounded-xl bg-[#0b1728]/80 border border-[#1b2b3f] flex items-center justify-between gap-4 flex-wrap">
            <span className="text-xs text-slate-300">
              Chaque question de la banque d'exercices propose ces 3 niveaux d'assistance progressive.
            </span>
            <button
              type="button"
              onClick={() => onOpenApp('exams')}
              className="text-xs font-mono text-[#38bdf8] hover:text-[#7dd3fc] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Tester une série d'exercices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
