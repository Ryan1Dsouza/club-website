import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { createApp } from '../server/app.mjs';
import { openDatabase } from '../server/db.mjs';
import { render } from '../dist/server/entry-server.js';

const directory = resolve(process.argv[2] || 'output/responsive-performance');
await mkdir(directory, { recursive: true });
await writeFile(resolve(directory, '.gitignore'), '*\n');
const db = openDatabase(':memory:');
const client = resolve(directory, 'client');
await cp(resolve('dist/client'), client, { recursive: true });
const server = createApp(db, { render, dist: client, production: true, origin: 'https://nucleussjec.in', limits: false }).listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const paths = ['/', '/about', '/events', '/projects', '/achievements', '/news', '/team', '/recruitment', '/live-news', '/not-a-page'];
const layouts = [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 768, height: 1024 }, { width: 320, height: 740 }];
const report = { date: new Date().toISOString(), conditions: 'Local production SSR, fresh browser context per layout; real public images/content; software-rendered Chromium. Timing is a lab observation, not physical-device FPS.', pages: [] };
try {
  const requestedWidth = Number(process.argv.find(value => value.startsWith('--width='))?.split('=')[1]);
  for (const viewport of layouts.filter(viewport => !requestedWidth || viewport.width === requestedWidth)) {
    const mobile = viewport.width < 1024;
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    for (const path of paths) {
      const page = await context.newPage(), errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        window.__audit = { longTasks: [], shifts: 0 };
        new PerformanceObserver(list => window.__audit.longTasks.push(...list.getEntries().map(entry => entry.duration))).observe({ type: 'longtask', buffered: true });
        new PerformanceObserver(list => list.getEntries().forEach(entry => { if (!entry.hadRecentInput) window.__audit.shifts += entry.value; })).observe({ type: 'layout-shift', buffered: true });
      });
      try {
        const started = Date.now();
        const response = await page.goto(origin + path, { waitUntil: 'domcontentloaded' });
        if (response.status() === 404) {
          report.pages.push({ path, viewport, status: 404, overflow: await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth)), errors });
          continue;
        }
        await page.locator('.site-shell[data-loading-stage="done"]').waitFor({ timeout: 20000 });
        const readyMs = Date.now() - started;
        const initial = await page.evaluate(() => ({
          overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
          visibleImages: [...document.querySelectorAll('main img')].filter(image => { const rect = image.getBoundingClientRect(); return rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight; }).map(image => ({ src: image.currentSrc || image.src, loaded: image.complete && image.naturalWidth > 0 })),
          lenis: document.documentElement.classList.contains('lenis'),
        }));
        await page.mouse.move(viewport.width / 2, viewport.height / 2);
        await page.mouse.wheel(0, 650);
        await page.waitForTimeout(750);
        const sample = await page.evaluate(() => ({
          scrollY, overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
          longTasks: window.__audit.longTasks.length,
          blockingMs: window.__audit.longTasks.reduce((sum, ms) => sum + Math.max(0, ms - 50), 0),
          cls: window.__audit.shifts,
          bytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + entry.transferSize, 0),
          pendingImages: [...document.querySelectorAll('main img')].filter(image => !image.complete && image.getBoundingClientRect().top < innerHeight && image.getBoundingClientRect().bottom > 0).length,
        }));
        const item = { path, viewport, readyMs, ...initial, afterScroll: sample, errors };
        report.pages.push(item);
        console.log(JSON.stringify({ path, width: viewport.width, readyMs, overflow: Math.max(initial.overflow, sample.overflow), blockingMs: Math.round(sample.blockingMs), pending: initial.visibleImages.filter(image => !image.loaded).length, errors: errors.length }));
        if (process.argv.includes('--screenshots')) await page.screenshot({ path: resolve(directory, `${viewport.width}-${path.slice(1) || 'home'}.png`) });
      } catch (error) { report.pages.push({ path, viewport, error: error.message, errors }); console.log(`FAIL ${viewport.width} ${path}: ${error.message}`); }
      await page.close();
      await writeFile(resolve(directory, 'summary.json'), JSON.stringify(report, null, 2));
    }
    await context.close();
  }
} finally {
  await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); db.close();
}
console.log(`Audited ${report.pages.length} route/layout combinations. ${directory}`);
