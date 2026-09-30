import { UserAccessRecord, UserAccessRole, UserAccessStatus } from '../types';

const SITE_GATE_CONFIG_KEY = 'dbmastery_site_gate_config_v1';
const SITE_STEP1_UNLOCKED_KEY = 'dbmastery_site_step1_unlocked_v1';
const SITE_STEP2_EMAIL_SESSION_KEY = 'dbmastery_site_step2_email_session_v1';
const SITE_LOCAL_EMAIL_RECORDS_KEY = 'dbmastery_site_local_email_records_v1';

export const ENV_DEFAULT_SITE_PASSWORD: string =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_SITE_ACCESS_PASSWORD) ||
  'DBMASTERY-2026';

export interface SiteGateConfig {
  /** Active le verrouillage à l'ouverture du site (Idéal pour déploiement public Netlify) */
  gateEnabled: boolean;
  /** Étape 1 : Exiger le mot de passe général du site avant toute identification */
  requireSitePassword: boolean;
  /** Étape 2 : Exiger une adresse email validée (status === 'approved') par l'administrateur */
  requireEmailValidation: boolean;
  /** Mot de passe du site configuré par l'administrateur */
  sitePassword: string;
  /** Indice ou message d'accueil affiché sur l'écran du mot de passe */
  passwordHintFr: string;
  passwordHintEn: string;
  updatedAt: string;
}

export interface Step2EmailSession {
  email: string;
  displayName: string;
  accessReason: string;
  validatedByCode: boolean;
  submittedAt: string;
}

const DEFAULT_GATE_CONFIG: SiteGateConfig = {
  gateEnabled: true,
  requireSitePassword: true,
  requireEmailValidation: true,
  sitePassword: ENV_DEFAULT_SITE_PASSWORD,
  passwordHintFr: 'Portail privé DBMastery Studio (Hébergement Netlify)',
  passwordHintEn: 'DBMastery Studio Private Gate (Netlify Hosting)',
  updatedAt: new Date().toISOString(),
};

export function loadSiteGateConfig(): SiteGateConfig {
  try {
    const raw = localStorage.getItem(SITE_GATE_CONFIG_KEY);
    if (!raw) return DEFAULT_GATE_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      gateEnabled:
        typeof parsed.gateEnabled === 'boolean'
          ? parsed.gateEnabled
          : DEFAULT_GATE_CONFIG.gateEnabled,
      requireSitePassword:
        typeof parsed.requireSitePassword === 'boolean'
          ? parsed.requireSitePassword
          : DEFAULT_GATE_CONFIG.requireSitePassword,
      requireEmailValidation:
        typeof parsed.requireEmailValidation === 'boolean'
          ? parsed.requireEmailValidation
          : DEFAULT_GATE_CONFIG.requireEmailValidation,
      sitePassword:
        typeof parsed.sitePassword === 'string' && parsed.sitePassword.trim().length > 0
          ? parsed.sitePassword.trim()
          : DEFAULT_GATE_CONFIG.sitePassword,
      passwordHintFr:
        typeof parsed.passwordHintFr === 'string'
          ? parsed.passwordHintFr
          : DEFAULT_GATE_CONFIG.passwordHintFr,
      passwordHintEn:
        typeof parsed.passwordHintEn === 'string'
          ? parsed.passwordHintEn
          : DEFAULT_GATE_CONFIG.passwordHintEn,
      updatedAt: parsed.updatedAt || DEFAULT_GATE_CONFIG.updatedAt,
    };
  } catch {
    return DEFAULT_GATE_CONFIG;
  }
}

