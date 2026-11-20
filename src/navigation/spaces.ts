import { NavigationTab } from '../types';

export type PrimarySpaceId =
  | 'home'
  | 'learning_path'
  | 'training'
  | 'certifications'
  | 'progress';

export interface SpaceSubItem {
  tab: NavigationTab;
  labelFr: string;
  labelEn: string;
  descFr: string;
  descEn: string;
}

export interface PrimarySpaceConfig {
  id: PrimarySpaceId;
  defaultTab: NavigationTab;
  labelFr: string;
  labelEn: string;
  mobileLabelFr: string;
  mobileLabelEn: string;
  tabs: SpaceSubItem[];
}

export const PRIMARY_SPACES: PrimarySpaceConfig[] = [
  {
    id: 'home',
    defaultTab: 'dashboard',
    labelFr: 'Accueil',
    labelEn: 'Home',
    mobileLabelFr: 'Accueil',
    mobileLabelEn: 'Home',
    tabs: [
      {
        tab: 'dashboard',
        labelFr: 'Vue d\'ensemble',
        labelEn: 'Overview',
        descFr: 'Reprendre votre session et suivre votre progression.',
        descEn: 'Resume your learning session and view real progress.',
      },
    ],
  },
  {
    id: 'learning_path',
    defaultTab: 'syllabus',
    labelFr: 'Mon parcours',
    labelEn: 'Learning Path',
    mobileLabelFr: 'Parcours',
    mobileLabelEn: 'Path',
    tabs: [
      {
        tab: 'syllabus',
        labelFr: 'Fiches & syllabus',
        labelEn: 'Study Sheets & Syllabus',
        descFr: 'Programme structuré et fiches techniques SQL.',
        descEn: 'Structured curriculum and SQL study sheets.',
      },
      {
        tab: 'glossary',
        labelFr: 'Glossaire SQL',
        labelEn: 'SQL Glossary',
        descFr: 'Référentiel des clauses, concepts et dialectes.',
        descEn: 'Reference index of SQL clauses, concepts, and dialects.',
      },
    ],
  },
  {
    id: 'training',
    defaultTab: 'exams',
    labelFr: 'Entraînement',
    labelEn: 'Training',
    mobileLabelFr: 'Pratique',
    mobileLabelEn: 'Train',
    tabs: [
      {
        tab: 'exams',
        labelFr: 'Quiz & apprentissage',
        labelEn: 'Adaptive Quiz',
        descFr: 'Questions progressives avec explications détaillées.',
        descEn: 'Progressive practice questions with step-by-step explanations.',
      },
      {
        tab: 'sandbox',
        labelFr: 'Lab SQL interactif',
        labelEn: 'Interactive SQL Lab',
        descFr: 'Console SQL en direct dans le navigateur.',
        descEn: 'Live SQL execution playground in the browser.',
      },
      {
        tab: 'flashcards',
        labelFr: 'Flashcards',
        labelEn: 'Flashcards',
        descFr: 'Cartes mémoire actives par thème et dialecte.',
        descEn: 'Active recall flashcards by topic and SQL dialect.',
      },
      {
        tab: 'spaced_repetition',
        labelFr: 'Répétition espacée',
        labelEn: 'Spaced Repetition',
        descFr: 'Révisions planifiées selon votre rétention SM-2.',
        descEn: 'Scheduled reviews optimized with SM-2 memory retention.',
      },
    ],
  },
  {
    id: 'certifications',
    defaultTab: 'cert_exam',
    labelFr: 'Certifications',
    labelEn: 'Certifications',
    mobileLabelFr: 'Certifs',
    mobileLabelEn: 'Certs',
    tabs: [
      {
        tab: 'cert_exam',
        labelFr: 'Examen blanc (60Q)',
        labelEn: 'Mock Exam (60Q)',
        descFr: 'Simulation chronométrée 90 min et diagnostic par piliers.',
        descEn: 'Timed 90-minute simulation with pillar breakdown.',
      },
    ],
  },
  {
    id: 'progress',
    defaultTab: 'skills',
    labelFr: 'Ma progression',
    labelEn: 'My Progress',
    mobileLabelFr: 'Progrès',
    mobileLabelEn: 'Progress',
    tabs: [
      {
        tab: 'skills',
        labelFr: 'Carte de compétences',
        labelEn: 'Skill Map',
        descFr: 'Arborescence 4D de maîtrise des concepts SQL.',
        descEn: '4D competency tree of mastered SQL concepts.',
      },
      {
        tab: 'analytics',
        labelFr: 'Statistiques & badges',
        labelEn: 'Stats & Badges',
        descFr: 'Tendances de réussite, temps moyen et distinctions.',
        descEn: 'Accuracy trends, average response time, and badges.',
      },
      {
        tab: 'activity',
        labelFr: 'Historique d\'activité',
        labelEn: 'Activity Log',
        descFr: 'Journal de vos dernières tentatives et sessions.',
        descEn: 'Detailed log of your recent attempts and sessions.',
      },
    ],
  },
];

export function getSpaceForTab(tab: NavigationTab): PrimarySpaceId | null {
  if (tab === 'access_control') return null;
  for (const space of PRIMARY_SPACES) {
    if (space.tabs.some((item) => item.tab === tab)) {
      return space.id;
    }
  }
  return 'home';
}

export function getSpaceConfig(spaceId: PrimarySpaceId): PrimarySpaceConfig {
  return PRIMARY_SPACES.find((s) => s.id === spaceId) || PRIMARY_SPACES[0];
}
