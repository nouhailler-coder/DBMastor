const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve('src/assets/images');
const PUBLIC_DIR = path.resolve('public/assets/images');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

async function captureAll() {
  console.log('🚀 Starting browser to generate authentic high-resolution screenshots...');
  const browser = await chromium.launch({
    executablePath: '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  // ========================================================
  // 1. Context FOR ONBOARDING MODAL
  // ========================================================
  const onboardingContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  await onboardingContext.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('dbmastery_theme', 'dark');
  });

  const onboardingPage = await onboardingContext.newPage();
  console.log('📸 [1/7] Capturing Onboarding Guide Modal...');
  await onboardingPage.goto('http://localhost:3000/?view=app&tab=dashboard', { waitUntil: 'domcontentloaded' });
  await onboardingPage.waitForTimeout(1800);
  const onboardingPath = path.join(OUTPUT_DIR, 'app_onboarding.png');
  await onboardingPage.screenshot({ path: onboardingPath });
  await onboardingContext.close();

  // ========================================================
  // 2. Context FOR CLEAN APP VIEWS (Zero Modals)
  // ========================================================
  const appContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  await appContext.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('dbmastery_theme', 'dark');
    localStorage.setItem('dbmastery_onboarding_completed_v1', 'true');
    localStorage.setItem('dbmastery_initial_diagnostic_result_v1', JSON.stringify({ completedAt: new Date().toISOString() }));
    localStorage.setItem('dbmastery_initial_diagnostic_dismissed_v1', 'true');
    sessionStorage.setItem('dbmastery_site_step1_unlocked_v1', 'unlocked_capture');
  });

  const page = await appContext.newPage();

  // Helper to ensure clean view without onboarding modal
  const ensureCleanPage = async () => {
    await page.evaluate(() => {
      document.getElementById('onboarding-skip-btn')?.click();
      document.getElementById('onboarding-modal-backdrop')?.remove();
      localStorage.setItem('dbmastery_theme', 'dark');
      localStorage.setItem('dbmastery_onboarding_completed_v1', 'true');
    });
    await page.waitForTimeout(400);
  };

  // 2. Real Dashboard (Tableau de Bord)
  console.log('📸 [2/7] Capturing Real Dashboard...');
  await page.goto('http://localhost:3000/?view=app&tab=dashboard&no_onboarding=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await ensureCleanPage();
  const dashboardPath = path.join(OUTPUT_DIR, 'app_dashboard.png');
  await page.screenshot({ path: dashboardPath });

  // 3. Real SQL Lab & Practice (AlaSQL live editor)
  console.log('📸 [3/7] Capturing Real SQL Lab (Sandbox)...');
  await page.goto('http://localhost:3000/?view=app&tab=sandbox&no_onboarding=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await ensureCleanPage();
  const sqllabPath = path.join(OUTPUT_DIR, 'app_sqllab.png');
  await page.screenshot({ path: sqllabPath });

  // 4. Real Practice & Exam Questions (with Explique-moi)
  console.log('📸 [4/7] Capturing Real Practice & Questions...');
  await page.goto('http://localhost:3000/?view=app&tab=exams&no_onboarding=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await ensureCleanPage();
  const examsPath = path.join(OUTPUT_DIR, 'app_exams.png');
  await page.screenshot({ path: examsPath });

  // 5. Real 4D Skill Map (Cartographie des Compétences)
  console.log('📸 [5/7] Capturing Real 4D Skill Map...');
  await page.goto('http://localhost:3000/?view=app&tab=skills&no_onboarding=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await ensureCleanPage();
  const skillsPath = path.join(OUTPUT_DIR, 'app_skills.png');
  await page.screenshot({ path: skillsPath });

  // 6. Real Spaced Repetition (Répétition Espacée SM-2)
  console.log('📸 [6/7] Capturing Real Spaced Repetition...');
  await page.goto('http://localhost:3000/?view=app&tab=spaced_repetition&no_onboarding=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await ensureCleanPage();
  const spacedPath = path.join(OUTPUT_DIR, 'app_spaced_repetition.png');
  await page.screenshot({ path: spacedPath });

  // 7. Real Personal Activity (Mon activité)
  console.log('📸 [7/7] Capturing Real Personal Activity...');
  await page.goto('http://localhost:3000/?view=app&tab=activity&no_onboarding=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await ensureCleanPage();
  const activityPath = path.join(OUTPUT_DIR, 'app_activity.png');
  await page.screenshot({ path: activityPath });

  // Update existing files so existing links in Landing Page and OpenGraph immediately get the real screenshot
  const legacyDashboardJpg = path.join(OUTPUT_DIR, 'dbmastery_studio_screenshot_1790453723903.jpg');
  const legacyOnboardingJpg = path.join(OUTPUT_DIR, 'dbmastery_onboarding_screenshot_1790662834983.jpg');
  fs.copyFileSync(dashboardPath, legacyDashboardJpg);
  fs.copyFileSync(onboardingPath, legacyOnboardingJpg);

  // Copy all assets to public directory for direct URL accessibility
  const allImages = [
    'app_dashboard.png',
    'app_sqllab.png',
    'app_exams.png',
    'app_skills.png',
    'app_spaced_repetition.png',
    'app_activity.png',
    'app_onboarding.png',
    'dbmastery_studio_screenshot_1790453723903.jpg',
    'dbmastery_onboarding_screenshot_1790662834983.jpg',
  ];

  for (const imgName of allImages) {
    const srcFile = path.join(OUTPUT_DIR, imgName);
    const dstFile = path.join(PUBLIC_DIR, imgName);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, dstFile);
    }
  }

  await browser.close();
  console.log('🎉 All 7 real application screenshots generated and verified!');
}

captureAll().catch((err) => {
  console.error('❌ Capture error:', err);
  process.exit(1);
});
