# UX & Security Redesign V2 — DBMastor / DBMastery Studio

**Date d'audit initial :** 2026-11-19  
**URL canonique cible :** `https://dbmastor.pages.dev/`  
**Environnement de travail :** `/app/applet` *(Note transparente : ce répertoire de prévisualisation n'étant pas initialisé en dépôt Git, la commande `git checkout -b fix/ux-redesign-v2` n'a pas pu être exécutée localement ; les correctifs sont appliqués directement et documentés ici.)*

---

## 1. Constats initiaux (Phase 0 — Audit du code réel)

### A. Déjà résolus avant V2
1. **Secrets exposés côté client (`src/services/siteAccessGateService.ts`)** :
   - Aucune référence à `VITE_SITE_ACCESS_PASSWORD` ni au mot de passe par défaut `DBMASTERY-2026`.
   - `DEFAULT_GATE_CONFIG.sitePassword` est vide (`''`), `gateEnabled: false`, `requireSitePassword: false`.
   - `verifySitePasswordServer()` délègue la validation au serveur (`/api/auth/verify-site-password`).
2. **Chevauchement du Header desktop (`src/components/Header.tsx`)** :
   - Déjà corrigé dans un correctif précédent (vérifié sur `1024px`–`1920px`).
3. **Centralisation initiale des destinations landing (`src/navigation/landingDestinations.ts`)** :
   - `resolveLandingDestination()` et `LANDING_DESTINATION_MAP` déjà en place avec fallback sûr vers `dashboard` et 12 tests dans `src/tests/navigation.test.ts`.
4. **Tests unitaires de base (`vitest`)** :
   - 3 fichiers existants (`security.test.ts`, `navigation.test.ts`, `i18n.test.ts`) passant sur la baseline.

### B. Problèmes confirmés restant à corriger

| Domaine | Sévérité | Constat précis dans le dépôt |
|---|---|---|
| **Sécurité API Admin (`server.ts`)** | **CRITIQUE** | `POST /api/notifications/config` accepte `token === 'admin-local' \|\| token.length > 20` et contourne l'auth si `hostname` est `localhost`/`127.0.0.1` ou si `Origin` contient `ais-dev-`/`run.app`. |
| **Routes admin non protégées (`server.ts`)** | **CRITIQUE** | `GET /api/notifications/status` (détails SMTP/email admin), `GET /api/notifications/history` (PII demandeurs + codes de validation), `POST /api/notifications/test-email`, et `GET /api/access-requests/one-click-approve` (redirection directe sans auth) n'ont pas de vérification Firebase ID Token + rôle admin serveur. |
| **Service Frontend (`src/services/notificationService.ts`)** | **CRITIQUE** | `updateNotificationConfig()`, `fetchNotificationHistory()`, `sendTestNotificationEmail()` et `fetchNotificationStatus()` n'envoient pas l'en-tête `Authorization: Bearer <Firebase_ID_Token>`. |
| **Tests sécurité serveur** | **HAUTE** | `src/tests/security.test.ts` ne teste que les helpers client (`siteAccessGateService`), zéro test sur les middlewares et endpoints Express admin. |
| **Navigation desktop (`Sidebar.tsx`)** | **HAUTE** | Expose 12 entrées plates de premier niveau simultanées (+ raccourcis bas), rendant le repérage cognitif lourd. Inclut le badge fictif `+12% SQL`. |
| **Navigation mobile (`App.tsx`, `Header.tsx`)** | **HAUTE** | Aucune barre de navigation inférieure mobile ; `<div className="pl-64">` et `<header className="left-64">` écrasent ou décalent les vues sur écrans `< 768px`. |
| **Dashboard (`DashboardView.tsx`, `statsService.ts`, `mockData.ts`, `HamburgerMenu.tsx`)** | **HAUTE** | Trop de bannières concurrentes au-dessus de l'action principale ; métriques fictives codées en dur (`127`, `81 %`, `+12 %`, `15 Mars 2025` / `March 15, 2025`, `D-22`) présentées comme des données réelles ; bloc Cloud/Sync trop proéminent. |
| **Onboarding (`OnboardingModal.tsx`)** | **MOYENNE** | Toujours figé sur l'ancien parcours 6 étapes orienté découverte de widgets (avec métriques fictives `127`, `81 %`, `+12 %` en étape 4) et force le choix d'une certification dès l'étape 1 sans objectif d'apprentissage ni option SQL pur / diagnostic différable. |
| **Design System (`src/index.css`, composants)** | **MOYENNE** | Plusieurs cartes/bannières du Dashboard et de l'Onboarding utilisent des couleurs codées en dur (dégradés sombres dans le thème clair, contrastes hétérogènes). |
| **Responsive & Accessibilité (WCAG 2.2 AA)** | **HAUTE** | Sidebar non adaptée sous `md`, modales/tableaux/SQL Lab à vérifier de `320px` à `1920px`, focus clavier et attributs `aria-*` à compléter. |
| **SEO (`index.html`, `public/`)** | **MOYENNE** | `index.html` référence encore l'ancienne URL Cloud Run (`https://ais-dev-h6eqy53fseyudxnu7jirg2-142940148904.europe-west2.run.app`) dans `canonical`, `og:url` et JSON-LD `url`, et aucun `public/robots.txt` n'est présent. |
| **Tests E2E Playwright** | **HAUTE** | `playwright` est présent dans `devDependencies`, mais sans `playwright.config.ts`, sans dossier `e2e/` ni script `test:e2e` dans `package.json`. |

