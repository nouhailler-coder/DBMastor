import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PracticeExamView } from './components/PracticeExamView';
import { SqlLabView } from './components/SqlLabView';
import { StudySheetsView } from './components/StudySheetsView';
import { FlashcardsView } from './components/FlashcardsView';
import { StatsView } from './components/StatsView';
import { ExamSummaryModal } from './components/ExamSummaryModal';
import { NavigationTab, CertificationTrackId } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedCert, setSelectedCert] = useState<CertificationTrackId>('oracle-1z0-071');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [searchQuery, setSearchQuery] = useState('');
  const [examModalScore, setExamModalScore] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('dbmastery_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const handleLangToggle = () => {
    setLang((prev) => (prev === 'fr' ? 'en' : 'fr'));
  };

  const handleThemeToggle = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('dbmastery_theme', next);
      return next;
    });
  };

  const handleFinishExam = (score: number) => {
    setExamModalScore(score);
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-200 ${
      isLight 
        ? 'theme-light bg-[#f8fafc] text-[#0f172a] selection:bg-[#0284c7]/20 selection:text-[#0284c7]' 
        : 'theme-dark bg-[#031427] text-[#d3e4fe] selection:bg-[#3198dc]/30 selection:text-[#93ccff]'
    }`}>
      {/* Fixed Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={(tab) => setCurrentTab(tab)} 
        lang={lang} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64 min-w-0">
        {/* Fixed Header */}
        <Header
          selectedCert={selectedCert}
          onCertChange={setSelectedCert}
          lang={lang}
          onLangToggle={handleLangToggle}
          onSearchQuery={setSearchQuery}
          theme={theme}
          onThemeToggle={handleThemeToggle}
        />

        {/* View Switcher Container with Top Margin for Fixed Header */}
        <main className="mt-16 flex-1 pb-16 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectTrack={(id) => {
                setSelectedCert(id);
              }}
              selectedCert={selectedCert}
              lang={lang}
            />
          )}

          {currentTab === 'exams' && (
            <PracticeExamView
              lang={lang}
              onFinishExam={handleFinishExam}
            />
          )}

          {currentTab === 'sandbox' && (
            <SqlLabView
              lang={lang}
            />
          )}

          {currentTab === 'syllabus' && (
            <StudySheetsView
              selectedCert={selectedCert}
              onCertChange={setSelectedCert}
              onNavigate={(tab) => setCurrentTab(tab)}
              lang={lang}
            />
          )}

          {currentTab === 'flashcards' && (
            <FlashcardsView
              onNavigate={(tab) => setCurrentTab(tab)}
              selectedCert={selectedCert}
              onCertChange={setSelectedCert}
              lang={lang}
              theme={theme}
            />
          )}

          {currentTab === 'analytics' && (
            <StatsView
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* Official Exam Completion Modal */}
      {examModalScore !== null && (
        <ExamSummaryModal
          score={examModalScore}
          isOpen={examModalScore !== null}
          onClose={() => setExamModalScore(null)}
          onReview={() => {
            setExamModalScore(null);
            setCurrentTab('exams');
          }}
          onReturnDashboard={() => {
            setExamModalScore(null);
            setCurrentTab('dashboard');
          }}
          lang={lang}
        />
      )}
    </div>
  );
}
