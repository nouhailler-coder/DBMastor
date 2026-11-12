const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch({
    executablePath: '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell',
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:3000/?view=app&tab=dashboard&no_onboarding=true');
  await page.waitForTimeout(2500);

  // Take screenshot
  await page.screenshot({ path: 'src/assets/images/app_dashboard.png' });
  fs.copyFileSync('src/assets/images/app_dashboard.png', 'public/assets/images/app_dashboard.png');
  fs.copyFileSync('src/assets/images/app_dashboard.png', 'src/assets/images/dbmastery_studio_screenshot_1790453723903.jpg');
  fs.copyFileSync('src/assets/images/app_dashboard.png', 'public/assets/images/dbmastery_studio_screenshot_1790453723903.jpg');

  const stats = fs.statSync('src/assets/images/app_dashboard.png');
  console.log('CAPTURED_DASHBOARD_SIZE: ' + stats.size);
  await browser.close();
}

run().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
