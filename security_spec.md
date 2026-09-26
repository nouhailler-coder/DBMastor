# Security Specification — DBMastery Studio Firestore Rules

## 1. Data Invariants
1. **User Profile Ownership (`/users/{userId}`)**:
   - A `UserProfile` document can only be read, created, or updated by the authenticated user with `request.auth.uid == userId` and `request.auth.token.email_verified == true`.
   - `uid` must strictly equal `userId` and `request.auth.uid`, and is immutable on update.
   - `createdAt` must equal `request.time` on creation and is immutable on update.
   - `updatedAt` must equal `request.time` on creation and update.
   - `selectedCert` must belong to the allowed enum `['oracle-1z0-071', 'azure-dp-900', 'azure-dp-800', 'postgres-edb', 'mysql-80-dba']`.

2. **Question Attempt Telemetry (`/users/{userId}/attempts/{attemptId}`)**:
   - A `QuestionAttempt` can only exist if the parent `/users/{userId}` document exists (Master Gate).
   - `userId` must equal `request.auth.uid` and path `{userId}`.
   - `attemptId` must equal path `{attemptId}` and match `^[a-zA-Z0-9_\-]+$`.
   - Attempts are immutable audit logs (`update` and `delete` are forbidden).
   - `allow list` enforces `request.auth.uid == userId && resource.data.userId == request.auth.uid` without `get()`/`exists()` calls.

3. **Certification Trap Progress (`/users/{userId}/traps/{trapId}`)**:
   - A `TrapProgress` record can only be created or updated if the parent `/users/{userId}` document exists (Master Gate).
   - `userId` must equal `request.auth.uid` and path `{userId}` and is immutable.
   - `trapId` must equal path `{trapId}` and is immutable.
   - `masteryStatus` must be in `['critical_alert', 'learning', 'mastered']`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unverified Email Spoof**: Authenticated user with `email_verified: false` attempting to create `/users/{uid}`. -> `PERMISSION_DENIED`
2. **Cross-User Profile Read (PII/Stats Leak)**: User `userA` attempting `get` on `/users/userB`. -> `PERMISSION_DENIED`
3. **Shadow Field Injection on Profile Create**: Adding `"isAdmin": true` to `/users/{uid}`. -> `PERMISSION_DENIED`
4. **Immutable UID Mutation on Profile Update**: Updating `uid` to another user's ID. -> `PERMISSION_DENIED`
5. **Client Timestamp Forgery**: Providing a past/future `updatedAt` instead of `request.time`. -> `PERMISSION_DENIED`
6. **ID Poisoning (1.5KB Document ID)**: Creating `/users/{uid}/attempts/{1500_char_id}`. -> `PERMISSION_DENIED`
7. **Orphaned Subcollection Write**: Creating `/users/{uid}/attempts/att-1` when `/users/{uid}` does not exist. -> `PERMISSION_DENIED`
8. **Value Poisoning on Update**: Updating `overallAccuracy` with a string `"100%"` instead of a number `0..100`. -> `PERMISSION_DENIED`
9. **Unauthorized Attempt History Tampering**: Attempting to `update` or `delete` an existing `/users/{uid}/attempts/{attemptId}` record. -> `PERMISSION_DENIED`
10. **Cross-User Query Scraping on Attempts**: User `userA` running `list` on `/users/userB/attempts`. -> `PERMISSION_DENIED`
11. **Invalid Enum on Trap Mastery**: Setting `masteryStatus: "hacked"` on `/users/{uid}/traps/{trapId}`. -> `PERMISSION_DENIED`
12. **String Overflow (Denial of Wallet)**: Setting `displayName` to a 10,000-character string. -> `PERMISSION_DENIED`
