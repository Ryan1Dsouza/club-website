import { defineConfig } from '@playwright/test';
export default defineConfig({
 testDir: '../tests/browser', workers: 1, timeout: 60000,
 outputDir: '../output/people-book-refresh/tests',
 use: { baseURL:'http://127.0.0.1:3049',headless:true },
 webServer: { command:'npx vite --host 127.0.0.1 --port 3049 --strictPort',url:'http://127.0.0.1:3049',reuseExistingServer:false },
});
