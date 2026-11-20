import express from 'express';
import nodemailer, { Transporter } from 'nodemailer';
import {
  createAdminAuthMiddlewares,
  DEFAULT_ADMIN_EMAIL,
  type AdminAuthMiddlewareOptions,
} from './adminAuth.js';

export interface AccessNotificationRecord {
  id: string;
  email: string;
  displayName: string;
  accessReason: string;
  method: 'google_signin' | 'gatekeeper_email' | 'manual_resend';
  requestedAt: string;
  emailSent: boolean;
  emailError?: string;
  deliveryMethod: 'smtp' | 'webhook' | 'queued' | 'simulated';
  recipient: string;
  validationCode?: string;
}

export interface NotificationRouterOptions {
  authOptions?: AdminAuthMiddlewareOptions;
  transporterFactory?: (config: RuntimeSmtpConfig) => Transporter | null;
}

export interface RuntimeSmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure: boolean;
  from: string;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createNotificationAndAuthRouter(options: NotificationRouterOptions = {}) {
  const router = express.Router();
  const { authenticateFirebase, requireAdmin } = createAdminAuthMiddlewares(options.authOptions);

  const accessNotificationsHistory: AccessNotificationRecord[] = [];

  const getAdminEmail = (): string => {
    return (process.env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_ADMIN_EMAIL).trim();
  };

  const getAppBaseUrl = (req?: express.Request): string => {
    if (process.env.APP_URL) {
      return process.env.APP_URL.replace(/\/+$/, '');
    }
    if (req) {
      const host = req.get('host') || 'localhost:3000';
      const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
      return `${proto}://${host}`;
    }
    return 'http://localhost:3000';
  };

  const defaultSmtpPort = parseInt(process.env.SMTP_PORT || '465', 10) || 465;
  const runtimeSmtpConfig: RuntimeSmtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: defaultSmtpPort,
    user: process.env.SMTP_USER || DEFAULT_ADMIN_EMAIL,
    pass: process.env.SMTP_PASS || '',
    secure:
      process.env.SMTP_SECURE !== undefined
        ? process.env.SMTP_SECURE === 'true'
        : defaultSmtpPort === 465,
    from: process.env.SMTP_FROM || `DBMastery Studio <${DEFAULT_ADMIN_EMAIL}>`,
  };

  const createTransporter = (): Transporter | null => {
    if (options.transporterFactory) {
      return options.transporterFactory(runtimeSmtpConfig);
    }
    const host = runtimeSmtpConfig.host || process.env.SMTP_HOST;
    const port = runtimeSmtpConfig.port || parseInt(process.env.SMTP_PORT || '465', 10);
    const user = runtimeSmtpConfig.user || process.env.SMTP_USER;
    const pass = runtimeSmtpConfig.pass || process.env.SMTP_PASS;
    const secure = runtimeSmtpConfig.secure ?? port === 465;

    if (host && pass) {
      try {
        return nodemailer.createTransport({
          host,
          port,
          secure,
          auth: user || pass ? { user: user || '', pass: pass || '' } : undefined,
          tls: {
            rejectUnauthorized:
              process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0' &&
              process.env.SMTP_ALLOW_SELFSIGNED !== 'true',
          },
        });
      } catch (err) {
        console.error('[SMTP] Erreur création transporteur :', err);
      }
    }
    return null;
  };

  const buildNotificationEmailHtml = ({
    email,
    displayName,
    accessReason,
    method,
    requestedAt,
    validationCode,
    appUrl,
    adminEmail,
  }: {
    email: string;
    displayName: string;
    accessReason: string;
    method: string;
    requestedAt: string;
    validationCode?: string;
    appUrl: string;
    adminEmail: string;
  }): { html: string; text: string } => {
    const safeEmail = escapeHtml(email);
    const safeName = escapeHtml(displayName);
    const safeReason = escapeHtml(accessReason);
    const safeCode = validationCode ? escapeHtml(validationCode) : '';
    const safeAdminEmail = escapeHtml(adminEmail);

    const methodLabel =
      method === 'google_signin'
        ? 'Connexion Google (Compte vérifié)'
        : 'Portail Email / Mot de passe du site';
    const consoleLink = `${appUrl}/?view=app&tab=access_control`;
    const replyMailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
      '[DBMastery Studio] Validation de votre accès'
    )}&body=${encodeURIComponent(
      `Bonjour ${displayName},\n\nVotre accès à DBMastery Studio a été validé !\n\nEmail : ${email}\n${
        validationCode ? `Code de validation personnel : ${validationCode}\n` : ''
      }\nBonne préparation aux certifications SQL DBA.\n\nCordialement,\nL'administrateur DBMastery Studio`
    )}`;

    const dateFormatted = new Date(requestedAt).toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const text = [
      `NOUVELLE DEMANDE DE CONNEXION / ACCÈS À DBMASTERY STUDIO`,
      `-----------------------------------------------------------`,
      `Statut : En attente d'approbation (PENDING)`,
      `Demandeur : ${displayName}`,
      `Email : ${email}`,
      `Méthode : ${methodLabel}`,
      `Motif : ${accessReason}`,
      `Date : ${dateFormatted}`,
      validationCode ? `Code de validation personnel : ${validationCode}` : '',
      `-----------------------------------------------------------`,
      `Pour approuver cette demande dans la console :`,
      consoleLink,
      `Pour répondre directement par email à l'apprenant :`,
      replyMailto,
    ]
      .filter(Boolean)
      .join('\n');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle demande d'accès DBMastery Studio</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #031427; color: #d3e4fe; margin: 0; padding: 20px; }
    .card { max-width: 620px; margin: 0 auto; background: #0c1c2e; border: 1px solid #1e3a5f; border-radius: 16px; overflow: hidden; box-shadow: 0 16px 36px rgba(0,0,0,0.6); }
    .banner { background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
    .banner h1 { margin: 0 0 6px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .banner p { margin: 0; font-size: 13px; opacity: 0.92; }
    .content { padding: 28px 24px; }
    .pill { display: inline-block; background-color: #f59e0b; color: #000; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-bottom: 20px; letter-spacing: 0.5px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background: #071322; border-radius: 10px; overflow: hidden; border: 1px solid #162a45; }
    .table td { padding: 12px 14px; border-bottom: 1px solid #162a45; font-size: 14px; vertical-align: top; }
    .table tr:last-child td { border-bottom: none; }
    .label { color: #89ceff; font-weight: 600; width: 140px; }
    .val { color: #f1f5f9; }
    .code-box { background: #031427; border: 1px dashed #38bdf8; border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 24px; }
    .code-box .title { font-size: 12px; color: #94a3b8; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .code-box .code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 22px; font-weight: 800; color: #4edea3; letter-spacing: 3px; }
    .actions { text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #162a45; }
    .btn { display: inline-block; padding: 12px 22px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; margin: 6px 6px; }
    .btn-primary { background-color: #0284c7; color: #ffffff; }
    .btn-secondary { background-color: #1e293b; color: #93c5fd; border: 1px solid #334155; }
    .footer { background: #050f1c; padding: 18px 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #162a45; }
  </style>
</head>
<body>
  <div class="card">
    <div class="banner">
      <h1>Nouvelle demande d'accès</h1>
      <p>DBMastery Studio &bull; Notification Administrateur</p>
    </div>
    <div class="content">
      <span class="pill">En attente d'approbation</span>
      <p style="margin-top: 0; font-size: 15px; color: #cbd5e1; line-height: 1.5;">
        Un nouvel apprenant a soumis une demande de connexion sur votre portail DBMastery Studio :
      </p>
      <table class="table">
        <tr><td class="label">Nom complet</td><td class="val"><strong>${safeName}</strong></td></tr>
        <tr><td class="label">Adresse Email</td><td class="val"><a href="mailto:${encodeURIComponent(email)}" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">${safeEmail}</a></td></tr>
        <tr><td class="label">Méthode</td><td class="val">${escapeHtml(methodLabel)}</td></tr>
        <tr><td class="label">Date de soumission</td><td class="val">${escapeHtml(dateFormatted)}</td></tr>
        <tr><td class="label">Motif formulé</td><td class="val" style="font-style: italic; color: #e2e8f0;">« ${safeReason} »</td></tr>
      </table>
      ${
        safeCode
          ? `<div class="code-box"><div class="title">Code de validation calculé :</div><div class="code">${safeCode}</div></div>`
          : ''
      }
      <div class="actions">
        <a href="${consoleLink}" class="btn btn-primary" target="_blank">Ouvrir la Console d'Accès</a>
        <a href="${replyMailto}" class="btn btn-secondary" target="_blank">Répondre au candidat par Email</a>
      </div>
    </div>
    <div class="footer">Notification automatique transmise à <strong>${safeAdminEmail}</strong>.</div>
  </div>
</body>
</html>`;

    return { html, text };
  };

  // Endpoint public (visiteur ou utilisateur authentifié qui soumet sa demande d'accès)
  router.post('/api/notifications/access-request', async (req, res) => {
    try {
      const { email, displayName, accessReason, method, validationCode, requestedAt } = req.body || {};

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Adresse email valide requise.' });
      }

      const cleanEmail = email.trim().toLowerCase().slice(0, 160);
      const cleanName =
        typeof displayName === 'string' && displayName.trim()
          ? displayName.trim().slice(0, 100)
          : cleanEmail.split('@')[0];
      const cleanReason =
        typeof accessReason === 'string' && accessReason.trim()
          ? accessReason.trim().slice(0, 240)
          : 'Demande d\'accès au simulateur SQL';
      const cleanMethod =
        method === 'google_signin'
          ? 'google_signin'
          : method === 'manual_resend'
          ? 'manual_resend'
          : 'gatekeeper_email';
      const timestamp = typeof requestedAt === 'string' ? requestedAt : new Date().toISOString();
      const adminEmail = getAdminEmail();
      const appUrl = getAppBaseUrl(req);

      const emailPayload = buildNotificationEmailHtml({
        email: cleanEmail,
        displayName: cleanName,
        accessReason: cleanReason,
        method: cleanMethod,
        requestedAt: timestamp,
        validationCode: typeof validationCode === 'string' ? validationCode.slice(0, 32) : undefined,
        appUrl,
        adminEmail,
      });

      let emailSent = false;
      let emailError: string | undefined;
      let deliveryMethod: 'smtp' | 'webhook' | 'queued' | 'simulated' = 'queued';

      const transporter = createTransporter();
      if (transporter) {
        try {
          const fromAddress =
            runtimeSmtpConfig.from || process.env.SMTP_FROM || 'DBMastery Studio <notifications@dbmastery.app>';
          await transporter.sendMail({
            from: fromAddress,
            to: adminEmail,
            replyTo: cleanEmail,
            subject: `[DBMastery Studio] Nouvelle demande d'accès : ${cleanName} (${cleanEmail})`,
            text: emailPayload.text,
            html: emailPayload.html,
          });
          emailSent = true;
          deliveryMethod = 'smtp';
        } catch {
          emailError = 'Erreur d\'envoi SMTP';
        }
      }

      const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          const webhookRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'access_request',
              adminEmail,
              applicant: {
                email: cleanEmail,
                name: cleanName,
                reason: cleanReason,
                method: cleanMethod,
                requestedAt: timestamp,
              },
              appUrl,
            }),
          });
          if (webhookRes.ok && !emailSent) {
            deliveryMethod = 'webhook';
            emailSent = true;
          }
        } catch {
          // ignore webhook transient error
        }
      }

      const notifRecord: AccessNotificationRecord = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        email: cleanEmail,
        displayName: cleanName,
        accessReason: cleanReason,
        method: cleanMethod,
        requestedAt: timestamp,
        emailSent,
        emailError,
        deliveryMethod,
        recipient: adminEmail,
        validationCode: typeof validationCode === 'string' ? validationCode.slice(0, 32) : undefined,
      };

      accessNotificationsHistory.unshift(notifRecord);
      if (accessNotificationsHistory.length > 50) {
        accessNotificationsHistory.pop();
      }

      return res.json({
        success: true,
        emailSent,
        deliveryMethod,
        message: emailSent
          ? 'Demande transmise avec succès à l\'administrateur.'
          : 'Demande enregistrée dans la file d\'attente administrateur.',
        notification: {
          id: notifRecord.id,
          email: notifRecord.email,
          displayName: notifRecord.displayName,
          accessReason: notifRecord.accessReason,
          method: notifRecord.method,
          requestedAt: notifRecord.requestedAt,
          emailSent: notifRecord.emailSent,
          deliveryMethod: notifRecord.deliveryMethod,
        },
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: 'Erreur interne lors du traitement de la notification.',
      });
    }
  });

  // Vérification sécurisée du mot de passe global du site côté serveur
  router.post('/api/auth/verify-site-password', (req, res) => {
    try {
      const { password } = req.body || {};
      if (typeof password !== 'string' || !password.trim()) {
        return res.status(400).json({ valid: false, message: 'Le mot de passe est requis.' });
      }

      const serverSecret = (process.env.SITE_ACCESS_PASSWORD || '').trim();
      if (!serverSecret) {
        return res.json({ valid: true, gated: false });
      }

      const isValid = password.trim() === serverSecret;
      if (!isValid) {
        return res.status(401).json({ valid: false, message: 'Mot de passe incorrect.' });
      }

      return res.json({ valid: true, gated: true });
    } catch {
      return res.status(500).json({
        valid: false,
        message: 'Erreur lors de la vérification du mot de passe.',
      });
    }
  });

  // =========================================================================
  // ROUTES ADMINISTRATEUR PROTÉGÉES (Firebase ID Token + Rôle Admin Serveur)
  // =========================================================================

  // Statut SMTP & configuration (Admin uniquement)
  router.get('/api/notifications/status', authenticateFirebase, requireAdmin, (_req, res) => {
    const adminEmail = getAdminEmail();
    const hasSmtp = Boolean(
      (runtimeSmtpConfig.host && runtimeSmtpConfig.pass) ||
        (process.env.SMTP_HOST && process.env.SMTP_PASS)
    );
    const hasWebhook = Boolean(process.env.NOTIFICATION_WEBHOOK_URL);

    return res.json({
      recipient: adminEmail,
      smtpConfigured: hasSmtp,
      webhookConfigured: hasWebhook,
      historyCount: accessNotificationsHistory.length,
      lastSentAt: accessNotificationsHistory[0]?.requestedAt || null,
      smtpDetails: {
        host: runtimeSmtpConfig.host || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: String(runtimeSmtpConfig.port || process.env.SMTP_PORT || '465'),
        user: runtimeSmtpConfig.user || process.env.SMTP_USER || DEFAULT_ADMIN_EMAIL,
        passConfigured: Boolean(runtimeSmtpConfig.pass || process.env.SMTP_PASS),
        from: runtimeSmtpConfig.from || process.env.SMTP_FROM || `DBMastery Studio <${DEFAULT_ADMIN_EMAIL}>`,
      },
    });
  });

  // Mise à jour configuration SMTP (Admin uniquement)
  router.post('/api/notifications/config', authenticateFirebase, requireAdmin, (req, res) => {
    try {
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({
          success: false,
          message: 'Corps de requête invalide.',
        });
      }

      const { host, port, user, pass, from, secure } = req.body as Record<string, unknown>;

      if (port !== undefined) {
        const parsedPort = parseInt(String(port), 10);
        if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
          return res.status(400).json({
            success: false,
            message: 'Numéro de port SMTP invalide (1 - 65535).',
          });
        }
        runtimeSmtpConfig.port = parsedPort;
      }

      if (host !== undefined) {
        if (typeof host !== 'string' || !host.trim()) {
          return res.status(400).json({ success: false, message: 'Hôte SMTP invalide.' });
        }
        runtimeSmtpConfig.host = host.trim().slice(0, 100);
      }

      if (user !== undefined) {
        if (typeof user !== 'string') {
          return res.status(400).json({ success: false, message: 'Utilisateur SMTP invalide.' });
        }
        runtimeSmtpConfig.user = user.trim().slice(0, 100);
      }

      if (typeof pass === 'string' && pass.trim()) {
        runtimeSmtpConfig.pass = pass.trim();
      }

      if (from !== undefined) {
        if (typeof from !== 'string' || !from.trim()) {
          return res.status(400).json({ success: false, message: 'Expéditeur SMTP invalide.' });
        }
        runtimeSmtpConfig.from = from.trim().slice(0, 120);
      }

      if (typeof secure === 'boolean') {
        runtimeSmtpConfig.secure = secure;
      }

      return res.json({
        success: true,
        message: 'Configuration SMTP enregistrée avec succès !',
        config: {
          host: runtimeSmtpConfig.host,
          port: runtimeSmtpConfig.port,
          user: runtimeSmtpConfig.user,
          passConfigured: Boolean(runtimeSmtpConfig.pass),
          from: runtimeSmtpConfig.from,
        },
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: 'Erreur interne lors de la mise à jour de la configuration.',
      });
    }
  });

  // Historique des notifications d'accès (Admin uniquement)
  router.get('/api/notifications/history', authenticateFirebase, requireAdmin, (_req, res) => {
    return res.json({
      recipient: getAdminEmail(),
      history: accessNotificationsHistory,
    });
  });

  // Envoi d'email de test (Admin uniquement)
  router.post('/api/notifications/test-email', authenticateFirebase, requireAdmin, async (req, res) => {
    try {
      const requestedTarget = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
      if (requestedTarget && !requestedTarget.includes('@')) {
        return res.status(400).json({
          success: false,
          message: 'Adresse email cible invalide.',
        });
      }

      const targetEmail = requestedTarget || getAdminEmail();
      const appUrl = getAppBaseUrl(req);
      const transporter = createTransporter();

      const testPayload = buildNotificationEmailHtml({
        email: 'candidat.test@example.com',
        displayName: 'Test Candidat DBA',
        accessReason: 'Test de réception de notification automatique par email',
        method: 'manual_resend',
        requestedAt: new Date().toISOString(),
        validationCode: 'VAL-TEST-9999',
        appUrl,
        adminEmail: targetEmail,
      });

      if (transporter) {
        try {
          const fromAddress =
            runtimeSmtpConfig.from || process.env.SMTP_FROM || 'DBMastery Studio <notifications@dbmastery.app>';
          await transporter.sendMail({
            from: fromAddress,
            to: targetEmail,
            subject: `[DBMastery Studio] [TEST] Vérification de vos notifications d'accès`,
            text: testPayload.text,
            html: testPayload.html,
          });
          return res.json({
            success: true,
            deliveryMethod: 'smtp',
            message: `Email de test envoyé avec succès via SMTP à ${targetEmail} !`,
          });
        } catch {
          return res.status(500).json({
            success: false,
            deliveryMethod: 'failed',
            message: 'Échec de l\'envoi SMTP de test.',
          });
        }
      }

      return res.json({
        success: true,
        deliveryMethod: 'simulated',
        message: `Pipeline de notification validé pour ${targetEmail} (aucun serveur SMTP actif configuré).`,
        preview: {
          recipient: targetEmail,
          subject: `[DBMastery Studio] [TEST] Vérification de vos notifications d'accès`,
          textSnippet: testPayload.text.slice(0, 200) + '...',
        },
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du test email.',
      });
    }
  });

  // Redirection neutre vers la console d'administration (jamais d'auto-approbation par URL non authentifiée)
  router.get('/api/access-requests/one-click-approve', (req, res) => {
    const appUrl = getAppBaseUrl(req);
    const redirectUrl = `${appUrl}/?view=app&tab=access_control`;
    return res.redirect(redirectUrl);
  });

  return router;
}
