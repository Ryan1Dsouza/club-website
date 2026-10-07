import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../tests/browser', timeout: 60000, workers: 1,
  outputDir: '../output/jenga-refresh/tests',
  use: { baseURL: 'http://127.0.0.1:3051', headless: true },
});
