import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../tests/browser', workers: 1, timeout: 60000,
  outputDir: '../output/events-refresh',
  use: { baseURL: 'http://127.0.0.1:3037', headless: true },
});
