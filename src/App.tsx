import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PracticeExamView } from './components/PracticeExamView';
import { SqlLabView } from './components/SqlLabView';
import { StudySheetsView } from './components/StudySheetsView';
import { FlashcardsView } from './components/FlashcardsView';
import { StatsView } from './components/StatsView';
import { GlossaryView } from './components/GlossaryView';
import { SkillMapView } from './components/SkillMapView';
import { CertificationExamView } from './components/CertificationExamView';
import { PersonalActivityView } from './components/PersonalActivityView';
import { ExamSummaryModal } from './components/ExamSummaryModal';
import { HamburgerMenu } from './components/HamburgerMenu';
import { SystemSettingsModal } from './components/SystemSettingsModal';
import { TargetedSessionModal } from './components/TargetedSessionModal';
import { ShortSessionRunnerModal } from './components/ShortSessionRunnerModal';
import { ShortSessionMode } from './data/shortSessionsData';
import { OnboardingModal, hasCompletedOnboarding } from './components/OnboardingModal';
import { InitialDiagnosticModal } from './components/InitialDiagnosticModal';
import { DailySessionRunnerModal } from './components/DailySessionRunnerModal';
import { ContextualHelpDrawer } from './components/ContextualHelpDrawer';
import { AccessControlView, AccessGatekeeperOverlay } from './components/AccessControlView';
import {
   NavigationTab,
  CertificationTrackId,
  SystemVersionInfo,
  QuestionAttemptTelemetry,
  TrapDiagnosticRecord,
  UserAccessRecord,
  UserAccessRole,
  UserAccessStatus
} from './types';
import { 
  getInitialSystemVersionInfo, 
  saveSystemVersionInfo, 
  formatFullDateTime, 
  getNextSimulatedVersion 
} from './services/updateService';
import { auth } from './firebase';
import {
  signInWithGoogle,
  signOutFromFirebase,
  ensureUserAccessInFirestore,
  ensureUserProfileInFirestore,
  subscribeToOwnAccessRecord,
  subscribeToAllUserAccessRecords,
  subscribeToUserFirestoreData,
  syncAttemptToFirestore,
  syncTrapToFirestore,
  adminUpsertUserAccess,
  adminDeleteUserAccess,
  isUserBootstrappedAdmin,
  sanitizeId,
  onAuthStateChanged,
  User
} from './services/firebaseSyncService';
import {
  SiteGateConfig,
  Step2EmailSession,
  loadSiteGateConfig,
  saveSiteGateConfig,
  isStep1SitePasswordUnlocked,
  unlockStep1WithPassword,
  lockStep1SitePassword,
  loadStep2EmailSession,
  saveStep2EmailSession,
  loadLocalEmailRecords,
  upsertLocalEmailRecord,
  removeLocalEmailRecord,
  verifyEmailValidationCode,
  emailToDeterministicUid
} from './services/siteAccessGateService';
import { Zap, CheckCircle2, X, RefreshCw, Settings } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [selectedCert, setSelectedCert] = useState<CertificationTrackId>('oracle-1z0-071');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [searchQuery, setSearchQuery] = useState('');
  const [examModalScore, setExamModalScore] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('dbmastery_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  // États pour le Menu Hamburger et les Paramètres Système
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState(false);
  const [isTargetedSessionOpen, setIsTargetedSessionOpen] = useState(false);
  const [isInitialDiagnosticOpen, setIsInitialDiagnosticOpen] = useState(false);
  const [isDailySessionOpen, setIsDailySessionOpen] = useState(false);
  const [shortSessionMode, setShortSessionMode] = useState<ShortSessionMode | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => !hasCompletedOnboarding());
  const [isContextualHelpOpen, setIsContextualHelpOpen] = useState<boolean>(false);
  const [systemInfo, setSystemInfo] = useState<SystemVersionInfo>(() => getInitialSystemVersionInfo());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [cloudSyncedCount, setCloudSyncedCount] = useState(0);
  const [ownAccessRecord, setOwnAccessRecord] = useState<UserAccessRecord | null>(null);
  const [allAccessRecords, setAllAccessRecords] = useState<UserAccessRecord[]>([]);
  const [localEmailRecords, setLocalEmailRecords] = useState<UserAccessRecord[]>(() =>
    loadLocalEmailRecords()
  );
  const [siteGateConfig, setSiteGateConfig] = useState<SiteGateConfig>(() =>
    loadSiteGateConfig()
  );
  const [isStep1Unlocked, setIsStep1Unlocked] = useState<boolean>(() =>
    isStep1SitePasswordUnlocked()
  );
  const [step2EmailSession, setStep2EmailSession] = useState<Step2EmailSession | null>(() =>
    loadStep2EmailSession()
  );
  const [isGatekeeperPreviewOpen, setIsGatekeeperPreviewOpen] = useState<boolean>(false);
  const [previewStepOverride, setPreviewStepOverride] = useState<1 | 2 | null>(null);
  const [bgUpdateToast, setBgUpdateToast] = useState<{
    version: string;
    type: 'auto' | 'forced';
    notes: string;
  } | null>(null);

  // Firebase Auth & Firestore Real-time Sync + RBAC Access Control
  useEffect(() => {
    let unsubFirestore: (() => void) | null = null;
    let unsubOwnAccess: (() => void) | null = null;
    let unsubAllAccess: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);

      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }
      if (unsubOwnAccess) {
        unsubOwnAccess();
        unsubOwnAccess = null;
      }
      if (unsubAllAccess) {
        unsubAllAccess();
        unsubAllAccess = null;
      }

      if (user && user.emailVerified) {
        try {
          const accessDoc = await ensureUserAccessInFirestore(user);
          setOwnAccessRecord(accessDoc);

          unsubOwnAccess = subscribeToOwnAccessRecord(user, (updatedAccess) => {
            setOwnAccessRecord(updatedAccess);
          });

          if (isUserBootstrappedAdmin(user)) {
            unsubAllAccess = subscribeToAllUserAccessRecords(user, (records) => {
              setAllAccessRecords(records);
            });
          }

          if (accessDoc?.status === 'approved') {
            await ensureUserProfileInFirestore(user, selectedCert);
            unsubFirestore = subscribeToUserFirestoreData(user, (count) => {
              setCloudSyncedCount(count);
            });
          } else {
            setCloudSyncedCount(0);
          }
        } catch (err) {
          console.error('Firebase sync initialization error:', err);
        }
      } else {
        setOwnAccessRecord(null);
        setAllAccessRecords([]);
        setCloudSyncedCount(0);
      }
    });

    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
      if (unsubOwnAccess) unsubOwnAccess();
      if (unsubAllAccess) unsubAllAccess();
    };
  }, [selectedCert]);

  const handleAdminSelfRestoreApproved = async () => {
    if (!currentUser || !currentUser.email) return;
    await adminUpsertUserAccess({
      uid: sanitizeId(currentUser.uid, 'admin_uid'),
      email: currentUser.email,
      displayName: currentUser.displayName || currentUser.email.split('@')[0] || 'Admin DBA',
      role: 'admin',
      status: 'approved',
      accessReason: 'Ré-autorisation immédiate par l\'administrateur',
    });
    setIsGatekeeperPreviewOpen(false);
    setPreviewStepOverride(null);
  };

  // Fusionner les enregistrements Firestore (/user_access) et les demandes Email locales
  const mergedAccessRecords = React.useMemo(() => {
    const byEmail = new Map<string, UserAccessRecord>();
    localEmailRecords.forEach((rec) => {
      byEmail.set(rec.email.trim().toLowerCase(), rec);
    });
    if (ownAccessRecord) {
      byEmail.set(ownAccessRecord.email.trim().toLowerCase(), ownAccessRecord);
    }
    allAccessRecords.forEach((rec) => {
      byEmail.set(rec.email.trim().toLowerCase(), rec);
    });
    return Array.from(byEmail.values()).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  }, [allAccessRecords, localEmailRecords, ownAccessRecord]);

  const handleUpdateSiteGateConfig = (next: SiteGateConfig) => {
    const saved = saveSiteGateConfig(next);
    setSiteGateConfig(saved);
    setIsStep1Unlocked(isStep1SitePasswordUnlocked());
  };

  const handleUnlockStep1 = (pwd: string): boolean => {
    const ok = unlockStep1WithPassword(pwd);
    if (ok) {
      setIsStep1Unlocked(true);
    }
    return ok;
  };

  const handleLockStep1 = () => {
    lockStep1SitePassword();
    setIsStep1Unlocked(false);
  };

  const handleUpdateStep2Session = (session: Step2EmailSession | null) => {
    saveStep2EmailSession(session);
    setStep2EmailSession(session);
  };

  const handleUpsertEmailRecord = async (params: {
    uid?: string;
    email: string;
    displayName: string;
    role: UserAccessRole;
    status: UserAccessStatus;
    accessReason: string;
  }) => {
    const cleanEmail = params.email.trim().toLowerCase();
    const uid = params.uid || emailToDeterministicUid(cleanEmail);
    upsertLocalEmailRecord({
      email: cleanEmail,
      displayName: params.displayName,
      role: params.role,
      status: params.status,
      accessReason: params.accessReason,
    });
    setLocalEmailRecords(loadLocalEmailRecords());

    if (currentUser && isUserBootstrappedAdmin(currentUser)) {
      await adminUpsertUserAccess({
        uid,
        email: cleanEmail,
        displayName: params.displayName,
        role: params.role,
        status: params.status,
        accessReason: params.accessReason,
      });
    }
  };

  const handleDeleteEmailRecord = async (record: UserAccessRecord) => {
    removeLocalEmailRecord(record.email);
    removeLocalEmailRecord(record.uid);
    setLocalEmailRecords(loadLocalEmailRecords());
    if (currentUser && isUserBootstrappedAdmin(currentUser)) {
      try {
        await adminDeleteUserAccess(record.uid);
      } catch {
        // Ignorer si l'entrée n'existait que localement
      }
    }
  };

  const handleSubmitEmailRequest = async (params: {
    email: string;
    displayName: string;
    accessReason: string;
    validationCode?: string;
  }): Promise<{ approved: boolean; message: string }> => {
    const cleanEmail = params.email.trim().toLowerCase();
    const existingRecord = mergedAccessRecords.find(
      (r) => r.email.trim().toLowerCase() === cleanEmail
    );

    const codeValid = params.validationCode
      ? verifyEmailValidationCode(cleanEmail, params.validationCode)
      : false;

    const isAlreadyApproved =
      codeValid ||
      existingRecord?.status === 'approved' ||
      (currentUser?.email?.toLowerCase() === cleanEmail &&
        ownAccessRecord?.status === 'approved');

    const finalStatus: UserAccessStatus = isAlreadyApproved
      ? 'approved'
      : existingRecord?.status === 'revoked'
      ? 'revoked'
      : 'pending';

    upsertLocalEmailRecord({
      email: cleanEmail,
      displayName: params.displayName,
      role: existingRecord?.role || 'student',
      status: finalStatus,
      accessReason: params.accessReason,
    });
    setLocalEmailRecords(loadLocalEmailRecords());

    // Si l'admin teste un email sur sa session, l'enregistrer aussi dans Firestore /user_access
    if (currentUser && isUserBootstrappedAdmin(currentUser)) {
      try {
        await adminUpsertUserAccess({
          uid: existingRecord?.uid || emailToDeterministicUid(cleanEmail),
          email: cleanEmail,
          displayName: params.displayName,
          role: existingRecord?.role || 'student',
          status: finalStatus,
          accessReason: params.accessReason,
        });
      } catch {
        // ignore
      }
    }

    const sessionObj: Step2EmailSession = {
      email: cleanEmail,
      displayName: params.displayName,
      accessReason: params.accessReason,
      validatedByCode: isAlreadyApproved,
      submittedAt: new Date().toISOString(),
    };
    handleUpdateStep2Session(sessionObj);

    if (isAlreadyApproved) {
      setIsGatekeeperPreviewOpen(false);
      setPreviewStepOverride(null);
      return {
        approved: true,
        message:
          lang === 'fr'
            ? `Email "${cleanEmail}" validé ! Accès au site autorisé.`
            : `Email "${cleanEmail}" verified! Site access granted.`,
      };
    }

    if (finalStatus === 'revoked') {
      return {
        approved: false,
        message:
          lang === 'fr'
            ? `L'accès pour l'adresse "${cleanEmail}" a été révoqué par l'administrateur.`
            : `Access for "${cleanEmail}" has been revoked by the administrator.`,
      };
    }

    return {
      approved: false,
      message:
        lang === 'fr'
          ? `Votre demande pour "${cleanEmail}" a bien été enregistrée en statut EN ATTENTE (PENDING). Dès que l'administrateur valide votre email dans la console Contrôle d'Accès (ou vous transmet votre code VAL-XXXX-XXXX), votre accès sera déverrouillé.`
          : `Your request for "${cleanEmail}" has been recorded as PENDING. Once the administrator approves your email in the Access Control console (or sends your VAL-XXXX-XXXX code), your access will unlock.`,
    };
  };

  // Vérifier si l'utilisateur courant a franchi l'Étape 1 (Mot de passe) et l'Étape 2 (Email validé)
  const isStep2EmailApproved = React.useMemo(() => {
    if (!siteGateConfig.requireEmailValidation) return true;
    if (currentUser && ownAccessRecord?.status === 'approved') return true;
    if (step2EmailSession) {
      if (step2EmailSession.validatedByCode) return true;
      const match = mergedAccessRecords.find(
        (r) => r.email.trim().toLowerCase() === step2EmailSession.email.toLowerCase()
      );
      if (match?.status === 'approved') return true;
    }
    return false;
  }, [
    siteGateConfig.requireEmailValidation,
    currentUser,
    ownAccessRecord?.status,
    step2EmailSession,
    mergedAccessRecords,
  ]);

  const shouldShowGatekeeperOverlay =
    isGatekeeperPreviewOpen ||
    (siteGateConfig.gateEnabled &&
      ((siteGateConfig.requireSitePassword && !isStep1Unlocked) ||
        (isAuthReady && !isStep2EmailApproved)));

  // Synchroniser automatiquement les nouvelles tentatives et pièges vers Firestore (uniquement si approuvé)
  useEffect(() => {
    const handleAttemptRecorded = (e: Event) => {
      const customEvent = e as CustomEvent<QuestionAttemptTelemetry>;
      if (customEvent.detail && auth.currentUser && ownAccessRecord?.status === 'approved') {
        syncAttemptToFirestore(customEvent.detail).catch((err) =>
          console.error('Failed to sync attempt to Firestore:', err)
        );
      }
    };

    const handleTrapRecorded = (e: Event) => {
      const customEvent = e as CustomEvent<TrapDiagnosticRecord>;
      if (customEvent.detail && auth.currentUser && ownAccessRecord?.status === 'approved') {
        syncTrapToFirestore(customEvent.detail).catch((err) =>
          console.error('Failed to sync trap to Firestore:', err)
        );
      }
    };

    window.addEventListener('dbmastery:attempt_recorded', handleAttemptRecorded);
    window.addEventListener('dbmastery:trap_recorded', handleTrapRecorded);
    return () => {
      window.removeEventListener('dbmastery:attempt_recorded', handleAttemptRecorded);
      window.removeEventListener('dbmastery:trap_recorded', handleTrapRecorded);
    };
  }, [ownAccessRecord?.status]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-In error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutFromFirebase();
    } catch (err) {
      console.error('Sign-Out error:', err);
    }
  };

  useEffect(() => {
    const handleOpenTargeted = () => setIsTargetedSessionOpen(true);
    const handleStartShortSession = (e: Event) => {
      const customEvent = e as CustomEvent<ShortSessionMode>;
      if (customEvent.detail === 'quick_5min' || customEvent.detail === 'training_30min') {
        setShortSessionMode(customEvent.detail);
      }
    };
    const handleOpenDiagnostic = () => setIsInitialDiagnosticOpen(true);
    const handleOpenDailySession = () => setIsDailySessionOpen(true);
    window.addEventListener('dbmastery:open_targeted_session', handleOpenTargeted);
    window.addEventListener('dbmastery:start_short_session', handleStartShortSession);
    window.addEventListener('dbmastery:open_initial_diagnostic', handleOpenDiagnostic);
    window.addEventListener('dbmastery:open_daily_session', handleOpenDailySession);
    return () => {
      window.removeEventListener('dbmastery:open_targeted_session', handleOpenTargeted);
      window.removeEventListener('dbmastery:start_short_session', handleStartShortSession);
      window.removeEventListener('dbmastery:open_initial_diagnostic', handleOpenDiagnostic);
      window.removeEventListener('dbmastery:open_daily_session', handleOpenDailySession);
    };
  }, []);

  const systemInfoRef = useRef(systemInfo);
  systemInfoRef.current = systemInfo;

  const handleLangToggle = () => {
    setLang((prev) => (prev === 'fr' ? 'en' : 'fr'));
  };

  const handleThemeToggle = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('dbmastery_theme', next);
      return next;
    });
  };

  const handleFinishExam = (score: number) => {
    setExamModalScore(score);
  };

  // ==========================================
  // SYSTÈME DE MISE À JOUR (VÉRIFIER & FORCER)
  // ==========================================

  // 1. Bouton "Vérifier les mises à jour"
  const handleCheckForUpdates = async () => {
    setSystemInfo((prev) => ({
      ...prev,
      isChecking: true,
      statusMessage: lang === 'fr' ? 'Vérification des répertoires officiels...' : 'Checking official repositories...',
    }));

    await new Promise((resolve) => setTimeout(resolve, 1400));

    const nowStr = formatFullDateTime(new Date());
    setSystemInfo((prev) => {
      const updated: SystemVersionInfo = {
        ...prev,
        isChecking: false,
        lastCheckedDate: nowStr,
        statusMessage: lang === 'fr' 
          ? `Vérification effectuée à ${nowStr.split('à')[1]?.trim() || nowStr}. Système à jour.` 
          : `Checked at ${nowStr}. System is up-to-date.`,
      };
      saveSystemVersionInfo(updated);
      return updated;
    });
  };

  // 2. Bouton "Forcer la mise à jour"
  const handleForceUpdate = async () => {
    setSystemInfo((prev) => ({
      ...prev,
      isUpdating: true,
      updateProgress: 15,
      statusMessage: lang === 'fr' ? 'Téléchargement forcé des modules...' : 'Forcing module download...',
    }));

    await new Promise((resolve) => setTimeout(resolve, 500));
    setSystemInfo((prev) => ({ ...prev, updateProgress: 45, statusMessage: lang === 'fr' ? 'Compilation des index et cache SQL...' : 'Compiling indexes and SQL cache...' }));

    await new Promise((resolve) => setTimeout(resolve, 600));
    setSystemInfo((prev) => ({ ...prev, updateProgress: 80, statusMessage: lang === 'fr' ? 'Application des binaires du moteur...' : 'Applying engine binaries...' }));

    await new Promise((resolve) => setTimeout(resolve, 500));

    const currentVer = systemInfoRef.current.currentVersion;
    const nextVer = getNextSimulatedVersion(currentVer);
    const nowStr = formatFullDateTime(new Date());

    setSystemInfo((prev) => {
      const updated: SystemVersionInfo = {
        ...prev,
        currentVersion: nextVer.version,
        releaseDate: nextVer.releaseDate,
        lastCheckedDate: nowStr,
        isUpdating: false,
        updateProgress: 100,
        statusMessage: lang === 'fr'
          ? `Mise à jour ${nextVer.version} installée et active.`
          : `Update ${nextVer.version} installed and active.`,
        updateHistory: [
          {
            id: `forced-${Date.now()}`,
            timestamp: nowStr,
            version: nextVer.version,
            type: 'forced',
            notes: nextVer.notes,
          },
          ...prev.updateHistory,
        ],
      };
      saveSystemVersionInfo(updated);
      return updated;
    });

    setBgUpdateToast({
      version: nextVer.version,
      type: 'forced',
      notes: nextVer.notes,
    });
  };

  // Interrupteur Mises à jour automatiques
  const handleToggleAutoUpdate = (enabled: boolean) => {
    setSystemInfo((prev) => {
      const updated = { ...prev, autoUpdateEnabled: enabled };
      saveSystemVersionInfo(updated);
      return updated;
    });
  };

  // Fréquence des vérifications automatiques
  const handleChangeInterval = (minutes: number) => {
    setSystemInfo((prev) => {
      const updated = { ...prev, autoUpdateIntervalMinutes: minutes };
      saveSystemVersionInfo(updated);
      return updated;
    });
  };

  // =========================================================================
  // SYSTÈME DE MISES À JOUR AUTOMATIQUES EN ARRIÈRE-PLAN (BACKGROUND RUNNER)
  // Vérifie régulièrement en arrière-plan et installe automatiquement les versions
  // =========================================================================
  useEffect(() => {
    const intervalMs = Math.max(systemInfo.autoUpdateIntervalMinutes * 60 * 1000, 30000);

    const intervalId = setInterval(() => {
      const currentInfo = systemInfoRef.current;
      if (!currentInfo.autoUpdateEnabled || currentInfo.isUpdating || currentInfo.isChecking) {
        return;
      }

      // Exécution silencieuse en arrière-plan
      const nowStr = formatFullDateTime(new Date());
      const nextVer = getNextSimulatedVersion(currentInfo.currentVersion);

      // Simulation d'une nouvelle version disponible détectée et installée silencieusement
      const updated: SystemVersionInfo = {
        ...currentInfo,
        currentVersion: nextVer.version,
        releaseDate: nextVer.releaseDate,
        lastCheckedDate: nowStr,
        statusMessage: lang === 'fr' 
          ? `Version ${nextVer.version} installée automatiquement en arrière-plan.`
          : `Version ${nextVer.version} automatically installed in background.`,
        updateHistory: [
          {
            id: `auto-${Date.now()}`,
            timestamp: nowStr,
            version: nextVer.version,
            type: 'auto',
            notes: nextVer.notes,
          },
          ...currentInfo.updateHistory,
        ],
      };

      setSystemInfo(updated);
      saveSystemVersionInfo(updated);

      // Notification discrète à l'utilisateur
      setBgUpdateToast({
        version: nextVer.version,
        type: 'auto',
        notes: nextVer.notes,
      });
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [systemInfo.autoUpdateIntervalMinutes, systemInfo.autoUpdateEnabled, lang]);

  // Mode Focus pour le Lab SQL (masque sidebar et headers pour maximiser l'espace d'écriture et d'exécution)
  const [isLabFocusMode, setIsLabFocusMode] = useState(false);

  // Fermeture automatique du toast après 6 secondes
  useEffect(() => {
    if (bgUpdateToast) {
      const timer = setTimeout(() => setBgUpdateToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [bgUpdateToast]);

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-200 ${
      isLight 
        ? 'theme-light bg-[#f8fafc] text-[#0f172a] selection:bg-[#0284c7]/20 selection:text-[#0284c7]' 
        : 'theme-dark bg-[#031427] text-[#d3e4fe] selection:bg-[#3198dc]/30 selection:text-[#93ccff]'
    }`}>
      {/* Fixed Sidebar with Hamburger and System Settings entrypoints (masquée en mode Focus) */}
      {!isLabFocusMode && (
        <Sidebar 
          currentTab={currentTab} 
          onTabChange={(tab) => {
            setIsLabFocusMode(false);
            setCurrentTab(tab);
          }} 
          lang={lang}
          onOpenHamburger={() => setIsHamburgerOpen(true)}
          onOpenSystemSettings={() => setIsSystemSettingsOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenContextualHelp={() => setIsContextualHelpOpen(true)}
          systemVersion={systemInfo.currentVersion}
          currentUser={currentUser}
          cloudSyncedCount={cloudSyncedCount}
          onGoogleSignIn={handleGoogleSignIn}
          onSignOut={handleSignOut}
        />
      )}

      {/* Main Content Area (pleine largeur quand isLabFocusMode est actif) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
        isLabFocusMode ? 'pl-0' : 'pl-64'
      }`}>
        {/* Fixed Header with Hamburger Button and System Settings (masqué en mode Focus) */}
        {!isLabFocusMode && (
          <Header
            selectedCert={selectedCert}
            onCertChange={setSelectedCert}
            lang={lang}
            onLangToggle={handleLangToggle}
            onSearchQuery={setSearchQuery}
            theme={theme}
            onThemeToggle={handleThemeToggle}
            onOpenHamburger={() => setIsHamburgerOpen(true)}
            onOpenSystemSettings={() => setIsSystemSettingsOpen(true)}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenContextualHelp={() => setIsContextualHelpOpen(true)}
            systemInfo={systemInfo}
            currentUser={currentUser}
            isAuthReady={isAuthReady}
            cloudSyncedCount={cloudSyncedCount}
            accessStatus={ownAccessRecord?.status || null}
            onOpenAccessControl={() => setCurrentTab('access_control')}
            onGoogleSignIn={handleGoogleSignIn}
            onSignOut={handleSignOut}
          />
        )}

        {/* View Switcher Container with Top Margin for Fixed Header (sans marge en mode Focus) */}
        <main className={`flex-1 overflow-y-auto transition-all duration-200 ${
          isLabFocusMode ? 'mt-0 pb-6' : 'mt-16 pb-16'
        }`}>
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectTrack={(id) => {
                setSelectedCert(id);
              }}
              selectedCert={selectedCert}
              lang={lang}
              onOpenTargetedSession={() => setIsTargetedSessionOpen(true)}
              onStartShortSession={(mode) => setShortSessionMode(mode)}
              onStartDailySession={() => setIsDailySessionOpen(true)}
              currentUser={currentUser}
              cloudSyncedCount={cloudSyncedCount}
              onGoogleSignIn={handleGoogleSignIn}
              onSignOut={handleSignOut}
            />
          )}

          {currentTab === 'activity' && (
            <PersonalActivityView
              lang={lang}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenTargetedSession={() => setIsTargetedSessionOpen(true)}
              onStartShortSession={(mode) => setShortSessionMode(mode)}
              currentUser={currentUser}
              cloudSyncedCount={cloudSyncedCount}
            />
          )}

          {currentTab === 'cert_exam' && (
            <CertificationExamView
              lang={lang}
              theme={theme}
              onNavigateToTab={(tab) => setCurrentTab(tab as NavigationTab)}
              onFinishExamCallback={(score) => setExamModalScore(score)}
            />
          )}

          {currentTab === 'skills' && (
            <SkillMapView
              lang={lang}
              theme={theme}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              onOpenTargetedSession={() => setIsTargetedSessionOpen(true)}
            />
          )}

          {currentTab === 'exams' && (
            <PracticeExamView
              lang={lang}
              theme={theme}
              onFinishExam={handleFinishExam}
              onNavigateToTab={(tab) => setCurrentTab(tab as NavigationTab)}
              onStartShortSession={(mode) => setShortSessionMode(mode)}
            />
          )}

          {currentTab === 'sandbox' && (
            <SqlLabView
              lang={lang}
              theme={theme}
              isFocusMode={isLabFocusMode}
              onToggleFocusMode={() => setIsLabFocusMode((prev) => !prev)}
            />
          )}

          {currentTab === 'syllabus' && (
            <StudySheetsView
              selectedCert={selectedCert}
              onCertChange={setSelectedCert}
              onNavigate={(tab) => setCurrentTab(tab)}
              lang={lang}
            />
          )}

          {currentTab === 'flashcards' && (
            <FlashcardsView
              onNavigate={(tab) => setCurrentTab(tab)}
              selectedCert={selectedCert}
              onCertChange={setSelectedCert}
              lang={lang}
              theme={theme}
            />
          )}

          {currentTab === 'glossary' && (
            <GlossaryView
              lang={lang}
              theme={theme}
              initialSearchQuery={searchQuery}
              onNavigateToTab={(tab) => setCurrentTab(tab as NavigationTab)}
            />
          )}

          {currentTab === 'analytics' && (
            <StatsView
              lang={lang}
              onOpenSettings={() => setIsSystemSettingsOpen(true)}
            />
          )}

          {currentTab === 'access_control' && (
            <AccessControlView
              lang={lang}
              currentUser={currentUser}
              ownAccessRecord={ownAccessRecord}
              allAccessRecords={mergedAccessRecords}
              selectedCert={selectedCert}
              siteGateConfig={siteGateConfig}
              isStep1Unlocked={isStep1Unlocked}
              step2EmailSession={step2EmailSession}
              onUpdateSiteGateConfig={handleUpdateSiteGateConfig}
              onLockStep1ForTest={handleLockStep1}
              onUnlockStep1WithPassword={handleUnlockStep1}
              onUpdateStep2EmailSession={handleUpdateStep2Session}
              onUpsertEmailRecord={handleUpsertEmailRecord}
              onDeleteEmailRecord={handleDeleteEmailRecord}
              onOpenGatekeeperPreview={(step) => {
                setPreviewStepOverride(step || null);
                setIsGatekeeperPreviewOpen(true);
              }}
              onGoogleSignIn={handleGoogleSignIn}
              onSignOut={handleSignOut}
            />
          )}
        </main>
      </div>

      {/* Categorized Hamburger Menu Drawer */}
      <HamburgerMenu
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        selectedCert={selectedCert}
        onCertChange={setSelectedCert}
        onOpenSystemSettings={() => setIsSystemSettingsOpen(true)}
        systemInfo={systemInfo}
        lang={lang}
        onLangToggle={handleLangToggle}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      {/* System Settings & Updates Modal */}
      <SystemSettingsModal
        isOpen={isSystemSettingsOpen}
        onClose={() => setIsSystemSettingsOpen(false)}
        systemInfo={systemInfo}
        onCheckForUpdates={handleCheckForUpdates}
        onForceUpdate={handleForceUpdate}
        onToggleAutoUpdate={handleToggleAutoUpdate}
        onChangeInterval={handleChangeInterval}
        lang={lang}
        theme={theme}
      />

      {/* Floating Background Auto-Update Toast Notification */}
      {bgUpdateToast && (
        <div 
          id="bg-update-toast"
          className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl bg-[#031427]/95 border border-[#3198dc]/50 shadow-2xl backdrop-blur-xl animate-slideInRight flex items-start gap-3 text-[#d3e4fe]"
        >
          <div className="p-2 rounded-xl bg-[#00a572]/20 text-[#4edea3] shrink-0 mt-0.5 border border-[#4edea3]/30">
            <Zap className="w-5 h-5 text-[#4edea3]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                {bgUpdateToast.type === 'auto' 
                  ? (lang === 'fr' ? 'Mise à jour en arrière-plan' : 'Background Update')
                  : (lang === 'fr' ? 'Mise à jour forcée' : 'Forced Update')}
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#3198dc]/20 text-[#89ceff] border border-[#3198dc]/40">
                  {bgUpdateToast.version}
                </span>
              </span>
              <button
                onClick={() => setBgUpdateToast(null)}
                className="text-[#89929b] hover:text-[#d3e4fe] p-1"
                aria-label="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-[#bfc7d2] mt-1 leading-snug">
              {bgUpdateToast.notes}
            </p>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#1b2b3f] text-[10px] font-mono">
              <span className="text-[#4edea3] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {lang === 'fr' ? 'Prêt à l\'emploi' : 'Ready to use'}
              </span>
              <button
                onClick={() => {
                  setBgUpdateToast(null);
                  setIsSystemSettingsOpen(true);
                }}
                className="text-[#89ceff] hover:underline"
              >
                {lang === 'fr' ? 'Voir détails →' : 'View details →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Exam Completion Modal */}
      {examModalScore !== null && (
        <ExamSummaryModal
          score={examModalScore}
          isOpen={examModalScore !== null}
          onClose={() => setExamModalScore(null)}
          onReview={() => {
            setExamModalScore(null);
            setCurrentTab('exams');
          }}
          onReturnDashboard={() => {
            setExamModalScore(null);
            setCurrentTab('dashboard');
          }}
          lang={lang}
        />
      )}

      {/* Séance Personnalisée IA (Génération Automatique d'Exercices Ciblés) */}
      <TargetedSessionModal
        isOpen={isTargetedSessionOpen}
        onClose={() => setIsTargetedSessionOpen(false)}
        lang={lang}
        theme={theme}
        onNavigateToTab={(tab) => setCurrentTab(tab as NavigationTab)}
      />

      {/* Système de Sessions Courtes : « J'ai 5 minutes » (5Q) & « J'ai 30 minutes » (20Q) */}
      <ShortSessionRunnerModal
        mode={shortSessionMode}
        onClose={() => setShortSessionMode(null)}
        onSwitchMode={(newMode) => setShortSessionMode(newMode)}
        lang={lang}
        theme={theme}
        onNavigateToTab={(tab) => setCurrentTab(tab as NavigationTab)}
      />

      {/* Guide d'Onboarding Interactif (6 étapes) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        lang={lang}
        selectedCert={selectedCert}
        onSelectCert={setSelectedCert}
        onStartShortSession={(mode) => setShortSessionMode(mode)}
        onNavigateToTab={(tab) => setCurrentTab(tab)}
        onOpenContextualHelp={() => setIsContextualHelpOpen(true)}
      />

      {/* Diagnostic Initial — 20 questions (SQL, Modélisation, Transactions, Index, Administration) */}
      <InitialDiagnosticModal
        isOpen={isInitialDiagnosticOpen}
        onClose={() => setIsInitialDiagnosticOpen(false)}
        lang={lang}
        onStartTargetedSession={(domainId) => {
          setIsInitialDiagnosticOpen(false);
          setIsTargetedSessionOpen(true);
        }}
        onNavigateToDashboard={() => {
          setIsInitialDiagnosticOpen(false);
          setCurrentTab('dashboard');
        }}
      />

      {/* 🎯 Ma séance du jour : 15 questions ≈ 12 min (JOIN 5, Transactions 4, Indexes 3, SQL avancé 3) */}
      <DailySessionRunnerModal
        isOpen={isDailySessionOpen}
        onClose={() => setIsDailySessionOpen(false)}
        lang={lang}
        onNavigateToDashboard={() => {
          setIsDailySessionOpen(false);
          setCurrentTab('dashboard');
        }}
      />

      {/* Aide Contextuelle Dynamique par écran + Contrôle des Infobulles */}
      <ContextualHelpDrawer
        isOpen={isContextualHelpOpen}
        onClose={() => setIsContextualHelpOpen(false)}
        onOpen={() => setIsContextualHelpOpen(true)}
        currentTab={currentTab}
        lang={lang}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onStartShortSession={(mode) => setShortSessionMode(mode)}
        onNavigateToTab={(tab) => setCurrentTab(tab)}
      />

      {/* Portail de Verrouillage en 2 Étapes : 1. Mot de passe du site (Netlify) -> 2. Email validé par l'Admin */}
      {shouldShowGatekeeperOverlay && (
        <AccessGatekeeperOverlay
          lang={lang}
          currentUser={currentUser}
          ownAccessRecord={ownAccessRecord}
          allAccessRecords={mergedAccessRecords}
          siteGateConfig={siteGateConfig}
          isStep1Unlocked={isStep1Unlocked}
          step2EmailSession={step2EmailSession}
          previewStepOverride={previewStepOverride}
          isPreviewMode={isGatekeeperPreviewOpen}
          onUnlockStep1WithPassword={handleUnlockStep1}
          onLockStep1={handleLockStep1}
          onSubmitEmailRequest={handleSubmitEmailRequest}
          onClosePreview={() => {
            setIsGatekeeperPreviewOpen(false);
            setPreviewStepOverride(null);
          }}
          onOpenAdminConsole={() => {
            setCurrentTab('access_control');
          }}
          onGoogleSignIn={handleGoogleSignIn}
          onSignOut={handleSignOut}
          onAdminSelfRestoreApproved={handleAdminSelfRestoreApproved}
          selectedCert={selectedCert}
        />
      )}
    </div>
  );
}
