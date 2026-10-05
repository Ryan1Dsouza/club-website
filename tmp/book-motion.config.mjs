import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '../tests/browser', workers: 1, timeout: 60000,
  outputDir: '../output/book-motion/tests',
  use: { baseURL: 'http://127.0.0.1:3053', headless: true },
});
