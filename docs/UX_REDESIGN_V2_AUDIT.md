# Audit Technique Préalable — CODEX MASTER V2 (`fix/ux-redesign-v2`)

**Date de l'audit :** 2026-11-20  
**Application :** DBMastor / DBMastery Studio (`https://dbmastor.pages.dev/`)  
**Branche cible :** `fix/ux-redesign-v2` *(Note : le répertoire `/app/applet` fourni dans l'environnement AI Studio ne possède pas de dossier `.git` initialisé ; les modifications sont donc appliquées directement dans l'espace de travail et documentées ici).*

---

## 1. Problèmes déjà corrigés avant cette intervention

L'inspection du code réel montre que la première campagne de refonte a déjà traité les points suivants :

1. **Authentification & RBAC Firebase côté serveur (`server/adminAuth.ts`, `server/notificationRoutes.ts`)** :
   - Suppression des anciens contournements (`token === 'admin-local'`, `token.length > 20`, vérification par `Origin` ou `Referer` ou `localhost`).
   - Vérification cryptographique des jetons ID Firebase via `firebase-admin/auth` (`verifyIdToken`), vérification de l'adresse email vérifiée, du statut non désactivé et du profil Firestore `/user_access/{uid}` (`role === 'admin'`, `status === 'approved'`).
   - Suppression de l'auto-approbation par lien `one-click-approve` (redirection neutre sans `?approved_email=`).
2. **Service client notifications (`src/services/notificationService.ts`)** :
   - Transmission de `Authorization: Bearer <Firebase_ID_Token>` sur `/api/notifications/status`, `/api/notifications/history`, `/api/notifications/config` et `/api/notifications/test-email`.
3. **Architecture à 5 espaces & compatibilité URLs (`src/navigation/spaces.ts`, `src/navigation/landingDestinations.ts`, `src/components/Sidebar.tsx`)** :
   - 5 espaces principaux (`Accueil`, `Mon parcours`, `Entraînement`, `Certifications`, `Ma progression`), Sidebar desktop compacte et rétractable, compatibilité `?view=app&tab=...` et `popstate`.
4. **Navigation mobile (`src/components/MobileBottomNav.tsx`)** :
   - Barre inférieure `< md` à 5 entrées principales + tiroir « Plus », `pb-safe`, zones tactiles $\ge 44\text{ px}$, masquage du bouton flottant d'aide sur mobile pour éviter tout chevauchement.
5. **Données réelles & Onboarding (`src/services/statsService.ts`, `src/services/userPreferencesService.ts`, `src/components/OnboardingModal.tsx`)** :
   - Suppression des valeurs fictives codées en dur (`127`, `81 %`, `+12 %`, `842`, `15 Mars 2025`, `D-22`) dans les vues par défaut.
   - Parcours d'onboarding 7 étapes facultatives/ignorables avec option *« Apprendre SQL sans certification »* et *« Je ne sais pas encore »*.
6. **SEO (`index.html`, `public/robots.txt`) & Design System (`src/index.css`)** :
   - Canonique / OpenGraph alignés sur `https://dbmastor.pages.dev/`, `@custom-variant dark`, `prefers-reduced-motion`, tokens CSS.

---

## 2. Problèmes encore présents ou incomplets identifiés lors de l'audit

