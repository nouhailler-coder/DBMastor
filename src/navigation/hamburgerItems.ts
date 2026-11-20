import { NavigationTab } from '../types';

export type HamburgerIconKey =
  | 'home'
  | 'layout-dashboard'
  | 'compass'
  | 'brain'
  | 'shield-check'
  | 'trending-up'
  | 'terminal'
  | 'book-marked'
  | 'credit-card'
  | 'rotate-ccw'
  | 'bell';

export interface HamburgerMenuItem {
  id: string;
  action: 'landing' | 'tab';
  tab?: NavigationTab;
  dispatchEvent?: string;
  labelFr: string;
  labelEn: string;
  descFr: string;
  descEn: string;
  icon: HamburgerIconKey;
}

export interface HamburgerMenuSection {
  id: 'presentation' | 'learn' | 'tools' | 'administration';
  titleFr: string;
  titleEn: string;
  accentColor: string;
  items: HamburgerMenuItem[];
}

export function getHamburgerSections(isAdmin: boolean): HamburgerMenuSection[] {
  const sections: HamburgerMenuSection[] = [
    {
      id: 'presentation',
      titleFr: 'Présentation',
      titleEn: 'Presentation',
      accentColor: '#38bdf8',
      items: [
        {
          id: 'hamburger-item-landing',
          action: 'landing',
          labelFr: 'Présentation de DBMastor',
          labelEn: 'About DBMastor',
          descFr: 'Revenir à la présentation publique sans fermer votre session.',
          descEn: 'Return to the public landing page without signing out.',
          icon: 'home',
        },
        {
          id: 'hamburger-item-dashboard',
          action: 'tab',
          tab: 'dashboard',
          labelFr: 'Accueil de l\'application',
          labelEn: 'Application Home',
          descFr: 'Tableau de bord, reprise directe et recommandation du jour.',
          descEn: 'Dashboard, direct resume, and next recommended session.',
          icon: 'layout-dashboard',
        },
      ],
    },
    {
      id: 'learn',
      titleFr: 'Apprendre',
      titleEn: 'Learn',
      accentColor: '#4edea3',
      items: [
        {
          id: 'hamburger-item-learning-path',
          action: 'tab',
          tab: 'syllabus',
          labelFr: 'Mon parcours',
          labelEn: 'Learning Path',
          descFr: 'Fiches synthétiques, programme détaillé et notions clés.',
          descEn: 'Structured study sheets and SQL curriculum.',
          icon: 'compass',
        },
        {
          id: 'hamburger-item-training',
          action: 'tab',
          tab: 'exams',
          labelFr: 'Entraînement',
          labelEn: 'Training',
          descFr: 'Quiz adaptatifs et exercices guidés avec explications.',
          descEn: 'Adaptive quizzes and guided SQL drills with explanations.',
          icon: 'brain',
        },
        {
          id: 'hamburger-item-certifications',
          action: 'tab',
          tab: 'cert_exam',
          labelFr: 'Certifications',
          labelEn: 'Certifications',
          descFr: 'Examens blancs 60Q et préparation Oracle, PostgreSQL, MySQL, Azure.',
          descEn: 'Timed 60Q mock exams for Oracle, PostgreSQL, MySQL, and Azure.',
          icon: 'shield-check',
        },
        {
          id: 'hamburger-item-progress',
          action: 'tab',
          tab: 'skills',
          labelFr: 'Ma progression',
          labelEn: 'My Progress',
          descFr: 'Skill Map 4D, statistiques réelles, badges et historique.',
          descEn: '4D Skill Map, real accuracy stats, badges, and activity log.',
          icon: 'trending-up',
        },
      ],
    },
    {
      id: 'tools',
      titleFr: 'Outils',
      titleEn: 'Tools',
      accentColor: '#f59e0b',
      items: [
        {
          id: 'hamburger-item-sql-lab',
          action: 'tab',
          tab: 'sandbox',
          labelFr: 'SQL Lab',
          labelEn: 'SQL Lab',
          descFr: 'Exécution de requêtes SQL en direct dans le navigateur.',
          descEn: 'Run live SQL queries directly inside your browser.',
          icon: 'terminal',
        },
        {
          id: 'hamburger-item-glossary',
          action: 'tab',
          tab: 'glossary',
          labelFr: 'Glossaire',
          labelEn: 'Glossary',
          descFr: 'Index des clauses SQL, jointures, index et transactions.',
          descEn: 'Reference index of SQL clauses, joins, indexes, and locks.',
          icon: 'book-marked',
        },
        {
          id: 'hamburger-item-flashcards',
          action: 'tab',
          tab: 'flashcards',
          labelFr: 'Flashcards',
          labelEn: 'Flashcards',
          descFr: 'Cartes mémoire interactives par thème et dialecte.',
          descEn: 'Interactive active-recall flashcards by topic and dialect.',
          icon: 'credit-card',
        },
        {
          id: 'hamburger-item-spaced-repetition',
          action: 'tab',
          tab: 'spaced_repetition',
          labelFr: 'Répétition espacée',
          labelEn: 'Spaced Repetition',
          descFr: 'Révisions ciblées planifiées par l’algorithme SM-2.',
          descEn: 'Scheduled retention reviews powered by SM-2.',
          icon: 'rotate-ccw',
        },
      ],
    },
  ];

  if (isAdmin) {
    sections.push({
      id: 'administration',
      titleFr: 'Administration',
      titleEn: 'Administration',
      accentColor: '#10b981',
      items: [
        {
          id: 'hamburger-open-access-control-btn',
          action: 'tab',
          tab: 'access_control',
          labelFr: 'Contrôle d\'accès',
          labelEn: 'Access Control',
          descFr: 'Gestion des rôles, statuts et approbations utilisateurs.',
          descEn: 'Manage user roles, statuses, and access approvals.',
          icon: 'shield-check',
        },
        {
          id: 'hamburger-open-notifications-config-btn',
          action: 'tab',
          tab: 'access_control',
          dispatchEvent: 'dbmastery:open_smtp_config',
          labelFr: 'Configuration des notifications',
          labelEn: 'Notification Settings',
          descFr: 'Paramètres SMTP, tests email et historique des alertes.',
          descEn: 'SMTP settings, test delivery, and alert history.',
          icon: 'bell',
        },
      ],
    });
  }

  return sections;
}
