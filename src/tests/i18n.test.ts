import { describe, it, expect } from 'vitest';
import { LANDING_TRANSLATIONS, landingTranslations } from '../i18n/landingTranslations';

describe('Internationalization (i18n) Completeness Tests', () => {
  it('exports landingTranslations alias matching LANDING_TRANSLATIONS', () => {
    expect(landingTranslations).toBe(LANDING_TRANSLATIONS);
    expect(landingTranslations.fr).toBeDefined();
    expect(landingTranslations.en).toBeDefined();
  });

  it('guarantees parity of all top-level sections between French and English', () => {
    const frKeys = Object.keys(LANDING_TRANSLATIONS.fr).sort();
    const enKeys = Object.keys(LANDING_TRANSLATIONS.en).sort();
    expect(frKeys).toEqual(enKeys);
  });

  it('verifies essential section headlines in both French and English', () => {
    const { fr, en } = LANDING_TRANSLATIONS;

    expect(fr.hero.headline).toContain('Maîtrisez SQL');
    expect(en.hero.headline).toContain('Master SQL');

    expect(fr.valueProp.headline.length).toBeGreaterThan(10);
    expect(en.valueProp.headline.length).toBeGreaterThan(10);

    expect(fr.analytics.metrics.accuracy.label).toBeDefined();
    expect(en.analytics.metrics.accuracy.label).toBeDefined();

    expect(fr.faq.items.length).toBeGreaterThan(0);
    expect(en.faq.items.length).toBe(fr.faq.items.length);
  });

  it('verifies navigation items and CTA labels in both languages', () => {
    const { fr, en } = LANDING_TRANSLATIONS;

    expect(fr.nav.features).toBe('Fonctionnalités');
    expect(en.nav.features).toBe('Features');

    expect(fr.nav.startLearning).toBe("Commencer l'entraînement");
    expect(en.nav.startLearning).toBe('Start Learning');
  });

  it('verifies certification tracks are present in both languages', () => {
    const { fr, en } = LANDING_TRANSLATIONS;

    expect(fr.certifications.tracks.oracle.name).toContain('Oracle');
    expect(en.certifications.tracks.oracle.name).toContain('Oracle');

    expect(fr.certifications.tracks.postgres.name).toContain('PostgreSQL');
    expect(en.certifications.tracks.postgres.name).toContain('PostgreSQL');
  });
});
