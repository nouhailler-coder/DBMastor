import React, { useState } from 'react';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQSectionProps {
  t: LandingTranslations['faq'];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ t }) => {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter((i) => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  return (
    <section id="faq" className="py-24 bg-[#050c18] border-t border-[#1b2b3f] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
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

        {/* Accordion List */}
        <div className="space-y-4">
          {t.items.map((faqItem, idx) => {
            const isOpen = openIndices.includes(idx);
            return (
              <div
                key={idx}
                className="bg-[#0b1728]/80 border border-[#1b2b3f] rounded-2xl overflow-hidden transition-colors hover:border-[#38bdf8]/40"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] focus-visible:ring-inset rounded-2xl cursor-pointer"
                >
                  <span className="text-base sm:text-lg font-bold text-white leading-snug">
                    {faqItem.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-[#102034] border border-[#1b2b3f] flex items-center justify-center shrink-0 text-slate-300 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#38bdf8] border-[#38bdf8]/50' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-label={faqItem.q}
                    className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-[#1b2b3f]/60 animate-fadeIn"
                  >
                    {faqItem.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
