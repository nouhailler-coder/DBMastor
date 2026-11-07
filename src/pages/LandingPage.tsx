import React, { useState, useEffect } from 'react';
import { landingTranslations, LandingLanguage } from '../i18n/landingTranslations';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { ValueProposition } from '../components/landing/ValueProposition';
import { SqlLabSection } from '../components/landing/SqlLabSection';
import { AdaptiveLearningSection } from '../components/landing/AdaptiveLearningSection';
import { TrainingSessionsSection } from '../components/landing/TrainingSessionsSection';
import { ProgressiveExplanationSection } from '../components/landing/ProgressiveExplanationSection';
import { CertificationsSection } from '../components/landing/CertificationsSection';
import { AnalyticsSection } from '../components/landing/AnalyticsSection';
import { SecuritySection } from '../components/landing/SecuritySection';
import { ScreenshotGallery } from '../components/landing/ScreenshotGallery';
import { FAQSection } from '../components/landing/FAQSection';
import { FinalCTASection } from '../components/landing/FinalCTASection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { ScreenshotLightbox, LightboxImage } from '../components/landing/ScreenshotLightbox';

import heroDashboardImg from '../assets/images/dbmastery_studio_screenshot_1790453723903.jpg';
import onboardingImg from '../assets/images/dbmastery_onboarding_screenshot_1790662834983.jpg';

interface LandingPageProps {
  onOpenApp: (tab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenApp }) => {
  const [lang, setLang] = useState<LandingLanguage>(() => {
    const saved = localStorage.getItem('dbmastery_landing_lang');
    if (saved === 'fr' || saved === 'en') return saved;
    return navigator.language.startsWith('fr') ? 'fr' : 'en';
  });

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([
    {
      src: heroDashboardImg,
      alt: 'DBMastery Studio - Interface d\'entraînement interactive',
      title: 'Tableau de Bord & Session d\'Entraînement',
      description: 'Interface d\'entraînement interactive avec minuterie cognitive, indicateur de progression et score de compétence en temps réel.',
      tag: 'Studio Dashboard'
    },
    {
      src: onboardingImg,
      alt: 'DBMastery Studio - Parcours certifiants',
      title: 'Parcours de Certification & Fiches Métier',
      description: 'Vue d\'ensemble des 4 tracks certifiants (Oracle, PostgreSQL, MySQL, Azure) avec fiches de révision et progression.',
      tag: 'Certification Tracks'
    }
  ]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleToggleLang = () => {
    const nextLang: LandingLanguage = lang === 'fr' ? 'en' : 'fr';
    setLang(nextLang);
    localStorage.setItem('dbmastery_landing_lang', nextLang);
  };

  const t = landingTranslations[lang];

  useEffect(() => {
    document.title = t.meta.title;
  }, [t.meta.title]);

  const handleExploreFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenScreenshotLightbox = (imgSrc: string, title: string, caption: string) => {
    setLightboxImages([
      {
        src: imgSrc,
        alt: title,
        title,
        description: caption,
        tag: 'Capture Authentique'
      }
    ]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#030a14] text-[#d3e4fe] font-sans selection:bg-[#3198dc]/30 selection:text-[#93ccff]">
      {/* 1. Navigation */}
      <LandingNavbar
        t={t.nav}
        lang={lang}
        onLangToggle={handleToggleLang}
        onOpenApp={onOpenApp}
      />

      {/* 2. Hero */}
      <HeroSection
        t={t.hero}
        onOpenApp={onOpenApp}
        onExploreFeatures={handleExploreFeatures}
        onOpenScreenshotLightbox={handleOpenScreenshotLightbox}
      />

      {/* 3. Value Proposition (Features) */}
      <div id="features">
        <ValueProposition
          t={t.valueProp}
          onOpenApp={onOpenApp}
        />
      </div>

      {/* 4. Interactive SQL Lab */}
      <SqlLabSection
        t={t.sqlLab}
        onOpenApp={onOpenApp}
      />

      {/* 5. Adaptive Learning (4D Skill Map) */}
      <AdaptiveLearningSection
        t={t.adaptive}
        onOpenApp={onOpenApp}
      />

      {/* 6. Smart Training Sessions */}
      <TrainingSessionsSection
        t={t.sessions}
        onOpenApp={onOpenApp}
      />

      {/* 7. Progressive Explanations (3-tier Pedagogy) */}
      <ProgressiveExplanationSection
        t={t.pedagogy}
        onOpenApp={onOpenApp}
      />

      {/* 8. Database Certifications */}
      <CertificationsSection
        t={t.certifications}
        onOpenApp={onOpenApp}
      />

      {/* 9. Personal Activity & Analytics */}
      <AnalyticsSection
        t={t.analytics}
        onOpenApp={onOpenApp}
      />

      {/* 10. Cloud Synchronization & Security */}
      <SecuritySection
        t={t.security}
        onOpenApp={onOpenApp}
      />

      {/* 11. Authentic Product Screenshots Gallery */}
      <ScreenshotGallery
        t={t.screenshots}
        onOpenApp={onOpenApp}
      />

      {/* 12. FAQ Accordion */}
      <FAQSection
        t={t.faq}
      />

      {/* 13. Final Conversion CTA */}
      <FinalCTASection
        t={t.finalCta}
        onOpenApp={onOpenApp}
      />

      {/* 14. Footer with Links & Disclaimers */}
      <LandingFooter
        t={t.footer}
        onOpenApp={onOpenApp}
      />

      {/* Screenshot Lightbox Modal */}
      <ScreenshotLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
      />
    </div>
  );
};
