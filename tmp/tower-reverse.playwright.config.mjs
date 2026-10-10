import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  testDir: '../tests/browser',
  outputDir: './tower-reverse-results',
  timeout: 90_000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:5173', headless: true },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5173 --strictPort',
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
  },
});
