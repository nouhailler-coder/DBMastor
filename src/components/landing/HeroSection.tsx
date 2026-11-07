import React from 'react';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { Play, ArrowRight, ShieldCheck, Database, Sparkles, Terminal, Activity, Layers } from 'lucide-react';
import screenshotHero from '../../assets/images/dbmastery_studio_screenshot_1790453723903.jpg';

interface HeroSectionProps {
  t: LandingTranslations['hero'];
  onOpenApp: (tab?: string) => void;
  onExploreFeatures: () => void;
  onOpenScreenshotLightbox: (imgSrc: string, title: string, caption: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  t,
  onOpenApp,
  onExploreFeatures,
  onOpenScreenshotLightbox,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background radial glow & technical grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#0284c7]/20 via-[#38bdf8]/15 to-[#4edea3]/10 blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
        {/* Anti-slop category badge without generic pill enclosure */}
        <div className="inline-flex items-center gap-2 mb-6 font-mono text-xs uppercase tracking-widest text-[#38bdf8] font-bold">
          <Terminal className="w-3.5 h-3.5 text-[#4edea3]" />
          <span>{t.badge}</span>
          <span className="text-[#89929b]">•</span>
          <span className="text-[#d3e4fe] normal-case tracking-normal">Oracle • Azure • PostgreSQL • MySQL</span>
        </div>

        {/* Impactful Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]">
          {t.headline}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#89ceff] to-[#4edea3]">
            {t.headlineHighlight}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base lg:text-lg text-[#bfc7d2] max-w-3xl leading-relaxed">
          {t.subtitle}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onOpenApp('dashboard')}
            className="w-full sm:w-auto h-12 px-7 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-sm font-mono font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-[#0284c7]/35 transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{t.primaryCta}</span>
          </button>

          <button
            type="button"
            onClick={onExploreFeatures}
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[#0b1c30] hover:bg-[#102034] text-[#89ceff] border border-[#1b2b3f] hover:border-[#38bdf8]/40 text-sm font-mono font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
          >
            <span>{t.secondaryCta}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Supporting text */}
        <p className="mt-4 text-xs font-mono text-[#89929b]">
          {t.supportingText}
        </p>

        {/* Metrics Grid */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          <div className="p-4 rounded-xl bg-[#0b1c30]/90 border border-[#1b2b3f] text-left">
            <span className="block text-2xl font-extrabold text-[#38bdf8] font-mono">{t.metrics.questions}</span>
            <span className="text-xs text-[#89929b] font-mono mt-0.5 block">{t.metrics.questionsLabel}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#0b1c30]/90 border border-[#1b2b3f] text-left">
            <span className="block text-2xl font-extrabold text-[#4edea3] font-mono">{t.metrics.tracks}</span>
            <span className="text-xs text-[#89929b] font-mono mt-0.5 block">{t.metrics.tracksLabel}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#0b1c30]/90 border border-[#1b2b3f] text-left">
            <span className="block text-2xl font-extrabold text-[#fbbf24] font-mono">{t.metrics.engine}</span>
            <span className="text-xs text-[#89929b] font-mono mt-0.5 block">{t.metrics.engineLabel}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#0b1c30]/90 border border-[#1b2b3f] text-left">
            <span className="block text-2xl font-extrabold text-[#93ccff] font-mono">{t.metrics.mastery}</span>
            <span className="text-xs text-[#89929b] font-mono mt-0.5 block">{t.metrics.masteryLabel}</span>
          </div>
        </div>

        {/* Authentic Product Dashboard Visual */}
        <div className="mt-14 w-full max-w-5xl rounded-2xl p-2 bg-gradient-to-b from-[#1b2b3f] via-[#102034] to-[#071322] border border-[#1b2b3f] shadow-2xl shadow-[#0284c7]/20 group">
          <div className="rounded-xl overflow-hidden bg-[#031427] border border-[#1b2b3f] relative">
            {/* Top window frame bar */}
            <div className="h-9 px-4 bg-[#071322] border-b border-[#1b2b3f] flex items-center justify-between text-xs font-mono text-[#89929b]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/70"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]/70"></span>
                <span className="ml-2 text-[11px] text-[#bfc7d2]">dbmastery-studio // live-workspace</span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-[#4edea3] flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
                  Engine Online
                </span>
                <span className="hidden sm:inline text-[#89ceff]">AlaSQL v4.19</span>
              </div>
            </div>

            {/* Realistic Application Screenshot */}
            <div 
              className="relative cursor-pointer overflow-hidden"
              onClick={() => onOpenScreenshotLightbox(
                screenshotHero,
                "Tableau de Bord DBMastery Studio",
                "Vue d'ensemble authentique de l'application : Tableau de bord, Skill Map, séance du jour et métriques de rétention."
              )}
            >
              <img
                src={screenshotHero}
                alt="DBMastery Studio - Interface applicative réelle"
                className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-[1.01]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-[#031427]/10 hover:bg-[#031427]/0 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[1px]">
                <span className="px-4 py-2 rounded-xl bg-[#031427]/90 text-[#89ceff] border border-[#38bdf8]/40 text-xs font-mono font-bold shadow-lg">
                  🔍 Agrandir la capture d'écran
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
