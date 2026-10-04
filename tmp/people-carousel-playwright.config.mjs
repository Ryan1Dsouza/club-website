import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../tests/browser', timeout: 45_000, workers: 1,
  outputDir: '../output/people-carousel',
  use: { baseURL: 'http://127.0.0.1:3018', headless: true },
  webServer: { command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 3018 --strictPort', url: 'http://127.0.0.1:3018', cwd: process.cwd(), reuseExistingServer: false },
});
