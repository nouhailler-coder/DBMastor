/**
 * Firestore Security Rules Test Specification (Dirty Dozen Adversarial Suite)
 * Verifies that all 12 adversarial payloads defined in security_spec.md are rejected with PERMISSION_DENIED.
 */

export interface AdversarialPayloadTest {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const dirtyDozenSecurityTests: AdversarialPayloadTest[] = [
  {
    id: 1,
    name: 'Unverified Email Spoof on Profile Create',
    collectionPath: '/users/user_123',
    operation: 'create',
    auth: { uid: 'user_123', email_verified: false },
    payload: {
      uid: 'user_123',
      displayName: 'Attacker',
      selectedCert: 'oracle-1z0-071',
      overallAccuracy: 80,
      questionsAnswered: 10,
      streakDays: 1,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Cross-User Profile Read',
    collectionPath: '/users/victim_456',
    operation: 'get',
    auth: { uid: 'attacker_123', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection (isAdmin: true)',
    collectionPath: '/users/user_123',
    operation: 'create',
    auth: { uid: 'user_123', email_verified: true },
    payload: {
      uid: 'user_123',
      displayName: 'Sarah',
      selectedCert: 'oracle-1z0-071',
      overallAccuracy: 80,
      questionsAnswered: 10,
      streakDays: 1,
      isAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Immutable UID Mutation on Profile Update',
    collectionPath: '/users/user_123',
    operation: 'update',
    auth: { uid: 'user_123', email_verified: true },
    payload: {
      uid: 'other_uid',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Client Timestamp Forgery',
    collectionPath: '/users/user_123',
    operation: 'update',
    auth: { uid: 'user_123', email_verified: true },
    payload: {
      updatedAt: '2099-01-01T00:00:00Z',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'ID Poisoning (1500-char Document ID)',
    collectionPath: `/users/user_123/attempts/${'a'.repeat(1500)}`,
    operation: 'create',
    auth: { uid: 'user_123', email_verified: true },
    payload: {},
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Orphaned Subcollection Write Without Parent User Profile',
    collectionPath: '/users/non_existent_user/attempts/att_1',
    operation: 'create',
    auth: { uid: 'non_existent_user', email_verified: true },
    payload: {
      attemptId: 'att_1',
      userId: 'non_existent_user',
      questionId: 'q1',
      answer: 'Option A',
      isCorrect: true,
      timeSpent: 15,
      difficulty: 3,
      topic: 'JOIN',
      hintRequested: false,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Value Poisoning on Update (String instead of Number)',
    collectionPath: '/users/user_123',
    operation: 'update',
    auth: { uid: 'user_123', email_verified: true },
    payload: {
      overallAccuracy: '100%',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Immutable Attempt History Tampering (Update)',
    collectionPath: '/users/user_123/attempts/att_9084',
    operation: 'update',
    auth: { uid: 'user_123', email_verified: true },
    payload: {
      isCorrect: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Cross-User Query Scraping on Attempts List',
    collectionPath: '/users/victim_456/attempts',
    operation: 'list',
    auth: { uid: 'attacker_123', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Invalid Enum on Trap Mastery Status',
    collectionPath: '/users/user_123/traps/trap_join',
    operation: 'create',
    auth: { uid: 'user_123', email_verified: true },
    payload: {
      trapId: 'trap_join',
      userId: 'user_123',
      trap: 'LEFT vs INNER JOIN',
      topic: 'SQL',
      subtopic: 'JOIN',
      difficulty: 3,
      totalAttempts: 1,
      errorCount: 0,
      successCount: 1,
      masteryStatus: 'invalid_enum_value',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'String Overflow Attack on DisplayName (>100 chars)',
    collectionPath: '/users/user_123',
    operation: 'create',
    auth: { uid: 'user_123', email_verified: true },
    payload: {
      uid: 'user_123',
      displayName: 'X'.repeat(500),
      selectedCert: 'oracle-1z0-071',
      overallAccuracy: 80,
      questionsAnswered: 10,
      streakDays: 1,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
