import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.', testMatch: 'admin-events.spec.ts', timeout: 45000, workers: 1,
  reporter: [['json',{outputFile:'output/site-audit-2026-10-07/admin-events-results.json'}]],
  outputDir: 'admin-event-artifacts',
  use: { baseURL: 'http://127.0.0.1:5188', headless: true },
  webServer: { command: 'npm --prefix admin run dev -- --host 127.0.0.1 --port 5188 --strictPort', cwd: '../..', url:'http://127.0.0.1:5188', reuseExistingServer:false,
    env:{ VITE_SUPABASE_URL:'https://portal-test.supabase.co', VITE_SUPABASE_ANON_KEY:'test-public-key', VITE_PUBLIC_SITE_URL:'https://example.com' } }
});
