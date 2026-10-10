# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: loading-screen.spec.mjs >> brief startup timing and artwork fit at 844x390
- Location: tests\browser\loading-screen.spec.mjs:113:3

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 1350
Received:    1259
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner:
    - navigation "Main navigation":
      - generic:
        - generic [ref=e5]:
          - link "Nucleus home" [ref=e6] [cursor=pointer]:
            - /url: /
            - text: Nucleus
          - button "Website sound" [pressed] [ref=e7] [cursor=pointer]
          - button "Open menu" [ref=e12] [cursor=pointer]
        - generic [aria-hidden]:
          - generic:
            - generic:
              - list:
                - listitem:
                  - link:
                    - /url: /
                    - generic [aria-hidden]:
                      - generic: H
                      - generic: o
                      - generic: m
                      - generic: e
                - listitem:
                  - link:
                    - /url: /events
                    - generic [aria-hidden]:
                      - generic: E
                      - generic: v
                      - generic: e
                      - generic: "n"
                      - generic: t
                      - generic: s
                - listitem:
                  - link:
                    - /url: /news
                    - generic [aria-hidden]:
                      - generic: L
                      - generic: i
                      - generic: v
                      - generic: e
                      - generic: "N"
                      - generic: e
                      - generic: w
                      - generic: s
                - listitem:
                  - link:
                    - /url: /projects
                    - generic [aria-hidden]:
                      - generic: O
                      - generic: u
                      - generic: r
                      - generic: w
                      - generic: o
                      - generic: r
                      - generic: k
                - listitem:
                  - link:
                    - /url: /achievements
                    - generic [aria-hidden]:
                      - generic: A
                      - generic: c
                      - generic: h
                      - generic: i
                      - generic: e
                      - generic: v
                      - generic: e
                      - generic: m
                      - generic: e
                      - generic: "n"
                      - generic: t
                      - generic: s
                - listitem:
                  - link:
                    - /url: /team
                    - generic [aria-hidden]:
                      - generic: T
                      - generic: h
                      - generic: e
                      - generic: p
                      - generic: e
                      - generic: o
                      - generic: p
                      - generic: l
                      - generic: e
                - listitem:
                  - link:
                    - /url: /recruitment
                    - generic [aria-hidden]:
                      - generic: R
                      - generic: e
                      - generic: c
                      - generic: r
                      - generic: u
                      - generic: i
                      - generic: t
                      - generic: m
                      - generic: e
                      - generic: "n"
                      - generic: t
              - list:
                - listitem:
                  - link:
                    - /url: https://www.instagram.com/nucleus_sjec/
                    - text: Instagram
                - listitem:
                  - link:
                    - /url: https://www.linkedin.com/company/nucleus-sjec/
                    - text: LinkedIn
                - listitem:
                  - link:
                    - /url: mailto:nucleussjec@gmail.com
                    - text: Email
            - generic:
              - generic:
                - generic: Made of many minds
                - generic: © 2026 Nucleus SJEC
              - generic:
                - generic: The community
                - button: Join Nucleus
  - main [ref=e16]:
    - generic [ref=e17]:
      - generic [ref=e18]:
        - text: Nucleus · SJEC
        - heading "Recruitment" [level=1] [ref=e19]
      - generic [ref=e21]:
        - heading "Sign in to Apply" [level=2] [ref=e22]
        - paragraph [ref=e23]: You must use your official @sjec.ac.in college email to apply for Nucleus.
        - button "Sign in with SJEC Google" [ref=e24] [cursor=pointer]
```

# Test source

```ts
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
  44  |   const pageBackdrop = await page.evaluate(() => {
  45  |     const swatch = document.createElement('div');
  46  |     swatch.style.backgroundColor = 'var(--page-backdrop)';
  47  |     document.body.append(swatch);
  48  |     const color = getComputedStyle(swatch).backgroundColor;
  49  |     swatch.remove();
  50  |     return color;
  51  |   });
  52  |   await expect(loader).toHaveCSS('background-color', pageBackdrop);
  53  |   await expect(loader).toHaveCSS('color', 'rgb(155, 207, 162)');
  54  |   await expect(loader.getByRole('status')).toHaveText('Connecting the dots…');
  55  |   expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(true);
  56  |   await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  57  |   const video = loader.locator('video');
  58  |   expect(await video.evaluate(video => video.duration)).toBeCloseTo(.85, 2);
  59  |   const snapshots = [];
  60  |   for (let index = 0; index < 4; index++) {
  61  |     snapshots.push((await loader.screenshot({ animations: 'allow' })).toString('base64'));
  62  |     await new Promise(resolve => setTimeout(resolve, 125));
  63  |   }
  64  |   expect(new Set(snapshots).size).toBeGreaterThan(2);
  65  |   await page.screenshot({ path: info.outputPath('loader-desktop.png') });
  66  |   release();
  67  |   await page.clock.runFor(1500);
  68  |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'exiting');
  69  |   await page.clock.runFor(120);
  70  |   await expect(loader).toHaveCSS('clip-path', 'none');
  71  |   const exit = await loader.evaluate(element => ({
  72  |     x: new DOMMatrixReadOnly(getComputedStyle(element).transform).m41,
  73  |     opacity: getComputedStyle(element).opacity,
  74  |   }));
  75  |   expect(exit.x).toBeLessThan(0);
  76  |   expect(exit.opacity).toBe('1');
  77  |   await page.screenshot({ path: info.outputPath('loader-curtain-exit.png') });
  78  |   await page.clock.runFor(500);
  79  |   await expect(loader).toHaveCount(0);
  80  |   expect(await page.locator('.site-shell').evaluate(element => element.inert)).toBe(false);
  81  |   expect(await page.locator('body').evaluate(element => element.style.overflow)).toBe('');
  82  |   expect(await page.locator('html').evaluate(element => element.style.scrollbarGutter)).toBe('');
  83  |   await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  84  |   await page.clock.runFor(1600);
  85  |   await page.getByRole('link', { name: 'Our work', exact: true }).click();
  86  |   await page.clock.runFor(1300);
  87  |   await expect(page).toHaveURL(/\/projects$/);
  88  |   await expect(loader).toHaveCount(0);
  89  |   await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  90  |   await expect(loader).toHaveCount(0);
  91  |   expect(errors).toEqual([]);
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
> 127 |     expect(times.exiting - times.loading).toBeGreaterThanOrEqual(1350);
      |                                           ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
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
  192 |   await expect(screen(page)).toHaveAttribute('data-frames-ready', 'false');
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
  218 |     // Check the decoded artwork, not just the video element's fullscreen box.
  219 |     // The old portrait clip baked blank bands above and below a small sketch.
  220 |     const ink = await screen(page).locator('video').evaluate(async video => {
  221 |       video.pause();
  222 |       await new Promise(resolve => {
  223 |         video.addEventListener('seeked', resolve, { once: true });
  224 |         video.currentTime = .52;
  225 |       });
  226 |       const canvas = document.createElement('canvas');
  227 |       canvas.width = video.videoWidth; canvas.height = video.videoHeight;
```