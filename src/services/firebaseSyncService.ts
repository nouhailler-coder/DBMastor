import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  handleFirestoreError
} from '../firebase';
import {
  CertificationTrackId,
  QuestionAttemptTelemetry,
  TrapDiagnosticRecord,
  UserAccessRecord,
  UserAccessRole,
  UserAccessStatus
} from '../types';
import {
  loadUserStats,
  saveUserStats,
  normalizeSqlTopic,
  initialTopicResponseStats
} from './statsService';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'nouhailler@gmail.com';

const ALLOWED_CERTS: CertificationTrackId[] = [
  'oracle-1z0-071',
  'azure-dp-900',
  'azure-dp-800',
  'postgres-edb',
  'mysql-80-dba',
];

const ALLOWED_ROLES: UserAccessRole[] = ['admin', 'student', 'auditor'];
const ALLOWED_STATUSES: UserAccessStatus[] = ['pending', 'approved', 'revoked'];

export function sanitizeId(raw: string, fallback = 'item_1'): string {
  const cleaned = (raw || fallback).replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  return cleaned.length > 0 ? cleaned : fallback;
}

function clampString(val: string, maxLen: number, fallback = 'N/A'): string {
  const trimmed = (val || fallback).trim();
  const nonEmpty = trimmed.length > 0 ? trimmed : fallback;
  return nonEmpty.slice(0, maxLen);
}

function clampNumber(val: number, min: number, max: number): number {
  if (typeof val !== 'number' || Number.isNaN(val)) return min;
  return Math.max(min, Math.min(max, val));
}

export function isUserBootstrappedAdmin(user: User | null | undefined): boolean {
  if (!user || !user.emailVerified || !user.email) return false;
  return user.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
}

function parseAccessDoc(uid: string, d: Record<string, any>): UserAccessRecord {
  const createdIso =
    d.createdAt && typeof d.createdAt.toDate === 'function'
      ? d.createdAt.toDate().toISOString()
      : new Date().toISOString();
  const updatedIso =
    d.updatedAt && typeof d.updatedAt.toDate === 'function'
      ? d.updatedAt.toDate().toISOString()
      : createdIso;

  const role: UserAccessRole = ALLOWED_ROLES.includes(d.role) ? d.role : 'student';
  const status: UserAccessStatus = ALLOWED_STATUSES.includes(d.status) ? d.status : 'pending';

  return {
    uid: String(d.uid || uid),
    email: String(d.email || 'unknown@example.com'),
    displayName: String(d.displayName || 'Apprenant DBA'),
    role,
    status,
    accessReason: String(d.accessReason || 'Accès DBMastery Studio'),
    createdAt: createdIso,
    updatedAt: updatedIso,
  };
}

/**
 * S'assure que l'enregistrement de contrôle d'accès `/user_access/{userId}` existe.
 * - Si l'utilisateur est l'administrateur (`nouhailler@gmail.com`), crée son accès avec `role: 'admin'` et `status: 'approved'`.
 * - Sinon, crée une demande d'accès avec `role: 'student'` et `status: 'pending'`.
 */
