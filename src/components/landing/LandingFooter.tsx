import React from 'react';
import { LandingTranslations } from '../../i18n/landingTranslations';
import { AppLogo } from '../AppLogo';

interface LandingFooterProps {
  t: LandingTranslations['footer'];
  onOpenApp: (tab?: string) => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ t, onOpenApp }) => {
  return (
    <footer className="bg-[#02050e] border-t border-[#1b2b3f] text-slate-400 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <AppLogo size={36} className="rounded-lg" />
              <div>
                <span className="text-base font-bold text-white tracking-tight">DBMastery</span>
                <span className="text-base font-bold text-[#38bdf8]"> Studio</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              {t.desc}
            </p>

            <div className="pt-2">
              <a
                href="https://github.com/nouhailler-coder/DBMastor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0b1728] border border-[#1b2b3f] hover:border-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-mono"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>{t.github}</span>
              </a>
            </div>
          </div>

          {/* Column 1 — Product */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-4">
              {t.sections.product}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApp('dashboard')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Tableau de bord
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApp('sandbox')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Interactive SQL Lab
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApp('short_session_5m')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Entraînement 5 minutes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApp('short_session_30m')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Session d'évaluation 30m
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2 — Learning */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-4">
              {t.sections.learning}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApp('skills')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Skill Map Quadridimensionnelle
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApp('spaced_repetition')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Répétition Espacée SM-2 / FSRS
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApp('syllabus')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Fiches Synthétiques & Cours
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApp('flashcards')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Flashcards
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3 — Certifications */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-4">
              {t.sections.certifications}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApp('syllabus')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Oracle Database SQL (1Z0-071)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApp('syllabus')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  Azure Data Fundamentals (DP-900)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApp('syllabus')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  PostgreSQL Associate 16
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenApp('syllabus')}
                  className="hover:text-white transition-colors text-left cursor-pointer"
                >
                  MySQL 8.0 DBA (1Z0-908)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-8 border-t border-[#1b2b3f] space-y-4">
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-4xl">
            {t.disclaimer}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400 pt-2 font-mono">
            <div>
              © 2026 DBMastery Studio. {t.rights}
            </div>
            <div className="flex items-center gap-4">
              <span>Moteur : AlaSQL In-Memory</span>
              <span>•</span>
              <span>Architecture : React + TypeScript + Tailwind</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
