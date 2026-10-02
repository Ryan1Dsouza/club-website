import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import base from './events-carousel-playwright.config.mjs';

export default defineConfig({
  ...base,
  outputDir: '../output/event-carousel/production',
  use: { ...base.use, baseURL: 'http://127.0.0.1:3022', trace: 'retain-on-failure' },
  webServer: {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 3022 --strictPort --outDir dist/client',
    url: 'http://127.0.0.1:3022',
    reuseExistingServer: false,
  },
});
