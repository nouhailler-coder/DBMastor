import React, { useState } from 'react';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { ScreenshotLightbox, LightboxImage } from './ScreenshotLightbox';
import { Maximize2, Play, Sparkles } from 'lucide-react';

import dashboardImg from '../../assets/images/dbmastery_studio_screenshot_1790453723903.jpg';
import onboardingImg from '../../assets/images/dbmastery_onboarding_screenshot_1790662834983.jpg';

interface ScreenshotGalleryProps {
  t: LandingTranslations['screenshots'];
  onOpenApp: (tab?: string) => void;
}

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ t, onOpenApp }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const imagesMap: Record<string, string> = {
    'screenshot-dashboard': dashboardImg,
    'screenshot-onboarding': onboardingImg,
    'screenshot-logo': dashboardImg, // fallback to dashboard if logo is requested
  };

  const galleryImages: LightboxImage[] = t.items.map((item) => ({
    src: imagesMap[item.id] || dashboardImg,
    alt: item.title,
    title: item.title,
    description: item.caption,
    tag: item.category,
  }));

  const handleOpenLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section id="screenshots" className="py-24 bg-[#030a14] border-t border-[#1b2b3f] relative">
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

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {galleryImages.slice(0, 2).map((img, idx) => (
            <div
              key={idx}
              onClick={() => handleOpenLightbox(idx)}
              className="group cursor-pointer bg-[#0b1728]/80 border border-[#1b2b3f] rounded-3xl overflow-hidden hover:border-[#38bdf8]/50 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#020710]">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030a14] via-transparent to-transparent opacity-60" />

                {/* Floating zoom overlay indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                  <div className="px-4 py-2 rounded-xl bg-[#0284c7] text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg">
                    <Maximize2 className="w-4 h-4" />
                    <span>{t.zoomHint}</span>
                  </div>
                </div>

                <div className="absolute top-4 left-4">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#031427]/90 text-[#38bdf8] border border-[#1b2b3f] font-bold backdrop-blur-md">
                    {img.tag}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#38bdf8] transition-colors">
                  {img.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {img.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Live Application Callout */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0284c7]/15 via-[#0b1728] to-[#4edea3]/15 border border-[#1b2b3f] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono text-[#4edea3] font-bold uppercase tracking-wider">
              Environnement Live & Interactif
            </span>
            <h4 className="text-xl font-bold text-white mt-1">
              Pratiquez directement dans votre navigateur
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Toutes les interfaces présentées sont immédiatement fonctionnelles avec le moteur de base de données in-memory AlaSQL.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenApp()}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0369a1] hover:from-[#38bdf8] hover:to-[#0284c7] text-white font-bold text-sm shadow-xl shadow-[#0284c7]/30 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          >
            Lancer l'application
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      <ScreenshotLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={galleryImages}
        currentIndex={currentIndex}
        onSelectIndex={(newIdx) => setCurrentIndex(newIdx)}
      />
    </section>
  );
};
