import { describe, it, expect } from 'vitest';
import { resolveLandingDestination, LANDING_DESTINATION_MAP } from '../navigation/landingDestinations';

describe('Landing Destinations Navigation Resolver', () => {
  it('correctly maps SQL Lab to sandbox tab', () => {
    const result = resolveLandingDestination('sql_lab');
    expect(result.tab).toBe('sandbox');
  });

  it('correctly maps sandbox to sandbox tab', () => {
    const result = resolveLandingDestination('sandbox');
    expect(result.tab).toBe('sandbox');
  });

  it('correctly maps skills and skill_map to skills tab', () => {
    expect(resolveLandingDestination('skills').tab).toBe('skills');
    expect(resolveLandingDestination('skill_map').tab).toBe('skills');
  });

  it('correctly maps spaced_repetition to spaced_repetition tab', () => {
    const result = resolveLandingDestination('spaced_repetition');
    expect(result.tab).toBe('spaced_repetition');
  });

  it('correctly maps syllabus and certification_tracks to syllabus tab', () => {
    expect(resolveLandingDestination('syllabus').tab).toBe('syllabus');
    expect(resolveLandingDestination('certification_tracks').tab).toBe('syllabus');
  });

  it('correctly maps flashcards to flashcards tab', () => {
    expect(resolveLandingDestination('flashcards').tab).toBe('flashcards');
  });

  it('correctly maps activity to activity tab', () => {
    expect(resolveLandingDestination('activity').tab).toBe('activity');
  });

  it('correctly maps short_session_5m to exams tab with quick_5min mode', () => {
    const result = resolveLandingDestination('short_session_5m');
    expect(result.tab).toBe('exams');
    expect(result.shortSessionMode).toBe('quick_5min');
  });

  it('correctly maps short_session_30m to exams tab with training_30min mode', () => {
    const result = resolveLandingDestination('short_session_30m');
    expect(result.tab).toBe('exams');
    expect(result.shortSessionMode).toBe('training_30min');
  });

  it('safely falls back to dashboard for undefined, null or empty destination', () => {
    expect(resolveLandingDestination(undefined).tab).toBe('dashboard');
    expect(resolveLandingDestination(null).tab).toBe('dashboard');
    expect(resolveLandingDestination('').tab).toBe('dashboard');
  });

  it('safely falls back to dashboard for unknown destination string', () => {
    expect(resolveLandingDestination('non_existent_page_12345').tab).toBe('dashboard');
  });

  it('ensures all keys in LANDING_DESTINATION_MAP have a valid target tab', () => {
    for (const [key, mapping] of Object.entries(LANDING_DESTINATION_MAP)) {
      expect(typeof mapping.tab).toBe('string');
      expect(mapping.tab.length).toBeGreaterThan(0);
    }
  });
});
