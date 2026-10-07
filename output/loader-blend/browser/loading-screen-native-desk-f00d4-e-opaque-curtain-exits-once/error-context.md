# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: loading-screen.spec.mjs >> native desktop playback advances without a JS clock and the opaque curtain exits once
- Location: tests\browser\loading-screen.spec.mjs:36:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('[data-loading-screen]')
Expected: "true"
Received: "false"
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" locator('[data-loading-screen]') with timeout 5000ms
  - waiting for locator('[data-loading-screen]')
    6 × locator resolved to <div data-lenis-prevent="" class="nucleus-loader" data-loading-screen="" data-art-failed="false" data-frames-ready="false">…</div>
      - unexpected value "false"

```

```yaml
- status: Connecting the dots…
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
> 43  |   await expect(loader).toHaveAttribute('data-frames-ready', 'true');
      |                        ^ Error: expect(locator).toHaveAttribute(expected) failed
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
```