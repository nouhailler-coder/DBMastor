const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve('src/assets/images');
const PUBLIC_DIR = path.resolve('public/assets/images');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

async function capture() {
  console.log('🚀 Starting browser to capture real application screenshots...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  // 1. Capture Onboarding Modal
  console.log('📸 1/6 Capturing Onboarding modal...');
  await page.goto('http://localhost:3000/?view=app&tab=dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1800);
  const onboardingPath = path.join(OUTPUT_DIR, 'app_onboarding.png');
  await page.screenshot({ path: onboardingPath });

  // 2. Capture Clean Dashboard
  console.log('📸 2/6 Capturing Clean Dashboard...');
  await page.goto('http://localhost:3000/?view=app&tab=dashboard&no_onboarding=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const dashboardPath = path.join(OUTPUT_DIR, 'app_dashboard.png');
  await page.screenshot({ path: dashboardPath });

  // 3. Capture SQL Lab
  console.log('📸 3/6 Capturing SQL Lab (Sandbox)...');
  await page.goto('http://localhost:3000/?view=app&tab=sandbox&no_onboarding=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const sqllabPath = path.join(OUTPUT_DIR, 'app_sqllab.png');
  await page.screenshot({ path: sqllabPath });

  // 4. Capture Practice & Exams (with Progressive Explanations)
  console.log('📸 4/6 Capturing Exam Training & Questions...');
  await page.goto('http://localhost:3000/?view=app&tab=exams&no_onboarding=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const examsPath = path.join(OUTPUT_DIR, 'app_exams.png');
  await page.screenshot({ path: examsPath });

  // 5. Capture Skill Map 4D
  console.log('📸 5/6 Capturing 4D Skill Map...');
  await page.goto('http://localhost:3000/?view=app&tab=skills&no_onboarding=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const skillsPath = path.join(OUTPUT_DIR, 'app_skills.png');
  await page.screenshot({ path: skillsPath });

  // 6. Capture Personal Activity
  console.log('📸 6/6 Capturing Personal Activity...');
  await page.goto('http://localhost:3000/?view=app&tab=activity&no_onboarding=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const activityPath = path.join(OUTPUT_DIR, 'app_activity.png');
  await page.screenshot({ path: activityPath });

  // Update existing files so existing links in Landing Page and OpenGraph immediately get the real screenshot
  const existingDashboardJpg = path.join(OUTPUT_DIR, 'dbmastery_studio_screenshot_1790453723903.jpg');
  const existingOnboardingJpg = path.join(OUTPUT_DIR, 'dbmastery_onboarding_screenshot_1790662834983.jpg');

  fs.copyFileSync(dashboardPath, existingDashboardJpg);
  fs.copyFileSync(onboardingPath, existingOnboardingJpg);

  // Copy all to public directory as well
  const filesToCopy = [
    'app_dashboard.png',
    'app_sqllab.png',
    'app_exams.png',
    'app_skills.png',
    'app_activity.png',
    'app_onboarding.png',
    'dbmastery_studio_screenshot_1790453723903.jpg',
    'dbmastery_onboarding_screenshot_1790662834983.jpg',
  ];

  for (const f of filesToCopy) {
    const src = path.join(OUTPUT_DIR, f);
    const dest = path.join(PUBLIC_DIR, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }

  await browser.close();
  console.log('✅ All real application screenshots successfully captured and organized!');
}

capture().catch((err) => {
  console.error('❌ Error during capture:', err);
  process.exit(1);
});
