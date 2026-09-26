<div align="center">

# 🗄️ DBMastery Studio — SQL & Database Engineering Platform

**Plateforme interactive d'apprentissage, d'entraînement adaptatif et de certification SQL & Architecture SGBD**  
*Oracle Database SQL (1Z0-071) • PostgreSQL • MySQL • Microsoft Azure SQL (DP-300)*

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![AlaSQL Engine](https://img.shields.io/badge/SQL_Engine-AlaSQL_In--Memory-10B981?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/AlaSQL/alasql)

</div>

---

## 📸 Aperçu de l'Application

<div align="center">
  <img
    src="./src/assets/images/dbmastery_studio_screenshot_1790453723903.jpg"
    alt="Capture d'écran de DBMastery Studio — Tableau de bord, Mon activité hebdomadaire et moteur SQL interactif"
    referrerPolicy="no-referrer"
    width="100%"
  />
  <p><em>Interface principale de <strong>DBMastery Studio</strong> : Tableau de bord analytique, suivi « Mon activité — Cette semaine », synchronisation Google Cloud Firestore et aide pédagogique progressive « Explique-moi ».</em></p>
</div>

---

## 🧭 Table des Matières

- [✨ Fonctionnalités Clés](#-fonctionnalités-clés)
  - [💡 1. Système Pédagogique « Explique-moi » (3 Niveaux)](#-1-système-pédagogique--explique-moi--3-niveaux)
  - [📊 2. Historique Personnel — Page « Mon activité »](#-2-historique-personnel--page--mon-activité-)
  - [☁️ 3. Authentification Google & Synchronisation Cloud Firestore](#️-3-authentification-google--synchronisation-cloud-firestore)
  - [⚡ 4. Laboratoire SQL Live & Visualiseur de Jointures](#-4-laboratoire-sql-live--visualiseur-de-jointures)
  - [🎯 5. Skill Map Quadridimensionnelle & Simulateur d'Examen](#-5-skill-map-quadridimensionnelle--simulateur-dexamen)
- [🏗️ Architecture du Projet](#️-architecture-du-projet)
- [🛡️ Sécurité Firestore (Zero-Trust Rules)](#️-sécurité-firestore-zero-trust-rules)
- [🚀 Installation & Démarrage Rapide](#-installation--démarrage-rapide)
- [🛠️ Stack Technique](#️-stack-technique)

---

## ✨ Fonctionnalités Clés

### 💡 1. Système Pédagogique « Explique-moi » (3 Niveaux)

Pour éviter de donner immédiatement la réponse lors d'un blocage sur une question QCM ou un défi d'écriture SQL, chaque exercice intègre une barre d'assistance graduée :

```text
[ Réponse ]   [ 💡 Indice ]   [ 🧠 Expliquer ]   [ 👁️ Voir la solution ]
```

Lorsque l'apprenant clique sur **`[ Expliquer ]`** ou **`[ Indice ]`**, un panneau structuré en **3 paliers progressifs** s'affiche :

| Niveau | Badge | Objectif Pédagogique | Exemple de Contenu |
| :--- | :--- | :--- | :--- |
| **Niveau 1** | 💡 **Indice** | Orienter l'attention sans dévoiler la réponse | *« Regarde attentivement la condition du `JOIN` et le filtrage dans la clause `WHERE` vs `ON`. »* |
| **Niveau 2** | 🧠 **Explication** | Décomposer le mécanisme logique en jeu | *« Le `LEFT JOIN` conserve toutes les lignes de la table gauche, même sans correspondance à droite (colonnes à `NULL`)... »* |
| **Niveau 3** | 📖 **Cours** | Rappel théorique complet, syntaxe et cas limites | *Explication complète + requête d'exemple commentée + pièges classiques d'examen (`NULL` dans `NOT IN`, ordre d'exécution SQL).* |

---

### 📊 2. Historique Personnel — Page « Mon activité »

Une vue dédiée **« Mon activité »** (accessible depuis la barre latérale et le Tableau de bord) synthétise la régularité et la progression hebdomadaire en temps réel :

```text
Mon activité
Cette semaine

Questions          127
Réussite            81 %
Temps moyen         32 s
Série actuelle       6 jours

Progression

Lun     ███████
Mar     █████████
Mer     █████
Jeu     ██████████
Ven     ███████████

« Depuis la semaine dernière : +12 % sur SQL »
```

- 🔍 **Filtrage interactif par jour** : Cliquez sur n'importe quelle barre (`Lun` à `Ven`) pour inspecter le détail de la journée (nombre de questions, taux de réussite, vitesse moyenne et journal des tentatives).
- 📈 **Comparaison hebdomadaire par sous-domaine** : Décomposition de la progression sur `SELECT`, `WHERE`, `JOIN`, `GROUP BY / HAVING`, `Subqueries / CTE` et `Normalisation`.
- ⏱️ **Mise à jour automatique** : Chaque question validée dans le QCM ou le Lab SQL met immédiatement à jour les compteurs et le temps moyen de réponse.

---

### ☁️ 3. Authentification Google & Synchronisation Cloud Firestore

- 🔐 **Connexion Google en 1 clic** : Bouton **« Connexion Google »** disponible dans la barre supérieure (`Header`), la barre latérale (`Sidebar`) et le bandeau d'état du Tableau de bord.
- 🔄 **Synchronisation Temps Réel (`onSnapshot`)** :
  - **Profil de progression (`userProfiles`)** : XP, niveau, série actuelle (*streak*), maîtrise par domaine et statistiques hebdomadaires.
  - **Mémoire adaptative (`userMemories`)** : Historique des erreurs récurrentes, concepts fragiles et plan de révision personnalisé.
  - **Journal d'activité (`questionAttempts`)** : Historique horodaté de chaque question répondue avec temps passé et statut de réussite.

---

### ⚡ 4. Laboratoire SQL Live & Visualiseur de Jointures

- 🖥️ **Exécution SQL In-Browser (AlaSQL)** : Écrivez et exécutez de vraies requêtes SQL (`SELECT`, `INNER/LEFT/RIGHT/FULL JOIN`, `GROUP BY`, `HAVING`, `CTE WITH`, fonctions de fenêtrage) sur un schéma relationnel pré-chargé (`employees`, `departments`, `projects`, `sales`).
- 🔗 **Visualiseur Interactif de Jointures** : Diagrammes de Venn dynamiques et aperçu ligne par ligne des correspondances de clés primaires/étrangères (`PK` / `FK`) et gestion des valeurs `NULL`.
- 🏛️ **Explorateur d'Architecture SGBD** : Schémas interactifs de la mémoire (SGA, PGA, Buffer Cache, Redo Log Buffer) et des processus d'arrière-plan (`DBWn`, `LGWR`, `CKPT`, `SMON`, `PMON`).

---

### 🎯 5. Skill Map Quadridimensionnelle & Simulateur d'Examen

- 🧭 **Évaluation sur 4 Piliers** :
  1. 🟦 **Syntaxe SQL** (`SELECT`, `DML`, `DDL`, fonctions analytiques)
  2. 🟪 **Conception & Modélisation** (`1NF`, `2NF`, `3NF`, `BCNF`, clés et contraintes)
  3. 🟧 **Architecture Interne SGBD** (Transactions `ACID`, verrous, index B-Tree/Bitmap, mémoire)
  4. 🟩 **Diagnostic & Optimisation** (Plans d'exécution, résolution d'erreurs `ORA-*`, tuning)
- ⏳ **Simulateur d'Examen Chronométré** : Conditions réelles de certification (ex. **Oracle 1Z0-071**), marquage des questions pour révision, score de préparation (*Exam Readiness Score*) et rapport post-examen détaillé.

---

## 🏗️ Architecture du Projet

```text
📦 dbmastery-studio
 ┣ 📂 public/                        # Ressources statiques et schémas
 ┣ 📂 src/
 ┃ ┣ 📂 assets/images/               # Captures d'écran et illustrations générées
 ┃ ┣ 📂 components/
 ┃ ┃ ┣ 📄 Header.tsx                 # Barre supérieure fixe + Connexion Google + Recherche
 ┃ ┃ ┣ 📄 Sidebar.tsx                # Navigation latérale + Statut Cloud + XP
 ┃ ┃ ┣ 📄 DashboardView.tsx          # Tableau de bord + Encart « Mon activité » + Skill Map
 ┃ ┃ ┣ 📄 PersonalActivityView.tsx   # Page « Mon activité » (Historique personnel & Progression)
 ┃ ┃ ┣ 📄 ExplainMePanel.tsx         # Panneau pédagogique 3 niveaux (💡 Indice, 🧠 Explication, 📖 Cours)
 ┃ ┃ ┣ 📄 QuizView.tsx               # Entraînement QCM adaptatif & Simulateur d'examen
 ┃ ┃ ┣ 📄 SqlSandboxView.tsx         # Éditeur SQL Live (AlaSQL) + Défis d'écriture SQL
 ┃ ┃ ┣ 📄 JoinVisualizerView.tsx     # Visualiseur interactif de jointures SQL
 ┃ ┃ ┣ 📄 ArchitectureView.tsx       # Explorateur d'architecture SGBD (SGA/PGA, Processus)
 ┃ ┃ ┗ 📄 CoursesView.tsx            # Modules de cours structurés et fiches de révision
 ┃ ┣ 📂 data/
 ┃ ┃ ┣ 📄 mockData.ts                # Banque de questions SQL/SGBD, défis SQL et cours
 ┃ ┃ ┗ 📄 explainMeCatalog.ts        # Générateur et catalogue d'indices/explications/cours
 ┃ ┣ 📂 services/
 ┃ ┃ ┣ 📄 statsService.ts            # Calcul des métriques, série (streak) et activité hebdomadaire
 ┃ ┃ ┣ 📄 userMemoryService.ts       # Moteur de mémoire adaptative et détection des points faibles
 ┃ ┃ ┗ 📄 firestoreSyncService.ts    # Synchronisation temps réel Firestore & gestion d'erreurs
 ┃ ┣ 📄 firebase.ts                  # Initialisation Firebase SDK (Auth + Firestore)
 ┃ ┣ 📄 types.ts                     # Interfaces TypeScript globales
 ┃ ┗ 📄 App.tsx                      # Orchestrateur principal et gestionnaire d'état
 ┣ 📄 firebase-blueprint.json        # Schéma des entités et collections Firestore
 ┣ 📄 firestore.rules                # Règles de sécurité Firestore Zero-Trust
 ┣ 📄 security_spec.md               # Spécification de sécurité et audit Red Team
 ┣ 📄 package.json                   # Dépendances et scripts NPM
 ┗ 📄 vite.config.ts                 # Configuration Vite + Tailwind CSS
```

---

## 🛡️ Sécurité Firestore (Zero-Trust Rules)

La base de données Cloud Firestore est protégée par des règles de sécurité strictes (`firestore.rules`) conformes aux 8 piliers Zero-Trust :

| Collection | Chemin Firestore | Règle d'Accès | Validation des Données |
| :--- | :--- | :--- | :--- |
| **Profil Utilisateur** | `/userProfiles/{userId}` | Propriétaire uniquement (`request.auth.uid == userId`) | Clés strictes (`hasOnly`), bornes numériques (`xp`, `streak`) et horodatage serveur |
| **Mémoire Adaptative** | `/userMemories/{userId}` | Propriétaire uniquement (`request.auth.uid == userId`) | Validation de taille du JSON de télémétrie (`<= 900 KB`) et intégrité de `uid` |
| **Tentatives QCM/SQL** | `/questionAttempts/{attemptId}` | Lecture/Création par propriétaire (`resource.data.uid == request.auth.uid`) | Immuabilité après création, validation des types (`timeSpentMs`, `isCorrect`) |

---

## 🚀 Installation & Démarrage Rapide

### 1️⃣ Prérequis

- **Node.js** `>= 20.x`
- **npm** ou **bun**

### 2️⃣ Installation des dépendances

```bash
npm install
```

### 3️⃣ Lancer le serveur de développement

```bash
npm run dev
```

L'application démarre sur **`http://localhost:3000`**.

### 4️⃣ Scripts disponibles

| Commande | Description |
| :--- | :--- |
| `npm run dev` | Démarre le serveur de développement sur le port `3000` |
| `npm run build` | Compile l'application pour la production dans `dist/` |
| `npm run lint` | Vérifie le typage statique TypeScript (`tsc --noEmit`) |
| `npm run preview` | Prévisualise le build de production localement |

---

## 🛠️ Stack Technique

- ⚛️ **Frontend** : React 19, TypeScript 5.8, Vite 6
- 🎨 **Design System & UI** : Tailwind CSS 4, Lucide Icons, Motion (animations fluides), thèmes *Dark Slate* & *High-Contrast Light*
- 🗄️ **Moteur SQL Embarqué** : AlaSQL (exécution SQL relationnelle en mémoire côté client)
- 🔥 **Backend & Cloud** : Firebase Authentication (Google Sign-In) & Cloud Firestore (persistance temps réel)
- 🌐 **Internationalisation** : Interface bilingue Français 🇫🇷 / Anglais 🇬🇧 instantanée

---

<div align="center">
  <sub>Conçu pour l'excellence technique en ingénierie des bases de données et la réussite aux certifications SQL.</sub>
</div>