| Domaine | Constat précis dans le dépôt | Action prévue |
|---|---|---|
| **Menu Hamburger & Landing Page (Critique UX — Section 4.4)** | `src/components/HamburgerMenu.tsx` n'affiche **aucune entrée** *« Présentation de DBMastor »* / *« About DBMastor »*, ne reçoit pas `onOpenLanding` depuis `src/App.tsx`, et conserve encore l'ancienne organisation à 5 groupes numérotés au lieu des 4 sections demandées (**Présentation**, **Apprendre**, **Outils**, **Administration**). | Restructurer `HamburgerMenu.tsx` selon les 4 sections cibles, ajouter *« Présentation de DBMastor »* / *« About DBMastor »* (desktop & mobile sans déconnecter l'utilisateur), et passer `onOpenLanding` depuis `App.tsx`. |
| **Bouton Hamburger sur mobile (`src/components/Header.tsx`)** | `#header-hamburger-btn` possède `hidden sm:flex`, masquant l'ouverture directe du menu hamburger sur écrans `< 640 px`. Dans `MobileBottomNav.tsx`, le libellé du bouton landing est générique (*« Revenir à la page de présentation »*). | Rendre `#header-hamburger-btn` accessible sur toutes les largeurs d'écran et harmoniser le libellé *« Présentation de DBMastor »* / *« About DBMastor »* dans le tiroir mobile. |
| **Landing Page & Session active (`src/pages/LandingPage.tsx`, `src/components/landing/LandingNavbar.tsx`, `LandingFooter.tsx`)** | `LandingPage` ne reçoit pas l'état de session utilisateur actif pour signaler le retour immédiat à la session sans déconnexion ; `LandingFooter.tsx` passe `size={36}` à `AppLogo` au lieu de `'md'`. | Transmettre `isSignedIn` / `userLabel` à `LandingPage` et `LandingNavbar` pour afficher un repère clair de session conservée et un retour fluide vers l'application ; corriger `AppLogo size="md"` dans `LandingFooter.tsx`. |
| **Sécurité serveur complémentaire (`server/notificationRoutes.ts`, `src/services/notificationService.ts`)** | Aucune limitation de débit (*rate limiting*) sur les endpoints sensibles (`/api/auth/verify-site-password`, `/api/notifications/*`) et aucune journalisation d'audit structurée des actions administratives ; gestion HTTP 401/403 à affiner dans `fetchNotificationStatus()` et `fetchNotificationHistory()`. | Ajouter un middleware de rate limiting en mémoire côté serveur + logs d'audit des actions admin (sans fuite de secrets) + gestion explicite des erreurs 401/403/réseau dans `notificationService.ts`. |
| **Tableau de bord (`src/components/DashboardView.tsx` — Section 6.2)** | Le bloc recommandation (Bloc C) n'affiche pas explicitement la durée estimée ni le niveau ; les accès secondaires (Quiz, Examen blanc, SQL Lab, Flashcards) ne sont pas regroupés en barre d'accès rapides discrète (Bloc E) ; l'indicateur temps d'apprentissage / série réelle manque dans les 4 métriques clés. | Enrichir le Bloc C avec thème, durée estimée, niveau et raison ; inclure le temps d'apprentissage / série réelle dans les 4 indicateurs ; ajouter les 4 raccourcis secondaires discrets sans concurrencer l'action principale. |
| **Tests automatisés (`navigation.test.ts`, `i18n.test.ts`, `security.test.ts`, `e2e/app.spec.ts`)** | Aucun test ne vérifie l'entrée *« Présentation de DBMastor »* / *« About DBMastor »* dans le menu hamburger, la conservation de session lors de l'aller-retour App ↔ Landing, ni le rate limiting `429`. | Ajouter les tests unitaires/serveur manquants et compléter la suite Playwright sur les 14 parcours et toutes les largeurs (`320px`, `360px`, `390px`, `430px`, `768px`, `1024px`, `1440px`). |

---

## 3. Fichiers concernés

- Audit & Documentation : `docs/UX_REDESIGN_V2_AUDIT.md`, `docs/UX_REDESIGN_V2.md`
- Sécurité serveur & client : `server/notificationRoutes.ts`, `src/services/notificationService.ts`
- Navigation, Hamburger & Landing : `src/navigation/hamburgerItems.ts` *(helper pur testable)*, `src/components/HamburgerMenu.tsx`, `src/components/Header.tsx`, `src/components/MobileBottomNav.tsx`, `src/pages/LandingPage.tsx`, `src/components/landing/LandingNavbar.tsx`, `src/components/landing/LandingFooter.tsx`, `src/App.tsx`
- Tableau de bord : `src/components/DashboardView.tsx`
- Tests : `src/tests/security.test.ts`, `src/tests/navigation.test.ts`, `src/tests/i18n.test.ts`, `src/tests/dashboard.test.ts`, `e2e/app.spec.ts`

---

## 4. Fonctionnalités existantes à préserver intégralement

- Authentification Google Firebase, rôles/statuts RBAC (`admin`, `student`, `auditor` / `pending`, `approved`, `revoked`), synchronisation Firestore.
- Onboarding V2 & préférences utilisateur (`userPreferencesService.ts`), sessions courtes 5 min / 30 min, aide contextuelle, apprentissage progressif, quiz adaptatifs, flashcards, répétition espacée SM-2, glossaire, SQL Lab AlaSQL, Skill Map 4D, statistiques, badges, examens blancs 60Q, parcours Oracle SQL 1Z0-071, PostgreSQL EDB, MySQL 8.0 DBA, Azure DP-900 et DP-800.
- Bilinguisme FR/EN, mode clair/sombre, URLs `?view=app&tab=...` et Landing Page existante.