export async function ensureUserAccessInFirestore(
  user: User,
  customReason?: string
): Promise<UserAccessRecord | null> {
  if (!user || !user.emailVerified || !user.email) return null;

  const uid = sanitizeId(user.uid, 'user_default');
  const accessPath = `user_access/${uid}`;
  const accessRef = doc(db, 'user_access', uid);

  let existingSnap;
  try {
    existingSnap = await getDoc(accessRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, accessPath);
  }

  if (existingSnap && existingSnap.exists()) {
    return parseAccessDoc(uid, existingSnap.data());
  }

  // Vérifier si l'administrateur a déjà pré-autorisé cet email dans /user_access
  let preApprovedRecord: UserAccessRecord | null = null;
  try {
    const emailQ = query(collection(db, 'user_access'), where('email', '==', user.email));
    const emailSnap = await getDocs(emailQ);
    emailSnap.forEach((docSnap) => {
      const parsed = parseAccessDoc(docSnap.id, docSnap.data());
      if (parsed.status === 'approved' || !preApprovedRecord) {
        preApprovedRecord = parsed;
      }
    });
  } catch {
    // Continuer la création standard si la requête par email n'aboutit pas
  }

  const isAdminUser = isUserBootstrappedAdmin(user);
  const email = clampString(user.email, 160, 'student@example.com');
  const displayName = clampString(
    user.displayName || user.email.split('@')[0] || 'Apprenant DBA',
    100,
    'Apprenant DBA'
  );
  const role: UserAccessRole = isAdminUser ? 'admin' : 'student';
  const status: UserAccessStatus = isAdminUser ? 'approved' : 'pending';
  const accessReason = clampString(
    customReason ||
      (isAdminUser
        ? 'Compte Administrateur Principal (Bootstrapped Admin)'
        : 'Demande d\'accès initiale suite à connexion Google'),
    240,
    'Demande d\'accès'
  );

  try {
    await setDoc(accessRef, {
      uid,
      email,
      displayName,
      role,
      status,
      accessReason,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, accessPath);
  }

  if (preApprovedRecord && (preApprovedRecord as UserAccessRecord).status === 'approved') {
    return {
      ...(preApprovedRecord as UserAccessRecord),
      uid,
    };
  }

  const nowIso = new Date().toISOString();
  return {
    uid,
    email,
    displayName,
    role,
    status,
    accessReason,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

/**
 * Écoute en temps réel (onSnapshot) le document `/user_access/{uid}` de l'utilisateur connecté
 */
export function subscribeToOwnAccessRecord(
  user: User,
  onUpdate: (record: UserAccessRecord | null) => void
): Unsubscribe {
  if (!user || !user.emailVerified) {
    onUpdate(null);
    return () => {};
  }

  const uid = sanitizeId(user.uid, 'user_default');
  const accessPath = `user_access/${uid}`;
  const accessRef = doc(db, 'user_access', uid);

  return onSnapshot(
    accessRef,
    (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      onUpdate(parseAccessDoc(uid, snap.data()));
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, accessPath);
    }
  );
}

/**
 * Écoute en temps réel (onSnapshot) tous les documents `/user_access` (Réservé à l'Administrateur)
 */
export function subscribeToAllUserAccessRecords(
  user: User,
  onUpdate: (records: UserAccessRecord[]) => void
): Unsubscribe {
  if (!isUserBootstrappedAdmin(user)) {
    return () => {};
  }

  const accessCollectionPath = 'user_access';
  const accessColRef = collection(db, 'user_access');

  return onSnapshot(
    accessColRef,
    (snapshot) => {
      const list: UserAccessRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push(parseAccessDoc(docSnap.id, docSnap.data()));
      });

      // Si un email a été pré-approuvé par l'admin (ex: email_...) et qu'un compte réel se connecte avec ce même email en 'pending', propager l'approbation
      const approvedEmails = new Set(
        list
          .filter((r) => r.status === 'approved')
          .map((r) => r.email.trim().toLowerCase())
      );
      list.forEach((rec) => {
        if (
          rec.status === 'pending' &&
          approvedEmails.has(rec.email.trim().toLowerCase())
        ) {
          adminUpsertUserAccess({
            uid: rec.uid,
            email: rec.email,
            displayName: rec.displayName,
            role: rec.role,
            status: 'approved',
            accessReason: 'Email pré-validé par l\'administrateur (Synchronisation auto)',
          }).catch(() => {});
        }
      });

      list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, accessCollectionPath);
    }
  );
}

/**
 * Créer ou mettre à jour un enregistrement `/user_access/{uid}` en tant qu'Administrateur
 */
