import { describe, it, expect } from 'vitest';
import http from 'http';
import express from 'express';
import {
  DEFAULT_GATE_CONFIG,
  generateEmailValidationCode,
  verifyEmailValidationCode,
  emailToDeterministicUid,
  loadSiteGateConfig,
} from '../services/siteAccessGateService';
import { createNotificationAndAuthRouter } from '../../server/notificationRoutes';
import {
  AuthServiceUnavailableError,
  FirestoreUnavailableError,
  type AdminAuthMiddlewareOptions,
} from '../../server/adminAuth';

async function withTestServer(
  authOptions: AdminAuthMiddlewareOptions,
  fn: (baseUrl: string) => Promise<void>
) {
  const app = express();
  app.use(express.json());
  app.use(
    createNotificationAndAuthRouter({
      authOptions,
      transporterFactory: () => null,
    })
  );

  const server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const addr = server.address();
  if (!addr || typeof addr === 'string') {
    server.close();
    throw new Error('Failed to bind ephemeral port');
  }
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  try {
    await fn(baseUrl);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

describe('Security & Access Gate Sanitation Tests', () => {
  it('ensures DEFAULT_GATE_CONFIG has no exposed hardcoded secret password', () => {
    expect(DEFAULT_GATE_CONFIG.sitePassword).toBe('');
    expect(DEFAULT_GATE_CONFIG.gateEnabled).toBe(false);
    expect(DEFAULT_GATE_CONFIG.requireSitePassword).toBe(false);
  });

  it('generates deterministic email validation codes and verifies/rejects properly', () => {
    const email = 'candidate.dba@company.com';
    const code1 = generateEmailValidationCode(email, 'test-secret');
    const code2 = generateEmailValidationCode(email, 'test-secret');
    expect(code1).toBe(code2);
    expect(code1).toMatch(/^VAL-[0-9A-F]{4}-[0-9A-F]{4}$/);

    const defaultCode = generateEmailValidationCode(email);
    expect(verifyEmailValidationCode(email, defaultCode)).toBe(true);
    expect(verifyEmailValidationCode(email, 'VAL-0000-0000')).toBe(false);
    expect(verifyEmailValidationCode('other@company.com', defaultCode)).toBe(false);
    expect(verifyEmailValidationCode('', 'VAL-1234-5678')).toBe(false);
  });

  it('safely converts emails to deterministic sanitized user UIDs', () => {
    const uid = emailToDeterministicUid('Nouhailler.Coder+DBA@Domain-Cloud.org');
    expect(uid).toBe('email_nouhailler_coder_dba_at_domain-cloud_org');
    expect(uid).not.toContain('@');
    expect(uid).not.toContain('+');
  });

  it('ensures loadSiteGateConfig returns safe defaults', () => {
    const config = loadSiteGateConfig();
    expect(typeof config.gateEnabled).toBe('boolean');
    expect(typeof config.requireSitePassword).toBe('boolean');
    expect(typeof config.sitePassword).toBe('string');
  });
});

describe('Server Admin API RBAC & Authentication Matrix', () => {
  const adminRoutes: Array<{
    method: 'GET' | 'POST';
    path: string;
    body?: Record<string, unknown>;
  }> = [
    { method: 'GET', path: '/api/notifications/status' },
    { method: 'GET', path: '/api/notifications/history' },
    { method: 'POST', path: '/api/notifications/config', body: { host: 'smtp.gmail.com', port: 465 } },
    { method: 'POST', path: '/api/notifications/test-email', body: { email: 'admin@example.com' } },
  ];

  const rejectAllVerify = async () => {
    throw new Error('INVALID_TOKEN');
  };

  it('1. Rejects unauthenticated requests (no Authorization header) with 401 on all admin routes', async () => {
    await withTestServer(
      {
        verifyIdToken: rejectAllVerify,
        lookupAccessRecord: async () => ({ exists: false }),
      },
      async (baseUrl) => {
        for (const route of adminRoutes) {
          const res = await fetch(`${baseUrl}${route.path}`, {
            method: route.method,
            headers: route.body ? { 'Content-Type': 'application/json' } : undefined,
            body: route.body ? JSON.stringify(route.body) : undefined,
          });
          expect(res.status).toBe(401);
          const data = await res.json();
          expect(data.success).toBe(false);
        }
      }
    );
  });

  it('2. Rejects arbitrary long opaque tokens (>20 chars) and "admin-local" with 401', async () => {
    await withTestServer(
      {
        verifyIdToken: rejectAllVerify,
        lookupAccessRecord: async () => ({ exists: false }),
      },
      async (baseUrl) => {
        const fakeTokens = [
          'admin-local',
          'arbitrary-fake-bearer-token-longer-than-20-characters-12345',
        ];
        for (const token of fakeTokens) {
          for (const route of adminRoutes) {
            const res = await fetch(`${baseUrl}${route.path}`, {
              method: route.method,
              headers: {
                Authorization: `Bearer ${token}`,
                ...(route.body ? { 'Content-Type': 'application/json' } : {}),
              },
              body: route.body ? JSON.stringify(route.body) : undefined,
            });
            expect(res.status).toBe(401);
          }
        }
      }
    );
  });

  it('3. Rejects invalid or expired Firebase ID tokens with 401', async () => {
    await withTestServer(
      {
        verifyIdToken: async () => {
          throw new Error('auth/id-token-expired');
        },
        lookupAccessRecord: async () => ({ exists: true, role: 'admin', status: 'approved' }),
      },
      async (baseUrl) => {
        const res = await fetch(`${baseUrl}/api/notifications/config`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJ1aWQiOiIxMjMifQ.invalid',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ host: 'smtp.gmail.com', port: 587 }),
        });
        expect(res.status).toBe(401);
      }
    );
  });

  it('4. Does NOT bypass auth when Origin/Host matches localhost, ais-dev-, or run.app', async () => {
    await withTestServer(
      {
        verifyIdToken: rejectAllVerify,
        lookupAccessRecord: async () => ({ exists: true, role: 'admin', status: 'approved' }),
      },
      async (baseUrl) => {
        const spoofedOrigins = [
          'http://localhost:3000',
          'https://ais-dev-preview.run.app',
          'https://dbmastor.run.app',
        ];
        for (const origin of spoofedOrigins) {
          const res = await fetch(`${baseUrl}/api/notifications/config`, {
            method: 'POST',
            headers: {
              Origin: origin,
              Referer: `${origin}/?tab=access_control`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ host: 'evil.smtp.local', port: 25 }),
          });
          expect(res.status).toBe(401);
        }
      }
    );
  });

  it('5. Rejects authenticated non-admin student and auditor users with 403 even if client spoofs role headers', async () => {
    for (const nonAdminRole of ['student', 'auditor'] as const) {
      await withTestServer(
        {
          verifyIdToken: async () => ({
            uid: `${nonAdminRole}_uid_1`,
            email: `${nonAdminRole}@example.com`,
            emailVerified: true,
            claims: {},
          }),
          lookupAccessRecord: async () => ({
            exists: true,
            uid: `${nonAdminRole}_uid_1`,
            email: `${nonAdminRole}@example.com`,
            role: nonAdminRole,
            status: 'approved',
          }),
        },
        async (baseUrl) => {
          for (const route of adminRoutes) {
            const res = await fetch(`${baseUrl}${route.path}`, {
              method: route.method,
              headers: {
                Authorization: `Bearer valid.${nonAdminRole}.jwt`,
                'x-user-role': 'admin',
                'x-admin-key': 'spoofed-key',
                ...(route.body ? { 'Content-Type': 'application/json' } : {}),
              },
              body: route.body ? JSON.stringify(route.body) : undefined,
            });
            expect(res.status).toBe(403);
            const data = await res.json();
            expect(data.code).toBe('ADMIN_ROLE_REQUIRED');
          }
        }
      );
    }
  });

  it('6. Rejects revoked admin or pending admin user with 403', async () => {
    await withTestServer(
      {
        verifyIdToken: async (tok) => ({
          uid: tok === 'revoked' ? 'revoked_uid' : 'pending_uid',
          email: tok === 'revoked' ? 'nouhailler@gmail.com' : 'pending@example.com',
          emailVerified: true,
          claims: {},
        }),
        lookupAccessRecord: async (uid) =>
          uid === 'revoked_uid'
            ? { exists: true, uid, role: 'admin', status: 'revoked' }
            : { exists: true, uid, role: 'admin', status: 'pending' },
      },
      async (baseUrl) => {
        const resRevoked = await fetch(`${baseUrl}/api/notifications/history`, {
          headers: { Authorization: 'Bearer revoked' },
        });
        expect(resRevoked.status).toBe(403);
        expect((await resRevoked.json()).code).toBe('ACCESS_REVOKED');

        const resPending = await fetch(`${baseUrl}/api/notifications/status`, {
          headers: { Authorization: 'Bearer pending' },
        });
        expect(resPending.status).toBe(403);
        expect((await resPending.json()).code).toBe('ACCESS_NOT_APPROVED');
      }
    );
  });

  it('7. Rejects unverified email or disabled Firebase user with 403', async () => {
    await withTestServer(
      {
        verifyIdToken: async (tok) => ({
          uid: 'u1',
          email: 'nouhailler@gmail.com',
          emailVerified: tok !== 'unverified',
          disabled: tok === 'disabled',
          claims: {},
        }),
        lookupAccessRecord: async () => ({
          exists: true,
          uid: 'u1',
          role: 'admin',
          status: 'approved',
        }),
      },
      async (baseUrl) => {
        const r1 = await fetch(`${baseUrl}/api/notifications/status`, {
          headers: { Authorization: 'Bearer unverified' },
        });
        expect(r1.status).toBe(403);
        expect((await r1.json()).code).toBe('EMAIL_NOT_VERIFIED');

        const r2 = await fetch(`${baseUrl}/api/notifications/status`, {
          headers: { Authorization: 'Bearer disabled' },
        });
        expect(r2.status).toBe(403);
        expect((await r2.json()).code).toBe('ACCOUNT_DISABLED');
      }
    );
  });

  it('8. Fails closed with 503 if Firebase Auth or Firestore verification is unavailable', async () => {
    await withTestServer(
      {
        verifyIdToken: async () => {
          throw new AuthServiceUnavailableError('Admin SDK not initialized');
        },
        lookupAccessRecord: async () => ({ exists: false }),
      },
      async (baseUrl) => {
        const rAuthDown = await fetch(`${baseUrl}/api/notifications/status`, {
          headers: { Authorization: 'Bearer some.jwt.token' },
        });
        expect(rAuthDown.status).toBe(503);
      }
    );

    await withTestServer(
      {
        verifyIdToken: async () => ({
          uid: 'admin_1',
          email: 'nouhailler@gmail.com',
          emailVerified: true,
          claims: {},
        }),
        lookupAccessRecord: async () => {
          throw new FirestoreUnavailableError('Firestore network failure');
        },
      },
      async (baseUrl) => {
        const rDbDown = await fetch(`${baseUrl}/api/notifications/config`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer valid.admin.token',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ port: 465 }),
        });
        expect(rDbDown.status).toBe(503);
      }
    );
  });

  it('9. Allows verified approved admin on all admin endpoints and validates SMTP inputs (400 on invalid port)', async () => {
    await withTestServer(
      {
        verifyIdToken: async () => ({
          uid: 'admin_uid_1',
          email: 'nouhailler@gmail.com',
          emailVerified: true,
          claims: {},
        }),
        lookupAccessRecord: async () => ({
          exists: true,
          uid: 'admin_uid_1',
          email: 'nouhailler@gmail.com',
          role: 'admin',
          status: 'approved',
        }),
      },
      async (baseUrl) => {
        const rStatus = await fetch(`${baseUrl}/api/notifications/status`, {
          headers: { Authorization: 'Bearer valid.admin.jwt' },
        });
        expect(rStatus.status).toBe(200);

        const rHistory = await fetch(`${baseUrl}/api/notifications/history`, {
          headers: { Authorization: 'Bearer valid.admin.jwt' },
        });
        expect(rHistory.status).toBe(200);

        const rBadPort = await fetch(`${baseUrl}/api/notifications/config`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer valid.admin.jwt',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ port: 99999 }),
        });
        expect(rBadPort.status).toBe(400);

        const rConfig = await fetch(`${baseUrl}/api/notifications/config`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer valid.admin.jwt',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ host: 'smtp.example.com', port: 587, secure: false }),
        });
        expect(rConfig.status).toBe(200);
        const cfgJson = await rConfig.json();
        expect(cfgJson.success).toBe(true);
        expect(cfgJson.config.port).toBe(587);

        const rTest = await fetch(`${baseUrl}/api/notifications/test-email`, {
          method: 'POST',
          headers: {
            Authorization: 'Bearer valid.admin.jwt',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: 'nouhailler@gmail.com' }),
        });
        expect(rTest.status).toBe(200);
      }
    );
  });

  it('10. One-click-approve redirect never emits approved_email query parameter', async () => {
    await withTestServer(
      {
        verifyIdToken: rejectAllVerify,
        lookupAccessRecord: async () => ({ exists: false }),
      },
      async (baseUrl) => {
        const res = await fetch(
          `${baseUrl}/api/access-requests/one-click-approve?email=attacker@evil.com`,
          { redirect: 'manual' }
        );
        expect(res.status).toBe(302);
        const location = res.headers.get('location') || '';
        expect(location).not.toContain('approved_email');
        expect(location).toContain('tab=access_control');
      }
    );
  });
});
