import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../tests/browser', timeout: 60_000, workers: 1,
  outputDir: '../output/ripple-loader/browser',
  use: { baseURL: 'http://127.0.0.1:3016', headless: true },
});
