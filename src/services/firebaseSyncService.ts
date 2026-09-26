import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
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
  TrapDiagnosticRecord
} from '../types';
import { loadUserStats, saveUserStats, normalizeSqlTopic, classifyPedagogicalSpeedProfile, initialTopicResponseStats } from './statsService';

const ALLOWED_CERTS: CertificationTrackId[] = [
  'oracle-1z0-071',
  'azure-dp-900',
  'azure-dp-800',
  'postgres-edb',
  'mysql-80-dba',
];

function sanitizeId(raw: string, fallback = 'item_1'): string {
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

/**
 * Connexion via Google Sign-In (Popup)
 */
export async function signInWithGoogle(): Promise<User | null> {
  const result = await signInWithPopup(auth, googleProvider);
  if (result.user) {
    await ensureUserProfileInFirestore(result.user);
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
 * avec respect strict des règles de validation `isValidUserProfile`
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
  const displayName = clampString(user.displayName || user.email?.split('@')[0] || 'Apprenant DBA', 100, 'Apprenant DBA');
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

      // Trier du plus récent au plus ancien
      cloudAttempts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

      // Fusionner avec les statistiques locales pour alimenter l'interface
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
