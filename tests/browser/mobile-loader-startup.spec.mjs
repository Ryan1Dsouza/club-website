import { test, expect } from '@playwright/test';
import express from 'express';
import compression from 'compression';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
let server, origin;
test.beforeAll(async () => {
  // Match Vercel's static SPA entry, including the route chunk loaded before boot.
  const app = express();
  app.use(compression());
  app.get('/api/site', (_request, response) => response.json(site));
  app.use(express.static(resolve('dist/client')));
  app.use((_request, response) => response.sendFile(resolve('dist/client/index.html')));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => { await new Promise(resolve => server.close(resolve)); });

test('cold Android Chrome events startup has its animation ready before the curtain exits', async ({ browser }, info) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  try {
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await session.send('Network.enable');
    await session.send('Network.setCacheDisabled', { cacheDisabled: true });
    await session.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200_000, uploadThroughput: 100_000 });
    await page.addInitScript(() => {
      window.startupTimes = {};
      new MutationObserver(() => {
        const stage = document.querySelector('.site-shell')?.dataset.loadingStage;
        if (stage && !(stage in window.startupTimes)) window.startupTimes[stage] = performance.now();
        if (document.querySelector('[data-frames-ready="true"]') && !window.startupTimes.ready) window.startupTimes.ready = performance.now();
      }).observe(document, { childList: true, subtree: true, attributes: true });
    });
    await page.goto(origin + '/events', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 20_000 });
    const report = await page.evaluate(() => ({
      times: window.startupTimes,
      images: performance.getEntriesByType('resource').filter(resource => /\/(sequence-|frame-).*\.webp/.test(resource.name))
        .map(resource => ({ url: resource.name, start: resource.startTime, end: resource.responseEnd, initiator: resource.initiatorType })),
    }));
    // The old implementation spent the entire intro waiting for 17 image downloads.
    expect(report.times.ready).toBeLessThan(report.times.exiting - 500);
    expect(report.times.done - report.times.loading).toBeLessThan(2800);
    expect(report.images).toHaveLength(1);
    expect(report.images[0].initiator).toBe('link');
    expect(report.images[0].start).toBeLessThan(report.times.loading);
    await info.attach('cold-mobile-startup', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
    await expect(page.getByRole('heading', { level: 1, name: 'Events.' })).toBeVisible();
  } finally { await context.close(); }
});