export function saveSiteGateConfig(config: SiteGateConfig): SiteGateConfig {
  const next: SiteGateConfig = {
    ...config,
    sitePassword: config.sitePassword.trim() || ENV_DEFAULT_SITE_PASSWORD,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(SITE_GATE_CONFIG_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
  return next;
}

export function isStep1SitePasswordUnlocked(): boolean {
  try {
    const config = loadSiteGateConfig();
    if (!config.requireSitePassword) return true;
    const saved = localStorage.getItem(SITE_STEP1_UNLOCKED_KEY);
    return saved === config.sitePassword;
  } catch {
    return false;
  }
}

export function unlockStep1WithPassword(inputPassword: string): boolean {
  const config = loadSiteGateConfig();
  const normalizedInput = inputPassword.trim();
  if (
    normalizedInput === config.sitePassword ||
    normalizedInput === ENV_DEFAULT_SITE_PASSWORD
  ) {
    try {
      localStorage.setItem(SITE_STEP1_UNLOCKED_KEY, config.sitePassword);
    } catch {
      // ignore
    }
    return true;
  }
  return false;
}

export function lockStep1SitePassword(): void {
  try {
    localStorage.removeItem(SITE_STEP1_UNLOCKED_KEY);
  } catch {
    // ignore
  }
}

/**
 * Génère un code de validation déterministe lié à une adresse email et au mot de passe du site.
 * Permet à l'administrateur de valider un email et, si l'utilisateur sur Netlify n'utilise pas Google Sign-In,
 * de lui transmettre ce code personnel qui déverrouille uniquement son adresse email.
 */
export function generateEmailValidationCode(email: string, customSitePassword?: string): string {
  const cleanEmail = (email || '').trim().toLowerCase();
  const secret = (customSitePassword || loadSiteGateConfig().sitePassword || ENV_DEFAULT_SITE_PASSWORD).trim();
  const payload = `${cleanEmail}::dbmastery_gate_v1::${secret}`;

  let h1 = 0xdeadbeef ^ payload.length;
  let h2 = 0x41c6ce57 ^ payload.length;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const part1 = ((h1 >>> 0) & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  const part2 = ((h2 >>> 0) & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return `VAL-${part1}-${part2}`;
}

export function verifyEmailValidationCode(email: string, code: string): boolean {
  if (!email || !code) return false;
  const expected = generateEmailValidationCode(email);
  return code.trim().toUpperCase() === expected.toUpperCase();
}

export function emailToDeterministicUid(email: string): string {
  const clean = (email || 'user@example.com')
    .trim()
    .toLowerCase()
    .replace(/@/g, '_at_')
    .replace(/[^a-z0-9_\-]/g, '_');
  return `email_${clean}`.slice(0, 120);
}

export function loadStep2EmailSession(): Step2EmailSession | null {
  try {
    const raw = localStorage.getItem(SITE_STEP2_EMAIL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.email !== 'string' || !parsed.email.trim()) return null;
    return {
      email: parsed.email.trim().toLowerCase(),
      displayName: parsed.displayName || parsed.email.split('@')[0] || 'Utilisateur',
      accessReason: parsed.accessReason || 'Demande d\'accès par email',
      validatedByCode: Boolean(parsed.validatedByCode),
      submittedAt: parsed.submittedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveStep2EmailSession(session: Step2EmailSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(SITE_STEP2_EMAIL_SESSION_KEY);
      return;
    }
    localStorage.setItem(
      SITE_STEP2_EMAIL_SESSION_KEY,
      JSON.stringify({
        ...session,
        email: session.email.trim().toLowerCase(),
      })
    );
  } catch {
    // ignore
  }
}

export function loadLocalEmailRecords(): UserAccessRecord[] {
  try {
    const raw = localStorage.getItem(SITE_LOCAL_EMAIL_RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalEmailRecords(records: UserAccessRecord[]): void {
  try {
    localStorage.setItem(SITE_LOCAL_EMAIL_RECORDS_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function upsertLocalEmailRecord(params: {
  email: string;
  displayName?: string;
  role?: UserAccessRole;
  status: UserAccessStatus;
  accessReason?: string;
}): UserAccessRecord {
  const cleanEmail = params.email.trim().toLowerCase();
  const uid = emailToDeterministicUid(cleanEmail);
  const nowIso = new Date().toISOString();
  const existing = loadLocalEmailRecords();
  const idx = existing.findIndex(
    (r) => r.email.toLowerCase() === cleanEmail || r.uid === uid
  );

  const record: UserAccessRecord = {
    uid: idx >= 0 ? existing[idx].uid : uid,
    email: cleanEmail,
    displayName:
      params.displayName?.trim() ||
      (idx >= 0 ? existing[idx].displayName : cleanEmail.split('@')[0] || 'Candidat'),
    role: params.role || (idx >= 0 ? existing[idx].role : 'student'),
    status: params.status,
    accessReason:
      params.accessReason?.trim() ||
      (idx >= 0
        ? existing[idx].accessReason
        : 'Demande d\'accès soumise via le portail Email'),
    createdAt: idx >= 0 ? existing[idx].createdAt : nowIso,
    updatedAt: nowIso,
  };

  const next = idx >= 0 ? existing.map((item, i) => (i === idx ? record : item)) : [record, ...existing];
  saveLocalEmailRecords(next);
  return record;
}

export function removeLocalEmailRecord(uidOrEmail: string): void {
  const target = uidOrEmail.trim().toLowerCase();
  const existing = loadLocalEmailRecords();
  saveLocalEmailRecords(
    existing.filter(
      (r) => r.uid.toLowerCase() !== target && r.email.toLowerCase() !== target
    )
  );
}
