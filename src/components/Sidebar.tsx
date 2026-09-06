import React from 'react';
import { 
  LayoutDashboard, 
  FileCheck2, 
  Terminal, 
  BookOpen, 
  CreditCard,
  BarChart3, 
  Database,
  Radio
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  lang: 'fr' | 'en';
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, lang }) => {
  const isFr = lang === 'fr';

  const navItems: { id: NavigationTab; labelFr: string; labelEn: string; icon: React.ElementType }[] = [
    { id: 'dashboard', labelFr: 'Tableau de bord', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'exams', labelFr: 'Examens blancs', labelEn: 'Practice Exams', icon: FileCheck2 },
    { id: 'flashcards', labelFr: 'Flashcards (600)', labelEn: 'Flashcards (600)', icon: CreditCard },
    { id: 'sandbox', labelFr: 'Lab SQL & Pratique', labelEn: 'SQL Lab & Practice', icon: Terminal },
    { id: 'syllabus', labelFr: 'Fiches & Compétences', labelEn: 'Study Sheets & Skills', icon: BookOpen },
    { id: 'analytics', labelFr: 'Statistiques & Badges', labelEn: 'Stats & Badges', icon: BarChart3 },
  ];

  return (
    <aside 
      id="main-sidebar" 
      className="fixed left-0 top-0 h-full w-64 bg-[#0b1c30] z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-r border-[#1b2b3f]"
    >
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center gap-3 bg-[#000f21] border-b border-[#102034]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#006398] to-[#3198dc] flex items-center justify-center text-white shadow-md shadow-[#006398]/30">
            <Database className="w-5 h-5 text-[#93ccff]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-bold tracking-tight leading-none text-[#d3e4fe] flex items-center gap-1.5 font-sans">
              DBMastery
            </span>
            <span className="text-[10px] text-[#93ccff] uppercase tracking-wider font-mono font-semibold mt-0.5">
              Studio Engine
            </span>
          </div>
        </div>

        {/* Section Header */}
        <div className="px-4 py-3">
          <div className="text-[#89929b] font-mono text-[10px] uppercase tracking-wider font-semibold">
            {isFr ? 'Navigation Principale' : 'Main Navigation'}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left text-sm font-medium ${
                  isActive
                    ? 'bg-[#3198dc] text-[#002c47] font-semibold shadow-sm'
                    : 'text-[#bfc7d2] hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#002c47]' : 'text-[#93ccff]'}`} />
                <span className="truncate">{isFr ? item.labelFr : item.labelEn}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cluster Sandbox Status Footer */}
      <div className="p-3 bg-[#000f21] m-3 rounded-lg border border-[#1b2b3f] flex flex-col gap-1.5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#4edea3] uppercase font-semibold flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[#4edea3] animate-pulse" />
            Cluster Sandbox
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
        </div>
        <p className="font-mono text-[11px] text-[#89929b] leading-tight">
          {isFr ? 'v16.2 Enterprise Engine connecté. Latence 12ms.' : 'v16.2 Enterprise Engine connected. 12ms latency.'}
        </p>
      </div>
    </aside>
  );
};
