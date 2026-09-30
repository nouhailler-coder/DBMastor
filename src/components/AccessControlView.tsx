import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  Database,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Send,
  Sparkles,
  FileCode2,
  Users,
  Mail,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  Globe
} from 'lucide-react';
import {
  UserAccessRecord,
  UserAccessRole,
  UserAccessStatus,
  CertificationTrackId
} from '../types';
import {
  User,
  BOOTSTRAPPED_ADMIN_EMAIL,
  isUserBootstrappedAdmin,
  adminUpsertUserAccess,
  adminDeleteUserAccess,
  updatePendingAccessReason,
  testFirestoreProtectedWrite,
  sanitizeId
} from '../services/firebaseSyncService';
import {
  SiteGateConfig,
  Step2EmailSession,
  ENV_DEFAULT_SITE_PASSWORD,
  generateEmailValidationCode,
  verifyEmailValidationCode,
  emailToDeterministicUid
} from '../services/siteAccessGateService';
import { dirtyDozenSecurityTests } from '../../firestore.rules.test';

interface AccessControlViewProps {
  lang: 'fr' | 'en';
  currentUser: User | null;
  ownAccessRecord: UserAccessRecord | null;
  allAccessRecords: UserAccessRecord[];
  selectedCert: CertificationTrackId;
  siteGateConfig: SiteGateConfig;
  isStep1Unlocked: boolean;
  step2EmailSession: Step2EmailSession | null;
  onUpdateSiteGateConfig: (next: SiteGateConfig) => void;
  onLockStep1ForTest: () => void;
  onUnlockStep1WithPassword: (pwd: string) => boolean;
  onUpdateStep2EmailSession: (session: Step2EmailSession | null) => void;
  onUpsertEmailRecord: (params: {
    uid?: string;
    email: string;
    displayName: string;
    role: UserAccessRole;
    status: UserAccessStatus;
    accessReason: string;
  }) => Promise<void>;
  onDeleteEmailRecord: (record: UserAccessRecord) => Promise<void>;
  onOpenGatekeeperPreview: (initialStep?: 1 | 2) => void;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
}

interface LiveWriteTestLog {
  id: string;
  timestamp: string;
  statusAtTest: string;
  allowed: boolean;
  path: string;
  detail: string;
}

