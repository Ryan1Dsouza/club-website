import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
export default defineConfig({ testDir:'../tests/browser', timeout:60000, workers:1,
use:{baseURL:'http://127.0.0.1:3012',headless:true},
webServer:{command:'npx vite --host 127.0.0.1 --port 3012 --strictPort',cwd:fileURLToPath(new URL('./events-validation',import.meta.url)),url:'http://127.0.0.1:3012',reuseExistingServer:false},
});
