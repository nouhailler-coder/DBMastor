import { AccessRequestNotification, NotificationServiceStatus } from '../types';

export const ADMIN_NOTIFICATION_EMAIL = 'nouhailler@gmail.com';
const LOCAL_NOTIFICATION_HISTORY_KEY = 'dbmastery_access_request_notifications_v1';

/**
 * Charge l'historique local des notifications envoyées
 */
export function getLocalNotificationHistory(): AccessRequestNotification[] {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIFICATION_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Sauvegarde l'historique local
 */
export function saveLocalNotificationHistory(items: AccessRequestNotification[]): void {
  try {
    localStorage.setItem(LOCAL_NOTIFICATION_HISTORY_KEY, JSON.stringify(items.slice(0, 100)));
  } catch {
    // ignore
  }
}

/**
 * Envoie une notification de demande d'accès au serveur Express /api/notifications/access-request
 */
export async function sendAccessRequestNotification(params: {
  email: string;
  displayName?: string;
  accessReason?: string;
  method: 'google_signin' | 'gatekeeper_email' | 'manual_resend';
  validationCode?: string;
}): Promise<{
  success: boolean;
  message: string;
  notification?: AccessRequestNotification;
}> {
  const cleanEmail = params.email.trim().toLowerCase();
  const displayName = params.displayName?.trim() || cleanEmail.split('@')[0] || 'Candidat';
  const accessReason = params.accessReason?.trim() || 'Demande d\'accès à DBMastery Studio';

  const payload = {
    email: cleanEmail,
    displayName,
    accessReason,
    method: params.method,
    validationCode: params.validationCode,
    requestedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch('/api/notifications/access-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Erreur serveur (${res.status})`);
    }

    const data = await res.json();
    const notification: AccessRequestNotification = data.notification || {
      id: `notif_${Date.now()}`,
      email: cleanEmail,
      displayName,
      accessReason,
      method: params.method,
      requestedAt: payload.requestedAt,
      emailSent: Boolean(data.emailSent),
      deliveryMethod: data.deliveryMethod || 'queued',
      recipient: data.recipient || ADMIN_NOTIFICATION_EMAIL,
      validationCode: params.validationCode,
    };

    // Mettre à jour l'historique local
    const current = getLocalNotificationHistory();
    const updated = [notification, ...current.filter((n) => n.id !== notification.id)];
    saveLocalNotificationHistory(updated);

    return {
      success: true,
      message: data.message || `Demande envoyée avec succès à ${ADMIN_NOTIFICATION_EMAIL}.`,
      notification,
    };
  } catch (err: any) {
    console.warn('Envoi notification réseau échoué, mise en file locale :', err);

    // Enregistrement fallback local
    const fallbackNotif: AccessRequestNotification = {
      id: `local_notif_${Date.now()}`,
      email: cleanEmail,
      displayName,
      accessReason,
      method: params.method,
      requestedAt: payload.requestedAt,
      emailSent: false,
      emailError: err?.message || 'Erreur réseau',
      deliveryMethod: 'queued',
      recipient: ADMIN_NOTIFICATION_EMAIL,
      validationCode: params.validationCode,
    };

    const current = getLocalNotificationHistory();
    saveLocalNotificationHistory([fallbackNotif, ...current]);

    return {
      success: false,
      message: `La demande a été mise en attente (alerte préparée pour ${ADMIN_NOTIFICATION_EMAIL}).`,
      notification: fallbackNotif,
    };
  }
}

/**
 * Récupère le statut du service de notification (SMTP, webhook, etc.)
 */
export async function fetchNotificationStatus(): Promise<NotificationServiceStatus> {
  try {
    const res = await fetch('/api/notifications/status');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // fallback
  }

  return {
    recipient: ADMIN_NOTIFICATION_EMAIL,
    smtpConfigured: false,
    webhookConfigured: false,
    historyCount: getLocalNotificationHistory().length,
  };
}

/**
 * Récupère l'historique combiné (serveur + local) des notifications
 */
export async function fetchNotificationHistory(): Promise<AccessRequestNotification[]> {
  try {
    const res = await fetch('/api/notifications/history');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.history)) {
        // Fusionner avec le local
        const local = getLocalNotificationHistory();
        const map = new Map<string, AccessRequestNotification>();
        data.history.forEach((n: AccessRequestNotification) => map.set(n.id, n));
        local.forEach((n) => {
          if (!map.has(n.id)) map.set(n.id, n);
        });
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
        );
        saveLocalNotificationHistory(merged);
        return merged;
      }
    }
  } catch {
    // fallback
  }

  return getLocalNotificationHistory();
}

