import React, { useState } from 'react';
import { AppLogo } from '../AppLogo';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { Globe, ArrowRight, Menu, X, Sparkles, Terminal } from 'lucide-react';

interface LandingNavbarProps {
  t: LandingTranslations['nav'];
  lang: 'fr' | 'en';
  onLangToggle: () => void;
  onOpenApp: (tab?: string) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  t,
  lang,
  onLangToggle,
  onOpenApp,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#features', label: t.features },
    { href: '#sqllab', label: t.sqlLab },
    { href: '#adaptive', label: t.learning },
    { href: '#certifications', label: t.certifications },
    { href: '#analytics', label: t.analytics },
    { href: '#faq', label: t.faq },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#031427]/85 backdrop-blur-xl border-b border-[#1b2b3f] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Identity with official logo */}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded-xl"
        >
          <AppLogo size="md" subtitle="Studio Engine" />
        </a>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-mono font-medium text-[#bfc7d2]" aria-label="Main Navigation">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.href);
              }}
              className="px-3 py-2 rounded-lg hover:text-white hover:bg-[#102034] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#38bdf8]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right: Language switch & Primary Actions */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={onLangToggle}
            className="h-9 px-2.5 rounded-xl bg-[#0b1c30] hover:bg-[#102034] text-[#89ceff] border border-[#1b2b3f] hover:border-[#38bdf8]/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
            title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
            aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
          >
            <Globe className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="uppercase">{lang}</span>
          </button>

          {/* Secondary CTA: Open Application */}
          <button
            type="button"
            onClick={() => onOpenApp('dashboard')}
            className="hidden sm:inline-flex h-9 px-3.5 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#d3e4fe] border border-[#1b2b3f] text-xs font-mono font-semibold items-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
          >
            <span>{t.openApp}</span>
          </button>

          {/* Primary CTA: Start Learning */}
          <button
            type="button"
            onClick={() => onOpenApp('dashboard')}
            className="h-9 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-mono font-bold inline-flex items-center gap-2 shadow-md shadow-[#0284c7]/30 transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
          >
            <span>{t.startLearning}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-xl bg-[#0b1c30] text-[#89ceff] border border-[#1b2b3f] hover:bg-[#102034] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
            aria-label={mobileMenuOpen ? t.close : t.menu}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#061322] border-b border-[#1b2b3f] px-4 pt-3 pb-5 flex flex-col gap-2 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1 text-sm font-mono text-[#d3e4fe]">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className="px-3 py-2.5 rounded-lg hover:bg-[#102034] text-[#bfc7d2] hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-[#1b2b3f] flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApp('dashboard');
              }}
              className="w-full py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <span>{t.startLearning}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApp('sandbox');
              }}
              className="w-full py-2 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#89ceff] border border-[#1b2b3f] text-xs font-mono font-semibold flex items-center justify-center gap-2"
            >
              <Terminal className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{t.sqlLab}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
