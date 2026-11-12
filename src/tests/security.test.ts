import { describe, it, expect } from 'vitest';
import {
  DEFAULT_GATE_CONFIG,
  generateEmailValidationCode,
  verifyEmailValidationCode,
  emailToDeterministicUid,
  loadSiteGateConfig,
} from '../services/siteAccessGateService';

describe('Security & Access Gate Sanitation Tests', () => {
  it('ensures DEFAULT_GATE_CONFIG has no exposed hardcoded secret password', () => {
    expect(DEFAULT_GATE_CONFIG.sitePassword).toBe('');
    expect(DEFAULT_GATE_CONFIG.gateEnabled).toBe(false);
    expect(DEFAULT_GATE_CONFIG.requireSitePassword).toBe(false);
  });

  it('generates a deterministic email validation code based on email and custom key', () => {
    const code1 = generateEmailValidationCode('student@example.com', 'test-secret');
    const code2 = generateEmailValidationCode('student@example.com', 'test-secret');
    expect(code1).toBe(code2);
    expect(code1).toMatch(/^VAL-[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  it('verifies valid email validation codes correctly', () => {
    const email = 'candidate.dba@company.com';
    const code = generateEmailValidationCode(email);
    expect(verifyEmailValidationCode(email, code)).toBe(true);
  });

  it('rejects tampered or mismatched email validation codes', () => {
    const email = 'candidate.dba@company.com';
    expect(verifyEmailValidationCode(email, 'VAL-0000-0000')).toBe(false);
    expect(verifyEmailValidationCode('other@company.com', generateEmailValidationCode(email))).toBe(false);
    expect(verifyEmailValidationCode('', 'VAL-1234-5678')).toBe(false);
  });

  it('safely converts emails to deterministic sanitized user UIDs', () => {
    const uid = emailToDeterministicUid('Nouhailler.Coder+DBA@Domain-Cloud.org');
    expect(uid).toBe('email_nouhailler_coder_dba_at_domain-cloud_org');
    expect(uid).not.toContain('@');
    expect(uid).not.toContain('+');
  });

  it('ensures loadSiteGateConfig returns safe defaults when localStorage is empty', () => {
    const config = loadSiteGateConfig();
    expect(typeof config.gateEnabled).toBe('boolean');
    expect(typeof config.requireSitePassword).toBe('boolean');
    expect(typeof config.sitePassword).toBe('string');
  });
});
