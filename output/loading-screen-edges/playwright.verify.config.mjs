import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import baseConfig from '../../playwright.config.mjs';
export default defineConfig({
  ...baseConfig,
  testDir: resolve('tests/browser'),
  outputDir: resolve('output/loading-screen-edges/isolated-video-failure'),
  webServer: { ...baseConfig.webServer, cwd: process.cwd(), command: 'npx vite --config output/loading-screen-edges/vite.verify.config.ts --host 127.0.0.1 --port 3010 --strictPort' },
});
