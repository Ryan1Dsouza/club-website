import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createApp } from '../../server/app.mjs';
import { openDatabase } from '../../server/db.mjs';
import { render } from '../../dist/server/entry-server.js';

let server, db, origin;
test.beforeAll(async () => {
  db = openDatabase(':memory:');
  server = createApp(db, { render, production: true, limits: false }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async () => { await new Promise(resolve => server.close(resolve)); db.close(); });

test('mobile production home forms its logo without loading other routes', async ({ browser }, info) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  const page = await context.newPage();
  const errors = [], scripts = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.resourceType() === 'script') scripts.push(request.url()); });
  await page.goto(origin);
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('.logo-landing')).toHaveAttribute('data-status', 'ready');
  await expect(page.locator('.logo-landing')).toHaveAttribute('data-text-ready', 'true', { timeout: 15_000 });
  await expect(page.locator('.logo-landing__fallback')).toBeHidden();
  await expect(page.locator('.mu-morph-wrap')).toBeVisible();
  await expect(page.locator('.home-particles, .home-particles-toggle')).toHaveCount(0);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: info.outputPath('mobile-home.png') });
  await expect(page.locator('.logo-landing__scene canvas')).toHaveCount(1);
  expect(scripts.some(url => /\/logo-scene-/.test(url))).toBe(true);
  expect(scripts.some(url => /particles(?:\.js|[-/])/.test(url))).toBe(false);
  expect(scripts.filter(url => /\/(people-tower|PeoplePage|EventsPage|WorkPage|scroll-motion)-/.test(url))).toEqual([]);
  const bytes = await page.evaluate(() => performance.getEntriesByType('resource').filter(item => /\.js(?:\?|$)/.test(item.name)).reduce((total, item) => total + item.decodedBodySize, 0));
  // Includes the logo's shared WebGL engine, while unrelated scenes stay lazy.
  expect(bytes).toBeLessThan(1_200_000);
  await page.getByRole('button', { name: 'Open menu', exact: true }).tap();
  await page.getByRole('link', { name: 'Our work', exact: true }).tap();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator('.work-feature').first()).toBeVisible();
  expect(scripts.some(url => /\/WorkPage-/.test(url))).toBe(true);
  expect(scripts.some(url => /\/people-tower-/.test(url))).toBe(false);
  await expect(page.locator('.logo-landing__scene canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
  await context.close();
});

test('split routes retain server content and their own CSS before hydration', async ({ browser, request }) => {
  const manifest = JSON.parse(await readFile('dist/client/.vite/manifest.json', 'utf8'));
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const [path, entry] of [['/events', 'EventsPage'], ['/projects', 'WorkPage'], ['/team', 'PeoplePage'], ['/recruitment', 'Recruitment']]) {
    const response = await request.get(origin + path);
    const html = await response.text();
    expect(html).toContain('id="nucleus-data"');
    expect(html).not.toContain('Opening page…');
    const chunk = manifest[`src/pages/${entry}.tsx`] ?? Object.values(manifest).find(chunk => chunk.name === entry && chunk.isDynamicEntry);
    expect(chunk).toBeDefined();
    for (const css of chunk.css ?? []) expect(html).toContain(`href="/${css}"`);
    await page.goto(origin + path);
    await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.page-loading')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
  await context.close();
});
