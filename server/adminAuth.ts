import fs from 'fs';
import path from 'path';
import type { NextFunction, Request, Response } from 'express';
import { getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export const DEFAULT_ADMIN_EMAIL = 'nouhailler@gmail.com';

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  emailVerified: boolean;
  disabled?: boolean;
  claims: Record<string, unknown>;
}

export interface ServerUserAccessRecord {
  exists: boolean;
  uid?: string;
  email?: string;
  role?: 'admin' | 'student' | 'auditor' | string;
  status?: 'pending' | 'approved' | 'revoked' | string;
}

export interface AuthenticatedRequest extends Request {
  firebaseUser?: VerifiedFirebaseUser;
  firebaseToken?: string;
  adminAccessRecord?: ServerUserAccessRecord;
}

export class AuthServiceUnavailableError extends Error {
  constructor(message = 'Firebase authentication service temporarily unavailable') {
    super(message);
    this.name = 'AuthServiceUnavailableError';
  }
}

export class FirestoreUnavailableError extends Error {
  constructor(message = 'Firestore access verification temporarily unavailable') {
    super(message);
    this.name = 'FirestoreUnavailableError';
  }
}

interface FirebaseAppletConfig {
  projectId?: string;
  firestoreDatabaseId?: string;
}

function loadFirebaseAppletConfig(): FirebaseAppletConfig {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(raw) as FirebaseAppletConfig;
    }
  } catch {
    // Fallback to environment variables
  }
  return {};
}

export function getFirebaseProjectConfig(): { projectId: string; firestoreDatabaseId: string } {
  const fileConfig = loadFirebaseAppletConfig();
  const projectId = (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    fileConfig.projectId ||
    ''
  ).trim();
  const firestoreDatabaseId = (
    process.env.FIRESTORE_DATABASE_ID ||
    fileConfig.firestoreDatabaseId ||
    '(default)'
  ).trim();

  return { projectId, firestoreDatabaseId };
}

let cachedAdminApp: App | null = null;

export function getFirebaseAdminApp(): App | null {
  if (cachedAdminApp) return cachedAdminApp;
  const { projectId } = getFirebaseProjectConfig();
  if (!projectId || projectId === 'remixed-project-id') {
    return null;
  }
  cachedAdminApp = getApps().length > 0 ? getApp() : initializeApp({ projectId });
  return cachedAdminApp;
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  return token.length > 0 ? token : null;
}

function isLikelyJwt(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => p.length > 0);
}

function isFirebaseInfraError(err: unknown): boolean {
  const code = String((err as { code?: string })?.code || '');
  const message = String((err as { message?: string })?.message || '').toLowerCase();
  if (
    code === 'app/network-error' ||
    code === 'app/network-timeout' ||
    code === 'auth/internal-error' ||
    code === 'UNAVAILABLE'
  ) {
    return true;
  }
  return (
    message.includes('network error') ||
    message.includes('econnrefused') ||
    message.includes('etimedout') ||
    message.includes('enotfound') ||
    message.includes('error fetching public keys') ||
    message.includes('service unavailable')
  );
}

function isIamOrCredentialError(err: unknown): boolean {
  const code = String((err as { code?: unknown })?.code || '');
  const msg = String((err as { message?: string })?.message || '').toLowerCase();
  return (
    code === '7' ||
    code === 'PERMISSION_DENIED' ||
    code === 'UNAUTHENTICATED' ||
    msg.includes('permission_denied') ||
    msg.includes('could not load the default credentials') ||
    msg.includes('unable to detect a project id') ||
    msg.includes('metadata')
  );
}

function parseFirestoreRestDoc(uid: string, json: any): ServerUserAccessRecord {
  const fields = json?.fields || {};
  return {
    exists: true,
    uid: fields.uid?.stringValue || uid,
    email: fields.email?.stringValue,
    role: fields.role?.stringValue,
    status: fields.status?.stringValue,
  };
}

