import { test, expect } from 'playwright/test';

const BASE_URL = 'http://127.0.0.1:3000';

test.describe('DBMastor V2 — Security, Navigation, Hamburger/Landing, Onboarding, Dashboard, SQL Lab & Responsive E2E', () => {
  test('1. Security API: Admin endpoints reject unauthenticated, forged, and spoofed-origin calls with 401', async ({ request }) => {
    const endpoints: Array<{ method: 'GET' | 'POST'; path: string; data?: Record<string, unknown> }> = [
      { method: 'GET', path: '/api/notifications/status' },
      { method: 'GET', path: '/api/notifications/history' },
      { method: 'POST', path: '/api/notifications/config', data: { host: 'smtp.evil.test', port: 587 } },
      { method: 'POST', path: '/api/notifications/test-email', data: { email: 'evil@test.local' } },
    ];

    for (const ep of endpoints) {
      const noAuth = await request.fetch(`${BASE_URL}${ep.path}`, {
        method: ep.method,
        headers: {
          Origin: 'http://localhost:3000',
          Referer: 'http://localhost:3000/?view=app&tab=access_control',
        },
        data: ep.data,
      });
      expect(noAuth.status()).toBe(401);

      const forgedLocal = await request.fetch(`${BASE_URL}${ep.path}`, {
        method: ep.method,
        headers: {
          Authorization: 'Bearer admin-local',
          Origin: 'https://ais-dev-test.run.app',
        },
        data: ep.data,
      });
      expect(forgedLocal.status()).toBe(401);
    }

    const robotsRes = await request.get(`${BASE_URL}/robots.txt`);
    expect(robotsRes.status()).toBe(200);
    const robotsTxt = await robotsRes.text();
    expect(robotsTxt).toContain('User-agent: *');
    expect(robotsTxt).toContain('Allow: /');
  });

  test('2. Landing Page SEO canonical URL & transition into Application', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL);

    const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonicalHref).toBe('https://dbmastor.pages.dev/');

    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    expect(ogUrl).toBe('https://dbmastor.pages.dev/');

    // Hero primary CTA opens the app view
    const heroPrimaryBtn = page.locator('section').first().locator('button').first();
    await expect(heroPrimaryBtn).toBeVisible();
    await heroPrimaryBtn.click();

    await expect(page.locator('#main-app-header')).toBeVisible();
    await expect(page.locator('#onboarding-modal')).toBeVisible();
  });

  test('3. Hamburger Menu & Mandatory Landing Page Access (Desktop + Mobile, FR/EN, Role Gating, Session Preserved)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/?view=app&no_onboarding=true`);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('dbmastery_onboarding_completed_v1', 'true');
      localStorage.setItem(
        'dbmastery_user_preferences_v2',
        JSON.stringify({
          onboardingCompleted: true,
          objective: 'learn_sql',
          targetCert: null,
          level: 'intermediate',
          targetExamDate: null,
          lastActivity: null,
          updatedAt: '2026-11-20T00:00:00.000Z',
        })
      );
    });
    await page.reload();

    // Open hamburger menu on desktop
    await expect(page.locator('#header-hamburger-btn')).toBeVisible();
    await page.locator('#header-hamburger-btn').click();
    await expect(page.locator('#hamburger-drawer-panel')).toBeVisible();

    // Verify 3 non-admin sections visible, Administration hidden for non-admin
    await expect(page.locator('#hamburger-section-presentation')).toBeVisible();
    await expect(page.locator('#hamburger-section-learn')).toBeVisible();
    await expect(page.locator('#hamburger-section-tools')).toBeVisible();
    await expect(page.locator('#hamburger-section-administration')).toHaveCount(0);

    // Mandatory "Présentation de DBMastor" entry in FR
    await expect(page.locator('#hamburger-item-landing')).toContainText('Présentation de DBMastor');

    // Switch EN via hamburger drawer -> "About DBMastor"
    await page.locator('#hamburger-lang-toggle').click();
    await expect(page.locator('#hamburger-item-landing')).toContainText('About DBMastor');
    await page.locator('#hamburger-lang-toggle').click();
    await expect(page.locator('#hamburger-item-landing')).toContainText('Présentation de DBMastor');

    // Click "Présentation de DBMastor" -> navigates to Landing Page & closes drawer without clearing prefs
    await page.locator('#hamburger-item-landing').click();
    await expect(page.locator('#hamburger-drawer-panel')).toHaveCount(0);
    await expect(page).toHaveURL(/view=landing/);
    await expect(page.locator('#landing-nav-open-app-btn')).toBeVisible();

    // Verify preferences/session preserved in localStorage
    const preservedOnboarding = await page.evaluate(() =>
      localStorage.getItem('dbmastery_onboarding_completed_v1')
    );
    expect(preservedOnboarding).toBe('true');

    // Return to app from Landing -> onboarding stays completed
    await page.locator('#landing-nav-open-app-btn').click();
    await expect(page.locator('#dashboard-view-container')).toBeVisible();
    await expect(page.locator('#onboarding-modal')).toHaveCount(0);

    // Also test Hamburger -> Landing on Mobile viewport (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#header-hamburger-btn')).toBeVisible();
    await page.locator('#header-hamburger-btn').click();
    await expect(page.locator('#hamburger-drawer-panel')).toBeVisible();
    await expect(page.locator('#hamburger-item-landing')).toContainText('Présentation de DBMastor');
    await page.locator('#hamburger-item-landing').click();
    await expect(page.locator('#hamburger-drawer-panel')).toHaveCount(0);
    await expect(page).toHaveURL(/view=landing/);
  });

  test('4. Onboarding V2: Supports "Apprendre SQL sans certification" and never reopens on reload', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/?view=app`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.locator('#onboarding-modal')).toBeVisible();

    // Step 1 -> Step 2 (Objective)
    await page.locator('#onboarding-next-btn').click();
    await expect(page.locator('#onboarding-objective-learn_sql')).toBeVisible();
    await page.locator('#onboarding-objective-learn_sql').click();

    // Step 2 -> Step 3 (Certification optional -> Apprendre SQL sans certification)
    await page.locator('#onboarding-next-btn').click();
    await expect(page.locator('#onboarding-cert-none-btn')).toBeVisible();
    await page.locator('#onboarding-cert-none-btn').click();

    // Step 3 -> Step 4 (Level)
    await page.locator('#onboarding-next-btn').click();
    // Step 4 -> Step 5 (Mini-diagnostic optional & deferrable)
    await page.locator('#onboarding-next-btn').click();
    await expect(page.locator('#onboarding-defer-diagnostic-btn')).toBeVisible();
    await page.locator('#onboarding-defer-diagnostic-btn').click();

    // Step 5 defer moves immediately to Step 6 (Proposed Path); Next moves to Step 7 (Launch)
    await page.locator('#onboarding-next-btn').click();
    await expect(page.locator('#onboarding-finish-btn')).toBeVisible();
    await page.locator('#onboarding-finish-btn').click();

    await expect(page.locator('#onboarding-modal')).toHaveCount(0);
    await expect(page.locator('#dashboard-block-a-header')).toContainText('Apprendre SQL sans certification');

    // Reload: onboarding MUST NOT reappear automatically
    await page.reload();
    await expect(page.locator('#dashboard-view-container')).toBeVisible();
    await expect(page.locator('#onboarding-modal')).toHaveCount(0);
  });

  test('5. Dashboard V2: Strict 4 metrics max, zero fake baseline, recommendation & 4 secondary shortcuts', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/?view=app&no_onboarding=true`);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('dbmastery_onboarding_completed_v1', 'true');
    });
    await page.reload();

    await expect(page.locator('#dashboard-block-a-header')).toBeVisible();
    await expect(page.locator('#dashboard-block-b-cta')).toBeVisible();
    await expect(page.locator('#dashboard-block-c-recommendation')).toBeVisible();
    await expect(page.locator('#dashboard-block-d-metrics')).toBeVisible();
    await expect(page.locator('#dashboard-block-e-activity')).toBeVisible();

    // Strictly max 4 metric cards in Block D
    const metricCardCount = await page.locator('#dashboard-block-d-metrics > div').count();
    expect(metricCardCount).toBeLessThanOrEqual(4);
    expect(metricCardCount).toBeGreaterThanOrEqual(3);

    // 4 discreet secondary shortcuts in Block E
    await expect(page.locator('#dashboard-shortcut-quiz')).toBeVisible();
    await expect(page.locator('#dashboard-shortcut-mock')).toBeVisible();
    await expect(page.locator('#dashboard-shortcut-sqllab')).toBeVisible();
    await expect(page.locator('#dashboard-shortcut-flashcards')).toBeVisible();

    const bodyText = await page.locator('#dashboard-view-container').innerText();
    expect(bodyText).not.toContain('15 Mars 2025');
    expect(bodyText).not.toContain('March 15, 2025');
    expect(bodyText).not.toContain('D-22');
    expect(bodyText).not.toContain('Moteur v16.2');
    expect(bodyText).not.toContain('842');
    expect(bodyText).not.toContain('127');

    // Single primary CTA triggers transition & records lastActivity
    await expect(page.locator('#dashboard-primary-continue-btn')).toContainText('Continuer mon apprentissage');
    await page.locator('#dashboard-primary-continue-btn').click();
    expect(page.url()).toContain('tab=');
  });

  test('6. Navigation 5 Spaces (Desktop collapse + Mobile Bottom Bar + Legacy URLs + Back/Forward)', async ({ page }) => {
    // Desktop 5 spaces + collapse + popstate
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/?view=app&tab=sql_lab&no_onboarding=true`);
    await expect(page.locator('#sql-code-editor-textarea')).toBeVisible();

    // Sidebar has collapse toggle
    await expect(page.locator('#sidebar-collapse-btn')).toBeVisible();
    await page.locator('#sidebar-collapse-btn').click();
    await expect(page.locator('#sidebar-expand-btn')).toBeVisible();
    await page.locator('#sidebar-expand-btn').click();

    // Navigate via ?view=app&tab=dashboard -> cert_exam and verify Back/Forward
    await page.goto(`${BASE_URL}/?view=app&tab=dashboard&no_onboarding=true`);
    await expect(page.locator('#dashboard-view-container')).toBeVisible();

    await page.locator('#nav-space-certifications').click();
    await expect(page).toHaveURL(/tab=cert_exam/);

    await page.goBack();
    await expect(page).toHaveURL(/tab=dashboard/);
    await expect(page.locator('#dashboard-view-container')).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/tab=cert_exam/);

    // Mobile Bottom Bar (< md) + More drawer
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#mobile-bottom-nav')).toBeVisible();
    await expect(page.locator('#main-sidebar')).toBeHidden();

    const navBox = await page.locator('#mobile-bottom-nav').boundingBox();
    expect(navBox).not.toBeNull();
    expect(navBox!.height).toBeLessThanOrEqual(85);

    await page.locator('#mobile-nav-more').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('#mobile-more-open-landing-btn')).toContainText('Présentation de DBMastor');
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-more-backdrop')).toHaveCount(0);
  });

  test('7. Interactive SQL Lab Execution (Valid Query & SQL Error), FR/EN Toggle, Dark/Light & Cert Exam', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/?view=app&tab=sandbox&no_onboarding=true`);

    const editor = page.locator('#sql-code-editor-textarea');
    await expect(editor).toBeVisible();

    // Valid SQL execution
    await editor.fill('SELECT department, COUNT(*) AS nb_employes FROM employees GROUP BY department;');
    await page.locator('button:has-text("Exécuter")').click();
    await expect(page.locator('text=● SUCCESS')).toBeVisible();

    // Invalid SQL execution renders clear error
    await editor.fill('SELECT * FROM non_existent_table_xyz;');
    await page.locator('button:has-text("Exécuter")').click();
    await expect(page.locator('text=● ERROR')).toBeVisible();

    // Theme toggle switches html.dark cleanly
    await page.locator('#theme-toggle-btn').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.locator('#theme-toggle-btn').click();

    // Language toggle FR -> EN
    await page.locator('#lang-toggle-btn').click();
    await expect(page.locator('button:has-text("Run Query")')).toBeVisible();
    await page.locator('#lang-toggle-btn').click();

    // Navigate to Practice Exam (60Q) and move to next question
    await page.goto(`${BASE_URL}/?view=app&tab=cert_exam&no_onboarding=true`);
    await expect(page.locator('button:has-text("Suivant")')).toBeVisible();
    await page.locator('button:has-text("Suivant")').click();
    await expect(page.locator('text=/18\\s*\\/\\s*60/')).toBeVisible();
  });

  test('8. Responsive Multi-Viewport Audit (320px, 360px, 390px, 430px, 768px, 1024px, 1440px, 1920px): Zero horizontal overflow', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 },
      { width: 360, height: 800 },
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto(`${BASE_URL}/?view=app&tab=dashboard&no_onboarding=true`);
      await expect(page.locator('#dashboard-view-container')).toBeVisible();

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        headerHeight: document.getElementById('main-app-header')?.getBoundingClientRect().height || 0,
      }));

      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
      expect(metrics.headerHeight).toBeLessThanOrEqual(80);
    }
  });
});
