import React from 'react';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { Award, ArrowRight, ShieldCheck, BookOpen, AlertTriangle } from 'lucide-react';

interface CertificationsSectionProps {
  t: LandingTranslations['certifications'];
  onOpenApp: (tab?: string) => void;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({ t, onOpenApp }) => {
  const tracksList = [
    { key: 'oracle', ...t.tracks.oracle, vendor: 'Oracle Database' },
    { key: 'azureDp900', ...t.tracks.azureDp900, vendor: 'Microsoft Azure' },
    { key: 'azureDp800', ...t.tracks.azureDp800, vendor: 'Microsoft Azure' },
    { key: 'postgres', ...t.tracks.postgres, vendor: 'PostgreSQL EDB' },
    { key: 'mysql', ...t.tracks.mysql, vendor: 'Oracle MySQL' },
  ];

  return (
    <section id="certifications" className="py-24 bg-[#050c18] border-t border-[#1b2b3f] relative">
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

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tracksList.map((track) => (
            <div
              key={track.key}
              className="bg-[#0b1728]/80 border border-[#1b2b3f] rounded-3xl p-6 sm:p-7 backdrop-blur-sm hover:border-[#38bdf8]/50 transition-all hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-[#4edea3] font-bold uppercase tracking-wider">
                    {track.vendor}
                  </span>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#102034] text-[#38bdf8] border border-[#1b2b3f] font-bold">
                    {track.code}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#38bdf8] transition-colors">
                  {track.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
                  {track.desc}
                </p>

                <div className="space-y-2 mb-6 pt-4 border-t border-[#1b2b3f]">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Domaines clés :
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {track.topics.map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#071322] text-slate-300 border border-[#1b2b3f]"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1b2b3f] flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  {track.hours}
                </span>
                <button
                  type="button"
                  onClick={() => onOpenApp('syllabus')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38bdf8] hover:text-[#7dd3fc] font-bold transition-colors cursor-pointer"
                >
                  <span>Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Non-Affiliation Legal Disclaimer */}
        <div className="p-4 rounded-2xl bg-[#0b1728]/50 border border-[#1b2b3f] max-w-4xl mx-auto flex items-start gap-3 text-xs text-slate-400">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
};
