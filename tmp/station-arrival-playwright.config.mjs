import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../tests/browser', testMatch: 'station-arrival.spec.mjs', timeout: 90_000, workers: 1,
  outputDir: './station-arrival-results',
  use: { baseURL: 'http://127.0.0.1:3032', headless: true },
  webServer: { command: 'npx vite --host 127.0.0.1 --port 3032 --strictPort', url: 'http://127.0.0.1:3032', reuseExistingServer: false, cwd: '..' },
});
