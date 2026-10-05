# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-loader-startup.spec.mjs >> cold Android Chrome events startup has its animation ready before the curtain exits
- Location: tests\browser\mobile-loader-startup.spec.mjs:22:1

# Error details

```
Error: expect(received).toBeLessThan(expected)

Matcher error: received value must be a number or bigint

Received has value: undefined
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import express from 'express';
  3  | import compression from 'compression';
  4  | import { readFile } from 'node:fs/promises';
  5  | import { resolve } from 'node:path';
  6  | 
  7  | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  8  | let server, origin;
  9  | test.beforeAll(async () => {
  10 |   // Match Vercel's static SPA entry, including the route chunk loaded before boot.
  11 |   const app = express();
  12 |   app.use(compression());
  13 |   app.get('/api/site', (_request, response) => response.json(site));
  14 |   app.use(express.static(resolve('dist/client')));
  15 |   app.use((_request, response) => response.sendFile(resolve('dist/client/index.html')));
  16 |   server = app.listen(0, '127.0.0.1');
  17 |   await new Promise(resolve => server.once('listening', resolve));
  18 |   origin = `http://127.0.0.1:${server.address().port}`;
  19 | });
  20 | test.afterAll(async () => { await new Promise(resolve => server.close(resolve)); });
  21 | 
  22 | test('cold Android Chrome events startup has its animation ready before the curtain exits', async ({ browser }, info) => {
  23 |   const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  24 |   try {
  25 |     const page = await context.newPage();
  26 |     const session = await context.newCDPSession(page);
  27 |     await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  28 |     await session.send('Network.enable');
  29 |     await session.send('Network.setCacheDisabled', { cacheDisabled: true });
  30 |     await session.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200_000, uploadThroughput: 100_000 });
  31 |     await page.addInitScript(() => {
  32 |       window.startupTimes = {};
  33 |       new MutationObserver(() => {
  34 |         const stage = document.querySelector('.site-shell')?.dataset.loadingStage;
  35 |         if (stage && !(stage in window.startupTimes)) window.startupTimes[stage] = performance.now();
  36 |         if (document.querySelector('[data-frames-ready="true"]') && !window.startupTimes.ready) window.startupTimes.ready = performance.now();
  37 |       }).observe(document, { childList: true, subtree: true, attributes: true });
  38 |     });
  39 |     await page.goto(origin + '/events', { waitUntil: 'domcontentloaded' });
  40 |     await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 20_000 });
  41 |     const report = await page.evaluate(() => ({
  42 |       times: window.startupTimes,
  43 |       images: performance.getEntriesByType('resource').filter(resource => /\/sequence-.*\.mp4/.test(resource.name))
  44 |         .map(resource => ({ url: resource.name, start: resource.startTime, end: resource.responseEnd, initiator: resource.initiatorType })),
  45 |     }));
  46 |     await info.attach('cold-mobile-startup', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  47 |     // The old implementation spent the entire intro waiting for 17 image downloads.
> 48 |     expect(report.times.ready).toBeLessThan(report.times.exiting - 500);
     |                                ^ Error: expect(received).toBeLessThan(expected)
  49 |     expect(report.times.done - report.times.loading).toBeLessThan(2800);
  50 |     expect(new Set(report.images.map(image => image.url)).size).toBe(1);
  51 |     expect(report.images[0].initiator).toBe('video');
  52 |     expect(report.images[0].start).toBeLessThan(report.times.loading);
  53 |     await expect(page.getByRole('heading', { level: 1, name: 'Events.' })).toBeVisible();
  54 |   } finally { await context.close(); }
  55 | });
  56 | 
```