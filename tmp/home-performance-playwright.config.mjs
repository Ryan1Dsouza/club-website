import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  testDir: '../tests/browser',
  outputDir: '../output/home-performance/browser',
  timeout: 60_000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3037', headless: true },
  webServer: {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    command: 'npx vite --host 127.0.0.1 --port 3037 --strictPort',
    url: 'http://127.0.0.1:3037',
    reuseExistingServer: false,
  },
});
