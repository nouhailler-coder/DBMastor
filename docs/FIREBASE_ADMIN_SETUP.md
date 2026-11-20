# Firebase Admin SDK — Guide de configuration serveur (`server/adminAuth.ts`)

Ce document décrit le fonctionnement de l'authentification et de l'autorisation côté serveur pour les routes d'administration Express (`/api/notifications/*`).

---

## 1. Principes de sécurité

1. **Vérification cryptographique des jetons ID Firebase** :
   - Chaque requête vers une route administrative exige l'en-tête HTTP :
     `Authorization: Bearer <firebase-id-token>`
   - Le jeton est vérifié côté serveur via `getAuth(adminApp).verifyIdToken(token)` (`firebase-admin/auth`).
   - La vérification d'un jeton ID ne nécessite aucun rôle IAM particulier et fonctionne sur tout projet Firebase configuré avec `projectId`.
2. **Contrôle d'administration côté serveur (`requireAdmin`)** :
   - Le serveur ne fait jamais confiance aux en-têtes client (`x-user-role`, `Origin`, `Referer`) ni aux jetons locaux statiques (`admin-local`).
   - L'utilisateur vérifié doit avoir :
     - `disabled !== true` ;
     - `email_verified === true` ;
     - un document `/user_access/{uid}` dans Firestore avec `role === 'admin'` **et** `status === 'approved'` (ou un Custom Claim explicite `admin === true && role === 'admin'`, ou l'email bootstrap configuré via `ADMIN_NOTIFICATION_EMAIL`).
3. **Fail-Closed** :
   - Absence de jeton, jeton opaque/expiré ou `admin-local` → **HTTP 401**.
   - Compte étudiant (`student`), auditeur (`auditor`), en attente (`pending`), révoqué (`revoked`) ou email non vérifié → **HTTP 403**.
   - Service Firebase Auth ou vérification Firestore indisponible → **HTTP 503** (jamais d'accès par défaut).

---

## 2. Configuration de l'application Admin SDK

Dans `server/adminAuth.ts`, l'initialisation suit le schéma :

1. Résolution de `projectId` et `firestoreDatabaseId` :
   - Variables d'environnement serveur `FIREBASE_PROJECT_ID` / `GOOGLE_CLOUD_PROJECT` et `FIRESTORE_DATABASE_ID` si définies.
   - Sinon lecture automatique de `firebase-applet-config.json`.
2. Initialisation idempotente :
   - `getApps().length > 0 ? getApp() : initializeApp({ projectId })`.
3. Lecture du profil `/user_access/{uid}` dans Firestore :
   - Si le compte de service serveur dispose des permissions IAM (`roles/datastore.viewer` ou `roles/datastore.user`), lecture directe via `getFirestore(adminApp, firestoreDatabaseId)`.
   - Sinon (ex. environnement sans clé IAM / Starter Tier), appel à l'API REST Firestore authentifié avec le jeton ID vérifié de l'appelant (`Authorization: Bearer <callerIdToken>`), soumis aux règles strictes `firestore.rules` (qui interdisent à un non-admin de s'auto-attribuer `role: 'admin'` ou `status: 'approved'`).

---

## 3. Déploiement sur un hébergeur externe (Render, Railway, Cloud Run, VPS)

- Ne jamais committer de fichier `serviceAccountKey.json` dans le dépôt Git.
- Utiliser Application Default Credentials (ADC) via IAM sur Google Cloud, ou injecter les variables d'environnement serveur via le gestionnaire de secrets de l'hébergeur :
  - `FIREBASE_PROJECT_ID`
  - `FIRESTORE_DATABASE_ID`
  - `ADMIN_NOTIFICATION_EMAIL`
  - `GOOGLE_APPLICATION_CREDENTIALS` (si nécessaire hors Google Cloud, pointant vers un fichier secret monté au runtime).
