import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import base from '../playwright.config.mjs';

export default defineConfig({
  ...base,
  testDir: '../tests/browser',
  outputDir: '../test-results/page-palette-checks',
  use: { ...base.use, baseURL: 'http://127.0.0.1:3016' },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 3016 --strictPort',
    url: 'http://127.0.0.1:3016',
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    reuseExistingServer: false,
  },
});
