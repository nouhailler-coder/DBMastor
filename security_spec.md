# Security Specification — DBMastery Studio Firestore Rules (with RBAC Gatekeeper)

## 1. Data Invariants
1. **Access Control Gatekeeper (`/user_access/{userId}`)**:
   - Stores RBAC role (`admin`, `student`, `auditor`) and authorization status (`pending`, `approved`, `revoked`).
   - Only the bootstrapped Administrator (`nouhailler@gmail.com` with `email_verified == true`) can create or update records with `status: 'approved'`, `status: 'revoked'`, or `role: 'admin'`.
   - Regular verified users can only self-register their own `/user_access/{userId}` with `role == 'student'` and `status == 'pending'`, and cannot self-approve or escalate privileges.
   - Read access (`get`) is isolated to `isOwner(userId)` or `isAdmin()` (PII isolation on `email`).

2. **User Profile Ownership & Approval Gate (`/users/{userId}`)**:
   - A `UserProfile` document can only be read, created, or updated by the authenticated user with `request.auth.uid == userId`, `request.auth.token.email_verified == true`, AND `isApprovedUser(userId)` (`/user_access/{userId}.data.status == 'approved'`).
   - `uid` must strictly equal `userId` and `request.auth.uid`, and is immutable on update.
   - `createdAt` must equal `request.time` on creation and is immutable on update.
   - `updatedAt` must equal `request.time` on creation and update.
   - `selectedCert` must belong to the allowed enum `['oracle-1z0-071', 'azure-dp-900', 'azure-dp-800', 'postgres-edb', 'mysql-80-dba']`.

3. **Question Attempt Telemetry (`/users/{userId}/attempts/{attemptId}`)**:
   - A `QuestionAttempt` can only exist if the parent `/users/{userId}` document exists AND `isApprovedUser(userId)` is true.
   - `userId` must equal `request.auth.uid` and path `{userId}`.
   - `attemptId` must equal path `{attemptId}` and match `^[a-zA-Z0-9_\-]+$`.
   - Attempts are immutable audit logs (`update` and `delete` are forbidden).
   - `allow list` enforces `request.auth.uid == userId && resource.data.userId == request.auth.uid` without `get()`/`exists()` calls.

4. **Certification Trap Progress (`/users/{userId}/traps/{trapId}`)**:
   - A `TrapProgress` record can only be created or updated if the parent `/users/{userId}` document exists AND `isApprovedUser(userId)` is true.
   - `userId` must equal `request.auth.uid` and path `{userId}` and is immutable.
   - `trapId` must equal path `{trapId}` and is immutable.
   - `masteryStatus` must be in `['critical_alert', 'learning', 'mastered']`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unverified Email Spoof**: Authenticated user with `email_verified: false` attempting to create `/users/{uid}` or `/user_access/{uid}`. -> `PERMISSION_DENIED`
2. **Self-Approval Escalation Attack**: Non-admin user attempting to create `/user_access/{uid}` with `status: "approved"` or `role: "admin"`. -> `PERMISSION_DENIED`
3. **Unapproved User Profile Write**: User whose `/user_access/{uid}` has `status: "pending"` or `"revoked"` attempting to write to `/users/{uid}`. -> `PERMISSION_DENIED`
4. **Cross-User Access PII Read**: Non-admin `userA` attempting `get` on `/user_access/userB`. -> `PERMISSION_DENIED`
5. **Shadow Field Injection on Profile Create**: Adding `"isAdmin": true` to `/users/{uid}`. -> `PERMISSION_DENIED`
6. **Immutable UID Mutation on Profile Update**: Updating `uid` to another user's ID. -> `PERMISSION_DENIED`
7. **Client Timestamp Forgery**: Providing a past/future `updatedAt` instead of `request.time`. -> `PERMISSION_DENIED`
8. **ID Poisoning (1.5KB Document ID)**: Creating `/users/{uid}/attempts/{1500_char_id}`. -> `PERMISSION_DENIED`
9. **Orphaned Subcollection Write**: Creating `/users/{uid}/attempts/att-1` when `/users/{uid}` does not exist. -> `PERMISSION_DENIED`
10. **Value Poisoning on Update**: Updating `overallAccuracy` with a string `"100%"` instead of a number `0..100`. -> `PERMISSION_DENIED`
11. **Unauthorized Attempt History Tampering**: Attempting to `update` or `delete` an existing `/users/{uid}/attempts/{attemptId}` record. -> `PERMISSION_DENIED`
12. **Terminal State Bypass on Revoked Access**: A user with `status: "revoked"` attempting to update `/user_access/{uid}` back to `"pending"` or `"approved"`. -> `PERMISSION_DENIED`
