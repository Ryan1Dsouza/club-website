import base from '../playwright.config.mjs';
import { fileURLToPath } from 'node:url';
export default { ...base, testDir: '../tests/browser', use: { ...base.use, baseURL: 'http://127.0.0.1:3017' }, webServer: { ...base.webServer, cwd: fileURLToPath(new URL('..', import.meta.url)), command: 'npx vite --host 127.0.0.1 --port 3017 --strictPort', url: 'http://127.0.0.1:3017' } };
