import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import base from '../playwright.config.mjs';
export default defineConfig({
  ...base,
  testDir: '../tests/browser',
  outputDir: '../output/event-carousel/browser',
  use: { ...base.use, baseURL: 'http://127.0.0.1:3021', video: 'retain-on-failure' },
  webServer: { cwd: fileURLToPath(new URL('..', import.meta.url)), command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 3021 --strictPort', url: 'http://127.0.0.1:3021', reuseExistingServer: false },
});
