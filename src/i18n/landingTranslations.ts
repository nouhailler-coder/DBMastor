export interface LandingTranslations {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    features: string;
    learning: string;
    sqlLab: string;
    certifications: string;
    analytics: string;
    faq: string;
    openApp: string;
    startLearning: string;
    menu: string;
    close: string;
  };
  hero: {
    badge: string;
    headline: string;
    headlineHighlight: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    supportingText: string;
    metrics: {
      questions: string;
      questionsLabel: string;
      tracks: string;
      tracksLabel: string;
      engine: string;
      engineLabel: string;
      mastery: string;
      masteryLabel: string;
    };
  };
  valueProp: {
    tag: string;
    headline: string;
    subtitle: string;
    cards: {
      learn: {
        title: string;
        desc: string;
        detail: string;
      };
      practice: {
        title: string;
        desc: string;
        detail: string;
      };
      improve: {
        title: string;
        desc: string;
        detail: string;
      };
      master: {
        title: string;
        desc: string;
        detail: string;
      };
    };
  };
  sqlLab: {
    tag: string;
    headline: string;
    subtitle: string;
    notice: string;
    features: string[];
    sampleTitle: string;
    runQuery: string;
    executing: string;
    executionTime: string;
    rowsCount: string;
    statusReady: string;
    statusSuccess: string;
  };
  adaptive: {
    tag: string;
    headline: string;
    subtitle: string;
    fourPillarsTitle: string;
    pillars: {
      syntax: { name: string; score: string; desc: string };
      modeling: { name: string; score: string; desc: string };
      architecture: { name: string; score: string; desc: string };
      optimization: { name: string; score: string; desc: string };
    };
    diagnosticNotice: string;
  };
  sessions: {
    tag: string;
    headline: string;
    subtitle: string;
    quick: {
      kicker: string;
      title: string;
      bullets: string[];
      cta: string;
    };
    training: {
      kicker: string;
      title: string;
      bullets: string[];
      cta: string;
    };
  };
  pedagogy: {
    tag: string;
    headline: string;
    subtitle: string;
    levels: {
      level1: { title: string; subtitle: string; desc: string; quote: string };
      level2: { title: string; subtitle: string; desc: string; quote: string };
      level3: { title: string; subtitle: string; desc: string; quote: string };
    };
    sampleQuestion: {
      label: string;
      prompt: string;
      sql: string;
    };
  };
  certifications: {
    tag: string;
    headline: string;
    subtitle: string;
    disclaimer: string;
    tracks: {
      oracle: { name: string; code: string; desc: string; topics: string[]; hours: string };
      azureDp900: { name: string; code: string; desc: string; topics: string[]; hours: string };
      azureDp800: { name: string; code: string; desc: string; topics: string[]; hours: string };
      postgres: { name: string; code: string; desc: string; topics: string[]; hours: string };
      mysql: { name: string; code: string; desc: string; topics: string[]; hours: string };
    };
  };
  analytics: {
    tag: string;
    headline: string;
    subtitle: string;
    metrics: {
      accuracy: { label: string; value: string; desc: string };
      streak: { label: string; value: string; desc: string };
      responseTime: { label: string; value: string; desc: string };
      topicsMastered: { label: string; value: string; desc: string };
    };
  };
  security: {
    tag: string;
    headline: string;
    subtitle: string;
    features: {
      auth: { title: string; desc: string };
      firestore: { title: string; desc: string };
      clientEngine: { title: string; desc: string };
      rbac: { title: string; desc: string };
    };
  };
  screenshots: {
    tag: string;
    headline: string;
    subtitle: string;
    zoomHint: string;
    items: {
      id: string;
      title: string;
      caption: string;
      category: string;
    }[];
  };
  faq: {
    tag: string;
    headline: string;
    subtitle: string;
    items: {
      q: string;
      a: string;
    }[];
  };
  finalCta: {
    headline: string;
    subtitle: string;
    primaryBtn: string;
    secondaryBtn: string;
    notice: string;
  };
  footer: {
    desc: string;
    sections: {
      product: string;
      learning: string;
      certifications: string;
      legal: string;
    };
    rights: string;
    disclaimer: string;
    github: string;
  };
}

export type LandingLanguage = 'fr' | 'en';

