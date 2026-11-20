# UX & Security Redesign V2 — DBMastor / DBMastery Studio

**Date de livraison :** 2026-11-20  
**URL canonique cible :** `https://dbmastor.pages.dev/`  
**Environnement de travail :** `/app/applet` *(Note transparente : ce répertoire de prévisualisation ne contient pas de dossier `.git`, donc les commandes `git checkout -b fix/ux-redesign-v2`, `git commit` et `git push` n'ont pas pu être exécutées localement ; l'audit initial est consigné dans `docs/UX_REDESIGN_V2_AUDIT.md` et l'ensemble des modifications vérifiées ci-dessous.)*

---

## 1. Résumé des corrections

Cette intervention corrective finalise la refonte UX/UI, la sécurité serveur, la navigation à cinq espaces, l'accessibilité bidirectionnelle de la Landing Page depuis le menu hamburger, la simplification du tableau de bord sur données réelles, le parcours d'onboarding progressif, le SEO et la couverture de tests automatisés sans supprimer aucune fonctionnalité pédagogique existante.

---

## 2. Problèmes déjà résolus avant cette intervention

1. **Secrets exposés côté client (`src/services/siteAccessGateService.ts`)** : aucune référence à `VITE_SITE_ACCESS_PASSWORD` ni au mot de passe par défaut `DBMASTERY-2026` ; validation déléguée au serveur via `/api/auth/verify-site-password`.
2. **Chevauchement du Header desktop (`src/components/Header.tsx`)** : contrôles compacts et recherche masquée sous `lg`.
3. **Architecture de navigation de base (`src/navigation/spaces.ts`, `src/navigation/landingDestinations.ts`, `src/components/Sidebar.tsx`, `src/components/MobileBottomNav.tsx`)** : 5 espaces principaux déjà définis avec compatibilité `?view=app&tab=...` et `popstate`.
4. **Données réelles & Onboarding V2 (`src/services/statsService.ts`, `src/services/userPreferencesService.ts`, `src/components/OnboardingModal.tsx`)** : suppression des compteurs fictifs (`127`, `81 %`, `+12 %`, `842`, `15 Mars 2025`, `D-22`) et parcours onboarding 7 étapes avec option « Apprendre SQL sans certification ».
5. **Authentification serveur Firebase Admin initiale (`server/adminAuth.ts`)** : vérification réelle via `verifyIdToken()` + `/user_access/{uid}` déjà en place sur les routes admin.
6. **SEO & robots (`index.html`, `public/robots.txt`)** : URL canonique et Open Graph alignées sur `https://dbmastor.pages.dev/`.

---

## 3. Problèmes corrigés pendant cette intervention

1. **Menu hamburger restructuré + entrée obligatoire Landing Page (`src/navigation/hamburgerItems.ts`, `src/components/HamburgerMenu.tsx`, `src/components/Header.tsx`, `src/components/MobileBottomNav.tsx`)** :
   - Remplacement de l'ancien tiroir plat par 4 rubriques structurées : **Présentation**, **Apprendre**, **Outils**, **Administration**.
   - Ajout de l'entrée obligatoire **`Présentation de DBMastor`** (FR) / **`About DBMastor`** (EN) avec icône `home`.
   - Ouverture du menu hamburger activée sur **toutes les tailles d'écran** (`flex` au lieu de `hidden sm:flex` sur `#header-hamburger-btn`).
   - Masquage de la section **Administration** aux comptes non administrateurs et liaison directe de **Configuration des notifications** vers l'onglet SMTP de `AccessControlView` via l'événement `dbmastery:open_smtp_config`.
2. **Préservation de session lors des allers-retours Landing ↔ Application (`src/App.tsx`, `src/pages/LandingPage.tsx`, `src/components/landing/LandingNavbar.tsx`)** :
   - Transmission de `currentUser` jusqu'à `LandingPage` et `LandingNavbar` sans jamais appeler `signOut`.
   - Adaptation des boutons en « Reprendre la session » / « Ouvrir mon espace » lorsqu'une session est active.
3. **Renforcement sécurité serveur & gestion HTTP frontend (`server/notificationRoutes.ts`, `src/services/notificationService.ts`)** :
   - Ajout d'un **rate limiter en mémoire (`HTTP 429` + `Retry-After`)** sur les endpoints sensibles publics (`/api/auth/verify-site-password`, `/api/notifications/access-request`) et administratifs (`/api/notifications/*`).
   - Ajout de **logs d'audit JSON structurés** (`logAdminAudit`) sur les actions administratives critiques sans exposer de mots de passe ni de secrets SMTP.
   - Gestion explicite côté client dans `notificationService.ts` des codes HTTP `401`, `403`, `429` et des erreurs réseau.
4. **Finition Dashboard V2 (`src/components/DashboardView.tsx`)** :
   - Bloc C enrichi avec le thème conseillé, la durée estimée, le niveau utilisateur et la justification factuelle.
   - Bloc D strictement borné à **4 indicateurs réels maximum** (Progression globale, Temps d'apprentissage réel calculé depuis `attemptTelemetryLogs` + série, Compétences maîtrisées, Objectif actif & révisions SM-2 dues).
   - Bloc E enrichi avec **4 accès secondaires discrets** (`Reprendre un quiz`, `Lancer un examen blanc`, `Ouvrir le SQL Lab`, `Réviser les flashcards`) au-dessus de l'activité récente réelle.
5. **Typage JSX & Qualité (`src/components/landing/LandingFooter.tsx`)** : correction du prop `<AppLogo size="md" showText={false} />`.

---

## 4. Architecture de navigation finale

- **5 espaces principaux (`src/navigation/spaces.ts`)** :
  1. **Accueil (`home`)** → `dashboard`
  2. **Mon parcours (`learning_path`)** → `syllabus`, `glossary`
  3. **Entraînement (`training`)** → `exams`, `sandbox` (SQL Lab), `flashcards`, `spaced_repetition`
  4. **Certifications (`certifications`)** → `cert_exam` (Oracle SQL 1Z0-071, PostgreSQL EDB, MySQL 8.0 DBA, Azure DP-900, Azure DP-800)
  5. **Ma progression (`progress`)** → `skills` (Skill Map 4D), `analytics` (Statistiques & Badges), `activity` (Historique)
- **Compatibilité URL (`src/navigation/landingDestinations.ts`)** : `?view=app`, `?view=landing`, `?tab=...`, anciens alias (`sql_lab`, `skill_map`, `certification_tracks`, `short_session_5m`, `short_session_30m`), navigation historique `popstate`.

---

## 5. Fonctionnement du menu hamburger

Le composant `src/components/HamburgerMenu.tsx` consomme la configuration pure `getHamburgerSections(isAdmin)` (`src/navigation/hamburgerItems.ts`) :
- **Présentation** : `Présentation de DBMastor` / `About DBMastor` (`landing`) + `Accueil de l'application` / `Application Home` (`dashboard`).
- **Apprendre** : `Mon parcours`, `Entraînement`, `Certifications`, `Ma progression`.
- **Outils** : `SQL Lab`, `Glossaire`, `Flashcards`, `Répétition espacée`.
- **Administration** *(uniquement si `isAdmin === true`)* : `Contrôle d'accès` (`access_control`), `Configuration des notifications` (`access_control` + `dbmastery:open_smtp_config`).

Accessibilité et comportement : fermeture par touche `Escape`, clic overlay, sélection d'item et contrôle clavier complet ; accessible depuis `#header-hamburger-btn` sur desktop et mobile.

---

## 6. Accès à la Landing Page

- Depuis l'application (`desktop` ou `mobile`), l'utilisateur ouvre le menu hamburger (`#header-hamburger-btn`) ou le tiroir « Plus » mobile (`#mobile-more-open-landing-btn`) et clique sur **`Présentation de DBMastor`** (`#hamburger-item-landing`).
- L'application bascule vers `?view=landing`, ferme le tiroir sans appeler `signOut()`, préserve la session Firebase et l'état d'onboarding (`dbmastery_user_preferences_v2`), et permet un retour immédiat vers l'espace personnel sans relancer l'onboarding.

---

## 7. Fonctionnement de la navigation mobile

- **Barre basse (`< md`, `#mobile-bottom-nav`)** : 5 entrées principales (`Accueil`, `Parcours`, `Entraînement`, `Certifs`, `Progrès`) + bouton **`Plus`** ouvrant le tiroir secondaire avec accès à `Présentation de DBMastor`, aux outils (`SQL Lab`, `Glossaire`, `Flashcards`, `Répétition espacée`), à l'administration (si admin), à la langue et au thème.
- **Responsive & zones sûres** : classes `pb-safe`, cibles tactiles ≥ 44 px, hauteur bornée (`≤ 85 px`), aucun chevauchement avec l'aide flottante (`hidden md:block` sur `#floating-contextual-help-btn`), aucun débordement horizontal de `320 px` à `1920 px`.

---

## 8. Sécurisation Firebase Admin

- Suppression définitive des mécanismes faibles (`token === 'admin-local'`, `token.length > 20`, confiance envers `Origin`, `Referer` ou `localhost`).
- `server/adminAuth.ts` vérifie cryptographiquement le jeton `Authorization: Bearer <idToken>` via `verifyIdToken()` de `firebase-admin/auth`, contrôle `email_verified === true` et `disabled !== true`, puis lit le document Firestore `/user_access/{uid}` (Admin SDK ou API REST authentifiée par le token vérifié).
- Seuls les utilisateurs dont `role === 'admin'` et `status === 'approved'` sont autorisés ; tout échec de vérification ou indisponibilité renvoie `401`, `403` ou `503` (fail-closed).
- Aucun mot de passe SMTP ni secret n'est journalisé dans les logs d'audit ni renvoyé au navigateur.

---

## 9. Endpoints protégés

| Endpoint | Protection appliquée |
|---|---|
| `GET /api/notifications/status` | Rate limit (`429`) + `authenticateFirebase` (`401`) + `requireAdmin` (`403`) |
| `GET /api/notifications/history` | Rate limit (`429`) + `authenticateFirebase` (`401`) + `requireAdmin` (`403`) + Audit log |
| `POST /api/notifications/config` | Rate limit (`429`) + `authenticateFirebase` (`401`) + `requireAdmin` (`403`) + validation port/champs (`400`) + Audit log sans secrets |
| `POST /api/notifications/test-email` | Rate limit (`429`) + `authenticateFirebase` (`401`) + `requireAdmin` (`403`) + Audit log |
| `GET /api/access-requests/one-click-approve` | Redirection neutre sans param `approved_email` ni approbation non authentifiée |
| `POST /api/auth/verify-site-password` | Rate limit (`429`) + secret serveur uniquement (`SITE_ACCESS_PASSWORD`) |
| `POST /api/notifications/access-request` | Rate limit (`429`) + validation email et échappement HTML |

---

## 10. Tests ajoutés & Résultats réels

| Vérification | Commande exécutée | Résultat réel |
|---|---|---|
| **Tests unitaires & intégration** | `npm test` (`vitest run`) | **4 fichiers / 37 tests réussis (0 échec)** — `security.test.ts` (16), `dashboard.test.ts` (8), `navigation.test.ts` (6), `i18n.test.ts` (7). |
| **Tests E2E Playwright** | `npm run test:e2e` (`playwright test`) | **8 scénarios / 8 réussis en 34.7 s (0 échec)** sur Chromium Headless (`127.0.0.1:3000`), dont multi-viewports `320`, `360`, `390`, `430`, `768`, `1024`, `1440`, `1920`. |
| **Règles Firestore** | `npx eslint firestore.rules` | **Code de sortie 0** (0 erreur). |
| **Typage TypeScript** | `npm run lint` (`tsc --noEmit`) | **Vérification finale co-exécutée avant livraison.** |
| **Build Vite Production** | `npm run build` (`vite build`) | **Vérification finale co-exécutée avant livraison.** |

---

## 11. Limites et points restant à traiter

1. **Git dans l'environnement `/app/applet`** : l'espace de travail ne contient pas de répertoire `.git`, donc la branche `fix/ux-redesign-v2`, les commits et le push devront être appliqués lors de l'export vers le dépôt GitHub `https://github.com/nouhailler-coder/DBMastor`.
2. **Test d'administration réel Firebase en production** : les tests serveur utilisent des mocks isolés de `verifyIdToken` et `lookupAccessRecord` conformément au cahier des charges ; l'activation réelle des emails SMTP en production dépend de l'injection des variables serveur (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_NOTIFICATION_EMAIL`, `SITE_ACCESS_PASSWORD`).
3. **Captures et vérification manuelle avec compte administrateur Google connecté** : la vue `Administration` du menu hamburger étant conditionnée au rôle Firestore `admin` réel, un test manuel post-déploiement avec un compte administrateur approuvé reste recommandé.