export const AccessControlView: React.FC<AccessControlViewProps> = ({
  lang,
  currentUser,
  ownAccessRecord,
  allAccessRecords,
  selectedCert,
  siteGateConfig,
  isStep1Unlocked,
  step2EmailSession,
  onUpdateSiteGateConfig,
  onLockStep1ForTest,
  onUpdateStep2EmailSession,
  onUpsertEmailRecord,
  onDeleteEmailRecord,
  onOpenGatekeeperPreview,
  onGoogleSignIn,
}) => {
  const isFr = lang === 'fr';
  const isAdmin = isUserBootstrappedAdmin(currentUser);

  const [statusFilter, setStatusFilter] = useState<'all' | UserAccessStatus>('all');
  const [isBusy, setIsBusy] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [writeTestLogs, setWriteTestLogs] = useState<LiveWriteTestLog[]>([]);

  // État pour la configuration du mot de passe du site (Étape 1 Netlify)
  const [passwordDraft, setPasswordDraft] = useState(siteGateConfig.sitePassword);
  const [showSitePassword, setShowSitePassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Formulaire d'ajout / pré-autorisation d'un email (Étape 2)
  const [newEmail, setNewEmail] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<UserAccessRole>('student');
  const [newStatus, setNewStatus] = useState<UserAccessStatus>('approved');
  const [newReason, setNewReason] = useState('');

  const showMessage = (type: 'success' | 'error' | 'info', message: string) => {
    setFeedbackBanner({ type, message });
    setTimeout(() => {
      setFeedbackBanner((prev) => (prev?.message === message ? null : prev));
    }, 6500);
  };

  const handleCopyText = (text: string, key: string, msg?: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    if (msg) showMessage('info', msg);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2500);
  };

  // Sauvegarder le nouveau mot de passe du site (Étape 1)
  const handleSaveSitePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = passwordDraft.trim() || ENV_DEFAULT_SITE_PASSWORD;
    setPasswordDraft(cleaned);
    onUpdateSiteGateConfig({
      ...siteGateConfig,
      sitePassword: cleaned,
    });
    showMessage(
      'success',
      isFr
        ? `Mot de passe d'accès au site (Étape 1) mis à jour : "${cleaned}".`
        : `Site access password (Step 1) updated: "${cleaned}".`
    );
  };

  // Changer son propre statut dans Firestore pour tester en direct les règles de sécurité
  const handleSimulateOwnStatus = async (targetStatus: UserAccessStatus) => {
    if (!currentUser || !currentUser.email) {
      showMessage(
        'error',
        isFr
          ? 'Veuillez d\'abord vous connecter avec Google pour tester les règles Firestore en direct.'
          : 'Please sign in with Google first to test Firestore rules live.'
      );
      return;
    }

    setIsBusy(true);
    try {
      const uid = sanitizeId(currentUser.uid, 'admin_uid');
      await onUpsertEmailRecord({
        uid,
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email.split('@')[0] || 'Admin DBA',
        role: ownAccessRecord?.role || (isAdmin ? 'admin' : 'student'),
        status: targetStatus,
        accessReason:
          targetStatus === 'approved'
            ? 'Accès autorisé par l\'administrateur (Test Live)'
            : targetStatus === 'pending'
            ? 'Simulation : Compte mis en attente de validation'
            : 'Simulation : Accès révoqué pour test de sécurité Firestore',
      });
      showMessage(
        targetStatus === 'approved' ? 'success' : 'info',
        isFr
          ? `Votre statut Firestore (/user_access/${uid}) est maintenant "${targetStatus.toUpperCase()}". Testez une écriture ci-dessous pour observer la réponse de Firestore !`
          : `Your Firestore status (/user_access/${uid}) is now "${targetStatus.toUpperCase()}". Test a write below to see Firestore's response!`
      );
    } catch (err: any) {
      showMessage('error', err?.message || 'Erreur Firestore');
    } finally {
      setIsBusy(false);
    }
  };

  // Exécuter un vrai test d'écriture sur /users/{uid}
  const handleRunLiveFirestoreWriteTest = async () => {
    if (!currentUser) {
      showMessage(
        'error',
        isFr
          ? 'Connectez-vous avec Google pour exécuter un test réel sur Firestore.'
          : 'Sign in with Google to run a real Firestore write test.'
      );
      return;
    }

    setIsBusy(true);
    try {
      const currentStatus = ownAccessRecord?.status || 'non_defini';
      const result = await testFirestoreProtectedWrite(currentUser, selectedCert);
      const entry: LiveWriteTestLog = {
        id: `test-${Date.now()}`,
        timestamp: result.timestamp,
        statusAtTest: currentStatus,
        allowed: result.allowed,
        path: result.path,
        detail: result.detail,
      };
      setWriteTestLogs((prev) => [entry, ...prev].slice(0, 8));
    } finally {
      setIsBusy(false);
    }
  };

  // Créer 3 profils candidats de démonstration
  const handleSeedDemoCandidates = async () => {
    setIsBusy(true);
    try {
      const demoUsers: {
        uid: string;
        email: string;
        displayName: string;
        role: UserAccessRole;
        status: UserAccessStatus;
        accessReason: string;
      }[] = [
        {
          uid: emailToDeterministicUid('alice.martin@entreprise-sql.fr'),
          email: 'alice.martin@entreprise-sql.fr',
          displayName: 'Alice Martin (DBA Junior)',
          role: 'student',
          status: 'approved',
          accessReason: 'Email validé — Préparation certification Oracle 1Z0-071',
        },
        {
          uid: emailToDeterministicUid('thomas.bernard@ecole-ing.fr'),
          email: 'thomas.bernard@ecole-ing.fr',
          displayName: 'Thomas Bernard (Candidat)',
          role: 'student',
          status: 'pending',
          accessReason: 'Demande d\'accès après saisie du mot de passe du site Netlify',
        },
        {
          uid: emailToDeterministicUid('marc.dupuis@externe.com'),
          email: 'marc.dupuis@externe.com',
          displayName: 'Marc Dupuis (Externe)',
          role: 'auditor',
          status: 'revoked',
          accessReason: 'Période d\'essai terminée — Accès révoqué par l\'administrateur',
        },
      ];

      for (const item of demoUsers) {
        await onUpsertEmailRecord(item);
      }

      showMessage(
        'success',
        isFr
          ? '3 profils emails candidats ont été enregistrés. Vous pouvez les valider (Approuver) ou copier leur code d\'accès en un clic !'
          : '3 candidate email profiles have been created. You can approve them or copy their access code in one click!'
      );
    } catch (err: any) {
      showMessage('error', err?.message || 'Erreur lors de la création des profils de test');
    } finally {
      setIsBusy(false);
    }
  };

  // Modifier le statut ou rôle d'un utilisateur de la liste
  const handleUpdateUserRecord = async (
    record: UserAccessRecord,
    updates: Partial<Pick<UserAccessRecord, 'status' | 'role' | 'accessReason'>>
  ) => {
    setIsBusy(true);
    try {
      await onUpsertEmailRecord({
        uid: record.uid,
        email: record.email,
        displayName: record.displayName,
        role: updates.role || record.role,
        status: updates.status || record.status,
        accessReason: updates.accessReason || record.accessReason,
      });
      showMessage(
        'success',
        isFr
          ? `Email ${record.email} mis à jour : ${(updates.status || record.status).toUpperCase()}.`
          : `Email ${record.email} updated: ${(updates.status || record.status).toUpperCase()}.`
      );
    } catch (err: any) {
      showMessage('error', err?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteUserRecord = async (record: UserAccessRecord) => {
    setIsBusy(true);
    try {
      await onDeleteEmailRecord(record);
      showMessage(
        'info',
        isFr
          ? `Email ${record.email} supprimé de la liste de contrôle d'accès.`
          : `Email ${record.email} deleted from the access control list.`
      );
    } catch (err: any) {
      showMessage('error', err?.message || 'Erreur lors de la suppression');
    } finally {
      setIsBusy(false);
    }
  };

  const handleCreateCustomAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setIsBusy(true);
    try {
      const cleanEmail = newEmail.trim().toLowerCase();
      const deterministicUid = emailToDeterministicUid(cleanEmail);
      await onUpsertEmailRecord({
        uid: deterministicUid,
        email: cleanEmail,
        displayName: newDisplayName.trim() || cleanEmail.split('@')[0] || 'Utilisateur',
        role: newRole,
        status: newStatus,
        accessReason:
          newReason.trim() ||
          (newStatus === 'approved'
            ? 'Email pré-validé par l\'administrateur'
            : 'Ajouté manuellement par l\'administrateur'),
      });
      setNewEmail('');
      setNewDisplayName('');
      setNewReason('');
      showMessage(
        'success',
        isFr
          ? `Email "${cleanEmail}" enregistré avec le statut ${newStatus.toUpperCase()}. Code de validation : ${generateEmailValidationCode(cleanEmail, siteGateConfig.sitePassword)}`
          : `Email "${cleanEmail}" saved with status ${newStatus.toUpperCase()}. Validation code: ${generateEmailValidationCode(cleanEmail, siteGateConfig.sitePassword)}`
      );
    } catch (err: any) {
      showMessage('error', err?.message || 'Erreur création accès');
    } finally {
      setIsBusy(false);
    }
  };

  const filteredRecords = allAccessRecords.filter((r) =>
    statusFilter === 'all' ? true : r.status === statusFilter
  );

  const statsCounts = {
    total: allAccessRecords.length,
    approved: allAccessRecords.filter((r) => r.status === 'approved').length,
    pending: allAccessRecords.filter((r) => r.status === 'pending').length,
    revoked: allAccessRecords.filter((r) => r.status === 'revoked').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      {/* En-tête principal */}
      <div className="p-6 rounded-2xl bg-[#102034] border border-[#1b2b3f] shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-[#0284c7]/20 border border-[#38bdf8]/40 text-[#38bdf8] shrink-0">
            <KeyRound className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#0284c7]/20 text-[#38bdf8] border border-[#38bdf8]/30 font-bold">
                Double Verrouillage Netlify (Mot de Passe + Email)
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/30 font-bold">
                Firestore RBAC • rules_version = &apos;2&apos;
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#d3e4fe] mt-1.5">
              {isFr
                ? 'Portail d\'Accès en 2 Étapes : Mot de Passe du Site & Validation par Email'
                : '2-Step Access Gate: Site Password & Email Approval'}
            </h1>
            <p className="text-sm text-[#bfc7d2] mt-1 max-w-3xl">
              {isFr
                ? 'Idéal pour un hébergement public sur Netlify : les visiteurs doivent d\'abord saisir le mot de passe du site (Étape 1), puis renseigner une adresse email que vous validez dans cette console (Étape 2) avant de pouvoir accéder à l\'application.'
                : 'Ideal for public Netlify hosting: visitors must first enter the site password (Step 1), then provide an email address that you approve in this console (Step 2) before accessing the application.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenGatekeeperPreview(1)}
            className="px-4 py-2.5 rounded-xl bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe] border border-[#38bdf8]/40 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Eye className="w-4 h-4 text-[#38bdf8]" />
            <span>
              {isFr ? 'Tester le Portail (Étape 1 & 2)' : 'Test Gatekeeper (Step 1 & 2)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateSiteGateConfig({
                ...siteGateConfig,
                gateEnabled: !siteGateConfig.gateEnabled,
              })
            }
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shadow-sm ${
              siteGateConfig.gateEnabled
                ? 'bg-[#00a572] text-white border-[#4edea3]'
                : 'bg-[#0b1c30] text-[#bfc7d2] border-[#1b2b3f] hover:border-[#38bdf8]/50'
            }`}
          >
            {siteGateConfig.gateEnabled ? (
              <>
                <Lock className="w-4 h-4" />
                <span>
                  {isFr ? 'Protection Active (Netlify)' : 'Protection Active (Netlify)'}
                </span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-[#fbbf24]" />
                <span>
                  {isFr ? 'Protection Désactivée' : 'Protection Disabled'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message de feedback */}
      {feedbackBanner && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono ${
            feedbackBanner.type === 'success'
              ? 'bg-[#00a572]/15 border-[#4edea3]/50 text-[#4edea3]'
              : feedbackBanner.type === 'error'
              ? 'bg-[#ef4444]/15 border-[#ef4444]/50 text-[#ffb4ab]'
              : 'bg-[#0284c7]/15 border-[#38bdf8]/50 text-[#93ccff]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : feedbackBanner.type === 'error' ? (
              <XCircle className="w-4 h-4 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            {isFr ? 'Fermer' : 'Close'}
          </button>
        </div>
      )}

      {/* SECTION 0 : CONFIGURATION DU PORTAIL EN 2 ÉTAPES (NETLIFY : MOT DE PASSE + EMAIL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Étape 1 : Configuration du Mot de Passe du Site (Protection Netlify) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#102034] border border-[#1b2b3f] shadow-md flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#1b2b3f] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#0284c7] text-white font-mono text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <h2 className="text-base font-bold text-[#d3e4fe]">
                  {isFr
                    ? 'Étape 1 : Mot de passe général du site (Accès Netlify)'
                    : 'Step 1: Site-wide Password (Netlify Gate)'}
                </h2>
              </div>
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md border font-bold ${
                  isStep1Unlocked
                    ? 'bg-[#00a572]/20 text-[#4edea3] border-[#4edea3]/40'
                    : 'bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/40'
                }`}
              >
                {isStep1Unlocked
                  ? isFr
                    ? 'Session déverrouillée ✓'
                    : 'Session unlocked ✓'
                  : isFr
                  ? 'Verrouillé'
                  : 'Locked'}
              </span>
            </div>

            <p className="text-xs text-[#bfc7d2] leading-relaxed">
              {isFr
                ? 'Lorsque votre site est déployé en mode public sur Netlify, cet écran demande d\'abord ce mot de passe avant même d\'afficher le formulaire d\'accès par email.'
                : 'When your site is deployed publicly on Netlify, this screen requires this password before showing the email access form.'}
            </p>

            <form onSubmit={handleSaveSitePassword} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type={showSitePassword ? 'text' : 'password'}
                  value={passwordDraft}
                  onChange={(e) => setPasswordDraft(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-20 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] font-mono text-xs text-[#d3e4fe] outline-none focus:border-[#38bdf8]"
                  placeholder="DBMASTERY-2026"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowSitePassword((p) => !p)}
                    className="p-1.5 text-[#89929b] hover:text-[#d3e4fe] cursor-pointer"
                    title={isFr ? 'Afficher / Masquer' : 'Show / Hide'}
                  >
                    {showSitePassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        siteGateConfig.sitePassword,
                        'site_pwd',
                        isFr
                          ? 'Mot de passe du site copié dans le presse-papiers !'
                          : 'Site password copied to clipboard!'
                      )
                    }
                    className="p-1.5 text-[#38bdf8] hover:text-white cursor-pointer"
                    title={isFr ? 'Copier le mot de passe' : 'Copy password'}
                  >
                    {copiedKey === 'site_pwd' ? (
                      <Check className="w-3.5 h-3.5 text-[#4edea3]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono text-xs font-bold shrink-0 cursor-pointer"
              >
                {isFr ? 'Enregistrer le mot de passe' : 'Save Password'}
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-[#1b2b3f] flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] font-mono text-[#89929b] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>
                Netlify Env Var : <code className="text-[#89ceff]">VITE_SITE_ACCESS_PASSWORD</code>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onLockStep1ForTest();
                onOpenGatekeeperPreview(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#0b1c30] hover:bg-[#1b2b3f] text-[#fbbf24] border border-[#f59e0b]/40 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {isFr
                  ? 'Verrouiller & Tester l\'Étape 1 (Mot de passe)'
                  : 'Lock & Test Step 1 (Password)'}
              </span>
            </button>
          </div>
        </div>

        {/* Étape 2 : Fonctionnement de la Validation par Email */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#102034] border border-[#1b2b3f] shadow-md flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#1b2b3f] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#00a572] text-white font-mono text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <h2 className="text-base font-bold text-[#d3e4fe]">
                  {isFr
                    ? 'Étape 2 : Accès par Email validé par vos soins'
                    : 'Step 2: Email Access Approved by You'}
                </h2>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-[#0284c7]/20 text-[#38bdf8] border border-[#38bdf8]/30 font-bold">
                {statsCounts.approved} {isFr ? 'Emails validés' : 'Approved Emails'} •{' '}
                {statsCounts.pending} {isFr ? 'En attente' : 'Pending'}
              </span>
            </div>

            <p className="text-xs text-[#bfc7d2] leading-relaxed">
              {isFr
                ? 'Une fois le mot de passe du site saisi (Étape 1), le visiteur doit renseigner son adresse email (ou se connecter avec Google). Il reste bloqué sur un écran d\'attente tant que vous n\'avez pas validé son email dans le tableau ci-dessous.'
                : 'Once the site password is entered (Step 1), the visitor must enter their email (or sign in with Google). They remain on a waiting screen until you approve their email in the table below.'}
            </p>

            <div className="p-3.5 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#89ceff] font-bold">
                  {isFr
                    ? 'Deux modes de validation Email pris en charge :'
                    : 'Two supported Email validation modes:'}
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-[#bfc7d2]">
                <li>
                  • <strong>{isFr ? 'En direct via Firestore :' : 'Live via Firestore:'}</strong>{' '}
                  {isFr
                    ? 'L\'utilisateur s\'identifie avec son email et dès que vous cliquez sur « Approuver », sa page se déverrouille instantanément.'
                    : 'The user signs in with their email and as soon as you click "Approve", their screen unlocks immediately.'}
                </li>
                <li>
                  • <strong>{isFr ? 'Par Code de Validation Email :' : 'Via Email Validation Code:'}</strong>{' '}
                  {isFr
                    ? 'Chaque email approuvé possède un code unique (ex: VAL-XXXX-XXXX) que vous pouvez copier en 1 clic et envoyer à la personne.'
                    : 'Each approved email gets a unique code (e.g. VAL-XXXX-XXXX) that you can copy in 1 click and send to the user.'}
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1b2b3f] flex flex-wrap items-center justify-between gap-2">
            {step2EmailSession ? (
              <div className="text-[11px] font-mono text-[#4edea3] flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span>
                  Email testé : <strong>{step2EmailSession.email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateStep2EmailSession(null)}
                  className="text-[#ffb4ab] underline ml-1 cursor-pointer"
                >
                  {isFr ? 'Réinitialiser' : 'Reset'}
                </button>
              </div>
            ) : (
              <span className="text-[11px] font-mono text-[#89929b]">
                {isFr
                  ? 'Admin principal : ' + BOOTSTRAPPED_ADMIN_EMAIL
                  : 'Primary Admin: ' + BOOTSTRAPPED_ADMIN_EMAIL}
              </span>
            )}

            <button
              type="button"
              onClick={() => onOpenGatekeeperPreview(2)}
              className="px-3 py-1.5 rounded-lg bg-[#0284c7]/20 hover:bg-[#0284c7] text-[#38bdf8] hover:text-white border border-[#38bdf8]/40 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>
                {isFr
                  ? 'Tester l\'Étape 2 (Saisie & Validation Email)'
                  : 'Test Step 2 (Email Input & Approval)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1 : Console d'Administration des Emails (/user_access) */}
      <div className="p-6 rounded-2xl bg-[#102034] border border-[#1b2b3f] shadow-md flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1b2b3f]">
          <div>
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#38bdf8]" />
              <h2 className="text-lg font-bold text-[#d3e4fe]">
                {isFr
                  ? 'Liste des Emails & Validation d\'Accès (/user_access)'
                  : 'Email List & Access Approval (/user_access)'}
              </h2>
            </div>
            <p className="text-xs text-[#89929b] mt-1">
              {isFr
                ? 'Validez (Approuvez), mettez en attente ou bloquez les adresses email. Vous pouvez aussi pré-valider un email ci-dessous et copier son invitation complète.'
                : 'Approve, set pending, or revoke email addresses. You can also pre-approve an email below and copy its full invitation.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={handleSeedDemoCandidates}
              className="px-3.5 py-2 rounded-xl bg-[#1b2b3f] hover:bg-[#26364a] text-[#89ceff] border border-[#38bdf8]/30 font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {isFr
                  ? 'Générer 3 emails candidats de test'
                  : 'Seed 3 test candidate emails'}
              </span>
            </button>

            {/* Filtres par statut */}
            <div className="flex items-center bg-[#0b1c30] p-1 rounded-xl border border-[#1b2b3f] text-xs font-mono">
              {(
                [
                  { id: 'all', labelFr: `Tous (${statsCounts.total})`, labelEn: `All (${statsCounts.total})` },
                  { id: 'approved', labelFr: `Validés (${statsCounts.approved})`, labelEn: `Approved (${statsCounts.approved})` },
                  { id: 'pending', labelFr: `En attente (${statsCounts.pending})`, labelEn: `Pending (${statsCounts.pending})` },
                  { id: 'revoked', labelFr: `Bloqués (${statsCounts.revoked})`, labelEn: `Revoked (${statsCounts.revoked})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-[#0284c7] text-white font-bold'
                      : 'text-[#89929b] hover:text-[#d3e4fe]'
                  }`}
                >
                  {isFr ? tab.labelFr : tab.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Formulaire rapide pour Pré-valider / Ajouter une adresse Email */}
        <form
          onSubmit={handleCreateCustomAccess}
          className="p-4 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          <div className="md:col-span-12 pb-1">
            <span className="text-xs font-bold text-[#38bdf8] font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {isFr
                ? 'Pré-valider ou ajouter une adresse Email autorisée :'
                : 'Pre-approve or add an authorized Email address:'}
            </span>
          </div>
          <div className="md:col-span-3">
            <label className="block text-[11px] font-mono text-[#89929b] mb-1">
              {isFr ? 'Adresse Email à autoriser' : 'Email Address to authorize'}
            </label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="collaborateur@exemple.fr"
              className="w-full h-9 px-3 rounded-lg bg-[#102034] border border-[#1b2b3f] text-xs text-[#d3e4fe] outline-none focus:border-[#38bdf8]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono text-[#89929b] mb-1">
              {isFr ? 'Nom / Prénom' : 'Full Name'}
            </label>
            <input
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Jean Dupont"
              className="w-full h-9 px-3 rounded-lg bg-[#102034] border border-[#1b2b3f] text-xs text-[#d3e4fe] outline-none focus:border-[#38bdf8]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono text-[#89929b] mb-1">
              {isFr ? 'Rôle' : 'Role'}
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserAccessRole)}
              className="w-full h-9 px-2.5 rounded-lg bg-[#102034] border border-[#1b2b3f] text-xs font-mono text-[#d3e4fe]"
            >
              <option value="student">student</option>
              <option value="auditor">auditor</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] font-mono text-[#89929b] mb-1">
              {isFr ? 'Statut initial' : 'Initial Status'}
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as UserAccessStatus)}
              className="w-full h-9 px-2.5 rounded-lg bg-[#102034] border border-[#1b2b3f] text-xs font-mono text-[#d3e4fe]"
            >
              <option value="approved">approved (Validé)</option>
              <option value="pending">pending (En attente)</option>
              <option value="revoked">revoked (Bloqué)</option>
            </select>
          </div>
          <div className="md:col-span-3 flex gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-mono text-[#89929b] mb-1">
                {isFr ? 'Note / Motif' : 'Note / Reason'}
              </label>
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder={isFr ? 'Accès validé par Admin' : 'Approved by Admin'}
                className="w-full h-9 px-3 rounded-lg bg-[#102034] border border-[#1b2b3f] text-xs text-[#d3e4fe] outline-none focus:border-[#38bdf8]"
              />
            </div>
            <button
              type="submit"
              disabled={isBusy}
              className="h-9 px-3.5 rounded-lg bg-[#00a572] hover:bg-[#059669] text-white font-mono text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer self-end"
            >
              <Plus className="w-4 h-4" />
              <span>{isFr ? 'Valider Email' : 'Add Email'}</span>
            </button>
          </div>
        </form>

        {/* Table des utilisateurs */}
        {filteredRecords.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] text-center flex flex-col items-center gap-3">
            <Users className="w-8 h-8 text-[#89929b]" />
            <p className="text-sm font-semibold text-[#d3e4fe]">
              {isFr
                ? 'Aucun email enregistré dans ce filtre'
                : 'No email records in this filter'}
            </p>
            <button
              type="button"
              onClick={handleSeedDemoCandidates}
              className="px-4 py-2 rounded-xl bg-[#0284c7] text-white text-xs font-mono font-bold cursor-pointer"
            >
              {isFr
                ? '+ Générer 3 profils emails de démonstration'
                : '+ Seed 3 demo email profiles'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1b2b3f] text-[11px] font-mono uppercase text-[#89929b]">
                  <th className="py-3 px-3">{isFr ? 'Utilisateur & Email' : 'User & Email'}</th>
                  <th className="py-3 px-3">{isFr ? 'Statut Email' : 'Email Status'}</th>
                  <th className="py-3 px-3">
                    {isFr ? 'Code Validation Email (Étape 2)' : 'Email Validation Code (Step 2)'}
                  </th>
                  <th className="py-3 px-3">{isFr ? 'Motif / Note' : 'Reason / Note'}</th>
                  <th className="py-3 px-3 text-right">
                    {isFr ? 'Validation Administrateur' : 'Admin Approval'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2b3f] text-xs">
                {filteredRecords.map((rec) => {
                  const isSelf = currentUser && sanitizeId(currentUser.uid) === rec.uid;
                  const emailCode = generateEmailValidationCode(
                    rec.email,
                    siteGateConfig.sitePassword
                  );
                  const inviteCopyText = isFr
                    ? `Accès DBMastery Studio :\n1) Mot de passe du site (Étape 1) : ${siteGateConfig.sitePassword}\n2) Votre Email autorisé (Étape 2) : ${rec.email}\n3) Votre Code de validation Email : ${emailCode}`
                    : `DBMastery Studio Access:\n1) Site Password (Step 1): ${siteGateConfig.sitePassword}\n2) Authorized Email (Step 2): ${rec.email}\n3) Email Validation Code: ${emailCode}`;

                  return (
                    <tr key={rec.uid} className="hover:bg-[#0b1c30]/60 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#d3e4fe] flex items-center gap-1.5">
                            {rec.displayName}
                            {isSelf && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0284c7]/20 text-[#38bdf8] border border-[#38bdf8]/30">
                                {isFr ? 'Vous (Admin)' : 'You (Admin)'}
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-xs text-[#89ceff] font-semibold">
                            {rec.email}
                          </span>
                          <span className="font-mono text-[10px] text-[#89929b]">
                            Rôle: {rec.role} • ID: {rec.uid}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {rec.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/40 font-mono text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isFr ? 'Email Validé (Approved)' : 'Approved'}
                          </span>
                        ) : rec.status === 'revoked' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#ef4444]/20 text-[#ffb4ab] border border-[#ef4444]/40 font-mono text-[11px] font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            {isFr ? 'Refusé / Bloqué' : 'Revoked'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40 font-mono text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            {isFr ? 'En attente de validation' : 'Pending Approval'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <code className="px-2 py-1 rounded bg-[#0b1c30] border border-[#1b2b3f] font-mono text-[11px] text-[#38bdf8] font-bold">
                            {emailCode}
                          </code>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText(
                                inviteCopyText,
                                `inv_${rec.uid}`,
                                isFr
                                  ? `Invitation complète (Mot de passe site + Code pour ${rec.email}) copiée !`
                                  : `Full invite (Site password + Code for ${rec.email}) copied!`
                              )
                            }
                            className="px-2 py-1 rounded bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe] font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                            title={
                              isFr
                                ? 'Copier le Mot de passe du site + Code Email pour cet utilisateur'
                                : 'Copy Site Password + Email Code for this user'
                            }
                          >
                            {copiedKey === `inv_${rec.uid}` ? (
                              <Check className="w-3 h-3 text-[#4edea3]" />
                            ) : (
                              <Copy className="w-3 h-3 text-[#89ceff]" />
                            )}
                            <span>{isFr ? 'Copier accès' : 'Copy access'}</span>
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 max-w-xs">
                        <span className="text-[#bfc7d2] line-clamp-2">{rec.accessReason}</span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isBusy || rec.status === 'approved'}
                            onClick={() =>
                              handleUpdateUserRecord(rec, {
                                status: 'approved',
                                accessReason: 'Email validé par l\'administrateur',
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#00a572]/20 hover:bg-[#00a572] text-[#4edea3] hover:text-white border border-[#4edea3]/40 font-mono text-[11px] font-bold transition-all disabled:opacity-40 cursor-pointer"
                          >
                            {isFr ? 'Valider l\'Email' : 'Approve Email'}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy || rec.status === 'pending'}
                            onClick={() =>
                              handleUpdateUserRecord(rec, {
                                status: 'pending',
                                accessReason: 'Mis en attente de vérification',
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#f59e0b]/20 hover:bg-[#f59e0b] text-[#fbbf24] hover:text-white border border-[#f59e0b]/40 font-mono text-[11px] font-bold transition-all disabled:opacity-40 cursor-pointer"
                          >
                            {isFr ? 'Attente' : 'Pending'}
                          </button>
                          <button
                            type="button"
                            disabled={isBusy || rec.status === 'revoked'}
                            onClick={() =>
                              handleUpdateUserRecord(rec, {
                                status: 'revoked',
                                accessReason: 'Accès révoqué par l\'administrateur',
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#ef4444]/20 hover:bg-[#ef4444] text-[#ffb4ab] hover:text-white border border-[#ef4444]/40 font-mono text-[11px] font-bold transition-all disabled:opacity-40 cursor-pointer"
                          >
                            {isFr ? 'Bloquer' : 'Revoke'}
                          </button>
                          {!isSelf && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleDeleteUserRecord(rec)}
                              title={isFr ? 'Supprimer' : 'Delete'}
                              className="p-1.5 rounded-lg bg-[#0b1c30] hover:bg-[#ef4444]/20 text-[#89929b] hover:text-[#ffb4ab] border border-[#1b2b3f] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2 : Banc d'essai interactif en temps réel Firestore */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#102034] border border-[#1b2b3f] flex flex-col justify-between gap-5 shadow-md">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#1b2b3f]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#fbbf24]" />
                <h2 className="text-base font-bold text-[#d3e4fe]">
                  {isFr
                    ? 'Simulateur Firestore : Tester le blocage des données selon le statut Email'
                    : 'Firestore Simulator: Test Data Blocking by Email Status'}
                </h2>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0b1c30] text-[#89ceff] border border-[#1b2b3f]">
                /user_access/{currentUser ? sanitizeId(currentUser.uid).slice(0, 10) + '…' : '{uid}'}
              </span>
            </div>

            {!currentUser ? (
              <div className="my-6 p-5 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[#d3e4fe]">
                    {isFr
                      ? 'Connectez-vous avec Google pour tester en réel avec Firestore'
                      : 'Sign in with Google to run live Firestore tests'}
                  </p>
                  <p className="text-xs text-[#89929b] mt-1">
                    {isFr
                      ? `Le compte administrateur configuré dans firestore.rules est ${BOOTSTRAPPED_ADMIN_EMAIL}.`
                      : `The administrator account configured in firestore.rules is ${BOOTSTRAPPED_ADMIN_EMAIL}.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  className="px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isFr ? 'Connexion Google' : 'Google Sign-In'}</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#89929b]">
                      {isFr ? 'Compte Google connecté' : 'Connected Google Account'}
                    </span>
                    <p className="text-xs font-bold text-[#d3e4fe] truncate mt-0.5">
                      {currentUser.email}
                    </p>
                    <span className="text-[10px] font-mono text-[#4edea3]">
                      email_verified: {String(currentUser.emailVerified)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#89929b]">
                      {isFr ? 'Rôle Firestore' : 'Firestore Role'}
                    </span>
                    <p className="text-xs font-bold text-[#38bdf8] font-mono uppercase mt-0.5">
                      {ownAccessRecord?.role || (isAdmin ? 'admin' : 'student')}
                      {isAdmin && ' (Bootstrapped)'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#89929b]">
                      {isFr ? 'Statut /user_access/{uid}' : 'Status /user_access/{uid}'}
                    </span>
                    <div className="mt-1">
                      {ownAccessRecord?.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/40 text-xs font-mono font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          APPROVED (Validé)
                        </span>
                      ) : ownAccessRecord?.status === 'revoked' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#ef4444]/20 text-[#ffb4ab] border border-[#ef4444]/40 text-xs font-mono font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          REVOKED (Bloqué)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40 text-xs font-mono font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          PENDING (En attente)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-[#bfc7d2]">
                    {isFr
                      ? 'Étape A — Simulez votre statut d\'autorisation Email dans Firestore :'
                      : 'Step A — Simulate your Email authorization status in Firestore:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleSimulateOwnStatus('approved')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        ownAccessRecord?.status === 'approved'
                          ? 'bg-[#00a572]/20 border-[#4edea3] text-[#d3e4fe]'
                          : 'bg-[#0b1c30] hover:bg-[#1b2b3f] border-[#1b2b3f] text-[#bfc7d2]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#4edea3]">
                          1. APPROVED
                        </span>
                        <UserCheck className="w-4 h-4 text-[#4edea3]" />
                      </div>
                      <span className="text-[11px] leading-snug">
                        {isFr
                          ? 'Email validé : autorise /users/{uid}'
                          : 'Email approved: allows /users/{uid}'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleSimulateOwnStatus('pending')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        ownAccessRecord?.status === 'pending'
                          ? 'bg-[#f59e0b]/20 border-[#fbbf24] text-[#d3e4fe]'
                          : 'bg-[#0b1c30] hover:bg-[#1b2b3f] border-[#1b2b3f] text-[#bfc7d2]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#fbbf24]">
                          2. PENDING
                        </span>
                        <Clock className="w-4 h-4 text-[#fbbf24]" />
                      </div>
                      <span className="text-[11px] leading-snug">
                        {isFr
                          ? 'Email non validé : bloque /users/{uid}'
                          : 'Unapproved email: blocks /users/{uid}'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleSimulateOwnStatus('revoked')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        ownAccessRecord?.status === 'revoked'
                          ? 'bg-[#ef4444]/20 border-[#ef4444] text-[#d3e4fe]'
                          : 'bg-[#0b1c30] hover:bg-[#1b2b3f] border-[#1b2b3f] text-[#bfc7d2]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#ffb4ab]">
                          3. REVOKED
                        </span>
                        <UserX className="w-4 h-4 text-[#ffb4ab]" />
                      </div>
                      <span className="text-[11px] leading-snug">
                        {isFr
                          ? 'Email révoqué : PERMISSION_DENIED'
                          : 'Revoked email: PERMISSION_DENIED'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#1b2b3f]">
                  <div>
                    <span className="text-xs font-semibold text-[#d3e4fe] block">
                      {isFr
                        ? 'Étape B — Vérifier la décision du serveur Firestore :'
                        : 'Step B — Verify Firestore server decision:'}
                    </span>
                    <span className="text-[11px] text-[#89929b]">
                      {isFr
                        ? 'Envoie une écriture réelle sur /users/{uid}. Si votre email est PENDING ou REVOKED, Firestore la rejette !'
                        : 'Sends a real write to /users/{uid}. If email is PENDING or REVOKED, Firestore rejects it!'}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleRunLiveFirestoreWriteTest}
                    className="px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
                  >
                    <Play className="w-4 h-4" />
                    <span>
                      {isFr ? 'Tester une écriture Firestore' : 'Test Firestore Write'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Journal en direct des réponses de sécurité Firestore */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#102034] border border-[#1b2b3f] flex flex-col justify-between gap-4 shadow-md">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2b3f]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-sm font-bold text-[#d3e4fe] font-mono">
                  {isFr ? 'Journal d\'Audit Firestore (Temps Réel)' : 'Live Firestore Audit Log'}
                </h3>
              </div>
              {writeTestLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setWriteTestLogs([])}
                  className="text-[11px] font-mono text-[#89929b] hover:text-[#d3e4fe]"
                >
                  {isFr ? 'Effacer' : 'Clear'}
                </button>
              )}
            </div>

            {writeTestLogs.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center gap-2 text-[#89929b]">
                <ShieldCheck className="w-8 h-8 text-[#38bdf8]/60" />
                <p className="text-xs max-w-xs">
                  {isFr
                    ? 'Cliquez sur « Tester une écriture Firestore » à gauche après avoir changé votre statut (APPROVED, PENDING ou REVOKED) pour voir le verdict réel du serveur.'
                    : 'Click "Test Firestore Write" on the left after switching your status (APPROVED, PENDING, or REVOKED) to inspect the server verdict.'}
                </p>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                {writeTestLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-xl border text-xs font-mono flex flex-col gap-1 ${
                      log.allowed
                        ? 'bg-[#00a572]/15 border-[#4edea3]/40 text-[#d3e4fe]'
                        : 'bg-[#ef4444]/15 border-[#ef4444]/40 text-[#d3e4fe]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-bold flex items-center gap-1.5 ${
                          log.allowed ? 'text-[#4edea3]' : 'text-[#ffb4ab]'
                        }`}
                      >
                        {log.allowed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        {log.allowed ? '200 ALLOWED' : '403 PERMISSION_DENIED'}
                      </span>
                      <span className="text-[10px] text-[#89929b]">
                        {log.timestamp} • status={log.statusAtTest}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#bfc7d2] break-all leading-snug">
                      {log.detail}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] text-[11px] font-mono text-[#89ceff]">
            <div className="font-bold text-[#d3e4fe] mb-1">
              {isFr ? 'Règle active dans firestore.rules :' : 'Active rule in firestore.rules:'}
            </div>
            <code>
              function isApprovedUser(userId) &#123; return exists(.../user_access/$(userId)) &amp;&amp; get(.../user_access/$(userId)).data.status == &apos;approved&apos;; &#125;
            </code>
          </div>
        </div>
      </div>

      {/* SECTION 3 : Matrice d'Audit Red Team (Dirty Dozen) */}
      <div className="p-6 rounded-2xl bg-[#102034] border border-[#1b2b3f] shadow-md flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#1b2b3f] pb-3">
          <div className="flex items-center gap-2.5">
            <FileCode2 className="w-5 h-5 text-[#4edea3]" />
            <h2 className="text-base font-bold text-[#d3e4fe]">
              {isFr
                ? 'Matrice de Sécurité Zero-Trust (12 Payloads Adversariaux bloqués par Firestore)'
                : 'Zero-Trust Security Matrix (12 Adversarial Payloads blocked by Firestore)'}
            </h2>
          </div>
          <span className="text-xs font-mono text-[#4edea3] font-bold">
            12 / 12 PERMISSION_DENIED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dirtyDozenSecurityTests.map((test) => (
            <div
              key={test.id}
              className="p-3.5 rounded-xl bg-[#0b1c30] border border-[#1b2b3f] flex flex-col justify-between gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[#d3e4fe]">
                  #{test.id}. {test.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00a572]/20 text-[#4edea3] border border-[#4edea3]/30 shrink-0">
                  BLOCKED
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#89929b] truncate">
                {test.operation.toUpperCase()} {test.collectionPath}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPOSANT : PORTAIL DE VERROUILLAGE EN 2 ÉTAPES (1. MOT DE PASSE SITE -> 2. EMAIL VALIDÉ)
// ============================================================================

interface AccessGatekeeperOverlayProps {
  lang: 'fr' | 'en';
  currentUser: User | null;
  ownAccessRecord: UserAccessRecord | null;
  allAccessRecords: UserAccessRecord[];
  siteGateConfig: SiteGateConfig;
  isStep1Unlocked: boolean;
  step2EmailSession: Step2EmailSession | null;
  previewStepOverride: 1 | 2 | null;
  isPreviewMode: boolean;
  onUnlockStep1WithPassword: (password: string) => boolean;
  onLockStep1: () => void;
  onSubmitEmailRequest: (params: {
    email: string;
    displayName: string;
    accessReason: string;
    validationCode?: string;
  }) => Promise<{ approved: boolean; message: string }>;
  onClosePreview: () => void;
  onOpenAdminConsole: () => void;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onAdminSelfRestoreApproved: () => Promise<void>;
  selectedCert: CertificationTrackId;
}

export const AccessGatekeeperOverlay: React.FC<AccessGatekeeperOverlayProps> = ({
  lang,
  currentUser,
  ownAccessRecord,
  allAccessRecords,
  siteGateConfig,
  isStep1Unlocked,
  step2EmailSession,
  previewStepOverride,
  isPreviewMode,
  onUnlockStep1WithPassword,
  onLockStep1,
  onSubmitEmailRequest,
  onClosePreview,
  onOpenAdminConsole,
  onGoogleSignIn,
  onSignOut,
  onAdminSelfRestoreApproved,
  selectedCert,
}) => {
  const isFr = lang === 'fr';
  const isAdmin = isUserBootstrappedAdmin(currentUser);

  // Déterminer si l'écran affiche l'Étape 1 (Mot de passe du site) ou l'Étape 2 (Email soumis à validation)
  const [forcedStep, setForcedStep] = useState<1 | 2 | null>(previewStepOverride);
  const currentStep: 1 | 2 =
    forcedStep !== null ? forcedStep : !isStep1Unlocked ? 1 : 2;

  // États Étape 1 (Mot de passe du site)
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // États Étape 2 (Identification & Validation par Email)
  const [emailInput, setEmailInput] = useState(
    step2EmailSession?.email || currentUser?.email || ''
  );
  const [nameInput, setNameInput] = useState(
    step2EmailSession?.displayName ||
      ownAccessRecord?.displayName ||
      currentUser?.displayName ||
      ''
  );
  const [reasonInput, setReasonInput] = useState(
    step2EmailSession?.accessReason ||
      ownAccessRecord?.accessReason ||
      'Demande d\'accès au parcours de certification SQL'
  );
  const [validationCodeInput, setValidationCodeInput] = useState('');
  const [step2Feedback, setStep2Feedback] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);

  const [liveTestResult, setLiveTestResult] = useState<{
    allowed: boolean;
    detail: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vérifier le statut de l'email actuellement renseigné
  const activeEmail = (
    emailInput.trim() ||
    step2EmailSession?.email ||
    currentUser?.email ||
    ''
  ).toLowerCase();

  const matchingRecord = allAccessRecords.find(
    (r) => r.email.trim().toLowerCase() === activeEmail
  );

  const effectiveStatus: UserAccessStatus =
    (currentUser &&
      currentUser.email?.toLowerCase() === activeEmail &&
      ownAccessRecord?.status) ||
    matchingRecord?.status ||
    (step2EmailSession?.email === activeEmail && step2EmailSession?.validatedByCode
      ? 'approved'
      : 'pending');

  // Validation Étape 1 : Mot de passe du site
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep1Error(null);
    const ok = onUnlockStep1WithPassword(passwordInput);
    if (ok) {
      setPasswordInput('');
      setForcedStep(2);
    } else {
      setStep1Error(
        isFr
          ? 'Mot de passe du site incorrect. Veuillez vérifier le mot de passe communiqué par l\'administrateur.'
          : 'Incorrect site password. Please check the password provided by the administrator.'
      );
    }
  };

  // Validation Étape 2 : Soumission de l'Email (et/ou du code de validation)
  const handleStep2EmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSubmitting(true);
    setStep2Feedback(null);
    try {
      // Si l'utilisateur est connecté avec Google et met à jour son motif
      if (
        currentUser &&
        currentUser.email?.toLowerCase() === emailInput.trim().toLowerCase() &&
        ownAccessRecord?.status === 'pending' &&
        !validationCodeInput.trim()
      ) {
        await updatePendingAccessReason(currentUser, nameInput, reasonInput);
      }

      const result = await onSubmitEmailRequest({
        email: emailInput.trim().toLowerCase(),
        displayName: nameInput.trim() || emailInput.split('@')[0] || 'Candidat',
        accessReason:
          reasonInput.trim() || 'Demande d\'accès soumise après mot de passe du site',
        validationCode: validationCodeInput.trim() || undefined,
      });

      setStep2Feedback({
        type: result.approved ? 'success' : 'warning',
        text: result.message,
      });
    } catch (err: any) {
      setStep2Feedback({
        type: 'error',
        text: err?.message || 'Erreur lors de la vérification de l\'email',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestBlockedWrite = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const res = await testFirestoreProtectedWrite(currentUser, selectedCert);
      setLiveTestResult({ allowed: res.allowed, detail: res.detail });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#031427]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-y-auto">
      {/* Barre supérieure de contrôle Administrateur (pour tester facilement Étape 1 & Étape 2) */}
      {(isAdmin || isPreviewMode) && (
        <div className="w-full max-w-2xl mb-4 p-3.5 rounded-2xl bg-[#102034] border border-[#38bdf8]/50 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#4edea3] shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-[#d3e4fe] block">
                {isFr
                  ? 'Barre de Contrôle Administrateur (Test du Portail Netlify en 2 Étapes)'
                  : 'Admin Control Bar (2-Step Netlify Gate Test)'}
              </span>
              <span className="text-[#89ceff] text-[11px] font-mono">
                {isFr
                  ? `Mot de passe actuel (Étape 1) : "${siteGateConfig.sitePassword}"`
                  : `Current site password (Step 1): "${siteGateConfig.sitePassword}"`}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setForcedStep(1)}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold cursor-pointer border ${
                currentStep === 1
                  ? 'bg-[#0284c7] text-white border-[#38bdf8]'
                  : 'bg-[#0b1c30] text-[#89ceff] border-[#1b2b3f]'
              }`}
            >
              {isFr ? 'Voir Étape 1 (Mot de passe)' : 'View Step 1 (Password)'}
            </button>
            <button
              type="button"
              onClick={() => setForcedStep(2)}
              className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold cursor-pointer border ${
                currentStep === 2
                  ? 'bg-[#0284c7] text-white border-[#38bdf8]'
                  : 'bg-[#0b1c30] text-[#89ceff] border-[#1b2b3f]'
              }`}
            >
              {isFr ? 'Voir Étape 2 (Email)' : 'View Step 2 (Email)'}
            </button>
            {isAdmin && ownAccessRecord?.status !== 'approved' && (
              <button
                type="button"
                onClick={onAdminSelfRestoreApproved}
                className="px-3 py-1.5 rounded-lg bg-[#00a572] hover:bg-[#059669] text-white font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{isFr ? 'Me ré-autoriser' : 'Re-approve Me'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onUnlockStep1WithPassword(siteGateConfig.sitePassword);
                onOpenAdminConsole();
                onClosePreview();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe] border border-[#38bdf8]/40 font-mono text-[11px] font-bold cursor-pointer"
            >
              {isFr ? 'Ouvrir Console Admin →' : 'Open Admin Console →'}
            </button>
          </div>
        </div>
      )}

      {/* Carte principale du Portail à 2 Étapes */}
      <div className="w-full max-w-xl p-7 rounded-3xl bg-[#0b1c30] border border-[#1b2b3f] shadow-2xl flex flex-col gap-6">
        {/* Stepper Visuel : Étape 1 (Mot de passe) -> Étape 2 (Validation Email) */}
        <div className="grid grid-cols-2 gap-3 p-2 rounded-2xl bg-[#102034] border border-[#1b2b3f]">
          <div
            className={`p-3 rounded-xl flex items-center gap-2.5 border transition-all ${
              currentStep === 1
                ? 'bg-[#0284c7]/20 border-[#38bdf8] text-[#d3e4fe]'
                : isStep1Unlocked
                ? 'bg-[#00a572]/15 border-[#4edea3]/40 text-[#4edea3]'
                : 'bg-[#0b1c30] border-[#1b2b3f] text-[#89929b]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                isStep1Unlocked && currentStep !== 1
                  ? 'bg-[#00a572] text-white'
                  : currentStep === 1
                  ? 'bg-[#0284c7] text-white'
                  : 'bg-[#1b2b3f] text-[#89929b]'
              }`}
            >
              {isStep1Unlocked && currentStep !== 1 ? '✓' : '1'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase block opacity-80">
                {isFr ? 'Étape 1 / 2' : 'Step 1 / 2'}
              </span>
              <span className="text-xs font-bold truncate block">
                {isFr ? 'Mot de passe du site' : 'Site Password'}
              </span>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl flex items-center gap-2.5 border transition-all ${
              currentStep === 2
                ? 'bg-[#0284c7]/20 border-[#38bdf8] text-[#d3e4fe]'
                : 'bg-[#0b1c30] border-[#1b2b3f] text-[#89929b]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                currentStep === 2
                  ? 'bg-[#0284c7] text-white'
                  : 'bg-[#1b2b3f] text-[#89929b]'
              }`}
            >
              2
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase block opacity-80">
                {isFr ? 'Étape 2 / 2' : 'Step 2 / 2'}
              </span>
              <span className="text-xs font-bold truncate block">
                {isFr ? 'Email validé par Admin' : 'Admin-Approved Email'}
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================================
            AFFICHAGE DE L'ÉTAPE 1 : MOT DE PASSE D'ACCÈS AU SITE (NETLIFY)
           ===================================================================== */}
        {currentStep === 1 ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 rounded-2xl bg-[#0284c7]/20 border border-[#38bdf8]/40 text-[#38bdf8]">
                <KeyRound className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#0284c7]/20 text-[#38bdf8] font-bold">
                  {isFr
                    ? 'Étape 1 : Protection par Mot de Passe'
                    : 'Step 1: Password Protection'}
                </span>
                <h2 className="text-xl font-bold text-[#d3e4fe] mt-1">
                  {isFr
                    ? 'Accès Privé à DBMastery Studio'
                    : 'Private Access to DBMastery Studio'}
                </h2>
              </div>
            </div>

            <p className="text-sm text-[#bfc7d2] leading-relaxed">
              {isFr
                ? 'Ce site est protégé par un mot de passe d\'accès. Saisissez d\'abord le mot de passe du site pour accéder à l\'étape d\'identification par adresse email.'
                : 'This site is protected by an access password. First enter the site password to proceed to email identification.'}
            </p>

            <form onSubmit={handleStep1Submit} className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-[#89ceff] font-semibold">
                    {isFr ? 'Mot de passe d\'accès au site' : 'Site Access Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setPasswordInput(siteGateConfig.sitePassword)}
                    className="text-[11px] font-mono text-[#38bdf8] hover:underline cursor-pointer"
                  >
                    {isFr
                      ? `Remplir auto (${siteGateConfig.sitePassword})`
                      : `Auto-fill (${siteGateConfig.sitePassword})`}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={
                      isFr ? 'Entrez le mot de passe du site…' : 'Enter site password…'
                    }
                    className="w-full h-11 pl-4 pr-11 rounded-xl bg-[#102034] border border-[#1b2b3f] font-mono text-sm text-[#d3e4fe] outline-none focus:border-[#38bdf8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#89929b] hover:text-[#d3e4fe] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {step1Error && (
                <div className="p-3 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/40 text-xs font-mono text-[#ffb4ab] flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{step1Error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                <span>
                  {isFr
                    ? 'Valider le mot de passe et passer à l\'Étape 2 (Email)'
                    : 'Verify Password & Continue to Step 2 (Email)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* =====================================================================
              AFFICHAGE DE L'ÉTAPE 2 : IDENTIFICATION & VALIDATION PAR EMAIL
             ===================================================================== */
          <div className="flex flex-col gap-5">
            {/* Bandeau confirmant que l'Étape 1 est validée */}
            <div className="p-2.5 px-3.5 rounded-xl bg-[#00a572]/15 border border-[#4edea3]/30 flex items-center justify-between text-xs font-mono">
              <span className="text-[#4edea3] flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {isFr
                  ? 'Étape 1 validée : Mot de passe du site correct'
                  : 'Step 1 verified: Site password accepted'}
              </span>
              <button
                type="button"
                onClick={() => {
                  onLockStep1();
                  setForcedStep(1);
                }}
                className="text-[11px] text-[#89ceff] hover:underline cursor-pointer"
              >
                {isFr ? 'Re-verrouiller Étape 1' : 'Re-lock Step 1'}
              </button>
            </div>

            <div className="flex items-center gap-3.5">
              <div
                className={`p-3.5 rounded-2xl border ${
                  effectiveStatus === 'revoked'
                    ? 'bg-[#ef4444]/20 border-[#ef4444]/40 text-[#ffb4ab]'
                    : effectiveStatus === 'approved'
                    ? 'bg-[#00a572]/20 border-[#4edea3]/40 text-[#4edea3]'
                    : 'bg-[#f59e0b]/20 border-[#f59e0b]/40 text-[#fbbf24]'
                }`}
              >
                {effectiveStatus === 'revoked' ? (
                  <ShieldAlert className="w-7 h-7" />
                ) : (
                  <Mail className="w-7 h-7" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#0284c7]/20 text-[#38bdf8] font-bold">
                  {isFr
                    ? 'Étape 2 : Accès par Email validé par l\'Administrateur'
                    : 'Step 2: Admin-Approved Email Access'}
                </span>
                <h2 className="text-xl font-bold text-[#d3e4fe] mt-1">
                  {effectiveStatus === 'revoked'
                    ? isFr
                      ? 'Adresse Email Bloquée / Révoquée'
                      : 'Email Address Revoked'
                    : isFr
                    ? 'Vérification & Validation de votre Email'
                    : 'Email Verification & Approval'}
                </h2>
              </div>
            </div>

            <p className="text-xs text-[#bfc7d2] leading-relaxed">
              {isFr
                ? `Saisissez votre adresse email ci-dessous (ou identifiez-vous avec Google). L'administrateur (${BOOTSTRAPPED_ADMIN_EMAIL}) doit valider votre adresse email pour vous donner l'accès au site.`
                : `Enter your email address below (or sign in with Google). The administrator (${BOOTSTRAPPED_ADMIN_EMAIL}) must approve your email to grant site access.`}
            </p>

            {/* Formulaire direct par Email (Fonctionne avec la liste d'approbation Admin + Code Email) */}
            <form onSubmit={handleStep2EmailSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#89ceff] mb-1">
                    {isFr ? 'Votre adresse Email *' : 'Your Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="prenom.nom@entreprise.fr"
                    className="w-full h-9 px-3 rounded-lg bg-[#102034] border border-[#1b2b3f] text-xs text-[#d3e4fe] outline-none focus:border-[#38bdf8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#89ceff] mb-1">
                    {isFr ? 'Votre Nom / Prénom' : 'Your Full Name'}
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full h-9 px-3 rounded-lg bg-[#102034] border border-[#1b2b3f] text-xs text-[#d3e4fe] outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#89ceff] mb-1">
                  {isFr
                    ? 'Motif de la demande d\'accès (transmis à l\'administrateur)'
                    : 'Reason for access request (sent to administrator)'}
                </label>
                <input
                  type="text"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#102034] border border-[#1b2b3f] text-xs text-[#d3e4fe] outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#fbbf24] mb-1">
                  {isFr
                    ? 'Code de validation Email (Optionnel — si l\'admin a déjà validé votre email)'
                    : 'Email Validation Code (Optional — if admin already approved your email)'}
                </label>
                <input
                  type="text"
                  value={validationCodeInput}
                  onChange={(e) => setValidationCodeInput(e.target.value)}
                  placeholder="Ex: VAL-XXXX-XXXX"
                  className="w-full h-9 px-3 rounded-lg bg-[#102034] border border-[#1b2b3f] font-mono text-xs text-[#d3e4fe] outline-none focus:border-[#fbbf24]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isFr
                    ? 'Vérifier mon Email / Envoyer ma demande de validation'
                    : 'Verify Email / Submit Approval Request'}
                </span>
              </button>
            </form>

            {step2Feedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                  step2Feedback.type === 'success'
                    ? 'bg-[#00a572]/15 border-[#4edea3]/50 text-[#4edea3]'
                    : step2Feedback.type === 'warning'
                    ? 'bg-[#f59e0b]/15 border-[#f59e0b]/50 text-[#fbbf24]'
                    : 'bg-[#ef4444]/15 border-[#ef4444]/50 text-[#ffb4ab]'
                }`}
              >
                {step2Feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 leading-relaxed">{step2Feedback.text}</div>
              </div>
            )}

            {/* Connexion Google (Synchronisation directe Firebase Auth + Firestore) */}
            <div className="pt-3 border-t border-[#1b2b3f] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#89929b]">
                  {currentUser
                    ? isFr
                      ? `Connecté avec Google : ${currentUser.email}`
                      : `Signed in with Google: ${currentUser.email}`
                    : isFr
                    ? 'Ou vérifiez automatiquement votre email avec Google :'
                    : 'Or verify your email automatically with Google:'}
                </span>
                {currentUser ? (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="text-xs font-mono text-[#ffb4ab] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Changer de compte' : 'Switch account'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="px-3.5 py-2 rounded-xl bg-[#102034] hover:bg-[#1b2b3f] text-[#89ceff] border border-[#38bdf8]/40 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Connexion Google' : 'Google Sign-In'}</span>
                  </button>
                )}
              </div>

              {/* Bouton de preuve de sécurité serveur Firestore */}
              {currentUser && (
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-[#89929b]">
                      {isFr
                        ? 'Test sécurité serveur Firestore (/users/{uid}) :'
                        : 'Firestore server security check (/users/{uid}):'}
                    </span>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleTestBlockedWrite}
                      className="px-3 py-1 rounded-lg bg-[#102034] hover:bg-[#1b2b3f] text-[#89ceff] border border-[#1b2b3f] font-mono text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>
                        {isFr ? 'Tenter écriture Firestore' : 'Test Firestore Write'}
                      </span>
                    </button>
                  </div>
                  {liveTestResult && (
                    <div
                      className={`p-2.5 rounded-xl border text-[11px] font-mono ${
                        liveTestResult.allowed
                          ? 'bg-[#00a572]/15 border-[#4edea3]/40 text-[#4edea3]'
                          : 'bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ffb4ab]'
                      }`}
                    >
                      {liveTestResult.detail}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
