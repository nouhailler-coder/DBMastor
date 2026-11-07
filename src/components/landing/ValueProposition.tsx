import React from 'react';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { BookOpen, Terminal, TrendingUp, Award, ArrowRight } from 'lucide-react';

interface ValuePropositionProps {
  t: LandingTranslations['valueProp'];
  onOpenApp: (tab?: string) => void;
}

export const ValueProposition: React.FC<ValuePropositionProps> = ({ t, onOpenApp }) => {
  const cards = [
    {
      key: 'learn',
      icon: BookOpen,
      iconColor: 'text-[#38bdf8]',
      borderColor: 'border-[#38bdf8]/30',
      bgColor: 'bg-[#38bdf8]/10',
      targetTab: 'syllabus',
      data: t.cards.learn,
    },
    {
      key: 'practice',
      icon: Terminal,
      iconColor: 'text-[#4edea3]',
      borderColor: 'border-[#4edea3]/30',
      bgColor: 'bg-[#4edea3]/10',
      targetTab: 'sandbox',
      data: t.cards.practice,
    },
    {
      key: 'improve',
      icon: TrendingUp,
      iconColor: 'text-[#fbbf24]',
      borderColor: 'border-[#fbbf24]/30',
      bgColor: 'bg-[#fbbf24]/10',
      targetTab: 'exams',
      data: t.cards.improve,
    },
    {
      key: 'master',
      icon: Award,
      iconColor: 'text-[#93ccff]',
      borderColor: 'border-[#93ccff]/30',
      bgColor: 'bg-[#93ccff]/10',
      targetTab: 'cert_exam',
      data: t.cards.master,
    },
  ];

  return (
    <section id="features" className="py-20 bg-[#071322] border-y border-[#162a45] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-[#38bdf8] font-bold block mb-2">
            {t.tag}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t.headline}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#bfc7d2] leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => {
            const IconComponent = c.icon;
            return (
              <div
                key={c.key}
                className="p-6 rounded-2xl bg-[#0b1c30] border border-[#1b2b3f] hover:border-[#38bdf8]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-xl hover:shadow-[#0284c7]/10"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl ${c.bgColor} border ${c.borderColor} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                    <IconComponent className={`w-6 h-6 ${c.iconColor}`} />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight font-mono">
                    {c.data.title}
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-[#bfc7d2] leading-relaxed">
                    {c.data.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#162a45] flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-[#89929b] line-clamp-1 pr-2">
                    {c.data.detail}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenApp(c.targetTab)}
                    className="text-[#89ceff] hover:text-white flex items-center gap-1 shrink-0 font-semibold cursor-pointer group-hover:translate-x-1 transition-transform"
                    aria-label={`Accéder à ${c.data.title}`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