---

## 2. Architecture & Choix d'implémentation prévus

### Étape 2 — Sécurisation serveur (Priorité Critique)
- Création de `server/adminAuth.ts` et extraction de l'application Express testable (`server/app.ts` / montage dans `server.ts`) :
  - Vérification cryptographique du Firebase ID Token via `firebase-admin/auth` (`getAuth(app).verifyIdToken(token)` — initialisé avec `{ projectId: firebaseConfig.projectId }`, fonctionnel sans IAM sur tout projet Firebase).
  - Double vérification côté serveur du profil `/user_access/{uid}` via :
    1. Admin SDK Firestore (`getFirestore(app, firebaseConfig.firestoreDatabaseId)`) si disponible avec IAM, ou
    2. API REST Firestore authentifiée avec le jeton ID vérifié du demandeur (protégée par `firestore.rules` qui interdit à tout non-admin d'écrire `role: 'admin'` ou `status: 'approved'`).
  - Middlewares réutilisables : `authenticateFirebase` et `requireAdmin`.
  - Refus systématique des tokens arbitraires, de `admin-local`, et suppression totale des contournements par `Origin`, `Referer`, `hostname` (`localhost`, `ais-dev-`, `run.app`) ou rôle frontend.
  - Protection de toutes les routes sensibles : `POST /api/notifications/config`, `GET /api/notifications/history`, `POST /api/notifications/test-email`, `GET /api/notifications/status` (masquage des détails SMTP sensibles si non-admin), `GET /api/access-requests/one-click-approve` (redirection neutre sans auto-approbation non authentifiée dans l'URL).
  - Mise à jour de `src/services/notificationService.ts` et `src/components/AccessControlView.tsx` pour transmettre `await auth.currentUser?.getIdToken()`.
  - Masquage/retrait de la référence erronée à `VITE_SITE_ACCESS_PASSWORD` dans `AccessControlView.tsx` (remplacée par la variable serveur `SITE_ACCESS_PASSWORD`).

### Étape 3 — Architecture de Navigation à 5 Espaces
- **5 espaces principaux** conservant l'intégralité des onglets (`NavigationTab`) sans casser aucune route :
  1. **Accueil (`home`)** : `dashboard`
  2. **Mon parcours (`learning_path`)** : `syllabus` (Fiches & Compétences), `glossary` (Glossaire SQL), `skills` (référentiel / objectifs d'apprentissage)
  3. **Entraînement (`training`)** : `exams` (Apprentissage & Quiz), `flashcards`, `spaced_repetition`, `sandbox` (SQL Lab) + sessions courtes 5/30 min & séance ciblée
  4. **Certifications (`certifications`)** : `cert_exam` (Examen blanc 60Q) & suivi des cursus certifiants
  5. **Ma progression (`progress`)** : `skills` (Skill Map 4D), `analytics` (Statistiques & Badges), `activity` (Activité et historique)
- **Administration** : `access_control` accessible aux administrateurs via un point d'entrée secondaire non encombrant dans la navigation étudiante.
- **Sidebar Desktop (`Sidebar.tsx`)** : compacte, rétractable (mode étendu `w-64` / replié `w-20`), affichant uniquement les 5 espaces principaux + accès rapide aux sous-vues de l'espace actif (zéro mur de 12 items simultanés).
- **Barre inférieure Mobile (`MobileBottomNav.tsx`)** : visible `< md` uniquement, 5 espaces (`Accueil`, `Parcours`, `Entraînement`, `Certifs`, `Progrès`) + tiroir « Plus » (paramètres, langue, thème, aide, contrôle d'accès admin, sous-outils), `pb-safe`, zones tactiles $\ge 44\text{px}$, hauteur totale contenue ($\le 15\%$ du viewport), navigation clavier & `aria-current="page"`.
- **Compatibilité URLs (`landingDestinations.ts` & `App.tsx`)** : table de correspondance bidirectionnelle espaces ↔ `NavigationTab`, préservation totale de `?view=app&tab=...` et `popstate`.

### Étape 4 — Dashboard simplifié & données réelles
- Ordre strict :
  - **A. Message de bienvenue** personnalisé (prénom si disponible, phrase d'avancement honnête).
  - **B. Action principale dominante** : « Continuer mon apprentissage » (reprise du dernier module/exercice/cursus actif, ou première session de découverte si nouvel utilisateur).
  - **C. Une seule session recommandée** justifiée à partir des vraies données utilisateur (compétence la plus faible, révision due SM-2 ou découverte).
  - **D. 3 à 4 indicateurs de progression réels** (Progression globale calculée, Compétences maîtrisées, Révisions dues SM-2, Objectif certification / date future uniquement si définie par l'utilisateur).
  - **E. Activité récente** issue de `attemptTelemetryLogs` avec état vide explicite et lien vers l'historique complet (`activity`).
- Suppression des valeurs fictives codées en dur (`127`, `81 %`, `+12 %`, `15 Mars 2025`, `D-22`) dans `DashboardView.tsx`, `statsService.ts`, `mockData.ts`, `Sidebar.tsx`, `HamburgerMenu.tsx` et `OnboardingModal.tsx`.
- Statut de connexion / synchronisation déplacé dans une zone discrète (ou affiché uniquement en cas d'erreur / besoin d'action).

### Étape 5 — Onboarding V2 & Persistance
- Parcours structuré en 7 étapes légères (toutes les étapes facultatives ignorables) :
  1. Bienvenue
  2. Objectif d'apprentissage (Maîtriser SQL, Préparer une certification, Pratique SQL Lab, Remise à niveau)
  3. Certification visée (facultatif — option « Apprendre SQL sans certification »)
  4. Niveau actuel (Débutant, Intermédiaire, Avancé / DBA, ou « Je ne sais pas encore »)
  5. Diagnostic initial court (optionnel ou différable « Plus tard »)
  6. Proposition d'un parcours personnalisé
  7. Première session
- Préférences persistées dans un service dédié (`src/services/userPreferencesService.ts`) synchronisé avec `localStorage` et Firestore sans jamais ré-ouvrir automatiquement l'onboarding aux utilisateurs déjà configurés, tout en permettant la modification ultérieure depuis le Parcours ou les Paramètres.

### Étape 6, 7 & 8 — Design System, Responsive, WCAG 2.2 AA & SEO
- Harmonisation des tokens CSS dans `src/index.css` (`@custom-variant dark`, variables sémantiques surface/bordures/textes, respect de `prefers-reduced-motion`).
- Vérification responsive multi-tailles (`320px` à `1920px`) et correction des débordements horizontaux / modales / tableaux.
- SEO dans `index.html` et `public/robots.txt` aligné sur `https://dbmastor.pages.dev/`.

---

## 3. Fichiers concernés
- Serveur & Sécurité : `server/adminAuth.ts`, `server/notificationRoutes.ts`, `server.ts`, `.env.example`, `docs/FIREBASE_ADMIN_SETUP.md`, `src/services/notificationService.ts`, `src/services/siteAccessGateService.ts`, `src/components/AccessControlView.tsx`
- Navigation & Layout : `src/navigation/landingDestinations.ts`, `src/navigation/spaces.ts`, `src/components/Sidebar.tsx`, `src/components/MobileBottomNav.tsx`, `src/components/Header.tsx`, `src/components/HamburgerMenu.tsx`, `src/App.tsx`, `src/types.ts`
- Données réelles, Dashboard & Onboarding : `src/services/statsService.ts`, `src/services/userPreferencesService.ts`, `src/data/mockData.ts`, `src/components/DashboardView.tsx`, `src/components/OnboardingModal.tsx`, `src/components/PersonalActivityView.tsx`, `src/components/ResponseTimeAnalyticsCard.tsx`, `src/components/SystemSettingsModal.tsx`
- Design System & SEO : `src/index.css`, `index.html`, `public/robots.txt`, `.gitignore`
- Tests & Qualité : `src/tests/security.test.ts`, `src/tests/navigation.test.ts`, `src/tests/i18n.test.ts`, `src/tests/dashboard.test.ts`, `playwright.config.ts`, `e2e/app.spec.ts`, `package.json`, `docs/UX_REDESIGN_V2.md`
- Correctifs complémentaires observés lors des tests E2E : `src/components/ContextualHelpDrawer.tsx` (masquage du bouton flottant d'aide sur mobile `< md` afin d'éviter le chevauchement sur la barre inférieure `#mobile-bottom-nav`), `src/App.tsx` (décalage mobile `bottom-20` sur `#bg-update-toast`).

---

## 4. Plan de tests prévu
1. **Vitest (`npm test`)** :
   - Sécurité serveur : scénarios de la matrice d'audit (unauthenticated `401`, `admin-local` / token opaque `401`, JWT expiré `401`, spoof `Origin`/`Referer` `401`, rôles non-admin `student` & `auditor` `403`, statut `revoked`/`pending` `403`, email non vérifié / compte désactivé `403`, indisponibilité Firebase/Firestore `503`, admin approuvé `200`, validation port SMTP `400`, redirection neutre one-click-approve sans `approved_email`).
   - Navigation : mapping des 5 espaces, compatibilité ascendante des anciennes URLs `?view=app&tab=...`, fallback sûr.
   - i18n : parité complète FR / EN sur la landing page et les 5 espaces principaux + sous-onglets.
   - Dashboard / Préférences : zéro métriques fictives par défaut, états vides, calculs incrémentaux réels, « Apprendre SQL sans certification » (`targetCert: null`), filtrage des dates passées (`2025-03-15`).
2. **Playwright E2E (`npm run test:e2e`)** :
   - Sécurité API (rejet 401 sur requêtes non authentifiées/forgées + `robots.txt` 200).
   - Landing Page SEO (`canonical` -> `https://dbmastor.pages.dev/`) et transition vers l'application.
   - Onboarding V2 (« Apprendre SQL sans certification », mini-évaluation différée, persistance après rechargement).
   - Dashboard V2 propre sans métriques fictives (`127`, `81 %`, `842`, `15 Mars 2025`, `D-22`, `Moteur v16.2`) + CTA unique dominant.
   - Navigation 5 espaces (rétraction sidebar desktop, barre mobile `< md`, tiroir « Plus », URLs legacy, `popstate` Back/Forward).
   - Lab SQL interactif (requête valide + erreur SQL), bascules thème clair/sombre et FR/EN, examen blanc 60Q.
   - Audit responsive sans débordement horizontal sur `320px`, `375px`, `430px`, `768px`, `1280px`, `1440px`, `1920px`.
3. **Validation TypeScript, Règles & Build** : `npm run lint` (`tsc --noEmit`), `npx eslint firestore.rules` & `npm run build` (`vite build`).

---

## 5. Résultats réels des validations

| Vérification | Commande exécutée | Résultat observé |
|---|---|---|
| **Tests unitaires & intégration** | `npm test` (`vitest run`) | **4 fichiers / 32 tests réussis (0 échec)** — `security.test.ts` (14), `dashboard.test.ts` (7), `i18n.test.ts` (6), `navigation.test.ts` (5). |
| **Tests E2E Playwright** | `npm run test:e2e` (`playwright test`) | **7 scénarios / 7 réussis en 26.3 s (0 échec)** sur Chromium Headless (`127.0.0.1:3000`). |
| **Règles Firestore** | `npx eslint firestore.rules` | **Code de sortie 0** (aucune erreur de sécurité détectée). |
| **Typage TypeScript** | `npm run lint` (`tsc --noEmit`) | **Code de sortie 0** (0 erreur). |
| **Build Vite Production** | `npm run build` (`vite build`) | **Build réussi** sans erreur. |

### Prérequis & limites connues hors environnement local
- **Variables serveur SMTP / Gatekeeper** : `SITE_ACCESS_PASSWORD`, `ADMIN_NOTIFICATION_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `SMTP_FROM`, `NOTIFICATION_WEBHOOK_URL` doivent être injectées uniquement côté serveur (environnement d'hébergement) et jamais préfixées par `VITE_`.
- **Tests avec un vrai compte Firebase Admin en production** : les tests unitaires serveur vérifient les middlewares Express via injection de fonctions de vérification/lecture Firestore dans `createNotificationAndAuthRouter` ; en production, `server/adminAuth.ts` utilise `firebase-admin/auth` et `Firestore` (SDK Admin ou API REST authentifiée par le jeton ID vérifié).
- **Dépôt Git** : l'environnement `/app/applet` ne contenant pas de dossier `.git`, aucun commit/branche Git n'a été créé localement.

