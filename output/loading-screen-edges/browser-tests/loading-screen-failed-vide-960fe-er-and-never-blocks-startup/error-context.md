# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: loading-screen.spec.mjs >> failed video playback keeps the branded poster and never blocks startup
- Location: tests\browser\loading-screen.spec.mjs:187:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: locator('[data-loading-screen]')
Expected: "false"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveAttribute" locator('[data-loading-screen]') with timeout 5000ms
  - waiting for locator('[data-loading-screen]')

```

```yaml
- img
- text: Gathering pieces...
```

# Test source

```ts
  92  | });
  93  | 
  94  | test('native video advances its media pipeline during a blocked JavaScript task', async ({ page }, info) => {
  95  |   const release = await holdInitialRequest(page);
  96  |   await page.goto('/recruitment', { waitUntil: 'domcontentloaded' });
  97  |   await expect(screen(page)).toHaveAttribute('data-frames-ready', 'true');
  98  |   const sample = await screen(page).locator('video').evaluate(video => {
  99  |     const before = video.getVideoPlaybackQuality();
  100 |     const start = performance.now(), until = start + 600;
  101 |     while (performance.now() < until) { /* Simulate synchronous parsing/work. */ }
  102 |     const after = video.getVideoPlaybackQuality();
  103 |     return { blockedMs: performance.now() - start, frames: after.totalVideoFrames - before.totalVideoFrames,
  104 |       dropped: after.droppedVideoFrames - before.droppedVideoFrames };
  105 |   });
  106 |   release();
  107 |   await info.attach('blocked-js-playback', { body: JSON.stringify(sample), contentType: 'application/json' });
  108 |   expect(sample.blockedMs).toBeGreaterThanOrEqual(600);
  109 |   expect(sample.frames - sample.dropped).toBeGreaterThanOrEqual(6);
  110 | });
  111 | 
  112 | for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  113 |   test(`brief startup timing and artwork fit at ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
  114 |     await recordTiming(page);
  115 |     await page.route('**/api/site', route => route.fulfill({ json: site }));
  116 |     await page.setViewportSize(viewport);
  117 |     await page.goto('/recruitment', { waitUntil: 'domcontentloaded' });
  118 |     const loader = screen(page);
  119 |     await expect(loader).toBeVisible();
  120 |     const box = await loader.boundingBox();
  121 |     expect(box).toEqual({ x: 0, y: 0, ...viewport });
  122 |     await expect(loader.locator('video')).toHaveCSS('object-fit', 'cover');
  123 |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  124 |     await page.screenshot({ path: info.outputPath(`loader-${viewport.width}.png`) });
  125 |     await expect(loader).toHaveCount(0, { timeout: 3000 });
  126 |     const times = await page.evaluate(() => window.loaderTimes);
  127 |     expect(times.exiting - times.loading).toBeGreaterThanOrEqual(1350);
  128 |     expect(times.exiting - times.loading).toBeLessThan(1900);
  129 |     const exitDuration = viewport.width <= 767 || viewport.height <= 500 ? 350 : 450;
  130 |     expect(times.done - times.exiting).toBeGreaterThanOrEqual(exitDuration - 60);
  131 |     expect(times.done - times.exiting).toBeLessThan(exitDuration + 450);
  132 |     expect(times.done - times.loading).toBeLessThan(2500);
  133 |     await info.attach('startup-timing', { body: JSON.stringify(times), contentType: 'application/json' });
  134 |   });
  135 | }
  136 | 
  137 | test('desktop logo waits until the loading curtain has exited', async ({ page }) => {
  138 |   const errors = []; page.on('pageerror', error => errors.push(error.message));
  139 |   await recordTiming(page);
  140 |   await page.addInitScript(() => {
  141 |     window.__THREE_DEVTOOLS__ = { dispatchEvent(event) {
  142 |       const renderer = event.detail;
  143 |       if (!renderer?.isWebGLRenderer) return;
  144 |       const render = renderer.render.bind(renderer);
  145 |       renderer.render = (scene, camera) => {
  146 |         render(scene, camera);
  147 |         if (!window.heroFirstFrame && renderer.domElement.closest('.logo-landing__scene')) {
  148 |           window.heroFirstFrame = {
  149 |             time: performance.now(),
  150 |             stage: document.querySelector('.site-shell')?.dataset.loadingStage,
  151 |             curtainPresent: Boolean(document.querySelector('[data-loading-screen]')),
  152 |           };
  153 |         }
  154 |       };
  155 |     } };
  156 |   });
  157 |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  158 |   await page.goto('/');
  159 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });
  160 |   await expect(page.locator('.logo-landing')).toHaveAttribute('data-status', 'ready');
  161 |   const { firstFrame, times } = await page.evaluate(() => ({ firstFrame: window.heroFirstFrame, times: window.loaderTimes }));
  162 |   expect(firstFrame.stage).toBe('done');
  163 |   expect(firstFrame.curtainPresent).toBe(false);
  164 |   expect(firstFrame.time).toBeGreaterThanOrEqual(times.done);
  165 |   expect(errors).toEqual([]);
  166 | });
  167 | 
  168 | test('reduced motion keeps one static frame and removes the artificial wait and wipe', async ({ page }) => {
  169 |   const mediaRequests = [];
  170 |   page.on('request', request => { if (/\.mp4$/.test(request.url()) && request.resourceType() !== 'script') mediaRequests.push(request.url()); });
  171 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  172 |   const release = await holdInitialRequest(page);
  173 |   await page.goto('/recruitment');
  174 |   const loader = screen(page);
  175 |   await expect(loader).toBeVisible();
  176 |   await expect(loader.locator('.nucleus-loader__poster')).toBeVisible();
  177 |   await expect(loader.locator('video')).toBeHidden();
  178 |   expect(await loader.locator('video').evaluate(video => video.paused)).toBe(true);
  179 |   expect(mediaRequests).toEqual([]);
  180 |   const started = Date.now();
  181 |   release();
  182 |   await expect(loader).toHaveCount(0, { timeout: 1000 });
  183 |   expect(Date.now() - started).toBeLessThan(1000);
  184 |   expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
  185 | });
  186 | 
  187 | test('failed video playback keeps the branded poster and never blocks startup', async ({ page }) => {
  188 |   await freezeStartup(page);
  189 |   await page.route('**/*.mp4', route => route.abort());
  190 |   const release = await holdInitialRequest(page);
  191 |   await page.goto('/recruitment');
> 192 |   await expect(screen(page)).toHaveAttribute('data-frames-ready', 'false');
      |                              ^ Error: expect(locator).toHaveAttribute(expected) failed
  193 |   const poster = screen(page).locator('.nucleus-loader__poster img');
  194 |   await expect(poster).toBeVisible();
  195 |   expect(await poster.evaluate(image => image.complete && image.naturalWidth > 1)).toBe(true);
  196 |   release();
  197 |   await page.clock.runFor(1500);
  198 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  199 |   await page.clock.runFor(500);
  200 |   await expect(screen(page)).toHaveCount(0);
  201 | });
  202 | 
  203 | test.describe('mobile artwork', () => {
  204 |   test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  205 | 
  206 |   test('native video animates with JS paused and fills portrait and landscape screens', async ({ page }, info) => {
  207 |     await freezeStartup(page);
  208 |     const requests = [];
  209 |     page.on('request', request => { if (['image', 'media', 'fetch', 'other'].includes(request.resourceType()) && /loading/.test(request.url())) requests.push(request.url()); });
  210 |     const release = await holdInitialRequest(page);
  211 |     await page.goto('/events');
  212 |     await expect(screen(page)).toHaveAttribute('data-frames-ready', 'true');
  213 |     const image = screen(page).locator('.nucleus-loader__poster img');
  214 |     await expect(image).toBeVisible();
  215 |     expect(new Set(requests.filter(url => /sequence\.mp4/.test(url))).size).toBe(1);
  216 |     expect(requests.filter(url => /desktop\/sequence/.test(url))).toHaveLength(0);
  217 |     expect(requests.filter(url => /frame-\d+/.test(url))).toHaveLength(0);
  218 |     // Native decoding advances even while the test has frozen all JS timers/RAF.
  219 |     const snapshots = [];
  220 |     for (let index = 0; index < 4; index++) {
  221 |       snapshots.push((await screen(page).screenshot({ animations: 'allow' })).toString('base64'));
  222 |       await new Promise(resolve => setTimeout(resolve, 125));
  223 |     }
  224 |     expect(new Set(snapshots).size).toBeGreaterThan(2);
  225 |     // The static branded frame also makes screenshot comparisons deterministic.
  226 |     await page.emulateMedia({ reducedMotion: 'reduce' });
  227 |     await expect(screen(page).locator('video')).toBeHidden();
  228 |     for (const viewport of [{ width: 320, height: 568 }, { width: 360, height: 800 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 844, height: 390 }]) {
  229 |       await page.setViewportSize(viewport);
  230 |       await expect(image).toHaveCSS('object-fit', 'cover');
  231 |       await expect(screen(page)).toHaveCSS('height', `${viewport.height}px`);
  232 |       const artworkBox = await image.boundingBox();
  233 |       // Overscan keeps the media's hard edges outside the visible viewport.
  234 |       expect(artworkBox.x).toBeLessThan(0);
  235 |       expect(artworkBox.y).toBeLessThan(0);
  236 |       expect(artworkBox.x + artworkBox.width).toBeGreaterThan(viewport.width);
  237 |       expect(artworkBox.y + artworkBox.height).toBeGreaterThan(viewport.height);
  238 |       expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  239 |       const portrait = viewport.height >= viewport.width;
  240 |       await expect.poll(() => image.evaluate(element => ({ width: element.naturalWidth, height: element.naturalHeight })))
  241 |         .toEqual(portrait ? { width: 480, height: 1040 } : { width: 1440, height: 810 });
  242 |       if (portrait) {
  243 |         const scale = Math.max(artworkBox.width / 480, artworkBox.height / 1040);
  244 |         // The central subject stays inside the screen even on tall phones and tablets.
  245 |         expect(400 * scale).toBeLessThanOrEqual(viewport.width);
  246 |         expect(600 * scale).toBeLessThanOrEqual(viewport.height);
  247 |       }
  248 |       await page.screenshot({ path: info.outputPath(`loader-fullscreen-${viewport.width}.png`) });
  249 |     }
  250 |     await page.emulateMedia({ reducedMotion: 'no-preference' });
  251 |     await expect(screen(page)).toHaveAttribute('data-frames-ready', 'true');
  252 |     await expect.poll(() => screen(page).locator('video').evaluate(video => [video.videoWidth, video.videoHeight]))
  253 |       .toEqual([1440, 810]);
  254 |     release();
  255 |     await page.clock.runFor(1500);
  256 |     await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  257 |     await expect(screen(page)).toHaveCSS('clip-path', 'none');
  258 |     await page.clock.runFor(500);
  259 |     await expect(screen(page)).toHaveCount(0);
  260 |   });
  261 | 
  262 |   test('all failed images leave a readable fallback', async ({ page }) => {
  263 |     await freezeStartup(page);
  264 |     const release = await holdInitialRequest(page);
  265 |     await page.route('**/loading/**', route => ['image', 'media', 'fetch', 'other'].includes(route.request().resourceType()) ? route.abort() : route.continue());
  266 |     await page.goto('/recruitment');
  267 |     await expect(page.locator('.nucleus-loader__fallback')).toHaveText('Nucleus');
  268 |     release();
  269 |     await page.clock.runFor(1500);
  270 |     await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  271 |     await page.clock.runFor(500);
  272 |     await expect(screen(page)).toHaveCount(0);
  273 |   });
  274 | 
  275 |   test('a slower mobile CPU still reveals the usable events page promptly', async ({ page }) => {
  276 |     const session = await page.context().newCDPSession(page);
  277 |     await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  278 |     await recordTiming(page);
  279 |     await page.route('**/api/site', route => route.fulfill({ json: site }));
  280 |     await page.goto('/events', { waitUntil: 'domcontentloaded' });
  281 |     await expect(screen(page)).toHaveCount(0, { timeout: 5000 });
  282 |     await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  283 |     const times = await page.evaluate(() => window.loaderTimes);
  284 |     expect(times.done - times.loading).toBeLessThan(2800);
  285 |     await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toBeEnabled();
  286 |   });
  287 | });
  288 | 
  289 | test('stalled startup still reveals the usable page at the deadline', async ({ page }) => {
  290 |   await recordTiming(page);
  291 |   const release = await holdInitialRequest(page);
  292 |   await page.goto('/recruitment');
```