export async function defaultVerifyFirebaseIdToken(token: string): Promise<VerifiedFirebaseUser> {
  if (!isLikelyJwt(token)) {
    throw new Error('INVALID_TOKEN_FORMAT');
  }

  const adminApp = getFirebaseAdminApp();
  if (!adminApp) {
    throw new AuthServiceUnavailableError('Firebase Admin SDK is not configured.');
  }

  try {
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    if (!decoded || typeof decoded.uid !== 'string' || !decoded.uid.trim()) {
      throw new Error('INVALID_TOKEN_UID');
    }
    return {
      uid: decoded.uid,
      email: typeof decoded.email === 'string' ? decoded.email : undefined,
      emailVerified: Boolean(decoded.email_verified),
      disabled: Boolean((decoded as Record<string, unknown>).disabled),
      claims: decoded as Record<string, unknown>,
    };
  } catch (err) {
    if (err instanceof AuthServiceUnavailableError) throw err;
    if (isFirebaseInfraError(err)) {
      throw new AuthServiceUnavailableError('Firebase Auth verification temporarily unavailable.');
    }
    throw err;
  }
}

export async function defaultLookupUserAccessRecord(
  uid: string,
  callerIdToken: string
): Promise<ServerUserAccessRecord> {
  const adminApp = getFirebaseAdminApp();
  const { projectId, firestoreDatabaseId } = getFirebaseProjectConfig();

  if (!adminApp || !projectId) {
    throw new FirestoreUnavailableError('Firebase project configuration unavailable.');
  }

  // 1. Try Firebase Admin Firestore (works when running with IAM permissions)
  try {
    const db =
      firestoreDatabaseId && firestoreDatabaseId !== '(default)'
        ? getFirestore(adminApp, firestoreDatabaseId)
        : getFirestore(adminApp);

    const snap = await db.collection('user_access').doc(uid).get();
    if (!snap.exists) {
      return { exists: false };
    }
    const data = snap.data() || {};
    return {
      exists: true,
      uid: String(data.uid || uid),
      email: typeof data.email === 'string' ? data.email : undefined,
      role: typeof data.role === 'string' ? data.role : undefined,
      status: typeof data.status === 'string' ? data.status : undefined,
    };
  } catch (adminErr) {
    // On Starter Tier or local env without service account IAM, fall back to
    // Firestore REST API using the caller's own verified ID token (enforced by firestore.rules).
    if (!isIamOrCredentialError(adminErr)) {
      throw new FirestoreUnavailableError('Firestore lookup failed.');
    }
  }

  // 2. Fallback: User-scoped Firestore REST API using caller's cryptographically verified ID token
  const dbSegment = encodeURIComponent(firestoreDatabaseId || '(default)');
  const docUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/${dbSegment}/documents/user_access/${encodeURIComponent(uid)}`;

  let response: globalThis.Response;
  try {
    response = await fetch(docUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${callerIdToken}`,
      },
    });
  } catch {
    throw new FirestoreUnavailableError('Unable to reach Firestore service.');
  }

  if (response.status === 404) {
    return { exists: false };
  }
  if (response.status === 401 || response.status === 403) {
    throw new FirestoreUnavailableError('Firestore denied access verification.');
  }
  if (!response.ok) {
    throw new FirestoreUnavailableError(`Firestore service returned HTTP ${response.status}.`);
  }

  const json = await response.json();
  return parseFirestoreRestDoc(uid, json);
}

export interface AdminAuthMiddlewareOptions {
  verifyIdToken?: (token: string) => Promise<VerifiedFirebaseUser>;
  lookupAccessRecord?: (uid: string, callerIdToken: string) => Promise<ServerUserAccessRecord>;
  bootstrappedAdminEmail?: string;
}

