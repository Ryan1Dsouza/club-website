import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:5187',
    headless: true,
    viewport: { width: 1440, height: 1050 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5187 --strictPort',
    url: 'http://127.0.0.1:5187',
    reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: 'https://portal-test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-public-key',
      VITE_PUBLIC_SITE_URL: 'https://example.com',
    },
  },
})