/**
 * Teste l'envoi d'un email de notification à l'administrateur
 */
export async function sendTestNotificationEmail(targetEmail?: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const res = await fetch('/api/notifications/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail || ADMIN_NOTIFICATION_EMAIL }),
    });

    const data = await res.json();
    return {
      success: res.ok && data.success,
      message: data.message || (res.ok ? 'Email test envoyé !' : 'Échec du test email.'),
      details: data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Impossible de contacter le serveur : ${err.message || 'Erreur réseau'}`,
    };
  }
}

/**
 * Met à jour la configuration SMTP de notification sur le serveur
 */
export async function updateNotificationConfig(config: {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
  secure?: boolean;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/notifications/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    return {
      success: res.ok && data.success,
      message: data.message || (res.ok ? 'Configuration enregistrée !' : 'Erreur enregistrement.'),
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Erreur réseau',
    };
  }
}

/**
 * Génère un lien mailto pour que l'apprenant puisse notifier directement l'admin
 */
export function generateAdminMailtoLink(params: {
  applicantEmail: string;
  applicantName?: string;
  accessReason?: string;
  validationCode?: string;
}): string {
  const subject = encodeURIComponent(
    `[DBMastery Studio] Demande d'accès pour ${params.applicantEmail}`
  );
  const body = encodeURIComponent(
    `Bonjour Administrateur,\n\n` +
      `Je souhaite obtenir l'accès à DBMastery Studio pour la préparation aux certifications SQL DBA.\n\n` +
      `Mes informations :\n` +
      `- Nom : ${params.applicantName || 'Candidat'}\n` +
      `- Email : ${params.applicantEmail}\n` +
      `- Motif : ${params.accessReason || 'Entraînement certifications DBA'}\n` +
      `${params.validationCode ? `- Code calculé : ${params.validationCode}\n` : ''}\n` +
      `Merci d'approuver mon compte dans la console d'administration.\n\n` +
      `Cordialement,\n${params.applicantName || params.applicantEmail}`
  );
  return `mailto:${ADMIN_NOTIFICATION_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * Génère un lien mailto pour que l'admin réponde à l'apprenant avec son code de validation
 */
export function generateCandidateApprovalMailtoLink(params: {
  applicantEmail: string;
  applicantName?: string;
  validationCode: string;
  sitePassword?: string;
}): string {
  const subject = encodeURIComponent(`[DBMastery Studio] Votre accès est validé !`);
  const body = encodeURIComponent(
    `Bonjour ${params.applicantName || 'Candidat'},\n\n` +
      `Votre demande d'accès à DBMastery Studio a été validée par l'administrateur.\n\n` +
      `Voici vos identifiants d'accès :\n` +
      (params.sitePassword ? `1) Mot de passe du site : ${params.sitePassword}\n` : '') +
      `2) Votre adresse email autorisée : ${params.applicantEmail}\n` +
      `3) Votre Code de validation personnel : ${params.validationCode}\n\n` +
      `Vous pouvez dès maintenant vous connecter et commencer votre entraînement.\n\n` +
      `Bonne préparation aux certifications !\n` +
      `L'équipe DBMastery Studio`
  );
  return `mailto:${params.applicantEmail}?subject=${subject}&body=${body}`;
}