export function createAdminAuthMiddlewares(options: AdminAuthMiddlewareOptions = {}) {
  const verifyToken = options.verifyIdToken || defaultVerifyFirebaseIdToken;
  const lookupAccess = options.lookupAccessRecord || defaultLookupUserAccessRecord;
  const adminEmail = (
    options.bootstrappedAdminEmail ||
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    DEFAULT_ADMIN_EMAIL
  )
    .trim()
    .toLowerCase();

  const authenticateFirebase = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'Authentification Firebase requise (en-tête Bearer manquant).',
      });
    }

    // Rejet explicite de tout jeton local statique ou non conforme
    if (token === 'admin-local') {
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Jeton d\'authentification invalide.',
      });
    }

    try {
      const verifiedUser = await verifyToken(token);
      if (!verifiedUser || !verifiedUser.uid) {
        return res.status(401).json({
          success: false,
          code: 'INVALID_TOKEN',
          message: 'Identité Firebase invalide.',
        });
      }

      req.firebaseUser = verifiedUser;
      req.firebaseToken = token;
      return next();
    } catch (err) {
      if (err instanceof AuthServiceUnavailableError) {
        return res.status(503).json({
          success: false,
          code: 'AUTH_SERVICE_UNAVAILABLE',
          message: 'Service d\'authentification temporairement indisponible.',
        });
      }
      return res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Jeton Firebase ID invalide ou expiré.',
      });
    }
  };

  const requireAdmin = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const user = req.firebaseUser;
    const token = req.firebaseToken;

    if (!user || !token) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'Authentification Firebase requise.',
      });
    }

    if (user.disabled === true) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DISABLED',
        message: 'Accès refusé : ce compte utilisateur est désactivé.',
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Accès refusé : adresse email non vérifiée.',
      });
    }

    let accessRecord: ServerUserAccessRecord;
    try {
      accessRecord = await lookupAccess(user.uid, token);
    } catch (err) {
      if (err instanceof FirestoreUnavailableError) {
        return res.status(503).json({
          success: false,
          code: 'ACCESS_VERIFICATION_UNAVAILABLE',
          message: 'Impossible de vérifier les droits administrateur côté serveur.',
        });
      }
      return res.status(500).json({
        success: false,
        code: 'INTERNAL_AUTH_ERROR',
        message: 'Erreur interne lors du contrôle des permissions.',
      });
    }

    if (accessRecord.exists) {
      if (accessRecord.status === 'revoked') {
        return res.status(403).json({
          success: false,
          code: 'ACCESS_REVOKED',
          message: 'Accès refusé : vos privilèges ont été révoqués.',
        });
      }
      if (accessRecord.status !== 'approved') {
        return res.status(403).json({
          success: false,
          code: 'ACCESS_NOT_APPROVED',
          message: 'Accès refusé : votre compte n\'est pas approuvé.',
        });
      }
      if (accessRecord.role !== 'admin') {
        return res.status(403).json({
          success: false,
          code: 'ADMIN_ROLE_REQUIRED',
          message: 'Accès refusé : rôle administrateur requis.',
        });
      }
      req.adminAccessRecord = accessRecord;
      return next();
    }

    // Si aucun document /user_access/{uid} n'existe encore :
    // Autorisation uniquement pour l'administrateur principal vérifié ou via custom claim admin explicite.
    const normalizedEmail = (user.email || '').trim().toLowerCase();
    const hasAdminCustomClaim =
      user.claims?.admin === true && user.claims?.role === 'admin';
    const isBootstrappedAdmin =
      normalizedEmail.length > 0 && normalizedEmail === adminEmail;

    if (isBootstrappedAdmin || hasAdminCustomClaim) {
      req.adminAccessRecord = {
        exists: false,
        uid: user.uid,
        email: normalizedEmail,
        role: 'admin',
        status: 'approved',
      };
      return next();
    }

    return res.status(403).json({
      success: false,
      code: 'ADMIN_ROLE_REQUIRED',
      message: 'Accès refusé : privilèges administrateur requis.',
    });
  };

  return {
    authenticateFirebase,
    requireAdmin,
  };
}