export async function adminUpsertUserAccess(params: {
  uid: string;
  email: string;
  displayName: string;
  role: UserAccessRole;
  status: UserAccessStatus;
  accessReason: string;
}): Promise<void> {
  const uid = sanitizeId(params.uid, 'user_1');
  const accessPath = `user_access/${uid}`;
  const accessRef = doc(db, 'user_access', uid);

  let existsSnap = false;
  try {
    const snap = await getDoc(accessRef);
    existsSnap = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, accessPath);
  }

  const email = clampString(params.email, 160, 'user@example.com');
  const displayName = clampString(params.displayName, 100, 'Utilisateur');
  const role: UserAccessRole = ALLOWED_ROLES.includes(params.role) ? params.role : 'student';
  const status: UserAccessStatus = ALLOWED_STATUSES.includes(params.status)
    ? params.status
    : 'pending';
  const accessReason = clampString(params.accessReason, 240, 'Mis à jour par l\'administrateur');

  if (!existsSnap) {
    try {
      await setDoc(accessRef, {
        uid,
        email,
        displayName,
        role,
        status,
        accessReason,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, accessPath);
    }
  } else {
    try {
      await updateDoc(accessRef, {
        displayName,
        role,
        status,
        accessReason,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, accessPath);
    }
  }
}

/**
 * Supprimer un enregistrement `/user_access/{uid}` (Réservé à l'Administrateur)
 */
export async function adminDeleteUserAccess(rawUid: string): Promise<void> {
  const uid = sanitizeId(rawUid, 'user_1');
  const accessPath = `user_access/${uid}`;
  const accessRef = doc(db, 'user_access', uid);

  try {
    await deleteDoc(accessRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, accessPath);
  }
}

/**
 * Permet à un utilisateur en statut `pending` de mettre à jour son motif de demande d'accès
 */
export async function updatePendingAccessReason(
  user: User,
  displayName: string,
  accessReason: string
): Promise<void> {
  if (!user || !user.emailVerified) return;
  const uid = sanitizeId(user.uid, 'user_default');
  const accessPath = `user_access/${uid}`;
  const accessRef = doc(db, 'user_access', uid);

  try {
    await updateDoc(accessRef, {
      displayName: clampString(displayName, 100, 'Candidat DBA'),
      accessReason: clampString(accessReason, 240, 'Demande d\'accès pour révision SQL'),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, accessPath);
  }
}

/**
 * Connexion via Google Sign-In (Popup)
 */
export async function signInWithGoogle(): Promise<User | null> {
  const result = await signInWithPopup(auth, googleProvider);
  if (result.user) {
    const accessRecord = await ensureUserAccessInFirestore(result.user);
    if (accessRecord?.status === 'approved') {
      await ensureUserProfileInFirestore(result.user);
    }
  }
  return result.user;
}

/**
 * Déconnexion Firebase Auth
 */
export async function signOutFromFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * S'assure que le profil `/users/{userId}` existe dans Firestore (Master Gate)
 * avec respect strict des règles de validation `isValidUserProfile` et `isApprovedUser`
 */
export async function ensureUserProfileInFirestore(
  user: User,
  selectedCert: CertificationTrackId = 'oracle-1z0-071'
): Promise<void> {
  if (!user || !user.emailVerified) return;

  const uid = sanitizeId(user.uid, 'user_default');
  const userPath = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  let existsSnap = false;
  try {
    const snap = await getDoc(userRef);
    existsSnap = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  const localStats = loadUserStats();
  const validCert: CertificationTrackId = ALLOWED_CERTS.includes(selectedCert)
    ? selectedCert
    : 'oracle-1z0-071';
  const displayName = clampString(
    user.displayName || user.email?.split('@')[0] || 'Apprenant DBA',
    100,
    'Apprenant DBA'
  );
  const overallAccuracy = clampNumber(Math.round(localStats.overallAccuracy || 82), 0, 100);
  const questionsAnswered = clampNumber(Math.round(localStats.questionsAnswered || 842), 0, 1000000);
  const streakDays = clampNumber(Math.round(localStats.streakDays || 5), 0, 10000);

  if (!existsSnap) {
    try {
      await setDoc(userRef, {
        uid,
        displayName,
        selectedCert: validCert,
        overallAccuracy,
        questionsAnswered,
        streakDays,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  } else {
    try {
      await updateDoc(userRef, {
        displayName,
        selectedCert: validCert,
        overallAccuracy,
        questionsAnswered,
        streakDays,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  }
}

/**
 * Test réel d'écriture protégée dans `/users/{uid}` pour démontrer l'application des `firestore.rules`
 */
export async function testFirestoreProtectedWrite(
  user: User,
  selectedCert: CertificationTrackId = 'oracle-1z0-071'
): Promise<{
  allowed: boolean;
  path: string;
  timestamp: string;
  detail: string;
}> {
  const uid = sanitizeId(user.uid, 'user_default');
  const path = `/users/${uid}`;
  const timestamp = new Date().toLocaleTimeString('fr-FR');
  const userRef = doc(db, 'users', uid);

  const localStats = loadUserStats();
  const validCert: CertificationTrackId = ALLOWED_CERTS.includes(selectedCert)
    ? selectedCert
    : 'oracle-1z0-071';
  const displayName = clampString(
    user.displayName || user.email?.split('@')[0] || 'Apprenant DBA',
    100,
    'Apprenant DBA'
  );
  const overallAccuracy = clampNumber(Math.round(localStats.overallAccuracy || 82), 0, 100);
  const questionsAnswered = clampNumber(Math.round(localStats.questionsAnswered || 842), 0, 1000000);
  const streakDays = clampNumber(Math.round(localStats.streakDays || 5), 0, 10000);

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid,
        displayName,
        selectedCert: validCert,
        overallAccuracy,
        questionsAnswered,
        streakDays,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(userRef, {
        displayName,
        selectedCert: validCert,
        overallAccuracy,
        questionsAnswered,
        streakDays,
        updatedAt: serverTimestamp(),
      });
    }
    return {
      allowed: true,
      path,
      timestamp,
      detail: `ALLOWED — Écriture validée par Firestore sur ${path} (isApprovedUser == true).`,
    };
  } catch (err: any) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    return {
      allowed: false,
      path,
      timestamp,
      detail: `PERMISSION_DENIED — Rejeté par les règles Firestore sur ${path} (${rawMsg.slice(0, 140)})`,
    };
  }
}

/**
 * Persiste une tentative chronométrée dans `/users/{userId}/attempts/{attemptId}`
 */
export async function syncAttemptToFirestore(attempt: QuestionAttemptTelemetry): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;

  const uid = sanitizeId(user.uid);
  await ensureUserProfileInFirestore(user);

  const attemptId = sanitizeId(attempt.attemptId, `att_${Date.now()}`);
  const path = `users/${uid}/attempts/${attemptId}`;
  const attemptRef = doc(db, 'users', uid, 'attempts', attemptId);

  const payload = {
    attemptId,
    userId: uid,
    questionId: clampString(attempt.questionId, 128, 'q-sql-1'),
    answer: clampString(attempt.answer, 200, 'Option A'),
    isCorrect: Boolean(attempt.isCorrect),
    timeSpent: clampNumber(Math.round(attempt.timeSpent || 15), 1, 3600),
    difficulty: clampNumber(Math.round(attempt.difficulty || 3), 1, 5),
    topic: clampString(attempt.topic, 64, 'SQL'),
    hintRequested: Boolean(attempt.hintRequested),
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(attemptRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Persiste un piège de certification dans `/users/{userId}/traps/{trapId}`
 */
export async function syncTrapToFirestore(record: TrapDiagnosticRecord): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;

  const uid = sanitizeId(user.uid);
  await ensureUserProfileInFirestore(user);

  const trapId = sanitizeId(record.trapId, 'trap_sql');
  const path = `users/${uid}/traps/${trapId}`;
  const trapRef = doc(db, 'users', uid, 'traps', trapId);

  let existsSnap = false;
  try {
    const snap = await getDoc(trapRef);
    existsSnap = snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  const validMastery =
    record.masteryStatus === 'critical_alert' ||
    record.masteryStatus === 'learning' ||
    record.masteryStatus === 'mastered'
      ? record.masteryStatus
      : 'learning';

  if (!existsSnap) {
    try {
      await setDoc(trapRef, {
        trapId,
        userId: uid,
        trap: clampString(record.trap, 120, 'LEFT vs INNER JOIN'),
        topic: clampString(record.topic, 64, 'SQL'),
        subtopic: clampString(record.subtopic, 64, 'JOIN'),
        difficulty: clampNumber(Math.round(record.difficulty || 3), 1, 5),
        totalAttempts: clampNumber(Math.round(record.totalAttempts || 1), 0, 100000),
        errorCount: clampNumber(Math.round(record.errorCount || 0), 0, 100000),
        successCount: clampNumber(Math.round(record.successCount || 0), 0, 100000),
        masteryStatus: validMastery,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  } else {
    try {
      await updateDoc(trapRef, {
        trap: clampString(record.trap, 120, 'LEFT vs INNER JOIN'),
        topic: clampString(record.topic, 64, 'SQL'),
        subtopic: clampString(record.subtopic, 64, 'JOIN'),
        difficulty: clampNumber(Math.round(record.difficulty || 3), 1, 5),
        totalAttempts: clampNumber(Math.round(record.totalAttempts || 1), 0, 100000),
        errorCount: clampNumber(Math.round(record.errorCount || 0), 0, 100000),
        successCount: clampNumber(Math.round(record.successCount || 0), 0, 100000),
        masteryStatus: validMastery,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
}

/**
 * Écoute en temps réel (onSnapshot) les tentatives Firestore de l'utilisateur connecté
 */
export function subscribeToUserFirestoreData(
  user: User,
  onSyncUpdate?: (attemptsCount: number) => void
): Unsubscribe {
  if (!user || !user.emailVerified) {
    return () => {};
  }

  const uid = sanitizeId(user.uid);
  const attemptsPath = `users/${uid}/attempts`;
  const attemptsQuery = query(
    collection(db, 'users', uid, 'attempts'),
    where('userId', '==', uid)
  );

  const unsubAttempts = onSnapshot(
    attemptsQuery,
    (snapshot) => {
      if (snapshot.empty) {
        if (onSyncUpdate) onSyncUpdate(0);
        return;
      }

      const cloudAttempts: QuestionAttemptTelemetry[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const tsIso =
          d.createdAt && typeof d.createdAt.toDate === 'function'
            ? d.createdAt.toDate().toISOString()
            : new Date().toISOString();

        cloudAttempts.push({
          questionId: String(d.questionId || 'q-sql'),
          attemptId: String(d.attemptId || docSnap.id),
          answer: String(d.answer || 'Option A'),
          isCorrect: Boolean(d.isCorrect),
          timeSpent: Number(d.timeSpent || 15),
          difficulty: Number(d.difficulty || 3),
          topic: normalizeSqlTopic(String(d.topic || 'SELECT')),
          timestamp: tsIso,
          hintRequested: Boolean(d.hintRequested),
        });
      });

      cloudAttempts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      const currentStats = loadUserStats();
      const existingLogs = currentStats.attemptTelemetryLogs || [];
      const seenIds = new Set(cloudAttempts.map((a) => a.attemptId));
      const mergedLogs = [
        ...cloudAttempts,
        ...existingLogs.filter((l) => !seenIds.has(l.attemptId)),
      ].slice(0, 50);

      saveUserStats({
        ...currentStats,
        attemptTelemetryLogs: mergedLogs,
        topicResponseStats: currentStats.topicResponseStats || initialTopicResponseStats,
      });

      if (onSyncUpdate) {
        onSyncUpdate(cloudAttempts.length);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, attemptsPath);
    }
  );

  return () => {
    unsubAttempts();
  };
}

export { onAuthStateChanged };
export type { User };
