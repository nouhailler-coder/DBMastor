/**
 * Firestore Security Rules Test Specification (Dirty Dozen Adversarial Suite + RBAC Gatekeeper)
 * Verifies that all 12 adversarial payloads defined in security_spec.md are rejected with PERMISSION_DENIED.
 */

export interface AdversarialPayloadTest {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email?: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const dirtyDozenSecurityTests: AdversarialPayloadTest[] = [
  {
    id: 1,
    name: 'Unverified Email Spoof on Profile Create',
    collectionPath: '/users/user_123',
    operation: 'create',
    auth: { uid: 'user_123', email: 'nouhailler@gmail.com', email_verified: false },
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
    name: 'Self-Approval Escalation Attack on /user_access',
    collectionPath: '/user_access/user_123',
    operation: 'create',
    auth: { uid: 'user_123', email: 'intruder@example.com', email_verified: true },
    payload: {
      uid: 'user_123',
      email: 'intruder@example.com',
      displayName: 'Intruder',
      role: 'admin',
      status: 'approved',
      accessReason: 'Trying to self-approve',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unapproved User Profile Write (status != approved)',
    collectionPath: '/users/pending_user_99',
    operation: 'create',
    auth: { uid: 'pending_user_99', email: 'pending@example.com', email_verified: true },
    payload: {
      uid: 'pending_user_99',
      displayName: 'Pending Learner',
      selectedCert: 'oracle-1z0-071',
      overallAccuracy: 80,
      questionsAnswered: 10,
      streakDays: 1,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Cross-User Access PII Read',
    collectionPath: '/user_access/victim_456',
    operation: 'get',
    auth: { uid: 'attacker_123', email: 'attacker@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
    name: 'ID Poisoning (1500-char Document ID)',
    collectionPath: `/users/user_123/attempts/${'a'.repeat(1500)}`,
    operation: 'create',
    auth: { uid: 'user_123', email_verified: true },
    payload: {},
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
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
    id: 10,
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
    id: 11,
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
    id: 12,
    name: 'Terminal State Bypass on Revoked Access',
    collectionPath: '/user_access/revoked_user_1',
    operation: 'update',
    auth: { uid: 'revoked_user_1', email: 'revoked@example.com', email_verified: true },
    payload: {
      status: 'pending',
      accessReason: 'Trying to reopen revoked account',
    },
    expectedResult: 'PERMISSION_DENIED',
  },
];
