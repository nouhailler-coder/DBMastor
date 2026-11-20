import fs from 'fs';
import { defineConfig } from 'playwright/test';

const candidatePaths = [
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell',
  '/root/.cache/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell',
];
const chromiumExecutable = candidatePaths.find((p) => fs.existsSync(p));

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    launchOptions: {
      ...(chromiumExecutable ? { executablePath: chromiumExecutable } : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    },
    trace: 'off',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000/',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