export const LANDING_TRANSLATIONS: Record<LandingLanguage, LandingTranslations> = {
  fr: {
    meta: {
      title: "DBMastery Studio — Maîtrisez SQL et l'ingénierie des bases de données",
      description: "Plateforme interactive d'apprentissage et certification SQL (Oracle 1Z0-071, Azure SQL, PostgreSQL EDB, MySQL 8.0) avec exécution en navigateur, sessions adaptatives et Skill Map.",
    },
    nav: {
      features: "Fonctionnalités",
      learning: "Pédagogie",
      sqlLab: "Lab SQL",
      certifications: "Certifications",
      analytics: "Analytique",
      faq: "FAQ",
      openApp: "Accéder à l'application",
      startLearning: "Commencer l'entraînement",
      menu: "Menu",
      close: "Fermer",
    },
    hero: {
      badge: "Plateforme d'Entraînement & Ingénierie SQL",
      headline: "Maîtrisez SQL.",
      headlineHighlight: "Devenez expert en bases de données.",
      subtitle: "Ne vous contentez pas d'apprendre la syntaxe. Pratiquez avec de vraies requêtes en navigateur, comprenez l'architecture des bases de données et développez les compétences réelles requises pour les certifications d'ingénieur de bases de données.",
      primaryCta: "Lancer DBMastery Studio",
      secondaryCta: "Explorer les fonctionnalités",
      supportingText: "Entraînement SQL interactif • Apprentissage adaptatif • Préparation aux certifications professionnelles",
      metrics: {
        questions: "2 400+",
        questionsLabel: "Questions & Flashcards",
        tracks: "5",
        tracksLabel: "Filières Certifications",
        engine: "AlaSQL",
        engineLabel: "Moteur SQL en navigateur",
        mastery: "SM-2 / FSRS",
        masteryLabel: "Répétition espacée",
      },
    },
    valueProp: {
      tag: "Valeur Pédagogique",
      headline: "Tout ce dont vous avez besoin pour maîtriser les bases de données.",
      subtitle: "Un environnement pensé pour les développeurs, administrateurs et candidats exigeants.",
      cards: {
        learn: {
          title: "1. APPRENDRE",
          desc: "Assimilez les principes SQL à travers des leçons progressives et des explications en trois paliers.",
          detail: "De la projection simple aux fonctions de fenêtrage avancées et sous-requêtes corrélées.",
        },
        practice: {
          title: "2. PRATIQUER",
          desc: "Écrivez et exécutez du vrai code SQL dans un environnement relationnel complet exécuté dans le navigateur.",
          detail: "Schémas réalistes avec tables d'employés, départements, projets et historiques.",
        },
        improve: {
          title: "3. PROGRESSER",
          desc: "Identifiez vos faiblesses grâce au diagnostic initial et profitez de séances ciblées adaptatives.",
          detail: "Séances de 5 minutes ou 30 minutes concentrées exactement sur vos notions en difficulté.",
        },
        master: {
          title: "4. MAÎTRISER",
          desc: "Construisez les compétences requises pour les certifications professionnelles Oracle, Azure, Postgres et MySQL.",
          detail: "Évaluation sur 4 dimensions : Connaissance, Précision, Rapidité et Régularité.",
        },
      },
    },
    sqlLab: {
      tag: "Exécution Réelle en Navigateur",
      headline: "Apprenez SQL en écrivant réellement du SQL.",
      subtitle: "DBMastery Studio embarque un moteur relationnel en mémoire propulsé par AlaSQL. Aucune installation ni configuration serveur requise.",
      notice: "Note : Ce lab SQL s'exécute entièrement dans la mémoire de votre navigateur pour un apprentissage instantané et sécurisé. Il ne requiert aucun identifiant de base de données de production.",
      features: [
        "Exécution SQL instantanée sans latence serveur",
        "Jeux d'essai relationnels complets (Employees, Departments, Jobs)",
        "SELECT, WHERE, filtres avancés et expressions régulières",
        "Jointures INNER, LEFT, RIGHT et FULL OUTER JOIN",
        "Agrégations GROUP BY, clauses HAVING et filtres de groupes",
        "Sous-requêtes scalaires, corrélées, EXISTS et NOT IN",
        "Expressions de table communes (CTE / WITH)",
        "Support multi-dialectes : Oracle 19c, Postgres 15, MySQL 8.0, Azure SQL",
      ],
      sampleTitle: "Requête de démonstration",
      runQuery: "Exécuter la requête",
      executing: "Exécution en cours...",
      executionTime: "Temps d'exécution",
      rowsCount: "Lignes retournées",
      statusReady: "Moteur AlaSQL prêt",
      statusSuccess: "Requête exécutée avec succès",
    },
    adaptive: {
      tag: "Parcours Adaptatif",
      headline: "Votre parcours. Votre rythme. Votre progression.",
      subtitle: "Le système analyse chacune de vos tentatives pour mesurer votre niveau de maîtrise sur notre Skill Map quadridimensionnelle et planifier vos prochaines révisions.",
      fourPillarsTitle: "Les 4 Piliers de Compétence Evalués :",
      pillars: {
        syntax: {
          name: "Syntaxe & Requêtes SQL",
          score: "94%",
          desc: "Projections, jointures, agrégations, opérateurs ensemblistes et fonctions analytiques.",
        },
        modeling: {
          name: "Modélisation Relationnelle",
          score: "88%",
          desc: "Clés primaires, contraintes d'intégrité, formes normales et dépendances fonctionnelles.",
        },
        architecture: {
          name: "Architecture & Moteur SGBD",
          score: "82%",
          desc: "Fichiers de données, tablespaces, WAL / Redo Logs, MVCC et processus d'arrière-plan.",
        },
        optimization: {
          name: "Diagnostics & Optimisation",
          score: "79%",
          desc: "Plans d'exécution, B-Tree index seeks vs scans, niveaux d'isolation ACID et verrous.",
        },
      },
      diagnosticNotice: "Un test diagnostique initial de 12 questions calibre instantanément votre niveau d'entrée.",
    },
    sessions: {
      tag: "Formats Entraînement",
      headline: "Optimisez chaque minute disponible.",
      subtitle: "Choisissez le format adapté à votre emploi du temps pour maintenir une progression continue.",
      quick: {
        kicker: "« J'ai 5 minutes »",
        title: "⚡ Quick Training",
        bullets: [
          "5 questions ciblées",
          "Chronomètre de 5 minutes",
          "Concentration exclusive sur vos notions faibles",
          "Diagnostic et score de rétention immédiats",
        ],
        cta: "Lancer une séance rapide",
      },
      training: {
        kicker: "« J'ai 30 minutes »",
        title: "🎯 Training Session",
        bullets: [
          "20 questions complètes",
          "Difficulté progressive adaptée à votre niveau",
          "Couverture équilibrée des 4 piliers d'ingénierie",
          "Rapport d'analyse et recommandations de révision",
        ],
        cta: "Lancer une session complète",
      },
    },
    pedagogy: {
      tag: "Pédagogie Progressive",
      headline: "Comprenez la réponse. Ne la mémorisez pas bêtement.",
      subtitle: "En cas d'erreur ou d'hésitation, débloquez progressivement le niveau d'aide dont vous avez besoin sans gâcher votre exercice.",
      levels: {
        level1: {
          title: "Niveau 1 — Indice",
          subtitle: "Sans révéler la solution",
          desc: "Un indice contextuel qui oriente votre réflexion vers la règle SQL clé sans donner la lettre de réponse.",
          quote: "« Rappelez-vous de l'ordre d'évaluation logique : WHERE filtre avant GROUP BY, HAVING filtre après. »",
        },
        level2: {
          title: "Niveau 2 — Explication",
          subtitle: "Pas à pas détaillé",
          desc: "Une démonstration étape par étape du comportement du moteur sur la requête et du piège précis tendu par la question.",
          quote: "« Pourquoi B est faux : une fonction d'agrégat COUNT(*) ne peut pas être évaluée au moment du scan WHERE. »",
        },
        level3: {
          title: "Niveau 3 — Cours Complet",
          subtitle: "Théorie, syntaxe & cas limites",
          desc: "La fiche technique intégrale du concept, les cas particuliers en production et les pièges classiques d'examen.",
          quote: "« Règle d'or : WHERE = lignes individuelles, HAVING = groupes agrégés. Syntaxe conforme ANSI/ISO SQL. »",
        },
      },
      sampleQuestion: {
        label: "Exemple de question piège",
        prompt: "Quelle clause permet de filtrer uniquement les départements comptant plus de 5 employés ?",
        sql: "SELECT department_id, COUNT(*) FROM employees GROUP BY department_id ...",
      },
    },
    certifications: {
      tag: "Filières Certifications",
      headline: "Préparez les certifications reconnues de l'industrie.",
      subtitle: "Un contenu rigoureux aligné sur les programmes officiels des éditeurs de bases de données majeurs.",
      disclaimer: "Avertissement : DBMastery Studio est une plateforme indépendante d'apprentissage et de préparation. Les noms Oracle, Microsoft Azure, PostgreSQL EDB et MySQL sont des marques déposées de leurs propriétaires respectifs. DBMastery Studio ne prétend à aucune accréditation officielle ni garantie d'obtention.",
      tracks: {
        oracle: {
          name: "Oracle Database SQL",
          code: "1Z0-071",
          desc: "Couverture exhaustive de la norme SQL Oracle : jointures ANSI vs (+), sous-requêtes corrélées, dates, fenêtrage et DDL/DML.",
          topics: ["SELECT & Fonctions scalaires", "Jointures complexes & Ensembles", "Groupements & Fonctions analytiques", "Transactions ACID & Vues"],
          hours: "420 questions • 12 chapitres",
        },
        azureDp900: {
          name: "Azure Data Fundamentals",
          code: "DP-900",
          desc: "Concepts fondamentaux des données relationnelles et analytiques sur le cloud Microsoft Azure.",
          topics: ["Concepts relationnels fondamentaux", "Azure SQL Database & Managed Instances", "Sécurité cloud & RBAC", "Entreposage de données & Synapse"],
          hours: "310 questions • 8 chapitres",
        },
        azureDp800: {
          name: "Azure Database Administrator",
          code: "DP-300 / DP-800",
          desc: "Administration avancée, haute disponibilité, chiffrement TDE/Always Encrypted et tuning des performances.",
          topics: ["Haute disponibilité & Disaster Recovery", "Always Encrypted & TDE", "Index Tuning & Query Store", "Surveillance des verrous & Concurrence"],
          hours: "400 questions • 10 chapitres",
        },
        postgres: {
          name: "PostgreSQL Associate",
          code: "EDB Certified Associate 16",
          desc: "Maîtrise du moteur PostgreSQL : MVCC, Autovacuum, Write-Ahead Logging (WAL) et optimisation de requêtes.",
          topics: ["Architecture MVCC & Isolation", "Autovacuum & Gel des XID", "Write-Ahead Log (WAL) & Checkpoints", "Index B-Tree, GiST, GIN & EXPLAIN"],
          hours: "250 questions • 10 chapitres",
        },
        mysql: {
          name: "Oracle MySQL 8.0 DBA",
          code: "1Z0-908",
          desc: "Administration du moteur InnoDB, gestion du Buffer Pool, réplication GTID et performance_schema.",
          topics: ["Moteur InnoDB & Buffer Pool", "Réplication GTID & Group Replication", "Performance Schema & Sys Schema", "Sauvegardes logiques & physiques"],
          hours: "280 questions • 9 chapitres",
        },
      },
    },
    analytics: {
      tag: "Suivi & Analytique",
      headline: "Visualisez vos progrès. Mesurez votre montée en compétences.",
      subtitle: "Un tableau de bord complet pour analyser votre régularité, votre vitesse de réponse et la santé de chaque sujet SQL.",
      metrics: {
        accuracy: { label: "Taux de Réussite Global", value: "84.6%", desc: "Calculé sur l'ensemble de vos tentatives récentes" },
        streak: { label: "Série d'Entraînement", value: "14 jours", desc: "Activité continue validée avec succès" },
        responseTime: { label: "Temps Moyen par Question", value: "24 sec", desc: "Temps cible d'examen respecté (< 90 sec)" },
        topicsMastered: { label: "Sujets Maîtrisés", value: "18 / 24", desc: "Seuil de rétention SM-2 supérieur à 85%" },
      },
    },
    security: {
      tag: "Synchronisation & Sécurité",
      headline: "Votre progression synchronisée en toute sécurité.",
      subtitle: "Authentification Google standard, synchronisation Firestore temps réel et règles de sécurité applicatives strictes.",
      features: {
        auth: {
          title: "Authentification Google Cloud",
          desc: "Connexion sécurisée en 1 clic sans gestion risquée de mot de passe en clair.",
        },
        firestore: {
          title: "Synchronisation Cloud Firestore",
          desc: "Vos tentatives, scores, statistiques et fiches sont sauvegardés et accessibles sur tous vos appareils.",
        },
        clientEngine: {
          title: "Moteur SQL 100% Côté Navigateur",
          desc: "Vos requêtes d'entraînement s'exécutent localement. Aucun identifiant de base de données de production n'est jamais requis.",
        },
        rbac: {
          title: "Contrôle d'Accès & Règles Serveur",
          desc: "Règles Firestore strictes vérifiant l'identité et le statut d'approbation avant toute lecture ou écriture.",
        },
      },
    },
    screenshots: {
      tag: "Galerie Produit",
      headline: "Explorez l'interface de DBMastery Studio.",
      subtitle: "Captures d'écran authentiques issues directement du référentiel applicatif.",
      zoomHint: "Cliquez pour agrandir en plein écran",
      items: [
        {
          id: "screenshot-dashboard",
          title: "Tableau de Bord & Métriques Clés",
          caption: "Vue d'ensemble de la progression, séance quotidienne recommandée, Skill Map et état de la mémoire espacée.",
          category: "Tableau de bord",
        },
        {
          id: "screenshot-onboarding",
          title: "Diagnostic Initial & Onboarding",
          caption: "Parcours guidé d'introduction et test diagnostique en 12 questions pour calibrer le niveau.",
          category: "Onboarding",
        },
        {
          id: "screenshot-logo",
          title: "Identité Visuelle & Logo Officiel",
          caption: "Identité graphique DBMastery Studio avec les cylindres relationnels et l'éclair de maîtrise.",
          category: "Identité",
        },
      ],
    },
    faq: {
      tag: "Questions Fréquentes",
      headline: "Tout ce que vous devez savoir sur la plateforme.",
      subtitle: "Réponses claires et conformes à l'architecture réelle de DBMastery Studio.",
      items: [
        {
          q: "1. Qu'est-ce que DBMastery Studio ?",
          a: "DBMastery Studio est une plateforme interactive d'apprentissage et de préparation aux certifications SQL et d'administration de bases de données. Elle combine un lab SQL en navigateur, plus de 2 400 questions et flashcards, un parcours adaptatif et un moteur de répétition espacée (inspiré SM-2 / FSRS).",
        },
        {
          q: "2. À qui s'adresse cette plateforme ?",
          a: "Elle s'adresse aux développeurs souhaitant maîtriser SQL au-delà des requêtes basiques, aux administrateurs de bases de données juniors ou confirmés, aux étudiants préparant des certifications d'éditeurs (Oracle, Azure, Postgres, MySQL) et aux ingénieurs recherchant un entraînement technique structuré.",
        },
        {
          q: "3. Peut-on exécuter de vraies requêtes SQL ?",
          a: "Oui. DBMastery Studio intègre un moteur relationnel en mémoire propulsé par AlaSQL. Vous écrivez vos requêtes (SELECT, JOIN, GROUP BY, HAVING, subqueries, CTE) et observez instantanément le résultat sur des tables de démonstration réalistes.",
        },
        {
          q: "4. Quelles technologies de bases de données sont couvertes ?",
          a: "La plateforme couvre 5 filières majeures : Oracle Database SQL (1Z0-071), Microsoft Azure Data Fundamentals (DP-900), Microsoft Azure Database Administrator (DP-300 / DP-800), PostgreSQL EDB Certified Associate 16 et Oracle MySQL 8.0 DBA (1Z0-908).",
        },
        {
          q: "5. La plateforme prend-elle en charge les spécificités d'Oracle SQL ?",
          a: "Oui. Les syntaxes spécifiques comme l'opérateur de concaténation (||), les chaînes littérales q'<...>', l'ancienne syntaxe de jointure externe (+), les fonctions de date (MONTHS_BETWEEN, ADD_MONTHS) et la logique ternaire avec NULL sont rigoureusement traitées.",
        },
        {
          q: "6. Peut-on préparer des certifications professionnelles ?",
          a: "Absolument. Les banques de questions et fiches techniques sont spécifiquement alignées sur les objectifs d'examen officiels. Attention : DBMastery Studio est une plateforme d'entraînement indépendante et ne délivre pas directement les diplômes des éditeurs.",
        },
        {
          q: "7. Comment fonctionne l'apprentissage adaptatif ?",
          a: "Le système analyse vos réussites, erreurs et temps de réponse. Les notions mal maîtrisées sont automatiquement réinjectées à intervalles calculés (1 jour, 3 jours, 7 jours, etc.) via l'algorithme de répétition espacée pour garantir une rétention durable.",
        },
        {
          q: "8. Puis-je suivre mes progrès détaillés ?",
          a: "Oui. L'onglet 'Mon activité' et la Skill Map quadridimensionnelle vous permettent de visualiser votre précision, votre vitesse par sujet, votre série quotidienne et vos axes prioritaires de travail.",
        },
        {
          q: "9. Mes données sont-elles synchronisées sur le cloud ?",
          a: "Oui. En vous connectant avec votre compte Google, votre profil, l'historique de vos tentatives et vos scores de compétences sont synchronisés en temps réel sur Cloud Firestore via des règles de sécurité serveur strictes.",
        },
        {
          q: "10. La plateforme remplace-t-elle un serveur de production ?",
          a: "Non. Le moteur SQL interne est un environnement pédagogique d'apprentissage en mémoire. Il n'a pas vocation à héberger des données de production et ne nécessite aucun accès à vos serveurs d'entreprise.",
        },
      ],
    },
    finalCta: {
      headline: "Votre voyage vers l'expertise des bases de données commence ici.",
      subtitle: "Pratiquez SQL, renforcez votre compréhension de l'architecture des bases de données et développez les compétences qui font la différence.",
      primaryBtn: "Lancer DBMastery Studio",
      secondaryBtn: "Explorer la plateforme",
      notice: "Accès gratuit sans carte bancaire • Exécution SQL immédiate",
    },
    footer: {
      desc: "Plateforme d'apprentissage et de certification en ingénierie des bases de données. Entraînement SQL interactif, moteur relationnel en navigateur et répétition espacée.",
      sections: {
        product: "Produit",
        learning: "Apprentissage",
        certifications: "Certifications",
        legal: "Informations Légales",
      },
      rights: "Tous droits réservés.",
      disclaimer: "DBMastery Studio est une plateforme pédagogique indépendante. Oracle, Microsoft, Azure, PostgreSQL et MySQL sont des marques déposées de leurs éditeurs respectifs.",
      github: "Dépôt GitHub officiel : nouhailler-coder/DBMastor",
    },
  },
  en: {
    meta: {
      title: "DBMastery Studio — Master SQL & Database Engineering",
      description: "Interactive SQL training and certification platform (Oracle 1Z0-071, Azure SQL, PostgreSQL EDB, MySQL 8.0) featuring in-browser query execution, adaptive sessions and 4D Skill Map.",
    },
    nav: {
      features: "Features",
      learning: "Learning",
      sqlLab: "SQL Lab",
      certifications: "Certifications",
      analytics: "Analytics",
      faq: "FAQ",
      openApp: "Open Application",
      startLearning: "Start Learning",
      menu: "Menu",
      close: "Close",
    },
    hero: {
      badge: "SQL Training & Database Engineering Platform",
      headline: "Master SQL.",
      headlineHighlight: "Build Your Database Expertise.",
      subtitle: "Go beyond memorizing SQL syntax. Practice real queries in your browser, understand database architecture, identify your weaknesses, and build the skills required to become a true database expert.",
      primaryCta: "Launch DBMastery Studio",
      secondaryCta: "Explore Features",
      supportingText: "Interactive SQL training • Adaptive learning • Professional certification preparation",
      metrics: {
        questions: "2,400+",
        questionsLabel: "Questions & Flashcards",
        tracks: "5",
        tracksLabel: "Certification Tracks",
        engine: "AlaSQL",
        engineLabel: "In-Browser SQL Engine",
        mastery: "SM-2 / FSRS",
        masteryLabel: "Spaced Repetition",
      },
    },
    valueProp: {
      tag: "Educational Value",
      headline: "Everything you need to master database engineering.",
      subtitle: "Designed for developers, database administrators, and ambitious certification candidates.",
      cards: {
        learn: {
          title: "1. LEARN",
          desc: "Understand core SQL concepts through structured lessons and three-tier progressive explanations.",
          detail: "From basic projections to advanced window functions and correlated subqueries.",
        },
        practice: {
          title: "2. PRACTICE",
          desc: "Write and execute real SQL queries in a full relational sandbox running entirely in your browser.",
          detail: "Realistic schemas including employees, departments, projects, and transaction history.",
        },
        improve: {
          title: "3. IMPROVE",
          desc: "Pinpoint weak areas through initial diagnostics and practice with targeted adaptive sessions.",
          detail: "5-minute quick workouts or 30-minute deep dives tailored precisely to your gaps.",
        },
        master: {
          title: "4. MASTER",
          desc: "Build the knowledge required for professional database certifications across Oracle, Azure, Postgres, and MySQL.",
          detail: "Evaluated across 4 dimensions: Knowledge, Accuracy, Speed, and Consistency.",
        },
      },
    },
    sqlLab: {
      tag: "Real In-Browser Execution",
      headline: "Learn SQL by actually writing SQL.",
      subtitle: "DBMastery Studio includes an interactive relational SQL environment powered by AlaSQL. No local setup or database server installation required.",
      notice: "Note: The embedded SQL engine runs completely in-memory in your browser for instant, secure practice. It never requires production database credentials.",
      features: [
        "Instant zero-latency SQL execution directly in the client",
        "Full relational sample datasets (Employees, Departments, Jobs)",
        "SELECT queries, WHERE predicates, complex string & date operators",
        "INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN",
        "GROUP BY aggregations, HAVING clauses, and group filtering",
        "Scalar, correlated subqueries, EXISTS, and NOT IN predicates",
        "Common Table Expressions (CTE / WITH clause)",
        "Multi-dialect compatibility: Oracle 19c, Postgres 15, MySQL 8.0, Azure SQL",
      ],
      sampleTitle: "Sample Interactive Query",
      runQuery: "Run SQL Query",
      executing: "Executing query...",
      executionTime: "Execution time",
      rowsCount: "Rows returned",
      statusReady: "AlaSQL Engine Ready",
      statusSuccess: "Query executed successfully",
    },
    adaptive: {
      tag: "Adaptive Learning",
      headline: "Your learning journey. Your pace. Your progress.",
      subtitle: "The platform tracks each attempt to measure your mastery level across our four-dimensional Skill Map and schedules optimal review intervals.",
      fourPillarsTitle: "The 4 Evaluated Competency Pillars:",
      pillars: {
        syntax: {
          name: "SQL Syntax & Querying",
          score: "94%",
          desc: "Projections, joins, grouping, set operators, and analytical window functions.",
        },
        modeling: {
          name: "Relational Data Modeling",
          score: "88%",
          desc: "Primary keys, referential integrity, normal forms, and functional dependencies.",
        },
        architecture: {
          name: "DBMS Engine Architecture",
          score: "82%",
          desc: "Datafiles, tablespaces, WAL / Redo logs, MVCC, and background writer processes.",
        },
        optimization: {
          name: "Diagnostics & Optimization",
          score: "79%",
          desc: "Execution plans, B-Tree index seeks vs scans, ACID isolation levels, and locks.",
        },
      },
      diagnosticNotice: "An initial 12-question diagnostic test calibrates your starting proficiency instantly.",
    },
    sessions: {
      tag: "Training Formats",
      headline: "Make every minute count.",
      subtitle: "Choose the training format that fits your schedule to maintain daily progress.",
      quick: {
        kicker: '"I have 5 minutes"',
        title: "⚡ Quick Training",
        bullets: [
          "5 targeted questions",
          "5-minute timer",
          "Focused strictly on weak concepts",
          "Instant performance & retention breakdown",
        ],
        cta: "Try Quick Training",
      },
      training: {
        kicker: '"I have 30 minutes"',
        title: "🎯 Training Session",
        bullets: [
          "20 comprehensive questions",
          "Progressive difficulty adapted to your level",
          "Balanced coverage of the 4 engineering pillars",
          "Detailed performance report and study plan",
        ],
        cta: "Start Training Session",
      },
    },
    pedagogy: {
      tag: "Progressive Explanations",
      headline: "Understand the answer. Don't just memorize it.",
      subtitle: "When you get stuck, unlock progressive assistance tiers without spoiling the exercise.",
      levels: {
        level1: {
          title: "Tier 1 — Hint",
          subtitle: "Guidance without spoiler",
          desc: "A contextual clue directing your attention toward the core SQL rule without revealing the answer letter.",
          quote: '"Remember the logical order of operations: WHERE filters rows before grouping; HAVING filters groups after."',
        },
        level2: {
          title: "Tier 2 — Explanation",
          subtitle: "Step-by-step breakdown",
          desc: "A step-by-step demonstration of how the SQL engine evaluates the query and the exact trap set by the question.",
          quote: '"Why B is incorrect: aggregate function COUNT(*) cannot appear in the WHERE clause predicate."',
        },
        level3: {
          title: "Tier 3 — Complete Lesson",
          subtitle: "Theory, syntax & edge cases",
          desc: "The complete technical study sheet with production edge cases, engine variations, and standard exam pitfalls.",
          quote: '"Golden Rule: WHERE = individual rows, HAVING = grouped aggregates. ANSI/ISO SQL compliant."',
        },
      },
      sampleQuestion: {
        label: "Sample Exam Question",
        prompt: "Which clause filters only the departments with more than 5 employees?",
        sql: "SELECT department_id, COUNT(*) FROM employees GROUP BY department_id ...",
      },
    },
    certifications: {
      tag: "Certification Paths",
      headline: "Prepare for professional database certifications.",
      subtitle: "Rigorous technical preparation aligned with official certification vendor examination objectives.",
      disclaimer: "Disclaimer: DBMastery Studio is an independent educational training platform. Oracle, Microsoft Azure, PostgreSQL EDB, and MySQL are registered trademarks of their respective owners. DBMastery Studio does not claim official accreditation or guaranteed exam passage.",
      tracks: {
        oracle: {
          name: "Oracle Database SQL",
          code: "1Z0-071",
          desc: "Exhaustive coverage of Oracle SQL: ANSI vs (+) joins, correlated subqueries, date arithmetic, windowing, and DDL/DML.",
          topics: ["Core SELECT & Scalar Functions", "Complex Joins & Set Operators", "Grouping & Analytic Functions", "ACID Transactions & Views"],
          hours: "420 questions • 12 chapters",
        },
        azureDp900: {
          name: "Azure Data Fundamentals",
          code: "DP-900",
          desc: "Foundational relational and analytical data concepts on the Microsoft Azure cloud platform.",
          topics: ["Core Relational Concepts", "Azure SQL Database & Managed Instances", "Cloud Security & RBAC", "Data Warehousing & Synapse"],
          hours: "310 questions • 8 chapters",
        },
        azureDp800: {
          name: "Azure Database Administrator",
          code: "DP-300 / DP-800",
          desc: "Advanced relational cloud administration, high availability, TDE/Always Encrypted encryption, and index tuning.",
          topics: ["High Availability & Disaster Recovery", "Always Encrypted & TDE", "Index Tuning & Query Store", "Concurrency & Lock Troubleshooting"],
          hours: "400 questions • 10 chapters",
        },
        postgres: {
          name: "PostgreSQL Associate",
          code: "EDB Certified Associate 16",
          desc: "PostgreSQL engine internals: MVCC, Autovacuum, Write-Ahead Logging (WAL), and query plan analysis.",
          topics: ["MVCC Architecture & Isolation", "Autovacuum & XID Freezing", "Write-Ahead Log (WAL) & Checkpoints", "B-Tree, GiST, GIN Indexes & EXPLAIN"],
          hours: "250 questions • 10 chapters",
        },
        mysql: {
          name: "Oracle MySQL 8.0 DBA",
          code: "1Z0-908",
          desc: "InnoDB storage engine administration, Buffer Pool management, GTID replication, and performance_schema.",
          topics: ["InnoDB Engine & Buffer Pool", "GTID & Group Replication", "Performance Schema & Sys Schema", "Logical & Physical Backups"],
          hours: "280 questions • 9 chapters",
        },
      },
    },
    analytics: {
      tag: "Analytics & Tracking",
      headline: "See your progress. Measure your improvement.",
      subtitle: "A detailed analytics dashboard to track training consistency, response speed, and mastery across every SQL topic.",
      metrics: {
        accuracy: { label: "Overall Accuracy Rate", value: "84.6%", desc: "Calculated across all recent practice attempts" },
        streak: { label: "Current Learning Streak", value: "14 Days", desc: "Consecutive daily training milestone achieved" },
        responseTime: { label: "Average Response Time", value: "24 sec", desc: "Well within typical exam pace (< 90 sec)" },
        topicsMastered: { label: "Topics Mastered", value: "18 / 24", desc: "SM-2 retention score above 85% threshold" },
      },
    },
    security: {
      tag: "Sync & Security",
      headline: "Your learning progress, synchronized securely.",
      subtitle: "Industry-standard Google Authentication, real-time Cloud Firestore synchronization, and strict server-side security rules.",
      features: {
        auth: {
          title: "Google Cloud Authentication",
          desc: "Secure 1-click sign-in without storing or managing plain-text passwords.",
        },
        firestore: {
          title: "Cloud Firestore Real-time Sync",
          desc: "Your attempts, accuracy telemetry, competency scores, and study sheets sync across all your devices.",
        },
        clientEngine: {
          title: "100% Client-Side SQL Engine",
          desc: "Learning queries run in-browser in local memory. No production database credentials are ever required.",
        },
        rbac: {
          title: "Access Control & Server Rules",
          desc: "Strict Firestore security rules enforce identity verification and approval checks on every read and write.",
        },
      },
    },
    screenshots: {
      tag: "Platform Gallery",
      headline: "Explore the DBMastery Studio interface.",
      subtitle: "Authentic interface screenshots taken directly from the repository application.",
      zoomHint: "Click any image to enlarge in lightbox",
      items: [
        {
          id: "screenshot-dashboard",
          title: "Main Dashboard & Key Metrics",
          caption: "Comprehensive progress overview, daily workout prompt, Skill Map, and spaced repetition memory status.",
          category: "Dashboard",
        },
        {
          id: "screenshot-onboarding",
          title: "Guided Onboarding & Diagnostic",
          caption: "Initial guided setup and 12-question diagnostic test to calibrate student starting proficiency.",
          category: "Onboarding",
        },
        {
          id: "screenshot-logo",
          title: "Brand Identity & Official Logo",
          caption: "DBMastery Studio visual identity featuring relational database cylinders and SQL mastery lightning.",
          category: "Brand Identity",
        },
      ],
    },
    faq: {
      tag: "Frequently Asked Questions",
      headline: "Everything you need to know about DBMastery Studio.",
      subtitle: "Clear, transparent answers matching the actual architecture and capabilities of the platform.",
      items: [
        {
          q: "1. What is DBMastery Studio?",
          a: "DBMastery Studio is an interactive learning and exam preparation platform for SQL and database engineering. It combines an in-browser relational SQL lab, 2,400+ flashcards and exam questions, adaptive training sessions, and an SM-2/FSRS-inspired spaced repetition engine.",
        },
        {
          q: "2. Who is this platform designed for?",
          a: "It is designed for software developers learning professional SQL, junior and experienced DBAs, students preparing for vendor certifications (Oracle, Azure, Postgres, MySQL), and data engineers seeking structured technical practice.",
        },
        {
          q: "3. Can I practice real SQL queries?",
          a: "Yes. DBMastery Studio embeds an in-memory SQL execution engine powered by AlaSQL. You can write, execute, and validate real SELECT queries, joins, aggregates, subqueries, and CTEs directly against populated sample tables.",
        },
        {
          q: "4. Which database technologies are covered?",
          a: "The platform covers 5 major paths: Oracle Database SQL (1Z0-071), Microsoft Azure Data Fundamentals (DP-900), Microsoft Azure Database Administrator (DP-300 / DP-800), PostgreSQL EDB Certified Associate 16, and Oracle MySQL 8.0 DBA (1Z0-908).",
        },
        {
          q: "5. Does the platform support Oracle SQL specifics?",
          a: "Yes. Oracle-specific syntax and behaviors—such as the || concatenation operator, q'<...>' string literals, legacy (+) outer joins, date arithmetic (MONTHS_BETWEEN, ADD_MONTHS), and ternary NULL logic—are deeply covered.",
        },
        {
          q: "6. Can I prepare for professional certifications?",
          a: "Yes. The questions and study materials are specifically aligned with official vendor examination blueprints. Note: DBMastery Studio is an independent preparation platform and does not administer or award vendor certifications.",
        },
        {
          q: "7. How does adaptive learning work?",
          a: "The platform logs each attempt, error type, and response speed. Concepts with lower retention scores return at calculated intervals (1 day, 3 days, 7 days, etc.) through the spaced repetition algorithm to guarantee durable memory retention.",
        },
        {
          q: "8. Can I track my progress?",
          a: "Yes. The 'My Activity' dashboard and 4-pillar Skill Map display real-time accuracy, response speed per topic, daily streaks, and prioritized areas for improvement.",
        },
        {
          q: "9. Is my learning data synchronized to the cloud?",
          a: "Yes. When signing in with your verified Google account, your profile, telemetry, and competency progression sync in real-time to Cloud Firestore governed by strict security rules.",
        },
        {
          q: "10. Does the platform replace a production database?",
          a: "No. The built-in SQL engine is an educational in-memory learning sandbox. It does not replace a production server and never requires or stores your company's database credentials.",
        },
      ],
    },
    finalCta: {
      headline: "Your journey to database mastery starts here.",
      subtitle: "Practice real SQL queries, strengthen your understanding of database internals, and build the skills that matter in production.",
      primaryBtn: "Launch DBMastery Studio",
      secondaryBtn: "Explore Platform",
      notice: "Free interactive access • Instant in-browser SQL practice",
    },
    footer: {
      desc: "Interactive learning and certification preparation platform for SQL and database engineering. Real in-browser SQL sandbox, 4D Skill Map, and spaced repetition.",
      sections: {
        product: "Product",
        learning: "Learning",
        certifications: "Certifications",
        legal: "Legal",
      },
      rights: "All rights reserved.",
      disclaimer: "DBMastery Studio is an independent educational training platform. Oracle, Microsoft, Azure, PostgreSQL, and MySQL are trademarks of their respective owners.",
      github: "Official GitHub Repository: nouhailler-coder/DBMastor",
    },
  },
};

export const landingTranslations = LANDING_TRANSLATIONS;

