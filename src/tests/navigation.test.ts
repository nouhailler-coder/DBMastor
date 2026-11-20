import { describe, it, expect } from 'vitest';
import { resolveLandingDestination, LANDING_DESTINATION_MAP } from '../navigation/landingDestinations';
import { PRIMARY_SPACES, getSpaceForTab, getSpaceConfig } from '../navigation/spaces';
import { NavigationTab } from '../types';

describe('5-Space Navigation & Legacy URL Compatibility', () => {
  it('defines strictly 5 primary learning spaces covering all student tabs', () => {
    expect(PRIMARY_SPACES).toHaveLength(5);
    expect(PRIMARY_SPACES.map((s) => s.id)).toEqual([
      'home',
      'learning_path',
      'training',
      'certifications',
      'progress',
    ]);

    const allStudentTabs: NavigationTab[] = [
      'dashboard',
      'syllabus',
      'glossary',
      'exams',
      'sandbox',
      'flashcards',
      'spaced_repetition',
      'cert_exam',
      'skills',
      'analytics',
      'activity',
    ];

    for (const tab of allStudentTabs) {
      const spaceId = getSpaceForTab(tab);
      expect(spaceId).not.toBeNull();
      const space = getSpaceConfig(spaceId!);
      expect(space.tabs.some((t) => t.tab === tab)).toBe(true);
    }

    expect(getSpaceForTab('access_control')).toBeNull();
  });

  it('preserves 100% compatibility with all legacy ?tab= destinations', () => {
    expect(resolveLandingDestination('sql_lab').tab).toBe('sandbox');
    expect(resolveLandingDestination('sandbox').tab).toBe('sandbox');
    expect(resolveLandingDestination('skills').tab).toBe('skills');
    expect(resolveLandingDestination('skill_map').tab).toBe('skills');
    expect(resolveLandingDestination('spaced_repetition').tab).toBe('spaced_repetition');
    expect(resolveLandingDestination('syllabus').tab).toBe('syllabus');
    expect(resolveLandingDestination('certification_tracks').tab).toBe('syllabus');
    expect(resolveLandingDestination('flashcards').tab).toBe('flashcards');
    expect(resolveLandingDestination('activity').tab).toBe('activity');
    expect(resolveLandingDestination('analytics').tab).toBe('analytics');
    expect(resolveLandingDestination('cert_exam').tab).toBe('cert_exam');
    expect(resolveLandingDestination('glossary').tab).toBe('glossary');
    expect(resolveLandingDestination('access_control').tab).toBe('access_control');

    const s5 = resolveLandingDestination('short_session_5m');
    expect(s5.tab).toBe('exams');
    expect(s5.shortSessionMode).toBe('quick_5min');

    const s30 = resolveLandingDestination('short_session_30m');
    expect(s30.tab).toBe('exams');
    expect(s30.shortSessionMode).toBe('training_30min');
  });

  it('resolves new 5-space URL aliases cleanly', () => {
    expect(resolveLandingDestination('home').tab).toBe('dashboard');
    expect(resolveLandingDestination('accueil').tab).toBe('dashboard');
    expect(resolveLandingDestination('learning_path').tab).toBe('syllabus');
    expect(resolveLandingDestination('parcours').tab).toBe('syllabus');
    expect(resolveLandingDestination('training').tab).toBe('exams');
    expect(resolveLandingDestination('entrainement').tab).toBe('exams');
    expect(resolveLandingDestination('certifications').tab).toBe('cert_exam');
    expect(resolveLandingDestination('progress').tab).toBe('skills');
    expect(resolveLandingDestination('progression').tab).toBe('skills');
  });

  it('safely falls back to dashboard for empty or unknown destinations', () => {
    expect(resolveLandingDestination(undefined).tab).toBe('dashboard');
    expect(resolveLandingDestination(null).tab).toBe('dashboard');
    expect(resolveLandingDestination('').tab).toBe('dashboard');
    expect(resolveLandingDestination('non_existent_page_12345').tab).toBe('dashboard');
  });

  it('ensures all entries in LANDING_DESTINATION_MAP target non-empty tab strings', () => {
    for (const mapping of Object.values(LANDING_DESTINATION_MAP)) {
      expect(typeof mapping.tab).toBe('string');
      expect(mapping.tab.length).toBeGreaterThan(0);
    }
  });
});
