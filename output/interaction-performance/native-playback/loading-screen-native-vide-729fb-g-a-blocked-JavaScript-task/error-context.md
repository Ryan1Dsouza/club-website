# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: loading-screen.spec.mjs >> native video advances its media pipeline during a blocked JavaScript task
- Location: tests\browser\loading-screen.spec.mjs:86:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: locator('[data-loading-screen]')
Expected: "true"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveAttribute" locator('[data-loading-screen]') with timeout 5000ms
  - waiting for locator('[data-loading-screen]')

```

```yaml
- img
- text: "Gathering pieces... [plugin:vite:react-babel] Cannot find module 'caniuse-lite/dist/unpacker/agents' Require stack: - C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\browserslist\\index.js - C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\helper-compilation-targets\\lib\\index.js - C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\config\\resolve-targets.js - C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\config\\config-descriptors.js - C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\config\\item.js - C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\config\\full.js - C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\config\\index.js - C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\transform-file.js - C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\config\\files\\module-types.js - C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\config\\files\\configuration.js - C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\config\\files\\index.js - C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\index.js C:/Users/ryan1/OneDrive/Documents/club-website/src/main.tsx at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15) at defaultResolveImpl (node:internal/modules/cjs/loader:1066:19) at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1071:22) at Module._load (node:internal/modules/cjs/loader:1242:25) at wrapModuleLoad (node:internal/modules/cjs/loader:255:19) at Module.require (node:internal/modules/cjs/loader:1556:12) at require (node:internal/modules/helpers:152:16) at Object.<anonymous> (C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\browserslist\\index.js:3:14) at Module._compile (node:internal/modules/cjs/loader:1812:14) at Object..js (node:internal/modules/cjs/loader:1943:10) at Module.load (node:internal/modules/cjs/loader:1533:32) at Module._load (node:internal/modules/cjs/loader:1335:12) at wrapModuleLoad (node:internal/modules/cjs/loader:255:19) at Module.require (node:internal/modules/cjs/loader:1556:12) at require (node:internal/modules/helpers:152:16) at Object.<anonymous> (C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\helper-compilation-targets\\lib\\index.js:44:21) at Module._compile (node:internal/modules/cjs/loader:1812:14) at Object..js (node:internal/modules/cjs/loader:1943:10) at Module.load (node:internal/modules/cjs/loader:1533:32) at Module._load (node:internal/modules/cjs/loader:1335:12) at wrapModuleLoad (node:internal/modules/cjs/loader:255:19) at Module.require (node:internal/modules/cjs/loader:1556:12) at require (node:internal/modules/helpers:152:16) at _helperCompilationTargets (C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\config\\resolve-targets.js:16:16) at resolveTargets (C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\config\\resolve-targets.js:52:14) at loadPrivatePartialConfig (C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\config\\partial.js:81:49) at loadPrivatePartialConfig.next (<anonymous>) at loadFullConfig (C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\config\\full.js:36:46) at loadFullConfig.next (<anonymous>) at transform (C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\transform.js:20:44) at transform.next (<anonymous>) at step (C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\gensync\\index.js:261:32) at evaluateAsync (C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\gensync\\index.js:291:5) at C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\gensync\\index.js:93:9 at new Promise (<anonymous>) at async (C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\gensync\\index.js:92:14) at stopHiding - secret - don't use this - v1 (C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\errors\\rewrite-stack-trace.js:47:12) at Module.transformAsync (C:\\Users\\ryan1\\OneDrive\\Documents\\club-website\\node_modules\\@babel\\core\\lib\\transform.js:43:77) at TransformPluginContext.handler (file:///C:/Users/ryan1/OneDrive/Documents/club-website/node_modules/@vitejs/plugin-react/dist/index.js:206:46) at async EnvironmentPluginContainer.transform (file:///C:/Users/ryan1/OneDrive/Documents/club-website/node_modules/vite/dist/node/chunks/config.js:28877:14) at async loadAndTransform (file:///C:/Users/ryan1/OneDrive/Documents/club-website/node_modules/vite/dist/node/chunks/config.js:22746:26) Click outside, press Esc key, or fix the code to dismiss. You can also disable this overlay by setting"
- code: server.hmr.overlay
- text: to
- code: "false"
- text: in
- code: vite.config.ts
- text: .
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { readFile } from 'node:fs/promises';
  3   | import { createServer } from 'vite';
  4   | 
  5   | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  6   | const screen = page => page.locator('[data-loading-screen]');
  7   | 
  8   | async function freezeStartup(page) {
  9   |   // Inspect every artwork frame without extending the real startup deadline.
  10  |   await page.clock.install({ time: new Date('2026-10-02T12:00:00Z') });
  11  |   await page.clock.pauseAt(new Date('2026-10-02T12:00:01Z'));
  12  | }
  13  | 
  14  | async function holdInitialRequest(page) {
  15  |   let release;
  16  |   const ready = new Promise(resolve => { release = resolve; });
  17  |   await page.route('**/api/site', async route => {
  18  |     await ready;
  19  |     await route.fulfill({ json: site }).catch(() => {});
  20  |   });
  21  |   return release;
  22  | }
  23  | 
  24  | async function recordTiming(page) {
  25  |   await page.addInitScript(() => {
  26  |     window.loaderTimes = {};
  27  |     new MutationObserver(() => {
  28  |       const stage = document.querySelector('.site-shell')?.dataset.loadingStage;
  29  |       const ready = document.querySelector('[data-frames-ready="true"]');
  30  |       if (stage && !(stage in window.loaderTimes)) window.loaderTimes[stage] = performance.now();
  31  |       if (ready && !window.loaderTimes.frames) window.loaderTimes.frames = performance.now();
  32  |     }).observe(document, { subtree: true, childList: true, attributes: true });
  33  |   });
  34  | }
  35  | 
  36  | test('native desktop playback advances without a JS clock and the opaque curtain exits once', async ({ page }, info) => {
  37  |   const errors = []; page.on('pageerror', error => errors.push(error.message));
  38  |   await freezeStartup(page);
  39  |   const release = await holdInitialRequest(page);
  40  |   await page.setViewportSize({ width: 1440, height: 900 });
  41  |   await page.goto('/recruitment');
  42  |   const loader = screen(page);
  43  |   await expect(loader).toHaveAttribute('data-frames-ready', 'true');
  44  |   await expect(loader).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  45  |   await expect(loader).toHaveCSS('color', 'rgb(195, 229, 200)');
  46  |   await expect(page.getByRole('status')).toHaveText('Connecting the dots…');
  47  |   expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(true);
  48  |   await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  49  |   const video = loader.locator('video');
  50  |   expect(await video.evaluate(video => video.duration)).toBeCloseTo(.85, 2);
  51  |   const snapshots = [];
  52  |   for (let index = 0; index < 4; index++) {
  53  |     snapshots.push((await loader.screenshot({ animations: 'allow' })).toString('base64'));
  54  |     await new Promise(resolve => setTimeout(resolve, 125));
  55  |   }
  56  |   expect(new Set(snapshots).size).toBeGreaterThan(2);
  57  |   await page.screenshot({ path: info.outputPath('loader-desktop.png') });
  58  |   release();
  59  |   await page.clock.runFor(1500);
  60  |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  61  |   await page.clock.runFor(120);
  62  |   await expect(loader).toHaveCSS('clip-path', 'none');
  63  |   const exit = await loader.evaluate(element => ({
  64  |     x: new DOMMatrixReadOnly(getComputedStyle(element).transform).m41,
  65  |     opacity: getComputedStyle(element).opacity,
  66  |   }));
  67  |   expect(exit.x).toBeLessThan(0);
  68  |   expect(exit.opacity).toBe('1');
  69  |   await page.screenshot({ path: info.outputPath('loader-curtain-exit.png') });
  70  |   await page.clock.runFor(500);
  71  |   await expect(loader).toHaveCount(0);
  72  |   expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
  73  |   expect(await page.locator('body').evaluate(element => element.style.overflow)).toBe('');
  74  |   expect(await page.locator('html').evaluate(element => element.style.scrollbarGutter)).toBe('');
  75  |   await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  76  |   await page.clock.runFor(1600);
  77  |   await page.getByRole('link', { name: 'Our work', exact: true }).click();
  78  |   await page.clock.runFor(1300);
  79  |   await expect(page).toHaveURL(/\/projects$/);
  80  |   await expect(loader).toHaveCount(0);
  81  |   await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  82  |   await expect(loader).toHaveCount(0);
  83  |   expect(errors).toEqual([]);
  84  | });
  85  | 
  86  | test('native video advances its media pipeline during a blocked JavaScript task', async ({ page }, info) => {
  87  |   const release = await holdInitialRequest(page);
  88  |   await page.goto('/recruitment', { waitUntil: 'domcontentloaded' });
> 89  |   await expect(screen(page)).toHaveAttribute('data-frames-ready', 'true');
      |                              ^ Error: expect(locator).toHaveAttribute(expected) failed
  90  |   const sample = await screen(page).locator('video').evaluate(video => {
  91  |     const before = video.getVideoPlaybackQuality();
  92  |     const start = performance.now(), until = start + 600;
  93  |     while (performance.now() < until) { /* Simulate synchronous parsing/work. */ }
  94  |     const after = video.getVideoPlaybackQuality();
  95  |     return { blockedMs: performance.now() - start, frames: after.totalVideoFrames - before.totalVideoFrames,
  96  |       dropped: after.droppedVideoFrames - before.droppedVideoFrames };
  97  |   });
  98  |   release();
  99  |   await info.attach('blocked-js-playback', { body: JSON.stringify(sample), contentType: 'application/json' });
  100 |   expect(sample.blockedMs).toBeGreaterThanOrEqual(600);
  101 |   expect(sample.frames - sample.dropped).toBeGreaterThanOrEqual(6);
  102 | });
  103 | 
  104 | for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  105 |   test(`brief startup timing and artwork fit at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
  106 |     await recordTiming(page);
  107 |     await page.route('**/api/site', route => route.fulfill({ json: site }));
  108 |     await page.setViewportSize(viewport);
  109 |     await page.goto('/recruitment', { waitUntil: 'domcontentloaded' });
  110 |     const loader = screen(page);
  111 |     await expect(loader).toBeVisible();
  112 |     const box = await loader.boundingBox();
  113 |     expect(box).toEqual({ x: 0, y: 0, ...viewport });
  114 |     await expect(loader.locator('video')).toHaveCSS('object-fit', viewport.width <= 767 || viewport.height <= 500 ? 'contain' : 'cover');
  115 |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  116 |     await page.screenshot({ path: info.outputPath(`loader-${viewport.width}.png`) });
  117 |     await expect(loader).toHaveCount(0, { timeout: 3000 });
  118 |     const times = await page.evaluate(() => window.loaderTimes);
  119 |     expect(times.exiting - times.loading).toBeGreaterThanOrEqual(1350);
  120 |     expect(times.exiting - times.loading).toBeLessThan(1900);
  121 |     const exitDuration = viewport.width <= 767 || viewport.height <= 500 ? 350 : 450;
  122 |     expect(times.done - times.exiting).toBeGreaterThanOrEqual(exitDuration - 60);
  123 |     expect(times.done - times.exiting).toBeLessThan(exitDuration + 450);
  124 |     expect(times.done - times.loading).toBeLessThan(2500);
  125 |     await info.attach('startup-timing', { body: JSON.stringify(times), contentType: 'application/json' });
  126 |   });
  127 | }
  128 | 
  129 | test('desktop logo waits until the loading curtain has exited', async ({ page }) => {
  130 |   const errors = []; page.on('pageerror', error => errors.push(error.message));
  131 |   await recordTiming(page);
  132 |   await page.addInitScript(() => {
  133 |     window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
  134 |       const renderer = event.detail;
  135 |       if (!renderer?.isWebGLRenderer) return;
  136 |       const render = renderer.render.bind(renderer);
  137 |       renderer.render = (scene, camera) => {
  138 |         render(scene, camera);
  139 |         if (!window.heroFirstFrame && renderer.domElement.closest('.logo-landing__scene')) {
  140 |           window.heroFirstFrame = {
  141 |             time: performance.now(),
  142 |             stage: document.querySelector('.site-shell')?.dataset.loadingStage,
  143 |             curtainPresent: Boolean(document.querySelector('[data-loading-screen]')),
  144 |           };
  145 |         }
  146 |       };
  147 |     } };
  148 |   });
  149 |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  150 |   await page.goto('/');
  151 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });
  152 |   await expect(page.locator('.logo-landing')).toHaveAttribute('data-status', 'ready');
  153 |   const { firstFrame, times } = await page.evaluate(() => ({ firstFrame: window.heroFirstFrame, times: window.loaderTimes }));
  154 |   expect(firstFrame.stage).toBe('done');
  155 |   expect(firstFrame.curtainPresent).toBe(false);
  156 |   expect(firstFrame.time).toBeGreaterThanOrEqual(times.done);
  157 |   expect(errors).toEqual([]);
  158 | });
  159 | 
  160 | test('reduced motion keeps one static frame and removes the artificial wait and wipe', async ({ page }) => {
  161 |   const mediaRequests = [];
  162 |   page.on('request', request => { if (/\.mp4$/.test(request.url()) && request.resourceType() !== 'script') mediaRequests.push(request.url()); });
  163 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  164 |   const release = await holdInitialRequest(page);
  165 |   await page.goto('/recruitment');
  166 |   const loader = screen(page);
  167 |   await expect(loader).toBeVisible();
  168 |   await expect(loader.locator('.nucleus-loader__poster')).toBeVisible();
  169 |   await expect(loader.locator('video')).toBeHidden();
  170 |   expect(await loader.locator('video').evaluate(video => video.paused)).toBe(true);
  171 |   expect(mediaRequests).toEqual([]);
  172 |   const started = Date.now();
  173 |   release();
  174 |   await expect(loader).toHaveCount(0, { timeout: 1000 });
  175 |   expect(Date.now() - started).toBeLessThan(1000);
  176 |   expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
  177 | });
  178 | 
  179 | test('failed video playback keeps the branded poster and never blocks startup', async ({ page }) => {
  180 |   await freezeStartup(page);
  181 |   await page.route('**/*.mp4', route => route.abort());
  182 |   const release = await holdInitialRequest(page);
  183 |   await page.goto('/recruitment');
  184 |   await expect(screen(page)).toHaveAttribute('data-frames-ready', 'false');
  185 |   const poster = screen(page).locator('.nucleus-loader__poster img');
  186 |   await expect(poster).toBeVisible();
  187 |   expect(await poster.evaluate(image => image.complete && image.naturalWidth > 1)).toBe(true);
  188 |   release();
  189 |   await page.clock.runFor(1500);
```